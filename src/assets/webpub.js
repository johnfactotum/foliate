const webpubFromText = async uri => {
    const res = await fetch(uri)
    const data = await res.text()

    const chapters = data.split(/(\r?\n){3,}/g)
        .filter(x => !/^\r?\n$/.test(x))
        .map(c => {
            const ps = c.split(/(\r?\n){2}/g)
                .filter(x => !/^\r?\n$/.test(x))
            const blob = new Blob(
                [ps.map(p => `<p>${p}</p>`).join('')],
                { type: 'text/html' })
            const url = URL.createObjectURL(blob)
            return {
                href: url,
                type: 'text/html',
                title: ps[0].replace(/\r?\n/g, '')
            }
        })

    return {
        metadata: {},
        links: [],
        readingOrder: chapters,
        toc: chapters,
        resources: []
    }
}

const XLINK_NS = 'http://www.w3.org/1999/xlink'

let fb2doc // useful for debugging
const webpubFromFB2 = async uri => {
    const res = await fetch(uri)
    const buffer = await res.arrayBuffer()
    const decoder = new TextDecoder('utf-8')
    const data = decoder.decode(buffer)
    let doc = new DOMParser().parseFromString(data, 'text/xml')
    if (doc.xmlEncoding !== 'utf-8') {
        const decoder = new TextDecoder(doc.xmlEncoding)
        const data = decoder.decode(buffer)
        doc = new DOMParser().parseFromString(data, 'text/xml')
    }
    fb2doc = doc
    const $ = doc.querySelector.bind(doc)
    const $$ = doc.querySelectorAll.bind(doc)
    const h = html => {
        const el = doc.createElement('template')
        el.innerHTML = html
        return el.firstChild
    }

    // FIXME: elements could be null
    const title = $('book-title').textContent
    const identifier = $('id').textContent
    const description = $('title-info annotation').textContent
    const language = $('lang').textContent

    const getImage = image => {
        const id = image.getAttributeNS(XLINK_NS, 'href').replace(/^#/, '')
        const bin = doc.getElementById(id)
        const type = bin.getAttribute('content-type')
        return {
            content: bin.textContent,
            data: `data:${type};base64,${bin.textContent}`,
            type
        }
    }

    try {
        const { content } = getImage($('coverpage image'))
        dispatch({ type: 'cover', payload: content })
    } catch (e) {}

    const sections = Array.from($$('body > section')).map(x => {
        const sectionTitle = x.querySelector('title')

        Array.from(x.querySelectorAll('title'))
            .forEach(el => el.parentNode.replaceChild(h(`<h2>${el.textContent}</h2>`), el))
        Array.from(x.querySelectorAll('subtitle'))
            .forEach(el => el.parentNode.replaceChild(h(`<h3>${el.textContent}</h3>`), el))
        Array.from(x.querySelectorAll('image'))
            .forEach(el => el.parentNode.replaceChild(h(`<img src="${getImage(el).data}">`), el))
        Array.from(x.querySelectorAll('empty-line'))
            .forEach(el => el.parentNode.replaceChild(h(`<br>`), el))
        Array.from(x.querySelectorAll('style'))
            .forEach(el => usurp(el))
        Array.from(x.querySelectorAll('emphasis'))
            .forEach(el => el.innerHTML = `<em>${el.innerHTML}</em>`)

        const html = `<!DOCTYPE html>${x.innerHTML}`
        const blob = new Blob([html], { type: 'text/html' })
        const url = URL.createObjectURL(blob)

        return {
            href: url,
            type: 'text/html',
            title: sectionTitle ? sectionTitle.textContent : title
        }
    })

    return {
        metadata: {
            title,
            identifier,
            description,
            language
        },
        links: [],
        readingOrder: sections,
        toc: sections,
        resources: []
    }
}
