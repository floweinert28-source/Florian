import Foundation
import Testing
@testable import JournalCore

@Suite("Kennzahlen")
struct PerformanceTests {
    @Test("Leere Menge ergibt leere Kennzahlen")
    func emptySummary() {
        let summary = PerformanceCalculator.summary(for: [])
        #expect(summary.tradeCount == 0)
        #expect(summary.winRate == 0)
        #expect(summary.profitFactor == nil)
    }

    @Test("Win-Rate, Profit-Faktor, Expectancy und R")
    func basicMetrics() {
        let trades = [
            Fixtures.trade(r: 2, entry: Fixtures.date(2026, 3, 2)),
            Fixtures.trade(r: -1, entry: Fixtures.date(2026, 3, 3)),
            Fixtures.trade(r: 1, entry: Fixtures.date(2026, 3, 4)),
            Fixtures.trade(r: -1, entry: Fixtures.date(2026, 3, 5)),
        ]
        let s = PerformanceCalculator.summary(for: trades)
        #expect(s.tradeCount == 4)
        #expect(s.winCount == 2)
        #expect(s.lossCount == 2)
        #expect(abs(s.winRate - 0.5) < 1e-9)
        #expect(abs(s.totalPnL - 100) < 1e-9)
        #expect(abs(s.grossProfit - 300) < 1e-9)
        #expect(abs(s.grossLoss + 200) < 1e-9)
        #expect(abs((s.profitFactor ?? 0) - 1.5) < 1e-9)
        #expect(abs(s.expectancy - 25) < 1e-9)
        #expect(abs((s.averageR ?? 0) - 0.25) < 1e-9)
        #expect(abs(s.averageWin - 150) < 1e-9)
        #expect(abs(s.averageLoss + 100) < 1e-9)
        #expect(s.currentStreak == -1)
        #expect(s.longestWinStreak == 1)
        #expect(s.longestLossStreak == 1)
        #expect(abs(s.maxDrawdown - 100) < 1e-9)
    }

    @Test("Offene Trades werden ignoriert")
    func ignoresOpenTrades() {
        var open = Fixtures.trade(r: 1)
        open.exitDate = nil
        let s = PerformanceCalculator.summary(for: [open, Fixtures.trade(r: 1)])
        #expect(s.tradeCount == 1)
    }

    @Test("R-Multiple und MAE/MFE")
    func rMultipleAndExcursions() {
        var trade = Fixtures.trade(r: 1.5, quantity: 10)
        trade.maePrice = 18_000 - 4   // 0,4 R gegen die Position
        trade.mfePrice = 18_000 + 20  // 2 R für die Position
        #expect(abs((trade.rMultiple ?? 0) - 1.5) < 1e-9)
        #expect(abs((trade.mae?.rMultiple ?? 0) - 0.4) < 1e-9)
        #expect(abs((trade.mae?.amount ?? 0) - 40) < 1e-9)
        #expect(abs((trade.mfe?.rMultiple ?? 0) - 2.0) < 1e-9)
    }

    @Test("Short-Trade MAE liegt über dem Einstieg")
    func shortExcursions() {
        var trade = Fixtures.trade(r: -1, quantity: 10, direction: .short)
        trade.maePrice = 18_010   // 10 Punkte gegen Short = 1 R
        trade.mfePrice = 18_005   // Kurs stieg = 0 R zugunsten
        #expect(abs((trade.mae?.rMultiple ?? 0) - 1.0) < 1e-9)
        #expect(abs(trade.mfe?.rMultiple ?? 1) < 1e-9)
    }

    @Test("Kapitalkurve und Drawdown")
    func equityCurve() {
        let trades = [
            Fixtures.trade(r: 2, entry: Fixtures.date(2026, 3, 2)),
            Fixtures.trade(r: -1, entry: Fixtures.date(2026, 3, 3)),
            Fixtures.trade(r: -1, entry: Fixtures.date(2026, 3, 4)),
            Fixtures.trade(r: 3, entry: Fixtures.date(2026, 3, 5)),
        ]
        let points = EquityCurve.build(from: trades, startingBalance: 1000)
        #expect(points.map(\.equity) == [1200, 1100, 1000, 1300])
        let dd = EquityCurve.maxDrawdown(points, startingBalance: 1000)
        #expect(abs((dd?.amount ?? 0) - 200) < 1e-9)
        #expect(abs((dd?.percent ?? 0) - 200.0 / 1200.0) < 1e-9)
    }

