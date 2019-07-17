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
'use strict'

pkg.initGettext()
const ngettext = imports.gettext.ngettext
pkg.initFormat()
pkg.require({
    'Gio': '2.0',
    'Gtk': '3.0'
})

const GObject = imports.gi.GObject
const Gio = imports.gi.Gio
const GLib = imports.gi.GLib
const Gtk = imports.gi.Gtk
const Gdk = imports.gi.Gdk
const GdkPixbuf = imports.gi.GdkPixbuf
const Webkit = imports.gi.WebKit2
const Pango = imports.gi.Pango
const ByteArray = imports.byteArray

const flatpakSpawn = GLib.find_program_in_path('flatpak-spawn')
const execCommand = (argv, input = null, waitCheck, token, noFlatpakSpawn) =>
new Promise((resolve, reject) => {
    if (flatpakSpawn && !noFlatpakSpawn) argv = [flatpakSpawn, '--host', ...argv]
    try {
        const launcher = new Gio.SubprocessLauncher({
            flags: input
                ? Gio.SubprocessFlags.STDIN_PIPE | Gio.SubprocessFlags.STDOUT_PIPE
                : Gio.SubprocessFlags.STDOUT_PIPE
        })
        launcher.setenv('G_MESSAGES_DEBUG', '', true)
        const proc = launcher.spawnv(argv)
        proc.communicate_utf8_async(input, null, (proc, res) => {
            try {
                const [ok, stdout, stderr] = proc.communicate_utf8_finish(res)
                if (!stdout) reject()
                else resolve(stdout)
            } catch (e) {
                reject(e)
            }
        })
        if (waitCheck) proc.wait_check_async(null, ok => ok ? resolve() : reject(new Error()))
        if (token) token.interrupt = () => {
            proc.send_signal(2)
            reject()
        }
    } catch (e) {
        reject(e)
    }
})

class Storage {
    constructor(key, type, indent) {
        this.indent = indent

        const dataDir = type === 'cache' ? GLib.get_user_cache_dir()
            : type === 'config' ? GLib.get_user_config_dir()
            : GLib.get_user_data_dir()

        this._destination = GLib.build_filenamev([dataDir, pkg.name,
            `${encodeURIComponent(key)}.json`])
        this._file = Gio.File.new_for_path(this._destination)

        this._data = this._read()
    }
    _read() {
        try {
            const [success, data, tag] = this._file.load_contents(null)
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
            const [success, tag] = this._file
                .replace_contents(JSON.stringify(data, null, this.indent),
                    null, false, Gio.FileCreateFlags.REPLACE_DESTINATION, null)
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
}

const settings = new Gio.Settings({ schema_id: pkg.name })

const useSidebar = settings.get_boolean('use-sidebar')

const kindleExts = ['.mobi', '.prc', '.azw', '.azw3']

const defaultThemes = {
    [_('Light')]: {
        color: '#000', background: '#fff', link: 'blue',
        darkMode: false, invert: false
    },
    [_('Sepia')]: {
        color: '#5b4636', background: '#efe7dd', link: 'darkcyan',
        darkMode: false, invert: false
    },
    [_('Dark')]: {
        color: '#eee', background: '#222', link: 'cyan',
        darkMode: true, invert: false
    },
    [_('Invert')]: {
        color: '#000', background: '#fff', link: 'blue',
        darkMode: true, invert: true
    }
}
const defaultLayouts = {
    [_('Auto')]: 'paginated',
    [_('Single')]: 'single',
    [_('Scrolled')]: 'scrolled-doc'
}

const highlightColors = [['yellow', _('Yellow')], ['orange', _('Orange')],
    ['red', _('Red')], ['magenta', _('Magenta')], ['aqua', _('Aqua')], ['lime', _('Lime')]]

const coloredText = (color, text) =>
    `<span bgcolor="${color}" bgalpha="25%">${text}</span>`

const lookupWikipedia = (word, language, callback) => {
    const webView = new Webkit.WebView({
        settings: new Webkit.Settings({
            enable_write_console_messages_to_stdout: true,
            allow_universal_access_from_file_urls: true
        })
    })
    const scriptRun = script =>
        webView.run_javascript(script, null, () => {})
    const scriptGet = (script, f) => {
        webView.run_javascript(`JSON.stringify(${script})`, null,
            (self, result) => {
                const jsResult = self.run_javascript_finish(result)
                const value = jsResult.get_js_value()
                const obj = JSON.parse(value.to_string())
                f(obj)
            })
    }
    webView.load_uri(GLib.filename_to_uri(
        pkg.pkgdatadir + '/assets/wikipedia.html', null))

    webView.connect('notify::title', self => {
        const { type, payload } = JSON.parse(self.title)
        switch (type) {
            case 'can-lookup':
                scriptRun(`query("${encodeURIComponent(word)}", '${language}')`)
                break
            case 'lookup-results':
                scriptGet(`lookupResults`, results => {
                    callback(null,
                        '<span alpha="70%" size="smaller">'
                        + _('From Wikipedia, the free encyclopedia') + '</span>\n'
                        + `<b>${results.title}</b>\n`
                        + `${results.extract}\n`
                        + `<a href="https://${language}.wikipedia.org/wiki/${word}">`
                        + _('View on Wikipedia') + `</a>`)
                })
                break
            case 'lookup-error':
                callback(new Error())
                break
        }
    })
}

const lookupGTranslate = (word, language, callback) => {
    const webView = new Webkit.WebView({
        settings: new Webkit.Settings({
            enable_write_console_messages_to_stdout: true,
            allow_universal_access_from_file_urls: true
        })
    })
    const scriptRun = script =>
        webView.run_javascript(script, null, () => {})
    const scriptGet = (script, f) => {
        webView.run_javascript(`JSON.stringify(${script})`, null,
            (self, result) => {
                const jsResult = self.run_javascript_finish(result)
                const value = jsResult.get_js_value()
                const obj = JSON.parse(value.to_string())
                f(obj)
            })
    }
    webView.load_uri(GLib.filename_to_uri(
        pkg.pkgdatadir + '/assets/google-translate.html', null))

    webView.connect('notify::title', self => {
        const { type, payload } = JSON.parse(self.title)
        switch (type) {
            case 'can-lookup':
                scriptRun(`query("${encodeURIComponent(word)}", '${language}')`)
                break
            case 'lookup-results':
                scriptGet(`lookupResults`, results => {
                    callback(null,
                        '<span alpha="70%" size="smaller">'
                        + _('Translation by Google Translate') + '</span>\n'
                        + results)
                })
                break
            case 'lookup-error':
                callback(new Error())
                break
        }
    })
}

const dictionaries = {
    wiktionary: {
        name: _('Wiktionary (English)'),
        useMarkup: true,
        lookup: (word, language, callback) => {
            const webView = new Webkit.WebView({
                settings: new Webkit.Settings({
                    enable_write_console_messages_to_stdout: true,
                    allow_universal_access_from_file_urls: true
                })
            })
            const scriptRun = script =>
                webView.run_javascript(script, null, () => {})
            const scriptGet = (script, f) => {
                webView.run_javascript(`JSON.stringify(${script})`, null,
                    (self, result) => {
                        const jsResult = self.run_javascript_finish(result)
                        const value = jsResult.get_js_value()
                        const obj = JSON.parse(value.to_string())
                        f(obj)
                    })
            }

            webView.load_uri(GLib.filename_to_uri(
                pkg.pkgdatadir + '/assets/wiktionary.html', null))

            webView.connect('notify::title', self => {
                const { type, payload } = JSON.parse(self.title)
                switch (type) {
                    case 'can-lookup':
                        scriptRun(`queryDictionary("${encodeURIComponent(word)}",
                            '${language}')`)
                        break
                    case 'lookup-again':
                        scriptRun(`queryDictionary("${encodeURIComponent(payload)}",
                            '${language}')`)
                        break
                    case 'lookup-results':
                        scriptGet(`lookupResults`, results => {
                            callback(null,
                                '<span alpha="70%" size="smaller">'
                                + _('From Wiktionary, the free dictionary') + '</span>\n'
                                + `<b>${results.word}</b> ${results.pronunciation || ''}\n`
                                + `${results.defs.join('\n')}\n`
                                + `<a href="https://en.wiktionary.org/wiki/${word}">`
                                + _('View on Wiktionary') + '</a>')
                        })
                        break
                    case 'lookup-error':
                        callback(new Error())
                        break
                }
            })
        }
    },
}

const makeDictdDict = (id, name) => ({
    name,
    noWrap: true,
    lookup: (word, language, callback) => {
        try {
            const command = ['dict', '-d', id, word]
            execCommand(command).then(stdout => {
                callback(null, stdout)
            }).catch(() => callback(new Error()))
        } catch(e) {
            callback(new Error())
        }
    }
})
const parseDictDbs = x => x.split('\n').filter(x => x).map(row => {
    const cols = row.split('\t')
    return { id: cols[2], name: cols[3] }
})
execCommand(['dict', '--dbs', '--formatted'])
    .then(stdout => parseDictDbs(stdout).forEach(db =>
        dictionaries['dcitd_' + db.id] = makeDictdDict(db.id, db.name)))

const TTS_COMMANDS = ['']
execCommand(['espeak', '--version']).then(() => TTS_COMMANDS.push('espeak'))
execCommand(['festival', '--version']).then(() => TTS_COMMANDS.push('festival --tts'))

const exportToHTML = data => `<!DOCTYPE html>
<meta charset="utf-8">
<style>
body {
    max-width: 720px;
    padding: 10px;
    margin: auto;
}
header {
    text-align: center;
}
hr {
    border: 0;
    height: 1px;
    background: rgba(0, 0, 0, 0.2);
    margin: 20px 0;
}
.cfi {
    font-size: small;
    opacity: 0.5;
    font-family: monospace;
}
blockquote {
    margin: 0;
    padding-left: 15px;
    border-left: 7px solid;
}
</style>
<header>
${_('<p>Annotations for</p><h1>%s</h1><h2>By %s</h2>')
.format(data.metadata.title, data.metadata.creator)}
</header>
<p>${ngettext('%d Annotation', '%d Annotations', data.annotations.length).
format(data.annotations.length)}</p>
${data.annotations.map(({ value, text, color, note }) => `<hr>
<section>
    <p class="cfi">${value}</p>
    <blockquote style="border-color: ${color};">${text}</blockquote>
    ${note ? `<p>${note}</p>` : ''}
</section>
`).join('')}
`

const exportToTxt = data => `${_('Annotations for\n%s\nBy %s')
.format(data.metadata.title, data.metadata.creator)}

${ngettext('%d Annotation', '%d Annotations', data.annotations.length).
format(data.annotations.length)}
${data.annotations.map(({ value, text, color, note }) => `
--------------------------------------------------------------------------------

${_('Text:')}
${text}
${note ? `
${_('Note:')}
${note}
` : ''}`).join('')}
`


class Navbar {
    constructor(ttsButton, onSlide, onPrev, onNext, onBack) {
        this._percentage = NaN
        this._history = []

        this._slider = new Gtk.Scale({
            orientation: Gtk.Orientation.HORIZONTAL,
            adjustment: new Gtk.Adjustment({ value: 0, lower: 0, upper: 1 }),
            digits: 5,
            hexpand: true,
            value_pos: Gtk.PositionType.LEFT
        })
        this._slider.connect('format-value', (_, x) => `${Math.round(x * 100)}%`)

        this._prevButton = new Gtk.Button({
            image: new Gtk.Image({ icon_name: 'go-previous-symbolic' }),
            tooltip_text: _('Previous page'),
            sensitive: false,
            visible: true
        })
        this._nextButton = new Gtk.Button({
            image: new Gtk.Image({ icon_name: 'go-next-symbolic' }),
            tooltip_text: _('Next page'),
            sensitive: false,
            visible: true
        })

        const box = new Gtk.Box({ hexpand: true, visible: true })
        this._pendingLabel = new Gtk.Image({
            icon_name: 'content-loading-symbolic',
            visible: true
        })
        box.pack_start(this._pendingLabel, true, true, 0)
        box.pack_start(this._slider, true, true, 0)

        this._backButton = new Gtk.Button({
            image: new Gtk.Image({ icon_name: 'edit-undo-symbolic' }),
            tooltip_text: _('Go back'),
            sensitive: false,
            visible: true
        })

        this.goBack = () => {
            if (!this._history.length) return
            onBack(this._history.pop())
            if (!this._history.length) this._backButton.sensitive = false
        }
        this._backButton.connect('clicked', this.goBack)

        this.widget = new Gtk.ActionBar({ visible: true })
        this.widget.pack_start(this._prevButton)
        this.widget.pack_start(this._backButton)
        this.widget.pack_end(this._nextButton)
        this.widget.pack_end(ttsButton)
        this.widget.pack_end(box)

        this._slider.connect('button-release-event', () => {
            const value = this._slider.get_value()
            if (value !== this._percentage) onSlide(this._slider.get_value())
        })
        this._slider.connect('value-changed', () => this.updateReadingTime())
        this._prevButton.connect('clicked', () => onPrev())
        this._nextButton.connect('clicked', () => onNext())
    }
    setReady({ percentage, total, language }) {
        this._total = total
        this._percentage = percentage
        this._slider.set_value(percentage)
        this._pendingLabel.hide()
        this._slider.show()
        this._language = (language || '').slice(0, 2).toLowerCase()
    }
    setSectionMarks(sectionMarks) {
        this._sectionMarks = sectionMarks
        if (sectionMarks.length < 60) sectionMarks.forEach(x =>
            this._slider.add_mark(x, Gtk.PositionType.TOP, null))
        this.updateReadingTime()
    }
    updateSlider(percentage) {
        this._percentage = percentage
        this._slider.set_value(percentage)
    }
    updateReadingTime() {
        if (!this._total) return
        const percentage = this._slider.get_value()
        const lang = this._language

        // rough estimate of reading time
        // should be reasonable for English and European languages
        // will be way off for some langauges
        const CHARACTERS_PER_WORD =
            lang === 'zh' || lang === 'ja' || lang === 'ko' ? 2.5 : 6
        const WORDS_PER_MINUTE = 200
        const estimate = x => (x - percentage) * this._total
            * 1600 // chars passed to `book.locations.generate()`
            / CHARACTERS_PER_WORD / WORDS_PER_MINUTE

        const nextSection =  (this._sectionMarks || []).find(x => x > percentage)
        const n = estimate(1)
        const m = estimate(nextSection)

        const inBook = n => {
            if (n < 60) return ngettext(
                '%d minute left in book',
                '%d minutes left in book', n).format(n)
            else {
                const h = n / 60
                return ngettext(
                    '%d hour left in book',
                    '%d hours left in book', h).format(h)
            }
        }
        const inSection = n => {
            if (n < 60) return ngettext(
                '%d minute left in chapter',
                '%d minutes left in chapter', n).format(n)
            else {
                const h = n / 60
                return ngettext(
                    '%d hour left in chapter',
                    '%d hours left in chapter', h).format(h)
            }
        }
        this._slider.tooltip_text = n ? (m ? inSection(m) + '\n' : '') + inBook(n) : null
    }
    pushHistory(x) {
        this._history.push(x)
        this._backButton.sensitive = true
    }
    setAtStart(atStart) {
        this._prevButton.sensitive = !atStart
    }
    setAtEnd(atEnd) {
        this._nextButton.sensitive = !atEnd
    }
}
class NavEntry {
    constructor(total, onChange) {
        const box = new Gtk.Box()
        box.get_style_context().add_class('linked')
        this._currentEntry = new Gtk.Entry({ xalign: 1 })
        this._currentEntry.connect('activate', () => {
            const x = parseInt(this._currentEntry.text) - 1
            if (isNaN(x) || x > total) this._currentEntry.text = this._current || '0'
            else onChange(x)
        })
        this._totalEntry = new Gtk.Entry({ sensitive: false })

        const totalLabel = _('of %d').format(total)
        this._currentEntry.set_width_chars(total.toString().length + 1)
        this._totalEntry.set_width_chars(totalLabel.length + 1)
        this._totalEntry.text = totalLabel

        box.pack_start(this._currentEntry, false, true, 0)
        box.pack_start(this._totalEntry, false, true, 0)
        box.show_all()
        this.widget = box
    }
    setCurrent(x) {
        x = x + 1
        this._current = x.toString()
        this._currentEntry.text = x.toString()
    }
}

class JumpList {
    constructor(width, height, isToc, onChange, frame) {
        const store = isToc ? new Gtk.TreeStore() : new Gtk.ListStore()
        store.set_column_types([GObject.TYPE_STRING, GObject.TYPE_STRING])

        const view = new Gtk.TreeView({
            model: store,
            headers_visible: false,
            expand: true
        })
        const col = new Gtk.TreeViewColumn()
        view.append_column(col)

        const text = new Gtk.CellRendererText()
        if (isToc) {
            text.ellipsize = Pango.EllipsizeMode.END
            view.set_tooltip_column(0)
        } else {
            text.wrap_mode = Gtk.WRAP_WORD
            text.wrap_width = width
        }
        col.pack_start(text, true)
        col.add_attribute(text, 'markup', 0)

        const selection = view.get_selection()
        view.set_activate_on_single_click(true)
        view.connect('row-activated', () => {
            const [, , iter] = selection.get_selected()
            const href = store.get_value(iter, 1)
            onChange(href)
        })

        const scroll = new Gtk.ScrolledWindow({
            min_content_width: width,
            min_content_height: height
        })
        if (frame) scroll.get_style_context().add_class('frame')
        if (!isToc) scroll.hscrollbar_policy = Gtk.PolicyType.NEVER
        scroll.add(view)

        this.store = store
        this.view = view
        this.widget = scroll
    }
    loadSearchResults(results, query) {
        this.store.clear()
        const regex = new RegExp(query, 'ig')
        results.forEach(item => {
            const newIter = this.store.append()
            const label = item.excerpt.trim().replace(/\n/g, ' ')
            const m = label.replace(regex, `<b>${regex.exec(label)[0]
                .replace(/&/g, '&amp;')}</b>`)
            this.store.set(newIter, [0, 1], [m, item.cfi])
        })
    }
    loadToc(toc) {
        const f = (toc, iter = null) => {
            toc.forEach(chapter => {
                const newIter = this.store.append(iter)
                const label = chapter.label.trim()
                this.store.set(newIter, [0, 1], [label, chapter.href])
                if (chapter.subitems) f(chapter.subitems, newIter)
            })
        }
        f(toc)
    }
    selectSection(href) {
        const store = this.store
        const selection = this.view.get_selection()
        let [, iter] = store.get_iter_first()
        loop:
        while (true) {
            // remove anchors as currently there's no way of handling them;
            // perhaps we may get the DOM element of the anchors,
            // then create CFIs from them, then we can handle them properly
            const value = store.get_value(iter, 1).split('#')[0]
            if (value === href) {
                const path = store.get_path(iter)
                this.view.expand_to_path(path)
                this.view.scroll_to_cell(path, null, true, 0.5, 0)
                selection.select_iter(iter)
                break
            }
            const [hasChild, childIter] = store.iter_children(iter)
            if (hasChild) iter = childIter
            else {
                while (true) {
                    const [hasParent, parentIter] = store.iter_parent(iter)
                    if (!store.iter_next(iter)) {
                        if (hasParent) iter = parentIter
                        else break loop
                    } else break
                }
            }
        }
    }
}

class Toc {
    constructor(width, height, toc, onChange, frame = true) {
        this._jumpList = new JumpList(width, height, true, onChange, frame)
        this._jumpList.loadToc(toc)

        this.widget = this._jumpList.widget
        this.widget.show_all()
    }
    selectSection(href) {
        this._jumpList.selectSection(href)
    }
}

// workaround for xgettext bug (https://savannah.gnu.org/bugs/?50920)
//`/`

class SearchPopover {
    constructor(button, onChange, onSearch) {
        this._searchEntry = new Gtk.SearchEntry({
            placeholder_text: _('Find in Book'),
            width_request: 320
        })
        const search = () =>
            onSearch(this._searchEntry.get_text().trim(), inChapterButton.active)
        this._searchEntry.connect('activate', search)
        this._searchEntry.connect('search-changed', () => {
            const text = this._searchEntry.get_text()
            if (text === '') onSearch(text)
        })

        const rangeBox = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            spacing: 3
        })
        const inBookButton = new Gtk.RadioButton({ label: _('All chapters') })
        inBookButton.connect('toggled', search)
        const inChapterButton = new Gtk.RadioButton({ label: _('Current chapter') })
        inChapterButton.join_group(inBookButton)
        inChapterButton.connect('toggled', search)
        rangeBox.pack_start(inBookButton, false, true, 0)
        rangeBox.pack_start(inChapterButton, false, true, 0)

        this._jumpList = new JumpList(320, 350, false, href => {
            onChange(href)
            button.active = false
        }, true)
        this._statusLabel = new Gtk.Label({ halign: Gtk.Align.START })
        this._statusLabel.get_style_context().add_class('dim-label')

        const box = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL, spacing: 10
        })
        box.pack_start(this._searchEntry, false, true, 0)
        box.pack_start(rangeBox, false, true, 0)
        box.pack_end(this._statusLabel, false, true, 0)
        box.pack_end(this._jumpList.widget, true, true, 0)

        this.widget = new Gtk.Popover({ border_width: 10 })
        this.widget.add(box)
        this.widget.show_all()
        this._statusLabel.hide()
        this._jumpList.widget.hide()
        this.widget.hide()
    }
    setPending() {
        this._searchEntry.get_style_context().remove_class('error')
        this._jumpList.store.clear()
        this._jumpList.widget.show()
        this._statusLabel.label = _('Searching…')
        this._statusLabel.show()
    }
    loadResults(results, query) {
        const n = results.length
        this._statusLabel.label = n === 0
            ? _('No results')
            : ngettext('%d result', '%d results', n).format(n)
        this._jumpList.loadSearchResults(results, query)
        if (!n) {
            this._searchEntry.get_style_context().add_class('error')
        }
    }
    setEnd() {
        this._searchEntry.get_style_context().remove_class('error')
        this._jumpList.widget.hide()
        this._statusLabel.hide()
    }
}

