/*
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

const { GObject, GLib, Gio, Gtk, Gdk, Pango, GdkPixbuf, WebKit2 } = imports.gi

const { debug, error, markupEscape, Storage, disconnectAllHandlers, base64ToPixbuf } = imports.utils

// must be the same as `CHARACTERS_PER_PAGE` in assets/epub-viewer.js
const CHARACTERS_PER_PAGE = 1024

// the `__ibooks_internal_theme` attribute is set on `:root` in Apple Books
// can be used by books to detect dark theme without JavaScript
const getIbooksInternalTheme = bgColor => {
    const rgba = new Gdk.RGBA()
    rgba.parse(bgColor)
    const { red, green, blue } = rgba
    const l = 0.299 * red + 0.587 * green + 0.114 * blue
    if (l < 0.3) return 'Night'
    else if (l < 0.7) return 'Gray'
    else if (red > green > blue) return 'Sepia'
    else return 'White'
}

const layouts = {
    'auto': {
        renderTo: `'viewer'`,
        options: { width: '100%', flow: 'paginated' },
    },
    'single': {
        renderTo: `'viewer'`,
        options: { width: '100%', flow: 'paginated', spread: 'none' }
    },
    'scrolled': {
        renderTo: 'document.body',
        options: { width: '100%', flow: 'scrolled-doc' },
    },
    'continuous': {
        renderTo: 'document.body',
        options: { width: '100%', flow: 'scrolled', manager: 'continuous' },
    }
}

const viewerPath = pkg.pkgdatadir + '/assets/epub-viewer.html'
const unsafeViewerPath = pkg.pkgdatadir + '/assets/epub-viewer-nocsp.html'

var EpubViewAnnotation = GObject.registerClass({
    GTypeName: 'FoliateEpubViewAnnotation',
    Properties: {
        cfi: GObject.ParamSpec.string('cfi', 'cfi', 'cfi',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY, null),
        text: GObject.ParamSpec.string('text', 'text', 'text',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY, null),
        color: GObject.ParamSpec.string('color', 'color', 'color',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, null),
        note: GObject.ParamSpec.string('note', 'note', 'note',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, null),
    }
}, class EpubViewAnnotation extends GObject.Object {})

const EpubViewBookmark = GObject.registerClass({
    GTypeName: 'FoliateEpubViewBookmark',
    Properties: {
        cfi: GObject.ParamSpec.string('cfi', 'cfi', 'cfi',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY, null),
    }
}, class EpubViewBookmark extends GObject.Object {})

const dataMap = new Map()
const getData = identifier => {
    if (dataMap.has(identifier)) return dataMap.get(identifier)
    else {
        const data = new EpubViewData(identifier)
        dataMap.set(identifier, data)
        return data
    }
}

const EpubViewData = GObject.registerClass({
    GTypeName: 'FoliateEpubViewData',
    Signals: {
        'annotation-added': {
            flags: GObject.SignalFlags.RUN_FIRST,
            param_types: [EpubViewAnnotation.$gtype]
        },
        'annotation-removed': {
            flags: GObject.SignalFlags.RUN_FIRST,
            param_types: [GObject.TYPE_STRING]
        },
        'externally-modified': { flags: GObject.SignalFlags.RUN_FIRST }
    }
}, class EpubViewData extends GObject.Object {
    _init(identifier) {
        super._init()

        this._identifier = identifier
        this._viewSet = new Set()

        this._storage = new Storage('data', identifier)
        this._cache = new Storage('cache', identifier)

        this._annotationsMap = new Map()
        this._annotationsList = new Gio.ListStore()

        this._bookmarksSet = new Set()
        this._bookmarksList = new Gio.ListStore()

        this._loadData()
        this._storage.connect('externally-modified', () => {
            this._loadData()
            this.emit('externally-modified')
        })
    }
    _loadData() {
        this._annotationsMap.clear()
        this._annotationsList.remove_all()
        this._bookmarksSet.clear()
        this._bookmarksList.remove_all()
        this._storage.get('annotations', [])
            .forEach(({ value, color, text, note }) =>
                this.addAnnotation(new EpubViewAnnotation({
                    cfi: value,
                    color: color || 'yellow',
                    text: text || '',
                    note: note || ''
                }), true))

        this._storage.get('bookmarks', [])
            .forEach(cfi => this.addBookmark(cfi, true))
    }
    get annotations() {
        return this._annotationsMap.values()
    }
    getAnnotation(cfi) {
        return this._annotationsMap.get(cfi)
    }
    get annotationsList() {
        return this._annotationsList
    }
    get bookmarksList() {
        return this._bookmarksList
    }
    hasBookmark(cfi) {
        return this._bookmarksSet.has(cfi)
    }
    get lastLocation() {
        return this._storage.get('lastLocation')
    }
    set lastLocation(location) {
        this._storage.set('lastLocation', location)
    }
    get locations() {
        const locationsChars = this._cache.get('locationsChars')
        if (locationsChars === CHARACTERS_PER_PAGE)
            return this._cache.get('locations')
        else return null
    }
    set locations(locations) {
        this._cache.set('locationsChars', CHARACTERS_PER_PAGE)
        this._cache.set('locations', locations)
    }
    _onAnnotationsChanged() {
        const annotations = Array.from(this._annotationsMap.values())
            .map(({ cfi, color, text, note }) => ({
                value: cfi, color, text, note
            }))
        this._storage.set('annotations', annotations)
    }
    addAnnotation(annotation, init) {
        const cfi = annotation.cfi
        if (this._annotationsMap.has(cfi)) {
            this.emit('annotation-added', this._annotationsMap.get(cfi))
        } else {
            this._annotationsMap.set(cfi, annotation)
            this._annotationsList.append(annotation)
            annotation.connect('notify::color', () => {
                this.emit('annotation-added', annotation)
                this._onAnnotationsChanged()
            })
            annotation.connect('notify::note', () => {
                this._onAnnotationsChanged()
            })
            this.emit('annotation-added', annotation)
            if (!init) this._onAnnotationsChanged()
        }
    }
    removeAnnotation(annotation) {
        const cfi = annotation.cfi
        this.emit('annotation-removed', cfi)
        this._annotationsMap.delete(cfi)
        const store = this._annotationsList
        const n = store.get_n_items()
        for (let i = 0; i < n; i++) {
            if (store.get_item(i).cfi === cfi) {
                store.remove(i)
                break
            }
        }
        this._onAnnotationsChanged()
    }
    _onBookmarksChanged() {
        const bookmarks = Array.from(this._bookmarksSet)
        this._storage.set('bookmarks', bookmarks)
    }
    addBookmark(cfi, init) {
        this._bookmarksSet.add(cfi)
        this._bookmarksList.append(new EpubViewBookmark({ cfi }))
        if (!init) this._onBookmarksChanged()
    }
    removeBookmark(cfi) {
        this._bookmarksSet.delete(cfi)
        const store = this._bookmarksList
        const n = store.get_n_items()
        for (let i = 0; i < n; i++) {
            if (store.get_item(i).cfi === cfi) {
                store.remove(i)
                break
            }
        }
        this._onBookmarksChanged()
    }
    disconnectAll() {
        for (const annotation of this.annotations) {
            // disconnect everyone
            disconnectAllHandlers(annotation, 'notify::color')
            disconnectAllHandlers(annotation, 'notify::note')

            // reconnect ourselves
            annotation.connect('notify::color', () => {
                this.emit('annotation-added', annotation)
                this._onAnnotationsChanged()
            })
            annotation.connect('notify::note', () => {
                this._onAnnotationsChanged()
            })
        }
    }
    addView(view) {
        this._viewSet.add(view)
    }
    deleteView(view) {
        this._viewSet.delete(view)
        if (this._viewSet.size === 0) dataMap.delete(this._identifier)
    }
    get data() {
        return this._storage.data
    }
})

var EpubViewSettings = GObject.registerClass({
    GTypeName: 'FoliateEpubViewSettings',
    Properties: {
        'zoom-level':
            GObject.ParamSpec.double('zoom-level', 'zoom-level', 'zoom-level',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, 0.1, 10, 1),
        font:
            GObject.ParamSpec.string('font', 'font', 'font',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, 'Serif 12'),
        spacing:
            GObject.ParamSpec.double('spacing', 'spacing', 'spacing',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, 0.1, 10, 1.5),
        margin:
            GObject.ParamSpec.double('margin', 'margin', 'margin',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, 0, 100, 3.5),
        'use-publisher-font':
            GObject.ParamSpec.boolean('use-publisher-font', 'use-publisher-font', 'use-publisher-font',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, false),
        justify:
            GObject.ParamSpec.boolean('justify', 'justify', 'justify',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, true),
        hyphenate:
            GObject.ParamSpec.boolean('hyphenate', 'hyphenate', 'hyphenate',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, true),
        'fg-color':
            GObject.ParamSpec.string('fg-color', 'fg-color', 'fg-color',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, 'black'),
        'bg-color':
            GObject.ParamSpec.string('bg-color', 'bg-color', 'bg-color',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, 'white'),
        'link-color':
            GObject.ParamSpec.string('link-color', 'link-color', 'link-color',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, 'blue'),
        invert:
            GObject.ParamSpec.boolean('invert', 'invert', 'invert',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, false),
        brightness:
            GObject.ParamSpec.double('brightness', 'brightness', 'brightness',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, 0, 2, 1),
        'enable-footnote':
            GObject.ParamSpec.boolean('enable-footnote', 'enable-footnote', 'enable-footnote',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, false),
        'allow-unsafe':
            GObject.ParamSpec.boolean('allow-unsafe', 'allow-unsafe', 'allow-unsafe',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, false),
        'enable-devtools':
            GObject.ParamSpec.boolean('enable-devtools', 'enable-devtools', 'enable-devtools',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, false),
        layout:
            GObject.ParamSpec.string('layout', 'layout', 'layout',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, 'auto'),
        skeuomorphism:
            GObject.ParamSpec.boolean('skeuomorphism', 'skeuomorphism', 'skeuomorphism',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, false),
        'autohide-cursor':
            GObject.ParamSpec.boolean('autohide-cursor', 'autohide-cursor', 'autohide-cursor',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, false)
    }
}, class EpubViewSettings extends GObject.Object {})

var EpubView = GObject.registerClass({
    GTypeName: 'FoliateEpubView',
    Signals: {
        'data-ready': {
            flags: GObject.SignalFlags.RUN_FIRST,
            param_types: [Gio.ListStore.$gtype, Gio.ListStore.$gtype]
        },
        'rendition-ready': { flags: GObject.SignalFlags.RUN_FIRST },
        'book-displayed': { flags: GObject.SignalFlags.RUN_FIRST },
        'book-loading': { flags: GObject.SignalFlags.RUN_FIRST },
        'book-error': { flags: GObject.SignalFlags.RUN_FIRST },
        'metadata': { flags: GObject.SignalFlags.RUN_FIRST },
        'cover': { flags: GObject.SignalFlags.RUN_FIRST },
        'locations-generated': { flags: GObject.SignalFlags.RUN_FIRST },
        'locations-ready': { flags: GObject.SignalFlags.RUN_FIRST },
        'relocated': { flags: GObject.SignalFlags.RUN_FIRST },
        'spread': {
            flags: GObject.SignalFlags.RUN_FIRST,
            param_types: [GObject.TYPE_BOOLEAN]
        },
        'find-results': { flags: GObject.SignalFlags.RUN_FIRST },
        'selection': { flags: GObject.SignalFlags.RUN_FIRST },
        'highlight-menu': { flags: GObject.SignalFlags.RUN_FIRST },
        'footnote': { flags: GObject.SignalFlags.RUN_FIRST },
        'img': {
            flags: GObject.SignalFlags.RUN_FIRST,
            param_types: [GdkPixbuf.Pixbuf.$gtype, GObject.TYPE_STRING]
        },
        'click': { flags: GObject.SignalFlags.RUN_FIRST },
        'speech': {
            flags: GObject.SignalFlags.RUN_FIRST,
            param_types: [GObject.TYPE_STRING, GObject.TYPE_BOOLEAN]
        },
    }
}, class EpubView extends GObject.Object {
    _init(settings) {
        super._init()

        this.settings = settings

        this.metadata = null
        this.cover = null
        this.location = null
        this.selection = null
        this.footnote = null

        this.toc = new Gtk.TreeStore()
        this.toc.set_column_types([GObject.TYPE_STRING, GObject.TYPE_STRING])

        this.findResults = new Gtk.ListStore()
        this.findResults.set_column_types(
            [GObject.TYPE_STRING, GObject.TYPE_STRING, GObject.TYPE_STRING])

        this._history = []

        this._contextMenu = null
        this._webView = new WebKit2.WebView({
            visible: true,
            settings: new WebKit2.Settings({
                enable_write_console_messages_to_stdout: true,
                allow_file_access_from_file_urls: true
            })
        })
        this._webView.connect('context-menu', () =>
            this._contextMenu ? this._contextMenu() : true)

        const contentManager = this._webView.get_user_content_manager()
        contentManager.connect('script-message-received::action', (_, jsResult) => {
            const data = jsResult.get_js_value().to_string()
            const { type, payload } = JSON.parse(data)
            this._handleAction(type, payload)
        })
        contentManager.register_script_message_handler('action')

        this._connectSettings()
        this._connectData()
    }
    _connectSettings() {
        this._webView.zoom_level = this.settings.zoom_level
        this.settings.connect('notify::zoom-level', () => {
            this._webView.zoom_level = this.settings.zoom_level
            this._run(`zoomLevel = ${this.settings.zoom_level}`)
        })
        this.settings.connect('notify::font', () => this._applyStyle())
        this.settings.connect('notify::spacing', () => this._applyStyle())
        this.settings.connect('notify::margin', () => this._applyStyle())
        this.settings.connect('notify::use-publisher-font', () => this._applyStyle())
        this.settings.connect('notify::justify', () => this._applyStyle())
        this.settings.connect('notify::hyphenate', () => this._applyStyle())
        this.settings.connect('notify::fg-color', () => this._applyStyle())
        this.settings.connect('notify::bg-color', () => this._applyStyle())
        this.settings.connect('notify::link-color', () => this._applyStyle())
        this.settings.connect('notify::invert', () => this._applyStyle())
        this.settings.connect('notify::brightness', () => this._applyStyle())

        this.settings.connect('notify::enable-footnote', () =>
            this._enableFootnote = this.settings.enable_footnote)
        this.settings.connect('notify::autohide-cursor', () =>
            this._autohideCursor = this.settings.autohide_cursor)
        this.settings.connect('notify::enable-devtools', () =>
            this._enableDevtools = this.settings.enable_devtools)
        this.settings.connect('notify::allow-unsafe', () => this.reload())
        this.settings.connect('notify::layout', () => this.reload())
        this.settings.connect('notify::skeuomorphism', () =>
            this._skeuomorphism = this.settings.skeuomorphism)
    }
    _connectData() {
        this.connect('metadata', () => {
            const { identifier } = this.metadata
            this._data = getData(identifier)
            this._data.addView(this)
            this.emit('data-ready', this._data.annotationsList, this._data.bookmarksList)

            const locations = this._data.locations
            this._run(`loadLocations(${locations || 'null'})`)
            this._run('render()')
        })
        this.connect('rendition-ready', () => {
            for (const annotation of this._data.annotations) {
                this._addAnnotation(annotation.cfi, annotation.color)
            }
            const h1 = this._data.connect('annotation-added', (_, annotation) => {
                this.annotation = annotation
                this._addAnnotation(annotation.cfi, annotation.color)
            })
            const h2 = this._data.connect('annotation-removed', (_, cfi) =>
                this._removeAnnotation(cfi))
            const h3 = this._data.connect('externally-modified', () => this.reload())
            this._dataHandlers = [h1, h2, h3]

            const lastLocation = this._data.lastLocation
            this._run(`display(${lastLocation ? `'${lastLocation}'` : ''})`)
        })
        this.connect('locations-generated', () => this._data.locations = this.locations)
        this.connect('relocated', () => this._data.lastLocation = this.location.cfi)
        this._webView.connect('destroy', () => {
            if (!this._data) return
            this._disconnectData()
            this._data.deleteView(this)
            disconnectAllHandlers(this.settings, 'notify')
        })
    }
    _disconnectData() {
        if (!this._data) return
        this._dataHandlers.forEach(h => this._data.disconnect(h))
        this._data.disconnectAll()
    }
    _load() {
        this.emit('book-loading')
        const viewer = this.settings.allow_unsafe ? unsafeViewerPath : viewerPath
        this._webView.load_uri(GLib.filename_to_uri(viewer, null))
    }
    reload() {
        this._disconnectData()
        this._load()
    }
    _eval(script, discardReturn) {
        debug(`run_javascript: ${script.substring(0, 200)}${script.length > 200 ? '...' : ''}`)
        return new Promise((resolve, reject) => {
            this._webView.run_javascript(script, null, (self, result) => {
                if (discardReturn) return resolve()
                const jsResult = self.run_javascript_finish(result)
                const value = jsResult.get_js_value().to_string()
                const obj = value !== 'undefined' ? JSON.parse(value) : null
                resolve(obj)
            })
        })
    }
    _run(script) {
        return this._eval(script, true)
    }
    _get(script) {
        return this._eval(`JSON.stringify(${script})`)
    }
    _handleAction(type, payload) {
        debug(type)
        switch (type) {
            case 'ready':
                this._run(`doubleClickTime =
                    ${Gtk.Settings.get_default().gtk_double_click_time}`)
                this._run(`zoomLevel = ${this.settings.zoom_level}`)

                this._enableFootnote = this.settings.enable_footnote
                this._enableDevtools = this.settings.enable_devtools
                this._skeuomorphism = this.settings.skeuomorphism
                this._autohideCursor = this.settings.autohide_cursor

                this._run(`open("${encodeURI(this.file)}", '${this.inputType}',
                    ${layouts[this.settings.layout].renderTo},
                    ${JSON.stringify(layouts[this.settings.layout].options)})`)
                break
            case 'book-error':
                this.emit('book-error')
                break
            case 'book-ready':
                this._get('book.package.metadata').then(metadata => {
                    this.metadata = metadata
                    this.emit('metadata')
                })
                this._get('book.navigation.toc').then(toc => {
                    const store = this.toc
                    store.clear()
                    const f = (toc, iter = null) => {
                        toc.forEach(chapter => {
                            const newIter = store.append(iter)
                            const label = chapter.label
                            store.set(newIter, [0, 1], [chapter.href, label])
                            if (chapter.subitems) f(chapter.subitems, newIter)
                        })
                    }
                    f(toc)
                })
                break
            case 'rendition-ready':
                this._applyStyle()
                this._run(`setupRendition()`)
                this.emit('rendition-ready')
                break
            case 'book-displayed':
                this.emit('book-displayed')
                break
            case 'locations-generated':
                this.locations = payload
                this.emit('locations-generated')
                // falls through
            case 'locations-ready':
                this.emit('locations-ready')
                break
            case 'cover':
                this.cover = base64ToPixbuf(payload)
                this.emit('cover')
                break

            case 'relocated':
                debug(payload.cfi)
                this.location = payload
                this.location.canGoBack = Boolean(this._history.length)
                if (this._findResultCfi) this.selectByCfi(this._findResultCfi)
                this.emit('relocated')
                break
            case 'spread':
                this.emit('spread', payload)
                break
            case 'link-internal':
                this.goTo(payload)
                break
            case 'link-external':
                Gtk.show_uri_on_window(null, payload, Gdk.CURRENT_TIME)
                break
            case 'footnote':
                this.footnote = payload
                this.emit('footnote')
                break
            case 'img':
                this.emit('img', base64ToPixbuf(payload.base64), payload.alt)
                break

            case 'find-results': {
                const { q, results } = payload
                const store = this.findResults
                store.clear()
                const regex = new RegExp(markupEscape(q), 'ig')
                results.forEach(({ cfi, excerpt, section }) => {
                    const newIter = store.append()
                    const text = markupEscape(excerpt.trim().replace(/\n/g, ' '))
                    const markup = text.replace(regex, `<b>${regex.exec(text)[0]}</b>`)
                    const sectionMarkup = `<span alpha="50%" size="smaller">${
                        markupEscape(section)}</span>`
                    store.set(newIter, [0, 1, 2], [cfi, markup, sectionMarkup])
                })
                this.emit('find-results')
                break
            }
            case 'selection': {
                this.selection = payload
                this.selection.text = this.selection.text.trim().replace(/\n/g, ' ')
                const position = this.selection.position

                // position needs to be adjusted for zoom level
                const zoomLevel = this._webView.zoom_level
                Object.keys(position).forEach(key =>
                    position[key] = position[key] * zoomLevel)

                this.emit('selection')
                break
            }
            case 'highlight-menu': {
                this.selection = payload
                this.annotation = this._data.getAnnotation(this.selection.cfi)
                this.emit('highlight-menu')
                break
            }
            case 'click':
                this.emit('click')
                break

            case 'speech': {
                const { text, nextPage } = payload
                this.emit('speech', text, nextPage)
                break
            }
        }
    }
    _applyStyle() {
        const fontDesc = Pango.FontDescription.from_string(this.settings.font)
        const fontFamily = fontDesc.get_family()
        const fontSizePt = fontDesc.get_size() / Pango.SCALE
        const fontSize = fontSizePt / 0.75
        let fontWeight = 400
        try {
            fontWeight = fontDesc.get_weight()
        } catch (e) {
            error(e.toString())
        }
        const fontStyle = ['normal', 'italic', 'oblique'][fontDesc.get_style()]

        // unfortunately, it appears that WebKitGTK doesn't support font-stretch
        const fontStretch = [
            'ultra-condensed', 'extra-condensed', 'condensed', 'semi-condensed', 'normal',
            'semi-expanded', 'expanded', 'extra-expanded', 'ultra-expanded'
        ][fontDesc.get_stretch()]

        const webViewSettings = this._webView.get_settings()
        webViewSettings.serif_font_family = fontFamily
        webViewSettings.sans_serif_font_family = fontFamily
        webViewSettings.default_font_family = fontFamily
        webViewSettings.default_font_size = fontSize

        const style = {
            fontFamily, fontSize, fontWeight, fontStyle, fontStretch,
            spacing: this.settings.spacing,
            margin: this.settings.margin,
            usePublisherFont: this.settings.use_publisher_font,
            justify: this.settings.justify,
            hyphenate: this.settings.hyphenate,
            fgColor: this.settings.fg_color,
            bgColor: this.settings.bg_color,
            linkColor: this.settings.link_color,
            invert: this.settings.invert,
            brightness: this.settings.brightness,
            ibooksInternalTheme: getIbooksInternalTheme(this.settings.bg_color)
        }
        return this._run(`setStyle(${JSON.stringify(style)})`)
    }
    set _skeuomorphism(state) {
        this._run(`skeuomorphism = ${state}`)
    }
    set _enableFootnote(state) {
        this._run(`enableFootnote = ${state}`)
    }
    set _autohideCursor(state) {
        this._run(`autohideCursor = ${state}`)
    }
    set _enableDevtools(state) {
        this._webView.get_settings().enable_developer_extras = state
        this._contextMenu = () => !state
    }
    open(file, inputType) {
        this.findResults.clear()
        this._history = []
        this.file = file
        this.inputType = inputType
        this._load()
    }
    prev() {
        this._run(`rendition.prev()`)
    }
    next() {
        this._run(`rendition.next()`)
    }
    async goTo(x, withHistory = true) {
        const current = await this._get(`rendition.currentLocation().start.cfi`)
        if (x === current) return
        if (withHistory) this._history.push(current)
        this._run(`rendition.display("${x}")`)
    }
    async goToLocation(x) {
        this.goTo(await this._get(`book.locations.cfiFromLocation(${x})`))
    }
    async goToPercentage(x) {
        this.goTo(await this._get(`book.locations.cfiFromPercentage(${x})`))
    }
    goBack() {
        if (!this._history.length) return
        this.goTo(this._history.pop(), false)
    }
    clearSelection() {
        this._run('clearSelection()')
    }
    selectByCfi(cfi) {
        this.clearSelection()
        this._run(`selectByCfi('${cfi}')`)
    }
    _addAnnotation(cfi, color) {
        this._run(`addAnnotation('${cfi}', '${color}')`)
    }
    _removeAnnotation(cfi) {
        this._run(`rendition.annotations.remove("${cfi}", 'highlight')`)
    }
    addAnnotation(annotation) {
        this._data.addAnnotation(new EpubViewAnnotation(annotation))
    }
    removeAnnotation(cfi) {
        this._data.removeAnnotation(cfi)
    }
    addBookmark(cfi = this.location.cfi) {
        this._data.addBookmark(cfi)
    }
    removeBookmark(cfi = this.location.cfi) {
        this._data.removeBookmark(cfi)
    }
    hasBookmark(cfi = this.location.cfi) {
        return this._data.hasBookmark(cfi)
    }
    get data() {
        return this._data.data
    }
    find(q, inBook = true, highlight = true) {
        this._run(`find.find(decodeURI("${encodeURI(q)}"), ${inBook}, ${highlight})`)
    }
    goToFindResult(cfi) {
        this._findResultCfi = cfi
        this.goTo(cfi)
    }
    clearFind() {
        this._findResultCfi = null
        this._run('find.clearHighlight()')
    }
    getSectionFromCfi(cfi) {
        return this._get(`getSectionFromCfi('${cfi}')`)
    }
    get sectionMarks() {
        return this._get('sectionMarks')
    }
    speak(from) {
        this._run(`speak(${from ? `'${from}'` : ''})`)
    }
    speakNext() {
        this._run(`rendition.next().then(() => speak())`)
    }
    get widget() {
        return this._webView
    }
})
