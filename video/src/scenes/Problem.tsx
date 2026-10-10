/* 0–6,5 s: das Problem. Weißer Grund, getippter Text, verstreute Notizen und Tabellen; am Ende Flug durch das „o“ von „loss“. */
import React, { useLayoutEffect, useRef, useState } from 'react';
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from 'remotion';
import { EXPO_IN, lerp, OUT, pop, prog, sec, SIG, zoomLerp } from '../anim';
import { DISPLAY, GREY, INK, NUM, big } from '../theme';
import { fontsReady } from '../fonts';
import { Typed, useMetrics } from '../ui/Text';

const RED = '#e03e3e';
const card: React.CSSProperties = { position: 'absolute', background: '#fff', borderRadius: 18, padding: '18px 20px', fontFamily: DISPLAY, color: INK, boxShadow: '0 26px 54px -20px rgba(8,40,22,0.30), 0 0 0 1px rgba(8,40,22,0.06)' };
const small: React.CSSProperties = { fontSize: 14, color: GREY, fontWeight: 500 };

const Candles: React.FC = () => {
  const c = [[40, 22, 30, 18], [34, 18, 40, 28], [44, 30, 52, 40], [50, 38, 60, 46], [56, 44, 66, 52], [60, 50, 58, 46], [62, 54, 74, 64], [72, 62, 84, 74], [80, 70, 92, 82], [88, 78, 98, 90]];
  return (
    <svg width="340" height="110" viewBox="0 0 340 110">
      {c.map(([o, l, h, cl], i) => { const up = i === 1 || i === 5; const x = 14 + i * 32; return (
        <g key={i}><line x1={x} x2={x} y1={l} y2={h + 8} stroke={up ? '#0fb862' : RED} strokeWidth="2" /><rect x={x - 7} y={Math.min(o, cl)} width="14" height={Math.max(4, Math.abs(cl - o))} rx="2" fill={up ? '#0fb862' : RED} /></g>
      ); })}
    </svg>
  );
};

type C = { x: number; y: number; w: number; rot: number; at: number; body: React.ReactNode };
const CARDS: C[] = [
  { x: 140, y: 130, w: 370, rot: -4, at: 1.65, body: (<>
    <div style={{ ...small, display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 14, height: 14, borderRadius: 3, background: '#1d7a46' }} />trades_final_v3.xlsx</div>
    <div style={{ marginTop: 12, fontFamily: NUM, fontSize: 16, display: 'grid', gridTemplateColumns: '70px 60px 1fr', rowGap: 8 }}>
      {[['09/22', 'NQ', '−$212.40', RED], ['09/23', 'ES', '+$88.00', '#0fb862'], ['09/24', 'NQ', '−$412.50', RED], ['09/24', 'NQ', '−$318.00', RED]].map(([d, s, v, c], i) => (
        <React.Fragment key={i}><span style={{ color: GREY }}>{d}</span><span style={{ fontWeight: 600 }}>{s}</span><span style={{ color: c, fontWeight: 600, textAlign: 'right' }}>{v}</span></React.Fragment>
      ))}
    </div></>) },
  { x: 1440, y: 170, w: 330, rot: 5, at: 1.75, body: (<>
    <div style={small}>Note to self</div>
    <div style={{ fontSize: 26, fontWeight: 700, marginTop: 6, letterSpacing: '-0.02em', lineHeight: 1.15 }}>No more <span style={{ textDecoration: `underline 3px ${RED}`, textUnderlineOffset: 6 }}>revenge</span> trades.</div></>) },
  { x: 200, y: 760, w: 380, rot: 3, at: 1.85, body: (<>
    <div style={{ ...small, display: 'flex', justifyContent: 'space-between' }}><span>NQ · 5m</span><span style={{ color: RED, fontWeight: 700 }}>−2.1%</span></div><Candles /></>) },
  { x: 1370, y: 730, w: 390, rot: -3, at: 1.95, body: (<>
    <div style={{ background: '#eef1ee', borderRadius: 16, padding: '12px 16px', fontSize: 21, fontWeight: 500 }}>Why did I even take that trade?</div>
    <div style={{ ...small, fontSize: 13, marginTop: 8, textAlign: 'right' }}>4:47 PM</div></>) },
  { x: 750, y: 70, w: 420, rot: -2, at: 3.95, body: (
    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}><span style={{ width: 14, height: 14, borderRadius: 7, background: RED, boxShadow: `0 0 0 6px ${RED}22` }} />
      <div><div style={{ fontSize: 21, fontWeight: 700 }}>Daily loss limit hit</div><div style={small}>Prop account 50K · just now</div></div></div>) },
  { x: 770, y: 880, w: 400, rot: 2, at: 4.05, body: (
    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}><span style={{ width: 40, height: 32, borderRadius: 6, background: 'linear-gradient(135deg,#dfe7e2,#c3cfc8)' }} /><div style={{ fontSize: 17, fontWeight: 500 }}>Screenshot 2026-09-30 at 16.41.png</div></div>) },
  { x: 30, y: 470, w: 290, rot: -6, at: 4.15, body: (<><div style={small}>Monday</div><div style={{ fontSize: 24, fontWeight: 700, marginTop: 4, letterSpacing: '-0.02em' }}>Moved my stop. Again.</div></>) },
  { x: 1600, y: 450, w: 290, rot: 6, at: 4.25, body: (<><div style={small}>This week</div><div style={{ fontFamily: NUM, fontSize: 40, fontWeight: 700, color: RED, marginTop: 4, letterSpacing: '-0.02em' }}>−$1,284.50</div></>) },
];