class FontBox {
    constructor(onChange) {
        this._onChange = onChange

        const fontBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL })
        fontBox.get_style_context().add_class('linked')
        this._fontButton = new Gtk.FontButton({
            use_font: true,
            show_style: false
        })
        this._decButton = new Gtk.Button({
            image: new Gtk.Image({
                gicon: Gio.ThemedIcon
                    .new_from_names(['value-decrease-symbolic', 'list-remove-symbolic'])
            })
        })
        this._incButton = new Gtk.Button({
            image: new Gtk.Image({
                gicon: Gio.ThemedIcon
                    .new_from_names(['value-increase-symbolic', 'list-add-symbolic'])
            })
        })
        this._decButton.connect('clicked', () => this.dec())
        this._incButton.connect('clicked', () => this.inc())
        this._fontButton.connect('font-set', () => this.applyFont())
        fontBox.pack_start(this._fontButton, true, true, 0)
        fontBox.pack_start(this._decButton, false, true, 0)
        fontBox.pack_start(this._incButton, false, true, 0)

        this.widget = fontBox
    }
    applyFont()  {
        this._onChange()
    }
    dec() {
        const desc = this._fontButton.get_font_desc()
        desc.set_size(desc.get_size() - 0.5 * Pango.SCALE)
        this._fontButton.set_font_desc(desc)
        this.applyFont()
    }
    inc() {
        const desc = this._fontButton.get_font_desc()
        desc.set_size(desc.get_size() + 0.5 * Pango.SCALE)
        this._fontButton.set_font_desc(desc)
        this.applyFont()
    }
    setFont(font) {
        this._fontButton.set_font(font)
        this.applyFont()
    }
    getFont() {
        return {
            desc: this._fontButton.get_font_desc(),
            name: this._fontButton.get_font()
        }
    }
}
class RadioBox {
    constructor(options, onChange) {
        const optionsPerLine = 4
        this._buttons = Object.assign({},
            ...options.map(theme =>
                ({ [theme]: new Gtk.RadioButton({ label: theme }) })))
        const onToggle = button => { if (button.active) onChange(button.label) }
        const mainBox = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 10
        })
        const boxes = Array.from({
                length: Math.ceil(options.length / optionsPerLine)
            }, () => new Gtk.Box({ spacing: 3 }))
        const first = this._buttons[Object.keys(this._buttons)[0]]
        options.forEach((x, i) => {
            const button = this._buttons[x]
            button.join_group(first)
            button.active = false
            button.connect('toggled', onToggle)
            boxes[Math.ceil((i + 1) / optionsPerLine) - 1]
                .pack_start(button, false, true, 0)
        })
        boxes.forEach(box => mainBox.pack_start(box, false, true, 0))
        this.widget = mainBox
    }
    applyOption() {
        for (const x in this._buttons) {
            const button = this._buttons[x]
            if (button.active) button.emit('toggled')
        }
    }
    activate(x) {
        (this._buttons[x] || this._buttons[Object.keys(this._buttons)[0]]).active = true
    }
    getActive() {
        return Object.values(this._buttons).filter(x => x.active)[0].label
    }
}

class TitleAndDesc {
    constructor(title, desc) {
        const box = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL })
        const titleLabel = new Gtk.Label({
            label: title,
            xalign: 0
        })
        const descLabel = new Gtk.Label({
            label: '<small>' + desc + '</small>',
            use_markup: true,
            xalign: 0
        })
        descLabel.set_line_wrap(true)
        descLabel.get_style_context().add_class('dim-label')
        box.pack_start(titleLabel, false, true, 0)
        box.pack_start(descLabel, false, true, 0)
        this.widget = box
    }
}

class SwitchBox {
    constructor(label, key, onChange) {
        this.widget = new Gtk.Box({ spacing: 6 })
        const switchLabel = typeof label === 'string'
            ? new Gtk.Label({ label }) : new TitleAndDesc(label[0], label[1]).widget
        this._switch = new Gtk.Switch({ valign: Gtk.Align.CENTER })
        this._switch.active = settings.get_boolean(key)

        this._switch.connect('state-set', (widget, state) => {
            settings.set_boolean(key, state)
            onChange(state)
        })
        this.widget.pack_start(switchLabel, false, true, 0)
        this.widget.pack_end(this._switch, false, true, 0)
    }
    get active() {
        return this._switch.active
    }
}
class ComboBoxBox {
    constructor(label, key, items, onChange, withEntry, activeId) {
        const comboLabel = typeof label === 'string'
            ? new Gtk.Label({ label }) : new TitleAndDesc(label[0], label[1]).widget
        const combo =  withEntry
            ? Gtk.ComboBoxText.new_with_entry()
            : new Gtk.ComboBoxText()
        combo.valign = Gtk.Align.CENTER
        items.forEach(withEntry
            ? text => combo.append_text(text)
            : ([id, text]) => combo.append(id, text))

        if (activeId) combo.active_id = activeId

        if (withEntry) {
           if (onChange) combo.connect('changed', () => onChange(combo.get_child().text))
           if (key) settings.bind(key, combo.get_child(), 'text', Gio.SettingsBindFlags.DEFAULT)
        } else {
            if (onChange) combo.connect('changed', () => onChange(combo.active_id))
            if (key) settings.bind(key, combo, 'active-id', Gio.SettingsBindFlags.DEFAULT)
        }

        const box = new Gtk.Box({ spacing: 6 })
        box.pack_start(comboLabel, false, false, 0)
        box.pack_end(combo, false, false, 0)
        box.show_all()

        this.widget = box
    }
}

