/* global zip: false, fflate: false */
import { View, getPosition } from '../foliate-js/view.js'
import { Overlayer } from '../foliate-js/overlayer.js'
import { toPangoMarkup } from './markup.js'

// TODO: make this translatable
const format = {
    loc: (a, b) => `Loc ${a} of ${b}`,
    page: (a, b) => b ? `Page ${a} of ${b}` : `Page ${a}`,
}

const emit = x => globalThis.webkit.messageHandlers.viewer
    .postMessage(JSON.stringify(x))

const blobToBase64 = blob => new Promise(resolve => {
    const reader = new FileReader()
    reader.readAsDataURL(blob)
    reader.onloadend = () => resolve(reader.result.split(',')[1])
})

const embedImages = async doc => {
    for (const el of doc.querySelectorAll('img[src]')) {
        const res = await fetch(el.src)
        const blob = await res.blob()
        el.src = `data:${blob.type};base64,${await blobToBase64(blob)}`
    }
}

const { ZipReader, BlobReader, TextWriter, BlobWriter } = zip
zip.configure({ useWebWorkers: false })

const isZip = async file => {
    const arr = new Uint8Array(await file.slice(0, 4).arrayBuffer())
    return arr[0] === 0x50 && arr[1] === 0x4b && arr[2] === 0x03 && arr[3] === 0x04
}

const makeZipLoader = async file => {
    const reader = new ZipReader(new BlobReader(file))
    const entries = await reader.getEntries()
    const map = new Map(entries.map(entry => [entry.filename, entry]))
    const load = f => (name, ...args) =>
        map.has(name) ? f(map.get(name), ...args) : null
    const loadText = load(entry => entry.getData(new TextWriter()))
    const loadBlob = load((entry, type) => entry.getData(new BlobWriter(type)))
    const getSize = name => map.get(name)?.uncompressedSize ?? 0
    return { entries, loadText, loadBlob, getSize }
}

const isCBZ = ({ name, type }) =>
    type === 'application/vnd.comicbook+zip' || name.endsWith('.cbz')

const isFB2 = ({ name, type }) =>
    type === 'application/x-fictionbook+xml' || name.endsWith('.fb2')

const isFBZ = ({ name, type }) =>
    type === 'application/x-zip-compressed-fb2'
    || name.endsWith('.fb2.zip') || name.endsWith('.fbz')

const open = async file => {
    if (!file.size) {
        emit({ type: 'book-error', id: 'not-found' })
        return
    }

    let book
    if (await isZip(file)) {
        const loader = await makeZipLoader(file)
        const { entries } = loader
        if (isCBZ(file)) {
            const { makeComicBook } = await import('../foliate-js/comic-book.js')
            book = makeComicBook(loader, file)
        } else if (isFBZ(file)) {
            const { makeFB2 } = await import('../foliate-js/fb2.js')
            const entry = entries.find(entry => entry.filename.endsWith('.fb2'))
            const blob = await loader.loadBlob((entry ?? entries[0]).filename)
            book = await makeFB2(blob)
        } else {
            const { EPUB } = await import('../foliate-js/epub.js')
            book = await new EPUB(loader).init()
        }
    } else {
        const { isMOBI, MOBI } = await import('../foliate-js/mobi.js')
        if (await isMOBI(file))
            book = await new MOBI({ unzlib: fflate.unzlibSync }).open(file)
        else if (isFB2(file)) {
            const { makeFB2 } = await import('../foliate-js/fb2.js')
            book = await makeFB2(file)
        }
    }

    if (!book) {
        emit({ type: 'book-error', id: 'unsupported-type' })
        return
    }

    const reader = new Reader(book)
    globalThis.reader = reader
    await reader.display()
    emit({ type: 'book-ready', book, reader })
}

const getCSS = ({ spacing, justify, hyphenate, invert }) => `
    @namespace epub "http://www.idpf.org/2007/ops";
    html {
        color-scheme: ${invert ? 'only light' : 'light dark'};
    }
    ${invert ? '' : `
    /* https://github.com/whatwg/html/issues/5426 */
    @media (prefers-color-scheme: dark) {
        a:link {
            color: lightblue;
        }
    }`}
    p, li, blockquote, dd {
        line-height: ${spacing};
        text-align: ${justify ? 'justify' : 'start'};
        -webkit-hyphens: ${hyphenate ? 'auto' : 'manual'};
        -webkit-hyphenate-limit-before: 3;
        -webkit-hyphenate-limit-after: 2;
        -webkit-hyphenate-limit-lines: 2;
        hanging-punctuation: allow-end last;
        widows: 2;
    }
    /* prevent the above from overriding the align attribute */
    [align="left"] { text-align: left; }
    [align="right"] { text-align: right; }
    [align="center"] { text-align: center; }
    [align="justify"] { text-align: justify; }

    pre {
        white-space: pre-wrap !important;
    }
    aside[epub|type~="endnote"],
    aside[epub|type~="footnote"],
    aside[epub|type~="note"],
    aside[epub|type~="rearnote"] {
        display: none;
    }
`

