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

const { GObject, Gtk, Gio, Gdk, GdkPixbuf } = imports.gi
const {
    setTimeout,
    scalePixbuf, makeLinksButton, getLanguageDisplayName, formatDate, markupEscape
} = imports.utils

// see https://idpf.github.io/epub-registries/authorities/
// NOTE: the keys are only for the reserved authority values (which is case
// insensitive); for other authorities the URI should be used
var subjectAuthorities = {
    aat: {
        label: _('AAT'),
        name: _('The Getty Art and Architecture Taxonomy')
    },
    bic: {
        label: _('BIC'),
        name: _('Book Industry Communication')
    },
    bisac: {
        label: _('BISAC'),
        name: _('Book Industry Study Group'),
        uri: 'http://www.bisg.org/standards/bisac_subject/index.html'
    },
    clc: {
        label: _('CLC'),
        name: _('Chinese Library Classification')
    },
    ddc: {
        label: _('DDC'),
        name: _('Dewey Decimal Classification'),
        uri: 'http://purl.org/dc/terms/DDC'
    },
    clil: {
        label: _('CLIL'),
        name: _('Commission de Liaison Interprofessionnelle du Livre')
    },
    eurovoc: {
        label: _('EuroVoc'),
        name: _('EuroVoc')
    },
    medtop: {
        label: _('MEDTOP'),
        name: _('IPTC Media Topics')
    },
    lcc: {
        label: _('LCC'),
        name: _('Library of Congress Classification'),
        uri: 'http://purl.org/dc/terms/LCC'
    },
    lcsh: {
        label: _('LCSH'),
        name: _('Library of Congress Subject Headings'),
        uri: 'http://purl.org/dc/terms/LCSH'
    },
    ndc: {
        label: _('NDC'),
        name: _('Nippon Decimal Classification')
    },
    thema: {
        label: _('Thema'),
        name: _('Thema')
    },
    udc: {
        label: _('UDC'),
        name: _('Universal Decimal Classification')
    },
    wgs: {
        label: _('WGS'),
        name: _('Warengruppen-Systematik')
    },
    audience: {
        label: _('Audience'),
        name: _('Intended Audience'),
        uri: 'http://schema.org/audience'
    }
}
const subjectAuthorityByURIMap = new Map()
Object.keys(subjectAuthorities).forEach(key => {
    const x = subjectAuthorities[key]
    subjectAuthorities[key].key = key
    subjectAuthorityByURIMap.set(key, x)
    if (x.uri) subjectAuthorityByURIMap.set(x.uri, x)
})
var getSubjectAuthority = x => x
    ? subjectAuthorityByURIMap.get(x)
    || subjectAuthorityByURIMap.get(x.toLowerCase())
    : null

var findBookOn = [
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
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, ''),
        'use-markup':
            GObject.ParamSpec.boolean('use-markup', 'use-markup', 'use-markup',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, false)
    }
}, class PropertyBox extends Gtk.Box {
    _init(params) {
        super._init(params)
        const flag = GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE
        this.bind_property('property-name', this._name, 'label', flag)
        this.bind_property('property-value', this._value, 'label', flag)
        this.bind_property('use-markup', this._value, 'use-markup', flag)
    }
})

