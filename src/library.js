import Gtk from 'gi://Gtk'
import Adw from 'gi://Adw'
import GObject from 'gi://GObject'
import Gio from 'gi://Gio'
import GLib from 'gi://GLib'
import Gdk from 'gi://Gdk'
import GdkPixbuf from 'gi://GdkPixbuf'
import Pango from 'gi://Pango'
import cairo from 'gi://cairo'
import { gettext as _ } from 'gettext'
import * as utils from './utils.js'
import * as format from './format.js'
import { exportAnnotations } from './annotations.js'
import { formatLanguageMap, formatAuthors, makeBookInfoWindow } from './book-info.js'

import WebKit from 'gi://WebKit'
import { WebView } from './webview.js'

const defaultCatalogs = [
    {
        title: 'Feedbooks',
        uri: 'https://catalog.feedbooks.com/catalog/index.json',
    },
    {
        title: 'Internet Archive',
        uri: 'https://bookserver.archive.org/catalog/',
    },
    {
        title: 'Manybooks',
        uri: 'https://manybooks.net/opds/',
    },
    {
        title: 'Project Gutenberg',
        uri: 'https://m.gutenberg.org/ebooks.opds/',
    },
    {
        title: 'Standard Ebooks',
        uri: 'https://standardebooks.org/feeds/opds',
    },
    {
        title: 'unglue.it',
        uri: 'https://unglue.it/api/opds/',
    },
]

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
        'preview': _('Preview'),
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
    query: _('Search Terms'),
    metadata: {
        title: _('Title'),
        author: _('Author'),
        contributor: _('Contributor'),
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
            GRAPH tracker:Documents {
                ?u rdf:type nfo:EBook .
                ?u nie:isStoredAs ?uri .
                ?u nie:identifier ~identifier .
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
            catch { return null }
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
        'open-external-app': { param_types: [Gio.File.$gtype] },
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
            'open-external-app': () => this.emit('open-external-app', this.#item),
        }))
    }
    update(item, data, cover) {
        this.#item = item
        const title = formatLanguageMap(data.metadata?.title)
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
        'open-external-app': { param_types: [Gio.File.$gtype] },
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
            'open-external-app': () => this.emit('open-external-app', this.#item),
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
        'open-external-app': (_, file) => this.openWithExternalApp(getBooks().getBook(file)),
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
    openWithExternalApp(file) {
        if (!file) return
        const path = file.get_path()
        if (!path) return

        const dialog = new Gtk.AppChooserDialog({
            gfile: file,
            modal: true,
            transient_for: this.root,
        })

        dialog.connect('response', (dialog, response) => {
            if (response === Gtk.ResponseType.OK) {
                const app_info = dialog.get_app_info()
                if (app_info) {
                    try {
                        app_info.launch([file], null)
                    } catch (e) {
                        console.error(
                            'Failed to open file with selected application:',
                            e,
                        )
                        this.root.error(
                            _('Failed to Open'),
                            _('Could not open the file with the selected application'),
                        )
                    }
                }
            }
            dialog.destroy()
        })

        dialog.show()
    }
})

