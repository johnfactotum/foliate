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
'use strict'
 
pkg.initGettext()
const ngettext = imports.gettext.ngettext
pkg.initFormat()
pkg.require({
    'Gio': '2.0',
    'Gtk': '3.0'
})

const GObject = imports.gi.GObject
const Gio = imports.gi.Gio
const GLib = imports.gi.GLib
const Gtk = imports.gi.Gtk
const Gdk = imports.gi.Gdk
const GdkPixbuf = imports.gi.GdkPixbuf
const Webkit = imports.gi.WebKit2
const Pango = imports.gi.Pango
const Soup = imports.gi.Soup
const ByteArray = imports.byteArray

const defaultThemes = {
    [_('Light')]: {
        color: '#000', background: '#fff', link: 'blue',
        darkMode: false, invert: false
    },
    [_('Sepia')]: {
        color: '#5b4636', background: '#efe7dd', link: 'darkcyan',
        darkMode: false, invert: false
    },
    [_('Dark')]: {
        color: '#eee', background: '#222', link: 'cyan',
        darkMode: true, invert: false
    },
    [_('Invert')]: {
        color: '#000', background: '#fff', link: 'blue',
        darkMode: true, invert: true
    }
}
const defaultLayouts = {
    [_('Auto')]: 'paginated',
    [_('Single')]: 'single',
    [_('Scrolled')]: 'scrolled-doc'
}

const highlightColors = [['yellow', _('Yellow')], ['orange', _('Orange')],
    ['red', _('Red')], ['magenta', _('Magenta')], ['aqua', _('Aqua')], ['lime', _('Lime')]]

const coloredText = (color, text) =>
    `<span bgcolor="${color}" bgalpha="25%">${text}</span>`

const settings = new Gio.Settings({ schema_id: pkg.name })

class Storage {
    constructor(key, type) {
        const dataDir = type === 'cache' ? GLib.get_user_cache_dir()
            : type === 'config' ? GLib.get_user_config_dir()
            : GLib.get_user_data_dir()

        this._destination = GLib.build_filenamev([dataDir, pkg.name,
            `${encodeURIComponent(key)}.json`])
        this._file = Gio.File.new_for_path(this._destination)
        
        this._data = this._read()
    }
    _read() {
        try {
            const [success, data, tag] = this._file.load_contents(null)
            if (success) return JSON.parse(ByteArray.toString(data))
            else throw new Error()
        } catch (e) {
            return {}
        }
    }
    _write(data) {
        // TODO: throttle?
        const mkdirp = GLib.mkdir_with_parents(
            this._file.get_parent().get_path(), parseInt('0755', 8))
        if (mkdirp === 0) {
            const [success, tag] = this._file
                .replace_contents(JSON.stringify(data),
                    null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null)
            if (success) return true
        }
        throw new Error('Could not save file')
    }
    get(property, defaultValue) {
        return property in this._data ? this._data[property] : defaultValue
    }
    set(property, value) {
        this._data[property] = value
        this._write(this._data)
    }
}


const httpSession = new Soup.SessionAsync()
Soup.Session.prototype.add_feature.call(httpSession, new Soup.ProxyResolverDefault())

const getDictionaryEntry = word => new Promise((resolve, reject) => {
    const request = Soup.Message.new('GET', `https://en.wiktionary.org/wiki/${word}`)
    httpSession.queue_message(request, (httpSession, message) => {
        if (message.status_code !== 200) resolve()
        else resolve(request.response_body.data)
    })
})


class Navbar {
    constructor(onSlide, onPrev, onNext, onBack) {
        this._percentage = NaN
        this._history = []
        
        this._slider = new Gtk.Scale({
            orientation: Gtk.Orientation.HORIZONTAL,
            adjustment: new Gtk.Adjustment({ value: 0, lower: 0, upper: 1 }),
            digits: 5,
            hexpand: true,
            value_pos: Gtk.PositionType.LEFT
        })
        this._slider.connect('format-value', (_, x) => `${Math.round(x * 100)}%`)

        this._prevButton = new Gtk.Button({
            image: new Gtk.Image({ icon_name: 'go-previous-symbolic' }),
            tooltip_text: _('Previous page'),
            sensitive: false
        })
        this._nextButton = new Gtk.Button({
            image: new Gtk.Image({ icon_name: 'go-next-symbolic' }),
            tooltip_text: _('Next page'),
            sensitive: false
        })

        const box = new Gtk.Box({ hexpand: true })
        this._pendingLabel = new Gtk.Image({ icon_name: 'content-loading-symbolic' })
        box.pack_start(this._pendingLabel, true, true, 0)
        box.pack_start(this._slider, true, true, 0)
        
        this._backButton = new Gtk.Button({
            image: new Gtk.Image({ icon_name: 'edit-undo-symbolic' }),
            tooltip_text: _('Go back'),
            sensitive: false
        })

        this.goBack = () => {
            if (!this._history.length) return
            onBack(this._history.pop())
            if (!this._history.length) this._backButton.sensitive = false
        }
        this._backButton.connect('clicked', this.goBack)
        
        this.widget = new Gtk.ActionBar()
        this.widget.pack_start(this._prevButton)
        this.widget.pack_start(this._backButton)
        this.widget.pack_end(this._nextButton)
        this.widget.pack_end(box)
        
        this._slider.connect('button-release-event', () => {
            const value = this._slider.get_value()
            if (value !== this._percentage) onSlide(this._slider.get_value())
        })
        this._prevButton.connect('clicked', () => onPrev())
        this._nextButton.connect('clicked', () => onNext())
    }
    setPending() {
        this._slider.hide()
        this._pendingLabel.show()
    }
    setReady(percentage) {
        this._percentage = percentage
        this._slider.set_value(percentage)
        this._pendingLabel.hide()
        this._slider.show()
    }
    setSectionMarks(sectionMarks) {
        sectionMarks.forEach(x =>
            this._slider.add_mark(x, Gtk.PositionType.TOP, null))
    }
    updateSlider(percentage) {
        this._percentage = percentage
        this._slider.set_value(percentage)
    }
    pushHistory(x) {
        this._history.push(x)
        this._backButton.sensitive = true
    }
    setAtStart(atStart) {
        this._prevButton.sensitive = !atStart
    }
    setAtEnd(atEnd) {
        this._nextButton.sensitive = !atEnd
    }
}

class JumpList {
    constructor(width, height, isToc, onChange) {
        const store = isToc ? new Gtk.TreeStore() : new Gtk.ListStore()
        store.set_column_types([GObject.TYPE_STRING, GObject.TYPE_STRING])

        const view = new Gtk.TreeView({
            model: store,
            headers_visible: false,
            expand: true
        })
        const col = new Gtk.TreeViewColumn()
        view.append_column(col)

        const text = new Gtk.CellRendererText()
        if (isToc) text.ellipsize = Pango.EllipsizeMode.END
        else {
            text.wrap_mode = Gtk.WRAP_WORD
            text.wrap_width = width
        }
        col.pack_start(text, true)
        col.add_attribute(text, 'markup', 0)
        
        const selection = view.get_selection()
        view.set_activate_on_single_click(true)
        view.connect('row-activated', () => {
            const [, , iter] = selection.get_selected()
            const href = store.get_value(iter, 1)
            onChange(href)
        })
        
        const scroll = new Gtk.ScrolledWindow({
            min_content_width: width,
            min_content_height: height
        })
        scroll.get_style_context().add_class('frame')
        if (!isToc) scroll.hscrollbar_policy = Gtk.PolicyType.NEVER
        scroll.add(view)
        
        this.store = store
        this.view = view
        this.widget = scroll
    }
    loadSearchResults(results, query) {
        this.store.clear()
        const regex = new RegExp(query, 'ig')
        results.forEach(item => {
            const newIter = this.store.append()
            const label = item.excerpt.trim().replace(/\n/g, ' ')
            const m = label.replace(regex, `<b>${regex.exec(label)[0]}</b>`)
            this.store.set(newIter, [0, 1], [m, item.cfi])
        })
    }
    loadToc(toc) {
        const f = (toc, iter = null) => {
            toc.forEach(chapter => {
                const newIter = this.store.append(iter)
                const label = chapter.label.trim()
                this.store.set(newIter, [0, 1], [label, chapter.href])
                if (chapter.subitems) f(chapter.subitems, newIter)
            })
        }
        f(toc)
    }
    selectSection(href) {
        const store = this.store
        const selection = this.view.get_selection()
        let [, iter] = store.get_iter_first()
        loop:
        while (true) {
            // remove anchors as currently there's no way of handling them;
            // perhaps we may get the DOM element of the anchors,
            // then create CFIs from them, then we can handle them properly
            const value = store.get_value(iter, 1).split('#')[0]
            if (value === href) {
                const path = store.get_path(iter)
                this.view.expand_to_path(path)
                this.view.scroll_to_cell(path, null, true, 0.5, 0)
                selection.select_iter(iter)
                break
            }
            const [hasChild, childIter] = store.iter_children(iter)
            if (hasChild) iter = childIter
            else {
                while (true) {
                    const [hasParent, parentIter] = store.iter_parent(iter)
                    if (!store.iter_next(iter)) {
                        if (hasParent) iter = parentIter
                        else break loop
                    } else break
                }
            }
        }
    }
}

