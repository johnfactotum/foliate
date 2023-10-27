import Gtk from 'gi://Gtk'
import Adw from 'gi://Adw'
import Gio from 'gi://Gio'
import GObject from 'gi://GObject'
import { gettext as _, ngettext } from 'gettext'
import * as utils from './utils.js'
import * as CFI from './foliate-js/epubcfi.js'
import { vprintf, locales } from './format.js'

const Bookmark = utils.makeDataClass('FoliateBookmark', {
    'value': 'string',
    'label': 'string',
})

const Annotation = utils.makeDataClass('FoliateAnnotation', {
    'value': 'string',
    'location': 'string',
    'color': 'string',
    'text': 'string',
    'note': 'string',
    'created': 'string',
    'modified': 'string',
})

const AnnotationHeading = utils.makeDataClass('FoliateAnnotationHeading', {
    'label': 'string',
    'index': 'uint',
    'subitems': 'object',
})

const BookmarkRow = GObject.registerClass({
    GTypeName: 'FoliateBookmarkRow',
    Template: pkg.moduleuri('ui/bookmark-row.ui'),
    Children: ['button'],
    InternalChildren: ['label', 'value'],
}, class extends Gtk.Box {
    update({ value, label }) {
        this.value = value
        this.label = label
        this._label.label = label
        this._value.label = value
    }
})

const dateFormat = new Intl.DateTimeFormat(locales, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: 'numeric', minute: 'numeric',
})

const AnnotationRow = GObject.registerClass({
    GTypeName: 'FoliateAnnotationRow',
    Template: pkg.moduleuri('ui/annotation-row.ui'),
    Children: ['button'],
    InternalChildren: ['heading', 'box', 'color', 'text', 'sep', 'note', 'bar', 'date'],
    Properties: utils.makeParams({
        'editable': 'boolean',
    }),
}, class extends Gtk.Box {
    update(obj) {
        this.annotation = obj
        if (obj instanceof Annotation) {
            const { text, note, color } = obj
            this._text.label = text.trim().replace(/\n/g, ' ')
            this._note.label = note.trim().replace(/\n/g, ' ')
            this._color.update(color)
            this._heading.hide()
            this._box.show()
            const showNote = Boolean(note)
            this._sep.visible = showNote
            this._note.visible = showNote
            this._bar.show()
            const date = obj.modified || obj.created
            if (date) {
                this._date.label = dateFormat.format(new Date(date))
                this._date.show()
            } else this._date.hide()
            this.margin_top = 6
            this.margin_bottom = 6
        } else {
            this._heading.label = obj.label
            this._heading.show()
            this._box.hide()
            this._sep.hide()
            this._note.hide()
            this._bar.hide()
            this.margin_top = 3
            this.margin_bottom = 3
        }
    }
})

export const BookmarkModel = GObject.registerClass({
    GTypeName: 'FoliateBookmarkModel',
}, class extends Gio.ListStore {
    add(value, label) {
        const obj = new Bookmark({ value, label })
        for (const [i, item] of utils.gliter(this)) {
            if (CFI.compare(value, item.value) <= 0) {
                this.insert(i, obj)
                return
            }
        }
        this.append(obj)
    }
    delete(value) {
        for (const [i, item] of utils.gliter(this))
            if (item.value === value) {
                this.remove(i)
                break
            }
    }
    export() {
        return Array.from(utils.gliter(this), ([, item]) => item.value)
    }
})

