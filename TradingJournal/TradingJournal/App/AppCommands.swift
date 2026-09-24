import SwiftUI

/// Menübefehle und Tastaturkürzel (macOS; auf iPad mit Hardware-Tastatur ebenfalls nutzbar).
struct AppCommands: Commands {
    let appModel: AppModel

    var body: some Commands {
        CommandGroup(replacing: .newItem) {
            Button("Neuer Trade") { appModel.present(.newTrade) }
                .keyboardShortcut("n", modifiers: .command)
            Button("Verpassten Trade erfassen") { appModel.present(.newMissedTrade) }
                .keyboardShortcut("m", modifiers: [.command, .shift])
            Button("Tages-Check-in") { appModel.present(.checkIn(Date())) }
                .keyboardShortcut("d", modifiers: [.command, .shift])
            Divider()
            Button("CSV importieren…") { appModel.present(.importCSV) }
                .keyboardShortcut("i", modifiers: .command)
        }

        CommandMenu("Bereich") {
            ForEach(AppSection.allCases) { section in
                Button {
                    appModel.show(section)
                } label: {
                    Label(section.title, systemImage: section.systemImage)
                }
                .keyboardShortcut(section.shortcut, modifiers: .command)
            }
        }

        CommandGroup(replacing: .appSettings) {
            Button("Einstellungen…") { appModel.show(.settings) }
                .keyboardShortcut(",", modifiers: .command)
        }
    }
}
