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

// 1024 characters per page is used by Adobe Digital Editions
const CHARACTERS_PER_PAGE = 1024
const CHARACTERS_PER_WORD = lang =>
    lang === 'zh' || lang === 'ja' || lang === 'ko' ? 2.5 : 6
const WORDS_PER_MINUTE = 200

let book = ePub()
let rendition
let cfiToc
let sectionMarks = []
let lineHeight = 24
let enableFootnote = false
let skeuomorphism = false
let autohideCursor, myScreenX, myScreenY, cursorHidden
let ibooksInternalTheme = 'Light'
let doubleClickTime = 400
let imgEventType = 'click'
let zoomLevel = 1
let windowSize
let windowHeight
const getWindowIsZoomed = () => Math.abs(windowSize - window.innerWidth * zoomLevel) > 2

const CFI = new ePub.CFI()

// create a range cfi from two cfi locations
// adapted from https://github.com/futurepress/epub.js/blob/be24ab8b39913ae06a80809523be41509a57894a/src/epubcfi.js#L502
const makeRangeCfi = (a, b) => {
    const start = CFI.parse(a), end = CFI.parse(b)
    const cfi = {
        range: true,
        base: start.base,
        path: {
            steps: [],
            terminal: null
        },
        start: start.path,
        end: end.path
    }
    const len = cfi.start.steps.length
    for (let i = 0; i < len; i++) {
        if (CFI.equalStep(cfi.start.steps[i], cfi.end.steps[i])) {
            if (i == len - 1) {
                // Last step is equal, check terminals
                if (cfi.start.terminal === cfi.end.terminal) {
                    // CFI's are equal
                    cfi.path.steps.push(cfi.start.steps[i])
                    // Not a range
                    cfi.range = false
                }
            } else cfi.path.steps.push(cfi.start.steps[i])
        } else break
    }
    cfi.start.steps = cfi.start.steps.slice(cfi.path.steps.length)
    cfi.end.steps = cfi.end.steps.slice(cfi.path.steps.length)

    return 'epubcfi(' + CFI.segmentString(cfi.base)
        + '!' + CFI.segmentString(cfi.path)
        + ',' + CFI.segmentString(cfi.start)
        + ',' + CFI.segmentString(cfi.end)
        + ')'
}

const getCfiFromHref = async href => {
    const id = href.split('#')[1]
    const item = book.spine.get(href)
    await item.load(book.load.bind(book))
    const el = id ? item.document.getElementById(id) : item.document.body
    return item.cfiFromElement(el)
}
const getSectionFromCfi = cfi => {
    const index = cfiToc.findIndex(el => el ? CFI.compare(cfi, el.cfi) <= 0 : false)
    return cfiToc[(index !== -1 ? index : cfiToc.length) - 1]
        || { label: book.package.metadata.title, href: '', cfi: '' }
}

const getSelections = () => rendition.getContents()
    .map(contents => contents.window.getSelection())
const clearSelection = () => getSelections().forEach(s => s.removeAllRanges())
const selectByCfi = cfi => getSelections().forEach(s => s.addRange(rendition.getRange(cfi)))

class Find {
    constructor() {
        this.results = []
    }
    async _findInSection(q, section) {
        if (!section) section = book.spine.get(rendition.location.start.cfi)
        await section.load(book.load.bind(book))
        const results = await section.search(q)
        await section.unload()
        return results
    }
    async find(q, inBook, highlight) {
        this.clearHighlight()
        let results = []
        if (inBook) {
            const arr = await Promise.all(book.spine.spineItems
                .map(section => this._findInSection(q, section)))
            results = arr.reduce((a, b) => a.concat(b), [])
        } else {
            results = await this._findInSection(q)
        }
        results.forEach(result =>
            result.section = getSectionFromCfi(result.cfi).label)
        this.results = results
        dispatch({ type: 'find-results', payload: { q, results } })
        if (highlight) this.highlight()
    }
    highlight() {
        this.clearHighlight()
        this.results.forEach(({ cfi }) =>
            rendition.annotations.underline(cfi, {}, () => {}, 'ul', {
                'stroke-width': '3px',
                'stroke': 'red',
                'stroke-opacity': 0.8,
                'mix-blend-mode': 'multiply'
            }))
    }
    clearHighlight() {
        this.results.forEach(({ cfi }) =>
            rendition.annotations.remove(cfi, 'underline'))
    }
}
const find = new Find()

