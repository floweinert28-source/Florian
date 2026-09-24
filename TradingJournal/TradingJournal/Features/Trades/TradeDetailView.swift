import SwiftUI
import SwiftData
import JournalCore

struct TradeDetailView: View {
    @Environment(AppModel.self) private var appModel
    @Environment(SettingsStore.self) private var settings
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    @Bindable var trade: Trade
    @State private var showDeleteConfirmation = false

    var body: some View {
        let record = trade.record()
        Screen(spacing: Theme.Spacing.l) {
            TradeHeaderCard(trade: trade, record: record)
            PlanVsExecutionCard(trade: trade, record: record)
            ExcursionCard(trade: trade, record: record)
            TagsCard(trade: trade)
            ScreenshotsCard(trade: trade)
            NotesCard(trade: trade)
            VoiceNotesCard(trade: trade)
        }
        .navigationTitle(trade.symbol)
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button {
                    appModel.present(.editTrade(trade))
                } label: {
                    Label("Bearbeiten", systemImage: "pencil")
                }
                .keyboardShortcut("e", modifiers: .command)
            }
            ToolbarItem(placement: .secondaryAction) {
                Button(role: .destructive) {
                    showDeleteConfirmation = true
                } label: {
                    Label("Löschen", systemImage: "trash")
                }
            }
        }
        .confirmationDialog("Trade löschen?", isPresented: $showDeleteConfirmation, titleVisibility: .visible) {
            Button("Löschen", role: .destructive) { deleteTrade() }
            Button("Abbrechen", role: .cancel) {}
        } message: {
            Text("Screenshots und Sprachnotizen des Trades werden ebenfalls gelöscht.")
        }
    }

    private func deleteTrade() {
        modelContext.delete(trade)
        try? modelContext.save()
        appModel.tradesPath = []
        dismiss()
    }
}

// MARK: - Kopf

private struct TradeHeaderCard: View {
    @Environment(SettingsStore.self) private var settings
    let trade: Trade
    let record: TradeRecord

    var body: some View {
        Card {
            VStack(alignment: .leading, spacing: Theme.Spacing.l) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 4) {
                        HStack(spacing: 8) {
                            Text(trade.symbol).font(.title2.weight(.bold))
                            DirectionBadge(isLong: trade.direction == .long)
                            if !trade.isClosed {
                                TagChip(text: String(localized: "Offen"), systemImage: "circle.dotted")
                            }
                        }
                        Text(dateLine)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                    VStack(alignment: .trailing, spacing: 2) {
                        if trade.isClosed {
                            PnLText(value: trade.netPnL, font: .metricHero)
                            RText(value: record.rMultiple, font: .subheadline.weight(.medium))
                        } else {
                            Text("Läuft").font(.title3.weight(.semibold)).foregroundStyle(Color.accentColor)
                        }
                    }
                }

                Divider()

                LazyVGrid(columns: [GridItem(.adaptive(minimum: 120), spacing: Theme.Spacing.l, alignment: .leading)], alignment: .leading, spacing: Theme.Spacing.m) {
                    InlineStat(label: "Menge", value: Format.number(trade.quantity, digits: 4))
                    InlineStat(label: "Einstieg", value: Format.price(trade.entryPrice))
                    if let exit = trade.exitPrice {
                        InlineStat(label: "Ausstieg", value: Format.price(exit))
                    }
                    if let risk = record.initialRisk {
                        InlineStat(label: "Risiko", value: Format.currency(risk, code: settings.currencyCode))
                    }
                    if let duration = record.holdingDuration {
                        InlineStat(label: "Haltedauer", value: Format.duration(duration))
                    }
                    if trade.fees > 0 {
                        InlineStat(label: "Gebühren", value: Format.currency(trade.fees, code: settings.currencyCode))
                    }
                    if trade.multiplier != 1 {
                        InlineStat(label: "Punktwert", value: Format.number(trade.multiplier, digits: 2))
                    }
                }
            }
        }
    }

    private var dateLine: String {
        if let exit = trade.exitDate {
            return "\(Format.dateTime(trade.entryDate)) – \(Format.time(exit))"
        }
        return Format.dateTime(trade.entryDate)
    }
}

// MARK: - Tags

private struct TagsCard: View {
    let trade: Trade

    var body: some View {
        TitledCard("Tags", systemImage: "tag") {
            let context = [trade.setupTag, trade.strategyTag, trade.marketPhaseTag].compactMap { $0 }
            let rules = trade.brokenRules ?? []
            if context.isEmpty, trade.mistakeTags.isEmpty, trade.emotionTags.isEmpty, rules.isEmpty {
                Text("Keine Tags. Setup, Strategie, Fehler und Emotionen kannst du beim Bearbeiten vergeben.")
                    .font(.explanation).foregroundStyle(.secondary)
            } else {
                FlowLayout(spacing: 8) {
                    ForEach(context) { tag in
                        TagChip(text: tag.name, tint: .accentColor, systemImage: tag.kind.systemImage)
                    }
                    ForEach(trade.mistakeTags) { tag in
                        TagChip(text: tag.name, tint: .loss, systemImage: "exclamationmark.triangle")
                    }
                    ForEach(rules) { rule in
                        TagChip(text: rule.title, tint: .loss, systemImage: "xmark.seal")
                    }
                    ForEach(trade.emotionTags) { tag in
                        TagChip(text: tag.name, tint: .orange, systemImage: "face.smiling")
                    }
                }
            }
        }
    }
}

// MARK: - Notizen

private struct NotesCard: View {
    @Bindable var trade: Trade

    var body: some View {
        TitledCard("Notizen", systemImage: "note.text") {
            TextEditor(text: $trade.notes)
                .font(.body)
                .frame(minHeight: 90)
                .scrollContentBackground(.hidden)
                .overlay(alignment: .topLeading) {
                    if trade.notes.isEmpty {
                        Text("Was war gut, was nicht? Was nimmst du mit?")
                            .foregroundStyle(.tertiary)
                            .padding(.top, 8)
                            .padding(.leading, 5)
                            .allowsHitTesting(false)
                    }
                }
                .onChange(of: trade.notes) { _, _ in
                    trade.updatedAt = Date()
                }
        }
    }
}
