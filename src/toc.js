import Gtk from 'gi://Gtk'
import GObject from 'gi://GObject'
import Gio from 'gi://Gio'
import Gdk from 'gi://Gdk'
import Pango from 'gi://Pango'
import Adw from 'gi://Adw'
import { gettext as _ } from 'gettext'
import * as utils from './utils.js'

const TOCItem = utils.makeDataClass('FoliateTOCItem', {
    'id': 'uint',
    'label': 'string',
    'href': 'string',
    'pages': 'uint',
    'completed': 'boolean',
    'subitems': 'object',
})

const getChildren = item => {
    if (!item?.subitems) return []
    if (item.subitems instanceof Gio.ListStore) {
        const count = item.subitems.get_n_items()
        const res = []
        for (let i = 0; i < count; i++) res.push(item.subitems.get_item(i))
        return res
    }
    if (Array.isArray(item.subitems)) return item.subitems
    return []
}

GObject.registerClass({
    GTypeName: 'FoliateTOCView',
    Properties: utils.makeParams({
        'dir': 'string',
    }),
    Signals: {
        'go-to-href': {
            param_types: [GObject.TYPE_STRING],
        },
        'edit-chapter': {
            param_types: [GObject.TYPE_STRING, GObject.TYPE_STRING],
        },
        'toggle-chapter-completed': {
            param_types: [GObject.TYPE_UINT, GObject.TYPE_BOOLEAN],
        },
    },
}, class extends Gtk.ListView {
    #shouldGoToTocItem = true
    #map = new Map()
    #parentMap = new Map()
    #customLabels = new Map()
    #activePopover = null
    constructor(params) {
        super(params)
        this.model = new Gtk.SingleSelection({ autoselect: false, can_unselect: true })
        this.model.connect('selection-changed', sel => {
            if (!this.#shouldGoToTocItem) return
            const href = sel.selected_item?.item?.href
            if (href) this.emit('go-to-href', href)
        })
        this.connect('activate', (_, pos) => {
            const { href } = this.model.model.get_item(pos).item ?? {}
            if (href) this.emit('go-to-href', href)
        })
        
        this.factory = utils.connect(new Gtk.SignalListItemFactory(), {
            'setup': (factory, listItem) => {
                const box = new Gtk.Box({
                    orientation: Gtk.Orientation.HORIZONTAL,
                    spacing: 8,
                    hexpand: true,
                })
                const label = new Gtk.Label({
                    xalign: 0,
                    hexpand: true,
                    ellipsize: Pango.EllipsizeMode.END,
                })

                box.append(label)

                listItem.child = new Gtk.TreeExpander()
                listItem.child.child = box

                const clickController = new Gtk.GestureClick({
                    button: Gdk.BUTTON_SECONDARY,
                })
                clickController.connect('pressed', (gesture, n_press, x, y) => {
                    if (n_press !== 1) return
                    const item = listItem.item?.item
                    if (!item) return
                    this.#showContextMenu(item, listItem.child, x, y)
                })
                listItem.child.add_controller(clickController)
            },
            'bind': (factory, listItem) => {
                const box = listItem.child.child
                const label = box.get_first_child()

                listItem.child.list_row = listItem.item
                const item = listItem.item?.item
                if (!item) return

                const updateRow = () => {
                    const { label: rawLabel, href, completed } = item

                    const customLabel = this.#customLabels.get(rawLabel)
                    const displayLabel = customLabel || rawLabel || ''
                    Object.assign(label, { label: displayLabel, tooltip_text: displayLabel })

                    if (completed || !href) {
                        label.add_css_class('dim-label')
                    } else {
                        label.remove_css_class('dim-label')
                    }
                }

                if (listItem._signalIds && listItem._boundItem) {
                    for (const id of listItem._signalIds) {
                        listItem._boundItem.disconnect(id)
                    }
                }

                const idCompleted = item.connect('notify::completed', updateRow)
                const idLabel = item.connect('notify::label', updateRow)

                listItem._boundItem = item
                listItem._signalIds = [idCompleted, idLabel]

                updateRow()
                utils.setDirection(listItem.child, this.dir)
            },
            'unbind': (factory, listItem) => {
                if (this.#activePopover && this.#activePopover.get_parent() === listItem.child) {
                    this.#activePopover.popdown()
                    this.#activePopover.unparent()
                    this.#activePopover = null
                }
                if (listItem._signalIds && listItem._boundItem) {
                    for (const id of listItem._signalIds) {
                        listItem._boundItem.disconnect(id)
                    }
                    listItem._signalIds = null
                    listItem._boundItem = null
                }
                listItem.child.list_row = null
            },
            'teardown': (factory, listItem) => {
                if (this.#activePopover && this.#activePopover.get_parent() === listItem.child) {
                    this.#activePopover.popdown()
                    this.#activePopover.unparent()
                    this.#activePopover = null
                }
                if (listItem._signalIds && listItem._boundItem) {
                    for (const id of listItem._signalIds) {
                        listItem._boundItem.disconnect(id)
                    }
                    listItem._signalIds = null
                    listItem._boundItem = null
                }
            },
        })
    }
    
    #showContextMenu(item, widget, x, y) {
        if (this.#activePopover) {
            this.#activePopover.popdown()
            this.#activePopover.unparent()
            this.#activePopover = null
        }
        
        const popover = new Gtk.Popover()
        const box = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 6,
            margin_start: 12,
            margin_end: 12,
            margin_top: 12,
            margin_bottom: 12,
        })
        
        const toggleBtn = new Gtk.Button({
            label: item.completed ? _('Mark as Incomplete') : _('Mark as Completed'),
        })
        toggleBtn.connect('clicked', () => {
            this.toggleChapter(item.id)
            popover.popdown()
        })
        box.append(toggleBtn)
        
        const editBtn = new Gtk.Button({
            label: _('Edit Chapter Name'),
        })
        editBtn.connect('clicked', () => {
            const currentLabel = this.#customLabels.get(item.label) || item.label
            this.emit('edit-chapter', item.label, currentLabel)
            popover.popdown()
        })
        box.append(editBtn)
        
        popover.set_child(box)
        
        const rect = new Gdk.Rectangle({ x: Math.round(x), y: Math.round(y), width: 1, height: 1 })
        popover.set_parent(widget)
        popover.set_pointing_to(rect)
        popover.set_has_arrow(true)

        this.#activePopover = popover
        popover.connect('closed', () => {
            if (this.#activePopover === popover) {
                this.#activePopover = null
            }
            popover.unparent()
        })

        popover.popup()
    }
    load(toc, completedChapters = {}) {
        const existingLabels = this.getCustomLabels()
        toc ??= []
        
        // Populate completion status into raw TOC items
        const applyCompletion = items => {
            for (const it of items) {
                const key = this.getChapterKey(it)
                it.completed = Boolean(completedChapters[key]?.completed)
                it.pages = it.pages || 0
                if (it.subitems?.length) {
                    applyCompletion(it.subitems)
                    const allDone = it.subitems.every(s => s.completed)
                    if (allDone) it.completed = true
                }
            }
        }
        applyCompletion(toc)

        this.model.model = utils.tree(toc, TOCItem, false)
        this.setCustomLabels(existingLabels)

        this.#map.clear()
        this.#parentMap.clear()

        const f = item => {
            this.#map.set(item.id, item)
            const children = getChildren(item)
            if (!children.length) return
            for (const subitem of children) {
                this.#parentMap.set(subitem, item)
                f(subitem)
            }
        }
        for (let i = 0; i < this.model.model.model.get_n_items(); i++) {
            f(this.model.model.model.get_item(i))
        }

        const updateAncestors = item => {
            const children = getChildren(item)
            if (children.length > 0) {
                for (const child of children) updateAncestors(child)
                item.completed = children.every(c => c.completed)
            }
        }
        for (let i = 0; i < this.model.model.model.get_n_items(); i++) {
            updateAncestors(this.model.model.model.get_item(i))
        }
    }
    setCompletedChapters(completedChapters = {}) {
        for (const item of this.#map.values()) {
            const key = this.getChapterKey(item)
            const children = getChildren(item)
            if (children.length === 0) {
                item.completed = Boolean(completedChapters[key]?.completed)
            }
        }
        const updateAncestors = item => {
            const children = getChildren(item)
            if (children.length > 0) {
                for (const child of children) updateAncestors(child)
                item.completed = children.every(c => c.completed)
            }
        }
        for (let i = 0; i < this.model.model.model.get_n_items(); i++) {
            updateAncestors(this.model.model.model.get_item(i))
        }
    }
    getChapterKey(item) {
        return item?.href || `item_${item?.id}_${item?.label}`
    }
    getAllItems() {
        return Array.from(this.#map.values())
    }
    getLeafItems() {
        const results = []
        for (const item of this.#map.values()) {
            const children = getChildren(item)
            if (children.length === 0) {
                results.push(item)
            }
        }
        return results
    }
    toggleChapter(id, completed = null) {
        const item = this.#map.get(id)
        if (!item) return

        if (completed === null) {
            completed = !item.completed
        }
        item.completed = Boolean(completed)

        const setDescendants = it => {
            const children = getChildren(it)
            for (const child of children) {
                child.completed = item.completed
                setDescendants(child)
            }
        }
        setDescendants(item)

        const updateAncestors = it => {
            const parent = this.#parentMap.get(it)
            if (!parent) return
            const siblings = getChildren(parent)
            const allCompleted = siblings.length > 0 && siblings.every(s => s.completed)
            parent.completed = allCompleted
            updateAncestors(parent)
        }
        updateAncestors(item)

        this.emit('toggle-chapter-completed', item.id, item.completed)
    }
    getParents(id) {
        const results = []
        let item = this.#map.get(id)
        while (item) {
            results.push(item.id)
            item = this.#parentMap.get(item)
        }
        return results.reverse()
    }
    setCurrent(id) {
        if (id == null) {
            this.model.unselect_item(this.model.selected)
            return
        }
        const { model } = this
        let index
        let iStart = 0
        // child rows are added to the tree dynamically
        // so have to expand every ancestors from the top
        for (const parent of this.getParents(id)) {
            const length = model.get_n_items()
            for (let i = iStart; i < length; i++) {
                const row = model.get_item(i)
                if (row.get_item().id === parent) {
                    row.expanded = true
                    index = i
                    // start next search from i + 1
                    // as children must come after the parent
                    iStart = i + 1
                    break
                }
            }
        }
        this.#shouldGoToTocItem = false
        this.scroll_to(index, Gtk.ListScrollFlags.SELECT, null)
        this.#shouldGoToTocItem = true
    }
    setCustomLabel(originalLabel, newLabel) {
        if (newLabel && newLabel.trim()) {
            this.#customLabels.set(originalLabel, newLabel.trim())
        } else {
            this.#customLabels.delete(originalLabel)
        }
        for (const item of this.#map.values()) {
            if (item.label === originalLabel) {
                item.notify('label')
            }
        }
    }
    getCustomLabels() {
        return Object.fromEntries(this.#customLabels)
    }
    setCustomLabels(labels) {
        this.#customLabels = new Map(Object.entries(labels))
        for (const item of this.#map.values()) {
            item.notify('label')
        }
    }
})
