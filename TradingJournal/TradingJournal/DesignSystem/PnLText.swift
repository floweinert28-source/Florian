import SwiftUI

/// Ergebnis in Währung, farbig nach Vorzeichen.
struct PnLText: View {
    @Environment(SettingsStore.self) private var settings
    let value: Double
    var font: Font = .metricSmall
    var signed: Bool = true
    var compact: Bool = false

    var body: some View {
        Text(Format.currency(value, code: settings.currencyCode, signed: signed, compact: compact))
            .font(font)
            .numeric()
            .foregroundStyle(Color.pnl(value))
            .contentTransition(.numericText())
    }
}

/// R-Multiple, farbig nach Vorzeichen.
struct RText: View {
    let value: Double?
    var font: Font = .subheadline

    var body: some View {
        if let value {
            Text(Format.r(value))
                .font(font)
                .numeric()
                .foregroundStyle(Color.pnl(value))
        } else {
            Text("— R").font(font).foregroundStyle(.tertiary)
        }
    }
}
