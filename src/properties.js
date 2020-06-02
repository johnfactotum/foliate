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

const { GObject, Gtk, Gio, Gdk } = imports.gi
const { scalePixbuf, makeLinksButton } = imports.utils

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
        'actionArea'
    ]
}, class PropertiesBox extends Gtk.Box {
    _init(params, metadata, cover) {
        super._init(params)
        if (cover) {
            const factor = this.get_scale_factor()
            const surface = Gdk.cairo_surface_create_from_pixbuf(
                scalePixbuf(cover, factor), factor, null)
            this._cover.set_from_surface(surface)
            this._cover.get_style_context().add_class('foliate-book-image')
        } else this._cover.hide()

        let {
            title, creator, description,
            publisher, pubdate, modified_date, language, identifier, rights,
            extent, format, categories, subjects
        } = metadata
        if (!categories) categories = subjects

        if (title) this._title.label = title
        else this._title.hide()

        if (creator) this._creator.label = creator
        else this._creator.hide()

        if (description) this._description.label = description
        else this._description.hide()

        if (categories && categories.length) this._propertiesBox.pack_start(new PropertyBox({
            property_name: _('Tags'),
            property_value: categories.join(_(' • '))
        }), false, true, 0)
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
        if (extent) this._propertiesBox.pack_start(new PropertyBox({
            property_name: _('File Size'),
            property_value: extent
        }), false, true, 0)
        if (format) this._propertiesBox.pack_start(new PropertyBox({
            property_name: _('Format'),
            property_value: Gio.content_type_get_description(format)
        }), false, true, 0)
        if (identifier) {
            const isHash = identifier.startsWith('foliate-md5sum-')
            this._propertiesBox.pack_start(new PropertyBox({
                property_name: _('Identifier'),
                property_value: isHash
                    ? identifier.replace('foliate-md5sum-', '')
                    : identifier
            }), false, true, 0)
            if (isHash) {
                const image = new Gtk.Image({
                    visible: true,
                    icon_name: 'dialog-warning-symbolic'
                })
                const note = new Gtk.Label({
                    visible: true,
                    wrap: true,
                    xalign: 0,
                    label: _('This book has no identifier. This is the MD5 hash generated from the file.')
                })
                image.get_style_context().add_class('dim-label')
                note.get_style_context().add_class('dim-label')
                const box = new Gtk.Box({ visible: true, spacing: 12 })
                box.pack_start(image, false, true, 0)
                box.pack_start(note, false, true, 0)
                this._propertiesBox.pack_start(box, false, true, 0)
            }
        }
        if (rights) this._propertiesBox.pack_start(new PropertyBox({
            property_name: _('Copyright'),
            property_value: rights
        }), false, true, 0)
        if (!(title || creator || description ||
            publisher || pubdate || modified_date || language || identifier || rights))
            this.visible_child_name = 'nothing'
    }
    get actionArea() {
        return this._actionArea
    }
})

const findBookOn = [
    {
        title: _('Amazon'),
        href: 'https://www.amazon.com/s?k=%s'
    },
    {
        title: _('Goodreads'),
        href: 'http://www.goodreads.com/search/search?search_type=books&search%5Bquery%5D=%s'
    },
    {
        title: _('Google Books'),
        href: 'https://www.google.com/search?tbm=bks&q=%s'
    },
    {
        title: _('LibraryThing'),
        href: 'https://www.librarything.com/search.php?searchtype=work&search=%s'
    },
    {
        title: _('Open Library'),
        href: 'https://openlibrary.org/search?q=%s'
    },
    {
        title: _('WorldCat'),
        href: 'https://www.worldcat.org/search?q==%s'
    },
]

var PropertiesWindow = GObject.registerClass({
    GTypeName: 'FoliatePropertiesWindow',
}, class PropertiesWindow extends Gtk.Dialog {
    _init(params, metadata, cover) {
        super._init(params)

        const scrolled = new Gtk.ScrolledWindow({
            visible: true,
            min_content_width: 360,
            min_content_height: 480,
        })
        const propertiesBox = new PropertiesBox({
            visible: true,
            border_width: 18
        }, metadata, cover)
        scrolled.add(propertiesBox)

        const box = this.get_content_area()
        box.pack_start(scrolled, true, true, 0)

        if (metadata.title) {
            const actionBar = new Gtk.ActionBar({
                visible: true
            })
            const buttonLinks = findBookOn.map(link => {
                const { href, title } = link
                const uri = href.replace(/%s/g, encodeURIComponent(metadata.title))
                return {
                    href: uri, title
                }
            })
            const button = makeLinksButton(
                {
                    visible: true,
                    label: _('Find on…')
                },
                buttonLinks,
                ({ href }) => Gtk.show_uri_on_window(null, href, Gdk.CURRENT_TIME))
            actionBar.pack_end(button)
            box.pack_end(actionBar, false, true, 0)
        }
    }
})
