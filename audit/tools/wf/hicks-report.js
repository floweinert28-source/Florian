export const meta = {
  name: 'hicks-bericht',
  description: 'Hick-Audit: Bericht HICKS.md und hicks.json aus den geprüften Vorschlägen',
  phases: [{ title: 'Bericht' }],
}
const ag = async (prompt, opts) => { opts = Object.assign({ effort: 'xhigh' }, opts || {}); const r = await agent(prompt, opts); if (r != null) return r; log(`Agent ${opts.label || ''} ohne Ergebnis – Wiederholung`); return agent(prompt, Object.assign({}, opts, { label: (opts.label || 'agent') + ' (2)' })) }
const SP = '/tmp/claude-0/-home-user-Florian/3d79e81c-3967-55f9-a53a-e07cf04bcd94/scratchpad'
const AU = SP + '/audit'
const WEB = '/home/user/Florian/web'
const BASE = `Du prüfst die Trading-Journal-Web-App Journalyst nach dem Prinzip „Jeder Screen will genau eine Sache vom Nutzer“ (Hick's Law). Lies ZUERST vollständig ${AU}/HICKS-BRIEF.md (Auftrag und 5 Regeln des Nutzers, Hierarchie-Stufen, Form der Vorschläge) und danach ${AU}/BRIEF.md (Material, Vorgaben des Nutzers, was abgelehnt ist).
Verbindlich: Das Design bleibt wie es ist (Farben, Schriften, Rundungen, Symbole) – nur Hierarchie, Reduktion, Reihenfolge, Verstecken. Keine Funktion entfernen; alles bleibt erreichbar (Menü, „Mehr Optionen“, zweiter Schritt). Arbeite auf Deutsch. Screenshots mit dem Read-Werkzeug ansehen. Code unter ${WEB}.`
const SUMMARY = { type: 'object', properties: { zusammenfassung: { type: 'string' }, top: { type: 'array', items: { type: 'string' } }, entscheidungen: { type: 'array', items: { type: 'string' } }, dateien: { type: 'array', items: { type: 'string' } } }, required: ['zusammenfassung', 'top', 'entscheidungen', 'dateien'] }
phase('Bericht')
const report = await ag(`${BASE}
Rolle: Leitender Designer, der den Bericht für den Nutzer schreibt. Lies vollständig ${AU}/hicks-payload.json: alle Screen-Bewertungen und Vorschläge nach der Prüfung (bestaetigt=false heißt verworfen, Grund in fakten/vorgaben; "hinweise" sind Notizen der Analysten je Gruppe; "korrekturen" sind Korrekturen der Prüfer an Hauptaktionen). Die Datei ist groß – lies sie in Abschnitten, bis du alles kennst.
Schreibe zwei Dateien:
1) ${AU}/hicks.json – die Daten so wie oben, aber mit den Korrekturen aus "korrekturen" eingearbeitet (Hauptaktion je Screen final), Vorschläge global nach Wirkung (1 zuerst), dann Aufwand (S zuerst) sortiert; verworfene Vorschläge in einem eigenen Feld "verworfen" mit Grund.
2) ${AU}/HICKS.md – der Bericht auf Deutsch, genau in der Form, die der Nutzer verlangt hat: a) Ein kurzer Vorspann (5 Sätze): Gesamtbild – wie gut hält Journalyst heute die 5 Regeln ein, wo am wenigsten. b) Abschnitt „Hierarchie-Stufen“: wie primär/sekundär/tertiär im bestehenden Design aussehen (keine neuen Styles). c) PRO SCREEN (jede Route, jeder Dialog, jeder Zustand voll/leer/Handy, in der Reihenfolge der Navigation): die fünf Antworten als Liste: Hauptaktion · optisch klar? (ja/nein + ein Satz) · konkurrierende Knöpfe · versteckbare Optionen · nicht relevant Gezeigtes. Kurz, konkret, ohne Füllwörter. d) „Vorschläge nach Wirkung“: eine durchnummerierte Liste ALLER bestätigten Vorschläge, sortiert nach Wirkung (groß zuerst), je: Screen/Zustand, Regel, was genau sich ändert (wer primär, wer sekundär, was wohin), Aufwand. Gleichartige Vorschläge über mehrere Screens als einen Punkt zusammenfassen (z. B. „alle Dialoge: nur ein gefüllter Knopf“) und die betroffenen Screens auflisten. e) „Entscheidungen für dich“: Punkte, bei denen es zwei sinnvolle Hauptaktionen gibt oder bei denen der Vorschlag eine frühere Entscheidung des Nutzers berührt – mit Empfehlung. f) „Verworfen“: kurze Liste, was geprüft und bewusst nicht vorgeschlagen wird, mit Grund.
Gib am Ende Zusammenfassung, die 10 wichtigsten Vorschläge (Kurzform) und die Entscheidungsfragen strukturiert zurück.`, { label: 'bericht', phase: 'Bericht', schema: SUMMARY, effort: 'xhigh' })
return report
