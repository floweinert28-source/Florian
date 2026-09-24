import Foundation
import NaturalLanguage

enum SentimentLabel {
    case negative, neutral, positive

    var title: String {
        switch self {
        case .negative: String(localized: "Angespannt")
        case .neutral: String(localized: "Neutral")
        case .positive: String(localized: "Zuversichtlich")
        }
    }

    var systemImage: String {
        switch self {
        case .negative: "cloud.rain"
        case .neutral: "cloud"
        case .positive: "sun.max"
        }
    }
}

/// On-Device-Stimmungsanalyse mit dem NaturalLanguage-Framework.
enum SentimentService {
    /// Mittlerer Stimmungswert über alle Sätze (−1 … 1). `nil` bei leerem oder nicht auswertbarem Text.
    static func score(for text: String) -> Double? {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return nil }
        let tagger = NLTagger(tagSchemes: [.sentimentScore])
        tagger.string = trimmed
        var scores: [Double] = []
        tagger.enumerateTags(in: trimmed.startIndex..<trimmed.endIndex, unit: .paragraph, scheme: .sentimentScore, options: []) { tag, _ in
            if let raw = tag?.rawValue, let value = Double(raw) {
                scores.append(value)
            }
            return true
        }
        guard !scores.isEmpty else { return nil }
        return scores.reduce(0, +) / Double(scores.count)
    }

    static func label(for score: Double) -> SentimentLabel {
        switch score {
        case ..<(-0.2): .negative
        case ...0.2: .neutral
        default: .positive
        }
    }
}
