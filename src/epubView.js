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

const { GLib, WebKit2 } = imports.gi

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

var EpubView = class EpubView {
    constructor(fileName, inputType, callback, cfi, unsafe, locations) {
        this._fileName = fileName
        this._inputType = inputType
        this._callback = callback
        this._cfi = cfi
        this._unsafe = unsafe
        this._locations = locations
        this._layout = 'auto'

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
    }
    _load() {
        const viewer = this._unsafe ? unsafeViewerPath : viewerPath
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
                    ${layouts[this._layout].renderTo},
                    ${JSON.stringify(layouts[this._layout].options)},
                    ${this._locations || 'null'})`)
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
    goTo(x) {
        this._run(`rendition.display("${x}")`)
    }
    goToPercentage(x) {
        this._run(`rendition.display(book.locations.cfiFromPercentage(${x}))`)
    }
    goBack() {
    }
    // TODO: don't apply when rendition isn't ready
    setStyle(style) {
        const { fontFamily, fontSize } = style
        const webViewSettings = this._webView.get_settings()
        webViewSettings.serif_font_family = fontFamily
        webViewSettings.sans_serif_font_family = fontFamily
        webViewSettings.default_font_family = fontFamily
        webViewSettings.default_font_size = fontSize

        this._run(`setStyle(${JSON.stringify(style)})`)
    }
    set layout(layout) {
        this._layout = layout
        this._webView.reload()
    }
    get zoomLevel() {
        return this._webView.zoom_level
    }
    set zoomLevel(x) {
        this._webView.zoom_level = x
    }
    set unsafe(state) {
        this._unsafe = state
        this._load()
    }
    set devtools(state) {
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
    get widget() {
        return this._webView
    }
}
