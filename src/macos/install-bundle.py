"""Respect Meson's prefix and DESTDIR when installing the macOS application."""

import os
import shutil
import sys
from pathlib import Path

destination = Path(os.environ['MESON_INSTALL_DESTDIR_PREFIX']) / 'Applications'
destination.mkdir(parents=True, exist_ok=True)
shutil.copytree(sys.argv[1], destination / 'Foliate.app', dirs_exist_ok=True)
