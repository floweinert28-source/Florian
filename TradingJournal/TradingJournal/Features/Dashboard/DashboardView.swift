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
    @State private var calendarMonth: Date = Date()
    @State private var selectedDay: Date?

    #if os(iOS)
    @Environment(\.horizontalSizeClass) private var sizeClass
    #endif

    private var isWide: Bool {
        #if os(iOS)
        return sizeClass == .regular
        #else
        return true
        #endif
    }

    var body: some View {
        let metrics = DashboardMetrics(trades: trades, regimes: regimes, period: period, accountSize: settings.accountSize)
        Screen(spacing: Theme.Spacing.l) {
            filterBar
            tiltBanners
            checkInPrompt
            kpiRow(metrics)
            if isWide {
                HStack(alignment: .top, spacing: Theme.Spacing.l) {
                    TraderScoreCard(score: metrics.traderScore).frame(maxWidth: .infinity)
                    CumulativePnLCard(points: metrics.equity, drawdown: metrics.drawdown).frame(maxWidth: .infinity)
                    DailyPnLCard(days: metrics.days).frame(maxWidth: .infinity)
                }
                HStack(alignment: .top, spacing: Theme.Spacing.l) {
                    calendarCard(metrics)
                        .frame(maxWidth: .infinity)
                        .layoutPriority(2)
                    VStack(spacing: Theme.Spacing.l) {
                        DisciplineCard(score: metrics.disciplineScore, timeline: metrics.disciplineTimeline, period: period)
                        MistakeCostCard(report: metrics.monthMistakeReport)
                    }
                    .frame(width: 320)
                }
            } else {
                TraderScoreCard(score: metrics.traderScore)
                CumulativePnLCard(points: metrics.equity, drawdown: metrics.drawdown)
                DailyPnLCard(days: metrics.days)
                calendarCard(metrics)
                DisciplineCard(score: metrics.disciplineScore, timeline: metrics.disciplineTimeline, period: period)
                MistakeCostCard(report: metrics.monthMistakeReport)
            }
            RecentTradesCard(trades: Array(trades.prefix(8)))
        }
        .navigationTitle("Dashboard")
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button {
                    appModel.present(.newTrade)
                } label: {
                    Label("Neuer Trade", systemImage: "plus")
                }
            }
        }
        .navigationDestination(item: $selectedDay) { day in
            DayJournalView(day: day)
        }
        .navigationDestination(for: Trade.self) { trade in
            TradeDetailView(trade: trade)
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

    // MARK: - Filterleiste

    private var filterBar: some View {
        HStack(spacing: Theme.Spacing.m) {
            PeriodBar(period: $period)
            Spacer()
            if isWide {
                Text("Netto, nach Gebühren")
                    .font(.caption)
                    .foregroundStyle(.tertiary)
            }
        }
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
            Card(padding: Theme.Spacing.m) {
                HStack(spacing: Theme.Spacing.m) {
                    Image(systemName: "sun.horizon.fill")
                        .font(.title3)
                        .foregroundStyle(Color.accentColor)
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Wie geht es dir heute?").font(.subheadline.weight(.semibold))
                        Text("Schlaf, Stress und Stimmung in zehn Sekunden festhalten.")
                            .font(.caption).foregroundStyle(.secondary)
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

    // MARK: - KPI-Zeile

    private func kpiRow(_ metrics: DashboardMetrics) -> some View {
        let s = metrics.summary
        let code = settings.currencyCode
        return LazyVGrid(columns: [GridItem(.adaptive(minimum: isWide ? 200 : 160), spacing: Theme.Spacing.m)], spacing: Theme.Spacing.m) {
            StatTile(
                label: "Netto-P&L",
                value: Format.currency(s.totalPnL, code: code, signed: true),
                footnote: String(localized: "\(s.tradeCount) Trades") + (metrics.openTradeCount > 0 ? String(localized: " · \(metrics.openTradeCount) offen") : ""),
                tint: Color.pnl(s.totalPnL)
            ) {
                Image(systemName: s.totalPnL >= 0 ? "arrow.up.right" : "arrow.down.right")
                    .font(.headline)
                    .foregroundStyle(Color.pnl(s.totalPnL))
                    .frame(width: 36, height: 36)
                    .background(Circle().fill(Color.pnl(s.totalPnL).opacity(0.14)))
            }
            StatTile(
                label: "Trade-Win-Rate",
                value: Format.percent(s.winRate, digits: 1),
                footnote: String(localized: "\(s.winCount) Gewinner · \(s.lossCount) Verlierer")
            ) {
                DonutGauge(segments: [
                    GaugeSegment(value: Double(s.winCount), color: .profit),
                    GaugeSegment(value: Double(s.breakevenCount), color: .secondary.opacity(0.5)),
                    GaugeSegment(value: Double(s.lossCount), color: .loss),
                ])
            }
            StatTile(
                label: "Profit-Faktor",
                value: Format.factor(s.profitFactor),
                footnote: String(localized: "\(Format.currency(s.grossProfit, code: code, compact: true)) vs. \(Format.currency(abs(s.grossLoss), code: code, compact: true))"),
                tint: s.profitFactor.map { $0 >= 1 ? nil : Color.loss } ?? nil
            ) {
                DonutGauge(segments: [
                    GaugeSegment(value: s.grossProfit, color: .profit),
                    GaugeSegment(value: abs(s.grossLoss), color: .loss),
                ])
            }
            StatTile(
                label: "Tages-Win-Rate",
                value: Format.percent(metrics.dayWinRate, digits: 1),
                footnote: String(localized: "\(metrics.winningDays) grüne · \(metrics.losingDays) rote Tage")
            ) {
                DonutGauge(segments: [
                    GaugeSegment(value: Double(metrics.winningDays), color: .profit),
                    GaugeSegment(value: Double(max(metrics.days.count - metrics.winningDays - metrics.losingDays, 0)), color: .secondary.opacity(0.5)),
                    GaugeSegment(value: Double(metrics.losingDays), color: .loss),
                ])
            }
            StatTile(
                label: "Ø Gewinn / Ø Verlust",
                value: s.payoffRatio.map { Format.number($0, digits: 2) } ?? "—",
                footnote: "\(Format.currency(s.averageWin, code: code, compact: true)) · \(Format.currency(s.averageLoss, code: code, compact: true))"
            ) {
                WinLossBars(win: s.averageWin, loss: s.averageLoss)
            }
        }
    }

    // MARK: - Kalender

    private func calendarCard(_ metrics: DashboardMetrics) -> some View {
        TitledCard("Kalender", subtitle: "Tagesergebnisse, Wochensummen rechts", systemImage: "calendar") {
            HStack(spacing: 6) {
                Button { shiftMonth(-1) } label: { Image(systemName: "chevron.left") }
                Text(calendarMonth.formatted(.dateTime.month(.wide).year()))
                    .font(.subheadline.weight(.semibold))
                    .frame(minWidth: 130)
                Button { shiftMonth(1) } label: { Image(systemName: "chevron.right") }
            }
            .buttonStyle(.borderless)
            .font(.caption.weight(.bold))
        } content: {
            CalendarHeatmapView(month: calendarMonth, days: metrics.daysByDate, selectedDay: $selectedDay, compact: !isWide)
        }
    }

    private func shiftMonth(_ delta: Int) {
        if let next = Calendar.current.date(byAdding: .month, value: delta, to: calendarMonth) {
            withAnimation(Theme.spring) { calendarMonth = next }
        }
    }
}

// MARK: - Trader-Score

struct TraderScoreCard: View {
    let score: TraderScore

    var body: some View {
        TitledCard("Trader-Score", subtitle: "Sechs Dimensionen deiner Performance", systemImage: "hexagon") {
            Text("\(Int(score.overall))")
                .font(.metricValue)
                .numeric()
                .foregroundStyle(Color.accentColor)
                .contentTransition(.numericText())
        } content: {
            VStack(spacing: Theme.Spacing.s) {
                RadarChartView(axes: score.components.map { RadarAxis(id: $0.axis.rawValue, label: $0.axis.title, score: $0.score) })
                    .frame(height: 210)
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 6) {
                    ForEach(score.components) { component in
                        HStack(spacing: 6) {
                            Text(component.axis.title).font(.caption2).foregroundStyle(.secondary).lineLimit(1)
                            Spacer(minLength: 2)
                            Text(valueText(component)).font(.caption2.weight(.semibold)).numeric()
                        }
                    }
                }
            }
        }
    }

    private func valueText(_ component: TraderScoreComponent) -> String {
        guard let value = component.value else { return "—" }
        switch component.axis {
        case .winRate: return Format.percent(value)
        case .profitFactor, .payoffRatio, .recoveryFactor: return Format.number(value, digits: 2)
        case .maxDrawdown: return Format.percent(value, digits: 1)
        case .consistency: return Format.percent(value)
        }
    }
}

// MARK: - Kumulierte P&L

struct CumulativePnLCard: View {
    @Environment(SettingsStore.self) private var settings
    let points: [EquityPoint]
    let drawdown: DrawdownInfo?
    @State private var selectedDate: Date?

    private var selectedPoint: EquityPoint? {
        guard let selectedDate, !points.isEmpty else { return nil }
        return points.min { abs($0.date.timeIntervalSince(selectedDate)) < abs($1.date.timeIntervalSince(selectedDate)) }
    }

    var body: some View {
        TitledCard("Kumulierte Netto-P&L", systemImage: "chart.line.uptrend.xyaxis") {
            if let selectedPoint {
                VStack(alignment: .trailing, spacing: 1) {
                    PnLText(value: selectedPoint.equity, font: .metricSmall)
                    Text(Format.shortDate(selectedPoint.date)).font(.caption2).foregroundStyle(.secondary)
                }
            } else if let drawdown, drawdown.amount > 0 {
                VStack(alignment: .trailing, spacing: 1) {
                    Text("Max. DD").font(.caption2).foregroundStyle(.secondary)
                    Text(Format.currency(-drawdown.amount, code: settings.currencyCode, signed: true, compact: true))
                        .font(.metricSmall).numeric().foregroundStyle(Color.loss)
                }
            }
        } content: {
            if points.count >= 2 {
                chart.frame(height: 210)
            } else {
                Text("Noch keine abgeschlossenen Trades im Zeitraum.")
                    .font(.explanation).foregroundStyle(.secondary)
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
                    .foregroundStyle(LinearGradient(colors: [tint.opacity(0.35), tint.opacity(0.02)], startPoint: .top, endPoint: .bottom))
                    .interpolationMethod(.monotone)
                LineMark(x: .value("Datum", point.date), y: .value("Ergebnis", point.equity))
                    .foregroundStyle(tint)
                    .lineStyle(StrokeStyle(lineWidth: 2, lineCap: .round, lineJoin: .round))
                    .interpolationMethod(.monotone)
            }
            RuleMark(y: .value("Null", 0))
                .foregroundStyle(Color.cardBorder)
                .lineStyle(StrokeStyle(lineWidth: 1, dash: [3, 3]))
            if let selectedPoint {
                RuleMark(x: .value("Auswahl", selectedPoint.date))
                    .foregroundStyle(.secondary.opacity(0.5))
                PointMark(x: .value("Datum", selectedPoint.date), y: .value("Ergebnis", selectedPoint.equity))
                    .foregroundStyle(tint)
                    .symbolSize(60)
            }
        }
        .chartXSelection(value: $selectedDate)
        .chartXAxis {
            AxisMarks(values: .automatic(desiredCount: 4)) {
                AxisGridLine().foregroundStyle(Color.cardBorder)
                AxisValueLabel(format: .dateTime.day().month(.abbreviated)).font(.caption2)
            }
        }
        .chartYAxis {
            AxisMarks(position: .trailing, values: .automatic(desiredCount: 4)) {
                AxisGridLine().foregroundStyle(Color.cardBorder)
                AxisValueLabel(format: .currency(code: settings.currencyCode).precision(.fractionLength(0))).font(.caption2)
            }
        }
        .animation(Theme.spring, value: points)
    }
}

// MARK: - Tägliche P&L

struct DailyPnLCard: View {
    @Environment(SettingsStore.self) private var settings
    let days: [DayPerformance]

    var body: some View {
        TitledCard("Tägliche Netto-P&L", systemImage: "chart.bar.fill") {
            if days.count >= 2 {
                Chart(days) { day in
                    BarMark(x: .value("Tag", day.day, unit: .day), y: .value("Ergebnis", day.pnl))
                        .foregroundStyle(Color.pnl(day.pnl))
                        .cornerRadius(3)
                }
                .chartXAxis {
                    AxisMarks(values: .automatic(desiredCount: 4)) {
                        AxisGridLine().foregroundStyle(Color.cardBorder)
                        AxisValueLabel(format: .dateTime.day().month(.abbreviated)).font(.caption2)
                    }
                }
                .chartYAxis {
                    AxisMarks(position: .trailing, values: .automatic(desiredCount: 4)) {
                        AxisGridLine().foregroundStyle(Color.cardBorder)
                        AxisValueLabel(format: .currency(code: settings.currencyCode).precision(.fractionLength(0))).font(.caption2)
                    }
                }
                .frame(height: 210)
            } else {
                Text("Ab zwei Handelstagen erscheint hier das Tagesergebnis.")
                    .font(.explanation).foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, minHeight: 120)
            }
        }
    }
}

// MARK: - Disziplin

struct DisciplineCard: View {
    let score: Double?
    let timeline: [DisciplinePeriodScore]
    let period: AnalysisPeriod

    var body: some View {
        TitledCard("Disziplin-Score", subtitle: "Plan, Stop, Regeln, Fehler", systemImage: "checkmark.seal.fill") {
            HStack(alignment: .center, spacing: Theme.Spacing.l) {
                ScoreRing(score: score ?? 0, size: 72)
                VStack(alignment: .leading, spacing: 6) {
                    Text(verdict)
                        .font(.caption.weight(.semibold))
                        .fixedSize(horizontal: false, vertical: true)
                    if timeline.count >= 2 {
                        Chart(timeline) { item in
                            BarMark(x: .value("Woche", item.periodStart, unit: .weekOfYear), y: .value("Score", item.score))
                                .foregroundStyle(Color.accentColor.opacity(0.75))
                                .cornerRadius(2)
                        }
                        .chartYScale(domain: 0...100)
                        .chartXAxis(.hidden)
                        .chartYAxis(.hidden)
                        .frame(height: 40)
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
        case ..<90: return String(localized: "Gut – überwiegend nach Plan")
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
        TitledCard("Fehlerkosten", subtitle: "Dieser Monat", systemImage: "exclamationmark.triangle.fill") {
            Button("Details") {
                appModel.show(.psychology)
            }
            .buttonStyle(.borderless)
            .font(.caption.weight(.semibold))
        } content: {
            VStack(alignment: .leading, spacing: Theme.Spacing.m) {
                Text(Format.currency(-report.costOfMistakes, code: settings.currencyCode, signed: true))
                    .font(.metricValue)
                    .numeric()
                    .foregroundStyle(report.costOfMistakes > 0 ? Color.loss : Color.profit)
                    .contentTransition(.numericText())
                if report.totalTrades == 0 {
                    Text("Noch keine Trades in diesem Monat.")
                        .font(.caption).foregroundStyle(.secondary)
                } else if report.costOfMistakes <= 0 {
                    Text("Keine Fehler, die Geld gekostet hätten.")
                        .font(.caption).foregroundStyle(.secondary)
                } else {
                    Text("Regelkonform: \(Format.currency(report.compliantPnL, code: settings.currencyCode, signed: true)) statt \(Format.currency(report.actualPnL, code: settings.currencyCode, signed: true)).")
                        .font(.caption)
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
                .font(.caption.weight(.semibold))
        } content: {
            if trades.isEmpty {
                Text("Noch keine Trades erfasst.").font(.explanation).foregroundStyle(.secondary)
            } else {
                VStack(spacing: 0) {
                    TradeRowHeader()
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
                            Divider().overlay(Color.cardBorder)
                        }
                    }
                }
            }
        }
    }
}
