import os
from string import Template


class EPUBGenerator(object):
    MIME_TEMPLATE = 'mimetype'
    META_INF_CONTAINER_TEMPLATE = 'META-INF--container.xml'
    PACKAGE_DOCUMENT_TEMPLATE = 'OEBPS--package.opf'
    STYLESHEET_TEMPLATE = 'OEBPS--CSS--main.css'
    PAGE_TEMPLATE = 'OEBPS--page.xhtml'
    NAV_TEMPLATE = 'OEBPS--nav.xhtml'

    def __init__(self, comic_book, output_dir):
        self.templates_dir = os.path.join(
            os.path.dirname(__file__), 'templates')

        self.comic_book = comic_book
        self.output_dir = output_dir

    def generate(self):
        self.generate_MIME_file()
        self.generate_container_xml()
        self.generate_stylesheet()
        self.generate_pages()
        self.generate_nav()
        self.generate_package_document()

    def generate_MIME_file(self):
        with open(f'{self.templates_dir}/{self.MIME_TEMPLATE}') as mime_template:
            template = Template(mime_template.read())

            with open(self.output_dir + '/mimetype', 'w') as mime_file:
                mapping = {}
                mime_file.write(
                    template.substitute(mapping)
                )

    def generate_container_xml(self):
        with open(f'{self.templates_dir}/{self.META_INF_CONTAINER_TEMPLATE}') as container_xml_template:
            template = Template(container_xml_template.read())

            with open(self.output_dir + '/META-INF/container.xml', 'w') as container_xml_file:
                mapping = {}
                container_xml_file.write(
                    template.substitute(mapping)
                )

    def generate_stylesheet(self):
        with open(f'{self.templates_dir}/{self.STYLESHEET_TEMPLATE}') as stylesheet_template:
            template = Template(stylesheet_template.read())

            with open(self.output_dir + '/OEBPS/css/main.css', 'w') as stylesheet_file:
                mapping = {}
                stylesheet_file.write(
                    template.substitute(mapping)
                )

    def generate_pages(self):
        for page in self.comic_book.pages:
            with open(f'{self.templates_dir}/{self.PAGE_TEMPLATE}') as page_template:
                template = Template(page_template.read())

                page_title = page.original_image_name
                image_file_name = f'{page.image_name}.{page.mime_type[6:]}'

                with open(self.output_dir + f'/OEBPS/page{page.image_name}.xhtml', 'w') as page_file:
                    mapping = {
                        'title': f'{page_title}',
                        'image_file_name': f'{image_file_name}'
                    }
                    page_file.write(template.substitute(mapping))

    def generate_nav(self):
        with open(f'{self.templates_dir}/{self.NAV_TEMPLATE}') as nav_template:
            template = Template(nav_template.read())
            page_list_items = ''

            for page in self.comic_book.pages:
                page_name = "page" + page.image_name
                page_title = page.original_image_name

                page_list_item_template = Template(
                    '<li><a href="$page_name.xhtml">$page_title</a></li>\n'
                )
                page_list_items += page_list_item_template.substitute(
                    {'page_name': f'{page_name}', 'page_title': f'{page_title}'}
                )

            with open(self.output_dir + '/OEBPS/nav.xhtml', 'w') as nav_file:
                mapping = {
                    'title': f'{self.comic_book.title}',
                    'page_list_items': f'{page_list_items}'
                }
                nav_file.write(template.substitute(mapping))

    def generate_package_document(self):
        with open(f'{self.templates_dir}/{self.PACKAGE_DOCUMENT_TEMPLATE}') as opf_template:
            template = Template(opf_template.read())

            manifest_page_items = ''
            manifest_image_items = ''
            spine_page_items = ''

            for page in self.comic_book.pages:
                image_name = page.image_name
                image_mime_type = page.mime_type
                image_type = image_mime_type[6:]
                page_name = "page" + page.image_name

                manifest_image_item_t = Template(
                    '<item id="image$image_name" href="images/$image_name.$image_type" media-type="$image_mime_type" />\n'
                )
                manifest_image_items += manifest_image_item_t.substitute({
                    'image_name': f'{image_name}',
                    'image_type': f'{image_type}',
                    'image_mime_type': f'{image_mime_type}'
                })

                manifest_page_item_t = Template(
                    '<item id="$page_name" href="$page_name.xhtml" media-type="application/xhtml+xml" />\n'
                )
                manifest_page_items += manifest_page_item_t.substitute(
                    {'page_name': f'{page_name}'}
                )

                spine_page_item_t = Template(
                    '<itemref idref="$page_name" />\n'
                )
                spine_page_items += spine_page_item_t.substitute(
                    {'page_name': f'{page_name}'}
                )

            with open(self.output_dir + '/OEBPS/package.opf', 'w') as opf_file:
                mapping = {
                    'uid': f'foliate_generated_{self.comic_book.title}',
                    'title': f'{self.comic_book.title}',
                    'manifest_image_items': f'{manifest_image_items}',
                    'manifest_page_items': f'{manifest_page_items}',
                    'spine_page_items': f'{spine_page_items}',
                }
                opf_file.write(template.substitute(mapping))
