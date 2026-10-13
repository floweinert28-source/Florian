# Paket 049 · diagramme, statistik

Schritte: 3 · Dateien: web/README.md, web/js/ui.js
Betroffene Tests laut Spezifikation: Sonde 20 (390px Wochenlabels)
Baut auf Paketen auf: 15, 46, 47, 48

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## diagramme-P1 · README Statistiken (Z. 109–111): Kurve, leere Fächer, Median-Linie

Gruppe diagramme · Cluster statistik · Aufwand S · Befunde: diagramme-13, diagramme-12, diagramme-21
Quelle: audit/spec/diagramme.md Z. 753–758 · Dateien: web/README.md
Abhängig von: diagramme-G1, diagramme-B1, diagramme-C16

```text
### 3.16 `web/README.md`

- **P1** Z. 109–111 (Statistiken) ergänzen:
  - „Kurve ‚Kumulierter Netto-P&L‘ mit einem Punkt je Handelstag wie im Dashboard, nur mit abgeschlossenen Trades“
  - „Wochentag, Uhrzeit (1-h-Fächer) und Haltedauer zeigen leere Fächer grau beschriftet“
  - „Monte Carlo mit Median-Linie“
```

## diagramme-C17 · drawers.hist: Pfad-Balken, Prozent-Achse über niceTicks, Ruin-Linie gestrichelt mit „Ruin ab …“

Gruppe diagramme · Cluster diagramme · Aufwand M · Befunde: bereich_statistik-44, diagramme-22, diagramme-11
Quelle: audit/spec/diagramme.md Z. 506–517 · Dateien: web/js/ui.js
Abhängig von: diagramme-C1, diagramme-C5, diagramme-A1

```text
**C17 `drawers.hist`** (bereich_statistik-44, Ergänzung diagramme-22, diagramme-11)

Z. 353–354 ersetzen. Der Rumpf nach der Leer-Prüfung:
```js
const n = mc.hist.length, max = Math.max(1, ...mc.hist.map(b => b.n)), mb = 20, mt = 18, gap = W / n, maxP = mc.hist[n - 1].hi, xp = p => p / maxP * W;
const tk = niceTicks(0, maxP, 4).filter(t => t <= maxP + 1e-9); const rx = mc.ruinPct <= maxP ? xp(mc.ruinPct) : null;
el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${mc.hist.map((b, i) => { if (!b.n) return ''; const h = b.n / max * (H - mb - mt); return `<path class="br" d="${vbarPath(i * gap + 1, Math.max(1, gap - 2), H - mb, H - mb - h)}" fill="…Farbe laut bereich_statistik-25…" fill-opacity="…" data-tip="Drawdown ${fmt.pct(b.lo, 0)} bis ${fmt.pct(b.hi, 0)}: ${b.n} Durchläufe"></path>`; }).join('')}
  ${rx != null ? `<line x1="${rx}" x2="${rx}" y1="4" y2="${H - mb}" stroke="var(--loss)" stroke-opacity=".8" stroke-dasharray="4 3"/><text class="lbl" x="${rx > 90 ? rx - 4 : rx + 4}" y="12" text-anchor="${rx > 90 ? 'end' : 'start'}" style="fill:var(--loss)">Ruin ab ${fmt.pct(mc.ruinPct, 0)}</text>` : ''}
  ${tk.map((t, j) => `<text x="${xp(t)}" y="${H - 5}" text-anchor="${j === 0 ? 'start' : t >= maxP * 0.97 ? 'end' : 'middle'}">${fmt.pct(t, 0)}</text>`).join('')}</svg>`;
```
Die Farbe der Fächer kommt aus der Farb-Spezifikation: `b.lo >= mc.ruinPct` → `var(--loss)` .9, sonst `var(--text-2)` .45.

```

## diagramme-C18 · drawers.weeks: Pfad-Säulen, Score über Säule, Wochenlabels ausgedünnt ab jüngster Woche

Gruppe diagramme · Cluster diagramme · Aufwand M · Befunde: bereich_training-15, responsiv-34, diagramme-25, bereich_training-16, diagramme-11
Quelle: audit/spec/diagramme.md Z. 518–527 · Dateien: web/js/ui.js
Abhängig von: diagramme-C5, diagramme-A1

```text
**C18 `drawers.weeks`** (bereich_training-15, responsiv-34, diagramme-25, Ergänzung bereich_training-16, diagramme-11)

Z. 358–360 ersetzen. Der Rumpf nach der Leer-Prüfung:
```js
const mb = 18, mt = 16, gap = W / w.length, bw = Math.min(28, gap * 0.6); /* bei wenig Platz kurze Daten (03.08.) und nur jede n-te Woche beschriftet, die jüngste immer */
const lbl = d0 => gap < 66 ? new Date(d0).toLocaleDateString(LOC(), { day: '2-digit', month: '2-digit' }) : fmt.date(d0);
const every = Math.max(1, Math.ceil(44 / gap)), showL = i => (w.length - 1 - i) % every === 0, showV = gap >= 22;
el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${w.map((p, i) => { const h = Math.max(2, p.score / 100 * (H - mb - mt)), cx = i * gap + gap / 2; return `<path class="br" d="${vbarPath(cx - bw / 2, bw, H - mb, H - mb - h)}" fill="${scoreColor(p.score)}" fill-opacity=".85" data-tip="Woche ab ${fmt.date(p.week)}: Score ${Math.round(p.score)} (${p.n} Trades)"></path>${showV ? `<text class="bv" x="${cx}" y="${H - mb - h - 5}" text-anchor="middle">${Math.round(p.score)}</text>` : ''}${showL(i) ? `<text x="${cx}" y="${H - 4}" text-anchor="middle">${lbl(p.week)}</text>` : ''}`; }).join('')}</svg>`;
```

```

**Hinweise aus der Abstimmung (verbindlich):**

- [reihenfolge: U.drawers.weeks] diagramme-C18 schreibt den Rumpf mit data-tip `Woche ab ${fmt.date(p.week)}: Score ${Math.round(p.score)} (${p.n} Trades)` wörtlich. Danach ersetzt wording-S1.6 den Teil `(${p.n} Trades)` durch `(${count(p.n, 'Trade', 'Trades')})`. In umgekehrter Reihenfolge würde C18 den alten Text zurückbringen.
