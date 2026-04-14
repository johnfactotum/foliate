import Gio from 'gi://Gio'
import GLib from 'gi://GLib'

import { readFile } from './utils.js'

const PROMPTS_FILE = 'ai-prompts.json'

const getPromptsFile = () => Gio.File.new_for_path(
    GLib.build_filenamev([pkg.configdir, PROMPTS_FILE]))

export const loadPrompts = () => {
    try {
        const data = readFile(getPromptsFile(), '[]')
        const prompts = JSON.parse(data)
        return Array.isArray(prompts) ? prompts : []
    } catch (e) {
        console.warn('Failed to load AI prompts:', e)
        return []
    }
}

export const savePrompts = prompts => {
    try {
        const file = getPromptsFile()
        const parent = file.get_parent().get_path()
        GLib.mkdir_with_parents(parent, parseInt('0755', 8))
        const contents = JSON.stringify(prompts, null, 2)
        file.replace_contents(contents, null, false,
            Gio.FileCreateFlags.REPLACE_DESTINATION, null)
    } catch (e) {
        console.error('Failed to save AI prompts:', e)
    }
}

export const getDefaultPrompt = prompts => {
    if (!prompts.length) return null
    return prompts.find(p => p.isDefault) || prompts[0]
}

export const getPromptById = (prompts, id) =>
    prompts.find(p => p.id === id) || null

export const makeId = () =>
    GLib.uuid_string_random()

export const appendToFile = (filePath, text, result) => {
    try {
        const file = Gio.File.new_for_path(filePath)
        const timestamp = new Date().toISOString()
        const entry = `\n--- ${timestamp} ---\nSelected: ${text}\nResult: ${result}\n`
        const bytes = new TextEncoder().encode(entry)

        let stream
        try {
            stream = file.append_to(Gio.FileCreateFlags.NONE, null)
        } catch {
            // File doesn't exist, create it
            const parent = file.get_parent()
            if (parent) GLib.mkdir_with_parents(parent.get_path(), parseInt('0755', 8))
            stream = file.create(Gio.FileCreateFlags.NONE, null)
        }
        stream.write_bytes(new GLib.Bytes(bytes), null)
        stream.close(null)
    } catch (e) {
        console.error('Failed to append to file:', e)
    }
}
