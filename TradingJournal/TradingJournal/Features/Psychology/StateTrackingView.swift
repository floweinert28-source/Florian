import SwiftUI
import SwiftData
import Charts
import JournalCore

/// Schlaf, Stress und Stimmung im Zusammenhang mit der Performance.
struct StateTrackingView: View {
    @Environment(AppModel.self) private var appModel
    @Environment(SettingsStore.self) private var settings
    @Environment(\.modelContext) private var modelContext
    let records: [TradeRecord]
    let checkIns: [DailyCheckIn]
    let snapshot: JournalSnapshot

    var body: some View {
        let report = StateAnalysis.report(trades: records, checkIns: snapshot.checkIns)
        todayCard
        if report.matchedDays == 0 {
            TitledCard("Zustand und Ergebnis", systemImage: "heart.text.square") {
                Text("Sobald an Handelstagen Check-ins vorliegen, siehst du hier, wie Schlaf, Stress und Stimmung mit deinem Ergebnis zusammenhängen.")
                    .font(.explanation).foregroundStyle(.secondary)
            }
        } else {
            correlationSummary(report)
            AdaptiveColumns {
                bucketCard(title: "Schlaf", systemImage: "bed.double", buckets: report.bySleep, label: sleepLabel)
                bucketCard(title: "Stimmung", systemImage: "face.smiling", buckets: report.byMood, label: { "\($0.sortKey)/5" })
            }
            bucketCard(title: "Stress", systemImage: "bolt.heart", buckets: report.byStress, label: { "\($0.sortKey)/5" })
        }
        historyCard
    }

    // MARK: - Heute

    private var todayCard: some View {
        let today = checkIns.first { Calendar.current.isDateInToday($0.date) }
        return TitledCard("Heute", systemImage: "sun.horizon") {
            Button(today == nil ? "Check-in" : "Bearbeiten") {
                appModel.present(.checkIn(Date()))
            }
            .buttonStyle(.borderedProminent)
            .controlSize(.small)
        } content: {
            if let today {
                HStack(spacing: Theme.Spacing.xl) {
                    InlineStat(label: "Schlaf", value: "\(Format.number(today.sleepHours, digits: 1)) h")
                    InlineStat(label: "Stress", value: "\(today.stressLevel)/5", tint: today.stressLevel >= 4 ? .loss : nil)
                    InlineStat(label: "Stimmung", value: "\(today.mood)/5", tint: today.mood <= 2 ? .loss : nil)
                    if !today.note.isEmpty {
                        Text(today.note).font(.footnote).foregroundStyle(.secondary).lineLimit(2)
                    }
                    Spacer(minLength: 0)
                }
            } else {
                Text("Noch kein Check-in für heute. Zehn Sekunden, die später viel erklären.")
                    .font(.explanation).foregroundStyle(.secondary)
            }
        }
    }

    // MARK: - Korrelation

    private func correlationSummary(_ report: StateCorrelationReport) -> some View {
        TitledCard("Zusammenhang mit dem Tagesergebnis", subtitle: "\(report.matchedDays) Handelstage mit Check-in", systemImage: "heart.text.square") {
            VStack(alignment: .leading, spacing: Theme.Spacing.m) {
                correlationRow(title: String(localized: "Schlaf"), value: report.sleepCorrelation, positiveIsGood: true)
                correlationRow(title: String(localized: "Stimmung"), value: report.moodCorrelation, positiveIsGood: true)
                correlationRow(title: String(localized: "Stress"), value: report.stressCorrelation, positiveIsGood: false)
                Text("Korrelation von −1 bis +1: Werte nahe 0 bedeuten keinen erkennbaren Zusammenhang, ab etwa ±0,3 wird es interessant. Korrelation ist keine Ursache – aber ein guter Hinweis, worauf du achten solltest.")
                    .font(.caption).foregroundStyle(.tertiary).fixedSize(horizontal: false, vertical: true)
            }
        }
    }

