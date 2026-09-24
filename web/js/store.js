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
  const WIDGETS = { kpis: 'Kennzahlen', score: 'Score', pnl: 'Täglicher & kumulierter P&L', winloss: 'Ø Gewinn/Verlust', strategy: 'Strategie-Performance', calendar: 'Kalender', recent: 'Letzte Trades', discipline: 'Disziplin' };

  function defaults() {
    return {
      version: 1,
      settings: { theme: 'dark', currency: 'EUR', dailyLossLimitPct: 3, tiltWarnings: true, ruinDrawdownPct: 30, mcRuns: 1000, widgets: Object.fromEntries(Object.keys(WIDGETS).map(k => [k, true])), range: { preset: 'month', from: null, to: null }, accountId: 'all', sampleInstalled: false, onboarded: false, name: 'Trader' },
      accounts: [{ id: 'main', name: 'Hauptkonto', size: 25000, currency: 'EUR' }],
      trades: [], days: {}, notes: [], strategies: [], rules: [], missed: [], sessions: [], tags: JSON.parse(JSON.stringify(DEFAULT_TAGS)), dismissed: {},
    };
  }

  const Store = {
    data: defaults(), listeners: new Set(), _timer: null, storageOK: true,
    load() {
      let raw = null; try { raw = localStorage.getItem(KEY); } catch (e) { this.storageOK = false; }
      if (raw) { try { const parsed = JSON.parse(raw); this.data = Object.assign(defaults(), parsed); this.data.settings = Object.assign(defaults().settings, parsed.settings || {}); this.data.settings.widgets = Object.assign(defaults().settings.widgets, (parsed.settings || {}).widgets || {}); this.data.tags = Object.assign(JSON.parse(JSON.stringify(DEFAULT_TAGS)), parsed.tags || {}); } catch (e) { console.warn('Speicher unlesbar', e); } }
      if (!this.data.notes.some(n => n.folder === 'welcome')) this.data.notes.push(welcomeNote());
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
    notesByDay() { const out = {}; for (const n of this.data.notes) if (n.dateKey) out[n.dateKey] = true; for (const [k, d] of Object.entries(this.data.days)) if (d.notes) out[k] = true; return out; },

    /* Notizen */
    addNote(n) { n.id = n.id || C.uid(); n.createdAt = n.createdAt || new Date().toISOString(); n.updatedAt = n.createdAt; this.data.notes.unshift(n); this.save(); return n; },
    updateNote(id, patch) { const n = this.data.notes.find(x => x.id === id); if (!n) return null; Object.assign(n, patch, { updatedAt: new Date().toISOString() }); this.save(); return n; },
    deleteNote(id) { this.data.notes = this.data.notes.filter(x => x.id !== id); this.save(); },

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
      for (const r of g.rules) if (!this.data.rules.some(x => x.text === r.text)) this.data.rules.push(r);
      this.data.settings.sampleInstalled = true; this.save();
    },
    removeSample(save = true) {
      this.data.trades = this.data.trades.filter(t => !t.sample);
      for (const [k, d] of Object.entries(this.data.days)) { if (d.sample) { delete this.data.days[k]; } }
      this.data.notes = this.data.notes.filter(n => !n.sample); this.data.missed = this.data.missed.filter(m => !m.sample); this.data.strategies = this.data.strategies.filter(s => !s.sample); this.data.rules = this.data.rules.filter(r => !r.sample);
      this.data.settings.sampleInstalled = false; if (save) this.save();
    },
    async wipe() { await Blobs.clear().catch(() => {}); const theme = this.data.settings.theme; this.data = defaults(); this.data.settings.theme = theme; this.data.settings.onboarded = true; this.data.notes.push(welcomeNote()); this.saveNow(); this.listeners.forEach(fn => fn()); },

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
      if (!this.data.notes.some(n => n.folder === 'welcome')) this.data.notes.push(welcomeNote());
      this.saveNow(); this.listeners.forEach(fn => fn());
      return { trades: d.trades.length };
    },
    WIDGETS, DEFAULT_TAGS,
  };

  function welcomeNote() {
    return { id: 'welcome', folder: 'welcome', title: 'Willkommen im Journal', body: `So nutzt du das Journal:\n\n1. „Trade loggen“ oben rechts: Symbol, Richtung, Zeiten, Kurse, Plan (Einstieg, Stop, Ziel), Setup und Tags. Screenshots kannst du per Drag & Drop anhängen.\n2. CSV-Import im TradeLog: Spalten werden automatisch erkannt, du kannst die Zuordnung anpassen.\n3. „Session starten“: kurzer Check-in (Schlaf, Stress, Stimmung) vor dem Handel. Das Journal zeigt dir später, wie dein Zustand mit deinem Ergebnis zusammenhängt.\n4. Dashboard, Statistiken und Fortschritt werten alles aus: Kennzahlen, Score, Fehlerkosten, Tilt-Warnungen, Edge-Check, Monte Carlo.\n\nAlle Daten bleiben in deinem Browser. Unter Einstellungen kannst du eine Sicherung exportieren und wieder einspielen.\n\nBeispieldaten lassen sich in den Einstellungen jederzeit entfernen.`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
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
