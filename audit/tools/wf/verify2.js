export const meta = {
  name: 'design-audit-pruefen-stapel',
  description: 'Design-Audit Journalyst: Befund-Stapel aus Dateien von je zwei unabhängigen Prüfern kontrollieren lassen (Fakten, Vorgaben/Risiko)',
  phases: [{ title: 'Prüfen' }],
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

const VERDICTS = { type: 'object', properties: {
  urteile: { type: 'array', items: { type: 'object', properties: {
    id: { type: 'string' }, bestaetigt: { type: 'boolean' }, duplikat_von: { type: 'string', description: 'id eines anderen Befunds im Stapel, wenn inhaltlich gleich; sonst leer' },
    schwere: { type: 'integer', minimum: 1, maximum: 3 }, anmerkung: { type: 'string' }, vorschlag_neu: { type: 'string', description: 'nur wenn der Vorschlag geändert werden muss' },
  }, required: ['id', 'bestaetigt'] } },
}, required: ['urteile'] }


const batches = args.batches.map(b => Object.assign({}, b, { file: b.file.startsWith('B/') ? AU + '/batches/' + b.file.slice(2) : b.file }))
phase('Prüfen')
log(`Prüfe ${batches.length} Stapel: ${batches.map(b => b.n).join(', ')}`)
const res = await parallel(batches.map(b => () => parallel([
  () => ag(`${BASE}
Rolle: skeptischer Faktenprüfer. Lies den Befund-Stapel zum Bereich „${b.area}“ aus der Datei ${b.file} (JSON-Array mit ${b.count} Befunden; jeder hat eine id).
Prüfe JEDEN Befund selbst nach: öffne den genannten Beleg (Screenshot unter ${AU}/shots/<kontext>/<name>.png – Kontexte: dark-1440, dark-1024, dark-390, light-1440, light-390, extra-dark-1440, extra-dark-390, extra-light-1440, extra; Code-Zeile unter ${WEB}; Zensus ${AU}/census.json). Bestätige nur, was du reproduzieren kannst; im Zweifel bestaetigt=false mit Grund. Markiere Duplikate innerhalb des Stapels (duplikat_von = id des besseren Befunds). Passe die Schwere an, wenn sie übertrieben oder untertrieben ist. Gib für JEDE id ein Urteil.`, { label: `fakten:${b.n}`, phase: 'Prüfen', schema: VERDICTS }),
  () => ag(`${BASE}
Rolle: Prüfer für Vorgaben, Risiko und Umsetzbarkeit. Lies den Befund-Stapel zum Bereich „${b.area}“ aus der Datei ${b.file} (JSON-Array mit ${b.count} Befunden; jeder hat eine id).
Prüfe JEDEN Vorschlag: 1) Widerspricht er den Vorgaben des Nutzers in BRIEF.md (abgelehnte Dinge, Grün nur für Gewinn und „Trade loggen“, flache gewählte Zustände, Gewichte, Schriften, Blind-Replay versteckt, Features bleiben, Zeitraum/Konto/Filter stehen bewusst oben rechts in der Titelzeile) oder Entscheidungen in ${WEB}/README.md? Dann bestaetigt=false mit Grund. 2) Ist er konkret genug (vorher → nachher, Stelle)? Wenn nicht, formuliere ihn in vorschlag_neu konkret, sonst bestaetigt=false. 3) Würde er ein Feature oder bestehende Tests brechen oder an anderer Stelle Schaden anrichten? Dann anmerkung mit dem Risiko und ggf. bestaetigt=false. 4) Ist es wirklich eine Verbesserung Richtung „clean, simpel, premium“ oder nur Geschmack? Nur echte Verbesserungen bestätigen. Gib für JEDE id ein Urteil.`, { label: `vorgaben:${b.n}`, phase: 'Prüfen', schema: VERDICTS }),
]).then(([fak, vor]) => ({ n: b.n, fakten: fak, vorgaben: vor }))))
return { results: res.filter(Boolean) }
