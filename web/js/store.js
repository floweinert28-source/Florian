/* Speicher: localStorage für Daten, IndexedDB für Bilder und Audio */
(function (root) {
  'use strict';
  const C = root.Core;
  const KEY = 'trading-journal-web-v1';

  const DEFAULT_TAGS = {
    setups: ['Pullback', 'Breakout', 'Range-Fade', 'Reversal', 'Trendfortsetzung', 'Eröffnungsrange', 'News'],
    mistakes: ['FOMO', 'Regel gebrochen', 'Revenge-Trade', 'Zu früh raus', 'Stop verschoben', 'Übergröße', 'Kein Plan', 'Zu spät rein', 'Overtrading'],
    emotions: ['Ruhig', 'Fokussiert', 'Gelangweilt', 'Unsicher', 'Gierig', 'Ängstlich', 'Euphorisch', 'Frustriert', 'Müde'],
  };
  /* Dashboard-Vorlagen: layout = { oben: [{ typ }], unten: [{ typ, groesse, einstellungen }] } */
  const SIZES = ['klein', 'mittel', 'gross'];
  function defaultDashboard() {
    const now = new Date().toISOString();
    return { id: 'standard', name: 'Standard', isDefault: true, lastActiveAt: null, createdAt: now, updatedAt: now, layout: {
      oben: ['netto_pnl', 'trade_trefferquote', 'profit_faktor', 'tages_trefferquote', 'avg_gewinn_verlust'].map(typ => ({ typ })),
      unten: [{ typ: 'score', groesse: 'klein' }, { typ: 'kum_pnl', groesse: 'klein' }, { typ: 'pnl_pro_tag', groesse: 'klein' }, { typ: 'letzte_trades', groesse: 'klein' }, { typ: 'kalender', groesse: 'mittel' }],
    } };
  }
  function migrateDashboards(data) {
    if (!Array.isArray(data.dashboards)) data.dashboards = [];
    data.dashboards = data.dashboards.filter(d => d && d.id && d.layout);
    if (!data.dashboards.length) data.dashboards.push(defaultDashboard());
    for (const d of data.dashboards) { d.layout.oben = (d.layout.oben || []).filter(w => w && w.typ).slice(0, 5).map(w => ({ typ: w.typ })); d.layout.unten = (d.layout.unten || []).filter(w => w && w.typ).map(w => ({ typ: w.typ, groesse: SIZES.includes(w.groesse) ? w.groesse : 'klein', einstellungen: w.einstellungen || undefined })); d.name = String(d.name || 'Vorlage'); }
    if (!data.dashboards.some(d => d.isDefault)) data.dashboards[0].isDefault = true;
    let seen = false; for (const d of data.dashboards) { if (d.isDefault && seen) d.isDefault = false; if (d.isDefault) seen = true; }
  }

  function defaults() {
    return {
      version: 1,
      settings: { theme: 'dark', currency: 'EUR', dailyLossLimitPct: 3, tiltWarnings: true, ruinDrawdownPct: 30, mcRuns: 1000, range: { preset: 'month', from: null, to: null }, accountId: 'all', sampleInstalled: false, onboarded: false, name: 'Trader', colors: { accent: '', profit: '', loss: '' }, dashboardId: null },
      accounts: [{ id: 'main', name: 'Hauptkonto', size: 25000, currency: 'EUR' }], dashboards: [defaultDashboard()],
      trades: [], days: {}, notes: [], folders: defaultFolders(), noteTags: [], templates: defaultTemplates(), strategies: [], rules: [], missed: [], sessions: [], tags: JSON.parse(JSON.stringify(DEFAULT_TAGS)), dismissed: {},
    };
  }
  /* ---------- Notebook: Ordner, Vorlagen, Delta-Hilfen ---------- */
  const DEFAULT_FOLDERS = [['trades', 'Trade Notes', '#5cb8ff'], ['daily', 'Daily Journal', '#34f58a'], ['recap', 'Session Recap', '#f5b93a']];
  function defaultFolders() { return DEFAULT_FOLDERS.map(([id, name, color], i) => ({ id, name, color, isDefault: true, defaultTemplateId: null, order: i, createdAt: new Date(0).toISOString() })); }
  const textDelta = text => ({ ops: [{ insert: String(text || '').replace(/\n?$/, '\n') }] });
  const richDelta = ops => ({ ops });
  function defaultTemplates() {
    const now = new Date().toISOString();
    return [
      { id: 'tpl-recap', name: 'Tages-Recap', lastUsedAt: null, createdAt: now, content: richDelta([{ insert: 'Wie lief der Tag?' }, { attributes: { header: 2 }, insert: '\n' }, { insert: 'Ergebnis, Stimmung, Energie …\n\nWas lief gut?' }, { attributes: { header: 3 }, insert: '\n' }, { insert: '\n' }, { attributes: { list: 'bullet' }, insert: '\n' }, { insert: 'Was lief schlecht?' }, { attributes: { header: 3 }, insert: '\n' }, { insert: '\n' }, { attributes: { list: 'bullet' }, insert: '\n' }, { insert: 'Eine Sache für morgen' }, { attributes: { header: 3 }, insert: '\n' }, { insert: '\n' }]) },
      { id: 'tpl-trade', name: 'Trade-Review', lastUsedAt: null, createdAt: now, content: richDelta([{ insert: 'Setup und Plan' }, { attributes: { header: 2 }, insert: '\n' }, { insert: 'Warum dieser Trade? Einstieg, Stop, Ziel.\n\nAusführung' }, { attributes: { header: 3 }, insert: '\n' }, { insert: 'Nach Plan eingestiegen?' }, { attributes: { list: 'unchecked' }, insert: '\n' }, { insert: 'Stop eingehalten?' }, { attributes: { list: 'unchecked' }, insert: '\n' }, { insert: 'Gewinn laufen lassen?' }, { attributes: { list: 'unchecked' }, insert: '\n' }, { insert: 'Lehre' }, { attributes: { header: 3 }, insert: '\n' }, { insert: '\n' }]) },
      { id: 'tpl-session', name: 'Session-Plan', lastUsedAt: null, createdAt: now, content: richDelta([{ insert: 'Fokus heute' }, { attributes: { header: 2 }, insert: '\n' }, { insert: '\n' }, { insert: 'Marktlage' }, { attributes: { header: 3 }, insert: '\n' }, { insert: 'Trend oder Range? Wichtige Termine?\n' }, { insert: 'Regeln, die ich heute besonders beachte' }, { attributes: { header: 3 }, insert: '\n' }, { insert: '\n' }, { attributes: { list: 'unchecked' }, insert: '\n' }, { insert: 'Maximale Trades: 3 · Tageslimit: −1 %\n' }]) },
    ];
  }
  const deltaText = d => { const ops = d && d.ops ? d.ops : []; return ops.map(o => typeof o.insert === 'string' ? o.insert : (o.insert && o.insert.figure ? ' [Bild] ' : ' ')).join(''); };
  const hasContent = d => deltaText(d).trim().length > 0 || (d && d.ops || []).some(o => typeof o.insert !== 'string');
  const OLD_FOLDER_MAP = { daily: 'daily', trades: 'trades', strategy: 'strategy', other: 'other', welcome: 'other' };
  function migrateNotes(data) {
    if (!Array.isArray(data.folders) || !data.folders.length) data.folders = defaultFolders();
    for (const f of defaultFolders()) if (!data.folders.some(x => x.id === f.id)) data.folders.push(f);
    if (!Array.isArray(data.noteTags)) data.noteTags = []; if (!Array.isArray(data.templates) || !data.templates.length) data.templates = defaultTemplates();
    const ensureFolder = (id, name, color) => { if (!data.folders.some(x => x.id === id)) data.folders.push({ id, name, color, isDefault: false, defaultTemplateId: null, order: data.folders.length, createdAt: new Date().toISOString() }); };
    for (const n of data.notes) {
      if (n.folderId) continue;
      const target = OLD_FOLDER_MAP[n.folder] || 'other';
      if (target === 'strategy') ensureFolder('strategy', 'Strategie-Notizen', '#8b7cf6'); if (target === 'other') ensureFolder('other', 'Sonstiges', '#9aa3a0');
      n.folderId = target; n.type = n.dateKey ? 'day' : 'normal'; n.content = n.content || textDelta(n.body || ''); delete n.body; delete n.folder; n.tags = n.tags || []; n.deletedAt = n.deletedAt || null;
    }
    for (const [key, d] of Object.entries(data.days || {})) { if (d.notes && String(d.notes).trim()) { if (!data.notes.some(n => n.type === 'day' && n.dateKey === key && !n.deletedAt)) data.notes.unshift({ id: 'day-' + key, folderId: 'daily', type: 'day', dateKey: key, title: dayTitle(key), tags: [], deletedAt: null, content: textDelta(d.notes), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), sample: !!d.sample }); delete d.notes; } }
    const cutoff = Date.now() - 30 * 86400000; data.notes = data.notes.filter(n => !n.deletedAt || new Date(n.deletedAt).getTime() > cutoff);
  }

  const Store = {
    data: defaults(), listeners: new Set(), _timer: null, storageOK: true,
    load() {
      let raw = null; try { raw = localStorage.getItem(KEY); } catch (e) { this.storageOK = false; }
      if (raw) { try { const parsed = JSON.parse(raw); this.data = Object.assign(defaults(), parsed); this.data.settings = Object.assign(defaults().settings, parsed.settings || {}); this.data.settings.colors = Object.assign({ accent: '', profit: '', loss: '' }, (parsed.settings || {}).colors || {}); this.data.tags = Object.assign(JSON.parse(JSON.stringify(DEFAULT_TAGS)), parsed.tags || {}); } catch (e) { console.warn('Speicher unlesbar', e); } }
      migrateNotes(this.data); migrateDashboards(this.data);
      if (!this.data.notes.some(n => n.id === 'welcome')) this.data.notes.push(welcomeNote());
      return this;
    },
    save() {
      clearTimeout(this._timer);
      this._timer = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(this.data)); this.storageOK = true; } catch (e) { this.storageOK = false; console.warn('Speichern fehlgeschlagen', e); } }, 120);
      this.listeners.forEach(fn => fn());
    },
    saveNow() { clearTimeout(this._timer); try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch (e) { this.storageOK = false; } },
    onChange(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
    get settings() { return this.data.settings; },
    setSetting(k, v) { this.data.settings[k] = v; this.save(); },

    /* Trades */
    trades() { return this.data.trades; },
    getTrade(id) { return this.data.trades.find(t => t.id === id) || null; },
    addTrade(t) { t.id = t.id || C.uid(); t.createdAt = t.createdAt || new Date().toISOString(); t.accountId = t.accountId || this.defaultAccountId(); this.data.trades.push(t); this.save(); return t; },
    addTrades(list) { for (const t of list) { t.id = t.id || C.uid(); t.accountId = t.accountId || this.defaultAccountId(); this.data.trades.push(t); } this.save(); },
    updateTrade(id, patch) { const t = this.getTrade(id); if (!t) return null; Object.assign(t, patch, { updatedAt: new Date().toISOString() }); this.save(); return t; },
    async deleteTrade(id) { const t = this.getTrade(id); if (!t) return; for (const s of t.screenshots || []) await Blobs.del(s).catch(() => {}); for (const v of t.voiceNotes || []) if (v.blobId) await Blobs.del(v.blobId).catch(() => {}); this.data.trades = this.data.trades.filter(x => x.id !== id); this.save(); },
    defaultAccountId() { const a = this.data.settings.accountId; return a && a !== 'all' && this.data.accounts.some(x => x.id === a) ? a : (this.data.accounts[0] || { id: 'main' }).id; },
    accountSize() { const a = this.data.settings.accountId; if (a === 'all' || !a) return this.data.accounts.reduce((s, x) => s + (Number(x.size) || 0), 0) || 10000; const acc = this.data.accounts.find(x => x.id === a); return acc ? Number(acc.size) || 10000 : 10000; },
    currency() { const a = this.data.accounts.find(x => x.id === this.data.settings.accountId); return (a && a.currency) || this.data.settings.currency || 'EUR'; },

    /* Tage */
    day(key) { return this.data.days[key] || null; },
    setDay(key, patch) { const d = this.data.days[key] || { key }; Object.assign(d, patch); this.data.days[key] = d; this.save(); return d; },
    regimeByDay() { const out = {}; for (const [k, d] of Object.entries(this.data.days)) if (d.regime) out[k] = d.regime; return out; },
    checkInByDay() { const out = {}; for (const [k, d] of Object.entries(this.data.days)) if (d.checkIn) out[k] = d.checkIn; return out; },
    notesByDay() { const out = {}; for (const n of this.data.notes) if (n.dateKey && !n.deletedAt && hasContent(n.content)) out[n.dateKey] = true; for (const [k, d] of Object.entries(this.data.days)) if (d.notes) out[k] = true; return out; },

    /* Notizen (Notebook) */
    notes(opts = {}) { return this.data.notes.filter(n => opts.trash ? !!n.deletedAt : !n.deletedAt); },
    getNote(id) { return this.data.notes.find(x => x.id === id) || null; },
    addNote(n) { n.id = n.id || C.uid(); n.createdAt = n.createdAt || new Date().toISOString(); n.updatedAt = n.createdAt; n.folderId = n.folderId || 'daily'; n.type = n.type || 'normal'; n.tags = n.tags || []; n.deletedAt = null; if (!n.content) { const f = this.getFolder(n.folderId); const tpl = f && f.defaultTemplateId ? this.getTemplate(f.defaultTemplateId) : null; n.content = tpl ? JSON.parse(JSON.stringify(tpl.content)) : textDelta(''); } this.data.notes.unshift(n); this.save(); return n; },
    updateNote(id, patch, touch = true) { const n = this.getNote(id); if (!n) return null; Object.assign(n, patch, touch ? { updatedAt: new Date().toISOString() } : {}); this.save(); return n; },
    trashNote(id) { const n = this.getNote(id); if (n) { n.deletedAt = new Date().toISOString(); this.save(); } },
    restoreNote(id) { const n = this.getNote(id); if (n) { n.deletedAt = null; if (!this.getFolder(n.folderId)) n.folderId = 'daily'; this.save(); } },
    purgeNote(id) { this.data.notes = this.data.notes.filter(x => x.id !== id); this.save(); },
    emptyTrash() { this.data.notes = this.data.notes.filter(x => !x.deletedAt); this.save(); },
    deleteNote(id) { this.trashNote(id); },
    duplicateNote(id) { const n = this.getNote(id); if (!n) return null; const c = JSON.parse(JSON.stringify(n)); c.id = C.uid(); c.title = (n.title || 'Ohne Titel') + ' (Kopie)'; c.createdAt = new Date().toISOString(); c.updatedAt = c.createdAt; c.shareToken = null; this.data.notes.unshift(c); this.save(); return c; },
    moveNotes(ids, folderId) { for (const n of this.data.notes) if (ids.includes(n.id)) n.folderId = folderId; this.save(); },
    dayNote(key, create) { let n = this.data.notes.find(x => x.type === 'day' && x.dateKey === key && !x.deletedAt); if (!n && create) n = this.addNote({ folderId: 'daily', type: 'day', dateKey: key, title: dayTitle(key) }); return n || null; },
    tradeNote(tradeId, create) { let n = this.data.notes.find(x => x.type === 'trade' && x.tradeId === tradeId && !x.deletedAt); if (!n && create) { const t = this.getTrade(tradeId); n = this.addNote({ folderId: 'trades', type: 'trade', tradeId, dateKey: t ? C.dayKey(new Date(t.openedAt)) : null, title: t ? `${t.symbol} ${t.direction === -1 ? 'Short' : 'Long'} · ${new Date(t.openedAt).toLocaleDateString('de-DE')}` : 'Trade-Notiz' }); } return n || null; },
    /* Ordner */
    folders() { return this.data.folders.slice().sort((a, b) => (a.isDefault === b.isDefault ? a.order - b.order : a.isDefault ? -1 : 1)); },
    getFolder(id) { return this.data.folders.find(f => f.id === id) || null; },
    addFolder(name, color) { const f = { id: C.uid(), name: name.trim(), color: color || '#8b7cf6', isDefault: false, defaultTemplateId: null, order: this.data.folders.length, createdAt: new Date().toISOString() }; this.data.folders.push(f); this.save(); return f; },
    updateFolder(id, patch) { const f = this.getFolder(id); if (f) { Object.assign(f, patch); this.save(); } return f; },
    deleteFolder(id) { const f = this.getFolder(id); if (!f || f.isDefault) return false; const now = new Date().toISOString(); for (const n of this.data.notes) if (n.folderId === id && !n.deletedAt) n.deletedAt = now; this.data.folders = this.data.folders.filter(x => x.id !== id); this.save(); return true; },
    /* Notiz-Tags */
    noteTags() { return this.data.noteTags; },
    tagCounts() { const m = new Map(); for (const n of this.notes()) for (const id of n.tags || []) m.set(id, (m.get(id) || 0) + 1); return this.data.noteTags.map(t => ({ id: t.id, name: t.name, n: m.get(t.id) || 0 })).sort((a, b) => b.n - a.n || a.name.localeCompare(b.name)); },
    ensureTag(name) { name = String(name || '').trim(); if (!name) return null; let t = this.data.noteTags.find(x => x.name.toLowerCase() === name.toLowerCase()); if (!t) { t = { id: C.uid(), name }; this.data.noteTags.push(t); this.save(); } return t; },
    deleteNoteTag(id) { this.data.noteTags = this.data.noteTags.filter(t => t.id !== id); for (const n of this.data.notes) n.tags = (n.tags || []).filter(x => x !== id); this.save(); },
    /* Vorlagen */
    templates() { return this.data.templates; },
    getTemplate(id) { return this.data.templates.find(t => t.id === id) || null; },
    addTemplate(name, content) { const t = { id: C.uid(), name: name.trim(), content, lastUsedAt: null, createdAt: new Date().toISOString() }; this.data.templates.push(t); this.save(); return t; },
    updateTemplate(id, patch) { const t = this.getTemplate(id); if (t) { Object.assign(t, patch); this.save(); } return t; },
    deleteTemplate(id) { this.data.templates = this.data.templates.filter(t => t.id !== id); for (const f of this.data.folders) if (f.defaultTemplateId === id) f.defaultTemplateId = null; this.save(); },
    markTemplateUsed(id) { const t = this.getTemplate(id); if (t) { t.lastUsedAt = new Date().toISOString(); this.save(); } },
    recentTemplates(n = 5) { return this.data.templates.slice().sort((a, b) => (b.lastUsedAt || '').localeCompare(a.lastUsedAt || '') || (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, n); },

    /* Strategien, Regeln, Verpasste Trades, Konten */
    addStrategy(s) { s.id = s.id || C.uid(); this.data.strategies.push(s); this.save(); return s; },
    updateStrategy(id, patch) { const s = this.data.strategies.find(x => x.id === id); if (s) { Object.assign(s, patch); this.save(); } return s; },
    deleteStrategy(id) { this.data.strategies = this.data.strategies.filter(x => x.id !== id); this.save(); },
    addRule(text) { const r = { id: C.uid(), text, active: true }; this.data.rules.push(r); this.save(); return r; },
    updateRule(id, patch) { const r = this.data.rules.find(x => x.id === id); if (r) { Object.assign(r, patch); this.save(); } },
    deleteRule(id) { this.data.rules = this.data.rules.filter(x => x.id !== id); this.save(); },
    addMissed(m) { m.id = m.id || C.uid(); this.data.missed.unshift(m); this.save(); return m; },
    deleteMissed(id) { this.data.missed = this.data.missed.filter(x => x.id !== id); this.save(); },
    addAccount(a) { a.id = a.id || C.uid(); this.data.accounts.push(a); this.save(); return a; },
    updateAccount(id, patch) { const a = this.data.accounts.find(x => x.id === id); if (a) { Object.assign(a, patch); this.save(); } },
    deleteAccount(id) { if (this.data.accounts.length <= 1) return; this.data.accounts = this.data.accounts.filter(x => x.id !== id); const fb = this.data.accounts[0].id; for (const t of this.data.trades) if (t.accountId === id) t.accountId = fb; if (this.data.settings.accountId === id) this.data.settings.accountId = 'all'; this.save(); },
    addTag(kind, name) { name = name.trim(); if (!name) return; if (!this.data.tags[kind].includes(name)) this.data.tags[kind].push(name); this.save(); },
    removeTag(kind, name) { this.data.tags[kind] = this.data.tags[kind].filter(x => x !== name); this.save(); },

    /* Dashboard-Vorlagen */
    dashboards() { return this.data.dashboards; },
    getDashboard(id) { return this.data.dashboards.find(d => d.id === id) || null; },
    defaultDashboard() { return this.data.dashboards.find(d => d.isDefault) || this.data.dashboards[0]; },
    activeDashboard() { return this.getDashboard(this.data.settings.dashboardId) || this.defaultDashboard(); },
    setActiveDashboard(id) { const d = this.getDashboard(id); if (!d) return null; this.data.settings.dashboardId = id; d.lastActiveAt = new Date().toISOString(); this.save(); return d; },
    addDashboard(name, layout) { const now = new Date().toISOString(); const d = { id: C.uid(), name: String(name || 'Neue Vorlage').trim() || 'Neue Vorlage', isDefault: false, lastActiveAt: null, createdAt: now, updatedAt: now, layout: JSON.parse(JSON.stringify(layout || { oben: [], unten: [] })) }; this.data.dashboards.push(d); this.save(); return d; },
    updateDashboard(id, patch) { const d = this.getDashboard(id); if (!d) return null; Object.assign(d, patch, { updatedAt: new Date().toISOString() }); this.save(); return d; },
    duplicateDashboard(id) { const d = this.getDashboard(id); if (!d) return null; return this.addDashboard(d.name + ' (Kopie)', d.layout); },
    setDefaultDashboard(id) { if (!this.getDashboard(id)) return; for (const d of this.data.dashboards) d.isDefault = d.id === id; this.save(); },
    deleteDashboard(id) { if (this.data.dashboards.length <= 1) return false; const d = this.getDashboard(id); if (!d) return false; this.data.dashboards = this.data.dashboards.filter(x => x.id !== id); if (d.isDefault) this.data.dashboards[0].isDefault = true; if (this.data.settings.dashboardId === id) this.data.settings.dashboardId = this.defaultDashboard().id; this.save(); return true; },

    /* Sessions */
    startSession(pre) { const s = { id: C.uid(), startedAt: new Date().toISOString(), endedAt: null, pre: pre || {}, post: null }; this.data.sessions.push(s); this.save(); return s; },
    activeSession() { return this.data.sessions.find(s => !s.endedAt) || null; },
    endSession(post) { const s = this.activeSession(); if (s) { s.endedAt = new Date().toISOString(); s.post = post || {}; this.save(); } return s; },

    /* Beispieldaten */
    installSample() {
      const g = root.Sample.generate({ account: this.accountSize() === 10000 ? 25000 : this.data.accounts[0].size || 25000, accountId: this.data.accounts[0].id });
      this.removeSample(false);
      this.data.trades.push(...g.trades);
      for (const [k, d] of Object.entries(g.days)) this.data.days[k] = Object.assign({}, this.data.days[k] || {}, d);
      this.data.notes.push(...g.notes); this.data.missed.push(...g.missed); this.data.strategies.push(...g.strategies);
      for (const f of g.folders || []) if (!this.data.folders.some(x => x.id === f.id)) this.data.folders.push(f);
      for (const t of g.noteTags || []) if (!this.data.noteTags.some(x => x.id === t.id)) this.data.noteTags.push(t);
      for (const r of g.rules) if (!this.data.rules.some(x => x.text === r.text)) this.data.rules.push(r);
      this.data.settings.sampleInstalled = true; this.save();
    },
    removeSample(save = true) {
      this.data.trades = this.data.trades.filter(t => !t.sample);
      for (const [k, d] of Object.entries(this.data.days)) { if (d.sample) { delete this.data.days[k]; } }
      this.data.notes = this.data.notes.filter(n => !n.sample); this.data.folders = this.data.folders.filter(f => !f.sample); this.data.noteTags = this.data.noteTags.filter(t => !t.sample); this.data.missed = this.data.missed.filter(m => !m.sample); this.data.strategies = this.data.strategies.filter(s => !s.sample); this.data.rules = this.data.rules.filter(r => !r.sample);
      this.data.settings.sampleInstalled = false; if (save) this.save();
    },
    async wipe() { await Blobs.clear().catch(() => {}); const theme = this.data.settings.theme, colors = this.data.settings.colors; this.data = defaults(); this.data.settings.theme = theme; this.data.settings.colors = colors; this.data.settings.onboarded = true; this.data.notes.push(welcomeNote()); this.saveNow(); this.listeners.forEach(fn => fn()); },

    /* Sicherung */
    async exportJSON(includeBlobs) {
      const out = { app: 'trading-journal-web', version: 1, exportedAt: new Date().toISOString(), data: JSON.parse(JSON.stringify(this.data)) };
      if (includeBlobs) { out.blobs = {}; for (const t of this.data.trades) { for (const id of [...(t.screenshots || []), ...(t.voiceNotes || []).map(v => v.blobId).filter(Boolean)]) { const b = await Blobs.get(id).catch(() => null); if (b) out.blobs[id] = { type: b.type, data: await blobToDataURL(b) }; } } }
      return JSON.stringify(out);
    },
    async importJSON(text, mode = 'replace') {
      const parsed = JSON.parse(text); const d = parsed.data || parsed;
      if (!d || !Array.isArray(d.trades)) throw new Error('Keine gültige Sicherung.');
      if (mode === 'replace') { this.data = Object.assign(defaults(), d); this.data.settings = Object.assign(defaults().settings, d.settings || {}); }
      else { const ids = new Set(this.data.trades.map(t => t.id)); const keys = new Set(this.data.trades.map(C.dedupeKey)); for (const t of d.trades) if (!ids.has(t.id) && !keys.has(C.dedupeKey(t))) this.data.trades.push(t); for (const [k, v] of Object.entries(d.days || {})) this.data.days[k] = Object.assign({}, this.data.days[k] || {}, v); const nids = new Set(this.data.notes.map(n => n.id)); for (const n of d.notes || []) if (!nids.has(n.id)) this.data.notes.push(n); for (const s of d.strategies || []) if (!this.data.strategies.some(x => x.name === s.name)) this.data.strategies.push(s); for (const r of d.rules || []) if (!this.data.rules.some(x => x.text === r.text)) this.data.rules.push(r); for (const m of d.missed || []) if (!this.data.missed.some(x => x.id === m.id)) this.data.missed.push(m); }
      if (parsed.blobs) for (const [id, b] of Object.entries(parsed.blobs)) { const blob = await (await fetch(b.data)).blob(); await Blobs.put(blob, id).catch(() => {}); }
      migrateNotes(this.data); migrateDashboards(this.data); if (!this.data.notes.some(n => n.id === 'welcome')) this.data.notes.push(welcomeNote());
      this.saveNow(); this.listeners.forEach(fn => fn());
      return { trades: d.trades.length };
    },
    DEFAULT_TAGS, DASHBOARD_SIZES: SIZES, newDefaultDashboard: defaultDashboard, textDelta, deltaText, hasContent, dayTitle,
  };

  function dayTitle(key) { const d = C.parseDayKey(key); const wd = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][d.getDay()]; const mo = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'][d.getMonth()]; return `${wd}, ${d.getDate()}. ${mo} ${d.getFullYear()}`; }
  function welcomeNote() {
    const now = new Date().toISOString();
    return { id: 'welcome', folderId: 'recap', type: 'normal', title: 'Willkommen im Journal', tags: [], deletedAt: null, createdAt: now, updatedAt: now, content: richDelta([
      { insert: 'So nutzt du das Journal' }, { attributes: { header: 2 }, insert: '\n' },
      { insert: '„Trade loggen“ oben rechts: Symbol, Richtung, Zeiten, Kurse, Plan (Einstieg, Stop, Ziel), Setup und Tags. Screenshots per Drag & Drop.' }, { attributes: { list: 'ordered' }, insert: '\n' },
      { insert: 'CSV-Import im TradeLog: Spalten werden automatisch erkannt, die Zuordnung kannst du anpassen.' }, { attributes: { list: 'ordered' }, insert: '\n' },
      { insert: '„Session starten“: kurzer Check-in (Schlaf, Stress, Stimmung) vor dem Handel.' }, { attributes: { list: 'ordered' }, insert: '\n' },
      { insert: 'Dashboard, Statistiken und Fortschritt werten alles aus: Kennzahlen, Score, Fehlerkosten, Tilt-Warnungen, Edge-Check, Monte Carlo.' }, { attributes: { list: 'ordered' }, insert: '\n' },
      { insert: 'Notebook' }, { attributes: { header: 3 }, insert: '\n' },
      { insert: 'Ordner links, Notizen in der Mitte, Editor rechts. Tippe „/“ am Zeilenanfang für Befehle und „:“ für Emojis. Vorlagen fügst du mit einem Klick ein. Notizen werden automatisch gespeichert.\n' },
      { insert: 'Alle Daten bleiben in deinem Browser. Unter Einstellungen kannst du eine Sicherung exportieren und wieder einspielen. Beispieldaten lassen sich dort jederzeit entfernen.\n' },
    ]) };
  }
  function blobToDataURL(blob) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(blob); }); }

  /* IndexedDB */
  const Blobs = {
    _db: null,
    open() {
      if (this._db) return Promise.resolve(this._db);
      return new Promise((res, rej) => {
        if (!root.indexedDB) return rej(new Error('IndexedDB nicht verfügbar'));
        const req = indexedDB.open('trading-journal-blobs', 1);
        req.onupgradeneeded = () => { req.result.createObjectStore('files', { keyPath: 'id' }); };
        req.onsuccess = () => { this._db = req.result; res(this._db); }; req.onerror = () => rej(req.error);
      });
    },
    async put(blob, id) { id = id || C.uid(); const db = await this.open(); await new Promise((res, rej) => { const tx = db.transaction('files', 'readwrite'); tx.objectStore('files').put({ id, blob, type: blob.type, createdAt: Date.now() }); tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); return id; },
    async get(id) { const db = await this.open(); return new Promise((res, rej) => { const req = db.transaction('files').objectStore('files').get(id); req.onsuccess = () => res(req.result ? req.result.blob : null); req.onerror = () => rej(req.error); }); },
    _urls: new Map(),
    async url(id) { if (this._urls.has(id)) return this._urls.get(id); const b = await this.get(id); if (!b) return null; const u = URL.createObjectURL(b); this._urls.set(id, u); return u; },
    async del(id) { const db = await this.open(); if (this._urls.has(id)) { URL.revokeObjectURL(this._urls.get(id)); this._urls.delete(id); } return new Promise((res, rej) => { const tx = db.transaction('files', 'readwrite'); tx.objectStore('files').delete(id); tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); },
    async clear() { const db = await this.open(); return new Promise((res, rej) => { const tx = db.transaction('files', 'readwrite'); tx.objectStore('files').clear(); tx.oncomplete = res; tx.onerror = () => rej(tx.error); }); },
  };

  root.Store = Store; root.Blobs = Blobs;
})(typeof self !== 'undefined' ? self : this);
