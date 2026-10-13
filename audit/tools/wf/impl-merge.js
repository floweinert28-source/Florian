export const meta = {
  name: 'design-audit-zusammenfuehren',
  description: 'Design-Audit Journalyst: geprüfte Paket-Zweige zusammenführen, voller Testlauf, Push',
  phases: [{ title: 'Zusammenführen' }],
}
const ag = async (prompt, opts) => { opts = Object.assign({ effort: 'xhigh' }, opts || {}); const r = await agent(prompt, opts); if (r != null) return r; log(`Agent ${(opts && opts.label) || ''} ohne Ergebnis – Wiederholung mit Opus`); return agent(prompt, Object.assign({}, opts || {}, { model: 'opus', label: ((opts && opts.label) || 'agent') + ' (opus)' })) }
const SP = '/tmp/claude-0/-home-user-Florian/3d79e81c-3967-55f9-a53a-e07cf04bcd94/scratchpad'
const AU = SP + '/audit'
const BR = 'claude/trading-journal-app-cqdxfe'
const PK = args.pakete.map(n => String(n).padStart(3, '0'))
const ATTR = `-m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_019rfBv8E2v6dfKE4dtJmiqd"`
phase('Zusammenführen')
const r = await ag(`Du arbeitest am Design-Audit der Trading-Journal-Web-App Journalyst. Arbeite auf Deutsch.
Rolle: Zusammenführer. Führe die geprüften Zweige ${PK.map(n => 'impl/p' + n).join(', ')} in /home/user/Florian (Zweig ${BR}) zusammen. Die Paketinhalte stehen in ${AU}/plan/paket-<nr>.md; Vorgaben des Nutzers in ${AU}/BRIEF.md.
Wichtig: Eine Hintergrund-Schleife committet alle 5 Minuten nur den Ordner audit/ (git commit --only audit). Wenn git „index.lock“ meldet, kurz warten und wiederholen. Prüfe vorher git -C /home/user/Florian status: außer audit/ darf nichts offen sein.
1) Je Zweig in dieser Reihenfolge: git -C /home/user/Florian merge --no-ff impl/p<nr> -m "Paket <nr> zusammengeführt: <Kurzinhalt>" ${ATTR}. Bei Konflikten beide Absichten erhalten (Paketdateien lesen), sauber auflösen – nie eine Seite verwerfen, wenn dadurch eine Änderung verloren geht. Typisch: Einträge am Ende der Wörterbücher web/js/lang/*.js und Absätze der README – beide behalten, Doppelte entfernen; CSS-Regeln an derselben Stelle zusammenführen.
2) Voller Testlauf: bash ${SP}/runfull.sh /home/user/Florian (alle Suiten in drei parallelen Teilen, letzte Zeile SUMME). Zusätzlich: node --test /home/user/Florian/web/tests/*.mjs. Alles muss grün sein. Bei Fehlern: Ursache finden (welches Paket, welche Wechselwirkung), in /home/user/Florian beheben, mit betroffenen Suiten prüfen (bash ${SP}/runtree.sh /home/user/Florian <suite> …), committen (git -C /home/user/Florian commit -m "<Titel>" -m "<Ursache und Behebung>" ${ATTR}), am Ende runfull.sh erneut, bis alles grün ist. Einen Fehler, der schon vor dem Zusammenführen bestand, nennst du gesondert.
3) Push: git -C /home/user/Florian push -u origin ${BR} (bei Netzfehlern bis zu 4 Wiederholungen mit 2, 4, 8, 16 s Pause).
4) Aufräumen: git -C /home/user/Florian worktree remove --force /home/user/wt/p<nr> und git -C /home/user/Florian branch -D impl/p<nr> für jeden zusammengeführten Zweig.
Gib zurück: zusammengeführte Pakete, Konflikte und wie gelöst, SUMME-Zeile des letzten Volltests, behobene Fehler, offene Punkte, HEAD-Hash.`, { label: `zusammenfuehren:${PK.join('+')}`, phase: 'Zusammenführen', schema: { type: 'object', properties: {
  zusammengefuehrt: { type: 'array', items: { type: 'string' } }, konflikte: { type: 'array', items: { type: 'string' } }, summe: { type: 'string' },
  behoben: { type: 'array', items: { type: 'string' } }, offen: { type: 'array', items: { type: 'string' } }, head: { type: 'string' },
}, required: ['zusammengefuehrt', 'summe', 'head'] } })
return r
