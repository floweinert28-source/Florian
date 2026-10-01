import Foundation
import SwiftData
import JournalCore

/// Frei anlegbares Tag: Setup, Strategie, Marktphase, Fehler oder Emotion.
@Model
final class Tag {
    var id: UUID = UUID()
    var name: String = ""
    var kindRaw: String = TagKind.setup.rawValue
    var createdAt: Date = Date()
    var isSample: Bool = false

    var trades: [Trade]?

    init(name: String, kind: TagKind, isSample: Bool = false) {
        self.name = name
        self.kindRaw = kind.rawValue
        self.isSample = isSample
    }

    var kind: TagKind {
        get { TagKind(rawValue: kindRaw) ?? .setup }
        set { kindRaw = newValue.rawValue }
    }

    var tradeCount: Int { trades?.count ?? 0 }
}

extension TagKind {
    var title: String {
        switch self {
        case .setup: String(localized: "Setup")
        case .strategy: String(localized: "Strategie")
        case .marketPhase: String(localized: "Marktphase")
        case .mistake: String(localized: "Fehler")
        case .emotion: String(localized: "Emotion")
        }
    }

    var pluralTitle: String {
        switch self {
        case .setup: String(localized: "Setups")
        case .strategy: String(localized: "Strategien")
        case .marketPhase: String(localized: "Marktphasen")
        case .mistake: String(localized: "Fehler")
        case .emotion: String(localized: "Emotionen")
        }
    }

    var systemImage: String {
        switch self {
        case .setup: "square.stack.3d.up"
        case .strategy: "point.topleft.down.to.point.bottomright.curvepath"
        case .marketPhase: "clock"
        case .mistake: "exclamationmark.triangle"
        case .emotion: "face.smiling"
        }
    }
}
