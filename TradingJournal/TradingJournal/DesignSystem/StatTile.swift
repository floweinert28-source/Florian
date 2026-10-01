import SwiftUI

/// KPI-Kachel: kleines Label, große Zahl, optionale Fußzeile und rechts eine Mini-Grafik (Gauge).
struct StatTile<Gauge: View>: View {
    let label: LocalizedStringKey
    let value: String
    var footnote: String? = nil
    var tint: Color? = nil
    var systemImage: String? = nil
    @ViewBuilder var gauge: () -> Gauge

    init(
        label: LocalizedStringKey,
        value: String,
        footnote: String? = nil,
        tint: Color? = nil,
        systemImage: String? = nil,
        @ViewBuilder gauge: @escaping () -> Gauge
    ) {
        self.label = label
        self.value = value
        self.footnote = footnote
        self.tint = tint
        self.systemImage = systemImage
        self.gauge = gauge
    }

    var body: some View {
        HStack(alignment: .center, spacing: Theme.Spacing.m) {
            VStack(alignment: .leading, spacing: 6) {
                HStack(spacing: 5) {
                    Text(label)
                    if let systemImage {
                        Image(systemName: systemImage).font(.caption2)
                    }
                }
                .font(.metricLabel)
                .foregroundStyle(.secondary)
                .lineLimit(1)

                Text(value)
                    .font(.metricValue)
                    .numeric()
                    .foregroundStyle(tint ?? .primary)
                    .contentTransition(.numericText())
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)

                if let footnote {
                    Text(footnote)
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                        .lineLimit(1)
                }
            }
            Spacer(minLength: 0)
            gauge()
        }
        .padding(Theme.Spacing.l)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: Theme.Radius.tile, style: .continuous)
                .fill(Color.cardBackground)
        )
        .overlay(
            RoundedRectangle(cornerRadius: Theme.Radius.tile, style: .continuous)
                .strokeBorder(Color.cardBorder, lineWidth: 1)
        )
    }
}

extension StatTile where Gauge == EmptyView {
    init(label: LocalizedStringKey, value: String, footnote: String? = nil, tint: Color? = nil, systemImage: String? = nil) {
        self.init(label: label, value: value, footnote: footnote, tint: tint, systemImage: systemImage) { EmptyView() }
    }
}

/// Kleine Kennzahl innerhalb einer Karte (Label oben, Wert darunter).
struct InlineStat: View {
    let label: LocalizedStringKey
    let value: String
    var tint: Color? = nil

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label).font(.caption).foregroundStyle(.secondary)
            Text(value).font(.metricSmall).numeric().foregroundStyle(tint ?? .primary)
        }
    }
}

/// Zeile Label – Wert.
struct LabeledValueRow: View {
    let label: LocalizedStringKey
    let value: String
    var tint: Color? = nil
    var secondaryValue: String? = nil

    var body: some View {
        HStack {
            Text(label).foregroundStyle(.secondary)
            Spacer()
            if let secondaryValue {
                Text(secondaryValue).font(.subheadline).foregroundStyle(.tertiary).numeric()
            }
            Text(value).fontWeight(.medium).numeric().foregroundStyle(tint ?? .primary)
        }
        .font(.subheadline)
    }
}
