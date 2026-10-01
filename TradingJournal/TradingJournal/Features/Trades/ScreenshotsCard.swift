import SwiftUI
import SwiftData
import PhotosUI
import UniformTypeIdentifiers

/// Chart-Screenshots: Drag & Drop, Fotos, Dateien.
struct ScreenshotsCard: View {
    @Environment(\.modelContext) private var modelContext
    let trade: Trade
    @State private var isTargeted = false
    @State private var photoItems: [PhotosPickerItem] = []
    @State private var showFileImporter = false
    @State private var selectedAttachment: TradeAttachment?

    var body: some View {
        TitledCard("Screenshots", subtitle: "Charts per Drag & Drop hinzufügen", systemImage: "photo.on.rectangle") {
            HStack(spacing: Theme.Spacing.s) {
                PhotosPicker(selection: $photoItems, maxSelectionCount: 5, matching: .images) {
                    Label("Foto", systemImage: "photo.badge.plus")
                }
                Button {
                    showFileImporter = true
                } label: {
                    Label("Datei", systemImage: "folder")
                }
            }
            .buttonStyle(.bordered)
            .controlSize(.small)
            .labelStyle(.titleAndIcon)
        } content: {
            let attachments = trade.sortedAttachments
            Group {
                if attachments.isEmpty {
                    dropZone
                } else {
                    ScrollView(.horizontal, showsIndicators: false) {
                        LazyHStack(spacing: Theme.Spacing.m) {
                            ForEach(attachments) { attachment in
                                AttachmentThumbnail(attachment: attachment)
                                    .onTapGesture { selectedAttachment = attachment }
                                    .contextMenu {
                                        Button("Löschen", systemImage: "trash", role: .destructive) { delete(attachment) }
                                    }
                            }
                        }
                        .padding(.vertical, 2)
                    }
                    .frame(height: 130)
                }
            }
            .overlay {
                if isTargeted {
                    RoundedRectangle(cornerRadius: Theme.Radius.tile, style: .continuous)
                        .strokeBorder(Color.accentColor, style: StrokeStyle(lineWidth: 2, dash: [6, 4]))
                        .background(RoundedRectangle(cornerRadius: Theme.Radius.tile, style: .continuous).fill(Color.accentColor.opacity(0.08)))
                }
            }
            .animation(Theme.quickSpring, value: isTargeted)
        }
        .dropDestination(for: DroppedImage.self) { items, _ in
            for item in items { add(imageData: item.data) }
            return !items.isEmpty
        } isTargeted: { targeted in
            isTargeted = targeted
        }
        .fileImporter(isPresented: $showFileImporter, allowedContentTypes: [.image], allowsMultipleSelection: true) { result in
            guard case .success(let urls) = result else { return }
            for url in urls {
                let scoped = url.startAccessingSecurityScopedResource()
                defer { if scoped { url.stopAccessingSecurityScopedResource() } }
                if let data = try? Data(contentsOf: url) { add(imageData: data) }
            }
        }
        .onChange(of: photoItems) { _, items in
            guard !items.isEmpty else { return }
            Task {
                for item in items {
                    if let data = try? await item.loadTransferable(type: Data.self) {
                        add(imageData: data)
                    }
                }
                photoItems = []
            }
        }
        .sheet(item: $selectedAttachment) { attachment in
            AttachmentViewer(attachment: attachment)
        }
    }

    private var dropZone: some View {
        VStack(spacing: 8) {
            Image(systemName: "arrow.down.doc")
                .font(.title2)
                .foregroundStyle(Color.accentColor)
            Text("Chart hierher ziehen")
                .font(.subheadline.weight(.medium))
            Text("PNG oder JPEG, auch direkt aus der Chart-Software")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, minHeight: 110)
        .background(
            RoundedRectangle(cornerRadius: Theme.Radius.tile, style: .continuous)
                .fill(Color.subtleFill)
        )
    }

    private func add(imageData: Data) {
        withAnimation(Theme.spring) {
            let attachment = TradeAttachment(imageData: imageData)
            modelContext.insert(attachment)
            attachment.trade = trade
            trade.updatedAt = Date()
            try? modelContext.save()
        }
        Haptics.success()
    }

    private func delete(_ attachment: TradeAttachment) {
        withAnimation(Theme.spring) {
            modelContext.delete(attachment)
            try? modelContext.save()
        }
    }
}

/// Miniaturansicht eines Screenshots.
private struct AttachmentThumbnail: View {
    let attachment: TradeAttachment
    @State private var image: Image?

    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: Theme.Radius.thumbnail, style: .continuous)
                .fill(Color.subtleFill)
            if let image {
                image
                    .resizable()
                    .scaledToFill()
            } else {
                ProgressView().controlSize(.small)
            }
        }
        .frame(width: 190, height: 120)
        .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.thumbnail, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: Theme.Radius.thumbnail, style: .continuous)
                .strokeBorder(Color.primary.opacity(0.08), lineWidth: 0.5)
        )
        .contentShape(RoundedRectangle(cornerRadius: Theme.Radius.thumbnail, style: .continuous))
        .task(id: attachment.id) {
            guard let data = attachment.imageData else { return }
            image = Image(data: data)
        }
    }
}

/// Großansicht eines Screenshots mit Bildunterschrift.
private struct AttachmentViewer: View {
    @Environment(\.dismiss) private var dismiss
    @Bindable var attachment: TradeAttachment

    var body: some View {
        NavigationStack {
            VStack(spacing: Theme.Spacing.m) {
                if let data = attachment.imageData, let image = Image(data: data) {
                    image
                        .resizable()
                        .scaledToFit()
                        .clipShape(RoundedRectangle(cornerRadius: Theme.Radius.tile, style: .continuous))
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                }
                TextField("Bildunterschrift", text: $attachment.caption)
                    .textFieldStyle(.roundedBorder)
            }
            .padding()
            .background(Color.screenBackground)
            .navigationTitle("Screenshot")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Fertig") { dismiss() }
                        .keyboardShortcut(.defaultAction)
                }
            }
        }
        .sheetFrame(minWidth: 760, minHeight: 560)
    }
}
