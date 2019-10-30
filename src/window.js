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

const { execCommand, recursivelyDeleteDir, isExternalURL, invertColor } = imports.utils
const { EpubView, EpubViewSettings } = imports.epubView

const settings = new Gio.Settings({ schema_id: pkg.name })
const windowState = new Gio.Settings({ schema_id: pkg.name + '.window-state' })

const mimetypes = {
    epub: 'application/epub+zip',
    mobi: 'application/x-mobipocket-ebook'
}

const highlightColors = ['yellow', 'orange', 'red', 'magenta', 'aqua', 'lime']

const Theme = GObject.registerClass({
    GTypeName: 'FoliateTheme',
    Properties: {
        name:
            GObject.ParamSpec.string('name', 'name', 'name',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, 'black'),
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
        'dark-mode':
            GObject.ParamSpec.boolean('dark-mode', 'dark-mode', 'dark-mode',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, false),
    }
}, class Theme extends GObject.Object {})

const ThemeRow = GObject.registerClass({
    GTypeName: 'FoliateThemeRow',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/themeRow.ui',
    InternalChildren: ['label']
}, class ThemeRow extends Gtk.ListBoxRow {
    _init(theme) {
        super._init()
        this.theme = theme
        theme.bind_property('name', this._label, 'label',
            GObject.BindingFlags.DEFAULT | GObject.BindingFlags.SYNC_CREATE)

        this._applyColor()
        theme.connect('notify::fg_color', this._applyColor.bind(this))
        theme.connect('notify::bg_color', this._applyColor.bind(this))
        theme.connect('notify::invert', this._applyColor.bind(this))
    }
    _applyColor() {
        const { fg_color, bg_color, invert } = this.theme
        const cssProvider = new Gtk.CssProvider()
        cssProvider.load_from_data(`
            row {
                color: ${invert ? invertColor(fg_color) : fg_color};
                background: ${invert ? invertColor(bg_color) : bg_color};
            }`)
        const styleContext = this.get_style_context()
        styleContext
            .add_provider(cssProvider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION)
    }
})

const defaultThemes = [
    {
        name: _('Light'), dark_mode: false, invert: false,
        fg_color: '#000', bg_color: '#fff', link_color: 'blue',
    },
    {
        name: _('Sepia'), dark_mode: false, invert: false,
        fg_color: '#5b4636', bg_color: '#efe7dd', link_color: 'darkcyan',
    },
    {
        name: _('Gray'), dark_mode: true, invert: false,
        fg_color: '#ccc', bg_color: '#555', link_color: 'cyan',
    },
    {
        name: _('Dark'), dark_mode: true, invert: false,
        fg_color: '#ddd', bg_color: '#292929', link_color: 'cyan',
    },
    {
        name: _('Invert'), dark_mode: true, invert: true,
        fg_color: '#000', bg_color: '#fff', link_color: 'blue',
    },
    {
        name: _('Solarized Light'), dark_mode: false, invert: false,
        fg_color: '#586e75', bg_color: '#fdf6e3', link_color: '#268bd2',
    },
    {
        name: _('Solarized Dark'), dark_mode: true, invert: false,
        fg_color: '#93a1a1', bg_color: '#002b36', link_color: '#268bd2',
    },
    {
        name: _('Gruvbox Light'), dark_mode: false, invert: false,
        fg_color: '#3c3836', bg_color: '#fbf1c7', link_color: '#076678',
    },
    {
        name: _('Gruvbox Dark'), dark_mode: true, invert: false,
        fg_color: '#ebdbb2', bg_color: '#282828', link_color: '#83a598',
    },
    {
        name: _('Nord'), dark_mode: true, invert: false,
        fg_color: '#d8dee9', bg_color: '#2e3440', link_color: '#88c0d0',
    }
]

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

    'win.bookmark': [() => {
        if (self._epub.hasBookmark()) self._epub.removeBookmark()
        else self._epub.addBookmark()
    }, ['<ctrl>d']],

    'win.selection-copy': [() => {
        Gtk.Clipboard.get_default(Gdk.Display.get_default())
            .set_text(self._epub.selection.text, -1)
        self._selectionMenu.popdown()
    }, ['<ctrl>c']],
    'win.selection-highlight': [() => {
        const { cfi, text } = self._epub.selection
        const color = 'yellow'
        self._epub.addAnnotation({ cfi, color, text, note: '' })
        self._epub.emit('highlight-menu')
    }],
    'win.selection-unhighlight': [() => {
        const annotation = self._epub.annotation
        self._epub.removeAnnotation(annotation)
        if (self._highlightMenu.visible) self._highlightMenu.popdown()
    }],
    'win.selection-dictionary': [() => {
        const { language, text, position } = self._epub.selection
        self._showPopover(self._dictionaryMenu)
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

    'win.navbar': [() =>
        self._mainOverlay.toggleNavBar(), ['<ctrl>p']],

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
    }, highlightColors[0]]
})

