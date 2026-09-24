import SwiftUI

/// Kennzahl-Kachel: dezentes Label, große Zahl, optionale Fußzeile.
struct StatTile: View {
    let label: LocalizedStringKey
    let value: String
    var footnote: String? = nil
    var tint: Color? = nil
    var systemImage: String? = nil

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 5) {
                if let systemImage {
                    Image(systemName: systemImage).font(.caption.weight(.semibold))
                }
                Text(label)
            }
            .font(.metricLabel)
            .foregroundStyle(.secondary)

            Text(value)
                .font(.metricValue)
                .numeric()
                .foregroundStyle(tint ?? .primary)
                .contentTransition(.numericText())
                .lineLimit(1)
                .minimumScaleFactor(0.7)

            if let footnote {
                Text(footnote)
                    .font(.caption)
                    .foregroundStyle(.tertiary)
                    .lineLimit(1)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(Theme.Spacing.l)
        .background(
            RoundedRectangle(cornerRadius: Theme.Radius.tile, style: .continuous)
                .fill(Color.cardBackground)
        )
        .overlay(
            RoundedRectangle(cornerRadius: Theme.Radius.tile, style: .continuous)
                .strokeBorder(Color.primary.opacity(0.04), lineWidth: 0.5)
        )
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

/// Zeile Label – Wert, wie in Apple Health.
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
