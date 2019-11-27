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

const { GObject, Gtk, Gio } = imports.gi
const { RGBAFromString, invertRotate, Storage } = imports.utils

const settings = new Gio.Settings({ schema_id: pkg.name + '.view' })

const defaultThemes = [
    {
        theme_name: _('Light'), dark_mode: false, invert: false,
        fg_color: '#000', bg_color: '#fff', link_color: 'blue',
    },
    {
        theme_name: _('Sepia'), dark_mode: false, invert: false,
        fg_color: '#5b4636', bg_color: '#efe7dd', link_color: 'darkcyan',
    },
    {
        theme_name: _('Gray'), dark_mode: true, invert: false,
        fg_color: '#ccc', bg_color: '#555', link_color: 'cyan',
    },
    {
        theme_name: _('Dark'), dark_mode: true, invert: false,
        fg_color: '#ddd', bg_color: '#292929', link_color: 'cyan',
    },
    {
        theme_name: _('Invert'), dark_mode: true, invert: true,
        fg_color: '#000', bg_color: '#fff', link_color: 'blue',
    },
    {
        theme_name: _('Solarized Light'), dark_mode: false, invert: false,
        fg_color: '#586e75', bg_color: '#fdf6e3', link_color: '#268bd2',
    },
    {
        theme_name: _('Solarized Dark'), dark_mode: true, invert: false,
        fg_color: '#93a1a1', bg_color: '#002b36', link_color: '#268bd2',
    },
    {
        theme_name: _('Gruvbox Light'), dark_mode: false, invert: false,
        fg_color: '#3c3836', bg_color: '#fbf1c7', link_color: '#076678',
    },
    {
        theme_name: _('Gruvbox Dark'), dark_mode: true, invert: false,
        fg_color: '#ebdbb2', bg_color: '#282828', link_color: '#83a598',
    },
    {
        theme_name: _('Nord'), dark_mode: true, invert: false,
        fg_color: '#d8dee9', bg_color: '#2e3440', link_color: '#88c0d0',
    }
]

var Theme = GObject.registerClass({
    GTypeName: 'FoliateTheme',
    Properties: {
        'theme-name':
            GObject.ParamSpec.string('theme-name', 'theme-name', 'theme-name',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, ''),
        'fg-color':
            GObject.ParamSpec.string('fg-color', 'fg-color', 'fg-color',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, 'black'),
        'bg-color':
            GObject.ParamSpec.string('bg-color', 'bg-color', 'bg-color',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, 'white'),
        'link-color':
            GObject.ParamSpec.string('link-color', 'link-color', 'link-color',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, 'blue'),
        invert:
            GObject.ParamSpec.boolean('invert', 'invert', 'invert',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, false),
        'dark-mode':
            GObject.ParamSpec.boolean('dark-mode', 'dark-mode', 'dark-mode',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, false),
    }
}, class Theme extends GObject.Object {})

var ThemeRow = GObject.registerClass({
    GTypeName: 'FoliateThemeRow',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/themeRow.ui',
    InternalChildren: ['label', 'image', 'button']
}, class ThemeRow extends Gtk.ListBoxRow {
    _init(theme, editable) {
        super._init()
        if (editable) this._button.show()
        this.theme = theme
        theme.bind_property('theme-name', this._label, 'label',
            GObject.BindingFlags.DEFAULT | GObject.BindingFlags.SYNC_CREATE)

        this._applyColor()
        theme.connect('notify::fg_color', this._applyColor.bind(this))
        theme.connect('notify::bg_color', this._applyColor.bind(this))
        theme.connect('notify::invert', this._applyColor.bind(this))

        this._updateSelected()
        const themeHandlers = [
            settings.connect('changed::bg-color', () => this._updateSelected()),
            settings.connect('changed::fg-color', () => this._updateSelected()),
            settings.connect('changed::link-color', () => this._updateSelected()),
            settings.connect('changed::invert', () => this._updateSelected()),
            settings.connect('changed::prefer-dark-theme', () => this._updateSelected()),
        ]
        this.connect('destroy', () => themeHandlers.forEach(x => settings.disconnect(x)))
    }
    _updateSelected() {
        const theme = this.theme
        const selected = theme.fg_color === settings.get_string('fg-color')
            && theme.bg_color === settings.get_string('bg-color')
            && theme.link_color === settings.get_string('link-color')
            && theme.invert === settings.get_boolean('invert')
            && theme.dark_mode === settings.get_boolean('prefer-dark-theme')
        this._image.visible = selected
    }
    _applyColor() {
        this._updateSelected()
        const { fg_color, bg_color, invert } = this.theme
        const cssProvider = new Gtk.CssProvider()
        cssProvider.load_from_data(`
            * {
                color: ${invert ? invertRotate(fg_color) : fg_color};
                background: ${invert ? invertRotate(bg_color) : bg_color};
            }`)
        this.get_style_context()
            .add_provider(cssProvider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION)
        this._button.get_style_context()
            .add_provider(cssProvider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION)
    }
    _remove() {
        customThemes.removeTheme(this.theme)
    }
    _edit() {
        const theme = this.theme
        const editor = new ThemeEditor(new Theme({
            theme_name: theme.theme_name,
            fg_color: theme.fg_color,
            bg_color: theme.bg_color,
            link_color: theme.link_color,
            invert: theme.invert,
            dark_mode: theme.dark_mode
        }), () => this._remove())
        const dialog = editor.widget
        dialog.transient_for = this.get_toplevel()
        if (dialog.run() === Gtk.ResponseType.OK) {
            const { theme_name, fg_color, bg_color, link_color, invert, dark_mode }
                = editor.theme
            theme.set_property('theme-name', theme_name)
            theme.set_property('fg-color', fg_color)
            theme.set_property('bg-color', bg_color)
            theme.set_property('link-color', link_color)
            theme.set_property('invert', invert)
            theme.set_property('dark-mode', dark_mode)
            applyTheme(theme)
        }
        dialog.destroy()
    }
})

