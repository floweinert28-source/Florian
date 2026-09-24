import SwiftUI

/// Zentrale Design-Konstanten. Optik: dunkles, flaches Analyse-Dashboard mit violettem Akzent,
/// kräftigem Grün/Rot für Ergebnisse und klar abgesetzten Karten mit feiner Kontur.
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
        static let card: CGFloat = 12
        static let tile: CGFloat = 12
        static let chip: CGFloat = 6
        static let control: CGFloat = 8
        static let thumbnail: CGFloat = 10
    }

    /// Maximale Inhaltsbreite auf sehr großen Displays.
    static let contentMaxWidth: CGFloat = 1440

    static let cardPadding: CGFloat = 16

    /// Ruhige Standard-Feder für Übergänge.
    static let spring = Animation.spring(duration: 0.4, bounce: 0.15)
    /// Schnelle Feder für Hover und kleine Zustandswechsel.
    static let quickSpring = Animation.spring(duration: 0.22, bounce: 0.1)
    /// Sanftes Ein-/Ausblenden.
    static let fade = Animation.easeInOut(duration: 0.2)
}

extension Color {
    static let profit = Color("Profit")
    static let loss = Color("Loss")
    static let warning = Color("Warning")
    /// Hintergrund der Bildschirme.
    static let screenBackground = Color("ScreenBackground")
    /// Hintergrund der Seitenleiste.
    static let sidebarBackground = Color("SidebarBackground")
    /// Hintergrund von Karten.
    static let cardBackground = Color("CardBackground")
    /// Feine Kontur von Karten und Trennlinien.
    static let cardBorder = Color("CardBorder")
    /// Leicht erhöhte Fläche innerhalb von Karten (Balken-Hintergründe, Eingaben, Chips).
    static let elevatedFill = Color("ElevatedFill")
    /// Dezente Fläche innerhalb von Karten.
    static var subtleFill: Color { elevatedFill }

    /// Grün für Gewinn, Rot für Verlust, dezent für Null.
    static func pnl(_ value: Double) -> Color {
        if abs(value) < 1e-9 { return .secondary }
        return value > 0 ? .profit : .loss
    }
}

/// Erscheinungsbild der App. Standard ist Dunkel, wie bei Analyse-Dashboards üblich.
enum AppearanceMode: String, CaseIterable, Identifiable {
    case dark
    case light
    case system

    var id: String { rawValue }

    var title: String {
        switch self {
        case .dark: String(localized: "Dunkel")
        case .light: String(localized: "Hell")
        case .system: String(localized: "System")
        }
    }

    var colorScheme: ColorScheme? {
        switch self {
        case .dark: .dark
        case .light: .light
        case .system: nil
        }
    }
}
