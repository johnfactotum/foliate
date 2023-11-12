## Table of Contents

- [Reading](#reading)
    - [Reading progress slider not showing up?](#reading-progress-slider-not-showing-up)
    - [What are "locations"?](#what-are-locations)
    - [How are reading time estimates calculated?](#how-are-reading-time-estimates-calculated)
    - [How to use text-to-speech?](#how-to-use-text-to-speech)
    - [How to use custom themes?](#how-to-use-custom-themes)
    - [My book is not displayed properly!](#my-book-is-not-displayed-properly)
    - [Custom style isn't applied consistently](#custom-style-isnt-applied-consistently)
- [Bookmarks & Annotations](#bookmarks-annotations)
    - [How are notes and bookmarks stored?](#how-are-notes-and-bookmarks-stored)
    - [Why does it show a warning dialog when I try to add annotations?](#why-does-it-show-a-warning-dialog-when-i-try-to-add-annotations)
    - [How are identifiers generated?](#how-are-identifiers-generated)
- [Security](#Security)
    - [Is Foliate secure?](#is-foliate-secure)
    - [Why does the Flatpak require sandbox escape?](#why-does-the-flatpak-require-sandbox-escape)
- [For Publishers and Developers](#for-publishers-and-developers)

## Reading

### Reading progress slider not showing up?

In order to display the slider, Epub.js must generate [locations](#what-are-locations) for the entire book. For books with lots of pages, this could take a while. In the meantime, you can still read the book and use all other functionalities normally.

Once the locations are generated, the info is cached (in `~/.cache/com.github.johnfactotum.Foliate`) and should load instantly next time you open the book.

If "Cache locations" is disabled, a chapter slider will be shown instead.

### What are "locations"?

In Foliate, a book is divided into _locations_. Each location is 1024 characters long. This serves as a "page count" that is independent from the size of the viewport.

After the locations are loaded, the current location number and the total number of locations will be displayed on the footer by default. You can also access this information by clicking on the progress percentage button on the navbar, or by <kbd>Ctrl</kbd>+<kbd>L</kbd>.

### How are reading time estimates calculated?

Currently, it simply uses the number of [locations](#what-are-locations) (i.e. a character count) as a rough estimate, with adjustments applied to CJK languages. (If it's wildly inaccurate for some language, please open an issue!) It isn't based on the page turning speed.

### How to use text-to-speech?

Foliate supports eSpeak NG, and Festival. To use them, you have to set the TTS command in the preferences to `espeak-ng`, or `festival --tts`. You can supply additional flags to change the voice or other options (use `man espeak-ng` or `man festival` to see all the options).

Other speech synthesis programs can be used, but Foliate expects the following interface:
1. The program would read text from `stdin` and speak them
2. Return when finished speaking
3. Stop speaking when `SIGINT` is received

If the program doesn't support this, one can write a wrapper script and set it as the TTS command. For example, to use [gTTS](https://gtts.readthedocs.io/), the following script can be used:
```bash
#!/bin/bash
gtts-cli -l $FOLIATE_TTS_LANG_LOWER --file /dev/stdin | play -t mp3 - &
trap 'kill $!; exit 0' INT
wait
```

When using eSpeak NG, it will automatically select a voice based on the book's language if the `-v` option is not set in the command. For other TTS programs, you can use the environment variable `$FOLIATE_TTS_LANG` to get the language code, or `$FOLIATE_TTS_LANG_LOWER` for the all lower case code. If the program does not support setting language directly, you would need to write you're own script to select a voice from the language.

When run as a Flatpak, Foliate need to access and run TTS programs on the host system. See ["Why does the Flatpak require sandbox escape?"](https://github.com/johnfactotum/foliate/wiki#why-does-the-flatpak-require-sandbox-escape). For the Snap package, only `espeak-ng` `mb-en1` voice is available at the moment. See [#324](https://github.com/johnfactotum/foliate/issues/324).

### How to use custom themes?

The themes can be configured from the menu. This is the recommended way.

If you want to manually edit themes, you can edit the file `/home/user/.config/com.github.johnfactotum.Foliate/themes.json` (or create the file if does not already exists). If you're using the flatpak version, the file should be placed in `~/.var/app/com.github.johnfactotum.Foliate/config/com.github.johnfactotum.Foliate`.

Note that since v2.0, the underlying settings now store the colors directly, instead of referencing the themes. So you can change the theme with `dconf-editor` or, from the command line, with `gsettings`, without needing to modify `themes.json` at all. The themes from `themes.json` merely provide a way to quickly switch color schemes from the GUI.

### My book is not displayed properly!

You can help by testing out whether it's a problem with Epub.js, or a problem specific to Foliate:

1. Go to https://futurepress.github.io/epub.js/examples/input.html (It's best to test with a WebKit-based browser, as there are sometimes WebKit specific issues)
2. Use the input button at the top of that page to choose your file. Note that the button might not show if your viewport is too small. Try resizing the window or zooming out if you don't see the button.
3. The prev/next button on their example is currently broken. However, if you open your browser's developer tools, you should be able to use the console and run `rendition.next()` and `rendition.prev()`.
4. If it doesn't work, consider [reporting the issue upstream](https://github.com/futurepress/epub.js/issues). If it only fails in Foliate, you can [report it here](https://github.com/johnfactotum/foliate/issues).

If you're encountering any kind of glitch, as a workaround it might be helpful to reload the book (<kbd>Ctrl</kbd> + <kbd>R</kbd>), or clear the cache (<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd>).

### Custom style isn't applied consistently

Currently Foliate only overrides font-size on `body` and `p` with `!important`, and it may not work with some books' stylesheet. You can edit the book (either manually or with an editor) and view the stylesheet to see what's causing this, then we can see if we can override it without breaking other books.

Generally, it's kind of hard to strike a balance between user control and publisher control. Ultimately, it is up to the publishers to not hardcode styles too much.

See: [#2](https://github.com/johnfactotum/foliate/issues/2), [#34](https://github.com/johnfactotum/foliate/issues/34), [#67](https://github.com/johnfactotum/foliate/issues/67), [#173](https://github.com/johnfactotum/foliate/issues/173), [#220](https://github.com/johnfactotum/foliate/issues/220)

## Bookmarks & Annotations

### How are notes and bookmarks stored?

Your reading progress, bookmarks, and annotations are saved in `~/.local/share/com.github.johnfactotum.Foliate`

If you're using the flatpak version, they should be in `~/.var/app/com.github.johnfactotum.Foliate/data/com.github.johnfactotum.Foliate`

The data for each book is stored in a JSON file named after the book's identifier. If you'd like to sync or backup your progress and notes, simply copy these files and everything should just work™.

Inside the JSON file, the structure looks like this:
```javascript
{
  "lastLocation": "epubcfi(/6/12[main2]!/4/2/2/2/1:0)", // your reading progress
  "annotations": [
    {
      // EPUB CFI of the highlighted text
      "value": "epubcfi(/6/12[main2]!/4/2/2/2,/1:0,/1:286)",
      // highlight color
      "color": "aqua",
      // the highlighted text
      "text": "Good sense is, of all things among men, the most equally distributed; for every one thinks himself so abundantly provided with it, that those even who are the most difficult to satisfy in everything else, do not usually desire a larger measure of this quality than they already possess.",
      // ... and your note
      "note": "Very droll, René."
    },
    // ...
  ],
  "bookmarks": [], // bookmarks are stored here
  "metadata": { /* the book's metadata is provided here for convenience, starting from v1.5.0 */ }
}
```

The "epubcfi(...)" parts are [(EPUB) Canonical Fragment Identifiers](http://idpf.org/epub/linking/cfi/epub-cfi.html), which is the "standardized method for referencing arbitrary content within an EPUB® Publication."

### Why does it show a warning dialog when I try to add annotations?

"This file or format does not work well with annotations" is shown when you try to add annotations to books that are not EPUB or Kindle formats. Annotations rely on EPUB CFI to work, which is not reliable for non EPUB based formats, because the CFIs are based on the rendered HTML output rather than the source. While there will be no data loss -- you will always be able to access the contents of the annotations, in the future they might be not be correctly applied to the book due to changes in the rendering process.

### How are identifiers generated?

For formats or books wihout unique identifiers, Foliate will generate one from the MD5 hash of the file. To speed things up, it only uses up to the first 10000000 bytes of the file. You can run `head -c 10000000 $YOUR_FILE_HERE | md5sum` to get the same hash.

Note: currently identifiers are not generated for EPUB and Kindle files. Books of these formats wihout identifiers can still be opened, but reading progress are not remembered and annotations are disabled.

## Security

### Is Foliate secure?

EPUB files are basically HTML files packaged in a Zip file. They can contain JavaScript and other potentially unsafe content.

By default, JavaScript and all external resources are blocked in Foliate. For additional safeguard against potential vulnerabilities it is recommended to run Foliate in a sandboxed environment, for example, by using the Flatpak package.

Some books might require JavaScript to function. You can enable JavaScript by enabling "Allow Unsafe Content". **Do not do this for versions before 2.2.0. Before 2.2.0, allowing unsafe content also allows external resources like images to load; this allows malicious books to read any local files and send the contents online.** In general it is strongly recommended NOT to allow unsafe content. 

### Why does the Flatpak require sandbox escape?

Foliate requires the `--talk-name=org.freedesktop.Flatpak` permission in order to access offline dictionary and text-to-speech programs on the host. If you don't need these functionalities, you can override this permission.

## For Publishers and Developers

- WeKit's Developer Tools can be accessed by going to the primary menu > _Advanced_ > _Enable Developer Tools_. After that, you can right click on any element and select _Inspect Element_.

  Note: it's recommended that you detach the Developer Tools panel to a separate window, as shortcuts set on the viewer window will interfere with key presses in Developer Tools.
- Foliate supports Apple Books' `__ibooks_internal_theme` attribute. It can be used in CSS selectors to apply styles based on the theme.
