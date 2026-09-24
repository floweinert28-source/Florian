import Foundation
@testable import JournalCore

enum Fixtures {
    static let calendar: Calendar = {
        var c = Calendar(identifier: .gregorian)
        c.timeZone = TimeZone(identifier: "Europe/Berlin")!
        c.locale = Locale(identifier: "de_DE")
        c.firstWeekday = 2
        return c
    }()

    static func date(_ y: Int, _ m: Int, _ d: Int, _ h: Int = 10, _ min: Int = 0) -> Date {
        calendar.date(from: DateComponents(year: y, month: m, day: d, hour: h, minute: min))!
    }

    /// Ein abgeschlossener Trade mit gegebenem R-Ergebnis bei 100 € Risiko.
    static func trade(
        r: Double,
        symbol: String = "DAX",
        entry: Date = date(2026, 3, 2),
        holdingMinutes: Int = 30,
        setup: String? = "Pullback",
        mistakes: [String] = [],
        quantity: Double = 10,
        direction: TradeDirection = .long,
        regime: MarketRegime? = nil,
        withPlan: Bool = true
    ) -> TradeRecord {
        let stopDistance = 100.0 / quantity   // Risiko = 100 €
        let entryPrice = 18_000.0
        let stop = entryPrice - direction.sign * stopDistance
        let exitPrice = entryPrice + direction.sign * r * stopDistance
        let plan = withPlan ? TradePlan(entry: entryPrice, stop: stop, target: entryPrice + direction.sign * stopDistance * 2, reason: "Test") : nil
        return TradeRecord(
            symbol: symbol,
            direction: direction,
            entryDate: entry,
            exitDate: calendar.date(byAdding: .minute, value: holdingMinutes, to: entry),
            quantity: quantity,
            entryPrice: entryPrice,
            exitPrice: exitPrice,
            netPnL: r * 100,
            plan: plan,
            initialStop: withPlan ? stop : nil,
            setup: setup,
            mistakes: mistakes,
            regime: regime
        )
    }
}
