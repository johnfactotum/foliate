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

const { GObject, Gio, Gtk, Gdk, GdkPixbuf, cairo } = imports.gi
const ngettext = imports.gettext.ngettext
const {
    Obj, readJSON, fileFilters, sepHeaderFunc, formatPercent, markupEscape,
    scalePixbuf, shuffle, hslToRgb, colorFromString, isLight
} = imports.utils
const { PropertiesWindow } = imports.properties
const { Window } = imports.window
const { uriStore, library } = imports.uriStore
const { headlessViewer, EpubViewData } = imports.epubView
const { exportAnnotations } = imports.export

const { Catalog, catalogStore, CatalogRow, CatalogEditor } = imports.catalogs
const { OpdsClient, LoadBox, OpdsFeed, OpdsAcquisitionBox } = imports.opds

let Handy; try { Handy = imports.gi.Handy } catch (e) {}

const settings = new Gio.Settings({ schema_id: pkg.name + '.library' })

let trackerConnection
if (settings.get_boolean('use-tracker')) {
    try {
        const Tracker = imports.gi.Tracker
        trackerConnection = Tracker.SparqlConnection.get(null)
    } catch(e) {}
}

const BookImage =  GObject.registerClass({
    GTypeName: 'FoliateBookImage',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/bookImage.ui',
    InternalChildren: [
        'image', 'imageTitle', 'imageCreator', 'imageBox',
    ]
}, class BookImage extends Gtk.Overlay {
    loadCover(metadata) {
        const { identifier } = metadata
        const coverPath = EpubViewData.coverPath(identifier)
        try {
            // TODO: loading the file synchronously is probably bad
            const pixbuf = GdkPixbuf.Pixbuf.new_from_file(coverPath)
            this.load(pixbuf)
        } catch (e) {
            this.generate(metadata)
        }
    }
    generate(metadata) {
        const { title, creator, publisher } = metadata
        this._imageTitle.label = title || ''
        this._imageCreator.label = creator || ''
        const width = 120
        const height = 180
        const surface = new cairo.ImageSurface(cairo.Format.ARGB32, width, height)
        const context = new cairo.Context(surface)
        const bg = colorFromString(title + creator + publisher)
        const [r, g, b] = hslToRgb(...bg)
        context.setSourceRGBA(r, g, b, 1)
        context.paint()
        const pixbuf = Gdk.pixbuf_get_from_surface(surface, 0, 0, width, height)
        this.load(pixbuf)
        const className = isLight(r, g, b)
            ? 'foliate-book-image-light' : 'foliate-book-image-dark'
        this._imageBox.get_style_context().add_class(className)
        this._imageBox.show()
    }
    load(pixbuf) {
        // if thumbnail is too small,the experience is going to be bad
        // might as well just show generated cover
        // TODO: a slightly better way is to pack the tiny thumbnail inside the generated cover
        if (pixbuf.get_width() < 48) throw new Error('thumbnail too small')

        const factor = this.get_scale_factor()
        const surface = Gdk.cairo_surface_create_from_pixbuf(
            scalePixbuf(pixbuf, factor), factor, null)

        this._image.set_from_surface(surface)
        this._image.get_style_context().add_class('foliate-book-image')
    }
})

const BookBoxMenu =  GObject.registerClass({
    GTypeName: 'FoliateBookBoxMenu',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/bookBoxMenu.ui',
}, class BookBoxMenu extends Gtk.PopoverMenu {
    // TODO
})

