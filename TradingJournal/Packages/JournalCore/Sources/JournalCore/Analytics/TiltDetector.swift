import Foundation

/// Verhaltensmuster, die häufig schlechten Handelstagen vorausgehen.
public enum TiltPattern: String, CaseIterable, Codable, Sendable, Hashable, Identifiable {
    /// Deutlich größere Position direkt nach einem Verlust.
    case sizeEscalationAfterLoss
    /// Viele Trades in kurzer Zeit.
    case rapidFire
    /// Mehrere Verluste in Folge.
    case lossStreak
    /// Wiedereinstieg in dasselbe Symbol kurz nach einem Verlust.
    case revengeReentry
    /// Tagesverlust jenseits der persönlichen Grenze.
    case dailyLossLimit

    public var id: String { rawValue }
}

public enum TiltSeverity: Int, Comparable, Sendable, Hashable {
    case notice
    case warning
    case critical

    public static func < (lhs: TiltSeverity, rhs: TiltSeverity) -> Bool { lhs.rawValue < rhs.rawValue }
}

public struct TiltConfiguration: Sendable, Hashable {
    /// Ab diesem Faktor gilt eine Position als „eskaliert“.
    public var sizeEscalationFactor: Double = 1.5
    /// So viele Trades …
    public var rapidFireCount: Int = 4
    /// … innerhalb dieses Zeitfensters.
    public var rapidFireWindow: TimeInterval = 30 * 60
    public var lossStreakLength: Int = 3
    /// Wiedereinstieg im selben Symbol innerhalb dieses Fensters nach einem Verlust.
    public var revengeWindow: TimeInterval = 10 * 60
    /// Tagesverlust-Grenze als Anteil der Kontogröße.
    public var dailyLossLimitFraction: Double = 0.02
    public var accountSize: Double?

    public init() {}
}

/// Wie stark ein Muster in der eigenen Historie mit Verlusttagen zusammenhängt.
public struct TiltPatternEvidence: Identifiable, Hashable, Sendable {
    public var pattern: TiltPattern
    public var daysWithPattern: Int
    public var losingDaysWithPattern: Int
    public var daysWithoutPattern: Int
    public var averagePnLWithPattern: Double
    public var averagePnLWithoutPattern: Double

    public var id: TiltPattern { pattern }

    public var losingDayRate: Double {
        daysWithPattern > 0 ? Double(losingDaysWithPattern) / Double(daysWithPattern) : 0
    }

    /// Ein persönlicher Auslöser: kommt mehrfach vor und geht überwiegend mit Verlusttagen einher.
    public var isPersonalTrigger: Bool {
        daysWithPattern >= 3 && losingDayRate >= 0.6 && averagePnLWithPattern < averagePnLWithoutPattern
    }
}

public struct TiltProfile: Hashable, Sendable {
    public var evidence: [TiltPattern: TiltPatternEvidence]
    public var dayCount: Int
    public var overallLosingDayRate: Double

    public static let empty = TiltProfile(evidence: [:], dayCount: 0, overallLosingDayRate: 0)

    public var personalTriggers: [TiltPatternEvidence] {
        evidence.values.filter(\.isPersonalTrigger).sorted { $0.losingDayRate > $1.losingDayRate }
    }
}

/// Ein erkanntes Muster in der aktuellen Sitzung.
public struct TiltDetection: Identifiable, Hashable, Sendable {
    public var pattern: TiltPattern
    public var severity: TiltSeverity
    /// Messwert des Musters (Faktor, Anzahl, Betrag …).
    public var value: Double
    /// Schwellenwert, gegen den gemessen wurde.
    public var threshold: Double
    public var evidence: TiltPatternEvidence?

    public var id: TiltPattern { pattern }
}

public struct TiltDetector: Sendable {
    public var configuration: TiltConfiguration

    public init(configuration: TiltConfiguration = .init()) {
        self.configuration = configuration
    }

    // MARK: - Erkennung

