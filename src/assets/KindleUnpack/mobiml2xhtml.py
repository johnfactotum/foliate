#! /usr/bin/python
# vim:ts=4:sw=4:softtabstop=4:smarttab:expandtab


# this program works in concert with the output from KindleUnpack

'''
Convert from Mobi ML to XHTML
'''

import os
import sys
import re

SPECIAL_HANDLING_TAGS = {
    '?xml'     : ('xmlheader', -1),
    '!--'      : ('comment', -3),
    '!DOCTYPE' : ('doctype', -1),
}

SPECIAL_HANDLING_TYPES = ['xmlheader', 'doctype', 'comment']

SELF_CLOSING_TAGS = ['br' , 'hr', 'input', 'img', 'image', 'meta', 'spacer', 'link', 'frame', 'base', 'col', 'reference']

class MobiMLConverter(object):

    PAGE_BREAK_PAT = re.compile(r'(<[/]{0,1}mbp:pagebreak\s*[/]{0,1}>)+', re.IGNORECASE)
    IMAGE_ATTRS = ('lowrecindex', 'recindex', 'hirecindex')

    def __init__(self, filename):
        self.base_css_rules =  'blockquote { margin: 0em 0em 0em 1.25em }\n'
        self.base_css_rules += 'p { margin: 0em }\n'
        self.base_css_rules += '.bold { font-weight: bold }\n'
        self.base_css_rules += '.italic { font-style: italic }\n'
        self.base_css_rules += '.mbp_pagebreak { page-break-after: always; margin: 0; display: block }\n'
        self.tag_css_rules = {}
        self.tag_css_rule_cnt = 0
        self.path = []
        self.filename = filename
        self.wipml = open(self.filename, 'rb').read()
        self.pos = 0
        self.opfname = self.filename.rsplit('.',1)[0] + '.opf'
        self.opos = 0
        self.meta = ''
        self.cssname = os.path.join(os.path.dirname(self.filename),'styles.css')
        self.current_font_size = 3
        self.font_history = []

    def cleanup_html(self):
        self.wipml = re.sub(r'<div height="0(pt|px|ex|em|%){0,1}"></div>', '', self.wipml)
        self.wipml = self.wipml.replace('\r\n', '\n')
        self.wipml = self.wipml.replace('> <', '>\n<')
        self.wipml = self.wipml.replace('<mbp: ', '<mbp:')
        # self.wipml = re.sub(r'<?xml[^>]*>', '', self.wipml)
        self.wipml = self.wipml.replace('<br></br>','<br/>')

    def replace_page_breaks(self):
        self.wipml = self.PAGE_BREAK_PAT.sub(
            '<div class="mbp_pagebreak" />',
            self.wipml)

    # parse leading text of ml and tag
    def parseml(self):
        p = self.pos
        if p >= len(self.wipml):
            return None
        if self.wipml[p] != '<':
            res = self.wipml.find('<',p)
            if res == -1 :
                res = len(self.wipml)
            self.pos = res
            return self.wipml[p:res], None
        # handle comment as a special case to deal with multi-line comments
        if self.wipml[p:p+4] == '<!--':
            te = self.wipml.find('-->',p+1)
            if te != -1:
                te = te+2
        else :
            te = self.wipml.find('>',p+1)
            ntb = self.wipml.find('<',p+1)
            if ntb != -1 and ntb < te:
                self.pos = ntb
                return self.wipml[p:ntb], None
        self.pos = te + 1
        return None, self.wipml[p:te+1]

    # parses string version of tag to identify its name,
    # its type 'begin', 'end' or 'single',
    # plus build a hashtable of its attributes
    # code is written to handle the possiblity of very poor formating
    def parsetag(self, s):
        p = 1
        # get the tag name
        tname = None
        ttype = None
        tattr = {}
        while s[p:p+1] == ' ' :
            p += 1
        if s[p:p+1] == '/':
            ttype = 'end'
            p += 1
            while s[p:p+1] == ' ' :
                p += 1
        b = p
        while s[p:p+1] not in ('>', '/', ' ', '"', "'", "\r", "\n") :
            p += 1
        tname=s[b:p].lower()
        if tname == '!doctype':
            tname = '!DOCTYPE'
        # special cases
        if tname in SPECIAL_HANDLING_TAGS.keys():
            ttype, backstep = SPECIAL_HANDLING_TAGS[tname]
            tattr['special'] = s[p:backstep]
        if ttype is None:
            # parse any attributes
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
                    while s[p:p+1] not in ('"', "'") :
                        p += 1
                    val = s[b:p]
                    p += 1
                else :
                    b = p
                    while s[p:p+1] not in ('>', '/', ' ') :
                        p += 1
                    val = s[b:p]
                tattr[aname] = val
        # label beginning and single tags
        if ttype is None:
            ttype = 'begin'
            if s.find(' /',p) >= 0:
                ttype = 'single_ext'
            elif s.find('/',p) >= 0:
                ttype = 'single'
        return ttype, tname, tattr

    # main routine to convert from mobi markup language to html
    def processml(self):

        # are these really needed
        html_done = False
        head_done = False
        body_done = False

        skip = False

        htmlstr = ''
        self.replace_page_breaks()
        self.cleanup_html()

        # now parse the cleaned up ml into standard xhtml
        while True:

            r = self.parseml()
            if not r:
                break

            text, tag = r

            if text:
                if not skip:
                    htmlstr += text

            if tag:
                ttype, tname, tattr = self.parsetag(tag)

                # If we run into a DTD or xml declarations inside the body ... bail.
                if tname in SPECIAL_HANDLING_TAGS.keys() and tname != 'comment' and body_done:
                    htmlstr += '\n</body></html>'
                    break

                # make sure self-closing tags actually self-close
                if ttype == 'begin' and tname in SELF_CLOSING_TAGS:
                    ttype = 'single'

                # make sure any end tags of self-closing tags are discarded
                if ttype == 'end' and tname in SELF_CLOSING_TAGS:
                    continue

                # remove embedded guide and refernces from old mobis
                if tname in ('guide', 'ncx', 'reference') and ttype in ('begin', 'single', 'single_ext'):
                    tname = 'removeme:{0}'.format(tname)
                    tattr = None
                if tname in ('guide', 'ncx', 'reference', 'font', 'span') and ttype == 'end':
                    if self.path[-1] == 'removeme:{0}'.format(tname):
                        tname = 'removeme:{0}'.format(tname)
                        tattr = None

                # Get rid of font tags that only have a color attribute.
                if tname == 'font' and ttype in ('begin', 'single', 'single_ext'):
                    if 'color' in tattr.keys() and len(tattr.keys()) == 1:
                        tname = 'removeme:{0}'.format(tname)
                        tattr = None

                # Get rid of empty spans in the markup.
                if tname == 'span' and ttype in ('begin', 'single', 'single_ext') and not len(tattr):
                    tname = 'removeme:{0}'.format(tname)

                # need to handle fonts outside of the normal methods
                # so fonts tags won't be added to the self.path since we keep track
                # of font tags separately with self.font_history
                if tname == 'font' and ttype == 'begin':
                    # check for nested font start tags
                    if len(self.font_history) > 0 :
                        # inject a font end tag
                        taginfo = ('end', 'font', None)
                        htmlstr += self.processtag(taginfo)
                    self.font_history.append((ttype, tname, tattr))
                    # handle the current font start tag
                    taginfo = (ttype, tname, tattr)
                    htmlstr += self.processtag(taginfo)
                    continue

                # check for nested font tags and unnest them
                if tname == 'font' and ttype == 'end':
                    self.font_history.pop()
                    # handle this font end tag
                    taginfo = ('end', 'font', None)
                    htmlstr += self.processtag(taginfo)
                    # check if we were nested
                    if len(self.font_history) > 0:
                        # inject a copy of the most recent font start tag from history
                        taginfo = self.font_history[-1]
                        htmlstr += self.processtag(taginfo)
                    continue

                # keep track of nesting path
                if ttype == 'begin':
                    self.path.append(tname)
                elif ttype == 'end':
                    if tname != self.path[-1]:
                        print ('improper nesting: ', self.path, tname, ttype)
                        if tname not in self.path:
                            # handle case of end tag with no beginning by injecting empty begin tag
                            taginfo = ('begin', tname, None)
                            htmlstr += self.processtag(taginfo)
                            print "     - fixed by injecting empty start tag ", tname
                            self.path.append(tname)
                        elif len(self.path) >  1 and tname == self.path[-2]:
                            # handle case of dangling missing end
                            taginfo = ('end', self.path[-1], None)
                            htmlstr += self.processtag(taginfo)
                            print "     - fixed by injecting end tag ", self.path[-1]
                            self.path.pop()
                    self.path.pop()

                if tname == 'removeme:{0}'.format(tname):
                    if ttype in ('begin', 'single', 'single_ext'):
                        skip = True
                    else:
                        skip = False
                else:
                    taginfo = (ttype, tname, tattr)
                    htmlstr += self.processtag(taginfo)

                # handle potential issue of multiple html, head, and body sections
                if tname == 'html' and ttype == 'begin' and not html_done:
                    htmlstr += '\n'
                    html_done = True

                if tname == 'head' and ttype == 'begin' and not head_done:
                    htmlstr += '\n'
                    # also add in metadata and style link tags
                    htmlstr += self.meta
                    htmlstr += '<link href="styles.css" rel="stylesheet" type="text/css" />\n'
                    head_done = True

                if tname == 'body' and ttype == 'begin' and not body_done:
                    htmlstr += '\n'
                    body_done = True

        # handle issue of possibly missing html, head, and body tags
        # I have not seen this but the original did something like this so ...
        if not body_done:
            htmlstr = '<body>\n' + htmlstr + '</body>\n'
        if not head_done:
            headstr = '<head>\n'
            headstr += self.meta
            headstr += '<link href="styles.css" rel="stylesheet" type="text/css" />\n'
            headstr += '</head>\n'
            htmlstr = headstr + htmlstr
        if not html_done:
            htmlstr = '<html>\n' + htmlstr + '</html>\n'

        # finally add DOCTYPE info
        htmlstr = '<?xml version="1.0"?>\n<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">\n' + htmlstr

        css = self.base_css_rules
        for cls, rule in self.tag_css_rules.items():
            css += '.%s { %s }\n' % (cls, rule)

        return (htmlstr, css, self.cssname)

    def ensure_unit(self, raw, unit='px'):
        if re.search(r'\d+$', raw) is not None:
            raw += unit
        return raw

    # flatten possibly modified tag back to string
    def taginfo_tostring(self, taginfo):
        (ttype, tname, tattr) = taginfo
        if ttype is None or tname is None:
            return ''
        if ttype == 'end':
            return '</%s>' % tname
        if ttype in SPECIAL_HANDLING_TYPES and tattr is not None and 'special' in tattr.keys():
            info = tattr['special']
            if ttype == 'comment':
                return '<%s %s-->' % tname, info
            else:
                return '<%s %s>' % tname, info
        res = []
        res.append('<%s' % tname)
        if tattr is not None:
            for key in tattr.keys():
                res.append(' %s="%s"' % (key, tattr[key]))
        if ttype == 'single':
            res.append('/>')
        elif ttype == 'single_ext':
            res.append(' />')
        else :
            res.append('>')
        return "".join(res)

    # routines to convert from mobi ml tags atributes to xhtml attributes and styles
    def processtag(self, taginfo):
        # Converting mobi font sizes to numerics
        size_map = {
            'xx-small': '1',
            'x-small': '2',
            'small': '3',
            'medium': '4',
            'large': '5',
            'x-large': '6',
            'xx-large': '7',
            }

        size_to_em_map = {
            '1': '.65em',
            '2': '.75em',
            '3': '1em',
            '4': '1.125em',
            '5': '1.25em',
            '6': '1.5em',
            '7': '2em',
            }

        # current tag to work on
        (ttype, tname, tattr) = taginfo
        if not tattr:
            tattr = {}

        styles = []

        if tname is None or tname.startswith('removeme'):
            return ''

        # have not seen an example of this yet so keep it here to be safe
        # until this is better understood
        if tname in ('country-region', 'place', 'placetype', 'placename',
                'state', 'city', 'street', 'address', 'content'):
            tname = 'div' if tname == 'content' else 'span'
            for key in tattr.keys():
                tattr.pop(key)

        # handle general case of style, height, width, bgcolor in any tag
        if 'style' in tattr.keys():
            style = tattr.pop('style').strip()
            if style:
                styles.append(style)

        if 'align' in tattr.keys():
            align = tattr.pop('align').strip()
            if align:
                if tname in ('table', 'td', 'tr'):
                    pass
                else:
                    styles.append('text-align: %s' % align)

        if 'height' in tattr.keys():
            height = tattr.pop('height').strip()
            if height and '<' not in height and '>' not in height and re.search(r'\d+', height):
                if tname in ('table', 'td', 'tr'):
                    pass
                elif tname == 'img':
                    tattr['height'] = height
                else:
                    styles.append('margin-top: %s' % self.ensure_unit(height))

        if 'width' in tattr.keys():
            width = tattr.pop('width').strip()
            if width and re.search(r'\d+', width):
                if tname in ('table', 'td', 'tr'):
                    pass
                elif tname == 'img':
                    tattr['width'] =  width
                else:
                    styles.append('text-indent: %s' % self.ensure_unit(width))
                    if width.startswith('-'):
                        styles.append('margin-left: %s' % self.ensure_unit(width[1:]))

        if 'bgcolor' in tattr.keys():
            # no proprietary html allowed
            if tname == 'div':
                del tattr['bgcolor']

        elif tname == 'font':
            # Change font tags to span tags
            tname = 'span'
            if ttype in ('begin', 'single', 'single_ext'):
                # move the face attribute to css font-family
                if 'face' in tattr.keys():
                    face = tattr.pop('face').strip()
                    styles.append('font-family: "%s"' % face)

                    # Monitor the constantly changing font sizes, change them to ems and move
                    # them to css. The following will work for 'flat' font tags, but nested font tags
                    # will cause things to go wonky. Need to revert to the parent font tag's size
                    # when a closing tag is encountered.
                if 'size' in tattr.keys():
                    sz = tattr.pop('size').strip().lower()
                    try:
                        float(sz)
                    except ValueError:
                        if sz in size_map.keys():
                            sz = size_map[sz]
                    else:
                        if sz.startswith('-') or sz.startswith('+'):
                            sz = self.current_font_size + float(sz)
                            if sz > 7:
                                sz = 7
                            elif sz < 1:
                                sz = 1
                            sz = str(int(sz))
                    styles.append('font-size: %s' % size_to_em_map[sz])
                    self.current_font_size = int(sz)

        elif tname == 'img':
            for attr in ('width', 'height'):
                if attr in tattr:
                    val = tattr[attr]
                    if val.lower().endswith('em'):
                        try:
                            nval = float(val[:-2])
                            nval *= 16 * (168.451/72)  # Assume this was set using the Kindle profile
                            tattr[attr] = "%dpx"%int(nval)
                        except:
                            del tattr[attr]
                    elif val.lower().endswith('%'):
                        del tattr[attr]

        # convert the anchor tags
        if 'filepos-id' in tattr:
            tattr['id'] = tattr.pop('filepos-id')
            if 'name' in tattr and tattr['name'] != tattr['id']:
                tattr['name'] = tattr['id']

        if 'filepos' in tattr:
            filepos = tattr.pop('filepos')
            try:
                tattr['href'] = "#filepos%d" % int(filepos)
            except ValueError:
                pass

        if styles:
            ncls = None
            rule = '; '.join(styles)
            for sel, srule in self.tag_css_rules.items():
                if srule == rule:
                    ncls = sel
                    break
            if ncls is None:
                self.tag_css_rule_cnt += 1
                ncls = 'rule_%d' % self.tag_css_rule_cnt
                self.tag_css_rules[ncls] = rule
            cls = tattr.get('class', '')
            cls = cls + (' ' if cls else '') + ncls
            tattr['class'] = cls

        # convert updated tag back to string representation
        if len(tattr) == 0:
            tattr = None
        taginfo = (ttype, tname, tattr)
        return self.taginfo_tostring(taginfo)

''' main only left in for testing outside of plugin '''

def main(argv=sys.argv):
    if len(argv) != 2:
        return 1
    else:
        infile = argv[1]

    try:
        print 'Converting Mobi Markup Language to XHTML'
        mlc = MobiMLConverter(infile)
        print 'Processing ...'
        htmlstr, css, cssname = mlc.processml()
        outname = infile.rsplit('.',1)[0] + '_converted.html'
        file(outname, 'wb').write(htmlstr)
        file(cssname, 'wb').write(css)
        print 'Completed'
        print 'XHTML version of book can be found at: ' + outname

    except ValueError, e:
        print "Error: %s" % e
        return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
