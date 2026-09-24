import SwiftUI
import SwiftData

/// Wurzel der Oberfläche: Seitenleiste auf Mac und iPad, Tabs auf dem iPhone.
struct RootView: View {
    @Environment(AppModel.self) private var appModel
    @Environment(SettingsStore.self) private var settings
    @Environment(TiltMonitor.self) private var tiltMonitor
    @Environment(\.modelContext) private var modelContext

    #if os(iOS)
    @Environment(\.horizontalSizeClass) private var sizeClass
    #endif

    var body: some View {
        @Bindable var appModel = appModel
        Group {
            if usesSidebar {
                SidebarLayout()
            } else {
                TabLayout()
            }
        }
        .preferredColorScheme(settings.appearance.colorScheme)
        .tint(.accentColor)
        .sheet(item: $appModel.activeSheet) { sheet in
            SheetContent(sheet: sheet)
                .preferredColorScheme(settings.appearance.colorScheme)
        }
        .sensoryFeedback(.success, trigger: appModel.saveCount)
        .task {
            await installSampleDataOnFirstLaunch()
        }
    }

    private var usesSidebar: Bool {
        #if os(macOS)
        return true
        #else
        return sizeClass == .regular
        #endif
    }

    /// Beim allerersten Start werden Beispieldaten angelegt, damit die App sofort ausprobiert werden kann.
    private func installSampleDataOnFirstLaunch() async {
        guard !settings.hasLaunchedBefore else { return }
        settings.hasLaunchedBefore = true
        let descriptor = FetchDescriptor<Trade>()
        let count = (try? modelContext.fetchCount(descriptor)) ?? 0
        guard count == 0 else { return }
        try? SampleDataService.install(into: modelContext, settings: settings)
    }
}

// MARK: - Seitenleiste (Mac, iPad)

private struct SidebarLayout: View {
    @Environment(AppModel.self) private var appModel
    @State private var columnVisibility: NavigationSplitViewVisibility = .all

    var body: some View {
        NavigationSplitView(columnVisibility: $columnVisibility) {
            SidebarView()
                .navigationSplitViewColumnWidth(min: 200, ideal: 232, max: 280)
                .toolbar(removing: .sidebarToggle)
        } detail: {
            SectionContent(section: appModel.selectedSection)
        }
        .navigationSplitViewStyle(.balanced)
    }
}

/// Eigene Seitenleiste im Dashboard-Stil: Wortmarke, Navigationspunkte, Aktion unten.
private struct SidebarView: View {
    @Environment(AppModel.self) private var appModel

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: 10) {
                ZStack {
                    RoundedRectangle(cornerRadius: 8, style: .continuous)
                        .fill(LinearGradient(colors: [Color.accentColor, Color.accentColor.opacity(0.7)], startPoint: .topLeading, endPoint: .bottomTrailing))
                    Image(systemName: "chart.line.uptrend.xyaxis")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundStyle(.white)
                }
                .frame(width: 30, height: 30)
                Text("Trading Journal")
                    .font(.subheadline.weight(.bold))
                    .lineLimit(1)
            }
            .padding(.horizontal, 14)
            .padding(.top, 14)
            .padding(.bottom, 22)

            VStack(spacing: 2) {
                ForEach(AppSection.allCases) { section in
                    SidebarRow(section: section, isSelected: appModel.selectedSection == section) {
                        withAnimation(Theme.quickSpring) { appModel.show(section) }
                    }
                }
            }
            .padding(.horizontal, 10)

            Spacer()

            Button {
                appModel.present(.newTrade)
            } label: {
                Label("Neuer Trade", systemImage: "plus")
                    .font(.subheadline.weight(.semibold))
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 9)
            }
            .buttonStyle(.borderedProminent)
            .padding(14)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(Color.sidebarBackground)
        .overlay(alignment: .trailing) {
            Rectangle().fill(Color.cardBorder).frame(width: 1)
        }
    }
}

private struct SidebarRow: View {
    let section: AppSection
    let isSelected: Bool
    let action: () -> Void
    @State private var hovering = false

    var body: some View {
        Button(action: action) {
            HStack(spacing: 10) {
                Image(systemName: section.systemImage)
                    .font(.system(size: 14, weight: .semibold))
                    .frame(width: 20)
                Text(section.title)
                    .font(.subheadline.weight(isSelected ? .semibold : .medium))
                Spacer(minLength: 0)
            }
            .foregroundStyle(isSelected ? Color.accentColor : Color.primary.opacity(0.75))
            .padding(.horizontal, 10)
            .padding(.vertical, 8)
            .background(
                RoundedRectangle(cornerRadius: Theme.Radius.control, style: .continuous)
                    .fill(isSelected ? Color.accentColor.opacity(0.16) : (hovering ? Color.primary.opacity(0.06) : Color.clear))
            )
            .contentShape(RoundedRectangle(cornerRadius: Theme.Radius.control, style: .continuous))
        }
        .buttonStyle(.plain)
        .onHover { hovering = $0 }
        .keyboardShortcut(section.shortcut, modifiers: .command)
    }
}

// MARK: - Tabs (iPhone)

private struct TabLayout: View {
    @Environment(AppModel.self) private var appModel

    var body: some View {
        @Bindable var appModel = appModel
        TabView(selection: $appModel.selectedSection) {
            ForEach(AppSection.allCases) { section in
                SectionContent(section: section)
                    .tabItem { Label(section.title, systemImage: section.systemImage) }
                    .tag(section)
            }
        }
    }
}

/// Inhalt eines Bereichs in einem eigenen Navigationsstapel.
private struct SectionContent: View {
    @Environment(AppModel.self) private var appModel
    let section: AppSection

    var body: some View {
        @Bindable var appModel = appModel
        switch section {
        case .dashboard:
            NavigationStack { DashboardView() }
        case .trades:
            NavigationStack(path: $appModel.tradesPath) { TradesListView() }
        case .analysis:
            NavigationStack { AnalysisView() }
        case .psychology:
            NavigationStack { PsychologyView() }
        case .settings:
            NavigationStack { SettingsView() }
        }
    }
}

// MARK: - Sheets

private struct SheetContent: View {
    let sheet: AppSheet

    var body: some View {
        switch sheet {
        case .newTrade:
            TradeEditorView(trade: nil)
        case .editTrade(let trade):
            TradeEditorView(trade: trade)
        case .importCSV:
            CSVImportView()
        case .newMissedTrade:
            MissedTradeEditorView(missedTrade: nil)
        case .editMissedTrade(let missed):
            MissedTradeEditorView(missedTrade: missed)
        case .checkIn(let date):
            CheckInSheet(date: date)
        }
    }
}
