import Foundation

/// Rohdaten eines Trades, wie sie beim Import oder aus Beispieldaten entstehen.
/// Die App legt daraus ihre persistenten Objekte an.
public struct TradeDraft: Identifiable, Hashable, Sendable {
    public var id: UUID
    public var symbol: String
    public var direction: TradeDirection
    public var entryDate: Date
    public var exitDate: Date?
    public var quantity: Double
    public var multiplier: Double
    public var entryPrice: Double
    public var exitPrice: Double?
    public var fees: Double
    /// Explizit importiertes Ergebnis; hat Vorrang vor der Berechnung aus Kursen.
    public var pnlOverride: Double?
    public var plan: TradePlan?
    public var initialStop: Double?
    public var maePrice: Double?
    public var mfePrice: Double?
    public var setup: String?
    public var strategy: String?
    public var marketPhase: String?
    public var mistakes: [String]
    public var emotions: [String]
    public var brokenRules: [String]
    public var notes: String

    public init(
        id: UUID = UUID(),
        symbol: String,
        direction: TradeDirection,
        entryDate: Date,
        exitDate: Date? = nil,
        quantity: Double,
        multiplier: Double = 1,
        entryPrice: Double,
        exitPrice: Double? = nil,
        fees: Double = 0,
        pnlOverride: Double? = nil,
        plan: TradePlan? = nil,
        initialStop: Double? = nil,
        maePrice: Double? = nil,
        mfePrice: Double? = nil,
        setup: String? = nil,
        strategy: String? = nil,
        marketPhase: String? = nil,
        mistakes: [String] = [],
        emotions: [String] = [],
        brokenRules: [String] = [],
        notes: String = ""
    ) {
        self.id = id
        self.symbol = symbol
        self.direction = direction
        self.entryDate = entryDate
        self.exitDate = exitDate
        self.quantity = quantity
        self.multiplier = multiplier
        self.entryPrice = entryPrice
        self.exitPrice = exitPrice
        self.fees = fees
        self.pnlOverride = pnlOverride
        self.plan = plan
        self.initialStop = initialStop
        self.maePrice = maePrice
        self.mfePrice = mfePrice
        self.setup = setup
        self.strategy = strategy
        self.marketPhase = marketPhase
        self.mistakes = mistakes
        self.emotions = emotions
        self.brokenRules = brokenRules
        self.notes = notes
    }

    /// Netto-Ergebnis: importierter Wert, sonst aus Kursen berechnet. Offene Trades haben 0.
    public var netPnL: Double {
        if let pnlOverride { return pnlOverride }
        guard let exitPrice else { return 0 }
        return PnLCalculator.netPnL(
            direction: direction,
            entryPrice: entryPrice,
            exitPrice: exitPrice,
            quantity: quantity,
            multiplier: multiplier,
            fees: fees
        )
    }

    /// Wandelt den Entwurf in eine Auswertungs-Momentaufnahme um.
    public func record(regime: MarketRegime? = nil) -> TradeRecord {
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
            setup: setup,
            strategy: strategy,
            marketPhase: marketPhase,
            mistakes: mistakes,
            emotions: emotions,
            brokenRules: brokenRules,
            regime: regime
        )
    }
}

/// Täglicher Zustands-Check-in.
public struct CheckInDraft: Hashable, Sendable {
    public var date: Date
    public var sleepHours: Double
    /// 1 (entspannt) … 5 (sehr gestresst)
    public var stressLevel: Int
    /// 1 (schlecht) … 5 (sehr gut)
    public var mood: Int
    public var note: String

    public init(date: Date, sleepHours: Double, stressLevel: Int, mood: Int, note: String = "") {
        self.date = date
        self.sleepHours = sleepHours
        self.stressLevel = stressLevel
        self.mood = mood
        self.note = note
    }
}

/// Regime-Einstufung eines Tages.
public struct RegimeDraft: Hashable, Sendable {
    public var date: Date
    public var regime: MarketRegime
    public var source: RegimeSource

    public init(date: Date, regime: MarketRegime, source: RegimeSource = .manual) {
        self.date = date
        self.regime = regime
        self.source = source
    }
}

/// Gesehener, aber nicht genommener Trade.
public struct MissedTradeDraft: Hashable, Sendable {
    public var symbol: String
    public var direction: TradeDirection
    public var date: Date
    public var setup: String?
    public var plannedEntry: Double
    public var plannedStop: Double
    public var plannedTarget: Double?
    /// Kurs, zu dem der Trade hypothetisch beendet worden wäre.
    public var hypotheticalExit: Double?
    public var quantity: Double
    public var multiplier: Double
    public var reason: String
    public var notes: String

    public init(
        symbol: String,
        direction: TradeDirection,
        date: Date,
        setup: String? = nil,
        plannedEntry: Double,
        plannedStop: Double,
        plannedTarget: Double? = nil,
        hypotheticalExit: Double? = nil,
        quantity: Double,
        multiplier: Double = 1,
        reason: String = "",
        notes: String = ""
    ) {
        self.symbol = symbol
        self.direction = direction
        self.date = date
        self.setup = setup
        self.plannedEntry = plannedEntry
        self.plannedStop = plannedStop
        self.plannedTarget = plannedTarget
        self.hypotheticalExit = hypotheticalExit
        self.quantity = quantity
        self.multiplier = multiplier
        self.reason = reason
        self.notes = notes
    }
}

/// Hypothetisches Ergebnis eines verpassten Trades.
public enum MissedTradeMath {
    public static func hypotheticalPnL(
        direction: TradeDirection,
        plannedEntry: Double,
        hypotheticalExit: Double?,
        quantity: Double,
        multiplier: Double = 1
    ) -> Double? {
        guard let hypotheticalExit else { return nil }
        return PnLCalculator.grossPnL(
            direction: direction,
            entryPrice: plannedEntry,
            exitPrice: hypotheticalExit,
            quantity: quantity,
            multiplier: multiplier
        )
    }

    public static func hypotheticalR(
        direction: TradeDirection,
        plannedEntry: Double,
        plannedStop: Double,
        hypotheticalExit: Double?
    ) -> Double? {
        guard let hypotheticalExit else { return nil }
        let risk = abs(plannedEntry - plannedStop)
        guard risk > 0 else { return nil }
        return (hypotheticalExit - plannedEntry) * direction.sign / risk
    }
}
