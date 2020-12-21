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

const { Gtk, Gio, WebKit2 } = imports.gi
const ByteArray = imports.byteArray
const ngettext = imports.gettext.ngettext
const { mimetypes, readJSON, sepHeaderFunc } = imports.utils
const { EpubViewAnnotation } = imports.epubView
const { EpubCFI } = imports.epubcfi
const { AnnotationRow } = imports.contents

const exportToHTML = async ({ annotations }, metadata, getSection) => {
    const head = `<!DOCTYPE html>
    <meta charset="utf-8">
    <style>
        body { max-width: 720px; padding: 10px; margin: auto; }
        header { text-align: center; }
        hr { border: 0; height: 1px; background: rgba(0, 0, 0, 0.2); margin: 20px 0; }
        .cfi { font-size: small; opacity: 0.5; font-family: monospace; }
        .section { font-weight: bold; }
        blockquote { margin: 0; padding-left: 15px; border-left: 7px solid; }
    </style>
    <header>`
    + _('<p>Annotations for</p><h1>%s</h1><h2>By %s</h2>').format(metadata.title, metadata.creator)
    + '</header><p>'
    + ngettext('%d Annotation', '%d Annotations', annotations.length).format(annotations.length) + '</p>'
    const body = await Promise.all(annotations.map(async ({ value, text, color, note }) => `
    <hr>
    <section>
        <p class="cfi">${value}</p>
        ${getSection ? `<p class="section">${await getSection(value)}</p>` : ''}
        <blockquote style="border-color: ${color};">${text}</blockquote>
        ${note ? '<p>' + note.replace(/\n/g, '<br>') + '</p>' : ''}
    </section>`))
    return head + body.join('')
}

const exportToTxt = async ({ annotations }, metadata, getSection) => {
    const head = _('Annotations for “%s” by %s').format(metadata.title, metadata.creator) + '\n\n'
        + ngettext('%d Annotation', '%d Annotations', annotations.length).format(annotations.length)
    const body = await Promise.all(annotations.map(async ({ value, text, color, note }) => '\n\n'
        + '--------------------------------------------------------------------------------\n\n'
        + (getSection ? _('Section: ') + (await getSection(value)) + '\n' : '')
        + _('Highlight: ') + color + '\n\n'
        + _('Text:') + '\n' + text
        + (note ? '\n\n' + _('Note:') + '\n' + note : '')))
    return head + body.join('')
}

const exportToMarkdown = async ({ annotations }, metadata, getSection) => {
    const head = '# ' + _('Annotations for *%s* by %s').format(metadata.title, metadata.creator) + '\n\n'
        + ngettext('%d Annotation', '%d Annotations', annotations.length).format(annotations.length)
    const body = await Promise.all(annotations.map(async ({ value, text, color, note }) =>`

---

${getSection ? await getSection(value) + ' - ' : ''}**${color}**

> ${text}${note ? '\n\n' + note : ''}`))
    return head + body.join('')
}

const exportToBibTeX = ({ annotations }, metadata) => {
    // Escape all Tex characters that BibTex requires
    const esc = cont => !cont ? '' : Array.from(cont).map(c =>
        c === '#' ? '\\#'
        : c === '$' ? '\\$'
        : c === '%' ? '\\%'
        : c === '&' ? '\\&'
        : c === '\\' ? '\\textbackslash{}'
        : c === '^' ? '\\textasciicircum{}'
        : c === '_' ? '\\_'
        : c === '{' ? '\\{'
        : c === '}' ? '\\}'
        : c === '~' ? '\\textasciitilde{}'
        : c).join('')

    // Math functions needed to avoid Tex problems
    const header = `ref${Math.round(Math.random() * 10000)}`

    return annotations.map(({ text, note }, i) => `@book{${header}:${i + 1},
    author = {${esc(metadata.creator) || 'unknown'}},
    publisher = {${esc(metadata.publisher) || 'unknown'}},
    year = {${metadata.pubdate ? metadata.pubdate.slice(0, 4) : 'unknown'}},
    note = {${_('Quote: ') + esc(text) + (note ? _(" Note: ") + esc(note) : '')}}
},
`).join('')
}

