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
        .sheet(item: $appModel.activeSheet) { sheet in
            SheetContent(sheet: sheet)
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

// MARK: - Layouts

private struct SidebarLayout: View {
    @Environment(AppModel.self) private var appModel
    @State private var columnVisibility: NavigationSplitViewVisibility = .all

    var body: some View {
        @Bindable var appModel = appModel
        NavigationSplitView(columnVisibility: $columnVisibility) {
            List(selection: sidebarSelection) {
                ForEach(AppSection.allCases) { section in
                    Label(section.title, systemImage: section.systemImage)
                        .tag(section)
                }
            }
            .listStyle(.sidebar)
            .navigationTitle("Journal")
            .navigationSplitViewColumnWidth(min: 190, ideal: 220, max: 280)
            .safeAreaInset(edge: .bottom) {
                Button {
                    appModel.present(.newTrade)
                } label: {
                    Label("Neuer Trade", systemImage: "plus.circle.fill")
                        .font(.body.weight(.medium))
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.large)
                .padding(Theme.Spacing.m)
            }
        } detail: {
            SectionContent(section: appModel.selectedSection)
        }
    }

    private var sidebarSelection: Binding<AppSection?> {
        Binding(
            get: { appModel.selectedSection },
            set: { if let value = $0 { appModel.selectedSection = value } }
        )
    }
}

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
