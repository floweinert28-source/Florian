import Foundation

/// Trend- oder Seitwärtsphase eines Handelstages.
public enum TrendRegime: String, Codable, Sendable, CaseIterable, Hashable {
    case trending
    case ranging
}

/// Volatilitätsniveau eines Handelstages.
public enum VolatilityRegime: String, Codable, Sendable, CaseIterable, Hashable {
    case low
    case normal
    case high
}

/// Herkunft einer Regime-Einstufung. Vorbereitet für eine spätere automatische Ableitung aus Kursdaten.
public enum RegimeSource: String, Codable, Sendable, CaseIterable, Hashable {
    case manual
    case automatic
}

/// Markt-Regime eines Tages.
public struct MarketRegime: Hashable, Codable, Sendable {
    public var trend: TrendRegime
    public var volatility: VolatilityRegime

    public init(trend: TrendRegime, volatility: VolatilityRegime) {
        self.trend = trend
        self.volatility = volatility
    }

    /// Stabiler Schlüssel, z. B. für Gruppierungen.
    public var key: String { "\(trend.rawValue)-\(volatility.rawValue)" }

    /// Alle Kombinationen in fester Reihenfolge.
    public static let allCombinations: [MarketRegime] = TrendRegime.allCases.flatMap { trend in
        VolatilityRegime.allCases.map { MarketRegime(trend: trend, volatility: $0) }
    }
}
