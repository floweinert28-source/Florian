# Paket 031 · konto

Schritte: 30 · Dateien: web/css/app.css, web/js/certificate.js, web/js/screens/affiliate.js, web/js/screens/coach.js, web/js/screens/coupons.js
Betroffene Tests laut Spezifikation: Akzeptanz 4.3 affiliate 390 (Ref-Code vollständig sichtbar); e2e/certtest.js:36 ([data-c=prev], .cert-opts .small.muted); e2e/coachtest.js:111, :154, :178; e2e/coachtest.js:127–131; e2e/coachtest.js:131 (.ct-done summary „1 erledigt“); e2e/coachtest.js:150; e2e/coupontest.js:14; web/e2e/affiliatetest.js; web/e2e/affiliatetest.js:15-16; web/e2e/affiliatetest.js:42; web/e2e/affiliatetest.js:42–55; web/e2e/affiliatetest.js:51 (Texte „Offen“/„Ausgezahlt“ bleiben); web/e2e/calmnavtest.js:44; web/e2e/coachlang2.js (neuer Text); web/e2e/coachtest.js; web/e2e/coachtest.js (Beitritt, Handy ohne Querscrollen); web/e2e/coachtest.js:81 (zählt .coach-entry.is-new, bleibt); web/e2e/coachtest.js:81, :110 (Klasse is-new bleibt); web/e2e/coupontest.js
Baut auf Paketen auf: 1, 2, 4, 5, 6, 11

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## farbe-C8b · Affiliate: Namens-Hover neutral mit Unterstrich

Gruppe farbe · Cluster konto · Aufwand S · Befunde: bereich_konto-6
Quelle: audit/spec/farbe.md Z. 415–416 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 2678 `.aff-name:hover { color: var(--accent); }` → `.aff-name:hover { color: var(--text); text-decoration: underline; text-underline-offset: 3px; }`

```

## farbe-C9 · Coach: Namens-Hover, Symbole, gewählte Option, Häkchen neutral; „Neu“-Rand und -Streifen löschen

Gruppe farbe · Cluster konto · Aufwand S · Befunde: bereich_konto-2, bereich_konto-4, bereich_konto-6
Quelle: audit/spec/farbe.md Z. 417–425 · Dateien: web/css/app.css
Abhängig von: —

```text
**C9 – `web/css/app.css` Coach** — bereich_konto-2, bereich_konto-4, bereich_konto-6
- Z. 2861 `a.coach-name:hover { color: var(--accent); }` → `{ color: var(--text); text-decoration: underline; text-underline-offset: 3px; }`
- Z. 2871 `.coach-entry.is-new { … }` löschen
- Z. 2893 `.coach-join-head .ico svg { …; color: var(--accent); }` → `color: var(--text-2);`
- Z. 2898 `.coach-yes svg { …; color: var(--accent); }` → `color: var(--text-2);` (Z. 2900 `.coach-no svg` bleibt `--faint`)
- Z. 2903 `.coach-radio:has(input:checked) { border-color: color-mix(in srgb, var(--accent) 45%, var(--border)); background: color-mix(in srgb, var(--accent) 6%, var(--surface-2)); }` → `.coach-radio:has(input:checked) { color: var(--text); background: color-mix(in srgb, var(--text) 10%, var(--surface)); border-color: color-mix(in srgb, var(--text) 22%, var(--border-2)); box-shadow: none; }` (eigene Regel, nicht in die gemeinsame Liste; dort würde `:has()` in alten Browsern die ganze Liste ungültig machen)
- Z. 2904 `.coach-radio input { margin-top: 3px; accent-color: var(--accent); }` → `accent-color: var(--text);`
- Z. 2917 `.mn-reply.is-new { box-shadow: inset 2px 0 0 var(--accent); }` löschen

```

## farbe-C16 · Affiliate: Balken --profit, „Ausgezahlt“ als ruhiger Text

Gruppe farbe · Cluster konto · Aufwand S · Befunde: farbe_kontrast-20, bereich_konto-8
Quelle: audit/spec/farbe.md Z. 452–455 · Dateien: web/js/screens/affiliate.js
Abhängig von: —

```text
**C16 – `web/js/screens/affiliate.js`** — farbe_kontrast-20, bereich_konto-8
- Z. 47 `fill="var(--accent)"` → `fill="var(--profit)"`
- Z. 67 `<td>${U.pill(paid ? 'Ausgezahlt' : 'Offen', paid ? 'win' : 'neutral')}</td>` → `<td>${paid ? '<span class="muted">Ausgezahlt</span>' : U.pill('Offen', 'neutral')}</td>`

