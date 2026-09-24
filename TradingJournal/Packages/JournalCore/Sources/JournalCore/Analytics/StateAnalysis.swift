import Foundation

/// Kennzahlen für eine Zustandsklasse (z. B. „< 6 h Schlaf“ oder „Stimmung 4“).
public struct StateBucketPerformance: Identifiable, Hashable, Sendable {
    public var key: String
    public var sortKey: Int
    public var dayCount: Int
    public var summary: PerformanceSummary
    public var id: String { key }
}

public enum SleepBucket: Int, CaseIterable, Sendable, Identifiable {
    case underSix
    case sixToSeven
    case sevenToEight
    case overEight

    public var id: Int { rawValue }

    public static func bucket(for hours: Double) -> SleepBucket {
        switch hours {
        case ..<6: .underSix
        case ..<7: .sixToSeven
        case ..<8: .sevenToEight
        default: .overEight
        }
    }
}

public struct StateCorrelationReport: Hashable, Sendable {
    public var bySleep: [StateBucketPerformance]
    public var byStress: [StateBucketPerformance]
    public var byMood: [StateBucketPerformance]
    /// Pearson-Korrelation zwischen Tageswert und Tagesergebnis (−1 … 1), `nil` bei zu wenigen Tagen.
    public var sleepCorrelation: Double?
    public var stressCorrelation: Double?
    public var moodCorrelation: Double?
    /// Tage mit Check-in und Trades.
    public var matchedDays: Int

    public static let empty = StateCorrelationReport(bySleep: [], byStress: [], byMood: [], sleepCorrelation: nil, stressCorrelation: nil, moodCorrelation: nil, matchedDays: 0)
}

public enum StateAnalysis {
    public static func report(trades: [TradeRecord], checkIns: [CheckInDraft], calendar: Calendar = .current) -> StateCorrelationReport {
        let days = DailyAggregation.days(for: trades, calendar: calendar)
        var checkInByDay: [Date: CheckInDraft] = [:]
        for checkIn in checkIns {
            checkInByDay[calendar.startOfDay(for: checkIn.date)] = checkIn
        }

        var matched: [(day: DayPerformance, checkIn: CheckInDraft)] = []
        for day in days {
            if let checkIn = checkInByDay[day.day] { matched.append((day, checkIn)) }
        }
        guard !matched.isEmpty else { return .empty }

        func buckets(_ key: (CheckInDraft) -> (String, Int)) -> [StateBucketPerformance] {
            var groups: [String: (sort: Int, days: Int, trades: [TradeRecord])] = [:]
            for (day, checkIn) in matched {
                let (label, sort) = key(checkIn)
                var entry = groups[label] ?? (sort, 0, [])
                entry.days += 1
                entry.trades.append(contentsOf: day.trades)
                groups[label] = entry
            }
            return groups
                .map { StateBucketPerformance(key: $0.key, sortKey: $0.value.sort, dayCount: $0.value.days, summary: PerformanceCalculator.summary(for: $0.value.trades)) }
                .sorted { $0.sortKey < $1.sortKey }
        }

        let pnls = matched.map(\.day.pnl)
        return StateCorrelationReport(
            bySleep: buckets { let b = SleepBucket.bucket(for: $0.sleepHours); return ("sleep.\(b.rawValue)", b.rawValue) },
            byStress: buckets { ("stress.\($0.stressLevel)", $0.stressLevel) },
            byMood: buckets { ("mood.\($0.mood)", $0.mood) },
            sleepCorrelation: correlation(matched.map(\.checkIn.sleepHours), pnls),
            stressCorrelation: correlation(matched.map { Double($0.checkIn.stressLevel) }, pnls),
            moodCorrelation: correlation(matched.map { Double($0.checkIn.mood) }, pnls),
            matchedDays: matched.count
        )
    }

    /// Pearson-Korrelation; `nil` bei weniger als 5 Paaren oder fehlender Varianz.
    public static func correlation(_ xs: [Double], _ ys: [Double]) -> Double? {
        guard xs.count == ys.count, xs.count >= 5 else { return nil }
        let mx = Statistics.mean(xs)
        let my = Statistics.mean(ys)
        var num = 0.0, dx = 0.0, dy = 0.0
        for (x, y) in zip(xs, ys) {
            num += (x - mx) * (y - my)
            dx += (x - mx) * (x - mx)
            dy += (y - my) * (y - my)
        }
        guard dx > 0, dy > 0 else { return nil }
        return num / (dx * dy).squareRoot()
    }
}
