import Foundation

/// Ein Tag samt Art, wie er in den Beispieldaten vorkommt.
public struct SampleTag: Hashable, Sendable {
    public var name: String
    public var kind: TagKind
}

/// Vollständiger Beispieldatensatz zum Ausprobieren der App.
public struct SampleDataSet: Sendable {
    public var trades: [TradeDraft]
    public var checkIns: [CheckInDraft]
    public var regimes: [RegimeDraft]
    public var missedTrades: [MissedTradeDraft]
    public var rules: [String]
    public var tags: [SampleTag]
    public var accountSize: Double
}

/// Erzeugt einen realistischen, reproduzierbaren Beispieldatensatz:
/// rund 140 Trades über vier Monate mit Setups unterschiedlicher Güte,
/// Fehlern, Emotionen, Plänen, MAE/MFE, Check-ins, Regimes und verpassten Trades.
public struct SampleDataGenerator: Sendable {
    public var seed: UInt64
    public var now: Date
    public var calendar: Calendar
    public var accountSize: Double

    public init(seed: UInt64 = 2024, now: Date = Date(), calendar: Calendar = .current, accountSize: Double = 25_000) {
        self.seed = seed
        self.now = now
        self.calendar = calendar
        self.accountSize = accountSize
    }

    // MARK: - Stammdaten

    private struct Instrument {
        let symbol: String
        let basePrice: Double
        let stopRange: ClosedRange<Double>
        let multiplier: Double
        let decimals: Int
    }

    private struct SetupProfile {
        let name: String
        let baseWinRate: Double
        let strategy: String
        let trendBonus: Double
        let rangeBonus: Double
    }

    private static let instruments: [Instrument] = [
        Instrument(symbol: "DAX", basePrice: 18_250, stopRange: 15...40, multiplier: 1, decimals: 1),
        Instrument(symbol: "NASDAQ", basePrice: 19_400, stopRange: 20...60, multiplier: 1, decimals: 1),
        Instrument(symbol: "EURUSD", basePrice: 1.0850, stopRange: 0.0008...0.0025, multiplier: 100_000, decimals: 5),
        Instrument(symbol: "GOLD", basePrice: 2_340, stopRange: 4...12, multiplier: 1, decimals: 2),
        Instrument(symbol: "AAPL", basePrice: 192, stopRange: 0.8...2.2, multiplier: 1, decimals: 2),
    ]

    private static let setups: [SetupProfile] = [
        SetupProfile(name: "Pullback", baseWinRate: 0.58, strategy: "Trendfolge", trendBonus: 0.08, rangeBonus: -0.10),
        SetupProfile(name: "Breakout", baseWinRate: 0.50, strategy: "Trendfolge", trendBonus: 0.12, rangeBonus: -0.15),
        SetupProfile(name: "Range-Fade", baseWinRate: 0.52, strategy: "Mean Reversion", trendBonus: -0.14, rangeBonus: 0.10),
        SetupProfile(name: "Reversal", baseWinRate: 0.42, strategy: "Mean Reversion", trendBonus: -0.05, rangeBonus: 0.02),
    ]

    public static let mistakeNames = ["FOMO", "Regel gebrochen", "Revenge-Trade", "Zu früh raus", "Stop verschoben", "Übergröße"]
    public static let emotionNames = ["Ruhig", "Fokussiert", "Unsicher", "Gierig", "Ängstlich", "Gelangweilt", "Euphorisch"]
    public static let marketPhaseNames = ["Eröffnung", "Vormittag", "Mittag", "US-Eröffnung", "Nachmittag"]
    public static let ruleNames = [
        "Nur mit vollständigem Plan handeln",
        "Stop niemals verschieben",
        "Maximal 1 % Risiko pro Trade",
        "Nach zwei Verlusten in Folge Pause machen",
        "Keine Trades in den ersten fünf Minuten",
    ]

    // MARK: - Erzeugung

