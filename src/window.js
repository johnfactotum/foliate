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

const { GObject, Gtk, Gio, GLib, Gdk, Pango, WebKit2 } = imports.gi

const { execCommand, recursivelyDeleteDir } = imports.utils

const settings = new Gio.Settings({ schema_id: pkg.name })

const mimetypes = {
    epub: 'application/epub+zip',
    mobi: 'application/x-mobipocket-ebook'
}

const defaultThemes = {
    [_('Light')]: {
        color: '#000', background: '#fff', link: 'blue',
        darkMode: false, invert: false
    },
    [_('Sepia')]: {
        color: '#5b4636', background: '#efe7dd', link: 'darkcyan',
        darkMode: false, invert: false
    },
    [_('Gray')]: {
        color: '#ccc', background: '#555', link: 'cyan',
        darkMode: true, invert: false
    },
    [_('Dark')]: {
        color: '#ddd', background: '#292929', link: 'cyan',
        darkMode: true, invert: false
    },
    [_('Solarized Light')]: {
        color: '#586e75', background: '#fdf6e3', link: '#268bd2',
        darkMode: false, invert: false
    },
    [_('Solarized Dark')]: {
        color: '#93a1a1', background: '#002b36', link: '#268bd2',
        darkMode: true, invert: false
    },
    [_('Invert')]: {
        color: '#000', background: '#fff', link: 'blue',
        darkMode: true, invert: true
    }
}

const maxBy = (arr, f) =>
    arr[arr.map(f).reduce((prevI, x, i, arr) => x > arr[prevI] ? i : prevI, 0)]

