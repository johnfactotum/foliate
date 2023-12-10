import Gtk from 'gi://Gtk'
import Adw from 'gi://Adw'
import GObject from 'gi://GObject'
import Gio from 'gi://Gio'
import GLib from 'gi://GLib'
import Gdk from 'gi://Gdk'
import GdkPixbuf from 'gi://GdkPixbuf'
import cairo from 'gi://cairo'
import { gettext as _ } from 'gettext'
import * as utils from './utils.js'
import * as format from './format.js'
import { exportAnnotations } from './annotations.js'
import { formatAuthors, makeBookInfoWindow } from './book-info.js'

import WebKit from 'gi://WebKit'
import { WebView } from './webview.js'

const uiText = {
    loading: _('Loading'),
    error: _('Failed to Load'),
    reload: _('Reload'),
    cancel: _('Cancel'),
    viewCollection: _('See All'),
    search: _('Search'),
    filter: _('Filter'),
    acq: {
        'http://opds-spec.org/acquisition': _('Download'),
        'http://opds-spec.org/acquisition/buy': _('Buy'),
        'http://opds-spec.org/acquisition/open-access': _('Download'),
        'http://opds-spec.org/acquisition/preview': _('Preview'),
        'http://opds-spec.org/acquisition/sample': _('Sample'),
        'http://opds-spec.org/acquisition/borrow': _('Borrow'),
        'http://opds-spec.org/acquisition/subscribe': _('Subscribe'),
    },
    openAccess: _('Free'),
    pagination: [
        _('First'),
        _('Previous'),
        _('Next'),
        _('Last'),
    ],
    openSearchParams: {
        searchTerms: _('Search Terms'),
        language: _('Language'),
    },
    atomParams: {
        title: _('Title'),
        author: _('Author'),
        contributor: _('Contributor'),
    },
    metadata: {
        publisher: _('Publisher'),
        published: _('Published'),
        language: _('Language'),
        identifier: _('Identifier'),
    },
}

const getURIFromTracker = identifier => {
    const connection = imports.gi.Tracker.SparqlConnection.bus_new(
        'org.freedesktop.Tracker3.Miner.Files', null, null)
    const statement = connection.query_statement(`
        SELECT ?uri
        WHERE {
            SERVICE <dbus:org.freedesktop.Tracker3.Miner.Files> {
                GRAPH tracker:Documents {
                    ?u rdf:type nfo:EBook .
                    ?u nie:isStoredAs ?uri .
                    ?u nie:identifier ~identifier .
                }
            }
        }`, null)
    statement.bind_string('identifier', identifier)
    const cursor = statement.execute(null)
    cursor.next(null)
    const uri = cursor.get_string(0)[0]
    cursor.close()
    connection.close()
    return uri
}

const showCovers = utils.settings('library')?.get_boolean('show-covers') ?? true

const listBooks = function* (path) {
    const ls = utils.listDir(path, 'standard::name,time::modified')
    for (const { file, name, info } of ls) try {
        if (!/\.json$/.test(name)) continue
        const modified = new Date(info.get_attribute_uint64('time::modified') * 1000)
        yield { file, modified }
    } catch (e) {
        console.error(e)
    }
}

class URIStore {
    #storage = new utils.JSONStorage(pkg.datapath('library'), 'uri-store')
    #map = new Map(this.#storage.get('uris'))
    get(id) {
        try {
            const uri = getURIFromTracker(id)
            if (uri) return uri
        } catch (e) {
            console.warn(e)
        }
        return this.#map.get(id)
    }
    set(id, uri) {
        this.#map.set(id, uri)
        this.#storage.set('uris', Array.from(this.#map.entries()))
    }
    delete(id) {
        this.#map.delete(id)
        this.#storage.set('uris', Array.from(this.#map.entries()))
    }
}

export const getURIStore = utils.memoize(() => new URIStore())

