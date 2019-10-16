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

const { GObject, Gtk, Gio, GLib, Gdk } = imports.gi
const ngettext = imports.gettext.ngettext

const { execCommand, recursivelyDeleteDir } = imports.utils
const { EpubView, EpubViewSettings, EpubViewAnnotation } = imports.epubView

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
    [_('Gruvbox Light')]: {
        color: '#3c3836', background: '#fbf1c7', link: '#076678',
        darkMode: false, invert: false
    },
    [_('Gruvbox Dark')]: {
        color: '#ebdbb2', background: '#282828', link: '#83a598',
        darkMode: true, invert: false
    },
    [_('Nord')]: {
        color: '#d8dee9', background: '#2e3440', link: '#88c0d0',
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

    setPosition(height)
}

const makeActions = self => ({
    'win.go-prev': [() => self._epub.prev(), ['p']],
    'win.go-next': [() => self._epub.next(), ['n']],
    'win.go-back': [() => self._epub.goBack(), ['<alt>p', '<alt>Left']],

    'win.zoom-in': [() =>
        settings.set_double('zoom-level', settings.get_double('zoom-level') + 0.1),
    ['plus', 'equal', '<ctrl>plus', '<ctrl>equal']],
    'win.zoom-out': [() =>
        settings.set_double('zoom-level', settings.get_double('zoom-level') - 0.1),
    ['minus', '<ctrl>minus']],
    'win.zoom-restore': [() => settings.set_double('zoom-level', 1),
        ['1', '<ctrl>1']],

    'win.selection-copy': [() => Gtk.Clipboard
        .get_default(Gdk.Display.get_default())
        .set_text(self._epub.selection.text, -1),
    ['<ctrl>c']],
    'win.selection-highlight': [() => {
        const { cfi, text } = self._epub.selection
        const color = 'yellow'
        const annotation = new EpubViewAnnotation({ cfi, color, text, note: '' })
        self._epub.addAnnotation(annotation)
        self._epub.emit('highlight-menu')
    }],
    'win.selection-unhighlight': [() => {
        const annotation = self._epub.annotation
        self._epub.removeAnnotation(annotation)
        if (self._highlightMenu.visible) self._highlightMenu.popdown()
    }],
    'win.selection-dictionary': [() => {
        const { language, text, position } = self._epub.selection
        self._showMenu(self._dictionaryMenu)
    }],
    'win.selection-find': [() => {
        const { text } = self._epub.selection
        self._findEntry.text = text
        self._findEntry.emit('activate')
        self._findMenuButton.active = true
    }],

    'win.side-menu': [() =>
        self._sideMenuButton.active = !self._sideMenuButton.active, ['F9']],
    'win.find-menu': [() =>
        self._findMenuButton.active = !self._findMenuButton.active, ['<ctrl>f', 'slash']],
    'win.main-menu': [() =>
        self._mainMenuButton.active = !self._mainMenuButton.active, ['F10']],

    'win.fullscreen': [() =>
        self._isFullscreen ? self.unfullscreen() : self.fullscreen(), ['F11']],
    'win.unfullscreen': [() => self.unfullscreen(), ['Escape']],

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
            self.open(dialog.get_filename())
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
    'app.quit': [() => self.application.get_windows()
        .forEach(window => window.close()), ['<ctrl>q']],
})

const makeStringActions = self => ({
    'win.highlight-color': [color => {
        const annotation = self._epub.annotation
        if (self._colorRadios[color].active && color !== annotation.color)
            annotation.set_property('color', color)
    }, highlightColors[0]],
    'win.theme': [name => {
        const theme = defaultThemes[name]
        self._epubSettings.set_property('fg-color', theme.color)
        self._epubSettings.set_property('bg-color', theme.background)
        self._epubSettings.set_property('link-color', theme.link)
        settings.set_boolean('prefer-dark-theme', theme.darkMode)
    }, '']
})

