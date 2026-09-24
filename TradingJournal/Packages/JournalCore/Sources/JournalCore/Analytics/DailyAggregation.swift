import Foundation

/// Ergebnis eines Handelstages.
public struct DayPerformance: Identifiable, Hashable, Sendable {
    /// Tagesbeginn im verwendeten Kalender.
    public var day: Date
    public var pnl: Double
    public var tradeCount: Int
    public var trades: [TradeRecord]

    public var id: Date { day }
    public var isLosingDay: Bool { pnl < 0 }
}

public enum DailyAggregation {
    /// Gruppiert abgeschlossene Trades nach dem Tag ihres Einstiegs, chronologisch sortiert.
    public static func days(for trades: [TradeRecord], calendar: Calendar = .current) -> [DayPerformance] {
        var buckets: [Date: [TradeRecord]] = [:]
        for trade in trades where trade.isClosed {
            let day = calendar.startOfDay(for: trade.entryDate)
            buckets[day, default: []].append(trade)
        }
        return buckets.keys.sorted().map { day in
            let group = (buckets[day] ?? []).sorted { $0.entryDate < $1.entryDate }
            return DayPerformance(day: day, pnl: group.reduce(0) { $0 + $1.netPnL }, tradeCount: group.count, trades: group)
        }
    }

    /// Trades desselben Kalendertages wie `reference`, chronologisch sortiert.
    public static func session(of trades: [TradeRecord], on reference: Date, calendar: Calendar = .current) -> [TradeRecord] {
        let day = calendar.startOfDay(for: reference)
        return trades
            .filter { calendar.startOfDay(for: $0.entryDate) == day }
            .sorted { $0.entryDate < $1.entryDate }
    }
}