class ViewPopover {
    constructor(themes, onChange, onLayoutChange) {
        this.widget = new Gtk.Popover({ border_width: 10 })

        const grid = new Gtk.Grid()
        grid.column_spacing = 10
        grid.row_spacing = 10
        this._grid = grid

        const onViewChange = () => {
            const font = this._fontBox.getFont()
            const spacing = this._spacingButton.get_value()
            const margin = this._marginButton.get_value()
            const brightness = this._brightnessSlider.get_value()
            const theme = this._themeBox.getActive()
            const useDefault = this._defaultSwitch.active
            const justify = this._justifySwitch.active
            const hyphenate = this._hyphenateSwitch.active
            onChange({
                font, spacing, margin, brightness, theme, useDefault, justify, hyphenate
            })
        }
        this._onViewChange = onViewChange

        this._fontBox = new FontBox(onViewChange)
        this._themeBox = new RadioBox(Object.keys(themes), onViewChange)
        this._layoutBox = new RadioBox(Object.keys(defaultLayouts), onLayoutChange)

        this._defaultSwitch = new SwitchBox(_('Use Publisher Font'),
            'use-default-font', onViewChange)
        this._justifySwitch = new SwitchBox(_('Full Justification'),
            'justify', onViewChange)
        this._hyphenateSwitch = new SwitchBox(_('Auto-Hyphenation'),
            'hyphenate', onViewChange)

        this._spacingButton = new Gtk.SpinButton()
        this._spacingButton.set_range(1, 3)
        this._spacingButton.set_digits(2)
        this._spacingButton.set_increments(0.05, 0)
        this._spacingButton.connect('value-changed', onViewChange)

        this._marginButton = new Gtk.SpinButton()
        this._marginButton.set_range(0, 40)
        this._marginButton.set_digits(1)
        this._marginButton.set_increments(2.5, 0)
        this._marginButton.connect('value-changed', onViewChange)

        this._brightnessSlider = new Gtk.Scale({
            orientation: Gtk.Orientation.HORIZONTAL,
            adjustment: new Gtk.Adjustment({ lower: 0.5, upper: 1.2, step_increment: 0.05 }),
            digits: 2,
            value_pos: Gtk.PositionType.RIGHT
        })
        this._brightnessSlider.connect('format-value', (_, x) => `${Math.round(x * 100)}%`)
        this._brightnessSlider.add_mark(1, Gtk.PositionType.TOP, null)
        this._brightnessSlider.connect('value-changed', onViewChange)

        const menuLabels = {
            font: new Gtk.Label({ label: _('Font') }),
            spacing: new Gtk.Label({ label: _('Spacing') }),
            margin: new Gtk.Label({ label: _('Margins') }),
            brightness: new Gtk.Label({ label: _('Brightness') }),
            theme: new Gtk.Label({ label: _('Theme') }),
            layout: new Gtk.Label({ label: _('Layout') }),
            options: new Gtk.Label({ label: _('Options') })
        }
        for (let key in menuLabels) {
            const label = menuLabels[key]
            label.get_style_context().add_class('dim-label')
            label.halign = Gtk.Align.END
        }

        grid.attach(menuLabels.font, 0, 0, 1, 1)
        grid.attach(this._fontBox.widget, 1, 0, 1, 1)
        grid.attach(menuLabels.spacing, 0, 1, 1, 1)
        grid.attach(this._spacingButton, 1, 1, 1, 1)
        grid.attach(menuLabels.margin, 0, 2, 1, 1)
        grid.attach(this._marginButton, 1, 2, 1, 1)
        grid.attach(menuLabels.brightness, 0, 3, 1, 1)
        grid.attach(this._brightnessSlider, 1, 3, 1, 1)
        grid.attach(menuLabels.theme, 0, 4, 1, 1)
        grid.attach(this._themeBox.widget, 1, 4, 1, 1)
        grid.attach(new Gtk.Separator(), 0, 5, 2, 1)
        grid.attach(menuLabels.layout, 0, 6, 1, 1)
        grid.attach(this._layoutBox.widget, 1, 6, 1, 1)
        grid.attach(new Gtk.Separator(), 0, 7, 2, 1)
        grid.attach(menuLabels.options, 0, 8, 1, 1)
        grid.attach(this._defaultSwitch.widget, 1, 8, 1, 1)
        grid.attach(this._justifySwitch.widget, 1, 9, 1, 1)
        grid.attach(this._hyphenateSwitch.widget, 1, 10, 1, 1)
        this.widget.add(grid)
        this.widget.show_all()
        this.widget.hide()
    }
    decFont() {
        this._fontBox.dec()
    }
    incFont() {
        this._fontBox.inc()
    }
    loadSettings(font, spacing, margin, brightness, theme, layout) {
        this._fontBox.setFont(font)
        this._spacingButton.set_value(spacing)
        this._marginButton.set_value(margin)
        this._brightnessSlider.set_value(brightness)
        this._themeBox.activate(theme)
        this._themeBox.applyOption()
        this._layoutBox.activate(layout)
    }
    updateThemes(themes) {
        this._themeBox = new RadioBox(Object.keys(themes), this._onViewChange)
        this._themeBox.widget.show_all()
        this._grid.remove_row(4)
        this._grid.insert_row(4)
        const label = new Gtk.Label({ label: _('Theme'), visible: true })
        label.get_style_context().add_class('dim-label')
        label.halign = Gtk.Align.END
        this._grid.attach(label, 0, 4, 1, 1)
        this._grid.attach(this._themeBox.widget, 1, 4, 1, 1)
        this._themeBox.applyOption()
    }
    get theme() {
        return this._themeBox.getActive()
    }
    set theme(theme) {
        if (theme) this._themeBox.activate(theme)
    }
    get layout() {
        return this._layoutBox.getActive()
    }
    get font() {
        return this._fontBox.getFont()
    }
    get spacing() {
        return this._spacingButton.get_value()
    }
}

class NotesList {
    constructor(width, height, onActivate, onChange, emptyState, frame) {
        this._width = width
        this._frame = frame
        this._listBox = new Gtk.ListBox()
        this._listBox.set_header_func(row => {
            if (row.get_index()) row.set_header(new Gtk.Separator())
        })

        this._rowMap = new Map() // GtkRow -> value, for row activation
        this._removeMap = new Map() // value -> removeFunc, for removing by value
        this._labelMap = new Map() // value -> GtkLabel
        this._label2Map = new Map() // value -> GtkLabel
        this._dataMap = new Map() // value -> data

        this._listBox.connect('row-activated', (_, row) =>
            onActivate(this._rowMap.get(row)))

        const scroll = new Gtk.ScrolledWindow({
            min_content_width: width,
            min_content_height: height
        })
        if (frame) scroll.get_style_context().add_class('frame')
        scroll.add(this._listBox)

        this.widget = new Gtk.Stack()
        this.widget.add_named(scroll, 'list')
        this.widget.add_named(this._buildEmptyState(width, height, emptyState),'empty')

        this._emptyState.show()
        scroll.hide()
        this._onChange = (...args) => {
            if (this._rowMap.size) {
                this._emptyState.hide()
                scroll.show()
            } else {
                this._emptyState.show()
                scroll.hide()
            }
            onChange(...args)
        }
    }
    _buildEmptyState(width, height, { icon, title, message }) {
        this._emptyState = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 10,
            border_width: 10,
            valign: Gtk.Align.CENTER
        })
        const image = new Gtk.Image({ icon_name: icon, pixel_size: 48 })
        image.get_style_context().add_class('dim-label')
        const titleLabel = new Gtk.Label({
            label: `<big>${title}</big>`,
            use_markup: true,
            justify: Gtk.Justification.CENTER,
        })
        titleLabel.set_line_wrap(true)
        titleLabel.get_style_context().add_class('dim-label')
        const messageLabel = new Gtk.Label({
            label: message,
            use_markup: true,
            justify: Gtk.Justification.CENTER
        })
        messageLabel.set_line_wrap(true)
        messageLabel.get_style_context().add_class('dim-label')

        const box = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            valign: Gtk.Align.CENTER,
            spacing: 10
        })
        box.pack_start(image, false, true, 0)
        box.pack_start(titleLabel, false, true, 0)
        box.pack_start(messageLabel, false, true, 0)

        this._emptyState = new Gtk.ScrolledWindow({ width_request: width, height_request: height })
        if (this._frame) this._emptyState.get_style_context().add_class('frame')
        this._emptyState.add(box)
        return this._emptyState
    }
    has(value) {
        return Array.from(this._rowMap.values()).includes(value)
    }
    add(text, text2, value, data, onRemove) {
        if (this.has(value)) return
        const row = new Gtk.ListBoxRow({
            selectable: false, width_request: this._width
        })
        const label = new Gtk.Label({
            label: text,
            use_markup: true,
            lines: 3,
            ellipsize: Pango.EllipsizeMode.MIDDLE,
            xalign: 0
        })
        label.set_line_wrap(true)
        const label2 = new Gtk.Label({
            label: (text2 || '').trim().replace(/\n/g, ' '),
            halign: Gtk.Align.START,
            use_markup: true,
            lines: 3,
            ellipsize: Pango.EllipsizeMode.END,
            xalign: 0
        })
        label2.set_line_wrap(true)

        const button = new Gtk.Button({
            image: new Gtk.Image({ icon_name: 'edit-delete-symbolic' }),
            relief: Gtk.ReliefStyle.NONE,
            valign: Gtk.Align.CENTER
        })

        this._rowMap.set(row, value)
        if (data) this._dataMap.set(value, data)
        this._labelMap.set(value, label)
        this._label2Map.set(value, label2)

        const removeFunc = () => {
            this._listBox.remove(row)
            this._rowMap.delete(row)
            this._removeMap.delete(value)
            this._dataMap.delete(value)
            this._labelMap.delete(value)
            this._label2Map.delete(value)
            onRemove(value)
            this._onChange(this.getValues())
        }
        this._removeMap.set(value, removeFunc)
        button.connect('clicked', removeFunc)

        const box = new Gtk.Box({ spacing: 3 })
        box.pack_start(label, true, true, 0)
        box.pack_end(button, false, true, 0)

        const box2 = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, border_width: 3 })
        box2.pack_start(box, true, true, 0)
        box2.pack_end(label2, true, true, 0)
        row.add(box2)

        row.show_all()
        if (!text2) label2.hide()
        this._listBox.add(row)
        this._onChange(this.getValues())
    }
    remove(value) {
        this._removeMap.get(value)()
    }
    setLabel(value, text) {
        this._labelMap.get(value).label = text
        this._onChange(this.getValues())
    }
    setLabel2(value, text) {
        const label = this._label2Map.get(value)
        label.label = text.trim().replace(/\n/g, ' ')
        if (text) label.show()
        else label.hide()
        this._onChange(this.getValues())
    }
    getData(value) {
        return this._dataMap.get(value)
    }
    getValues() {
        const values = Array.from(this._rowMap.values())
        if (this._dataMap.size) return values.map(value =>
            Object.assign({ value }, this._dataMap.get(value)))
        else return values
    }
}
class Bookmarks {
    constructor(width, height, onActivate, onAdd, onChange, onCanAddChange, frame = true) {
        this._onCanAddChange = onCanAddChange

        this._notesList = new NotesList(width, height, onActivate, onChange, {
            icon: 'non-starred-symbolic',
            title: _('No bookmarks'),
            message: _('Add some bookmarks to see them here.')
        }, frame)
        this._addButton = new Gtk.Button({ hexpand: true })
        const add = (text, value) => {
            this._notesList.add(text, null, value, null, () => {
                if (value === this._currentCfi) this.setCanAdd()
            })
            this.setAdded(value)
        }
        this._initFunc = add
        this._addFunc = () => onAdd(add)
        this._addButton.connect('clicked', () => this.doButtonAction())
        this.setCanAdd()

        const bookmarksBox = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL, spacing: frame ? 10 : 0
        })
        const buttonBox = new Gtk.Box({ border_width: frame ? 0 : 6 })
        buttonBox.add(this._addButton)
        bookmarksBox.pack_start(this._notesList.widget, true, true, 0)
        if (!frame) bookmarksBox.pack_start(new Gtk.Separator, false, true, 0)
        bookmarksBox.pack_end(buttonBox, false, true, 0)

        this.widget = bookmarksBox
        this.widget.show_all()
    }
    init(arr) {
        arr.forEach(row => {
            const [text, value] = row
            this._initFunc(text, value)
        })
    }
    doButtonAction() {
        this._buttonAction()
    }
    setCanAdd() {
        this._addButton.image = new Gtk.Image({ icon_name: 'list-add-symbolic' })
        this._addButton.tooltip_text = _('Bookmark current location')
        this._buttonAction = this._addFunc
        this._onCanAddChange(true)
    }
    setAdded(value) {
        this._addButton.image = new Gtk.Image({ icon_name: 'edit-delete-symbolic' })
        this._addButton.tooltip_text = _('Remove current location')
        this._buttonAction = () => this._notesList.remove(value)
        this._onCanAddChange(false)
    }
    update(cfi) {
        this._currentCfi = cfi
        if (this._notesList.has(cfi)) this.setAdded(cfi)
        else this.setCanAdd()
    }
}
class Annotations {
    constructor(width, height, onActivate, onChange, onRemove, frame = true) {
        this._onRemove = onRemove
        this._notesList = new NotesList(width, height, onActivate, onChange, {
            icon: 'document-edit-symbolic',
            title: _('No annotations'),
            message: _('Highlight some text to add annotations.')
        }, frame)

        this.widget = this._notesList.widget
        this.widget.show_all()
    }
    init(arr) {
        arr.forEach(data => {
            const { text, note, color, value } = data
            const label = coloredText(color, text)
            this.add(label, note, value, data, this._onRemove)
        })
    }
    add(text, text2, value, data) {
        this._notesList.add(text, text2, value, data, this._onRemove)
    }
    remove(value) {
        this._notesList.remove(value)
    }
    setLabel(value, text) {
        this._notesList.setLabel(value, text)
    }
    setLabel2(value, text) {
        this._notesList.setLabel2(value, text)
    }
    getData(value) {
        return this._notesList.getData(value)
    }
}

const maxBy = (arr, f) =>
    arr[arr.map(f).reduce((prevI, x, i, arr) => x > arr[prevI] ? i : prevI, 0)]

