import Gtk from 'gi://Gtk'
import Adw from 'gi://Adw'
import Pango from 'gi://Pango'
import { gettext as _ } from 'gettext'
import * as utils from './utils.js'
import * as format from './format.js'

export const formatLanguageMap = x => {
    if (!x) return ''
    if (typeof x === 'string') return x
    const keys = Object.keys(x)
    return /*x[format.matchLocales(keys)[0]] ??*/ x[keys[0]]
}

const formatContributors = contributors => Array.isArray(contributors)
    ? format.list(contributors.map(contributor =>
        typeof contributor === 'string' ? contributor
        : formatLanguageMap(contributor?.name)))
    : typeof contributors === 'string' ? contributors
    : formatLanguageMap(contributors?.name)

export const formatAuthors = metadata => metadata?.author
    ? formatContributors(metadata.author)
    : metadata?.creator // compat with previous versions
    ?? ''

const makePropertyBox = (title, value) => {
    const box = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 3,
    })
    box.append(utils.addClass(new Gtk.Label({
        xalign: 0,
        wrap: true,
        label: title,
    }), 'caption-heading'))
    box.append(new Gtk.Label({
        margin_bottom: 6,
        xalign: 0,
        wrap: true,
        selectable: true,
        label: value,
        wrap_mode: Pango.WrapMode.WORD_CHAR,
    }))
    return box
}

const makeSubjectBox = subject => {
    const box = new Gtk.Box({ spacing: 6 })
    box.append(new Gtk.Image({
        icon_name: 'tag-symbolic',
        valign: Gtk.Align.START,
    }))
    box.append(utils.addClass(new Gtk.Label({
        xalign: 0,
        wrap: true,
        selectable: true,
        label: formatContributors(subject) || subject?.code,
        valign: Gtk.Align.START,
    }), 'caption'))
    return box
}

const makeBookHeader = (metadata, pixbuf) => {
    const box = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 6,
        hexpand: true,
    })

    box.append(utils.addClass(new Gtk.Label({
        xalign: 0,
        wrap: true,
        selectable: true,
        label: formatLanguageMap(metadata.title),
    }), 'title-2'))

    if (metadata.subtitle) box.append(utils.addClass(new Gtk.Label({
        xalign: 0,
        wrap: true,
        selectable: true,
        label: formatLanguageMap(metadata.subtitle),
    }), 'title-4'))

    box.append(new Gtk.Label({
        xalign: 0,
        wrap: true,
        selectable: true,
        label: formatAuthors(metadata),
    }))

    if (!pixbuf) return box

    const box2 = new Gtk.Box({ spacing: 18 })
    const frame = new Gtk.Frame()
    frame.add_css_class('book-image-frame')
    const picture = new Gtk.Picture({ focusable: true, height_request: 180 })
    picture.set_pixbuf(pixbuf)
    frame.child = picture
    box2.append(frame)
    box2.append(box)
    return box2
}

