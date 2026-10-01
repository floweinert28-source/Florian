import SwiftUI

/// Kleine Kapsel für Tags.
struct TagChip: View {
    let text: String
    var tint: Color = .accentColor
    var systemImage: String? = nil
    var selected: Bool = true

    var body: some View {
        HStack(spacing: 4) {
            if let systemImage {
                Image(systemName: systemImage).font(.caption2.weight(.semibold))
            }
            Text(text).font(.caption.weight(.medium)).lineLimit(1)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .foregroundStyle(selected ? tint : .secondary)
        .background(
            RoundedRectangle(cornerRadius: Theme.Radius.chip, style: .continuous)
                .fill(selected ? tint.opacity(0.16) : Color.elevatedFill)
        )
    }
}

/// Auswählbarer Chip (Mehrfachauswahl).
struct SelectableChip: View {
    let text: String
    let isSelected: Bool
    var tint: Color = .accentColor
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 4) {
                if isSelected {
                    Image(systemName: "checkmark").font(.caption2.weight(.bold))
                }
                Text(text).font(.subheadline.weight(.medium))
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 7)
            .foregroundStyle(isSelected ? Color.white : Color.primary)
            .background(RoundedRectangle(cornerRadius: Theme.Radius.control, style: .continuous).fill(isSelected ? tint : Color.elevatedFill))
            .overlay(RoundedRectangle(cornerRadius: Theme.Radius.control, style: .continuous).strokeBorder(isSelected ? Color.clear : Color.cardBorder, lineWidth: 1))
        }
        .buttonStyle(.plain)
        .animation(Theme.quickSpring, value: isSelected)
    }
}

/// Richtungs-Badge (Long/Short).
struct DirectionBadge: View {
    let isLong: Bool

    var body: some View {
        Text(isLong ? "LONG" : "SHORT")
            .font(.system(size: 9, weight: .bold))
            .padding(.horizontal, 6)
            .padding(.vertical, 3)
            .foregroundStyle(isLong ? Color.profit : Color.loss)
            .background(
                RoundedRectangle(cornerRadius: 5, style: .continuous)
                    .fill((isLong ? Color.profit : Color.loss).opacity(0.16))
            )
            .accessibilityLabel(Text(isLong ? "Long" : "Short"))
    }
}
