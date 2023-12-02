import './widgets.js'

const NS = {
    ATOM: 'http://www.w3.org/2005/Atom',
    OPDS: 'http://opds-spec.org/2010/catalog',
}

const MIME = {
    XML: 'application/xml',
    ATOM: 'application/atom+xml',
    XHTML: 'application/xhtml+xml',
    HTML: 'text/html',
}

const REL = {
    ACQ: 'http://opds-spec.org/acquisition',
    IMG: [
        'http://opds-spec.org/image',
        'http://opds-spec.org/cover',
        'http://opds-spec.org/image/thumbnail',
        'http://opds-spec.org/thumbnail',
    ],
}

const groupBy = (arr, f) => {
    const map = new Map()
    for (const el of arr) {
        const key = f(el)
        const group = map.get(key)
        if (group) group.push(el)
        else map.set(key, [el])
    }
    return map
}

const resolveURL = (url, relativeTo) => {
    try {
        if (relativeTo.includes(':')) return new URL(url, relativeTo)
        // the base needs to be a valid URL, so set a base URL and then remove it
        const root = 'https://invalid.invalid/'
        const obj = new URL(url, root + relativeTo)
        obj.search = ''
        return decodeURI(obj.href.replace(root, ''))
    } catch(e) {
        console.warn(e)
        return url
    }
}

// https://www.rfc-editor.org/rfc/rfc7231#section-3.1.1
const parseMediaType = str => {
    const [mediaType, ...ps] = str.split(/ *; */)
    return {
        mediaType: mediaType.toLowerCase(),
        parameters: Object.fromEntries(ps.map(p => {
            const [name, val] = p.split('=')
            return [name.toLowerCase(), val?.replace(/(^"|"$)/g, '')]
        })),
    }
}

const isOPDSCatalog = str => {
    const { mediaType, parameters } = parseMediaType(str)
    return mediaType === MIME.ATOM
        && parameters.profile?.toLowerCase() !== 'opds-catalog'
}

// ignore the namespace if it doesn't appear in document at all
const useNS = (doc, ns) =>
    doc.lookupNamespaceURI(null) === ns || doc.lookupPrefix(ns) ? ns : null

const filterNS = ns => ns
    ? name => el => el.namespaceURI === ns && el.localName === name
    : name => el => el.localName === name

const filterRel = f => el => el.getAttribute('rel')?.split(/ +/)?.some(f)

customElements.define('opds-nav', class extends HTMLElement {
    static observedAttributes = ['heading', 'description', 'href']
    #root = this.attachShadow({ mode: 'closed' })
    constructor() {
        super()
        this.attachInternals().role = 'listitem'
        const template = document.querySelector('#opds-nav')
        this.#root.append(template.content.cloneNode(true))
    }
    attributeChangedCallback(name, _, val) {
        switch (name) {
            case 'heading':
                this.#root.querySelector('h1 a').textContent = val
                break
            case 'description':
                this.#root.querySelector('p').textContent = val
                break
            case 'href':
                this.#root.querySelector('a').href = val
                break
        }
    }
})

customElements.define('opds-pub', class extends HTMLElement {
    static observedAttributes = ['heading', 'image', 'href']
    #root = this.attachShadow({ mode: 'closed' })
    constructor() {
        super()
        this.attachInternals().role = 'listitem'
        const template = document.querySelector('#opds-pub')
        this.#root.append(template.content.cloneNode(true))
    }
    attributeChangedCallback(name, _, val) {
        switch (name) {
            case 'heading':
                this.#root.querySelector('h1 a').textContent = val
                break
            case 'image':
                this.#root.querySelector('img').src = val
                break
            case 'href':
                this.#root.querySelector('a').href = val
                break
        }
    }
})

