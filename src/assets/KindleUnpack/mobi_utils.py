#!/usr/bin/env python
# -*- coding: utf-8 -*-
# vim:ts=4:sw=4:softtabstop=4:smarttab:expandtab
# flake8: noqa

from __future__ import unicode_literals, division, absolute_import, print_function

from .compatibility_utils import PY2, text_type, bchr, bord

import binascii

if PY2:
    range = xrange

from itertools import cycle

def getLanguage(langID, sublangID):
    mobilangdict = {
            54 : {0 : 'af'},  # Afrikaans
            28 : {0 : 'sq'},  # Albanian
             1 : {0 : 'ar' , 5 : 'ar-dz' , 15 : 'ar-bh' , 3 : 'ar-eg' , 2 : 'ar-iq',  11 : 'ar-jo' , 13 : 'ar-kw' , 12 : 'ar-lb' , 4: 'ar-ly',
                  6 : 'ar-ma' , 8 : 'ar-om' , 16 : 'ar-qa' , 1 : 'ar-sa' , 10 : 'ar-sy' , 7 : 'ar-tn' , 14 : 'ar-ae' , 9 : 'ar-ye'},
             # Arabic,  Arabic (Algeria),  Arabic (Bahrain),  Arabic (Egypt),  Arabic
             # (Iraq), Arabic (Jordan),  Arabic (Kuwait),  Arabic (Lebanon),  Arabic
             # (Libya), Arabic (Morocco),  Arabic (Oman),  Arabic (Qatar),  Arabic
             # (Saudi Arabia),  Arabic (Syria),  Arabic (Tunisia),  Arabic (United Arab
             # Emirates),  Arabic (Yemen)
            43 : {0 : 'hy'},  # Armenian
            77 : {0 : 'as'},  # Assamese
            44 : {0 : 'az'},  # "Azeri (IANA: Azerbaijani)
            45 : {0 : 'eu'},  # Basque
            35 : {0 : 'be'},  # Belarusian
            69 : {0 : 'bn'},  # Bengali
             2 : {0 : 'bg'},  # Bulgarian
             3 : {0 : 'ca'},  # Catalan
             4 : {0 : 'zh' , 3 : 'zh-hk' , 2 : 'zh-cn' , 4 : 'zh-sg' , 1 : 'zh-tw'},
            # Chinese,  Chinese (Hong Kong),  Chinese (PRC),  Chinese (Singapore),  Chinese (Taiwan)
            26 : {0 : 'hr', 3 : 'sr'},  # Croatian, Serbian
             5 : {0 : 'cs'},  # Czech
             6 : {0 : 'da'},  # Danish
            19 : {0: 'nl', 1 : 'nl' , 2 : 'nl-be'},  # Dutch / Flemish,  Dutch (Belgium)
             9 : {0: 'en', 1 : 'en' , 3 : 'en-au' , 40 : 'en-bz' , 4 : 'en-ca' , 6 : 'en-ie' , 8 : 'en-jm' , 5 : 'en-nz' , 13 : 'en-ph' ,
                  7 : 'en-za' , 11 : 'en-tt' , 2 : 'en-gb', 1 : 'en-us' , 12 : 'en-zw'},
             # English,  English (Australia),  English (Belize),  English (Canada),
             # English (Ireland),  English (Jamaica),  English (New Zealand),  English
             # (Philippines),  English (South Africa),  English (Trinidad),  English
             # (United Kingdom),  English (United States),  English (Zimbabwe)
            37 : {0 : 'et'},  # Estonian
            56 : {0 : 'fo'},  # Faroese
            41 : {0 : 'fa'},  # Farsi / Persian
            11 : {0 : 'fi'},  # Finnish
            12 : {0 : 'fr', 1 : 'fr' , 2 : 'fr-be' , 3 : 'fr-ca' , 5 : 'fr-lu' , 6 : 'fr-mc' , 4 : 'fr-ch'},
            # French,  French (Belgium),  French (Canada),  French (Luxembourg),  French (Monaco),  French (Switzerland)
            55 : {0 : 'ka'},  # Georgian
             7 : {0 : 'de', 1 : 'de' , 3 : 'de-at' , 5 : 'de-li' , 4 : 'de-lu' , 2 : 'de-ch'},
             # German,  German (Austria),  German (Liechtenstein),  German (Luxembourg),  German (Switzerland)
             8 : {0 : 'el'},  # Greek, Modern (1453-)
            71 : {0 : 'gu'},  # Gujarati
            13 : {0 : 'he'},  # Hebrew (also code 'iw'?)
            57 : {0 : 'hi'},  # Hindi
            14 : {0 : 'hu'},  # Hungarian
            15 : {0 : 'is'},  # Icelandic
            33 : {0 : 'id'},  # Indonesian
            16 : {0 : 'it', 1 : 'it' , 2 : 'it-ch'},  # Italian,  Italian (Switzerland)
            17 : {0 : 'ja'},  # Japanese
            75 : {0 : 'kn'},  # Kannada
            63 : {0 : 'kk'},  # Kazakh
            87 : {0 : 'x-kok'},  # Konkani (real language code is 'kok'?)
            18 : {0 : 'ko'},  # Korean
            38 : {0 : 'lv'},  # Latvian
            39 : {0 : 'lt'},  # Lithuanian
            47 : {0 : 'mk'},  # Macedonian
            62 : {0 : 'ms'},  # Malay
            76 : {0 : 'ml'},  # Malayalam
            58 : {0 : 'mt'},  # Maltese
            78 : {0 : 'mr'},  # Marathi
            97 : {0 : 'ne'},  # Nepali
            20 : {0 : 'no'},  # Norwegian
            72 : {0 : 'or'},  # Oriya
            21 : {0 : 'pl'},  # Polish
            22 : {0 : 'pt', 2 : 'pt' , 1 : 'pt-br'},  # Portuguese,  Portuguese (Brazil)
            70 : {0 : 'pa'},  # Punjabi
            23 : {0 : 'rm'},  # "Rhaeto-Romanic" (IANA: Romansh)
            24 : {0 : 'ro'},  # Romanian
            25 : {0 : 'ru'},  # Russian
            59 : {0 : 'sz'},  # "Sami (Lappish)" (not an IANA language code)
            # IANA code for "Northern Sami" is 'se'
            # 'SZ' is the IANA region code for Swaziland
            79 : {0 : 'sa'},  # Sanskrit
            27 : {0 : 'sk'},  # Slovak
            36 : {0 : 'sl'},  # Slovenian
            46 : {0 : 'sb'},  # "Sorbian" (not an IANA language code)
            # 'SB' is IANA region code for 'Solomon Islands'
            # Lower Sorbian = 'dsb'
            # Upper Sorbian = 'hsb'
            # Sorbian Languages = 'wen'
            10 : {0 : 'es' , 4 : 'es' , 44 : 'es-ar' , 64 : 'es-bo' , 52 : 'es-cl' , 36 : 'es-co' , 20 : 'es-cr' , 28 : 'es-do' ,
                  48 : 'es-ec' , 68 : 'es-sv' , 16 : 'es-gt' , 72 : 'es-hn' , 8 : 'es-mx' , 76 : 'es-ni' , 24 : 'es-pa' ,
                  60 : 'es-py' , 40 : 'es-pe' , 80 : 'es-pr' , 56 : 'es-uy' , 32 : 'es-ve'},
            # Spanish,  Spanish (Mobipocket bug?),  Spanish (Argentina),  Spanish
            # (Bolivia),  Spanish (Chile),  Spanish (Colombia),  Spanish (Costa Rica),
            # Spanish (Dominican Republic),  Spanish (Ecuador),  Spanish (El
            # Salvador),  Spanish (Guatemala),  Spanish (Honduras),  Spanish (Mexico),
            # Spanish (Nicaragua),  Spanish (Panama),  Spanish (Paraguay),  Spanish
            # (Peru),  Spanish (Puerto Rico),  Spanish (Uruguay),  Spanish (Venezuela)
            48 : {0 : 'sx'},  # "Sutu" (not an IANA language code)
            # "Sutu" is another name for "Southern Sotho"?
            # IANA code for "Southern Sotho" is 'st'
            65 : {0 : 'sw'},  # Swahili
            29 : {0 : 'sv' , 1 : 'sv' , 8 : 'sv-fi'},  # Swedish,  Swedish (Finland)
            73 : {0 : 'ta'},  # Tamil
            68 : {0 : 'tt'},  # Tatar
            74 : {0 : 'te'},  # Telugu
            30 : {0 : 'th'},  # Thai
            49 : {0 : 'ts'},  # Tsonga
            50 : {0 : 'tn'},  # Tswana
            31 : {0 : 'tr'},  # Turkish
            34 : {0 : 'uk'},  # Ukrainian
            32 : {0 : 'ur'},  # Urdu
            67 : {0 : 'uz', 2 : 'uz'},  # Uzbek
            42 : {0 : 'vi'},  # Vietnamese
            52 : {0 : 'xh'},  # Xhosa
            53 : {0 : 'zu'},  # Zulu
    }
    lang = "en"
    if langID in mobilangdict:
        subdict = mobilangdict[langID]
        lang = subdict[0]
        if sublangID in subdict:
            lang = subdict[sublangID]
    return lang