```

## farbe-C17a · Coach: Knöpfe ohne primary, Pillen „Neu“/„{n} neu“ neutral, kein .accent, Haken muted, „0“ muted

Gruppe farbe · Cluster konto · Aufwand S · Befunde: bereich_konto-3, bereich_konto-4, bereich_konto-6, komponenten-8, farbe_kontrast-26, farbe_kontrast-11
Quelle: audit/spec/farbe.md Z. 456–462 · Dateien: web/js/screens/coach.js
Abhängig von: —

```text
**C17 – `web/js/screens/coach.js`** — bereich_konto-3, bereich_konto-4, bereich_konto-6, komponenten-8, farbe_kontrast-26, farbe_kontrast-11
- Z. 22 `class="btn primary" href="#/settings/mentor"` → `class="btn"` (navigiert, Regel 1.4)
- Z. 35 `U.pill('Neu', 'win')` → `U.pill('Neu')`
- Z. 48 `<b class="accent">${unread} ungelesen</b>` → `<b>${unread} ungelesen</b>`
- Z. 53 `class="btn sm primary"` („+ Gruppe“) → `class="btn sm"`
- Z. 86 `<span class="accent">${I.check}</span>` → `<span class="muted">${I.check}</span>`
- Z. 87 `U.pill(`${r.new} neu`, 'win')` → `U.pill(`${r.new} neu`)`; `'<span class="faint">0</span>'` → `'<span class="muted">0</span>'`
```

## farbe-C17b · Coach-Journal: allNew (keine Einzelpillen, Kopf „{n} neue Einträge“), „erledigt“ ohne .accent

Gruppe farbe · Cluster konto · Aufwand M · Befunde: bereich_konto-4, bereich_konto-6, komponenten-8, farbe_kontrast-26
Quelle: audit/spec/farbe.md Z. 463–466 · Dateien: web/js/screens/coach.js
Abhängig von: —

```text
- Z. 133 `function entryHTML(e, notes, gid, sid, myId)` → `function entryHTML(e, notes, gid, sid, myId, allNew)`; Z. 137 `${e.is_new ? ` ${U.pill('Neu', 'win')}` : ''}` → `${e.is_new && !allNew ? ` ${U.pill('Neu')}` : ''}` (Klasse `is-new` an der `section` bleibt unverändert)
- Z. 146 `<span class="accent">erledigt</span>` → `<span>erledigt</span>`
- In `journal()` (Z. 150 ff.): `const allNew = !!j && j.entries.length > 1 && j.entries.every(e => e.is_new);`; Z. 153 `entryHTML(e, j.notes, gid, sid, myId)` → `entryHTML(e, j.notes, gid, sid, myId, allNew)`; Z. 157 `${j.entries.length === 1 ? '1 Eintrag' : `${j.entries.length} Einträge`}` → `${j.entries.length === 1 ? '1 Eintrag' : allNew ? `${j.entries.length} neue Einträge` : `${j.entries.length} Einträge`}`

```

## typografie-3.2.5e · Kopier-Link im Ticket: .cpn-code.is-link 13/500 ohne Sperrung

Gruppe typografie · Cluster konto · Aufwand S · Befunde: bereich_konto-31
Quelle: audit/spec/typografie.md Z. 363–363 · Dateien: web/css/app.css
Abhängig von: typografie-3.2.1

```text
| `.cpn-code`, neu nach Z. 2655 | `.cpn-code.is-link { font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 500; letter-spacing: 0; }` | bereich_konto-31 |
```

## typografie-3.8r · Affiliate-Ticket: Link-Ticket bekommt Klasse is-link

Gruppe typografie · Cluster konto · Aufwand S · Befunde: bereich_konto-31
Quelle: audit/spec/typografie.md Z. 443–443 · Dateien: web/js/screens/affiliate.js
Abhängig von: typografie-3.2.5e

```text
| affiliate.js:52 (`ticket`) | `class="cpn-code"` → `class="cpn-code${kind === 'link' ? ' is-link' : ''}"` | bereich_konto-31 |
```

## typografie-3.8s · Affiliate-Tabelle: Datumszelle num; Coach-Sichtbarkeitstabelle ohne Änderung (über 3.2.2 Satoshi)

Gruppe typografie · Cluster konto · Aufwand S · Befunde: typografie-12, bereich_konto-34
Quelle: audit/spec/typografie.md Z. 444–446 · Dateien: web/js/screens/affiliate.js, web/js/screens/coach.js
Abhängig von: typografie-3.2.2f

```text
| affiliate.js:67 | `<td class="nowrap">${fmt.dateFull(…)}</td>` → `<td class="nowrap num">…` | typografie-12, bereich_konto-34 |
| coach.js:25 | keine Änderung; die Sichtbarkeits-Tabelle wird durch 3.2.2 Satoshi | bereich_konto-34 |

