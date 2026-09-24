import Foundation
import SwiftData
import SwiftUI
import Charts
import JournalCore
#if os(macOS)
import AppKit
#else
import UIKit
#endif

/// Legt Beispieldaten an oder entfernt sie wieder. Alle Beispielobjekte tragen `isSample == true`.
@MainActor
enum SampleDataService {
    static func isInstalled(in context: ModelContext) -> Bool {
        var descriptor = FetchDescriptor<Trade>(predicate: #Predicate { $0.isSample })
        descriptor.fetchLimit = 1
        return ((try? context.fetchCount(descriptor)) ?? 0) > 0
    }

    static func install(into context: ModelContext, settings: SettingsStore) throws {
        let generator = SampleDataGenerator(seed: 2024, now: Date(), calendar: .current, accountSize: settings.accountSize)
        let dataSet = generator.generate()
        var resolver = TagResolver(context: context)

        for tag in dataSet.tags {
            _ = resolver.tag(named: tag.name, kind: tag.kind, isSample: true)
        }
        for (index, title) in dataSet.rules.enumerated() {
            _ = resolver.rule(titled: title, sortOrder: index, isSample: true)
        }

        var screenshotBudget = 14
        for (index, draft) in dataSet.trades.enumerated() {
            let trade = Trade(symbol: draft.symbol)
            trade.apply(draft)
            trade.isSample = true
            context.insert(trade)
            resolver.link(draft, to: trade, isSample: true)

            // Einige Trades bekommen einen gerenderten Beispiel-Chart als Screenshot.
            if screenshotBudget > 0, index % 9 == 3 || draft.exitDate == nil {
                if let data = SampleChartImage.pngData(for: draft, seed: UInt64(index)) {
                    let attachment = TradeAttachment(imageData: data, caption: String(localized: "Beispiel-Chart"))
                    context.insert(attachment)
                    attachment.trade = trade
                    screenshotBudget -= 1
                }
            }
        }

        for checkIn in dataSet.checkIns {
            context.insert(DailyCheckIn(date: checkIn.date, sleepHours: checkIn.sleepHours, stressLevel: checkIn.stressLevel, mood: checkIn.mood, note: checkIn.note, isSample: true))
        }
        for regime in dataSet.regimes {
            context.insert(MarketRegimeEntry(date: regime.date, regime: regime.regime, source: regime.source, isSample: true))
        }
        for draft in dataSet.missedTrades {
            let missed = MissedTrade(symbol: draft.symbol)
            missed.apply(draft)
            missed.isSample = true
            context.insert(missed)
        }
        try context.save()
    }

    static func remove(from context: ModelContext) throws {
        // Einzeln löschen, damit Kaskaden (Screenshots, Sprachnotizen) greifen.
        for trade in try context.fetch(FetchDescriptor<Trade>(predicate: #Predicate { $0.isSample })) {
            context.delete(trade)
        }
        for checkIn in try context.fetch(FetchDescriptor<DailyCheckIn>(predicate: #Predicate { $0.isSample })) {
            context.delete(checkIn)
        }
        for regime in try context.fetch(FetchDescriptor<MarketRegimeEntry>(predicate: #Predicate { $0.isSample })) {
            context.delete(regime)
        }
        for missed in try context.fetch(FetchDescriptor<MissedTrade>(predicate: #Predicate { $0.isSample })) {
            context.delete(missed)
        }
        try context.save()

        // Beispiel-Tags und -Regeln nur entfernen, wenn sie an keinen eigenen Trades hängen.
        let tags = try context.fetch(FetchDescriptor<Tag>(predicate: #Predicate { $0.isSample }))
        for tag in tags where (tag.trades ?? []).isEmpty {
            context.delete(tag)
        }
        let rules = try context.fetch(FetchDescriptor<TradingRule>(predicate: #Predicate { $0.isSample }))
        for rule in rules where (rule.violations ?? []).isEmpty {
            context.delete(rule)
        }
        try context.save()
    }

    /// Löscht sämtliche Daten des Journals.
    static func deleteEverything(in context: ModelContext) throws {
        for trade in try context.fetch(FetchDescriptor<Trade>()) { context.delete(trade) }
        for tag in try context.fetch(FetchDescriptor<Tag>()) { context.delete(tag) }
        for rule in try context.fetch(FetchDescriptor<TradingRule>()) { context.delete(rule) }
        for checkIn in try context.fetch(FetchDescriptor<DailyCheckIn>()) { context.delete(checkIn) }
        for regime in try context.fetch(FetchDescriptor<MarketRegimeEntry>()) { context.delete(regime) }
        for missed in try context.fetch(FetchDescriptor<MissedTrade>()) { context.delete(missed) }
        try context.save()
    }
}

/// Rendert einen kleinen Kerzenchart als PNG, damit Beispiel-Trades Screenshots haben.
@MainActor
enum SampleChartImage {
    static func pngData(for draft: TradeDraft, seed: UInt64) -> Data? {
        let view = SampleChartView(draft: draft, seed: seed)
            .frame(width: 640, height: 360)
        let renderer = ImageRenderer(content: view)
        renderer.scale = 2
        guard let cgImage = renderer.cgImage else { return nil }
        #if os(macOS)
        let rep = NSBitmapImageRep(cgImage: cgImage)
        return rep.representation(using: .png, properties: [:])
        #else
        return UIImage(cgImage: cgImage).pngData()
        #endif
    }
}

private struct SampleChartView: View {
    let draft: TradeDraft
    let seed: UInt64

    private struct Candle: Identifiable {
        let id: Int
        let open: Double
        let close: Double
        let high: Double
        let low: Double
    }

    private var candles: [Candle] {
        var rng = SeededRandomNumberGenerator(seed: seed &+ 99)
        let range = abs((draft.plan?.riskPerUnit ?? draft.entryPrice * 0.002)) * 1.2
        var price = draft.entryPrice - range * 2 * draft.direction.sign
        var result: [Candle] = []
        for index in 0..<40 {
            let drift = index > 22 ? (draft.netPnL >= 0 ? 0.35 : -0.25) * draft.direction.sign : 0.1 * draft.direction.sign
            let move = rng.nextGaussian(mean: drift, standardDeviation: 1) * range * 0.4
            let open = price
            let close = price + move
            let high = max(open, close) + abs(rng.nextGaussian(mean: 0, standardDeviation: 0.4)) * range * 0.4
            let low = min(open, close) - abs(rng.nextGaussian(mean: 0, standardDeviation: 0.4)) * range * 0.4
            result.append(Candle(id: index, open: open, close: close, high: high, low: low))
            price = close
        }
        return result
    }

    var body: some View {
        let data = candles
        ZStack(alignment: .topLeading) {
            Color(red: 0.11, green: 0.11, blue: 0.13)
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text(draft.symbol).font(.system(size: 16, weight: .semibold))
                    Text("5 min").font(.system(size: 12)).foregroundStyle(.secondary)
                    Spacer()
                    Text(draft.direction == .long ? "LONG" : "SHORT")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundStyle(draft.direction == .long ? Color.green : Color.red)
                }
                .foregroundStyle(.white)
                Chart {
                    ForEach(data) { candle in
                        RuleMark(x: .value("i", candle.id), yStart: .value("low", candle.low), yEnd: .value("high", candle.high))
                            .foregroundStyle(candle.close >= candle.open ? Color.green.opacity(0.9) : Color.red.opacity(0.9))
                            .lineStyle(StrokeStyle(lineWidth: 1))
                        RectangleMark(
                            x: .value("i", candle.id),
                            yStart: .value("open", candle.open),
                            yEnd: .value("close", candle.close),
                            width: .fixed(9)
                        )
                        .foregroundStyle(candle.close >= candle.open ? Color.green : Color.red)
                    }
                    if let plan = draft.plan {
                        if let entry = plan.entry {
                            RuleMark(y: .value("Einstieg", entry)).foregroundStyle(.white.opacity(0.7)).lineStyle(StrokeStyle(lineWidth: 1, dash: [4, 3]))
                        }
                        if let stop = plan.stop {
                            RuleMark(y: .value("Stop", stop)).foregroundStyle(Color.red.opacity(0.8)).lineStyle(StrokeStyle(lineWidth: 1, dash: [4, 3]))
                        }
                        if let target = plan.target {
                            RuleMark(y: .value("Ziel", target)).foregroundStyle(Color.green.opacity(0.8)).lineStyle(StrokeStyle(lineWidth: 1, dash: [4, 3]))
                        }
                    }
                }
                .chartXAxis(.hidden)
                .chartYAxis {
                    AxisMarks(position: .trailing) {
                        AxisGridLine().foregroundStyle(.white.opacity(0.08))
                        AxisValueLabel().foregroundStyle(.white.opacity(0.6)).font(.system(size: 10))
                    }
                }
                .chartYScale(domain: .automatic(includesZero: false))
            }
            .padding(16)
        }
    }
}
