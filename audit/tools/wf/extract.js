export const meta = {
  name: 'design-audit-extrahieren',
  description: 'Design-Audit Journalyst: Umsetzungsschritte je Spezifikation strukturiert herausziehen (Cluster, Dateien, Anker, Zeilen)',
  phases: [{ title: 'Extrahieren' }],
}
const ag = async (prompt, opts) => { opts = Object.assign({ effort: 'xhigh' }, opts || {}); const r = await agent(prompt, opts); if (r != null) return r; log(`Agent ${(opts && opts.label) || ''} ohne Ergebnis – Wiederholung mit Opus`); return agent(prompt, Object.assign({}, opts || {}, { model: 'opus', label: ((opts && opts.label) || 'agent') + ' (opus)' })) }
const SP = '/tmp/claude-0/-home-user-Florian/3d79e81c-3967-55f9-a53a-e07cf04bcd94/scratchpad'
const AU = SP + '/audit'
const WEB = '/home/user/Florian/web'
const CL = ['tokens', 'komponenten', 'shell', 'aufbau', 'dashboard', 'statistik', 'trades_tag', 'notebook_news', 'training', 'prop', 'konto', 'einstellungen', 'responsiv', 'diagramme', 'zustaende', 'barrierefreiheit', 'wording', 'bewegung']
const OUT = { type: 'object', properties: {
  regeln: { type: 'string', description: 'Zielzustand der Gruppe kompakt (alle verbindlichen Werte: Tokens, px, Gewichte, Farben, Regeln, Glossar), höchstens ca. 6000 Zeichen' },
  schritte: { type: 'array', items: { type: 'object', properties: {
    nr: { type: 'string', description: 'eindeutig: <gruppe>-<Kennung aus der Spezifikation, z. B. B12>' },
    titel: { type: 'string' },
    von: { type: 'integer', description: 'erste Zeile des Schritts in der Spezifikationsdatei' },
    bis: { type: 'integer', description: 'letzte Zeile des Schritts' },
    cluster: { type: 'string', enum: CL },
    dateien: { type: 'array', items: { type: 'string' }, description: 'z. B. web/css/app.css, web/js/screens/dashboard.js' },
    anker: { type: 'array', items: { type: 'string' }, description: 'genaue Selektoren, CSS-Variablen, Funktionen, Sprachschlüssel, die der Schritt ändert (normalisiert, z. B. ".btn.primary", "--muted", "U.tile", "pageHead")' },
    befund_ids: { type: 'array', items: { type: 'string' } },
    abhaengig: { type: 'array', items: { type: 'string' }, description: 'nr anderer Schritte (auch anderer Gruppen, wenn die Spezifikation das sagt), die vorher erledigt sein müssen' },
    tests: { type: 'array', items: { type: 'string' }, description: 'betroffene Testsuiten/Zeilen, die angepasst werden müssen' },
    aufwand: { type: 'string', enum: ['S', 'M', 'L'] },
  }, required: ['nr', 'titel', 'von', 'bis', 'cluster', 'dateien', 'anker', 'befund_ids'] } },
  akzeptanz: { type: 'object', properties: { von: { type: 'integer' }, bis: { type: 'integer' } }, description: 'Zeilenbereich des Abschnitts Akzeptanzkriterien' },
  querbezuege: { type: 'array', items: { type: 'string' }, description: 'Stellen, an denen die Spezifikation auf andere Gruppen verweist oder sich mit ihnen überschneidet (mit Anker)' },
}, required: ['regeln', 'schritte', 'akzeptanz', 'querbezuege'] }
phase('Extrahieren')
const out = await parallel(args.groups.map(k => () => ag(`Du bereitest die Umsetzung eines Design-Audits der Web-App Journalyst vor (Code unter ${WEB}). Arbeite auf Deutsch.
Lies VOLLSTÄNDIG die Zielspezifikation ${AU}/spec/${k}.md (mit Zeilennummern, z. B. Read-Werkzeug in Abschnitten) und ${AU}/spec/${k}.result.json.
Aufgabe: Zerlege Abschnitt 3 („Umsetzungsschritte“) in einzelne, für sich umsetzbare Schritte und gib sie strukturiert zurück. Nichts umschreiben oder erfinden: Jeder Schritt verweist mit von/bis auf die genauen Zeilen der Spezifikation, damit ein Umsetzer sie dort nachliest. Jeder Teil von Abschnitt 3 muss in genau einem Schritt stecken (lückenlos). Ein Schritt ist so groß, dass er in einer Sitzung umsetzbar und testbar ist (lieber feiner).
cluster: in welchen Umsetzungs-Cluster der Schritt fachlich gehört: tokens (CSS-Variablen/Skalen in :root, Grundwerte), komponenten (wiederverwendete Bausteine: Knopf, Feld, Karte, Kachel, Tabelle, Popover, Dialog, Reiter, Menü, Chip, Schalter, Toast …), shell (Seitenleiste, Titelzeile, Kopfreihe pageHead, Konto-Menü, globale Navigation), aufbau (Informationsarchitektur: was wohin wandert, Reihenfolge, Ein-/Ausblenden ganzer Teile), eine Seite (dashboard, statistik, trades_tag = TradeLog/Tagesansicht/Trade-Dialog, notebook_news, training = Fortschritt/Schatten-Ich/Mentor/Ruhepunkt/Replay, prop, konto = Coach/Affiliate/Coupons/Zertifikat, einstellungen), responsiv (reine Handy/Tablet-Regeln), diagramme, zustaende (leer/Fehler/Laden/Validierung), barrierefreiheit (Fokus, ARIA, Tastatur, Kontrast-Technik), wording (reine Textänderungen samt Sprachdateien), bewegung.
anker: die konkreten Dinge, die der Schritt ändert, normalisiert geschrieben, damit Überschneidungen mit anderen Gruppen maschinell gefunden werden (Selektor exakt wie im CSS, Variablen mit --, JS-Funktionen wie U.tile/pageHead/App.render, Sprachschlüssel als "t:<deutscher Text>").
regeln: den Zielzustand (Abschnitt 1) kompakt mit allen verbindlichen Werten.
Ändere KEINE Dateien.`, { label: `extrahieren:${k}`, phase: 'Extrahieren', schema: OUT }).then(r => ({ key: k, r }))))
return { results: out.filter(Boolean) }
