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

const { GObject, Gio, GLib, Gtk, Gdk, GdkPixbuf, WebKit2, Pango, cairo } = imports.gi
const ngettext = imports.gettext.ngettext
const { debug, locales, formatPercent,
    Obj, base64ToPixbuf, scalePixbuf, markupEscape,
    shuffle, hslToRgb, colorFromString, isLight, fileFilters,
    linkIsRel, makeLinksButton, sepHeaderFunc,
    user_agent } = imports.utils
const { PropertiesBox, PropertiesWindow } = imports.properties
const { Window } = imports.window
const { uriStore, library } = imports.uriStore
const { catalogStore, CatalogRow, CatalogEditor } = imports.catalogs
const { headlessViewer, EpubViewData } = imports.epubView
let Handy; try { Handy = imports.gi.Handy } catch (e) {}
const { HdyColumn } = imports.handy

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
                'remove': () => this.removeBook(),
            }
            Object.keys(actions).forEach(name => {
                const action = new Gio.SimpleAction({ name })
                action.connect('activate', actions[name])
                this.actionGroup.add_action(action)
            })
            this.insert_action_group('lib-book', this.actionGroup)
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

const htmlPath = pkg.pkgdatadir + '/assets/client.html'
class OpdsClient {
    constructor() {
        this._promises = new Map()

        this._webView = new WebKit2.WebView({
            settings: new WebKit2.Settings({
                enable_write_console_messages_to_stdout: true,
                allow_universal_access_from_file_urls: true,
                user_agent
            })
        })
        const runResource = resource => new Promise((resolve) =>
            this._webView.run_javascript_from_gresource(resource, null, () => resolve()))
        const loadScripts = async () => {
            await runResource('/com/github/johnfactotum/Foliate/web/utils.js')
            await runResource('/com/github/johnfactotum/Foliate/web/opds.js')
        }
        this._webView.connect('load-changed', (webView, event) => {
            if (event == WebKit2.LoadEvent.FINISHED) loadScripts()
        })
        const contentManager = this._webView.get_user_content_manager()
        contentManager.connect('script-message-received::action', (_, jsResult) => {
            const data = jsResult.get_js_value().to_string()
            const { type, payload, token } = JSON.parse(data)
            switch (type) {
                case 'ready':
                    this._promises.get('ready').resolve()
                    break
                case 'error':
                    this._promises.get(token).reject(new Error(payload))
                    break
                case 'opensearch':
                case 'entry':
                case 'feed': {
                    this._promises.get(token).resolve(payload)
                    break
                }
                case 'image': {
                    const pixbuf = base64ToPixbuf(payload)
                    this._promises.get(token).resolve(pixbuf)
                    break
                }
            }
        })
        contentManager.register_script_message_handler('action')
        this._webView.load_uri(GLib.filename_to_uri(htmlPath, null))
        this._webView.connect('destroy', () => {
            Array.from(this._promises.values()).forEach(({ reject }) =>
                reject(new Error('OPDS: WebView destroyed')))
        })
    }
    _run(script) {
        this._webView.run_javascript(script, null, () => {})
    }
    init() {
        return this._makePromise('ready')
    }
    get(uri) {
        debug('OPDS: getting ' + uri)
        const token = this._makeToken()
        this._run(`getFeed(
            decodeURI("${encodeURI(uri)}"),
            decodeURI("${encodeURI(token)}"))`)
        return this._makePromise(token)
    }
    getImage(uri) {
        const token = this._makeToken()
        this._run(`getImage(
            decodeURI("${encodeURI(uri)}"),
            decodeURI("${encodeURI(token)}"))`)
        return this._makePromise(token)
    }
    getOpenSearch(query, uri) {
        const token = this._makeToken()
        this._run(`getOpenSearch(
            "${encodeURIComponent(query)}",
            decodeURI("${encodeURI(uri)}"),
            decodeURI("${encodeURI(token)}"))`)
        return this._makePromise(token)
    }
    _makePromise(token) {
        return new Promise((resolve, reject) =>
            this._promises.set(token, {
                resolve: arg => {
                    resolve(arg)
                    this._promises.delete(token)
                },
                reject: arg => {
                    reject(arg)
                    this._promises.delete(token)
                }
            }))
    }
    _makeToken() {
        return Math.random() + '' + new Date().getTime()
    }
    close() {
        this._webView.destroy()
    }
}

