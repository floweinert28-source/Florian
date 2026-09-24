import Foundation
import Testing
@testable import JournalCore

@Suite("Beispieldaten")
struct SampleDataTests {
    let dataSet = SampleDataGenerator(seed: 7, now: Fixtures.date(2026, 6, 17, 14), calendar: Fixtures.calendar).generate()

    @Test("Umfang und Reproduzierbarkeit")
    func shape() {
        #expect(dataSet.trades.count > 100)
        #expect(dataSet.trades.count < 400)
        #expect(dataSet.checkIns.count > 40)
        #expect(dataSet.regimes.count == 88)
        #expect(dataSet.missedTrades.count >= 5)
        #expect(dataSet.rules.count == 5)
        #expect(dataSet.tags.contains { $0.kind == .mistake })
        let again = SampleDataGenerator(seed: 7, now: Fixtures.date(2026, 6, 17, 14), calendar: Fixtures.calendar).generate()
        #expect(again.trades.map(\.symbol) == dataSet.trades.map(\.symbol))
        #expect(again.trades.map(\.netPnL) == dataSet.trades.map(\.netPnL))
    }

    @Test("Trades sind in sich stimmig")
    func consistency() {
        for trade in dataSet.trades where trade.exitDate != nil {
            let record = trade.record()
            #expect(record.rMultiple != nil)
            #expect(trade.exitDate! > trade.entryDate)
            #expect(trade.plan?.isComplete == true)
            #expect(trade.quantity > 0)
            let r = record.rMultiple ?? 0
            #expect(r > -2.6 && r < 3.5, "R-Multiple außerhalb des erwarteten Bereichs: \(r)")
            if let mae = record.mae?.rMultiple { #expect(mae >= 0 && mae <= 1.3) }
            if let mfe = record.mfe?.rMultiple { #expect(mfe >= 0) }
        }
        let open = dataSet.trades.filter { $0.exitDate == nil }
        #expect(open.count <= 1)
    }

    @Test("Auswertungen laufen über die Beispieldaten")
    func analyticsSmoke() {
        let regimesByDay = Dictionary(uniqueKeysWithValues: dataSet.regimes.map { (Fixtures.calendar.startOfDay(for: $0.date), $0.regime) })
        let records = dataSet.trades.map { $0.record(regime: regimesByDay[Fixtures.calendar.startOfDay(for: $0.entryDate)]) }

        let summary = PerformanceCalculator.summary(for: records)
        #expect(summary.tradeCount > 100)
        #expect(summary.winRate > 0.35 && summary.winRate < 0.7)

        let cost = MistakeCostAnalysis.report(for: records)
        #expect(cost.costOfMistakes > 0, "Fehler sollten in den Beispieldaten Geld kosten")
        #expect(!cost.items.isEmpty)

        let setups = GroupedPerformance.bySetup(records)
        #expect(setups.count == 4)

        let regime = RegimeAnalysis.report(for: records)
        #expect(regime.untaggedCount == 0)
        #expect(!regime.cells.isEmpty)

        let detector = TiltDetector(configuration: {
            var c = TiltConfiguration(); c.accountSize = dataSet.accountSize; return c
        }())
        let profile = detector.learnProfile(from: records, calendar: Fixtures.calendar)
        #expect(profile.dayCount > 40)
        #expect(!profile.personalTriggers.isEmpty, "Tilt-Tage sollten persönliche Auslöser ergeben")

        let edge = EdgeCheck.assess(records)
        #expect(edge.metric == .rMultiple)
        #expect(edge.sampleSize == summary.tradeCount)

        let mc = MonteCarloSimulator.simulate(pnls: records.filter(\.isClosed).map(\.netPnL), configuration: .init(startingBalance: dataSet.accountSize))
        #expect(mc != nil)

        let state = StateAnalysis.report(trades: records, checkIns: dataSet.checkIns, calendar: Fixtures.calendar)
        #expect(state.matchedDays > 30)
        #expect(state.sleepCorrelation != nil)

        let discipline = DisciplineEvaluator.averageScore(for: records)
        #expect((discipline ?? 0) > 50)
    }
}