const makeLibraryChild = (params, widget) => {
    params = Object.assign({
        Properties: {
            book: GObject.ParamSpec.object('book', 'book', 'book',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY, Obj.$gtype),
        }
    }, params)

    return GObject.registerClass(params, class LibraryChild extends widget {
        _init(params) {
            super._init(params)
            this.actionGroup = new Gio.SimpleActionGroup()
            const actions = {
                'properties': () => this.showProperties(),
                'edit': () => this.editBook(),
                'export': () => this.exportAnnotations(),
                'remove': () => this.removeBook(),
            }
            Object.keys(actions).forEach(name => {
                const action = new Gio.SimpleAction({ name })
                action.connect('activate', actions[name])
                this.actionGroup.add_action(action)
            })
            this.insert_action_group('lib-book', this.actionGroup)

            const { hasAnnotations } = this.book.value
            this.actionGroup.lookup_action('export').enabled = hasAnnotations
        }
        getMenu() {
            return new BookBoxMenu()
        }
        getProgress() {
            const { progress } = this.book.value
            if (progress && progress[1]) {
                const fraction = (progress[0] + 1) / (progress[1] + 1)
                return { progress, fraction, label: formatPercent(fraction) }
            }
            return {}
        }
        showProperties() {
            const { metadata } = this.book.value
            let cover = null
            try {
                const { identifier } = metadata
                const coverPath = EpubViewData.coverPath(identifier)
                cover = GdkPixbuf.Pixbuf.new_from_file(coverPath)
            } catch (e) {}
            const window = new PropertiesWindow({
                modal: true,
                title: _('About This Book'),
                transient_for: this.get_toplevel(),
                use_header_bar: true
            }, metadata, cover)
            window.show()
        }
        exportAnnotations() {
            const win = this.get_toplevel()
            const { metadata } = this.book.value
            const { identifier } = metadata
            const dataPath = EpubViewData.dataPath(identifier)
            const dataFile = Gio.File.new_for_path(dataPath)
            const data = readJSON(dataFile)
            exportAnnotations(win, data, metadata)
        }
        removeBook(window) {
            const id = this.book.value.identifier
            return this.get_parent().removeBooks([id], window)
        }
        editBook() {
            const { metadata } = this.book.value
            const { identifier } = metadata

            const builder = Gtk.Builder.new_from_resource(
                '/com/github/johnfactotum/Foliate/ui/bookEditDialog.ui')

            const $ = builder.get_object.bind(builder)
            const dialog = $('bookEditDialog')
            dialog.transient_for = this.get_toplevel()
            if (uriStore) {
                $('uriEntry').text = uriStore.get(identifier)
                $('uriBrowse').connect('clicked', () => {
                    const chooser = Gtk.FileChooserNative.new(
                        _('Choose File'),
                        dialog,
                        Gtk.FileChooserAction.OPEN,
                        null, null)
                    chooser.add_filter(fileFilters.all)
                    chooser.add_filter(fileFilters.ebook)
                    chooser.set_filter(fileFilters.ebook)
                    if (chooser.run() === Gtk.ResponseType.ACCEPT) {
                        const file = chooser.get_file()
                        $('uriEntry').text = file.get_uri()
                    }
                })
            } else {
                $('uriBox').sensitive = false
            }
            $('removeButton').connect('clicked', () => {
                if (this.removeBook(dialog)) dialog.close()
            })

            if (dialog.run() === Gtk.ResponseType.OK) {
                if (uriStore) {
                    uriStore.set(identifier, $('uriEntry').text)
                }
            }
            dialog.close()
        }
    })
}

const BookFlowBoxChild =
    makeLibraryChild({ GTypeName: 'FoliateBookFlowBoxChild' }, Gtk.FlowBoxChild)

const BookBoxChild =  GObject.registerClass({
    GTypeName: 'FoliateBookBoxChild',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/bookBoxChild.ui',
    InternalChildren: [
        'image', 'progressLabel', 'menuButton', 'emblem', 'select'
    ]
}, class BookBoxChild extends BookFlowBoxChild {
    _init(params) {
        super._init(params)
        const { identifier, metadata } = this.book.value

        if (uriStore) {
            const uri = uriStore.get(identifier)
            if (uri && !uri.startsWith('file:')) this._emblem.show()
        }

        this._image.loadCover(metadata)
        this._image.tooltip_markup = `<b>${markupEscape(metadata.title)}</b>`
            + (metadata.creator ? '\n' + markupEscape(metadata.creator) : '')

        const { label } = this.getProgress()
        if (label) this._progressLabel.label = label

        this._menuButton.popover = this.getMenu()
    }
    selectItem() {
        this._select.visible = true
    }
    deselectItem() {
        this._select.visible = false
    }
})

