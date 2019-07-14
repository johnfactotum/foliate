#!/usr/bin/env python
# -*- coding: utf-8 -*-
# vim:ts=4:sw=4:softtabstop=4:smarttab:expandtab

from __future__ import unicode_literals, division, absolute_import, print_function

DEBUG_USE_ORDERED_DICTIONARY = False  # OrderedDict is supoorted >= python 2.7.
""" set to True to use OrderedDict for K8RESCProcessor.parsetag.tattr."""

if DEBUG_USE_ORDERED_DICTIONARY:
    from collections import OrderedDict as dict_
else:
    dict_ = dict

from .compatibility_utils import unicode_str

from .mobi_utils import fromBase32

_OPF_PARENT_TAGS = ['xml', 'package', 'metadata', 'dc-metadata',
                    'x-metadata', 'manifest', 'spine', 'tours', 'guide']

class K8RESCProcessor(object):

    def __init__(self, data, debug=False):
        self._debug = debug
        self.resc = None
        self.opos = 0
        self.extrameta = []
        self.cover_name = None
        self.spine_idrefs = {}
        self.spine_order = []
        self.spine_pageattributes = {}
        self.spine_ppd = None
        # need3 indicate the book has fields which require epub3.
        # but the estimation of the source epub version from the fields is difficult.
        self.need3 = False
        self.package_ver = None
        self.extra_metadata = []
        self.refines_metadata = []
        self.extra_attributes = []
        # get header
        start_pos = data.find(b'<')
        self.resc_header = data[:start_pos]
        # get resc data length
        start = self.resc_header.find(b'=') + 1
        end = self.resc_header.find(b'&', start)
        resc_size = 0
        if end > 0:
            resc_size = fromBase32(self.resc_header[start:end])
        resc_rawbytes = len(data) - start_pos
        if resc_rawbytes == resc_size:
            self.resc_length = resc_size
        else:
            # Most RESC has a nul string at its tail but some do not.
            end_pos = data.find(b'\x00', start_pos)
            if end_pos < 0:
                self.resc_length = resc_rawbytes
            else:
                self.resc_length = end_pos - start_pos
        if self.resc_length != resc_size:
            print("Warning: RESC section length({:d}bytes) does not match its size({:d}bytes).".format(self.resc_length, resc_size))
        # now parse RESC after converting it to unicode from utf-8
        self.resc = unicode_str(data[start_pos:start_pos+self.resc_length])
        self.parseData()

    def prepend_to_spine(self, key, idref, linear, properties):
        self.spine_order = [key] + self.spine_order
        self.spine_idrefs[key] = idref
        attributes = {}
        if linear is not None:
            attributes['linear'] = linear
        if properties is not None:
            attributes['properties'] = properties
        self.spine_pageattributes[key] = attributes

    # RESC tag iterator
    def resc_tag_iter(self):
        tcontent = last_tattr = None
        prefix = ['']
        while True:
            text, tag = self.parseresc()
            if text is None and tag is None:
                break
            if text is not None:
                tcontent = text.rstrip(' \r\n')
            else:  # we have a tag
                ttype, tname, tattr = self.parsetag(tag)
                if ttype == 'begin':
                    tcontent = None
                    prefix.append(tname + '.')
                    if tname in _OPF_PARENT_TAGS:
                        yield ''.join(prefix), tname, tattr, tcontent
                    else:
                        last_tattr = tattr
                else:  # single or end
                    if ttype == 'end':
                        prefix.pop()
                        tattr = last_tattr
                        last_tattr = None
                        if tname in _OPF_PARENT_TAGS:
                            tname += '-end'
                    yield ''.join(prefix), tname, tattr, tcontent
                    tcontent = None

    # now parse the RESC to extract spine and extra metadata info
    def parseData(self):
        for prefix, tname, tattr, tcontent in self.resc_tag_iter():
            if self._debug:
                print("   Parsing RESC: ", prefix, tname, tattr, tcontent)
            if tname == 'package':
                self.package_ver = tattr.get('version', '2.0')
                package_prefix = tattr.get('prefix','')
                if self.package_ver.startswith('3') or package_prefix.startswith('rendition'):
                    self.need3 = True
            if tname == 'spine':
                self.spine_ppd = tattr.get('page-progession-direction', None)
                if self.spine_ppd is not None and self.spine_ppd == 'rtl':
                    self.need3 = True
            if tname == 'itemref':
                skelid = tattr.pop('skelid', None)
                if skelid is None and len(self.spine_order) == 0:
                    # assume it was removed initial coverpage
                    skelid = 'coverpage'
                    tattr['linear'] = 'no'
                self.spine_order.append(skelid)
                idref = tattr.pop('idref', None)
                if idref is not None:
                    idref = 'x_' + idref
                self.spine_idrefs[skelid] = idref
                if 'id' in tattr:
                    del tattr['id']
                # tattr["id"] = 'x_' + tattr["id"]
                if 'properties' in tattr:
                    self.need3 = True
                self.spine_pageattributes[skelid] = tattr
            if tname == 'meta' or tname.startswith('dc:'):
                if 'refines' in tattr or 'property' in tattr:
                    self.need3 = True
                if tattr.get('name','') == 'cover':
                    cover_name = tattr.get('content',None)
                    if cover_name is not None:
                        cover_name = 'x_' + cover_name
                    self.cover_name = cover_name
                else:
                    self.extrameta.append([tname, tattr, tcontent])

    # parse and return either leading text or the next tag
    def parseresc(self):
        p = self.opos
        if p >= len(self.resc):
            return None, None
        if self.resc[p] != '<':
            res = self.resc.find('<',p)
            if res == -1 :
                res = len(self.resc)
            self.opos = res
            return self.resc[p:res], None
        # handle comment as a special case
        if self.resc[p:p+4] == '<!--':
            te = self.resc.find('-->',p+1)
            if te != -1:
                te = te+2
        else:
            te = self.resc.find('>',p+1)
            ntb = self.resc.find('<',p+1)
            if ntb != -1 and ntb < te:
                self.opos = ntb
                return self.resc[p:ntb], None
        self.opos = te + 1
        return None, self.resc[p:te+1]

    # parses tag to identify:  [tname, ttype, tattr]
    #    tname: tag name
    #    ttype: tag type ('begin', 'end' or 'single');
    #    tattr: dictionary of tag atributes
    def parsetag(self, s):
        p = 1
        tname = None
        ttype = None
        tattr = dict_()
        while s[p:p+1] == ' ' :
            p += 1
        if s[p:p+1] == '/':
            ttype = 'end'
            p += 1
            while s[p:p+1] == ' ' :
                p += 1
        b = p
        while s[p:p+1] not in ('>', '/', ' ', '"', "'",'\r','\n') :
            p += 1
        tname=s[b:p].lower()
        # some special cases
        if tname == '?xml':
            tname = 'xml'
        if tname == '!--':
            ttype = 'single'
            comment = s[p:-3].strip()
            tattr['comment'] = comment
        if ttype is None:
            # parse any attributes of begin or single tags
            while s.find('=',p) != -1 :
                while s[p:p+1] == ' ' :
                    p += 1
                b = p
                while s[p:p+1] != '=' :
                    p += 1
                aname = s[b:p].lower()
                aname = aname.rstrip(' ')
                p += 1
                while s[p:p+1] == ' ' :
                    p += 1
                if s[p:p+1] in ('"', "'") :
                    p = p + 1
                    b = p
                    while s[p:p+1] not in ('"', "'"):
                        p += 1
                    val = s[b:p]
                    p += 1
                else :
                    b = p
                    while s[p:p+1] not in ('>', '/', ' ') :
                        p += 1
                    val = s[b:p]
                tattr[aname] = val
        if ttype is None:
            ttype = 'begin'
            if s.find('/',p) >= 0:
                ttype = 'single'
        return ttype, tname, tattr

    def taginfo_toxml(self, taginfo):
        res = []
        tname, tattr, tcontent = taginfo
        res.append('<' + tname)
        if tattr is not None:
            for key in tattr:
                res.append(' ' + key + '="'+tattr[key]+'"')
        if tcontent is not None:
            res.append('>' + tcontent + '</' + tname + '>\n')
        else:
            res.append('/>\n')
        return "".join(res)

    def hasSpine(self):
        return len(self.spine_order) > 0

    def needEPUB3(self):
        return self.need3

    def hasRefines(self):
        for [tname, tattr, tcontent] in self.extrameta:
            if 'refines' in tattr:
                return True
        return False

    def createMetadata(self, epubver):
        for taginfo in self.extrameta:
            tname, tattr, tcontent = taginfo
            if 'refines' in tattr:
                if epubver == 'F' and 'property' in tattr:
                    attr = ' id="%s" opf:%s="%s"\n' % (tattr['refines'], tattr['property'], tcontent)
                    self.extra_attributes.append(attr)
                else:
                    tag = self.taginfo_toxml(taginfo)
                    self.refines_metadata.append(tag)
            else:
                tag = self.taginfo_toxml(taginfo)
                self.extra_metadata.append(tag)
