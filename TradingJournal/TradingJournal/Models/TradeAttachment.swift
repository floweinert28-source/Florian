import Foundation
import SwiftData

/// Chart-Screenshot zu einem Trade.
@Model
final class TradeAttachment {
    var id: UUID = UUID()
    @Attribute(.externalStorage) var imageData: Data?
    var caption: String = ""
    var createdAt: Date = Date()
    var trade: Trade?

    init(imageData: Data, caption: String = "") {
        self.imageData = imageData
        self.caption = caption
    }
}
