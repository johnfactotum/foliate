import Gtk from 'gi://Gtk'
import Adw from 'gi://Adw'
import GObject from 'gi://GObject'
import Gio from 'gi://Gio'
import GLib from 'gi://GLib'
import Gdk from 'gi://Gdk'
import GdkPixbuf from 'gi://GdkPixbuf'
import { gettext as _ } from 'gettext'

// convert to camel case
const camel = x => x.toLowerCase().replace(/[-:](.)/g, (_, g) => g.toUpperCase())

export const memoize = f => {
    const memory = new Map()
    return obj => {
        if (memory.has(obj)) return memory.get(obj)
        else {
            const result = f(obj)
            memory.set(obj, result)
            return result
        }
    }
}

export const wait = ms => new Promise(resolve => setTimeout(resolve, ms))

export const debounce = (f, wait, immediate) => {
    let timeout
    return (...args) => {
        const later = () => {
            timeout = null
            if (!immediate) f(...args)
        }
        const callNow = immediate && !timeout
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(later, wait)
        if (callNow) f(...args)
    }
}

export const listDir = function* (path, attributes = 'standard::name') {
    const dir = Gio.File.new_for_path(path)
    if (!GLib.file_test(path, GLib.FileTest.IS_DIR)) return
    const children = dir.enumerate_children(attributes, Gio.FileQueryInfoFlags.NONE, null)
    let info
    while ((info = children.next_file(null)) != null) try {
        const name = info.get_name()
        yield { file: dir.get_child(name), name, info }
    } catch (e) {
        console.error(e)
    }
}

const decoder = new TextDecoder()
export const readFile = (file, defaultValue = '') => {
    try {
        const [success, data/*, tag*/] = file.load_contents(null)
        if (success) return decoder.decode(data)
        else throw new Error()
    } catch (e) {
        console.debug(e)
        return defaultValue
    }
}
export const readJSONFile = file => JSON.parse(readFile(file, '{}'))

export const JSONStorage = GObject.registerClass({
    GTypeName: 'FoliateStorage',
    Signals: {
        'modified': {},
        'externally-modified': {},
    },
}, class extends GObject.Object {
    #modified
    #file
    #indent
    #data
    #debouncedWrite
    constructor(path, name, indent) {
        super()
        this.#indent = indent
        this.#file = Gio.File.new_for_path(GLib.build_filenamev(
            [path, `${encodeURIComponent(name)}.json`]))
        this.#data = this.#read()
        const monitor = this.#file.monitor(Gio.FileMonitorFlags.NONE, null)
        monitor.connect('changed', () => {
            if (this.#getModified() > this.#modified) {
                console.debug('Externally modified: ' + this.#file.get_path())
                this.#data = this.#read()
                this.emit('externally-modified')
            }
        })
        this.#debouncedWrite = debounce(this.#write.bind(this), 1000)
    }
    #getModified() {
        try {
            const info = this.#file.query_info('time::modified',
                Gio.FileQueryInfoFlags.NONE, null)
            return info.get_attribute_uint64('time::modified')
        } catch (e) {
            console.debug(e)
            this.#data = {}
            this.emit('externally-modified')
            return null
        }
    }
    #read() {
        this.#modified = this.#getModified()
        return readJSONFile(this.#file)
    }
    #write(data) {
        console.debug('Writing to ' + this.#file.get_path())
        const parent = this.#file.get_parent().get_path()
        const mkdirp = GLib.mkdir_with_parents(parent, parseInt('0755', 8))
        if (mkdirp === 0) {
            const contents = JSON.stringify(data, null, this.#indent)
            const [success/*, tag*/] = this.#file.replace_contents(contents,
                null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null)
            if (success) {
                this.#modified = this.#getModified()
                this.emit('modified')
                return true
            }
        }
        throw new Error('Could not save file')
    }
    get(property, defaultValue) {
        return property in this.#data ? this.#data[property] : defaultValue
    }
    set(property, value) {
        this.#data[property] = value
        this.#debouncedWrite(this.#data)
    }
    clear() {
        try {
            this.#file.delete(null)
        } catch (e) {
            console.warn(e)
        }
    }
    get path() {
        return this.#file.get_path()
    }
    export() {
        return this.#data
    }
})

export const getClipboard = () => Gdk.Display.get_default().get_clipboard()

