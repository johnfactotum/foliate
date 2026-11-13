import AppKit
import WebKit

@MainActor
final class SmokeTest: NSObject, NSApplicationDelegate {
    var reader: ReaderWindow!
    var stage = 0
    var expectedLocation = ""
    let suite = "FoliateSmokeTest." + UUID().uuidString
    var defaults: UserDefaults!
    var emptyBook: URL!

    func finish(_ error: String? = nil) {
        defaults?.removePersistentDomain(forName: suite)
        if let emptyBook { try? FileManager.default.removeItem(at: emptyBook) }
        if let error { fputs("FAIL: \(error)\n", stderr); exit(1) }
        print("PASS: WKWebView EPUB rendering, contents, search, pagination, restore, appearance, access control, and error recovery")
        exit(0)
    }

    func applicationDidFinishLaunching(_ notification: Notification) {
        defaults = UserDefaults(suiteName: suite)!
        defaults.set("dark", forKey: "appearance")
        reader = ReaderWindow(resourceRoot: URL(fileURLWithPath: CommandLine.arguments[1]),
                              defaults: defaults)
        guard reader.appearanceMode == .dark, reader.window?.appearance?.name == .darkAqua else {
            finish("Saved appearance was not restored"); return
        }
        // A window is needed for WebKit's layout and animation frame scheduling.
        reader.showWindow(nil)
        reader.onEvent = { [weak self] event in self?.receive(event) }
        DispatchQueue.main.asyncAfter(deadline: .now() + 45) { [weak self] in
            self?.finish("Timed out waiting for WKWebView")
        }
        do {
            for url in ["foliate://app/book/unknown/private.epub",
                        "foliate://app/macos/../../COPYING",
                        "file:///etc/passwd"] {
                do {
                    _ = try reader.resources.resolve(URL(string: url)!)
                    finish("Resource handler accepted unauthorized URL: \(url)")
                } catch { /* Expected rejection. */ }
            }
            let valid = try reader.resources.resolve(URL(string: "foliate://app/reader/reader.html")!)
            guard FileManager.default.fileExists(atPath: valid.path) else {
                finish("Bundled reader did not resolve"); return
            }
        } catch { finish(error.localizedDescription) }
    }

    func receive(_ event: [String: Any]) {
        switch event["type"] as? String {
        case "error":
            if stage == 4 {
                stage = 5
                reader.open(URL(fileURLWithPath: CommandLine.arguments[2]))
            } else { finish(event["message"] as? String ?? "Unknown bridge error") }
        case "ready": reader.open(URL(fileURLWithPath: CommandLine.arguments[2]))
        case "opened":
            guard event["title"] as? String == "WKWebView Test Book" else {
                finish("Incorrect book metadata"); return
            }
            if stage == 0 { stage = 1; verifyAppearance() }
            else if stage == 2 { stage = 3; verifyRestore() }
            else if stage == 5 { finish() }
        default: break
        }
    }

    func verifyAppearance(_ index: Int = 0) {
        let modes: [ReaderAppearance] = [.dark, .light, .system]
        guard index < modes.count else { exercise(); return }
        let mode = modes[index]
        let menu = reader.makeAppearanceMenu()
        guard let item = menu.items.first(where: { $0.representedObject as? String == mode.rawValue }) else {
            finish("Appearance menu option missing"); return
        }
        menu.performActionForItem(at: menu.index(of: item))
        guard defaults.string(forKey: "appearance") == mode.rawValue,
              menu.items.filter({ $0.state == .on }).count == 1, item.state == .on else {
            finish("Appearance choice was not saved or checked in the menu"); return
        }
        if mode == .system, reader.window?.appearance != nil {
            finish("System appearance did not clear the window override"); return
        }
        let dark = reader.window?.effectiveAppearance.bestMatch(from: [.aqua, .darkAqua]) == .darkAqua
        reader.webView.callAsyncJavaScript("""
            const expectedColor = dark ? 'rgb(238, 238, 238)' : 'rgb(32, 32, 32)'
            for (let i = 0; i < 100; i++) {
                const doc = reader.view.renderer.getContents()[0].doc
                if (matchMedia('(prefers-color-scheme: dark)').matches === dark
                    && doc.defaultView.getComputedStyle(doc.documentElement).color === expectedColor)
                    return true
                await new Promise(resolve => setTimeout(resolve, 20))
            }
            throw new Error('Appearance did not update the WKWebView controls and book content')
            """, arguments: ["dark": dark], in: nil, in: .page) { [weak self] result in
                guard let self else { return }
                if case .failure(let error) = result { finish(error.localizedDescription); return }
                verifyAppearance(index + 1)
            }
    }

