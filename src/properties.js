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

const { GObject, Gtk, GdkPixbuf } = imports.gi

const PropertyBox = GObject.registerClass({
    GTypeName: 'FoliatePropertyBox',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/propertyBox.ui',
    InternalChildren: ['name', 'value'],
    Properties: {
        'property-name':
            GObject.ParamSpec.string('property-name', 'property-name', 'property-name',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, ''),
        'property-value':
            GObject.ParamSpec.string('property-value', 'property-value', 'property-value',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, '')
    }
}, class PropertyBox extends Gtk.Box {
    _init(params) {
        super._init(params)
        const flag = GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE
        this.bind_property('property-name', this._name, 'label', flag)
        this.bind_property('property-value', this._value, 'label', flag)
    }
})

var PropertiesBox = GObject.registerClass({
    GTypeName: 'FoliatePropertiesBox',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/propertiesBox.ui',
    InternalChildren: [
        'cover', 'title', 'creator', 'description', 'propertiesBox',
    ]
}, class PropertiesBox extends Gtk.Stack {
    _init(params, metadata, cover) {
        super._init(params)
        if (cover) {
            const width = 120
            const ratio = width / cover.get_width()
            const height = parseInt(cover.get_height() * ratio, 10)
            this._cover.set_from_pixbuf(cover
                .scale_simple(width, height, GdkPixbuf.InterpType.BILINEAR))
            this._cover.get_style_context().add_class('foliate-book-image')
        } else this._cover.hide()

        const {
            title, creator, description,
            publisher, pubdate, modified_date, language, identifier, rights
        } = metadata
        if (title) this._title.label = title
        else this._title.hide()
        if (creator) this._creator.label = creator
        else this._creator.hide()
        if (description) this._description.label = description
        else this._description.hide()
        if (publisher) this._propertiesBox.pack_start(new PropertyBox({
            property_name: _('Publisher'),
            property_value: publisher
        }), false, true, 0)
        if (pubdate) this._propertiesBox.pack_start(new PropertyBox({
            property_name: _('Publication Date'),
            property_value: pubdate
        }), false, true, 0)
        if (modified_date) this._propertiesBox.pack_start(new PropertyBox({
            property_name: _('Modified Date'),
            property_value: modified_date
        }), false, true, 0)
        if (language) this._propertiesBox.pack_start(new PropertyBox({
            property_name: _('Language'),
            property_value: language
        }), false, true, 0)
        if (identifier) this._propertiesBox.pack_start(new PropertyBox({
            property_name: _('Identifier'),
            property_value: identifier
        }), false, true, 0)
        if (rights) this._propertiesBox.pack_start(new PropertyBox({
            property_name: _('Copyright'),
            property_value: rights
        }), false, true, 0)
        if (!(title || creator || description ||
            publisher || pubdate || modified_date || language || identifier || rights))
            this.visible_child_name = 'nothing'
    }
})
