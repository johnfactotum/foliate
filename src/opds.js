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

const { GObject, Gio, GLib, Gtk, Gdk, WebKit2, Pango } = imports.gi
const {
    debug, Obj, formatPrice, base64ToPixbuf, markupEscape,
    linkIsRel, makeLinksButton, sepHeaderFunc, user_agent
} = imports.utils
const { PropertiesBox } = imports.properties
const { HdyColumn } = imports.handy

const htmlPath = pkg.pkgdatadir + '/assets/client.html'
var OpdsClient = class OpdsClient {
    constructor(widget) {
        this._widget = widget
        this._promises = new Map()

        this._webView = new WebKit2.WebView({
            settings: new WebKit2.Settings({
                enable_write_console_messages_to_stdout: true,
                allow_universal_access_from_file_urls: true,
                user_agent
            })
        })
        this._webView.connect('authenticate', this._handleAuth.bind(this))

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
            this._handleAction(type, payload, token)
        })
        contentManager.register_script_message_handler('action')
        this._webView.load_uri(GLib.filename_to_uri(htmlPath, null))
        this._webView.connect('destroy', () => {
            Array.from(this._promises.values()).forEach(({ reject }) =>
                reject(new Error('OPDS: WebView destroyed')))
        })
    }
    _handleAction(type, payload, token) {
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
            case 'auth': {
                const { username, password } = payload
                this.username = username
                this.password = password
            }
        }
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
    _handleAuth(webView, req) {
        if (this.username) {
            const cred = new WebKit2.Credential(this.username, this.password,
                WebKit2.CredentialPersistence.FOR_SESSION)
            req.authenticate(cred)
            return true
        }
        const msg = new Gtk.MessageDialog({
            text: _('Authentication Required'),
            secondary_text:
                _('Authentication required by %s')
                    .format(req.get_host())
                + '\n'
                + _('The site says: “%s”').format(req.get_realm()),
            message_type: Gtk.MessageType.ERROR,
            modal: true,
        })
        const widget = this._widget
        if (widget instanceof Gtk.Widget) {
            const toplevel = widget.get_toplevel()
            if (toplevel instanceof Gtk.Window)
                msg.transient_for = toplevel
        }
        msg.add_button(_('Cancel'), Gtk.ResponseType.CANCEL)
        msg.add_button(_('Authenticate'), Gtk.ResponseType.OK)
        msg.set_default_response(Gtk.ResponseType.OK)
        msg.get_widget_for_response(Gtk.ResponseType.OK)
            .get_style_context().add_class('suggested-action')

        const grid = new Gtk.Grid({
            row_spacing: 6,
            column_spacing: 6
        })
        const uLabel = new Gtk.Label({
            xalign: 1,
            label: _('Username')
        })
        const pLabel = new Gtk.Label({
            xalign: 1,
            label: _('Password')
        })
        uLabel.get_style_context().add_class('dim-label')
        pLabel.get_style_context().add_class('dim-label')
        const uEntry = new Gtk.Entry()
        const pEntry = new Gtk.Entry({
            visibility: false,
            input_purpose: Gtk.InputPurpose.PASSWORD
        })
        grid.attach(uLabel, 0, 0, 1, 1)
        grid.attach(uEntry, 1, 0, 1, 1)
        grid.attach(pLabel, 0, 1, 1, 1)
        grid.attach(pEntry, 1, 1, 1, 1)
        grid.show_all()
        msg.message_area.pack_start(grid, false, true, 0)

        const ok = () =>
            msg.get_widget_for_response(Gtk.ResponseType.OK).activate()
        pEntry.connect('activate', ok)
        uEntry.connect('activate', ok)

        if (msg.run() === Gtk.ResponseType.OK) {
            const cred = new WebKit2.Credential(uEntry.text, pEntry.text,
                WebKit2.CredentialPersistence.FOR_SESSION)
            req.authenticate(cred)
        } else req.cancel()

        msg.destroy()
        return true
    }
    static opdsEntryToMetadata(entry) {
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
    static isAcquisitionFeed(feed) {
        return feed.entries && feed.entries.some(OpdsClient.isCatalogEntry)
    }
    static isCatalogEntry(entry) {
        return entry.links
            && entry.links.some(link =>
                linkIsRel(link, rel =>
                    rel.startsWith('http://opds-spec.org/acquisition')))
    }
    static typeIsOpds(type) {
        // should probably check "profile=opds-catalog" too/instead
        return type.includes('application/atom+xml')
    }
    static getIndirectAcquisition(link) {
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
        const { type, drm } = OpdsClient.getIndirectAcquisition(link)

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
            const { type, drm } = OpdsClient.getIndirectAcquisition(link)
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

var LoadBox = GObject.registerClass({
    GTypeName: 'FoliateLoadBox'
}, class LoadBox extends Gtk.Stack {
    _init(params, load) {
        super._init(params)
        this.transition_type = Gtk.StackTransitionType.CROSSFADE
        this._load = load

        this._buildLoading()
        this._buildError()

        let loaded
        this.connect('realize', () => {
            if (loaded) return
            loaded = true
            this._loadWidget()
        })
    }
    _buildLoading() {
        const spinner = new Gtk.Spinner({
            visible: true,
            active: true,
            valign: Gtk.Align.CENTER,
            halign: Gtk.Align.CENTER,
            width_request: 64,
            height_request: 64
        })
        this.add_named(spinner, 'loading')
    }
    _buildError() {
        const error = new Gtk.Label({
            visible: true,
            wrap: true,
            label: _('Unable to load OPDS feed')
        })
        error.get_style_context().add_class('dim-label')
        const reload = new Gtk.Button({
            visible: true,
            label: _('Reload'),
            halign: Gtk.Align.CENTER
        })
        reload.connect('clicked', () => this._loadWidget())
        const errorBox = new Gtk.Box({
            visible: true,
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 12,
            valign: Gtk.Align.CENTER
        })
        errorBox.pack_start(error, false, true, 0)
        errorBox.pack_start(reload, false, true, 0)
        this.add_named(errorBox, 'error')
    }
    _loadWidget() {
        this.visible_child_name = 'loading'
        const widget = this._load()
        this.add_named(widget, 'loaded')
        widget.connect('loaded', () => {
            this.visible_child_name = 'loaded'
        })
        widget.connect('error', () => {
            this.visible_child_name = 'error'
        })
    }
})

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
        }, OpdsClient.opdsEntryToMetadata(this.entry.value), null)
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


