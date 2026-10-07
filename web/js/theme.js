/* Farben: Akzent, Gewinn und Verlust frei wählbar; gilt für App und Startseite */
(function (root) {
  'use strict';
  const DEFAULTS = { dark: { accent: '#34f58a', profit: '#34f58a', loss: '#ff5c5c', be: '#8b7cf6' }, light: { accent: '#0fb862', profit: '#0fb862', loss: '#e03e3e', be: '#6b5bd6' } };
  /* Schriftarten: „modern“ ist der Standard (Satoshi von Fontshare, Zahlen in Onest; beide geometrisch, gleiche Proportionen), „geschwungen“ die frühere
     Standardschrift (Quicksand, Zahlen in Onest), „klassisch“ SF Pro / Inter mit Roboto-Zahlen, „rund“ eine Schrift für Text und Zahlen.
     Satoshi steht unter der ITF Free Font License: Laden über die Fontshare-API (app.html), Schriftdateien liegen nicht im Repository */
  const DEFAULT_FONT = 'modern';
  const FONTS = {
    modern: { name: 'Modern', desc: 'Standard: klar und modern, Zahlen in Onest', text: '"Satoshi", "Onest", "Segoe UI", system-ui, -apple-system, sans-serif', num: '"Onest", "Segoe UI", system-ui, -apple-system, sans-serif', gf: ['Onest:wght@400;500;600;700'] },
    geschwungen: { name: 'Geschwungen', desc: 'Leicht und geschwungen, Zahlen in Onest', text: '"Quicksand", "Segoe UI", system-ui, -apple-system, sans-serif', num: '"Onest", "Segoe UI", system-ui, -apple-system, sans-serif', gf: ['Quicksand:wght@400;500;600;700', 'Onest:wght@400;500;600;700'] },
    rund: { name: 'Rund', desc: 'Weiche, runde Formen', text: '"Nunito", "Segoe UI", system-ui, sans-serif', gf: ['Nunito:wght@400;500;600;700;800'] },
    klassisch: { name: 'Klassisch', desc: 'Klar und neutral, Zahlen in Roboto', text: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", "Segoe UI", system-ui, sans-serif', display: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", "Segoe UI", system-ui, sans-serif', num: '"Roboto", "Segoe UI", system-ui, -apple-system, sans-serif', gf: ['Inter:wght@400;500;600;700;800', 'Roboto:wght@400;500;700'] },
  };
  /* Unbekannte Werte, auch das frühere „standard“, landen beim Standard */
  const fontKey = k => FONTS[k] ? k : DEFAULT_FONT;
  function loadFont(key) { const f = FONTS[key]; if (!f || typeof document === 'undefined') return; for (const fam of f.gf) { const id = 'font-' + fam.replace(/[^a-z]/gi, '').toLowerCase(); if (document.getElementById(id)) continue; const l = document.createElement('link'); l.id = id; l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=' + fam + '&display=swap'; document.head.appendChild(l); } }
  const PRESETS_ACCENT = [['Neongrün', '#34f58a'], ['Violett', '#7b61ff'], ['Blau', '#3b82f6'], ['Türkis', '#22d3ee'], ['Orange', '#f97316'], ['Pink', '#ec4899'], ['Gelb', '#facc15'], ['Weiß', '#e5e7eb']];
  const PRESETS_PAIR = [['Grün / Rot', '#34f58a', '#ff5c5c'], ['Blau / Orange', '#3b82f6', '#f97316'], ['Türkis / Pink', '#22d3ee', '#ec4899'], ['Violett / Gelb', '#8b7cf6', '#facc15'], ['Grün / Grau', '#34f58a', '#9aa3a0'], ['Weiß / Rot', '#f2f5f3', '#ff5c5c']];
  const hex2rgb = h => { const s = h.replace('#', ''); const v = s.length === 3 ? s.split('').map(c => c + c).join('') : s; const n = parseInt(v, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const rgb2hex = ([r, g, b]) => '#' + [r, g, b].map(v => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('');
  const lum = h => { const [r, g, b] = hex2rgb(h).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const shade = (h, f) => { const c = hex2rgb(h); return rgb2hex(c.map(v => f < 0 ? v * (1 + f) : v + (255 - v) * f)); };
  const rgba = (h, a) => { const [r, g, b] = hex2rgb(h); return `rgba(${r}, ${g}, ${b}, ${a})`; };
  const valid = h => typeof h === 'string' && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(h);
  const forLight = h => { let x = h; let i = 0; while (lum(x) > 0.3 && i++ < 8) x = shade(x, -0.15); return x; };
  function apply(settings) {
    const theme = (settings && settings.theme) || 'dark'; const light = theme === 'light'; const c = (settings && settings.colors) || {};
    const root = document.documentElement; root.dataset.theme = theme; root.dataset.dark = settings && settings.darkStyle === 'schwarz' ? 'schwarz' : 'graphit'; /* dunkle Variante: warmes Graphit (Standard) oder Schwarz */
    const set = (k, v) => v ? root.style.setProperty(k, v) : root.style.removeProperty(k);
    const acc = valid(c.accent) ? (light ? forLight(c.accent) : c.accent) : null;
    set('--accent', acc); set('--accent-2', acc && shade(acc, -0.14)); set('--accent-soft', acc && rgba(acc, 0.13)); set('--accent-glow', acc && rgba(acc, 0.3)); set('--accent-ink', acc && (lum(acc) > 0.4 ? '#04140a' : '#ffffff'));
    const p = valid(c.profit) ? (light ? forLight(c.profit) : c.profit) : null; const l = valid(c.loss) ? (light ? forLight(c.loss) : c.loss) : null;
    set('--profit', p); set('--loss', l); set('--loss-soft', l && rgba(l, 0.14));
    const b = valid(c.be) ? (light ? forLight(c.be) : c.be) : null; set('--be', b); set('--be-soft', b && rgba(b, 0.16));
    const fk = fontKey(settings && settings.font); const f = FONTS[fk]; const own = fk !== DEFAULT_FONT; if (own) loadFont(fk); set('--font', own ? f.text : null); set('--font-display', own ? (f.display || f.text) : null); set('--font-num', own ? (f.num || f.text) : null); root.dataset.font = fk;
    const nb = (settings && settings.notebook) || {}; const px = v => v > 0 ? v + 'px' : null; set('--nb-h1', px(nb.h1)); set('--nb-h2', px(nb.h2)); set('--nb-h3', px(nb.h3)); set('--nb-body', px(nb.body)); root.classList.toggle('nb-nostrike', nb.strike === false);
  }
  function applyFromStorage(key) { try { const raw = localStorage.getItem(key || 'trading-journal-web-v1'); if (raw) apply(JSON.parse(raw).settings || {}); } catch (e) { /* ohne Speicher: Standardfarben */ } }
  root.Theme = { DEFAULTS, PRESETS_ACCENT, PRESETS_PAIR, FONTS, DEFAULT_FONT, fontKey, loadFont, apply, applyFromStorage, lum, shade, valid };
})(typeof self !== 'undefined' ? self : this);