```

## abstaende-D8 · Einrichten- und Beitrittskarten: .mentor-setup-Polster, Symbole mittig 34 px --faint (Mentor und Coach), .coach-join 680 mittig, .coach-co-what ohne eigene Breite, Einladungshinweis im Dialog volle Zeile

Gruppe abstaende · Cluster konto · Aufwand M · Befunde: bereich_konto-1, zustaende-15, bereich_konto-53, bereich_konto-46
Quelle: audit/spec/abstaende.md Z. 375–375 · Dateien: web/css/app.css
Abhängig von: abstaende-A1

```text
| D8 | Mentor/Coach-Einrichtung Z. 2340–2341, 2891, 2893, 2953 | Z. 2340 `.mentor-setup { text-align: center; padding: 44px 24px; }` → `padding: var(--sp-10) var(--sp-6)`. Z. 2341 → `.mentor-setup .ico, .coach-join-head .ico { display: flex; justify-content: center; } .mentor-setup .ico svg { width: 34px; height: 34px; color: var(--faint); }`. Z. 2891 `.coach-join { padding: 22px 24px; }` → `.coach-join { width: 100%; max-width: var(--w-single); margin-inline: auto; padding: var(--sp-6); }`. Z. 2893 `.coach-join-head .ico svg { width: 36px; height: 36px; color: var(--accent); }` → `width: 34px; height: 34px; color: var(--faint);`. Z. 2953 `.coach-co-what`: `max-width: 640px; margin: 0 auto;` streichen. Neu: `.modal .coach-invite > .small { flex-basis: 100%; }` | bereich_konto-1, zustaende-15, bereich_konto-53, bereich_konto-46 |
```

## abstaende-N1 · Coach-Einrichtung: coach-wrap narrow, Knopf „Zu den Einstellungen“ ohne Symbol

Gruppe abstaende · Cluster konto · Aufwand S · Befunde: zustaende-15, bereich_konto-24
Quelle: audit/spec/abstaende.md Z. 477–481 · Dateien: web/js/screens/coach.js
Abhängig von: abstaende-C12, abstaende-D8

```text
### web/js/screens/coach.js

| Nr. | Stelle | vorher → nachher | Befunde |
|---|---|---|---|
| N1 | Z. 22 | `<div class="coach-wrap">` → `<div class="coach-wrap narrow">`. Im Knopf `${I.settings} Zu den Einstellungen` → `Zu den Einstellungen` | zustaende-15, bereich_konto-24 |
```

## abstaende-N2 · Coach-Übersicht: coach-wrap wide → coach-wrap (volle Breite links)

Gruppe abstaende · Cluster konto · Aufwand S · Befunde: bereich_konto-24
Quelle: audit/spec/abstaende.md Z. 482–482 · Dateien: web/js/screens/coach.js
Abhängig von: abstaende-C12

```text
| N2 | Z. 117 | `coach-wrap wide` → `coach-wrap` | bereich_konto-24 |
```

## abstaende-N3 · Coach-Journal: coach-wrap read (Lesespalte 920)

Gruppe abstaende · Cluster konto · Aufwand S · Befunde: bereich_konto-24
Quelle: audit/spec/abstaende.md Z. 483–483 · Dateien: web/js/screens/coach.js
Abhängig von: abstaende-C12

```text
| N3 | Z. 156 | `<div class="coach-wrap">` → `<div class="coach-wrap read">` | bereich_konto-24 |
```

## abstaende-N4 · Coach-Beitritts- und Zustandsansichten (Z. 167–187): coach-wrap narrow

Gruppe abstaende · Cluster konto · Aufwand S · Befunde: bereich_konto-24, bereich_konto-53
Quelle: audit/spec/abstaende.md Z. 484–484 · Dateien: web/js/screens/coach.js
Abhängig von: abstaende-C12

```text
| N4 | Z. 167, 168, 169, 171, 184, 186, 187 | `<div class="coach-wrap">` → `<div class="coach-wrap narrow">` | bereich_konto-24, bereich_konto-53 |
```

## abstaende-N5 · Beitrittskarte: Inline margin-top/max-width → Klasse mt-4

Gruppe abstaende · Cluster konto · Aufwand S · Befunde: bereich_konto-53
Quelle: audit/spec/abstaende.md Z. 485–485 · Dateien: web/js/screens/coach.js
Abhängig von: abstaende-A6, abstaende-D8

```text
| N5 | Z. 196 | `style="margin-top:14px;max-width:420px"` → Klasse `mt-4` (ohne max-width) | bereich_konto-53 |
```

## abstaende-N6 · Co-Coach-Einladungsdialog: { cls: 'wide' } → { cls: 'narrow' }

Gruppe abstaende · Cluster konto · Aufwand S · Befunde: bereich_konto-46
Quelle: audit/spec/abstaende.md Z. 486–487 · Dateien: web/js/screens/coach.js
Abhängig von: abstaende-D8

```text
| N6 | Z. 265 | `{ cls: 'wide' }` → `{ cls: 'narrow' }` | bereich_konto-46 |

