import SwiftUI

/// Abgerundete Karte mit weichem Schatten (hell) bzw. feiner Kontur (dunkel).
struct Card<Content: View>: View {
    var padding: CGFloat = Theme.cardPadding
    var interactive: Bool = false
    @ViewBuilder var content: () -> Content

    @Environment(\.colorScheme) private var colorScheme
    @State private var hovering = false

    var body: some View {
        content()
            .padding(padding)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(cardShape.fill(Color.cardBackground))
            .overlay(cardShape.strokeBorder(strokeColor, lineWidth: 0.5))
            .shadow(color: shadowColor, radius: hovering ? 14 : 8, y: hovering ? 5 : 2)
            .scaleEffect(interactive && hovering ? 1.008 : 1)
            .onHover { isHovering in
                guard interactive else { return }
                withAnimation(Theme.quickSpring) { hovering = isHovering }
            }
    }

    private var cardShape: RoundedRectangle {
        RoundedRectangle(cornerRadius: Theme.Radius.card, style: .continuous)
    }

    private var strokeColor: Color {
        colorScheme == .dark ? Color.white.opacity(0.07) : Color.black.opacity(0.04)
    }

    private var shadowColor: Color {
        colorScheme == .dark ? Color.black.opacity(0.35) : Color.black.opacity(0.06)
    }
}

/// Karte mit Titelzeile.
struct TitledCard<Content: View, Trailing: View>: View {
    let title: LocalizedStringKey
    var subtitle: LocalizedStringKey? = nil
    var systemImage: String? = nil
    @ViewBuilder var trailing: () -> Trailing
    @ViewBuilder var content: () -> Content

    init(
        _ title: LocalizedStringKey,
        subtitle: LocalizedStringKey? = nil,
        systemImage: String? = nil,
        @ViewBuilder trailing: @escaping () -> Trailing,
        @ViewBuilder content: @escaping () -> Content
    ) {
        self.title = title
        self.subtitle = subtitle
        self.systemImage = systemImage
        self.trailing = trailing
        self.content = content
    }

    var body: some View {
        Card {
            VStack(alignment: .leading, spacing: Theme.Spacing.l) {
                HStack(alignment: .firstTextBaseline) {
                    VStack(alignment: .leading, spacing: 2) {
                        HStack(spacing: 6) {
                            if let systemImage {
                                Image(systemName: systemImage)
                                    .foregroundStyle(Color.accentColor)
                                    .font(.subheadline.weight(.semibold))
                            }
                            Text(title).font(.cardTitle)
                        }
                        if let subtitle {
                            Text(subtitle).font(.footnote).foregroundStyle(.secondary)
                        }
                    }
                    Spacer(minLength: Theme.Spacing.s)
                    trailing()
                }
                content()
            }
        }
    }
}

extension TitledCard where Trailing == EmptyView {
    init(
        _ title: LocalizedStringKey,
        subtitle: LocalizedStringKey? = nil,
        systemImage: String? = nil,
        @ViewBuilder content: @escaping () -> Content
    ) {
        self.init(title, subtitle: subtitle, systemImage: systemImage, trailing: { EmptyView() }, content: content)
    }
}
