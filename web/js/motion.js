/* Bewegung: ein Ort für Einblenden beim Scrollen, Seitenwechsel, Ausblenden von Dialogen und den Hero-Parallax.
   Dauer und Easing kommen aus den CSS-Variablen --dur-1/2/3 und --ease in css/app.css.
   Ohne JavaScript oder bei „weniger Bewegung“ bleibt alles sofort sichtbar: Elemente werden erst versteckt,
   wenn dieses Skript die Klasse js-motion auf <html> setzt. */
(function (root) {
'use strict';
var html = document.documentElement;
var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
var enabled = !(mq && mq.matches) && 'IntersectionObserver' in window;
if (enabled) html.classList.add('js-motion');

/* Dauer einer CSS-Variablen in Millisekunden, z. B. ms('--dur-2') */
function ms(name) {
  if (!enabled) return 0;
  var v = getComputedStyle(html).getPropertyValue(name).trim();
  if (!v) return 0;
  return v.slice(-2) === 'ms' ? parseFloat(v) : parseFloat(v) * 1000;
}

/* ---------- Einblenden beim Scrollen ---------- */
var STEP = 40;                       /* Staffelung je Element in ms (wie in css: --i * 40ms) */
var MAX_I = 10;
var GRID = '.grid, .tiles, .stat-tiles, .dash-top, .dash-main, .pair-grid, .feats, .steps, [data-reveal-group]';
var SKIP = '.rp, .cert, [data-no-reveal], script, style, template';
var io = enabled ? new IntersectionObserver(function (entries) {
  var k = 0;
  entries.forEach(function (en) {
    if (!en.isIntersecting) return;
    var el = en.target; io.unobserve(el);
    el.style.setProperty('--i', String(Math.min(k, MAX_I))); k += 1;
    el.classList.add('in');
    /* nach dem Übergang wieder normal, damit eigene Hover-Transforms greifen */
    setTimeout(function () { el.classList.remove('rv', 'in'); el.style.removeProperty('--i'); }, ms('--dur-3') + Math.min(k, MAX_I) * STEP + 80);
  });
}, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 }) : null;

function mark(el) { if (el.classList.contains('rv')) return; el.classList.add('rv'); io.observe(el); }

/* scan(container, enter): bereitet die Kinder eines Containers vor. Raster (GRID) werden nicht als Ganzes,
   sondern ihre Kacheln gestaffelt eingeblendet. enter = neue Seite: alles blendet ein, auch was schon sichtbar ist.
   Ohne enter (Neuaufbau nach einer Eingabe) bleibt Sichtbares stehen, nur was noch unter dem Fenster liegt gleitet später ein. */
function scan(container, enter) {
  if (!enabled || !container) return;
  var list = [];
  Array.prototype.forEach.call(container.children, function (ch) {
    if (ch.matches(SKIP)) return;
    if (ch.matches(GRID)) Array.prototype.forEach.call(ch.children, function (k) { if (!k.matches(SKIP)) list.push(k); });
    else list.push(ch);
  });
  var vh = window.innerHeight;
  list.forEach(function (el) {
    if (enter || el.getBoundingClientRect().top > vh) mark(el);
  });
}

/* ---------- Seitenwechsel ---------- */
function transition(fn) {
  if (enabled && document.startViewTransition && !document.hidden) {
    /* vt-on nur während des Übergangs: Seitenleiste und Kopfzeile bekommen dann eigene Namen und stehen still (css: „Seitenwechsel“) */
    html.classList.add('vt-on');
    try {
      var t = document.startViewTransition(fn);
      if (t) { ['ready', 'finished'].forEach(function (k) { if (t[k]) t[k].catch(function () {}); }); if (t.updateCallbackDone) t.updateCallbackDone.catch(function (e) { console.warn(e); }); }
      var off = function () { html.classList.remove('vt-on'); };
      if (t && t.finished) t.finished.then(off, off); else off();
      return;
    } catch (e) { html.classList.remove('vt-on'); /* Fallback unten */ }
  }
  fn();
}

/* ---------- Ausblenden vor dem Entfernen ---------- */
function leave(el, cls, durVar, done) {
  var t = ms(durVar || '--dur-1');
  if (!t) { done(); return; }
  cls = cls || 'out'; el.classList.add(cls);
  /* wurde das Element inzwischen wieder geöffnet (Klasse entfernt), bleibt es stehen */
  setTimeout(function () { if (el.classList.contains(cls)) done(); }, t + 20);
}

/* ---------- Dezenter Parallax (nur Desktop, nur transform) ---------- */
function parallax(el, factor) {
  if (!enabled || !el || !window.matchMedia('(min-width: 900px)').matches) return;
  var raf = 0;
  function tick() { raf = 0; el.style.setProperty('--py', (window.scrollY * factor).toFixed(1)); }
  window.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(tick); }, { passive: true });
  tick();
}

root.Motion = { enabled: enabled, ms: ms, scan: scan, transition: transition, leave: leave, parallax: parallax };
})(typeof self !== 'undefined' ? self : this);
