import GLib from 'gi://GLib'
import Gio from 'gi://Gio'
import GdkPixbuf from 'gi://GdkPixbuf'
import * as utils from './utils.js'

import { AnnotationModel, BookmarkModel } from './annotations.js'
import { getURIStore, getBookList } from './library.js'

class BookData {
    annotations = utils.connect(new AnnotationModel(), {
        'update-annotation': async (_, annotation) => {
            for (const view of this.views) await view.addAnnotation(annotation)
            await this.#saveAnnotations()
        },
    })
    bookmarks = new BookmarkModel()
    constructor(key, views) {
        this.key = key
        this.views = views
        this.storage = utils.connect(new utils.JSONStorage(pkg.datadir, this.key), {
            'externally-modified': () => {
                // TODO: the file monitor doesn't seem to work
            },
            'modified': storage => getBookList()?.update(storage.path),
        })
    }
    async initView(view, init) {
        const lastLocation = this.storage.get('lastLocation', null)
        await view.init({ lastLocation })

        if (init) {
            const bookmarks = this.storage.get('bookmarks', [])
            for (const bookmark of bookmarks) {
                try {
                    const item = await view.getTOCItemOf(bookmark)
                    this.bookmarks.add(bookmark, item?.label ?? '')
                } catch (e) {
                    console.error(e)
                }
            }
            this.bookmarks.connect('notify::n-items', () => this.#saveBookmarks())
        }

        const annotations = init
            ? this.storage.get('annotations', [])
            : this.annotations.export()
        await this.addAnnotations(annotations, false)
        return this
    }
    async addAnnotation(annotation, save = true) {
        try {
            const [view, ...views] = this.views
            const { index, label } = await view.addAnnotation(annotation)
            this.annotations.add(annotation, index, label)
            for (const view of views) view.addAnnotation(annotation)
            if (save) this.#saveAnnotations()
            return annotation
        } catch (e) {
            console.error(e)
        }
    }
    async addAnnotations(annotations, save = true) {
        await Promise.all(annotations.map(x => this.addAnnotation(x, false)))
        if (save) this.#saveAnnotations()
    }
    async deleteAnnotation(annotation) {
        try {
            const [view, ...views] = this.views
            const { index } = await view.deleteAnnotation(annotation)
            this.annotations.delete(annotation, index)
            for (const view of views) view.deleteAnnotation(annotation)
            return this.#saveAnnotations()
        } catch (e) {
            console.error(e)
        }
    }
    #saveAnnotations() {
        this.storage.set('annotations', this.annotations.export())
    }
    #saveBookmarks() {
        this.storage.set('bookmarks', this.bookmarks.export())
    }
    saveCover(cover) {
        const settings = utils.settings('library')
        if (!(settings?.get_boolean('show-covers') ?? true)) return
        const path = pkg.cachepath(`${encodeURIComponent(this.key)}.png`)
        if (Gio.File.new_for_path(path).query_exists(null)) return
        const width = settings?.get_int('cover-size') ?? 256
        const ratio = width / cover.get_width()
        const scaled = ratio >= 1 ? cover
            : cover.scale_simple(width, Math.round(cover.get_height() * ratio),
                GdkPixbuf.InterpType.BILINEAR)
        scaled.savev(path, 'png', [], [])
    }
    saveURI(file) {
        const path = file.get_path()
        const homeDir = GLib.get_home_dir()
        getURIStore().set(this.key, path.startsWith(homeDir)
            ? path.replace(homeDir, '~')
            : file.get_uri())
    }
}

class BookDataStore {
    #map = new Map()
    #views = new Map()
    #keys = new WeakMap()
    get(key, view) {
        const map = this.#map
        if (map.has(key)) {
            this.#views.get(key).add(view)
            this.#keys.set(view, key)
            return map.get(key).initView(view)
        }
        else {
            const views = new Set([view])
            const obj = new BookData(key, views)
            map.set(key, obj)
            this.#views.set(key, views)
            this.#keys.set(view, key)
            return obj.initView(view, true)
        }
    }
    delete(view) {
        const key = this.#keys.get(view)
        const views = this.#views.get(key)
        views.delete(view)
        if (!views.size) {
            this.#map.delete(key)
            this.#views.delete(key)
        }
    }
}

export const dataStore = new BookDataStore()
