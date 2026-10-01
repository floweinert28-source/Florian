import Foundation
import Observation
import SwiftUI
import JournalCore

/// Nutzereinstellungen, in UserDefaults gesichert.
@Observable
final class SettingsStore {
    static let supportedCurrencies = ["EUR", "USD", "GBP", "CHF"]

    private enum Keys {
        static let accountSize = "settings.accountSize"
        static let currencyCode = "settings.currencyCode"
        static let dailyLossLimitPercent = "settings.dailyLossLimitPercent"
        static let tiltWarningsEnabled = "settings.tiltWarningsEnabled"
        static let tiltNotificationsEnabled = "settings.tiltNotificationsEnabled"
        static let ruinDrawdownPercent = "settings.ruinDrawdownPercent"
        static let hasLaunchedBefore = "settings.hasLaunchedBefore"
        static let appearance = "settings.appearance"
    }

    private let defaults: UserDefaults

    var accountSize: Double { didSet { defaults.set(accountSize, forKey: Keys.accountSize) } }
    var currencyCode: String { didSet { defaults.set(currencyCode, forKey: Keys.currencyCode) } }
    /// Tagesverlust-Grenze in Prozent der Kontogröße.
    var dailyLossLimitPercent: Double { didSet { defaults.set(dailyLossLimitPercent, forKey: Keys.dailyLossLimitPercent) } }
    var tiltWarningsEnabled: Bool { didSet { defaults.set(tiltWarningsEnabled, forKey: Keys.tiltWarningsEnabled) } }
    var tiltNotificationsEnabled: Bool { didSet { defaults.set(tiltNotificationsEnabled, forKey: Keys.tiltNotificationsEnabled) } }
    /// Ruin-Schwelle für die Monte-Carlo-Simulation in Prozent.
    var ruinDrawdownPercent: Double { didSet { defaults.set(ruinDrawdownPercent, forKey: Keys.ruinDrawdownPercent) } }
    var hasLaunchedBefore: Bool { didSet { defaults.set(hasLaunchedBefore, forKey: Keys.hasLaunchedBefore) } }
    /// Erscheinungsbild; Standard ist Dunkel.
    var appearance: AppearanceMode { didSet { defaults.set(appearance.rawValue, forKey: Keys.appearance) } }

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        let storedAccount = defaults.double(forKey: Keys.accountSize)
        accountSize = storedAccount > 0 ? storedAccount : 10_000
        currencyCode = defaults.string(forKey: Keys.currencyCode) ?? "EUR"
        let storedLimit = defaults.double(forKey: Keys.dailyLossLimitPercent)
        dailyLossLimitPercent = storedLimit > 0 ? storedLimit : 2
        tiltWarningsEnabled = defaults.object(forKey: Keys.tiltWarningsEnabled) as? Bool ?? true
        tiltNotificationsEnabled = defaults.object(forKey: Keys.tiltNotificationsEnabled) as? Bool ?? false
        let storedRuin = defaults.double(forKey: Keys.ruinDrawdownPercent)
        ruinDrawdownPercent = storedRuin > 0 ? storedRuin : 30
        hasLaunchedBefore = defaults.bool(forKey: Keys.hasLaunchedBefore)
        appearance = AppearanceMode(rawValue: defaults.string(forKey: Keys.appearance) ?? "") ?? .dark
    }

    var tiltConfiguration: TiltConfiguration {
        var configuration = TiltConfiguration()
        configuration.accountSize = accountSize
        configuration.dailyLossLimitFraction = dailyLossLimitPercent / 100
        return configuration
    }
}
