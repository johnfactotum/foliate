const unpackCBZ = async uri => {
    const res = await fetch(uri)
    const cbzArchiveBlob = await res.blob()

    const cbzArchive = await JSZip.loadAsync(cbzArchiveBlob)

    const archiveFiles = Object.keys(cbzArchive.files).map(name => cbzArchive.files[name])
    return Promise.all(
        archiveFiles.map(async file => {
            const pageTitle = file.name.split('.').slice(0, -1).join('')
            const pageBlob = await file.async('blob')

            return {
                title: pageTitle,
                blob: pageBlob,
                type: pageBlob.type
            }
        })
    )
}

const unpackCB = async (uri, inputType) => {
    const res = await fetch(uri)
    const archiveBlob = await res.blob()

    const archive = await Archive.open(archiveBlob)
  
    await archive.extractFiles()
    
    const archiveFiles = await archive.getFilesArray()
    return archiveFiles.map(({file}) => {
        const pageTitle = file.name.split('.').slice(0, -1).join('')
        const pageBlob = file

        return {
            title: pageTitle,
            blob: pageBlob,
            type: pageBlob.type
        }
    })
}