class TocPopover {
    constructor(toc, button, onChange) {
        this._jumpList = new JumpList(320, 360, true, href => {
            onChange(href)
            button.active = false
        })
        this._jumpList.loadToc(toc)

        this.widget = new Gtk.Popover({ border_width: 10 })
        this.widget.add(this._jumpList.widget)
        this.widget.show_all()
        this.widget.hide()
    }
    selectSection(href) {
        this._jumpList.selectSection(href)
    }
}

// workaround for xgettext bug (https://savannah.gnu.org/bugs/?50920)
//`/`

class SearchPopover {
    constructor(button, onChange, onSearch) {
        this._searchEntry = new Gtk.SearchEntry({
            placeholder_text: _('Find in Book'),
            width_request: 320
        })
        this._searchEntry.connect('activate', () =>
            onSearch(this._searchEntry.get_text().trim()))
        this._searchEntry.connect('search-changed', () => {
            const text = this._searchEntry.get_text()
            if (text === '') onSearch(text)
        })
        
        this._jumpList = new JumpList(320, 350, false, href => {
            onChange(href)
            button.active = false
        })
        this._statusLabel = new Gtk.Label({ halign: Gtk.Align.START })
        this._statusLabel.get_style_context().add_class('dim-label')
        
        const box = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL, spacing: 10
        })
        box.pack_start(this._searchEntry, false, true, 0)
        box.pack_end(this._statusLabel, false, true, 0)
        box.pack_end(this._jumpList.widget, true, true, 0)

        this.widget = new Gtk.Popover({ border_width: 10 })
        this.widget.add(box)
        this.widget.show_all()
        this._statusLabel.hide()
        this._jumpList.widget.hide()
        this.widget.hide()
    }
    setPending() {
        this._searchEntry.get_style_context().remove_class('error')
        this._jumpList.store.clear()
        this._jumpList.widget.show()
        this._statusLabel.label = _('Searching…')
        this._statusLabel.show()
    }
    loadResults(results, query) {
        const n = results.length
        this._statusLabel.label = n === 0
            ? _('No results')
            : ngettext('%d result', '%d results', n).format(n)
        this._jumpList.loadSearchResults(results, query)
        if (!n) {
            this._searchEntry.get_style_context().add_class('error')
        }
    }
    setEnd() {
        this._searchEntry.get_style_context().remove_class('error')
        this._jumpList.widget.hide()
        this._statusLabel.hide()
    }
}

class FontBox {
    constructor(onChange) {
        this._onChange = onChange
        
        const fontBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL })
        fontBox.get_style_context().add_class('linked')
        this._fontButton = new Gtk.FontButton()
        this._decButton = new Gtk.Button({
            image: new Gtk.Image({ icon_name: 'value-decrease-symbolic' })
        })
        this._incButton = new Gtk.Button({
            image: new Gtk.Image({ icon_name: 'value-increase-symbolic' })
        })
        this._decButton.connect('clicked', () => this.dec())
        this._incButton.connect('clicked', () => this.inc())
        this._fontButton.connect('font-set', () => this.applyFont())
        fontBox.pack_start(this._fontButton, true, true, 0)
        fontBox.pack_start(this._decButton, false, true, 0)
        fontBox.pack_start(this._incButton, false, true, 0)
        
        this.widget = fontBox
    }
    applyFont()  {
        this._onChange()
    }
    dec() {
        const desc = this._fontButton.get_font_desc()
        desc.set_size(desc.get_size() - Pango.SCALE)
        this._fontButton.set_font_desc(desc)
        this.applyFont()
    }
    inc() {
        const desc = this._fontButton.get_font_desc()
        desc.set_size(desc.get_size() + Pango.SCALE)
        this._fontButton.set_font_desc(desc)
        this.applyFont()
    }
    setFont(font) {
        this._fontButton.set_font(font)
        this.applyFont()
    }
    getFont() {
        return {
            desc: this._fontButton.get_font_desc(),
            name: this._fontButton.get_font()
        }
    }
}
class RadioBox {
    constructor(options, onChange) {
        this._buttons = Object.assign({},
            ...options.map(theme =>
                ({ [theme]: new Gtk.RadioButton({ label: theme }) })))
        const onToggle = button => { if (button.active) onChange(button.label) }
        const box = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL })
        const first = this._buttons[Object.keys(this._buttons)[0]]
        for (const x in this._buttons) {
            const button = this._buttons[x]
            button.join_group(first)
            button.active = false
            button.connect('toggled', onToggle)
            box.pack_start(button, false, true, 3)
        }
        this.widget = box
    }
    applyOption() {
        for (const x in this._buttons) {
            const button = this._buttons[x]
            if (button.active) button.emit('toggled')
        }
    }
    activate(x) {
        (this._buttons[x] || this._buttons[Object.keys(this._buttons)[0]]).active = true
    }
    getActive() {
        return Object.values(this._buttons).filter(x => x.active)[0].label
    }
}

class SwitchBox {
    constructor(label, key, onChange) {
        this.widget = new Gtk.Box()
        const switchLabel = new Gtk.Label({ label })
        this._switch = new Gtk.Switch()
        this._switch.active = settings.get_boolean(key)

        this._switch.connect('state-set', (widget, state) => {
            settings.set_boolean(key, state)
            onChange()
        })
        this.widget.pack_start(switchLabel, false, true, 0)
        this.widget.pack_end(this._switch, false, true, 0)
    }
    get active() {
        return this._switch.active
    }
}

