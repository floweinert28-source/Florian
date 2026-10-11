export const meta = {
  name: 'design-audit-pruefen',
  description: 'Design-Audit Journalyst: Prüf-Teil (Faktencheck und Vorgabencheck je Befund-Stapel)',
  phases: [{ title: 'Prüfen' }],
}
/* Ausweich-Modell: Liefert ein Agent kein Ergebnis (Limit, Abbruch), läuft derselbe Auftrag noch einmal auf Opus */
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

const FINDINGS = { type: 'object', properties: {
  findings: { type: 'array', items: { type: 'object', properties: {
    bereich: { type: 'string', description: 'Route oder Dialog, z. B. dashboard, stats/days, modal_trade_loggen, seitenleiste, global' },
    kategorie: { type: 'string', description: 'typografie | abstaende | layout | hierarchie | komponenten | farbe | kontrast | wording | zustaende | responsiv | bewegung | barrierefreiheit | diagramme | aufbau | ki-look | sonstiges' },
    schwere: { type: 'integer', minimum: 1, maximum: 3 },
    titel: { type: 'string', description: 'eine Zeile, konkret' },
    befund: { type: 'string', description: 'was genau falsch ist, mit Werten' },
    beleg: { type: 'string', description: 'Screenshot-Name(n) und/oder datei:zeile und/oder Zensus-Wert' },
    vorschlag: { type: 'string', description: 'konkret: vorher → nachher, betroffene Dateien/Selektoren' },
    aufwand: { type: 'string', description: 'S | M | L' },
    beruehrt_vorgaben: { type: 'boolean', description: 'true, wenn der Vorschlag eine Vorgabe aus BRIEF.md berührt (dann begründen)' },
  }, required: ['bereich', 'kategorie', 'schwere', 'titel', 'befund', 'beleg', 'vorschlag'] } },
  geprueft: { type: 'array', items: { type: 'string' }, description: 'welche Aufnahmen/Dateien du tatsächlich angesehen hast' },
  hinweise: { type: 'string', description: 'was gut ist, was du nicht prüfen konntest' },
}, required: ['findings', 'geprueft'] }

const VERDICTS = { type: 'object', properties: {
  urteile: { type: 'array', items: { type: 'object', properties: {
    id: { type: 'string' }, bestaetigt: { type: 'boolean' }, duplikat_von: { type: 'string', description: 'id eines anderen Befunds im Stapel, wenn inhaltlich gleich; sonst leer' },
    schwere: { type: 'integer', minimum: 1, maximum: 3 }, anmerkung: { type: 'string' }, vorschlag_neu: { type: 'string', description: 'nur wenn der Vorschlag geändert werden muss' },
  }, required: ['id', 'bestaetigt'] } },
}, required: ['urteile'] }

const GAPS = { type: 'object', properties: { luecken: { type: 'array', items: { type: 'object', properties: { thema: { type: 'string' }, auftrag: { type: 'string', description: 'vollständiger Arbeitsauftrag für einen Nachfinder: Blickwinkel, Material, Aufnahmen' } }, required: ['thema', 'auftrag'] } }, einschaetzung: { type: 'string' } }, required: ['luecken'] }