var OpdsFullEntryBox =  GObject.registerClass({
    GTypeName: 'FoliateOpdsFullEntryBox',
}, class OpdsFullEntryBox extends Gtk.Box {
    _init(params) {
        super._init(params)
        this.orientation = Gtk.Orientation.VERTICAL
    }
    async load(entry) {
        let pixbuf
        const client = new OpdsClient(this)
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
        }, OpdsClient.opdsEntryToMetadata(entry), pixbuf)
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

var OpdsFeed = GObject.registerClass({
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
            const client = new OpdsClient(this)
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
        const metadata = OpdsClient.opdsEntryToMetadata(entry)
        if (!OpdsClient.isCatalogEntry(entry) && !metadata.creator) {
            metadata.creator = entry.content
        }
        this._image.generate(metadata)
    }
    get image() {
        return this._image
    }
})


var OpdsAcquisitionBox = GObject.registerClass({
    GTypeName: 'FoliateOpdsAcquisitionBox',
    Properties: {
        'max-entries':
            GObject.ParamSpec.int('max-entries', 'max-entries', 'max-entries',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, 0, 2147483647, 0),
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
            if (!OpdsClient.isCatalogEntry(entry)) {
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
    }
    async load(entries) {
        this.emit('loaded')
        if (!entries) return // TODO: empty placeholder
        let loadCount = 0
        const client = new OpdsClient(this)
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

var OpdsNavigationBox = GObject.registerClass({
    GTypeName: 'FoliateOpdsNavigationBox',
    Properties: {
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

var OpdsBox = GObject.registerClass({
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
            const client = new OpdsClient(this)
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
            : OpdsClient.isAcquisitionFeed(feed)
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

const defaultTitle = _('OPDS Catalog')

var OpdsBrowser = GObject.registerClass({
    GTypeName: 'FoliateOpdsBrowser',
    Properties: {
        title: GObject.ParamSpec.string('title', 'title', 'title',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, defaultTitle),
        searchable: GObject.ParamSpec.boolean('searchable', 'searchable', 'searchable',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, false),
    }
}, class OpdsBrowser extends Gtk.Box {
    _init(params) {
        super._init(params)

        this.actionGroup = new Gio.SimpleActionGroup()
        const actions = {
            'back': () => this._goBack(),
            'home': () => this._goHome(),
            'reload': () => this._loadOpds(this._uri),
            'location': () => this.showLocationDialog()
        }
        Object.keys(actions).forEach(name => {
            const action = new Gio.SimpleAction({ name })
            action.connect('activate', actions[name])
            this.actionGroup.add_action(action)
        })
        this.reset()
    }
    getCatalog() {
        return {
            title: this.title,
            uri: this._home || this._uri,
            preview: this._uri
        }
    }
    reset() {
        if (this._opdsWidget) this._opdsWidget.destroy()
        this._uri = null
        this._history = []
        this._searchLink = null
        this._updateBack()
        this._home = null
    }
    search(text) {
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
        this.pack_start(this._opdsWidget, true, true, 0)

        const client = new OpdsClient(this)
        client.init()
            .then(() => client.getOpenSearch(query, this._searchLink.href))
            .then(uri => this.loadOpds(uri))
            .catch(e => logError(e))
            .then(() => client.close())
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
        if (!x) return
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
        this.loadOpds(this._home)
    }
    showLocationDialog() {
        const top = this.get_toplevel()
        const width = top.get_size()[0]
        const window = new Gtk.Dialog({
            title: _('OPDS URL'),
            modal: true,
            use_header_bar: true,
            transient_for: top,
            default_width: Math.min(500, width * 0.95)
        })
        window.add_button(_('Cancel'), Gtk.ResponseType.CANCEL)
        window.add_button(_('Go'), Gtk.ResponseType.ACCEPT)
        window.set_default_response(Gtk.ResponseType.ACCEPT)

        const entry =  new Gtk.Entry({ text: this._uri })
        entry.connect('activate', () =>
            window.response(Gtk.ResponseType.ACCEPT))

        const container = window.get_content_area()
        container.border_width = 18
        container.pack_start(entry, false, true, 0)
        window.show_all()
        const response = window.run()
        if (response === Gtk.ResponseType.ACCEPT) this.loadOpds(entry.text)
        window.close()
    }
    loadOpds(uri) {
        this._pushHistory(this._uri)
        this._loadOpds(uri).catch(e => logError(e))
    }
    async _loadOpds(uri) {
        this.set_property('title', _('Loading…'))

        this._uri = uri
        if (this._opdsWidget) this._opdsWidget.destroy()

        const handleLink = (href, type) => {
            if (OpdsClient.typeIsOpds(type)) this.loadOpds(href)
            else Gtk.show_uri_on_window(null, href, Gdk.CURRENT_TIME)
        }

        const nb = new Gtk.Notebook({
            visible: true,
            scrollable: true,
            show_border: false
        })
        const updateShowTabs = () => nb.show_tabs = nb.get_n_pages() > 1
        nb.connect('page-added', updateShowTabs)
        nb.connect('page-removed', updateShowTabs)
        this._opdsWidget = nb
        this.pack_start(nb, true, true, 0)

        const makePage = (uri, title) => new Promise((resolve, reject) => {
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
                    if (this._uri !== uri) return reject()

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
                        paginationBtton.connect('clicked', () => this.loadOpds(link.href))
                        buttonBox.pack_start(paginationBtton, false, true, 0)
                    })

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

                    resolve(feed)
                })
                widget.connect('error', () => {
                    if (this._uri !== uri) return reject()
                    if (!title) label.label = _('Error')
                    reject(new Error())
                })
                return widget
            })
            box.pack_start(loadbox, false, true, 0)
            column.add(box)

            const scrolled = new Gtk.ScrolledWindow({ visible: true })
            scrolled.add(column)
            nb.append_page(scrolled, label)
            nb.child_set_property(scrolled, 'tab-expand', true)
        })

        const related = {
            'related': _('Related'),
            'section': _('Section'),
            'subsection': _('Subsection'),
            'http://opds-spec.org/sort/new': _('New'),
            'http://opds-spec.org/sort/popular': _('Popular'),
            'http://opds-spec.org/featured': _('Featured'),
            'http://opds-spec.org/recommended': _('Recommended')
        }

        makePage(uri, null).then(feed => {
            this.set_property('title', feed.title || defaultTitle)
            const tabs = [].concat(feed.links).filter(link => 'href' in link
                && 'rel' in link
                && Object.keys(related).some(rel => linkIsRel(link, rel)))

            tabs.forEach(({ title, href, rel }) => {
                makePage(href, title || related[rel])
            })

            const home = feed.links.find(link => linkIsRel(link, 'start'))
            if (home) this._home = home.href

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
            this._searchLink = search
            this.set_property('searchable', Boolean(search))
        }).catch(e => {
            if (e) this.set_property('title', _('Error'))
        })
    }
})
