#!/usr/bin/env python
# -*- coding: utf-8 -*-
# vim:ts=4:sw=4:softtabstop=4:smarttab:expandtab

from __future__ import unicode_literals, division, absolute_import, print_function

import os
from .unipath import pathof


import re
# note: re requites the pattern to be the exact same type as the data to be searched in python3
# but u"" is not allowed for the pattern itself only b""

from .mobi_utils import toBase32
from .mobi_index import MobiIndex

DEBUG_NCX = False

class ncxExtract:

    def __init__(self, mh, files):
        self.mh = mh
        self.sect = self.mh.sect
        self.files = files
        self.isNCX = False
        self.mi = MobiIndex(self.sect)
        self.ncxidx = self.mh.ncxidx
        self.indx_data = None

    def parseNCX(self):
        indx_data = []
        tag_fieldname_map = {
                1: ['pos',0],
                2: ['len',0],
                3: ['noffs',0],
                4: ['hlvl',0],
                5: ['koffs',0],
                6: ['pos_fid',0],
                21: ['parent',0],
                22: ['child1',0],
                23: ['childn',0]
        }
        if self.ncxidx != 0xffffffff:
            outtbl, ctoc_text = self.mi.getIndexData(self.ncxidx, "NCX")
            if DEBUG_NCX:
                print(ctoc_text)
                print(outtbl)
            num = 0
            for [text, tagMap] in outtbl:
                tmp = {
                        'name': text.decode('utf-8'),
                        'pos':  -1,
                        'len':  0,
                        'noffs': -1,
                        'text' : "Unknown Text",
                        'hlvl' : -1,
                        'kind' : "Unknown Kind",
                        'pos_fid' : None,
                        'parent' : -1,
                        'child1' : -1,
                        'childn' : -1,
                        'num'  : num
                        }
                for tag in tag_fieldname_map:
                    [fieldname, i] = tag_fieldname_map[tag]
                    if tag in tagMap:
                        fieldvalue = tagMap[tag][i]
                        if tag == 6:
                            pos_fid = toBase32(fieldvalue,4).decode('utf-8')
                            fieldvalue2 = tagMap[tag][i+1]
                            pos_off = toBase32(fieldvalue2,10).decode('utf-8')
                            fieldvalue = 'kindle:pos:fid:%s:off:%s' % (pos_fid, pos_off)
                        tmp[fieldname] = fieldvalue
                        if tag == 3:
                            toctext = ctoc_text.get(fieldvalue, 'Unknown Text')
                            toctext = toctext.decode(self.mh.codec)
                            tmp['text'] = toctext
                        if tag == 5:
                            kindtext = ctoc_text.get(fieldvalue, 'Unknown Kind')
                            kindtext = kindtext.decode(self.mh.codec)
                            tmp['kind'] = kindtext
                indx_data.append(tmp)
                if DEBUG_NCX:
                    print("record number: ", num)
                    print("name: ", tmp['name'],)
                    print("position", tmp['pos']," length: ", tmp['len'])
                    print("text: ", tmp['text'])
                    print("kind: ", tmp['kind'])
                    print("heading level: ", tmp['hlvl'])
                    print("parent:", tmp['parent'])
                    print("first child: ",tmp['child1']," last child: ", tmp['childn'])
                    print("pos_fid is ", tmp['pos_fid'])
                    print("\n\n")
                num += 1
        self.indx_data = indx_data
        return indx_data

    def buildNCX(self, htmlfile, title, ident, lang):
        indx_data = self.indx_data

        ncx_header = \
'''<?xml version='1.0' encoding='utf-8'?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1" xml:lang="%s">
<head>
<meta content="%s" name="dtb:uid"/>
<meta content="%d" name="dtb:depth"/>
<meta content="mobiunpack.py" name="dtb:generator"/>
<meta content="0" name="dtb:totalPageCount"/>
<meta content="0" name="dtb:maxPageNumber"/>
</head>
<docTitle>
<text>%s</text>
</docTitle>
<navMap>
'''

        ncx_footer = \
'''  </navMap>
</ncx>
'''

        ncx_entry = \
