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

var user_agent = `Foliate/${pkg.version}`

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
const { iso_639_2_path, iso_3166_1_path } = imports.isoCodes

let verbose = false
var setVerbose = value => verbose = value

// wrap Object as GObject.Object, mainly so that we can put it in Gio.ListStore
// this is much easier than defining types for everything
var Obj = GObject.registerClass({
    GTypeName: 'FoliateObj'
}, class Obj extends GObject.Object {
    _init(x) {
        super._init()
        this.value = x
    }
})

var LOG_DOMAIN = 'Foliate'

var debug = message => verbose ? log(message) :
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

var regexEscape = str => str ? str.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&') : ''

var readJSON = file => {
    try {
        const [success, data, /*tag*/] = file.load_contents(null)
        if (success) return JSON.parse(data instanceof Uint8Array
            ? ByteArray.toString(data) : data.toString())
        else throw new Error()
    } catch (e) {
        return {}
    }
}

var glibcLocaleToBCP47 = x => x === 'C' ? 'en' : x.split('.')[0].replace('_', '-')
var locales = GLib.get_language_names().map(glibcLocaleToBCP47)
try {
    const settings = new Gio.Settings({ schema_id: 'org.gnome.system.locale' })
    const locale = glibcLocaleToBCP47(settings.get_string('region'))
    if (locale) locales = locale
} catch (e) {}

var languageNames = new Map()
var alpha_3_to_alpha_2 = new Map()
var regionNames = new Map()
const iso_639_2 = readJSON(Gio.File.new_for_path(iso_639_2_path))
const iso_3166_1 = readJSON(Gio.File.new_for_path(iso_3166_1_path))
const hasIso_639_2 = '639-2' in iso_639_2
const hasIso_3166_1 = '3166-1' in iso_3166_1
if (hasIso_639_2) for (const obj of iso_639_2['639-2']) {
    if (!obj) continue
    const { alpha_2, alpha_3, name } = obj
    if (alpha_2) languageNames.set(alpha_2, name)
    if (alpha_3) languageNames.set(alpha_3, name)
    if (alpha_2 && alpha_3) alpha_3_to_alpha_2.set(alpha_3, alpha_2)
}
if (hasIso_3166_1) for (const obj of iso_3166_1['3166-1']) {
    if (!obj) continue
    const { alpha_2, alpha_3, name, common_name } = obj
    const n = common_name || name
    if (alpha_2) regionNames.set(alpha_2, n)
    if (alpha_3) regionNames.set(alpha_3, n)
}
var isRegionCode = str => str === str.toUpperCase()
const regionEmojiOffset = 127397
var getRegionEmoji = code => {
    if (!code || code.length !== 2) return
    return String.fromCodePoint(...Array.from(code.toUpperCase())
        .map(x => regionEmojiOffset + x.charCodeAt()))
}
// get langauge names
// should perhaps use `Intl.DisplayNames()` instead once it becomes available
var getLanguageDisplayName = (code, showEmoji) => {
    try {
        code = Intl.getCanonicalLocales(code)[0]
    } catch (e) {
        return code
    }
    if (!hasIso_639_2) return code
    const [language, ...rest] = code.split('-')
    const languageName = languageNames.get(language)
    const languageDisplayName = languageName
        ? GLib.dgettext('iso_639-2', languageName)
        : language

    const region = rest.find(isRegionCode)
    const regionName = region ? regionNames.get(region) : null
    const regionDisplayName = regionName
        ? GLib.dgettext('iso_3166-1', regionName)
        : region

    const emoji = showEmoji ? getRegionEmoji(region) : ''

    return regionDisplayName
        ? (emoji ? emoji + ' ' : '')
            + _('%s (%s)').format(languageDisplayName, regionDisplayName)
        : languageDisplayName
}
// convert alpha-3 to alpha-2 if possible
var getAlpha2 = code => {
    try {
        code = Intl.getCanonicalLocales(code)[0]
    } catch (e) {
        return
    }
    const lang = code.split('-')[0]
    if (lang.length === 2) return lang
    return alpha_3_to_alpha_2.get(lang) || lang
}

var formatPrice = ({ currencycode, value }) => {
    try {
        return new Intl.NumberFormat(locales,
            { style: 'currency', currency: currencycode }).format(value)
    } catch (e) {
        return (currencycode ? currencycode + ' ' : '') + value
    }
}

// Translators: here "BCE" is for "before common era"
const formatBCE = (str, isBCE) => isBCE ? _('%s BCE').format(str) : str

