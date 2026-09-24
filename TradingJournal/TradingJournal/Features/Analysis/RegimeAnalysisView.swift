import SwiftUI
import SwiftData
import JournalCore

struct RegimeAnalysisView: View {
    @Environment(SettingsStore.self) private var settings
    let records: [TradeRecord]
    /// Alle Trades (ohne Zeitraumfilter) für die Pflege der Regimes.
    let allRecords: [TradeRecord]

    var body: some View {
        let report = RegimeAnalysis.report(for: records)

        TitledCard("Ergebnis je Regime", subtitle: "Trend oder Seitwärts × Volatilität", systemImage: "waveform.path.ecg") {
            if report.byRegime.isEmpty {
                Text("Noch keine Trades mit Regime-Einstufung. Pflege die Regimes unten oder im Tages-Check-in.")
                    .font(.explanation).foregroundStyle(.secondary)
            } else {
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 160), spacing: Theme.Spacing.m)], spacing: Theme.Spacing.m) {
                    ForEach(report.byRegime) { row in
                        VStack(alignment: .leading, spacing: 6) {
                            HStack(spacing: 5) {
                                Image(systemName: row.regime.trend.systemImage).font(.caption.weight(.semibold))
                                Text(row.regime.trend.title).font(.subheadline.weight(.semibold))
                            }
                            Text(row.regime.volatility.title).font(.caption).foregroundStyle(.secondary)
                            PnLText(value: row.summary.expectancy, font: .metricValue)
                            Text("\(row.summary.tradeCount) Trades · WR \(Format.percent(row.summary.winRate))")
                                .font(.caption).foregroundStyle(.secondary)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(Theme.Spacing.m)
                        .background(RoundedRectangle(cornerRadius: Theme.Radius.tile, style: .continuous).fill(Color.subtleFill))
                    }
                }
                if report.untaggedCount > 0 {
                    Text("\(report.untaggedCount) Trades ohne Regime sind nicht enthalten.")
                        .font(.caption).foregroundStyle(.tertiary)
                }
            }
        }

        if !report.setups.isEmpty {
            TitledCard("Welches Setup in welchem Regime", subtitle: "Ø R-Multiple, Farbe nach Ergebnis", systemImage: "tablecells") {
                let regimes = report.byRegime.map(\.regime)
                ScrollView(.horizontal, showsIndicators: false) {
                    Grid(horizontalSpacing: 6, verticalSpacing: 6) {
                        GridRow {
                            Text("").frame(width: 110)
                            ForEach(regimes, id: \.key) { regime in
                                VStack(spacing: 1) {
                                    Text(regime.trend.title).font(.caption2.weight(.semibold))
                                    Text(regime.volatility.shortTitle).font(.caption2).foregroundStyle(.secondary)
                                }
                                .frame(width: 92)
                            }
                        }
                        ForEach(report.setups, id: \.self) { setup in
                            GridRow {
                                Text(setup).font(.caption.weight(.medium)).frame(width: 110, alignment: .leading).lineLimit(1)
                                ForEach(regimes, id: \.key) { regime in
                                    matrixCell(report.cell(setup: setup, regime: regime))
                                }
                            }
                        }
                    }
                }
            }
        }

        RegimeMaintenanceCard(allRecords: allRecords)
    }

    private func matrixCell(_ cell: RegimeCell?) -> some View {
        let value = cell?.summary.averageR
        let intensity = min(abs(value ?? 0) / 1.0, 1)
        let tint = value.map { Color.pnl($0) } ?? Color.secondary
        return VStack(spacing: 2) {
            if let cell {
                RText(value: cell.summary.averageR, font: .caption.weight(.semibold))
                Text("\(cell.summary.tradeCount)×").font(.caption2).foregroundStyle(.secondary)
            } else {
                Text("—").font(.caption).foregroundStyle(.tertiary)
            }
        }
        .frame(width: 92, height: 44)
        .background(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .fill(cell == nil ? Color.subtleFill.opacity(0.5) : tint.opacity(0.10 + 0.25 * intensity))
        )
    }
}

/// Regime-Einstufung der letzten Handelstage pflegen.
private struct RegimeMaintenanceCard: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \MarketRegimeEntry.date, order: .reverse) private var entries: [MarketRegimeEntry]
    let allRecords: [TradeRecord]

    private var recentDays: [Date] {
        let calendar = Calendar.current
        let days = Set(allRecords.map { calendar.startOfDay(for: $0.entryDate) })
        return days.sorted(by: >).prefix(15).map { $0 }
    }

    var body: some View {
        TitledCard("Regime pflegen", subtitle: "Handelstage manuell einstufen – die Automatik folgt später", systemImage: "slider.horizontal.3") {
            let days = recentDays
            if days.isEmpty {
                Text("Sobald Trades vorhanden sind, kannst du hier die Handelstage einstufen.")
                    .font(.explanation).foregroundStyle(.secondary)
            } else {
                VStack(spacing: 0) {
                    ForEach(days, id: \.self) { day in
                        RegimeDayRow(day: day, entry: entries.first { Calendar.current.isDate($0.date, inSameDayAs: day) })
                        if day != days.last { Divider() }
                    }
                }
            }
        }
    }
}

private struct RegimeDayRow: View {
    @Environment(\.modelContext) private var modelContext
    let day: Date
    let entry: MarketRegimeEntry?

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(day.formatted(.dateTime.weekday(.abbreviated).day().month(.abbreviated)))
                    .font(.subheadline.weight(.medium))
                if entry == nil {
                    Text("Nicht eingestuft").font(.caption).foregroundStyle(.tertiary)
                } else if entry?.source == .automatic {
                    Text("Automatisch").font(.caption).foregroundStyle(.tertiary)
                }
            }
            Spacer()
            Picker("Trend", selection: trendBinding) {
                Text("—").tag(TrendRegime?.none)
                ForEach(TrendRegime.allCases, id: \.self) { Text($0.title).tag(TrendRegime?.some($0)) }
            }
            .labelsHidden()
            .frame(maxWidth: 140)
            Picker("Volatilität", selection: volatilityBinding) {
                Text("—").tag(VolatilityRegime?.none)
                ForEach(VolatilityRegime.allCases, id: \.self) { Text($0.shortTitle).tag(VolatilityRegime?.some($0)) }
            }
            .labelsHidden()
            .frame(maxWidth: 120)
        }
        .padding(.vertical, 6)
    }

    private var trendBinding: Binding<TrendRegime?> {
        Binding(
            get: { entry?.regime.trend },
            set: { newValue in update(trend: newValue, volatility: entry?.regime.volatility) }
        )
    }

    private var volatilityBinding: Binding<VolatilityRegime?> {
        Binding(
            get: { entry?.regime.volatility },
            set: { newValue in update(trend: entry?.regime.trend, volatility: newValue) }
        )
    }

    private func update(trend: TrendRegime?, volatility: VolatilityRegime?) {
        let regime = MarketRegime(trend: trend ?? .trending, volatility: volatility ?? .normal)
        if let entry {
            entry.regime = regime
            entry.source = .manual
        } else {
            modelContext.insert(MarketRegimeEntry(date: day, regime: regime, source: .manual))
        }
        try? modelContext.save()
        Haptics.selection()
    }
}