const AnnotationRow = GObject.registerClass({
    GTypeName: 'FoliateAnnotationRow',
    Template: 'resource:///com/github/johnfactotum/Foliate/annotationRow.ui',
    InternalChildren: [
        'annotationSection', 'annotationText', 'annotationNote'
    ]
}, class AnnotationRow extends Gtk.ListBoxRow {
    _init(annotation, epubView) {
        super._init()
        this.annotation = annotation

        this._annotationText.label = annotation.text
        epubView.getSectionFromCfi(annotation.cfi).then(section =>
            this._annotationSection.label = section.label)

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
        'fontButton', 'spacingButton', 'marginButton', 'themeBox',

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

        const column = this._findTreeView.get_column(0)
        column.get_area().orientation = Gtk.Orientation.VERTICAL

        this._annotationsListBox.set_header_func((row) => {
            if (row.get_index()) row.set_header(new Gtk.Separator())
        })

        this._colorRadios = {}
        highlightColors.map(color => {
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

        this._noteTextView.buffer.connect('changed', () => {
            const annotation = this._epub.annotation
            annotation.set_property('note', this._noteTextView.buffer.text)
        })

        this._epubSettings = new EpubViewSettings()

        // bind settings to EpubView
        settings.bind('zoom-level', this._epubSettings, 'zoom-level', Gio.SettingsBindFlags.DEFAULT)
        settings.bind('font', this._epubSettings, 'font', Gio.SettingsBindFlags.DEFAULT)
        settings.bind('spacing', this._epubSettings, 'spacing', Gio.SettingsBindFlags.DEFAULT)
        settings.bind('margin', this._epubSettings, 'margin', Gio.SettingsBindFlags.DEFAULT)
        settings.bind('use-publisher-font', this._epubSettings, 'use-publisher-font', Gio.SettingsBindFlags.DEFAULT)
        settings.bind('justify', this._epubSettings, 'justify', Gio.SettingsBindFlags.DEFAULT)
        settings.bind('hyphenate', this._epubSettings, 'hyphenate', Gio.SettingsBindFlags.DEFAULT)
        settings.bind('fg-color', this._epubSettings, 'fg-color', Gio.SettingsBindFlags.DEFAULT)
        settings.bind('bg-color', this._epubSettings, 'bg-color', Gio.SettingsBindFlags.DEFAULT)
        settings.bind('link-color', this._epubSettings, 'link-color', Gio.SettingsBindFlags.DEFAULT)
        settings.bind('brightness', this._epubSettings, 'brightness', Gio.SettingsBindFlags.DEFAULT)
        settings.bind('enable-footnote', this._epubSettings, 'enable-footnote', Gio.SettingsBindFlags.DEFAULT)
        settings.bind('enable-devtools', this._epubSettings, 'enable-devtools', Gio.SettingsBindFlags.DEFAULT)
        settings.bind('allow-unsafe', this._epubSettings, 'allow-unsafe', Gio.SettingsBindFlags.DEFAULT)
        settings.bind('layout', this._epubSettings, 'layout', Gio.SettingsBindFlags.DEFAULT)

        // bind settings to UI
        settings.bind('font', this._fontButton, 'font', Gio.SettingsBindFlags.DEFAULT)
        settings.bind('spacing', this._spacingButton, 'value', Gio.SettingsBindFlags.DEFAULT)
        settings.bind('margin', this._marginButton, 'value', Gio.SettingsBindFlags.DEFAULT)
        settings.bind('brightness', this._brightnessScale.adjustment, 'value', Gio.SettingsBindFlags.DEFAULT)
        this.add_action(settings.create_action('use-publisher-font'))
        this.add_action(settings.create_action('justify'))
        this.add_action(settings.create_action('hyphenate'))
        this.add_action(settings.create_action('enable-footnote'))
        this.add_action(settings.create_action('enable-devtools'))
        this.add_action(settings.create_action('allow-unsafe'))
        this.add_action(settings.create_action('layout'))

        settings.bind('show-navbar', this._navbar, 'visible', Gio.SettingsBindFlags.DEFAULT)
        this.add_action(settings.create_action('show-navbar'))
        this.application.set_accels_for_action('win.show-navbar', ['<ctrl>p'])

        settings.bind('prefer-dark-theme', Gtk.Settings.get_default(),
            'gtk-application-prefer-dark-theme', Gio.SettingsBindFlags.DEFAULT)

        const actions = makeActions(this)
        Object.keys(actions).forEach(action => {
            const [context, name] = action.split('.')
            const [func, accels] = actions[action]
            this._addAction(context, name, func, accels)
        })
        const stringActions = makeStringActions(this)
        Object.keys(stringActions).forEach(action => {
            const [context, name] = action.split('.')
            const [func, defaultValue] = stringActions[action]
            this._addStringAction(context, name, func, defaultValue)
        })

        const updateZoom = () => {
            const zoomLevel = settings.get_double('zoom-level')
            this._zoomRestoreButton.label = parseInt(zoomLevel * 100) + '%'
            this.lookup_action('zoom-restore').enabled = zoomLevel !== 1
            this.lookup_action('zoom-out').enabled = zoomLevel > 0.2
            this.lookup_action('zoom-in').enabled = zoomLevel < 4
        }
        updateZoom()
        settings.connect('changed::zoom-level', () => updateZoom())
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
    set _loading(state) {
        this._mainBox.opacity = state ? 0 : 1
        this._mainOverlay.visible = state
    }
    open(fileName, realFileName, inputType = 'epub') {
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
                    this.open(mobi8, fileName, 'directory')
                else this.open(dir + '/mobi7/content.opf', fileName, 'opf')
            })
            return
        }

        if (this._epub) this._epub.widget.destroy()
        this._epub = new EpubView({
            file: fileName,
            inputType: inputType,
            settings: this._epubSettings
        })
        this._contentBox.pack_start(this._epub.widget, true, true, 0)

        this._epub.connect('book-displayed', () => this._loading = false)
        this._epub.connect('book-loading', () => this._loading = true)
        this._epub.connect('book-error', () =>
            this._mainOverlay.visible_child_name = 'error')
        this._epub.connect('metadata', () =>
            this.title = this._epub.metadata.title)
        this._epub.connect('locations-ready', () =>
            this._locationStack.visible_child_name = 'loaded')
        this._epub.connect('relocated', () => {
            const {
                atStart, atEnd, cfi, sectionHref,
                section, sectionTotal, location, locationTotal, percentage,
                timeInBook, timeInChapter
            } = this._epub.location
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
            let iter = store.get_iter_first()[1]
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
        })
        this._epub.connect('find-results', () => {
            if (!this._epub.findResults.get_iter_first()[0])
                this._findEntry.get_style_context().add_class('error')
            this._findScrolledWindow.show()
        })
        this._epub.connect('selection', () => {
            this._showSelectionMenu()
        })
        this._epub.connect('highlight-menu', () => {
            const annotation = this._epub.annotation
            this._noteTextView.buffer.text = annotation.note
            this._showMenu(this._highlightMenu, false)
            this._colorRadios[annotation.color].active = true
        })

        this._tocTreeView.model = this._epub.toc
        this._findTreeView.model = this._epub.findResults

        this._annotationsListBox.bind_model(this._epub.annotations, annotation =>
            new AnnotationRow(annotation, this._epub))
        this._annotationsListBox.connect('row-activated', (_, row) => {
            this._epub.goTo(row.annotation.cfi)
            this._sideMenu.popdown()
        })
    }
    _showSelectionMenu() {
        this._showMenu(this._selectionMenu)
    }
    _showMenu(popover, select = true) {
        popover.relative_to = this._epub.widget
        setPopoverPosition(popover, this._epub.selection.position, this, 200)
        popover.popup()
        if (select) this._epub.selectByCfi(this._epub.selection.cfi)
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
})
