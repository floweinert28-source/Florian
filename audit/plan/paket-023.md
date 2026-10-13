# Paket 023 · notebook_news

Schritte: 32 · Dateien: web/README.md, web/css/app.css, web/e2e/newstest.js, web/e2e/sixtest.js, web/js/editor.js, web/js/sample.js, web/js/screens/news.js, web/js/screens/notebook.js, web/js/store.js
Betroffene Tests laut Spezifikation: e2e/colorpickertest.js; e2e/headtest.js:62–64 (.nb .folder.active); e2e/imgtest.js:5 (.nb .col.mid .btn.primary nur Ausweich-Selektor); e2e/mobiletest.js:53 (nb-share); e2e/nbsel.js:11–17; e2e/nbsel.js:12–17; e2e/sampletest.js; e2e/sixtest.js:52–57; e2e/sixtest.js:52–57 (siehe E1c); e2e/sixtest.js:57; web/e2e/dptest.js:104 (bleibt grün); web/e2e/figtest.js:5, web/e2e/figdel.js:5, web/e2e/scrolltest.js:30 (in Abschnitt 5 genannt, müssen grün bleiben); web/e2e/mobiletest.js:53 (.datebtn bleibt); web/e2e/newstest.js:52; web/e2e/newstest.js:54; web/e2e/newstest.js:54 (Schritt zustaende-S-TE4); web/tests/core.test.mjs; web/tests/sample.test.mjs
Baut auf Paketen auf: 5

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## komponenten-C21d · Haken in Notebook-Tags und Editor-Menüs 16 px in --text-2

Gruppe komponenten · Cluster notebook_news · Aufwand S · Befunde: komponenten-2
Quelle: audit/spec/komponenten.md Z. 372–373 · Dateien: web/css/app.css
Abhängig von: —

```text
- Notebook-Tags und Editor: Z. 1052 `.nb .tagpop .chk { width: 14px; height: 14px; … color: var(--accent); }` → `width: 16px; height: 16px; … color: var(--text-2);`; Z. 1053 (`.nb .tagpop .chk svg`) löschen. Z. 1103 `.ed-pop .item .chk { display: none; width: 14px; height: 14px; color: var(--accent); }` → `width: 16px; height: 16px; color: var(--text-2);` (display bleibt).

```

## komponenten-C29a · Notebook-Ordner: gerader Farbbalken als ::before, Namen bündig

Gruppe komponenten · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-32
Quelle: audit/spec/komponenten.md Z. 432–434 · Dateien: web/css/app.css
Abhängig von: —

```text
**C29 – Notebook: Ordner und Tag-Menü** (bereich_notebook_news-32, bereich_notebook_news-20, komponenten-2)
- Z. 978 `.nb .folder { … padding: 8px 8px 8px 10px; … border: 1px solid transparent; border-left: 3px solid var(--fc, transparent); … }` → `padding: 8px 8px 8px 12px;` und die Deklaration `border-left: 3px solid var(--fc, transparent);` streichen.
- Neu nach Z. 978: `.nb .folder::before { content: ''; position: absolute; left: 0; top: 8px; bottom: 8px; width: 3px; border-radius: 2px; background: var(--fc, transparent); }`
```

## komponenten-C29b · Notebook-Tag-Menü (CSS): eine Spalte, 280 px, Suchfeld, keine farbigen Köpfe

Gruppe komponenten · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-20, komponenten-2
Quelle: audit/spec/komponenten.md Z. 435–441 · Dateien: web/css/app.css
Abhängig von: —

```text
- Z. 1041 `.nb .tagpop { min-width: 220px; width: max-content; max-width: min(720px, calc(100vw - 48px)); }` → `.nb .tagpop { width: 280px; max-width: calc(100vw - 32px); }`
- Z. 1042 `.nb .tagcols { display: flex; gap: 4px; align-items: flex-start; }` → `.nb .tagcols { display: flex; flex-direction: column; gap: 0; max-height: 360px; overflow-y: auto; overscroll-behavior: contain; }`
- Z. 1043–1045 (farbige `.sec.k-*`/`.item.k-*[aria-checked]`) und Z. 1046 löschen; neu: `.nb .tagpop .item[aria-checked="true"] { color: var(--text); }`
- Z. 1050 `.nb .tagcol { min-width: 150px; max-height: 340px; overflow-y: auto; … }` → `.nb .tagcol { min-width: 0; }`
- Z. 1051 (Regel ≤760 px) löschen.
- Neu: `.nb .tagpop-q { padding: 4px 4px 6px; } .nb .tagpop-q .input { height: 34px; padding: 0 10px; font-size: 13px; }`

```

## komponenten-C30 · Ordner-Dialog (CSS): Plus-Farbkreis .swatch.add, gleichmäßige Abstände

Gruppe komponenten · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-31
Quelle: audit/spec/komponenten.md Z. 442–452 · Dateien: web/css/app.css
Abhängig von: —

```text
**C30 – Ordner-Dialog** (bereich_notebook_news-31)
Nach den `.swatch`-Regeln (Z. 580–584; `.swatch` ist die Pille mit 18-px-Farbkreis, die der Ordner-Dialog schon nutzt) einfügen:
```css
.swatch.add { position: relative; }
.swatch.add i { border: 1px dashed var(--border-2); display: grid; place-items: center; color: var(--text-2); }
.swatch.add i svg { width: 12px; height: 12px; }
.swatch.add input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
form[data-action="nb-folder-save"] .stack { gap: 16px; }
form[data-action="nb-folder-save"] .modal-foot { margin-top: 20px; padding-top: 14px; }
```

```

## komponenten-D4 · store.js: „Daily Journal“ nicht grün, einmalige Umfärbung

Gruppe komponenten · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-31
Quelle: audit/spec/komponenten.md Z. 622–624 · Dateien: web/js/store.js
Abhängig von: —

```text
**D4 – store.js: Daily Journal nicht grün** (bereich_notebook_news-31)
Z. 56 `['daily', 'Daily Journal', '#34f58a']` → `['daily', 'Daily Journal', '#9aa3a0']`. Beim Laden (dort, wo Standardordner ergänzt werden) einmalig: Ordner mit `id === 'daily'`, `isDefault` und Farbe `#34f58a` (ohne Groß-/Kleinschreibung) bekommen `#9aa3a0`.

```

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

## aufbau-C9b · News: Zähler-Pille im Tageskopf entfernen

Gruppe aufbau · Cluster notebook_news · Aufwand S · Befunde: bereich_notebook_news-44
Quelle: audit/spec/aufbau.md Z. 505–505 · Dateien: web/js/screens/news.js, web/css/app.css
Abhängig von: —

```text
- Z. 81 `<span class="nw-n">${g.items.length}</span>` streichen; `web/css/app.css` Regel `.nw-n` löschen
```

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

## barrierefreiheit-C-editor-112 · Farbknöpfe im Editor benennen (Schriftfarbe/Textmarker {0})

Gruppe barrierefreiheit · Cluster notebook_news · Aufwand S · Befunde: barrierefreiheit-36
Quelle: audit/spec/barrierefreiheit.md Z. 738–738 · Dateien: web/js/editor.js
Abhängig von: —

```text
- Z. 112: beide `<button type="button" class="c" …>` (eigene und Standardfarben) bekommen `aria-label="${kind === 'color' ? 'Schriftfarbe' : 'Textmarker'} ${esc(c)}"`.
```