const makeBookInfoBox = (metadata, pixbuf) => {
    const box = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 6,
    })

    box.append(makeBookHeader(metadata, pixbuf))

    if (metadata.description) box.append(new Gtk.Label({
        xalign: 0,
        wrap: true,
        use_markup: true,
        selectable: true,
        margin_top: 12,
        label: metadata.description,
    }))
    box.append(new Gtk.Box({ vexpand: true }))

    const flowbox = new Gtk.FlowBox({
        selection_mode: Gtk.SelectionMode.NONE,
        row_spacing: 12,
        column_spacing: 18,
        margin_top: 12,
        margin_bottom: 6,
    })
    box.append(flowbox)

    for (const [title, value] of [
        [_('Publisher'), formatContributors(metadata.publisher)],
        // Translators: this is the heading for the publication date
        [_('Published'), format.date(metadata.published)],
        // Translators: this is the heading for the modified date
        [_('Updated'), format.date(metadata.modified)],
        [_('Language'), format.language(metadata.language)],
        [_('Translated by'), formatContributors(metadata.translator)],
        [_('Edited by'), formatContributors(metadata.editor)],
        [_('Narrated by'), formatContributors(metadata.narrator)],
        [_('Illustrated by'), formatContributors(metadata.illustrator)],
        [_('Produced by'), formatContributors(metadata.producer)],
        [_('Artwork by'), formatContributors(metadata.artist)],
        [_('Color by'), formatContributors(metadata.colorist)],
        [_('Contributors'), formatContributors(metadata.contributor)],
        [_('Identifier'), metadata.identifier],
    ]) {
        if (!value) continue
        if (value.length > 30) box.append(makePropertyBox(title, value))
        else flowbox.insert(makePropertyBox(title, value), -1)
    }

    if (metadata.subject?.length) {
        const subjectsBox = new Gtk.FlowBox({
            selection_mode: Gtk.SelectionMode.NONE,
            row_spacing: 3,
            column_spacing: 12,
            margin_top: 12,
        })
        box.append(subjectsBox)
        for (const subject of [].concat(metadata.subject))
            subjectsBox.insert(makeSubjectBox(subject), -1)
    }

    if (metadata.rights) box.append(utils.addClass(new Gtk.Label({
        margin_top: 12,
        xalign: 0,
        wrap: true,
        selectable: true,
        label: metadata.rights,
    }), 'caption', 'dim-label'))
    return new Adw.Clamp({ child: box })
}

export const makeBookInfoWindow = (root, metadata, pixbuf, bigCover) => {
    const wide = root.get_width() > 800
    const win = new Adw.Window({
        title: _('About This Book'),
        width_request: 320,
        height_request: 300,
        default_width: bigCover && pixbuf ? (wide ? 800 : 320) : 420,
        default_height: bigCover && pixbuf ? (wide ? 540 : 640) : pixbuf ? 540 : 420,
        modal: true,
        transient_for: root,
    })

    const infobox = Object.assign(makeBookInfoBox(metadata, bigCover ? null : pixbuf), {
        margin_bottom: 18,
        margin_start: 18,
        margin_end: 18,
    })
    const scrolled = new Gtk.ScrolledWindow({
        hexpand: true,
        vexpand: true,
        width_request: 320,
    })
    const toolbarView = new Adw.ToolbarView({ content: scrolled })
    const headerbar = new Adw.HeaderBar({ show_title: false })
    toolbarView.add_top_bar(headerbar)

    if (bigCover && pixbuf) {
        headerbar.add_css_class('overlaid')
        toolbarView.extend_content_to_top_edge = true

        const picture = new Gtk.Picture({
            content_fit: Gtk.ContentFit.COVER,
            focusable: true,
        })
        picture.add_css_class('book-image-full')
        picture.set_pixbuf(pixbuf)

        const innerBox = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 18,
        })
        innerBox.append(picture)
        innerBox.append(infobox)
        scrolled.child = innerBox
        scrolled.child.vscroll_policy = Gtk.ScrollablePolicy.NATURAL

        const outerBox = new Gtk.Box()
        outerBox.append(toolbarView)

        win.content = outerBox
        win.add_breakpoint(utils.connect(new Adw.Breakpoint({
            condition: Adw.BreakpointCondition.parse(
                'min-width: 540px and min-aspect-ratio: 5/4'),
        }), {
            'apply': () => {
                innerBox.remove(picture)
                outerBox.prepend(picture)
                picture.grab_focus()
                headerbar.decoration_layout = ':close'
                headerbar.remove_css_class('overlaid')
                toolbarView.extend_content_to_top_edge = false
            },
            'unapply': () => {
                outerBox.remove(picture)
                innerBox.prepend(picture)
                headerbar.decoration_layout = null
                headerbar.add_css_class('overlaid')
                toolbarView.extend_content_to_top_edge = true
            },
        }))
    } else {
        scrolled.child = infobox
        win.content = toolbarView
    }

    win.add_controller(utils.addShortcuts({ 'Escape|<ctrl>w': () => win.close() }))
    win.show()
}
