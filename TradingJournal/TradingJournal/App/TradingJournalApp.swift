import SwiftUI
import SwiftData

@main
struct TradingJournalApp: App {
    @State private var appModel = AppModel()
    @State private var settings = SettingsStore()
    @State private var tiltMonitor = TiltMonitor()
    private let container: ModelContainer

    init() {
        container = ModelContainerFactory.makeDefault()
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(appModel)
                .environment(settings)
                .environment(tiltMonitor)
        }
        .modelContainer(container)
        .commands {
            AppCommands(appModel: appModel)
        }
        #if os(macOS)
        .defaultSize(width: 1200, height: 780)
        #endif
    }
}
