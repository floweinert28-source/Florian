/* Farben: Akzent, Gewinn und Verlust frei wählbar; gilt für App und Startseite. Factory-Palette: Akzent neutral (Bone), Chroma nur für Daten. */
(function (root) {
  'use strict';
  const DEFAULTS = { dark: { accent: '#eeeeee', profit: '#a0ca92', loss: '#ee6018', be: '#8a8380' }, light: { accent: '#101010', profit: '#586d51', loss: '#a04415', be: '#3d3a39' } };
  /* Schriftarten: nur Geist (400/500) und Geist Mono (400); keine Gewichte ≥ 600 laden */
  const FONTS = {
    standard: { name: 'Geist', desc: 'Factory-Standard, Zahlen tabular', text: '"Geist", ui-sans-serif, system-ui, sans-serif', num: '"Geist", ui-sans-serif, system-ui, sans-serif', gf: ['Geist:wght@400;500', 'Geist+Mono:wght@400'] },
    mono: { name: 'Geist Mono', desc: 'Alles in der Instrumenten-Stimme', text: '"Geist Mono", ui-monospace, monospace', gf: ['Geist+Mono:wght@400'] },
  };
  /* Familie bereits per Google-Fonts-Stylesheet geladen? (app.html/index.html bringen Geist + Geist Mono mit; verhindert doppelte Requests je Start) */
  const fontLoaded = fam => { const name = fam.split(':')[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); const re = new RegExp('[?&]family=' + name + '(?=[:&]|$)'); return [...document.querySelectorAll('link[rel="stylesheet"][href*="fonts.googleapis"]')].some(l => re.test(l.getAttribute('href') || '')); };
  function loadFont(key) { const f = FONTS[key]; if (!f || typeof document === 'undefined') return; for (const fam of f.gf) { const id = 'font-' + fam.replace(/[^a-z]/gi, '').toLowerCase(); if (document.getElementById(id) || fontLoaded(fam)) continue; const l = document.createElement('link'); l.id = id; l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=' + fam + '&display=swap'; document.head.appendChild(l); } }
  /* Akzent-Presets nur neutral (Reference-Lock 4: Orange/Grün nie als Button-Fläche); die Datenfarben bleiben in PRESETS_PAIR */
  const PRESETS_ACCENT = [['Bone', '#eeeeee'], ['Chalk', '#fafafa'], ['Pale Stone', '#b8b3b0'], ['Warm Granite', '#8a8380']];
  const PRESETS_PAIR = [['Grün / Orange', '#a0ca92', '#ee6018'], ['Bone / Orange', '#eeeeee', '#ee6018'], ['Grün / Graphite', '#a0ca92', '#4d4947']];
  /* Alt-Farben vor der Factory-Umstellung: werden ignoriert (und in store.js migriert), damit kein Neongrün bei Bestandsnutzern zurückkehrt */
  const LEGACY = new Set(['#34f58a', '#1fd873', '#ff5c5c', '#8b7cf6', '#0fb862', '#0a9a52', '#e03e3e', '#6b5bd6', '#7b61ff', '#3b82f6', '#22d3ee', '#f97316', '#ec4899', '#facc15', '#9aa3a0', '#f2f5f3', '#e5e7eb']);
  const hex2rgb = h => { const s = h.replace('#', ''); const v = s.length === 3 ? s.split('').map(c => c + c).join('') : s; const n = parseInt(v, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const rgb2hex = ([r, g, b]) => '#' + [r, g, b].map(v => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('');
  const lum = h => { const [r, g, b] = hex2rgb(h).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const shade = (h, f) => { const c = hex2rgb(h); return rgb2hex(c.map(v => f < 0 ? v * (1 + f) : v + (255 - v) * f)); };
  const rgba = (h, a) => { const [r, g, b] = hex2rgb(h); return `rgba(${r}, ${g}, ${b}, ${a})`; };
  const valid = h => typeof h === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(h);
  const pick = h => valid(h) && !LEGACY.has(h.toLowerCase()) ? h : null;
  /* HSV-Sättigung 0..1: > 0.25 gilt als chromatisch (Signal Orange 0.90, Metric Green 0.28, alle Factory-Neutralen 0.00-0.07) */
  const chroma = h => { const c = hex2rgb(h); const mx = Math.max(...c), mn = Math.min(...c); return mx ? (mx - mn) / mx : 0; };
  /* WCAG-Kontrast zweier Hex-Farben */
  const contrast = (a, b) => { const la = lum(a), lb = lum(b); return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05); };
  /* Tinte: Farbe schrittweise abdunkeln, bis sie auf hellem Grund als Text ≥ 4.5:1 erreicht (Light-Modus, Zertifikat, Bildkarte) */
  const ink = (h, bg = '#eeeeee') => { let x = h; let i = 0; while (contrast(x, bg) < 4.5 && i++ < 14) x = shade(x, -0.08); return x; };
  function apply(settings) {
    const theme = (settings && settings.theme) || 'dark'; const light = theme === 'light'; const c = (settings && settings.colors) || {};
    const root = document.documentElement; root.dataset.theme = theme;
    const set = (k, v) => v ? root.style.setProperty(k, v) : root.style.removeProperty(k);
    const acc = pick(c.accent);
    /* --accent trägt Fokus, Häkchen und gewählte Zustände. Die Fläche des Primärbuttons (--accent-2) folgt nur einem neutralen Akzent;
       ein chromatischer Akzent (frei gewählt oder aus Altbeständen) wird dort auf Chalk bzw. Carbon Lift festgenagelt, damit Orange/Grün nie Button-Fläche wird (Lock 4) */
    const chromatic = !!acc && chroma(acc) > 0.25;
    set('--accent', acc); set('--accent-2', acc && (chromatic ? (light ? '#1d1a18' : '#fafafa') : shade(acc, lum(acc) > 0.5 ? 0.05 : -0.1))); set('--accent-soft', acc && rgba(acc, 0.08)); set('--accent-glow', acc && 'transparent'); set('--accent-ink', acc && (chromatic ? (light ? '#fafafa' : '#101010') : (lum(acc) > 0.4 ? '#101010' : '#eeeeee')));
    const p = pick(c.profit), l = pick(c.loss);
    set('--profit', p); set('--profit-ink', p && (light ? ink(p) : p)); set('--profit-soft', p && rgba(p, 0.12));
    set('--loss', l); set('--loss-ink', l && (light ? ink(l) : l)); set('--loss-soft', l && rgba(l, 0.12));
    const b = pick(c.be); set('--be', b && (light ? ink(b) : b)); set('--be-soft', b && rgba(b, 0.14));
    const fk = FONTS[settings && settings.font] ? settings.font : 'standard'; const f = FONTS[fk]; loadFont(fk); set('--font', fk === 'standard' ? null : f.text); set('--font-display', fk === 'standard' ? null : f.text); set('--font-num', fk === 'standard' ? null : f.text); root.dataset.font = fk;
    const nb = (settings && settings.notebook) || {}; const px = v => v > 0 ? v + 'px' : null; set('--nb-h1', px(nb.h1)); set('--nb-h2', px(nb.h2)); set('--nb-h3', px(nb.h3)); set('--nb-body', px(nb.body)); root.classList.toggle('nb-nostrike', nb.strike === false);
    /* Browser-Chrome folgt dem Canvas: Obsidian #101010 bzw. Light-Canvas Bone #eeeeee */
    try { for (const m of document.querySelectorAll('meta[name="theme-color"]')) m.setAttribute('content', light ? '#eeeeee' : '#101010'); } catch (e) { /* kein DOM */ }
  }
  function applyFromStorage(key) { try { const raw = localStorage.getItem(key || 'trading-journal-web-v1'); if (raw) apply(JSON.parse(raw).settings || {}); } catch (e) { /* ohne Speicher: Standardfarben */ } }
  root.Theme = { DEFAULTS, PRESETS_ACCENT, PRESETS_PAIR, FONTS, LEGACY, loadFont, apply, applyFromStorage, lum, shade, valid, ink, contrast, chroma };
})(typeof self !== 'undefined' ? self : this);
