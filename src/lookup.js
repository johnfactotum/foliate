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

const { GObject, GLib, Gtk, Gdk, WebKit2 } = imports.gi
const { execCommand, user_agent, getLanguageDisplayName, getAlpha2 } = imports.utils

const lookup = (script, againScript) => new Promise((resolve, reject) => {
    const webView = new WebKit2.WebView({
        settings: new WebKit2.Settings({
            enable_write_console_messages_to_stdout: true,
            allow_universal_access_from_file_urls: true,
            user_agent
        })
    })
    const runResource = resource => new Promise((resolve) =>
        webView.run_javascript_from_gresource(resource, null, () => resolve()))

    const loadScripts = async () => {
        await runResource('/com/github/johnfactotum/Foliate/web/utils.js')
        await runResource('/com/github/johnfactotum/Foliate/web/lookup.js')
    }
    webView.connect('load-changed', (webView, event) => {
        if (event == WebKit2.LoadEvent.FINISHED) loadScripts()
    })
    const runScript = script => webView.run_javascript(script, null, () => {})

    webView.load_uri(GLib.filename_to_uri(
        pkg.pkgdatadir + '/assets/client.html', null))

    const contentManager = webView.get_user_content_manager()
    contentManager.connect('script-message-received::action', (_, jsResult) => {
        const data = jsResult.get_js_value().to_string()
        const { type, payload } = JSON.parse(data)
        switch (type) {
            case 'ready': runScript(script); break
            case 'lookup-again': runScript(againScript(payload)); break
            case 'lookup-results':
                resolve(payload)
                webView.destroy()
                break
            case 'lookup-error':
                reject()
                webView.destroy()
                break
        }
    })
    contentManager.register_script_message_handler('action')
})

const wikipedia = (word, language = 'en') => lookup(
    `wikipedia("${encodeURIComponent(word)}", '${language}')`
).then(results => {
    const box = new Gtk.Box({
        visible: true,
        orientation: Gtk.Orientation.VERTICAL,
        margin: 3
    })
    const label = new Gtk.Label({
        visible: true,
        wrap: true,
        xalign: 0,
        use_markup: true,
        selectable: true,
        label: results.extract
    })
    box.pack_start(label, false, true, 0)
    return box
})

var WikipediaBox = GObject.registerClass({
    GTypeName: 'FoliateWikipediaBox',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/wikipediaBox.ui',
    InternalChildren: ['wikiStack', 'wikiContent', 'wikiErrorLabel', 'wikiButton']
}, class WikipediaBox extends Gtk.Box {
    lookup(text, language) {
        language = getAlpha2(language)
        this._wikiStack.visible_child_name = 'loading'
        this._wikiContent.foreach(child => this._wikiContent.remove(child))
        wikipedia(text, language)
            .then(widget => {
                this._wikiStack.visible_child_name = 'loaded'
                this._wikiContent.add(widget)
                this._wikiButton.show()
                this._wikiButton.connect('clicked', () => {
                    const uri = `https://${language}.wikipedia.org/wiki/${encodeURIComponent(text)}`
                    Gtk.show_uri_on_window(null, uri, Gdk.CURRENT_TIME)
                })
            })
            .catch(() => {
                this._wikiStack.visible_child_name = 'error'
                this._wikiErrorLabel.label =
                    `<a href="https://${language}.wikipedia.org/w/index.php?search=${
                        encodeURIComponent(text)}">`
                    + _('Search on Wikipedia')
                    + '</a>'
            })
    }
})

const baseWikiRegExp = /^https:\/\/en\.wiktionary\.org\/wiki\//

// see https://en.wiktionary.org/wiki/Wiktionary:Namespace
const wikiNamespaces = [
    'Media', 'Special', 'Talk', 'User', 'Wiktionary', 'File', 'MediaWiki',
    'Template', 'Help', 'Category',
    'Summary', 'Appendix', 'Concordance', 'Index', 'Rhymes', 'Transwiki',
    'Thesaurus', 'Citations', 'Sign'
]

