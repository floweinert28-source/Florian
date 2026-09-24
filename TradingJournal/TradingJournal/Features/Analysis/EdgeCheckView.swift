import SwiftUI
import Charts
import JournalCore

struct EdgeCheckView: View {
    @Environment(SettingsStore.self) private var settings
    let records: [TradeRecord]
    @State private var selectedSetup: String = ""

    private var setups: [String] {
        Array(Set(records.compactMap(\.setup).filter { !$0.isEmpty })).sorted()
    }

    private var selectedRecords: [TradeRecord] {
        selectedSetup.isEmpty ? records : records.filter { $0.setup == selectedSetup }
    }

    var body: some View {
        let assessment = EdgeCheck.assess(selectedRecords)

        Card(padding: Theme.Spacing.m) {
            Picker("Setup", selection: $selectedSetup) {
                Text("Alle Trades").tag("")
                ForEach(setups, id: \.self) { Text($0).tag($0) }
            }
            .pickerStyle(.menu)
            .labelsHidden()
        }

        VerdictCard(assessment: assessment)

        TitledCard("Rollierende Expectancy", subtitle: "Ø der jeweils letzten \(assessment.rollingWindow) Trades", systemImage: "waveform.path") {
            if assessment.rolling.count < 2 {
                Text("Ab \(assessment.rollingWindow + 1) Trades zeigt die Kurve, ob dein Vorteil stabil bleibt.")
                    .font(.explanation).foregroundStyle(.secondary)
            } else {
                VStack(alignment: .leading, spacing: Theme.Spacing.m) {
                    if assessment.isDeteriorating {
                        BannerView(
                            style: .warning,
                            title: String(localized: "Nachlassender Edge"),
                            message: String(localized: "Die letzten \(assessment.rollingWindow) Trades liegen mit Ø \(format(assessment.recentMean ?? 0, assessment.metric)) deutlich unter deinem Gesamtschnitt von \(format(assessment.mean, assessment.metric)). Prüfe, ob sich der Markt oder deine Ausführung verändert hat.")
                        )
                    }
                    Chart {
                        ForEach(assessment.rolling) { point in
                            AreaMark(x: .value("Trade", point.index), y: .value("Ø", point.value))
                                .foregroundStyle(LinearGradient(colors: [Color.accentColor.opacity(0.22), Color.accentColor.opacity(0.02)], startPoint: .top, endPoint: .bottom))
                                .interpolationMethod(.monotone)
                            LineMark(x: .value("Trade", point.index), y: .value("Ø", point.value))
                                .foregroundStyle(Color.accentColor)
                                .lineStyle(StrokeStyle(lineWidth: 2))
                                .interpolationMethod(.monotone)
                        }
                        RuleMark(y: .value("Null", 0))
                            .foregroundStyle(.secondary)
                            .lineStyle(StrokeStyle(lineWidth: 1, dash: [3, 3]))
                        RuleMark(y: .value("Gesamt", assessment.mean))
                            .foregroundStyle(Color.pnl(assessment.mean).opacity(0.6))
                            .lineStyle(StrokeStyle(lineWidth: 1))
                            .annotation(position: .top, alignment: .trailing) {
                                Text("Gesamt \(format(assessment.mean, assessment.metric))")
                                    .font(.caption2).foregroundStyle(.secondary)
                            }
                    }
                    .chartXAxis {
                        AxisMarks(values: .automatic(desiredCount: 5)) {
                            AxisGridLine().foregroundStyle(.quaternary)
                            AxisValueLabel()
                        }
                    }
                    .chartYAxis {
                        AxisMarks(position: .trailing, values: .automatic(desiredCount: 4)) {
                            AxisGridLine().foregroundStyle(.quaternary)
                            AxisValueLabel()
                        }
                    }
                    .frame(height: 200)
                }
            }
        }

        if setups.count > 1 {
            TitledCard("Alle Setups im Überblick", systemImage: "list.bullet.rectangle") {
                VStack(spacing: 0) {
                    ForEach(setups, id: \.self) { setup in
                        let a = EdgeCheck.assess(records.filter { $0.setup == setup })
                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(setup).font(.subheadline.weight(.semibold))
                                Text("\(a.sampleSize) Trades · Ø \(format(a.mean, a.metric)) · KI \(format(a.confidenceLow, a.metric)) bis \(format(a.confidenceHigh, a.metric))")
                                    .font(.caption).foregroundStyle(.secondary).numeric()
                            }
                            Spacer()
                            VerdictBadge(verdict: a.verdict, deteriorating: a.isDeteriorating)
                        }
                        .padding(.vertical, 10)
                        .contentShape(Rectangle())
                        .onTapGesture { withAnimation(Theme.spring) { selectedSetup = setup } }
                        if setup != setups.last { Divider() }
                    }
                }
            }
        }
    }

    private func format(_ value: Double, _ metric: EdgeMetric) -> String {
        switch metric {
        case .rMultiple: Format.r(value)
        case .pnl: Format.currency(value, code: settings.currencyCode, signed: true)
        }
    }
}

// MARK: - Urteil

private struct VerdictCard: View {
    @Environment(SettingsStore.self) private var settings
    let assessment: EdgeAssessment

