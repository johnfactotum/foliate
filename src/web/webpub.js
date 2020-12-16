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

// generate md5 hash for this many bytes
// I don't know if this is a good value.
// for me this seems like a fairly large value,
// but without noticeable performance impact
let hashByteLimit =  10 * 1000 * 1000

const readAsArrayBuffer = blob => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsBinaryString(blob)
    reader.onloadend = () => resolve(reader.result)
})

const generateIdentifier = async blob => 'foliate:'
    + CryptoJS.MD5(CryptoJS.enc.Latin1.parse(
        await readAsArrayBuffer(blob.slice(0, hashByteLimit)))).toString()

const webpubFromText = async (uri, filename) => {
    const res = await fetch(uri)
    const blob = await res.blob()
    const identifier = await generateIdentifier(blob)
    const text = await new Response(blob).text()

    const chapters = text.split(/(\r?\n){3,}/g)
        .filter(x => !/^\r?\n$/.test(x))
        .map(c => {
            const ps = c.split(/(\r?\n){2}/g)
                .filter(x => !/^\r?\n$/.test(x))
            const doc = document.implementation.createHTMLDocument()
            ps.forEach(p => {
                const el = doc.createElement('p')
                el.textContent = p
                doc.body.appendChild(el)
            })
            const blob = new Blob(
                [doc.documentElement.outerHTML],
                { type: 'text/html' })
            const url = URL.createObjectURL(blob)
            return {
                href: url,
                type: 'text/html',
                title: ps[0].replace(/\r?\n/g, '')
            }
        })

    return {
        metadata: {
            title: filename,
            identifier
        },
        links: [],
        readingOrder: chapters,
        toc: chapters,
        resources: []
    }
}

