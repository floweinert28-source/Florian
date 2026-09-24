import Foundation

/// Felder, denen CSV-Spalten zugeordnet werden können.
public enum ImportField: String, CaseIterable, Sendable, Hashable, Identifiable, Codable {
    case symbol
    case direction
    case entryDate
    case entryTime
    case exitDate
    case exitTime
    case quantity
    case entryPrice
    case exitPrice
    case pnl
    case fees
    case multiplier
    case plannedEntry
    case plannedStop
    case plannedTarget
    case initialStop
    case maePrice
    case mfePrice
    case setup
    case strategy
    case marketPhase
    case notes

    public var id: String { rawValue }

    public var isRequired: Bool {
        switch self {
        case .symbol, .entryDate, .entryPrice, .quantity: true
        default: false
        }
    }

    /// Bekannte Spaltennamen (klein geschrieben) für den Zuordnungsvorschlag.
    var synonyms: [String] {
        switch self {
        case .symbol: ["symbol", "ticker", "instrument", "markt", "market", "wert", "asset", "underlying", "produkt"]
        case .direction: ["direction", "richtung", "side", "seite", "type", "typ", "long/short", "position", "buy/sell"]
        case .entryDate: ["entry date", "entrydate", "entry", "einstieg", "einstiegsdatum", "open date", "opened", "open time", "date", "datum", "eröffnung", "entry_date", "opening time"]
        case .entryTime: ["entry time", "entrytime", "einstiegszeit", "open time", "uhrzeit", "time", "zeit", "entry_time"]
        case .exitDate: ["exit date", "exitdate", "exit", "ausstieg", "ausstiegsdatum", "close date", "closed", "close time", "closing time", "exit_date", "schluss"]
        case .exitTime: ["exit time", "exittime", "ausstiegszeit", "exit_time", "closing time"]
        case .quantity: ["quantity", "qty", "menge", "size", "größe", "groesse", "stück", "stueck", "units", "lots", "kontrakte", "contracts", "volume", "volumen", "anzahl"]
        case .entryPrice: ["entry price", "entryprice", "einstiegskurs", "einstiegspreis", "open price", "opening price", "price in", "kaufkurs", "entry_price", "eröffnungskurs", "price", "kurs", "preis"]
        case .exitPrice: ["exit price", "exitprice", "ausstiegskurs", "ausstiegspreis", "close price", "closing price", "price out", "verkaufskurs", "exit_price", "schlusskurs"]
        case .pnl: ["pnl", "p&l", "p/l", "profit", "gewinn", "gewinn/verlust", "ergebnis", "net pnl", "net p&l", "netto", "realized pnl", "realized p&l", "profit/loss", "result"]
        case .fees: ["fees", "fee", "gebühren", "gebuehren", "commission", "kommission", "provision", "kosten", "costs"]
        case .multiplier: ["multiplier", "multiplikator", "punktwert", "point value", "contract size", "kontraktgröße", "kontraktgroesse", "tick value"]
        case .plannedEntry: ["planned entry", "plan entry", "geplanter einstieg", "plan einstieg", "planned_entry"]
        case .plannedStop: ["planned stop", "plan stop", "geplanter stop", "plan_stop", "planned_stop", "stop plan"]
        case .plannedTarget: ["planned target", "plan target", "geplantes ziel", "ziel", "target", "take profit", "tp", "planned_target"]
        case .initialStop: ["stop", "stop loss", "stoploss", "sl", "initial stop", "stop-loss", "initial_stop"]
        case .maePrice: ["mae", "mae price", "max adverse", "worst price", "tiefstkurs", "lowest"]
        case .mfePrice: ["mfe", "mfe price", "max favorable", "best price", "höchstkurs", "hoechstkurs", "highest"]
        case .setup: ["setup", "pattern", "muster"]
        case .strategy: ["strategy", "strategie", "system"]
        case .marketPhase: ["market phase", "marktphase", "phase", "session"]
        case .notes: ["notes", "note", "notiz", "notizen", "comment", "kommentar", "bemerkung", "description", "beschreibung"]
        }
    }
}

