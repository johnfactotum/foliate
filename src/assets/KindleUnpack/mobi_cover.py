#!/usr/bin/env python
# -*- coding: utf-8 -*-
# vim:ts=4:sw=4:softtabstop=4:smarttab:expandtab

from __future__ import unicode_literals, division, absolute_import, print_function

from .compatibility_utils import unicode_str

from .unipath import pathof
import os
import imghdr

import struct
# note:  struct pack, unpack, unpack_from all require bytestring format
# data all the way up to at least python 2.7.5, python 3 okay with bytestring

USE_SVG_WRAPPER = True
""" Set to True to use svg wrapper for default. """

FORCE_DEFAULT_TITLE = False
""" Set to True to force to use the default title. """

COVER_PAGE_FINENAME = 'cover_page.xhtml'
""" The name for the cover page. """

DEFAULT_TITLE = 'Cover'
""" The default title for the cover page. """

MAX_WIDTH = 4096
""" The max width for the svg cover page. """

MAX_HEIGHT = 4096
""" The max height for the svg cover page. """


def get_image_type(imgname, imgdata=None):
    imgtype = unicode_str(imghdr.what(pathof(imgname), imgdata))

    # imghdr only checks for JFIF or Exif JPEG files. Apparently, there are some
    # with only the magic JPEG bytes out there...
    # ImageMagick handles those, so, do it too.
    if imgtype is None:
        if imgdata is None:
            with open(pathof(imgname), 'rb') as f:
                imgdata = f.read()
        if imgdata[0:2] == b'\xFF\xD8':
            # Get last non-null bytes
            last = len(imgdata)
            while (imgdata[last-1:last] == b'\x00'):
                last-=1
            # Be extra safe, check the trailing bytes, too.
            if imgdata[last-2:last] == b'\xFF\xD9':
                imgtype = "jpeg"
    return imgtype


def get_image_size(imgname, imgdata=None):
    '''Determine the image type of imgname (or imgdata) and return its size.

    Originally,
    Determine the image type of fhandle and return its size.
    from draco'''
    if imgdata is None:
        fhandle = open(pathof(imgname), 'rb')
        head = fhandle.read(24)
    else:
        head = imgdata[0:24]
    if len(head) != 24:
        return

    imgtype = get_image_type(imgname, imgdata)
    if imgtype == 'png':
        check = struct.unpack(b'>i', head[4:8])[0]
        if check != 0x0d0a1a0a:
            return
        width, height = struct.unpack(b'>ii', head[16:24])
    elif imgtype == 'gif':
        width, height = struct.unpack(b'<HH', head[6:10])
    elif imgtype == 'jpeg' and imgdata is None:
        try:
            fhandle.seek(0)  # Read 0xff next
            size = 2
            ftype = 0
            while not 0xc0 <= ftype <= 0xcf:
                fhandle.seek(size, 1)
                byte = fhandle.read(1)
                while ord(byte) == 0xff:
                    byte = fhandle.read(1)
                ftype = ord(byte)
                size = struct.unpack(b'>H', fhandle.read(2))[0] - 2
            # We are at a SOFn block
            fhandle.seek(1, 1)  # Skip `precision' byte.
            height, width = struct.unpack(b'>HH', fhandle.read(4))
        except Exception:  # IGNORE:W0703
            return
    elif imgtype == 'jpeg' and imgdata is not None:
        try:
            pos = 0
            size = 2
            ftype = 0
            while not 0xc0 <= ftype <= 0xcf:
                pos += size
                byte = imgdata[pos:pos+1]
                pos += 1
                while ord(byte) == 0xff:
                    byte = imgdata[pos:pos+1]
                    pos += 1
                ftype = ord(byte)
                size = struct.unpack(b'>H', imgdata[pos:pos+2])[0] - 2
                pos += 2
            # We are at a SOFn block
            pos += 1  # Skip `precision' byte.
            height, width = struct.unpack(b'>HH', imgdata[pos:pos+4])
            pos += 4
        except Exception:  # IGNORE:W0703
            return
    else:
        return
    return width, height

