import Foundation

/// Kennzahlen je Wochentag. `weekday` folgt `Calendar` (1 = Sonntag).
public struct WeekdayPerformance: Identifiable, Hashable, Sendable {
    public var weekday: Int
    public var summary: PerformanceSummary
    public var id: Int { weekday }
}

/// Kennzahlen je Einstiegsstunde (0 … 23).
public struct HourPerformance: Identifiable, Hashable, Sendable {
    public var hour: Int
    public var summary: PerformanceSummary
    public var id: Int { hour }
}

/// Haltedauer-Klassen.
public enum HoldingDurationBucket: Int, CaseIterable, Sendable, Hashable, Identifiable {
    case underFiveMinutes
    case fiveToThirtyMinutes
    case thirtyMinutesToTwoHours
    case twoToEightHours
    case intraday
    case multiDay

    public var id: Int { rawValue }

    public static func bucket(for duration: TimeInterval) -> HoldingDurationBucket {
        switch duration {
        case ..<(5 * 60): return .underFiveMinutes
        case ..<(30 * 60): return .fiveToThirtyMinutes
        case ..<(2 * 3600): return .thirtyMinutesToTwoHours
        case ..<(8 * 3600): return .twoToEightHours
        case ..<(24 * 3600): return .intraday
        default: return .multiDay
        }
    }
}

public struct HoldingDurationPerformance: Identifiable, Hashable, Sendable {
    public var bucket: HoldingDurationBucket
    public var summary: PerformanceSummary
    public var id: Int { bucket.rawValue }
}

public enum TimeAnalysis {
    /// Ergebnis je Wochentag, sortiert nach dem ersten Wochentag des Kalenders.
    public static func byWeekday(_ trades: [TradeRecord], calendar: Calendar = .current) -> [WeekdayPerformance] {
        let closed = trades.filter(\.isClosed)
        var buckets: [Int: [TradeRecord]] = [:]
        for trade in closed {
            let weekday = calendar.component(.weekday, from: trade.entryDate)
            buckets[weekday, default: []].append(trade)
        }
        let first = calendar.firstWeekday
        let order = (0..<7).map { ((first - 1 + $0) % 7) + 1 }
        return order.compactMap { weekday in
            guard let group = buckets[weekday] else { return nil }
            return WeekdayPerformance(weekday: weekday, summary: PerformanceCalculator.summary(for: group))
        }
    }

    /// Ergebnis je Einstiegsstunde, aufsteigend sortiert.
    public static func byHour(_ trades: [TradeRecord], calendar: Calendar = .current) -> [HourPerformance] {
        let closed = trades.filter(\.isClosed)
        var buckets: [Int: [TradeRecord]] = [:]
        for trade in closed {
            buckets[calendar.component(.hour, from: trade.entryDate), default: []].append(trade)
        }
        return buckets.keys.sorted().map { HourPerformance(hour: $0, summary: PerformanceCalculator.summary(for: buckets[$0] ?? [])) }
    }

    /// Ergebnis je Haltedauer-Klasse in fester Reihenfolge.
    public static func byHoldingDuration(_ trades: [TradeRecord]) -> [HoldingDurationPerformance] {
        var buckets: [HoldingDurationBucket: [TradeRecord]] = [:]
        for trade in trades {
            guard let duration = trade.holdingDuration else { continue }
            buckets[HoldingDurationBucket.bucket(for: duration), default: []].append(trade)
        }
        return HoldingDurationBucket.allCases.compactMap { bucket in
            guard let group = buckets[bucket] else { return nil }
            return HoldingDurationPerformance(bucket: bucket, summary: PerformanceCalculator.summary(for: group))
        }
    }
}
