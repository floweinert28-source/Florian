import Foundation

/// Bausteine des Disziplin-Scores.
public enum DisciplineComponentKind: String, CaseIterable, Sendable, Hashable, Identifiable {
    /// Einstieg, Stop und Ziel wurden vor dem Trade festgehalten.
    case planComplete
    /// Der tatsächliche Einstieg lag nahe am geplanten.
    case entryAdherence
    /// Der Verlust blieb innerhalb des geplanten Risikos.
    case stopRespected
    /// Keine Fehler-Tags.
    case noMistakes
    /// Keine gebrochenen Regeln.
    case rulesFollowed

    public var id: String { rawValue }

    /// Gewichtung, Summe = 1.
    public var weight: Double {
        switch self {
        case .planComplete: 0.25
        case .entryAdherence: 0.20
        case .stopRespected: 0.25
        case .noMistakes: 0.20
        case .rulesFollowed: 0.10
        }
    }
}

public struct DisciplineComponent: Identifiable, Hashable, Sendable {
    public var kind: DisciplineComponentKind
    /// Erfüllungsgrad 0 … 1.
    public var fulfillment: Double
    public var id: DisciplineComponentKind { kind }

    public var weightedPoints: Double { fulfillment * kind.weight * 100 }
}

/// Disziplin-Bewertung eines einzelnen Trades.
public struct TradeDiscipline: Hashable, Sendable {
    public var tradeID: UUID
    public var components: [DisciplineComponent]
    /// 0 … 100
    public var score: Double
    /// Abweichung des Einstiegs vom Plan in R (falls bestimmbar).
    public var entryDeviationR: Double?
}

public struct DisciplineConfiguration: Sendable {
    /// Toleranz für den Einstieg in R, innerhalb derer volle Punkte vergeben werden.
    public var entryToleranceR: Double = 0.25
    /// Zusätzlicher Spielraum über 1R hinaus (Slippage), der noch als „Stop eingehalten“ gilt.
    public var stopToleranceR: Double = 0.15

    public init() {}
}

public enum DisciplineGranularity: String, CaseIterable, Sendable, Identifiable {
    case day
    case week
    case month
    public var id: String { rawValue }
}

public struct DisciplinePeriodScore: Identifiable, Hashable, Sendable {
    public var periodStart: Date
    public var score: Double
    public var tradeCount: Int
    public var id: Date { periodStart }
}

public enum DisciplineEvaluator {
    public static func evaluate(_ trade: TradeRecord, configuration: DisciplineConfiguration = .init()) -> TradeDiscipline {
        var components: [DisciplineComponent] = []
        var entryDeviationR: Double?

        let plan = trade.plan
        components.append(DisciplineComponent(kind: .planComplete, fulfillment: plan?.isComplete == true ? 1 : partialPlanCredit(plan)))

        if let plan, let plannedEntry = plan.entry, let risk = plan.riskPerUnit {
            let deviation = abs(trade.entryPrice - plannedEntry) / risk
            entryDeviationR = deviation
            let excess = max(0, deviation - configuration.entryToleranceR)
            components.append(DisciplineComponent(kind: .entryAdherence, fulfillment: clamp(1 - excess / 0.75)))
        } else {
            components.append(DisciplineComponent(kind: .entryAdherence, fulfillment: 0))
        }

        if trade.isClosed, trade.outcome == .loss {
            if let r = trade.rMultiple {
                let limit = -(1 + configuration.stopToleranceR)
                let excess = max(0, limit - r)
                components.append(DisciplineComponent(kind: .stopRespected, fulfillment: clamp(1 - excess / 0.85)))
            } else {
                components.append(DisciplineComponent(kind: .stopRespected, fulfillment: 0))
            }
        } else {
            components.append(DisciplineComponent(kind: .stopRespected, fulfillment: trade.effectiveStop != nil ? 1 : 0))
        }

        components.append(DisciplineComponent(kind: .noMistakes, fulfillment: trade.mistakes.isEmpty ? 1 : 0))
        components.append(DisciplineComponent(kind: .rulesFollowed, fulfillment: trade.brokenRules.isEmpty ? 1 : 0))

        let score = components.reduce(0) { $0 + $1.weightedPoints }
        return TradeDiscipline(tradeID: trade.id, components: components, score: score.rounded(), entryDeviationR: entryDeviationR)
    }

    /// Durchschnittlicher Score über abgeschlossene Trades. `nil` ohne Trades.
    public static func averageScore(for trades: [TradeRecord], configuration: DisciplineConfiguration = .init()) -> Double? {
        let closed = trades.filter(\.isClosed)
        guard !closed.isEmpty else { return nil }
        let total = closed.reduce(0) { $0 + evaluate($1, configuration: configuration).score }
        return (total / Double(closed.count)).rounded()
    }

    /// Verlauf des Scores je Tag, Woche oder Monat.
    public static func timeline(
        for trades: [TradeRecord],
        granularity: DisciplineGranularity,
        calendar: Calendar = .current,
        configuration: DisciplineConfiguration = .init()
    ) -> [DisciplinePeriodScore] {
        let component: Calendar.Component = switch granularity {
        case .day: .day
        case .week: .weekOfYear
        case .month: .month
        }
        var buckets: [Date: [Double]] = [:]
        for trade in trades where trade.isClosed {
            guard let start = calendar.dateInterval(of: component, for: trade.entryDate)?.start else { continue }
            buckets[start, default: []].append(evaluate(trade, configuration: configuration).score)
        }
        return buckets.keys.sorted().map { start in
            let scores = buckets[start] ?? []
            return DisciplinePeriodScore(periodStart: start, score: Statistics.mean(scores).rounded(), tradeCount: scores.count)
        }
    }

    private static func partialPlanCredit(_ plan: TradePlan?) -> Double {
        guard let plan else { return 0 }
        var filled = 0.0
        if plan.entry != nil { filled += 1 }
        if plan.stop != nil { filled += 1 }
        if plan.target != nil { filled += 1 }
        return filled / 3 * 0.6
    }

    private static func clamp(_ value: Double) -> Double {
        min(max(value, 0), 1)
    }
}
