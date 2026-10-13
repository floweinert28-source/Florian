export const meta = {
  name: 'hicks-pruefen-rest',
  description: 'Hick-Audit: fehlende Prüfungen (Fakten, Vorgaben) für einzelne Bereiche aus Dateien',
  phases: [{ title: 'Prüfen' }],
}
const ag = async (prompt, opts) => { opts = Object.assign({ effort: 'xhigh' }, opts || {}); const r = await agent(prompt, opts); if (r != null) return r; log(`Agent ${opts.label || ''} ohne Ergebnis – Wiederholung`); return agent(prompt, Object.assign({}, opts, { label: (opts.label || 'agent') + ' (2)' })) }
const SP = '/tmp/claude-0/-home-user-Florian/3d79e81c-3967-55f9-a53a-e07cf04bcd94/scratchpad'
const AU = SP + '/audit'
const WEB = '/home/user/Florian/web'
const sh = (ctx, name) => `${AU}/shots/${ctx}/${name}.png`
const D = n => sh('dark-1440', n), M = n => sh('dark-390', n), X = n => sh('extra-dark-1440', n), XM = n => sh('extra-dark-390', n)

const BASE = `Du prüfst die Trading-Journal-Web-App Journalyst nach dem Prinzip „Jeder Screen will genau eine Sache vom Nutzer“ (Hick's Law). Lies ZUERST vollständig ${AU}/HICKS-BRIEF.md (Auftrag und 5 Regeln des Nutzers, Hierarchie-Stufen, Form der Vorschläge) und danach ${AU}/BRIEF.md (Material, Vorgaben des Nutzers, was abgelehnt ist).
Verbindlich: Das Design bleibt wie es ist (Farben, Schriften, Rundungen, Symbole) – nur Hierarchie, Reduktion, Reihenfolge, Verstecken. Keine Funktion entfernen; alles bleibt erreichbar (Menü, „Mehr Optionen“, zweiter Schritt). Arbeite auf Deutsch. Screenshots mit dem Read-Werkzeug ansehen. Code unter ${WEB}.`

const SCREENS = { type: 'object', properties: {
  screens: { type: 'array', items: { type: 'object', properties: {
    screen: { type: 'string', description: 'Route oder Dialog, z. B. dashboard, trades, modal_trade_loggen, settings/konten' },
    zustand: { type: 'string', description: 'voll | leer | dialog | menue | bearbeiten | handy | …' },
    hauptaktion: { type: 'string', description: 'die EINE Hauptaktion, die der Screen wollen sollte' },
    optisch_klar: { type: 'boolean', description: 'ist sie heute optisch klar die wichtigste?' },
    begruendung: { type: 'string', description: 'warum (ja/nein), mit Beleg: welche Knöpfe sind heute wie gestaltet' },
    konkurrenten: { type: 'array', items: { type: 'string' }, description: 'Knöpfe/Elemente, die heute gleichwertig konkurrieren' },
    verstecken: { type: 'array', items: { type: 'string' }, description: 'Optionen, die bis zum Bedarf versteckt werden könnten (wohin)' },
    irrelevant: { type: 'array', items: { type: 'string' }, description: 'was gezeigt wird, obwohl es in diesem Zustand nicht relevant ist' },
    vorschlaege: { type: 'array', items: { type: 'object', properties: {
      titel: { type: 'string' }, regel: { type: 'integer', minimum: 1, maximum: 5 }, wirkung: { type: 'integer', minimum: 1, maximum: 3, description: '1 = groß, 2 = mittel, 3 = klein' }, aufwand: { type: 'string', description: 'S | M | L' },
      beschreibung: { type: 'string', description: 'konkret: welcher Knopf wird primär/sekundär/tertiär, was wandert wohin, was wird in welchem Zustand ausgeblendet und wo bleibt es erreichbar; Dateien/Selektoren' },
      beleg: { type: 'string' },
    }, required: ['titel', 'regel', 'wirkung', 'beschreibung', 'beleg'] } },
  }, required: ['screen', 'zustand', 'hauptaktion', 'optisch_klar', 'begruendung', 'konkurrenten', 'verstecken', 'irrelevant', 'vorschlaege'] } },
  hinweise: { type: 'string' },
}, required: ['screens'] }

const VERDICTS = { type: 'object', properties: { urteile: { type: 'array', items: { type: 'object', properties: {
  id: { type: 'string' }, bestaetigt: { type: 'boolean' }, wirkung: { type: 'integer', minimum: 1, maximum: 3 }, anmerkung: { type: 'string' }, beschreibung_neu: { type: 'string', description: 'nur wenn die Beschreibung präzisiert oder korrigiert werden muss' },
}, required: ['id', 'bestaetigt'] } }, screen_korrekturen: { type: 'string', description: 'Korrekturen an Hauptaktion/Bewertung einzelner Screens, falls nötig' } }, required: ['urteile'] }

