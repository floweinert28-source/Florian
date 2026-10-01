import Foundation

/// Richtung eines Trades.
public enum TradeDirection: String, Codable, Sendable, CaseIterable, Hashable {
    case long
    case short

    /// Vorzeichen für die P&L-Berechnung: +1 für Long, −1 für Short.
    public var sign: Double { self == .long ? 1 : -1 }
}

/// Ergebnisklasse eines abgeschlossenen Trades.
public enum TradeOutcome: String, Codable, Sendable, CaseIterable, Hashable {
    case win
    case loss
    case breakeven
}

/// Der vor dem Einstieg festgehaltene Plan.
public struct TradePlan: Hashable, Codable, Sendable {
    public var entry: Double?
    public var stop: Double?
    public var target: Double?
    public var reason: String

    public init(entry: Double? = nil, stop: Double? = nil, target: Double? = nil, reason: String = "") {
        self.entry = entry
        self.stop = stop
        self.target = target
        self.reason = reason
    }

    /// Ein Plan gilt als vollständig, wenn Einstieg, Stop und Ziel gesetzt sind.
    public var isComplete: Bool {
        entry != nil && stop != nil && target != nil
    }

    public var isEmpty: Bool {
        entry == nil && stop == nil && target == nil && reason.isEmpty
    }

    /// Geplantes Risiko pro Einheit (Abstand Einstieg → Stop).
    public var riskPerUnit: Double? {
        guard let entry, let stop else { return nil }
        let distance = abs(entry - stop)
        return distance > 0 ? distance : nil
    }

    /// Geplante Chance pro Einheit (Abstand Einstieg → Ziel).
    public var rewardPerUnit: Double? {
        guard let entry, let target else { return nil }
        let distance = abs(target - entry)
        return distance > 0 ? distance : nil
    }

    /// Geplantes Chance-Risiko-Verhältnis.
    public var riskRewardRatio: Double? {
        guard let risk = riskPerUnit, let reward = rewardPerUnit else { return nil }
        return reward / risk
    }
}

/// Eine Kursbewegung gegen (MAE) oder für (MFE) die Position.
public struct Excursion: Hashable, Sendable {
    /// Abstand in Kurspunkten vom Einstieg.
    public var priceDistance: Double
    /// Gegenwert in Kontowährung.
    public var amount: Double
    /// Gegenwert in R (nur bei bekanntem Anfangsrisiko).
    public var rMultiple: Double?

    public init(priceDistance: Double, amount: Double, rMultiple: Double?) {
        self.priceDistance = priceDistance
        self.amount = amount
        self.rMultiple = rMultiple
    }
}

/// Plattformunabhängige Momentaufnahme eines Trades für sämtliche Auswertungen.
///
/// Die App überführt ihre SwiftData-Objekte in diese Wertstruktur, damit die
/// Analyse-Engine ohne Datenbank oder UI testbar bleibt.
public struct TradeRecord: Identifiable, Hashable, Sendable {
    public var id: UUID
    public var symbol: String
    public var direction: TradeDirection
    public var entryDate: Date
    public var exitDate: Date?
    public var quantity: Double
    /// Punktwert pro Einheit (z. B. Kontraktgröße). Standard 1.
    public var multiplier: Double
    public var entryPrice: Double
    public var exitPrice: Double?
    public var fees: Double
    /// Netto-Ergebnis in Kontowährung (nach Gebühren).
    public var netPnL: Double
    public var plan: TradePlan?
    /// Tatsächlich platzierter Anfangsstop.
    public var initialStop: Double?
    /// Ungünstigster Kurs während des Trades.
    public var maePrice: Double?
    /// Günstigster Kurs während des Trades.
    public var mfePrice: Double?
    public var setup: String?
    public var strategy: String?
    public var marketPhase: String?
    public var mistakes: [String]
    public var emotions: [String]
    public var brokenRules: [String]
    public var regime: MarketRegime?

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
        netPnL: Double,
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
        regime: MarketRegime? = nil
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
        self.netPnL = netPnL
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
        self.regime = regime
    }

    // MARK: - Abgeleitete Werte

    public var isClosed: Bool { exitDate != nil }

    /// Ein Trade ist regelkonform, wenn weder Fehler-Tags noch gebrochene Regeln vermerkt sind.
    public var isCompliant: Bool { mistakes.isEmpty && brokenRules.isEmpty }

    public var outcome: TradeOutcome {
        if abs(netPnL) < 1e-9 { return .breakeven }
        return netPnL > 0 ? .win : .loss
    }

    public var holdingDuration: TimeInterval? {
        guard let exitDate else { return nil }
        return exitDate.timeIntervalSince(entryDate)
    }

    /// Der für das Risiko maßgebliche Stop: erst der tatsächlich platzierte, sonst der geplante.
    public var effectiveStop: Double? { initialStop ?? plan?.stop }

    /// Anfangsrisiko pro Einheit in Kurspunkten.
    public var riskPerUnit: Double? {
        guard let stop = effectiveStop else { return nil }
        let distance = abs(entryPrice - stop)
        return distance > 0 ? distance : nil
    }

    /// Anfangsrisiko in Kontowährung.
    public var initialRisk: Double? {
        guard let riskPerUnit else { return nil }
        let risk = riskPerUnit * quantity * multiplier
        return risk > 0 ? risk : nil
    }

    /// Ergebnis in Vielfachen des Anfangsrisikos.
    public var rMultiple: Double? {
        guard let initialRisk else { return nil }
        return netPnL / initialRisk
    }

    /// Maximaler Kursverlauf gegen die Position.
    public var mae: Excursion? {
        guard let maePrice else { return nil }
        let distance = max(0, (entryPrice - maePrice) * direction.sign)
        return excursion(distance: distance)
    }

    /// Maximaler Kursverlauf zugunsten der Position.
    public var mfe: Excursion? {
        guard let mfePrice else { return nil }
        let distance = max(0, (mfePrice - entryPrice) * direction.sign)
        return excursion(distance: distance)
    }

    private func excursion(distance: Double) -> Excursion {
        let amount = distance * quantity * multiplier
        let r = riskPerUnit.map { distance / $0 }
        return Excursion(priceDistance: distance, amount: amount, rMultiple: r)
    }
}

// MARK: - P&L-Berechnung

public enum PnLCalculator {
    /// Brutto-Ergebnis ohne Gebühren.
    public static func grossPnL(
        direction: TradeDirection,
        entryPrice: Double,
        exitPrice: Double,
        quantity: Double,
        multiplier: Double = 1
    ) -> Double {
        (exitPrice - entryPrice) * direction.sign * quantity * multiplier
    }

    /// Netto-Ergebnis nach Gebühren.
    public static func netPnL(
        direction: TradeDirection,
        entryPrice: Double,
        exitPrice: Double,
        quantity: Double,
        multiplier: Double = 1,
        fees: Double = 0
    ) -> Double {
        grossPnL(direction: direction, entryPrice: entryPrice, exitPrice: exitPrice, quantity: quantity, multiplier: multiplier) - fees
    }
}
