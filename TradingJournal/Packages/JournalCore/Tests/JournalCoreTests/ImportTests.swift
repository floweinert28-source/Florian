import Foundation
import Testing
@testable import JournalCore

@Suite("CSV-Import")
struct ImportTests {
    @Test("Parser: Anführungszeichen, Semikolon, Zeilenumbrüche")
    func parser() {
        let text = "Symbol;Notiz;Menge\r\nDAX;\"Hallo; \"\"Welt\"\"\";10\r\nNQ;\"mehr\nzeilig\";5\n"
        let doc = CSVParser.parse(text)
        #expect(doc.delimiter == ";")
        #expect(doc.headers == ["Symbol", "Notiz", "Menge"])
        #expect(doc.rows.count == 2)
        #expect(doc.rows[0] == ["DAX", "Hallo; \"Welt\"", "10"])
        #expect(doc.rows[1][1] == "mehr\nzeilig")
    }

    @Test("Parser: BOM und Tab")
    func bomAndTab() {
        let doc = CSVParser.parse("\u{FEFF}a\tb\n1\t2\n")
        #expect(doc.headers == ["a", "b"])
        #expect(doc.rows == [["1", "2"]])
    }

    @Test("Zahlen in deutscher und englischer Schreibweise")
    func numbers() {
        #expect(NumberParser.parse("1.234,56") == 1234.56)
        #expect(NumberParser.parse("1,234.56") == 1234.56)
        #expect(NumberParser.parse("12,5") == 12.5)
        #expect(NumberParser.parse("12.5") == 12.5)
        #expect(NumberParser.parse("1.234.567") == 1_234_567)
        #expect(NumberParser.parse("1,234,567") == 1_234_567)
        #expect(NumberParser.parse("-42") == -42)
        #expect(NumberParser.parse("(42)") == -42)
        #expect(NumberParser.parse("€ 1.250,00") == 1250)
        #expect(NumberParser.parse("abc") == nil)
        #expect(NumberParser.parse("1,5", decimalSeparator: .point) == 15)
    }

    @Test("Richtung")
    func direction() {
        #expect(TradeDirection.parse("Buy") == .long)
        #expect(TradeDirection.parse("verkauf") == .short)
        #expect(TradeDirection.parse("S") == .short)
        #expect(TradeDirection.parse("???") == nil)
    }

    @Test("Zuordnungsvorschlag aus Kopfzeile")
    func suggestion() {
        let mapping = ColumnMapping.suggested(for: ["Datum", "Symbol", "Richtung", "Menge", "Einstiegskurs", "Ausstiegskurs", "Gebühren", "Setup", "Notizen"])
        #expect(mapping[.entryDate] == 0)
        #expect(mapping[.symbol] == 1)
        #expect(mapping[.direction] == 2)
        #expect(mapping[.quantity] == 3)
        #expect(mapping[.entryPrice] == 4)
        #expect(mapping[.exitPrice] == 5)
        #expect(mapping[.fees] == 6)
        #expect(mapping[.setup] == 7)
        #expect(mapping[.notes] == 8)
        #expect(mapping.isValid)
    }

    @Test("Vollständiger Import mit Fehlerzeilen")
    func fullImport() {
        let csv = """
        Date,Time,Symbol,Side,Qty,Entry Price,Exit Price,Exit Date,P&L,Fees
        2026-03-02,09:15,DAX,Long,10,18000.5,18020.5,2026-03-02 10:00,199.00,1.00
        03.03.2026 14:00,,eurusd,Sell,1.5,"1,0850","1,0830",03.03.2026 15:30,,2.5
        2026-03-04,,,Long,1,100,,,,
        nicht-ein-datum,,DAX,Long,1,100,101,,,
        """
        let doc = CSVParser.parse(csv)
        let mapping = ColumnMapping.suggested(for: doc.headers)
        #expect(mapping.isValid)
        var options = ImportOptions()
        options.timeZone = TimeZone(identifier: "Europe/Berlin")!
        let result = CSVTradeMapper.map(doc, mapping: mapping, options: options)

        #expect(result.drafts.count == 2)
        #expect(result.skippedRows == 2)
        #expect(result.issues.contains { $0.line == 4 && $0.kind == .missingValue(.symbol) })
        #expect(result.issues.contains { $0.line == 5 && $0.kind == .invalidDate(.entryDate, "nicht-ein-datum") })

        let first = result.drafts[0]
        #expect(first.symbol == "DAX")
        #expect(first.direction == .long)
        #expect(first.quantity == 10)
        #expect(first.pnlOverride == 199)
        #expect(abs(first.netPnL - 199) < 1e-9)
        let cal = Fixtures.calendar
        #expect(cal.component(.hour, from: first.entryDate) == 9)
        #expect(cal.component(.minute, from: first.entryDate) == 15)
        #expect(first.exitDate != nil)

        let second = result.drafts[1]
        #expect(second.symbol == "EURUSD")
        #expect(second.direction == .short)
        #expect(second.entryPrice == 1.0850)
        #expect(second.exitPrice == 1.0830)
        #expect(second.pnlOverride == nil)
        // Short: (1,0830 − 1,0850) × −1 × 1,5 × 1 − 2,5 = 0,003 − 2,5
        #expect(abs(second.netPnL - (0.002 * 1.5 - 2.5)) < 1e-9)
        #expect(cal.component(.hour, from: second.entryDate) == 14)
    }

    @Test("Negative Menge ohne Richtungsspalte ergibt Short")
    func negativeQuantity() {
        let doc = CSVParser.parse("symbol,date,qty,price\nNQ,2026-01-05,-2,19000\n")
        let result = CSVTradeMapper.map(doc, mapping: ColumnMapping.suggested(for: doc.headers))
        #expect(result.drafts.first?.direction == .short)
        #expect(result.drafts.first?.quantity == 2)
    }
}