    var body: some View {
        TitledCard("Ist der Edge belastbar?", subtitle: "95 %-Konfidenzintervall der Expectancy", systemImage: "checkmark.shield") {
            VerdictBadge(verdict: assessment.verdict, deteriorating: assessment.isDeteriorating)
        } content: {
            VStack(alignment: .leading, spacing: Theme.Spacing.l) {
                HStack(alignment: .firstTextBaseline, spacing: Theme.Spacing.m) {
                    Text(format(assessment.mean))
                        .font(.metricHero)
                        .numeric()
                        .foregroundStyle(Color.pnl(assessment.mean))
                        .contentTransition(.numericText())
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Ø pro Trade").font(.caption).foregroundStyle(.secondary)
                        Text("aus \(assessment.sampleSize) Trades").font(.caption).foregroundStyle(.secondary)
                    }
                }

                ConfidenceIntervalBar(low: assessment.confidenceLow, high: assessment.confidenceHigh, mean: assessment.mean) { format($0) }

                Text(explanation)
                    .font(.explanation)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)

                LazyVGrid(columns: [GridItem(.adaptive(minimum: 130), spacing: Theme.Spacing.m)], spacing: Theme.Spacing.m) {
                    InlineStat(label: "Untergrenze", value: format(assessment.confidenceLow), tint: Color.pnl(assessment.confidenceLow))
                    InlineStat(label: "Obergrenze", value: format(assessment.confidenceHigh), tint: Color.pnl(assessment.confidenceHigh))
                    InlineStat(label: "Streuung (σ)", value: format(assessment.standardDeviation, signed: false))
                    InlineStat(label: "Standardfehler", value: format(assessment.standardError, signed: false))
                    if let required = assessment.requiredSampleSize {
                        InlineStat(label: "Nötige Stichprobe", value: "≈ \(required) Trades")
                    }
                }
            }
        }
    }

    private func format(_ value: Double, signed: Bool = true) -> String {
        switch assessment.metric {
        case .rMultiple: Format.r(value, signed: signed)
        case .pnl: Format.currency(value, code: settings.currencyCode, signed: signed)
        }
    }

    private var explanation: String {
        let n = assessment.sampleSize
        switch assessment.verdict {
        case .insufficientData:
            return String(localized: "Mit \(n) Trades ist die Stichprobe zu klein für eine belastbare Aussage. Das Intervall zeigt, in welchem Bereich der wahre Durchschnitt mit 95 % Wahrscheinlichkeit liegt – je mehr Trades, desto enger wird es.")
        case .unproven:
            if let required = assessment.requiredSampleSize, required > n {
                return String(localized: "Das Intervall schließt 0 ein: Es ist statistisch noch nicht sicher, ob dieser Edge real ist oder Zufall. Bei gleicher Streuung bräuchtest du etwa \(required) Trades, damit das Intervall die Null ausschließt.")
            }
            return String(localized: "Das Intervall schließt 0 ein: Es ist statistisch noch nicht sicher, ob dieser Edge real ist oder Zufall. Die Streuung der Ergebnisse ist im Verhältnis zum Durchschnitt hoch.")
        case .positive:
            return String(localized: "Das gesamte Intervall liegt über 0. Mit 95 % Sicherheit ist der wahre Durchschnitt positiv – dieser Edge ist mit \(n) Trades statistisch belastbar.")
        case .negative:
            return String(localized: "Das gesamte Intervall liegt unter 0. Dieses Setup verliert mit 95 % Sicherheit Geld. Aussetzen oder grundlegend überarbeiten.")
        }
    }
}

struct VerdictBadge: View {
    let verdict: EdgeVerdict
    let deteriorating: Bool

    var body: some View {
        TagChip(text: title, tint: tint, systemImage: systemImage)
    }

    private var title: String {
        if deteriorating { return String(localized: "Lässt nach") }
        switch verdict {
        case .insufficientData: return String(localized: "Zu wenige Trades")
        case .unproven: return String(localized: "Nicht belegt")
        case .positive: return String(localized: "Belastbar")
        case .negative: return String(localized: "Negativ")
        }
    }

    private var tint: Color {
        if deteriorating { return .orange }
        switch verdict {
        case .insufficientData: return .secondary
        case .unproven: return .orange
        case .positive: return .profit
        case .negative: return .loss
        }
    }

    private var systemImage: String {
        if deteriorating { return "arrow.down.right" }
        switch verdict {
        case .insufficientData: return "hourglass"
        case .unproven: return "questionmark.circle"
        case .positive: return "checkmark.seal.fill"
        case .negative: return "xmark.octagon.fill"
        }
    }
}

/// Konfidenzintervall als Balken mit Nullmarke.
private struct ConfidenceIntervalBar: View {
    let low: Double
    let high: Double
    let mean: Double
    let format: (Double) -> String

    var body: some View {
        GeometryReader { proxy in
            let span = max(high, 0) - min(low, 0)
            let scale = span > 0 ? proxy.size.width / span : 0
            let origin = -min(low, 0) * scale
            ZStack(alignment: .leading) {
                Capsule().fill(Color.subtleFill).frame(height: 8)
                Capsule()
                    .fill(low > 0 ? Color.profit : (high < 0 ? Color.loss : Color.orange))
                    .frame(width: max((high - low) * scale, 4), height: 8)
                    .offset(x: origin + low * scale)
                Rectangle()
                    .fill(Color.primary.opacity(0.5))
                    .frame(width: 1.5, height: 18)
                    .offset(x: origin)
                Circle()
                    .fill(Color.primary)
                    .frame(width: 10, height: 10)
                    .offset(x: origin + mean * scale - 5)
            }
            .frame(height: 18)
        }
        .frame(height: 18)
        .overlay(alignment: .bottom) {
            HStack {
                Text(format(low)).font(.caption2).foregroundStyle(.secondary)
                Spacer()
                Text("0").font(.caption2).foregroundStyle(.tertiary)
                Spacer()
                Text(format(high)).font(.caption2).foregroundStyle(.secondary)
            }
            .numeric()
            .offset(y: 18)
        }
        .padding(.bottom, 18)
    }
}
