import imghdr
import os
from zipfile import ZipFile


class ComicBook(object):
    def __init__(self, title, pages):
        self.title = title
        self.pages = pages


class ComicBookPage(object):
    def __init__(self, mime_type, image_name, original_image_name):
        self.mime_type = mime_type
        self.image_name = image_name
        self.original_image_name = original_image_name


class CBExtractor(object):
    CB_ZIP = 'cbz'
    CB_RAR = 'cbr'

    # types of the image files inside the comic book archive that are expected
    # to be pages
    EXPECTED_IMAGE_TYPES = ['jpeg', 'png', 'gif', 'bmp']

    def __init__(self, cb_file_type, cb_file_path, output_dir):
        self.cb_file_type = cb_file_type
        self.cb_file_path = cb_file_path
        self.output_dir = output_dir

    def extract(self):
        if self.cb_file_type == self.CB_ZIP:
            return self.extract_zip()
        elif self.cb_file_type == self.CB_RAR:
            return self.extract_rar()

        return 'File type not supported'

    def extract_zip(self):
        with ZipFile(self.cb_file_path, 'r') as zfile:
            comicBookPages = []

            for index, finfo in enumerate(zfile.infolist()):
                file_name = finfo.filename

                with zfile.open(file_name) as f:
                    image_type = imghdr.what(f)
                    if image_type and image_type in self.EXPECTED_IMAGE_TYPES:
                        # Rename and extract
                        finfo.filename = f'{index}' + f'.{image_type}'
                        zfile.extract(file_name, self.output_dir)

                        comicBookPages.append(
                            ComicBookPage(
                                f'image/{image_type}',
                                f'{index}',
                                os.path.splitext(
                                    os.path.basename(file_name))[0]
                            )
                        )

            cBook = ComicBook(
                os.path.splitext(os.path.basename(self.cb_file_path))[0],
                comicBookPages
            )

            return cBook

    def extract_rar(self):
        # Possible implementation: using `python-unrar`
        return 'TODO: Not implemented yet'