var ThemeEditor = class ThemeEditor {
    constructor(theme = new Theme(), removeFunc) {
        const builder = Gtk.Builder.new_from_resource(
            '/com/github/johnfactotum/Foliate/ui/themeWindow.ui')

        this.widget = builder.get_object('themeDialog')
        this.theme = theme

        if (removeFunc) {
            const removeButton = builder.get_object('removeButton')
            removeButton.connect('clicked', () => {
                removeFunc()
                this.widget.response(0)
            })
            removeButton.show()
        }

        const nameEntry = builder.get_object('nameEntry')
        const bgButton = builder.get_object('bgButton')
        const fgButton = builder.get_object('fgButton')
        const linkButton = builder.get_object('linkButton')
        const invertSwitch = builder.get_object('invertSwitch')
        const darkModeSwitch = builder.get_object('darkModeSwitch')

        theme.bind_property('theme-name', nameEntry, 'text',
            GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE)
        theme.bind_property('invert', invertSwitch, 'state',
            GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE)
        theme.bind_property('dark-mode', darkModeSwitch, 'state',
            GObject.BindingFlags.BIDIRECTIONAL | GObject.BindingFlags.SYNC_CREATE)

        fgButton.connect('color-set',
            () => theme.set_property('fg-color', fgButton.rgba.to_string()))
        bgButton.connect('color-set',
            () => theme.set_property('bg-color', bgButton.rgba.to_string()))
        linkButton.connect('color-set',
            () => theme.set_property('link-color', linkButton.rgba.to_string()))

        fgButton.rgba = RGBAFromString(theme.fg_color)
        bgButton.rgba = RGBAFromString(theme.bg_color)
        linkButton.rgba = RGBAFromString(theme.link_color)
        theme.connect('notify::fg_color', () =>
            fgButton.rgba = RGBAFromString(theme.fg_color))
        theme.connect('notify::bg_color', () =>
            bgButton.rgba = RGBAFromString(theme.bg_color))
        theme.connect('notify::link_color', () =>
            linkButton.rgba = RGBAFromString(theme.link_color))
    }
}

var makeThemeFromSettings = () => new Theme({
    theme_name: '',
    fg_color: settings.get_string('fg-color'),
    bg_color: settings.get_string('bg-color'),
    link_color: settings.get_string('link-color'),
    invert: settings.get_boolean('invert'),
    dark_mode: settings.get_boolean('prefer-dark-theme'),
})

var applyTheme = theme => {
    const { fg_color, bg_color, link_color, invert, dark_mode } = theme
    settings.set_string('fg-color', fg_color)
    settings.set_string('bg-color', bg_color)
    settings.set_string('link-color', link_color)
    settings.set_boolean('invert', invert)
    settings.set_boolean('prefer-dark-theme', dark_mode)
}

var themes = new Gio.ListStore()
defaultThemes.forEach(theme => themes.append(new Theme(theme)))

var CustomThemes = class CustomThemes {
    constructor() {
        this._themes = new Gio.ListStore()
        this._storage = new Storage('config', 'themes')
        const themes = this._storage.get('themes', [])
        if (Array.isArray(themes))
            themes.forEach(theme => this.addTheme(new Theme(theme), true))
    }
    _onThemesChanged() {
        const themes = []
        const store = this._themes
        const n = store.get_n_items()
        for (let i = 0; i < n; i++) {
            themes.push(store.get_item(i))
        }
        this._storage.set('themes', themes)
    }
    addTheme(theme, init) {
        this._themes.append(theme)
        const f = this._onThemesChanged.bind(this)
        theme.connect('notify::theme-name', f)
        theme.connect('notify::fg-color', f)
        theme.connect('notify::bg_color', f)
        theme.connect('notify::link-color', f)
        theme.connect('notify::invert', f)
        theme.connect('notify::dark-mode', f)
        if (!init) this._onThemesChanged()
    }
    removeTheme(theme) {
        const store = this._themes
        const n = store.get_n_items()
        for (let i = 0; i < n; i++) {
            if (store.get_item(i) === theme) {
                store.remove(i)
                break
            }
        }
        this._onThemesChanged()
    }
    get themes() {
        return this._themes
    }
}

const customThemes = new CustomThemes()
