# Paket 022 · notebook_news

Schritte: 31 · Dateien: web/README.md, web/css/app.css, web/e2e/newstest.js, web/e2e/sixtest.js, web/js/editor.js, web/js/sample.js, web/js/screens/news.js, web/js/screens/notebook.js
Betroffene Tests laut Spezifikation: e2e/colorpickertest.js; e2e/imgtest.js:5 (.nb .col.mid .btn.primary nur Ausweich-Selektor); e2e/mobiletest.js:53 (nb-share); e2e/nbsel.js:11–17; e2e/sampletest.js; e2e/sixtest.js:52–57 (siehe E1c); e2e/sixtest.js:57; prüfen: e2e/newstest.js:53, :93 (.nw-next-t b, .nw-next .caption); web/e2e/dptest.js:104 (bleibt grün); web/e2e/figtest.js:5, web/e2e/figdel.js:5, web/e2e/scrolltest.js:30 (in Abschnitt 5 genannt, müssen grün bleiben); web/e2e/mobiletest.js:53 (.datebtn bleibt); web/e2e/newstest.js:52; web/e2e/newstest.js:54; web/e2e/newstest.js:54 (Schritt zustaende-S-TE4); web/tests/sample.test.mjs
Baut auf Paketen auf: 1, 6, 21

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## komponenten-D5 · sample.js: Beispiel-Ordner ohne Emoji

Gruppe komponenten · Cluster notebook_news · Aufwand S · Befunde: referenz-39
Quelle: audit/spec/komponenten.md Z. 625–627 · Dateien: web/js/sample.js
Abhängig von: —

```text
**D5 – sample.js: Ordner ohne Emoji** (referenz-39)
Z. 284: `name: '📈 Strategie'` → `'Strategie'`, `'💡 Ideen'` → `'Ideen'`. Keine Migration installierter Beispieldaten.

```

## komponenten-S-notebook-a · Notebook: eigene Ordner mit Ordner-Symbol

Gruppe komponenten · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-32
Quelle: audit/spec/komponenten.md Z. 683–684 · Dateien: web/js/screens/notebook.js
Abhängig von: komponenten-C29a

```text
**S-notebook (notebook.js)** (bereich_notebook_news-32, referenz-39, bereich_notebook_news-34, bereich_notebook_news-20, bereich_notebook_news-31, bereich_notebook_news-30, komponenten-1, komponenten-30, zustaende-14, komponenten-2)
- Z. 51: `${x.isDefault ? folderIcon(x).replace('<svg', '<svg class="ico"') : ''}` → `${folderIcon(x).replace('<svg', '<svg class="ico"')}` (eigene Ordner bekommen `I.folder`).
```

## komponenten-S-notebook-b · Notebook: „Neue Notiz“/„Wiederherstellen“ neutral, Symbole Auswählen/Sortieren

Gruppe komponenten · Cluster notebook_news · Aufwand S · Befunde: komponenten-1, bereich_notebook_news-34, zustaende-14, komponenten-30
Quelle: audit/spec/komponenten.md Z. 685–686 · Dateien: web/js/screens/notebook.js
Abhängig von: komponenten-U1

