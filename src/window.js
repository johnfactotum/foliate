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

const { GObject, Gtk, Gio, Gdk, Pango } = imports.gi

const {
    locales, formatPercent, formatMinutes, fileFilters,
    setPopoverPosition, doubleInvert, brightenColor,
    mimetypeCan
} = imports.utils
const { EpubView, EpubViewAnnotation } = imports.epubView
const { ContentsStack, FindBox,
    FootnotePopover, AnnotationBox, ImageViewer } = imports.contents
const { DictionaryBox, WikipediaBox, TranslationBox } = imports.lookup
const { tts, TtsButton } = imports.tts
const { themes, customThemes, ThemeRow, applyTheme } = imports.theme
const { exportAnnotations, importAnnotations } = imports.export
const { PropertiesWindow } = imports.properties

const settings = new Gio.Settings({ schema_id: pkg.name })
const windowState = new Gio.Settings({ schema_id: pkg.name + '.window-state' })
const viewSettings = new Gio.Settings({ schema_id: pkg.name + '.view' })

const SelectionPopover = GObject.registerClass({
    GTypeName: 'FoliateSelectionPopover',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/selectionPopover.ui',
    InternalChildren: [
        'copyButton',
        'ttsButton', 'ttsSeparator', 'ttsModelButton'
    ]
}, class SelectionPopover extends Gtk.PopoverMenu {
    _init(params) {
        super._init(params)
        this._showTts(tts.enabled)
        this._ttsHandler = tts.connect('notify::enabled', () =>
            this._showTts(tts.enabled))

        this.connect('closed', () => this._onClosed())
        this._copyButton.connect('clicked', () => this.popdown())
        this._ttsModelButton.connect('clicked', () => this.popdown())
    }
    _showTts(enabled) {
        this._ttsSeparator.visible = enabled
        this._ttsModelButton.visible = enabled
    }
    popup() {
        super.popup()
        this._isAlreadySpeaking = this._ttsButton.active
    }
    _onClosed() {
        if (!this._isAlreadySpeaking) this._ttsButton.active = false
        this._ttsButton.destroy()
        tts.disconnect(this._ttsHandler)
    }
})

const MainMenu = GObject.registerClass({
    GTypeName: 'FoliateMainMenu',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/mainMenu.ui',
    InternalChildren: [
        'zoomRestoreButton', 'fullscreenButton',
        'brightnessScale', 'fontButton', 'spacingButton', 'marginButton', 'maxWidthButton',
        'customThemesListBox', 'customThemesSep', 'themesListBox'
    ]
}, class MainMenu extends Gtk.PopoverMenu {
    _init(params) {
        super._init(params)
        this._fullscreenButton.connect('clicked', () => this.popdown())

        const flag = Gio.SettingsBindFlags.DEFAULT
        viewSettings.bind('font', this._fontButton, 'font', flag)
        viewSettings.bind('spacing', this._spacingButton, 'value', flag)
        viewSettings.bind('margin', this._marginButton, 'value', flag)
        viewSettings.bind('max-width', this._maxWidthButton, 'value', flag)
        viewSettings.bind('brightness', this._brightnessScale.adjustment, 'value', flag)

        this._updateZoom()
        const zoomHandler = viewSettings.connect('changed::zoom-level',
            this._updateZoom.bind(this))
        this.connect('destroy', () => settings.disconnect(zoomHandler))

        const bindThemesListBoxes = themesListBox => {
            themesListBox.set_header_func((row) => {
                if (row.get_index()) row.set_header(new Gtk.Separator())
            })
            themesListBox.connect('row-activated', (_, row) =>
                applyTheme(row.theme))
        }
        bindThemesListBoxes(this._themesListBox)
        bindThemesListBoxes(this._customThemesListBox)
        this._themesListBox.bind_model(themes, theme =>
            new ThemeRow(theme))
        this._customThemesListBox.bind_model(customThemes.themes, theme =>
            new ThemeRow(theme, true))

        this._showCustomThemes()
        const customThemesHandler = customThemes.themes.connect('items-changed',
            this._showCustomThemes.bind(this))
        this.connect('destroy', () => customThemes.themes.disconnect(customThemesHandler))
    }
    _showCustomThemes() {
        const hasCustomThemes = Boolean(customThemes.themes.get_n_items())
        this._customThemesListBox.visible = hasCustomThemes
        this._customThemesSep.visible = hasCustomThemes
    }
    _updateZoom() {
        const zoomLevel = viewSettings.get_double('zoom-level')
        this._zoomRestoreButton.label = formatPercent(zoomLevel)
    }
    set fullscreen(isFullscreen) {
        const fullscreenImage = this._fullscreenButton.get_child()
        if (isFullscreen) {
            fullscreenImage.icon_name = 'view-restore-symbolic'
            this._fullscreenButton.tooltip_text = _('Leave fullscreen')
        } else {
            fullscreenImage.icon_name = 'view-fullscreen-symbolic'
            this._fullscreenButton.tooltip_text = _('Fullscreen')
        }
    }
})

