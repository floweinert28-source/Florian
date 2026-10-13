# Paket 057 · konto, zustaende, prop

Schritte: 3 · Dateien: web/css/app.css, web/js/screens/coach.js, web/js/screens/prop.js, web/js/ui.js
Betroffene Tests laut Spezifikation: —
Baut auf Paketen auf: 4, 56

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## zustaende-S-CS2 · Coach: Skelett beim Laden statt Kurslinie

Gruppe zustaende · Cluster konto · Aufwand S · Befunde: zustaende-17
Quelle: audit/spec/zustaende.md Z. 815–817 · Dateien: web/js/screens/coach.js
Abhängig von: zustaende-S-C13

```text
**S-CS2 Skelett beim Laden** – zustaende-17
Z. 28 → `const loading = () => `<div class="coach-skel" role="status" aria-label="Wird geladen">${'<div class="skel"></div>'.repeat(5)}</div>`;` (wirkt in Z. 111, 153, 167, 184).

```

## zustaende-S-U1 · Geldbeträge immer mit zwei Nachkommastellen (fmt.cur ohne 10.000-Schwelle), Überlauf prüfen

Gruppe zustaende · Cluster zustaende · Aufwand M · Befunde: zustaende-23, wording-30, bereich_prop-6
Quelle: audit/spec/zustaende.md Z. 390–394 · Dateien: web/js/ui.js, web/css/app.css
Abhängig von: —

```text
### 3.2 `web/js/ui.js`

**S-U1 Geldbeträge immer mit zwei Stellen** – zustaende-23 (und Stellenteil von wording-30, bereich_prop-6)
Z. 122 `const a = Math.abs(v); const d = o.compact ? 0 : (a >= 10000 ? 0 : 2);` → `const a = Math.abs(v); const d = o.compact ? 0 : 2;`. Danach Dashboard-Kacheln, TradeLog-Kacheln, Affiliate-KPI-Streifen, Prop-Konto-Karten und Zertifikat (Quadrat und Story) bei 1024 und 390 px prüfen. Läuft ein Wert über, in app.css:533 die Container-Schwelle `@container (max-width: 164px)` → `190px` anheben. Nicht wieder Stellen abschneiden.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: @container (max-width: 164px)] Die Schwelle geht von 164 auf 154 (abstaende-B11). Begründung: Mit abstaende-B7 hat die Kachel seitlich 20 statt 15 px Polster. Container-Abfragen messen die Inhaltsbreite, also muss jede Abfrage um 10 px mitwandern (178 → 168, 164 → 154), sonst greifen die Notstufen bei gleicher Kachelbreite früher. Die Überlaufprüfung aus zustaende-S-U1 (Beträge immer mit zwei Nachkommastellen) läuft erst danach bei 1024 und 390 px. Nur wenn ein Wert überläuft, wird die 154er-Schwelle angehoben, höchstens auf 180px. Das entspricht den 190px aus S-U1 vor der Polster-Änderung. Stellen werden nicht abgeschnitten. Die Schriftgröße innerhalb der Abfrage entscheiden die Anker .tile .val/--fv-*, nicht dieser.
- ÄNDERN: Die Überlaufprüfung erst nach abstaende-B7/B11 machen. Läuft ein Wert über, `@container (max-width: 154px)` auf den nötigen Wert anheben, höchstens 180px (nicht 164 → 190).
- [konflikt: fmt.balance] Für Bestände und Regelgrößen gibt es keine Ganzzahl-Regel. Geld hat immer 2 Nachkommastellen (zustaende-S-U1); typografie K24 und zustaende K14 haben „Balance und Limits ganzzahlig“ ausdrücklich verworfen, nur kilook will es. fmt.balance bleibt `fmt.cur(v, o)` ohne Vorzeichen und wird im Geld-blind-Modus ausgeblendet. Ohne Cent (compact) stehen Beträge nur im Kalender-Monatsraster (.p Tageszelle, Wochensumme), an Achsen (fmt.axisCur), in Kurzformen (.pm, curShort, curCompact) und bei Monte Carlo. Damit sind Kontostand, Limits, Ziel, Puffer, „… fehlen“, „heute noch … erlaubt“, Vorschlag und die Affiliate-Kacheln so genau wie P&L, und „X von Y“ ist auf beiden Seiten gleich genau. Die Grabstein-Unterzeile zeigt keinen Geldbetrag (wording-S12.28-12.29).
- [doppelt: fmt.cur] zustaende-S-U1 setzt ui.js:122 einmal um: `const d = o.compact ? 0 : 2;`, mit Überlaufprüfung und notfalls @container 164 → 190 px. Kalender-Monatsraster mit compact: true (kilook-C9a). Das ist dieselbe Änderung wie 6.1/6.2 in wording-S6.1-6.4; wer zuerst umsetzt, macht sie, der andere überspringt. Monte Carlo ohne Cent setzt wording-S10.13-10.15 einmal um, ergänzt um das Startkapital aus kilook-C14. Prop und Affiliate bekommen kein compact (siehe fmt.balance und money). chartLabel aus barrierefreiheit-U6a nutzt das Standardformat.
- ÜBERNIMMT kilook-A1: Identische Änderung an ui.js:122.
- ÜBERNIMMT typografie-3.4a: Identische Änderung an ui.js:122.

## zustaende-S-P1 · Prop-Konto-Karte: Ampel Rot bei Verletzung, tote Konten ohne Balken/Meta, Balken ohne „von“ bei Rest > Limit, Tooltip gekappt

Gruppe zustaende · Cluster prop · Aufwand M · Befunde: bereich_prop-2, bereich_prop-3, bereich_prop-6, wording-30
Quelle: audit/spec/zustaende.md Z. 710–723 · Dateien: web/js/screens/prop.js
Abhängig von: zustaende-S-U1

```text
### 3.14 `web/js/screens/prop.js`

