import SwiftUI
import SwiftData
import Charts
import JournalCore

struct DashboardView: View {
    @Environment(AppModel.self) private var appModel
    @Environment(SettingsStore.self) private var settings
    @Environment(TiltMonitor.self) private var tiltMonitor
    @Query(sort: \Trade.entryDate, order: .reverse) private var trades: [Trade]
    @Query private var regimes: [MarketRegimeEntry]
    @Query(sort: \DailyCheckIn.date, order: .reverse) private var checkIns: [DailyCheckIn]
    @State private var period: AnalysisPeriod = .month

    var body: some View {
        let metrics = DashboardMetrics(trades: trades, regimes: regimes, period: period)
        Screen {
            heroHeader(metrics)
            tiltBanners
            checkInPrompt
            statGrid(metrics)
            EquityCurveCard(points: metrics.equity, drawdown: metrics.drawdown, period: period)
            AdaptiveColumns {
                DisciplineCard(score: metrics.disciplineScore, timeline: metrics.disciplineTimeline, period: period)
                MistakeCostCard(report: metrics.monthMistakeReport)
            }
            RecentTradesCard(trades: Array(trades.prefix(6)))
        }
        .navigationTitle("Übersicht")
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                PeriodMenu(period: $period)
            }
            ToolbarItem(placement: .primaryAction) {
                Button {
                    appModel.present(.newTrade)
                } label: {
                    Label("Neuer Trade", systemImage: "plus")
                }
            }
        }
        .overlay {
            if trades.isEmpty {
                EmptyStateView(
                    title: "Willkommen im Journal",
                    message: "Erfasse deinen ersten Trade oder importiere eine CSV-Datei deines Brokers. Beispieldaten findest du in den Einstellungen.",
                    systemImage: "chart.line.uptrend.xyaxis",
                    actionTitle: "Ersten Trade erfassen"
                ) {
                    appModel.present(.newTrade)
                }
                .background(Color.screenBackground)
            }
        }
        .animation(Theme.spring, value: period)
        .animation(Theme.spring, value: tiltMonitor.activeWarnings)
    }

    // MARK: - Kopf

    private func heroHeader(_ metrics: DashboardMetrics) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(period.title)
                .font(.metricLabel)
                .foregroundStyle(.secondary)
            PnLText(value: metrics.summary.totalPnL, font: .metricHero)
            HStack(spacing: 6) {
                Text("\(metrics.summary.tradeCount) Trades")
                if metrics.summary.tradeCount > 0 {
                    Text("·")
                    Text("Win-Rate \(Format.percent(metrics.summary.winRate))")
                }
                if metrics.openTradeCount > 0 {
                    Text("·")
                    Text("\(metrics.openTradeCount) offen")
                        .foregroundStyle(Color.accentColor)
                }
            }
            .font(.subheadline)
            .foregroundStyle(.secondary)
        }
        .padding(.top, Theme.Spacing.s)
    }

    @ViewBuilder
    private var tiltBanners: some View {
        ForEach(tiltMonitor.activeWarnings) { warning in
            BannerView(
                style: warning.severity == .critical ? .critical : (warning.severity == .warning ? .warning : .notice),
                title: warning.title,
                message: warning.message
            ) {
                tiltMonitor.dismiss(warning)
            }
            .transition(.move(edge: .top).combined(with: .opacity))
        }
    }

    @ViewBuilder
    private var checkInPrompt: some View {
        if !trades.isEmpty, !hasCheckInToday {
            Card(padding: Theme.Spacing.l) {
                HStack(spacing: Theme.Spacing.m) {
                    Image(systemName: "sun.horizon")
                        .font(.title2)
                        .foregroundStyle(Color.accentColor)
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Wie geht es dir heute?").font(.subheadline.weight(.semibold))
                        Text("Schlaf, Stress und Stimmung in zehn Sekunden festhalten.")
                            .font(.footnote).foregroundStyle(.secondary)
                    }
                    Spacer()
                    Button("Check-in") { appModel.present(.checkIn(Date())) }
                        .buttonStyle(.borderedProminent)
                        .controlSize(.small)
                }
            }
        }
    }

    private var hasCheckInToday: Bool {
        guard let latest = checkIns.first else { return false }
        return Calendar.current.isDateInToday(latest.date)
    }

    // MARK: - Kacheln

    private func statGrid(_ metrics: DashboardMetrics) -> some View {
        let s = metrics.summary
        return LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: Theme.Spacing.m)], spacing: Theme.Spacing.m) {
            StatTile(
                label: "Win-Rate",
                value: Format.percent(s.winRate),
                footnote: String(localized: "\(s.winCount) Gewinner · \(s.lossCount) Verlierer")
            )
            StatTile(
                label: "Profit-Faktor",
                value: Format.factor(s.profitFactor),
                footnote: String(localized: "Bruttogewinn ÷ Bruttoverlust"),
                tint: (s.profitFactor ?? 0) >= 1 || s.profitFactor == nil ? nil : .loss
            )
            StatTile(
                label: "Expectancy",
                value: Format.currency(s.expectancy, code: settings.currencyCode, signed: true),
                footnote: String(localized: "Ø Ergebnis pro Trade"),
                tint: Color.pnl(s.expectancy)
            )
            StatTile(
                label: "Ø R-Multiple",
                value: s.averageR.map { Format.r($0) } ?? "—",
                footnote: s.rSampleCount > 0 ? String(localized: "aus \(s.rSampleCount) Trades mit Risiko") : String(localized: "Stop im Plan eintragen"),
                tint: s.averageR.map { Color.pnl($0) }
            )
        }
    }
}

