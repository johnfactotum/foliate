#!/usr/bin/env python
# -*- coding: utf-8 -*-
# vim:ts=4:sw=4:softtabstop=4:smarttab:expandtab

from __future__ import unicode_literals, division, absolute_import, print_function

from .compatibility_utils import PY2, bchr, lmap, bstr

if PY2:
    range = xrange

import struct
# note:  struct pack, unpack, unpack_from all require bytestring format
# data all the way up to at least python 2.7.5, python 3 okay with bytestring


class unpackException(Exception):
    pass

class UncompressedReader:

    def unpack(self, data):
        return data

class PalmdocReader:

    def unpack(self, i):
        o, p = b'', 0
        while p < len(i):
            # for python 3 must use slice since i[p] returns int while slice returns character
            c = ord(i[p:p+1])
            p += 1
            if (c >= 1 and c <= 8):
                o += i[p:p+c]
                p += c
            elif (c < 128):
                o += bchr(c)
            elif (c >= 192):
                o += b' ' + bchr(c ^ 128)
            else:
                if p < len(i):
                    c = (c << 8) | ord(i[p:p+1])
                    p += 1
                    m = (c >> 3) & 0x07ff
                    n = (c & 7) + 3
                    if (m > n):
                        o += o[-m:n-m]
                    else:
                        for _ in range(n):
                            # because of completely ass-backwards decision by python mainters for python 3
                            # we must use slice for bytes as i[p] returns int while slice returns character
                            if m == 1:
                                o += o[-m:]
                            else:
                                o += o[-m:-m+1]
        return o

class HuffcdicReader:
    q = struct.Struct(b'>Q').unpack_from

    def loadHuff(self, huff):
        if huff[0:8] != b'HUFF\x00\x00\x00\x18':
            raise unpackException('invalid huff header')
        off1, off2 = struct.unpack_from(b'>LL', huff, 8)

        def dict1_unpack(v):
            codelen, term, maxcode = v&0x1f, v&0x80, v>>8
            assert codelen != 0
            if codelen <= 8:
                assert term
            maxcode = ((maxcode + 1) << (32 - codelen)) - 1
            return (codelen, term, maxcode)
        self.dict1 = lmap(dict1_unpack, struct.unpack_from(b'>256L', huff, off1))

        dict2 = struct.unpack_from(b'>64L', huff, off2)
        self.mincode, self.maxcode = (), ()
        for codelen, mincode in enumerate((0,) + dict2[0::2]):
            self.mincode += (mincode << (32 - codelen), )
        for codelen, maxcode in enumerate((0,) + dict2[1::2]):
            self.maxcode += (((maxcode + 1) << (32 - codelen)) - 1, )

        self.dictionary = []

    def loadCdic(self, cdic):
        if cdic[0:8] != b'CDIC\x00\x00\x00\x10':
            raise unpackException('invalid cdic header')
        phrases, bits = struct.unpack_from(b'>LL', cdic, 8)
        n = min(1<<bits, phrases-len(self.dictionary))
        h = struct.Struct(b'>H').unpack_from
        def getslice(off):
            blen, = h(cdic, 16+off)
            slice = cdic[18+off:18+off+(blen&0x7fff)]
            return (slice, blen&0x8000)
        self.dictionary += lmap(getslice, struct.unpack_from(bstr('>%dH' % n), cdic, 16))

    def unpack(self, data):
        q = HuffcdicReader.q

        bitsleft = len(data) * 8
        data += b"\x00\x00\x00\x00\x00\x00\x00\x00"
        pos = 0
        x, = q(data, pos)
        n = 32

        s = b''
        while True:
            if n <= 0:
                pos += 4
                x, = q(data, pos)
                n += 32
            code = (x >> n) & ((1 << 32) - 1)

            codelen, term, maxcode = self.dict1[code >> 24]
            if not term:
                while code < self.mincode[codelen]:
                    codelen += 1
                maxcode = self.maxcode[codelen]

            n -= codelen
            bitsleft -= codelen
            if bitsleft < 0:
                break

            r = (maxcode - code) >> (32 - codelen)
            slice, flag = self.dictionary[r]
            if not flag:
                self.dictionary[r] = None
                slice = self.unpack(slice)
                self.dictionary[r] = (slice, 1)
            s += slice
        return s
