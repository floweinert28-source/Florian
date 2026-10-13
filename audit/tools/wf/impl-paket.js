export const meta = {
  name: 'design-audit-paket',
  description: 'Design-Audit Journalyst: ein Paket umsetzen (eigene Arbeitskopie) und streng prüfen',
  phases: [{ title: 'Umsetzen' }, { title: 'Prüfen' }],
}
const ag = async (prompt, opts) => { opts = Object.assign({ effort: 'xhigh' }, opts || {}); const r = await agent(prompt, opts); if (r != null) return r; log(`Agent ${(opts && opts.label) || ''} ohne Ergebnis – Wiederholung mit Opus`); return agent(prompt, Object.assign({}, opts || {}, { model: 'opus', label: ((opts && opts.label) || 'agent') + ' (opus)' })) }
const SP = '/tmp/claude-0/-home-user-Florian/3d79e81c-3967-55f9-a53a-e07cf04bcd94/scratchpad'
const AU = SP + '/audit'
const BR = 'claude/trading-journal-app-cqdxfe'
const N = String(args.nr).padStart(3, '0')
const WT = `/home/user/wt/p${N}`
const ATTR = `-m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_019rfBv8E2v6dfKE4dtJmiqd"`
const COMMON = `Du arbeitest am Design-Audit der Trading-Journal-Web-App Journalyst (Vanilla JS, Code unter web/). Arbeite und schreibe auf Deutsch; Code-Kommentare knapp und im Stil des Bestands.
Arbeitskopie: ${WT} (git-Worktree auf Zweig impl/p${N}). Ändere AUSSCHLIESSLICH Dateien in dieser Arbeitskopie, niemals in /home/user/Florian oder im Scratchpad (außer eigenen Hilfsskripten unter ${SP}/runs/p${N}-work/).
Pflichtlektüre: ${AU}/BRIEF.md (Vorgaben des Nutzers), ${AU}/plan/paket-${N}.md (die Schritte dieses Pakets mit wörtlichem Spezifikationstext und verbindlichen Hinweisen), die passenden Abschnitte aus ${AU}/plan/regeln.md (Zielzustand aller Gruppen), ${WT}/web/README.md (Abschnitte der betroffenen Bereiche und „Sprachen“).
Feste Regeln des Nutzers: Bestehende Features dürfen nicht kaputtgehen; keine Funktion entfernen (nur besser ordnen oder verstecken, alles bleibt erreichbar); gespeicherte Daten (localStorage-Formate) nie verlieren; Grün nur für Gewinn/positiv und „Trade loggen“; nie einführen: Glow/Lichtverlauf auf Gewähltem, fette aktive Einträge, grüne Auswahl, bunte Akzente, Rahmen um Notebook-Ordner, Schatten an Zahlenfeldern, Ladesymbol statt Skelett; API-Schlüssel nie im Frontend; Satoshi-Schriftdateien nie committen; Blind-Replay bleibt hinter dem Feature-Flag.
Texte: Der Code bleibt deutsch; js/i18n.js übersetzt beim Anzeigen. Jeder neue oder geänderte sichtbare Text (auch title, aria-label, Platzhalter, Toasts) braucht in ALLEN fünf Wörterbüchern ${WT}/web/js/lang/{en,es,zh,hi,pt}.js einen Eintrag mit natürlicher Übersetzung ({0} für Zahlen); Einträge alter Texte entfernen, wenn der alte Text nirgends mehr vorkommt.
Tests: Playwright-Suiten in ${WT}/web/e2e. Lauf: bash ${SP}/runtree.sh ${WT} <suite> <suite> … (Namen ohne .js; Ausgabe je Suite „x/y PASS“, Protokolle unter ${SP}/runs/p${N}/logs). Coach-Suiten (coachtest, coachlang, coachlang2) nur, wenn das Paket Coach berührt (feste Ports). Eigene Screenshots: Skript unter ${SP}/runs/p${N}-work/ mit „NODE_PATH=$(npm root -g) WEBROOT=${WT}/web node -r ${SP}/de-default.js skript.js“ (de-default lädt webroot.js: Aufrufe von file:///home/user/Florian/web/… liefern dann die Arbeitskopie aus; Schriften: await require('${SP}/localfonts.js')(page)); Screenshots als PNG mit dem Read-Werkzeug ansehen.`

