import Gtk from 'gi://Gtk'
import GObject from 'gi://GObject'
import Gdk from 'gi://Gdk'
import GdkPixbuf from 'gi://GdkPixbuf'
import * as utils from './utils.js'

// TODO: figure out how to use Gdk.Texture
export const ImageViewer = GObject.registerClass({
    GTypeName: 'FoliateImageViewer',
    Template: pkg.moduleuri('ui/image-viewer.ui'),
    InternalChildren: ['scrolled', 'image'],
    Properties: utils.makeParams({
        'pixbuf': 'object',
    }),
    Signals: {
        'copy': {},
        'save-as': {},
    },
}, class extends Gtk.Box {
    #scale = 1
    #rotation = 0
    #pinchScale = 1
    actionGroup = utils.addSimpleActions({
        'zoom-in': () => this.zoom(0.25),
        'zoom-out': () => this.zoom(-0.25),
        'zoom-restore': () => this.zoom(),
        'rotate-left': () => this.rotate(90),
        'rotate-right': () => this.rotate(270),
        'copy': () => this.emit('copy'),
        'save-as': () => this.emit('save-as'),
    })
    constructor(params) {
        super(params)
        this._image.set_pixbuf(this.pixbuf)
        this._image.add_controller(utils.connect(new Gtk.GestureDrag(), {
            'drag-begin': () => this._image.cursor =
                Gdk.Cursor.new_from_name('move', null),
            'drag-end': () => this._image.cursor = null,
            'drag-update': (_, x, y) => {
                const { hadjustment, vadjustment } = this._scrolled
                hadjustment.value -= x
                vadjustment.value -= y
            },
        }))
        this._image.add_controller(utils.connect(new Gtk.GestureZoom(), {
            'begin': () => this.#pinchScale = this.#scale,
            'scale-changed': (_, scale) => {
                this.#scale = this.#pinchScale * scale
                this.#update()
            },
        }))
        this._scrolled.add_controller(utils.connect(new Gtk.EventControllerScroll({
            flags: Gtk.EventControllerScrollFlags.VERTICAL,
        }), {
            'scroll': (controller, _, dy) => {
                const state = controller.get_current_event_state()
                if (state & Gdk.ModifierType.CONTROL_MASK) {
                    this.zoom(dy < 0 ? 0.1 : -0.1)
                    return true
                }
            },
        }))
        this.insert_action_group('img', this.actionGroup)
        this.add_controller(utils.addShortcuts({
            '<ctrl>c': 'img.copy',
            '<ctrl>s': 'img.save-as',
            'plus|equal|KP_Add|KP_Equal|<ctrl>plus|<ctrl>equal|<ctrl>KP_Add|<ctrl>KP_Equal': 'img.zoom-in',
            'minus|KP_Subtract|<ctrl>minus|<ctrl>KP_Subtract': 'img.zoom-out',
            '0|1|KP_0|<ctrl>0|<ctrl>KP_0': 'img.zoom-restore',
            '<ctrl>Left': 'img.rotate-left',
            '<ctrl>Right': 'img.rotate-right',
            '<ctrl>i': 'img.invert',
        }))
        this.#updateActions()
    }
    zoom(d) {
        if (d == null) this.#scale = 1
        else this.#scale += d
        this.#update()
    }
    rotate(degree) {
        this.#rotation = (this.#rotation + degree) % 360
        this.#update()
    }
    #update() {
        const { pixbuf } = this
        const { width, height } = pixbuf
        const scale = this.#scale
        this._image.set_pixbuf(pixbuf.scale_simple(width * scale, height * scale,
            GdkPixbuf.InterpType.BILINEAR).rotate_simple(this.#rotation))
        this.#updateActions()
    }
    #updateActions() {
        const scale = this.#scale
        this.actionGroup.lookup_action('zoom-in').enabled = true
        this.actionGroup.lookup_action('zoom-out').enabled = true
        this.actionGroup.lookup_action('zoom-restore').enabled = scale !== 1
    }
})
