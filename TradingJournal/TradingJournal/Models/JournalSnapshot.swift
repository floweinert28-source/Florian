import Foundation
import SwiftData
import JournalCore

/// Überführt die persistenten Objekte in die Wertstrukturen der Analyse-Engine.
struct JournalSnapshot {
    let records: [TradeRecord]
    let checkIns: [CheckInDraft]
    let regimesByDay: [Date: MarketRegime]

    init(trades: [Trade], regimes: [MarketRegimeEntry] = [], checkIns: [DailyCheckIn] = [], calendar: Calendar = .current) {
        var byDay: [Date: MarketRegime] = [:]
        for entry in regimes {
            byDay[calendar.startOfDay(for: entry.date)] = entry.regime
        }
        regimesByDay = byDay
        records = trades.map { trade in
            trade.record(regime: byDay[calendar.startOfDay(for: trade.entryDate)])
        }
        self.checkIns = checkIns.map(\.draft)
    }

    var closedRecords: [TradeRecord] { records.filter(\.isClosed) }

    func records(in period: AnalysisPeriod, calendar: Calendar = .current, reference: Date = Date()) -> [TradeRecord] {
        period.filter(records, calendar: calendar, reference: reference)
    }
}
