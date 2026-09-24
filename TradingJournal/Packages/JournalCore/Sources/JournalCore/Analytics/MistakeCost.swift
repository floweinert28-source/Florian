import Foundation

/// Kosten eines einzelnen Fehlertyps.
public struct MistakeCostItem: Identifiable, Hashable, Sendable {
    public var mistake: String
    public var tradeCount: Int
    /// Summe der Ergebnisse aller Trades mit diesem Fehler.
    public var totalPnL: Double
    public var averagePnL: Double
    public var winRate: Double

    public var id: String { mistake }

    /// Kosten als positive Zahl, sofern die Trades Geld gekostet haben.
    public var cost: Double { max(0, -totalPnL) }
}

/// „Was hätte ich verdient, wenn ich nur regelkonform gehandelt hätte?“
public struct MistakeCostReport: Hashable, Sendable {
    public var actualPnL: Double
    /// Ergebnis nur der regelkonformen Trades.
    public var compliantPnL: Double
    /// Ergebnis aller nicht regelkonformen Trades (meist negativ).
    public var nonCompliantPnL: Double
    public var totalTrades: Int
    public var compliantTrades: Int
    public var items: [MistakeCostItem]

    /// Wie viel die Fehler unter dem Strich gekostet haben (positiv = Verlust durch Fehler).
    public var costOfMistakes: Double { compliantPnL - actualPnL }

    /// Anteil regelkonformer Trades.
    public var complianceRate: Double {
        totalTrades > 0 ? Double(compliantTrades) / Double(totalTrades) : 0
    }

    public static let empty = MistakeCostReport(actualPnL: 0, compliantPnL: 0, nonCompliantPnL: 0, totalTrades: 0, compliantTrades: 0, items: [])
}

public enum MistakeCostAnalysis {
    public static func report(for trades: [TradeRecord]) -> MistakeCostReport {
        let closed = trades.filter(\.isClosed)
        guard !closed.isEmpty else { return .empty }
        let compliant = closed.filter(\.isCompliant)
        let nonCompliant = closed.filter { !$0.isCompliant }

        var buckets: [String: [TradeRecord]] = [:]
        for trade in nonCompliant {
            var labels = trade.mistakes
            labels.append(contentsOf: trade.brokenRules)
            for label in labels where !label.isEmpty {
                buckets[label, default: []].append(trade)
            }
        }
        let items = buckets.map { label, group -> MistakeCostItem in
            let summary = PerformanceCalculator.summary(for: group)
            return MistakeCostItem(
                mistake: label,
                tradeCount: group.count,
                totalPnL: summary.totalPnL,
                averagePnL: summary.expectancy,
                winRate: summary.winRate
            )
        }
        .sorted { lhs, rhs in
            if lhs.totalPnL != rhs.totalPnL { return lhs.totalPnL < rhs.totalPnL }
            return lhs.mistake < rhs.mistake
        }

        return MistakeCostReport(
            actualPnL: closed.reduce(0) { $0 + $1.netPnL },
            compliantPnL: compliant.reduce(0) { $0 + $1.netPnL },
            nonCompliantPnL: nonCompliant.reduce(0) { $0 + $1.netPnL },
            totalTrades: closed.count,
            compliantTrades: compliant.count,
            items: items
        )
    }
}
