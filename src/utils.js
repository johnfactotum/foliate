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

// timers polyfill
const Mainloop = imports.mainloop
var setTimeout = (func, delay, ...args) =>
    Mainloop.timeout_add(delay, () => (func(...args), false), null)
var clearTimeout = id => id ? Mainloop.source_remove(id) : null
var setInterval = (func, delay, ...args) =>
    Mainloop.timeout_add(delay, () => (func(...args), true), null)
var clearInterval = id => id ? Mainloop.source_remove(id) : null

var debounce = (f, wait, immediate) => {
    let timeout
    return (...args) => {
        const later = () => {
            timeout = null
            if (!immediate) f(...args)
        }
        const callNow = immediate && !timeout
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
        if (callNow) f(...args)
    }
}

const { Gtk, Gio, GLib, GObject, Gdk, GdkPixbuf } = imports.gi
const ByteArray = imports.byteArray
const ngettext = imports.gettext.ngettext

var LOG_DOMAIN = 'Foliate'

var debug = message =>
    GLib.log_structured(LOG_DOMAIN, GLib.LogLevelFlags.LEVEL_DEBUG, {
        MESSAGE: message,
        SYSLOG_IDENTIFIER: pkg.name,
    })

var error = message =>
    GLib.log_structured(LOG_DOMAIN, GLib.LogLevelFlags.LEVEL_WARNING, {
        MESSAGE: message,
        SYSLOG_IDENTIFIER: pkg.name,
    })

var markupEscape = text => text ? GLib.markup_escape_text(text, -1) : ''

var mimetypes = {
    directory: 'inode/directory',
    json: 'application/json',
    xml: 'application/xml',
    epub: 'application/epub+zip',
    mobi: 'application/x-mobipocket-ebook',
    kindle: 'application/vnd.amazon.mobi8-ebook',
    kindleAlias: 'application/x-mobi8-ebook'
}

const flatpakSpawn = GLib.find_program_in_path('flatpak-spawn')
var execCommand = (argv, input = null, waitCheck, token, inFlatpak) =>
    new Promise((resolve, reject) => {
        if (flatpakSpawn && !inFlatpak) argv = [flatpakSpawn, '--host', ...argv]
        const flags = input
            ? Gio.SubprocessFlags.STDIN_PIPE | Gio.SubprocessFlags.STDOUT_PIPE
            : Gio.SubprocessFlags.STDOUT_PIPE

        try {
            const launcher = new Gio.SubprocessLauncher({ flags })
            launcher.setenv('G_MESSAGES_DEBUG', '', true)

            const proc = launcher.spawnv(argv)
            proc.communicate_utf8_async(input, null, (proc, res) => {
                try {
                    const [/*ok*/, stdout, /*stderr*/] =
                        proc.communicate_utf8_finish(res)
                    if (!stdout) reject()
                    else resolve(stdout)
                } catch (e) {
                    reject(e)
                }
            })
            if (waitCheck) proc.wait_check_async(null, ok =>
                ok ? resolve() : reject(new Error()))
            if (token) token.interrupt = () => {
                proc.send_signal(2)
                reject()
            }
        } catch (e) {
            reject(e)
        }
    })

// adapted from gnome-shell code
var recursivelyDeleteDir = dir => {
    const children = dir.enumerate_children('standard::name,standard::type',
        Gio.FileQueryInfoFlags.NONE, null)

    let info
    while ((info = children.next_file(null)) != null) {
        const type = info.get_file_type()
        const child = dir.get_child(info.get_name())
        if (type == Gio.FileType.REGULAR) child.delete(null)
        else if (type == Gio.FileType.DIRECTORY) recursivelyDeleteDir(child)
    }
    dir.delete(null)
}

var Storage = GObject.registerClass({
    GTypeName: 'FoliateStorage',
    Signals: {
        'externally-modified': { flags: GObject.SignalFlags.RUN_FIRST }
    }
}, class Storage extends GObject.Object {
    _init(type, key) {
        super._init()

        this.indent = type === 'config' ? 2 : null
        this._destination = Storage.getDestination(type, key)
        this._file = Gio.File.new_for_path(this._destination)
        this._data = this._read()
        this._monitor = this._file.monitor(Gio.FileMonitorFlags.NONE, null)
        this._monitor.connect('changed', () => {
            if (this._getModified() > this._modified) {
                this._data = this._read()
                this.emit('externally-modified')
            }
        })
        this._debouncedWrite = debounce(this._write.bind(this), 1000)
    }
    static getDestination(type, key) {
        const dataDir = type === 'cache' ? GLib.get_user_cache_dir()
            : type === 'config' ? GLib.get_user_config_dir()
            : GLib.get_user_data_dir()
        return GLib.build_filenamev([dataDir, pkg.name,
            `${encodeURIComponent(key)}.json`])
    }
    _getModified() {
        try {
            const info = this._file.query_info('time::modified',
                Gio.FileQueryInfoFlags.NONE, null)
            return info.get_attribute_uint64('time::modified')
        } catch (e) {
            return null
        }
    }
    _read() {
        this._modified = this._getModified()
        try {
            const [success, data, /*tag*/] = this._file.load_contents(null)
            if (success) return JSON.parse(data instanceof Uint8Array
                ? ByteArray.toString(data) : data.toString())
            else throw new Error()
        } catch (e) {
            return {}
        }
    }
    _write(data) {
        debug('writing to ' + this._file.get_path())
        const mkdirp = GLib.mkdir_with_parents(
            this._file.get_parent().get_path(), parseInt('0755', 8))
        if (mkdirp === 0) {
            const [success, /*tag*/] = this._file
                .replace_contents(JSON.stringify(data, null, this.indent),
                    null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null)
            this._modified = this._getModified()
            if (success) return true
        }
        throw new Error('Could not save file')
    }
    get(property, defaultValue) {
        return property in this._data ? this._data[property] : defaultValue
    }
    set(property, value) {
        this._data[property] = value
        this._debouncedWrite(this._data)
    }
    get data() {
        return JSON.parse(JSON.stringify(this._data))
    }
})

