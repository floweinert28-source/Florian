/* Nachfinder: Nebenabläufe und Dialoge (CSV-Import Schritt 2, Sicherung, Plan & Bewertung, Bestätigen/Eingabe, Startfehler, Schriftausfall)
   Aufruf (im scratchpad): export NODE_PATH=$(npm root -g) && node -r ./de-default.js audit/flows-shots.js [teil] */
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const base = 'file:///home/user/Florian/web/app.html';
const OUT = path.join(__dirname, 'shots', 'extra', 'flows'); fs.mkdirSync(OUT, { recursive: true });
const DATA = path.join(__dirname, 'flows-data');
const LOG = []; const log = m => { LOG.push(m); console.log(m); };
const MEAS = {};
const only = process.argv[2] || 'all';
const CONFIGS = [['dark', 1440, 900], ['dark', 1024, 768], ['dark', 390, 844], ['light', 1440, 900]];

async function setup(b, theme, width, height, opts = {}) {
  const mobile = width < 600;
  const ctx = await b.newContext({ viewport: { width, height }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile, acceptDownloads: true });
  const p = await ctx.newPage(); p._errs = []; p.on('pageerror', e => p._errs.push(e.message));
  if (!opts.noFonts) await require('../localfonts.js')(p);
  if (opts.blockFontshare) { await p.unroute('https://api.fontshare.com/**').catch(() => {}); await p.unroute('https://cdn.fontshare.com/**').catch(() => {}); await p.route('https://api.fontshare.com/**', r => r.abort()); await p.route('https://cdn.fontshare.com/**', r => r.abort()); }
  await p.goto(base, { waitUntil: 'load' });
  await p.evaluate(t => { Store.installSample(); Store.setSetting('theme', t); Store.setSetting('language', 'de'); Store.saveNow(); }, theme);
  await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(700);
  return { ctx, p, mobile };
}
const tag = (theme, width) => `${theme}-${width}`;

