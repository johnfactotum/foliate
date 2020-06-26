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

const { GObject, Gtk, Gio, Gdk, GdkPixbuf, cairo } = imports.gi
const {
    setTimeout,
    scalePixbuf, makeLinksButton, getLanguageDisplayName, formatDate, markupEscape,
    hslToRgb, colorFromString, isLight,
    makeList
} = imports.utils
const { EpubViewData } = imports.epubView
const { getSubjectAuthority, getMarcRelator } = imports.schemes

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

var BookImage =  GObject.registerClass({
    GTypeName: 'FoliateBookImage',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/bookImage.ui',
    InternalChildren: [
        'image', 'imageTitle', 'imageCreator', 'imageBox',
    ]
}, class BookImage extends Gtk.Overlay {
    loadCover(metadata) {
        const { identifier } = metadata
        const coverPath = EpubViewData.coverPath(identifier)
        try {
            // TODO: loading the file synchronously is probably bad
            const pixbuf = GdkPixbuf.Pixbuf.new_from_file(coverPath)
            this.load(pixbuf)
        } catch (e) {
            this.generate(metadata)
        }
    }
    generate(metadata) {
        const { title, creator, publisher } = metadata
        this._imageTitle.label = title || ''
        this._imageCreator.label = creator || ''
        const width = 120
        const height = 180
        const surface = new cairo.ImageSurface(cairo.Format.ARGB32, width, height)
        const context = new cairo.Context(surface)
        const bg = colorFromString(title + creator + publisher)
        const [r, g, b] = hslToRgb(...bg)
        context.setSourceRGBA(r, g, b, 1)
        context.paint()
        const pixbuf = Gdk.pixbuf_get_from_surface(surface, 0, 0, width, height)
        this.load(pixbuf)
        const className = isLight(r, g, b)
            ? 'foliate-book-image-light' : 'foliate-book-image-dark'
        this._imageBox.get_style_context().add_class(className)
        this._imageBox.show()
    }
    load(pixbuf) {
        // if thumbnail is too small,the experience is going to be bad
        // might as well just show generated cover
        // TODO: a slightly better way is to pack the tiny thumbnail inside the generated cover
        if (pixbuf.get_width() < 48) throw new Error('thumbnail too small')

        const factor = this.get_scale_factor()
        const surface = Gdk.cairo_surface_create_from_pixbuf(
            scalePixbuf(pixbuf, factor), factor, null)

        this._image.set_from_surface(surface)
        this._image.get_style_context().add_class('foliate-book-image')
    }
    get surface() {
        return this._image.surface
    }
    set surface(surface) {
        this._image.set_from_surface(surface)
        this._image.get_style_context().add_class('foliate-book-image')
    }
})

const PropertyBox = GObject.registerClass({
    GTypeName: 'FoliatePropertyBox',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/propertyBox.ui',
    InternalChildren: ['name', 'sep', 'value'],
    Properties: {
        'property-name':
            GObject.ParamSpec.string('property-name', 'property-name', 'property-name',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, ''),
        'property-value':
            GObject.ParamSpec.string('property-value', 'property-value', 'property-value',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, ''),
        'use-markup':
            GObject.ParamSpec.boolean('use-markup', 'use-markup', 'use-markup',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, false),
        'show-separator':
            GObject.ParamSpec.boolean('show-separator', 'show-separator', 'show-separator',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, false)
    }
}, class PropertyBox extends Gtk.Box {
    _init(params, customWidget) {
        super._init(params)
        const flag = GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE
        this.bind_property('property-name', this._name, 'label', flag)
        this.bind_property('show-separator', this._sep, 'visible', flag)
        if (!customWidget) {
            this.bind_property('property-value', this._value, 'label', flag)
            this.bind_property('use-markup', this._value, 'use-markup', flag)
        } else {
            this.remove(this._value)
            this.pack_start(customWidget, false, true, 0)
        }
    }
})

var PropertiesBox = GObject.registerClass({
    GTypeName: 'FoliatePropertiesBox',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/propertiesBox.ui',
    InternalChildren: [
        'cover', 'title', 'creator',
        'description', 'descriptionSep', 'descriptionLong', 'descriptionExpander',
        'categoriesBox',
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
            this._cover.surface = surface
        } else this._cover.generate(metadata)

        let {
            title, creator, description, longDescription,
            publisher, pubdate, modified_date, language, identifier, rights,
            extent, format, categories, subjects, collections, sources,
            contributors
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

        const hasCategories = categories && categories.length
        const hasCollections = collections && collections.length
        if (hasCategories) {
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

            const listWidgets = subjects.map(({ label, authority, term }) => {
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
                    const ctx = authLabel.get_style_context()
                    ctx.add_class('dim-label')
                    ctx.add_class('foliate-authority-label')
                    labelBox.pack_start(authLabel, false, true, 0)
                }
                labelBox.pack_start(labelLabel, false, true, 0)
                labelBox.show_all()
                return labelBox
            })
            const list = makeList(listWidgets)
            this._categoriesBox.pack_start(new PropertyBox({
                property_name: _('Tags'),
                show_separator: true
            }, list), false, true, 0)
        }
        if (hasCollections) {
            const listWidgets = collections.map(x => ({
                label: typeof x === 'string' ? x : x.label
            }))
            const list = makeList(listWidgets)
            this._categoriesBox.pack_start(new PropertyBox({
                property_name: _('Collections'),
                show_separator: true
            }, list), false, true, 0)
        }
        if (!hasCategories && !hasCollections) this._categoriesBox.hide()

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
        if (sources && sources.length) {
            const listWidgets = sources.map(source => {
                source = markupEscape(source)
                const label =
                    source.startsWith('http://') || source.startsWith('https://')
                        ? `<a href="${source}">${source}</a>`
                        : source
                return { label, use_markup: true }
            })
            const list = makeList(listWidgets)
            this._propertiesBox.pack_start(new PropertyBox({
                property_name: _('Sources'),
            }, list), false, true, 0)
        }
        if (contributors && contributors.length) {
            const grid = new Gtk.Grid({
                visible: true,
                column_spacing: 12,
                row_spacing: 3
            })
            const list = contributors
                .map(contributor => {
                    if (typeof contributor === 'string')
                        contributor = {
                            label: contributor,
                            role: 'ctb'
                        }
                    let { label, role, /*scheme*/ } = contributor
                    if (!Array.isArray(role)) role = [role]

                    return role
                        .map(getMarcRelator)
                        .filter(x => x)
                        .map(roleLabel => ({
                            roleLabel,
                            nameLabel: label
                        }))
                })
                .reduce((a, b) => a.concat(b), [])
                .sort((a, b) => a.roleLabel.localeCompare(b.roleLabel))

            list.forEach(({ roleLabel, nameLabel }, i) => {
                const prev = list[i - 1]
                if (!prev || prev.roleLabel !== roleLabel) {
                    const role = new Gtk.Label({
                        visible: true,
                        xalign: 1,
                        justify: Gtk.Justification.RIGHT,
                        halign: Gtk.Align.END,
                        valign: Gtk.Align.CENTER,
                        wrap: true,
                        label: roleLabel
                    })
                    role.get_style_context().add_class('dim-label')
                    grid.attach(role, 0, i, 1, 1)
                }
                const name = new Gtk.Label({
                    visible: true,
                    selectable: true,
                    xalign: 0,
                    wrap: true,
                    label: nameLabel
                })
                grid.attach(name, 1, i, 1, 1)
            })
            this._propertiesBox.pack_start(new PropertyBox({
                property_name: _('Contributors'),
            }, grid), false, true, 0)
        }
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
