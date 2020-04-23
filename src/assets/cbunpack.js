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
