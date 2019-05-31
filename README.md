<img src="data/com.github.johnfactotum.Foliate.svg" align="left">

# Foliate
A simple and modern GTK eBook viewer, built with [GJS](https://gitlab.gnome.org/GNOME/gjs) and [Epub.js](https://github.com/futurepress/epub.js/).

![View](data/screenshots/view.png)

Website: https://johnfactotum.github.io/foliate/

## Features
- View EPUB files
- Two-page view and scrolled view
- Customize font and line-spacing
- Light, sepia, dark, and invert mode
- Reading progress slider with chapter marks
- Bookmarks and annotations
- Find in book
- Quick dictionary lookup
- Touchpad gestures: use two-finger swipe to turn the page (on master branch; not released yet)

## Installation
### Flatpak
<a href='https://flathub.org/apps/details/com.github.johnfactotum.Foliate'><img height='50' alt='Download on Flathub' src='https://flathub.org/assets/badges/flathub-badge-en.png'/></a>

### Install manually from source
First, you'll need the following dependencies:
- `gjs`
- `webkit2gtk`
- `libsoup`
- `meson`

Then run the follwing commands:
```bash
meson build --prefix=/usr
cd build
ninja
sudo ninja install
```

To uninstall, run
```bash
sudo ninja uninstall
```

## Screenshots

Dictionary:

![Lookup](data/screenshots/lookup.png)

Annotations:

![Note](data/screenshots/note.png)

![Annotations](data/screenshots/annotations.png)

Find in book:

![Find](data/screenshots/find.png)

Dark mode:

![Dark](data/screenshots/dark.png)

Book metadata display:

![About](data/screenshots/about.png)

---

**Note:** three JavaScript libraries are bundled in this software:

- [Epub.js](https://github.com/futurepress/epub.js/), which is licensed under [FreeBSD](https://github.com/futurepress/epub.js/blob/master/license). The included file is patched to fix [futurepress/epub.js#942](https://github.com/futurepress/epub.js/issues/942)
- The minified version of [JSZip](https://stuk.github.io/jszip/), which is dual-licensed. You may use it under the MIT license or the GPLv3 license. See [LICENSE.markdown](https://github.com/Stuk/jszip/blob/master/LICENSE.markdown)
- A browserified version of [Cheerio](https://cheerio.js.org/), which is licensed under [MIT](https://github.com/cheeriojs/cheerio/blob/master/LICENSE). Cheerio is used to parse and extract data from Wiktionary
