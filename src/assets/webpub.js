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
    const $ = doc.querySelector.bind(doc)
    const $$ = doc.querySelectorAll.bind(doc)
    const title = $('book-title').textContent
    const description = $('title-info annotation').textContent
    const language = $('lang').textContent
    
    // let coverUrl, coverType
    // try {
    //     const coverId = $('coverpage image').getAttribute('l:href').split('#')[1]
    //     const cover = doc.getElementById(coverId)
    //     coverType = cover.getAttribute('content-type')
    //     const coverBlob = new Blob([cover.textContent], { type: coverType })
    //     coverUrl = URL.createObjectURL(coverBlob)
    // } catch (e) {}

    const sections = [...$$('body > section')].map(x => {
        const html = `
            <!DOCTYPE html>
            ${[...x.children].map(x => {
                let tagName = x.tagName
                if (tagName === 'title') tagName = 'h2'
                return `<${tagName}>${x.textContent}</${tagName}>`
            }).join('')}
        `
        const blob = new Blob([html], { type: 'text/html' })
        const url = URL.createObjectURL(blob)

        const sectionTitle = x.querySelector('title')
        return {
            href: url,
            type: 'text/html',
            title: sectionTitle ? sectionTitle.textContent : title
        }
    })

    return {
        metadata: {
            title,
            description,
            language
        },
        links: [],
        readingOrder: sections,
        toc: sections,
        resources: []
    }
}

const webpubFromComicBookArchive = async (uri, inputType) => {
    const cbArchiveName = decodeURI(uri).split('/').pop().split('.').slice(0, -1).join('')

    let pages
    switch (inputType) {
        case 'cbz': pages = await unpackCBZ(uri); break
    }

    const stylesheet = `
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
    `
    const stylesheetBlob = new Blob([stylesheet], { type: 'text/css' })
    const stylesheetURL = URL.createObjectURL(stylesheetBlob)


    const sectionLinkObjects = pages.map(page => {
        const html = `
        <!doctype html>
        <html>
            <head>
                <title>${page.title}</title>
                <link rel="stylesheet" type="text/css" href="${stylesheetURL}" />
            </head>

            <body>
                <section class="image-wrapper">
                    <img src="${URL.createObjectURL(page.blob)}" alt="${page.title}" />
                </section>
            </body>
        </html>
        `

        const pageHTMLBlob = new Blob([html], { type: 'text/html' })
        const pageURL = URL.createObjectURL(pageHTMLBlob)

        return {
            href: pageURL,
            type: 'text/html',
            title: page.title
        }
    })

    return {
        metadata: {
            title: cbArchiveName
        },
        links: [],
        readingOrder: sectionLinkObjects,
        toc: sectionLinkObjects,
        resources: []
    }
}
