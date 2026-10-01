import SwiftUI
import SwiftData
import JournalCore

/// Tagesjournal: Ergebnis, Trades, Zustand, Regime und Notiz eines Handelstages.
struct DayJournalView: View {
    @Environment(AppModel.self) private var appModel
    @Environment(SettingsStore.self) private var settings
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Trade.entryDate) private var allTrades: [Trade]
    @Query private var checkIns: [DailyCheckIn]
    @Query private var regimes: [MarketRegimeEntry]
    let day: Date

    private var calendar: Calendar { Calendar.current }
    private var trades: [Trade] { allTrades.filter { calendar.isDate($0.entryDate, inSameDayAs: day) } }
    private var checkIn: DailyCheckIn? { checkIns.first { calendar.isDate($0.date, inSameDayAs: day) } }
    private var regime: MarketRegimeEntry? { regimes.first { calendar.isDate($0.date, inSameDayAs: day) } }

    var body: some View {
        let records = trades.map { $0.record(regime: regime?.regime) }
        let summary = PerformanceCalculator.summary(for: records)
        let detector = TiltDetector(configuration: settings.tiltConfiguration)
        let patterns = detector.detectPatterns(in: records.filter(\.isClosed))
        Screen(spacing: Theme.Spacing.l) {
            headerCard(summary, tradeCount: trades.count)
            AdaptiveColumns {
                stateCard
                patternsCard(patterns)
            }
            tradesCard
            notesCard
        }
        .navigationTitle(day.formatted(.dateTime.weekday(.wide).day().month(.wide)))
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button {
                    appModel.present(.checkIn(day))
                } label: {
                    Label("Check-in", systemImage: "sun.horizon")
                }
            }
        }
    }

    private func headerCard(_ summary: PerformanceSummary, tradeCount: Int) -> some View {
        Card {
            HStack(alignment: .top, spacing: Theme.Spacing.xl) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Netto-P&L").font(.metricLabel).foregroundStyle(.secondary)
                    PnLText(value: summary.totalPnL, font: .metricHero)
                }
                Spacer()
                LazyVGrid(columns: [GridItem(.adaptive(minimum: 90), spacing: Theme.Spacing.l)], alignment: .leading, spacing: Theme.Spacing.m) {
                    InlineStat(label: "Trades", value: "\(tradeCount)")
                    InlineStat(label: "Win-Rate", value: Format.percent(summary.winRate))
                    InlineStat(label: "Ø R", value: summary.averageR.map { Format.r($0) } ?? "—", tint: summary.averageR.map { Color.pnl($0) })
                    InlineStat(label: "Größter Verlust", value: Format.currency(summary.largestLoss, code: settings.currencyCode, signed: true), tint: summary.largestLoss < 0 ? .loss : nil)
                }
                .frame(maxWidth: 420)
            }
        }
    }

    private var stateCard: some View {
        TitledCard("Zustand & Regime", systemImage: "heart.text.square.fill") {
            if let checkIn {
                HStack(spacing: Theme.Spacing.xl) {
                    InlineStat(label: "Schlaf", value: "\(Format.number(checkIn.sleepHours, digits: 1)) h")
                    InlineStat(label: "Stress", value: "\(checkIn.stressLevel)/5", tint: checkIn.stressLevel >= 4 ? .loss : nil)
                    InlineStat(label: "Stimmung", value: "\(checkIn.mood)/5", tint: checkIn.mood <= 2 ? .loss : nil)
                    if let regime {
                        InlineStat(label: "Regime", value: regime.regime.title)
                    }
                }
            } else {
                VStack(alignment: .leading, spacing: Theme.Spacing.s) {
                    Text("Kein Check-in für diesen Tag.").font(.explanation).foregroundStyle(.secondary)
                    if let regime {
                        InlineStat(label: "Regime", value: regime.regime.title)
                    }
                    Button("Nachtragen") { appModel.present(.checkIn(day)) }
                        .buttonStyle(.bordered)
                        .controlSize(.small)
                }
            }
        }
    }

    private func patternsCard(_ patterns: [TiltDetection]) -> some View {
        TitledCard("Muster an diesem Tag", systemImage: "waveform.path.ecg") {
            if patterns.isEmpty {
                Text("Keine Tilt-Muster erkannt.").font(.explanation).foregroundStyle(.secondary)
            } else {
                VStack(alignment: .leading, spacing: 8) {
                    ForEach(patterns) { detection in
                        let warning = TiltMonitor.warning(for: detection, trade: trades.last ?? Trade(symbol: ""), settings: settings)
                        HStack(alignment: .top, spacing: 8) {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .foregroundStyle(detection.severity == .critical ? Color.loss : Color.warning)
                                .font(.caption)
                            VStack(alignment: .leading, spacing: 2) {
                                Text(warning.title).font(.caption.weight(.semibold))
                                Text(warning.message).font(.caption2).foregroundStyle(.secondary).fixedSize(horizontal: false, vertical: true)
                            }
                        }
                    }
                }
            }
        }
    }

    private var tradesCard: some View {
        TitledCard("Trades", systemImage: "list.bullet.rectangle.fill") {
            if trades.isEmpty {
                Text("Keine Trades an diesem Tag.").font(.explanation).foregroundStyle(.secondary)
            } else {
                VStack(spacing: 0) {
                    TradeRowHeader()
                    ForEach(trades) { trade in
                        NavigationLink(value: trade) {
                            TradeRow(trade: trade)
                                .padding(.vertical, 8)
                                .padding(.horizontal, 6)
                                .contentShape(Rectangle())
                        }
                        .buttonStyle(.plain)
                        .hoverHighlight()
                        if trade.id != trades.last?.id {
                            Divider().overlay(Color.cardBorder)
                        }
                    }
                }
            }
        }
    }

    private var notesCard: some View {
        TitledCard("Tagesnotiz", subtitle: "Was war heute wichtig?", systemImage: "note.text") {
            DayNoteEditor(day: day, checkIn: checkIn)
        }
    }
}

/// Editor für die Tagesnotiz; legt bei Bedarf einen Check-in-Eintrag an.
private struct DayNoteEditor: View {
    @Environment(\.modelContext) private var modelContext
    let day: Date
    let checkIn: DailyCheckIn?
    @State private var text: String = ""
    @State private var loaded = false

    var body: some View {
        TextEditor(text: $text)
            .font(.body)
            .frame(minHeight: 90)
            .scrollContentBackground(.hidden)
            .padding(8)
            .background(RoundedRectangle(cornerRadius: Theme.Radius.control, style: .continuous).fill(Color.elevatedFill))
            .overlay(alignment: .topLeading) {
                if text.isEmpty {
                    Text("Marktgeschehen, Stimmung, Learnings …")
                        .foregroundStyle(.tertiary)
                        .padding(.top, 16)
                        .padding(.leading, 13)
                        .allowsHitTesting(false)
                }
            }
            .onAppear {
                guard !loaded else { return }
                loaded = true
                text = checkIn?.note ?? ""
            }
            .onChange(of: text) { _, newValue in
                if let checkIn {
                    checkIn.note = newValue
                } else if !newValue.isEmpty {
                    modelContext.insert(DailyCheckIn(date: day, note: newValue))
                }
                try? modelContext.save()
            }
    }
}
