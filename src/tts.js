import Gtk from 'gi://Gtk'
import GObject from 'gi://GObject'

import * as utils from './utils.js'
import { SSIPClient } from './speech.js'

const ssip = new SSIPClient()

export const TTSBox = GObject.registerClass({
    GTypeName: 'FoliateTTSBox',
    Template: pkg.moduleuri('ui/tts-box.ui'),
    Signals: {
        'init': { return_type: GObject.TYPE_JSOBJECT },
        'start': { return_type: GObject.TYPE_JSOBJECT },
        'start-from': {
            param_types: [GObject.TYPE_STRING],
            return_type: GObject.TYPE_JSOBJECT,
        },
        'resume': { return_type: GObject.TYPE_JSOBJECT },
        'backward': { return_type: GObject.TYPE_JSOBJECT },
        'forward': { return_type: GObject.TYPE_JSOBJECT },
        'highlight': {
            param_types: [GObject.TYPE_STRING],
            return_type: GObject.TYPE_JSOBJECT,
        },
        'next-section': { return_type: GObject.TYPE_JSOBJECT },
    },
    InternalChildren: [
        'play-button',
    ],
}, class extends Gtk.Box {
    #state = 'stopped'
    constructor(params) {
        super(params)
        this.insert_action_group('tts', utils.addMethods(this, {
            actions: ['play', 'backward', 'forward', 'stop'],
        }))
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
        return ssip.stop().then(() => this.emit('init'))
    }
    async #speak(ssml) {
        this.state = 'playing'
        const iter = await ssip.speak(await ssml)
        let state
        for await (const { mark, message } of iter) {
            if (mark) await this.emit('highlight', mark)
            else state = message
        }
        if (state === 'END' && await this.emit('next-section')) this.start()
        else this.state = 'stopped'
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
    startFrom(mark) {
        this.#init()
            .then(() => this.#speak(this.emit('start-from', mark)))
            .catch(e => this.error(e))
    }
    pause() {
        this.state = 'paused'
        ssip.stop().catch(e => this.error(e))
    }
    stop() {
        this.state = 'stopped'
        ssip.stop().catch(e => this.error(e))
    }
    backward() {
        this.#init()
            .then(() => this.#speak(this.emit('backward')))
            .catch(e => this.error(e))
    }
    forward() {
        this.#init()
            .then(() => this.#speak(this.emit('forward')))
            .catch(e => this.error(e))
    }
    error(e) {
        this.state = 'stopped'
        // TODO: display error
        console.error(e)
    }
    kill() {
        this.emit = () => {}
        if (this.state === 'playing') ssip.stop().catch(e => console.error(e))
    }
})
