import AppKit
import WebKit

enum ReaderAppearance: String, CaseIterable {
    case system, light, dark

    var title: String {
        switch self {
        case .system: return "System"
        case .light: return "Light"
        case .dark: return "Dark"
        }
    }

    var nativeAppearance: NSAppearance? {
        switch self {
        case .system: return nil
        case .light: return NSAppearance(named: .aqua)
        case .dark: return NSAppearance(named: .darkAqua)
        }
    }
}

@MainActor
final class ReaderWindow: NSWindowController, WKScriptMessageHandler, WKNavigationDelegate {
    let webView: WKWebView
    let resources: ReaderResources
    private let defaults: UserDefaults
    private(set) var appearanceMode: ReaderAppearance
    private var ready = false
    private var loading = false
    private var pendingBook: URL?
    private var currentBook: URL?
    private var currentGrant: String?
    var onEvent: (([String: Any]) -> Void)?

    init(resourceRoot: URL, defaults: UserDefaults = .standard) {
        self.defaults = defaults
        appearanceMode = ReaderAppearance(rawValue: defaults.string(forKey: "appearance") ?? "") ?? .system
        resources = ReaderResources(root: resourceRoot)
        let configuration = WKWebViewConfiguration()
        configuration.setURLSchemeHandler(resources, forURLScheme: "foliate")
        configuration.websiteDataStore = .nonPersistent()
        configuration.mediaTypesRequiringUserActionForPlayback = []
        // Load the macOS controls alongside the unchanged shared reader document.
        configuration.userContentController.addUserScript(WKUserScript(source: """
            document.addEventListener('DOMContentLoaded', () => {
                const script = document.createElement('script')
                script.type = 'module'
                script.src = 'foliate://app/macos/reader.js'
                document.head.append(script)
            }, { once: true })
            """, injectionTime: .atDocumentStart, forMainFrameOnly: true))
        webView = WKWebView(frame: .zero, configuration: configuration)
        webView.autoresizingMask = [.width, .height]
        webView.allowsMagnification = true
        let window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 1000, height: 760),
            styleMask: [.titled, .closable, .miniaturizable, .resizable],
            backing: .buffered, defer: false)
        window.title = "Foliate"
        window.minSize = NSSize(width: 640, height: 440)
        window.contentView = webView
        window.center()
        super.init(window: window)
        window.appearance = appearanceMode.nativeAppearance
        configuration.userContentController.add(self, name: "native")
        configuration.userContentController.add(self, name: "viewer")
        webView.navigationDelegate = self
        if #available(macOS 13.3, *) { webView.isInspectable = true }
        webView.load(URLRequest(url: URL(string: "foliate://app/reader/reader.html")!))
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) is not supported") }

    func open(_ url: URL) {
        guard ready, !loading else { pendingBook = url; return }
        loading = true
        currentBook = url.standardizedFileURL
        let bookURL = resources.grant(url)
        currentGrant = bookURL.absoluteString
        let location = defaults.string(forKey: "location:" + url.standardizedFileURL.path)
        webView.callAsyncJavaScript("await macReader.open(url, name, location)", arguments: [
            "url": bookURL.absoluteString,
            "name": url.lastPathComponent,
            "location": location as Any? ?? NSNull(),
        ], in: nil, in: .page) { [weak self] result in
            guard let self else { return }
            loading = false
            if case .failure(let error) = result { showError(error.localizedDescription) }
            if let url = pendingBook { pendingBook = nil; open(url) }
        }
    }

    @objc func openDocument(_ sender: Any?) {
        let panel = NSOpenPanel()
        panel.title = "Open Book"
        panel.allowsMultipleSelection = false
        panel.canChooseDirectories = false
        guard let window else { return }
        panel.beginSheetModal(for: window) { [weak self] result in
            if result == .OK, let url = panel.url {
                NSDocumentController.shared.noteNewRecentDocumentURL(url)
                self?.open(url)
            }
        }
    }

    @objc func find(_ sender: Any?) { command("find") }
    @objc func nextPage(_ sender: Any?) { command("next") }
    @objc func previousPage(_ sender: Any?) { command("previous") }
    @objc func contents(_ sender: Any?) { command("contents") }
    @objc func increaseFont(_ sender: Any?) { command("increase-font") }
    @objc func decreaseFont(_ sender: Any?) { command("decrease-font") }

    func makeAppearanceMenu() -> NSMenu {
        let menu = NSMenu(title: "Appearance")
        for mode in ReaderAppearance.allCases {
            let item = menu.addItem(withTitle: mode.title,
                action: #selector(changeAppearance(_:)), keyEquivalent: "")
            item.target = self
            item.representedObject = mode.rawValue
            item.state = mode == appearanceMode ? .on : .off
        }
        return menu
    }

    @objc func changeAppearance(_ sender: NSMenuItem) {
        guard let value = sender.representedObject as? String,
              let mode = ReaderAppearance(rawValue: value) else { return }
        appearanceMode = mode
        defaults.set(mode.rawValue, forKey: "appearance")
        // WebKit propagates the window's appearance to prefers-color-scheme,
        // including the reader's book frames and the native window controls.
        window?.appearance = mode.nativeAppearance
        for item in sender.menu?.items ?? [] {
            item.state = item.representedObject as? String == mode.rawValue ? .on : .off
        }
    }

    func command(_ name: String) {
        guard ready else { return }
        webView.callAsyncJavaScript("await macReader.command(name)",
            arguments: ["name": name], in: nil, in: .page) { [weak self] result in
                if case .failure(let error) = result { self?.showError(error.localizedDescription) }
            }
    }

    func showError(_ message: String) {
        if onEvent != nil {
            onEvent?(["type": "error", "message": message])
            return
        }
        guard let window else { return }
        let alert = NSAlert()
        alert.messageText = "Unable to Read Book"
        alert.informativeText = message
        alert.beginSheetModal(for: window)
    }

    func userContentController(_ controller: WKUserContentController,
                               didReceive message: WKScriptMessage) {
        guard message.frameInfo.isMainFrame,
              message.frameInfo.request.url?.host == "app",
              message.frameInfo.request.url?.path == "/reader/reader.html" else { return }
        // The GTK bridge remains registered for the shared reader's messages.
        // macOS UI events are sent separately as structured objects.
        guard message.name == "native", let event = message.body as? [String: Any],
              let type = event["type"] as? String else { return }
        switch type {
        case "ready":
            ready = true
            if let url = pendingBook { pendingBook = nil; open(url) }
        case "open": openDocument(nil)
        case "opened":
            window?.title = (event["title"] as? String ?? "Untitled Book") + " — Foliate"
            window?.representedURL = currentBook
        case "location":
            if event["url"] as? String == currentGrant,
               let book = currentBook, let cfi = event["cfi"] as? String {
                defaults.set(cfi, forKey: "location:" + book.path)
            }
        case "external-link":
            if let href = event["href"] as? String, let url = URL(string: href),
               ["https", "http", "mailto"].contains(url.scheme?.lowercased() ?? "") {
                NSWorkspace.shared.open(url)
            }
        case "error": showError(event["message"] as? String ?? "Unknown reader error")
        default: break
        }
        onEvent?(event)
    }

    func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = action.request.url else { decisionHandler(.cancel); return }
        if action.targetFrame?.isMainFrame == true {
            // Never replace the native bridge page with book or remote content.
            let allowed = url.scheme == "foliate" && url.host == "app"
                && url.path == "/reader/reader.html"
            decisionHandler(allowed ? .allow : .cancel)
        } else {
            // Book sections and PDF.js are rendered in local blob frames.
            decisionHandler(["blob", "about", "data", "foliate"].contains(url.scheme ?? "")
                ? .allow : .cancel)
        }
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!,
                 withError error: Error) { showError(error.localizedDescription) }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!,
                 withError error: Error) { showError(error.localizedDescription) }

    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        ready = false
        loading = false
        pendingBook = currentBook
        webView.reload()
    }
}