    public func generate() -> SampleDataSet {
        var rng = SeededRandomNumberGenerator(seed: seed)
        let today = calendar.startOfDay(for: now)
        let tradingDays = Self.tradingDays(endingAt: today, count: 88, calendar: calendar)

        var trades: [TradeDraft] = []
        var checkIns: [CheckInDraft] = []
        var regimes: [RegimeDraft] = []

        for (dayIndex, day) in tradingDays.enumerated() {
            let regime = MarketRegime(
                trend: Double.random(in: 0..<1, using: &rng) < 0.55 ? .trending : .ranging,
                volatility: Self.pick([.low, .normal, .normal, .high], &rng)
            )
            regimes.append(RegimeDraft(date: day, regime: regime, source: .manual))

            let isTiltDay = dayIndex % 11 == 4
            let sleepHours = isTiltDay ? Double.random(in: 4.8...6.0, using: &rng) : Double.random(in: 6.0...8.6, using: &rng)
            let stress = isTiltDay ? Int.random(in: 4...5, using: &rng) : Int.random(in: 1...4, using: &rng)
            let mood = isTiltDay ? Int.random(in: 1...3, using: &rng) : Int.random(in: 2...5, using: &rng)
            if Double.random(in: 0..<1, using: &rng) < 0.82 {
                checkIns.append(CheckInDraft(
                    date: calendar.date(byAdding: .hour, value: 8, to: day) ?? day,
                    sleepHours: (sleepHours * 2).rounded() / 2,
                    stressLevel: stress,
                    mood: mood,
                    note: isTiltDay ? "Schlecht geschlafen, unruhig." : ""
                ))
            }

            let tradeCount: Int = isTiltDay ? Int.random(in: 4...6, using: &rng) : Self.pick([0, 1, 1, 2, 2, 2, 3, 3], &rng)
            guard tradeCount > 0 else { continue }

            var cursor = calendar.date(byAdding: .minute, value: Int.random(in: 0...45, using: &rng), to: calendar.date(byAdding: .hour, value: 9, to: day) ?? day) ?? day
            var previousWasLoss = false
            var previousRisk: Double = 0
            var previousSymbol: String? = nil
            var previousExit: Date = cursor

            for tradeIndex in 0..<tradeCount {
                let instrument = Self.pick(Self.instruments, &rng)
                let setup = Self.pick(Self.setups, &rng)
                let direction: TradeDirection = Double.random(in: 0..<1, using: &rng) < 0.55 ? .long : .short

                // Fehler: an Tilt-Tagen häufiger, sonst gelegentlich.
                var mistakes: [String] = []
                var brokenRules: [String] = []
                let mistakeChance = isTiltDay ? 0.55 : 0.16
                if Double.random(in: 0..<1, using: &rng) < mistakeChance {
                    mistakes.append(Self.pick(Self.mistakeNames, &rng))
                    if mistakes.contains("Stop verschoben") { brokenRules.append(Self.ruleNames[1]) }
                    if mistakes.contains("Übergröße") { brokenRules.append(Self.ruleNames[2]) }
                    if mistakes.contains("Regel gebrochen"), Double.random(in: 0..<1, using: &rng) < 0.7 {
                        brokenRules.append(Self.pick([Self.ruleNames[0], Self.ruleNames[3], Self.ruleNames[4]], &rng))
                    }
                }
                let isRevenge = isTiltDay && previousWasLoss && tradeIndex > 0 && Double.random(in: 0..<1, using: &rng) < 0.5
                if isRevenge, !mistakes.contains("Revenge-Trade") { mistakes.append("Revenge-Trade") }

                // Risiko: 0,5–1 % des Kontos, an Tilt-Tagen nach Verlust eskalierend.
                var riskAmount = accountSize * Double.random(in: 0.005...0.010, using: &rng)
                if isTiltDay, previousWasLoss, previousRisk > 0 {
                    riskAmount = previousRisk * Double.random(in: 1.6...2.4, using: &rng)
                    if !mistakes.contains("Übergröße") { mistakes.append("Übergröße") }
                }
                if mistakes.contains("Übergröße"), riskAmount < accountSize * 0.015 {
                    riskAmount = accountSize * Double.random(in: 0.015...0.02, using: &rng)
                }

                // Einstiegszeit
                if tradeIndex > 0 {
                    let gapMinutes = isTiltDay ? Int.random(in: 3...9, using: &rng) : Int.random(in: 25...140, using: &rng)
                    cursor = calendar.date(byAdding: .minute, value: gapMinutes, to: previousExit) ?? previousExit
                }
                if isRevenge, let previousSymbol {
                    _ = previousSymbol
                }
                let hour = calendar.component(.hour, from: cursor)
                if hour >= 18 { break }

                // Gewinnwahrscheinlichkeit nach Setup, Regime, Tageszeit und Fehlern
                var winProbability = setup.baseWinRate
                winProbability += regime.trend == .trending ? setup.trendBonus : setup.rangeBonus
                if hour >= 9 && hour < 11 { winProbability += 0.06 }
                if hour >= 12 && hour < 14 { winProbability -= 0.08 }
                if calendar.component(.weekday, from: day) == 6 { winProbability -= 0.06 }
                if !mistakes.isEmpty { winProbability -= 0.18 }
                if regime.volatility == .high { winProbability -= 0.03 }
                winProbability = min(max(winProbability, 0.15), 0.85)

                let isWin = Double.random(in: 0..<1, using: &rng) < winProbability
                var rResult: Double
                if isWin {
                    rResult = Double.random(in: 0.7...2.6, using: &rng)
                    if mistakes.contains("Zu früh raus") { rResult = Double.random(in: 0.2...0.6, using: &rng) }
                    if setup.name == "Breakout" { rResult += 0.3 }
                } else {
                    rResult = -Double.random(in: 0.75...1.1, using: &rng)
                    if mistakes.contains("Stop verschoben") { rResult = -Double.random(in: 1.4...2.1, using: &rng) }
                }

                // Kurse
                let stopDistance = Double.random(in: instrument.stopRange, using: &rng)
                let drift = instrument.basePrice * Double.random(in: -0.03...0.03, using: &rng)
                let plannedEntry = Self.round(instrument.basePrice + drift, decimals: instrument.decimals)
                let deviationR = mistakes.contains("FOMO") ? Double.random(in: 0.45...0.9, using: &rng) : abs(rng.nextGaussian(mean: 0, standardDeviation: 0.12))
                let entryPrice = Self.round(plannedEntry + direction.sign * deviationR * stopDistance, decimals: instrument.decimals)
                let plannedStop = Self.round(plannedEntry - direction.sign * stopDistance, decimals: instrument.decimals)
                let plannedRR = Double.random(in: 1.5...3.0, using: &rng)
                let plannedTarget = Self.round(plannedEntry + direction.sign * stopDistance * plannedRR, decimals: instrument.decimals)
                let exitPrice = Self.round(entryPrice + direction.sign * rResult * stopDistance, decimals: instrument.decimals)
                let quantity = Self.round(riskAmount / (stopDistance * instrument.multiplier), decimals: instrument.symbol == "EURUSD" ? 2 : (instrument.symbol == "AAPL" ? 0 : 1))
                let fees = Self.round(Double.random(in: 0.8...3.5, using: &rng), decimals: 2)

                // MAE / MFE
                let maeR = isWin ? Double.random(in: 0.05...0.6, using: &rng) : min(abs(rResult), Double.random(in: 0.8...1.15, using: &rng))
                let mfeR = isWin ? rResult + Double.random(in: 0...0.5, using: &rng) : Double.random(in: 0...0.55, using: &rng)
                let maePrice = Self.round(entryPrice - direction.sign * maeR * stopDistance, decimals: instrument.decimals)
                let mfePrice = Self.round(entryPrice + direction.sign * mfeR * stopDistance, decimals: instrument.decimals)

                let holdingMinutes = Self.pick([4, 8, 12, 18, 25, 35, 50, 75, 110, 160, 240, 330], &rng)
                let exitDate = calendar.date(byAdding: .minute, value: holdingMinutes, to: cursor) ?? cursor

                var emotions: [String] = []
                if !mistakes.isEmpty || isTiltDay {
                    emotions.append(Self.pick(["Unsicher", "Gierig", "Ängstlich", "Euphorisch"], &rng))
                } else if Double.random(in: 0..<1, using: &rng) < 0.7 {
                    emotions.append(Self.pick(["Ruhig", "Fokussiert", "Gelangweilt"], &rng))
                }

                let phase: String = switch hour {
                case ..<10: "Eröffnung"
                case ..<12: "Vormittag"
                case ..<15: "Mittag"
                case ..<16: "US-Eröffnung"
                default: "Nachmittag"
                }

                let reason = Self.pick([
                    "Rücklauf an die 20er EMA im Aufwärtstrend, Volumen nimmt ab.",
                    "Ausbruch über das Tageshoch nach enger Konsolidierung.",
                    "Fehlausbruch am Range-Hoch, Ablehnung mit langem Docht.",
                    "Doppelboden am Vortagestief mit Divergenz.",
                    "Retest der Ausbruchszone nach Eröffnungsimpuls.",
                    "Abpraller am VWAP mit steigender Marktbreite.",
                ], &rng)

                let notes: String = mistakes.isEmpty
                    ? Self.pick(["Sauber nach Plan.", "Gutes Timing, Ausführung passte.", "", "Etwas zu früh gehandelt, sonst okay.", ""], &rng)
                    : Self.pick(["Ungeduldig geworden.", "Wollte den Verlust zurückholen.", "Regeln ignoriert – nicht wieder.", "Zu groß, Nerven lagen blank."], &rng)

                trades.append(TradeDraft(
                    symbol: instrument.symbol,
                    direction: direction,
                    entryDate: cursor,
                    exitDate: exitDate,
                    quantity: quantity,
                    multiplier: instrument.multiplier,
                    entryPrice: entryPrice,
                    exitPrice: exitPrice,
                    fees: fees,
                    plan: TradePlan(entry: plannedEntry, stop: plannedStop, target: plannedTarget, reason: reason),
                    initialStop: plannedStop,
                    maePrice: maePrice,
                    mfePrice: mfePrice,
                    setup: setup.name,
                    strategy: setup.strategy,
                    marketPhase: phase,
                    mistakes: mistakes,
                    emotions: emotions,
                    brokenRules: brokenRules,
                    notes: notes
                ))

                previousWasLoss = !isWin
                previousRisk = riskAmount
                previousSymbol = instrument.symbol
                previousExit = exitDate
            }
        }

        // Ein offener Trade von heute, damit der Zustand „offen“ sichtbar ist.
        if let openEntry = calendar.date(byAdding: .minute, value: -35, to: now), calendar.component(.weekday, from: now) != 1, calendar.component(.weekday, from: now) != 7 {
            let instrument = Self.instruments[0]
            let entry = Self.round(instrument.basePrice + 40, decimals: 1)
            trades.append(TradeDraft(
                symbol: instrument.symbol,
                direction: .long,
                entryDate: openEntry,
                exitDate: nil,
                quantity: 6,
                multiplier: 1,
                entryPrice: entry,
                exitPrice: nil,
                fees: 1.2,
                plan: TradePlan(entry: entry - 2, stop: entry - 28, target: entry + 55, reason: "Pullback an die Eröffnungsrange, Trendtag."),
                initialStop: entry - 28,
                setup: "Pullback",
                strategy: "Trendfolge",
                marketPhase: "Vormittag",
                emotions: ["Fokussiert"],
                notes: "Läuft noch. Teilgewinn am ersten Ziel geplant."
            ))
        }

        let missed = Self.missedTrades(days: tradingDays, calendar: calendar, rng: &rng)

        var tags: [SampleTag] = []
        tags.append(contentsOf: Self.setups.map { SampleTag(name: $0.name, kind: .setup) })
        tags.append(contentsOf: ["Trendfolge", "Mean Reversion", "News"].map { SampleTag(name: $0, kind: .strategy) })
        tags.append(contentsOf: Self.marketPhaseNames.map { SampleTag(name: $0, kind: .marketPhase) })
        tags.append(contentsOf: Self.mistakeNames.map { SampleTag(name: $0, kind: .mistake) })
        tags.append(contentsOf: Self.emotionNames.map { SampleTag(name: $0, kind: .emotion) })

        return SampleDataSet(
            trades: trades.sorted { $0.entryDate < $1.entryDate },
            checkIns: checkIns,
            regimes: regimes,
            missedTrades: missed,
            rules: Self.ruleNames,
            tags: tags,
            accountSize: accountSize
        )
    }

