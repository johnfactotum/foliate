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

const { GObject, GLib, Pango, WebKit2 } = imports.gi

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

var EpubViewSettings = GObject.registerClass({
    GTypeName: 'FoliateEpubViewSettings',
    Properties: {
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

var EpubView = class EpubView {
    constructor(fileName, inputType, callback, settings, cfi, locations) {
        this._fileName = fileName
        this._inputType = inputType
        this._callback = callback
        this._settings = settings
        this._cfi = cfi
        this._locations = locations

        this._history = []

        this._webView = new WebKit2.WebView({
            visible: true,
            settings: new WebKit2.Settings({
                enable_write_console_messages_to_stdout: true,
                allow_universal_access_from_file_urls: true
            })
        })
        this._load()

        this._contextMenu = null
        this._webView.connect('context-menu', () =>
            this._contextMenu ? this._contextMenu() : true)

        const contentManager = this._webView.get_user_content_manager()
        contentManager.connect('script-message-received::action', (_, jsResult) => {
            const data = jsResult.get_js_value().to_string()
            const { type, payload } = JSON.parse(data)

            this._handleAction(type, payload)
            this._callback(type, payload)
        })
        contentManager.register_script_message_handler('action')

        this._settings.connect('notify::font', () => this._applyStyle())
        this._settings.connect('notify::spacing', () => this._applyStyle())
        this._settings.connect('notify::margin', () => this._applyStyle())
        this._settings.connect('notify::use-publisher-font', () => this._applyStyle())
        this._settings.connect('notify::justify', () => this._applyStyle())
        this._settings.connect('notify::hyphenate', () => this._applyStyle())
        this._settings.connect('notify::fg-color', () => this._applyStyle())
        this._settings.connect('notify::bg-color', () => this._applyStyle())
        this._settings.connect('notify::link-color', () => this._applyStyle())
        this._settings.connect('notify::brightness', () => this._applyStyle())

        this._settings.connect('notify::enable-footnote', () =>
            this.enableFootnote = this._settings.enable_footnote)
        this._settings.connect('notify::enable-devtools', () =>
            this.enableDevtools = this._settings.enable_devtools)
        this._settings.connect('notify::allow-unsafe', () => this._load())
        this._settings.connect('notify::layout', () => this._webView.reload())
    }
    _load() {
        const viewer = this._settings.allow_unsafe ? unsafeViewerPath : viewerPath
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
                this._run(`open("${encodeURI(this._fileName)}",
                    '${this._inputType}',
                    ${this._cfi ? `"${this._cfi}"` : 'null'},
                    ${layouts[this._settings.layout].renderTo},
                    ${JSON.stringify(layouts[this._settings.layout].options)},
                    ${this._locations || 'null'})`)

                this.enableFootnote = this._settings.enable_footnote
                this.enableDevtools = this._settings.enable_devtools
                break
            case 'rendition-ready':
                this._applyStyle()
                break
            case 'locations-generated':
                this._locations = payload
                break
            case 'relocated':
                this._cfi = payload.cfi
                break
        }
    }
    get metadata() {
        return this._get('book.package.metadata')
    }
    get toc() {
        return this._get('book.navigation.toc')
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
    _applyStyle() {
        const fontDesc = Pango.FontDescription.from_string(this._settings.font)
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
            spacing: this._settings.spacing,
            margin: this._settings.margin,
            usePublisherFont: this._settings.use_publisher_font,
            justify: this._settings.justify,
            hyphenate: this._settings.hyphenate,
            brightness: this._settings.brightness,
            fgColor: this._settings.fg_color,
            bgColor: this._settings.bg_color,
            linkColor: this._settings.link_color
        }
        this._run(`setStyle(${JSON.stringify(style)})`)
    }
    get zoomLevel() {
        return this._webView.zoom_level
    }
    set zoomLevel(x) {
        this._webView.zoom_level = x
    }
    set enableFootnote(state) {
        this._run(`enableFootnote = ${state}`)
    }
    set enableDevtools(state) {
        this._webView.get_settings().enable_developer_extras = state
        this._contextMenu = () => !state
    }
    clearSelection() {
        this._run('clearSelection()')
    }
    selectByCfi(cfi) {
        this._run(`selectByCfi('${cfi}')`)
    }
    addAnnotation(cfi, color) {
        this._run(`addAnnotation('${cfi}', '${color}')`)
    }
    removeAnnotation(cfi) {
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
}