// MARK: - Kapitalkurve

struct EquityCurveCard: View {
    @Environment(SettingsStore.self) private var settings
    let points: [EquityPoint]
    let drawdown: DrawdownInfo?
    let period: AnalysisPeriod
    @State private var selectedDate: Date?

    private var selectedPoint: EquityPoint? {
        guard let selectedDate, !points.isEmpty else { return nil }
        return points.min { abs($0.date.timeIntervalSince(selectedDate)) < abs($1.date.timeIntervalSince(selectedDate)) }
    }

    var body: some View {
        TitledCard("Kapitalkurve", subtitle: "Kumuliertes Ergebnis im Zeitraum", systemImage: "chart.line.uptrend.xyaxis") {
            if let selectedPoint {
                VStack(alignment: .trailing, spacing: 2) {
                    PnLText(value: selectedPoint.equity, font: .metricSmall)
                    Text(Format.dateTime(selectedPoint.date)).font(.caption).foregroundStyle(.secondary)
                }
            } else if let drawdown, drawdown.amount > 0 {
                VStack(alignment: .trailing, spacing: 2) {
                    Text("Max. Drawdown").font(.caption).foregroundStyle(.secondary)
                    Text(Format.currency(-drawdown.amount, code: settings.currencyCode, signed: true))
                        .font(.metricSmall).numeric().foregroundStyle(Color.loss)
                }
            }
        } content: {
            if points.count >= 2 {
                chart
                    .frame(height: 220)
            } else {
                Text("Noch keine abgeschlossenen Trades im Zeitraum.")
                    .font(.explanation)
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, minHeight: 120)
            }
        }
    }

    private var chart: some View {
        let lastValue = points.last?.equity ?? 0
        let tint = Color.pnl(lastValue)
        return Chart {
            ForEach(points) { point in
                AreaMark(x: .value("Datum", point.date), y: .value("Ergebnis", point.equity))
                    .foregroundStyle(
                        LinearGradient(colors: [tint.opacity(0.28), tint.opacity(0.02)], startPoint: .top, endPoint: .bottom)
                    )
                    .interpolationMethod(.monotone)
                LineMark(x: .value("Datum", point.date), y: .value("Ergebnis", point.equity))
                    .foregroundStyle(tint)
                    .lineStyle(StrokeStyle(lineWidth: 2.2, lineCap: .round, lineJoin: .round))
                    .interpolationMethod(.monotone)
            }
            RuleMark(y: .value("Null", 0))
                .foregroundStyle(.quaternary)
                .lineStyle(StrokeStyle(lineWidth: 1, dash: [3, 3]))
            if let selectedPoint {
                RuleMark(x: .value("Auswahl", selectedPoint.date))
                    .foregroundStyle(.secondary.opacity(0.5))
                    .lineStyle(StrokeStyle(lineWidth: 1))
                PointMark(x: .value("Datum", selectedPoint.date), y: .value("Ergebnis", selectedPoint.equity))
                    .foregroundStyle(tint)
                    .symbolSize(70)
            }
        }
        .chartXSelection(value: $selectedDate)
        .chartXAxis {
            AxisMarks(values: .automatic(desiredCount: 4)) {
                AxisGridLine().foregroundStyle(.quaternary)
                AxisValueLabel(format: .dateTime.day().month(.abbreviated))
            }
        }
        .chartYAxis {
            AxisMarks(position: .trailing, values: .automatic(desiredCount: 4)) {
                AxisGridLine().foregroundStyle(.quaternary)
                AxisValueLabel(format: .currency(code: settings.currencyCode).precision(.fractionLength(0)))
            }
        }
        .animation(Theme.spring, value: points)
    }
}

// MARK: - Disziplin

struct DisciplineCard: View {
    let score: Double?
    let timeline: [DisciplinePeriodScore]
    let period: AnalysisPeriod

