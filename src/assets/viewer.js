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
const debounce = (f, wait, immediate) => {
    let timeout
    return (...args) => {
        const later = () => {
            timeout = null
            if (!immediate) f(...args)
        }
        const callNow = immediate && !timeout
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
        if (callNow) f(...args)
    }
}
const dispatch = action => {
    // unique time in case we are dispatching the same action twice
    const obj = { time: new Date().getTime(), ...action }
    document.title = JSON.stringify(obj)
}

let book, rendition
let locations
let coverBase64
let imgBase64, imgAlt
let searchResults
let clearSelection
let selectionData
let footnote, followLink = () => {}, footnoteEnabled = false
let autohideCursor, screenX, screenY, cursorHidden
let windowSize
const zoomed = () => !((windowSize || window.outerWidth) === window.innerWidth)

const redrawAnnotations = () =>
    rendition.views().forEach(view => view.pane ? view.pane.render() : null)

let shouldUpdateSlider = true
const gotoPercentage = percentage => {
    shouldUpdateSlider = false
    rendition.display(book.locations.cfiFromPercentage(percentage))
}

const doSearch = q =>
    Promise.all(book.spine.spineItems.map(item =>
        item.load(book.load.bind(book))
            .then(item.find.bind(item, q))
            .finally(item.unload.bind(item))))
    .then(results =>
        Promise.resolve([].concat.apply([], results)))
const doChapterSearch = q => {
    const item = book.spine.get(rendition.location.start.cfi)
    return item.load(book.load.bind(book))
        .then(item.find.bind(item, q))
        .finally(item.unload.bind(item))
}
const search = (q, inChapter) => {
    q = decodeURI(q)
    return (inChapter ? doChapterSearch(q) : doSearch(q))
    .then(results => {
        clearSearch()
        searchResults = results
        dispatch({ type: 'search-results', payload: q })
        results.forEach(({ cfi }) =>
            rendition.annotations.underline(cfi, {}, () => {}, 'ul', {
                'stroke-width': '3px',
                stroke: 'red', 'stroke-opacity': 0.8, 'mix-blend-mode': 'multiply'
            }))
    })
}
const clearSearch = () => {
    if (searchResults) searchResults.forEach(({ cfi }) =>
            rendition.annotations.remove(cfi, 'underline'))
}

const atTop = () => window.scrollY === 0
const atBottom = () =>
    (window.innerHeight + window.scrollY) >= document.body.offsetHeight

const prevBottom = () => rendition.currentLocation().atStart ? null
    : rendition.prev().then(() => window.scrollTo(0, document.body.scrollHeight))