const Cards: React.FC<{ f: number }> = ({ f }) => (
  <>
    {CARDS.map((c, i) => {
      const s = pop(f, sec(c.at)); const a = prog(f, sec(c.at), sec(0.3), OUT);
      if (a <= 0) return null;
      const dx = Math.sin((f + i * 47) / 95) * 7, dy = Math.cos((f + i * 31) / 120) * 9;
      return <div key={i} style={{ ...card, left: c.x, top: c.y, width: c.w, opacity: a, transform: `translate(${dx}px, ${dy}px) rotate(${c.rot}deg) scale(${lerp(0.55, 1, s)})` }}>{c.body}</div>;
    })}
  </>
);

const SIZE = 116;
const line: React.CSSProperties = { position: 'absolute', left: 0, right: 0, top: 540 - SIZE * 0.55, textAlign: 'center', ...big(SIZE) };

/* Lage eines Zeichens in der zentrierten Zeile: relativ zur Zeile gemessen (beim ersten Rendern hat das Bild noch keine Breite),
   dann auf die Bildmitte umgerechnet */
const useCharBox = () => {
  const ref = useRef<HTMLSpanElement>(null); const [box, setBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [handle] = useState(() => delayRender('Zeichen messen'));
  useLayoutEffect(() => {
    let done = false;
    fontsReady.then(() => document.fonts.ready).then(() => {
      const el = ref.current; const span = el?.parentElement; const row = span?.parentElement;
      if (el && span && row) {
        const r = el.getBoundingClientRect(), s = span.getBoundingClientRect(), l = row.getBoundingClientRect(); const k = s.width / span.offsetWidth || 1;
        setBox({ x: 960 - span.offsetWidth / 2 + (r.left - s.left) / k, y: (line.top as number) + (r.top - l.top) / k, w: r.width / k, h: r.height / k });
      }
      if (!done) { done = true; continueRender(handle); }
    });
    return () => { if (!done) { done = true; continueRender(handle); } };
  }, [handle]);
  return [ref, box] as const;
};

export const Problem: React.FC = () => {
  const f = useCurrentFrame();
  /* Mitte des „o“ in „loss“: waagerecht aus dem Layout einer unsichtbaren Kopie der Zeile, senkrecht aus der Grundlinie
     und der Höhe des „o“ (Canvas-Maße derselben Schrift) */
  const LOSS = 'Same loss… again?';
  const mt = useMetrics(`700 ${SIZE}px Satoshi`, `${(-0.035 * SIZE).toFixed(2)}px`, ['o']);
  const [oRef, oBox] = useCharBox();
  /* A „Same mistake,“  B „Different day.“  C markiert und gelöscht  D an derselben Stelle weiter: „Same loss… again?“ */
  const A = sec(1.5), B = sec(3.0), D = sec(3.75), FLY = sec(5.65);
  /* Kamera: B zieht langsam auf, D fährt auf das „o“ zu und fliegt hindurch */
  let scale = 1, origin = '960px 540px';
  if (f >= A && f < D) scale = zoomLerp(1.12, 1, prog(f, A, sec(1.6), OUT));
  if (f >= D) {
    let ox = 960, oy = 540;
    if (mt && oBox) {
      const [o] = mt; const base = oBox.y + (oBox.h - (o.fAsc + o.fDesc)) / 2 + o.fAsc;
      ox = oBox.x + oBox.w / 2; oy = base - (o.asc - o.desc) / 2;
    }
    origin = `${ox}px ${oy}px`;
    scale = zoomLerp(1, 1.12, prog(f, D + sec(0.15), sec(1.5), SIG));
    if (f >= FLY) scale = zoomLerp(1.12, 180, prog(f, FLY, sec(0.75), EXPO_IN));
  }
  /* Auswahl über „Different day.“, dann gelöscht */
  const sel = prog(f, sec(3.05), sec(0.4), SIG);
  return (
    <AbsoluteFill style={{ background: '#fff', overflow: 'hidden' }}>
      {/* unsichtbare Messkopie der Zeile, ohne Kamera */}
      <div style={{ ...line, visibility: 'hidden' }}><Typed f={0} text={LOSS} start={1e9} caret={false} markIndex={6} markRef={oRef} /></div>
      <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: origin }}>
        {f >= A ? <Cards f={f} /> : null}
        {f < A ? <div style={line}><Typed f={f} text="Same mistake," start={sec(0.15)} /></div> : null}
        {f >= A && f < D ? (
          <div style={line}>
            <span style={{ position: 'relative', display: 'inline-block' }}>
              {f >= B ? <span style={{ position: 'absolute', left: -6, top: '0.06em', height: '1.02em', width: `calc(${sel * 100}% + 12px)`, background: 'rgba(52,245,138,0.38)', borderRadius: 6 }} /> : null}
              <Typed f={f} text="Different day." start={A + 3} />
            </span>
          </div>
        ) : null}
        {f >= D ? <div style={line}><Typed f={f} text={LOSS} start={D + sec(0.15)} cps={20} caret={f < FLY} /></div> : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
