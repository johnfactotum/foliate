import Gtk from 'gi://Gtk'
import GLib from 'gi://GLib'
import Gio from 'gi://Gio'
import GdkPixbuf from 'gi://GdkPixbuf'
import { gettext as _ } from 'gettext'
import * as utils from './utils.js'

import { AnnotationModel, BookmarkModel } from './annotations.js'
import { getURIStore, getBookList } from './library.js'

export const coverPath = key => pkg.cachepath(`${encodeURIComponent(key)}.png`)

export const readBookCover = key => {
    try { return GdkPixbuf.Pixbuf.new_from_file(coverPath(key)) }
    catch { return null }
}

export const writeBookCover = (key, cover, { force = false } = {}) => {
    const settings = utils.settings('library')
    if (!force && !(settings?.get_boolean('show-covers') ?? true)) return
    const width = settings?.get_int('cover-size') ?? 256
    const ratio = width / cover.get_width()
    const scaled = ratio >= 1 ? cover
        : cover.scale_simple(width, Math.round(cover.get_height() * ratio),
            GdkPixbuf.InterpType.BILINEAR)
    scaled.savev(coverPath(key), 'png', [], [])
}

export const deleteBookCover = key => {
    try { Gio.File.new_for_path(coverPath(key)).delete(null) } catch {}
    getBookList()?.readCover.delete(key)
}

export const pickCoverImage = window => new Promise((resolve, reject) => {
    const dialog = new Gtk.FileDialog()
    const images = new Gtk.FileFilter({
        name: _('Image Files'),
        mime_types: [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
            'image/bmp',
        ],
    })
    dialog.filters = new Gio.ListStore()
    dialog.filters.append(new Gtk.FileFilter({
        name: _('All Files'),
        patterns: ['*'],
    }))
    dialog.filters.append(images)
    dialog.default_filter = images
    dialog.open(window, null, (_, res) => {
        try { resolve(dialog.open_finish(res)) }
        catch (e) {
            if (e instanceof Gtk.DialogError) resolve(null)
            else reject(e)
        }
    })
})

export class BookData {
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
    readCover() {
        return readBookCover(this.key)
    }
    hasCustomCover() {
        return this.storage.get('customCover', false)
    }
    saveCover(cover, { force = false, custom = false } = {}) {
        if (!force && Gio.File.new_for_path(coverPath(this.key)).query_exists(null))
            return
        writeBookCover(this.key, cover, { force })
        if (custom) this.storage.set('customCover', true)
    }
    async setCoverFromFile(file) {
        const pixbuf = GdkPixbuf.Pixbuf.new_from_file(file.get_path())
        this.saveCover(pixbuf, { force: true, custom: true })
        return pixbuf
    }
    async resetCover(getDefaultCover) {
        deleteBookCover(this.key)
        this.storage.set('customCover', false)
        if (getDefaultCover) {
            const cover = await getDefaultCover()
            if (cover) this.saveCover(cover)
            return cover
        }
        return null
    }
    saveURI(file) {
        const path = file.get_path()
        const homeDir = GLib.get_home_dir()
        getURIStore().set(this.key, path.startsWith(homeDir)
            ? path.replace(homeDir, '~')
            : file.get_uri())
    }
    isFinished() {
        const finished = this.storage.get('finished', null)
        if (finished !== null) return finished
        const completedChapters = this.storage.get('completedChapters', null)
        if (!completedChapters || Object.keys(completedChapters).length === 0) return false
        const progress = this.storage.get('progress', [0, 0])
        const fraction = progress[1] > 0 ? progress[0] / progress[1] : 0
        return fraction >= 0.95
    }
    setFinished(finished) {
        this.storage.set('finished', finished)
        if (finished) this.storage.set('finishedDate', new Date().toISOString())
        else this.storage.set('finishedDate', null)
    }
    getCompletedChapters() {
        return this.storage.get('completedChapters', {})
    }
    setCompletedChapters(completedChapters) {
        this.storage.set('completedChapters', completedChapters)
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
