project('com.github.johnfactotum.Foliate',
    version: '3.0.1',
    meson_version: '>= 0.59.0',
)

gnome = import('gnome')
i18n = import('i18n')

gjs = dependency('gjs-1.0', version: '>= 1.76')
dependency('gtk4', version: '>= 4.12')
dependency('libadwaita-1', version: '>= 1.4')
dependency('webkitgtk-6.0', version: '>= 2.40.1')

subdir('data')
subdir('src')
subdir('po')

gnome.post_install(
    glib_compile_schemas: true,
    gtk_update_icon_cache: true,
    update_desktop_database: true,
)
