import Foundation
import Speech

enum SpeechTranscriptionError: LocalizedError {
    case notAuthorized
    case recognizerUnavailable
    case onDeviceUnavailable
    case failed(String)

    var errorDescription: String? {
        switch self {
        case .notAuthorized: String(localized: "Keine Berechtigung für die Spracherkennung. Bitte in den Systemeinstellungen erlauben.")
        case .recognizerUnavailable: String(localized: "Die Spracherkennung ist gerade nicht verfügbar.")
        case .onDeviceUnavailable: String(localized: "Die Spracherkennung auf dem Gerät ist für diese Sprache nicht verfügbar. Lade die Sprache in den Systemeinstellungen unter Diktat herunter.")
        case .failed(let message): message
        }
    }
}

/// Transkribiert Audiodateien ausschließlich auf dem Gerät.
enum SpeechTranscriptionService {
    static func requestAuthorization() async -> Bool {
        await withCheckedContinuation { continuation in
            SFSpeechRecognizer.requestAuthorization { status in
                continuation.resume(returning: status == .authorized)
            }
        }
    }

    static func transcribe(fileURL: URL, locale: Locale = Locale(identifier: "de-DE")) async throws -> String {
        guard await requestAuthorization() else { throw SpeechTranscriptionError.notAuthorized }
        guard let recognizer = SFSpeechRecognizer(locale: locale), recognizer.isAvailable else {
            throw SpeechTranscriptionError.recognizerUnavailable
        }
        guard recognizer.supportsOnDeviceRecognition else {
            throw SpeechTranscriptionError.onDeviceUnavailable
        }

        let request = SFSpeechURLRecognitionRequest(url: fileURL)
        request.requiresOnDeviceRecognition = true
        request.shouldReportPartialResults = false
        request.addsPunctuation = true

        let guardBox = CompletionGuard()
        return try await withCheckedThrowingContinuation { continuation in
            recognizer.recognitionTask(with: request) { result, error in
                if let error {
                    guard guardBox.markFinished() else { return }
                    continuation.resume(throwing: SpeechTranscriptionError.failed(error.localizedDescription))
                    return
                }
                if let result, result.isFinal {
                    guard guardBox.markFinished() else { return }
                    continuation.resume(returning: result.bestTranscription.formattedString)
                }
            }
        }
    }
}

/// Stellt sicher, dass eine Continuation genau einmal fortgesetzt wird.
private final class CompletionGuard: @unchecked Sendable {
    private let lock = NSLock()
    private var finished = false

    /// Liefert `true` beim ersten Aufruf, danach `false`.
    func markFinished() -> Bool {
        lock.lock()
        defer { lock.unlock() }
        if finished { return false }
        finished = true
        return true
    }
}
