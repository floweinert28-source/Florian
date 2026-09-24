import Foundation
import SwiftData

/// Persönliche Handelsregel.
@Model
final class TradingRule {
    var id: UUID = UUID()
    var title: String = ""
    var details: String = ""
    var isActive: Bool = true
    var sortOrder: Int = 0
    var isSample: Bool = false
    var createdAt: Date = Date()

    /// Trades, bei denen diese Regel gebrochen wurde.
    var violations: [Trade]?

    init(title: String, details: String = "", sortOrder: Int = 0, isSample: Bool = false) {
        self.title = title
        self.details = details
        self.sortOrder = sortOrder
        self.isSample = isSample
    }

    var violationCount: Int { violations?.count ?? 0 }
}
