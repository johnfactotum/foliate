import '../foliate-js/view.js'
import { Overlayer } from '../foliate-js/overlayer.js'
import { FootnoteHandler } from '../foliate-js/footnotes.js'
import { toPangoMarkup } from './markup.js'

const format = {}

const emit = x => globalThis.webkit.messageHandlers.viewer
    .postMessage(JSON.stringify(x))

const debounce = (f, wait, immediate) => {
    let timeout
    return (...args) => {
        const later = () => {
            timeout = null
            if (!immediate) f(...args)
        }
        const callNow = immediate && !timeout
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(later, wait)
        if (callNow) f(...args)
    }
}

const getSelectionRange = doc => {
    const sel = doc.getSelection()
    if (!sel.rangeCount) return
    const range = sel.getRangeAt(0)
    if (range.collapsed) return
    return range
}

const getLang = el => {
    const lang = el.lang || el?.getAttributeNS?.('http://www.w3.org/XML/1998/namespace', 'lang')
    if (lang) return lang
    if (el.parentElement) return getLang(el.parentElement)
}

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

const isPDF = async file => {
    const arr = new Uint8Array(await file.slice(0, 5).arrayBuffer())
    return arr[0] === 0x25
        && arr[1] === 0x50 && arr[2] === 0x44 && arr[3] === 0x46
        && arr[4] === 0x2d
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
    }
    else if (await isPDF(file)) {
        const { makePDF } = await import('../foliate-js/pdf.js')
        book = await makePDF(file)
    }
    else {
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

const getCSS = ({
    lineHeight, justify, hyphenate, invert, theme, userStylesheet,
    mediaActiveClass,
}) => [`
    @namespace epub "http://www.idpf.org/2007/ops";
    @media print {
        html {
            column-width: auto !important;
            height: auto !important;
            width: auto !important;
        }
    }
    @media screen {
        html {
            color-scheme: ${invert ? 'only light' : 'light dark'};
            color: ${theme.light.fg};
        }
        a:any-link {
            color: ${theme.light.link};
        }
        @media (prefers-color-scheme: dark) {
            html {
                color: ${invert ? theme.inverted.fg : theme.dark.fg};
            }
            a:any-link {
                color: ${invert ? theme.inverted.link : theme.dark.link};
            }
        }
        aside[epub|type~="footnote"] {
            display: none;
        }
    }
    html {
        line-height: ${lineHeight};
        hanging-punctuation: allow-end last;
        orphans: 2;
        widows: 2;
    }
    [align="left"] { text-align: left; }
    [align="right"] { text-align: right; }
    [align="center"] { text-align: center; }
    [align="justify"] { text-align: justify; }
    hgroup p {
        text-align: unset;
        hyphens: unset;
    }
    pre {
        white-space: pre-wrap !important;
        tab-size: 2;
    }
`, `
    @media screen and (prefers-color-scheme: light) {
        ${theme.light.bg !== '#ffffff' ? `
        html, body {
            color: ${theme.light.fg} !important;
            background: none !important;
        }
        body * {
            color: inherit !important;
            border-color: currentColor !important;
            background-color: ${theme.light.bg} !important;
        }
        a:any-link {
            color: ${theme.light.link} !important;
        }
        svg, img {
            background-color: transparent !important;
            mix-blend-mode: multiply;
        }
        .${CSS.escape(mediaActiveClass)}, .${CSS.escape(mediaActiveClass)} * {
            color: ${theme.light.fg} !important;
            background: color-mix(in lch, ${theme.light.fg}, ${theme.light.bg} 85%) !important;
        }` : ''}
    }
    @media screen and (prefers-color-scheme: dark) {
        ${invert ? '' : `
        html, body {
            color: ${theme.dark.fg} !important;
            background: none !important;
        }
        body * {
            color: inherit !important;
            border-color: currentColor !important;
            background-color: ${theme.dark.bg} !important;
        }
        a:any-link {
            color: ${theme.dark.link} !important;
        }
        .${CSS.escape(mediaActiveClass)}, .${CSS.escape(mediaActiveClass)} * {
            color: ${theme.dark.fg} !important;
            background: color-mix(in lch, ${theme.dark.fg}, ${theme.dark.bg} 75%) !important;
        }`}
    }
    p, li, blockquote, dd {
        line-height: ${lineHeight};
        text-align: ${justify ? 'justify' : 'start'};
        hyphens: ${hyphenate ? 'auto' : 'none'};
    }
` + userStylesheet]

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

const footnoteDialog = document.getElementById('footnote-dialog')
footnoteDialog.addEventListener('close', () => {
    emit({ type: 'dialog-close' })
    const view = footnoteDialog.querySelector('foliate-view')
    view.close()
    view.remove()
    if (footnoteDialog.returnValue === 'go')
        globalThis.reader.view.goTo(footnoteDialog.querySelector('[name="href"]').value)
    footnoteDialog.returnValue = null
})
footnoteDialog.addEventListener('click', e =>
    e.target === footnoteDialog ? footnoteDialog.close() : null)

class CursorAutohider {
    #timeout
    #el
    #check
    #state
    constructor(el, check, state = {}) {
        this.#el = el
        this.#check = check
        this.#state = state
        if (this.#state.hidden) this.hide()
        this.#el.addEventListener('mousemove', ({ screenX, screenY }) => {
            // check if it actually moved
            if (screenX === this.#state.x && screenY === this.#state.y) return
            this.#state.x = screenX, this.#state.y = screenY
            this.show()
            if (this.#timeout) clearTimeout(this.#timeout)
            if (check()) this.#timeout = setTimeout(this.hide.bind(this), 1000)
        }, false)
    }
    cloneFor(el) {
        return new CursorAutohider(el, this.#check, this.#state)
    }
    hide() {
        this.#el.style.cursor = 'none'
        this.#state.hidden = true
    }
    show() {
        this.#el.style.cursor = 'auto'
        this.#state.hidden = false
    }
}

class Reader {
    autohideCursor
    #cursorAutohider = new CursorAutohider(
        document.documentElement, () => this.autohideCursor)
    #footnoteHandler = new FootnoteHandler()
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
        this.style.mediaActiveClass = book.media?.activeClass

        this.#footnoteHandler.addEventListener('before-render', e => {
            const { view } = e.detail
            view.addEventListener('link', e => {
                e.preventDefault()
                const { href } = e.detail
                this.view.goTo(href)
                footnoteDialog.close()
            })
            view.addEventListener('external-link', e => {
                e.preventDefault()
                emit({ type: 'external-link', ...e.detail })
            })
            footnoteDialog.querySelector('main').replaceChildren(view)

            const { renderer } = view
            renderer.setAttribute('flow', 'scrolled')
            renderer.setAttribute('margin', '12px')
            renderer.setAttribute('gap', '5%')
            renderer.setStyles(getCSS(this.style))
        })
        this.#footnoteHandler.addEventListener('render', e => {
            const { href, hidden, type } = e.detail

            footnoteDialog.querySelector('[name="href"]').value = href
            footnoteDialog.querySelector('[value="go"]').style.display =
                hidden ? 'none' : 'block'

            const { uiText } = globalThis
            footnoteDialog.querySelector('header').innerText =
                uiText.references[type] ?? uiText.references.footnote
            footnoteDialog.querySelector('[value="go"]').innerText =
                uiText.references[type + '-go'] ?? uiText.references['footnote-go']

            footnoteDialog.showModal()
            emit({ type: 'dialog-open' })
        })
    }
    async init() {
        this.view = document.createElement('foliate-view')
        this.#handleEvents()
        await this.view.open(this.book)
        document.body.append(this.view)
        this.sectionFractions = this.view.getSectionFractions()
    }
    setAppearance({ style, layout, autohideCursor }) {
        Object.assign(this.style, style)
        const { theme } = style
        const $style = document.documentElement.style
        $style.setProperty('--light-bg', theme.light.bg)
        $style.setProperty('--light-fg', theme.light.fg)
        $style.setProperty('--dark-bg', theme.dark.bg)
        $style.setProperty('--dark-fg', theme.dark.fg)
        const renderer = this.view?.renderer
        if (renderer) {
            renderer.setAttribute('flow', layout.flow)
            renderer.setAttribute('gap', layout.gap * 100 + '%')
            renderer.setAttribute('max-inline-size', layout.maxInlineSize + 'px')
            renderer.setAttribute('max-block-size', layout.maxBlockSize + 'px')
            renderer.setAttribute('max-column-count', layout.maxColumnCount)
            renderer.setStyles?.(getCSS(this.style))
        }
        document.body.classList.toggle('invert', this.style.invert)
        this.autohideCursor = autohideCursor
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
            const { value, index, range } = e.detail
            const pos = getPosition(range)
            this.#showAnnotation({ index, range, value, pos })
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
        this.view.addEventListener('link', e =>
            this.#footnoteHandler.handle(this.book, e))
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

        let isSelecting = false
        doc.addEventListener('pointerdown', () => isSelecting = true)
        doc.addEventListener('pointerup', () => {
            isSelecting = false
            const range = getSelectionRange(doc)
            if (!range) return
            const pos = getPosition(range)
            const value = this.view.getCFI(index, range)
            const lang = getLang(range.commonAncestorContainer)
            this.#showSelection({ index, range, lang, value, pos })
        })

        if (!this.view.isFixedLayout)
            // go to the next page when selecting to the end of a page
            // this makes it possible to select across pages
            doc.addEventListener('selectionchange', debounce(() => {
                if (!isSelecting) return
                if (this.view.renderer.getAttribute('flow') !== 'paginated') return
                const { lastLocation } = this.view
                if (!lastLocation) return
                const selRange = getSelectionRange(doc)
                if (!selRange) return
                if (selRange.compareBoundaryPoints(Range.END_TO_END, lastLocation.range) >= 0)
                    this.view.next()
            }, 1000))

        this.#cursorAutohider.cloneFor(doc.documentElement)
    }
    #showAnnotation({ index, range, value, pos }) {
        globalThis.showSelection({ type: 'annotation', value, pos })
            .then(action => {
                if (action === 'select')
                    this.#showSelection({ index, range, value, pos })
            })
    }
    #showSelection({ index, range, lang, value, pos }) {
        const text = range.toString()
        globalThis.showSelection({ type: 'selection', text, lang, value, pos }).then(action => {
            switch (action) {
                case 'copy': getHTML(range).then(html =>
                    emit({ type: 'selection', action, text, html }))
                    break
                case 'copy-citation':
                    emit({ type: 'selection', action, text, value,
                        ...this.view.getProgressOf(index, range) })
                    break
                case 'highlight':
                    this.#showAnnotation({ index, range, value, pos })
                    break
                case 'print':
                    this.printRange(range.startContainer.ownerDocument, range)
                    break
                case 'speak-from-here':
                    this.view.initTTS().then(() => emit({
                        type: 'selection', action,
                        ssml: this.view.tts.from(range),
                    }))
                    break
            }
        })
    }
    printRange(doc, range) {
        const iframe = document.createElement('iframe')
        // NOTE: it needs `allow-scripts` to remove the frame after printing
        // and `allow-modals` to show the print dialog
        iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-modals')
        const css = getCSS(this.style)
        iframe.addEventListener('load', () => {
            const doc = iframe.contentDocument

            const beforeStyle = doc.createElement('style')
            beforeStyle.textContent = css[0]
            doc.head.prepend(beforeStyle)

            const afterStyle = doc.createElement('style')
            afterStyle.textContent = css[1]
            doc.head.append(afterStyle)

            if (range) {
                const frag = range.cloneContents()
                doc.body.replaceChildren()
                doc.body.appendChild(frag)
            }
            iframe.contentWindow.addEventListener('afterprint', () =>
                iframe.remove())
            iframe.contentWindow.print()
        }, { once: true })

        iframe.src = doc.defaultView.frameElement.src
        iframe.style.display = 'none'
        document.body.append(iframe)
    }
    print() {
        this.printRange(this.view.renderer.getContents()[0]?.doc)
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

globalThis.visualViewport.addEventListener('resize', () =>
    emit({ type: 'pinch-zoom', scale: globalThis.visualViewport.scale }))

const printf = (str, args) => {
    for (const arg of args) str = str.replace('%s', arg)
    return str
}

globalThis.init = ({ uiText }) => {
    globalThis.uiText = uiText

    format.loc = (a, b) => printf(uiText.loc, [a, b])
    format.page = (a, b) => b
        ? printf(uiText.page, [a, b])
        : printf(uiText.pageWithoutTotal, [a])

    footnoteDialog.querySelector('[value="close"]').innerText = uiText.close

    document.getElementById('file-input').click()
}

document.getElementById('file-input').onchange = e => open(e.target.files[0])
    .catch(({ message, stack }) => emit({ type: 'book-error', message, stack }))

emit({ type: 'ready' })
