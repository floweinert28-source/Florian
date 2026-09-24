import Foundation
import SwiftUI
import JournalCore

/// Alle Kennzahlen des Dashboards, aus den persistenten Objekten berechnet.
struct DashboardMetrics {
    let period: AnalysisPeriod
    let allRecords: [TradeRecord]
    let periodRecords: [TradeRecord]
    let summary: PerformanceSummary
    let equity: [EquityPoint]
    let drawdown: DrawdownInfo?
    let disciplineScore: Double?
    let disciplineTimeline: [DisciplinePeriodScore]
    let monthMistakeReport: MistakeCostReport
    let openTradeCount: Int

    init(trades: [Trade], regimes: [MarketRegimeEntry], period: AnalysisPeriod) {
        let snapshot = JournalSnapshot(trades: trades, regimes: regimes)
        self.period = period
        allRecords = snapshot.records
        periodRecords = snapshot.records(in: period)
        summary = PerformanceCalculator.summary(for: periodRecords)
        equity = EquityCurve.build(from: periodRecords, startingBalance: 0)
        drawdown = EquityCurve.maxDrawdown(equity)
        disciplineScore = DisciplineEvaluator.averageScore(for: periodRecords)
        disciplineTimeline = Array(DisciplineEvaluator.timeline(for: snapshot.records, granularity: .week).suffix(8))
        monthMistakeReport = MistakeCostAnalysis.report(for: AnalysisPeriod.month.filter(snapshot.records))
        openTradeCount = snapshot.records.filter { !$0.isClosed }.count
    }
}

extension AnalysisPeriod {
    var title: String {
        switch self {
        case .week: String(localized: "Diese Woche")
        case .month: String(localized: "Dieser Monat")
        case .quarter: String(localized: "Dieses Quartal")
        case .year: String(localized: "Dieses Jahr")
        case .all: String(localized: "Gesamt")
        }
    }

    var shortTitle: String {
        switch self {
        case .week: String(localized: "Woche")
        case .month: String(localized: "Monat")
        case .quarter: String(localized: "Quartal")
        case .year: String(localized: "Jahr")
        case .all: String(localized: "Gesamt")
        }
    }
}

/// Auswahl des Zeitraums als Menü in der Toolbar.
struct PeriodMenu: View {
    @Binding var period: AnalysisPeriod

    var body: some View {
        Menu {
            Picker("Zeitraum", selection: $period) {
                ForEach(AnalysisPeriod.allCases) { option in
                    Text(option.title).tag(option)
                }
            }
        } label: {
            Label(period.shortTitle, systemImage: "calendar")
        }
    }
}
