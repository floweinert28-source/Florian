import SwiftUI
import Charts
import JournalCore

struct MonteCarloView: View {
    @Environment(SettingsStore.self) private var settings
    let records: [TradeRecord]

    @State private var tradesPerRun: Int = 0
    @State private var runs: Int = 2000
    @State private var ruinPercent: Double = 30
    @State private var result: MonteCarloResult?
    @State private var isRunning = false

    private var pnls: [Double] { records.filter(\.isClosed).map(\.netPnL) }

    var body: some View {
        TitledCard("Simulation", subtitle: "Bootstrap aus deinen \(pnls.count) Trade-Ergebnissen", systemImage: "dice") {
            VStack(alignment: .leading, spacing: Theme.Spacing.m) {
                Text("Die Simulation zieht zufällig mit Zurücklegen aus deinen bisherigen Ergebnissen und spielt tausende mögliche Zukunftsverläufe durch. So siehst du, welche Drawdowns bei deinem Handelsstil realistisch sind – nicht nur den einen, den du erlebt hast.")
                    .font(.explanation)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)

                Grid(alignment: .leading, horizontalSpacing: Theme.Spacing.l, verticalSpacing: Theme.Spacing.m) {
                    GridRow {
                        Text("Startkapital").foregroundStyle(.secondary)
                        Text(Format.currency(settings.accountSize, code: settings.currencyCode)).numeric()
                    }
                    GridRow {
                        Text("Trades je Durchlauf").foregroundStyle(.secondary)
                        Stepper(value: $tradesPerRun, in: 10...2000, step: 10) {
                            Text("\(tradesPerRun)").numeric()
                        }
                    }
                    GridRow {
                        Text("Durchläufe").foregroundStyle(.secondary)
                        Picker("Durchläufe", selection: $runs) {
                            Text("1.000").tag(1000)
                            Text("2.000").tag(2000)
                            Text("5.000").tag(5000)
                        }
                        .pickerStyle(.segmented)
                        .labelsHidden()
                        .frame(maxWidth: 260)
                    }
                    GridRow {
                        Text("Ruin ab Drawdown").foregroundStyle(.secondary)
                        HStack {
                            Slider(value: $ruinPercent, in: 10...60, step: 5)
                                .frame(maxWidth: 200)
                            Text(Format.percent(ruinPercent / 100)).numeric().frame(width: 44, alignment: .trailing)
                        }
                    }
                }
                .font(.subheadline)

                Button {
                    runSimulation()
                } label: {
                    if isRunning {
                        ProgressView().controlSize(.small)
                    } else {
                        Label(result == nil ? "Simulation starten" : "Erneut simulieren", systemImage: "play.fill")
                    }
                }
                .buttonStyle(.borderedProminent)
                .disabled(pnls.count < 10 || isRunning)
                .keyboardShortcut("r", modifiers: .command)

                if pnls.count < 10 {
                    Text("Mindestens 10 abgeschlossene Trades werden benötigt.")
                        .font(.caption).foregroundStyle(.tertiary)
                }
            }
        }
        .onAppear {
            if tradesPerRun == 0 { tradesPerRun = max(10, min(pnls.count, 500)) }
            ruinPercent = settings.ruinDrawdownPercent
        }