    private func correlationRow(title: String, value: Double?, positiveIsGood: Bool) -> some View {
        HStack {
            Text(title).font(.subheadline)
            Spacer()
            if let value {
                let strength = abs(value)
                let helpful = (value > 0) == positiveIsGood
                Text(interpretation(strength: strength, helpful: helpful, title: title))
                    .font(.caption).foregroundStyle(.secondary)
                Text(value.formatted(.number.precision(.fractionLength(2)).sign(strategy: .always(includingZero: false))))
                    .font(.subheadline.weight(.semibold)).numeric()
                    .foregroundStyle(strength < 0.15 ? Color.secondary : (helpful ? Color.profit : Color.loss))
                    .frame(width: 60, alignment: .trailing)
            } else {
                Text("zu wenige Tage").font(.caption).foregroundStyle(.tertiary)
            }
        }
    }

    private func interpretation(strength: Double, helpful: Bool, title: String) -> String {
        if strength < 0.15 { return String(localized: "kein Zusammenhang") }
        if strength < 0.3 { return helpful ? String(localized: "leicht positiv") : String(localized: "leicht negativ") }
        return helpful ? String(localized: "deutlich positiv") : String(localized: "deutlich negativ")
    }

    private func bucketCard(title: LocalizedStringKey, systemImage: String, buckets: [StateBucketPerformance], label: @escaping (StateBucketPerformance) -> String) -> some View {
        TitledCard(title, subtitle: "Ø Ergebnis pro Trade", systemImage: systemImage) {
            if buckets.isEmpty {
                Text("Keine Daten.").font(.explanation).foregroundStyle(.secondary)
            } else {
                Chart(buckets) { bucket in
                    BarMark(x: .value("Klasse", label(bucket)), y: .value("Ø Ergebnis", bucket.summary.expectancy))
                        .foregroundStyle(Color.pnl(bucket.summary.expectancy))
                        .cornerRadius(4)
                        .annotation(position: .top, spacing: 3) {
                            Text("\(bucket.dayCount) T").font(.caption2).foregroundStyle(.tertiary)
                        }
                }
                .chartXScale(domain: buckets.map(label))
                .chartYAxis {
                    AxisMarks(position: .trailing, values: .automatic(desiredCount: 3)) {
                        AxisGridLine().foregroundStyle(.quaternary)
                        AxisValueLabel(format: .currency(code: settings.currencyCode).precision(.fractionLength(0)))
                    }
                }
                .frame(height: 150)
            }
        }
    }

    private func sleepLabel(_ bucket: StateBucketPerformance) -> String {
        switch SleepBucket(rawValue: bucket.sortKey) {
        case .underSix: String(localized: "< 6 h")
        case .sixToSeven: String(localized: "6–7 h")
        case .sevenToEight: String(localized: "7–8 h")
        case .overEight: String(localized: "> 8 h")
        case nil: bucket.key
        }
    }

    // MARK: - Verlauf

    private var historyCard: some View {
        TitledCard("Letzte Check-ins", systemImage: "calendar") {
            let recent = Array(checkIns.prefix(10))
            if recent.isEmpty {
                Text("Noch keine Check-ins.").font(.explanation).foregroundStyle(.secondary)
            } else {
                VStack(spacing: 0) {
                    ForEach(recent) { checkIn in
                        HStack {
                            Text(Format.shortDate(checkIn.date)).font(.subheadline).frame(width: 64, alignment: .leading)
                            Label("\(Format.number(checkIn.sleepHours, digits: 1)) h", systemImage: "bed.double").font(.caption)
                            Spacer()
                            LevelDots(level: checkIn.stressLevel, tint: .orange, systemImage: "bolt.heart")
                            LevelDots(level: checkIn.mood, tint: .accentColor, systemImage: "face.smiling")
                        }
                        .foregroundStyle(.secondary)
                        .padding(.vertical, 8)
                        .contentShape(Rectangle())
                        .contextMenu {
                            Button("Bearbeiten", systemImage: "pencil") { appModel.present(.checkIn(checkIn.date)) }
                            Button("Löschen", systemImage: "trash", role: .destructive) {
                                modelContext.delete(checkIn)
                                try? modelContext.save()
                            }
                        }
                        if checkIn.id != recent.last?.id { Divider() }
                    }
                }
            }
        }
    }
}

/// Fünf Punkte für Stufen von 1 bis 5.
private struct LevelDots: View {
    let level: Int
    let tint: Color
    let systemImage: String

    var body: some View {
        HStack(spacing: 3) {
            Image(systemName: systemImage).font(.caption2)
            ForEach(1...5, id: \.self) { index in
                Circle()
                    .fill(index <= level ? tint : Color.subtleFill)
                    .frame(width: 6, height: 6)
            }
        }
        .frame(width: 66, alignment: .leading)
    }
}

