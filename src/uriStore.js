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

const { GLib } = imports.gi
const { Storage } = imports.utils

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
