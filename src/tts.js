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

const { GLib, GObject, Gtk } = imports.gi
const { error, execCommand } = imports.utils

const TTS = GObject.registerClass({
    GTypeName: 'FoliateTTS',
    Properties: {
        enabled: GObject.ParamSpec.boolean('enabled', 'enabled', 'enabled',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, false),
        speaking: GObject.ParamSpec.boolean('speaking', 'speaking', 'speaking',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, false),
    }
}, class TTS extends GObject.Object {
    _init(params) {
        super._init(params)
        this._token = {}
        this.connect('notify::speaking', () => {
            if (this.speaking) this.start()
            else this.stop()
        })
    }
    get epub() {
        return this._epub
    }
    set epub(epub) {
        if (this._epub)
            this._epub.disconnect(this._epubHandler)
        this._epub = epub
        this._epubHandler = this._epub.connect('speech', (_, text, nextPage) => {
            const processedText = text
                .replace(/“|”/g, '"')
                .replace(/‛|’/g, "'")
                .replace(/–/g, '--')
                .replace(/—/g, '---')
                .replace(/…/g, '...')
                .replace(/\xa0/g, ' ')
                .replace(/\xad|\u2060/g, '')
                .replace(/\n/g, '; ')
            execCommand(this._command, processedText, true, this._token)
                .then(() => nextPage
                    ? this._epub.speakNext()
                    : this.set_property('speaking', false))
                .catch(e => {
                    error(e.toString())
                    this.set_property('speaking', false)
                })
        })
    }
    set command(command){
        this._command = command ? GLib.shell_parse_argv(command)[1] : null
        this.set_property('enabled', Boolean(this._command))
    }
    start() {
        this.stop()
        if (!this._command) return this.set_property('speaking', false)
        this._epub.speak()
    }
    stop() {
        if (this._token && this._token.interrupt) this._token.interrupt()
    }
})

var tts = new TTS()

var TTSButton = GObject.registerClass({
    GTypeName: 'FoliateTTSButton'
}, class TTSButton extends Gtk.ToggleButton {
    _init(params) {
        super._init(params)
        this.active = tts.speaking
        this.connect('toggled', () => {
            if (this.active === tts.speaking) return
            tts.epub = this.get_toplevel().epub
            tts.set_property('speaking', this.active)
        })
        const handler = tts.connect('notify::speaking', () =>
            this.active = tts.speaking)
        this.visible = tts.enabled
        const handler2 = tts.connect('notify::enabled', () =>
            this.visible = tts.enabled)
        this.connect('destroy', () => {
            tts.disconnect(handler)
            tts.disconnect(handler2)
        })
    }
})
