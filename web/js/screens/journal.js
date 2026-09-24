/* Journal: Ordner, Notizen, Editor */
(function (root) {
  'use strict';
  const C = root.Core, S = root.Store, U = root.UI, I = U.I, esc = U.esc, fmt = U.fmt, App = root.App;
  const FOLDERS = [['daily', 'Tagesjournal', '#34f58a'], ['trades', 'Trade-Notizen', '#5cb8ff'], ['strategy', 'Strategie-Notizen', '#f5b93a'], ['other', 'Sonstiges', '#8b7cf6'], ['welcome', 'Willkommen', '#ff5c5c']];
  App.screens.journal = {
    title: 'Journal',
    actions() { return `<button type="button" class="btn hide-m" data-action="new-note">${I.plus}<span>Neue Notiz</span></button>`; },
    render(ctx) {
      const j = App.state.journal; if (ctx.params[0]) { const n = S.data.notes.find(x => x.id === ctx.params[0]); if (n) { j.note = n.id; j.folder = n.folder; } }
      const notes = S.data.notes.filter(n => n.folder === j.folder).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
      let cur = notes.find(n => n.id === j.note) || notes[0]; if (cur) j.note = cur.id;
      const counts = Object.fromEntries(FOLDERS.map(([k]) => [k, S.data.notes.filter(n => n.folder === k).length]));
      const folders = `<div class="col"><h3>Ordner</h3>${FOLDERS.map(([k, l, c]) => `<div class="folder ${j.folder === k ? 'active' : ''}" data-action="journal-folder" data-value="${k}" role="button" tabindex="0"><span class="ico" style="background:${c}"></span><span>${l}</span><span class="cnt">${counts[k]}</span></div>`).join('')}<div style="margin-top:12px"><button type="button" class="btn sm" data-action="new-note" style="width:100%">${I.plus} Neue Notiz</button></div></div>`;
      const list = `<div class="col"><h3>Notizen</h3>${notes.length ? notes.map(n => `<div class="note-item ${cur && cur.id === n.id ? 'active' : ''}" data-action="journal-open" data-id="${n.id}" role="button" tabindex="0"><b>${esc(n.title || 'Ohne Titel')}</b><span>${fmt.dateFull(n.updatedAt || n.createdAt)} · ${esc((n.body || '').replace(/\s+/g, ' ').slice(0, 60))}</span></div>`).join('') : `<div class="empty" style="min-height:120px"><span class="small">Keine Notizen in diesem Ordner</span></div>`}</div>`;
      const editor = cur ? `<div class="col"><div class="row between"><span class="muted small">${fmt.dateTime(cur.updatedAt || cur.createdAt)}${cur.dateKey ? ` · <a href="#/day/${cur.dateKey}" class="accent">Tagesansicht</a>` : ''}</span><div class="row"><select class="select" style="width:auto;padding:6px 28px 6px 10px;font-size:12.5px" data-change="journal-move" data-id="${cur.id}" aria-label="Ordner">${FOLDERS.filter(([k]) => k !== 'welcome' || cur.folder === 'welcome').map(([k, l]) => `<option value="${k}" ${cur.folder === k ? 'selected' : ''}>${l}</option>`).join('')}</select><button type="button" class="btn ghost icon sm" data-action="journal-delete" data-id="${cur.id}" aria-label="Löschen">${I.trash}</button></div></div><input class="note-title" id="note-title" data-input="journal-edit" data-id="${cur.id}" data-field="title" value="${esc(cur.title || '')}" placeholder="Titel" aria-label="Titel"><textarea class="note-body" id="note-body" data-input="journal-edit" data-id="${cur.id}" data-field="body" placeholder="Schreib los …" aria-label="Inhalt">${esc(cur.body || '')}</textarea><div class="small faint">Wird automatisch gespeichert.</div></div>` : `<div class="col">${U.empty('journal', 'Keine Notiz ausgewählt', 'Lege eine neue Notiz an.', `<button type="button" class="btn sm primary" data-action="new-note">${I.plus} Neue Notiz</button>`)}</div>`;
      return `<section class="card flush"><div class="journal">${folders}${list}${editor}</div></section>`;
    },
  };
  Object.assign(App.actions, {
    'journal-folder'(el) { App.state.journal.folder = el.dataset.value; App.state.journal.note = null; App.navigate('#/journal'); App.rerender(); },
    'journal-open'(el) { App.state.journal.note = el.dataset.id; App.rerender(); },
    'new-note'() { const f = App.state.journal.folder === 'welcome' ? 'other' : App.state.journal.folder || 'daily'; const n = S.addNote({ folder: f, title: f === 'daily' ? `Tagesjournal ${new Date().toLocaleDateString('de-DE')}` : '', body: '', dateKey: f === 'daily' ? C.dayKey(new Date()) : null }); App.state.journal.folder = f; App.state.journal.note = n.id; if (App.state.route !== 'journal') App.navigate('#/journal/' + n.id); else { App.rerender(); document.getElementById('note-title')?.focus(); } },
    'journal-edit'(el) { clearTimeout(App._jt); const id = el.dataset.id, field = el.dataset.field, val = el.value; App._jt = setTimeout(() => { S.updateNote(id, { [field]: val }); const li = document.querySelector(`.note-item[data-id="${id}"] b`); if (li && field === 'title') li.textContent = val || 'Ohne Titel'; }, 350); },
    'journal-move'(el) { S.updateNote(el.dataset.id, { folder: el.value }); App.state.journal.folder = el.value; App.rerender(); },
    async 'journal-delete'(el) { if (await U.confirmModal('Notiz löschen?', 'Die Notiz wird dauerhaft entfernt.', { ok: 'Löschen', danger: true })) { S.deleteNote(el.dataset.id); App.state.journal.note = null; App.navigate('#/journal'); App.rerender(); } },
  });
})(typeof self !== 'undefined' ? self : this);
