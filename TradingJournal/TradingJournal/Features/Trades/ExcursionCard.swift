import SwiftUI
import JournalCore

/// MAE/MFE: Wie weit lief der Kurs gegen dich und für dich?
struct ExcursionCard: View {
    @Environment(AppModel.self) private var appModel
    @Environment(SettingsStore.self) private var settings
    let trade: Trade
    let record: TradeRecord

    var body: some View {
        TitledCard("MAE / MFE", subtitle: "Kursverlauf während des Trades", systemImage: "arrow.up.and.down") {
            if record.mae != nil || record.mfe != nil {
                VStack(alignment: .leading, spacing: Theme.Spacing.m) {
                    let maxValue = max(record.mae?.rMultiple ?? 0, record.mfe?.rMultiple ?? 0, abs(record.rMultiple ?? 0), 1)
                    if let mae = record.mae {
                        LabeledBar(
                            label: String(localized: "MAE – maximal gegen dich"),
                            value: mae.rMultiple ?? 0,
                            maximum: maxValue,
                            valueText: valueText(mae),
                            tint: .loss
                        )
                    }
                    if let mfe = record.mfe {
                        LabeledBar(
                            label: String(localized: "MFE – maximal für dich"),
                            value: mfe.rMultiple ?? 0,
                            maximum: maxValue,
                            valueText: valueText(mfe),
                            tint: .profit
                        )
                    }
                    if let r = record.rMultiple {
                        LabeledBar(
                            label: String(localized: "Realisiert"),
                            value: abs(r),
                            maximum: maxValue,
                            valueText: Format.r(r),
                            tint: Color.pnl(r)
                        )
                    }
                    if let insight {
                        Text(insight)
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                }
            } else {
                VStack(alignment: .leading, spacing: Theme.Spacing.m) {
                    Text("Noch keine Kursextreme erfasst. Trage den ungünstigsten und den günstigsten Kurs während des Trades ein, um zu sehen, wie viel Bewegung du mitgenommen hast.")
                        .font(.explanation)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                    Button("Kurse eintragen") { appModel.present(.editTrade(trade)) }
                        .buttonStyle(.bordered)
                }
            }
        }
    }

    private func valueText(_ excursion: Excursion) -> String {
        let money = Format.currency(excursion.amount, code: settings.currencyCode)
        if let r = excursion.rMultiple {
            return "\(Format.r(r, signed: false)) · \(money)"
        }
        return money
    }

    private var insight: String? {
        guard let r = record.rMultiple else { return nil }
        if let mfe = record.mfe?.rMultiple, mfe > 0.05 {
            if r > 0 {
                let captured = min(r / mfe, 1)
                return String(localized: "Du hast \(Format.percent(captured)) der maximal möglichen Bewegung (\(Format.r(mfe, signed: false))) mitgenommen.")
            } else {
                return String(localized: "Der Trade lag zwischenzeitlich \(Format.r(mfe, signed: false)) im Plus, bevor er im Verlust endete. Ein Teilgewinn oder ein nachgezogener Stop hätte helfen können.")
            }
        }
        if let mae = record.mae?.rMultiple, r > 0, mae < 0.3 {
            return String(localized: "Sauberer Einstieg: Der Kurs lief nur \(Format.r(mae, signed: false)) gegen dich.")
        }
        return nil
    }
}
