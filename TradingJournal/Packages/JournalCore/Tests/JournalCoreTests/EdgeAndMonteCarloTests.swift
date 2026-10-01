import Foundation
import Testing
@testable import JournalCore

@Suite("Edge-Check")
struct EdgeCheckTests {
    @Test("Zu wenige Trades")
    func insufficient() {
        let a = EdgeCheck.assess(values: [1, -1, 2], metric: .rMultiple)
        #expect(a.verdict == .insufficientData)
        #expect(a.sampleSize == 3)
    }

    @Test("Klar positiver Edge")
    func positive() {
        let values = (0..<40).map { $0 % 2 == 0 ? 1.0 : 0.5 }
        let a = EdgeCheck.assess(values: values, metric: .rMultiple)
        #expect(a.verdict == .positive)
        #expect(a.confidenceLow > 0)
        #expect(a.requiredSampleSize != nil)
        #expect(a.recentMean != nil)
        #expect(!a.isDeteriorating)
    }

    @Test("Verrauschter Edge bleibt unbewiesen")
    func unproven() {
        let values = (0..<30).map { $0 % 2 == 0 ? 2.0 : -1.9 }
        let a = EdgeCheck.assess(values: values, metric: .rMultiple)
        #expect(a.verdict == .unproven)
        #expect(a.confidenceLow < 0 && a.confidenceHigh > 0)
    }

    @Test("Nachlassender Edge wird erkannt")
    func deteriorating() {
        let values = Array(repeating: 1.0, count: 30) + Array(repeating: -0.5, count: 20)
        let a = EdgeCheck.assess(values: values, metric: .rMultiple)
        #expect(a.isDeteriorating)
        #expect(a.rolling.count == 31)
        #expect(abs(a.rolling.first!.value - 1.0) < 1e-9)
        #expect(abs(a.rolling.last!.value + 0.5) < 1e-9)
    }

    @Test("Trades ohne Risiko nutzen das Währungsergebnis")
    func fallsBackToPnL() {
        let trades = (0..<25).map { _ in Fixtures.trade(r: 1, withPlan: false) }
        #expect(EdgeCheck.assess(trades).metric == .pnl)
        let withRisk = (0..<25).map { _ in Fixtures.trade(r: 1) }
        #expect(EdgeCheck.assess(withRisk).metric == .rMultiple)
    }

    @Test("t-Werte")
    func tValues() {
        #expect(abs(Statistics.tCritical95(degreesOfFreedom: 1) - 12.706) < 1e-9)
        #expect(abs(Statistics.tCritical95(degreesOfFreedom: 10) - 2.228) < 1e-9)
        #expect(abs(Statistics.tCritical95(degreesOfFreedom: 500) - 1.96) < 1e-9)
    }
}

@Suite("Monte Carlo")
struct MonteCarloTests {
    @Test("Deterministisch bei gleichem Seed")
    func deterministic() {
        let pnls = [120.0, -100, 80, -95, 200, -110, 60, -100, 150, -90]
        var config = MonteCarloConfiguration(startingBalance: 10_000)
        config.runs = 300
        let a = MonteCarloSimulator.simulate(pnls: pnls, configuration: config)
        let b = MonteCarloSimulator.simulate(pnls: pnls, configuration: config)
        #expect(a == b)
        #expect(a?.runs == 300)
        #expect(a?.tradesPerRun == 10)
        #expect(a?.sampleCurves.count == 24)
        #expect(a?.sampleCurves.first?.count == 11)
    }

    @Test("Nur Verlierer ⇒ Risk of Ruin 100 %")
    func ruin() {
        var config = MonteCarloConfiguration(startingBalance: 1_000)
        config.runs = 100
        config.tradesPerRun = 50
        let result = MonteCarloSimulator.simulate(pnls: [-100, -90], configuration: config)
        #expect(result?.riskOfRuin == 1)
        #expect(result?.probabilityOfProfit == 0)
    }

    @Test("Nur Gewinner ⇒ kein Drawdown")
    func noDrawdown() {
        var config = MonteCarloConfiguration(startingBalance: 1_000)
        config.runs = 50
        let result = MonteCarloSimulator.simulate(pnls: [10, 20, 30], configuration: config)
        #expect(result?.maxDrawdown.p95 == 0)
        #expect(result?.riskOfRuin == 0)
        #expect(result?.probabilityOfProfit == 1)
    }

    @Test("Zu wenige Daten")
    func tooFew() {
        #expect(MonteCarloSimulator.simulate(pnls: [1], configuration: .init(startingBalance: 100)) == nil)
    }

    @Test("Perzentile")
    func percentiles() {
        #expect(Statistics.percentile([1, 2, 3, 4, 5], 0.5) == 3)
        #expect(Statistics.percentile([1, 2, 3, 4], 0.5) == 2.5)
        #expect(Statistics.percentile([5], 0.9) == 5)
    }
}
