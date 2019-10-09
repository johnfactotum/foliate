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
const settings = new Gio.Settings({ schema_id: pkg.name })

const kindleExts = ['.mobi', '.prc', '.azw', '.azw3']

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

class EpubView {
    constructor(fileName, onAction) {
        this.webView = new WebKit2.WebView({
            visible: true,
            settings: new WebKit2.Settings({
                enable_write_console_messages_to_stdout: true,
                allow_universal_access_from_file_urls: true
            })
        })
        this.webView.load_uri(GLib.filename_to_uri(
            pkg.pkgdatadir + '/assets/epub-viewer.html', null))

        this.webView.connect('context-menu', () =>
            this.contextMenu ? this.contextMenu() : true)

        const contentManager = this.webView.get_user_content_manager()
        contentManager.connect('script-message-received::action', (_, jsResult) => {
            const data = jsResult.get_js_value().to_string()
            const { type, payload } = JSON.parse(data)
            if (type === 'ready')
                this.run(`open("${encodeURI(fileName)}", 'epub')`)
            else onAction(type, payload)
        })
        contentManager.register_script_message_handler('action')
    }
    eval(script, discardReturn) {
        return new Promise((resolve, reject) => {
            this.webView.run_javascript(script, null, (self, result) => {
                if (discardReturn) return resolve()
                const jsResult = self.run_javascript_finish(result)
                const value = jsResult.get_js_value().to_string()
                const obj = value !== 'undefined' ? JSON.parse(value) : null
                resolve(obj)
            })
        })
    }
    run(script) {
        return this.eval(script, true)
    }
    get(script) {
        return this.eval(`JSON.stringify(${script})`)
    }
}

const makeActions = self => ({
    'win.go-prev': [() =>
        self._epub.run('rendition.prev()'),
        ['p']],
    'win.go-next': [() =>
        self._epub.run('rendition.next()'),
        ['n']],
    'win.go-back': [() => {
        print('go-back')
    }, ['<alt>p', '<alt>Left']],

    'win.zoom-in': [() =>
        self._applyZoomLevel(self._epub.webView.zoom_level + 0.1),
        ['plus', 'equal', '<ctrl>plus', '<ctrl>equal']],
    'win.zoom-out': [() =>
        self._applyZoomLevel(self._epub.webView.zoom_level - 0.1),
        ['minus', '<ctrl>minus']],
    'win.zoom-restore': [() =>
        self._applyZoomLevel(1),
        ['1', '<ctrl>1']],

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
        print('themes')
    }, ['<ctrl>question']],

    'app.preferences': [() => {
        print('preferences')
    }, ['<ctrl>question']],

    'app.shortcuts': [() => {
        print('shortcuts')
    }, ['<ctrl>question']],

    'app.open': [() => {
        const allFiles = new Gtk.FileFilter()
        allFiles.set_name(_('All Files'))
        allFiles.add_pattern('*')

        const epubFiles = new Gtk.FileFilter()
        epubFiles.set_name(_('E-book Files'))
        epubFiles.add_mime_type('application/epub+zip')
        kindleExts.forEach(x => epubFiles.add_pattern('*' + x))

        const dialog = new Gtk.FileChooserNative({ title: _('Open File') })
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
    'win.publisher-font': [state => {
        print(state)
        self._onStyleChange()
    }, /*gsettings.get_boolean*/],
    'win.justify': [state => {
        print(state)
        self._onStyleChange()
    }, true/*gsettings.get_boolean*/],
    'win.hyphenate': [state => {
        print(state)
        self._onStyleChange()
    }, true/*gsettings.get_boolean*/],
    'win.footnote': [state => {
        print(state)
    }, false/*gsettings.get_boolean*/],
    'win.unsafe': [state => {
        print(state)
    }, false/*gsettings.get_boolean*/],
    'win.devel': [state => {
        self._epub.webView.get_settings().enable_developer_extras = state
        self._epub.contextMenu = () => !state
    }, false/*gsettings.get_boolean*/]
})

const makeStringActions = self => ({
    'win.theme': [parameter => {
        self._onStyleChange()
    }, 'Sepia'],
    'win.layout': [parameter => {
        print(parameter)
    }, 'auto']
})

