pkgdatadir = join_paths(get_option('datadir'), meson.project_name())
gnome = import('gnome')

iso_codes = dependency('iso-codes', version: '>= 3.67', required: false)
if iso_codes.found()
  iso_codes_prefix = iso_codes.get_pkgconfig_variable('prefix')
else
  iso_codes_prefix = '/usr'
endif

iso_codes_conf = configuration_data()
iso_codes_conf.set('ISO_CODES_PREFIX', iso_codes_prefix)

iso_codes_js = configure_file(
  input: 'isoCodes.js.in',
  output: 'isoCodes.js',
  configuration: iso_codes_conf,
)

src_res = gnome.compile_resources('com.github.johnfactotum.Foliate.src',
  'com.github.johnfactotum.Foliate.src.gresource.xml',
  gresource_bundle: true,
  install: true,
  install_dir: pkgdatadir,
  dependencies: [iso_codes_js],
)

data_res = gnome.compile_resources('com.github.johnfactotum.Foliate.data',
  'com.github.johnfactotum.Foliate.data.gresource.xml',
  gresource_bundle: true,
  install: true,
  install_dir: pkgdatadir,
)

bin_conf = configuration_data()
bin_conf.set('GJS', find_program('gjs').path())
bin_conf.set('PACKAGE_VERSION', meson.project_version())
bin_conf.set('PACKAGE_NAME', meson.project_name())
bin_conf.set('prefix', get_option('prefix'))
bin_conf.set('libdir', join_paths(get_option('prefix'), get_option('libdir')))
bin_conf.set('datadir', join_paths(get_option('prefix'), get_option('datadir')))

configure_file(
  input: 'com.github.johnfactotum.Foliate.in',
  output: 'com.github.johnfactotum.Foliate',
  configuration: bin_conf,
  install_dir: get_option('bindir')
)

install_subdir('assets',
  install_dir: pkgdatadir
)
