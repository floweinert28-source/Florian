import Foundation
import SwiftData

/// Sprachnotiz mit Transkript und Stimmungswert.
@Model
final class VoiceNote {
    var id: UUID = UUID()
    @Attribute(.externalStorage) var audioData: Data?
    var duration: TimeInterval = 0
    var transcript: String = ""
    /// −1 (negativ) … +1 (positiv); `nil` = nicht bestimmbar.
    var sentimentScore: Double?
    var createdAt: Date = Date()
    var trade: Trade?

    init(audioData: Data?, duration: TimeInterval, transcript: String = "", sentimentScore: Double? = nil) {
        self.audioData = audioData
        self.duration = duration
        self.transcript = transcript
        self.sentimentScore = sentimentScore
    }
}
