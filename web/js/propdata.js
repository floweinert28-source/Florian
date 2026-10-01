/* Journalyst – Prop-Firm-Daten: eingebaute Firmen-Presets, Ausgabe-Typen, Märkte, Drawdown-Typen und Standard-Instrumente.
 *
 * WICHTIG: Alle Zahlen in PRESETS und instrumentsDefault sind typische, aus dem Gedächtnis eingetragene Werte, KEINE geprüften Fakten.
 * Prop Firms ändern Regeln und Preise laufend (Aktionen, Rabatte, neue Kontotypen). Deshalb trägt jedes Preset unverified: true und
 * lastVerified: null; die Oberfläche zeigt dazu „unverifiziert, bitte prüfen“. Beim Anlegen eines Kontos werden die Regeln als Momentaufnahme
 * ins Konto kopiert – spätere Änderungen am Preset ändern bestehende Konten nicht.
 *
 * Preset: { id, firm, name ('50K'), market: 'futures'|'forex', size, currency, rules: RuleSet (siehe prop.js), fees: { challenge, reset, activation, monthly, data },
 *           profitSplit (0..1), payout: { minDays, minProfit, minBalance }, lastVerified: 'YYYY-MM-DD'|null, unverified: boolean, note }
 * Instrument: { symbol, market, tickSize, tickValue (je Kontrakt und Tick), pipSize, pipValue (je Standard-Lot und Pip), currency, unverified }
 */
