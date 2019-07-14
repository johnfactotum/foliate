#!/usr/bin/env python
# -*- coding: utf-8 -*-
# vim:ts=4:sw=4:softtabstop=4:smarttab:expandtab

from __future__ import unicode_literals, division, absolute_import, print_function

import os

__path__ = ["lib", os.path.dirname(os.path.realpath(__file__)), "kindleunpack"]

import sys
import codecs
import traceback

from .compatibility_utils import PY2, binary_type, utf8_str, unicode_str
from .compatibility_utils import unicode_argv, add_cp65001_codec
from .compatibility_utils import hexlify

add_cp65001_codec()

from .unipath import pathof

if PY2:
    range = xrange
    # since will be printing unicode under python 2 need to protect
    # against sys.stdout.encoding being None stupidly forcing forcing ascii encoding
    if sys.stdout.encoding is None:
        sys.stdout = codecs.getwriter("utf-8")(sys.stdout)
    else:
        encoding = sys.stdout.encoding
        sys.stdout = codecs.getwriter(encoding)(sys.stdout)

# Changelog
#  0.11 - Version by adamselene
#  0.11pd - Tweaked version by pdurrant
#  0.12 - extracts pictures too, and all into a folder.
#  0.13 - added back in optional output dir for those who don't want it based on infile
#  0.14 - auto flush stdout and wrapped in main, added proper return codes
#  0.15 - added support for metadata
#  0.16 - metadata now starting to be output as an opf file (PD)
#  0.17 - Also created tweaked text as source for Mobipocket Creator
#  0.18 - removed raw mobi file completely but kept _meta.html file for ease of conversion
#  0.19 - added in metadata for ASIN, Updated Title and Rights to the opf
#  0.20 - remove _meta.html since no longer needed
#  0.21 - Fixed some typos in the opf output, and also updated handling
#         of test for trailing data/multibyte characters
#  0.22 - Fixed problem with > 9 images
#  0.23 - Now output Start guide item
#  0.24 - Set firstaddl value for 'TEXtREAd'
#  0.25 - Now added character set metadata to html file for utf-8 files.
#  0.26 - Dictionary support added. Image handling speed improved.
#         For huge files create temp files to speed up decoding.
#         Language decoding fixed. Metadata is now converted to utf-8 when written to opf file.
#  0.27 - Add idx:entry attribute "scriptable" if dictionary contains entry length tags.
#         Don't save non-image sections as images. Extract and save source zip file
#         included by kindlegen as kindlegensrc.zip.
#  0.28 - Added back correct image file name extensions, created FastConcat class to simplify and clean up
#  0.29 - Metadata handling reworked, multiple entries of the same type are now supported.
#         Several missing types added.
#         FastConcat class has been removed as in-memory handling with lists is faster, even for huge files.
#  0.30 - Add support for outputting **all** metadata values - encode content with hex if of unknown type
#  0.31 - Now supports Print Replica ebooks, outputting PDF and mysterious data sections
#  0.32 - Now supports NCX file extraction/building.
#                 Overhauled the structure of mobiunpack to be more class oriented.
#  0.33 - Split Classes ito separate files and added prelim support for KF8 format eBooks
#  0.34 - Improved KF8 support, guide support, bug fixes
#  0.35 - Added splitting combo mobi7/mobi8 into standalone mobi7 and mobi8 files
#         Also handle mobi8-only file properly
#  0.36 - very minor changes to support KF8 mobis with no flow items, no ncx, etc
#  0.37 - separate output, add command line switches to control, interface to Mobi_Unpack.pyw
#  0.38 - improve split function by resetting flags properly, fix bug in Thumbnail Images
#  0.39 - improve split function so that ToC info is not lost for standalone mobi8s
#  0.40 - make mobi7 split match official versions, add support for graphic novel metadata,
#         improve debug for KF8
#  0.41 - fix when StartOffset set to 0xffffffff, fix to work with older mobi versions,
#         fix other minor metadata issues
#  0.42 - add new class interface to allow it to integrate more easily with internal calibre routines
#  0.43 - bug fixes for new class interface
#  0.44 - more bug fixes and fix for potnetial bug caused by not properly closing created zip archive
#  0.45 - sync to version in the new Mobi_Unpack plugin
#  0.46 - fixes for: obfuscated fonts, improper toc links and ncx, add support for opentype fonts
#  0.47 - minor opf improvements
#  0.48 - ncx link fixes
#  0.49 - use azw3 when splitting mobis
#  0.50 - unknown change
#  0.51 - fix for converting filepos links to hrefs, Added GPL3 notice, made KF8 extension just '.azw3'
#  0.52 - fix for cover metadata (no support for Mobipocket Creator)
#  0.53 - fix for proper identification of embedded fonts, added new metadata items
#  0.54 - Added error-handling so wonky embedded fonts don't bomb the whole unpack process,
#         entity escape KF8 metadata to ensure valid OPF.
#  0.55  Strip extra StartOffset EXTH from the mobi8 header when splitting, keeping only the relevant one
#         For mobi8 files, don't generate duplicate guide entries from the metadata if we could extract one
#         from the OTH table.
#  0.56 - Added further entity escaping of OPF text.
#         Allow unicode string file paths to be passed as arguments to the unpackBook method without blowing up later
#         when the attempt to "re"-unicode a portion of that filename occurs in the process_all_mobi_headers method.
#  0.57 - Fixed eror when splitting Preview files downloaded from KDP website
#  0.58 - Output original kindlegen build log ('CMET' record) if included in the package.
#  0.58 - Include and extend functionality of DumpMobiHeader, replacing DEBUG with DUMP
#  0.59 - Much added DUMP functionality, including full dumping and descriptions of sections
#  0.60 - Bug fixes in opf, div tables, bad links, page breaks, section descriptions
#       - plus a number of other bug fixed that were found by Sergey Dubinets
#       - fixs for file/paths that require full unicode to work properly
#       - replace subprocess with multiprocessing to remove need for unbuffered stdout
#  0.61 - renamed to be KindleUnpack and more unicode/utf-8 path bug fixes and other minor fixes
#  0.62 - fix for multiprocessing on Windows, split fixes, opf improvements
#  0.63 - Modified to process right to left page progression books properly.
#       - Added some id_map_strings and RESC section processing; metadata and
#       - spine in the RESC are integrated partly to content.opf.
#  0.63a- Separated K8 RESC processor to an individual file. Bug fixes. Added cover page creation.
#  0.64 - minor bug fixes to more properly handle unicode command lines, and support for more jpeg types
#  0.64a- Modifed to handle something irregular mobi and azw3 files.
#  0.64b- Modifed to create k8resc.spine for no RECS files.
#  0.65 - Bug fixes to shorten title and remove epub3 "properties" to make the output epub2 compliant
#  0.65a- Bug fixes to extract RESC section correctly, to prevent item id confliction
#       - and to process multiline comments in RESC.
#  0.66 - Bug fix to deal with missing first resource information sometimes generated by calibre
#  0.66a- Fixed minor bugs, which probably do not affect the output anything
#  0.67 - Fixed Mobi Split functionality bug with azw3 images not being properly copied
#  0.68 - preliminary support for handling PAGE sections to create page-map.xml
#  0.69 - preliminary support for CONT and CRES for HD Images
#  0.70 - preliminary support for decoding apnx files when used with azw3 ebooks
#  0.71 - extensive refactoring of kindleunpack.py to make it more manageable
#  0.72 - many bug fixes from tkeo: fix pageProcessing, fix print replica, fix resc usage, fix font mangling, etc.
#  0.72a- fix for still broken PrintReplica support
#  0.72b- preview for primary epub3 support. A parameter epubver(default='2') is added to process_all_mobi_headers(), unpackBook().
#  0.72c- preview for apnx page support
#  0.72d- more bugs fixed in preview features, much improved GUI with ability to dynaically grow the Log Window with preference support
#  0.72e- more bug fixes, Tk GUI adds support for epub version and HDImage use
#  0.72f- more bug fixes, implement use hd images if present
#  0.72g- minor bug fixes and cleanups from tkeo
#  0.72h- updated mobi_header and mobi_k8proc to use the correct fragment and guide terms in place of div and other
#         to better match the terms that both Calibre and Amazon use internally to their own software
#  0.72x- very experimental conversion to use new mobi_k8resc.py and some of its associated changes
#  0.72y- more changes to simplify and integrate in epub3 support in a simpler manner
#  0.72z- remove redundancy in mobi_opf.py and bug fixes for mobi_k8resc.py
#  0.73   faster mobi split, numerous bug fixes in mobi_k8proc, mobi_header, mobi_opf, mobi_k8resc, etc
#  0.74   added refines metadata, fixed language code in ncx and title in nav, added support for opf: from refines
#  0.75   much improved dictioanry support including support for multiple inflection sections, minor mobi_opf fixes
#  0.76   pre-release version only fix name related issues in opf by not using original file name in mobi7
#  0.77   bug fix for unpacking HDImages with included Fonts
#  0.80   converted to work with both python 2.7 and Python 3.3 and later
#  0.81   various fixes
#  0.82   Handle calibre-generated mobis that can have skeletons with no fragments

