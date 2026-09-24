import Foundation
import JournalCore

extension ImportField {
    var title: String {
        switch self {
        case .symbol: String(localized: "Symbol")
        case .direction: String(localized: "Richtung")
        case .entryDate: String(localized: "Einstiegsdatum")
        case .entryTime: String(localized: "Einstiegszeit (separat)")
        case .exitDate: String(localized: "Ausstiegsdatum")
        case .exitTime: String(localized: "Ausstiegszeit (separat)")
        case .quantity: String(localized: "Menge")
        case .entryPrice: String(localized: "Einstiegskurs")
        case .exitPrice: String(localized: "Ausstiegskurs")
        case .pnl: String(localized: "Ergebnis (netto)")
        case .fees: String(localized: "Gebühren")
        case .multiplier: String(localized: "Punktwert")
        case .plannedEntry: String(localized: "Geplanter Einstieg")
        case .plannedStop: String(localized: "Geplanter Stop")
        case .plannedTarget: String(localized: "Geplantes Ziel")
        case .initialStop: String(localized: "Tatsächlicher Stop")
        case .maePrice: String(localized: "MAE-Kurs")
        case .mfePrice: String(localized: "MFE-Kurs")
        case .setup: String(localized: "Setup")
        case .strategy: String(localized: "Strategie")
        case .marketPhase: String(localized: "Marktphase")
        case .notes: String(localized: "Notizen")
        }
    }

    /// Reihenfolge und Gruppierung im Formular.
    static let primaryFields: [ImportField] = [.symbol, .entryDate, .entryTime, .quantity, .entryPrice, .direction, .exitDate, .exitTime, .exitPrice, .pnl, .fees]
    static let secondaryFields: [ImportField] = [.multiplier, .plannedEntry, .plannedStop, .plannedTarget, .initialStop, .maePrice, .mfePrice, .setup, .strategy, .marketPhase, .notes]
}

extension ImportIssueKind {
    var message: String {
        switch self {
        case .missingValue(let field): String(localized: "\(field.title) fehlt")
        case .invalidNumber(let field, let raw): String(localized: "\(field.title): „\(raw)“ ist keine Zahl")
        case .invalidDate(let field, let raw): String(localized: "\(field.title): „\(raw)“ ist kein Datum")
        case .invalidDirection(let raw): String(localized: "Richtung „\(raw)“ nicht erkannt")
        }
    }
}

extension DecimalSeparatorOption {
    var title: String {
        switch self {
        case .automatic: String(localized: "Automatisch")
        case .comma: String(localized: "Komma (1.234,56)")
        case .point: String(localized: "Punkt (1,234.56)")
        }
    }
}
