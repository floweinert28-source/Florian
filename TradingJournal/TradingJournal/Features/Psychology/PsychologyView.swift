import SwiftUI
import SwiftData
import Charts
import JournalCore

struct PsychologyView: View {
    enum Tab: String, CaseIterable, Identifiable {
        case mistakes, emotions, state, missed
        var id: String { rawValue }

        var title: String {
            switch self {
            case .mistakes: String(localized: "Fehler")
            case .emotions: String(localized: "Emotionen")
            case .state: String(localized: "Zustand")
            case .missed: String(localized: "Verpasst")
            }
        }
    }

    @Environment(AppModel.self) private var appModel
    @Query(sort: \Trade.entryDate) private var trades: [Trade]
    @Query(sort: \MarketRegimeEntry.date) private var regimes: [MarketRegimeEntry]
    @Query(sort: \DailyCheckIn.date, order: .reverse) private var checkIns: [DailyCheckIn]
    @State private var tab: Tab = .mistakes
    @State private var period: AnalysisPeriod = .all

    var body: some View {
        let snapshot = JournalSnapshot(trades: trades, regimes: regimes, checkIns: checkIns)
        let records = snapshot.records(in: period)
        Screen {
            SegmentPicker(options: Tab.allCases, selection: $tab, title: \.title)
            switch tab {
            case .mistakes: MistakesView(records: records)
            case .emotions: EmotionsView(records: records)
            case .state: StateTrackingView(records: records, checkIns: checkIns, snapshot: snapshot)
            case .missed: MissedTradesView(period: period)
            }
        }
        .navigationTitle("Psychologie")
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                PeriodMenu(period: $period)
            }
            ToolbarItem(placement: .primaryAction) {
                Menu {
                    Button("Tages-Check-in", systemImage: "sun.horizon") { appModel.present(.checkIn(Date())) }
                    Button("Verpassten Trade erfassen", systemImage: "eye.slash") { appModel.present(.newMissedTrade) }
                } label: {
                    Label("Hinzufügen", systemImage: "plus")
                }
            }
        }
        .animation(Theme.spring, value: tab)
        .animation(Theme.spring, value: period)
    }
}

// MARK: - Fehlerkosten

struct MistakesView: View {
    @Environment(SettingsStore.self) private var settings
    let records: [TradeRecord]