```

## abstaende-O1 · Provisions-Dialog: Untertitel und Feld in .stack (12 px); Zahlenpfeile über globale Regel aus komponenten-16 (anlegen, falls noch nicht vorhanden)

Gruppe abstaende · Cluster konto · Aufwand S · Befunde: bereich_konto-47
Quelle: audit/spec/abstaende.md Z. 488–493 · Dateien: web/js/screens/affiliate.js, web/css/app.css
Abhängig von: abstaende-A3

```text
### web/js/screens/affiliate.js

| Nr. | Stelle | vorher → nachher | Befunde |
|---|---|---|---|
| O1 | Z. 92 | `<p class="muted small no-i18n">…</p><div class="field">…</div>` in `<div class="stack">…</div>` fassen (12 px zwischen Untertitel und Feld). Die Zahlenpfeile entfernt die globale Regel aus komponenten-16. Falls sie noch nicht da ist (`grep -n "inner-spin-button" web/css/app.css` findet keine globale `input[type=number]`-Regel), diese Regel aus komponenten-16 jetzt anlegen. | bereich_konto-47 |

```

## komponenten-C17b · Coach-Aufgaben: Nur-Anzeige-Kästchen ohne Rand und Füllung

Gruppe komponenten · Cluster konto · Aufwand S · Befunde: bereich_konto-23
Quelle: audit/spec/komponenten.md Z. 317–318 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 2932 `.ct-check[aria-checked="true"], .coach-task.done .ct-check.static { … }` → nur `.ct-check[aria-checked="true"] { … }`
- Z. 2933 `.ct-check.static { cursor: default; }` → `.ct-check.static, .ct-check.static:hover { cursor: default; border-color: transparent; background: none; color: var(--text-2); }`
```

## komponenten-C32a · Coach: Haken in „Kurz-Stats“ schrumpft nicht

Gruppe komponenten · Cluster konto · Aufwand S · Befunde: bereich_konto-36
Quelle: audit/spec/komponenten.md Z. 459–460 · Dateien: web/css/app.css
Abhängig von: —

```text
**C32 – Coach-Kleinigkeiten** (bereich_konto-36, bereich_konto-50, bereich_konto-22, bereich_konto-45)
- Nach Z. 2900 neu: `.coach-yes, .coach-no { align-items: flex-start; } .coach-yes svg, .coach-no svg { flex: none; margin-top: 2px; }`
```

## komponenten-C32b · Coach „1 erledigt“ mit CSS-Chevron statt ▸/▾

Gruppe komponenten · Cluster konto · Aufwand S · Befunde: bereich_konto-50
Quelle: audit/spec/komponenten.md Z. 461–461 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 2937–2938 (`.ct-done summary::before`, `[open] … ::before`) löschen; neu: `.ct-done summary { display: inline-flex; align-items: center; gap: 5px; }`. Z. 2310 → `.rp-more summary::after, .ct-done summary::after { … }`; Z. 2311 → `.rp-more[open] summary::after, .ct-done[open] summary::after { … }`
```

## komponenten-C32c · Coach-Antwortfelder ohne Größen-Griff, wachsen bis 160 px (CSS)

Gruppe komponenten · Cluster konto · Aufwand S · Befunde: bereich_konto-22
Quelle: audit/spec/komponenten.md Z. 462–462 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 2879 `.ce-write textarea { … resize: vertical; … }` und Z. 2923 `.mr-write textarea { … resize: vertical; … }` → `resize: none; field-sizing: content; max-height: 160px;` (min-height 44 bzw. 34 bleibt). `.mn-edit` bleibt `resize: vertical`.
```