const makePopoverOptions = ({ left, right, top, bottom }, window, height = 400) => {
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

    return {
        position: { x: maxBorder[2], y: maxBorder[3] },
        positionType: maxBorder[1]
    }
}
class ActionPopover {
    constructor([relativeTo, position, window], actions, contents) {
        this.widget = new Gtk.Popover({ border_width: 10, relative_to: relativeTo })
        const actionBox = new Gtk.Box()
        actionBox.get_style_context().add_class('linked')
        actions.forEach(action => actionBox.pack_start(action, true, true, 0))

        const box = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 10 })
        box.pack_start(actionBox, true, true, 0)
        contents.forEach(content => box.pack_start(content, false, true, 0))

        this.widget.add(box)
        box.show_all()
        if (!actions.length) actionBox.hide()

        const setPosition = height => {
            const { position: rectPosition, positionType } =
                makePopoverOptions(position, window, height)
            this.widget.set_position(positionType)
            const rectangle = new Gdk.Rectangle(rectPosition)
            this.widget.set_pointing_to(rectangle)
        }

        this.widget.connect('size-allocate', () =>
            setPosition(this.widget.get_allocation().height))

        setPosition(200)
        this.widget.popup()
    }
}
class SelectionPopover {
    constructor(options, onAnnotate, onLookup, onTranslate, onCopy) {
        const copyButton = new Gtk.Button({ label: _('Copy') })
        copyButton.connect('clicked', () => {
            onCopy()
            this.popover.widget.popdown()
        })
        const noteButton = new Gtk.Button({ label: _('Highlight') })
        noteButton.connect('clicked', () => {
            onAnnotate()
            this.popover.widget.destroy()
        })
        const dictButton = new Gtk.Button({ label: _('Lookup') })
        dictButton.connect('clicked', () => {
            onLookup()
            this.popover.widget.destroy()
        })
        const transButton = new Gtk.Button({ label: _('Translate') })
        transButton.connect('clicked', () => {
            onTranslate()
            this.popover.widget.destroy()
        })

        this.popover = new ActionPopover(options,
            [noteButton, dictButton, transButton, copyButton], [])
    }
}
class LookupPopover {
    constructor(options, onAnnotate, onCopy, word, language, dict, action = 'dictionary') {
        const copyButton = new Gtk.Button({ label: _('Copy') })
        copyButton.connect('clicked', () => {
            onCopy()
            this.popover.widget.popdown()
        })
        const noteButton = new Gtk.Button({ label: _('Highlight') })
        noteButton.connect('clicked', () => {
            this.popover.widget.destroy()
            onAnnotate()
        })

        this._label = new Gtk.Label({
            label: _('Loading…'),
            selectable: true,
            valign: Gtk.Align.START,
            xalign: 0,
            max_width_chars: 60
        })
        this._label.set_line_wrap(true)

        this._scroll = new Gtk.ScrolledWindow({
            min_content_width: 300,
            min_content_height: 200
        })
        const lbox = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            border_width: 5
        })
        lbox.pack_start(this._label, true, true, 0)
        this._scroll.get_style_context().add_class('frame')
        this._scroll.add(lbox)

        const model = new Gtk.ListStore()
        model.set_column_types([GObject.TYPE_STRING, GObject.TYPE_STRING])
        const combo = new Gtk.ComboBox({ model })
        const renderer = new Gtk.CellRendererText({
            ellipsize: Pango.EllipsizeMode.END,
            width: 300
        })
        combo.pack_start(renderer, true)
        combo.add_attribute(renderer, 'text', 1)
        combo.id_column = 0

        Object.keys(dictionaries).forEach(dict => {
            const dictionary = dictionaries[dict]
           model.set(model.append(), [0, 1], [dict, dictionary.name])
        })
        combo.active_id = dict
        combo.connect('changed', () => {
            const id = combo.active_id
            this.lookup(dictionaries[id], word, language)
            settings.set_string('dictionary', id)
        })
        const dictBox = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 10
        })
        dictBox.pack_start(this._scroll, false, true, 0)
        dictBox.pack_start(combo, false, true, 0)

        const wikiBox = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 10
        })
        this._wikiLabel = new Gtk.Label({
            label: _('Loading…'),
            selectable: true,
            valign: Gtk.Align.START,
            xalign: 0,
            use_markup: true
        })
        this._wikiLabel.set_line_wrap(true)
        const wikiScroll = new Gtk.ScrolledWindow({
            min_content_width: 300,
            min_content_height: 200
        })
        const wikiLbox = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            border_width: 5
        })
        wikiLbox.pack_start(this._wikiLabel, true, true, 0)
        wikiScroll.get_style_context().add_class('frame')
        wikiScroll.add(wikiLbox)

        this._transLabel = new Gtk.Label({
            label: _('Loading…'),
            selectable: true,
            valign: Gtk.Align.START,
            xalign: 0,
            use_markup: true
        })
        this._transLabel.set_line_wrap(true)
        const transScroll = new Gtk.ScrolledWindow({
            min_content_width: 300,
            min_content_height: 200
        })
        const transLbox = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            border_width: 5
        })
        transLbox.pack_start(this._transLabel, true, true, 0)
        transScroll.get_style_context().add_class('frame')
        transScroll.add(transLbox)

        const transModel = new Gtk.ListStore()
        transModel.set_column_types([GObject.TYPE_STRING, GObject.TYPE_STRING])
        const transCombo = new Gtk.ComboBox({ model: transModel })
        transCombo.pack_start(renderer, true)
        transCombo.add_attribute(renderer, 'text', 1)
        transCombo.id_column = 0

        Object.keys(GT_LANGS).forEach(x =>
           transModel.set(transModel.append(), [0, 1], GT_LANGS[x]))
        transCombo.active_id = settings.get_string('translate-target-language')
        transCombo.connect('changed', () => {
            const id = transCombo.active_id
            this.gtranslate(word, id)
            settings.set_string('translate-target-language', id)
        })
        const transBox = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 10
        })
        transBox.pack_start(transScroll, false, true, 0)
        transBox.pack_start(transCombo, false, true, 0)

        const stack = new Gtk.Stack()
        const stackSwitcher = new Gtk.StackSwitcher({
            stack,
            homogeneous: true
        })
        stack.add_titled(dictBox, 'dictionary', _('Dictionary'))
        stack.add_titled(wikiScroll, 'wikipedia', _('Wikipedia'))
        stack.add_titled(transBox, 'translate', _('Translate'))

        this.popover = new ActionPopover(options,
            [noteButton, copyButton], [stack, stackSwitcher])

        const load = () => {
            switch (stack.visible_child_name) {
                case 'dictionary':
                    if (!this._lookuped) this.lookup(dictionaries[dict], word, language)
                    this._label.select_region(-1, -1)
                    break
                case 'wikipedia':
                    if (!this._wikipediaed)
                        this.wikipedia(word, (language || '').slice(0, 2).toLowerCase())
                    this._wikiLabel.select_region(-1, -1)
                    break
                case 'translate':
                    if (!this._gtranslated) this.gtranslate(word, transCombo.active_id)
                    this._transLabel.select_region(-1, -1)
                    break
            }
        }
        stack.visible_child_name = action
        stack.connect('notify::visible-child-name', load)
        load()
    }
    lookup(dictionary, word, language) {
        this._lookuped = true
        this._label.label = _('Loading…')
        dictionary.lookup(word, language, (err, results) => {
            this._scroll.propagate_natural_width = dictionary.noWrap
            this._label.use_markup = dictionary.useMarkup
            if (err) this._label.label = _('No definitions found.')
            else this._label.label = dictionary.useMarkup
                ? results.replace(/&/g, '&amp;') : results
        })
    }
    wikipedia(word, language = 'en') {
        this._wikipediaed = true
        lookupWikipedia(word, language, (err, results) => {
            if (err) this._wikiLabel.label = _('No entry found.')
                + '\n'
                + `<a href="https://${language}.wikipedia.org/w/index.php?search=${
                    encodeURIComponent(word)}">`
                + _('Search on Wikipedia')
                + '</a>'
            else this._wikiLabel.label = results.replace(/&/g, '&amp;')
        })
    }
    gtranslate(word, language = 'en') {
        this._gtranslated = true
        this._transLabel.label = _('Loading…')
        lookupGTranslate(word, language, (err, results) => {
            if (err) this._transLabel.label = _('Cannot retrieve translation.')
            else this._transLabel.label = results.replace(/&/g, '&amp;')
        })
    }
}
class AnnotationPopover {
    constructor(options, onRemove, onCopy, color, onColorChange, note, onNoteChange) {
        const copyButton = new Gtk.Button({ label: _('Copy') })
        copyButton.connect('clicked', () => {
            onCopy()
            this.popover.widget.popdown()
        })
        const removeButton = new Gtk.Button({ label: _('Remove') })
        removeButton.connect('clicked', () => {
            onRemove()
            this.popover.widget.popdown()
        })
        const noteButton = new Gtk.ToggleButton({ label: _('Note') })
        noteButton.connect('toggled', () => {
            scroll.visible = noteButton.active
            if (noteButton.active) textView.grab_focus()
        })

        const model = new Gtk.ListStore()
        model.set_column_types([GObject.TYPE_STRING, GObject.TYPE_STRING])

        const comboBox = new Gtk.ComboBox({ model })
        const renderer = new Gtk.CellRendererText()
        comboBox.pack_start(renderer, true)
        comboBox.add_attribute(renderer, 'markup', 1)

        highlightColors.forEach(x => {
            const text = coloredText(x[0], x[1])
            model.set(model.append(), [0, 1], [x[0], text])
        })
        comboBox.set_active(highlightColors.findIndex(([x]) => x === color))
        comboBox.connect('changed', () => {
            const [success, iter] = comboBox.get_active_iter()
            const value = model.get_value(iter, 0)
            onColorChange(value)
        })

        const textView = new Gtk.TextView({ wrap_mode: Gtk.WrapMode.WORD })
        const buffer = textView.get_buffer()
        const scroll = new Gtk.ScrolledWindow({
            min_content_height: 150
        })
        scroll.get_style_context().add_class('frame')
        scroll.add(textView)

        this.popover = new ActionPopover(options,
            [comboBox, noteButton, removeButton, copyButton], [scroll])

        if (note) {
            buffer.text = note
            noteButton.active = true
        } else scroll.hide()
        buffer.connect('changed', () => {
            onNoteChange(buffer.text)
        })
    }
}
class FootnotePopover {
    constructor(options, canGoTo, onGoTo) {
        this._label = new Gtk.Label({
            use_markup: true,
            selectable: true,
            valign: Gtk.Align.START,
            xalign: 0
        })
        this._label.set_line_wrap(true)
        const lbox = new Gtk.Box({ border_width: 5 })
        lbox.add(this._label)

        const scroll = new Gtk.ScrolledWindow({
            min_content_width: 300,
            min_content_height: 200
        })
        scroll.get_style_context().add_class('frame')
        scroll.add(lbox)

        let button
        if (canGoTo) {
            button = new Gtk.Button({
                label: _('Go to Linked Location')
            })
            button.connect('clicked', () => {
                onGoTo()
                this.popover.widget.popdown()
            })
        }
        this.popover = new ActionPopover(options, [],
            canGoTo ? [scroll, button] : [scroll])
    }
    load(footnote) {
        this._label.label = footnote
        this.popover.widget.popup()
        this._label.select_region(-1, -1)
    }
}
class ImgPopover {
    constructor(options, onZoom, onCopy) {
        const copyButton = new Gtk.Button({ label: _('Copy') })
        copyButton.connect('clicked', () => {
            onCopy()
            this.popover.widget.popdown()
        })
        const zoomButton = new Gtk.Button({ label: _('Zoom') })
        zoomButton.connect('clicked', () => {
            this.popover.widget.popdown()
            onZoom()
        })
        this.popover = new ActionPopover(options, [zoomButton, copyButton], [])
    }
}
class ImgViewer {
    constructor([windowWidth, windowHeight], height, width, imgAlt, pixbuf, onCopy) {
        const window = new Gtk.Window({
            default_width: Math.min(width * 2, windowWidth),
            default_height: Math.min(height * 2 + 70, windowHeight)
        })
        const headerBar = new Gtk.HeaderBar()
        headerBar.show_close_button = true
        headerBar.has_subtitle = false
        window.set_titlebar(headerBar)
        window.title = imgAlt

        const button = new Gtk.Button({ label: _('Copy') })
        button.connect('clicked', onCopy)
        headerBar.pack_start(button)

        const slider = new Gtk.Scale({
            orientation: Gtk.Orientation.HORIZONTAL,
            adjustment: new Gtk.Adjustment({
                lower: 0.1, upper: 4, step_increment: 0.1
            }),
            digits: 2,
            hexpand: true,
            draw_value: false
        })
        slider.set_value(1)
        slider.connect('format-value',
            (_, x) => `${Math.round(x * 100)}%`)
        slider.add_mark(1, Gtk.PositionType.BOTTOM, '100%')
        slider.add_mark(2, Gtk.PositionType.BOTTOM, '200%')
        slider.add_mark(4, Gtk.PositionType.BOTTOM, '400%')
        slider.connect('value-changed', () => {
            const zoom = slider.get_value()
            image.set_from_pixbuf(pixbuf.scale_simple(
                width * zoom,
                height * zoom,
                GdkPixbuf.InterpType.BILINEAR))
        })
        const bar = new Gtk.ActionBar()
        bar.pack_start(slider)

        const scroll = new Gtk.ScrolledWindow()
        const image = Gtk.Image.new_from_pixbuf(pixbuf)
        scroll.add(image)
        const container = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL
        })
        container.pack_start(scroll, true, true, 0)
        container.pack_end(bar, false, true, 0)
        window.add(container)

        window.show_all()
    }
}
class WelcomeScreen {
    constructor(lastFile, onRestore) {
        const box = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            valign: Gtk.Align.CENTER,
            halign: Gtk.Align.CENTER,
            spacing: 10
        })
        const image = new Gtk.Image({
            icon_name: 'document-open-symbolic', pixel_size: 80
        })
        image.get_style_context().add_class('dim-label')
        const title = new Gtk.Label({
            label: `<big><b>${_('Open some books to start reading')}</b></big>`,
            use_markup: true
        })
        title.get_style_context().add_class('dim-label')
        const label = new Gtk.Label({
            label: _('Open a file, or continue reading the last opened book.')
        })
        label.get_style_context().add_class('dim-label')
        const open = new Gtk.Button({
            label: _('Open File…'),
            action_name: 'app.open'
        })
        const restore = new Gtk.Button({
            label: _('Continue Reading')
        })
        restore.connect('clicked', onRestore)

        const buttonBox = new Gtk.Box({ spacing: 6, halign: Gtk.Align.CENTER })
        buttonBox.pack_start(open, false, true, 0)
        if (lastFile) buttonBox.pack_start(restore, false, true, 0)

        box.pack_start(image, false, true, 0)
        box.pack_start(title, false, true, 0)
        if (lastFile) box.pack_start(label, false, true, 0)
        box.pack_start(buttonBox, false, true, 18)
        box.show_all()

        this.widget = box
    }
}