// MARK: - Check-in-Sheet

struct CheckInSheet: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    @Environment(AppModel.self) private var appModel
    @Query private var checkIns: [DailyCheckIn]
    @Query private var regimeEntries: [MarketRegimeEntry]

    let date: Date
    @State private var sleepHours: Double = 7
    @State private var stress: Int = 2
    @State private var mood: Int = 3
    @State private var note: String = ""
    @State private var trend: TrendRegime?
    @State private var volatility: VolatilityRegime?
    @State private var loaded = false

    private var existing: DailyCheckIn? {
        checkIns.first { Calendar.current.isDate($0.date, inSameDayAs: date) }
    }

    private var existingRegime: MarketRegimeEntry? {
        regimeEntries.first { Calendar.current.isDate($0.date, inSameDayAs: date) }
    }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    HStack {
                        Label("Schlaf", systemImage: "bed.double")
                        Spacer()
                        Text("\(Format.number(sleepHours, digits: 1)) h").numeric().foregroundStyle(.secondary)
                    }
                    Slider(value: $sleepHours, in: 3...11, step: 0.5)
                    levelPicker(title: "Stress", systemImage: "bolt.heart", selection: $stress, low: "entspannt", high: "sehr gestresst")
                    levelPicker(title: "Stimmung", systemImage: "face.smiling", selection: $mood, low: "schlecht", high: "sehr gut")
                } header: {
                    Text(date.formatted(.dateTime.weekday(.wide).day().month(.wide)))
                }
                Section("Markt-Regime (optional)") {
                    Picker("Trend", selection: $trend) {
                        Text("Nicht eingestuft").tag(TrendRegime?.none)
                        ForEach(TrendRegime.allCases, id: \.self) { Text($0.title).tag(TrendRegime?.some($0)) }
                    }
                    Picker("Volatilität", selection: $volatility) {
                        Text("Nicht eingestuft").tag(VolatilityRegime?.none)
                        ForEach(VolatilityRegime.allCases, id: \.self) { Text($0.title).tag(VolatilityRegime?.some($0)) }
                    }
                }
                Section("Notiz") {
                    TextField("Wie fühlst du dich? Was beschäftigt dich?", text: $note, axis: .vertical)
                        .lineLimit(2...5)
                }
            }
            .formStyle(.grouped)
            .navigationTitle("Tages-Check-in")
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Abbrechen") { dismiss() }.keyboardShortcut(.cancelAction)
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Sichern") { save() }.keyboardShortcut(.defaultAction)
                }
            }
        }
        .sheetFrame(minWidth: 460, minHeight: 520)
        .onAppear(perform: loadExisting)
    }

    private func levelPicker(title: LocalizedStringKey, systemImage: String, selection: Binding<Int>, low: LocalizedStringKey, high: LocalizedStringKey) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Label(title, systemImage: systemImage)
            Picker(title, selection: selection) {
                ForEach(1...5, id: \.self) { Text("\($0)").tag($0) }
            }
            .pickerStyle(.segmented)
            .labelsHidden()
            HStack {
                Text(low)
                Spacer()
                Text(high)
            }
            .font(.caption2)
            .foregroundStyle(.tertiary)
        }
        .padding(.vertical, 2)
    }

    private func loadExisting() {
        guard !loaded else { return }
        loaded = true
        if let existing {
            sleepHours = existing.sleepHours
            stress = existing.stressLevel
            mood = existing.mood
            note = existing.note
        }
        if let existingRegime {
            trend = existingRegime.regime.trend
            volatility = existingRegime.regime.volatility
        }
    }

    private func save() {
        if let existing {
            existing.sleepHours = sleepHours
            existing.stressLevel = stress
            existing.mood = mood
            existing.note = note
        } else {
            modelContext.insert(DailyCheckIn(date: date, sleepHours: sleepHours, stressLevel: stress, mood: mood, note: note))
        }
        if trend != nil || volatility != nil {
            let regime = MarketRegime(trend: trend ?? .trending, volatility: volatility ?? .normal)
            if let existingRegime {
                existingRegime.regime = regime
                existingRegime.source = .manual
            } else {
                modelContext.insert(MarketRegimeEntry(date: date, regime: regime, source: .manual))
            }
        }
        try? modelContext.save()
        appModel.didSave()
        dismiss()
    }
}
