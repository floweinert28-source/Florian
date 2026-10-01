import SwiftUI
import SwiftData
import UniformTypeIdentifiers
import JournalCore

/// CSV-Import mit Spaltenzuordnung und Vorschau.
struct CSVImportView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    @Environment(AppModel.self) private var appModel
    @State private var viewModel = CSVImportViewModel()
    @State private var showFileImporter = false
    @State private var isTargeted = false
    @State private var isImporting = false

    var body: some View {
        NavigationStack {
            Group {
                switch viewModel.step {
                case .pickFile:
                    pickFileStep
                case .mapColumns:
                    mapColumnsStep
                case .finished(let count):
                    finishedStep(count: count)
                }
            }
            .navigationTitle("CSV importieren")
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(viewModel.step == .pickFile ? "Abbrechen" : "Schließen") { dismiss() }
                        .keyboardShortcut(.cancelAction)
                }
                if viewModel.step == .mapColumns {
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Importieren") { runImport() }
                            .keyboardShortcut(.defaultAction)
                            .disabled(!(viewModel.preview.map { !$0.drafts.isEmpty } ?? false) || isImporting)
                    }
                }
            }
        }
        .sheetFrame(minWidth: 640, minHeight: 620)
        .fileImporter(isPresented: $showFileImporter, allowedContentTypes: [.commaSeparatedText, .tabSeparatedText, .plainText, .text], allowsMultipleSelection: false) { result in
            if case .success(let urls) = result, let url = urls.first {
                viewModel.load(url: url)
            }
        }
        .animation(Theme.spring, value: viewModel.step)
    }

    // MARK: - Schritt 1: Datei

    private var pickFileStep: some View {
        VStack(spacing: Theme.Spacing.xl) {
            VStack(spacing: Theme.Spacing.m) {
                Image(systemName: "doc.badge.arrow.up")
                    .font(.system(size: 40, weight: .light))
                    .foregroundStyle(Color.accentColor)
                Text("CSV-Datei hierher ziehen")
                    .font(.title3.weight(.semibold))
                Text("Export deines Brokers oder deiner Handelsplattform. Die Spalten ordnest du im nächsten Schritt zu.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .frame(maxWidth: 380)
                Button("Datei auswählen …") { showFileImporter = true }
                    .buttonStyle(.borderedProminent)
                    .keyboardShortcut("o", modifiers: .command)
            }
            .frame(maxWidth: .infinity, minHeight: 280)
            .background(
                RoundedRectangle(cornerRadius: Theme.Radius.card, style: .continuous)
                    .fill(isTargeted ? Color.accentColor.opacity(0.10) : Color.cardBackground)
            )
            .overlay(
                RoundedRectangle(cornerRadius: Theme.Radius.card, style: .continuous)
                    .strokeBorder(isTargeted ? Color.accentColor : Color.secondary.opacity(0.25), style: StrokeStyle(lineWidth: isTargeted ? 2 : 1, dash: [8, 6]))
            )
            .dropDestination(for: DroppedTextFile.self) { items, _ in
                guard let first = items.first else { return false }
                viewModel.load(text: first.text, fileName: first.name)
                return true
            } isTargeted: { isTargeted = $0 }

            if let error = viewModel.errorMessage {
                Text(error).font(.footnote).foregroundStyle(Color.loss)
            }

            VStack(alignment: .leading, spacing: 6) {
                Text("Unterstützt werden Komma, Semikolon und Tab als Trennzeichen, deutsche und englische Zahlenformate sowie gängige Datumsformate. Benötigt werden mindestens Symbol, Datum, Menge und Einstiegskurs.")
                    .font(.footnote)
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            Spacer()
        }
        .padding(Theme.Spacing.xl)
        .background(Color.screenBackground)
    }

    // MARK: - Schritt 2: Zuordnung

    private var mapColumnsStep: some View {
        let headers = viewModel.document?.headers ?? []
        return Form {
            Section {
                LabeledContent("Datei", value: viewModel.fileName)
                LabeledContent("Zeilen", value: "\(viewModel.document?.rows.count ?? 0)")
                Button("Andere Datei wählen") { viewModel.reset() }
            }

            Section("Pflichtfelder und Kernwerte") {
                ForEach(ImportField.primaryFields) { field in
                    columnPicker(field, headers: headers)
                }
            }

            Section("Weitere Felder") {
                ForEach(ImportField.secondaryFields) { field in
                    columnPicker(field, headers: headers)
                }
            }

            Section("Formate") {
                Picker("Dezimaltrennzeichen", selection: $viewModel.decimalSeparator) {
                    ForEach(DecimalSeparatorOption.allCases) { Text($0.title).tag($0) }
                }
                TextField("Datumsformat", text: $viewModel.dateFormat, prompt: Text("automatisch, z. B. dd.MM.yyyy HH:mm"))
                    .noAutocapitalization()
                TextField("Punktwert, falls keine Spalte", value: $viewModel.defaultMultiplier, format: .number)
                    .decimalKeyboard()
            }

            previewSection
        }
        .formStyle(.grouped)
        .scrollContentBackground(.hidden)
        .background(Color.screenBackground)
    }

    private func columnPicker(_ field: ImportField, headers: [String]) -> some View {
        Picker(selection: Binding(
            get: { viewModel.binding(for: field) },
            set: { viewModel.set($0, for: field) }
        )) {
            Text("—").tag(Int?.none)
            ForEach(Array(headers.enumerated()), id: \.offset) { index, header in
                Text(header.isEmpty ? String(localized: "Spalte \(index + 1)") : header).tag(Int?.some(index))
            }
        } label: {
            HStack(spacing: 4) {
                Text(field.title)
                if field.isRequired {
                    Text("*").foregroundStyle(Color.loss)
                }
            }
        }
    }

    @ViewBuilder
    private var previewSection: some View {
        if let preview = viewModel.preview {
            Section {
                HStack {
                    Label("\(preview.drafts.count) Trades erkannt", systemImage: "checkmark.circle.fill")
                        .foregroundStyle(Color.profit)
                    Spacer()
                    if preview.skippedRows > 0 {
                        Label("\(preview.skippedRows) Zeilen übersprungen", systemImage: "exclamationmark.triangle.fill")
                            .foregroundStyle(Color.warning)
                    }
                }
                .font(.subheadline)

                ForEach(preview.drafts.prefix(5)) { draft in
                    HStack {
                        DirectionBadge(isLong: draft.direction == .long)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(draft.symbol).font(.subheadline.weight(.semibold))
                            Text(Format.dateTime(draft.entryDate)).font(.caption).foregroundStyle(.secondary)
                        }
                        Spacer()
                        VStack(alignment: .trailing, spacing: 2) {
                            Text("\(Format.number(draft.quantity, digits: 4)) × \(Format.price(draft.entryPrice))")
                                .font(.caption).numeric().foregroundStyle(.secondary)
                            if draft.exitDate != nil {
                                PnLText(value: draft.netPnL, font: .subheadline.weight(.medium))
                            } else {
                                Text("offen").font(.caption).foregroundStyle(.tertiary)
                            }
                        }
                    }
                }
                if !preview.issues.isEmpty {
                    DisclosureGroup("\(preview.issues.count) Hinweise") {
                        ForEach(preview.issues.prefix(20)) { issue in
                            HStack(alignment: .top, spacing: 6) {
                                Text("Zeile \(issue.line)").font(.caption).numeric().foregroundStyle(.secondary).frame(width: 64, alignment: .leading)
                                Text(issue.kind.message).font(.caption)
                            }
                        }
                    }
                }
            } header: {
                Text("Vorschau")
            }
        } else {
            Section("Vorschau") {
                let missing = viewModel.mapping.missingRequiredFields.map(\.title).joined(separator: ", ")
                Text("Bitte zuordnen: \(missing)")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
        }
    }

    // MARK: - Schritt 3: Fertig

    private func finishedStep(count: Int) -> some View {
        VStack(spacing: Theme.Spacing.l) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 52))
                .foregroundStyle(Color.profit)
                .symbolEffect(.bounce, value: count)
            Text("\(count) Trades importiert")
                .font(.title2.weight(.semibold))
            Text("Setups aus der Datei wurden als Tags angelegt. Ergänze Plan, Fehler und Emotionen in der Detailansicht.")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .frame(maxWidth: 380)
            Button("Zu den Trades") {
                dismiss()
                appModel.show(.trades)
            }
            .buttonStyle(.borderedProminent)
            .keyboardShortcut(.defaultAction)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .padding()
        .background(Color.screenBackground)
    }

    // MARK: - Import

    private func runImport() {
        guard let preview = viewModel.preview, !preview.drafts.isEmpty else { return }
        isImporting = true
        do {
            let count = try TradeImportService.insert(preview.drafts, into: modelContext)
            appModel.didSave()
            viewModel.step = .finished(count: count)
        } catch {
            viewModel.errorMessage = error.localizedDescription
        }
        isImporting = false
    }
}

/// Textdatei aus Drag & Drop.
struct DroppedTextFile: Transferable {
    let text: String
    let name: String

    static var transferRepresentation: some TransferRepresentation {
        FileRepresentation(importedContentType: .commaSeparatedText) { received in
            try DroppedTextFile(url: received.file)
        }
        FileRepresentation(importedContentType: .tabSeparatedText) { received in
            try DroppedTextFile(url: received.file)
        }
        FileRepresentation(importedContentType: .plainText) { received in
            try DroppedTextFile(url: received.file)
        }
        DataRepresentation(importedContentType: .commaSeparatedText) { data in
            DroppedTextFile(text: String(decoding: data, as: UTF8.self), name: "Import.csv")
        }
        DataRepresentation(importedContentType: .utf8PlainText) { data in
            DroppedTextFile(text: String(decoding: data, as: UTF8.self), name: "Import.csv")
        }
    }

    private init(url: URL) throws {
        text = try TradeImportService.loadText(from: url)
        name = url.lastPathComponent
    }

    init(text: String, name: String) {
        self.text = text
        self.name = name
    }
}
