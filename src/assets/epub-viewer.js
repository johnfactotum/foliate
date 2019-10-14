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

const CFI = new ePub.CFI()
let book = ePub()
let rendition
let cfiToc
let sectionMarks
let lineHeight = 24
let footnoteEnabled = false

class Find {
    constructor() {
        this.results = []
    }
    _findInSection(q, section) {
        if (!section) section = book.spine.get(rendition.location.start.cfi)
        return section.load(book.load.bind(book))
            .then(section.find.bind(section, q))
            .finally(section.unload.bind(section))
    }
    _findInBook(q) {
        return  Promise.all(book.spine.spineItems.map(item =>
            item.load(book.load.bind(book))
                .then(item.find.bind(item, q))
                .finally(item.unload.bind(item))))
            .then(results =>
                Promise.resolve([].concat.apply([], results)))
    }
    find(q, inBook, highlight) {
        this.clearHighlight()
        return (inBook ? this._findInBook : this._findInSection)(q)
            .then(results => {
                results.forEach(result =>
                    result.section = getSectionFromCfi(result.cfi).label)
                this.results = results
                dispatch({ type: 'find-results', payload: { q, results } })
                if (highlight) this.highlight()
            })
    }
    highlight() {
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

const dispatchLocation = () => {
    const location = rendition.currentLocation() || rendition.location

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

    dispatch({
        type: 'relocated',
        payload: {
            atStart: location.atStart,
            atEnd: location.atEnd,
            cfi: location.start.cfi,
            sectionHref: getSectionFromCfi(location.start.cfi).href,
            section: index,
            sectionTotal: book.spine.length,
            location: book.locations.locationFromCfi(location.start.cfi),
            locationTotal: book.locations.total,
            percentage,
            timeInBook: estimate(1),
            timeInChapter: estimate(nextSectionPercentage)
        }
    })
}

const getContentsSelection = () => rendition.getContents()[0].window.getSelection()
const clearSelection = () => getContentsSelection().removeAllRanges()
const selectByCfi = cfi => getContentsSelection().addRange(rendition.getRange(cfi))

const addAnnotation = (cfi, color) => {
    rendition.annotations.remove(cfi, 'highlight')
    rendition.annotations.highlight(cfi, {}, async e => dispatch({
        type: 'highlight-menu',
        payload: {
            position: getRect(e.target),
            cfi,
            color,
            text: await book.getRange(cfi).then(range => range.toString()),
            language: book.package.metadata.language
        }
    }), 'hl', {
        fill: color,
        'fill-opacity': 0.25,
        'mix-blend-mode': 'multiply'
    })
}

// redraw annotations on view changes
// so that they would be rendered at the new, correct positions
const redrawAnnotations = () =>
    rendition.views().forEach(view => view.pane ? view.pane.render() : null)

const setStyle = style => {
    const {
        brightness, color, background, link, invert,
        fontFamily, fontSize, fontWeight, fontStyle, fontStretch,
        spacing, margins,
        publisherFont, hyphenate, justify
    } = style

    lineHeight = fontSize * spacing

    document.body.style.margin = `0 ${margins}%`
    rendition.resize()

    document.documentElement.style.filter =
        (invert ? 'invert(1) hue-rotate(180deg) ' : '')
        + `brightness(${brightness})`
    document.body.style.color = color
    document.body.style.background = background

    const themeName = publisherFont ? 'publisher-font' : 'custom-font'
    const stylesheet = {
        [`.${themeName}`]: {
            'color': color,
            'background': background,
            'font-size': `${fontSize}px !important`,
            'line-height': `${spacing} !important`,
            '-webkit-hyphens': hyphenate ? 'auto' : 'manual',
            '-webkit-hyphenate-limit-before': 3,
            '-webkit-hyphenate-limit-after': 2,
            '-webkit-hyphenate-limit-lines': 2
        },
        [`.${themeName} code, .${themeName} pre`]: {
            '-webkit-hyphens': 'none'
        },
        [`.${themeName} a:link`]: { color: link },
        p: {
            'text-align': justify ? 'justify' : 'inherit'
        }
    }

    if (!publisherFont) {
        // set custom font
        const bodyStyle = stylesheet[`.${themeName}`]
        bodyStyle['font-family'] = `"${fontFamily}" !important`
        bodyStyle['font-style'] = fontStyle
        bodyStyle['font-weight'] = fontWeight
        bodyStyle['font-stretch'] = fontStretch

        // force font on everything that isn't code
        const notCode = '*:not(code):not(pre):not(code *):not(pre *)'
        stylesheet[`.${themeName} ${notCode}`] = {
            'font-family': '"${fontFamily}" !important'
        }
    }

    rendition.themes.register(themeName, stylesheet)
    rendition.themes.select(themeName)
    redrawAnnotations()
}

const open = (fileName, inputType, cfi, renderTo, options, locations) => {
    book.open(decodeURI(fileName), inputType) // works for non-flatpak
        .catch(() => book.open(fileName, inputType)) // works for flatpak
        .catch(() => dispatch({ type: 'book-error' }))
    book.ready.then(() => dispatch({ type: 'book-ready' }))

    rendition = book.renderTo(renderTo, options)
    setupRendition()

    const displayed = rendition.display()
        .then(() => cfi ? rendition.display(cfi) : null)
        .then(() => dispatch({ type: 'rendition-ready' }))
    if (locations) {
        book.locations.load(locations)
        displayed
            .then(() => locationsReady())
            .then(() => dispatch({ type: 'locations-ready' }))
    } else {
        displayed
            .then(() => book.locations.generate(CHARACTERS_PER_PAGE))
            .then(() => locationsReady())
            .then(() => dispatch({
                type: 'locations-generated',
                payload: book.locations.save()
            }))
    }
}

const locationsReady = () => {
    sectionMarks = book.spine.items.map(section => book.locations
        .percentageFromCfi('epubcfi(' + section.cfiBase + '!/0)'))
    dispatchLocation()
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

// set the correct URL based on the path to the nav or ncx file
// fixes https://github.com/futurepress/epub.js/issues/469
book.loaded.navigation.then(async navigation => {
    const hrefList = []
    const path = book.packaging.navPath || book.packaging.ncxPath
    const f = x => {
        x.label = x.label.trim()
        x.href = resolveURL(x.href, path)
        hrefList.push(x)
        x.subitems.forEach(f)
    }
    navigation.toc.forEach(f)

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
            return null
        }
    }))
    cfiToc.sort(new ePub.CFI().compare)
})

