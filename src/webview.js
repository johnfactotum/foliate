import GObject from 'gi://GObject'
import GLib from 'gi://GLib'
import Gio from 'gi://Gio'
import WebKit from 'gi://WebKit2'

// enable sandbox
// remove this after https://bugs.webkit.org/show_bug.cgi?id=220117 is fixed
WebKit.WebContext.get_default().set_sandbox_enabled(true)

const registerScheme = (name, callback) =>
    WebKit.WebContext.get_default().register_uri_scheme(name, req => {
        try {
            callback(req)
        } catch (e) {
            req.finish_error(new GLib.Error(
                Gio.IOErrorEnum, Gio.IOErrorEnum.NOT_FOUND, 'Not found'))
        }
    })

const registerPaths = (name, dirs) => registerScheme(name, req => {
    const path = req.get_path()
    if (dirs.every(dir => !path.startsWith(dir))) throw new Error()
    const mime = path.endsWith('.js') ? 'application/javascript' : 'text/html'
    const file = Gio.File.new_for_path(pkg.modulepath(path))
    req.finish(file.read(null), -1, mime)
})

registerPaths('foliate', ['/reader/', '/foliate-js/'])

/*
`.run_javascript()` is hard to use if you're running an async function. You have
to use messaging which is quite cumbersome.

So the idea is that we create a promise that can be resolved from the outside
whenever we're calling an async function inside the webview.

Then, after the function inside the webview resolves, we send a back a message
that will be used to resolve the aforementioned promise.
*/

const makeToken = () => Math.random().toString()

class PromiseStore {
    #promises = new Map()
    make(token) {
        return new Promise((resolve, reject) => this.#promises.set(token, {
            resolve: value => (resolve(value), this.#promises.delete(token)),
            reject: value => (reject(value), this.#promises.delete(token)),
        }))
    }
    resolve(token, ok, value) {
        const promise = this.#promises.get(token)
        if (ok) promise.resolve(value)
        else promise.reject(value)
    }
}

const pass = obj => typeof obj === 'undefined' ? ''
    : `JSON.parse(decodeURI("${encodeURI(JSON.stringify(obj))}"))`

const makeHandlerStr = name => `globalThis.webkit.messageHandlers["${name}"]`

export const WebView = GObject.registerClass({
    GTypeName: 'FoliateWebView',
}, class extends WebKit.WebView {
    #promises = new PromiseStore()
    #handlerName = pkg.name + '.' + makeToken()
    #handler = makeHandlerStr(this.#handlerName)
    constructor(params) {
        super(params)
        this.registerHandler(this.#handlerName, ({ token, ok, payload }) =>
            this.#promises.resolve(token, ok, payload))

        this.connect('web-process-crashed', () => {
            console.error('My name is Oh-No-WebKit-Crashed, bug of bugs!')
            console.error('Look on this line, Developer -- despair!')
        })
    }
    // execute arbitrary js without returning anything
    run(script) {
        return new Promise(resolve =>
            this.run_javascript(script, null, () => resolve()))
    }
    eval(exp) {
        return new Promise((resolve, reject) =>
            this.run_javascript(`JSON.stringify(${exp})`, null, (_, result) => {
                try {
                    const jsResult = this.run_javascript_finish(result)
                    const str = jsResult.get_js_value().to_string()
                    const value = str != null ? JSON.parse(str) : null
                    resolve(value)
                } catch (e) {
                    reject(e)
                }
            }))
    }
    // call async function with a parameter object
    exec(func, params) {
        const token = makeToken()
        const script = `(async () => await ${func}(${pass(params)}))()
            .then(payload => ${this.#handler}.postMessage(
                JSON.stringify({ token: "${token}", ok: true, payload })))
            .catch(e => ${this.#handler}.postMessage(
                JSON.stringify({ token: "${token}", ok: false, payload:
                    e?.message + '\\n' + e?.stack + '\\n' + \`${func}\` })))`
        const promise = this.#promises.make(token)
        this.run_javascript(script, null, () => {})
        return promise
    }
    // call generator, get async generator object
    async iter(func, params) {
        const name = makeToken()
        const instance = `globalThis["${this.#handlerName}"]["${name}"]`
        const script = `globalThis["${this.#handlerName}"] ??= {}
            ${instance} = ${func}(${pass(params)})`
        await this.run(script)
        const next = async args => {
            const result = await this.exec(`${instance}.next`, args)
            if (result.done) await this.run(`delete ${instance}`)
            return result
        }
        return {
            next,
            [Symbol.asyncIterator]: () => ({ next }),
            // technically these should return `IteratorResult`, but do not
            return: async () => this.run(`${instance}?.return?.()`),
            throw: async () => this.run(`${instance}?.throw?.()`),
        }
    }
    registerHandler(name, callback) {
        const manager = this.get_user_content_manager()
        manager.connect(`script-message-received::${name}`, (_, result) => {
            try {
                callback(JSON.parse(result.get_js_value().to_string()))
            } catch (e) {
                console.error(e)
            }
        })
        const success = manager.register_script_message_handler(name)
        if (!success) throw new Error('Failed to register script message handler')
    }
    #load(func, ...args) {
        return new Promise((resolve, reject) => {
            const changed = this.connect('load-changed', (_, event) => {
                if (event === WebKit.LoadEvent.FINISHED) {
                    this.disconnect(changed)
                    resolve()
                }
            })
            const failed = this.connect('load-failed', () => {
                this.disconnect(failed)
                reject()
            })
            func(...args)
        })
    }
    loadURI(uri) {
        return this.#load(this.load_uri.bind(this), uri)
    }
    loadHTML(html, base = null) {
        return this.#load(this.load_html.bind(this), html, base)
    }
})
