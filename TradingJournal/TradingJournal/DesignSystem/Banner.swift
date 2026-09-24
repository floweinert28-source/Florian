import SwiftUI

/// Hinweis-Banner (z. B. Tilt-Warnung).
struct BannerView: View {
    enum Style {
        case notice, warning, critical

        var tint: Color {
            switch self {
            case .notice: .accentColor
            case .warning: Color.warning
            case .critical: .loss
            }
        }

        var systemImage: String {
            switch self {
            case .notice: "info.circle.fill"
            case .warning: "exclamationmark.triangle.fill"
            case .critical: "hand.raised.fill"
            }
        }
    }

    let style: Style
    let title: String
    let message: String
    var onDismiss: (() -> Void)? = nil

    var body: some View {
        HStack(alignment: .top, spacing: Theme.Spacing.m) {
            Image(systemName: style.systemImage)
                .font(.title3)
                .foregroundStyle(style.tint)
                .padding(.top, 1)
            VStack(alignment: .leading, spacing: 3) {
                Text(title).font(.subheadline.weight(.semibold))
                Text(message).font(.footnote).foregroundStyle(.secondary).fixedSize(horizontal: false, vertical: true)
            }
            Spacer(minLength: 0)
            if let onDismiss {
                Button(action: onDismiss) {
                    Image(systemName: "xmark")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(.secondary)
                        .padding(6)
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Ausblenden")
            }
        }
        .padding(Theme.Spacing.l)
        .background(
            RoundedRectangle(cornerRadius: Theme.Radius.tile, style: .continuous)
                .fill(style.tint.opacity(0.12))
        )
        .overlay(
            RoundedRectangle(cornerRadius: Theme.Radius.tile, style: .continuous)
                .strokeBorder(style.tint.opacity(0.25), lineWidth: 0.5)
        )
    }
}
