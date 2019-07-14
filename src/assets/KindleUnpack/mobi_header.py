#!/usr/bin/env python
# -*- coding: utf-8 -*-
# vim:ts=4:sw=4:softtabstop=4:smarttab:expandtab

from __future__ import unicode_literals, division, absolute_import, print_function

DEBUG_USE_ORDERED_DICTIONARY = False  # OrderedDict is supoorted >= python 2.7.
""" set to True to use OrderedDict for MobiHeader.metadata."""

if DEBUG_USE_ORDERED_DICTIONARY:
    from collections import OrderedDict as dict_
else:
    dict_ = dict

from .compatibility_utils import PY2, unicode_str, hexlify, bord

if PY2:
    range = xrange

import struct
import uuid

# import the mobiunpack support libraries
from .mobi_utils import getLanguage
from .mobi_uncompress import HuffcdicReader, PalmdocReader, UncompressedReader

class unpackException(Exception):
    pass


def sortedHeaderKeys(mheader):
    hdrkeys = sorted(list(mheader.keys()), key=lambda akey: mheader[akey][0])
    return hdrkeys


# HD Containers have their own headers and their own EXTH
# this is just guesswork so far, making big assumption that
# metavalue key numbers remain the same in the CONT EXTH

# Note:  The layout of the CONT Header is still unknown
# so just deal with their EXTH sections for now

def dump_contexth(cpage, extheader):
    # determine text encoding
    codec = 'windows-1252'
    codec_map = {
         1252 : 'windows-1252',
         65001: 'utf-8',
    }
    if cpage in codec_map:
        codec = codec_map[cpage]
    if extheader == b'':
        return
    id_map_strings = {
        1 : 'Drm Server Id',
        2 : 'Drm Commerce Id',
        3 : 'Drm Ebookbase Book Id',
        4 : 'Drm Ebookbase Dep Id',
        100 : 'Creator',
        101 : 'Publisher',
        102 : 'Imprint',
        103 : 'Description',
        104 : 'ISBN',
        105 : 'Subject',
        106 : 'Published',
        107 : 'Review',
        108 : 'Contributor',
        109 : 'Rights',
        110 : 'SubjectCode',
        111 : 'Type',
        112 : 'Source',
        113 : 'ASIN',
        114 : 'versionNumber',
        117 : 'Adult',
        118 : 'Retail-Price',
        119 : 'Retail-Currency',
        120 : 'TSC',
        122 : 'fixed-layout',
        123 : 'book-type',
        124 : 'orientation-lock',
        126 : 'original-resolution',
        127 : 'zero-gutter',
        128 : 'zero-margin',
        129 : 'MetadataResourceURI',
        132 : 'RegionMagnification',
        150 : 'LendingEnabled',
        200 : 'DictShortName',
        501 : 'cdeType',
        502 : 'last_update_time',
        503 : 'Updated_Title',
        504 : 'CDEContentKey',
        505 : 'AmazonContentReference',
        506 : 'Title-Language',
        507 : 'Title-Display-Direction',
        508 : 'Title-Pronunciation',
        509 : 'Title-Collation',
        510 : 'Secondary-Title',
        511 : 'Secondary-Title-Language',
        512 : 'Secondary-Title-Direction',
        513 : 'Secondary-Title-Pronunciation',
        514 : 'Secondary-Title-Collation',
        515 : 'Author-Language',
        516 : 'Author-Display-Direction',
        517 : 'Author-Pronunciation',
        518 : 'Author-Collation',
        519 : 'Author-Type',
        520 : 'Publisher-Language',
        521 : 'Publisher-Display-Direction',
        522 : 'Publisher-Pronunciation',
        523 : 'Publisher-Collation',
        524 : 'Content-Language-Tag',
        525 : 'primary-writing-mode',
        526 : 'NCX-Ingested-By-Software',
        527 : 'page-progression-direction',
        528 : 'override-kindle-fonts',
        529 : 'Compression-Upgraded',
        530 : 'Soft-Hyphens-In-Content',
        531 : 'Dictionary_In_Langague',
        532 : 'Dictionary_Out_Language',
        533 : 'Font_Converted',
        534 : 'Amazon_Creator_Info',
        535 : 'Creator-Build-Tag',
        536 : 'HD-Media-Containers-Info',  # CONT_Header is 0, Ends with CONTAINER_BOUNDARY (or Asset_Type?)
        538 : 'Resource-Container-Fidelity',
        539 : 'HD-Container-Mimetype',
        540 : 'Sample-For_Special-Purpose',
        541 : 'Kindletool-Operation-Information',
        542 : 'Container_Id',
        543 : 'Asset-Type',  # FONT_CONTAINER, BW_CONTAINER, HD_CONTAINER
        544 : 'Unknown_544',
    }
    id_map_values = {
        115 : 'sample',
        116 : 'StartOffset',
        121 : 'Mobi8-Boundary-Section',
        125 : 'Embedded-Record-Count',
        130 : 'Offline-Sample',
        131 : 'Metadata-Record-Offset',
        201 : 'CoverOffset',
        202 : 'ThumbOffset',
        203 : 'HasFakeCover',
        204 : 'Creator-Software',
        205 : 'Creator-Major-Version',
        206 : 'Creator-Minor-Version',
        207 : 'Creator-Build-Number',
        401 : 'Clipping-Limit',
        402 : 'Publisher-Limit',
        404 : 'Text-to-Speech-Disabled',
        406 : 'Rental-Expiration-Time',
    }
    id_map_hexstrings = {
        208 : 'Watermark_(hex)',
        209 : 'Tamper-Proof-Keys_(hex)',
        300 : 'Font-Signature_(hex)',
        403 : 'Unknown_(403)_(hex)',
        405 : 'Ownership-Type_(hex)',
        407 : 'Unknown_(407)_(hex)',
        420 : 'Multimedia-Content-Reference_(hex)',
        450 : 'Locations_Match_(hex)',
        451 : 'Full-Story-Length_(hex)',
        452 : 'Sample-Start_Location_(hex)',
        453 : 'Sample-End-Location_(hex)',
    }
    _length, num_items = struct.unpack(b'>LL', extheader[4:12])
    extheader = extheader[12:]
    pos = 0
    for _ in range(num_items):
        id, size = struct.unpack(b'>LL', extheader[pos:pos+8])
        content = extheader[pos + 8: pos + size]
        if id in id_map_strings:
            name = id_map_strings[id]
            print('\n    Key: "%s"\n        Value: "%s"' % (name, content.decode(codec, errors='replace')))
        elif id in id_map_values:
            name = id_map_values[id]
            if size == 9:
                value, = struct.unpack(b'B',content)
                print('\n    Key: "%s"\n        Value: 0x%01x' % (name, value))
            elif size == 10:
                value, = struct.unpack(b'>H',content)
                print('\n    Key: "%s"\n        Value: 0x%02x' % (name, value))
            elif size == 12:
                value, = struct.unpack(b'>L',content)
                print('\n    Key: "%s"\n        Value: 0x%04x' % (name, value))
            else:
                print("\nError: Value for %s has unexpected size of %s" % (name, size))
        elif id in id_map_hexstrings:
            name = id_map_hexstrings[id]
            print('\n    Key: "%s"\n        Value: 0x%s' % (name, hexlify(content)))
        else:
            print("\nWarning: Unknown metadata with id %s found" % id)
            name = str(id) + ' (hex)'
            print('    Key: "%s"\n        Value: 0x%s' % (name, hexlify(content)))
        pos += size
    return


