"""Package the native executable and the shared reader without GTK resources."""

import plistlib
import shutil
import sys
from pathlib import Path

source, binary, stamp = map(Path, sys.argv[1:4])
version = sys.argv[4]
contents = stamp.parent / 'Foliate.app' / 'Contents'
macos = contents / 'MacOS'
resources = contents / 'Resources'
macos.mkdir(parents=True, exist_ok=True)
resources.mkdir(parents=True, exist_ok=True)
shutil.copy2(binary, macos / 'foliate')
# The macOS icon is rendered from data/com.github.johnfactotum.Foliate.svg.
shutil.copy2(source / 'src' / 'macos' / 'Foliate.icns', resources / 'Foliate.icns')
for directory in ('reader', 'foliate-js'):
    shutil.copytree(source / 'src' / directory, resources / directory,
                    dirs_exist_ok=True, ignore=shutil.ignore_patterns('.git'))
(resources / 'macos').mkdir(exist_ok=True)
for name in ('reader.js', 'reader.css'):
    shutil.copy2(source / 'src' / 'macos' / name, resources / 'macos' / name)
shutil.copy2(source / 'COPYING', resources / 'COPYING')
with (contents / 'Info.plist').open('wb') as output:
    plistlib.dump({
        'CFBundleExecutable': 'foliate',
        'CFBundleIdentifier': 'com.github.johnfactotum.Foliate',
        'CFBundleName': 'Foliate',
        'CFBundleDisplayName': 'Foliate',
        'CFBundleIconFile': 'Foliate.icns',
        'CFBundlePackageType': 'APPL',
        'CFBundleShortVersionString': version,
        'CFBundleVersion': version,
        'LSMinimumSystemVersion': '13.0',
        'NSHighResolutionCapable': True,
        'NSPrincipalClass': 'NSApplication',
        'CFBundleDocumentTypes': [{
            'CFBundleTypeName': 'E-Book',
            'CFBundleTypeRole': 'Viewer',
            'LSHandlerRank': 'Alternate',
            'CFBundleTypeExtensions': ['epub', 'mobi', 'azw', 'azw3', 'fb2',
                                       'fbz', 'cbz', 'pdf'],
        }],
    }, output)
stamp.write_text(version + '\n')
