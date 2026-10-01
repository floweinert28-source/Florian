import Foundation
import Observation
import JournalCore

/// Zustand des CSV-Imports: Datei, Zuordnung, Vorschau.
@Observable
@MainActor
final class CSVImportViewModel {
    enum Step: Equatable {
        case pickFile
        case mapColumns
        case finished(count: Int)
    }

    var step: Step = .pickFile
    var fileName: String = ""
    var document: CSVDocument?
    var mapping = ColumnMapping()
    var decimalSeparator: DecimalSeparatorOption = .automatic
    var dateFormat: String = ""
    var defaultMultiplier: Double = 1
    var errorMessage: String?

    var options: ImportOptions {
        var options = ImportOptions()
        options.decimalSeparator = decimalSeparator
        options.dateFormat = dateFormat.trimmingCharacters(in: .whitespaces).isEmpty ? nil : dateFormat
        options.defaultMultiplier = defaultMultiplier > 0 ? defaultMultiplier : 1
        return options
    }

    /// Vorschau aller Zeilen mit der aktuellen Zuordnung.
    var preview: ImportResult? {
        guard let document, mapping.isValid else { return nil }
        return CSVTradeMapper.map(document, mapping: mapping, options: options)
    }

    func load(text: String, fileName: String) {
        let document = CSVParser.parse(text)
        guard !document.headers.isEmpty, !document.rows.isEmpty else {
            errorMessage = String(localized: "Die Datei enthält keine Datenzeilen.")
            return
        }
        self.document = document
        self.fileName = fileName
        mapping = ColumnMapping.suggested(for: document.headers)
        errorMessage = nil
        step = .mapColumns
    }

    func load(url: URL) {
        do {
            let text = try TradeImportService.loadText(from: url)
            load(text: text, fileName: url.lastPathComponent)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func reset() {
        step = .pickFile
        document = nil
        mapping = ColumnMapping()
        fileName = ""
        errorMessage = nil
    }

    func binding(for field: ImportField) -> Int? {
        mapping[field]
    }

    func set(_ column: Int?, for field: ImportField) {
        mapping[field] = column
    }
}