class BookViewerWindow {
    constructor(application, width = -1, height = -1, fileName, themes = defaultThemes) {
        this.themes = themes
        this.canOpen = true

        this.application = application
        this.window = new Gtk.ApplicationWindow({
            application: application,
            default_width: width,
            default_height: height
        })
        if (pkg.version.endsWith('-devel'))
            this.window.get_style_context().add_class('devel')

        let windowWidth, windowHeight, windowMaximized
        this.window.connect('size-allocate', () => {
            [windowWidth, windowHeight] = this.window.get_size()
            windowMaximized = this.window.is_maximized
        })
        this.window.connect('destroy', () => {
            settings.set_int('window-width', windowWidth)
            settings.set_int('window-height', windowHeight)
            settings.set_boolean('window-maximized', windowMaximized)

            if (this._ttsToken) this._ttsToken.interrupt()
            if (this._tmpdir) GLib.rmdir(this._tmpdir)
        })

        this.activateTheme()

        this.headerBar = new Gtk.HeaderBar()
        this.headerBar.show_close_button = true
        this.headerBar.has_subtitle = false
        this.window.set_titlebar(this.headerBar)
        this.window.title = _('Foliate')
        this.window.show_all()

        this.buildMenu()
        if (fileName) this.open(fileName)
        else {
            const lastFile = settings.get_string('last-file')
            if (settings.get_boolean('restore-last-file')) this.open(lastFile)
            else {
                this.welcome = new WelcomeScreen(lastFile, () => {
                    this.open(lastFile)
                })
                this.window.add(this.welcome.widget)
            }
        }
    }
    open(fileName, realFileName) {
        if (kindleExts.some(x => fileName.endsWith(x))) {
            const python = GLib.find_program_in_path('python')
            const kindleUnpack = pkg.pkgdatadir + '/assets/KindleUnpack/kindleunpack.py'

            const dir = GLib.dir_make_tmp(null)
            this._tmpdir = dir

            const command = [python, kindleUnpack, '--epub_version=3', fileName, dir]
            execCommand(command, null, false, null, true).then(() => {
                const mobi8 = dir + '/mobi8/'
                if (GLib.file_test(mobi8, GLib.FileTest.EXISTS)) this.open(mobi8, fileName)
                else this.open(dir + '/mobi7/content.opf', fileName)
            })
            return
        }
        if (this.welcome) this.welcome.widget.destroy()
        if (this.error) this.error.destroy()
        this.canOpen = false
        this.fileName = realFileName || fileName

        this.spinner = new Gtk.Spinner({
            valign: Gtk.Align.CENTER,
            halign: Gtk.Align.CENTER,
            width_request: 48,
            height_request: 48
        })
        this.spinner.start()

        this.webViewSettings = new Webkit.Settings({
            enable_write_console_messages_to_stdout: true,
            allow_file_access_from_file_urls: true
        })
        this.webView = new Webkit.WebView({ settings: this.webViewSettings })
        this.webView.connect('context-menu', () => true)

        const viewer = settings.get_boolean('disable-csp')
            ? '/assets/viewer-nocsp.html' : '/assets/viewer.html'

        this.webView.load_uri(GLib.filename_to_uri(pkg.pkgdatadir + viewer, null))
        this.webView.connect('notify::title', self => {
            const action = JSON.parse(self.title)
            if (action.type === 'can-open')
                this.scriptRun(`openBook("${encodeURI(fileName)}")`)
            else this.handleAction(action)
        })

        this.container = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL })
        this.overlay = new Gtk.Overlay()
        this.overlay.add(this.webView)
        this.overlay.add_overlay(this.spinner)
        this.webView.opacity = 0

        this.container.pack_start(this.overlay, true, true, 0)
        this.window.add(this.container)
        this.window.show_all()
    }
    scriptRun(script) {
        if (this.webView) this.webView.run_javascript(script, null, () => {})
    }
    scriptGet(script, f) {
        if (this.webView) this.webView.run_javascript(`JSON.stringify(${script})`, null,
            (self, result) => {
                const jsResult = self.run_javascript_finish(result)
                const value = jsResult.get_js_value()
                const obj = JSON.parse(value.to_string())
                f(obj)
            })
    }
    bookError() {
        this.overlay.destroy()
        const box = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            valign: Gtk.Align.CENTER,
            halign: Gtk.Align.CENTER
        })
        const image = new Gtk.Image({
            icon_name: 'computer-fail-symbolic', pixel_size: 80
        })
        image.get_style_context().add_class('dim-label')
        const label = new Gtk.Label({
            label: `<big>${_('Oh no! The file cannot be opened')}</big>`,
            use_markup: true
        })

        // workaround for xgettext bug
        // `/`

        label.get_style_context().add_class('dim-label')
        const button = new Gtk.Button({
            label: _('Open Another File…'),
            action_name: 'app.open',
             halign: Gtk.Align.CENTER
        })
        box.pack_start(image, true, true, 18)
        box.pack_start(label, false, true, 0)
        box.pack_end(button, false, true, 18)
        box.show_all()
        this.error = box
        this.window.remove(this.container)
        this.window.add(box)
        this.canOpen = true
    }
    bookReady() {
        this.window.connect('destroy', () =>
            settings.set_string('last-file', this.fileName))

        this.scriptGet('book.package.metadata', metadata => {
            this.headerBar.title = metadata.title

            this.storage = new Storage(metadata.identifier)
            this.cache = new Storage(metadata.identifier, 'cache')

            const lastLocation = this.storage.get('lastLocation')
            const display = lastLocation ? `"${lastLocation}"` : 'undefined'
            const cached = this.cache.get('locations')

            this.scriptRun(`display(${display}, ${cached || null})`)

            this.storage.set('metadata', metadata)
            this.buildExport(metadata)
        })

        const section = new Gio.Menu()
        section.append(_('About This Book'), 'win.properties')
        section.append(_('Export Annotations…'), 'win.export')
        this.menu.prepend_section(null, section)
    }
    bookDisplayed() {
        this.setAutohideCursor()
        this.webView.connect('size-allocate', () =>
            this.scriptRun(`windowSize = ${this.webView.get_allocation().width}`))

        const goTo = x => this.scriptRun(`rendition.display('${x}')`)
        const withHistory = f => x =>
            this.scriptGet(`rendition.currentLocation().start.cfi`,
                cfi => { this.navbar.pushHistory(cfi); f(x) })

        this.scriptGet('[book.navigation.toc, book.spine.length]', ([toc, spineLength]) => {
            const options = {
                toc,
                onActivate: withHistory(goTo),
                onBookmarksAdd: add => {
                    this.scriptGet(`rendition.currentLocation().start.cfi`, cfi => {
                        add(cleanCfi(cfi), cfi)
                    })
                },
                onBookmarksChange: values => this.storage.set('bookmarks', values),
                onAnnotationsChange: values => this.storage.set('annotations', values),
                onAnnotationsRemove: value => this.scriptRun(`
                    rendition.annotations.remove("${value}", 'highlight')`),
                spineLength
            }
            if (useSidebar) this.buildSidebar(options)
            else this.buildPopovers(options)

            const annotations = this.storage.get('annotations', [])
            this.annotations.init(annotations)
            annotations.forEach(({ value, color }) =>
                this.scriptRun(`addAnnotation('${value}', '${color}')`))

            const cleanCfi = cfi => cfi.replace(/(^epubcfi\(|\)$)/g, '')
            this.bookmarks.init(this.storage.get('bookmarks', [])
                .map(x => [cleanCfi(x), x]))
        })

        this.buildNavbar(
            withHistory(x => this.scriptRun(`gotoPercentage(${x})`)),
            () => this.scriptRun('rendition.prev()'),
            () => this.scriptRun('rendition.next()'),
            x => this.scriptRun(`rendition.display('${x}')`))

        this.buildSearch(withHistory(goTo), (text, inChapter) => {
            if (typeof text !== 'undefined' && text !== '') {
                this.scriptRun(`search("${encodeURI(text)}", ${inChapter})`)
                this.searchPopover.setPending()
            } else {
                this.scriptRun('clearSearch()')
                this.searchPopover.setEnd()
            }
        })

        this.scriptRun(`footnoteEnabled = ${settings.get_boolean('footnote-enabled')}`)

        this.buildView(this.themes, ({
            font, spacing, margin, brightness, theme, useDefault, justify, hyphenate
        }) => {
            settings.set_string('font', font.name)
            settings.set_double('spacing', spacing)
            settings.set_double('margin', margin)
            settings.set_double('brightness', brightness)
            settings.set_string('theme', theme)

            const { color, background, link, darkMode, invert } =
                this.themes[theme]

            Gtk.Settings.get_default()
                .gtk_application_prefer_dark_theme = darkMode

            const fontFamily = font.desc.get_family()
            const fontSize = `${font.desc.get_size() / Pango.SCALE}pt`
            const fontWeight = font.desc.get_weight()
            const fontStyle = ['normal', 'italic', 'oblique'][font.desc.get_style()]

            this.webViewSettings.serif_font_family = useDefault? 'Serif' : fontFamily
            this.webViewSettings.sans_serif_font_family = useDefault ? 'Sans' : fontFamily
            this.webViewSettings.default_font_family = fontFamily

            const filter = `${invert ? 'invert(1) hue-rotate(180deg) ' : ''}brightness(${brightness})`
            this.scriptRun(`
                document.documentElement.style.filter = '${filter}'
                document.body.style.color = '${color}'
                document.body.style.background = '${background}'
                document.body.style.margin = '0 ${margin}%'
                rendition.resize()
            `)
            if (!useDefault) this.scriptRun(`
                rendition.themes.register('custom', {
                    '.custom': {
                        'color': '${color}',
                        'background': '${background}',
                        'font-family': '"${fontFamily}" !important',
                        'font-style': '${fontStyle}',
                        'font-size': '${fontSize} !important',
                        'font-weight': '${fontWeight} !important',
                        'line-height': '${spacing} !important',
                        '-webkit-hyphens': '${hyphenate ? 'auto' : 'manual'}',
                        '-webkit-hyphenate-limit-before': 3,
                        '-webkit-hyphenate-limit-after': 2,
                        '-webkit-hyphenate-limit-lines': 2
                    },
                    '.custom code, .custom pre': {
                        '-webkit-hyphens': 'none'
                    },
                    '.custom *:not(code):not(pre):not(code *):not(pre *)': {
                        'font-family': '"${fontFamily}" !important'
                    },
                    'p': {
                        'text-align': '${justify ? 'justify' : 'inherit'}'
                    },
                    '.custom p': {
                        'font-family': '"${fontFamily}" !important',
                        'font-size': '${fontSize} !important',
                        'line-height': '${spacing} !important'
                    },
                    '.custom a:link': { color: '${link}' }
                })
                rendition.themes.select('custom')`)
            else this.scriptRun(`
                rendition.themes.register('default-font', {
                    '.default-font': {
                        'color': '${color}',
                        'background': '${background}',
                        'font-size': '${fontSize} !important',
                        'line-height': '${spacing} !important',
                        '-webkit-hyphens': '${hyphenate ? 'auto' : 'manual'}',
                        '-webkit-hyphenate-limit-before': 3,
                        '-webkit-hyphenate-limit-after': 2,
                        '-webkit-hyphenate-limit-lines': 2
                    },
                    '.default-font code, .default-font pre': {
                        '-webkit-hyphens': 'none'
                    },
                    'p': {
                        'text-align': '${justify ? 'justify' : 'inherit'}'
                    },
                    '.default-font p': {
                        'font-size': '${fontSize} !important',
                        'line-height': '${spacing} !important'
                    },
                    '.default-font a:link': { color: '${link}' }
                })
                rendition.themes.select('default-font')`)

            this.scriptRun('redrawAnnotations()')
        },
        layout => {
            settings.set_string('layout', layout)
            const value = defaultLayouts[layout]
            this.scriptRun(`
                rendition.flow('${value === 'scrolled-doc' ? 'scrolled-doc' : 'paginated'}')`)
            if (value !== 'scrolled-doc')
                this.scriptRun(`rendition.spread('${value === 'single' ? 'none' : 'auto'}')`)
        })
        this.viewPopover.loadSettings(
            settings.get_string('font'),
            settings.get_double('spacing'),
            settings.get_double('margin'),
            settings.get_double('brightness'),
            settings.get_string('theme'),
            settings.get_string('layout'))

        settings.connect('changed::theme', () => {
            const theme = settings.get_string('theme')
            if (theme !== this.viewPopover.theme) this.viewPopover.theme = theme
        })

        this.scriptRun(`setupRendition()`)
    }
    handleAction({ type, payload }, options) {
        let lookupAction
        switch (type) {
            case 'book-error':
                this.bookError()
                break
            case 'book-ready':
                this.bookReady()
                break
            case 'book-displayed':
                this.bookDisplayed()
                break
            case 'cover':
                this.scriptGet('book.package.metadata', metadata => {
                    if (payload) this.scriptGet('coverBase64', coverBase64 =>
                        this.buildProperties(metadata, coverBase64))
                    else this.buildProperties(metadata)
                })
                break
            case 'locations-generated':
                this.scriptGet('locations', locations =>
                    this.cache.set('locations', locations))
            case 'locations-ready':
                this.navbar.setReady(payload)
                this.scriptGet(`book.spine.items.map(x => book.locations
                    .percentageFromCfi('epubcfi(' + x.cfiBase + '!/0)'))`,
                        sectionMarks => this.navbar.setSectionMarks(sectionMarks))
                break
            case 'relocated':
                if (this.navEntry) this.navEntry.setCurrent(payload.index)
                this.bookmarks.update(payload.cfi)
                this.navbar.setAtStart(payload.atStart)
                this.navbar.setAtEnd(payload.atEnd)
                this.atEnd = payload.atEnd
                this.storage.set('lastLocation', payload.cfi)
                if (this.webView.opacity === 0) {
                    if (this._hack) this._hack.destroy()
                    this.spinner.destroy()
                    this.webView.opacity = 1
                    this.webView.grab_focus()
                }
                break
            case 'update-slider':
                this.navbar.updateSlider(payload)
                break
            case 'link-external':
                Gtk.show_uri_on_window(null, payload, Gdk.CURRENT_TIME)
                break
            case 'link-internal':
                this.navbar.pushHistory(payload)
                break
            case 'section':
                this.toc.selectSection(payload)
                break
            case 'search-results':
                this.scriptGet('searchResults', results =>
                    this.searchPopover.loadResults(results, payload))
                break
            case 'annotation-add':
                this.scriptGet('selectionData', ({ text, cfiRange }) => {
                    const color = settings.get_string('highlight')
                    const data = { color, text }
                    this.scriptRun(`addAnnotation('${cfiRange}', '${color}')`)

                    const label = coloredText(color, text)
                    this.annotations.add(label, null, cfiRange, data)
                    this.scriptRun(`dispatch({
                        type: 'annotation-menu',
                        payload: {
                            cfiRange: "${cfiRange}",
                            position: ${JSON.stringify(payload)}
                        }
                    })`)
                })
                break
            case 'annotation-menu': {
                const { position, cfiRange } = payload
                const data = this.annotations.getData(cfiRange)

                new AnnotationPopover(
                    [this.webView, position, this.window],
                    () => {
                        this.annotations.remove(cfiRange)
                    },
                    () => Gtk.Clipboard
                        .get_default(Gdk.Display.get_default())
                        .set_text(data.text, -1),
                    data.color,
                    color => {
                        settings.set_string('highlight', color)
                        data.color = color
                        this.scriptRun(`
                            addAnnotation('${cfiRange}', '${color}')`)
                        const text = coloredText(color, data.text)
                        this.annotations.setLabel(cfiRange, text)
                    },
                    data.note,
                    note => {
                        data.note = note
                        this.annotations.setLabel2(cfiRange, note)
                    })
                break
            }
            case 'wikipedia':
                this.handleAction({ type: 'lookup', payload }, 'wikipedia')
                break
            case 'translate':
                this.handleAction({ type: 'lookup', payload }, 'translate')
                break
            case 'lookup':
                this.scriptGet('selectionData', ({ text, language, cfiRange }) => {
                    const dict = settings.get_string('dictionary')

                    const popover = new LookupPopover(
                        [this.webView, payload, this.window],
                        () => {
                            this.scriptRun(`clearSelection()`)
                            this.scriptRun(`dispatch({
                                type: 'annotation-add',
                                payload: ${JSON.stringify(payload)}
                            })`)
                        },
                        () => Gtk.Clipboard
                            .get_default(Gdk.Display.get_default())
                            .set_text(text, -1),
                        text, language, dict, options)

                    popover.popover.widget.connect('closed', () => {
                        this.scriptRun('clearSelection()')
                    })
                })
                break
            case 'selection': {
                let shouldClearSelection = true
                const highlightFunc = () => this.scriptRun(`dispatch({
                    type: 'annotation-add',
                    payload: ${JSON.stringify(payload)}
                })`)
                const lookupFunc = () => {
                    shouldClearSelection = false
                    this.scriptRun(`dispatch({
                        type: 'lookup',
                        payload: ${JSON.stringify(payload)}
                    })`)
                }
                const wikipediaFunc = () => {
                    shouldClearSelection = false
                    this.scriptRun(`dispatch({
                        type: 'wikipedia',
                        payload: ${JSON.stringify(payload)}
                    })`)
                }
                const translateFunc = () => {
                    shouldClearSelection = false
                    this.scriptRun(`dispatch({
                        type: 'translate',
                        payload: ${JSON.stringify(payload)}
                    })`)
                }
                const isSingle = payload.isSingle
                const selectionAction = settings.get_string(isSingle
                    ? 'selection-action-single' : 'selection-action-multiple')
                switch (selectionAction) {
                    case 'highlight':
                        this.scriptRun('clearSelection()')
                        highlightFunc()
                        break
                    case 'dictionary':
                        lookupFunc()
                        break
                    case 'wikipedia':
                        wikipediaFunc()
                        break
                    case 'translate':
                        translateFunc()
                        break
                    case 'ask': {
                        const popover = new SelectionPopover(
                            [this.webView, payload, this.window],
                            highlightFunc,
                            lookupFunc,
                            translateFunc,
                            () => this.scriptGet('selectionData', ({ text }) => {
                                Gtk.Clipboard
                                    .get_default(Gdk.Display.get_default())
                                    .set_text(text, -1)
                            }))
                        popover.popover.widget.connect('closed', () => {
                            if (shouldClearSelection)
                                this.scriptRun('clearSelection()')
                        })
                        break
                    }
                }
                break
            }
            case 'footnote': {
                const popover = new FootnotePopover(
                    [this.webView, payload, this.window],
                    payload.canGoTo, () => this.scriptRun(`followLink()`))

                this.scriptGet('footnote', footnote => popover.load(footnote))
                break
            }
            case 'img': {
                this.scriptGet(`{ imgBase64, imgAlt }`, ({ imgBase64, imgAlt }) => {
                    const data = GLib.base64_decode(imgBase64)
                    const imageStream = Gio.MemoryInputStream.new_from_bytes(data)
                    const pixbuf = GdkPixbuf.Pixbuf.new_from_stream(imageStream, null)
                    const width = pixbuf.get_width()
                    const height = pixbuf.get_height()

                    const onCopy = () => Gtk.Clipboard
                        .get_default(Gdk.Display.get_default())
                        .set_image(pixbuf)

                    new ImgPopover(
                        [this.webView, payload, this.window],
                        () => new ImgViewer(this.window.get_size(),
                            height, width, imgAlt, pixbuf, onCopy),
                        onCopy)
                })
                break
            }
            case 'speech-start':
                this.scriptGet('currentPageText', text => {
                    text = text
                        .replace(/“|”/g, '"')
                        .replace(/‛|’/g, "'")
                        .replace(/–/g, '--')
                        .replace(/—/g, '---')
                        .replace(/…/g, '...')
                        .replace(/\xa0/g, ' ')
                        .replace(/\n/g, '; ')
                    this._ttsToken = {}
                    const args = [text, true, this._ttsToken]
                    execCommand(this._ttsCommand, ...args)
                        .then(() => this.atEnd ? null : this.scriptRun(`
                            rendition.next()
                                .then(() => speakCurrentPage())`))
                })
                break
        }
    }
    addShortcut(accels, name, func) {
        const action = new Gio.SimpleAction({ name })
        action.connect('activate', func)
        this.window.add_action(action)
        this.application.set_accels_for_action(`win.${name}`, accels)
    }
    buildSearch(onChange, onSearch) {
        const button = new Gtk.MenuButton({
            image: new Gtk.Image({ icon_name: 'system-search-symbolic' }),
            valign: Gtk.Align.CENTER,
            tooltip_text: _('Find in book'),
            visible: true
        })
        this.searchPopover = new SearchPopover(button, onChange, onSearch)
        button.popover = this.searchPopover.widget
        this.headerBar.pack_end(button)
        this.addShortcut(['<Control>f', 'slash'], 'search-popover', () =>
            button.active = !button.active)
    }
    buildView(...args) {
        const button = new Gtk.MenuButton({
            image: new Gtk.Image({ icon_name: 'font-select-symbolic' }),
            valign: Gtk.Align.CENTER,
            tooltip_text: _('Set font, theme, and layout'),
            visible: true
        })
        this.viewPopover = new ViewPopover(...args)
        button.popover = this.viewPopover.widget
        this.headerBar.pack_end(button)

        this.addShortcut(['minus', '<Control>minus'], 'font-dec', () =>
            this.viewPopover.decFont())
        this.addShortcut(['plus', 'equal', '<Control>plus', '<Control>equal'],
            'font-inc', () => this.viewPopover.incFont())

        this.addShortcut(['<Control>v'], 'view-popover', () =>
            button.active = !button.active)
    }
    updateThemes(themes) {
        this.themes = themes
        if (this.viewPopover) this.viewPopover.updateThemes(themes)
        this.activateTheme()
    }
    activateTheme(theme = settings.get_string('theme')) {
         if (this.viewPopover) this.viewPopover.theme = theme || this.viewPopover.theme
         else {
             settings.set_string('theme', theme)
             Gtk.Settings.get_default().gtk_application_prefer_dark_theme =
                (this.themes[theme] || this.themes[Object.keys(this.themes)[0]]).darkMode
        }
    }
    setAutohideCursor(id = settings.get_string('autohide-cursor')) {
        if (!this.webView) return
        const enabled = id === 'fullscreen' ? this.isFullscreen : id === 'always'
        this.scriptRun(`autohideCursor = ${enabled}`)
    }
    buildSidebar({
        toc, onActivate, onBookmarksAdd, onBookmarksChange,
        onAnnotationsChange, onAnnotationsRemove, spineLength
    }) {
        this.toc = new Toc(-1, -1, toc, onActivate, false)
        this.bookmarks = new Bookmarks(-1, -1, onActivate,
            onBookmarksAdd, onBookmarksChange, () => {}, false)
        this.annotations = new Annotations(-1, -1, onActivate,
            onAnnotationsChange, onAnnotationsRemove, false)

        const sidebar = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL })
        const stack = new Gtk.Stack()
        const stackSwitcher = new Gtk.StackSwitcher({
            stack,
            homogeneous: true,
            border_width: 6
        })
        stack.add_titled(this.toc.widget, 'toc', _('Table of contents'))
        stack.child_set_property(this.toc.widget, 'icon-name', 'view-list-symbolic')
        stack.add_titled(this.annotations.widget, 'annotations', _('Annotations'))
        stack.child_set_property(this.annotations.widget, 'icon-name', 'document-edit-symbolic')
        stack.add_titled(this.bookmarks.widget, 'bookmarks', _('Bookmarks'))
        stack.child_set_property(this.bookmarks.widget, 'icon-name', 'user-bookmarks-symbolic')

        stack.visible_child_name = settings.get_string('sidebar-page')
        stack.connect('notify::visible-child-name', () =>
            settings.set_string('sidebar-page', stack.visible_child_name))

        sidebar.pack_start(stack, true, true, 0)
        sidebar.pack_start(new Gtk.Separator(), false, true, 0)
        sidebar.pack_start(stackSwitcher, false, true, 0)
        sidebar.show_all()
        sidebar.hide()

        this.paned = new Gtk.Paned({ visible: true })
        this.window.remove(this.container)
        this.paned.pack1(sidebar, false, false)
        this.paned.pack2(this.container, true, false)
        this.paned.position = settings.get_int('sidebar-size')
        this.paned.connect('notify::position', () =>
            settings.set_int('sidebar-size', this.paned.position))
        this.window.add(this.paned)

        const button = new Gtk.ToggleButton({
            image: new Gtk.Image({ icon_name: 'view-list-symbolic' }),
            valign: Gtk.Align.CENTER,
            tooltip_text: _('Toggle sidebar'),
            visible: true
        })
        button.connect('toggled', () => {
            sidebar.visible = button.active
            settings.set_boolean('show-sidebar', button.active)
        })
        button.active = settings.get_boolean('show-sidebar')
        this.headerBar.pack_start(button)

        this.navEntry = new NavEntry(spineLength, onActivate)
        this.headerBar.pack_start(this.navEntry.widget)

        this.addShortcut(['F9'], 'sidebar', () =>
            button.active = !button.active)

        const addPageShortcut = (shortcut, page) =>
            this.addShortcut(shortcut, page +'-sidebar', () => {
                if (button.active) {
                    if (stack.visible_child_name !== page)
                        stack.visible_child_name = page
                    else button.active = false
                } else {
                    stack.visible_child_name = page
                    button.active = true
                }
            })
        addPageShortcut(['<Control>t'], 'toc')
        addPageShortcut(['<Control>a'], 'annotations')
        addPageShortcut(['<Control>b'], 'bookmarks')
        this.addShortcut(['<Control>d'], 'bookmark-add', () =>
            this.bookmarks.doButtonAction())
    }
    buildPopovers({
        toc, onActivate, onBookmarksAdd, onBookmarksChange,
        onAnnotationsChange, onAnnotationsRemove
    }) {
        const tocButton = new Gtk.MenuButton({
            image: new Gtk.Image({ icon_name: 'view-list-symbolic' }),
            valign: Gtk.Align.CENTER,
            tooltip_text: _('Table of contents'),
            visible: true
        })
        const bookmarksButton = new Gtk.MenuButton({
            image: new Gtk.Image({ icon_name: 'user-bookmarks-symbolic' }),
            valign: Gtk.Align.CENTER,
            tooltip_text: _('Bookmarks'),
            visible: true
        })
        const annotationsButton = new Gtk.MenuButton({
            image: new Gtk.Image({ icon_name: 'document-edit-symbolic' }),
            valign: Gtk.Align.CENTER,
            tooltip_text: _('Annotations'),
            visible: true
        })

        const activateFunc = x => {
            onActivate(x)
            tocButton.active = false
            bookmarksButton.active = false
            annotationsButton.active = false
        }
        this.toc = new Toc(320, 360, toc, activateFunc)
        this.bookmarks = new Bookmarks(320, 320, activateFunc,
            onBookmarksAdd, onBookmarksChange, canAdd =>
                bookmarksButton.image = canAdd
                    ? new Gtk.Image({ icon_name: 'non-starred-symbolic' })
                    : new Gtk.Image({ icon_name: 'starred-symbolic' }))
        this.annotations = new Annotations(320, 360, activateFunc,
            onAnnotationsChange, onAnnotationsRemove)

        const tocPopover = new Gtk.Popover({ border_width: 10 })
        tocPopover.add(this.toc.widget)
        tocButton.popover = tocPopover

        const bookmarksPopover = new Gtk.Popover({ border_width: 10 })
        bookmarksPopover.add(this.bookmarks.widget)
        bookmarksButton.popover = bookmarksPopover

        const annotationsPopover = new Gtk.Popover({ border_width: 10 })
        annotationsPopover.add(this.annotations.widget)
        annotationsButton.popover = annotationsPopover

        this.headerBar.pack_start(tocButton)
        this.headerBar.pack_start(annotationsButton)
        this.headerBar.pack_start(bookmarksButton)

        this.addShortcut(['F9', '<Control>t'], 'toc-popover', () =>
            tocButton.active = !tocButton.active)
        this.addShortcut(['<Control>a'], 'annotations-popover', () =>
            annotationsButton.active = !annotationsButton.active)
        this.addShortcut(['<Control>b'], 'bookmarks-popover', () =>
            bookmarksButton.active = !bookmarksButton.active)
        this.addShortcut(['<Control>d'], 'bookmark-add', () =>
            this.bookmarks.doButtonAction())
    }
    buildNavbar(onSlide, onPrev, onNext, onBack) {
        this.navbar = new Navbar(this.buildTTS(), onSlide, onPrev, onNext, onBack)
        if (!settings.get_boolean('show-navbar')) {
            this.navbar.widget.hide()
            // HACK: stuff breaks without another non-zero-sized widget in `this.container`
            this._hack = new Gtk.Box({ height_request: 1, visible: true })
            this.container.pack_start(this._hack, false, true, 0)
        }
        this.container.pack_end(this.navbar.widget, false, true, 0)

        this.addShortcut(['p', 'h'], 'go-prev', onPrev)
        this.addShortcut(['n', 'l'], 'go-next', onNext)

        const isPaginated = () =>
            defaultLayouts[this.viewPopover.layout] === 'paginated'

        const lineHeight = () =>
            (this.viewPopover.font.desc.get_size() / Pango.SCALE)
                * this.viewPopover.spacing / 0.75 // 1px = 0.75pt

        this.addShortcut(['k'], 'go-up',
            () => isPaginated()
                ? onPrev()
                : this.scriptRun(`
                    if (atTop()) prevBottom()
                    else window.scrollBy(0, -${lineHeight()})`))
        this.addShortcut(['j'], 'go-down',
            () => isPaginated()
                ? onNext()
                : this.scriptRun(`
                    if (atBottom()) rendition.next()
                    else window.scrollBy(0, ${lineHeight()})`))

        this.addShortcut(['<Alt>Left'], 'go-back', this.navbar.goBack)
    }
    buildMenu() {
        const button = new Gtk.MenuButton({
            image: new Gtk.Image({ icon_name: 'open-menu-symbolic' }),
            valign: Gtk.Align.CENTER,
            visible: true
        })
        const popover = new Gtk.Popover()
        button.popover = popover

        this.menu = new Gio.Menu()

        const section1 = new Gio.Menu()
        section1.append(_('Fullscreen'), 'win.fullscreen')
        section1.append(_('Reading Progress Bar'), 'win.navbar')
        this.menu.append_section(null, section1)

        const section2 = new Gio.Menu()
        section2.append(_('Open…'), 'app.open')
        this.menu.append_section(null, section2)

        const section3 = new Gio.Menu()
        section3.append(_('Preferences'), 'app.preferences')
        section3.append(_('Keyboard Shortcuts'), 'app.shortcuts')
        section3.append(_('About Foliate'), 'app.about')
        this.menu.append_section(null, section3)

        button.set_menu_model(this.menu)
        this.headerBar.pack_end(button)
        this.addShortcut(['F10'], 'menu', () => button.active = !button.active)

        const fullscreenAction = new Gio.SimpleAction({
            name: 'fullscreen',
            state: new GLib.Variant('b', false)
        })
        fullscreenAction.connect('activate', () => {
            const state = fullscreenAction.get_state().get_boolean()
            if (state) {
                this.window.unfullscreen()
                fullscreenAction.set_state(new GLib.Variant('b', false))
            } else {
                this.window.fullscreen()
                fullscreenAction.set_state(new GLib.Variant('b', true))
            }
            this.isFullscreen = !state
            this.setAutohideCursor()
        })
        this.window.add_action(fullscreenAction)
        this.application.set_accels_for_action('win.fullscreen', ['F11'])

        const exitFullscreenAction = new Gio.SimpleAction({ name: 'exit-fullscreen' })
        exitFullscreenAction.connect('activate', () => {
            if (fullscreenAction.get_state().get_boolean()) {
                this.window.unfullscreen()
                fullscreenAction.set_state(new GLib.Variant('b', false))
                this.isFullscreen = false
                this.setAutohideCursor()
            }
        })
        this.window.add_action(exitFullscreenAction)
        this.application.set_accels_for_action('win.exit-fullscreen', ['Escape'])

        const navbarAction = new Gio.SimpleAction({
            name: 'navbar',
            state: new GLib.Variant('b', settings.get_boolean('show-navbar'))
        })
        navbarAction.connect('activate', () => {
            const state = navbarAction.get_state().get_boolean()
            if (state) {
                if (this.navbar) this.navbar.widget.hide()
                navbarAction.set_state(new GLib.Variant('b', false))
            } else {
                if (this.navbar) this.navbar.widget.show()
                navbarAction.set_state(new GLib.Variant('b', true))
            }
            settings.set_boolean('show-navbar', !state)
        })
        this.window.add_action(navbarAction)
        this.application.set_accels_for_action('win.navbar', ['<Control>p'])

        this.addShortcut(['<Control>w'], 'close', () => this.window.close())
    }
    buildTTS() {
        const button = new Gtk.ToggleButton({
            image: new Gtk.Image({ icon_name: 'audio-headphones-symbolic' }),
            tooltip_text: _('Text-to-speech')
        })
        button.connect('toggled', () => {
            if (button.active) this.scriptRun('speakCurrentPage()')
            else this._ttsToken ? this._ttsToken.interrupt() : null
        })
        const update = () => {
            const command = settings.get_string('tts-command')
            this._ttsCommand = command ? GLib.shell_parse_argv(command)[1] : null
            button.visible = !!command
            if (button.active) button.active = false
        }
        update()
        const connection = settings.connect('changed::tts-command', update)
        button.connect('destroy', () => settings.disconnect(connection))

        this.addShortcut(['F5'], 'text-to-speech', () =>
            button.visible ? button.active = !button.active : null)

        return button
    }
    buildExport(metadata) {
        const action = new Gio.SimpleAction({ name: 'export' })
        action.connect('activate', () => {
            const data = this.storage.data
            if (!data.annotations || !data.annotations.length) {
                const msg = new Gtk.MessageDialog({
                    text: _('No annotations'),
                    secondary_text: _("You don't have any annotations for this book.")
                        + '\n' + _('Hightlight some text to add annotations.'),
                    message_type: Gtk.MessageType.INFO,
                    buttons: [Gtk.ButtonsType.OK],
                    modal: true,
                    transient_for: this.window
                })
                msg.run()
                msg.destroy()
                return
            }
            const window = new Gtk.Dialog({
                title: _('Export Annotations'),
                modal: true,
                use_header_bar: true,
                transient_for: this.window
            })

            window.add_button(_('Cancel'), Gtk.ResponseType.CANCEL)
            window.add_button(_('Export'), Gtk.ResponseType.ACCEPT)
            window.set_default_response(Gtk.ResponseType.ACCEPT)

            let format = 'html'
            const combo = new ComboBoxBox(_('Choose export format:'), null, [
                ['html', _('HTML')],
                ['txt', _('Plain Text')],
                ['json', _('JSON')]
            ], x => format = x, false, format)

            const container = window.get_content_area()
            container.border_width = 18
            container.pack_start(combo.widget, false, true, 0)

            window.show_all()

            const response = window.run()
            if (response === Gtk.ResponseType.ACCEPT) {
                const dialog = new Gtk.FileChooserNative({
                    title: _('Save File'),
                    action: Gtk.FileChooserAction.SAVE
                })
                const title = metadata.title
                dialog.set_current_name(_('Annotations for %s').format(title) + '.' + format)
                const response = dialog.run()
                if (response === Gtk.ResponseType.ACCEPT) {
                    let contents = ''
                    switch (format) {
                        case 'json':
                            contents = JSON.stringify(data, null, 2)
                            break
                        case 'html':
                            contents = exportToHTML(data)
                            break
                        case 'txt':
                            contents = exportToTxt(data)
                            break
                    }
                    const file = Gio.File.new_for_path(dialog.get_filename())
                    file.replace_contents(contents, null, false,
                        Gio.FileCreateFlags.REPLACE_DESTINATION, null)
                }
                window.close()
            } else window.close()
        })
        this.window.add_action(action)
    }
    buildProperties(metadata, coverBase64) {
        const action = new Gio.SimpleAction({ name: 'properties' })
        action.connect('activate', () => {
            let image
            if (coverBase64) {
                const data = GLib.base64_decode(coverBase64)
                const imageStream = Gio.MemoryInputStream.new_from_bytes(data)
                const pixbuf = GdkPixbuf.Pixbuf.new_from_stream(imageStream, null)

                const width = 200
                const ratio = width / pixbuf.get_width()
                const height = parseInt(pixbuf.get_height() * ratio, 10)

                image = Gtk.Image.new_from_pixbuf(
                    pixbuf.scale_simple(width, height, GdkPixbuf.InterpType.BILINEAR))
            }
            const window = new Gtk.Dialog({
                default_width: 700,
                modal: true,
                transient_for: this.window
            })
            const headerBar = new Gtk.HeaderBar({
                title: _('About This Book'),
                show_close_button: true,
                has_subtitle: false
            })
            window.set_titlebar(headerBar)

            const dataBox = new Gtk.Box({
                orientation: Gtk.Orientation.VERTICAL, spacing: 10
            })
            const title = new Gtk.Label({
                label: `<big><b>${metadata.title}</b></big>`,
                use_markup: true,
                selectable: true,
                ellipsize: Pango.EllipsizeMode.END,
                lines: 3,
                valign: Gtk.Align.START,
                halign: Gtk.Align.START,
                xalign: 0
            })
            title.set_line_wrap(true)
            dataBox.pack_start(title, false, true, 0)

            if (metadata.creator) {
                const creator = new Gtk.Label({
                    label: metadata.creator,
                    selectable: true,
                    ellipsize: Pango.EllipsizeMode.END,
                    lines: 3,
                    valign: Gtk.Align.START,
                    halign: Gtk.Align.START,
                    xalign: 0
                })
                creator.set_line_wrap(true)
                dataBox.pack_start(creator, false, true, 0)
            }
            if (metadata.description) {
                const webView = new Webkit.WebView({
                    hexpand: true,
                    vexpand: true
                })
                webView.connect('context-menu', () => true)

                const theme = this.viewPopover.theme
                const { color, background, invert } = this.themes[theme]

                webView.load_html(
                    `<meta http-equiv="Content-Security-Policy"
                        content="default-src 'none'; style-src 'unsafe-inline';">
                    <style>
                        html {
                            background: ${background};
                            color: ${color};
                            filter: ${invert ? 'invert(1) hue-rotate(180deg)' : 'none'};
                        }
                    </style>` + metadata.description, null)

                const frame = new Gtk.Frame()
                frame.add(webView)
                dataBox.pack_start(frame, true, true, 0)
            }

            // workaround for xgettext bug
            // `/`

            const grid = new Gtk.Grid({
                column_spacing: 10, row_spacing: 10,
                valign: Gtk.Align.CENTER
            })

            dataBox.pack_end(grid, false, true, 0)

            let row = 0
            for (const key in metadata) {
                if (!metadata[key]) continue

                const labelText = {
                    publisher: _('Publisher'),
                    pubdate: _('Publication Date'),
                    modified_date: _('Modified Date'),
                    language: _('Language'),
                    rights: _('Copyright'),
                    identifier: _('Identifier')
                }
                if (key in labelText) {
                    const label = new Gtk.Label({
                        label: labelText[key],
                        ellipsize: Pango.EllipsizeMode.END,
                        valign: Gtk.Align.START,
                        halign: Gtk.Align.END
                    })
                    label.get_style_context().add_class('dim-label')
                    grid.attach(label, 0, row, 1, 1)

                    const value = new Gtk.Label({
                        label: metadata[key],
                        selectable: true,
                        ellipsize: Pango.EllipsizeMode.END,
                        lines: 3,
                        valign: Gtk.Align.START,
                        halign: Gtk.Align.START,
                        xalign: 0
                    })
                    value.set_line_wrap(true)
                    grid.attach(value, 1, row, 1, 1)
                    row++
                }
            }

            const coverBox = new Gtk.Box({ spacing: 18 })
            if (!metadata.description) {
                coverBox.valign = Gtk.Align.CENTER
                coverBox.halign = Gtk.Align.CENTER
                if (!image) dataBox.pack_end(new Gtk.Separator, false, true, 10)
            } else if (image) image.valign = Gtk.Align.START
            if (image) coverBox.pack_start(image, false, true, 0)
            coverBox.pack_end(dataBox, false, true, 0)

            const container = window.get_content_area()
            container.border_width = 18
            container.pack_start(coverBox, true, true, 0)

            window.show_all()
            title.select_region(-1, -1)
        })
        this.window.add_action(action)
    }
}