# XXX experimental
class CoverProcessor(object):

    """Create a cover page.

    """
    def __init__(self, files, metadata, rscnames, imgname=None, imgdata=None):
        self.files = files
        self.metadata = metadata
        self.rscnames = rscnames
        self.cover_page = COVER_PAGE_FINENAME
        self.use_svg = USE_SVG_WRAPPER  # Use svg wrapper.
        self.lang = metadata.get('Language', ['en'])[0]
        # This should ensure that if the methods to find the cover image's
        # dimensions should fail for any reason, the SVG routine will not be used.
        [self.width, self.height] = (-1,-1)
        if FORCE_DEFAULT_TITLE:
            self.title = DEFAULT_TITLE
        else:
            self.title = metadata.get('Title', [DEFAULT_TITLE])[0]

        self.cover_image = None
        if imgname is not None:
            self.cover_image = imgname
        elif 'CoverOffset' in metadata:
            imageNumber = int(metadata['CoverOffset'][0])
            cover_image = self.rscnames[imageNumber]
            if cover_image is not None:
                self.cover_image = cover_image
            else:
                print('Warning: Cannot identify the cover image.')
        if self.use_svg:
            try:
                if imgdata is None:
                    fname = os.path.join(files.imgdir, self.cover_image)
                    [self.width, self.height] = get_image_size(fname)
                else:
                    [self.width, self.height] = get_image_size(None, imgdata)
            except:
                self.use_svg = False
            width = self.width
            height = self.height
            if width < 0 or height < 0 or width > MAX_WIDTH or height > MAX_HEIGHT:
                self.use_svg = False
        return

    def getImageName(self):
        return self.cover_image

    def getXHTMLName(self):
        return self.cover_page

    def buildXHTML(self):
        print('Building a cover page.')
        files = self.files
        cover_image = self.cover_image
        title = self.title
        lang = self.lang

        image_dir = os.path.normpath(os.path.relpath(files.k8images, files.k8text))
        image_path = os.path.join(image_dir, cover_image).replace('\\', '/')

        if not self.use_svg:
            data = ''
            data += '<?xml version="1.0" encoding="utf-8"?><!DOCTYPE html>'
            data += '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"'
            data += ' xml:lang="{:s}">\n'.format(lang)
            data += '<head>\n<title>{:s}</title>\n'.format(title)
            data += '<style type="text/css">\n'
            data += 'body {\n  margin: 0;\n  padding: 0;\n  text-align: center;\n}\n'
            data += 'div {\n  height: 100%;\n  width: 100%;\n  text-align: center;\n  page-break-inside: avoid;\n}\n'
            data += 'img {\n  display: inline-block;\n  height: 100%;\n  margin: 0 auto;\n}\n'
            data += '</style>\n</head>\n'
            data += '<body><div>\n'
            data += '  <img src="{:s}" alt=""/>\n'.format(image_path)
            data += '</div></body>\n</html>'
        else:
            width = self.width
            height = self.height
            viewBox = "0 0 {0:d} {1:d}".format(width, height)

            data = ''
            data += '<?xml version="1.0" encoding="utf-8"?><!DOCTYPE html>'
            data += '<html xmlns="http://www.w3.org/1999/xhtml"'
            data += ' xml:lang="{:s}">\n'.format(lang)
            data += '<head>\n  <title>{:s}</title>\n'.format(title)
            data += '<style type="text/css">\n'
            data += 'svg {padding: 0pt; margin:0pt}\n'
            data += 'body { text-align: center; padding:0pt; margin: 0pt; }\n'
            data += '</style>\n</head>\n'
            data += '<body>\n  <div>\n'
            data += '    <svg xmlns="http://www.w3.org/2000/svg" height="100%" preserveAspectRatio="xMidYMid meet"'
            data += ' version="1.1" viewBox="{0:s}" width="100%" xmlns:xlink="http://www.w3.org/1999/xlink">\n'.format(viewBox)
            data += '      <image height="{0}" width="{1}" xlink:href="{2}"/>\n'.format(height, width, image_path)
            data += '    </svg>\n'
            data += '  </div>\n</body>\n</html>'
        return data

    def writeXHTML(self):
        files = self.files
        cover_page = self.cover_page

        data = self.buildXHTML()

        outfile = os.path.join(files.k8text, cover_page)
        if os.path.exists(pathof(outfile)):
            print('Warning: {:s} already exists.'.format(cover_page))
            os.remove(pathof(outfile))
        with open(pathof(outfile), 'wb') as f:
            f.write(data.encode('utf-8'))
        return

    def guide_toxml(self):
        files = self.files
        text_dir = os.path.relpath(files.k8text, files.k8oebps)
        data = '<reference type="cover" title="Cover" href="{:s}/{:s}" />\n'.format(
                text_dir, self.cover_page)
        return data
