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
        .padding(.horizontal, 9)
        .padding(.vertical, 5)
        .foregroundStyle(selected ? tint : .secondary)
        .background(
            Capsule().fill(selected ? tint.opacity(0.14) : Color.subtleFill)
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
            .background(Capsule().fill(isSelected ? tint : Color.subtleFill))
        }
        .buttonStyle(.plain)
        .animation(Theme.quickSpring, value: isSelected)
    }
}

/// Richtungs-Badge (Long/Short).
struct DirectionBadge: View {
    let isLong: Bool

    var body: some View {
        Text(isLong ? "L" : "S")
            .font(.caption.weight(.bold))
            .frame(width: 26, height: 26)
            .foregroundStyle(isLong ? Color.profit : Color.loss)
            .background(
                RoundedRectangle(cornerRadius: 7, style: .continuous)
                    .fill((isLong ? Color.profit : Color.loss).opacity(0.14))
            )
            .accessibilityLabel(Text(isLong ? "Long" : "Short"))
    }
}