const NavBar = GObject.registerClass({
    GTypeName: 'FoliateNavBar',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/navBar.ui',
    Children: ['locationMenu'],
    InternalChildren: [
        'box', 'prevImage', 'nextImage', 'backImage',
        'locationStack', 'locationLabel', 'locationScale',
        'locationButton', 'timeInBook', 'timeInChapter',
        'sectionEntry', 'locationEntry', 'cfiEntry',
        'sectionTotal', 'locationTotal',
        'fallbackScale',
        'timeBox', 'timeSep', 'locLabel', 'locBox', 'navSep', 'navBox'
    ]
}, class NavBar extends Gtk.ActionBar {
    set epub(epub) {
        this._epub = epub

        this._epub.connect('metadata', () => {
            const rtl = this._epub.metadata.direction === 'rtl'
            const dir = rtl ? Gtk.TextDirection.RTL : Gtk.TextDirection.LTR
            this._box.set_direction(dir)
            this._locationScale.set_direction(dir)
            this._prevImage.set_direction(dir)
            this._nextImage.set_direction(dir)
            this._backImage.set_direction(dir)
            this._navBox.set_direction(dir)
            this._navBox.foreach(button => button.get_child().set_direction(dir))
        })

        this._epub.connect('locations-fallback', () => this._status = 'fallback')
        this._epub.connect('locations-ready', () => {
            this._epub.sectionMarks.then(sectionMarks => {
                this._setSectionMarks(sectionMarks)
                this._status = 'loaded'
                this._update()
            })
        })
        this._epub.connect('book-loading', () => this._status = 'loading')
        this._epub.connect('relocated', () => this._update())

        this.connect('size-allocate', () => this._onSizeAllocate())
        this._locationScale.connect('button-release-event', () => this._onlocationScaleChanged())
        this._fallbackScale.connect('button-release-event', () => this._onFallbackScaleChanged())
        this._sectionEntry.connect('activate', () => this._onSectionEntryActivate())
        this._locationEntry.connect('activate', () => this._onLocationEntryActivate())
        this._cfiEntry.connect('activate', () => this._onCfiEntryActivate())
    }
    set _status(status) {
        this._locationStack.visible_child_name = status
        this._timeBox.visible
        = this._timeSep.visible
        = this._locLabel.visible
        = this._locBox.visible
        = this._navSep.visible
        = this._navBox.visible
        = status === 'loaded'
    }
    get _status() {
        return this._locationStack.visible_child_name
    }
    _setSectionMarks(sectionMarks) {
        this._locationScale.clear_marks()
        if (sectionMarks.length < 60) sectionMarks.forEach(x =>
            this._locationScale.add_mark(x, Gtk.PositionType.TOP, null))
    }
    _update() {
        const {
            section, sectionTotal, locationTotal,
            timeInBook, timeInChapter,
        } = this._epub.location
        const { cfi, location, percentage } = this._epub.location.start

        this._locationScale.set_value(percentage)

        const status = this._status
        const progress = status === 'fallback'
            ? (section + 1) / sectionTotal
            : percentage
        this._locationLabel.label = status === 'loading' ? '' : formatPercent(progress)

        this._timeInBook.label = formatMinutes(timeInBook)
        this._timeInChapter.label = formatMinutes(timeInChapter)
        this._sectionEntry.text = (section + 1).toString()
        this._locationEntry.text = (location + 1).toString()
        this._cfiEntry.text = cfi
        this._sectionTotal.label = _('of %d').format(sectionTotal)
        this._locationTotal.label = _('of %d').format(locationTotal + 1)

        this._fallbackScale.set_range(1, sectionTotal)
        this._fallbackScale.set_value(section + 1)
    }
    _onSectionEntryActivate() {
        const x = parseInt(this._sectionEntry.text) - 1
        this._epub.goTo(x)
    }
    _onLocationEntryActivate() {
        const x = parseInt(this._locationEntry.text) - 1
        this._epub.goToLocation(x)
    }
    _onCfiEntryActivate() {
        this._epub.goTo(this._cfiEntry.text)
    }
    _onlocationScaleChanged() {
        const value = this._locationScale.get_value()
        this._epub.goToPercentage(value)
    }
    _onFallbackScaleChanged() {
        const value = this._fallbackScale.get_value()
        this._epub.goTo(Math.round(value) - 1)
    }
    _onSizeAllocate() {
        const narrow = this.get_allocation().width < 500
        this._locationScale.visible = !narrow
        this._fallbackScale.visible = !narrow
    }
    toggleLocationMenu() {
        return this._locationButton.active = !this._locationButton.active
    }
})

const Footer = GObject.registerClass({
    GTypeName: 'FoliateFooter',
}, class Footer extends Gtk.Box {
    _init(params) {
        super._init(params)
        this._locationsFallback = false
        const labelOpts = {
            visible: true,
            ellipsize: Pango.EllipsizeMode.END,
            margin_start: 18,
            margin_end: 18
        }
        this._left = new Gtk.Label(labelOpts)
        this._right = new Gtk.Label(labelOpts)
        this._left.get_style_context().add_class('foliate-autohide-label')
        this._right.get_style_context().add_class('foliate-autohide-label')
        this.pack_start(this._left, true, true, 0)
        this.pack_start(this._right, true, true, 0)

        const hl = settings.connect('changed::footer-left', this._update.bind(this))
        const hr = settings.connect('changed::footer-right', this._update.bind(this))
        this.connect('destroy', () => {
            settings.disconnect(hl)
            settings.disconnect(hr)
        })
    }
    set epub(epub) {
        this._epub = epub
        this._epub.connect('metadata', () => {
            const rtl = this._epub.metadata.direction === 'rtl'
            const dir = rtl ? Gtk.TextDirection.RTL : Gtk.TextDirection.LTR
            this.set_direction(dir)
            this._left.set_direction(dir)
            this._right.set_direction(dir)
        })
        this._epub.connect('book-loading', () => {
            this._left.label = '…'
            this._right.label = '…'
        })
        this._epub.connect('locations-fallback', () => this._locationsFallback = true)
        this._epub.connect('locations-ready', () => this._locationsFallback = false)
        this._epub.connect('relocated', () => {
            this._update()
        })
        this._epub.connect('spread', (_, spread) => {
            this._spread = spread
            this._update()
        })
    }
    _update() {
        const spread = this._spread
        this._setLabel(this._left)
        this._setLabel(this._right)

        this.homogeneous = spread
        if (!spread) {
            const lv = this._left.label !== ''
                && settings.get_string('footer-left')
                    !== settings.get_string('footer-right')
            const rv = this._right.label !== ''

            this._left.visible = lv
            this._right.visible = rv

            this._left.xalign =  rv ? 1 : 0.5
            this._left.margin_end = rv ? 12 : 18

            this._right.xalign =  lv ? 0 : 0.5
            this._right.margin_start = lv ? 12 : 18
        } else {
            this._left.visible = true
            this._right.visible = true
            this._left.xalign = 0.5
            this._right.xalign = 0.5
        }
    }
    _setLabel(label) {
        if (!this._epub.location) return
        const { start, end, locationTotal, section, sectionTotal,
            timeInBook, timeInChapter } = this._epub.location
        const isLeft = label === this._left
        const type = isLeft
            ? settings.get_string('footer-left')
            : settings.get_string('footer-right')
        const p = isLeft && this._spread ? start : end

        const of = (a, b) => _('%d of %d').format(a, b)

        let s = ''
        switch (type) {
            case 'percentage':
                if (this._locationsFallback)
                    s = formatPercent((section + 1) / sectionTotal)
                else if (locationTotal)
                    s = formatPercent(p.percentage)
                else s = '…'
                break
            case 'location':
                if (this._locationsFallback)
                    s = of(section + 1, sectionTotal)
                else if (locationTotal > 0)
                    s = of(p.location + 1, locationTotal + 1)
                else s = '…'
                break
            case 'section':
                s = of(section + 1, sectionTotal)
                break
            case 'section-name':
                s = p.label
                break
            case 'time-left-section':
                if (locationTotal) s = formatMinutes(timeInChapter)
                break
            case 'time-left-book':
                if (locationTotal) s = formatMinutes(timeInBook)
                break
            case 'clock':
                try {
                    s = new Date().toLocaleTimeString(locales,
                        { hour: '2-digit', minute: '2-digit' })
                } catch (e) {
                    s = new Date().toLocaleTimeString([],
                        { hour: '2-digit', minute: '2-digit' })
                }
                break
        }
        label.label = s
    }
})