const getCharset = doc => {
    const meta = doc.querySelector('meta[charset]')
    if (meta) return meta.getAttribute('charset')
    else {
        const meta = doc.querySelector('meta[http-equiv="Content-Type"]')
        if (meta) {
            const content = meta.getAttribute('content')
            if (content) {
                const match = content.match(/charset=([^()<>@,;:\"/[\]?.=\s]*)/i)
                if (match) return match[0].split('=')[1]
            }
        }
    }
}

const webpubFromHTML = async (uri, filename, inputType) => {
    const type = inputType === 'xhmlt' ? 'application/xhtml+xml' : 'text/html'
    const res = await fetch(uri)
    const blob = await res.blob()
    const identifier = await generateIdentifier(blob)

    const buffer = await new Response(blob).arrayBuffer()
    const decoder = new TextDecoder('utf-8')
    const data = decoder.decode(buffer)

    let doc = new DOMParser().parseFromString(data, type)
    const charset = getCharset(doc)
    if (charset && charset !== 'utf-8') {
        const decoder = new TextDecoder(charset)
        const data = decoder.decode(buffer)
        doc = new DOMParser().parseFromString(data, type)
    }

    const url = URL.createObjectURL(new Blob(
        [doc.documentElement.outerHTML],
        { type }))

    const chapters = [{
        href: url,
        type,
        title: filename
    }]

    return {
        metadata: {
            title: filename,
            identifier
        },
        links: [],
        readingOrder: chapters,
        toc: chapters,
        resources: []
    }
}

const fb2FromBlob = async (blob, filename) => {
    const buffer = await new Response(blob).arrayBuffer()
    const decoder = new TextDecoder('utf-8')
    const data = decoder.decode(buffer)
    let doc = new DOMParser().parseFromString(data, 'text/xml')
    if (doc.xmlEncoding && doc.xmlEncoding !== 'utf-8') {
        const decoder = new TextDecoder(doc.xmlEncoding)
        const data = decoder.decode(buffer)
        doc = new DOMParser().parseFromString(data, 'text/xml')
    }
    return processFB2(doc, blob, filename)
}

const webpubFromFB2Zip = async (uri, filename) => {
    const res = await fetch(uri)
    const data = await res.blob()
    const zip = await JSZip.loadAsync(data)
    const blob = await zip.file(/\.fb2$/)[0].async('blob')
    return fb2FromBlob(blob, filename)
}

const webpubFromFB2 = async (uri, filename) => {
    const res = await fetch(uri)
    const blob = await res.blob()
    return fb2FromBlob(blob, filename)
}

const fb2Sections = new Map()

const fb2ToHtml = (fb2, node, itemFromElement, isSection) => {
    const walk = (fb2, node, f) => {
        const [output, childF, post = x => x] = f(fb2, node)
        node = node.firstChild
        while (node) {
            const childOutput = walk(fb2, node, childF || f)
            if (output.append) {
                const childNode = childOutput.cloneNode(true)
                output.append(childNode)
            }
            node = node.nextSibling
        }
        return post(output)
    }
    const getIdFromHref = href => {
        const [a, b] = href.split('#')
        return a ? null : b
    }
    const transferAttribute = (node, el, name) => {
        const attr = node.getAttribute(name)
        if (attr) el.setAttribute(name, attr)
    }

    const doc = document.implementation
        .createDocument(XHTML_NS, 'html')

    const transform = (node, tagName, ...attrs) => {
        const el = doc.createElement(tagName)
        attrs.forEach(transferAttribute.bind(null, node, el))
        return el
    }

    const text = (fb2, node) => [doc.createTextNode(node.textContent)]
    const image = (fb2, node) => {
        const href = node.getAttributeNS(XLINK_NS, 'href')

        const el = transform(node, 'img', 'alt', 'title')

        const id = getIdFromHref(href)
        const bin = fb2.getElementById(id)
        if (bin) {
            const type = bin.getAttribute('content-type')
            const content = bin.textContent
            const data = `data:${type};base64,${content}`
            el.setAttribute('src', data)
        }
        return [el]
    }
    const style = (fb2, node) => {
        switch (node.nodeName) {
            case 'emphasis':
                return [doc.createElement('em')]
            case 'strikethrough':
                return [doc.createElement('s')]
            case 'strong':
            case 'sub':
            case 'sup':
            case 'code':
                return [doc.createElement(node.nodeName)]
            case 'a': {
                const el = doc.createElement('a')
                if (node.getAttribute('type') === 'note')
                    el.setAttributeNS(EPUB_NS, 'epub:type', 'noteref')

                const href = node.getAttributeNS(XLINK_NS, 'href')
                const id = getIdFromHref(href)
                if (!id) {
                    el.setAttribute('href', href)
                    return [el]
                } else {
                    let note = fb2.getElementById(id)
                    if (!note) return [el]
                    while (!note.matches('body > *')) note = note.parentElement
                    let item = fb2Sections.get(note)
                    if (!item && itemFromElement) item = itemFromElement(note)
                    if (item) el.setAttribute('href', item.href + '#' + id)
                }
                return [el]
            }
            case 'image':
                return image(fb2, node)
        }
        return text(fb2, node)
    }
    const table = (fb2, node) => {
        switch (node.nodeName) {
            case 'table':
                return [doc.createElement(node.nodeName), table]
            case 'tr': {
                const el = doc.createElement(node.nodeName)
                transferAttribute(node, el, 'align')
                return [el, table]
            }
            case 'th':
            case 'td': {
                const el = doc.createElement(node.nodeName)
                transferAttribute(node, el, 'colspan')
                transferAttribute(node, el, 'rowspan')
                transferAttribute(node, el, 'align')
                transferAttribute(node, el, 'valign')
                return [el, style]
            }
        }
        return text(fb2, node)
    }
    const poem = (fb2, node) => {
        switch (node.nodeName) {
            case 'poem':
                return [doc.createElement('blockquote')]
            case 'title':
                return [doc.createElement('header'), title]
            case 'epigraph':
                return [doc.createElement('blockquote')]
            case 'subtitle':
                return [doc.createElement('h4'), style]
            case 'stanza':
                return [doc.createElement('p'), poem,  x => {
                    [...x.querySelectorAll('span')].forEach((x, i, arr) => {
                        if (i < arr.length - 1) x.append(doc.createElement('br'))
                        usurp(x)
                    })
                    return x
                }]
            case 'v':
                return [doc.createElement('span'), style]
            case 'text-author': {
                const el = doc.createElement('p')
                el.classList.add('text-author')
                return [el, style]
            }
            case 'date': {
                const el = doc.createElement('p')
                el.classList.add('date')
                return [el, style]
            }
        }
        return text(fb2, node)
    }
    const title = (fb2, node) => {
        switch (node.nodeName) {
            case 'p':
                return [doc.createElement('h1'), style]
            case 'empty-line':
                return [doc.createElement('br')]
        }
        return text(fb2, node)
    }
    const titleSection = (fb2, node) => {
        switch (node.nodeName) {
            case 'p':
                return [doc.createElement('h1'), style]
            case 'empty-line':
                return [doc.createElement('br')]
        }
        return text(fb2, node)
    }
    const section = (fb2, node) => {
        switch (node.nodeName) {
            case 'title':
                return [doc.createElement('header'), title]
            case 'section':
                return [transform(node, 'section', 'id')]
            case 'epigraph':
                return [transform(node, 'blockquote', 'id')]
            case 'annotation':
                return [doc.createElement('aside')]
            case 'subtitle':
                return [doc.createElement('h2'), style]
            case 'p':
                return [transform(node, 'p', 'id'), style]
            case 'cite':
                return [transform(node, 'blockquote', 'id'), section]
            case 'image':
                return image(fb2, node)
            case 'poem':
                return [transform(node, 'blockquote', 'id'), poem]
            case 'table':
                return [doc.createElement('table'), table]
            case 'empty-line':
                return [doc.createElement('br')]
            case 'text-author': {
                const el = doc.createElement('p')
                el.classList.add('text-author')
                return [el, style]
            }
        }
        return text(fb2, node)
    }
    const body = (fb2, node) => {
        switch (node.nodeName) {
            case 'image':
                return image(fb2, node)
            case 'title': {
                return [transform(node, 'header', 'id'), titleSection]
            }
            default:
                return [transform(node, 'section', 'id'), section]
        }
    }

    return walk(fb2, node, isSection ? section : body)
}

const processFB2 = async (fb2, blob, filename) => {
    const $ = x => fb2.querySelector(x)
    const $$ = x => [...fb2.querySelectorAll(x)]

    const getTextContent = x => {
        const el = typeof x === 'string' ? $(x) : x
        return el ? trim(el.textContent) : ''
    }
    const getAuthor = author => {
        const nick = getTextContent(author.querySelector('nickname'))
        if (nick) return nick
        else return [
            author.querySelector('first-name'),
            author.querySelector('middle-name'),
            author.querySelector('last-name')
        ].filter(x => x).map(getTextContent).join(' ')
    }
    const getDate = x => {
        const date = typeof x === 'string' ? $(x) : x
        if (!date) return ''
        const value = date.getAttribute('value')
        if (value) return value
        else return getTextContent(date)
    }
    const title = getTextContent('title-info book-title') || filename
    const identifier = getTextContent('document-info id')
        || await generateIdentifier(blob)
    const isbn = getTextContent('publish-info isbn')
    const annotation = $('title-info annotation')
    const description = annotation
        ? fb2ToHtml(fb2, annotation, null, true).innerHTML : undefined
    const language = getTextContent('title-info lang')
    const pubdate = getDate('title-info date')
    const modified_date = getDate('document-info date')
    const publisher = getTextContent('publish-info publisher')
    const creator = $$('title-info author').map(getAuthor).join(', ')
    const subjects = $$('title-info genre').map(x => x.textContent)
    const sources = $$('document-info src-url').map(x => x.textContent)
    const collections = $$('title-info sequence').map(x => ({
        type: 'series',
        label: x.getAttribute('name'),
        position: x.getAttribute('number'),
    }))
    const contributors = [
        ...$$('title-info translator').map(x => ({
            label: getAuthor(x),
            role: 'trl',
        })),
        ...$$('document-info author').map(x => ({
            label: getAuthor(x),
            role: 'bkp',
        })),
        ...$$('document-info program-used').map(x => ({
            label: getTextContent(x),
            role: 'bkp',
        }))
    ]

    const getIdFromHref = href => {
        const [a, b] = href.split('#')
        return a ? null : b
    }

    const getImage = image => {
        const href = image.getAttributeNS(XLINK_NS, 'href')
        const id = getIdFromHref(href)
        const bin = fb2.getElementById(id)
        if (!bin) return {}
        const type = bin.getAttribute('content-type')
        return {
            content: bin.textContent,
            data: `data:${type};base64,${bin.textContent}`,
            type
        }
    }

    let cover, coverType
    try {
        const image = getImage($('coverpage image'))
        cover = image.data
        coverType = image.type
    } catch (e) {}

    const stylesheet = `
        @namespace epub "${EPUB_NS}";
        :root {
            --border-color: rgba(0, 0, 0, 0.15);
            --th-bg-color: rgba(0, 0, 0, 0.075);
            --td-bg-color: rgba(0, 0, 0, 0.025);
        }
        :root[__ibooks_internal_theme*="Gray"],
        :root[__ibooks_internal_theme*="Night"] {
            --border-color: rgba(255, 255, 255, 0.15);
            --th-bg-color: rgba(255, 255, 255, 0.075);
            --td-bg-color: rgba(255, 255, 255, 0.025);
        }
        body > img, section > img {
            display: block;
            margin: auto;
        }
        body > header > h1 {
            text-align: center;
        }
        .text-author, .date {
            text-align: right;
        }
        .text-author:before {
            content: "—";
        }
        table {
            border-collapse: collapse;
        }
        td, th {
            background: var(--td-bg-color);
            padding: 3px 9px;
            border: 1px solid var(--border-color);
        }
        th {
            background: var(--th-bg-color);
        }
        a[epub|type~="noteref"] {
            font-size: .75em;
            vertical-align: super;
        }
    `
    const styleBlob = new Blob([stylesheet], { type: 'text/css' })
    const styleUrl = URL.createObjectURL(styleBlob)

    let i = 0
    const itemFromElement = x => {
        if (fb2Sections.has(x)) return fb2Sections.get(x)
        const section = fb2ToHtml(fb2, x, itemFromElement)

        const titles = [
            ...section.querySelectorAll(':scope > section > header') || []]
        titles.forEach(title => title.setAttribute('id', `__folaite_id_${i++}`))

        const sectionTitle = x.tagName === 'title'
            ? x
            : x.querySelector('title')
            || x.querySelector('subtitle')
            || x.querySelector('p')
        const title = (sectionTitle ? sectionTitle.textContent : '')
            .trim().replace(/\r?\n/g, ' ')

        const html = `
            <?xml version="1.0" encoding="utf-8"?>
            <html xmlns="http://www.w3.org/1999/xhtml">
                <head>
                    <title>${title}</title>
                    <link href="${styleUrl}" rel="stylesheet" type="text/css" />
                </head>
                <body>
                    ${section.outerHTML}
                </body>
            </html>
        `
        const blob = new Blob([html], { type: 'text/xhtml' })
        const url = URL.createObjectURL(blob)

        const item = {
            href: url,
            type: 'text/xhtml',
            title,
            children: titles.map(title => {
                const id = title.getAttribute('id')
                return {
                    href: url + '#' + id,
                    title: title.textContent
                }
            })
        }
        fb2Sections.set(x, item)
        return item
    }

    const readingOrder = []
    const bodies = $$('body')
    const toc = []
    bodies.forEach((body, i) => {
        const name = body.getAttribute('name')
        const sections = [...body.children].map(itemFromElement)
        readingOrder.push(...sections)

        const titledSections = sections.filter(x => x.title)

        if (i === 0) return toc.push(...titledSections)

        const first = sections[0]
        toc.push({
            href: first ? first.href : '',
            title: (first ? first.title : '') || name || title,
            children: titledSections
        })
    })

    return {
        metadata: {
            title,
            creator,
            identifier,
            identifiers: isbn
                ? [identifier, { scheme: 'isbn', identifier: isbn }]
                : [],
            description,
            language,
            pubdate,
            modified_date,
            publisher,
            subjects,
            sources,
            collections,
            contributors
        },
        links: [],
        readingOrder,
        toc,
        resources: [
            { rel: ['cover'], href: cover, type: coverType },
        ]
    }
}

const imageType = async blob => {
    // Construct an ArrayBuffer (byte array) from the first 16 bytes of the given blob.
    const slicedBlob = blob.slice(0, 16)
    const blobArrayBuffer = await new Response(slicedBlob).arrayBuffer()

    // Construct a Uint8Array object to represent the ArrayBuffer (byte array).
    const byteArray = new Uint8Array(blobArrayBuffer)

    // Convert the byte array to hexadecimal.
    let hex = ''
    byteArray.forEach(byte => {
        hex += `0${byte.toString(16)}`.slice(-2).toUpperCase()
    })

    // Return image type based on the converted hexadecimal
    if (hex.startsWith('FFD8FF')) {
        return 'jpeg'
    } else if (hex.startsWith('89504E47')) {
        return 'png'
    } else if (hex.startsWith('47494638')) {
        return 'gif'
    } else if (hex.startsWith('424D')) {
        return 'bmp'
    } else if (hex.startsWith('52494646') && hex.slice(16, 24) === '57454250') {
        return 'webp'
    } else {
        return 'unknown'
    }
}

const unpackZipArchive = async archiveBlob => {
    const archive = await JSZip.loadAsync(archiveBlob)

    const archiveFiles = Object.keys(archive.files).map(name => archive.files[name])
    return Promise.all(
        archiveFiles.map(async file => {
            const name = file.name.split('.').slice(0, -1).join('')
            const blob = await file.async('blob')
            const type = await imageType(blob)

            return { name, blob, type }
        })
    )
}

const unpackArchive = async (archiveBlob, inputType) => {
    const archive = await Archive.open(archiveBlob)

    try {
        await archive.extractFiles()
    } catch (error) {
        if (inputType === 'cbr' && error && error.message && error.message === 'Parsing filters is unsupported.') {
            throw new Error('CBR could not be extracted. [Parsing filters is unsupported]')
        }

        throw error
    }

    const archiveFiles = await archive.getFilesArray()
    return Promise.all(
        archiveFiles.map(async ({file}) => {
            const name = file.name.split('.').slice(0, -1).join('')
            const blob = file
            const type = await imageType(blob)

            return { name, blob, type }
        })
    )
}

const webpubFromComicBookArchive = async (uri, inputType, layout, filename) => {
    const automaticStylesheet = () => {
        return `
            * {
                margin: 0 !important;
                padding: 0 !important;
            }

            body {
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .image-wrapper {
                display: flex;
                align-items: center;
                justify-content: center;

                min-height: 99.5vh;
            }

            .image-wrapper img {
                width: 100vw;
                max-height: 99.5vh;
                object-fit: contain;
            }
            .image-wrapper img.left {
                object-position: right center;
            }
            .image-wrapper img.right {
                object-position: left center;
            }
        `
    }

    const fitPageStylesheet = () => {
        return `
            * {
                margin: 0 !important;
                padding: 0 !important;
            }

            body {
                display: flex;
                align-items: center;
                justify-content: center;
            }
        `
    }

    const fitWidthStylesheet = () => {
        return `
            * {
                margin: 0 !important;
                padding: 0 !important;
            }

            body {
                text-align: center;
            }

            .image-wrapper img {
                width: 100%;
            }
        `
    }

    const continuousStylesheet = () => {
        return `
            * {
                margin: 0 !important;
                padding: 0 !important;
            }

            body {
                text-align: center;
                margin-bottom: 20px !important;
            }

            .image-wrapper img {
                width: 100%;
            }
        `
    }

    const automaticScripts = async () => { return `` }
    const fitPageScripts = async () => { return `` }
    const fitWidthScripts = async () => { return `` }
    const continuousScripts = async () => { return `` }

    let stylesheet;
    let scripts;
    switch (layout) {
        case 'automatic': {
            stylesheet = automaticStylesheet()
            scripts = await automaticScripts()
            break
        }
        case 'single-column': {
            stylesheet = fitPageStylesheet()
            scripts = await fitPageScripts()
            break
        }
        case 'scrolled': {
            stylesheet = fitWidthStylesheet()
            scripts = await fitWidthScripts()
            break
        }
        case 'continuous': {
            stylesheet = continuousStylesheet()
            scripts = await continuousScripts()
            break
        }
        default: {
            stylesheet = fitPageStylesheet()
            scripts = await fitPageScripts()
            console.log('unexpected layout')
        }
    }

    const stylesheetBlob = new Blob([stylesheet], { type: 'text/css' })
    const stylesheetURL = URL.createObjectURL(stylesheetBlob)

    const res = await fetch(uri)
    const blob = await res.blob()
    const identifier = await generateIdentifier(blob)
    let files
    switch (inputType) {
        case 'cbz': files = await unpackZipArchive(blob); break
        case 'cbr': files = await unpackArchive(blob, inputType); break
        case 'cb7': files = await unpackArchive(blob, inputType); break
        case 'cbt': files = await unpackArchive(blob, inputType); break
    }

    let cover
    const sectionLinkObjects = files.filter(file =>
            ['jpeg', 'png', 'gif', 'bmp', 'webp'].includes(file.type))
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((image, i) => {
            const left = i % 2
            const src = URL.createObjectURL(image.blob)
            if (i === 0) cover = src
            const html = `
                <!doctype html>
                <html>
                    <head>
                        <title>${image.name}</title>
                        <link rel="stylesheet" type="text/css" href="${stylesheetURL}" />
                    </head>

                    <body>
                        <section class="image-wrapper">
                            <img src="${src}" alt="${image.name}" class="${left ? 'left' : 'right'}" />
                        </section>

                        <!-- SCRIPTS -->
                        ${scripts}
                    </body>
                </html>
            `

            const pageHTMLBlob = new Blob([html], { type: 'text/html' })
            const pageURL = URL.createObjectURL(pageHTMLBlob)

            return {
                href: pageURL,
                type: 'text/html',
                title: image.name,
                properties: [left ? 'page-spread-left' : 'page-spread-right']
            }
        })

    return {
        metadata: {
            title: filename,
            identifier,
            layout: layout === 'automatic' ? 'pre-paginated' : 'reflowable'
        },
        links: [],
        readingOrder: sectionLinkObjects,
        toc: sectionLinkObjects,
        resources: [
            { rel: ['cover'], href: cover }
        ]
    }
}