var FoliateWindow = GObject.registerClass({
    GTypeName: 'FoliateWindow',
    Template: 'resource:///com/github/johnfactotum/Foliate/window.ui',
    InternalChildren: [
        'headerBar', 'main',
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
    _open(fileName) {
        this._epub = new EpubView(fileName, this._onAction.bind(this))
        this._main.pack_start(this._epub.webView, true, true, 0)
    }
    _onAction(type, payload) {
        switch (type) {
            case 'book-ready':
                this._epub.get('book.package.metadata').then(metadata => {
                    this._headerBar.title = metadata.title
                    this._headerBar.subtitle = metadata.creator
                })
                this._epub.get('book.navigation.toc').then(toc => {
                    const store = this._tocTreeView.model
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
            case 'book-error':
                break

            case 'locations-generated':
                // falls through
            case 'locations-ready':
                this._locationStack.visible_child_name = 'loaded'
                break
            case 'update-location-scale':
                this._percentage = payload
                this._locationScale.set_value(payload)
                break

            case 'rendition-ready':
                ;[
                    'zoom-in',
                    'zoom-out',
                    'zoom-restore'
                ].forEach(action => this.lookup_action(action).enabled = true)
                this._applyZoomLevel(1)
                this._onStyleChange()
                break
            case 'relocated': {
                const {
                    atStart, atEnd, cfi, sectionHref,
                    chapter, chapterTotal, location, locationTotal, percentage
                } = payload
                this.lookup_action('go-prev').enabled = !atStart
                this.lookup_action('go-next').enabled = !atEnd

                const progress = Math.round(percentage * 100)
                this._locationLabel.label = progress + '%'

                print(chapter, chapterTotal)
                print(location, locationTotal)

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
                const { text, cfiRange, isSingle, language } = selection

                // position needs to be adjusted for zoom level
                const zoomLevel = this._epub.webView.zoom_level
                Object.keys(position).forEach(key =>
                    position[key] = position[key] * zoomLevel)

                const popover = this._selectionMenu
                popover.relative_to = this._epub.webView

                const setPosition = height =>
                    setPopoverPosition(popover, position, this, height)

                popover.connect('size-allocate', () =>
                    setPosition(popover.get_allocation().height))

                setPosition(200)
                popover.popup()
                popover.connect('closed', () => this._epub.run('clearSelection()'))
                break
            }
        }
    }
    _onTocRowActivated() {
        const store = this._tocTreeView.model
        const selection = this._tocTreeView.get_selection()
        const [, , iter] = selection.get_selected()
        const href = store.get_value(iter, 1)
        this._epub.run(`rendition.display("${href}")`)
        this._sideMenu.popdown()
    }
    _onlocationScaleChanged() {
        const value = this._locationScale.get_value()
        if (value !== this._percentage) this._epub.run(`goToPercentage(${value})`)
    }
    _applyZoomLevel(zoomLevel) {
        this._epub.webView.zoom_level = zoomLevel
        this._zoomRestoreButton.label = parseInt(zoomLevel * 100) + '%'
        this.lookup_action('zoom-restore').enabled = zoomLevel !== 1
        this.lookup_action('zoom-out').enabled = zoomLevel > 0.2
    }
    _onStyleChange() {
        this._applyStyle({
            brightness: this._brightnessScale.get_value(),
            theme: defaultThemes[this.lookup_action('theme').state.get_string()[0]],
            fontDesc: this._fontButton.font_desc,
            spacing: this._spacingButton.value,
            margins: this._marginsButton.value,
            publisherFont: this.lookup_action('publisher-font').state.get_boolean(),
            hyphenate: this.lookup_action('hyphenate').state.get_boolean(),
            justify: this.lookup_action('justify').state.get_boolean()
        })
    }
    // TODO: don't apply when rendition isn't ready
    _applyStyle(style) {
        const { brightness, theme, fontDesc, spacing, margins,
            publisherFont, hyphenate, justify } = style
        const { color, background, link, darkMode, invert } = theme
        Gtk.Settings.get_default().gtk_application_prefer_dark_theme = darkMode

        const fontFamily = fontDesc.get_family()
        const fontSizePt = fontDesc.get_size() / Pango.SCALE
        const fontSizePx = fontSizePt / 0.75
        const fontWeight = fontDesc.get_weight()
        const fontStyle = ['normal', 'italic', 'oblique'][fontDesc.get_style()]

        // Unfortunately, it appears that WebKitGTK doesn't support font-stretch
        /*const fontStretch = [
            'ultra-condensed', 'extra-condensed', 'condensed', 'semi-condensed', 'normal',
            'semi-expanded', 'expanded', 'extra-expanded', 'ultra-expanded'
        ][fontDesc.get_stretch()]*/

        const webViewSettings = this._epub.webView.get_settings()
        webViewSettings.serif_font_family = fontFamily
        webViewSettings.sans_serif_font_family = fontFamily
        webViewSettings.default_font_family = fontFamily
        webViewSettings.default_font_size = fontSizePx

        const filter = (invert ? 'invert(1) hue-rotate(180deg) ' : '')
            + `brightness(${brightness})`

        const themeName = publisherFont ? 'publisher-font' : 'custom-font'
        const styleScript = `
            document.body.style.margin = '0 ${margins}%'
            rendition.resize()

            document.documentElement.style.filter = '${filter}'
            document.body.style.color = '${color}'
            document.body.style.background = '${background}'

            rendition.themes.register('${themeName}', {
                '.${themeName}': {
                    'color': '${color}',
                    'background': '${background}',
                    ${publisherFont ? '' : `'font-family': '"${fontFamily}" !important',
                    'font-style': '${fontStyle}',
                    'font-weight': '${fontWeight}',`}
                    'font-size': '${fontSizePx}px !important',
                    'line-height': '${spacing} !important',
                    '-webkit-hyphens': '${hyphenate ? 'auto' : 'manual'}',
                    '-webkit-hyphenate-limit-before': 3,
                    '-webkit-hyphenate-limit-after': 2,
                    '-webkit-hyphenate-limit-lines': 2
                },
                '.${themeName} code, .${themeName} pre': {
                    '-webkit-hyphens': 'none'
                },
                ${publisherFont ? '' :
                `'.${themeName} *:not(code):not(pre):not(code *):not(pre *)': {
                    'font-family': '"${fontFamily}" !important'
                },`}
                'p': {
                    'text-align': '${justify ? 'justify' : 'inherit'}'
                },
                '.${themeName} a:link': { color: '${link}' }
            })
            rendition.themes.select('${themeName}')
        `
        this._epub.run(styleScript)
    }
})