const BookListBoxRow =
    makeLibraryChild({ GTypeName: 'FoliateBookListBoxRow' }, Gtk.ListBoxRow)

const BookBoxRow =  GObject.registerClass({
    GTypeName: 'FoliateBookBoxRow',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/bookBoxRow.ui',
    InternalChildren: [
        'check',
        'title', 'creator', 'emblem',
        'progressGrid', 'progressBar', 'progressLabel',
        'menuButton'
    ]
}, class BookListRow extends BookListBoxRow {
    _init(params) {
        super._init(params)

        const { identifier, metadata: { title, creator } } = this.book.value
        this._title.label = title || ''
        if (creator) this._creator.label = creator
        else this._creator.hide()

        if (uriStore) {
            const uri = uriStore.get(identifier)
            if (uri && !uri.startsWith('file:')) this._emblem.show()
        }

        const { progress, fraction, label } = this.getProgress()
        if (progress && progress[1]) {
            this._progressBar.fraction = fraction
            this._progressLabel.label = label
            const bookSize = Math.min((progress[1] + 1) / 1500, 0.8)
            const steps = 20
            const span = Math.round(bookSize * steps) + 1
            this._progressGrid.child_set_property(this._progressBar, 'width', span)
            this._progressGrid.child_set_property(this._progressLabel, 'width', steps - span)
            this._progressGrid.child_set_property(this._progressLabel, 'left-attach', span)
        } else this._progressGrid.hide()

        this._menuButton.popover = this.getMenu()

        this._selected = false
        this._check.connect('toggled', () => {
            if (this._check.active !== this._selected) this.activate()
        })
    }
    selectItem() {
        this._selected = true
        this._check.active = true
    }
    deselectItem() {
        this._selected = false
        this._check.active = false
    }
    set enableSelection(x) {
        this._check.visible = x
    }
})

const LoadMoreRow = GObject.registerClass({
    GTypeName: 'FoliateLoadMoreRow'
}, class LoadMoreRow extends Gtk.ListBoxRow {
    _init(params) {
        super._init(params)
        this.add(new Gtk.Image({
            visible: true,
            icon_name: 'view-more-symbolic',
            margin: 12
        }))
        this.tooltip_text = _('Load more')
    }
})
const LoadMoreChild = GObject.registerClass({
    GTypeName: 'FoliateLoadMoreChild'
}, class LoadMoreChild extends Gtk.FlowBoxChild {
    _init(params) {
        super._init(params)
        const image = new Gtk.Image({
            visible: true,
            icon_name: 'view-more-horizontal-symbolic',
            width_request: 120,
            height_request: 180,
            halign: Gtk.Align.CENTER,
            valign: Gtk.Align.START
        })
        image.get_style_context().add_class('frame')
        this.add(image)
        this.tooltip_text = _('Load more')
    }
})

const LibrarySelection = GObject.registerClass({
    GTypeName: 'FoliateLibrarySelection',
    Signals: {
        'selection-changed': {
            flags: GObject.SignalFlags.RUN_FIRST,
            param_types: [GObject.TYPE_STRING, GObject.TYPE_STRING]
        },
    }
}, class LibrarySelection extends GObject.Object {
    _init(params) {
        super._init(params)
        this._set = new Set()
    }
    add(x) {
        this._set.add(x)
        this.emit('selection-changed', 'add', x)
    }
    delete(x) {
        this._set.delete(x)
        this.emit('selection-changed', 'delete', x)
    }
    clear() {
        this._set.clear()
        this.emit('selection-changed', 'clear', '')
    }
    has(x) {
        return this._set.has(x)
    }
    get size() {
        return this._set.size
    }
    toArray() {
        return Array.from(this._set)
    }
})

