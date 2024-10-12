#!/usr/bin/env node
import { readdir, writeFile } from 'fs/promises'
import { join } from 'path'

const getPath = file => join(file.parentPath, file.name)

const getFiles = async (path, filter, compressed) => {
    const files = await readdir(path, { withFileTypes: true })
    return files.filter(file => !file.isDirectory())
        .filter(filter ?? (() => true))
        .map(compressed
            ? file => `<file compressed="true">${getPath(file)}</file>`
            : file => `<file>${getPath(file)}</file>`)
}

const getIcons = async () => {
    const files = await readdir('icons/hicolor/scalable/actions/',
        { withFileTypes: true })
    return files.map(file =>
        `<file alias="icons/scalable/actions/${file.name}">${getPath(file)}</file>`)
}

const filter = ({ excludes, endsWith }) => ({ name }) => {
    for (const x of excludes) if (name === x) return
    for (const x of endsWith) if (name.endsWith(x)) return true
}

const result = `<?xml version="1.0" encoding="UTF-8"?>
<gresources>
  <gresource prefix="/com/github/johnfactotum/Foliate">
${[
        ...await getFiles('./', filter({
            excludes: ['generate-gresource.js', 'main.js'],
            endsWith: ['.js'],
        })),
        ...await getFiles('ui/'),
        ...await getIcons(),
        ...await getFiles('foliate-js/', filter({
            excludes: ['reader.js', 'eslint.config.js', 'rollup.config.js'],
            endsWith: ['.js'],
        })),
        ...await getFiles('foliate-js/vendor/'),
        ...await getFiles('foliate-js/vendor/pdfjs/'),
        ...await getFiles('foliate-js/vendor/pdfjs/cmaps/', null, true),
        ...await getFiles('foliate-js/vendor/pdfjs/standard_fonts/', null, true),
        ...await getFiles('opds/'),
        ...await getFiles('selection-tools/'),
        ...await getFiles('common/'),
        ...await getFiles('reader/'),
    ].map(x => '    ' + x).join('\n')}
  </gresource>
</gresources>
`

await writeFile('gresource.xml', result)