```text
- Z. 61: „Neue Notiz“/„Tag loggen“ `btn sm primary grow` → `btn sm grow`; Auswahlmodus `${I.check}` → `${I.checkSquare}`; Sortieren `${I.arrowDown}` → `${I.sort}` (Tooltips bleiben).
- Z. 66 (Leerzustand rechts) `btn sm primary` → `btn sm`. Z. 67 „Wiederherstellen“ `btn sm primary` → `btn sm`.
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .btn.primary] (1) Gewicht: .btn.primary bekommt 700 (typografie-3.2.4b). Grundlage sind BRIEF („nur Werte und Hauptknöpfe 700“) und README Z. 209–210 („Hauptknöpfe („Trade loggen“, Speichern) fett“). Heute rendert 600 ohnehin als 700, sichtbar ändert sich also nichts. farbe-B2 und farbe-D3e nennen kein Gewicht mehr. (2) Rolle nach der Komponenten-Regel: .btn.primary steht nur im Dialog-Fuß, im Popover- bzw. Panel-Fuß (eine abschließende Aktion) und beim Absenden des Hauptformulars einer Seite. Auslöser, Leerzustand-, Banner- und Listen-Aktionen sowie Inline-Formulare in Karten und Widgets sind .btn bzw. .btn.sm. Grund: Das bleibt ruhig, egal wie N1 ausgeht; bei Variante B wäre jeder primary der lauteste Punkt der Seite und lauter als „Trade loggen“. Damit sind neutral: widgets.js:374 (Mentor-Frage im Widget) `btn`, coach.js:129/140/148 `btn sm`, notebook.js:67 „Wiederherstellen“ `btn sm`, prop.js:82 (Leerzustand) `btn sm`, prop.js:97 „Als bestanden markieren“ `btn sm`, prop.js:262/266 „Ausgabe/Payout erfassen“ `btn`, „Konto hinzufügen“ im Konten-Bereichskopf misc.js:186 `btn` (nicht sm, Seitenebene). (3) Doppelte Knopfänderungen führen die komponenten-S-Schritte aus. Die farbe-C-Schritte lassen ihre Knopf-Teile weg, ihre Farbteile bleiben. Ausnahme ist der Willkommen-Banner dashboard.js:130: farbe-C19c schreibt den ganzen Aufruf neu und übernimmt damit auch den Knopf. (4) README: farbe-D3e ersetzt Z. 203–208 sofort, aber ohne Aussehen und Gewicht von .btn.primary. komponenten-R1f setzt danach auf und zieht Z. 207–208 bzw. Z. 191 erst nach den Antworten N1/N2 nach, wie dort vorgesehen.
- ÜBERNIMMT farbe-C24b: notebook.js Z. 61 und Z. 66 ändert komponenten-S-notebook-b. Dort wird auch Z. 67 „Wiederherstellen“ `btn sm`.

## komponenten-S-notebook-c · Notebook-Tag-Menü mit Suchfeld, neuer Tag direkt aus der Suche

Gruppe komponenten · Cluster notebook_news · Aufwand M · Befunde: bereich_notebook_news-20, komponenten-2
Quelle: audit/spec/komponenten.md Z. 687–687 · Dateien: web/js/screens/notebook.js
Abhängig von: komponenten-C29b

```text
- Tag-Menü (Z. 26–31, 77): über `.tagcols` (außerhalb, damit `refreshTags` es nicht ersetzt) `<div class="tagpop-q"><input class="input" id="nb-tag-q" placeholder="Tags suchen" aria-label="Tags suchen" data-input="nb-tag-q" autocomplete="off"></div>`. Gruppen stehen untereinander (CSS C29). Den Fuß `<hr><button … data-action="nb-tag-new" …>Neuen Tag anlegen</button>` (Z. 77) entfernen. Neuer Handler `nb-tag-q`: blendet `.item` aus, deren `data-name` den Suchtext nicht enthält (ohne Groß-/Kleinschreibung), leere Gruppen ebenso; ist der Suchtext nicht leer und gibt es keinen gleichnamigen Tag, steht ganz oben `<button type="button" class="item" data-action="nb-tag-new" data-id="${cur.id}" data-name="${esc(q)}">${I.plus}<span>„${esc(q)}“ als Tag anlegen</span></button>`. `nb-tag-new` legt den Tag mit `data-name` ohne Dialog an (`S.ensureTag`) und weist ihn zu. `refreshTags` (Z. 36) wendet nach dem Neuaufbau den aktuellen Suchtext erneut an.
```

## komponenten-S-notebook-d · Ordner-Dialog: 8 Farben ohne Grün, Standard #8b7cf6, Plus-Kreis „Eigene Farbe“

Gruppe komponenten · Cluster notebook_news · Aufwand M · Befunde: bereich_notebook_news-31, referenz-39
Quelle: audit/spec/komponenten.md Z. 688–688 · Dateien: web/js/screens/notebook.js
Abhängig von: komponenten-C30

```text
- Ordner-Dialog: Z. 5 `'#34f58a'` aus `FOLDER_COLORS` streichen (8 Farben). Z. 115 `color: FOLDER_COLORS[3]` → `color: '#8b7cf6'`. Z. 116: Platzhalter „z. B. 📈 Strategie“ → „z. B. Strategie“; statt `<label class="color-field">…<span class="small muted">eigene</span></label>` als letzten Kreis in `.swatches`: `<label class="swatch add" aria-label="Eigene Farbe" data-tip="Eigene Farbe" aria-pressed="${!FOLDER_COLORS.includes(cur.color)}"><i style="background:${FOLDER_COLORS.includes(cur.color) ? 'transparent' : cur.color}">${FOLDER_COLORS.includes(cur.color) ? I.plus : ''}</i><input type="color" name="custom" value="${cur.color}" data-input="fo-color-custom" aria-label="Eigene Farbe"></label>`. Handler `fo-color-custom` (Z. 158): zusätzlich das `<i>` des Plus-Kreises in der Farbe einfärben, Plus entfernen, `aria-pressed="true"` setzen.
```

## komponenten-S-notebook-e · Teilen-Dialog: einzeiliges Linkfeld, kurzer Hinweis, „Link kopieren“ als Hauptaktion

Gruppe komponenten · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-30
Quelle: audit/spec/komponenten.md Z. 689–690 · Dateien: web/js/screens/notebook.js
Abhängig von: —

```text
- Teilen-Dialog (Z. 170): `<textarea class="input mono" id="share-link" readonly style="min-height:90px">…</textarea>` → `<input class="input" id="share-link" readonly value="${esc(link)}" style="text-overflow:ellipsis">`, beim Fokus markieren (`onMount`: `el.querySelector('#share-link').addEventListener('focus', e => e.target.select())`). Hinweis → „Wer den Link öffnet, sieht die Notiz nur lesend. Bilder erscheinen als Platzhalter.“; nur wenn `location.protocol === 'file:'` eine zweite Zeile `<p class="small muted">Der Link funktioniert für andere erst mit der Adresse deiner veröffentlichten Website.</p>`. Fuß: `<a class="btn ghost" href="${esc(link)}" target="_blank" rel="noopener">${I.external} Öffnen</a><button type="button" class="btn primary" data-action="nb-copy" data-target="share-link">${I.copy} Link kopieren</button>`.

```

## komponenten-R1b · README: Notebook-Ordner und Tag-Menü mit Suche

Gruppe komponenten · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-32, bereich_notebook_news-20
Quelle: audit/spec/komponenten.md Z. 747–747 · Dateien: web/README.md
Abhängig von: komponenten-S-notebook-a, komponenten-S-notebook-c

```text
- Z. 120 (Notebook): ergänzen „Eigene Ordner tragen links ihren Farbbalken und ein Ordner-Symbol. Das Tag-Menü ist eine Spalte mit Suche; ein neuer Tag entsteht direkt aus der Suche.“
```

## komponenten-E1c · e2e sixtest.js: neuer Tag über die Tag-Suche

Gruppe komponenten · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-20
Quelle: audit/spec/komponenten.md Z. 759–759 · Dateien: web/e2e/sixtest.js
Abhängig von: komponenten-S-notebook-c

```text
- sixtest.js:57: in `#nb-tag-q` „Sixtest“ tippen, dann `#pop-nbtags [data-action=nb-tag-new]` klicken (kein Prompt-Dialog mehr).
```

## aufbau-A4d · News-Tageskopf .nw-dh 14px

Gruppe aufbau · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-44
Quelle: audit/spec/aufbau.md Z. 290–290 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 3084 `.nw-dh { …; font-size: 13px; font-weight: 600; … }` → `font-size: 14px;`
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .nw-dh] Das Ergebnis lautet `.nw-dh { …; font-size: var(--fs-14); line-height: var(--lh-14); font-weight: 600; … }`. Der Rest der Regel bleibt. Begründung: Der News-Tageskopf ist ein Listen-Titel (14/600). Die Zeilen darunter (.nw-row) gehen laut typografie 3.2.3m auf 14, und eine Überschrift ist nie kleiner als ihr Inhalt (aufbau, Grundsatz 4).
- ÄNDERN: Z. 3084 mit Tokens schreiben: `font-size: var(--fs-14); line-height: var(--lh-14);` statt `14px`.

## aufbau-C9a · News: Filter in die Kopfreihe (ctx.headLeft), kein Session-Knopf

Gruppe aufbau · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-39, aufbau-6, ki_look-22, responsiv-19
Quelle: audit/spec/aufbau.md Z. 498–504 · Dateien: web/js/screens/news.js
Abhängig von: —

```text
#### `web/js/screens/news.js`

