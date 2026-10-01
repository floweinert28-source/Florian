import Foundation
import Testing
@testable import JournalCore

@Suite("Trader-Score")
struct TraderScoreTests {
    @Test("Leer ergibt 0")
    func empty() {
        let s = TraderScoreCalculator.score(for: [], accountSize: 10_000)
        #expect(s.overall == 0)
        #expect(s.components.count == 6)
    }

    @Test("Gleichmäßig profitabler Verlauf erreicht hohen Score")
    func strong() {
        var trades: [TradeRecord] = []
        for day in 1...20 {
            trades.append(Fixtures.trade(r: 1.6, entry: Fixtures.date(2026, 4, day, 9)))
            trades.append(Fixtures.trade(r: day % 3 == 0 ? -1 : 1.2, entry: Fixtures.date(2026, 4, day, 11)))
        }
        let s = TraderScoreCalculator.score(for: trades, accountSize: 10_000)
        #expect(s.overall >= 70, "Score war \(s.overall)")
        #expect(s.component(.winRate).score > 0.9)
        #expect(s.component(.maxDrawdown).score > 0.9)
        #expect(s.component(.consistency).score > 0.6)
    }

    @Test("Verlustreicher Verlauf bleibt niedrig")
    func weak() {
        let trades = (1...15).map { Fixtures.trade(r: $0 % 4 == 0 ? 0.8 : -1, entry: Fixtures.date(2026, 4, $0, 9)) }
        let s = TraderScoreCalculator.score(for: trades, accountSize: 2_000)
        #expect(s.overall < 35, "Score war \(s.overall)")
        #expect(s.component(.recoveryFactor).score == 0)
    }
}