DUMP = False
""" Set to True to dump all possible information. """

WRITE_RAW_DATA = False
""" Set to True to create additional files with raw data for debugging/reverse engineering. """

SPLIT_COMBO_MOBIS = False
""" Set to True to split combination mobis into mobi7 and mobi8 pieces. """

CREATE_COVER_PAGE = True  # XXX experimental
""" Create and insert a cover xhtml page. """

EOF_RECORD = b'\xe9\x8e' + b'\r\n'
""" The EOF record content. """

TERMINATION_INDICATOR1 = b'\x00'
TERMINATION_INDICATOR2 = b'\x00\x00'
TERMINATION_INDICATOR3 = b'\x00\x00\x00'

KINDLEGENSRC_FILENAME = "kindlegensrc.zip"
""" The name for the kindlegen source archive. """

KINDLEGENLOG_FILENAME = "kindlegenbuild.log"
""" The name for the kindlegen build log. """

K8_BOUNDARY = b'BOUNDARY'
""" The section data that divides K8 mobi ebooks. """

import os
import struct
import re
import zlib
import getopt

class unpackException(Exception):
    pass


# import the kindleunpack support libraries
from .unpack_structure import fileNames
from .mobi_sectioner import Sectionizer, describe
from .mobi_header import MobiHeader, dump_contexth
from .mobi_utils import toBase32
from .mobi_opf import OPFProcessor
from .mobi_html import HTMLProcessor, XHTMLK8Processor
from .mobi_ncx import ncxExtract
from .mobi_k8proc import K8Processor
from .mobi_split import mobi_split
from .mobi_k8resc import K8RESCProcessor
from .mobi_nav import NAVProcessor
from .mobi_cover import CoverProcessor, get_image_type
from .mobi_pagemap import PageMapProcessor
from .mobi_dict import dictSupport