const opdsEntryToMetadata = entry => {
    const {
        title, summary, publisher, language, identifier, rights,
        published, updated, issued, extent,
        authors = [],
        categories = []
    } = entry
    return {
        title, publisher, language, identifier, rights,
        // Translators: this is the punctuation used to join together a list of
        // authors or categories
        creator: authors.map(x => x.name).join(_(', ')),
        categories: categories.map(x => x.label || x.term),
        description: summary,
        pubdate: issued || published,
        modified_date: updated,
        extent
    }
}

const LoadBox = GObject.registerClass({
    GTypeName: 'FoliateLoadBox'
}, class LoadBox extends Gtk.Stack {
    _init(params, load) {
        super._init(params)
        const spinner = new Gtk.Spinner({
            visible: true,
            active: true,
            valign: Gtk.Align.CENTER,
            halign: Gtk.Align.CENTER,
            width_request: 64,
            height_request: 64
        })
        this.add_named(spinner, 'loading')
        const error = new Gtk.Label({
            visible: true,
            label: _('Unable to load OPDS feed')
        })
        this.add_named(error, 'error')
        let loaded
        this.connect('realize', () => {
            if (loaded) return
            const widget = load()
            this.add_named(widget, 'loaded')
            widget.connect('loaded', () => {
                this.visible_child_name = 'loaded'
            })
            widget.connect('error', () => {
                this.visible_child_name = 'error'
            })
            loaded = true
        })
    }
})

const formatPrice = ({ currencycode, value }) => {
    try {
        return new Intl.NumberFormat(locales,
            { style: 'currency', currency: currencycode }).format(value)
    } catch (e) {
        return (currencycode ? currencycode + ' ' : '') + value
    }
}

const getIndirectAcquisition = link => {
    const types = [link.type]
    while ('indirectAcquisition' in link) {
        link = link.indirectAcquisition
        types.push(link.type)
    }
    return {
        types,
        type: types[types.length - 1],
        drm: types.includes('application/vnd.adobe.adept+xml')
    }
}

const makeAcquisitionButton = (links, onActivate) => {
    links = links
        .filter(x => x.type !== 'application/atom+xml;type=entry;profile=opds-catalog')
    const rel = links[0].rel.split('/').pop()
    let label = _('Download')
    switch (rel) {
        case 'buy': label = _('Buy'); break
        case 'open-access': label = _('Free'); break
        case 'sample': label = _('Sample'); break
        case 'borrow': label = _('Borrow'); break
        case 'subscribe': label = _('Subscribe'); break
    }
    if (links.length === 1) {
        const link = links[0]

        if (link.price) label = formatPrice(link.price)

        const { title } = link
        const { type, drm } = getIndirectAcquisition(link)

        let button = new Gtk.Button({
            tooltip_text: title || Gio.content_type_get_description(type)
        })
        if (drm) {
            const buttonBox = new Gtk.Box({ spacing: 3 })
            const icon = new Gtk.Image({
                icon_name: 'emblem-drm-symbolic',
                tooltip_text: _('Protected by DRM')
            })
            buttonBox.pack_start(new Gtk.Label({ label }), true, true, 0)
            buttonBox.pack_end(icon, false, true, 0)
            button.add(buttonBox)
        } else {
            button.label = label
        }
        button.show_all()
        button.connect('clicked', () => onActivate(link))
        return button
    } else {
        const buttonLinks = links.map(link => {
            const { href } = link
            const { type, drm } = getIndirectAcquisition(link)
            const price = link.price ? ' ' + formatPrice(link.price) : ''
            let title = (link.title || Gio.content_type_get_description(type))
            if (price) title += price
            if (drm) title += _(' (DRM)')
            return {
                href, type, title,
                tooltip: type
            }
        })
        const button = makeLinksButton({ visible: true, label }, buttonLinks, onActivate)
        return button
    }
}