/// Zuordnung Feld → Spaltenindex.
public struct ColumnMapping: Hashable, Sendable, Codable {
    public var columns: [ImportField: Int]

    public init(columns: [ImportField: Int] = [:]) {
        self.columns = columns
    }

    public subscript(field: ImportField) -> Int? {
        get { columns[field] }
        set { columns[field] = newValue }
    }

    public var missingRequiredFields: [ImportField] {
        ImportField.allCases.filter { $0.isRequired && columns[$0] == nil }
    }

    public var isValid: Bool { missingRequiredFields.isEmpty }

    /// Schlägt anhand der Spaltennamen eine Zuordnung vor.
    public static func suggested(for headers: [String]) -> ColumnMapping {
        var mapping = ColumnMapping()
        var used: Set<Int> = []
        let normalized = headers.map { $0.lowercased().trimmingCharacters(in: .whitespacesAndNewlines) }

        // Erst exakte Treffer in Feldreihenfolge, dann Teiltreffer.
        for field in ImportField.allCases {
            if let index = normalized.indices.first(where: { !used.contains($0) && field.synonyms.contains(normalized[$0]) }) {
                mapping[field] = index
                used.insert(index)
            }
        }
        for field in ImportField.allCases where mapping[field] == nil {
            if let index = normalized.indices.first(where: { index in
                !used.contains(index) && field.synonyms.contains { synonym in synonym.count > 2 && normalized[index].contains(synonym) }
            }) {
                mapping[field] = index
                used.insert(index)
            }
        }
        return mapping
    }
}

public enum DecimalSeparatorOption: String, CaseIterable, Sendable, Hashable, Identifiable {
    case automatic
    case comma
    case point
    public var id: String { rawValue }
}

public struct ImportOptions: Hashable, Sendable {
    /// Festes Datumsformat; `nil` = automatisch erkennen.
    public var dateFormat: String?
    public var decimalSeparator: DecimalSeparatorOption = .automatic
    public var timeZone: TimeZone = .current
    public var defaultMultiplier: Double = 1

    public init() {}
}

public enum ImportIssueKind: Hashable, Sendable {
    case missingValue(ImportField)
    case invalidNumber(ImportField, String)
    case invalidDate(ImportField, String)
    case invalidDirection(String)
}

public struct ImportIssue: Identifiable, Hashable, Sendable {
    /// 1-basierte Zeilennummer in der Datei (ohne Kopfzeile ⇒ Datenzeile 1 ist Zeile 2).
    public var line: Int
    public var kind: ImportIssueKind
    public var id: String { "\(line)-\(kind)" }
}

public struct ImportResult: Hashable, Sendable {
    public var drafts: [TradeDraft]
    public var issues: [ImportIssue]
    public var skippedRows: Int
}

/// Wandelt CSV-Zeilen anhand einer Spaltenzuordnung in Trade-Entwürfe um.
public enum CSVTradeMapper {
    public static let knownDateFormats: [String] = [
        "yyyy-MM-dd HH:mm:ss",
        "yyyy-MM-dd HH:mm",
        "yyyy-MM-dd'T'HH:mm:ss",
        "yyyy-MM-dd",
        "dd.MM.yyyy HH:mm:ss",
        "dd.MM.yyyy HH:mm",
        "dd.MM.yyyy",
        "dd.MM.yy HH:mm",
        "dd.MM.yy",
        "dd/MM/yyyy HH:mm:ss",
        "dd/MM/yyyy HH:mm",
        "dd/MM/yyyy",
        "MM/dd/yyyy HH:mm:ss",
        "MM/dd/yyyy HH:mm",
        "MM/dd/yyyy",
        "yyyy/MM/dd HH:mm",
        "yyyy/MM/dd",
    ]

