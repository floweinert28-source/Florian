/* Sprachen der Oberfläche. Der Code bleibt deutsch; beim Anzeigen ersetzt I18N sichtbare Texte und Beschriftungen (Platzhalter, Titel,
   Screenreader-Texte) aus dem Wörterbuch der gewählten Sprache (js/lang/*.js). Was noch nicht übersetzt ist, bleibt deutsch.
   Eigene Inhalte (Notiz-Editor, Eingabefelder, Code) werden nie angefasst. Zahlen und Daten formatiert ui.js im Gebietsschema der Sprache.
   Wörterbuch-Einträge mit {0}, {1} … sind Muster für Texte mit Zahlen, Namen oder Daten, z. B. '{0} Trades': '{0} trades'. */
(function (root) {
  'use strict';
  const LANGS = [
    { code: 'de', label: 'Deutsch', name: 'Deutsch', locale: 'de-DE', html: 'de' },
    { code: 'en', label: 'English', name: 'Englisch', locale: 'en-US', html: 'en' },
    { code: 'es', label: 'Español', name: 'Spanisch', locale: 'es-ES', html: 'es' },
    { code: 'zh', label: '中文（简体）', name: 'Chinesisch', locale: 'zh-CN', html: 'zh-Hans' },
    { code: 'hi', label: 'हिन्दी', name: 'Hindi', locale: 'hi-IN', html: 'hi' },
    { code: 'pt', label: 'Português', name: 'Portugiesisch', locale: 'pt-BR', html: 'pt-BR' },
  ];
  const DICTS = {};
  const SKIP = 'script,style,code,pre,textarea,input,.ql-editor,[contenteditable="true"],.no-i18n';
  const ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];
  const LETTER = /[A-Za-zÄÖÜäöüß]/;
  let cur = 'de', dict = null, obs = null, collect = null;

  /* Wörterbücher werden nur für die gewählte Sprache geladen: js/lang/<code>.js neben dieser Datei, mit derselben ?v=-Kennung */
  const me = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : '';
  const langUrl = code => (me ? me.replace(/i18n\.js(\?.*)?$/, (_, q) => 'lang/' + code + '.js' + (q || '')) : 'js/lang/' + code + '.js');
  const loading = {};
  function load(code) {
    if (code === 'de' || DICTS[code] || typeof document === 'undefined') return Promise.resolve();
    return loading[code] || (loading[code] = new Promise(res => { const s = document.createElement('script'); s.src = langUrl(code); s.onload = s.onerror = () => res(); document.head.appendChild(s); }));
  }
  const norm = s => String(s).replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  /* Wörterbuch einer Sprache ergänzen; Muster werden vorab in reguläre Ausdrücke übersetzt (längster fester Text zuerst) */
  function add(code, entries) {
    const d = DICTS[code] || (DICTS[code] = { exact: new Map(), pats: [] });
    Object.keys(entries || {}).forEach(k => {
      const v = entries[k]; if (v == null || v === '') return;
      const key = norm(k);
      if (/\{\d+\}/.test(key)) {
        const parts = key.split(/(\{\d+\})/).filter(x => x !== ''); const order = []; let src = '^';
        parts.forEach(part => { const m = /^\{(\d+)\}$/.exec(part); if (m) { src += '(.+?)'; order.push(+m[1]); } else src += esc(part); });
        const lits = parts.filter(x => !/^\{\d+\}$/.test(x));
        d.pats.push({ re: new RegExp(src + '$'), order, out: String(v), lit: lits.join('').length, pre: /^\{\d+\}$/.test(parts[0]) ? '' : parts[0] });
      } else d.exact.set(key, String(v));
    });
    d.pats.sort((a, b) => b.lit - a.lit);
    if (code === cur) dict = d;
  }
  /* übersetzter Text oder null, wenn es keinen Eintrag gibt */
  function lookup(text) {
    const key = norm(text); if (!key || !LETTER.test(key)) return null;
    if (dict) {
      const hit = dict.exact.get(key); if (hit != null) return hit;
      for (const p of dict.pats) {
        if (p.pre && !key.startsWith(p.pre)) continue;
        const m = p.re.exec(key); if (m) return p.out.replace(/\{(\d+)\}/g, (_, i) => { const at = p.order.indexOf(+i); return at >= 0 ? m[at + 1] : ''; });
      }
    }
    if (collect) collect.add(key);
    return null;
  }
  /* für Code, der Texte außerhalb der Seite braucht (Fenstertitel, Bestätigungsfenster): t('Text') oder t('{0} Trades', [n]) */
  function t(s, vars) {
    let out = s; if (cur !== 'de' || collect) { const hit = lookup(s); if (hit != null) out = hit; }
    return vars ? out.replace(/\{(\d+)\}/g, (_, i) => (vars[i] != null ? vars[i] : '')) : out;
  }

  function textNode(n) {
    const v = n.nodeValue; const hit = lookup(v); if (hit == null || hit === norm(v)) return;
    n.nodeValue = v.match(/^\s*/)[0] + hit + v.match(/\s*$/)[0];
  }
  function attrs(el) { ATTRS.forEach(a => { const v = el.getAttribute(a); if (v) { const hit = lookup(v); if (hit != null && hit !== v) el.setAttribute(a, hit); } }); }
  function walk(node) {
    if (node.nodeType === 3) { const p = node.parentElement; if (p && !p.closest(SKIP)) textNode(node); return; }
    if (node.nodeType !== 1) return;
    if (node.closest(SKIP)) { if (node.matches('input,textarea')) attrs(node); return; }
    attrs(node);
    /* ausgeschlossene Bereiche überspringen; bei Eingabefeldern nur Platzhalter und Titel übersetzen, nie den Inhalt */
    const w = document.createTreeWalker(node, 5 /* Elemente und Text */, { acceptNode: x => { if (x.nodeType === 1 && x.matches(SKIP)) { if (x.matches('input,textarea')) attrs(x); return 2; } return 1; } });
    let x; while ((x = w.nextNode())) { if (x.nodeType === 3) textNode(x); else attrs(x); }
  }
  function onMutations(recs) {
    for (const r of recs) {
      if (r.type === 'childList') r.addedNodes.forEach(walk);
      else if (r.type === 'characterData') { const p = r.target.parentElement; if (p && !p.closest(SKIP)) textNode(r.target); }
      else if (r.type === 'attributes' && r.target.nodeType === 1) attrs(r.target);
    }
    if (obs) obs.takeRecords(); /* eigene Änderungen nicht noch einmal bearbeiten */
  }
  function start() {
    if (typeof document === 'undefined' || !document.body) return;
    if (!obs) obs = new MutationObserver(onMutations);
    obs.disconnect(); obs.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    walk(document.body); obs.takeRecords();
  }
  function stop() { if (obs) { obs.disconnect(); obs.takeRecords(); } }

  /* Sprache setzen (vor dem Neuaufbau der Seite aufrufen); Deutsch braucht keine Übersetzung */
  function setLang(code) {
    const L = LANGS.find(l => l.code === code) || LANGS[0]; cur = L.code; dict = DICTS[cur] || null;
    if (typeof document !== 'undefined') { document.documentElement.lang = L.html; document.documentElement.dataset.lang = L.code; }
    if (cur === 'de' && !collect) stop(); else start();
    /* Wörterbuch fehlt noch: nachladen, dann alles übersetzen und der App Bescheid geben (Fenstertitel, Diagramme) */
    if (cur !== 'de' && !dict) load(cur).then(() => { if (cur !== L.code) return; dict = DICTS[cur] || null; start(); if (typeof root.dispatchEvent === 'function') root.dispatchEvent(new Event('i18n-ready')); });
    return cur;
  }
  const info = () => LANGS.find(l => l.code === cur) || LANGS[0];
  /* Texte sammeln, die noch kein Wörterbuch-Eintrag haben (für die Übersetzungs-Etappen) */
  function startCollect() { collect = new Set(); start(); return collect; }

  root.I18N = { LANGS, add, t, setLang, load, lang: () => cur, locale: () => info().locale, translate: walk, lookup, startCollect, dicts: DICTS };
  /* gespeicherte Sprache schon beim Seitenaufbau mitladen, damit die erste Ansicht sofort übersetzt ist */
  try {
    if (typeof document !== 'undefined' && document.readyState === 'loading' && me) {
      const st = JSON.parse(localStorage.getItem('trading-journal-web-v1') || '{}'); const c = st && st.settings && st.settings.language;
      if (c && c !== 'de' && LANGS.some(l => l.code === c)) { document.write('<script src="' + langUrl(c) + '"><\/script>'); }
    }
  } catch (e) { /* ohne Speicherzugriff lädt setLang das Wörterbuch nach */ }
})(typeof self !== 'undefined' ? self : this);
