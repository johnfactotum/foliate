const unescapeHTML = str => {
    const textarea = document.createElement('textarea')
    textarea.innerHTML = str
    return textarea.value
}

const usurp = p => {
    let last = p
    for (let i = p.childNodes.length - 1; i >= 0; i--) {
        let e = p.removeChild(p.childNodes[i])
        p.parentNode.insertBefore(e, last)
        last = e
    }
    p.parentNode.removeChild(p)
}

const pangoTags = ['a', 'b', 'big', 'i', 's', 'sub', 'sup', 'small', 'tt', 'u']

export const toPangoMarkup = html => {
    if (!html) return ''
    const doc = new DOMParser().parseFromString(
        html.trim().replace(/\r?\n/g, ' ').replace(/\s{2,}/g, ' '), 'text/html')
    Array.from(doc.querySelectorAll('p'))
        .forEach(el => el.innerHTML = '\n\n' + el.innerHTML)
    Array.from(doc.querySelectorAll('div'))
        .forEach(el => el.innerHTML = '\n' + el.innerHTML)
    Array.from(doc.querySelectorAll('li'))
        .forEach(el => el.innerHTML = '\n • ' + el.innerHTML)
    Array.from(doc.querySelectorAll('br'))
        .forEach(el => el.innerHTML = '\n')
    Array.from(doc.querySelectorAll('em'))
        .forEach(el => el.innerHTML = '<i>' + el.innerHTML + '</i>')
    Array.from(doc.querySelectorAll('strong'))
        .forEach(el => el.innerHTML = '<b>' + el.innerHTML + '</b>')
    Array.from(doc.querySelectorAll('code'))
        .forEach(el => el.innerHTML = '<tt>' + el.innerHTML + '</tt>')
    Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6'))
        .forEach(el => el.innerHTML = '\n\n<b>' + el.innerHTML + '</b>')
    Array.from(doc.body.querySelectorAll('*')).forEach(el => {
        const nodeName = el.nodeName.toLowerCase()
        if (pangoTags.indexOf(nodeName) === -1) usurp(el)
        else Array.from(el.attributes).forEach(attr => {
            if (attr.name !== 'href') el.removeAttribute(attr.name)
        })
        if (nodeName === 'a' && !el.hasAttribute('href')) usurp(el)
    })
    return unescapeHTML(doc.body.innerHTML.trim()
        .replace(/\n{3,}/g, '\n\n')
        .replace(/&(?=lt;|gt;|amp;)/g, '&amp;'))
        .replace(/&/g, '&amp;')
}