customElements.define('opds-pub-full', class extends HTMLElement {
    static observedAttributes = ['heading', 'author', 'image', 'description']
    #root = this.attachShadow({ mode: 'closed' })
    constructor() {
        super()
        this.attachInternals().role = 'article'
        const template = document.querySelector('#opds-pub-full')
        this.#root.append(template.content.cloneNode(true))

        const frame = this.#root.querySelector('iframe')
        frame.onload = () => {
            const doc = frame.contentDocument
            const $style = doc.createElement('style')
            doc.head.append($style)
            $style.textContent = `html, body {
                color-scheme: light dark;
                font-family: system-ui;
                margin: 0;
            }
            a:any-link {
                color: highlight;
            }`
            const updateHeight = () => frame.style.height =
                `${doc.documentElement.getBoundingClientRect().height}px`
            updateHeight()
            new ResizeObserver(updateHeight).observe(doc.documentElement)
        }
    }
    attributeChangedCallback(name, _, val) {
        switch (name) {
            case 'heading':
                this.#root.querySelector('h1').textContent = val
                break
            case 'author':
                this.#root.querySelector('p').textContent = val
                break
            case 'image':
                this.#root.querySelector('img').src = val
                break
            case 'description':
                this.#root.querySelector('iframe').src = val
                break
        }
    }
})

const getImageLink = links => {
    for (const R of REL.IMG) {
        const link = links.find(filterRel(r => r === R))
        if (link) return link
    }
}

const getPrice = link => {
    const price = link.getElementsByTagNameNS(NS.OPDS, 'price')[0]
    return price ? globalThis.formatPrice({
        currency: price.getAttribute('currencycode'),
        value: price.textContent,
    }) : null
}

const getContent = (el, baseURL) => {
    if (!el) return ''
    const type = el.getAttribute('type')
    const str = type === 'xhtml'
        ? `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head><base href="${baseURL}"/></head>
    <body>${el.innerHTML}</body>
</html>`
        : `<!DOCTYPE html>
            <base href="${baseURL}"><body>` + (type === 'html' ? el.textContent
            .replaceAll('&lt;', '<')
            .replaceAll('&gt;', '>')
            .replaceAll('&amp;', '&')
        : el.textContent)
    const blob = new Blob([str], { type: type === 'xhtml' ? MIME.XHTML : MIME.HTML })
    return URL.createObjectURL(blob)
}

const renderEntry = async (entry, filter, getHref, baseURL) => {
    const children = Array.from(entry.children)
    const links = children.filter(filter('link'))
    const acqLinks = links.filter(filterRel(r => r.startsWith(REL.ACQ)))

    const item = document.createElement('opds-pub-full')
    item.setAttribute('heading', children.find(filter('title'))?.textContent ?? '')
    item.setAttribute('author', children.find(filter('author'))?.getElementsByTagName('name')?.[0]?.textContent ?? '')
    item.setAttribute('description', getContent(
        children.find(filter('content')) ?? children.find(filter('summary')), baseURL))
    const src = getHref(getImageLink(links))
    if (src) item.setAttribute('image', src)

    const actions = document.createElement('div')
    actions.slot = 'actions'
    item.append(actions)

    const groups = groupBy(acqLinks, link =>
        link.getAttribute('rel').split(/ +/).find(r => r.startsWith(REL.ACQ)))
    for (const [rel, links] of groups.entries()) {
        const label = globalThis.uiText.acq[rel]
            ?? globalThis.uiText.acq['http://opds-spec.org/acquisition']
        const price = await getPrice(links[0])

        const button = document.createElement('button')
        button.innerText = price ? `${label} · ${price}` : label
        if (links.length === 1) actions.append(button)
        else {
            const menuButton = document.createElement('foliate-menubutton')
            menuButton.innerText = '▼'
            const menu = document.createElement('foliate-menu')
            menu.slot = 'menu'
            menuButton.append(menu)

            for (const link of links) {
                const type = link.getAttribute('type')
                const title = link.getAttribute('title')
                const price = await getPrice(links[0])
                const menuitem = document.createElement('button')
                menuitem.role = 'menuitem'
                menuitem.textContent = (title || await globalThis.formatMime(type))
                    + (price ? ' · ' + price : '')
                menu.append(menuitem)
            }

            const div = document.createElement('div')
            div.classList.add('split-button')
            div.replaceChildren(button, menuButton)
            actions.append(div)
        }
    }
    return item
}