def processSRCS(i, files, rscnames, sect, data):
    # extract the source zip archive and save it.
    print("File contains kindlegen source archive, extracting as %s" % KINDLEGENSRC_FILENAME)
    srcname = os.path.join(files.outdir, KINDLEGENSRC_FILENAME)
    with open(pathof(srcname), 'wb') as f:
        f.write(data[16:])
    rscnames.append(None)
    sect.setsectiondescription(i,"Zipped Source Files")
    return rscnames


def processPAGE(i, files, rscnames, sect, data, mh, pagemapproc):
    # process any page map information and create an apnx file
    pagemapproc = PageMapProcessor(mh, data)
    rscnames.append(None)
    sect.setsectiondescription(i,"PageMap")
    apnx_meta = {}
    acr = sect.palmname.decode('latin-1').rstrip('\x00')
    apnx_meta['acr'] = acr
    apnx_meta['cdeType'] = mh.metadata['cdeType'][0]
    apnx_meta['contentGuid'] = hex(int(mh.metadata['UniqueID'][0]))[2:]
    apnx_meta['asin'] = mh.metadata['ASIN'][0]
    apnx_meta['pageMap'] = pagemapproc.getPageMap()
    if mh.version == 8:
        apnx_meta['format'] = 'MOBI_8'
    else:
        apnx_meta['format'] = 'MOBI_7'
    apnx_data = pagemapproc.generateAPNX(apnx_meta)
    if mh.isK8():
        outname = os.path.join(files.outdir, 'mobi8-'+files.getInputFileBasename() + '.apnx')
    else:
        outname = os.path.join(files.outdir, 'mobi7-'+files.getInputFileBasename() + '.apnx')
    with open(pathof(outname), 'wb') as f:
        f.write(apnx_data)
    return rscnames, pagemapproc


def processCMET(i, files, rscnames, sect, data):
    # extract the build log
    print("File contains kindlegen build log, extracting as %s" % KINDLEGENLOG_FILENAME)
    srcname = os.path.join(files.outdir, KINDLEGENLOG_FILENAME)
    with open(pathof(srcname), 'wb') as f:
        f.write(data[10:])
    rscnames.append(None)
    sect.setsectiondescription(i,"Kindlegen log")
    return rscnames


# fonts only exist in KF8 ebooks
# Format:  bytes  0 -  3:  'FONT'
#          bytes  4 -  7:  uncompressed size
#          bytes  8 - 11:  flags
#              flag bit 0x0001 - zlib compression
#              flag bit 0x0002 - obfuscated with xor string
#          bytes 12 - 15:  offset to start of compressed font data
#          bytes 16 - 19:  length of xor string stored before the start of the comnpress font data
#          bytes 20 - 23:  start of xor string
def processFONT(i, files, rscnames, sect, data, obfuscate_data, beg, rsc_ptr):
    fontname = "font%05d" % i
    ext = '.dat'
    font_error = False
    font_data = data
    try:
        usize, fflags, dstart, xor_len, xor_start = struct.unpack_from(b'>LLLLL',data,4)
    except:
        print("Failed to extract font: {0:s} from section {1:d}".format(fontname,i))
        font_error = True
        ext = '.failed'
        pass
    if not font_error:
        print("Extracting font:", fontname)
        font_data = data[dstart:]
        extent = len(font_data)
        extent = min(extent, 1040)
        if fflags & 0x0002:
            # obfuscated so need to de-obfuscate the first 1040 bytes
            key = bytearray(data[xor_start: xor_start+ xor_len])
            buf = bytearray(font_data)
            for n in range(extent):
                buf[n] ^=  key[n%xor_len]
            font_data = bytes(buf)
        if fflags & 0x0001:
            # ZLIB compressed data
            font_data = zlib.decompress(font_data)
        hdr = font_data[0:4]
        if hdr == b'\0\1\0\0' or hdr == b'true' or hdr == b'ttcf':
            ext = '.ttf'
        elif hdr == b'OTTO':
            ext = '.otf'
        else:
            print("Warning: unknown font header %s" % hexlify(hdr))
        if (ext == '.ttf' or ext == '.otf') and (fflags & 0x0002):
            obfuscate_data.append(fontname + ext)
        fontname += ext
        outfnt = os.path.join(files.imgdir, fontname)
        with open(pathof(outfnt), 'wb') as f:
            f.write(font_data)
        rscnames.append(fontname)
        sect.setsectiondescription(i,"Font {0:s}".format(fontname))
        if rsc_ptr == -1:
            rsc_ptr = i - beg
    return rscnames, obfuscate_data, rsc_ptr


def processCRES(i, files, rscnames, sect, data, beg, rsc_ptr, use_hd):
    # extract an HDImage
    global DUMP
    data = data[12:]
    imgtype = get_image_type(None, data)

    if imgtype is None:
        print("Warning: CRES Section %s does not contain a recognised resource" % i)
        rscnames.append(None)
        sect.setsectiondescription(i,"Mysterious CRES data, first four bytes %s" % describe(data[0:4]))
        if DUMP:
            fname = "unknown%05d.dat" % i
            outname= os.path.join(files.outdir, fname)
            with open(pathof(outname), 'wb') as f:
                f.write(data)
            sect.setsectiondescription(i,"Mysterious CRES data, first four bytes %s extracting as %s" % (describe(data[0:4]), fname))
        rsc_ptr += 1
        return rscnames, rsc_ptr

    if use_hd:
        # overwrite corresponding lower res image with hd version
        imgname = rscnames[rsc_ptr]
        imgdest = files.imgdir
    else:
        imgname = "HDimage%05d.%s" % (i, imgtype)
        imgdest = files.hdimgdir
    print("Extracting HD image: {0:s} from section {1:d}".format(imgname,i))
    outimg = os.path.join(imgdest, imgname)
    with open(pathof(outimg), 'wb') as f:
        f.write(data)
    rscnames.append(None)
    sect.setsectiondescription(i,"Optional HD Image {0:s}".format(imgname))
    rsc_ptr += 1
    return rscnames, rsc_ptr