async function measureModal(p) {
  return p.evaluate(() => {
    const m = [...document.querySelectorAll('.modal')].pop(); if (!m) return null;
    const cs = (el, props) => { if (!el) return null; const s = getComputedStyle(el); const o = {}; props.forEach(k => o[k] = s[k]); const r = el.getBoundingClientRect(); o.box = [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)]; return o; };
    const T = ['fontSize', 'fontWeight', 'fontFamily', 'color', 'lineHeight', 'textTransform', 'letterSpacing', 'marginTop', 'marginBottom', 'paddingLeft', 'display', 'justifyContent', 'textAlign', 'opacity', 'backgroundColor', 'borderTopColor', 'height', 'width'];
    const q = s => m.querySelector(s);
    return {
      modal: cs(m, ['width', 'paddingTop', 'paddingLeft', 'gap', 'maxHeight']), scrollH: m.scrollHeight, clientH: m.clientHeight, cls: m.className,
      h2: cs(q('.modal-head h2'), T), headRow: cs(q('#import-body > .row.between > div'), T), lbl: cs(q('#import-body .lbl'), T), labelField: cs(q('#import-body label.field'), T), selDec: cs(q('#imp-dec'), T),
      legend: cs(q('.fieldset > .legend'), T), fieldset: cs(q('.fieldset'), ['paddingLeft', 'paddingTop', 'gap']), capRow: cs(q('.map-row.caption'), T), capSpan: cs(q('.map-row.caption span'), T), mapB: cs(q('.map-row b'), T), sample: cs(q('.map-row .sample'), T), mapSel: cs(q('.map-row select'), T),
      mapRows: m.querySelectorAll('.map-row').length, banner: cs(q('.banner'), T), bannerSmall: [...m.querySelectorAll('.banner .small')].map(e => e.textContent), th: cs(q('.tbl th'), T), td: cs(q('.tbl td'), T), tblWrap: q('.tbl-wrap') ? { sw: q('.tbl-wrap').scrollWidth, cw: q('.tbl-wrap').clientWidth } : null,
      count: (() => { const e = [...m.querySelectorAll('#import-body > .muted.small')].pop(); return e ? Object.assign(cs(e, T), { text: e.textContent }) : null; })(),
      empty: cs(q('#import-body .empty'), ['minHeight', 'paddingTop', 'height']), emptySvg: cs(q('#import-body .empty svg'), ['width', 'height']),
      p: cs(q(':scope > p'), T), pText: q(':scope > p') ? q(':scope > p').textContent : null, form: cs(q(':scope > form'), ['display', 'gap']), fieldSpan: cs(q('label.field > span'), T), input: cs(q('input.input:not([type=hidden])'), T),
      foot: cs(q('.modal-foot'), ['paddingTop', 'marginTop', 'gap', 'borderTopColor']), footBtns: [...m.querySelectorAll('.modal-foot .btn')].map(b => ({ t: b.textContent.trim(), cls: b.className, dis: b.disabled, hidden: b.hidden, op: getComputedStyle(b).opacity, bg: getComputedStyle(b).backgroundColor, col: getComputedStyle(b).color, h: Math.round(b.getBoundingClientRect().height), w: Math.round(b.getBoundingClientRect().width) })),
      head: cs(q('.modal-head'), ['marginBottom', 'height']),
      gaps: (() => { const kids = [...m.children]; const out = []; for (let i = 1; i < kids.length; i++) { const a = kids[i - 1].getBoundingClientRect(), b2 = kids[i].getBoundingClientRect(); if (kids[i].offsetParent === null) continue; out.push([kids[i - 1].className || kids[i - 1].tagName, kids[i].className || kids[i].tagName, Math.round(b2.top - a.bottom)]); } return out; })(),
      dropzone: cs(q('.dropzone'), T), dzSvg: cs(q('.dropzone svg'), ['width', 'height']), details: cs(q('details'), T), summary: cs(q('details summary'), T), banners: m.querySelectorAll('.banner').length,
    };
  });
}
async function shot(p, name, full = false) { try { await p.waitForTimeout(350); await p.screenshot({ path: path.join(OUT, name + '.png'), fullPage: full }); log('ok ' + name); } catch (e) { log('FAIL ' + name + ': ' + e.message.split('\n')[0]); } }
async function modalScroll(p, where) { await p.evaluate(w => { const m = [...document.querySelectorAll('.modal')].pop(); if (!m) return; const bg = m.parentElement; if (w === 'bottom') { m.scrollTop = m.scrollHeight; bg.scrollTop = bg.scrollHeight; } else if (w === 'mid') { m.scrollTop = (m.scrollHeight - m.clientHeight) / 2; } else { m.scrollTop = 0; bg.scrollTop = 0; } }, where); await p.waitForTimeout(200); }
async function closeAll(p) { await p.evaluate(() => { try { UI.closeModal(true); } catch (e) {} document.querySelectorAll('.modal-bg').forEach(x => x.remove()); document.body.style.overflow = ''; }); await p.waitForTimeout(150); }
async function openImportWith(p, file) { await p.evaluate(() => App.openImport()); await p.waitForTimeout(500); await p.setInputFiles('#import-file', path.join(DATA, file)); await p.waitForTimeout(800); }

