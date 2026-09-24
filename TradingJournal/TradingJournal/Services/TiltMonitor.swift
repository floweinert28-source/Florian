import Foundation
import Observation
import JournalCore

/// Eine aufbereitete Tilt-Warnung für die Anzeige.
struct TiltWarning: Identifiable, Hashable {
    let pattern: TiltPattern
    let severity: TiltSeverity
    let title: String
    let message: String
    let evidence: String?

    var id: TiltPattern { pattern }
}

/// Bewertet nach jedem erfassten Trade die aktuelle Sitzung und hält aktive Warnungen.
@Observable
@MainActor
final class TiltMonitor {
    private(set) var activeWarnings: [TiltWarning] = []
    private(set) var profile: TiltProfile = .empty
    private(set) var lastEvaluation: Date?

    /// Wird nach dem Sichern eines Trades aufgerufen.
    func evaluate(after trade: Trade, allTrades: [Trade], settings: SettingsStore) {
        guard settings.tiltWarningsEnabled else {
            activeWarnings = []
            return
        }
        let detector = TiltDetector(configuration: settings.tiltConfiguration)
        let records = allTrades.map { $0.record() }
        profile = detector.learnProfile(from: records)
        let session = DailyAggregation.session(of: records, on: trade.entryDate)
        let detections = detector.evaluate(session: session, profile: profile)
        let warnings = detections.map { Self.warning(for: $0, trade: trade, settings: settings) }
        lastEvaluation = Date()

        activeWarnings = warnings

        if !warnings.isEmpty {
            Haptics.warning()
            if settings.tiltNotificationsEnabled, let first = warnings.first {
                Task { await NotificationService.post(title: first.title, body: first.message) }
            }
        }
    }

    func refreshProfile(with trades: [Trade], settings: SettingsStore) {
        let detector = TiltDetector(configuration: settings.tiltConfiguration)
        profile = detector.learnProfile(from: trades.map { $0.record() })
    }

    func dismiss(_ warning: TiltWarning) {
        activeWarnings.removeAll { $0.id == warning.id }
    }

    func dismissAll() {
        activeWarnings = []
    }

    // MARK: - Texte

    static func warning(for detection: TiltDetection, trade: Trade, settings: SettingsStore) -> TiltWarning {
        let title: String
        let message: String
        switch detection.pattern {
        case .sizeEscalationAfterLoss:
            let factor = detection.value.formatted(.number.precision(.fractionLength(1)))
            title = String(localized: "Größere Position nach Verlust")
            message = String(localized: "Dein Risiko ist \(factor)× so hoch wie beim vorherigen Verlust-Trade. Prüfe, ob die Größe zum Plan passt.")
        case .rapidFire:
            let count = Int(detection.value)
            let minutes = Int(settings.tiltConfiguration.rapidFireWindow / 60)
            title = String(localized: "Viele Trades in kurzer Zeit")
            message = String(localized: "\(count) Trades in \(minutes) Minuten. Kurze Pause, dann mit klarem Plan weiter.")
        case .lossStreak:
            let count = Int(detection.value)
            title = String(localized: "\(count) Verluste in Folge")
            message = String(localized: "Verlustserien führen oft zu unüberlegten Einstiegen. Setze dir eine Grenze für heute.")
        case .revengeReentry:
            let minutes = max(1, Int(detection.value / 60))
            title = String(localized: "Wiedereinstieg in \(trade.symbol) nach Verlust")
            message = String(localized: "Nur \(minutes) Minuten nach einem Verlust im selben Markt. Klassisches Muster für einen Revenge-Trade.")
        case .dailyLossLimit:
            let pnl = Format.currency(detection.value, code: settings.currencyCode, signed: true)
            let limit = Format.currency(detection.threshold, code: settings.currencyCode, signed: true)
            title = String(localized: "Tagesverlust-Grenze erreicht")
            message = String(localized: "Heute liegst du bei \(pnl). Deine Grenze ist \(limit). Der beste Trade ist jetzt keiner.")
        }

        var evidence: String?
        if let e = detection.evidence, e.daysWithPattern >= 2 {
            let losing = e.losingDaysWithPattern
            let days = e.daysWithPattern
            let avgWith = Format.currency(e.averagePnLWithPattern, code: settings.currencyCode, signed: true)
            evidence = String(localized: "Dein Muster: An \(losing) von \(days) Tagen mit diesem Verhalten hast du negativ abgeschlossen (Ø \(avgWith)).")
        }

        return TiltWarning(pattern: detection.pattern, severity: detection.severity, title: title, message: evidence.map { "\(message) \($0)" } ?? message, evidence: evidence)
    }
}