const BookList = GObject.registerClass({
    GTypeName: 'FoliateBookList',
}, class extends Gio.ListStore {
    #uriStore = getURIStore()
    #files = Array.from(listBooks(pkg.datadir) ?? [])
        .sort((a, b) => b.modified - a.modified)
        .map(x => x.file)
    #iter = this.#files.values()
    constructor(params) {
        super(params)
        this.readFile = utils.memoize(utils.readJSONFile)
        this.readCover = utils.memoize(identifier => {
            const path = pkg.cachepath(`${encodeURIComponent(identifier)}.png`)
            try { return GdkPixbuf.Pixbuf.new_from_file(path) }
            catch (e) { return null }
        })
    }
    loadMore(n) {
        for (let i = 0; i < n; i++) {
            const { value, done } = this.#iter.next()
            if (done) return true
            else if (value) this.append(value)
        }
    }
    getBook(file) {
        const { identifier } = this.readFile(file)?.metadata ?? {}
        return this.getBookFromIdentifier(identifier)
    }
    getBookFromIdentifier(identifier) {
        // TODO: use tracker
        const uri = this.#uriStore.get(identifier)
        return !uri ? null : uri.startsWith('~')
            ? Gio.File.new_for_path(uri.replace('~', GLib.get_home_dir()))
            : Gio.File.new_for_uri(uri)
    }
    delete(file) {
        const name = file.get_basename()
        const cover = Gio.File.new_for_path(pkg.cachepath(name.replace('.json', '.png')))
        const id = decodeURIComponent(name.replace('.json', ''))
        this.#uriStore.delete(id)
        for (const f of [file, cover]) try { f.delete(null) } catch {}
        for (const [i, el] of utils.gliter(this)) if (el === file) this.remove(i)
    }
    update(path) {
        // remove it from the queue if it's not yet loaded
        const i = this.#files.findIndex(f => f?.get_path() === path)
        // set to null instead of removing it so we don't mess up the iterator
        if (i !== -1) this.#files[i] = null
        // remove it from the list if it has been loaded
        for (const [i, el] of utils.gliter(this)) if (el.get_path() === path) this.remove(i)
        this.insert(0, Gio.File.new_for_path(path))
    }
})

let gotBooks // don't create book list just to update it
const getBooks = utils.memoize(() => (gotBooks = true, new BookList()))
export const getBookList = () => gotBooks ? getBooks() : null

const width = 256
const height = width * 1.5
const surface = new cairo.ImageSurface(cairo.Format.ARGB32, width, height)
const defaultPixbuf = Gdk.pixbuf_get_from_surface(surface, 0, 0, width, height)

GObject.registerClass({
    GTypeName: 'FoliateBookImage',
    Template: pkg.moduleuri('ui/book-image.ui'),
    InternalChildren: ['image', 'generated', 'title'],
}, class extends Gtk.Overlay {
    load(pixbuf, title) {
        if (pixbuf) {
            this._generated.visible = false
            this._image.set_pixbuf(pixbuf)
            this._image.opacity = 1
        } else {
            this._image.set_pixbuf(defaultPixbuf)
            this._image.opacity = 0
            this._title.label = title
            this._generated.visible = true
        }
        this._image.tooltip_text = title
    }
})

const fraction = p => p?.[1] ? (p[0] + 1) / (p[1] + 1) : null

