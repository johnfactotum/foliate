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
const { invertRotate, scalePixbuf, downloadWithWebKit, getFileInfoAsync }
    = imports.utils
const { uriStore, library } = imports.uriStore
const { EpubCFI } = imports.epubcfi

const {
    debug, error, markupEscape, regexEscape,
    Storage, disconnectAllHandlers, base64ToPixbuf,
    mimetypes, mimetypeIs, execCommand, recursivelyDeleteDir,
    debounce
} = imports.utils

const python = GLib.find_program_in_path('python') || GLib.find_program_in_path('python3')
const kindleUnpack = pkg.pkgdatadir + '/assets/KindleUnpack/kindleunpack.py'

const settings = new Gio.Settings({ schema_id: pkg.name + '.view' })
const generalSettings = new Gio.Settings({ schema_id: pkg.name })

// must be the same as `CHARACTERS_PER_PAGE` in web/epub-viewer.js
// in 1.x this was 1600, so this was needed to automatically clear the cache
const CHARACTERS_PER_PAGE = 1024

// this should be bumped whenever FB2 rendering (see web/webpub.js) is changed
// that way we can clear the cache
const FB2_CONVERTER_VERSION = '2.4.0'

// threshold for touchscreen swipe velocity, velocity higher than this is considered as a swipe
// that will turn pages
const SWIPE_SENSIVITY = 800

