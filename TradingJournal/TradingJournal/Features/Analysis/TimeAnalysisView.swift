import SwiftUI
import Charts
import JournalCore

struct TimeAnalysisView: View {
    @Environment(SettingsStore.self) private var settings
    let records: [TradeRecord]

    private struct Bar: Identifiable {
        let id: Int
        let label: String
        let summary: PerformanceSummary
    }

    var body: some View {
        let weekdays = TimeAnalysis.byWeekday(records).map { Bar(id: $0.weekday, label: Format.shortWeekday($0.weekday), summary: $0.summary) }
        let hours = TimeAnalysis.byHour(records).map { Bar(id: $0.hour, label: Format.hour($0.hour), summary: $0.summary) }
        let durations = TimeAnalysis.byHoldingDuration(records).map { Bar(id: $0.bucket.rawValue, label: $0.bucket.title, summary: $0.summary) }

        barCard(title: "Wochentag", subtitle: "Summe Ergebnis je Einstiegstag", systemImage: "calendar", bars: weekdays)
        barCard(title: "Uhrzeit", subtitle: "Summe Ergebnis je Einstiegsstunde", systemImage: "clock", bars: hours)
        barCard(title: "Haltedauer", subtitle: "Summe Ergebnis je Haltedauer", systemImage: "hourglass", bars: durations)
    }

    private func barCard(title: LocalizedStringKey, subtitle: LocalizedStringKey, systemImage: String, bars: [Bar]) -> some View {
        TitledCard(title, subtitle: subtitle, systemImage: systemImage) {
            if bars.isEmpty {
                Text("Keine Daten.").font(.explanation).foregroundStyle(.secondary)
            } else {
                VStack(alignment: .leading, spacing: Theme.Spacing.m) {
                    Chart(bars) { bar in
                        BarMark(
                            x: .value("Klasse", bar.label),
                            y: .value("Ergebnis", bar.summary.totalPnL)
                        )
                        .foregroundStyle(Color.pnl(bar.summary.totalPnL))
                        .cornerRadius(4)
                    }
                    .chartXScale(domain: bars.map(\.label))
                    .chartYAxis {
                        AxisMarks(position: .trailing, values: .automatic(desiredCount: 4)) {
                            AxisGridLine().foregroundStyle(.quaternary)
                            AxisValueLabel(format: .currency(code: settings.currencyCode).precision(.fractionLength(0)))
                        }
                    }
                    .chartXAxis {
                        AxisMarks { AxisValueLabel().font(.caption) }
                    }
                    .frame(height: 180)

                    if let insight = insight(for: bars) {
                        Text(insight).font(.footnote).foregroundStyle(.secondary).fixedSize(horizontal: false, vertical: true)
                    }

                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: Theme.Spacing.s) {
                            ForEach(bars) { bar in
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(bar.label).font(.caption.weight(.medium))
                                    Text("\(bar.summary.tradeCount) Trades · WR \(Format.percent(bar.summary.winRate))")
                                        .font(.caption2).foregroundStyle(.secondary)
                                    RText(value: bar.summary.averageR, font: .caption)
                                }
                                .padding(8)
                                .background(RoundedRectangle(cornerRadius: Theme.Radius.chip, style: .continuous).fill(Color.subtleFill))
                            }
                        }
                    }
                }
            }
        }
    }

    private func insight(for bars: [Bar]) -> String? {
        let relevant = bars.filter { $0.summary.tradeCount >= 3 }
        guard let best = relevant.max(by: { $0.summary.expectancy < $1.summary.expectancy }),
              let worst = relevant.min(by: { $0.summary.expectancy < $1.summary.expectancy }),
              best.id != worst.id else { return nil }
        let bestValue = Format.currency(best.summary.expectancy, code: settings.currencyCode, signed: true)
        let worstValue = Format.currency(worst.summary.expectancy, code: settings.currencyCode, signed: true)
        return String(localized: "Am stärksten: \(best.label) (Ø \(bestValue) pro Trade). Am schwächsten: \(worst.label) (Ø \(worstValue)).")
    }
}

extension HoldingDurationBucket {
    var title: String {
        switch self {
        case .underFiveMinutes: String(localized: "< 5 min")
        case .fiveToThirtyMinutes: String(localized: "5–30 min")
        case .thirtyMinutesToTwoHours: String(localized: "30 min – 2 h")
        case .twoToEightHours: String(localized: "2–8 h")
        case .intraday: String(localized: "8–24 h")
        case .multiDay: String(localized: "Mehrtägig")
        }
    }
}