class Reader {
    #tocView
    style = {
        spacing: 1.4,
        justify: true,
        hyphenate: true,
        invert: false,
    }
    layout = {
        margin: 48,
        gap: 48,
        maxColumnWidth: 720,
        maxColumns: 2,
    }
    constructor(book) {
        this.book = book
        if (book.metadata?.description)
            book.metadata.description = toPangoMarkup(book.metadata.description)
        this.pageTotal = book.pageList
            ?.findLast(x => !isNaN(parseInt(x.label)))?.label
    }
    async display() {
        this.view = new View(this.book, this.#handleEvent.bind(this))
        document.body.append(await this.view.display())
    }
    setAppearance({ style, layout }) {
        Object.assign(this.style, style)
        Object.assign(this.layout, layout)
        this.view?.setAppearance({ css: getCSS(this.style), layout: this.layout })
        document.body.classList.toggle('invert', this.style.invert)
    }
    #handleEvent(obj) {
        switch (obj.type) {
            case 'relocated': {
                const { heads, feet } = this.view.renderer
                if (heads) {
                    const { tocItem } = obj
                    heads.at(-1).innerText = tocItem?.label ?? ''
                    if (heads.length > 1)
                        heads[0].innerText = this.book.metadata.title
                }
                if (feet) {
                    const { pageItem, location: { current, next, total } } = obj
                    if (pageItem) {
                        // only show page number at the end
                        // because we only have visible range for the spread,
                        // not each column
                        feet.at(-1).innerText = format.page(pageItem.label, this.pageTotal)
                        if (feet.length > 1)
                            feet[0].innerText = format.loc(current + 1, total)
                    }
                    else {
                        feet[0].innerText = format.loc(current + 1, total)
                        if (feet.length > 1) {
                            const r = 1 - 1 / feet.length
                            const end = Math.floor((1 - r) * current + r * next)
                            feet.at(-1).innerText = format.loc(end + 1, total)
                        }
                    }
                }
                emit(obj)
                break
            }
            case 'create-overlay': emit(obj); break
            case 'show-annotation':
                obj.pos = getPosition(obj.range)
                emit(obj)
                break
            case 'draw-annotation': {
                const { annotation, doc, range } = obj
                const { color } = annotation
                if (['underline', 'squiggly', 'strikethrough'].includes(color)) {
                    const { defaultView } = doc
                    const node = range.startContainer
                    const el = node.nodeType === 1 ? node : node.parentElement
                    const { writingMode } = defaultView.getComputedStyle(el)
                    return [Overlayer[color], { writingMode }]
                }
                else return [Overlayer.highlight, { color }]
            }
            case 'reference': this.#onReference(obj); break
            case 'loaded': this.#onLoaded(obj); break
        }
    }
    #onLoaded({ doc, index }) {
        for (const img of doc.querySelectorAll('img'))
            img.addEventListener('dblclick', () => fetch(img.src)
                .then(res => res.blob())
                .then(blob => Promise.all([blobToBase64(blob), blob.type]))
                .then(([base64, mimetype]) =>
                    emit({ type: 'show-image', base64, mimetype }))
                .catch(e => console.error(e)))

        doc.addEventListener('click', () => {
            const sel = doc.defaultView.getSelection()
            if (!sel.rangeCount) return
            let range = sel.getRangeAt(0)
            if (range.collapsed) return
            const text = sel.toString()
            if (!text) return
            const cfi = this.view.getCFI(index, range)
            const pos = getPosition(range)
            const fragment = range.cloneContents()
            embedImages(fragment).then(() => {
                const html = new XMLSerializer().serializeToString(fragment)
                emit({ type: 'selection', cfi, text, html, pos })
            })
        })
    }
    #onReference({ content, href, element }) {
        if (content) {
            const pos = getPosition(element)
            const html = toPangoMarkup(content)
            emit({ type: 'reference', href, html, pos })
        }
    }
    async getCover() {
        try {
            const blob = await this.book.getCover?.()
            return blob ? blobToBase64(blob) : null
        } catch (e) {
            console.warn(e)
            console.warn('Failed to load cover')
            return null
        }
    }
}

globalThis.init = () => document.getElementById('file-input').click()

document.getElementById('file-input').onchange = e => open(e.target.files[0])
    .catch(({ message, stack }) => emit({ type: 'book-error', message, stack }))

emit({ type: 'ready' })
