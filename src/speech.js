import Gio from 'gi://Gio'
import GLib from 'gi://GLib'

class SSIPConnection {
    #connection
    #inputStream
    #outputStream
    #onResponse
    #eventData = []
    constructor(onEvent) {
        this.onEvent = onEvent
    }
    spawn() {
        const flags = Gio.SubprocessFlags.NONE
        const launcher = new Gio.SubprocessLauncher({ flags })
        const proc = launcher.spawnv(['speech-dispatcher', '--spawn'])
        return new Promise(resolve => proc.wait_check_async(null, () => resolve()))
    }
    connect() {
        const path = GLib.build_filenamev(
            [GLib.get_user_runtime_dir(), 'speech-dispatcher/speechd.sock'])
        const address = Gio.UnixSocketAddress.new(path)
        this.#connection = new Gio.SocketClient().connect(address, null)
        this.#outputStream = Gio.DataOutputStream.new(this.#connection.get_output_stream())
        this.#inputStream = Gio.DataInputStream.new(this.#connection.get_input_stream())
        this.#inputStream.newline_type = Gio.DataStreamNewlineType.TYPE_CR_LF
        this.#receive()
    }
    #receive() {
        this.#inputStream.read_line_async(0, null, (stream, res) => {
            const [line/*, length*/] = stream.read_line_finish_utf8(res)
            const code = line.slice(0, 3)
            const end = line.slice(3, 4) === ' '
            const text = line.slice(4, -1)
            if (code.startsWith('7')) this.#onEvent(code, end, text)
            else this.#onResponse(code, end, text)
            this.#receive()
        })
    }
    #onEvent(code, end, message) {
        if (!end) return this.#eventData.push(message)
        else {
            const [msgID,, mark] = this.#eventData
            this.onEvent?.(msgID, { code, message, mark })
            this.#eventData = []
        }
    }
    send(command) {
        return new Promise((resolve, reject) => {
            if (!this.#connection.is_connected()) reject()
            this.#outputStream.put_string(command + '\r\n', null)
            const data = []
            this.#onResponse = (code, end, message) => {
                if (!end) return data.push(message)
                if (code.startsWith('2'))
                    resolve(Object.assign(data, { code, message }))
                else reject(new Error(code + ' ' + message))
            }
        })
    }
}

export class SSIPClient {
    #initialized
    #promises = new Map()
    #connection = new SSIPConnection((msgID, result) =>
        this.#promises.get(msgID)?.resolve?.(result))
    async init() {
        if (this.#initialized) return
        this.#initialized = true
        try {
            await this.#connection.spawn()
            this.#connection.connect()
            const clientName = `${GLib.get_user_name()}:foliate:tts`
            await this.#connection.send('SET SELF CLIENT_NAME ' + clientName)
            await this.#connection.send('SET SELF SSML_MODE on')
            await this.#connection.send('SET SELF NOTIFICATION ALL on')
        } catch (e) {
            this.#initialized = false
            throw e
        }
    }
    #makePromise(msgID){
        return new Promise((resolve, reject) => this.#promises.set(msgID, {
            resolve: value => (resolve(value), this.#promises.delete(msgID)),
            reject: value => (reject(value), this.#promises.delete(msgID)),
        }))
    }
    #makeIter(msgID) {
        let promise = this.#makePromise(msgID)
        return {
            next: async () => {
                const data = await promise
                promise = this.#makePromise(msgID)
                return data
            },
            return: () => {
                promise = null
                this.#promises.delete(msgID)
            },
        }
    }
    async send(command) {
        await this.init()
        return this.#connection.send(command)
    }
    async speak(str) {
        await this.send('SPEAK')
        const text = str.replace('\r\n.', '\r\n..') + '\r\n.'
        const [msgID] = await this.send(text)
        const iter = this.#makeIter(msgID)
        let done = false
        const next = async () => {
            if (done) return { done }
            const value = await iter.next()
            const { code } = value
            if (code === '702' || code === '703') {
                iter.return()
                done = true
                return { value, done: false }
            }
            return { value, done }
        }
        return {
            next,
            [Symbol.asyncIterator]: () => ({ next }),
        }
    }
    pause() {
        return this.send('PAUSE all')
    }
    resume() {
        return this.send('RESUME all')
    }
    stop() {
        return this.send('STOP all')
    }
    async listSynthesisVoices() {
        const data = await this.send('LIST SYNTHESIS_VOICES')
        return data.map(row => {
            const [name, lang, variant] = row.split('\t')
            return { name, lang, variant }
        })
    }
}
