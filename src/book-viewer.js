import Gtk from 'gi://Gtk'
import Adw from 'gi://Adw'
import GLib from 'gi://GLib'
import Gio from 'gi://Gio'
import GObject from 'gi://GObject'
import WebKit from 'gi://WebKit2'
import Gdk from 'gi://Gdk'
import Pango from 'gi://Pango'
import { gettext as _ } from 'gettext'

import * as utils from './utils.js'
import * as format from './format.js'
import { WebView } from './webview.js'

import './toc.js'
import './search.js'
import './navbar.js'
import { AnnotationPopover } from './annotations.js'
import { ImageViewer } from './image-viewer.js'
import { makeBookInfoWindow } from './book-info.js'

const ViewSettings = utils.makeDataClass('FoliateViewSettings', {
    'brightness': 'double',
    'spacing': 'double',
    'justify': 'boolean',
    'hyphenate': 'boolean',
    'margin': 'uint',
    'width': 'uint',
    'scrolled': 'boolean',
    'zoom-level': 'double',
})

const FontSettings = utils.makeDataClass('FoliateFontSettings', {
    'serif': 'string',
    'sans-serif': 'string',
    'monospace': 'string',
    'default': 'uint',
    'default-size': 'double',
    'minimum-size': 'double',
})

const getFamily = str => Pango.FontDescription.from_string(str).get_family()

const FontSettingsWidget = GObject.registerClass({
    GTypeName: 'FoliateFontSettingsWidget',
    Template: pkg.moduleuri('ui/font-settings-widget.ui'),
    Properties: utils.makeParams({
        'font-settings': 'object',
    }),
    InternalChildren: ['default', 'serif', 'sans-serif', 'monospace', 'default-size', 'minimum-size'],
}, class extends Gtk.Box {
    constructor(params) {
        super(params)
        this.font_settings.bindProperties({
            'serif': [this._serif, 'font'],
            'sans-serif': [this._sans_serif, 'font'],
            'monospace': [this._monospace, 'font'],
            'default': [this._default, 'selected'],
            'default-size': [this._default_size, 'value'],
            'minimum-size': [this._minimum_size, 'value'],
        })
    }
})

