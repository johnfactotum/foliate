import Gio from 'gi://Gio'
import GLib from 'gi://GLib'
import Gtk from 'gi://Gtk'

/**
 * Google Translate HTTP TTS for Foliate (fork-friendly).
 *
 * - Fetches MP3 from translate.google.* /translate_tts (no URLSearchParams; use encodeQuery).
 * - Parses SSML from the reader into plain text + mark offsets for highlighting.
 * - Playback: mpv (JSON IPC time-pos/duration → highlight tracks real speed), else ffplay
 *   with wall-clock progress scaled by speed when ffprobe duration is known, else Gtk.MediaFile.
 * - Subprocesses: always use get_successful() after wait_finish (a finished wait is not always exit 0).
 *
 * Respect Google's terms of service; this is best-effort unofficial integration for accessibility.
 */

const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
const MAX_Q = 195

function encodeQuery(params) {
    return Object.entries(params)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&')
}

function decodeEntities(s) {
    return s
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
}

/** @returns {{ lang: string, plain: string, marks: { name: string, offset: number }[] }} */
function parseSSML(ssml) {
    const langM = ssml.match(/xml:lang="([^"]+)"/)
    const lang = langM ? langM[1] : 'en'
    const marks = []
    let plain = ''
    const re = /<mark[^>]*\bname="([^"]+)"[^>]*\/>|<[^>]+>|[^<]+/gy
    let m
    while ((m = re.exec(ssml)) !== null) {
        const full = m[0]
        if (full.startsWith('<mark')) marks.push({ name: m[1], offset: plain.length })
        else if (full.startsWith('<')) continue
        else plain += decodeEntities(full)
    }
    plain = plain.replace(/\s+/g, ' ').trim()
    return { lang, plain, marks }
}

function chunkText(s) {
    if (!s) return []
    const out = []
    let rest = s
    while (rest.length > MAX_Q) {
        let cut = rest.lastIndexOf(' ', MAX_Q)
        if (cut < MAX_Q / 2) cut = MAX_Q
        out.push(rest.slice(0, cut).trim())
        rest = rest.slice(cut).trim()
    }
    if (rest) out.push(rest)
    return out
}

function runCmdSync(argv) {
    const proc = Gio.Subprocess.new(
        argv,
        Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_MERGE,
    )
    const [, stdout] = proc.communicate_utf8(null, null)
    if (!proc.get_successful()) throw new Error(stdout || argv.join(' '))
    return stdout
}

function runCmdAsync(argv, flags = Gio.SubprocessFlags.NONE) {
    const proc = Gio.Subprocess.new(argv, flags)
    return new Promise((resolve, reject) => {
        proc.wait_async(null, (_, res) => {
            try {
                proc.wait_finish(res)
                resolve(proc.get_successful())
            } catch (e) {
                reject(e)
            }
        })
    })
}

function probeDurationSeconds(path) {
    try {
        const out = runCmdSync([
            'ffprobe', '-v', 'error', '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1', path,
        ])
        const n = parseFloat(out.trim())
        return Number.isFinite(n) && n > 0 ? n : null
    } catch {
        return null
    }
}

function sleepMs(ms) {
    return new Promise(resolve => {
        GLib.timeout_add(GLib.PRIORITY_DEFAULT, ms, () => {
            resolve()
            return GLib.SOURCE_REMOVE
        })
    })
}

export class GoogleTranslateTTS {
    #tl = ''
    #tld = 'com'
    #speed = 1
    #volume = 100
    #abort = false
    #subproc = null
    #gtkMedia = null
    #tickId = 0
    #mpvInput = null
    #mpvOutput = null
    #mpvIpcPath = null
    #mpvReqId = 0
    #playBackend = ''
    #playStartUs = 0
    #fileDuration = 0
    #plainLen = 1
    #marks = []
    #onProgress = null
    #playDone = null