    // MARK: - Hilfen

    private static func missedTrades(days: [Date], calendar: Calendar, rng: inout SeededRandomNumberGenerator) -> [MissedTradeDraft] {
        let reasons = [
            "Zu lange gezögert, Einstieg verpasst.",
            "Angst nach dem Verlust davor.",
            "Nicht am Rechner gewesen.",
            "Setup nicht getraut, war aber lehrbuchmäßig.",
            "Wollte auf Bestätigung warten – kam nie.",
        ]
        var result: [MissedTradeDraft] = []
        let picks = days.suffix(60).enumerated().filter { $0.offset % 7 == 2 }.map(\.element)
        for day in picks {
            let instrument = pick(instruments, &rng)
            let setup = pick(setups, &rng)
            let direction: TradeDirection = Double.random(in: 0..<1, using: &rng) < 0.5 ? .long : .short
            let stop = Double.random(in: instrument.stopRange, using: &rng)
            let entry = round(instrument.basePrice * Double.random(in: 0.98...1.02, using: &rng), decimals: instrument.decimals)
            let outcomeR = Double.random(in: 0..<1, using: &rng) < 0.6 ? Double.random(in: 0.8...2.8, using: &rng) : -Double.random(in: 0.6...1.0, using: &rng)
            let date = calendar.date(byAdding: .minute, value: Int.random(in: 560...900, using: &rng), to: day) ?? day
            result.append(MissedTradeDraft(
                symbol: instrument.symbol,
                direction: direction,
                date: date,
                setup: setup.name,
                plannedEntry: entry,
                plannedStop: round(entry - direction.sign * stop, decimals: instrument.decimals),
                plannedTarget: round(entry + direction.sign * stop * 2.2, decimals: instrument.decimals),
                hypotheticalExit: round(entry + direction.sign * stop * outcomeR, decimals: instrument.decimals),
                quantity: round(180 / (stop * instrument.multiplier), decimals: instrument.symbol == "EURUSD" ? 2 : 1),
                multiplier: instrument.multiplier,
                reason: pick(reasons, &rng)
            ))
        }
        return result
    }

    static func tradingDays(endingAt end: Date, count: Int, calendar: Calendar) -> [Date] {
        var days: [Date] = []
        var cursor = end
        while days.count < count {
            let weekday = calendar.component(.weekday, from: cursor)
            if weekday != 1, weekday != 7 { days.append(cursor) }
            guard let previous = calendar.date(byAdding: .day, value: -1, to: cursor) else { break }
            cursor = previous
        }
        return days.reversed()
    }

    private static func pick<T>(_ options: [T], _ rng: inout SeededRandomNumberGenerator) -> T {
        options[Int.random(in: 0..<options.count, using: &rng)]
    }

    private static func round(_ value: Double, decimals: Int) -> Double {
        let factor = pow(10.0, Double(decimals))
        return (value * factor).rounded() / factor
    }
}
