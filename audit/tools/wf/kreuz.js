export const meta = {
  name: 'design-audit-kreuzpruefung',
  description: 'Design-Audit Journalyst: Schritte mit Entscheidungen aus mehreren Paketen zu einer verbindlichen Anweisung zusammenführen',
  phases: [{ title: 'Kreuzprüfung' }],
}
const ag = async (prompt, opts) => { opts = Object.assign({ effort: 'xhigh' }, opts || {}); const r = await agent(prompt, opts); if (r != null) return r; log(`Agent ${(opts && opts.label) || ''} ohne Ergebnis – Wiederholung mit Opus`); return agent(prompt, Object.assign({}, opts || {}, { model: 'opus', label: ((opts && opts.label) || 'agent') + ' (opus)' })) }
const SP = '/tmp/claude-0/-home-user-Florian/3d79e81c-3967-55f9-a53a-e07cf04bcd94/scratchpad'
const AU = SP + '/audit'
phase('Kreuzprüfung')
const r = await ag(`Du bereitest die Umsetzung eines Design-Audits der Web-App Journalyst vor (Code unter /home/user/Florian/web). Arbeite auf Deutsch. Lies ${AU}/BRIEF.md.
Mehrere Anker-Pakete haben unabhängig voneinander über Überschneidungen zwischen zwölf Spezifikationen entschieden. Bei den Schritten in ${AU}/plan/kreuz.json kommen Anpassungen aus MEHREREN Paketen (je Eintrag: Paket, Anker, Aktion, Anweisung, Entscheidung). Die Schritte selbst stehen in ${AU}/plan/steps.json (Feld steps: nr, gruppe, von, bis) mit Text in ${AU}/spec/<gruppe>.md (Zeilen von–bis); alle Entscheidungen eines Pakets in ${AU}/plan/entscheid-<paket>.json.
Aufgabe: Für JEDEN Schritt in kreuz.json die Anweisungen zu EINER widerspruchsfreien, vollständigen Endanweisung zusammenführen. Widersprechen sich Pakete (z. B. eines „entfällt“, ein anderes „ändern“), entscheide nach BRIEF.md und Einheitlichkeit und begründe kurz. „entfaellt“ nur, wenn wirklich alles an dem Schritt anderswo umgesetzt wird; sonst „aendern“ mit der vollständigen Restanweisung. Ändere KEINE Dateien.`, { label: 'kreuzpruefung', phase: 'Kreuzprüfung', schema: { type: 'object', properties: {
  schritte: { type: 'array', items: { type: 'object', properties: {
    nr: { type: 'string' }, aktion: { type: 'string', enum: ['entfaellt', 'aendern', 'unveraendert'] }, ziel_nr: { type: 'string' }, anweisung: { type: 'string', description: 'vollständige, verbindliche Endanweisung (ersetzt alle Einzelanweisungen der Pakete)' }, grund: { type: 'string' },
  }, required: ['nr', 'aktion', 'anweisung'] } },
}, required: ['schritte'] } })
return r