var formatDate = (string, showTime) => {
    let isBCE = false
    if (string.startsWith('-')) {
        // Intl does not format BCE dates
        // so we treat it as a CE date and add "BCE" ourselves later
        isBCE = true
        string = string.split('-')[1]
    }

    const split = string.split('-').filter(x => x)
    const yearOnly = split.length === 1
    const yearMonthOnly = split.length === 2

    const date = yearOnly
        // this is needed because dates like `new Date("100")` is invalid
        ? new Date(Date.UTC(split[0]))
        : new Date(string)

    if (isNaN(date)) return formatBCE(string, isBCE)

    const options = yearOnly
        ? { year: 'numeric' }
        : yearMonthOnly
            ? { year: 'numeric', month: 'long' }
            : showTime
                ? { year: 'numeric', month: 'long', day: 'numeric',
                    hour: 'numeric', minute: 'numeric' }
                : { year: 'numeric', month: 'long', day: 'numeric' }

    try {
        const dateString = new Intl.DateTimeFormat(locales, options).format(date)
        return formatBCE(dateString, isBCE)
    } catch (e) {
        return formatBCE(string, isBCE)
    }
}

var formatMinutes = n => {
    n = Math.round(n)
    if (n < 60) return ngettext('%d minute', '%d minutes', n).format(n)
    else {
        const h = Math.round(n / 60)
        return ngettext('%d hour', '%d hours', h).format(h)
    }
}

var formatPercent = fraction => {
    try {
        return new Intl.NumberFormat(locales, { style: 'percent' }).format(fraction)
    } catch (e) {
        return Math.round(fraction * 100) + '%'
    }
}

var mimetypes = {
    directory: 'inode/directory',
    json: 'application/json',
    xml: 'application/xml',
    text: 'text/plain',
    epub: 'application/epub+zip',
    mobi: 'application/x-mobipocket-ebook',
    kindle: 'application/vnd.amazon.mobi8-ebook',
    kindleAlias: 'application/x-mobi8-ebook',
    fb2: 'application/x-fictionbook+xml',
    fb2zip: 'application/x-zip-compressed-fb2',
    cbz: 'application/vnd.comicbook+zip',
    cbr: 'application/vnd.comicbook-rar',
    cb7: 'application/x-cb7',
    cbt: 'application/x-cbt',
}

var fileFilters = {
    all: new Gtk.FileFilter(),
    ebook: new Gtk.FileFilter()
}
fileFilters.all.set_name(_('All Files'))
fileFilters.all.add_pattern('*')
fileFilters.ebook.set_name(_('E-book Files'))
fileFilters.ebook.add_mime_type(mimetypes.epub)
fileFilters.ebook.add_mime_type(mimetypes.mobi)
fileFilters.ebook.add_mime_type(mimetypes.kindle)
fileFilters.ebook.add_mime_type(mimetypes.fb2)
fileFilters.ebook.add_mime_type(mimetypes.fb2zip)
fileFilters.ebook.add_mime_type(mimetypes.cbz)
fileFilters.ebook.add_mime_type(mimetypes.cbr)
fileFilters.ebook.add_mime_type(mimetypes.cb7)
fileFilters.ebook.add_mime_type(mimetypes.cbt)