## komponenten-C32d · Coach-Gruppenmenü einzeilig

Gruppe komponenten · Cluster konto · Aufwand S · Befunde: bereich_konto-45
Quelle: audit/spec/komponenten.md Z. 463–464 · Dateien: web/css/app.css
Abhängig von: —

```text
- Neu: `#pop-coachmenu .item { white-space: nowrap; }`

```

## komponenten-C33b · Coupon-Link in --text-2, unten bündig

Gruppe komponenten · Cluster konto · Aufwand S · Befunde: bereich_konto-49
Quelle: audit/spec/komponenten.md Z. 471–472 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 2657 `.cpn-link { align-self: flex-start; display: inline-flex; align-items: center; gap: 4px; margin-top: 4px; font-size: 12.5px; color: var(--muted); text-decoration: none; transition: … }` → `.cpn-link { align-self: flex-start; display: inline-flex; align-items: center; gap: 4px; margin-top: auto; padding-top: 6px; font-size: 12.5px; color: var(--text-2); text-decoration: none; transition: color var(--dur-2) var(--ease); }`; Z. 2658 bleibt.

```

## komponenten-D3 · certificate.js: Format-Segment ohne .sm, eckige Pfeile, Größenhinweis

Gruppe komponenten · Cluster konto · Aufwand S · Befunde: komponenten-26, komponenten-25, komponenten-18
Quelle: audit/spec/komponenten.md Z. 617–621 · Dateien: web/js/certificate.js
Abhängig von: komponenten-C07, komponenten-C14b, komponenten-C05

```text
**D3 – certificate.js** (komponenten-26, komponenten-25, komponenten-18)
- Z. 73 `<div class="seg sm">` → `<div class="seg">`
- Z. 85: beide `class="btn round sm"` → `class="btn nav"`
- Format-Zeile: Labels ohne `<small>` (`[k, v.label]`), direkt nach dem Segment `<div class="hint">${f.w} × ${f.h} px</div>` (`f` = `FORMATS[o.format]`, die Seitenleiste wird bei jedem Formatwechsel neu gerendert).

```

## komponenten-S-coach-a · Coach: Aktualisieren/Abgleichen/Link erneuern mit I.refresh, „Aufgabe an alle“ mit I.plus

Gruppe komponenten · Cluster konto · Aufwand S · Befunde: bereich_konto-10
Quelle: audit/spec/komponenten.md Z. 628–631 · Dateien: web/js/screens/coach.js
Abhängig von: —

```text
### 3.6 web/js/screens/*.js

**S-coach (coach.js)** (bereich_konto-10, bereich_konto-5, komponenten-1, bereich_konto-45, bereich_konto-49, bereich_konto-22, bereich_konto-9)
- `I.replay` → `I.refresh` in Z. 47, 115, 157 und 265; Z. 121 „Aufgabe an alle“ `${I.check}` → `${I.plus}`.
```

## komponenten-S-coach-b · Coach: Auslöser und Inline-Absenden neutral

Gruppe komponenten · Cluster konto · Aufwand S · Befunde: bereich_konto-5, komponenten-1
Quelle: audit/spec/komponenten.md Z. 632–632 · Dateien: web/js/screens/coach.js
Abhängig von: —

```text
- Neutral: Z. 22 `<a class="btn primary" href="#/settings/mentor">` → `<a class="btn" …>`; Z. 53 „+ Gruppe“ `btn sm primary` → `btn sm`; Z. 129 „Speichern“ (Notiz bearbeiten) `btn sm primary` → `btn sm`; Z. 140 „Notiz senden“ `btn sm primary` → `btn sm`; Z. 148 „Aufgabe geben“ `btn sm primary` → `btn sm`. Z. 178, 197, 271 bleiben primary.
```

## komponenten-S-coach-d · Coach: „Im Notebook ansehen“ als .tlink