def processCONT(i, files, rscnames, sect, data):
    global DUMP
    # process a container header, most of this is unknown
    # right now only extract its EXTH
    dt = data[0:12]
    if dt == b"CONTBOUNDARY":
        rscnames.append(None)
        sect.setsectiondescription(i,"CONTAINER BOUNDARY")
    else:
        sect.setsectiondescription(i,"CONT Header")
        rscnames.append(None)
        if DUMP:
            cpage, = struct.unpack_from(b'>L', data, 12)
            contexth = data[48:]
            print("\n\nContainer EXTH Dump")
            dump_contexth(cpage, contexth)
            fname = "CONT_Header%05d.dat" % i
            outname= os.path.join(files.outdir, fname)
            with open(pathof(outname), 'wb') as f:
                f.write(data)
    return rscnames


def processkind(i, files, rscnames, sect, data):
    global DUMP
    dt = data[0:12]
    if dt == b"kindle:embed":
        if DUMP:
            print("\n\nHD Image Container Description String")
            print(data)
        sect.setsectiondescription(i,"HD Image Container Description String")
        rscnames.append(None)
    return rscnames


# spine information from the original content.opf
def processRESC(i, files, rscnames, sect, data, k8resc):
    global DUMP
    if DUMP:
        rescname = "RESC%05d.dat" % i
        print("Extracting Resource: ", rescname)
        outrsc = os.path.join(files.outdir, rescname)
        with open(pathof(outrsc), 'wb') as f:
            f.write(data)
    if True:  # try:
        # parse the spine and metadata from RESC
        k8resc = K8RESCProcessor(data[16:], DUMP)
    else:  # except:
        print("Warning: cannot extract information from RESC.")
        k8resc = None
    rscnames.append(None)
    sect.setsectiondescription(i,"K8 RESC section")
    return rscnames, k8resc


def processImage(i, files, rscnames, sect, data, beg, rsc_ptr, cover_offset):
    global DUMP
    # Extract an Image
    imgtype = get_image_type(None, data)
    if imgtype is None:
        print("Warning: Section %s does not contain a recognised resource" % i)
        rscnames.append(None)
        sect.setsectiondescription(i,"Mysterious Section, first four bytes %s" % describe(data[0:4]))
        if DUMP:
            fname = "unknown%05d.dat" % i
            outname= os.path.join(files.outdir, fname)
            with open(pathof(outname), 'wb') as f:
                f.write(data)
            sect.setsectiondescription(i,"Mysterious Section, first four bytes %s extracting as %s" % (describe(data[0:4]), fname))
        return rscnames, rsc_ptr

    imgname = "image%05d.%s" % (i, imgtype)
    if cover_offset is not None and i == beg + cover_offset:
        imgname = "cover%05d.%s" % (i, imgtype)
    print("Extracting image: {0:s} from section {1:d}".format(imgname,i))
    outimg = os.path.join(files.imgdir, imgname)
    with open(pathof(outimg), 'wb') as f:
        f.write(data)
    rscnames.append(imgname)
    sect.setsectiondescription(i,"Image {0:s}".format(imgname))
    if rsc_ptr == -1:
        rsc_ptr = i - beg
    return rscnames, rsc_ptr


def processPrintReplica(metadata, files, rscnames, mh):
    global DUMP
    global WRITE_RAW_DATA
    rawML = mh.getRawML()
    if DUMP or WRITE_RAW_DATA:
        outraw = os.path.join(files.outdir,files.getInputFileBasename() + '.rawpr')
        with open(pathof(outraw),'wb') as f:
            f.write(rawML)

    fileinfo = []
    print("Print Replica ebook detected")
    try:
        numTables, = struct.unpack_from(b'>L', rawML, 0x04)
        tableIndexOffset = 8 + 4*numTables
        # for each table, read in count of sections, assume first section is a PDF
        # and output other sections as binary files
        for i in range(numTables):
            sectionCount, = struct.unpack_from(b'>L', rawML, 0x08 + 4*i)
            for j in range(sectionCount):
                sectionOffset, sectionLength, = struct.unpack_from(b'>LL', rawML, tableIndexOffset)
                tableIndexOffset += 8
                if j == 0:
                    entryName = os.path.join(files.outdir, files.getInputFileBasename() + ('.%03d.pdf' % (i+1)))
                else:
                    entryName = os.path.join(files.outdir, files.getInputFileBasename() + ('.%03d.%03d.data' % ((i+1),j)))
                with open(pathof(entryName), 'wb') as f:
                    f.write(rawML[sectionOffset:(sectionOffset+sectionLength)])
    except Exception as e:
        print('Error processing Print Replica: ' + str(e))

    fileinfo.append([None,'', files.getInputFileBasename() + '.pdf'])
    usedmap = {}
    for name in rscnames:
        if name is not None:
            usedmap[name] = 'used'
    opf = OPFProcessor(files, metadata, fileinfo, rscnames, False, mh, usedmap)
    opf.writeOPF()


