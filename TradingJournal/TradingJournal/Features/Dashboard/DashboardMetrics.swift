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
    let days: [DayPerformance]
    let dayWinRate: Double
    let winningDays: Int
    let losingDays: Int
    let traderScore: TraderScore
    let disciplineScore: Double?
    let disciplineTimeline: [DisciplinePeriodScore]
    let monthMistakeReport: MistakeCostReport
    let openTradeCount: Int
    /// Tagesergebnisse aller Trades (für den Kalender), unabhängig vom Zeitraum.
    let daysByDate: [Date: DayPerformance]

    init(trades: [Trade], regimes: [MarketRegimeEntry], period: AnalysisPeriod, accountSize: Double) {
        let snapshot = JournalSnapshot(trades: trades, regimes: regimes)
        self.period = period
        allRecords = snapshot.records
        periodRecords = snapshot.records(in: period)
        summary = PerformanceCalculator.summary(for: periodRecords)
        equity = EquityCurve.build(from: periodRecords, startingBalance: 0)
        drawdown = EquityCurve.maxDrawdown(equity)
        days = DailyAggregation.days(for: periodRecords)
        winningDays = days.filter { $0.pnl > 0 }.count
        losingDays = days.filter { $0.pnl < 0 }.count
        dayWinRate = days.isEmpty ? 0 : Double(winningDays) / Double(days.count)
        traderScore = TraderScoreCalculator.score(for: periodRecords, accountSize: accountSize)
        disciplineScore = DisciplineEvaluator.averageScore(for: periodRecords)
        disciplineTimeline = Array(DisciplineEvaluator.timeline(for: snapshot.records, granularity: .week).suffix(8))
        monthMistakeReport = MistakeCostAnalysis.report(for: AnalysisPeriod.month.filter(snapshot.records))
        openTradeCount = snapshot.records.filter { !$0.isClosed }.count
        let allDays = DailyAggregation.days(for: snapshot.records)
        daysByDate = Dictionary(uniqueKeysWithValues: allDays.map { ($0.day, $0) })
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
        case .all: String(localized: "Alle")
        }
    }
}

extension TraderScoreAxis {
    var title: String {
        switch self {
        case .winRate: String(localized: "Win-Rate")
        case .profitFactor: String(localized: "Profit-Faktor")
        case .payoffRatio: String(localized: "Ø Gewinn/Verlust")
        case .recoveryFactor: String(localized: "Erholung")
        case .maxDrawdown: String(localized: "Drawdown")
        case .consistency: String(localized: "Konsistenz")
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

/// Filterleiste über dem Dashboard: Zeitraum als Segmente.
struct PeriodBar: View {
    @Binding var period: AnalysisPeriod

    var body: some View {
        HStack(spacing: 4) {
            ForEach(AnalysisPeriod.allCases) { option in
                Button {
                    withAnimation(Theme.spring) { period = option }
                } label: {
                    Text(option.shortTitle)
                        .font(.caption.weight(.semibold))
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .foregroundStyle(period == option ? Color.white : Color.primary.opacity(0.8))
                        .background(
                            RoundedRectangle(cornerRadius: Theme.Radius.chip, style: .continuous)
                                .fill(period == option ? Color.accentColor : Color.clear)
                        )
                        .contentShape(RoundedRectangle(cornerRadius: Theme.Radius.chip, style: .continuous))
                }
                .buttonStyle(.plain)
            }
        }
        .padding(3)
        .background(
            RoundedRectangle(cornerRadius: Theme.Radius.control, style: .continuous)
                .fill(Color.cardBackground)
        )
        .overlay(
            RoundedRectangle(cornerRadius: Theme.Radius.control, style: .continuous)
                .strokeBorder(Color.cardBorder, lineWidth: 1)
        )
    }
}