class ViewPopover {
    constructor(themes, onChange, onLayoutChange) {
        this.widget = new Gtk.Popover({ border_width: 10 })
        
        const grid = new Gtk.Grid()
        grid.column_spacing = 10
        grid.row_spacing = 10
        
        const onViewChange = () => {
            const font = this._fontBox.getFont()
            const spacing = this._spacingButton.get_value()
            const margin = this._marginButton.get_value()
            const brightness = this._brightnessSlider.get_value()
            const theme = this._themeBox.getActive()
            const useDefault = this._defaultSwitch.active
            const justify = this._justifySwitch.active
            const hyphenate = this._hyphenateSwitch.active
            onChange({
                font, spacing, margin, brightness, theme, useDefault, justify, hyphenate
            })
        }

        this._fontBox = new FontBox(onViewChange)
        this._themeBox = new RadioBox(Object.keys(themes), onViewChange)
        this._layoutBox = new RadioBox(Object.keys(defaultLayouts), onLayoutChange)
        
        this._defaultSwitch = new SwitchBox(_('Use Publisher Font'),
            'use-default-font', onViewChange)
        this._justifySwitch = new SwitchBox(_('Full Justification'),
            'justify', onViewChange)
        this._hyphenateSwitch = new SwitchBox(_('Auto-Hyphenation'),
            'hyphenate', onViewChange)

        this._spacingButton = new Gtk.SpinButton()
        this._spacingButton.set_range(1, 3)
        this._spacingButton.set_digits(2)
        this._spacingButton.set_increments(0.1, 0)
        this._spacingButton.connect('value-changed', onViewChange)

        this._marginButton = new Gtk.SpinButton()
        this._marginButton.set_range(0, 40)
        this._marginButton.set_digits(1)
        this._marginButton.set_increments(2.5, 0)
        this._marginButton.connect('value-changed', onViewChange)

        this._brightnessSlider = new Gtk.Scale({
            orientation: Gtk.Orientation.HORIZONTAL,
            adjustment: new Gtk.Adjustment({ lower: 0.5, upper: 1.2 }),
            digits: 2,
            value_pos: Gtk.PositionType.RIGHT
        })
        this._brightnessSlider.connect('format-value', (_, x) => `${Math.round(x * 100)}%`)
        this._brightnessSlider.set_value(1)
        this._brightnessSlider.add_mark(1, Gtk.PositionType.BOTTOM, null)
        this._brightnessSlider.connect('value-changed', onViewChange)
        
        const menuLabels = {
            font: new Gtk.Label({ label: _('Font') }),
            spacing: new Gtk.Label({ label: _('Spacing') }),
            margin: new Gtk.Label({ label: _('Margin') }),
            brightness: new Gtk.Label({ label: _('Brightness') }),
            theme: new Gtk.Label({ label: _('Theme') }),
            layout: new Gtk.Label({ label: _('Layout') }),
            options: new Gtk.Label({ label: _('Options') })
        }
        for (let key in menuLabels) {
            const label = menuLabels[key]
            label.get_style_context().add_class('dim-label')
            label.halign = Gtk.Align.END
        }

        grid.attach(menuLabels.font, 0, 0, 1, 1)
        grid.attach(this._fontBox.widget, 1, 0, 1, 1)
        grid.attach(menuLabels.spacing, 0, 1, 1, 1)
        grid.attach(this._spacingButton, 1, 1, 1, 1)
        grid.attach(menuLabels.margin, 0, 2, 1, 1)
        grid.attach(this._marginButton, 1, 2, 1, 1)
        grid.attach(menuLabels.brightness, 0, 3, 1, 1)
        grid.attach(this._brightnessSlider, 1, 3, 1, 1)
        grid.attach(menuLabels.theme, 0, 4, 1, 1)
        grid.attach(this._themeBox.widget, 1, 4, 1, 1)
        grid.attach(new Gtk.Separator(), 0, 5, 2, 1)
        grid.attach(menuLabels.layout, 0, 6, 1, 1)
        grid.attach(this._layoutBox.widget, 1, 6, 1, 1)
        grid.attach(new Gtk.Separator(), 0, 7, 2, 1)
        grid.attach(menuLabels.options, 0, 8, 1, 1)
        grid.attach(this._defaultSwitch.widget, 1, 8, 1, 1)
        grid.attach(this._justifySwitch.widget, 1, 9, 1, 1)
        grid.attach(this._hyphenateSwitch.widget, 1, 10, 1, 1)
        this.widget.add(grid)
        this.widget.show_all()
        this.widget.hide()
    }
    decFont() {
        this._fontBox.dec()
    }
    incFont() {
        this._fontBox.inc()
    }
    loadSettings(font, spacing, margin, brightness, theme, layout) {
        this._fontBox.setFont(font)
        this._spacingButton.set_value(spacing)
        this._marginButton.set_value(margin)
        this._brightnessSlider.set_value(brightness)
        this._themeBox.activate(theme)
        this._themeBox.applyOption()
        this._layoutBox.activate(layout)
    }
    get theme() {
        return this._themeBox.getActive()
    }
    set theme(theme) {
        if (theme) this._themeBox.activate(theme)
    }
    get layout() {
        return this._layoutBox.getActive()
    }
    get font() {
        return this._fontBox.getFont()
    }
    get spacing() {
        return this._spacingButton.get_value()
    }
}

class NotesList {
    constructor(width, height, onActivate, onChange, emptyState) {
        this._width = width
        this._listBox = new Gtk.ListBox()
        
        this._rowMap = new Map() // GtkRow -> value, for row activation
        this._removeMap = new Map() // value -> removeFunc, for removing by value
        this._labelMap = new Map() // value -> GtkLabel
        this._label2Map = new Map() // value -> GtkLabel
        this._dataMap = new Map() // value -> data

        this._listBox.connect('row-activated', (_, row) =>
            onActivate(this._rowMap.get(row)))
        
        const scroll = new Gtk.ScrolledWindow({
            min_content_width: width,
            min_content_height: height
        })
        scroll.get_style_context().add_class('frame')
        scroll.add(this._listBox)
        
        this.widget = new Gtk.Stack()
        this.widget.add_named(scroll, 'list')
        this.widget.add_named(this._buildEmptyState(width, height, emptyState),'empty')
        
        this._emptyState.show()
        scroll.hide()
        this._onChange = (...args) => {
            if (this._rowMap.size) {
                this._emptyState.hide()
                scroll.show()
            } else {
                this._emptyState.show()
                scroll.hide()
            }
            onChange(...args)
        }
    }
    _buildEmptyState(width, height, { icon, title, message }) {
        this._emptyState = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 10,
            border_width: 10,
            valign: Gtk.Align.CENTER
        })
        const image = new Gtk.Image({ icon_name: icon, pixel_size: 48 })
        image.get_style_context().add_class('dim-label')
        const titleLabel = new Gtk.Label({
            label: `<big>${title}</big>`,
            use_markup: true,
            justify: Gtk.Justification.CENTER,
        })
        titleLabel.set_line_wrap(true)
        titleLabel.get_style_context().add_class('dim-label')
        const messageLabel = new Gtk.Label({
            label: message,
            use_markup: true,
            justify: Gtk.Justification.CENTER
        })
        messageLabel.set_line_wrap(true)
        messageLabel.get_style_context().add_class('dim-label')
        
        const box = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            valign: Gtk.Align.CENTER,
            spacing: 10
        })
        box.pack_start(image, false, true, 0)
        box.pack_start(titleLabel, false, true, 0)
        box.pack_start(messageLabel, false, true, 0)
        
        this._emptyState = new Gtk.ScrolledWindow({ width_request: width, height_request: height })
        this._emptyState.get_style_context().add_class('frame')
        this._emptyState.add(box)
        return this._emptyState
    }
    has(value) {
        return Array.from(this._rowMap.values()).includes(value)
    }
    add(text, text2, value, data, onRemove) {
        if (this.has(value)) return
        const row = new Gtk.ListBoxRow({
            selectable: false, width_request: this._width
        })
        const label = new Gtk.Label({
            label: text,
            use_markup: true,
            lines: 3,
            ellipsize: Pango.EllipsizeMode.MIDDLE,
            xalign: 0
        })
        label.set_line_wrap(true)
        const label2 = new Gtk.Label({
            label: (text2 || '').trim().replace(/\n/g, ' '),
            halign: Gtk.Align.START,
            use_markup: true,
            lines: 3,
            ellipsize: Pango.EllipsizeMode.END,
            xalign: 0
        })
        label2.set_line_wrap(true)

        const button = new Gtk.Button({
            image: new Gtk.Image({ icon_name: 'edit-delete-symbolic' }),
            relief: Gtk.ReliefStyle.NONE,
            valign: Gtk.Align.CENTER
        })
        
        this._rowMap.set(row, value)
        if (data) this._dataMap.set(value, data)
        this._labelMap.set(value, label)
        this._label2Map.set(value, label2)
        
        const removeFunc = () => {
            this._listBox.remove(row)
            this._rowMap.delete(row)
            this._removeMap.delete(value)
            this._dataMap.delete(value)
            this._labelMap.delete(value)
            this._label2Map.delete(value)
            onRemove(value)
            this._onChange(this.getValues())
        }
        this._removeMap.set(value, removeFunc)
        button.connect('clicked', removeFunc)
        
        const box = new Gtk.Box({ spacing: 3 })
        box.pack_start(label, true, true, 0)
        box.pack_end(button, false, true, 0)

        const box2 = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, border_width: 3 })
        box2.pack_start(box, true, true, 0)
        box2.pack_end(label2, true, true, 0)
        row.add(box2)
        
        row.show_all()
        if (!text2) label2.hide()
        this._listBox.add(row)
        this._onChange(this.getValues())
    }
    remove(value) {
        this._removeMap.get(value)()
    }
    setLabel(value, text) {
        this._labelMap.get(value).label = text
        this._onChange(this.getValues())
    }
    setLabel2(value, text) {
        const label = this._label2Map.get(value)
        label.label = text.trim().replace(/\n/g, ' ')
        if (text) label.show()
        else label.hide()
        this._onChange(this.getValues())
    }
    getData(value) {
        return this._dataMap.get(value)
    }
    getValues() {
        const values = Array.from(this._rowMap.values())
        if (this._dataMap.size) return values.map(value =>
            Object.assign({ value }, this._dataMap.get(value)))
        else return values
    }
}
class BookmarksPopover {
    constructor(button, onActivate, onAdd, onChange, onCanAddChange) {
        this._onCanAddChange = onCanAddChange

        this._notesList = new NotesList(320, 320, x => {
            onActivate(x)
            button.active = false
        }, onChange, {
            icon: 'non-starred-symbolic',
            title: _('No bookmarks'),
            message: _('Add some bookmarks to see them here.')
        })
        this._addButton = new Gtk.Button({ always_show_image: true })
        const add = (text, value) => {
            this._notesList.add(text, null, value, null, () => {
                if (value === this._currentCfi) this.setCanAdd()
            })
            this.setAdded(value)
        }
        this._initFunc = add
        this._addFunc = () => onAdd(add)
        this._addButton.connect('clicked', () => this.doButtonAction())
        this.setCanAdd()
        
        const bookmarksBox = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL, spacing: 10
        })
        bookmarksBox.pack_start(this._notesList.widget, true, true, 0)
        bookmarksBox.pack_end(this._addButton, false, true, 0)

        this.widget = new Gtk.Popover({ border_width: 10 })
        this.widget.add(bookmarksBox)
        this.widget.show_all()
        this.widget.hide()
    }
    init(arr) {
        arr.forEach(row => {
            const [text, value] = row
            this._initFunc(text, value)
        })
    }
    doButtonAction() {
        this._buttonAction()
    }
    setCanAdd() {
        this._addButton.image = new Gtk.Image({ icon_name: 'list-add-symbolic' })
        this._addButton.label = _('Bookmark Current Location')
        this._buttonAction = this._addFunc
        this._onCanAddChange(true)
    }
    setAdded(value) {
        this._addButton.image = new Gtk.Image({ icon_name: 'edit-delete-symbolic' })
        this._addButton.label = _('Remove Current Location')
        this._buttonAction = () => this._notesList.remove(value)
        this._onCanAddChange(false)
    }
    update(cfi) {
        this._currentCfi = cfi
        if (this._notesList.has(cfi)) this.setAdded(cfi)
        else this.setCanAdd()
    }
}
class AnnotationsPopover {
    constructor(button, onActivate, onChange, onRemove) {
        this._onRemove = onRemove
        this._notesList = new NotesList(320, 360, x => {
            onActivate(x)
            button.active = false
        }, onChange, {
            icon: 'document-edit-symbolic',
            title: _('No annotations'),
            message: _('Highlight some text to add annotations.')
        })

        this.widget = new Gtk.Popover({ border_width: 10 })
        this.widget.add(this._notesList.widget)
        this.widget.show_all()
        this.widget.hide()
    }
    init(arr) {
        arr.forEach(data => {
            const { text, note, color, value } = data
            const label = coloredText(color, text)
            this.add(label, note, value, data, this._onRemove)
        })
    }
    add(text, text2, value, data) {
        this._notesList.add(text, text2, value, data, this._onRemove)
    }
    remove(value) {
        this._notesList.remove(value)
    }
    setLabel(value, text) {
        this._notesList.setLabel(value, text)
    }
    setLabel2(value, text) {
        this._notesList.setLabel2(value, text)
    }
    getData(value) {
        return this._notesList.getData(value)
    }
}