def processMobi8(mh, metadata, sect, files, rscnames, pagemapproc, k8resc, obfuscate_data, apnxfile=None, epubver='2'):
    global DUMP
    global WRITE_RAW_DATA

    # extract raw markup langauge
    rawML = mh.getRawML()
    if DUMP or WRITE_RAW_DATA:
        outraw = os.path.join(files.k8dir,files.getInputFileBasename() + '.rawml')
        with open(pathof(outraw),'wb') as f:
            f.write(rawML)

    # KF8 require other indexes which contain parsing information and the FDST info
    # to process the rawml back into the xhtml files, css files, svg image files, etc
    k8proc = K8Processor(mh, sect, files, DUMP)
    k8proc.buildParts(rawML)

    # collect information for the guide first
    guidetext = unicode_str(k8proc.getGuideText())

    # if the guide was empty, add in any guide info from metadata, such as StartOffset
    if not guidetext and 'StartOffset' in metadata:
        # Apparently, KG 2.5 carries over the StartOffset from the mobi7 part...
        # Taking that into account, we only care about the *last* StartOffset, which
        # should always be the correct one in these cases (the one actually pointing
        # to the right place in the mobi8 part).
        starts = metadata['StartOffset']
        last_start = starts[-1]
        last_start = int(last_start)
        if last_start == 0xffffffff:
            last_start = 0
        seq, idtext = k8proc.getFragTblInfo(last_start)
        filename, idtext = k8proc.getIDTagByPosFid(toBase32(seq), b'0000000000')
        linktgt = filename
        idtext = unicode_str(idtext, mh.codec)
        if idtext != '':
            linktgt += '#' + idtext
        guidetext += '<reference type="text" href="Text/%s" />\n' % linktgt

    # if apnxfile is passed in use it for page map information
    if apnxfile is not None and pagemapproc is None:
        with open(apnxfile, 'rb') as f:
            apnxdata = b"00000000" + f.read()
        pagemapproc = PageMapProcessor(mh, apnxdata)

    # generate the page map
    pagemapxml = ''
    if pagemapproc is not None:
        pagemapxml = pagemapproc.generateKF8PageMapXML(k8proc)
        outpm = os.path.join(files.k8oebps,'page-map.xml')
        with open(pathof(outpm),'wb') as f:
            f.write(pagemapxml.encode('utf-8'))
        if DUMP:
            print(pagemapproc.getNames())
            print(pagemapproc.getOffsets())
            print("\n\nPage Map")
            print(pagemapxml)

    # process the toc ncx
    # ncx map keys: name, pos, len, noffs, text, hlvl, kind, pos_fid, parent, child1, childn, num
    print("Processing ncx / toc")
    ncx = ncxExtract(mh, files)
    ncx_data = ncx.parseNCX()
    # extend the ncx data with filenames and proper internal idtags
    for i in range(len(ncx_data)):
        ncxmap = ncx_data[i]
        [junk1, junk2, junk3, fid, junk4, off] = ncxmap['pos_fid'].split(':')
        filename, idtag = k8proc.getIDTagByPosFid(fid, off)
        ncxmap['filename'] = filename
        ncxmap['idtag'] = unicode_str(idtag)
        ncx_data[i] = ncxmap

    # convert the rawML to a set of xhtml files
    print("Building an epub-like structure")
    htmlproc = XHTMLK8Processor(rscnames, k8proc)
    usedmap = htmlproc.buildXHTML()

    # write out the xhtml svg, and css files
    # fileinfo = [skelid|coverpage, dir, name]
    fileinfo = []
    # first create a cover page if none exists
    if CREATE_COVER_PAGE:
        cover = CoverProcessor(files, metadata, rscnames)
        cover_img = utf8_str(cover.getImageName())
        need_to_create_cover_page = False
        if cover_img is not None:
            if k8resc is None or not k8resc.hasSpine():
                part = k8proc.getPart(0)
                if part.find(cover_img) == -1:
                    need_to_create_cover_page = True
            else:
                if "coverpage" not in k8resc.spine_idrefs:
                    part = k8proc.getPart(int(k8resc.spine_order[0]))
                    if part.find(cover_img) == -1:
                        k8resc.prepend_to_spine("coverpage", "inserted", "no", None)
                if k8resc.spine_order[0] == "coverpage":
                    need_to_create_cover_page = True
            if need_to_create_cover_page:
                filename = cover.getXHTMLName()
                fileinfo.append(["coverpage", 'Text', filename])
                guidetext += cover.guide_toxml()
                cover.writeXHTML()

    n =  k8proc.getNumberOfParts()
    for i in range(n):
        part = k8proc.getPart(i)
        [skelnum, dir, filename, beg, end, aidtext] = k8proc.getPartInfo(i)
        fileinfo.append([str(skelnum), dir, filename])
        fname = os.path.join(files.k8oebps,dir,filename)
        with open(pathof(fname),'wb') as f:
            f.write(part)
    n = k8proc.getNumberOfFlows()
    for i in range(1, n):
        [ptype, pformat, pdir, filename] = k8proc.getFlowInfo(i)
        flowpart = k8proc.getFlow(i)
        if pformat == b'file':
            fileinfo.append([None, pdir, filename])
            fname = os.path.join(files.k8oebps,pdir,filename)
            with open(pathof(fname),'wb') as f:
                f.write(flowpart)

    # create the opf
    opf = OPFProcessor(files, metadata.copy(), fileinfo, rscnames, True, mh, usedmap,
                       pagemapxml=pagemapxml, guidetext=guidetext, k8resc=k8resc, epubver=epubver)
    uuid = opf.writeOPF(bool(obfuscate_data))

    if opf.hasNCX():
        # Create a toc.ncx.
        ncx.writeK8NCX(ncx_data, metadata)
    if opf.hasNAV():
        # Create a navigation document.
        nav = NAVProcessor(files)
        nav.writeNAV(ncx_data, guidetext, metadata)

    # make an epub-like structure of it all
    print("Creating an epub-like file")
    files.makeEPUB(usedmap, obfuscate_data, uuid)