const wiktionary = (word, language, lookupFunc) => lookup(
    `wiktionary("${encodeURIComponent(word)}", '${language}')`,
    payload => `wiktionary("${encodeURIComponent(payload)}", '${language}')`)
    .then(({ word, results }) => {
        const handleLink = (_, uri) => {
            const internalLink = uri.split(baseWikiRegExp)[1]
            if (internalLink && wikiNamespaces.every(namespace =>
                !internalLink.startsWith(namespace + ':')
                && !internalLink.startsWith(namespace + '_talk:'))) {
                const [title, lang] = internalLink.split('#')
                const word = decodeURIComponent(title)
                    .replace(/_/g, ' ')
                lookupFunc(word, lang || 'en')
                return true
            }
        }
        // const displayWord = word.replace(/_/g, ' ')
        const displayLanguage = results[0].language
        const linkLanguage = displayLanguage.replace(/ /g, '_')

        const grid = new Gtk.Grid({
            column_spacing: 3, row_spacing: 3,
            border_width: 3,
            valign: Gtk.Align.START
        })
        let row = 0

        results.forEach(({ partOfSpeech, definitions }, i) => {
            if (i > 0) {
                grid.attach(new Gtk.Label(), 1, row, 1, 1)
                row++
            }

            const partOfSpeechBox = new Gtk.Box({ spacing: 6 })
            const partOfSpeechLabel = new Gtk.Label({
                label: `<i>${partOfSpeech}</i>`,
                xalign: 0,
                use_markup: true
            })
            partOfSpeechLabel.get_style_context().add_class('dim-label')
            partOfSpeechBox.pack_start(partOfSpeechLabel, false, true, 0)
            partOfSpeechBox.pack_start(new Gtk.Separator({
                valign: Gtk.Align.CENTER
            }), true, true, 0)
            grid.attach(new Gtk.Separator({
                valign: Gtk.Align.CENTER
            }), 0, row, 1, 1)
            grid.attach(partOfSpeechBox, 1, row, 1, 1)
            row++

            definitions.forEach(({ definition, examples }, i) => {
                const label = new Gtk.Label({
                    label: i + 1 + '.',
                    valign: Gtk.Align.START,
                    halign: Gtk.Align.END
                })
                label.get_style_context().add_class('dim-label')
                grid.attach(label, 0, row, 1, 1)

                const value = new Gtk.Label({
                    label: definition,
                    valign: Gtk.Align.START,
                    halign: Gtk.Align.START,
                    hexpand: true,
                    xalign: 0,
                    use_markup: true,
                    selectable: true
                })
                value.set_line_wrap(true)
                value.connect('activate-link', handleLink)
                grid.attach(value, 1, row, 1, 1)
                row++

                if (examples) {
                    const exampleBox = new Gtk.Box({
                        orientation: Gtk.Orientation.VERTICAL,
                        spacing: 3,
                        margin_start: 6,
                        margin_top: 3,
                        margin_bottom: 3
                    })
                    examples.forEach(example => {
                        const exampleLabel = new Gtk.Label({
                            label: `<small>${
                                example
                            }</small>`,
                            valign: Gtk.Align.START,
                            halign: Gtk.Align.START,
                            hexpand: true,
                            xalign: 0,
                            use_markup: true,
                            selectable: true
                        })
                        exampleLabel.set_line_wrap(true)
                        exampleLabel.connect('activate-link', handleLink)
                        exampleLabel.get_style_context()
                            .add_class('dim-label')
                        exampleBox.pack_start(exampleLabel, false, true, 0)
                    })
                    grid.attach(exampleBox, 1, row, 1, 1)
                    row++
                }
            })
        })

        const sourceLabel = new Gtk.Label({
            label: `<small>${_('Source: ')}<a href="https://en.wiktionary.org/wiki/${
                GLib.markup_escape_text(word, -1)
            }#${linkLanguage}">${_('Wiktionary')}</a></small>`,
            xalign: 1,
            use_markup: true
        })
        sourceLabel.get_style_context().add_class('dim-label')
        const sourceBox = new Gtk.Box({ border_width: 3 })
        sourceBox.pack_end(sourceLabel, false, true, 0)

        // const langLabel = new Gtk.Label({
        //     label: `<small>${displayLanguage}</small>`,
        //     xalign: 0,
        //     use_markup: true
        // })
        // const title = new Gtk.Label({
        //     label: '<span size="larger" weight="bold">'
        //         + GLib.markup_escape_text(displayWord, -1)
        //         + '</span>',
        //     xalign: 0,
        //     use_markup: true,
        //     selectable: true
        // })

        const box = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL
        })
        // box.pack_start(langLabel, false, true, 0)
        // box.pack_start(title, false, true, 0)
        box.pack_start(grid, false, true, 0)
        box.pack_end(sourceBox, false, true, 0)
        box.show_all()
        return box
    })

