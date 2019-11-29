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

const { GObject, Gtk, Gio, Gdk, GdkPixbuf } = imports.gi

const { alphaColor, isExternalURL } = imports.utils
const { EpubViewAnnotation } = imports.epubView

const highlightColors = ['yellow', 'orange', 'red', 'magenta', 'aqua', 'lime']

const settings = new Gio.Settings({ schema_id: pkg.name })

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

var ContentsStack = GObject.registerClass({
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
    _init(params) {
        super._init(params)

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
    _updateData(annotations, bookmarks) {
        if (annotations) {
            this._annotationsStack.visible_child_name =
                annotations.get_n_items() ? 'main' : 'empty'
            annotations.connect('items-changed', () => {
                this._annotationsStack.visible_child_name =
                    annotations.get_n_items() ? 'main' : 'empty'
            })
            this._annotationsListBox.bind_model(annotations, annotation =>
                new AnnotationRow(annotation, this._epub))
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
    InternalChildren: ['findEntry', 'findScrolledWindow', 'findTreeView'],
    Signals: {
        'row-activated': { flags: GObject.SignalFlags.RUN_FIRST }
    }
}, class FindBox extends Gtk.Box {
    _init(params) {
        super._init(params)
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

var FootnotePopover = GObject.registerClass({
    GTypeName: 'FoliateFootnotePopover',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/footnotePopover.ui',
    InternalChildren: [
        'footnoteLabel', 'controls'
    ]
}, class FootnotePopover extends Gtk.Popover {
    _init(footnote, link, epubView) {
        super._init()
        this._link = link
        this._epub = epubView
        this._footnoteLabel.label = footnote
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
    InternalChildren: ['noteTextView', 'controls', 'colorButton', 'colorsBox'],
    Properties: {
        annotation: GObject.ParamSpec.object('annotation', 'annotation', 'annotation',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY, EpubViewAnnotation.$gtype)
    }
}, class AnnotationBox extends Gtk.Box {
    _init(params) {
        super._init(params)
        const annotation = params.annotation

        this._noteTextView.buffer.text = annotation.note
        this._noteTextView.buffer.connect('changed', () => {
            annotation.set_property('note', this._noteTextView.buffer.text)
        })

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
        }
        dialog.destroy()
    }
})

var ImageViewer = GObject.registerClass({
    GTypeName: 'FoliateImageViewer',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/imageViewer.ui',
    InternalChildren: ['scale', 'paned', 'labelArea', 'image', 'label'],
    Properties: {
        pixbuf: GObject.ParamSpec.object('pixbuf', 'pixbuf', 'pixbuf',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY, GdkPixbuf.Pixbuf.$gtype),
        alt: GObject.ParamSpec.string('alt', 'alt', 'alt',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY, '')
    }
}, class ImageViewer extends Gtk.Window {
    _init(params) {
        super._init(params)
        const pixbuf = this.pixbuf
        const width = pixbuf.get_width()
        const height = pixbuf.get_height()
        const [windowWidth, windowHeight] = this.transient_for.get_size()
        this.default_width = Math.max(Math.min(width * 1.5, windowWidth), 320)
        this.default_height = Math.max(Math.min(height * 1.5 + 150, windowHeight), 200)
        this._image.set_from_pixbuf(pixbuf)
        if (this.alt) this._label.label = this.alt
        else this._labelArea.hide()

        this._scale.connect('format-value', (_, x) => `${Math.round(x * 100)}%`)
        this._scale.connect('value-changed', () => {
            const zoom = this._scale.get_value()
            this._image.set_from_pixbuf(pixbuf.scale_simple(
                width * zoom,
                height * zoom,
                GdkPixbuf.InterpType.BILINEAR))
        })
    }
    show() {
        super.show()
        this._label.select_region(-1, -1)
    }
    copy() {
        Gtk.Clipboard.get_default(Gdk.Display.get_default()).set_image(this.pixbuf)
    }
})
