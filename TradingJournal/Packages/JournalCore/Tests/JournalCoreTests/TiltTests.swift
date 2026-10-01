import Foundation
import Testing
@testable import JournalCore

@Suite("Tilt-Erkennung")
struct TiltTests {
    let detector: TiltDetector = {
        var config = TiltConfiguration()
        config.accountSize = 10_000
        return TiltDetector(configuration: config)
    }()

    @Test("Größere Position nach Verlust")
    func sizeEscalation() {
        let session = [
            Fixtures.trade(r: -1, entry: Fixtures.date(2026, 3, 2, 9, 0), quantity: 10),
            Fixtures.trade(r: 0.5, entry: Fixtures.date(2026, 3, 2, 10, 0), quantity: 20),
        ]
        // Risiko ist fix 100 €, also Positionswert vergleichen: nicht anwendbar, Anfangsrisiko zählt.
        // Daher explizit ohne Plan, damit der Positionswert herangezogen wird.
        let noPlan = session.map { trade -> TradeRecord in
            var t = trade
            t.plan = nil
            t.initialStop = nil
            return t
        }
        let detections = detector.detectPatterns(in: noPlan)
        let escalation = detections.first { $0.pattern == .sizeEscalationAfterLoss }
        #expect(escalation != nil)
        #expect(abs((escalation?.value ?? 0) - 2.0) < 1e-9)
    }

    @Test("Viele Trades in kurzer Zeit")
    func rapidFire() {
        let session = (0..<4).map { i in
            Fixtures.trade(r: 0.2, entry: Fixtures.date(2026, 3, 2, 9, i * 6), holdingMinutes: 4)
        }
        let detections = detector.detectPatterns(in: session)
        #expect(detections.contains { $0.pattern == .rapidFire })
    }

    @Test("Verlustserie und Tagesverlust-Grenze")
    func lossStreakAndDailyLimit() {
        let session = (0..<3).map { i in
            Fixtures.trade(r: -1, entry: Fixtures.date(2026, 3, 2, 9 + i, 0), holdingMinutes: 20)
        }
        let detections = detector.detectPatterns(in: session)
        #expect(detections.contains { $0.pattern == .lossStreak })
        // 3 × −100 € = −300 € ≥ 2 % von 10 000 € ⇒ Grenze erreicht
        #expect(detections.contains { $0.pattern == .dailyLossLimit && $0.severity == .critical })
    }

    @Test("Revenge-Wiedereinstieg im selben Symbol")
    func revengeReentry() {
        let loss = Fixtures.trade(r: -1, symbol: "NASDAQ", entry: Fixtures.date(2026, 3, 2, 9, 0), holdingMinutes: 10)
        let reentry = Fixtures.trade(r: 0.3, symbol: "NASDAQ", entry: Fixtures.date(2026, 3, 2, 9, 15), holdingMinutes: 10)
        let detections = detector.detectPatterns(in: [loss, reentry])
        #expect(detections.contains { $0.pattern == .revengeReentry })

        let later = Fixtures.trade(r: 0.3, symbol: "NASDAQ", entry: Fixtures.date(2026, 3, 2, 10, 30), holdingMinutes: 10)
        #expect(!detector.detectPatterns(in: [loss, later]).contains { $0.pattern == .revengeReentry })
    }

    @Test("Ruhige Sitzung löst nichts aus")
    func calmSession() {
        let session = [
            Fixtures.trade(r: 1, entry: Fixtures.date(2026, 3, 2, 9, 0)),
            Fixtures.trade(r: -1, entry: Fixtures.date(2026, 3, 2, 11, 0)),
        ]
        #expect(detector.detectPatterns(in: session).isEmpty)
    }

    @Test("Profil erkennt persönliche Auslöser und hebt die Stufe an")
    func profileLearning() {
        var history: [TradeRecord] = []
        // 4 Tage mit Verlustserie, alle negativ
        for day in 2...5 {
            for i in 0..<3 {
                history.append(Fixtures.trade(r: -1, entry: Fixtures.date(2026, 3, day, 9 + i, 0), holdingMinutes: 20))
            }
        }
        // 4 ruhige, positive Tage
        for day in 9...12 {
            history.append(Fixtures.trade(r: 1.5, entry: Fixtures.date(2026, 3, day, 9, 0)))
        }
        let profile = detector.learnProfile(from: history, calendar: Fixtures.calendar)
        let evidence = profile.evidence[.lossStreak]
        #expect(evidence?.daysWithPattern == 4)
        #expect(evidence?.losingDaysWithPattern == 4)
        #expect(evidence?.isPersonalTrigger == true)
        #expect(profile.dayCount == 8)

        let session = (0..<3).map { i in Fixtures.trade(r: -1, entry: Fixtures.date(2026, 3, 20, 9 + i, 0), holdingMinutes: 20) }
        let warnings = detector.evaluate(session: session, profile: profile)
        let streak = warnings.first { $0.pattern == .lossStreak }
        #expect(streak?.severity == .critical)
        #expect(streak?.evidence != nil)
    }
}