const makeAcquisitionButtons = (links = []) => {
    const map = new Map()
    links.filter(x => x.rel.startsWith('http://opds-spec.org/acquisition'))
        .forEach(x => {
            if (!map.has(x.rel)) map.set(x.rel, [x])
            else map.get(x.rel).push(x)
        })
    return Array.from(map.values()).map((links, i) => {
        const button = makeAcquisitionButton(links, ({ type, href }) => {
            // open in a browser
            Gtk.show_uri_on_window(null, href, Gdk.CURRENT_TIME)
            //Gio.AppInfo.launch_default_for_uri(href, null)

            // or, open with app directly
            // const appInfo = Gio.AppInfo.get_default_for_type(type, true)
            // appInfo.launch_uris([href], null)
        })
        if (i === 0) button.get_style_context().add_class('suggested-action')
        return button
    })
}

const OpdsEntryBox =  GObject.registerClass({
    GTypeName: 'FoliateOpdsEntryBox',
    Properties: {
        entry: GObject.ParamSpec.object('entry', 'entry', 'entry',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY, Obj.$gtype),
    }
}, class OpdsEntryBox extends Gtk.Box {
    _init(params) {
        super._init(params)
        this.orientation = Gtk.Orientation.VERTICAL

        const scrolled = new Gtk.ScrolledWindow({
            visible: true
        })
        const propertiesBox = new PropertiesBox({
            visible: true,
            border_width: 12
        }, opdsEntryToMetadata(this.entry.value), null)
        scrolled.add(propertiesBox)
        this.pack_start(scrolled, true, true, 0)

        const acquisitionBox = new Gtk.Box({
            visible: true,
            spacing: 6,
            border_width: 12,
            orientation: Gtk.Orientation.VERTICAL
        })
        this.pack_end(acquisitionBox, false, true, 0)

        const { links } = this.entry.value
        const acquisitionButtons = makeAcquisitionButtons(links)
        acquisitionButtons.forEach(button =>
            acquisitionBox.pack_start(button, false, true, 0))
        if (acquisitionButtons.length < 3) {
            acquisitionBox.orientation = Gtk.Orientation.HORIZONTAL
            acquisitionBox.homogeneous = true
        }
        if (acquisitionButtons.length) acquisitionButtons[0].grab_focus()
    }
})


const OpdsFullEntryBox =  GObject.registerClass({
    GTypeName: 'FoliateOpdsFullEntryBox',
}, class OpdsFullEntryBox extends Gtk.Box {
    _init(params) {
        super._init(params)
        this.orientation = Gtk.Orientation.VERTICAL
    }
    async load(entry) {
        let pixbuf
        const client = new OpdsClient()
        await client.init()
        try {
            const thumbnail = entry.links
                .find(x => x.rel === 'http://opds-spec.org/image/thumbnail')
            if (thumbnail) pixbuf = await client.getImage(thumbnail.href)
        } finally {
            client.close()
        }

        const propertiesBox = new PropertiesBox({
            visible: true,
            border_width: 12
        }, opdsEntryToMetadata(entry), pixbuf)
        this.pack_start(propertiesBox, true, true, 0)

        const acquisitionBox = new Gtk.Box({
            visible: true,
            spacing: 6,
            margin_top: 12,
            orientation: Gtk.Orientation.VERTICAL
        })
        propertiesBox.actionArea.pack_start(acquisitionBox, false, true, 0)

        const { links } = entry
        const acquisitionButtons = makeAcquisitionButtons(links)
        acquisitionButtons.forEach(button =>
            acquisitionBox.pack_start(button, false, true, 0))
        if (acquisitionButtons.length < 3) {
            acquisitionBox.orientation = Gtk.Orientation.HORIZONTAL
            acquisitionBox.homogeneous = true
        }
        if (acquisitionButtons.length) acquisitionButtons[0].grab_focus()
    }
})

const OpdsFeed = GObject.registerClass({
    GTypeName: 'FoliateOpdsFeed',
    Properties: {
        uri: GObject.ParamSpec.string('uri', 'uri', 'uri',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY, ''),
    },
    Signals: {
        'loaded': { flags: GObject.SignalFlags.RUN_FIRST },
        'error': { flags: GObject.SignalFlags.RUN_FIRST },
    }
}, class OpdsFeed extends Gtk.Bin {
    _init(params) {
        super._init(params)
        if (this.uri) {
            const client = new OpdsClient()
            client.init()
                .then(() => client.get(this.uri))
                .then(feed => {
                    this.feed = feed
                    this.emit('loaded')
                })
                .catch(e => {
                    logError(e)
                    this.emit('error')
                })
                .then(() => client.close())
        }
    }
})

