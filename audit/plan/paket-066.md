# Paket 066 · shell, komponenten

Schritte: 4 · Dateien: web/js/app.js
Betroffene Tests laut Spezifikation: —
Baut auf Paketen auf: 10, 65

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

## barrierefreiheit-P5 · Seitenleiste: aria-current, title nur eingeklappt, Gruppen role=group, inert-Logik der Schublade

Gruppe barrierefreiheit · Cluster shell · Aufwand M · Befunde: bereich_shell-13, barrierefreiheit-32, barrierefreiheit-49, bereich_shell-14, bereich_shell-15
Quelle: audit/spec/barrierefreiheit.md Z. 596–607 · Dateien: web/js/app.js
Abhängig von: barrierefreiheit-H2, barrierefreiheit-P1

```text
**P5 Seitenleiste** (`renderSidebar` Z. 200–214)
- Z. 209 (`const desk …; const mini …`) **vor** Z. 207 ziehen.
- Z. 207 vorher: `<a href="#/${key}" class="${cur === key ? 'active' : ''}" title="${label}" data-action="nav-close">`
  nachher: `` <a href="#/${key}" class="${cur === key ? 'active' : ''}"${cur === key ? ' aria-current="page"' : ''}${mini ? ` title="${label}"` : ''} data-action="nav-close"> ``
- Z. 210: `` ${NAV_GROUPS.map(([title, items]) => `<nav class="nav nav-group" aria-label="${title}"><div class="nav-title">${title}</div>…</nav>`)} ``
  → `` ${NAV_GROUPS.map(([title, items], gi) => `<div class="nav nav-group" role="group" aria-labelledby="ng-${gi}"><div class="nav-title" id="ng-${gi}">${title}</div>…</div>`)} ``
- Z. 210: `this.userCard(theme, why('coach'))` → `this.userCard(theme, why('coach'), mini)`
- nach Z. 210: `this.popInit(sb);`
- Z. 212 nach `scrim.classList.toggle('show', open);`:
  `const mob = !desk; sb.inert = mob && !open; const mainEl = document.getElementById('main'); if (mainEl) mainEl.inert = mob && open;`
- Befunde: bereich_shell-13, barrierefreiheit-32, barrierefreiheit-49, bereich_shell-14, bereich_shell-15

```

## barrierefreiheit-P6 · Schublade: Fokus auf „Menü schließen“ beim Öffnen, closeSidebar mit Fokus-Rückgabe an den Menüknopf

Gruppe barrierefreiheit · Cluster shell · Aufwand S · Befunde: bereich_shell-15
Quelle: audit/spec/barrierefreiheit.md Z. 608–615 · Dateien: web/js/app.js
Abhängig von: barrierefreiheit-P5

```text
**P6 Schublade öffnen und schließen** (Aktionen Z. 308–311, neue Methode)
- Z. 308: `sidebar() { this.state.sidebarOpen = !this.state.sidebarOpen; this.renderSidebar(); if (this.state.sidebarOpen) document.querySelector('#sidebar .sb-toggle')?.focus({ preventScroll: true }); },`
- Neu im App-Objekt: `closeSidebar() { const back = document.getElementById('sidebar').contains(document.activeElement); this.state.sidebarOpen = false; this.renderSidebar(); if (back) document.querySelector('.menu-btn')?.focus({ preventScroll: true }); },`
- Z. 310 mobiler Zweig `else { this.state.sidebarOpen = false; this.renderSidebar(); }` → `else this.closeSidebar();`
- Z. 311: `scrim() { this.closeSidebar(); },`
- `nav-close` (Z. 313) bleibt.
- Befunde: bereich_shell-15

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
