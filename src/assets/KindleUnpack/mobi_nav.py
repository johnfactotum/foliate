#!/usr/bin/env python
# -*- coding: utf-8 -*-
# vim:ts=4:sw=4:softtabstop=4:smarttab:expandtab

from __future__ import unicode_literals, division, absolute_import, print_function

from .compatibility_utils import unicode_str
import os
from .unipath import pathof

import re
# note: re requites the pattern to be the exact same type as the data to be searched in python3
# but u"" is not allowed for the pattern itself only b""

DEBUG_NAV = False

FORCE_DEFAULT_TITLE = False
""" Set to True to force to use the default title. """

NAVIGATION_FINENAME = 'nav.xhtml'
""" The name for the navigation document. """

DEFAULT_TITLE = 'Navigation'
""" The default title for the navigation document. """

class NAVProcessor(object):

    def __init__(self, files):
        self.files = files
        self.navname = NAVIGATION_FINENAME

    def buildLandmarks(self, guidetext):
        header = ''
        header += '  <nav epub:type="landmarks" id="landmarks" hidden="">\n'
        header += '    <h2>Guide</h2>\n'
        header += '    <ol>\n'
        element = '      <li><a epub:type="{:s}" href="{:s}">{:s}</a></li>\n'
        footer = ''
        footer += '    </ol>\n'
        footer += '  </nav>\n'

        type_map = {
            'cover' : 'cover',
            'title-page' : 'title-page',
            # ?: 'frontmatter',
            'text' : 'bodymatter',
            # ?: 'backmatter',
            'toc' : 'toc',
            'loi' : 'loi',
            'lot' : 'lot',
            'preface' : 'preface',
            'bibliography' : 'bibliography',
            'index' : 'index',
            'glossary' : 'glossary',
            'acknowledgements' : 'acknowledgements',
            'colophon' : None,
            'copyright-page' : None,
            'dedication' : None,
            'epigraph' : None,
            'foreword' : None,
            'notes' : None
            }

        re_type = re.compile(r'\s+type\s*=\s*"(.*?)"', re.I)
        re_title = re.compile(r'\s+title\s*=\s*"(.*?)"', re.I)
        re_link = re.compile(r'\s+href\s*=\s*"(.*?)"', re.I)
        dir_ = os.path.relpath(self.files.k8text, self.files.k8oebps).replace('\\', '/')

        data = ''
        references = re.findall(r'<reference\s+.*?>', unicode_str(guidetext), re.I)
        for reference in references:
            mo_type = re_type.search(reference)
            mo_title = re_title.search(reference)
            mo_link = re_link.search(reference)
            if mo_type is not None:
                type_ = type_map.get(mo_type.group(1), None)
            else:
                type_ = None
            if mo_title is not None:
                title = mo_title.group(1)
            else:
                title = None
            if mo_link is not None:
                link = mo_link.group(1)
            else:
                link = None

            if type_ is not None and title is not None and link is not None:
                link = os.path.relpath(link, dir_).replace('\\', '/')
                data += element.format(type_, link, title)
        if len(data) > 0:
            return header + data + footer
        else:
            return ''

    def buildTOC(self, indx_data):
        header = ''
        header += '  <nav epub:type="toc" id="toc">\n'
        header += '    <h1>Table of contents</h1>\n'
        footer = '  </nav>\n'

        # recursive part
        def recursINDX(max_lvl=0, num=0, lvl=0, start=-1, end=-1):
            if start>len(indx_data) or end>len(indx_data):
                print("Warning (in buildTOC): missing INDX child entries", start, end, len(indx_data))
                return ''
            if DEBUG_NAV:
                print("recursINDX (in buildTOC) lvl %d from %d to %d" % (lvl, start, end))
            xhtml = ''
            if start <= 0:
                start = 0
            if end <= 0:
                end = len(indx_data)
            if lvl > max_lvl:
                max_lvl = lvl

            indent1 = '  ' * (2 + lvl * 2)
            indent2 = '  ' * (3 + lvl * 2)
            xhtml += indent1 + '<ol>\n'
            for i in range(start, end):
                e = indx_data[i]
                htmlfile = e['filename']
                desttag = e['idtag']
                text = e['text']
                if not e['hlvl'] == lvl:
                    continue
                num += 1
                if desttag == '':
                    link = htmlfile
                else:
                    link = '{:s}#{:s}'.format(htmlfile, desttag)
                xhtml += indent2 + '<li>'
                entry = '<a href="{:}">{:s}</a>'.format(link, text)
                xhtml += entry
                # recurs
                if e['child1'] >= 0:
                    xhtml += '\n'
                    xhtmlrec, max_lvl, num = recursINDX(max_lvl, num, lvl + 1,
                            e['child1'], e['childn'] + 1)
                    xhtml += xhtmlrec
                    xhtml += indent2
                # close entry
                xhtml += '</li>\n'
            xhtml += indent1 + '</ol>\n'
            return xhtml, max_lvl, num

        data, max_lvl, num = recursINDX()
        if not len(indx_data) == num:
            print("Warning (in buildTOC): different number of entries in NCX", len(indx_data), num)
        return header + data + footer

    def buildNAV(self, ncx_data, guidetext, title, lang):
        print("Building Navigation Document.")
        if FORCE_DEFAULT_TITLE:
            title = DEFAULT_TITLE
        nav_header = ''
        nav_header += '<?xml version="1.0" encoding="utf-8"?>\n<!DOCTYPE html>'
        nav_header += '<html xmlns="http://www.w3.org/1999/xhtml"'
        nav_header += ' xmlns:epub="http://www.idpf.org/2007/ops"'
        nav_header += ' lang="{0:s}" xml:lang="{0:s}">\n'.format(lang)
        nav_header += '<head>\n<title>{:s}</title>\n'.format(title)
        nav_header += '<meta charset="UTF-8" />\n'
        nav_header += '<style type="text/css">\n'
        nav_header += 'nav#landmarks { display:none; }\n'
        nav_header += '</style>\n</head>\n<body>\n'
        nav_footer = '</body>\n</html>\n'

        landmarks =  self.buildLandmarks(guidetext)
        toc = self.buildTOC(ncx_data)

        data = nav_header
        data += landmarks
        data += toc
        data += nav_footer
        return data

    def getNAVName(self):
        return self.navname

    def writeNAV(self, ncx_data, guidetext, metadata):
        # build the xhtml
        # print("Write Navigation Document.")
        xhtml = self.buildNAV(ncx_data, guidetext, metadata.get('Title')[0], metadata.get('Language')[0])
        fname = os.path.join(self.files.k8text, self.navname)
        with open(pathof(fname), 'wb') as f:
            f.write(xhtml.encode('utf-8'))