const MainOverlay = GObject.registerClass({
    GTypeName: 'FoliateMainOverlay',
    Template: 'resource:///com/github/johnfactotum/Foliate/ui/mainOverlay.ui',
    InternalChildren: [
        'overlayStack', 'mainBox', 'bookBox', 'contentBox', 'divider',
        'recentMenu', 'msg',
        'downloadProgressBar'
    ]
}, class MainOverlay extends Gtk.Overlay {
    _init(params) {
        super._init(params)
        this._skeuomorphism = false
        this._navBar = new NavBar({ visible: true })
        this._navBar.get_style_context().add_class('background')
        this._footer = new Footer({ visible: true })
        this._autohideDivider = new Gtk.Box({
            halign: Gtk.Align.CENTER,
            width_request: 1
        })
        this._autohideDivider.get_style_context().add_class('foliate-spread-divider')

        const dummyButton = new Gtk.Button({ visible: true, opacity: 0 })
        const dummyScale = new Gtk.Scale({ visible: true, opacity: 0, draw_value: false })
        dummyScale.add_mark(0, Gtk.PositionType.TOP, null)
        const dummyNavBar = new Gtk.ActionBar({ visible: true, opacity: 0 })
        dummyNavBar.pack_start(dummyButton)
        dummyNavBar.pack_start(dummyScale)

        this._autohide = new AutoHide({ visible: true })
        this._autohide.setWidget(dummyNavBar)
        this._autohide.addOverlay(this._footer)
        this._autohide.addOverlay(this._autohideDivider)
        this._autohide.setOverlay(this._navBar)
        this._bookBox.pack_start(this._autohide, false, true, 0)

        const show = widget => widget.visible ? this._autohide.stayReveal(true) : null
        const hide = () => this._autohide.stayReveal(false)
        this._navBar.locationMenu.connect('notify::visible', show)
        this._navBar.locationMenu.connect('closed', hide)

        this._recentMenu.connect('item-activated', () => {
            const uri = this._recentMenu.get_current_uri()
            const file = Gio.File.new_for_uri(uri)
            this.get_toplevel().open(file)
        })
    }
    _updateMarginSize() {
        const width = this._autohide.get_allocation().width
        const margin = this._epub.settings.margin
        const maxWidth = this._epub.settings.max_width
        const marginSize = Math.max(0,
            width * margin / 100,
            Math.max(width - maxWidth, 0) / 2)
        this._footer.margin_end = marginSize
        this._footer.margin_start = marginSize
    }
    set epub(epub) {
        this._epub = epub
        this._footer.epub = this._epub
        this._navBar.epub = this._epub
        this._contentBox.add(this._epub.widget)

        const connections = [
            this._epub.connect('book-displayed', () => this._setStatus('loaded')),
            this._epub.connect('book-loading', () => this._setStatus('loading')),
            this._epub.connect('book-downloading', (epub, progress) => {
                this._setStatus('downloading')
                this._downloadProgressBar.fraction = progress
            }),
            this._epub.connect('book-error', (_, msg) => {
                this._msg.label = msg
                this._setStatus('error')
            }),
            this._epub.connect('spread', (_, spread) => {
                this._spread = spread
                this._showDivider()
            }),
            this._epub.connect('notify::margin', () => this._updateMarginSize()),
            this._epub.connect('notify::max-width', () => this._updateMarginSize()),
        ]
        this._autohide.connect('size-allocate', () => this._updateMarginSize()),
        this.connect('destroy', () => {
            connections.forEach(connection => this._epub.disconnect(connection))
        })
    }
    _setStatus(status) {
        const loaded = status === 'loaded'
        this._mainBox.opacity = loaded ? 1 : 0
        this._overlayStack.visible = !loaded
        if (!loaded) this._overlayStack.visible_child_name = status
    }
    toggleNavBar() {
        return this._autohide.toggle()
    }
    toggleLocationMenu() {
        this._navBar.toggleLocationMenu()
    }
    get navbarVisible() {
        return this._autohide.revealed
    }
    _showDivider() {
        const showDivider = this._skeuomorphism && this._spread
        this._divider.visible = showDivider
        this._autohideDivider.visible = showDivider
    }
    skeuomorph(enabled) {
        this._skeuomorphism = enabled
        this._showDivider()
        if (!enabled) return this._bookBox.get_style_context()
            .remove_class('foliate-skeuomorph-page')

        const cssProvider = new Gtk.CssProvider()
        const invert = viewSettings.get_boolean('invert') ? doubleInvert : (x => x)
        const brightness = viewSettings.get_double('brightness')
        const bgColor = brightenColor(invert(viewSettings.get_string('bg-color')), brightness)
        const shadowColor = 'rgba(0, 0, 0, 0.2)'
        cssProvider.load_from_data(`
            .foliate-skeuomorph-page {
                margin: 12px 24px;
                box-shadow:
                    -26px 0 0 -14px ${shadowColor},
                    -26px 0 0 -15px ${bgColor},

                    26px 0 0 -14px ${shadowColor},
                    26px 0 0 -15px ${bgColor},

                    -18px 0 0 -9px ${shadowColor},
                    -18px 0 0 -10px ${bgColor},

                    18px 0 0 -9px ${shadowColor},
                    18px 0 0 -10px ${bgColor},

                    -10px 0 0 -4px ${shadowColor},
                    -10px 0 0 -5px ${bgColor},

                    10px 0 0 -4px ${shadowColor},
                    10px 0 0 -5px ${bgColor},

                    0 0 15px 5px ${shadowColor},
                    0 0 0 1px ${shadowColor};
            }
            .foliate-spread-divider {
                background: rgba(0, 0, 0, 0.3);
                box-shadow: 0 0 10px 5px rgba(0, 0, 0, 0.15);
            }`)
        const styleContext = this._bookBox.get_style_context()
        styleContext.add_class('foliate-skeuomorph-page')
        Gtk.StyleContext.add_provider_for_screen(
            Gdk.Screen.get_default(),
            cssProvider,
            Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION)
    }
})

