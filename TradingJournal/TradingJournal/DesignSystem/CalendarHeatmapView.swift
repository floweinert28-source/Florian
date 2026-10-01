import SwiftUI
import JournalCore

/// Monatskalender mit Tagesergebnissen als Heatmap und Wochensummen am rechten Rand.
struct CalendarHeatmapView: View {
    @Environment(SettingsStore.self) private var settings
    let month: Date
    let days: [Date: DayPerformance]
    @Binding var selectedDay: Date?
    var compact: Bool = false

    private var calendar: Calendar { Calendar.current }

    private struct Week: Identifiable {
        let id: Int
        let days: [Date?]
        let pnl: Double
        let tradeCount: Int
    }

    private var weeks: [Week] {
        guard let interval = calendar.dateInterval(of: .month, for: month) else { return [] }
        let first = interval.start
        let daysInMonth = calendar.range(of: .day, in: .month, for: first)?.count ?? 30
        let leading = (calendar.component(.weekday, from: first) - calendar.firstWeekday + 7) % 7
        var cells: [Date?] = Array(repeating: nil, count: leading)
        for offset in 0..<daysInMonth {
            cells.append(calendar.date(byAdding: .day, value: offset, to: first))
        }
        while cells.count % 7 != 0 { cells.append(nil) }
        return stride(from: 0, to: cells.count, by: 7).enumerated().map { index, start in
            let slice = Array(cells[start..<start + 7])
            let performances = slice.compactMap { $0 }.compactMap { days[calendar.startOfDay(for: $0)] }
            return Week(id: index, days: slice, pnl: performances.reduce(0) { $0 + $1.pnl }, tradeCount: performances.reduce(0) { $0 + $1.tradeCount })
        }
    }

    private var weekdaySymbols: [String] {
        let symbols = calendar.veryShortStandaloneWeekdaySymbols
        let first = calendar.firstWeekday - 1
        return (0..<7).map { symbols[(first + $0) % 7] }
    }

    var body: some View {
        let columns = Array(repeating: GridItem(.flexible(), spacing: 4), count: 7) + [GridItem(.flexible(minimum: 44), spacing: 4)]
        LazyVGrid(columns: columns, spacing: 4) {
            ForEach(weekdaySymbols, id: \.self) { symbol in
                Text(symbol).font(.caption2.weight(.medium)).foregroundStyle(.tertiary)
            }
            Text("Woche").font(.caption2.weight(.medium)).foregroundStyle(.tertiary)
            ForEach(weeks) { week in
                ForEach(Array(week.days.enumerated()), id: \.offset) { _, day in
                    if let day {
                        dayCell(day)
                    } else {
                        Color.clear.frame(height: cellHeight)
                    }
                }
                weekCell(week)
            }
        }
    }

    private var cellHeight: CGFloat { compact ? 40 : 58 }

    private func dayCell(_ day: Date) -> some View {
        let key = calendar.startOfDay(for: day)
        let performance = days[key]
        let isSelected = selectedDay.map { calendar.isDate($0, inSameDayAs: day) } ?? false
        let isToday = calendar.isDateInToday(day)
        return Button {
            withAnimation(Theme.quickSpring) { selectedDay = key }
            Haptics.selection()
        } label: {
            VStack(alignment: .leading, spacing: 2) {
                HStack {
                    Text("\(calendar.component(.day, from: day))")
                        .font(.caption2.weight(isToday ? .bold : .medium))
                        .foregroundStyle(performance == nil ? .tertiary : .primary)
                    Spacer(minLength: 0)
                }
                if let performance, !compact {
                    Spacer(minLength: 0)
                    Text(Format.currency(performance.pnl, code: settings.currencyCode, signed: true, compact: true))
                        .font(.caption.weight(.semibold))
                        .numeric()
                        .lineLimit(1)
                        .minimumScaleFactor(0.7)
                    Text("\(performance.tradeCount) Trades")
                        .font(.system(size: 9))
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                } else if performance != nil {
                    Spacer(minLength: 0)
                }
            }
            .padding(6)
            .frame(maxWidth: .infinity, minHeight: cellHeight, maxHeight: cellHeight, alignment: .topLeading)
            .background(
                RoundedRectangle(cornerRadius: 7, style: .continuous)
                    .fill(fill(for: performance))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 7, style: .continuous)
                    .strokeBorder(isSelected ? Color.accentColor : (isToday ? Color.primary.opacity(0.35) : Color.clear), lineWidth: isSelected ? 2 : 1)
            )
            .contentShape(RoundedRectangle(cornerRadius: 7, style: .continuous))
        }
        .buttonStyle(.plain)
        .accessibilityLabel(Text(day.formatted(.dateTime.day().month().year())))
    }

    private func weekCell(_ week: Week) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            if week.tradeCount > 0 {
                Text(Format.currency(week.pnl, code: settings.currencyCode, signed: true, compact: true))
                    .font(.caption.weight(.semibold))
                    .numeric()
                    .foregroundStyle(Color.pnl(week.pnl))
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
                Text("\(week.tradeCount) Trades")
                    .font(.system(size: 9))
                    .foregroundStyle(.secondary)
            } else {
                Text("—").font(.caption).foregroundStyle(.tertiary)
            }
        }
        .padding(6)
        .frame(maxWidth: .infinity, minHeight: cellHeight, maxHeight: cellHeight, alignment: .topLeading)
        .background(RoundedRectangle(cornerRadius: 7, style: .continuous).fill(Color.elevatedFill.opacity(0.6)))
    }

    private func fill(for performance: DayPerformance?) -> Color {
        guard let performance else { return Color.elevatedFill.opacity(0.35) }
        let reference = max(settings.accountSize * 0.01, 1)
        let intensity = min(abs(performance.pnl) / reference, 1)
        if abs(performance.pnl) < 1e-9 { return Color.elevatedFill }
        return (performance.pnl > 0 ? Color.profit : Color.loss).opacity(0.22 + 0.5 * intensity)
    }
}
