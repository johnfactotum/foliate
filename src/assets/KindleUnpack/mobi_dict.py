#!/usr/bin/env python
# -*- coding: utf-8 -*-
# vim:ts=4:sw=4:softtabstop=4:smarttab:expandtab

from __future__ import unicode_literals, division, absolute_import, print_function

from .compatibility_utils import PY2, PY3, utf8_str, bstr, bchr

if PY2:
    range = xrange
    array_format = b'B'
if PY3:
    unichr = chr
    array_format = "B"

import array

import struct
# note:  struct pack, unpack, unpack_from all require bytestring format
# data all the way up to at least python 2.7.5, python 3 okay with bytestring

from .mobi_index import getVariableWidthValue, readTagSection, getTagMap
from .mobi_utils import toHex

DEBUG_DICT = False

class InflectionData(object):

    def __init__(self, infldatas):
        self.infldatas = infldatas
        self.starts = []
        self.counts = []
        for idata in self.infldatas:
            start, = struct.unpack_from(b'>L', idata, 0x14)
            count, = struct.unpack_from(b'>L', idata, 0x18)
            self.starts.append(start)
            self.counts.append(count)

    def lookup(self, lookupvalue):
        i = 0
        rvalue = lookupvalue
        while rvalue >= self.counts[i]:
            rvalue = rvalue - self.counts[i]
            i += 1
            if i == len(self.counts):
                print("Error: Problem with multiple inflections data sections")
                return lookupvalue, self.starts[0], self.counts[0], self.infldatas[0]
        return rvalue, self.starts[i], self.counts[i], self.infldatas[i]

    def offsets(self, value):
        rvalue, start, count, data = self.lookup(value)
        offset, = struct.unpack_from(b'>H', data, start + 4 + (2 * rvalue))
        if rvalue + 1 < count:
            nextOffset, = struct.unpack_from(b'>H',data, start + 4 + (2 * (rvalue + 1)))
        else:
            nextOffset = None
        return offset, nextOffset, data