    #translateHost() {
        return this.#tld === 'cn' ? 'translate.google.cn' : `translate.google.${this.#tld}`
    }

    #translateBase() {
        return `https://${this.#translateHost()}`
    }

    setLanguage(code) {
        this.#tl = code ?? ''
    }

    setRegion(tld) {
        this.#tld = tld || 'com'
    }

    setRate(_rate) {
        /* legacy SSIP */
    }

    setPitch(_pitch) {
        /* unused */
    }

    setSpeed(speed) {
        this.#speed = Math.max(0.25, Math.min(3, speed))
    }

    setVolume(vol) {
        this.#volume = Math.max(0, Math.min(100, Math.round(vol)))
    }

    /** Update volume without restarting playback. */
    setVolumeLive(vol) {
        this.#volume = Math.max(0, Math.min(100, Math.round(vol)))
        this.#mpvSend(['set_property', 'volume', this.#volume])
        if (this.#gtkMedia) {
            try {
                this.#gtkMedia.get_media_stream()?.set_volume?.(this.#volume / 100)
            } catch (e) { console.debug(e) }
        }
    }

    /** Update speed without restarting playback. */
    setSpeedLive(speed) {
        this.#speed = Math.max(0.25, Math.min(3, speed))
        this.#mpvSend(['set_property', 'speed', this.#speed])
    }

    /** Fire-and-forget: send a JSON command to mpv IPC without waiting for response. */
    #mpvSend(cmd) {
        if (!this.#mpvOutput) return
        try {
            const line = JSON.stringify({ command: cmd }) + '\n'
            this.#mpvOutput.put_string(line, null)
        } catch (e) { console.debug(e) }
    }

    #closeMpvIpc() {
        try {
            this.#mpvInput?.close(null)
        } catch (e) {
            console.debug(e)
        }
        try {
            this.#mpvOutput?.close(null)
        } catch (e) {
            console.debug(e)
        }
        this.#mpvInput = null
        this.#mpvOutput = null
        if (this.#mpvIpcPath) {
            try {
                GLib.unlink(this.#mpvIpcPath)
            } catch (e) {
                console.debug(e)
            }
            this.#mpvIpcPath = null
        }
    }

    #clearPlayback() {
        if (this.#tickId) {
            GLib.source_remove(this.#tickId)
            this.#tickId = 0
        }
        this.#closeMpvIpc()
        if (this.#subproc) {
            try {
                this.#subproc.force_exit()
            } catch (e) {
                console.debug(e)
            }
            this.#subproc = null
        }
        if (this.#gtkMedia) {
            try {
                this.#gtkMedia.get_media_stream()?.pause?.()
            } catch (e) {
                console.debug(e)
            }
            this.#gtkMedia = null
        }
        this.#onProgress = null
        const d = this.#playDone
        this.#playDone = null
        d?.()
    }

    stop() {
        this.#abort = true
        this.#clearPlayback()
        return Promise.resolve()
    }

    pause() {
        return this.stop()
    }

    resume() {
        return Promise.resolve()
    }

    async init() {
        /* no-op */
    }

    async listSynthesisVoices() {
        return []
    }

    #pickMark(fraction) {
        if (!this.#marks.length) return null
        const pos = Math.min(1, Math.max(0, fraction)) * this.#plainLen
        let best = null
        for (const m of this.#marks)
            if (m.offset <= pos) best = m.name
        return best
    }

    #scheduleFfplayTick() {
        if (this.#tickId) GLib.source_remove(this.#tickId)
        this.#tickId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 50, () => {
            if (this.#abort) return GLib.SOURCE_REMOVE
            const elapsed = (GLib.get_monotonic_time() - this.#playStartUs) / 1e6
            const effDur = this.#fileDuration / Math.max(0.25, this.#speed)
            const frac = effDur > 0 ? Math.min(1, elapsed / effDur) : 0
            this.#onProgress?.(frac)
            return GLib.SOURCE_CONTINUE
        })
    }

    async #httpGet(url, referer) {
        const curl = GLib.find_program_in_path('curl')
        if (curl) {
            const tmp = GLib.build_filenamev([GLib.get_tmp_dir(), `foliate-curl-${GLib.random_int()}.bin`])
            const ok = await runCmdAsync([
                curl, '-fsSL', '-A', UA, '-e', referer, '-o', tmp, url,
            ])
            if (!ok) throw new Error('Network request failed')
            const [, bytes] = GLib.file_get_contents(tmp)
            try {
                GLib.unlink(tmp)
            } catch {
                /* */
            }
            return bytes
        }
        const file = Gio.File.new_for_uri(url)
        return new Promise((resolve, reject) => {
            file.load_contents_async(null, (f, res) => {
                try {
                    const [, contents] = f.load_contents_finish(res)
                    resolve(contents)
                } catch (e) {
                    reject(e)
                }
            })
        })
    }

    async #synthesizeToPath(plain, lang) {
        const tl = (this.#tl || lang.split(/[-_]/)[0] || 'en').toLowerCase()
        const base = this.#translateBase()
        const referer = `${base}/`
        const chunks = chunkText(plain)
        const parts = []
        for (const q of chunks) {
            if (this.#abort) throw new Error('aborted')
            const query = encodeQuery({ ie: 'UTF-8', client: 'gtx', tl, q })
            const url = `${base}/translate_tts?${query}`
            const bytes = await this.#httpGet(url, referer)
            const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
            if (arr.length < 80) throw new Error('Unexpected TTS response')
            parts.push(arr)
        }
        let total = 0
        for (const p of parts) total += p.length
        const merged = new Uint8Array(total)
        let o = 0
        for (const p of parts) {
            merged.set(p, o)
            o += p.length
        }
        const path = GLib.build_filenamev([GLib.get_tmp_dir(), `foliate-tts-${GLib.random_int()}.mp3`])
        GLib.file_set_contents(path, merged)
        return path
    }

    async #mpvRequest(cmd) {
        const id = ++this.#mpvReqId
        const line = JSON.stringify({ command: cmd, request_id: id }) + '\n'
        this.#mpvOutput.put_string(line, null)
        while (this.#mpvInput && !this.#abort) {
            const [l] = await new Promise((resolve, reject) => {
                this.#mpvInput.read_line_async(GLib.PRIORITY_DEFAULT, null, (s, res) => {
                    try {
                        resolve(s.read_line_finish_utf8(res))
                    } catch (e) {
                        reject(e)
                    }
                })
            })
            if (!l) continue
            let obj
            try {
                obj = JSON.parse(l)
            } catch {
                continue
            }
            if (obj.request_id === id) return obj
        }
        return null
    }

    async #mpvPollLoop() {
        while (!this.#abort && this.#playBackend === 'mpv' && this.#mpvOutput) {
            await sleepMs(80)
            try {
                const r = await this.#mpvRequest(['get_property', 'time-pos'])
                const r2 = await this.#mpvRequest(['get_property', 'duration'])
                const pos = r?.data
                const dur = r2?.data
                if (typeof pos === 'number' && typeof dur === 'number' && dur > 0)
                    this.#onProgress?.(pos / dur)
            } catch (e) {
                console.debug(e)
                break
            }
        }
    }

    async #playMpv(path) {
        const mpv = GLib.find_program_in_path('mpv')
        if (!mpv) return false
        this.#mpvIpcPath = GLib.build_filenamev([GLib.get_tmp_dir(), `foliate-mpv-${GLib.random_int()}.sock`])
        const argv = [
            mpv, '--no-terminal', '--really-quiet', '--no-video', '--no-config',
            `--input-ipc-server=${this.#mpvIpcPath}`,
            `--speed=${this.#speed}`,
            `--volume=${this.#volume}`,
            path,
        ]
        const launcher = new Gio.SubprocessLauncher({
            flags: Gio.SubprocessFlags.STDOUT_SILENCE | Gio.SubprocessFlags.STDERR_SILENCE,
        })
        this.#subproc = launcher.spawnv(argv)
        for (let i = 0; i < 80 && !this.#abort; i++) {
            if (GLib.file_test(this.#mpvIpcPath, GLib.FileTest.EXISTS)) break
            await sleepMs(25)
        }
        if (!GLib.file_test(this.#mpvIpcPath, GLib.FileTest.EXISTS)) {
            this.#clearPlayback()
            return false
        }
        try {
            const address = Gio.UnixSocketAddress.new(this.#mpvIpcPath)
            const client = new Gio.SocketClient()
            const conn = await new Promise((resolve, reject) => {
                client.connect_async(address, null, (_, res) => {
                    try {
                        resolve(client.connect_finish(res))
                    } catch (e) {
                        reject(e)
                    }
                })
            })
            this.#mpvOutput = Gio.DataOutputStream.new(conn.get_output_stream())
            this.#mpvInput = Gio.DataInputStream.new(conn.get_input_stream())
            this.#mpvInput.set_newline_type(Gio.DataStreamNewlineType.LF)
        } catch (e) {
            console.debug(e)
            this.#clearPlayback()
            return false
        }
        this.#playBackend = 'mpv'
        void this.#mpvPollLoop()
        await new Promise(resolve => {
            this.#playDone = resolve
            this.#subproc.wait_async(null, () => {
                if (this.#playDone === resolve) {
                    this.#playDone = null
                    resolve()
                }
                this.#clearPlayback()
            })
        })
        return true
    }

    async #playFfplay(path) {
        const ffplay = GLib.find_program_in_path('ffplay')
        if (!ffplay) return false
        const tempo = Math.min(2, Math.max(0.5, this.#speed))
        const af = this.#speed !== 1 ? ['-af', `atempo=${tempo}`] : []
        const argv = [
            ffplay, '-nodisp', '-autoexit', '-loglevel', 'quiet',
            '-volume', String(this.#volume), ...af, path,
        ]
        const launcher = new Gio.SubprocessLauncher({
            flags: Gio.SubprocessFlags.STDOUT_SILENCE | Gio.SubprocessFlags.STDERR_SILENCE,
        })
        this.#subproc = launcher.spawnv(argv)
        this.#playBackend = 'ffplay'
        this.#playStartUs = GLib.get_monotonic_time()
        this.#scheduleFfplayTick()
        await new Promise(resolve => {
            this.#playDone = resolve
            this.#subproc.wait_async(null, () => {
                if (this.#playDone === resolve) {
                    this.#playDone = null
                    resolve()
                }
                this.#clearPlayback()
            })
        })
        return true
    }

    async #playGtk(path) {
        const file = Gio.File.new_for_path(path)
        const media = Gtk.MediaFile.new()
        this.#gtkMedia = media
        media.set_file(file)
        const stream = media.get_media_stream()
        stream.set_volume(this.#volume / 100)
        this.#playBackend = 'gtk'
        stream.play()
        if (this.#tickId) GLib.source_remove(this.#tickId)
        this.#tickId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 50, () => {
            if (this.#abort) return GLib.SOURCE_REMOVE
            try {
                const d = stream.get_duration()
                const t = stream.get_timestamp()
                if (d > 0) this.#onProgress?.(t / d)
            } catch (e) {
                console.debug(e)
            }
            return GLib.SOURCE_CONTINUE
        })
        await new Promise(resolve => {
            this.#playDone = resolve
            const watch = () => {
                if (this.#abort) {
                    try {
                        stream.pause()
                    } catch {
                        /* */
                    }
                    if (this.#playDone === resolve) {
                        this.#playDone = null
                        resolve()
                    }
                    this.#clearPlayback()
                    return
                }
                try {
                    const d = stream.get_duration()
                    const t = stream.get_timestamp()
                    if (d > 0 && t >= d - 50000) {
                        if (this.#playDone === resolve) {
                            this.#playDone = null
                            resolve()
                        }
                        this.#clearPlayback()
                        return
                    }
                } catch {
                    /* */
                }
                GLib.timeout_add(GLib.PRIORITY_DEFAULT, 100, () => {
                    watch()
                    return GLib.SOURCE_REMOVE
                })
            }
            watch()
        })
        return true
    }

    async #playPath(path) {
        this.#fileDuration = probeDurationSeconds(path) ?? 0
        if (await this.#playMpv(path)) return
        if (await this.#playFfplay(path)) return
        await this.#playGtk(path)
    }

    #makeIter(path, marks, plainLen) {
        this.#marks = marks
        this.#plainLen = Math.max(1, plainLen)
        let lastMark = null
        const queue = []
        let wake = () => {}

        this.#onProgress = frac => {
            const m = this.#pickMark(frac)
            if (m !== null && m !== lastMark) {
                lastMark = m
                queue.push({ mark: m })
                wake()
            }
        }

        const pump = async () => {
            try {
                await this.#playPath(path)
            } catch (e) {
                console.error(e)
            } finally {
                try {
                    GLib.unlink(path)
                } catch {
                    /* */
                }
                queue.push({ message: 'END' })
                wake()
            }
        }
        void pump()

        let afterEnd = false
        const next = async () => {
            if (afterEnd) return { done: true }
            while (!queue.length) await new Promise(r => {
                wake = r
            })
            const item = queue.shift()
            if (item?.mark) return { value: { mark: item.mark }, done: false }
            if (item?.message === 'END') {
                afterEnd = true
                return { value: { message: 'END' }, done: false }
            }
            afterEnd = true
            return { done: true }
        }
        return {
            next,
            [Symbol.asyncIterator]() {
                return this
            },
        }
    }

    async speak(str) {
        await this.stop()
        this.#abort = false
        const { lang, plain, marks } = parseSSML(str)
        const sorted = [...marks].sort((a, b) => a.offset - b.offset)
        if (!plain) {
            let ended = false
            return {
                async next() {
                    if (!ended) {
                        ended = true
                        return { value: { message: 'END' }, done: false }
                    }
                    return { done: true }
                },
                [Symbol.asyncIterator]() {
                    return this
                },
            }
        }
        const path = await this.#synthesizeToPath(plain, lang)
        return this.#makeIter(path, sorted, plain.length)
    }
}

/** @deprecated Use {@link GoogleTranslateTTS} — kept for forks that still import the old name. */
export const SSIPClient = GoogleTranslateTTS
