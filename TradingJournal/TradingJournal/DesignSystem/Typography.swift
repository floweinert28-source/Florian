import SwiftUI

/// Typografische Hierarchie: große Zahlen für Kennzahlen, dezente Labels.
extension Font {
    /// Die eine große Zahl pro Bildschirm.
    static let metricHero = Font.system(size: 40, weight: .bold, design: .default)
    /// Kennzahl in einer Kachel.
    static let metricValue = Font.system(.title2, design: .default, weight: .semibold)
    /// Kleinere Kennzahl (z. B. in Listen).
    static let metricSmall = Font.system(.body, design: .default, weight: .semibold)
    /// Beschriftung über oder unter einer Kennzahl.
    static let metricLabel = Font.footnote.weight(.medium)
    /// Kartentitel.
    static let cardTitle = Font.headline
    /// Erläuternder Text in Karten.
    static let explanation = Font.subheadline
}

extension View {
    /// Zahlen mit fester Ziffernbreite, damit Werte beim Umschalten nicht springen.
    func numeric() -> some View {
        monospacedDigit()
    }
}