var disconnectAllHandlers = (object, signal) => {
    const [id, detail] = GObject.signal_parse_name(signal, object, true)
    while (true) {
        const handler = GObject.signal_handler_find(object,
            GObject.SignalMatchType.ID, id, detail, null, null, null)
        if (handler) object.disconnect(handler)
        else break
    }
}

var isExternalURL = href =>
    href.indexOf("mailto:") === 0 || href.indexOf("://") > -1

var RGBAFromString = color => {
    const rgba = new Gdk.RGBA()
    rgba.parse(color)
    return rgba
}

var alphaColor = (color, alpha) => {
    const rgba = RGBAFromString(color)
    rgba.alpha = alpha
    return rgba.to_string()
}

var invertColor = color => {
    const rgba = RGBAFromString(color)
    rgba.red = 1 - rgba.red
    rgba.green = 1 - rgba.green
    rgba.blue = 1 - rgba.blue
    return rgba.to_string()
}

var brightenColor = (color, brightness) => {
    const rgba = RGBAFromString(color)
    rgba.red = rgba.red * brightness
    rgba.green = rgba.green * brightness
    rgba.blue = rgba.blue * brightness
    return rgba.to_string()
}

// replicate CSS's hue-rotate filter
// adapted from https://jsfiddle.net/Camilo/dd6feyh6/
var hueRotateColor = (color, degree) => {
    const rgba = RGBAFromString(color)
    const r = rgba.red * 255
    const g = rgba.green * 255
    const b = rgba.blue * 255

    // identity matrix
    const matrix = [
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
    ]

    const lumR = 0.2126
    const lumG = 0.7152
    const lumB = 0.0722

    const hueRotateR = 0.143
    const hueRotateG = 0.140
    const hueRotateB = 0.283

    const cos = Math.cos(degree * Math.PI / 180)
    const sin = Math.sin(degree * Math.PI / 180)

    matrix[0] = lumR + (1 - lumR) * cos - lumR * sin
    matrix[1] = lumG - lumG * cos - lumG * sin
    matrix[2] = lumB - lumB * cos + (1 - lumB) * sin

    matrix[3] = lumR - lumR * cos + hueRotateR * sin
    matrix[4] = lumG + (1 - lumG) * cos + hueRotateG * sin
    matrix[5] = lumB - lumB * cos - hueRotateB * sin

    matrix[6] = lumR - lumR * cos - (1 - lumR) * sin
    matrix[7] = lumG - lumG * cos + lumG * sin
    matrix[8] = lumB + (1 - lumB) * cos + lumB * sin

    const clamp = num => Math.round(Math.max(0, Math.min(255, num)))

    rgba.red = clamp(matrix[0] * r + matrix[1] * g + matrix[2] * b) / 255
    rgba.green = clamp(matrix[3] * r + matrix[4] * g + matrix[5] * b) / 255
    rgba.blue = clamp(matrix[6] * r + matrix[7] * g + matrix[8] * b) / 255
    return rgba.to_string()
}

var invertRotate = color => hueRotateColor(invertColor(color), 180)

var doubleInvert = x => invertRotate(invertRotate(x))

var base64ToPixbuf = base64 => {
    try {
        const data = GLib.base64_decode(base64)
        const imageStream = Gio.MemoryInputStream.new_from_bytes(data)
        return GdkPixbuf.Pixbuf.new_from_stream(imageStream, null)
    } catch (e) {
        return null
    }
}

const maxBy = (arr, f) =>
    arr[arr.map(f).reduce((prevI, x, i, arr) => x > arr[prevI] ? i : prevI, 0)]

const makePopoverPosition = ({ left, right, top, bottom }, window, height) => {
    const [winWidth, winHeight] = window.get_size()
    const borders = [
        [left, Gtk.PositionType.LEFT, left, (top + bottom) / 2],
        [winWidth - right, Gtk.PositionType.RIGHT, right, (top + bottom) / 2],
        [top, Gtk.PositionType.TOP, (left + right) / 2, top],
        [winHeight - bottom, Gtk.PositionType.BOTTOM, (left + right) / 2, bottom]
    ]
    const maxBorder = borders[3][0] > height ? borders[3]
        : borders[2][0] > height ? borders[2]
        : maxBy(borders, x => x[0])
    const x = maxBorder[2]
    const y = maxBorder[3]
    return {
        // sometimes the reported position values are wrong
        // setting x, y to zero insures that the popover is at least visible
        position: {
            x: x <= winWidth && x > 0 ? x : 0,
            y: y <= winHeight && y > 0 ? y : 0
        },
        positionType: maxBorder[1]
    }
}
var setPopoverPosition = (popover, position, window, height) => {
    const setPosition = height => {
        const { position: rectPosition, positionType } =
            makePopoverPosition(position, window, height)
        popover.position = positionType
        popover.pointing_to = new Gdk.Rectangle(rectPosition)
    }
    popover.connect('size-allocate', () =>
        setPosition(popover.get_allocation().height))
    setPosition(height)
}

var formatMinutes = n => {
    n = Math.round(n)
    if (n < 60) return ngettext('%d minute', '%d minutes', n).format(n)
    else {
        const h = Math.round(n / 60)
        return ngettext('%d hour', '%d hours', h).format(h)
    }
}