class LookupPopover {
    constructor(relative_to, position, fromTop, onAnnotate, onCopy) {
        this.widget = new Gtk.Popover({ border_width: 10, relative_to })
        
        const actionBox = new Gtk.Box()
        actionBox.get_style_context().add_class('linked')
        const copyButton = new Gtk.Button({ label: _('Copy') })
        copyButton.connect('clicked', () => {
            onCopy()
            this.widget.popdown()
        })
        const noteButton = new Gtk.Button({ label: _('Highlight') })
        noteButton.connect('clicked', () => {
            this.widget.destroy()
            onAnnotate()
        })
        actionBox.pack_start(noteButton, true, true, 0)
        actionBox.pack_start(copyButton, true, true, 0)
        
        this.label = new Gtk.Label({
            label: _('Loading…'),
            use_markup: true,
            selectable: true,
            valign: Gtk.Align.START,
            xalign: 0
        })
        this.label.set_line_wrap(true)
        
        const credit = new Gtk.Label({
            label: _('From Wiktionary, the free dictionary'),
            justify: Gtk.Justification.CENTER
        })
        credit.get_style_context().add_class('dim-label')
        
        const scroll = new Gtk.ScrolledWindow({
            min_content_width: 300,
            min_content_height: 200
        })
        this.lbox = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            border_width: 5
        })
        this.lbox.pack_start(credit, false, true, 0)
        this.lbox.pack_start(new Gtk.Separator(), false, true, 3)
        this.lbox.pack_start(this.label, true, true, 0)
        scroll.get_style_context().add_class('frame')
        scroll.add(this.lbox)
        
        const box = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 10 })
        box.pack_start(actionBox, false, true, 0)
        box.pack_end(scroll, true, true, 0)
        
        this.widget.add(box)
        
        if (fromTop) this.widget.set_position(Gtk.PositionType.TOP)
        else this.widget.set_position(Gtk.PositionType.BOTTOM)
        const rectangle = new Gdk.Rectangle(position)
        this.widget.set_pointing_to(rectangle)
        box.show_all()
        
        this.widget.popup()
    }
    loadResults(label, word) {
        this.label.label = label
        if (word) {
            const url = `https://en.wiktionary.org/wiki/${encodeURI(word)}`
            this.lbox.pack_end(new Gtk.Label({
                label: `<a href="${url}">` + _('View Full Definition') + '</a>',
                use_markup: true,
                justify: Gtk.Justification.CENTER
            }), false, true, 0)
            this.lbox.pack_end(new Gtk.Separator(), false, true, 3)
            this.lbox.show_all()
        }
    }
}
class AnnotationPopover {
    constructor(relative_to, position, fromTop, onRemove, onCopy, color, onColorChange, note, onNoteChange) {
        this.widget = new Gtk.Popover({ border_width: 10, relative_to })
        
        const actionBox = new Gtk.Box()
        actionBox.get_style_context().add_class('linked')
        const copyButton = new Gtk.Button({ label: _('Copy') })
        copyButton.connect('clicked', () => {
            onCopy()
            this.widget.popdown()
        })
        const removeButton = new Gtk.Button({ label: _('Remove') })
        removeButton.connect('clicked', () => {
            onRemove()
            this.widget.popdown()
        })
        const noteButton = new Gtk.ToggleButton({ label: _('Note') })
        noteButton.connect('toggled', () => {
            scroll.visible = noteButton.active
            if (noteButton.active) textView.grab_focus()
        })
        
        const model = new Gtk.ListStore()
        model.set_column_types([GObject.TYPE_STRING, GObject.TYPE_STRING])

        const comboBox = new Gtk.ComboBox({ model })
        const renderer = new Gtk.CellRendererText()
        comboBox.pack_start(renderer, true)
        comboBox.add_attribute(renderer, 'markup', 1)

        highlightColors.forEach(x => {
            const text = coloredText(x[0], x[1])
            model.set(model.append(), [0, 1], [x[0], text])
        })
        comboBox.set_active(highlightColors.findIndex(([x]) => x === color))
        comboBox.connect('changed', () => {
            const [success, iter] = comboBox.get_active_iter()
            const value = model.get_value(iter, 0)
            onColorChange(value)
        })
        
        actionBox.pack_start(comboBox, true, true, 0)
        actionBox.pack_start(noteButton, true, true, 0)
        actionBox.pack_start(removeButton, true, true, 0)
        actionBox.pack_start(copyButton, true, true, 0)
        
        const textView = new Gtk.TextView({ wrap_mode: Gtk.WrapMode.WORD })
        const buffer = textView.get_buffer()
        const scroll = new Gtk.ScrolledWindow({
            min_content_height: 150
        })
        scroll.get_style_context().add_class('frame')
        scroll.add(textView)
        
        const box = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 10 })
        box.pack_start(actionBox, false, true, 0)
        box.pack_end(scroll, true, true, 0)
        
        this.widget.add(box)
        
        if (fromTop) this.widget.set_position(Gtk.PositionType.TOP)
        else this.widget.set_position(Gtk.PositionType.BOTTOM)
        const rectangle = new Gdk.Rectangle(position)
        this.widget.set_pointing_to(rectangle)
        box.show_all()
        
        if (note) {
            buffer.text = note
            noteButton.active = true
        } else scroll.hide()
        buffer.connect('changed', () => {
            onNoteChange(buffer.text)
        })
        
        this.widget.popup()
    }
}

