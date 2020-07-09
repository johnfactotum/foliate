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

const { GLib, Gio, GObject, Gtk } = imports.gi
const { error, execCommand } = imports.utils

const settings = new Gio.Settings({ schema_id: pkg.name })

const replaceVars = (argv, lang) => argv.map(x =>
    x === '$FOLIATE_TTS_LANG' ? lang
    : x === '$FOLIATE_TTS_LANG_LOWER' ? lang.toLowerCase() : x)

const makeEnv = lang => [
    ['FOLIATE_TTS_LANG', lang],
    ['FOLIATE_TTS_LANG_LOWER', lang.toLowerCase()]
]

// parse the output of `espeak-ng --voices` and get a voice for a language
const espeakGetVoice = (espeakVoices, language) => {
    language = language.trim().toLowerCase()
    const result = espeakVoices
        .split('\n')
        .slice(1)               // remove heading
        .map(x => x.trim())     // remove extra space
        .filter(x => x)         // and empty lines
        .map(x => {
            // I think "Pty" means "priority"
            const [pty, lang, /*ageGender*/, /*voiceName*/, file, ...otherLangs] = x.split(/\s+/)

            const otherLanguages = otherLangs
                // reverse the earlier split...
                .join(' ')
                // ...because these are separated by parentheses
                .split(/\(|\)/).filter(x => x)
                .map((langPty) => {
                    const [lang, pty] = langPty.split(' ')
                    return { lang, pty }
                })

            const languages = [{ pty, lang }].concat(otherLanguages)

            return { languages, file }
        })
        // get the voice with lowest value of "Pty"
        .reduce((prev, current) => {
            const prevMatch = prev.languages.find(({ lang }) => lang === language)
            const match = current.languages.find(({ lang }) => lang === language)
            if (!match) return prev
            else if (!prevMatch) return current
            else if (match.pty < prevMatch.pty) return current
            else return prev
        }, { languages: [], file: null })

    return result.file
}

const getEseapkVoice = async language => {
    try {
        const espeakVoices = await execCommand(['espeak-ng', '--voices'])
        return espeakGetVoice(espeakVoices, language)
    } catch (e) {
        logError(e)
    }
}

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
        this._epub = null
        this._shouldGetEspeakVoice = false
        this._espeakVoice = null
    }
    get epub() {
        return this._epub
    }
    set epub(epub) {
        if (this._epub)
            this._epub.disconnect(this._epubHandler)
        this._epub = epub
        this._epubHandler = this._epub.connect('speech', (epub, text, nextPage, nextSection) => {
            const processedText = text
                .replace(/“|”/g, '"')
                .replace(/‛|’/g, "'")
                .replace(/–/g, '--')
                .replace(/—/g, '---')
                .replace(/…/g, '...')
                .replace(/\xa0/g, ' ')
                .replace(/\xad|\u2060/g, '')
                .replace(/\n/g, '; ')

            const lang = epub.metadata.language
            const getCommand = this._shouldGetEspeakVoice
                ? getEseapkVoice(lang)
                    .then(voice => this._command.concat(['-v', voice]))
                    .catch(() => this._command)
                : Promise.resolve(replaceVars(this._command, lang))

            getCommand
                .then(command =>
                    execCommand(command, processedText, true, this._token, false, makeEnv(lang)))
                .then(() => nextSection
                    ? this._epub.speakNextSection()
                    : nextPage
                        ? this._epub.speakNext()
                        : this.stop())
                .catch(e => {
                    error(e.toString())
                    this.stop()
                })
        })
    }
    set command(command){
        this._command = command ? GLib.shell_parse_argv(command)[1] : null
        this.set_property('enabled', Boolean(this._command))
        if (!command) this._stop()

        if (this._command
        && this._command[0] === 'espeak-ng'
        && this._command.every(a => a !== '-v'))
            this._shouldGetEspeakVoice = true
    }
    _start(from) {
        this._stop()
        if (!this._command) return this.stop()
        this._epub.speak(from)
    }
    _stop() {
        if (this._token && this._token.interrupt) this._token.interrupt()
    }
    start(from) {
        this.set_property('speaking', true)
        this._start(from)
    }
    stop() {
        this.set_property('speaking', false)
        this._stop()
    }
})

