/* Mentor-Chat: Trading-Psychologie-Mentor über den eigenen Server (server/mentor_server.py).
   Die Website baut den Journal-Kontext, der Server hält den API-Schlüssel, den Verlauf und das Tageslimit. */
(function (root) {
  'use strict';
  const C = root.Core, S = root.Store, U = root.UI, I = U.I, esc = U.esc, fmt = U.fmt, App = root.App;
  const APP_NAME = 'Journalyst';
  const st = () => App.state.mentor || (App.state.mentor = { messages: null, loading: false, sending: false, error: '', notice: '', quota: null, draft: '', stale: false, focus: false, ctrl: null });
  /* Einwilligung (EU AI Act, Datenschutz): erst nach Zustimmung geht etwas an den Server und von dort an den KI-Anbieter */
  const consented = scope => !!((S.settings.aiConsent || {})[scope]);
  const cfg = () => Object.assign({ url: '', token: '' }, S.settings.mentor || {});
  const baseUrl = () => cfg().url.trim().replace(/\/+$/, '');
  const configured = () => /^https?:\/\//.test(baseUrl());
  const headers = () => { const h = { 'Content-Type': 'application/json' }; if (cfg().token) h.Authorization = 'Bearer ' + cfg().token.trim(); return h; };
  const userName = () => { const p = S.settings.profile || {}; const n = (p.firstName || p.username || S.settings.name || '').trim(); return n === 'Trader' ? '' : n; };

  /* Anfrage an den eigenen Server; Fehler kommen als freundlicher Satz zurück (U.friendly), Status, Code und Server-Text nur in
     der Konsole. Sprachnotizen (/api/voice) haben eigene Sätze für Limit, Transkription und Auswertung */
  const failer = area => (status, code, raw, body) => { const err = new Error(''); Object.assign(err, { status, code, serverMessage: raw, body }); err.message = U.friendly(err, area); return err; };
  const aborted = () => Object.assign(new Error(''), { code: 'abort' });
  /* Fehlerantwort des Servers lesen: Code und Text gehen in die Konsole, sichtbar wird nur der freundliche Satz */
  async function errorOf(r, fail) {
    let body = null; try { body = await r.json(); } catch (e) { /* keine JSON-Antwort */ }
    const d = body && body.detail; const raw = (Array.isArray(d) && d.map(x => x && x.msg).filter(Boolean).join(' ')) || (d && typeof d === 'object' && !Array.isArray(d) && d.message) || (typeof d === 'string' && d) || (body && body.error) || '';
    return fail(r.status, d && !Array.isArray(d) && typeof d === 'object' ? d.error : '', raw, body);
  }
  async function api(path, opts) {
    const fail = failer(path.startsWith('/api/voice') ? 'voice' : 'mentor');
    let r;
    try { r = await fetch(baseUrl() + path, Object.assign({ headers: headers() }, opts || {})); }
    catch (e) { if (e && e.name === 'AbortError') throw aborted(); throw fail(0, 'net', e && e.message); }
    if (!r.ok) throw await errorOf(r, fail);
    let body = null; try { body = await r.json(); } catch (e) { /* keine JSON-Antwort */ }
    return body;
  }
  /* Antwort nach und nach: /api/mentor/chat/stream schickt Zeilen (NDJSON) mit Textstücken, onText bekommt den Text bis hierher.
     Ältere Server ohne diesen Weg (404) bekommen die normale Anfrage, dann kommt die Antwort am Stück. info.stream sagt, ob gestreamt
     wurde: ein Abbruch gibt die Nachricht dort wieder frei (zählt nicht fürs Tageslimit) */
  async function chatStream(payload, signal, onText, info) {
    const fail = failer('mentor'); let r;
    try { r = await fetch(baseUrl() + '/api/mentor/chat/stream', { method: 'POST', headers: headers(), body: payload, signal }); }
    catch (e) { if (e && e.name === 'AbortError') throw aborted(); throw fail(0, 'net', e && e.message); }
    if (r.status === 404 || r.status === 405) return api('/api/mentor/chat', { method: 'POST', signal, body: payload });
    if (!r.ok || !r.body) throw await errorOf(r, fail);
    info.stream = true; const reader = r.body.getReader(), dec = new TextDecoder(); let buf = '', text = '', end = null;
    try {
      for (;;) {
        const { value, done } = await reader.read(); if (done) break; buf += dec.decode(value, { stream: true }); let i;
        while ((i = buf.indexOf('\n')) >= 0) {
          const ln = buf.slice(0, i).trim(); buf = buf.slice(i + 1); if (!ln) continue; let ev; try { ev = JSON.parse(ln); } catch (e) { continue; }
          if (ev.t === 'delta') { text += ev.text || ''; onText(text); } else if (ev.t === 'done') end = ev; else if (ev.t === 'error') throw fail(502, ev.error || 'model', ev.message);
        }
      }
    } catch (e) { if (e && e.name === 'AbortError') throw aborted(); if (e && e.code) throw e; throw fail(0, 'net', e && e.message); }
    if (!end) throw fail(502, 'model', 'Antwort ohne Abschluss');
    return { reply: end.reply, at: end.at, quota: end.quota };
  }

  /* ---------- Journal-Kontext: kurze Zusammenfassung statt Rohdaten ---------- */
  const ERG = { plus: 'im Plus', minus: 'im Minus', null: 'ungefähr ausgeglichen', gross: 'großer Verlust' };
  const REG = { ja: 'ja', teilweise: 'teilweise', nein: 'nein' };
  const GEF = { wut: 'Wut', angst: 'Angst', scham: 'Scham', frust: 'Frust', gier: 'Gier', leere: 'Leere' };
  const KOE = { ruhig: 'ruhig', angespannt: 'angespannt', unruhig: 'unruhig', muede: 'müde', gereizt: 'gereizt' };
  const RP_NAMES = { vor: 'Vor dem Trading', nach: 'Nach dem Trading', akut: 'Akut-Reset' };
  const clip = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
  function tradeLine(t) {
    const res = t.r != null ? fmt.r(t.r) : fmt.cur(t.pnl, { signed: true, r: null });
    const broke = (t.rulesBroken || []).length || (t.mistakes || []).length;
    const parts = [`${fmt.dateShort(t.close)} ${t.symbol} ${t.direction > 0 ? 'Long' : 'Short'}: ${res}`, `Regeln eingehalten: ${broke ? 'nein' : 'ja'}`];
    if ((t.mistakes || []).length) parts.push('Fehler: ' + t.mistakes.join(', '));
    if ((t.rulesBroken || []).length) parts.push('Regelbruch: ' + t.rulesBroken.join(', '));
    if ((t.emotions || []).length) parts.push('Emotion: ' + t.emotions.join(', '));
    if (t.notes) parts.push('Notiz: ' + clip(t.notes, 80));
    return '- ' + parts.join(', ');
  }
  function ruhepunktLine(e) {
    const name = RP_NAMES[e.typ] || e.typ; const time = fmt.time ? fmt.time(e.gestartet) : '';
    if (e.typ === 'vor') { const c = e.checkin || {}; const r = e.regeln || {}; const amp = root.Ruhepunkt && root.Ruhepunkt.AMPEL[e.ampel] ? root.Ruhepunkt.AMPEL[e.ampel].label : e.ampel; return `- ${name} (${time}): Ampel ${amp}, Schlaf ${c.schlaf}/10, Stress ${c.stress}/10, Stimmung ${c.stimmung}/10, Körper: ${(c.koerper || []).map(k => KOE[k] || k).join(', ') || 'keine Angabe'}. Tagesregeln: max. Verlust ${r.maxVerlust || 'nicht festgelegt'}, max. Trades ${r.maxTrades || 'nicht festgelegt'}, Stopp wenn: ${r.stoppWenn || 'nicht festgelegt'}.`; }
    if (e.typ === 'nach') { const erg = e.ergebnis != null && Object.prototype.hasOwnProperty.call(ERG, e.ergebnis) ? ERG[e.ergebnis] : 'keine Angabe'; const parts = [`Ergebnis ${erg}`, `aufgewühlt ${e.aufgewuehlt}/10`, `Regeln eingehalten: ${REG[e.regelnEingehalten] || 'keine Angabe'}`]; if (e.gutGemacht) parts.push('gut gemacht: ' + clip(e.gutGemacht, 120)); if (e.abweichung) parts.push('Abweichung: ' + clip(e.abweichung, 120)); if (e.mitnehmen) parts.push('für morgen: ' + clip(e.mitnehmen, 120)); return `- ${name} (${time}): ${parts.join(', ')}.`; }
    return `- ${name} (${time}): Gefühle ${(e.gefuehle || []).map(g => GEF[g] || g).join(', ') || 'keine Angabe'}, Pause gestartet: ${e.pauseGestartet ? 'ja' : 'nein'}.`;
  }
  function buildContext() {
    const lines = []; const all = App.allTrades(); const closed = C.closedOnly(all).slice().sort((a, b) => b.close - a.close).slice(0, 20);
    if (closed.length) {
      lines.push(`Letzte ${closed.length} abgeschlossene Trades (neueste zuerst):`); closed.forEach(t => lines.push(tradeLine(t)));
      const sk = C.streaks(all); if (sk.current) lines.push(`Aktuelle Serie: ${sk.current} ${sk.kind === 'win' ? 'Gewinne' : 'Verluste'} in Folge.`);
      const open = all.filter(t => !t.closed).length; if (open) lines.push(`Offene Positionen: ${open}.`);
    } else lines.push('Trades: keine Daten vorhanden.');
    const today = C.dayKey(new Date()); const rp = S.ruhepunkt().filter(e => e.gestartet && C.dayKey(new Date(e.gestartet)) === today).slice().sort((a, b) => a.gestartet < b.gestartet ? -1 : 1);
    if (rp.length) { lines.push('Ruhepunkt heute:'); rp.forEach(e => lines.push(ruhepunktLine(e))); } else lines.push('Ruhepunkt heute: kein Check-in.');
    const d = S.day(today) || {}; if (d.checkIn) lines.push(`Tages-Check-in: Schlaf ${d.checkIn.sleep != null ? d.checkIn.sleep + ' h' : '?'}, Stress ${d.checkIn.stress != null ? d.checkIn.stress + '/5' : '?'}, Stimmung ${d.checkIn.mood != null ? d.checkIn.mood + '/5' : '?'}.`);
    return lines.join('\n').slice(0, 7900);
  }

  /* ---------- Darstellung ---------- */
  function renderText(t) {
    const blocks = esc(String(t || '')).split(/\n{2,}/).map(b => b.trim()).filter(Boolean);
    return blocks.map(b => {
      const lines = b.split('\n'); const isList = lines.every(l => /^(-|\*|\d+\.)\s+/.test(l));
      const inline = s => s.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
      if (isList) return `<ul>${lines.map(l => `<li>${inline(l.replace(/^(-|\*|\d+\.)\s+/, ''))}</li>`).join('')}</ul>`;
      return `<p>${lines.map(inline).join('<br>')}</p>`;
    }).join('');
  }
  const bubble = m => `<div class="msg ${m.role === 'user' ? 'user' : 'ai'}"><div class="b">${m.role === 'user' ? esc(m.content).replace(/\n/g, '<br>') : renderText(m.content)}</div>${m.at ? `<div class="t">${fmt.time ? fmt.time(m.at) : ''}</div>` : ''}</div>`;
  function quotaText(s) { const q = s.quota; if (!q) return s.loading ? 'Verlauf wird geladen …' : 'Kontingent unbekannt.'; if (q.remaining <= 0) return `Tageslimit von ${q.limit} Nachrichten erreicht. Morgen geht es weiter.`; return `Noch ${q.remaining} von ${q.limit} Nachrichten heute.`; }
  const INTRO = `<div class="mentor-intro"><p><b>Hallo, ich bin dein Trading-Psychologie-Mentor, eine KI.</b></p><p>Ich kenne deine letzten Trades und dein heutiges Ruhepunkt-Check-in. Erzähl mir, wo du gerade stehst: vor dem Handelstag, nach einem Verlust, mitten in einer Serie.</p></div>`;
  const AI_BADGE = '<span class="ai-badge" title="Künstliche Intelligenz">KI</span>';
  /* Vor der ersten Nachricht: klar sagen, dass hier eine KI antwortet, welche Daten mitgehen und wohin; erst nach Zustimmung geht es los */
  function consentCard() {
    let host = ''; try { host = new URL(baseUrl()).host; } catch (e) { host = baseUrl(); }
    return `<div class="mentor-wrap"><section class="card ai-consent" aria-labelledby="ai-consent-h">
      <div class="ai-consent-top">${AI_BADGE}<h2 id="ai-consent-h">Bevor du mit dem Mentor schreibst</h2></div>
      <p class="lead">Der Mentor ist eine KI (Claude von Anthropic), kein Mensch. Seine Antworten können falsch sein und ersetzen keine Therapie, Beratung oder Seelsorge.</p>
      <div class="ai-consent-cols"><div><h3>Was mitgeschickt wird</h3><ul><li>Deine Nachrichten an den Mentor</li><li>Dein Vorname, falls im Profil eingetragen</li><li>Die letzten 20 abgeschlossenen Trades dieses Kontos: Datum, Symbol, Richtung, Ergebnis, Regeln, Fehler, Emotionen und der Anfang deiner Notiz</li><li>Dein heutiger Check-in und Ruhepunkt (Schlaf, Stress, Stimmung, Tagesregeln, deine Antworten)</li></ul></div>
      <div><h3>Wohin es geht</h3><ul><li>An deinen Mentor-Server. Er speichert den Chatverlauf, bis du ihn löschst. <span class="muted no-i18n">(${esc(host)})</span></li><li>Von dort an Anthropic, den Anbieter des Sprachmodells, damit eine Antwort entsteht.</li><li>Kontostände, Broker-Daten und andere Notizen bleiben auf deinem Gerät.</li></ul></div></div>
      <p class="small muted">Du kannst die Einwilligung jederzeit unter Einstellungen → Mentor widerrufen.</p>
      <div class="row ai-consent-act"><button type="button" class="btn primary" data-action="ai-consent" data-scope="mentor">Zustimmen und Mentor starten</button><a class="btn ghost" href="#/dashboard">Nicht jetzt</a></div>
    </section></div>`;
  }

  App.screens.mentor = {
    title: 'Mentor',
    /* Zeitraum, Session und „Trade loggen“ braucht der Chat nicht; das Konto bestimmt, welche Trades mitgeschickt werden (buildContext) */
    head: { range: false, session: false, trade: false, note: 'Der Mentor sieht die letzten 20 Trades dieses Kontos.' },
    render() {
      const s = st();
      if (!configured()) return `<div class="mentor-wrap"><section class="card mentor-setup"><span class="ico">${I.chat}</span><h2>Mentor-Chat einrichten</h2><p class="muted">Der Mentor läuft über deinen eigenen Server, damit der API-Schlüssel nie im Browser landet. Trag unter Einstellungen → Mentor die Server-Adresse und das Zugangstoken ein.</p><a class="btn primary" href="#/settings/mentor">Zu den Einstellungen</a><div class="small faint" style="margin-top:14px">Anleitung zum Server: <code>server/README.md</code> im Projekt.</div></section></div>`;
      if (!consented('mentor')) return consentCard();
      const msgs = s.messages || []; const limitHit = s.quota && s.quota.remaining <= 0; const busy = s.sending || s.loading || limitHit;
      return `<div class="mentor-wrap"><section class="card mentor">
        <div class="mentor-head"><div><b>Trading-Psychologie-Mentor</b>${AI_BADGE}<div class="small muted" id="mentor-quota">${quotaText(s)}</div></div><div class="row"><button type="button" class="btn sm ghost" data-action="mentor-reload" aria-label="Neu laden" data-tip="Verlauf neu laden" ${s.sending || s.loading ? 'disabled' : ''}>${I.clock}</button><button type="button" class="btn sm ghost" data-action="mentor-clear" ${msgs.length ? '' : 'disabled'}>${I.trash} Verlauf löschen</button></div></div>
        <div class="mentor-log" id="mentor-log">${s.loading ? '<div class="mentor-skel" role="status" aria-label="Verlauf wird geladen"><div class="skel msg ai" style="width:62%;height:56px"></div><div class="skel msg user" style="width:38%;height:44px"></div><div class="skel msg ai" style="width:72%;height:68px"></div></div>' : msgs.length ? msgs.map(bubble).join('') : INTRO}${s.sending ? (s.partial ? `<div class="msg ai streaming" aria-busy="true"><div class="b">${renderText(s.partial)}</div></div>` : '<div class="msg ai typing" aria-label="Der Mentor schreibt"><i></i><i></i><i></i></div>') : ''}${s.error ? `<div class="mentor-err" role="alert">${esc(s.error)}</div>` : ''}${s.notice ? `<div class="mentor-notice" role="status">${esc(s.notice)}</div>` : ''}</div>
        <form class="mentor-form" data-action="mentor-send"><textarea class="input" id="mentor-in" rows="2" maxlength="4000" placeholder="${limitHit ? 'Tageslimit erreicht' : 'Schreib dem Mentor … (Enter sendet, Shift+Enter neue Zeile)'}" data-input="mentor-draft" ${busy ? 'disabled' : ''}>${esc(s.draft)}</textarea>${s.sending ? `<button type="button" class="btn icon mentor-stop" data-action="mentor-cancel" aria-label="Antwort abbrechen" title="Abbrechen">${I.stop}</button>` : `<button type="submit" class="btn primary icon" aria-label="Senden" ${busy ? 'disabled' : ''}>${I.arrowUp}</button>`}</form>
        <div class="mentor-note small faint">Der Mentor ist eine KI und ersetzt keine Therapie, Beratung oder Seelsorge. In akuten Krisen: Telefonseelsorge 0800 111 0 111, bei Gefahr 112.</div>
      </section></div>`;
    },
    mount(main) {
      const s = st(); if (!configured() || !consented('mentor')) return; /* vor der Einwilligung keine Anfrage */
      if ((s.messages === null || s.stale) && !s.loading && !s.sending) { s.stale = false; loadHistory(); } /* beim Öffnen der Seite frisch laden, nicht bei jedem Neuaufbau */
      const log = main.querySelector('#mentor-log'); if (log) log.scrollTop = log.scrollHeight;
      const ta = main.querySelector('#mentor-in'); if (ta) { ta.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ta.form.requestSubmit(); } }); if ((s.draft || s.focus) && !ta.disabled && !document.querySelector('.modal-bg')) { ta.focus(); s.focus = false; } }
    },
  };

  async function loadHistory() {
    const s = st(); const first = s.messages === null; s.loading = first; s.error = ''; if (first) App.rerender();
    try { const r = await api('/api/mentor/history?user=' + encodeURIComponent(S.userId())); const pending = (s.messages || []).filter(m => m.pending); s.messages = (r.messages || []).concat(pending); s.quota = r.quota || null; }
    catch (e) { if (first) s.messages = []; s.error = e.message; }
    s.loading = false; if (App.state.route === 'mentor' && !s.sending) App.rerender();
  }
  function showPartial(txt) {
    const log = document.getElementById('mentor-log'); if (!log) return; const atEnd = log.scrollHeight - log.scrollTop - log.clientHeight < 40;
    let b = log.querySelector('.msg.ai.streaming'); if (!b) { const t = log.querySelector('.msg.ai.typing'); b = document.createElement('div'); b.className = 'msg ai streaming'; b.setAttribute('aria-busy', 'true'); b.innerHTML = '<div class="b"></div>'; if (t) t.replaceWith(b); else log.appendChild(b); }
    b.querySelector('.b').innerHTML = renderText(txt); if (atEnd) log.scrollTop = log.scrollHeight;
  }
  Object.assign(App.actions, {
    'mentor-draft'(el) { st().draft = el.value; },
    'mentor-cancel'() { const s = st(); if (s.ctrl) s.ctrl.abort(); },
    'mentor-reload'() { st().messages = null; loadHistory(); },
    async 'mentor-send'() {
      const s = st(); const text = (s.draft || '').trim().slice(0, 4000); if (!text || s.sending || s.loading) return;
      if (!s.messages) s.messages = [];
      s.messages.push({ role: 'user', content: text, at: new Date().toISOString(), pending: true }); s.draft = ''; s.sending = true; s.partial = ''; s.error = ''; s.notice = ''; s.ctrl = new AbortController(); App.rerender(); const info = { stream: false };
      try {
        const payload = JSON.stringify({ user: S.userId(), message: text, context: { app_name: APP_NAME, user_name: userName(), glaubensmodus: S.settings.christlicherImpuls !== false, journal: buildContext() } });
        const r = await chatStream(payload, s.ctrl.signal, txt => { s.partial = txt; showPartial(txt); }, info);
        s.messages.forEach(m => { delete m.pending; }); s.messages.push({ role: 'assistant', content: r.reply, at: r.at }); s.quota = r.quota || s.quota; s.focus = true;
      } catch (e) {
        if (e.code === 'abort') { s.messages.forEach(m => { delete m.pending; }); s.notice = info.stream ? 'Abgebrochen. Diese Nachricht zählt nicht für dein Tageslimit.' : 'Du hast das Warten abgebrochen. Kommt die Antwort noch, siehst du sie beim nächsten Öffnen.'; } /* gestreamt: der Server gibt die Nachricht frei; sonst ist sie schon beim Server und kommt beim nächsten Öffnen mit dem Verlauf (hashchange) */
        else { s.messages = s.messages.filter(m => !m.pending); s.draft = text; s.error = e.message; if (e.status === 429 && e.body && e.body.detail && e.body.detail.quota) s.quota = e.body.detail.quota; }
      }
      s.sending = false; s.ctrl = null; s.partial = ''; if (App.state.route === 'mentor') App.rerender();
    },
    async 'mentor-clear'() {
      if (!await U.confirmModal('Verlauf löschen?', 'Der Mentor vergisst damit alle bisherigen Nachrichten.', { ok: 'Löschen', danger: true })) return;
      const s = st(); try { const r = await api('/api/mentor/history?user=' + encodeURIComponent(S.userId()), { method: 'DELETE' }); s.messages = []; s.error = ''; if (r && r.quota) s.quota = r.quota; U.toast('Verlauf gelöscht', 'ok'); } catch (e) { s.error = e.message; }
      App.rerender();
    },
    async 'mentor-test'(el) {
      const url = (document.getElementById('mentor-url') || {}).value || cfg().url; const token = (document.getElementById('mentor-token') || {}).value || cfg().token;
      const out = document.getElementById('mentor-test-out'); if (out) out.textContent = root.I18N ? root.I18N.t('Prüfe …') : 'Prüfe …';
      try {
        const u = String(url).trim().replace(/\/+$/, ''); if (!/^https?:\/\//.test(u)) throw new Error('Bitte eine Adresse mit https:// eintragen.');
        let r; try { r = await fetch(u + '/api/mentor/health'); } catch (e) { throw Object.assign(new Error(''), { status: 0, serverMessage: e && e.message }); } if (!r.ok) throw Object.assign(new Error(''), { status: r.status });
        const h = await r.json(); const T = (x, v) => root.I18N ? root.I18N.t(x, v) : x; /* Teile einzeln übersetzen, die Ausgabe selbst ist no-i18n */
        let msg = T('Verbunden. {0} Nachrichten pro Tag.', [h.limit]) + (h.prompt_loaded && h.api_key !== false ? '' : ' ' + T('Achtung: Der Server ist noch nicht fertig eingerichtet, der Mentor kann noch nicht antworten.'));
        if (h.auth) { const r2 = await fetch(u + '/api/mentor/history?user=' + encodeURIComponent(S.userId()), { headers: { Authorization: 'Bearer ' + String(token).trim() } }); msg += ' ' + T(r2.ok ? 'Zugangstoken passt.' : 'Zugangstoken wird abgelehnt.'); }
        if (out) out.textContent = msg; U.toast('Verbindung geprüft', 'ok');
      } catch (e) { const T = x => root.I18N ? root.I18N.t(x) : x; if (out) out.textContent = T(e.status == null && e.message ? e.message : U.friendly(e, 'mentor')); U.toast('Keine Verbindung', 'err'); }
    },
  });
  window.addEventListener('hashchange', () => { st().stale = true; });
  /* Nach einer Ruhepunkt-Session: Entwurf vorbereiten, damit der Mentor direkt darauf eingehen kann */
  window.addEventListener('ruhepunkt:gespeichert', e => {
    const d = e.detail || {}; const s = st(); if ((s.draft || '').trim()) return; /* einen angefangenen Entwurf nie überschreiben */
    const name = RP_NAMES[d.typ] || 'Ruhepunkt-Session';
    s.draft = d.typ === 'akut' ? `Ich habe gerade den Akut-Reset gemacht${(d.gefuehle || []).length ? ', dabei kam vor allem ' + d.gefuehle.map(g => GEF[g] || g).join(' und ') + ' hoch' : ''}. ` : `Ich habe gerade die Session „${name}“ im Ruhepunkt abgeschlossen. `;
  });
  root.Mentor = { buildContext, renderText, configured, api };
})(typeof self !== 'undefined' ? self : this);
