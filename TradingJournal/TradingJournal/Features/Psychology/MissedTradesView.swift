import SwiftUI
import SwiftData
import JournalCore

/// Journal der verpassten Trades.
struct MissedTradesView: View {
    @Environment(AppModel.self) private var appModel
    @Environment(SettingsStore.self) private var settings
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \MissedTrade.date, order: .reverse) private var missedTrades: [MissedTrade]
    let period: AnalysisPeriod

    private var filtered: [MissedTrade] {
        guard let interval = period.dateInterval() else { return missedTrades }
        return missedTrades.filter { interval.contains($0.date) }
    }

    var body: some View {
        let items = filtered
        let totalPnL = items.compactMap(\.hypotheticalPnL).reduce(0, +)
        let withResult = items.filter { $0.hypotheticalPnL != nil }
        let winners = withResult.filter { ($0.hypotheticalPnL ?? 0) > 0 }.count

        TitledCard("Verpasstes Ergebnis", subtitle: "Was die gesehenen, aber nicht genommenen Setups gebracht hätten", systemImage: "eye.slash") {
            Button("Erfassen", systemImage: "plus") { appModel.present(.newMissedTrade) }
                .buttonStyle(.bordered)
                .controlSize(.small)
        } content: {
            if items.isEmpty {
                Text("Noch keine verpassten Trades im Zeitraum. Halte fest, welche Setups du gesehen, aber nicht gehandelt hast – und warum. Das schärft die Umsetzung mehr als jede weitere Analyse.")
                    .font(.explanation).foregroundStyle(.secondary)
            } else {
                VStack(alignment: .leading, spacing: Theme.Spacing.m) {
                    PnLText(value: totalPnL, font: .metricHero)
                    HStack(spacing: Theme.Spacing.xl) {
                        InlineStat(label: "Verpasste Trades", value: "\(items.count)")
                        if !withResult.isEmpty {
                            InlineStat(label: "Wären Gewinner gewesen", value: "\(winners) von \(withResult.count)")
                        }
                    }
                    Text(insight(items: items, winners: winners, withResult: withResult.count))
                        .font(.footnote).foregroundStyle(.secondary).fixedSize(horizontal: false, vertical: true)
                }
            }
        }

        if !items.isEmpty {
            TitledCard("Verpasste Trades", systemImage: "list.bullet") {
                VStack(spacing: 0) {
                    ForEach(items) { missed in
                        Button {
                            appModel.present(.editMissedTrade(missed))
                        } label: {
                            MissedTradeRow(missed: missed)
                                .padding(.vertical, 8)
                                .padding(.horizontal, 6)
                                .contentShape(Rectangle())
                        }
                        .buttonStyle(.plain)
                        .hoverHighlight()
                        .contextMenu {
                            Button("Bearbeiten", systemImage: "pencil") { appModel.present(.editMissedTrade(missed)) }
                            Button("Löschen", systemImage: "trash", role: .destructive) {
                                withAnimation(Theme.spring) {
                                    modelContext.delete(missed)
                                    try? modelContext.save()
                                }
                            }
                        }
                        if missed.id != items.last?.id { Divider().overlay(Color.cardBorder) }
                    }
                }
            }
        }
    }

    private func insight(items: [MissedTrade], winners: Int, withResult: Int) -> String {
        let reasons = Dictionary(grouping: items.filter { !$0.reason.isEmpty }, by: { $0.reason })
        if let top = reasons.max(by: { $0.value.count < $1.value.count }), top.value.count >= 2 {
            return String(localized: "Häufigster Grund: „\(top.key)“ (\(top.value.count)×). Wenn die verpassten Setups regelkonform waren, liegt hier dein größter Hebel.")
        }
        if withResult > 0, winners * 2 > withResult {
            return String(localized: "Die Mehrheit der verpassten Setups wäre aufgegangen. Vertraue deinem Prozess – oder prüfe, ob deine Regeln den Einstieg unnötig blockieren.")
        }
        return String(localized: "Notiere bei jedem verpassten Trade den Grund. Muster werden erst über mehrere Einträge sichtbar.")
    }
}

private struct MissedTradeRow: View {
    let missed: MissedTrade

    var body: some View {
        HStack(spacing: Theme.Spacing.m) {
            DirectionBadge(isLong: missed.direction == .long)
            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: 6) {
                    Text(missed.symbol).font(.body.weight(.semibold))
                    if !missed.setupName.isEmpty {
                        TagChip(text: missed.setupName)
                    }
                }
                Text([Format.dateTime(missed.date), missed.reason].filter { !$0.isEmpty }.joined(separator: " · "))
                    .font(.caption).foregroundStyle(.secondary).lineLimit(1)
            }
            Spacer(minLength: Theme.Spacing.s)
            VStack(alignment: .trailing, spacing: 3) {
                if let pnl = missed.hypotheticalPnL {
                    PnLText(value: pnl)
                } else {
                    Text("Ergebnis offen").font(.caption).foregroundStyle(.tertiary)
                }
                RText(value: missed.hypotheticalR, font: .caption)
            }
        }
    }
}

// MARK: - Editor