    public static func map(_ document: CSVDocument, mapping: ColumnMapping, options: ImportOptions = .init()) -> ImportResult {
        var drafts: [TradeDraft] = []
        var issues: [ImportIssue] = []
        var skipped = 0
        let dates = DateParser(options: options)

        for (offset, row) in document.rows.enumerated() {
            let line = offset + 2
            func value(_ field: ImportField) -> String? {
                guard let index = mapping[field], index < row.count else { return nil }
                let raw = row[index].trimmingCharacters(in: .whitespacesAndNewlines)
                return raw.isEmpty ? nil : raw
            }
            func number(_ field: ImportField) -> Double? {
                guard let raw = value(field) else { return nil }
                if let parsed = NumberParser.parse(raw, decimalSeparator: options.decimalSeparator) { return parsed }
                issues.append(ImportIssue(line: line, kind: .invalidNumber(field, raw)))
                return nil
            }

            var rowFailed = false
            func require<T>(_ field: ImportField, _ parsed: T?) -> T? {
                if parsed == nil {
                    if value(field) == nil { issues.append(ImportIssue(line: line, kind: .missingValue(field))) }
                    rowFailed = true
                }
                return parsed
            }

            let symbol = require(.symbol, value(.symbol)?.uppercased())
            let entryDateRaw = value(.entryDate)
            let entryDate = require(.entryDate, entryDateRaw.flatMap { dates.parse($0, time: value(.entryTime)) })
            if entryDate == nil, let entryDateRaw, !issues.contains(where: { $0.line == line && $0.kind == .missingValue(.entryDate) }) {
                issues.append(ImportIssue(line: line, kind: .invalidDate(.entryDate, entryDateRaw)))
            }
            let quantityRaw = number(.quantity)
            let quantity = require(.quantity, quantityRaw.map { abs($0) })
            let entryPrice = require(.entryPrice, number(.entryPrice))

            guard !rowFailed, let symbol, let entryDate, let quantity, let entryPrice else {
                skipped += 1
                continue
            }

            var direction: TradeDirection = .long
            if let raw = value(.direction) {
                if let parsed = TradeDirection.parse(raw) {
                    direction = parsed
                } else {
                    issues.append(ImportIssue(line: line, kind: .invalidDirection(raw)))
                }
            } else if let quantityRaw, quantityRaw < 0 {
                direction = .short
            }

            var exitDate: Date?
            if let raw = value(.exitDate) {
                exitDate = dates.parse(raw, time: value(.exitTime))
                if exitDate == nil { issues.append(ImportIssue(line: line, kind: .invalidDate(.exitDate, raw))) }
            }
            let exitPrice = number(.exitPrice)
            if exitDate == nil, exitPrice != nil {
                // Ausstiegskurs ohne Ausstiegszeit: Trade gilt als am Einstiegstag geschlossen.
                exitDate = entryDate
            }

            var plan: TradePlan?
            let plannedEntry = number(.plannedEntry)
            let plannedStop = number(.plannedStop)
            let plannedTarget = number(.plannedTarget)
            if plannedEntry != nil || plannedStop != nil || plannedTarget != nil {
                plan = TradePlan(entry: plannedEntry, stop: plannedStop, target: plannedTarget)
            }

            let draft = TradeDraft(
                symbol: symbol,
                direction: direction,
                entryDate: entryDate,
                exitDate: exitDate,
                quantity: quantity,
                multiplier: number(.multiplier) ?? options.defaultMultiplier,
                entryPrice: entryPrice,
                exitPrice: exitPrice,
                fees: number(.fees) ?? 0,
                pnlOverride: number(.pnl),
                plan: plan,
                initialStop: number(.initialStop),
                maePrice: number(.maePrice),
                mfePrice: number(.mfePrice),
                setup: value(.setup),
                strategy: value(.strategy),
                marketPhase: value(.marketPhase),
                notes: value(.notes) ?? ""
            )
            drafts.append(draft)
        }

        return ImportResult(drafts: drafts, issues: issues, skippedRows: skipped)
    }
}

extension TradeDirection {
    /// Erkennt gängige Schreibweisen: long/short, buy/sell, Kauf/Verkauf, L/S, B/S.
    public static func parse(_ raw: String) -> TradeDirection? {
        let value = raw.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        switch value {
        case "long", "buy", "kauf", "l", "b", "bought", "gekauft", "call": return .long
        case "short", "sell", "verkauf", "s", "sold", "verkauft", "put": return .short
        default:
            if value.hasPrefix("long") || value.hasPrefix("buy") { return .long }
            if value.hasPrefix("short") || value.hasPrefix("sell") { return .short }
            return nil
        }
    }
}

