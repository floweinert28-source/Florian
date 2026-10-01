import Foundation
import SwiftData
import JournalCore

/// Gesehenes, aber nicht genommenes Setup samt hypothetischem Ergebnis.
@Model
final class MissedTrade {
    var id: UUID = UUID()
    var symbol: String = ""
    var directionRaw: String = TradeDirection.long.rawValue
    var date: Date = Date()
    var setupName: String = ""
    var plannedEntry: Double = 0
    var plannedStop: Double = 0
    var plannedTarget: Double?
    /// Kurs, zu dem der Trade hypothetisch beendet worden wäre.
    var hypotheticalExit: Double?
    var quantity: Double = 1
    var multiplier: Double = 1
    /// Warum wurde der Trade nicht genommen?
    var reason: String = ""
    var notes: String = ""
    var isSample: Bool = false
    var createdAt: Date = Date()

    init(symbol: String, direction: TradeDirection = .long, date: Date = Date()) {
        self.symbol = symbol
        self.directionRaw = direction.rawValue
        self.date = date
    }

    var direction: TradeDirection {
        get { TradeDirection(rawValue: directionRaw) ?? .long }
        set { directionRaw = newValue.rawValue }
    }

    var hypotheticalPnL: Double? {
        MissedTradeMath.hypotheticalPnL(direction: direction, plannedEntry: plannedEntry, hypotheticalExit: hypotheticalExit, quantity: quantity, multiplier: multiplier)
    }

    var hypotheticalR: Double? {
        MissedTradeMath.hypotheticalR(direction: direction, plannedEntry: plannedEntry, plannedStop: plannedStop, hypotheticalExit: hypotheticalExit)
    }

    func apply(_ draft: MissedTradeDraft) {
        symbol = draft.symbol
        direction = draft.direction
        date = draft.date
        setupName = draft.setup ?? ""
        plannedEntry = draft.plannedEntry
        plannedStop = draft.plannedStop
        plannedTarget = draft.plannedTarget
        hypotheticalExit = draft.hypotheticalExit
        quantity = draft.quantity
        multiplier = draft.multiplier
        reason = draft.reason
        notes = draft.notes
    }
}