const openBook = (fileName, inputType) => {
    book = ePub()
    book.open(decodeURI(fileName), inputType) // works for non-flatpak
        .catch(() => book.open(fileName, inputType)) // works for flatpak
        .catch(() => dispatch({ type: 'book-error' }))
    book.ready.then(() => dispatch({ type: 'book-ready' }))

    // set the correct URL based on the path to the nav or ncx file
    // fixes https://github.com/futurepress/epub.js/issues/469
    book.loaded.navigation.then(navigation => {
        const path = book.packaging.navPath || book.packaging.ncxPath

        // HACK-ish: abuse the URL API a little to resolve the path
        // the base needs to be a valid URL, or it will throw a TypeError,
        // so we just set a random base URI and remove it later
        const base = 'https://example.invalid/'
        const f = x => {
            x.href = new URL(x.href, base + path).href.replace(base, '')
            x.subitems.forEach(f)
        }
        navigation.toc.forEach(f)
    })
}
const display = (lastLocation, cached) => {
    rendition = book.renderTo('viewer', { width: '100%' })

    // HACK: no idea why but have to do it twice
    // otherwise it will fail, but only on rare occassions  ¯\_(ツ)_/¯
    const displayed = rendition.display(lastLocation)
        .then(() => rendition.display(lastLocation))

    const getPercentage = () => {
        try { // ¯\_(ツ)_/¯
            return rendition.currentLocation().start.percentage
        } catch(e) {
            return rendition.location.start.percentage
        }
    }
    if (cached) {
        book.locations.load(cached)
        displayed
            .then(() => dispatch({ type: 'book-displayed' }))
            .then(() => dispatch({
                type: 'locations-ready',
                payload: {
                    percentage: getPercentage(),
                    total: book.locations.total,
                    language: book.package.metadata.language
                }
            }))
    } else {
        displayed
            .then(() => dispatch({ type: 'book-displayed' }))
            .then(() => book.locations.generate(1600))
            .then(() => locations = book.locations.save())
            .then(() => dispatch({
                type: 'locations-generated',
                payload: {
                    percentage: getPercentage(),
                    total: book.locations.total,
                    language: book.package.metadata.language
                }
            }))
    }
    book.loaded.resources
        .then(resources => resources.createUrl(book.cover))
        .then(blobUrl => fetch(blobUrl))
        .then(res => res.blob())
        .then(blob => {
            const reader = new FileReader()
            reader.readAsDataURL(blob)
            reader.onloadend = () => {
                coverBase64 = reader.result.split(',')[1]
                dispatch({ type: 'cover', payload: true })
            }
        })
        .catch(() => dispatch({ type: 'cover', payload: false }))

    const onwheel = debounce(event => {
        if (zoomed()) return
        if (rendition.settings.flow === 'scrolled-doc') {
            if (atBottom() && event.deltaY > 0) {
                rendition.next().then(() =>
                    window.scrollTo(0, 0))
                event.preventDefault()
            } else if (atTop() && event.deltaY < 0) {
                prevBottom()
                event.preventDefault()
            }
        } else {
            if (zoomed()) return
            const { deltaX, deltaY } = event
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 0) rendition.next()
                else if (deltaX < 0) rendition.prev()
            } else {
                if (deltaY > 0) rendition.next()
                else if (deltaY < 0) rendition.prev()
            }
            event.preventDefault()
        }
    }, 100, true)
    displayed.then(() => document.documentElement.onwheel = onwheel)

    const handleKeydown = event => {
        if (zoomed()) return
        const paginated = rendition.settings.flow !== 'scrolled-doc'
        const k = event.key
        if (k === 'ArrowLeft') rendition.prev()
        else if(k === 'ArrowRight') rendition.next()
        else if (k === 'Backspace') {
            if (paginated) rendition.prev()
            else if (atTop()) prevBottom()
            else window.scrollBy(0, -window.innerHeight)
        } else if (event.shiftKey && k === ' ' || k === 'ArrowUp' || k === 'PageUp') {
            if (paginated) rendition.prev()
            else if (atTop()) {
                prevBottom()
                event.preventDefault()
            }
        } else if (k === ' ' || k === 'ArrowDown' || k === 'PageDown') {
            if (paginated) rendition.next()
            else if (atBottom()) {
                rendition.next()
                event.preventDefault()
            }
        }
    }
    rendition.on('keydown', handleKeydown)
    document.addEventListener('keydown', handleKeydown, false)
}

