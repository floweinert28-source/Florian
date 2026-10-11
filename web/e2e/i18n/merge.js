/* node merge.js <code>: fügt <code>/part-*.json (Objekt deutsch → Übersetzung) zusammen, prüft und schreibt web/js/lang/<code>.js */
const fs = require('fs'), path = require('path'), vm = require('vm');
const code = process.argv[2]; const NAMES = { en: 'Englisch', es: 'Spanisch', zh: 'Chinesisch (vereinfacht)', hi: 'Hindi', pt: 'Portugiesisch (Brasilien)' };
const src = JSON.parse(fs.readFileSync(path.join(__dirname, 'strings-etappe1.json'), 'utf8'));
/* Zeitzonen-Namen (Europe/Berlin …) bleiben, wie sie sind, und kommen nicht ins Wörterbuch */
const TZ = /^(Africa|America|Antarctica|Arctic|Asia|Atlantic|Australia|Europe|Indian|Pacific|Etc)\/[A-Za-z_\/+\-0-9 ]+$/; const keys = Object.keys(src).filter(k => !TZ.test(k));
const dir = path.join(__dirname, code); const merged = {};
for (const f of fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => /^part-.*\.json$/.test(f)).sort() : []) { let o; try { o = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { console.log('FEHLER: ' + f + ' ist kein gültiges JSON: ' + e.message); process.exit(1); } Object.assign(merged, o); }
const out = {}; const problems = []; const missing = [];
const ph = s => (s.match(/\{\d+\}/g) || []).sort().join(',');
for (const k of keys) { const v = merged[k]; if (v == null || String(v).trim() === '') { missing.push(k); continue; } if (ph(k) !== ph(String(v))) problems.push(`Platzhalter passen nicht: ${JSON.stringify(k)} → ${JSON.stringify(v)}`); out[k] = String(v); }
const extra = Object.keys(merged).filter(k => !(k in src));
/* Einträge, die gleich bleiben, braucht das Wörterbuch nicht */
const body = keys.filter(k => k in out && out[k] !== k).map(k => `  ${JSON.stringify(k)}: ${JSON.stringify(out[k])},`).join('\n');
const file = `/* Wörterbuch ${NAMES[code] || code}: deutscher Text der Oberfläche → Übersetzung; {0} usw. sind Platzhalter (siehe js/i18n.js) */\nI18N.add('${code}', {\n${body}\n});\n`;
/* Syntax prüfen */
let added = null; try { vm.runInNewContext(file, { I18N: { add: (c, o) => { added = o; } } }); } catch (e) { console.log('FEHLER: Datei lädt nicht: ' + e.message); process.exit(1); }
fs.writeFileSync(path.join('/home/user/Florian/web/js/lang', code + '.js'), file);
const same = keys.filter(k => out[k] === k).length;
console.log(`${code}: ${Object.keys(added).length}/${keys.length} übersetzt, fehlend ${missing.length}, Platzhalter-Fehler ${problems.length}, unbekannte Schlüssel ${extra.length}, unverändert gelassen ${same}`);
problems.slice(0, 20).forEach(x => console.log('  ' + x)); if (missing.length) console.log('  fehlend z. B.: ' + missing.slice(0, 8).map(x => JSON.stringify(x)).join(', ')); if (extra.length) console.log('  unbekannt z. B.: ' + extra.slice(0, 5).map(x => JSON.stringify(x)).join(', '));
process.exit(missing.length || problems.length ? 2 : 0);
