import Gtk from "gi://Gtk";
import Adw from "gi://Adw";
import GObject from "gi://GObject";
import GLib from "gi://GLib";
import Gio from "gi://Gio";
import Gdk from "gi://Gdk";
import GdkPixbuf from "gi://GdkPixbuf";
import WebKit from "gi://WebKit";
import { gettext as _ } from "gettext";
import * as utils from "./utils.js";
import { Library, getURIStore, getBookList } from "./library.js";
import { BookViewer } from "./book-viewer.js";
import { WebView } from "./webview.js";

const formatVersion = (a, b, c) => `${a ?? "?"}.${b ?? "?"}.${c ?? "?"}`;

const getImportVersion = (lib) =>
  formatVersion(lib.MAJOR_VERSION, lib.MINOR_VERSION, lib.MICRO_VERSION);

const getGJSVersion = () => {
  const [a, b, c, d, e] = imports.system.version.toString();
  return formatVersion(a, b + c, d + e);
};

const getDebugInfo = () => {
  try {
    return `System: ${GLib.get_os_info("NAME") ?? "Unknown"} ${GLib.get_os_info("VERSION") ?? GLib.get_os_info("BUILD_ID") ?? ""}
Desktop: ${GLib.getenv("XDG_CURRENT_DESKTOP") ?? "Unknown"}
Session: ${GLib.getenv("XDG_SESSION_DESKTOP") ?? "UNknown"} (${GLib.getenv("XDG_SESSION_TYPE") ?? "Unknown"})
Language: ${GLib.getenv("LANG") ?? "Unknown"}

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
`;
  } catch (e) {
    console.error(e);
    return "";
  }
};

// Shared constants for ebook file types
const EBOOK_MIME_TYPES = [
  "application/epub+zip",
  "application/x-mobipocket-ebook",
  "application/vnd.amazon.mobi8-ebook",
  "application/x-mobi8-ebook",
  "application/x-fictionbook+xml",
  "application/x-zip-compressed-fb2",
  "application/vnd.comicbook+zip",
  "application/vnd.comicbook-rar",
  "application/x-cbr",
  "application/x-cbz",
  "application/x-cb7",
  "application/x-cbt",
];

const isEbookFile = (file) => {
  try {
    const path = file.get_path();
    if (!path) {
      console.debug("File has no path, cannot determine type");
      return false;
    }

    // Try MIME type detection first
    const [mimeType, _certain] = Gio.content_type_guess(path, null);
    if (mimeType && EBOOK_MIME_TYPES.includes(mimeType)) {
      return true;
    }

    return false;
  } catch (e) {
    console.warn(
      `Failed to check if file is an ebook (${file.get_uri()}): ${e}`,
    );
    return false;
  }
};

