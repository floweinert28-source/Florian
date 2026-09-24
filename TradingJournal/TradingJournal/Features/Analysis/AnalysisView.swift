import SwiftUI
import SwiftData
import JournalCore

struct AnalysisView: View {
    enum Tab: String, CaseIterable, Identifiable {
        case setups, times, regime, edge, monteCarlo
        var id: String { rawValue }

        var title: String {
            switch self {
            case .setups: String(localized: "Setups")
            case .times: String(localized: "Zeiten")
            case .regime: String(localized: "Regime")
            case .edge: String(localized: "Edge-Check")
            case .monteCarlo: String(localized: "Monte Carlo")
            }
        }
    }

    @Environment(AppModel.self) private var appModel
    @Query(sort: \Trade.entryDate) private var trades: [Trade]
    @Query(sort: \MarketRegimeEntry.date) private var regimes: [MarketRegimeEntry]
    @State private var tab: Tab = .setups
    @State private var period: AnalysisPeriod = .all

    var body: some View {
        let snapshot = JournalSnapshot(trades: trades, regimes: regimes)
        let records = snapshot.records(in: period)
        Screen {
            SegmentPicker(options: Tab.allCases, selection: $tab, title: \.title)
            if records.filter(\.isClosed).isEmpty {
                EmptyStateView(
                    title: "Nichts auszuwerten",
                    message: "Im gewählten Zeitraum gibt es keine abgeschlossenen Trades. Wähle einen längeren Zeitraum oder erfasse Trades.",
                    systemImage: "chart.bar.xaxis",
                    actionTitle: "Zeitraum: Gesamt"
                ) {
                    period = .all
                }
            } else {
                switch tab {
                case .setups: SetupAnalysisView(records: records)
                case .times: TimeAnalysisView(records: records)
                case .regime: RegimeAnalysisView(records: records, allRecords: snapshot.records)
                case .edge: EdgeCheckView(records: records)
                case .monteCarlo: MonteCarloView(records: records)
                }
            }
        }
        .navigationTitle("Analyse")
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                PeriodMenu(period: $period)
            }
        }
        .animation(Theme.spring, value: tab)
        .animation(Theme.spring, value: period)
    }
}

/// Kompakte Liste von Gruppen-Kennzahlen (Setups, Strategien, Marktphasen …).
struct GroupPerformanceList: View {
    @Environment(SettingsStore.self) private var settings
    let groups: [GroupPerformance]
    var emptyText: LocalizedStringKey = "Keine Daten."

    var body: some View {
        if groups.isEmpty {
            Text(emptyText).font(.explanation).foregroundStyle(.secondary)
        } else {
            VStack(spacing: 0) {
                ForEach(groups) { group in
                    HStack(alignment: .center, spacing: Theme.Spacing.m) {
                        VStack(alignment: .leading, spacing: 3) {
                            Text(group.key).font(.subheadline.weight(.semibold))
                            Text(detailLine(group.summary))
                                .font(.caption)
                                .foregroundStyle(.secondary)
                                .numeric()
                        }
                        Spacer()
                        VStack(alignment: .trailing, spacing: 3) {
                            PnLText(value: group.summary.expectancy, font: .metricSmall)
                            HStack(spacing: 4) {
                                Text("Expectancy").font(.caption2).foregroundStyle(.tertiary)
                                RText(value: group.summary.averageR, font: .caption)
                            }
                        }
                    }
                    .padding(.vertical, 10)
                    if group.id != groups.last?.id { Divider() }
                }
            }
        }
    }

    private func detailLine(_ s: PerformanceSummary) -> String {
        var parts = [
            String(localized: "\(s.tradeCount) Trades"),
            String(localized: "WR \(Format.percent(s.winRate))"),
            String(localized: "PF \(Format.factor(s.profitFactor))"),
        ]
        parts.append(Format.currency(s.totalPnL, code: settings.currencyCode, signed: true, compact: true))
        return parts.joined(separator: " · ")
    }
}
