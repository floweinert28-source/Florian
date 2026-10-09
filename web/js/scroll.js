/* Weiches, „schweres“ Scrollen für die ganze App: das Mausrad setzt nur ein Ziel, die Seite gleitet mit Trägheit hinterher
   (wie Lenis auf edlen Websites). Nur das Fenster wird so bewegt; Bereiche mit eigenem Scrollen (Notiz-Spalten, Tabellen,
   Menüs, Dialoge) behalten ihr natives Verhalten, ebenso Touch, Tastatur und Scrollbalken. Am Ende eines Bereichs (oder über
   einem Menü, Popover oder Dialog) scrollt die Seite nicht mit; dazu overscroll-behavior: contain in css/app.css. Bei „Bewegung reduzieren“,
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
  /* Schwebende Ebenen: Menüs, Popover, Filter, Kalender, Seitenpanele, Dialoge – dort scrollt die Seite nie mit */
  const LAYER = '.popover, .fd-pop, .nb-menu, .nb-ytpop, .side-panel, .modal, .rep-panel, .sym-menu, [data-own-scroll]';
  /* Bereich unter dem Mauszeiger: { box, can } – box = innerster Bereich mit eigenem Scrollen (oder eine schwebende Ebene),
     can = er kann in diese Richtung noch selbst scrollen. Ohne Bereich: null, dann bewegt sich das Fenster. */
  function area(el, dy) {
    let layer = null;
    for (let a = el && el.nodeType === 1 ? el : el && el.parentElement; a && a !== document.body && a !== document.documentElement; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (/(auto|scroll)/.test(cs.overflowY) && a.scrollHeight > a.clientHeight + 1) {
        if ((dy < 0 && a.scrollTop > 0) || (dy > 0 && a.scrollTop + a.clientHeight < a.scrollHeight - 1)) return { box: a, can: true };
        if (!layer) layer = a; /* am Ende angekommen: weiter oben könnte noch ein Bereich scrollen, sonst bleibt alles stehen */
      }
      if (a.matches(LAYER)) return { box: a, can: false };
    }
    return layer ? { box: layer, can: false } : null;
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
    if (e.ctrlKey || e.defaultPrevented) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; /* waagerecht: Tabs & Co. nativ */
    const dy = delta(e); if (!dy) return;
    /* Scrollen in einem Bereich bleibt in dem Bereich: kann er noch scrollen, macht er das selbst (nativ); ist er am Ende oder
       eine Ebene ohne eigenes Scrollen, passiert nichts – die Seite dahinter scrollt nicht mit */
    const ar = area(e.target, dy); if (ar) { if (!ar.can) e.preventDefault(); return; }
    if (reduce.matches || coarse.matches) return; /* ohne weiches Scrollen: das Fenster scrollt nativ */
    if (document.body.style.overflow === 'hidden' || getComputedStyle(document.body).overflowY === 'hidden') return; /* Dialog offen */
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
