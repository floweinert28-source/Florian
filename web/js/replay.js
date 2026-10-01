/* Journalyst – Blind-Replay: Karteikasten, Kartenauswahl, Bewertung und Statistik (ohne DOM, in Node testbar).
   Der Nutzer sieht alte eigene Trades ohne Ergebnis (Screenshot vor dem Einstieg), entscheidet „Nehmen“ oder „Skippen“ mit Sicherheit 1–3.
   Richtig heißt: Gewinner genommen oder Verlierer geskippt. Falsch eingeschätzte Trades kommen über den Karteikasten (3 Fächer) öfter wieder.
   Die Oberfläche liegt in web/js/screens/replay.js, die Karten-Historie in Store.data.replay.history. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./core.js'));
  else root.Replay = factory(root.Core);
})(typeof self !== 'undefined' ? self : this, function (C) {
  'use strict';
  const EPS = C.EPS;
  /* Karteikasten: Fach 1 = zuletzt falsch (oder Startfach), Fach 3 = oberstes Fach. Gewichte für die Ziehung, 'unseen' = noch nie beantwortet. */
  const BOXES = 3;
  const WEIGHTS = { 1: 4, 2: 2, 3: 1, unseen: 3 };
  const RECENT = 20;

  /* ---------- Hilfen ---------- */
  /* Nimmt abgeleitete (C.derive) wie rohe Trades entgegen; rohe werden abgeleitet */
  const ensure = t => t && typeof t.closed === 'boolean' && t.open instanceof Date ? t : C.derive(t || {});
  const hasPre = t => typeof t.screenshotPre === 'string' && t.screenshotPre.trim() !== '';
  /* Gewinner = Netto-P&L > EPS. Alles andere zählt als Verlierer: echte Verluste und Break-even (|P&L| ≤ EPS). Auch ein Trade, den der eingestellte
     Break-even-Bereich als Status 'be' führt, wird hier nur über sein P&L beurteilt: wer im Replay „Nehmen“ wählt, soll dafür Geld bekommen haben. */
  const isWinner = t => ensure(t).pnl > EPS;
  const rate = (correct, n) => n ? correct / n : null;
  const cmpAt = (a, b) => { const x = String(a.at || ''), y = String(b.at || ''); return x < y ? -1 : x > y ? 1 : 0; };
  /* Historie chronologisch nach 'at' (stabil, also bleibt die Eingabereihenfolge bei gleichem Zeitstempel erhalten); kaputte Einträge fliegen raus */
  const sortedHistory = history => (Array.isArray(history) ? history : []).filter(h => h && h.tradeId != null).slice().sort(cmpAt);
  const clampConf = v => { const c = Math.round(Number(v)); return c >= 1 && c <= BOXES ? c : 2; };

  /* ---------- Welche Trades taugen als Karte? ---------- */
  /* Geschlossene Trades mit nicht-leerem screenshotPre (Blob-ID des Screenshots vor dem Einstieg). Reihenfolge der Eingabe bleibt erhalten. */
  function eligible(trades) {
    return (Array.isArray(trades) ? trades : []).map(ensure).filter(t => t.closed && hasPre(t));
  }

  /* ---------- Karteikasten ---------- */
  /* Map tradeId → { box: 1|2|3, seen, correct, last }. Jeder Trade startet gedanklich in Fach 1: richtig → ein Fach höher (Deckel 3), falsch → zurück in Fach 1. */
  function boxes(history) {
    const m = new Map();
    for (const h of sortedHistory(history)) {
      const e = m.get(h.tradeId) || { box: 1, seen: 0, correct: 0, last: null };
      e.seen++;
      if (h.correct) { e.correct++; e.box = Math.min(BOXES, e.box + 1); } else e.box = 1;
      e.last = h.at == null ? e.last : h.at;
      m.set(h.tradeId, e);
    }
    return m;
  }

  /* ---------- Kartenauswahl ---------- */
  /* Bis zu n verschiedene Trades (nach id), gewichtete Ziehung ohne Zurücklegen: Fach 1 = 4, Fach 2 = 2, Fach 3 = 1, nie gesehen = 3.
     rng liefert Zahlen in [0,1) (z. B. C.mulberry(seed) für reproduzierbare Sessions), ohne rng Math.random.
     Der zuletzt beantwortete Trade kommt nicht als erste Karte, solange es Alternativen gibt. */
  function pick(eligibleTrades, history, n = 10, rng) {
    const random = typeof rng === 'function' ? rng : Math.random;
    const seen = new Set(); const list = [];
    for (const t of (Array.isArray(eligibleTrades) ? eligibleTrades : [])) { if (!t || t.id == null || seen.has(t.id)) continue; seen.add(t.id); list.push(t); }
    const want = n == null ? 10 : Math.max(0, Math.floor(Number(n)) || 0);
    const count = Math.min(want, list.length);
    const bx = boxes(history); const hist = sortedHistory(history); const lastId = hist.length ? hist[hist.length - 1].tradeId : null;
    const weightOf = t => { const e = bx.get(t.id); return e ? (WEIGHTS[e.box] || WEIGHTS[1]) : WEIGHTS.unseen; };
    let pool = list.map(t => ({ t, w: weightOf(t) })); const out = [];
    while (out.length < count && pool.length) {
      let cand = pool;
      if (!out.length && lastId != null && pool.length > 1) { const alt = pool.filter(p => p.t.id !== lastId); if (alt.length) cand = alt; }
      const total = C.sum(cand.map(p => p.w)); let r = random() * total; let idx = cand.length - 1;
      for (let i = 0; i < cand.length; i++) { r -= cand[i].w; if (r < 0) { idx = i; break; } }
      const chosen = cand[idx]; out.push(chosen.t); pool = pool.filter(p => p !== chosen);
    }
    return out;
  }

  /* ---------- Bewertung einer Entscheidung ---------- */
  /* decision 'take' | 'skip' (alles außer 'take' gilt als Skippen). Richtig = Gewinner genommen oder Verlierer geskippt. r bleibt null, wenn der Trade kein Risiko kennt. */
  function grade(trade, decision) {
    const t = ensure(trade); const winner = isWinner(t); const take = String(decision || '').toLowerCase() === 'take';
    return { correct: take ? winner : !winner, winner, r: t.r == null ? null : t.r, pnl: t.pnl };
  }

  /* ---------- Statistik über die Historie ---------- */
  /* Gesamt, je Setup (absteigend nach Anzahl), je Sicherheit (1–3, nur wenn es Karten gibt), je Session (chronologisch), letzte 20 Karten, Karteikasten-Belegung
     über die übergebenen Trades. Karten zu gelöschten Trades zählen weiter zur Trefferquote, landen bei „Ohne Setup“ und fehlen im Karteikasten. */
  function stats(history, trades) {
    const byId = new Map(); for (const t of (Array.isArray(trades) ? trades : [])) if (t && t.id != null) byId.set(t.id, t);
    const hist = sortedHistory(history); const n = hist.length; const correct = hist.filter(h => h.correct).length;
    const setupOf = h => { const t = byId.get(h.tradeId); const s = t && t.setup != null ? String(t.setup).trim() : ''; return s || 'Ohne Setup'; };
    const groupMap = new Map();
    for (const h of hist) { const k = setupOf(h); const e = groupMap.get(k) || { setup: k, n: 0, correct: 0 }; e.n++; if (h.correct) e.correct++; groupMap.set(k, e); }
    const bySetup = [...groupMap.values()].map(e => Object.assign(e, { hitRate: rate(e.correct, e.n) })).sort((a, b) => b.n - a.n || b.correct - a.correct || a.setup.localeCompare(b.setup, 'de'));
    const byConfidence = n ? [1, 2, 3].map(c => { const sel = hist.filter(h => clampConf(h.confidence) === c); const ok = sel.filter(h => h.correct).length; return { confidence: c, n: sel.length, correct: ok, hitRate: rate(ok, sel.length) }; }) : [];
    const sessions = new Map();
    for (const h of hist) { const k = h.sessionId == null ? '' : String(h.sessionId); const e = sessions.get(k) || { sessionId: h.sessionId == null ? null : h.sessionId, at: h.at == null ? null : h.at, n: 0, correct: 0 }; e.n++; if (h.correct) e.correct++; sessions.set(k, e); }
    const timeline = [...sessions.values()].map(e => Object.assign(e, { hitRate: rate(e.correct, e.n) }));
    const last = hist.slice(-RECENT); const recent = rate(last.filter(h => h.correct).length, last.length);
    const bx = boxes(hist); const boxCount = { 1: 0, 2: 0, 3: 0 }; let seenTrades = 0;
    for (const [id, e] of bx) if (byId.has(id)) { boxCount[e.box]++; seenTrades++; }
    const unseen = eligible([...byId.values()]).filter(t => !bx.has(t.id)).length;
    return { n, correct, hitRate: rate(correct, n), bySetup, byConfidence, timeline, recent, boxes: boxCount, seenTrades, unseen };
  }

  return { BOXES, WEIGHTS, RECENT, eligible, boxes, pick, grade, stats, isWinner };
});