**S-P1 Konto-Karte** – bereich_prop-2, bereich_prop-3, bereich_prop-6, wording-30
- Z. 90 `const ampel = active ? b.ampel : 'aus';` → `const dead = ev.status === 'breached' || a.status === 'breached'; const ampel = !active ? 'aus' : ev.status === 'breached' ? 'rot' : b.ampel;`
- Z. 93 `bar` ersetzen:
```js
const bar = (lbl, x) => { if (!x) return ''; const over = x.limit > 0 && x.remaining > x.limit + C.EPS;
  const val = over ? `${money(a, x.remaining)}${x.locked ? ' <span class="muted">· Boden fest</span>' : ''}` : `${money(a, x.remaining)} <span class="muted">von ${money(a, x.limit)}</span>`;
  return `<div class="prop-bar"><div class="bl"><span>${lbl} übrig</span><b>${val}</b></div><div class="track"><i style="width:${x.limit > 0 ? Math.min(100, x.remaining / x.limit * 100).toFixed(1) : 0}%;background:${x.limit > 0 ? col(x.remaining / x.limit) : 'var(--surface-3)'}"></i></div></div>`; };
```
- Z. 100 Title `title="Ampel ${AMPEL[ampel]}${b.ratio != null ? ` · ${fmt.pct(b.ratio)} des Limits übrig` : ''}"` → `title="Ampel ${AMPEL[ampel]}${ev.status === 'breached' && active ? ' · Regel verletzt' : b.ratio != null ? ` · ${fmt.pct(Math.min(1, b.ratio))} des Limits übrig` : ''}"`
- Z. 103 `<div class="prop-bars">…</div>` → `${dead ? '' : `<div class="prop-bars">…</div>`}`
- Z. 104 `<div class="prop-meta">…</div>` → `${dead ? '' : `<div class="prop-meta">…</div>`}`

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .prop-bar] Es gibt eine bar-Funktion (prop.js:93) auf Grundlage von diagramme-J1. Ist der Rest größer als das Limit, zeigt sie `${money(a, x.remaining)} <span class="muted">${x.locked ? 'über dem festen Boden' : 'über dem Boden'}</span>`. Am <b> steht nur bei x.floor != null ein data-tip „Boden fest bei {Betrag}“ bzw. „Boden bei {Betrag}“ (money(a, x.floor)). Sonst steht „{Rest} von {Limit}“. Der Balken ist bei Rest > Limit voll (min 100 %). Begründung: „über dem Boden“ sagt, was die Zahl bedeutet (Diagramme A-13). Der feste Boden bleibt wie in zustaende-S-P1 sichtbar, auch am Handy ohne Tooltip, und ohne das doppelte „Boden … · Boden fest“. Alle anderen Teile von zustaende-S-P1 bleiben: Ampel rot bei Verletzung, geplatzte Konten ohne Balken und Meta, Title gekappt. Die neuen Texte „über dem Boden“, „über dem festen Boden“, „Boden bei {0}“ und „Boden fest bei {0}“ kommen in alle fünf js/lang-Dateien.
- ÄNDERN: Der Ersatz der bar-Funktion (Z. 93) entfällt hier, diagramme-J1 übernimmt ihn. Z. 90 (dead/Ampel), Z. 100 (Title), Z. 103 und Z. 104 (ohne Balken/Meta bei geplatzt) wie spezifiziert umsetzen.
