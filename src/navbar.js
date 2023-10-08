import Gtk from 'gi://Gtk'
import GObject from 'gi://GObject'
import Pango from 'gi://Pango'
import * as utils from './utils.js'
import * as format from './format.js'
import './tts.js'

const Landmark = utils.makeDataClass('FoliateLandmark', {
    'label': 'string',
    'href': 'string',
})

GObject.registerClass({
    GTypeName: 'FoliateLandmarkView',
    Signals: {
        'go-to-href': {
            param_types: [GObject.TYPE_STRING],
        },
    },
}, class extends Gtk.ListView {
    constructor(params) {
        super(params)
        this.model = new Gtk.NoSelection()
        this.connect('activate', (_, pos) => {
            const { href } = this.model.model.get_item(pos) ?? {}
            if (href) this.emit('go-to-href', href)
        })
        this.factory = utils.connect(new Gtk.SignalListItemFactory(), {
            'setup': (_, listItem) => listItem.child = new Gtk.Label({
                xalign: 0,
                ellipsize: Pango.EllipsizeMode.END,
            }),
            'bind': (_, { child, item }) => {
                const label = item.label ?? ''
                child.label = label
                child.tooltip_text = label
            },
        })
    }
    load(landmarks) {
        this.model.model = landmarks?.length
            ? utils.list(landmarks.map(({ label, href }) =>
                ({ label, href })), Landmark)
            : null
    }
})

GObject.registerClass({
    GTypeName: 'FoliatePageListDropDown',
    Signals: {
        'go-to-href': { param_types: [GObject.TYPE_STRING] },
    },
}, class extends Gtk.DropDown {
    #hrefs
    #indices
    #shouldGo = true
    constructor(params) {
        super(params)
        this.expression = Gtk.PropertyExpression.new(Gtk.StringObject, null, 'string')
        this.enable_search = true
        this.connect('notify::selected', () => {
            if (this.#shouldGo) {
                const href = this.#hrefs.get(this.selected)
                if (href) this.emit('go-to-href', href)
            }
        })
    }
    load(pageList) {
        pageList ??= []
        this.#hrefs = new Map()
        this.#indices = new Map()
        const list = new Gtk.StringList()
        this.model = list
        for (const [i, { id, label, href }] of pageList.entries()) {
            list.append(label ?? '')
            this.#hrefs.set(i, href)
            this.#indices.set(id, i)
        }
    }
    update(item) {
        this.#shouldGo = false
        this.selected = this.#indices?.get?.(item?.id) ?? -1
        this.#shouldGo = true
    }
})

GObject.registerClass({
    GTypeName: 'FoliateProgressScale',
    Signals: {
        'go-to-fraction': { param_types: [GObject.TYPE_DOUBLE] },
    },
}, class extends Gtk.Scale {
    #shouldUpdate = true
    #shouldGo = true
    constructor(params) {
        super(params)
        this.connect('value-changed', scale => {
            if (this.#shouldGo) {
                this.#shouldUpdate = false
                this.emit('go-to-fraction', scale.get_value())
            }
        })
    }
    loadSections(sections) {
        this.clear_marks()
        const sizes = sections.filter(s => s.linear !== 'no').map(s => s.size)
        if (sizes.length > 100) return
        const total = sizes.reduce((a, b) => a + b, 0)
        let sum = 0
        for (const size of sizes.slice(0, -1)) {
            sum += size
            // add epsilon so it will snap to section start
            const fraction = sum / total + Number.EPSILON
            this.add_mark(fraction, Gtk.PositionType.TOP, null)
        }
    }
    update(fraction) {
        if (this.#shouldUpdate) {
            this.#shouldGo = false
            this.set_value(fraction)
            this.#shouldGo = true
        } else this.#shouldUpdate = true
    }
})