    var body: some View {
        TitledCard("Disziplin-Score", subtitle: "Plan, Stop, Regeln, Fehler", systemImage: "checkmark.seal") {
            HStack(alignment: .center, spacing: Theme.Spacing.xl) {
                ScoreRing(score: score ?? 0)
                VStack(alignment: .leading, spacing: 6) {
                    Text(verdict)
                        .font(.subheadline.weight(.semibold))
                    Text("Ø über alle Trades: \(period.title.lowercased())")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    if timeline.count >= 2 {
                        Chart(timeline) { item in
                            BarMark(x: .value("Woche", item.periodStart, unit: .weekOfYear), y: .value("Score", item.score))
                                .foregroundStyle(Color.accentColor.opacity(0.7))
                                .cornerRadius(3)
                        }
                        .chartYScale(domain: 0...100)
                        .chartXAxis(.hidden)
                        .chartYAxis(.hidden)
                        .frame(height: 44)
                        .accessibilityLabel("Wochenverlauf des Disziplin-Scores")
                    }
                }
                Spacer(minLength: 0)
            }
        }
    }

    private var verdict: String {
        guard let score else { return String(localized: "Noch keine Trades bewertet") }
        switch score {
        case ..<50: return String(localized: "Ausbaufähig – Plan und Stop konsequent festhalten")
        case ..<75: return String(localized: "Solide – ein paar Ausreißer")
        case ..<90: return String(localized: "Gut – du handelst überwiegend nach Plan")
        default: return String(localized: "Exzellent – du hältst dich an deinen Plan")
        }
    }
}

// MARK: - Fehlerkosten

struct MistakeCostCard: View {
    @Environment(AppModel.self) private var appModel
    @Environment(SettingsStore.self) private var settings
    let report: MistakeCostReport

    var body: some View {
        TitledCard("Fehlerkosten", subtitle: "Dieser Monat", systemImage: "exclamationmark.triangle") {
            Button("Details") {
                appModel.show(.psychology)
            }
            .buttonStyle(.borderless)
            .font(.subheadline)
        } content: {
            VStack(alignment: .leading, spacing: Theme.Spacing.m) {
                Text(Format.currency(-report.costOfMistakes, code: settings.currencyCode, signed: true))
                    .font(.metricValue)
                    .numeric()
                    .foregroundStyle(report.costOfMistakes > 0 ? Color.loss : Color.profit)
                    .contentTransition(.numericText())
                if report.totalTrades == 0 {
                    Text("Noch keine Trades in diesem Monat.")
                        .font(.footnote).foregroundStyle(.secondary)
                } else if report.costOfMistakes <= 0 {
                    Text("Keine Fehler, die Geld gekostet hätten. Weiter so.")
                        .font(.footnote).foregroundStyle(.secondary)
                } else {
                    Text("Nur mit regelkonformen Trades: \(Format.currency(report.compliantPnL, code: settings.currencyCode, signed: true)) statt \(Format.currency(report.actualPnL, code: settings.currencyCode, signed: true)).")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
                let top = report.items.filter { $0.cost > 0 }.prefix(3)
                if !top.isEmpty {
                    let maximum = top.map(\.cost).max() ?? 1
                    VStack(spacing: Theme.Spacing.s) {
                        ForEach(Array(top)) { item in
                            LabeledBar(
                                label: item.mistake,
                                value: item.cost,
                                maximum: maximum,
                                valueText: Format.currency(-item.cost, code: settings.currencyCode, signed: true, compact: true),
                                tint: .loss
                            )
                        }
                    }
                }
            }
        }
    }
}

// MARK: - Letzte Trades

struct RecentTradesCard: View {
    @Environment(AppModel.self) private var appModel
    let trades: [Trade]

    var body: some View {
        TitledCard("Letzte Trades", systemImage: "clock.arrow.circlepath") {
            Button("Alle anzeigen") { appModel.show(.trades) }
                .buttonStyle(.borderless)
                .font(.subheadline)
        } content: {
            if trades.isEmpty {
                Text("Noch keine Trades erfasst.").font(.explanation).foregroundStyle(.secondary)
            } else {
                VStack(spacing: 0) {
                    ForEach(trades) { trade in
                        Button {
                            appModel.open(trade)
                        } label: {
                            TradeRow(trade: trade, showsDate: true)
                                .padding(.vertical, 8)
                                .padding(.horizontal, 6)
                                .contentShape(Rectangle())
                        }
                        .buttonStyle(.plain)
                        .hoverHighlight()
                        if trade.id != trades.last?.id {
                            Divider().padding(.leading, 44)
                        }
                    }
                }
            }
        }
    }
}