export const setClipboardText = (text, overlay) => {
    getClipboard().set_content(Gdk.ContentProvider.new_for_value(text))
    if (overlay) addClipboardToast(overlay)
}

export const getClipboardText = () => new Promise((resolve, reject) => {
    const clipboard = getClipboard()
    clipboard.read_text_async(null, (_, res) => {
        try {
            resolve(clipboard.read_text_finish(res))
        } catch (e) {
            reject(e)
        }
    })
})

export const addClipboardToast = overlay =>
    overlay.add_toast(new Adw.Toast({ title: _('Copied to clipboard'), timeout: 1 }))

export const base64ToPixbuf = base64 => {
    if (!base64) return null
    try {
        const data = GLib.base64_decode(base64)
        const imageStream = Gio.MemoryInputStream.new_from_bytes(data)
        return GdkPixbuf.Pixbuf.new_from_stream(imageStream, null)
    } catch (e) {
        console.warn(e)
        return null
    }
}

export const connect = (object, obj) => {
    for (const [key, val] of Object.entries(obj)) object.connect(key, val)
    return object
}

export const disconnect = (object, ids) => {
    if (!object || !ids) return
    for (const id of ids) object.disconnect(id)
}

const connections = new WeakMap()

export const connectWith = (a, b, obj) => {
    if (!connections.has(a)) connections.set(a, new Map())
    connections.get(a).set(b, Array.from(Object.entries(obj), ([k, v]) => b.connect(k, v)))
    return b
}

export const disconnectWith = (a, b) => {
    for (const id of connections.get(a).get(b)) b.disconnect(id)
}

export const settings = name => {
    const schema = pkg.name + (name ? '.' + name : '')
    try { return new Gio.Settings({ schema }) } catch {}
}

export const bindSettings = (name, target, arr) => {
    const s = settings(name)
    if (!s) return
    for (const prop of arr)
        s.bind(prop, target, prop, Gio.SettingsBindFlags.DEFAULT)
    return s
}

export const makeParams = obj => Object.fromEntries(Object.entries(obj).map(([k, v]) => {
    const type = typeof v === 'string' ? v : 'object'
    const flags = GObject.ParamFlags.READWRITE
    return [k, GObject.ParamSpec[type](k, k, k, flags, ...(
        type === 'string' ? ['']
        : type === 'boolean' ? [false]
        : type === 'double' ? [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 0]
        : type === 'int' ? [GLib.MININT32, GLib.MAXINT32, 0]
        : type === 'uint' ? [0, GLib.MAXUINT32, 0]
        : type === 'object' ? [GObject.Object.$gtype, null]
        : [v, null]
    ))]
}))

export const makeDataClass = (name, params) => {
    const keys = Object.keys(params)
    return GObject.registerClass({
        GTypeName: name,
        Properties: makeParams(params),
    }, class extends GObject.Object {
        get keys() {
            return keys
        }
        toJSON() {
            return Object.fromEntries(keys.map(k => [k, this[k]]))
        }
        toCamel() {
            return Object.fromEntries(keys.map(k => [camel(k), this[k]]))
        }
        connectAll(f) {
            return keys.map(k => this.connect(`notify::${k}`, f))
        }
        bindProperties(obj) {
            const flag = GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE
            for (const [prop, [target, targetProp, invert]] of Object.entries(obj))
                this.bind_property(prop, target, targetProp,
                    flag | (invert ? GObject.BindingFlags.INVERT_BOOLEAN : 0))
        }
        bindSettings(name) {
            return bindSettings(name, this, keys)
        }
        unbindSettings() {
            for (const k of keys) Gio.Settings.unbind(this, k)
        }
    })
}

export const addSimpleActions = (actions, group = new Gio.SimpleActionGroup()) => {
    for (const [name, func] of Object.entries(actions)) {
        const action = new Gio.SimpleAction({ name })
        action.connect('activate', func)
        group.add_action(action)
    }
    return group
}

export const addPropertyActions = (obj, props, group = new Gio.SimpleActionGroup()) => {
    for (const prop of props) group.add_action(Gio.PropertyAction.new(prop, obj, prop))
    return group
}

