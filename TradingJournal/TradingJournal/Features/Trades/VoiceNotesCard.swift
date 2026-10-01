import SwiftUI
import SwiftData

/// Sprachnotizen: Aufnahme, On-Device-Transkription, Stimmung.
struct VoiceNotesCard: View {
    @Environment(\.modelContext) private var modelContext
    let trade: Trade
    @State private var recorder = AudioRecorderService()
    @State private var player = AudioPlayerService()
    @State private var isProcessing = false
    @State private var errorMessage: String?

    var body: some View {
        TitledCard("Sprachnotizen", subtitle: "Aufnahme, Transkription und Stimmung – alles auf dem Gerät", systemImage: "waveform") {
            recordButton
        } content: {
            let notes = trade.sortedVoiceNotes
            VStack(alignment: .leading, spacing: Theme.Spacing.m) {
                if recorder.isRecording {
                    HStack(spacing: 8) {
                        Circle().fill(Color.loss).frame(width: 8, height: 8)
                        Text("Aufnahme läuft")
                        Text(elapsedText)
                            .numeric()
                            .foregroundStyle(.secondary)
                    }
                    .font(.subheadline)
                }
                if isProcessing {
                    HStack(spacing: 8) {
                        ProgressView().controlSize(.small)
                        Text("Wird transkribiert …").font(.subheadline).foregroundStyle(.secondary)
                    }
                }
                if let errorMessage {
                    Text(errorMessage).font(.footnote).foregroundStyle(Color.loss)
                }
                if notes.isEmpty, !recorder.isRecording, !isProcessing {
                    Text("Sprich nach dem Trade kurz ein, was du gedacht und gefühlt hast. Das Journal transkribiert die Notiz und schätzt die Stimmung.")
                        .font(.explanation)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
                ForEach(notes) { note in
                    VoiceNoteRow(note: note, player: player) {
                        delete(note)
                    }
                    if note.id != notes.last?.id { Divider() }
                }
            }
        }
        .onDisappear { player.stop() }
    }

    private var elapsedText: String {
        let seconds = Int(recorder.elapsed)
        return String(format: "%d:%02d", seconds / 60, seconds % 60)
    }

    private var recordButton: some View {
        Button {
            if recorder.isRecording {
                finishRecording()
            } else {
                startRecording()
            }
        } label: {
            Label(recorder.isRecording ? "Stopp" : "Aufnehmen", systemImage: recorder.isRecording ? "stop.circle.fill" : "mic.circle.fill")
        }
        .buttonStyle(.bordered)
        .tint(recorder.isRecording ? .loss : .accentColor)
        .controlSize(.small)
        .disabled(isProcessing)
    }

    private func startRecording() {
        errorMessage = nil
        Task {
            guard await recorder.requestPermission() else {
                errorMessage = String(localized: "Kein Zugriff auf das Mikrofon. Bitte in den Systemeinstellungen erlauben.")
                return
            }
            do {
                try recorder.start()
                Haptics.impact()
            } catch {
                errorMessage = error.localizedDescription
            }
        }
    }

    private func finishRecording() {
        guard let result = recorder.stop() else { return }
        Haptics.impact()
        isProcessing = true
        Task {
            defer { isProcessing = false }
            let data = try? Data(contentsOf: result.url)
            let note = VoiceNote(audioData: data, duration: result.duration)
            modelContext.insert(note)
            note.trade = trade
            try? modelContext.save()
            do {
                let transcript = try await SpeechTranscriptionService.transcribe(fileURL: result.url)
                note.transcript = transcript
                note.sentimentScore = SentimentService.score(for: transcript)
            } catch {
                errorMessage = error.localizedDescription
            }
            trade.updatedAt = Date()
            try? modelContext.save()
            try? FileManager.default.removeItem(at: result.url)
        }
    }

    private func delete(_ note: VoiceNote) {
        withAnimation(Theme.spring) {
            if player.playingID == note.id { player.stop() }
            modelContext.delete(note)
            try? modelContext.save()
        }
    }
}

private struct VoiceNoteRow: View {
    let note: VoiceNote
    let player: AudioPlayerService
    let onDelete: () -> Void

    var body: some View {
        HStack(alignment: .top, spacing: Theme.Spacing.m) {
            Button {
                if let data = note.audioData { player.toggle(id: note.id, data: data) }
            } label: {
                Image(systemName: player.playingID == note.id ? "pause.circle.fill" : "play.circle.fill")
                    .font(.system(size: 30))
                    .foregroundStyle(Color.accentColor)
            }
            .buttonStyle(.plain)
            .disabled(note.audioData == nil)

            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 8) {
                    Text(Format.dateTime(note.createdAt)).font(.caption).foregroundStyle(.secondary)
                    Text(durationText).font(.caption).numeric().foregroundStyle(.tertiary)
                    if let score = note.sentimentScore {
                        let label = SentimentService.label(for: score)
                        TagChip(text: label.title, tint: tint(for: label), systemImage: label.systemImage)
                    }
                }
                if note.transcript.isEmpty {
                    Text("Keine Transkription verfügbar.")
                        .font(.subheadline)
                        .foregroundStyle(.tertiary)
                } else {
                    Text(note.transcript)
                        .font(.subheadline)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
            Spacer(minLength: 0)
            Button(role: .destructive, action: onDelete) {
                Image(systemName: "trash")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Sprachnotiz löschen")
        }
    }

    private var durationText: String {
        let seconds = Int(note.duration.rounded())
        return String(format: "%d:%02d", seconds / 60, seconds % 60)
    }

    private func tint(for label: SentimentLabel) -> Color {
        switch label {
        case .negative: .loss
        case .neutral: .secondary
        case .positive: .profit
        }
    }
}
