/* Bewegung: ein Ort für Seitenwechsel, Ausblenden von Dialogen und den Hero-Parallax.
   Dauer und Easing kommen aus den CSS-Variablen --dur-1/2/3 und --ease in css/app.css.
   Ohne JavaScript oder bei „weniger Bewegung“ bleibt alles sofort sichtbar: Elemente werden erst versteckt,
   wenn dieses Skript die Klasse js-motion auf <html> setzt. */
(function (root) {
'use strict';
var html = document.documentElement;
var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
var enabled = !(mq && mq.matches) && 'IntersectionObserver' in window && !root.__jyInner; /* PC-Ansicht auf dem Handy (js/pcview.js): ohne Bewegung, damit das große Fenster flüssig bleibt */
if (enabled) html.classList.add('js-motion');

/* Dauer einer CSS-Variablen in Millisekunden, z. B. ms('--dur-2') */
function ms(name) {
  if (!enabled) return 0;
  var v = getComputedStyle(html).getPropertyValue(name).trim();
  if (!v) return 0;
  return v.slice(-2) === 'ms' ? parseFloat(v) : parseFloat(v) * 1000;
}

/* Kein Einblenden beim Scrollen (Design-Prompt, KI-Merkmal 12): Inhalte sind sofort sichtbar. scan bleibt als leere Funktion,
   damit Aufrufer (App, Startseite) unverändert bleiben */
function scan() {}

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
  if (!enabled || !el || !window.matchMedia('(min-width: 56.25em)').matches) return;
  var raf = 0;
  function tick() { raf = 0; el.style.setProperty('--py', (window.scrollY * factor).toFixed(1)); }
  window.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(tick); }, { passive: true });
  tick();
}

root.Motion = { enabled: enabled, ms: ms, scan: scan, transition: transition, leave: leave, parallax: parallax };
})(typeof self !== 'undefined' ? self : this);
