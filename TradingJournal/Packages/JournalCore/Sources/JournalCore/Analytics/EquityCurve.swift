import Foundation

/// Ein Punkt der Kapitalkurve nach einem abgeschlossenen Trade.
public struct EquityPoint: Identifiable, Hashable, Sendable {
    public var id: UUID
    public var date: Date
    public var equity: Double
    public var pnl: Double
    /// Rückgang vom bisherigen Hoch (≥ 0).
    public var drawdown: Double

    public init(id: UUID, date: Date, equity: Double, pnl: Double, drawdown: Double) {
        self.id = id
        self.date = date
        self.equity = equity
        self.pnl = pnl
        self.drawdown = drawdown
    }
}

/// Größter Rückgang der Kapitalkurve.
public struct DrawdownInfo: Hashable, Sendable {
    public var amount: Double
    public var percent: Double
    public var peakDate: Date
    public var troughDate: Date
}

public enum EquityCurve {
    /// Baut die Kapitalkurve aus abgeschlossenen Trades in Ausstiegsreihenfolge.
    public static func build(from trades: [TradeRecord], startingBalance: Double = 0) -> [EquityPoint] {
        let closed = trades
            .filter(\.isClosed)
            .sorted { ($0.exitDate ?? .distantPast) < ($1.exitDate ?? .distantPast) }
        var equity = startingBalance
        var peak = startingBalance
        var points: [EquityPoint] = []
        points.reserveCapacity(closed.count)
        for trade in closed {
            equity += trade.netPnL
            peak = max(peak, equity)
            points.append(EquityPoint(
                id: trade.id,
                date: trade.exitDate ?? trade.entryDate,
                equity: equity,
                pnl: trade.netPnL,
                drawdown: peak - equity
            ))
        }
        return points
    }

    public static func maxDrawdown(_ points: [EquityPoint], startingBalance: Double = 0) -> DrawdownInfo? {
        guard let first = points.first else { return nil }
        var peakValue = max(startingBalance, first.equity)
        var peakDate = first.date
        var best: DrawdownInfo?
        for point in points {
            if point.equity > peakValue {
                peakValue = point.equity
                peakDate = point.date
            }
            let amount = peakValue - point.equity
            if amount > (best?.amount ?? 0) {
                let percent = peakValue > 0 ? amount / peakValue : 0
                best = DrawdownInfo(amount: amount, percent: percent, peakDate: peakDate, troughDate: point.date)
            }
        }
        return best
    }
}