const AnnotationRow = GObject.registerClass({
    GTypeName: 'FoliateAnnotationRow',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/annotationRow.ui',
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

const BookmarkRow = GObject.registerClass({
    GTypeName: 'FoliateBookmarkRow',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/bookmarkRow.ui',
    InternalChildren: [
        'bookmarkSection', 'bookmarkText'
    ]
}, class BookmarkRow extends Gtk.ListBoxRow {
    _init(bookmark, epubView) {
        super._init()
        this.bookmark = bookmark
        this._epub = epubView

        this._bookmarkText.label = bookmark.cfi
        this._epub.getSectionFromCfi(bookmark.cfi).then(section =>
            this._bookmarkSection.label = section.label)
    }
    _remove() {
        this._epub.removeBookmark(this.bookmark.cfi)
    }
})

const ContentsStack = GObject.registerClass({
    GTypeName: 'FoliateContentsStack',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/contentsStack.ui',
    InternalChildren: [
        'tocTreeView',
        'annotationsStack', 'annotationsListBox',
        'bookmarksStack', 'bookmarksListBox', 'bookmarkButton'
    ],
    Signals: {
        'row-activated': { flags: GObject.SignalFlags.RUN_FIRST }
    }
}, class ContentsStack extends Gtk.Stack {
    _init() {
        super._init()

        this._annotationsListBox.set_header_func((row) => {
            if (row.get_index()) row.set_header(new Gtk.Separator())
        })
        this._bookmarksListBox.set_header_func((row) => {
            if (row.get_index()) row.set_header(new Gtk.Separator())
        })
    }
    set epub(epub) {
        this._epub = epub
        this._tocTreeView.model = this._epub.toc

        this._epub.connect('data-ready', (_, annotations, bookmarks) => {
            this._annotationsStack.visible_child_name =
                annotations.get_n_items() ? 'main' : 'empty'
            annotations.connect('items-changed', () => {
                this._annotationsStack.visible_child_name =
                    annotations.get_n_items() ? 'main' : 'empty'
            })
            this._annotationsListBox.bind_model(annotations, annotation =>
                new AnnotationRow(annotation, this._epub))

            this._bookmarksStack.visible_child_name =
                bookmarks.get_n_items() ? 'main' : 'empty'
            bookmarks.connect('items-changed', () => {
                this._bookmarksStack.visible_child_name =
                    bookmarks.get_n_items() ? 'main' : 'empty'
                this._updateBookmarkButton()
            })
            this._bookmarksListBox.bind_model(bookmarks, bookmark =>
                new BookmarkRow(bookmark, this._epub))
        })
        this._epub.connect('relocated', () => {
            this._updateBookmarkButton()

            // select toc item
            const { sectionHref } = this._epub.location
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
    }
    _onTocRowActivated() {
        const store = this._tocTreeView.model
        const selection = this._tocTreeView.get_selection()
        const [, , iter] = selection.get_selected()
        const href = store.get_value(iter, 0)
        this._epub.goTo(href)
        this.emit('row-activated')
    }
    _onAnnotationRowActivated(_, row) {
        this._epub.goTo(row.annotation.cfi)
        this.emit('row-activated')
    }
    _onBookmarkRowActivated(_, row) {
        this._epub.goTo(row.bookmark.cfi)
        this.emit('row-activated')
    }
    _updateBookmarkButton() {
        if (this._epub.hasBookmark()) {
            this._bookmarkButton.tooltip_text = _('Remove current location')
            this._bookmarkButton.get_child().icon_name = 'edit-delete-symbolic'
        } else {
            this._bookmarkButton.tooltip_text = _('Bookmark current location')
            this._bookmarkButton.get_child().icon_name = 'bookmark-new-symbolic'
        }
    }
})

const FindBox = GObject.registerClass({
    GTypeName: 'FoliateFindBox',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/findBox.ui',
    InternalChildren: ['findEntry', 'findScrolledWindow', 'findTreeView'],
    Signals: {
        'row-activated': { flags: GObject.SignalFlags.RUN_FIRST }
    }
}, class FindBox extends Gtk.Box {
    _init() {
        super._init()
        const column = this._findTreeView.get_column(0)
        column.get_area().orientation = Gtk.Orientation.VERTICAL
    }
    set epub(epub) {
        this._epub = epub
        this._findTreeView.model = this._epub.findResults
        this._epub.connect('find-results', () => {
            if (!this._epub.findResults.get_iter_first()[0])
                this._findEntry.get_style_context().add_class('error')
            this._findScrolledWindow.show()
        })
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
        const cfi = store.get_value(iter, 0)
        this._epub.goToFindResult(cfi)
        this.emit('row-activated')
    }
})

const FootnotePopover = GObject.registerClass({
    GTypeName: 'FoliateFootnotePopover',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/footnotePopover.ui',
    InternalChildren: [
        'footnoteLabel', 'controls', 'separator'
    ]
}, class FootnotePopover extends Gtk.Popover {
    _init(footnote, link, epubView) {
        super._init()
        this._link = link
        this._epub = epubView
        this._footnoteLabel.label = footnote
        if (!link) {
            this._controls.hide()
            this._separator.hide()
        }
    }
    popup() {
        super.popup()
        this._footnoteLabel.select_region(-1, -1)
    }
    _goToLinkedLocation() {
        this._epub.goTo(this._link)
        this.popdown()
    }
    _activateLink(_, uri) {
        if (!isExternalURL(uri)) {
            this._epub.goTo(uri)
            this.popdown()
            return true
        }
    }
})

const SelectionPopover = GObject.registerClass({
    GTypeName: 'FoliateSelectionPopover',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/selectionPopover.ui',
    InternalChildren: ['selectionStack']
}, class SelectionPopover extends Gtk.Popover {
    popup() {
        super.popup()
        this._showMain()
    }
    _showMore() {
        this._selectionStack.transition_type = Gtk.StackTransitionType.SLIDE_LEFT
        this._selectionStack.visible_child_name = 'more'
    }
    _showMain() {
        this._selectionStack.transition_type = Gtk.StackTransitionType.SLIDE_RIGHT
        this._selectionStack.visible_child_name = 'main'
    }
})

const MainMenu = GObject.registerClass({
    GTypeName: 'FoliateMainMenu',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/mainMenu.ui',
    Children: [
        'brightnessScale', 'fontButton', 'spacingButton', 'marginButton',
        'themesListBox',
    ],
    InternalChildren: ['zoomRestoreButton', 'fullscreenButton']
}, class MainMenu extends Gtk.PopoverMenu {
    set zoomLevel(zoomLevel) {
        this._zoomRestoreButton.label = parseInt(zoomLevel * 100) + '%'
    }
    set fullscreen(isFullscreen) {
        const fullscreenImage = this._fullscreenButton.get_child()
        if (isFullscreen) {
            fullscreenImage.icon_name = 'view-restore-symbolic'
            this._fullscreenButton.tooltip_text = _('Leave fullscreen')
        } else {
            fullscreenImage.icon_name = 'view-fullscreen-symbolic'
            this._fullscreenButton.tooltip_text = _('Fullscreen')
        }
    }
})

const NavBar = GObject.registerClass({
    GTypeName: 'FoliateNavBar',
    CssName: 'toolbar',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/navBar.ui',
    InternalChildren: [
        'locationStack', 'locationLabel', 'locationScale',
        'timeInBook', 'timeInChapter',
        'sectionEntry', 'locationEntry', 'cfiEntry',
        'sectionTotal', 'locationTotal',
    ]
}, class NavBar extends Gtk.Box {
    set epub(epub) {
        this._epub = epub
        this._epub.connect('locations-ready', () => {
            this._epub.sectionMarks.then(sectionMarks => {
                this._setSectionMarks(sectionMarks)
                this._loading = false
            })
        })
        this._epub.connect('book-loading', () => this._loading = true)
        this._epub.connect('relocated', () => this._update())
    }
    set _loading(loading) {
        this._locationStack.visible_child_name = loading ? 'loading' : 'loaded'
    }
    _setSectionMarks(sectionMarks) {
        this._locationScale.clear_marks()
        if (sectionMarks.length < 60) sectionMarks.forEach(x =>
            this._locationScale.add_mark(x, Gtk.PositionType.TOP, null))
    }
    _update() {
        const {
            cfi, section, sectionTotal, location, locationTotal, percentage,
            timeInBook, timeInChapter,
        } = this._epub.location

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
    _onSizeAllocate() {
        const narrow = this.get_allocation().width < 500
        this._locationScale.visible = !narrow
    }
})

const MainOverlay = GObject.registerClass({
    GTypeName: 'FoliateMainOverlay',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/mainOverlay.ui',
    InternalChildren: [
        'overlayStack', 'mainBox', 'contentBox',
        'navBar', 'navBarRevealer', 'prevButtonRevealer', 'nextButtonRevealer'
    ]
}, class MainOverlay extends Gtk.Overlay {
    _init() {
        super._init()
        this._navBarRevealer.connect('notify::child-revealed', () => {
            if (!this._navBarRevealer.child_revealed)
                this._navBarRevealer.visible = false
        })
        this._prevButtonRevealer.connect('notify::child-revealed', () => {
            if (!this._prevButtonRevealer.child_revealed)
                this._prevButtonRevealer.visible = false
        })
        this._nextButtonRevealer.connect('notify::child-revealed', () => {
            if (!this._nextButtonRevealer.child_revealed)
                this._nextButtonRevealer.visible = false
        })
    }
    set epub(epub) {
        this._epub = epub
        this._navBar.epub = this._epub
        this._contentBox.pack_start(this._epub.widget, true, true, 0)

        this._epub.connect('book-displayed', () => this._setStatus('loaded'))
        this._epub.connect('book-loading', () => this._setStatus('loading'))
        this._epub.connect('book-error', () => this._setStatus('error'))
    }
    _setStatus(status) {
        const loaded = status === 'loaded'
        this._mainBox.opacity = loaded ? 1 : 0
        this._overlayStack.visible = !loaded
        if (!loaded) this._overlayStack.visible_child_name = status
    }
    toggleNavBar() {
        const visible = this._navBarRevealer.visible
        if (!visible) {
            this._navBarRevealer.visible = true
            this._prevButtonRevealer.visible = true
            this._nextButtonRevealer.visible = true
        }
        this._navBarRevealer.reveal_child = !visible
        this._prevButtonRevealer.reveal_child = !visible
        this._nextButtonRevealer.reveal_child = !visible
    }
    skeuomorph(enabled) {
        if (!enabled) return this._contentBox.get_style_context()
            .remove_class('skeuomorph-page')

        const cssProvider = new Gtk.CssProvider()
        const invert = settings.get_boolean('invert') ? invertColor : (x => x)
        const bgColor = invert(settings.get_string('bg-color'))
        const shadowColor = invert('rgba(0, 0, 0, 0.2)')
        cssProvider.load_from_data(`
            .skeuomorph-page {
                margin: 12px 24px;
                box-shadow:
                    -26px 0 0 -14px ${shadowColor},
                    -26px 0 0 -15px ${bgColor},

                    26px 0 0 -14px ${shadowColor},
                    26px 0 0 -15px ${bgColor},

                    -18px 0 0 -9px ${shadowColor},
                    -18px 0 0 -10px ${bgColor},

                    18px 0 0 -9px ${shadowColor},
                    18px 0 0 -10px ${bgColor},

                    -10px 0 0 -4px ${shadowColor},
                    -10px 0 0 -5px ${bgColor},

                    10px 0 0 -4px ${shadowColor},
                    10px 0 0 -5px ${bgColor},

                    0 0 15px 5px ${shadowColor},
                    0 0 0 1px ${shadowColor};
            }`)
        const styleContext = this._contentBox.get_style_context()
        styleContext.add_class('skeuomorph-page')
        styleContext
            .add_provider(cssProvider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION)
    }
})

var FoliateWindow = GObject.registerClass({
    GTypeName: 'FoliateWindow',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/window.ui',
    InternalChildren: [
        'headerBar',
        'sideMenuButton', 'sideMenu', 'contentsStack',
        'findMenuButton', 'findMenu', 'findBox',
        'mainMenuButton',

        'dictionaryMenu',
        'highlightMenu', 'highlightColorsBox', 'noteTextView'
    ]
}, class FoliateWindow extends Gtk.ApplicationWindow {
    _init(application) {
        super._init({ application })

        this._buildUI()

        this._epubSettings = new EpubViewSettings()

        // bind settings to EpubView settings
        const defaultFlag = Gio.SettingsBindFlags.DEFAULT
        settings.bind('zoom-level', this._epubSettings, 'zoom-level', defaultFlag)
        settings.bind('font', this._epubSettings, 'font', defaultFlag)
        settings.bind('spacing', this._epubSettings, 'spacing', defaultFlag)
        settings.bind('margin', this._epubSettings, 'margin', defaultFlag)
        settings.bind('use-publisher-font', this._epubSettings, 'use-publisher-font', defaultFlag)
        settings.bind('justify', this._epubSettings, 'justify', defaultFlag)
        settings.bind('hyphenate', this._epubSettings, 'hyphenate', defaultFlag)
        settings.bind('fg-color', this._epubSettings, 'fg-color', defaultFlag)
        settings.bind('bg-color', this._epubSettings, 'bg-color', defaultFlag)
        settings.bind('link-color', this._epubSettings, 'link-color', defaultFlag)
        settings.bind('invert', this._epubSettings, 'invert', defaultFlag)
        settings.bind('brightness', this._epubSettings, 'brightness', defaultFlag)
        settings.bind('enable-footnote', this._epubSettings, 'enable-footnote', defaultFlag)
        settings.bind('enable-devtools', this._epubSettings, 'enable-devtools', defaultFlag)
        settings.bind('allow-unsafe', this._epubSettings, 'allow-unsafe', defaultFlag)
        settings.bind('layout', this._epubSettings, 'layout', defaultFlag)
        settings.bind('skeuomorphism', this._epubSettings, 'skeuomorphism', defaultFlag)
        settings.bind('autohide-cursor', this._epubSettings, 'autohide-cursor', defaultFlag)

        // bind settings to UI
        settings.bind('font', this._mainMenu.fontButton, 'font', defaultFlag)
        settings.bind('spacing', this._mainMenu.spacingButton, 'value', defaultFlag)
        settings.bind('margin', this._mainMenu.marginButton, 'value', defaultFlag)
        settings.bind('brightness', this._mainMenu.brightnessScale.adjustment, 'value', defaultFlag)
        this.add_action(settings.create_action('use-publisher-font'))
        this.add_action(settings.create_action('justify'))
        this.add_action(settings.create_action('hyphenate'))
        this.add_action(settings.create_action('enable-footnote'))
        this.add_action(settings.create_action('enable-devtools'))
        this.add_action(settings.create_action('allow-unsafe'))
        this.add_action(settings.create_action('layout'))
        this.add_action(settings.create_action('skeuomorphism'))
        this.add_action(settings.create_action('autohide-cursor'))

        settings.bind('prefer-dark-theme', Gtk.Settings.get_default(),
            'gtk-application-prefer-dark-theme', defaultFlag)

        // add other actions
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

        // update zoom buttons when zoom level changes
        const updateZoomButtons = () => {
            const zoomLevel = settings.get_double('zoom-level')
            this._mainMenu.zoomLevel = zoomLevel
            this.lookup_action('zoom-restore').enabled = zoomLevel !== 1
            this.lookup_action('zoom-out').enabled = zoomLevel > 0.2
            this.lookup_action('zoom-in').enabled = zoomLevel < 4
        }
        updateZoomButtons()
        const zoomHandler =
            settings.connect('changed::zoom-level', updateZoomButtons)

        const updateSkeuomorphism = () => this._skeuomorph()
        updateSkeuomorphism()
        const skeuomorphismHandler =
            settings.connect('changed::skeuomorphism', updateSkeuomorphism)

        this.connect('destroy', () => {
            settings.disconnect(zoomHandler)
            settings.disconnect(skeuomorphismHandler)
        })

        this._loading = true
        this._mainOverlay.status = 'empty'
        this.title = _('Foliate')

        // restore window state
        this.default_width = windowState.get_int('width')
        this.default_height = windowState.get_int('height')
        if (windowState.get_boolean('maximized')) this.maximize()
        if (windowState.get_boolean('fullscreen')) this.fullscreen()
    }
    _buildUI() {
        this._mainOverlay = new MainOverlay()
        this.add(this._mainOverlay)

        this._mainMenu = new MainMenu()
        this._mainMenuButton.popover = this._mainMenu

        this._contentsStack.connect('row-activated', () => this._sideMenu.popdown())
        this._findBox.connect('row-activated', () => this._findMenu.popdown())

        const themes = new Gio.ListStore()
        defaultThemes.forEach(theme => themes.append(new Theme(theme)))
        this._mainMenu.themesListBox.bind_model(themes, theme =>
            new ThemeRow(theme))
        this._mainMenu.themesListBox.set_header_func((row) => {
            if (row.get_index()) row.set_header(new Gtk.Separator())
        })
        this._mainMenu.themesListBox.connect('row-activated', (_, row) => {
            const { fg_color, bg_color, link_color, invert, dark_mode } = row.theme
            this._epubSettings.set_property('fg-color', fg_color)
            this._epubSettings.set_property('bg-color', bg_color)
            this._epubSettings.set_property('link-color', link_color)
            this._epubSettings.set_property('invert', invert)
            settings.set_boolean('prefer-dark-theme', dark_mode)
            this._skeuomorph()
        })

        // make color buttons for highlight menu
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

        const gtkTheme = Gtk.Settings.get_default().gtk_theme_name
        if (gtkTheme === 'elementary') {
            this._headerBar.get_style_context().add_class('compact')
            this._sideMenuButton.get_style_context().add_class('flat')
            this._findMenuButton.get_style_context().add_class('flat')
            this._mainMenuButton.get_style_context().add_class('flat')
        }
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
        this._mainMenu.fullscreen = this._isFullscreen
    }
    _onSizeAllocate() {
        const [width, height] = this.get_size()
        this._width = width
        this._height = height
    }
    _onDestroy() {
        windowState.set_int('width', this._width)
        windowState.set_int('height', this._height)
        windowState.set_boolean('maximized', this.is_maximized)
        windowState.set_boolean('fullscreen', this._isFullscreen)

        if (this._tmpdir) recursivelyDeleteDir(Gio.File.new_for_path(this._tmpdir))
    }
    set _loading(state) {
        this._sideMenuButton.sensitive = !state
        this._findMenuButton.sensitive = !state
        if (state) {
            this.lookup_action('go-prev').enabled = false
            this.lookup_action('go-next').enabled = false
            this.lookup_action('go-back').enabled = false
            this.title = _('Loading…')
        }
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

        if (!this._epub) {
            this._epub = new EpubView(this._epubSettings)
            this._connectEpub()
        }
        this._loading = true
        this._epub.open(fileName, inputType)
    }
    _connectEpub() {
        this._mainOverlay.epub = this._epub
        this._contentsStack.epub = this._epub
        this._findBox.epub = this._epub

        this._epub.connect('click', () => {
            if (!this._highlightMenu.visible)
                this._mainOverlay.toggleNavBar()
        })
        this._epub.connect('book-displayed', () => this._loading = false)
        this._epub.connect('book-loading', () => this._loading = true)
        this._epub.connect('book-error', () => this.title = _('Error'))
        this._epub.connect('metadata', () =>
            this.title = this._epub.metadata.title)
        this._epub.connect('relocated', () => {
            const { atStart, atEnd, canGoBack } = this._epub.location
            this.lookup_action('go-prev').enabled = !atStart
            this.lookup_action('go-next').enabled = !atEnd
            this.lookup_action('go-back').enabled = canGoBack
        })
        this._epub.connect('selection', () => {
            if (this._epub.selection.text) this._showSelectionPopover()
        })
        this._epub.connect('highlight-menu', () => {
            const annotation = this._epub.annotation
            this._noteTextView.buffer.text = annotation.note
            this._showPopover(this._highlightMenu, false)
            this._colorRadios[annotation.color].active = true
        })
        this._epub.connect('footnote', () => {
            const { footnote, link, position } = this._epub.footnote
            const popover = new FootnotePopover(footnote, link, this._epub)
            popover.relative_to = this._epub.widget
            setPopoverPosition(popover, position, this, 200)
            popover.popup()
        })

        this._noteTextView.buffer.connect('changed', () => {
            const annotation = this._epub.annotation
            annotation.set_property('note', this._noteTextView.buffer.text)
        })
    }
    _showSelectionPopover() {
        this._showPopover(new SelectionPopover())
    }
    _showPopover(popover, select = true) {
        popover.relative_to = this._epub.widget
        setPopoverPosition(popover, this._epub.selection.position, this, 200)
        popover.popup()
        if (select) {
            this._epub.selectByCfi(this._epub.selection.cfi)
            popover.connect('closed', () => this._clearSelection())
        } else this._clearSelection()
    }
    _clearSelection() {
        this._epub.clearSelection()
    }
    _skeuomorph() {
        this._mainOverlay.skeuomorph(settings.get_boolean('skeuomorphism'))
    }
})
