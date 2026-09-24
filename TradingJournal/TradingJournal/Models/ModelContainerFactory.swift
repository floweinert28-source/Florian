import Foundation
import SwiftData

enum ModelContainerFactory {
    static let schema = Schema([
        Trade.self,
        Tag.self,
        TradeAttachment.self,
        VoiceNote.self,
        DailyCheckIn.self,
        MarketRegimeEntry.self,
        MissedTrade.self,
        TradingRule.self,
    ])

    /// Container mit iCloud-Sync. Fällt auf eine rein lokale Datenbank zurück, wenn CloudKit
    /// nicht verfügbar ist (z. B. ohne Entitlement oder ohne iCloud-Anmeldung).
    static func makeDefault() -> ModelContainer {
        let cloud = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false, cloudKitDatabase: .automatic)
        if let container = try? ModelContainer(for: schema, configurations: [cloud]) {
            return container
        }
        let local = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false, cloudKitDatabase: .none)
        do {
            return try ModelContainer(for: schema, configurations: [local])
        } catch {
            fatalError("Datenbank konnte nicht geöffnet werden: \(error)")
        }
    }

    /// Flüchtiger Container für Previews und Tests.
    static func makeInMemory() -> ModelContainer {
        let config = ModelConfiguration(schema: schema, isStoredInMemoryOnly: true, cloudKitDatabase: .none)
        do {
            return try ModelContainer(for: schema, configurations: [config])
        } catch {
            fatalError("In-Memory-Container konnte nicht erstellt werden: \(error)")
        }
    }
}