    func exercise() {
        reader.webView.callAsyncJavaScript("""
            const assert = (value, message) => { if (!value) throw new Error(message) }
            const view = reader.view
            assert(view.book.sections.length === 2, 'EPUB spine was not parsed')
            assert(document.querySelectorAll('#mac-toc a').length === 2, 'Contents missing')
            assert(view.renderer.getContents()[0].doc.body.textContent.includes('Chapter One'),
                'First chapter did not render')
            await macReader.command('next')
            const afterNext = view.lastLocation.cfi
            await macReader.command('previous')
            assert(view.lastLocation.cfi !== afterNext, 'Page navigation did not move')
            await macReader.command('find')
            document.querySelector('#mac-search').value = 'searchneedle'
            document.querySelector('#mac-search-form').requestSubmit()
            for (let i = 0; i < 200 && !document.querySelector('#mac-results button'); i++)
                await new Promise(resolve => setTimeout(resolve, 25))
            assert(document.querySelector('#mac-results button'), 'Search produced no results')
            await view.goTo(1)
            assert(view.renderer.getContents()[0].doc.body.textContent.includes('Chapter Two'),
                'Chapter navigation did not render the second chapter')
            await macReader.command('increase-font')
            await new Promise(resolve => setTimeout(resolve, 100))
            let denied = false
            try { await fetch('foliate://app/book/unknown/private.epub') }
            catch { denied = true }
            assert(denied, 'Page could access a book that was not granted')
            return view.lastLocation.cfi
            """, in: nil, in: .page) { [weak self] result in
                guard let self else { return }
                switch result {
                case .failure(let error): finish(error.localizedDescription)
                case .success(let value):
                    guard let cfi = value as? String, !cfi.isEmpty else {
                        finish("No reading position returned"); return
                    }
                    expectedLocation = cfi
                    let key = "location:" + URL(fileURLWithPath: CommandLine.arguments[2]).standardizedFileURL.path
                    guard defaults.string(forKey: key) == cfi else {
                        finish("Reading position was not persisted"); return
                    }
                    stage = 2
                    reader.open(URL(fileURLWithPath: CommandLine.arguments[2]))
                }
            }
    }

    func verifyRestore() {
        reader.webView.callAsyncJavaScript("""
            if (reader.view.lastLocation.cfi !== expected)
                throw new Error('Reading position was not restored')
            if (!reader.view.renderer.getContents()[0].doc.body.textContent.includes('Chapter Two'))
                throw new Error('Restored chapter did not render')
            if (document.querySelector('#mac-sidebar').hidden)
                await macReader.command('contents')
            // Let ResizeObserver repaginate after the sidebar changes width.
            await new Promise(resolve => setTimeout(resolve, 200))
            """, arguments: ["expected": expectedLocation], in: nil, in: .page) { [weak self] result in
                guard let self else { return }
                if case .failure(let error) = result { finish(error.localizedDescription); return }
                reader.webView.takeSnapshot(with: nil) { [weak self] image, error in
                    guard let self else { return }
                    if let error { finish(error.localizedDescription); return }
                    if CommandLine.arguments.count > 3, let data = image?.tiffRepresentation,
                       let bitmap = NSBitmapImageRep(data: data),
                       let png = bitmap.representation(using: .png, properties: [:]) {
                        do { try png.write(to: URL(fileURLWithPath: CommandLine.arguments[3])) }
                        catch { finish(error.localizedDescription); return }
                    }
                    do {
                        emptyBook = URL(fileURLWithPath: CommandLine.arguments[2])
                            .deletingLastPathComponent().appendingPathComponent("empty-test.epub")
                        try Data().write(to: emptyBook)
                        stage = 4
                        reader.open(emptyBook)
                    } catch { finish(error.localizedDescription) }
                }
            }
    }
}

@main
enum TestMain {
    @MainActor static func main() {
        let app = NSApplication.shared
        app.setActivationPolicy(.accessory)
        let delegate = SmokeTest()
        app.delegate = delegate
        withExtendedLifetime(delegate) { app.run() }
    }
}