const makeLibraryWidget = (params, widget) => {
    const isListBox = widget === Gtk.ListBox
    const LoadMore = isListBox ? LoadMoreRow : LoadMoreChild
    const ChildWidget = isListBox ? BookBoxRow : BookBoxChild
    const activateSignal = isListBox ? 'row-activated' : 'child-activated'

    return GObject.registerClass(params, class LibraryWidget extends widget {
        _init(params) {
            super._init(params)
            if (isListBox) this.set_header_func(sepHeaderFunc)
            this._model = null
            this._bindModel(library.list)
            this.connect(activateSignal, this._onRowActivated.bind(this))

            const longpress = Gtk.GestureLongPress.new(this)
            longpress.propagation_phase = Gtk.PropagationPhase.CAPTURE
            longpress.connect('pressed', (gesture, x, y) => this._onRowRightClick(x, y))
            this.connect('button-press-event', (self, event) => {
                const [, button] = event.get_button()
                if (button === 3) {
                    const [, x, y] = event.get_coords()
                    this._onRowRightClick(x, y)
                }
            })
        }
        bindSelection(selection) {
            this._selection = selection
            const h = selection.connect('selection-changed', (_, type, id) => {
                const size = selection.size
                let f
                if (type === 'add') f = row => {
                    if (row.book.value.identifier === id) row.selectItem()
                }
                else if (type === 'delete') f = row => {
                    if (row.book.value.identifier === id) row.deselectItem()
                }
                else f = row => row.deselectItem()

                this.foreach(row => {
                    if (row instanceof LoadMore) return
                    f(row)
                    row.enableSelection = size
                })
            })
            this.connect('unrealize', () => selection.disconnect(h))
        }
        _bindModel(model) {
            if (model === this._model) return
            this._model = model
            this.bind_model(model, book => {
                if (book.value === 'load-more') return new LoadMore({
                    focus_on_click: false
                })
                const widget = new ChildWidget({ book })
                widget.enableSelection = this._selection && this._selection.size
                return widget
            })
        }
        search(query, fields) {
            this._selection.clear()
            const q = query ? query.trim() : ''
            if (q) {
                library.search(query, fields)
                this._bindModel(library.searchList)
            } else {
                this._bindModel(library.list)
            }
        }
        _onRowRightClick(x, y) {
            const row = isListBox ? this.get_row_at_y(y) : this.get_child_at_pos(x, y)
            this._selectRow(row)
        }
        _selectRow(row) {
            if (!row || row instanceof LoadMore) return
            const id = row.book.value.identifier
            const sel = this._selection
            if (sel.has(id)) sel.delete(id)
            else sel.add(id)
        }
        _onRowActivated(box, row) {
            if (row instanceof LoadMore) {
                if (this._model === library.searchList) library.searchNext()
                else library.next()
                return
            }
            if (this._selection.size) return this._selectRow(row)
            const id = row.book.value.identifier
            let uri
            if (uriStore) uri = uriStore.get(id)

            if (trackerConnection) {
                // get file url with Tracker
                try {
                    const sparql = `SELECT nie:url(?u) WHERE { ?u nie:identifier <${id}> }`
                    const cursor = trackerConnection.query(sparql, null)
                    cursor.next(null)
                    const url = cursor.get_string(0)[0]
                    if (url) uri = url
                } catch (e) {}
            }

            if (!uri) {
                const window = this.get_toplevel()
                const msg = new Gtk.MessageDialog({
                    text: _('File location unkown'),
                    secondary_text: _('Choose the location of this file to open it.'),
                    message_type: Gtk.MessageType.QUESTION,
                    buttons: Gtk.ButtonsType.OK_CANCEL,
                    modal: true,
                    transient_for: window
                })
                msg.set_default_response(Gtk.ResponseType.OK)
                const res = msg.run()
                if (res === Gtk.ResponseType.OK)
                    window.application.lookup_action('open').activate(null)
                msg.close()
                return
            }
            const file = Gio.File.new_for_uri(uri)
            this.get_toplevel().open(file)
        }
        removeBooks(ids, window = this.get_toplevel()) {
            const n = ids.length
            const msg = new Gtk.MessageDialog({
                text: ngettext(
                    'Are you sure you want to remove this book?',
                    'Are you sure you want to remove the %d selected books?', n).format(n),
                secondary_text: _('Reading progress, annotations, and bookmarks will be permanently lost.'),
                message_type: Gtk.MessageType.QUESTION,
                modal: true,
                transient_for: window
            })
            msg.add_button(_('Cancel'), Gtk.ResponseType.CANCEL)
            msg.add_button(_('Remove'), Gtk.ResponseType.ACCEPT)
            msg.set_default_response(Gtk.ResponseType.CANCEL)
            msg.get_widget_for_response(Gtk.ResponseType.ACCEPT)
                .get_style_context().add_class('destructive-action')
            const res = msg.run()
            const accept = res === Gtk.ResponseType.ACCEPT
            if (accept) {
                for (const id of ids) {
                    [
                        EpubViewData.dataPath(id),
                        EpubViewData.cachePath(id),
                        EpubViewData.coverPath(id)
                    ].forEach(path => {
                        try {
                            Gio.File.new_for_path(path).delete(null)
                        } catch (e) {}
                    })

                    library.remove(id)
                    if (uriStore) uriStore.delete(id)
                }
            }
            msg.close()
            return accept
        }
    })
}