class MobiHeader:
    # all values are packed in big endian format
    palmdoc_header = {
            'compression_type'  : (0x00, b'>H', 2),
            'fill0'             : (0x02, b'>H', 2),
            'text_length'       : (0x04, b'>L', 4),
            'text_records'      : (0x08, b'>H', 2),
            'max_section_size'  : (0x0a, b'>H', 2),
            'read_pos   '       : (0x0c, b'>L', 4),
    }

    mobi6_header = {
            'compression_type'  : (0x00, b'>H', 2),
            'fill0'             : (0x02, b'>H', 2),
            'text_length'       : (0x04, b'>L', 4),
            'text_records'      : (0x08, b'>H', 2),
            'max_section_size'  : (0x0a, b'>H', 2),
            'crypto_type'       : (0x0c, b'>H', 2),
            'fill1'             : (0x0e, b'>H', 2),
            'magic'             : (0x10, b'4s', 4),
            'header_length (from MOBI)'     : (0x14, b'>L', 4),
            'type'              : (0x18, b'>L', 4),
            'codepage'          : (0x1c, b'>L', 4),
            'unique_id'         : (0x20, b'>L', 4),
            'version'           : (0x24, b'>L', 4),
            'metaorthindex'     : (0x28, b'>L', 4),
            'metainflindex'     : (0x2c, b'>L', 4),
            'index_names'       : (0x30, b'>L', 4),
            'index_keys'        : (0x34, b'>L', 4),
            'extra_index0'      : (0x38, b'>L', 4),
            'extra_index1'      : (0x3c, b'>L', 4),
            'extra_index2'      : (0x40, b'>L', 4),
            'extra_index3'      : (0x44, b'>L', 4),
            'extra_index4'      : (0x48, b'>L', 4),
            'extra_index5'      : (0x4c, b'>L', 4),
            'first_nontext'     : (0x50, b'>L', 4),
            'title_offset'      : (0x54, b'>L', 4),
            'title_length'      : (0x58, b'>L', 4),
            'language_code'     : (0x5c, b'>L', 4),
            'dict_in_lang'      : (0x60, b'>L', 4),
            'dict_out_lang'     : (0x64, b'>L', 4),
            'min_version'       : (0x68, b'>L', 4),
            'first_resc_offset' : (0x6c, b'>L', 4),
            'huff_offset'       : (0x70, b'>L', 4),
            'huff_num'          : (0x74, b'>L', 4),
            'huff_tbl_offset'   : (0x78, b'>L', 4),
            'huff_tbl_len'      : (0x7c, b'>L', 4),
            'exth_flags'        : (0x80, b'>L', 4),
            'fill3_a'           : (0x84, b'>L', 4),
            'fill3_b'           : (0x88, b'>L', 4),
            'fill3_c'           : (0x8c, b'>L', 4),
            'fill3_d'           : (0x90, b'>L', 4),
            'fill3_e'           : (0x94, b'>L', 4),
            'fill3_f'           : (0x98, b'>L', 4),
            'fill3_g'           : (0x9c, b'>L', 4),
            'fill3_h'           : (0xa0, b'>L', 4),
            'unknown0'          : (0xa4, b'>L', 4),
            'drm_offset'        : (0xa8, b'>L', 4),
            'drm_count'         : (0xac, b'>L', 4),
            'drm_size'          : (0xb0, b'>L', 4),
            'drm_flags'         : (0xb4, b'>L', 4),
            'fill4_a'           : (0xb8, b'>L', 4),
            'fill4_b'           : (0xbc, b'>L', 4),
            'first_content'     : (0xc0, b'>H', 2),
            'last_content'      : (0xc2, b'>H', 2),
            'unknown0'          : (0xc4, b'>L', 4),
            'fcis_offset'       : (0xc8, b'>L', 4),
            'fcis_count'        : (0xcc, b'>L', 4),
            'flis_offset'       : (0xd0, b'>L', 4),
            'flis_count'        : (0xd4, b'>L', 4),
            'unknown1'          : (0xd8, b'>L', 4),
            'unknown2'          : (0xdc, b'>L', 4),
            'srcs_offset'       : (0xe0, b'>L', 4),
            'srcs_count'        : (0xe4, b'>L', 4),
            'unknown3'          : (0xe8, b'>L', 4),
            'unknown4'          : (0xec, b'>L', 4),
            'fill5'             : (0xf0, b'>H', 2),
            'traildata_flags'   : (0xf2, b'>H', 2),
            'ncx_index'         : (0xf4, b'>L', 4),
            'unknown5'          : (0xf8, b'>L', 4),
            'unknown6'          : (0xfc, b'>L', 4),
            'datp_offset'       : (0x100, b'>L', 4),
            'unknown7'          : (0x104, b'>L', 4),
            'Unknown    '       : (0x108, b'>L', 4),
            'Unknown    '       : (0x10C, b'>L', 4),
            'Unknown    '       : (0x110, b'>L', 4),
            'Unknown    '       : (0x114, b'>L', 4),
            'Unknown    '       : (0x118, b'>L', 4),
            'Unknown    '       : (0x11C, b'>L', 4),
            'Unknown    '       : (0x120, b'>L', 4),
            'Unknown    '       : (0x124, b'>L', 4),
            'Unknown    '       : (0x128, b'>L', 4),
            'Unknown    '       : (0x12C, b'>L', 4),
            'Unknown    '       : (0x130, b'>L', 4),
            'Unknown    '       : (0x134, b'>L', 4),
            'Unknown    '       : (0x138, b'>L', 4),
            'Unknown    '       : (0x11C, b'>L', 4),
            }

    mobi8_header = {
            'compression_type'  : (0x00, b'>H', 2),
            'fill0'             : (0x02, b'>H', 2),
            'text_length'       : (0x04, b'>L', 4),
            'text_records'      : (0x08, b'>H', 2),
            'max_section_size'  : (0x0a, b'>H', 2),
            'crypto_type'       : (0x0c, b'>H', 2),
            'fill1'             : (0x0e, b'>H', 2),
            'magic'             : (0x10, b'4s', 4),
            'header_length (from MOBI)'     : (0x14, b'>L', 4),
            'type'              : (0x18, b'>L', 4),
            'codepage'          : (0x1c, b'>L', 4),
            'unique_id'         : (0x20, b'>L', 4),
            'version'           : (0x24, b'>L', 4),
            'metaorthindex'     : (0x28, b'>L', 4),
            'metainflindex'     : (0x2c, b'>L', 4),
            'index_names'       : (0x30, b'>L', 4),
            'index_keys'        : (0x34, b'>L', 4),
            'extra_index0'      : (0x38, b'>L', 4),
            'extra_index1'      : (0x3c, b'>L', 4),
            'extra_index2'      : (0x40, b'>L', 4),
            'extra_index3'      : (0x44, b'>L', 4),
            'extra_index4'      : (0x48, b'>L', 4),
            'extra_index5'      : (0x4c, b'>L', 4),
            'first_nontext'     : (0x50, b'>L', 4),
            'title_offset'      : (0x54, b'>L', 4),
            'title_length'      : (0x58, b'>L', 4),
            'language_code'     : (0x5c, b'>L', 4),
            'dict_in_lang'      : (0x60, b'>L', 4),
            'dict_out_lang'     : (0x64, b'>L', 4),
            'min_version'       : (0x68, b'>L', 4),
            'first_resc_offset' : (0x6c, b'>L', 4),
            'huff_offset'       : (0x70, b'>L', 4),
            'huff_num'          : (0x74, b'>L', 4),
            'huff_tbl_offset'   : (0x78, b'>L', 4),
            'huff_tbl_len'      : (0x7c, b'>L', 4),
            'exth_flags'        : (0x80, b'>L', 4),
            'fill3_a'           : (0x84, b'>L', 4),
            'fill3_b'           : (0x88, b'>L', 4),
            'fill3_c'           : (0x8c, b'>L', 4),
            'fill3_d'           : (0x90, b'>L', 4),
            'fill3_e'           : (0x94, b'>L', 4),
            'fill3_f'           : (0x98, b'>L', 4),
            'fill3_g'           : (0x9c, b'>L', 4),
            'fill3_h'           : (0xa0, b'>L', 4),
            'unknown0'          : (0xa4, b'>L', 4),
            'drm_offset'        : (0xa8, b'>L', 4),
            'drm_count'         : (0xac, b'>L', 4),
            'drm_size'          : (0xb0, b'>L', 4),
            'drm_flags'         : (0xb4, b'>L', 4),
            'fill4_a'           : (0xb8, b'>L', 4),
            'fill4_b'           : (0xbc, b'>L', 4),
            'fdst_offset'       : (0xc0, b'>L', 4),
            'fdst_flow_count'   : (0xc4, b'>L', 4),
            'fcis_offset'       : (0xc8, b'>L', 4),
            'fcis_count'        : (0xcc, b'>L', 4),
            'flis_offset'       : (0xd0, b'>L', 4),
            'flis_count'        : (0xd4, b'>L', 4),
            'unknown1'          : (0xd8, b'>L', 4),
            'unknown2'          : (0xdc, b'>L', 4),
            'srcs_offset'       : (0xe0, b'>L', 4),
            'srcs_count'        : (0xe4, b'>L', 4),
            'unknown3'          : (0xe8, b'>L', 4),
            'unknown4'          : (0xec, b'>L', 4),
            'fill5'             : (0xf0, b'>H', 2),
            'traildata_flags'   : (0xf2, b'>H', 2),
            'ncx_index'         : (0xf4, b'>L', 4),
            'fragment_index'    : (0xf8, b'>L', 4),
            'skeleton_index'    : (0xfc, b'>L', 4),
            'datp_offset'       : (0x100, b'>L', 4),
            'guide_index'       : (0x104, b'>L', 4),
            'Unknown    '       : (0x108, b'>L', 4),
            'Unknown    '       : (0x10C, b'>L', 4),
            'Unknown    '       : (0x110, b'>L', 4),
            'Unknown    '       : (0x114, b'>L', 4),
            'Unknown    '       : (0x118, b'>L', 4),
            'Unknown    '       : (0x11C, b'>L', 4),
            'Unknown    '       : (0x120, b'>L', 4),
            'Unknown    '       : (0x124, b'>L', 4),
            'Unknown    '       : (0x128, b'>L', 4),
            'Unknown    '       : (0x12C, b'>L', 4),
            'Unknown    '       : (0x130, b'>L', 4),
            'Unknown    '       : (0x134, b'>L', 4),
            'Unknown    '       : (0x138, b'>L', 4),
            'Unknown    '       : (0x11C, b'>L', 4),
            }

    palmdoc_header_sorted_keys = sortedHeaderKeys(palmdoc_header)
    mobi6_header_sorted_keys = sortedHeaderKeys(mobi6_header)
    mobi8_header_sorted_keys = sortedHeaderKeys(mobi8_header)

    id_map_strings = {
        1 : 'Drm Server Id',
        2 : 'Drm Commerce Id',
        3 : 'Drm Ebookbase Book Id',
        4 : 'Drm Ebookbase Dep Id',
        100 : 'Creator',
        101 : 'Publisher',
        102 : 'Imprint',
        103 : 'Description',
        104 : 'ISBN',
        105 : 'Subject',
        106 : 'Published',
        107 : 'Review',
        108 : 'Contributor',
        109 : 'Rights',
        110 : 'SubjectCode',
        111 : 'Type',
        112 : 'Source',
        113 : 'ASIN',
        114 : 'versionNumber',
        117 : 'Adult',
        118 : 'Retail-Price',
        119 : 'Retail-Currency',
        120 : 'TSC',
        122 : 'fixed-layout',
        123 : 'book-type',
        124 : 'orientation-lock',
        126 : 'original-resolution',
        127 : 'zero-gutter',
        128 : 'zero-margin',
        129 : 'MetadataResourceURI',
        132 : 'RegionMagnification',
        150 : 'LendingEnabled',
        200 : 'DictShortName',
        501 : 'cdeType',
        502 : 'last_update_time',
        503 : 'Updated_Title',
        504 : 'CDEContentKey',
        505 : 'AmazonContentReference',
        506 : 'Title-Language',
        507 : 'Title-Display-Direction',
        508 : 'Title-Pronunciation',
        509 : 'Title-Collation',
        510 : 'Secondary-Title',
        511 : 'Secondary-Title-Language',
        512 : 'Secondary-Title-Direction',
        513 : 'Secondary-Title-Pronunciation',
        514 : 'Secondary-Title-Collation',
        515 : 'Author-Language',
        516 : 'Author-Display-Direction',
        517 : 'Author-Pronunciation',
        518 : 'Author-Collation',
        519 : 'Author-Type',
        520 : 'Publisher-Language',
        521 : 'Publisher-Display-Direction',
        522 : 'Publisher-Pronunciation',
        523 : 'Publisher-Collation',
        524 : 'Content-Language-Tag',
        525 : 'primary-writing-mode',
        526 : 'NCX-Ingested-By-Software',
        527 : 'page-progression-direction',
        528 : 'override-kindle-fonts',
        529 : 'Compression-Upgraded',
        530 : 'Soft-Hyphens-In-Content',
        531 : 'Dictionary_In_Langague',
        532 : 'Dictionary_Out_Language',
        533 : 'Font_Converted',
        534 : 'Amazon_Creator_Info',
        535 : 'Creator-Build-Tag',
        536 : 'HD-Media-Containers-Info',  # CONT_Header is 0, Ends with CONTAINER_BOUNDARY (or Asset_Type?)
        538 : 'Resource-Container-Fidelity',
        539 : 'HD-Container-Mimetype',
        540 : 'Sample-For_Special-Purpose',
        541 : 'Kindletool-Operation-Information',
        542 : 'Container_Id',
        543 : 'Asset-Type',  # FONT_CONTAINER, BW_CONTAINER, HD_CONTAINER
        544 : 'Unknown_544',
    }
    id_map_values = {
        115 : 'sample',
        116 : 'StartOffset',
        121 : 'Mobi8-Boundary-Section',
        125 : 'Embedded-Record-Count',
        130 : 'Offline-Sample',
        131 : 'Metadata-Record-Offset',
        201 : 'CoverOffset',
        202 : 'ThumbOffset',
        203 : 'HasFakeCover',
        204 : 'Creator-Software',
        205 : 'Creator-Major-Version',
        206 : 'Creator-Minor-Version',
        207 : 'Creator-Build-Number',
        401 : 'Clipping-Limit',
        402 : 'Publisher-Limit',
        404 : 'Text-to-Speech-Disabled',
        406 : 'Rental-Expiration-Time',
    }
    id_map_hexstrings = {
        208 : 'Watermark_(hex)',
        209 : 'Tamper-Proof-Keys_(hex)',
        300 : 'Font-Signature_(hex)',
        403 : 'Unknown_(403)_(hex)',
        405 : 'Ownership-Type_(hex)',
        407 : 'Unknown_(407)_(hex)',
        420 : 'Multimedia-Content-Reference_(hex)',
        450 : 'Locations_Match_(hex)',
        451 : 'Full-Story-Length_(hex)',
        452 : 'Sample-Start_Location_(hex)',
        453 : 'Sample-End-Location_(hex)',
    }

    def __init__(self, sect, sectNumber):
        self.sect = sect
        self.start = sectNumber
        self.header = self.sect.loadSection(self.start)
        if len(self.header)>20 and self.header[16:20] == b'MOBI':
            self.sect.setsectiondescription(0,"Mobipocket Header")
            self.palm = False
        elif self.sect.ident == b'TEXtREAd':
            self.sect.setsectiondescription(0, "PalmDOC Header")
            self.palm = True
        else:
            raise unpackException('Unknown File Format')

        self.records, = struct.unpack_from(b'>H', self.header, 0x8)

        # set defaults in case this is a PalmDOC
        self.title = self.sect.palmname.decode('latin-1', errors='replace')
        self.length = len(self.header)-16
        self.type = 3
        self.codepage = 1252
        self.codec = 'windows-1252'
        self.unique_id = 0
        self.version = 0
        self.hasExth = False
        self.exth = b''
        self.exth_offset = self.length + 16
        self.exth_length = 0
        self.crypto_type = 0
        self.firstnontext = self.start+self.records + 1
        self.firstresource = self.start+self.records + 1
        self.ncxidx = 0xffffffff
        self.metaOrthIndex = 0xffffffff
        self.metaInflIndex = 0xffffffff
        self.skelidx = 0xffffffff
        self.fragidx = 0xffffffff
        self.guideidx = 0xffffffff
        self.fdst = 0xffffffff
        self.mlstart = self.sect.loadSection(self.start+1)[:4]
        self.rawSize = 0
        self.metadata = dict_()

        # set up for decompression/unpacking
        self.compression, = struct.unpack_from(b'>H', self.header, 0x0)
        if self.compression == 0x4448:
            reader = HuffcdicReader()
            huffoff, huffnum = struct.unpack_from(b'>LL', self.header, 0x70)
            huffoff = huffoff + self.start
            self.sect.setsectiondescription(huffoff,"Huffman Compression Seed")
            reader.loadHuff(self.sect.loadSection(huffoff))
            for i in range(1, huffnum):
                self.sect.setsectiondescription(huffoff+i,"Huffman CDIC Compression Seed %d" % i)
                reader.loadCdic(self.sect.loadSection(huffoff+i))
            self.unpack = reader.unpack
        elif self.compression == 2:
            self.unpack = PalmdocReader().unpack
        elif self.compression == 1:
            self.unpack = UncompressedReader().unpack
        else:
            raise unpackException('invalid compression type: 0x%4x' % self.compression)

        if self.palm:
            return

        self.length, self.type, self.codepage, self.unique_id, self.version = struct.unpack(b'>LLLLL', self.header[20:40])
        codec_map = {
            1252 : 'windows-1252',
            65001: 'utf-8',
        }
        if self.codepage in codec_map:
            self.codec = codec_map[self.codepage]

        # title
        toff, tlen = struct.unpack(b'>II', self.header[0x54:0x5c])
        tend = toff + tlen
        self.title=self.header[toff:tend].decode(self.codec, errors='replace')

        exth_flag, = struct.unpack(b'>L', self.header[0x80:0x84])
        self.hasExth = exth_flag & 0x40
        self.exth_offset = self.length + 16
        self.exth_length = 0
        if self.hasExth:
            self.exth_length, = struct.unpack_from(b'>L', self.header, self.exth_offset+4)
            self.exth_length = ((self.exth_length + 3)>>2)<<2  # round to next 4 byte boundary
            self.exth = self.header[self.exth_offset:self.exth_offset+self.exth_length]

        # parse the exth / metadata
        self.parseMetaData()

        # self.mlstart = self.sect.loadSection(self.start+1)
        # self.mlstart = self.mlstart[0:4]
        self.crypto_type, = struct.unpack_from(b'>H', self.header, 0xC)

        # Start sector for additional files such as images, fonts, resources, etc
        # Can be missing so fall back to default set previously
        ofst, = struct.unpack_from(b'>L', self.header, 0x6C)
        if ofst != 0xffffffff:
            self.firstresource = ofst + self.start
        ofst, = struct.unpack_from(b'>L', self.header, 0x50)
        if ofst != 0xffffffff:
            self.firstnontext = ofst + self.start

        if self.isPrintReplica():
            return

        if self.version < 8:
            # Dictionary metaOrthIndex
            self.metaOrthIndex, = struct.unpack_from(b'>L', self.header, 0x28)
            if self.metaOrthIndex != 0xffffffff:
                self.metaOrthIndex += self.start

            # Dictionary metaInflIndex
            self.metaInflIndex, = struct.unpack_from(b'>L', self.header, 0x2C)
            if self.metaInflIndex != 0xffffffff:
                self.metaInflIndex += self.start

        # handle older headers without any ncxindex info and later
        # specifically 0xe4 headers
        if self.length + 16 < 0xf8:
            return

        # NCX Index
        self.ncxidx, = struct.unpack(b'>L', self.header[0xf4:0xf8])
        if self.ncxidx != 0xffffffff:
            self.ncxidx += self.start

        # K8 specific Indexes
        if self.start != 0 or self.version == 8:
            # Index into <xml> file skeletons in RawML
            self.skelidx, = struct.unpack_from(b'>L', self.header, 0xfc)
            if self.skelidx != 0xffffffff:
                self.skelidx += self.start

            # Index into <div> sections in RawML
            self.fragidx, = struct.unpack_from(b'>L', self.header, 0xf8)
            if self.fragidx != 0xffffffff:
                self.fragidx += self.start

            # Index into Other files
            self.guideidx, = struct.unpack_from(b'>L', self.header, 0x104)
            if self.guideidx != 0xffffffff:
                self.guideidx += self.start

            # dictionaries do not seem to use the same approach in K8's
            # so disable them
            self.metaOrthIndex = 0xffffffff
            self.metaInflIndex = 0xffffffff

            # need to use the FDST record to find out how to properly unpack
            # the rawML into pieces
            # it is simply a table of start and end locations for each flow piece
            self.fdst, = struct.unpack_from(b'>L', self.header, 0xc0)
            self.fdstcnt, = struct.unpack_from(b'>L', self.header, 0xc4)
            # if cnt is 1 or less, fdst section mumber can be garbage
            if self.fdstcnt <= 1:
                self.fdst = 0xffffffff
            if self.fdst != 0xffffffff:
                self.fdst += self.start
                # setting of fdst section description properly handled in mobi_kf8proc

    def dump_exth(self):
        # determine text encoding
        codec=self.codec
        if (not self.hasExth) or (self.exth_length) == 0 or (self.exth == b''):
            return
        num_items, = struct.unpack(b'>L', self.exth[8:12])
        pos = 12
        print("Key Size Decription                     Value")
        for _ in range(num_items):
            id, size = struct.unpack(b'>LL', self.exth[pos:pos+8])
            contentsize = size-8
            content = self.exth[pos + 8: pos + size]
            if id in MobiHeader.id_map_strings:
                exth_name = MobiHeader.id_map_strings[id]
                print('{0: >3d} {1: >4d} {2: <30s} {3:s}'.format(id, contentsize, exth_name, content.decode(codec, errors='replace')))
            elif id in MobiHeader.id_map_values:
                exth_name = MobiHeader.id_map_values[id]
                if size == 9:
                    value, = struct.unpack(b'B',content)
                    print('{0:3d} byte {1:<30s} {2:d}'.format(id, exth_name, value))
                elif size == 10:
                    value, = struct.unpack(b'>H',content)
                    print('{0:3d} word {1:<30s} 0x{2:0>4X} ({2:d})'.format(id, exth_name, value))
                elif size == 12:
                    value, = struct.unpack(b'>L',content)
                    print('{0:3d} long {1:<30s} 0x{2:0>8X} ({2:d})'.format(id, exth_name, value))
                else:
                    print('{0: >3d} {1: >4d} {2: <30s} (0x{3:s})'.format(id, contentsize, "Bad size for "+exth_name, hexlify(content)))
            elif id in MobiHeader.id_map_hexstrings:
                exth_name = MobiHeader.id_map_hexstrings[id]
                print('{0:3d} {1:4d} {2:<30s} 0x{3:s}'.format(id, contentsize, exth_name, hexlify(content)))
            else:
                exth_name = "Unknown EXTH ID {0:d}".format(id)
                print("{0: >3d} {1: >4d} {2: <30s} 0x{3:s}".format(id, contentsize, exth_name, hexlify(content)))
            pos += size
        return

    def dumpheader(self):
        # first 16 bytes are not part of the official mobiheader
        # but we will treat it as such
        # so section 0 is 16 (decimal) + self.length in total == at least 0x108 bytes for Mobi 8 headers
        print("Dumping section %d, Mobipocket Header version: %d, total length %d" % (self.start,self.version, self.length+16))
        self.hdr = {}
        # set it up for the proper header version
        if self.version == 0:
            self.mobi_header = MobiHeader.palmdoc_header
            self.mobi_header_sorted_keys = MobiHeader.palmdoc_header_sorted_keys
        elif self.version < 8:
            self.mobi_header = MobiHeader.mobi6_header
            self.mobi_header_sorted_keys = MobiHeader.mobi6_header_sorted_keys
        else:
            self.mobi_header = MobiHeader.mobi8_header
            self.mobi_header_sorted_keys = MobiHeader.mobi8_header_sorted_keys

        # parse the header information
        for key in self.mobi_header_sorted_keys:
            (pos, format, tot_len) = self.mobi_header[key]
            if pos < (self.length + 16):
                val, = struct.unpack_from(format, self.header, pos)
                self.hdr[key] = val

        if 'title_offset' in self.hdr:
            title_offset = self.hdr['title_offset']
            title_length = self.hdr['title_length']
        else:
            title_offset = 0
            title_length = 0
        if title_offset == 0:
            title_offset = len(self.header)
            title_length = 0
            self.title = self.sect.palmname.decode('latin-1', errors='replace')
        else:
            self.title = self.header[title_offset:title_offset+title_length].decode(self.codec, errors='replace')
            # title record always padded with two nul bytes and then padded with nuls to next 4 byte boundary
            title_length = ((title_length+2+3)>>2)<<2

        self.extra1 = self.header[self.exth_offset+self.exth_length:title_offset]
        self.extra2 = self.header[title_offset+title_length:]

        print("Mobipocket header from section %d" % self.start)
        print("     Offset  Value Hex Dec        Description")
        for key in self.mobi_header_sorted_keys:
            (pos, format, tot_len) = self.mobi_header[key]
            if pos < (self.length + 16):
                if key != 'magic':
                    fmt_string = "0x{0:0>3X} ({0:3d}){1: >" + str(9-2*tot_len) +"s}0x{2:0>" + str(2*tot_len) + "X} {2:10d} {3:s}"
                else:
                    self.hdr[key] = unicode_str(self.hdr[key])
                    fmt_string = "0x{0:0>3X} ({0:3d}){2:>11s}            {3:s}"
                print(fmt_string.format(pos, " ",self.hdr[key], key))
        print("")

        if self.exth_length > 0:
            print("EXTH metadata, offset %d, padded length %d" % (self.exth_offset,self.exth_length))
            self.dump_exth()
            print("")

        if len(self.extra1) > 0:
            print("Extra data between EXTH and Title, length %d" % len(self.extra1))
            print(hexlify(self.extra1))
            print("")

        if title_length > 0:
            print("Title in header at offset %d, padded length %d: '%s'" %(title_offset,title_length,self.title))
            print("")

        if len(self.extra2) > 0:
            print("Extra data between Title and end of header, length %d" % len(self.extra2))
            print(hexlify(self.extra2))
            print("")

    def isPrintReplica(self):
        return self.mlstart[0:4] == b"%MOP"

    def isK8(self):
        return self.start != 0 or self.version == 8

    def isEncrypted(self):
        return self.crypto_type != 0

    def hasNCX(self):
        return self.ncxidx != 0xffffffff

    def isDictionary(self):
        return self.metaOrthIndex != 0xffffffff

    def getncxIndex(self):
        return self.ncxidx

    def decompress(self, data):
        return self.unpack(data)

    def Language(self):
        langcode = struct.unpack(b'!L', self.header[0x5c:0x60])[0]
        langid = langcode & 0xFF
        sublangid = (langcode >> 8) & 0xFF
        return getLanguage(langid, sublangid)

    def DictInLanguage(self):
        if self.isDictionary():
            langcode = struct.unpack(b'!L', self.header[0x60:0x64])[0]
            langid = langcode & 0xFF
            sublangid = (langcode >> 10) & 0xFF
            if langid != 0:
                return getLanguage(langid, sublangid)
        return False

    def DictOutLanguage(self):
        if self.isDictionary():
            langcode = struct.unpack(b'!L', self.header[0x64:0x68])[0]
            langid = langcode & 0xFF
            sublangid = (langcode >> 10) & 0xFF
            if langid != 0:
                return getLanguage(langid, sublangid)
        return False

    def getRawML(self):
        def getSizeOfTrailingDataEntry(data):
            num = 0
            for v in data[-4:]:
                if bord(v) & 0x80:
                    num = 0
                num = (num << 7) | (bord(v) & 0x7f)
            return num
        def trimTrailingDataEntries(data):
            for _ in range(trailers):
                num = getSizeOfTrailingDataEntry(data)
                data = data[:-num]
            if multibyte:
                num = (ord(data[-1:]) & 3) + 1
                data = data[:-num]
            return data
        multibyte = 0
        trailers = 0
        if self.sect.ident == b'BOOKMOBI':
            mobi_length, = struct.unpack_from(b'>L', self.header, 0x14)
            mobi_version, = struct.unpack_from(b'>L', self.header, 0x68)
            if (mobi_length >= 0xE4) and (mobi_version >= 5):
                flags, = struct.unpack_from(b'>H', self.header, 0xF2)
                multibyte = flags & 1
                while flags > 1:
                    if flags & 2:
                        trailers += 1
                    flags = flags >> 1
        # get raw mobi markup languge
        print("Unpacking raw markup language")
        dataList = []
        # offset = 0
        for i in range(1, self.records+1):
            data = trimTrailingDataEntries(self.sect.loadSection(self.start + i))
            dataList.append(self.unpack(data))
            if self.isK8():
                self.sect.setsectiondescription(self.start + i,"KF8 Text Section {0:d}".format(i))
            elif self.version == 0:
                self.sect.setsectiondescription(self.start + i,"PalmDOC Text Section {0:d}".format(i))
            else:
                self.sect.setsectiondescription(self.start + i,"Mobipocket Text Section {0:d}".format(i))
        rawML = b''.join(dataList)
        self.rawSize = len(rawML)
        return rawML

    # all metadata is stored in a dictionary with key and returns a *list* of values
    # a list is used to allow for multiple creators, multiple contributors, etc
    def parseMetaData(self):
        def addValue(name, value):
            if name not in self.metadata:
                self.metadata[name] = [value]
            else:
                self.metadata[name].append(value)

        codec=self.codec
        if self.hasExth:
            extheader=self.exth
            _length, num_items = struct.unpack(b'>LL', extheader[4:12])
            extheader = extheader[12:]
            pos = 0
            for _ in range(num_items):
                id, size = struct.unpack(b'>LL', extheader[pos:pos+8])
                content = extheader[pos + 8: pos + size]
                if id in MobiHeader.id_map_strings:
                    name = MobiHeader.id_map_strings[id]
                    addValue(name, content.decode(codec, errors='replace'))
                elif id in MobiHeader.id_map_values:
                    name = MobiHeader.id_map_values[id]
                    if size == 9:
                        value, = struct.unpack(b'B',content)
                        addValue(name, unicode_str(str(value)))
                    elif size == 10:
                        value, = struct.unpack(b'>H',content)
                        addValue(name, unicode_str(str(value)))
                    elif size == 12:
                        value, = struct.unpack(b'>L',content)
                        # handle special case of missing CoverOffset or missing ThumbOffset
                        if id == 201 or id == 202:
                            if value != 0xffffffff:
                                addValue(name, unicode_str(str(value)))
                        else:
                            addValue(name, unicode_str(str(value)))
                    else:
                        print("Warning: Bad key, size, value combination detected in EXTH ", id, size, hexlify(content))
                        addValue(name, hexlify(content))
                elif id in MobiHeader.id_map_hexstrings:
                    name = MobiHeader.id_map_hexstrings[id]
                    addValue(name, hexlify(content))
                else:
                    name = unicode_str(str(id)) + ' (hex)'
                    addValue(name, hexlify(content))
                pos += size

        # add the basics to the metadata each as a list element
        self.metadata['Language'] = [self.Language()]
        self.metadata['Title'] = [unicode_str(self.title,self.codec)]
        self.metadata['Codec'] = [self.codec]
        self.metadata['UniqueID'] = [unicode_str(str(self.unique_id))]
        # if no asin create one using a uuid
        if 'ASIN' not in self.metadata:
            self.metadata['ASIN'] = [unicode_str(str(uuid.uuid4()))]
        # if no cdeType set it to "EBOK"
        if 'cdeType' not in self.metadata:
            self.metadata['cdeType'] = ['EBOK']

    def getMetaData(self):
        return self.metadata

    def describeHeader(self, DUMP):
        print("Mobi Version:", self.version)
        print("Codec:", self.codec)
        print("Title:", self.title)
        if 'Updated_Title' in self.metadata:
            print("EXTH Title:", self.metadata['Updated_Title'][0])
        if self.compression == 0x4448:
            print("Huffdic compression")
        elif self.compression == 2:
            print("Palmdoc compression")
        elif self.compression == 1:
            print("No compression")
        if DUMP:
            self.dumpheader()