**C9** · bereich_notebook_news-39, bereich_notebook_news-44, aufbau-6, ki_look-22, responsiv-19
- Z. 65 `head: { range: false, account: false },` → `head: { range: false, account: false, session: false },`
- Z. 67 `render()` → `render(ctx)`
- Vor dem `return` (Z. 99): `ctx.headLeft = ok && !s.events ? '' : filters;` (keine Filter beim Laden oder im Fehlerzustand)
- Z. 88 `body = `${hero}${filters}${…}`` → `body = `${hero}${…}``
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: ctx.headLeft] Tagesansicht: Die Datumszeile bleibt im Inhalt, ohne ctx.headLeft. aufbau K4 hat genau diese Variante verworfen, weil Datumstitel und Konto-Filter in einer Reihe vermischt würden, und sie hängt an F1 (komponenten-3/bereich_shell-8). Die Knöpfe „Check-in“ und „Trade für diesen Tag“ entfallen mit aufbau-C7b, „Zertifikat“ bleibt dort mit I.award, die Pille „Heute“ ist neutral (farbe-C20). Von abstaende-E-day2 bleibt nur der Inline-Stil des Datumstitels als Klasse: `<h2 class="day-title">` mit `.day-title { font-size: var(--fs-18); line-height: var(--lh-18); margin-left: var(--sp-1); }` (h2-Rolle 18/600, einzige Definition; .day-title in komponenten-C36 entfällt). Trade-Ansicht: Links steht der Rückweg per ctx.headLeft (aufbau-C15d). Die Seitenaktionen aus wording 9.11 kommen nicht in die Rückweg-Zeile, sondern als `actions(ctx)` rechts in die Kopfreihe; die Aufbau-Regel lautet „rechts Seitenaktionen → .dh-sep → Trade loggen“. Bei ctx.params[0]: Notiz-Knopf (`btn`, „Notiz öffnen“ bzw. „Notiz im Notebook“), `btn danger` „Löschen“, `btn` „Trade bearbeiten“ (Seitenebene = btn, nicht primary); ohne Trade-Datensatz ''. Ohne Parameter bleibt „CSV importieren“. pageHead (aufbau-B1), News (aufbau-C9a) und Affiliate (aufbau-C3) bleiben unverändert.

## aufbau-C9b · News: Zähler-Pille im Tageskopf entfernen

Gruppe aufbau · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-44
Quelle: audit/spec/aufbau.md Z. 505–505 · Dateien: web/js/screens/news.js, web/css/app.css
Abhängig von: —

```text
- Z. 81 `<span class="nw-n">${g.items.length}</span>` streichen; `web/css/app.css` Regel `.nw-n` löschen
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .nw-n] Die Zähler-Pille im News-Tageskopf entfällt (aufbau Grundsatz 1, Prüfung aufbau 727/756). news.js Z. 81 ohne `<span class="nw-n">`, Regel Z. 3087 gelöscht. Die 11-px-Token-Umstellung entfällt für diese Zeile.

## aufbau-C9c · News: Filter-Kontext in der Kopfreihe dehnbar (Desktop-CSS)

Gruppe aufbau · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-39
Quelle: audit/spec/aufbau.md Z. 506–509 · Dateien: web/css/app.css
Abhängig von: aufbau-C9a

```text
- CSS (`web/css/app.css`, nach Z. 1340):
  ```css
  .page-head .dh-context:has(> .nw-filters) { flex: 1 1 0; min-width: 0; }
  ```
```

## aufbau-C10a · Notebook: Zeile „wo bin ich“ über der mittleren Spalte

Gruppe aufbau · Cluster notebook_news · Aufwand M · Befunde: bereich_notebook_news-10
Quelle: audit/spec/aufbau.md Z. 518–534 · Dateien: web/js/screens/notebook.js, web/css/app.css
Abhängig von: —

```text
#### `web/js/screens/notebook.js`