const makeDictdDict = (id, name) => ({
    name,
    noWrap: true,
    lookup: word => execCommand(['dict', '-d', id, word])
        .then(text => {
            const label = new Gtk.Label({
                label: text,
                selectable: true,
                valign: Gtk.Align.START,
                xalign: 0,
                wrap: true,
                max_width_chars: 60
            })
            const box = new Gtk.Box({ margin: 3 })
            box.pack_start(label, false, true, 0)
            box.show_all()
            return box
        })
})
const parseDictDbs = x => x.split('\n').filter(x => x).map(row => {
    const cols = row.split('\t')
    return { id: cols[2], name: cols[3] }
})

const makeStarDictDict = (name) => ({
    name,
    noWrap: true,
    lookup: word => execCommand(['sdcv', '-n', `--use-dict=${name}`, word])
        .then(text => {
            const label = new Gtk.Label({
                label: text,
                selectable: true,
                valign: Gtk.Align.START,
                xalign: 0,
                wrap: true,
                max_width_chars: 60
            })
            const box = new Gtk.Box({ margin: 3 })
            box.pack_start(label, false, true, 0)
            box.show_all()
            return box
        })
})
const parseStarDictDbs = d => d.split('\n').filter(d => d).map(row => {
    const cols = row.split(/\s+\d+/)
    return { name: cols[0] }
})

const dictionaries = {
    wiktionary: {
        name: _('Wiktionary (English)'),
        noWrap: false,
        lookup: wiktionary
    }
}
execCommand(['dict', '--dbs', '--formatted'])
    .then(stdout => parseDictDbs(stdout).forEach(db =>
        dictionaries['dcitd_' + db.id] =
            makeDictdDict(db.id, db.name)))
    .catch(() => {})

execCommand(['sdcv', '--list-dicts'])
    .then(stdout => {
        // Remove the first line from the output, which is a heading.
        const dictListOutput = stdout.split('\n').slice(1).join('\n')

        return parseStarDictDbs(dictListOutput).forEach(db =>
            dictionaries['stardict_' + db.name] = makeStarDictDict(db.name))
    })
    .catch(() => {})

var DictionaryBox = GObject.registerClass({
    GTypeName: 'FoliateDictionaryBox',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/dictionaryBox.ui',
    Children: ['dictCombo'],
    InternalChildren: [
        'dictStore', 'dictEntry', 'dictStack', 'dictContent',
        'dictErrorLabel'
    ]
}, class DictionaryBox extends Gtk.Box {
    _init(params, dict = 'wiktionary') {
        super._init(params)
        Object.keys(dictionaries).forEach(dict => {
            const dictionary = dictionaries[dict]
            this._dictStore.set(this._dictStore.append(),
                [0, 1], [dict, dictionary.name])
        })
        this.dictCombo.active_id = dict
        this.dictCombo.connect('changed', () => this._lookupFromEntry())
        this._dictEntry.connect('activate', () => this._lookupFromEntry())
    }
    lookup(text, language) {
        language = getAlpha2(language)
        this.language = language
        this._dictEntry.text = text
        this._lookupFromEntry()
    }
    _lookupFromEntry() {
        const text = this._dictEntry.text
        const language = this.language
        const dict = this.dictCombo.active_id
        if (text) this._lookup(text, language, dict)
    }
    _lookup(text, language, dict) {
        text = text
            .replace(/\xa0/g, ' ')
            .replace(/\xad|\u2060/g, '')
        this.language = language
        this._dictStack.visible_child_name = 'loading'
        this._dictContent.foreach(child => this._dictContent.remove(child))
        dictionaries[dict].lookup(text, language, (word, lang, d = dict) => {
            this.lookup(word, lang, d)
        })
            .then(widget => {
                this._dictStack.visible_child_name = 'loaded'
                this._dictContent.add(widget)
                this._dictContent.propagate_natural_width = dictionaries[dict].noWrap
            })
            .catch(() => {
                this._dictStack.visible_child_name = 'error'
                this._dictErrorLabel.label =
                    `<a href="https://en.wiktionary.org/w/index.php?search=${
                        encodeURIComponent(text)}">`
                    + _('Search on Wiktionary')
                    + '</a>'
            })
    }
})