const makeContentsStackPageAction = (self, page) => () => {
    const sb = self.activeHeaderBar.sideButton
    const sbb = self.activeHeaderBar.sidebarButton
    const stack = self._contentsStack
    let button = sb.visible ? sb : sbb
    if (button.active) {
        if (stack.visible_child_name !== page)
            stack.visible_child_name = page
        else button.active = false
    } else {
        stack.visible_child_name = page
        button.active = true
    }
}

const makeActions = self => ({
    'selection-menu': () => self._showSelectionPopover(),
    'selection-copy': () => {
        Gtk.Clipboard.get_default(Gdk.Display.get_default())
            .set_text(self._epub.selection.text, -1)
    },
    'selection-highlight': () => {
        const { identifier } = self._epub.metadata
        const warn = identifier.startsWith('foliate:')
            || !mimetypeCan.annotate(self._epub.contentType)
        if (warn) {
            const msg = new Gtk.MessageDialog({
                text: _('This file or format does not work well with annotations'),
                secondary_text: _('Your annotations might stop working properly at any time.'),
                message_type: Gtk.MessageType.QUESTION,
                modal: true,
                transient_for: self
            })
            msg.add_button(_('Cancel'), Gtk.ResponseType.CANCEL)
            msg.add_button(_('Continue Anyway'), Gtk.ResponseType.ACCEPT)
            msg.set_default_response(Gtk.ResponseType.CANCEL)
            const res = msg.run()
            msg.destroy()
            if (res !== Gtk.ResponseType.ACCEPT) return
        }
        const { cfi, text } = self._epub.selection
        const color = settings.get_string('highlight')
        self._epub.addAnnotation(new EpubViewAnnotation({ cfi, color, text, note: '' }))
        self._epub.emit('highlight-menu')
    },
    'selection-unhighlight': () => {
        const annotation = self._epub.annotation
        self._epub.removeAnnotation(annotation)
        if (self._highlightMenu.visible) self._highlightMenu.popdown()
    },
    'selection-dictionary': () => {
        const { language, text } = self._epub.selection
        const popover = new Gtk.Popover()
        const dictionaryBox = new DictionaryBox({ border_width: 10 },
            settings.get_string('dictionary'))
        dictionaryBox.dictCombo.connect('changed', () =>
            settings.set_string('dictionary', dictionaryBox.dictCombo.active_id))
        popover.add(dictionaryBox)
        dictionaryBox.lookup(text, language)
        self._showPopover(popover)
    },
    'selection-wikipedia': () => {
        const { language, text } = self._epub.selection
        const popover = new Gtk.Popover()
        const wikipediaBox = new WikipediaBox({ border_width: 10 })
        popover.add(wikipediaBox)
        wikipediaBox.lookup(text, language)
        self._showPopover(popover)
    },
    'selection-translate': () => {
        const { text } = self._epub.selection
        const popover = new Gtk.Popover()
        const translationBox = new TranslationBox({ border_width: 10 },
            settings.get_string('translate-target-language'))
        translationBox.langCombo.connect('changed', () =>
            settings.set_string('translate-target-language',
                translationBox.langCombo.active_id))
        popover.add(translationBox)
        translationBox.lookup(text)
        self._showPopover(popover)
    },
    'selection-find': () => {
        const { text } = self._epub.selection
        self._findBox.find(text)
        self.activeHeaderBar.toggleFind()
    },
    'selection-speech-start': () => {
        tts.epub = self._epub
        tts.start(self._epub.selection.cfi)
    },
    'speak': () => {
        if (!tts.enabled) return
        tts.epub = self._epub
        if (tts.speaking) tts.stop()
        else tts.start()
    },

    'side-menu': () => self.activeHeaderBar.toggleSide(),
    'show-toc': makeContentsStackPageAction(self, 'toc'),
    'show-annotations': makeContentsStackPageAction(self, 'annotations'),
    'show-bookmarks': makeContentsStackPageAction(self, 'bookmarks'),
    'find-menu': () => self.activeHeaderBar.toggleFind(),
    'main-menu': () => self.activeHeaderBar.toggleMain(),
    'location-menu': () => self._mainOverlay.toggleLocationMenu(),

    'fullscreen': () =>
        self._fullscreen ? self.unfullscreen() : self.fullscreen(),
    'unfullscreen': () => self.unfullscreen(),

    'properties': () => {
        const window = new PropertiesWindow({
            modal: true,
            title: _('About This Book'),
            transient_for: self,
            use_header_bar: true
        }, self._epub.metadata, self._epub.cover)
        window.packFindBookOnButton()
        window.show()
    },
    'open-copy': () => {
        const window = new self.constructor({
            application: self.application,
            file: self.file
        })
        window.present()
    },
    'open': () => {
        const dialog = Gtk.FileChooserNative.new(
            _('Open File'),
            self,
            Gtk.FileChooserAction.OPEN,
            null, null)
        dialog.add_filter(fileFilters.all)
        dialog.add_filter(fileFilters.ebook)
        dialog.set_filter(fileFilters.ebook)

        if (dialog.run() === Gtk.ResponseType.ACCEPT) self.open(dialog.get_file())
    },
    'reload': () => {
        self.open(self.file)
    },
    'export-annotations': () => {
        const data = self._epub.data
        exportAnnotations(self, data, self._epub.metadata, cfi =>
            self._epub.getSectionFromCfi(cfi).then(x => x.label))
            .catch(e => logError(e))
    },
    'import-annotations': () => {
        const annotations = importAnnotations(self, self._epub)
        if (annotations) annotations.forEach(annotation =>
            self._epub.addAnnotation(annotation))
    },
    'close': () => self.close(),
})

