import SwiftUI

/// Ring für Werte von 0 bis 100 (z. B. Disziplin-Score).
struct ScoreRing: View {
    let score: Double
    var lineWidth: CGFloat = 9
    var size: CGFloat = 84

    var body: some View {
        ZStack {
            Circle()
                .stroke(Color.subtleFill, lineWidth: lineWidth)
            Circle()
                .trim(from: 0, to: min(max(score / 100, 0), 1))
                .stroke(tint, style: StrokeStyle(lineWidth: lineWidth, lineCap: .round))
                .rotationEffect(.degrees(-90))
                .animation(Theme.spring, value: score)
            Text("\(Int(score.rounded()))")
                .font(.system(size: size * 0.3, weight: .semibold))
                .numeric()
                .contentTransition(.numericText())
        }
        .frame(width: size, height: size)
        .accessibilityLabel("Score \(Int(score.rounded())) von 100")
    }

    private var tint: Color {
        switch score {
        case ..<50: .loss
        case ..<75: .orange
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
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(label).font(.subheadline)
                Spacer()
                Text(valueText).font(.subheadline.weight(.medium)).numeric().foregroundStyle(tint)
            }
            GeometryReader { proxy in
                ZStack(alignment: .leading) {
                    Capsule().fill(Color.subtleFill)
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