**C10** · bereich_notebook_news-10, bereich_notebook_news-6, bereich_notebook_news-7, bereich_notebook_news-8, bereich_notebook_news-9 (nur Labels)
- `render`, mittlere Spalte Z. 61: Vor `<div class="col-head">` (nicht im Papierkorb) einfügen:
  ```js
  const where = nb.q ? 'Suche in allen Ordnern' : nb.folder === 'all' ? 'Alle Notizen' : (S.getFolder(nb.folder) || {}).name || '';
  const tagName = nb.tag ? (S.noteTags().find(t => t.id === nb.tag) || {}).name || '' : '';
  const whereRow = nb.folder === 'trash' ? '' : `<div class="nb-where">${!nb.leftOpen ? `<button type="button" class="btn ghost icon sm" data-action="nb-left-toggle" aria-label="Ordner anzeigen" data-tip="Ordner anzeigen">${I.chevR}</button>` : ''}<button type="button" class="btn ghost icon sm back" data-action="nb-view" data-value="folders" aria-label="Zu den Ordnern">${I.back}</button><span class="grow">${esc(where)}</span>${nb.tag ? `<button type="button" class="chip" data-action="nb-tag" data-id="${esc(nb.tag)}" aria-label="Tag-Filter aufheben"># ${esc(tagName)} ${I.close}</button>` : ''}</div>`;
  ```
  Im bisherigen `.col-head` den Chevron-Knopf (`!nb.leftOpen ? …chevR…`) und den Zurück-Knopf (`… back … data-value="folders"`) entfernen, **außer** im Papierkorb (dort bleibt der Zurück-Knopf im Kopf).
  CSS (`web/css/app.css`, bei den `.nb`-Regeln um Z. 1060):
  ```css
  .nb .nb-where { display: none; align-items: center; gap: 6px; padding: 10px 12px 0; font-size: 13.5px; font-weight: 600; color: var(--text); min-width: 0; }
  .nb .nb-where .grow { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .nb.no-left .nb-where { display: flex; }
  @media (max-width: 960px) { .nb .nb-where { display: flex; } }
  ```
```

## aufbau-C10b · Notebook: Hauptknopf „Tagesnotiz öffnen/anlegen“, keine Doublette

Gruppe aufbau · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-6
Quelle: audit/spec/aufbau.md Z. 535–536 · Dateien: web/js/screens/notebook.js
Abhängig von: —

```text
- Hauptknopf Z. 61: `${isDaily ? 'Tag loggen' : 'Neue Notiz'}` → `const dayBtn = nb.folder === 'all' || isDaily; const hasToday = !!S.dayNote(C.dayKey(new Date()));` und Text `${dayBtn ? (hasToday ? 'Tagesnotiz öffnen' : 'Tagesnotiz anlegen') : 'Neue Notiz'}`, bei `dayBtn` zusätzlich `data-tip="Tagesnotiz für heute öffnen oder anlegen"`. Leertext Z. 63 und Knopf in der rechten Spalte Z. 66 nach derselben Regel.
- Aktion `'nb-new'` Z. 136: Der Zweig `if (folderId === 'daily') { const key = …; n = S.dayNote(key) ? S.addNote({…}) : S.dayNote(key, true); }` → `if (folderId === 'daily') n = S.dayNote(C.dayKey(new Date()), true);` (öffnet die vorhandene Tagesnotiz, legt keine Doublette an)
```

## aufbau-C10c · Notiz-Kopf: eine Meta-Zeile, Datumsknopf als Symbol bzw. „Trade vom {0}“

Gruppe aufbau · Cluster notebook_news · Aufwand M · Befunde: bereich_notebook_news-7
Quelle: audit/spec/aufbau.md Z. 537–539 · Dateien: web/js/screens/notebook.js
Abhängig von: —

```text
- Notiz-Kopf Z. 76: `<div>Erstellt: ${fmt.dateTime(cur.createdAt)}</div><div id="nb-updated">Zuletzt bearbeitet: ${…}</div>` → `const c = fmt.dateTime(cur.createdAt), u = fmt.dateTime(cur.updatedAt || cur.createdAt);` und `<div><span>Erstellt ${c}</span><span id="nb-updated"${u === c ? ' hidden' : ''}> · Bearbeitet ${u}</span></div>` (P&L-Zeile darunter bleibt)
- `flush()` Z. 101: `u.textContent = 'Zuletzt bearbeitet: ' + fmt.dateTime(n.updatedAt);` → `u.hidden = false; u.textContent = ' · Bearbeitet ' + fmt.dateTime(n.updatedAt);`
- Datumsknopf Z. 73: Bei `cur.type === 'day' && cur.title === S.dayTitle(dateKey)` → `<button type="button" class="datebtn" data-pop="nbdate" aria-label="Datum ändern" data-tip="Datum ändern">${I.calendar}${I.chev}</button>`. Bei `cur.type === 'trade'` → Text `Trade vom ${esc(S.dayTitle(dateKey))}`. Sonst unverändert. Die Klasse `.datebtn` bleibt (mobiletest.js:53).
```

## aufbau-C10d · Notizliste: Tagesnotiz mit „{0} Trades · P&L“ statt Datum

Gruppe aufbau · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-8
Quelle: audit/spec/aufbau.md Z. 540–540 · Dateien: web/js/screens/notebook.js
Abhängig von: —

```text
- Notizliste Z. 60: vor `notes.map` `const byDay = new Map(); for (const t of App.allTrades()) (byDay.get(t.dayKey) || byDay.set(t.dayKey, []).get(t.dayKey)).push(t);`. Für `n.type === 'day' && !n.deletedAt` statt `<div class="d" data-nb-date="${n.id}">…</div>` ausgeben: `const ts = byDay.get(n.dateKey) || []; const cl = ts.filter(t => t.closed);` → `<div class="d">${ts.length ? `${ts.length} Trade${ts.length === 1 ? '' : 's'}${cl.length ? ` · ${U.pnl(C.sum(cl.map(t => t.pnl)))}` : ''}` : 'Keine Trades'}</div>` (**ohne** `data-nb-date`, sonst überschreiben `flush()` und `'nb-title'` die Zeile). Freie, Trade- und gelöschte Notizen bleiben unverändert.
```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: U.pnl] Die Regel aus kilook-A3 gilt überall: Ergebnisse laufen über U.pnl und tragen immer ein Vorzeichen, signed: false fällt weg (kilook-C9b Z. 166, kilook-C16 Z. 26). Disziplin-Kosten tragen ein Vorzeichen (farbe-C29). Break-even sieht in TradeLog und Tagesansicht gleich aus: `<span class="neu">${fmt.cur(t.pnl, { signed: true, r: t.r })}</span>`, offene Trades zeigen `U.statusPill('open')` (aufbau-C7c und C15a). Prop-Beträge bekommen { currency: a.currency } (siehe money). Im Notebook tragen alle P&L-Beträge die Klasse num: der Notizkopf (farbe-C24c), die Trade-Notiz in der Liste (zustaende-S-NB1) und ebenso die neue Tagesnotiz-Zeile aus aufbau-C10d. responsiv-3.10 und typografie-3.8h sind verträglich (Text von 3.8h siehe U.barRow).
- ÄNDERN: Zeile: `${ts.length ? `${U.count(ts.length, 'Trade', 'Trades')}${cl.length ? ` · ${U.pnl(C.sum(cl.map(t => t.pnl)), 'num')}` : ''}` : 'Keine Trades'}`. Zähler über U.count, Betrag mit Klasse num wie in zustaende-S-NB1. Sonst wie spezifiziert (ohne data-nb-date).

## aufbau-C10e · Notebook-Filter: Abschnitt „Zuletzt bearbeitet“ mit Labels Von/Bis

Gruppe aufbau · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-9
Quelle: audit/spec/aufbau.md Z. 541–542 · Dateien: web/js/screens/notebook.js
Abhängig von: —

```text
- Filter-Fenster Z. 47 (nur Labels, F11 offen): `<div class="row" style="gap:6px"><input … name="from" … aria-label="Von"><input … name="to" … aria-label="Bis"></div>` → `<div class="sec">Zuletzt bearbeitet</div><div class="row" style="gap:8px;flex-wrap:nowrap"><div class="field grow"><label class="lbl" for="nbf-from">Von</label><input class="input" type="date" id="nbf-from" name="from" data-dp-group="nbrange" value="${esc(f.from || '')}"></div><div class="field grow"><label class="lbl" for="nbf-to">Bis</label><input class="input" type="date" id="nbf-to" name="to" data-dp-group="nbrange" value="${esc(f.to || '')}"></div></div>`. In `activeFilters` (Z. 45) `Zeitraum: ` → `Bearbeitet: `.

