import Foundation
import SwiftData
import Testing
import JournalCore
@testable import TradingJournal

@MainActor
@Suite("App-Modelle")
struct TradingJournalTests {
    @Test("Trade wird korrekt in eine Auswertungs-Momentaufnahme überführt")
    func tradeRecordMapping() throws {
        let container = ModelContainerFactory.makeInMemory()
        let context = container.mainContext

        let setup = TradingJournal.Tag(name: "Pullback", kind: .setup)
        let mistake = TradingJournal.Tag(name: "FOMO", kind: .mistake)
        let rule = TradingRule(title: "Stop niemals verschieben")
        context.insert(setup)
        context.insert(mistake)
        context.insert(rule)

        let trade = Trade(symbol: "DAX", direction: .long, entryDate: Date(), quantity: 10, entryPrice: 18_000)
        trade.exitDate = Date().addingTimeInterval(1800)
        trade.exitPrice = 18_020
        trade.fees = 2
        trade.plannedEntry = 18_000
        trade.plannedStop = 17_990
        trade.plannedTarget = 18_030
        trade.initialStop = 17_990
        trade.tags = [setup, mistake]
        trade.brokenRules = [rule]
        context.insert(trade)
        try context.save()

        let record = trade.record(regime: MarketRegime(trend: .trending, volatility: .normal))
        #expect(abs(record.netPnL - 198) < 1e-9)
        #expect(abs((record.rMultiple ?? 0) - 1.98) < 1e-9)
        #expect(record.setup == "Pullback")
        #expect(record.mistakes == ["FOMO"])
        #expect(record.brokenRules == ["Stop niemals verschieben"])
        #expect(record.regime?.trend == .trending)
        #expect(!record.isCompliant)
    }

    @Test("Beispieldaten lassen sich anlegen und rückstandslos entfernen")
    func sampleDataRoundTrip() throws {
        let container = ModelContainerFactory.makeInMemory()
        let context = container.mainContext
        let settings = SettingsStore(defaults: UserDefaults(suiteName: "tests-\(UUID().uuidString)")!)

        try SampleDataService.install(into: context, settings: settings)
        #expect(SampleDataService.isInstalled(in: context))
        let tradeCount = try context.fetchCount(FetchDescriptor<Trade>())
        #expect(tradeCount > 100)
        let tagCount = try context.fetchCount(FetchDescriptor<TradingJournal.Tag>())
        #expect(tagCount > 10)

        try SampleDataService.remove(from: context)
        #expect(!SampleDataService.isInstalled(in: context))
        #expect(try context.fetchCount(FetchDescriptor<Trade>()) == 0)
        #expect(try context.fetchCount(FetchDescriptor<TradingJournal.Tag>()) == 0)
        #expect(try context.fetchCount(FetchDescriptor<TradingRule>()) == 0)
        #expect(try context.fetchCount(FetchDescriptor<DailyCheckIn>()) == 0)
    }

    @Test("Trade-Filter berücksichtigt Ergebnis, Richtung und Suche")
    func tradeFilter() throws {
        let container = ModelContainerFactory.makeInMemory()
        let context = container.mainContext
        let win = Trade(symbol: "AAPL", direction: .long, quantity: 1, entryPrice: 100)
        win.exitDate = Date()
        win.exitPrice = 110
        let loss = Trade(symbol: "NQ", direction: .short, quantity: 1, entryPrice: 100)
        loss.exitDate = Date()
        loss.exitPrice = 105
        let open = Trade(symbol: "DAX", direction: .long, quantity: 1, entryPrice: 100)
        for trade in [win, loss, open] { context.insert(trade) }

        var filter = TradeFilter()
        filter.outcome = .wins
        #expect(filter.apply(to: [win, loss, open], search: "").map(\.symbol) == ["AAPL"])
        filter = TradeFilter()
        filter.direction = .short
        #expect(filter.apply(to: [win, loss, open], search: "").map(\.symbol) == ["NQ"])
        filter = TradeFilter()
        filter.outcome = .open
        #expect(filter.apply(to: [win, loss, open], search: "").map(\.symbol) == ["DAX"])
        #expect(TradeFilter().apply(to: [win, loss, open], search: "aap").map(\.symbol) == ["AAPL"])
    }
}