var PropertiesBox = GObject.registerClass({
    GTypeName: 'FoliatePropertiesBox',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/propertiesBox.ui',
    InternalChildren: [
        'cover', 'title', 'creator',
        'description', 'descriptionSep', 'descriptionLong', 'descriptionExpander',
        'categoriesBox', 'categoriesSep',
        'propertiesBox',
        'actionArea'
    ]
}, class PropertiesBox extends Gtk.Box {
    _init(params, metadata, cover) {
        super._init(params)
        if (cover) {
            let surface = cover
            if (cover instanceof GdkPixbuf.Pixbuf) {
                const factor = this.get_scale_factor()
                surface = Gdk.cairo_surface_create_from_pixbuf(
                    scalePixbuf(cover, factor), factor, null)
            }
            this._cover.set_from_surface(surface)
            this._cover.get_style_context().add_class('foliate-book-image')
        }// else this._cover.hide()

        let {
            title, creator, description, longDescription,
            publisher, pubdate, modified_date, language, identifier, rights,
            extent, format, categories, subjects, sources
        } = metadata
        if (!categories) categories = subjects

        if (title) this._title.label = title
        else this._title.hide()

        if (creator) this._creator.label = creator
        else this._creator.hide()

        if (description) {
            this._description.label = description
            if (longDescription) this._descriptionLong.label = longDescription
            else this._descriptionExpander.hide()
        } else {
            this._description.hide()
            this._descriptionExpander.hide()
            this._descriptionSep.hide()
        }

        if (categories && categories.length) {
            const subjects = categories.map(x => {
                if (typeof x === 'string') return { label: x }
                else {
                    let { label, authority, term } = x
                    if (!label) label = term
                    if (!authority) return { label }
                    const auth = getSubjectAuthority(authority)
                    if (!auth) return { label }
                    return {
                        label,
                        authority: auth,
                        term
                    }
                }
            })

            const grid = new Gtk.Grid({
                column_spacing: 6
            })
            subjects.forEach(({ label, authority, term }, i) => {
                const authLabel = authority ? new Gtk.Label({
                    label: authority.label,
                    wrap: true,
                    tooltip_text: authority.name,
                    valign: Gtk.Align.CENTER
                }) : null
                const labelLabel = new Gtk.Label({
                    selectable: true,
                    xalign: 0,
                    wrap: true,
                    label: label || '',
                    tooltip_text: term || ''
                })
                const labelBox = new Gtk.Box({ spacing: 6 })
                if (authLabel) {
                    authLabel.get_style_context()
                        .add_class('foliate-authority-label')
                    labelBox.pack_start(authLabel, false, true, 0)
                }
                labelBox.pack_start(labelLabel, false, true, 0)
                const dot = new Gtk.Label({
                    label: '•',
                    xalign: 1
                })
                dot.get_style_context().add_class('dim-label')
                grid.attach(dot, 0, i, 1, 1)
                grid.attach(labelBox, 1, i, 1, 1)
            })
            grid.show_all()

            this._categoriesBox.pack_start(grid, false, true, 0)
        } else {
            this._categoriesSep.hide()
            this._categoriesBox.hide()
        }

        if (publisher || pubdate || modified_date || language || extent || format) {
            const flowBox = new Gtk.FlowBox({
                visible: true,
                hexpand: true,
                selection_mode: Gtk.SelectionMode.NONE,
                row_spacing: 18,
                column_spacing: 24
            })
            this._propertiesBox.pack_start(flowBox, false, true, 0)
            if (publisher) flowBox.add(new PropertyBox({
                property_name: _('Publisher'),
                property_value: publisher
            }))
            if (pubdate) {
                const dateString = formatDate(pubdate)
                flowBox.add(new PropertyBox({
                    property_name: _('Publication Date'),
                    property_value: dateString
                }))
            }
            if (modified_date) {
                const dateString = formatDate(modified_date, true)
                flowBox.add(new PropertyBox({
                    property_name: _('Modified Date'),
                    property_value: dateString
                }))
            }
            if (language) {
                const name = getLanguageDisplayName(language, true)
                if (name) flowBox.add(new PropertyBox({
                    property_name: _('Language'),
                    property_value: name
                }))
            }
            if (extent) flowBox.add(new PropertyBox({
                property_name: _('File Size'),
                property_value: extent
            }))
            if (format) flowBox.add(new PropertyBox({
                property_name: _('Format'),
                property_value: Gio.content_type_get_description(format)
            }))
        }

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
        if (sources && sources.length) this._propertiesBox.pack_start(new PropertyBox({
            property_name: _('Sources'),
            use_markup: true,
            property_value: sources
                .map(markupEscape)
                .map(x => x.startsWith('http://') || x.startsWith('https://')
                    ? `<a href="${x}">${x}</a>`
                    : x)
                .map(x => sources.length > 1 ? `<span alpha="50%"> •  </span>${x}` : x)
                .join('\n')
        }), false, true, 0)
        if (rights) this._propertiesBox.pack_start(new PropertyBox({
            property_name: _('Copyright'),
            property_value: rights
        }), false, true, 0)
    }
    get actionArea() {
        return this._actionArea
    }
})

var PropertiesWindow = GObject.registerClass({
    GTypeName: 'FoliatePropertiesWindow',
}, class PropertiesWindow extends Gtk.Dialog {
    _init(params, metadata, cover) {
        super._init(params)
        this._counter = 0
        this._buttons = new Set()

        if (this.transient_for) {
            const [width, height] = this.transient_for.get_size()
            this.default_width = Math.min(500, width * 0.95)
            this.default_height = Math.min(600, height * 0.95)
        }

        this._stack = new Gtk.Stack({
            visible: true,
            homogeneous: false,
        })
        const box = this.get_content_area()
        box.pack_start(this._stack, true, true, 0)

        this.updateProperties(metadata, cover)
    }
    setVisible(name, isPrev) {
        const stack = this._stack
        const transition = isPrev
            ? Gtk.StackTransitionType.SLIDE_RIGHT
            : Gtk.StackTransitionType.SLIDE_LEFT
        this._stack.set_visible_child_full(name, transition)

        // remove other children after the transition is completed
        const duration = stack.transition_duration
        setTimeout(() => {
            const children = stack.get_children()
            children
                .filter(x => x !== stack.visible_child)
                .forEach(x => stack.remove(x))
        }, duration)
    }
    updateProperties(metadata, cover) {
        this._scrolled = new Gtk.ScrolledWindow({
            visible: true
        })
        this.metadata = metadata
        this.propertiesBox = new PropertiesBox({
            visible: true,
            border_width: 18
        }, metadata, cover)
        const name = `${this._counter++}`
        this._scrolled.add(this.propertiesBox)
        this._stack.add_named(this._scrolled, name)
        return name
    }
    clearButtons() {
        const headerbar = this.get_header_bar()
        this._buttons.forEach(button => {
            headerbar.remove(button)
            this._buttons.delete(button)
        })
    }
    packButton(isPrev, callback) {
        const headerbar = this.get_header_bar()
        const button = new Gtk.Button({
            visible: true,
            image: new Gtk.Image({
                visible: true,
                icon_name: isPrev
                    ? 'go-previous-symbolic' : 'go-next-symbolic'
            }),
            tooltip_text: isPrev ? _('Previous') : _('Next')
        })
        button.connect('clicked', () => {
            if (callback) callback(isPrev)
        })
        if (isPrev) headerbar.pack_start(button)
        else headerbar.pack_end(button)
        this._buttons.add(button)
    }
    packFindBookOnButton() {
        const bookTitle = this.metadata.title
        if (!bookTitle) return

        const buttonLinks = findBookOn.map(link => {
            const { href, title } = link
            const uri = href.replace(/%s/g, encodeURIComponent(bookTitle))
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

        this.propertiesBox.actionArea.add(button)
    }
})
