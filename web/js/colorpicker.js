/* Farbwähler im Journalyst-Design für alle Farbfelder (input type=color); ersetzt das Farbfenster des Systems.
   Fläche für Sättigung und Helligkeit, Farbton-Regler, Hex-Feld und „Eigene Farben“: jede selbst gewählte Farbe wird
   gemerkt (neueste vorne, höchstens 8, einzeln löschbar). Das native Feld bleibt Träger des Werts: jede Änderung schreibt
   value und löst input aus (Vorschau). Erst „Speichern“ (oder Enter) übernimmt: change und Farbe merken. „Abbrechen“, Escape
   und ein Klick daneben stellen die Ausgangsfarbe wieder her (input mit der alten Farbe, danach das Ereignis cpcancel). */
(function (root) {
  'use strict';
  const MAX = 8;
  let el = null, input = null, anchor = null, hsv = null, start = '', store = null, inited = false, raf = 0;

  /* ---------- Farbrechnung ---------- */
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const valid = h => typeof h === 'string' && /^#[0-9a-f]{6}$/i.test(h);
  const norm = h => { const s = String(h || '').trim().replace(/^#/, ''); const v = s.length === 3 ? s.split('').map(c => c + c).join('') : s; return /^[0-9a-f]{6}$/i.test(v) ? '#' + v.toLowerCase() : null; };
  const toRgb = h => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const toHex = rgb => '#' + rgb.map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
  function rgbToHsv([r, g, b]) {
    r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let h = 0;
    if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return { h: ((h * 60) + 360) % 360, s: mx ? d / mx : 0, v: mx };
  }
  function hsvToRgb({ h, s, v }) {
    const c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c; const k = Math.floor(h / 60) % 6;
    const [r, g, b] = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][k];
    return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
  }
  const hexOf = () => toHex(hsvToRgb(hsv));

  /* ---------- Eigene Farben ---------- */
  const saved = () => (store ? (store.get() || []).filter(valid) : []);
  function remember(hex) { if (!store || !valid(hex)) return; store.set([hex, ...saved().filter(c => c !== hex)].slice(0, MAX)); if (store.changed) store.changed(); }
  function forget(hex) { if (!store) return; store.set(saved().filter(c => c !== hex)); if (store.changed) store.changed(); }

  /* ---------- Aufbau ---------- */
  function savedHTML() {
    const list = saved();
    return list.length ? `<div class="cp-sec">Eigene Farben</div><div class="cp-list">${list.map(c => `<span class="cp-s"><button type="button" class="cp-c" data-cp="pick" data-v="${c}" style="--c:${c}" aria-label="${c}"></button><button type="button" class="cp-x" data-cp="del" data-v="${c}" aria-label="Farbe löschen"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17"/></svg></button></span>`).join('')}</div>` : '';
  }
  function build() {
    el.innerHTML = `<div class="cp-sv" data-cp="sv" role="slider" tabindex="0" aria-label="Sättigung und Helligkeit"><i class="cp-knob"></i></div>
      <div class="cp-hue" data-cp="hue" role="slider" tabindex="0" aria-label="Farbton" aria-valuemin="0" aria-valuemax="360"><i class="cp-knob"></i></div>
      <div class="cp-row"><i class="cp-prev"></i><label class="cp-hex"><span>#</span><input type="text" maxlength="7" spellcheck="false" autocomplete="off" aria-label="Hex-Farbwert"></label></div>
      <div class="cp-saved">${savedHTML()}</div>
      <div class="cp-foot"><button type="button" class="btn sm ghost" data-cp="cancel">Abbrechen</button><button type="button" class="btn sm primary" data-cp="save">Speichern</button></div>`;
  }
  /* Lage der Knöpfe und Farben setzen, ohne neu aufzubauen (flüssiges Ziehen) */
  function paint(skipHex) {
    if (!el || !hsv) return; const hex = hexOf();
    el.style.setProperty('--cp-hue', `hsl(${Math.round(hsv.h)} 100% 50%)`); el.style.setProperty('--cp-col', hex);
    const sv = el.querySelector('.cp-sv .cp-knob'), hu = el.querySelector('.cp-hue .cp-knob');
    sv.style.left = (hsv.s * 100) + '%'; sv.style.top = ((1 - hsv.v) * 100) + '%'; hu.style.left = (hsv.h / 360 * 100) + '%';
    el.querySelector('.cp-hue').setAttribute('aria-valuenow', String(Math.round(hsv.h)));
    if (!skipHex) el.querySelector('.cp-hex input').value = hex.slice(1);
    el.querySelectorAll('.cp-c').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === hex)));
  }
  /* Wert ins Feld schreiben (pro Bild höchstens einmal) */
  function write() {
    if (raf) return; raf = requestAnimationFrame(() => { raf = 0; if (!input) return; const hex = hexOf(); if (input.value.toLowerCase() !== hex) { input.value = hex; input.dispatchEvent(new Event('input', { bubbles: true })); } });
  }
  function setHex(hex, skipHex) { const h = norm(hex); if (!h) return; const n = rgbToHsv(toRgb(h)); if (n.s === 0 || n.v === 0) n.h = hsv ? hsv.h : 0; hsv = n; paint(skipHex); write(); }

  /* ---------- Lage ---------- */
  function place() {
    if (!el || !input) return; if (!input.isConnected) { close(true, true); return; }
    const a = (anchor && anchor.isConnected ? anchor : input).getBoundingClientRect(); const vw = document.documentElement.clientWidth, vh = window.innerHeight;
    const w = el.offsetWidth, h = el.offsetHeight; const left = clamp(a.left, 8, vw - w - 8); let top = a.bottom + 8;
    const up = top + h > vh - 8 && a.top - h - 8 >= 8; if (up) top = a.top - h - 8; else if (top + h > vh - 8) top = Math.max(8, vh - h - 8);
    el.style.left = Math.round(left) + 'px'; el.style.top = Math.round(top) + 'px'; el.classList.toggle('up', up);
  }

  /* ---------- Ziehen auf Fläche und Regler ---------- */
  function drag(e, kind) {
    const area = el.querySelector(kind === 'sv' ? '.cp-sv' : '.cp-hue'); const r = area.getBoundingClientRect();
    const move = ev => {
      const x = clamp((ev.clientX - r.left) / r.width, 0, 1), y = clamp((ev.clientY - r.top) / r.height, 0, 1);
      if (kind === 'sv') { hsv.s = x; hsv.v = 1 - y; } else hsv.h = x * 360;
      paint(); write();
    };
    move(e); area.setPointerCapture && area.setPointerCapture(e.pointerId);
    const up = () => { area.removeEventListener('pointermove', move); area.removeEventListener('pointerup', up); area.removeEventListener('pointercancel', up); };
    area.addEventListener('pointermove', move); area.addEventListener('pointerup', up); area.addEventListener('pointercancel', up);
  }
  /* Pfeiltasten: Fläche in 2er-Schritten, Farbton in Grad (mit Umschalt größer) */
  function onKey(e) {
    if (e.key === 'Enter' && e.target.closest && e.target.closest('.cp-hex')) { e.preventDefault(); close(); return; } /* Enter im Hex-Feld speichert */
    const t = e.target.closest && e.target.closest('[data-cp]'); if (!t) return; const k = t.dataset.cp; const big = e.shiftKey ? 10 : 2;
    if (e.key === 'Enter' && k !== 'pick' && k !== 'del' && k !== 'cancel' && k !== 'save') { e.preventDefault(); close(); return; }
    const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key]; if (!d || (k !== 'sv' && k !== 'hue')) return;
    e.preventDefault();
    if (k === 'sv') { hsv.s = clamp(hsv.s + d[0] * big / 100, 0, 1); hsv.v = clamp(hsv.v + d[1] * big / 100, 0, 1); } else hsv.h = clamp(hsv.h + (d[0] || d[1]) * big, 0, 360);
    paint(); write();
  }

  /* ---------- Öffnen und Schließen ---------- */
  function ensure() {
    if (el) return;
    el = document.createElement('div'); el.className = 'popover cp'; el.id = 'pop-cp'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Farbe wählen');
    /* Fokus bleibt, wo er war (z. B. Textauswahl im Editor); nur das Hex-Feld nimmt den Fokus */
    el.addEventListener('mousedown', e => { if (!e.target.closest('.cp-hex input')) e.preventDefault(); });
    el.addEventListener('pointerdown', e => { const a = e.target.closest('[data-cp="sv"], [data-cp="hue"]'); if (a && e.button === 0) { e.preventDefault(); drag(e, a.dataset.cp); } });
    el.addEventListener('click', e => {
      e.stopPropagation(); /* Klicks bleiben im Farbwähler: die App würde sie sonst als Klick neben ein Menü werten */
      const b = e.target.closest('[data-cp]'); if (!b || !input) return;
      if (b.dataset.cp === 'save') close();
      else if (b.dataset.cp === 'cancel') close(false, false, true);
      else if (b.dataset.cp === 'pick') setHex(b.dataset.v);
      else if (b.dataset.cp === 'del') { forget(b.dataset.v); el.querySelector('.cp-saved').innerHTML = savedHTML(); paint(true); place(); }
    });
    el.addEventListener('keydown', onKey);
    el.addEventListener('input', e => { if (e.target.closest('.cp-hex')) { e.stopPropagation(); const h = norm(e.target.value); if (h) setHex(h, true); } });
    el.addEventListener('change', e => e.stopPropagation());
    document.body.appendChild(el);
  }
  function open(inp, anc) {
    if (!inp || inp.disabled) return; if (input === inp && isOpen()) return;
    if (input) close(true);
    ensure(); input = inp; anchor = anc || (inp.offsetWidth ? inp : inp.closest('label')) || inp;
    start = norm(inp.value) || '#000000'; hsv = rgbToHsv(toRgb(start));
    build(); paint(); el.classList.remove('closing'); el.classList.add('open'); place();
  }
  const isOpen = () => !!el && el.classList.contains('open') && !el.classList.contains('closing');
  /* schließen: übernehmen (change, Farbe merken) oder mit revert zurück zur Ausgangsfarbe */
  function close(silent, gone, revert) {
    const inp = input; input = null; anchor = null; if (raf) { cancelAnimationFrame(raf); raf = 0; }
    if (inp && !gone) {
      if (revert) { if (inp.value.toLowerCase() !== start) { inp.value = start; inp.dispatchEvent(new Event('input', { bubbles: true })); } inp.dispatchEvent(new Event('cpcancel', { bubbles: true })); }
      else if (hsv) { const hex = hexOf(); if (inp.value.toLowerCase() !== hex) { inp.value = hex; inp.dispatchEvent(new Event('input', { bubbles: true })); } if (hex !== start) { inp.dispatchEvent(new Event('change', { bubbles: true })); if (!('cpNosave' in inp.dataset)) remember(hex); } /* data-cp-nosave: Farbe nicht in „Eigene Farben“ (z. B. Grundfarbe) */ }
    }
    if (!el || !el.classList.contains('open')) return;
    const M = root.Motion; if (!silent && M && M.enabled && M.leave) M.leave(el, 'closing', '--dur-1', () => el.classList.remove('open', 'closing')); else el.classList.remove('open', 'closing');
  }
  const isField = t => !!t && t.tagName === 'INPUT' && t.type === 'color' && !t.disabled;
  /* store: { get(): Farben, set(liste), changed?() } – woher die eigenen Farben kommen und wohin sie gehen */
  function init(o) {
    if (o) store = o; if (inited || typeof document === 'undefined') return; inited = true;
    document.addEventListener('click', e => { const t = e.target; if (!isField(t)) return; e.preventDefault(); open(t); });
    document.addEventListener('keydown', e => { const t = e.target; if (isField(t) && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(t); } }, true);
    document.addEventListener('mousedown', e => { if (isOpen() && !el.contains(e.target) && e.target !== input) close(false, false, true); }, true); /* daneben: verwerfen */
    window.addEventListener('keydown', e => { if (e.key !== 'Escape' || !isOpen()) return; e.preventDefault(); e.stopImmediatePropagation(); close(false, false, true); }, true);
    window.addEventListener('resize', () => place());
    document.addEventListener('scroll', e => { if (el && el.contains(e.target)) return; place(); }, true);
  }
  root.ColorPicker = { init, open, close, isOpen, MAX, norm };
})(typeof self !== 'undefined' ? self : this);
