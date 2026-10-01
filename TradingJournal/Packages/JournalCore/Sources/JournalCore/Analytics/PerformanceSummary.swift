import Foundation

/// Kennzahlen einer Trade-Menge.
public struct PerformanceSummary: Hashable, Sendable {
    public var tradeCount: Int = 0
    public var winCount: Int = 0
    public var lossCount: Int = 0
    public var breakevenCount: Int = 0
    public var totalPnL: Double = 0
    public var grossProfit: Double = 0
    /// Summe aller Verluste (negativ oder 0).
    public var grossLoss: Double = 0
    /// Anteil der Gewinner an allen Trades (0 … 1).
    public var winRate: Double = 0
    public var averageWin: Double = 0
    /// Durchschnittlicher Verlust (negativ oder 0).
    public var averageLoss: Double = 0
    /// Bruttogewinn ÷ Bruttoverlust. `nil`, wenn es keine Verluste gibt.
    public var profitFactor: Double?
    /// Erwartungswert pro Trade in Kontowährung.
    public var expectancy: Double = 0
    /// Durchschnittliches R-Multiple über alle Trades mit bekanntem Risiko.
    public var averageR: Double?
    /// Anzahl Trades, für die ein R-Multiple vorliegt.
    public var rSampleCount: Int = 0
    public var largestWin: Double = 0
    public var largestLoss: Double = 0
    /// Größter Rückgang der kumulierten P&L vom Hoch.
    public var maxDrawdown: Double = 0
    /// Aktuelle Serie: positiv = Gewinner in Folge, negativ = Verlierer in Folge.
    public var currentStreak: Int = 0
    public var longestWinStreak: Int = 0
    public var longestLossStreak: Int = 0
    public var averageHoldingTime: TimeInterval?

    public init() {}

    public static let empty = PerformanceSummary()

    /// Verhältnis Ø Gewinn zu Ø Verlust (Payoff Ratio).
    public var payoffRatio: Double? {
        guard averageLoss < 0 else { return nil }
        return averageWin / abs(averageLoss)
    }
}

public enum PerformanceCalculator {
    /// Berechnet alle Kennzahlen für abgeschlossene Trades. Offene Trades werden ignoriert.
    public static func summary(for trades: [TradeRecord]) -> PerformanceSummary {
        let closed = trades.filter(\.isClosed).sorted { ($0.exitDate ?? $0.entryDate) < ($1.exitDate ?? $1.entryDate) }
        guard !closed.isEmpty else { return .empty }

        var summary = PerformanceSummary()
        summary.tradeCount = closed.count

        var wins: [Double] = []
        var losses: [Double] = []
        var rMultiples: [Double] = []
        var holdingTimes: [TimeInterval] = []
        var cumulative = 0.0
        var peak = 0.0
        var maxDrawdown = 0.0
        var streak = 0
        var longestWin = 0
        var longestLoss = 0

        for trade in closed {
            let pnl = trade.netPnL
            summary.totalPnL += pnl
            switch trade.outcome {
            case .win:
                wins.append(pnl)
                streak = streak > 0 ? streak + 1 : 1
                longestWin = max(longestWin, streak)
            case .loss:
                losses.append(pnl)
                streak = streak < 0 ? streak - 1 : -1
                longestLoss = max(longestLoss, -streak)
            case .breakeven:
                summary.breakevenCount += 1
                streak = 0
            }
            if let r = trade.rMultiple { rMultiples.append(r) }
            if let duration = trade.holdingDuration { holdingTimes.append(duration) }

            cumulative += pnl
            peak = max(peak, cumulative)
            maxDrawdown = max(maxDrawdown, peak - cumulative)
        }

        summary.winCount = wins.count
        summary.lossCount = losses.count
        summary.grossProfit = wins.reduce(0, +)
        summary.grossLoss = losses.reduce(0, +)
        summary.winRate = Double(wins.count) / Double(closed.count)
        summary.averageWin = Statistics.mean(wins)
        summary.averageLoss = Statistics.mean(losses)
        summary.profitFactor = summary.grossLoss < 0 ? summary.grossProfit / abs(summary.grossLoss) : nil
        summary.expectancy = summary.totalPnL / Double(closed.count)
        summary.rSampleCount = rMultiples.count
        summary.averageR = rMultiples.isEmpty ? nil : Statistics.mean(rMultiples)
        summary.largestWin = wins.max() ?? 0
        summary.largestLoss = losses.min() ?? 0
        summary.maxDrawdown = maxDrawdown
        summary.currentStreak = streak
        summary.longestWinStreak = longestWin
        summary.longestLossStreak = longestLoss
        summary.averageHoldingTime = holdingTimes.isEmpty ? nil : Statistics.mean(holdingTimes)
        return summary
    }
}

/// Kennzahlen je Gruppe (Setup, Strategie, Fehler, Emotion …).
public struct GroupPerformance: Identifiable, Hashable, Sendable {
    public var key: String
    public var summary: PerformanceSummary

    public var id: String { key }

    public init(key: String, summary: PerformanceSummary) {
        self.key = key
        self.summary = summary
    }
}

public enum GroupedPerformance {
    /// Gruppiert Trades über eine Schlüsselfunktion. Ein Trade kann mehreren Gruppen angehören
    /// (z. B. mehrere Fehler-Tags). Gruppen sind nach Gesamtergebnis absteigend sortiert.
    public static func group(
        _ trades: [TradeRecord],
        by keys: (TradeRecord) -> [String],
        sortedBy sort: GroupSort = .totalPnL
    ) -> [GroupPerformance] {
        var buckets: [String: [TradeRecord]] = [:]
        for trade in trades {
            for key in keys(trade) where !key.isEmpty {
                buckets[key, default: []].append(trade)
            }
        }
        let groups = buckets.map { GroupPerformance(key: $0.key, summary: PerformanceCalculator.summary(for: $0.value)) }
        return groups.sorted { lhs, rhs in
            switch sort {
            case .totalPnL:
                if lhs.summary.totalPnL != rhs.summary.totalPnL { return lhs.summary.totalPnL > rhs.summary.totalPnL }
            case .tradeCount:
                if lhs.summary.tradeCount != rhs.summary.tradeCount { return lhs.summary.tradeCount > rhs.summary.tradeCount }
            case .name:
                break
            }
            return lhs.key.localizedCaseInsensitiveCompare(rhs.key) == .orderedAscending
        }
    }

    public static func bySetup(_ trades: [TradeRecord]) -> [GroupPerformance] {
        group(trades, by: { $0.setup.map { [$0] } ?? [] })
    }

    public static func byStrategy(_ trades: [TradeRecord]) -> [GroupPerformance] {
        group(trades, by: { $0.strategy.map { [$0] } ?? [] })
    }

    public static func byMarketPhase(_ trades: [TradeRecord]) -> [GroupPerformance] {
        group(trades, by: { $0.marketPhase.map { [$0] } ?? [] })
    }

    public static func byEmotion(_ trades: [TradeRecord]) -> [GroupPerformance] {
        group(trades, by: \.emotions, sortedBy: .tradeCount)
    }

    public static func bySymbol(_ trades: [TradeRecord]) -> [GroupPerformance] {
        group(trades, by: { [$0.symbol] })
    }

    public enum GroupSort: Sendable {
        case totalPnL
        case tradeCount
        case name
    }
}
