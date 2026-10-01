import Foundation
import SwiftData
import JournalCore

/// Findet oder erstellt Tags und Regeln anhand ihres Namens.
@MainActor
struct TagResolver {
    let context: ModelContext
    private var tags: [String: Tag] = [:]
    private var rules: [String: TradingRule] = [:]

    init(context: ModelContext) {
        self.context = context
        if let existing = try? context.fetch(FetchDescriptor<Tag>()) {
            for tag in existing { tags[Self.key(tag.name, tag.kind)] = tag }
        }
        if let existing = try? context.fetch(FetchDescriptor<TradingRule>()) {
            for rule in existing { rules[rule.title.lowercased()] = rule }
        }
    }

    private static func key(_ name: String, _ kind: TagKind) -> String {
        "\(kind.rawValue)|\(name.trimmingCharacters(in: .whitespaces).lowercased())"
    }

    mutating func tag(named name: String, kind: TagKind, isSample: Bool = false) -> Tag {
        let trimmed = name.trimmingCharacters(in: .whitespaces)
        let key = Self.key(trimmed, kind)
        if let existing = tags[key] { return existing }
        let tag = Tag(name: trimmed, kind: kind, isSample: isSample)
        context.insert(tag)
        tags[key] = tag
        return tag
    }

    mutating func rule(titled title: String, sortOrder: Int, isSample: Bool = false) -> TradingRule {
        let key = title.lowercased()
        if let existing = rules[key] { return existing }
        let rule = TradingRule(title: title, sortOrder: sortOrder, isSample: isSample)
        context.insert(rule)
        rules[key] = rule
        return rule
    }

    /// Verknüpft Tags und Regeln eines Entwurfs mit einem Trade.
    mutating func link(_ draft: TradeDraft, to trade: Trade, isSample: Bool = false) {
        var linked: [Tag] = []
        if let setup = draft.setup, !setup.isEmpty { linked.append(tag(named: setup, kind: .setup, isSample: isSample)) }
        if let strategy = draft.strategy, !strategy.isEmpty { linked.append(tag(named: strategy, kind: .strategy, isSample: isSample)) }
        if let phase = draft.marketPhase, !phase.isEmpty { linked.append(tag(named: phase, kind: .marketPhase, isSample: isSample)) }
        for mistake in draft.mistakes { linked.append(tag(named: mistake, kind: .mistake, isSample: isSample)) }
        for emotion in draft.emotions { linked.append(tag(named: emotion, kind: .emotion, isSample: isSample)) }
        trade.tags = linked
        trade.brokenRules = draft.brokenRules.enumerated().map { index, title in rule(titled: title, sortOrder: index, isSample: isSample) }
    }
}
