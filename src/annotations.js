import Gtk from 'gi://Gtk'
import Gio from 'gi://Gio'
import GObject from 'gi://GObject'
import { gettext as _ } from 'gettext'
import * as utils from './utils.js'

const Annotation = utils.makeDataClass('FoliateAnnotation', {
    'value': 'string',
    'color': 'string',
    'text': 'string',
    'note': 'string',
})

const AnnotationHeading = utils.makeDataClass('FoliateAnnotationHeading', {
    'label': 'string',
    'index': 'uint',
    'subitems': 'object',
})

const AnnotationRow = GObject.registerClass({
    GTypeName: 'FoliateAnnotationRow',
    Template: pkg.moduleuri('ui/annotation-row.ui'),
    InternalChildren: ['heading', 'box', 'color', 'text', 'note'],
}, class extends Gtk.Box {
    update(obj) {
        if (obj instanceof Annotation) {
            const { text, note, color } = obj
            this._text.label = text.replace(/\n/g, ' ')
            this._note.label = note.replace(/\n/g, ' ')
            this._color.update(color)
            this._heading.hide()
            this._box.show()
            if (note) this._note.show()
            else this._note.hide()
            this.margin_top = 6
            this.margin_bottom = 6
        } else {
            this._heading.label = obj.label
            this._heading.show()
            this._box.hide()
            this._note.hide()
            this.margin_top = 3
            this.margin_bottom = 3
        }
    }
})

/*
const BookData = GObject.registerClass({
    GTypeName: 'FoliateBookData',
    Signals: {
        'externally-modified': {},
    },
}, class extends GObject.Object {
    #storage
    #annotations = new Gio.ListStore()
    constructor(identifier) {
        super()
        this.#storage = new utils.JSONStorage(pkg.datadir, identifier)
        this.#storage.connect('externally-modified', () => {
            this.#loadData()
            this.emit('externally-modified')
        })
        this.#loadData()
    }
    #loadData() {
        this.#annotations.remove_all()
        this.#storage.get('annotations', [])
            .map(annotation => ({ annotation, parsed: CFI.parse(annotation.value) }))
            .sort((a, b) => CFI.compare(a.parsed, b.parsed))
    }
})
*/

