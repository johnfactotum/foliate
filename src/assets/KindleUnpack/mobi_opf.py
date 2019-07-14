#!/usr/bin/env python
# -*- coding: utf-8 -*-
# vim:ts=4:sw=4:softtabstop=4:smarttab:expandtab

from __future__ import unicode_literals, division, absolute_import, print_function

from .compatibility_utils import unicode_str, unescapeit
from .compatibility_utils import lzip

from .unipath import pathof

from xml.sax.saxutils import escape as xmlescape

import os
import uuid
from datetime import datetime

# In EPUB3, NCX and <guide> MAY exist in OPF, although the NCX is superseded
# by the Navigation Document and the <guide> is deprecated. Currently, EPUB3_WITH_NCX
# and EPUB3_WITH_GUIDE are set to True due to compatibility with epub2 reading systems.
# They might be change to set to False in the future.

EPUB3_WITH_NCX = True  # Do not set to False except for debug.
""" Set to True to create a toc.ncx when converting to epub3. """

EPUB3_WITH_GUIDE = True  # Do not set to False except for debug.
""" Set to True to create a guide element in an opf when converting to epub3. """

EPUB_OPF = 'content.opf'
""" The name for the OPF of EPUB. """

TOC_NCX = 'toc.ncx'
""" The name for the TOC of EPUB2. """

NAVIGATION_DOCUMENT = 'nav.xhtml'
""" The name for the navigation document of EPUB3. """

BEGIN_INFO_ONLY = '<!-- BEGIN INFORMATION ONLY '
""" The comment to indicate the beginning of metadata which will be ignored by kindlegen. """

END_INFO_ONLY = 'END INFORMATION ONLY -->'
""" The comment to indicate the end of metadata which will be ignored by kindlegen. """

EXTH_TITLE_FURIGANA = 'Title-Pronunciation'
""" The name for Title Furigana(similar to file-as) set by KDP. """

EXTH_CREATOR_FURIGANA = 'Author-Pronunciation'
""" The name for Creator Furigana(similar to file-as) set by KDP. """

EXTH_PUBLISHER_FURIGANA = 'Publisher-Pronunciation'
""" The name for Publisher Furigana(similar to file-as) set by KDP. """

EXTRA_ENTITIES = {'"': '&quot;', "'": "&apos;"}

