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

const { GObject, Gtk, Gio, GLib, Gdk, GdkPixbuf } = imports.gi
const ngettext = imports.gettext.ngettext

const { execCommand, recursivelyDeleteDir, isExternalURL, invertColor, brightenColor } = imports.utils
const { EpubView, EpubViewSettings, EpubViewAnnotation } = imports.epubView
const { DictionaryBox, WikipediaBox } = imports.lookup

const settings = new Gio.Settings({ schema_id: pkg.name })
const windowState = new Gio.Settings({ schema_id: pkg.name + '.window-state' })

const mimetypes = {
    epub: 'application/epub+zip',
    mobi: 'application/x-mobipocket-ebook',
    kindle: 'application/vnd.amazon.mobi8-ebook'
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
        ['0', '<ctrl>0']],

    'win.bookmark': [() => {
        if (self._epub.hasBookmark()) self._epub.removeBookmark()
        else self._epub.addBookmark()
    }, ['<ctrl>d']],

    'win.selection-menu': [() => self._showSelectionPopover()],
    'win.selection-copy': [() => {
        Gtk.Clipboard.get_default(Gdk.Display.get_default())
            .set_text(self._epub.selection.text, -1)
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
        const { language, text } = self._epub.selection
        const popover = new Gtk.Popover()
        const dictionaryBox = new DictionaryBox({ border_width: 10 },
            settings.get_string('dictionary'))
        dictionaryBox.dictCombo.connect('changed', () =>
            settings.set_string('dictionary', dictionaryBox.dictCombo.active_id))
        popover.add(dictionaryBox)
        dictionaryBox.lookup(text, language)
        self._showPopover(popover)
    }],
    'win.selection-wikipedia': [() => {
        const { language, text } = self._epub.selection
        const popover = new Gtk.Popover()
        const wikipediaBox = new WikipediaBox({ border_width: 10 })
        popover.add(wikipediaBox)
        wikipediaBox.lookup(text, language)
        self._showPopover(popover)
    }],
    'win.selection-find': [() => {
        const { text } = self._epub.selection
        self._findBox.find(text)
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

    'win.properties': [() => {
        const window = new PropertiesWindow({
            modal: true,
            transient_for: self
        }, self._epub.metadata, self._epub.cover)
        window.show()
    }],

    'win.open-copy': [() => {
        const window = new self.constructor(self.application)
        window.open(self._fileName)
        window.present()
    }, ['<ctrl>n']],

    'app.themes': [() => {
    }],

    'app.preferences': [() => {
    }],

    'win.open': [() => {
        const allFiles = new Gtk.FileFilter()
        allFiles.set_name(_('All Files'))
        allFiles.add_pattern('*')

        const epubFiles = new Gtk.FileFilter()
        epubFiles.set_name(_('E-book Files'))
        epubFiles.add_mime_type(mimetypes.epub)
        epubFiles.add_mime_type(mimetypes.mobi)
        epubFiles.add_mime_type(mimetypes.kindle)

        const dialog = Gtk.FileChooserNative.new(
            _('Open File'),
            self,
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

const PropertyBox = GObject.registerClass({
    GTypeName: 'FoliatePropertyBox',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/propertyBox.ui',
    InternalChildren: ['name', 'value'],
    Properties: {
        'property-name':
            GObject.ParamSpec.string('property-name', 'property-name', 'property-name',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, ''),
        'property-value':
            GObject.ParamSpec.string('property-value', 'property-value', 'property-value',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, '')
    }
}, class PropertyBox extends Gtk.Box {
    _init(params) {
        super._init(params)
        const flag = GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE
        this.bind_property('property-name', this._name, 'label', flag)
        this.bind_property('property-value', this._value, 'label', flag)
    }
})

const PropertiesWindow = GObject.registerClass({
    GTypeName: 'FoliatePropertiesWindow',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/propertiesWindow.ui',
    InternalChildren: [
        'cover', 'title', 'creator', 'description', 'propertiesBox'
    ]
}, class PropertiesWindow extends Gtk.Dialog {
    _init(params, metadata, cover) {
        super._init(params)
        if (cover) {
            const width = 120
            const ratio = width / cover.get_width()
            const height = parseInt(cover.get_height() * ratio, 10)
            this._cover.set_from_pixbuf(cover
                .scale_simple(width, height, GdkPixbuf.InterpType.BILINEAR))
        } else this._cover.hide()

        const {
            title, creator, description,
            publisher, pubdate, modified_date, language, identifier, rights
        } = metadata
        this._title.label = title
        this._creator.label = creator
        if (description) this._description.label = description
        else this._description.hide()
        if (publisher) this._propertiesBox.pack_start(new PropertyBox({
            property_name: _('Publisher'),
            property_value: publisher
        }), false, true, 0)
        if (pubdate) this._propertiesBox.pack_start(new PropertyBox({
            property_name: _('Publication Date'),
            property_value: pubdate
        }), false, true, 0)
        if (modified_date) this._propertiesBox.pack_start(new PropertyBox({
            property_name: _('Modified Date'),
            property_value: modified_date
        }), false, true, 0)
        if (language) this._propertiesBox.pack_start(new PropertyBox({
            property_name: _('Language'),
            property_value: language
        }), false, true, 0)
        if (identifier) this._propertiesBox.pack_start(new PropertyBox({
            property_name: _('Identifier'),
            property_value: identifier
        }), false, true, 0)
        if (rights) this._propertiesBox.pack_start(new PropertyBox({
            property_name: _('Copyright'),
            property_value: rights
        }), false, true, 0)
    }
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
        this._epub = epubView

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
    _remove() {
        this._epub.removeAnnotation(this.annotation)
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
    find(text) {
        this._findEntry.text = text
        this._findEntry.emit('activate')
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
    popdown() {
        // wrap `super.popdown()` so we can use it as a signal handler
        // without getting warnings about `popdown()` taking no arguments
        super.popdown()
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

const AnnotationBox = GObject.registerClass({
    GTypeName: 'FoliateAnnotationBox',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/annotationBox.ui',
    InternalChildren: ['highlightColorsBox', 'noteTextView'],
    Properties: {
        annotation: GObject.ParamSpec.object('annotation', 'annotation', 'annotation',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY, EpubViewAnnotation.$gtype)
    }
}, class AnnotationBox extends Gtk.Box {
    _init(params) {
        super._init(params)
        const annotation = params.annotation
        highlightColors.map(color => {
            const radio = new Gtk.RadioButton({
                visible: true,
                tooltip_text: color,
                active: color === annotation.color
            })
            radio.connect('toggled', () => {
                if (radio.active && color !== annotation.color)
                    annotation.set_property('color', color)
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
            return radio
        }).reduce((a, b) => (b.join_group(a), a))

        this._noteTextView.buffer.text = annotation.note
        this._noteTextView.buffer.connect('changed', () => {
            annotation.set_property('note', this._noteTextView.buffer.text)
        })
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
    _init() {
        super._init()
        this._fullscreenButton.connect('clicked', () => this.popdown())
    }
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
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/navBar.ui',
    Children: ['locationMenu'],
    InternalChildren: [
        'locationStack', 'locationLabel', 'locationScale',
        'timeInBook', 'timeInChapter',
        'sectionEntry', 'locationEntry', 'cfiEntry',
        'sectionTotal', 'locationTotal',
    ]
}, class NavBar extends Gtk.ActionBar {
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
        'navBarEventBox', 'navBar', 'navBarRevealer',
        'distractionFreeBottomLabel', 'distractionFreeBottomLabel2'
    ]
}, class MainOverlay extends Gtk.Overlay {
    _init() {
        super._init()

        this._navBarEventBox.connect('enter-notify-event', () =>
            this._navBarRevealer.reveal_child = true)
        this._navBarEventBox.connect('leave-notify-event', () => {
            if (!this._navBarVisible && !this._navBar.locationMenu.visible)
                this._navBarRevealer.reveal_child = false
        })
        this._navBar.locationMenu.connect('closed', () => {
            if (!this._navBarVisible) this._navBarRevealer.reveal_child = false
        })
    }
    set epub(epub) {
        this._epub = epub
        this._navBar.epub = this._epub
        this._contentBox.pack_start(this._epub.widget, true, true, 0)

        this._epub.connect('book-displayed', () => this._setStatus('loaded'))
        this._epub.connect('book-loading', () => {
            this._setStatus('loading')
            this._distractionFreeBottomLabel.label = '…'
            this._distractionFreeBottomLabel2.label = '…'
        })
        this._epub.connect('book-error', () => this._setStatus('error'))
        this._epub.connect('relocated', () => this._update())
    }
    _update() {
        const { endCfi, location, locationTotal } = this._epub.location
        if (locationTotal) this._distractionFreeBottomLabel.label =
            (location + 1) + ' / ' + (locationTotal + 1)
        this._epub.getSectionFromCfi(endCfi).then(section =>
            this._distractionFreeBottomLabel2.label = section.label)
    }
    _setStatus(status) {
        const loaded = status === 'loaded'
        this._mainBox.opacity = loaded ? 1 : 0
        this._overlayStack.visible = !loaded
        if (!loaded) this._overlayStack.visible_child_name = status
    }
    toggleNavBar() {
        this._navBarVisible = !this._navBarVisible
        this._navBarRevealer.reveal_child = this._navBarVisible
        return this._navBarVisible
    }
    get navbarVisible() {
        return this._navBarVisible || false
    }
    skeuomorph(enabled) {
        if (!enabled) return this._contentBox.get_style_context()
            .remove_class('skeuomorph-page')

        const cssProvider = new Gtk.CssProvider()
        const invert = settings.get_boolean('invert') ? invertColor : (x => x)
        const brightness = settings.get_double('brightness')
        const bgColor = brightenColor(invert(settings.get_string('bg-color')), brightness)
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

const copyPixbuf = pixbuf => Gtk.Clipboard
    .get_default(Gdk.Display.get_default())
    .set_image(pixbuf)

class ImgViewer {
    constructor(parent, pixbuf, alt) {
        const width = pixbuf.get_width()
        const height = pixbuf.get_height()
        const [windowWidth, windowHeight] = parent.get_size()
        const window = new Gtk.Window({
            default_width: Math.min(width * 2, windowWidth),
            default_height: Math.min(height * 2 + 70, windowHeight),
            transient_for: parent
        })
        const headerBar = new Gtk.HeaderBar()
        headerBar.show_close_button = true
        headerBar.has_subtitle = false
        window.set_titlebar(headerBar)
        window.title = alt

        const button = new Gtk.Button({ label: _('Copy') })
        button.connect('clicked', () => copyPixbuf(pixbuf))
        headerBar.pack_start(button)

        const slider = new Gtk.Scale({
            orientation: Gtk.Orientation.HORIZONTAL,
            adjustment: new Gtk.Adjustment({
                lower: 0.1, upper: 4, step_increment: 0.1
            }),
            digits: 2,
            hexpand: true,
            draw_value: false
        })
        slider.set_value(1)
        slider.connect('format-value',
            (_, x) => `${Math.round(x * 100)}%`)
        slider.add_mark(1, Gtk.PositionType.BOTTOM, '100%')
        slider.add_mark(2, Gtk.PositionType.BOTTOM, '200%')
        slider.add_mark(4, Gtk.PositionType.BOTTOM, '400%')
        slider.connect('value-changed', () => {
            const zoom = slider.get_value()
            image.set_from_pixbuf(pixbuf.scale_simple(
                width * zoom,
                height * zoom,
                GdkPixbuf.InterpType.BILINEAR))
        })
        const bar = new Gtk.ActionBar()
        bar.pack_start(slider)

        const scroll = new Gtk.ScrolledWindow()
        const image = Gtk.Image.new_from_pixbuf(pixbuf)
        scroll.add(image)
        const container = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL
        })
        container.pack_start(scroll, true, true, 0)
        container.pack_end(bar, false, true, 0)
        window.add(container)

        window.show_all()
    }
}

var FoliateWindow = GObject.registerClass({
    GTypeName: 'FoliateWindow',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/window.ui',
    InternalChildren: [
        'mainOverlay',
        'sideMenu', 'contentsStack', 'findMenu', 'findBox', 'mainMenu',
        'headerBarEventBox', 'headerBarRevealer',
        'distractionFreeTitle',
        'headerBar', 'sideMenuButton', 'findMenuButton', 'mainMenuButton',
        'fullscreenEventbox', 'fullscreenRevealer',
        'fullscreenHeaderbar', 'fullscreenSideMenuButton',
        'fullscreenFindMenuButton', 'fullscreenMainMenuButton'
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

        this._themeUI()
        const brightnessHandler =
            settings.connect('changed::brightness', () => this._themeUI())
        const skeuomorphismHandler =
            settings.connect('changed::skeuomorphism', () => this._themeUI())

        this.connect('destroy', () => {
            settings.disconnect(zoomHandler)
            settings.disconnect(brightnessHandler)
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
        this.set_help_overlay(Gtk.Builder.new_from_resource(
            '/com/github/johnfactotum/Foliate/ui/shortcutsWindow.ui')
            .get_object('shortcutsWindow'))
        this.application.set_accels_for_action('win.show-help-overlay',
            ['<ctrl>question'])

        this._headerBarEventBox.connect('enter-notify-event', () =>
            this._headerBarRevealer.reveal_child = true)
        this._headerBarEventBox.connect('leave-notify-event', () => {
            if (!this._sideMenu.visible
            && !this._findMenu.visible
            && !this._mainMenu.visible
            && !this._mainOverlay.navbarVisible)
                this._headerBarRevealer.reveal_child = false
        })

        const hideHeaderBar = () => {
            if (!this._mainOverlay.navbarVisible) {
                this._fullscreenRevealer.reveal_child = false
                this._headerBarRevealer.reveal_child = false
            }
        }
        this._fullscreenEventbox.connect('enter-notify-event', () =>
            this._fullscreenRevealer.reveal_child = true)
        this._fullscreenEventbox.connect('leave-notify-event', () => {
            if (!this._sideMenu.visible
            && !this._findMenu.visible
            && !this._mainMenu.visible
            && !this._mainOverlay.navbarVisible)
                this._fullscreenRevealer.reveal_child = false
        })
        this._sideMenu.connect('closed', hideHeaderBar)
        this._findMenu.connect('closed', hideHeaderBar)
        this._mainMenu.connect('closed', hideHeaderBar)
        this.connect('notify::title', () => {
            this._distractionFreeTitle.label = this.title
            this._headerBar.title = this.title
            this._fullscreenHeaderbar.title = this.title
        })

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
            this._themeUI()
        })

        const gtkTheme = Gtk.Settings.get_default().gtk_theme_name
        if (gtkTheme === 'elementary') {
            this._headerBar.get_style_context().add_class('default-decoration')
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
    _onWindowStateEvent(widget, event) {
        const state = event.get_window().get_state()
        this._isFullscreen = Boolean(state & Gdk.WindowState.FULLSCREEN)
        this._mainMenu.fullscreen = this._isFullscreen

        this._fullscreenEventbox.visible = this._isFullscreen
        this._fullscreenRevealer.reveal_child = this._mainOverlay.navbarVisible
        if (this._isFullscreen) {
            this._sideMenu.relative_to = this._fullscreenSideMenuButton
            this._findMenu.relative_to = this._fullscreenFindMenuButton
            this._mainMenu.relative_to = this._fullscreenMainMenuButton
        } else {
            this._sideMenu.relative_to = this._sideMenuButton
            this._findMenu.relative_to = this._findMenuButton
            this._mainMenu.relative_to = this._mainMenuButton
        }
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
        this._fullscreenSideMenuButton.sensitive = !state
        this._fullscreenFindMenuButton.sensitive = !state
        this.lookup_action('open-copy').enabled = !state
        if (state) {
            this.lookup_action('properties').enabled = false
            this.lookup_action('go-prev').enabled = false
            this.lookup_action('go-next').enabled = false
            this.lookup_action('go-back').enabled = false
            this.title = _('Loading…')
        }
    }
    open(fileName, realFileName, inputType = 'epub') {
        this._fileName = realFileName || fileName
        const file = Gio.File.new_for_path(fileName)
        const fileInfo = file.query_info('standard::content-type',
            Gio.FileQueryInfoFlags.NONE, null)
        const contentType = fileInfo.get_content_type()

        if (contentType === mimetypes.mobi || contentType === mimetypes.kindle) {
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
            if (this._highlightMenu && this._highlightMenu.visible) return
            const visible = this._mainOverlay.toggleNavBar()
            if (this._isFullscreen)
                this._fullscreenRevealer.reveal_child = visible
            else this._headerBarRevealer.reveal_child = visible
        })
        this._epub.connect('book-displayed', () => this._loading = false)
        this._epub.connect('book-loading', () => this._loading = true)
        this._epub.connect('book-error', () => this.title = _('Error'))
        this._epub.connect('metadata', () =>
            this.title = this._epub.metadata.title)
        this._epub.connect('cover', () =>
            this.lookup_action('properties').enabled = true)
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
            this._highlightMenu = new Gtk.Popover()
            this._highlightMenu.add(new AnnotationBox({ annotation, visible: true }))
            this._showPopover(this._highlightMenu, false)
        })
        this._epub.connect('footnote', () => {
            const { footnote, link, position } = this._epub.footnote
            const popover = new FootnotePopover(footnote, link, this._epub)
            popover.relative_to = this._epub.widget
            setPopoverPosition(popover, position, this, 200)
            popover.popup()
        })
        this._epub.connect('img', (_, pixbuf, alt) => {
            new ImgViewer(this, pixbuf, alt)
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
    _themeUI() {
        this._mainOverlay.skeuomorph(settings.get_boolean('skeuomorphism'))

        const invert = settings.get_boolean('invert') ? invertColor : (x => x)
        const brightness = settings.get_double('brightness')
        const bgColor = brightenColor(invert(settings.get_string('bg-color')), brightness)
        const fgColor = brightenColor(invert(settings.get_string('fg-color')), brightness)
        const cssProvider = new Gtk.CssProvider()
        cssProvider.load_from_data(`
            #headerbar-container {
                background: ${bgColor};
                border: 0;
                box-shadow: none;
            }
            #distraction-free-title {
                color: ${fgColor};
            }`)
        Gtk.StyleContext.add_provider_for_screen(
            Gdk.Screen.get_default(),
            cssProvider,
            Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION)
    }
})
