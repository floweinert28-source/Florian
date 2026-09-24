import Foundation
import SwiftData
import JournalCore

/// Tages-Check-in: Schlaf, Stress, Stimmung.
@Model
final class DailyCheckIn {
    var id: UUID = UUID()
    /// Tagesbeginn.
    var date: Date = Date()
    var sleepHours: Double = 7
    /// 1 (entspannt) … 5 (sehr gestresst)
    var stressLevel: Int = 2
    /// 1 (schlecht) … 5 (sehr gut)
    var mood: Int = 3
    var note: String = ""
    var isSample: Bool = false

    init(date: Date, sleepHours: Double = 7, stressLevel: Int = 2, mood: Int = 3, note: String = "", isSample: Bool = false) {
        self.date = Calendar.current.startOfDay(for: date)
        self.sleepHours = sleepHours
        self.stressLevel = stressLevel
        self.mood = mood
        self.note = note
        self.isSample = isSample
    }

    var draft: CheckInDraft {
        CheckInDraft(date: date, sleepHours: sleepHours, stressLevel: stressLevel, mood: mood, note: note)
    }
}