// adapted from https://github.com/futurepress/epub.js/blob/be24ab8b39913ae06a80809523be41509a57894a/src/epubcfi.js#L502
const makeRangeCfi = (a, b) => {
    const CFI = new ePub.CFI()
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

let currentPageText
const speakCurrentPage = () => {
    const currentLoc = rendition.currentLocation()
    book.getRange(makeRangeCfi(currentLoc.start.cfi, currentLoc.end.cfi))
        .then(range => {
            currentPageText = range.toString()
            dispatch({ type: 'speech-start' })
        })
}

const setupRendition = () => {
    rendition.on("layout", layout =>
        document.getElementById('divider').style.display =
            layout.spread && document.getElementById('viewer').clientWidth >= 800
                ? 'block' : 'none')

    rendition.on('rendered', section => {
        dispatch({ type: 'section', payload: section.href })
        redrawAnnotations()
    })
    rendition.on('relocated', location => {
        if (shouldUpdateSlider)
            dispatch({
                type: 'update-slider',
                payload: location.start.percentage
            })
        else shouldUpdateSlider = true
        dispatch({
            type: 'relocated',
            payload: {
                atStart: location.atStart,
                atEnd: location.atEnd,
                cfi: location.start.cfi,
                index: book.spine.get(location.start.cfi).index
            }
        })
    })

    // see https://github.com/futurepress/epub.js/issues/809
    let latestViewElement
    rendition.on("rendered", (section, view) => {
        latestViewElement = view.element
    })
    rendition.hooks.content.register((contents, view) => {
        const html = contents.document.documentElement
        if (!html.getAttribute('lang') && book.package.metadata.language)
            html.setAttribute('lang', book.package.metadata.language)

        const asides = contents.document.querySelectorAll('aside')
        Array.from(asides).forEach(aside => {
            const type = aside.getAttribute('epub:type')
            if (type === 'footnote') aside.style.display = 'none'
        })
        const links = contents.document.querySelectorAll('a:link')
        Array.from(links).forEach(link => {
            link.addEventListener('click', e => {
                const type = link.getAttribute('epub:type')
                const href = link.getAttribute('href')
                if (href.indexOf("mailto:") === 0 || href.indexOf("://") > -1)
                    dispatch({ type: 'link-external', payload: href })
                else if (type !== 'noteref' && !footnoteEnabled) dispatch({
                    type: 'link-internal',
                    payload: rendition.currentLocation().start.cfi
                })
                else {
                    const [page, id] = href.split('#')
                    let el = contents.document.getElementById(id)
                    if (!el) return dispatch({
                        type: 'link-internal',
                        payload: rendition.currentLocation().start.cfi
                    })

                    if (el.nodeName === 'A' && el.getAttribute('href')) {
                        while (true) {
                            const parent = el.parentElement
                            if (!parent) break
                            const text = el.innerText
                            el = parent
                            if (parent.innerText !== text) break
                        }
                    }

                    const rect = e.target.getBoundingClientRect()
                    const viewElementRect = latestViewElement.getBoundingClientRect()
                    const left = rect.left + viewElementRect.left
                    const right = rect.right + viewElementRect.left
                    const top = rect.top + viewElementRect.top
                    const bottom = rect.bottom + viewElementRect.top

                    footnote = el.innerText.trim()
                    followLink = () => {
                        dispatch({
                            type: 'link-internal',
                            payload: rendition.currentLocation().start.cfi
                        })
                        link.onclick()
                    }
                    if (footnote) dispatch({
                        type: 'footnote',
                        payload: { left, right, top, bottom, canGoTo: !(type === 'noteref') }
                    })
                    else followLink()
                    e.stopPropagation()
                    e.preventDefault()
                }
            }, true)
        })

        const imgs = contents.document.querySelectorAll('img')
        Array.from(imgs).forEach(img => {
            img.addEventListener('click', e => {
                const rect = e.target.getBoundingClientRect()
                const viewElementRect = latestViewElement.getBoundingClientRect()
                const left = rect.left + viewElementRect.left
                const right = rect.right + viewElementRect.left
                const top = rect.top + viewElementRect.top
                const bottom = rect.bottom + viewElementRect.top

                const src = img.getAttribute('src')
                imgAlt = img.getAttribute('alt')
                fetch(src)
                    .then(res => res.blob())
                    .then(blob => {
                        const reader = new FileReader()
                        reader.readAsDataURL(blob)
                        reader.onloadend = () => {
                            imgBase64 = reader.result.split(',')[1]
                            dispatch({
                                type: 'img',
                                payload: { left, right, top, bottom }
                            })
                        }
                    })
            }, false)
        })

        contents.document.onmouseup = () => {
            const selection = contents.window.getSelection()

            if (!selection.rangeCount)
                return // see https://stackoverflow.com/q/22935320

            const range = selection.getRangeAt(0)
            if (range.collapsed) return

            const text = selection.toString().trim().replace(/\n/g, ' ')
            if (text === '') return

            const cfiRange = new ePub.CFI(range, contents.cfiBase).toString()

            selectionData = {
                language: book.package.metadata.language,
                text,
                cfiRange
            }
            clearSelection = () => contents.window.getSelection().removeAllRanges()

            const rect = selection.getRangeAt(0).getBoundingClientRect()
            const viewElementRect = latestViewElement.getBoundingClientRect()

            const left = rect.left + viewElementRect.left
            const right = rect.right + viewElementRect.left
            const top = rect.top + viewElementRect.top
            const bottom = rect.bottom + viewElementRect.top

            dispatch({
                type: 'selection',
                payload: {
                    left, right, top, bottom,
                    isSingle: text.split(' ').length === 1
                }
            })
        }

        let timeout
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
            if (e.screenX === screenX && e.screenY === screenY) return
            screenX = e.screenX, screenY = e.screenY
            showCursor()
            if (timeout) clearTimeout(timeout)
            if (autohideCursor) timeout = setTimeout(hideCursor, 1000)
        }, false)
    })
}
const addAnnotation = (cfiRange, color) => {
    rendition.annotations.remove(cfiRange, 'highlight')
    rendition.annotations.highlight(cfiRange, {}, e => {
        const elRect = e.target.getBoundingClientRect()
        dispatch({
            type: 'annotation-menu',
            payload: {
                cfiRange,
                position: {
                    left: elRect.left,
                    right: elRect.right,
                    top: elRect.top,
                    bottom: elRect.bottom
                }
            }
        })
    }, 'hl', { fill: color, 'fill-opacity': 0.25, 'mix-blend-mode': 'multiply' })
}

dispatch({ type: 'can-open' })
