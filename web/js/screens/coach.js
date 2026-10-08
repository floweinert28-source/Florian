/* Coach Mode, Seiten: Übersicht (als Mentor, als Co-Coach, als Schüler; Aufgaben; Benachrichtigungen), Mentor-Dashboard
   einer Gruppe mit Gruppen-Statistik und Kurz-Stats, Journal-Ansicht eines Schülers mit Mentor-Notizen, Antworten und
   Aufgaben, Beitritt über den Einladungslink (#/coach/join/<token>) und als Co-Coach (#/coach/cojoin/<token>).
   Daten und Abgleich: js/coach.js; Server: server/coach.py. Der Mentor sieht nie Trades oder Beträge, nur R und Prozent. */
(function (root) {
  'use strict';
  const C = root.Core, S = root.Store, U = root.UI, I = U.I, esc = U.esc, fmt = U.fmt, App = root.App, Co = root.Coach;
  if (!Co) return;
  const PERIODS = [['week', 'Woche'], ['month', 'Monat'], ['all', 'Gesamt']];
  const st = () => App.state.coach || (App.state.coach = { period: 'month', loading: false, error: '', key: '', group: null, journal: null, invite: null, coInvite: null, draft: {}, rdraft: {}, editing: null, editText: '', mail: null });
  const base = () => location.href.split('#')[0];
  const inviteLink = token => base() + '#/coach/join/' + encodeURIComponent(token);
  const coachLink = token => base() + '#/coach/cojoin/' + encodeURIComponent(token);
  const back = (href, label) => `<a class="btn ghost sm coach-back" href="${href}">${I.back}<span>${esc(label)}</span></a>`;
  const sinceText = m => m.since ? `Einträge ab ${fmt.dateFull(C.parseDayKey(m.since))}` : 'Alle Einträge';
  const dash = '<span class="faint">—</span>';
  const today = () => C.dayKey(new Date());
  const names = list => `<span class="no-i18n">${esc((list || []).filter(Boolean).join(', ') || '—')}</span>`;

  /* ---------- Bausteine ---------- */
  function setup() {
    return `<div class="coach-wrap"><section class="card mentor-setup"><span class="ico">${I.coach}</span><h2>Coach Mode einrichten</h2><p class="muted">Coach Mode läuft über denselben Server wie der Mentor-Chat. Trag unter Einstellungen → Mentor die Server-Adresse und das Zugangstoken ein; danach kannst du hier Gruppen anlegen oder einer Gruppe beitreten.</p><a class="btn primary" href="#/settings/mentor">${I.settings} Zu den Einstellungen</a></section></div>`;
  }
  function visibilityTable() {
    return `<div class="tbl-wrap inset"><table class="tbl compact wrap coach-vis"><thead><tr><th>Bereich</th><th>Dein Mentor</th></tr></thead><tbody>${Co.VISIBILITY.map(([area, yes, hint]) => `<tr><td>${esc(area)}</td><td class="${yes ? '' : 'muted'}">${yes ? `<span class="coach-yes">${I.check} ${esc(hint || 'sieht es')}</span>` : `<span class="coach-no">${I.close} sieht es nicht</span>`}</td></tr>`).join('')}</tbody></table></div>`;
  }
  function errorBox(msg, retry) { return U.banner('warn', '', `${esc(msg)}${retry ? ` <button type="button" class="btn xs" data-action="${retry}">Erneut versuchen</button>` : ''}`); }
  const loading = () => `<div class="coach-loading">${U.loader('', 'Lädt')}</div>`;
  const dueText = t => !t.due ? '' : `<span class="${!t.done_at && t.due < today() ? 'warn' : ''}"><span>bis</span> <span class="no-i18n">${esc(fmt.dateFull(C.parseDayKey(t.due)))}</span></span>`;

  /* Antworten unter einer Notiz; ctx = 'mentor' (Journal-Ansicht) oder 'student' (Notebook) */
  function thread(n, ctx, myId) {
    const s = st(); const list = (n.replies || []).filter(r => !r.deleted_at); const d = s.rdraft[n.id] || '';
    const item = r => { const mine = r.author_id === myId; const who = r.role === 'student' ? (ctx === 'student' && mine ? 'Du' : r.author_name || 'Schüler') : (r.author_name || 'Mentor');
      return `<div class="mn-reply ${r.role} ${r.is_new ? 'is-new' : ''}"><div class="mr-head"><b class="${who === 'Du' ? '' : 'no-i18n'}">${esc(who)}</b>${r.role === 'mentor' ? ` ${U.pill('Mentor', 'warn')}` : ''}<span class="muted small no-i18n">${esc(fmt.dateTime(r.created_at))}</span>${r.is_new ? ` ${U.pill('Neu', 'win')}` : ''}${mine ? `<span class="grow"></span><button type="button" class="btn xs ghost" data-action="coach-reply-delete" data-note="${esc(n.id)}" data-id="${esc(r.id)}" data-ctx="${ctx}" aria-label="Antwort löschen">${I.trash}</button>` : ''}</div><div class="mr-text">${esc(r.text)}</div></div>`; };
    return `<div class="mn-thread">${list.map(item).join('')}<div class="mr-write"><textarea class="input" rows="1" placeholder="${ctx === 'student' ? 'Antworten …' : 'Antwort an den Schüler …'}" data-input="coach-reply-draft" data-id="${esc(n.id)}" aria-label="Antworten">${esc(d)}</textarea><button type="button" class="btn xs" data-action="coach-reply-send" data-id="${esc(n.id)}" data-ctx="${ctx}" ${d.trim() ? '' : 'disabled'}>${I.chat} Antworten</button></div></div>`;
  }

  /* ---------- Übersicht ---------- */
  function hub() {
    const s = st(); const c = Co.data(); const unread = Co.unread().length; const notes = c.notes.filter(n => !n.deleted_at).length;
    const ownRows = c.own.map(g => `<div class="coach-row"><div class="grow"><a class="coach-name no-i18n" href="#/coach/g/${esc(g.id)}">${esc(g.name)}</a><div class="small muted">${g.members === 1 ? '1 Schüler' : `${g.members} Schüler`}</div></div><button type="button" class="btn sm ghost" data-action="coach-copy-link" data-token="${esc(g.invite_token)}" data-tip="Einladungslink kopieren">${I.copy}<span class="hide-m">Link</span></button><a class="btn sm" href="#/coach/g/${esc(g.id)}">Öffnen</a></div>`);
    const coRows = c.coached.map(g => `<div class="coach-row"><div class="grow"><a class="coach-name no-i18n" href="#/coach/g/${esc(g.id)}">${esc(g.name)}</a><div class="small muted"><span>Co-Coach</span> · <span>Mentor:</span> <span class="no-i18n">${esc(g.owner_name || '—')}</span> · <span>${g.members === 1 ? '1 Schüler' : `${g.members} Schüler`}</span></div></div><a class="btn sm" href="#/coach/g/${esc(g.id)}">Öffnen</a></div>`);
    const own = ownRows.length || coRows.length ? `<div class="coach-list">${ownRows.concat(coRows).join('')}</div>`
      : `<p class="muted small coach-hint">Erstelle eine Gruppe und schick den Einladungslink an deine Schüler. Du siehst dann ihre Journal-Einträge und Kurz-Stats und schreibst Notizen direkt dazu.</p>`;
    const mine = c.groups.length ? `<div class="coach-list">${c.groups.map(m => `<div class="coach-row"><div class="grow"><span class="coach-name no-i18n">${esc(m.group_name)}</span><div class="small muted"><span>${(m.mentors || []).length > 1 ? 'Mentoren:' : 'Mentor:'}</span> ${names(m.mentors && m.mentors.length ? m.mentors : [m.mentor_name])} · <span>${esc(sinceText(m))}</span></div></div><button type="button" class="btn sm ghost" data-action="coach-leave" data-id="${esc(m.group_id)}" data-name="${esc(m.group_name)}">Verlassen</button></div>`).join('')}</div>
        <div class="row coach-sync small muted"><span>${Co.state.syncing ? 'Wird abgeglichen …' : c.lastSync ? `Zuletzt abgeglichen ${fmt.dateTime(c.lastSync)}` : 'Noch nicht abgeglichen'}${Co.state.lastError ? ` · <span class="warn">${esc(Co.state.lastError)}</span>` : ''}</span><button type="button" class="btn xs ghost" data-action="coach-sync-now">${I.replay} Jetzt abgleichen</button></div>
        ${notes ? `<div class="small muted"><span>${notes === 1 ? '1 Mentor-Notiz' : `${notes} Mentor-Notizen`}</span>${unread ? `<span>, </span><b class="accent">${unread} ungelesen</b>` : ''}<span> · </span><a href="#/notebook">Im Notebook ansehen</a></div>` : ''}`
      : `<p class="muted small coach-hint">Dein Mentor schickt dir einen Einladungslink. Öffne ihn hier in Journalyst. Vor dem Beitritt siehst du genau, was er sehen wird.</p>`;
    return `<div class="coach-wrap">
      ${s.error ? errorBox(s.error, 'coach-refresh') : ''}
      <div class="grid two start">
        ${U.card('Als Mentor', own, { info: 'Du siehst von jedem Schüler nur Journal-Einträge und Kurz-Stats in R und Prozent. Schüler sehen sich gegenseitig nicht.', trailing: `<button type="button" class="btn sm primary" data-action="coach-create-group">${I.plus} Gruppe</button>` })}
        ${U.card('Als Schüler', mine, { info: 'Nur Journal-Einträge und Kurz-Stats werden geteilt. Trades, Beträge, Kontostand und private Notizen bleiben bei dir.', trailing: `<button type="button" class="btn sm ghost" data-action="coach-visibility">${I.eye} Was der Mentor sieht</button>` })}
      </div>
      ${c.groups.length || c.tasks.length ? tasksCard() : ''}
      ${notifyCard()}
      <p class="small muted coach-foot"><span>Dein Name im Coach Mode:</span> <b class="no-i18n">${esc(Co.myName() || '—')}</b> <span>(aus dem Profil, beim Beitritt änderbar).</span> ${s.loading ? U.loader('sm', 'Lädt') : ''}</p>
    </div>`;
  }
  /* Aufgaben vom Mentor: offen oben (mit Haken), erledigte eingeklappt */
  function tasksCard() {
    const c = Co.data(); const open = c.tasks.filter(t => !t.done_at), done = c.tasks.filter(t => t.done_at);
    const row = t => `<div class="coach-task ${t.done_at ? 'done' : ''}"><button type="button" class="ct-check" role="checkbox" aria-checked="${!!t.done_at}" data-action="coach-task-toggle" data-id="${esc(t.id)}" aria-label="${t.done_at ? 'Als offen markieren' : 'Als erledigt markieren'}">${I.check}</button><div class="grow"><div class="ct-text">${esc(t.text)}</div><div class="small muted"><span class="no-i18n">${esc(t.mentor_name || '')}</span> · <span class="no-i18n">${esc(t.group_name || '')}</span>${t.due ? ` · ${dueText(t)}` : ''}</div></div></div>`;
    const body = !c.tasks.length ? `<p class="muted small coach-hint">Noch keine Aufgaben. Gibt dir dein Mentor eine, steht sie hier, und du hakst sie ab, wenn du sie geschafft hast.</p>`
      : `${open.length ? open.map(row).join('') : `<p class="muted small coach-hint">Alles erledigt.</p>`}${done.length ? `<details class="ct-done"><summary class="small muted">${done.length === 1 ? '1 erledigt' : `${done.length} erledigt`}</summary>${done.map(row).join('')}</details>` : ''}`;
    return U.card('Aufgaben von deinem Mentor', `<div class="coach-tasks">${body}</div>`, { info: 'Dein Mentor sieht, ob du eine Aufgabe erledigt hast.', sub: open.length ? (open.length === 1 ? '1 offen' : `${open.length} offen`) : '' });
  }
  /* Benachrichtigungen: E-Mail (nur mit Einwilligung, Versand über den Server) und Mitteilung des Browsers */
  function notifyCard() {
    const s = st(); const n = Co.data().notify || { email: '', notify_email: false };
    const supported = 'Notification' in root; const perm = supported ? root.Notification.permission : 'unsupported';
    const browser = supported ? `<div class="set-row coach-nrow"><button type="button" class="switch" role="switch" aria-checked="${Co.browserOn()}" data-action="coach-browser-toggle" aria-label="Mitteilung im Browser"></button><div><b>Mitteilung im Browser</b><div class="small muted">${perm === 'denied' ? 'Im Browser blockiert. Du kannst Mitteilungen für diese Seite in den Browser-Einstellungen erlauben.' : 'Solange Journalyst in einem Tab offen ist, meldet sich der Browser bei neuen Notizen, Antworten und Aufgaben.'}</div></div></div>` : '';
    const mailHint = s.mail === false ? `<div class="small warn coach-mailhint">Auf dem Server ist kein E-Mail-Versand eingerichtet (COACH_SMTP_HOST, siehe server/README.md). Die Adresse wird gespeichert, Mails gehen aber erst raus, wenn der Versand eingerichtet ist.</div>` : '';
    return U.card('Benachrichtigungen', `<form class="stack coach-notify" data-action="coach-notify-save">
        <div class="set-row coach-nrow"><button type="button" class="switch" role="switch" aria-checked="${!!n.notify_email}" data-action="coach-mail-toggle" aria-label="E-Mail bei Neuigkeiten"></button><div class="grow"><b>E-Mail bei Neuigkeiten</b><div class="small muted">Neue Notizen, Antworten und Aufgaben. Höchstens 20 Mails am Tag.</div>
          <div class="row coach-mailrow"><input class="input sm" type="email" name="email" value="${esc(n.email || '')}" placeholder="name@beispiel.de" autocomplete="email" aria-label="E-Mail-Adresse"><button type="submit" class="btn sm">Speichern</button></div>${mailHint}</div></div>
        ${browser}
      </form>`, { info: 'Die Adresse liegt nur auf deinem Coach-Server und wird nur für diese Benachrichtigungen benutzt. Verlässt du alle Gruppen, wird sie gelöscht.' });
  }

  /* ---------- Mentor: Gruppe ---------- */
  function statsRow(r, gid) {
    const x = r.stats || {}; const pf = x.pf == null ? (x.wins ? '∞' : dash) : esc(fmt.num(x.pf, 2));
    const dd = x.max_dd_pct == null ? dash : `<span class="${x.max_dd_pct > 0 ? 'neg' : ''}" data-tip="${x.max_dd_r == null ? '' : esc(fmt.r(-x.max_dd_r))}">−${esc(fmt.num(x.max_dd_pct, 1))} %</span>`;
    const tasks = !r.tasks ? dash : r.open_tasks ? `<span>${r.open_tasks === 1 ? '1 offen' : `${r.open_tasks} offen`}</span><div class="sub">${`von ${r.tasks}`}</div>` : `<span class="accent">${I.check}</span><div class="sub">${r.tasks === 1 ? '1 erledigt' : `${r.tasks} erledigt`}</div>`;
    return `<tr class="link" data-action="coach-open-student" data-gid="${esc(gid)}" data-sid="${esc(r.user_id)}"><td><span class="sym no-i18n">${esc(r.name)}</span>${r.new ? ` ${U.pill(`${r.new} neu`, 'win')}` : ''}${r.new_replies ? ` ${U.pill(r.new_replies === 1 ? '1 Antwort' : `${r.new_replies} Antworten`, 'warn')}` : ''}</td><td class="r">${x.n ? esc(String(x.n)) : '<span class="faint">0</span>'}</td><td class="r">${x.win_rate == null ? dash : esc(fmt.pct(x.win_rate, 0))}</td><td class="r">${pf}</td><td class="r">${x.avg_win_r == null ? dash : U.rText(x.avg_win_r)}</td><td class="r">${x.avg_loss_r == null ? dash : U.rText(x.avg_loss_r)}</td><td class="r">${dd}</td><td class="r">${r.last_entry_key ? esc(fmt.dateFull(C.parseDayKey(r.last_entry_key))) : dash}<div class="sub">${r.entries === 1 ? '1 Eintrag' : `${r.entries} Einträge`}</div></td><td class="r">${tasks}</td></tr>`;
  }
  /* Gruppen-Statistik: Durchschnitt der Schüler mit Trades im Zeitraum, nur für Mentoren, ohne Rangfolge */
  function groupStats(gs) {
    if (!gs || !gs.students) return '';
    const pf = gs.avg_pf == null ? '—' : fmt.num(gs.avg_pf, 2);
    const tiles = [
      U.tile('Aktiv', `${gs.active} / ${gs.students}`, { foot: 'Schüler mit Trades', info: 'Schüler mit mindestens einem abgeschlossenen Trade im Zeitraum.' }),
      U.tile('Trades', esc(String(gs.trades)), { foot: 'zusammen' }),
      U.tile('Ø Winrate', gs.avg_win_rate == null ? '—' : esc(fmt.pct(gs.avg_win_rate, 0)), { foot: 'Durchschnitt der Schüler' }),
      U.tile('Ø Profit-Faktor', esc(pf), { foot: gs.avg_win_r == null ? 'in R' : `<span class="nowrap">${U.rText(gs.avg_win_r)} / ${U.rText(gs.avg_loss_r)}</span>`, info: 'Darunter: Ø Gewinn und Ø Verlust je Trade in R, gemittelt über die Schüler.' }),
      U.tile('Ø Max. Drawdown', gs.avg_max_dd_pct == null ? '—' : `−${esc(fmt.num(gs.avg_max_dd_pct, 1))} %`, { tint: gs.avg_max_dd_pct ? 'neg' : '', foot: 'der Kontogröße' }),
      U.tile('Journal', esc(String(gs.entries)), { foot: `<span>${gs.notes === 1 ? '1 Notiz von euch' : `${gs.notes} Notizen von euch`}</span>${gs.open_tasks ? ` · <span>${gs.open_tasks === 1 ? '1 Aufgabe offen' : `${gs.open_tasks} Aufgaben offen`}</span>` : ''}`, info: 'Journal-Einträge der Schüler im Zeitraum und Notizen aller Mentoren dieser Gruppe.' }),
    ];
    return `<section class="coach-gstats"><div class="row between coach-gs-head"><div class="card-title">Gruppe im Überblick${U.info('Durchschnitt über die Schüler mit Trades im gewählten Zeitraum. Nur Mentoren sehen das, Schüler nicht. Es gibt bewusst keine Rangliste.')}</div><span class="small muted">nur für Mentoren</span></div><div class="grid tiles coach-gs-tiles">${tiles.join('')}</div></section>`;
  }
  function group(gid) {
    const s = st(); const g = s.group && s.group.group && s.group.group.id === gid ? s.group : null; const c = Co.data();
    const own = c.own.find(x => x.id === gid), co = c.coached.find(x => x.id === gid);
    const role = g ? g.group.role : own ? 'owner' : co ? 'coach' : 'owner';
    const name = g ? g.group.name : own ? own.name : co ? co.name : 'Gruppe'; const token = role === 'owner' ? (g ? g.group.invite_token : own ? own.invite_token : '') : '';
    const mentors = g ? [g.group.owner].concat(g.group.coaches || []) : [];
    const invite = token ? `<div class="coach-invite"><span class="small muted">Einladungslink</span><input class="input sm" readonly value="${esc(inviteLink(token))}" aria-label="Einladungslink" onfocus="this.select()"><button type="button" class="btn sm" data-action="coach-copy-link" data-token="${esc(token)}">${I.copy} Kopieren</button></div>` : '';
    const rows = g ? g.students : null;
    const table = !g ? (s.error ? errorBox(s.error, 'coach-refresh') : loading())
      : !rows.length ? U.empty('coach', 'Noch kein Schüler', role === 'owner' ? 'Schick den Einladungslink. Wer beitritt, erscheint hier mit Kurz-Stats.' : 'Sobald Schüler beitreten, erscheinen sie hier mit Kurz-Stats.')
      : `<div class="tbl-wrap"><table class="tbl compact coach-tbl"><thead><tr><th>Schüler</th><th class="r">Trades</th><th class="r">Winrate</th><th class="r">Profit-Faktor</th><th class="r">Ø Gewinn</th><th class="r">Ø Verlust</th><th class="r">Max. Drawdown</th><th class="r">Letzter Eintrag</th><th class="r">Aufgaben</th></tr></thead><tbody>${rows.map(r => statsRow(r, gid)).join('')}</tbody></table></div>`;
    const menu = role === 'owner'
      ? `<button type="button" class="item" data-action="coach-rename" data-id="${esc(gid)}" data-name="${esc(name)}">${I.edit} Umbenennen</button><button type="button" class="item" data-action="coach-rotate" data-id="${esc(gid)}">${I.replay} Neuen Einladungslink erzeugen</button><button type="button" class="item" data-action="coach-cocoach" data-id="${esc(gid)}">${I.account} Co-Coaches</button><hr><button type="button" class="item danger" data-action="coach-archive" data-id="${esc(gid)}" data-name="${esc(name)}">${I.trash} Gruppe schließen</button>`
      : `<button type="button" class="item danger" data-action="coach-coach-leave" data-id="${esc(gid)}" data-name="${esc(name)}">${I.close} Als Co-Coach austreten</button>`;
    return `<div class="coach-wrap wide">
      <div class="coach-head"><div class="row">${back('#/coach', 'Coach')}<div><h2 class="coach-title no-i18n">${esc(name)}</h2>${mentors.length ? `<div class="small muted"><span>${mentors.length > 1 ? 'Mentoren:' : 'Mentor:'}</span> ${names(mentors)}${role === 'coach' ? ' · <span>du bist Co-Coach</span>' : ''}</div>` : ''}</div></div><div class="row"><div class="popwrap"><button type="button" class="btn ghost icon sm" data-pop="coachmenu" aria-label="Mehr">${I.more}</button><div class="popover right" id="pop-coachmenu">${menu}</div></div></div></div>
      ${invite}
      ${g ? groupStats(g.group_stats) : ''}
      ${U.card('Schüler', `<div class="row between coach-ctl">${U.seg(PERIODS, s.period, 'coach-period')}<span class="small muted">Kurz-Stats nur in R und Prozent${g && g.period_start ? ` · ab ${esc(fmt.dateFull(C.parseDayKey(g.period_start)))}` : ''}</span></div>${table}`, { info: 'Pro Schüler: Trades, Winrate, Profit-Faktor (R), Ø Gewinn und Ø Verlust in R, größter Rückgang in Prozent der Kontogröße, letzter Journal-Eintrag und neue Einträge seit deinem letzten Besuch. Klick auf eine Zeile öffnet das Journal.', trailing: `${rows && rows.length ? `<button type="button" class="btn sm ghost" data-action="coach-task-all" data-gid="${esc(gid)}">${I.check}<span class="hide-m">Aufgabe an alle</span></button>` : ''}<button type="button" class="btn sm ghost" data-action="coach-refresh" ${s.loading ? 'disabled' : ''}>${I.replay}<span class="hide-m">Aktualisieren</span></button>` })}
    </div>`;
  }

  /* ---------- Mentor: Journal eines Schülers ---------- */
  function noteHTML(n, myId) {
    const s = st(); const editing = s.editing === n.id; const own = n.mentor_id === myId;
    return `<div class="mentor-note" data-note="${esc(n.id)}"><div class="mn-head">${U.pill('Mentor', 'warn')}<b class="no-i18n">${esc(n.mentor_name || 'Mentor')}</b><span class="muted small"><span class="no-i18n">${esc(fmt.dateTime(n.created_at))}</span>${n.updated_at && n.updated_at !== n.created_at ? '<span> · bearbeitet</span>' : ''}</span>${own && !editing ? `<span class="grow"></span><button type="button" class="btn xs ghost" data-action="coach-note-edit" data-id="${esc(n.id)}">${I.edit} Bearbeiten</button><button type="button" class="btn xs ghost" data-action="coach-note-delete" data-id="${esc(n.id)}">${I.trash} Löschen</button>` : ''}</div>
      ${editing ? `<textarea class="input mn-edit" data-input="coach-note-edit-text" rows="3" aria-label="Notiz bearbeiten">${esc(s.editText)}</textarea><div class="row"><button type="button" class="btn sm primary" data-action="coach-note-save" data-id="${esc(n.id)}">Speichern</button><button type="button" class="btn sm ghost" data-action="coach-note-cancel">Abbrechen</button></div>` : `<div class="mn-text">${esc(n.text)}</div>`}
      ${thread(n, 'mentor', myId)}</div>`;
  }
  function entryHTML(e, notes, gid, sid, myId) {
    const s = st(); let html = '';
    try { const d = JSON.parse(e.content || '{}'); html = root.NoteEditor ? root.NoteEditor.toHTML({ ops: (d.ops || []).filter(o => typeof o.insert === 'string' || (o.insert && (o.insert.figure || o.insert.divider || o.insert.details))) }) : esc(S.deltaText(d)); } catch (err) { html = ''; }
    const own = notes.filter(n => n.entry_id === e.id);
    return `<section class="card coach-entry ${e.is_new ? 'is-new' : ''}" data-entry="${esc(e.id)}">
      <div class="ce-head"><div><div class="ce-date">${esc(fmt.dateFull(C.parseDayKey(e.date_key)))}${e.is_new ? ` ${U.pill('Neu', 'win')}` : ''}</div><h3 class="ce-title ${e.title ? 'no-i18n' : ''}">${esc(e.title || 'Ohne Titel')}</h3></div><span class="small muted no-i18n">${esc(fmt.dateTime(e.updated_at))}</span></div>
      <div class="ql-container ql-snow ce-body"><div class="ql-editor">${html}</div></div>
      ${own.length ? `<div class="mentor-notes">${own.map(n => noteHTML(n, myId)).join('')}</div>` : ''}
      <div class="ce-write"><textarea class="input" rows="2" placeholder="Notiz an den Schüler …" data-input="coach-note-draft" data-id="${esc(e.id)}" aria-label="Notiz schreiben">${esc(s.draft[e.id] || '')}</textarea><button type="button" class="btn sm primary" data-action="coach-note-send" data-gid="${esc(gid)}" data-sid="${esc(sid)}" data-id="${esc(e.id)}" ${(s.draft[e.id] || '').trim() ? '' : 'disabled'}>${I.chat} Notiz senden</button></div>
    </section>`;
  }
  /* Aufgaben an diesen Schüler: Liste mit Status, eigene löschen, neue geben */
  function studentTasks(j, gid, sid, myId) {
    const list = j.tasks || [];
    const row = t => `<div class="coach-task ${t.done_at ? 'done' : ''}"><span class="ct-check static" aria-hidden="true">${t.done_at ? I.check : ''}</span><div class="grow"><div class="ct-text">${esc(t.text)}</div><div class="small muted">${t.done_at ? `<span class="accent">erledigt</span> <span class="no-i18n">${esc(fmt.dateTime(t.done_at))}</span>` : '<span>offen</span>'}${t.due ? ` · ${dueText(t)}` : ''} · <span class="no-i18n">${esc(t.mentor_name || '')}</span></div></div>${t.mentor_id === myId ? `<button type="button" class="btn xs ghost" data-action="coach-task-delete" data-id="${esc(t.id)}" aria-label="Aufgabe löschen">${I.trash}</button>` : ''}</div>`;
    return U.card('Aufgaben', `<div class="coach-tasks">${list.length ? list.map(row).join('') : '<p class="muted small coach-hint">Noch keine Aufgabe.</p>'}</div>
      <form class="row coach-taskform" data-action="coach-task-add" data-gid="${esc(gid)}" data-sid="${esc(sid)}"><input class="input sm grow" name="text" maxlength="300" placeholder="z. B. Diese Woche höchstens 3 Trades pro Tag" required aria-label="Aufgabe"><input class="input sm" type="date" name="due" aria-label="Fällig am"><button type="submit" class="btn sm primary">${I.plus} Aufgabe geben</button></form>`, { info: 'Der Schüler sieht die Aufgabe in seiner Coach-Übersicht, mit Hinweis-Punkt, und hakt sie ab.', sub: list.length ? `${list.filter(t => !t.done_at).length} offen · ${list.filter(t => t.done_at).length} erledigt` : '' });
  }
  function journal(gid, sid) {
    const s = st(); const j = s.journal && s.journal.gid === gid && s.journal.student.id === sid ? s.journal : null; const myId = Co.data().userId;
    const name = j ? j.student.name : 'Schüler';
    const body = !j ? (s.error ? errorBox(s.error, 'coach-refresh') : loading())
      : !j.entries.length ? U.empty('journal', 'Noch keine Einträge', `${esc(name)} hat im geteilten Zeitraum noch nichts ins Journal geschrieben.`)
      : j.entries.map(e => entryHTML(e, j.notes, gid, sid, myId)).join('');
    return `<div class="coach-wrap">
      <div class="coach-head"><div class="row">${back('#/coach/g/' + encodeURIComponent(gid), 'Gruppe')}<h2 class="coach-title no-i18n">${esc(name)}</h2>${j ? `<span class="small muted"><span>${esc(sinceText(j.student))}</span>${j.entries.length ? `<span> · </span><span>${j.entries.length === 1 ? '1 Eintrag' : `${j.entries.length} Einträge`}</span>` : ''}</span>` : ''}</div><button type="button" class="btn sm ghost" data-action="coach-refresh" ${s.loading ? 'disabled' : ''}>${I.replay}<span class="hide-m">Aktualisieren</span></button></div>
      ${j ? studentTasks(j, gid, sid, myId) : ''}
      <p class="small muted coach-hint">Nur lesen. Deine Notizen erscheinen beim Schüler unter dem Eintrag, mit deinem Namen und der Uhrzeit. Er kann sie nicht ändern, aber darauf antworten.</p>
      <div class="coach-entries">${body}</div>
    </div>`;
  }

  /* ---------- Schüler: Beitritt ---------- */
  function join(token) {
    const s = st(); const inv = s.invite && s.invite.token === token ? s.invite : null;
    if (!inv) return `<div class="coach-wrap">${s.error ? `<section class="card">${errorBox(s.error, 'coach-refresh')}<div class="row" style="margin-top:12px">${back('#/coach', 'Coach')}</div></section>` : loading()}</div>`;
    if (inv.own) return `<div class="coach-wrap">${U.card('Einladung', `<p><span>Das ist dein eigener Einladungslink für</span> <b class="no-i18n">${esc(inv.group.name)}</b>. <span>Schick ihn an deine Schüler.</span></p><div class="row">${back('#/coach/g/' + encodeURIComponent(inv.group.id), 'Zur Gruppe')}</div>`)}</div>`;
    if (inv.member) return `<div class="coach-wrap">${U.card('Einladung', `<p><span>Du bist schon in der Gruppe</span> <b class="no-i18n">${esc(inv.group.name)}</b> <span>von</span> <span class="no-i18n">${esc(inv.mentor || 'deinem Mentor')}</span>.</p><div class="row">${back('#/coach', 'Coach')}</div>`)}</div>`;
    const mentors = inv.mentors && inv.mentors.length ? inv.mentors : [inv.mentor];
    return `<div class="coach-wrap"><form class="card coach-join" data-action="coach-join" data-token="${esc(token)}">
      <div class="coach-join-head"><span class="ico">${I.coach}</span><h2><span>Einladung von</span> <span class="no-i18n">${esc(inv.mentor || 'deinem Mentor')}</span></h2><p class="muted"><span>Gruppe</span> <b class="no-i18n">${esc(inv.group.name)}</b>${mentors.length > 1 ? `<br><span>Mentoren:</span> ${names(mentors)}` : ''}<br><span>Bevor du beitrittst: Das und nur das sieht dein Mentor.</span></p></div>
      ${visibilityTable()}
      <div class="grid two" style="margin-top:14px">
        <div class="field"><label for="coach-name">Dein Name für den Mentor</label><input class="input" id="coach-name" name="name" value="${esc(Co.myName())}" maxlength="80" required placeholder="Vorname"></div>
        <div class="field"><span class="lbl">Welche Einträge</span><div class="coach-since"><label class="coach-radio"><input type="radio" name="since" value="today" checked><span><b>Nur ab heute</b><small>Ältere Einträge und Trades bleiben privat.</small></span></label><label class="coach-radio"><input type="radio" name="since" value="all"><span><b>Auch ältere</b><small>Der Mentor sieht auch frühere Journal-Einträge und Kurz-Stats.</small></span></label></div></div>
      </div>
      <div class="row coach-join-foot"><button type="submit" class="btn primary" ${s.loading ? 'disabled' : ''}>${I.check} Beitreten</button><a class="btn ghost" href="#/coach">Abbrechen</a><span class="small muted">Du kannst die Gruppe jederzeit verlassen; dann sieht der Mentor nichts mehr von dir. Kommt ein Co-Coach dazu, erfährst du es.</span></div>
    </form></div>`;
  }
  /* ---------- Co-Coach: Beitritt ---------- */
  function cojoin(token) {
    const s = st(); const inv = s.coInvite && s.coInvite.token === token ? s.coInvite : null;
    if (!inv) return `<div class="coach-wrap">${s.error ? `<section class="card">${errorBox(s.error, 'coach-refresh')}<div class="row" style="margin-top:12px">${back('#/coach', 'Coach')}</div></section>` : loading()}</div>`;
    const msg = inv.own ? 'Das ist der Co-Coach-Link deiner eigenen Gruppe. Schick ihn an jemanden, der mit dir coacht.' : inv.coach ? 'Du bist in dieser Gruppe schon Co-Coach.' : inv.member ? 'Du bist in dieser Gruppe Schüler. Als Co-Coach würdest du die anderen Schüler sehen, darum geht das nicht.' : '';
    if (msg) return `<div class="coach-wrap">${U.card('Co-Coach-Einladung', `<p>${esc(msg)}</p><div class="row">${back(inv.own || inv.coach ? '#/coach/g/' + encodeURIComponent(inv.group.id) : '#/coach', inv.own || inv.coach ? 'Zur Gruppe' : 'Coach')}</div>`)}</div>`;
    return `<div class="coach-wrap"><form class="card coach-join" data-action="coach-cojoin" data-token="${esc(token)}">
      <div class="coach-join-head"><span class="ico">${I.coach}</span><h2><span class="no-i18n">${esc(inv.owner || 'Ein Mentor')}</span> <span>lädt dich als Co-Coach ein</span></h2><p class="muted"><span>Gruppe</span> <b class="no-i18n">${esc(inv.group.name)}</b> · <span>${inv.students === 1 ? '1 Schüler' : `${inv.students} Schüler`}</span></p></div>
      <div class="coach-co-what">
        <div class="coach-yes">${I.check} <span>Du siehst Journal-Einträge und Kurz-Stats (R und Prozent) aller Schüler der Gruppe.</span></div>
        <div class="coach-yes">${I.check} <span>Du schreibst Notizen, Antworten und Aufgaben, mit deinem Namen.</span></div>
        <div class="coach-no">${I.close} <span>Einzelne Trades, Beträge und Kontostände siehst du nicht.</span></div>
        <div class="coach-no">${I.close} <span>Gruppe umbenennen, Links erzeugen und schließen darf nur der Mentor.</span></div>
        <div class="small muted">Die Schüler sehen, dass du dazugekommen bist.</div>
      </div>
      <div class="field" style="margin-top:14px;max-width:420px"><label for="coach-coname">Dein Name für die Gruppe</label><input class="input" id="coach-coname" name="name" value="${esc(Co.myName())}" maxlength="80" required placeholder="Vorname"></div>
      <div class="row coach-join-foot"><button type="submit" class="btn primary" ${s.loading ? 'disabled' : ''}>${I.check} Als Co-Coach beitreten</button><a class="btn ghost" href="#/coach">Abbrechen</a></div>
    </form></div>`;
  }

  /* ---------- Laden ---------- */
  const keyOf = v => [v[0], v[1] || '', v[2] || '', st().period].join('|');
  async function health() { try { const r = await fetch(Co.baseUrl() + '/api/mentor/health'); const h = await r.json(); st().mail = !!h.coach_mail; } catch (e) { st().mail = null; } }
  async function load(v) {
    const s = st(); const kind = v[0], a = v[1], b = v[2]; const key = keyOf(v); if (s.loading && s.key === key) return; s.loading = true; s.key = key; s.error = '';
    try {
      if (kind === 'hub') { await Promise.all([Co.me(), s.mail == null ? health() : null]); s.hubAt = Date.now(); if (Co.data().groups.length) Co.sync(); }
      else if (kind === 'group') { s.group = await Co.api(`/api/coach/groups/${encodeURIComponent(a)}/students?period=${s.period}`); }
      else if (kind === 'journal') { if (!Co.data().userId) await Co.me(); const r = await Co.api(`/api/coach/groups/${encodeURIComponent(a)}/students/${encodeURIComponent(b)}/journal`); s.journal = Object.assign({ gid: a }, r); }
      else if (kind === 'join') { const r = await Co.api(`/api/coach/invite/${encodeURIComponent(a)}`); s.invite = Object.assign({ token: a }, r); }
      else if (kind === 'cojoin') { const r = await Co.api(`/api/coach/coach-invite/${encodeURIComponent(a)}`); s.coInvite = Object.assign({ token: a }, r); }
    } catch (e) { s.error = e.message || String(e); }
    finally { s.loading = false; if (App.state.route === 'coach') App.rerender(); }
  }
  const viewOf = params => params[0] === 'join' && params[1] ? ['join', params[1]] : params[0] === 'cojoin' && params[1] ? ['cojoin', params[1]] : params[0] === 'g' && params[1] && params[2] === 's' && params[3] ? ['journal', params[1], params[3]] : params[0] === 'g' && params[1] ? ['group', params[1]] : ['hub'];

  App.screens.coach = {
    title: 'Coach',
    head: { range: false, account: false, session: false, trade: false },
    render(ctx) {
      if (!Co.configured()) return setup();
      const v = viewOf(ctx.params);
      if (v[0] === 'join') return join(v[1]);
      if (v[0] === 'cojoin') return cojoin(v[1]);
      if (v[0] === 'journal') return journal(v[1], v[2]);
      if (v[0] === 'group') return group(v[1]);
      return hub();
    },
    mount(main, ctx) {
      if (!Co.configured()) return;
      /* Übersicht höchstens alle 30 s neu vom Server (jeder Neuaufbau ruft mount); Gruppe, Journal und Einladung, sobald sie fehlen */
      const s = st(); const v = viewOf(ctx.params); const key = keyOf(v);
      const have = v[0] === 'hub' ? (s.hubAt && Date.now() - s.hubAt < 30000) : v[0] === 'group' ? s.group && s.group.group && s.group.group.id === v[1] && s.group.period === s.period : v[0] === 'journal' ? s.journal && s.journal.gid === v[1] && s.journal.student.id === v[2] : v[0] === 'cojoin' ? s.coInvite && s.coInvite.token === v[1] : s.invite && s.invite.token === v[1];
      const entered = s.lastKey !== key; s.lastKey = key; /* neu betreten (Navigation): frisch vom Server; Neuaufbau in derselben Ansicht: aus dem Zwischenspeicher */
      if ((!have || entered) && !s.loading && !(s.error && s.key === key)) load(v); /* nach einem Fehler erst wieder über „Erneut versuchen“ */
      if (v[0] === 'hub') Co.markTasksSeen(); /* Aufgaben gelten als gesehen, sobald die Übersicht offen ist */
    },
  };

  /* Notizen des Mentors im Notebook des Schülers (unter dem Eintrag): nur lesen, aber mit Antworten */
  function notesBlock(noteId) {
    const list = Co.notesFor(noteId); if (!list.length) return ''; const myId = Co.data().userId;
    return `<div class="mentor-notes in-note"><div class="small muted mn-title">${list.length === 1 ? 'Notiz deines Mentors' : 'Notizen deines Mentors'}</div>${list.map(n => `<div class="mentor-note"><div class="mn-head">${U.pill('Mentor', 'warn')}<b class="no-i18n">${esc(n.mentor_name || 'Mentor')}</b><span class="muted small no-i18n">${esc(n.group_name || '')}${n.group_name ? ' · ' : ''}${esc(fmt.dateTime(n.created_at))}</span></div><div class="mn-text">${esc(n.text)}</div>${n.local ? (n.replies || []).length ? `<div class="mn-thread">${n.replies.map(r => `<div class="mn-reply ${r.role}"><div class="mr-head"><b class="no-i18n">${esc(r.author_id === myId ? 'Du' : r.author_name || '')}</b><span class="muted small no-i18n">${esc(fmt.dateTime(r.created_at))}</span></div><div class="mr-text">${esc(r.text)}</div></div>`).join('')}</div>` : '' : thread(n, 'student', myId)}</div>`).join('')}</div>`;
  }
  root.CoachUI = { notesBlock };

  /* Hinweis-Punkte: Notebook bei neuen Notizen und Antworten, Coach bei neuen Aufgaben */
  const prevDot = App.dots.notebook;
  App.navDot('notebook', c => { const u = Co.unread().length; if (u) return u === 1 ? '1 Neuigkeit von deinem Mentor' : `${u} Neuigkeiten von deinem Mentor`; return prevDot ? prevDot(c) : null; });
  App.navDot('coach', () => { const t = Co.unseenTasks().length; return t ? (t === 1 ? '1 neue Aufgabe' : `${t} neue Aufgaben`) : null; });
  if (Array.isArray(App.NAV_DOT_AREAS) && !App.NAV_DOT_AREAS.some(a => a[0] === 'coach')) App.NAV_DOT_AREAS.push(['coach', 'Coach', 'Dein Mentor hat dir eine neue Aufgabe gegeben.']);

  /* ---------- Aktionen ---------- */
  const fail = e => U.toast(e && e.message ? e.message : 'Das hat nicht geklappt', 'err');
  async function copyText(text) { try { await navigator.clipboard.writeText(text); return true; } catch (e) { try { const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); const ok = document.execCommand('copy'); ta.remove(); return ok; } catch (e2) { return false; } } }
  /* Co-Coach-Fenster (nur Besitzer): Link, neuer Link, Liste mit Entfernen */
  async function coCoachModal(gid) {
    let info; try { info = await Co.api(`/api/coach/groups/${encodeURIComponent(gid)}/coaches`); } catch (e) { return fail(e); }
    const list = info.coaches.length ? info.coaches.map(c => `<div class="coach-row"><div class="grow"><b class="no-i18n">${esc(c.name)}</b><div class="small muted"><span>dabei seit</span> <span class="no-i18n">${esc(fmt.dateFull(c.joined_at))}</span></div></div><button type="button" class="btn sm ghost" data-action="coach-coach-remove" data-gid="${esc(gid)}" data-id="${esc(c.user_id)}" data-name="${esc(c.name)}">Entfernen</button></div>`).join('') : '<p class="muted small coach-hint">Noch kein Co-Coach.</p>';
    U.closeModal(true);
    U.modal(`<div class="modal-head"><h2>Co-Coaches</h2><button type="button" class="btn ghost icon" data-close aria-label="Schließen">${I.close}</button></div>
      <p class="muted small">Ein Co-Coach sieht dasselbe wie du (Journal-Einträge und Kurz-Stats aller Schüler) und schreibt Notizen, Antworten und Aufgaben. Verwalten und schließen darfst nur du. Die Schüler sehen, wer dazukommt.</p>
      <div class="coach-invite"><span class="small muted">Co-Coach-Link</span><input class="input sm" readonly value="${esc(coachLink(info.coach_token))}" aria-label="Co-Coach-Link" onfocus="this.select()"><button type="button" class="btn sm" data-action="coach-coach-copy" data-token="${esc(info.coach_token)}">${I.copy} Kopieren</button></div>
      <div class="coach-list" style="margin-top:12px">${list}</div>
      <div class="modal-foot"><button type="button" class="btn ghost left" data-action="coach-coach-rotate" data-gid="${esc(gid)}">${I.replay} Neuen Link erzeugen</button><button type="button" class="btn" data-close>Fertig</button></div>`, { cls: 'wide' });
  }
  /* Aufgabe an alle Schüler einer Gruppe: kleines Fenster mit Text und Datum */
  function taskAllModal(gid) {
    U.modal(`<form data-action="coach-task-all-save" data-gid="${esc(gid)}"><div class="modal-head"><h2>Aufgabe an alle</h2><button type="button" class="btn ghost icon" data-close aria-label="Schließen">${I.close}</button></div>
      <div class="stack"><div class="field"><label for="ct-all-text">Aufgabe</label><input class="input" id="ct-all-text" name="text" maxlength="300" required placeholder="z. B. Jeden Abend eine Tagesnotiz"></div><div class="field"><label for="ct-all-due">Fällig am (optional)</label><input class="input" id="ct-all-due" type="date" name="due"></div><p class="small muted">Jeder Schüler bekommt sie einzeln und hakt sie selbst ab.</p></div>
      <div class="modal-foot"><button type="button" class="btn" data-close>Abbrechen</button><button type="submit" class="btn primary">Aufgabe geben</button></div></form>`, { cls: 'narrow' });
  }
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
    'coach-refresh'() { const s = st(); s.group = null; s.journal = null; s.invite = null; s.coInvite = null; s.key = ''; s.error = ''; s.hubAt = 0; App.rerender(); },
    'coach-visibility'() { U.modal(`<div class="modal-head"><h2>Was dein Mentor sieht</h2><button type="button" class="btn ghost icon" data-close aria-label="Schließen">${I.close}</button></div>${visibilityTable()}<p class="small muted" style="margin-top:12px">Diese Liste bestätigst du beim Beitritt. Verlässt du die Gruppe, verliert der Mentor sofort jeden Zugriff.</p>`); },
    /* Notizen (Mentor) */
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
    /* Antworten (Mentor in der Journal-Ansicht, Schüler im Notebook) */
    'coach-reply-draft'(el) { st().rdraft[el.dataset.id] = el.value; const btn = el.parentElement && el.parentElement.querySelector('[data-action=coach-reply-send]'); if (btn) btn.disabled = !el.value.trim(); },
    async 'coach-reply-send'(el) {
      const s = st(); const id = el.dataset.id; const text = (s.rdraft[id] || '').trim(); if (!text) return; el.disabled = true;
      try {
        if (el.dataset.ctx === 'student') await Co.reply(id, text);
        else { const r = await Co.api(`/api/coach/notes/${encodeURIComponent(id)}/replies`, { method: 'POST', body: JSON.stringify({ text }) }); const n = s.journal && s.journal.notes.find(x => x.id === id); if (n) n.replies = (n.replies || []).concat(r.reply); }
        delete s.rdraft[id]; U.toast('Antwort gesendet', 'ok'); App.rerender();
      } catch (e) { el.disabled = false; fail(e); }
    },
    async 'coach-reply-delete'(el) {
      if (!await U.confirmModal('Antwort löschen?', 'Die Antwort verschwindet für alle.', { ok: 'Löschen', danger: true })) return;
      const s = st(); const nid = el.dataset.note, rid = el.dataset.id;
      try {
        if (el.dataset.ctx === 'student') await Co.deleteReply(nid, rid);
        else { await Co.api(`/api/coach/replies/${encodeURIComponent(rid)}`, { method: 'DELETE' }); const n = s.journal && s.journal.notes.find(x => x.id === nid); if (n) n.replies = (n.replies || []).filter(r => r.id !== rid); }
        App.rerender();
      } catch (e) { fail(e); }
    },
    /* Aufgaben */
    async 'coach-task-toggle'(el) { const t = Co.data().tasks.find(x => x.id === el.dataset.id); if (!t) return; el.disabled = true; try { await Co.setTaskDone(t.id, !t.done_at); U.toast(t.done_at ? 'Wieder offen' : 'Erledigt', 'ok'); } catch (e) { fail(e); } App.rerender(); },
    async 'coach-task-add'(form) {
      const s = st(); const fd = new FormData(form); const text = String(fd.get('text') || '').trim(); if (!text) return; const due = String(fd.get('due') || '') || null;
      try { const r = await Co.api(`/api/coach/groups/${encodeURIComponent(form.dataset.gid)}/tasks`, { method: 'POST', body: JSON.stringify({ text, due, student_id: form.dataset.sid }) }); if (s.journal) s.journal.tasks = (s.journal.tasks || []).concat(r.tasks); U.toast('Aufgabe gegeben', 'ok'); App.rerender(); } catch (e) { fail(e); }
    },
    'coach-task-all'(el) { taskAllModal(el.dataset.gid); },
    async 'coach-task-all-save'(form) {
      const fd = new FormData(form); const text = String(fd.get('text') || '').trim(); if (!text) return; const due = String(fd.get('due') || '') || null;
      try { const r = await Co.api(`/api/coach/groups/${encodeURIComponent(form.dataset.gid)}/tasks`, { method: 'POST', body: JSON.stringify({ text, due, all: true }) }); U.closeModal(); U.toast(r.tasks.length === 1 ? 'Aufgabe an 1 Schüler gegeben' : `Aufgabe an ${r.tasks.length} Schüler gegeben`, 'ok'); st().group = null; App.rerender(); } catch (e) { fail(e); }
    },
    async 'coach-task-delete'(el) {
      if (!await U.confirmModal('Aufgabe löschen?', 'Die Aufgabe verschwindet auch beim Schüler.', { ok: 'Löschen', danger: true })) return;
      try { await Co.api(`/api/coach/tasks/${encodeURIComponent(el.dataset.id)}`, { method: 'DELETE' }); const s = st(); if (s.journal) s.journal.tasks = (s.journal.tasks || []).filter(t => t.id !== el.dataset.id); App.rerender(); } catch (e) { fail(e); }
    },
    /* Co-Coaches */
    'coach-cocoach'(el) { App.closePopovers(); coCoachModal(el.dataset.id); },
    async 'coach-coach-copy'(el) { const ok = await copyText(coachLink(el.dataset.token)); U.toast(ok ? 'Co-Coach-Link kopiert' : 'Kopieren nicht möglich, bitte den Link markieren', ok ? 'ok' : 'err'); },
    async 'coach-coach-rotate'(el) { try { await Co.api(`/api/coach/groups/${encodeURIComponent(el.dataset.gid)}/coach-invite/rotate`, { method: 'POST' }); U.toast('Neuer Co-Coach-Link', 'ok'); coCoachModal(el.dataset.gid); } catch (e) { fail(e); } },
    async 'coach-coach-remove'(el) {
      try { await Co.api(`/api/coach/groups/${encodeURIComponent(el.dataset.gid)}/coaches/${encodeURIComponent(el.dataset.id)}`, { method: 'DELETE' }); U.toast(`${el.dataset.name} entfernt`); st().group = null; coCoachModal(el.dataset.gid); App.rerender(); } catch (e) { fail(e); }
    },
    async 'coach-coach-leave'(el) {
      if (!await U.confirmModal('Als Co-Coach austreten?', `Du siehst die Schüler von „${el.dataset.name}“ danach nicht mehr. Deine Notizen bleiben bei ihnen.`, { ok: 'Austreten', danger: true })) return;
      try { await Co.api(`/api/coach/groups/${encodeURIComponent(el.dataset.id)}/coaches/leave`, { method: 'POST' }); await Co.me(); st().group = null; U.toast('Als Co-Coach ausgetreten'); App.navigate('#/coach'); } catch (e) { fail(e); }
    },
    async 'coach-cojoin'(form) {
      const s = st(); const name = String(new FormData(form).get('name') || '').trim(); if (!name) return U.toast('Bitte einen Namen eingeben', 'err');
      s.loading = true; App.rerender();
      try { const r = await Co.api(`/api/coach/coach-invite/${encodeURIComponent(form.dataset.token)}/join`, { method: 'POST', body: JSON.stringify({ name }) }); Co.data().name = name; await Co.me(); s.coInvite = null; s.loading = false; U.toast('Du bist jetzt Co-Coach.', 'ok'); App.navigate('#/coach/g/' + encodeURIComponent(r.group.id)); }
      catch (e) { s.loading = false; fail(e); App.rerender(); }
    },
    /* Benachrichtigungen */
    'coach-mail-toggle'(el) { const on = el.getAttribute('aria-checked') !== 'true'; el.setAttribute('aria-checked', String(on)); const f = el.closest('form'); if (f) f.dataset.mail = on ? '1' : '0'; },
    async 'coach-notify-save'(form) {
      const email = String(new FormData(form).get('email') || '').trim(); const sw = form.querySelector('[data-action=coach-mail-toggle]'); const on = sw ? sw.getAttribute('aria-checked') === 'true' : false;
      if (on && !email) return U.toast('Bitte eine E-Mail-Adresse eintragen', 'err');
      try { const r = await Co.saveNotify(email, on); st().mail = r.mail; U.toast(on ? (r.mail ? 'E-Mail-Benachrichtigung an' : 'Gespeichert. Der Server verschickt noch keine Mails.') : 'Gespeichert', 'ok'); App.rerender(); } catch (e) { fail(e); }
    },
    async 'coach-browser-toggle'() {
      if (S.settings.coachBrowserNotify) { S.setSetting('coachBrowserNotify', false); App.rerender(); return; }
      let p = root.Notification ? root.Notification.permission : 'denied';
      if (p === 'default') { try { p = await root.Notification.requestPermission(); } catch (e) { p = 'denied'; } }
      if (p !== 'granted') { U.toast('Der Browser erlaubt keine Mitteilungen für diese Seite', 'err'); App.rerender(); return; }
      S.setSetting('coachBrowserNotify', true); U.toast('Mitteilungen an', 'ok'); App.rerender();
    },
    async 'coach-join'(form) {
      const s = st(); const fd = new FormData(form); const name = String(fd.get('name') || '').trim(); if (!name) return U.toast('Bitte einen Namen eingeben', 'err');
      const since = fd.get('since') === 'all' ? null : C.dayKey(new Date()); s.loading = true; App.rerender();
      try { await Co.api(`/api/coach/invite/${encodeURIComponent(form.dataset.token)}/join`, { method: 'POST', body: JSON.stringify({ name, since }) }); Co.data().name = name; await Co.me(); s.invite = null; s.loading = false; U.toast('Du bist in der Gruppe. Dein Journal wird jetzt abgeglichen.', 'ok'); App.navigate('#/coach'); Co.sync({ force: true }); }
      catch (e) { s.loading = false; fail(e); App.rerender(); }
    },
    async 'coach-leave'(el) {
      if (!await U.confirmModal('Gruppe verlassen?', `Du verlässt „${el.dataset.name}“. Dein Mentor sieht danach nichts mehr von dir; seine bisherigen Notizen behältst du.`, { ok: 'Verlassen', danger: true })) return;
      try { await Co.api(`/api/coach/groups/${encodeURIComponent(el.dataset.id)}/leave`, { method: 'POST' }); await Co.me(); Co.markLocal(); Co.data().tasks = Co.data().tasks.filter(t => t.group_id !== el.dataset.id); S.save(); U.toast('Gruppe verlassen'); App.rerender(); } catch (e) { fail(e); }
    },
    async 'coach-sync-now'() { const r = await Co.sync({ force: true }); U.toast(r ? 'Abgeglichen' : (Co.state.lastError || 'Abgleich nicht möglich'), r ? 'ok' : 'err'); App.rerender(); },
  });

  /* Start, sobald Store und App stehen (das Inline-Skript in app.html lädt vor „load“) */
  const boot = () => { try { Co.boot(); } catch (e) { console.warn(e); } };
  if (document.readyState === 'complete') boot(); else root.addEventListener('load', boot);
})(typeof self !== 'undefined' ? self : this);