var tts = new TTS()

var TtsButton = GObject.registerClass({
    GTypeName: 'FoliateTtsButton'
}, class TtsButton extends Gtk.ToggleButton {
    _init(params) {
        super._init(params)
        this.active = tts.speaking
        this.connect('toggled', () => {
            if (this.active === tts.speaking) return
            tts.epub = this.get_toplevel().epub
            if (this.active) tts.start()
            else tts.stop()
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

var ttsDialog = (window) => {
    tts.stop()

    const builder = Gtk.Builder.new_from_resource(
        '/com/github/johnfactotum/Foliate/ui/ttsDialog.ui')

    const $ = builder.get_object.bind(builder)
    const flag = GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE

    const options = ['espeak', 'festival', 'other']
    options.forEach(option =>
        $(option).bind_property('active', $(option + 'Box'), 'visible', flag))

    let activeOption = 'other'
    const command = settings.get_string('tts-command')
    if (command.includes('espeak-ng')) activeOption = 'espeak'
    else if (command.includes('festival')) activeOption = 'festival'
    $(activeOption).active = true

    const defaultCommands = {
        espeak: 'espeak-ng',
        festival: 'festival --tts'
    }
    options.forEach(option => {
        $(option + 'Entry').text = option === activeOption && command ? command
            :  defaultCommands[option] || ''

        const reset = $(option + 'Reset')
        if (reset) reset.connect('clicked', () =>
            $(option + 'Entry').text = defaultCommands[option])
    })

    const getCommand = () => {
        const activeOption = options.find(option => $(option).active)
        return $(activeOption + 'Entry').text
    }

    // Translatros: these are sentences from "The North Wind and the Sun",
    // used for testing text-to-speech
    const test1 = _('The North Wind and the Sun were disputing which was the stronger,')
    const test2 = _('when a traveler came along wrapped in a warm cloak.')
    // Translators: this is the language code of the test sentences
    const testLang = _('en')

    const setTest = () => {
        $('test1').buffer.text = test1
        $('test2').buffer.text = test2
        $('testLang').text = testLang
    }
    setTest()
    $('testResetButton').connect('clicked', setTest)

    const token = {}
    let speaking = false
    $('testButton').connect('toggled', button => {
        if (button.active === speaking) return
        if (button.active) {
            const testLang = $('testLang').text
            const command = GLib.shell_parse_argv(getCommand())[1]

            const shouldGetEspeakVoice =  command
                && command[0] === 'espeak-ng'
                && command.every(a => a !== '-v')

            const getArgv = shouldGetEspeakVoice
                ? getEseapkVoice(testLang)
                    .then(voice => command.concat(['-v', voice]))
                    .catch(() => command)
                : Promise.resolve(replaceVars(command, testLang))

            let argv
            const opts = id =>
                [argv, $(id).buffer.text, true, token, false, makeEnv(testLang)]

            getArgv
                .then(x => {
                    argv = x
                    speaking = true
                    return execCommand(...opts('test1'))
                })
                .then(() => {
                    if (speaking) return execCommand(...opts('test2'))
                })
                .catch(e => logError(e))
                .then(() => button.active = false)
        } else if (token.interrupt) {
            speaking = false
            token.interrupt()
        }
    })

    const dialog = $('ttsDialog')
    if (window) dialog.transient_for = window

    dialog.connect('destroy', () => {
        if (token.interrupt) token.interrupt()
    })

    const res = dialog.run()
    if (res === Gtk.ResponseType.OK)
        settings.set_string('tts-command', getCommand())

    dialog.destroy()
}
