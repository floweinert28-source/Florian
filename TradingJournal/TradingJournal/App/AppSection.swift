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
        case .dashboard: "Übersicht"
        case .trades: "Trades"
        case .analysis: "Analyse"
        case .psychology: "Psychologie"
        case .settings: "Einstellungen"
        }
    }

    var systemImage: String {
        switch self {
        case .dashboard: "chart.xyaxis.line"
        case .trades: "list.bullet.rectangle.portrait"
        case .analysis: "chart.bar.xaxis"
        case .psychology: "brain.head.profile"
        case .settings: "gearshape"
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
