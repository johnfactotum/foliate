#!/usr/bin/gjs -m
import Gtk from 'gi://Gtk?version=4.0'
import Gio from 'gi://Gio?version=2.0'
import GLib from 'gi://GLib?version=2.0'
import 'gi://Adw?version=1'
import 'gi://WebKit2?version=5.0'
import { programInvocationName, programArgs, exit }  from 'system'
import { bindtextdomain, textdomain, gettext as _ } from 'gettext'
import { setConsoleLogDomain } from 'console'

// mimics (loosely) the `pkg` object set up by GJS if you run `package.init()`
globalThis.pkg = {
    name: 'com.github.johnfactotum.Foliate',
    version: '3.0.0',
}

GLib.set_prgname(pkg.name)
setConsoleLogDomain(pkg.name)
Gtk.Window.set_default_icon_name(pkg.name)
bindtextdomain(pkg.name, GLib.build_filenamev(['/usr/share', 'locale']))
textdomain(pkg.name)

pkg.localeName = _('Foliate')
GLib.set_application_name(pkg.localeName)

pkg.datadir = GLib.build_filenamev([GLib.get_user_data_dir(), pkg.name])
pkg.datapath = path => GLib.build_filenamev([pkg.datadir, path])
pkg.datafile = path => Gio.File.new_for_path(pkg.datapath(path))

pkg.cachedir = GLib.build_filenamev([GLib.get_user_cache_dir(), pkg.name])
pkg.cachepath = path => GLib.build_filenamev([pkg.cachedir, path])

pkg.moduledir = GLib.path_get_dirname(GLib.filename_from_uri(import.meta.url)[0])
pkg.modulepath = path => GLib.build_filenamev([pkg.moduledir, path])
pkg.moduleuri = path => GLib.filename_to_uri(pkg.modulepath(path), null)

// run application
// see https://gitlab.gnome.org/GNOME/gjs/-/issues/468
const { mainloop } = imports
import(pkg.moduleuri('app.js'))
    .then(({ Application }) => setTimeout(() => {
        mainloop.quit()
        exit(new Application().run([programInvocationName, ...programArgs]))
    }))
    .catch(e => console.error(e))

mainloop.run()