struct MissedTradeEditorView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    @Environment(AppModel.self) private var appModel
    @Environment(SettingsStore.self) private var settings
    @Query(sort: \Tag.name) private var tags: [Tag]

    private let missedTrade: MissedTrade?
    @State private var symbol: String
    @State private var direction: TradeDirection
    @State private var date: Date
    @State private var setupName: String
    @State private var plannedEntry: Double?
    @State private var plannedStop: Double?
    @State private var plannedTarget: Double?
    @State private var hypotheticalExit: Double?
    @State private var quantity: Double?
    @State private var multiplier: Double?
    @State private var reason: String
    @State private var notes: String
    @State private var showDeleteConfirmation = false

    init(missedTrade: MissedTrade?) {
        self.missedTrade = missedTrade
        _symbol = State(initialValue: missedTrade?.symbol ?? "")
        _direction = State(initialValue: missedTrade?.direction ?? .long)
        _date = State(initialValue: missedTrade?.date ?? Date())
        _setupName = State(initialValue: missedTrade?.setupName ?? "")
        _plannedEntry = State(initialValue: missedTrade?.plannedEntry)
        _plannedStop = State(initialValue: missedTrade?.plannedStop)
        _plannedTarget = State(initialValue: missedTrade?.plannedTarget)
        _hypotheticalExit = State(initialValue: missedTrade?.hypotheticalExit)
        _quantity = State(initialValue: missedTrade?.quantity)
        _multiplier = State(initialValue: missedTrade?.multiplier ?? 1)
        _reason = State(initialValue: missedTrade?.reason ?? "")
        _notes = State(initialValue: missedTrade?.notes ?? "")
    }

    private var isValid: Bool {
        !symbol.trimmingCharacters(in: .whitespaces).isEmpty && (plannedEntry ?? 0) > 0 && (plannedStop ?? 0) > 0 && (quantity ?? 0) > 0
    }

    private var previewPnL: Double? {
        guard let plannedEntry, let quantity else { return nil }
        return MissedTradeMath.hypotheticalPnL(direction: direction, plannedEntry: plannedEntry, hypotheticalExit: hypotheticalExit, quantity: quantity, multiplier: multiplier ?? 1)
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Setup") {
                    TextField("Symbol", text: $symbol, prompt: Text("z. B. DAX")).noAutocapitalization()
                    Picker("Richtung", selection: $direction) {
                        Text("Long").tag(TradeDirection.long)
                        Text("Short").tag(TradeDirection.short)
                    }
                    .pickerStyle(.segmented)
                    DatePicker("Gesehen am", selection: $date)
                    Picker("Setup", selection: $setupName) {
                        Text("Keines").tag("")
                        ForEach(tags.filter { $0.kind == .setup }) { Text($0.name).tag($0.name) }
                    }
                }
                Section("Plan") {
                    TextField("Einstieg", value: $plannedEntry, format: .number, prompt: Text("Kurs")).decimalKeyboard()
                    TextField("Stop", value: $plannedStop, format: .number, prompt: Text("Kurs")).decimalKeyboard()
                    TextField("Ziel", value: $plannedTarget, format: .number, prompt: Text("optional")).decimalKeyboard()
                    TextField("Menge", value: $quantity, format: .number, prompt: Text("wie geplant")).decimalKeyboard()
                    TextField("Punktwert", value: $multiplier, format: .number, prompt: Text("1")).decimalKeyboard()
                }
                Section {
                    TextField("Hypothetischer Ausstieg", value: $hypotheticalExit, format: .number, prompt: Text("Kurs, zu dem der Trade geendet hätte")).decimalKeyboard()
                    if let pnl = previewPnL {
                        LabeledValueRow(label: "Hypothetisches Ergebnis", value: Format.currency(pnl, code: settings.currencyCode, signed: true), tint: Color.pnl(pnl))
                    }
                } header: {
                    Text("Was wäre passiert?")
                } footer: {
                    Text("Trage ein, wo der Trade nach deinen Regeln beendet worden wäre (Ziel oder Stop).")
                }
                Section("Warum nicht genommen?") {
                    TextField("Grund", text: $reason, prompt: Text("z. B. gezögert, Angst, nicht am Rechner"), axis: .vertical)
                        .lineLimit(1...3)
                    TextField("Notizen", text: $notes, prompt: Text("optional"), axis: .vertical)
                        .lineLimit(2...5)
                }
                if missedTrade != nil {
                    Section {
                        Button("Verpassten Trade löschen", role: .destructive) { showDeleteConfirmation = true }
                    }
                }
            }
            .formStyle(.grouped)
            .scrollContentBackground(.hidden)
            .background(Color.screenBackground)
            .navigationTitle(missedTrade == nil ? "Verpasster Trade" : "Verpassten Trade bearbeiten")
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Abbrechen") { dismiss() }.keyboardShortcut(.cancelAction)
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Sichern") { save() }.keyboardShortcut(.defaultAction).disabled(!isValid)
                }
            }
            .confirmationDialog("Verpassten Trade löschen?", isPresented: $showDeleteConfirmation, titleVisibility: .visible) {
                Button("Löschen", role: .destructive) {
                    if let missedTrade {
                        modelContext.delete(missedTrade)
                        try? modelContext.save()
                    }
                    dismiss()
                }
                Button("Abbrechen", role: .cancel) {}
            }
        }
        .sheetFrame(minWidth: 500, minHeight: 600)
    }

    private func save() {
        guard isValid, let plannedEntry, let plannedStop, let quantity else { return }
        let target = missedTrade ?? MissedTrade(symbol: symbol)
        target.symbol = symbol.trimmingCharacters(in: .whitespaces).uppercased()
        target.direction = direction
        target.date = date
        target.setupName = setupName
        target.plannedEntry = plannedEntry
        target.plannedStop = plannedStop
        target.plannedTarget = plannedTarget
        target.hypotheticalExit = hypotheticalExit
        target.quantity = quantity
        target.multiplier = (multiplier ?? 1) > 0 ? (multiplier ?? 1) : 1
        target.reason = reason
        target.notes = notes
        if missedTrade == nil { modelContext.insert(target) }
        try? modelContext.save()
        appModel.didSave()
        dismiss()
    }
}