var exportAnnotations = async (window, data, metadata, getSection) => {
    if (!data.annotations || !data.annotations.length) {
        const msg = new Gtk.MessageDialog({
            text: _('No annotations'),
            secondary_text: _("You don't have any annotations for this book.")
                + '\n' + _('Highlight some text to add annotations.'),
            message_type: Gtk.MessageType.INFO,
            buttons: [Gtk.ButtonsType.OK],
            modal: true,
            transient_for: window
        })
        msg.run()
        msg.destroy()
        return
    }

    const builder = Gtk.Builder.new_from_resource(
        '/com/github/johnfactotum/Foliate/ui/exportWindow.ui')
    const dialog = builder.get_object('exportDialog')
    dialog.transient_for = window

    dialog.default_width = 360

    const response = dialog.run()
    if (response === Gtk.ResponseType.OK) {
        const format = builder.get_object('formatsCombo').active_id
        const chooser = new Gtk.FileChooserNative({
            title: _('Save File'),
            action: Gtk.FileChooserAction.SAVE,
            do_overwrite_confirmation: true,
            modal: true,
            transient_for: window
        })
        const title = metadata.title
        chooser.set_current_name(_('Annotations for “%s”').format(title) + '.' + format)
        const response = chooser.run()
        if (response === Gtk.ResponseType.ACCEPT) {
            let contents = ''
            switch (format) {
                case 'json':
                    contents = JSON.stringify(data, null, 2)
                    break
                case 'html':
                    contents = await exportToHTML(data, metadata, getSection)
                    break
                case 'md':
                    contents = await exportToMarkdown(data, metadata, getSection)
                    break
                case 'txt':
                    contents = await exportToTxt(data, metadata, getSection)
                    break
                case 'bib':
                    contents = exportToBibTeX(data, metadata)
                    break
            }
            const file = Gio.File.new_for_path(chooser.get_filename())
            file.replace_contents(contents, null, false,
                Gio.FileCreateFlags.REPLACE_DESTINATION, null)
        }
        dialog.close()
    } else dialog.close()
}

var importAnnotations = (window, epub) => {
    const allFiles = new Gtk.FileFilter()
    allFiles.set_name(_('All Files'))
    allFiles.add_pattern('*')

    const jsonFiles = new Gtk.FileFilter()
    jsonFiles.set_name(_('JSON Files'))
    jsonFiles.add_mime_type(mimetypes.json)

    const htmlFiles = new Gtk.FileFilter()
    htmlFiles.set_name(_('HTML Files'))
    htmlFiles.add_mime_type('text/html')

    let dialog = Gtk.FileChooserNative.new(
        _('Import Annotations'),
        window,
        Gtk.FileChooserAction.OPEN,
        null, null)
    dialog.add_filter(htmlFiles)
    dialog.add_filter(jsonFiles)
    dialog.add_filter(allFiles)

    if (dialog.run() === Gtk.ResponseType.ACCEPT) {
        const isJSON = dialog.get_filename().endsWith(".json")
        const isHTML = dialog.get_filename().endsWith(".html")

        const file = dialog.get_file()

        window_global = window
        epub_global = epub

        try {
            if (isJSON) {
                let json = readJSON(file)
                importWindowDialog(json)
            } else if (isHTML) {
                parseHTML(file)
            } else throw new Error()
        } catch (e) {
            const msg = new Gtk.MessageDialog({
                text: _('Error'),
                secondary_text: _('Could not import annotations.'),
                message_type: Gtk.MessageType.ERROR,
                buttons: [Gtk.ButtonsType.OK],
                modal: true,
                transient_for: window
            })
            msg.run()
            msg.destroy()
        }
    }
}

// Params, used after JSON processing job completes
let epub_global = null
let window_global = null

