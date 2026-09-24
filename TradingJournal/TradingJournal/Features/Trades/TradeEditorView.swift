import SwiftUI
import SwiftData
import JournalCore

/// Formular zum Erfassen und Bearbeiten eines Trades.
struct TradeEditorView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    @Environment(AppModel.self) private var appModel
    @Environment(SettingsStore.self) private var settings
    @Environment(TiltMonitor.self) private var tiltMonitor
    @Query(sort: \Tag.name) private var tags: [Tag]
    @Query(sort: \TradingRule.sortOrder) private var rules: [TradingRule]

    private let trade: Trade?

    // Instrument
    @State private var symbol: String
    @State private var direction: TradeDirection
    @State private var quantity: Double?
    @State private var multiplier: Double?
    @State private var fees: Double?
    // Plan
    @State private var plannedEntry: Double?
    @State private var plannedStop: Double?
    @State private var plannedTarget: Double?
    @State private var planReason: String
    // Ausführung
    @State private var entryDate: Date
    @State private var entryPrice: Double?
    @State private var isClosed: Bool
    @State private var exitDate: Date
    @State private var exitPrice: Double?
    @State private var initialStop: Double?
    @State private var pnlOverride: Double?
    // Kursverlauf
    @State private var maePrice: Double?
    @State private var mfePrice: Double?
    // Tags
    @State private var setup: Tag?
    @State private var strategy: Tag?
    @State private var marketPhase: Tag?
    @State private var mistakes: Set<Tag>
    @State private var emotions: Set<Tag>
    @State private var brokenRules: Set<TradingRule>
    @State private var notes: String

    @State private var validationMessage: String?
    @FocusState private var symbolFocused: Bool

    init(trade: Trade?) {
        self.trade = trade
        _symbol = State(initialValue: trade?.symbol ?? "")
        _direction = State(initialValue: trade?.direction ?? .long)
        _quantity = State(initialValue: trade?.quantity)
        _multiplier = State(initialValue: trade?.multiplier ?? 1)
        _fees = State(initialValue: trade.map { $0.fees })
        _plannedEntry = State(initialValue: trade?.plannedEntry)
        _plannedStop = State(initialValue: trade?.plannedStop)
        _plannedTarget = State(initialValue: trade?.plannedTarget)
        _planReason = State(initialValue: trade?.planReason ?? "")
        _entryDate = State(initialValue: trade?.entryDate ?? Date())
        _entryPrice = State(initialValue: trade?.entryPrice)
        _isClosed = State(initialValue: trade?.isClosed ?? false)
        _exitDate = State(initialValue: trade?.exitDate ?? Date())
        _exitPrice = State(initialValue: trade?.exitPrice)
        _initialStop = State(initialValue: trade?.initialStop)
        _pnlOverride = State(initialValue: trade?.pnlOverride)
        _maePrice = State(initialValue: trade?.maePrice)
        _mfePrice = State(initialValue: trade?.mfePrice)
        _setup = State(initialValue: trade?.setupTag)
        _strategy = State(initialValue: trade?.strategyTag)
        _marketPhase = State(initialValue: trade?.marketPhaseTag)
        _mistakes = State(initialValue: Set(trade?.mistakeTags ?? []))
        _emotions = State(initialValue: Set(trade?.emotionTags ?? []))
        _brokenRules = State(initialValue: Set(trade?.brokenRules ?? []))
        _notes = State(initialValue: trade?.notes ?? "")
    }

    var body: some View {
        NavigationStack {
            Form {
                instrumentSection
                planSection
                executionSection
                excursionSection
                tagsSection
                psychologySection
                notesSection
            }
            .formStyle(.grouped)
            .navigationTitle(trade == nil ? "Neuer Trade" : "Trade bearbeiten")
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Abbrechen") { dismiss() }
                        .keyboardShortcut(.cancelAction)
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Sichern") { save() }
                        .keyboardShortcut(.defaultAction)
                        .disabled(!isValid)
                }
            }
            .alert("Bitte prüfen", isPresented: Binding(get: { validationMessage != nil }, set: { if !$0 { validationMessage = nil } })) {
                Button("OK", role: .cancel) { validationMessage = nil }
            } message: {
                Text(validationMessage ?? "")
            }
        }
        .sheetFrame(minWidth: 560, minHeight: 640)
        .onAppear { if trade == nil { symbolFocused = true } }
    }

    // MARK: - Abschnitte

    private var instrumentSection: some View {
        Section("Instrument") {
            TextField("Symbol", text: $symbol, prompt: Text("z. B. DAX, AAPL, EURUSD"))
                .noAutocapitalization()
                .focused($symbolFocused)
            Picker("Richtung", selection: $direction) {
                Text("Long").tag(TradeDirection.long)
                Text("Short").tag(TradeDirection.short)
            }
            .pickerStyle(.segmented)
            TextField("Menge", value: $quantity, format: .number, prompt: Text("Stück, Kontrakte oder Lots"))
                .decimalKeyboard()
            TextField("Punktwert", value: $multiplier, format: .number, prompt: Text("1"))
                .decimalKeyboard()
            TextField("Gebühren", value: $fees, format: .number, prompt: Text("0"))
                .decimalKeyboard()
        }
    }

    private var planSection: some View {
        Section {
            TextField("Geplanter Einstieg", value: $plannedEntry, format: .number, prompt: Text("Kurs"))
                .decimalKeyboard()
            TextField("Geplanter Stop", value: $plannedStop, format: .number, prompt: Text("Kurs"))
                .decimalKeyboard()
            TextField("Geplantes Ziel", value: $plannedTarget, format: .number, prompt: Text("Kurs"))
                .decimalKeyboard()
            TextField("Grund für den Trade", text: $planReason, prompt: Text("Was spricht für das Setup?"), axis: .vertical)
                .lineLimit(2...5)
            if let rr = plannedPlan.riskRewardRatio {
                LabeledValueRow(label: "Geplantes CRV", value: "1 : \(Format.number(rr, digits: 1))")
            }
            if let risk = plannedRiskAmount {
                LabeledValueRow(
                    label: "Geplantes Risiko",
                    value: Format.currency(risk, code: settings.currencyCode),
                    tint: risk > settings.accountSize * 0.02 ? .loss : nil,
                    secondaryValue: Format.percent(risk / max(settings.accountSize, 1), digits: 1) + String(localized: " vom Konto")
                )
            }
        } header: {
            Text("Plan – vor dem Trade")
        } footer: {
            Text("Aus Plan und Ausführung entsteht der Disziplin-Score. Der Stop bestimmt das Risiko und damit das R-Multiple.")
        }
    }

    private var executionSection: some View {
        Section("Ausführung") {
            DatePicker("Einstieg", selection: $entryDate)
            TextField("Einstiegskurs", value: $entryPrice, format: .number, prompt: Text("Kurs"))
                .decimalKeyboard()
            TextField("Tatsächlicher Stop", value: $initialStop, format: .number, prompt: Text(plannedStop.map { Format.price($0) } ?? "Kurs"))
                .decimalKeyboard()
            Toggle("Trade geschlossen", isOn: $isClosed.animation(Theme.spring))
            if isClosed {
                DatePicker("Ausstieg", selection: $exitDate)
                TextField("Ausstiegskurs", value: $exitPrice, format: .number, prompt: Text("Kurs"))
                    .decimalKeyboard()
                TextField("Ergebnis überschreiben", value: $pnlOverride, format: .number, prompt: Text("optional, netto"))
                    .decimalKeyboard()
                if let preview = previewPnL {
                    LabeledValueRow(
                        label: "Ergebnis",
                        value: Format.currency(preview, code: settings.currencyCode, signed: true),
                        tint: Color.pnl(preview),
                        secondaryValue: previewR.map { Format.r($0) }
                    )
                }
            }
        }
    }

    private var excursionSection: some View {
        Section {
            TextField("Ungünstigster Kurs (MAE)", value: $maePrice, format: .number, prompt: Text("optional"))
                .decimalKeyboard()
            TextField("Günstigster Kurs (MFE)", value: $mfePrice, format: .number, prompt: Text("optional"))
                .decimalKeyboard()
        } header: {
            Text("Kursverlauf")
        } footer: {
            Text("Wie weit lief der Kurs während des Trades gegen dich und für dich? Grundlage der MAE/MFE-Analyse.")
        }
    }

    private var tagsSection: some View {
        Section("Setup & Kontext") {
            SingleTagPicker(kind: .setup, tags: tags, selection: $setup)
            SingleTagPicker(kind: .strategy, tags: tags, selection: $strategy)
            SingleTagPicker(kind: .marketPhase, tags: tags, selection: $marketPhase)
        }
    }

    private var psychologySection: some View {
        Section("Psychologie") {
            VStack(alignment: .leading, spacing: 6) {
                Text("Fehler").font(.subheadline.weight(.medium))
                MultiTagPicker(kind: .mistake, tags: tags, selection: $mistakes, tint: .loss)
            }
            .padding(.vertical, 4)
            VStack(alignment: .leading, spacing: 6) {
                Text("Emotionen").font(.subheadline.weight(.medium))
                MultiTagPicker(kind: .emotion, tags: tags, selection: $emotions, tint: .orange)
            }
            .padding(.vertical, 4)
            VStack(alignment: .leading, spacing: 6) {
                Text("Gebrochene Regeln").font(.subheadline.weight(.medium))
                RulePicker(rules: rules.filter { $0.isActive || brokenRules.contains($0) }, selection: $brokenRules)
            }
            .padding(.vertical, 4)
        }
    }

    private var notesSection: some View {
        Section("Notizen") {
            TextField("Notizen", text: $notes, prompt: Text("Beobachtungen, Learnings …"), axis: .vertical)
                .lineLimit(3...8)
        }
    }

    // MARK: - Berechnungen

    private var plannedPlan: TradePlan {
        TradePlan(entry: plannedEntry, stop: plannedStop, target: plannedTarget, reason: planReason)
    }

    private var plannedRiskAmount: Double? {
        guard let risk = plannedPlan.riskPerUnit, let quantity, quantity > 0 else { return nil }
        return risk * quantity * (multiplier ?? 1)
    }

    private var previewPnL: Double? {
        if let pnlOverride { return pnlOverride }
        guard isClosed, let entryPrice, let exitPrice, let quantity else { return nil }
        return PnLCalculator.netPnL(direction: direction, entryPrice: entryPrice, exitPrice: exitPrice, quantity: quantity, multiplier: multiplier ?? 1, fees: fees ?? 0)
    }

    private var previewR: Double? {
        guard let pnl = previewPnL, let entryPrice, let quantity, quantity > 0 else { return nil }
        guard let stop = initialStop ?? plannedStop else { return nil }
        let risk = abs(entryPrice - stop) * quantity * (multiplier ?? 1)
        guard risk > 0 else { return nil }
        return pnl / risk
    }

    private var isValid: Bool {
        !symbol.trimmingCharacters(in: .whitespaces).isEmpty
            && (entryPrice ?? 0) > 0
            && (quantity ?? 0) > 0
    }

    // MARK: - Sichern

    private func save() {
        guard isValid, let entryPrice, let quantity else {
            validationMessage = String(localized: "Symbol, Einstiegskurs und Menge werden benötigt.")
            return
        }
        if isClosed, exitPrice == nil, pnlOverride == nil {
            validationMessage = String(localized: "Für einen geschlossenen Trade wird ein Ausstiegskurs oder ein Ergebnis benötigt.")
            return
        }
        if isClosed, exitDate < entryDate {
            validationMessage = String(localized: "Der Ausstieg liegt vor dem Einstieg.")
            return
        }

        let target = trade ?? Trade(symbol: symbol)
        target.symbol = symbol.trimmingCharacters(in: .whitespaces).uppercased()
        target.direction = direction
        target.quantity = quantity
        target.multiplier = (multiplier ?? 1) > 0 ? (multiplier ?? 1) : 1
        target.fees = fees ?? 0
        target.plannedEntry = plannedEntry
        target.plannedStop = plannedStop
        target.plannedTarget = plannedTarget
        target.planReason = planReason
        target.entryDate = entryDate
        target.entryPrice = entryPrice
        target.exitDate = isClosed ? exitDate : nil
        target.exitPrice = isClosed ? exitPrice : nil
        target.pnlOverride = isClosed ? pnlOverride : nil
        target.initialStop = initialStop
        target.maePrice = maePrice
        target.mfePrice = mfePrice
        target.notes = notes
        target.updatedAt = Date()

        var linked: [Tag] = []
        if let setup { linked.append(setup) }
        if let strategy { linked.append(strategy) }
        if let marketPhase { linked.append(marketPhase) }
        linked.append(contentsOf: mistakes)
        linked.append(contentsOf: emotions)
        target.tags = linked
        target.brokenRules = Array(brokenRules)

        if trade == nil {
            modelContext.insert(target)
        }
        do {
            try modelContext.save()
        } catch {
            validationMessage = error.localizedDescription
            return
        }

        appModel.didSave()
        let allTrades = (try? modelContext.fetch(FetchDescriptor<Trade>())) ?? []
        tiltMonitor.evaluate(after: target, allTrades: allTrades, settings: settings)
        dismiss()
    }
}
