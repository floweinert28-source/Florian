/* Text-Animationen im Stil des Vorbilds: Schreibmaschine mit Cursor, Buchstaben oder Wörter, die aus der Unschärfe kommen. */
import React, { useLayoutEffect, useRef, useState } from 'react';
import { continueRender, delayRender } from 'remotion';
import { clamp01, FPS, lerp, prog, sec, SOFT } from '../anim';
import { fontsReady } from '../fonts';
import { GREEN } from '../theme';

/* Lage eines Elements relativ zum nächsten Vorfahren mit data-root, gemessen nach dem Laden der Schriften (Kamera-Skalierung zählt nicht mit) */
export type Box = { x: number; y: number; w: number; h: number };
export const useBox = <T extends HTMLElement>(): [React.RefObject<T | null>, Box | null] => {
  const ref = useRef<T>(null); const [box, setBox] = useState<Box | null>(null);
  const [handle] = useState(() => delayRender('Text messen'));
  useLayoutEffect(() => {
    let done = false;
    fontsReady.then(() => document.fonts.ready).then(() => {
      const el = ref.current;
      if (el) {
        let x = 0, y = 0, e: HTMLElement | null = el;
        while (e && !e.dataset.root) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent as HTMLElement | null; }
        setBox({ x, y, w: el.offsetWidth, h: el.offsetHeight });
      }
      if (!done) { done = true; continueRender(handle); }
    });
    return () => { if (!done) { done = true; continueRender(handle); } };
  }, [handle]);
  return [ref, box];
};

/* Maße von Text mit Canvas (nach dem Laden der Schriften): Breite und Ober-/Unterlänge, für Ziele wie das „o“ beim Durchflug */
export type Metrics = { w: number; asc: number; desc: number; fAsc: number; fDesc: number };
export const useMetrics = (font: string, letterSpacing: string, texts: string[]): Metrics[] | null => {
  const [m, setM] = useState<Metrics[] | null>(null);
  const [handle] = useState(() => delayRender('Text messen'));
  useLayoutEffect(() => {
    let done = false;
    fontsReady.then(() => document.fonts.ready).then(() => {
      const ctx = document.createElement('canvas').getContext('2d')!; ctx.font = font;
      (ctx as unknown as { letterSpacing: string }).letterSpacing = letterSpacing;
      setM(texts.map((t) => { const r = ctx.measureText(t); return { w: r.width, asc: r.actualBoundingBoxAscent, desc: r.actualBoundingBoxDescent, fAsc: r.fontBoundingBoxAscent, fDesc: r.fontBoundingBoxDescent }; }));
      if (!done) { done = true; continueRender(handle); }
    });
    return () => { if (!done) { done = true; continueRender(handle); } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle]);
  return m;
};

/* Textcursor: blinkt im Ruhezustand, steht still beim Tippen */
export const Caret: React.FC<{ f: number; typing: boolean; color?: string; height?: string; hidden?: boolean }> = ({ f, typing, color = GREEN, height = '0.92em', hidden }) => {
  const on = !hidden && (typing || Math.floor(f / (FPS / 2)) % 2 === 0);
  return (
    <span style={{ position: 'relative', display: 'inline-block', width: 0, height: '1em' }}>
      <span style={{ position: 'absolute', left: '0.03em', top: '0.1em', width: '0.065em', height, borderRadius: 2, background: color, opacity: on ? 1 : 0 }} />
    </span>
  );
};

/* Schreibmaschine: Zeichen erscheinen nacheinander, der Rest hält schon den Platz (zentrierter Text springt nicht).
   caret={false} blendet den Cursor nur aus; er bleibt im Layout, sonst springt die Zeile in der Höhe. */
export const Typed: React.FC<{
  f: number; text: string; start: number; cps?: number; style?: React.CSSProperties; caret?: boolean; caretColor?: string;
  markIndex?: number; markRef?: React.Ref<HTMLSpanElement>; clearAt?: number;
}> = ({ f, text, start, cps = 18, style, caret = true, caretColor, markIndex, markRef, clearAt }) => {
  const step = FPS / cps; const chars = [...text];
  const n = f < start ? 0 : Math.min(chars.length, Math.floor((f - start) / step) + 1);
  const cleared = clearAt != null && f >= clearAt;
  const shown = cleared ? 0 : n; const typing = f >= start && n < chars.length && !cleared;
  return (
    <span style={{ position: 'relative', display: 'inline-block', ...style }}>
      {chars.map((c, i) => (
        <React.Fragment key={i}>
          {i === shown ? <Caret f={f} typing={typing} color={caretColor} hidden={!caret} /> : null}
          <span ref={i === markIndex ? markRef : undefined} style={{ opacity: i < shown ? 1 : 0 }}>{c}</span>
        </React.Fragment>
      ))}
      {shown === chars.length ? <Caret f={f} typing={false} color={caretColor} hidden={!caret} /> : null}
    </span>
  );
};

/* Buchstaben oder Wörter kommen aus der Unschärfe, einer nach dem anderen.
   color: feste Farbe oder je Einheit (z. B. Verlauf über ein Wort). */
export const BlurText: React.FC<{
  f: number; text: string; start: number; by?: 'letter' | 'word'; stagger?: number; dur?: number; blur?: number; rise?: number; scaleFrom?: number;
  style?: React.CSSProperties; color?: string | ((i: number, n: number) => string); unitStyle?: (i: number) => React.CSSProperties | undefined;
}> = ({ f, text, start, by = 'word', stagger = 0.06, dur = 0.7, blur = 22, rise = 0, scaleFrom = 1, style, color, unitStyle }) => {
  const units = by === 'letter' ? [...text] : text.split(/(\s+)/);
  const real = units.filter((u) => u.trim() !== ''); let k = -1;
  return (
    <span style={style}>
      {units.map((u, i) => {
        if (u.trim() === '') return <span key={i}>{u}</span>;
        k++; const t = prog(f, start + sec(stagger) * k, sec(dur), SOFT); const a = clamp01(t * 1.4);
        const c = typeof color === 'function' ? color(k, real.length) : color;
        return (
          <span key={i} style={{
            display: 'inline-block', opacity: a, filter: t < 1 ? `blur(${lerp(blur, 0, t).toFixed(2)}px)` : undefined,
            transform: `translateY(${lerp(rise, 0, t).toFixed(2)}px) scale(${lerp(scaleFrom, 1, t).toFixed(4)})`, color: c, ...(unitStyle ? unitStyle(k) : null),
          }}>{u}</span>
        );
      })}
    </span>
  );
};

/* Farbverlauf über die Buchstaben eines Wortes (je Buchstabe eine Farbe zwischen a und b) */
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const ramp = (a: string, b: string) => (i: number, n: number) => {
  const t = n <= 1 ? 0 : i / (n - 1); const A = hex(a), B = hex(b);
  return `rgb(${A.map((v, j) => Math.round(lerp(v, B[j], t))).join(',')})`;
};