    /// Prüft die Sitzung (chronologisch sortierte Trades eines Tages) auf Muster,
    /// bezogen auf den zuletzt erfassten Trade.
    public func detectPatterns(in session: [TradeRecord]) -> [TiltDetection] {
        let trades = session.sorted { $0.entryDate < $1.entryDate }
        guard let latest = trades.last else { return [] }
        var detections: [TiltDetection] = []
        let c = configuration

        // Größere Position nach Verlust
        if trades.count >= 2 {
            let previous = trades[trades.count - 2]
            if previous.isClosed, previous.outcome == .loss {
                let previousSize = positionSize(previous)
                let latestSize = positionSize(latest)
                if previousSize > 0 {
                    let factor = latestSize / previousSize
                    if factor >= c.sizeEscalationFactor {
                        detections.append(TiltDetection(pattern: .sizeEscalationAfterLoss, severity: .warning, value: factor, threshold: c.sizeEscalationFactor))
                    }
                }
            }
        }

        // Viele Trades in kurzer Zeit
        let windowStart = latest.entryDate.addingTimeInterval(-c.rapidFireWindow)
        let inWindow = trades.filter { $0.entryDate >= windowStart && $0.entryDate <= latest.entryDate }.count
        if inWindow >= c.rapidFireCount {
            detections.append(TiltDetection(pattern: .rapidFire, severity: .notice, value: Double(inWindow), threshold: Double(c.rapidFireCount)))
        }

        // Verlustserie
        var streak = 0
        for trade in trades.reversed() where trade.isClosed {
            if trade.outcome == .loss { streak += 1 } else { break }
        }
        if streak >= c.lossStreakLength {
            detections.append(TiltDetection(pattern: .lossStreak, severity: .warning, value: Double(streak), threshold: Double(c.lossStreakLength)))
        }

        // Revenge-Wiedereinstieg
        let earlier = trades.dropLast()
        if let lastLoss = earlier.last(where: { $0.symbol == latest.symbol && $0.isClosed && $0.outcome == .loss }),
           let lossExit = lastLoss.exitDate {
            let gap = latest.entryDate.timeIntervalSince(lossExit)
            if gap >= 0, gap <= c.revengeWindow {
                detections.append(TiltDetection(pattern: .revengeReentry, severity: .warning, value: gap, threshold: c.revengeWindow))
            }
        }

        // Tagesverlust-Grenze
        if let account = c.accountSize, account > 0 {
            let dayPnL = trades.filter(\.isClosed).reduce(0) { $0 + $1.netPnL }
            let limit = -(account * c.dailyLossLimitFraction)
            if dayPnL <= limit {
                detections.append(TiltDetection(pattern: .dailyLossLimit, severity: .critical, value: dayPnL, threshold: limit))
            }
        }

        return detections
    }

    // MARK: - Lernen aus der Historie

    /// Ermittelt, welche Muster in der eigenen Historie mit Verlusttagen zusammenhängen.
    public func learnProfile(from history: [TradeRecord], calendar: Calendar = .current) -> TiltProfile {
        let days = DailyAggregation.days(for: history, calendar: calendar)
        guard !days.isEmpty else { return .empty }

        var withPattern: [TiltPattern: [DayPerformance]] = [:]
        var daysByPattern: [TiltPattern: Set<Date>] = [:]

        for day in days {
            var found: Set<TiltPattern> = []
            for prefixLength in 1...day.trades.count {
                let prefix = Array(day.trades.prefix(prefixLength))
                for detection in detectPatterns(in: prefix) {
                    found.insert(detection.pattern)
                }
            }
            for pattern in found {
                withPattern[pattern, default: []].append(day)
                daysByPattern[pattern, default: []].insert(day.day)
            }
        }

        var evidence: [TiltPattern: TiltPatternEvidence] = [:]
        for pattern in TiltPattern.allCases {
            let with = withPattern[pattern] ?? []
            let without = days.filter { !(daysByPattern[pattern]?.contains($0.day) ?? false) }
            guard !with.isEmpty else { continue }
            evidence[pattern] = TiltPatternEvidence(
                pattern: pattern,
                daysWithPattern: with.count,
                losingDaysWithPattern: with.filter(\.isLosingDay).count,
                daysWithoutPattern: without.count,
                averagePnLWithPattern: Statistics.mean(with.map(\.pnl)),
                averagePnLWithoutPattern: Statistics.mean(without.map(\.pnl))
            )
        }

        let losingDays = days.filter(\.isLosingDay).count
        return TiltProfile(evidence: evidence, dayCount: days.count, overallLosingDayRate: Double(losingDays) / Double(days.count))
    }

    // MARK: - Bewertung

    /// Erkennt Muster in der Sitzung und gewichtet sie mit dem persönlichen Profil.
    public func evaluate(session: [TradeRecord], profile: TiltProfile?) -> [TiltDetection] {
        detectPatterns(in: session).map { detection in
            var result = detection
            if let evidence = profile?.evidence[detection.pattern] {
                result.evidence = evidence
                if evidence.isPersonalTrigger {
                    result.severity = evidence.losingDayRate >= 0.75 ? .critical : max(.warning, detection.severity)
                }
            }
            return result
        }
        .sorted { $0.severity > $1.severity }
    }

    // MARK: - Hilfen

    /// Positionsgröße: bevorzugt das Anfangsrisiko, sonst der Positionswert.
    private func positionSize(_ trade: TradeRecord) -> Double {
        trade.initialRisk ?? (trade.quantity * trade.entryPrice * trade.multiplier)
    }
}
