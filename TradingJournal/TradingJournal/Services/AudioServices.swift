import Foundation
import Observation
import AVFoundation

/// Nimmt Sprachnotizen als AAC (.m4a) auf.
@Observable
@MainActor
final class AudioRecorderService {
    private(set) var isRecording = false
    private(set) var elapsed: TimeInterval = 0
    @ObservationIgnored private var recorder: AVAudioRecorder?
    @ObservationIgnored private var timer: Timer?
    @ObservationIgnored private var startedAt: Date?

    func requestPermission() async -> Bool {
        #if os(iOS)
        return await AVAudioApplication.requestRecordPermission()
        #else
        return await AVCaptureDevice.requestAccess(for: .audio)
        #endif
    }

    func start() throws {
        #if os(iOS)
        let session = AVAudioSession.sharedInstance()
        try session.setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker])
        try session.setActive(true)
        #endif
        let url = FileManager.default.temporaryDirectory.appendingPathComponent("voice-\(UUID().uuidString).m4a")
        let settings: [String: Any] = [
            AVFormatIDKey: Int(kAudioFormatMPEG4AAC),
            AVSampleRateKey: 44_100,
            AVNumberOfChannelsKey: 1,
            AVEncoderAudioQualityKey: AVAudioQuality.high.rawValue,
        ]
        let recorder = try AVAudioRecorder(url: url, settings: settings)
        recorder.record()
        self.recorder = recorder
        startedAt = Date()
        elapsed = 0
        isRecording = true
        timer = Timer.scheduledTimer(withTimeInterval: 0.2, repeats: true) { [weak self] _ in
            Task { @MainActor in
                guard let self, let startedAt = self.startedAt else { return }
                self.elapsed = Date().timeIntervalSince(startedAt)
            }
        }
    }

    /// Beendet die Aufnahme und liefert Datei und Dauer.
    func stop() -> (url: URL, duration: TimeInterval)? {
        timer?.invalidate()
        timer = nil
        guard let recorder else { return nil }
        recorder.stop()
        let duration = startedAt.map { Date().timeIntervalSince($0) } ?? elapsed
        let url = recorder.url
        self.recorder = nil
        startedAt = nil
        isRecording = false
        #if os(iOS)
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
        #endif
        return (url, duration)
    }

    func cancel() {
        if let result = stop() {
            try? FileManager.default.removeItem(at: result.url)
        }
    }
}

/// Spielt Sprachnotizen ab.
@Observable
@MainActor
final class AudioPlayerService: NSObject, AVAudioPlayerDelegate {
    private(set) var playingID: UUID?
    @ObservationIgnored private var player: AVAudioPlayer?

    func toggle(id: UUID, data: Data) {
        if playingID == id {
            stop()
            return
        }
        stop()
        do {
            #if os(iOS)
            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
            try AVAudioSession.sharedInstance().setActive(true)
            #endif
            let player = try AVAudioPlayer(data: data)
            player.delegate = self
            player.play()
            self.player = player
            playingID = id
        } catch {
            playingID = nil
        }
    }

    func stop() {
        player?.stop()
        player = nil
        playingID = nil
    }

    nonisolated func audioPlayerDidFinishPlaying(_ player: AVAudioPlayer, successfully flag: Bool) {
        Task { @MainActor in
            self.playingID = nil
            self.player = nil
        }
    }
}
