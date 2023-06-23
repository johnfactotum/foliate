import Gtk from 'gi://Gtk'
import Adw from 'gi://Adw'
import GLib from 'gi://GLib'
import Gio from 'gi://Gio'
import GObject from 'gi://GObject'
import WebKit from 'gi://WebKit'
import Gdk from 'gi://Gdk'
import Pango from 'gi://Pango'
import { gettext as _ } from 'gettext'

import * as utils from './utils.js'
import * as format from './format.js'
import { WebView } from './webview.js'

import './toc.js'
import './search.js'
import './navbar.js'
import {
    AnnotationPopover, AnnotationModel, BookmarkModel, exportAnnotations,
} from './annotations.js'
import { ImageViewer } from './image-viewer.js'
import { makeBookInfoWindow } from './book-info.js'
import { getURIStore, getBookList } from './library.js'

// for use in the WebView
const uiText = {
    close: _('Close'),
    footnote: _('Footnote'),
    goToFootnote: _('Go to Footnote'),
}

const defaultTheme = {
    light: { fg: '#000000', bg: '#ffffff', link: '#0066cc' },
    dark: { fg: '#e0e0e0', bg: '#222222', link: '#88ccee' },
}

const invertTheme = ({ light, dark }) => ({ light, dark, inverted: {
    fg: utils.invertColor(dark.fg),
    link: utils.invertColor(dark.link),
} })

class BookData {
    annotations = utils.connect(new AnnotationModel(), {
        'update-annotation': async (_, annotation) => {
            for (const view of this.views) await view.addAnnotation(annotation)
            await this.#saveAnnotations()
        },
    })
    bookmarks = new BookmarkModel()
    constructor(key, views) {
        this.key = key
        this.views = views
        this.storage = utils.connect(new utils.JSONStorage(pkg.datadir, this.key), {
            'externally-modified': () => {
                // TODO: the file monitor doesn't seem to work
            },
            'modified': storage => getBookList()?.update(storage.path),
        })
    }
    async initView(view, init) {
        const lastLocation = this.storage.get('lastLocation', null)
        await view.init({ lastLocation })

        if (init) {
            const bookmarks = this.storage.get('bookmarks', [])
            for (const bookmark of bookmarks) {
                try {
                    const item = await view.getTOCItemOf(bookmark)
                    this.bookmarks.add(bookmark, item?.label ?? '')
                } catch (e) {
                    console.error(e)
                }
            }
            this.bookmarks.connect('notify::n-items', () => this.#saveBookmarks())
        }

        const annotations = init
            ? this.storage.get('annotations', [])
            : this.annotations.export()
        for (const annotation of annotations) this.addAnnotation(annotation, init)
        return this
    }
    async addAnnotation(annotation, init) {
        try {
            const [view, ...views] = this.views
            const { index, label } = await view.addAnnotation(annotation)
            this.annotations.add(annotation, index, label)
            for (const view of views) view.addAnnotation(annotation)
            if (!init) this.#saveAnnotations()
            return annotation
        } catch (e) {
            console.error(e)
        }
    }
    async deleteAnnotation(annotation) {
        try {
            const [view, ...views] = this.views
            const { index } = await view.deleteAnnotation(annotation)
            this.annotations.delete(annotation, index)
            for (const view of views) view.deleteAnnotation(annotation)
            return this.#saveAnnotations()
        } catch (e) {
            console.error(e)
        }
    }
    #saveAnnotations() {
        this.storage.set('annotations', this.annotations.export())
    }
    #saveBookmarks() {
        this.storage.set('bookmarks', this.bookmarks.export())
    }
}

class BookDataStore {
    #map = new Map()
    #views = new Map()
    #keys = new WeakMap()
    get(key, view) {
        const map = this.#map
        if (map.has(key)) {
            this.#views.get(key).add(view)
            this.#keys.set(view, key)
            return map.get(key).initView(view)
        }
        else {
            const views = new Set([view])
            const obj = new BookData(key, views)
            map.set(key, obj)
            this.#views.set(key, views)
            this.#keys.set(view, key)
            return obj.initView(view, true)
        }
    }
    delete(view) {
        const key = this.#keys.get(view)
        const views = this.#views.get(key)
        views.delete(view)
        if (!views.size) {
            this.#map.delete(key)
            this.#views.delete(key)
        }
    }
}