(async () => {
  const b = await chromium.launch();
  if (only === 'all' || only === 'csv') for (const [theme, width, height] of CONFIGS) {
    const { ctx, p } = await setup(b, theme, width, height); const t = tag(theme, width); MEAS[t] = {};
    try {
      await p.goto(base + '#/trades'); await p.waitForTimeout(600);
      await p.evaluate(() => App.openImport()); await p.waitForTimeout(500); await shot(p, `${t}-csv_0_schritt1`); MEAS[t].step1 = await measureModal(p); await closeAll(p);
      for (const [key, file] of [['a_tradovate', 'a_tradovate.csv'], ['b_deutsch', 'b_deutsch.csv'], ['b2_platzhalter', 'b2_platzhalter.csv'], ['c_fehler', 'c_fehler.csv'], ['e_breit', 'e_breit.csv']]) {
        if (width !== 1440 && theme === 'dark' && (key === 'b2_platzhalter')) continue;
        await openImportWith(p, file); MEAS[t][key] = await measureModal(p);
        await shot(p, `${t}-csv_${key}_oben`);
        if (MEAS[t][key] && MEAS[t][key].scrollH > MEAS[t][key].clientH + 20) { if (key === 'e_breit') { await modalScroll(p, 'mid'); await shot(p, `${t}-csv_${key}_mitte`); } await modalScroll(p, 'bottom'); await shot(p, `${t}-csv_${key}_unten`); }
        await closeAll(p);
      }
      /* leere Vorschau: alle Zuordnungen auf Ignorieren */
      await openImportWith(p, 'a_tradovate.csv'); await p.evaluate(() => { const s = document.querySelector('.map-row select[data-map="symbol"]'); s.value = ''; s.dispatchEvent(new Event('change')); }); await p.waitForTimeout(400); MEAS[t].leer = await measureModal(p); await modalScroll(p, 'bottom'); await shot(p, `${t}-csv_leer_unten`); await closeAll(p);
      /* Importieren → Toast */
      await openImportWith(p, 'a_tradovate.csv'); await p.click('#import-go'); await p.waitForTimeout(300); await shot(p, `${t}-csv_toast`); MEAS[t].toast = await p.evaluate(() => [...document.querySelectorAll('.toast')].map(x => ({ t: x.textContent, cls: x.className })));
      await p.waitForTimeout(2600);
      /* erneuter Import: nur Duplikate */
      await openImportWith(p, 'a_tradovate.csv'); MEAS[t].dup = await measureModal(p); await modalScroll(p, 'bottom'); await shot(p, `${t}-csv_d_duplikate_unten`); await closeAll(p);
      /* fehlerhafte Datei importieren → Toast, Log */
      await openImportWith(p, 'c_fehler.csv'); await p.click('#import-go'); await p.waitForTimeout(300); MEAS[t].toastC = await p.evaluate(() => [...document.querySelectorAll('.toast')].map(x => x.textContent)); await p.waitForTimeout(2600);
      await p.goto(base + '#/settings/logs'); await p.waitForTimeout(700); await shot(p, `${t}-logs_imports`, true);
      MEAS[t].logs = await p.evaluate(() => [...document.querySelectorAll('.tbl tbody tr')].slice(0, 4).map(r => r.innerText.replace(/\s+/g, ' ')));
    } catch (e) { log(`ERR csv ${t}: ${e.message.split('\n')[0]}`); }
    log(`${t} pageerrors: ${p._errs.join(' | ')}`); await ctx.close();
  }

  if (only === 'all' || only === 'backup') for (const [theme, width, height] of [['dark', 1440, 900], ['dark', 390, 844], ['light', 1440, 900]]) {
    const { ctx, p } = await setup(b, theme, width, height); const t = tag(theme, width); MEAS[t + '-bk'] = {};
    try {
      await p.goto(base + '#/settings/profil'); await p.waitForTimeout(700);
      const dl = p.waitForEvent('download', { timeout: 5000 }).catch(() => null);
      await p.click('[data-action="export"][data-blobs="0"]'); await p.waitForTimeout(150); await shot(p, `${t}-sicherung_export_toast`); await p.waitForTimeout(900); const d = await dl; let backupPath = path.join(DATA, 'backup.json'); if (d) await d.saveAs(backupPath);
      MEAS[t + '-bk'].export = await measureModal(p); await shot(p, `${t}-sicherung_export_dialog`); await closeAll(p);
      /* Notiz-Export über downloadText zum Vergleich */
      await p.evaluate(() => { const n = Store.notes()[0]; UI.downloadText(`notiz-${(n.title || 'ohne-titel').replace(/[^\wäöüß-]+/gi, '-').toLowerCase()}.json`, JSON.stringify({ note: n.title }, null, 2)); }); await p.waitForTimeout(400); MEAS[t + '-bk'].dlText = await measureModal(p); await shot(p, `${t}-notiz_export_dialog`); await closeAll(p);
      await p.click('[data-action="import-backup"][data-mode="merge"]'); await p.waitForTimeout(400); MEAS[t + '-bk'].merge = await measureModal(p); await shot(p, `${t}-sicherung_zusammenfuehren`);
      await p.click('.modal details summary'); await p.waitForTimeout(250); await shot(p, `${t}-sicherung_zusammenfuehren_text`); await closeAll(p);
      await p.click('[data-action="import-backup"][data-mode="replace"]'); await p.waitForTimeout(400); MEAS[t + '-bk'].replace = await measureModal(p); await shot(p, `${t}-sicherung_ersetzen`);
      /* kaputte Datei */
      fs.writeFileSync(path.join(DATA, 'kaputt.json'), '{"app":"trading-journal-web", trades: [1,2,'); await p.setInputFiles('#bk-file', path.join(DATA, 'kaputt.json')); await p.waitForTimeout(300); await shot(p, `${t}-sicherung_fehler_toast`); MEAS[t + '-bk'].errToast = await p.evaluate(() => [...document.querySelectorAll('.toast')].map(x => x.textContent));
      await closeAll(p); await p.waitForTimeout(2500);
      /* fremde, aber gültige JSON */
      fs.writeFileSync(path.join(DATA, 'fremd.json'), '{"hello":"world"}'); await p.click('[data-action="import-backup"][data-mode="merge"]'); await p.waitForTimeout(400); await p.setInputFiles('#bk-file', path.join(DATA, 'fremd.json')); await p.waitForTimeout(400); MEAS[t + '-bk'].fremdToast = await p.evaluate(() => [...document.querySelectorAll('.toast')].map(x => x.textContent)); await shot(p, `${t}-sicherung_fremd_toast`); await closeAll(p); await p.waitForTimeout(2500);
      /* gültige Sicherung zusammenführen */
      if (fs.existsSync(backupPath)) { await p.goto(base + '#/settings/profil'); await p.waitForTimeout(500); await p.click('[data-action="import-backup"][data-mode="merge"]'); await p.waitForTimeout(400); await p.setInputFiles('#bk-file', backupPath); await p.waitForTimeout(600); MEAS[t + '-bk'].okToast = await p.evaluate(() => [...document.querySelectorAll('.toast')].map(x => x.textContent + ' |' + x.className)); await shot(p, `${t}-sicherung_ok_toast`); }
    } catch (e) { log(`ERR backup ${t}: ${e.message.split('\n')[0]}`); }
    log(`${t} pageerrors: ${p._errs.join(' | ')}`); await ctx.close();
  }

  if (only === 'all' || only === 'dialogs') for (const [theme, width, height] of [['dark', 1440, 900], ['dark', 390, 844], ['light', 1440, 900]]) {
    const { ctx, p } = await setup(b, theme, width, height); const t = tag(theme, width); const M = MEAS[t + '-dlg'] = {};
    try {
      /* Plan & Bewertung */
      const tid = await p.evaluate(() => { const tr = Store.trades().find(x => (x.mistakes || []).length && x.notes) || Store.trades().find(x => (x.mistakes || []).length) || Store.trades()[0]; return tr.id; });
      await p.goto(base + '#/trades/' + tid); await p.waitForTimeout(800);
      await p.evaluate(id => App.openTradeJournal(Store.getTrade(id)), tid); await p.waitForTimeout(500); M.plan = await measureModal(p); M.planExtra = await p.evaluate(() => { const m = document.querySelector('.modal'); const g = [...m.querySelectorAll('.form-grid')].map(x => getComputedStyle(x).gridTemplateColumns); const lbl = [...m.querySelectorAll('.field > label, .field > .lbl')].map(x => { const s = getComputedStyle(x); return x.textContent.trim() + ':' + s.fontSize + '/' + s.fontWeight; }); const fields = [...m.querySelectorAll('.form-grid .field')].map(f => { const r = f.getBoundingClientRect(); return [f.querySelector('label,.lbl') && f.querySelector('label,.lbl').textContent.trim(), Math.round(r.x), Math.round(r.y), Math.round(r.width)]; }); const chips = [...m.querySelectorAll('.chips')].map(c => c.children.length); const stack = getComputedStyle(m.querySelector('.stack')).gap; const inputs = [...m.querySelectorAll('.input')].map(i => [i.id, Math.round(i.getBoundingClientRect().height), getComputedStyle(i).fontSize]); return { g, lbl, fields, chips, stack, inputs, h2: m.querySelector('h2').innerHTML }; });
      await shot(p, `${t}-plan_bewertung_oben`); await modalScroll(p, 'bottom'); await shot(p, `${t}-plan_bewertung_unten`); await closeAll(p);
      /* Bestätigen: echte Aufrufer */
      const confirms = [
        ['trade_loeschen', async () => { await p.evaluate(id => App.actions['delete-trade'].call(App, { dataset: { id } }), tid); }],
        ['notiz_endgueltig', async () => { await p.evaluate(() => UI.confirmModal('Endgültig löschen?', 'Das lässt sich nicht rückgängig machen.', { ok: 'Endgültig löschen', danger: true })); }],
        ['notiz_papierkorb', async () => { await p.evaluate(() => UI.confirmModal('Notiz löschen?', 'Sie landet für 30 Tage im Papierkorb und kann dort wiederhergestellt werden.', { ok: 'Löschen', danger: true })); }],
        ['ausgabe_loeschen', async () => { await p.evaluate(() => UI.confirmModal('Ausgabe löschen?', '', { ok: 'Löschen', danger: true })); }],
        ['vorlage_loeschen_dash', async () => { await p.evaluate(() => { const d = Store.dashboards()[0]; UI.confirmModal('Vorlage löschen', `Vorlage „${UI.esc(d.name)}“ wirklich löschen?`, { ok: 'Löschen', danger: true }); }); }],
        ['ordner_leer', async () => { await p.evaluate(() => UI.confirmModal('Ordner „Ideen“ löschen?', 'Achtung: Der Ordner ist leer.', { ok: 'Ordner löschen', danger: true })); }],
        ['einladungslink', async () => { await p.evaluate(() => UI.confirmModal('Neuen Einladungslink erzeugen?', 'Der alte Link funktioniert danach nicht mehr. Wer schon in der Gruppe ist, bleibt drin.', { ok: 'Neuen Link erzeugen' })); }],
      ];
      for (const [name, fn] of confirms) { try { await fn(); await p.waitForTimeout(450); M['c_' + name] = await measureModal(p); await shot(p, `${t}-confirm_${name}`); } catch (e) { log(`FAIL confirm ${name}: ${e.message.split('\n')[0]}`); } await closeAll(p); }
      /* Konto löschen (Einstellungen) und Alles löschen per Klick */
      await p.goto(base + '#/settings/konten'); await p.waitForTimeout(700);
      try { await p.click('[data-action="delete-account"]', { timeout: 3000 }); await p.waitForTimeout(450); M.c_konto = await measureModal(p); await shot(p, `${t}-confirm_konto_loeschen`); } catch (e) { log('FAIL konto: ' + e.message.split('\n')[0]); } await closeAll(p);
      await p.goto(base + '#/settings/profil'); await p.waitForTimeout(700);
      try { await p.click('[data-action="wipe"]', { timeout: 3000 }); await p.waitForTimeout(450); M.c_wipe = await measureModal(p); await shot(p, `${t}-confirm_alles_loeschen`); } catch (e) { log('FAIL wipe: ' + e.message.split('\n')[0]); } await closeAll(p);
      /* Eingabe-Dialoge */
      const prompts = [
        ['vorlage_umbenennen', () => p.evaluate(() => { UI.promptModal('Vorlage umbenennen', { label: 'Name', value: Store.dashboards()[0].name, ok: 'Umbenennen' }); })],
        ['neuer_tag', () => p.evaluate(() => { UI.promptModal('Neuer Tag', { label: 'Name', placeholder: 'z. B. Lehre', ok: 'Anlegen' }); })],
        ['neue_gruppe', () => p.evaluate(() => { UI.promptModal('Neue Gruppe', { label: 'Name der Gruppe', placeholder: 'Kurs Herbst 2026', ok: 'Erstellen' }); })],
      ];
      for (const [name, fn] of prompts) { try { await fn(); await p.waitForTimeout(450); M['p_' + name] = await measureModal(p); await shot(p, `${t}-prompt_${name}`); if (name === 'neuer_tag') { await p.click('.modal button[type=submit]'); await p.waitForTimeout(300); await shot(p, `${t}-prompt_neuer_tag_leer_absenden`); M.p_leer = await p.evaluate(() => { const i = document.querySelector('.modal input[name=v]'); return i ? i.validationMessage : null; }); } } catch (e) { log(`FAIL prompt ${name}: ${e.message.split('\n')[0]}`); } await closeAll(p); }
      /* Vergleich: Konto-Dialog (Formular mit .field label) */
      await p.goto(base + '#/settings/konten'); await p.waitForTimeout(600);
      try { await p.click('[data-action="edit-account"]', { timeout: 3000 }); await p.waitForTimeout(450); M.kontoDlg = await measureModal(p); await shot(p, `${t}-vergleich_konto_dialog`); } catch (e) { log('FAIL kontodlg: ' + e.message.split('\n')[0]); } await closeAll(p);
      /* Beispieldaten entfernen */
      await p.goto(base + '#/settings/profil'); await p.waitForTimeout(600);
      try { await p.click('[data-action="remove-sample"]', { timeout: 3000 }); await p.waitForTimeout(300); await shot(p, `${t}-beispieldaten_entfernt`); M.sampleToast = await p.evaluate(() => [...document.querySelectorAll('.toast')].map(x => x.textContent + ' |' + x.className)); } catch (e) { log('FAIL sample: ' + e.message.split('\n')[0]); }
    } catch (e) { log(`ERR dialogs ${t}: ${e.message.split('\n')[0]}`); }
    log(`${t} pageerrors: ${p._errs.join(' | ')}`); await ctx.close();
  }

  if (only === 'all' || only === 'startfail') for (const [theme, width, height] of [['dark', 1440, 900], ['light', 1440, 900], ['dark', 390, 844], ['light', 390, 844]]) {
    const mobile = width < 600; const ctx = await b.newContext({ viewport: { width, height }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile }); const p = await ctx.newPage(); await require('../localfonts.js')(p);
    try {
      await p.goto(base, { waitUntil: 'load' }); await p.evaluate(t => { Store.installSample(); Store.setSetting('theme', t); Store.setSetting('language', 'de'); Store.saveNow(); }, theme);
      await p.route('**/js/ui.js', r => r.abort()); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(800);
      await shot(p, `${tag(theme, width)}-startfehler`, true);
      MEAS[tag(theme, width) + '-sf'] = await p.evaluate(() => { const box = document.querySelector('#main > div'); const h2 = document.querySelector('#main h2'); const s = x => x ? (({ fontFamily, fontSize, fontWeight, color, backgroundColor }) => ({ fontFamily, fontSize, fontWeight, color, backgroundColor }))(getComputedStyle(x)) : null; return { theme: document.documentElement.dataset.theme, bodyBg: getComputedStyle(document.body).backgroundColor, box: s(box), h2: s(h2), btn: s(document.querySelector('#sf-sample')), sidebar: document.querySelector('.boot-sb') ? 'boot-sb sichtbar' : 'kein boot-sb', sbRect: (() => { const r = document.querySelector('#sidebar').getBoundingClientRect(); return [r.x, r.width]; })(), pre: document.querySelector('#main pre') ? document.querySelector('#main pre').textContent.slice(0, 200) : null }; });
    } catch (e) { log(`ERR startfail ${theme}-${width}: ${e.message.split('\n')[0]}`); }
    await ctx.close();
  }

  if (only === 'all' || only === 'fonts') for (const [theme, width, height] of [['dark', 1440, 900], ['dark', 390, 844]]) {
    for (const mode of ['normal', 'ohne_satoshi']) {
      const { ctx, p } = await setup(b, theme, width, height, { blockFontshare: mode === 'ohne_satoshi' }); const t = tag(theme, width) + '-' + mode;
      try {
        await p.goto(base + '#/dashboard'); await p.waitForTimeout(1200); await shot(p, `${t}-dashboard`);
        MEAS[t] = await p.evaluate(() => { const sat = document.fonts.check('600 16px Satoshi'); const loaded = [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + ' ' + f.weight); const wraps = []; document.querySelectorAll('.card-title, .tile .lbl, .tile .val, .nav a, .sb-nav a, h1, .btn, .tile .k, .tile-head, .card .hd').forEach(e => { const lh = parseFloat(getComputedStyle(e).lineHeight) || (parseFloat(getComputedStyle(e).fontSize) * 1.45); const h = e.getBoundingClientRect().height; if (e.offsetParent && e.textContent.trim()) wraps.push([e.className.split(' ')[0] + ':' + e.textContent.trim().slice(0, 24), Math.round(h), Math.round(e.getBoundingClientRect().width)]); }); const h1 = document.querySelector('h1'); return { sat, loaded: [...new Set(loaded)].slice(0, 20), h1: h1 ? [getComputedStyle(h1).fontFamily, Math.round(h1.getBoundingClientRect().width)] : null, wraps, docH: document.documentElement.scrollHeight }; });
        await p.evaluate(() => App.openTradeEditor(null)); await p.waitForTimeout(600); await shot(p, `${t}-trade_dialog`);
        MEAS[t].tradeDlg = await p.evaluate(() => { const m = document.querySelector('.modal'); return { h: Math.round(m.getBoundingClientRect().height), sh: m.scrollHeight, labels: [...m.querySelectorAll('label, .lbl')].map(l => [l.textContent.trim().slice(0, 20), Math.round(l.getBoundingClientRect().height), Math.round(l.getBoundingClientRect().width)]) }; });
      } catch (e) { log(`ERR fonts ${t}: ${e.message.split('\n')[0]}`); }
      await ctx.close();
    }
  }
  fs.writeFileSync(path.join(__dirname, 'flows-measure-' + only + '.json'), JSON.stringify(MEAS, null, 1)); fs.writeFileSync(path.join(__dirname, 'flows-log-' + only + '.txt'), LOG.join('\n'));
  await b.close(); console.log('FLOWSDONE');
})();
