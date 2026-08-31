import Gtk from 'gi://Gtk'
import GLib from 'gi://GLib'
import { gettext as _ } from 'gettext'
import * as utils from './utils.js'

export const themes = [
    {
        name: 'default', label: _('Default'),
        light: { fg: '#000000', bg: '#ffffff', link: '#0066cc' },
        dark: { fg: '#e0e0e0', bg: '#222222', link: '#77bbee' },
    },
    {
        name: 'gray', label: _('Gray'),
        light: { fg: '#222222', bg: '#e0e0e0', link: '#4488cc' },
        dark: { fg: '#c6c6c6', bg: '#444444', link: '#88ccee' },
    },
    {
        name: 'sepia', label: _('Sepia'),
        light: { fg: '#5b4636', bg: '#f1e8d0', link: '#008b8b' },
        dark: { fg: '#ffd595', bg: '#342e25', link: '#48d1cc' },
    },
    {
        name: 'grass', label: _('Grass'),
        light: { fg: '#232c16', bg: '#d7dbbd', link: '#177b4d' },
        dark: { fg: '#d8deba', bg: '#333627', link: '#a6d608' },
    },
    {
        name: 'cherry', label: _('Cherry'),
        light: { fg: '#4e1609', bg: '#f0d1d5', link: '#de3838' },
        dark: { fg: '#e5c4c8', bg: '#462f32', link: '#ff646e' },
    },
    {
        name: 'sky', label: _('Sky'),
        light: { fg: '#262d48', bg: '#cedef5', link: '#2d53e5' },
        dark: { fg: '#babee1', bg: '#282e47', link: '#ff646e' },
    },
    {
        name: 'solarized', label: _('Solarized'),
        light: { fg: '#586e75', bg: '#fdf6e3', link: '#268bd2' },
        dark: { fg: '#93a1a1', bg: '#002b36', link: '#268bd2' },
    },
    {
        name: 'gruvbox', label: _('Gruvbox'),
        light: { fg: '#3c3836', bg: '#fbf1c7', link: '#076678' },
        dark: { fg: '#ebdbb2', bg: '#282828', link: '#83a598' },
    },
    {
        name: 'nord', label: _('Nord'),
        light: { fg: '#2e3440', bg: '#eceff4', link: '#5e81ac' },
        dark: { fg: '#d8dee9', bg: '#2e3440', link: '#88c0d0' },
    },
]

for (const { file, name } of utils.listDir(pkg.configpath('themes'))) try {
    if (!/\.json$/.test(name)) continue
    const theme = utils.readJSONFile(file)
    themes.push({
        name,
        label: theme.label ?? name.replace(/\.json$/, ''),
        light: {
            fg: theme.light.fg,
            bg: theme.light.bg,
            link: theme.light.link,
        },
        dark: {
            fg: theme.dark.fg,
            bg: theme.dark.bg,
            link: theme.dark.link,
        },
    })
} catch (e) {
    console.error(e)
}

export const themeCssProvider = new Gtk.CssProvider()
themeCssProvider.load_from_data(`
    .theme-container .card {
        padding: 9px;
    }
` + themes.map(theme => {
    const id = `theme-${GLib.uuid_string_random()}`
    theme.id = id
    return `
        .${id}, .sidebar-${id}:not(.background) {
            color: ${theme.light.fg};
            background: ${theme.light.bg};
        }
        .sidebar-${id}:not(.background) toolbarview {
            background: rgba(0, 0, 0, .08);
        }
        .is-dark .${id}, .is-dark .sidebar-${id}:not(.background) {
            color: ${theme.dark.fg};
            background: ${theme.dark.bg};
        }
        .is-dark .sidebar-${id}:not(.background) toolbarview {
            background: rgba(255, 255, 255, .05);
        }
        .${id} highlight {
            background: ${theme.light.link};
        }
        .is-dark .${id} highlight {
            background: ${theme.dark.link};
        }
        .${id} popover highlight, .is-dark .${id} popover highlight {
            background: @accent_bg_color;
        }
    `
}).join(''), -1)

export const invertTheme = ({ light, dark }) => ({ light, dark, inverted: {
    fg: utils.invertColor(dark.fg),
    link: utils.invertColor(dark.link),
} })
