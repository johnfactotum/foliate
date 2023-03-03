🚧️ This is the work-in-progress GTK 4 branch.

## Installation

### Run Time Dependencies

- `gjs` (>= 1.72)
- `gtk4`
- `libadwaita`
- `webkit2gtk-5.0`

### Obtaining the Source

The repo uses git submodules. Before running or installing, make sure you clone the whole thing with `--recurse-submodules`.

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

### Run without Installing

```
gjs -m src/main.js
```
