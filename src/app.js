import Gtk from 'gi://Gtk'
import Adw from 'gi://Adw'
import GObject from 'gi://GObject'
import GLib from 'gi://GLib'
import Gio from 'gi://Gio'
import Gdk from 'gi://Gdk'
import WebKit from 'gi://WebKit'
import { gettext as _ } from 'gettext'
import * as utils from './utils.js'
import { Library } from './library.js'
import { BookViewer } from './book-viewer.js'

const formatVersion = (a, b, c) => `${a ?? '?'}.${b ?? '?'}.${c ?? '?'}`

const getImportVersion = lib =>
    formatVersion(lib.MAJOR_VERSION, lib.MINOR_VERSION, lib.MICRO_VERSION)

const getGJSVersion = () => {
    const [a, b, c, d, e] = imports.system.version.toString()
    return formatVersion(a, b + c, d + e)
}

const getDebugInfo = () => {
    try {
        return `System: ${GLib.get_os_info('NAME') ?? 'Unknown'} ${GLib.get_os_info('VERSION') ?? GLib.get_os_info('BUILD_ID') ?? ''}
Desktop: ${GLib.getenv('XDG_CURRENT_DESKTOP') ?? 'Unknown'}
Session: ${GLib.getenv('XDG_SESSION_DESKTOP') ?? 'UNknown'} (${GLib.getenv('XDG_SESSION_TYPE') ?? 'Unknown'})
Language: ${GLib.getenv('LANG') ?? 'Unknown'}

Versions:
- Foliate ${pkg.version}
- GJS ${getGJSVersion()}
- GTK ${getImportVersion(Gtk)}
- Adwaita ${getImportVersion(imports.gi.Adw)}
- GLib ${getImportVersion(GLib)}
- WebKitGTK ${getImportVersion(WebKit)}

User directories:
- ${GLib.get_user_data_dir()}
- ${GLib.get_user_cache_dir()}
`
    } catch (e) {
        console.error(e)
        return ''
    }
}