// the `__ibooks_internal_theme` attribute is set on `:root` in Apple Books
// can be used by books to detect dark theme without JavaScript
const getIbooksInternalTheme = bgColor => {
    const rgba = new Gdk.RGBA()
    rgba.parse(bgColor)
    const { red, green, blue } = rgba
    const l = 0.299 * red + 0.587 * green + 0.114 * blue
    if (l < 0.3) return 'Night'
    else if (l < 0.7) return 'Gray'
    else if (red > green && green > blue) return 'Sepia'
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
const cbViewerPath = pkg.pkgdatadir + '/assets/epub-viewer-cb.html'
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
const getData = (identifier, type) => {
    if (dataMap.has(identifier)) return dataMap.get(identifier)
    else {
        const data = new EpubViewData(identifier, type)
        dataMap.set(identifier, data)
        return data
    }
}

var EpubViewData = GObject.registerClass({
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
        'externally-modified': { flags: GObject.SignalFlags.RUN_FIRST },
        'cache-modified': { flags: GObject.SignalFlags.RUN_FIRST }
    }
}, class EpubViewData extends GObject.Object {
    _init(identifier, type) {
        super._init()

        this._identifier = identifier
        this._type = type
        this._viewSet = new Set()

        this._storage = new Storage(EpubViewData.dataPath(identifier))
        this._cache = new Storage(EpubViewData.cachePath(identifier))
        this._coverPath = EpubViewData.coverPath(identifier)

        this._annotationsMap = new Map()
        this._annotationsList = new Gio.ListStore()

        this._bookmarksSet = new Set()
        this._bookmarksList = new Gio.ListStore()

        this._loadData()
        this._storage.connect('modified', () => {
            library.update(identifier, {
                identifier,
                metadata: this._storage.get('metadata', {}),
                hasAnnotations: this._annotationsMap.size > 0,
                progress: this._storage.get('progress', []),
                modified: new Date()
            })
        })
        this._storage.connect('externally-modified', () => {
            this._loadData()
            this.emit('externally-modified')
        })
        this._cache.connect('externally-modified', () => {
            this.emit('cache-modified')
        })
    }
    _loadData() {
        this._annotationsMap.clear()
        this._annotationsList.remove_all()
        this._bookmarksSet.clear()
        this._bookmarksList.remove_all()
        this._storage.get('annotations', [])
            .sort((a, b) => EpubCFI.compare(a.value, b.value))
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
    set progress([current, total]) {
        this._storage.set('progress', [current, total])
    }
    set metadata(metadata) {
        this._storage.set('metadata', metadata)
    }
    get locations() {
        if (mimetypeIs.fb2(this._type)) {
            const converterVersion = this._cache.get('converterVersion')
            if (converterVersion === FB2_CONVERTER_VERSION)
                return this._cache.get('locations')
            else return null
        }

        const locationsChars = this._cache.get('locationsChars')
        if (locationsChars === CHARACTERS_PER_PAGE)
            return this._cache.get('locations')
        else return null
    }
    set locations(locations) {
        if (mimetypeIs.fb2(this._type)) {
            this._cache.set('converterVersion', FB2_CONVERTER_VERSION)
        }
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

            if (init) this._annotationsList.append(annotation)
            else {
                // can't use `g_list_store_insert_sorted ()` because no arguments
                // are passed to `compare_func`; maybe a GJS bug?
                const store = this._annotationsList
                const n = store.get_n_items()
                let position = 0
                for (let i = 0; i < n; i++) {
                    const itemCfi = store.get_item(i).cfi
                    const result = EpubCFI.compare(cfi, itemCfi)
                    if (result <= 0) break
                    position = i + 1
                }
                this._annotationsList.insert(position, annotation)
            }

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
    clearCache() {
        this._cache.clear()
        try {
            Gio.File.new_for_path(this._coverPath).delete(null)
        } catch (e) {}
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
    saveCover(cover) {
        if (!generalSettings.get_boolean('cache-covers')) return
        // TODO: maybe don't save cover if one already exists
        debug(`saving cover to ${this._coverPath}`)
        const width = generalSettings.get_int('cache-covers-size')
        const pixbuf = scalePixbuf(cover, 1, width, false)
        pixbuf.savev(this._coverPath, 'png', [], [])
    }
    static dataPath(identifier) {
        return Storage.getPath('data', identifier)
    }
    static cachePath(identifier) {
        return Storage.getPath('cache', identifier)
    }
    static coverPath(identifier) {
        return Storage.getPath('cache', identifier, '.png')
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
        'max-width':
            GObject.ParamSpec.int('max-width', 'max-width', 'max-width',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, 0, 2147483647, 1400),
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

const defaultSettings = new EpubViewSettings()
;[
    'zoom-level',
    'font',
    'spacing',
    'margin',
    'max-width',
    'use-publisher-font',
    'justify',
    'hyphenate',
    'fg-color',
    'bg-color',
    'link-color',
    'invert',
    'brightness',
    'enable-footnote',
    'enable-devtools',
    'allow-unsafe',
    'layout',
    'skeuomorphism',
    'autohide-cursor'
].forEach(p => settings.bind(p, defaultSettings, p, Gio.SettingsBindFlags.DEFAULT))

var EpubView = GObject.registerClass({
    GTypeName: 'FoliateEpubView',
    Properties: {
        'img-event-type':
            GObject.ParamSpec.string('img-event-type', 'img-event-type', 'img-event-type',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, 'click'),
        ephemeral:
            GObject.ParamSpec.boolean('ephemeral', 'ephemeral', 'ephemeral',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, false),
    },
    Signals: {
        'data-ready': {
            flags: GObject.SignalFlags.RUN_FIRST,
            param_types: [Gio.ListStore.$gtype, Gio.ListStore.$gtype]
        },
        'rendition-ready': { flags: GObject.SignalFlags.RUN_FIRST },
        'book-displayed': { flags: GObject.SignalFlags.RUN_FIRST },
        'book-loading': { flags: GObject.SignalFlags.RUN_FIRST },
        'book-downloading': {
            flags: GObject.SignalFlags.RUN_FIRST,
            param_types: [GObject.TYPE_DOUBLE]
        },
        'book-error': {
            flags: GObject.SignalFlags.RUN_FIRST,
            param_types: [GObject.TYPE_STRING]
        },
        'metadata': { flags: GObject.SignalFlags.RUN_FIRST },
        'cover': { flags: GObject.SignalFlags.RUN_FIRST },
        'locations-generated': { flags: GObject.SignalFlags.RUN_FIRST },
        'locations-ready': { flags: GObject.SignalFlags.RUN_FIRST },
        'locations-fallback': { flags: GObject.SignalFlags.RUN_FIRST },
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
        'click': {
            flags: GObject.SignalFlags.RUN_FIRST,
            param_types: [GObject.TYPE_INT, GObject.TYPE_INT]
        },
        'speech': {
            flags: GObject.SignalFlags.RUN_FIRST,
            param_types: [GObject.TYPE_STRING, GObject.TYPE_BOOLEAN, GObject.TYPE_BOOLEAN]
        },
        'should-reload': { flags: GObject.SignalFlags.RUN_FIRST },
    }
}, class EpubView extends GObject.Object {
    _init(params) {
        super._init(params)

        this.settings = defaultSettings

        this.actionGroup = new Gio.SimpleActionGroup()
        ;[
            'use-publisher-font',
            'justify',
            'hyphenate',
            'enable-footnote',
            'enable-devtools',
            'allow-unsafe',
            'layout',
            'skeuomorphism',
            'autohide-cursor'
        ].forEach(k => this.actionGroup.add_action(settings.create_action(k)))

        const actions = {
            'go-prev': () => this.prev(),
            'go-next': () => this.next(),
            'go-next-section': () => this.nextSection(),
            'go-prev-section': () => this.prevSection(),
            'go-first': () => this.goToPercentage(0),
            'go-last': () => this.goToPercentage(1),
            'go-back': () => this.back(),
            'zoom-in': () => this.settings.set_property('zoom_level',
                this.settings.zoom_level + 0.1),
            'zoom-out': () => this.settings.set_property('zoom_level',
                this.settings.zoom_level - 0.1),
            'zoom-restore': () => this.settings.set_property('zoom_level', 1),
            'bookmark': () => this.hasBookmark()
                ? this.removeBookmark()
                : this.addBookmark(),
            'clear-cache': () => {
                if (this._data) this._data.clearCache()
            }
        }
        Object.keys(actions).forEach(name => {
            const action = new Gio.SimpleAction({ name, enabled: false })
            action.connect('activate', actions[name])
            this.actionGroup.add_action(action)
        })
        const disableActions = () => [
            'go-prev',
            'go-next',
            'go-back',
            'go-next-section',
            'go-prev-section',
            'go-first',
            'go-last',
            'bookmark',
            'clear-cache'
        ].forEach(name => this.actionGroup.lookup_action(name).enabled = false)
        this.connect('book-loading', disableActions)
        this.connect('book-displayed', () => {
            if (this._data) this.actionGroup.lookup_action('bookmark').enabled = true
        })

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
        const webKitSettings = new WebKit2.Settings({
            allow_top_navigation_to_data_urls: false,
            allow_modal_dialogs: false,
            enable_fullscreen: false,
            enable_html5_database: false,
            enable_html5_local_storage: false,
            enable_hyperlink_auditing: false,
            enable_offline_web_application_cache: false,
            enable_java: false,
            enable_plugins: false,
            media_playback_requires_user_gesture: true,
            enable_write_console_messages_to_stdout: true,
            allow_file_access_from_file_urls: true,
            enable_javascript_markup: false
        })
        webKitSettings.set_user_agent_with_application_details('Foliate', pkg.version)
        this._webView = new WebKit2.WebView({
            visible: true,
            is_ephemeral: true,
            settings: webKitSettings
        })
        this._webView.connect('context-menu', () =>
            this._contextMenu ? this._contextMenu() : true)
        this._webView.connect('size-allocate', () => this._updateWindowSize())

        const runResource = resource => new Promise((resolve) =>
            this._webView.run_javascript_from_gresource(resource, null, () => resolve()))

        const loadScripts = async () => {
            await runResource('/com/github/johnfactotum/Foliate/web/jszip.min.js')
            await runResource('/com/github/johnfactotum/Foliate/web/epub.js')
            await runResource('/com/github/johnfactotum/Foliate/web/crypto-js/core.js')
            await runResource('/com/github/johnfactotum/Foliate/web/crypto-js/enc-latin1.js')
            await runResource('/com/github/johnfactotum/Foliate/web/crypto-js/md5.js')
            await runResource('/com/github/johnfactotum/Foliate/web/utils.js')
            await runResource('/com/github/johnfactotum/Foliate/web/webpub.js')
            await runResource('/com/github/johnfactotum/Foliate/web/epub-viewer.js')
        }

        this._webView.connect('load-changed', (webView, event) => {
            if (event == WebKit2.LoadEvent.FINISHED) loadScripts()
        })

        const contentManager = this._webView.get_user_content_manager()
        contentManager.connect('script-message-received::action', (_, jsResult) => {
            const data = jsResult.get_js_value().to_string()
            const { type, payload } = JSON.parse(data)
            this._handleAction(type, payload)
        })
        contentManager.register_script_message_handler('action')

        this._connectSettings()
        this._connectData()
        this.connect('book-error', (_, msg) => logError(new Error(msg)))

        this._swipeGesture = new Gtk.GestureSwipe({ widget: this._webView })
        this._swipeGesture.set_propagation_phase(Gtk.PropagationPhase.CAPTURE)
        this._swipeGesture.set_touch_only(true)
        this._swipeGesture.connect('swipe', async (_, velocityX, velocityY) => {
            try {
                // do not switch to another page if the page has been pinch zoomed,
                // this protects against accidental switches if user pans the page
                // too fast
                if (await this.getWindowIsZoomed()) return
                // switch to another page if swipe was fast enough
                if (Math.abs(velocityY) < SWIPE_SENSIVITY) {
                    // allow swipe to left/right with paginated and scrolled
                    // layouts but not with continuous layout, as changing page
                    // within continuous layout would just scroll the page by
                    // the height of the screen and that is not very intuitive
                    // to use
                    if (this.isPaginated || this.isScrolled) {
                        if (velocityX > SWIPE_SENSIVITY) {
                            this.goLeft()
                        } else if (velocityX < -SWIPE_SENSIVITY) {
                            this.goRight()
                        }
                    }
                } else {
                    // allow swipe up/down with paginated layouts, and disable
                    // for non-paginated layouts (scrolled, continuous), this
                    // protects against accidental switches if user pans the
                    // page too fast
                    if (this.isPaginated) {
                        if (velocityY > SWIPE_SENSIVITY) {
                            this.prev()
                        } else if (velocityY < -SWIPE_SENSIVITY) {
                            this.next()
                        }
                    }
                }
            } catch (e) {
                logError(e)
            }
        })

        const scrollPage = debounce(async (deltaX, deltaY) => {
            try {
                // do not switch to another page if the page has been pinch zoomed,
                // let the page contents scroll instead
                if (await this.getWindowIsZoomed()) return
                // switch to another page
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    if (deltaX > 0) this.goRight()
                    else if (deltaX < 0) this.goLeft()
                } else {
                    if (deltaY > 0) this.next()
                    else if (deltaY < 0) this.prev()
                }
            } catch (e) {
                logError(e)
            }
        }, 100, true)

        this._webView.connect('scroll-event', (_, event) => {
            if (!this.isPaginated) return
            // ignore touchscreen scroll events as webkit already handles those
            // by default to pan the page and page flipping is already
            // implemented by _swipeGesture above
            const source = event.get_source_device().get_source()
            if (source === Gdk.InputSource.TOUCHSCREEN) return

            const [, deltaX, deltaY] = event.get_scroll_deltas()
            // first mouse wheel scroll event starts with 0,0 delta, ignore them
            // to avoid debounce from triggering on event that doesn't do anything
            if (deltaX !== 0 || deltaY !== 0) scrollPage(deltaX, deltaY)
        })
    }
    _connectSettings() {
        this._zoomLevel = this.settings.zoom_level
        this.connect('notify::img-event-type', () => this.reload())
        const handlers = [
            this.settings.connect('notify::zoom-level', () => {
                this._zoomLevel = this.settings.zoom_level
                this._run(`zoomLevel = ${this.settings.zoom_level}`)
                this._updateWindowSize()
            }),
            this.settings.connect('notify::font', () => this._applyStyle()),
            this.settings.connect('notify::spacing', () => this._applyStyle()),
            this.settings.connect('notify::margin', () => this._applyStyle()),
            this.settings.connect('notify::max-width', () => this._applyStyle()),
            this.settings.connect('notify::use-publisher-font', () => this._applyStyle()),
            this.settings.connect('notify::justify', () => this._applyStyle()),
            this.settings.connect('notify::hyphenate', () => this._applyStyle()),
            this.settings.connect('notify::fg-color', () => this._applyStyle()),
            this.settings.connect('notify::bg-color', () => this._applyStyle()),
            this.settings.connect('notify::link-color', () => this._applyStyle()),
            this.settings.connect('notify::invert', () => this._applyStyle()),
            this.settings.connect('notify::brightness', () => this._applyStyle()),

            this.settings.connect('notify::enable-footnote', () =>
                this._enableFootnote = this.settings.enable_footnote),
            this.settings.connect('notify::autohide-cursor', () =>
                this._autohideCursor = this.settings.autohide_cursor),
            this.settings.connect('notify::enable-devtools', () =>
                this._enableDevtools = this.settings.enable_devtools),
            this.settings.connect('notify::allow-unsafe', () => this.reload()),
            this.settings.connect('notify::layout', () => this.reload()),
            this.settings.connect('notify::skeuomorphism', () =>
                this._skeuomorphism = this.settings.skeuomorphism),
        ]
        this._webView.connect('destroy', () =>
            handlers.forEach(h => this.settings.disconnect(h)))
    }
    get annotations() {
        return this._data ? this._data.annotationsList : null
    }
    get bookmarks() {
        return this._data ? this._data.bookmarksList : null
    }
    _connectData() {
        this.connect('metadata', () => {
            const cacheLocations = generalSettings.get_boolean('cache-locations')

            const type = this.contentType
            this.metadata.format = type
            const { identifier } = this.metadata
            let locations
            if (identifier && !this.ephemeral) {
                this._data = getData(identifier, type)
                this._data.addView(this)
                this.emit('data-ready', this._data.annotationsList, this._data.bookmarksList)
                locations = this._data.locations
                this._data.metadata = this.metadata
                if (uriStore) uriStore.set(identifier, this._file.get_uri())
                this.actionGroup.lookup_action('clear-cache').enabled = true
                if (this.cover) this._data.saveCover(this.cover)
            }
            const fallback = !cacheLocations
                // since locations are based on characters, don't generate locations
                // for comic books, which contain no characters
                || ['cbz', 'cbr', 'cb7', 'cbt'].includes(this._inputType)
            if (fallback) this.emit('locations-fallback')
            else this._run(`loadLocations(${locations || 'null'})`)
            this._run('render()')
        })
        this.connect('cover', () => {
            if (this._data) this._data.saveCover(this.cover)
        })
        this.connect('rendition-ready', () => {
            let lastLocation
            if (this._data) {
                for (const annotation of this._data.annotations) {
                    this._addAnnotation(annotation.cfi, annotation.color)
                }

                this._dataHandlers = [
                    this._data.connect('annotation-added', (_, annotation) => {
                        this.annotation = annotation
                        this._addAnnotation(annotation.cfi, annotation.color)
                    }),
                    this._data.connect('annotation-removed', (_, cfi) =>
                        this._removeAnnotation(cfi)),
                    this._data.connect('externally-modified', () => this.reload()),
                    this._data.connect('cache-modified', () => this.emit('should-reload'))
                ]

                lastLocation = this._data.lastLocation
            }
            this._run(`display(${lastLocation ? `'${lastLocation}'` : ''})`)
        })
        this.connect('locations-generated', () => {
            if (this._data) this._data.locations = this.locations
        })
        this.connect('relocated', () => {
            if (this._data) {
                const l = this.location
                this._data.lastLocation = l.start.cfi
                const fallback = l.locationTotal <= 0
                const current = fallback ? l.section + 1 : l.start.location
                const total = fallback ? l.sectionTotal : l.locationTotal
                this._data.progress = [current, total]
            }
        })
        this._webView.connect('destroy', () => {
            if (!this._data) return
            this._data.deleteView(this)
            this._disconnectData()
        })
    }
    _disconnectData() {
        if (!this._data) return
        if (this._dataHandlers) {
            this._dataHandlers.forEach(h => this._data.disconnect(h))
            this._dataHandlers = null
        }
        this._data.disconnectAll()
        this._data = null
    }
    _load() {
        this.emit('book-loading')
        this._ready = false
        let viewer = this.settings.allow_unsafe ? unsafeViewerPath : viewerPath

        const webViewSettings = this._webView.get_settings()
        if (['cbz', 'cbr', 'cb7', 'cbt'].includes(this._inputType)) {
            viewer = cbViewerPath
            webViewSettings.enable_javascript_markup = true
        } else {
            webViewSettings.enable_javascript_markup = this.settings.allow_unsafe
        }

        this._webView.load_uri(GLib.filename_to_uri(viewer, null))
    }
    reload() {
        if (!this._uri) return
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
            case 'ready': {
                this.cover = null
                this._ready = true
                this._run(`doubleClickTime =
                    ${Gtk.Settings.get_default().gtk_double_click_time}`)
                this._run(`imgEventType = "${this.img_event_type}"`)
                this._updateWindowSize()
                this._run(`zoomLevel = ${this.settings.zoom_level}`)

                this._enableFootnote = this.settings.enable_footnote
                this._enableDevtools = this.settings.enable_devtools
                this._skeuomorphism = this.settings.skeuomorphism
                this._autohideCursor = this.settings.autohide_cursor

                const uri = this._uri
                const filename = this._file.get_basename().replace(/\.[^\s.]+$/, '')

                const options = layouts[this.settings.layout].options

                this._run(`open(
                    decodeURI("${encodeURI(uri)}"),
                    decodeURI("${encodeURI(filename)}"),
                    '${this._inputType}',
                    ${layouts[this.settings.layout].renderTo},
                    ${JSON.stringify(options)})`)
                break
            }
            case 'book-error':
                this.emit('book-error', payload)
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
            case 'locations-fallback':
                this.emit('locations-fallback')
                break
            case 'cover':
                this.cover = base64ToPixbuf(payload)
                this.emit('cover')
                break

            case 'relocated': {
                debug(payload.start.cfi)
                this.location = payload
                this.location.canGoBack = Boolean(this._history.length)

                const { atStart, atEnd, canGoBack,
                    section, sectionTotal } = this.location
                const action = this.actionGroup.lookup_action.bind(this.actionGroup)
                action('go-prev').enabled = !atStart
                action('go-next').enabled = !atEnd
                action('go-back').enabled = canGoBack
                action('go-next-section').enabled = section + 1 < sectionTotal
                action('go-prev-section').enabled = section > 0
                action('go-first').enabled = !atStart
                action('go-last').enabled = !atEnd

                if (this._findResultCfi) this.selectByCfi(this._findResultCfi)
                this.emit('relocated')
                break
            }
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
                const regex = new RegExp(regexEscape(q), 'ig')
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
                this.selection.text = this.selection.text.trim()
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
                this.emit('click', payload.width, payload.position)
                break

            case 'speech': {
                const { text, nextPage, nextSection } = payload
                this.emit('speech', text, nextPage, nextSection)
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

        const invert = this.settings.invert ? invertRotate : (x => x)

        const style = {
            fontFamily, fontSize, fontWeight, fontStyle, fontStretch,
            spacing: this.settings.spacing,
            margin: this.settings.margin,
            maxWidth: this.settings.max_width,
            usePublisherFont: this.settings.use_publisher_font,
            justify: this.settings.justify,
            hyphenate: this.settings.hyphenate,
            fgColor: invert(this.settings.fg_color),
            bgColor: invert(this.settings.bg_color),
            linkColor: invert(this.settings.link_color),
            invert: this.settings.invert,
            brightness: this.settings.brightness,
            ibooksInternalTheme: getIbooksInternalTheme(invert(this.settings.bg_color))
        }
        return this._run(`setStyle(${JSON.stringify(style)})`)
    }
    _updateWindowSize() {
        if (this._ready) {
            const { width, height } = this._webView.get_allocation()
            this._run(`windowSize = ${width}`)
            this._run(`windowHeight = ${height}`)
        }
    }
    set _zoomLevel(zoomLevel) {
        this._webView.zoom_level = zoomLevel
        this.actionGroup.lookup_action('zoom-restore').enabled = zoomLevel !== 1
        this.actionGroup.lookup_action('zoom-out').enabled = zoomLevel > 0.2
        this.actionGroup.lookup_action('zoom-in').enabled = zoomLevel < 4
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
    open_(uri, inputType) {
        this.findResults.clear()
        this._history = []
        this._uri = uri
        this._inputType = inputType
        this._load()
    }
    async open(file) {
        this.emit('book-loading')
        this.close()
        this._file = file
        this._fileInfo = null

        let uri = this._file.get_uri()
        let path = this._file.get_path()

        // if path is null, we download the file with libsoup first
        if (!path) {
            const dir = GLib.dir_make_tmp(null)
            this._tmpdir = dir
            try {
                path = GLib.build_filenamev([dir, this._file.get_basename()])
                const file = Gio.File.new_for_path(path)
                const localUri = file.get_uri()
                const onProgress = progress =>
                    this.emit('book-downloading', progress)
                onProgress(0)
                this._downloadToken = {}
                await downloadWithWebKit(
                    uri, localUri, onProgress, this._downloadToken, this._webView.get_toplevel())
                uri = localUri

                try {
                    this._fileInfo = await getFileInfoAsync(file)
                } catch (e) {
                    logError(e)
                }
            } catch (e) {
                logError(e)
                return this.emit('book-error', _('Failed to load remote file.'))
            }
        } else {
            try {
                this._fileInfo = await getFileInfoAsync(this._file)
            } catch (e) {
                logError(e)
            }
        }
        if (!this._fileInfo) return this.emit('book-error', _('File not found.'))

        switch (this._fileInfo.get_content_type()) {
            case mimetypes.mobi:
            case mimetypes.kindle:
            case mimetypes.kindleAlias: {
                const dir = this._tmpdir || GLib.dir_make_tmp(null)
                const command = [python, kindleUnpack, '--epub_version=3', path, dir]
                execCommand(command, null, false, null, true).then(() => {
                    const mobi8 = dir + '/mobi8/'
                    if (GLib.file_test(mobi8, GLib.FileTest.EXISTS))
                        this.open_(mobi8, 'directory')
                    else this.open_(dir + '/mobi7/content.opf', 'opf')
                }).catch(() =>
                    this.emit('book-error', _('Could not unpack Kindle file.')))
                break
            }
            case mimetypes.directory:
                this.open_(GLib.build_filenamev([uri, '/']), 'directory')
                break
            case mimetypes.json: this.open_(uri, 'json'); break
            case mimetypes.xml: this.open_(uri, 'opf'); break
            case mimetypes.epub: this.open_(uri, 'epub'); break
            case mimetypes.text: this.open_(uri, 'text'); break
            case mimetypes.html: this.open_(uri, 'html'); break
            case mimetypes.xhtml: this.open_(uri, 'xhtml'); break
            case mimetypes.fb2: this.open_(uri, 'fb2'); break
            case mimetypes.fb2zip: this.open_(uri, 'fb2zip'); break
            case mimetypes.cbz: this.open_(uri, 'cbz'); break
            case mimetypes.cbr: this.open_(uri, 'cbr'); break
            case mimetypes.cb7: this.open_(uri, 'cb7'); break
            case mimetypes.cbt: this.open_(uri, 'cbt'); break
            default: this.emit('book-error', _('File type not supported.'))
        }
    }
    get contentType() {
        if (this._fileInfo) return this._fileInfo.get_content_type()
        return null
    }
    close() {
        this._disconnectData()
        if (this._tmpdir) {
            recursivelyDeleteDir(Gio.File.new_for_path(this._tmpdir))
            this._tmpdir = null
        }
        if (this._downloadToken && this._downloadToken.cancel) {
            this._downloadToken.cancel()
        }
    }
    prev() {
        this._run(`rendition.prev()`)
    }
    next() {
        this._run(`rendition.next()`)
    }
    nextSection() {
        this.goTo(this.location.section + 1)
    }
    prevSection() {
        this.goTo(this.location.section - 1)
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
    goRight() {
        const rtl = this.metadata.direction === 'rtl'
        rtl ? this.prev() : this.next()
    }
    goLeft() {
        const rtl = this.metadata.direction === 'rtl'
        rtl ? this.next() : this.prev()
    }
    back() {
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
        this._data.addAnnotation(annotation)
    }
    removeAnnotation(cfi) {
        this._data.removeAnnotation(cfi)
    }
    addBookmark(cfi = this.location.start.cfi) {
        this._data.addBookmark(cfi)
    }
    removeBookmark(cfi = this.location.start.cfi) {
        this._data.removeBookmark(cfi)
    }
    hasBookmark(cfi = this.location.start.cfi) {
        return this._data ? this._data.hasBookmark(cfi) : undefined
    }
    get data() {
        return this._data.data
    }
    find(q, inBook = true, highlight = true) {
        this.findResults.clear()
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
    getWindowIsZoomed() {
        return this._eval('getWindowIsZoomed()')
    }
    get sectionMarks() {
        return this._get('sectionMarks')
    }
    speak(from) {
        this._run(`speak(${from ? `'${from}'` : ''})`)
    }
    speakNextSection() {
        this._run(`rendition.display(${this.location.section + 1})
            .then(() => speak())`)
    }
    speakNext() {
        this._run(`rendition.next().then(() => speak())`)
    }
    get isPaginated() {
        return layouts[this.settings.layout].options.flow === 'paginated'
    }
    get isScrolled() {
        return layouts[this.settings.layout].options.flow === 'scrolled-doc'
    }
    get widget() {
        return this._webView
    }
})

var HeadlessEpubViewer = GObject.registerClass({
    GTypeName: 'FoliateHeadlessEpubViewer',
    Signals: {
        'progress': {
            flags: GObject.SignalFlags.RUN_FIRST,
            param_types: [GObject.TYPE_INT, GObject.TYPE_INT]
        },
    }
}, class HeadlessEpubViewer extends GObject.Object {
    _init(params) {
        super._init(params)
        this._set = new Set()
        this._total = 0
        this._progress = 0
        this._queue = Promise.resolve()
        this._failed = []
    }
    openFiles(files) {
        this._total += files.length
        this.emit('progress', this._progress, this._total)
        for (const file of files) {
            const then = () => {
                this._progress++
                this.emit('progress', this._progress, this._total)
                if (this._progress === this._total) this.stop()
            }
            const f = () => this.open(file).then(then)
            this._queue = this._queue.then(f).catch(f)
        }
    }
    stop() {
        for (const offscreen of this._set) offscreen.destroy()
        this._set.clear()
        this._total = 0
        this._progress = 0
        this._failed = []
    }
    open(file) {
        return new Promise((resolve, reject) => {
            let metadataLoaded, coverLoaded
            const epub = new EpubView()
            const offscreen = new Gtk.OffscreenWindow()
            offscreen.add(epub.widget)
            offscreen.show_all()
            this._set.add(offscreen)
            const close = () => {
                if (!metadataLoaded || !coverLoaded) return
                this._set.delete(offscreen)
                offscreen.destroy()
                resolve()
            }
            epub.connect('metadata', () => {
                metadataLoaded = true
                close()
            })
            epub.connect('cover', () => {
                coverLoaded = true
                close()
            })
            epub.connect('book-error', () => reject())
            // NOTE: must not open until we've connected to `book-error`
            // because opening a book can fail synchronously!
            epub.open(file)
        }).catch(() => this._failed.push(file))
    }
    get failed() {
        return this._failed
    }
})

var headlessViewer = new HeadlessEpubViewer()
