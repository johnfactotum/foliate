import Gtk from 'gi://Gtk'
import GObject from 'gi://GObject'
import GLib from 'gi://GLib'
import Pango from 'gi://Pango'
import * as utils from './utils.js'

const SearchSettings = utils.makeDataClass('FoliateSearchSettings', {
    'scope': 'string',
    'match-case': 'boolean',
    'match-diacritics': 'boolean',
    'match-whole-words': 'boolean',
})

const SearchResult = utils.makeDataClass('FoliateSearchResult', {
    'label': 'string',
    'cfi': 'string',
    'subitems': 'object',
})

const formatExcerpt = ({ pre, match, post }) => {
    const [a, b, c] = [pre, match, post].map(x => GLib.markup_escape_text(x, -1))
    return `${a}<b>${b}</b>${c}`
}

GObject.registerClass({
    GTypeName: 'FoliateSearchView',
    Properties: utils.makeParams({
        'entry': 'object',
        'settings': 'object',
        'dir': 'string',
    }),
    Signals: {
        'show-results': {},
        'no-results': {},
        'clear-results': {},
        'show-cfi': {
            param_types: [GObject.TYPE_STRING],
        },
    },
}, class extends Gtk.ListView {
    generator = null
    getGenerator
    doSearch = () => this.search().catch(e => console.error(e))
    constructor(params) {
        super(params)
        this.settings = new SearchSettings({ scope: 'book' })
        this.settings.connectAll(this.doSearch)
        this.model = new Gtk.SingleSelection({ autoselect: false })
        this.actionGroup = utils.addSimpleActions({
            'prev': () => this.cycle(-1),
            'next': () => this.cycle(1),
        })
        utils.addPropertyActions(this.settings, this.settings.keys, this.actionGroup)
        this.model.connect('selection-changed', sel => {
            this.scroll_to(sel.selected, Gtk.ListScrollFlags.NONE, null)
            const { cfi } = sel.selected_item?.item ?? {}
            if (cfi) this.emit('show-cfi', cfi)
        })
        this.connect('activate', (_, pos) => {
            const { cfi } = this.model.model.get_item(pos).item ?? {}
            if (cfi) this.emit('show-cfi', cfi)
        })
        this.factory = utils.connect(new Gtk.SignalListItemFactory(), {
            'setup': (_, listItem) => {
                listItem.child = new Gtk.TreeExpander({ indent_for_icon: false })
                listItem.child.child = new Gtk.Label({
                    xalign: 0,
                    margin_top: 6,
                    margin_bottom: 6,
                    wrap_mode: Pango.WrapMode.WORD_CHAR,
                })
            },
            'bind': (_, listItem) => {
                const widget = listItem.child.child
                listItem.child.list_row = listItem.item
                const { label, subitems } = listItem.item.item
                Object.assign(widget, {
                    label,
                    ellipsize: subitems ? Pango.EllipsizeMode.END : Pango.EllipsizeMode.NONE,
                    wrap: !subitems,
                    use_markup: !subitems,
                })
                const ctx = listItem.child.get_style_context()
                if (subitems) {
                    ctx.add_class('caption')
                    ctx.add_class('dim-label')
                } else {
                    ctx.remove_class('caption')
                    ctx.remove_class('dim-label')
                }
                utils.setDirection(listItem.child, this.dir)
            },
        })
    }
    async reset() {
        await this.generator?.return()
        this.generator = null
        this.model.model = null
        this.entry.progress_fraction = null
        this.emit('clear-results')
    }
    async search() {
        const query = this.entry.text.trim()
        if (!query) return
        await this.reset()
        this.model.model = utils.tree([])
        this.emit('show-results')

        const opts = this.settings.toCamel()
        const index = opts.scope === 'section' ? this.index : null
        this.generator = await this.getGenerator({ ...opts, query, index })

        for await (const result of this.generator) {
            if (result === 'done') {
                this.entry.progress_fraction = null
                if (!this.model.model.get_n_items()) this.emit('no-results')
            }
            else if ('progress' in result)
                this.entry.progress_fraction = result.progress
            else {
                const { label, cfi, excerpt, subitems } = result
                const { model } = this.model
                if (!model) return
                model.model.append(subitems ? new SearchResult({
                    label: label ?? '',
                    cfi: cfi ?? '',
                    subitems: utils.list(subitems.map(item => ({
                        label: formatExcerpt(item.excerpt),
                        cfi: item.cfi,
                    })), SearchResult),
                }) : new SearchResult({ label: formatExcerpt(excerpt), cfi }))
            }
        }
    }
    cycle(dir) {
        const { model } = this
        while (true) {
            if (!model.get_n_items()) break
            const position = model.selected
            if (position + dir < 0) model.selected = model.get_n_items() - 1
            else model.selected = position + dir
            if (model.selected_item?.item?.cfi) break
        }
    }
})
