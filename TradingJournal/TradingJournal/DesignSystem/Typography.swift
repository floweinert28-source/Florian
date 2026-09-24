import SwiftUI

/// Typografische Hierarchie: große Zahlen für Kennzahlen, kleine kräftige Labels.
extension Font {
    /// Die eine große Zahl pro Bildschirm.
    static let metricHero = Font.system(size: 34, weight: .bold, design: .default)
    /// Kennzahl in einer Kachel.
    static let metricValue = Font.system(size: 22, weight: .semibold, design: .default)
    /// Kleinere Kennzahl (z. B. in Listen und Tabellen).
    static let metricSmall = Font.system(.subheadline, design: .default, weight: .semibold)
    /// Beschriftung über einer Kennzahl.
    static let metricLabel = Font.caption.weight(.medium)
    /// Kartentitel.
    static let cardTitle = Font.subheadline.weight(.semibold)
    /// Erläuternder Text in Karten.
    static let explanation = Font.footnote
}

extension View {
    /// Zahlen mit fester Ziffernbreite, damit Werte beim Umschalten nicht springen.
    func numeric() -> some View {
        monospacedDigit()
    }
}