(function (root) {
  'use strict';

  const MARKETS = [['futures', 'Futures'], ['forex', 'Forex / CFD']];
  const DRAWDOWN_TYPES = [['static', 'Statisch (fest ab Start)'], ['trailing_intraday', 'Trailing intraday'], ['trailing_eod', 'Trailing Tagesende'], ['trailing_lock', 'Trailing mit Lock']];
  const EXPENSE_TYPES = [['challenge', 'Challenge-Gebühr'], ['reset', 'Reset'], ['activation', 'Aktivierung'], ['subscription', 'Monatsgebühr'], ['data', 'Datengebühr'], ['other', 'Sonstiges']];

  /* Hilfen für kompakte Preset-Definitionen */
  const abs = v => ({ value: v, mode: 'abs' });
  const pct = v => ({ value: v, mode: 'pct' });
  const dailyLoss = (lim, resetTime, tz, basis = 'balance') => lim ? Object.assign({ basis, resetTime, tz }, lim) : null;
  const drawdown = (lim, type, lockAt = null, basis = 'intraday') => lim ? Object.assign({ type, lockAt, basis }, lim) : null;
  const rules = o => Object.assign({ dailyLoss: null, drawdown: null, profitTarget: null, minTradingDays: null, maxContracts: null, consistency: null }, o);
  const fees = (challenge, reset, activation, monthly, data = 0) => ({ challenge, reset, activation, monthly, data });
  const preset = o => Object.assign({ market: 'futures', currency: 'USD', profitSplit: 0.9, payout: { minDays: null, minProfit: null, minBalance: null }, lastVerified: null, unverified: true, note: '' }, o);

  const CT = 'America/Chicago', PRAGUE = 'Europe/Prague', NY = 'America/New_York';
  const UNV = 'Typische Werte aus dem Gedächtnis, nicht geprüft – bitte vor dem Anlegen eines Kontos auf der Website der Firma kontrollieren.';

  const PRESETS = [
    /* ---------- Topstep (Futures, Trading Combine) ---------- */
    preset({ id: 'topstep-50k', firm: 'Topstep', name: '50K', size: 50000,
      rules: rules({ dailyLoss: null, drawdown: drawdown(abs(2000), 'trailing_eod', null, 'eod'), profitTarget: abs(3000), minTradingDays: 2, maxContracts: 5, consistency: { maxDayPct: 50 } }),
      fees: fees(49, 49, 149, 49), profitSplit: 0.9, payout: { minDays: 5, minProfit: null, minBalance: null },
      note: `${UNV} Daily Loss Limit soll 2024 abgeschafft worden sein (früher 1.000). Maximum Loss Limit trailt auf Tagesend-Basis. Payout: 5 Gewinntage mit je mindestens 200, Consistency 50 % in der Funded-Phase. Preise ohne Rabattaktionen.` }),
    preset({ id: 'topstep-100k', firm: 'Topstep', name: '100K', size: 100000,
      rules: rules({ dailyLoss: null, drawdown: drawdown(abs(3000), 'trailing_eod', null, 'eod'), profitTarget: abs(6000), minTradingDays: 2, maxContracts: 10, consistency: { maxDayPct: 50 } }),
      fees: fees(99, 99, 149, 99), profitSplit: 0.9, payout: { minDays: 5, minProfit: null, minBalance: null },
      note: `${UNV} Daily Loss Limit soll 2024 abgeschafft worden sein (früher 2.000). Maximum Loss Limit trailt auf Tagesend-Basis. Payout: 5 Gewinntage mit je mindestens 200, Consistency 50 % in der Funded-Phase.` }),

    /* ---------- Apex Trader Funding (Futures) ---------- */
    preset({ id: 'apex-50k', firm: 'Apex Trader Funding', name: '50K', size: 50000,
      rules: rules({ dailyLoss: null, drawdown: drawdown(abs(2500), 'trailing_lock', 100, 'intraday'), profitTarget: abs(3000), minTradingDays: 7, maxContracts: 10, consistency: { maxDayPct: 30 } }),
      fees: fees(167, 80, 140, 167), profitSplit: 0.9, payout: { minDays: 8, minProfit: 500, minBalance: 52600 },
      note: `${UNV} Trailing Threshold intraday (auch unrealisiert); stoppt bei Start + Threshold + 100, der Boden bleibt dann bei Start + 100 (lockAt). Consistency 30 % und Mindestbalance gelten für Payouts im PA-Konto. Aktivierung: einmalig (alternativ monatlich). Listenpreise, meist stark rabattiert.` }),
    preset({ id: 'apex-100k', firm: 'Apex Trader Funding', name: '100K', size: 100000,
      rules: rules({ dailyLoss: null, drawdown: drawdown(abs(3000), 'trailing_lock', 100, 'intraday'), profitTarget: abs(6000), minTradingDays: 7, maxContracts: 14, consistency: { maxDayPct: 30 } }),
      fees: fees(207, 80, 140, 207), profitSplit: 0.9, payout: { minDays: 8, minProfit: 500, minBalance: 103100 },
      note: `${UNV} Trailing Threshold intraday; Lock bei Start + 100. Consistency 30 % und Mindestbalance gelten für Payouts im PA-Konto. Listenpreise, meist stark rabattiert.` }),

    /* ---------- MyFundedFutures (Futures, Starter-Plan) ---------- */
    preset({ id: 'mffu-50k', firm: 'MyFundedFutures', name: '50K Starter', size: 50000,
      rules: rules({ dailyLoss: null, drawdown: drawdown(abs(2000), 'trailing_eod', null, 'eod'), profitTarget: abs(3000), minTradingDays: 1, maxContracts: 3, consistency: { maxDayPct: 40 } }),
      fees: fees(80, 80, 0, 80), profitSplit: 0.9, payout: { minDays: 5, minProfit: 1000, minBalance: null },
      note: `${UNV} Drawdown trailt auf Tagesend-Basis. Consistency 40 % im Starter-Plan. Mindestauszahlung 1.000. Andere Pläne (Expert, Milestone) haben abweichende Regeln.` }),
    preset({ id: 'mffu-100k', firm: 'MyFundedFutures', name: '100K Starter', size: 100000,
      rules: rules({ dailyLoss: null, drawdown: drawdown(abs(3000), 'trailing_eod', null, 'eod'), profitTarget: abs(6000), minTradingDays: 1, maxContracts: 6, consistency: { maxDayPct: 40 } }),
      fees: fees(150, 150, 0, 150), profitSplit: 0.9, payout: { minDays: 5, minProfit: 1000, minBalance: null },
      note: `${UNV} Drawdown trailt auf Tagesend-Basis. Consistency 40 % im Starter-Plan. Mindestauszahlung 1.000.` }),

    /* ---------- FTMO (Forex/CFD) ---------- */
    preset({ id: 'ftmo-10k', firm: 'FTMO', name: '10K', market: 'forex', size: 10000,
      rules: rules({ dailyLoss: dailyLoss(pct(5), '00:00', PRAGUE, 'equity'), drawdown: drawdown(pct(10), 'static'), profitTarget: pct(10), minTradingDays: 4, maxContracts: null, consistency: null }),
      fees: fees(155, 0, 0, 0), profitSplit: 0.8, payout: { minDays: null, minProfit: null, minBalance: null },
      note: `${UNV} Gebühr in EUR (155 €), bei Bestehen erstattet. Ziel 10 % in Phase 1 (FTMO Challenge), 5 % in Phase 2 (Verification) – für Phase 2 das Ziel im Konto anpassen. Daily Loss ab Tagesbeginn-Equity, Reset Mitternacht CE(S)T. Payout nach 14 Kalendertagen, Split 80 % (Scaling bis 90 %).` }),
    preset({ id: 'ftmo-100k', firm: 'FTMO', name: '100K', market: 'forex', size: 100000,
      rules: rules({ dailyLoss: dailyLoss(pct(5), '00:00', PRAGUE, 'equity'), drawdown: drawdown(pct(10), 'static'), profitTarget: pct(10), minTradingDays: 4, maxContracts: null, consistency: null }),
      fees: fees(540, 0, 0, 0), profitSplit: 0.8, payout: { minDays: null, minProfit: null, minBalance: null },
      note: `${UNV} Gebühr in EUR (540 €), bei Bestehen erstattet. Ziel 10 % in Phase 1, 5 % in Phase 2 – für Phase 2 anpassen. Daily Loss ab Tagesbeginn-Equity, Reset Mitternacht CE(S)T. Payout nach 14 Kalendertagen, Split 80 % (Scaling bis 90 %).` }),

    /* ---------- The5ers (Forex/CFD, High Stakes) ---------- */
    preset({ id: 'the5ers-20k', firm: 'The5ers', name: '20K High Stakes', market: 'forex', size: 20000,
      rules: rules({ dailyLoss: dailyLoss(pct(5), '00:00', NY, 'balance'), drawdown: drawdown(pct(10), 'static'), profitTarget: pct(8), minTradingDays: 3, maxContracts: null, consistency: null }),
      fees: fees(165, 0, 0, 0), profitSplit: 0.8, payout: { minDays: null, minProfit: null, minBalance: null },
      note: `${UNV} Ziel 8 % in Schritt 1, 5 % in Schritt 2 – für Schritt 2 anpassen. Mindestens 3 profitable Handelstage. Split 80 %, steigend bis 100 %. Zeitzone des Tageswechsels prüfen.` }),
    preset({ id: 'the5ers-100k', firm: 'The5ers', name: '100K High Stakes', market: 'forex', size: 100000,
      rules: rules({ dailyLoss: dailyLoss(pct(5), '00:00', NY, 'balance'), drawdown: drawdown(pct(10), 'static'), profitTarget: pct(8), minTradingDays: 3, maxContracts: null, consistency: null }),
      fees: fees(495, 0, 0, 0), profitSplit: 0.8, payout: { minDays: null, minProfit: null, minBalance: null },
      note: `${UNV} Ziel 8 % in Schritt 1, 5 % in Schritt 2 – für Schritt 2 anpassen. Mindestens 3 profitable Handelstage. Split 80 %, steigend bis 100 %. Zeitzone des Tageswechsels prüfen.` }),
  ];

  /* Instrument-Spezifikationen (editierbar unter Prop Firms → Rechner). tickValue je Kontrakt und Tick; pipValue je Standard-Lot (100.000) und Pip.
   * USDJPY: Pip-Wert hängt vom Kurs ab (1.000 / Kurs in USD) – hier ein Richtwert bei etwa 150. */
  const instrumentsDefault = [
    { symbol: 'ES', name: 'E-mini S&P 500', market: 'futures', tickSize: 0.25, tickValue: 12.5, pipSize: null, pipValue: null, currency: 'USD', unverified: true },
    { symbol: 'NQ', name: 'E-mini Nasdaq 100', market: 'futures', tickSize: 0.25, tickValue: 5, pipSize: null, pipValue: null, currency: 'USD', unverified: true },
    { symbol: 'MES', name: 'Micro E-mini S&P 500', market: 'futures', tickSize: 0.25, tickValue: 1.25, pipSize: null, pipValue: null, currency: 'USD', unverified: true },
    { symbol: 'MNQ', name: 'Micro E-mini Nasdaq 100', market: 'futures', tickSize: 0.25, tickValue: 0.5, pipSize: null, pipValue: null, currency: 'USD', unverified: true },
    { symbol: 'CL', name: 'Crude Oil', market: 'futures', tickSize: 0.01, tickValue: 10, pipSize: null, pipValue: null, currency: 'USD', unverified: true },
    { symbol: 'GC', name: 'Gold', market: 'futures', tickSize: 0.1, tickValue: 10, pipSize: null, pipValue: null, currency: 'USD', unverified: true },
    { symbol: 'EURUSD', name: 'Euro / US-Dollar', market: 'forex', tickSize: null, tickValue: null, pipSize: 0.0001, pipValue: 10, currency: 'USD', unverified: true },
    { symbol: 'GBPUSD', name: 'Pfund / US-Dollar', market: 'forex', tickSize: null, tickValue: null, pipSize: 0.0001, pipValue: 10, currency: 'USD', unverified: true },
    { symbol: 'USDJPY', name: 'US-Dollar / Yen', market: 'forex', tickSize: null, tickValue: null, pipSize: 0.01, pipValue: 6.67, currency: 'USD', unverified: true },
  ];

  root.PropData = { PRESETS, EXPENSE_TYPES, MARKETS, DRAWDOWN_TYPES, instrumentsDefault };
})(typeof self !== 'undefined' ? self : this);
