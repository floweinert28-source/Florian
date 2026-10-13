export const meta = {
  name: 'design-audit-luecken',
  description: 'Design-Audit Journalyst: Vollständigkeits-Kritiker, Nachfinder und Nachprüfung',
  phases: [{ title: 'Lücken' }],
}
const ag = async (prompt, opts) => { opts = Object.assign({ effort: 'xhigh' }, opts || {}); const r = await agent(prompt, opts); if (r != null) return r; log(`Agent ${(opts && opts.label) || ''} ohne Ergebnis – Wiederholung mit Opus`); return agent(prompt, Object.assign({}, opts || {}, { model: 'opus', label: ((opts && opts.label) || 'agent') + ' (opus)' })) }
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


const INV = `Inventare (lesen): ${AU}/inventar-css.md und ${AU}/inventar-wording.md. Regelscanner: ${AU}/impeccable-detect.txt.`
const fmtItems = items => JSON.stringify(items.map(f => ({ id: f.id, bereich: f.bereich, kategorie: f.kategorie, schwere: f.schwere, titel: f.titel, befund: f.befund, beleg: f.beleg, vorschlag: f.vorschlag })), null, 1)
phase('Lücken')
const gaps = await ag(`${BASE}
Rolle: Vollständigkeits-Kritiker. Das Audit hat ${args.kept_n} bestätigte Befunde. Kurzliste (id [bereich/kategorie/Schwere] Titel): ${AU}/kept-index.txt. Abdeckung der Finder (was jeder angesehen hat, Hinweise): ${AU}/coverage.json.
Frage: Was fehlt? Welche Seite, welcher Dialog, welche Kategorie, welches Design (hell!), welche Breite wurde nicht oder zu dünn geprüft? Welche offensichtlichen Themen tauchen nicht auf (z. B. Startseite index.html, Zertifikat-Dialog, CSV-Import, Englisch und andere Sprachen, Druck, Tastatur, Favicon/Titel, Fehlermeldungen bei fehlendem Server, Tooltips, Toasts, Bestätigungsdialoge)? Sieh dir die vorhandenen Aufnahmen an (${AU}/shots/*/) und stichprobenartig 6–10 Aufnahmen, die in keinem Befund vorkommen. Formuliere bis zu 6 Nachfinder-Aufträge (je ein klarer Blickwinkel mit Aufnahmen und Dateien). Keine Aufträge für Themen, die schon gut abgedeckt sind.`, { label: 'kritiker', phase: 'Lücken', schema: GAPS })
const jobs = (gaps && gaps.luecken || []).slice(0, 6)
log(`Lücken: ${jobs.length} Nachfinder: ${jobs.map(j => j.thema).join(' | ')}`)
const out = await pipeline(jobs,
  (g, _, i) => ag(`${BASE}
${INV}
Nachfinder-Auftrag „${g.thema}“: ${g.auftrag}
Bereits bestätigte Befunde stehen in ${AU}/kept-index.txt – nicht wiederholen. Gib nur neue, belegte Befunde zurück.`, { label: `nachfinden:${i + 1}`, phase: 'Lücken', schema: FINDINGS }).then(r => (r && r.findings || []).map((f, j) => Object.assign({ id: `gap${i + 1}-${j + 1}`, quelle: 'nachfinder:' + g.thema }, f))),
  (items, g, i) => !items.length ? [] : parallel([
    () => ag(`${BASE}
Rolle: skeptischer Faktenprüfer. Stapel Nachbefunde „${g.thema}“:
${fmtItems(items)}
Prüfe JEDEN Befund selbst nach (Beleg öffnen: Screenshot, Code-Zeile). Bestätige nur Reproduzierbares, markiere Duplikate (auch gegenüber ${AU}/kept-index.txt: dann duplikat_von = die dortige id), passe die Schwere an.`, { label: `nachfakten:${i + 1}`, phase: 'Lücken', schema: VERDICTS }),
    () => ag(`${BASE}
Rolle: Prüfer für Vorgaben, Risiko und Umsetzbarkeit. Stapel Nachbefunde „${g.thema}“:
${fmtItems(items)}
Prüfe JEDEN Vorschlag gegen BRIEF.md und ${WEB}/README.md, auf Konkretheit (ggf. vorschlag_neu), auf Risiko für Features/Tests und ob es eine echte Verbesserung ist.`, { label: `nachvorgaben:${i + 1}`, phase: 'Lücken', schema: VERDICTS }),
  ]).then(([fak, vor]) => { const F = new Map((fak && fak.urteile || []).map(u => [u.id, u])), V = new Map((vor && vor.urteile || []).map(u => [u.id, u]))
    return items.map(f => { const a = F.get(f.id), c = V.get(f.id); return Object.assign({}, f, { bestaetigt: !!(a && a.bestaetigt && !a.duplikat_von && c && c.bestaetigt), fakten: a ? a.anmerkung || '' : '', vorgaben: c ? c.anmerkung || '' : '', schwere: (a && a.schwere) || f.schwere, vorschlag: (c && c.vorschlag_neu) || f.vorschlag }) }) }))
const all = out.filter(Boolean).flat()
return { jobs: jobs.map(j => j.thema), kept: all.filter(f => f.bestaetigt), dropped_n: all.filter(f => !f.bestaetigt).length }
