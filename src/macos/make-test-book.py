"""Create a small deterministic EPUB for the WKWebView integration test."""

import sys
import zipfile

with zipfile.ZipFile(sys.argv[1], 'w') as book:
    book.writestr('mimetype', 'application/epub+zip')
    book.writestr('META-INF/container.xml', '''<?xml version="1.0"?>
        <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
          <rootfiles><rootfile full-path="book.opf"
            media-type="application/oebps-package+xml"/></rootfiles>
        </container>''')
    book.writestr('book.opf', '''<?xml version="1.0"?>
        <package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id">
          <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
            <dc:identifier id="id">foliate-wkwebview-test</dc:identifier>
            <dc:title>WKWebView Test Book</dc:title><dc:language>en</dc:language>
            <meta property="dcterms:modified">2026-01-01T00:00:00Z</meta>
          </metadata>
          <manifest>
            <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
            <item id="one" href="one.xhtml" media-type="application/xhtml+xml"/>
            <item id="two" href="two.xhtml" media-type="application/xhtml+xml"/>
          </manifest>
          <spine><itemref idref="one"/><itemref idref="two"/></spine>
        </package>''')
    book.writestr('nav.xhtml', '''<html xmlns="http://www.w3.org/1999/xhtml"
        xmlns:epub="http://www.idpf.org/2007/ops"><head><title>Contents</title></head>
        <body><nav epub:type="toc"><ol>
          <li><a href="one.xhtml">Chapter One</a></li>
          <li><a href="two.xhtml">Chapter Two</a></li>
        </ol></nav></body></html>''')
    for name, title, text in [('one', 'Chapter One', 'First chapter native rendering.'),
                              ('two', 'Chapter Two', 'Second chapter searchneedle result.')]:
        paragraphs = ''.join(f'<p id="p{i}">{text} Paragraph {i}. '
                             + 'Reading across pages. ' * 25 + '</p>' for i in range(20))
        book.writestr(f'{name}.xhtml', f'''<html xmlns="http://www.w3.org/1999/xhtml">
            <head><title>{title}</title></head><body><h1>{title}</h1>
            {paragraphs}</body></html>''')
