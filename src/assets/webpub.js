const webpubFromText = async uri => {
    const res = await fetch(uri)
    const data = await res.text()

    const chapters = data.split(/(\r\n){3,}/g)
        .filter(x => x && x !== '\r\n')
        .map(c => {
            const ps = c.split(/(\r\n){2}/g)
                .filter(x => x && x !== '\r\n')
            const blob = new Blob(
                [ps.map(p => `<p>${p}</p>`).join('')],
                { type: 'text/html' })
            const url = URL.createObjectURL(blob)
            return {
                href: url,
                type: 'text/html',
                title: ps[0].replace(/\r\n/g, '')
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