class ColorButton {
    constructor(color, label) {
        const box = new Gtk.Box({ spacing: 6 })
        const rgba = new Gdk.RGBA()
        rgba.parse(color)
        const button = new Gtk.ColorButton({ rgba })
        box.pack_start(button, false, true, 0)
        box.pack_start(new Gtk.Label({ label }), false, true, 0)

        this.box = box
        this.button = button
    }
}
class ThemeEditor {
    constructor(themes, onSettingsChange, onThemeActivate) {
        const theme = settings.get_string('theme')
        const currentTheme = theme in themes ? theme : Object.keys(themes)[0]

        const listBox = new Gtk.ListBox({ visible: true })
        listBox.set_header_func((row) => {
            if (row.get_index()) row.set_header(new Gtk.Separator())
        })

        const themeMap = new Map()
        const settingsBoxMap = new Map()
        const selectedMap = new Map()
        const settingsMap = new Map()
        const removeMap = new Map()

        let activeRow

        listBox.connect('row-activated', (_, row) => {
            settingsBoxMap.forEach((value, key) =>
                value.visible = key === row ? !value.visible : false)
            selectedMap.forEach((value, key) =>
                value.visible = key === row)
            onThemeActivate(themeMap.get(row))
            activeRow = row
        })

        const onChange = () => {
            onSettingsChange(Object.assign({},
                ...Array.from(settingsMap.values()).map(f => f())))
            onThemeActivate(themeMap.get(activeRow))
        }

        const addTheme = (name, i) => {
            const theme = themes[name]
            const row = new Gtk.ListBoxRow({
                selectable: false
            })
            const box =  new Gtk.Box({
                orientation: Gtk.Orientation.VERTICAL,
                spacing: 10,
                border_width: 10
            })
            const label = new Gtk.Label({
                label: name,
                halign: Gtk.Align.START
            })
            const selectedIcon = new Gtk.Image({ icon_name: 'object-select-symbolic' })
            const labelBox = new Gtk.Box()
            labelBox.pack_start(label, true, true, 0)
            labelBox.pack_end(selectedIcon, false, true, 0)

            const colorButton = new ColorButton(theme.color,  _('Text'))
            const bgButton = new ColorButton(theme.background, _('Background'))
            const linkButton =  new ColorButton(theme.link, _('Link'))

            const modeToggle = new Gtk.CheckButton({ label: _('Enable Dark Mode') })
            modeToggle.active = theme.darkMode
            const invertToggle = new Gtk.CheckButton({ label: _('Invert Colors') })
            invertToggle.active = theme.invert

            const buttons = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 10 })
            buttons.pack_start(bgButton.box, false, true, 0)
            buttons.pack_start(colorButton.box, false, true, 0)
            buttons.pack_start(linkButton.box, false, true, 0)