const dataStore = new BookDataStore()

const ViewSettings = utils.makeDataClass('FoliateViewSettings', {
    'brightness': 'double',
    'line-height': 'double',
    'justify': 'boolean',
    'hyphenate': 'boolean',
    'gap': 'double',
    'max-inline-size': 'uint',
    'max-block-size': 'uint',
    'max-column-count': 'uint',
    'scrolled': 'boolean',
    'invert': 'boolean',
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

const ViewPreferencesWindow = GObject.registerClass({
    GTypeName: 'FoliateViewPreferencesWindow',
    Template: pkg.moduleuri('ui/view-preferences-window.ui'),
    Properties: utils.makeParams({
        'font-settings': 'object',
        'view-settings': 'object',
    }),
    InternalChildren: [
        'default-font', 'serif-font', 'sans-serif-font', 'monospace-font',
        'default-font-size', 'minimum-font-size',
        'line-height', 'justify', 'hyphenate', 'gap',
        'max-inline-size', 'max-block-size', 'max-column-count',
    ],
}, class extends Adw.PreferencesWindow {
    constructor(params) {
        super(params)
        this.font_settings.bindProperties({
            'serif': [this._serif_font, 'font'],
            'sans-serif': [this._sans_serif_font, 'font'],
            'monospace': [this._monospace_font, 'font'],
            'default': [this._default_font, 'selected'],
            'default-size': [this._default_font_size, 'value'],
            'minimum-size': [this._minimum_font_size, 'value'],
        })
        this.viewSettings.bindProperties({
            'line-height': [this._line_height, 'value'],
            'justify': [this._justify, 'active'],
            'hyphenate': [this._hyphenate, 'active'],
            'gap': [this._gap, 'value'],
            'max-inline-size': [this._max_inline_size, 'value'],
            'max-block-size': [this._max_block_size, 'value'],
            'max-column-count': [this._max_column_count, 'value'],
        })
    }
})

GObject.registerClass({
    GTypeName: 'FoliateBookView',
    Signals: {
        'book-ready': { param_types: [GObject.TYPE_JSOBJECT] },
        'book-error': { param_types: [GObject.TYPE_JSOBJECT] },
        'dialog-open': { param_types: [GObject.TYPE_JSOBJECT] },
        'dialog-close': { param_types: [GObject.TYPE_JSOBJECT] },
        'relocate': { param_types: [GObject.TYPE_JSOBJECT] },
        'external-link': { param_types: [GObject.TYPE_JSOBJECT] },
        'selection': { param_types: [GObject.TYPE_JSOBJECT] },
        'create-overlay': { param_types: [GObject.TYPE_JSOBJECT] },
        'add-annotation': { param_types: [GObject.TYPE_JSOBJECT] },
        'delete-annotation': { param_types: [GObject.TYPE_JSOBJECT] },
        'show-image': { param_types: [GObject.TYPE_JSOBJECT] },
        'show-selection': {
            param_types: [GObject.TYPE_JSOBJECT],
            return_type: GObject.TYPE_JSOBJECT,
        },
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
    #bookReady = false
    #pinchFactor = 1
    #dialogOpened = false
    fontSettings = new FontSettings({
        'serif': 'Serif 12',
        'sans-serif': 'Sans 12',
        'monospace': 'Monospace 12',
        'default': 'serif',
        'default-size': 16,
    })
    viewSettings = new ViewSettings({
        'brightness': 1,
        'line-height': 1.5,
        'justify': true,
        'hyphenate': true,
        'gap': 0.06,
        'max-inline-size': 720,
        'max-block-size': 1440,
        'max-column-count': 2,
        'scrolled': false,
    })
    constructor(params) {
        super(params)
        this.child = this.#webView
        const initSelection = this.#webView.provide('showSelection', payload =>
            this.emit('show-selection', payload))
        this.#webView.registerHandler('viewer', payload => {
            if (payload.type === 'ready') {
                this.#exec('init', { uiText })
                initSelection()
            }
            else if (payload.type === 'pinch-zoom') this.#pinchFactor = payload.scale
            else if (payload.type === 'history-index-change') {
                this.actionGroup.lookup_action('back').enabled = payload.canGoBack
                this.actionGroup.lookup_action('forward').enabled = payload.canGoForward
            }
            else this.emit(payload.type, payload)
        })
        this.connect('book-ready', () => this.#bookReady = true)
        this.connect('dialog-open', () => this.#dialogOpened = true)
        this.connect('dialog-close', () => this.#dialogOpened = false)

        // handle scroll events
        let isDiscrete = true, dxLast, dyLast
        const scrollPageAsync = utils.debounce((dx, dy) => {
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0) return this.goRight()
                else if (dx < 0) return this.goLeft()
            } else {
                if (dy > 0) return this.next()
                else if (dy < 0) return this.prev()
            }
        }, 100, true)
        this.#webView.add_controller(utils.connect(new Gtk.EventControllerScroll({
            flags: Gtk.EventControllerScrollFlags.BOTH_AXES,
        }), {
            'scroll-begin': () => isDiscrete = false,
            'scroll': (_, dx, dy) => {
                if (this.#pinchFactor > 1
                || this.viewSettings.scrolled
                || this.#dialogOpened) return false
                if (isDiscrete) scrollPageAsync(dx, dy)
                else {
                    dxLast = dx
                    dyLast = dy
                    this.#exec('reader.scrollBy', [dx, dy])
                }
                return true
            },
            'scroll-end': () => {
                if (dxLast != null) this.#exec('reader.snap', [dxLast, dyLast])
                isDiscrete = false
                dxLast = null
                dyLast = null
            },
        }))

        const applyStyle = () => this.#applyStyle().catch(e => console.error(e))
        this.viewSettings.connectAll(applyStyle)
        this.fontSettings.connectAll(applyStyle)
        this.connect('book-ready', applyStyle)

        this.#webView.connect('notify::zoom-level', webView => {
            const z = webView.zoom_level
            this.actionGroup.lookup_action('zoom-out').enabled = z > 0.2
            this.actionGroup.lookup_action('zoom-in').enabled = z < 4
        })

        this.actionGroup = utils.addMethods(this, {
            actions: [
                'reload', 'inspector', 'prev', 'next', 'go-left', 'go-right',
                'prev-section', 'next-section', 'first-section', 'last-section',
                'back', 'forward', 'zoom-in', 'zoom-restore', 'zoom-out', 'print',
            ],
        })
        utils.addPropertyActions(this.viewSettings,
            this.viewSettings.keys, this.actionGroup)

        this.actionGroup.lookup_action('back').enabled = false
        this.actionGroup.lookup_action('forward').enabled = false
    }
    #exec(...args) {
        return this.#webView.exec(...args).catch(e => console.error(e))
    }
    async #applyStyle() {
        const font = this.fontSettings
        Object.assign(this.#webView.get_settings(), {
            serif_font_family: getFamily(font.serif),
            sans_serif_font_family: getFamily(font.sans_serif),
            monospace_font_family: getFamily(font.monospace),
            default_font_family: getFamily(font.default === 1
                ? font.sans_serif : font.serif),
            default_font_size: font.default_size,
            // TODO: disable this for fixed-layout
            minimum_font_size: font.minimum_size,
        })
        const view = this.viewSettings
        if (this.#bookReady) await this.#exec('reader.setAppearance', {
            layout: {
                gap: view.gap,
                maxInlineSize: view.max_inline_size,
                maxBlockSize: view.max_block_size,
                maxColumnCount: view.max_column_count,
                flow: view.scrolled ? 'scrolled' : 'paginated',
            },
            style: {
                lineHeight: view.line_height,
                justify: view.justify,
                hyphenate: view.hyphenate,
                invert: view.invert,
                theme: view.invert ? invertTheme(defaultTheme) : defaultTheme,
            },
        })
    }
    #contextMenu() {
        return true
    }
    open(file) {
        this.#bookReady = false
        if (file) this.#path = file.get_path()
        this.#webView.loadURI('foliate:///reader/reader.html')
            .catch(e => console.error(e))
    }
    reload() {
        this.open()
    }
    zoomIn() { this.#webView.zoom_level += 0.1 }
    zoomOut() { this.#webView.zoom_level -= 0.1 }
    zoomRestore() { this.#webView.zoom_level = 1 }
    inspector() {
        this.#webView.get_inspector().show()
    }
    getRect({ x, y }) {
        const factor = this.#pinchFactor * this.#webView.zoom_level
        return new Gdk.Rectangle({ x: factor * x, y: factor * y })
    }
    showPopover(popover, point, dir) {
        this.add_overlay(popover)
        popover.connect('closed', () => utils.wait(0).then(() => {
            this.remove_overlay(popover)
            this.deselect()
        }))
        popover.position = dir === 'up' ? Gtk.PositionType.TOP : Gtk.PositionType.BOTTOM
        popover.pointing_to = this.getRect(point)
        popover.popup()
    }
    showRibbon(x) {
        return this.#webView.run(`document.querySelector('#ribbon').style.visibility =
            '${x ? 'visible' : 'hidden'}'`).catch(e => console.error(e))
    }
    goTo(x) { return this.#exec('reader.view.goTo', x) }
    goToFraction(x) { return this.#exec('reader.view.goToFraction', x) }
    select(x) { return this.#exec('reader.view.select', x) }
    deselect() { return this.#exec('reader.view.deselect') }
    getTOCItemOf(x) { return this.#exec('reader.view.getTOCItemOf', x) }
    prev() { return this.#exec('reader.view.prev') }
    next() { return this.#exec('reader.view.next') }
    goLeft() { return this.#exec('reader.view.goLeft') }
    goRight() { return this.#exec('reader.view.goRight') }
    // TODO: these should push history
    prevSection() { return this.#exec('reader.view.renderer.prevSection') }
    nextSection() { return this.#exec('reader.view.renderer.nextSection') }
    firstSection() { return this.#exec('reader.view.renderer.firstSection') }
    lastSection() { return this.#exec('reader.view.renderer.lastSection') }
    back() { return this.#exec('reader.view.history.back') }
    forward() { return this.#exec('reader.view.history.forward') }
    search(x) { return this.#webView.iter('reader.view.search', x) }
    clearSearch() { return this.#webView.iter('reader.view.clearSearch') }
    showAnnotation(x) { return this.#exec('reader.view.showAnnotation', x) }
    addAnnotation(x) { return this.#exec('reader.view.addAnnotation', x) }
    deleteAnnotation(x) { return this.#exec('reader.view.deleteAnnotation', x) }
    print() { return this.#exec('reader.print') }
    getCover() { return this.#exec('reader.getCover').then(utils.base64ToPixbuf) }
    init(x) { return this.#exec('reader.view.init', x) }
    get webView() { return this.#webView }
    grab_focus() { return this.#webView.grab_focus() }
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
        'highlight-color': 'string',
    }),
    InternalChildren: [
        'top-overlay-box', 'top-overlay-stack',
        'error-page', 'error-page-expander', 'error-page-details',
        'view', 'flap', 'sidebar', 'resize-handle',
        'headerbar-revealer', 'navbar-revealer',
        'book-menu-button', 'bookmark-button',
        'view-popover', 'zoom-button',
        'navbar',
        'library-button', 'sidebar-stack', 'contents-stack', 'toc-view',
        'search-view', 'search-bar', 'search-entry',
        'annotation-stack', 'annotation-view', 'annotation-search-entry',
        'bookmark-stack', 'bookmark-view',
        'book-info', 'book-cover', 'book-title', 'book-author',
    ],
}, class extends Gtk.Overlay {
    #file
    #book
    #cover
    #data
    constructor(params) {
        super(params)
        utils.connect(this._view, {
            'book-error': (_, x) => this.#onError(x),
            'book-ready': (_, x) => this.#onBookReady(x).catch(e => console.error(e)),
            'relocate': (_, x) => this.#onRelocate(x),
            'external-link': (_, x) => Gtk.show_uri(null, x.href, Gdk.CURRENT_TIME),
            'selection': (_, x) => this.#onSelection(x),
            'create-overlay': (_, x) => this.#createOverlay(x),
            'show-image': (_, x) => this.#showImage(x),
            'show-selection': (_, x) => this.#showSelection(x),
            'dialog-open': () => {
                this._headerbar_revealer.visible = false
                this._navbar_revealer.visible = false
            },
            'dialog-close': () => {
                this._headerbar_revealer.visible = true
                this._navbar_revealer.visible = true
            },
        })
        this.highlight_color = 'yellow'
        utils.bindSettings('viewer', this, ['fold-sidebar', 'highlight-color'])
        this._view.fontSettings.bindSettings('viewer.font')
        this._view.viewSettings.bindSettings('viewer.view')
        this._view.webView.connect('notify::zoom-level', webView =>
            this._zoom_button.label = format.percent(webView.zoom_level))

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
        this._flap.connect('notify::reveal-flap', flap =>
            (flap.reveal_flap ? this._library_button : this._view).grab_focus())

        // revealers
        const autohideHeaderbar = autohide(this._headerbar_revealer,
            () => this._view_popover.visible)
        const autohideNavbar = autohide(this._navbar_revealer,
            () => this._navbar.shouldStayVisible)
        this._view_popover.connect('closed', autohideHeaderbar.hide)
        this._bookmark_button.connect('clicked', autohideHeaderbar.hide)
        this._navbar.connect('closed', autohideNavbar.hide)
        this._navbar.connect('opened', autohideNavbar.show)
        this._view.webView.add_controller(utils.connect(new Gtk.GestureClick(), {
            'pressed': () => {
                autohideHeaderbar.hide()
                autohideNavbar.hide()
            },
        }))

        // search
        this._search_view.getGenerator = params => this._view.search(params)
        utils.connect(this._search_view, {
            'show-results': () => this._sidebar_stack.visible_child_name = 'search',
            'no-results': () => this._sidebar_stack.visible_child_name = 'search-empty',
            'clear-results': () => this._view.clearSearch(),
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
            this._view.grab_focus()
        })
        this._navbar.connect('go-to-cfi', (_, x) => this._view.goTo(x))
        this._navbar.connect('go-to-section', (_, x) => this._view.goTo(x))
        this._navbar.connect('go-to-fraction', (_, x) => this._view.goToFraction(x))

        // annotations
        utils.connect(this._bookmark_view, {
            'notify::has-items': view => this._bookmark_stack
                .visible_child_name = view.has_items ? 'main' : 'empty',
            'notify::has-items-in-view': view => {
                const b = view.has_items_in_view
                this._view.showRibbon(b)
                Object.assign(this._bookmark_button, {
                    visible: true,
                    icon_name: b
                        ? 'bookmark-filled-symbolic'
                        : 'bookmark-new-symbolic',
                    tooltip_text: b
                        ? _('Remove bookmark')
                        : _('Add bookmark'),
                })
            },
            'go-to-bookmark': (_, target) => {
                this._view.goTo(target)
                if (this._flap.folded) this._flap.reveal_flap = false
            },
        })
        utils.connect(this._annotation_view, {
            'go-to-annotation': (_, annotation) => {
                this._view.showAnnotation(annotation)
                if (this._flap.folded) this._flap.reveal_flap = false
            },
        })
        this._annotation_search_entry.connect('search-changed', entry =>
            this._annotation_view.filter(entry.text))

        // setup actions
        const actions = utils.addMethods(this, {
            actions: [
                'toggle-sidebar', 'toggle-search', 'show-location',
                'toggle-toc', 'toggle-annotations', 'toggle-bookmarks',
                'preferences', 'show-info', 'bookmark',
                'export-annotations',
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
            '<ctrl>i|<alt>Return': 'viewer.show-info',
            '<ctrl><alt>t': 'viewer.toggle-toc',
            '<ctrl><alt>a': 'viewer.toggle-annotations',
            '<ctrl><alt>d': 'viewer.toggle-bookmarks',
            '<ctrl>d': 'viewer.bookmark',
            '<alt>comma': 'viewer.preferences',
            '<ctrl><shift>g': 'search.prev',
            '<ctrl>g': 'search.next',
            '<ctrl>c': 'selection.copy',
            '<ctrl>f': 'selection.search',
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
            '<alt>Left': 'view.back',
            '<alt>Right': 'view.forward',
            '<ctrl>p': 'view.print',
        }))
        // TODO: disable these when pinch zoomed
        this._view.webView.add_controller(utils.addShortcuts({
            'Up|Page_Up': 'view.prev',
            'Down|Page_Down': 'view.next',
            'Left': 'view.go-left',
            'Right': 'view.go-right',
            '<alt>Left': 'view.back',
            '<alt>Right': 'view.forward',
        }))
    }
    #onError({ id, message, stack }) {
        const desc = id === 'not-found' ? _('File not found')
            : id === 'unsupported-type' ? _('File type not supported')
            : _('An error occurred')
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

        const { textDirection } = reader.view
        utils.setDirection(this._book_info, textDirection)
        for (const x of [
            this._search_view,
            this._toc_view,
            this._annotation_view,
            this._bookmark_view,
        ]) {
            utils.setDirection(x.parent, textDirection)
            x.dir = textDirection
        }

        this._toc_view.load(book.toc)
        this._navbar.setDirection(book.dir)
        this._navbar.loadSections(book.sections)
        this._navbar.loadPageList(book.pageList, reader.pageTotal)
        this._navbar.loadLandmarks(book.landmarks)

        this._view.getCover().then(cover => {
            this.#cover = cover
            if (cover) this._book_cover.set_from_pixbuf(cover)
            else this._book_cover.icon_name = 'image-missing-symbolic'
        })

        book.metadata.identifier ||= makeIdentifier(this.#file)
        const { identifier } = book.metadata
        if (identifier) {
            this.#data = await dataStore.get(identifier, this._view)
            const { annotations, bookmarks } = this.#data
            this._annotation_view.setupModel(annotations)
            this._bookmark_view.setupModel(bookmarks)
            const updateAnnotations = () => this._annotation_stack
                .visible_child_name = annotations.n_items > 0 ? 'main' : 'empty'
            const updateBookmarks = () => {
                this._bookmark_view.update()
                this._bookmark_stack.visible_child_name =
                    bookmarks.n_items > 0 ? 'main' : 'empty'
            }
            utils.connectWith(this, annotations, { 'notify::n-items': updateAnnotations })
            utils.connectWith(this, bookmarks, { 'notify::n-items': updateBookmarks })
            updateAnnotations()
            updateBookmarks()
            this.#data.storage.set('metadata', book.metadata)
            getURIStore().set(identifier, this.#file.get_uri())
        }
        else await this._view.next()
    }
    #onRelocate(payload) {
        const { section, location, tocItem, cfi } = payload
        this._toc_view.setCurrent(tocItem?.id)
        this._search_view.index = section.current
        this._navbar.update(payload)
        this._bookmark_view.update(payload)
        if (this.#data) {
            this.#data.storage.set('progress', [location.current, location.total])
            this.#data.storage.set('lastLocation', cfi)
        }
    }
    #showSelection({ type, value, text, pos: { point, dir } }) {
        if (type === 'annotation') return new Promise(resolve => {
            const annotation = this.#data.annotations.get(value)
            const popover = utils.connect(new AnnotationPopover({ annotation }), {
                'delete-annotation': () => {
                    this.#data.deleteAnnotation(annotation)
                    this.root.toast(utils.connect(new Adw.Toast({
                        title: _('Annotation deleted'),
                        button_label: _('Undo'),
                    }), { 'button-clicked': () =>
                        this.#data.addAnnotation(annotation) }))
                },
                'select-annotation': () => resolve('select'),
                'color-changed': (_, color) => this.highlight_color = color,
            })
            popover.connect('closed', () => resolve())
            this._view.showPopover(popover, point, dir)
        })
        return new Promise(resolve => {
            let resolved
            const popover = new SelectionPopover()
            popover.insert_action_group('selection', utils.addSimpleActions({
                'copy': () => resolve('copy'),
                'highlight': () => {
                    resolved = true
                    const annotation = this.#data.annotations.get(value)
                    this.#data.addAnnotation(annotation ?? {
                        value, text,
                        color: this.highlight_color,
                    }).then(() => resolve('highlight'))
                },
                'search': () => {
                    this._search_entry.text = text
                    this._search_bar.search_mode_enabled = true
                    this._flap.reveal_flap = true
                    this._search_view.doSearch()
                },
                'print': () => resolve('print'),
            }))
            // it seems `closed` is emitted before the actions are run
            // so it needs the timeout
            popover.connect('closed', () => setTimeout(() =>
                resolved ? null : resolve(), 0))
            this._view.showPopover(popover, point, dir)
        })
    }
    #onSelection({ action, text, html }) {
        if (action === 'copy') utils.getClipboard()
            .set_content(Gdk.ContentProvider.new_union([
                Gdk.ContentProvider.new_for_bytes('text/html',
                    new TextEncoder().encode(html)),
                Gdk.ContentProvider.new_for_value(text)]))
    }
    #createOverlay({ index }) {
        if (!this.#data) return
        const list = this.#data.annotations.getForIndex(index)
        if (list) for (const [, annotation] of utils.gliter(list))
            this._view.addAnnotation(annotation)
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
                const ext = /\/([^+]*)/.exec(mimetype)?.[1]
                new Gtk.FileDialog({ initial_name: win.title + (ext ? `.${ext}` : '') })
                    .save(win, null, (self, res) => {
                        try {
                            const file = self.save_finish(res)
                            file.replace_contents(bytes, null, false,
                                Gio.FileCreateFlags.REPLACE_DESTINATION, null)
                        } catch (e) {
                            if (e instanceof Gtk.DialogError) console.debug(e)
                            else console.error(e)
                        }
                    })
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
    #toggleSidebarContent(name) {
        this._search_bar.search_mode_enabled = false
        if (this._flap.reveal_flap
        && this._contents_stack.visible_child_name === name)
            this._flap.reveal_flap = false
        else {
            this._contents_stack.visible_child_name = name
            this._flap.reveal_flap = true
        }
    }
    toggleToc() { this.#toggleSidebarContent('toc') }
    toggleAnnotations() { this.#toggleSidebarContent('annotations') }
    toggleBookmarks() { this.#toggleSidebarContent('bookmarks') }
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
        makeBookInfoWindow(this.root, this.#book.metadata, this.#cover, true)
    }
    preferences() {
        const win = new ViewPreferencesWindow({
            view_settings: this._view.viewSettings,
            font_settings: this._view.fontSettings,
            modal: true,
            transient_for: this.root,
        })
        win.present()
    }
    bookmark() {
        this._bookmark_view.toggle()
    }
    exportAnnotations() {
        exportAnnotations(this.get_root(), this.#data.storage.export())
    }
    vfunc_unroot() {
        this._view.viewSettings.unbindSettings()
        this._view.fontSettings.unbindSettings()
        utils.disconnectWith(this, this.#data.annotations)
        utils.disconnectWith(this, this.#data.bookmarks)
        dataStore.delete(this._view)

        // it seems that it's necessary to explicitly destroy web view
        this._view.webView.unparent()
        this._view.webView.run_dispose()
    }
})