var importWindowDialog = (json) => {
    if (!json.annotations.length) {
        const msg = new Gtk.MessageDialog({
            text: _('No annotations'),
            secondary_text: _('There’s nothing to import.'),
            message_type: Gtk.MessageType.INFO,
            buttons: [Gtk.ButtonsType.OK],
            modal: true,
            transient_for: window_global
        })
        msg.run()
        msg.destroy()
        return
    }
    const list = new Gio.ListStore()
    let annotations = json.annotations
        .sort((a, b) => EpubCFI.compare(a.value, b.value))
        .map(({ value, color, text, note }) =>
            new EpubViewAnnotation({
                cfi: value,
                color: color || 'yellow',
                text: text || '',
                note: note || ''
            }))

    annotations.forEach(annotation => list.append(annotation))

    const builder = Gtk.Builder.new_from_resource(
        '/com/github/johnfactotum/Foliate/ui/importWindow.ui')
    const dialog = builder.get_object('importDialog')
    dialog.transient_for = window_global

    const [width, height] = window_global.get_size()
    dialog.default_width = Math.min(500, width)
    dialog.default_height = height * 0.7

    const listbox = builder.get_object('annotationsListBox')
    listbox.bind_model(list, annotation =>
        new AnnotationRow(annotation, epub_global, false))
    listbox.set_header_func(sepHeaderFunc)

    if (dialog.run() === Gtk.ResponseType.ACCEPT) {
        if (!json.metadata || !json.metadata.identifier
            || json.metadata.identifier !== epub_global.metadata.identifier) {
                const msg = new Gtk.MessageDialog({
                    text: _('Identifier mismatch'),
                    secondary_text: _('The identifier of the imported file does not match the book’s. This might indicate that the annotations do not belong to this book.'),
                    message_type: Gtk.MessageType.QUESTION,
                    modal: true,
                    transient_for: dialog
                })
                msg.add_button(_('Cancel'), Gtk.ResponseType.CANCEL)
                msg.add_button(_('Import Anyway'), Gtk.ResponseType.ACCEPT)
                const accept = msg.run() === Gtk.ResponseType.ACCEPT
                msg.destroy()
            if (!accept) annotations = null
        }
        if (annotations) annotations
            .forEach(annotation => window_global._epub.addAnnotation(annotation))
    }
    dialog.close()
}

// Import HTML Annotations
var parseHTML = file => {
    try {
        // Make a WebView, fill it with data, parse to JSON
        const [success, data, /*tag*/] = file.load_contents(null)
        if (success) {
            let raw = data instanceof Uint8Array
                ? ByteArray.toString(data) : data.toString()

            const importWebKitSettings = new WebKit2.Settings({
                allow_top_navigation_to_data_urls: false,
                allow_modal_dialogs: false,
                enable_fullscreen: false,
                enable_html5_database: false,
                enable_html5_local_storage: false,
                enable_hyperlink_auditing: false,
                enable_offline_web_application_cache: false,
                enable_java: true,
                enable_plugins: false,
                media_playback_requires_user_gesture: true,
                enable_write_console_messages_to_stdout: true,
                allow_file_access_from_file_urls: true,
                enable_javascript_markup: false
            })

            importWebKitSettings.set_user_agent_with_application_details('Foliate', pkg.version)
            let importWebView = new WebKit2.WebView({
                visible: false,
                is_ephemeral: true,
                settings: importWebKitSettings
            })

            // Collect the annotations, after HTML document loads.
            importWebView.connect('load-changed', (webView, event) => {
                if (event == WebKit2.LoadEvent.FINISHED) {
                    const parser_script = `
                        function parser() {
                            let sects = document.getElementsByTagName('section');
                            let array_sects = Array.prototype.slice.call(sects);
                            let json_array = [];
                            for (let i = 0;i < array_sects.length; i++) {
                                let s_cfi = array_sects[i].getElementsByClassName('cfi')[0].textContent;
                                let s_col = array_sects[i].getElementsByTagName('blockquote')[0].style.borderColor
                                let s_section = array_sects[i].getElementsByClassName('section')[0].textContent;
                                let s_blockquote = array_sects[i].getElementsByTagName('blockquote')[0].textContent;
                                let s_note = array_sects[i].getElementsByTagName('p')[2];
                                s_note = (s_note !== undefined) ? s_note.innerText.replace(/<br>/g, '\\n') : '';
                                json_array.push({"value":s_cfi, "color":s_col, "text":s_blockquote, "note":s_note});
                            }
                            return JSON.stringify({"annotations":json_array});
                        }
                        parser();`

                    importWebView.run_javascript(parser_script, null, (self, result) => {
                        const jsResult = self.run_javascript_finish(result)
                        const value = jsResult.get_js_value().to_string()
                        if (value == null) return;
                        importWindowDialog(JSON.parse(value))
                    })

                }
            })

            importWebView.load_html(raw, null)
        }
        else throw new Error()
    } catch (e) {
        log(e)
    }
}
