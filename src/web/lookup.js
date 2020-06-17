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

const wiktionary = (word, language = 'en') => {
    const baseURL = 'https://en.wiktionary.org/'
    fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${word}`)
        .then(res => res.ok ? res.json() : Promise.reject(new Error()))
        .then(json => {
            const results = language.length === 2
                ? json[language]
                : Object.values(json).find(x => x[0].language === language)
            results.forEach(el => {
                el.definitions.forEach(x => {
                    x.definition = toPangoMarkup(x.definition, baseURL)
                    if (x.examples) x.examples = x.examples.map(ex =>
                        toPangoMarkup(ex, baseURL))
                })
            })
            return { word: decodeURIComponent(word), results }
        })
        .then(payload => dispatch({ type: 'lookup-results', payload }))
        .catch(e => {
            console.error(e)
            word = decodeURI(word)
            const lower = word.toLowerCase()
            if (lower !== word) dispatch({ type: 'lookup-again', payload: lower })
            else dispatch({ type: 'lookup-error' })
        })
}
const wikipedia = (word, language = 'en') => {
    const baseURL = `https://${language}.wikipedia.org/`
    fetch(`https://${language}.wikipedia.org/api/rest_v1/page/summary/${word}`)
        .then(res => {
            if (res.ok) return res
            else throw new Error()
        })
        .then(res => res.json())
        .then(json => {
            json.extract = toPangoMarkup(json.extract_html, baseURL)
            return json
        })
        .then(payload => dispatch({ type: 'lookup-results', payload }))
        .catch(() => dispatch({ type: 'lookup-error' }))
}
const googleTranslate = (word, language = 'en') => {
    fetch(`https://translate.googleapis.com/translate_a/single?client=gtx`
        + `&ie=UTF-8&oe=UTF-&sl=auto&tl=${language}`
        + `&dt=t&q=${word}`)
        .then(res => {
            if (res.ok) return res
            else throw new Error()
        })
        .then(res => res.json())
        .then(json => json[0].map(x => x[0]).join(''))
        .then(payload => dispatch({ type: 'lookup-results', payload }))
        .catch(() => dispatch({ type: 'lookup-error' }))
}
dispatch({ type: 'ready' })
