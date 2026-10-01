import Foundation

/// Einheitliche Formatierung von Währung, Prozent, R-Multiples und Zeiten.
enum Format {
    static func currency(_ value: Double, code: String, signed: Bool = false, compact: Bool = false) -> String {
        let magnitude = abs(value)
        let digits: Int = compact && magnitude >= 1000 ? 0 : (magnitude >= 100 ? 0 : 2)
        var style = FloatingPointFormatStyle<Double>.Currency(code: code)
            .precision(.fractionLength(digits))
        if signed {
            style = style.sign(strategy: .always(showZero: false))
        }
        return value.formatted(style)
    }

    static func percent(_ fraction: Double, digits: Int = 0) -> String {
        fraction.formatted(.percent.precision(.fractionLength(digits)))
    }

    static func r(_ value: Double, signed: Bool = true) -> String {
        let number = value.formatted(.number.precision(.fractionLength(2)).sign(strategy: signed ? .always(includingZero: false) : .automatic))
        return "\(number) R"
    }

    static func number(_ value: Double, digits: Int = 2) -> String {
        value.formatted(.number.precision(.fractionLength(0...digits)))
    }

    static func price(_ value: Double) -> String {
        let digits = abs(value) < 10 ? 5 : 2
        return value.formatted(.number.precision(.fractionLength(0...digits)))
    }

    static func factor(_ value: Double?) -> String {
        guard let value else { return "∞" }
        return value.formatted(.number.precision(.fractionLength(2)))
    }

    static func duration(_ interval: TimeInterval) -> String {
        let minutes = Int(interval / 60)
        if minutes < 60 { return String(localized: "\(minutes) min") }
        let hours = minutes / 60
        if hours < 24 {
            let rest = minutes % 60
            return rest == 0 ? String(localized: "\(hours) h") : String(localized: "\(hours) h \(rest) min")
        }
        let days = hours / 24
        return String(localized: "\(days) T \(hours % 24) h")
    }

    static func shortDate(_ date: Date) -> String {
        date.formatted(.dateTime.day().month(.abbreviated))
    }

    static func dateTime(_ date: Date) -> String {
        date.formatted(.dateTime.day().month(.abbreviated).year().hour().minute())
    }

    static func time(_ date: Date) -> String {
        date.formatted(.dateTime.hour().minute())
    }

    static func weekday(_ weekday: Int, calendar: Calendar = .current) -> String {
        let symbols = calendar.standaloneWeekdaySymbols
        guard weekday >= 1, weekday <= symbols.count else { return "" }
        return symbols[weekday - 1]
    }

    static func shortWeekday(_ weekday: Int, calendar: Calendar = .current) -> String {
        let symbols = calendar.shortStandaloneWeekdaySymbols
        guard weekday >= 1, weekday <= symbols.count else { return "" }
        return symbols[weekday - 1]
    }

    static func hour(_ hour: Int) -> String {
        String(format: "%02d:00", hour)
    }
}
