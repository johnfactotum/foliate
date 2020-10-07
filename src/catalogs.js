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

const { GObject, Gtk, Gio, GLib } = imports.gi
const { Storage } = imports.utils

const defaultCatalogs = [
    {
        title: 'Standard Ebooks',
        uri: 'https://standardebooks.org/opds',
        preview: 'https://standardebooks.org/opds/all',
    },
    {
        title: 'Feedbooks',
        uri: 'https://catalog.feedbooks.com/catalog/index.atom',
        preview: 'https://catalog.feedbooks.com/publicdomain/browse/homepage_selection.atom?lang=en',
    },
    {
        title: 'Project Gutenberg',
        uri: 'https://m.gutenberg.org/ebooks.opds/',
        preview: 'https://www.gutenberg.org/ebooks/search.opds/?sort_order=random',
    }
]

var Catalog = GObject.registerClass({
    GTypeName: 'FoliateCatalog',
    Properties: {
        'title':
            GObject.ParamSpec.string('title', 'title', 'title',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, ''),
        'uri':
            GObject.ParamSpec.string('uri', 'uri', 'uri',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, ''),
        'preview':
            GObject.ParamSpec.string('preview', 'preview', 'preview',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, ''),
    }
}, class Catalog extends GObject.Object {
    toJSON() {
        const { title, uri, preview } = this
        return { title, uri, preview }
    }
})

var CatalogRow = GObject.registerClass({
    GTypeName: 'FoliateCatalogRow',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/catalogRow.ui',
    InternalChildren: ['title', 'uri', 'open', 'button', 'preview']
}, class CatalogRow extends Gtk.ListBoxRow {
    _init(catalog, preview, open) {
        super._init({ activatable: false })
        this.preview = preview
        this.open = open
        this._previewWidget = null

        this._open.connect('clicked', () => this.open())
        this._button.connect('clicked', () => this._edit())

        this.catalog = catalog
        const flag = GObject.BindingFlags.DEFAULT | GObject.BindingFlags.SYNC_CREATE
        catalog.bind_property('title', this._title, 'label', flag)
        catalog.bind_property('uri', this._uri, 'label', flag)

        this._update()
        const handler = catalog.connect('notify::preview', () => this._update())
        this.connect('unrealize', () => catalog.disconnect(handler))
    }
    _update() {
        if (this._previewWidget) this._preview.remove(this._previewWidget)
        const widget = this.preview(this.catalog.preview)
        if (widget) {
            this._previewWidget = widget
            this._preview.pack_start(widget, false, true, 0)
            this._preview.show()
        } else this._preview.hide()
    }
    _remove() {
        catalogStore.remove(this.catalog)
    }
    _edit() {
        const catalog = this.catalog
        const editor = new CatalogEditor(new Catalog({
            title: catalog.title,
            uri: catalog.uri,
            preview: catalog.preview
        }), () => this._remove())
        const dialog = editor.widget
        dialog.transient_for = this.get_toplevel()
        if (dialog.run() === Gtk.ResponseType.OK) {
            const { title, uri, preview } = editor.catalog
            catalog.set_property('title', title)
            catalog.set_property('uri', uri)
            catalog.set_property('preview', preview)
        }
        dialog.destroy()
    }
})

var CatalogEditor = class CatalogEditor {
    constructor(catalog = new Catalog(), removeFunc) {
        const builder = Gtk.Builder.new_from_resource(
            '/com/github/johnfactotum/Foliate/ui/catalogWindow.ui')

        this.widget = builder.get_object('catalogDialog')
        this.catalog = catalog

        if (removeFunc) {
            const removeButton = builder.get_object('removeButton')
            removeButton.connect('clicked', () => {
                removeFunc()
                this.widget.response(0)
            })
            removeButton.show()
        }

        const $ = builder.get_object.bind(builder)

        const flag =  GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE
        catalog.bind_property('title', $('title'), 'text', flag)
        catalog.bind_property('uri', $('uri'), 'text', flag)
        catalog.bind_property('preview', $('preview'), 'text', flag)
    }
}

class CatalogStore {
    constructor() {
        this._catalogs = new Gio.ListStore()
        const dataDir = GLib.get_user_data_dir()
        const path =  GLib.build_filenamev([dataDir, pkg.name, 'catalogs/catalogs.json'])
        this._storage = new Storage(path, 2)
        const catalogs = this._storage.get('catalogs')
        if (Array.isArray(catalogs))
            catalogs.forEach(catalog => this.add(new Catalog(catalog), true))
        else
            defaultCatalogs.forEach(catalog => this.add(new Catalog(catalog), true))
    }
    _onChanged() {
        const catalogs = []
        const store = this._catalogs
        const n = store.get_n_items()
        for (let i = 0; i < n; i++) {
            catalogs.push(store.get_item(i).toJSON())
        }
        this._storage.set('catalogs', catalogs)
    }
    add(catalog, init) {
        this._catalogs.append(catalog)
        const f = this._onChanged.bind(this)
        catalog.connect('notify::title', f)
        catalog.connect('notify::uri', f)
        catalog.connect('notify::preview', f)
        if (!init) this._onChanged()
    }
    remove(catalog) {
        const store = this._catalogs
        const n = store.get_n_items()
        for (let i = 0; i < n; i++) {
            if (store.get_item(i) === catalog) {
                store.remove(i)
                break
            }
        }
        this._onChanged()
    }
    get catalogs() {
        return this._catalogs
    }
}

var catalogStore = new CatalogStore()
