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

const { GObject, Gtk, Gio, Gdk, GdkPixbuf, cairo } = imports.gi
const ngettext = imports.gettext.ngettext
let Gspell; try { Gspell = imports.gi.Gspell } catch (e) {}

const { alphaColor, isExternalURL } = imports.utils
const { EpubViewAnnotation } = imports.epubView
const { sepHeaderFunc } = imports.utils

const highlightColors = ['yellow', 'orange', 'red', 'magenta', 'aqua', 'lime']

const settings = new Gio.Settings({ schema_id: pkg.name })

var AnnotationRow = GObject.registerClass({
    GTypeName: 'FoliateAnnotationRow',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/annotationRow.ui',
    InternalChildren: [
        'annotationSection', 'annotationText', 'annotationNote', 'removeButton'
    ]
}, class AnnotationRow extends Gtk.ListBoxRow {
    _init(annotation, epubView, removable = true) {
        super._init()
        this.annotation = annotation
        this._epub = epubView

        this._annotationText.label = annotation.text.replace(/\n/g, ' ')
        epubView.getSectionFromCfi(annotation.cfi).then(section =>
            this._annotationSection.label = section.label)

        this._applyColor()
        annotation.connect('notify::color', this._applyColor.bind(this))

        this._applyNote()
        annotation.connect('notify::note', this._applyNote.bind(this))

        if (removable) this._removeButton.connect('clicked', () => this._remove())
        else this._removeButton.hide()
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
                border-left: 7px solid ${alphaColor(this.annotation.color, 0.5)};
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
        'bookmarkSection', 'bookmarkText', 'removeButton'
    ]
}, class BookmarkRow extends Gtk.ListBoxRow {
    _init(bookmark, epubView) {
        super._init()
        this.bookmark = bookmark
        this._epub = epubView

        this._bookmarkText.label = bookmark.cfi
        this._epub.getSectionFromCfi(bookmark.cfi).then(section =>
            this._bookmarkSection.label = section.label)

        this._removeButton.connect('clicked', () => this._remove())
    }
    _remove() {
        this._epub.removeBookmark(this.bookmark.cfi)
    }
})

