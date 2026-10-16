const { chromium } = require('playwright');
const base = 'file:///home/user/Florian/web/app.html';
const out = []; const ok = (n, c, x = '') => out.push(`${c ? 'PASS' : 'FAIL'} ${n}${x ? ' · ' + x : ''}`);
const FAKES = `
  class FakeRecorder { constructor(stream, o) { this.mimeType = (o && o.mimeType) || 'audio/mp4'; this.state = 'inactive'; } start() { this.state = 'recording'; } stop() { if (this.state === 'inactive') return; this.state = 'inactive'; const self = this; setTimeout(() => { self.ondataavailable && self.ondataavailable({ data: new Blob([new Uint8Array(4000)], { type: self.mimeType }) }); self.onstop && self.onstop(); }, 50); } static isTypeSupported(m) { return m === 'audio/mp4'; } }
  window.MediaRecorder = FakeRecorder;
  Object.defineProperty(navigator, 'mediaDevices', { value: { getUserMedia: async () => ({ getTracks: () => [{ stop() {} }] }) }, configurable: true });
  class FakeSR { start() { const self = this; setTimeout(() => { self.onresult && self.onresult({ results: [Object.assign([{ transcript: 'Bin zu früh rein und habe nachgelegt' }], { isFinal: true })] }); }, 200); } stop() {} }
  window.SpeechRecognition = FakeSR;
`;
(async () => {
  const browser = await chromium.launch(); const errs = [];
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } }); const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(FAKES);
  let mode = 'ok'; const calls = [];
  await p.route('https://mentor.test/**', route => { const u = route.request().url(); if (u.endsWith('/api/mentor/health')) return route.fulfill({ json: { ok: true, api_key: true, auth: true } }); if (u.endsWith('/api/voice/analyze')) { if (mode === 'offline') return route.abort('internetdisconnected'); const body = JSON.parse(route.request().postData() || '{}'); calls.push(body); return route.fulfill({ json: { transcript: body.transcript || 'Server-Transkript', emotion: 'frustriert', setup: 'Pullback', mistakes: ['FOMO'], summary: 'Du warst zu früh drin.', source: body.transcript ? 'browser' : 'server', model: 'test', quota: { limit: 30, used: 1, remaining: 29 } } }); } return route.continue(); });
  await p.goto(base + '#/dashboard', { waitUntil: 'load' }); await p.evaluate(() => localStorage.clear()); await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(600);
  await p.evaluate(() => { Store.setSetting('mentor', { url: 'https://mentor.test', token: 't' }); Store.data.tags.setups = ['Pullback', 'Breakout']; if (!Store.data.tags.mistakes.includes('FOMO')) Store.data.tags.mistakes.push('FOMO'); Store.saveNow(); });
  // Dashboard-Schnellzugriff
  await p.evaluate(() => { location.hash = '#/trades'; }); await p.waitForTimeout(400); await p.evaluate(() => { location.hash = '#/dashboard'; }); await p.waitForTimeout(900);
  ok('Dashboard: Kopfreihe oben rechts nur Zertifikat und „Trade loggen“ (kein Mikrofon, kein Session-Start)', !(await p.$('.dash-head [data-action=voice-last]')) && !(await p.$('.dash-head [data-action=start-session], .dash-head [data-action=end-session]')) && !!(await p.$('.dash-head [data-pop=cert]')) && !!(await p.$('.dash-head [data-action=new-trade]')));
  await p.evaluate(() => App.actions['voice-last']()); await p.waitForTimeout(300); /* Aktion bleibt (Sprachnotiz zum letzten Trade), nur der Knopf ist weg */
  const lastSym = await p.evaluate(() => App.allTrades().slice().sort((a, b) => b.sortTime - a.sortTime)[0].symbol);
  ok('Schnellzugriff öffnet Dialog zum letzten Trade', !!(await p.$('.voice-modal')) && (await p.textContent('.voice-modal .modal-head')).includes(lastSym));
  await p.click('.voice-modal [data-close]'); await p.waitForTimeout(300);
  // Trade-Ansicht: Aufnahme mit Countdown, Transkript, Auswertung, Vorschläge übernehmen
  const id = await p.evaluate(() => { const t = Store.trades().find(x => x.closedAt); t.setup = ''; t.emotions = []; t.mistakes = []; Store.saveNow(); return t.id; });
  await p.evaluate(i => { location.hash = '#/trades/' + i; }, id); await p.waitForTimeout(700);
  ok('Trade-Ansicht: Sprachjournal-Karte mit Mikrofon', !!(await p.$('[data-action=voice-open]')));
  await p.click('[data-action=voice-open]'); await p.waitForTimeout(300);
  ok('Dialog zeigt 0:30', (await p.textContent('#voice-time')).trim() === '0:30');
  await p.click('#voice-start'); await p.waitForTimeout(1300);
  const t1 = (await p.textContent('#voice-time')).trim();
  ok('Countdown läuft', t1 === '0:29' || t1 === '0:28', t1);
  ok('Live-Transkript sichtbar', (await p.textContent('#voice-live')).includes('zu früh rein'));
  await p.click('#voice-start'); await p.waitForTimeout(1500);
  ok('Vor der ersten Auswertung: Einwilligungs-Frage, noch keine Anfrage', !!(await p.$('.voice-modal .ai-consent-box')) && /Anthropic/.test(await p.textContent('.voice-modal .ai-consent-box')) && calls.length === 0);
  await p.click('.voice-modal [data-voice-consent=yes]'); await p.waitForTimeout(1500);
  ok('Vorschläge angezeigt', !!(await p.$('.voice-modal .voice-sugs')) && (await p.textContent('.voice-modal .voice-sugs')).includes('frustriert') && (await p.textContent('.voice-modal .voice-sugs')).includes('Pullback'));
  ok('Server bekam Transkript, Listen und Nutzer', calls.length === 1 && calls[0].transcript.includes('zu früh') && calls[0].setups.includes('Pullback') && calls[0].mistakes.includes('FOMO') && !!calls[0].user && calls[0].audio === '');
  ok('Nichts ungefragt überschrieben', await p.evaluate(i => { const t = Store.getTrade(i); return t.setup === '' && t.emotions.length === 0; }, id));
  await p.click('.voice-modal [data-action=voice-apply][data-kind=all]'); await p.waitForTimeout(300);
  ok('Alle Vorschläge übernommen', await p.evaluate(i => { const t = Store.getTrade(i); return t.setup === 'Pullback' && t.emotions.includes('frustriert') && t.mistakes.includes('FOMO'); }, id));
  const note = await p.evaluate(i => Store.getTrade(i).voiceNotes[0], id);
  ok('Notiz gespeichert mit Transkript, Audio und Auswertung', !!note.blobId && note.transcript.includes('zu früh') && note.analysis && note.analysis.summary === 'Du warst zu früh drin.' && note.pending === false && note.mime === 'audio/mp4');
  await p.click('.voice-modal [data-close]'); await p.waitForTimeout(400);
  ok('Trade-Ansicht listet Notiz mit Kurzfassung', (await p.textContent('#main')).includes('Du warst zu früh drin.'));
  // Offline: Aufnahme bleibt, erneut senden
  mode = 'offline';
  await p.click('[data-action=voice-open]'); await p.waitForTimeout(200); await p.click('#voice-start'); await p.waitForTimeout(600); await p.click('#voice-start'); await p.waitForTimeout(1500);
  ok('Offline: Hinweis im Dialog', (await p.textContent('.voice-modal')).includes('erneut senden'));
  const pend = await p.evaluate(i => Store.getTrade(i).voiceNotes[1], id);
  ok('Offline: Notiz bleibt mit Audio, Status ausstehend', pend && pend.pending === true && !!pend.blobId && pend.transcript.includes('zu früh'));
  await p.click('.voice-modal [data-close]'); await p.waitForTimeout(400);
  ok('Trade-Ansicht: „Erneut senden“ sichtbar', !!(await p.$('[data-action=voice-retry]')));
  mode = 'ok'; await p.click('[data-action=voice-retry]'); await p.waitForTimeout(800);
  ok('Erneut senden wertet aus', await p.evaluate(i => { const v = Store.getTrade(i).voiceNotes[1]; return v.pending === false && !!v.analysis; }, id));
  // Audio nicht behalten
  await p.evaluate(() => { Store.setSetting('voiceKeepAudio', false); });
  await p.click('[data-action=voice-open]'); await p.waitForTimeout(200); await p.click('#voice-start'); await p.waitForTimeout(600); await p.click('#voice-start'); await p.waitForTimeout(1500);
  ok('Audio nach Auswertung gelöscht, Transkript bleibt', await p.evaluate(i => { const v = Store.getTrade(i).voiceNotes[2]; return v.blobId === null && v.transcript.length > 5 && !!v.analysis; }, id));
  await p.click('.voice-modal [data-close]'); await p.waitForTimeout(300);
  // Einstellung sichtbar
  await p.evaluate(() => { location.hash = '#/settings/mentor'; }); await p.waitForTimeout(500);
  ok('Einstellung „Audio behalten“ unter Mentor', await p.$eval('[data-action=voice-audio-toggle]', e => e.getAttribute('aria-checked') === 'false'));
  // Handy
  await p.setViewportSize({ width: 390, height: 844 }); await p.evaluate(i => { location.hash = '#/trades/' + i; }, id); await p.waitForTimeout(600); await p.click('[data-action=voice-open]'); await p.waitForTimeout(300);
  ok('Handy: Dialog passt', await p.evaluate(() => { const m = document.querySelector('.voice-modal'); return m && m.getBoundingClientRect().width <= 390 && document.documentElement.scrollWidth <= 390; }));
  console.log(out.join('\n')); console.log(errs.length ? 'ERRORS: ' + errs.join(' | ') : 'no errors'); await browser.close(); })();
