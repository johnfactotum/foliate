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
const { readJSON, Storage, Obj, debug } = imports.utils

const settings = new Gio.Settings({ schema_id: pkg.name })
const storeUris = settings.get_boolean('store-uris')

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
        debug('saving file uri')
        this._map.set(id, uri)
        this._storage.set('uris', Array.from(this._map.entries()))
    }
    delete(id) {
        debug('deleting file uri')
        this._map.delete(id)
        this._storage.set('uris', Array.from(this._map.entries()))
    }
}

var uriStore = storeUris ? new UriStore() : null

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
        this.map = new Map()
    }
    clear() {
        this.list.remove_all()
        this._arr = null
        this._iter = null
    }
    load(loadFunc) {
        this.list.append(new Obj('load-more'))
        this._load = () => {
            debug('book list: loading items')
            this._arr = loadFunc()
            return this._arr
        }
    }
    getArray() {
        return this._arr || this._load()
    }
    _loadItem(item) {
        const { identifier, file, modified } = item
        const json = readJSON(file)
        if (!json.metadata) return
        const result = {
            identifier,
            metadata: json.metadata,
            hasAnnotations: json.annotations && json.annotations.length > 0,
            progress: json.progress,
            modified
        }
        this.map.set(identifier, result)
        return result
    }
    getItem(item) {
        try {
            const { identifier } = item
            return this.map.get(identifier) || this._loadItem(item)
        } catch (e) {
            return null
        }
    }
    next(n = 19) {
        debug('book list: loading more items')
        if (!this._iter) this._iter = this._load().entries()
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
            const item = value[1]
            if (!item) continue
            const data = this.getItem(item)
            if (!data) continue
            this.list.insert(this.list.get_n_items() - 1, new Obj(data))
            i++
        }
    }
    _remove(id) {
        if (this._arr) {
            const i = this._arr.findIndex(x => x && x.identifier === id)
            // set the item to null instead of removig it
            // so that we don't mess up the iterator
            if (i !== -1) this._arr[i] = null
        }
        const n = this.list.get_n_items()
        for (let i = 0; i < n; i++) {
            const item = this.list.get_item(i).value
            if (item.identifier === id) {
                this.list.remove(i)
                return true
            }
        }
    }
    remove(id) {
        debug('book list: removing ' + id)
        this.map.delete(id)
        if (this._remove(id)) this.next(1)
    }
    update(id, obj) {
        debug('book list: updating ' + id)
        this.map.set(id, obj)
        if (this._iter) {
            this._remove(id)
            this.list.insert(0, new Obj(obj))
            this._iter.next(1)
        }
        if (this._arr) this._arr.unshift({ identifier: id })
    }
}

class Library {
    constructor() {
        this._list = new BookList()
        this._list.load(() => {
            debug('Loading book library')
            const datadir = GLib.build_filenamev([GLib.get_user_data_dir(), pkg.name])
            const books = listDir(datadir) || []
            return Array.from(books).sort((a, b) => b.modified - a.modified)
        })
        this.list = this._list.list

        this._searchList = new BookList()
        this.searchList = this._searchList.list
        this.searchList.append(new Obj('load-more'))

        this._query = ''
        this._fields = ''
    }
    search(query, fields) {
        if (!query) return this._searchList.clear()
        const q = query.toLowerCase()
        const f = fields.toString()
        if (q === this._query && f === this._fields) return

        debug(`Searching for "${query}"`)
        this._query = q
        this._fields = f
        const books = this._list.getArray()

        const results = []
        const matchString = (x, q) => typeof x === 'string'
            ? x.toLowerCase().includes(q) : false
        for (const item of books) {
            if (!item) continue
            const data = this._searchList.getItem(item)
            if (!data) continue

            const match = fields.some(field => {
                if (field === 'subjects') {
                    const subjects = data.metadata.subjects
                    if (subjects) return subjects.some(subject =>
                        matchString(subject, q)
                        || matchString(subject.label, q)
                        || matchString(subject.term, q))
                } else return matchString(data.metadata[field], q)
            })

            if (match) results.push(item)
        }
        this._searchList.clear()
        this._searchList.load(() => results)
        this._searchList.next()
    }
    next(n) {
        this._list.next(n)
    }
    searchNext(n) {
        this._searchList.next(n)
    }
    remove(id) {
        this._list.remove(id)
        this._searchList.remove(id)
    }
    update(id, obj) {
        this._list.update(id, obj)
        this._searchList.update(id, obj)
    }
}

var library = new Library()

