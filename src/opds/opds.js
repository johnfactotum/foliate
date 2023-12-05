import './widgets.js'

const emit = x => globalThis.webkit.messageHandlers.opds
    .postMessage(JSON.stringify(x))

const NS = {
    ATOM: 'http://www.w3.org/2005/Atom',
    OPDS: 'http://opds-spec.org/2010/catalog',
    THR: 'http://purl.org/syndication/thread/1.0',
}

const MIME = {
    XML: 'application/xml',
    ATOM: 'application/atom+xml',
    XHTML: 'application/xhtml+xml',
    HTML: 'text/html',
    OPENSEARCH: 'application/opensearchdescription+xml',
}

const REL = {
    ACQ: 'http://opds-spec.org/acquisition',
    FACET: 'http://opds-spec.org/facet',
    GROUP: 'http://opds-spec.org/group',
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
        if (relativeTo.includes(':')) return new URL(url, relativeTo).toString()
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
        && parameters.profile?.toLowerCase() === 'opds-catalog'
}

// ignore the namespace if it doesn't appear in document at all
const useNS = (doc, ns) =>
    doc.lookupNamespaceURI(null) === ns || doc.lookupPrefix(ns) ? ns : null

const filterNS = ns => ns
    ? name => el => el.namespaceURI === ns && el.localName === name
    : name => el => el.localName === name

const filterRel = f => el => el.getAttribute('rel')?.split(/ +/)?.some(f)

const getInheritedAttributeNS = (el, ns, attr, defaultValue) => {
    if (!el) return defaultValue
    const lang = el.getAttributeNS(ns, attr)
    if (lang) return lang
    return getInheritedAttributeNS(el.parentElement, ns, attr, defaultValue)
}

const getXMLLang = el => getInheritedAttributeNS(el, NS.XML, 'lang', 'en')

const langToLocales = lang => {
    try { return new Intl.Locale(lang) }
    catch { return 'en' }
}

