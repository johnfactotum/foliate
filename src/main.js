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

const { FoliateWindow } = imports.window

function main(argv) {
    const application = new Gtk.Application({
        application_id: 'com.github.johnfactotum.Foliate',
        flags: Gio.ApplicationFlags.HANDLES_OPEN
    })

    application.connect('activate', app => {
        const activeWindow = app.activeWindow || new FoliateWindow(app)
        activeWindow.present()
    })

    return application.run(argv)
}