def processMobi7(mh, metadata, sect, files, rscnames):
    global DUMP
    global WRITE_RAW_DATA
    # An original Mobi
    rawML = mh.getRawML()
    if DUMP or WRITE_RAW_DATA:
        outraw = os.path.join(files.mobi7dir,files.getInputFileBasename() + '.rawml')
        with open(pathof(outraw),'wb') as f:
            f.write(rawML)

    # process the toc ncx
    # ncx map keys: name, pos, len, noffs, text, hlvl, kind, pos_fid, parent, child1, childn, num
    ncx = ncxExtract(mh, files)
    ncx_data = ncx.parseNCX()
    ncx.writeNCX(metadata)

    positionMap = {}

    # if Dictionary build up the positionMap
    if mh.isDictionary():
        if mh.DictInLanguage():
            metadata['DictInLanguage'] = [mh.DictInLanguage()]
        if mh.DictOutLanguage():
            metadata['DictOutLanguage'] = [mh.DictOutLanguage()]
        positionMap = dictSupport(mh, sect).getPositionMap()

    # convert the rawml back to Mobi ml
    proc = HTMLProcessor(files, metadata, rscnames)
    srctext = proc.findAnchors(rawML, ncx_data, positionMap)
    srctext, usedmap = proc.insertHREFS()

    # write the proper mobi html
    fileinfo=[]
    # fname = files.getInputFileBasename() + '.html'
    fname = 'book.html'
    fileinfo.append([None,'', fname])
    outhtml = os.path.join(files.mobi7dir, fname)
    with open(pathof(outhtml), 'wb') as f:
        f.write(srctext)

    # extract guidetext from srctext
    guidetext =b''
    # no pagemap support for older mobis
    # pagemapxml = None
    guidematch = re.search(br'''<guide>(.*)</guide>''',srctext,re.IGNORECASE+re.DOTALL)
    if guidematch:
        guidetext = guidematch.group(1)
        # sometimes old mobi guide from srctext horribly written so need to clean up
        guidetext = guidetext.replace(b"\r", b"")
        guidetext = guidetext.replace(b'<REFERENCE', b'<reference')
        guidetext = guidetext.replace(b' HREF=', b' href=')
        guidetext = guidetext.replace(b' TITLE=', b' title=')
        guidetext = guidetext.replace(b' TYPE=', b' type=')
        # reference must be a self-closing tag
        # and any href must be replaced with filepos information
        ref_tag_pattern = re.compile(br'''(<reference [^>]*>)''', re.IGNORECASE)
        guidepieces = ref_tag_pattern.split(guidetext)
        for i in range(1,len(guidepieces), 2):
            reftag = guidepieces[i]
            # remove any href there now to replace with filepos
            reftag = re.sub(br'''href\s*=[^'"]*['"][^'"]*['"]''',b'', reftag)
            # make sure the reference tag ends properly
            if not reftag.endswith(b"/>"):
                reftag = reftag[0:-1] + b"/>"
                guidepieces[i] = reftag
        guidetext = b''.join(guidepieces)
        replacetext = br'''href="'''+utf8_str(fileinfo[0][2])+ br'''#filepos\1"'''
        guidetext = re.sub(br'''filepos=['"]{0,1}0*(\d+)['"]{0,1}''', replacetext, guidetext)
        guidetext += b'\n'

    if 'StartOffset' in metadata:
        for value in metadata['StartOffset']:
            if int(value) == 0xffffffff:
                value = '0'
            starting_offset = value
        # get guide items from metadata
        metaguidetext = b'<reference type="text" href="'+utf8_str(fileinfo[0][2])+b'#filepos'+utf8_str(starting_offset)+b'" />\n'
        guidetext += metaguidetext

    if isinstance(guidetext, binary_type):
        guidetext = guidetext.decode(mh.codec)

    # create an OPF
    opf = OPFProcessor(files, metadata, fileinfo, rscnames, ncx.isNCX, mh, usedmap, guidetext=guidetext)
    opf.writeOPF()


def processUnknownSections(mh, sect, files, K8Boundary):
    global DUMP
    global TERMINATION_INDICATOR1
    global TERMINATION_INDICATOR2
    global TERMINATION_INDICATOR3
    if DUMP:
        print("Unpacking any remaining unknown records")
    beg = mh.start
    end = sect.num_sections
    if beg < K8Boundary:
        # then we're processing the first part of a combination file
        end = K8Boundary
    for i in range(beg, end):
        if sect.sectiondescriptions[i] == "":
            data = sect.loadSection(i)
            type = data[0:4]
            if type == TERMINATION_INDICATOR3:
                description = "Termination Marker 3 Nulls"
            elif type == TERMINATION_INDICATOR2:
                description = "Termination Marker 2 Nulls"
            elif type == TERMINATION_INDICATOR1:
                description = "Termination Marker 1 Null"
            elif type == "INDX":
                fname = "Unknown%05d_INDX.dat" % i
                description = "Unknown INDX section"
                if DUMP:
                    outname= os.path.join(files.outdir, fname)
                    with open(pathof(outname), 'wb') as f:
                        f.write(data)
                    print("Extracting %s: %s from section %d" % (description, fname, i))
                    description = description + ", extracting as %s" % fname
            else:
                fname = "unknown%05d.dat" % i
                description = "Mysterious Section, first four bytes %s" % describe(data[0:4])
                if DUMP:
                    outname= os.path.join(files.outdir, fname)
                    with open(pathof(outname), 'wb') as f:
                        f.write(data)
                    print("Extracting %s: %s from section %d" % (description, fname, i))
                    description = description + ", extracting as %s" % fname
            sect.setsectiondescription(i, description)


