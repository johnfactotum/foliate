#!@GJS@ -m
// eslint-disable-next-line no-useless-escape
const MESON = '\@GJS@' !== '@GJS@' // the latter would be replace by Meson

import Gtk from 'gi://Gtk?version=4.0'
import Gio from 'gi://Gio?version=2.0'
import GLib from 'gi://GLib?version=2.0'
import 'gi://Adw?version=1'
import 'gi://WebKit?version=6.0'
import { programInvocationName, programArgs, exit }  from 'system'
import { bindtextdomain, textdomain, gettext as _ } from 'gettext'
import { setConsoleLogDomain } from 'console'

// mimics (loosely) the `pkg` object set up by GJS if you run `package.init()`
globalThis.pkg = {
    name: 'com.github.johnfactotum.Foliate',
    version: '3.0.1',
}

GLib.set_prgname(pkg.name)
setConsoleLogDomain(pkg.name)
Gtk.Window.set_default_icon_name(pkg.name)
bindtextdomain(pkg.name, GLib.build_filenamev([MESON ? '@datadir@' : '/usr/share', 'locale']))
textdomain(pkg.name)

pkg.localeName = _('Foliate')
GLib.set_application_name(pkg.localeName)

pkg.datadir = GLib.build_filenamev([GLib.get_user_data_dir(), pkg.name])
pkg.datapath = path => GLib.build_filenamev([pkg.datadir, path])
pkg.datafile = path => Gio.File.new_for_path(pkg.datapath(path))

pkg.configdir = GLib.build_filenamev([GLib.get_user_config_dir(), pkg.name])
pkg.configpath = path => GLib.build_filenamev([pkg.configdir, path])

pkg.cachedir = GLib.build_filenamev([GLib.get_user_cache_dir(), pkg.name])
pkg.cachepath = path => GLib.build_filenamev([pkg.cachedir, path])

if (MESON) {
    // when using Meson, load from compiled GResource binary
    Gio.Resource
        .load(GLib.build_filenamev(['@datadir@', pkg.name, `${pkg.name}.gresource`]))
        ._register()
    const moduledir = '/' + pkg.name.replaceAll('.', '/')
    pkg.modulepath = path => GLib.build_filenamev([moduledir, path])
    pkg.moduleuri = path => `resource://${pkg.modulepath(path)}`
}
else {
    const moduledir = GLib.path_get_dirname(GLib.filename_from_uri(import.meta.url)[0])
    pkg.modulepath = path => GLib.build_filenamev([moduledir, path])
    pkg.moduleuri = path => GLib.filename_to_uri(pkg.modulepath(path), null)
}
pkg.useResource = MESON

const { Application } = await import(pkg.moduleuri('app.js'))
exit(await new Application().runAsync([programInvocationName, ...programArgs]))
