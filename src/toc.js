import Gtk from 'gi://Gtk'
import GObject from 'gi://GObject'
import Pango from 'gi://Pango'
import * as utils from './utils.js'

const TOCItem = utils.makeDataClass('FoliateTOCItem', {
    'id': 'uint',
    'label': 'string',
    'href': 'string',
    'subitems': 'object',
})

GObject.registerClass({
    GTypeName: 'FoliateTOCView',
    Properties: utils.makeParams({
        'dir': 'string',
    }),
    Signals: {
        'go-to-href': {
            param_types: [GObject.TYPE_STRING],
        },
    },
}, class extends Gtk.ListView {
    #shouldGoToTocItem = true
    #map = new Map()
    #parentMap = new Map()
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
            'setup': (_, listItem) => {
                listItem.child = new Gtk.TreeExpander()
                listItem.child.child = new Gtk.Label({
                    xalign: 0,
                    ellipsize: Pango.EllipsizeMode.END,
                })
            },
            'bind': (_, listItem) => {
                const widget = listItem.child.child
                listItem.child.list_row = listItem.item
                const { label, href } = listItem.item.item
                Object.assign(widget, { label, tooltip_text: label })
                const ctx = widget.get_style_context()
                if (href) ctx.remove_class('dim-label')
                else ctx.add_class('dim-label')
                utils.setDirection(listItem.child, this.dir)
            },
        })
    }
    load(toc) {
        toc ??= []
        this.model.model = utils.tree(toc, TOCItem, false)
        // save parent for each item in a map
        const f = item => {
            this.#map.set(item.id, item)
            if (!item.subitems?.length) return
            for (const subitem of item.subitems) {
                this.#parentMap.set(subitem, item)
                f(subitem)
            }
        }
        for (const item of toc) f(item)
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
        model.set_selected(index)
        utils.scrollListView(this, index)
        this.#shouldGoToTocItem = true
    }
})
