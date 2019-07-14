#!/usr/bin/env python
# -*- coding: utf-8 -*-
# vim:ts=4:sw=4:softtabstop=4:smarttab:expandtab

# Copyright (c) 2014 Kevin B. Hendricks, John Schember, and Doug Massay
# All rights reserved.
#
# Redistribution and use in source and binary forms, with or without modification,
# are permitted provided that the following conditions are met:
#
# 1. Redistributions of source code must retain the above copyright notice, this list of
# conditions and the following disclaimer.
#
# 2. Redistributions in binary form must reproduce the above copyright notice, this list
# of conditions and the following disclaimer in the documentation and/or other materials
# provided with the distribution.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
# EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
# OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
# SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
# INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
# TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
# OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
# CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY
# WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

from __future__ import unicode_literals, division, absolute_import, print_function
from .compatibility_utils import PY2, text_type, binary_type

import sys
import os

# utility routines to convert all paths to be full unicode

# Under Python 2, if a bytestring, try to convert it to unicode using sys.getfilesystemencoding
# Under Python 3, if bytes, try to convert it to unicode using os.fsencode() to decode it

# Mac OS X and Windows will happily support full unicode paths
# Linux can support full unicode paths but allows arbitrary byte paths which may be inconsistent with unicode

fsencoding = sys.getfilesystemencoding()

def pathof(s, enc=fsencoding):
    if s is None:
        return None
    if isinstance(s, text_type):
        return s
    if isinstance(s, binary_type):
        try:
            return s.decode(enc)
        except:
            pass
    return s

def exists(s):
    return os.path.exists(pathof(s))

def isfile(s):
    return os.path.isfile(pathof(s))

def isdir(s):
    return os.path.isdir(pathof(s))

def mkdir(s):
    return os.mkdir(pathof(s))

def listdir(s):
    rv = []
    for file in os.listdir(pathof(s)):
        rv.append(pathof(file))
    return rv

def getcwd():
    if PY2:
        return os.getcwdu()
    return os.getcwd()

def walk(top):
    top = pathof(top)
    rv = []
    for base, dnames, names in os.walk(top):
        base = pathof(base)
        for name in names:
            name = pathof(name)
            rv.append(relpath(os.path.join(base, name), top))
    return rv

def relpath(path, start=None):
    return os.path.relpath(pathof(path) , pathof(start))

def abspath(path):
    return os.path.abspath(pathof(path))