var ContentsStack = GObject.registerClass({
    GTypeName: 'FoliateContentsStack',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/contentsStack.ui',
    InternalChildren: [
        'tocTreeView',
        'annotationsStack', 'annotationsListBox',
        'bookmarksStack', 'bookmarksListBox', 'bookmarkButton',
        'annotationsSearchEntry'
    ],
    Signals: {
        'row-activated': { flags: GObject.SignalFlags.RUN_FIRST }
    }
}, class ContentsStack extends Gtk.Stack {
    _init(params) {
        super._init(params)

        this._annotationsListBox.set_header_func(sepHeaderFunc)
        this._bookmarksListBox.set_header_func(sepHeaderFunc)

        this._tocTreeView.connect('row-activated', () => this._onTocRowActivated())
        this._annotationsListBox.connect('row-activated', this._onAnnotationRowActivated.bind(this))
        this._bookmarksListBox.connect('row-activated', this._onBookmarkRowActivated.bind(this))
        this._annotationsSearchEntry.connect('search-changed', () => this._updateAnnotations())
    }
    set epub(epub) {
        this._epub = epub
        this._tocTreeView.model = this._epub.toc

        this._updateData(epub.annotations, epub.bookmarks)
        epub.connect('data-ready', (_, annotations, bookmarks) =>
            this._updateData(annotations, bookmarks))
        epub.connect('relocated', () => {
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
    _updateAnnotations() {
        let model = this._annotations
        if (!model) return
        const query = this._annotationsSearchEntry.text
        if (query) {
            const results = new Gio.ListStore()
            const n = model.get_n_items()
            for (let i = 0; i < n; i++) {
                const annotation = model.get_item(i)
                const { text, color, note } = annotation
                if ([text, color, note]
                    .some(x => x.toLowerCase().includes(query)))
                    results.append(annotation)
            }
            model = results
        }
        this._annotationsListBox.bind_model(model, annotation =>
            new AnnotationRow(annotation, this._epub))
    }
    _updateData(annotations, bookmarks) {
        if (annotations) {
            this._annotationsStack.visible_child_name =
                annotations.get_n_items() ? 'main' : 'empty'
            annotations.connect('items-changed', () => {
                this._annotationsStack.visible_child_name =
                    annotations.get_n_items() ? 'main' : 'empty'
                this._updateAnnotations()
            })
            this._annotations = annotations
            this._updateAnnotations()
        }
        if (bookmarks) {
            this._bookmarksStack.visible_child_name =
                bookmarks.get_n_items() ? 'main' : 'empty'
            bookmarks.connect('items-changed', () => {
                this._bookmarksStack.visible_child_name =
                    bookmarks.get_n_items() ? 'main' : 'empty'
                this._updateBookmarkButton()
            })
            this._bookmarksListBox.bind_model(bookmarks, bookmark =>
                new BookmarkRow(bookmark, this._epub))
        }
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

var FindBox = GObject.registerClass({
    GTypeName: 'FoliateFindBox',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/findBox.ui',
    InternalChildren: [
        'findEntry', 'findScrolledWindow', 'findTreeView', 'inBook', 'inSection', 'status'
    ],
    Signals: {
        'row-activated': { flags: GObject.SignalFlags.RUN_FIRST }
    }
}, class FindBox extends Gtk.Box {
    _init(params) {
        super._init(params)
        const column = this._findTreeView.get_column(0)
        column.get_area().orientation = Gtk.Orientation.VERTICAL

        this._findEntry.connect('activate', () => this._onFindEntryActivate())
        this._findEntry.connect('search-changed', () => this._onFindEntryChanged())
        this._inBook.connect('toggled', () => this._onFindEntryActivate())
        this._inSection.connect('toggled', () => this._onFindEntryActivate())
        this._findTreeView.connect('row-activated', () => this._onFindRowActivated())
    }
    set height_request(h) {
        this._findScrolledWindow.height_request = h
    }
    set epub(epub) {
        this._epub = epub
        this._findTreeView.model = this._epub.findResults
        this._epub.connect('find-results', () => {
            const n = this._epub.findResults.iter_n_children(null)
            if (n === 0) {
                this._findEntry.get_style_context().add_class('error')
                this._findScrolledWindow.hide()
            } else {
                this._findEntry.get_style_context().remove_class('error')
                this._findScrolledWindow.show()
            }
            this._status.label = n === 0
                ? _('No results')
                : ngettext('%d result', '%d results', n).format(n)
        })
    }
    find(text) {
        this._findEntry.text = text
        this._findEntry.emit('activate')
    }
    _onFindEntryActivate() {
        const text = this._findEntry.text.trim()
        if (text) {
            this._status.show()
            this._status.label = _('Searching…')
            this._epub.find(text, this._inBook.active)
        }
    }
    _onFindEntryChanged() {
        if (!this._findEntry.text) {
            this._findEntry.get_style_context().remove_class('error')
            this._epub.clearFind()
            this._findScrolledWindow.hide()
            this._status.hide()
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

var FootnotePopover = GObject.registerClass({
    GTypeName: 'FoliateFootnotePopover',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/footnotePopover.ui',
    InternalChildren: [
        'footnoteLabel', 'controls', 'button'
    ]
}, class FootnotePopover extends Gtk.Popover {
    _init(footnote, link, epubView) {
        super._init()
        this._link = link
        this._epub = epubView
        this._footnoteLabel.label = footnote
        this._footnoteLabel.connect('activate-link', this._activateLink.bind(this))
        this._button.connect('clicked', () => this._goToLinkedLocation())
        if (!link) this._controls.hide()
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

var AnnotationBox = GObject.registerClass({
    GTypeName: 'FoliateAnnotationBox',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/annotationBox.ui',
    InternalChildren: [
        'noteTextView', 'controls', 'colorButton', 'colorsBox', 'backButton', 'customColorButton'
    ],
    Properties: {
        annotation: GObject.ParamSpec.object('annotation', 'annotation', 'annotation',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY, EpubViewAnnotation.$gtype)
    }
}, class AnnotationBox extends Gtk.Box {
    _init(params) {
        super._init(params)
        const annotation = params.annotation

        if (Gspell) Gspell.TextView
            .get_from_gtk_text_view(this._noteTextView)
            .basic_setup()

        this._noteTextView.buffer.text = annotation.note
        this._noteTextView.buffer.connect('changed', () => {
            annotation.set_property('note', this._noteTextView.buffer.text)
        })

        this._colorButton.connect('clicked', () => this._showColors())
        this._backButton.connect('clicked', () => this._showMain())
        this._customColorButton.connect('clicked', () => this._chooseColor())

        const buttons = highlightColors.map(color => {
            const button = new Gtk.Button({
                visible: true,
                tooltip_text: color,
                image: new Gtk.Image({
                    icon_name: 'object-select-symbolic',
                    opacity: color === annotation.color ? 1 : 0
                })
            })
            this._applyColor(button, color)
            button.connect('clicked', () => {
                if (color !== annotation.color) {
                    annotation.set_property('color', color)
                    settings.set_string('highlight', color)
                }
            })

            this._colorsBox.pack_start(button, false, true, 0)
            return button
        })

        this._applyColor(this._colorButton, annotation.color)
        const connectColor = annotation.connect('notify::color', () => {
            this._applyColor(this._colorButton, annotation.color)
            buttons.forEach(button => {
                button.image.opacity =
                    button.tooltip_text === annotation.color ? 1 : 0
            })
        })
        this.connect('destroy', () => annotation.disconnect(connectColor))
    }
    _applyColor(button, color) {
        const cssProvider = new Gtk.CssProvider()
        cssProvider.load_from_data(`
            .color-button {
                background: ${alphaColor(color, 0.5)};
            }`)
        const styleContext = button.get_style_context()
        styleContext.add_class('color-button')
        styleContext.add_provider(cssProvider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION)
    }
    _showColors() {
        this._controls.transition_type = Gtk.StackTransitionType.SLIDE_RIGHT
        this._controls.visible_child_name = 'colors'
    }
    _showMain() {
        this._controls.transition_type = Gtk.StackTransitionType.SLIDE_LEFT
        this._controls.visible_child_name = 'main'
    }
    _chooseColor() {
        const rgba =  new Gdk.RGBA()
        rgba.parse(this.annotation.color)
        const dialog = new Gtk.ColorChooserDialog({
            rgba,
            modal: true,
            transient_for: this.get_toplevel()
        })
        if (dialog.run() === Gtk.ResponseType.OK) {
            const color = dialog.get_rgba().to_string()
            this.annotation.set_property('color', color)
            settings.set_string('highlight', color)
        }
        dialog.destroy()
    }
})

var ImageViewer = GObject.registerClass({
    GTypeName: 'FoliateImageViewer',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/imageViewer.ui',
    InternalChildren: [
        'scale', 'paned', 'labelArea', 'image', 'label', 'fileChooser',
        'invertButton'
    ],
    Properties: {
        pixbuf: GObject.ParamSpec.object('pixbuf', 'pixbuf', 'pixbuf',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY, GdkPixbuf.Pixbuf.$gtype),
        alt: GObject.ParamSpec.string('alt', 'alt', 'alt',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY, ''),
        invert: GObject.ParamSpec.boolean('invert', 'invert', 'invert',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, false)
    }
}, class ImageViewer extends Gtk.ApplicationWindow {
    _init(params) {
        super._init(params)
        this.show_menubar = false
        this._rotation = 0
        this._zoom = 1
        this.bind_property('invert', this._invertButton, 'active',
            GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE)

        this.actionGroup = new Gio.SimpleActionGroup()
        const actions = {
            'copy': () => this.copy(),
            'save-as': () => this.saveAs(),
            'zoom-in': () => this.zoom += 0.25,
            'zoom-out': () => this.zoom -= 0.25,
            'zoom-restore': () => this.zoom = 1,
            'rotate-left': () => this.rotate(90),
            'rotate-right': () => this.rotate(270),
            'invert': () => this.set_property('invert', !this.invert),
            'close': () => this.close(),
        }
        Object.keys(actions).forEach(name => {
            const action = new Gio.SimpleAction({ name })
            action.connect('activate', actions[name])
            this.actionGroup.add_action(action)
        })
        this.insert_action_group('img', this.actionGroup)
        const overlay = Gtk.Builder.new_from_resource(
            '/com/github/johnfactotum/Foliate/ui/shortcutsWindow.ui')
            .get_object('shortcutsWindow')
        overlay.section_name = 'image-viewer-shortcuts'
        this.set_help_overlay(overlay)

        const pixbuf = this.pixbuf
        const width = pixbuf.get_width()
        const height = pixbuf.get_height()
        const [windowWidth, windowHeight] = this.transient_for.get_size()
        this.default_width = Math.max(Math.min(width * 1.5, windowWidth), 360)
        this.default_height = Math.max(Math.min(height * 1.5 + 150, windowHeight), 200)
        this._image.set_from_pixbuf(pixbuf)
        if (this.alt) this._label.label = this.alt
        else this._labelArea.hide()

        this._scale.connect('format-value', (_, x) => `${Math.round(x * 100)}%`)
        this._scale.connect('value-changed', () => {
            this._zoom = this._scale.get_value()
            this._updateZoom()
            this._update()
        })
        this._fileChooser.transient_for = this
        this._updateZoom()
        this._update()
    }
    _updateZoom() {
        const upper = this._scale.adjustment.upper
        const lower = this._scale.adjustment.lower
        this.actionGroup.lookup_action('zoom-in').enabled = this._zoom < upper
        this.actionGroup.lookup_action('zoom-out').enabled = this._zoom > lower
        this.actionGroup.lookup_action('zoom-restore').enabled = this._zoom !== 1
    }
    _update() {
        let pixbuf = this.pixbuf
        const width = pixbuf.get_width()
        const height = pixbuf.get_height()
        const zoom = this.zoom

        if (this.invert) {
            const surface = new cairo.ImageSurface(cairo.Format.ARGB32, width, height)
            const context = new cairo.Context(surface)

            // paint a whtie background first for transparent images
            context.setSourceRGBA(1, 1, 1, 1)
            context.paint()

            // paint the image
            Gdk.cairo_set_source_pixbuf(context, pixbuf, 0, 0)
            context.paint()

            // invert
            context.setOperator(cairo.Operator.DIFFERENCE)
            context.setSourceRGBA(1, 1, 1, 1)
            context.paint()

            // no hue-rotate :(

            pixbuf = Gdk.pixbuf_get_from_surface(surface, 0, 0, width, height)
        }
        this._image.set_from_pixbuf(pixbuf.scale_simple(
            width * zoom,
            height * zoom,
            GdkPixbuf.InterpType.BILINEAR).rotate_simple(this._rotation))
    }
    get zoom() {
        return this._zoom
    }
    set zoom(value) {
        if (value !== this._scale.get_value()) this._scale.set_value(value)
    }
    rotate(degree) {
        this._rotation = (this._rotation + degree) % 360
        this._update()
    }
    get invert() {
        return this._invert
    }
    set invert(invert) {
        this._invert = invert
        if (this._image) this._update()
    }
    show() {
        super.show()
        this._label.select_region(-1, -1)
    }
    copy() {
        Gtk.Clipboard.get_default(Gdk.Display.get_default()).set_image(this.pixbuf)
    }
    saveAs() {
        this._fileChooser.set_current_name(this.title + '.png')
        if (this._fileChooser.run() === Gtk.ResponseType.ACCEPT)
            this.pixbuf.savev(this._fileChooser.get_filename(), 'png', [], [])
    }
})
