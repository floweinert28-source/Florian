/* Ruhepunkt: geführte Sessions vor und nach dem Trading plus Akut-Reset.
   Abläufe und Texte unverändert aus docs/ruhepunkt.html; Rahmen, Speichern und Design an Journalyst angepasst. */
(function (root) {
'use strict';
var C = root.Core, S = root.Store, U = root.UI, I = U.I, fmt = U.fmt, App = root.App;

/* ================================================================
   KONFIGURATION: hier an euer Trading-Journal anbinden
   ================================================================ */
var CONFIG = {
  // Standardwert für den Schalter "Christlicher Impuls" (gespeichert als Nutzereinstellung christlicherImpuls)
  glaubensmodusStandard: true,
  // Jede Session landet als Eintrag im Journal, verknüpft mit dem Nutzer (Store.addRuhepunkt)
  onSave: function (eintrag) { S.addRuhepunkt(eintrag); return Promise.resolve(); },
  // Öffnet die Mentor-Seite; die gespeicherte Session geht als Kontext mit (Ereignis ruhepunkt:gespeichert)
  onMentor: function () { location.hash = '#/mentor'; }
};

/* ================================================================
   INHALTE (Bibeltexte: Luther 1912, gemeinfrei, heutige Rechtschreibung)
   ================================================================ */
var VERSE = {
  vor: [
    { text: 'Seid stille und erkennet, dass ich Gott bin!', ref: 'Psalm 46,11' },
    { text: 'Ein Geduldiger ist besser denn ein Starker, und der seines Mutes Herr ist, denn der Städte gewinnt.', ref: 'Sprüche 16,32' },
    { text: 'Denn Gott hat uns nicht gegeben den Geist der Furcht, sondern der Kraft und der Liebe und der Zucht.', ref: '2. Timotheus 1,7', note: '„Zucht“ meint hier Besonnenheit und Selbstbeherrschung.' },
    { text: 'Darum sorget nicht für den andern Morgen; denn der morgende Tag wird für das Seine sorgen.', ref: 'Matthäus 6,34' },
    { text: 'Sorget nichts! sondern in allen Dingen lasset eure Bitten im Gebet und Flehen mit Danksagung vor Gott kund werden.', ref: 'Philipper 4,6' }
  ],
  nach: [
    { text: 'Die Güte des HERRN ist’s, dass wir nicht gar aus sind; seine Barmherzigkeit hat noch kein Ende, sondern sie ist alle Morgen neu, und deine Treue ist groß.', ref: 'Klagelieder 3,22–23' },
    { text: 'Ich liege und schlafe ganz mit Frieden; denn allein du, HERR, hilfst mir, dass ich sicher wohne.', ref: 'Psalm 4,9' },
    { text: 'Alle eure Sorge werfet auf ihn; denn er sorgt für euch.', ref: '1. Petrus 5,7' },
    { text: 'Kommet her zu mir alle, die ihr mühselig und beladen seid; ich will euch erquicken.', ref: 'Matthäus 11,28' }
  ]
};
var GEBET = {
  vor: 'Herr, ich lege diesen Handelstag in deine Hände. Schenk mir einen klaren Kopf und ein ruhiges Herz, und hilf mir, meinen Regeln treu zu bleiben, auch wenn es schwer wird. Mein Wert hängt nicht an diesem Konto, sondern an dir. Amen.',
  nach: 'Herr, danke für diesen Tag, für das, was gelungen ist, und für das, was ich lernen darf. Was schiefging, lege ich bei dir ab. Ich muss heute nichts mehr zurückholen. Schenk mir Ruhe für den Abend und einen guten Schlaf. Amen.'
};
var LEIT = {
  vor: [
    'Ich muss heute nicht gewinnen. Ich muss heute meinen Plan ausführen.',
    'Jeder Trade ist nur einer von vielen. Der einzelne entscheidet nichts.',
    'Mein Stop ist kein Feind. Er ist der Preis, den ich vorher akzeptiert habe.',
    'Kein Setup ist auch eine Entscheidung. Warten gehört zur Arbeit.'
  ],
  nach: [
    'Ich bewerte heute meine Entscheidungen, nicht mein Konto.',
    'Der Markt ist morgen auch noch da. Ich muss heute nichts zurückholen.',
    'Was heute war, ist Information, kein Urteil über mich.'
  ]
};
var P = {
  seufzer: [
    { label: 'Durch die Nase einatmen', secs: 2, level: 0.75 },
    { label: 'Kurz nachziehen', secs: 1, level: 1 },
    { label: 'Lang durch den Mund ausatmen', secs: 6, level: 0 }
  ],
  box: [
    { label: 'Einatmen', secs: 4, level: 1 },
    { label: 'Halten', secs: 4, level: 1 },
    { label: 'Ausatmen', secs: 4, level: 0 },
    { label: 'Halten', secs: 4, level: 0 }
  ],
  ruhig: [
    { label: 'Einatmen', secs: 5.5, level: 1 },
    { label: 'Ausatmen', secs: 5.5, level: 0 }
  ],
  jesus: [
    { label: 'Einatmen', secs: 4, level: 1, hint: 'Herr Jesus Christus,' },
    { label: 'Ausatmen', secs: 6, level: 0, hint: 'erbarme dich meiner.' }
  ]
};
var KOERPER = [
  { value: 'ruhig', label: 'Ruhig' }, { value: 'angespannt', label: 'Angespannt' },
  { value: 'unruhig', label: 'Unruhig' }, { value: 'muede', label: 'Müde' }, { value: 'gereizt', label: 'Gereizt' }
];
var ERGEBNIS = [
  { value: 'plus', label: 'Im Plus' }, { value: 'minus', label: 'Im Minus' },
  { value: 'null', label: 'Ungefähr ausgeglichen' }, { value: 'gross', label: 'Großer Verlust' }
];
var REGELN = [{ value: 'ja', label: 'Ja' }, { value: 'teilweise', label: 'Teilweise' }, { value: 'nein', label: 'Nein' }];
var GEFUEHLE = [
  { value: 'wut', label: 'Wut' }, { value: 'angst', label: 'Angst' }, { value: 'scham', label: 'Scham' },
  { value: 'frust', label: 'Frust' }, { value: 'gier', label: 'Gier' }, { value: 'leere', label: 'Leere' }
];
var AMPEL = {
  gruen: { label: 'Grün', color: 'var(--rp-moss)', titel: 'Gute Voraussetzungen.', text: 'Du bist heute gut aufgestellt. Handle nach Plan, nicht nach Gefühl.' },
  gelb: { label: 'Gelb', color: 'var(--rp-amber)', titel: 'Du bist heute nicht ganz bei dir.', text: 'Weniger Trades, kleineres Risiko, früher Schluss. Das ist heute Stärke, keine Schwäche.' },
  rot: { label: 'Rot', color: 'var(--rp-brick)', titel: 'Kein guter Tag für Entscheidungen unter Druck.', text: 'Überleg ernsthaft, heute nicht zu traden oder nur zu beobachten. Der Markt ist morgen auch noch da.' }
};
var DONE = {
  vor: 'Du bist vorbereitet. Handle nach deinem Plan, nicht nach deinen Gefühlen.',
  nach: 'Der Handelstag ist vorbei. Du darfst jetzt abschalten.',
  akut: 'Gib dir die Pause. Der Markt ist in 15 Minuten auch noch da.'
};

/* ================================================================
   HILFSFUNKTIONEN
   ================================================================ */
var reducedMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
var stage = null;
var faith = CONFIG.glaubensmodusStandard;
function faithSetting() { return S.settings.christlicherImpuls === undefined ? CONFIG.glaubensmodusStandard : !!S.settings.christlicherImpuls; }
var session = null, flowKey = null, stepIdx = 0, mode = 'home', cleanups = [], uidN = 0;

function h(tag, attrs) {
  var el = document.createElement(tag);
  if (attrs) Object.keys(attrs).forEach(function (k) {
    var v = attrs[k];
    if (v === null || v === undefined || v === false) return;
    if (k === 'class') el.className = v;
    else if (k.indexOf('on') === 0 && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  });
  var kids = Array.prototype.slice.call(arguments, 2);
  (function add(list) {
    list.forEach(function (kid) {
      if (kid === null || kid === undefined || kid === false) return;
      if (Array.isArray(kid)) add(kid);
      else el.appendChild(kid instanceof Node ? kid : document.createTextNode(String(kid)));
    });
  })(kids);
  return el;
}
function uid(p) { uidN += 1; return p + uidN; }
function rnd(n) { return Math.floor(Math.random() * n); }
function onCleanup(fn) { cleanups.push(fn); }
function cleanup() { cleanups.forEach(function (fn) { try { fn(); } catch (e) { /* ignorieren */ } }); cleanups = []; }
function toggleIn(arr, v) { var i = arr.indexOf(v); if (i >= 0) arr.splice(i, 1); else arr.push(v); }
function fmtClock(s) { var m = Math.floor(s / 60), r = s % 60; return m + ':' + (r < 10 ? '0' : '') + r; }
function fmtDur(s) {
  if (s < 55) return Math.ceil(s / 5) * 5 + ' Sekunden';
  var m = Math.round(s / 30) / 2;
  return m === 1 ? '1 Minute' : String(m).replace('.', ',') + ' Minuten';
}
function withHints(pattern, hints) {
  return pattern.map(function (p, i) { return Object.assign({}, p, { hint: hints[i] }); });
}
function guide() {
  var paras = Array.prototype.slice.call(arguments).filter(Boolean);
  return h('div', { class: 'rp-guide' }, paras.map(function (p) { return typeof p === 'string' ? h('p', null, p) : p; }));
}
var HELP_HTML = '<div class="modal-head"><h2>Du musst das nicht allein tragen.</h2><button type="button" class="btn ghost icon" data-close aria-label="Schließen">' + I.close + '</button></div>' +
  '<div class="rp-dlg">' +
  '<section><h3>Akute Krise oder Gedanken, dir etwas anzutun</h3>' +
  '<p>Telefonseelsorge Deutschland, kostenlos und rund um die Uhr:<br><a href="tel:08001110111">0800 111 0 111</a> oder <a href="tel:08001110222">0800 111 0 222</a></p>' +
  '<p>Österreich: <a href="tel:142">142</a>. Schweiz: <a href="tel:143">143</a>. Bei akuter Gefahr: <a href="tel:112">112</a>.</p></section>' +
  '<section><h3>Wenn Trading sich wie Spielsucht anfühlt</h3>' +
  '<p>Beratungstelefon Glücksspielsucht, kostenlos und anonym:<br><a href="tel:08001372700">0800 1 37 27 00</a></p>' +
  '<p>Selbsttest und Online-Programm: <a href="https://www.check-dein-spiel.de" target="_blank" rel="noopener">check-dein-spiel.de</a></p></section>' +
  '<section><h3>Geldsorgen oder Schulden</h3>' +
  '<p>Hol dir Unterstützung bei einer Schuldnerberatung, zum Beispiel über die Verbraucherzentrale, Caritas oder Diakonie. Versuch nicht, Verluste durch weiteres Trading zurückzuholen.</p></section></div>' +
  '<div class="modal-foot"><button type="button" class="btn primary" data-close>Schließen</button></div>';
function openHelp() { U.modal(HELP_HTML, { cls: 'narrow' }); }
function closeHelp() { U.closeModal(); }

/* ================================================================
   BAUSTEINE
   ================================================================ */
function slider(label, obj, key, lo, hi, onChange) {
  var id = uid('r');
  var out = h('output', { class: 'rp-range-val', for: id }, String(obj[key]));
  var inp = h('input', { type: 'range', id: id, min: '1', max: '10', step: '1' });
  inp.value = String(obj[key]);
  var fill = function () { inp.style.setProperty('--p', ((Number(inp.value) - 1) / 9 * 100) + '%'); };
  fill();
  inp.addEventListener('input', function () {
    obj[key] = Number(inp.value); out.textContent = inp.value; fill();
    if (onChange) onChange();
  });
  return h('div', { class: 'rp-field rp-slider' },
    h('div', { class: 'rp-sl-head' }, h('label', { class: 'rp-l', for: id }, label), out),
    h('div', { class: 'rp-range-row slider' }, inp),
    h('div', { class: 'rp-scale-ends', 'aria-hidden': 'true' }, h('span', null, lo), h('span', null, hi)));
}

function textField(label, obj, key, opts) {
  opts = opts || {};
  var id = uid('t');
  var inp = opts.multiline
    ? h('textarea', { id: id, placeholder: opts.placeholder || null })
    : h('input', { type: opts.type || 'text', id: id, placeholder: opts.placeholder || null,
        min: opts.type === 'number' ? '1' : null, inputmode: opts.type === 'number' ? 'numeric' : null });
  inp.value = obj[key] || '';
  inp.addEventListener('input', function () { obj[key] = inp.value; });
  return h('div', { class: 'rp-field' }, h('label', { class: 'rp-l', for: id }, label), inp);
}

function chipField(label, options, isOn, toggle) {
  var lid = uid('l');
  var btns = options.map(function (o) {
    return h('button', { type: 'button', class: 'rp-chip', 'aria-pressed': String(isOn(o.value)) }, o.label);
  });
  btns.forEach(function (b, i) {
    b.addEventListener('click', function () {
      toggle(options[i].value);
      btns.forEach(function (c, j) { c.setAttribute('aria-pressed', String(isOn(options[j].value))); });
    });
  });
  return h('div', { class: 'rp-field' },
    h('p', { class: 'rp-l', id: lid }, label),
    h('div', { class: 'rp-chips', role: 'group', 'aria-labelledby': lid }, btns));
}

var RING_R = 88, RING_C = 2 * Math.PI * RING_R;
function ringSVG(startOffset) {
  var wrap = h('div', { class: 'rp-orb-wrap' });
  wrap.innerHTML = '<svg class="rp-orb-ring" viewBox="0 0 200 200" aria-hidden="true"><circle class="rp-orb-track" cx="100" cy="100" r="' + RING_R + '"/><circle class="rp-orb-prog" cx="100" cy="100" r="' + RING_R + '" stroke-dasharray="' + RING_C.toFixed(2) + '" stroke-dashoffset="' + startOffset.toFixed(2) + '"/></svg>';
  return wrap;
}

/* Geführte Atmung: eine ruhige Lichtfläche steigt beim Einatmen und sinkt beim Ausatmen, der Ring zeigt die Phase,
   die Zeile darunter zeigt den ganzen Rhythmus mit der aktuellen und der nächsten Phase. Tempo „Sanft“ dehnt kurze Phasen. */
function tempoSetting() { return S.settings.ruhepunktTempo === 'normal' ? 'normal' : 'sanft'; }
function breather(container, segments) {
  var LEAD = 3, REST = 1.5;
  var tempo = tempoSetting();
  function dur(p) { if (tempo !== 'sanft') return p.secs; return Math.round((p.secs <= 2 ? p.secs * 1.75 : p.secs <= 4 ? p.secs * 1.4 : p.secs * 1.25) * 2) / 2; }
  function total() { return segments.reduce(function (a, s) { return a + s.rounds * (s.pattern.reduce(function (b, p) { return b + dur(p); }, 0) + REST); }, 0) + LEAD; }
  var wrap = h('div', { class: 'rp-orb-wrap' });
  var tide = h('div', { class: 'rp-tide' }, h('span', { class: 'rp-tide-glow' }), h('span', { class: 'rp-tide-fill' }));
  wrap.appendChild(tide);
  var allNames = segments.map(function (s) { return s.name; }).join(', danach ');
  var segEl = h('p', { class: 'rp-seg' }, allNames);
  var phaseEl = h('p', { class: 'rp-phase', 'aria-live': 'polite' }, 'Bereit, wenn du es bist.');
  var hintEl = h('p', { class: 'rp-hint' });
  var metaEl = h('p', { class: 'rp-meta' }, 'Dauer: etwa ' + fmtDur(total()));
  var seqEl = h('div', { class: 'rp-seq', 'aria-hidden': 'true' });
  var nextEl = h('p', { class: 'rp-next' });
  var btn = h('button', { type: 'button', class: 'rp-btn rp-primary' }, 'Starten');
  var tempoBtns = [['sanft', 'Sanft'], ['normal', 'Normal']].map(function (t) {
    var bt = h('button', { type: 'button', class: 'rp-chip rp-chip-sm', 'aria-pressed': String(tempo === t[0]) }, t[1]);
    bt.addEventListener('click', function () { if (state === 'running') return; tempo = t[0]; S.setSetting('ruhepunktTempo', tempo); tempoBtns.forEach(function (x, i) { x.setAttribute('aria-pressed', String(['sanft', 'normal'][i] === tempo)); }); if (state !== 'paused') metaEl.textContent = 'Dauer: etwa ' + fmtDur(total()); buildSeq(); });
    return bt;
  });
  var tempoRow = h('div', { class: 'rp-tempo' }, h('span', null, 'Tempo'), tempoBtns);
  var state = 'idle', seg = 0, round = 0, ph = 0, phaseStart = 0, pausedAt = 0, timer = null, waitKind = null, waitStart = 0, waitDur = 0;
  function say(el, text) { if (el.textContent === text) return; el.textContent = text; el.classList.remove('rp-swap'); void el.offsetWidth; el.classList.add('rp-swap'); }

  /* Rhythmus-Zeile: ein Feld je Phase, Breite nach Dauer, aktives Feld füllt sich */
  var seqItems = [];
  function buildSeq() {
    var pat = segments[seg].pattern; seqItems = [];
    seqEl.replaceChildren.apply(seqEl, pat.map(function (p) {
      var it = h('span', { class: 'rp-seq-i', style: 'flex:' + dur(p) }, h('i'), h('b', null, p.label), h('small', null, dur(p) + ' s'));
      seqItems.push(it); return it;
    }));
  }
  function seqActive(i, secs, offset) {
    seqItems.forEach(function (it, k) { it.classList.toggle('rp-on', k === i); it.classList.toggle('rp-done', k < i); var f = it.querySelector('i'); if (k !== i) { f.style.transition = 'none'; f.style.width = k < i ? '100%' : '0%'; } });
    var f = seqItems[i] && seqItems[i].querySelector('i'); if (!f) return;
    var frac = secs > 0 ? Math.max(0, Math.min(1, offset / secs)) : 1;
    f.style.transition = 'none'; f.style.width = (frac * 100).toFixed(1) + '%'; void f.getBoundingClientRect();
    f.style.transition = reducedMotion ? 'none' : 'width ' + Math.max(0, secs - offset) + 's linear'; f.style.width = '100%';
  }
  function seqIdle() { seqItems.forEach(function (it) { it.classList.remove('rp-on', 'rp-done'); var f = it.querySelector('i'); f.style.transition = 'none'; f.style.width = '0%'; }); }

  function place(level, secs) {
    var tr = (secs > 0 && !reducedMotion) ? 'height ' + secs + 's cubic-bezier(.45, .05, .55, .95)' : 'none';
    var fill = tide.querySelector('.rp-tide-fill');
    fill.style.transition = tr; fill.style.height = (16 + level * 68) + '%';
    tide.style.setProperty('--lvl', String(level)); tide.style.setProperty('--dur', secs + 's');
  }
  function freeze() {
    var fill = tide.querySelector('.rp-tide-fill'); var hgt = getComputedStyle(fill).height; fill.style.transition = 'none'; fill.style.height = hgt;
    seqItems.forEach(function (it) { var f = it.querySelector('i'); var w = getComputedStyle(f).width; f.style.transition = 'none'; f.style.width = w; });
  }
  function cur() { return segments[seg].pattern[ph]; }
  function nextLabel() {
    var pat = segments[seg].pattern;
    if (ph + 1 < pat.length) return pat[ph + 1].label;
    if (round + 1 < segments[seg].rounds) return 'kurz ruhen, dann ' + pat[0].label.charAt(0).toLowerCase() + pat[0].label.slice(1);
    if (seg + 1 < segments.length) return segments[seg + 1].name;
    return 'fertig';
  }
  function meta() {
    var left = Math.max(1, Math.ceil(dur(cur()) - (performance.now() - phaseStart) / 1000));
    metaEl.textContent = 'Runde ' + (round + 1) + ' von ' + segments[seg].rounds + ' · noch ' + left + ' s';
  }
  function enter(offset) {
    var p = cur(); waitKind = null; var secs = dur(p);
    phaseStart = performance.now() - offset * 1000;
    say(phaseEl, p.label);
    say(hintEl, p.hint || '');
    say(nextEl, 'Danach: ' + nextLabel());
    if (segEl.textContent !== segments[seg].name) { segEl.textContent = segments[seg].name; buildSeq(); }
    place(p.level, secs - offset);
    seqActive(ph, secs, offset);
    meta();
  }
  function wait(kind, secs, offset) {
    waitKind = kind; waitDur = secs; waitStart = performance.now() - offset * 1000;
    say(phaseEl, kind === 'lead' ? 'Gleich geht’s los.' : 'Kurz ruhen.');
    say(hintEl, kind === 'lead' ? 'Setz dich bequem hin, Schultern locker. Schau auf das Licht: Es steigt, wenn du einatmest.' : 'Locker bleiben, gleich beginnt die nächste Runde.');
    say(nextEl, 'Zuerst: ' + segments[seg].pattern[0].label);
    if (segEl.textContent !== segments[seg].name) { segEl.textContent = segments[seg].name; buildSeq(); }
    if (kind === 'lead') seqIdle();
    place(0, Math.min(secs - offset, 1.5));
    waitMeta();
  }
  function waitMeta() {
    var left = Math.max(1, Math.ceil(waitDur - (performance.now() - waitStart) / 1000));
    metaEl.textContent = waitKind === 'lead' ? 'Los in ' + left + ' s' : 'Runde ' + (round + 1) + ' von ' + segments[seg].rounds + ' gleich';
  }
  function finish() {
    clearInterval(timer); timer = null; state = 'done'; waitKind = null;
    say(phaseEl, 'Gut gemacht.');
    say(hintEl, '');
    say(nextEl, '');
    segEl.textContent = allNames;
    metaEl.textContent = 'Geh weiter, wenn du bereit bist, oder mach noch eine Runde.';
    btn.textContent = 'Noch einmal';
    place(0.5, 3);
    seqItems.forEach(function (it) { it.classList.remove('rp-on'); it.classList.add('rp-done'); it.querySelector('i').style.width = '100%'; });
  }
  function advance() {
    ph += 1;
    if (ph >= segments[seg].pattern.length) {
      ph = 0; round += 1;
      if (round >= segments[seg].rounds) {
        round = 0; seg += 1;
        if (seg >= segments.length) { finish(); return; }
      }
      wait('rest', REST, 0); return;
    }
    enter(0);
  }
  function tick() {
    if (waitKind) { if ((performance.now() - waitStart) / 1000 >= waitDur) enter(0); else waitMeta(); return; }
    if ((performance.now() - phaseStart) / 1000 >= dur(cur())) advance(); else meta();
  }
  btn.addEventListener('click', function () {
    if (state === 'running') {
      pausedAt = waitKind ? (performance.now() - waitStart) / 1000 : (performance.now() - phaseStart) / 1000;
      clearInterval(timer); timer = null; state = 'paused';
      freeze();
      say(phaseEl, 'Pausiert.'); say(hintEl, '');
      btn.textContent = 'Weiter atmen';
    } else if (state === 'paused') {
      state = 'running'; btn.textContent = 'Pausieren';
      if (waitKind) wait(waitKind, waitDur, pausedAt); else enter(pausedAt);
      timer = setInterval(tick, 200);
    } else {
      seg = 0; round = 0; ph = 0; state = 'running'; btn.textContent = 'Pausieren';
      segEl.textContent = segments[0].name; buildSeq();
      wait('lead', LEAD, 0); timer = setInterval(tick, 200);
    }
    tempoBtns.forEach(function (x) { x.disabled = state === 'running'; });
  });
  buildSeq(); place(0, 0);
  onCleanup(function () { clearInterval(timer); });
  container.appendChild(h('div', { class: 'rp-breath' }, segEl, wrap, phaseEl, hintEl, metaEl, seqEl, nextEl, h('div', { class: 'rp-controls' }, btn), tempoRow));
}

/* Countdown (Visualisierung, Pause): Zeit im Ring, der Ring leert sich mit der Zeit */
function countdown(container, secs, opts) {
  var left = secs, timer = null, state = 'idle', last = 0;
  var wrap = ringSVG(0); wrap.classList.add('rp-timer-wrap');
  var prog = wrap.querySelector('.rp-orb-prog');
  var big = h('p', { class: 'rp-bigtime' }, fmtClock(secs));
  wrap.appendChild(h('div', { class: 'rp-timer-center' }, big));
  var status = h('p', { class: 'rp-muted rp-small', 'aria-live': 'polite' }, '');
  var btn = h('button', { type: 'button', class: 'rp-btn rp-primary' }, opts.startLabel);
  function draw() { prog.style.strokeDashoffset = (RING_C * (1 - Math.max(0, left) / secs)).toFixed(2); }
  btn.addEventListener('click', function () {
    if (state === 'running') {
      clearInterval(timer); state = 'paused'; btn.textContent = 'Fortsetzen';
      return;
    }
    if (state === 'done') { left = secs; status.textContent = ''; draw(); }
    state = 'running'; btn.textContent = 'Pausieren';
    if (opts.onStart) opts.onStart();
    last = performance.now();
    timer = setInterval(function () {
      var now = performance.now();
      left -= (now - last) / 1000; last = now;
      if (left <= 0) {
        left = 0; clearInterval(timer); state = 'done';
        big.textContent = fmtClock(0); status.textContent = opts.doneText; draw();
        btn.textContent = 'Noch einmal';
        return;
      }
      big.textContent = fmtClock(Math.ceil(left)); draw();
    }, 250);
  });
  onCleanup(function () { clearInterval(timer); });
  container.appendChild(h('div', { class: 'rp-timer' }, wrap, status, h('div', { class: 'rp-controls' }, btn)));
}

function ampelStatus(c) {
  var k = c.koerper;
  if (c.schlaf <= 3 || c.stress >= 8 || c.stimmung <= 2) return 'rot';
  if (c.schlaf <= 5 || c.stress >= 6 || c.stimmung <= 4 ||
      ['angespannt', 'unruhig', 'muede', 'gereizt'].some(function (x) { return k.indexOf(x) >= 0; })) return 'gelb';
  return 'gruen';
}
function renderAmpel(box) {
  var s = ampelStatus(session.checkin);
  session.ampel = s;
  var a = AMPEL[s];
  box.replaceChildren(
    h('span', { class: 'rp-dot', style: '--c:' + a.color }),
    h('div', null, h('strong', null, 'Ampel ' + a.label + ': ' + a.titel), h('span', null, a.text)));
}

function impulsData(kind) {
  if (faith) {
    var v = VERSE[kind][session.idx[kind]];
    return { art: 'bibelvers', text: v.text, stelle: v.ref };
  }
  return { art: 'leitsatz', text: LEIT[kind][session.lidx[kind]] };
}
function impulsBlock(kind) {
  if (faith) {
    var v = VERSE[kind][session.idx[kind]];
    return h('div', null,
      h('blockquote', { class: 'rp-verse' }, v.text),
      h('p', { class: 'rp-verse-ref' }, v.ref + ' (Luther 1912)' + (v.note ? '. ' + v.note : '')),
      h('p', { class: 'rp-prayer' }, GEBET[kind]));
  }
  return h('div', null, h('blockquote', { class: 'rp-verse' }, LEIT[kind][session.lidx[kind]]));
}

function summaryVor() {
  var r = session.regeln, leer = 'nicht festgelegt';
  var rows = [
    ['Zustand', 'Ampel ' + AMPEL[session.ampel].label],
    ['Maximaler Verlust', r.maxVerlust],
    ['Maximale Trades', r.maxTrades],
    ['Ich höre auf, wenn', r.stoppWenn]
  ];
  var nodes = [h('dl', { class: 'rp-summary' }, rows.map(function (row) { return [h('dt', null, row[0]), h('dd', { class: row[1] ? null : 'rp-none' }, row[1] || leer)]; }))];
  if (!r.maxVerlust && !r.maxTrades && !r.stoppWenn) {
    nodes.push(h('p', { class: 'rp-small rp-muted' }, 'Du hast noch keine Regeln festgelegt. Geh zwei Schritte zurück, wenn du sie ergänzen willst.'));
  }
  return nodes;
}

function einordnung() {
  var erg = session.ergebnis, reg = session.regelnEingehalten;
  var brach = reg === 'teilweise' || reg === 'nein';
  var r;
  if (erg === 'gross') {
    r = { titel: 'Heute ist Schluss.', warn: true, hilfe: brach,
      text: 'Nach einem großen Verlust läuft dein Stresssystem auf Hochtouren, und genau dann will dein Kopf den Verlust sofort zurückholen. Deshalb gilt: Plattform zu, heute keine Entscheidungen mehr über Geld. Geh raus, beweg dich, sprich mit jemandem, dem du vertraust. Morgen startest du erst nach der Vor-Trading-Session und mit reduziertem Risiko.' };
  } else if (erg === 'plus') {
    r = brach
      ? { titel: 'Vorsicht: Gewinn trotz Regelbruch.', warn: true,
          text: 'Das ist die gefährlichste Kombination. Wird ein Regelbruch mit Geld belohnt, lernt dein Gehirn genau das Falsche. Trag den Regelbruch trotzdem als Fehler ein, unabhängig vom Ergebnis.' }
      : { titel: 'Ein guter Tag, im Prozess und nicht nur im Konto.',
          text: 'Du hast deinen Plan umgesetzt. Genau das ist der Erfolg. Achte trotzdem auf Übermut: Nach Gewinnen fühlt sich mehr Risiko harmlos an. Morgen gelten dieselben Limits wie heute.' };
  } else if (erg === 'minus') {
    r = brach
      ? { titel: 'Das tut doppelt weh.', warn: true,
          text: 'Keine Selbstverurteilung, aber Klarheit: Was war der genaue Moment, in dem du von deinem Plan abgewichen bist? Schreib ihn unten auf. Heute kein weiterer Trade.' }
      : { titel: 'Ein Verlust nach Plan ist kein Fehler.',
          text: 'Verluste gehören zu deinem System wie der Wareneinsatz zu einem Geschäft. Du hast getan, was du dir vorgenommen hast. Es gibt nichts zurückzuholen.' };
  } else if (erg === 'null') {
    r = brach
      ? { titel: 'Ausgeglichen, aber nicht nach Plan.',
          text: 'Das Konto sieht harmlos aus, dein Verhalten war es nicht ganz. Wo bist du abgewichen, und was hat dich dazu gebracht?' }
      : { titel: 'Ruhiger Tag, sauber gehandelt.',
          text: 'Nicht jeder Tag muss etwas bringen. Die Disziplin an ruhigen Tagen ist dieselbe, die dich an wilden Tagen schützt.' };
  } else {
    r = { titel: 'Schau auf deinen Prozess.',
      text: 'Egal wie der Tag ausgegangen ist: Die entscheidende Frage ist, ob du nach deinem Plan gehandelt hast.' };
  }
  if (session.aufgewuehlt >= 8) {
    r.extra = 'Du bist gerade noch stark aufgewühlt (' + session.aufgewuehlt + ' von 10). Triff heute keine weiteren Entscheidungen über Geld, bis sich das gelegt hat.';
  }
  if (erg === 'minus' && reg === 'nein' && session.aufgewuehlt >= 8) r.hilfe = true;
  return r;
}

/* ================================================================
   ABLÄUFE
   ================================================================ */
var FLOWS = {
  vor: {
    name: 'Vor dem Trading', phase: 'var(--rp-dawn)', finish: 'Speichern und loslegen',
    desc: 'Ankommen, Check-in, Tagesregeln. Etwa 6 Minuten.',
    steps: [
      { heading: 'Erst einmal ankommen.', render: function (el) {
        el.appendChild(guide(
          'Nimm die Hand von der Maus. Stell beide Füße auf den Boden und lass die Schultern sinken.',
          'Wir beginnen mit drei tiefen Seufzern: durch die Nase einatmen, kurz nachziehen, dann lange durch den Mund ausatmen. Das ist einer der schnellsten Wege, dein Nervensystem herunterzufahren.'));
        breather(el, [{ name: 'Tiefer Seufzer', pattern: P.seufzer, rounds: 3 }]);
      } },
      { heading: 'Wie geht es dir heute wirklich?', render: function (el) {
        var c = session.checkin;
        var box = h('div', { class: 'rp-ampel', 'aria-live': 'polite' });
        var upd = function () { renderAmpel(box); };
        el.append(
          guide('Ehrlich einschätzen, nicht schönreden. Dein Zustand entscheidet mit, wie gut deine Entscheidungen heute werden.'),
          slider('Wie gut hast du geschlafen?', c, 'schlaf', 'kaum', 'ausgeruht', upd),
          slider('Wie gestresst bist du?', c, 'stress', 'entspannt', 'unter Strom', upd),
          slider('Wie ist deine Stimmung?', c, 'stimmung', 'am Boden', 'sehr gut', upd),
          chipField('Was sagt dein Körper?', KOERPER,
            function (v) { return c.koerper.indexOf(v) >= 0; },
            function (v) { toggleIn(c.koerper, v); upd(); }),
          box);
        upd();
      } },
      { heading: 'Im Viereck atmen.', render: function (el) {
        el.appendChild(guide('Vier Sekunden ein, vier halten, vier aus, vier halten. Der gleichmäßige Takt beruhigt, ohne müde zu machen. So gehst du wach und ruhig in den Handel.'));
        breather(el, [{ name: 'Box Breathing', pattern: P.box, rounds: 5 }]);
      } },
      { heading: 'Deine Regeln für heute.', render: function (el) {
        var r = session.regeln;
        el.append(
          guide('Leg deine Grenzen jetzt fest, solange du ruhig bist. Im Stress entscheidest du schlechter. Dann gilt, was hier steht.'),
          session.ampel !== 'gruen'
            ? h('div', { class: 'rp-callout' }, h('p', null, 'Deine Ampel steht heute auf ' + AMPEL[session.ampel].label + '. Setz deine Limits bewusst niedriger als an einem normalen Tag.'))
            : '',
          textField('Maximaler Verlust heute', r, 'maxVerlust', { placeholder: 'z. B. 2R oder 150 €' }),
          textField('Maximale Anzahl Trades', r, 'maxTrades', { type: 'number', placeholder: 'z. B. 3' }),
          textField('Ich höre heute sofort auf, wenn …', r, 'stoppWenn', { placeholder: 'ich zwei Verluste in Folge habe' }));
      } },
      { heading: 'Den Tag einmal durchspielen.', render: function (el) {
        el.append(
          guide('Schließ die Augen und geh diese drei Bilder langsam durch:'),
          h('ol', { class: 'rp-visual' },
            h('li', null, 'Dein Setup erscheint. Du prüfst deine Checkliste, ruhig und ohne Eile, und steigst ein.'),
            h('li', null, 'Der Trade läuft gegen dich und erreicht deinen Stop. Du atmest aus. Kein Nachlegen, kein Verschieben. Der Verlust war vorher akzeptiert.'),
            h('li', null, 'Du notierst den Trade und wartest auf das nächste Setup. Oder du hörst auf, weil dein Limit erreicht ist.')),
          guide('Wer den Verlust vorher im Kopf erlebt hat, muss ihn im Ernstfall nicht bekämpfen.'));
        countdown(el, 60, { startLabel: '60 Sekunden starten', doneText: 'Öffne die Augen, wenn du so weit bist.' });
      } },
      { heading: function () { return faith ? 'Mit Ausrichtung in den Tag.' : 'Dein Leitsatz für heute.'; }, render: function (el) {
        el.append(impulsBlock('vor'), h('h3', { class: 'rp-sub' }, 'Dein Plan für heute'));
        summaryVor().forEach(function (n) { el.appendChild(n); });
      } }
    ]
  },

  nach: {
    name: 'Nach dem Trading', phase: 'var(--rp-dusk)', finish: 'Speichern und abschalten',
    desc: 'Runterfahren, einordnen, abschalten. Etwa 6 Minuten.',
    steps: [
      { heading: 'Wie war dein Handelstag?', render: function (el) {
        el.append(
          chipField('Ergebnis', ERGEBNIS,
            function (v) { return session.ergebnis === v; },
            function (v) { session.ergebnis = v; }),
          slider('Wie aufgewühlt bist du gerade?', session, 'aufgewuehlt', 'ganz ruhig', 'völlig aufgewühlt'),
          chipField('Hast du deine Regeln eingehalten?', REGELN,
            function (v) { return session.regelnEingehalten === v; },
            function (v) { session.regelnEingehalten = v; }));
      } },
      { heading: 'Runterfahren.', render: function (el) {
        var lang = session.aufgewuehlt >= 7;
        el.appendChild(guide(
          'Bevor du irgendetwas bewertest, bring deinen Körper zur Ruhe. Erst drei tiefe Seufzer, dann ruhiges Atmen mit langem Ausatmen.',
          lang ? 'Du bist gerade stark aufgewühlt. Deshalb atmen wir etwas länger.' : null));
        breather(el, [
          { name: 'Tiefer Seufzer', pattern: P.seufzer, rounds: 3 },
          faith
            ? { name: 'Atemgebet', pattern: withHints(P.ruhig, ['Sei still,', 'und erkenne, dass ich Gott bin.']), rounds: lang ? 10 : 6 }
            : { name: 'Ruhiges Atmen', pattern: P.ruhig, rounds: lang ? 10 : 6 }
        ]);
      } },
      { heading: 'Einordnen, nicht verurteilen.', render: function (el) {
        var e = einordnung();
        el.appendChild(h('div', { class: 'rp-callout' + (e.warn ? ' rp-warn' : '') },
          h('h3', null, e.titel), h('p', null, e.text), e.extra ? h('p', null, e.extra) : null));
        if (e.hilfe) {
          el.appendChild(h('div', { class: 'rp-callout rp-warn' },
            h('p', null, 'Wenn du merkst, dass du Verluste zurückholen willst, mit Geld tradest, das du eigentlich brauchst, oder nicht aufhören kannst: Das sind Warnsignale. Du musst das nicht allein lösen.'),
            h('button', { type: 'button', class: 'rp-btn rp-ghost', onclick: openHelp }, 'Hilfe und Beratung ansehen')));
        }
        el.append(
          guide('Bewerte deine Entscheidungen, nicht dein Konto. Ein guter Trade kann Geld verlieren, ein schlechter kann Geld bringen.'),
          textField('Was habe ich heute gut gemacht, unabhängig vom Ergebnis?', session, 'gutGemacht', { multiline: true }));
        if (session.regelnEingehalten === 'teilweise' || session.regelnEingehalten === 'nein') {
          el.appendChild(textField('Wann genau bin ich von meinem Plan abgewichen, und was habe ich in dem Moment gefühlt?', session, 'abweichung', { multiline: true }));
        }
        el.appendChild(textField('Was nehme ich mit für morgen?', session, 'mitnehmen', { multiline: true }));
      } },
      { heading: function () { return faith ? 'Den Tag in Gottes Hand legen.' : 'Abschließen und abschalten.'; }, render: function (el) {
        if (faith) {
          el.append(
            guide('Ein kurzer Rückblick, angelehnt an das Examen von Ignatius von Loyola. Nimm dir für jede Frage einen Moment Stille.'),
            textField('Wofür bin ich heute dankbar?', session.examen, 'dank', { multiline: true }),
            textField('Wo war ich heute frei, und wo war ich getrieben?', session.examen, 'frei', { multiline: true }),
            textField('Was lege ich jetzt in Gottes Hand?', session.examen, 'hand', { multiline: true }));
        } else {
          el.append(
            guide('Drei Dinge, für die du heute dankbar bist. Gern auch außerhalb des Tradings.'),
            textField('Erstens', session.dankbar, 0),
            textField('Zweitens', session.dankbar, 1),
            textField('Drittens', session.dankbar, 2));
        }
        var a = session.abschalten;
        var items = [
          ['plattform', 'Plattform und Charts sind geschlossen.'],
          ['handy', 'Trading-Apps auf dem Handy sind zu.'],
          ['raus', 'Ich gehe jetzt zehn Minuten raus oder bewege mich.']
        ];
        el.append(
          impulsBlock('nach'),
          h('h3', { class: 'rp-sub' }, 'Bewusst abschalten'),
          h('div', { class: 'rp-checks' }, items.map(function (it) {
            var cb = h('input', { type: 'checkbox' });
            cb.checked = !!a[it[0]];
            cb.addEventListener('change', function () { a[it[0]] = cb.checked; });
            return h('label', null, cb, h('span', null, it[1]));
          })));
      } }
    ]
  },

  akut: {
    name: 'Akut-Reset', phase: 'var(--rp-brick)', finish: 'Speichern und schließen',
    desc: 'Gerade aufgewühlt? Eine Minute, bevor du irgendetwas klickst.',
    steps: [
      { heading: 'Stopp. Hände weg von Maus und Tastatur.', render: function (el) {
        el.appendChild(guide(
          'Kein neuer Trade, kein Stop verschieben, kein Nachlegen. Nicht jetzt.',
          'Nach einem Verlust ist dein Stresssystem im Alarmmodus. Genau dann fühlt sich Zurückholen logisch an. Es ist es nicht. Atme zuerst.'));
        var segs = [{ name: 'Tiefer Seufzer', pattern: P.seufzer, rounds: 3 }];
        if (faith) segs.push({ name: 'Herzensgebet', pattern: P.jesus, rounds: 4 });
        breather(el, segs);
      } },
      { heading: 'Was fühlst du gerade?', render: function (el) {
        el.append(
          chipField('Benenne es, ohne es zu bewerten.', GEFUEHLE,
            function (v) { return session.gefuehle.indexOf(v) >= 0; },
            function (v) { toggleIn(session.gefuehle, v); }),
          guide('Das Gefühl ist Information, kein Befehl. Du darfst es spüren, ohne ihm zu gehorchen.'));
        var pause = h('section', { class: 'rp-pause' }, h('h3', { class: 'rp-sub' }, 'Deine Pause: 15 Minuten kein neuer Trade.'));
        countdown(pause, 15 * 60, {
          startLabel: 'Pause starten',
          doneText: 'Die Pause ist vorbei. Entscheide jetzt in Ruhe, ob du heute weitermachst.',
          onStart: function () { session.pauseGestartet = true; }
        });
        pause.appendChild(h('p', { class: 'rp-small rp-muted' },
          'Passiert dir das öfter? Sprich im Mentor-Chat darüber oder schau unter ',
          h('button', { type: 'button', class: 'rp-inline-link', onclick: openHelp }, 'Hilfe und Beratung'), '.'));
        el.appendChild(pause);
      } }
    ]
  }
};

var ICON = {
  /* Sonnenaufgang: Sonne steigt über den Horizont, Strahlen atmen */
  vor: '<svg viewBox="0 0 56 56" aria-hidden="true"><defs><clipPath id="rpc-vor"><rect x="0" y="0" width="56" height="37"/></clipPath></defs>' +
    '<g clip-path="url(#rpc-vor)"><g class="rp-i-sun"><g class="rp-i-rays" stroke="var(--c)" stroke-width="2.2" stroke-linecap="round"><line x1="28" y1="9" x2="28" y2="14"/><line x1="14.6" y1="14.6" x2="18.1" y2="18.1"/><line x1="41.4" y1="14.6" x2="37.9" y2="18.1"/><line x1="8" y1="28" x2="13" y2="28"/><line x1="43" y1="28" x2="48" y2="28"/></g><circle cx="28" cy="28" r="9.5" fill="var(--c)"/></g></g>' +
    '<line class="rp-i-hz" x1="8" y1="37" x2="48" y2="37" stroke="var(--c)" stroke-width="2" stroke-linecap="round" opacity=".55"/><line x1="16" y1="43" x2="40" y2="43" stroke="var(--c)" stroke-width="2" stroke-linecap="round" opacity=".22"/></svg>',
  /* Abend: Mond sinkt sanft, Sterne blinken */
  nach: '<svg viewBox="0 0 56 56" aria-hidden="true"><defs><mask id="rpm-nach"><rect width="56" height="56" fill="#fff"/><circle cx="34" cy="21" r="8" fill="#000"/></mask></defs>' +
    '<g class="rp-i-moon"><circle cx="28" cy="25" r="10" fill="var(--c)" mask="url(#rpm-nach)"/></g>' +
    '<g class="rp-i-stars" fill="var(--c)"><circle class="s1" cx="13" cy="15" r="1.6"/><circle class="s2" cx="44" cy="31" r="1.4"/><circle class="s3" cx="18" cy="33" r="1.2"/></g>' +
    '<line x1="8" y1="41" x2="48" y2="41" stroke="var(--c)" stroke-width="2" stroke-linecap="round" opacity=".55"/><line x1="16" y1="47" x2="40" y2="47" stroke="var(--c)" stroke-width="2" stroke-linecap="round" opacity=".22"/></svg>',
  /* Akut: Pause im atmenden Ring */
  akut: '<svg viewBox="0 0 56 56" aria-hidden="true"><circle class="rp-i-ring" cx="28" cy="28" r="17" fill="none" stroke="var(--c)" stroke-width="2"/><circle class="rp-i-ring2" cx="28" cy="28" r="17" fill="none" stroke="var(--c)" stroke-width="1.5"/>' +
    '<g class="rp-i-pause" fill="var(--c)"><rect x="21" y="19" width="5" height="18" rx="2.5"/><rect x="30" y="19" width="5" height="18" rx="2.5"/></g></svg>'
};

/* ================================================================
   SESSION UND NAVIGATION
   ================================================================ */
function newSession(typ) {
  return {
    typ: typ,
    gestartet: new Date().toISOString(),
    idx: { vor: rnd(VERSE.vor.length), nach: rnd(VERSE.nach.length) },
    lidx: { vor: rnd(LEIT.vor.length), nach: rnd(LEIT.nach.length) },
    checkin: { schlaf: 6, stress: 5, stimmung: 6, koerper: [] },
    ampel: 'gruen',
    regeln: { maxVerlust: '', maxTrades: '', stoppWenn: '' },
    ergebnis: null, aufgewuehlt: 5, regelnEingehalten: null,
    gutGemacht: '', abweichung: '', mitnehmen: '',
    examen: { dank: '', frei: '', hand: '' },
    dankbar: ['', '', ''],
    abschalten: { plattform: false, handy: false, raus: false },
    gefuehle: [], pauseGestartet: false
  };
}

function buildEntry() {
  var s = session;
  var e = { typ: s.typ, gestartet: s.gestartet, beendet: new Date().toISOString(), glaubensmodus: faith };
  if (s.typ === 'vor') {
    Object.assign(e, { checkin: s.checkin, ampel: s.ampel, regeln: s.regeln, impuls: impulsData('vor') });
  } else if (s.typ === 'nach') {
    Object.assign(e, {
      ergebnis: s.ergebnis, aufgewuehlt: s.aufgewuehlt, regelnEingehalten: s.regelnEingehalten,
      gutGemacht: s.gutGemacht, abweichung: s.abweichung, mitnehmen: s.mitnehmen,
      reflexion: faith ? { examen: s.examen } : { dankbar: s.dankbar },
      abschalten: s.abschalten, impuls: impulsData('nach')
    });
  } else {
    Object.assign(e, { gefuehle: s.gefuehle, pauseGestartet: s.pauseGestartet });
  }
  return JSON.parse(JSON.stringify(e));
}

function homeBtn(show) { var b = document.getElementById('rp-homebtn'); if (b) b.hidden = !show; }
function renderHome() {
  cleanup(); homeBtn(false);
  mode = 'home'; flowKey = null; session = null;
  stage.style.setProperty('--phase', 'var(--rp-moss)');
  var title = h('h1', { class: 'rp-q', tabindex: '-1' }, 'Wo stehst du gerade?');
  stage.replaceChildren.apply(stage, [
    title,
    h('p', { class: 'rp-lead' }, 'Ein paar Minuten, um klar in den Handel zu gehen und sauber wieder herauszukommen.'),
    h('div', { class: 'rp-choices' }, ['vor', 'nach', 'akut'].map(function (key) {
      var f = FLOWS[key];
      var icon = h('span', { class: 'rp-icon' });
      icon.innerHTML = ICON[key];
      return h('button', { type: 'button', class: 'rp-choice', style: '--c:' + f.phase, onclick: function () { start(key); } },
        icon, h('span', null, h('span', { class: 'rp-name' }, f.name), h('span', { class: 'rp-desc' }, f.desc)));
    })),
    historyEl()].filter(Boolean));
  return title;
}

function start(key) {
  flowKey = key; session = newSession(key); stepIdx = 0;
  renderStep();
}

function renderStep() {
  cleanup(); homeBtn(true);
  mode = 'step';
  var flow = FLOWS[flowKey], step = flow.steps[stepIdx], n = flow.steps.length;
  var isLast = stepIdx === n - 1;
  stage.style.setProperty('--phase', flow.phase);
  var heading = typeof step.heading === 'function' ? step.heading() : step.heading;
  var title = h('h2', { class: 'rp-title', tabindex: '-1' }, heading);
  var content = h('div', { class: 'rp-content' });
  var back = h('button', { type: 'button', class: 'rp-btn rp-ghost' }, stepIdx === 0 ? 'Abbrechen' : 'Zurück');
  var next = h('button', { type: 'button', class: 'rp-btn rp-primary' }, isLast ? flow.finish : 'Weiter');
  back.addEventListener('click', function () {
    if (stepIdx === 0) { renderHome().focus({ preventScroll: true }); }
    else { stepIdx -= 1; renderStep(); }
  });
  next.addEventListener('click', function () {
    if (isLast) finish(next); else { stepIdx += 1; renderStep(); }
  });
  stage.replaceChildren(
    h('div', { class: 'rp-head' },
      h('p', { class: 'rp-where' }, flow.name + ', Schritt ' + (stepIdx + 1) + ' von ' + n),
      h('div', { class: 'rp-progress', 'aria-hidden': 'true' }, flow.steps.map(function (_, i) { return h('i', { class: i <= stepIdx ? 'rp-on' : '' }); }))),
    title, content, h('div', { class: 'rp-nav' }, back, next));
  step.render(content);
  /* Schritte ohne Atmung liegen offen auf der Seite, nur die Atemschritte haben eine Bühne */
  content.classList.toggle('rp-open', !content.querySelector('.rp-breath'));
  if (content.querySelector('.rp-breath')) {
    content.querySelectorAll('.rp-guide').forEach(function (g) {
      var ps = Array.prototype.slice.call(g.querySelectorAll(':scope > p'));
      if (!ps.length) return;
      var more = h('details', { class: 'rp-more' }, h('summary', null, 'Anleitung anzeigen'));
      ps.forEach(function (pEl) { more.appendChild(pEl); });
      g.appendChild(more);
    });
  }
  window.scrollTo(0, 0);
  title.focus({ preventScroll: true });
}

function finish(btn) {
  btn.disabled = true; btn.textContent = 'Speichert …';
  var eintrag = buildEntry();
  Promise.resolve().then(function () { return CONFIG.onSave(eintrag); }).then(function () {
    window.dispatchEvent(new CustomEvent('ruhepunkt:gespeichert', { detail: eintrag }));
    renderDone();
  }).catch(function () {
    btn.disabled = false; btn.textContent = FLOWS[flowKey].finish;
    var msg = stage.querySelector('.rp-error');
    if (!msg) { msg = h('p', { class: 'rp-error', role: 'alert' }); stage.appendChild(msg); }
    msg.textContent = 'Speichern hat nicht geklappt. Prüf deine Verbindung und versuch es noch einmal.';
  });
}

function renderDone() {
  cleanup(); homeBtn(true);
  mode = 'done';
  var title = h('h2', { class: 'rp-title', tabindex: '-1' }, 'Gespeichert.');
  var home = h('button', { type: 'button', class: 'rp-btn rp-ghost' }, 'Zur Übersicht');
  home.addEventListener('click', function () { renderHome().focus({ preventScroll: true }); });
  stage.replaceChildren(
    title,
    h('p', { class: 'rp-lead' }, DONE[flowKey]),
    h('div', { class: 'rp-nav rp-solo' }, home,
      typeof CONFIG.onMentor === 'function'
        ? h('button', { type: 'button', class: 'rp-btn rp-primary', onclick: CONFIG.onMentor }, 'Mit dem Mentor besprechen')
        : null));
  window.scrollTo(0, 0);
  title.focus({ preventScroll: true });
}

/* ================================================================
   VERLAUF (gespeicherte Sessions des Nutzers)
   ================================================================ */
function entrySummary(e) {
  var lbl = function (list, v) { var o = list.filter(function (x) { return x.value === v; })[0]; return o ? o.label : ''; };
  if (e.typ === 'vor') return 'Ampel ' + (AMPEL[e.ampel] ? AMPEL[e.ampel].label : '') + (e.regeln && e.regeln.maxVerlust ? ' · max. Verlust ' + e.regeln.maxVerlust : '');
  if (e.typ === 'nach') return [lbl(ERGEBNIS, e.ergebnis), e.regelnEingehalten ? 'Regeln: ' + lbl(REGELN, e.regelnEingehalten) : ''].filter(Boolean).join(' · ') || 'Abgeschlossen';
  return (e.gefuehle || []).map(function (v) { return lbl(GEFUEHLE, v); }).filter(Boolean).join(', ') || 'Akut-Reset';
}
function historyEl() {
  var list = S.ruhepunkt().slice(0, 8);
  if (!list.length) return null;
  return h('section', { class: 'rp-history' },
    h('h3', { class: 'rp-sub' }, 'Deine letzten Sessions'),
    h('ul', { class: 'rp-list' }, list.map(function (e) {
      var f = FLOWS[e.typ];
      return h('li', { style: '--c:' + (f ? f.phase : 'var(--rp-moss)') },
        h('span', { class: 'rp-dot' }),
        h('span', { class: 'rp-li-main' }, h('b', null, f ? f.name : e.typ), h('span', { class: 'rp-muted rp-small' }, entrySummary(e))),
        h('span', { class: 'rp-muted rp-small rp-li-time' }, fmt.dateTime(e.gestartet)),
        h('button', { type: 'button', class: 'rp-x', 'data-action': 'rp-delete', 'data-id': e.id, 'aria-label': 'Eintrag löschen' }, '×'));
    })));
}

/* ================================================================
   SEITE UND ANBINDUNG AN JOURNALYST
   ================================================================ */
/* Kerze statt Schalter: angezündet = Bibelvers, Gebet und Atemgebet in den Sessions */
/* Christlicher Impuls: eine schlanke Kerze in einer Kachel wie bei den Ablauf-Symbolen. Angezündet = an, ausgeblasen = aus. */
var CANDLE_SVG = '<svg viewBox="0 0 48 60" aria-hidden="true">' +
  '<defs><radialGradient id="rpc-glow" cx="50%" cy="60%" r="50%"><stop offset="0" stop-color="#ffd166" stop-opacity=".55"/><stop offset="1" stop-color="#ffd166" stop-opacity="0"/></radialGradient>' +
  '<linearGradient id="rpc-flame" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe29a"/><stop offset=".55" stop-color="#ffb13b"/><stop offset="1" stop-color="#f97316"/></linearGradient>' +
  '<linearGradient id="rpc-body" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fbf5e6"/><stop offset=".55" stop-color="#efe6d0"/><stop offset="1" stop-color="#d9cfb6"/></linearGradient></defs>' +
  '<ellipse class="rp-c-glow" cx="24" cy="17" rx="16" ry="18" fill="url(#rpc-glow)"/>' +
  '<path class="rp-c-smoke" d="M24 20c-2.2-3 2.2-5.5 0-8.5s2.2-4.5 0-7.5" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>' +
  '<g class="rp-c-flame"><path d="M24 5.5c3.6 4.6 6.2 7.8 6.2 12a6.2 6.2 0 0 1-12.4 0c0-4.2 2.6-7.4 6.2-12z" fill="url(#rpc-flame)"/><path d="M24 12.5c1.7 2.3 3 4.2 3 6.2a3 3 0 0 1-6 0c0-2 1.3-3.9 3-6.2z" fill="#fff6d6" opacity=".9"/></g>' +
  '<circle class="rp-c-ember" cx="24" cy="23.4" r="1.1" fill="#f97316"/>' +
  '<rect x="23.2" y="20" width="1.6" height="4.6" rx=".8" fill="#5a4a3a"/>' +
  '<rect x="18.5" y="24" width="11" height="30" rx="3" fill="url(#rpc-body)"/>' +
  '<path d="M18.5 28c2.2 1.6 3.3-1.2 5.5 0s3.3 1.6 5.5 0" fill="none" stroke="#c9bda2" stroke-width="1"/>' +
  '<rect x="15" y="53" width="18" height="3.5" rx="1.75" fill="#b8ad95" opacity=".8"/></svg>';
function candleHTML() {
  return '<button type="button" class="rp-candle' + (faith ? ' rp-on' : '') + '" role="switch" aria-checked="' + faith + '" data-action="rp-faith-toggle" aria-label="Christlicher Impuls ' + (faith ? 'ausschalten' : 'einschalten') + '">' +
    '<span class="rp-candle-tile">' + CANDLE_SVG + '</span>' +
    '<span class="rp-candle-text"><b>Christlicher Impuls</b><small>' + (faith ? 'an · Bibelvers, Gebet, Atemgebet' : 'aus · neutrale Leitsätze') + '</small></span></button>';
}
function syncFaithUI() {
  var t = document.getElementById('rp-faith'); if (t) t.checked = faith;
  document.querySelectorAll('[data-action="rp-faith-toggle"]').forEach(function (b) {
    b.setAttribute('aria-checked', String(faith)); b.classList.toggle('rp-on', faith);
    b.setAttribute('aria-label', 'Christlicher Impuls ' + (faith ? 'ausschalten' : 'einschalten'));
    var sm = b.querySelector('.rp-candle-text small'); if (sm) sm.textContent = faith ? 'an · Bibelvers, Gebet, Atemgebet' : 'aus · neutrale Leitsätze';
  });
}
function setFaith(v) {
  faith = !!v; S.setSetting('christlicherImpuls', faith);
  syncFaithUI();
  if (mode === 'step') renderStep();
}
/* ---------- Ruhiger Raum: beim Betreten schweben Kirschblütenblätter durch den Ruhepunkt-Bereich, danach treiben ruhige Farbflächen hinter den Inhalten ----------
   Wenige Blätter, langsam, schräg wie vom Wind getragen; jedes kippt und dreht sich beim Fallen. Nur im Inhaltsbereich (unter der Kopfzeile,
   neben der Seitenleiste), Klicks gehen durch; bei reduzierter Bewegung keine Blätter */
var calmHere = false, bloomLayer = null, bloomTimer = null, calmEnterTimer = null;
var SAKURA_DEFS = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>' +
  '<linearGradient id="rp-sk-a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2f6"/><stop offset=".55" stop-color="#ffd0df"/><stop offset="1" stop-color="#f7a8c2"/></linearGradient>' +
  '<linearGradient id="rp-sk-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#ffe3ec"/><stop offset="1" stop-color="#fbbcd0"/></linearGradient>' +
  '<linearGradient id="rp-sk-c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe0ea"/><stop offset=".6" stop-color="#ffb9cf"/><stop offset="1" stop-color="#ef93b2"/></linearGradient></defs></svg>';
/* Blütenblatt mit der typischen Kerbe oben, unten spitz zulaufend */
function sakuraSVG(g) { return '<svg viewBox="0 0 30 30"><path d="M15 28.5C6.5 23 3 13.5 7.5 5.6C9.6 2.2 13.2 2.6 15 6.4C16.8 2.6 20.4 2.2 22.5 5.6C27 13.5 23.5 23 15 28.5Z" fill="url(#rp-sk-' + g + ')"/><path d="M15 9.5V24" stroke="#ffffff" stroke-opacity=".45" stroke-width=".9" stroke-linecap="round"/></svg>'; }
function bloom() {
  if (reducedMotion) return;
  var main = document.getElementById('main'), bar = document.querySelector('.topbar'); if (!main) return;
  var r = main.getBoundingClientRect(), top = Math.max(0, bar ? bar.getBoundingClientRect().bottom : r.top), w = r.width, h = window.innerHeight - top; if (w < 40 || h < 40) return;
  var layer = document.createElement('div'); layer.className = 'rp-bloom'; layer.setAttribute('aria-hidden', 'true');
  layer.style.cssText = 'left:' + r.left + 'px;top:' + top + 'px;width:' + w + 'px;height:' + h + 'px';
  var out = SAKURA_DEFS, n = w < 600 ? 10 : 15, rnd = Math.random;
  for (var i = 0; i < n; i++) {
    var size = 15 + rnd() * 18, near = (size - 15) / 18; /* größere Blätter sind näher: kräftiger und etwas schneller, kleine leicht unscharf */
    var x = -0.08 * w + rnd() * 0.72 * w, dur = 10.4 - near * 2.4 + rnd() * 1.2, delay = i * (3.6 / n) + rnd() * 0.5;
    var tx = Math.round(0.28 * w + rnd() * 0.3 * w + 80), ty = Math.round(h + 90);
    out += '<span class="fl" style="left:' + Math.round(x) + 'px;--tx:' + tx + 'px;--ty:' + ty + 'px;--d:' + dur.toFixed(2) + 's;--dl:' + delay.toFixed(2) + 's;--o:' + (0.6 + near * 0.38).toFixed(2) + (near < 0.3 ? ';--blur:1px' : '') + '">' +
      '<i style="--b:' + (2.6 + rnd() * 1.6).toFixed(2) + 's;--amp:' + Math.round(14 + rnd() * 22) + 'px"><b style="width:' + Math.round(size) + 'px;height:' + Math.round(size) + 'px;--t:' + (1.8 + rnd() * 1.6).toFixed(2) + 's;--spin:' + Math.round((rnd() < 0.5 ? -1 : 1) * (160 + rnd() * 220)) + 'deg">' +
      sakuraSVG('abc'.charAt(i % 3)) + '</b></i></span>';
  }
  layer.innerHTML = out; document.body.appendChild(layer); bloomLayer = layer;
  clearTimeout(bloomTimer); bloomTimer = setTimeout(function () { layer.remove(); if (bloomLayer === layer) bloomLayer = null; }, 16000);
}
function calmEnter() {
  var html = document.documentElement; html.classList.add('calm');
  if (!document.querySelector('.rp-ambient')) { var amb = document.createElement('div'); amb.className = 'rp-ambient'; amb.setAttribute('aria-hidden', 'true'); amb.innerHTML = '<i></i><i></i><i></i>'; document.body.appendChild(amb); }
  if (calmHere) return; calmHere = true;
  html.classList.add('calm-enter'); clearTimeout(calmEnterTimer); calmEnterTimer = setTimeout(function () { html.classList.remove('calm-enter'); }, 1400);
  bloom();
}
function calmLeave() {
  calmHere = false; clearTimeout(calmEnterTimer); clearTimeout(bloomTimer); document.documentElement.classList.remove('calm', 'calm-enter');
  if (bloomLayer) { bloomLayer.remove(); bloomLayer = null; }
  var amb = document.querySelector('.rp-ambient'); if (amb) amb.remove();
}
App.screens.ruhepunkt = {
  title: 'Ruhepunkt',
  ownActions: true, /* keine globalen Kopfzeilen-Knöpfe: ein Neuaufbau würde Atmung und Countdown zurücksetzen */
  render: function () {
    faith = faithSetting();
    return '<div class="rp"><header class="rp-top"><button type="button" class="btn ghost sm" id="rp-homebtn" data-action="rp-home" hidden>' + I.back + ' Übersicht</button></header>' +
      '<div class="rp-stage" id="rp-stage"></div>' +
      '<footer class="rp-foot">' + candleHTML() + '<button type="button" class="rp-btn rp-quiet" data-action="rp-help">Hilfe und Beratung</button></footer></div>';
  },
  mount: function (main) {
    calmEnter();
    stage = main.querySelector('#rp-stage'); faith = faithSetting();
    if (mode === 'step' && session) renderStep(); else renderHome();
  }
};
Object.assign(App.actions, {
  'rp-faith': function (el) { setFaith(el.checked); },
  'rp-faith-toggle': function () { setFaith(!faith); },
  'rp-help': function () { openHelp(); },
  'rp-home': function () { if (stage) renderHome().focus({ preventScroll: true }); },
  'rp-delete': function (el) { U.confirmModal('Session löschen?', 'Der Eintrag wird dauerhaft aus dem Journal entfernt.', { ok: 'Löschen', danger: true }).then(function (yes) { if (!yes) return; S.deleteRuhepunkt(el.dataset.id); if (stage && mode === 'home') renderHome(); }); }
});
/* Beim Verlassen der Seite laufen keine Timer weiter; eine angefangene Session bleibt erhalten und geht beim Zurückkommen weiter */
window.addEventListener('hashchange', function () { if (location.hash.indexOf('#/ruhepunkt') !== 0) { cleanup(); calmLeave(); if (mode === 'done') { mode = 'home'; flowKey = null; session = null; } } });
root.Ruhepunkt = { CONFIG: CONFIG, FLOWS: FLOWS, AMPEL: AMPEL, ampelStatus: ampelStatus, einordnung: einordnung, buildEntry: buildEntry, newSession: newSession, session: function () { return session; }, start: start, setFaith: setFaith };
})(typeof self !== 'undefined' ? self : this);
