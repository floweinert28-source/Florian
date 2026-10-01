import Foundation
import SwiftData
import JournalCore

/// Ein Trade im Journal. Alle Eigenschaften haben Standardwerte und Beziehungen sind optional,
/// damit das Modell mit CloudKit synchronisiert werden kann.
@Model
final class Trade {
    var id: UUID = UUID()
    var symbol: String = ""
    var directionRaw: String = TradeDirection.long.rawValue
    var entryDate: Date = Date()
    var exitDate: Date?
    var quantity: Double = 1
    /// Punktwert je Einheit (z. B. Kontraktgröße).
    var multiplier: Double = 1
    var entryPrice: Double = 0
    var exitPrice: Double?
    var fees: Double = 0
    /// Explizit importiertes Ergebnis; hat Vorrang vor der Berechnung aus Kursen.
    var pnlOverride: Double?

    // Plan (vor dem Trade)
    var plannedEntry: Double?
    var plannedStop: Double?
    var plannedTarget: Double?
    var planReason: String = ""

    // Ausführung
    var initialStop: Double?
    var maePrice: Double?
    var mfePrice: Double?

    var notes: String = ""
    var isSample: Bool = false
    var createdAt: Date = Date()
    var updatedAt: Date = Date()

    @Relationship(inverse: \Tag.trades)
    var tags: [Tag]? = []

    @Relationship(deleteRule: .cascade, inverse: \TradeAttachment.trade)
    var attachments: [TradeAttachment]? = []

    @Relationship(deleteRule: .cascade, inverse: \VoiceNote.trade)
    var voiceNotes: [VoiceNote]? = []

    /// Regeln, die bei diesem Trade gebrochen wurden.
    @Relationship(inverse: \TradingRule.violations)
    var brokenRules: [TradingRule]? = []

    init(
        symbol: String,
        direction: TradeDirection = .long,
        entryDate: Date = Date(),
        quantity: Double = 1,
        multiplier: Double = 1,
        entryPrice: Double = 0
    ) {
        self.symbol = symbol
        self.directionRaw = direction.rawValue
        self.entryDate = entryDate
        self.quantity = quantity
        self.multiplier = multiplier
        self.entryPrice = entryPrice
    }

    // MARK: - Abgeleitete Werte

    var direction: TradeDirection {
        get { TradeDirection(rawValue: directionRaw) ?? .long }
        set { directionRaw = newValue.rawValue }
    }

    var isClosed: Bool { exitDate != nil }

    var plan: TradePlan? {
        let plan = TradePlan(entry: plannedEntry, stop: plannedStop, target: plannedTarget, reason: planReason)
        return plan.isEmpty ? nil : plan
    }

    /// Netto-Ergebnis nach Gebühren. Offene Trades: 0.
    var netPnL: Double {
        if let pnlOverride { return pnlOverride }
        guard let exitPrice, isClosed else { return 0 }
        return PnLCalculator.netPnL(
            direction: direction,
            entryPrice: entryPrice,
            exitPrice: exitPrice,
            quantity: quantity,
            multiplier: multiplier,
            fees: fees
        )
    }

    var sortedTags: [Tag] {
        (tags ?? []).sorted { ($0.kind.rawValue, $0.name) < ($1.kind.rawValue, $1.name) }
    }

    func tags(of kind: TagKind) -> [Tag] {
        (tags ?? []).filter { $0.kind == kind }.sorted { $0.name < $1.name }
    }

    var setupTag: Tag? { tags(of: .setup).first }
    var strategyTag: Tag? { tags(of: .strategy).first }
    var marketPhaseTag: Tag? { tags(of: .marketPhase).first }
    var mistakeTags: [Tag] { tags(of: .mistake) }
    var emotionTags: [Tag] { tags(of: .emotion) }

    var isCompliant: Bool { mistakeTags.isEmpty && (brokenRules ?? []).isEmpty }

    var sortedAttachments: [TradeAttachment] {
        (attachments ?? []).sorted { $0.createdAt < $1.createdAt }
    }

    var sortedVoiceNotes: [VoiceNote] {
        (voiceNotes ?? []).sorted { $0.createdAt < $1.createdAt }
    }

    /// Momentaufnahme für die Analyse-Engine.
    func record(regime: MarketRegime? = nil) -> TradeRecord {
        TradeRecord(
            id: id,
            symbol: symbol,
            direction: direction,
            entryDate: entryDate,
            exitDate: exitDate,
            quantity: quantity,
            multiplier: multiplier,
            entryPrice: entryPrice,
            exitPrice: exitPrice,
            fees: fees,
            netPnL: netPnL,
            plan: plan,
            initialStop: initialStop,
            maePrice: maePrice,
            mfePrice: mfePrice,
            setup: setupTag?.name,
            strategy: strategyTag?.name,
            marketPhase: marketPhaseTag?.name,
            mistakes: mistakeTags.map(\.name),
            emotions: emotionTags.map(\.name),
            brokenRules: (brokenRules ?? []).map(\.title),
            regime: regime
        )
    }

    /// Übernimmt Werte aus einem Entwurf (Import oder Beispieldaten). Tags und Regeln werden separat verknüpft.
    func apply(_ draft: TradeDraft) {
        symbol = draft.symbol
        direction = draft.direction
        entryDate = draft.entryDate
        exitDate = draft.exitDate
        quantity = draft.quantity
        multiplier = draft.multiplier
        entryPrice = draft.entryPrice
        exitPrice = draft.exitPrice
        fees = draft.fees
        pnlOverride = draft.pnlOverride
        plannedEntry = draft.plan?.entry
        plannedStop = draft.plan?.stop
        plannedTarget = draft.plan?.target
        planReason = draft.plan?.reason ?? ""
        initialStop = draft.initialStop
        maePrice = draft.maePrice
        mfePrice = draft.mfePrice
        notes = draft.notes
        updatedAt = Date()
    }
}
