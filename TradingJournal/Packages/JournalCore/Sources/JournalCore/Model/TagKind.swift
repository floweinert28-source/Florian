import Foundation

/// Arten von Tags, die ein Trade tragen kann.
public enum TagKind: String, Codable, CaseIterable, Sendable, Hashable, Identifiable {
    case setup
    case strategy
    case marketPhase
    case mistake
    case emotion

    public var id: String { rawValue }

    /// Setup, Strategie und Marktphase sind je Trade eindeutig; Fehler und Emotionen mehrfach möglich.
    public var allowsMultiplePerTrade: Bool {
        switch self {
        case .setup, .strategy, .marketPhase: false
        case .mistake, .emotion: true
        }
    }
}
