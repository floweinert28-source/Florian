import SwiftUI

/// Eine Achse des Radar-Diagramms.
struct RadarAxis: Identifiable, Hashable {
    let id: String
    let label: String
    /// 0 … 1
    let score: Double
}

/// Radar-Diagramm (Spinnennetz) für den Trader-Score.
struct RadarChartView: View {
    let axes: [RadarAxis]
    var tint: Color = .accentColor
    var rings: Int = 4

    var body: some View {
        GeometryReader { proxy in
            let size = min(proxy.size.width, proxy.size.height)
            let center = CGPoint(x: proxy.size.width / 2, y: proxy.size.height / 2)
            let radius = size / 2 - 26
            ZStack {
                Canvas { context, _ in
                    guard axes.count >= 3 else { return }
                    let count = axes.count
                    func point(_ index: Int, _ fraction: Double) -> CGPoint {
                        let angle = -Double.pi / 2 + Double(index) / Double(count) * 2 * .pi
                        return CGPoint(x: center.x + cos(angle) * radius * fraction, y: center.y + sin(angle) * radius * fraction)
                    }
                    // Netz
                    for ring in 1...rings {
                        let fraction = Double(ring) / Double(rings)
                        var path = Path()
                        for index in 0..<count {
                            let p = point(index, fraction)
                            if index == 0 { path.move(to: p) } else { path.addLine(to: p) }
                        }
                        path.closeSubpath()
                        context.stroke(path, with: .color(.cardBorder), lineWidth: 1)
                    }
                    for index in 0..<count {
                        var spoke = Path()
                        spoke.move(to: center)
                        spoke.addLine(to: point(index, 1))
                        context.stroke(spoke, with: .color(.cardBorder), lineWidth: 1)
                    }
                    // Fläche
                    var area = Path()
                    for (index, axis) in axes.enumerated() {
                        let p = point(index, max(axis.score, 0.02))
                        if index == 0 { area.move(to: p) } else { area.addLine(to: p) }
                    }
                    area.closeSubpath()
                    context.fill(area, with: .color(tint.opacity(0.28)))
                    context.stroke(area, with: .color(tint), lineWidth: 2)
                    for (index, axis) in axes.enumerated() {
                        let p = point(index, max(axis.score, 0.02))
                        context.fill(Path(ellipseIn: CGRect(x: p.x - 3.5, y: p.y - 3.5, width: 7, height: 7)), with: .color(tint))
                    }
                }
                ForEach(Array(axes.enumerated()), id: \.element.id) { index, axis in
                    let angle = -Double.pi / 2 + Double(index) / Double(axes.count) * 2 * .pi
                    let labelRadius = radius + 18
                    Text(axis.label)
                        .font(.caption2.weight(.medium))
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                        .frame(width: 70)
                        .position(x: center.x + cos(angle) * labelRadius, y: center.y + sin(angle) * labelRadius)
                }
            }
        }
        .accessibilityLabel(Text(axes.map { "\($0.label): \(Int($0.score * 100))" }.joined(separator: ", ")))
    }
}