const formatElementList = (locales, els) => {
    const arr = els.slice(0)
    return new Intl.ListFormat(locales, { type: 'conjunction' })
        .format(els.map(() => '%s'))
        .split(/(%s)/g)
        .map(str => str === '%s' ? arr.shift() : document.createTextNode(str))
}

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
    static observedAttributes = ['heading', 'image', 'description', 'progress']
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

        const button = this.#root.querySelector('#downloading button')
        button.title = globalThis.uiText.cancel
        button.addEventListener('click', () =>
            this.dispatchEvent(new Event('cancel-download')))
    }
    attributeChangedCallback(name, _, val) {
        switch (name) {
            case 'heading':
                this.#root.querySelector('h1').textContent = val
                break
            case 'image':
                this.#root.querySelector('img').src = val
                break
            case 'description':
                this.#root.querySelector('iframe').src = val
                break
            case 'progress': {
                const progress = this.#root.querySelector('#downloading progress')
                if (val) progress.value = val
                else progress.removeAttribute('value')
                break
            }
        }
    }
    disconnectedCallback() {
        this.dispatchEvent(new Event('cancel-download'))
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

const entryMap = new Map()
globalThis.updateProgress = ({ progress, token }) =>
    entryMap.get(token)?.deref()?.setAttribute('progress', progress)
globalThis.finishDownload = ({ token }) =>
    entryMap.get(token)?.deref()?.removeAttribute('downloading')

const renderEntry = async (entry, filter, getHref, baseURL) => {
    const lang = getXMLLang(entry)
    const children = Array.from(entry.children)
    const links = children.filter(filter('link'))
    const acqLinks = links.filter(filterRel(r => r.startsWith(REL.ACQ)))

    const item = document.createElement('opds-pub-full')
    item.lang = lang
    item.setAttribute('heading', children.find(filter('title'))?.textContent ?? '')
    item.setAttribute('description', getContent(
        children.find(filter('content')) ?? children.find(filter('summary')), baseURL))
    const src = getHref(getImageLink(links))
    if (src) item.setAttribute('image', src)

    const authors = document.createElement('div')
    authors.slot = 'authors'
    item.append(authors)
    const authorAs = children.filter(filter('author')).map(person => {
        const NS = person.namespaceURI
        const uri = person.getElementsByTagNameNS(NS, 'uri')[0]?.textContent
        const a = document.createElement('a')
        a.innerText = person.getElementsByTagNameNS(NS, 'name')[0]?.textContent ?? ''
        // TODO: this might be a link to an OPDS catalog
        // actually I'm not sure if you're supposed to link to it at all
        if (uri) a.href = resolveURL(uri, baseURL)
        return a
    })
    authors.replaceChildren(...(authorAs.length <= 1 ? authorAs
        : formatElementList(langToLocales(lang), authorAs)))

    const actions = document.createElement('div')
    actions.slot = 'actions'
    item.append(actions)

    const token = new Date() + Math.random()
    entryMap.set(token, new WeakRef(item))
    item.addEventListener('cancel-download', () => emit({ type: 'cancel', token }))
    const download = href => {
        item.setAttribute('downloading', '')
        item.removeAttribute('progress')
        emit({ type: 'download', href, token })
    }

    const groups = groupBy(acqLinks, link =>
        link.getAttribute('rel').split(/ +/).find(r => r.startsWith(REL.ACQ)))
    for (const [rel, links] of groups.entries()) {
        const label = globalThis.uiText.acq[rel] ?? globalThis.uiText.acq[REL.ACQ]
        const price = await getPrice(links[0])

        const button = document.createElement('button')
        button.innerText = price ? `${label} · ${price}` : label
        button.onclick = () => download(getHref(links[0]))
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
                menuitem.onclick = () => download(getHref(link))
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
    const lang = getXMLLang(doc.documentElement)
    const children = Array.from(doc.documentElement.children)
    const entries = children.filter(filter('entry'))
    const links = children.filter(filter('link'))

    const resolveHref = href => href ? resolveURL(href, baseURL) : null
    const getHref = link => resolveHref(link?.getAttribute('href'))

    const searchURL = getHref(links.find(link => link.getAttribute('type') === MIME.OPENSEARCH))
    if (searchURL) document.body.dataset.searchUrl = searchURL
    else delete document.body.dataset.searchUrl
    globalThis.updateSearchURL()

    const items = []
    const groupedItems = new Map()
    const groups = new Map()
    for (const [i, entry] of entries.entries()) {
        const children = Array.from(entry.children)
        const links = children.filter(filter('link'))
        const acqLinks = links.filter(filterRel(r => r.startsWith(REL.ACQ)))

        const groupLinks = links.filter(filterRel(r => r === REL.GROUP || r === 'collection'))
        const groupLink = groupLinks.length
            ? groupLinks.find(link => groupedItems.has(link.getAttribute('href'))) ?? groupLinks[0] : null
        const groupHref = groupLink?.getAttribute('href')
        if (groupLink && !groups.has(groupHref)) groups.set(groupHref, {
            title: groupLink.getAttribute('title'),
            type: groupLink.getAttribute('type'),
        })

        const item = document.createElement(acqLinks.length ? 'opds-pub' : 'opds-nav')
        item.setAttribute('heading', children.find(filter('title'))?.textContent ?? '')
        if (acqLinks.length) {
            const src = getHref(getImageLink(links))
            if (src) item.setAttribute('image', src)
            item.setAttribute('href', '#' + i)
        } else {
            item.setAttribute('description', children.find(filter('content'))?.textContent ?? '')
            const href = getHref(links.find(el => isOPDSCatalog(el.getAttribute('type'))) ?? links[0])
            if (href) item.setAttribute('href', '?url=' + encodeURIComponent(href))
        }

        if (groupHref) {
            const arr = groupedItems.get(groupHref)
            if (arr) arr.push(item)
            else groupedItems.set(groupHref, [item])
        } else items.push(item)
    }

    const main = document.querySelector('#feed main')
    main.replaceChildren(...[[null, items], ...groupedItems.entries()].flatMap(([href, arr]) => {
        const container = document.createElement('div')
        container.classList.add('container')
        container.replaceChildren(...arr)
        if (href == null) return container

        const { title, type } = groups.get(href)
        const div = document.createElement('div')
        const h = document.createElement('h2')
        h.textContent = title
        const a = document.createElement('a')
        const url = resolveHref(href)
        a.href = isOPDSCatalog(type) ? '?url=' + encodeURIComponent(url) : url
        a.textContent = globalThis.uiText.viewCollection
        div.append(h, a)
        div.classList.add('carousel-header')
        container.classList.add('carousel')
        return [document.createElement('hr'), div, container]
    }))

    const facetLinks = links.filter(filterRel(r => r.startsWith(REL.FACET)))
    const facets = groupBy(facetLinks, link => link.getAttributeNS(NS.OPDS, 'facetGroup'))
    document.querySelector('#nav').replaceChildren(...Array.from(facets.entries(), ([facet, links]) => {
        const section = document.createElement('section')
        const h = document.createElement('h3')
        h.textContent = facet ?? ''
        const l = document.createElement('ul')
        l.append(...links.map(link => {
            const li = document.createElement('li')
            const a = document.createElement('a')
            const url = getHref(link)
            a.href = isOPDSCatalog(link.getAttribute('type')) ? '?url=' + encodeURIComponent(url) : url
            const title = link.getAttribute('title') ?? ''
            a.title = title
            a.textContent = title
            li.append(a)
            const count = link.getAttributeNS(NS.THR, 'count')
            if (count) {
                const span = document.createElement('span')
                span.textContent = count
                li.append(span)
            }
            if (link.getAttributeNS(NS.OPDS, 'activeFacet') === 'true')
                li.ariaCurrent = 'true'
            return li
        }))
        section.append(h, l)
        return section
    }))

    document.querySelector('#feed h1').textContent = children.find(filter('title'))?.textContent ?? ''
    document.querySelector('#feed p').textContent = children.find(filter('subtitle'))?.textContent ?? ''
    document.querySelector('#feed').lang = lang

    addEventListener('hashchange', () => {
        const hash = location.hash.slice(1)
        const entry = entries[hash]
        if (!entry) {
            document.body.dataset.state = 'feed'
            document.querySelector('#entry').replaceChildren()
        } else {
            document.body.dataset.state = 'entry'
            renderEntry(entry, filter, getHref, baseURL).then(item =>
                document.querySelector('#entry').replaceChildren(item))
                .catch(e => console.error(e))
        }
    })
    document.body.dataset.state = 'feed'
}

const renderOpenSearch = (doc, baseURL) => {
    const defaultNS = doc.documentElement.namespaceURI
    const filter = filterNS(defaultNS)
    const children = Array.from(doc.documentElement.children)

    const $$urls = children.filter(filter('Url'))
    const $url = $$urls.find(url => isOPDSCatalog(url.getAttribute('type'))) ?? $$urls[0]
    if (!$url) throw new Error('document must contain at least one Url element')

    const regex = /{(?:([^}]+?):)?(.+?)(\?)?}/g
    const defaultMap = new Map([
        ['count', '100'],
        ['startIndex', $url.getAttribute('indexOffset') ?? '0'],
        ['startPage', $url.getAttribute('pageOffset') ?? '0'],
        ['language', '*'],
        ['inputEncoding', 'UTF-8'],
        ['outputEncoding', 'UTF-8'],
    ])

    const template = resolveURL($url.getAttribute('template'), baseURL)
    const search = map => template.replace(regex, (_, prefix, param) => {
        const namespace = prefix ? $url.lookupNamespaceURI(prefix) : null
        const ns = namespace === defaultNS ? null : namespace
        const val = map.get(ns)?.get(param)
        return val ? val : (!ns ? defaultMap.get(param) ?? '' : '')
    })

    document.querySelector('#search form').onsubmit = e => {
        e.preventDefault()
        const map = new Map()
        for (const input of document.querySelectorAll('#search input[data-param]')) {
            const { value } = input
            const { ns = null, param } = input.dataset
            if (map.has(ns)) map.get(ns).set(param, value)
            else map.set(ns, new Map([[param, value]]))
        }
        location = '?url=' + encodeURIComponent(search(map))
    }

    document.querySelector('#search h1').textContent =
        (children.find(filter('LongName')) ?? children.find(filter('ShortName')))?.textContent ?? ''
    document.querySelector('#search p').textContent =
        children.find(filter('Description'))?.textContent ?? ''
    document.querySelector('#search button').textContent = globalThis.uiText.search

    document.body.dataset.state = 'search'
    const container = document.querySelector('#search-params')
    for (const [, prefix, param, optional] of template.matchAll(regex)) {
        const namespace = prefix ? $url.lookupNamespaceURI(prefix) : null
        const ns = namespace === defaultNS ? null : namespace

        const input = document.createElement('input')
        if (ns) input.dataset.ns = ns
        input.dataset.param = param
        input.required = !optional
        input.type = 'text'
        input.value = ns && ns !== defaultNS ? '' : defaultMap.get(param) ?? ''

        const label = document.createElement('label')
        const span = document.createElement('span')
        span.textContent = (ns === NS.ATOM
            ? globalThis.uiText.atomParams[param]
            : globalThis.uiText.openSearchParams[param] ?? param)
        label.append(span, input)

        const p = document.createElement('p')
        p.append(label)
        container.append(p)
    }
    container.querySelector('input').focus()
}

globalThis.updateSearchURL = () =>
    emit({ type: 'search', url: document.body.dataset.searchUrl })

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
        else if (localName === 'OpenSearchDescription') renderOpenSearch(doc, url)
        else throw new Error(`root element is <${localName}>; expected <feed> or <entry>`)
    }
    else {
        JSON.parse(text)
        // TODO: OPDS 2.0
    }
} catch (e) {
    console.error(e)
}