GObject.registerClass({
    GTypeName: 'FoliateAnnotationView',
    Properties: utils.makeParams({
        'has-items': 'boolean',
    }),
    Signals: {
        'update-annotation': { param_types: [Annotation.$gtype] },
        'go-to-annotation': { param_types: [Annotation.$gtype] },
    },
}, class extends Gtk.ListView {
    #tree = utils.tree([])
    #filter = new Gtk.FilterListModel({ model: this.#tree })
    #map = new Map()
    constructor(params) {
        super(params)
        this.#tree.model.connect('notify::n-items', model =>
            this.set_property('has-items', model.get_n_items() > 0))
        this.model = new Gtk.NoSelection({ model: this.#filter })
        this.connect('activate', (_, pos) => {
            const annotation = this.model.model.get_item(pos).item ?? {}
            if (annotation) this.emit('go-to-annotation', annotation)
        })
        const handlers = new WeakMap()
        this.factory = utils.connect(new Gtk.SignalListItemFactory(), {
            'setup': (_, listItem) => {
                listItem.child = new Gtk.TreeExpander({ indent_for_icon: false })
                listItem.child.child = new AnnotationRow()
            },
            'bind': (_, listItem) => {
                const expander = listItem.child
                expander.list_row = listItem.item

                const annotation = listItem.item.item
                const widget = expander.child
                widget.update(annotation)
                handlers.set(listItem, annotation.connectAll(() =>
                    widget.update(annotation)))

                const ctx = expander.get_style_context()
                if (annotation.subitems) ctx.add_class('dim-label')
                else ctx.remove_class('dim-label')
            },
            'unbind': (_, listItem) =>
                utils.disconnect(listItem.item.item, handlers.get(listItem)),
        })
        const tree = utils.tree([], Annotation)
        tree.model.append(new Annotation())
    }
    add({ annotation, label, index, position }) {
        const obj = new Annotation(annotation)
        obj.connectAll(() => this.emit('update-annotation', obj))
        this.#map.set(annotation.value, obj)
        const { model } = this.#tree
        for (const [i, item] of utils.gliter(model)) {
            if (item.index === index) {
                item.subitems.insert(position, obj)
                return
            }
            if (item.index > index) {
                const subitems = new Gio.ListStore()
                subitems.append(obj)
                model.insert(i, new AnnotationHeading({ label, index, subitems }))
                return
            }
        }
        const subitems = new Gio.ListStore()
        subitems.append(obj)
        model.append(new AnnotationHeading({ label, index, subitems }))
    }
    delete({ index, position }) {
        const { model } = this.#tree
        for (const [i, item] of utils.gliter(model))
            if (item.index === index) {
                item.subitems.remove(position)
                if (!item.subitems.get_n_items()) model.remove(i)
                return
            }
    }
    clear() {
        this.#tree.model.remove_all()
    }
    get(value) {
        return this.#map.get(value)
    }
    filter(query) {
        query = query?.trim()?.toLowerCase()
        const filter = new Gtk.CustomFilter()
        filter.set_filter_func(query ? row => {
            const { item } = row
            const { text, color, note } = item
            return [text, color, note].some(x => x?.toLowerCase()?.includes(query))
        } : null)
        this.#filter.filter = filter
    }
})

const AnnotationColor = utils.makeDataClass('FoliateAnnotationColor', {
    'label': 'string',
    'value': 'string',
    'type': 'string',
})

const AnnotationColorImage = GObject.registerClass({
    GTypeName: 'FoliateAnnotationColorImage',
}, class extends Gtk.Stack {
    #icon = new Gtk.Image()
    #frame = new Gtk.Frame({
        width_request: 16,
        height_request: 16,
        valign: Gtk.Align.CENTER,
    })
    constructor(params) {
        super(params)
        this.add_child(this.#icon)
        this.add_child(this.#frame)
    }
    update(color) {
        if (color === 'underline') {
            this.#icon.icon_name = 'format-text-underline-symbolic'
            this.visible_child = this.#icon
        } else if (color) {
            utils.addStyle(this.#frame, `frame {
                background: ${utils.RGBA(color).to_string()};
            }`)
            this.visible_child = this.#frame
        } else {
            this.#icon.icon_name = 'color-select-symbolic'
            this.visible_child = this.#icon
        }
    }
})

const AnnotationColorRow = GObject.registerClass({
    GTypeName: 'FoliateAnnotationColorRow',
    Properties: utils.makeParams({
        'dropdown': 'object',
    }),
}, class extends Gtk.Box {
    #color
    #image = new AnnotationColorImage()
    #label = new Gtk.Label()
    #checkmark = new Gtk.Image({
        visible: false,
        icon_name: 'object-select-symbolic',
    })
    constructor(params) {
        super(params)
        this.spacing = 6
        this.append(this.#image)
        this.append(this.#label)
        this.append(this.#checkmark)
        if (this.dropdown)
            this.dropdown.connect('notify::selected-item', dropdown =>
                this.#checkmark.visible = dropdown.selected_item === this.#color)
    }
    update(color) {
        this.#color = color
        this.#image.update(color.value)
        this.#label.label = color.label
        this.#checkmark.visible = this.dropdown?.selected_item === color
    }
})

GObject.registerClass({
    GTypeName: 'FoliateAnnotationColorDropDown',
    Signals: {
        'color-changed': { param_types: [GObject.TYPE_STRING] },
    },
}, class extends Gtk.DropDown {
    #prevSelected
    constructor(params) {
        super(params)
        this.model = utils.list([
            { label: _('Underline'), value: 'underline' },
            { label: _('Yellow'), value: 'yellow' },
            { label: _('Orange'), value: 'orange' },
            { label: _('Red'), value: 'red' },
            { label: _('Magenta'), value: 'magenta' },
            { label: _('Aqua'), value: 'aqua' },
            { label: _('Lime'), value: 'lime' },
            { label: _('Custom Color…'), type: 'choose' },
        ], AnnotationColor)

        this.factory = utils.connect(new Gtk.SignalListItemFactory(), {
            'setup': (_, listItem) => listItem.child = new AnnotationColorRow(),
            'bind': (_, { child, item }) => child.update(item),
        })

        this.list_factory = utils.connect(new Gtk.SignalListItemFactory(), {
            'setup': (_, listItem) =>
                listItem.child = new AnnotationColorRow({ dropdown: this }),
            'bind': (_, { child, item }) => child.update(item),
        })

        this.connect('notify::selected-item', () => {
            const selected = this.selected
            const item = this.selected_item
            if (item.type === 'choose') {
                const chooser = new Gtk.ColorChooserDialog({
                    modal: true,
                    transient_for: this.root,
                })
                chooser.show()
                chooser.connect('response', (_, res) => {
                    if (res === Gtk.ResponseType.OK) {
                        const color = chooser.get_rgba().to_string()
                        this.selectColor(color)
                        this.emit('color-changed', color)
                    } else this.selected = this.#prevSelected
                    chooser.close()
                })
            } else {
                this.emit('color-changed', item.value)
                this.#prevSelected = selected
            }
        })
    }
    selectColor(color) {
        const { model } = this
        for (const [i, item] of utils.gliter(model)) {
            if (item.value === color) {
                this.selected = i
                return
            }
            // if there's already an item for custom color, use it
            if (item.type === 'custom') {
                item.value = color
                this.selected = i
                return
            }
        }
        // create item for custom color
        const i = model.get_n_items() - 1
        model.insert(i, new AnnotationColor({
            label: _('Custum'),
            value: color,
            type: 'custom',
        }))
        this.selected = i
    }
})

export const AnnotationPopover = GObject.registerClass({
    GTypeName: 'FoliateAnnotationPopover',
    Template: pkg.moduleuri('ui/annotation-popover.ui'),
    Properties: utils.makeParams({
        'annotation': 'object',
    }),
    Signals: {
        'delete-annotation': {},
    },
    InternalChildren: ['stack', 'button', 'text-view', 'drop-down'],
}, class extends Gtk.Popover {
    #isAddingNote
    constructor(params) {
        super(params)
        this.insert_action_group('annotation', utils.addMethods(this, {
            actions: ['add-note', 'delete'],
        }))

        this._drop_down.connect('color-changed', (_, color) =>
            this.annotation.set_property('color', color))
        this._text_view.buffer.connect('changed', buffer => {
            this.#updateStack()
            this.annotation.set_property('note', buffer.text)
        })

        this._drop_down.selectColor(this.annotation.color)
        this._text_view.buffer.text = this.annotation.note
        this.#updateStack()
    }
    #updateStack() {
        const { buffer } = this._text_view
        this._stack.visible_child = this.#isAddingNote || buffer.text
            ? this._text_view.parent : this._button
        if (buffer.text) this.#isAddingNote = true
    }
    addNote() {
        this.#isAddingNote = true
        this._stack.visible_child = this._text_view.parent
        this._text_view.grab_focus()
    }
    delete() {
        this.emit('delete-annotation')
        this.popdown()
    }
})
