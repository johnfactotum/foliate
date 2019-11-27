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

pkg.initGettext()
pkg.initFormat()
pkg.require({
    'Gio': '2.0',
    'Gtk': '3.0'
})

const { Gio, Gtk } = imports.gi

const { mimetypes } = imports.utils
const { FoliateWindow } = imports.window
const { customThemes, ThemeEditor, makeThemeFromSettings, applyTheme } = imports.theme

const settings = new Gio.Settings({ schema_id: pkg.name })

const makeActions = app => ({
    'new-theme': [() => {
        const theme = makeThemeFromSettings()
        const editor = new ThemeEditor(theme)
        const dialog = editor.widget
        dialog.transient_for = app.active_window
        if (dialog.run() === Gtk.ResponseType.OK) {
            customThemes.addTheme(theme)
            applyTheme(theme)
        }
        dialog.destroy()
    }],
    'preferences': [() => {
        const builder = Gtk.Builder.new_from_resource(
            '/com/github/johnfactotum/Foliate/ui/preferenceWindow.ui')

        const restoreLastFile = builder.get_object('restoreLastFile')
        settings.bind('restore-last-file', restoreLastFile,
            'state', Gio.SettingsBindFlags.DEFAULT)

        const singleActionCombo = builder.get_object('singleActionCombo')
        settings.bind('selection-action-single', singleActionCombo,
            'active-id', Gio.SettingsBindFlags.DEFAULT)

        const multipleActionCombo = builder.get_object('multipleActionCombo')
        settings.bind('selection-action-multiple', multipleActionCombo,
            'active-id', Gio.SettingsBindFlags.DEFAULT)

        const ttsEntry = builder.get_object('ttsEntry')
        settings.bind('tts-command', ttsEntry, 'text', Gio.SettingsBindFlags.DEFAULT)

        const dialog = builder.get_object('preferenceDialog')
        dialog.transient_for = app.active_window
        dialog.run()
        dialog.destroy()
    }],
    'open': [() => {
        const allFiles = new Gtk.FileFilter()
        allFiles.set_name(_('All Files'))
        allFiles.add_pattern('*')

        const epubFiles = new Gtk.FileFilter()
        epubFiles.set_name(_('E-book Files'))
        epubFiles.add_mime_type(mimetypes.epub)
        epubFiles.add_mime_type(mimetypes.mobi)
        epubFiles.add_mime_type(mimetypes.kindle)

        const dialog = Gtk.FileChooserNative.new(
            _('Open File'),
            app.active_window,
            Gtk.FileChooserAction.OPEN,
            null, null)
        dialog.add_filter(epubFiles)
        dialog.add_filter(allFiles)

        if (dialog.run() === Gtk.ResponseType.ACCEPT)
            app.active_window.open(dialog.get_file())
    }, ['<ctrl>o']],
    'about': [() => {
        const aboutDialog = new Gtk.AboutDialog({
            authors: ['John Factotum'],
            artists: ['John Factotum'],
            translator_credits: _('translator-credits'),
            program_name: _('Foliate'),
            comments: _('A simple and modern eBook viewer'),
            logo_icon_name: pkg.name,
            version: pkg.version,
            license_type: Gtk.License.GPL_3_0,
            website: 'https://johnfactotum.github.io/foliate/',
            modal: true,
            transient_for: app.active_window
        })
        aboutDialog.run()
        aboutDialog.destroy()
    }],
    'quit': [() => app.get_windows()
        .forEach(window => window.close()), ['<ctrl>q']],
})

function main(argv) {
    const application = new Gtk.Application({
        application_id: 'com.github.johnfactotum.Foliate',
        flags: Gio.ApplicationFlags.HANDLES_OPEN
    })

    application.connect('activate', () => {
        const activeWindow = application.activeWindow
            || new FoliateWindow({ application })
        activeWindow.present()
    })

    application.connect('open', (_, files) => files.forEach(file => {
        const window = new FoliateWindow({ application, file })
        window.present()
    }))

    const actions = makeActions(application)
    Object.keys(actions).forEach(name => {
        const [func, accels] = actions[name]
        const action = new Gio.SimpleAction({ name })
        action.connect('activate', func)
        application.add_action(action)
        if (accels) application.set_accels_for_action(`app.${name}`, accels)
    })

    return application.run(argv)
}