class dictSupport(object):

    def __init__(self, mh, sect):
        self.mh = mh
        self.header = mh.header
        self.sect = sect
        self.metaOrthIndex = mh.metaOrthIndex
        self.metaInflIndex = mh.metaInflIndex

    def parseHeader(self, data):
        "read INDX header"
        if not data[:4] == b'INDX':
            print("Warning: index section is not INDX")
            return False
        words = (
                'len', 'nul1', 'type', 'gen', 'start', 'count', 'code',
                'lng', 'total', 'ordt', 'ligt', 'nligt', 'nctoc'
        )
        num = len(words)
        values = struct.unpack(bstr('>%dL' % num), data[4:4*(num+1)])
        header = {}
        for n in range(num):
            header[words[n]] = values[n]

        ordt1 = None
        ordt2 = None

        otype, oentries, op1, op2, otagx  = struct.unpack_from(b'>LLLLL',data, 0xa4)
        header['otype'] = otype
        header['oentries'] = oentries

        if DEBUG_DICT:
            print("otype %d, oentries %d, op1 %d, op2 %d, otagx %d" % (otype, oentries, op1, op2, otagx))

        if header['code'] == 0xfdea or oentries > 0:
            # some dictionaries seem to be codepage 65002 (0xFDEA) which seems
            # to be some sort of strange EBCDIC utf-8 or 16 encoded strings
            # So we need to look for them and store them away to process leading text
            # ORDT1 has 1 byte long entries, ORDT2 has 2 byte long entries
            # we only ever seem to use the second but ...
            #
            # if otype = 0, ORDT table uses 16 bit values as offsets into the table
            # if otype = 1, ORDT table uses 8 bit values as offsets inot the table

            assert(data[op1:op1+4] == b'ORDT')
            assert(data[op2:op2+4] == b'ORDT')
            ordt1 = struct.unpack_from(bstr('>%dB' % oentries), data, op1+4)
            ordt2 = struct.unpack_from(bstr('>%dH' % oentries), data, op2+4)

        if DEBUG_DICT:
            print("parsed INDX header:")
            for key in header:
                print(key, "%x" % header[key],)
            print("\n")
        return header, ordt1, ordt2

    def getPositionMap(self):
        sect = self.sect

        positionMap = {}

        metaOrthIndex = self.metaOrthIndex
        metaInflIndex = self.metaInflIndex

        decodeInflection = True
        if metaOrthIndex != 0xFFFFFFFF:
            print("Info: Document contains orthographic index, handle as dictionary")
            if metaInflIndex == 0xFFFFFFFF:
                decodeInflection = False
            else:
                metaInflIndexData = sect.loadSection(metaInflIndex)

                print("\nParsing metaInflIndexData")
                midxhdr, mhordt1, mhordt2 = self.parseHeader(metaInflIndexData)

                metaIndexCount = midxhdr['count']
                idatas = []
                for j in range(metaIndexCount):
                    idatas.append(sect.loadSection(metaInflIndex + 1 + j))
                dinfl = InflectionData(idatas)

                inflNameData = sect.loadSection(metaInflIndex + 1 + metaIndexCount)
                tagSectionStart = midxhdr['len']
                inflectionControlByteCount, inflectionTagTable = readTagSection(tagSectionStart, metaInflIndexData)
                if DEBUG_DICT:
                    print("inflectionTagTable: %s" % inflectionTagTable)
                if self.hasTag(inflectionTagTable, 0x07):
                    print("Error: Dictionary uses obsolete inflection rule scheme which is not yet supported")
                    decodeInflection = False

            data = sect.loadSection(metaOrthIndex)

            print("\nParsing metaOrthIndex")
            idxhdr, hordt1, hordt2 = self.parseHeader(data)

            tagSectionStart = idxhdr['len']
            controlByteCount, tagTable = readTagSection(tagSectionStart, data)
            orthIndexCount = idxhdr['count']
            print("orthIndexCount is", orthIndexCount)
            if DEBUG_DICT:
                print("orthTagTable: %s" % tagTable)
            if hordt2 is not None:
                print("orth entry uses ordt2 lookup table of type ", idxhdr['otype'])
            hasEntryLength = self.hasTag(tagTable, 0x02)
            if not hasEntryLength:
                print("Info: Index doesn't contain entry length tags")

            print("Read dictionary index data")
            for i in range(metaOrthIndex + 1, metaOrthIndex + 1 + orthIndexCount):
                data = sect.loadSection(i)
                hdrinfo, ordt1, ordt2 = self.parseHeader(data)
                idxtPos = hdrinfo['start']
                entryCount = hdrinfo['count']
                idxPositions = []
                for j in range(entryCount):
                    pos, = struct.unpack_from(b'>H', data, idxtPos + 4 + (2 * j))
                    idxPositions.append(pos)
                # The last entry ends before the IDXT tag (but there might be zero fill bytes we need to ignore!)
                idxPositions.append(idxtPos)
                for j in range(entryCount):
                    startPos = idxPositions[j]
                    endPos = idxPositions[j+1]
                    textLength = ord(data[startPos:startPos+1])
                    text = data[startPos+1:startPos+1+textLength]
                    if hordt2 is not None:
                        utext = u""
                        if idxhdr['otype'] == 0:
                            pattern = b'>H'
                            inc = 2
                        else:
                            pattern = b'>B'
                            inc = 1
                        pos = 0
                        while pos < textLength:
                            off, = struct.unpack_from(pattern, text, pos)
                            if off < len(hordt2):
                                utext += unichr(hordt2[off])
                            else:
                                utext += unichr(off)
                            pos += inc
                        text = utext.encode('utf-8')

                    tagMap = getTagMap(controlByteCount, tagTable, data, startPos+1+textLength, endPos)
                    if 0x01 in tagMap:
                        if decodeInflection and 0x2a in tagMap:
                            inflectionGroups = self.getInflectionGroups(text, inflectionControlByteCount, inflectionTagTable,
                                                                        dinfl, inflNameData, tagMap[0x2a])
                        else:
                            inflectionGroups = b''
                        assert len(tagMap[0x01]) == 1
                        entryStartPosition = tagMap[0x01][0]
                        if hasEntryLength:
                            # The idx:entry attribute "scriptable" must be present to create entry length tags.
                            ml = b'<idx:entry scriptable="yes"><idx:orth value="' + text + b'">' + inflectionGroups + b'</idx:orth>'
                            if entryStartPosition in positionMap:
                                positionMap[entryStartPosition] = positionMap[entryStartPosition] + ml
                            else:
                                positionMap[entryStartPosition] = ml
                            assert len(tagMap[0x02]) == 1
                            entryEndPosition = entryStartPosition + tagMap[0x02][0]
                            if entryEndPosition in positionMap:
                                positionMap[entryEndPosition] = b"</idx:entry>" + positionMap[entryEndPosition]
                            else:
                                positionMap[entryEndPosition] = b"</idx:entry>"

                        else:
                            indexTags = b'<idx:entry>\n<idx:orth value="' + text + b'">\n' + inflectionGroups + b'</idx:entry>\n'
                            if entryStartPosition in positionMap:
                                positionMap[entryStartPosition] = positionMap[entryStartPosition] + indexTags
                            else:
                                positionMap[entryStartPosition] = indexTags
        return positionMap

    def hasTag(self, tagTable, tag):
        '''
        Test if tag table contains given tag.

        @param tagTable: The tag table.
        @param tag: The tag to search.
        @return: True if tag table contains given tag; False otherwise.
        '''
        for currentTag, _, _, _ in tagTable:
            if currentTag == tag:
                return True
        return False

    def getInflectionGroups(self, mainEntry, controlByteCount, tagTable, dinfl, inflectionNames, groupList):
        '''
        Create string which contains the inflection groups with inflection rules as mobipocket tags.

        @param mainEntry: The word to inflect.
        @param controlByteCount: The number of control bytes.
        @param tagTable: The tag table.
        @param data: The Inflection data object to properly select the right inflection data section to use
        @param inflectionNames: The inflection rule name data.
        @param groupList: The list of inflection groups to process.
        @return: String with inflection groups and rules or empty string if required tags are not available.
        '''
        result = b""
        for value in groupList:
            offset, nextOffset, data = dinfl.offsets(value)

            # First byte seems to be always 0x00 and must be skipped.
            assert ord(data[offset:offset+1]) == 0x00
            tagMap = getTagMap(controlByteCount, tagTable, data, offset + 1, nextOffset)

            # Make sure that the required tags are available.
            if 0x05 not in tagMap:
                print("Error: Required tag 0x05 not found in tagMap")
                return ""
            if 0x1a not in tagMap:
                print("Error: Required tag 0x1a not found in tagMap")
                return b''

            result += b'<idx:infl>'

            for i in range(len(tagMap[0x05])):

                # Get name of inflection rule.
                value = tagMap[0x05][i]
                consumed, textLength = getVariableWidthValue(inflectionNames, value)
                inflectionName = inflectionNames[value+consumed:value+consumed+textLength]

                # Get and apply inflection rule across possibly multiple inflection data sections
                value = tagMap[0x1a][i]
                rvalue, start, count, data = dinfl.lookup(value)
                offset, = struct.unpack_from(b'>H', data, start + 4 + (2 * rvalue))
                textLength = ord(data[offset:offset+1])
                inflection = self.applyInflectionRule(mainEntry, data, offset+1, offset+1+textLength)
                if inflection is not None:
                    result += b'  <idx:iform name="' + inflectionName + b'" value="' + inflection + b'"/>'

            result += b'</idx:infl>'
        return result

    def applyInflectionRule(self, mainEntry, inflectionRuleData, start, end):
        '''
        Apply inflection rule.

        @param mainEntry: The word to inflect.
        @param inflectionRuleData: The inflection rules.
        @param start: The start position of the inflection rule to use.
        @param end: The end position of the inflection rule to use.
        @return: The string with the inflected word or None if an error occurs.
        '''
        mode = -1
        byteArray = array.array(array_format, mainEntry)
        position = len(byteArray)
        for charOffset in range(start, end):
            char = inflectionRuleData[charOffset:charOffset+1]
            abyte = ord(char)
            if abyte >= 0x0a and abyte <= 0x13:
                # Move cursor backwards
                offset = abyte - 0x0a
                if mode not in [0x02, 0x03]:
                    mode = 0x02
                    position = len(byteArray)
                position -= offset
            elif abyte > 0x13:
                if mode == -1:
                    print("Error: Unexpected first byte %i of inflection rule" % abyte)
                    return None
                elif position == -1:
                    print("Error: Unexpected first byte %i of inflection rule" % abyte)
                    return None
                else:
                    if mode == 0x01:
                        # Insert at word start
                        byteArray.insert(position, abyte)
                        position += 1
                    elif mode == 0x02:
                        # Insert at word end
                        byteArray.insert(position, abyte)
                    elif mode == 0x03:
                        # Delete at word end
                        position -= 1
                        deleted = byteArray.pop(position)
                        if bchr(deleted) != char:
                            if DEBUG_DICT:
                                print("0x03: %s %s %s %s" % (mainEntry, toHex(inflectionRuleData[start:end]), char, bchr(deleted)))
                            print("Error: Delete operation of inflection rule failed")
                            return None
                    elif mode == 0x04:
                        # Delete at word start
                        deleted = byteArray.pop(position)
                        if bchr(deleted) != char:
                            if DEBUG_DICT:
                                print("0x03: %s %s %s %s" % (mainEntry, toHex(inflectionRuleData[start:end]), char, bchr(deleted)))
                            print("Error: Delete operation of inflection rule failed")
                            return None
                    else:
                        print("Error: Inflection rule mode %x is not implemented" % mode)
                        return None
            elif abyte == 0x01:
                # Insert at word start
                if mode not in [0x01, 0x04]:
                    position = 0
                mode = abyte
            elif abyte == 0x02:
                # Insert at word end
                if mode not in [0x02, 0x03]:
                    position = len(byteArray)
                mode = abyte
            elif abyte == 0x03:
                # Delete at word end
                if mode not in [0x02, 0x03]:
                    position = len(byteArray)
                mode = abyte
            elif abyte == 0x04:
                # Delete at word start
                if mode not in [0x01, 0x04]:
                    position = 0
                # Delete at word start
                mode = abyte
            else:
                print("Error: Inflection rule mode %x is not implemented" % abyte)
                return None
        return utf8_str(byteArray.tostring())