'''<navPoint id="%s" playOrder="%d">
<navLabel>
<text>%s</text>
</navLabel>
<content src="%s"/>'''

        # recursive part
        def recursINDX(max_lvl=0, num=0, lvl=0, start=-1, end=-1):
            if start>len(indx_data) or end>len(indx_data):
                print("Warning: missing INDX child entries", start, end, len(indx_data))
                return ''
            if DEBUG_NCX:
                print("recursINDX lvl %d from %d to %d" % (lvl, start, end))
            xml = ''
            if start <= 0:
                start = 0
            if end <= 0:
                end = len(indx_data)
            if lvl > max_lvl:
                max_lvl = lvl
            indent = '  ' * (2 + lvl)

            for i in range(start, end):
                e = indx_data[i]
                if not e['hlvl'] == lvl:
                    continue
                # open entry
                num += 1
                link = '%s#filepos%d' % (htmlfile, e['pos'])
                tagid = 'np_%d' % num
                entry = ncx_entry % (tagid, num, e['text'], link)
                entry = re.sub(re.compile('^', re.M), indent, entry, 0)
                xml += entry + '\n'
                # recurs
                if e['child1']>=0:
                    xmlrec, max_lvl, num = recursINDX(max_lvl, num, lvl + 1,
                            e['child1'], e['childn'] + 1)
                    xml += xmlrec
                # close entry
                xml += indent + '</navPoint>\n'
            return xml, max_lvl, num

        body, max_lvl, num = recursINDX()
        header = ncx_header % (lang, ident, max_lvl + 1, title)
        ncx =  header + body + ncx_footer
        if not len(indx_data) == num:
            print("Warning: different number of entries in NCX", len(indx_data), num)
        return ncx

    def writeNCX(self, metadata):
        # build the xml
        self.isNCX = True
        print("Write ncx")
        # htmlname = os.path.basename(self.files.outbase)
        # htmlname += '.html'
        htmlname = 'book.html'
        xml = self.buildNCX(htmlname, metadata['Title'][0], metadata['UniqueID'][0], metadata.get('Language')[0])
        # write the ncx file
        # ncxname = os.path.join(self.files.mobi7dir, self.files.getInputFileBasename() + '.ncx')
        ncxname = os.path.join(self.files.mobi7dir, 'toc.ncx')
        with open(pathof(ncxname), 'wb') as f:
            f.write(xml.encode('utf-8'))

    def buildK8NCX(self, indx_data, title, ident, lang):
        ncx_header = \
'''<?xml version='1.0' encoding='utf-8'?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1" xml:lang="%s">
<head>
<meta content="%s" name="dtb:uid"/>
<meta content="%d" name="dtb:depth"/>
<meta content="mobiunpack.py" name="dtb:generator"/>
<meta content="0" name="dtb:totalPageCount"/>
<meta content="0" name="dtb:maxPageNumber"/>
</head>
<docTitle>
<text>%s</text>
</docTitle>
<navMap>
'''

        ncx_footer = \
'''  </navMap>
</ncx>
'''

        ncx_entry = \
'''<navPoint id="%s" playOrder="%d">
<navLabel>
<text>%s</text>
</navLabel>
<content src="%s"/>'''

        # recursive part
        def recursINDX(max_lvl=0, num=0, lvl=0, start=-1, end=-1):
            if start>len(indx_data) or end>len(indx_data):
                print("Warning: missing INDX child entries", start, end, len(indx_data))
                return ''
            if DEBUG_NCX:
                print("recursINDX lvl %d from %d to %d" % (lvl, start, end))
            xml = ''
            if start <= 0:
                start = 0
            if end <= 0:
                end = len(indx_data)
            if lvl > max_lvl:
                max_lvl = lvl
            indent = '  ' * (2 + lvl)

            for i in range(start, end):
                e = indx_data[i]
                htmlfile = e['filename']
                desttag = e['idtag']
                if not e['hlvl'] == lvl:
                    continue
                # open entry
                num += 1
                if desttag == '':
                    link = 'Text/%s' % htmlfile
                else:
                    link = 'Text/%s#%s' % (htmlfile, desttag)
                tagid = 'np_%d' % num
                entry = ncx_entry % (tagid, num, e['text'], link)
                entry = re.sub(re.compile('^', re.M), indent, entry, 0)
                xml += entry + '\n'
                # recurs
                if e['child1']>=0:
                    xmlrec, max_lvl, num = recursINDX(max_lvl, num, lvl + 1,
                            e['child1'], e['childn'] + 1)
                    xml += xmlrec
                # close entry
                xml += indent + '</navPoint>\n'
            return xml, max_lvl, num

        body, max_lvl, num = recursINDX()
        header = ncx_header % (lang, ident, max_lvl + 1, title)
        ncx =  header + body + ncx_footer
        if not len(indx_data) == num:
            print("Warning: different number of entries in NCX", len(indx_data), num)
        return ncx

    def writeK8NCX(self, ncx_data, metadata):
        # build the xml
        self.isNCX = True
        print("Write K8 ncx")
        xml = self.buildK8NCX(ncx_data, metadata['Title'][0], metadata['UniqueID'][0], metadata.get('Language')[0])
        bname = 'toc.ncx'
        ncxname = os.path.join(self.files.k8oebps,bname)
        with open(pathof(ncxname), 'wb') as f:
            f.write(xml.encode('utf-8'))
