import Foundation

/// Dimensionen des Trader-Scores.
public enum TraderScoreAxis: String, CaseIterable, Sendable, Hashable, Identifiable {
    /// Anteil der Gewinner.
    case winRate
    /// Bruttogewinn ÷ Bruttoverlust.
    case profitFactor
    /// Ø Gewinn ÷ Ø Verlust.
    case payoffRatio
    /// Gesamtergebnis ÷ maximaler Drawdown.
    case recoveryFactor
    /// Maximaler Drawdown relativ zur Kontogröße (weniger ist besser).
    case maxDrawdown
    /// Wie gleichmäßig die Gewinne über die Tage verteilt sind.
    case consistency

    public var id: String { rawValue }
}

public struct TraderScoreComponent: Identifiable, Hashable, Sendable {
    public var axis: TraderScoreAxis
    /// Rohwert (z. B. 0,54 für die Win-Rate, 1,8 für den Profit-Faktor).
    public var value: Double?
    /// Normierter Wert 0 … 1.
    public var score: Double

    public var id: TraderScoreAxis { axis }
}

/// Gesamtbewertung 0 … 100 aus sechs Dimensionen, wie sie Trading-Dashboards als Radar zeigen.
public struct TraderScore: Hashable, Sendable {
    public var components: [TraderScoreComponent]
    public var overall: Double
    public var tradeCount: Int

    public static let empty = TraderScore(components: TraderScoreAxis.allCases.map { TraderScoreComponent(axis: $0, value: nil, score: 0) }, overall: 0, tradeCount: 0)

    public func component(_ axis: TraderScoreAxis) -> TraderScoreComponent {
        components.first { $0.axis == axis } ?? TraderScoreComponent(axis: axis, value: nil, score: 0)
    }
}

public enum TraderScoreCalculator {
    public static func score(for trades: [TradeRecord], accountSize: Double, calendar: Calendar = .current) -> TraderScore {
        let summary = PerformanceCalculator.summary(for: trades)
        guard summary.tradeCount > 0 else { return .empty }
        let days = DailyAggregation.days(for: trades, calendar: calendar)

        let winRate = summary.winRate
        let profitFactor = summary.profitFactor
        let payoff = summary.payoffRatio
        let recovery: Double? = summary.maxDrawdown > 0 ? summary.totalPnL / summary.maxDrawdown : nil
        let drawdownFraction = accountSize > 0 ? summary.maxDrawdown / accountSize : 0
        let consistency = consistencyScore(days: days)

        let components = [
            TraderScoreComponent(axis: .winRate, value: winRate, score: clamp(winRate / 0.7)),
            TraderScoreComponent(axis: .profitFactor, value: profitFactor, score: profitFactor.map { clamp(($0 - 0.5) / 2.5) } ?? (summary.grossProfit > 0 ? 1 : 0)),
            TraderScoreComponent(axis: .payoffRatio, value: payoff, score: payoff.map { clamp($0 / 3) } ?? (summary.averageWin > 0 ? 1 : 0)),
            TraderScoreComponent(axis: .recoveryFactor, value: recovery, score: recovery.map { clamp($0 / 5) } ?? (summary.totalPnL > 0 ? 1 : 0)),
            TraderScoreComponent(axis: .maxDrawdown, value: drawdownFraction, score: 1 - clamp(drawdownFraction / 0.25)),
            TraderScoreComponent(axis: .consistency, value: consistency, score: consistency),
        ]
        let overall = components.reduce(0) { $0 + $1.score } / Double(components.count) * 100
        return TraderScore(components: components, overall: overall.rounded(), tradeCount: summary.tradeCount)
    }

    /// 1 = Gewinne gleichmäßig verteilt, 0 = ein einzelner Tag trägt alles.
    static func consistencyScore(days: [DayPerformance]) -> Double {
        let profitDays = days.filter { $0.pnl > 0 }
        guard days.count >= 3, !profitDays.isEmpty else { return 0 }
        let grossProfit = profitDays.reduce(0) { $0 + $1.pnl }
        let best = profitDays.map(\.pnl).max() ?? 0
        let bestShare = grossProfit > 0 ? best / grossProfit : 1
        let profitableDayRate = Double(profitDays.count) / Double(days.count)
        return clamp((1 - bestShare) * 0.6 + profitableDayRate * 0.4)
    }

    private static func clamp(_ value: Double) -> Double {
        min(max(value, 0), 1)
    }
}
