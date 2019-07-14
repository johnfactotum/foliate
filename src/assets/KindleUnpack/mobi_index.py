#!/usr/bin/env python
# -*- coding: utf-8 -*-
# vim:ts=4:sw=4:softtabstop=4:smarttab:expandtab

from __future__ import unicode_literals, division, absolute_import, print_function

from .compatibility_utils import PY2, bchr, bstr, bord
if PY2:
    range = xrange

import struct
# note:  struct pack, unpack, unpack_from all require bytestring format
# data all the way up to at least python 2.7.5, python 3 okay with bytestring

from .mobi_utils import toHex

class MobiIndex:

    def __init__(self, sect, DEBUG=False):
        self.sect = sect
        self.DEBUG = DEBUG

    def getIndexData(self, idx, label="Unknown"):
        sect = self.sect
        outtbl = []
        ctoc_text = {}
        if idx != 0xffffffff:
            sect.setsectiondescription(idx,"{0} Main INDX section".format(label))
            data = sect.loadSection(idx)
            idxhdr, hordt1, hordt2 = self.parseINDXHeader(data)
            IndexCount = idxhdr['count']
            # handle the case of multiple sections used for CTOC
            rec_off = 0
            off = idx + IndexCount + 1
            for j in range(idxhdr['nctoc']):
                cdata = sect.loadSection(off + j)
                sect.setsectiondescription(off+j, label + ' CTOC Data ' + str(j))
                ctocdict = self.readCTOC(cdata)
                for k in ctocdict:
                    ctoc_text[k + rec_off] = ctocdict[k]
                rec_off += 0x10000
            tagSectionStart = idxhdr['len']
            controlByteCount, tagTable = readTagSection(tagSectionStart, data)
            if self.DEBUG:
                print("ControlByteCount is", controlByteCount)
                print("IndexCount is", IndexCount)
                print("TagTable: %s" % tagTable)
            for i in range(idx + 1, idx + 1 + IndexCount):
                sect.setsectiondescription(i,"{0} Extra {1:d} INDX section".format(label,i-idx))
                data = sect.loadSection(i)
                hdrinfo, ordt1, ordt2 = self.parseINDXHeader(data)
                idxtPos = hdrinfo['start']
                entryCount = hdrinfo['count']
                if self.DEBUG:
                    print(idxtPos, entryCount)
                # loop through to build up the IDXT position starts
                idxPositions = []
                for j in range(entryCount):
                    pos, = struct.unpack_from(b'>H', data, idxtPos + 4 + (2 * j))
                    idxPositions.append(pos)
                # The last entry ends before the IDXT tag (but there might be zero fill bytes we need to ignore!)
                idxPositions.append(idxtPos)
                # for each entry in the IDXT build up the tagMap and any associated text
                for j in range(entryCount):
                    startPos = idxPositions[j]
                    endPos = idxPositions[j+1]
                    textLength = ord(data[startPos:startPos+1])
                    text = data[startPos+1:startPos+1+textLength]
                    if hordt2 is not None:
                        text = b''.join(bchr(hordt2[bord(x)]) for x in text)
                    tagMap = getTagMap(controlByteCount, tagTable, data, startPos+1+textLength, endPos)
                    outtbl.append([text, tagMap])
                    if self.DEBUG:
                        print(tagMap)
                        print(text)
        return outtbl, ctoc_text

    def parseINDXHeader(self, data):
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

        ocnt, oentries, op1, op2, otagx  = struct.unpack_from(b'>LLLLL',data, 0xa4)
        if header['code'] == 0xfdea or ocnt != 0 or oentries > 0:
            # horribly hacked up ESP (sample) mobi books use two ORDT sections but never specify
            # them in the proper place in the header.  They seem to be codepage 65002 which seems
            # to be some sort of strange EBCDIC utf-8 or 16 encoded strings

            # so we need to look for them and store them away to process leading text
            # ORDT1 has 1 byte long entries, ORDT2 has 2 byte long entries
            # we only ever seem to use the seocnd but ...
            assert(ocnt == 1)
            assert(data[op1:op1+4] == b'ORDT')
            assert(data[op2:op2+4] == b'ORDT')
            ordt1 = struct.unpack_from(bstr('>%dB' % oentries), data, op1+4)
            ordt2 = struct.unpack_from(bstr('>%dH' % oentries), data, op2+4)

        if self.DEBUG:
            print("parsed INDX header:")
            for n in words:
                print(n, "%X" % header[n],)
            print("")
        return header, ordt1, ordt2

    def readCTOC(self, txtdata):
        # read all blocks from CTOC
        ctoc_data = {}
        offset = 0
        while offset<len(txtdata):
            if PY2:
                if txtdata[offset] == b'\0':
                    break
            else:
                if txtdata[offset] == 0:
                    break
            idx_offs = offset
            # first n bytes: name len as vwi
            pos, ilen = getVariableWidthValue(txtdata, offset)
            offset += pos
            # <len> next bytes: name
            name = txtdata[offset:offset+ilen]
            offset += ilen
            if self.DEBUG:
                print("name length is ", ilen)
                print(idx_offs, name)
            ctoc_data[idx_offs] = name
        return ctoc_data


