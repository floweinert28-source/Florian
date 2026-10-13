# Paket 064 · training, komponenten, shell, trades_tag

Schritte: 6 · Dateien: web/e2e/notechecktest.js, web/js/app.js, web/js/screens/day.js, web/js/screens/progress.js
Betroffene Tests laut Spezifikation: web/e2e/notechecktest.js:14
Baut auf Paketen auf: 6, 63

Jeder Schritt zitiert die Spezifikation wörtlich (Datei und Zeilen). „Hinweise aus der Abstimmung“ haben Vorrang vor dem Spezifikationstext.

## barrierefreiheit-P2 · Menüs: aria-expanded beim Öffnen/Schließen, Öffnen per Tastatur fokussiert Eintrag

Gruppe barrierefreiheit · Cluster komponenten · Aufwand S · Befunde: bereich_dashboard-22, barrierefreiheit-26, barrierefreiheit-27, bereich_shell-12
Quelle: audit/spec/barrierefreiheit.md Z. 565–572 · Dateien: web/js/app.js
Abhängig von: barrierefreiheit-P1

```text
**P2 Menüs** (Klick-Handler Z. 275, `closePopovers` Z. 172)
- Z. 275, Zweig „öffnen“, nach `target.classList.add('open');`:
  `pop.setAttribute('aria-expanded', 'true'); this.fitPopover(target); if (e.detail === 0) { const f = target.querySelector('[aria-checked="true"]') || target.querySelector('.item:not([disabled]), a[href], button:not([disabled])'); if (f) f.focus({ preventScroll: true }); }`
  (das bisherige `this.fitPopover(target)` dorthin verschieben)
- Z. 172 in der forEach-Schleife vor `M.leave(…)`:
  `` document.querySelectorAll(`[data-pop="${CSS.escape(p.id.slice(4))}"]`).forEach(b => b.setAttribute('aria-expanded', 'false')); ``
- Befunde: bereich_dashboard-22, barrierefreiheit-26, barrierefreiheit-27, bereich_shell-12

```

## barrierefreiheit-P7 · Konto-Karte: Disclosure statt role=menu, Label/title nur eingeklappt, Avatar aria-hidden

Gruppe barrierefreiheit · Cluster shell · Aufwand S · Befunde: bereich_shell-12, barrierefreiheit-27
Quelle: audit/spec/barrierefreiheit.md Z. 616–624 · Dateien: web/js/app.js
Abhängig von: barrierefreiheit-P5, barrierefreiheit-P2

```text
**P7 Konto-Karte** (`userCard` Z. 218–233)
- Signatur `userCard(theme, coachWhy, mini)`.
- Z. 226 `link`: `role="menuitem"` streichen.
- Z. 227 vorher: `data-pop="user" aria-haspopup="menu" aria-label="Konto und Einstellungen" title="Konto und Einstellungen"`
  nachher: `data-pop="user"${mini ? ' aria-label="Konto und Einstellungen" title="Konto und Einstellungen"' : ''}`
- Z. 228: `<span class="sb-av">` → `<span class="sb-av" aria-hidden="true">` (der Hinweis-Punkt `sb-av-dot` behält sein Label)
- Z. 231: `<div class="popover up sb-menu" id="pop-user" role="menu">` → ohne `role`
- Befunde: bereich_shell-12, barrierefreiheit-27

```

**Hinweise aus der Abstimmung (verbindlich):**

