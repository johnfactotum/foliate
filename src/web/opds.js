let baseURI

// very simple OPDS parser
// the basic idea is derived from https://github.com/SamyPesse/xml-schema

const getContent = el => {
    const type = el.getAttribute('type')
    if (['html', 'xhtml', 'text/html', 'application/xhtml+xml'].includes(type)) {
        const str = el.innerHTML
        if (str.includes('<')) return toPangoMarkup(str)
        else return toPangoMarkup(unescapeHTML(str))
    } else return trim(el.textContent)
}

const link = {
    tag: 'link',
    array: true,
    attrs: {
        href: { transform: x => new URL(x, baseURI).href },
        rel: {},
        type: {},
        title: {},
        count: { ns: THR_NS },
        facetGroup: { ns: OPDS_NS },
        activeFacet: { ns: OPDS_NS, transform: x => x === 'true' }
    },
    fields: {
        price: {
            ns: OPDS_NS,
            content: 'value',
            attrs: {
                currencycode: {}
            }
        },
        indirectAcquisition: {
            ns: OPDS_NS,
            recursive: true,
            attrs: {
                type: {}
            }
        }
    }
}
const author = {
    tag: 'author',
    array: true,
    fields: { name: {}, uri: {} }
}
const entry = {
    tag: 'entry',
    array: true,
    fields: {
        id: {},
        title: {},
        published: {},
        updated: {},
        summary: {},
        links: link,
        authors: author,
        categories: {
            tag: 'category',
            array: true,
            attrs: { term: {}, label: {}, scheme: {} }
        },
        identifiers: {
            tag: 'identifier',
            array: true,
            ns: DC_NS
        },
        publisher: { ns: DC_NS },
        language: { ns: DC_NS },
        issued: { ns: DC_TERMS_NS },
        extent: { ns: DC_TERMS_NS },
        sources: {
            tag: 'source',
            array: true,
            ns: DC_NS
        },
        rights: {},
        content: {
            manual: true,
            transform: getContent
        },
    }
}
const feed = {
    tag: 'feed',
    fields: {
        id: {},
        title: {},
        subtitle: {},
        icon: {},
        updated: {},
        links: link,
        authors: author,
        entries: entry
    }
}

const parse = (el, schema) => {
    const attrs = schema.attrs || {}
    const fields = schema.fields || {}
    const attrList = Object.keys(attrs)
    const fieldList = Object.keys(fields)
    if (schema.manual) return schema.transform(el)
    if (!attrList.length && !fieldList.length) {
        const transform = schema.transform || trim
        return transform(el.textContent)
    }
    const output = {}
    if (schema.content) {
        const transform = schema.transform || trim
        output[schema.content] = transform(el.textContent)
    }
    attrList.forEach(key => {
        const attr = attrs[key]
        const attrName = attr.name || key
        let value
        if (!attr.ns) {
            value = el.getAttribute(attrName)
        } else if (Array.isArray(attr.ns)) {
            value = attr.ns.map(ns => el.getAttributeNS(ns, attrName))
                .find(x => x)
        } else {
            value = el.getAttributeNS(attr.ns, attrName)
        }
        const transform = attr.transform || trim
        output[key] = transform(value)
    })
    fieldList.forEach(key => {
        const field = fields[key]
        const tagName = field.tag || key

        let tags = []
        if (!field.ns) tags = Array.from(el.children)
            .filter(child => child.tagName === tagName)
        else if (Array.isArray(field.ns)) {
            for (const ns of field.ns) {
                tags = Array.from(el.children)
                    .filter(child => child.localName === tagName
                        && child.namespaceURI === ns)
                if (tags.length) break
            }
        } else tags = Array.from(el.children)
            .filter(child => child.localName === tagName
                && child.namespaceURI === field.ns)

        if (!tags.length) return
        const values = field.recursive
            ? tags.map(tag => parse(tag, Object.assign({ fields: { [key]: field } }, field)))
            : tags.map(tag => parse(tag, field))
        output[key] = field.array ? values : values[0] || undefined
    })
    return output
}

const getImage = async (src, token) => {
    try {
        const res = await fetch(src)
        const blob = await res.blob()

        const reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onloadend = () => {
            const base64 = reader.result.split(',')[1]
            dispatch({
                type: 'image',
                payload: base64,
                token
            })
        }
    } catch (e) {
        dispatch({
            type: 'error',
            payload: e.toString(),
            token
        })
    }
}

const fetchWithAuth = (resource, init) => {
    if (typeof resource !== 'string') return fetch(resource, init)
    const url = new URL(resource)
    const { username, password } = url
    if (!username) return fetch(resource, init)
    dispatch({ type: 'auth', payload: { username, password } })
    url.username = ''
    url.password = ''
    const req = new Request(url.toString(), init)
    return fetch(req)
}

let myfeed
const getFeed = (uri, token) => {
    baseURI = uri
    const parser = new DOMParser()
    fetchWithAuth(uri)
        .then(res => res.text())
        .then(text => parser.parseFromString(text, 'text/xml'))
        .then(doc => {
            const tagName = doc.documentElement.tagName
            if (tagName === 'entry') {
                const payload = parse(doc.documentElement, entry)
                payload.isEntry = true
                dispatch({ type: 'entry', payload, token })
            } else if (tagName === 'feed') {
                const payload = parse(doc.documentElement, feed)
                myfeed = payload
                payload.isEntry = false
                dispatch({ type: 'feed', payload, token })
            } else
                throw new Error(`root element is "${tagName}"; should be "feed" or "entry"`)
        })
        .catch(e => dispatch({
            type: 'error',
            payload: e.toString(),
            token
        }))
}

const getOpenSearch = (query, uri, token) => {
    const parser = new DOMParser()
    fetch(uri)
        .then(res => res.text())
        .then(text => parser.parseFromString(text, 'text/xml'))
        .then(doc => {
            const urls = doc.querySelectorAll('Url')
            const url = Array.from(urls).find(url =>
                url.getAttribute('type').includes('application/atom+xml'))

            if (!url) throw new Error('could not find an OpenSearch Url of Atom type')

            // really naive handling of OpenSearch template, probably bad
            const template = url.getAttribute('template')
            const result = template.replace('{searchTerms}', query)
            const payload = new URL(result, uri).href
            dispatch({ type: 'opensearch', payload, token })
        })
        .catch(e => dispatch({
            type: 'error',
            payload: e.toString(),
            token
        }))
}

dispatch({ type: 'ready' })