const translate = (word, language = 'en') => lookup(
    `googleTranslate("${encodeURIComponent(word)}", '${language}')`
).then(results => {
    const box = new Gtk.Box({
        visible: true,
        orientation: Gtk.Orientation.VERTICAL,
        margin: 3
    })
    const label = new Gtk.Label({
        visible: true,
        wrap: true,
        xalign: 0,
        selectable: true,
        label: results
    })
    const sourceLabel = new Gtk.Label({
        visible: true,
        label: `<small>${_('Translation by Google Translate')}</small>`,
        xalign: 0,
        use_markup: true,
        margin_bottom: 6
    })
    sourceLabel.get_style_context().add_class('dim-label')
    box.pack_start(sourceLabel, false, true, 0)
    box.pack_start(label, false, true, 0)
    return box
})

/*
List of languages supported by Google Translate
Generated by running the following on https://cloud.google.com/translate/docs/languages

```
[...document.querySelectorAll('tbody tr')].map(tr => `'${tr.querySelector('code').innerText}'`).join(',')
```
*/
const translationLangs = [
    'af','sq','am','ar','hy','az','eu','be','bn','bs','bg','ca','ceb',
    'zh-CN','zh-TW','co','hr','cs','da','nl','en','eo','et','fi','fr',
    'fy','gl','ka','de','el','gu','ht','ha','haw','he','hi','hmn','hu',
    'is','ig','id','ga','it','ja','jv','kn','kk','km','rw','ko','ku',
    'ky','lo','la','lv','lt','lb','mk','mg','ms','ml','mt','mi','mr',
    'mn','my','ne','no','ny','or','ps','fa','pl','pt','pa','ro','ru',
    'sm','gd','sr','st','sn','sd','si','sk','sl','so','es','su','sw',
    'sv','tl','tg','ta','tt','te','th','tr','tk','uk','ur','ug','uz',
    'vi','cy','xh','yi','yo','zu'
]

var TranslationBox = GObject.registerClass({
    GTypeName: 'FoliateTranslationBox',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/translationBox.ui',
    Children: ['langCombo'],
    InternalChildren: ['langStore', 'translationStack', 'translationContent']
}, class TranslationBox extends Gtk.Box {
    _init(params, lang = 'en') {
        super._init(params)
        translationLangs.forEach(lang => {
            this._langStore.set(this._langStore.append(),
                [0, 1], [lang, getLanguageDisplayName(lang)])
        })
        this.langCombo.active_id = lang
        this.langCombo.connect('changed', () => this._langChanged())
    }
    lookup(text) {
        this._text = text
        this._translationStack.visible_child_name = 'loading'
        this._translationContent.foreach(child => this._translationContent.remove(child))
        translate(text, this.langCombo.active_id)
            .then(widget => {
                this._translationStack.visible_child_name = 'loaded'
                this._translationContent.add(widget)
            })
            .catch(() => {
                this._translationStack.visible_child_name = 'error'
            })
    }
    _langChanged() {
        if (this._text) this.lookup(this._text)
    }
})
