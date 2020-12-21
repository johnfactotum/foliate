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

var HdyViewSwitcherBar =  GObject.registerClass({
    GTypeName: 'FoliateHdyViewSwitcherBar',
}, Handy
    ? class HdyViewSwitcher extends Handy.ViewSwitcherBar {}
    : class HdyViewSwitcher extends Gtk.StackSwitcher {})

var HdySqueezer =  GObject.registerClass({
    GTypeName: 'FoliateHdySqueezer',
    Properties: Handy ? {} : {
        'transition-type':
            GObject.ParamSpec.string('transition-type', 'transition-type', 'transition-type',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, ''),
    }
}, Handy
    ? class HdySqueezer extends Handy.Squeezer {}
    : class HdySqueezer extends Gtk.Box {})

var HdySearchBar =  GObject.registerClass({
    GTypeName: 'FoliateHdySearchBar',
}, Handy
    ? class HdySearchBar extends Handy.SearchBar {}
    : class HdySearchBar extends Gtk.SearchBar {})

var HdyColumn =  GObject.registerClass({
    GTypeName: 'FoliateHdyColumn',
    Properties: Handy && Handy.Column ? {} : {
        'linear-growth-width':
            GObject.ParamSpec.int('linear-growth-width', 'linear-growth-width', 'linear-growth-widthh',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, 0, 2147483647, 0),
        'maximum-width':
            GObject.ParamSpec.int('maximum-width', 'maximum-width', 'maximum-width',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, 0, 2147483647, 0),
    }
}, Handy
    ? (Handy.Column
        ? class HdyColumn extends Handy.Column {}
        : class HdyColumn extends Handy.Clamp {
            constructor(params) {
                super._init(params)
                this.maximum_size = params.maximum_width
                this.tightening_threshold = params.linear_growth_width
            }
            get maximum_width() {
                return maximum_size
            }
            set maximum_width(x) {
                this.maximum_size = x
            }
            get linear_growth_width() {
                return tightening_threshold
            }
            set linear_growth_width(x) {
                this.tightening_threshold = x
            }
        })
    : class HdyColumn extends Gtk.Bin {})
