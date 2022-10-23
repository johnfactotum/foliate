import Gio from 'gi://Gio'
import GLib from 'gi://GLib'

class SSIPClient {
    #inputStream
    #outputStream
    #onResponse
    #eventData = []
    constructor(onEvent) {
        this.onEvent = onEvent
        const path = GLib.build_filenamev(
            [GLib.get_user_runtime_dir(), 'speech-dispatcher/speechd.sock'])
        const address = Gio.UnixSocketAddress.new(path)
        const connection = new Gio.SocketClient().connect(address, null)
        this.#outputStream = Gio.DataOutputStream.new(connection.get_output_stream())
        this.#inputStream = Gio.DataInputStream.new(connection.get_input_stream())
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

export class SpeechD {
    #promises = new Map()
    #client = new SSIPClient((msgID, result) =>
        this.#promises.get(msgID)?.resolve?.(result))
    async init() {
        const clientName = `${GLib.get_user_name()}:foliate:tts`
        await this.#client.send('SET SELF CLIENT_NAME ' + clientName)
        await this.#client.send('SET SELF SSML_MODE on')
        await this.#client.send('SET SELF NOTIFICATION ALL on')
        return this
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
    async speak(str) {
        await this.#client.send('SPEAK')
        const text = str.replace('\r\n.', '\r\n..') + '\r\n.'
        const [msgID] = await this.#client.send(text)
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
}
