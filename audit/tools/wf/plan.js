export const meta = {
  name: 'design-audit-plan',
  description: 'Design-Audit Journalyst: Bericht (REPORT.md) und Umsetzungsplan (PLAN.md) aus den Spezifikationen',
  phases: [{ title: 'Plan' }],
}
const ag = async (prompt, opts) => { const r = await agent(prompt, opts); if (r != null) return r; log(`Agent ${(opts && opts.label) || ''} ohne Ergebnis – Wiederholung mit Opus`); return agent(prompt, Object.assign({}, opts || {}, { model: 'opus', label: ((opts && opts.label) || 'agent') + ' (opus)' })) }
const SP = '/tmp/claude-0/-home-user-Florian/3d79e81c-3967-55f9-a53a-e07cf04bcd94/scratchpad'
const AU = SP + '/audit'
const WEB = '/home/user/Florian/web'
const SK = '/home/user/Florian/.claude/skills'
const sh = (ctx, name) => `${AU}/shots/${ctx}/${name}.png`
const D = n => sh('dark-1440', n), L = n => sh('light-1440', n), M = n => sh('dark-390', n), T = n => sh('dark-1024', n), X = n => sh('extra-dark-1440', n), XM = n => sh('extra-dark-390', n), XL = n => sh('extra-light-1440', n)

const BASE = `Du bist Teil eines gründlichen Design-Audits der Trading-Journal-Web-App Journalyst. Ziel des Nutzers: Die App soll in Design und Aufbau wirklich perfekt werden – Schriftgrößen, Abschnitte, Abstände, Farben, Komponenten, Wortwahl, Zustände, alles.
Lies ZUERST vollständig ${AU}/BRIEF.md (verbindliche Vorgaben des Nutzers, Material, Befund-Format). Was dort als abgelehnt steht, schlägst du nicht vor.
Arbeite auf Deutsch. Screenshots sind PNG-Dateien: mit dem Read-Werkzeug ansehen. Code liegt unter ${WEB} (css/app.css, js/app.js, js/ui.js, js/widgets.js, js/screens/*.js). Die README ${WEB}/README.md dokumentiert bestehende Entscheidungen.
Jeder Befund muss belegt sein (Screenshot-Name, datei:zeile oder Zensus-Wert) und einen konkreten Vorschlag haben (vorher → nachher), den ein anderer Agent ohne Rückfrage umsetzen kann. Schwere: 1 = fällt sofort auf oder stört die Bedienung, 2 = deutlich sichtbare Inkonsistenz, 3 = Feinschliff. Keine Allgemeinplätze. Wenn etwas gut ist, sag das kurz in "hinweise", statt Befunde zu erfinden.`


const OUT = { type: 'object', properties: { datei: { type: 'string' }, zusammenfassung: { type: 'string' }, cluster: { type: 'array', items: { type: 'object', properties: { nr: { type: 'integer' }, name: { type: 'string' }, ids: { type: 'integer' }, dateien: { type: 'string' } }, required: ['nr', 'name'] } } }, required: ['datei', 'zusammenfassung'] }
phase('Plan')
const ctx = `Material: Spezifikationen je Themengruppe in ${AU}/spec/*.md (lies ALLE vollständig); bestätigte Befunde ${AU}/findings-verified.json (${args.n} Stück; Kurzliste ${AU}/kept-index.txt); Nachbefunde der Lückenrunde sind darin enthalten (ids gap…); verworfene Befunde mit Grund ${AU}/findings-dropped.json (${args.dropped_n} Stück); Inventare ${AU}/inventar-css.md, ${AU}/inventar-wording.md.`
const [plan, report] = await parallel([
  () => ag(`${BASE}
Rolle: Technischer Leiter, der aus den Spezifikationen einen Umsetzungsplan macht. ${ctx}
Schreibe ${AU}/PLAN.md (Deutsch): Cluster, so geordnet, dass jeder Cluster für sich umgesetzt, getestet (Playwright-Suiten unter ${SP}, Aufruf siehe BRIEF.md) und committet werden kann und spätere auf früheren aufbauen: 1) Tokens und Skalen (Typo, Abstände, Radien, Farben) in app.css, 2) Komponenten (Knopf, Feld, Karte, Kachel, Tabelle, Popover, Dialog, Reiter …), 3) Shell (Seitenleiste, Titelzeile, Handy), 4) Seiten einzeln (Dashboard, Statistik, TradeLog/Tag, Notebook/News, Training, Prop, Konto-Bereiche, Einstellungen), 5) Diagramme, 6) Zustände und Barrierefreiheit, 7) Wording (Texte und Übersetzungen: deutsche Strings ändern sich → Sprachdateien web/js/lang/*.js über die Übersetzungs-Pipeline nachziehen), 8) Aufbau/IA-Änderungen, 9) Bewegung. Je Cluster: Nummer, Name, Ziel, Befund-ids, Dateien, Arbeitsschritte (aus den Spezifikationen übernommen, konkret), Akzeptanzkriterien, Risiken (welche bestehenden Tests betroffen sein könnten), geschätzter Aufwand. Konflikte zwischen Spezifikationen löst du auf und dokumentierst sie oben in einem Abschnitt „Entscheidungen“. Jede bestätigte Befund-id muss in genau einem Cluster stehen oder in „Zurückgestellt“ mit Grund oder in „Nutzer fragen“ (aus den Abschnitten 6 der Spezifikationen; diese werden NICHT umgesetzt, bis der Nutzer zustimmt – sammle sie am Ende in einem Abschnitt „Fragen an dich“ mit Empfehlung).`, { label: 'plan', phase: 'Plan', schema: OUT }),
  () => ag(`${BASE}
Rolle: Leitender Designer, der den Audit-Bericht für den Nutzer schreibt. ${ctx}
Schreibe ${AU}/REPORT.md (Deutsch, für einen Nicht-Designer verständlich, aber präzise): a) Gesamturteil in 8–10 Sätzen und die 10 wichtigsten Punkte; b) „Design-Spezifikation Zielzustand“ – die Regeln aus allen spec/*.md zusammengeführt und widerspruchsfrei: Typo-Skala (jede Stufe px/Gewicht/Zeilenhöhe/Rolle), Abstandsskala, Radien/Rahmen/Schatten, Farbregeln dunkel und hell, Komponentenstandards, Diagrammregeln, Bewegungsregeln, Wording-Regelwerk und Glossar, Aufbau-Entscheidungen, Zustände; c) Befunde nach Bereich als Tabellen (id, Schwere, Titel, Vorschlag kurz); d) Zahlen: wie viele Befunde gefunden, bestätigt, verworfen, je Kategorie und Schwere; e) Was bewusst nicht gemacht wird (zurückgestellt/verworfen, die wichtigsten Gründe); f) „Fragen an dich“: alle Punkte aus den Abschnitten „Nutzer fragen“ der Spezifikationen, je mit Empfehlung.`, { label: 'report', phase: 'Plan', schema: OUT }),
])
return { plan, report }
