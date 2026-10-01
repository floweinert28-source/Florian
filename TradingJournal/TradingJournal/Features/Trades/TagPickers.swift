import SwiftUI
import SwiftData
import JournalCore

/// Einfachauswahl eines Tags (Setup, Strategie, Marktphase) mit Neuanlage.
struct SingleTagPicker: View {
    @Environment(\.modelContext) private var modelContext
    let kind: TagKind
    let tags: [Tag]
    @Binding var selection: Tag?
    @State private var showCreate = false
    @State private var newName = ""

    var body: some View {
        HStack {
            Picker(kind.title, selection: $selection) {
                Text("Keine").tag(Tag?.none)
                ForEach(tags.filter { $0.kind == kind }) { tag in
                    Text(tag.name).tag(Tag?.some(tag))
                }
            }
            Button {
                newName = ""
                showCreate = true
            } label: {
                Image(systemName: "plus.circle")
            }
            .buttonStyle(.borderless)
            .accessibilityLabel("Neues Tag anlegen")
        }
        .alert(createTitle, isPresented: $showCreate) {
            TextField("Name", text: $newName)
            Button("Anlegen") { create() }
            Button("Abbrechen", role: .cancel) {}
        }
    }

    private var createTitle: String {
        switch kind {
        case .setup: String(localized: "Neues Setup")
        case .strategy: String(localized: "Neue Strategie")
        case .marketPhase: String(localized: "Neue Marktphase")
        case .mistake: String(localized: "Neuer Fehler")
        case .emotion: String(localized: "Neue Emotion")
        }
    }

    private func create() {
        let name = newName.trimmingCharacters(in: .whitespaces)
        guard !name.isEmpty else { return }
        if let existing = tags.first(where: { $0.kind == kind && $0.name.caseInsensitiveCompare(name) == .orderedSame }) {
            selection = existing
            return
        }
        let tag = Tag(name: name, kind: kind)
        modelContext.insert(tag)
        selection = tag
    }
}

/// Mehrfachauswahl als Chips (Fehler, Emotionen) mit Neuanlage.
struct MultiTagPicker: View {
    @Environment(\.modelContext) private var modelContext
    let kind: TagKind
    let tags: [Tag]
    @Binding var selection: Set<Tag>
    var tint: Color = .accentColor
    @State private var showCreate = false
    @State private var newName = ""

    var body: some View {
        VStack(alignment: .leading, spacing: Theme.Spacing.s) {
            FlowLayout(spacing: 8) {
                ForEach(tags.filter { $0.kind == kind }) { tag in
                    SelectableChip(text: tag.name, isSelected: selection.contains(tag), tint: tint) {
                        toggle(tag)
                    }
                }
                Button {
                    newName = ""
                    showCreate = true
                } label: {
                    Label("Neu", systemImage: "plus")
                        .font(.subheadline.weight(.medium))
                        .padding(.horizontal, 12)
                        .padding(.vertical, 7)
                        .background(Capsule().strokeBorder(Color.secondary.opacity(0.4), style: StrokeStyle(lineWidth: 1, dash: [4, 3])))
                }
                .buttonStyle(.plain)
            }
        }
        .alert(kind == .mistake ? "Neuer Fehler" : "Neue Emotion", isPresented: $showCreate) {
            TextField("Name", text: $newName)
            Button("Anlegen") { create() }
            Button("Abbrechen", role: .cancel) {}
        }
    }

    private func toggle(_ tag: Tag) {
        Haptics.selection()
        if selection.contains(tag) { selection.remove(tag) } else { selection.insert(tag) }
    }

    private func create() {
        let name = newName.trimmingCharacters(in: .whitespaces)
        guard !name.isEmpty else { return }
        if let existing = tags.first(where: { $0.kind == kind && $0.name.caseInsensitiveCompare(name) == .orderedSame }) {
            selection.insert(existing)
            return
        }
        let tag = Tag(name: name, kind: kind)
        modelContext.insert(tag)
        selection.insert(tag)
    }
}

/// Auswahl gebrochener Regeln.
struct RulePicker: View {
    let rules: [TradingRule]
    @Binding var selection: Set<TradingRule>

    var body: some View {
        if rules.isEmpty {
            Text("Noch keine Regeln angelegt. Regeln pflegst du in den Einstellungen.")
                .font(.footnote)
                .foregroundStyle(.secondary)
        } else {
            FlowLayout(spacing: 8) {
                ForEach(rules) { rule in
                    SelectableChip(text: rule.title, isSelected: selection.contains(rule), tint: .loss) {
                        Haptics.selection()
                        if selection.contains(rule) { selection.remove(rule) } else { selection.insert(rule) }
                    }
                }
            }
        }
    }
}
