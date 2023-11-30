const NS = {
    ATOM: 'http://www.w3.org/2005/Atom',
}

const MIME = {
    XML: 'application/xml',
    ATOM: 'application/atom+xml',
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

const filterNS = (doc, ns) => {
    // ignore the namespace if it doesn't appear in document at all
    const useNS = doc.lookupNamespaceURI(null) === ns || doc.lookupPrefix(ns)
    return useNS
        ? name => el => el.namespaceURI === ns && el.localName === name
        : name => el => el.localName === name
}

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

const getImageLink = links => {
    for (const R of REL.IMG) {
        const link = links.find(filterRel(r => r === R))
        if (link) return link
    }
}

const renderFeed = (doc, baseURL) => {
    const filter = filterNS(doc, NS.ATOM)
    const children = Array.from(doc.documentElement.children)

    const resolveHref = href => href ? resolveURL(href, baseURL) : null
    const getHref = link => resolveHref(link?.getAttribute('href'))

    const container = document.createElement('div')
    container.classList.add('container')
    for (const entry of children.filter(filter('entry'))) {
        const children = Array.from(entry.children)
        const links = children.filter(filter('link'))
        const acqLinks = links.filter(filterRel(r => r.startsWith(REL.ACQ)))

        if (acqLinks.length) {
            const item = document.createElement('opds-pub')
            item.setAttribute('heading', children.find(filter('title'))?.textContent ?? '')
            const src = getHref(getImageLink(links))
            if (src) item.setAttribute('image', src)
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

    document.body.replaceChildren(hgroup, container)
}

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
