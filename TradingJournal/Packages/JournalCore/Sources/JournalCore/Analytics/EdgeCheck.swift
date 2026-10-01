import Foundation

/// Bewertung, ob ein Vorteil (Edge) statistisch belastbar ist.
public enum EdgeVerdict: String, Sendable, Hashable {
    /// Zu wenige Trades für eine Aussage.
    case insufficientData
    /// Das Konfidenzintervall schließt 0 ein: Edge nicht nachgewiesen.
    case unproven
    /// Das gesamte Intervall liegt über 0.
    case positive
    /// Das gesamte Intervall liegt unter 0.
    case negative
}

/// Welche Größe bewertet wurde.
public enum EdgeMetric: String, Sendable, Hashable {
    case rMultiple
    case pnl
}

public struct RollingPoint: Identifiable, Hashable, Sendable {
    /// Laufende Nummer des Trades (1-basiert), an dem das Fenster endet.
    public var index: Int
    public var value: Double
    public var id: Int { index }
}

public struct EdgeAssessment: Hashable, Sendable {
    public var metric: EdgeMetric
    public var sampleSize: Int
    public var mean: Double
    public var standardDeviation: Double
    public var standardError: Double
    public var confidenceLow: Double
    public var confidenceHigh: Double
    public var verdict: EdgeVerdict
    /// Durchschnitt der letzten `rollingWindow` Trades.
    public var recentMean: Double?
    public var rollingWindow: Int
    public var isDeteriorating: Bool
    /// Geschätzte Stichprobengröße, ab der das Intervall 0 ausschließen würde.
    public var requiredSampleSize: Int?
    public var rolling: [RollingPoint]

    public var confidenceHalfWidth: Double { (confidenceHigh - confidenceLow) / 2 }
}

public struct EdgeCheckConfiguration: Sendable, Hashable {
    public var minimumSample: Int = 20
    public var rollingWindow: Int = 20

    public init() {}
}

public enum EdgeCheck {
    /// Bewertet eine Trade-Menge. Verwendet R-Multiples, wenn sie für mindestens 80 % der Trades vorliegen, sonst das Ergebnis in Währung.
    public static func assess(_ trades: [TradeRecord], configuration: EdgeCheckConfiguration = .init()) -> EdgeAssessment {
        let closed = trades.filter(\.isClosed).sorted { ($0.exitDate ?? $0.entryDate) < ($1.exitDate ?? $1.entryDate) }
        let rValues = closed.compactMap(\.rMultiple)
        if !closed.isEmpty, Double(rValues.count) >= 0.8 * Double(closed.count) {
            return assess(values: rValues, metric: .rMultiple, configuration: configuration)
        }
        return assess(values: closed.map(\.netPnL), metric: .pnl, configuration: configuration)
    }

    public static func assess(values: [Double], metric: EdgeMetric, configuration: EdgeCheckConfiguration = .init()) -> EdgeAssessment {
        let n = values.count
        let mean = Statistics.mean(values)
        let sd = Statistics.standardDeviation(values)
        let se = n > 1 ? sd / Double(n).squareRoot() : 0
        let t = Statistics.tCritical95(degreesOfFreedom: max(1, n - 1))
        let low = mean - t * se
        let high = mean + t * se

        let verdict: EdgeVerdict
        if n < configuration.minimumSample {
            verdict = .insufficientData
        } else if low > 0 {
            verdict = .positive
        } else if high < 0 {
            verdict = .negative
        } else {
            verdict = .unproven
        }

        let window = configuration.rollingWindow
        let rolling = rollingMeans(values, window: window)
        let recentMean = n >= window ? Statistics.mean(Array(values.suffix(window))) : nil
        var deteriorating = false
        if let recentMean, n >= 2 * window, mean > 0 {
            deteriorating = recentMean < 0 || recentMean < 0.5 * mean
        }

        var required: Int?
        if abs(mean) > 1e-9, sd > 0 {
            let needed = pow(1.96 * sd / abs(mean), 2)
            required = Int(needed.rounded(.up))
        }

        return EdgeAssessment(
            metric: metric,
            sampleSize: n,
            mean: mean,
            standardDeviation: sd,
            standardError: se,
            confidenceLow: low,
            confidenceHigh: high,
            verdict: verdict,
            recentMean: recentMean,
            rollingWindow: window,
            isDeteriorating: deteriorating,
            requiredSampleSize: required,
            rolling: rolling
        )
    }

    /// Gleitender Durchschnitt über `window` Werte.
    public static func rollingMeans(_ values: [Double], window: Int) -> [RollingPoint] {
        guard window > 0, values.count >= window else { return [] }
        var points: [RollingPoint] = []
        var sum = values.prefix(window).reduce(0, +)
        points.append(RollingPoint(index: window, value: sum / Double(window)))
        if values.count > window {
            for i in window..<values.count {
                sum += values[i] - values[i - window]
                points.append(RollingPoint(index: i + 1, value: sum / Double(window)))
            }
        }
        return points
    }
}