Gruppe komponenten · Cluster konto · Aufwand S · Befunde: bereich_konto-49
Quelle: audit/spec/komponenten.md Z. 634–634 · Dateien: web/js/screens/coach.js
Abhängig von: komponenten-C33a

```text
- Z. 48 `<a href="#/notebook">Im Notebook ansehen</a>` → `<a class="tlink" href="#/notebook">Im Notebook ansehen</a>`
```

## komponenten-S-coach-e · Coach: Antwortfelder wachsen (Fallback ohne field-sizing); .input.sm und Zählung bleiben

Gruppe komponenten · Cluster konto · Aufwand S · Befunde: bereich_konto-22, bereich_konto-9
Quelle: audit/spec/komponenten.md Z. 635–638 · Dateien: web/js/screens/coach.js
Abhängig von: komponenten-C32c, komponenten-C03

```text
- Z. 296 (`coach-note-draft`) und Z. 313 (`coach-reply-draft`) als erste Anweisung: `if (!(window.CSS && CSS.supports('field-sizing', 'content'))) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight + 2, 160) + 'px'; }`
- Die 5 Felder `class="input sm"` (Z. 77, 109, 148 zweimal, 263) bleiben, sie bekommen ihre Höhe aus C03.
- Z. 66 bleibt (Zählung „1 erledigt“/„n erledigt“).

```

## komponenten-S-coupons · Coupons: Link-Darstellung kommt aus C33b, Markup bleibt (nur prüfen)

Gruppe komponenten · Cluster konto · Aufwand S · Befunde: bereich_konto-49
Quelle: audit/spec/komponenten.md Z. 639–641 · Dateien: web/js/screens/coupons.js
Abhängig von: komponenten-C33b

```text
**S-coupons (coupons.js)** (bereich_konto-49)
Z. 6 `class="cpn-link"` → `class="cpn-link"` bleibt (Darstellung kommt aus C33, kein `tlink`, das ↗ kennzeichnet den Link).

```

## aufbau-A4c · Coach-Eintrag: Editor-Überschriften kleiner als .ce-title

Gruppe aufbau · Cluster konto · Aufwand S · Befunde: bereich_konto-20
Quelle: audit/spec/aufbau.md Z. 285–289 · Dateien: web/css/app.css
Abhängig von: —

```text
- Nach Z. 2876 neu:
  ```css
  .ce-body .ql-editor h1 { font-size: 16px; } .ce-body .ql-editor h2 { font-size: 15px; } .ce-body .ql-editor h3 { font-size: 14.5px; }
  .ce-body .ql-editor :is(h1, h2, h3) { margin: 10px 0 4px; font-weight: 600; }
  ```
```

## aufbau-C3 · Affiliate: Steuerung in die Kopfreihe, Marke „Beispieldaten“, ohne Trade/Session, Kachel „Creator“ weg

Gruppe aufbau · Cluster konto · Aufwand M · Befunde: hierarchie-45, bereich_konto-37, bereich_konto-29, responsiv-19, aufbau-6, ki_look-22
Quelle: audit/spec/aufbau.md Z. 432–440 · Dateien: web/js/screens/affiliate.js, web/css/app.css
Abhängig von: aufbau-B11

```text
#### `web/js/screens/affiliate.js`

**C3** · hierarchie-45, bereich_konto-37, bereich_konto-29, responsiv-19, aufbau-6, ki_look-22
- Z. 73 `head: { range: false, account: false },` → `head: { range: false, account: false, session: false, trade: false }, /* Konto-Menü-Seite: keine Handelsknöpfe, „Trade loggen“ gibt es auf allen Seiten der Navigation */`
- Neu im Screen-Objekt: `actions: () => U.pill('Beispieldaten', 'neutral'),`
- `render(ctx)` Z. 79–80: `const top = …; return `<div class="aff">${top}…`` → `ctx.headLeft = nav(view) + pick; return `<div class="aff">${view === 'creator' ? creator(d, c) : admin(d)}</div>`;` (kein `data-subnav` an der Navigation, sonst blendet app.css:116–117 falsch ein)
- `admin` Z. 57: `${U.tile('Creator', String(d.creators.length))}` streichen. Kartentitel bleibt „Creator“ ohne Zahl.
- `web/css/app.css`: Z. 2663–2664 (`.aff-top`, `.aff-top .grow`) löschen; Z. 2987 `.aff-top .aff-pick { flex: 1; min-width: 0; }` → `.page-head .aff-pick { flex: 1; min-width: 0; }`

```
