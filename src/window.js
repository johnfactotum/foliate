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

const { GObject, Gtk, Gio, GLib, Gdk, Pango } = imports.gi
const ngettext = imports.gettext.ngettext

const { markupEscape, execCommand, recursivelyDeleteDir } = imports.utils
const { EpubView } = imports.epubView

const settings = new Gio.Settings({ schema_id: pkg.name })

const mimetypes = {
    epub: 'application/epub+zip',
    mobi: 'application/x-mobipocket-ebook'
}

const highlightColors = ['yellow', 'orange', 'red', 'magenta', 'aqua', 'lime']

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
    const setPosition = height => {
        const { position: rectPosition, positionType } =
            makePopoverPosition(position, window, height)
        popover.position = positionType
        popover.pointing_to = new Gdk.Rectangle(rectPosition)
    }
    popover.connect('size-allocate', () =>
        setPosition(popover.get_allocation().height))

    setPosition(200)
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
    'win.selection-highlight': [async () => {
        const { cfi, text } = self._selection
        const color = 'yellow'
        self._epub.addAnnotation(cfi, color)
        self._selection.color = color

        const section = (await self._epub.getSectionFromCfi(cfi)).label
        const annotation = new Annotation({ cfi, color, section, text, note: '' })
        self._annotationsStore.append(annotation)
        self._annotationsMap.set(cfi, annotation)

        self._colorRadios[color].active = true
        self._noteTextView.buffer.text = ''
        self._showMenu(self._highlightMenu, false)
    }],
    'win.selection-unhighlight': [() => {
        const cfi = self._selection.cfi
        self._epub.removeAnnotation(cfi)
        const store = self._annotationsStore
        const n = store.get_n_items()
        for (let i = 0; i < n; i++) {
            if (store.get_item(i).cfi === cfi) {
                store.remove(i)
                break
            }
        }
        self._annotationsMap.delete(cfi)
        if (self._highlightMenu.visible) self._highlightMenu.popdown()
    }],
    'win.selection-dictionary': [() => {
        const { language, text, position } = self._selection
        self._showMenu(self._dictionaryMenu)
    }],
    'win.selection-find': [() => {
        const { text } = self._selection
        self._findEntry.text = text
        self._findEntry.emit('activate')
        self._findMenuButton.active = true
    }],

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
    'win.highlight-color': [color => {
        if (self._colorRadios[color].active && self._selection.color !== color) {
            const cfi = self._selection.cfi
            self._selection.color = color
            self._epub.addAnnotation(cfi, color)
            const annotation = self._annotationsMap.get(cfi)
            annotation.set_property('color', color)
        }
    }, highlightColors[0]],
    'win.theme': [() => self._onStyleChange(), 'Sepia'],
    'win.layout': [layout => {
        self._isLoading = true
        self._epub.layout = layout
    }, 'auto']
})

const Annotation = GObject.registerClass({
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
}, class Annotation extends GObject.Object {})

const AnnotationRow = GObject.registerClass({
    GTypeName: 'AnnotationRow',
    Template: 'resource:///com/github/johnfactotum/Foliate/annotationRow.ui',
    InternalChildren: [
        'annotationSection', 'annotationText', 'annotationNote'
    ]
}, class AnnotationRow extends Gtk.ListBoxRow {
    _init(annotation) {
        super._init()
        this.annotation = annotation

        this._annotationText.label = annotation.text
        this._annotationSection.label = annotation.section

        this._applyColor()
        annotation.connect('notify::color', this._applyColor.bind(this))

        this._applyNote()
        annotation.connect('notify::note', this._applyNote.bind(this))
    }
    _applyNote() {
        const note = this.annotation.note
        this._annotationNote.label = note.trim().replace(/\n/g, ' ')
        this._annotationNote.visible = Boolean(note)
    }
    _applyColor() {
        const cssProvider = new Gtk.CssProvider()
        cssProvider.load_from_data(`
            label {
                border-left: 7px solid ${this.annotation.color};
                padding-left: 15px;
            }`)
        const styleContext = this._annotationText.get_style_context()
        styleContext
            .add_provider(cssProvider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION)
    }
})

