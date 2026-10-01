import Foundation

/// Eingelesene CSV-Datei: Kopfzeile und Datenzeilen.
public struct CSVDocument: Hashable, Sendable {
    public var headers: [String]
    public var rows: [[String]]
    public var delimiter: Character

    public init(headers: [String], rows: [[String]], delimiter: Character) {
        self.headers = headers
        self.rows = rows
        self.delimiter = delimiter
    }

    public var isEmpty: Bool { rows.isEmpty }
}

/// Robuster CSV-Parser (RFC 4180-nah): Anführungszeichen, eingebettete Trennzeichen,
/// Zeilenumbrüche in Feldern, automatische Trennzeichen-Erkennung.
public enum CSVParser {
    public static func parse(_ text: String, delimiter: Character? = nil) -> CSVDocument {
        var content = text
        if content.hasPrefix("\u{FEFF}") { content.removeFirst() }
        let separator = delimiter ?? detectDelimiter(in: content)
        let records = records(from: content, delimiter: separator)
            .filter { row in !row.allSatisfy { $0.trimmingCharacters(in: .whitespaces).isEmpty } }
        guard let headerRow = records.first else {
            return CSVDocument(headers: [], rows: [], delimiter: separator)
        }
        let headers = headerRow.map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
        let rows = records.dropFirst().map { row -> [String] in
            var padded = row.map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
            if padded.count < headers.count {
                padded.append(contentsOf: Array(repeating: "", count: headers.count - padded.count))
            }
            return padded
        }
        return CSVDocument(headers: headers, rows: Array(rows), delimiter: separator)
    }

    /// Wählt das Trennzeichen, das in der Kopfzeile am häufigsten vorkommt.
    public static func detectDelimiter(in text: String) -> Character {
        let firstLine = text.split(whereSeparator: \.isNewline).first.map(String.init) ?? ""
        let candidates: [Character] = [",", ";", "\t", "|"]
        var best: Character = ","
        var bestCount = -1
        for candidate in candidates {
            let count = firstLine.filter { $0 == candidate }.count
            if count > bestCount {
                best = candidate
                bestCount = count
            }
        }
        return best
    }

    static func records(from text: String, delimiter: Character) -> [[String]] {
        var records: [[String]] = []
        var row: [String] = []
        var field = ""
        var inQuotes = false
        var iterator = text.makeIterator()
        var pending: Character? = nil

        func nextChar() -> Character? {
            if let p = pending {
                pending = nil
                return p
            }
            return iterator.next()
        }

        while let char = nextChar() {
            if inQuotes {
                if char == "\"" {
                    if let following = nextChar() {
                        if following == "\"" {
                            field.append("\"")
                        } else {
                            inQuotes = false
                            pending = following
                        }
                    } else {
                        inQuotes = false
                    }
                } else {
                    field.append(char)
                }
                continue
            }

            switch char {
            case "\"":
                inQuotes = true
            case delimiter:
                row.append(field)
                field = ""
            case "\n", "\r", "\r\n":
                // Swift fasst "\r\n" zu einem Zeichen zusammen; alle drei Varianten beenden die Zeile.
                row.append(field)
                records.append(row)
                row = []
                field = ""
            default:
                field.append(char)
            }
        }
        if !field.isEmpty || !row.isEmpty {
            row.append(field)
            records.append(row)
        }
        return records
    }
}