const ApplicationWindow = GObject.registerClass({
    GTypeName: 'FoliateApplicationWindow',
    Properties: utils.makeParams({
        'file': 'object',
    }),
}, class extends Adw.ApplicationWindow {
    #library
    #bookViewer
    #stack = new Gtk.Stack()
    constructor(params) {
        super(params)
        Object.assign(this, {
            handle_menubar_accel: false,
            title: pkg.localeName,
            default_width: 1200,
            default_height: 750,
            content: new Adw.ToastOverlay({ child: this.#stack }),
        })

        const styleManager = Adw.StyleManager.get_default()
        if (styleManager.dark) this.add_css_class('is-dark')
        const handler = styleManager.connect('notify::dark', ({ dark }) => {
            if (dark) this.add_css_class('is-dark')
            else this.remove_css_class('is-dark')
        })
        this.connect('destroy', () => styleManager.disconnect(handler))

        utils.addMethods(this, {
            actions: ['open', 'close', 'show-library', 'show-menu', 'new-window', 'open-copy'],
            props: ['fullscreened'],
        })

        utils.bindSettings('window', this,
            ['default-width', 'default-height', 'maximized', 'fullscreened'])

        if (this.file) this.openFile(this.file)
        else this.showLibrary()
    }
    add_toast(toast) {
        this.content.add_toast(toast)
    }
    error(heading, body) {
        const dialog = new Adw.MessageDialog({
            heading, body,
            modal: true,
            transient_for: this,
        })
        dialog.add_response('close', _('Close'))
        dialog.present()
    }
    actionDialog() {
        const window = new Adw.Window({
            modal: true,
            transient_for: this.root,
            content: new Adw.ToolbarView(),
            default_width: 400,
        })
        window.add_controller(utils.addShortcuts({ 'Escape|<ctrl>w': () => window.close() }))
        const header = new Adw.HeaderBar({
            show_title: false,
            show_start_title_buttons: false,
            show_end_title_buttons: false,
        })
        header.pack_start(utils.connect(new Gtk.Button({
            label: _('Cancel'),
        }), { 'clicked': () => window.close() }))
        const button = utils.addClass(new Gtk.Button(), 'suggested-action')
        header.pack_end(button)
        window.content.add_top_bar(header)
        return { button, window }
    }
    openFile(file) {
        this.file = file
        if (!this.#bookViewer) {
            this.#bookViewer = new BookViewer()
            this.#stack.add_child(this.#bookViewer)
        }
        this.#stack.transition_type = Gtk.StackTransitionType.SLIDE_LEFT
        this.#stack.visible_child = this.#bookViewer
        this.#bookViewer.open(file)
    }
    open() {
        const dialog = new Gtk.FileDialog()
        const ebooks = new Gtk.FileFilter({
            name: _('E-Book Files'),
            mime_types: [
                'application/epub+zip',
                'application/x-mobipocket-ebook',
                'application/vnd.amazon.mobi8-ebook',
                'application/x-mobi8-ebook',
                'application/x-fictionbook+xml',
                'application/x-zip-compressed-fb2',
                'application/vnd.comicbook+zip',
            ],
        })
        dialog.filters = new Gio.ListStore()
        dialog.filters.append(new Gtk.FileFilter({
            name: _('All Files'),
            patterns: ['*'],
        }))
        dialog.filters.append(ebooks)
        dialog.default_filter = ebooks
        dialog.open(this, null, (_, res) => {
            try {
                const file = dialog.open_finish(res)
                this.openFile(file)
            } catch (e) {
                if (e instanceof Gtk.DialogError) console.debug(e)
                else console.error(e)
            }
        })
    }
    showLibrary() {
        this.file = null
        this.title = pkg.localeName
        if (!this.#library) {
            this.#library = new Library()
            this.#stack.add_child(this.#library)
        }
        this.#stack.transition_type = Gtk.StackTransitionType.SLIDE_RIGHT
        this.#stack.visible_child = this.#library
        if (this.#bookViewer) {
            this.#stack.remove(this.#bookViewer)
            this.#bookViewer = null
        }
    }
    showMenu() {
        if (this.#bookViewer) this.#bookViewer.showPrimaryMenu()
    }
    addWindow(file) {
        const { application } = this
        const win = new ApplicationWindow({ application, file })
        new Gtk.WindowGroup().add_window(win)
        win.present()
    }
    newWindow() {
        this.addWindow(null)
    }
    openCopy() {
        this.addWindow(this.file)
    }
})

export const Application = GObject.registerClass({
    GTypeName: 'FoliateApplication',
}, class extends Adw.Application {
    constructor(params) {
        super(params)
        this.application_id = pkg.name
        this.flags = Gio.ApplicationFlags.HANDLES_OPEN

        utils.addMethods(this, {
            actions: ['about', 'quit'],
            signals: ['startup', 'activate', 'open', 'window-removed'],
        })

        for (const [key, val] of Object.entries({
            'app.quit': ['<ctrl>q'],
            'app.about': ['F1'],
            'win.close': ['<ctrl>w'],
            'win.fullscreened': ['F11'],
            'win.show-menu': ['F10'],
            'win.open': ['<ctrl>o'],
            'win.open-copy': ['<ctrl>n'],
        })) this.set_accels_for_action(key, val)
    }
    connectStartup() {
        const settings = utils.settings()
        if (settings) {
            const styleManager = Adw.StyleManager.get_default()
            styleManager.color_scheme = settings.get_int('color-scheme')
            styleManager.connect('notify::color-scheme', () =>
                settings.set_int('color-scheme', styleManager.color_scheme))
        }

        const theme = Gtk.IconTheme.get_for_display(Gdk.Display.get_default())
        if (pkg.useResource) theme.add_resource_path(pkg.modulepath('/icons'))
        else theme.add_search_path(pkg.modulepath('/icons'))

        const cssProvider = new Gtk.CssProvider()
        cssProvider.load_from_data(`
            gridview {
                padding: 12px;
            }

            /* remove flowboxchild padding so things align better
               when mixing flowbox and other widgets;
               why does Adwaita has flowboxchild padding, anyway?
               there's already row-/column-spacing, plus you can set margin */
            flowboxchild {
                padding: 0;
            }

            /* fix dark mode background in popovers */
            textview {
                background: none;
            }

            .large-button {
                padding: 6px;
            }
            .small-button {
                transform: scale(.7);
            }
            .chips button {
                border-radius: 9999px;
            }

            checkbutton.theme-selector {
                padding: 0;
                min-height: 44px;
                min-width: 44px;
                padding: 1px;
                background-clip: content-box;
                border-radius: 9999px;
                box-shadow: inset 0 0 0 1px @borders;
            }
            checkbutton.theme-selector:checked {
                box-shadow: inset 0 0 0 2px @theme_selected_bg_color;
            }
            checkbutton.theme-selector.follow {
                background-image: linear-gradient(to bottom right, #fff 49.99%, #202020 50.01%);
            }
            checkbutton.theme-selector.light {
                background-color: #fff;
            }
            checkbutton.theme-selector.dark {
                background-color: #202020;
            }
            checkbutton.theme-selector radio {
                -gtk-icon-source: none;
                border: none;
                background: none;
                box-shadow: none;
                min-width: 12px;
                min-height: 12px;
                transform: translate(27px, 14px);
                padding: 2px;
            }
            checkbutton.theme-selector radio:checked {
                -gtk-icon-source: -gtk-icontheme("object-select-symbolic");
                background-color: @theme_selected_bg_color;
                color: @theme_selected_fg_color;
            }

            .card-sidebar {
                padding: 8px;
            }
            .card-sidebar .card {
                padding: 6px 12px 6px 0;
            }
            .card-sidebar .card:dir(rtl) {
                padding: 6px 0 6px 12px;
            }
            .card-sidebar row {
                margin: 4px 0;
            }
            .card-sidebar, .card-sidebar row.activatable {
                background-color: transparent;
            }
            .card-sidebar.flat-list .card {
                padding: 6px 12px;
            }

            .book-image-frame {
                box-shadow: 0 6px 12px rgba(0, 0, 0, .15);
            }
            .book-image-frame-small {
                box-shadow: 0 3px 6px rgba(0, 0, 0, .15);
                border-radius: 6px;
            }
            .book-image-full {
                box-shadow: 0 0 0 1px rgba(0, 0, 0, .1);
            }
            .overlaid windowcontrols > button > image {
                background: rgba(0, 0, 0, .5);
                color: #fff;
            }
            .overlaid windowcontrols > button:hover > image {
                background: rgba(40, 40, 40, .5);
            }
            .overlaid windowcontrols > button:active > image {
                background: rgba(60, 60, 60, .5);
            }

            .book-list {
                background: transparent;
            }
            .book-list row {
                margin-top: -1px;
                border-top: 1px solid @borders;
            }
            /* set min-width to 1px,
               so we can have variable width progress bars a la Kindle */
            progress, trough {
                min-width: 1px;
            }
        `, -1)
        Gtk.StyleContext.add_provider_for_display(
            Gdk.Display.get_default(),
            cssProvider,
            Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION)
    }
    connectActivate(application) {
        if (this.activeWindow) {
            this.activeWindow.present()
            return
        }
        const win = new ApplicationWindow({ application })
        new Gtk.WindowGroup().add_window(win)
        win.present()
    }
    connectOpen(application, files) {
        const oldWins = this.get_windows()
        file: for (const file of files) {
            for (const oldWin of oldWins) {
                if (oldWin.file?.get_uri() === file.get_uri()) {
                    oldWin.present()
                    continue file
                }
            }
            const win = new ApplicationWindow({ application, file })
            new Gtk.WindowGroup().add_window(win)
            win.present()
        }
    }
    connectWindowRemoved(application, window) {
        // this seems to be needed for destroying the web view
        window.run_dispose()
    }
    about() {
        const win = new Adw.AboutWindow({
            application_name: pkg.localeName,
            application_icon: pkg.name,
            version: pkg.version,
            comments: _('Read e-books in style'),
            developer_name: 'John Factotum',
            developers: ['John Factotum'],
            artists: ['John Factotum', 'Tobias Bernard <tbernard@gnome.org>'],
            // Translators: put your names here, one name per line
            // they will be shown in the "About" dialog
            translator_credits: _('translator-credits'),
            license_type: Gtk.License.GPL_3_0,
            website: 'https://johnfactotum.github.io/foliate/',
            issue_url: 'https://github.com/johnfactotum/foliate/issues',
            support_url: 'https://github.com/johnfactotum/foliate/blob/gtk4/docs/faq.md',
            debug_info: getDebugInfo(),
            modal: true,
            transient_for: this.active_window,
        })
        win.add_link(_('Source Code'), 'https://github.com/johnfactotum/foliate')
        win.add_legal_section('foliate-js', null, Gtk.License.MIT_X11, null)
        win.add_legal_section('zip.js',
            'Copyright © 2022 Gildas Lormeau',
            Gtk.License.BSD_3, null)
        win.add_legal_section('fflate',
            'Copyright © 2020 Arjun Barrett',
            Gtk.License.MIT_X11, null)
        win.add_legal_section('PDF.js',
            '©Mozilla and individual contributors',
            Gtk.License.APACHE_2_0, null)
        win.present()
    }
})
