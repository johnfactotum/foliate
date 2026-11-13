python = import('python').find_installation('python3')
xcrun = find_program('xcrun')
mac_arch = host_machine.cpu_family() == 'aarch64' ? 'arm64' : 'x86_64'

native_reader = custom_target('foliate-macos',
    input: ['main.swift', 'Resources.swift'],
    output: 'foliate',
    command: [xcrun, '--sdk', 'macosx', 'swiftc', '-parse-as-library',
        '-target', mac_arch + '-apple-macos13.0',
        '-module-cache-path', meson.current_build_dir() / 'module-cache',
        '-framework', 'AppKit', '-framework', 'WebKit',
        '@INPUT@', '-o', '@OUTPUT@'],
)

bundle_builder = files('build-bundle.py')
app_bundle = custom_target('Foliate.app',
    input: native_reader,
    output: 'Foliate.app.stamp',
    command: [python, bundle_builder, meson.project_source_root(),
        '@INPUT@', '@OUTPUT@', meson.project_version()],
    depend_files: [bundle_builder, files('reader.js', 'reader.css')],
    build_always_stale: true,
    build_by_default: true,
)

meson.add_install_script(python, files('install-bundle.py'),
    meson.current_build_dir() / 'Foliate.app')

test('macOS bundle', python,
    args: [files('test-bundle.py'), meson.current_build_dir() / 'Foliate.app'],
    depends: app_bundle,
)

test_book = custom_target('test EPUB',
    output: 'test.epub',
    command: [python, files('make-test-book.py'), '@OUTPUT@'],
)
smoke_test = custom_target('WKWebView smoke test',
    input: ['main.swift', 'Resources.swift', 'SmokeTests.swift'],
    output: 'wkwebview-test',
    command: [xcrun, '--sdk', 'macosx', 'swiftc', '-parse-as-library',
        '-D', 'FOLIATE_TESTING', '-target', mac_arch + '-apple-macos13.0',
        '-module-cache-path', meson.current_build_dir() / 'module-cache',
        '-framework', 'AppKit', '-framework', 'WebKit',
        '@INPUT@', '-o', '@OUTPUT@'],
)
test('WKWebView reader', find_program('env'),
    args: [smoke_test, meson.current_build_dir() / 'Foliate.app/Contents/Resources', test_book,
        meson.current_build_dir() / 'wkwebview-test.png'],
    depends: [app_bundle, smoke_test],
    timeout: 60,
)