def toHex(byteList):
    return binascii.hexlify(byteList)

# returns base32 bytestring
def toBase32(value, npad=4):
    digits = b'0123456789ABCDEFGHIJKLMNOPQRSTUV'
    num_string=b''
    current = value
    while current != 0:
        next, remainder = divmod(current, 32)
        rem_string = digits[remainder:remainder+1]
        num_string = rem_string + num_string
        current=next
    if num_string == b'':
        num_string = b'0'
    pad = npad - len(num_string)
    if pad > 0:
        num_string = b'0' * pad + num_string
    return num_string


# converts base32 string to value
def fromBase32(str_num):
    if isinstance(str_num, text_type):
        str_num = str_num.encode('latin-1')
    scalelst = [1,32,1024,32768,1048576,33554432,1073741824,34359738368]
    value = 0
    j = 0
    n = len(str_num)
    scale = 0
    for i in range(n):
        c = str_num[n-i-1:n-i]
        if c in b'0123456789':
            v = ord(c) - ord(b'0')
        else:
            v = ord(c) - ord(b'A') + 10
        if j < len(scalelst):
            scale = scalelst[j]
        else:
            scale = scale * 32
        j += 1
        if v != 0:
            value = value + (v * scale)
    return value


# note: if decode a bytestring using 'latin-1' (or any other 0-255 encoding)
# in place of ascii you will get a byte to half-word or integer
# one to one mapping of values from 0 - 255

def mangle_fonts(encryption_key, data):
    if isinstance(encryption_key, text_type):
        encryption_key = encryption_key.encode('latin-1')
    crypt = data[:1024]
    key = cycle(iter(map(bord, encryption_key)))
    # encrypt = ''.join([chr(ord(x)^key.next()) for x in crypt])
    encrypt = b''.join([bchr(bord(x)^next(key)) for x in crypt])
    return encrypt + data[1024:]