GObject.registerClass({
    GTypeName: 'FoliateBookView',
    Signals: {
        'book-ready': { param_types: [GObject.TYPE_JSOBJECT] },
        'book-error': { param_types: [GObject.TYPE_JSOBJECT] },
        'relocated': { param_types: [GObject.TYPE_JSOBJECT] },
        'external-link': { param_types: [GObject.TYPE_JSOBJECT] },
        'reference': { param_types: [GObject.TYPE_JSOBJECT] },
        'selection': { param_types: [GObject.TYPE_JSOBJECT] },
        'add-annotation': { param_types: [GObject.TYPE_JSOBJECT] },
        'delete-annotation': { param_types: [GObject.TYPE_JSOBJECT] },
        'show-annotation': { param_types: [GObject.TYPE_JSOBJECT] },
        'show-image': { param_types: [GObject.TYPE_JSOBJECT] },
    },
}, class extends Gtk.Overlay {
    #path
    #webView = utils.connect(new WebView({
        settings: new WebKit.Settings({
            enable_write_console_messages_to_stdout: true,
            enable_developer_extras: true,
            enable_back_forward_navigation_gestures: false,
            enable_hyperlink_auditing: false,
            enable_html5_database: false,
            enable_html5_local_storage: false,
        }),
    }), {
        'run-file-chooser': (_, req) =>
            (req.select_files([encodeURI(this.#path)]), true),
        'context-menu': this.#contextMenu.bind(this),
    })
    #pinchFactor = 1
    fontSettings = new FontSettings({
        'serif': 'Serif 12',
        'sans-serif': 'Sans 12',
        'monospace': 'Monospace 12',
        'default': 'serif',
        'default-size': 12,
    })
    viewSettings = new ViewSettings({
        'brightness': 1,
        'spacing': 1.5,
        'justify': true,
        'hyphenate': true,
        'margin': 60,
        'width': 720,
        'zoom-level': 1,
        //'scrolled': true,
    })
    constructor(params) {
        super(params)
        this.child = this.#webView
        this.#webView.registerHandler('viewer', payload => {
            if (payload.type === 'ready') this.#exec('init')
            else this.emit(payload.type, payload)
        })

        // handle pinch zoom
        this.add_controller(utils.connect(new Gtk.GestureZoom({
            propagation_phase: Gtk.PropagationPhase.CAPTURE,
        }), {
            'end': () => Promise.resolve()
                .then(() => this.webView.eval('window.innerWidth'))
                .then(innerWidth => this.#pinchFactor =
                    this.#webView.get_allocated_width() / innerWidth)
                .catch(e => console.error(e)),
        }))

        const applyStyle = () => this.#applyStyle().catch(e => console.error(e))
        this.viewSettings.connectAll(applyStyle)
        this.fontSettings.connectAll(applyStyle)
        this.connect('book-ready', applyStyle)

        this.actionGroup = utils.addMethods(this, {
            actions: [
                'reload', 'inspector', 'prev', 'next', 'go-left', 'go-right',
                'prev-section', 'next-section', 'first-section', 'last-section',
                'zoom-in', 'zoom-restore', 'zoom-out',
            ],
        })
        utils.addPropertyActions(this.viewSettings,
            this.viewSettings.keys, this.actionGroup)
    }
    #exec(...args) {
        return this.#webView.exec(...args).catch(e => console.error(e))
    }
    async #applyStyle() {
        const font = this.fontSettings
        Object.assign(this.#webView.get_settings(), {
            serif_font_family: getFamily(font.serif),
            sans_serif_font_family: getFamily(font.sans_serif),
            default_font_family: getFamily(font.default === 1
                ? font.sans_serif : font.serif),
            default_font_size: WebKit.Settings.font_size_to_pixels(font.default_size),
            // TODO: disable this for fixed-layout
            minimum_font_size: WebKit.Settings.font_size_to_pixels(font.minimum_size),
        })
        const view = this.viewSettings
        await this.#exec('reader.setAppearance', {
            layout: {
                gap: view.margin,
                maxColumnWidth: view.width,
                flow: view.scrolled ? 'scrolled' : 'paginated',
            },
            style: {
                spacing: view.spacing,
                justify: view.justify,
                hyphenate: view.hyphenate,
            },
        })
        const z = view.zoom_level
        this.#webView.zoom_level = z
        //this.actionGroup.lookup_action('zoom-restore').enabled = z !== 1
        this.actionGroup.lookup_action('zoom-out').enabled = z > 0.2
        this.actionGroup.lookup_action('zoom-in').enabled = z < 4
    }
    #contextMenu() {
        return true
    }
    open(file) {
        if (file) this.#path = file.get_path()
        this.#webView.loadURI('foliate:///reader/reader.html')
            .catch(e => console.error(e))
    }
    reload() {
        this.open()
    }
    zoomIn() {
        this.viewSettings.set_property('zoom-level', this.viewSettings.zoom_level + 0.1)
    }
    zoomOut() {
        this.viewSettings.set_property('zoom-level', this.viewSettings.zoom_level - 0.1)
    }
    zoomRestore() {
        this.viewSettings.set_property('zoom-level', 1)
    }
    inspector() {
        this.#webView.get_inspector().show()
    }
    getRect({ x, y }) {
        const factor = this.#pinchFactor * this.#webView.zoom_level
        return new Gdk.Rectangle({ x: factor * x, y: factor * y })
    }
    showPopover(popover, point, dir) {
        this.add_overlay(popover)
        popover.connect('closed', () => utils.wait(0)
            .then(() => this.remove_overlay(popover)))
        popover.position = dir === 'up' ? Gtk.PositionType.TOP : Gtk.PositionType.BOTTOM
        popover.pointing_to = this.getRect(point)
        popover.popup()
    }
    goTo(x) { return this.#exec('reader.view.goTo', x) }
    goToFraction(x) { return this.#exec('reader.view.goToFraction', x) }
    select(x) { return this.#exec('reader.view.select', x) }
    prev() { return this.#exec('reader.view.renderer.prev') }
    next() { return this.#exec('reader.view.renderer.next') }
    goLeft() { return this.#exec('reader.view.goLeft') }
    goRight() { return this.#exec('reader.view.goRight') }
    prevSection() { return this.#exec('reader.view.renderer.prevSection') }
    nextSection() { return this.#exec('reader.view.renderer.nextSection') }
    firstSection() { return this.#exec('reader.view.renderer.firstSection') }
    lastSection() { return this.#exec('reader.view.renderer.lastSection') }
    search(x) { return this.#webView.iter('reader.view.search', x) }
    showAnnotation(x) { return this.#exec('reader.view.showAnnotation', x) }
    addAnnotation(x) { return this.#exec('reader.view.annotations.add', x) }
    updateAnnotation(x) { return this.#exec('reader.view.annotations.update', x) }
    deleteAnnotation(x) { return this.#exec('reader.view.annotations.delete', x) }
    getCover() { return this.#exec('reader.getCover').then(utils.base64ToPixbuf) }
    init(x) { return this.#exec('reader.view.init', x) }
    get webView() { return this.#webView }
})

const FootnotePopover = GObject.registerClass({
    GTypeName: 'FoliateFootnotePopover',
    Template: pkg.moduleuri('ui/footnote-popover.ui'),
    Properties: utils.makeParams({
        'footnote': 'string',
        'href': 'string',
    }),
    InternalChildren: ['footnote', 'sep', 'button'],
    Signals: {
        'go-to': {},
    },
}, class extends Gtk.Popover {
    constructor(params) {
        super(params)
        this._footnote.label = this.footnote
        if (this.href) this._button.connect('clicked', () => {
            this.emit('go-to')
            this.popdown()
        })
        else {
            this._sep.hide()
            this._button.hide()
        }
    }
    popup() {
        super.popup()
        this._footnote.select_region(-1, -1)
    }
})

const SelectionPopover = GObject.registerClass({
    GTypeName: 'FoliateSelectionPopover',
    Template: pkg.moduleuri('ui/selection-popover.ui'),
}, class extends Gtk.PopoverMenu {
})

const autohide = (revealer, shouldStayVisible) => {
    const show = () => revealer.reveal_child = true
    const hide = () => revealer.reveal_child = false
    const sync = () => revealer.reveal_child = shouldStayVisible()
    revealer.add_controller(utils.connect(
        new Gtk.EventControllerMotion(), { 'enter': show, 'leave': sync }))
    revealer.add_controller(utils.connect(
        new Gtk.GestureClick(), { 'pressed': show }))
    return { show, hide, sync }
}

const makeIdentifier = file => {
    try {
        const stream = file.read(null)
        // 10000000 might not be the best value but I guess we will stick to it
        // for compatibility with previous versions
        const bytes = stream.read_bytes(10000000, null)
        const md5 = GLib.compute_checksum_for_bytes(GLib.ChecksumType.MD5, bytes)
        return `foliate:${md5}`
    } catch(e) {
        console.warn(e)
        return null
    }
}

export const BookViewer = GObject.registerClass({
    GTypeName: 'FoliateBookViewer',
    Template: pkg.moduleuri('ui/book-viewer.ui'),
    Properties: utils.makeParams({
        'fold-sidebar': 'boolean',
    }),
    InternalChildren: [
        'top-overlay-box', 'top-overlay-stack',
        'error-page', 'error-page-expander', 'error-page-details',
        'view', 'flap', 'sidebar', 'resize-handle',
        'headerbar-revealer', 'navbar-revealer',
        'book-menu-button',
        'view-popover', 'zoom-button', 'spacing', 'margin', 'width', 'navbar',
        'sidebar-stack', 'contents-stack', 'toc-view',
        'search-view', 'search-bar', 'search-entry',
        'annotation-stack', 'annotation-view', 'annotation-search-entry',
        'book-cover', 'book-title', 'book-author',
    ],
}, class extends Gtk.Overlay {
    #file
    #book
    #cover
    constructor(params) {
        super(params)
        utils.connect(this._view, {
            'book-error': (_, x) => this.#onError(x),
            'book-ready': (_, x) => this.#onBookReady(x).catch(e => console.error(e)),
            'relocated': (_, x) => this.#onRelocated(x),
            'external-link': (_, x) => Gtk.show_uri(null, x.uri, Gdk.CURRENT_TIME),
            'reference': (_, x) => this.#onReference(x),
            'selection': (_, x) => this.#onSelection(x),
            'add-annotation': (_, x) => this._annotation_view.add(x),
            'delete-annotation': (_, x) => this._annotation_view.delete(x),
            'show-annotation': (_, x) => this.#showAnnotation(x),
            'show-image': (_, x) => this.#showImage(x),
        })

        // view settings
        this._view.viewSettings.bindProperties({
            'spacing': [this._spacing, 'value'],
            'margin': [this._margin, 'value'],
            'width': [this._width, 'value'],
        })
        const updateZoom = () => this._zoom_button.label =
            format.percent(this._view.viewSettings.zoom_level)
        this._view.viewSettings.connect('notify::zoom-level', updateZoom)
        updateZoom()

        // sidebar
        const setFoldSidebar = () =>
            this._flap.fold_policy = this.fold_sidebar
                ? Adw.FlapFoldPolicy.ALWAYS : Adw.FlapFoldPolicy.AUTO
        this.connect('notify::fold-sidebar', setFoldSidebar)
        setFoldSidebar()
        this._resize_handle.cursor = Gdk.Cursor.new_from_name('col-resize', null)
        this._resize_handle.add_controller(utils.connect(new Gtk.GestureDrag(), {
            'drag-update': (_, x) => this._sidebar.width_request += x,
        }))

        // revealers
        const autohideHeaderbar = autohide(this._headerbar_revealer,
            () => this._view_popover.visible)
        const autohideNavbar = autohide(this._navbar_revealer,
            () => this._navbar.shouldStayVisible)
        this._view_popover.connect('closed', autohideHeaderbar.hide)
        this._navbar.connect('closed', autohideNavbar.hide)
        this._navbar.connect('opened', autohideNavbar.show)

        // search
        this._search_view.getGenerator = params => this._view.search(params)
        utils.connect(this._search_view, {
            'show-results': () => this._sidebar_stack.visible_child_name = 'search',
            'no-results': () => this._sidebar_stack.visible_child_name = 'search-empty',
            'show-cfi': (_, cfi) => {
                this._view.select(cfi)
                if (this._flap.folded) this._flap.reveal_flap = false
            },
        })
        this.insert_action_group('search', this._search_view.actionGroup)
        this._search_bar.connect_entry(this._search_entry)
        this._search_bar.connect('notify::search-mode-enabled', () => {
            this._search_view.reset().catch(e => console.error(e))
            this._sidebar_stack.visible_child_name = 'main'
        })
        utils.connect(this._search_entry, {
            'activate': this._search_view.doSearch,
            'changed': entry =>
                entry.secondary_icon_name = entry.text ? 'edit-clear-symbolic' : '',
            'icon-release': (entry, pos) =>
                pos === Gtk.EntryIconPosition.SECONDARY ? entry.text = '' : null,
        })
        this._search_entry.add_controller(utils.addShortcuts({
            'Escape': () => this._search_bar.search_mode_enabled = false }))

        // navigation
        this._toc_view.connect('go-to-href', (_, href) => {
            this._view.goTo(href)
            if (this._flap.folded) this._flap.reveal_flap = false
        })
        this._navbar.connect('go-to-cfi', (_, x) => this._view.goTo(x))
        this._navbar.connect('go-to-fraction', (_, x) => this._view.goToFraction(x))

        // annotations
        utils.connect(this._annotation_view, {
            'notify::has-items': view => this._annotation_stack
                .visible_child_name = view.has_items ? 'main' : 'empty',
            'go-to-annotation': (_, annotation) => {
                this._view.showAnnotation(annotation)
                if (this._flap.folded) this._flap.reveal_flap = false
            },
            'update-annotation': (_, annotation) =>
                this._view.updateAnnotation(annotation),
        })
        this._annotation_search_entry.connect('search-changed', entry =>
            this._annotation_view.filter(entry.text))

        // setup actions
        const actions = utils.addMethods(this, {
            actions: [
                'toggle-sidebar', 'toggle-search', 'show-location',
                'choose-font', 'show-info',
            ],
            props: ['fold-sidebar'],
        })
        utils.addPropertyActions(Adw.StyleManager.get_default(), ['color-scheme'], actions)
        this.insert_action_group('view', this._view.actionGroup)
        this.insert_action_group('viewer', actions)
        this.add_controller(utils.addShortcuts({
            'F9': 'viewer.toggle-sidebar',
            '<ctrl>f|slash': 'viewer.toggle-search',
            '<ctrl>l': 'viewer.show-location',
            '<ctrl>n': 'viewer.open-copy',
            '<ctrl>i|<alt>Return': 'viewer.show-info',
            '<ctrl><shift>g': 'search.prev',
            '<ctrl>g': 'search.next',
            '<ctrl>c': 'selection.copy',
            'F12': 'view.inspector',
            '<ctrl>m': 'view.scrolled',
            '<ctrl>r': 'view.reload',
            'plus|equal|KP_Add|KP_Equal|<ctrl>plus|<ctrl>equal|<ctrl>KP_Add|<ctrl>KP_Equal': 'view.zoom-in',
            'minus|KP_Subtract|<ctrl>minus|<ctrl>KP_Subtract': 'view.zoom-out',
            '0|1|KP_0|<ctrl>0|<ctrl>KP_0': 'view.zoom-restore',
            'p|k|Up|Page_Up': 'view.prev',
            'n|j|Down|Page_Down': 'view.next',
            'h|Left': 'view.go-left',
            'l|Right': 'view.go-right',
        }))
        // TODO: disable these when pinch zoomed
        this._view.webView.add_controller(utils.addShortcuts({
            'Up|Page_Up': 'view.prev',
            'Down|Page_Down': 'view.next',
            'Left': 'view.go-left',
            'Right': 'view.go-right',
        }))
    }
    #onError({ id, message, stack }) {
        const desc = id === 'not-found' ? _('The file could not be found.')
            : id === 'unsupported-type' ? _('The file type is not supported.')
            : _('The file could not be opened because an error occurred.')
        this._error_page.description = desc
        if (message) {
            this._error_page_details.label =
                'Error: ' + (message ?? '') + '\n' + (stack ?? '')
            this._error_page_expander.show()
        } else this._error_page_expander.hide()
        this._top_overlay_box.show()
        this._top_overlay_stack.visible_child_name = 'error'
    }
    async #onBookReady({ book, reader }) {
        this._top_overlay_box.hide()
        this.#book = book
        book.metadata ??= {}
        this.root.title = book.metadata.title ?? ''
        this._book_title.label = book.metadata.title ?? ''
        this._book_author.label = book.metadata.author
            ?.map(author => typeof author === 'string' ? author : author.name)
            ?.join(', ')
            ?? ''
        this._book_author.visible = !!book.metadata?.author?.length

        this._search_view.dir = reader.view.textDirection
        this._toc_view.dir = reader.view.textDirection
        this._toc_view.load(book.toc)
        this._navbar.setDirection(book.dir)
        this._navbar.loadSections(book.sections)
        this._navbar.loadPageList(book.pageList)
        this._navbar.loadLandmarks(book.landmarks)

        this._view.getCover().then(cover => {
            this.#cover = cover
            if (cover) this._book_cover.set_from_pixbuf(cover)
            else this._book_cover.icon_name = 'image-missing-symbolic'
        })

        book.metadata.identifier ??= makeIdentifier(this.#file)
        const { identifier } = book.metadata
        this._annotation_view.clear()
        if (identifier) {
            const storage = new utils.JSONStorage(pkg.datadir, identifier)
            const lastLocation = storage.get('lastLocation', null)
            const annotations = storage.get('annotations', [])
            await this._view.init({ lastLocation, annotations })
        } else await this._view.next()
    }
    #onRelocated(payload) {
        const { section, tocItem } = payload
        this._toc_view.setCurrent(tocItem?.id)
        this._search_view.index = section.current
        this._navbar.update(payload)
    }
    #onReference({ href, html, pos: { point, dir } }) {
        const popover = new FootnotePopover({ href, footnote: html })
        popover.connect('go-to', () => this._view.goTo(href))
        this._view.showPopover(popover, point, dir)
    }
    #onSelection({ cfi, text, html, pos: { point, dir } }) {
        const popover = new SelectionPopover()
        popover.insert_action_group('selection', utils.addSimpleActions({
            'copy': () => utils.getClipboard()
                .set_content(Gdk.ContentProvider.new_union([
                    Gdk.ContentProvider.new_for_bytes('text/html',
                        new TextEncoder().encode(html)),
                    Gdk.ContentProvider.new_for_value(text)])),
            'highlight': () => this._view.addAnnotation({
                value: cfi, text,
                color: 'underline',
            }),
            'search': () => {
                this._search_entry.text = text
                this._search_bar.search_mode_enabled = true
                this._flap.reveal_flap = true
                this._search_view.doSearch()
            },
        }))
        this._view.showPopover(popover, point, dir)
    }
    #showAnnotation({ value, pos: { point, dir } }) {
        const annotation = this._annotation_view.get(value)
        const popover = new AnnotationPopover({ annotation })
        popover.connect('delete-annotation', () => {
            this._view.deleteAnnotation(value)
            this.root.toast(utils.connect(new Adw.Toast({
                title: _('Annotation deleted'),
                button_label: _('Undo'),
            }), { 'button-clicked': () =>
                this._view.addAnnotation(annotation) }))
        })
        this._view.showPopover(popover, point, dir)
    }
    #showImage({ base64, mimetype }) {
        const pixbuf = utils.base64ToPixbuf(base64)
        const bytes = GLib.base64_decode(base64)
        const title = this.#book.metadata?.title
        const win = new Adw.Window({
            content: new Adw.ToastOverlay(),
            title: title ? format.vprintf(_('Image from “%s”'), [title]) : _('Image'),
        })
        win.content.child = utils.connect(new ImageViewer({ pixbuf }), {
            'copy': () => {
                utils.getClipboard().set_content(Gdk.ContentProvider
                    .new_for_bytes(mimetype, bytes))
                win.content.add_toast(
                    new Adw.Toast({ title: _('Copied to clipboard') }))
            },
            'save-as': () => {
                const chooser = new Gtk.FileChooserNative({
                    title: _('Save File'),
                    action: Gtk.FileChooserAction.SAVE,
                    transient_for: win,
                    modal: true,
                })
                const ext = /\/([^+]*)/.exec(mimetype)?.[1]
                chooser.set_current_name(win.title + (ext ? `.${ext}` : ''))
                chooser.connect('response', (_, res) => {
                    if (res === Gtk.ResponseType.ACCEPT) chooser.get_file()
                        .replace_contents(bytes, null, false,
                            Gio.FileCreateFlags.REPLACE_DESTINATION, null)
                })
                chooser.show()
            },
        })
        win.add_controller(utils.addShortcuts({ '<ctrl>w': () => win.close() }))
        win.present()
    }
    open(file) {
        this._top_overlay_box.show()
        // "It is better not to show spinners for very short periods of time [...]
        // consider only showing the spinner after a period of time has elapsed."
        // -- https://developer.gnome.org/hig/patterns/feedback/spinners.html
        this._top_overlay_stack.visible_child_name = 'nothing'
        setTimeout(() => {
            if (this._top_overlay_stack.visible_child_name === 'nothing')
                this._top_overlay_stack.visible_child_name = 'loading'
        }, 1000)
        this.#file = file
        this._view.open(file)
    }
    showPrimaryMenu() {
        this._flap.reveal_flap = true
        this._book_menu_button.popup()
    }
    toggleSidebar() {
        this._flap.reveal_flap = !this._flap.reveal_flap
    }
    toggleSearch() {
        const bar = this._search_bar
        if (this._search_entry.has_focus)
            bar.search_mode_enabled = false
        else {
            bar.search_mode_enabled = true
            this._flap.reveal_flap = true
            this._search_entry.grab_focus()
        }
    }
    showLocation() {
        this._navbar.showLocation()
    }
    showInfo() {
        makeBookInfoWindow(this.root, this.#book.metadata, this.#cover)
    }
    chooseFont() {
        const widget = new FontSettingsWidget({ font_settings: this._view.fontSettings })
        const content = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL })
        const header = new Adw.HeaderBar()
        content.append(header)
        content.append(widget)
        const win = new Adw.Window({
            content,
            title: _('Fonts'),
            default_width: 360,
            modal: true,
            transient_for: this.root,
        })
        win.add_controller(utils.addShortcuts({ 'Escape|<ctrl>w': () => win.close() }))
        win.present()
    }
    // it seems that it's necessary to explicitly destroy web view
    vfunc_unroot() {
        this._view.webView.unparent()
        this._view.webView.run_dispose()
    }
})