// get book cover for "about this book" dialogue
book.loaded.resources
    .then(resources => resources.createUrl(book.cover))
    .then(blobUrl => fetch(blobUrl))
    .then(res => res.blob())
    .then(blob => {
        const reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onloadend = () => dispatch({
            type: 'cover',
            payload: reader.result.split(',')[1]
        })
    })
    .catch(() => dispatch({ type: 'cover', payload: null }))

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
    let isSelecting = false

    rendition.on('rendered', () => redrawAnnotations())

    rendition.on('relocated', dispatchLocation)

    rendition.hooks.content.register((contents, /*view*/) => {
        const frame = contents.document.defaultView.frameElement

        // set lang attribute based on metadata
        // this is needed for auto-hyphenation
        const html = contents.document.documentElement
        if (!html.getAttribute('lang') && book.package.metadata.language)
            html.setAttribute('lang', book.package.metadata.language)

        // hide EPUB 3 aside footnotes
        const asides = contents.document.querySelectorAll('aside')
        Array.from(asides).forEach(aside => {
            const type = aside.getAttribute('epub:type')
            if (type === 'footnote') aside.style.display = 'none'
        })

        const links = contents.document.querySelectorAll('a:link')
        Array.from(links).forEach(link => link.addEventListener('click', async e => {
            e.stopPropagation()
            e.preventDefault()

            const type = link.getAttribute('epub:type')
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
            else if (type !== 'noteref' && !footnoteEnabled) followLink()
            else {
                const item = book.spine.get(pageHref)
                if (item) await item.load(book.load.bind(book))

                let el = (item && item.document ? item.document : contents.document)
                    .getElementById(id)
                if (!el) return followLink()

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
                if (el.innerText.trim()) dispatch({
                    type: 'footnote',
                    payload: {
                        footnote: toPangoMarkup(el.innerHTML, pageHref),
                        // footnotes matching this would be hidden (see above)
                        // and so one cannot navigate to them
                        link: (el.nodeName === 'aside'
                            && el.getAttribute('epub:type') === 'footnote')
                            ? null : pageHref,
                        position: getRect(e.target, frame)
                    }
                })
                else followLink()
            }
        }, true))

        // handle selection
        contents.document.onmousedown = () => isSelecting = true
        contents.document.onmouseup = () => {
            isSelecting = false

            const selection = contents.window.getSelection()
            // see https://stackoverflow.com/q/22935320
            if (!selection.rangeCount) return

            const range = selection.getRangeAt(0)
            if (range.collapsed) return

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
    })

    const paginated = rendition.settings.flow === 'paginated'

    // keyboard shortcuts
    const handleKeydown = event => {
        const k = event.key
        if (k === 'ArrowLeft' || k === 'h') rendition.prev()
        else if(k === 'ArrowRight' || k === 'l') rendition.next()
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
        // scroll through pages
        const onwheel = debounce(event => {
            const { deltaX, deltaY } = event
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 0) rendition.next()
                else if (deltaX < 0) rendition.prev()
            } else {
                if (deltaY > 0) rendition.next()
                else if (deltaY < 0) rendition.prev()
            }
            event.preventDefault()
        }, 100, true)
        document.documentElement.onwheel = onwheel

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