class WelcomeScreen {
    constructor(lastFile, onRestore) {
        const box = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            valign: Gtk.Align.CENTER,
            halign: Gtk.Align.CENTER,
            spacing: 10
        })
        const image = new Gtk.Image({
            icon_name: 'document-open-symbolic', pixel_size: 80
        })
        image.get_style_context().add_class('dim-label')
        const title = new Gtk.Label({
            label: `<big><b>${_('Open some books to start reading')}</b></big>`,
            use_markup: true
        })
        title.get_style_context().add_class('dim-label')
        const label = new Gtk.Label({
            label: _('Open a file, or continue reading the last opened book.')
        })
        label.get_style_context().add_class('dim-label')
        const open = new Gtk.Button({
            label: _('Open File…'),
            action_name: 'app.open'
        })
        const restore = new Gtk.Button({
            label: _('Continue Reading')
        })
        restore.connect('clicked', onRestore)

        const buttonBox = new Gtk.Box({ spacing: 6, halign: Gtk.Align.CENTER })
        buttonBox.pack_start(open, false, true, 0)
        if (lastFile) buttonBox.pack_start(restore, false, true, 0)

        box.pack_start(image, false, true, 0)
        box.pack_start(title, false, true, 0)
        if (lastFile) box.pack_start(label, false, true, 0)
        box.pack_start(buttonBox, false, true, 18)
        box.show_all()

        this.widget = box
    }
}