class OPFProcessor(object):

    def __init__(self, files, metadata, fileinfo, rscnames, hasNCX, mh, usedmap, pagemapxml='', guidetext='', k8resc=None, epubver='2'):
        self.files = files
        self.metadata = metadata
        self.fileinfo = fileinfo
        self.rscnames = rscnames
        self.has_ncx = hasNCX
        self.codec = mh.codec
        self.isK8 = mh.isK8()
        self.printReplica = mh.isPrintReplica()
        self.guidetext = unicode_str(guidetext)
        self.used = usedmap
        self.k8resc = k8resc
        self.covername = None
        self.cover_id = 'cover_img'
        if self.k8resc is not None and self.k8resc.cover_name is not None:
            # update cover id info from RESC if available
            self.cover_id = self.k8resc.cover_name
        # Create a unique urn uuid
        self.BookId = unicode_str(str(uuid.uuid4()))
        self.pagemap = pagemapxml

        self.ncxname = None
        self.navname = None

        # page-progression-direction is only set in spine
        self.page_progression_direction = metadata.pop('page-progression-direction', [None])[0]
        if 'rl' in metadata.get('primary-writing-mode', [''])[0]:
            self.page_progression_direction = 'rtl'
        self.epubver = epubver  # the epub version set by user
        self.target_epubver = epubver  # the epub vertion set by user or detected automatically
        if self.epubver == 'A':
            self.target_epubver = self.autodetectEPUBVersion()
        elif self.epubver == 'F':
            self.target_epubver = '2'
        elif self.epubver != '2' and self.epubver != '3':
            self.target_epubver = '2'

        # id for rifine attributes
        self.title_id = {}
        self.creator_id = {}
        self.publisher_id = {}
        # extra attributes
        self.title_attrib = {}
        self.creator_attrib = {}
        self.publisher_attrib = {}
        self.extra_attributes = []  # for force epub2 option
        # Create epub3 metadata from EXTH.
        self.exth_solved_refines_metadata = []
        self.exth_refines_metadata = []
        self.exth_fixedlayout_metadata = []

        self.defineRefinesID()
        self.processRefinesMetadata()
        if self.k8resc is not None:
            # Create metadata in RESC section.
            self.k8resc.createMetadata(epubver)
        if self.target_epubver == "3":
            self.createMetadataForFixedlayout()

    def escapeit(self, sval, EXTRAS=None):
        # note, xmlescape and unescape do not work with utf-8 bytestrings
        sval = unicode_str(sval)
        if EXTRAS:
            res = xmlescape(unescapeit(sval), EXTRAS)
        else:
            res = xmlescape(unescapeit(sval))
        return res

    def createMetaTag(self, data, property, content, refid=''):
        refines = ''
        if refid:
            refines = ' refines="#%s"' % refid
        data.append('<meta property="%s"%s>%s</meta>\n' % (property, refines, content))

    def buildOPFMetadata(self, start_tag, has_obfuscated_fonts=False):
        # convert from EXTH metadata format to target epub version metadata
        # epub 3 will ignore <meta name="xxxx" content="yyyy" /> style metatags
        #    but allows them to be present for backwards compatibility
        #    instead the new format is
        #    <meta property="xxxx" id="iiii" ... > property_value</meta>
        #       and DCMES elements such as:
        #    <dc:blah id="iiii">value</dc:blah>

        metadata = self.metadata
        k8resc = self.k8resc

        META_TAGS = ['Drm Server Id', 'Drm Commerce Id', 'Drm Ebookbase Book Id', 'ASIN', 'ThumbOffset', 'Fake Cover',
                                                'Creator Software', 'Creator Major Version', 'Creator Minor Version', 'Creator Build Number',
                                                'Watermark', 'Clipping Limit', 'Publisher Limit', 'Text to Speech Disabled', 'CDE Type',
                                                'Updated Title', 'Font Signature (hex)', 'Tamper Proof Keys (hex)',]

        # def handleTag(data, metadata, key, tag, ids={}):
        def handleTag(data, metadata, key, tag, attrib={}):
            '''Format metadata values.

            @param data: List of formatted metadata entries.
            @param metadata: The metadata dictionary.
            @param key: The key of the metadata value to handle.
            @param tag: The opf tag corresponds to the metadata value.
            ###@param ids: The ids in tags for refines property of epub3.
            @param attrib: The extra attibute for refines or opf prefixs.
           '''
            if key in metadata:
                for i, value in enumerate(metadata[key]):
                    closingTag = tag.split(" ")[0]
                    res = '<%s%s>%s</%s>\n' % (tag, attrib.get(i, ''), self.escapeit(value), closingTag)
                    data.append(res)
                del metadata[key]

        # these are allowed but ignored by epub3
        def handleMetaPairs(data, metadata, key, name):
            if key in metadata:
                for value in metadata[key]:
                    res = '<meta name="%s" content="%s" />\n' % (name, self.escapeit(value, EXTRA_ENTITIES))
                    data.append(res)
                del metadata[key]

        data = []
        data.append(start_tag + '\n')
        # Handle standard metadata
        if 'Title' in metadata:
            handleTag(data, metadata, 'Title', 'dc:title', self.title_attrib)
        else:
            data.append('<dc:title>Untitled</dc:title>\n')
        handleTag(data, metadata, 'Language', 'dc:language')
        if 'UniqueID' in metadata:
            handleTag(data, metadata, 'UniqueID', 'dc:identifier id="uid"')
        else:
            # No unique ID in original, give it a generic one.
            data.append('<dc:identifier id="uid">0</dc:identifier>\n')

        if self.target_epubver == '3':
            # epub version 3 minimal metadata requires a dcterms:modifed date tag
            self.createMetaTag(data, 'dcterms:modified', datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"))

        if self.isK8 and has_obfuscated_fonts:
            # Use the random generated urn:uuid so obuscated fonts work.
            # It doesn't need to be _THE_ unique identifier to work as a key
            # for obfuscated fonts in Sigil, ADE and calibre. Its just has
            # to use the opf:scheme="UUID" and have the urn:uuid: prefix.
            if self.target_epubver == '3':
                data.append('<dc:identifier>urn:uuid:'+self.BookId+'</dc:identifier>\n')
            else:
                data.append('<dc:identifier opf:scheme="UUID">urn:uuid:'+self.BookId+'</dc:identifier>\n')

        handleTag(data, metadata, 'Creator', 'dc:creator', self.creator_attrib)
        handleTag(data, metadata, 'Contributor', 'dc:contributor')
        handleTag(data, metadata, 'Publisher', 'dc:publisher', self.publisher_attrib)
        handleTag(data, metadata, 'Source', 'dc:source')
        handleTag(data, metadata, 'Type', 'dc:type')
        if self.target_epubver == '3':
            if 'ISBN' in metadata:
                for i, value in enumerate(metadata['ISBN']):
                    res = '<dc:identifier>urn:isbn:%s</dc:identifier>\n' % self.escapeit(value)
                    data.append(res)
        else:
            handleTag(data, metadata, 'ISBN', 'dc:identifier opf:scheme="ISBN"')
        if 'Subject' in metadata:
            if 'SubjectCode' in metadata:
                codeList = metadata['SubjectCode']
                del metadata['SubjectCode']
            else:
                codeList = None
            for i in range(len(metadata['Subject'])):
                if codeList and i < len(codeList):
                    data.append('<dc:subject BASICCode="'+codeList[i]+'">')
                else:
                    data.append('<dc:subject>')
                data.append(self.escapeit(metadata['Subject'][i])+'</dc:subject>\n')
            del metadata['Subject']
        handleTag(data, metadata, 'Description', 'dc:description')
        if self.target_epubver == '3':
            if 'Published' in metadata:
                for i, value in enumerate(metadata['Published']):
                    res = '<dc:date>%s</dc:date>\n' % self.escapeit(value)
                    data.append(res)
        else:
            handleTag(data, metadata, 'Published', 'dc:date opf:event="publication"')
        handleTag(data, metadata, 'Rights', 'dc:rights')

        if self.epubver == 'F':
            if self.extra_attributes or k8resc is not None and k8resc.extra_attributes:
                data.append('<!-- THE FOLLOWINGS ARE REQUIRED TO INSERT INTO <dc:xxx> MANUALLY\n')
                if self.extra_attributes:
                    data += self.extra_attributes
                if k8resc is not None and k8resc.extra_attributes:
                    data += k8resc.extra_attributes
                data.append('-->\n')
        else:
            # Append refines metadata.
            if self.exth_solved_refines_metadata:
                data.append('<!-- Refines MetaData from EXTH -->\n')
                data += self.exth_solved_refines_metadata
            if self.exth_refines_metadata or k8resc is not None and k8resc.refines_metadata:
                data.append('<!-- THE FOLLOWINGS ARE REQUIRED TO EDIT IDS MANUALLY\n')
                if self.exth_refines_metadata:
                    data += self.exth_refines_metadata
                if k8resc is not None and k8resc.refines_metadata:
                    data += k8resc.refines_metadata
                data.append('-->\n')

        # Append metadata in RESC section.
        if k8resc is not None and k8resc.extra_metadata:
            data.append('<!-- Extra MetaData from RESC\n')
            data += k8resc.extra_metadata
            data.append('-->\n')

        if 'CoverOffset' in metadata:
            imageNumber = int(metadata['CoverOffset'][0])
            self.covername = self.rscnames[imageNumber]
            if self.covername is None:
                print("Error: Cover image %s was not recognized as a valid image" % imageNumber)
            else:
                # <meta name="cover"> is obsoleted in EPUB3, but kindlegen v2.9 requires it.
                data.append('<meta name="cover" content="' + self.cover_id + '" />\n')
                self.used[self.covername] = 'used'
            del metadata['CoverOffset']

        handleMetaPairs(data, metadata, 'Codec', 'output encoding')
        # handle kindlegen specifc tags
        handleTag(data, metadata, 'DictInLanguage', 'DictionaryInLanguage')
        handleTag(data, metadata, 'DictOutLanguage', 'DictionaryOutLanguage')
        handleMetaPairs(data, metadata, 'RegionMagnification', 'RegionMagnification')
        handleMetaPairs(data, metadata, 'book-type', 'book-type')
        handleMetaPairs(data, metadata, 'zero-gutter', 'zero-gutter')
        handleMetaPairs(data, metadata, 'zero-margin', 'zero-margin')
        handleMetaPairs(data, metadata, 'primary-writing-mode', 'primary-writing-mode')
        handleMetaPairs(data, metadata, 'fixed-layout', 'fixed-layout')
        handleMetaPairs(data, metadata, 'orientation-lock', 'orientation-lock')
        handleMetaPairs(data, metadata, 'original-resolution', 'original-resolution')

        # these are not allowed in epub2 or 3 so convert them to meta name content pairs
        # perhaps these could better be mapped into the dcterms namespace instead
        handleMetaPairs(data, metadata, 'Review', 'review')
        handleMetaPairs(data, metadata, 'Imprint', 'imprint')
        handleMetaPairs(data, metadata, 'Adult', 'adult')
        handleMetaPairs(data, metadata, 'DictShortName', 'DictionaryVeryShortName')

        # these are needed by kobo books upon submission but not sure if legal metadata in epub2 or epub3
        if 'Price' in metadata and 'Currency' in metadata:
            priceList = metadata['Price']
            currencyList = metadata['Currency']
            if len(priceList) != len(currencyList):
                print("Error: found %s price entries, but %s currency entries.")
            else:
                for i in range(len(priceList)):
                    data.append('<SRP Currency="'+currencyList[i]+'">'+priceList[i]+'</SRP>\n')
            del metadata['Price']
            del metadata['Currency']

        if self.target_epubver == '3':
            # Append metadata for EPUB3.
            if self.exth_fixedlayout_metadata:
                data.append('<!-- EPUB3 MedaData converted from EXTH -->\n')
                data += self.exth_fixedlayout_metadata

        # all that remains is extra EXTH info we will store inside a comment inside meta name/content pairs
        # so it can not impact anything and will be automatically stripped out if found again in a RESC section
        data.append(BEGIN_INFO_ONLY + '\n')
        if 'ThumbOffset' in metadata:
            imageNumber = int(metadata['ThumbOffset'][0])
            imageName = self.rscnames[imageNumber]
            if imageName is None:
                print("Error: Cover Thumbnail image %s was not recognized as a valid image" % imageNumber)
            else:
                data.append('<meta name="Cover ThumbNail Image" content="'+ 'Images/'+imageName+'" />\n')
                # self.used[imageName] = 'used' # thumbnail image is always generated by Kindlegen, so don't include in manifest
                self.used[imageName] = 'not used'
            del metadata['ThumbOffset']
        for metaName in META_TAGS:
            if metaName in metadata:
                for value in metadata[metaName]:
                    data.append('<meta name="'+metaName+'" content="'+self.escapeit(value, EXTRA_ENTITIES)+'" />\n')
                del metadata[metaName]
        for key in list(metadata.keys()):
            for value in metadata[key]:
                data.append('<meta name="'+key+'" content="'+self.escapeit(value, EXTRA_ENTITIES)+'" />\n')
            del metadata[key]
        data.append(END_INFO_ONLY + '\n')
        data.append('</metadata>\n')
        return data

    def buildOPFManifest(self, ncxname, navname=None):
        # buildManifest for mobi7, azw4, epub2 and epub3.
        k8resc = self.k8resc
        cover_id = self.cover_id
        hasK8RescSpine = k8resc is not None and k8resc.hasSpine()
        self.ncxname = ncxname
        self.navname = navname

        data = []
        data.append('<manifest>\n')
        media_map = {
                '.jpg'  : 'image/jpeg',
                '.jpeg' : 'image/jpeg',
                '.png'  : 'image/png',
                '.gif'  : 'image/gif',
                '.svg'  : 'image/svg+xml',
                '.xhtml': 'application/xhtml+xml',
                '.html' : 'text/html',                   # for mobi7
                '.pdf'  : 'application/pdf',             # for azw4(print replica textbook)
                '.ttf'  : 'application/x-font-ttf',
                '.otf'  : 'application/x-font-opentype',  # replaced?
                '.css'  : 'text/css',
                # '.html' : 'text/x-oeb1-document',        # for mobi7
                # '.otf'  : 'application/vnd.ms-opentype', # [OpenType] OpenType fonts
                # '.woff' : 'application/font-woff',       # [WOFF] WOFF fonts
                # '.smil' : 'application/smil+xml',        # [MediaOverlays301] EPUB Media Overlay documents
                # '.pls'  : 'application/pls+xml',         # [PLS] Text-to-Speech (TTS) Pronunciation lexicons
                # '.mp3'  : 'audio/mpeg',
                # '.mp4'  : 'video/mp4',
                # '.js'   : 'text/javascript',             # not supported in K8
                }
        spinerefs = []

        idcnt = 0
        for [key,dir,fname] in self.fileinfo:
            name, ext = os.path.splitext(fname)
            ext = ext.lower()
            media = media_map.get(ext)
            ref = "item%d" % idcnt
            if hasK8RescSpine:
                if key is not None and key in k8resc.spine_idrefs:
                    ref = k8resc.spine_idrefs[key]
            properties = ''
            if dir != '':
                fpath = dir + '/' + fname
            else:
                fpath = fname
            data.append('<item id="{0:}" media-type="{1:}" href="{2:}" {3:}/>\n'.format(ref, media, fpath, properties))

            if ext in ['.xhtml', '.html']:
                spinerefs.append(ref)
            idcnt += 1

        for fname in self.rscnames:
            if fname is not None:
                if self.used.get(fname,'not used') == 'not used':
                    continue
                name, ext = os.path.splitext(fname)
                ext = ext.lower()
                media = media_map.get(ext,ext[1:])
                properties = ''
                if fname == self.covername:
                    ref = cover_id
                    if self.target_epubver == '3':
                        properties = 'properties="cover-image"'
                else:
                    ref = "item%d" % idcnt
                if ext == '.ttf' or ext == '.otf':
                    if self.isK8:  # fonts are only used in Mobi 8
                        fpath = 'Fonts/' + fname
                        data.append('<item id="{0:}" media-type="{1:}" href="{2:}" {3:}/>\n'.format(ref, media, fpath, properties))
                else:
                    fpath = 'Images/' + fname
                    data.append('<item id="{0:}" media-type="{1:}" href="{2:}" {3:}/>\n'.format(ref, media, fpath, properties))
                idcnt += 1

        if self.target_epubver == '3' and navname is not None:
            data.append('<item id="nav" media-type="application/xhtml+xml" href="Text/' + navname + '" properties="nav"/>\n')
        if self.has_ncx and ncxname is not None:
            data.append('<item id="ncx" media-type="application/x-dtbncx+xml" href="' + ncxname +'" />\n')
        if self.pagemap != '':
            data.append('<item id="map" media-type="application/oebs-page-map+xml" href="page-map.xml" />\n')
        data.append('</manifest>\n')
        return [data, spinerefs]

    def buildOPFSpine(self, spinerefs, isNCX):
        # build spine
        k8resc = self.k8resc
        hasK8RescSpine = k8resc is not None and k8resc.hasSpine()
        data = []
        ppd = ''
        if self.isK8 and self.page_progression_direction is not None:
            ppd = ' page-progression-direction="{:s}"'.format(self.page_progression_direction)
        ncx = ''
        if isNCX:
            ncx = ' toc="ncx"'
        map=''
        if self.pagemap != '':
            map = ' page-map="map"'
        if self.epubver == 'F':
            if ppd:
                ppd = '<!--' + ppd + ' -->'
            spine_start_tag = '<spine{1:s}{2:s}>{0:s}\n'.format(ppd, map, ncx)
        else:
            spine_start_tag = '<spine{0:s}{1:s}{2:s}>\n'.format(ppd, map, ncx)
        data.append(spine_start_tag)

        if hasK8RescSpine:
            for key in k8resc.spine_order:
                idref = k8resc.spine_idrefs[key]
                attribs = k8resc.spine_pageattributes[key]
                tag = '<itemref idref="%s"' % idref
                for aname, val in list(attribs.items()):
                    if self.epubver == 'F' and aname == 'properties':
                        continue
                    if val is not None:
                        tag += ' %s="%s"' % (aname, val)
                tag += '/>'
                if self.epubver == 'F' and 'properties' in attribs:
                    val = attribs['properties']
                    if val is not None:
                        tag += '<!-- properties="%s" -->' % val
                tag += '\n'
                data.append(tag)
        else:
            start = 0
            # special case the created coverpage if need be
            [key, dir, fname] = self.fileinfo[0]
            if key is not None and key == "coverpage":
                entry = spinerefs[start]
                data.append('<itemref idref="%s" linear="no"/>\n' % entry)
                start += 1
            for entry in spinerefs[start:]:
                data.append('<itemref idref="' + entry + '"/>\n')
        data.append('</spine>\n')
        return data

    def buildMobi7OPF(self):
        # Build an OPF for mobi7 and azw4.
        print("Building an opf for mobi7/azw4.")
        data = []
        data.append('<?xml version="1.0" encoding="utf-8"?>\n')
        data.append('<package version="2.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="uid">\n')
        metadata_tag = '<metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">'
        opf_metadata = self.buildOPFMetadata(metadata_tag)
        data += opf_metadata
        if self.has_ncx:
            # ncxname = self.files.getInputFileBasename() + '.ncx'
            ncxname = 'toc.ncx'
        else:
            ncxname = None
        [opf_manifest, spinerefs] = self.buildOPFManifest(ncxname)
        data += opf_manifest
        opf_spine = self.buildOPFSpine(spinerefs, self.has_ncx)
        data += opf_spine
        data.append('<tours>\n</tours>\n')
        if not self.printReplica:
            guide ='<guide>\n' + self.guidetext + '</guide>\n'
            data.append(guide)
        data.append('</package>\n')
        return ''.join(data)

    def buildEPUBOPF(self, has_obfuscated_fonts=False):
        print("Building an opf for mobi8 using epub version: ", self.target_epubver)
        if self.target_epubver == '2':
            has_ncx = self.has_ncx
            has_guide = True
            ncxname = None
            ncxname = TOC_NCX
            navname = None
            package = '<package version="2.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="uid">\n'
            tours = '<tours>\n</tours>\n'
            metadata_tag = '<metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">'
        else:
            has_ncx = EPUB3_WITH_NCX
            has_guide = EPUB3_WITH_GUIDE
            ncxname = None
            if has_ncx:
                ncxname = TOC_NCX
            navname = NAVIGATION_DOCUMENT
            package = '<package version="3.0" xmlns="http://www.idpf.org/2007/opf" prefix="rendition: http://www.idpf.org/vocab/rendition/#" unique-identifier="uid">\n'
            tours = ''
            metadata_tag = '<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">'

        data = []
        data.append('<?xml version="1.0" encoding="utf-8"?>\n')
        data.append(package)
        opf_metadata = self.buildOPFMetadata(metadata_tag, has_obfuscated_fonts)
        data += opf_metadata
        [opf_manifest, spinerefs] = self.buildOPFManifest(ncxname, navname)
        data += opf_manifest
        opf_spine = self.buildOPFSpine(spinerefs, has_ncx)
        data += opf_spine
        data.append(tours)
        if has_guide:
            guide ='<guide>\n' + self.guidetext + '</guide>\n'
            data.append(guide)
        data.append('</package>\n')
        return ''.join(data)

    def writeOPF(self, has_obfuscated_fonts=False):
        if self.isK8:
            data = self.buildEPUBOPF(has_obfuscated_fonts)
            outopf = os.path.join(self.files.k8oebps, EPUB_OPF)
            with open(pathof(outopf), 'wb') as f:
                f.write(data.encode('utf-8'))
            return self.BookId
        else:
            data = self.buildMobi7OPF()
            outopf = os.path.join(self.files.mobi7dir, 'content.opf')
            with open(pathof(outopf), 'wb') as f:
                f.write(data.encode('utf-8'))
            return 0

    def getBookId(self):
        return self.BookId

    def getNCXName(self):
        return self.ncxname

    def getNAVName(self):
        return self.navname

    def getEPUBVersion(self):
        return self.target_epubver

    def hasNCX(self):
        return self.ncxname is not None and self.has_ncx

    def hasNAV(self):
        return self.navname is not None

    def autodetectEPUBVersion(self):
        # Determine EPUB version from metadata and RESC.
        metadata = self.metadata
        k8resc = self.k8resc
        epubver = '2'
        if 'true' == metadata.get('fixed-layout', [''])[0].lower():
            epubver = '3'
        elif metadata.get('orientation-lock', [''])[0].lower() in ['portrait', 'landscape']:
            epubver = '3'
        elif self.page_progression_direction == 'rtl':
            epubver = '3'
        elif EXTH_TITLE_FURIGANA in metadata:
            epubver = '3'
        elif EXTH_CREATOR_FURIGANA in metadata:
            epubver = '3'
        elif EXTH_PUBLISHER_FURIGANA in metadata:
            epubver = '3'
        elif k8resc is not None and k8resc.needEPUB3():
            epubver = '3'
        return epubver

    def defineRefinesID(self):
        # the following EXTH are set by KDP.
        # 'Title_Furigana_(508)'
        # 'Creator_Furigana_(517)',
        # 'Publisher_Furigana_(522)'
        # It is difficult to find correspondence between Title, Creator, Publisher
        # and EXTH 508,512, 522 if they have more than two values since KDP seems not preserve the oders of EXTH 508,512 and 522.
        # It is also difficult to find correspondence between them and tags which have refine attributes in RESC.
        # So editing manually is required.
        metadata = self.metadata

        needRefinesId = False
        if self.k8resc is not None:
            needRefinesId = self.k8resc.hasRefines()
        # Create id for rifine attributes
        if (needRefinesId or EXTH_TITLE_FURIGANA in metadata) and 'Title' in metadata:
            for i in range(len(metadata.get('Title'))):
                self.title_id[i] = 'title%02d' % (i+1)

        if (needRefinesId or EXTH_CREATOR_FURIGANA in metadata) and 'Creator' in metadata:
            for i in range(len(metadata.get('Creator'))):
                self.creator_id[i] = 'creator%02d' % (i+1)

        if (needRefinesId or EXTH_PUBLISHER_FURIGANA in metadata) and 'Publisher' in metadata:
            for i in range(len(metadata.get('Publisher'))):
                self.publisher_id[i] = 'publisher%02d' % (i+1)

    def processRefinesMetadata(self):
        # create refines metadata defined in epub3 or convert refines property to opf: attribues for epub2.
        metadata = self.metadata

        refines_list = [
                [EXTH_TITLE_FURIGANA, self.title_id, self.title_attrib, 'title00'],
                [EXTH_CREATOR_FURIGANA, self.creator_id, self.creator_attrib, 'creator00'],
                [EXTH_PUBLISHER_FURIGANA, self.publisher_id, self.publisher_attrib, 'publisher00']
                ]

        create_refines_metadata = False
        for EXTH in lzip(*refines_list)[0]:
            if EXTH in metadata:
                create_refines_metadata = True
                break
        if create_refines_metadata:
            for [EXTH, id, attrib, defaultid] in refines_list:
                if self.target_epubver == '3':
                    for i, value in list(id.items()):
                        attrib[i] = ' id="%s"' % value

                    if EXTH in metadata:
                        if len(metadata[EXTH]) == 1 and len(id) == 1:
                            self.createMetaTag(self.exth_solved_refines_metadata, 'file-as', metadata[EXTH][0], id[0])
                        else:
                            for i, value in enumerate(metadata[EXTH]):
                                self.createMetaTag(self.exth_refines_metadata, 'file-as', value, id.get(i, defaultid))
                else:
                    if EXTH in metadata:
                        if len(metadata[EXTH]) == 1 and len(id) == 1:
                            attr = ' opf:file-as="%s"' % metadata[EXTH][0]
                            attrib[0] = attr
                        else:
                            for i, value in enumerate(metadata[EXTH]):
                                attr = ' id="#%s" opf:file-as="%s"\n' % (id.get(i, defaultid), value)
                                self.extra_attributes.append(attr)

    def createMetadataForFixedlayout(self):
        # convert fixed layout to epub3 format if needed.
        metadata = self.metadata

        if 'fixed-layout' in metadata:
            fixedlayout = metadata['fixed-layout'][0]
            content = {'true' : 'pre-paginated'}.get(fixedlayout.lower(), 'reflowable')
            self.createMetaTag(self.exth_fixedlayout_metadata, 'rendition:layout', content)

        if 'orientation-lock' in metadata:
            content = metadata['orientation-lock'][0].lower()
            if content == 'portrait' or content == 'landscape':
                self.createMetaTag(self.exth_fixedlayout_metadata, 'rendition:orientation', content)

        # according to epub3 spec about correspondence with Amazon
        # if 'original-resolution' is provided it needs to be converted to
        # meta viewport property tag stored in the <head></head> of **each**
        # xhtml page - so this tag would need to be handled by editing each part
        # before reaching this routine
        # we need to add support for this to the k8html routine
        # if 'original-resolution' in metadata.keys():
        #     resolution = metadata['original-resolution'][0].lower()
        #     width, height = resolution.split('x')
        #     if width.isdigit() and int(width) > 0 and height.isdigit() and int(height) > 0:
        #         viewport = 'width=%s, height=%s' % (width, height)
        #         self.createMetaTag(self.exth_fixedlayout_metadata, 'rendition:viewport', viewport)
