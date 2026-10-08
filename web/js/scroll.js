/* Weiches, „schweres“ Scrollen für die ganze App: das Mausrad setzt nur ein Ziel, die Seite gleitet mit Trägheit hinterher
   (wie Lenis auf edlen Websites). Nur das Fenster wird so bewegt; Bereiche mit eigenem Scrollen (Notiz-Spalten, Tabellen,
   Menüs, Dialoge) behalten ihr natives Verhalten, ebenso Touch, Tastatur und Scrollbalken. Bei „Bewegung reduzieren“,
   auf Touch-Geräten und bei offenem Dialog (body overflow hidden) passiert nichts. Programmatisches Scrollen (Seitenwechsel,
   Scrollstand halten) bricht die Bewegung ab, damit es nie gegen den Rahmen arbeitet. */
(function (root) {
  'use strict';
  const EASE = 0.075; /* Anteil des Restwegs pro Bild: kleiner = schwerer, träger */
  const LINE = 18, MAX_STEP = 1.4; /* Zeilen-Delta in Pixel; größter Sprung pro Radtick in Fensterhöhen */
  const reduce = root.matchMedia ? root.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  const coarse = root.matchMedia ? root.matchMedia('(pointer: coarse)') : { matches: false };
  let target = 0, current = 0, raf = 0, active = false, own = false;

  const maxY = () => Math.max(0, (document.scrollingElement || document.documentElement).scrollHeight - root.innerHeight);
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  /* liegt zwischen Ziel und body ein Bereich, der in diese Richtung noch selbst scrollen kann? */
  function innerScrolls(el, dy) {
    for (let a = el && el.nodeType === 1 ? el : el && el.parentElement; a && a !== document.body && a !== document.documentElement; a = a.parentElement) {
      const cs = getComputedStyle(a); if (!/(auto|scroll)/.test(cs.overflowY) || a.scrollHeight <= a.clientHeight + 1) continue;
      if ((dy < 0 && a.scrollTop > 0) || (dy > 0 && a.scrollTop + a.clientHeight < a.scrollHeight - 1)) return true;
    }
    return false;
  }
  function delta(e) { let d = e.deltaY; if (e.deltaMode === 1) d *= LINE; else if (e.deltaMode === 2) d *= root.innerHeight; const cap = root.innerHeight * MAX_STEP; return clamp(d, -cap, cap); }
  function stop() { active = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
  function tick() {
    raf = 0;
    if (Math.abs(root.scrollY - current) > 2) { stop(); return; } /* jemand anders hat gescrollt (Tastatur, Scrollbalken, Seitenwechsel) */
    current += (target - current) * EASE;
    if (Math.abs(target - current) < 0.4) { current = target; own = true; root.scrollTo(0, current); own = false; stop(); return; }
    own = true; root.scrollTo(0, current); own = false; raf = requestAnimationFrame(tick);
  }
  function onWheel(e) {
    if (reduce.matches || coarse.matches || e.ctrlKey || e.defaultPrevented) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; /* waagerecht: Tabs & Co. nativ */
    if (document.body.style.overflow === 'hidden' || getComputedStyle(document.body).overflowY === 'hidden') return; /* Dialog offen */
    const dy = delta(e); if (!dy) return;
    if (innerScrolls(e.target, dy)) return;
    const max = maxY(); if (!max) return;
    e.preventDefault();
    if (!active) { current = root.scrollY; target = current; active = true; }
    target = clamp(target + dy, 0, max);
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function onScroll() { if (!own && !active) { current = target = root.scrollY; } }
  root.addEventListener('wheel', onWheel, { passive: false });
  root.addEventListener('scroll', onScroll, { passive: true });
  root.addEventListener('hashchange', stop);
  root.Glide = { stop, get active() { return active; }, get target() { return target; } };
})(typeof self !== 'undefined' ? self : this);