def process_all_mobi_headers(files, apnxfile, sect, mhlst, K8Boundary, k8only=False, epubver='2', use_hd=False):
    global DUMP
    global WRITE_RAW_DATA
    rscnames = []
    rsc_ptr = -1
    k8resc = None
    obfuscate_data = []
    for mh in mhlst:
        pagemapproc = None
        if mh.isK8():
            sect.setsectiondescription(mh.start,"KF8 Header")
            mhname = os.path.join(files.outdir,"header_K8.dat")
            print("Processing K8 section of book...")
        elif mh.isPrintReplica():
            sect.setsectiondescription(mh.start,"Print Replica Header")
            mhname = os.path.join(files.outdir,"header_PR.dat")
            print("Processing PrintReplica section of book...")
        else:
            if mh.version == 0:
                sect.setsectiondescription(mh.start, "PalmDoc Header".format(mh.version))
            else:
                sect.setsectiondescription(mh.start,"Mobipocket {0:d} Header".format(mh.version))
            mhname = os.path.join(files.outdir,"header.dat")
            print("Processing Mobipocket {0:d} section of book...".format(mh.version))

        if DUMP:
            # write out raw mobi header data
            with open(pathof(mhname), 'wb') as f:
                f.write(mh.header)

        # process each mobi header
        metadata = mh.getMetaData()
        mh.describeHeader(DUMP)
        if mh.isEncrypted():
            raise unpackException('Book is encrypted')

        pagemapproc = None

        # first handle all of the different resource sections:  images, resources, fonts, and etc
        # build up a list of image names to use to postprocess the ebook

        print("Unpacking images, resources, fonts, etc")
        beg = mh.firstresource
        end = sect.num_sections
        if beg < K8Boundary:
            # processing first part of a combination file
            end = K8Boundary

        cover_offset = int(metadata.get('CoverOffset', ['-1'])[0])
        if not CREATE_COVER_PAGE:
            cover_offset = None

        for i in range(beg, end):
            data = sect.loadSection(i)
            type = data[0:4]

            # handle the basics first
            if type in [b"FLIS", b"FCIS", b"FDST", b"DATP"]:
                if DUMP:
                    fname = unicode_str(type) + "%05d" % i
                    if mh.isK8():
                        fname += "_K8"
                    fname += '.dat'
                    outname= os.path.join(files.outdir, fname)
                    with open(pathof(outname), 'wb') as f:
                        f.write(data)
                    print("Dumping section {0:d} type {1:s} to file {2:s} ".format(i,unicode_str(type),outname))
                sect.setsectiondescription(i,"Type {0:s}".format(unicode_str(type)))
                rscnames.append(None)
            elif type == b"SRCS":
                rscnames = processSRCS(i, files, rscnames, sect, data)
            elif type == b"PAGE":
                rscnames, pagemapproc = processPAGE(i, files, rscnames, sect, data, mh, pagemapproc)
            elif type == b"CMET":
                rscnames = processCMET(i, files, rscnames, sect, data)
            elif type == b"FONT":
                rscnames, obfuscate_data, rsc_ptr = processFONT(i, files, rscnames, sect, data, obfuscate_data, beg, rsc_ptr)
            elif type == b"CRES":
                rscnames, rsc_ptr = processCRES(i, files, rscnames, sect, data, beg, rsc_ptr, use_hd)
            elif type == b"CONT":
                rscnames = processCONT(i, files, rscnames, sect, data)
            elif type == b"kind":
                rscnames = processkind(i, files, rscnames, sect, data)
            elif type == b'\xa0\xa0\xa0\xa0':
                sect.setsectiondescription(i,"Empty_HD_Image/Resource_Placeholder")
                rscnames.append(None)
                rsc_ptr += 1
            elif type == b"RESC":
                rscnames, k8resc = processRESC(i, files, rscnames, sect, data, k8resc)
            elif data == EOF_RECORD:
                sect.setsectiondescription(i,"End Of File")
                rscnames.append(None)
            elif data[0:8] == b"BOUNDARY":
                sect.setsectiondescription(i,"BOUNDARY Marker")
                rscnames.append(None)
            else:
                # if reached here should be an image ow treat as unknown
                rscnames, rsc_ptr  = processImage(i, files, rscnames, sect, data, beg, rsc_ptr, cover_offset)
        # done unpacking resources

        # Print Replica
        if mh.isPrintReplica() and not k8only:
            processPrintReplica(metadata, files, rscnames, mh)
            continue

        # KF8 (Mobi 8)
        if mh.isK8():
            processMobi8(mh, metadata, sect, files, rscnames, pagemapproc, k8resc, obfuscate_data, apnxfile, epubver)

        # Old Mobi (Mobi 7)
        elif not k8only:
            processMobi7(mh, metadata, sect, files, rscnames)

        # process any remaining unknown sections of the palm file
        processUnknownSections(mh, sect, files, K8Boundary)

    return


