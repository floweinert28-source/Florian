import SwiftUI
import JournalCore

/// Vergleich von Plan und Ausführung samt Disziplin-Score.
struct PlanVsExecutionCard: View {
    @Environment(AppModel.self) private var appModel
    @Environment(SettingsStore.self) private var settings
    let trade: Trade
    let record: TradeRecord

    var body: some View {
        TitledCard("Plan vs. Ausführung", systemImage: "scope") {
            if let plan = record.plan, !plan.isEmpty {
                VStack(alignment: .leading, spacing: Theme.Spacing.l) {
                    comparisonGrid(plan)
                    if !plan.reason.isEmpty {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Grund für den Trade").font(.caption).foregroundStyle(.secondary)
                            Text(plan.reason).font(.subheadline)
                        }
                    }
                    Divider()
                    disciplineSection
                }
            } else {
                VStack(alignment: .leading, spacing: Theme.Spacing.m) {
                    Text("Kein Plan erfasst. Halte Einstieg, Stop, Ziel und Grund vor dem Trade fest – dann vergleicht das Journal automatisch mit der Ausführung.")
                        .font(.explanation)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                    Button("Plan ergänzen") { appModel.present(.editTrade(trade)) }
                        .buttonStyle(.bordered)
                    Divider()
                    disciplineSection
                }
            }
        }
    }

    private func comparisonGrid(_ plan: TradePlan) -> some View {
        Grid(alignment: .leading, horizontalSpacing: Theme.Spacing.l, verticalSpacing: 10) {
            GridRow {
                Text("")
                Text("Plan").gridColumnAlignment(.trailing)
                Text("Ausführung").gridColumnAlignment(.trailing)
                Text("Abweichung").gridColumnAlignment(.trailing)
            }
            .font(.caption.weight(.medium))
            .foregroundStyle(.secondary)

            Divider().gridCellUnsizedAxes(.horizontal)

            GridRow {
                Text("Einstieg").foregroundStyle(.secondary)
                priceText(plan.entry)
                priceText(trade.entryPrice)
                deviationText(planned: plan.entry, actual: trade.entryPrice, risk: plan.riskPerUnit, direction: trade.direction)
            }
            GridRow {
                Text("Stop").foregroundStyle(.secondary)
                priceText(plan.stop)
                priceText(trade.initialStop)
                deviationText(planned: plan.stop, actual: trade.initialStop, risk: plan.riskPerUnit, direction: trade.direction)
            }
            GridRow {
                Text("Ziel / Ausstieg").foregroundStyle(.secondary)
                priceText(plan.target)
                priceText(trade.exitPrice)
                deviationText(planned: plan.target, actual: trade.exitPrice, risk: plan.riskPerUnit, direction: trade.direction)
            }
            GridRow {
                Text("CRV").foregroundStyle(.secondary)
                Text(plan.riskRewardRatio.map { "1 : \(Format.number($0, digits: 1))" } ?? "—").numeric()
                Group {
                    if let r = record.rMultiple {
                        Text(Format.r(r)).foregroundStyle(Color.pnl(r))
                    } else {
                        Text("—")
                    }
                }
                .numeric()
                Text("")
            }
        }
        .font(.subheadline)
    }

    private func priceText(_ value: Double?) -> some View {
        Text(value.map(Format.price) ?? "—")
            .numeric()
            .gridColumnAlignment(.trailing)
    }

    /// Abweichung in R (bezogen auf das geplante Risiko), plus wenn zugunsten, minus wenn zuungunsten.
    private func deviationText(planned: Double?, actual: Double?, risk: Double?, direction: TradeDirection) -> some View {
        Group {
            if let planned, let actual, let risk, risk > 0 {
                let deviation = (actual - planned) / risk
                let text = deviation.formatted(.number.precision(.fractionLength(2)).sign(strategy: .always(includingZero: false))) + " R"
                Text(text).foregroundStyle(abs(deviation) < 0.05 ? Color.secondary : Color.primary)
            } else {
                Text("—").foregroundStyle(.tertiary)
            }
        }
        .font(.caption)
        .numeric()
        .gridColumnAlignment(.trailing)
    }

    private var disciplineSection: some View {
        let discipline = DisciplineEvaluator.evaluate(record)
        return HStack(alignment: .top, spacing: Theme.Spacing.xl) {
            VStack(spacing: 4) {
                ScoreRing(score: discipline.score, lineWidth: 7, size: 64)
                Text("Disziplin").font(.caption).foregroundStyle(.secondary)
            }
            VStack(alignment: .leading, spacing: 6) {
                ForEach(discipline.components) { component in
                    HStack(spacing: 8) {
                        Image(systemName: component.fulfillment >= 0.99 ? "checkmark.circle.fill" : (component.fulfillment > 0.3 ? "minus.circle.fill" : "xmark.circle.fill"))
                            .foregroundStyle(component.fulfillment >= 0.99 ? Color.profit : (component.fulfillment > 0.3 ? Color.warning : Color.loss))
                            .font(.subheadline)
                        Text(component.kind.title(deviation: discipline.entryDeviationR))
                            .font(.subheadline)
                        Spacer()
                        Text("\(Int((component.weightedPoints).rounded()))/\(Int(component.kind.weight * 100))")
                            .font(.caption)
                            .numeric()
                            .foregroundStyle(.tertiary)
                    }
                }
            }
        }
    }
}

extension DisciplineComponentKind {
    func title(deviation: Double?) -> String {
        switch self {
        case .planComplete: String(localized: "Plan vollständig (Einstieg, Stop, Ziel)")
        case .entryAdherence:
            if let deviation {
                String(localized: "Einstieg nahe am Plan (\(Format.number(deviation, digits: 2)) R Abweichung)")
            } else {
                String(localized: "Einstieg nahe am Plan")
            }
        case .stopRespected: String(localized: "Stop eingehalten")
        case .noMistakes: String(localized: "Keine Fehler-Tags")
        case .rulesFollowed: String(localized: "Regeln eingehalten")
        }
    }

    var shortTitle: String {
        switch self {
        case .planComplete: String(localized: "Plan")
        case .entryAdherence: String(localized: "Einstieg")
        case .stopRespected: String(localized: "Stop")
        case .noMistakes: String(localized: "Fehler")
        case .rulesFollowed: String(localized: "Regeln")
        }
    }
}
