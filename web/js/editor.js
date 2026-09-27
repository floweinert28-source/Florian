/* Notiz-Editor auf Basis von Quill 2: Toolbar, Blots (Bild mit Unterschrift, Trennlinie, Abschnitt, Tweet),
   Slash-Befehle, Emoji-Auswahl, Bild-Upload in IndexedDB, YouTube-Erkennung, Spracheingabe, Vollbild */
(function (root) {
  'use strict';
  const Q = root.Quill; if (!Q) { console.warn('Quill fehlt'); return; }
  const U = root.UI, esc = U.esc, I = U.I;

  /* ---------- Formate ---------- */
  const Size = Q.import('attributors/style/size'); Size.whitelist = null; Q.register(Size, true);
  const Font = Q.import('attributors/style/font'); Font.whitelist = null; Q.register(Font, true);
  const BlockEmbed = Q.import('blots/block/embed');
  const FONTS = ['Arial', 'Inter', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana'];
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
      const rs = node.querySelector('.rs'); rs.addEventListener('mousedown', e => { e.preventDefault(); e.stopPropagation(); const startX = e.clientX, startW = img.getBoundingClientRect().width, maxW = node.getBoundingClientRect().width; const move = ev => { const w = Math.max(80, Math.min(maxW, startW + ev.clientX - startX)); img.style.width = Math.round(w / maxW * 100) + '%'; }; const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); dirty(node); }; document.addEventListener('mousemove', move); document.addEventListener('mouseup', up); });
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
      sum.addEventListener('click', e => { e.preventDefault(); }); sum.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); body.focus(); } });
      node.addEventListener('toggle', () => dirty(node));
      return node;
    }
    static value(node) { return { summary: node.querySelector('summary').textContent, html: sanitize(node.querySelector('.body').innerHTML), open: node.open }; }
  }
  Details.blotName = 'details'; Details.tagName = 'details'; Details.className = 'nb-details';

  class Tweet extends BlockEmbed {
    static create(url) { const node = super.create(); node.setAttribute('contenteditable', 'false'); const safe = /^https:\/\/(x\.com|twitter\.com)\//.test(url) ? url : ''; node.innerHTML = `<blockquote class="twitter-tweet"><a href="${esc(safe)}" target="_blank" rel="noopener">${esc(safe || 'Ungültiger Link')}</a></blockquote>`; if (safe) loadTwitter(); return node; }
    static value(node) { const a = node.querySelector('a'); return a ? a.getAttribute('href') : ''; }
  }
  Tweet.blotName = 'tweet'; Tweet.tagName = 'div'; Tweet.className = 'nb-tweet';
  function loadTwitter() { if (root.twttr) { try { root.twttr.widgets.load(); } catch (e) {} return; } if (document.getElementById('twttr-js')) return; const s = document.createElement('script'); s.id = 'twttr-js'; s.async = true; s.src = 'https://platform.twitter.com/widgets.js'; s.onerror = () => {}; document.head.appendChild(s); }
  [Divider, Figure, Details, Tweet].forEach(b => Q.register(b, true));

  /* ---------- Symbole ---------- */
  const sv = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const E = {
    full: sv('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>'), undo: sv('<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>'), redo: sv('<path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>'),
    mic: I.mic, list: sv('<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1.2" fill="currentColor"/><circle cx="4.5" cy="12" r="1.2" fill="currentColor"/><circle cx="4.5" cy="18" r="1.2" fill="currentColor"/>'),
    ol: sv('<path d="M10 6h10M10 12h10M10 18h10"/><path d="M4 5h1v4M4 9h2M4 14.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5c0 1-3 2.5-3 2.5h3"/>'), check: sv('<path d="M10 6h10M10 12h10M10 18h10"/><path d="M3 6l1.5 1.5L7 5M3 12l1.5 1.5L7 11M3 18l1.5 1.5L7 17"/>'),
    font: sv('<path d="M5 5h14M12 5v14M8 19h8"/>'), bold: sv('<path d="M7 4h6a4 4 0 0 1 0 8H7zM7 12h7a4 4 0 0 1 0 8H7z"/>'), italic: sv('<path d="M14 4h6M4 20h6M15 4l-6 16"/>'), underline: sv('<path d="M6 4v6a6 6 0 0 0 12 0V4M5 21h14"/>'),
    code: sv('<path d="M8 7l-5 5 5 5M16 7l5 5-5 5"/>'), link: sv('<path d="M10 14a4 4 0 0 0 5.6 0l3-3a4 4 0 0 0-5.6-5.6l-1.5 1.5"/><path d="M14 10a4 4 0 0 0-5.6 0l-3 3a4 4 0 0 0 5.6 5.6L12.5 17"/>'),
    color: sv('<path d="M6 17L12 3l6 14M8.5 12h7"/><path d="M4 21h16" stroke-width="3"/>'), fill: sv('<path d="M4 12l8-8 7 7-8 8z"/><path d="M12 4l-2-2M20 15c0 1.7-1 3-2 3s-2-1.3-2-3 2-4 2-4 2 2.3 2 4z" fill="currentColor"/>'),
    plus: I.plus, aa: sv('<path d="M3 18l4.5-12L12 18M5 14h5"/><path d="M14 18l3-8 3 8M15.2 15.5h3.6"/>'), alignL: sv('<path d="M4 6h16M4 12h10M4 18h14"/>'), alignC: sv('<path d="M4 6h16M7 12h10M5 18h14"/>'), alignR: sv('<path d="M4 6h16M10 12h10M6 18h14"/>'), alignJ: sv('<path d="M4 6h16M4 12h16M4 18h16"/>'),
    import: I.upload, export: I.download, pdf: sv('<path d="M6 3h9l5 5v13H6z"/><path d="M14 3v6h6"/><path d="M8 17v-4h1.5a1.5 1.5 0 0 1 0 3H8M12.5 13v4h1a2 2 0 0 0 0-4h-1M16.5 17v-4h2.5M16.5 15h2"/>'), trash: I.trash, ai: I.sparkle, chev: I.chev,
    table: sv('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16M15 4v16"/>'), image: I.image, hr: sv('<path d="M4 12h16"/><path d="M4 5h6M14 5h6M4 19h6M14 19h6" stroke-opacity=".4"/>'), quote: sv('<path d="M7 7h4v6H7a3 3 0 0 0 3 3M14 7h4v6h-4a3 3 0 0 0 3 3"/>'),
    codeblock: sv('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 9l-3 3 3 3M15 9l3 3-3 3"/>'), details: sv('<path d="M7 5l6 4-6 4z" fill="currentColor"/><path d="M5 17h14M5 21h9"/>'), youtube: sv('<rect x="2" y="5" width="20" height="14" rx="4"/><path d="M10 9l5 3-5 3z" fill="currentColor"/>'), tweet: sv('<path d="M4 4l16 16M20 4L4 20"/>'), text: sv('<path d="M5 6h14M12 6v13"/>'), h1: sv('<path d="M4 6v12M4 12h7M11 6v12M17 10l2-1v9"/>'), h2: sv('<path d="M4 6v12M4 12h7M11 6v12M15 10c0-1 1-2 2.5-2s2.5 1 2.5 2-1 2-2 3l-3 3h5"/>'), h3: sv('<path d="M4 6v12M4 12h7M11 6v12M15 9h5l-3 3.5c2 0 3 1 3 2.5s-1 2.5-2.5 2.5S15 16.5 15 16"/>'), small: sv('<path d="M6 8h12M12 8v10"/>'), emoji: sv('<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/>'),
  };

  /* ---------- Emojis ---------- */
  const EMOJI = [
    ['Smileys', [['😀', 'grinsen lachen smile'], ['😄', 'lachen happy'], ['😅', 'schwitzen nervös'], ['😂', 'tränen lachen'], ['🙂', 'lächeln'], ['😉', 'zwinkern'], ['😎', 'cool sonnenbrille'], ['🤔', 'nachdenken denken'], ['😐', 'neutral'], ['😴', 'müde schlafen'], ['😤', 'wütend frust'], ['😡', 'wut sauer'], ['😱', 'schock angst'], ['😭', 'weinen'], ['🤯', 'explodiert mind blown'], ['🥳', 'party feiern'], ['😬', 'peinlich grimasse'], ['🤑', 'geld gier'], ['🥶', 'kalt'], ['🤢', 'übel']]],
    ['Gesten', [['👍', 'daumen hoch gut'], ['👎', 'daumen runter schlecht'], ['👏', 'klatschen applaus'], ['🙏', 'danke bitte'], ['💪', 'stark muskel'], ['🤝', 'handschlag deal'], ['✍️', 'schreiben'], ['👀', 'augen beobachten'], ['🧠', 'gehirn denken'], ['🫡', 'salut']]],
    ['Trading', [['📈', 'chart hoch steigend'], ['📉', 'chart runter fallend'], ['💰', 'geld gewinn'], ['💸', 'geld verlust'], ['🎯', 'ziel target'], ['🛑', 'stop'], ['⚠️', 'warnung achtung'], ['🔥', 'feuer heiß'], ['❄️', 'kalt ruhig'], ['🐂', 'bulle long'], ['🐻', 'bär short'], ['🏦', 'bank'], ['💎', 'diamant halten'], ['⏰', 'wecker zeit'], ['🧘', 'ruhe meditation'], ['🚀', 'rakete'], ['🎲', 'würfel zufall'], ['🧾', 'quittung']]],
    ['Symbole', [['✅', 'haken erledigt ok'], ['❌', 'kreuz falsch nein'], ['⭐', 'stern favorit'], ['❗', 'ausrufezeichen wichtig'], ['❓', 'fragezeichen'], ['💡', 'idee glühbirne'], ['📌', 'pin merken'], ['🔑', 'schlüssel'], ['🏆', 'pokal sieg'], ['🥇', 'gold erster'], ['➡️', 'pfeil rechts'], ['⬆️', 'pfeil hoch'], ['⬇️', 'pfeil runter'], ['🔁', 'wiederholen'], ['💤', 'schlafen pause'], ['🔒', 'schloss']]],
    ['Natur', [['☀️', 'sonne'], ['🌧️', 'regen'], ['⛈️', 'gewitter sturm'], ['🌊', 'welle'], ['🌱', 'pflanze wachstum'], ['🌙', 'mond nacht'], ['⚡', 'blitz'], ['🌈', 'regenbogen'], ['🍀', 'klee glück'], ['🐢', 'schildkröte langsam']]],
    ['Objekte', [['📝', 'notiz schreiben'], ['📓', 'notizbuch'], ['📅', 'kalender'], ['☕', 'kaffee'], ['🍎', 'apfel'], ['🖥️', 'computer'], ['📱', 'handy'], ['🎧', 'kopfhörer'], ['📊', 'balken statistik'], ['🧮', 'abakus rechnen'], ['🏁', 'ziel flagge'], ['🎓', 'lernen']]],
  ];
  const YT = /https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/i;

  /* ---------- Toolbar ---------- */
  const btn = (act, icon, tip, extra = '') => `<button type="button" class="tb" data-ed="${act}" data-tip="${esc(tip)}" aria-label="${esc(tip)}" ${extra}>${icon}</button>`;
  const drop = (id, icon, tip, items, label = '') => `<div class="popwrap"><button type="button" class="tb ${label ? 'wide' : ''}" data-pop="${id}" data-tip="${esc(tip)}" aria-label="${esc(tip)}">${icon}${label ? `<span class="lbl">${label}</span>` : ''}${E.chev}</button><div class="popover left ed-pop" id="pop-${id}">${items}</div></div>`;
  const item = (act, icon, text, val = '') => `<button type="button" class="item" data-ed="${act}" data-value="${esc(val)}">${icon}${esc(text)}</button>`;
  function toolbarHTML(p, o) {
    return `<div class="nb-toolbar" role="toolbar">
      ${btn('full', E.full, 'Vollbild')}<span class="sep"></span>
      ${btn('undo', E.undo, 'Rückgängig (Strg+Z)')}${btn('redo', E.redo, 'Wiederholen (Strg+Shift+Z)')}<span class="sep"></span>
      ${btn('mic', E.mic, 'Spracheingabe')}<span class="sep"></span>
      ${drop(p + 'list', E.list, 'Listen', item('list', E.list, 'Aufzählung', 'bullet') + item('list', E.ol, 'Nummerierte Liste', 'ordered') + item('list', E.check, 'Checkliste', 'unchecked'))}<span class="sep"></span>
      ${drop(p + 'font', E.font, 'Schriftart', FONTS.map(f => item('font', '', f, f)).join(''), 'Arial')}
      <span class="size"><button type="button" class="tb" data-ed="size-dec" data-tip="Kleiner" aria-label="Kleiner">${I.minus}</button><input type="number" class="sz" min="8" max="72" value="15" data-ed-input="size" aria-label="Schriftgröße"><button type="button" class="tb" data-ed="size-inc" data-tip="Größer" aria-label="Größer">${I.plus}</button></span><span class="sep"></span>
      ${btn('bold', E.bold, 'Fett (Strg+B)')}${btn('italic', E.italic, 'Kursiv (Strg+I)')}${btn('underline', E.underline, 'Unterstrichen (Strg+U)')}${btn('code', E.code, 'Code')}${btn('link', E.link, 'Link einfügen')}<span class="sep"></span>
      <span class="colorbtn" data-tip="Schriftfarbe"><span class="tb">${E.color}</span><input type="color" data-ed-input="color" value="#34f58a" aria-label="Schriftfarbe"></span><span class="colorbtn" data-tip="Hintergrundfarbe"><span class="tb">${E.fill}</span><input type="color" data-ed-input="background" value="#f5b93a" aria-label="Hintergrundfarbe"></span><span class="sep"></span>
      ${drop(p + 'insert', E.plus, 'Einfügen', item('table', E.table, 'Tabelle (3×3)') + item('image', E.image, 'Bild') + item('divider', E.hr, 'Trennlinie') + item('quote', E.quote, 'Zitat') + item('codeblock', E.codeblock, 'Codeblock') + item('details', E.details, 'Aufklappbarer Abschnitt') + item('youtube', E.youtube, 'YouTube-Video') + item('tweet', E.tweet, 'Tweet einbetten') + item('emoji', E.emoji, 'Emoji') + `<hr><div class="sec">Tabelle (Cursor in Tabelle)</div>` + item('table-row', E.table, 'Zeile darunter') + item('table-col', E.table, 'Spalte rechts') + item('table-delrow', E.trash, 'Zeile löschen') + item('table-del', E.trash, 'Tabelle löschen'))}
      ${drop(p + 'para', E.aa, 'Absatzformat', item('header', E.h1, 'Überschrift', '1') + item('header', E.h2, 'Unterüberschrift', '2') + item('header', E.h3, 'Kleine Überschrift', '3') + item('text', E.text, 'Normaler Text') + item('small', E.small, 'Kleiner Text'))}
      ${drop(p + 'align', E.alignL, 'Ausrichtung', item('align', E.alignL, 'Links', '') + item('align', E.alignC, 'Zentriert', 'center') + item('align', E.alignR, 'Rechts', 'right') + item('align', E.alignJ, 'Blocksatz', 'justify'))}<span class="sep"></span>
      ${o.minimal ? '' : btn('import', E.import, 'Notiz aus Datei laden') + btn('export', E.export, 'Als JSON-Datei speichern') + btn('pdf', E.pdf, 'Als PDF herunterladen') + btn('delete', E.trash, 'Notiz löschen')}
      <span class="grow"></span>${o.minimal ? '' : `<button type="button" class="tb ai" data-ed="ai" data-tip="KI-Anbindung noch nicht verbunden">${E.ai}<span class="lbl">Mit KI schreiben</span></button>`}
    </div>`;
  }

  /* ---------- Editor ---------- */
  function create(container, o = {}) {
    const p = 'ed' + Math.random().toString(36).slice(2, 7) + '-';
    container.classList.add('nb-editor-wrap'); container.innerHTML = (o.readOnly ? '' : toolbarHTML(p, o)) + `<div class="nb-editor"></div><div class="nb-menu" hidden></div><div class="nb-ytpop" hidden><span>YouTube-Link erkannt</span><button type="button" class="btn xs primary" data-ed="yt-embed">Als Video einbetten</button><button type="button" class="btn xs" data-ed="yt-keep">Als Link lassen</button></div><input type="file" accept="image/*" class="hidden" data-ed-file="image"><input type="file" accept="application/json,.json" class="hidden" data-ed-file="import">`;
    const editorEl = container.querySelector('.nb-editor'), menuEl = container.querySelector('.nb-menu'), ytPop = container.querySelector('.nb-ytpop');
    const quill = new Q(editorEl, { theme: 'snow', readOnly: !!o.readOnly, placeholder: o.placeholder || 'Schreib los … „/“ für Befehle, „:“ für Emojis', modules: { toolbar: false, table: true, history: { delay: 400, userOnly: true }, uploader: { mimetypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'], handler(range, files) { insertImages(range ? range.index : quill.getLength(), files); } } } });
    if (o.content) quill.setContents(o.content, 'silent');
    const inst = { quill, container, destroy() { quill.disable(); stopMic(); container.innerHTML = ''; }, getContents: () => quill.getContents(), setContents: d => quill.setContents(d, 'silent'), focus: () => quill.focus(), insertDelta(delta) { const r = quill.getSelection(true); const idx = r ? r.index : quill.getLength() - 1; const Delta = Q.import('delta'); quill.updateContents(new Delta().retain(idx).concat(new Delta(delta.ops || delta)), 'user'); quill.setSelection(idx + (delta.ops || delta).reduce((a, op) => a + (typeof op.insert === 'string' ? op.insert.length : 1), 0), 'silent'); }, toggleFullscreen() { container.classList.toggle('nb-fullscreen'); } };
    const emit = () => { if (o.onChange) o.onChange(quill.getContents()); };
    quill.on('text-change', (d, old, src) => { emit(); if (src === 'user') { checkSlash(); checkEmoji(); checkYouTube(d); } refreshState(); });
    quill.on('selection-change', r => { if (r) refreshState(); if (!r) { hideMenu(); } });
    container.addEventListener('nb-dirty', () => emit());
    if (o.readOnly) return inst;

    /* Zustand der Toolbar */
    const tb = container.querySelector('.nb-toolbar');
    function refreshState() {
      const r = quill.getSelection(); if (!r) return; const f = quill.getFormat(r);
      ['bold', 'italic', 'underline', 'code', 'link'].forEach(k => { const b = tb.querySelector(`[data-ed="${k}"]`); if (b) b.setAttribute('aria-pressed', !!f[k]); });
      tb.querySelectorAll('[data-ed="list"]').forEach(b => b.setAttribute('aria-checked', f.list === b.dataset.value || (b.dataset.value === 'unchecked' && f.list === 'checked')));
      tb.querySelectorAll('[data-ed="align"]').forEach(b => b.setAttribute('aria-checked', (f.align || '') === b.dataset.value));
      tb.querySelectorAll('[data-ed="header"]').forEach(b => b.setAttribute('aria-checked', String(f.header || '') === b.dataset.value));
      const fontLbl = tb.querySelector(`[data-pop="${p}font"] .lbl`); if (fontLbl) fontLbl.textContent = f.font || 'Arial';
      const sz = tb.querySelector('.sz'); if (sz && document.activeElement !== sz) sz.value = parseInt(f.size, 10) || 15;
    }
    const sel = () => quill.getSelection(true) || { index: quill.getLength() - 1, length: 0 };
    const tableMod = quill.getModule('table');
    const actions = {
      full: () => inst.toggleFullscreen(), undo: () => quill.history.undo(), redo: () => quill.history.redo(), mic: () => toggleMic(),
      list: v => { const f = quill.getFormat(); const cur = f.list === 'checked' ? 'unchecked' : f.list; quill.format('list', cur === v ? false : v, 'user'); }, font: v => quill.format('font', v === 'Arial' ? false : v, 'user'),
      'size-dec': () => setSize(curSize() - 1), 'size-inc': () => setSize(curSize() + 1),
      bold: () => quill.format('bold', !quill.getFormat().bold, 'user'), italic: () => quill.format('italic', !quill.getFormat().italic, 'user'), underline: () => quill.format('underline', !quill.getFormat().underline, 'user'), code: () => quill.format('code', !quill.getFormat().code, 'user'),
      link: () => linkModal(), table: () => { const r = sel(); if (!tableMod) return; tableMod.insertTable(3, 3); }, 'table-row': () => tableMod && tableMod.insertRowBelow(), 'table-col': () => tableMod && tableMod.insertColumnRight(), 'table-delrow': () => tableMod && tableMod.deleteRow(), 'table-del': () => tableMod && tableMod.deleteTable(),
      image: () => container.querySelector('[data-ed-file="image"]').click(), divider: () => insertEmbed('divider', true), quote: () => quill.format('blockquote', !quill.getFormat().blockquote, 'user'), codeblock: () => quill.format('code-block', !quill.getFormat()['code-block'], 'user'),
      details: () => insertEmbed('details', { summary: 'Abschnitt', html: '<p><br></p>', open: true }), youtube: () => urlModal('YouTube-Link', 'https://www.youtube.com/watch?v=…', url => embedYouTube(url)), tweet: () => urlModal('Tweet-Link', 'https://x.com/…/status/…', url => insertEmbed('tweet', url)), emoji: () => openEmoji(null),
      header: v => quill.format('header', Number(v), 'user'), text: () => { quill.format('header', false, 'user'); quill.format('size', false, 'user'); }, small: () => { quill.format('header', false, 'user'); quill.format('size', '12px', 'user'); }, align: v => quill.format('align', v || false, 'user'),
      import: () => container.querySelector('[data-ed-file="import"]').click(), export: () => o.onAction && o.onAction('export'), pdf: () => o.onAction && o.onAction('pdf'), delete: () => o.onAction && o.onAction('delete'), ai: () => U.toast('Die KI-Anbindung ist noch nicht verbunden.'),
      'yt-embed': () => { if (ytPending) { embedYouTube(ytPending.url, ytPending.index, ytPending.length); } hideYt(); }, 'yt-keep': () => hideYt(),
    };
    const curSize = () => parseInt(quill.getFormat().size, 10) || 15; const setSize = n => { n = Math.max(8, Math.min(72, n)); quill.format('size', n === 15 ? false : n + 'px', 'user'); tb.querySelector('.sz').value = n; };
    container.addEventListener('click', e => { const b = e.target.closest('[data-ed]'); if (!b || !container.contains(b)) return; e.preventDefault(); const fn = actions[b.dataset.ed]; if (fn) { fn(b.dataset.value); } if (b.closest('.popover')) b.closest('.popover').classList.remove('open'); if (!['import', 'export', 'pdf', 'delete', 'image', 'link', 'youtube', 'tweet', 'emoji', 'mic', 'full'].includes(b.dataset.ed)) quill.focus(); });
    container.addEventListener('mousedown', e => { if (e.target.closest('.nb-toolbar') && !e.target.closest('input')) e.preventDefault(); });
    container.querySelector('.sz').addEventListener('change', e => setSize(parseInt(e.target.value, 10) || 15));
    container.querySelectorAll('[data-ed-input="color"],[data-ed-input="background"]').forEach(inp => inp.addEventListener('input', () => { quill.format(inp.dataset.edInput, inp.value, 'user'); }));
    container.querySelector('[data-ed-file="image"]').addEventListener('change', e => { insertImages(sel().index, [...e.target.files]); e.target.value = ''; });
    container.querySelector('[data-ed-file="import"]').addEventListener('change', e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { const j = JSON.parse(r.result); const delta = j.ops ? j : j.note && j.note.content ? j.note.content : j.content; if (!delta || !delta.ops) throw new Error('Kein Notiz-Format'); quill.setContents(delta, 'user'); U.toast('Notiz geladen', 'ok'); if (o.onAction && j.note && j.note.title) o.onAction('imported-title', j.note.title); } catch (err) { U.toast('Datei nicht lesbar: ' + err.message, 'err'); } }; r.readAsText(f); e.target.value = ''; });

    function insertEmbed(name, value) { const r = sel(); quill.insertEmbed(r.index, name, value, 'user'); quill.insertText(r.index + 1, '\n', 'user'); quill.setSelection(r.index + 2, 'silent'); }
    async function insertImages(index, files) { let idx = index; for (const f of files) { if (!f.type.startsWith('image/')) continue; const id = root.Blobs ? await root.Blobs.put(f).catch(() => null) : null; if (id) { quill.insertEmbed(idx, 'figure', { id, caption: '' }, 'user'); idx += 1; } else { const url = await new Promise(res => { const rd = new FileReader(); rd.onload = () => res(rd.result); rd.readAsDataURL(f); }); quill.insertEmbed(idx, 'figure', { src: url, caption: '' }, 'user'); idx += 1; } } quill.setSelection(idx, 'silent'); }
    function embedYouTube(url, index, length) { const m = String(url).match(YT); if (!m) { U.toast('Kein YouTube-Link erkannt', 'err'); return; } const src = 'https://www.youtube.com/embed/' + m[1]; if (index != null) { quill.deleteText(index, length, 'user'); quill.insertEmbed(index, 'video', src, 'user'); quill.setSelection(index + 1, 'silent'); } else insertEmbed('video', src); }
    function linkModal() { const r = sel(); const f = quill.getFormat(r); const text = r.length ? quill.getText(r.index, r.length) : ''; U.modal(`<form data-ed-form="link"><div class="modal-head"><h2>Link einfügen</h2><button type="button" class="btn ghost icon" data-close aria-label="Schließen">${I.close}</button></div><div class="form-grid"><div class="field span2"><label for="lk-url">Adresse</label><input class="input" id="lk-url" name="url" value="${esc(f.link || '')}" placeholder="https://…" required></div>${r.length ? '' : `<div class="field span2"><label for="lk-text">Text</label><input class="input" id="lk-text" name="text" value="${esc(f.link || '')}" placeholder="Linktext"></div>`}</div><div class="modal-foot">${f.link ? `<button type="button" class="btn ghost left" data-ed-unlink>Link entfernen</button>` : ''}<button type="button" class="btn" data-close>Abbrechen</button><button type="submit" class="btn primary">Einfügen</button></div></form>`, { cls: 'narrow', onMount(m) { m.querySelector('form').addEventListener('submit', e => { e.preventDefault(); const fd = new FormData(e.target); let url = String(fd.get('url') || '').trim(); if (!url) return; if (!/^https?:\/\/|^mailto:/i.test(url)) url = 'https://' + url; if (r.length) quill.formatText(r.index, r.length, 'link', url, 'user'); else { const t = String(fd.get('text') || url); quill.insertText(r.index, t, { link: url }, 'user'); quill.setSelection(r.index + t.length, 'silent'); } U.closeModal(); }); const un = m.querySelector('[data-ed-unlink]'); if (un) un.addEventListener('click', () => { quill.formatText(r.index, Math.max(r.length, 1), 'link', false, 'user'); U.closeModal(); }); } }); }
    function urlModal(title, ph, cb) { U.modal(`<form><div class="modal-head"><h2>${esc(title)}</h2><button type="button" class="btn ghost icon" data-close aria-label="Schließen">${I.close}</button></div><div class="field"><label for="u-url">Adresse</label><input class="input" id="u-url" name="url" placeholder="${esc(ph)}" required></div><div class="modal-foot"><button type="button" class="btn" data-close>Abbrechen</button><button type="submit" class="btn primary">Einfügen</button></div></form>`, { cls: 'narrow', onMount(m) { m.querySelector('form').addEventListener('submit', e => { e.preventDefault(); const url = String(new FormData(e.target).get('url') || '').trim(); U.closeModal(); if (url) cb(url); }); } }); }

    /* Slash-Befehle und Emojis */
    const COMMANDS = [['text', E.text, 'Normaler Text'], ['header', E.h1, 'Überschrift 1', '1'], ['header', E.h2, 'Überschrift 2', '2'], ['header', E.h3, 'Überschrift 3', '3'], ['list', E.list, 'Aufzählung', 'bullet'], ['list', E.ol, 'Nummerierte Liste', 'ordered'], ['list', E.check, 'Checkliste', 'unchecked'], ['table', E.table, 'Tabelle'], ['image', E.image, 'Bild'], ['quote', E.quote, 'Zitat'], ['codeblock', E.codeblock, 'Code'], ['divider', E.hr, 'Trennlinie'], ['details', E.details, 'Aufklappbarer Abschnitt'], ['align', E.alignL, 'Ausrichtung: links', ''], ['align', E.alignC, 'Ausrichtung: zentriert', 'center'], ['align', E.alignR, 'Ausrichtung: rechts', 'right'], ['youtube', E.youtube, 'YouTube einbetten'], ['tweet', E.tweet, 'Tweet einbetten']];
    let menu = null; /* { kind: 'slash'|'emoji', start, query, items, sel } */
    function lineInfo() { const r = quill.getSelection(); if (!r) return null; const [line, offset] = quill.getLine(r.index); if (!line || !line.domNode) return null; return { r, line, offset, text: line.domNode.textContent || '', start: r.index - offset }; }
    function checkSlash() { const li = lineInfo(); if (!li) return; if (li.text.startsWith('/') && li.offset >= 1 && !/\s/.test(li.text.slice(1, li.offset))) { openMenu('slash', li.start, li.text.slice(1, li.offset)); } else if (menu && menu.kind === 'slash') hideMenu(); }
    function checkEmoji() { const li = lineInfo(); if (!li) return; const before = li.text.slice(0, li.offset); const m = before.match(/(?:^|\s):([\wäöüß]*)$/); if (m) openMenu('emoji', li.r.index - m[1].length - 1, m[1]); else if (menu && menu.kind === 'emoji') hideMenu(); }
    function openEmoji() { const r = sel(); openMenu('emoji', r.index, '', true); }
    function openMenu(kind, start, query, manual = false) {
      const q = query.toLowerCase(); let items;
      if (kind === 'slash') items = COMMANDS.filter(c => c[2].toLowerCase().includes(q)).map(c => ({ icon: c[1], label: c[2], run: () => actions[c[0]](c[3]) }));
      else { items = []; for (const [cat, list] of EMOJI) for (const [e, kw] of list) if (!q || kw.includes(q) || cat.toLowerCase().includes(q)) items.push({ icon: `<span class="em">${e}</span>`, label: cat, emoji: e }); }
      if (!items.length) { hideMenu(); return; }
      menu = { kind, start, query, items: items.slice(0, kind === 'emoji' ? 60 : 30), sel: 0, manual };
      renderMenu();
      const b = quill.getBounds(start); const box = editorEl.getBoundingClientRect(); menuEl.style.left = Math.min(b.left, box.width - 300) + 'px'; menuEl.style.top = (b.bottom + 6) + 'px'; menuEl.hidden = false;
    }
    function renderMenu() { if (!menu) return; if (menu.kind === 'emoji') menuEl.innerHTML = `<div class="head">Emoji${menu.query ? ` · „${esc(menu.query)}“` : ''} <input class="input" placeholder="Suchen" data-ed-emoji-q hidden></div><div class="grid-em">${menu.items.map((it, i) => `<button type="button" class="${i === menu.sel ? 'on' : ''}" data-ed-menu="${i}" title="${esc(it.label)}">${it.icon}</button>`).join('')}</div>`; else menuEl.innerHTML = `<div class="head">Befehle${menu.query ? ` · „${esc(menu.query)}“` : ''}</div>${menu.items.map((it, i) => `<button type="button" class="row-item ${i === menu.sel ? 'on' : ''}" data-ed-menu="${i}">${it.icon}<span>${esc(it.label)}</span></button>`).join('')}`; }
    function hideMenu() { menu = null; menuEl.hidden = true; }
    function applyMenu(i) { if (!menu) return; const it = menu.items[i]; const m = menu; hideMenu(); if (m.kind === 'slash') { quill.deleteText(m.start, m.query.length + 1, 'user'); quill.setSelection(m.start, 'silent'); it.run(); } else { if (!m.manual) quill.deleteText(m.start, m.query.length + 1, 'user'); quill.insertText(m.start, it.emoji + ' ', 'user'); quill.setSelection(m.start + it.emoji.length + 1, 'silent'); } quill.focus(); }
    menuEl.addEventListener('mousedown', e => { e.preventDefault(); const b = e.target.closest('[data-ed-menu]'); if (b) applyMenu(Number(b.dataset.edMenu)); });
    editorEl.addEventListener('keydown', e => { if (!menu) return; const cols = menu.kind === 'emoji' ? 10 : 1; if (e.key === 'ArrowDown') { menu.sel = Math.min(menu.items.length - 1, menu.sel + cols); renderMenu(); e.preventDefault(); e.stopPropagation(); } else if (e.key === 'ArrowUp') { menu.sel = Math.max(0, menu.sel - cols); renderMenu(); e.preventDefault(); e.stopPropagation(); } else if (cols > 1 && e.key === 'ArrowRight') { menu.sel = Math.min(menu.items.length - 1, menu.sel + 1); renderMenu(); e.preventDefault(); e.stopPropagation(); } else if (cols > 1 && e.key === 'ArrowLeft') { menu.sel = Math.max(0, menu.sel - 1); renderMenu(); e.preventDefault(); e.stopPropagation(); } else if (e.key === 'Enter' || e.key === 'Tab') { applyMenu(menu.sel); e.preventDefault(); e.stopPropagation(); } else if (e.key === 'Escape') { hideMenu(); e.preventDefault(); e.stopPropagation(); } }, true);

    /* YouTube-Erkennung */
    let ytPending = null;
    function checkYouTube(delta) { const ins = (delta.ops || []).map(op => typeof op.insert === 'string' ? op.insert : '').join(''); if (!YT.test(ins)) return; const li = lineInfo(); if (!li) return; const t = li.text.trim(); const m = t.match(YT); if (!m || t !== m[0]) return; ytPending = { url: t, index: li.start, length: li.text.length }; const b = quill.getBounds(li.start); ytPop.style.left = Math.max(0, b.left) + 'px'; ytPop.style.top = (b.bottom + 6) + 'px'; ytPop.hidden = false; }
    function hideYt() { ytPending = null; ytPop.hidden = true; }
    quill.on('selection-change', r => { if (ytPending && r && (r.index < ytPending.index || r.index > ytPending.index + ytPending.length)) hideYt(); });

    /* Spracheingabe */
    let recog = null; const micBtn = tb.querySelector('[data-ed="mic"]');
    function toggleMic() { if (recog) { stopMic(); return; } const SR = root.SpeechRecognition || root.webkitSpeechRecognition; if (!SR) { U.toast('Spracheingabe wird von diesem Browser nicht unterstützt.', 'err'); return; } try { recog = new SR(); } catch (e) { U.toast('Spracheingabe nicht verfügbar.', 'err'); recog = null; return; } recog.lang = 'de-DE'; recog.continuous = true; recog.interimResults = false; let pos = sel().index; recog.onresult = ev => { let text = ''; for (let i = ev.resultIndex; i < ev.results.length; i++) if (ev.results[i].isFinal) text += ev.results[i][0].transcript + ' '; if (text) { const r = quill.getSelection(); if (r) pos = r.index; quill.insertText(pos, text, 'user'); pos += text.length; quill.setSelection(pos, 'silent'); } }; recog.onerror = e => { if (e.error === 'not-allowed') U.toast('Kein Mikrofonzugriff.', 'err'); stopMic(); }; recog.onend = () => { if (recog) { try { recog.start(); } catch (e) { stopMic(); } } }; try { recog.start(); micBtn.classList.add('rec'); micBtn.dataset.tip = 'Aufnahme beenden'; } catch (e) { U.toast('Spracheingabe konnte nicht starten.', 'err'); recog = null; } }
    function stopMic() { if (recog) { const r = recog; recog = null; try { r.onend = null; r.stop(); } catch (e) {} } if (micBtn) { micBtn.classList.remove('rec'); micBtn.dataset.tip = 'Spracheingabe'; } }
    document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape' && container.classList.contains('nb-fullscreen')) container.classList.remove('nb-fullscreen'); if (!document.body.contains(container)) document.removeEventListener('keydown', esc); });
    refreshState();
    return inst;
  }
  function toHTML(delta) { const div = document.createElement('div'); div.style.cssText = 'position:absolute;left:-9999px;top:0;width:800px'; document.body.appendChild(div); const q = new Q(div, { theme: null, readOnly: true, modules: { toolbar: false, table: true } }); q.setContents(delta, 'silent'); const html = q.root.innerHTML; div.remove(); return html; }
  root.NoteEditor = { create, toHTML, FONTS, EMOJI, YT, sanitize };
})(typeof self !== 'undefined' ? self : this);
