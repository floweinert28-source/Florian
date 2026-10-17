/* Farben: Akzent, Gewinn und Verlust frei wählbar; gilt für App und Startseite */
(function (root) {
  'use strict';
  const DEFAULTS = { dark: { accent: '#ede6da', profit: '#1fae7c', loss: '#ef4444', be: '#9a8cf8' }, light: { accent: '#1c1a17', profit: '#16a34a', loss: '#ef4444', be: '#5f4fcf' } }; /* Akzent Elfenbein (hell: Grafit), Grün nur für Gewinn; Gewinn und Verlust gedämpft statt neon (ruhiger Gesamt-Look) */
  /* Schriftarten: „modern“ ist der Standard (Satoshi von Fontshare, Zahlen in Onest; beide geometrisch, gleiche Proportionen), „geschwungen“ die frühere
     Standardschrift (Quicksand, Zahlen in Onest), „system“ die Schrift des Geräts (Apple: SF Pro, Windows: Segoe UI, Android: Roboto; ersetzt das frühere „klassisch“ mit Inter),
     „rund“ eine Schrift für Text und Zahlen.
     Satoshi steht unter der ITF Free Font License: Laden über die Fontshare-API (app.html), Schriftdateien liegen nicht im Repository */
  const DEFAULT_FONT = 'modern';
  const FONTS = {
    modern: { name: 'Modern', desc: 'Standard: klar und modern, Zahlen in Onest', text: '"Satoshi", "Onest", "Segoe UI", system-ui, -apple-system, sans-serif', num: '"Onest", "Segoe UI", system-ui, -apple-system, sans-serif', gf: ['Onest:wght@400;500;600;700;800'] },
    geschwungen: { name: 'Geschwungen', desc: 'Leicht und geschwungen, Zahlen in Onest', text: '"Quicksand", "Segoe UI", system-ui, -apple-system, sans-serif', num: '"Onest", "Segoe UI", system-ui, -apple-system, sans-serif', gf: ['Quicksand:wght@400;500;600;700', 'Onest:wght@400;500;600;700;800'] },
    rund: { name: 'Rund', desc: 'Weiche, runde Formen', text: '"Nunito", "Segoe UI", system-ui, sans-serif', gf: ['Nunito:wght@400;500;600;700;800'] },
    system: { name: 'System', desc: 'Die Schrift deines Geräts', text: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', num: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', gf: [] },
  };
  /* Unbekannte Werte, auch das frühere „standard“, landen beim Standard */
  const fontKey = k => FONTS[k] ? k : k === 'klassisch' ? 'system' : DEFAULT_FONT; /* „klassisch“ (Inter) heißt jetzt „system“ */
  function loadFont(key) { const f = FONTS[key]; if (!f || typeof document === 'undefined') return; for (const fam of f.gf) { const id = 'font-' + fam.replace(/[^a-z]/gi, '').toLowerCase(); if (document.getElementById(id)) continue; const l = document.createElement('link'); l.id = id; l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=' + fam + '&display=swap'; document.head.appendChild(l); } }
  const PRESETS_ACCENT = [['Elfenbein', '#ede6da'], ['Neongrün', '#34f58a'], ['Violett', '#7b61ff'], ['Blau', '#3b82f6'], ['Türkis', '#22d3ee'], ['Orange', '#f97316'], ['Pink', '#ec4899'], ['Gelb', '#facc15']];
  const PRESETS_PAIR = [['Grün / Rot', '#1fae7c', '#ef4444'], ['Blau / Orange', '#3b82f6', '#f97316'], ['Türkis / Pink', '#22d3ee', '#ec4899'], ['Violett / Gelb', '#8b7cf6', '#facc15'], ['Grün / Grau', '#4cb782', '#9aa3a0'], ['Weiß / Rot', '#f5f5f5', '#eb5757'], ['Neon', '#34f58a', '#ff5c5c']];
  const hex2rgb = h => { const s = h.replace('#', ''); const v = s.length === 3 ? s.split('').map(c => c + c).join('') : s; const n = parseInt(v, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const rgb2hex = ([r, g, b]) => '#' + [r, g, b].map(v => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('');
  const lum = h => { const [r, g, b] = hex2rgb(h).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const shade = (h, f) => { const c = hex2rgb(h); return rgb2hex(c.map(v => f < 0 ? v * (1 + f) : v + (255 - v) * f)); };
  const rgba = (h, a) => { const [r, g, b] = hex2rgb(h); return `rgba(${r}, ${g}, ${b}, ${a})`; };
  const valid = h => typeof h === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(h);
  /* helles Design: eigene Farben in 8-%-Schritten abdunkeln, bis Zahlen auf dem hellen Grund mindestens 4,5:1 erreichen (Luminanz ≤ 0,175) */
  const forLight = h => { const c = hex2rgb(h); if (Math.max(...c) - Math.min(...c) < 40 && lum(h) > 0.5) return '#1c1a17'; /* helle, fast farblose Töne (Elfenbein, Weiß): im hellen Design Grafit statt mattem Graubraun */ let x = h; let i = 0; while (lum(x) > 0.175 && i++ < 24) x = shade(x, -0.08); return x; }; /* 0,175: 4,5 : 1 auch auf dem fast weißen Grund (#fcfcfb) */
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  /* Schrift auf einer Farbfläche: Weiß oder Fast-Schwarz, je nachdem, was mehr Kontrast hat */
  const inkFor = h => ratio(h, '#fcfcfb') >= ratio(h, '#04140a') ? '#fcfcfb' : '#04140a'; /* fast Weiß statt reinem Weiß */
  /* Flächen aus einer Grundfarbe: dunkle Grundfarbe → hellere Stufen für Karten und Ränder; helle → Karten fast weiß, Ränder dunkler.
     Die Stufen folgen den festen Designs (Graphit bzw. Weiß), nur im Farbton der Grundfarbe. */
  const SURFACE_KEYS = ['--bg', '--bg-2', '--surface', '--surface-2', '--surface-3', '--border', '--border-2', '--field', '--ambient'];
  const isLightBase = h => lum(h) > 0.32;
  function surfaces(base) {
    const b = base.toLowerCase();
    if (isLightBase(b)) return { '--bg': b, '--bg-2': shade(b, -0.03), '--surface': shade(b, 0.72), '--surface-2': shade(b, 0.38), '--surface-3': shade(b, -0.04), '--border': shade(b, -0.07), '--border-2': shade(b, -0.15), '--field': shade(b, 0.72), '--ambient': 'none' };
    return { '--bg': b, '--bg-2': shade(b, 0.025), '--surface': shade(b, 0.05), '--surface-2': shade(b, 0.085), '--surface-3': shade(b, 0.12), '--border': shade(b, 0.07), '--border-2': shade(b, 0.13), '--field': shade(b, 0.015), '--ambient': 'none' };
  }
  /* Erscheinungsbild auflösen: „system“ folgt der Systemeinstellung (hell/dunkel), sonst die feste Wahl */
  function resolve(settings) { const t = (settings && settings.theme) || 'dark'; if (t !== 'system') return t === 'light' ? 'light' : 'dark'; try { return root.matchMedia && root.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'; } catch (e) { return 'dark'; } }
  function apply(settings) {
    const theme = resolve(settings); const light = theme === 'light'; const c = (settings && settings.colors) || {};
    const root = document.documentElement; root.dataset.theme = theme; root.dataset.themePref = (settings && settings.theme) || 'dark'; /* „system“: folgt der Einstellung des Geräts */ root.dataset.dark = settings && settings.darkStyle === 'schwarz' ? 'schwarz' : 'graphit'; root.dataset.mode = settings && settings.uiMode === 'simple' ? 'simple' : 'advanced'; /* Ansicht: Simple (weniger Text, größere Zahlen) oder Advanced (alles) */ /* dunkle Variante: warmes Graphit (Standard) oder Schwarz */
    const set = (k, v) => v ? root.style.setProperty(k, v) : root.style.removeProperty(k);
    /* eigenes Erscheinungsbild: Grund und Flächen aus einer Grundfarbe (hell oder dunkel je nach Helligkeit, siehe surfaces) */
    const cs = settings && settings.customLook && valid(settings.customBg) ? surfaces(settings.customBg) : null;
    if (cs) { root.dataset.dark = 'eigen'; }
    for (const k of SURFACE_KEYS) set(k, cs ? cs[k] : null);
    const acc = valid(c.accent) ? (light ? forLight(c.accent) : c.accent) : null;
    set('--accent', acc); set('--accent-2', acc && shade(acc, -0.14)); set('--accent-soft', acc && rgba(acc, light ? 0.10 : 0.13)); set('--accent-glow', acc && rgba(acc, 0.3)); set('--accent-ink', acc && inkFor(acc));
    const p = valid(c.profit) ? (light ? forLight(c.profit) : c.profit) : null; const l = valid(c.loss) ? (light ? forLight(c.loss) : c.loss) : null;
    set('--profit', p); set('--loss', l); set('--profit-ink', p); set('--loss-ink', l); /* eigene Farben: im hellen Design schon auf 4,5 : 1 abgedunkelt (forLight), gelten auch für kleine Schrift */ set('--loss-soft', l && rgba(l, light ? 0.10 : 0.14)); set('--profit-soft', p && rgba(p, light ? 0.10 : 0.12));
    const b = valid(c.be) ? (light ? forLight(c.be) : c.be) : null; set('--be', b); set('--be-soft', b && rgba(b, 0.16));
    const fk = fontKey(settings && settings.font); const f = FONTS[fk]; const own = fk !== DEFAULT_FONT; if (own) loadFont(fk); set('--font', own ? f.text : null); set('--font-display', own ? (f.display || f.text) : null); set('--font-num', own ? (f.num || f.text) : null); root.dataset.font = fk;
    const nb = (settings && settings.notebook) || {}; const px = v => v > 0 ? v + 'px' : null; set('--nb-h1', px(nb.h1)); set('--nb-h2', px(nb.h2)); set('--nb-h3', px(nb.h3)); set('--nb-body', px(nb.body)); root.classList.toggle('nb-nostrike', nb.strike === false);
  }
  function applyFromStorage(key) { try { const raw = localStorage.getItem(key || 'trading-journal-web-v1'); if (raw) apply(JSON.parse(raw).settings || {}); } catch (e) { /* ohne Speicher: Standardfarben */ } }
  root.Theme = { resolve, DEFAULTS, PRESETS_ACCENT, PRESETS_PAIR, FONTS, DEFAULT_FONT, fontKey, loadFont, apply, applyFromStorage, lum, shade, valid, surfaces, isLightBase, forLight, inkFor };
})(typeof self !== 'undefined' ? self : this);
