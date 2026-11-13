import Foundation
import UniformTypeIdentifiers
import WebKit

// Never map a URL supplied by page JavaScript directly to a filesystem path.
// Only bundled reader assets and the book explicitly opened by the user are served.
@MainActor
final class ReaderResources: NSObject, WKURLSchemeHandler {
    let root: URL
    private var book: (url: URL, token: String)?

    init(root: URL) {
        self.root = root.resolvingSymlinksInPath().standardizedFileURL
    }

    func grant(_ file: URL) -> URL {
        let token = UUID().uuidString
        book = (file, token)
        return URL(string: "foliate://app/book/\(token)/")!
            .appendingPathComponent(file.lastPathComponent)
    }

    func resolve(_ url: URL) throws -> URL {
        guard url.scheme == "foliate", url.host == "app" else {
            throw URLError(.unsupportedURL)
        }
        let parts = url.pathComponents.filter { $0 != "/" }
        if parts.first == "book", parts.count == 3,
           let book, parts[1] == book.token, parts[2] == book.url.lastPathComponent {
            return book.url
        }
        guard let directory = parts.first,
              ["reader", "foliate-js", "macos"].contains(directory) else {
            throw URLError(.noPermissionsToReadFile)
        }
        let file = root.appendingPathComponent(url.path)
            .resolvingSymlinksInPath().standardizedFileURL
        guard file.path.hasPrefix(root.path + "/") else {
            throw URLError(.noPermissionsToReadFile)
        }
        return file
    }

    func webView(_ webView: WKWebView, start task: any WKURLSchemeTask) {
        do {
            guard let url = task.request.url else { throw URLError(.badURL) }
            let file = try resolve(url)
            let data = try Data(contentsOf: file, options: .mappedIfSafe)
            let scriptTypes = ["js": "application/javascript", "mjs": "application/javascript"]
            let mime = scriptTypes[file.pathExtension] ?? UTType(filenameExtension: file.pathExtension)?
                .preferredMIMEType ?? "application/octet-stream"
            let response = HTTPURLResponse(url: url, statusCode: 200,
                httpVersion: "HTTP/1.1", headerFields: [
                    "Content-Type": mime,
                    "Content-Length": String(data.count),
                    "Cache-Control": "no-store",
                ])!
            task.didReceive(response)
            task.didReceive(data)
            task.didFinish()
        } catch {
            task.didFailWithError(error)
        }
    }

    func webView(_ webView: WKWebView, stop task: any WKURLSchemeTask) {
        // Requests complete synchronously; no outstanding callbacks remain.
    }
}
