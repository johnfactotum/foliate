#!/usr/bin/env python
# -*- coding: utf-8 -*-
# vim:ts=4:sw=4:softtabstop=4:smarttab:expandtab

from __future__ import unicode_literals, division, absolute_import, print_function

from .compatibility_utils import PY2, hexlify, bstr, bord, bchar

import datetime

if PY2:
    range = xrange

# note:  struct pack, unpack, unpack_from all require bytestring format
# data all the way up to at least python 2.7.5, python 3 okay with bytestring
import struct

from .unipath import pathof

DUMP = False
""" Set to True to dump all possible information. """

class unpackException(Exception):
    pass


def describe(data):
    txtans = ''
    hexans = hexlify(data)
    for i in data:
        if bord(i) < 32 or bord(i) > 127:
            txtans += '?'
        else:
            txtans += bchar(i).decode('latin-1')
    return '"' + txtans + '"' + ' 0x'+ hexans

def datetimefrompalmtime(palmtime):
    if palmtime > 0x7FFFFFFF:
        pythondatetime = datetime.datetime(year=1904,month=1,day=1)+datetime.timedelta(seconds=palmtime)
    else:
        pythondatetime = datetime.datetime(year=1970,month=1,day=1)+datetime.timedelta(seconds=palmtime)
    return pythondatetime


class Sectionizer:

    def __init__(self, filename):
        self.data = b''
        with open(pathof(filename), 'rb') as f:
            self.data = f.read()
        self.palmheader = self.data[:78]
        self.palmname = self.data[:32]
        self.ident = self.palmheader[0x3C:0x3C+8]
        self.num_sections, = struct.unpack_from(b'>H', self.palmheader, 76)
        self.filelength = len(self.data)
        sectionsdata = struct.unpack_from(bstr('>%dL' % (self.num_sections*2)), self.data, 78) + (self.filelength, 0)
        self.sectionoffsets = sectionsdata[::2]
        self.sectionattributes = sectionsdata[1::2]
        self.sectiondescriptions = ["" for x in range(self.num_sections+1)]
        self.sectiondescriptions[-1] = "File Length Only"
        return

    def dumpsectionsinfo(self):
        print("Section     Offset  Length      UID Attribs Description")
        for i in range(self.num_sections):
            print("%3d %3X  0x%07X 0x%05X % 8d % 7d %s" % (i,i, self.sectionoffsets[i], self.sectionoffsets[
                  i+1] - self.sectionoffsets[i], self.sectionattributes[i]&0xFFFFFF, (self.sectionattributes[i]>>24)&0xFF, self.sectiondescriptions[i]))
        print("%3d %3X  0x%07X                          %s" %
              (self.num_sections,self.num_sections, self.sectionoffsets[self.num_sections], self.sectiondescriptions[self.num_sections]))

    def setsectiondescription(self, section, description):
        if section < len(self.sectiondescriptions):
            self.sectiondescriptions[section] = description
        else:
            print("Section out of range: %d, description %s" % (section,description))

    def dumppalmheader(self):
        print("Palm Database Header")
        print("Database name: " + repr(self.palmheader[:32]))
        dbattributes, = struct.unpack_from(b'>H', self.palmheader, 32)
        print("Bitfield attributes: 0x%0X" % dbattributes,)
        if dbattributes != 0:
            print(" (",)
            if (dbattributes & 2):
                print("Read-only; ",)
            if (dbattributes & 4):
                print("Dirty AppInfoArea; ",)
            if (dbattributes & 8):
                print("Needs to be backed up; ",)
            if (dbattributes & 16):
                print("OK to install over newer; ",)
            if (dbattributes & 32):
                print("Reset after installation; ",)
            if (dbattributes & 64):
                print("No copying by PalmPilot beaming; ",)
            print(")")
        else:
            print("")
        print("File version: %d" % struct.unpack_from(b'>H', self.palmheader, 34)[0])
        dbcreation, = struct.unpack_from(b'>L', self.palmheader, 36)
        print("Creation Date: " + str(datetimefrompalmtime(dbcreation))+ (" (0x%0X)" % dbcreation))
        dbmodification, = struct.unpack_from(b'>L', self.palmheader, 40)
        print("Modification Date: " + str(datetimefrompalmtime(dbmodification))+ (" (0x%0X)" % dbmodification))
        dbbackup, = struct.unpack_from(b'>L', self.palmheader, 44)
        if dbbackup != 0:
            print("Backup Date: " + str(datetimefrompalmtime(dbbackup))+ (" (0x%0X)" % dbbackup))
        print("Modification No.: %d" % struct.unpack_from(b'>L', self.palmheader, 48)[0])
        print("App Info offset: 0x%0X" % struct.unpack_from(b'>L', self.palmheader, 52)[0])
        print("Sort Info offset: 0x%0X" % struct.unpack_from(b'>L', self.palmheader, 56)[0])
        print("Type/Creator: %s/%s" % (repr(self.palmheader[60:64]), repr(self.palmheader[64:68])))
        print("Unique seed: 0x%0X" % struct.unpack_from(b'>L', self.palmheader, 68)[0])
        expectedzero, = struct.unpack_from(b'>L', self.palmheader, 72)
        if expectedzero != 0:
            print("Should be zero but isn't: %d" % struct.unpack_from(b'>L', self.palmheader, 72)[0])
        print("Number of sections: %d" % struct.unpack_from(b'>H', self.palmheader, 76)[0])
        return

    def loadSection(self, section):
        before, after = self.sectionoffsets[section:section+2]
        return self.data[before:after]
