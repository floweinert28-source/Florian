import Foundation
import SwiftData
import JournalCore

/// Markt-Regime eines Handelstages. Zunächst manuell gepflegt; `source` ist für eine spätere Automatik vorbereitet.
@Model
final class MarketRegimeEntry {
    var id: UUID = UUID()
    /// Tagesbeginn.
    var date: Date = Date()
    var trendRaw: String = TrendRegime.trending.rawValue
    var volatilityRaw: String = VolatilityRegime.normal.rawValue
    var sourceRaw: String = RegimeSource.manual.rawValue
    var isSample: Bool = false

    init(date: Date, regime: MarketRegime, source: RegimeSource = .manual, isSample: Bool = false) {
        self.date = Calendar.current.startOfDay(for: date)
        self.trendRaw = regime.trend.rawValue
        self.volatilityRaw = regime.volatility.rawValue
        self.sourceRaw = source.rawValue
        self.isSample = isSample
    }

    var regime: MarketRegime {
        get {
            MarketRegime(
                trend: TrendRegime(rawValue: trendRaw) ?? .trending,
                volatility: VolatilityRegime(rawValue: volatilityRaw) ?? .normal
            )
        }
        set {
            trendRaw = newValue.trend.rawValue
            volatilityRaw = newValue.volatility.rawValue
        }
    }

    var source: RegimeSource {
        get { RegimeSource(rawValue: sourceRaw) ?? .manual }
        set { sourceRaw = newValue.rawValue }
    }
}

extension TrendRegime {
    var title: String {
        switch self {
        case .trending: String(localized: "Trend")
        case .ranging: String(localized: "Seitwärts")
        }
    }

    var systemImage: String {
        switch self {
        case .trending: "chart.line.uptrend.xyaxis"
        case .ranging: "arrow.left.and.right"
        }
    }
}

extension VolatilityRegime {
    var title: String {
        switch self {
        case .low: String(localized: "Niedrige Vola")
        case .normal: String(localized: "Normale Vola")
        case .high: String(localized: "Hohe Vola")
        }
    }

    var shortTitle: String {
        switch self {
        case .low: String(localized: "niedrig")
        case .normal: String(localized: "normal")
        case .high: String(localized: "hoch")
        }
    }
}

extension MarketRegime {
    var title: String { "\(trend.title) · \(volatility.title)" }
}