class BookViewerWindow {
    constructor(application, width = -1, height = -1, fileName, themes = defaultThemes) {
        this.themes = themes
        this.canOpen = true

        this.application = application
        this.window = new Gtk.ApplicationWindow({
            application: application,
            default_width: width,
            default_height: height
        })
        
        let windowWidth, windowHeight, windowMaximized
        this.window.connect('size-allocate', () => {
            [windowWidth, windowHeight] = this.window.get_size()
            windowMaximized = this.window.is_maximized
        })
        this.window.connect('destroy', () => {
            settings.set_int('window-width', windowWidth)
            settings.set_int('window-height', windowHeight)
            settings.set_boolean('window-maximized', windowMaximized)
        })
        
        const theme = settings.get_string('theme')
        if (themes[theme]) Gtk.Settings.get_default()
            .gtk_application_prefer_dark_theme = themes[theme].darkMode
        
        this.headerBar = new Gtk.HeaderBar()
        this.headerBar.show_close_button = true
        this.headerBar.has_subtitle = false
        this.window.set_titlebar(this.headerBar)
        this.window.title = _('Foliate')
        this.window.show_all()
        
        this.buildMenu()
        if (fileName) this.open(fileName)
        else {
            const lastFile = settings.get_string('last-file')
            this.welcome = new WelcomeScreen(lastFile, () => {
                this.open(lastFile)
            })
            this.window.add(this.welcome.widget)
        }
    }
    open(fileName) {
        if (this.welcome) this.welcome.widget.destroy()
        this.canOpen = false
        this.window.connect('destroy', () =>
            settings.set_string('last-file', fileName))

        this.spinner = new Gtk.Spinner()
        this.spinner.start()
        
        this.webViewSettings = new Webkit.Settings({
            enable_write_console_messages_to_stdout: true,
            allow_file_access_from_file_urls: true
        })
        this.webView = new Webkit.WebView({ settings: this.webViewSettings })
        this.webView.connect('context-menu', () => true)
        
        this.webView.load_uri(GLib.filename_to_uri(pkg.pkgdatadir + '/assets/viewer.html', null))
        this.webView.connect('notify::title', self => {
            const action = JSON.parse(self.title)
            if (action.type === 'can-open')
                this.scriptRun(`openBook("${encodeURI(fileName)}")`)
            else this.handleAction(action)
        })
        
        this.container = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL })
        this.overlay = new Gtk.Overlay()
        this.overlay.add(this.webView)
        this.overlay.add_overlay(this.spinner)
        this.webView.opacity = 0

        this.container.pack_start(this.overlay, true, true, 0)
        this.window.add(this.container)
        this.window.show_all()
    }
    scriptRun(script) {
        this.webView.run_javascript(script, null, () => {})
    }
    scriptGet(script, f) {
        this.webView.run_javascript(`JSON.stringify(${script})`, null,
            (self, result) => {
                const jsResult = self.run_javascript_finish(result)
                const value = jsResult.get_js_value()
                const obj = JSON.parse(value.to_string())
                f(obj)
            })
    }
    bookError() {
        this.overlay.destroy()
        const box = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            valign: Gtk.Align.CENTER
        })
        const image = new Gtk.Image({
            icon_name: 'computer-fail-symbolic', pixel_size: 80
        })
        image.get_style_context().add_class('dim-label')
        const label = new Gtk.Label({
            label: `<big>${_('Oh no! The file cannot be opened')}</big>`,
            use_markup: true
        })
        label.get_style_context().add_class('dim-label')
        box.pack_start(image, true, true, 20)
        box.pack_end(label, false, true, 0)
        box.show_all()
        this.container.pack_start(box, true, true, 0)
    }
    bookReady() {
        this.scriptGet('book.package.metadata.title', title =>
            this.headerBar.title = title)

        this.scriptGet('book.package.metadata.identifier', key => {
            this.storage = new Storage(key)
            this.cache = new Storage(key, 'cache')

            const lastLocation = this.storage.get('lastLocation')
            const display = lastLocation ? `"${lastLocation}"` : 'undefined'
            const cached = this.cache.get('locations')

            this.scriptRun(`display(${display}, ${cached || null})`)
        })
    }
    bookDisplayed() {
        this.spinner.destroy()
        this.webView.opacity = 1
        this.webView.grab_focus()

        const goTo = x => this.scriptRun(`rendition.display('${x}')`)
        const withHistory = f => x =>
            this.scriptGet(`rendition.currentLocation().start.cfi`,
                cfi => { this.navbar.pushHistory(cfi); f(x) })

        this.scriptGet('book.navigation.toc', toc => {
            this.buildToc(toc, withHistory(goTo))

            this.buildAnnotations(withHistory(goTo),
                values => this.storage.set('annotations', values),
                value => this.scriptRun(`
                    rendition.annotations.remove("${value}", 'highlight')`))

            const annotations = this.storage.get('annotations', [])
            this.annotationsPopover.init(annotations)
            annotations.forEach(({ value, color }) =>
                this.scriptRun(`addAnnotation('${value}', '${color}')`))

            const cleanCfi = cfi => cfi.replace(/(^epubcfi\(|\)$)/g, '')
            this.buildBookmarks(withHistory(goTo), add => {
                this.scriptGet(`rendition.currentLocation().start.cfi`, cfi => {
                    add(cleanCfi(cfi), cfi)
                })
            }, values => this.storage.set('bookmarks', values))
            this.bookmarksPopover.init(this.storage.get('bookmarks', [])
                .map(x => [cleanCfi(x), x]))
        })

        this.buildNavbar(
            withHistory(x => this.scriptRun(`gotoPercentage(${x})`)),
            () => this.scriptRun('rendition.prev()'),
            () => this.scriptRun('rendition.next()'),
            x => this.scriptRun(`rendition.display('${x}')`))

        this.buildSearch(withHistory(goTo), text => {
            if (typeof text !== 'undefined' && text !== '') {
                this.scriptRun(`search("${encodeURI(text)}")`)
                this.searchPopover.setPending()
            } else {
                this.scriptRun('clearSearch()')
                this.searchPopover.setEnd()
            }
        })

        this.scriptRun(`lookupEnabled = ${settings.get_boolean('lookup-enabled')}`)

        this.buildView(this.themes, ({
            font, spacing, margin, brightness, theme, useDefault, justify, hyphenate
        }) => {
            settings.set_string('font', font.name)
            settings.set_double('spacing', spacing)
            settings.set_double('margin', margin)
            settings.set_double('brightness', brightness)
            settings.set_string('theme', theme)

            const { color, background, link, darkMode, invert } =
                this.themes[theme]
            
            Gtk.Settings.get_default()
                .gtk_application_prefer_dark_theme = darkMode
            
            const fontFamily = font.desc.get_family()
            const fontSize = `${font.desc.get_size() / Pango.SCALE}pt`
            const fontWeight = font.desc.get_weight()

            this.webViewSettings.serif_font_family = useDefault? 'Serif' : fontFamily
            this.webViewSettings.sans_serif_font_family = useDefault ? 'Sans' : fontFamily
            this.webViewSettings.default_font_family = fontFamily

            const filter = `${invert ? 'invert(1) hue-rotate(180deg) ' : ''}brightness(${brightness})`
            this.scriptRun(`
                document.documentElement.style.filter = '${filter}'
                document.body.style.color = '${color}'
                document.body.style.background = '${background}'
                document.body.style.margin = '0 ${margin}%'
                rendition.resize()
            `)
            if (!useDefault) this.scriptRun(`
                rendition.themes.register('custom', {
                    '.custom': {
                        'color': '${color}',
                        'background': '${background}',
                        'font-family': '"${fontFamily}" !important',
                        'font-size': '${fontSize} !important',
                        'font-weight': '${fontWeight} !important',
                        'line-height': '${spacing} !important',
                        '-webkit-hyphens': '${hyphenate ? 'auto' : 'manual'}',
                        '-webkit-hyphenate-limit-before': 3,
                        '-webkit-hyphenate-limit-after': 2,
                        '-webkit-hyphenate-limit-lines': 2
                    },
                    '.custom code, .custom pre': {
                        '-webkit-hyphens': 'none'
                    },
                    '.custom *:not(code):not(pre):not(code *):not(pre *)': {
                        'font-family': '"${fontFamily}" !important'
                    },
                    'p': {
                        'text-align': '${justify ? 'justify' : 'inherit'}'
                    },
                    '.custom p': {
                        'font-family': '"${fontFamily}" !important',
                        'font-size': '${fontSize} !important',
                        'font-weight': '${fontWeight} !important',
                        'line-height': '${spacing} !important'
                    },
                    '.custom a:link': { color: '${link}' }
                })
                rendition.themes.select('custom')`)
            else this.scriptRun(`
                rendition.themes.register('default-font', {
                    '.default-font': {
                        'color': '${color}',
                        'background': '${background}',
                        'font-size': '${fontSize} !important',
                        'line-height': '${spacing} !important',
                        '-webkit-hyphens': '${hyphenate ? 'auto' : 'manual'}',
                        '-webkit-hyphenate-limit-before': 3,
                        '-webkit-hyphenate-limit-after': 2,
                        '-webkit-hyphenate-limit-lines': 2
                    },
                    '.default-font code, .default-font pre': {
                        '-webkit-hyphens': 'none'
                    },
                    'p': {
                        'text-align': '${justify ? 'justify' : 'inherit'}'
                    },
                    '.default-font p': {
                        'font-size': '${fontSize} !important',
                        'line-height': '${spacing} !important'
                    },
                    '.default-font a:link': { color: '${link}' }
                })
                rendition.themes.select('default-font')`)
        },
        layout => {
            settings.set_string('layout', layout)
            const value = defaultLayouts[layout]
            this.scriptRun(`
                rendition.flow('${value === 'scrolled-doc' ? 'scrolled-doc' : 'paginated'}')`)
            if (value !== 'scrolled-doc')
                this.scriptRun(`rendition.spread('${value === 'single' ? 'none' : 'auto'}')`)
        })
        this.viewPopover.loadSettings(
            settings.get_string('font'),
            settings.get_double('spacing'),
            settings.get_double('margin'),
            settings.get_double('brightness'),
            settings.get_string('theme'),
            settings.get_string('layout'))
        
        settings.connect('changed::theme', () => {
            const theme = settings.get_string('theme')
            if (theme !== this.viewPopover.theme) this.viewPopover.theme = theme
        })

        this.scriptRun(`setupRendition()`)
    }
    handleAction({ type, payload }) {
        switch (type) {
            case 'book-error':
                this.bookError()
                break
            case 'book-ready':
                this.bookReady()
                break
            case 'book-displayed':
                this.bookDisplayed()
                break
            case 'cover':
                this.scriptGet('book.package.metadata', metadata => {
                    if (payload) this.scriptGet('coverBase64', coverBase64 =>
                        this.buildProperties(metadata, coverBase64))
                    else this.buildProperties(metadata)
                })
                break
            case 'locations-generated':
                this.scriptGet('locations', locations =>
                    this.cache.set('locations', locations))
            case 'locations-ready':
                this.navbar.setReady(payload)
                this.scriptGet(`book.spine.items.length`, n => {
                    if (n < 60)
                        this.scriptGet(
                            `book.spine.items.map(x => book.locations
                                .percentageFromCfi('epubcfi(' + x.cfiBase + '!/0)'))`,
                            sectionMarks => this.navbar.setSectionMarks(sectionMarks))
                })
                break
            case 'relocated':
                this.bookmarksPopover.update(payload.cfi)
                this.navbar.setAtStart(payload.atStart)
                this.navbar.setAtEnd(payload.atEnd)
                this.storage.set('lastLocation', payload.cfi)
                break
            case 'update-slider':
                this.navbar.updateSlider(payload)
                break
            case 'link-external':
                Gtk.show_uri_on_window(null, payload, Gdk.CURRENT_TIME)
                break
            case 'link-internal':
                this.navbar.pushHistory(payload)
                break
            case 'section':
                this.tocPopover.selectSection(payload)
                break
            case 'search-results':
                this.scriptGet('searchResults', results =>
                    this.searchPopover.loadResults(results, payload))
                break
            case 'lookup': {
                const { position, text, cfiRange } = payload
                const [, winHeight] = this.window.get_size()
                const fromTop = position.bottom > winHeight / 2
                const y = fromTop ? position.top : position.bottom
                this.lookupPopover = new LookupPopover(
                    this.webView, { x: position.left, y }, fromTop,
                    () => {
                        this.scriptRun(`clearSelection()`)
                        this.scriptRun(`dispatch({
                            type: 'annotation-add',
                            payload: ${JSON.stringify(payload)}
                        })`)
                    },
                    () => Gtk.Clipboard
                        .get_default(Gdk.Display.get_default())
                        .set_text(text, -1)
                    )
                getDictionaryEntry(text).then(html =>
                    this.scriptRun(`queryDictionary("${encodeURI(html)}", "${encodeURI(text)}")`))
                break
            }
            case 'lookup-again':
                getDictionaryEntry(payload).then(html =>
                    this.scriptRun(`queryDictionary("${encodeURI(html)}")`))
                break
            case 'lookup-results':
                this.scriptGet(`lookupResults`, results => {
                    this.lookupPopover.loadResults(
                        `<b>${results.word}</b> ${results.pronunciation || ''}\n`
                        + `${results.defs.join('\n')}`, results.word)
                })
                break
            case 'lookup-error':
                this.lookupPopover.loadResults(_('No definitions found.'))
                break
            case 'annotation-add':
                this.scriptGet('annotation', ({ text, cfiRange }) => {
                    const color = settings.get_string('highlight')
                    const data = { color, text }
                    this.scriptRun(`addAnnotation('${cfiRange}', '${color}')`)
                    
                    const label = coloredText(color, text)
                    this.annotationsPopover.add(label, null, cfiRange, data)
                    this.scriptRun(`dispatch({
                        type: 'annotation-menu',
                        payload: ${JSON.stringify(payload)}
                    })`)
                })
                break
            case 'annotation-menu': {
                const { position, cfiRange } = payload
                const [, winHeight] = this.window.get_size()
                const fromTop = position.bottom > winHeight / 2
                const y = fromTop ? position.top : position.bottom
                
                const data = this.annotationsPopover.getData(cfiRange)
                new AnnotationPopover(
                    this.webView, { x: position.left, y }, fromTop,
                    () => {
                        this.annotationsPopover.remove(cfiRange)
                    },
                    () => Gtk.Clipboard
                        .get_default(Gdk.Display.get_default())
                        .set_text(data.text, -1),
                    data.color,
                    color => {
                        settings.set_string('highlight', color)
                        data.color = color
                        this.scriptRun(`
                            addAnnotation('${cfiRange}', '${color}')`)
                        const text = coloredText(color, data.text)
                        this.annotationsPopover.setLabel(cfiRange, text)
                    },
                    data.note,
                    note => {
                        data.note = note
                        this.annotationsPopover.setLabel2(cfiRange, note)
                    })
                break
            }
        }
    }
    addShortcut(accels, name, func) {
        const action = new Gio.SimpleAction({ name })
        action.connect('activate', func)
        this.window.add_action(action)
        this.application.set_accels_for_action(`win.${name}`, accels)
    }
    buildToc(toc, onChange) {
        const button = new Gtk.MenuButton({
            image: new Gtk.Image({ icon_name: 'view-list-symbolic' }),
            valign: Gtk.Align.CENTER,
            tooltip_text: _('Table of contents'),
            visible: true
        })
        this.tocPopover = new TocPopover(toc, button, onChange)
        button.popover = this.tocPopover.widget
        this.headerBar.pack_start(button)
        this.addShortcut(['F9'], 'toc-popover', () =>
            button.active = !button.active)
    }
    buildSearch(onChange, onSearch) {
        const button = new Gtk.MenuButton({
            image: new Gtk.Image({ icon_name: 'system-search-symbolic' }),
            valign: Gtk.Align.CENTER,
            tooltip_text: _('Find in book'),
            visible: true
        })
        this.searchPopover = new SearchPopover(button, onChange, onSearch)
        button.popover = this.searchPopover.widget
        this.headerBar.pack_end(button)
        this.addShortcut(['<Control>f', 'slash'], 'search-popover', () =>
            button.active = !button.active)
    }
    buildView(...args) {
        const button = new Gtk.MenuButton({
            image: new Gtk.Image({ icon_name: 'font-select-symbolic' }),
            valign: Gtk.Align.CENTER,
            tooltip_text: _('Set font, theme, and layout'),
            visible: true
        })
        this.viewPopover = new ViewPopover(...args)
        button.popover = this.viewPopover.widget
        this.headerBar.pack_end(button)

        this.addShortcut(['minus', '<Control>minus'], 'font-dec', () =>
            this.viewPopover.decFont())
        this.addShortcut(['plus', 'equal', '<Control>plus', '<Control>equal'],
            'font-inc', () => this.viewPopover.incFont())
    }
    buildBookmarks(onActivate, onAdd, onChange) {
        const button = new Gtk.MenuButton({
            image: new Gtk.Image({ icon_name: 'user-bookmarks-symbolic' }),
            valign: Gtk.Align.CENTER,
            tooltip_text: _('Bookmarks'),
            visible: true
        })
        this.bookmarksPopover = new BookmarksPopover(button, onActivate, onAdd, onChange,
            canAdd =>
                button.image = canAdd
                    ? new Gtk.Image({ icon_name: 'non-starred-symbolic' })
                    : new Gtk.Image({ icon_name: 'starred-symbolic' }))
        button.popover = this.bookmarksPopover.widget
        this.headerBar.pack_start(button)
        
        this.addShortcut(['<Control>b'], 'bookmark-popover', () =>
            button.active = !button.active)
        this.addShortcut(['<Control>d'], 'bookmark-add', () =>
            this.bookmarksPopover.doButtonAction())
    }
    buildAnnotations(onActivate, onChange, onRemove) {
        const button = new Gtk.MenuButton({
            image: new Gtk.Image({ icon_name: 'document-edit-symbolic' }),
            valign: Gtk.Align.CENTER,
            tooltip_text: _('Annotations'),
            visible: true
        })
        this.annotationsPopover = new AnnotationsPopover(button, onActivate, onChange, onRemove)
        button.popover = this.annotationsPopover.widget
        this.headerBar.pack_start(button)
    }
    buildNavbar(onSlide, onPrev, onNext, onBack) {
        this.navbar = new Navbar(onSlide, onPrev, onNext, onBack)
        this.navbar.widget.show_all()
        if (!settings.get_boolean('show-navbar')) this.navbar.widget.hide()
        this.navbar.setPending()
        this.container.pack_end(this.navbar.widget, false, true, 0)
        
        this.addShortcut(['p', 'h'], 'go-prev', onPrev)
        this.addShortcut(['n', 'l'], 'go-next', onNext)

        const isPaginated = () =>
            defaultLayouts[this.viewPopover.layout] === 'paginated'

        const lineHeight = () =>
            (this.viewPopover.font.desc.get_size() / Pango.SCALE)
                * this.viewPopover.spacing / 0.75 // 1px = 0.75pt

        this.addShortcut(['k'], 'go-up',
            () => isPaginated()
                ? onPrev()
                : this.scriptRun(`
                    if (atTop()) prevBottom()
                    else window.scrollBy(0, -${lineHeight()})`))
        this.addShortcut(['j'], 'go-down',
            () => isPaginated()
                ? onNext()
                : this.scriptRun(`
                    if (atBottom()) rendition.next()
                    else window.scrollBy(0, ${lineHeight()})`))

        this.addShortcut(['<Alt>Left'], 'go-back', this.navbar.goBack)
    }
    buildMenu() {
        const button = new Gtk.MenuButton({
            image: new Gtk.Image({ icon_name: 'open-menu-symbolic' }),
            valign: Gtk.Align.CENTER,
            visible: true
        })
        const popover = new Gtk.Popover()
        button.popover = popover
        
        this.menu = new Gio.Menu()
        
        const section1 = new Gio.Menu()
        section1.append(_('Fullscreen'), 'win.fullscreen')
        section1.append(_('Reading Progress Bar'), 'win.navbar')
        section1.append(_('Enable Dictionary'), 'win.lookup')
        this.menu.append_section(null, section1)

        const section2 = new Gio.Menu()
        section2.append(_('Open…'), 'app.open')
        this.menu.append_section(null, section2)

        const section3 = new Gio.Menu()
        section3.append(_('Keyboard Shortcuts'), 'app.shortcuts')
        section3.append(_('About Foliate'), 'app.about')
        this.menu.append_section(null, section3)

        button.set_menu_model(this.menu)
        this.headerBar.pack_end(button)
        this.addShortcut(['F10'], 'menu', () => button.active = !button.active)

        const fullscreenAction = new Gio.SimpleAction({
            name: 'fullscreen',
            state: new GLib.Variant('b', false)
        })
        fullscreenAction.connect('activate', () => {
            let state = fullscreenAction.get_state().get_boolean()
            if (state) {
                this.window.unfullscreen()
                fullscreenAction.set_state(new GLib.Variant('b', false))
            } else {
                this.window.fullscreen()
                fullscreenAction.set_state(new GLib.Variant('b', true))
            }
        })
        this.window.add_action(fullscreenAction)
        this.application.set_accels_for_action('win.fullscreen', ['F11'])

        const navbarAction = new Gio.SimpleAction({
            name: 'navbar',
            state: new GLib.Variant('b', settings.get_boolean('show-navbar'))
        })
        navbarAction.connect('activate', () => {
            let state = navbarAction.get_state().get_boolean()
            if (state) {
                this.navbar.widget.hide()
                navbarAction.set_state(new GLib.Variant('b', false))
            } else {
                this.navbar.widget.show()
                navbarAction.set_state(new GLib.Variant('b', true))
            }
            settings.set_boolean('show-navbar', !state)
        })
        this.window.add_action(navbarAction)

        const lookupAction = new Gio.SimpleAction({
            name: 'lookup',
            state: new GLib.Variant('b', settings.get_boolean('lookup-enabled'))
        })
        lookupAction.connect('activate', () => {
            let state = lookupAction.get_state().get_boolean()
            if (state) {
                this.scriptRun(`lookupEnabled = false`)
                lookupAction.set_state(new GLib.Variant('b', false))
            } else {
                this.scriptRun(`lookupEnabled = true`)
                lookupAction.set_state(new GLib.Variant('b', true))
            }
            settings.set_boolean('lookup-enabled', !state)
        })
        this.window.add_action(lookupAction)
    }
    buildProperties(metadata, coverBase64) {
        const section = new Gio.Menu()
        section.append(_('About This Book'), 'win.properties')
        this.menu.prepend_section(null, section)
        
        const action = new Gio.SimpleAction({ name: 'properties' })
        action.connect('activate', () => {
            let image
            if (coverBase64) {
                const data = GLib.base64_decode(coverBase64)
                const imageStream = Gio.MemoryInputStream.new_from_bytes(data)
                const pixbuf = GdkPixbuf.Pixbuf.new_from_stream(imageStream, null)
                
                const width = 200
                const ratio = width / pixbuf.get_width()
                const height = parseInt(pixbuf.get_height() * ratio, 10)
                
                image = Gtk.Image.new_from_pixbuf(
                    pixbuf.scale_simple(width, height, GdkPixbuf.InterpType.BILINEAR))
            }
            const window = new Gtk.Dialog({ modal: true })
            const headerBar = new Gtk.HeaderBar({
                title: _('About This Book'),
                show_close_button: true,
                has_subtitle: false
            })
            window.set_titlebar(headerBar)
            
            const dataBox = new Gtk.Box({
                orientation: Gtk.Orientation.VERTICAL, spacing: 10
            })
            const title = new Gtk.Label({
                label: `<big><b>${metadata.title}</b></big>`,
                use_markup: true,
                selectable: true,
                ellipsize: Pango.EllipsizeMode.END,
                lines: 3,
                valign: Gtk.Align.START,
                halign: Gtk.Align.START,
                xalign: 0
            })
            title.set_line_wrap(true)
            dataBox.pack_start(title, false, true, 0)
            
            if (metadata.creator) {
                const creator = new Gtk.Label({
                    label: metadata.creator,
                    selectable: true,
                    ellipsize: Pango.EllipsizeMode.END,
                    lines: 3,
                    valign: Gtk.Align.START,
                    halign: Gtk.Align.START,
                    xalign: 0
                })
                creator.set_line_wrap(true)
                dataBox.pack_start(creator, false, true, 0)
            }
            if (metadata.description) {
                const webView = new Webkit.WebView({
                    hexpand: true,
                    vexpand: true
                })
                webView.connect('context-menu', () => true)

                const theme = this.viewPopover.theme
                const { color, background, invert } = this.themes[theme]

                webView.load_html(
                    `<style>
                        html {
                            background: ${background};
                            color: ${color};
                            filter: ${invert ? 'invert(1) hue-rotate(180deg)' : 'none'};
                        }
                    </style>` + metadata.description, null)

                const frame = new Gtk.Frame()
                frame.add(webView)
                dataBox.pack_start(frame, true, true, 0)
            }
            
            const grid = new Gtk.Grid({
                column_spacing: 10, row_spacing: 10,
                valign: Gtk.Align.CENTER
            })
            
            dataBox.pack_end(grid, false, true, 0)
            
            let row = 0
            for (const key in metadata) {
                if (!metadata[key]) continue
                
                const labelText = {
                    publisher: _('Publisher'),
                    pubdate: _('Publication Date'),
                    modified_date: _('Modified Date'),
                    language: _('Language'),
                    rights: _('Copyright'),
                    identifier: _('Identifier')
                }
                if (key in labelText) {
                    const label = new Gtk.Label({
                        label: labelText[key],
                        ellipsize: Pango.EllipsizeMode.END,
                        valign: Gtk.Align.START,
                        halign: Gtk.Align.END
                    })
                    label.get_style_context().add_class('dim-label')
                    grid.attach(label, 0, row, 1, 1)
                    
                    const value = new Gtk.Label({
                        label: metadata[key],
                        selectable: true,
                        ellipsize: Pango.EllipsizeMode.END,
                        lines: 3,
                        valign: Gtk.Align.START,
                        halign: Gtk.Align.START,
                        xalign: 0
                    })
                    value.set_line_wrap(true)
                    grid.attach(value, 1, row, 1, 1)
                    row++
                }
            }

            const coverBox = new Gtk.Box({ spacing: 18 })
            if (!metadata.description) {
                coverBox.valign = Gtk.Align.CENTER
                coverBox.halign = Gtk.Align.CENTER
                if (!image) dataBox.pack_end(new Gtk.Separator, false, true, 10)
            } else if (image) image.valign = Gtk.Align.START
            if (image) coverBox.pack_start(image, false, true, 0)
            coverBox.pack_end(dataBox, false, true, 0)
            
            const container = window.get_content_area()
            container.border_width = 18
            container.pack_start(coverBox, true, true, 0)

            window.set_transient_for(this.window)
            window.show_all()
            title.select_region(-1, -1)
        })
        this.window.add_action(action)
    }
}
function main(argv) {
    const themes = new Storage('themes', 'config')

    const application = new Gtk.Application({
        application_id: pkg.name,
        flags: Gio.ApplicationFlags.HANDLES_OPEN
    })
    const appWindows = new Set()
    const addWindow = uri => {
        const appWindow = new BookViewerWindow(
            application,
            settings.get_int('window-width'),
            settings.get_int('window-height'),
            uri,
            themes.get('themes')
        )
        appWindows.add(appWindow)
        appWindow.window.connect('destroy', () => appWindows.delete(appWindow))
        appWindow.window.present()
        application.add_window(appWindow.window)
    }

    application.connect('open', (app, files) =>
        files.map(file => file.get_uri()).forEach(addWindow))
    application.connect('activate', () => addWindow())

    const actionOpen = new Gio.SimpleAction({ name: 'open' })
    actionOpen.connect('activate', () => {
        const allFiles = new Gtk.FileFilter()
        allFiles.set_name(_('All files'))
        allFiles.add_pattern('*')

        const epubFiles = new Gtk.FileFilter()
        epubFiles.set_name(_('EPUB files'))
        epubFiles.add_mime_type('application/epub+zip')

        const dialog = new Gtk.FileChooserNative()
        dialog.add_filter(epubFiles)
        dialog.add_filter(allFiles)

        const response = dialog.run()
        if (response === Gtk.ResponseType.ACCEPT) {
            const emptyWindows = Array.from(appWindows).filter(x => x.canOpen)
            if (emptyWindows.length) emptyWindows[0].open(dialog.get_filename())

            else addWindow(dialog.get_filename())
        }
    })
    application.add_action(actionOpen)
    application.set_accels_for_action('app.open', ['<Control>o'])

    const touchpadSettings = new Gio.Settings({
        schema_id: 'org.gnome.desktop.peripherals.touchpad'
    })
    let naturalScroll = touchpadSettings.get_boolean('natural-scroll')
    touchpadSettings.connect('changed::natural-scroll', () =>
        naturalScroll = touchpadSettings.get_boolean('natural-scroll'))

    const actionShortcuts = new Gio.SimpleAction({ name: 'shortcuts' })
    actionShortcuts.connect('activate', () => {
        const shortcutsGroups = [
            {
                title: _('General'),
                shortcuts: [
                    { accelerator: 'F9', title: _('Show table of contents') },
                    { accelerator: '<control>b', title: _('Show bookmarks') },
                    { accelerator: '<control>d', title: _('Bookmark current location') },
                    { accelerator: '<control>f', title: _('Find in book') },
                    { accelerator: 'F10', title: _('Show menu') },
                    { accelerator: '<control>q', title: _('Quit') }
                ]
            },
            {
                title: _('Navigation'),
                shortcuts: [
                    { accelerator: 'Right n', title: _('Go to the next page') },
                    { accelerator: 'Left p', title: _('Go to the previous page') },
                    { accelerator: '<alt>Left', title: _('Go back to previous location') }
                ]
            },
            {
                title: _('View'),
                shortcuts: [
                    { accelerator: 'plus', title: _('Increase font size') },
                    { accelerator: 'minus', title: _('Decrease font size') },
                    { accelerator: 'F11', title: _('Toggle fullscreen') }
                ]
            },
            {
                title: _('Touchpad Gestures'),
                shortcuts: [
                    // I can't find where to access the enums in GJS,
                    // so just use ints for now
                    { shortcut_type: naturalScroll ? 5 : 6, title: _('Go to the next page') },
                    { shortcut_type: naturalScroll ? 6 : 5, title: _('Go to the previous page') },
                    { shortcut_type: 2, title: _('Zoom in') },
                    { shortcut_type: 1, title: _('Zoom out') }
                ]
            }
        ]
        const shortcutsWindow = new Gtk.ShortcutsWindow({ modal: true })
        const shortcutsSection = new Gtk.ShortcutsSection(
            { 'section-name': 'shortcuts', visible: true })

        for (const { title, shortcuts } of shortcutsGroups) {
            const shortcutsGroup = new Gtk.ShortcutsGroup({ title, visible: true })
            for (const shortcut of shortcuts) {
                shortcutsGroup.add(new Gtk.ShortcutsShortcut(
                    { ... shortcut, visible: true }))
            }
            shortcutsSection.add(shortcutsGroup)
        }
        shortcutsWindow.add(shortcutsSection)
        shortcutsWindow.set_transient_for(application.active_window)
        shortcutsWindow.show()
    })
    application.add_action(actionShortcuts)
    application.set_accels_for_action('app.shortcuts', ['<Control>question'])

    const actionAbout = new Gio.SimpleAction({ name: 'about' })
    actionAbout.connect('activate', () => {
        const aboutDialog = new Gtk.AboutDialog({
            authors: ['John Factotum'],
            artists: ['John Factotum'],
            program_name: _('Foliate'),
            comments: _('A simple eBook viewer'),
            logo_icon_name: pkg.name,
            version: pkg.version,
            license_type: Gtk.License.GPL_3_0,
            website: 'https://johnfactotum.github.io/foliate/',
            modal: true
        })
        aboutDialog.set_transient_for(application.active_window)
        aboutDialog.show()
    })
    application.add_action(actionAbout)

    const actionQuit = new Gio.SimpleAction({ name: 'quit' })
    actionQuit.connect('activate', () =>
        [...appWindows].forEach(window => window.window.close()))
    application.add_action(actionQuit)
    application.set_accels_for_action('app.quit', ['<Control>q'])

    return application.run(argv)
}
