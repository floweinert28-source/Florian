import SwiftUI
import UniformTypeIdentifiers

#if os(macOS)
import AppKit
typealias PlatformImage = NSImage
#else
import UIKit
typealias PlatformImage = UIImage
#endif

extension Image {
    /// Erzeugt ein Bild aus Rohdaten, plattformunabhängig.
    init?(data: Data) {
        #if os(macOS)
        guard let image = NSImage(data: data) else { return nil }
        self.init(nsImage: image)
        #else
        guard let image = UIImage(data: data) else { return nil }
        self.init(uiImage: image)
        #endif
    }
}

extension View {
    /// Dezimal-Tastatur auf iOS, ohne Wirkung auf dem Mac.
    func decimalKeyboard() -> some View {
        #if os(iOS)
        return keyboardType(.decimalPad)
        #else
        return self
        #endif
    }

    /// Keine automatische Großschreibung (Symbole).
    func noAutocapitalization() -> some View {
        #if os(iOS)
        return textInputAutocapitalization(.never).autocorrectionDisabled()
        #else
        return autocorrectionDisabled()
        #endif
    }

    /// Standardgröße für Formular-Sheets auf dem Mac.
    func sheetFrame(minWidth: CGFloat = 520, minHeight: CGFloat = 560) -> some View {
        #if os(macOS)
        return frame(minWidth: minWidth, idealWidth: minWidth + 60, minHeight: minHeight, idealHeight: minHeight + 80)
        #else
        return self
        #endif
    }

    /// Hover-Hervorhebung für Listenzeilen auf dem Mac.
    func hoverHighlight() -> some View {
        modifier(HoverHighlight())
    }
}

private struct HoverHighlight: ViewModifier {
    @State private var hovering = false

    func body(content: Content) -> some View {
        content
            .background(
                RoundedRectangle(cornerRadius: Theme.Radius.control, style: .continuous)
                    .fill(Color.primary.opacity(hovering ? 0.05 : 0))
            )
            .onHover { isHovering in
                withAnimation(Theme.quickSpring) { hovering = isHovering }
            }
    }
}

/// Bilddaten aus Drag & Drop oder der Zwischenablage.
struct DroppedImage: Transferable {
    let data: Data

    static var transferRepresentation: some TransferRepresentation {
        DataRepresentation(importedContentType: .png) { DroppedImage(data: $0) }
        DataRepresentation(importedContentType: .jpeg) { DroppedImage(data: $0) }
        DataRepresentation(importedContentType: .heic) { DroppedImage(data: $0) }
        DataRepresentation(importedContentType: .image) { DroppedImage(data: $0) }
        FileRepresentation(importedContentType: .image) { received in
            DroppedImage(data: try Data(contentsOf: received.file))
        }
    }
}

/// Haptisches Feedback auf dem iPhone; ohne Wirkung auf anderen Geräten.
enum Haptics {
    static func success() {
        #if os(iOS)
        UINotificationFeedbackGenerator().notificationOccurred(.success)
        #endif
    }

    static func warning() {
        #if os(iOS)
        UINotificationFeedbackGenerator().notificationOccurred(.warning)
        #endif
    }

    static func selection() {
        #if os(iOS)
        UISelectionFeedbackGenerator().selectionChanged()
        #endif
    }

    static func impact() {
        #if os(iOS)
        UIImpactFeedbackGenerator(style: .light).impactOccurred()
        #endif
    }
}