const BookItem = GObject.registerClass({
    GTypeName: 'FoliateBookItem',
    Template: pkg.moduleuri('ui/book-item.ui'),
    InternalChildren: ['image', 'progress', 'title'],
    Signals: {
        'open-new-window': { param_types: [Gio.File.$gtype] },
        'remove-book': { param_types: [Gio.File.$gtype] },
        'export-book': { param_types: [Gio.File.$gtype] },
        'book-info': { param_types: [Gio.File.$gtype] },
    },
}, class extends Gtk.Box {
    #item
    constructor(params) {
        super(params)
        this.insert_action_group('book-item', utils.addSimpleActions({
            'open-new-window': () => this.emit('open-new-window', this.#item),
            'remove': () => this.emit('remove-book', this.#item),
            'export': () => this.emit('export-book', this.#item),
            'info': () => this.emit('book-info', this.#item),
        }))
    }
    update(item, data, cover) {
        this.#item = item
        const title = data.metadata?.title
        this._title.text = title
        this._image.load(cover?.then ? null : cover, title)
        this._progress.label = format.percent(fraction(data.progress))
    }
})

const BookRow = GObject.registerClass({
    GTypeName: 'FoliateBookRow',
    Template: pkg.moduleuri('ui/book-row.ui'),
    InternalChildren: ['title', 'author', 'progress-grid', 'progress-bar', 'progress-label'],
    Signals: {
        'open-new-window': { param_types: [Gio.File.$gtype] },
        'remove-book': { param_types: [Gio.File.$gtype] },
        'export-book': { param_types: [Gio.File.$gtype] },
        'book-info': { param_types: [Gio.File.$gtype] },
    },
}, class extends Gtk.Box {
    #item
    constructor(params) {
        super(params)
        this.insert_action_group('book-item', utils.addSimpleActions({
            'open-new-window': () => this.emit('open-new-window', this.#item),
            'remove': () => this.emit('remove-book', this.#item),
            'export': () => this.emit('export-book', this.#item),
            'info': () => this.emit('book-info', this.#item),
        }))
    }
    update(item, data) {
        this.#item = item
        const { metadata, progress } = data
        const title = metadata?.title
        this._title.label = title

        const author = formatAuthors(metadata)
        this._author.label = author
        this._author.visible = Boolean(author)

        const frac = fraction(progress)
        this._progress_bar.fraction = frac
        this._progress_label.label = format.percent(frac)

        const bookSize = Math.min((progress?.[1] + 1) / 1500, 0.8)
        const steps = 10
        const span = Math.ceil(bookSize * steps)
        const grid = this._progress_grid
        if (isNaN(span)) grid.hide()
        else {
            grid.show()
            grid.remove(this._progress_bar)
            grid.remove(this._progress_label)
            grid.attach(this._progress_bar, 0, 0, span, 1)
            grid.attach(this._progress_label, span, 0, steps - span, 1)
        }
    }
})

const matchString = (x, q) => typeof x === 'string'
    ? x.toLowerCase().includes(q) : false

GObject.registerClass({
    GTypeName: 'FoliateLibraryView',
    Template: pkg.moduleuri('ui/library-view.ui'),
    InternalChildren: ['scrolled'],
    Properties: utils.makeParams({
        'view-mode': 'string',
    }),
    Signals: {
        'load-more': { return_type: GObject.TYPE_BOOLEAN },
        'load-all': {},
        'activate': { param_types: [GObject.TYPE_OBJECT] },
    },
}, class extends Gtk.Stack {
    #done = false
    #filter = new Gtk.CustomFilter()
    #filterModel = utils.connect(new Gtk.FilterListModel({ filter: this.#filter }),
        { 'items-changed': () => this.#update() })
    #itemConnections = {
        'open-new-window': (_, file) => this.root.addWindow(getBooks().getBook(file)),
        'remove-book': (_, file) => this.removeBook(file),
        'export-book': (_, file) => {
            const data = getBooks().readFile(file)
            exportAnnotations(this.get_root(), data)
        },
        'book-info': (_, file) => {
            const books = getBooks()
            const { metadata } = books.readFile(file)
            const cover = books.readCover(metadata.identifier)
            makeBookInfoWindow(this.get_root(), metadata, cover)
        },
    }
    actionGroup = utils.addMethods(this, {
        props: ['view-mode'],
    })
    constructor(params) {
        super(params)
        utils.connect(this._scrolled.vadjustment, {
            'changed': this.#checkAdjustment.bind(this),
            'value-changed': this.#checkAdjustment.bind(this),
        })
        const show = () => this.view_mode === 'list' ? this.showList() : this.showGrid()
        this.connect('notify::view-mode', show)
        show()
    }
    #checkAdjustment(adj) {
        if (this.#done) return
        if (adj.value + adj.page_size * 1.5 >= adj.upper) {
            const done = this.emit('load-more')
            if (done) this.#done = true
            else utils.wait(10).then(() => this.#checkAdjustment(adj))
        }
    }
    #update() {
        this.visible_child_name = !this.#filterModel.model.get_n_items() ? 'empty'
            : !this.#filterModel.get_n_items() ? 'no-results' : 'main'
    }
    setModel(model) {
        this.#filterModel.model = model
        this.#update()
    }
    showGrid() {
        this._scrolled.child?.unparent()
        this._scrolled.child = utils.connect(new Gtk.GridView({
            single_click_activate: true,
            max_columns: 20,
            vscroll_policy: Gtk.ScrollablePolicy.NATURAL,
            model: new Gtk.NoSelection({ model: this.#filterModel }),
            factory: utils.connect(new Gtk.SignalListItemFactory(), {
                'setup': (_, item) => item.child =
                    utils.connect(new BookItem(), this.#itemConnections),
                'bind': (_, { child, item }) => {
                    const { cover, data } = this.#getData(item, showCovers)
                    child.update(item, data, cover)
                    if (cover?.then) cover
                        .then(cover => child.update(item, data, cover))
                        .catch(e => console.warn(e))
                },
            }),
        }), { 'activate': (_, pos) =>
            this.emit('activate', this.#filterModel.get_item(pos)) })
        this._scrolled.child.remove_css_class('view')
    }
    showList() {
        this._scrolled.child?.unparent()
        this._scrolled.child = new Adw.ClampScrollable({
            child: utils.connect(utils.addClass(new Gtk.ListView({
                single_click_activate: true,
                model: new Gtk.NoSelection({ model: this.#filterModel }),
                factory: utils.connect(new Gtk.SignalListItemFactory(), {
                    'setup': (_, item) => item.child = utils.connect(
                        new BookRow(), this.#itemConnections),
                    'bind': (_, { child, item }) => {
                        const { data } = this.#getData(item, false)
                        child.update(item, data)
                    },
                }),
            }), 'book-list'), { 'activate': (_, pos) =>
                this.emit('activate', this.#filterModel.get_item(pos)) }),
        })
    }
    #getData(file, getCover) {
        const books = getBooks()
        const data = books.readFile(file)
        const identifier = data?.metadata?.identifier
        const cover = getCover && identifier ? books.readCover(identifier) : null
        return { cover, data }
    }
    search(text) {
        const q = text.trim().toLowerCase()
        if (!q) {
            this.#filter.set_filter_func(null)
            return
        }
        this.emit('load-all')
        const fields = ['title', 'creator', 'description']
        const { readFile } = this.#filterModel.model
        this.#filter.set_filter_func(file => {
            const { metadata } = readFile(file)
            if (!metadata) return false
            return fields.some(field => matchString(metadata[field], q))
        })
    }
    removeBook(file) {
        const dialog = new Adw.MessageDialog({
            transient_for: this.get_root(),
            modal: true,
            heading: _('Remove Book?'),
            body: _('Reading progress, annotations, and bookmarks will be permanently lost'),
        })
        dialog.add_response('cancel', _('_Cancel'))
        dialog.add_response('remove', _('_Remove'))
        dialog.set_response_appearance('remove', Adw.ResponseAppearance.DESTRUCTIVE)
        dialog.present()
        dialog.connect('response', (_, response) => {
            if (response === 'remove') getBooks().delete(file)
        })
    }
})

GObject.registerClass({
    GTypeName: 'FoliateOPDSView',
}, class extends Adw.Bin {
    #downloads = new Map()
    #searchURL
    constructor(params) {
        super(params)
        this.actionGroup = utils.addMethods(this, {
            actions: [
                'back', 'forward', 'search',
            ],
        })
        for (const action of ['back', 'forward', 'search'])
            this.actionGroup.lookup_action(action).enabled = false
    }
    init() {
        const webView = new WebView({
            settings: new WebKit.Settings({
                enable_write_console_messages_to_stdout: true,
                enable_developer_extras: true,
                enable_back_forward_navigation_gestures: false,
                enable_hyperlink_auditing: false,
                enable_html5_database: false,
                enable_html5_local_storage: false,
                disable_web_security: true,
                user_agent: pkg.userAgent,
            }),
        })
        const initFuncs = [
            webView.provide('formatMime', format.mime),
            webView.provide('formatPrice',
                price => price ? format.price(price.currency, price.value) : ''),
            webView.provide('formatLanguage', format.language),
            webView.provide('formatDate', format.date),
            webView.provide('formatList', format.list),
            webView.provide('matchLocales', format.matchLocales),
        ]
        utils.connect(webView, {
            'context-menu': () => false,
            'load-changed': (webView, event) => {
                if (event === WebKit.LoadEvent.FINISHED) {
                    const lang = format.locales[0].baseName
                    webView.run(`globalThis.uiText = ${JSON.stringify(uiText)}
                    document.documentElement.lang = "${lang}"
                    import('./opds.js').catch(e => console.error(e))`)
                        .catch(e => console.error(e))
                    for (const f of initFuncs) f()

                    // update after going back/foward
                    webView.exec('updateSearchURL')
                        // it will fail when the page first loads but that's ok
                        .catch(e => console.debug(e))
                }
            },
            'decide-policy': (_, decision, type) => {
                switch (type) {
                    case WebKit.PolicyDecisionType.NAVIGATION_ACTION:
                    case WebKit.PolicyDecisionType.NEW_WINDOW_ACTION: {
                        const { uri } = decision.navigation_action.get_request()
                        if (!uri.startsWith('foliate-opds:') && !uri.startsWith('blob:')
                        && uri !== 'about:blank') {
                            decision.ignore()
                            Gtk.show_uri(null, uri, Gdk.CURRENT_TIME)
                            return true
                        }
                    }
                }
            },
        })
        webView.registerHandler('opds', payload => {
            switch (payload.type) {
                case 'download': this.download(payload); break
                case 'cancel':
                    this.#downloads.get(payload.token)?.deref()?.cancel()
                    break
                case 'search':
                    this.#searchURL = payload.url
                    this.actionGroup.lookup_action('search').enabled = !!payload.url
                    break
            }
        })
        webView.get_back_forward_list().connect('changed', () => {
            this.actionGroup.lookup_action('back').enabled = webView.can_go_back()
            this.actionGroup.lookup_action('forward').enabled = webView.can_go_forward()
        })
        webView.set_background_color(new Gdk.RGBA())
        this.child = webView
    }
    load(url) {
        this.actionGroup.lookup_action('search').enabled = false
        if (!this.child) this.init()
        this.child.loadURI(`foliate-opds:///opds/opds.html?url=${encodeURIComponent(url)}`)
            .then(() => this.child.grab_focus())
            .catch(e => console.error(e))
    }
    back() {
        this.child.go_back()
    }
    forward() {
        this.child.go_forward()
    }
    search() {
        if (this.#searchURL) this.load(this.#searchURL)
    }
    download({ href, token }) {
        const webView = this.child
        const download = utils.connect(webView.download_uri(href), {
            'decide-destination': (download, initial_name) => {
                new Gtk.FileDialog({ initial_name })
                    .save(this.root, null, (dialog, res) => {
                        try {
                            const file = dialog.save_finish(res)
                            download.set_destination(file.get_path())
                        } catch (e) {
                            if (e instanceof Gtk.DialogError) console.debug(e)
                            else console.error(e)
                            download.cancel()
                        }
                    })
                return true
            },
            'notify::estimated-progress': download => webView.exec('updateProgress',
                { progress: download.estimated_progress, token }),
            'finished': () => {
                this.#downloads.delete(token)
                webView.exec('finishDownload', { token })
            },
            'failed': (download, error) => {
                if (error.code === WebKit.DownloadError.CANCELLED_BY_USER) return
                console.error(error)
                this.root.error(_('Download Failed'), '')
            },
        })
        this.#downloads.set(token, new WeakRef(download))
    }
    vfunc_unroot() {
        this.child?.unparent()
        this.child?.run_dispose()
    }
})

const SidebarItem = utils.makeDataClass('FoliateSidebarItem', {
    'type': 'string',
    'icon': 'string',
    'label': 'string',
    'value': 'string',
})

const SidebarRow = GObject.registerClass({
    GTypeName: 'FoliateSidebarRow',
    Properties: utils.makeParams({
        'item': 'object',
    }),
}, class extends Gtk.Box {
    #icon = new Gtk.Image()
    #label = new Gtk.Label({})
    constructor(params) {
        super(params)
        this.spacing = 12
        this.margin_start = 6
        this.append(this.#icon)
        this.append(this.#label)
        this.item.bindProperties({
            icon: [this.#icon, 'icon-name'],
            label: [this.#label, 'label'],
        })
    }
})

const sidebarListModel = new Gio.ListStore()
sidebarListModel.append(new SidebarItem({
    icon: 'library-symbolic',
    label: _('All Books'),
    value: 'library',
}))
sidebarListModel.append(new SidebarItem({
    type: 'action',
    icon: 'list-add-symbolic',
    label: _('Add Catalog…'),
    value: 'add-catalog',
}))

const addCatalogItem = (label, value) => {
    sidebarListModel.insert(sidebarListModel.get_n_items() - 1,
        new SidebarItem({
            type: 'catalog',
            icon: 'application-rss+xml-symbolic',
            label, value,
        }))
}
addCatalogItem('Standard Ebooks', 'https://standardebooks.org/feeds/opds/new-releases')
addCatalogItem('Feedbooks', 'https://catalog.feedbooks.com/catalog/index.json')
addCatalogItem('Feedbooks (OPDS 1)', 'https://catalog.feedbooks.com/publicdomain/browse/top.atom?lang=en')
addCatalogItem('Project Gutenberg', 'https://m.gutenberg.org/ebooks.opds/')
addCatalogItem('Manybooks', 'http://manybooks.net/opds/')
addCatalogItem('unglue.it', 'https://unglue.it/api/opds/')
addCatalogItem('Test Catalog', 'http://feedbooks.github.io/opds-test-catalog/catalog/root.xml')

export const Library = GObject.registerClass({
    GTypeName: 'FoliateLibrary',
    Template: pkg.moduleuri('ui/library.ui'),
    InternalChildren: [
        'breakpoint-bin', 'split-view',
        'sidebar-list-box', 'main-stack',
        'library-toolbar-view', 'catalog-toolbar-view',
        'books-view', 'search-bar', 'search-entry',
        'opds-view',
    ],
}, class extends Gtk.Box {
    constructor(params) {
        super(params)

        this._breakpoint_bin.add_breakpoint(utils.connect(new Adw.Breakpoint({
            condition: Adw.BreakpointCondition.parse('max-width: 700px'),
        }), {
            'apply': () => this._split_view.collapsed = true,
            'unapply': () => this._split_view.collapsed = false,
        }))

        this._sidebar_list_box.set_header_func((row, before) => {
            if (!before)
                row.set_header(utils.addClass(new Gtk.Label({
                    label: _('Library'),
                    xalign: 0,
                    margin_start: 12,
                    margin_bottom: 6,
                }), 'caption-heading', 'dim-label'))
            if (before && before.child.item.type !== 'catalog'
            && row.child.item.type === 'catalog')
                row.set_header(utils.addClass(new Gtk.Label({
                    label: _('Catalogs'),
                    xalign: 0,
                    margin_start: 12,
                    margin_top: 18,
                    margin_bottom: 6,
                }), 'caption-heading', 'dim-label'))
        })
        this._sidebar_list_box.bind_model(sidebarListModel, item =>
            new Gtk.ListBoxRow({
                child: new SidebarRow({ item }),
                selectable: item.value !== 'add-catalog',
            }))
        this._sidebar_list_box.connect('row-activated', (__, row) => {
            const { type, value } = row.child.item
            if (value === 'add-catalog') return this.addCatalog()
            if (value === 'library') return this._main_stack.visible_child = this._library_toolbar_view
            if (type === 'catalog') return this.showCatalog(value)
        })
        this._sidebar_list_box.select_row(this._sidebar_list_box.get_row_at_index(0))

        const books = getBooks()

        utils.connect(this._books_view, {
            'activate': (_, item) => this.root.openFile(books.getBook(item)),
            'load-more': () => books.loadMore(1),
            'load-all': () => books.loadMore(Infinity),
        })
        this._books_view.setModel(books)
        this._books_view.view_mode = 'grid'
        utils.bindSettings('library', this._books_view, ['view-mode'])
        books.loadMore(10)

        this._search_bar.connect_entry(this._search_entry)
        this._search_entry.connect('search-changed', entry =>
            this._books_view.search(entry.text))

        this.insert_action_group('library', this._books_view.actionGroup)
        this.insert_action_group('catalog', this._opds_view.actionGroup)
    }
    addCatalog() {
        const submit = () => {
            const url = entry.text.trim()
            if (!url) return
            win.close()
        }
        const win = new Adw.Window({
            title: _('Add Catalog'),
            modal: true,
            transient_for: this.root,
            content: new Adw.ToolbarView(),
            default_width: 400,
        })
        win.add_controller(utils.addShortcuts({ 'Escape|<ctrl>w': () => win.close() }))
        const header = new Adw.HeaderBar({
            show_title: false,
            show_start_title_buttons: false,
            show_end_title_buttons: false,
        })
        header.pack_start(utils.connect(new Gtk.Button({
            label: _('Cancel'),
        }), { 'clicked': () => win.close() }))
        const add = utils.connect(utils.addClass(new Gtk.Button({
            label: _('Add'),
        }), 'suggested-action'), { 'clicked': () => submit() })
        header.pack_end(add)
        win.content.add_top_bar(header)
        win.content.content = utils.addClass(new Adw.StatusPage({
            icon_name: 'application-rss+xml-symbolic',
            title: _('Add Catalog'),
            description: _('You can browse and download books from OPDS catalogs. <a href="https://opds.io">Learn More…</a>'),
        }), 'compact')
        const group = new Adw.PreferencesGroup()
        const entry = utils.connect(new Adw.EntryRow({
            title: _('URL'),
            input_purpose: Gtk.InputPurpose.URL,
        }), { 'entry-activated': () => submit() })
        group.add(entry)
        win.content.content.child = group
        win.show()
        entry.grab_focus()
    }
    showCatalog(url) {
        this._main_stack.visible_child = this._catalog_toolbar_view
        this._opds_view.load(url)
    }
})
