<img src="data/com.github.johnfactotum.Foliate.svg" align="left">

# Foliate

Read books in style.

🚧️ This is the work-in-progress GTK 4 branch.

## Installation

### Run Time Dependencies

- `gjs` (>= 1.72)
- `gtk4`
- `libadwaita`
- `webkit2gtk-5.0`

### Obtaining the Source

The repo uses git submodules. Before running or installing, make sure you clone the whole thing with `--recurse-submodules`.

### Run without Installing

```
gjs -m src/main.js
```

### Installing from Source

Dependencies:
- `meson` (>= 0.59)

To install, run the following commands:

```
meson setup build
ninja -C build install
```

By default Meson installs to `/usr/local`. This can be changed by passing the command line argument `--prefix /your/prefix`.

Note: the binary name is now `foliate`, not `com.github.johnfactotum.Foliate`.

## License

This program is free software: you can redistribute it and/or modify it under the terms of the [GNU General Public License](https://www.gnu.org/licenses/gpl.html) as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

The following JavaScript libraries are bundled in this software:

* [foliate-js](https://github.com/johnfactotum/foliate-js), which is MIT licensed.
* [zip.js](https://github.com/gildas-lormeau/zip.js), which is licensed under the BSD-3-Clause license.
* [fflate](https://github.com/101arrowz/fflate), which is MIT licensed.
