/* Sprachjournal: 30-Sekunden-Aufnahme im Browser (MediaRecorder) mit Countdown, Transkript über die Spracherkennung des
   Browsers, Auswertung über den Mentor-Server (Claude, Schlüssel nur dort) als Vorschläge, die der Nutzer bestätigt.
   Audio und Transkript bleiben lokal (IndexedDB bzw. Store); ohne Netz bleibt die Aufnahme erhalten und lässt sich erneut senden. */
(function (root) {
  'use strict';
  const C = root.Core, S = root.Store, U = root.UI, I = U.I, esc = U.esc, fmt = U.fmt, App = root.App;
  const MAX_SEC = 30;
  const SR = root.SpeechRecognition || root.webkitSpeechRecognition;
  const mentor = () => root.Mentor;
  const canRecord = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && root.MediaRecorder);
  /* Safari liefert nur audio/mp4, Chrome/Firefox WebM/Opus; die Reihenfolge bevorzugt ein Format, das überall abspielt */
  function pickMime() { const list = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus']; return list.find(m => { try { return root.MediaRecorder.isTypeSupported(m); } catch (e) { return false; } }) || ''; }
  const tradeLabel = t => `${t.symbol} ${t.direction > 0 ? 'Long' : 'Short'} · ${fmt.dateTime(t.openedAt)}`;
  const blobToBase64 = blob => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1] || ''); r.onerror = () => rej(r.error); r.readAsDataURL(blob); });

  /* ---------- Auswertung über den Server ---------- */
  async function analyze(trade, note) {
    const M = mentor(); if (!M || !M.configured()) throw Object.assign(new Error('Mentor-Server nicht eingerichtet'), { code: 'config' });
    const body = { user: S.userId(), transcript: note.transcript || '', audio: '', mime: note.mime || '', language: 'de', setups: (S.data.tags.setups || []).slice(0, 100), mistakes: (S.data.tags.mistakes || []).slice(0, 100), trade: tradeLabel(trade) };
    if (!body.transcript && note.blobId) { const blob = await root.Blobs.get(note.blobId).catch(() => null); if (blob) { body.audio = await blobToBase64(blob); body.mime = note.mime || blob.type || ''; } }
    return M.api('/api/voice/analyze', { method: 'POST', body: JSON.stringify(body) });
  }
  async function runAnalysis(tradeId, voiceId) {
    const t = S.getTrade(tradeId); const v = t && (t.voiceNotes || []).find(x => x.id === voiceId); if (!t || !v) return null;
    try {
      const res = await analyze(t, v);
      v.transcript = res.transcript || v.transcript; v.sentiment = v.transcript ? C.sentiment(v.transcript) : null;
      v.analysis = { emotion: res.emotion, setup: res.setup, mistakes: res.mistakes || [], summary: res.summary || '', model: res.model || '', source: res.source || '' };
      v.pending = false; v.error = null;
      if (S.settings.voiceKeepAudio === false && v.blobId) { await root.Blobs.del(v.blobId).catch(() => {}); v.blobId = null; }
      S.saveNow(); return { ok: true, note: v };
    } catch (e) {
      /* Ohne Netz oder bei Serverfehlern bleibt die Aufnahme erhalten und kann später erneut gesendet werden */
      v.pending = e.code !== 'config'; v.error = e.message || 'Auswertung fehlgeschlagen'; S.saveNow();
      return { ok: false, error: v.error, retry: v.pending, note: v };
    }
  }

  /* ---------- Vorschläge übernehmen (nie ungefragt) ---------- */
  function suggestionsHTML(t, a) {
    if (!a) return '';
    const has = (list, x) => (list || []).some(y => y.toLowerCase() === String(x).toLowerCase());
    const rows = [];
    rows.push(`<div class="voice-sug"><span class="k">Emotion</span><span class="v">${U.chip(a.emotion, 'emotion')}</span>${has(t.emotions, a.emotion) ? '<span class="small muted">schon drin</span>' : `<button type="button" class="btn xs" data-action="voice-apply" data-kind="emotion" data-value="${esc(a.emotion)}">Übernehmen</button>`}</div>`);
    if (a.setup) rows.push(`<div class="voice-sug"><span class="k">Setup</span><span class="v">${U.chip(a.setup, 'setup')}${t.setup && t.setup !== a.setup ? `<span class="small muted">aktuell: ${esc(t.setup)}</span>` : ''}</span>${t.setup === a.setup ? '<span class="small muted">schon gesetzt</span>' : `<button type="button" class="btn xs" data-action="voice-apply" data-kind="setup" data-value="${esc(a.setup)}">${t.setup ? 'Ersetzen' : 'Übernehmen'}</button>`}</div>`);
    for (const m of a.mistakes || []) rows.push(`<div class="voice-sug"><span class="k">Fehler</span><span class="v">${U.chip(m, 'mistake')}</span>${has(t.mistakes, m) ? '<span class="small muted">schon drin</span>' : `<button type="button" class="btn xs" data-action="voice-apply" data-kind="mistake" data-value="${esc(m)}">Übernehmen</button>`}</div>`);
    if (a.summary) rows.push(`<div class="voice-sug"><span class="k">Kurz</span><span class="v small">${esc(a.summary)}</span></div>`);
    const open = (!has(t.emotions, a.emotion)) || (a.setup && t.setup !== a.setup) || (a.mistakes || []).some(m => !has(t.mistakes, m));
    return `<div class="voice-sugs">${rows.join('')}${open ? `<div class="row" style="margin-top:8px"><button type="button" class="btn sm primary" data-action="voice-apply" data-kind="all">Alle Vorschläge übernehmen</button></div>` : ''}</div>`;
  }
  function apply(trade, a, kind, value) {
    const patch = {}; const addTo = (list, x) => { const cur = (trade[list] || []).slice(); if (!cur.some(y => y.toLowerCase() === String(x).toLowerCase())) cur.push(x); patch[list] = cur; };
    if (kind === 'emotion' || kind === 'all') addTo('emotions', kind === 'all' ? a.emotion : value);
    if ((kind === 'setup' || kind === 'all') && (kind === 'all' ? a.setup : value)) patch.setup = kind === 'all' ? a.setup : value;
    if (kind === 'mistake') addTo('mistakes', value);
    if (kind === 'all') for (const m of a.mistakes || []) addTo('mistakes', m);
    if (!Object.keys(patch).length) return;
    S.updateTrade(trade.id, patch); U.toast('Übernommen', 'ok');
  }

  /* ---------- Aufnahme-Dialog ---------- */
  function open(tradeId) {
    const t = S.getTrade(tradeId); if (!t) return U.toast('Trade nicht gefunden', 'err');
    const M = mentor(); const serverOk = !!(M && M.configured());
    const html = `<div class="modal-head"><div><h2>Sprachnotiz</h2><div class="small muted">${esc(tradeLabel(t))}</div></div><button type="button" class="btn ghost icon" data-close aria-label="Schließen">${I.close}</button></div>
      <div class="voice-rec" id="voice-rec">
        <div class="voice-clock"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="track" cx="60" cy="60" r="52"/><circle class="prog" cx="60" cy="60" r="52" stroke-dasharray="326.7" stroke-dashoffset="0"/></svg><div class="voice-time" id="voice-time">0:${MAX_SEC}</div></div>
        <div class="voice-status" id="voice-status" aria-live="polite">${canRecord() ? 'Bis zu 30 Sekunden. Sag, was dir durch den Kopf ging.' : 'Aufnahme in diesem Browser nicht möglich. Nutze die Text-Notiz.'}</div>
        <div class="voice-live small muted" id="voice-live"></div>
        <div class="row voice-actions" id="voice-actions"><button type="button" class="btn primary big" id="voice-start" ${canRecord() ? '' : 'disabled'}>${I.mic} Aufnahme starten</button><button type="button" class="btn ghost" data-action="voice-text" data-trade="${t.id}" data-close>${I.note} Lieber tippen</button></div>
        <div id="voice-result"></div>
        ${serverOk ? '' : `<div class="small muted" style="margin-top:10px">Ohne Mentor-Server wird nur das Transkript gespeichert. Adresse unter Einstellungen → Mentor.</div>`}
      </div>`;
    U.modal(html, { cls: 'narrow voice-modal', noFocus: true, onMount: box => mount(box, t.id), onClose: () => stopAll() });
  }
  let active = null; /* { rec, stream, recog, timer } */
  function stopAll() { if (!active) return; try { active.rec.state !== 'inactive' && active.rec.stop(); } catch (e) { /* schon gestoppt */ } try { active.stream.getTracks().forEach(tr => tr.stop()); } catch (e) { /* ignorieren */ } if (active.recog) { try { active.recog.stop(); } catch (e) { /* ignorieren */ } } clearInterval(active.timer); active = null; }
  function mount(box, tradeId) {
    const startBtn = box.querySelector('#voice-start'), status = box.querySelector('#voice-status'), live = box.querySelector('#voice-live'), time = box.querySelector('#voice-time'), prog = box.querySelector('.voice-clock .prog'), result = box.querySelector('#voice-result');
    const CIRC = 326.7;
    startBtn.addEventListener('click', async () => {
      if (active) { stopAll(); return; }
      let stream; try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
      catch (e) { status.textContent = 'Kein Mikrofonzugriff. Erlaube das Mikrofon in den Browser-Einstellungen oder nutze die Text-Notiz.'; status.classList.add('neg'); return; }
      const type = pickMime(); const rec = type ? new root.MediaRecorder(stream, { mimeType: type }) : new root.MediaRecorder(stream);
      const chunks = []; let transcript = '', interim = ''; let recog = null;
      if (SR) { try { recog = new SR(); recog.lang = 'de-DE'; recog.continuous = true; recog.interimResults = true; recog.onresult = ev => { let fin = ''; interim = ''; for (let i = 0; i < ev.results.length; i++) { if (ev.results[i].isFinal) fin += ev.results[i][0].transcript + ' '; else interim += ev.results[i][0].transcript; } transcript = fin.trim(); live.textContent = (transcript + ' ' + interim).trim(); }; recog.onerror = () => {}; recog.start(); } catch (e) { recog = null; } }
      const started = performance.now();
      rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
      rec.onstop = async () => {
        const dur = Math.min(MAX_SEC, Math.round((performance.now() - started) / 1000));
        stream.getTracks().forEach(tr => tr.stop()); if (recog) { try { recog.stop(); } catch (e) { /* ignorieren */ } }
        await new Promise(r => setTimeout(r, 500)); /* letzte Erkennungsergebnisse abwarten */
        clearInterval(active && active.timer); active = null;
        const blob = new Blob(chunks, { type: rec.mimeType || type || 'audio/webm' });
        const bid = blob.size ? await root.Blobs.put(blob).catch(() => null) : null;
        const t = S.getTrade(tradeId); if (!t) return;
        const note = { id: C.uid(), blobId: bid, mime: blob.type, duration: dur, transcript, sentiment: transcript ? C.sentiment(transcript) : null, analysis: null, pending: false, error: null, createdAt: new Date().toISOString() };
        (t.voiceNotes = t.voiceNotes || []).push(note); S.saveNow();
        startBtn.innerHTML = `${I.mic} Neue Aufnahme`; startBtn.classList.remove('danger');
        status.textContent = transcript ? 'Aufnahme gespeichert.' : 'Aufnahme gespeichert, dein Browser hat kein Transkript geliefert.';
        const M = mentor();
        if (!(M && M.configured())) { result.innerHTML = `<div class="small muted" style="margin-top:10px">Transkript gespeichert. Für Vorschläge (Emotion, Setup, Fehler) richte den Mentor-Server ein.</div>`; App.rerender(); return; }
        result.innerHTML = `<div class="row" style="margin-top:12px;gap:8px"><span class="dot-live"></span><span class="small muted">Wird ausgewertet …</span></div>`;
        const r = await runAnalysis(tradeId, note.id);
        const fresh = S.getTrade(tradeId);
        if (r && r.ok) { result.innerHTML = `<div class="caption" style="margin-top:14px">Vorschläge</div>${suggestionsHTML(fresh, r.note.analysis)}`; result.dataset.trade = tradeId; result.dataset.voice = note.id; }
        else result.innerHTML = `<div class="banner warn" style="margin-top:12px">${I.warning}<div class="grow"><b>${esc((r && r.error) || 'Auswertung fehlgeschlagen')}</b><span>${r && r.retry ? 'Die Aufnahme ist gespeichert. Du kannst sie in der Trade-Ansicht erneut senden.' : ''}</span></div></div>`;
        App.rerender();
      };
      rec.start(250); active = { rec, stream, recog, timer: null };
      startBtn.innerHTML = `${I.stop} Stopp`; startBtn.classList.add('danger'); status.textContent = recog ? 'Aufnahme läuft, Transkription aktiv …' : 'Aufnahme läuft (keine Transkription in diesem Browser) …'; result.innerHTML = '';
      active.timer = setInterval(() => { const el = (performance.now() - started) / 1000; const left = Math.max(0, MAX_SEC - el); time.textContent = `0:${String(Math.ceil(left)).padStart(2, '0')}`; prog.style.strokeDashoffset = (CIRC * (1 - left / MAX_SEC)).toFixed(1); if (left <= 0 && active) { try { active.rec.stop(); } catch (e) { /* ignorieren */ } } }, 200);
    });
    result.addEventListener('click', e => { const b = e.target.closest('[data-action=voice-apply]'); if (!b) return; e.preventDefault(); e.stopPropagation(); const t = S.getTrade(result.dataset.trade); const v = t && (t.voiceNotes || []).find(x => x.id === result.dataset.voice); if (!t || !v || !v.analysis) return; apply(t, v.analysis, b.dataset.kind, b.dataset.value); result.innerHTML = `<div class="caption" style="margin-top:14px">Vorschläge</div>${suggestionsHTML(S.getTrade(t.id), v.analysis)}`; App.rerender(); });
  }

  /* ---------- Anbindung ---------- */
  App.openVoiceRecorder = open;
  Object.assign(App.actions, {
    'voice-open'(el) { open(el.dataset.trade); },
    /* Dashboard-Schnellzugriff: Sprachnotiz zum zuletzt gehandelten Trade */
    'voice-last'() { const all = App.allTrades(); if (!all.length) return U.toast('Noch kein Trade vorhanden', 'err'); const last = all.slice().sort((a, b) => b.sortTime - a.sortTime)[0]; open(last.id); },
    async 'voice-retry'(el) { el.disabled = true; const r = await runAnalysis(el.dataset.trade, el.dataset.voice); U.toast(r && r.ok ? 'Auswertung da' : (r && r.error) || 'Fehlgeschlagen', r && r.ok ? 'ok' : 'err'); App.rerender(); },
    'voice-apply'(el) { const t = S.getTrade(el.dataset.trade); const v = t && (t.voiceNotes || []).find(x => x.id === el.dataset.voice); if (!t || !v || !v.analysis) return; apply(t, v.analysis, el.dataset.kind, el.dataset.value); App.rerender(); },
  });
  root.Voice = { open, runAnalysis, suggestionsHTML, pickMime, MAX_SEC };
})(typeof self !== 'undefined' ? self : this);
