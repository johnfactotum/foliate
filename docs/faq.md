# FAQ

## General

### Something isn't working! What can I do?

See [<i>troubleshooting common issues</i>](troubleshooting.md).

## Reading

### What are "locations"?

In Foliate, a book is divided into locations. Each location is 1500 bytes long. This gives you a rough "page count" that is (mostly) independent from the size of the viewport.

Locations are not exact. If you want to reference locations in a book, you should use the *identifiers* provided by Foliate, which are standard [EPUB Canonical Fragment Identifiers (CFI)](https://w3c.github.io/epub-specs/epub33/epubcfi/).

In 1.x and 2.x versions of Foliate, locations were calculated with a entirely different (slower but more precise) method and they are not compatible with the current version.

### How are reading time estimates calculated?

Currently, it simply uses the number of locations — basically, a character count — as a rough estimate. It isn't based on your page turning speed.

### How to use text-to-speech?

Foliate supports text-to-speech with speech-dispatcher. To use it, you need to install `speech-dispatcher` and output modules such as `espeak-ng`.

### How to use custom themes?

Themes are defined as JSON files. Here is an example theme:

```json
{
    "label": "Ghostly Mist",
    "light": {
        "fg": "#999999",
        "bg": "#cccccc",
        "link": "#666666"
    },
    "dark": {
        "fg": "#666666",
        "bg": "#333333",
        "link": "#777777"
    }
}
```

To install themes, you need to put them in `/home/user/.config/com.github.johnfactotum.Foliate/themes/`. If you're using Flatpak, the files should be placed in `~/.var/app/com.github.johnfactotum.Foliate/config/com.github.johnfactotum.Foliate/themes/`.

### Can I set my own custom CSS styles?

You can create a user stylesheet file at `/home/user/.config/com.github.johnfactotum.Foliate/user-stylesheet.css`. If you're using Flatpak, the location should be `~/.var/app/com.github.johnfactotum.Foliate/config/com.github.johnfactotum.Foliate/user-stylesheet.css`. Note that Foliate needs to be restarted for changes to take effect.

Tip: you can use the [`:lang()`](https://developer.mozilla.org/en-US/docs/Web/CSS/:lang) selector to apply different styles for books in different languages.

### The dictionary/Wikipedia/translation tool doesn't work!

- These tools requires network access to online third party services.
- Dictionary and Wikipedia lookup requires that the language metadata be correctly marked up in the book.
- Dictionary and Wikipedia lookup relies on Wikimedia's REST APIs and they often have trouble extracting content from wikitext (a notoriously difficult task).

## Bookmarks & Annotations

### How are notes and bookmarks stored?

Your reading progress, bookmarks, and annotations are saved in `~/.local/share/com.github.johnfactotum.Foliate`.

If you're using the Flatpak version, they should be in `~/.var/app/com.github.johnfactotum.Foliate/data/com.github.johnfactotum.Foliate`.

The data for each book is stored in a JSON file named after the book's identifier. If you'd like to sync or backup your progress and notes, simply copy these files and everything should just work™.

Inside the JSON file, the structure looks like this:

```javascript
{
  "lastLocation": "epubcfi(/6/12!/4/2/2/2/1:0)", // your reading progress
  "annotations": [
    {
      // EPUB CFI of the highlighted text
      "value": "epubcfi(/6/12!/4/2/2/2,/1:0,/1:286)",
      // highlight color
      "color": "aqua",
      // the highlighted text
      "text": "Good sense is, of all things among men, the most equally distributed; for every one thinks himself so abundantly provided with it, that those even who are the most difficult to satisfy in everything else, do not usually desire a larger measure of this quality than they already possess.",
      // ... and your note
      "note": "Very droll, René."
    },
    // ...
  ],
  "bookmarks": [ /* bookmarks are stored here */ ],
  "metadata": { /* the book's metadata */ }
}
```

The `epubcfi(...)` parts are [EPUB Canonical Fragment Identifiers (CFI)](https://w3c.github.io/epub-specs/epub33/epubcfi/), which is the "standardized method for referencing arbitrary content within an EPUB® Publication."

### How are identifiers generated?

For formats or books without unique identifiers, Foliate will generate one from the MD5 hash of the file. To speed things up, it only uses up to the first 10000000 bytes of the file. You can run `head -c 10000000 $YOUR_FILE_HERE | md5sum` to get the same hash.

## Security

### Is Foliate secure?

EPUB files are HTML files packaged in a Zip file. They can contain JavaScript and other potentially unsafe content.

Currently, JavaScript and external resources are blocked in Foliate. For additional safeguard against potential vulnerabilities it is recommended to run Foliate in a sandboxed environment, for example, by using the Flatpak package.

In 1.x and 2.x versions of Foliate, JavaScript could be optionally enabled. Do NOT do this if you're using these versions as it is highly insecure.

### Why does it require these Flatpak permissions?

- It requires network access (`--share=network`) for online dictionary, encyclopedia, and translation tools.
- It requires `--filesystem=xdg-run/speech-dispatcher:ro` in order to connect to the speech-dispatcher server on the host.
- It requires `--add-policy=Tracker3.dbus:org.freedesktop.Tracker3.Miner.Files=tracker:Documents` in order to access the [Tracker](https://tracker.gnome.org/) database on the host. This allows Foliate to get the locations of files when opening books from the library view.

The permissions listed above are all optional. If you don't need the functionalities provided by these permissions, you should consider overriding them with the `flatpak` command or with tools like [Flatseal](https://github.com/tchx84/flatseal).

## For Publishers and Developers

### Developer Tools

WeKit's Developer Tools can be accessed by going to the primary menu > Inspector, or by pressing <kbd>F12</kbd>. It's recommended that you detach the Developer Tools panel to a separate window; otherwise shortcuts set on the viewer window will interfere with key presses in Developer Tools.
