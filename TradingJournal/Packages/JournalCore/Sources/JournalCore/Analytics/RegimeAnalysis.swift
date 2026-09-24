import Foundation

public struct RegimePerformance: Identifiable, Hashable, Sendable {
    public var regime: MarketRegime
    public var summary: PerformanceSummary
    public var id: String { regime.key }
}

/// Eine Zelle der Matrix Setup × Regime.
public struct RegimeCell: Identifiable, Hashable, Sendable {
    public var setup: String
    public var regime: MarketRegime
    public var summary: PerformanceSummary
    public var id: String { "\(setup)|\(regime.key)" }
}

public struct RegimeReport: Hashable, Sendable {
    public var byRegime: [RegimePerformance]
    public var cells: [RegimeCell]
    public var setups: [String]
    /// Trades ohne Regime-Einstufung.
    public var untaggedCount: Int

    public static let empty = RegimeReport(byRegime: [], cells: [], setups: [], untaggedCount: 0)

    public func cell(setup: String, regime: MarketRegime) -> RegimeCell? {
        cells.first { $0.setup == setup && $0.regime == regime }
    }
}

public enum RegimeAnalysis {
    public static func report(for trades: [TradeRecord]) -> RegimeReport {
        let closed = trades.filter(\.isClosed)
        let tagged = closed.filter { $0.regime != nil }
        guard !tagged.isEmpty else {
            return RegimeReport(byRegime: [], cells: [], setups: [], untaggedCount: closed.count)
        }

        var byRegime: [MarketRegime: [TradeRecord]] = [:]
        var bySetupRegime: [String: [MarketRegime: [TradeRecord]]] = [:]
        for trade in tagged {
            guard let regime = trade.regime else { continue }
            byRegime[regime, default: []].append(trade)
            if let setup = trade.setup, !setup.isEmpty {
                bySetupRegime[setup, default: [:]][regime, default: []].append(trade)
            }
        }

        let regimeRows = MarketRegime.allCombinations.compactMap { regime -> RegimePerformance? in
            guard let group = byRegime[regime] else { return nil }
            return RegimePerformance(regime: regime, summary: PerformanceCalculator.summary(for: group))
        }

        let setups = bySetupRegime.keys.sorted()
        var cells: [RegimeCell] = []
        for setup in setups {
            for (regime, group) in bySetupRegime[setup] ?? [:] {
                cells.append(RegimeCell(setup: setup, regime: regime, summary: PerformanceCalculator.summary(for: group)))
            }
        }

        return RegimeReport(
            byRegime: regimeRows,
            cells: cells,
            setups: setups,
            untaggedCount: closed.count - tagged.count
        )
    }
}
