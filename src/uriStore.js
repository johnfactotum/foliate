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

const { GLib, Gio } = imports.gi
const ByteArray = imports.byteArray
const { Storage, Obj, debug } = imports.utils

class UriStore {
    constructor() {
        const dataDir = GLib.get_user_data_dir()
        const path =  GLib.build_filenamev([dataDir, pkg.name, 'library/uri-store.json'])
        this._storage = new Storage(path)
        this._map = new Map(this._storage.get('uris'))
    }
    get(id) {
        return this._map.get(id)
    }
    set(id, uri) {
        this._map.set(id, uri)
        this._storage.set('uris', Array.from(this._map.entries()))
    }
    delete(id) {
        this._map.delete(id)
        this._storage.set('uris', Array.from(this._map.entries()))
    }
}

var uriStore = new UriStore()

const listDir = function* (path) {
    const dir = Gio.File.new_for_path(path)
    if (!GLib.file_test(path, GLib.FileTest.IS_DIR)) {
        debug(`"${path}" is not a directory`)
        return
    }
    const children = dir.enumerate_children('standard::name,time::modified',
        Gio.FileQueryInfoFlags.NONE, null)

    let info
    while ((info = children.next_file(null)) != null) {
        try {
            const name = info.get_name()
            if (!/\.json$/.test(name)) continue
            const child = dir.get_child(name)
            yield {
                identifier: decodeURIComponent(name.replace(/\.json$/, '')),
                file: child,
                modified: new Date(info.get_attribute_uint64('time::modified') * 1000)
            }
        } catch (e) {
            continue
        }
    }
}

class BookList {
    constructor() {
        this.list = new Gio.ListStore()
        this.searchList = new Gio.ListStore()
        this.list.append(new Obj('load-more'))
        this.map = new Map()
        this._query = ''
        this._shouldUpdateList = false
        this._arr = null
    }
    _load() {
        debug('Loading book library')
        const datadir = GLib.build_filenamev([GLib.get_user_data_dir(), pkg.name])
        const books = listDir(datadir) || []
        this._arr = Array.from(books).sort((a, b) => b.modified - a.modified)
        return this._arr
    }
    search(query, force) {
        debug(`Searching for "${query}"`)
        const list = this.searchList
        if (!query) {
            debug(`Query is empty; clearing the list`)
            list.remove_all()
            return list
        }
        const q = query.toLowerCase()
        if (!force && q === this._query) {
            debug(`Query hasn't changed; return the list`)
            return list
        }

        this._query = q
        const books = this._arr || this._load()

        list.remove_all()
        for (const item of books) {
            const { identifier } = item
            const data = this.map.get(identifier) || this._loadItem(item)
            if (!data) continue
            const title = (data.metadata.title || '').toLowerCase()
            const creator = (data.metadata.creator || '').toLowerCase()
            const match = title.includes(q) || creator.includes(q)
            if (match) list.append(new Obj(data))
        }
        return list
    }
    _loadItem(item) {
        const { identifier, file, modified } = item
        const [/*success*/, data, /*tag*/] = file.load_contents(null)
        const json = JSON.parse(data instanceof Uint8Array
            ? ByteArray.toString(data) : data.toString())
        if (!json.metadata) return
        const result = {
            identifier,
            metadata: json.metadata,
            progress: json.progress,
            modified
        }
        this.map.set(identifier, result)
        return result
    }
    next(n = 10) {
        this._shouldUpdateList = true
        if (!this._iter) this._iter = this._load().values()
        let i = 0
        while (i < n) {
            const { value, done } = this._iter.next()
            if (done) {
                const length = this.list.get_n_items()
                if (!length) return
                if (this.list.get_item(length - 1).value === 'load-more')
                    this.list.remove(length - 1)
                return
            }
            const { identifier } = value
            const data = this.map.get(identifier) || this._loadItem(value)
            if (!data) continue
            this.list.insert(this.list.get_n_items() - 1, new Obj(data))
            i++
        }
    }
    _remove(id) {
        if (this._arr) {
            const i = this._arr.findIndex(({ identifier }) => identifier === id)
            if (i !== -1) this._arr.splice(i, 1)
        }
        const n = this.list.get_n_items()
        for (let i = 0; i < n; i++) {
            const item = this.list.get_item(i).value
            if (item.identifier === id) {
                this.list.remove(i)
                this.search(this._query, true)
                return true
            }
        }
    }
    remove(id) {
        this.map.delete(id)
        if (this._remove(id)) this.next(1)
    }
    update(id, obj) {
        this.map.set(id, obj)
        if (this._shouldUpdateList) {
            this._remove(id)
            this.list.insert(0, new Obj(obj))
        }
        if (this._arr) this._arr.unshift({ identifier: id })
        this.search(this._query, true)
    }
}

var bookList = new BookList()

