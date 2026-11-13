// The macOS frontend shares the reader, pagination, format loaders, and footnotes
// with the GTK application. Only the window and its host bridge are different.
import { openBook, readerEvents } from '../reader/reader.js'
import { createTOCView } from '../foliate-js/ui/tree.js'

const send = (type, payload = {}) =>
    globalThis.webkit.messageHandlers.native.postMessage({ type, ...payload })
const $ = selector => document.querySelector(selector)
const report = error => {
    $('#mac-status').textContent = error.message
    send('error', { message: error.message })
}
const run = promise => Promise.resolve(promise).catch(report)

const stylesheet = document.createElement('link')
stylesheet.rel = 'stylesheet'
stylesheet.href = 'foliate://app/macos/reader.css'
document.head.append(stylesheet)

const shell = document.createElement('div')
shell.id = 'mac-shell'
shell.innerHTML = `
    <header id="mac-toolbar" aria-label="Reader controls">
        <button id="mac-open">Open…</button>
        <button id="mac-contents" aria-expanded="false">Contents</button>
        <span id="mac-title">Foliate</span>
        <button id="mac-smaller" aria-label="Decrease font size">A−</button>
        <button id="mac-larger" aria-label="Increase font size">A+</button>
        <label><input id="mac-scrolled" type="checkbox"> Scroll</label>
    </header>
    <div id="mac-body">
        <aside id="mac-sidebar" aria-label="Book contents and search" hidden>
            <form id="mac-search-form" role="search">
                <input id="mac-search" type="search" placeholder="Search this book"
                    aria-label="Search this book">
                <button>Find</button>
            </form>
            <p id="mac-search-status" role="status"></p>
            <ol id="mac-results"></ol>
            <nav id="mac-toc" aria-label="Table of contents"></nav>
        </aside>
        <main id="mac-book">
            <div id="mac-empty">
                <h1>Foliate</h1>
                <p>Open a book to start reading.</p>
                <button id="mac-open-empty">Open Book…</button>
            </div>
        </main>
    </div>
    <footer id="mac-navigation">
        <button id="mac-left" aria-label="Turn page left" disabled>←</button>
        <input id="mac-progress" type="range" min="0" max="1" step="0.0001"
            value="0" aria-label="Reading progress" disabled>
        <button id="mac-right" aria-label="Turn page right" disabled>→</button>
        <span id="mac-status" role="status">Choose a book</span>
    </footer>`
document.body.append(shell)

const uiText = {
    loc: 'Loc. %s of %s',
    page: 'Page %s of %s',
    pageWithoutTotal: 'Page %s',
    close: 'Close',
    references: { footnote: 'Footnote', 'footnote-go': 'Go to Footnote' },
}
globalThis.init({ uiText, openFile: false })
// Keep standard WKWebView selection and its native Copy context menu.
globalThis.showSelection = async () => null

let toc, bookError, opening = false, fontSize = 18, searchID = 0
let loaded = false
let activeURL
const view = () => loaded ? globalThis.reader?.view : null
const languageMap = value => typeof value === 'string' ? value
    : Object.values(value ?? {})[0] ?? ''
const appearance = () => globalThis.reader.setAppearance({
    style: {
        theme: {
            light: { bg: '#ffffff', fg: '#202020', link: '#245ab5' },
            dark: { bg: '#202020', fg: '#eeeeee', link: '#a1c6ff' },
            inverted: { fg: '#eeeeee', link: '#a1c6ff' },
        },
        lineHeight: 1.5,
        justify: true,
        hyphenate: true,
        invert: false,
        userStylesheet: `html { font-size: ${fontSize}px !important; }`,
    },
    layout: {
        flow: $('#mac-scrolled').checked ? 'scrolled' : 'paginated',
        gap: 0.06,
        maxInlineSize: 720,
        maxBlockSize: 1440,
        maxColumnCount: 2,
        animated: false,
    },
    autohideCursor: false,
})

const setSidebar = show => {
    $('#mac-sidebar').hidden = !show
    $('#mac-contents').setAttribute('aria-expanded', String(show))
}

const handleKey = event => {
    if (event.metaKey || event.ctrlKey || event.altKey
        || event.target.closest?.('input, textarea, [contenteditable="true"]')
        || $('#footnote-dialog').open) return
    const current = view()
    if (!current) return
    switch (event.key) {
        case 'ArrowLeft': event.preventDefault(); run(current.goLeft()); break
        case 'ArrowRight': event.preventDefault(); run(current.goRight()); break
        case 'PageDown': event.preventDefault(); run(current.next()); break
        case 'PageUp': event.preventDefault(); run(current.prev()); break
    }
}
document.addEventListener('keydown', handleKey)

let wheelTime = 0
const handleWheel = event => {
    const current = view()
    if (!current || $('#mac-scrolled').checked || $('#footnote-dialog').open
        || event.ctrlKey) return
    event.preventDefault()
    if (performance.now() - wheelTime < 250) return
    const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY)
    const delta = horizontal ? event.deltaX : event.deltaY
    if (Math.abs(delta) < 5) return
    wheelTime = performance.now()
    run(horizontal ? delta > 0 ? current.goRight() : current.goLeft()
        : delta > 0 ? current.next() : current.prev())
}
$('#mac-book').addEventListener('wheel', handleWheel, { passive: false })