def unpackBook(infile, outdir, apnxfile=None, epubver='2', use_hd=False, dodump=False, dowriteraw=False, dosplitcombos=False):
    global DUMP
    global WRITE_RAW_DATA
    global SPLIT_COMBO_MOBIS
    if DUMP or dodump:
        DUMP = True
    if WRITE_RAW_DATA or dowriteraw:
        WRITE_RAW_DATA = True
    if SPLIT_COMBO_MOBIS or dosplitcombos:
        SPLIT_COMBO_MOBIS = True

    infile = unicode_str(infile)
    outdir = unicode_str(outdir)
    if apnxfile is not None:
        apnxfile = unicode_str(apnxfile)

    files = fileNames(infile, outdir)

    # process the PalmDoc database header and verify it is a mobi
    sect = Sectionizer(infile)
    if sect.ident != b'BOOKMOBI' and sect.ident != b'TEXtREAd':
        raise unpackException('Invalid file format')
    if DUMP:
        sect.dumppalmheader()
    else:
        print("Palm DB type: %s, %d sections." % (sect.ident.decode('utf-8'),sect.num_sections))

    # scan sections to see if this is a compound mobi file (K8 format)
    # and build a list of all mobi headers to process.
    mhlst = []
    mh = MobiHeader(sect,0)
    # if this is a mobi8-only file hasK8 here will be true
    mhlst.append(mh)
    K8Boundary = -1

    if mh.isK8():
        print("Unpacking a KF8 book...")
        hasK8 = True
    else:
        # This is either a Mobipocket 7 or earlier, or a combi M7/KF8
        # Find out which
        hasK8 = False
        for i in range(len(sect.sectionoffsets)-1):
            before, after = sect.sectionoffsets[i:i+2]
            if (after - before) == 8:
                data = sect.loadSection(i)
                if data == K8_BOUNDARY:
                    sect.setsectiondescription(i,"Mobi/KF8 Boundary Section")
                    mh = MobiHeader(sect,i+1)
                    hasK8 = True
                    mhlst.append(mh)
                    K8Boundary = i
                    break
        if hasK8:
            print("Unpacking a Combination M{0:d}/KF8 book...".format(mh.version))
            if SPLIT_COMBO_MOBIS:
                # if this is a combination mobi7-mobi8 file split them up
                mobisplit = mobi_split(infile)
                if mobisplit.combo:
                    outmobi7 = os.path.join(files.outdir, 'mobi7-'+files.getInputFileBasename() + '.mobi')
                    outmobi8 = os.path.join(files.outdir, 'mobi8-'+files.getInputFileBasename() + '.azw3')
                    with open(pathof(outmobi7), 'wb') as f:
                        f.write(mobisplit.getResult7())
                    with open(pathof(outmobi8), 'wb') as f:
                        f.write(mobisplit.getResult8())
        else:
            print("Unpacking a Mobipocket {0:d} book...".format(mh.version))

    if hasK8:
        files.makeK8Struct()

    process_all_mobi_headers(files, apnxfile, sect, mhlst, K8Boundary, False, epubver, use_hd)

    if DUMP:
        sect.dumpsectionsinfo()
    return


def usage(progname):
    print("")
    print("Description:")
    print("  Unpacks an unencrypted Kindle/MobiPocket ebook to html and images")
    print("  or an unencrypted Kindle/Print Replica ebook to PDF and images")
    print("  into the specified output folder.")
    print("Usage:")
    print("  %s -r -s -p apnxfile -d -h --epub_version= infile [outdir]" % progname)
    print("Options:")
    print("    -h                 print this help message")
    print("    -i                 use HD Images, if present, to overwrite reduced resolution images")
    print("    -s                 split combination mobis into mobi7 and mobi8 ebooks")
    print("    -p APNXFILE        path to an .apnx file associated with the azw3 input (optional)")
    print("    --epub_version=    specify epub version to unpack to: 2, 3, A (for automatic) or ")
    print("                         F (force to fit to epub2 definitions), default is 2")
    print("    -d                 dump headers and other info to output and extra files")
    print("    -r                 write raw data to the output folder")


def main(argv=unicode_argv()):
    global DUMP
    global WRITE_RAW_DATA
    global SPLIT_COMBO_MOBIS

    print("KindleUnpack v0.82")
    print("   Based on initial mobipocket version Copyright © 2009 Charles M. Hannum <root@ihack.net>")
    print("   Extensive Extensions and Improvements Copyright © 2009-2014 ")
    print("       by:  P. Durrant, K. Hendricks, S. Siebert, fandrieu, DiapDealer, nickredding, tkeo.")
    print("   This program is free software: you can redistribute it and/or modify")
    print("   it under the terms of the GNU General Public License as published by")
    print("   the Free Software Foundation, version 3.")

    progname = os.path.basename(argv[0])
    try:
        opts, args = getopt.getopt(argv[1:], "dhirsp:", ['epub_version='])
    except getopt.GetoptError as err:
        print(str(err))
        usage(progname)
        sys.exit(2)

    if len(args)<1:
        usage(progname)
        sys.exit(2)

    apnxfile = None
    epubver = '2'
    use_hd = False

    for o, a in opts:
        if o == "-h":
            usage(progname)
            sys.exit(0)
        if o == "-i":
            use_hd = True
        if o == "-d":
            DUMP = True
        if o == "-r":
            WRITE_RAW_DATA = True
        if o == "-s":
            SPLIT_COMBO_MOBIS = True
        if o == "-p":
            apnxfile = a
        if o == "--epub_version":
            epubver = a

    if len(args) > 1:
        infile, outdir = args
    else:
        infile = args[0]
        outdir = os.path.splitext(infile)[0]

    infileext = os.path.splitext(infile)[1].upper()
    if infileext not in ['.MOBI', '.PRC', '.AZW', '.AZW3', '.AZW4']:
        print("Error: first parameter must be a Kindle/Mobipocket ebook or a Kindle/Print Replica ebook.")
        return 1

    try:
        print('Unpacking Book...')
        unpackBook(infile, outdir, apnxfile, epubver, use_hd)
        print('Completed')

    except ValueError as e:
        print("Error: %s" % e)
        print(traceback.format_exc())
        return 1

    return 0


if __name__ == '__main__':
    sys.exit(main())
