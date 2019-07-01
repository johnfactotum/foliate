#!/bin/bash

# This script produces .deb files from built meson folder
#
# cd foliate-master
# meson build
# cd build
# ninja
# ninja debian-bin
#
# Debian/Ubuntu Binary Packaging Stage in this file

# Format foliate version for Debian/Ubuntu
fver=$@

# Create package name, foliate_1.3.1
fname='foliate_'$fver

mkdir -p ${MESON_BUILD_ROOT}/$fname

fnamefull=${MESON_BUILD_ROOT}/$fname

mkdir -p $fnamefull/DEBIAN
cp ${MESON_SOURCE_ROOT}/COPYING $fnamefull/DEBIAN/copyright

# Debian/Ubuntu version control metadata
echo "Package: foliate" > $fnamefull/DEBIAN/control
echo "Version: $fver" >> $fnamefull/DEBIAN/control
echo "Section: gnome" >> $fnamefull/DEBIAN/control
echo "Priority: optional" >> $fnamefull/DEBIAN/control
echo "Architecture: amd64" >> $fnamefull/DEBIAN/control
echo "Depends: gjs (>= 1.54.0), libwebkit2gtk-4.0-37, libsoup2.4-1" >> $fnamefull/DEBIAN/control
echo "Maintainer: Unknown <unknown@unknown.org>" >> $fnamefull/DEBIAN/control
echo "Description: Foliate" >> $fnamefull/DEBIAN/control
echo " A simple and modern GTK eBook viewer," >> $fnamefull/DEBIAN/control
echo " built with GJS and Epub.js." >> $fnamefull/DEBIAN/control

mkdir -p $fnamefull/usr/local/bin
cp ${MESON_BUILD_ROOT}/src/com.github.johnfactotum.Foliate $fnamefull/usr/local/bin/com.github.johnfactotum.Foliate

mkdir -p $fnamefull/usr/local/share/com.github.johnfactotum.Foliate/assets
cp ${MESON_SOURCE_ROOT}/src/assets/epub.js $fnamefull/usr/local/share/com.github.johnfactotum.Foliate/assets/epub.js
cp ${MESON_SOURCE_ROOT}/src/assets/viewer.html $fnamefull/usr/local/share/com.github.johnfactotum.Foliate/assets/viewer.html
cp ${MESON_SOURCE_ROOT}/src/assets/jszip.min.js $fnamefull/usr/local/share/com.github.johnfactotum.Foliate/assets/jszip.min.js
cp ${MESON_SOURCE_ROOT}/src/assets/cheerio.js $fnamefull/usr/local/share/com.github.johnfactotum.Foliate/assets/cheerio.js

mkdir -p $fnamefull/usr/local/share/com.github.johnfactotum.Foliate
cp ${MESON_BUILD_ROOT}/src/com.github.johnfactotum.Foliate.src.gresource $fnamefull/usr/local/share/com.github.johnfactotum.Foliate/com.github.johnfactotum.Foliate.src.gresource

mkdir -p $fnamefull/usr/local/share/applications
cp ${MESON_BUILD_ROOT}/data/com.github.johnfactotum.Foliate.desktop $fnamefull/usr/local/share/applications/com.github.johnfactotum.Foliate.desktop

mkdir -p $fnamefull/usr/local/share/metainfo
cp ${MESON_BUILD_ROOT}/data/com.github.johnfactotum.Foliate.appdata.xml $fnamefull/usr/local/share/metainfo/com.github.johnfactotum.Foliate.appdata.xml

mkdir -p $fnamefull/usr/local/share/glib-2.0/schemas
cp ${MESON_SOURCE_ROOT}/data/com.github.johnfactotum.Foliate.gschema.xml $fnamefull/usr/local/share/glib-2.0/schemas/com.github.johnfactotum.Foliate.gschema.xml

# Compiling the gschema
glib-compile-schemas $fnamefull/usr/local/share/glib-2.0/schemas

mkdir -p $fnamefull/usr/local/share/icons/hicolor/scalable/apps
cp ${MESON_SOURCE_ROOT}/data/com.github.johnfactotum.Foliate.svg $fnamefull/usr/local/share/icons/hicolor/scalable/apps/com.github.johnfactotum.Foliate.svg

mkdir -p $fnamefull/usr/local/share/icons/hicolor/symbolic/apps
cp ${MESON_SOURCE_ROOT}/data/com.github.johnfactotum.Foliate-symbolic.svg $fnamefull/usr/local/share/icons/hicolor/symbolic/apps/com.github.johnfactotum.Foliate-symbolic.svg

# Copy Translations
po_list=`ls ${MESON_BUILD_ROOT}/po | sed 's/\.gmo//g'`

for id in $po_list; do
    mkdir -p $fnamefull/usr/local/share/locale/$id/LC_MESSAGES
    cp ${MESON_BUILD_ROOT}/po/$id.gmo $fnamefull/usr/local/share/locale/$id/LC_MESSAGES/com.github.johnfactotum.Foliate.mo
done

# Produce the .deb file
cd ${MESON_BUILD_ROOT}
dpkg-deb --build $fnamefull
