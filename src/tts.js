import Gtk from 'gi://Gtk'
import GObject from 'gi://GObject'
import { gettext as _ } from 'gettext'

import * as utils from './utils.js'
import { GoogleTranslateTTS } from './speech.js'

const ttsEngine = new GoogleTranslateTTS()

function ttsLanguageChoices() {
    return [
        [_('Automatic (from book)'), ''],
        [_('English'), 'en'],
        [_('Spanish'), 'es'],
        [_('French'), 'fr'],
        [_('German'), 'de'],
        [_('Italian'), 'it'],
        [_('Portuguese'), 'pt'],
        [_('Dutch'), 'nl'],
        [_('Russian'), 'ru'],
        [_('Japanese'), 'ja'],
        [_('Korean'), 'ko'],
        [_('Chinese (Simplified)'), 'zh-CN'],
        [_('Chinese (Traditional)'), 'zh-TW'],
        [_('Arabic'), 'ar'],
        [_('Hindi'), 'hi'],
        [_('Polish'), 'pl'],
        [_('Turkish'), 'tr'],
        [_('Swedish'), 'sv'],
        [_('Norwegian Bokmål'), 'no'],
        [_('Danish'), 'da'],
        [_('Finnish'), 'fi'],
        [_('Greek'), 'el'],
        [_('Hebrew'), 'he'],
        [_('Czech'), 'cs'],
        [_('Romanian'), 'ro'],
        [_('Hungarian'), 'hu'],
        [_('Indonesian'), 'id'],
        [_('Thai'), 'th'],
        [_('Vietnamese'), 'vi'],
        [_('Ukrainian'), 'uk'],
    ]
}

function ttsRegionChoices() {
    return [
        ['translate.google.com', 'com'],
        ['translate.google.co.uk', 'co.uk'],
        ['translate.google.com.au', 'com.au'],
        ['translate.google.ca', 'ca'],
        ['translate.google.co.jp', 'co.jp'],
        ['translate.google.com.hk', 'com.hk'],
        ['translate.google.cn', 'cn'],
        ['translate.google.de', 'de'],
        ['translate.google.fr', 'fr'],
        ['translate.google.it', 'it'],
        ['translate.google.es', 'es'],
    ]
}

