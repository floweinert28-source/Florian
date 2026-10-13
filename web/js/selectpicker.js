/* Auswahlfelder im Journalyst-Design: statt der Liste des Browsers bzw. des Handys öffnet ein eigenes Menü unter dem Feld.
   Das native <select> bleibt für Wert, Formulare und Ereignisse (input/change wie bei einer echten Auswahl); ersetzt wird nur das Aufklapp-Fenster.
   Maus: mousedown unterdrückt die Browser-Liste, der Klick öffnet das Menü. Touch: Antippen öffnet das Menü ohne Fokus, also ohne System-Fenster.
   Tastatur: Pfeiltasten ändern den Wert wie gewohnt; Enter, Leertaste, Alt+Pfeil oder F4 öffnen das Menü. Mehrfachauswahl bleibt nativ. */
(function (root) {
  'use strict';
  let el = null, sel = null, inited = false, touchUI = false;
  const isSel = t => !!t && t.tagName === 'SELECT' && !t.multiple && !t.disabled && t.size <= 1;
  const isOpen = () => !!el && el.classList.contains('open');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const optHTML = (o, i) => `<button type="button" class="item" role="option" data-i="${i}" aria-selected="${o.selected}" tabindex="-1"${o.disabled ? ' disabled' : ''}><span class="sp-chk">${o.selected ? CHECK : ''}</span><span class="sp-txt">${esc(o.textContent)}</span></button>`;
  function ensure() {
    if (el) return;
    el = document.createElement('div'); el.className = 'popover sp'; el.id = 'pop-sp'; el.setAttribute('role', 'listbox');
    el.addEventListener('mousedown', e => e.preventDefault()); /* Fokus bleibt im Feld */
    el.addEventListener('click', onClick); el.addEventListener('keydown', onKey);
    document.body.appendChild(el);
  }
  function render() {
    const parts = []; let i = 0;
    for (const node of sel.children) {
      if (node.tagName === 'OPTGROUP') { parts.push(`<div class="sp-cap">${esc(node.label)}</div>`); for (const o of node.children) parts.push(optHTML(o, i++)); }
      else if (node.tagName === 'OPTION') { if (!node.hidden) parts.push(optHTML(node, i)); i++; }
    }
    el.innerHTML = parts.join('');
  }
  /* unter dem Feld, links bündig, mindestens so breit wie das Feld; reicht der Platz nach unten nicht, klappt es nach oben */
  function place() {
    if (!isOpen() || !sel) return;
    if (!sel.isConnected) { close(); return; }
    const r = sel.getBoundingClientRect(), vw = document.documentElement.clientWidth, vh = window.innerHeight;
    if (r.bottom < 0 || r.top > vh) { close(); return; }
    el.style.minWidth = Math.round(r.width) + 'px'; el.style.maxHeight = Math.max(160, Math.min(320, Math.max(vh - r.bottom, r.top) - 16)) + 'px';
    const w = el.offsetWidth, h = el.offsetHeight; const left = Math.max(8, Math.min(r.left, vw - w - 8)); let top = r.bottom + 6;
    const up = top + h > vh - 8 && r.top - h - 6 >= 8; if (up) top = r.top - h - 6; else if (top + h > vh - 8) top = Math.max(8, vh - h - 8);
    el.style.left = Math.round(left) + 'px'; el.style.top = Math.round(top) + 'px'; el.classList.toggle('up', up);
  }
  const items = () => [...el.querySelectorAll('.item:not([disabled])')];
  function open(s, keyboard) {
    if (!isSel(s)) return; ensure(); sel = s; render(); el.classList.add('open'); el.setAttribute('aria-label', s.getAttribute('aria-label') || 'Auswahl'); place();
    const cur = el.querySelector('.item[aria-selected="true"]'); if (cur) cur.scrollIntoView({ block: 'nearest' });
    if (keyboard) (cur || items()[0] || {}).focus && (cur || items()[0]).focus({ preventScroll: true });
  }
  function close() { sel = null; if (el) el.classList.remove('open'); }
  function choose(i) {
    const s = sel; close(); if (!s) return; const o = s.options[i]; if (!o || o.disabled) return;
    if (s.selectedIndex !== i) { s.selectedIndex = i; s.dispatchEvent(new Event('input', { bubbles: true })); s.dispatchEvent(new Event('change', { bubbles: true })); }
    if (!touchUI) try { s.focus({ preventScroll: true }); } catch (e) { /* ohne Fokus-Optionen */ } /* bei Touch nicht: iOS öffnet sonst seine eigene Liste */
  }
  function onClick(e) { e.stopPropagation(); const b = e.target.closest('.item[data-i]'); if (!b || b.disabled) return; choose(+b.dataset.i); }
  function onKey(e) {
    const list = items(); const at = list.indexOf(document.activeElement);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); const n = list[(at + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length]; if (n) n.focus({ preventScroll: false }); }
    else if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); const n = e.key === 'Home' ? list[0] : list[list.length - 1]; if (n) n.focus(); }
    else if (e.key === 'Tab') close();
  }
  /* einmal nach App.bind: der eigene Klick-Handler läuft nach dem der App, die beim Klick neben ein Popover alle schließt */
  function init() {
    if (inited || typeof document === 'undefined') return; inited = true;
    document.addEventListener('mousedown', e => { const t = e.target; if (isSel(t) && e.button === 0) { e.preventDefault(); try { t.focus({ preventScroll: true }); } catch (x) { /* egal */ } } else if (isOpen() && !el.contains(t)) close(); }, true);
    document.addEventListener('click', e => { const t = e.target; if (!isSel(t)) return; e.preventDefault(); if (isOpen() && sel === t) close(); else open(t, false); });
    document.addEventListener('pointerdown', e => { touchUI = e.pointerType === 'touch'; }, true);
    let tap = null;
    document.addEventListener('touchstart', e => { const t = e.target; tap = isSel(t) && e.touches.length === 1 ? { t, x: e.touches[0].clientX, y: e.touches[0].clientY } : null; if (isOpen() && !el.contains(t) && t !== sel) close(); }, { passive: true, capture: true });
    document.addEventListener('touchend', e => { const p = tap; tap = null; if (!p || e.target !== p.t) return; const c = e.changedTouches[0]; if (Math.hypot(c.clientX - p.x, c.clientY - p.y) > 10) return; e.preventDefault(); touchUI = true; if (isOpen() && sel === p.t) close(); else open(p.t, false); }, { passive: false, capture: true });
    document.addEventListener('keydown', e => { const t = e.target; if (!isSel(t)) return; if (e.key === 'Enter' || e.key === ' ' || e.key === 'F4' || (e.altKey && (e.key === 'ArrowDown' || e.key === 'ArrowUp'))) { e.preventDefault(); e.stopPropagation(); open(t, true); } }, true);
    window.addEventListener('keydown', e => { if (e.key !== 'Escape' || !isOpen()) return; e.preventDefault(); e.stopImmediatePropagation(); const s = sel; close(); if (s && s.isConnected) { try { s.focus({ preventScroll: true }); } catch (x) { /* egal */ } } }, true);
    window.addEventListener('resize', () => place());
    document.addEventListener('scroll', e => { if (isOpen() && !el.contains(e.target)) place(); }, true);
  }
  root.SelectPicker = { init, open, close, isOpen };
})(typeof self !== 'undefined' ? self : this);
