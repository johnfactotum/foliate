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

const { Gio, GLib, GObject, Gdk, GdkPixbuf } = imports.gi
const ByteArray = imports.byteArray

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

        this.indent = type === 'config'
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
        // TODO: throttle?
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
        this._write(this._data)
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

var invertColor = color => {
    const rgba = new Gdk.RGBA()
    rgba.parse(color)
    rgba.red = 1 - rgba.red
    rgba.green = 1 - rgba.green
    rgba.blue = 1 - rgba.blue
    return rgba.to_string()
}

var brightenColor = (color, brightness) => {
    const rgba = new Gdk.RGBA()
    rgba.parse(color)
    rgba.red = rgba.red * brightness
    rgba.green = rgba.green * brightness
    rgba.blue = rgba.blue * brightness
    return rgba.to_string()
}

var base64ToPixbuf = base64 => {
    try {
        const data = GLib.base64_decode(base64)
        const imageStream = Gio.MemoryInputStream.new_from_bytes(data)
        return GdkPixbuf.Pixbuf.new_from_stream(imageStream, null)
    } catch (e) {
        return null
    }
}
