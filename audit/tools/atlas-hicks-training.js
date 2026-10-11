const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const base = 'file:///home/user/Florian/web/app.html'; const LOG = []; const log = m => { LOG.push(m); console.log(m); };
const MENTOR = 'https://mentor.test';
(async () => { const b = await chromium.launch();
  for (const [theme, width] of [['dark', 1440], ['dark', 390]]) {
    const dir = path.join(__dirname, 'shots', 'extra'); fs.mkdirSync(dir, { recursive: true }); const mobile = width < 600;
    const ctx = await b.newContext({ viewport: { width, height: mobile ? 844 : 900 }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
    /* Mentor-Server stubben */
    await ctx.route(MENTOR + '/**', async route => {
      const u = route.request().url(); const m = route.request().method();
      if (u.includes('/api/mentor/history') && m === 'GET') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ messages: [
        { role: 'user', content: 'Ich habe heute nach zwei Verlusten weitergemacht und den dritten Trade doppelt so groß gesetzt.', at: new Date(Date.now() - 3600e3).toISOString() },
        { role: 'assistant', content: 'Danke, dass du das so klar benennst. Zwei Verluste und dann **doppelte Größe** ist ein typisches Muster: Dein Kopf will den Verlust sofort zurückholen.\n\n- Was hast du in dem Moment vor dem dritten Trade gespürt?\n- Gab es ein Signal, das du übergangen hast?\n\nLass uns da ansetzen.', at: new Date(Date.now() - 3500e3).toISOString() },
        { role: 'user', content: 'Frust, ehrlich gesagt. Ich wollte nicht mit Minus aus dem Tag gehen.', at: new Date(Date.now() - 3000e3).toISOString() },
        { role: 'assistant', content: 'Das ist nachvollziehbar. Der Wunsch, nicht im Minus zu enden, ist menschlich. Aber genau dieser Wunsch hat heute entschieden, nicht dein Plan.\n\nFür morgen: Nach zwei Verlusten Plattform zu, egal wie es sich anfühlt. Trag dir das als harte Regel ein.', at: new Date(Date.now() - 2900e3).toISOString() }
      ], quota: { remaining: 7, limit: 10 } }) });
      if (u.includes('/api/mentor/chat')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reply: 'Alles klar.', at: new Date().toISOString(), quota: { remaining: 6, limit: 10 } }) });
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
    const p = await ctx.newPage(); try { await require('../localfonts.js')(p); } catch (e) {}
    await p.goto(base, { waitUntil: 'load' });
    await p.evaluate(t => { Store.installSample(); Store.setSetting('theme', t); Store.setSetting('language', 'de'); Store.setSetting('mentor', { url: 'https://mentor.test', token: 'abc' });
      /* Ruhepunkt-Verlauf anlegen */
      if (!Store.ruhepunkt().length) { Store.addRuhepunkt({ typ: 'vor', gestartet: new Date(Date.now() - 86400e3 * 1).toISOString(), beendet: new Date().toISOString(), ampel: 'gelb', checkin: { schlaf: 5, stress: 6, stimmung: 5, koerper: ['angespannt'] }, regeln: { maxVerlust: '2R', maxTrades: '3', stoppWenn: 'zwei Verluste in Folge' } });
        Store.addRuhepunkt({ typ: 'nach', gestartet: new Date(Date.now() - 86400e3 * 2).toISOString(), beendet: new Date().toISOString(), ergebnis: 'minus', aufgewuehlt: 7, regelnEingehalten: 'teilweise' });
        Store.addRuhepunkt({ typ: 'akut', gestartet: new Date(Date.now() - 86400e3 * 3).toISOString(), beendet: new Date().toISOString(), gefuehle: ['frust', 'wut'], pauseGestartet: true }); }
      Store.saveNow(); }, theme);
    const shot = async (name, full) => { await p.waitForTimeout(500); await p.screenshot({ path: path.join(dir, `hicks-tr-${width}-${name}.png`), fullPage: !!full }); log(`ok ${theme}-${width} ${name}`); };
    const js = async (fn, arg) => p.evaluate(fn, arg);
    /* Fortschritt voll */
    try { await p.goto(base + '#/progress'); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(1200); await shot('progress_voll', true); } catch (e) { log(`FAIL ${width} progress: ${e.message.split('\n')[0]}`); }
    /* Mentor voll */
    try { await p.goto(base + '#/mentor'); await p.waitForTimeout(1200); await shot('mentor_chat', true); } catch (e) { log(`FAIL ${width} mentor: ${e.message.split('\n')[0]}`); }
    /* Ruhepunkt */
    try {
      await p.goto(base + '#/ruhepunkt'); await p.waitForTimeout(1800); await shot('rp_home_verlauf', true);
      const next = async () => { await js(() => { const b = [...document.querySelectorAll('.rp-nav .rp-btn.rp-primary')].pop(); if (!b) throw new Error('kein Weiter'); b.click(); }); await p.waitForTimeout(600); };
      await js(() => document.querySelectorAll('.rp-choice')[0].click()); await p.waitForTimeout(800); await shot('rp_vor_1_atmen', true);
      await next(); await shot('rp_vor_2_checkin', true);
      await next(); await shot('rp_vor_3_box', true);
      await next(); await shot('rp_vor_4_regeln', true);
      await next(); await shot('rp_vor_5_visual', true);
      await next(); await shot('rp_vor_6_impuls', true);
      await next(); await p.waitForTimeout(800); await shot('rp_fertig', true);
      await js(() => document.querySelector('.rp-nav .rp-btn.rp-ghost').click()); await p.waitForTimeout(800);
      await js(() => document.querySelectorAll('.rp-choice')[1].click()); await p.waitForTimeout(800); await shot('rp_nach_1_ergebnis', true);
      await js(() => { const s = Ruhepunkt.session(); s.ergebnis = 'gross'; s.regelnEingehalten = 'nein'; s.aufgewuehlt = 9; }); await next(); await shot('rp_nach_2_atmen', true);
      await next(); await shot('rp_nach_3_einordnen', true);
      await next(); await shot('rp_nach_4_abschluss', true);
      await js(() => document.querySelector('#rp-homebtn').click()); await p.waitForTimeout(800);
      await js(() => document.querySelectorAll('.rp-choice')[2].click()); await p.waitForTimeout(800); await shot('rp_akut_1', true);
      await next(); await shot('rp_akut_2', true);
      await js(() => document.querySelector('[data-action="rp-help"]').click()); await p.waitForTimeout(700); await shot('rp_hilfe_modal', false); await p.keyboard.press('Escape'); await p.waitForTimeout(300);
      await js(() => document.querySelector('#rp-homebtn').click()); await p.waitForTimeout(600);
      await js(() => { const b = document.querySelector('[data-action="rp-delete"]'); if (b) b.click(); }); await p.waitForTimeout(600); await shot('rp_loeschen_modal', false); await p.keyboard.press('Escape');
    } catch (e) { log(`FAIL ${width} ruhepunkt: ${e.message.split('\n')[0]}`); }
    /* Schatten-Ich: Menü Regelwerk mit aktiven Regeln + Verstöße (unten) */
    try { await p.goto(base + '#/shadow'); await p.waitForTimeout(1000); await shot('shadow_voll', true); await js(() => { const sw = document.querySelector('[data-action="shadow-rule-toggle"][data-rule="setups"]'); if (sw) sw.click(); }); await p.waitForTimeout(700); await shot('shadow_setups_an', true); await js(() => { const sw = document.querySelector('[data-action="shadow-rule-toggle"][data-rule="setups"]'); if (sw) sw.click(); }); } catch (e) { log(`FAIL ${width} shadow: ${e.message.split('\n')[0]}`); }
    await ctx.close(); }
  fs.writeFileSync(path.join(__dirname, 'atlas-hicks-training-log.txt'), LOG.join('\n') + '\n'); await b.close(); console.log('TRDONE'); })();
