import Foundation

/// Zeitraum für Auswertungen.
public enum AnalysisPeriod: String, CaseIterable, Sendable, Hashable, Identifiable {
    case week
    case month
    case quarter
    case year
    case all

    public var id: String { rawValue }

    /// Datumsbereich des Zeitraums, bezogen auf `reference` (meist „jetzt“).
    /// `nil` bedeutet: keine Einschränkung.
    public func dateInterval(calendar: Calendar = .current, reference: Date = Date()) -> DateInterval? {
        switch self {
        case .week:
            return calendar.dateInterval(of: .weekOfYear, for: reference)
        case .month:
            return calendar.dateInterval(of: .month, for: reference)
        case .quarter:
            return calendar.dateInterval(of: .quarter, for: reference)
        case .year:
            return calendar.dateInterval(of: .year, for: reference)
        case .all:
            return nil
        }
    }

    /// Filtert Trades nach ihrem Ausstiegs- bzw. Einstiegsdatum.
    public func filter(_ trades: [TradeRecord], calendar: Calendar = .current, reference: Date = Date()) -> [TradeRecord] {
        guard let interval = dateInterval(calendar: calendar, reference: reference) else { return trades }
        return trades.filter { interval.contains($0.exitDate ?? $0.entryDate) }
    }
}
