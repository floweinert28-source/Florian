import SwiftUI
import SwiftData
import JournalCore

struct TradesListView: View {
    @Environment(AppModel.self) private var appModel
    @Environment(SettingsStore.self) private var settings
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Trade.entryDate, order: .reverse) private var trades: [Trade]
    @Query(sort: \Tag.name) private var tags: [Tag]
    @State private var searchText = ""
    @State private var filter = TradeFilter()
    @State private var tradeToDelete: Trade?

    private struct DayGroup: Identifiable {
        let day: Date
        let trades: [Trade]
        var id: Date { day }
        var pnl: Double { trades.filter(\.isClosed).reduce(0) { $0 + $1.netPnL } }
    }

    var body: some View {
        let filtered = filter.apply(to: trades, search: searchText)
        let groups = grouped(filtered)
        List {
            ForEach(groups) { group in
                Section {
                    ForEach(group.trades) { trade in
                        NavigationLink(value: trade) {
                            TradeRow(trade: trade)
                        }
                        .contextMenu {
                            Button("Bearbeiten", systemImage: "pencil") { appModel.present(.editTrade(trade)) }
                            Button("Löschen", systemImage: "trash", role: .destructive) { tradeToDelete = trade }
                        }
                    }
                    .onDelete { offsets in
                        if let index = offsets.first { tradeToDelete = group.trades[index] }
                    }
                } header: {
                    HStack {
                        Text(dayTitle(group.day))
                        Spacer()
                        Text(Format.currency(group.pnl, code: settings.currencyCode, signed: true))
                            .numeric()
                            .foregroundStyle(Color.pnl(group.pnl))
                    }
                    .font(.subheadline.weight(.medium))
                    .textCase(nil)
                }
            }
        }
        .modifier(PlatformListStyle())
        .scrollContentBackground(.hidden)
        .background(Color.screenBackground)
        .searchable(text: $searchText, prompt: "Symbol, Setup, Notiz")
        .navigationTitle("Trades")
        .navigationDestination(for: Trade.self) { trade in
            TradeDetailView(trade: trade)
        }
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                filterMenu
            }
            ToolbarItem(placement: .primaryAction) {
                Button {
                    appModel.present(.newTrade)
                } label: {
                    Label("Neuer Trade", systemImage: "plus")
                }
            }
        }
        .overlay {
            if trades.isEmpty {
                EmptyStateView(
                    title: "Noch keine Trades",
                    message: "Erfasse deinen ersten Trade mit ⌘N oder importiere eine CSV-Datei über die Einstellungen.",
                    systemImage: "list.bullet.rectangle.portrait",
                    actionTitle: "Trade erfassen"
                ) {
                    appModel.present(.newTrade)
                }
                .background(Color.screenBackground)
            } else if filtered.isEmpty {
                EmptyStateView(
                    title: "Keine Treffer",
                    message: "Kein Trade passt zu Suche und Filter.",
                    systemImage: "line.3.horizontal.decrease.circle",
                    actionTitle: "Filter zurücksetzen"
                ) {
                    withAnimation(Theme.spring) {
                        filter = TradeFilter()
                        searchText = ""
                    }
                }
                .background(Color.screenBackground)
            }
        }
        .confirmationDialog("Trade löschen?", isPresented: Binding(get: { tradeToDelete != nil }, set: { if !$0 { tradeToDelete = nil } }), titleVisibility: .visible) {
            Button("Löschen", role: .destructive) {
                if let trade = tradeToDelete {
                    delete(trade)
                }
                tradeToDelete = nil
            }
            Button("Abbrechen", role: .cancel) { tradeToDelete = nil }
        } message: {
            Text("Screenshots und Sprachnotizen des Trades werden ebenfalls gelöscht.")
        }
        .animation(Theme.spring, value: filter)
    }

    // MARK: - Filter

    private var filterMenu: some View {
        Menu {
            Picker("Ergebnis", selection: $filter.outcome) {
                ForEach(TradeFilter.Outcome.allCases) { Text($0.title).tag($0) }
            }
            Picker("Richtung", selection: $filter.direction) {
                Text("Beide").tag(TradeDirection?.none)
                Text("Long").tag(TradeDirection?.some(.long))
                Text("Short").tag(TradeDirection?.some(.short))
            }
            Picker("Zeitraum", selection: $filter.period) {
                ForEach(AnalysisPeriod.allCases) { Text($0.title).tag($0) }
            }
            let setups = tags.filter { $0.kind == .setup }
            if !setups.isEmpty {
                Picker("Setup", selection: $filter.setupName) {
                    Text("Alle Setups").tag(String?.none)
                    ForEach(setups) { Text($0.name).tag(String?.some($0.name)) }
                }
            }
            Toggle("Nur Trades mit Fehlern", isOn: $filter.onlyMistakes)
            if filter.isActive {
                Divider()
                Button("Filter zurücksetzen") { filter = TradeFilter() }
            }
        } label: {
            Label("Filter", systemImage: filter.isActive ? "line.3.horizontal.decrease.circle.fill" : "line.3.horizontal.decrease.circle")
        }
    }

    // MARK: - Hilfen

    private func grouped(_ trades: [Trade]) -> [DayGroup] {
        let calendar = Calendar.current
        var buckets: [Date: [Trade]] = [:]
        for trade in trades {
            buckets[calendar.startOfDay(for: trade.entryDate), default: []].append(trade)
        }
        return buckets.keys.sorted(by: >).map { day in
            DayGroup(day: day, trades: (buckets[day] ?? []).sorted { $0.entryDate > $1.entryDate })
        }
    }

    private func dayTitle(_ day: Date) -> String {
        if Calendar.current.isDateInToday(day) { return String(localized: "Heute") }
        if Calendar.current.isDateInYesterday(day) { return String(localized: "Gestern") }
        return day.formatted(.dateTime.weekday(.wide).day().month(.wide))
    }

    private func delete(_ trade: Trade) {
        withAnimation(Theme.spring) {
            if appModel.tradesPath.contains(trade) {
                appModel.tradesPath.removeAll { $0 == trade }
            }
            modelContext.delete(trade)
            try? modelContext.save()
        }
    }
}

/// Gruppierte Liste auf iOS, eingerückte Liste auf dem Mac.
struct PlatformListStyle: ViewModifier {
    func body(content: Content) -> some View {
        #if os(iOS)
        content.listStyle(.insetGrouped)
        #else
        content.listStyle(.inset)
        #endif
    }
}