const SUMMARY = { type: 'object', properties: { zusammenfassung: { type: 'string' }, top: { type: 'array', items: { type: 'string' } }, entscheidungen: { type: 'array', items: { type: 'string' } }, dateien: { type: 'array', items: { type: 'string' } } }, required: ['zusammenfassung', 'top', 'entscheidungen', 'dateien'] }

const GROUPS = [
  { key: 'dashboard', titel: 'Dashboard (voll, leer, Bearbeiten, Widget-Panel, Menüs Zeitraum/Konto/Filter/Vorlage/Zertifikat)', code: ['js/screens/dashboard.js', 'js/screens/dash-filter.js', 'js/app.js (topbar, rangeControl, accountControl, newTradeButton)', 'js/widgets.js (Reiter Letzte Trades/Offene Positionen)'], shots: ['dashboard', 'leer_dashboard', 'pop_zeitraum', 'pop_konto', 'pop_filter', 'pop_vorlage', 'pop_zertifikat'].map(D).concat(['dashboard_bearbeiten', 'panel_widget_hinzufuegen'].map(X)).concat(['dashboard', 'pop_filter'].map(M)) },
  { key: 'trades', titel: 'TradeLog (voll, leer, Reiter Trades/Tage/Verpasste, Suche, Trade-Detail, CSV-Import-Dialog)', code: ['js/screens/trades.js', 'js/app.js (CSV importieren ab Zeile ~570, Trade-Detail)'], shots: ['trades', 'leer_trades', 'trade_detail'].map(D).concat(['trades_suche', 'csv_import'].map(X)).concat(['trades'].map(M)) },
  { key: 'trade_dialog', titel: 'Dialog „Trade loggen“ (leer, Long gewählt, Fehlerzustand) und Check-in-Dialog', code: ['js/app.js (tradeForm/openTradeModal, readTradeForm, save-trade, feeField, Check-in-Dialog)', 'css/app.css (tf-modal, dir-switch, modal-foot)'], shots: ['modal_trade_loggen'].map(D).concat(['modal_trade_loggen_long', 'modal_trade_loggen_fehler', 'modal_checkin'].map(X)).concat(['modal_trade_loggen'].map(M)) },
  { key: 'day', titel: 'Tagesansicht (Tag mit Trades, heute ohne Trades, leer)', code: ['js/screens/day.js'], shots: ['day', 'day_mit_trades'].map(D).concat(['tag_heute', 'leer_day'].map(X)).concat(['day_mit_trades'].map(M)) },
  { key: 'stats', titel: 'Statistiken (Übersicht und alle Reiter, leer)', code: ['js/screens/stats.js'], shots: ['stats', 'stats_days', 'stats_setups', 'stats_time', 'stats_mistakes', 'stats_regime', 'stats_state', 'stats_edge', 'stats_mc', 'leer_stats'].map(D).concat(['stats'].map(M)) },
  { key: 'notebook_news', titel: 'Notebook (Liste, Notiz, neue Notiz, leer) und News', code: ['js/screens/notebook.js', 'js/editor.js', 'js/screens/news.js'], shots: ['notebook', 'notebook_notiz', 'news'].map(D).concat(['notebook_neu', 'leer_notebook'].map(X)).concat(['notebook', 'notebook_notiz', 'news'].map(M)) },
  { key: 'training', titel: 'Fortschritt (voll, leer), Schatten-Ich (voll, leer), Mentor, Ruhepunkt', code: ['js/screens/progress.js', 'js/screens/shadow.js', 'js/screens/mentor.js', 'js/screens/ruhepunkt.js'], shots: ['progress', 'leer_progress', 'shadow', 'leer_shadow', 'mentor', 'ruhepunkt'].map(D).concat(['mentor_voll', 'ruhepunkt_start', 'ruhepunkt_schritt2'].map(X)).concat(['progress', 'shadow', 'mentor'].map(M)) },
  { key: 'prop', titel: 'Prop Firms (Übersicht, Analyse, Auswertung, Bilanz, Finanzen, Payout, Friedhof, leer)', code: ['js/screens/prop.js', 'js/screens/prop-friedhof.js'], shots: ['prop', 'prop_analyse', 'prop_auswertung', 'prop_bilanz', 'prop_finanzen', 'prop_payout', 'prop_friedhof', 'leer_prop'].map(D).concat(['prop', 'prop_bilanz'].map(M)) },
  { key: 'konto', titel: 'Coupons, Affiliate, Coach (voll und leer)', code: ['js/screens/coupons.js', 'js/screens/affiliate.js', 'js/screens/coach.js'], shots: ['coupons', 'affiliate', 'coach'].map(D).concat(['leer_coach'].map(X)).concat(['coupons', 'affiliate', 'coach'].map(M)) },
  { key: 'settings', titel: 'Einstellungen (alle Abschnitte)', code: ['js/screens/misc.js'], shots: ['settings_profil', 'settings_design', 'settings_sprache', 'settings_benachrichtigungen', 'settings_abo', 'settings_konten', 'settings_trading', 'settings_regeln', 'settings_notebook', 'settings_mentor', 'settings_inhalte'].map(D).concat(['settings_design_voll'].map(X)).concat(['settings', 'settings_profil', 'settings_konten'].map(M)) },
  { key: 'shell', titel: 'Seitenleiste, Titelzeile, Konto-Menü unten, Handy-Menü, Zertifikat-Popover und Zertifikat-Dialog', code: ['js/app.js (renderSidebar, topbar, pageHead, NAV_GROUPS)', 'js/certificate.js'], shots: ['dashboard', 'pop_zertifikat', 'modal_zertifikat', 'trades'].map(D).concat(['sidebar_mini', 'menu_konto_unten'].map(X)).concat(['mobile_menue', 'menu_konto_unten'].map(XM)) },
  { key: 'replay', titel: 'Blind-Replay (versteckt hinter Feature-Flag; Start, Karte, leer)', code: ['js/screens/replay.js', 'js/replay.js'], shots: ['replay', 'replay_karte', 'leer_replay'].map(X).concat(['replay'].map(XM)) },
]