var FoliateWindow = GObject.registerClass({
    GTypeName: 'FoliateWindow',
    Template: 'resource:///com/github/johnfactotum/Foliate/window.ui',
    InternalChildren: [
        'headerBar', 'mainOverlay', 'mainBox', 'contentBox',

        'sideMenuButton', 'sideMenu', 'tocTreeView',

        'annotationsListBox',

        'findMenuButton',
        'findMenu', 'findEntry', 'findScrolledWindow', 'findTreeView',

        'mainMenuButton',
        'zoomRestoreButton', 'fullscreenButton', 'brightnessScale',
        'fontButton', 'spacingButton', 'marginsButton', 'themeBox',

        'navbar', 'locationStack', 'locationLabel', 'locationScale',
        'timeInBook', 'timeInChapter',
        'sectionEntry', 'locationEntry', 'cfiEntry',
        'sectionTotal', 'locationTotal',

        'selectionMenu', 'dictionaryMenu',
        'highlightMenu', 'highlightColorsBox', 'noteTextView'
    ]
}, class FoliateWindow extends Gtk.ApplicationWindow {
    _init(application) {
        super._init({ application })

        this._annotationsMap = new Map()
        this._annotationsStore = new Gio.ListStore()
        this._annotationsListBox.bind_model(this._annotationsStore, annotation => {
            const row = new AnnotationRow(annotation)
            return row
        })
        this._annotationsListBox.set_header_func((row) => {
            if (row.get_index()) row.set_header(new Gtk.Separator())
        })
        this._annotationsListBox.connect('row-activated', (_, row) => {
            this._epub.goTo(row.annotation.cfi)
            this._sideMenu.popdown()
        })

        this._noteTextView.buffer.connect('changed', () => {
            const annotation = this._annotationsMap.get(this._selection.cfi)
            annotation.set_property('note', this._noteTextView.buffer.text)
        })

        const column = this._findTreeView.get_column(0)
        column.get_area().orientation = Gtk.Orientation.VERTICAL

        this._colorRadios = {}
        const colorRadios = highlightColors.map((color, i) => {
            const radio = new Gtk.RadioButton({
                visible: true,
                tooltip_text: color,
                action_name: 'win.highlight-color',
                action_target: new GLib.Variant('s', color)
            })
            const cssProvider = new Gtk.CssProvider()
            cssProvider.load_from_data(`
                .color-button {
                    padding: 0;
                }
                .color-button radio {
                    margin: 0;
                    padding: 6px;
                    background: ${color};
                }`)
            const styleContext = radio.get_style_context()
            styleContext.add_class('color-button')
            styleContext
                .add_provider(cssProvider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION)

            this._highlightColorsBox.pack_start(radio, false, true, 0)
            this._colorRadios[color] = radio
            return radio
        }).reduce((a, b) => (b.join_group(a), a))

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
                })
                this._epub.toc.then(toc => {
                    const store = this._tocTreeView.model
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
                    section, sectionTotal, location, locationTotal, percentage,
                    timeInBook, timeInChapter
                } = payload
                this.lookup_action('go-prev').enabled = !atStart
                this.lookup_action('go-next').enabled = !atEnd

                this._locationScale.set_value(percentage)

                const progress = Math.round(percentage * 100)
                this._locationLabel.label = progress + '%'

                const makeTimeLabel = n => n < 60
                    ? ngettext('%d minute', '%d minutes').format(Math.round(n))
                    : ngettext('%d hour', '%d hours').format(Math.round(n / 60))

                this._timeInBook.label = makeTimeLabel(timeInBook)
                this._timeInChapter.label = makeTimeLabel(timeInChapter)
                this._sectionEntry.text = (section + 1).toString()
                this._locationEntry.text = (location + 1).toString()
                this._cfiEntry.text = cfi
                this._sectionTotal.label = _('of %d').format(sectionTotal)
                this._locationTotal.label = _('of %d').format(locationTotal + 1)

                // select toc item
                const view = this._tocTreeView
                const store = view.model
                const selection = view.get_selection()
                let [, iter] = store.get_iter_first()
                loop:
                while (true) {
                    const value = store.get_value(iter, 0)
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

            case 'find-results': {
                const { q, results } = payload
                const store = this._findTreeView.model
                store.clear()
                if (!results.length)
                    this._findEntry.get_style_context().add_class('error')
                else {
                    const regex = new RegExp(markupEscape(q), 'ig')
                    results.forEach(({ cfi, excerpt, section }) => {
                        const newIter = store.append()
                        const text = markupEscape(excerpt.trim().replace(/\n/g, ' '))
                        const markup = text.replace(regex, `<b>${regex.exec(text)[0]}</b>`)
                        const sectionMarkup = `<span alpha="50%" size="smaller">${
                            markupEscape(section)}</span>`
                        store.set(newIter, [0, 1, 2], [cfi, markup, sectionMarkup])
                    })
                    this._findScrolledWindow.show()
                }
                break
            }

            case 'selection': {
                this._selection = payload
                this._selection.text = this._selection.text.trim().replace(/\n/g, ' ')
                const position = this._selection.position

                // position needs to be adjusted for zoom level
                const zoomLevel = this._epub.zoomLevel
                Object.keys(position).forEach(key =>
                    position[key] = position[key] * zoomLevel)

                if (this._selection.text.split(' ').length === 1)
                    this._showMenu(this._selectionMenu)
                else
                    this._showMenu(this._selectionMenu)
                break
            }
            case 'highlight-menu':
                this._selection = payload
                const annotation = this._annotationsMap.get(this._selection.cfi)
                this._colorRadios[annotation.color].active = true
                this._noteTextView.buffer.text = annotation.note
                this._showMenu(this._highlightMenu, false)
                break
        }
    }
    _showSelectionMenu() {
        this._showMenu(this._selectionMenu)
    }
    _showMenu(popover, select = true) {
        popover.relative_to = this._epub.widget
        setPopoverPosition(popover, this._selection.position, this, 200)
        popover.popup()
        if (select) this._epub.selectByCfi(this._selection.cfi)
        else this._clearSelection()
    }
    _clearSelection() {
        this._epub.clearSelection()
    }
    _onFindEntryActivate() {
        const text = this._findEntry.text
        this._epub.find(text)
    }
    _onFindEntryChanged() {
        this._findEntry.get_style_context().remove_class('error')
        if (!this._findEntry.text) {
            this._epub.clearFind()
            this._findScrolledWindow.hide()
        }
    }
    _onFindRowActivated() {
        const store = this._findTreeView.model
        const selection = this._findTreeView.get_selection()
        const [, , iter] = selection.get_selected()
        const href = store.get_value(iter, 0)
        this._epub.goTo(href)
        this._findMenu.popdown()
    }
    _onTocRowActivated() {
        const store = this._tocTreeView.model
        const selection = this._tocTreeView.get_selection()
        const [, , iter] = selection.get_selected()
        const href = store.get_value(iter, 0)
        this._epub.goTo(href)
        this._sideMenu.popdown()
    }
    _onSectionEntryActivate() {
        const x = parseInt(this._sectionEntry.text) - 1
        this._epub.goTo(x)
    }
    _onLocationEntryActivate() {
        const x = parseInt(this._locationEntry.text) - 1
        this._epub.goToLocation(x)
    }
    _onCfiEntryActivate() {
        this._epub.goTo(this._cfiEntry.text)
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
