project('com.github.johnfactotum.Foliate',
    version: '3.0.0',
    meson_version: '>= 0.59.0',
)

gnome = import('gnome')
i18n = import('i18n')

subdir('src')

gnome.post_install(
    glib_compile_schemas: true,
    gtk_update_icon_cache: true,
    update_desktop_database: true,
)