const dispatchLocation = async () => {
    let location
    try {
        location = await rendition.currentLocation()
    } catch (e) {
        return
    }

    const percentage = location.start.percentage
    const index = book.spine.get(location.start.cfi).index

    // rough estimate of reading time
    // should be reasonable for English and European languages
    // will be way off for some langauges
    const estimate = endPercentage =>
        (endPercentage - percentage) * book.locations.total
        * CHARACTERS_PER_PAGE
        / CHARACTERS_PER_WORD(book.package.metadata.language)
        / WORDS_PER_MINUTE
    const nextSectionPercentage = (sectionMarks || []).find(x => x > percentage)

    const startSection = getSectionFromCfi(location.start.cfi)
    const endSection = getSectionFromCfi(location.end.cfi)

    dispatch({
        type: 'relocated',
        payload: {
            atStart: location.atStart,
            atEnd: location.atEnd,
            start: {
                cfi: location.start.cfi,
                percentage: location.start.percentage,
                location: book.locations.locationFromCfi(location.start.cfi),
                label: startSection.label
            },
            end: {
                end: location.end.cfi,
                percentage: location.end.percentage,
                location: book.locations.locationFromCfi(location.end.cfi),
                label: endSection.label
            },
            sectionHref: startSection.href,
            section: index,
            sectionTotal: book.spine.length,
            locationTotal: book.locations.total,
            timeInBook: estimate(1),
            timeInChapter: estimate(nextSectionPercentage)
        }
    })
}

const addAnnotation = (cfi, color) => {
    rendition.annotations.remove(cfi, 'highlight')
    rendition.annotations.highlight(cfi, {}, async e => dispatch({
        type: 'highlight-menu',
        payload: {
            position: getRect(e.target),
            cfi,
            text: await book.getRange(cfi).then(range => range.toString()),
            language: book.package.metadata.language
        }
    }), 'hl', {
        fill: color,
        'fill-opacity': 0.25,
        'mix-blend-mode': 'multiply'
    })
}

const speak = async from => {
    // speak selection
    const selections = getSelections()
        .filter(s => s.rangeCount && !s.getRangeAt(0).collapsed)
    if (selections.length) return dispatch({
        type: 'speech',
        payload: {
            text: selections[0].toString(),
            nextPage: false
        }
    })
    // otherwise speak current page
    const currentLoc = rendition.currentLocation()
    if (from) {
        const cfi = new ePub.CFI(from)
        cfi.collapse(true)
        from = cfi.toString()
    }
    let start = currentLoc.start.cfi
    let end = currentLoc.end.cfi
    let nextPage = !currentLoc.atEnd
    let nextSection = false

    let range = await book.getRange(makeRangeCfi(from || start, end))

    const isScrolled = rendition.settings.flow === 'scrolled'
    const isScrolledDoc = rendition.settings.flow === 'scrolled-doc'
    if (isScrolled || isScrolledDoc) {
        // when in non-paginated mode, read to the end of the section
        const section = book.spine.get(currentLoc.start.cfi)
        range.setEndAfter(section.document.body.lastChild)

        // "next page" when using scrolled-doc is the same as "next section"
        nextPage = section.index + 1 < book.spine.length
        if (isScrolled) nextSection = section.index + 1 < book.spine.length
    }

    dispatch({
        type: 'speech',
        payload: {
            text: range.toString(),
            nextPage,
            nextSection
        }
    })
}

// redraw annotations on view changes
// so that they would be rendered at the new, correct positions
const redrawAnnotations = () =>
    rendition.views().forEach(view => view.pane ? view.pane.render() : null)

