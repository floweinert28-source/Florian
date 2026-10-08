/* Coach Mode, Datenseite: Schlüssel, Server-Aufrufe und der Abgleich mit dem Mentor-Server (server/coach.py).
   Der Mentor sieht von einem Schüler genau zwei Dinge: Journal-Einträge (Notebook ohne Trade-Notizen) und Kurz-Stats
   als Tages-Summen in R und Prozent. Einzelne Trades, Beträge, Kontostände, Playbooks und Einstellungen verlassen das
   Gerät nie: snapshot() baut nur diese zwei Teile, und mehr Endpunkte gibt es auf dem Server nicht.
   Wer ist wer: beim ersten Öffnen entsteht ein geheimer Schlüssel (nur hier gespeichert, Kopfzeile X-Coach-Key). */
(function (root) {
  'use strict';
  const C = root.Core, S = root.Store, U = root.UI, App = root.App;
  const mentor = () => root.Mentor;
  const data = () => { const d = S.data; if (!d.coach || typeof d.coach !== 'object') d.coach = {}; const c = d.coach; if (!Array.isArray(c.groups)) c.groups = []; if (!Array.isArray(c.own)) c.own = []; if (!Array.isArray(c.notes)) c.notes = []; if (!c.seen || typeof c.seen !== 'object') c.seen = {}; if (!c.assets || typeof c.assets !== 'object') c.assets = {}; return c; };

  /* Sichtbarkeits-Liste: steht vor dem Beitritt und in der Übersicht; dieselbe Liste wie im Konzept */
  const VISIBILITY = [
    ['Journal-Einträge (Notebook, ohne Trade-Notizen)', true, 'nur lesen'],
    ['Kurz-Stats', true, 'nur R und Prozent, keine Beträge'],
    ['Mentor-Notizen', true, 'schreibt er selbst'],
    ['Bilder und Charts im Journal-Eintrag', true, ''],
    ['Einzelne Trades und TradeLog', false, ''],
    ['Playbooks und Strategien', false, ''],
    ['Kontostand und Broker-Verbindung', false, ''],
    ['Private Notizen außerhalb des Journals', false, ''],
  ];

  function randomKey() {
    const b = new Uint8Array(24); (root.crypto || {}).getRandomValues ? root.crypto.getRandomValues(b) : b.forEach((_, i) => { b[i] = Math.floor(Math.random() * 256); });
    return btoa(String.fromCharCode(...b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function key() { const c = data(); if (!c.key) { c.key = randomKey(); S.save(); } return c.key; }
  const configured = () => !!(mentor() && mentor().configured());
  const baseUrl = () => String((S.settings.mentor || {}).url || '').trim().replace(/\/+$/, '');
  const myName = () => { const p = S.settings.profile || {}; const c = data(); return String(c.name || p.firstName || p.username || S.settings.name || '').trim(); };

  async function api(path, opts) {
    const o = Object.assign({}, opts || {}); const h = Object.assign({ 'Content-Type': 'application/json', 'X-Coach-Key': key() }, o.headers || {});
    const tok = String((S.settings.mentor || {}).token || '').trim(); if (tok) h.Authorization = 'Bearer ' + tok; o.headers = h;
    let r;
    try { r = await fetch(baseUrl() + path, o); }
    catch (e) { const err = new Error('Der Server ist nicht erreichbar. Prüf die Adresse unter Einstellungen → Mentor und deine Verbindung.'); err.status = 0; throw err; }
    let body = null; try { body = await r.json(); } catch (e) { /* keine JSON-Antwort */ }
    if (!r.ok) { const d = body && body.detail; const msg = (Array.isArray(d) && d.map(x => x && x.msg).filter(Boolean).join(' ')) || (d && typeof d === 'object' && !Array.isArray(d) && d.message) || (typeof d === 'string' && d) || `Server antwortet mit ${r.status}`; const err = new Error(msg); err.status = r.status; err.code = d && d.error; throw err; }
    return body;
  }

  /* ---------- Was geteilt wird ---------- */
  const sharedNotes = () => S.notes().filter(n => n.type !== 'trade' && n.folderId !== 'trades' && n.id !== 'welcome' && S.hasContent(n.content));
  const noteDateKey = n => n.dateKey || C.dayKey(new Date(n.createdAt));
  /* frühester Stichtag über alle Gruppen: eine Gruppe ohne Stichtag = alles */
  function since() { const g = data().groups; if (!g.length) return null; if (g.some(x => !x.since)) return null; return g.map(x => x.since).sort()[0]; }

  /* Bilder: Verweise auf den lokalen Bildspeicher werden zu Adressen auf dem Server (einmal hochladen, Zuordnung merken) */
  async function uploadFigure(id) {
    const c = data(); if (c.assets[id]) return c.assets[id];
    if (!root.Blobs) return null;
    let blob; try { blob = await root.Blobs.get(id); } catch (e) { blob = null; }
    if (!blob || !/^image\/(png|jpeg|webp|gif)$/.test(blob.type) || blob.size > 1500000) return null;
    const b64 = await new Promise(res => { const rd = new FileReader(); rd.onload = () => res(String(rd.result).split(',')[1] || ''); rd.onerror = () => res(''); rd.readAsDataURL(blob); });
    if (!b64) return null;
    const r = await api('/api/coach/assets', { method: 'POST', body: JSON.stringify({ mime: blob.type, data: b64 }) });
    c.assets[id] = baseUrl() + r.url; S.save(); return c.assets[id];
  }
  async function exportContent(delta) {
    const ops = []; for (const o of (delta && delta.ops) || []) {
      if (o.insert && typeof o.insert === 'object' && o.insert.figure) {
        const f = o.insert.figure; let src = f.src && /^(data:image|https?:)/.test(f.src) ? f.src : null;
        if (!src && f.id) { try { src = await uploadFigure(f.id); } catch (e) { src = null; } }
        ops.push(src ? Object.assign({}, o, { insert: { figure: { src, caption: f.caption || '' } } }) : { insert: '[Bild]\n' });
      } else if (o.insert && typeof o.insert === 'object' && o.insert.video) ops.push({ insert: '[Video]\n' });
      else ops.push(o);
    }
    return JSON.stringify({ ops });
  }
  /* Tages-Summen nur aus abgeschlossenen Trades: Anzahl, Gewinne, Verluste, R-Summen, Ergebnis in R und in Prozent der Kontogröße */
  function dayStats(cut) {
    const sizes = {}; for (const a of S.data.accounts || []) sizes[a.id] = Number(a.size) || 0;
    const m = new Map();
    for (const t of C.closedOnly(C.deriveAll(S.trades()))) {
      const k = C.dayKey(t.close); if (cut && k < cut) continue;
      const d = m.get(k) || { date: k, n: 0, wins: 0, losses: 0, be: 0, win_r: 0, loss_r: 0, win_n_r: 0, loss_n_r: 0, pnl_r: 0, pnl_pct: 0 };
      d.n++; if (t.status === 'win') d.wins++; else if (t.status === 'loss') d.losses++; else d.be++;
      if (t.r != null) { d.pnl_r += t.r; if (t.r > 0) { d.win_r += t.r; d.win_n_r++; } else if (t.r < 0) { d.loss_r += t.r; d.loss_n_r++; } }
      const size = sizes[t.accountId] || 0; if (size > 0) d.pnl_pct += t.pnl / size * 100;
      m.set(k, d);
    }
    return [...m.values()].sort((a, b) => a.date.localeCompare(b.date)).map(d => ({ date: d.date, n: d.n, wins: d.wins, losses: d.losses, be: d.be, win_r: +d.win_r.toFixed(4), loss_r: +d.loss_r.toFixed(4), win_n_r: d.win_n_r, loss_n_r: d.loss_n_r, pnl_r: +d.pnl_r.toFixed(4), pnl_pct: +d.pnl_pct.toFixed(4) }));
  }
  async function snapshot() {
    const cut = since(); const entries = [];
    for (const n of sharedNotes()) { const dk = noteDateKey(n); if (cut && dk < cut) continue; entries.push({ id: n.id, title: n.title || '', content: await exportContent(n.content), date_key: dk, created_at: n.createdAt, updated_at: n.updatedAt || n.createdAt }); }
    return { entries, days: dayStats(cut) };
  }

  /* ---------- Abgleich ---------- */
  const state = { syncing: false, timer: null, lastError: '', lastHash: '', lastAt: null };
  const hashOf = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return String(h); };
  function takeNotes(list, groups) {
    const c = data(); const before = new Set(c.notes.map(n => n.id)); const fresh = [];
    const keep = c.notes.filter(n => n.local); /* Notizen verlassener Gruppen bleiben als Kopie (local) */
    const activeIds = new Set((groups || c.groups).map(g => g.group_id));
    for (const old of c.notes) if (!old.local && !activeIds.has(old.group_id) && !old.deleted_at) keep.push(Object.assign({}, old, { local: true }));
    for (const n of list || []) { if (n.deleted_at) { delete c.seen[n.id]; continue; } keep.push(n); if (!before.has(n.id) && !c.seen[n.id]) fresh.push(n); }
    const seenIds = new Set(keep.map(n => n.id)); c.notes = keep.filter((n, i, a) => a.findIndex(x => x.id === n.id) === i); for (const id of Object.keys(c.seen)) if (!seenIds.has(id)) delete c.seen[id];
    return fresh;
  }
  async function me(name) {
    const r = await api('/api/coach/me', { method: 'POST', body: JSON.stringify({ name: name != null ? name : myName() }) });
    const c = data(); c.userId = r.user.id; if (r.user.name) c.name = r.user.name; c.groups = r.groups || []; c.own = r.own || []; S.save();
    return r;
  }
  async function sync(o = {}) {
    if (!configured() || state.syncing) return null; const c = data(); if (!c.groups.length) return null;
    state.syncing = true; state.lastError = '';
    try {
      const snap = await snapshot(); const body = JSON.stringify(snap); const h = hashOf(body);
      let r;
      if (!o.force && h === state.lastHash) r = await api('/api/coach/notes');
      else { r = await api('/api/coach/sync', { method: 'PUT', body }); state.lastHash = h; }
      c.groups = r.groups || c.groups; const fresh = takeNotes(r.notes, c.groups); state.lastAt = new Date().toISOString(); c.lastSync = state.lastAt; S.save();
      if (fresh.length) { U.toast(fresh.length === 1 ? `Neue Mentor-Notiz von ${fresh[0].mentor_name || 'deinem Mentor'}` : `${fresh.length} neue Mentor-Notizen`, 'ok'); const typing = document.activeElement && document.activeElement.closest && document.activeElement.closest('.ql-editor, .note-title'); if (App.state.route === 'notebook' && !typing) App.rerender(); else App.renderSidebar(); }
      return r;
    } catch (e) { state.lastError = e.message || String(e); if (e.status === 403 && e.code === 'member') { c.groups = []; S.save(); } return null; }
    finally { state.syncing = false; }
  }
  function schedule(ms = 2500) { if (!configured() || !data().groups.length) return; clearTimeout(state.timer); state.timer = setTimeout(() => { sync(); }, ms); }

  /* Notizen des Mentors zu einem Eintrag (für das Notebook) und ungelesene insgesamt (für den Hinweis-Punkt) */
  const notesFor = noteId => data().notes.filter(n => n.entry_id === noteId && !n.deleted_at).sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
  const unread = () => data().notes.filter(n => !n.deleted_at && !data().seen[n.id]);
  /* Notizen aus Gruppen, in denen man nicht mehr ist, bleiben als Kopie (werden bei späteren Abgleichen nicht entfernt) */
  function markLocal() { const c = data(); const active = new Set(c.groups.map(g => g.group_id)); let changed = false; for (const n of c.notes) if (!n.local && !active.has(n.group_id)) { n.local = true; changed = true; } if (changed) S.save(); }
  function markSeen(noteId) { const c = data(); let changed = false; for (const n of c.notes) if (n.entry_id === noteId && !c.seen[n.id]) { c.seen[n.id] = new Date().toISOString(); changed = true; } if (changed) { S.save(); App.renderSidebar(); } }

  /* Start: Mitgliedschaften und Notizen holen, danach bei jeder Änderung nach kurzer Pause abgleichen */
  function boot() {
    if (!S.onChange) return;
    S.onChange(() => schedule());
    if (configured() && data().groups.length) setTimeout(() => { sync({ force: true }); }, 1500);
    setInterval(() => { if (configured() && data().groups.length && !state.syncing) sync(); }, 5 * 60 * 1000);
  }

  root.Coach = { VISIBILITY, api, key, configured, baseUrl, myName, data, me, sync, schedule, snapshot, dayStats, sharedNotes, notesFor, unread, markSeen, markLocal, state, since, boot };
})(typeof self !== 'undefined' ? self : this);