GObject.registerClass({
    GTypeName: 'FoliateBookmarkView',
    Properties: utils.makeParams({
        'dir': 'string',
        'has-items-in-view': 'boolean',
    }),
    Signals: {
        'go-to-bookmark': { param_types: [GObject.TYPE_STRING] },
    },
}, class extends Gtk.ListView {
    #location
    #inView = []
    constructor(params) {
        super(params)
        this.connect('activate', (_, pos) => {
            const bookmark = this.model.model.get_item(pos) ?? {}
            if (bookmark) this.emit('go-to-bookmark', bookmark.value)
        })
        this.factory = utils.connect(new Gtk.SignalListItemFactory(), {
            'setup': (__, listItem) => {
                const row = new BookmarkRow()
                row.button.connect('clicked', () => {
                    this.model.model.delete(row.value)
                    this.root.add_toast(utils.connect(new Adw.Toast({
                        title: _('Bookmark deleted'),
                        button_label: _('Undo'),
                    }), { 'button-clicked': () =>
                        this.model.model.add(row.value, row.label) }))
                })
                listItem.child = row
            },
            'bind': (_, listItem) => {
                listItem.child.update(listItem.item)
                utils.setDirection(listItem.child, this.dir)
            },
        })
    }
    setupModel(model) {
        this.model = new Gtk.NoSelection({ model })
    }
    update(location = this.#location) {
        this.#location = location
        if (!this.model) return
        const { cfi } = location
        const start = CFI.collapse(cfi)
        const end = CFI.collapse(cfi, true)
        this.#inView = Array.from(utils.gliter(this.model.model),
            ([, bookmark]) => [bookmark,
                CFI.compare(start, bookmark.value) * CFI.compare(end, bookmark.value) <= 0])
            .filter(([, x]) => x)
        this.set_property('has-items-in-view', this.#inView.length > 0)
    }
    toggle() {
        const inView = this.#inView
        const { model } = this.model
        if (inView.length) {
            const marks = inView.map(x => x[0])
            for (const { value } of marks) model.delete(value)
            this.root.add_toast(utils.connect(new Adw.Toast({
                title: _('Bookmark deleted'),
                button_label: _('Undo'),
            }), { 'button-clicked': () =>
                marks.forEach(({ value, label }) => model.add(value, label)) }))
        }
        else model.add(this.#location.cfi, this.#location.tocItem?.label)
    }
})

export const AnnotationModel = GObject.registerClass({
    GTypeName: 'FoliateAnnotationModel',
    Signals: {
        'update-annotation': { param_types: [Annotation.$gtype] },
    },
}, class extends Gio.ListStore {
    #map = new Map()
    #lists = new Map()
    add(annotation, index, label) {
        const { value } = annotation
        if (this.#map.has(value)) return
        const obj = annotation instanceof Annotation
            ? new Annotation(annotation.toJSON()) : new Annotation(annotation)
        this.#map.set(value, obj)
        obj.connectAll(() => {
            obj.modified = new Date().toISOString()
            this.emit('update-annotation', obj)
        })
        if (this.#lists.has(index)) {
            const list = this.#lists.get(index)
            for (const [i, item] of utils.gliter(list)) {
                if (CFI.compare(value, item.value) <= 0) {
                    list.insert(i, obj)
                    return
                }
            }
            list.append(obj)
        } else {
            const subitems = new Gio.ListStore()
            subitems.append(obj)
            this.#lists.set(index, subitems)
            const heading = new AnnotationHeading({ label, index, subitems })
            for (const [i, item] of utils.gliter(this))
                if (item.index > index) return this.insert(i, heading)
            this.append(heading)
        }
    }
    delete(annotation, index) {
        const { value } = annotation
        this.#map.delete(value)
        const list = this.#lists.get(index)
        for (const [i, item] of utils.gliter(list)) {
            if (item.value === value) {
                list.remove(i)
                if (!list.get_n_items()) {
                    for (const [j, item] of utils.gliter(this))
                        if (item.subitems === list) {
                            this.remove(j)
                            this.#lists.delete(index)
                            break
                        }
                }
                break
            }
        }
    }
    get(value) {
        return this.#map.get(value)
    }
    getForIndex(index) {
        return this.#lists.get(index)
    }
    export() {
        return Array.from(utils.gliter(this), ([, item]) =>
            Array.from(utils.gliter(item.subitems), ([, item]) => item)).flat()
    }
})

GObject.registerClass({
    GTypeName: 'FoliateAnnotationView',
    Properties: utils.makeParams({
        'dir': 'string',
        'editable': 'boolean',
    }),
    Signals: {
        'go-to-annotation': { param_types: [Annotation.$gtype] },
        'delete-annotation': { param_types: [Annotation.$gtype] },
    },
}, class extends Gtk.ListView {
    #filter
    #location
    // don't scroll when activating, as that would mean it's already in view
    #shouldScroll = true
    constructor(params) {
        super(params)
        this.connect('activate', (_, pos) => {
            this.#shouldScroll = false
            const annotation = this.model.model.get_item(pos).item ?? {}
            if (annotation) this.emit('go-to-annotation', annotation)
        })
        const handlers = new WeakMap()
        this.factory = utils.connect(new Gtk.SignalListItemFactory(), {
            'setup': (_, listItem) => {
                const row = new AnnotationRow({ editable: this.editable })
                row.button.connect('clicked', () =>
                    this.emit('delete-annotation', row.annotation))
                listItem.child = new Gtk.TreeExpander({ indent_for_icon: false })
                listItem.child.child = row
            },
            'bind': (_, listItem) => {
                const expander = listItem.child
                expander.list_row = listItem.item

                const annotation = listItem.item.item
                const widget = expander.child
                widget.update(annotation)
                handlers.set(listItem, annotation.connectAll(() =>
                    widget.update(annotation)))

                if (annotation.subitems) {
                    expander.remove_css_class('card')
                    expander.remove_css_class('activatable')
                    expander.add_css_class('dim-label')
                } else {
                    expander.add_css_class('card')
                    expander.add_css_class('activatable')
                    expander.remove_css_class('dim-label')
                }
                utils.setDirection(expander, this.dir)
            },
            'unbind': (_, listItem) =>
                utils.disconnect(listItem.item.item, handlers.get(listItem)),
        })

        // XXX: `scroll_to()` doesn't work until after the list view is shown
        // or rather, not even then; probably a GTK bug?
        const handler = this.connect('map', () => {
            this.disconnect(handler)
            if (this.#location)
                // horrible hack but it's better than nothing I guess
                setTimeout(() => this.scrollToCFI(this.#location.cfi), 100)
        })
    }
    setupModel(model) {
        const tree = Gtk.TreeListModel
            .new(model, false, true, item => item.subitems ?? null)
        this.#filter = new Gtk.FilterListModel({ model: tree })
        this.model = new Gtk.NoSelection({ model: this.#filter })
        if (this.#location) this.scrollToCFI(this.#location.cfi)
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
    #scrollToIndex(i) {
        if (i >= 0) this.scroll_to(i, Gtk.ListScrollFlags.NONE, null)
    }
    scrollToCFI(cfi) {
        for (const [i, item] of utils.gliter(this.#filter))
            if (item.item.value && CFI.compare(cfi, item.item.value) <= 0)
                return this.#scrollToIndex(i)
        return this.#scrollToIndex(this.#filter.get_n_items() - 1)
    }
    update(location) {
        if (!this.#filter) {
            this.#location = location
            return
        }
        if (!this.#shouldScroll) {
            this.#shouldScroll = true
            this.#location = location
            return
        }
        if (this.#location.cfi === location.cfi) return
        this.scrollToCFI(location.cfi)
        this.#location = location
    }
})

const AnnotationColor = utils.makeDataClass('FoliateAnnotationColor', {
    'label': 'string',
    'value': 'string',
    'type': 'string',
})

const colorImageIcons = {
    underline: 'format-text-underline-symbolic',
    squiggly: 'text-squiggly-symbolic',
    strikethrough: 'format-text-strikethrough-symbolic',
}

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
        const icon = color ? colorImageIcons[color] : 'color-select-symbolic'
        if (icon) {
            this.#icon.icon_name = icon
            this.visible_child = this.#icon
        } else {
            utils.addStyle(this.#frame, `frame {
                background: ${utils.RGBA(color).to_string()};
            }`)
            this.visible_child = this.#frame
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
            { label: _('Squiggly'), value: 'squiggly' },
            { label: _('Strikethrough'), value: 'strikethrough' },
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
                new Gtk.ColorDialog().choose_rgba(this.root, null, null, (self, res) => {
                    try {
                        const color = self.choose_rgba_finish(res).to_string()
                        this.selectColor(color)
                        this.emit('color-changed', color)
                    } catch (e) {
                        if (e instanceof Gtk.DialogError) console.debug(e)
                        else console.error(e)
                        this.selected = this.#prevSelected
                    }
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
            label: _('Custom'),
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
        'select-annotation': {},
        'color-changed': { param_types: [GObject.TYPE_STRING] },
    },
    InternalChildren: ['stack', 'button', 'text-view', 'drop-down'],
}, class extends Gtk.Popover {
    #isAddingNote
    constructor(params) {
        super(params)
        this.insert_action_group('annotation', utils.addMethods(this, {
            actions: ['add-note', 'delete', 'more'],
        }))

        this._drop_down.selectColor(this.annotation.color)
        this._text_view.buffer.text = this.annotation.note
        this.#updateStack()

        this._drop_down.connect('color-changed', (_, color) => {
            this.annotation.set_property('color', color)
            this.emit('color-changed', color)
        })
        this._text_view.buffer.connect('changed', buffer => {
            this.#updateStack()
            this.annotation.set_property('note', buffer.text)
        })
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
    more() {
        this.emit('select-annotation')
        this.popdown()
    }
})

const ImportDialog = GObject.registerClass({
    GTypeName: 'FoliateImportDialog',
    Template: pkg.moduleuri('ui/import-dialog.ui'),
    Children: ['annotation-view'],
    InternalChildren: ['cancel-button', 'ok-button', 'banner'],
    Properties: utils.makeParams({
        'identifier-mismatch': 'boolean',
    }),
    Signals: {
        'response': {},
    },
}, class extends Adw.Window {
    constructor(params) {
        super(params)
        const respond = () => {
            this.emit('response')
            this.close()
        }
        this._ok_button.connect('clicked', respond)
        this._banner.connect('button-clicked', respond)
        this._cancel_button.connect('clicked', () => this.close())
        this.add_controller(utils.addShortcuts({ 'Escape|<ctrl>w': () => this.close() }))
    }
    close() {
        super.close()
        this.run_dispose()
    }
})

export const importAnnotations = (window, data) => {
    const dialog = new Gtk.FileDialog()
    const filter = new Gtk.FileFilter({
        name: _('JSON Files'),
        mime_types: ['application/json'],
    })
    dialog.filters = new Gio.ListStore()
    dialog.filters.append(new Gtk.FileFilter({
        name: _('All Files'),
        patterns: ['*'],
    }))
    dialog.filters.append(filter)
    dialog.default_filter = filter
    dialog.open(window, null, (__, res) => {
        try {
            const file = dialog.open_finish(res)
            const json = utils.readJSONFile(file)
            if (!json.annotations?.length) return window.error(_('No Annotations'),
                _('The imported file has no annotations'))
            const importDialog = new ImportDialog({
                identifier_mismatch: !(json.metadata?.identifier === data.key),
                transient_for: window,
            })
            const model = new Gio.ListStore()
            importDialog.annotation_view.setupModel(model)
            importDialog.show()
            const annotations = json.annotations.map(item => {
                const annotation = new Annotation(item)
                model.append(annotation)
                return annotation
            })
            importDialog.connect('response', () => data.addAnnotations(annotations))
        } catch (e) {
            if (e instanceof Gtk.DialogError) console.debug(e)
            else {
                console.error(e)
                window.error(_('Cannot Import Annotations'),
                    _('An error occurred'))
            }
        }
    })
}

export const exportAnnotations = (window, data) => {
    const n = data.annotations?.length
    if (!(n > 0)) return window.error(_('No Annotations'),
        _('You don’t have any annotations for this book'))

    const path = pkg.modulepath('ui/export-dialog.ui')
    const builder = pkg.useResource
        ? Gtk.Builder.new_from_resource(path)
        : Gtk.Builder.new_from_file(path)
    const dialog = builder.get_object('export-dialog')
    dialog.transient_for = window
    dialog.present()
    builder.get_object('ok-button').connect('clicked', () => {
        const { selected } = builder.get_object('format-combo')
        const format = ['json', 'html', 'md', 'org'][selected]
        const { metadata = {} } = data
        const title = vprintf(_('Annotations for “%s”'), [metadata.title])
        const total = vprintf(ngettext('%d Annotation', '%d Annotations', n), [n])
        new Gtk.FileDialog({ initial_name: title + '.' + format })
            .save(window, null, (self, res) => {
                try {
                    const file = self.save_finish(res)
                    const contents = exportFunctions[format](data, title, total)
                    file.replace_contents(contents, null, false,
                        Gio.FileCreateFlags.REPLACE_DESTINATION, null)
                } catch (e) {
                    if (e instanceof Gtk.DialogError) console.debug(e)
                    else console.error(e)
                }
            })
        dialog.close()
    })
    builder.get_object('cancel-button').connect('clicked', () => dialog.close())
    dialog.add_controller(utils.addShortcuts({ 'Escape|<ctrl>w': () => dialog.close() }))
}

const htmlEscape = str => str.replace(/[<>&]/g, x =>
    x === '<' ? '&lt;' : x === '>' ? '&gt;' : '&amp;')

const mdEscape = str => str.replace(/[<>&]/g, x => '\\' + x)

const exportFunctions = {
    json: data => JSON.stringify(data, null, 2),
    html: ({ annotations }, title, total) => `<!DOCTYPE html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
    body { max-width: 36em; padding: 1em; margin: auto; }
    header { text-align: center; }
    section { border-top: 1px solid; }
    .cfi { font-size: small; opacity: 0.5; font-family: monospace; }
    blockquote { margin-inline-start: 0; padding-inline-start: 1em;
        border-inline-start: .5em solid; }
    .underline { text-decoration: underline red; }
    .squiggly { text-decoration: underline wavy red; }
    .strikethrough { text-decoration: line-through red; }
    .underline, .squiggly, .strikethrough { border: none; }
    .note { white-space: pre-wrap; }
</style>
<header><h1>${title}</h1><p>${total}</p></header>${
    annotations.map(({ value, text, color, note }) => `<section>
    <p class="cfi">${htmlEscape(value)}</p>
    <blockquote style="border-color: ${color}">
        <span class="${color}">${htmlEscape(text)}</span>
    </blockquote>
    ${note ? `<p class="note">${htmlEscape(note)}</p>` : ''}
</section>`).join('')}`,
    md: ({ annotations }, title, total) => `# ${title}\n\n${total}${
        annotations.map(({ value, text, color, note }) => `

---

**${color}** - \`${value}\`

> ${mdEscape(text)}${note ? '\n\n' + mdEscape(note) : ''}`).join('')}`,
    org: ({ annotations }, title, total) => `* ${title}
${total}
${annotations.map(({ value, text, color, note }) => `

-----

*${color}* - \`${value}\`

#+begin_quote
${text}
#+end_quote
${note}
`)}
`,
}
