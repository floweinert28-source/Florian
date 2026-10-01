import SwiftUI
import Charts
import JournalCore

struct SetupAnalysisView: View {
    @Environment(SettingsStore.self) private var settings
    let records: [TradeRecord]

    var body: some View {
        let setups = GroupedPerformance.bySetup(records)
        let strategies = GroupedPerformance.byStrategy(records)
        let phases = GroupedPerformance.byMarketPhase(records)
        let untagged = records.filter { $0.isClosed && ($0.setup ?? "").isEmpty }.count

        TitledCard("Expectancy je Setup", subtitle: "Ø Ergebnis pro Trade", systemImage: "square.stack.3d.up") {
            if setups.isEmpty {
                Text("Vergib Setups beim Erfassen, um Muster zu erkennen.").font(.explanation).foregroundStyle(.secondary)
            } else {
                Chart(setups) { group in
                    BarMark(
                        x: .value("Expectancy", group.summary.expectancy),
                        y: .value("Setup", group.key)
                    )
                    .foregroundStyle(Color.pnl(group.summary.expectancy))
                    .cornerRadius(4)
                    .annotation(position: group.summary.expectancy >= 0 ? .trailing : .leading, spacing: 6) {
                        Text("\(group.summary.tradeCount)×")
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }
                }
                .chartXAxis {
                    AxisMarks(values: .automatic(desiredCount: 4)) {
                        AxisGridLine().foregroundStyle(.quaternary)
                        AxisValueLabel(format: .currency(code: settings.currencyCode).precision(.fractionLength(0)))
                    }
                }
                .chartYAxis {
                    AxisMarks { AxisValueLabel().font(.subheadline) }
                }
                .frame(height: CGFloat(max(setups.count, 2)) * 40 + 30)
                if untagged > 0 {
                    Text("\(untagged) Trades ohne Setup sind hier nicht enthalten.")
                        .font(.caption).foregroundStyle(.tertiary)
                }
            }
        }

        TitledCard("Setups im Detail", systemImage: "list.bullet") {
            GroupPerformanceList(groups: setups, emptyText: "Noch keine Setups vergeben.")
        }

        AdaptiveColumns {
            TitledCard("Strategien", systemImage: "point.topleft.down.to.point.bottomright.curvepath") {
                GroupPerformanceList(groups: strategies, emptyText: "Noch keine Strategien vergeben.")
            }
            TitledCard("Marktphasen", systemImage: "clock") {
                GroupPerformanceList(groups: phases, emptyText: "Noch keine Marktphasen vergeben.")
            }
        }
    }
}