const OpdsBoxChild =  GObject.registerClass({
    GTypeName: 'FoliateOpdsBoxChild',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/opdsBoxChild.ui',
    InternalChildren: [
        'image', 'title'
    ],
    Properties: {
        entry: GObject.ParamSpec.object('entry', 'entry', 'entry',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY, Obj.$gtype),
    }
}, class OpdsBoxChild extends Gtk.FlowBoxChild {
    _init(params) {
        super._init(params)
        const { title } = this.entry.value
        this._title.label = title
    }
    loadCover(pixbuf) {
        this._image.load(pixbuf)
    }
    generateCover() {
        const entry = this.entry.value
        const metadata = opdsEntryToMetadata(entry)
        if (!isCatalogEntry(entry) && !metadata.creator) {
            metadata.creator = entry.content
        }
        this._image.generate(metadata)
    }
    get image() {
        return this._image
    }
})

const OpdsAcquisitionBox = GObject.registerClass({
    GTypeName: 'FoliateOpdsAcquisitionBox',
    Properties: {
        'max-entries':
            GObject.ParamSpec.int('max-entries', 'max-entries', 'max-entries',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, 0, 2147483647, 0),
        uri: GObject.ParamSpec.string('uri', 'uri', 'uri',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY, ''),
    },
    Signals: {
        'loaded': { flags: GObject.SignalFlags.RUN_FIRST },
        'error': { flags: GObject.SignalFlags.RUN_FIRST },
        'image-draw': { flags: GObject.SignalFlags.RUN_FIRST },
        'link-activated': {
            flags: GObject.SignalFlags.RUN_FIRST,
            param_types: [GObject.TYPE_STRING, GObject.TYPE_STRING]
        },
    }
}, class OpdsAcquisitionBox extends Gtk.FlowBox {
    _init(params, sort) {
        super._init(Object.assign({
            valign: Gtk.Align.START,
            row_spacing: 12,
            column_spacing: 12,
            homogeneous: true,
            activate_on_single_click: true,
            selection_mode: Gtk.SelectionMode.NONE
        }, params))
        this.sort = sort

        this.connect('child-activated', (flowbox, child) => {
            const entry = child.entry.value
            if (!isCatalogEntry(entry)) {
                const { href, type } = entry.links[0]
                this.emit('link-activated', href, type)
                return
            }
            const popover = new Gtk.Popover({
                relative_to: child.image,
                width_request: 320,
                height_request: 320
            })
            const entryBox = new OpdsEntryBox({
                visible: true,
                entry: child.entry,
            })
            popover.add(entryBox)
            popover.popup()
        })
        if (this.uri) {
            const client = new OpdsClient()
            client.init()
                .then(() => client.get(this.uri))
                .then(({ entries }) => this.load(entries))
                .catch(this.error.bind(this))
                .then(() => client.close())
        }
    }
    async load(entries) {
        this.emit('loaded')
        if (!entries) return // TODO: empty placeholder
        let loadCount = 0
        const client = new OpdsClient()
        await client.init()
        const list = new Gio.ListStore()
        if (this.sort) entries = this.sort(entries.slice(0))
        if (this.max_entries) entries = entries.slice(0, this.max_entries)
        entries.forEach(entry => list.append(new Obj(entry)))
        this.bind_model(list, entry => {
            const child = new OpdsBoxChild({ entry })
            const thumbnail = entry.value.links
                .find(x => x.rel === 'http://opds-spec.org/image/thumbnail')
            child.image.connect('draw', () => this.emit('image-draw'))
            child.image.connect('realize', () => {
                if (thumbnail)
                    client.getImage(thumbnail.href)
                        .then(pixbuf => child.loadCover(pixbuf))
                        .catch(() => child.generateCover())
                        .then(() => {
                            loadCount++
                            if (loadCount === entries.length) client.close()
                        })
                else {
                    child.generateCover()
                    loadCount++
                    if (loadCount === entries.length) client.close()
                }
            })
            return child
        })
    }
    error(e) {
        logError(e)
        this.emit('error')
    }
})