const ApplicationWindow = GObject.registerClass(
  {
    GTypeName: "FoliateApplicationWindow",
    Properties: utils.makeParams({
      file: "object",
    }),
  },
  class extends Adw.ApplicationWindow {
    #library;
    #bookViewer;
    #stack = new Gtk.Stack();
    #cookie;
    constructor(params) {
      super(params);
      Object.assign(this, {
        handle_menubar_accel: false,
        title: pkg.localeName,
        default_width: 1200,
        default_height: 750,
        content: new Adw.ToastOverlay({ child: this.#stack }),
      });

      const styleManager = Adw.StyleManager.get_default();
      if (styleManager.dark) this.add_css_class("is-dark");
      const handler = styleManager.connect("notify::dark", ({ dark }) => {
        if (dark) this.add_css_class("is-dark");
        else this.remove_css_class("is-dark");
      });
      this.connect("destroy", () => styleManager.disconnect(handler));

      utils.addMethods(this, {
        actions: [
          "open",
          "close",
          "show-library",
          "show-menu",
          "new-window",
          "open-copy",
          "import-books",
        ],
        props: ["fullscreened"],
      });

      utils.bindSettings("window", this, [
        "default-width",
        "default-height",
        "maximized",
        "fullscreened",
      ]);

      this.connect("notify::fullscreened", (win) => {
        let app = Gio.Application.get_default();
        if (this.is_fullscreen()) {
          this.#cookie = app.inhibit(
            win,
            Gtk.ApplicationInhibitFlags.IDLE,
            "Reading book in fullscreen",
          );
          if (this.#cookie == 0)
            console.error("Failed to inhibit session idle");
        } else if (this.#cookie > 0) {
          app.uninhibit(this.#cookie);
        }
      });

      if (this.file) this.openFile(this.file);
      else this.showLibrary();
    }
    add_toast(toast) {
      this.content.add_toast(toast);
    }
    error(heading, body) {
      const dialog = new Adw.AlertDialog({
        heading,
        body,
      });
      dialog.add_response("close", _("Close"));
      dialog.present(this);
    }
    actionDialog() {
      const window = new Adw.Window({
        modal: true,
        transient_for: this.root,
        content: new Adw.ToolbarView(),
        default_width: 400,
      });
      window.add_controller(
        utils.addShortcuts({ "Escape|<ctrl>w": () => window.close() }),
      );
      const header = new Adw.HeaderBar({
        show_title: false,
        show_start_title_buttons: false,
        show_end_title_buttons: false,
      });
      header.pack_start(
        utils.connect(
          new Gtk.Button({
            label: _("Cancel"),
          }),
          { clicked: () => window.close() },
        ),
      );
      const button = utils.addClass(new Gtk.Button(), "suggested-action");
      header.pack_end(button);
      window.content.add_top_bar(header);
      return { button, window };
    }
    openFile(file) {
      this.file = file;
      if (!this.#bookViewer) {
        this.#bookViewer = new BookViewer();
        this.#stack.add_child(this.#bookViewer);
      }
      this.#stack.transition_type = Gtk.StackTransitionType.SLIDE_LEFT;
      this.#stack.visible_child = this.#bookViewer;
      this.#bookViewer.open(file);
    }
    openOPDS(uri) {
      this.showLibrary();
      this.#library.showCatalog(uri);
    }
    open() {
      const dialog = new Gtk.FileDialog();
      const ebooks = new Gtk.FileFilter({
        name: _("E-Book Files"),
        mime_types: EBOOK_MIME_TYPES,
      });
      dialog.filters = new Gio.ListStore();
      dialog.filters.append(
        new Gtk.FileFilter({
          name: _("All Files"),
          patterns: ["*"],
        }),
      );
      dialog.filters.append(ebooks);
      dialog.default_filter = ebooks;
      dialog.open(this, null, (_, res) => {
        try {
          const file = dialog.open_finish(res);
          this.openFile(file);
        } catch (e) {
          if (e instanceof Gtk.DialogError) console.debug(e);
          else console.error(e);
        }
      });
    }
    #collectEbooksFromDirectory(directory, files = []) {
      try {
        const enumerator = directory.enumerate_children(
          "standard::name,standard::type",
          Gio.FileQueryInfoFlags.NONE,
          null,
        );
        let info;
        while ((info = enumerator.next_file(null))) {
          const name = info.get_name();

          // Skip hidden files and macOS resource forks
          if (name.startsWith(".")) continue;

          const child = directory.get_child(name);
          const fileType = info.get_file_type();

          if (fileType === Gio.FileType.DIRECTORY) {
            this.#collectEbooksFromDirectory(child, files);
          } else if (fileType === Gio.FileType.REGULAR) {
            // Use content_type_guess instead of file extensions
            if (isEbookFile(child)) {
              files.push(child);
            }
          }
        }
        enumerator.close(null);
      } catch (e) {
        console.warn(`Failed to read directory ${directory.get_path()}: ${e}`);
      }
      return files;
    }
    #headlessViewer;
    async #initHeadlessViewer() {
      if (this.#headlessViewer) return;
      this.#headlessViewer = new WebView({
        settings: new WebKit.Settings({
          enable_write_console_messages_to_stdout: true,
          enable_developer_extras: true,
          allow_file_access_from_file_urls: true,
          allow_universal_access_from_file_urls: true,
        }),
      });
      await this.#headlessViewer.loadURI(pkg.moduleuri("reader/metadata.html"));
      // Wait for the script to load
      for (let i = 0; i < 50; i++) {
        if (
          await this.#headlessViewer.eval('typeof getMetadata === "function"')
        )
          return;
        await utils.wait(100);
      }
      console.error("Failed to load metadata script");
    }

    #makeMetadataPayload(file) {
      const path = file.get_path();
      if (!path) return { uri: file.get_uri() };
      try {
        const [success, contents] = file.load_contents(null);
        if (!success) throw new Error("Failed to read file contents");
        let mimeType = "";
        try {
          const info = file.query_info(
            "standard::content-type",
            Gio.FileQueryInfoFlags.NONE,
            null,
          );
          mimeType = info?.get_content_type() ?? "";
        } catch (infoError) {
          console.debug(infoError);
        }
        const data = GLib.base64_encode(contents);
        return {
          data,
          name: file.get_basename(),
          mimeType,
        };
      } catch (e) {
        console.error(
          `Failed to read ${file.get_uri()} for metadata import: ${e}`,
        );
        return { uri: file.get_uri() };
      }
    }

    #writeBookMetadata(key, metadata) {
      const encoded = encodeURIComponent(key);
      const path = GLib.build_filenamev([pkg.datadir, `${encoded}.json`]);
      const file = Gio.File.new_for_path(path);
      const parent = file.get_parent();
      try {
        GLib.mkdir_with_parents(parent.get_path(), parseInt("0755", 8));
      } catch (mkdirError) {
        console.error(`Failed to create metadata directory: ${mkdirError}`);
      }
      let existing = {};
      if (file.query_exists(null)) {
        try {
          existing = utils.readJSONFile(file);
        } catch (readError) {
          console.warn(
            `Failed to read existing metadata for ${key}: ${readError}`,
          );
        }
      }
      existing.metadata = metadata;
      const contents = JSON.stringify(existing);
      try {
        const [success] = file.replace_contents(
          contents,
          null,
          false,
          Gio.FileCreateFlags.REPLACE_DESTINATION,
          null,
        );
        if (!success) throw new Error("replace_contents returned false");
      } catch (writeError) {
        console.error(
          `Failed to write book metadata for ${key}: ${writeError}`,
        );
        throw writeError;
      }
      return path;
    }

    #removeBookMetadata(identifier) {
      if (!identifier) return;
      const encoded = encodeURIComponent(identifier);
      const path = GLib.build_filenamev([pkg.datadir, `${encoded}.json`]);
      const file = Gio.File.new_for_path(path);
      const list = getBookList();
      if (list && file.query_exists(null)) {
        list.delete(file);
        return;
      }
      try {
        if (file.query_exists(null)) file.delete(null);
      } catch (e) {
        console.debug(`Failed to remove metadata for ${identifier}: ${e}`);
      }
      const coverPath = pkg.cachepath(`${encoded}.png`);
      const coverFile = Gio.File.new_for_path(coverPath);
      try {
        if (coverFile.query_exists(null)) coverFile.delete(null);
      } catch (e) {
        console.debug(`Failed to remove cover for ${identifier}: ${e}`);
      }
      getURIStore().delete(identifier);
    }

    async #importFilesInBackground(files) {
      const toast = new Adw.Toast({
        title:
          files.length === 1
            ? _("Importing 1 book…")
            : _(`Importing ${files.length} books…`),
        timeout: 0,
      });
      this.add_toast(toast);
      this.showLibrary();

      await this.#initHeadlessViewer();

      const settings = utils.settings("library");
      const showCovers = settings?.get_boolean("show-covers") ?? true;
      const coverSize = settings?.get_int("cover-size") ?? 256;
      const homeDir = GLib.get_home_dir();

      let count = 0;
      for (const file of files) {
        count++;
        if (files.length > 1) {
          toast.title = _(`Importing ${count} of ${files.length} books…`);
        }

        try {
          const checksum = utils.makeIdentifier(file);
          if (!checksum) {
            console.warn(`Could not generate identifier for ${file.get_uri()}`);
            continue;
          }

          const payload = this.#makeMetadataPayload(file);
          const result = await this.#headlessViewer.exec(
            "getMetadata",
            payload,
          );
          if ("data" in payload) payload.data = null;
          if (!result) throw new Error("No metadata returned");
          const metadata = result.metadata ?? {};
          const originalIdentifier =
            typeof metadata.identifier === "string"
              ? metadata.identifier
              : null;
          const cover = result.cover;

          const key = originalIdentifier || checksum;

          const existingAltIdentifiers = Array.isArray(metadata.altIdentifier)
            ? metadata.altIdentifier
            : metadata.altIdentifier
              ? [metadata.altIdentifier]
              : [];
          const altIdentifiers = [];

          metadata.identifier = key;
          if (checksum !== key) {
            altIdentifiers.push(checksum);
            this.#removeBookMetadata(checksum);
          }
          for (const id of existingAltIdentifiers) {
            if (typeof id !== "string") continue;
            if (id === key) continue;
            if (!altIdentifiers.includes(id)) altIdentifiers.push(id);
          }
          if (altIdentifiers.length) metadata.altIdentifier = altIdentifiers;
          else delete metadata.altIdentifier;

          const metadataPath = this.#writeBookMetadata(key, metadata);

          if (showCovers && cover) {
            try {
              const bytes = GLib.base64_decode(cover);
              const loader = new GdkPixbuf.PixbufLoader();
              if (!loader.write(bytes))
                throw new Error("Failed to decode cover data");
              loader.close();
              const pixbuf = loader.get_pixbuf();
              if (!pixbuf) throw new Error("Cover pixbuf unavailable");

              const path = pkg.cachepath(`${encodeURIComponent(key)}.png`);
              const coverFile = Gio.File.new_for_path(path);
              const coverDir = coverFile.get_parent();
              try {
                GLib.mkdir_with_parents(
                  coverDir.get_path(),
                  parseInt("0755", 8),
                );
              } catch (coverMkdirError) {
                console.error(
                  `Failed to create cover directory: ${coverMkdirError}`,
                );
              }
              const ratio = coverSize / pixbuf.get_width();

              const scaled =
                ratio >= 1
                  ? pixbuf
                  : pixbuf.scale_simple(
                      coverSize,
                      Math.round(pixbuf.get_height() * ratio),
                      GdkPixbuf.InterpType.BILINEAR,
                    );

              scaled.savev(path, "png", [], []);
            } catch (e) {
              console.warn("Failed to save cover", e);
            }
          }

          const path = file.get_path();
          getURIStore().set(
            key,
            path?.startsWith(homeDir)
              ? path.replace(homeDir, "~")
              : file.get_uri(),
          );

          if (metadataPath) getBookList()?.update(metadataPath);
        } catch (e) {
          console.error(`Failed to import ${file.get_uri()}: ${e}`);
        }
        await utils.wait(0);
      }

      toast.dismiss();
      this.add_toast(
        new Adw.Toast({
          title:
            files.length === 1
              ? _("Imported 1 book")
              : _(`Imported ${files.length} books`),
        }),
      );
    }
    #importMultipleFiles() {
      const dialog = new Gtk.FileDialog();
      const ebooks = new Gtk.FileFilter({
        name: _("E-Book Files"),
        mime_types: EBOOK_MIME_TYPES,
      });
      dialog.filters = new Gio.ListStore();
      dialog.filters.append(
        new Gtk.FileFilter({
          name: _("All Files"),
          patterns: ["*"],
        }),
      );
      dialog.filters.append(ebooks);
      dialog.default_filter = ebooks;

      dialog.open_multiple(this, null, (_, res) => {
        try {
          const gfiles = dialog.open_multiple_finish(res);
          const files = [];
          for (let i = 0; i < gfiles.get_n_items(); i++) {
            files.push(gfiles.get_item(i));
          }
          if (files.length > 0) {
            this.#importFilesInBackground(files);
          }
        } catch (e) {
          if (e instanceof Gtk.DialogError) console.debug(e);
          else console.error(e);
        }
      });
    }
    #importFromFolder() {
      const dialog = new Gtk.FileDialog();
      dialog.select_folder(this, null, (obj, res) => {
        try {
          const folder = dialog.select_folder_finish(res);
          const files = this.#collectEbooksFromDirectory(folder);

          if (files.length > 0) {
            this.#importFilesInBackground(files);
          } else {
            const toast = new Adw.Toast({
              title: _("No e-books found in the selected folder"),
            });
            this.add_toast(toast);
          }
        } catch (e) {
          if (e instanceof Gtk.DialogError) console.debug(e);
          else console.error(e);
        }
      });
    }
    importBooks() {
      const dialog = new Adw.AlertDialog({
        heading: _("Import Books"),
        body: _("Choose how you want to import books to your library"),
      });
      dialog.add_response("cancel", _("Cancel"));
      dialog.add_response("files", _("Select Files"));
      dialog.add_response("folder", _("Select Folder"));
      dialog.set_response_appearance("files", Adw.ResponseAppearance.SUGGESTED);
      dialog.choose(this, null, (_, res) => {
        try {
          const response = dialog.choose_finish(res);
          if (response === "files") this.#importMultipleFiles();
          else if (response === "folder") this.#importFromFolder();
        } catch (e) {
          if (e instanceof Gtk.DialogError) console.debug(e);
          else console.error(e);
        }
      });
    }
    showLibrary() {
      this.file = null;
      this.title = pkg.localeName;
      if (!this.#library) {
        this.#library = new Library();
        this.#stack.add_child(this.#library);
      }
      this.#stack.transition_type = Gtk.StackTransitionType.SLIDE_RIGHT;
      this.#stack.visible_child = this.#library;
      if (this.#bookViewer) {
        this.#stack.remove(this.#bookViewer);
        this.#bookViewer = null;
      }
    }
    showMenu() {
      if (this.#bookViewer) this.#bookViewer.showPrimaryMenu();
    }
    addWindow(file) {
      const { application } = this;
      const win = new ApplicationWindow({ application, file });
      new Gtk.WindowGroup().add_window(win);
      win.present();
    }
    newWindow() {
      this.addWindow(null);
    }
    openCopy() {
      this.addWindow(this.file);
    }
  },
);