readerEvents.addEventListener('book-error', ({ detail }) => {
    bookError = new Error(detail.message ?? {
        'not-found': 'The book is empty or could not be found.',
        'unsupported-type': 'This file format is not supported.',
    }[detail.id] ?? 'Unable to open this book.')
})
readerEvents.addEventListener('relocate', ({ detail }) => {
    if (!loaded) return
    const { fraction = 0, location, tocItem, cfi } = detail
    $('#mac-progress').value = fraction
    const percent = new Intl.NumberFormat(undefined, { style: 'percent' }).format(fraction)
    $('#mac-status').textContent = location
        ? `${percent} · Loc. ${location.current + 1} of ${location.total}` : percent
    if (tocItem?.href) toc?.setCurrentHref(tocItem.href)
    if (cfi) send('location', { cfi, url: activeURL })
})
readerEvents.addEventListener('external-link', ({ detail: { href } }) =>
    send('external-link', { href }))

async function search(query) {
    const id = ++searchID
    const current = view()
    $('#mac-results').replaceChildren()
    $('#mac-search-status').textContent = ''
    if (!current) return
    current.clearSearch()
    if (!query.trim()) return
    $('#mac-search-status').textContent = 'Searching…'
    let count = 0
    for await (const result of current.search({ query })) {
        if (id !== searchID) return
        for (const { cfi, excerpt } of result.subitems ?? []) {
            const button = document.createElement('button')
            button.textContent = `${excerpt.pre} → ${excerpt.match} ← ${excerpt.post}`
            button.onclick = () => run(current.select(cfi))
            const item = document.createElement('li')
            item.append(button)
            $('#mac-results').append(item)
            count++
            if (count >= 200) break
        }
        if (count >= 200) break
    }
    if (id === searchID) $('#mac-search-status').textContent =
        count >= 200 ? 'Showing the first 200 matches' : `${count} matches`
}

globalThis.macReader = {
    async open(url, name, lastLocation) {
        if (opening) throw new Error('Please wait for the current book to finish opening.')
        opening = true
        loaded = false
        activeURL = url
        searchID++
        bookError = null
        $('#mac-title').textContent = name
        $('#mac-status').textContent = 'Opening…'
        $('#mac-search').value = ''
        $('#mac-results').replaceChildren()
        $('#mac-search-status').textContent = ''
        for (const id of ['mac-left', 'mac-right', 'mac-progress']) $(`#${id}`).disabled = true
        try {
            const previous = globalThis.reader
            if (previous) {
                previous.view.close()
                previous.view.remove()
                previous.book.destroy?.()
                globalThis.reader = null
            }
            await openBook(url)
            if (bookError) throw bookError
            const { reader } = globalThis
            $('#mac-empty')?.remove()
            $('#mac-book').append(reader.view)
            reader.view.addEventListener('load', ({ detail: { doc } }) => {
                doc.addEventListener('keydown', handleKey)
                doc.addEventListener('wheel', handleWheel, { passive: false })
            })
            const title = languageMap(reader.book.metadata?.title) || name
            $('#mac-title').textContent = title
            document.title = title
            appearance()
            $('#mac-toc').replaceChildren()
            toc = null
            if (reader.book.toc?.length) {
                toc = createTOCView(reader.book.toc, href => run(reader.view.goTo(href)))
                $('#mac-toc').append(toc.element)
            }
            loaded = true
            await reader.view.init({ lastLocation, showTextStart: !lastLocation })
            $('#mac-progress').dir = reader.book.dir ?? 'ltr'
            for (const id of ['mac-left', 'mac-right', 'mac-progress']) $(`#${id}`).disabled = false
            send('opened', { title, sections: reader.book.sections.length })
        } catch (error) {
            loaded = false
            $('#mac-status').textContent = error.message
            throw error
        } finally { opening = false }
    },
    async command(name) {
        const current = view()
        switch (name) {
            case 'find': setSidebar(true); $('#mac-search').focus(); break
            case 'contents': setSidebar($('#mac-sidebar').hidden); break
            case 'next': await current?.next(); break
            case 'previous': await current?.prev(); break
            case 'increase-font': fontSize = Math.min(40, fontSize + 2); if (current) appearance(); break
            case 'decrease-font': fontSize = Math.max(10, fontSize - 2); if (current) appearance(); break
        }
    },
}

$('#mac-open').onclick = $('#mac-open-empty').onclick = () => send('open')
$('#mac-contents').onclick = () => run(globalThis.macReader.command('contents'))
$('#mac-left').onclick = () => run(view()?.goLeft())
$('#mac-right').onclick = () => run(view()?.goRight())
$('#mac-smaller').onclick = () => run(globalThis.macReader.command('decrease-font'))
$('#mac-larger').onclick = () => run(globalThis.macReader.command('increase-font'))
$('#mac-scrolled').onchange = () => { if (view()) appearance() }
$('#mac-progress').onchange = event => run(view()?.goToFraction(Number(event.target.value)))
$('#mac-search-form').onsubmit = event => {
    event.preventDefault()
    run(search($('#mac-search').value))
}
$('#mac-search').onsearch = event => { if (!event.target.value) run(search('')) }
send('ready')