```

## diagramme-A9 · Notiz-Statistik ohne Diagramm: .nb .stats-grid.solo einspaltig

Gruppe diagramme · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-18
Quelle: audit/spec/diagramme.md Z. 338–340 · Dateien: web/css/app.css
Abhängig von: —

```text
**A9 Notiz-Statistik ohne Diagramm** (bereich_notebook_news-18)
- nach Z. 1036 neu: `.nb .stats-grid.solo { grid-template-columns: 1fr; }`

```

## diagramme-L1 · Notiz-Statistik: Trade-Notiz als „Trade-Details“ (.kv), Tagesnotiz Sparkline ab 3 Trades, Zähler nur > 0

Gruppe diagramme · Cluster notebook_news · Aufwand M · Befunde: bereich_notebook_news-18
Quelle: audit/spec/diagramme.md Z. 674–685 · Dateien: web/js/screens/notebook.js
Abhängig von: diagramme-A9

```text
### 3.12 `web/js/screens/notebook.js`, `day.js`, `trades.js`

**L1 Notiz-Statistik** (bereich_notebook_news-18) `statsHTML` Z. 102–107. Nach `const rOf = …` neu:
```js
const cnt = (v, k) => `<span class="${v ? k : ''}">${v}</span>`;
const head = one ? 'Trade-Details' : `${n.type === 'trade' ? 'Trade-Statistik' : 'Tagesstatistik'} · ${trades.length} Trade${trades.length === 1 ? '' : 's'}`;
const body = one
  ? `<div class="trade-facts">${U.kv('Einstieg → Ausstieg', `${fmt.price(one.entryPrice)} → ${one.exitPrice != null ? fmt.price(one.exitPrice) : '—'}`)}${U.kv('Kontrakte', fmt.num(one.quantity))}${U.kv('R-Multiple', one.r != null ? fmt.r(one.r) : '—')}${U.kv('Brutto-P&L', `<span class="${U.cls(s.gross)}">${fmt.cur(s.gross, Object.assign({ signed: true }, rOf(s.gross)))}</span>`)}${U.kv('Gebühren', fmt.cur(s.fees, rOf(s.fees)))}</div>`
  : `<div class="stats-grid${closed.length >= 3 ? '' : ' solo'}">${closed.length >= 3 ? `<div class="chart h120" data-chart="spark" data-id="${id}"></div>` : ''}<div class="kpis">…bisherige Kacheln, nur Gewinner/Verlierer als ${cnt(s.wins, 'pos')} / ${cnt(s.losses, 'neg')}…</div></div>`;
```
Rückgabe: `<div class="stats-box"><button …>${I.chev}<span>${head}</span></button>${open ? body : ''}</div>`. Geld-blind läuft weiter über `rOf`/`fmt.cur`. Die Schrift (app.css:1036) bleibt, `.stats-grid .v` und `.kv b` sind schon Onest.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: U.kv] Die sechs Schritte ändern vier verschiedene Aufrufstellen. Sie überschneiden sich nur in prop.js Z. 104 (Kontokarte) und mittelbar in planText. Verbindlich für Z. 104, innerhalb des `${dead ? '' : …}` aus zustaende-S-P1: `${U.kv(plan.funded ? 'Nächster Payout' : 'Bis zum Bestehen', plan.hasCond && active ? `<a href="#/prop/bilanz" class="prop-plan-link" data-action="prop-plan-open" data-id="${a.id}">${planText(a, ev, plan)}</a>` : planText(a, ev, plan))}`. Die Zeile wird immer gezeigt, denn sie trägt den einzigen Link in den Planer. planText: Der Gewinn-Teil erscheint nur bei `plan.missingProfit > C.EPS && (plan.funded || !ev.target)`; aufbau-C12a und responsiv-3.12a meinen dasselbe. Sind alle Teile leer und fehlt nur noch Gewinn, liefert planText `<span class="muted">nur noch das Ziel</span>`, sonst '—', nie ''. Ein leerer Wert würde Zeile und Link verstecken, und '—' bedeutet laut Zustände Z2 „Wert fehlt“. Wortlaut und Währungsformat des Betrags entscheidet der Anker planText/money (konflikt-9). prop.js Z. 283 (abstaende-M6): eigene Zeile „Heute noch erlaubt“ als Regelgröße in Kontowährung `money(a, cons.allowedToday, { compact: true })` (KI-Look Z5a/Z5c). Damit entfällt der Teil „heute noch … erlaubt“ in kilook-C19c. Die Testanpassung proptest.js:102 prüft die Zeile „Heute noch erlaubt“ und bei verletzter Regel „verletzt“ in „Consistency Rule“, nicht mehr „heute noch“ in der Consistency-Zeile. stats.js tabSummary (aufbau-C14c) und notebook.js statsHTML (diagramme-L1, Zähler nur > 0 gefärbt, passt zu farbe-C30) sind unabhängig. stats.js tabDays: siehe Anker stats.tabDays. Hinweis: responsiv-B7 (.st-cards, dritte Karte bis 1100 px volle Breite) passt zu den drei Karten aus C14c; die dritte Karte ist dann „Drawdown & Risiko“.

