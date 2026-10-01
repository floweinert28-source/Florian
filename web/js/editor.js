/* Notiz-Editor auf Basis von Quill 2, Aufbau nach TradePath:
   „+“ (Bausteine, Listen, Vorlagen) · Absatzformat · Schriftgröße · B I U S Farbe · Bild · Textmarker
   Dazu: Slash-Befehle, Emoji-Auswahl über „:“, Bilder mit Unterschrift, Trennlinie, aufklappbare Abschnitte */
(function (root) {
  'use strict';
  const Q = root.Quill; if (!Q) { console.warn('Quill fehlt'); return; }
  const U = root.UI, esc = U.esc, I = U.I;

  /* ---------- Formate ---------- */
  const Size = Q.import('attributors/style/size'); Size.whitelist = null; Q.register(Size, true);
  const BlockEmbed = Q.import('blots/block/embed');
  const sanitize = html => { const doc = new DOMParser().parseFromString(String(html || ''), 'text/html'); doc.querySelectorAll('script,style,iframe,object,embed,link,meta').forEach(n => n.remove()); doc.body.querySelectorAll('*').forEach(el => { for (const a of [...el.attributes]) { if (/^on/i.test(a.name) || (a.name === 'href' && /^\s*javascript:/i.test(a.value)) || a.name === 'srcdoc') el.removeAttribute(a.name); } }); return doc.body.innerHTML; };
  const resolveBlob = (img, id) => { if (root.Blobs) root.Blobs.url(id).then(u => { if (u) img.src = u; else img.alt = 'Bild nicht mehr vorhanden'; }).catch(() => {}); };
  const dirty = node => node.dispatchEvent(new CustomEvent('nb-dirty', { bubbles: true }));
  const stopKeys = el => ['keydown', 'keyup', 'keypress', 'beforeinput', 'input', 'paste', 'cut', 'copy', 'compositionstart', 'compositionend'].forEach(ev => el.addEventListener(ev, e => e.stopPropagation()));

  class Divider extends BlockEmbed { static create() { const n = super.create(); n.setAttribute('contenteditable', 'false'); return n; } }
  Divider.blotName = 'divider'; Divider.tagName = 'hr'; Divider.className = 'nb-hr';
  class Figure extends BlockEmbed {
    static create(v) {
      const node = super.create(); v = typeof v === 'string' ? { src: v } : (v || {}); node.setAttribute('contenteditable', 'false');
      node.innerHTML = `<div class="img"><img alt=""><span class="rs" title="Größe ändern"></span></div><input class="cap" placeholder="Bildunterschrift" spellcheck="false">`;
      const img = node.querySelector('img'); if (v.id) { img.dataset.blob = v.id; resolveBlob(img, v.id); } else if (v.src && /^(data:image|blob:|https?:)/.test(v.src)) img.src = v.src;
      if (v.width) img.style.width = v.width; const cap = node.querySelector('.cap'); cap.value = v.caption || ''; stopKeys(cap); cap.addEventListener('input', () => dirty(node)); cap.addEventListener('mousedown', e => e.stopPropagation());
      img.addEventListener('dblclick', () => { const lb = document.createElement('div'); lb.className = 'lightbox'; lb.innerHTML = `<img src="${img.src}" alt="">`; lb.addEventListener('click', () => lb.remove()); document.body.appendChild(lb); });
      node.querySelector('.rs').addEventListener('mousedown', e => { e.preventDefault(); e.stopPropagation(); const startX = e.clientX, startW = img.getBoundingClientRect().width, maxW = node.getBoundingClientRect().width; const move = ev => { const w = Math.max(80, Math.min(maxW, startW + ev.clientX - startX)); img.style.width = Math.round(w / maxW * 100) + '%'; }; const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); dirty(node); }; document.addEventListener('mousemove', move); document.addEventListener('mouseup', up); });
      return node;
    }
    static value(node) { const img = node.querySelector('img'); const cap = node.querySelector('.cap'); const v = { caption: cap ? cap.value : '' }; if (img.dataset.blob) v.id = img.dataset.blob; else if (img.getAttribute('src')) v.src = img.getAttribute('src'); if (img.style.width) v.width = img.style.width; return v; }
  }
  Figure.blotName = 'figure'; Figure.tagName = 'figure'; Figure.className = 'nb-figure';
  class Details extends BlockEmbed {
    static create(v) {
      v = v || {}; const node = super.create(); node.open = v.open !== false; node.setAttribute('contenteditable', 'false');
      node.innerHTML = `<summary contenteditable="true" spellcheck="false"></summary><div class="body" contenteditable="true"></div>`;
      const sum = node.querySelector('summary'), body = node.querySelector('.body'); sum.textContent = v.summary || 'Abschnitt'; body.innerHTML = sanitize(v.html) || '<p><br></p>';
      [sum, body].forEach(el => { stopKeys(el); el.addEventListener('input', () => dirty(node)); el.addEventListener('mousedown', e => e.stopPropagation()); });
      sum.addEventListener('click', e => e.preventDefault()); sum.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); body.focus(); } }); node.addEventListener('toggle', () => dirty(node));
      return node;
    }
    static value(node) { return { summary: node.querySelector('summary').textContent, html: sanitize(node.querySelector('.body').innerHTML), open: node.open }; }
  }
  Details.blotName = 'details'; Details.tagName = 'details'; Details.className = 'nb-details';
  class Tweet extends BlockEmbed { static create(url) { const node = super.create(); node.setAttribute('contenteditable', 'false'); const safe = /^https:\/\/(x\.com|twitter\.com)\//.test(url) ? url : ''; node.innerHTML = `<blockquote class="twitter-tweet"><a href="${esc(safe)}" target="_blank" rel="noopener">${esc(safe || 'Ungültiger Link')}</a></blockquote>`; return node; } static value(node) { const a = node.querySelector('a'); return a ? a.getAttribute('href') : ''; } }
  Tweet.blotName = 'tweet'; Tweet.tagName = 'div'; Tweet.className = 'nb-tweet';
  [Divider, Figure, Details, Tweet].forEach(b => Q.register(b, true));

  /* ---------- Symbole ---------- */
  const sv = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const E = {
    para: sv('<path d="M13 4v16M17 4v16M17 4H9.5a3.5 3.5 0 0 0 0 7H13"/>'), h1: sv('<path d="M4 6v12M4 12h7M11 6v12M17 10l2-1v9"/>'), h2: sv('<path d="M4 6v12M4 12h7M11 6v12M15 10c0-1 1-2 2.5-2s2.5 1 2.5 2-1 2-2 3l-3 3h5"/>'), h3: sv('<path d="M4 6v12M4 12h7M11 6v12M15 9h5l-3 3.5c2 0 3 1 3 2.5s-1 2.5-2.5 2.5S15 16.5 15 16"/>'),
    table: sv('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16M15 4v16"/>'), code: sv('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 9l-3 3 3 3M15 9l3 3-3 3"/>'), quote: sv('<path d="M7 7h4v6H7a3 3 0 0 0 3 3M14 7h4v6h-4a3 3 0 0 0 3 3"/>'), hr: sv('<path d="M4 12h16"/>'),
    list: sv('<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1.2" fill="currentColor"/><circle cx="4.5" cy="12" r="1.2" fill="currentColor"/><circle cx="4.5" cy="18" r="1.2" fill="currentColor"/>'), ol: sv('<path d="M10 6h10M10 12h10M10 18h10"/><path d="M4 5h1v4M4 9h2M4 14.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5c0 1-3 2.5-3 2.5h3"/>'), check: sv('<rect x="3" y="5" width="14" height="14" rx="3"/><path d="M7 12l3 3 5-6"/>'), toggle: sv('<path d="M9 6l6 6-6 6"/>'),
    bold: sv('<path d="M7 4h6a4 4 0 0 1 0 8H7zM7 12h7a4 4 0 0 1 0 8H7z"/>'), italic: sv('<path d="M14 4h6M4 20h6M15 4l-6 16"/>'), underline: sv('<path d="M6 4v6a6 6 0 0 0 12 0V4M5 21h14"/>'), strike: sv('<path d="M16 6.5C15 5 13.5 4.5 12 4.5c-2.5 0-4.5 1.3-4.5 3.2 0 1.6 1.3 2.5 3 3M8 17.5c1 1.5 2.5 2 4 2 2.5 0 4.5-1.3 4.5-3.2 0-.6-.1-1-.4-1.5M4 12h16"/>'),
    color: sv('<path d="M6 17L12 3l6 14M8.5 12h7"/><path d="M4 21h16" stroke-width="3"/>'), highlight: sv('<path d="M4 20h6"/><path d="M14 4l6 6-8 8H8l-2-2 8-8z"/><path d="M12 6l6 6"/>'), image: I.image, link: sv('<path d="M10 14a4 4 0 0 0 5.6 0l3-3a4 4 0 0 0-5.6-5.6l-1.5 1.5"/><path d="M14 10a4 4 0 0 0-5.6 0l-3 3a4 4 0 0 0 5.6 5.6L12.5 17"/>'), plus: I.plus, chev: I.chev, tpl: I.note, emoji: sv('<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>'),
  };
  const EMOJI = [
    ['Smileys', [['😀', 'grinsen lachen smile'], ['😄', 'lachen happy'], ['😅', 'schwitzen nervös'], ['😂', 'tränen lachen'], ['🙂', 'lächeln'], ['😉', 'zwinkern'], ['😎', 'cool sonnenbrille'], ['🤔', 'nachdenken denken'], ['😐', 'neutral'], ['😴', 'müde schlafen'], ['😤', 'wütend frust'], ['😡', 'wut sauer'], ['😱', 'schock angst'], ['😭', 'weinen'], ['🤯', 'explodiert mind blown'], ['🥳', 'party feiern'], ['😬', 'peinlich grimasse'], ['🤑', 'geld gier'], ['🥶', 'kalt'], ['🤢', 'übel']]],
    ['Trading', [['📈', 'chart hoch steigend'], ['📉', 'chart runter fallend'], ['💰', 'geld gewinn'], ['💸', 'geld verlust'], ['🎯', 'ziel target'], ['🛑', 'stop'], ['⚠️', 'warnung achtung'], ['🔥', 'feuer heiß'], ['❄️', 'kalt ruhig'], ['🐂', 'bulle long'], ['🐻', 'bär short'], ['🏦', 'bank'], ['💎', 'diamant halten'], ['⏰', 'wecker zeit'], ['🧘', 'ruhe meditation'], ['🚀', 'rakete'], ['🎲', 'würfel zufall'], ['🧾', 'quittung']]],
    ['Gesten', [['👍', 'daumen hoch gut'], ['👎', 'daumen runter schlecht'], ['👏', 'klatschen applaus'], ['🙏', 'danke bitte'], ['💪', 'stark muskel'], ['🤝', 'handschlag deal'], ['✍️', 'schreiben'], ['👀', 'augen beobachten'], ['🧠', 'gehirn denken'], ['🫡', 'salut']]],
    ['Symbole', [['✅', 'haken erledigt ok'], ['❌', 'kreuz falsch nein'], ['⭐', 'stern favorit'], ['❗', 'ausrufezeichen wichtig'], ['❓', 'fragezeichen'], ['💡', 'idee glühbirne'], ['📌', 'pin merken'], ['🔑', 'schlüssel'], ['🏆', 'pokal sieg'], ['🥇', 'gold erster'], ['➡️', 'pfeil rechts'], ['⬆️', 'pfeil hoch'], ['⬇️', 'pfeil runter'], ['🔁', 'wiederholen'], ['💤', 'schlafen pause'], ['🔒', 'schloss']]],
    ['Natur', [['☀️', 'sonne'], ['🌧️', 'regen'], ['⛈️', 'gewitter sturm'], ['🌊', 'welle'], ['🌱', 'pflanze wachstum'], ['🌙', 'mond nacht'], ['⚡', 'blitz'], ['🌈', 'regenbogen'], ['🍀', 'klee glück'], ['🐢', 'schildkröte langsam']]],
    ['Objekte', [['📝', 'notiz schreiben'], ['📓', 'notizbuch'], ['📅', 'kalender'], ['☕', 'kaffee'], ['🖥️', 'computer'], ['📱', 'handy'], ['🎧', 'kopfhörer'], ['📊', 'balken statistik'], ['🏁', 'ziel flagge'], ['🎓', 'lernen']]],
  ];
  const YT = /https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/i;
  /* Farbangebot = Factory-Palette, je Format eine feste Liste (Reference-Lock 4: genau zwei chromatische Akzente,
     keine weiteren Hues, keine Zwischentöne). Schriftfarbe: die acht Neutralen (Obsidian bis Chalk) plus Metric Green
     und Signal Orange. Textmarker: die drei dunklen Neutralen als Fläche plus die beiden Akzente mit 35 % Deckkraft
     (rgba; Quill reicht rgba-Werte unverändert durch, nur rgb() wird zu Hex). Bereits gespeicherte Fremdfarben laden
     weiterhin, nur das Angebot ist eingeschränkt; freie Farben bleiben über „Eigene Farben“ möglich. */
  const NEUTRALS = ['#101010', '#1d1a18', '#3d3a39', '#4d4947', '#8a8380', '#b8b3b0', '#eeeeee', '#fafafa'];
  const ACCENTS = ['#a0ca92', '#ee6018'];
  const PALETTE = {
    color: [NEUTRALS, ACCENTS],
    background: [['#1d1a18', '#3d3a39', '#4d4947'], ['rgba(160,202,146,.35)', 'rgba(238,96,24,.35)']],
  };
  const BLOCKS = { text: 'Text', 1: 'Überschrift 1', 2: 'Überschrift 2', 3: 'Überschrift 3', bullet: 'Aufzählung', ordered: 'Nummerierte Liste', check: 'To-do-Liste', code: 'Code', quote: 'Zitat' };

  /* ---------- Toolbar ---------- */
  const btn = (act, icon, tip, extra = '') => `<button type="button" class="tb" data-ed="${act}" data-tip="${esc(tip)}" aria-label="${esc(tip)}" ${extra}>${icon}</button>`;
  const item = (act, icon, text, val = '') => `<button type="button" class="item" data-ed="${act}" data-value="${esc(val)}">${icon}<span class="grow">${esc(text)}</span><span class="chk">${I.check}</span></button>`;
  const palette = (kind, custom) => `<div class="ed-palette"><div class="sec">Eigene Farben</div><div class="row-c">${custom.map(c => `<button type="button" class="c" style="background:${esc(c)}" data-ed="${kind}" data-value="${esc(c)}" data-tip="${esc(c)}"></button>`).join('')}<label class="c add" data-tip="Eigene Farbe wählen">${I.plus}<input type="color" data-ed-custom="${kind}" aria-label="Eigene Farbe"></label></div><div class="sec">Standardfarben</div>${(PALETTE[kind] || PALETTE.color).map(row => `<div class="row-c">${row.map(c => `<button type="button" class="c" style="background:${c}" data-ed="${kind}" data-value="${c}"></button>`).join('')}</div>`).join('')}<div class="row-c" style="margin-top:6px"><button type="button" class="btn xs ghost" data-ed="${kind}" data-value="">Farbe entfernen</button></div></div>`;
  function toolbarHTML(p, o) {
    const tpls = (o.templates ? o.templates() : []);
    return `<div class="nb-toolbar" role="toolbar">
      <div class="popwrap"><button type="button" class="tb" data-pop="${p}insert" data-tip="Einfügen" aria-label="Einfügen">${E.plus}${E.chev}</button><div class="popover left ed-pop wide" id="pop-${p}insert"><div class="cols"><div><div class="sec">Grundbausteine</div>${item('text', E.para, 'Absatz')}${item('header', E.h1, 'Überschrift 1', '1')}${item('header', E.h2, 'Überschrift 2', '2')}${item('header', E.h3, 'Überschrift 3', '3')}${item('table', E.table, 'Tabelle')}${item('codeblock', E.code, 'Code')}${item('quote', E.quote, 'Zitat')}${item('divider', E.hr, 'Trennlinie')}${item('emoji', E.emoji, 'Emoji')}</div><div><div class="sec">Listen</div>${item('list', E.list, 'Aufzählung', 'bullet')}${item('list', E.ol, 'Nummerierte Liste', 'ordered')}${item('list', E.check, 'To-do-Liste', 'unchecked')}${item('details', E.toggle, 'Aufklappbare Liste')}<div class="sec">Vorlagen</div>${tpls.map(t => `<div class="row" style="gap:0"><button type="button" class="item grow" data-ed="template" data-value="${esc(t.id)}">${E.tpl}<span class="grow">${esc(t.name)}</span></button><button type="button" class="btn ghost icon xs" data-ed="template-edit" data-value="${esc(t.id)}" aria-label="Vorlage bearbeiten" data-tip="Bearbeiten">${I.edit}</button></div>`).join('')}${item('template-new', E.plus, 'Neue Vorlage …')}</div></div></div></div>
      <div class="popwrap"><button type="button" class="tb wide turn" data-pop="${p}turn" data-tip="Umwandeln in" aria-label="Umwandeln in"><span class="lbl">Text</span>${E.chev}</button><div class="popover left ed-pop" id="pop-${p}turn"><div class="sec">Umwandeln in</div>${item('text', E.para, 'Text', 'text')}${item('header', E.h1, 'Überschrift 1', '1')}${item('header', E.h2, 'Überschrift 2', '2')}${item('header', E.h3, 'Überschrift 3', '3')}${item('list', E.list, 'Aufzählung', 'bullet')}${item('list', E.ol, 'Nummerierte Liste', 'ordered')}${item('list', E.check, 'To-do-Liste', 'unchecked')}${item('details', E.toggle, 'Aufklappbare Liste')}${item('codeblock', E.code, 'Code', 'code')}${item('quote', E.quote, 'Zitat', 'quote')}</div></div>
      <span class="size"><button type="button" class="tb" data-ed="size-dec" data-tip="Kleiner" aria-label="Kleiner">${I.minus}</button><input type="number" class="sz" min="8" max="72" value="16" data-ed-input="size" aria-label="Schriftgröße"><button type="button" class="tb" data-ed="size-inc" data-tip="Größer" aria-label="Größer">${I.plus}</button></span><span class="sep"></span>
      ${btn('bold', E.bold, 'Fett (Strg+B)')}${btn('italic', E.italic, 'Kursiv (Strg+I)')}${btn('underline', E.underline, 'Unterstrichen (Strg+U)')}${btn('strike', E.strike, 'Durchgestrichen (Strg+Umschalt+M)')}
      <div class="popwrap"><button type="button" class="tb" data-pop="${p}color" data-tip="Schriftfarbe" aria-label="Schriftfarbe">${E.color}</button><div class="popover ed-pop" id="pop-${p}color">${palette('color', o.customColors ? o.customColors() : [])}</div></div>
      <div class="popwrap"><button type="button" class="tb" data-pop="${p}bg" data-tip="Textmarker" aria-label="Textmarker">${E.highlight}</button><div class="popover ed-pop" id="pop-${p}bg">${palette('background', o.customColors ? o.customColors() : [])}</div></div><span class="sep"></span>
      <div class="popwrap"><button type="button" class="tb" data-pop="${p}image" data-tip="Bild" aria-label="Bild">${E.image}${E.chev}</button><div class="popover ed-pop" id="pop-${p}image">${item('image', E.image, 'Vom Computer hochladen')}${item('image-url', E.link, 'Über Adresse einfügen')}</div></div>
    </div>`;
  }

  /* ---------- Editor ---------- */
  function create(container, o = {}) {
    const p = 'ed' + Math.random().toString(36).slice(2, 7) + '-';
    container.classList.add('nb-editor-wrap'); container.innerHTML = (o.readOnly ? '' : toolbarHTML(p, o)) + `<div class="nb-editor"></div><div class="nb-menu" hidden></div><div class="nb-ytpop" hidden><span>YouTube-Link erkannt</span><button type="button" class="btn xs primary" data-ed="yt-embed">Als Video einbetten</button><button type="button" class="btn xs" data-ed="yt-keep">Als Link lassen</button></div><input type="file" accept="image/*" class="hidden" data-ed-file="image">`;
    const editorEl = container.querySelector('.nb-editor'), menuEl = container.querySelector('.nb-menu'), ytPop = container.querySelector('.nb-ytpop');
    const quill = new Q(editorEl, { theme: 'snow', readOnly: !!o.readOnly, placeholder: o.placeholder || 'Schreib los …', modules: { toolbar: false, table: true, history: { delay: 400, userOnly: true }, keyboard: { bindings: { strike: { key: 'm', shortKey: true, shiftKey: true, handler() { quill.format('strike', !quill.getFormat().strike, 'user'); } } } }, uploader: { mimetypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'], handler(range, files) { insertImages(range ? range.index : quill.getLength(), files); } } } });
    if (o.content) quill.setContents(o.content, 'silent');
    const inst = { quill, container, destroy() { quill.disable(); container.innerHTML = ''; }, getContents: () => quill.getContents(), setContents: d => quill.setContents(d, 'silent'), focus: () => quill.focus(), insertDelta(delta) { const r = quill.getSelection(true); const idx = r ? r.index : quill.getLength() - 1; const Delta = Q.import('delta'); quill.updateContents(new Delta().retain(idx).concat(new Delta(delta.ops || delta)), 'user'); quill.setSelection(idx + (delta.ops || delta).reduce((a, op) => a + (typeof op.insert === 'string' ? op.insert.length : 1), 0), 'silent'); } };
    const emit = () => { if (o.onChange) o.onChange(quill.getContents()); };
    quill.on('text-change', (d, old, src) => { emit(); if (src === 'user') { checkSlash(); checkEmoji(); checkYouTube(d); } refreshState(); });
    quill.on('selection-change', r => { if (r) refreshState(); else hideMenu(); });
    container.addEventListener('nb-dirty', () => emit());
    if (o.readOnly) return inst;

    const tb = container.querySelector('.nb-toolbar');
    function blockKey(f) { if (f.header) return String(f.header); if (f.list) return f.list === 'checked' || f.list === 'unchecked' ? 'check' : f.list; if (f['code-block']) return 'code'; if (f.blockquote) return 'quote'; return 'text'; }
    function refreshState() {
      const r = quill.getSelection(); if (!r) return; const f = quill.getFormat(r); const bk = blockKey(f);
      ['bold', 'italic', 'underline', 'strike'].forEach(k => { const b = tb.querySelector(`[data-ed="${k}"]`); if (b) b.setAttribute('aria-pressed', !!f[k]); });
      const lbl = tb.querySelector('.turn .lbl'); if (lbl) lbl.textContent = BLOCKS[bk] || 'Text';
      tb.querySelectorAll(`#pop-${p}turn .item`).forEach(b => { const v = b.dataset.value; const act = b.dataset.ed; const on = act === 'header' ? bk === v : act === 'list' ? (v === 'unchecked' ? bk === 'check' : bk === v) : act === 'text' ? bk === 'text' : act === 'codeblock' ? bk === 'code' : act === 'quote' ? bk === 'quote' : false; b.setAttribute('aria-checked', on); });
      const sz = tb.querySelector('.sz'); if (sz && document.activeElement !== sz) sz.value = parseInt(f.size, 10) || 16;
      editorEl.classList.toggle('ph-bold', !!f.bold); editorEl.classList.toggle('ph-italic', !!f.italic);
    }
    const sel = () => quill.getSelection(true) || { index: quill.getLength() - 1, length: 0 };
    const tableMod = quill.getModule('table');
    const clearBlock = () => { quill.format('header', false, 'user'); quill.format('list', false, 'user'); quill.format('code-block', false, 'user'); quill.format('blockquote', false, 'user'); };
    const actions = {
      text: () => { clearBlock(); quill.format('size', false, 'user'); }, header: v => { clearBlock(); quill.format('header', Number(v), 'user'); },
      list: v => { const f = quill.getFormat(); const cur = f.list === 'checked' ? 'unchecked' : f.list; if (cur === v) quill.format('list', false, 'user'); else { clearBlock(); quill.format('list', v, 'user'); } },
      codeblock: () => { const on = quill.getFormat()['code-block']; clearBlock(); if (!on) quill.format('code-block', true, 'user'); }, quote: () => { const on = quill.getFormat().blockquote; clearBlock(); if (!on) quill.format('blockquote', true, 'user'); },
      table: () => { if (tableMod) tableMod.insertTable(3, 3); }, divider: () => insertEmbed('divider', true), details: () => insertEmbed('details', { summary: 'Abschnitt', html: '<p><br></p>', open: true }), emoji: () => openMenu('emoji', sel().index, '', true),
      'size-dec': () => setSize(curSize() - 1), 'size-inc': () => setSize(curSize() + 1),
      bold: () => quill.format('bold', !quill.getFormat().bold, 'user'), italic: () => quill.format('italic', !quill.getFormat().italic, 'user'), underline: () => quill.format('underline', !quill.getFormat().underline, 'user'), strike: () => quill.format('strike', !quill.getFormat().strike, 'user'),
      color: v => quill.format('color', v || false, 'user'), background: v => quill.format('background', v || false, 'user'),
      image: () => container.querySelector('[data-ed-file="image"]').click(), 'image-url': () => urlModal('Bild über Adresse einfügen', 'https://…/bild.png', url => { if (/^https?:\/\//i.test(url)) insertEmbed('figure', { src: url, caption: '' }); else U.toast('Bitte eine vollständige Adresse angeben', 'err'); }),
      template: v => { if (o.onTemplate) o.onTemplate(v); }, 'template-new': () => { if (o.onNewTemplate) o.onNewTemplate(); }, 'template-edit': v => { if (o.onEditTemplate) o.onEditTemplate(v); },
      'yt-embed': () => { if (ytPending) embedYouTube(ytPending.url, ytPending.index, ytPending.length); hideYt(); }, 'yt-keep': () => hideYt(),
    };
    const curSize = () => parseInt(quill.getFormat().size, 10) || 16; const setSize = n => { n = Math.max(8, Math.min(72, n)); quill.format('size', n === 16 ? false : n + 'px', 'user'); tb.querySelector('.sz').value = n; };
    container.addEventListener('click', e => { const b = e.target.closest('[data-ed]'); if (!b || !container.contains(b)) return; e.preventDefault(); const fn = actions[b.dataset.ed]; if (fn) fn(b.dataset.value); const pop = b.closest('.popover'); if (pop) pop.classList.remove('open'); if (!['image', 'image-url', 'template-new', 'template-edit', 'emoji'].includes(b.dataset.ed)) quill.focus(); });
    container.addEventListener('mousedown', e => { if (e.target.closest('.nb-toolbar') && !e.target.closest('input')) e.preventDefault(); });
    container.querySelector('.sz').addEventListener('change', e => setSize(parseInt(e.target.value, 10) || 16));
    container.querySelectorAll('[data-ed-custom]').forEach(inp => inp.addEventListener('input', () => { const kind = inp.dataset.edCustom; quill.format(kind, inp.value, 'user'); if (o.onCustomColor) o.onCustomColor(inp.value); }));
    container.querySelector('[data-ed-file="image"]').addEventListener('change', e => { insertImages(sel().index, [...e.target.files]); e.target.value = ''; });

    function insertEmbed(name, value) { const r = sel(); quill.insertEmbed(r.index, name, value, 'user'); quill.insertText(r.index + 1, '\n', 'user'); quill.setSelection(r.index + 2, 'silent'); }
    async function insertImages(index, files) { let idx = index; for (const f of files) { if (!f.type.startsWith('image/')) continue; const id = root.Blobs ? await root.Blobs.put(f).catch(() => null) : null; if (id) { quill.insertEmbed(idx, 'figure', { id, caption: '' }, 'user'); idx += 1; } else { const url = await new Promise(res => { const rd = new FileReader(); rd.onload = () => res(rd.result); rd.readAsDataURL(f); }); quill.insertEmbed(idx, 'figure', { src: url, caption: '' }, 'user'); idx += 1; } } quill.setSelection(idx, 'silent'); }
    function embedYouTube(url, index, length) { const m = String(url).match(YT); if (!m) return; const src = 'https://www.youtube.com/embed/' + m[1]; quill.deleteText(index, length, 'user'); quill.insertEmbed(index, 'video', src, 'user'); quill.setSelection(index + 1, 'silent'); }
    function urlModal(title, ph, cb) { U.modal(`<form><div class="modal-head"><h2>${esc(title)}</h2><button type="button" class="btn ghost icon" data-close aria-label="Schließen">${I.close}</button></div><div class="field"><label for="u-url">Adresse</label><input class="input" id="u-url" name="url" placeholder="${esc(ph)}" required></div><div class="modal-foot"><button type="button" class="btn" data-close>Abbrechen</button><button type="submit" class="btn primary">Einfügen</button></div></form>`, { cls: 'narrow', onMount(m) { m.querySelector('form').addEventListener('submit', e => { e.preventDefault(); const url = String(new FormData(e.target).get('url') || '').trim(); U.closeModal(); if (url) cb(url); }); } }); }

    /* Slash-Befehle und Emojis */
    const COMMANDS = [['text', E.para, 'Text'], ['header', E.h1, 'Überschrift 1', '1'], ['header', E.h2, 'Überschrift 2', '2'], ['header', E.h3, 'Überschrift 3', '3'], ['list', E.list, 'Aufzählung', 'bullet'], ['list', E.ol, 'Nummerierte Liste', 'ordered'], ['list', E.check, 'To-do-Liste', 'unchecked'], ['details', E.toggle, 'Aufklappbare Liste'], ['table', E.table, 'Tabelle'], ['image', E.image, 'Bild'], ['quote', E.quote, 'Zitat'], ['codeblock', E.code, 'Code'], ['divider', E.hr, 'Trennlinie']];
    let menu = null;
    function lineInfo() { const r = quill.getSelection(); if (!r) return null; const [line, offset] = quill.getLine(r.index); if (!line || !line.domNode) return null; return { r, line, offset, text: line.domNode.textContent || '', start: r.index - offset }; }
    function checkSlash() { const li = lineInfo(); if (!li) return; if (li.text.startsWith('/') && li.offset >= 1 && !/\s/.test(li.text.slice(1, li.offset))) openMenu('slash', li.start, li.text.slice(1, li.offset)); else if (menu && menu.kind === 'slash') hideMenu(); }
    function checkEmoji() { const li = lineInfo(); if (!li) return; const before = li.text.slice(0, li.offset); const m = before.match(/(?:^|\s):([\wäöüß]*)$/); if (m) openMenu('emoji', li.r.index - m[1].length - 1, m[1]); else if (menu && menu.kind === 'emoji') hideMenu(); }
    function openMenu(kind, start, query, manual = false) {
      const q = query.toLowerCase(); let items;
      if (kind === 'slash') items = COMMANDS.filter(c => c[2].toLowerCase().includes(q)).map(c => ({ icon: c[1], label: c[2], run: () => actions[c[0]](c[3]) }));
      else { items = []; for (const [cat, list] of EMOJI) for (const [e, kw] of list) if (!q || kw.includes(q) || cat.toLowerCase().includes(q)) items.push({ icon: `<span class="em">${e}</span>`, label: cat, emoji: e }); }
      if (!items.length) { hideMenu(); return; }
      menu = { kind, start, query, items: items.slice(0, kind === 'emoji' ? 60 : 30), sel: 0, manual }; renderMenu();
      const b = quill.getBounds(start); const box = editorEl.getBoundingClientRect(); menuEl.style.left = Math.max(0, Math.min(b.left, box.width - 300)) + 'px'; menuEl.style.top = (b.bottom + 6) + 'px'; menuEl.hidden = false;
    }
    function renderMenu() { if (!menu) return; if (menu.kind === 'emoji') menuEl.innerHTML = `<div class="head">Emoji${menu.query ? ` · „${esc(menu.query)}“` : ''}</div><div class="grid-em">${menu.items.map((it, i) => `<button type="button" class="${i === menu.sel ? 'on' : ''}" data-ed-menu="${i}" title="${esc(it.label)}">${it.icon}</button>`).join('')}</div>`; else menuEl.innerHTML = `<div class="head">Befehle${menu.query ? ` · „${esc(menu.query)}“` : ''}</div>${menu.items.map((it, i) => `<button type="button" class="row-item ${i === menu.sel ? 'on' : ''}" data-ed-menu="${i}">${it.icon}<span>${esc(it.label)}</span></button>`).join('')}`; }
    function hideMenu() { menu = null; menuEl.hidden = true; }
    function applyMenu(i) { if (!menu) return; const it = menu.items[i]; const m = menu; hideMenu(); if (m.kind === 'slash') { quill.deleteText(m.start, m.query.length + 1, 'user'); quill.setSelection(m.start, 'silent'); it.run(); } else { if (!m.manual) quill.deleteText(m.start, m.query.length + 1, 'user'); quill.insertText(m.start, it.emoji + ' ', 'user'); quill.setSelection(m.start + it.emoji.length + 1, 'silent'); } quill.focus(); }
    menuEl.addEventListener('mousedown', e => { e.preventDefault(); const b = e.target.closest('[data-ed-menu]'); if (b) applyMenu(Number(b.dataset.edMenu)); });
    editorEl.addEventListener('keydown', e => { if (!menu) return; const cols = menu.kind === 'emoji' ? 10 : 1; const stop = () => { e.preventDefault(); e.stopPropagation(); }; if (e.key === 'ArrowDown') { menu.sel = Math.min(menu.items.length - 1, menu.sel + cols); renderMenu(); stop(); } else if (e.key === 'ArrowUp') { menu.sel = Math.max(0, menu.sel - cols); renderMenu(); stop(); } else if (cols > 1 && e.key === 'ArrowRight') { menu.sel = Math.min(menu.items.length - 1, menu.sel + 1); renderMenu(); stop(); } else if (cols > 1 && e.key === 'ArrowLeft') { menu.sel = Math.max(0, menu.sel - 1); renderMenu(); stop(); } else if (e.key === 'Enter' || e.key === 'Tab') { applyMenu(menu.sel); stop(); } else if (e.key === 'Escape') { hideMenu(); stop(); } }, true);
    let ytPending = null;
    function checkYouTube(delta) { const ins = (delta.ops || []).map(op => typeof op.insert === 'string' ? op.insert : '').join(''); if (!YT.test(ins)) return; const li = lineInfo(); if (!li) return; const t = li.text.trim(); const m = t.match(YT); if (!m || t !== m[0]) return; ytPending = { url: t, index: li.start, length: li.text.length }; const b = quill.getBounds(li.start); ytPop.style.left = Math.max(0, b.left) + 'px'; ytPop.style.top = (b.bottom + 6) + 'px'; ytPop.hidden = false; }
    function hideYt() { ytPending = null; ytPop.hidden = true; }
    quill.on('selection-change', r => { if (ytPending && r && (r.index < ytPending.index || r.index > ytPending.index + ytPending.length)) hideYt(); });
    refreshState();
    return inst;
  }
  function toHTML(delta) { const div = document.createElement('div'); div.style.cssText = 'position:absolute;left:-9999px;top:0;width:800px'; document.body.appendChild(div); const q = new Q(div, { theme: null, readOnly: true, modules: { toolbar: false, table: true } }); q.setContents(delta, 'silent'); const html = q.root.innerHTML; div.remove(); return html; }
  root.NoteEditor = { create, toHTML, EMOJI, YT, sanitize, PALETTE };
})(typeof self !== 'undefined' ? self : this);
