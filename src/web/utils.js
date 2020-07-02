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

const XMLNS_NS = 'http://www.w3.org/2000/xmlns/'
const XLINK_NS = 'http://www.w3.org/1999/xlink'
const XHTML_NS = 'http://www.w3.org/1999/xhtml'

const EPUB_NS = 'http://www.idpf.org/2007/ops'

const OPDS_CAT_NS = 'http://opds-spec.org/2010/catalog'
const OPDS_ROOT_NS = 'http://opds-spec.org/'
const OPDS_NS = [OPDS_CAT_NS, OPDS_ROOT_NS]
const THR_NS = 'http://purl.org/syndication/thread/1.0'

const DC_ELS_NS = 'http://purl.org/dc/elements/1.1/'
const DC_TERMS_NS = 'http://purl.org/dc/terms/'
const DC_NS = [DC_TERMS_NS, DC_ELS_NS]

const debounce = (f, wait, immediate) => {
    let timeout
    return (...args) => {
        const later = () => {
            timeout = null
            if (!immediate) f(...args)
        }
        const callNow = immediate && !timeout
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
        if (callNow) f(...args)
    }
}

const dispatch = action => {
    window.webkit.messageHandlers.action.postMessage(JSON.stringify(action))
}

const isExternalURL = href => {
    if (href.startsWith('blob:')) return false
    return href.startsWith('mailto:') || href.includes('://')
}

const resolveURL = (url, relativeTo) => {
    // HACK-ish: abuse the URL API a little to resolve the path
    // the base needs to be a valid URL, or it will throw a TypeError,
    // so we just set a random base URI and remove it later
    const base = 'https://example.invalid/'
    return new URL(url, base + relativeTo).href.replace(base, '')
}

const trim = x => x ? x.trim() : x

const unescapeHTML = str => {
    const textarea = document.createElement('textarea')
    textarea.innerHTML = str
    return textarea.value
}

// Remove whitespace like CSS `white-space: normal`
const whitespaceNormal = str =>
    str ? str.replace(/\r?\n/g, ' ').replace(/(\s){2,}/g, ' ') : ''

// from https://stackoverflow.com/a/11892228
const usurp = p => {
    let last = p
    for (let i = p.childNodes.length - 1; i >= 0; i--) {
        let e = p.removeChild(p.childNodes[i])
        p.parentNode.insertBefore(e, last)
        last = e
    }
    p.parentNode.removeChild(p)
}
const pangoMarkupTags = ['a', 'b', 'big', 'i', 's', 'sub', 'sup', 'small', 'tt', 'u']
const toPangoMarkup = (html, baseURL = '') => {
    const isBaseURLExternal = isExternalURL(baseURL)
    html = whitespaceNormal(html)
    const doc = new DOMParser().parseFromString(html, 'text/html')
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
        .forEach(el => el.innerHTML = '\n\n<big><b>' + el.innerHTML + '</b></big>')
    Array.from(doc.body.querySelectorAll('*')).forEach(el => {
        const nodeName = el.nodeName.toLowerCase()
        if (pangoMarkupTags.indexOf(nodeName) === -1) usurp(el)
        else Array.from(el.attributes).forEach(x => {
            if (x.name === 'href') {
                if (baseURL) {
                    const href = el.getAttribute('href')
                    if (isBaseURLExternal)
                        el.setAttribute('href', new URL(href, baseURL))
                    else
                        el.setAttribute('href', resolveURL(href, baseURL))
                }
            } else el.removeAttribute(x.name)
        })
        if (nodeName === 'a' && !el.hasAttribute('href')) usurp(el)
    })
    return unescapeHTML(doc.body.innerHTML.trim()).replace(/&/g, '&amp;')
}