const renderFeed = (doc, baseURL) => {
    const ns = useNS(doc, NS.ATOM)
    const filter = filterNS(ns)
    const children = Array.from(doc.documentElement.children)
    const entries = children.filter(filter('entry'))

    const resolveHref = href => href ? resolveURL(href, baseURL) : null
    const getHref = link => resolveHref(link?.getAttribute('href'))

    const container = document.createElement('div')
    container.classList.add('container')
    for (const [i, entry] of entries.entries()) {
        const children = Array.from(entry.children)
        const links = children.filter(filter('link'))
        const acqLinks = links.filter(filterRel(r => r.startsWith(REL.ACQ)))

        if (acqLinks.length) {
            const item = document.createElement('opds-pub')
            item.setAttribute('heading', children.find(filter('title'))?.textContent ?? '')
            const src = getHref(getImageLink(links))
            if (src) item.setAttribute('image', src)
            item.setAttribute('href', '#' + i)
            container.append(item)
        } else {
            const item = document.createElement('opds-nav')
            item.setAttribute('heading', children.find(filter('title'))?.textContent ?? '')
            item.setAttribute('description', children.find(filter('content'))?.textContent ?? '')
            const href = getHref(links.find(el => isOPDSCatalog(el.getAttribute('type'))) ?? links[0])
            if (href) item.setAttribute('href', '?url=' + encodeURIComponent(href))
            container.append(item)
        }
    }
    const title = children.find(filter('title'))?.textContent
    const subtitle = children.find(filter('subtitle'))?.textContent

    const hgroup = document.createElement('hgroup')
    const h1 = document.createElement('h1')
    h1.textContent = title ?? ''
    const p = document.createElement('p')
    p.textContent = subtitle ?? ''
    hgroup.replaceChildren(h1, p)

    document.querySelector('#feed').replaceChildren(hgroup, container)

    addEventListener('hashchange', () => {
        const hash = location.hash.slice(1)
        const entry = entries[hash]
        if (!entry) {
            document.querySelector('#entry').style.visibility = 'hidden'
            document.querySelector('#feed').style.visibility = 'visible'
        } else {
            document.querySelector('#entry').style.visibility = 'visible'
            document.querySelector('#feed').style.visibility = 'hidden'
            renderEntry(entry, filter, getHref, baseURL).then(item =>
                document.querySelector('#entry').replaceChildren(item))
                .catch(e => console.error(e))
        }
        updateScrolledState()
    })
}

const updateScrolledState = () => {
    const el = document.querySelector('#entry').style.visibility === 'visible'
        ? document.querySelector('#entry') : document.querySelector('#feed')
    document.querySelector('#undershoot-top').hidden = 'scrolledToTop' in el.dataset
}
document.querySelector('#entry').addEventListener('change', updateScrolledState)
document.querySelector('#feed').addEventListener('change', updateScrolledState)

try {
    const params = new URLSearchParams(location.search)
    const url = params.get('url')
    const res = await fetch(url)
    if (!res.ok) throw new Error()
    const text = await res.text()
    if (text.startsWith('<')) {
        const doc = new DOMParser().parseFromString(text, MIME.XML)
        const { documentElement: { localName } } = doc
        if (localName === 'feed') renderFeed(doc, url)
        else if (localName === 'entry') throw new Error('todo')
        else throw new Error(`root element is <${localName}>; expected <feed> or <entry>`)
    }
    else {
        JSON.parse(text)
        // TODO: OPDS 2.0
    }
} catch (e) {
    console.error(e)
}
