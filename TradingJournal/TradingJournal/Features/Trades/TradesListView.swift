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
    @State private var sortOrder = [KeyPathComparator(\Trade.entryDate, order: .reverse)]
    @State private var selection: Trade.ID?

    #if os(iOS)
    @Environment(\.horizontalSizeClass) private var sizeClass
    #endif

    private var usesTable: Bool {
        #if os(iOS)
        return sizeClass == .regular
        #else
        return true
        #endif
    }

    var body: some View {
        let filtered = filter.apply(to: trades, search: searchText)
        Group {
            if usesTable {
                tableLayout(filtered)
            } else {
                listLayout(filtered)
            }
        }
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
                    systemImage: "list.bullet.rectangle.fill",
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

    // MARK: - Tabelle (Mac, iPad)

    private func tableLayout(_ filtered: [Trade]) -> some View {
        let sorted = filtered.sorted(using: sortOrder)
        let summary = PerformanceCalculator.summary(for: filtered.map { $0.record() })
        return VStack(spacing: Theme.Spacing.m) {
            HStack(spacing: Theme.Spacing.l) {
                summaryPill(label: "Trades", value: "\(filtered.count)")
                summaryPill(label: "Netto-P&L", value: Format.currency(summary.totalPnL, code: settings.currencyCode, signed: true), tint: Color.pnl(summary.totalPnL))
                summaryPill(label: "Win-Rate", value: Format.percent(summary.winRate))
                summaryPill(label: "Profit-Faktor", value: Format.factor(summary.profitFactor))
                summaryPill(label: "Ø R", value: summary.averageR.map { Format.r($0) } ?? "—", tint: summary.averageR.map { Color.pnl($0) })
                Spacer()
            }
            .padding(.horizontal, Theme.Spacing.l)
            .padding(.top, Theme.Spacing.m)

            Table(sorted, selection: $selection, sortOrder: $sortOrder) {
                TableColumn("Datum", value: \.entryDate) { trade in
                    Text(Format.dateTime(trade.entryDate)).numeric()
                }
                .width(min: 150, ideal: 170)
                TableColumn("Symbol", value: \.symbol) { trade in
                    HStack(spacing: 8) {
                        Text(trade.symbol).fontWeight(.semibold)
                        DirectionBadge(isLong: trade.direction == .long)
                    }
                }
                .width(min: 110, ideal: 130)
                TableColumn("Setup") { trade in
                    if let setup = trade.setupTag?.name { TagChip(text: setup) } else { Text("—").foregroundStyle(.tertiary) }
                }
                .width(min: 100, ideal: 130)
                TableColumn("Netto-P&L", value: \.netPnL) { trade in
                    if trade.isClosed { PnLText(value: trade.netPnL) } else { TagChip(text: String(localized: "Offen"), tint: .warning) }
                }
                .width(min: 100, ideal: 110)
                TableColumn("R") { trade in
                    RText(value: trade.isClosed ? trade.record().rMultiple : nil, font: .subheadline)
                }
                .width(min: 70, ideal: 80)
                TableColumn("Dauer") { trade in
                    Text(trade.record().holdingDuration.map(Format.duration) ?? "—").foregroundStyle(.secondary).numeric()
                }
                .width(min: 70, ideal: 90)
                TableColumn("Fehler") { trade in
                    HStack(spacing: 4) {
                        ForEach(trade.mistakeTags.prefix(2)) { tag in TagChip(text: tag.name, tint: .loss) }
                        if trade.mistakeTags.count > 2 { Text("+\(trade.mistakeTags.count - 2)").font(.caption2).foregroundStyle(.secondary) }
                    }
                }
                .width(min: 120, ideal: 200)
                TableColumn("Menge", value: \.quantity) { trade in
                    Text(Format.number(trade.quantity, digits: 4)).foregroundStyle(.secondary).numeric()
                }
                .width(min: 70, ideal: 80)
            }
            .scrollContentBackground(.hidden)
            .background(
                RoundedRectangle(cornerRadius: Theme.Radius.card, style: .continuous).fill(Color.cardBackground)
            )
            .overlay(
                RoundedRectangle(cornerRadius: Theme.Radius.card, style: .continuous).strokeBorder(Color.cardBorder, lineWidth: 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.card, style: .continuous))
            .padding(.horizontal, Theme.Spacing.l)
            .padding(.bottom, Theme.Spacing.l)
            .contextMenu(forSelectionType: Trade.ID.self) { ids in
                if let id = ids.first, let trade = trades.first(where: { $0.id == id }) {
                    Button("Öffnen", systemImage: "arrow.up.forward.square") { appModel.tradesPath.append(trade) }
                    Button("Bearbeiten", systemImage: "pencil") { appModel.present(.editTrade(trade)) }
                    Button("Löschen", systemImage: "trash", role: .destructive) { tradeToDelete = trade }
                }
            } primaryAction: { ids in
                if let id = ids.first, let trade = trades.first(where: { $0.id == id }) {
                    appModel.tradesPath.append(trade)
                }
            }
        }
    }

    private func summaryPill(label: LocalizedStringKey, value: String, tint: Color? = nil) -> some View {
        VStack(alignment: .leading, spacing: 1) {
            Text(label).font(.caption2).foregroundStyle(.secondary)
            Text(value).font(.subheadline.weight(.semibold)).numeric().foregroundStyle(tint ?? .primary)
        }
    }

    // MARK: - Liste (iPhone)

    private struct DayGroup: Identifiable {
        let day: Date
        let trades: [Trade]
        var id: Date { day }
        var pnl: Double { trades.filter(\.isClosed).reduce(0) { $0 + $1.netPnL } }
    }

    private func listLayout(_ filtered: [Trade]) -> some View {
        let groups = grouped(filtered)
        return List {
            ForEach(groups) { group in
                Section {
                    ForEach(group.trades) { trade in
                        NavigationLink(value: trade) {
                            TradeRow(trade: trade)
                        }
                        .listRowBackground(Color.cardBackground)
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
                    .font(.caption.weight(.semibold))
                    .textCase(nil)
                }
            }
        }
        .modifier(PlatformListStyle())
        .scrollContentBackground(.hidden)
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
