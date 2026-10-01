# Prop-Firm-Presets: Werte zum Prüfen

Alle Zahlen in `web/js/propdata.js` sind aus dem Gedächtnis eingetragen und als **unverifiziert** markiert. Bitte jeden Wert auf der Website der Firma kontrollieren, in `propdata.js` korrigieren und dann `unverified: false` sowie `lastVerified: 'JJJJ-MM-TT'` setzen. Bestehende Konten behalten ihren Regel-Snapshot.

| Preset | Markt | Größe | Daily Loss | Reset / Zeitzone | Max. Drawdown | Typ | Lock | Profit Target | Min. Tage | Max. Kontrakte/Lots | Consistency | Challenge-Gebühr | Reset | Aktivierung | Monatlich | Split | Payout min. Tage | Payout min. Gewinn | Payout min. Balance |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Topstep 50K (`topstep-50k`) | futures | 50.000 USD | — | — | 2.000 | trailing Tagesende (eod) | — | 3.000 | 2 | 5 | 50 % | 49 | 49 | 149 | 49 | 90 % | 5 | — | — |
| Topstep 100K (`topstep-100k`) | futures | 100.000 USD | — | — | 3.000 | trailing Tagesende (eod) | — | 6.000 | 2 | 10 | 50 % | 99 | 99 | 149 | 99 | 90 % | 5 | — | — |
| Apex Trader Funding 50K (`apex-50k`) | futures | 50.000 USD | — | — | 2.500 | trailing + Lock (intraday) | 100 | 3.000 | 7 | 10 | 30 % | 167 | 80 | 140 | 167 | 90 % | 8 | 500 | 52600 |
| Apex Trader Funding 100K (`apex-100k`) | futures | 100.000 USD | — | — | 3.000 | trailing + Lock (intraday) | 100 | 6.000 | 7 | 14 | 30 % | 207 | 80 | 140 | 207 | 90 % | 8 | 500 | 103100 |
| MyFundedFutures 50K Starter (`mffu-50k`) | futures | 50.000 USD | — | — | 2.000 | trailing Tagesende (eod) | — | 3.000 | 1 | 3 | 40 % | 80 | 80 | 0 | 80 | 90 % | 5 | 1000 | — |
| MyFundedFutures 100K Starter (`mffu-100k`) | futures | 100.000 USD | — | — | 3.000 | trailing Tagesende (eod) | — | 6.000 | 1 | 6 | 40 % | 150 | 150 | 0 | 150 | 90 % | 5 | 1000 | — |
| FTMO 10K (`ftmo-10k`) | forex | 10.000 USD | 5 % (equity) | 00:00 Europe/Prague | 10 % | statisch (intraday) | — | 10 % | 4 | — | — | 155 | 0 | 0 | 0 | 80 % | — | — | — |
| FTMO 100K (`ftmo-100k`) | forex | 100.000 USD | 5 % (equity) | 00:00 Europe/Prague | 10 % | statisch (intraday) | — | 10 % | 4 | — | — | 540 | 0 | 0 | 0 | 80 % | — | — | — |
| The5ers 20K High Stakes (`the5ers-20k`) | forex | 20.000 USD | 5 % (balance) | 00:00 America/New_York | 10 % | statisch (intraday) | — | 8 % | 3 | — | — | 165 | 0 | 0 | 0 | 80 % | — | — | — |
| The5ers 100K High Stakes (`the5ers-100k`) | forex | 100.000 USD | 5 % (balance) | 00:00 America/New_York | 10 % | statisch (intraday) | — | 8 % | 3 | — | — | 495 | 0 | 0 | 0 | 80 % | — | — | — |

## Hinweise aus den Presets

- **Topstep 50K**: Daily Loss Limit soll 2024 abgeschafft worden sein (früher 1.000). Maximum Loss Limit trailt auf Tagesend-Basis. Payout: 5 Gewinntage mit je mindestens 200, Consistency 50 % in der Funded-Phase. Preise ohne Rabattaktionen.
- **Topstep 100K**: Daily Loss Limit soll 2024 abgeschafft worden sein (früher 2.000). Maximum Loss Limit trailt auf Tagesend-Basis. Payout: 5 Gewinntage mit je mindestens 200, Consistency 50 % in der Funded-Phase.
- **Apex Trader Funding 50K**: Trailing Threshold intraday (auch unrealisiert); stoppt bei Start + Threshold + 100, der Boden bleibt dann bei Start + 100 (lockAt). Consistency 30 % und Mindestbalance gelten für Payouts im PA-Konto. Aktivierung: einmalig (alternativ monatlich). Listenpreise, meist stark rabattiert.
- **Apex Trader Funding 100K**: Trailing Threshold intraday; Lock bei Start + 100. Consistency 30 % und Mindestbalance gelten für Payouts im PA-Konto. Listenpreise, meist stark rabattiert.
- **MyFundedFutures 50K Starter**: Drawdown trailt auf Tagesend-Basis. Consistency 40 % im Starter-Plan. Mindestauszahlung 1.000. Andere Pläne (Expert, Milestone) haben abweichende Regeln.
- **MyFundedFutures 100K Starter**: Drawdown trailt auf Tagesend-Basis. Consistency 40 % im Starter-Plan. Mindestauszahlung 1.000.
- **FTMO 10K**: Gebühr in EUR (155 €), bei Bestehen erstattet. Ziel 10 % in Phase 1 (FTMO Challenge), 5 % in Phase 2 (Verification) – für Phase 2 das Ziel im Konto anpassen. Daily Loss ab Tagesbeginn-Equity, Reset Mitternacht CE(S)T. Payout nach 14 Kalendertagen, Split 80 % (Scaling bis 90 %).
- **FTMO 100K**: Gebühr in EUR (540 €), bei Bestehen erstattet. Ziel 10 % in Phase 1, 5 % in Phase 2 – für Phase 2 anpassen. Daily Loss ab Tagesbeginn-Equity, Reset Mitternacht CE(S)T. Payout nach 14 Kalendertagen, Split 80 % (Scaling bis 90 %).
- **The5ers 20K High Stakes**: Ziel 8 % in Schritt 1, 5 % in Schritt 2 – für Schritt 2 anpassen. Mindestens 3 profitable Handelstage. Split 80 %, steigend bis 100 %. Zeitzone des Tageswechsels prüfen.
- **The5ers 100K High Stakes**: Ziel 8 % in Schritt 1, 5 % in Schritt 2 – für Schritt 2 anpassen. Mindestens 3 profitable Handelstage. Split 80 %, steigend bis 100 %. Zeitzone des Tageswechsels prüfen.

## Instrumente (Standardliste, ebenfalls unverifiziert)

| Symbol | Markt | Tick-/Pip-Größe | Tick-/Pip-Wert | Währung |
|---|---|---|---|---|
| ES | futures | 0.25 | 12.5 je Kontrakt | USD |
| NQ | futures | 0.25 | 5 je Kontrakt | USD |
| MES | futures | 0.25 | 1.25 je Kontrakt | USD |
| MNQ | futures | 0.25 | 0.5 je Kontrakt | USD |
| CL | futures | 0.01 | 10 je Kontrakt | USD |
| GC | futures | 0.1 | 10 je Kontrakt | USD |
| EURUSD | forex | 0.0001 | 10 je Standard-Lot | USD |
| GBPUSD | forex | 0.0001 | 10 je Standard-Lot | USD |
| USDJPY | forex | 0.01 | 6.67 je Standard-Lot | USD |

Im Rechner lassen sich Instrumente unter „Instrumente“ anpassen; nach dem Speichern gelten sie als geprüft.