const setStyle = style => {
    const {
        brightness, fgColor, bgColor, linkColor, invert,
        fontFamily, fontSize, fontWeight, fontStyle, fontStretch,
        spacing, margin, maxWidth,
        usePublisherFont, hyphenate, justify
    } = style

    lineHeight = fontSize * spacing

    ibooksInternalTheme = style.ibooksInternalTheme
    rendition.getContents().forEach(contents => contents.document.documentElement
        .setAttribute('__ibooks_internal_theme', ibooksInternalTheme))

    document.documentElement.style.padding = `0 ${margin}%`
    document.body.style.maxWidth = `${maxWidth}px`

    document.documentElement.style.filter =
        invert || brightness !== 1
            ? (invert ? 'invert(1) hue-rotate(180deg) ' : '')
                + `brightness(${brightness})`
            : ''
    document.body.style.color = fgColor
    document.body.style.background = bgColor

    const themeName = usePublisherFont ? '__foliate_publisher-font' : '__foliate_custom-font'
    const stylesheet = {
        [`.${themeName}`]: {
            'color': fgColor,
            'background': bgColor,
            'font-size': `${fontSize}px !important`,
            'line-height': `${spacing} !important`,
            '-webkit-hyphens': hyphenate ? 'auto' : 'manual',
            '-webkit-hyphenate-limit-before': 3,
            '-webkit-hyphenate-limit-after': 2,
            '-webkit-hyphenate-limit-lines': 2
        },
        [`.${themeName} p`]: {
            'font-size': `${fontSize}px !important`,
            'line-height': `${spacing} !important`
        },
        [`.${themeName} code, .${themeName} pre`]: {
            '-webkit-hyphens': 'none'
        },
        [`.${themeName} a:link`]: { color: linkColor },
        p: {
            'text-align': justify ? 'justify' : 'inherit'
        }
    }

    if (!usePublisherFont) {
        // set custom font
        const bodyStyle = stylesheet[`.${themeName}`]
        bodyStyle['font-family'] = `"${fontFamily}" !important`
        bodyStyle['font-style'] = fontStyle
        bodyStyle['font-weight'] = fontWeight
        bodyStyle['font-stretch'] = fontStretch

        // force font on everything that isn't code
        const notCode = '*:not(code):not(pre):not(code *):not(pre *)'
        stylesheet[`.${themeName} ${notCode}`] = {
            'font-family': `"${fontFamily}" !important`
        }
    }

    rendition.themes.register(themeName, stylesheet)
    rendition.themes.select(themeName)
    rendition.resize()
    redrawAnnotations()
}

/*
Steps when opening a book:

open() -> 'book-ready' -> loadLocations()
                       -> render() -> 'rendition-ready' -> setStyle()
                                                        -> setupRendition()
                                                        -> display() -> 'book-displayed'
*/

const open = async (uri, filename, inputType, renderTo, options) => {

    // force rendering as XHTML
    // if method is 'srcdoc' (default) or `write`, it will be rendered as HTML
    if (!['directory', 'opf', 'json'].includes(inputType)) options.method = 'blobUrl'

    try {
        switch (inputType) {
            case 'text': {
                const json = await webpubFromText(uri, filename)
                await book.openJSON(json)
                break
            }
            case 'fb2': {
                const json = await webpubFromFB2(uri, filename)
                await book.openJSON(json)
                break
            }
            case 'fb2zip': {
                const json = await webpubFromFB2Zip(uri, filename)
                await book.openJSON(json)
                break
            }
            case 'html':
            case 'xhtml': {
                const json = await webpubFromHTML(uri, filename, inputType)
                await book.openJSON(json)
                break
            }
            case 'cbz':
            case 'cbr':
            case 'cb7':
            case 'cbt': {
                let layout = 'automatic'
                if (options) {
                    if (options.flow === 'paginated' && options.spread === 'none') {
                        layout = 'single-column'
                    } else if (options.flow === 'scrolled-doc') {
                        layout = 'scrolled'
                    } else if (options.flow === 'scrolled') {
                        layout = 'continuous'
                    }
                }

                // Set `spread` to 'none' for all layouts, except 'automatic'
                if (layout !== 'automatic') {
                    options.spread = 'none'
                }

                const json = await webpubFromComicBookArchive(uri, inputType, layout, filename)
                await book.openJSON(json)
                break
            }
            default:
                await book.open(uri, inputType)
        }
    } catch(e) {
        dispatch({
            type: 'book-error',
            payload: e.message || e.toString()
        })
    }

    rendition = book.renderTo(renderTo, options)
}

