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

const { GObject, GLib, Gtk, Gdk, Pango, WebKit2 } = imports.gi

const { markupEscape } = imports.utils

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

const EpubViewAnnotation = GObject.registerClass({
    GTypeName: 'FoliateEpubViewAnnotation',
    Properties: {
        cfi: GObject.ParamSpec.string('cfi', 'cfi', 'cfi',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY, null),
        section: GObject.ParamSpec.string('section', 'section', 'section',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY, null),
        text: GObject.ParamSpec.string('text', 'text', 'text',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY, null),
        color: GObject.ParamSpec.string('color', 'color', 'color',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, null),
        note: GObject.ParamSpec.string('note', 'note', 'note',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, null),
    }
}, class EpubViewAnnotation extends GObject.Object {})

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
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, 0, 100, 2.5),
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
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, 'auto')
    }
}, class EpubViewSettings extends GObject.Object {})

var EpubView = GObject.registerClass({
    GTypeName: 'FoliateEpubView',
    Signals: {
        'book-ready': { flags: GObject.SignalFlags.RUN_FIRST },
        'book-loading': { flags: GObject.SignalFlags.RUN_FIRST },
        'book-error': { flags: GObject.SignalFlags.RUN_FIRST },
        'metadata': { flags: GObject.SignalFlags.RUN_FIRST },
        'locations-ready': { flags: GObject.SignalFlags.RUN_FIRST },
        'relocated': { flags: GObject.SignalFlags.RUN_FIRST },
        'find-results': { flags: GObject.SignalFlags.RUN_FIRST },
        'selection': { flags: GObject.SignalFlags.RUN_FIRST },
        'highlight-menu': { flags: GObject.SignalFlags.RUN_FIRST }
    }
}, class EpubView extends GObject.Object {
    _init({ file, inputType, settings, annotations }) {
        super._init()

        this.file = file
        this.inputType = inputType
        this.settings = settings
        this.annotations = annotations

        this.metadata = null
        this.location = null
        this.selection = null

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
                allow_universal_access_from_file_urls: true
            })
        })
        this._load()
        this._webView.connect('context-menu', () =>
            this._contextMenu ? this._contextMenu() : true)

        const contentManager = this._webView.get_user_content_manager()
        contentManager.connect('script-message-received::action', (_, jsResult) => {
            const data = jsResult.get_js_value().to_string()
            const { type, payload } = JSON.parse(data)
            this._handleAction(type, payload)
        })
        contentManager.register_script_message_handler('action')

        this._webView.zoom_level = this.settings.zoom_level
        this.settings.connect('notify::zoom-level', () => {
            this._webView.zoom_level = this.settings.zoom_level
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
        this.settings.connect('notify::brightness', () => this._applyStyle())

        this.settings.connect('notify::enable-footnote', () =>
            this._enableFootnote = this.settings.enable_footnote)
        this.settings.connect('notify::enable-devtools', () =>
            this._enableDevtools = this.settings.enable_devtools)
        this.settings.connect('notify::allow-unsafe', () => {
            this.emit('book-loading')
            this._load()
        })
        this.settings.connect('notify::layout', () => {
            this.emit('book-loading')
            this._webView.reload()
        })

        // add a map so we can more conveniently get annotation by cfi
        this._annotationsMap = new Map()
        this.annotations.connect('items-changed', (store, pos, removed, added) => {
            if (added) {
                const annotation = store.get_item(pos)
                this.annotation = annotation
                this._annotationsMap.set(annotation.cfi, annotation)
                this._addAnnotation(annotation.cfi, annotation.color)
                annotation.connect('notify::color', () => {
                    this._addAnnotation(annotation.cfi, annotation.color)
                })
            } else if (removed) {
                // we don't know what's been removed so have to check manually
                const cfis = new Set()
                const n = store.get_n_items()
                for (let i = 0; i < n; i++) {
                    cfis.add(store.get_item(i).cfi)
                }
                Array.from(this._annotationsMap.keys())
                    .filter(cfi => !cfis.has(cfi))
                    .forEach(cfi => {
                        this._annotationsMap.delete(cfi)
                        this._removeAnnotation(cfi)
                    })
            }
        })
    }
    _load() {
        const viewer = this.settings.allow_unsafe ? unsafeViewerPath : viewerPath
        this._webView.load_uri(GLib.filename_to_uri(viewer, null))
    }
    _eval(script, discardReturn) {
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
        switch (type) {
            case 'ready':
                this._run(`open("${encodeURI(this.file)}",
                    '${this.inputType}',
                    ${this.cfi ? `"${this.cfi}"` : 'null'},
                    ${layouts[this.settings.layout].renderTo},
                    ${JSON.stringify(layouts[this.settings.layout].options)},
                    ${this.locations || 'null'})`)

                this._enableFootnote = this.settings.enable_footnote
                this._enableDevtools = this.settings.enable_devtools
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
                this.emit('book-ready')
                break
            case 'locations-generated':
                this.locations = payload
                // falls through
            case 'locations-ready':
                this.emit('locations-ready')
                break
            case 'relocated':
                this.cfi = payload.cfi
                this.location = payload
                this.emit('relocated')
                break
            case 'link-internal':
                this.goTo(payload)
                break
            case 'link-external':
                Gtk.show_uri_on_window(null, payload, Gdk.CURRENT_TIME)
                break
            case 'footnote':
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
                this.annotation = this._annotationsMap.get(this.selection.cfi)
                this.emit('highlight-menu')
                break
            }
        }
    }
    _applyStyle() {
        const fontDesc = Pango.FontDescription.from_string(this.settings.font)
        const fontFamily = fontDesc.get_family()
        const fontSizePt = fontDesc.get_size() / Pango.SCALE
        const fontSize = fontSizePt / 0.75
        const fontWeight = fontDesc.get_weight()
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
            brightness: this.settings.brightness,
            fgColor: this.settings.fg_color,
            bgColor: this.settings.bg_color,
            linkColor: this.settings.link_color
        }
        this._run(`setStyle(${JSON.stringify(style)})`)
    }
    set _enableFootnote(state) {
        this._run(`enableFootnote = ${state}`)
    }
    set _enableDevtools(state) {
        this._webView.get_settings().enable_developer_extras = state
        this._contextMenu = () => !state
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
        this._callback('can-go-back', Boolean(this._history.length))
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
        this._run(`selectByCfi('${cfi}')`)
    }
    _addAnnotation(cfi, color) {
        this._run(`addAnnotation('${cfi}', '${color}')`)
    }
    _removeAnnotation(cfi) {
        this._run(`rendition.annotations.remove("${cfi}", 'highlight')`)
    }
    find(q, inBook = true, highlight = true) {
        this._run(`find.find(decodeURI("${encodeURI(q)}"), ${inBook}, ${highlight})`)
    }
    clearFind() {
        this._run('find.clearHighlight()')
    }
    getSectionFromCfi(cfi) {
        return this._get(`getSectionFromCfi('${cfi}')`)
    }
    get widget() {
        return this._webView
    }
})
