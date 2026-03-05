project('com.github.johnfactotum.Foliate',
    version: '3.3.0',
    meson_version: '>= 0.59.0',
)

gnome = import('gnome')
i18n = import('i18n')
gjs = dependency('gjs-1.0')

if get_option('check_runtime_deps')
    dependency('gjs-1.0', version: '>= 1.82')
    dependency('gtk4', version: '>= 4.12')
    dependency('libadwaita-1', version: '>= 1.8')
    dependency('webkitgtk-6.0', version: '>= 2.40.1')
endif

subdir('data')
subdir('src')
subdir('po')

gnome.post_install(
    glib_compile_schemas: true,
    gtk_update_icon_cache: true,
    update_desktop_database: true,
)