const NavigationRow =  GObject.registerClass({
    GTypeName: 'FoliateNavigationRow',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/navigationRow.ui',
    InternalChildren: ['title', 'content', 'count', 'select'],
    Properties: {
        entry: GObject.ParamSpec.object('entry', 'entry', 'entry',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY, Obj.$gtype),
    }
}, class NavigationRow extends Gtk.ListBoxRow {
    _init(params) {
        super._init(params)
        const { title, content, links } = this.entry.value
        this._title.label = title || ''
        if (content) this._content.label = content
        else this._content.hide()

        const count = links[0].count
        if (typeof count === 'string') this._count.label = count
        else this._count.hide()

        const activeFacet = links[0].activeFacet
        if (activeFacet) this._select.show()
    }
})

const OpdsNavigationBox = GObject.registerClass({
    GTypeName: 'FoliateOpdsNavigationBox',
    Properties: {
        uri: GObject.ParamSpec.string('uri', 'uri', 'uri',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY, ''),
        facet: GObject.ParamSpec.boolean('facet', 'facet', 'facet',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY, false),
    },
    Signals: {
        'loaded': { flags: GObject.SignalFlags.RUN_FIRST },
        'error': { flags: GObject.SignalFlags.RUN_FIRST },
        'link-activated': {
            flags: GObject.SignalFlags.RUN_FIRST,
            param_types: [GObject.TYPE_STRING, GObject.TYPE_STRING]
        },
    }
}, class OpdsNavigationBox extends Gtk.ListBox {
    _init(params) {
        super._init(params)
        this.get_style_context().add_class('frame')

        this._map = new Map()

        this.connect('row-activated', (listbox, row) => {
            const entry = this._map.get(row).value
            const { href, type } = entry.links[0]
            this.emit('link-activated', href, type)
        })

        if (this.facet) {
            let lastGroup
            this.set_header_func(row => {
                const index = row.get_index()
                const entry = this._map.get(row).value
                const group = entry.links[0].facetGroup
                if (group && group !== lastGroup) {
                    const box = new Gtk.Box({
                        orientation: Gtk.Orientation.VERTICAL,
                    })
                    if (index) box.pack_start(new Gtk.Separator(), false, true, 0)
                    const label = new Gtk.Label({
                        label: `<b>${markupEscape(group)}</b>`,
                        margin_top: index ? 18 : 6,
                        margin_bottom: 6,
                        margin_start: 6,
                        margin_end: 6,
                        use_markup: true,
                        justify: Gtk.Justification.CENTER,
                        ellipsize: Pango.EllipsizeMode.END,
                    })
                    label.get_style_context().add_class('dim-label')
                    box.pack_start(label, false, true, 0)
                    box.pack_start(new Gtk.Separator(), false, true, 0)
                    box.show_all()
                    row.set_header(box)
                } else if (index) row.set_header(new Gtk.Separator())
                lastGroup = group
            })
        } else this.set_header_func(sepHeaderFunc)

        if (this.uri) {
            const client = new OpdsClient()
            client.init()
                .then(() => client.get(this.uri))
                .then(({ entries }) => this.load(entries))
                .catch(this.error.bind(this))
                .then(() => client.close())
        }
    }
    load(entries) {
        this.emit('loaded')
        if (!entries) return // TODO: empty placeholder
        const list = new Gio.ListStore()
        entries.forEach(entry => list.append(new Obj(entry)))
        this.bind_model(list, entry => {
            const row = new NavigationRow({ entry })
            this._map.set(row, entry)
            return row
        })
    }
    error(e) {
        logError(e)
        this.emit('error')
    }
})

const isAcquisitionFeed = feed => feed.entries && feed.entries.some(isCatalogEntry)

const isCatalogEntry = entry => entry.links && entry.links.some(link =>
    linkIsRel(link, rel => rel.startsWith('http://opds-spec.org/acquisition')))

