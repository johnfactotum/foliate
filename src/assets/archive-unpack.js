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

const unpackZipArchive = async uri => {
    const res = await fetch(uri)
    const archiveBlob = await res.blob()

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

const unpackArchive = async (uri, inputType) => {
    const res = await fetch(uri)
    const archiveBlob = await res.blob()

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