- [doppelt: App.userCard] Drei Schritte legen dieselbe Namenslogik an (aufbau: App.userName(), komponenten: App.userInfo… nein App.displayName(), zustaende: App.userInfo()). Es gibt genau eine Quelle: App.userInfo() aus zustaende-S-A3. Sie gibt { name, initials, sub, avatarId } zurück, also alles, was userCard und topbar brauchen; die beiden anderen Fassungen liefern weniger (A2 kein sub). Sie steht im App-Objekt vor userCard. App.userName() und App.displayName() werden nicht angelegt und auch in README, regeln.md und Kommentaren nicht genannt; dort heißt es App.userInfo(). Den Text „Profil ergänzen“ setzt nur wording-S5.1-5.2 Teil 5.2 um, und zwar einmal: app.js:229, usercardtest.js:11 und die Umbenennung des Sprachschlüssels. Ebenfalls umzusetzen und verträglich: aufbau-B4 (Reihenfolge und Markierung .on im Konto-Menü), barrierefreiheit-P7 (kein role=menu/menuitem, .sb-av mit aria-hidden, Signatur userCard(theme, coachWhy, mini)) und komponenten-A1 (cdot bekommt data-tip statt title, aria-label bleibt). Endform der Hilfsfunktion: const link = (href, icon, label, extra = '', on = false) => `<a class="item${on ? ' on' : ''}" href="${href}" data-action="nav-close">${I[icon]}<span>${label}</span>${extra}</a>`; Die Attribute am Knopf .sb-user regelt der Anker .sb-user.
- [konflikt: .sb-user] An .sb-user steht kein title, auch eingeklappt nicht. Der App-Tooltip (#tip rechts, komponenten-U3) ersetzt ihn, sonst erscheinen zwei Tooltips. Eingeklappt braucht der Knopf aber einen Namen, weil .sb-who dann ausgeblendet ist; das aria-label aus P7 bleibt deshalb. Endform: <button type="button" class="sb-user${cur === 'settings' || cur === 'coach' || cur === 'affiliate' ? ' active' : ''}" data-pop="user"${mini ? ' aria-label="Konto und Einstellungen" data-tip="Konto und Einstellungen" data-tip-side="right"' : ''}>. aria-expanded und aria-controls setzt popInit (P1/P5); kein aria-haspopup. Das ist dasselbe Muster wie bei den eingeklappten Navigationslinks (Anker App.renderSidebar). data-tip-side braucht komponenten-U3 in bindTips.
- ÄNDERN: Z. 227 nachher: data-pop="user"${mini ? ' aria-label="Konto und Einstellungen" data-tip="Konto und Einstellungen" data-tip-side="right"' : ''}. Kein title und kein aria-haspopup. Die übrigen Punkte bleiben wie spezifiziert: Signatur mit mini, role="menuitem" und role="menu" streichen, .sb-av mit aria-hidden. Regel in barrierefreiheit.md Z. 98 und K12: statt „aria-label/title nur eingeklappt“ gilt „aria-label und App-Tooltip nur eingeklappt, kein title“.

## barrierefreiheit-C-day-18 · Tages-Regelliste als <button role="checkbox" aria-checked>

Gruppe barrierefreiheit · Cluster trades_tag · Aufwand S · Befunde: barrierefreiheit-15, bereich_trades_tag-41, bereich_training-20
Quelle: audit/spec/barrierefreiheit.md Z. 762–767 · Dateien: web/js/screens/day.js
Abhängig von: barrierefreiheit-B5, barrierefreiheit-P1

```text
- **Z. 18:**
  - vorher: `<div class="it toggle ${…}" data-action="day-rule" data-day="${key}" data-rule="${r.id}">…</div>`
  - nachher: `<button type="button" class="it toggle ${followed.includes(r.id) ? 'done' : ''}" role="checkbox" aria-checked="${followed.includes(r.id)}" data-action="day-rule" data-day="${key}" data-rule="${r.id}">…</button>`
  - Die Fokus-Rückgabe nach `App.rerender()` übernimmt P1.
  - Befunde: barrierefreiheit-15, bereich_trades_tag-41, bereich_training-20

```

## barrierefreiheit-C-progress-73 · Fortschritt: Tages-Checkliste als <button role="checkbox"> (wie day.js:18)

Gruppe barrierefreiheit · Cluster training · Aufwand S · Befunde: barrierefreiheit-15, bereich_training-20
Quelle: audit/spec/barrierefreiheit.md Z. 768–770 · Dateien: web/js/screens/progress.js
Abhängig von: barrierefreiheit-B5, barrierefreiheit-P1, barrierefreiheit-C-day-18

```text
#### `web/js/screens/progress.js`

- **Z. 73:** wie day.js:18, mit `rule.id` (Befunde: barrierefreiheit-15, bereich_training-20)
```

## barrierefreiheit-C-progress-75 · „Dein Tag“: Aktionszeilen als Knopf, Tagesnotiz als role=checkbox; Heatmap bleibt

Gruppe barrierefreiheit · Cluster training · Aufwand S · Befunde: bereich_training-20, barrierefreiheit-15
Quelle: audit/spec/barrierefreiheit.md Z. 771–776 · Dateien: web/js/screens/progress.js
Abhängig von: barrierefreiheit-B5, barrierefreiheit-P1

```text
- **Z. 75 („Dein Tag“):**
  - Zeilen mit `it.action` (ohne href) werden `<button type="button" class="it toggle ${it.done ? 'done' : ''}" data-action="${it.action}">`. Für `day-note-check` kommt zusätzlich `role="checkbox" aria-checked="${!!it.done}"` dazu.
  - Zeilen mit href bleiben `<a>`, Zeilen ohne beides bleiben `<div class="it">` (z. B. „Regeln abgehakt“).
  - Befunde: bereich_training-20, barrierefreiheit-15
- **Z. 28 (Heatmap):** bleibt (siehe Zurückgestellt).

```

## barrierefreiheit-E-notechecktest-14 · notechecktest.js:14: Tagesnotiz-Zeile ist BUTTON mit role=checkbox

Gruppe barrierefreiheit · Cluster training · Aufwand S · Befunde: bereich_training-20
Quelle: audit/spec/barrierefreiheit.md Z. 903–903 · Dateien: web/e2e/notechecktest.js
Abhängig von: barrierefreiheit-C-progress-75

```text
| notechecktest.js:14 | `x.tagName === 'DIV'` | `x.tagName === 'BUTTON'` und `x.getAttribute('role') === 'checkbox'` |
```