book.ready.then(async () => {
    const hrefList = []

    // set the correct URL based on the path to the nav or ncx file
    // fixes https://github.com/futurepress/epub.js/issues/469
    const path = book.packaging.navPath || book.packaging.ncxPath
    const f = x => {
        x.label = x.label.trim()
        x.href = resolveURL(x.href, path)
        hrefList.push(x)
        x.subitems.forEach(f)
    }
    book.navigation.toc.forEach(f)

    // convert hrefs to CFIs for better TOC with anchor support
    cfiToc = await Promise.all(hrefList.map(async ({ label, href }) => {
        try {
            const result = await getCfiFromHref(href)
            const cfi = new ePub.CFI(result)
            cfi.collapse(true)
            return {
                label,
                href,
                cfi: cfi.toString()
            }
        } catch (e) {
            return undefined
        }
    }))
    cfiToc.sort((a, b) => CFI.compare(a.cfi, b.cfi))

    const metadata = book.packaging.metadata
    if (book.packaging.uniqueIdentifier)
        metadata.identifier = book.packaging.uniqueIdentifier
    if (metadata.description)
        metadata.description = toPangoMarkup(metadata.description)
    dispatch({ type: 'book-ready' })
})

const render = () =>
    rendition.display().then(() => dispatch({ type: 'rendition-ready' }))

const loadLocations = async locations => {
    const locationsReady = () => {
        sectionMarks = book.spine.items.map(section => book.locations
            .percentageFromCfi('epubcfi(' + section.cfiBase + '!/0)'))
        dispatchLocation()
    }

    if (locations) {
        book.locations.load(locations)
        if (book.locations.total < 0) return dispatch({ type: 'locations-fallback' })
        locationsReady()
        dispatch({ type: 'locations-ready' })
    } else {
        await book.locations.generate(CHARACTERS_PER_PAGE)
        if (book.locations.total < 0) return dispatch({ type: 'locations-fallback' })
        locationsReady()
        dispatch({
            type: 'locations-generated',
            payload: book.locations.save()
        })
    }
}

const display = lastLocation =>
    rendition.display(lastLocation)
        .then(() => dispatch({ type: 'book-displayed' }))

// get book cover for "about this book" dialogue
book.loaded.resources
    .then(resources => {
        if (book.cover.includes(':')) return book.cover
        else return resources.createUrl(book.cover)
    })
    .then(url => fetch(url))
    .then(res => res.blob())
    .then(blob => {
        const reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onloadend = () => dispatch({
            type: 'cover',
            payload: reader.result.split(',')[1]
        })
    })
    .catch(() => dispatch({
        type: 'cover',
        payload: null
    }))

const getRect = (target, frame) => {
    const rect = target.getBoundingClientRect()
    const viewElementRect =
        frame ? frame.getBoundingClientRect() : { left: 0, top: 0 }
    const left = rect.left + viewElementRect.left
    const right = rect.right + viewElementRect.left
    const top = rect.top + viewElementRect.top
    const bottom = rect.bottom + viewElementRect.top
    return { left, right, top, bottom }
}