@MainActor
final class FoliateApp: NSObject, NSApplicationDelegate {
    private var reader: ReaderWindow!
    private var pendingURLs: [URL] = []

    func applicationDidFinishLaunching(_ notification: Notification) {
        guard let root = Bundle.main.resourceURL,
              FileManager.default.fileExists(atPath: root.appendingPathComponent("reader/reader.html").path)
        else {
            fputs("Run Foliate.app, which contains the reader resources.\n", stderr)
            NSApp.terminate(nil)
            return
        }
        reader = ReaderWindow(resourceRoot: root)
        buildMenu()
        reader.showWindow(nil)
        NSApp.activate(ignoringOtherApps: true)
        let arguments = CommandLine.arguments.dropFirst().filter { !$0.hasPrefix("-") }
        if let url = pendingURLs.first ?? arguments.first.map({ URL(fileURLWithPath: $0) }) {
            reader.open(url)
        }
    }

    func application(_ application: NSApplication, open urls: [URL]) {
        if let reader, let url = urls.first { reader.open(url); reader.showWindow(nil) }
        else { pendingURLs.append(contentsOf: urls) }
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { true }

    private func buildMenu() {
        let menu = NSMenu()
        func submenu(_ title: String) -> NSMenu {
            let item = NSMenuItem()
            let submenu = NSMenu(title: title)
            item.submenu = submenu
            menu.addItem(item)
            return submenu
        }
        func item(_ menu: NSMenu, _ title: String, _ action: Selector, _ key: String,
                  target: AnyObject? = nil) {
            let entry = menu.addItem(withTitle: title, action: action, keyEquivalent: key)
            entry.target = target
        }
        let app = submenu("Foliate")
        item(app, "About Foliate", #selector(NSApplication.orderFrontStandardAboutPanel(_:)), "")
        app.addItem(.separator())
        item(app, "Hide Foliate", #selector(NSApplication.hide(_:)), "h")
        item(app, "Quit Foliate", #selector(NSApplication.terminate(_:)), "q")
        let file = submenu("File")
        item(file, "Open…", #selector(ReaderWindow.openDocument(_:)), "o", target: reader)
        item(file, "Close", #selector(NSWindow.performClose(_:)), "w")
        let edit = submenu("Edit")
        item(edit, "Copy", #selector(NSText.copy(_:)), "c")
        item(edit, "Select All", #selector(NSText.selectAll(_:)), "a")
        item(edit, "Find…", #selector(ReaderWindow.find(_:)), "f", target: reader)
        let view = submenu("View")
        item(view, "Contents", #selector(ReaderWindow.contents(_:)), "t", target: reader)
        item(view, "Next Page", #selector(ReaderWindow.nextPage(_:)), "]", target: reader)
        item(view, "Previous Page", #selector(ReaderWindow.previousPage(_:)), "[", target: reader)
        item(view, "Increase Font Size", #selector(ReaderWindow.increaseFont(_:)), "+", target: reader)
        item(view, "Decrease Font Size", #selector(ReaderWindow.decreaseFont(_:)), "-", target: reader)
        view.addItem(.separator())
        let appearance = view.addItem(withTitle: "Appearance", action: nil, keyEquivalent: "")
        appearance.submenu = reader.makeAppearanceMenu()
        NSApp.mainMenu = menu
    }
}

#if !FOLIATE_TESTING
@main
enum Main {
    @MainActor static func main() {
        let app = NSApplication.shared
        app.setActivationPolicy(.regular)
        let delegate = FoliateApp()
        app.delegate = delegate
        withExtendedLifetime(delegate) { app.run() }
    }
}
#endif
