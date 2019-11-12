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

const { Gtk, Gio } = imports.gi
const ngettext = imports.gettext.ngettext

const exportToHTML = ({ annotations }, metadata) => `<!DOCTYPE html>
    <meta charset="utf-8">
    <style>
        body { max-width: 720px; padding: 10px; margin: auto; }
        header { text-align: center; }
        hr { border: 0; height: 1px; background: rgba(0, 0, 0, 0.2); margin: 20px 0; }
        .cfi { font-size: small; opacity: 0.5; font-family: monospace; }
        blockquote { margin: 0; padding-left: 15px; border-left: 7px solid; }
    </style>
    <header>`
    + _('<p>Annotations for</p><h1>%s</h1><h2>By %s</h2>').format(metadata.title, metadata.creator)
    + '</header><p>'
    + ngettext('%d Annotation', '%d Annotations', annotations.length).format(annotations.length) + '</p>'
    + annotations.map(({ value, text, color, note }) => `
    <hr>
    <section>
        <p class="cfi">${value}</p>
        <blockquote style="border-color: ${color};">${text}</blockquote>
        ${note ? '<p>' + note + '</p>' : ''}
    </section>`).join('')

// workaround for gettext bug
// `/`

const exportToTxt = ({ annotations }, metadata) =>
    _('Annotations for\n%s\nBy %s').format(metadata.title, metadata.creator) + '\n\n'
    + ngettext('%d Annotation', '%d Annotations', annotations.length).format(annotations.length)
    + annotations.map(({ text, note }) => '\n\n'
        + '--------------------------------------------------------------------------------\n\n'
        + _('Text:') + '\n' + text
        + (note ? '\n\n' + _('Note:') + '\n' + note : '')).join('')

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

var exportAnnotations = (window, data, metadata) => {
    const builder = Gtk.Builder.new_from_resource(
        '/com/github/johnfactotum/Foliate/ui/exportWindow.ui')
    const dialog = builder.get_object('exportDialog')
    dialog.transient_for = window

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
        const title = window._epub.metadata.title
        chooser.set_current_name(_('Annotations for %s').format(title) + '.' + format)
        const response = chooser.run()
        if (response === Gtk.ResponseType.ACCEPT) {
            let contents = ''
            switch (format) {
                case 'json':
                    contents = JSON.stringify(data, null, 2)
                    break
                case 'html':
                    contents = exportToHTML(data, metadata)
                    break
                case 'txt':
                    contents = exportToTxt(data, metadata)
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