const SUMMARY = { type: 'object', properties: { zusammenfassung: { type: 'string' }, cluster: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' }, anzahl: { type: 'integer' }, dateien: { type: 'string' } }, required: ['name', 'anzahl'] } }, dateien_geschrieben: { type: 'array', items: { type: 'string' } } }, required: ['zusammenfassung', 'cluster', 'dateien_geschrieben'] }

const raw = args.raw
const coverage = args.coverage || {}
/* ---------- Phase 3: Prüfen ---------- */
const norm = s => (s || '').toLowerCase().replace(/[^a-zäöüß0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()
const seenKeys = new Set(); const uniq = []; let exactDupes = 0
for (const f of raw) { const k = norm(f.bereich) + '|' + norm(f.titel); if (seenKeys.has(k)) { exactDupes++; continue } seenKeys.add(k); uniq.push(f) }
log(`Prüfen: ${uniq.length} Befunde nach wörtlicher Dedupe (${exactDupes} entfernt)`)
const byArea = {}; uniq.forEach(f => { const a = norm(f.bereich).split(/[\/ ]/)[0] || 'global'; (byArea[a] = byArea[a] || []).push(f) })
const batches = []; Object.entries(byArea).forEach(([a, list]) => { for (let i = 0; i < list.length; i += 10) batches.push({ area: a, items: list.slice(i, i + 10) }) })
log(`Prüfen: ${batches.length} Stapel`)
const fmtBatch = b => JSON.stringify(b.items.map(f => ({ id: f.id, bereich: f.bereich, kategorie: f.kategorie, schwere: f.schwere, titel: f.titel, befund: f.befund, beleg: f.beleg, vorschlag: f.vorschlag, beruehrt_vorgaben: !!f.beruehrt_vorgaben })), null, 1)
phase('Prüfen')
const verified = await pipeline(batches,
  (b, _, i) => parallel([
    () => ag(`${BASE}
Rolle: skeptischer Faktenprüfer. Hier ist ein Stapel Befunde zum Bereich „${b.area}“:
${fmtBatch(b)}
Prüfe JEDEN Befund selbst nach: öffne den genannten Beleg (Screenshot unter ${AU}/shots/<kontext>/<name>.png, Code-Zeile, Zensus). Bestätige nur, was du reproduzieren kannst; im Zweifel bestaetigt=false mit Grund. Markiere Duplikate innerhalb des Stapels (duplikat_von = id des besseren Befunds). Passe die Schwere an, wenn sie übertrieben oder untertrieben ist. Gib für jede id ein Urteil.`, { label: `fakten:${b.area}#${i + 1}`, phase: 'Prüfen', schema: VERDICTS }),
    () => ag(`${BASE}
Rolle: Prüfer für Vorgaben, Risiko und Umsetzbarkeit. Hier ist ein Stapel Befunde zum Bereich „${b.area}“:
${fmtBatch(b)}
Prüfe JEDEN Vorschlag: 1) Widerspricht er den Vorgaben des Nutzers in BRIEF.md (abgelehnte Dinge, Grün-Regel, flache Zustände, Gewichte, Schriften, Blind-Replay versteckt, Features bleiben)? Dann bestaetigt=false mit Grund. 2) Ist er konkret genug (vorher → nachher, Stelle)? Wenn nicht, formuliere ihn in vorschlag_neu konkret, sonst bestaetigt=false. 3) Würde er ein Feature oder bestehende Tests brechen oder an anderer Stelle Schaden anrichten? Dann anmerkung mit dem Risiko und ggf. bestaetigt=false. 4) Ist es wirklich eine Verbesserung Richtung „clean, simpel, premium“ oder nur Geschmack? Nur echte Verbesserungen bestätigen. Gib für jede id ein Urteil.`, { label: `vorgaben:${b.area}#${i + 1}`, phase: 'Prüfen', schema: VERDICTS }),
  ]).then(([fak, vor]) => {
    const F = new Map((fak && fak.urteile || []).map(u => [u.id, u])), V = new Map((vor && vor.urteile || []).map(u => [u.id, u]))
    return b.items.map(f => { const a = F.get(f.id), c = V.get(f.id); const keep = !!(a && a.bestaetigt && !(a.duplikat_von) && c && c.bestaetigt)
      return Object.assign({}, f, { bestaetigt: keep, fakten: a ? a.anmerkung || '' : 'kein Urteil', vorgaben: c ? c.anmerkung || '' : 'kein Urteil', duplikat_von: a && a.duplikat_von || '', schwere: (a && a.schwere) || (c && c.schwere) || f.schwere, vorschlag: (c && c.vorschlag_neu) || f.vorschlag }) })
  }))
const judged = verified.filter(Boolean).flat(); const kept = judged.filter(f => f.bestaetigt); const dropped = judged.filter(f => !f.bestaetigt)
log(`Prüfen: ${kept.length} bestätigt, ${dropped.length} verworfen oder Duplikat`)


return { judged, kept, dropped_n: dropped.length }
