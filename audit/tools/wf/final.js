export const meta = {
  name: 'design-audit-synthese',
  description: 'Design-Audit Journalyst: Lückenrunde und Synthese (REPORT.md, PLAN.md, findings-verified.json)',
  phases: [{ title: 'Lücken' }, { title: 'Synthese' }],
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

const kept = args.kept
const coverage = args.coverage || {}
const raw = new Array(args.raw_n || 0)
const judged = new Array(args.judged_n || 0)
const dropped = new Array(args.dropped_n || 0)
/* ---------- Phase 4: Lücken ---------- */
phase('Lücken')
const covText = Object.entries(coverage).map(([k, v]) => `- ${k}: geprüft ${Array.isArray(v.geprueft) ? v.geprueft.length : 0} Dinge; Hinweise: ${(v.hinweise || '').slice(0, 300)}`).join('\n')
const keptShort = kept.map(f => `${f.id} [${f.bereich}/${f.kategorie}/S${f.schwere}] ${f.titel}`).join('\n')
const gaps = await ag(`${BASE}
Rolle: Vollständigkeits-Kritiker. Das Audit hat bisher ${kept.length} bestätigte Befunde. Abdeckung der Finder:
${covText}
Bestätigte Befunde (Kurzform):
${keptShort}
Frage: Was fehlt? Welche Seite, welcher Dialog, welche Kategorie, welches Design (hell!), welche Breite wurde nicht oder zu dünn geprüft? Welche offensichtlichen Themen tauchen nicht auf (z. B. Startseite index.html, Zertifikat-Dialog, CSV-Import, Sprachen-Umschaltung/Englisch, Druck, Tastatur, Favicon/Titel, Fehlermeldungen Server)? Sieh dir die Liste der vorhandenen Aufnahmen an (${AU}/shots/*/) und stichprobenartig 5–8 Aufnahmen, die in keinem Befund vorkommen. Formuliere bis zu 6 Nachfinder-Aufträge (je ein klarer Blickwinkel mit Aufnahmen und Dateien). Keine Aufträge für Themen, die bereits gut abgedeckt sind.`, { label: 'kritiker', phase: 'Lücken', schema: GAPS, effort: 'xhigh' })
const gapJobs = (gaps && gaps.luecken || []).slice(0, 6)
log(`Lücken: ${gapJobs.length} Nachfinder`)
const gapFound = await pipeline(gapJobs,
  (g, _, i) => ag(`${BASE}
${INV}
Nachfinder-Auftrag „${g.thema}“: ${g.auftrag}
Bereits bestätigte Befunde (nicht wiederholen): ${keptShort.slice(0, 12000)}
Gib nur neue, belegte Befunde zurück.`, { label: `nachfinden:${i + 1}`, phase: 'Lücken', schema: FINDINGS }).then(r => (r && r.findings || []).map((f, j) => Object.assign({ id: `gap${i + 1}-${j + 1}`, quelle: 'nachfinder:' + g.thema }, f))),
  (items, g, i) => items.length ? parallel([
    () => ag(`${BASE}
Rolle: skeptischer Faktenprüfer. Stapel Nachbefunde „${g.thema}“:
${fmtBatch({ items })}
Prüfe JEDEN Befund selbst nach (Beleg öffnen). Bestätige nur Reproduzierbares, markiere Duplikate, passe Schwere an.`, { label: `nachfakten:${i + 1}`, phase: 'Lücken', schema: VERDICTS }),
    () => ag(`${BASE}
Rolle: Prüfer für Vorgaben, Risiko und Umsetzbarkeit. Stapel Nachbefunde „${g.thema}“:
${fmtBatch({ items })}
Prüfe JEDEN Vorschlag gegen BRIEF.md, auf Konkretheit (ggf. vorschlag_neu), auf Risiko für Features/Tests und ob es eine echte Verbesserung ist.`, { label: `nachvorgaben:${i + 1}`, phase: 'Lücken', schema: VERDICTS }),
  ]).then(([fak, vor]) => { const F = new Map((fak && fak.urteile || []).map(u => [u.id, u])), V = new Map((vor && vor.urteile || []).map(u => [u.id, u]))
    return items.map(f => { const a = F.get(f.id), c = V.get(f.id); const keep = !!(a && a.bestaetigt && !(a.duplikat_von) && c && c.bestaetigt); return Object.assign({}, f, { bestaetigt: keep, fakten: a ? a.anmerkung || '' : '', vorgaben: c ? c.anmerkung || '' : '', schwere: (a && a.schwere) || f.schwere, vorschlag: (c && c.vorschlag_neu) || f.vorschlag }) }) }) : [])
const gapKept = gapFound.filter(Boolean).flat().filter(f => f.bestaetigt)
log(`Lücken: ${gapKept.length} zusätzliche bestätigte Befunde`)
const all = kept.concat(gapKept)

/* ---------- Phase 5: Synthese ---------- */
phase('Synthese')
const allJson = JSON.stringify(all.map(f => ({ id: f.id, bereich: f.bereich, kategorie: f.kategorie, schwere: f.schwere, titel: f.titel, befund: f.befund, beleg: f.beleg, vorschlag: f.vorschlag, aufwand: f.aufwand || '', beruehrt_vorgaben: !!f.beruehrt_vorgaben, fakten: f.fakten, vorgaben: f.vorgaben })), null, 1)
const synth = await ag(`${BASE}
Rolle: Leitender Designer, der das Audit zusammenführt. Hier sind ALLE ${all.length} bestätigten Befunde (JSON):
${allJson}
Dazu die Inventare ${AU}/inventar-css.md und ${AU}/inventar-wording.md.
Schreibe drei Dateien:
1) ${AU}/findings-verified.json – genau diese Befunde als JSON-Array (unverändert, nur sortiert nach schwere, dann bereich).
2) ${AU}/REPORT.md – der Audit-Bericht auf Deutsch für den Nutzer: a) Zusammenfassung in 10 Sätzen (Gesamturteil, die 10 wichtigsten Punkte); b) Design-Spezifikation „Zielzustand“, die ALLE Befunde auflöst und als verbindliche Regeln formuliert ist: Typo-Skala (jede Stufe: px, Gewicht, Zeilenhöhe, Rolle), Abstandsskala und Zuordnung, Radien/Rahmen/Schatten, Farbregeln (dunkel und hell, Token-Werte, Kontrastziele), Komponentenstandards (Knopf, Feld, Karte, Kachel, Tabelle, Popover, Dialog, Reiter, Segment, Chip, Schalter – je ein Standard mit Maßen), Diagrammregeln, Bewegungsregeln, Wording-Regelwerk und Glossar, Aufbau/IA-Entscheidungen (was umgestellt wird und warum), Zustände; c) alle Befunde nach Bereich gruppiert als Tabellen (id, Schwere, Titel, Vorschlag kurz).
3) ${AU}/PLAN.md – Umsetzungsplan in Clustern, so geordnet, dass jeder Cluster für sich umgesetzt und geprüft werden kann und spätere Cluster auf früheren aufbauen (zuerst Tokens/Skalen in app.css, dann Komponenten, dann Seiten, dann Wording, dann Aufbau). Je Cluster: Name, Ziel, enthaltene Befund-ids, betroffene Dateien, konkrete Arbeitsschritte, Akzeptanzkriterien (prüfbar, z. B. „census: nur noch 8 Schriftgrößen“, „Screenshot X: …“), Risiken, Reihenfolge. Konflikte zwischen Befunden löst du auf und notierst die Entscheidung.
Gib am Ende die Zusammenfassung und die Clusterliste strukturiert zurück.`, { label: 'synthese', phase: 'Synthese', schema: SUMMARY, effort: 'xhigh' })
return { roh: raw.length, geprueft: judged.length, bestaetigt: all.length, verworfen: dropped.length, luecken: gapJobs.map(g => g.thema), synthese: synth, abdeckung: coverage }