/// Zahlen mit Punkt oder Komma, Tausendertrennern, Währungszeichen und Vorzeichen.
public enum NumberParser {
    public static func parse(_ raw: String, decimalSeparator: DecimalSeparatorOption = .automatic) -> Double? {
        var text = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return nil }
        var negative = false
        if text.hasPrefix("(") && text.hasSuffix(")") {
            negative = true
            text = String(text.dropFirst().dropLast())
        }
        text = text.replacingOccurrences(of: "−", with: "-")
        let allowed = Set("0123456789.,-+")
        text = String(text.filter { allowed.contains($0) })
        guard !text.isEmpty else { return nil }

        let commaIndex = text.lastIndex(of: ",")
        let pointIndex = text.lastIndex(of: ".")
        let useCommaAsDecimal: Bool
        switch decimalSeparator {
        case .comma: useCommaAsDecimal = true
        case .point: useCommaAsDecimal = false
        case .automatic:
            if let commaIndex, let pointIndex {
                useCommaAsDecimal = commaIndex > pointIndex
            } else if commaIndex != nil {
                // Nur Kommas: ein Komma ist ein Dezimaltrenner, mehrere sind Tausendergruppen („1,234,567“).
                useCommaAsDecimal = text.filter { $0 == "," }.count == 1
            } else {
                // Nur Punkte: Dezimaltrenner, außer mehrere Punkte („1.234.567“).
                useCommaAsDecimal = text.filter { $0 == "." }.count > 1
            }
        }

        if useCommaAsDecimal {
            text = text.replacingOccurrences(of: ".", with: "")
            text = text.replacingOccurrences(of: ",", with: ".")
        } else {
            text = text.replacingOccurrences(of: ",", with: "")
        }
        guard let value = Double(text) else { return nil }
        return negative ? -value : value
    }
}

/// Datums-Erkennung über bekannte Formate, optional mit getrennter Uhrzeit.
public struct DateParser {
    private let formatters: [DateFormatter]
    private let iso: ISO8601DateFormatter
    private let isoFractional: ISO8601DateFormatter
    private let timeFormatters: [DateFormatter]
    private let calendar: Calendar

    public init(options: ImportOptions) {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = options.timeZone
        self.calendar = calendar

        func formatter(_ format: String) -> DateFormatter {
            let f = DateFormatter()
            f.locale = Locale(identifier: "en_US_POSIX")
            f.timeZone = options.timeZone
            f.dateFormat = format
            f.isLenient = false
            return f
        }
        let formats = options.dateFormat.map { [$0] } ?? CSVTradeMapper.knownDateFormats
        formatters = formats.map(formatter)
        timeFormatters = ["HH:mm:ss", "HH:mm", "H:mm"].map(formatter)
        iso = ISO8601DateFormatter()
        iso.timeZone = options.timeZone
        isoFractional = ISO8601DateFormatter()
        isoFractional.timeZone = options.timeZone
        isoFractional.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    }

    public func parse(_ raw: String, time: String? = nil) -> Date? {
        let text = raw.trimmingCharacters(in: .whitespacesAndNewlines)
        var date: Date?
        if let parsed = iso.date(from: text) ?? isoFractional.date(from: text) {
            date = parsed
        } else {
            for formatter in formatters {
                if let parsed = formatter.date(from: text) {
                    date = parsed
                    break
                }
            }
        }
        guard var result = date else { return nil }
        if let time, let timeDate = timeFormatters.lazy.compactMap({ $0.date(from: time.trimmingCharacters(in: .whitespaces)) }).first {
            let components = calendar.dateComponents([.hour, .minute, .second], from: timeDate)
            let day = calendar.startOfDay(for: result)
            if let combined = calendar.date(byAdding: components, to: day) {
                result = combined
            }
        }
        return result
    }
}