            const toggles = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 10 })
            toggles.pack_start(modeToggle, false, true, 0)
            toggles.pack_start(invertToggle, false, true, 0)

            const settingsBox = new Gtk.Box({
                spacing: 18
            })
            settingsBox.pack_start(buttons, true, true, 0)
            settingsBox.pack_start(toggles, true, true, 0)

            colorButton.button.connect('color-set', onChange)
            bgButton.button.connect('color-set', onChange)
            linkButton.button.connect('color-set', onChange)
            modeToggle.connect('toggled', onChange)
            invertToggle.connect('toggled', onChange)

            const getSettings = () => ({
                [name]: {
                    color: colorButton.button.rgba.to_string(),
                    background: bgButton.button.rgba.to_string(),
                    link: linkButton.button.rgba.to_string(),
                    darkMode: modeToggle.active,
                    invert: invertToggle.active
                }
            })
            themeMap.set(row, name)
            settingsBoxMap.set(row, settingsBox)
            selectedMap.set(row, selectedIcon)
            settingsMap.set(row, getSettings)

            const removeFunc = () => {
                listBox.remove(row)
                themeMap.delete(row)
                settingsBoxMap.delete(row)
                selectedMap.delete(row)
                settingsMap.delete(row)
                removeMap.delete(row)
                delete themes[name]
            }
            removeMap.set(row, removeFunc)

            box.pack_start(labelBox, false, true, 0)
            box.pack_end(settingsBox, false, true, 0)

            row.add(box)
            listBox.add(row)

            row.show_all()
            if (name !== currentTheme) {
                settingsBox.hide()
                selectedIcon.hide()
            } else activeRow = row
            return row
        }
        const names = Object.keys(themes)
        names.forEach(addTheme)

        const addBox = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 6,
            border_width: 10
        })
        const nameLabel = new Gtk.Label({
            label: '<b>' + _('Theme name') + '</b>',
            use_markup: true,
            halign: Gtk.Align.START
        })
        const nameMsg = new Gtk.Label({ label: _('A theme with that name already exists.') })
        const nameEntry = new Gtk.Entry()
        const nameButton = new Gtk.Button({ label: _('Add'), sensitive: false })
        nameButton.get_style_context().add_class('suggested-action')

        const nameBox = new Gtk.Box({ spacing: 6 })
        nameBox.pack_start(nameEntry, false, true, 0)
        nameBox.pack_start(nameButton, false, true, 0)
        addBox.pack_start(nameLabel, false, true, 0)
        addBox.pack_start(nameBox, false, true, 0)
        addBox.pack_start(nameMsg, false, true, 0)
        addBox.show_all()
        nameMsg.hide()

        const addPopover = new Gtk.Popover()
        addPopover.add(addBox)

        nameEntry.connect('changed', () => {
            const text = nameEntry.buffer.get_text()
            if (text) {
                if (text in themes) nameButton.sensitive = false, nameMsg.show()
                else nameButton.sensitive = true, nameMsg.hide()
            } else nameButton.sensitive = false, nameMsg.hide()
        })
        nameEntry.connect('activate', () => {
            if (nameButton.sensitive) nameButton.clicked()
        })
        nameButton.connect('clicked', () => {
            const name = nameEntry.buffer.get_text()
            themes[name] = {
                color: '#000', background: '#fff', link: 'blue',
                darkMode: false, invert: false
            }
            const row = addTheme(name, themes.length)
            row.activate()
            nameEntry.set_text('')
            addPopover.popdown()
            delButton.sensitive = true
            onChange()
        })

        const addButton = new Gtk.MenuButton({
            image: new Gtk.Image({ icon_name: 'list-add-symbolic' }),
            label: _('Add…'),
            always_show_image: true,
            tooltip_text: _('Add a new theme')
        })
        addButton.popover = addPopover
        const delButton =  new Gtk.Button({
            image: new Gtk.Image({ icon_name: 'list-remove-symbolic' }),
            label: _('Remove'),
            always_show_image: true,
            tooltip_text: _('Remove selected theme'),
            sensitive: Object.keys(themes).length > 1
        })
        delButton.connect('clicked', () => {
            removeMap.get(activeRow)()
            Array.from(themeMap.keys())[0].activate()
            if (themeMap.size === 1) delButton.sensitive = false
            onChange()
        })

        const actionBox = new Gtk.Box()
        actionBox.get_style_context().add_class('linked')
        actionBox.pack_start(addButton, false, true, 0)
        actionBox.pack_start(delButton, false, true, 0)
        actionBox.show_all()

        const scroll = new Gtk.ScrolledWindow({
            propagate_natural_width: true,
            propagate_natural_height: true,
            visible: true
        })
        scroll.get_style_context().add_class('frame')
        scroll.add(listBox)

        const box = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 10,
            visible: true
        })
        box.pack_start(scroll, true, true, 0)
        box.pack_start(actionBox, false, true, 0)

        this.widget = box
    }
}