const FullscreenOverlay = GObject.registerClass({
    GTypeName: 'FoliateFullscreenOverlay'
}, class FullscreenOverlay extends Gtk.Overlay {
    _init(params) {
        super._init(params)
        this.stayVisible = false
        this.alwaysVisible = false

        this._eventBox = new Gtk.EventBox({ valign: Gtk.Align.START })
        this._revealer = new Gtk.Revealer({ visible: true })
        this._eventBox.add(this._revealer)
        this.add_overlay(this._eventBox)

        this._eventBox.connect('enter-notify-event', () =>  this.reveal(true))
        this._eventBox.connect('leave-notify-event', () => this.reveal(false))
    }
    setOverlay(widget) {
        this._revealer.add(widget)
    }
    set enabled(enabled) {
        this._eventBox.visible = enabled
    }
    reveal(reveal) {
        this._revealer.reveal_child =  this.alwaysVisible || this.stayVisible || reveal
    }
    stayReveal(reveal) {
        this.stayVisible = reveal
        this.reveal(reveal)
    }
    alwaysReveal(reveal) {
        this.alwaysVisible = reveal
        this.reveal(reveal)
    }
})

const AutoHide =  GObject.registerClass({
    GTypeName: 'FoliateAutoHide',
}, class AutoHide extends Gtk.Frame {
    _init(params) {
        super._init(params)
        this.shadow_type = Gtk.ShadowType.NONE
        this.get_style_context().add_class('foliate-autohide-container')

        this.stayVisible = false
        this.alwaysVisible = false

        const eventBox = new Gtk.EventBox({ visible: true })
        this._overlay = new Gtk.Overlay({ visible: true })
        this._revealer = new Gtk.Revealer({
            visible: true,
            transition_type: Gtk.RevealerTransitionType.CROSSFADE
        })
        this._overlay.add_overlay(this._revealer)
        eventBox.add(this._overlay)
        this.add(eventBox)

        eventBox.connect('enter-notify-event', () =>  this.reveal(true))
        eventBox.connect('leave-notify-event', () => this.reveal(false))
    }
    setWidget(widget) {
        this._overlay.add(widget)
    }
    addOverlay(widget) {
        this._overlay.add_overlay(widget)
        this._overlay.reorder_overlay(this._revealer, -1)
    }
    setOverlay(widget) {
        this._revealer.add(widget)
    }
    reveal(reveal) {
        this._revealer.reveal_child =  this.alwaysVisible || this.stayVisible || reveal
    }
    get revealed() {
        return this._revealer.reveal_child
    }
    toggle() {
        this.alwaysReveal(!this.revealed)
        return this.revealed
    }
    stayReveal(reveal) {
        this.stayVisible = reveal
        this.reveal(reveal)
    }
    alwaysReveal(reveal) {
        this.alwaysVisible = reveal
        this.reveal(reveal)
    }
})

const HeaderBar = GObject.registerClass({
    GTypeName: 'FoliateHeaderBar',
    Properties: {
        'fullscreen': GObject.ParamSpec.boolean('fullscreen', 'fullscreen', 'fullscreen',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY, false)
    }
}, class HeaderBar extends Gtk.HeaderBar {
    _init(params) {
        super._init(params)
        this.show_close_button = true
        this.has_subtitle = false
        this.get_style_context().add_class('titlebar')

        this.sideButton = this._makeMenuButton(_('Contents'), 'view-list-symbolic')
        this.sidebarButton = new Gtk.ToggleButton({
            visible: true,
            valign: Gtk.Align.CENTER,
            tooltip_text: _('Show sidebar'),
            image: new Gtk.Image({
                visible: true, icon_name: 'sidebar-show-symbolic' }),
        })
        windowState.bind('show-sidebar', this.sidebarButton, 'active',
            Gio.SettingsBindFlags.DEFAULT)
        this.pack_start(this.sidebarButton)
        this.pack_start(this.sideButton)
        this._showSideButton()
        settings.connect('changed::use-sidebar', () => this._showSideButton())

        this.findButton = this._makeMenuButton(_('Find'), 'edit-find-symbolic')
        this.mainButton = this._makeMenuButton(_('Menu'), 'open-menu-symbolic')
        if (this.fullscreen) {
            this.fullscreenButton = new Gtk.Button({
                visible: true,
                valign: Gtk.Align.CENTER,
                tooltip_text: _('Leave fullscreen'),
                image: new Gtk.Image({
                    visible: true, icon_name: 'view-restore-symbolic' }),
            })
            this.fullscreenButton.action_name = 'win.unfullscreen'
            this.pack_end(this.fullscreenButton)
        }
        this.pack_end(this.mainButton)
        this.pack_end(this.findButton)
    }
    _showSideButton() {
        const useSidebar = settings.get_boolean('use-sidebar')
        this.sideButton.visible = !useSidebar
        this.sidebarButton.visible = useSidebar
    }
    _makeMenuButton(text, icon) {
        return new Gtk.MenuButton({
            visible: true,
            valign: Gtk.Align.CENTER,
            tooltip_text: text,
            image: new Gtk.Image({ visible: true, icon_name: icon }),
        })
    }
    get loading() {
        return this._loading
    }
    set loading(state) {
        this._loading = state
        this.sideButton.sensitive = !state
        this.findButton.sensitive = !state
    }
    setPopovers(side, find, main) {
        this.sideButton.popover = side
        this.findButton.popover = find
        this.mainButton.popover = main
    }
    unsetPopovers() {
        this.sideButton.popover = null
        this.findButton.popover = null
        this.mainButton.popover = null
    }
    grabPopovers() {
        this.sideButton.popover.relative_to = this.sideButton
        this.findButton.popover.relative_to = this.findButton
        this.mainButton.popover.relative_to = this.mainButton
    }
    toggleSide() {
        const button = settings.get_boolean('use-sidebar')
            ? this.sidebarButton : this.sideButton
        button.active = !button.active
    }
    toggleFind() {
        this.findButton.active = !this.findButton.active
    }
    toggleMain() {
        this.mainButton.active = !this.mainButton.active
    }
})