GObject.registerClass({
    GTypeName: 'FoliateNavBar',
    Template: pkg.moduleuri('ui/navbar.ui'),
    Children: ['tts-box', 'media-overlay-box'],
    InternalChildren: [
        'prev-image', 'next-image', 'back-image', 'forward-image',
        'progress-box', 'progress-scale', 'location-button',
        'location-popover', 'tts-popover', 'tts-stack',
        'time-book', 'time-section',
        'page-label', 'page-box', 'page-drop-down', 'page-total',
        'loc-entry', 'loc-total', 'cfi-entry',
        'section-entry', 'section-total', 'section-buttons',
        'location-popover-stack', 'landmark-view', 'landmark-toggle',
    ],
    Signals: {
        'go-to-cfi': { param_types: [GObject.TYPE_STRING] },
        'go-to-section': { param_types: [GObject.TYPE_UINT] },
        'go-to-fraction': { param_types: [GObject.TYPE_DOUBLE] },
        'opened': {},
        'closed': {},
    },
}, class extends Gtk.Box {
    #locationTotal
    constructor(params) {
        super(params)
        const closed = () => this.emit('closed')
        this._location_popover.connect('closed', () => {
            this._landmark_toggle.active = false
            closed()
        })
        this._tts_popover.connect('closed', closed)
        this._loc_entry.connect('activate', entry => {
            this.emit('go-to-fraction', parseInt(entry.text) / this.#locationTotal)
            this._location_popover.popdown()
        })
        this._cfi_entry.connect('activate',
            entry => this.emit('go-to-cfi', entry.text))
        this._section_entry.connect('activate',
            entry => this.emit('go-to-section', parseInt(entry.text) - 1))
        this._progress_scale.connect('go-to-fraction',
            (_, value) => this.emit('go-to-fraction', value))
        this._page_drop_down.connect('go-to-href',
            (_, href) => this.emit('go-to-cfi', href))
        this._landmark_view.connect('go-to-href',
            (_, href) => this.emit('go-to-cfi', href))
        this._landmark_toggle.connect('toggled', toggle =>
            this._location_popover_stack.visible_child_name =
                toggle.active ? 'landmarks' : 'main')

        this.connect('go-to-cfi', () => this._location_popover.popdown())
        this.connect('go-to-section', () => this._location_popover.popdown())

        const actions = utils.addMethods(this, {
            actions: ['copy-cfi', 'paste-cfi', 'toggle-landmarks'],
        })
        this.insert_action_group('navbar', actions)
    }
    get shouldStayVisible() {
        return this._location_popover.visible || this._tts_popover.visible
    }
    update(progress) {
        const { fraction, section, location, time, cfi, pageItem } = progress
        this._cfi_entry.text = cfi ?? ''
        this._progress_scale.update(fraction)
        this._location_button.label = format.percent(fraction)
        this._time_book.label = format.duration(time.total)
        this._time_section.label = format.duration(time.section)
        this._loc_entry.text = (location.current + 1).toString()
        this._loc_total.label = format.total(location.total)
        this.#locationTotal = location.total
        this._section_entry.text = (section.current + 1).toString()
        this._section_total.label = format.total(section.total)
        this._page_drop_down.update(pageItem)
    }
    setDirection(dir) {
        const value = utils.getGtkDir(dir)
        for (const widget of [this, this._progress_box, this._progress_scale,
            this._prev_image, this._next_image, this._back_image, this._forward_image])
            widget.set_direction(value)
        utils.setDirection(this._section_buttons, value)
    }
    loadSections(sections) {
        this._progress_scale.loadSections(sections)
    }
    loadPageList(pageList, total) {
        if (!pageList?.length) {
            this._page_box.hide()
            this._page_label.hide()
            return
        }
        this._page_box.show()
        this._page_label.show()
        this._page_drop_down.load(pageList)
        this._page_total.label = total ? format.total(total) : ''
    }
    loadLandmarks(landmarks) {
        this._landmark_toggle.sensitive = landmarks?.length ? true : false
        this._landmark_view.load(landmarks)
    }
    copyCfi() {
        utils.setClipboardText(this._cfi_entry.text, this.root)
        this._location_popover.popdown()
    }
    pasteCfi() {
        utils.getClipboardText()
            .then(text => this.emit('go-to-cfi', text))
            .catch(e => console.warn(e))
    }
    showLocation() {
        this.emit('opened')
        this._location_button.popup()
    }
    setTTSType(name) {
        this._tts_stack.visible_child_name = name
        this._tts_popover.default_widget = this._tts_stack.visible_child.defaultWidget
    }
})
