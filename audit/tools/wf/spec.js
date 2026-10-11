export const meta = {
  name: 'design-audit-spezifikation',
  description: 'Design-Audit Journalyst: Zielspezifikation und Umsetzungsschritte je Themengruppe',
  phases: [{ title: 'Spezifikation' }],
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


const SPEC = { type: 'object', properties: { datei: { type: 'string' }, ids_abgedeckt: { type: 'array', items: { type: 'string' } }, ids_zurueckgestellt: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, grund: { type: 'string' } }, required: ['id', 'grund'] } }, nutzer_fragen: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, frage: { type: 'string' }, empfehlung: { type: 'string' } }, required: ['id', 'frage'] } }, kurz: { type: 'string' }, konflikte: { type: 'array', items: { type: 'string' } } }, required: ['datei', 'ids_abgedeckt', 'kurz'] }
phase('Spezifikation')
const res = await parallel(args.groups.map(g => () => ag(`${BASE}
Rolle: Leitender Designer für die Themengruppe „${g.titel}“. Alle bestätigten Befunde dieser Gruppe stehen in ${AU}/spec-input/${g.key}.json (${g.count} Befunde, jeder mit id, bereich, schwere, befund, beleg, vorschlag, Prüfer-Anmerkungen fakten/vorgaben). Dazu: ${AU}/inventar-css.md, ${AU}/inventar-wording.md, ${AU}/census.json, Code unter ${WEB}.
Aufgabe: Schreibe ${AU}/spec/${g.key}.md (Deutsch, Markdown) mit genau diesen Abschnitten:
1. „Zielzustand“ – verbindliche Regeln für diese Gruppe, so präzise, dass ein Entwickler sie ohne Rückfrage umsetzt (konkrete Werte: px, Gewichte, Tokens, Texte; bei Wording: Glossar und Regeln mit Beispielen vorher → nachher). Die Regeln lösen ALLE Befunde der Datei auf und widersprechen BRIEF.md nicht.
2. „Konflikte und Entscheidungen“ – wo Befunde sich widersprechen oder doppeln, deine Entscheidung mit Grund.
3. „Umsetzungsschritte“ – nach Datei geordnet (web/css/app.css, web/js/…): je Schritt die betroffenen Selektoren/Funktionen/Zeilen, die Änderung (vorher → nachher) und die Befund-ids, die er erledigt. Reihenfolge so, dass zuerst Tokens/Skalen, dann Komponenten, dann Einzelstellen kommen.
4. „Akzeptanzkriterien“ – prüfbar (z. B. Zensus-Zahlen, Screenshot-Prüfpunkte, grep-Prüfungen).
5. „Zurückgestellt“ – Befunde, die du bewusst nicht umsetzen lässt (zu riskant, Geschmack, widerspricht Vorgaben), je mit Grund.
6. „Nutzer fragen“ – Befunde, deren Umsetzung eine frühere ausdrückliche Entscheidung des Nutzers ändern würde (steht in ${WEB}/README.md, in BRIEF.md oder in den Prüfer-Anmerkungen „berührt Vorgaben“/„Entscheidung des Nutzers“), oder die eine Funktion entfernen würden (z. B. einen Einstellungsbereich streichen): NICHT in die Umsetzungsschritte, sondern hier je mit einer kurzen Frage und deiner Empfehlung.
Prüfe Unklares im Code nach. Erfinde keine Befunde dazu. Gib am Ende das strukturierte Ergebnis zurück (datei = Pfad der geschriebenen Datei).`, { label: `spec:${g.key}`, phase: 'Spezifikation', schema: SPEC }).then(r => ({ key: g.key, r }))))
return { results: res.filter(Boolean) }
