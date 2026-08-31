import '../common/widgets.js'
import { REL, SYMBOL, isOPDSCatalog, getPublication, getFeed, getSearch, getOpenSearch } from '../foliate-js/opds.js'

const emit = x => globalThis.webkit.messageHandlers.opds
    .postMessage(JSON.stringify(x))

const MIME = {
    XML: 'application/xml',
    ATOM: 'application/atom+xml',
    XHTML: 'application/xhtml+xml',
    HTML: 'text/html',
    OPENSEARCH: 'application/opensearchdescription+xml',
}

const PAGINATION = Symbol('pagination')

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

const formatElementList = async els => {
    const arr = els.slice(0)
    return (await globalThis.formatList(els.map(() => '%s')))
        .split(/(%s)/g)
        .map(str => str === '%s' ? arr.shift() : document.createTextNode(str))
}

customElements.define('opds-nav', class extends HTMLElement {
    static observedAttributes = ['heading', 'count', 'description', 'href']
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
            case 'count':
                this.#root.querySelector('#count').textContent = val
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
    static observedAttributes = ['heading', 'author', 'price', 'image', 'href']
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
            case 'author':
                this.#root.querySelector('#author').textContent = val
                break
            case 'price':
                this.#root.querySelector('#price').textContent = val
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
    static observedAttributes = ['description', 'progress']
    #root = this.attachShadow({ mode: 'closed' })
    constructor() {
        super()
        this.attachInternals().role = 'article'
        const template = document.querySelector('#opds-pub-full')
        this.#root.append(template.content.cloneNode(true))

        const frame = this.#root.querySelector('iframe')
        frame.onload = () => {
            const doc = frame.contentDocument
            const sheet = new doc.defaultView.CSSStyleSheet()
            sheet.replaceSync(`
            html, body {
                color-scheme: light dark;
                font: menu;
                font-size: 11pt;
                margin: 0;
                overflow-wrap: anywhere;
            }
            a:any-link {
                color: highlight;
            }`)
            doc.adoptedStyleSheets = [sheet]
            const updateHeight = () => frame.style.height =
                `${doc.documentElement.getBoundingClientRect().height}px`
            updateHeight()
            new ResizeObserver(updateHeight).observe(doc.documentElement)
        }
    }
    attributeChangedCallback(name, _, val) {
        switch (name) {
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

const renderLanguageMap = async x => {
    if (!x) return ''
    if (typeof x === 'string') return x
    const keys = Object.keys(x)
    return x[(await globalThis.matchLocales(keys))[0]] ?? x.en ?? x[keys[0]]
}

const renderLinkedObject = (object, baseURL) => {
    const a = document.createElement('a')
    const link = object.links?.find(link => isOPDSCatalog(link.type)) ?? object.links?.[0]
    if (link) a.href = '?url=' + encodeURIComponent(resolveURL(link.href, baseURL))
    return a
}

const renderContributor = async (contributor, baseURL) => {
    if (!contributor) return []
    const as = await Promise.all([contributor ?? []].flat().map(async contributor => {
        const a = renderLinkedObject(contributor, baseURL)
        a.textContent = typeof contributor === 'string' ? contributor
            : await renderLanguageMap(contributor.name)
        if (contributor.position != null) {
            const span = document.createElement('span')
            span.textContent = contributor.position
            // TODO: localize this
            return [a, document.createTextNode('\u00a0'), span]
        }
        return a
    }))
    return (as.length <= 1 ? as : await formatElementList(as)).flat()
}

const renderContributorText = async contributor => {
    const arr = await Promise.all([contributor ?? []].flat().map(async contributor =>
        typeof contributor === 'string' ? contributor
        : await renderLanguageMap(contributor.name)))
    return globalThis.formatList(arr)
}

const renderAcquisitionButton = async (rel, links, callback) => {
    const label = globalThis.uiText.acq[rel] ?? globalThis.uiText.acq[REL.ACQ]
    const price = await globalThis.formatPrice(links[0].properties?.price)

    const button = document.createElement('button')
    button.classList.add('raised', 'pill')
    button.textContent = price ? `${label} · ${price}` : label
    button.onclick = () => callback(links[0].href, links[0].type)
    button.dataset.rel = rel
    if (links.length === 1) return button
    else {
        const menuButton = document.createElement('foliate-menubutton')
        const menuButtonButton = document.createElement('button')
        menuButtonButton.classList.add('raised', 'pill')
        menuButton.append(menuButtonButton)
        const icon = document.createElement('foliate-symbolic')
        icon.setAttribute('src', '/icons/hicolor/scalable/actions/pan-down-symbolic.svg')
        menuButtonButton.append(icon)
        const menu = document.createElement('foliate-menu')
        menu.slot = 'menu'
        menuButton.append(menu)

        for (const link of links) {
            const type = parseMediaType(link.properties?.indirectAcquisition?.at(-1)?.type
                ?? link.type)?.mediaType
            const price = await globalThis.formatPrice(links[0].properties?.price)

            const menuitem = document.createElement('button')
            menuitem.role = 'menuitem'
            menuitem.textContent = (link.title || await globalThis.formatMime(type))
                + (price ? ' · ' + price : '')
            menuitem.onclick = () => callback(link.href, link.type)
            menu.append(menuitem)
        }

        const div = document.createElement('div')
        div.classList.add('split-button')
        div.replaceChildren(button, menuButton)
        div.dataset.rel = rel
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
        if (link.rel === 'self' || link.rel?.includes('self'))
            li.ariaCurrent = 'true'
        return li
    }))
    section.append(h, l)
    return section
})

const renderImages = (images, isThumbnail, baseURL) => {
    const img = document.createElement('img')
    img.loading = 'lazy'
    const hasSizes = images?.filter(link => link.width > 0 && link.height > 0)
    if (hasSizes?.length) {
        const widest = hasSizes.reduce((state, link) => {
            if (link.width >= state.width) state.link = link
            return state
        }, { width: 0 }).link
        img.width = widest.width
        img.height = widest.height
        img.srcset = hasSizes.map(link =>
            `${resolveURL(link.href, baseURL)} ${link.width}w`).join(',')
    }
    else {
        img.width = 120
        img.height = 180
        const map = groupByArray(images, link => link.rel)
        const getByRels = rels => rels.flatMap(rel => map.get(rel) ?? [])[0] ?? images?.[0]
        const src = isThumbnail ? resolveURL(getByRels(REL.THUMBNAIL)?.href, baseURL)
            : resolveURL(getByRels(REL.COVER)?.href, baseURL)
        if (src) img.src = src
    }
    return img
}

const renderIdentifier = identifier => {
    if (!identifier) return
    const el = document.createElement('code')
    el.textContent = identifier
    return [el]
}

const renderContent = (value, type, baseURL) => {
    const doc = type === 'xhtml'
        ? document.implementation.createDocument('http://www.w3.org/1999/xhtml', 'html')
        : document.implementation.createHTMLDocument()
    if (type === 'xhtml') {
        doc.documentElement.append(doc.createElement('head'))
        doc.documentElement.append(doc.createElement('body'))
    }
    const meta = doc.createElement('meta')
    meta.setAttribute('http-equiv', 'Content-Security-Policy')
    meta.setAttribute('content', "default-src 'none';")
    const base = doc.createElement('base')
    base.href = baseURL
    doc.head.append(meta, base)
    if (!type || type === 'text') doc.body.textContent = value
    else doc.body.innerHTML = value
    return new Blob([new XMLSerializer().serializeToString(doc)],
        { type: type === 'xhtml' ? MIME.XHTML : MIME.HTML })
}

const renderGroups = async (groups, baseURL) => (await Promise.all(groups.map(async (group, groupIndex) => {
    const { metadata, links, publications, navigation } = group

    const paginationItems = group[PAGINATION]?.map((links, i) => {
        links ??= []
        const a = renderLinkedObject({ links }, baseURL)
        a.textContent = globalThis.uiText.pagination[i]
        return a
    })
    const pagination = paginationItems?.filter(a => a.href)?.length
        ? document.createElement('nav') : null
    if (pagination) pagination.append(...paginationItems)

    const container = document.createElement('div')
    container.classList.add('container')
    container.replaceChildren(...await Promise.all((publications ?? navigation).map(async (item, itemIndex) => {
        const isPub = 'metadata' in item
        const el = document.createElement(isPub ? 'opds-pub' : 'opds-nav')
        if (isPub) {
            const linksByRel = groupByArray(item.links, link => link.rel)
            el.setAttribute('heading', await renderLanguageMap(item.metadata.title))
            el.setAttribute('author', await renderContributorText(item.metadata.author))
            el.setAttribute('price', (await globalThis.formatPrice(
                item.links?.find(link => link.properties?.price)?.properties?.price))
                || (linksByRel.has(REL.ACQ + '/open-access')
                    ? globalThis.uiText.openAccess : ''))
            const img = renderImages(item.images, true, baseURL)
            img.slot = 'image'
            el.append(img)
            const alternate = linksByRel.get('alternate')?.find(link => {
                const parsed = parseMediaType(link.type)
                if (!parsed) return
                return parsed.mediaType === MIME.ATOM
                    && parsed.parameters.profile === 'opds-catalog'
                    && parsed.parameters.type === 'entry'
            })
            el.setAttribute('href', alternate?.href
                ? '?url=' + encodeURIComponent(resolveURL(alternate.href, baseURL))
                : '#' + groupIndex + ',' + itemIndex)
        } else {
            el.setAttribute('heading', item.title ?? '')
            el.setAttribute('count', await globalThis.formatNumber(item.properties?.numberOfItems))
            el.setAttribute('description', item[SYMBOL.SUMMARY] ?? '')
            const href = resolveURL(item.href, baseURL)
            el.setAttribute('href', '?url=' + encodeURIComponent(href))
        }
        return el
    })))
    if (!metadata) return pagination ? [container, pagination] : container

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

const renderPublication = async (pub, baseURL) => {
    const item = document.createElement('opds-pub-full')
    const token = new Date() + Math.random()
    entryMap.set(token, new WeakRef(item))
    const download = (href, type) => {
        href = resolveURL(href, baseURL)
        if (parseMediaType(type)?.mediaType === MIME.HTML) {
            location = href
            return
        }
        item.setAttribute('downloading', '')
        item.removeAttribute('progress')
        emit({ type: 'download', href, token })
    }

    const cancelButton = document.createElement('button')
    cancelButton.slot = 'cancel'
    cancelButton.title = globalThis.uiText.cancel
    item.append(cancelButton)
    const icon = document.createElement('foliate-symbolic')
    icon.setAttribute('src', '/icons/hicolor/scalable/actions/stop-sign-symbolic.svg')
    cancelButton.append(icon)
    cancelButton.addEventListener('click', () => emit({ type: 'cancel', token }))

    const img = renderImages(pub.images, false, baseURL)
    img.slot = 'image'
    item.append(img)

    const metadata = pub.metadata ?? {}

    const hgroup = document.createElement('hgroup')
    hgroup.slot = 'heading'
    item.append(hgroup)
    const series = document.createElement('p')
    series.append(...await renderContributor(metadata.belongsTo?.series, baseURL))
    const h1 = document.createElement('h1')
    h1.textContent = await renderLanguageMap(metadata.title)
    const subtitle = document.createElement('p')
    subtitle.textContent = await renderLanguageMap(metadata.subtitle)
    hgroup.append(series, h1, subtitle)

    const authors = document.createElement('p')
    authors.slot = 'authors'
    item.append(authors)
    authors.append(...await renderContributor(metadata.author, baseURL))

    const blob = metadata[SYMBOL.CONTENT]
        ? renderContent(metadata[SYMBOL.CONTENT].value, metadata[SYMBOL.CONTENT].type, baseURL)
        : metadata.description ? renderContent(metadata.description, 'html', baseURL) : null
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

    for (const [k, v] of [
        ['publisher', await renderContributor(metadata.publisher, baseURL)],
        ['published', await globalThis.formatDate(metadata.published)],
        ['language', await globalThis.formatList(
            await Promise.all([metadata.language ?? []].flat()
                .map(x => globalThis.formatLanguage(x))))],
        ['identifier', renderIdentifier(metadata.identifier)],
    ]) {
        if (!v?.length) continue
        const tr = document.createElement('tr')
        const th = document.createElement('th')
        const td = document.createElement('td')
        tr.append(th, td)
        th.textContent = globalThis.uiText.metadata[k]
        td.append(...v)
        if (td.textContent.length > 30) tr.classList.add('long')
        table.append(tr)
    }

    const tags = document.createElement('div')
    tags.role = 'list'
    details.append(tags)
    tags.append(...[metadata.subject ?? []].flat().map(subject => {
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

const renderEntry = (pub, baseURL) => {
    document.querySelector('#stack').showChild(document.querySelector('#entry'))
    return renderPublication(pub, baseURL)
        .then(el => document.querySelector('#entry').append(el))
}

const renderFeed = async (feed, baseURL) => {
    const { navigation, publications } = feed
    const linksByRel = groupByArray(feed.links, link => link.rel)
    const pagination = ['first', 'previous', 'next', 'last']
        .map(rel => linksByRel.get(rel))
    feed.groups = [
        navigation ? { navigation, [PAGINATION]: !publications ? pagination : null } : null,
        publications ? { publications, [PAGINATION]: pagination } : null,
        ...(feed.groups ?? []),
    ].filter(x => x)

    const templatedSearch = linksByRel.get('search')
        ?.find(link => isOPDSCatalog(link.type) && link.templated)
    const atomSearch = templatedSearch ? null
        // can't find where this is specced, and it makes no sense,
        // but it's used by calibre and Thorium Reader
        // so apparently it's a thing...
        : linksByRel.get('search')?.find(link =>
            parseMediaType(link.type)?.mediaType === MIME.ATOM
            && link.href?.includes('{searchTerms}'))
    globalThis.state = {
        title: feed.metadata?.title,
        self: resolveURL(linksByRel.get('self')?.[0]?.href, baseURL) || baseURL,
        start: resolveURL(linksByRel.get('start')?.[0]?.href, baseURL),
        search: templatedSearch || atomSearch ? '#search'
        : resolveURL(linksByRel.get('search')
            ?.find(link => parseMediaType(link.type).mediaType === MIME.OPENSEARCH)?.href, baseURL),
        searchEnabled: true,
    }
    globalThis.updateState()

    document.querySelector('#feed h1').textContent = await renderLanguageMap(feed.metadata?.title)
    document.querySelector('#feed p').textContent = await renderLanguageMap(feed.metadata?.subtitle)

    document.querySelector('#feed main').append(...await renderGroups(feed.groups, baseURL))
    if (feed.facets)
        document.querySelector('#nav').append(...renderFacets(feed.facets, baseURL))

    const update = () => {
        const hash = location.hash.slice(1)
        document.querySelector('#entry').replaceChildren()
        if (!hash || hash === 'nav')
            document.querySelector('#stack').showChild(document.querySelector('#feed'))
        else if (hash === 'search') {
            if (templatedSearch) getSearch(templatedSearch)
                .then(search => renderSearch(search, baseURL))
                .catch(e => console.error(e))
            else if (atomSearch) renderSearch({
                metadata: { title: atomSearch.title },
                // NOTE: no full OpenSearch support here
                search: map => resolveURL(atomSearch.href.replaceAll('{searchTerms}',
                    encodeURIComponent(map.get(null).get('searchTerms'))), baseURL),
                params: [{ name: 'searchTerms' }],
            })
        }
        else {
            const [groupIndex, itemIndex] = hash.split(',').map(x => parseInt(x))
            const group = feed.groups[groupIndex]
            const items = group.publications ?? group.navigation
            renderEntry(items[itemIndex], baseURL)
                .catch(e => console.error(e))
        }
        globalThis.state.searchEnabled = hash !== 'search'
        globalThis.updateState()
    }
    addEventListener('hashchange', update)
    update()
}

const renderSearch = (search, baseURL) => {
    document.querySelector('#search form').onsubmit = e => {
        e.preventDefault()
        const map = new Map()
        for (const input of document.querySelectorAll('#search input[data-param]')) {
            const { value } = input
            const { ns = null, param } = input.dataset
            if (map.has(ns)) map.get(ns).set(param, value)
            else map.set(ns, new Map([[param, value]]))
        }
        location = '?url=' + encodeURIComponent(resolveURL(search.search(map), baseURL))
    }

    document.querySelector('#search h1').textContent = search.metadata.title ?? ''
    document.querySelector('#search p').textContent = search.metadata.description ?? ''

    document.querySelector('#search-params').replaceChildren(...search.params.map(obj => {
        const input = document.createElement('input')
        if (obj.ns) input.dataset.ns = obj.ns
        input.dataset.param = obj.name
        input.required = obj.required
        input.type = 'search'
        input.value = obj.value ?? ''

        const label = document.createElement('label')
        const span = document.createElement('span')
        span.textContent = obj.name === 'searchTerms' || obj.name === 'query'
            ? globalThis.uiText.query
            : globalThis.uiText.metadata[obj.name] ?? obj.name
        label.append(span, input)

        const p = document.createElement('p')
        p.append(label)
        return p
    }))
    document.querySelector('#stack').showChild(document.querySelector('#search'))
    document.querySelector('#search input').focus()
}

globalThis.updateState = () => emit({ type: 'state', state: globalThis.state })

document.querySelector('#loading h1').textContent = globalThis.uiText.loading
document.querySelector('#error h1').textContent = globalThis.uiText.error
document.querySelector('#error button').textContent = globalThis.uiText.reload
document.querySelector('#error button').onclick = () => location.reload()
document.querySelector('#feed a[href="#nav"]').title = globalThis.uiText.filter
document.querySelector('#search button').textContent = globalThis.uiText.search

try {
    const params = new URLSearchParams(location.search)
    const res = await fetch(params.get('url'))
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    const url = res.url
    const text = await res.text()
    if (text.startsWith('<')) {
        const doc = new DOMParser().parseFromString(text, MIME.XML)
        const { documentElement: { localName } } = doc
        if (localName === 'feed') await renderFeed(getFeed(doc), url)
        else if (localName === 'entry') await renderEntry(getPublication(doc.documentElement), url)
        else if (localName === 'OpenSearchDescription') renderSearch(getOpenSearch(doc), url)
        else {
            const contentType = res.headers.get('Content-Type') ?? MIME.HTML
            const type = parseMediaType(contentType)?.mediaType ?? MIME.HTML
            const doc = new DOMParser().parseFromString(text, type)
            if (!doc.head) throw new Error('document has no head')
            const base = doc.head.querySelector('base')
            if (base) base.href = resolveURL(base.getAttribute('href'), url)
            else {
                const base = doc.createElement('base')
                base.href = url
                doc.head.append(base)
            }
            const link = Array.from(doc.head.querySelectorAll('link'))
                .find(link => isOPDSCatalog(link.type))
            if (!link) throw new Error('document has no link to OPDS feeds')
            location.replace('?url=' + encodeURIComponent(link.href))
        }
    }
    else {
        const feed = JSON.parse(text)
        await renderFeed(feed, url)
    }
} catch (e) {
    console.error(e)
    document.querySelector('#error p').innerText = e.message + '\n' + e.stack
    document.querySelector('#stack').showChild(document.querySelector('#error'))
    globalThis.updateState()
}
