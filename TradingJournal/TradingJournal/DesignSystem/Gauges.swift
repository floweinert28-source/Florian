import SwiftUI

/// Ein Segment eines Ring-Diagramms.
struct GaugeSegment: Hashable {
    let value: Double
    let color: Color
}

/// Ring aus Segmenten (z. B. Gewinner/Verlierer oder Bruttogewinn/Bruttoverlust).
struct DonutGauge: View {
    let segments: [GaugeSegment]
    var lineWidth: CGFloat = 7
    var size: CGFloat = 52

    var body: some View {
        let total = max(segments.reduce(0) { $0 + max($1.value, 0) }, 1e-9)
        let gap = 0.025
        ZStack {
            Circle().stroke(Color.elevatedFill, lineWidth: lineWidth)
            ForEach(Array(segments.enumerated()), id: \.offset) { index, segment in
                let start = segments.prefix(index).reduce(0) { $0 + max($1.value, 0) } / total
                let end = start + max(segment.value, 0) / total
                Circle()
                    .trim(from: min(start + gap / 2, end), to: max(end - gap / 2, start))
                    .stroke(segment.color, style: StrokeStyle(lineWidth: lineWidth, lineCap: .round))
                    .rotationEffect(.degrees(-90))
            }
        }
        .frame(width: size, height: size)
        .animation(Theme.spring, value: segments)
    }
}

/// Halbkreis-Anzeige für einen Wert 0 … 1 (z. B. Profit-Faktor auf einer Skala).
struct ArcGauge: View {
    let fraction: Double
    var tint: Color = .accentColor
    var lineWidth: CGFloat = 7
    var size: CGFloat = 56

    var body: some View {
        ZStack {
            Circle()
                .trim(from: 0.5, to: 1)
                .stroke(Color.elevatedFill, style: StrokeStyle(lineWidth: lineWidth, lineCap: .round))
            Circle()
                .trim(from: 0.5, to: 0.5 + min(max(fraction, 0), 1) * 0.5)
                .stroke(tint, style: StrokeStyle(lineWidth: lineWidth, lineCap: .round))
                .animation(Theme.spring, value: fraction)
        }
        .frame(width: size, height: size / 2 + lineWidth)
        .offset(y: size / 4)
        .clipped()
    }
}

/// Zwei Balken im Vergleich (Ø Gewinn vs. Ø Verlust).
struct WinLossBars: View {
    let win: Double
    let loss: Double
    var width: CGFloat = 64

    var body: some View {
        let maximum = max(abs(win), abs(loss), 1e-9)
        VStack(alignment: .leading, spacing: 4) {
            Capsule().fill(Color.profit).frame(width: max(6, width * abs(win) / maximum), height: 7)
            Capsule().fill(Color.loss).frame(width: max(6, width * abs(loss) / maximum), height: 7)
        }
        .frame(width: width, alignment: .leading)
        .animation(Theme.spring, value: win)
    }
}

/// Ring für Werte von 0 bis 100 (z. B. Disziplin-Score).
struct ScoreRing: View {
    let score: Double
    var lineWidth: CGFloat = 8
    var size: CGFloat = 84
    var tint: Color? = nil

    var body: some View {
        ZStack {
            Circle()
                .stroke(Color.elevatedFill, lineWidth: lineWidth)
            Circle()
                .trim(from: 0, to: min(max(score / 100, 0), 1))
                .stroke(tint ?? autoTint, style: StrokeStyle(lineWidth: lineWidth, lineCap: .round))
                .rotationEffect(.degrees(-90))
                .animation(Theme.spring, value: score)
            Text("\(Int(score.rounded()))")
                .font(.system(size: size * 0.3, weight: .semibold))
                .numeric()
                .contentTransition(.numericText())
        }
        .frame(width: size, height: size)
        .accessibilityLabel(Text("Score \(Int(score.rounded())) von 100"))
    }

    private var autoTint: Color {
        switch score {
        case ..<50: .loss
        case ..<75: .warning
        default: .profit
        }
    }
}

/// Horizontaler Balken mit Beschriftung (z. B. Fehlerkosten je Typ).
struct LabeledBar: View {
    let label: String
    let value: Double
    let maximum: Double
    let valueText: String
    var tint: Color = .accentColor

    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            HStack {
                Text(label).font(.subheadline)
                Spacer()
                Text(valueText).font(.subheadline.weight(.medium)).numeric().foregroundStyle(tint)
            }
            GeometryReader { proxy in
                ZStack(alignment: .leading) {
                    Capsule().fill(Color.elevatedFill)
                    Capsule()
                        .fill(tint)
                        .frame(width: maximum > 0 ? proxy.size.width * CGFloat(min(value / maximum, 1)) : 0)
                        .animation(Theme.spring, value: value)
                }
            }
            .frame(height: 6)
        }
    }
}
