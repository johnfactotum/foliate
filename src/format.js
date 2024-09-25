import GLib from 'gi://GLib'
import Gio from 'gi://Gio'
import { gettext as _ } from 'gettext'

const makeLocale = locale => {
    try { return new Intl.Locale(locale) }
    catch { return null }
}

const glibcLocale = str => makeLocale(
    str === 'C' ? 'en' : str.split('.')[0].replace('_', '-'))

const getHourCycle = () => {
    try {
        const settings = new Gio.Settings({ schema_id: 'org.gnome.desktop.interface' })
        return settings.get_string('clock-format') === '24h' ? 'h23' : 'h12'
    } catch (e) {
        console.debug(e)
    }
}

const hourCycle = getHourCycle()

export const locales = GLib.get_language_names()
    .map(glibcLocale).filter(x => x)
    .map(locale => new Intl.Locale(locale, { hourCycle }))

// very naive, probably bad locale matcher
// replace this with `Intl.LocaleMatcher` once it's available
export const matchLocales = strs => {
    const availableLocales = strs.map(makeLocale)
    const matches = []
    for (const a of locales) {
        for (const [i, b] of availableLocales.entries()) {
            if (!b) continue
            if (a.language === b.language
            && (a.region && b.region ? a.region === b.region : true)
            && (a.script && b.script ? a.script === b.script : true))
                matches.push(strs[i])
        }
    }
    return matches
}

const numberFormat = new Intl.NumberFormat(locales)
export const number = x => x != null ? numberFormat.format(x) : ''

const percentFormat = new Intl.NumberFormat(locales, { style: 'percent' })
export const percent = x => x != null ? percentFormat.format(x) : ''

const listFormat = new Intl.ListFormat(locales, { style: 'short', type: 'conjunction' })
export const list = x => x ? listFormat.format(x) : ''

export const date = (str, showTime = false) => {
    if (!str) return ''
    const isBCE = str.startsWith('-')
    const split = str.split('-').filter(x => x)
    const yearOnly = split.length === 1
    const yearMonthOnly = split.length === 2

    // years from 0 to 99 treated as 1900 to 1999, and BCE years unsupported,
    // unless you use "expanded years", which is `+` or `-` followed by 6 digits
    const [year, ...rest] = split
    const date = new Date((isBCE ? '-' : '+')
        + year.replace(/^0+/, '').padStart(6, '0')
        + (rest.length ? '-' + rest.join('-') : ''))

    // fallback when failed to parse date
    if (isNaN(date)) return str

    const options = yearOnly
        ? { year: 'numeric' }
        : yearMonthOnly
            ? { year: 'numeric', month: 'long' }
            : showTime
                ? { year: 'numeric', month: 'long', day: 'numeric',
                    hour: 'numeric', minute: 'numeric' }
                : { year: 'numeric', month: 'long', day: 'numeric' }

    if (isBCE) options.era =  'short'
    return new Intl.DateTimeFormat(locales, options).format(date)
}

const getRegionEmoji = code => {
    if (!code || code.length !== 2) return ''
    return String.fromCodePoint(
        ...Array.from(code.toUpperCase()).map(x => 127397 + x.charCodeAt()))
}
const displayName = new Intl.DisplayNames(locales, { type: 'language' })
const formatLangauge = code => {
    if (!code) return ''
    try {
        const locale = new Intl.Locale(code)
        const { language, region } = locale
        const name = displayName.of(language)
        if (region) {
            const emoji = getRegionEmoji(region)
            return `${emoji ? `${emoji} ` : '' }${name}`
        } else return name
    } catch {
        return ''
    }
}
export const language = lang => {
    if (typeof lang === 'string') return formatLangauge(lang)
    if (Array.isArray(lang)) return list(lang.map(formatLangauge))
    return ''
}

const minuteFormat = new Intl.NumberFormat(locales, { style: 'unit', unit: 'minute' })
const hourFormat = new Intl.NumberFormat(locales, { style: 'unit', unit: 'hour' })
export const duration = minutes => minutes < 60
    ? minuteFormat.format(Math.round(minutes))
    : hourFormat.format((minutes / 60).toFixed(1))

export const mime = mime => mime ? Gio.content_type_get_description(mime) : ''

export const price = (currency, value) => {
    try {
        return new Intl.NumberFormat(locales, { style: 'currency', currency }).format(value)
    } catch {
        return (currency ? currency + ' ' : '') + value
    }
}

export const vprintf = imports.format.vprintf
export const total = n => vprintf(_('of %d'), [n])
