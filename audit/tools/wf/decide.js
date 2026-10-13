export const meta = {
  name: 'design-audit-entscheiden',
  description: 'Design-Audit Journalyst: Überschneidungen zwischen den Spezifikationen auflösen (je Anker-Paket)',
  phases: [{ title: 'Entscheiden' }],
}
const ag = async (prompt, opts) => { opts = Object.assign({ effort: 'xhigh' }, opts || {}); const r = await agent(prompt, opts); if (r != null) return r; log(`Agent ${(opts && opts.label) || ''} ohne Ergebnis – Wiederholung mit Opus`); return agent(prompt, Object.assign({}, opts || {}, { model: 'opus', label: ((opts && opts.label) || 'agent') + ' (opus)' })) }
const SP = '/tmp/claude-0/-home-user-Florian/3d79e81c-3967-55f9-a53a-e07cf04bcd94/scratchpad'
const AU = SP + '/audit'
const WEB = '/home/user/Florian/web'
const DEC = { type: 'object', properties: {
  entscheidungen: { type: 'array', items: { type: 'object', properties: {
    anker: { type: 'string' },
    nrs: { type: 'array', items: { type: 'string' } },
    art: { type: 'string', enum: ['konflikt', 'doppelt', 'reihenfolge'] },
    entscheidung: { type: 'string', description: 'verbindlich und konkret (Werte, Selektoren, Texte), mit kurzem Grund' },
    anpassungen: { type: 'array', items: { type: 'object', properties: {
      nr: { type: 'string' }, aktion: { type: 'string', enum: ['entfaellt', 'aendern', 'zusammen_mit'] }, ziel_nr: { type: 'string', description: 'bei zusammen_mit: der Schritt, der es übernimmt' }, anweisung: { type: 'string' },
    }, required: ['nr', 'aktion', 'anweisung'] } },
    reihenfolge: { type: 'array', items: { type: 'object', properties: { vor: { type: 'string' }, nach: { type: 'string' } }, required: ['vor', 'nach'] } },
    wartet_auf_frage: { type: 'string', description: 'falls die Entscheidung von einer offenen Nutzerfrage abhängt: welche (Gruppe + Kennung); sonst leer' },
  }, required: ['anker', 'nrs', 'art', 'entscheidung'] } },
  vertraeglich: { type: 'array', items: { type: 'string' }, description: 'Anker ohne Handlungsbedarf (Schritte ergänzen sich)' },
}, required: ['entscheidungen', 'vertraeglich'] }
const BASE = `Du bereitest die Umsetzung eines großen Design-Audits der Web-App Journalyst vor (Code unter ${WEB}). Arbeite auf Deutsch.
Lies ZUERST ${AU}/BRIEF.md (verbindliche Vorgaben des Nutzers; Abgelehntes nie vorschlagen) und ${AU}/plan/regeln.md (Zielzustand aller 12 Themengruppen kompakt). Die vollständigen Spezifikationen liegen unter ${AU}/spec/<gruppe>.md; jeder Schritt verweist mit von/bis auf seine Zeilen dort. Offene Nutzerfragen je Gruppe: ${AU}/spec/<gruppe>.result.json (Feld nutzer_fragen) – Schritte, die davon abhängen, werden NICHT umgesetzt, bis der Nutzer antwortet.`
phase('Entscheiden')
const out = await parallel(args.chunks.map(c => () => ag(`${BASE}
Rolle: Technischer Leiter. Zwölf Spezifikationen wurden unabhängig voneinander geschrieben; mehrere Schritte verschiedener Gruppen ändern dieselben Anker (Selektoren, Variablen, Funktionen, Texte). Deine Liste: ${AU}/plan/konflikt-${c}.json (je Anker die beteiligten Schritte mit Gruppe, Titel und Zeilen).
Für JEDEN Anker: Lies die Spezifikationsstellen der beteiligten Schritte (von/bis) und, wo nötig, den aktuellen Code. Entscheide:
- verträglich (Schritte ergänzen sich, Reihenfolge egal) → nur in "vertraeglich" eintragen;
- doppelt (dieselbe Änderung zweimal) → einer übernimmt, die anderen "zusammen_mit" bzw. "entfaellt";
- konflikt (unterschiedliche Werte/Ziele) → verbindliche Entscheidung mit konkretem Ergebnis; die unterlegenen Schritte bekommen "aendern" mit genauer Anweisung oder "entfaellt";
- reihenfolge (Schritt B baut auf A) → Paare vor/nach.
Maßstab: BRIEF.md (Grün nur Gewinn und „Trade loggen“; Auswahl flach; nichts Abgelehntes), Einheitlichkeit über die ganze App, bestehende Tests und README-Festlegungen nur ändern, wenn die Spezifikation es begründet. Wenn eine Gruppe den Punkt als Nutzerfrage führt und eine andere ihn entscheidet: Liegt die Antwort in BRIEF.md klar fest, entscheide danach; sonst "wartet_auf_frage" setzen.
Ändere KEINE Dateien.`, { label: `entscheiden:${c}`, phase: 'Entscheiden', schema: DEC }).then(r => ({ chunk: c, r }))))
const ok = out.filter(Boolean)
log(`Entscheidungen: ${ok.reduce((n, x) => n + ((x.r && x.r.entscheidungen) || []).length, 0)} aus ${ok.length} Paketen`)
return { results: ok }