phase('Umsetzen')
const impl = await ag(`${COMMON}
Rolle: Umsetzer von Paket ${N}.
0) Arbeitskopie anlegen, falls ${WT} fehlt: git -C /home/user/Florian worktree add ${WT} -b impl/p${N} ${BR}  (existiert sie schon, dort weitermachen; bereits erledigte Schritte erkennst du an git log/diff).
1) Setze JEDEN Schritt aus paket-${N}.md vollständig und genau um (Werte, Selektoren, Texte, Reihenfolge der Abhängigkeiten). Zeilennummern der Spezifikation können verschoben sein – orientiere dich an Selektoren und Funktionsnamen und prüfe den aktuellen Code. „Hinweise aus der Abstimmung“ haben Vorrang. Wenn ein Schritt bereits erfüllt ist, nichts doppelt einbauen. Wenn ein Schritt so nicht geht oder Bestehendes brechen würde: gleichwertige beste Lösung und im Ergebnis begründen; Schritte, die eine offene Nutzerfrage betreffen, auslassen und nennen.
2) Wörterbücher, README und Tests nachziehen (siehe oben). Suiten, deren Erwartung sich laut Spezifikation bewusst ändert, anpassen – nie Prüfungen abschwächen, um Fehler zu verbergen; für neues Verhalten Prüfungen ergänzen, wo sinnvoll.
3) Testen: die in der Paketdatei genannten Suiten plus headtest leaktest mobiletest langtest – alles grün. Dazu Screenshots der betroffenen Bildschirme (dunkel und hell, 1440 und 390 px) ansehen und Auffälligkeiten beheben.
4) Committen in der Arbeitskopie: git -C ${WT} add -A && git -C ${WT} commit -q -m "<kurzer deutscher Titel: was sich für den Nutzer ändert>" -m "<2–5 Sätze: was, warum (Befund-ids), betroffene Bereiche>" ${ATTR}
Gib zurück: erledigte Schritt-nrs, Abweichungen mit Grund, nicht erledigte mit Grund, Testergebnisse, Commit-Hash.`, { label: `umsetzen:p${N}`, phase: 'Umsetzen', schema: { type: 'object', properties: {
  erledigt: { type: 'array', items: { type: 'string' } },
  abweichungen: { type: 'array', items: { type: 'object', properties: { nr: { type: 'string' }, was: { type: 'string' }, grund: { type: 'string' } }, required: ['nr', 'was', 'grund'] } },
  nicht_erledigt: { type: 'array', items: { type: 'object', properties: { nr: { type: 'string' }, grund: { type: 'string' } }, required: ['nr', 'grund'] } },
  tests: { type: 'array', items: { type: 'string' } }, commit: { type: 'string' }, hinweise: { type: 'string' },
}, required: ['erledigt', 'abweichungen', 'nicht_erledigt', 'tests', 'commit'] } })

phase('Prüfen')
const review = await ag(`${COMMON}
Rolle: strenger, unabhängiger Prüfer von Paket ${N}. Der Umsetzer hat in ${WT} gearbeitet; seine Änderungen: git -C ${WT} log --oneline ${BR}..HEAD und git -C ${WT} diff ${BR}...HEAD. Sein Bericht: ${JSON.stringify(impl || { fehlt: true })}
Prüfe JEDEN Schritt aus paket-${N}.md gegen Diff und gerenderte App: vollständig umgesetzt? genau die verlangten Werte/Texte? Nebenwirkungen auf andere Seiten, helles/dunkles Design, Handy (390) und Tablet (1024)? Neue/geänderte Texte in allen fünf Wörterbüchern? README nachgezogen? Tests sinnvoll angepasst (keine abgeschwächten oder gelöschten Prüfungen ohne Grund)? Verstößt etwas gegen BRIEF.md oder die festen Regeln? Begründete Abweichungen des Umsetzers kritisch bewerten.
Erstelle eigene Screenshots der betroffenen Bildschirme (dunkel/hell, 1440/390) und sieh sie an.
Behebe jeden gefundenen Mangel selbst in ${WT}, lass die Paket-Suiten plus headtest leaktest mobiletest langtest erneut laufen (alles grün) und committe als: git -C ${WT} add -A && git -C ${WT} commit -q -m "Paket ${N}: Nachbesserung nach Prüfung" -m "<was behoben wurde>" ${ATTR}
Gib zurück: Mängel (behoben ja/nein), Testergebnisse, ob der Zweig bereit zum Zusammenführen ist.`, { label: `pruefen:p${N}`, phase: 'Prüfen', schema: { type: 'object', properties: {
  maengel: { type: 'array', items: { type: 'object', properties: { nr: { type: 'string' }, beschreibung: { type: 'string' }, behoben: { type: 'boolean' } }, required: ['beschreibung', 'behoben'] } },
  tests: { type: 'array', items: { type: 'string' } }, bereit: { type: 'boolean' }, hinweise: { type: 'string' },
}, required: ['maengel', 'tests', 'bereit'] } })
return { paket: N, umsetzung: impl, pruefung: review }