const makePopoverPosition = ({ left, right, top, bottom }, window, height) => {
    const [winWidth, winHeight] = window.get_size()

    const borders = [
        [left, Gtk.PositionType.LEFT, left, (top + bottom) / 2],
        [winWidth - right, Gtk.PositionType.RIGHT, right, (top + bottom) / 2],
        [top, Gtk.PositionType.TOP, (left + right) / 2, top],
        [winHeight - bottom, Gtk.PositionType.BOTTOM, (left + right) / 2, bottom]
    ]
    const maxBorder = borders[3][0] > height ? borders[3]
        : borders[2][0] > height ? borders[2]
        : maxBy(borders, x => x[0])

    const x = maxBorder[2]
    const y = maxBorder[3]
    return {
        // sometimes the reported position values are wrong
        // setting x, y to zero insures that the popover is at least visible
        position: {
            x: x <= winWidth && x > 0 ? x : 0,
            y: y <= winHeight && y > 0 ? y : 0
        },
        positionType: maxBorder[1]
    }
}
const setPopoverPosition = (popover, position, window, height) => {
    const { position: rectPosition, positionType } =
        makePopoverPosition(position, window, height)

    popover.position = positionType
    popover.pointing_to = new Gdk.Rectangle(rectPosition)
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

class EpubView {
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
    addAnnotation(cfi, color) {
        this._run(`addAnnotation('${cfi}', '${color}')`)
    }
    get widget() {
        return this._webView
    }
}

const makeActions = self => ({
    'win.go-prev': [() => self._epub.prev(), ['p']],
    'win.go-next': [() => self._epub.next(), ['n']],
    'win.go-back': [() => self._epub.goBack(), ['<alt>p', '<alt>Left']],

    'win.zoom-in': [() => self._applyZoomLevel(self._epub.zoomLevel + 0.1),
        ['plus', 'equal', '<ctrl>plus', '<ctrl>equal']],
    'win.zoom-out': [() => self._applyZoomLevel(self._epub.zoomLevel - 0.1),
        ['minus', '<ctrl>minus']],
    'win.zoom-restore': [() => self._applyZoomLevel(1),
        ['1', '<ctrl>1']],

    'win.selection-copy': [() => Gtk.Clipboard
            .get_default(Gdk.Display.get_default())
            .set_text(self._selection.text, -1),
        ['<ctrl>c']],
    'win.selection-highlight': [() =>
        self._epub.addAnnotation(self._selection.cfi, 'yellow')],

    'win.side-menu': [() =>
        self._sideMenuButton.active = !self._sideMenuButton.active,
        ['F9']],
    'win.find-menu': [() =>
        self._findMenuButton.active = !self._findMenuButton.active,
        ['<ctrl>f', 'slash']],
    'win.main-menu': [() =>
        self._mainMenuButton.active = !self._mainMenuButton.active,
        ['F10']],

    'win.fullscreen': [() =>
        self._isFullscreen ? self.unfullscreen() : self.fullscreen(),
        ['F11']],
    'win.unfullscreen': [() =>
        self.unfullscreen(),
        ['Escape']],

    'app.themes': [() => {
    }, ['<ctrl>question']],

    'app.preferences': [() => {
    }, ['<ctrl>question']],

    'app.shortcuts': [() => {
    }, ['<ctrl>question']],

    'app.open': [() => {
        const allFiles = new Gtk.FileFilter()
        allFiles.set_name(_('All Files'))
        allFiles.add_pattern('*')

        const epubFiles = new Gtk.FileFilter()
        epubFiles.set_name(_('E-book Files'))
        epubFiles.add_mime_type(mimetypes.epub)
        epubFiles.add_mime_type(mimetypes.mobi)

        const dialog = Gtk.FileChooserNative.new(
            _('Open File'),
            self.application.active_window,
            Gtk.FileChooserAction.OPEN,
            null, null)
        dialog.add_filter(epubFiles)
        dialog.add_filter(allFiles)

        const response = dialog.run()
        if (response === Gtk.ResponseType.ACCEPT) {
            self._open(dialog.get_filename())
        }
    }, ['<ctrl>o']],

    'app.about': [() => {
        const aboutDialog = new Gtk.AboutDialog({
            authors: ['John Factotum'],
            artists: ['John Factotum'],
            translator_credits: _('translator-credits'),
            program_name: _('Foliate'),
            comments: _('A simple and modern eBook viewer'),
            logo_icon_name: pkg.name,
            version: pkg.version,
            license_type: Gtk.License.GPL_3_0,
            website: 'https://johnfactotum.github.io/foliate/',
            modal: true,
            transient_for: self.application.active_window
        })
        aboutDialog.run()
        aboutDialog.destroy()
    }],

    'win.close': [() => self.close(), ['<ctrl>w']],
    'app.quit': [() =>
        self.application.get_windows().forEach(window => window.close()),
        ['<ctrl>q']],
})

const makeBooleanActions = self => ({
    'win.navbar': [state => {
        self._navbar.visible = state
    }, true, ['<ctrl>p']],
    'win.publisher-font': [state => self._onStyleChange(), ],
    'win.justify':  [state => self._onStyleChange(), true],
    'win.hyphenate':  [state => self._onStyleChange(), true],
    'win.footnote':  [state => self._onStyleChange(), false],
    'win.unsafe': [state => {
        self._isLoading = true
        self._epub.unsafe = state
    }, false],
    'win.devtools': [state => self._epub.devtools = state, false]
})

const makeStringActions = self => ({
    'win.theme': [() => self._onStyleChange(), 'Sepia'],
    'win.layout': [layout => {
        self._isLoading = true
        self._epub.layout = layout
    }, 'auto']
})

var FoliateWindow = GObject.registerClass({
    GTypeName: 'FoliateWindow',
    Template: 'resource:///com/github/johnfactotum/Foliate/window.ui',
    InternalChildren: [
        'headerBar', 'mainOverlay', 'mainBox', 'contentBox',
        'sideMenuButton', 'sideMenu', 'tocTreeView',
        'findMenuButton', 'mainMenuButton',
        'zoomRestoreButton', 'fullscreenButton', 'brightnessScale',
        'fontButton', 'spacingButton', 'marginsButton', 'themeBox',
        'navbar', 'locationStack', 'locationLabel', 'locationScale',
        'selectionMenu'
    ]
}, class FoliateWindow extends Gtk.ApplicationWindow {
    _init(application) {
        super._init({ application })

        Object.keys(defaultThemes).forEach(theme =>
            this._themeBox.pack_start(new Gtk.ModelButton({
                visible: true,
                action_name: 'win.theme',
                action_target: new GLib.Variant('s', theme),
                text: theme
            }), false, true, 0))

        const actions = makeActions(this)
        Object.keys(actions).forEach(action => {
            const [context, name] = action.split('.')
            const [func, accels] = actions[action]
            this._addAction(context, name, func, accels)
        })
        const booleanActions = makeBooleanActions(this)
        Object.keys(booleanActions).forEach(action => {
            const [context, name] = action.split('.')
            const [func, defaultValue, accels] = booleanActions[action]
            this._addBooleanAction(context, name, func, defaultValue, accels)
        })
        const stringActions = makeStringActions(this)
        Object.keys(stringActions).forEach(action => {
            const [context, name] = action.split('.')
            const [func, defaultValue] = stringActions[action]
            this._addStringAction(context, name, func, defaultValue)
        })

        ;[
            'zoom-in',
            'zoom-out',
            'zoom-restore',
            'go-prev',
            'go-next',
            'go-back'
        ].forEach(action => this.lookup_action(action).enabled = false)
    }
    _addAction(context, name, func, accels, state, useParameter) {
        const action = new Gio.SimpleAction({
            name,
            state: state || null,
            parameter_type: useParameter ? state.get_type() : null
        })
        action.connect('activate', func)
        ;(context === 'app' ? this.application : this).add_action(action)
        if (accels)
            this.application.set_accels_for_action(`${context}.${name}`, accels)
    }
    _addBooleanAction(context, name, func, defaultValue = false, accels) {
        const state = new GLib.Variant('b', defaultValue)
        this._addAction(context, name, action => {
            const state = action.get_state().get_boolean()
            action.set_state(new GLib.Variant('b', !state))
            func(!state)
        }, accels, state)
    }
    _addStringAction(context, name, func, defaultValue) {
        const state = new GLib.Variant('s', defaultValue)
        this._addAction(context, name, (action, parameter) => {
            const string = parameter.get_string()[0]
            action.set_state(new GLib.Variant('s', string))
            func(string)
        }, null, state, true)
    }
    _onWindowStateEvent(widget, event) {
        const state = event.get_window().get_state()
        this._isFullscreen = Boolean(state & Gdk.WindowState.FULLSCREEN)
        this._isMaximized = Boolean(state & Gdk.WindowState.MAXIMIZED)

        const fullscreenImage = this._fullscreenButton.get_child()
        if (this._isFullscreen) {
            fullscreenImage.icon_name = 'view-restore-symbolic'
            this._fullscreenButton.tooltip_text = _('Leave fullscreen')
        } else {
            fullscreenImage.icon_name = 'view-fullscreen-symbolic'
            this._fullscreenButton.tooltip_text = _('Fullscreen')
        }
    }
    _onDestroy() {
        if (this._tmpdir) recursivelyDeleteDir(Gio.File.new_for_path(this._tmpdir))
    }
    get _isLoading() {
        return !this._mainBox.opacity
    }
    set _isLoading(state) {
        this._mainBox.opacity = state ? 0 : 1
        this._mainOverlay.visible = state
    }
    _open(fileName, realFileName, inputType = 'epub') {
        const file = Gio.File.new_for_path(fileName)
        const fileInfo = file.query_info('standard::content-type',
            Gio.FileQueryInfoFlags.NONE, null)
        const contentType = fileInfo.get_content_type()

        if (contentType === mimetypes.mobi) {
            const python = GLib.find_program_in_path('python')
                || GLib.find_program_in_path('python3')
            const kindleUnpack = pkg.pkgdatadir
                + '/assets/KindleUnpack/kindleunpack.py'

            const dir = GLib.dir_make_tmp(null)
            this._tmpdir = dir

            const command = [python, kindleUnpack, '--epub_version=3', fileName, dir]
            execCommand(command, null, false, null, true).then(() => {
                const mobi8 = dir + '/mobi8/'
                if (GLib.file_test(mobi8, GLib.FileTest.EXISTS))
                    this._open(mobi8, fileName, 'directory')
                else this._open(dir + '/mobi7/content.opf', fileName, 'opf')
            })
            return
        }

        this._epub = new EpubView(fileName, inputType, this._onAction.bind(this))
        this._contentBox.pack_start(this._epub.widget, true, true, 0)
    }
    _onAction(type, payload) {
        switch (type) {
            case 'book-ready':
                this._epub.metadata.then(metadata => {
                    this._headerBar.title = metadata.title
                    this._headerBar.subtitle = metadata.creator
                })
                this._epub.toc.then(toc => {
                    const store = this._tocTreeView.model
                    store.clear()
                    const f = (toc, iter = null) => {
                        toc.forEach(chapter => {
                            const newIter = store.append(iter)
                            const label = chapter.label
                            store.set(newIter, [0, 1], [label, chapter.href])
                            if (chapter.subitems) f(chapter.subitems, newIter)
                        })
                    }
                    f(toc)
                })
                break

            case 'locations-generated':
                // falls through
            case 'locations-ready':
                this._locationStack.visible_child_name = 'loaded'
                break

            case 'rendition-ready':
                ;[
                    'zoom-in',
                    'zoom-out',
                    'zoom-restore'
                ].forEach(action => this.lookup_action(action).enabled = true)
                this._applyZoomLevel(1)
                this._onStyleChange()
                if (this._isLoading) this._isLoading = false
                break
            case 'book-error':
                this._mainOverlay.visible_child_name = 'error'
                break

            case 'relocated': {
                const {
                    atStart, atEnd, cfi, sectionHref,
                    chapter, chapterTotal, location, locationTotal, percentage
                } = payload
                this.lookup_action('go-prev').enabled = !atStart
                this.lookup_action('go-next').enabled = !atEnd

                this._locationScale.set_value(percentage)

                const progress = Math.round(percentage * 100)
                this._locationLabel.label = progress + '%'

                // select toc item
                const view = this._tocTreeView
                const store = view.model
                const selection = view.get_selection()
                let [, iter] = store.get_iter_first()
                loop:
                while (true) {
                    const value = store.get_value(iter, 1)
                    if (value === sectionHref) {
                        const path = store.get_path(iter)
                        view.expand_to_path(path)
                        view.scroll_to_cell(path, null, true, 0.5, 0)
                        selection.select_iter(iter)
                        break
                    }
                    const [hasChild, childIter] = store.iter_children(iter)
                    if (hasChild) iter = childIter
                    else {
                        while (true) {
                            const [hasParent, parentIter] = store.iter_parent(iter)
                            if (!store.iter_next(iter)) {
                                if (hasParent) iter = parentIter
                                else break loop
                            } else break
                        }
                    }
                }
                break
            }
            case 'selection': {
                const { position, selection } = payload
                this._selection = selection

                // position needs to be adjusted for zoom level
                const zoomLevel = this._epub.zoomLevel
                Object.keys(position).forEach(key =>
                    position[key] = position[key] * zoomLevel)

                const popover = this._selectionMenu
                popover.relative_to = this._epub.widget

                const setPosition = height =>
                    setPopoverPosition(popover, position, this, height)

                popover.connect('size-allocate', () =>
                    setPosition(popover.get_allocation().height))

                setPosition(200)
                popover.popup()
                popover.connect('closed', () => this._epub.clearSelection())
                break
            }
        }
    }
    _onTocRowActivated() {
        const store = this._tocTreeView.model
        const selection = this._tocTreeView.get_selection()
        const [, , iter] = selection.get_selected()
        const href = store.get_value(iter, 1)
        this._epub.goTo(href)
        this._sideMenu.popdown()
    }
    _onlocationScaleChanged() {
        const value = this._locationScale.get_value()
        this._epub.goToPercentage(value)
    }
    _applyZoomLevel(zoomLevel) {
        this._epub.zoomLevel = zoomLevel
        this._zoomRestoreButton.label = parseInt(zoomLevel * 100) + '%'
        this.lookup_action('zoom-restore').enabled = zoomLevel !== 1
        this.lookup_action('zoom-out').enabled = zoomLevel > 0.2
    }
    _onStyleChange() {
        const themeName = this.lookup_action('theme').state.get_string()[0]
        const theme = defaultThemes[themeName]
        const { color, background, link, invert, darkMode } = theme
        Gtk.Settings.get_default().gtk_application_prefer_dark_theme = darkMode

        const fontDesc = this._fontButton.font_desc
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

        this._epub.setStyle({
            color, background, link, invert,
            fontFamily, fontSize, fontWeight, fontStyle, fontStretch,
            brightness: this._brightnessScale.get_value(),
            spacing: this._spacingButton.value,
            margins: this._marginsButton.value,
            publisherFont: this.lookup_action('publisher-font').state.get_boolean(),
            hyphenate: this.lookup_action('hyphenate').state.get_boolean(),
            justify: this.lookup_action('justify').state.get_boolean()
        })
    }
})