const flatpakSpawn = GLib.find_program_in_path('flatpak-spawn')
var execCommand = (argv, input = null, waitCheck, token, inFlatpak, envs) =>
    new Promise((resolve, reject) => {
        if (flatpakSpawn && !inFlatpak) argv = [flatpakSpawn, '--host', ...argv]
        const flags = input
            ? Gio.SubprocessFlags.STDIN_PIPE | Gio.SubprocessFlags.STDOUT_PIPE
            : Gio.SubprocessFlags.STDOUT_PIPE

        try {
            const launcher = new Gio.SubprocessLauncher({ flags })
            launcher.setenv('G_MESSAGES_DEBUG', '', true)
            if (envs) envs.forEach(([variable, value]) =>
                launcher.setenv(variable, value, true))

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
        'modified': { flags: GObject.SignalFlags.RUN_FIRST },
        'externally-modified': { flags: GObject.SignalFlags.RUN_FIRST }
    }
}, class Storage extends GObject.Object {
    _init(path, indent) {
        super._init()

        this.indent = indent
        this._file = Gio.File.new_for_path(path)
        this._data = this._read()
        this._monitor = this._file.monitor(Gio.FileMonitorFlags.NONE, null)
        this._monitor.connect('changed', () => {
            if (this._getModified() > this._modified) {
                debug('externally modified: ' + this._file.get_path())
                this._data = this._read()
                this.emit('externally-modified')
            }
        })
        this._debouncedWrite = debounce(this._write.bind(this), 1000)
    }
    static getPath(type, key, ext = '.json') {
        const dataDir = type === 'cache' ? GLib.get_user_cache_dir()
            : type === 'config' ? GLib.get_user_config_dir()
            : GLib.get_user_data_dir()
        return GLib.build_filenamev([dataDir, pkg.name,
            `${encodeURIComponent(key)}${ext}`])
    }
    _getModified() {
        try {
            const info = this._file.query_info('time::modified',
                Gio.FileQueryInfoFlags.NONE, null)
            return info.get_attribute_uint64('time::modified')
        } catch (e) {
            debug('failed to get file info')
            this._data = {}
            this.emit('externally-modified')
            return null
        }
    }
    _read() {
        this._modified = this._getModified()
        return readJSON(this._file)
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
            if (success) {
                this.emit('modified')
                return true
            }
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
    clear() {
        try {
            this._file.delete(null)
        } catch (e) {}
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
        debug(e.toString())
        return null
    }
}

var scalePixbuf = (pixbuf, factor = 1, width = 120, scaleUp = true) => {
    width = width * factor
    // TODO: maybe just use gdkpixbuf's "[...]_at_sacale" functions instead of this?
    const ratio = width / pixbuf.get_width()
    if (ratio === 1 || (!scaleUp && ratio > 1)) return pixbuf
    const height = parseInt(pixbuf.get_height() * ratio, 10)
    return pixbuf.scale_simple(width, height, GdkPixbuf.InterpType.BILINEAR)
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

// See https://stackoverflow.com/a/12646864
var shuffle = arr => {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
}

// convert HSL to RGB
const hueToRgb = (p, q, t) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
}
var hslToRgb = (h, s, l) => {
    let r, g, b
    if(s == 0) r = g = b = l
    else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s
        const p = 2 * l - q
        r = hueToRgb(p, q, h + 1 / 3)
        g = hueToRgb(p, q, h)
        b = hueToRgb(p, q, h - 1 / 3)
    }
    return [r, g, b]
}

// random number between two numbers
var between = (min, max, x = Math.random()) => x * (max - min) + min

// random number between 0 and 1, from a number
var random = seed => {
    const x = Math.sin(seed) * 10000
    return x - Math.floor(x)
}

// generate a color based on a string
const charSum = str => str
    ? str.split('').map(x => x.charCodeAt(0)).reduce((a, b) => a + b, 0)
    : 0
const splitString = str => {
    if (!str) return ['', '']
    const p = Math.floor(str.length / 2)
    return [str.slice(0, p), str.slice(p)]
}
var colorFromString = str => {
    const [a, b] = splitString(str)
    const x = random(charSum(a))
    const y = random(charSum(b))
    const z = random(charSum(str))
    return [x, between(0, 0.6, y), between(0.2, 1, z)]
}

var isLight = (r, g, b) => (r * 0.2126 + g * 0.7152 + b * 0.0722) > 0.6

// check if a link is of a certain rel
// the `rel` attribute is space separated
var linkIsRel = (link, rel) => {
    if (!('rel' in link) || !link.rel) return false
    const rels = link.rel.split(' ')
    return typeof rel === 'function'
        ? rels.some(rel)
        : rels.some(x => x === rel)
}

var makeLinksButton = (params, links, onActivate) => {
    const popover = new Gtk.PopoverMenu()
    const box = new Gtk.Box({
        visible: true,
        orientation: Gtk.Orientation.VERTICAL,
        margin: 10
    })
    popover.add(box)
    const button = new Gtk.MenuButton(Object.assign({ popover }, params, { label: null }))
    const buttonBox =  new Gtk.Box({ spacing: 3 })
    const icon = new Gtk.Image({ icon_name: 'pan-down-symbolic' })
    buttonBox.pack_start(new Gtk.Label({ label: params.label }), true, true, 0)
    buttonBox.pack_end(icon, false, true, 0)
    button.add(buttonBox)
    button.show_all()
    links.forEach(({ href, type, title, tooltip }) => {
        const menuItem = new Gtk.ModelButton({
            visible: true,
            text: title,
            tooltip_text: tooltip || ''
        })
        menuItem.connect('clicked', () => onActivate({ href, type }))
        box.pack_start(menuItem, false, true, 0)
    })
    return button
}

var sepHeaderFunc = row => {
    if (row.get_index()) row.set_header(new Gtk.Separator())
}