GObject.registerClass({
    GTypeName: 'FoliateOPDSView',
    Signals: {
        'state-changed': { param_types: [GObject.TYPE_JSOBJECT] },
    },
}, class extends Adw.Bin {
    #downloads = new Map()
    #state
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
                enable_javascript_markup: false,
                disable_web_security: true,
                user_agent: pkg.userAgent,
            }),
        })
        const initFuncs = [
            webView.provide('formatNumber', format.number),
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
                    import('./main.js').catch(e => console.error(e))`)
                        .catch(e => console.error(e))
                    for (const f of initFuncs) f()

                    // update after going back/foward
                    webView.exec('updateState')
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
                            new Gtk.UriLauncher({ uri }).launch(this.root, null, null)
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
                case 'state':
                    this.#state = payload.state
                    this.actionGroup.lookup_action('search').enabled =
                        !!this.#state?.search && !!this.#state?.searchEnabled
                    this.emit('state-changed', this.#state)
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
    load(url, isSearch) {
        this.actionGroup.lookup_action('search').enabled = false
        if (!this.child) this.init()
        if (isSearch && url === '#search') {
            this.child.run("location = location.href.split('#')[0] + '#search'")
                .then(() => this.child.grab_focus())
                .catch(e => console.debug(e))
            return
        }
        url = url.replace(/^opds:\/\//, 'http://')
        if (!url.includes(':')) url = 'http://' + url
        this.child.loadURI(`foliate-opds:///opds/main.html?url=${encodeURIComponent(url)}`)
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
        if (this.#state?.search) this.load(this.#state.search, true)
    }
    download({ href, token }) {
        const webView = this.child
        new Promise((resolve, reject) => {
            let file
            const download = utils.connect(webView.download_uri(href), {
                'decide-destination': (download, initial_name) => {
                    new Gtk.FileDialog({ initial_name })
                        .save(this.root, null, (dialog, res) => {
                            try {
                                file = dialog.save_finish(res)
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
                    resolve(file)
                },
                'failed': (download, error) => {
                    if (error.code === WebKit.DownloadError.CANCELLED_BY_USER) return
                    reject(error)
                },
            })
            download.allow_overwrite = true
            this.#downloads.set(token, new WeakRef(download))
        })
            .then(file => {
                if (file) new Gtk.FileLauncher({ file, always_ask: true })
                    .launch(this.root, null, null)
            })
            .catch(e => {
                console.error(e)
                this.root.error(_('Download Failed'), _('An error occurred'))
            })
    }
    vfunc_unroot() {
        this.child?.unparent()
        this.child?.run_dispose()
    }
})

const catalogsStore = new utils.JSONStorage(pkg.datapath('catalogs'), 'catalogs', 2)

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
    Signals: {
        'remove-catalog': { param_types: [GObject.TYPE_OBJECT] },
    },
}, class extends Gtk.Box {
    #icon = new Gtk.Image()
    #label = new Gtk.Label({
        ellipsize: Pango.EllipsizeMode.END,
    })
    #menu = new Gio.Menu()
    #popover = new Gtk.PopoverMenu({
        has_arrow: false,
        halign: Gtk.Align.START,
        menu_model: this.#menu,
    })
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

        this.insert_action_group('catalog-item', utils.addSimpleActions({
            'rename': () => this.rename(),
            'remove': () => this.emit('remove-catalog', this.item),
        }))

        this.#popover.set_parent(this)
        this.#menu.append(_('Rename…'), 'catalog-item.rename')
        this.#menu.append(_('Remove'), 'catalog-item.remove')
        this.add_controller(utils.connect(new Gtk.GestureClick({
            button: Gdk.BUTTON_SECONDARY,
        }), {
            'pressed': (_, __, x, y) => {
                if (this.item.type === 'catalog') {
                    this.#popover.pointing_to = new Gdk.Rectangle({ x, y })
                    this.#popover.popup()
                }
            },
        }))
    }
    rename() {
        const { window, button } = this.root.actionDialog()
        const submit = () => {
            const text = entry.text.trim()
            if (!text) return
            this.item.set_property('label', text)
            window.close()
        }
        window.title = _('Rename')
        button.label = _('Rename')
        button.connect('clicked', submit)
        const page = new Adw.PreferencesPage()
        const group = new Adw.PreferencesGroup()
        const entry = utils.connect(new Adw.EntryRow({
            title: _('Name'),
            text: this.item.label,
            input_purpose: Gtk.InputPurpose.URL,
        }), { 'entry-activated': submit })
        group.add(entry)
        page.add(group)
        window.content.content = page
        window.show()
        entry.grab_focus()
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

const exportCatalogItems = () =>
    Array.from(utils.gliter(sidebarListModel), ([, item]) => item.type === 'catalog' ? {
        title: item.label,
        uri: item.value,
    } : null).filter(x => x)

const saveCatalogs = () => catalogsStore.set('catalogs', exportCatalogItems())

const addCatalogItem = (label, value) => {
    const item = new SidebarItem({
        type: 'catalog',
        icon: 'application-rss+xml-symbolic',
        label, value,
    })
    item.connectAll(saveCatalogs)
    sidebarListModel.insert(sidebarListModel.get_n_items() - 1, item)
}

const addCatalog = catalog => {
    for (const [, item] of utils.gliter(sidebarListModel))
        if (item.type === 'catalog' && item.value === catalog.uri) return
    addCatalogItem(catalog.title, catalog.uri)
    saveCatalogs()
}

const removeCatalog = uri => {
    for (const [i, item] of utils.gliter(sidebarListModel))
        if (item.type === 'catalog' && item.value === uri) {
            sidebarListModel.remove(i)
            break
        }
    saveCatalogs()
}

for (const catalog of catalogsStore.get('catalogs', defaultCatalogs)) {
    if (typeof catalog.title === 'string' && typeof catalog.uri === 'string')
        addCatalogItem(catalog.title, catalog.uri)
}

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
        this._sidebar_list_box.add_controller(utils.connect(Gtk.DropTarget.new(
            SidebarItem.$gtype, Gdk.DragAction.MOVE), {
            'motion': (_, _x, y) => {
                const row = this._sidebar_list_box.get_row_at_y(y)
                if (row && row.child.item.type === 'catalog')
                    return Gdk.DragAction.MOVE
            },
            'drop': (_, value, _x, y) => {
                const row = this._sidebar_list_box.get_row_at_y(y)
                if (row && row.child.item.type === 'catalog') {
                    let sourceItem, sourceIndex, targetIndex
                    for (const [i, item] of utils.gliter(sidebarListModel)) {
                        if (sourceIndex != null && targetIndex != null) break
                        if (item.type === 'catalog') {
                            if (item === value) {
                                sourceItem = item
                                sourceIndex = i
                            }
                            if (item.value === row.child.item.value) {
                                targetIndex = i
                            }
                        }
                    }
                    if (sourceIndex === targetIndex) return
                    sidebarListModel.remove(sourceIndex)
                    if (sourceIndex < targetIndex + 1) targetIndex--
                    sidebarListModel.insert(targetIndex + 1, sourceItem)
                    saveCatalogs()
                }
            },
        }))
        this._sidebar_list_box.bind_model(sidebarListModel, item => {
            const child = utils.connect(new SidebarRow({ item }), {
                'remove-catalog': (self, item) => {
                    removeCatalog(item.value)
                    this.root.add_toast(utils.connect(new Adw.Toast({
                        title: _('Catalog removed'),
                        button_label: _('Undo'),
                    }), { 'button-clicked': () => addCatalog({
                        title: item.label,
                        uri: item.value,
                    }) }))
                },
            })
            if (item.type === 'catalog') {
                child.add_controller(utils.connect(new Gtk.DragSource({
                    actions: Gdk.DragAction.MOVE,
                }), {
                    'prepare': (source, x, y) => {
                        source.set_icon(new Gtk.WidgetPaintable({ widget: child }), x, y)
                        const value = new GObject.Value()
                        value.init(SidebarItem)
                        value.set_object(item)
                        return Gdk.ContentProvider.new_for_value(item)
                    },
                }))
            }
            return new Gtk.ListBoxRow({ child,
                selectable: item.value !== 'add-catalog' })
        })
        this._sidebar_list_box.connect('row-activated', (__, row) => {
            const { type, value } = row.child.item
            if (value === 'add-catalog') return this.addCatalog().catch(e => console.error(e))
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
    #addCatalog(url) {
        this._sidebar_list_box.select_row(null)
        const handler = this._opds_view.connect('state-changed', (_, state) => {
            this._opds_view.disconnect(handler)
            if (state) {
                const catalog = {
                    title: state.title || '',
                    uri: state.start || state.self,
                }
                addCatalog(catalog)

                for (let i = 0;; i++) {
                    const row = this._sidebar_list_box.get_row_at_index(i)
                    if (!row) break
                    const { type, value } = row.child.item
                    if (type === 'catalog' && value === catalog.uri)
                        this._sidebar_list_box.select_row(row)
                }
            }
        })
        this.showCatalog(url)
    }
    async addCatalog() {
        let text = ''
        try {
            text = await utils.getClipboardText()
        } catch (e) {
            console.warn(e)
        }
        const { window, button } = this.root.actionDialog()
        const submit = () => {
            const url = entry.text.trim()
            if (!url) return
            this.#addCatalog(url)
            window.close()
        }
        window.title = _('Add Catalog')
        button.label = _('Add')
        button.connect('clicked', submit)
        window.content.content = utils.addClass(new Adw.StatusPage({
            icon_name: 'application-rss+xml-symbolic',
            title: _('Add Catalog'),
            description: _('You can browse and download books from OPDS catalogs. <a href="https://opds.io">Learn More…</a>'),
        }), 'compact')
        const group = new Adw.PreferencesGroup()
        const entry = utils.connect(new Adw.EntryRow({
            title: _('URL'),
            input_purpose: Gtk.InputPurpose.URL,
            text: /^(http|https|opds):\/\//.test(text) ? text : '',
        }), { 'entry-activated': submit })
        group.add(entry)
        window.content.content.child = group
        window.show()
        entry.grab_focus()
    }
    showCatalog(url) {
        this._main_stack.visible_child = this._catalog_toolbar_view
        this._opds_view.load(url)
    }
})
