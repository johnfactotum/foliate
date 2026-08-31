bin_conf = configuration_data()
bin_conf.set('GJS', gjs.get_variable(pkgconfig: 'gjs_console'))
bin_conf.set('datadir', join_paths(get_option('prefix'), get_option('datadir')))

configure_file(
    input: 'main.js',
    output: 'foliate',
    configuration: bin_conf,
    install_dir: get_option('bindir'),
)

pkgdatadir = join_paths(get_option('datadir'), meson.project_name())

src_res = gnome.compile_resources(
    meson.project_name(),
    'gresource.xml',
    gresource_bundle: true,
    install: true,
    install_dir: pkgdatadir,
)