var Window = GObject.registerClass({
    GTypeName: 'FoliateWindow',
    Properties: {
        file: GObject.ParamSpec.object('file', 'file', 'file',
            GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT_ONLY, Gio.File.$gtype),
        ephemeral:
            GObject.ParamSpec.boolean('ephemeral', 'ephemeral', 'ephemeral',
                GObject.ParamFlags.READWRITE | GObject.ParamFlags.CONSTRUCT, false),
    }
}, class Window extends Gtk.ApplicationWindow {
    _init(params) {
        super._init(params)
        this._loading = false

        this._epub = new EpubView({ ephemeral: this.ephemeral })
        settings.bind('img-event-type', this._epub, 'img-event-type',
            Gio.SettingsBindFlags.DEFAULT)
        this.insert_action_group('view', this._epub.actionGroup)
        this._connectEpub()
        this.connect('destroy', () => {
            this._epub.close()
            tts.stop()
        })

        this._fullscreenOverlay = new FullscreenOverlay({ visible: true })
        this.add(this._fullscreenOverlay)

        this._mainOverlay = new MainOverlay({ visible: true })
        this._mainOverlay.epub = this._epub

        this._buildContents()

        this._buildPopovers()

        this._buildMain()
        const mainHandler =
            settings.connect('changed::use-sidebar', () => this._buildMain())

        const useMenubar = settings.get_boolean('use-menubar')

        if (useMenubar) {
            this.show_menubar = true
        } else {
            this.show_menubar = false
            this._buildFullscreenHeaderBar()

            this._buildHeaderBar()
            const headerBarHandler =
                viewSettings.connect('changed::skeuomorphism', () => this._buildHeaderBar())
            const headerBarHandlers = [
                settings.connect('changed::use-sidebar', () => this._buildHeaderBar()),
                settings.connect('changed::autohide-headerbar', () => this._buildHeaderBar())
            ]
            this.connect('destroy', () => {
                viewSettings.disconnect(headerBarHandler)
                headerBarHandlers.forEach(x => settings.disconnect(x))
            })
        }

        this._themeUI()
        const themeHandlers = [
            viewSettings.connect('changed::bg-color', () => this._themeUI()),
            viewSettings.connect('changed::fg-color', () => this._themeUI()),
            viewSettings.connect('changed::invert', () => this._themeUI()),
            viewSettings.connect('changed::brightness', () => this._themeUI()),
            viewSettings.connect('changed::skeuomorphism', () => this._themeUI())
        ]

        const updateTTS = () => tts.command = settings.get_string('tts-command')
        updateTTS()
        const ttsHandler = settings.connect('changed::tts-command', updateTTS)

        const actions = makeActions(this)
        Object.keys(actions).forEach(name => {
            const action = new Gio.SimpleAction({ name })
            action.connect('activate', actions[name])
            this.add_action(action)
        })

        const overlay = Gtk.Builder.new_from_resource(
            '/com/github/johnfactotum/Foliate/ui/shortcutsWindow.ui')
            .get_object('shortcutsWindow')
        overlay.section_name = 'shortcuts'
        this.set_help_overlay(overlay)

        this.default_width = windowState.get_int('width')
        this.default_height = windowState.get_int('height')
        if (windowState.get_boolean('maximized')) this.maximize()
        if (windowState.get_boolean('fullscreen')) this.fullscreen()

        if (this.file) this.open(this.file)

        this.connect('window-state-event', (_, event) => {
            const state = event.get_window().get_state()
            this._fullscreen = Boolean(state & Gdk.WindowState.FULLSCREEN)
            this._mainPopover.fullscreen = this._fullscreen

            this._fullscreenOverlay.enabled = this._fullscreen
            this._fullscreenOverlay.alwaysReveal(this._mainOverlay.navbarVisible)
            if (this._autoHideHeaderBar)
                this._autoHideHeaderBar
                    .alwaysReveal(this.loading || this._mainOverlay.navbarVisible)
            if (this.activeHeaderBar) this.activeHeaderBar.grabPopovers()
        })
        this.connect('size-allocate', () => {
            const [width, height] = this.get_size()
            this._width = width
            this._height = height

            const popoverHeight = Math.max(150, height * 0.7)
            if (this._findBox) this._findBox.height_request = popoverHeight
            if (this._contentsStack) this._contentsStack.height_request = popoverHeight
        })
        this.connect('destroy', () => {
            windowState.set_int('width', this._width)
            windowState.set_int('height', this._height)
            windowState.set_boolean('maximized', this.is_maximized)
            windowState.set_boolean('fullscreen', this._fullscreen)
            if (this.file)
                windowState.set_string('last-file', this.file.get_path())

            settings.disconnect(mainHandler)
            themeHandlers.forEach(x => viewSettings.disconnect(x))
            settings.disconnect(ttsHandler)
        })
        this.loading = true
        this._setTitle(_('Foliate'))
    }
    open(file) {
        this.file = file
        this._epub.open(file)
    }
    _connectEpub() {
        this._epub.connect('click', (epub, width, position) => {
            const turnPageOnTap = settings.get_boolean('turn-page-on-tap')
            if (!turnPageOnTap) return
            if (this._highlightMenu && this._highlightMenu.visible) return

            const toggleControls = () => {
                const visible = this._mainOverlay.toggleNavBar()
                if (this._fullscreen)
                    this._fullscreenOverlay.alwaysReveal(visible)
                else if (this._autoHideHeaderBar)
                    this._autoHideHeaderBar.alwaysReveal(visible)
            }
            if (!epub.isPaginated) return toggleControls()
            const place = position / width
            if (place > 2/3) epub.goRight()
            else if (place < 1/3) epub.goLeft()
            else toggleControls()
        })
        this._epub.connect('book-displayed', () => this.loading = false)
        this._epub.connect('book-loading', () => {
            this.loading = true
            if (tts.epub === this._epub) tts.stop()
        })
        this._epub.connect('book-error', () => this._setTitle(_('Error')))
        this._epub.connect('metadata', () => {
            const title = this._epub.metadata.title || this.file.get_basename()
            this._setTitle(title)
            this.lookup_action('properties').enabled = true
        })
        this._epub.connect('data-ready', () => {
            this.lookup_action('export-annotations').enabled = true
            this.lookup_action('import-annotations').enabled = true
            this.lookup_action('selection-highlight').enabled = true
        })
        this._epub.connect('should-reload', () => {
            this.lookup_action('reload').activate(null)
        })
        this._epub.connect('selection', () => {
            const { text } = this._epub.selection
            if (!text) return
            const isSingle = text.split(/\s/).length === 1
            const action = settings.get_string(isSingle
                ? 'selection-action-single' : 'selection-action-multiple')
            switch (action) {
                case 'highlight':
                    this.lookup_action('selection-highlight').activate(null)
                    break
                case 'copy':
                    this.lookup_action('selection-copy').activate(null)
                    break
                case 'dictionary':
                    this.lookup_action('selection-dictionary').activate(null)
                    break
                case 'wikipedia':
                    this.lookup_action('selection-wikipedia').activate(null)
                    break
                case 'translate':
                    this.lookup_action('selection-translate').activate(null)
                    break
                case 'find':
                    this.lookup_action('selection-find').activate(null)
                    break
                case 'speak':
                    this.lookup_action('speak').activate(null)
                    break
                case 'none':
                    break
                default:
                    this.lookup_action('selection-menu').activate(null)
            }
        })
        this._epub.connect('highlight-menu', () => {
            const annotation = this._epub.annotation
            this._highlightMenu = new Gtk.Popover()
            this._highlightMenu.add(new AnnotationBox({ annotation, visible: true }))
            this._showPopover(this._highlightMenu, false)
        })
        this._epub.connect('footnote', () => {
            const footnote = this._epub.footnote
            const { position } = footnote
            const popover = new FootnotePopover(footnote, this._epub)
            popover.relative_to = this._epub.widget
            setPopoverPosition(popover, position, this, 200)
            popover.popup()
        })
        this._epub.connect('img', (__, pixbuf, alt) => {
            const title = this._epub.metadata.title
            const window = new ImageViewer({
                pixbuf, alt,
                title: title ? _('Image from “%s”').format(title) : _('Image'),
                transient_for: this,
                application: this.application,
                invert: viewSettings.get_boolean('invert'),
                modal: this.modal
            })
            window.show()
        })
    }
    _showSelectionPopover() {
        this._showPopover(new SelectionPopover())
    }
    _showPopover(popover, select = true) {
        popover.relative_to = this._epub.widget
        setPopoverPosition(popover, this._epub.selection.position, this, 200)
        popover.popup()
        if (select) {
            this._epub.selectByCfi(this._epub.selection.cfi)
            popover.connect('closed', () => this._epub.clearSelection())
        } else this._epub.clearSelection()
    }
    _buildMain() {
        const useSidebar = settings.get_boolean('use-sidebar')
        const child = this._fullscreenOverlay.get_child()
        if (child) this._fullscreenOverlay.remove(child)
        this._buildContents()
        if (useSidebar) {
            this._buildSidebar()
            this._paned = new Gtk.Paned({ visible: true })
            this._paned.pack1(this._sidebar, false, false)
            this._paned.pack2(this._mainOverlay, true, false)
            windowState.bind('sidebar-size', this._paned, 'position',
                Gio.SettingsBindFlags.DEFAULT)
            this._fullscreenOverlay.add(this._paned)
        } else {
            if (this._paned) this._paned.remove(this._mainOverlay)
            this._sidePopover.get_child().pack_start(this._contentsStack, false, true, 0)
            this._fullscreenOverlay.add(this._mainOverlay)
        }
    }
    _buildContents() {
        if (this._contentsStack) {
            this._contentsStack.get_parent().remove(this._contentsStack)
            return
        }
        this._contentsStack = new ContentsStack({ visible: true })
        this._contentsStack.epub = this._epub
    }
    _buildSidebar() {
        const box = new Gtk.Box({
            visible: true,
            orientation: Gtk.Orientation.VERTICAL,
            margin: 6,
            spacing: 6,
        })
        const stackSwitcher = new Gtk.StackSwitcher({
            visible: true,
            homogeneous: true,
            stack: this._contentsStack
        })
        box.pack_start(this._contentsStack, true, true, 0)
        box.pack_start(stackSwitcher, false, true, 0)
        this._sidebar = box
        windowState.bind('show-sidebar', this._sidebar, 'visible',
            Gio.SettingsBindFlags.DEFAULT)
    }
    _buildPopovers() {
        this._sidePopover = new Gtk.Popover()
        this._findPopover = new Gtk.Popover()
        this._mainPopover = new MainMenu()

        this._findBox = new FindBox({
            visible: true,
            orientation: Gtk.Orientation.VERTICAL,
            margin: 10,
            spacing: 10,
            width_request: 300
        })
        this._findPopover.add(this._findBox)

        const stackSwitcher = new Gtk.StackSwitcher({
            visible: true,
            homogeneous: true,
            stack: this._contentsStack
        })
        const box = new Gtk.Box({
            visible: true,
            orientation: Gtk.Orientation.VERTICAL,
            margin: 10,
            spacing: 10,
            width_request: 300
        })
        box.pack_start(stackSwitcher, false, true, 0)
        box.pack_start(this._contentsStack, false, true, 0)
        this._sidePopover.add(box)

        this._findBox.epub = this._epub

        this._contentsStack.connect('row-activated', () => this._sidePopover.popdown())
        this._findBox.connect('row-activated', () => this._findPopover.popdown())
    }
    _buildFullscreenHeaderBar() {
        const o = this._fullscreenOverlay
        const b = new HeaderBar({ visible: true, fullscreen: true })
        b.setPopovers(this._sidePopover, this._findPopover, this._mainPopover)
        const show = widget => widget.visible ? o.stayReveal(true) : null
        const hide = () => o.stayReveal(false)
        ;[this._sidePopover, this._findPopover, this._mainPopover].forEach(p => {
            p.connect('notify::visible', show)
            p.connect('closed', hide)
        })
        o.setOverlay(b)
        this._fullscreenHeaderBar = b
    }
    _buildHeaderBar() {
        const autohide = !viewSettings.get_boolean('skeuomorphism')
            && !settings.get_boolean('use-sidebar')
            && settings.get_boolean('autohide-headerbar')
        const title = this.title

        if (this._headerBar) this._headerBar.unsetPopovers()
        this._headerBar = new HeaderBar({ visible: true })
        this._headerBar.setPopovers(
            this._sidePopover, this._findPopover, this._mainPopover)
        this._headerBar.loading = this.loading

        if (!autohide) this.set_titlebar(this._headerBar)
        else {
            const dummyButton = new Gtk.Button({ visible: true, opacity: 0 })
            const dummyHeaderBar = new Gtk.HeaderBar({ visible: true, opacity: 0 })
            dummyHeaderBar.show_close_button = true
            dummyHeaderBar.has_subtitle = false
            dummyHeaderBar.get_style_context().add_class('titlebar')
            dummyHeaderBar.pack_start(dummyButton)

            this._titleLabel = new Gtk.Label({
                visible: true,
                ellipsize: Pango.EllipsizeMode.END,
                margin_start: 18,
                margin_end: 18
            })
            this._titleLabel.get_style_context().add_class('foliate-autohide-label')

            const a = new AutoHide({ visible: true })
            a.get_style_context().add_class('foliate-autohide-titlebar')
            a.setWidget(dummyHeaderBar)
            a.addOverlay(this._titleLabel)
            a.setOverlay(this._headerBar)

            // round the autohide widget with radius from the actual headerbar
            let borderRadius = 8
            const context = this._headerBar.get_style_context()
            const roundTitleBar = context => {
                const cssProvider = new Gtk.CssProvider()
                const currentRadius = context.get_property('border-radius', context.get_state())
                if (currentRadius === borderRadius) return
                borderRadius = currentRadius
                cssProvider.load_from_data(`
                    .foliate-autohide-titlebar {
                        border-top-left-radius: ${borderRadius}px;
                        border-top-right-radius: ${borderRadius}px;
                    }
                `)
                a.get_style_context().add_provider(
                    cssProvider,
                    Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION)
            }
            roundTitleBar(context)
            context.connect('changed', roundTitleBar)

            const show = widget => widget.visible ? a.stayReveal(true) : null
            const hide = () => a.stayReveal(false)
            ;[this._sidePopover, this._findPopover, this._mainPopover].forEach(p => {
                const h1 = p.connect('notify::visible', show)
                const h2 = p.connect('closed', hide)
                a.connect('destroy', () => {
                    p.disconnect(h1)
                    p.disconnect(h2)
                })
            })
            a.alwaysReveal(this._mainOverlay.navbarVisible)
            this._autoHideHeaderBar = a
            this.set_titlebar(a)
            a.get_style_context().remove_class('titlebar')
        }
        this._setTitle(title)
    }
    _setTitle(title) {
        this.title = title
        if (this._headerBar) this._headerBar.title = title
        if (this._fullscreenHeaderBar) this._fullscreenHeaderBar.title = title
        if (this._titleLabel) this._titleLabel.label = title
    }
    get loading() {
        return this._loading
    }
    set loading(state) {
        this._loading = state
        this.lookup_action('side-menu').enabled = !state
        this.lookup_action('show-toc').enabled = !state
        this.lookup_action('show-annotations').enabled = !state
        this.lookup_action('show-bookmarks').enabled = !state
        this.lookup_action('find-menu').enabled = !state
        this.lookup_action('location-menu').enabled = !state
        this.lookup_action('open-copy').enabled = !state
        this.lookup_action('reload').enabled = !state
        if (this._headerBar) this._headerBar.loading = state
        if (this._fullscreenHeaderBar) this._fullscreenHeaderBar.loading = state
        if (this._autoHideHeaderBar)
            this._autoHideHeaderBar.alwaysReveal(state || this._mainOverlay.navbarVisible)
        if (state) {
            this.lookup_action('properties').enabled = false
            this.lookup_action('export-annotations').enabled = false
            this.lookup_action('import-annotations').enabled = false
            this.lookup_action('selection-highlight').enabled = false
            this._setTitle(_('Loading…'))
        }
    }
    _themeUI() {
        this._mainOverlay.skeuomorph(viewSettings.get_boolean('skeuomorphism'))

        const invert = viewSettings.get_boolean('invert') ? doubleInvert : (x => x)
        const brightness = viewSettings.get_double('brightness')
        const bgColor = brightenColor(invert(viewSettings.get_string('bg-color')), brightness)
        const fgColor = brightenColor(invert(viewSettings.get_string('fg-color')), brightness)
        const cssProvider = new Gtk.CssProvider()
        cssProvider.load_from_data(`
            .foliate-autohide-container {
                background: ${bgColor};
                border: 0;
                box-shadow: none;
            }
            .foliate-autohide-label {
                color: ${fgColor};
                opacity: 0.5;
            }`)
        Gtk.StyleContext.add_provider_for_screen(
            Gdk.Screen.get_default(),
            cssProvider,
            Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION)
    }
    get epub() {
        return this._epub
    }
    get activeHeaderBar() {
        return this._fullscreen ? this._fullscreenHeaderBar : this._headerBar
    }
})