def getVariableWidthValue(data, offset):
    '''
    Decode variable width value from given bytes.

    @param data: The bytes to decode.
    @param offset: The start offset into data.
    @return: Tuple of consumed bytes count and decoded value.
    '''
    value = 0
    consumed = 0
    finished = False
    while not finished:
        v = data[offset + consumed: offset + consumed + 1]
        consumed += 1
        if ord(v) & 0x80:
            finished = True
        value = (value << 7) | (ord(v) & 0x7f)
    return consumed, value


def readTagSection(start, data):
    '''
    Read tag section from given data.

    @param start: The start position in the data.
    @param data: The data to process.
    @return: Tuple of control byte count and list of tag tuples.
    '''
    controlByteCount = 0
    tags = []
    if data[start:start+4] == b"TAGX":
        firstEntryOffset, = struct.unpack_from(b'>L', data, start + 0x04)
        controlByteCount, = struct.unpack_from(b'>L', data, start + 0x08)

        # Skip the first 12 bytes already read above.
        for i in range(12, firstEntryOffset, 4):
            pos = start + i
            tags.append((ord(data[pos:pos+1]), ord(data[pos+1:pos+2]), ord(data[pos+2:pos+3]), ord(data[pos+3:pos+4])))
    return controlByteCount, tags


def countSetBits(value, bits=8):
    '''
    Count the set bits in the given value.

    @param value: Integer value.
    @param bits: The number of bits of the input value (defaults to 8).
    @return: Number of set bits.
    '''
    count = 0
    for _ in range(bits):
        if value & 0x01 == 0x01:
            count += 1
        value = value >> 1
    return count


def getTagMap(controlByteCount, tagTable, entryData, startPos, endPos):
    '''
    Create a map of tags and values from the given byte section.

    @param controlByteCount: The number of control bytes.
    @param tagTable: The tag table.
    @param entryData: The data to process.
    @param startPos: The starting position in entryData.
    @param endPos: The end position in entryData or None if it is unknown.
    @return: Hashmap of tag and list of values.
    '''
    tags = []
    tagHashMap = {}
    controlByteIndex = 0
    dataStart = startPos + controlByteCount

    for tag, valuesPerEntry, mask, endFlag in tagTable:
        if endFlag == 0x01:
            controlByteIndex += 1
            continue
        cbyte = ord(entryData[startPos + controlByteIndex:startPos + controlByteIndex+1])
        if 0:
            print("Control Byte Index %0x , Control Byte Value %0x" % (controlByteIndex, cbyte))

        value = ord(entryData[startPos + controlByteIndex:startPos + controlByteIndex+1]) & mask
        if value != 0:
            if value == mask:
                if countSetBits(mask) > 1:
                    # If all bits of masked value are set and the mask has more than one bit, a variable width value
                    # will follow after the control bytes which defines the length of bytes (NOT the value count!)
                    # which will contain the corresponding variable width values.
                    consumed, value = getVariableWidthValue(entryData, dataStart)
                    dataStart += consumed
                    tags.append((tag, None, value, valuesPerEntry))
                else:
                    tags.append((tag, 1, None, valuesPerEntry))
            else:
                # Shift bits to get the masked value.
                while mask & 0x01 == 0:
                    mask = mask >> 1
                    value = value >> 1
                tags.append((tag, value, None, valuesPerEntry))
    for tag, valueCount, valueBytes, valuesPerEntry in tags:
        values = []
        if valueCount is not None:
            # Read valueCount * valuesPerEntry variable width values.
            for _ in range(valueCount):
                for _ in range(valuesPerEntry):
                    consumed, data = getVariableWidthValue(entryData, dataStart)
                    dataStart += consumed
                    values.append(data)
        else:
            # Convert valueBytes to variable width values.
            totalConsumed = 0
            while totalConsumed < valueBytes:
                # Does this work for valuesPerEntry != 1?
                consumed, data = getVariableWidthValue(entryData, dataStart)
                dataStart += consumed
                totalConsumed += consumed
                values.append(data)
            if totalConsumed != valueBytes:
                print("Error: Should consume %s bytes, but consumed %s" % (valueBytes, totalConsumed))
        tagHashMap[tag] = values
    # Test that all bytes have been processed if endPos is given.
    if endPos is not None and dataStart != endPos:
        # The last entry might have some zero padding bytes, so complain only if non zero bytes are left.
        for char in entryData[dataStart:endPos]:
            if bord(char) != 0:
                print("Warning: There are unprocessed index bytes left: %s" % toHex(entryData[dataStart:endPos]))
                if 0:
                    print("controlByteCount: %s" % controlByteCount)
                    print("tagTable: %s" % tagTable)
                    print("data: %s" % toHex(entryData[startPos:endPos]))
                    print("tagHashMap: %s" % tagHashMap)
                break

    return tagHashMap
