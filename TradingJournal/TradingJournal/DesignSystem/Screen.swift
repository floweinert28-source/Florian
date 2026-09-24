import SwiftUI

/// Scrollender Bildschirm mit gruppiertem Hintergrund und begrenzter Inhaltsbreite.
struct Screen<Content: View>: View {
    var spacing: CGFloat = Theme.Spacing.xl
    @ViewBuilder var content: () -> Content

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: spacing) {
                content()
            }
            .padding(.horizontal, Theme.Spacing.l)
            .padding(.vertical, Theme.Spacing.l)
            .frame(maxWidth: Theme.contentMaxWidth)
            .frame(maxWidth: .infinity)
        }
        .scrollBounceBehavior(.basedOnSize)
        .background(Color.screenBackground)
    }
}

/// Zwei Spalten auf breiten Displays, untereinander auf dem iPhone.
struct AdaptiveColumns<Content: View>: View {
    var spacing: CGFloat = Theme.Spacing.l
    @ViewBuilder var content: () -> Content

    #if os(iOS)
    @Environment(\.horizontalSizeClass) private var sizeClass
    #endif

    var body: some View {
        if isWide {
            HStack(alignment: .top, spacing: spacing) { content() }
        } else {
            VStack(alignment: .leading, spacing: spacing) { content() }
        }
    }

    private var isWide: Bool {
        #if os(iOS)
        return sizeClass == .regular
        #else
        return true
        #endif
    }
}

/// Segment-Auswahl im Apple-Stil, die auf dem iPhone scrollt, wenn sie zu breit wird.
struct SegmentPicker<Option: Hashable & Identifiable>: View {
    let options: [Option]
    @Binding var selection: Option
    let title: (Option) -> String

    var body: some View {
        Picker("", selection: $selection) {
            ForEach(options) { option in
                Text(title(option)).tag(option)
            }
        }
        .pickerStyle(.segmented)
        .labelsHidden()
    }
}