const HI = AU + '/hicks-in'
const jobs = args.jobs // [{ key, roles: ['fakten','vorgaben'] }]
phase('Prüfen')
const out = await parallel(jobs.flatMap(j => { const g = GROUPS.find(x => x.key === j.key); return j.roles.map(role => () => ag(role === 'fakten' ? `${BASE}
Rolle: skeptischer Faktenprüfer für den Bereich „${g.titel}“. Die Analyse eines anderen Agenten steht in ${HI}/analyse-${g.key}.json (Feld screens; jeder Vorschlag hat eine id der Form <sid>-<n>; die sid ist ${g.key}-<Nummer des Screens ab 1 in der Reihenfolge der Datei>).
Prüfe JEDEN Vorschlag und jede Screen-Bewertung selbst nach: Aufnahmen ${g.shots.join(' ; ')} ansehen und den Code lesen (${g.code.map(c => WEB + '/' + c).join(', ')}). Stimmt die Beschreibung der heutigen Knopf-Hierarchie (welcher Knopf ist gefüllt, umrandet, Symbol)? Existieren die genannten Knöpfe wirklich? Ist die Hauptaktion plausibel die eine Sache, die ein Daytrader hier tun will? Bestätige nur Zutreffendes; markiere Übertreibungen (wirkung anpassen); korrigiere falsche Beschreibungen in beschreibung_neu. Gib für jede Vorschlags-id ein Urteil und in screen_korrekturen Korrekturen an Hauptaktionen.` : `${BASE}
Rolle: Prüfer für Konsistenz, Vorgaben und Risiko im Bereich „${g.titel}“. Die Analyse eines anderen Agenten steht in ${HI}/analyse-${g.key}.json (Feld screens; jeder Vorschlag hat eine id der Form <sid>-<n>; die sid ist ${g.key}-<Nummer des Screens ab 1 in der Reihenfolge der Datei>).
Prüfe JEDEN Vorschlag: 1) Hält er die Vorgabe ein, dass das Design unverändert bleibt (nur Hierarchie, Reduktion, Reihenfolge, Verstecken; nur die vorhandenen Stufen primär/sekundär/tertiär/Menü/„Mehr Optionen“)? 2) Entfernt er eine Funktion oder macht sie schwer erreichbar (Filter im vollen Zustand ausblenden wäre falsch; im leeren Zustand richtig)? 3) Widerspricht er Entscheidungen des Nutzers in ${WEB}/README.md oder BRIEF.md (z. B. Zeitraum/Konto/Filter stehen bewusst oben rechts in der Titelzeile; Grün nur für Gewinn und „Trade loggen“)? 4) Ist er über die Bereiche hinweg konsistent (gleiche Aktion = gleiche Stufe; pro Screen genau EIN gefüllter Knopf)? 5) Ist er konkret genug? Falls nicht: beschreibung_neu. Nur bestätigen, was eine echte Verbesserung nach den 5 Regeln ist. Gib für jede id ein Urteil.`, { label: `${role}:${g.key}`, phase: 'Prüfen', schema: VERDICTS }).then(r => ({ key: g.key, role, r }))) }))
return { results: out.filter(Boolean) }
