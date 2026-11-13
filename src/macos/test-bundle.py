"""Verify the bundle can be relocated and has its native frameworks/resources."""

import plistlib
import subprocess
import sys
from pathlib import Path

bundle = Path(sys.argv[1])
contents = bundle / 'Contents'
with (contents / 'Info.plist').open('rb') as source:
    info = plistlib.load(source)
assert info['CFBundleIdentifier'] == 'com.github.johnfactotum.Foliate'
assert info['CFBundleIconFile'] == 'Foliate.icns'
icon = (contents / 'Resources' / info['CFBundleIconFile']).read_bytes()
assert icon[:4] == b'icns' and int.from_bytes(icon[4:8], 'big') == len(icon), 'Invalid app icon'
binary = contents / 'MacOS' / info['CFBundleExecutable']
frameworks = subprocess.check_output(['otool', '-L', str(binary)], text=True)
assert '/WebKit.framework/' in frameworks
assert '/AppKit.framework/' in frameworks
assert 'libgjs' not in frameworks and 'libgtk' not in frameworks
for asset in ('reader/reader.html', 'reader/reader.js', 'reader/markup.js',
              'foliate-js/view.js', 'foliate-js/epub.js', 'foliate-js/vendor/zip.js',
              'foliate-js/vendor/pdfjs/pdf.mjs', 'macos/reader.js', 'macos/reader.css',
              'COPYING'):
    assert (contents / 'Resources' / asset).is_file(), asset
print('Native frameworks, app icon, and relocatable reader resources verified')
