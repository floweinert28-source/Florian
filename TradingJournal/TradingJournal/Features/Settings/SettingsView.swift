import SwiftUI
import SwiftData
import JournalCore

struct SettingsView: View {
    @Environment(AppModel.self) private var appModel
    @Environment(SettingsStore.self) private var settings
    @Environment(\.modelContext) private var modelContext
    @Query(filter: #Predicate<Trade> { $0.isSample }) private var sampleTrades: [Trade]
    @State private var showDeleteAll = false
    @State private var sampleToggleBusy = false
    @State private var errorMessage: String?

    var body: some View {
        @Bindable var settings = settings
        Form {
            Section {
                HStack {
                    Text("Kontogröße")
                    Spacer()
                    TextField("Kontogröße", value: $settings.accountSize, format: .number)
                        .decimalKeyboard()
                        .multilineTextAlignment(.trailing)
                        .frame(maxWidth: 160)
                        .labelsHidden()
                }
                Picker("Währung", selection: $settings.currencyCode) {
                    ForEach(SettingsStore.supportedCurrencies, id: \.self) { code in
                        Text("\(code) – \(Locale.current.localizedString(forCurrencyCode: code) ?? code)").tag(code)
                    }
                }
            } header: {
                Text("Konto")
            } footer: {
                Text("Die Kontogröße dient für Risiko-Prozente, Tilt-Grenzen und die Monte-Carlo-Simulation.")
            }

            Section {
                Toggle("Tilt-Warnungen", isOn: $settings.tiltWarningsEnabled)
                if settings.tiltWarningsEnabled {
                    HStack {
                        Text("Tagesverlust-Grenze")
                        Spacer()
                        Text(Format.percent(settings.dailyLossLimitPercent / 100, digits: 1)).numeric().foregroundStyle(.secondary)
                    }
                    Slider(value: $settings.dailyLossLimitPercent, in: 0.5...10, step: 0.5)
                    Toggle("Mitteilung senden", isOn: $settings.tiltNotificationsEnabled)
                        .onChange(of: settings.tiltNotificationsEnabled) { _, enabled in
                            if enabled {
                                Task {
                                    let granted = await NotificationService.requestAuthorization()
                                    if !granted { settings.tiltNotificationsEnabled = false }
                                }
                            }
                        }
                }
            } header: {
                Text("Tilt-Warnung")
            } footer: {
                Text("Nach jedem erfassten Trade prüft das Journal auf Muster wie größere Positionen nach Verlusten oder viele Trades in kurzer Zeit – gewichtet mit deiner eigenen Historie.")
            }

            Section("Journal") {
                NavigationLink {
                    RulesSettingsView()
                } label: {
                    Label("Regeln", systemImage: "checklist")
                }
                NavigationLink {
                    TagsSettingsView()
                } label: {
                    Label("Tags", systemImage: "tag")
                }
                Button {
                    appModel.present(.importCSV)
                } label: {
                    Label("CSV importieren …", systemImage: "square.and.arrow.down")
                }
            }

            Section {
                Toggle(isOn: Binding(
                    get: { !sampleTrades.isEmpty },
                    set: { toggleSampleData($0) }
                )) {
                    Label("Beispieldaten", systemImage: "sparkles")
                }
                .disabled(sampleToggleBusy)
                Button(role: .destructive) {
                    showDeleteAll = true
                } label: {
                    Label("Alle Daten löschen …", systemImage: "trash")
                }
            } header: {
                Text("Daten")
            } footer: {
                Text("Beispieldaten zeigen alle Funktionen mit rund 140 Trades. Sie lassen sich jederzeit rückstandslos entfernen. Deine Daten werden über iCloud zwischen deinen Geräten synchronisiert, sobald du angemeldet bist.")
            }

            Section("Über") {
                LabeledContent("Version", value: appVersion)
                LabeledContent("Sprachnotizen", value: String(localized: "Erkennung auf dem Gerät"))
            }
        }
        .formStyle(.grouped)
        .navigationTitle("Einstellungen")
        .confirmationDialog("Wirklich alle Daten löschen?", isPresented: $showDeleteAll, titleVisibility: .visible) {
            Button("Alle Daten löschen", role: .destructive) {
                do {
                    try SampleDataService.deleteEverything(in: modelContext)
                } catch {
                    errorMessage = error.localizedDescription
                }
            }
            Button("Abbrechen", role: .cancel) {}
        } message: {
            Text("Trades, Tags, Regeln, Check-ins, Regimes und verpasste Trades werden gelöscht – auch in iCloud. Das lässt sich nicht rückgängig machen.")
        }
        .alert("Fehler", isPresented: Binding(get: { errorMessage != nil }, set: { if !$0 { errorMessage = nil } })) {
            Button("OK", role: .cancel) { errorMessage = nil }
        } message: {
            Text(errorMessage ?? "")
        }
    }

    private var appVersion: String {
        let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0"
        let build = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"
        return "\(version) (\(build))"
    }

    private func toggleSampleData(_ enabled: Bool) {
        sampleToggleBusy = true
        defer { sampleToggleBusy = false }
        do {
            if enabled {
                try SampleDataService.install(into: modelContext, settings: settings)
            } else {
                try SampleDataService.remove(from: modelContext)
            }
            Haptics.success()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

// MARK: - Regeln

struct RulesSettingsView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \TradingRule.sortOrder) private var rules: [TradingRule]
    @State private var newTitle = ""
    @State private var editingRule: TradingRule?

    var body: some View {
        List {
            Section {
                HStack {
                    TextField("Neue Regel", text: $newTitle, prompt: Text("z. B. Nach zwei Verlusten Pause"))
                        .onSubmit(addRule)
                    Button("Hinzufügen", action: addRule)
                        .disabled(newTitle.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            } footer: {
                Text("Regeln kannst du beim Erfassen eines Trades als gebrochen markieren. Sie fließen in Disziplin-Score und Fehlerkosten ein.")
            }
            Section {
                ForEach(rules) { rule in
                    HStack {
                        Toggle(isOn: Binding(get: { rule.isActive }, set: { rule.isActive = $0; try? modelContext.save() })) {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(rule.title)
                                if rule.violationCount > 0 {
                                    Text("\(rule.violationCount)× gebrochen").font(.caption).foregroundStyle(.secondary)
                                }
                            }
                        }
                    }
                    .contextMenu {
                        Button("Umbenennen", systemImage: "pencil") { editingRule = rule }
                        Button("Löschen", systemImage: "trash", role: .destructive) { delete(rule) }
                    }
                }
                .onDelete { offsets in
                    for index in offsets { delete(rules[index]) }
                }
                .onMove { source, destination in
                    var reordered = rules
                    reordered.move(fromOffsets: source, toOffset: destination)
                    for (index, rule) in reordered.enumerated() { rule.sortOrder = index }
                    try? modelContext.save()
                }
            }
        }
        .navigationTitle("Regeln")
        .overlay {
            if rules.isEmpty {
                EmptyStateView(title: "Noch keine Regeln", message: "Formuliere drei bis fünf Regeln, die du wirklich einhalten willst.", systemImage: "checklist")
                    .allowsHitTesting(false)
            }
        }
        .sheet(item: $editingRule) { rule in
            RenameSheet(title: "Regel umbenennen", text: rule.title) { newTitle in
                rule.title = newTitle
                try? modelContext.save()
            }
        }
    }

    private func addRule() {
        let title = newTitle.trimmingCharacters(in: .whitespaces)
        guard !title.isEmpty else { return }
        withAnimation(Theme.spring) {
            modelContext.insert(TradingRule(title: title, sortOrder: (rules.map(\.sortOrder).max() ?? -1) + 1))
            try? modelContext.save()
            newTitle = ""
        }
    }

    private func delete(_ rule: TradingRule) {
        withAnimation(Theme.spring) {
            modelContext.delete(rule)
            try? modelContext.save()
        }
    }
}

// MARK: - Tags

struct TagsSettingsView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Tag.name) private var tags: [Tag]
    @State private var kind: TagKind = .setup
    @State private var newName = ""
    @State private var editingTag: Tag?

    var body: some View {
        List {
            Section {
                Picker("Art", selection: $kind) {
                    ForEach(TagKind.allCases) { Text($0.pluralTitle).tag($0) }
                }
                .pickerStyle(.segmented)
                .labelsHidden()
                HStack {
                    TextField("Neues Tag", text: $newName, prompt: Text(placeholder))
                        .onSubmit(addTag)
                    Button("Hinzufügen", action: addTag)
                        .disabled(newName.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
            Section(kind.pluralTitle) {
                let filtered = tags.filter { $0.kind == kind }
                if filtered.isEmpty {
                    Text("Noch keine Einträge.").foregroundStyle(.secondary)
                }
                ForEach(filtered) { tag in
                    HStack {
                        Label(tag.name, systemImage: kind.systemImage)
                        Spacer()
                        Text("\(tag.tradeCount)").font(.caption).numeric().foregroundStyle(.secondary)
                    }
                    .contextMenu {
                        Button("Umbenennen", systemImage: "pencil") { editingTag = tag }
                        Button("Löschen", systemImage: "trash", role: .destructive) { delete(tag) }
                    }
                }
                .onDelete { offsets in
                    for index in offsets { delete(filtered[index]) }
                }
            }
        }
        .navigationTitle("Tags")
        .sheet(item: $editingTag) { tag in
            RenameSheet(title: "Tag umbenennen", text: tag.name) { newName in
                tag.name = newName
                try? modelContext.save()
            }
        }
        .animation(Theme.spring, value: kind)
    }

    private var placeholder: String {
        switch kind {
        case .setup: String(localized: "z. B. Breakout")
        case .strategy: String(localized: "z. B. Trendfolge")
        case .marketPhase: String(localized: "z. B. Eröffnung")
        case .mistake: String(localized: "z. B. FOMO")
        case .emotion: String(localized: "z. B. Ruhig")
        }
    }

    private func addTag() {
        let name = newName.trimmingCharacters(in: .whitespaces)
        guard !name.isEmpty else { return }
        guard !tags.contains(where: { $0.kind == kind && $0.name.caseInsensitiveCompare(name) == .orderedSame }) else {
            newName = ""
            return
        }
        withAnimation(Theme.spring) {
            modelContext.insert(Tag(name: name, kind: kind))
            try? modelContext.save()
            newName = ""
        }
    }

    private func delete(_ tag: Tag) {
        withAnimation(Theme.spring) {
            modelContext.delete(tag)
            try? modelContext.save()
        }
    }
}

/// Kleines Sheet zum Umbenennen.
private struct RenameSheet: View {
    @Environment(\.dismiss) private var dismiss
    let title: LocalizedStringKey
    @State var text: String
    let onSave: (String) -> Void

    var body: some View {
        NavigationStack {
            Form {
                TextField("Name", text: $text)
                    .onSubmit(save)
            }
            .formStyle(.grouped)
            .navigationTitle(title)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Abbrechen") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Sichern", action: save).disabled(text.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
        }
        .sheetFrame(minWidth: 380, minHeight: 160)
    }

    private func save() {
        let trimmed = text.trimmingCharacters(in: .whitespaces)
        guard !trimmed.isEmpty else { return }
        onSave(trimmed)
        dismiss()
    }
}
