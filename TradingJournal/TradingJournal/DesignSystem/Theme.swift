import SwiftUI

/// Zentrale Design-Konstanten: Abstände, Radien, Animationen, Farben.
enum Theme {
    enum Spacing {
        static let xs: CGFloat = 4
        static let s: CGFloat = 8
        static let m: CGFloat = 12
        static let l: CGFloat = 16
        static let xl: CGFloat = 24
        static let xxl: CGFloat = 32
    }

    enum Radius {
        static let card: CGFloat = 18
        static let tile: CGFloat = 14
        static let chip: CGFloat = 9
        static let control: CGFloat = 10
        static let thumbnail: CGFloat = 12
    }

    /// Maximale Inhaltsbreite auf großen Displays, damit Karten nicht endlos breit werden.
    static let contentMaxWidth: CGFloat = 1120

    static let cardPadding: CGFloat = 18

    /// Ruhige Standard-Feder für Übergänge.
    static let spring = Animation.spring(duration: 0.42, bounce: 0.18)
    /// Schnelle Feder für Hover und kleine Zustandswechsel.
    static let quickSpring = Animation.spring(duration: 0.24, bounce: 0.12)
    /// Sanftes Ein-/Ausblenden.
    static let fade = Animation.easeInOut(duration: 0.22)
}

extension Color {
    static let profit = Color("Profit")
    static let loss = Color("Loss")

    /// Grün für Gewinn, Rot für Verlust, dezent für Null.
    static func pnl(_ value: Double) -> Color {
        if abs(value) < 1e-9 { return .secondary }
        return value > 0 ? .profit : .loss
    }

    /// Hintergrund der Bildschirme (gruppiert).
    static var screenBackground: Color {
        #if os(macOS)
        Color("ScreenBackground")
        #else
        Color(.systemGroupedBackground)
        #endif
    }

    /// Hintergrund von Karten.
    static var cardBackground: Color {
        #if os(macOS)
        Color("CardBackground")
        #else
        Color(.secondarySystemGroupedBackground)
        #endif
    }

    /// Dezente Fläche innerhalb von Karten (z. B. Balken-Hintergrund).
    static var subtleFill: Color {
        #if os(macOS)
        Color(nsColor: .quaternaryLabelColor).opacity(0.5)
        #else
        Color(.tertiarySystemFill)
        #endif
    }
}
