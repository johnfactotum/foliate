import './widgets.js'

const emit = x => globalThis.webkit.messageHandlers.opds
    .postMessage(JSON.stringify(x))

const NS = {
    ATOM: 'http://www.w3.org/2005/Atom',
    OPDS: 'http://opds-spec.org/2010/catalog',
    THR: 'http://purl.org/syndication/thread/1.0',
    DC: 'http://purl.org/dc/elements/1.1/',
    DCTERMS: 'http://purl.org/dc/terms/',
    XHTML: 'http://www.w3.org/1999/xhtml',
}

const MIME = {
    XML: 'application/xml',
    ATOM: 'application/atom+xml',
    XHTML: 'application/xhtml+xml',
    HTML: 'text/html',
    OPENSEARCH: 'application/opensearchdescription+xml',
    OPDS2: 'application/opds+json',
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

const SYMBOL = {
    FACET_GROUP: Symbol('facetGroup'),
    ACTIVE_FACET: Symbol('activeFacet'),
    SUMMARY: Symbol('summary'),
    CONTENT: 'http://invalid.invalid/#' + Math.random(),
}

const groupByArray = (arr, f) => {
    const map = new Map()
    if (arr) for (const el of arr) {
        const keys = f(el)
        for (const key of [keys].flat()) {
            const group = map.get(key)
            if (group) group.push(el)
            else map.set(key, [el])
        }
    }
    return map
}

const filterKeys = (map, f) => Array.from(map, ([key, val]) =>
    f(key) ? [key, val] : null).filter(x => x)

const resolveURL = (url, relativeTo) => {
    if (!url) return ''
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
    if (!str) return null
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
    const parsed = parseMediaType(str)
    if (!parsed) return false
    const { mediaType, parameters } = parsed
    if (mediaType !== MIME.ATOM && mediaType !== MIME.OPDS2) return false
    if (!parameters.profile) return true
    return parameters.profile.toLowerCase() === 'opds-catalog'
}

// ignore the namespace if it doesn't appear in document at all
const useNS = (doc, ns) =>
    doc.lookupNamespaceURI(null) === ns || doc.lookupPrefix(ns) ? ns : null

const filterNS = ns => ns
    ? name => el => el.namespaceURI === ns && el.localName === name
    : name => el => el.localName === name

const formatElementList = async els => {
    const arr = els.slice(0)
    return (await globalThis.formatList(els.map(() => '%s')))
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
                overflow-wrap: anywhere;
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

const getContent = el => {
    if (!el) return
    const type = el.getAttribute('type')
    const value = type === 'xhtml' ? el.innerHTML
        : type === 'html' ? el.textContent
            .replaceAll('&lt;', '<')
            .replaceAll('&gt;', '>')
            .replaceAll('&amp;', '&')
        : el.textContent
    return { value, type }
}

const getPrice = link => {
    const price = link.getElementsByTagNameNS(NS.OPDS, 'price')[0]
    return price ? {
        currency: price.getAttribute('currencycode'),
        value: price.textContent,
    } : null
}

const getLink = link => ({
    rel: link.getAttribute('rel')?.split(/ +/),
    href: link.getAttribute('href'),
    type: link.getAttribute('type'),
    title: link.getAttribute('title'),
    properties: {
        price: getPrice(link),
        numberOfItems: link.getAttributeNS(NS.THR, 'count'),
    },
    [SYMBOL.FACET_GROUP]: link.getAttributeNS(NS.OPDS, 'facetGroup'),
    [SYMBOL.ACTIVE_FACET]: link.getAttributeNS(NS.OPDS, 'activeFacet') === 'true',
})

const getPublication = (entry, filter) => {
    const children = Array.from(entry.children)
    const filterDCEL = filterNS(NS.DC)
    const filterDCTERMS = filterNS(NS.DCTERMS)
    const filterDC = x => {
        const a = filterDCEL(x), b = filterDCTERMS(x)
        return y => a(y) || b(y)
    }
    const links = children.filter(filter('link')).map(getLink)
    const linksByRel = groupByArray(links, link => link.rel)
    return {
        metadata: {
            title: children.find(filter('title'))?.textContent ?? '',
            author: children.filter(filter('author')).map(person => {
                const NS = person.namespaceURI
                const uri = person.getElementsByTagNameNS(NS, 'uri')[0]?.textContent
                return {
                    name: person.getElementsByTagNameNS(NS, 'name')[0]?.textContent ?? '',
                    links: uri ? [{ href: uri }] : [],
                }
            }),
            publisher: children.find(filterDC('publisher'))?.textContent,
            published: (children.find(filterDCTERMS('issued'))
                ?? children.find(filterDC('date')))?.textContent,
            language: children.find(filterDC('language'))?.textContent,
            identifier: children.find(filterDC('identifier'))?.textContent,
            subject: children.filter(filter('category')).map(category => ({
                name: category.getAttribute('label'),
                code: category.getAttribute('term'),
            })),
            [SYMBOL.CONTENT]: getContent(children.find(filter('content'))
                ?? children.find(filter('summary'))),
        },
        links,
        images: REL.IMG.map(R => linksByRel.get(R)?.[0]).filter(x => x),
    }
}

const getFeed = doc => {
    const ns = useNS(doc, NS.ATOM)
    const filter = filterNS(ns)
    const children = Array.from(doc.documentElement.children)
    const entries = children.filter(filter('entry'))
    const links = children.filter(filter('link')).map(getLink)
    const linksByRel = groupByArray(links, link => link.rel)

    const groupedItems = new Map([[null, []]])
    const groupLinkMap = new Map()
    for (const entry of entries) {
        const children = Array.from(entry.children)
        const linksByRel = groupByArray(children.filter(filter('link')).map(getLink), link => link.rel)
        const isPub = [...linksByRel.keys()].some(rel => rel?.startsWith(REL.ACQ))

        const groupLinks = linksByRel.get(REL.GROUP) ?? linksByRel.get('collection')
        const groupLink = groupLinks?.length
            ? groupLinks.find(link => groupedItems.has(link.href)) ?? groupLinks[0] : null
        if (groupLink && !groupLinkMap.has(groupLink.href))
            groupLinkMap.set(groupLink.href, groupLink)

        const item = isPub
            ? getPublication(entry, filter)
            : Object.assign(linksByRel.values().next().value?.[0], {
                title: children.find(filter('title'))?.textContent,
                [SYMBOL.SUMMARY]: children.find(filter('content'))?.textContent ?? '',
            })

        const arr = groupedItems.get(groupLink?.href ?? null)
        if (arr) arr.push(item)
        else groupedItems.set(groupLink.href, [item])
    }
    return {
        metadata: {
            title: children.find(filter('title'))?.textContent,
            subtitle: children.find(filter('subtitle'))?.textContent,
        },
        links,
        groups: Array.from(groupedItems, ([key, val]) => {
            const link = groupLinkMap.get(key)
            return {
                metadata: link ? {
                    title: link.title,
                    numberOfItems: link.properties.numberOfItems,
                } : null,
                links: link ? [{ rel: 'self', href: link.href, type: link.type }] : [],
                [val[0]?.metadata ? 'publications' : 'navigation']: val,
            }
        }),
        facets: Array.from(
            groupByArray(linksByRel.get(REL.FACET) ?? [], link => link[SYMBOL.FACET_GROUP]),
            ([facet, links]) => ({ metadata: { title: facet }, links })),
    }
}

const renderLanguageMap = async x => {
    if (!x) return ''
    if (typeof x === 'string') return x
    const keys = Object.keys(x)
    return x[(await globalThis.matchLocales(keys))[0]] ?? x.en ?? x[keys[0]]
}

const renderLinkedObject = (object, baseURL) => {
    const a = document.createElement('a')
    if (object.links?.length) {
        for (const link of object.links) if (isOPDSCatalog(link.type)) {
            a.href = '?url=' + encodeURIComponent(resolveURL(link.href, baseURL))
            return a
        }
        a.href = resolveURL(object.links[0].href, baseURL)
    }
    return a
}

const renderContributor = async (contributor, baseURL) => {
    if (!contributor) return
    const as = await Promise.all([contributor ?? []].flat().map(async contributor => {
        const a = renderLinkedObject(contributor, baseURL)
        a.innerText = typeof contributor === 'string' ? contributor
            : await renderLanguageMap(contributor.name)
        return a
    }))
    return as.length <= 1 ? as : await formatElementList(as)
}

const renderAcquisitionButton = async (rel, links, callback) => {
    const label = globalThis.uiText.acq[rel] ?? globalThis.uiText.acq[REL.ACQ]
    const priceData = links[0].properties?.price
    const price = priceData ? await globalThis.formatPrice(priceData) : null

    const button = document.createElement('button')
    button.innerText = price ? `${label} · ${price}` : label
    button.onclick = () => callback(links[0].href)
    if (links.length === 1) return button
    else {
        const menuButton = document.createElement('foliate-menubutton')
        const icon = document.createElement('foliate-symbolic')
        icon.setAttribute('src', '/icons/hicolor/scalable/actions/pan-down-symbolic.svg')
        menuButton.append(icon)
        const menu = document.createElement('foliate-menu')
        menu.slot = 'menu'
        menuButton.append(menu)

        for (const link of links) {
            const type = parseMediaType(link.type)?.mediaType
            const priceData = links[0].properties?.price
            const price = priceData ? await globalThis.formatPrice(priceData) : null

            const menuitem = document.createElement('button')
            menuitem.role = 'menuitem'
            menuitem.textContent = (link.title || await globalThis.formatMime(type))
                + (price ? ' · ' + price : '')
            menuitem.onclick = () => callback(link.href)
            menu.append(menuitem)
        }

        const div = document.createElement('div')
        div.classList.add('split-button')
        div.replaceChildren(button, menuButton)
        return div
    }
}

const renderAcquisitionButtons = (links, callback) =>
    Promise.all(filterKeys(links, rel => rel.startsWith(REL.ACQ))
        .map(([rel, links]) => renderAcquisitionButton(rel, links, callback)))

const renderFacets = (facets, baseURL) => facets.map(({ metadata, links }) => {
    const section = document.createElement('section')
    const h = document.createElement('h3')
    h.textContent = metadata.title ?? ''
    const l = document.createElement('ul')
    l.append(...links.map(link => {
        const li = document.createElement('li')
        const a = document.createElement('a')
        const href = resolveURL(link.href, baseURL)
        a.href = isOPDSCatalog(link.type) ? '?url=' + encodeURIComponent(href) : href
        const title = link.title ?? ''
        a.title = title
        a.textContent = title
        li.append(a)
        const count = link.properties?.numberOfItems
        if (count) {
            const span = document.createElement('span')
            span.textContent = count
            li.append(span)
        }
        if (link[SYMBOL.ACTIVE_FACET] || link.rel === 'self' || link.rel?.includes('self'))
            li.ariaCurrent = 'true'
        return li
    }))
    section.append(h, l)
    return section
})

const renderGroups = async (groups, baseURL) => (await Promise.all(groups.map(async ({ metadata, links, publications, navigation }) => {
    const container = document.createElement('div')
    container.classList.add('container')
    container.replaceChildren(...await Promise.all((publications ?? navigation).map(async item => {
        const isPub = 'metadata' in item
        const el = document.createElement(isPub ? 'opds-pub' : 'opds-nav')
        if (isPub) {
            el.setAttribute('heading', await renderLanguageMap(item.metadata.title))
            const src = resolveURL(item.images?.[0]?.href, baseURL)
            if (src) el.setAttribute('image', src)
            el.setAttribute('href', '#' + encodeURIComponent(JSON.stringify(item)))
        } else {
            el.setAttribute('heading', item.title ?? '')
            el.setAttribute('description', item[SYMBOL.SUMMARY] ?? '')
            const href = resolveURL(item.href, baseURL)
            el.setAttribute('href', isOPDSCatalog(item.type)
                ? '?url=' + encodeURIComponent(href) : href)
        }
        return el
    })))
    if (!metadata) return container

    const div = document.createElement('div')
    const h = document.createElement('h2')
    h.textContent = metadata.title ?? ''
    div.append(h)
    const link = groupByArray(links, link => link.rel).get('self')?.[0]
    if (link) {
        const a = document.createElement('a')
        const url = resolveURL(link.href, baseURL)
        a.href = isOPDSCatalog(link.type) ? '?url=' + encodeURIComponent(url) : url
        a.textContent = globalThis.uiText.viewCollection
        div.append(a)
    }
    div.classList.add('carousel-header')
    container.classList.add('carousel')
    return [document.createElement('hr'), div, container]
}))).flat()

const entryMap = new Map()
globalThis.updateProgress = ({ progress, token }) =>
    entryMap.get(token)?.deref()?.setAttribute('progress', progress)
globalThis.finishDownload = ({ token }) =>
    entryMap.get(token)?.deref()?.removeAttribute('downloading')

const renderContent = (value, type, baseURL) => {
    const doc = type === 'xhtml'
        ? document.implementation.createDocument(NS.XHTML, 'html')
        : document.implementation.createHTMLDocument()
    if (type === 'xhtml') {
        doc.documentElement.append(doc.createElement('head'))
        doc.documentElement.append(doc.createElement('body'))
    }
    const base = doc.createElement('base')
    base.href = baseURL
    doc.head.append(base)
    if (!type || type === 'text') doc.body.textContent = value
    else doc.body.innerHTML = value
    return new Blob([new XMLSerializer().serializeToString(doc)],
        { type: type === 'xhtml' ? MIME.XHTML : MIME.HTML })
}

// TODO: handle localized strings etc. in webpub
const renderPublication = async (pub, baseURL) => {
    const item = document.createElement('opds-pub-full')
    const token = new Date() + Math.random()
    entryMap.set(token, new WeakRef(item))
    item.addEventListener('cancel-download', () => emit({ type: 'cancel', token }))
    const download = href => {
        href = resolveURL(href, baseURL)
        item.setAttribute('downloading', '')
        item.removeAttribute('progress')
        emit({ type: 'download', href, token })
    }

    const src = resolveURL(pub.images?.[0]?.href, baseURL)
    if (src) item.setAttribute('image', src)

    item.setAttribute('heading', await renderLanguageMap(pub.metadata.title))

    const authors = document.createElement('div')
    authors.slot = 'authors'
    item.append(authors)
    authors.append(...await renderContributor(pub.metadata.author, baseURL))

    const blob = pub.metadata[SYMBOL.CONTENT]
        ? renderContent(pub.metadata[SYMBOL.CONTENT].value, pub.metadata[SYMBOL.CONTENT].type, baseURL)
        : pub.metadata.description ? renderContent(pub.metadata.description, 'html', baseURL) : null
    if (blob) item.setAttribute('description', URL.createObjectURL(blob))

    const actions = document.createElement('div')
    item.append(actions)
    actions.slot = 'actions'
    actions.append(...await renderAcquisitionButtons(groupByArray(pub.links, link => link.rel), download))

    const details = document.createElement('div')
    details.slot = 'details'
    item.append(details)
    const table = document.createElement('table')
    details.append(table)

    for (const [k, v = pub.metadata[k]] of [
        ['publisher', await renderContributor(pub.metadata.publisher, baseURL)],
        ['published', await globalThis.formatDate(pub.metadata.published)],
        ['language', await globalThis.formatList(
            await Promise.all([pub.metadata.language ?? []].flat()
                .map(x => globalThis.formatLanguage(x))))],
        ['identifier'],
    ]) {
        if (!v) continue
        const tr = document.createElement('tr')
        const th = document.createElement('th')
        const td = document.createElement('td')
        tr.append(th, td)
        th.textContent = globalThis.uiText.metadata[k]
        if (v[0].nodeType != null) td.append(...v)
        else td.textContent = v
        if (v.length > 30) tr.classList.add('long')
        table.append(tr)
    }

    const tags = document.createElement('div')
    tags.role = 'list'
    details.append(tags)
    tags.append(...[pub.metadata.subject ?? []].flat().map(subject => {
        const li = document.createElement('div')
        li.role = 'listitem'
        const icon = document.createElement('foliate-symbolic')
        icon.setAttribute('src', '/icons/hicolor/scalable/actions/tag-symbolic.svg')
        const a = renderLinkedObject(subject, baseURL)
        a.textContent = typeof subject === 'string' ? subject : subject.name ?? subject.code
        li.append(icon, a)
        return li
    }))

    return item
}

const renderFeed = async (feed, baseURL) => {
    const linksByRel = groupByArray(feed.links, link => link.rel)
    const searchLink = linksByRel.get('search')
        ?.find(link => parseMediaType(link.type).mediaType === MIME.OPENSEARCH)
    if (searchLink) document.body.dataset.searchUrl = resolveURL(searchLink.href, baseURL)
    else delete document.body.dataset.searchUrl
    globalThis.updateSearchURL()

    document.querySelector('#feed h1').textContent = await renderLanguageMap(feed.metadata.title)
    document.querySelector('#feed p').textContent = await renderLanguageMap(feed.metadata.subtitle)

    document.querySelector('#feed main').append(...await renderGroups(feed.groups, baseURL))
    if (feed.facets)
        document.querySelector('#nav').append(...renderFacets(feed.facets, baseURL))

    addEventListener('hashchange', () => {
        const hash = location.hash.slice(1)
        if (!hash) {
            document.body.dataset.state = 'feed'
            document.querySelector('#entry').replaceChildren()
        } else {
            document.body.dataset.state = 'entry'
            const pub = JSON.parse(decodeURIComponent(hash))
            renderPublication(pub, baseURL)
                .then(el => document.querySelector('#entry').append(el))
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
        if (localName === 'feed') await renderFeed(getFeed(doc), url)
        else if (localName === 'entry') throw new Error('todo')
        else if (localName === 'OpenSearchDescription') renderOpenSearch(doc, url)
        else throw new Error(`root element is <${localName}>; expected <feed> or <entry>`)
    }
    else {
        const feed = JSON.parse(text)
        const { navigation, publications } = feed
        feed.groups = [
            navigation ? { navigation } : null,
            publications ? { publications } : null,
            ...(feed.groups ?? []),
        ].filter(x => x)
        await renderFeed(feed, url)
    }
} catch (e) {
    console.error(e)
}