export const addMethods = (obj, { actions, props, signals }) => {
    const group = typeof obj.add_action === 'function' ? obj : new Gio.SimpleActionGroup()
    if (actions) addSimpleActions(Object.fromEntries(
        actions.map(name => [name, () => obj[camel(name)]()])), group)
    if (props) addPropertyActions(obj, props, group)
    if (signals) connect(obj, Object.fromEntries(
        signals.map(s => [s, obj[camel(`connect-${s}`)].bind(obj)])))
    return group
}

export const addShortcuts = (shortcuts, controller = new Gtk.ShortcutController()) => {
    for (const [accel, action] of Object.entries(shortcuts))
        controller.add_shortcut(new Gtk.Shortcut({
            action: typeof action === 'string'
                ? Gtk.NamedAction.new(action)
                : Gtk.CallbackAction.new(action),
            trigger: Gtk.ShortcutTrigger.parse_string(accel),
        }))
    return controller
}

// gliter, short for GList Iterator
export const gliter = model => ({
    [Symbol.iterator]: () => {
        let i = 0
        return {
            next: () => {
                const item = model.get_item(i++)
                if (item) return { value: [i - 1, item] }
                else return { done: true }
            },
        }
    },
})

export const list = (arr, item) => {
    const store = new Gio.ListStore()
    for (const el of arr) store.append(new item(el))
    return store
}

export const tree = (arr, item, autoexpand = true) => {
    const root = new Gio.ListStore()
    const makeItems = (arr, list) => {
        for (const el of arr) {
            const subitems = Array.isArray(el.subitems)
                ? makeItems(el.subitems, new Gio.ListStore())
                : (el.subitems ?? null)
            list.append(new item({ ...el, subitems }))
        }
        return list
    }
    if (arr) makeItems(arr, root)
    return Gtk.TreeListModel.new(root, false, autoexpand, item => item.subitems ?? null)
}

// go through all child widgets
export const walk = (widget, callback) => {
    const f = widget => {
        callback(widget)
        let child = widget.get_first_child()
        while (child != null) {
            f(child)
            child = child.get_next_sibling()
        }
    }
    f(widget)
}

export const getGtkDir = dir =>
    dir === 'rtl' ? Gtk.TextDirection.RTL : Gtk.TextDirection.LTR

// recursively set direction
export const setDirection = (widget, dir) => {
    if (typeof dir === 'string') dir = getGtkDir(dir)
    walk(widget, widget => widget.set_direction(dir))
}

export const RGBA = color => {
    const rgba = new Gdk.RGBA()
    rgba.parse(color)
    return rgba
}

const invert = rgba => {
    rgba.red = 1 - rgba.red
    rgba.green = 1 - rgba.green
    rgba.blue = 1 - rgba.blue
    return rgba
}

// replicate CSS's hue-rotate filter
const hueRotate = (rgba, deg) => {
    const r = rgba.red * 255, g = rgba.green * 255, b = rgba.blue * 255
    const lumR = 0.2126, lumG = 0.7152, lumB = 0.0722
    const hueRotateR = 0.143, hueRotateG = 0.140, hueRotateB = 0.283
    const rad = deg * Math.PI / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    ;[rgba.red, rgba.green, rgba.blue] = [
        r * (lumR + (1 - lumR) * cos - lumR * sin)
            + g * (lumG - lumG * cos - lumG * sin)
            + b * (lumB - lumB * cos + (1 - lumB) * sin),
        r * (lumR - lumR * cos + hueRotateR * sin)
            + g * (lumG + (1 - lumG) * cos + hueRotateG * sin)
            + b * (lumB - lumB * cos - hueRotateB * sin),
        r * (lumR - lumR * cos - (1 - lumR) * sin)
            + g * (lumG - lumG * cos + lumG * sin)
            + b * (lumB + (1 - lumB) * cos + lumB * sin),
    ].map(x => Math.max(0, Math.min(255, x)) / 255)
    return rgba
}

export const invertColor = color => hueRotate(invert(RGBA(color)), 180).to_string()

export const addStyle = (widget, style) => {
    const cssProvider = new Gtk.CssProvider()
    cssProvider.load_from_data(style, -1)
    const ctx = widget.get_style_context()
    ctx.add_provider(cssProvider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION)
    return widget
}

export const addClass = (widget, ...classes) => {
    for (const c of classes) widget.add_css_class(c)
    return widget
}
