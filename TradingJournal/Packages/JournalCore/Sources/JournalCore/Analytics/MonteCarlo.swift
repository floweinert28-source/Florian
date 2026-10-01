import Foundation

public struct MonteCarloConfiguration: Sendable, Hashable {
    public var runs: Int = 2000
    /// Trades je Durchlauf. `nil` = so viele wie in der Stichprobe.
    public var tradesPerRun: Int?
    public var startingBalance: Double
    /// Ruin = Kapital fällt um diesen Anteil unter den Startwert.
    public var ruinDrawdownFraction: Double = 0.30
    public var seed: UInt64 = 42
    public var sampleCurveCount: Int = 24

    public init(startingBalance: Double) {
        self.startingBalance = startingBalance
    }
}

public struct Percentiles: Hashable, Sendable {
    public var p5: Double
    public var p25: Double
    public var p50: Double
    public var p75: Double
    public var p95: Double

    init(_ values: [Double]) {
        p5 = Statistics.percentile(values, 0.05)
        p25 = Statistics.percentile(values, 0.25)
        p50 = Statistics.percentile(values, 0.50)
        p75 = Statistics.percentile(values, 0.75)
        p95 = Statistics.percentile(values, 0.95)
    }
}

public struct HistogramBin: Identifiable, Hashable, Sendable {
    public var lowerBound: Double
    public var upperBound: Double
    public var count: Int
    public var id: Double { lowerBound }
}

public struct MonteCarloResult: Hashable, Sendable {
    public var runs: Int
    public var tradesPerRun: Int
    public var startingBalance: Double
    public var finalEquity: Percentiles
    /// Maximaler Drawdown je Durchlauf in Währung.
    public var maxDrawdown: Percentiles
    /// Maximaler Drawdown je Durchlauf als Anteil des Startkapitals.
    public var maxDrawdownFraction: Percentiles
    public var worstDrawdownFraction: Double
    /// Anteil der Durchläufe, in denen die Ruin-Schwelle unterschritten wurde.
    public var riskOfRuin: Double
    /// Anteil der Durchläufe mit positivem Endergebnis.
    public var probabilityOfProfit: Double
    /// Einige zufällige Kapitalverläufe für die Darstellung (inkl. Startpunkt).
    public var sampleCurves: [[Double]]
    public var drawdownHistogram: [HistogramBin]
}

public enum MonteCarloSimulator {
    /// Bootstrap-Simulation: zieht mit Zurücklegen aus den eigenen Trade-Ergebnissen.
    public static func simulate(pnls: [Double], configuration: MonteCarloConfiguration) -> MonteCarloResult? {
        guard pnls.count >= 2, configuration.runs > 0 else { return nil }
        let horizon = max(1, configuration.tradesPerRun ?? pnls.count)
        let start = configuration.startingBalance
        let ruinLevel = start * (1 - configuration.ruinDrawdownFraction)
        var rng = SeededRandomNumberGenerator(seed: configuration.seed)

        var finals: [Double] = []
        var drawdowns: [Double] = []
        var ruined = 0
        var profitable = 0
        var curves: [[Double]] = []
        finals.reserveCapacity(configuration.runs)
        drawdowns.reserveCapacity(configuration.runs)

        for run in 0..<configuration.runs {
            var equity = start
            var peak = start
            var maxDD = 0.0
            var hitRuin = false
            let keepCurve = run < configuration.sampleCurveCount
            var curve: [Double] = keepCurve ? [start] : []

            for _ in 0..<horizon {
                let index = Int.random(in: 0..<pnls.count, using: &rng)
                equity += pnls[index]
                peak = max(peak, equity)
                maxDD = max(maxDD, peak - equity)
                if equity <= ruinLevel { hitRuin = true }
                if keepCurve { curve.append(equity) }
            }

            finals.append(equity)
            drawdowns.append(maxDD)
            if hitRuin { ruined += 1 }
            if equity > start { profitable += 1 }
            if keepCurve { curves.append(curve) }
        }

        let fractions = start > 0 ? drawdowns.map { $0 / start } : drawdowns
        return MonteCarloResult(
            runs: configuration.runs,
            tradesPerRun: horizon,
            startingBalance: start,
            finalEquity: Percentiles(finals),
            maxDrawdown: Percentiles(drawdowns),
            maxDrawdownFraction: Percentiles(fractions),
            worstDrawdownFraction: fractions.max() ?? 0,
            riskOfRuin: Double(ruined) / Double(configuration.runs),
            probabilityOfProfit: Double(profitable) / Double(configuration.runs),
            sampleCurves: curves,
            drawdownHistogram: histogram(fractions, binCount: 20)
        )
    }

    static func histogram(_ values: [Double], binCount: Int) -> [HistogramBin] {
        guard let minValue = values.min(), let maxValue = values.max(), binCount > 0 else { return [] }
        let span = max(maxValue - minValue, 1e-9)
        let width = span / Double(binCount)
        var counts = Array(repeating: 0, count: binCount)
        for value in values {
            let index = min(binCount - 1, Int((value - minValue) / width))
            counts[index] += 1
        }
        return counts.enumerated().map { index, count in
            HistogramBin(lowerBound: minValue + Double(index) * width, upperBound: minValue + Double(index + 1) * width, count: count)
        }
    }
}
