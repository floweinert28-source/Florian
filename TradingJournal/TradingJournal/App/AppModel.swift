import Foundation
import Observation
import SwiftUI

/// Modale Sheets der App.
enum AppSheet: Identifiable, Hashable {
    case newTrade
    case editTrade(Trade)
    case importCSV
    case newMissedTrade
    case editMissedTrade(MissedTrade)
    case checkIn(Date)

    var id: String {
        switch self {
        case .newTrade: "newTrade"
        case .editTrade(let trade): "editTrade-\(trade.id.uuidString)"
        case .importCSV: "importCSV"
        case .newMissedTrade: "newMissedTrade"
        case .editMissedTrade(let missed): "editMissedTrade-\(missed.id.uuidString)"
        case .checkIn(let date): "checkIn-\(date.timeIntervalSince1970)"
        }
    }
}

/// Navigations- und Präsentationszustand der App.
@Observable
@MainActor
final class AppModel {
    var selectedSection: AppSection = .dashboard
    var activeSheet: AppSheet?
    /// Navigationspfad des Trades-Bereichs.
    var tradesPath: [Trade] = []
    /// Zähler für haptisches Feedback nach dem Sichern.
    var saveCount = 0

    func show(_ section: AppSection) {
        selectedSection = section
    }

    func open(_ trade: Trade) {
        selectedSection = .trades
        tradesPath = [trade]
    }

    func present(_ sheet: AppSheet) {
        activeSheet = sheet
    }

    func didSave() {
        saveCount += 1
    }
}
