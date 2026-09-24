import SwiftUI
import JournalCore

/// Kopfzeile über Trade-Zeilen (Tabellen-Optik).
struct TradeRowHeader: View {
    var body: some View {
        HStack(spacing: Theme.Spacing.m) {
            Text("Symbol").frame(width: 120, alignment: .leading)
            Text("Setup").frame(maxWidth: .infinity, alignment: .leading)
            Text("Netto-P&L").frame(width: 96, alignment: .trailing)
            Text("R").frame(width: 64, alignment: .trailing)
        }
        .font(.caption2.weight(.semibold))
        .foregroundStyle(.tertiary)
        .textCase(.uppercase)
        .padding(.horizontal, 6)
        .padding(.bottom, 6)
        .overlay(alignment: .bottom) { Divider().overlay(Color.cardBorder) }
    }
}

/// Zeile eines Trades in Listen und Karten (Tabellen-Optik).
struct TradeRow: View {
    let trade: Trade
    var showsDate = false

    var body: some View {
        HStack(spacing: Theme.Spacing.m) {
            HStack(spacing: 8) {
                Text(trade.symbol).font(.subheadline.weight(.semibold))
                DirectionBadge(isLong: trade.direction == .long)
            }
            .frame(width: 120, alignment: .leading)
            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 6) {
                    if let setup = trade.setupTag?.name {
                        TagChip(text: setup)
                    }
                    if !trade.isClosed {
                        TagChip(text: String(localized: "Offen"), tint: .warning)
                    }
                    if !trade.mistakeTags.isEmpty {
                        TagChip(text: trade.mistakeTags.count == 1 ? trade.mistakeTags[0].name : String(localized: "\(trade.mistakeTags.count) Fehler"), tint: .loss, systemImage: "exclamationmark.triangle.fill")
                    }
                    if !(trade.attachments ?? []).isEmpty {
                        Image(systemName: "photo.fill").font(.caption2).foregroundStyle(.tertiary)
                    }
                    if !(trade.voiceNotes ?? []).isEmpty {
                        Image(systemName: "waveform").font(.caption2).foregroundStyle(.tertiary)
                    }
                }
                Text(subtitle)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            Group {
                if trade.isClosed {
                    PnLText(value: trade.netPnL)
                } else {
                    Text("—").font(.metricSmall).foregroundStyle(.tertiary)
                }
            }
            .frame(width: 96, alignment: .trailing)
            RText(value: trade.isClosed ? trade.record().rMultiple : nil, font: .caption)
                .frame(width: 64, alignment: .trailing)
        }
        .contentShape(Rectangle())
    }

    private var subtitle: String {
        var parts: [String] = []
        parts.append(showsDate ? Format.dateTime(trade.entryDate) : Format.time(trade.entryDate))
        if let duration = trade.record().holdingDuration { parts.append(Format.duration(duration)) }
        return parts.joined(separator: " · ")
    }
}
