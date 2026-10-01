import Foundation
import SwiftData
import JournalCore

enum TradeImportError: LocalizedError {
    case unreadable
    case accessDenied

    var errorDescription: String? {
        switch self {
        case .unreadable: String(localized: "Die Datei konnte nicht als Text gelesen werden.")
        case .accessDenied: String(localized: "Kein Zugriff auf die Datei.")
        }
    }
}

/// Liest CSV-Dateien ein und legt daraus Trades an.
enum TradeImportService {
    static func loadText(from url: URL) throws -> String {
        let scoped = url.startAccessingSecurityScopedResource()
        defer { if scoped { url.stopAccessingSecurityScopedResource() } }
        let data = try Data(contentsOf: url)
        for encoding in [String.Encoding.utf8, .isoLatin1, .windowsCP1252, .utf16] {
            if let text = String(data: data, encoding: encoding) { return text }
        }
        throw TradeImportError.unreadable
    }

    /// Legt Trades aus Entwürfen an und verknüpft Tags. Gibt die Anzahl angelegter Trades zurück.
    @MainActor
    @discardableResult
    static func insert(_ drafts: [TradeDraft], into context: ModelContext) throws -> Int {
        var resolver = TagResolver(context: context)
        for draft in drafts {
            let trade = Trade(symbol: draft.symbol)
            trade.apply(draft)
            context.insert(trade)
            resolver.link(draft, to: trade)
        }
        try context.save()
        return drafts.count
    }
}