        if let result {
            resultCards(result)
        }
    }

    @ViewBuilder
    private func resultCards(_ result: MonteCarloResult) -> some View {
        AdaptiveColumns {
            ruinCard(result)
            drawdownCard(result)
        }
        curvesCard(result)
        AdaptiveColumns {
            finalEquityCard(result)
            histogramCard(result)
        }
    }

    private func valueRow(_ label: LocalizedStringKey, _ value: String, tint: Color? = nil, secondary: String? = nil) -> some View {
        LabeledValueRow(label: label, value: value, tint: tint, secondaryValue: secondary)
    }

    private func ruinCard(_ result: MonteCarloResult) -> some View {
        TitledCard("Risk of Ruin", subtitle: "Anteil der Verläufe mit mehr als \(Format.percent(ruinPercent / 100)) Drawdown", systemImage: "exclamationmark.shield") {
            VStack(alignment: .leading, spacing: 6) {
                Text(Format.percent(result.riskOfRuin, digits: 1))
                    .font(.metricHero)
                    .numeric()
                    .foregroundStyle(ruinTint(result.riskOfRuin))
                    .contentTransition(.numericText())
                Text(ruinText(result.riskOfRuin))
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
    }

    private func drawdownCard(_ result: MonteCarloResult) -> some View {
        let code = settings.currencyCode
        return TitledCard("Drawdown-Bereich", subtitle: "Maximaler Rückgang je Durchlauf", systemImage: "arrow.down.to.line") {
            VStack(alignment: .leading, spacing: Theme.Spacing.s) {
                valueRow("Typisch (Median)", Format.currency(-result.maxDrawdown.p50, code: code, signed: true), tint: .loss, secondary: Format.percent(result.maxDrawdownFraction.p50, digits: 1))
                valueRow("Schlechte Phase (95 %)", Format.currency(-result.maxDrawdown.p95, code: code, signed: true), tint: .loss, secondary: Format.percent(result.maxDrawdownFraction.p95, digits: 1))
                valueRow("Schlimmster Fall", Format.currency(-result.worstDrawdownFraction * result.startingBalance, code: code, signed: true), tint: .loss, secondary: Format.percent(result.worstDrawdownFraction, digits: 1))
                Divider()
                valueRow("Gewinnwahrscheinlichkeit", Format.percent(result.probabilityOfProfit, digits: 0))
            }
        }
    }

    private func curvesCard(_ result: MonteCarloResult) -> some View {
        let code = settings.currencyCode
        let ruinLevel = result.startingBalance * (1 - ruinPercent / 100)
        return TitledCard("Mögliche Kapitalverläufe", subtitle: "\(result.sampleCurves.count) zufällige Durchläufe über \(result.tradesPerRun) Trades", systemImage: "chart.line.uptrend.xyaxis") {
            Chart {
                ForEach(Array(result.sampleCurves.enumerated()), id: \.offset) { index, curve in
                    ForEach(Array(curve.enumerated()), id: \.offset) { step, equity in
                        LineMark(x: .value("Trade", step), y: .value("Kapital", equity), series: .value("Lauf", index))
                            .foregroundStyle(Color.accentColor.opacity(0.35))
                            .lineStyle(StrokeStyle(lineWidth: 1))
                    }
                }
                RuleMark(y: .value("Start", result.startingBalance))
                    .foregroundStyle(.secondary)
                    .lineStyle(StrokeStyle(lineWidth: 1, dash: [3, 3]))
                RuleMark(y: .value("Ruin", ruinLevel))
                    .foregroundStyle(Color.loss.opacity(0.7))
                    .lineStyle(StrokeStyle(lineWidth: 1, dash: [3, 3]))
                    .annotation(position: .bottom, alignment: .leading) {
                        Text("Ruin-Schwelle").font(.caption2).foregroundStyle(Color.loss)
                    }
            }
            .chartYAxis {
                AxisMarks(position: .trailing, values: .automatic(desiredCount: 4)) {
                    AxisGridLine().foregroundStyle(Color.cardBorder)
                    AxisValueLabel(format: .currency(code: code).precision(.fractionLength(0)))
                }
            }
            .chartXAxis {
                AxisMarks(values: .automatic(desiredCount: 5)) { AxisValueLabel() }
            }
            .chartLegend(.hidden)
            .frame(height: 240)
        }
    }

    private func finalEquityCard(_ result: MonteCarloResult) -> some View {
        let code = settings.currencyCode
        let start = result.startingBalance
        return TitledCard("Endkapital", subtitle: "nach \(result.tradesPerRun) Trades", systemImage: "banknote") {
            VStack(alignment: .leading, spacing: Theme.Spacing.s) {
                valueRow("Pessimistisch (5 %)", Format.currency(result.finalEquity.p5, code: code), tint: Color.pnl(result.finalEquity.p5 - start))
                valueRow("Median", Format.currency(result.finalEquity.p50, code: code), tint: Color.pnl(result.finalEquity.p50 - start))
                valueRow("Optimistisch (95 %)", Format.currency(result.finalEquity.p95, code: code), tint: Color.pnl(result.finalEquity.p95 - start))
            }
        }
    }

    private func histogramCard(_ result: MonteCarloResult) -> some View {
        let threshold = ruinPercent / 100
        return TitledCard("Verteilung der Drawdowns", systemImage: "chart.bar") {
            Chart(result.drawdownHistogram) { bin in
                BarMark(
                    x: .value("Drawdown", (bin.lowerBound + bin.upperBound) / 2),
                    y: .value("Durchläufe", bin.count),
                    width: .ratio(0.9)
                )
                .foregroundStyle(bin.lowerBound >= threshold ? Color.loss : Color.accentColor.opacity(0.7))
            }
            .chartXAxis {
                AxisMarks(values: .automatic(desiredCount: 4)) {
                    AxisValueLabel(format: FloatingPointFormatStyle<Double>.Percent().precision(.fractionLength(0)))
                }
            }
            .chartYAxis(.hidden)
            .frame(height: 120)
        }
    }

    private func runSimulation() {
        var configuration = MonteCarloConfiguration(startingBalance: settings.accountSize)
        configuration.runs = runs
        configuration.tradesPerRun = tradesPerRun
        configuration.ruinDrawdownFraction = ruinPercent / 100
        configuration.seed = UInt64(Date().timeIntervalSince1970)
        settings.ruinDrawdownPercent = ruinPercent
        let sample = pnls
        isRunning = true
        Task {
            let simulated = await Task.detached(priority: .userInitiated) {
                MonteCarloSimulator.simulate(pnls: sample, configuration: configuration)
            }.value
            withAnimation(Theme.spring) {
                result = simulated
                isRunning = false
            }
            Haptics.success()
        }
    }

    private func ruinTint(_ value: Double) -> Color {
        switch value {
        case ..<0.02: .profit
        case ..<0.10: Color.warning
        default: .loss
        }
    }

    private func ruinText(_ value: Double) -> String {
        switch value {
        case ..<0.02: String(localized: "Sehr gering. Dein Handelsstil hält auch schlechte Phasen aus.")
        case ..<0.10: String(localized: "Spürbar. Kleinere Positionsgrößen würden das Risiko deutlich senken.")
        default: String(localized: "Hoch. Bei diesem Risiko pro Trade ist ein großer Drawdown wahrscheinlich – Positionsgröße reduzieren.")
        }
    }
}