## zustaende-S-C16 · Notizliste: Verlust wieder rot (.note-item span löschen), Trade-Zeile .tr b 12 px/600

Gruppe zustaende · Cluster notebook_news · Aufwand S · Befunde: farbe_kontrast-29, bereich_notebook_news-4
Quelle: audit/spec/zustaende.md Z. 356–359 · Dateien: web/css/app.css
Abhängig von: —

```text
**S-C16 Notizliste: Verlust wieder rot** – farbe_kontrast-29 (mit bereich_notebook_news-4)
- Z. 783 `.note-item span {…}` löschen (falls der ganze Block 779–788 schon durch bereich_notebook_news-36 weg ist, entfällt dieser Teil).
- Nach Z. 1003 neu: `.nb .note-item .tr b { font-size: 12px; font-weight: 600; }`

```

## zustaende-S-C17 · Notebook-Überschriftgrößen aus den Einstellungen wirken im Editor (Spezifität .ql-snow, em-Größen entfernen)

Gruppe zustaende · Cluster notebook_news · Aufwand S · Befunde: typografie-22
Quelle: audit/spec/zustaende.md Z. 360–363 · Dateien: web/css/app.css
Abhängig von: —

```text
**S-C17 Notebook-Überschriften** – typografie-22
- Z. 1904–1906: Selektoren `.ql-editor h1|h2|h3` → `.ql-snow .ql-editor h1`, `.ql-snow .ql-editor h2`, `.ql-snow .ql-editor h3` (Werte `var(--nb-h1, 30px)` usw. bleiben).
- Z. 1133–1135: jeweils `font-size: …em;` entfernen (Rest bleibt).

```

## zustaende-S-NW1 · News-Countdown in Kalendertagen, großgeschrieben (inText mit Datum und now)

Gruppe zustaende · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-40, zustaende-40
Quelle: audit/spec/zustaende.md Z. 787–803 · Dateien: web/js/screens/news.js
Abhängig von: —