    var body: some View {
        let report = MistakeCostAnalysis.report(for: records)
        let code = settings.currencyCode

        TitledCard("Was deine Fehler kosten", subtitle: "Ergebnis mit und ohne fehlerhafte Trades", systemImage: "eurosign.circle") {
            if report.totalTrades == 0 {
                Text("Keine abgeschlossenen Trades im Zeitraum.").font(.explanation).foregroundStyle(.secondary)
            } else {
                VStack(alignment: .leading, spacing: Theme.Spacing.l) {
                    HStack(alignment: .firstTextBaseline, spacing: Theme.Spacing.m) {
                        Text(Format.currency(-report.costOfMistakes, code: code, signed: true))
                            .font(.metricHero)
                            .numeric()
                            .foregroundStyle(report.costOfMistakes > 0 ? Color.loss : Color.profit)
                            .contentTransition(.numericText())
                        Text(report.costOfMistakes > 0 ? "durch Fehler verloren" : "kein Schaden durch Fehler")
                            .font(.subheadline).foregroundStyle(.secondary)
                    }
                    LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: Theme.Spacing.m)], spacing: Theme.Spacing.m) {
                        InlineStat(label: "Tatsächliches Ergebnis", value: Format.currency(report.actualPnL, code: code, signed: true), tint: Color.pnl(report.actualPnL))
                        InlineStat(label: "Nur regelkonforme Trades", value: Format.currency(report.compliantPnL, code: code, signed: true), tint: Color.pnl(report.compliantPnL))
                        InlineStat(label: "Regelkonform", value: "\(Format.percent(report.complianceRate)) · \(report.compliantTrades) von \(report.totalTrades)")
                        InlineStat(label: "Fehlerhafte Trades", value: Format.currency(report.nonCompliantPnL, code: code, signed: true), tint: Color.pnl(report.nonCompliantPnL))
                    }
                    Text(insight(report))
                        .font(.footnote).foregroundStyle(.secondary).fixedSize(horizontal: false, vertical: true)
                }
            }
        }

        TitledCard("Kosten je Fehlertyp", subtitle: "Ein Trade kann mehrere Fehler tragen", systemImage: "exclamationmark.triangle") {
            if report.items.isEmpty {
                Text("Keine Fehler-Tags vergeben. Markiere Trades mit FOMO, Revenge-Trade, Regel gebrochen … um Kosten sichtbar zu machen.")
                    .font(.explanation).foregroundStyle(.secondary)
            } else {
                let maximum = report.items.map { abs($0.totalPnL) }.max() ?? 1
                VStack(spacing: Theme.Spacing.m) {
                    ForEach(report.items) { item in
                        VStack(alignment: .leading, spacing: 4) {
                            LabeledBar(
                                label: item.mistake,
                                value: abs(item.totalPnL),
                                maximum: maximum,
                                valueText: Format.currency(item.totalPnL, code: code, signed: true),
                                tint: Color.pnl(item.totalPnL)
                            )
                            Text("\(item.tradeCount) Trades · WR \(Format.percent(item.winRate)) · Ø \(Format.currency(item.averagePnL, code: code, signed: true))")
                                .font(.caption).foregroundStyle(.tertiary).numeric()
                        }
                    }
                }
            }
        }
    }

    private func insight(_ report: MistakeCostReport) -> String {
        guard report.costOfMistakes > 0, let worst = report.items.first, worst.cost > 0 else {
            return String(localized: "Deine fehlerhaften Trades haben unter dem Strich nicht geschadet. Achte trotzdem auf die Muster – Glück ist keine Strategie.")
        }
        let share = report.costOfMistakes > 0 ? worst.cost / report.costOfMistakes : 0
        return String(localized: "Größter Posten: „\(worst.mistake)“ mit \(Format.currency(-worst.cost, code: settings.currencyCode, signed: true)) – das sind \(Format.percent(min(share, 1))) der Fehlerkosten. Ohne Fehler wäre dein Ergebnis \(Format.currency(report.compliantPnL, code: settings.currencyCode, signed: true)) statt \(Format.currency(report.actualPnL, code: settings.currencyCode, signed: true)).")
    }
}

// MARK: - Emotionen

struct EmotionsView: View {
    @Environment(SettingsStore.self) private var settings
    let records: [TradeRecord]

    var body: some View {
        let groups = GroupedPerformance.byEmotion(records)
        TitledCard("Ergebnis je Emotion", subtitle: "Ø Ergebnis pro Trade, sortiert nach Häufigkeit", systemImage: "face.smiling") {
            if groups.isEmpty {
                Text("Vergib Emotionen beim Erfassen (ruhig, fokussiert, gierig, ängstlich …), um zu sehen, in welchem Zustand du am besten handelst.")
                    .font(.explanation).foregroundStyle(.secondary)
            } else {
                EmotionChart(groups: groups)
            }
        }
        TitledCard("Emotionen im Detail", systemImage: "list.bullet") {
            GroupPerformanceList(groups: groups, emptyText: "Noch keine Emotionen vergeben.")
        }
    }
}

private struct EmotionChart: View {
    @Environment(SettingsStore.self) private var settings
    let groups: [GroupPerformance]

    var body: some View {
        Chart(groups) { group in
            BarMark(x: .value("Ø Ergebnis", group.summary.expectancy), y: .value("Emotion", group.key))
                .foregroundStyle(Color.pnl(group.summary.expectancy))
                .cornerRadius(4)
                .annotation(position: group.summary.expectancy >= 0 ? .trailing : .leading, spacing: 6) {
                    Text("\(group.summary.tradeCount)×").font(.caption2).foregroundStyle(.secondary)
                }
        }
        .chartXAxis {
            AxisMarks(values: .automatic(desiredCount: 4)) {
                AxisGridLine().foregroundStyle(.quaternary)
                AxisValueLabel(format: .currency(code: settings.currencyCode).precision(.fractionLength(0)))
            }
        }
        .frame(height: CGFloat(max(groups.count, 2)) * 40 + 30)
    }
}
