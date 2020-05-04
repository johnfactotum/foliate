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

const { GObject, Gtk } = imports.gi
let Handy; try { Handy = imports.gi.Handy } catch (e) {}

// Wrap various libhandy widgets
// so we will fall back to GTK widgets if libhandy is unavailable

var HdyHeaderBar =  GObject.registerClass({
    GTypeName: 'FoliateHdyHeaderBar',
}, Handy
    ? class HdyHeaderBar extends Handy.HeaderBar {}
    : class HdyHeaderBar extends Gtk.HeaderBar {})

var HdyViewSwitcher =  GObject.registerClass({
    GTypeName: 'FoliateHdyViewSwitcher',
}, Handy
    ? class HdyViewSwitcher extends Handy.ViewSwitcher {}
    : class HdyViewSwitcher extends Gtk.StackSwitcher {})

var HdyColumn =  GObject.registerClass({
    GTypeName: 'FoliateHdyColumn',
    Properties: Handy ? {} : {
        'linear-growth-width':
            GObject.ParamSpec.int('linear-growth-width', 'linear-growth-width', 'linear-growth-widthh',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, 0, 2147483647, 0),
        'maximum-width':
            GObject.ParamSpec.int('maximum-width', 'maximum-width', 'maximum-width',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, 0, 2147483647, 0),
    }
}, Handy
    ? class HdyColumn extends Handy.Column {}
    : class HdyColumn extends Gtk.Bin {})