```text
### 3.17 `web/js/screens/news.js`

**S-NW1 Countdown in Kalendertagen** – bereich_notebook_news-40, zustaende-40
Z. 50 ersetzen:
```js
function inText(t, now) {
  const m = Math.round((t - now) / 60000); if (m < 1) return 'Jetzt';
  const dd = Math.round((new Date(t.getFullYear(), t.getMonth(), t.getDate()) - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
  if (m < 60) return `In ${m} Min.`;
  const h = Math.floor(m / 60), r = m % 60; const rel = r ? `In ${h} Std. ${r} Min.` : `In ${h} Std.`;
  if (dd === 0 || m < 360) return rel;
  return dd === 1 ? 'Morgen' : `In ${dd} Tagen`;
}
```
- Z. 83 `inText(new Date(next.time) - now)` → `inText(new Date(next.time), now)`. Die kleine Zeile (Datum, Uhrzeit) bleibt.
- Z. 98 im Takt `el.textContent = inText(left);` → `el.textContent = inText(new Date(el.dataset.newsIn), new Date());` (`left` bleibt für die Prüfung `left < -60000`).

```

## zustaende-S-NB1 · Notizliste: Trade-P&L mit Klasse num (Verlust rot)

Gruppe zustaende · Cluster notebook_news · Aufwand S · Befunde: farbe_kontrast-29
Quelle: audit/spec/zustaende.md Z. 846–850 · Dateien: web/js/screens/notebook.js
Abhängig von: zustaende-S-C16

```text
### 3.20 `web/js/screens/notebook.js`

**S-NB1 Verlust in der Notizliste** – farbe_kontrast-29
Z. 60 `U.pnl(pnl, '', { r: t.r })` → `U.pnl(pnl, 'num', { r: t.r })`.

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: U.pnl] Die Regel aus kilook-A3 gilt überall: Ergebnisse laufen über U.pnl und tragen immer ein Vorzeichen, signed: false fällt weg (kilook-C9b Z. 166, kilook-C16 Z. 26). Disziplin-Kosten tragen ein Vorzeichen (farbe-C29). Break-even sieht in TradeLog und Tagesansicht gleich aus: `<span class="neu">${fmt.cur(t.pnl, { signed: true, r: t.r })}</span>`, offene Trades zeigen `U.statusPill('open')` (aufbau-C7c und C15a). Prop-Beträge bekommen { currency: a.currency } (siehe money). Im Notebook tragen alle P&L-Beträge die Klasse num: der Notizkopf (farbe-C24c), die Trade-Notiz in der Liste (zustaende-S-NB1) und ebenso die neue Tagesnotiz-Zeile aus aufbau-C10d. responsiv-3.10 und typografie-3.8h sind verträglich (Text von 3.8h siehe U.barRow).

## zustaende-S-NB2 · Notebook: „Farbe ändern“ nur für eigene Ordner, Standardordner mit Symbol in Verschieben-Menüs

Gruppe zustaende · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-33
Quelle: audit/spec/zustaende.md Z. 851–854 · Dateien: web/js/screens/notebook.js
Abhängig von: —

```text
**S-NB2 Farbe nur für eigene Ordner** – bereich_notebook_news-33
- Z. 51: Eintrag `<button … data-action="nb-folder-edit" … data-color="1">${I.dot} Farbe ändern</button>` nur bei `!x.isDefault` ausgeben.
- Z. 62 (`nb-move-sel`) und Z. 74 (`nb-move`): statt `<i style="width:10px;height:10px;border-radius:3px;background:${esc(x.color)}"></i>` → `${x.isDefault ? folderIcon(x) : `<i style="width:10px;height:10px;border-radius:3px;background:${esc(x.color)}"></i>`}`.

```

## zustaende-S-TE4 · Test newstest.js:54: Countdown großgeschrieben (/^In 2 Std\./)

Gruppe zustaende · Cluster notebook_news · Aufwand S · Befunde: zustaende-40, bereich_notebook_news-40
Quelle: audit/spec/zustaende.md Z. 880–880 · Dateien: web/e2e/newstest.js
Abhängig von: zustaende-S-NW1

```text
- `e2e/newstest.js:54`: `/^in 2 Std\./` → `/^In 2 Std\./`.
```

## barrierefreiheit-B13 · Vergangene News: Text in --muted statt Deckkraft .5, Balken .6

Gruppe barrierefreiheit · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-47
Quelle: audit/spec/barrierefreiheit.md Z. 385–389 · Dateien: web/css/app.css
Abhängig von: —

```text
**B13 Vergangene News** (Z. 3090)
- vorher: `.nw-row.past { opacity: .5; }`
- nachher: `.nw-row.past :is(.nw-time, .nw-title, .nw-cur) { color: var(--muted); } .nw-row.past .nw-v b { color: var(--muted); } .nw-row.past .nw-imp { opacity: .6; }`
- Befunde: bereich_notebook_news-47

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: --muted] (1) Der Akzent-Hinweis in Einstellungen → Design (misc.js Z. 145) lautet „„Trade loggen“, Schalter, aktive Einträge und Diagramme.“ (farbe-C22c). Die wording-Fassung „Hauptknöpfe, Schalter, Markierungen und Diagramme.“ wäre nach dem neutralen .btn.primary falsch und widerspräche W1 („Hilfetexte sagen, was der Code tut“). (2) „Auf Standard zurücksetzen“-Knöpfe sind einheitlich `.btn.ghost.sm`, ohne Inline-Farbe und ohne eigene --muted-Variante (Komponenten: „keine weiteren Varianten“, kein Inline-Stil; abstaende-L6/-L8 entfernen die Inline-Farbe bereits). Die Farbe ist die von .btn.ghost (--text-2, Hover --text). Das gilt für color-reset, be-reset, die Notebook-Einstellungen und tags-reset. (3) Die --muted-Werte (farbe-A1/A2) und ihre Nutzung in barrierefreiheit-B13 und diagramme-A1 sind verträglich.

## barrierefreiheit-C-editor-112 · Farbknöpfe im Editor benennen (Schriftfarbe/Textmarker {0})

Gruppe barrierefreiheit · Cluster notebook_news · Aufwand S · Befunde: barrierefreiheit-36
Quelle: audit/spec/barrierefreiheit.md Z. 738–738 · Dateien: web/js/editor.js
Abhängig von: —

```text
- Z. 112: beide `<button type="button" class="c" …>` (eigene und Standardfarben) bekommen `aria-label="${kind === 'color' ? 'Schriftfarbe' : 'Textmarker'} ${esc(c)}"`.
```

## barrierefreiheit-C-news-49 · News-Wichtigkeitsbalken role=img mit aria-label wie title

Gruppe barrierefreiheit · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-47
Quelle: audit/spec/barrierefreiheit.md Z. 884–887 · Dateien: web/js/screens/news.js
Abhängig von: —

```text
#### `web/js/screens/news.js`

- **Z. 49:** an beiden Varianten von `.nw-imp` `role="img"` und `aria-label` mit demselben Text wie `title` ergänzen („Hohe/Mittlere/Niedrige Wichtigkeit“, „Feiertag“) (Befund: bereich_notebook_news-47)

```

## barrierefreiheit-E-newstest-52 · newstest.js:52: vergangene Termine über --muted-Farbe statt Deckkraft prüfen

Gruppe barrierefreiheit · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-47
Quelle: audit/spec/barrierefreiheit.md Z. 904–904 · Dateien: web/e2e/newstest.js
Abhängig von: barrierefreiheit-B13

```text
| newstest.js:52 | `getComputedStyle(r).opacity < 0.7` | `r.classList.contains('past') && getComputedStyle(r.querySelector('.nw-title')).color === (() => { const s = document.createElement('span'); s.className = 'muted'; document.body.appendChild(s); const c = getComputedStyle(s).color; s.remove(); return c; })()` |
```

## kilook-B7 · News-Hero: Glockenkachel-CSS löschen, Countdown am Handy in eigener Zeile

Gruppe kilook · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-41
Quelle: audit/spec/kilook.md Z. 464–467 · Dateien: web/css/app.css
Abhängig von: —

```text
**B7 · web/css/app.css · News-Hero** (bereich_notebook_news-41)
- **3071–3072** `.nw-next-ico { … }` und `.nw-next-ico svg { … }` löschen.
- **3119** im Block `@media (max-width: 640px)` an die Regel `.nw-next-when { … }` `flex-basis: 100%;` anhängen. Der Countdown bricht damit am Handy immer in eine eigene zweite Zeile.

```

## kilook-C2 · Notebook-CSS: .journal/.note-*-Reste und tags-row-Regeln löschen, Umwandeln-Label 13px/500

Gruppe kilook · Cluster notebook_news · Aufwand M · Befunde: bereich_notebook_news-36
Quelle: audit/spec/kilook.md Z. 524–534 · Dateien: web/css/app.css
Abhängig von: —

```text
**C2 · web/css/app.css · Notebook-Reste** (bereich_notebook_news-36)
- **769** Kommentar `/* ---------- Journal ---------- */` → `/* ---------- Notebook-Ordner ---------- */`
- **770–774** `.journal …` (5 Regeln) löschen.
- **775–778** `.folder …` **bleiben**.
- **779–787** löschen: `.note-item`, `:hover`, `.active`, `b`, `span`, `.note-title`, `.note-title:focus`, `.note-body`, `.note-body:focus`.
- **788** `@media (max-width: 960px) { .journal … }` löschen.
- **1028** `.nb .note-title:focus { outline: none; }` **bleibt**.
- **1057** `.nb .tags-row input { max-width: 190px; … }` und **1059** `.nb .tags-row input { max-width: none; }` löschen.
- **1085–1086** vorher `.nb-toolbar .tb.turn .lbl { font-size: 15px; }` und `.nb-toolbar .tb .lbl { font-size: 13px; font-weight: 600; }`
  → nachher eine Regel `.nb-toolbar .tb.turn .lbl { font-size: 13px; font-weight: 500; }`. Werte aus typografie/bereich_notebook_news-14. `.lbl` gibt es nur im Umwandeln-Knopf (editor.js:118).

```

**Hinweise aus der Abstimmung (verbindlich):**

- [konflikt: .nb .tags-row input] Toter Code (.tags-row enthält kein input, notebook.js:77): kilook-C2 löscht Z. 1057 und 1059. Nicht tokenisieren.
- [konflikt: .note-body] Die ungebundene Regel `.note-body { … }` (Z. 786) und `.note-body:focus` (Z. 787) werden gelöscht (kilook-C2). Ganz tot sind sie aber nicht: `.nb .note-body` (notebook.js:78, Papierkorb notebook.js:67) erbt heute 14,5 px und Zeilenhöhe 1.65, und Werkzeugleiste, `.nb-menu` und `.nb-ytpop` liegen darin. Die Schriftgröße kommt danach vom body (14 px nach typografie), das ist der typografie-Zielwert. Die Zeilenhöhe, die typografie ausdrücklich behält („1.65 bleibt“), wandert in die gebundene Regel Z. 1058: `.nb .note-body { padding: 0 8px 20px; line-height: 1.65; }`. Der Editor-Text ist nicht betroffen (`.ql-container.ql-snow` setzt `--nb-body`, `.ql-editor` 1.65). Hinweis zu den übrigen C2-Löschungen (Z. 779–783): Heute schlägt `.note-item span` (0,1,1) die Klasse `.pos`/`.neg` aus U.pnl. Nach dem Löschen steht das P&L in der Notizliste in Gewinn- oder Verlustfarbe wie überall in der App. Das ist gewollt, die Notizliste per Aufnahme prüfen.
- ÄNDERN: Z. 786–787 wie geplant löschen und `.nb .note-body` (Z. 1058) zu `padding: 0 8px 20px; line-height: 1.65;` ergänzen. Nach dem Löschen von Z. 779–783 Notizliste und Papierkorb-Notiz per Aufnahme prüfen.
- [konflikt: .note-title] Im Code passen die drei Schritte zusammen:
- K3 baut den Papierkorb-Kopf mit `<h2 class="note-title">` innerhalb von `.nb`. Dort greift `.nb .note-title` (Z. 1014) und nicht die ungebundene Regel, die C2 löscht. `h2` hat über Z. 90 margin 0.
- `.nb .note-title:focus` (Z. 1028) bleibt.
- responsiv-A3 schließt `.note-title` über die Klasse am Titelfeld aus, die Klasse bleibt im Markup.

Einziger Widerspruch ist ein Wert: Die abstaende-Prüfung 14 erwartet „Titel 34 px“, typografie setzt den Notiz-Titel auf 32/600 (≤ 960: 26, ≤ 560: 24). Verbindlich: Der Papierkorb-Titel ist so groß wie der Titel einer offenen Notiz, also 32 px am Desktop.
- [doppelt: .journal] Beide löschen denselben toten Code: Z. 770–774 und Z. 788, deren @media nur `.journal`-Regeln enthält. kilook-C2 übernimmt, inklusive Kommentar „Notebook-Ordner“. Die `.folder`-Regeln Z. 775–778 bleiben.
- ÜBERNIMMT typografie-3.2.2d: Nicht separat umsetzen; Z. 770–774 und Z. 788 löscht kilook-C2.
- [doppelt: .nb-toolbar .tb .lbl] Dieselbe Änderung zweimal. typografie-3.2.3j übernimmt, weil sie Tokens und Zeilenhöhe mitbringt: Z. 1086 `.nb-toolbar .tb .lbl` löschen (`.lbl` gibt es nur im Umwandeln-Knopf, editor.js:118). Z. 1085 wird `.nb-toolbar .tb.turn .lbl { font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 500; }`.
- ÄNDERN: Den Punkt „1085–1086“ weglassen, ihn setzt typografie-3.2.3j um. Übrige C2-Punkte unverändert.
- [doppelt: .nb-toolbar .tb.turn .lbl] Wie beim Anker .nb-toolbar .tb .lbl: typografie-3.2.3j übernimmt. Endstand: `.nb-toolbar .tb.turn .lbl { font-size: var(--fs-13); line-height: var(--lh-13); font-weight: 500; }`, Z. 1086 gelöscht.
- ÄNDERN: Punkt „1085–1086“ entfällt (übernimmt typografie-3.2.3j).