const typeIsOpds = type =>
    // should probably check "profile=opds-catalog" too/instead
    type.includes('application/atom+xml')

const OpdsBox = GObject.registerClass({
    GTypeName: 'FoliateOpdsBox',
    Properties: {
        uri: GObject.ParamSpec.string('uri', 'uri', 'uri',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY, ''),
    },
    Signals: {
        'loaded': { flags: GObject.SignalFlags.RUN_FIRST },
        'error': { flags: GObject.SignalFlags.RUN_FIRST },
    }
}, class OpdsBox extends Gtk.Bin {
    _init(params) {
        super._init(params)
        if (this.uri) {
            const client = new OpdsClient()
            client.init()
                .then(() => client.get(this.uri))
                .then(this.load.bind(this))
                .catch(this.error.bind(this))
                .then(() => client.close())
        }
    }
    load(feed) {
        this.feed = feed
        const opdsbox = feed.isEntry
            ? new OpdsFullEntryBox({ visible: true, margin: 18 })
            : isAcquisitionFeed(feed)
                ? new OpdsAcquisitionBox({ visible: true, margin: 18 })
                : new OpdsNavigationBox({ visible: true, margin: 18 })
        if (feed.isEntry) opdsbox.load(feed)
        else opdsbox.load(feed.entries)
        this.add(opdsbox)
        this.emit('loaded')
    }
    error(e) {
        logError(e)
        this.emit('error')
    }
})

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
        'stack', 'library', 'catalog', 'catalogColumn',
        'startButtonStack', 'endButtonStack', 'mainMenuButton',
        'searchButton', 'searchBar', 'searchEntry', 'searchMenuButton',
        'libraryStack', 'bookListBox', 'bookFlowBox', 'viewButton',
        'squeezer', 'squeezerLabel', 'switcherBar',
        'loadingBar', 'loadingProgressBar',
        'actionBar', 'selectionLabel',
        'catalogStack'
    ],
    Properties: {
        'active-view': GObject.ParamSpec.string('active-view', 'active-view', 'active-view',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, 'grid'),
    },
}, class LibraryWindow extends Gtk.ApplicationWindow {
    _init(params) {
        super._init(params)
        this.show_menubar = false
        this.title = _('Foliate')

        setWindowSize(this)
        settings.bind('view-mode', this, 'active-view', Gio.SettingsBindFlags.DEFAULT)

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
            'search': () => this._searchButton.active = !this._searchButton.active,
            'catalog': () => this._stack.visible_child_name = 'catalog',
            'add-catalog': () => this.addCatalog(),
            'learn-more-about-opds': () => {
                Gtk.show_uri_on_window(null, 'https://opds.io/', Gdk.CURRENT_TIME)
            },
            'main-menu': () => this._mainMenuButton.active = !this._mainMenuButton.active,
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

        const flag = GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE
        ;[this._startButtonStack, this._endButtonStack].forEach(stack =>
            this._stack.bind_property('visible-child-name', stack, 'visible-child-name', flag))

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
        this.connect('key-press-event', (__, event) => this._searchBar.handle_event(event))
        this._searchBar.connect_entry(this._searchEntry)
        this._searchBar.connect('notify::search-mode-enabled', () => this._updateLibraryStack())
        this._searchEntry.connect('search-changed', () => this._doSearch())
        this._searchEntry.connect('activate', () => this._doSearch())
        this._searchEntry.connect('stop-search', () =>
            this._searchBar.search_mode_enabled = false)

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
        // this.close()
    }
    openCatalog(uri) {
        const window = new OpdsWindow({ application: this.application })
        window.loadOpds(uri)
        window.present()
    }
    addCatalog() {
        const editor = new CatalogEditor()
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
                    if (typeIsOpds(type)) this.openCatalog(href)
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

var OpdsWindow =  GObject.registerClass({
    GTypeName: 'FoliateOpdsWindow',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/opdsWindow.ui',
    InternalChildren: [
        'mainBox', 'backButton', 'homeButton',
        'searchButton', 'searchBar', 'searchEntry'
    ],
}, class OpdsWindow extends Gtk.ApplicationWindow {
    _init(params) {
        super._init(params)
        this.show_menubar = false
        this.title = _('Foliate')
        setWindowSize(this)

        this._history = []
        this._searchLink = null

        this.actionGroup = new Gio.SimpleActionGroup()
        const actions = {
            'back': () => this._goBack(),
            'home': () => this._goHome()
        }
        Object.keys(actions).forEach(name => {
            const action = new Gio.SimpleAction({ name })
            action.connect('activate', actions[name])
            this.actionGroup.add_action(action)
        })
        this.insert_action_group('opds', this.actionGroup)
        const overlay = Gtk.Builder.new_from_resource(
            '/com/github/johnfactotum/Foliate/ui/shortcutsWindow.ui')
            .get_object('shortcutsWindow')
        this.set_help_overlay(overlay)

        const flag = GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE
        this._searchButton.bind_property('active', this._searchBar, 'search-mode-enabled', flag)
        this._searchBar.connect('notify::search-mode-enabled', ({ search_mode_enabled }) => {
            if (search_mode_enabled) this._searchEntry.grab_focus()
        })

        const handleSearchEntry = ({ text }) => {
            if (!this._searchLink) return
            const query = text.trim()
            if (!query) return

            this._opdsWidget.destroy()
            this._opdsWidget = new Gtk.Spinner({
                visible: true,
                active: true,
                valign: Gtk.Align.CENTER,
                halign: Gtk.Align.CENTER,
                width_request: 48,
                height_request: 48
            })
            this._mainBox.pack_start(this._opdsWidget, true, true, 0)

            const client = new OpdsClient()
            client.init()
                .then(() => client.getOpenSearch(query, this._searchLink.href))
                .then(uri => {
                    this._pushHistory(this._uri)
                    this._loadOpds(uri)
                })
                .catch(e => logError(e))
                .then(() => client.close())
        }
        this._searchEntry.connect('activate', handleSearchEntry)
        this._searchEntry.connect('stop-search', () =>
            this._searchBar.search_mode_enabled = false)

        this.actionGroup.lookup_action('back').bind_property('enabled',
            this._backButton, 'visible', GObject.BindingFlags.DEFAULT)
        this.actionGroup.lookup_action('home').bind_property('enabled',
            this._homeButton, 'visible', GObject.BindingFlags.DEFAULT)
        this._updateBack()
        this._home = null
    }
    _updateBack() {
        this.actionGroup.lookup_action('back').enabled = this._history.length
    }
    _goBack() {
        if (!this._history.length) return
        this._loadOpds(this._history.pop())
        this._updateBack()
    }
    _pushHistory(x) {
        this._history.push(x)
        this._updateBack()
    }
    _clearHistory() {
        this._history = []
        this._updateBack()
    }
    get _home() {
        return this.__home
    }
    set _home(home) {
        this.__home = home
        this.actionGroup.lookup_action('home').enabled = home && home !== this._uri
    }
    _goHome() {
        if (!this._home) return
        this._pushHistory(this._uri)
        this._loadOpds(this._home)
    }
    loadOpds(uri) {
        this._loadOpds(uri).catch(e => logError(e))
    }
    async _loadOpds(uri) {
        this._uri = uri
        if (this._opdsWidget) this._opdsWidget.destroy()

        const handleLink = (href, type) => {
            if (typeIsOpds(type)) {
                this._pushHistory(uri)
                this._loadOpds(href)
            } else Gtk.show_uri_on_window(null, href, Gdk.CURRENT_TIME)
        }

        const nb = new Gtk.Notebook({
            visible: true,
            scrollable: true,
            show_border: false
        })
        this._opdsWidget = nb
        this._mainBox.pack_start(nb, true, true, 0)

        const makePage = (uri, title, callback) => {
            const label = new Gtk.Label({
                visible: true,
                ellipsize: Pango.EllipsizeMode.END,
                label: title || _('Loading…'),
                tooltip_text: title || null,
                width_chars: 10,
            })

            const column = new HdyColumn({
                visible: true,
                maximum_width: 2000,
                linear_growth_width: 2000
            })
            const box = new Gtk.Box({
                visible: true,
                orientation: Gtk.Orientation.VERTICAL
            })

            const loadbox = new LoadBox({
                visible: true,
                expand: true
            }, () => {
                const widget = new OpdsBox({
                    visible: true,
                    valign: Gtk.Align.START,
                    uri
                })
                widget.connect('loaded', () => {
                    const feed = widget.feed
                    if (!title) {
                        const title = feed.title || ''
                        label.label = title
                        label.tooltip_text = title
                    }

                    const buttonBox = new Gtk.Box({
                        visible: true,
                        margin: 18,
                        halign: Gtk.Align.CENTER
                    })
                    buttonBox.get_style_context().add_class('linked')
                    box.pack_end(buttonBox, false, true, 0)

                    const paginationRels = {
                        fisrt: { icon: 'go-first-symbolic', label: _('First') },
                        previous: { icon: 'go-previous-symbolic', label: _('Previous') },
                        next: { icon: 'go-next-symbolic', label: _('Next') },
                        last: { icon: 'go-last-symbolic', label: _('Last') }
                    }
                    Object.keys(paginationRels).forEach(rel => {
                        const link = feed.links.find(link => 'href' in link && linkIsRel(link, rel))
                        if (!link) return
                        const icon_name = paginationRels[rel].icon
                        const label = paginationRels[rel].label
                        const paginationBtton = new Gtk.Button({
                            visible: true,
                            hexpand: true,
                            image: new Gtk.Image({ visible: true, icon_name }),
                            tooltip_text: label
                        })
                        paginationBtton.connect('clicked', () => {
                            this._pushHistory(uri)
                            this._loadOpds(link.href)
                        })
                        buttonBox.pack_start(paginationBtton, false, true, 0)
                    })

                    if (callback) callback(feed)

                    const opdsbox = widget.get_child()
                    if (opdsbox instanceof OpdsFullEntryBox) {
                        column.maximum_width = 600
                    } else {
                        opdsbox.connect('link-activated', (_, href, type) => {
                            handleLink(href, type)
                        })
                    }
                    if (opdsbox instanceof OpdsNavigationBox) {
                        column.maximum_width = 600
                    }
                })
                widget.connect('error', () => {
                    if (!title) label.label = _('Error')
                })
                return widget
            })
            box.pack_start(loadbox, false, true, 0)
            column.add(box)

            const scrolled = new Gtk.ScrolledWindow({ visible: true })
            scrolled.add(column)
            nb.append_page(scrolled, label)
            nb.child_set_property(scrolled, 'tab-expand', true)
        }

        const related = {
            'related': _('Related'),
            'section': _('Section'),
            'subsection': _('Subsection'),
            'http://opds-spec.org/sort/new': _('New'),
            'http://opds-spec.org/sort/popular': _('Popular'),
            'http://opds-spec.org/featured': _('Featured'),
            'http://opds-spec.org/recommended': _('Recommended')
        }

        makePage(uri, null, feed => {
            if (feed.title) this.title = feed.title
            const tabs = [].concat(feed.links).filter(link => 'href' in link
                && 'rel' in link
                && Object.keys(related).some(rel => linkIsRel(link, rel)))

            tabs.forEach(({ title, href, rel }) => {
                makePage(href, title || related[rel])
            })

            const facets = feed.links.filter(link => linkIsRel(link, 'http://opds-spec.org/facet'))
            if (facets.length) {
                const opdsbox = new OpdsNavigationBox({
                    visible: true,
                    facet: true,
                    margin: 18,
                    valign: Gtk.Align.START
                })
                opdsbox.load(facets.map(facet => ({
                    title: facet.title,
                    links: [facet]
                })))
                opdsbox.connect('link-activated', (_, href, type) => {
                    handleLink(href, type)
                })

                const label = new Gtk.Label({
                    visible: true,
                    label: _('Filter'),
                })
                const box = new HdyColumn({ visible: true, maximum_width: 700 })
                box.add(opdsbox)
                const scrolled = new Gtk.ScrolledWindow({ visible: true })
                scrolled.add(box)
                nb.insert_page(scrolled, label, 0)
            }

            const search = feed.links.find(link => linkIsRel(link, 'search'))
            if (search) {
                this._searchLink = search
                this._searchButton.show()
            } else this._searchButton.hide()

            nb.show_tabs = nb.get_n_pages() > 1
        })
    }
})
