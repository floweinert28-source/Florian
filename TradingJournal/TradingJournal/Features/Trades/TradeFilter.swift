import Foundation
import JournalCore

/// Filter der Trade-Liste.
struct TradeFilter: Equatable {
    enum Outcome: String, CaseIterable, Identifiable {
        case all, wins, losses, open
        var id: String { rawValue }

        var title: String {
            switch self {
            case .all: String(localized: "Alle")
            case .wins: String(localized: "Gewinner")
            case .losses: String(localized: "Verlierer")
            case .open: String(localized: "Offen")
            }
        }
    }

    var outcome: Outcome = .all
    var direction: TradeDirection? = nil
    var setupName: String? = nil
    var onlyMistakes = false
    var period: AnalysisPeriod = .all

    var isActive: Bool {
        outcome != .all || direction != nil || setupName != nil || onlyMistakes || period != .all
    }

    var activeCount: Int {
        [outcome != .all, direction != nil, setupName != nil, onlyMistakes, period != .all].filter { $0 }.count
    }

    func apply(to trades: [Trade], search: String) -> [Trade] {
        let query = search.trimmingCharacters(in: .whitespaces).lowercased()
        let interval = period.dateInterval()
        return trades.filter { trade in
            switch outcome {
            case .all: break
            case .wins: guard trade.isClosed, trade.netPnL > 0 else { return false }
            case .losses: guard trade.isClosed, trade.netPnL < 0 else { return false }
            case .open: guard !trade.isClosed else { return false }
            }
            if let direction, trade.direction != direction { return false }
            if let setupName, trade.setupTag?.name != setupName { return false }
            if onlyMistakes, trade.isCompliant { return false }
            if let interval, !interval.contains(trade.exitDate ?? trade.entryDate) { return false }
            if !query.isEmpty {
                let haystack = [
                    trade.symbol,
                    trade.notes,
                    trade.planReason,
                    trade.sortedTags.map(\.name).joined(separator: " "),
                ].joined(separator: " ").lowercased()
                if !haystack.contains(query) { return false }
            }
            return true
        }
    }
}