function main(argv) {
    const themes = new Storage('themes', 'config', 2)

    const application = new Gtk.Application({
        application_id: pkg.name,
        flags: Gio.ApplicationFlags.HANDLES_OPEN
    })
    const appWindows = new Set()
    const addWindow = uri => {
        const appWindow = new BookViewerWindow(
            application,
            settings.get_int('window-width'),
            settings.get_int('window-height'),
            uri,
            themes.get('themes')
        )
        appWindows.add(appWindow)
        appWindow.window.connect('destroy', () => appWindows.delete(appWindow))
        appWindow.window.present()
        application.add_window(appWindow.window)
    }

    application.connect('open', (app, files) =>
        files.map(file => file.get_path()).forEach(addWindow))
    application.connect('activate', () => addWindow())

    const actionOpen = new Gio.SimpleAction({ name: 'open' })
    actionOpen.connect('activate', () => {
        const allFiles = new Gtk.FileFilter()
        allFiles.set_name(_('All Files'))
        allFiles.add_pattern('*')

        const epubFiles = new Gtk.FileFilter()
        epubFiles.set_name(_('E-book Files'))
        epubFiles.add_mime_type('application/epub+zip')
        kindleExts.forEach(x =>
            epubFiles.add_pattern('*' + x))

        const dialog = new Gtk.FileChooserNative({ title: _('Open File') })
        dialog.add_filter(epubFiles)
        dialog.add_filter(allFiles)

        const response = dialog.run()
        if (response === Gtk.ResponseType.ACCEPT) {
            const emptyWindows = Array.from(appWindows).filter(x => x.canOpen)
            if (emptyWindows.length) emptyWindows[0].open(dialog.get_filename())
            else addWindow(dialog.get_filename())
        }
    })
    application.add_action(actionOpen)
    application.set_accels_for_action('app.open', ['<Control>o'])

    const touchpadSettings = new Gio.Settings({
        schema_id: 'org.gnome.desktop.peripherals.touchpad'
    })
    let naturalScroll = touchpadSettings.get_boolean('natural-scroll')
    touchpadSettings.connect('changed::natural-scroll', () =>
        naturalScroll = touchpadSettings.get_boolean('natural-scroll'))

    const actionShortcuts = new Gio.SimpleAction({ name: 'shortcuts' })
    actionShortcuts.connect('activate', () => {
        const tocShortcuts = useSidebar
            ? [
                { accelerator: 'F9', title: _('Toggle sidebar') },
                { accelerator: '<control>t', title: _('Show table of contents') }
            ] : [
                { accelerator: 'F9', title: _('Show table of contents') }
            ]
        const ttsShortcuts = !!settings.get_string('tts-command')
            ? [{ accelerator: 'F5', title: _('Start/stop text-to-speech') }] : []
        const shortcutsGroups = [
            {
                title: _('General'),
                shortcuts: [
                    ...tocShortcuts,
                    { accelerator: '<control>a', title: _('Show annotations') },
                    { accelerator: '<control>b', title: _('Show bookmarks') },
                    { accelerator: '<control>d', title: _('Bookmark current location') },
                    { accelerator: '<control>f', title: _('Find in book') },
                    { accelerator: 'F10', title: _('Show menu') },
                    ...ttsShortcuts,
                    { accelerator: '<control>w', title: _('Close current window') },
                    { accelerator: '<control>q', title: _('Quit') }
                ]
            },
            {
                title: _('Navigation'),
                shortcuts: [
                    { accelerator: 'Right n', title: _('Go to the next page') },
                    { accelerator: 'Left p', title: _('Go to the previous page') },
                    { accelerator: '<alt>Left', title: _('Go back to previous location') }
                ]
            },
            {
                title: _('View'),
                shortcuts: [
                    { accelerator: '<control>v', title: _('Show viewing options') },
                    { accelerator: 'plus', title: _('Increase font size') },
                    { accelerator: 'minus', title: _('Decrease font size') },
                    { accelerator: 'F11', title: _('Toggle fullscreen') },
                    { accelerator: '<control>p', title: _('Toggle reading progress bar') }
                ]
            },
            {
                title: _('Touchpad Gestures'),
                shortcuts: [
                    // I can't find where to access the enums in GJS,
                    // so just use ints for now
                    { shortcut_type: naturalScroll ? 5 : 6, title: _('Go to the next page') },
                    { shortcut_type: naturalScroll ? 6 : 5, title: _('Go to the previous page') },
                    { shortcut_type: 2, title: _('Zoom in') },
                    { shortcut_type: 1, title: _('Zoom out') }
                ]
            }
        ]
        const shortcutsWindow = new Gtk.ShortcutsWindow({
            modal: true,
            transient_for: application.active_window
        })
        const shortcutsSection = new Gtk.ShortcutsSection(
            { 'section-name': 'shortcuts', visible: true })

        for (const { title, shortcuts } of shortcutsGroups) {
            const shortcutsGroup = new Gtk.ShortcutsGroup({ title, visible: true })
            for (const shortcut of shortcuts) {
                shortcutsGroup.add(new Gtk.ShortcutsShortcut(
                    Object.assign({ visible: true }, shortcut)))
            }
            shortcutsSection.add(shortcutsGroup)
        }
        shortcutsWindow.add(shortcutsSection)
        shortcutsWindow.show()
    })
    application.add_action(actionShortcuts)
    application.set_accels_for_action('app.shortcuts', ['<Control>question'])

    const actionAbout = new Gio.SimpleAction({ name: 'about' })
    actionAbout.connect('activate', () => {
        const aboutDialog = new Gtk.AboutDialog({
            authors: ['John Factotum'],
            artists: ['John Factotum'],
            program_name: _('Foliate'),
            comments: _('A simple and modern eBook viewer'),
            logo_icon_name: pkg.name,
            version: pkg.version,
            license_type: Gtk.License.GPL_3_0,
            website: 'https://johnfactotum.github.io/foliate/',
            modal: true,
            transient_for: application.active_window
        })
        aboutDialog.show()
    })
    application.add_action(actionAbout)

    const actionQuit = new Gio.SimpleAction({ name: 'quit' })
    actionQuit.connect('activate', () =>
        [...appWindows].forEach(window => window.window.close()))
    application.add_action(actionQuit)
    application.set_accels_for_action('app.quit', ['<Control>q'])

    const actionPref = new Gio.SimpleAction({ name: 'preferences' })
    actionPref.connect('activate', () => {
        const window = new Gtk.Dialog({
            modal: true,
            transient_for: application.active_window
        })
        const headerBar = new Gtk.HeaderBar({
            show_close_button: true,
            has_subtitle: false
        })
        window.set_titlebar(headerBar)
        window.title = _('Preferences')

        const sidebarPref = new SwitchBox([
            _('Use sidebar (requires restart)'),
            _('Use a sidebar to display table of contents, annotations, and bookmarks.')
        ], 'use-sidebar', () => {})

        const restorePref = new SwitchBox(
            _('Open last opened file on startup'), 'restore-last-file', () => {})

        const selectionActions = [
            ['nothing', _('Do nothing')],
            ['ask', _('Ask what to do')],
            ['highlight', _('Highlight')],
            ['dictionary', _('Lookup in dictionary')],
            ['wikipedia', _('Lookup in Wikipedia')],
            ['translate', _('Translate')]
        ]
        const selectionSinglePref = new ComboBoxBox(
            _('When a word is selected'),
            'selection-action-single', selectionActions, () => {})
        const selectionMultiplePref = new ComboBoxBox(
            _('When multiple words are selected'),
            'selection-action-multiple', selectionActions, () => {})

        const cursorPref = new ComboBoxBox(
            _('Auto-hide cursor'),
            'autohide-cursor',
            [
                ['never', _('Never')],
                ['always', _('Always')],
                ['fullscreen', _('When in fullscreen mode')]
            ], x => appWindows.forEach(w => w.setAutohideCursor(x)))

        const footnotePref = new SwitchBox([
            _('Display non-EPUB-3 footnotes in a popover'),
            _('This feature is experimental and might not work with all books.')
        ], 'footnote-enabled', x =>
            appWindows.forEach(w => w.scriptRun(`footnoteEnabled = ${x}`)))

        const cspPref = new SwitchBox([
            _('Allow unsafe content (not recommended)'),
            _('Enabling this will allow JavaScript and external resources to load.')
                + '\n' + _('This will pose potential security and privacy risks.'),
        ], 'disable-csp', () => {})

        const ttsPref = new ComboBoxBox([
                _('Text-to-speech command'),
                _('Leave blank to disable text-to-speech.')
            ], 'tts-command', TTS_COMMANDS, () => {}, true)

        const themeEditor = new ThemeEditor(
            themes.get('themes', defaultThemes),
            x => {
                appWindows.forEach(w => w.updateThemes(x))
                themes.set('themes', x)
            },
            x => appWindows.forEach(w => w.activateTheme(x)))

        const stack = new Gtk.Stack()
        const stackSwitcher = new Gtk.StackSwitcher({ stack, homogeneous: true })
        headerBar.custom_title = stackSwitcher

        const general = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            border_width: 18,
            spacing: 18,
        })
        general.pack_start(sidebarPref.widget, false, true, 0)
        general.pack_start(restorePref.widget, false, true, 0)
        general.pack_start(selectionSinglePref.widget, false, true, 0)
        general.pack_start(selectionMultiplePref.widget, false, true, 0)
        general.pack_start(cursorPref.widget, false, true, 0)
        general.pack_start(footnotePref.widget, false, true, 0)
        general.pack_start(cspPref.widget, false, true, 0)
        general.pack_start(ttsPref.widget, false, true, 0)
        general.show_all()
        stack.add_titled(general, 'general', _('General'))

        const theme = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            border_width: 18,
            spacing: 18,
            visible: true
        })
        theme.pack_start(themeEditor.widget, true, true, 0)
        stack.add_titled(theme, 'theme', _('Theme'))

        window.get_content_area().add(stack)

        headerBar.show_all()
        stack.show()
        window.show()
    })
    application.add_action(actionPref)

    return application.run(argv)
}

/*
List of languages supported by Google Translate
Generated by running the following on https://cloud.google.com/translate/docs/languages

```javascript
[...document.querySelectorAll('tbody tr')]
.map(tr => `['${tr.querySelector('code').innerText}', _('${tr.querySelector('td').innerText}')]`)
.join(',\n')
```
*/
const GT_LANGS = [
    ['af', _('Afrikaans')],
    ['sq', _('Albanian')],
    ['am', _('Amharic')],
    ['ar', _('Arabic')],
    ['hy', _('Armenian')],
    ['az', _('Azerbaijani')],
    ['eu', _('Basque')],
    ['be', _('Belarusian')],
    ['bn', _('Bengali')],
    ['bs', _('Bosnian')],
    ['bg', _('Bulgarian')],
    ['ca', _('Catalan')],
    ['ceb', _('Cebuano')],
    ['zh-CN', _('Chinese (Simplified)')],
    ['zh-TW', _('Chinese (Traditional)')],
    ['co', _('Corsican')],
    ['hr', _('Croatian')],
    ['cs', _('Czech')],
    ['da', _('Danish')],
    ['nl', _('Dutch')],
    ['en', _('English')],
    ['eo', _('Esperanto')],
    ['et', _('Estonian')],
    ['fi', _('Finnish')],
    ['fr', _('French')],
    ['fy', _('Frisian')],
    ['gl', _('Galician')],
    ['ka', _('Georgian')],
    ['de', _('German')],
    ['el', _('Greek')],
    ['gu', _('Gujarati')],
    ['ht', _('Haitian Creole')],
    ['ha', _('Hausa')],
    ['haw', _('Hawaiian')],
    ['he', _('Hebrew')],
    ['hi', _('Hindi')],
    ['hmn', _('Hmong')],
    ['hu', _('Hungarian')],
    ['is', _('Icelandic')],
    ['ig', _('Igbo')],
    ['id', _('Indonesian')],
    ['ga', _('Irish')],
    ['it', _('Italian')],
    ['ja', _('Japanese')],
    ['jw', _('Javanese')],
    ['kn', _('Kannada')],
    ['kk', _('Kazakh')],
    ['km', _('Khmer')],
    ['ko', _('Korean')],
    ['ku', _('Kurdish')],
    ['ky', _('Kyrgyz')],
    ['lo', _('Lao')],
    ['la', _('Latin')],
    ['lv', _('Latvian')],
    ['lt', _('Lithuanian')],
    ['lb', _('Luxembourgish')],
    ['mk', _('Macedonian')],
    ['mg', _('Malagasy')],
    ['ms', _('Malay')],
    ['ml', _('Malayalam')],
    ['mt', _('Maltese')],
    ['mi', _('Maori')],
    ['mr', _('Marathi')],
    ['mn', _('Mongolian')],
    ['my', _('Myanmar (Burmese)')],
    ['ne', _('Nepali')],
    ['no', _('Norwegian')],
    ['ny', _('Nyanja (Chichewa)')],
    ['ps', _('Pashto')],
    ['fa', _('Persian')],
    ['pl', _('Polish')],
    ['pt', _('Portuguese (Portugal, Brazil)')],
    ['pa', _('Punjabi')],
    ['ro', _('Romanian')],
    ['ru', _('Russian')],
    ['sm', _('Samoan')],
    ['gd', _('Scots Gaelic')],
    ['sr', _('Serbian')],
    ['st', _('Sesotho')],
    ['sn', _('Shona')],
    ['sd', _('Sindhi')],
    ['si', _('Sinhala (Sinhalese)')],
    ['sk', _('Slovak')],
    ['sl', _('Slovenian')],
    ['so', _('Somali')],
    ['es', _('Spanish')],
    ['su', _('Sundanese')],
    ['sw', _('Swahili')],
    ['sv', _('Swedish')],
    ['tl', _('Tagalog (Filipino)')],
    ['tg', _('Tajik')],
    ['ta', _('Tamil')],
    ['te', _('Telugu')],
    ['th', _('Thai')],
    ['tr', _('Turkish')],
    ['uk', _('Ukrainian')],
    ['ur', _('Urdu')],
    ['uz', _('Uzbek')],
    ['vi', _('Vietnamese')],
    ['cy', _('Welsh')],
    ['xh', _('Xhosa')],
    ['yi', _('Yiddish')],
    ['yo', _('Yoruba')],
    ['zu', _('Zulu')]
]

