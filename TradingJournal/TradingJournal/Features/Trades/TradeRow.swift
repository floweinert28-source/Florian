import SwiftUI
import JournalCore

/// Kompakte Zeile eines Trades in Listen.
struct TradeRow: View {
    let trade: Trade
    var showsDate = false

    var body: some View {
        HStack(spacing: Theme.Spacing.m) {
            DirectionBadge(isLong: trade.direction == .long)
            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: 6) {
                    Text(trade.symbol)
                        .font(.body.weight(.semibold))
                    if !trade.isClosed {
                        TagChip(text: String(localized: "Offen"), tint: .accentColor)
                    }
                    if !trade.mistakeTags.isEmpty {
                        Image(systemName: "exclamationmark.triangle.fill")
                            .font(.caption2)
                            .foregroundStyle(Color.loss)
                            .accessibilityLabel("Mit Fehlern")
                    }
                    if !(trade.attachments ?? []).isEmpty {
                        Image(systemName: "photo")
                            .font(.caption2)
                            .foregroundStyle(.tertiary)
                    }
                    if !(trade.voiceNotes ?? []).isEmpty {
                        Image(systemName: "waveform")
                            .font(.caption2)
                            .foregroundStyle(.tertiary)
                    }
                }
                Text(subtitle)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
            }
            Spacer(minLength: Theme.Spacing.s)
            VStack(alignment: .trailing, spacing: 3) {
                if trade.isClosed {
                    PnLText(value: trade.netPnL)
                } else {
                    Text("—").font(.metricSmall).foregroundStyle(.tertiary)
                }
                RText(value: trade.isClosed ? trade.record().rMultiple : nil, font: .caption)
            }
        }
        .contentShape(Rectangle())
    }

    private var subtitle: String {
        var parts: [String] = []
        if let setup = trade.setupTag?.name { parts.append(setup) }
        parts.append(showsDate ? Format.dateTime(trade.entryDate) : Format.time(trade.entryDate))
        if let duration = trade.record().holdingDuration { parts.append(Format.duration(duration)) }
        return parts.joined(separator: " · ")
    }
}