const BookListBox = makeLibraryWidget({ GTypeName: 'FoliateBookListBox' }, Gtk.ListBox)

const BookFlowBox = makeLibraryWidget({ GTypeName: 'FoliateBookFlowBox' }, Gtk.FlowBox)

const setWindowSize = self => {
    self.default_width = settings.get_int('width')
    self.default_height = settings.get_int('height')

    self.connect('size-allocate', () => {
        const [width, height] = self.get_size()
        self._width = width
        self._height = height
    })
    self.connect('destroy', () => {
        settings.set_int('width', self._width)
        settings.set_int('height', self._height)
        settings.set_boolean('maximized', self.is_maximized)
    })
}

var LibraryWindow =  GObject.registerClass({
    GTypeName: 'FoliateLibraryWindow',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/libraryWindow.ui',
    InternalChildren: [
        'mainStack', 'titlebarStack',
        'stack', 'library', 'catalog', 'catalogColumn',
        'startButtonStack', 'endButtonStack', 'mainMenuButton',
        'searchButton', 'searchBar', 'searchEntry', 'searchMenuButton',
        'libraryStack', 'bookListBox', 'bookFlowBox', 'viewButton',
        'squeezer', 'squeezerLabel', 'switcherBar',
        'loadingBar', 'loadingProgressBar',
        'actionBar', 'selectionLabel',
        'catalogStack',
        'opdsHeaderBar', 'opdsBrowser', 'opdsMenuButton',
        'opdsSearchButton', 'opdsSearchBar', 'opdsSearchEntry',
        'opdsMenu', 'opdsMenuButtonsBox'
    ],
    Properties: {
        'active-view': GObject.ParamSpec.string('active-view', 'active-view', 'active-view',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, 'grid'),
    },
}, class LibraryWindow extends Gtk.ApplicationWindow {
    _init(params) {
        super._init(params)
        this.show_menubar = false

        setWindowSize(this)
        settings.bind('view-mode', this, 'active-view', Gio.SettingsBindFlags.DEFAULT)
        settings.bind('page', this._stack, 'visible-child-name', Gio.SettingsBindFlags.DEFAULT)

        this._opdsMenuButtonsBox.foreach(child => child.connect('clicked', () => this._opdsMenu.popdown()))

        const flag = GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE
        this._mainStack.bind_property('visible-child-name', this._titlebarStack, 'visible-child-name', flag)
        ;[this._startButtonStack, this._endButtonStack].forEach(stack =>
            this._stack.bind_property('visible-child-name', stack, 'visible-child-name', flag))

        this._opdsBrowser.bind_property('title', this._opdsHeaderBar, 'title', flag)
        this._mainStack.connect('notify::visible-child', stack => {
            if (stack.visible_child_name === 'library') this._opdsBrowser.reset()
            this._updateTitle()
        })
        this._opdsBrowser.connect('notify::title', () => this._updateTitle())
        this._updateTitle()

        this._opdsBrowser.connect('notify::searchable', () => this._updateOpdsSearch())
        this._opdsSearchBar.connect_entry(this._opdsSearchEntry)
        this._opdsSearchButton.bind_property('active', this._opdsSearchBar, 'search-mode-enabled', flag)
        this._opdsSearchEntry.connect('activate', entry =>
            this._opdsBrowser.search(entry.text))
        this._opdsSearchEntry.connect('stop-search', () =>
            this._opdsSearchBar.search_mode_enabled = false)

        if (Handy) {
            this._stack.child_set_property(this._library, 'icon-name', 'system-file-manager-symbolic')
            this._stack.child_set_property(this._catalog, 'icon-name', 'application-rss+xml-symbolic')
            this._switcherBar.show()
            this._squeezer.connect('notify::visible-child', () =>
                this._switcherBar.reveal = this._squeezer.visible_child === this._squeezerLabel)
        } else this._squeezerLabel.hide()

        this._buildDragDrop(this._library)

        const selection = new LibrarySelection()
        this._bookFlowBox.bindSelection(selection)
        this._bookListBox.bindSelection(selection)
        selection.connect('selection-changed', () => {
            const size = selection.size
            this._actionBar.visible = size > 0
            if (size) this._selectionLabel.label =
                ngettext('%d selected', '%d selected', size).format(size)
        })

        this.actionGroup = new Gio.SimpleActionGroup()
        const actions = {
            'selection-remove': () => {
                if (this._bookFlowBox.removeBooks(selection.toArray()))
                    selection.clear()
            },
            'selection-clear': () => selection.clear(),
            'add-files': () => this.runAddFilesDialog(),
            'add-files-stop': () => {
                headlessViewer.stop()
                this._loadingBar.hide()
            },
            'toggle-view': () => {
                this.set_property('active-view',
                    this.active_view === 'grid' ? 'list' : 'grid')
            },
            'grid-view': () => this.set_property('active-view', 'grid'),
            'list-view': () => this.set_property('active-view', 'list'),
            'search': () => {
                const button = this._mainStack.visible_child_name === 'opds'
                    ? this._opdsSearchButton
                    : this._stack.visible_child_name === 'library'
                        ? this._searchButton
                        : null
                if (button) button.active = !button.active
            },
            'catalog': () => {
                this._stack.visible_child_name = 'catalog'
                this._mainStack.visible_child_name = 'library'
            },
            'library': () => {
                this._stack.visible_child_name = 'library'
                this._mainStack.visible_child_name = 'library'
            },
            'add-catalog': () => this.addCatalog(),
            'learn-more-about-opds': () => {
                Gtk.show_uri_on_window(null, 'https://opds.io/', Gdk.CURRENT_TIME)
            },
            'opds-back': () => {
                const back = this._opdsBrowser.actionGroup.lookup_action('back')
                if (back.enabled) back.activate(null)
                else this._mainStack.visible_child_name = 'library'
            },
            'opds-add-catalog': () => {
                const catalog = new Catalog(this._opdsBrowser.getCatalog())
                this.addCatalog(catalog)
            },
            'main-menu': () => {
                const button = this._mainStack.visible_child_name === 'opds'
                    ? this._opdsMenuButton
                    : this._mainMenuButton
                button.active = !button.active
            },
            'close': () => this.close(),
        }
        Object.keys(actions).forEach(name => {
            const action = new Gio.SimpleAction({ name })
            action.connect('activate', actions[name])
            this.actionGroup.add_action(action)
        })
        this.insert_action_group('lib', this.actionGroup)
        const overlay = Gtk.Builder.new_from_resource(
            '/com/github/johnfactotum/Foliate/ui/shortcutsWindow.ui')
            .get_object('shortcutsWindow')
        overlay.section_name = 'library-shortcuts'
        this.set_help_overlay(overlay)

        this.insert_action_group('opds', this._opdsBrowser.actionGroup)

        const updateViewButton = () =>
            this._viewButton.get_child().icon_name = this.active_view === 'grid'
                ? 'view-list-symbolic' : 'view-grid-symbolic'
        updateViewButton()
        this.connect('notify::active-view', () => {
            updateViewButton()
            this._updateLibraryStack()
        })

        this._buildSearchOptions()

        this._searchButton.bind_property('active', this._searchBar, 'search-mode-enabled', flag)
        this._searchBar.connect_entry(this._searchEntry)
        this._searchBar.connect('notify::search-mode-enabled', () => this._updateLibraryStack())
        this._searchEntry.connect('search-changed', () => this._doSearch())
        this._searchEntry.connect('activate', () => this._doSearch())
        this._searchEntry.connect('stop-search', () =>
            this._searchBar.search_mode_enabled = false)

        this.connect('key-press-event', (__, event) => {
            if (this._mainStack.visible_child_name === 'opds')
                return this._opdsSearchBar.handle_event(event)
            else if (this._stack.visible_child_name === 'library')
                return this._searchBar.handle_event(event)
        })

        // if there's only one item (likely the 'load-more' item), load some books
        // otherwise there's already some books loaded and no need to do that
        if (library.list.get_n_items() === 1) library.next()
        const listHandler = library.list
            .connect('items-changed', () => this._updateLibraryStack())
        const searchListHAndler = library.searchList
            .connect('items-changed', () => this._updateLibraryStack())
        this._updateLibraryStack()

        const viewerHandler = headlessViewer.connect('progress', (viewer, progress, total) => {
            this._loadingBar.show()
            this._loadingProgressBar.fraction = progress / total
            if (progress === total) {
                this._loadingBar.hide()
                this._loadingProgressBar.fraction = 0

                const failed = headlessViewer.failed
                const n = failed.length
                if (n) {
                    const msg = new Gtk.MessageDialog({
                        text: ngettext('Failed to add book',
                            'Failed to add books', n),
                        secondary_text: ngettext('Could not add the following file:',
                            'Could not add the following files:', n),
                        message_type: Gtk.MessageType.ERROR,
                        buttons: [Gtk.ButtonsType.OK],
                        modal: true,
                        transient_for: this
                    })

                    const names = failed.map(x => x.get_basename()).join('\n')
                    const label = new Gtk.Label({
                        visible: true,
                        label: names,
                        valign: Gtk.Align.START,
                        xalign: 0,
                        margin: 6,
                        selectable: true
                    })
                    const scrolled = new Gtk.ScrolledWindow({
                        visible: true,
                        min_content_height: 100
                    })
                    scrolled.get_style_context().add_class('frame')
                    scrolled.add(label)
                    msg.message_area.pack_start(scrolled, false, true, 0)

                    msg.run()
                    msg.destroy()
                }
            }
        })
        this.connect('destroy', () => {
            library.list.disconnect(listHandler)
            library.searchList.disconnect(searchListHAndler)
            headlessViewer.disconnect(viewerHandler)
        })

        this._loadCatalogs()
    }
    _updateTitle() {
        if (this._mainStack.visible_child_name === 'library')
            this.title = _('Foliate')
        else this.title = this._opdsBrowser.title
    }
    _updateOpdsSearch() {
        const searchable = this._opdsBrowser.searchable
        if (!searchable) this._opdsSearchButton.active = false
        this._opdsSearchButton.sensitive = searchable
        this._opdsSearchButton.visible = searchable
    }
    _buildDragDrop(widget) {
        widget.drag_dest_set(Gtk.DestDefaults.ALL, [], Gdk.DragAction.COPY)
        const targetList = widget.drag_dest_get_target_list() || Gtk.TargetList.new([])
        targetList.add_uri_targets(0)
        widget.drag_dest_set_target_list(targetList)
        widget.connect('drag-data-received', (widget, context, x, y, data, info, time) => {
            const uris = data.get_uris()
            if (!uris) {
                Gtk.drag_finish(context, false, false, time)
                return
            }
            const files = uris.map(uri => Gio.File.new_for_uri(uri))
            headlessViewer.openFiles(files)
            Gtk.drag_finish(context, true, false, time)
        })
    }
    _buildSearchOptions() {
        const searchPopover = new Gtk.Popover()
        const searchBox = new Gtk.Box({
            visible: true,
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 3,
            margin: 10
        })
        const all = Gtk.RadioButton.new_with_label_from_widget(null, _('All'))
        searchBox.pack_start(all, false, true, 0)
        const fields = [
            ['title', _('Title')],
            ['creator', _('Author')],
            ['subjects', _('Tags')],
            ['description', _('Description')],
            ['publisher', _('Publisher')],
            ['language', _('Language')],
        ]
        const radios = {}
        fields.forEach(([name, label]) => {
            const radio = Gtk.RadioButton.new_with_label_from_widget(all, label)
            radios[name] = radio
            searchBox.pack_start(radio, false, true, 0)
            radio.connect('toggled', () => this._doSearch())
        })
        searchBox.show_all()
        searchPopover.add(searchBox)
        this._searchMenuButton.popover = searchPopover

        this._getSearchFields = () => all.active
            ? Object.keys(radios)
            : [Object.keys(radios).find(x => radios[x].active === true)]
    }
    _doSearch() {
        const text = this._searchEntry.text
        const fields = this._getSearchFields()
        this._bookFlowBox.search(text, fields)
        this._bookListBox.search(text, fields)
        this._updateLibraryStack()
    }
    _updateLibraryStack() {
        const stack = this._libraryStack
        const search = this._searchBar.search_mode_enabled
        if (search && library.searchList.get_n_items())
            stack.visible_child_name = this.active_view
        else if (search && this._searchEntry.text.trim() !== '')
            stack.visible_child_name = 'search-empty'
        else
            stack.visible_child_name = library.list.get_n_items()
                ? this.active_view : 'empty'
    }
    runAddFilesDialog() {
        const dialog = Gtk.FileChooserNative.new(
            _('Add Files'),
            this,
            Gtk.FileChooserAction.OPEN,
            null, null)
        dialog.select_multiple = true
        dialog.add_filter(fileFilters.all)
        dialog.add_filter(fileFilters.ebook)
        dialog.set_filter(fileFilters.ebook)

        if (dialog.run() !== Gtk.ResponseType.ACCEPT) return

        const files = dialog.get_files()
        headlessViewer.openFiles(files)
    }
    open(file) {
        new Window({ application: this.application, file }).present()
        this.close()
    }
    openCatalog(uri) {
        this._opdsBrowser.loadOpds(uri)
        this._mainStack.visible_child_name = 'opds'
    }
    addCatalog(catalog) {
        const editor = new CatalogEditor(catalog)
        const dialog = editor.widget
        dialog.transient_for = this
        if (dialog.run() === Gtk.ResponseType.OK) catalogStore.add(editor.catalog)
        dialog.destroy()
    }
    _loadCatalogs() {
        const preview = preview => preview ? new LoadBox({
            visible: true,
            hexpand: true
        }, () => {
            const widget = new OpdsFeed({ visible: true, uri: preview })

            widget.connect('loaded', () => {
                const feed = widget.feed
                let entries = feed.entries

                if (preview.includes('gutenberg.org')) entries = entries.slice(3)

                const scrolled = new Gtk.ScrolledWindow({
                    visible: true,
                    propagate_natural_height: true
                })
                const max_entries = 4
                const opdsbox = new OpdsAcquisitionBox({
                    visible: true,
                    max_entries,
                    max_children_per_line: max_entries,
                    min_children_per_line: max_entries,
                    margin_start: 12,
                    margin_end: 12
                }, shuffle)
                opdsbox.connect('image-draw', () => {
                    scrolled.min_content_height = opdsbox.get_allocation().height
                })
                opdsbox.connect('link-activated', (box, href, type) => {
                    if (OpdsClient.typeIsOpds(type)) this.openCatalog(href)
                    else Gtk.show_uri_on_window(null, href, Gdk.CURRENT_TIME)
                })
                opdsbox.load(entries)
                scrolled.add(opdsbox)
                widget.add(scrolled)
            })
            return widget
        }) : null

        const catalogs = catalogStore.catalogs
        const listbox = new Gtk.ListBox({
            visible: true,
            valign: Gtk.Align.START
        })
        listbox.set_header_func(sepHeaderFunc)
        listbox.bind_model(catalogs, catalog =>
            new CatalogRow(catalog, preview, () => this.openCatalog(catalog.uri)))
        listbox.get_style_context().add_class('frame')
        this._catalogColumn.add(listbox)

        const update = () => {
            this._catalogStack.visible_child_name =
                catalogs.get_n_items() ? 'catalogs' : 'empty'
        }
        update()
        catalogs.connect('items-changed', update)
    }
})
