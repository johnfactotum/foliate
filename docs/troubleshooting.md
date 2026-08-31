# Troubleshooting

## I changed the font, color, and spacing settings, but it's not working for some books

Foliate tries to respect the publisher's stylesheet. It's hard to strike a balance between user control and publisher control, and overriding the book's styles can result in unexpted breakages. Ultimately, it is up to the publishers to not hardcode styles unecessarily.

To work around this issue, you can [add your own custom styles](https://github.com/johnfactotum/foliate/blob/gtk4/docs/faq.md#can-i-set-my-own-custom-css-styles).

## The dictionary/Wikipedia/translation tool doesn't work

- These tools require network access to online third party services.
- The language metadata needs to be correctly marked up in the book.
- Dictionary and Wikipedia lookup rely on Wikimedia's REST APIs and they often have trouble extracting content from wikitext (a notoriously difficult task).

## Text-to-speech doesn't work

You need to install `speech-dispatcher` and output modules such as `espeak-ng`. To test your Speech Dispatcher configuration, use the `spd-say` command.

If you're using Flatpak or Snap, you need to have Speech Dispatcher >= 0.11.4 installed on the host system, and it must be configured with socket activation support . To check this, make sure the file `/usr/lib/systemd/user/speech-dispatcher.socket` exists. Contact the maintainers of your distro if `speech-dispatcher` doesn't support socket activation on your system.

To work around the issue when Speech Dispatcher doesn't support socket activation, you can have the command `speech-dispatcher --timeout 0` run on startup. This will keep Speech Dispatcher running at all times.

## I deleted a book on my disk, but it's still showing up in Foliate's library

Foliate doesn't keep track of your files. So it can't know whether they are deleted or not. For now, you have to manually remove the book in Foliate after deleting the file.

Conversely, removing a book in Foliate will not delete the file.

## It can't open books. It hangs/crashes/shows a blank page...

### ... and I'm using Nvidia GPU

WebKitGTK, the library Foliate uses to render books is known to have problems with Nvidia. To fix this:
1. Make sure to your system is up-to-date.
2. Try setting the environment variable `WEBKIT_DISABLE_DMABUF_RENDERER=1`. This will temporarily fix [bug 261874](https://bugs.webkit.org/show_bug.cgi?id=261874). If you're using Flatpak, you can add environment variables with [Flatseal](https://flathub.org/apps/com.github.tchx84.Flatseal).

### ... and I'm using Flatpak

The issue could be mixed locales, which Flatpak can't handle. To fix this, set the environment variable `LC_ALL=en_US.UTF-8`. You can add environment variables with [Flatseal](https://flathub.org/apps/com.github.tchx84.Flatseal).

### ... and I'm using Snap

The issue could be [#1102](https://github.com/johnfactotum/foliate/issues/1102). To fix this, run the following command:

```sh
sudo /usr/lib/snapd/snap-discard-ns foliate
```

## I'm still having issues

Please [file a bug report](https://github.com/johnfactotum/foliate/issues/new/choose). Don't be concerned about whether your issue is already reported or not. It's better to have duplicate reports of the same bug than having different bugs in the same issue thread.