export const Application = GObject.registerClass(
  {
    GTypeName: "FoliateApplication",
  },
  class extends Adw.Application {
    constructor(params) {
      super(params);
      this.application_id = pkg.name;
      this.flags = Gio.ApplicationFlags.HANDLES_OPEN;

      utils.addMethods(this, {
        actions: ["about", "quit"],
        signals: ["startup", "activate", "open", "window-removed"],
      });

      for (const [key, val] of Object.entries({
        "app.quit": ["<ctrl>q"],
        "app.about": ["F1"],
        "win.close": ["<ctrl>w"],
        "win.fullscreened": ["F11"],
        "win.show-menu": ["F10"],
        "win.open": ["<ctrl>o"],
        "win.open-copy": ["<ctrl>n"],
        "win.import-books": ["<ctrl><shift>o"],
      }))
        this.set_accels_for_action(key, val);
    }
    connectStartup() {
      const settings = utils.settings();
      if (settings) {
        const styleManager = Adw.StyleManager.get_default();
        styleManager.color_scheme = settings.get_int("color-scheme");
        styleManager.connect("notify::color-scheme", () =>
          settings.set_int("color-scheme", styleManager.color_scheme),
        );
      }

      const theme = Gtk.IconTheme.get_for_display(Gdk.Display.get_default());
      if (pkg.useResource) theme.add_resource_path(pkg.modulepath("/icons"));
      else theme.add_search_path(pkg.modulepath("/icons"));

      const cssProvider = new Gtk.CssProvider();
      cssProvider.load_from_data(
        `
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
        `,
        -1,
      );
      Gtk.StyleContext.add_provider_for_display(
        Gdk.Display.get_default(),
        cssProvider,
        Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION,
      );
    }
    connectActivate(application) {
      if (this.activeWindow) {
        this.activeWindow.present();
        return;
      }
      const win = new ApplicationWindow({ application });
      new Gtk.WindowGroup().add_window(win);
      win.present();
    }
    connectOpen(application, files) {
      const oldWins = this.get_windows();
      file: for (const file of files) {
        if (file.get_uri_scheme() === "opds") {
          const oldWin = oldWins.find((win) => !win.file);
          const uri = file.get_uri();
          if (oldWin) oldWin.openOPDS(uri);
          else {
            const win = new ApplicationWindow({ application });
            new Gtk.WindowGroup().add_window(win);
            win.openOPDS(uri);
            win.present();
          }
          continue;
        } else
          for (const oldWin of oldWins) {
            if (oldWin.file?.get_uri() === file.get_uri()) {
              oldWin.present();
              continue file;
            }
          }
        const win = new ApplicationWindow({ application, file });
        new Gtk.WindowGroup().add_window(win);
        win.present();
      }
    }
    connectWindowRemoved(application, window) {
      // this seems to be needed for destroying the web view
      window.run_dispose();
    }
    about() {
      const win = new Adw.AboutDialog({
        application_name: pkg.localeName,
        application_icon: pkg.name,
        version: pkg.version,
        comments: _("Read e-books in style"),
        developer_name: "John Factotum",
        developers: ["John Factotum"],
        artists: ["John Factotum", "Tobias Bernard <tbernard@gnome.org>"],
        // Translators: put your names here, one name per line
        // they will be shown in the "About" dialog
        translator_credits: _("translator-credits"),
        license_type: Gtk.License.GPL_3_0,
        website: "https://johnfactotum.github.io/foliate/",
        issue_url: "https://github.com/johnfactotum/foliate/issues",
        support_url:
          "https://github.com/johnfactotum/foliate/blob/gtk4/docs/faq.md",
        debug_info: getDebugInfo(),
      });
      win.add_link(_("Source Code"), "https://github.com/johnfactotum/foliate");
      win.add_legal_section("foliate-js", null, Gtk.License.MIT_X11, null);
      win.add_legal_section(
        "zip.js",
        "Copyright © 2022 Gildas Lormeau",
        Gtk.License.BSD_3,
        null,
      );
      win.add_legal_section(
        "fflate",
        "Copyright © 2020 Arjun Barrett",
        Gtk.License.MIT_X11,
        null,
      );
      win.add_legal_section(
        "PDF.js",
        "©Mozilla and individual contributors",
        Gtk.License.APACHE_2_0,
        null,
      );
      win.present(this.active_window);
    }
  },
);
