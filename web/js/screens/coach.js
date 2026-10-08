/* Coach Mode, Seiten: Übersicht (als Mentor und als Schüler), Mentor-Dashboard einer Gruppe mit Kurz-Stats,
   Journal-Ansicht eines Schülers mit Mentor-Notizen, Beitritt über den Einladungslink (#/coach/join/<token>).
   Daten und Abgleich: js/coach.js; Server: server/coach.py. Der Mentor sieht nie Trades oder Beträge, nur R und Prozent. */
(function (root) {
  'use strict';
  const C = root.Core, S = root.Store, U = root.UI, I = U.I, esc = U.esc, fmt = U.fmt, App = root.App, Co = root.Coach;
  if (!Co) return;
  const PERIODS = [['week', 'Woche'], ['month', 'Monat'], ['all', 'Gesamt']];
  const st = () => App.state.coach || (App.state.coach = { period: 'month', loading: false, error: '', key: '', group: null, journal: null, invite: null, draft: {}, editing: null, editText: '' });
  const inviteLink = token => location.href.split('#')[0] + '#/coach/join/' + encodeURIComponent(token);
  const back = (href, label) => `<a class="btn ghost sm coach-back" href="${href}">${I.back}<span>${esc(label)}</span></a>`;
  const num = (v, d = 2) => v == null ? '<span class="faint">—</span>' : esc(fmt.num(v, d));
  const sinceText = m => m.since ? `Einträge ab ${fmt.dateFull(C.parseDayKey(m.since))}` : 'Alle Einträge';

  /* ---------- Bausteine ---------- */
  function setup() {
    return `<div class="coach-wrap"><section class="card mentor-setup"><span class="ico">${I.coach}</span><h2>Coach Mode einrichten</h2><p class="muted">Coach Mode läuft über denselben Server wie der Mentor-Chat. Trag unter Einstellungen → Mentor die Server-Adresse und das Zugangstoken ein; danach kannst du hier Gruppen anlegen oder einer Gruppe beitreten.</p><a class="btn primary" href="#/settings/mentor">${I.settings} Zu den Einstellungen</a></section></div>`;
  }
  function visibilityTable() {
    return `<div class="tbl-wrap inset"><table class="tbl compact wrap coach-vis"><thead><tr><th>Bereich</th><th>Dein Mentor</th></tr></thead><tbody>${Co.VISIBILITY.map(([area, yes, hint]) => `<tr><td>${esc(area)}</td><td class="${yes ? '' : 'muted'}">${yes ? `<span class="coach-yes">${I.check} ${esc(hint || 'sieht es')}</span>` : `<span class="coach-no">${I.close} sieht es nicht</span>`}</td></tr>`).join('')}</tbody></table></div>`;
  }
  function errorBox(msg, retry) { return U.banner('warn', '', `${esc(msg)}${retry ? ` <button type="button" class="btn xs" data-action="${retry}">Erneut versuchen</button>` : ''}`); }
  const loading = () => `<div class="coach-loading">${U.loader('', 'Lädt')}</div>`;

  /* ---------- Übersicht ---------- */
  function hub() {
    const s = st(); const c = Co.data(); const unread = Co.unread().length; const notes = c.notes.filter(n => !n.deleted_at).length;
    const own = c.own.length ? `<div class="coach-list">${c.own.map(g => `<div class="coach-row"><div class="grow"><a class="coach-name no-i18n" href="#/coach/g/${esc(g.id)}">${esc(g.name)}</a><div class="small muted">${g.members === 1 ? '1 Schüler' : `${g.members} Schüler`}</div></div><button type="button" class="btn sm ghost" data-action="coach-copy-link" data-token="${esc(g.invite_token)}" data-tip="Einladungslink kopieren">${I.copy}<span class="hide-m">Link</span></button><a class="btn sm" href="#/coach/g/${esc(g.id)}">Öffnen</a></div>`).join('')}</div>`
      : `<p class="muted small coach-hint">Erstelle eine Gruppe und schick den Einladungslink an deine Schüler. Du siehst dann ihre Journal-Einträge und Kurz-Stats und schreibst Notizen direkt dazu.</p>`;
    const mine = c.groups.length ? `<div class="coach-list">${c.groups.map(m => `<div class="coach-row"><div class="grow"><span class="coach-name no-i18n">${esc(m.group_name)}</span><div class="small muted"><span>Mentor:</span> <span class="no-i18n">${esc(m.mentor_name || '—')}</span> · <span>${esc(sinceText(m))}</span></div></div><button type="button" class="btn sm ghost" data-action="coach-leave" data-id="${esc(m.group_id)}" data-name="${esc(m.group_name)}">Verlassen</button></div>`).join('')}</div>
        <div class="row coach-sync small muted"><span>${Co.state.syncing ? 'Wird abgeglichen …' : c.lastSync ? `Zuletzt abgeglichen ${fmt.dateTime(c.lastSync)}` : 'Noch nicht abgeglichen'}${Co.state.lastError ? ` · <span class="warn">${esc(Co.state.lastError)}</span>` : ''}</span><button type="button" class="btn xs ghost" data-action="coach-sync-now">${I.replay} Jetzt abgleichen</button></div>
        ${notes ? `<div class="small muted"><span>${notes === 1 ? '1 Mentor-Notiz' : `${notes} Mentor-Notizen`}</span>${unread ? `<span>, </span><b class="accent">${unread} ungelesen</b>` : ''}<span> · </span><a href="#/notebook">Im Notebook ansehen</a></div>` : ''}`
      : `<p class="muted small coach-hint">Dein Mentor schickt dir einen Einladungslink. Öffne ihn hier in Journalyst. Vor dem Beitritt siehst du genau, was er sehen wird.</p>`;
    return `<div class="coach-wrap">
      ${s.error ? errorBox(s.error, 'coach-refresh') : ''}
      <div class="grid two start">
        ${U.card('Als Mentor', own, { info: 'Du siehst von jedem Schüler nur Journal-Einträge und Kurz-Stats in R und Prozent. Schüler sehen sich gegenseitig nicht.', trailing: `<button type="button" class="btn sm primary" data-action="coach-create-group">${I.plus} Gruppe</button>` })}
        ${U.card('Als Schüler', mine, { info: 'Nur Journal-Einträge und Kurz-Stats werden geteilt. Trades, Beträge, Kontostand und private Notizen bleiben bei dir.', trailing: `<button type="button" class="btn sm ghost" data-action="coach-visibility">${I.eye} Was der Mentor sieht</button>` })}
      </div>
      <p class="small muted coach-foot"><span>Dein Name im Coach Mode:</span> <b class="no-i18n">${esc(Co.myName() || '—')}</b> <span>(aus dem Profil, beim Beitritt änderbar).</span> ${s.loading ? U.loader('sm', 'Lädt') : ''}</p>
    </div>`;
  }

  /* ---------- Mentor: Gruppe ---------- */
  function statsRow(r, gid) {
    const x = r.stats || {}; const pf = x.pf == null ? (x.wins ? '∞' : '<span class="faint">—</span>') : esc(fmt.num(x.pf, 2));
    const dd = x.max_dd_pct == null ? '<span class="faint">—</span>' : `<span class="${x.max_dd_pct > 0 ? 'neg' : ''}" data-tip="${x.max_dd_r == null ? '' : esc(fmt.r(-x.max_dd_r))}">−${esc(fmt.num(x.max_dd_pct, 1))} %</span>`;
    return `<tr class="link" data-action="coach-open-student" data-gid="${esc(gid)}" data-sid="${esc(r.user_id)}"><td><span class="sym no-i18n">${esc(r.name)}</span>${r.new ? ` ${U.pill(`${r.new} neu`, 'win')}` : ''}</td><td class="r">${x.n ? esc(String(x.n)) : '<span class="faint">0</span>'}</td><td class="r">${x.win_rate == null ? '<span class="faint">—</span>' : esc(fmt.pct(x.win_rate, 0))}</td><td class="r">${pf}</td><td class="r">${x.avg_win_r == null ? '<span class="faint">—</span>' : U.rText(x.avg_win_r)}</td><td class="r">${x.avg_loss_r == null ? '<span class="faint">—</span>' : U.rText(x.avg_loss_r)}</td><td class="r">${dd}</td><td class="r">${r.last_entry_key ? esc(fmt.dateFull(C.parseDayKey(r.last_entry_key))) : '<span class="faint">—</span>'}<div class="sub">${r.entries === 1 ? '1 Eintrag' : `${r.entries} Einträge`}</div></td></tr>`;
  }
  function group(gid) {
    const s = st(); const g = s.group && s.group.group && s.group.group.id === gid ? s.group : null; const own = Co.data().own.find(x => x.id === gid);
    const name = g ? g.group.name : own ? own.name : 'Gruppe'; const token = g ? g.group.invite_token : own ? own.invite_token : '';
    const invite = token ? `<div class="coach-invite"><span class="small muted">Einladungslink</span><input class="input sm" readonly value="${esc(inviteLink(token))}" aria-label="Einladungslink" onfocus="this.select()"><button type="button" class="btn sm" data-action="coach-copy-link" data-token="${esc(token)}">${I.copy} Kopieren</button></div>` : '';
    const rows = g ? g.students : null;
    const table = !g ? (s.error ? errorBox(s.error, 'coach-refresh') : loading())
      : !rows.length ? U.empty('coach', 'Noch kein Schüler', 'Schick den Einladungslink. Wer beitritt, erscheint hier mit Kurz-Stats.')
      : `<div class="tbl-wrap"><table class="tbl compact coach-tbl"><thead><tr><th>Schüler</th><th class="r">Trades</th><th class="r">Winrate</th><th class="r">Profit-Faktor</th><th class="r">Ø Gewinn</th><th class="r">Ø Verlust</th><th class="r">Max. Drawdown</th><th class="r">Letzter Eintrag</th></tr></thead><tbody>${rows.map(r => statsRow(r, gid)).join('')}</tbody></table></div>`;
    return `<div class="coach-wrap wide">
      <div class="coach-head"><div class="row">${back('#/coach', 'Coach')}<h2 class="coach-title no-i18n">${esc(name)}</h2></div><div class="row"><div class="popwrap"><button type="button" class="btn ghost icon sm" data-pop="coachmenu" aria-label="Mehr">${I.more}</button><div class="popover right" id="pop-coachmenu"><button type="button" class="item" data-action="coach-rename" data-id="${esc(gid)}" data-name="${esc(name)}">${I.edit} Umbenennen</button><button type="button" class="item" data-action="coach-rotate" data-id="${esc(gid)}">${I.replay} Neuen Einladungslink erzeugen</button><hr><button type="button" class="item danger" data-action="coach-archive" data-id="${esc(gid)}" data-name="${esc(name)}">${I.trash} Gruppe schließen</button></div></div></div></div>
      ${invite}
      ${U.card('Schüler', `<div class="row between coach-ctl">${U.seg(PERIODS, s.period, 'coach-period')}<span class="small muted">Kurz-Stats nur in R und Prozent${g && g.period_start ? ` · ab ${esc(fmt.dateFull(C.parseDayKey(g.period_start)))}` : ''}</span></div>${table}`, { info: 'Pro Schüler: Trades, Winrate, Profit-Faktor (R), Ø Gewinn und Ø Verlust in R, größter Rückgang in Prozent der Kontogröße, letzter Journal-Eintrag und neue Einträge seit deinem letzten Besuch. Klick auf eine Zeile öffnet das Journal.', trailing: `<button type="button" class="btn sm ghost" data-action="coach-refresh" ${s.loading ? 'disabled' : ''}>${I.replay}<span class="hide-m">Aktualisieren</span></button>` })}
    </div>`;
  }

  /* ---------- Mentor: Journal eines Schülers ---------- */
  function noteHTML(n, own) {
    const s = st(); const editing = s.editing === n.id;
    return `<div class="mentor-note" data-note="${esc(n.id)}"><div class="mn-head">${U.pill('Mentor', 'warn')}<b class="no-i18n">${esc(n.mentor_name || 'Mentor')}</b><span class="muted small"><span class="no-i18n">${esc(fmt.dateTime(n.created_at))}</span>${n.updated_at && n.updated_at !== n.created_at ? '<span> · bearbeitet</span>' : ''}</span>${own && !editing ? `<span class="grow"></span><button type="button" class="btn xs ghost" data-action="coach-note-edit" data-id="${esc(n.id)}">${I.edit} Bearbeiten</button><button type="button" class="btn xs ghost" data-action="coach-note-delete" data-id="${esc(n.id)}">${I.trash} Löschen</button>` : ''}</div>
      ${editing ? `<textarea class="input mn-edit" data-input="coach-note-edit-text" rows="3" aria-label="Notiz bearbeiten">${esc(s.editText)}</textarea><div class="row"><button type="button" class="btn sm primary" data-action="coach-note-save" data-id="${esc(n.id)}">Speichern</button><button type="button" class="btn sm ghost" data-action="coach-note-cancel">Abbrechen</button></div>` : `<div class="mn-text">${esc(n.text)}</div>`}</div>`;
  }
  function entryHTML(e, notes, gid, sid) {
    const s = st(); let html = '';
    try { const d = JSON.parse(e.content || '{}'); html = root.NoteEditor ? root.NoteEditor.toHTML({ ops: (d.ops || []).filter(o => typeof o.insert === 'string' || (o.insert && (o.insert.figure || o.insert.divider || o.insert.details))) }) : esc(S.deltaText(d)); } catch (err) { html = ''; }
    const own = notes.filter(n => n.entry_id === e.id);
    return `<section class="card coach-entry ${e.is_new ? 'is-new' : ''}" data-entry="${esc(e.id)}">
      <div class="ce-head"><div><div class="ce-date">${esc(fmt.dateFull(C.parseDayKey(e.date_key)))}${e.is_new ? ` ${U.pill('Neu', 'win')}` : ''}</div><h3 class="ce-title ${e.title ? 'no-i18n' : ''}">${esc(e.title || 'Ohne Titel')}</h3></div><span class="small muted no-i18n">${esc(fmt.dateTime(e.updated_at))}</span></div>
      <div class="ql-container ql-snow ce-body"><div class="ql-editor">${html}</div></div>
      ${own.length ? `<div class="mentor-notes">${own.map(n => noteHTML(n, true)).join('')}</div>` : ''}
      <div class="ce-write"><textarea class="input" rows="2" placeholder="Notiz an den Schüler …" data-input="coach-note-draft" data-id="${esc(e.id)}" aria-label="Notiz schreiben">${esc(s.draft[e.id] || '')}</textarea><button type="button" class="btn sm primary" data-action="coach-note-send" data-gid="${esc(gid)}" data-sid="${esc(sid)}" data-id="${esc(e.id)}" ${(s.draft[e.id] || '').trim() ? '' : 'disabled'}>${I.chat} Notiz senden</button></div>
    </section>`;
  }
  function journal(gid, sid) {
    const s = st(); const j = s.journal && s.journal.gid === gid && s.journal.student.id === sid ? s.journal : null;
    const name = j ? j.student.name : 'Schüler';
    const body = !j ? (s.error ? errorBox(s.error, 'coach-refresh') : loading())
      : !j.entries.length ? U.empty('journal', 'Noch keine Einträge', `${esc(name)} hat im geteilten Zeitraum noch nichts ins Journal geschrieben.`)
      : j.entries.map(e => entryHTML(e, j.notes, gid, sid)).join('');
    return `<div class="coach-wrap">
      <div class="coach-head"><div class="row">${back('#/coach/g/' + encodeURIComponent(gid), 'Gruppe')}<h2 class="coach-title no-i18n">${esc(name)}</h2>${j ? `<span class="small muted"><span>${esc(sinceText(j.student))}</span>${j.entries.length ? `<span> · </span><span>${j.entries.length === 1 ? '1 Eintrag' : `${j.entries.length} Einträge`}</span>` : ''}</span>` : ''}</div><button type="button" class="btn sm ghost" data-action="coach-refresh" ${s.loading ? 'disabled' : ''}>${I.replay}<span class="hide-m">Aktualisieren</span></button></div>
      <p class="small muted coach-hint">Nur lesen. Deine Notizen erscheinen beim Schüler unter dem Eintrag, mit deinem Namen und der Uhrzeit. Er kann sie nicht ändern.</p>
      <div class="coach-entries">${body}</div>
    </div>`;
  }

  /* ---------- Schüler: Beitritt ---------- */
  function join(token) {
    const s = st(); const inv = s.invite && s.invite.token === token ? s.invite : null;
    if (!inv) return `<div class="coach-wrap">${s.error ? `<section class="card">${errorBox(s.error, 'coach-refresh')}<div class="row" style="margin-top:12px">${back('#/coach', 'Coach')}</div></section>` : loading()}</div>`;
    if (inv.own) return `<div class="coach-wrap">${U.card('Einladung', `<p><span>Das ist dein eigener Einladungslink für</span> <b class="no-i18n">${esc(inv.group.name)}</b>. <span>Schick ihn an deine Schüler.</span></p><div class="row">${back('#/coach/g/' + encodeURIComponent(inv.group.id), 'Zur Gruppe')}</div>`)}</div>`;
    if (inv.member) return `<div class="coach-wrap">${U.card('Einladung', `<p><span>Du bist schon in der Gruppe</span> <b class="no-i18n">${esc(inv.group.name)}</b> <span>von</span> <span class="no-i18n">${esc(inv.mentor || 'deinem Mentor')}</span>.</p><div class="row">${back('#/coach', 'Coach')}</div>`)}</div>`;
    return `<div class="coach-wrap"><form class="card coach-join" data-action="coach-join" data-token="${esc(token)}">
      <div class="coach-join-head"><span class="ico">${I.coach}</span><h2><span>Einladung von</span> <span class="no-i18n">${esc(inv.mentor || 'deinem Mentor')}</span></h2><p class="muted"><span>Gruppe</span> <b class="no-i18n">${esc(inv.group.name)}</b><br><span>Bevor du beitrittst: Das und nur das sieht dein Mentor.</span></p></div>
      ${visibilityTable()}
      <div class="grid two" style="margin-top:14px">
        <div class="field"><label for="coach-name">Dein Name für den Mentor</label><input class="input" id="coach-name" name="name" value="${esc(Co.myName())}" maxlength="80" required placeholder="Vorname"></div>
        <div class="field"><span class="lbl">Welche Einträge</span><div class="coach-since"><label class="coach-radio"><input type="radio" name="since" value="today" checked><span><b>Nur ab heute</b><small>Ältere Einträge und Trades bleiben privat.</small></span></label><label class="coach-radio"><input type="radio" name="since" value="all"><span><b>Auch ältere</b><small>Der Mentor sieht auch frühere Journal-Einträge und Kurz-Stats.</small></span></label></div></div>
      </div>
      <div class="row coach-join-foot"><button type="submit" class="btn primary" ${s.loading ? 'disabled' : ''}>${I.check} Beitreten</button><a class="btn ghost" href="#/coach">Abbrechen</a><span class="small muted">Du kannst die Gruppe jederzeit verlassen; dann sieht der Mentor nichts mehr von dir.</span></div>
    </form></div>`;
  }

  /* ---------- Laden ---------- */
  const keyOf = v => [v[0], v[1] || '', v[2] || '', st().period].join('|');
  async function load(v) {
    const s = st(); const kind = v[0], a = v[1], b = v[2]; const key = keyOf(v); if (s.loading && s.key === key) return; s.loading = true; s.key = key; s.error = '';
    try {
      if (kind === 'hub') { await Co.me(); s.hubAt = Date.now(); if (Co.data().groups.length) Co.sync(); }
      else if (kind === 'group') { s.group = await Co.api(`/api/coach/groups/${encodeURIComponent(a)}/students?period=${s.period}`); }
      else if (kind === 'journal') { const r = await Co.api(`/api/coach/groups/${encodeURIComponent(a)}/students/${encodeURIComponent(b)}/journal`); s.journal = Object.assign({ gid: a }, r); }
      else if (kind === 'join') { const r = await Co.api(`/api/coach/invite/${encodeURIComponent(a)}`); s.invite = Object.assign({ token: a }, r); }
    } catch (e) { s.error = e.message || String(e); }
    finally { s.loading = false; if (App.state.route === 'coach') App.rerender(); }
  }
  const viewOf = params => params[0] === 'join' && params[1] ? ['join', params[1]] : params[0] === 'g' && params[1] && params[2] === 's' && params[3] ? ['journal', params[1], params[3]] : params[0] === 'g' && params[1] ? ['group', params[1]] : ['hub'];

  App.screens.coach = {
    title: 'Coach',
    head: { range: false, account: false, session: false, trade: false },
    render(ctx) {
      if (!Co.configured()) return setup();
      const v = viewOf(ctx.params);
      if (v[0] === 'join') return join(v[1]);
      if (v[0] === 'journal') return journal(v[1], v[2]);
      if (v[0] === 'group') return group(v[1]);
      return hub();
    },
    mount(main, ctx) {
      if (!Co.configured()) return;
      /* Übersicht höchstens alle 30 s neu vom Server (jeder Neuaufbau ruft mount); Gruppe, Journal und Einladung, sobald sie fehlen */
      const s = st(); const v = viewOf(ctx.params); const key = keyOf(v);
      const have = v[0] === 'hub' ? (s.hubAt && Date.now() - s.hubAt < 30000) : v[0] === 'group' ? s.group && s.group.group && s.group.group.id === v[1] && s.group.period === s.period : v[0] === 'journal' ? s.journal && s.journal.gid === v[1] && s.journal.student.id === v[2] : s.invite && s.invite.token === v[1];
      const entered = s.lastKey !== key; s.lastKey = key; /* neu betreten (Navigation): frisch vom Server; Neuaufbau in derselben Ansicht: aus dem Zwischenspeicher */
      if ((!have || entered) && !s.loading && !(s.error && s.key === key)) load(v); /* nach einem Fehler erst wieder über „Erneut versuchen“ */
    },
  };

  /* Notizen des Mentors im Notebook des Schülers (unter dem Eintrag), nur lesen */
  function notesBlock(noteId) {
    const list = Co.notesFor(noteId); if (!list.length) return '';
    return `<div class="mentor-notes in-note"><div class="small muted mn-title">${list.length === 1 ? 'Notiz deines Mentors' : 'Notizen deines Mentors'}</div>${list.map(n => `<div class="mentor-note"><div class="mn-head">${U.pill('Mentor', 'warn')}<b class="no-i18n">${esc(n.mentor_name || 'Mentor')}</b><span class="muted small no-i18n">${esc(n.group_name || '')}${n.group_name ? ' · ' : ''}${esc(fmt.dateTime(n.created_at))}</span></div><div class="mn-text">${esc(n.text)}</div></div>`).join('')}</div>`;
  }
  root.CoachUI = { notesBlock };

  /* Hinweis-Punkt am Notebook: neue Mentor-Notizen, sonst die bisherige Prüfung */
  const prevDot = App.dots.notebook;
  App.navDot('notebook', c => { const u = Co.unread().length; if (u) return u === 1 ? '1 neue Mentor-Notiz' : `${u} neue Mentor-Notizen`; return prevDot ? prevDot(c) : null; });

  /* ---------- Aktionen ---------- */
  const fail = e => U.toast(e && e.message ? e.message : 'Das hat nicht geklappt', 'err');
  async function copyText(text) { try { await navigator.clipboard.writeText(text); return true; } catch (e) { try { const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); return ok; } catch (e2) { return false; } } }
  Object.assign(App.actions, {
    async 'coach-create-group'() {
      const name = await U.promptModal('Neue Gruppe', { label: 'Name der Gruppe', placeholder: 'Kurs Herbst 2026', ok: 'Erstellen' }); if (!name) return;
      try { const r = await Co.api('/api/coach/groups', { method: 'POST', body: JSON.stringify({ name }) }); await Co.me(); U.toast('Gruppe erstellt. Kopiere den Einladungslink.', 'ok'); App.navigate('#/coach/g/' + encodeURIComponent(r.group.id)); } catch (e) { fail(e); }
    },
    async 'coach-copy-link'(el) { const ok = await copyText(inviteLink(el.dataset.token)); U.toast(ok ? 'Einladungslink kopiert' : 'Kopieren nicht möglich, bitte den Link markieren', ok ? 'ok' : 'err'); },
    async 'coach-rename'(el) {
      const name = await U.promptModal('Gruppe umbenennen', { label: 'Name', value: el.dataset.name, ok: 'Speichern' }); if (!name || name === el.dataset.name) return;
      try { await Co.api(`/api/coach/groups/${encodeURIComponent(el.dataset.id)}`, { method: 'PATCH', body: JSON.stringify({ name }) }); await Co.me(); st().group = null; App.rerender(); } catch (e) { fail(e); }
    },
    async 'coach-rotate'(el) {
      if (!await U.confirmModal('Neuen Einladungslink erzeugen?', 'Der alte Link funktioniert danach nicht mehr. Wer schon in der Gruppe ist, bleibt drin.', { ok: 'Neuen Link erzeugen' })) return;
      try { await Co.api(`/api/coach/groups/${encodeURIComponent(el.dataset.id)}/invite/rotate`, { method: 'POST' }); await Co.me(); st().group = null; App.rerender(); U.toast('Neuer Einladungslink', 'ok'); } catch (e) { fail(e); }
    },
    async 'coach-archive'(el) {
      if (!await U.confirmModal('Gruppe schließen?', `„${el.dataset.name}“ wird geschlossen. Alle Schüler verlassen die Gruppe, du siehst ihre Einträge nicht mehr. Ihre Mentor-Notizen behalten sie.`, { ok: 'Gruppe schließen', danger: true })) return;
      try { await Co.api(`/api/coach/groups/${encodeURIComponent(el.dataset.id)}`, { method: 'DELETE' }); await Co.me(); st().group = null; U.toast('Gruppe geschlossen'); App.navigate('#/coach'); } catch (e) { fail(e); }
    },
    'coach-period'(el) { const s = st(); s.period = PERIODS.some(p => p[0] === el.dataset.value) ? el.dataset.value : 'month'; s.group = null; App.rerender(); },
    'coach-open-student'(el) { App.navigate(`#/coach/g/${encodeURIComponent(el.dataset.gid)}/s/${encodeURIComponent(el.dataset.sid)}`); },
    'coach-refresh'() { const s = st(); s.group = null; s.journal = null; s.invite = null; s.key = ''; s.error = ''; s.hubAt = 0; App.rerender(); },
    'coach-visibility'() { U.modal(`<div class="modal-head"><h2>Was dein Mentor sieht</h2><button type="button" class="btn ghost icon" data-close aria-label="Schließen">${I.close}</button></div>${visibilityTable()}<p class="small muted" style="margin-top:12px">Diese Liste bestätigst du beim Beitritt. Verlässt du die Gruppe, verliert der Mentor sofort jeden Zugriff.</p>`); },
    'coach-note-draft'(el) { st().draft[el.dataset.id] = el.value; const btn = el.parentElement && el.parentElement.querySelector('[data-action=coach-note-send]'); if (btn) btn.disabled = !el.value.trim(); },
    async 'coach-note-send'(el) {
      const s = st(); const text = (s.draft[el.dataset.id] || '').trim(); if (!text) return; el.disabled = true;
      try { const r = await Co.api(`/api/coach/groups/${encodeURIComponent(el.dataset.gid)}/students/${encodeURIComponent(el.dataset.sid)}/notes`, { method: 'POST', body: JSON.stringify({ entry_id: el.dataset.id, text }) }); delete s.draft[el.dataset.id]; if (s.journal) s.journal.notes.push(r.note); U.toast('Notiz gesendet', 'ok'); App.rerender(); } catch (e) { el.disabled = false; fail(e); }
    },
    'coach-note-edit'(el) { const s = st(); const n = (s.journal ? s.journal.notes : []).find(x => x.id === el.dataset.id); if (!n) return; s.editing = n.id; s.editText = n.text; App.rerender(); },
    'coach-note-edit-text'(el) { st().editText = el.value; },
    'coach-note-cancel'() { const s = st(); s.editing = null; s.editText = ''; App.rerender(); },
    async 'coach-note-save'(el) {
      const s = st(); const text = s.editText.trim(); if (!text) return;
      try { const r = await Co.api(`/api/coach/notes/${encodeURIComponent(el.dataset.id)}`, { method: 'PATCH', body: JSON.stringify({ text }) }); if (s.journal) s.journal.notes = s.journal.notes.map(n => n.id === r.note.id ? r.note : n); s.editing = null; s.editText = ''; App.rerender(); } catch (e) { fail(e); }
    },
    async 'coach-note-delete'(el) {
      if (!await U.confirmModal('Notiz löschen?', 'Die Notiz verschwindet auch beim Schüler.', { ok: 'Löschen', danger: true })) return;
      try { await Co.api(`/api/coach/notes/${encodeURIComponent(el.dataset.id)}`, { method: 'DELETE' }); const s = st(); if (s.journal) s.journal.notes = s.journal.notes.filter(n => n.id !== el.dataset.id); App.rerender(); } catch (e) { fail(e); }
    },
    async 'coach-join'(form) {
      const s = st(); const fd = new FormData(form); const name = String(fd.get('name') || '').trim(); if (!name) return U.toast('Bitte einen Namen eingeben', 'err');
      const since = fd.get('since') === 'all' ? null : C.dayKey(new Date()); s.loading = true; App.rerender();
      try { await Co.api(`/api/coach/invite/${encodeURIComponent(form.dataset.token)}/join`, { method: 'POST', body: JSON.stringify({ name, since }) }); Co.data().name = name; await Co.me(); s.invite = null; s.loading = false; U.toast('Du bist in der Gruppe. Dein Journal wird jetzt abgeglichen.', 'ok'); App.navigate('#/coach'); Co.sync({ force: true }); }
      catch (e) { s.loading = false; fail(e); App.rerender(); }
    },
    async 'coach-leave'(el) {
      if (!await U.confirmModal('Gruppe verlassen?', `Du verlässt „${el.dataset.name}“. Dein Mentor sieht danach nichts mehr von dir; seine bisherigen Notizen behältst du.`, { ok: 'Verlassen', danger: true })) return;
      try { await Co.api(`/api/coach/groups/${encodeURIComponent(el.dataset.id)}/leave`, { method: 'POST' }); await Co.me(); Co.markLocal(); U.toast('Gruppe verlassen'); App.rerender(); } catch (e) { fail(e); }
    },
    async 'coach-sync-now'() { const r = await Co.sync({ force: true }); U.toast(r ? 'Abgeglichen' : (Co.state.lastError || 'Abgleich nicht möglich'), r ? 'ok' : 'err'); App.rerender(); },
  });

  /* Start, sobald Store und App stehen (das Inline-Skript in app.html lädt vor „load“) */
  const boot = () => { try { Co.boot(); } catch (e) { console.warn(e); } };
  if (document.readyState === 'complete') boot(); else root.addEventListener('load', boot);
})(typeof self !== 'undefined' ? self : this);
