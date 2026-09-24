import Foundation

/// Kleine, gut lesbare Statistik-Helfer ohne externe Abhängigkeiten.
public enum Statistics {
    public static func mean(_ values: [Double]) -> Double {
        guard !values.isEmpty else { return 0 }
        return values.reduce(0, +) / Double(values.count)
    }

    /// Stichproben-Standardabweichung (n − 1). Bei weniger als zwei Werten 0.
    public static func standardDeviation(_ values: [Double]) -> Double {
        guard values.count > 1 else { return 0 }
        let m = mean(values)
        let variance = values.reduce(0) { $0 + ($1 - m) * ($1 - m) } / Double(values.count - 1)
        return variance.squareRoot()
    }

    public static func median(_ values: [Double]) -> Double {
        percentile(values, 0.5)
    }

    /// Perzentil mit linearer Interpolation. `p` liegt zwischen 0 und 1.
    public static func percentile(_ values: [Double], _ p: Double) -> Double {
        guard !values.isEmpty else { return 0 }
        let sorted = values.sorted()
        let clamped = min(max(p, 0), 1)
        let position = clamped * Double(sorted.count - 1)
        let lower = Int(position.rounded(.down))
        let upper = Int(position.rounded(.up))
        guard lower != upper else { return sorted[lower] }
        let weight = position - Double(lower)
        return sorted[lower] * (1 - weight) + sorted[upper] * weight
    }

    /// Kritischer Wert der t-Verteilung für ein zweiseitiges 95 %-Intervall.
    public static func tCritical95(degreesOfFreedom: Int) -> Double {
        let table: [Double] = [
            12.706, 4.303, 3.182, 2.776, 2.571, 2.447, 2.365, 2.306, 2.262, 2.228,
            2.201, 2.179, 2.160, 2.145, 2.131, 2.120, 2.110, 2.101, 2.093, 2.086,
            2.080, 2.074, 2.069, 2.064, 2.060, 2.056, 2.052, 2.048, 2.045, 2.042,
        ]
        guard degreesOfFreedom >= 1 else { return table[0] }
        if degreesOfFreedom <= table.count { return table[degreesOfFreedom - 1] }
        if degreesOfFreedom <= 40 { return 2.021 }
        if degreesOfFreedom <= 60 { return 2.000 }
        if degreesOfFreedom <= 120 { return 1.980 }
        return 1.960
    }
}

/// Reproduzierbarer Zufallsgenerator (SplitMix64) für Simulationen und Beispieldaten.
public struct SeededRandomNumberGenerator: RandomNumberGenerator, Sendable {
    private var state: UInt64

    public init(seed: UInt64) {
        state = seed
    }

    public mutating func next() -> UInt64 {
        state &+= 0x9E37_79B9_7F4A_7C15
        var z = state
        z = (z ^ (z >> 30)) &* 0xBF58_476D_1CE4_E5B9
        z = (z ^ (z >> 27)) &* 0x94D0_49BB_1331_11EB
        return z ^ (z >> 31)
    }

    /// Normalverteilte Zufallszahl (Box-Muller).
    public mutating func nextGaussian(mean: Double = 0, standardDeviation: Double = 1) -> Double {
        var u1 = Double.random(in: 0..<1, using: &self)
        if u1 < 1e-12 { u1 = 1e-12 }
        let u2 = Double.random(in: 0..<1, using: &self)
        let z = (-2 * log(u1)).squareRoot() * cos(2 * .pi * u2)
        return mean + z * standardDeviation
    }
}