    @Test("Gruppierung nach Setup")
    func groupedBySetup() {
        let trades = [
            Fixtures.trade(r: 1, setup: "A"),
            Fixtures.trade(r: 1, setup: "A"),
            Fixtures.trade(r: -1, setup: "B"),
        ]
        let groups = GroupedPerformance.bySetup(trades)
        #expect(groups.map(\.key) == ["A", "B"])
        #expect(groups[0].summary.tradeCount == 2)
    }

    @Test("Zeitanalyse nach Wochentag, Stunde und Haltedauer")
    func timeAnalysis() {
        let cal = Fixtures.calendar
        let trades = [
            Fixtures.trade(r: 1, entry: Fixtures.date(2026, 3, 2, 9), holdingMinutes: 3),      // Montag
            Fixtures.trade(r: -1, entry: Fixtures.date(2026, 3, 3, 14), holdingMinutes: 90),   // Dienstag
            Fixtures.trade(r: 2, entry: Fixtures.date(2026, 3, 9, 9), holdingMinutes: 600),    // Montag
        ]
        let weekdays = TimeAnalysis.byWeekday(trades, calendar: cal)
        #expect(weekdays.map(\.weekday) == [2, 3])
        #expect(weekdays[0].summary.tradeCount == 2)
        let hours = TimeAnalysis.byHour(trades, calendar: cal)
        #expect(hours.map(\.hour) == [9, 14])
        let durations = TimeAnalysis.byHoldingDuration(trades)
        #expect(durations.map(\.bucket) == [.underFiveMinutes, .thirtyMinutesToTwoHours, .intraday])
    }

    @Test("Fehlerkosten")
    func mistakeCost() {
        let trades = [
            Fixtures.trade(r: 2),
            Fixtures.trade(r: -1, mistakes: ["FOMO"]),
            Fixtures.trade(r: -2, mistakes: ["FOMO", "Übergröße"]),
            Fixtures.trade(r: 1),
        ]
        let report = MistakeCostAnalysis.report(for: trades)
        #expect(abs(report.actualPnL - 0) < 1e-9)
        #expect(abs(report.compliantPnL - 300) < 1e-9)
        #expect(abs(report.costOfMistakes - 300) < 1e-9)
        #expect(report.items.first?.mistake == "FOMO")
        #expect(report.items.first?.tradeCount == 2)
        #expect(abs((report.items.first?.cost ?? 0) - 300) < 1e-9)
        #expect(abs(report.complianceRate - 0.5) < 1e-9)
    }

    @Test("Zeitraum-Filter")
    func periodFilter() {
        let reference = Fixtures.date(2026, 3, 18)
        let trades = [
            Fixtures.trade(r: 1, entry: Fixtures.date(2026, 3, 16)),
            Fixtures.trade(r: 1, entry: Fixtures.date(2026, 2, 10)),
            Fixtures.trade(r: 1, entry: Fixtures.date(2025, 11, 3)),
        ]
        #expect(AnalysisPeriod.week.filter(trades, calendar: Fixtures.calendar, reference: reference).count == 1)
        #expect(AnalysisPeriod.month.filter(trades, calendar: Fixtures.calendar, reference: reference).count == 1)
        #expect(AnalysisPeriod.quarter.filter(trades, calendar: Fixtures.calendar, reference: reference).count == 2)
        #expect(AnalysisPeriod.year.filter(trades, calendar: Fixtures.calendar, reference: reference).count == 2)
        #expect(AnalysisPeriod.all.filter(trades, calendar: Fixtures.calendar, reference: reference).count == 3)
    }
}
