import '../foliate-js/view.js'
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

const getHTML = async range => {
    const fragment = range.cloneContents()
    await embedImages(fragment)
    return new XMLSerializer().serializeToString(fragment)
}

const isZip = async file => {
    const arr = new Uint8Array(await file.slice(0, 4).arrayBuffer())
    return arr[0] === 0x50 && arr[1] === 0x4b && arr[2] === 0x03 && arr[3] === 0x04
}

const makeZipLoader = async file => {
    const { configure, ZipReader, BlobReader, TextWriter, BlobWriter } =
        await import('../foliate-js/vendor/zip.js')
    configure({ useWebWorkers: false })
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
        if (await isMOBI(file)) {
            const fflate = await import('../foliate-js/vendor/fflate.js')
            book = await new MOBI({ unzlib: fflate.unzlibSync }).open(file)
        } else if (isFB2(file)) {
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
    await reader.init()
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

const frameRect = (frame, rect, sx = 1, sy = 1) => {
    const left = sx * rect.left + frame.left
    const right = sx * rect.right + frame.left
    const top = sy * rect.top + frame.top
    const bottom = sy * rect.bottom + frame.top
    return { left, right, top, bottom }
}

const pointIsInView = ({ x, y }) =>
    x > 0 && y > 0 && x < window.innerWidth && y < window.innerHeight

const getPosition = target => {
    // TODO: vertical text
    const frameElement = (target.getRootNode?.() ?? target?.endContainer?.getRootNode?.())
        ?.defaultView?.frameElement

    const transform = frameElement ? getComputedStyle(frameElement).transform : ''
    const match = transform.match(/matrix\((.+)\)/)
    const [sx, , , sy] = match?.[1]?.split(/\s*,\s*/)?.map(x => parseFloat(x)) ?? []

    const frame = frameElement?.getBoundingClientRect() ?? { top: 0, left: 0 }
    const rects = Array.from(target.getClientRects())
    const first = frameRect(frame, rects[0], sx, sy)
    const last = frameRect(frame, rects.at(-1), sx, sy)
    const start = {
        point: { x: (first.left + first.right) / 2, y: first.top },
        dir: 'up',
    }
    const end = {
        point: { x: (last.left + last.right) / 2, y: last.bottom },
        dir: 'down',
    }
    const startInView = pointIsInView(start.point)
    const endInView = pointIsInView(end.point)
    if (!startInView && !endInView) return { point: { x: 0, y: 0 } }
    if (!startInView) return end
    if (!endInView) return start
    return start.point.y > window.innerHeight - end.point.y ? start : end
}

const hasEPUBSSV = (el, v) =>
    el.getAttributeNS('http://www.idpf.org/2007/ops', 'type')
        ?.split(' ')?.some(t => v.includes(t))

const hasRole = (el, v) =>
    el.getAttribute('role')?.split(' ')?.some(t => v.includes(t))

class Reader {
    #tocView
    style = {
        spacing: 1.4,
        justify: true,
        hyphenate: true,
        invert: false,
    }
    constructor(book) {
        this.book = book
        if (book.metadata?.description)
            book.metadata.description = toPangoMarkup(book.metadata.description)
        this.pageTotal = book.pageList
            ?.findLast(x => !isNaN(parseInt(x.label)))?.label
    }
    async init() {
        this.view = document.createElement('foliate-view')
        this.#handleEvents()
        await this.view.open(this.book)
        document.body.append(this.view)
    }
    setAppearance({ style, layout }) {
        Object.assign(this.style, style)
        const renderer = this.view?.renderer
        if (renderer) {
            renderer.setStyles(getCSS(this.style))
            renderer.setAttribute('flow', layout.flow)
            renderer.setAttribute('gap', layout.gap * 100 + '%')
            renderer.setAttribute('max-inline-size', layout.maxColumnWidth + 'px')
            renderer.setAttribute('max-column-count', layout.maxColumns)
        }
        document.body.classList.toggle('invert', this.style.invert)
    }
    #handleEvents() {
        this.view.addEventListener('relocate', e => {
            const { heads, feet } = this.view.renderer
            if (heads) {
                const { tocItem } = e.detail
                heads.at(-1).innerText = tocItem?.label ?? ''
                if (heads.length > 1)
                    heads[0].innerText = this.book.metadata.title
            }
            if (feet) {
                const { pageItem, location: { current, next, total } } = e.detail
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
            emit({ type: 'relocate', ...e.detail })
        })
        this.view.addEventListener('create-overlay', e =>
            emit({ type: 'create-overlay', ...e.detail }))
        this.view.addEventListener('show-annotation', e => {
            const { value, range } = e.detail
            const pos = getPosition(range)
            this.#showAnnotation({ range, value, pos })
        })
        this.view.addEventListener('draw-annotation', e => {
            const { draw, annotation, doc, range } = e.detail
            const { color } = annotation
            if (['underline', 'squiggly', 'strikethrough'].includes(color)) {
                const { defaultView } = doc
                const node = range.startContainer
                const el = node.nodeType === 1 ? node : node.parentElement
                const { writingMode } = defaultView.getComputedStyle(el)
                draw(Overlayer[color], { writingMode })
            }
            else draw(Overlayer.highlight, { color })
        })
        this.view.addEventListener('external-link', e => {
            e.preventDefault()
            emit({ type: 'external-link', ...e.detail })
        })
        this.view.addEventListener('link', e => this.#onLink(e))
        this.view.addEventListener('load', e => this.#onLoad(e))
        this.view.history.addEventListener('index-change', e => {
            const { canGoBack, canGoForward } = e.target
            emit({ type: 'history-index-change', canGoBack, canGoForward })
        })
    }
    #onLoad(e) {
        const { doc, index } = e.detail
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
            const range = sel.getRangeAt(0)
            if (range.collapsed) return
            const pos = getPosition(range)
            const value = this.view.getCFI(index, range)
            this.#showSelection({ range, value, pos })
        })
    }
    #showAnnotation({ range, value, pos }) {
        globalThis.showSelection({ type: 'annotation', value, pos })
            .then(action => {
                if (action === 'select')
                    this.#showSelection({ range, value, pos })
            })
    }
    #showSelection({ range, value, pos }) {
        const text = range.toString()
        globalThis.showSelection({ type: 'selection', text, value, pos })
            .then(action => {
                if (action === 'copy') getHTML(range).then(html =>
                    emit({ type: 'selection', action, text, html }))
                else if (action === 'highlight')
                    this.#showAnnotation({ range, value, pos })
            })
    }
    #onLink(e) {
        const { a, href } = e.detail
        const { index, anchor } = this.view.book.resolveHref(href)
        if (hasEPUBSSV(a, ['annoref', 'biblioref', 'glossref', 'noteref'])
        || hasRole(a, ['doc-biblioref', 'doc-glossref', 'doc-noteref'])) {
            e.preventDefault()
            Promise
                .resolve(this.view.book.sections[index].createDocument())
                .then(doc => {
                    const el = anchor(doc)
                    if (el) {
                        const pos = getPosition(a)
                        const html = toPangoMarkup(el.innerHTML)
                        emit({ type: 'reference', href, html, pos })
                        return true
                    }
                })
                .catch(e => console.error(e))
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

    // wrap these renderer methods
    // because `FoliateWebView.exec()` can only pass one argument
    scrollBy([x, y]) {
        return this.view.renderer.scrollBy?.(x, y)
    }
    snap([x, y]) {
        return this.view.renderer.snap?.(x, y)
    }
}

globalThis.init = () => document.getElementById('file-input').click()

document.getElementById('file-input').onchange = e => open(e.target.files[0])
    .catch(({ message, stack }) => emit({ type: 'book-error', message, stack }))

emit({ type: 'ready' })
