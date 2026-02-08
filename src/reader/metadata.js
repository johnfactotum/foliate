import { makeBook } from '../foliate-js/view.js'

const blobToBase64 = blob => new Promise(resolve => {
    const reader = new FileReader()
    reader.readAsDataURL(blob)
    reader.onloadend = () => resolve(reader.result.split(',')[1])
})

const base64ToUint8Array = base64 =>
    Uint8Array.from(atob(base64), char => char.charCodeAt(0))

const makeFileFromPayload = ({ data, name, mimeType }) => {
    if (!data) return null
    const bytes = base64ToUint8Array(data)
    const blob = new Blob([bytes], { type: mimeType ?? '' })
    return new File([blob], name ?? 'book', { type: mimeType ?? '' })
}

globalThis.getMetadata = async payload => {
    const target = makeFileFromPayload(payload) ?? payload.uri
    if (!target) throw new Error('Missing payload data')
    const book = await makeBook(target)
    const cover = await book.getCover?.()
    return {
        metadata: book.metadata ?? {},
        cover: cover ? await blobToBase64(cover) : null,
    }
}
