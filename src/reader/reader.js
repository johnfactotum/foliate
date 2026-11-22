import { makeBook, NotFoundError, UnsupportedTypeError } from '../foliate-js/view.js'
import { Overlayer } from '../foliate-js/overlayer.js'
import { FootnoteHandler } from '../foliate-js/footnotes.js'
import { toPangoMarkup } from './markup.js'

const format = {}

const emit = x => globalThis.webkit.messageHandlers.viewer
    .postMessage(JSON.stringify(x))

const formatLanguageMap = x => {
    if (!x) return ''
    if (typeof x === 'string') return x
    const keys = Object.keys(x)
    return x[keys[0]]
}

const getSelectionRange = sel => {
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

const getCSS = ({
    lineHeight, justify, hyphenate, invert, theme, overrideFont, userStylesheet,
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
            text-decoration-color: light-dark(
                color-mix(in srgb, currentColor 20%, transparent),
                color-mix(in srgb, currentColor 40%, transparent));
            text-underline-offset: .1em;
            &:hover {
                text-decoration-color: unset;
            }
        }
        @media (prefers-color-scheme: dark) {
            html {
                color: ${invert ? theme.inverted.fg : theme.dark.fg};
                ${invert ? '-webkit-font-smoothing: antialiased;' : ''}
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
    :is(hgroup, header) p {
        text-align: unset;
        hyphens: unset;
    }
    h1, h2, h3, h4, h5, h6, hgroup, th {
        text-wrap: balance;
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
            background: color-mix(in hsl, ${theme.light.fg}, #fff 50%) !important;
            background: color-mix(in hsl, ${theme.light.fg}, ${theme.light.bg} 85%) !important;
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
            background: color-mix(in hsl, ${theme.dark.fg}, #000 50%) !important;
            background: color-mix(in hsl, ${theme.dark.fg}, ${theme.dark.bg} 75%) !important;
        }`}
    }
    p, li, blockquote, dd {
        line-height: ${lineHeight};
        text-align: ${justify ? 'justify' : 'start'};
        hyphens: ${hyphenate ? 'auto' : 'none'};
    }
    ${overrideFont ? '* { font-family: revert !important }' : ''}
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

// the marker drawn in the margin beside the column being read,
// pointing at the text, to help finding the position again after switching away
// unlike a bookmark it is not meant to be listed or jumped to, but since it is
// remembered in the book's storage, it is still there when the book is opened again
const markerSize = { width: 12, height: 18, gap: 3 }
const readingMarker = document.getElementById('reading-marker')
// how far the pointer may move for a press-release to still count as a click
const maxDrag = 10

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

class Reader {
    #footnoteHandler = new FootnoteHandler()
    #pressPoint = null
    // whether the marker is drawn at all, from the "Show Reading Marker" preference
    // when off, an existing marker is only hidden, not forgotten,
    // so turning the setting back on brings it right back
    #showReadingMarker = false
    // the marker currently shown, as `{ column, ratio, section }`, or `null`
    #marker = null
    // where the reader was at the last relocation
    // a marker is only made obsolete when the position actually moved,
    // which is how turning pages is told apart from a mere re-render
    #lastCFI = null
    #lastSection = null
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

        this.book.transformTarget?.addEventListener('data', ({ detail }) => {
            detail.data = Promise.resolve(detail.data).catch(e => {
                console.error(new Error(`Failed to load ${detail.name}`, { cause: e }))
                return ''
            })
        })

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
    setAppearance({ style, layout, autohideCursor, showReadingMarker }) {
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
            if (layout.animated) renderer.setAttribute('animated', '')
            else renderer.removeAttribute('animated')
            renderer.setStyles?.(getCSS(this.style))
        }
        document.body.classList.toggle('invert', this.style.invert)
        if (autohideCursor) this.view?.setAttribute('autohide-cursor', '')
        else this.view?.removeAttribute('autohide-cursor')
        this.#showReadingMarker = showReadingMarker ?? false
        this.#showMarker()
    }
    // the columns on screen, in the CSS pixels of this document
    // `left` is the left edge of the first one, `pitch` the distance between two,
    // `gap` the space between two columns, and `count` how many are shown side by side
    // `null` when it cannot be determined, e.g. before anything is loaded
    get #columns() {
        const { renderer } = this.view ?? {}
        if (!renderer) return null
        const { width } = renderer.getBoundingClientRect()
        // `size` is the width of a page, which holds all of its columns
        // (or the height, when the book is written vertically)
        const { size } = renderer
        const doc = renderer.getContents?.()[0]?.doc
        const style = doc?.defaultView?.getComputedStyle(doc.documentElement)
        // in paginated mode the paginator centres the content,
        // so the outer margins are simply the leftover space
        if (!renderer.scrolled && isFinite(size) && size > 0 && size <= width
            && (style?.writingMode ?? 'horizontal-tb').startsWith('horizontal')) {
            // the columns fill the page exactly, so this recovers how many there are
            const columnWidth = parseFloat(style?.columnWidth)
            const gap = parseFloat(style?.columnGap)
            const count = isFinite(columnWidth) && isFinite(gap)
                ? Math.round(size / (columnWidth + gap))
                : 1
            if (count > 0)
                return { left: (width - size) / 2, pitch: size / count, count, gap: gap || 0 }
        }
        // in scrolled mode, and for vertical and fixed-layout books, the content fills
        // the frame and is centred within it, so ask the document itself instead
        const frame = doc?.defaultView?.frameElement
        const body = doc?.body
        if (!frame || !body) return null
        return {
            left: frame.getBoundingClientRect().left + body.getBoundingClientRect().left,
            pitch: width,
            count: 1,
            gap: 0,
        }
    }
    // place the marker at a given position: `column` is the index of the column
    // it points at, `ratio` is where it sits vertically, as a fraction of the height
    // the space between two columns being split evenly between them
    // returns `false` when it cannot be placed, e.g. before anything is loaded
    #placeMarker({ column, ratio }) {
        const columns = this.#columns
        if (!columns) return false
        const { left, pitch, count } = columns
        const index = Math.max(0, Math.min(count - 1, column))
        const tip = left + index * pitch - markerSize.gap
        if (tip < 1) return false
        const start = Math.max(0, tip - markerSize.width)
        const top = Math.max(0, Math.min(innerHeight - markerSize.height,
            ratio * innerHeight - markerSize.height / 2))
        Object.assign(readingMarker.style, {
            left: start + 'px',
            top: top + 'px',
            width: tip - start + 'px',
            height: markerSize.height + 'px',
        })
        return true
    }
    // draw the marker that is being remembered, if there is one and there is room for it
    // the position is relative, so this also brings it along when the layout changes
    #showMarker() {
        readingMarker.style.display =
            this.#showReadingMarker && this.#marker && this.#placeMarker(this.#marker)
                ? 'block' : 'none'
    }
    // mark the column nearest to the point that was clicked
    // any previous marker is simply replaced by this one
    #setMarker(x, y) {
        // when hidden, clicking marks nothing
        if (!this.#showReadingMarker) return
        const columns = this.#columns
        if (!columns) return
        const { left, pitch, gap } = columns
        const marker = {
            column: Math.max(0, Math.floor((x - left + gap / 2) / pitch)),
            ratio: Math.max(0, Math.min(1, y / innerHeight)),
            section: this.#lastSection,
        }
        if (!this.#placeMarker(marker)) return
        this.#marker = marker
        readingMarker.style.display = 'block'
        // it is meant to outlive this session, so have it saved at once
        emit({ type: 'reading-marker-set', marker })
    }
    #clearMarker() {
        if (!this.#marker) return
        this.#marker = null
        readingMarker.style.display = 'none'
        emit({ type: 'reading-marker-clear' })
    }
    // show a marker saved in an earlier session,
    // unless it was left on another page, in which case it is no good any more
    restoreMarker(saved) {
        const { column, ratio, section } = saved ?? {}
        const isUsable = isFinite(column) && column >= 0
            && isFinite(ratio) && ratio >= 0 && ratio <= 1
            && (section == null || this.#lastSection == null
                || section === this.#lastSection)
        if (!isUsable) return emit({ type: 'reading-marker-clear' })
        this.#marker = { column, ratio, section: section ?? this.#lastSection }
        this.#showMarker()
    }
    #handleEvents() {
        this.view.addEventListener('relocate', e => {
            const { cfi, section } = e.detail
            // the reader also relocates without going anywhere, e.g. when re-rendering
            // after a resize, so only a change of position — turning pages —
            // is what makes the marker point at the wrong place
            if (this.#marker && this.#lastCFI !== null && cfi !== this.#lastCFI)
                this.#clearMarker()
            else
                this.#showMarker()
            this.#lastCFI = cfi
            this.#lastSection = section?.current ?? null
            const { heads, feet } = this.view.renderer
            if (heads) {
                const { tocItem } = e.detail
                heads.at(-1).innerText = tocItem?.label ?? ''
                if (heads.length > 1)
                    heads[0].innerText = formatLanguageMap(this.book.metadata.title)
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
            this.#footnoteHandler.handle(this.book, e)?.catch(err => {
                console.warn(err)
                this.view.goTo(e.detail.href)
            }))
        this.view.addEventListener('load', e => this.#onLoad(e))
        this.view.history.addEventListener('index-change', e => {
            const { canGoBack, canGoForward } = e.target
            emit({ type: 'history-index-change', canGoBack, canGoForward })
        })

        // clicks on the content are handled by the frame itself,
        // so anything reaching this document landed on one of the margins
        this.view.addEventListener('pointerdown', e =>
            (this.#pressPoint = { x: e.clientX, y: e.clientY }))
        document.addEventListener('click', e => {
            if (e.button !== 0 || e.target !== this.view) return
            const { clientX: x, clientY: y } = e
            // don't count the end of a drag, e.g. when selecting text ends in the margin
            const press = this.#pressPoint
            if (!press || Math.hypot(press.x - x, press.y - y) > maxDrag) return
            this.#setMarker(x, y)
        })

        // and clicking the marker itself takes it away
        readingMarker.addEventListener('pointerdown', e =>
            (this.#pressPoint = { x: e.clientX, y: e.clientY }))
        readingMarker.addEventListener('click', e => {
            if (e.button !== 0) return
            // it sits over the margin, so don't let this become a new mark
            e.stopPropagation()
            const press = this.#pressPoint
            if (press && Math.hypot(press.x - e.clientX, press.y - e.clientY) > maxDrag) return
            this.#clearMarker()
        })
    }
    #onLoad(e) {
        const { doc, index } = e.detail
        // the frame was replaced, so the marker has to be drawn again,
        // unless it was left on another page, which can only mean the pages were turned
        if (this.#marker?.section != null && this.#marker.section !== index)
            this.#clearMarker()
        else
            this.#showMarker()
        // clicking the text marks the column it was clicked in as well,
        // but since the click happens in the frame, the coordinates have to be
        // converted to those of this document first
        const toPage = e => {
            const frame = doc.defaultView.frameElement
            if (!frame) return null
            const { left, top } = frame.getBoundingClientRect()
            return { x: left + e.clientX, y: top + e.clientY }
        }
        // NOTE: they have to be in the capture phase, since the selection handler below
        // registers a listener that stops the click from propagating any further
        doc.addEventListener('pointerdown', e => (this.#pressPoint = toPage(e)), true)
        doc.addEventListener('click', e => {
            const point = toPage(e)
            const press = this.#pressPoint
            if (point && press && Math.hypot(press.x - point.x, press.y - point.y) <= maxDrag)
                this.#setMarker(point.x, point.y)
        }, true)
        for (const img of doc.querySelectorAll('img'))
            img.addEventListener('dblclick', () => fetch(img.src)
                .then(res => res.blob())
                .then(blob => Promise.all([blobToBase64(blob), blob.type]))
                .then(([base64, mimetype]) =>
                    emit({ type: 'show-image', base64, mimetype }))
                .catch(e => console.error(e)))

        doc.addEventListener('pointerup', () => {
            const sel = doc.getSelection()
            const range = getSelectionRange(sel)
            if (!range) return
            // prevent click event
            doc.addEventListener('click', e => e.stopPropagation(), { capture: true, once: true })
            const pos = getPosition(range)
            const value = this.view.getCFI(index, range)
            const lang = getLang(range.commonAncestorContainer)
            const text = sel.toString()
            this.#showSelection({ index, range, lang, value, pos, text })
        })
    }
    #showAnnotation({ index, range, value, pos }) {
        globalThis.showSelection({ type: 'annotation', value, pos })
            .then(action => {
                if (action === 'select')
                    this.#showSelection({ index, range, value, pos })
            })
    }
    #showSelection({ index, range, lang, value, pos, text }) {
        if (!text) {
            const sel = range.startContainer.ownerDocument.getSelection()
            sel.removeAllRanges()
            sel.addRange(range)
            text = sel.toString()
        }
        const content = range.toString()
        globalThis.showSelection({ type: 'selection', text, content, lang, value, pos }).then(action => {
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

const open = async (file, Reader) => {
    try {
        const book = await makeBook(file)
        const reader = new Reader(book)
        globalThis.reader = reader
        await reader.init()
        emit({ type: 'book-ready', book, reader })
    }
    catch (e) {
        if (e instanceof NotFoundError)
            emit({ type: 'book-error', id: 'not-found' })
        else if (e instanceof UnsupportedTypeError)
            emit({ type: 'book-error', id: 'unsupported-type' })
        else throw e
    }
}

globalThis.loadFile = () => document.getElementById('file-input').click()

globalThis.init = ({ uiText }) => {
    globalThis.uiText = uiText

    format.loc = (a, b) => printf(uiText.loc, [a, b])
    format.page = (a, b) => b
        ? printf(uiText.page, [a, b])
        : printf(uiText.pageWithoutTotal, [a])

    footnoteDialog.querySelector('[value="close"]').innerText = uiText.close

    document.getElementById('file-input').onchange = e => open(e.target.files[0], Reader)
        .catch(({ message, stack }) => emit({ type: 'book-error', message, stack }))
    globalThis.loadFile()
}

globalThis.initImport = () => {
    const view = document.createElement('foliate-view')
    class Reader {
        constructor(book) {
            this.book = book
            if (book.metadata?.description)
                book.metadata.description = toPangoMarkup(book.metadata.description)
        }
        async init() {
            await view.open(this.book)
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
    document.getElementById('file-input').onchange = e => open(e.target.files[0], Reader)
        .catch(({ message, stack }) => emit({ type: 'book-error', message, stack }))
}

emit({ type: 'ready' })
