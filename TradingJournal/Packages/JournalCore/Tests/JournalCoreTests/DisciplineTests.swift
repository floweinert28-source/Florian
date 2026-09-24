import Foundation
import Testing
@testable import JournalCore

@Suite("Disziplin")
struct DisciplineTests {
    @Test("Perfekter Trade erhält 100 Punkte")
    func perfectTrade() {
        let trade = Fixtures.trade(r: 1.5)
        let result = DisciplineEvaluator.evaluate(trade)
        #expect(result.score == 100)
        #expect(result.entryDeviationR == 0)
    }

    @Test("Ohne Plan gibt es nur Punkte für Fehlerfreiheit")
    func noPlan() {
        let trade = Fixtures.trade(r: 1, withPlan: false)
        let result = DisciplineEvaluator.evaluate(trade)
        #expect(result.score == 30)
    }

    @Test("Stop nicht eingehalten kostet Punkte")
    func stopViolated() {
        let trade = Fixtures.trade(r: -2.0)
        let result = DisciplineEvaluator.evaluate(trade)
        let stop = result.components.first { $0.kind == .stopRespected }
        #expect((stop?.fulfillment ?? 1) < 0.1)
        #expect(result.score < 80)
    }

    @Test("Abweichender Einstieg wird abgestuft")
    func entryDeviation() {
        var trade = Fixtures.trade(r: 1, quantity: 10)
        trade.entryPrice = 18_000 + 6   // 0,6 R vom Plan entfernt
        let result = DisciplineEvaluator.evaluate(trade)
        let entry = result.components.first { $0.kind == .entryAdherence }!
        #expect(entry.fulfillment > 0.4 && entry.fulfillment < 0.7)
        #expect(abs((result.entryDeviationR ?? 0) - 0.6) < 1e-9)
    }

    @Test("Fehler und Regelbruch ziehen ab")
    func mistakesAndRules() {
        var trade = Fixtures.trade(r: 1, mistakes: ["FOMO"])
        trade.brokenRules = ["Stop niemals verschieben"]
        #expect(DisciplineEvaluator.evaluate(trade).score == 70)
    }

    @Test("Zeitverlauf je Woche")
    func timeline() {
        let trades = [
            Fixtures.trade(r: 1, entry: Fixtures.date(2026, 3, 2)),
            Fixtures.trade(r: 1, entry: Fixtures.date(2026, 3, 4), mistakes: ["FOMO"]),
            Fixtures.trade(r: 1, entry: Fixtures.date(2026, 3, 11)),
        ]
        let weeks = DisciplineEvaluator.timeline(for: trades, granularity: .week, calendar: Fixtures.calendar)
        #expect(weeks.count == 2)
        #expect(weeks[0].score == 90)
        #expect(weeks[0].tradeCount == 2)
        #expect(weeks[1].score == 100)
        #expect(DisciplineEvaluator.averageScore(for: trades) == 93)
    }
}