GObject.registerClass({
    GTypeName: 'FoliateTTSBox',
    Template: pkg.moduleuri('ui/tts-box.ui'),
    Signals: {
        'init': { return_type: GObject.TYPE_JSOBJECT },
        'start': { return_type: GObject.TYPE_JSOBJECT },
        'resume': { return_type: GObject.TYPE_JSOBJECT },
        'backward': { return_type: GObject.TYPE_JSOBJECT },
        'forward': { return_type: GObject.TYPE_JSOBJECT },
        'backward-paused': {},
        'forward-paused': {},
        'highlight': {
            param_types: [GObject.TYPE_STRING],
            return_type: GObject.TYPE_JSOBJECT,
        },
        'next-section': { return_type: GObject.TYPE_JSOBJECT },
    },
    InternalChildren: [
        'tts-lang-dropdown', 'tts-region-dropdown',
        'tts-speed-scale', 'tts-volume-scale',
        'media-buttons', 'play-button',
    ],
}, class extends Gtk.Box {
    #state = 'stopped'
    #langCodes = []
    #regionTlds = []
    defaultWidget = this._play_button
    constructor(params) {
        super(params)
        this.insert_action_group('tts', utils.addMethods(this, {
            actions: ['play', 'backward', 'forward', 'stop'],
        }))
        utils.setDirection(this._media_buttons, Gtk.TextDirection.LTR)

        const langChoices = ttsLanguageChoices()
        this.#langCodes = langChoices.map(([, code]) => code)
        const langModel = Gtk.StringList.new(langChoices.map(([label]) => label))
        this._tts_lang_dropdown.set_model(langModel)
        this._tts_lang_dropdown.connect('notify::selected', () => {
            const i = this._tts_lang_dropdown.get_selected()
            ttsEngine.setLanguage(this.#langCodes[i] ?? '')
        })

        const regionChoices = ttsRegionChoices()
        this.#regionTlds = regionChoices.map(([, tld]) => tld)
        const regionModel = Gtk.StringList.new(regionChoices.map(([label]) => label))
        this._tts_region_dropdown.set_model(regionModel)
        this._tts_region_dropdown.connect('notify::selected', () => {
            const i = this._tts_region_dropdown.get_selected()
            ttsEngine.setRegion(this.#regionTlds[i] ?? 'com')
        })

        ttsEngine.setSpeed(this._tts_speed_scale.get_value() / 100)
        ttsEngine.setVolume(this._tts_volume_scale.get_value())
        this._tts_speed_scale.connect('value-changed', scale =>
            ttsEngine.setSpeedLive(scale.get_value() / 100))
        this._tts_volume_scale.connect('value-changed', scale =>
            ttsEngine.setVolumeLive(scale.get_value()))
    }
    get state() {
        return this.#state
    }
    set state(state) {
        this.#state = state
        this._play_button.icon_name = state === 'playing'
            ? 'media-playback-pause-symbolic'
            : 'media-playback-start-symbolic'
    }
    #init() {
        return ttsEngine.stop().then(() => this.emit('init'))
    }
    async #speak(ssml) {
        this.state = 'playing'
        ssml = await ssml
        if (!ssml && await this.emit('next-section')) return this.forward()
        const iter = await ttsEngine.speak(ssml)
        let state
        for (;;) {
            const step = await iter.next()
            if (step.done) break
            const { mark, message } = step.value
            if (mark) await this.emit('highlight', mark)
            else state = message
        }
        if (state === 'END') this.forward()
    }
    speak(ssml) {
        this.#init().then(() => this.#speak(ssml)).catch(e => this.error(e))
    }
    play() {
        if (this.#state !== 'playing') this.start()
        else this.pause()
    }
    start() {
        this.#init()
            .then(() => this.#speak(this.state === 'paused'
                ? this.emit('resume')
                : this.emit('start')))
            .catch(e => this.error(e))
    }
    pause() {
        this.state = 'paused'
        ttsEngine.stop().catch(e => this.error(e))
    }
    stop() {
        this.state = 'stopped'
        ttsEngine.stop().catch(e => this.error(e))
    }
    backward() {
        this.#init()
            .then(() => this.state === 'playing'
                ? this.#speak(this.emit('backward'))
                : (this.state = 'paused', this.emit('backward-paused')))
            .catch(e => this.error(e))
    }
    forward() {
        this.#init()
            .then(() => this.state === 'playing'
                ? this.#speak(this.emit('forward'))
                : (this.state = 'paused', this.emit('forward-paused')))
            .catch(e => this.error(e))
    }
    error(e) {
        this.state = 'stopped'
        console.error(e)
        const detail = e instanceof Error ? e.message : String(e)
        this.root.error(_('Text-to-Speech Error'),
            _('Playback uses Google Translate audio. Install mpv for best highlighting sync. You need a network connection.') + '\n\n' + detail)
    }
    kill() {
        this.emit = () => {}
        if (this.state === 'playing') ttsEngine.stop().catch(err => console.error(err))
    }
})


GObject.registerClass({
    GTypeName: 'FoliateMediaOverlayBox',
    Template: pkg.moduleuri('ui/media-overlay-box.ui'),
    Properties: utils.makeParams({
        'rate': 'double',
        'volume': 'double',
    }),
    Signals: {
        'start': {},
        'pause': {},
        'resume': {},
        'stop': {},
        'backward': {},
        'forward': {},
    },
    InternalChildren: [
        'volume-scale',
        'media-buttons', 'play-button',
    ],
}, class extends Gtk.Box {
    #state = 'stopped'
    defaultWidget = this._play_button
    constructor(params) {
        super(params)
        this.set_property('rate', 1)
        const actionGroup = utils.addMethods(this, {
            actions: ['play', 'backward', 'forward', 'stop'],
        })
        utils.addPropertyActions(this, ['rate'], actionGroup)
        this.insert_action_group('media-overlay', actionGroup)

        utils.setDirection(this._media_buttons, Gtk.TextDirection.LTR)

        // GtkScale, y u no implement GtkActionable?
        this._volume_scale.connect('value-changed', scale =>
            this.set_property('volume', scale.get_value()))
    }
    get state() {
        return this.#state
    }
    set state(state) {
        this.#state = state
        this._play_button.icon_name = state === 'playing'
            ? 'media-playback-pause-symbolic'
            : 'media-playback-start-symbolic'
    }
    play() {
        if (this.#state !== 'playing') this.start()
        else this.pause()
    }
    start() {
        if (this.state === 'paused') this.emit('resume')
        else this.emit('start')
        this.state = 'playing'
    }
    pause() {
        this.state = 'paused'
        this.emit('pause')
    }
    stop() {
        this.state = 'stopped'
        this.emit('stop')
    }
    backward() {
        if (this.state === 'stopped') this.state = 'playing'
        this.emit('backward')
    }
    forward() {
        if (this.state === 'stopped') this.state = 'playing'
        this.emit('forward')
    }
})
