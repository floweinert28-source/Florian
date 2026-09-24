import SwiftUI

/// Flache Karte mit feiner Kontur, wie in modernen Analyse-Dashboards.
struct Card<Content: View>: View {
    var padding: CGFloat = Theme.cardPadding
    var interactive: Bool = false
    @ViewBuilder var content: () -> Content

    @State private var hovering = false

    var body: some View {
        content()
            .padding(padding)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(cardShape.fill(Color.cardBackground))
            .overlay(cardShape.strokeBorder(hovering && interactive ? Color.accentColor.opacity(0.5) : Color.cardBorder, lineWidth: 1))
            .onHover { isHovering in
                guard interactive else { return }
                withAnimation(Theme.quickSpring) { hovering = isHovering }
            }
    }

    private var cardShape: RoundedRectangle {
        RoundedRectangle(cornerRadius: Theme.Radius.card, style: .continuous)
    }
}

/// Karte mit Titelzeile: kleiner, kräftiger Titel, optionaler Untertitel, rechts Aktionen.
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
                                    .foregroundStyle(.secondary)
                                    .font(.caption.weight(.semibold))
                            }
                            Text(title).font(.cardTitle)
                        }
                        if let subtitle {
                            Text(subtitle).font(.caption).foregroundStyle(.secondary)
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
