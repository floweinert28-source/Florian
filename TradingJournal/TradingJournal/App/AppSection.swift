import SwiftUI

/// Hauptbereiche der App (Seitenleiste bzw. Tabs).
enum AppSection: String, CaseIterable, Identifiable, Hashable {
    case dashboard
    case trades
    case analysis
    case psychology
    case settings

    var id: String { rawValue }

    var title: LocalizedStringKey {
        switch self {
        case .dashboard: "Dashboard"
        case .trades: "Trades"
        case .analysis: "Berichte"
        case .psychology: "Psychologie"
        case .settings: "Einstellungen"
        }
    }

    var systemImage: String {
        switch self {
        case .dashboard: "square.grid.2x2.fill"
        case .trades: "list.bullet.rectangle.fill"
        case .analysis: "chart.bar.fill"
        case .psychology: "brain.head.profile.fill"
        case .settings: "gearshape.fill"
        }
    }

    var shortcut: KeyEquivalent {
        switch self {
        case .dashboard: "1"
        case .trades: "2"
        case .analysis: "3"
        case .psychology: "4"
        case .settings: "5"
        }
    }
}
