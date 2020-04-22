import os
import sys

from cb_extractor import CBExtractor
from epub_generator import EPUBGenerator

# Parse arguments
cb_file_type = sys.argv[1]
cb_file_path = sys.argv[2]
output_dir = sys.argv[3]

# Validate `cb_file_type`
if cb_file_type != CBExtractor.CB_ZIP and cb_file_type != CBExtractor.CB_RAR:
  print('File type not supported')
  sys.exit(1)

# Create directories inside the output directory (`output_dir`)
os.makedirs(f'{output_dir}/OEBPS/images', exist_ok = True)
os.makedirs(f'{output_dir}/OEBPS/css', exist_ok = True)
os.makedirs(f'{output_dir}/META-INF', exist_ok = True)

# Extract images from comic book archive
extractor = CBExtractor(cb_file_type, cb_file_path, output_dir + '/OEBPS/images')
comic_book = extractor.extract()

# Generate EPUB
generator = EPUBGenerator(comic_book, output_dir)
generator.generate()