const setupRendition = () => {
    const paginated = rendition.settings.flow === 'paginated'

    const resize = () => {
        // set rendition height to window height for vertical books
        // verticfal books don't work without explicitly setting height
        if (rendition.manager.viewSettings.axis === 'vertical') {
            rendition.resize('100%', windowHeight / zoomLevel)
        }
    }
    resize()
    rendition.on('layout', resize)

    rendition.on('rendered', redrawAnnotations)
    rendition.on('relocated', dispatchLocation)

    // fix location drift when resizing multiple times in a row
    // we keep a `location` that doesn't change when rendition has just been resized,
    // then, when the resize is done, we correct the location with it,
    // but this correction will itself trigger a `relocated` event,
    // so we create a further `correcting` variable to track this
    let location
    let justResized = false
    let correcting = false
    rendition.on('relocated', () => {
        // console.log('relocated')
        if (!justResized) {
            if (!correcting) {
                // console.log('real relocation')
                location = rendition.currentLocation().start.cfi
            } else {
                // console.log('corrected')
                correcting = false
            }
        } else {
            // console.log('correcting')
            justResized = false
            correcting = true
            rendition.display(location)
        }
    })
    rendition.on('resized', () => {
        // console.log('resized')
        justResized = true
    })

    const updateDivider = () => {
        const spread = paginated && rendition.settings.spread !== 'none'
            && document.getElementById('viewer').clientWidth >= 800
        // document.getElementById('divider').style.display =
        //     skeuomorphism && spread ? 'block' : 'none'
        dispatch({ type: 'spread', payload: spread })
    }
    rendition.on('layout', updateDivider)
    updateDivider()

    let isSelecting = false

    rendition.hooks.content.register((contents, /*view*/) => {
        const frame = contents.document.defaultView.frameElement

        // set lang attribute based on metadata
        // this is needed for auto-hyphenation
        const html = contents.document.documentElement
        if (!html.getAttribute('lang') && book.package.metadata.language)
            html.setAttribute('lang', book.package.metadata.language)

        html.setAttribute('__ibooks_internal_theme', ibooksInternalTheme)

        const refTypes = [
            'annoref', // deprecated
            'biblioref',
            'glossref',
            'noteref',
        ]
        const forbidRefTypes = [
            'backlink',
            'referrer'
        ]
        const noteTypes = [
            'annotation', // deprecated
            'note', // deprecated
            'footnote',
            'endnote',
            'rearnote' // deprecated
        ]
        // hide EPUB 3 aside notes
        const asides = contents.document.querySelectorAll('aside')
        Array.from(asides).forEach(aside => {
            const type = aside.getAttributeNS(EPUB_NS, 'type')
            const types = type ? type.split(' ') : []
            if (noteTypes.some(x => types.includes(x)))
                aside.style.display = 'none'
        })

        const links = contents.document.querySelectorAll('a:link')
        Array.from(links).forEach(link => link.addEventListener('click', async e => {
            e.stopPropagation()
            e.preventDefault()

            const type = link.getAttributeNS(EPUB_NS, 'type')
            const types = type ? type.split(' ') : []
            const isRefLink = refTypes.some(x => types.includes(x))

            const href = link.getAttribute('href')
            const id = href.split('#')[1]
            const pageHref = resolveURL(href,
                book.spine.spineItems[contents.sectionIndex].href)

            const followLink = () => dispatch({
                type: 'link-internal',
                payload: pageHref
            })

            if (isExternalURL(href))
                dispatch({ type: 'link-external', payload: href })
            else if (!isRefLink && !enableFootnote
                || forbidRefTypes.some(x => types.includes(x)))
                followLink()
            else {
                const item = book.spine.get(pageHref)
                if (item) await item.load(book.load.bind(book))

                let el = (item && item.document ? item.document : contents.document)
                    .getElementById(id)
                if (!el) return followLink()

                let dt
                if (el.nodeName.toLowerCase() === 'dt') {
                    const dfn = el.querySelector('dfn')
                    if (dfn) dt = dfn
                    else dt = el
                    el = el.nextElementSibling
                }

                // this bit deals with situations like
                //     <p><sup><a id="note1" href="link1">1</a></sup> My footnote</p>
                // where simply getting the ID or its parent would not suffice
                // although it would still fail to extract useful texts for some books
                const isFootnote = el => {
                    const nodeName = el.nodeName.toLowerCase()
                    return [
                        'a', 'span', 'sup', 'sub',
                        'em', 'strong', 'i', 'b',
                        'small', 'big'
                    ].every(x => x !== nodeName)
                }
                if (!isFootnote(el)) {
                    while (true) {
                        const parent = el.parentElement
                        if (!parent) break
                        el = parent
                        if (isFootnote(parent)) break
                    }
                }

                if (item) item.unload()
                if (el.innerText.trim()) {
                    const elType = el.getAttributeNS(EPUB_NS, 'type')
                    const elTypes = elType ? elType.split(' ') : []

                    // footnotes not matching this would be hidden (see above)
                    // and so one cannot navigate to them
                    const canLink = !(el.nodeName === 'aside'
                        && noteTypes.some(x => elTypes.includes(x)))

                    dispatch({
                        type: 'footnote',
                        payload: {
                            footnote: toPangoMarkup(
                                (dt ? `<strong>${dt.innerHTML}</strong><br/>` : '') + el.innerHTML,
                                pageHref
                            ),
                            link: canLink ? pageHref : null,
                            position: getRect(e.target, frame),
                            refTypes: types,
                            noteTypes: elTypes
                        }
                    })
                } else followLink()
            }
        }, true))

        const imgs = contents.document.querySelectorAll('img')
        const eventType = imgEventType === 'middleclick' ? 'click' : imgEventType
        if (eventType) {
            Array.from(imgs).forEach(img => img.addEventListener(eventType, e => {
                if (imgEventType === 'click' && e.button !== 0) return
                if (imgEventType === 'middleclick' && e.button !== 1) return
                e.preventDefault()
                e.stopPropagation()
                fetch(img.src)
                    .then(res => res.blob())
                    .then(blob => {
                        const reader = new FileReader()
                        reader.readAsDataURL(blob)
                        reader.onloadend = () => dispatch({
                            type: 'img',
                            payload: {
                                alt: img.getAttribute('alt'),
                                base64: reader.result.split(',')[1],
                                position: getRect(e.target, frame)
                            }
                        })
                    })
            }, true))
        }

        // handle selection and clicks
        let clickTimeout
        const dispatchClick = e => {
            const clientX = (e.changedTouches ? e.changedTouches[0] : e).clientX
            const left = e.target === document.documentElement ? 0 : frame
                .getBoundingClientRect().left
            const f = () => dispatch({
                type: 'click',
                payload: {
                    width: window.innerWidth,
                    position: clientX + left
                }
            })
            clickTimeout = setTimeout(f, doubleClickTime)
        }

        document.onclick = dispatchClick
        contents.document.onmousedown = () => isSelecting = true
        contents.document.onclick = e => {
            isSelecting = false

            const selection = contents.window.getSelection()
            // see https://stackoverflow.com/q/22935320
            if (!selection.rangeCount) return dispatchClick(e)

            const range = selection.getRangeAt(0)
            if (range.collapsed) return dispatchClick(e)

            clearTimeout(clickTimeout)
            dispatch({
                type: 'selection',
                payload: {
                    position: getRect(range, frame),
                    text: selection.toString(),
                    cfi: new ePub.CFI(range, contents.cfiBase).toString(),
                    language: book.package.metadata.language
                }
            })
        }

        // auto-hide cursor
        let cursorTimeout
        const hideCursor = () => {
            contents.document.documentElement.style.cursor = 'none'
            cursorHidden = true
        }
        const showCursor = () =>  {
            contents.document.documentElement.style.cursor = 'auto'
            cursorHidden = false
        }
        if (cursorHidden) hideCursor()
        contents.document.documentElement.addEventListener('mousemove', e => {
            // check whether the mouse actually moved
            // or the event is just triggered by something else
            if (e.screenX === myScreenX && e.screenY === myScreenY) return
            myScreenX = e.screenX, myScreenY = e.screenY
            showCursor()
            if (cursorTimeout) clearTimeout(cursorTimeout)
            if (autohideCursor) cursorTimeout = setTimeout(hideCursor, 1000)
        }, false)
    })

    const rtl = book.package.metadata.direction === 'rtl'
    const goLeft = rtl ? () => rendition.next() : () => rendition.prev()
    const goRight = rtl ? () => rendition.prev() : () => rendition.next()

    // keyboard shortcuts
    const handleKeydown = event => {
        if (getWindowIsZoomed()) return
        const k = event.key
        if (k === 'ArrowLeft' || k === 'h') goLeft()
        else if(k === 'ArrowRight' || k === 'l') goRight()
        else if (k === 'Backspace') {
            if (paginated) rendition.prev()
            else window.scrollBy(0, -window.innerHeight)
        } else if (event.shiftKey && k === ' ' || k === 'ArrowUp' || k === 'PageUp') {
            if (paginated) rendition.prev()
        } else if (k === ' ' || k === 'ArrowDown' || k === 'PageDown') {
            if (paginated) rendition.next()
        } else if (k === 'j') {
            if (paginated) rendition.next()
            else window.scrollBy(0, lineHeight)
        } else if (k === 'k') {
            if (paginated) rendition.prev()
            else window.scrollBy(0, -lineHeight)
        }
    }
    rendition.on('keydown', handleKeydown)
    document.addEventListener('keydown', handleKeydown, false)

    if (paginated) {
        // go to the next page when selecting to the end of a page
        // this makes it possible to select across pages
        rendition.on('selected', debounce(cfiRange => {
            if (!isSelecting) return
            const selCfi = new ePub.CFI(cfiRange)
            selCfi.collapse()
            const compare = CFI.compare(selCfi, rendition.location.end.cfi) >= 0
            if (compare) rendition.next()
        }, 1000))
    }
}

dispatch({ type: 'ready' })
