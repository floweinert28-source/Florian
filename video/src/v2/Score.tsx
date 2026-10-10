/* Vorlage LangEase, Abschnitt 3 (10,3–18,3 s): Fortschrittsbalken → Kreis mit Häkchen und Konfetti → Karte → TradeLog.
   Der Balken „Discipline score“ läuft voll, die drei Regeln leuchten nacheinander auf. Dann zieht er sich zum Kreis zusammen,
   das Häkchen zeichnet sich, „Plan followed.“, Konfetti. Der Kreis wird zur Karte des ES-Trades, die anderen Trades
   gleiten von rechts dazu, die Kamera fährt zurück und kippt: das TradeLog als Kartenansicht. Die Hand zeigt auf den ES-Trade,
   die Kamera fährt auf diese Karte; der Rest verschwimmt. */
import React from 'react';
import { evolvePath } from '@remotion/paths';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { clamp01, FPS, IN, lerp, OUT, pop, prog, sec, SIG, SOFT, zoomLerp } from '../anim';
import { rows, rules, shadow } from '../app';
import { useFormat } from '../format';
import { NAV, tone } from '../scenes/Product';
import { big, DISPLAY, GREEN, LIGHT, NUM } from '../theme';
import { Bg } from '../ui/Bg';
import { Confetti } from '../ui/Confetti';
import { Hand } from '../ui/Hand';
import { A, Badge, Btn, Icon, lerpColor, mix, mixA, Pill, Val } from '../ui/Kit';
import { barLayout } from './Phones';

type R = { x: number; y: number; w: number; h: number };
const rl = (a: R, b: R, t: number): R => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t) });

/* ---------- Trade als Karte, 369 × 307 App-Pixel ---------- */
export const CARD = { w: 369, h: 307 };
type Row = (typeof rows)[number];
export const MiniCard: React.FC<{ r: Row; hover?: number }> = ({ r, hover = 0 }) => (
  <div style={{ position: 'absolute', left: 0, top: 0, width: CARD.w, height: CARD.h, boxSizing: 'border-box', padding: '20px 22px', borderRadius: 16, fontFamily: DISPLAY, color: A.text,
    background: hover > 0 ? lerpColor(A.surface, mix(A.accent, 0.07, A.surface), hover) : A.surface, border: `1px solid ${hover > 0 ? lerpColor(A.border, mix(A.accent, 0.6, A.surface), hover) : A.border}`,
    boxShadow: `0 30px 60px -30px rgba(0,0,0,0.7)${hover > 0 ? `, 0 0 ${(40 * hover).toFixed(1)}px ${mixA(A.accent, 0.22 * hover)}` : ''}` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 24, fontWeight: 700 }}>{r.symbol}</span><Badge dir={r.side} />
      <span style={{ marginLeft: 'auto' }}><Pill tone={r.status === 'Win' ? 'win' : r.status === 'Loss' ? 'loss' : 'open'}>{r.status}</Pill></span>
    </div>
    <div style={{ fontFamily: NUM, fontSize: 13, color: A.muted, marginTop: 10 }}>{r.day} · {r.time}{r.closed ? ` → ${r.closed}` : ''}</div>
    <div style={{ fontSize: 13, fontWeight: 600, color: A.text2, marginTop: 50 }}>Net P&L</div>
    <Val size={44} color={tone(r.pnl)} style={{ marginTop: 4 }}>{r.pnl}</Val>
    <div style={{ display: 'flex', gap: 6, marginTop: 26 }}>
      {r.r !== '—' ? <Pill tone={/^\+/.test(r.r) ? 'win' : 'loss'} num>{r.r}</Pill> : null}
      <Pill>{r.setup}</Pill>
      <Pill tone={Number(r.score) >= 100 ? 'win' : 'neutral'}>Discipline {r.score}</Pill>
    </div>
  </div>
);

/* ---------- Lage: App-Fläche, Kartenraster, Kamera ---------- */
type Cam = { s: number; x: number; y: number; rx: number; rz: number; ty: number };
export const shellLayout = (W: number, H: number, V: boolean) => {
  const SH = V ? { w: 760, h: 1180 } : { w: 1440, h: 900 };
  const G = V ? { cols: 2, w: 342, x0: 28, y0: 150, gap: 20 } : { cols: 3, w: CARD.w, x0: 252, y0: 146, gap: 24 };
  const k = G.w / CARD.w, ch = CARD.h * k;
  const slot = (i: number) => ({ x: G.x0 + (i % G.cols) * (G.w + G.gap), y: G.y0 + Math.floor(i / G.cols) * (ch + G.gap), w: G.w, h: ch });
  const rowW = G.cols * G.w + (G.cols - 1) * G.gap;
  const cam0: Cam = { s: (W * 0.9) / rowW, x: G.x0 + rowW / 2, y: G.y0 + ch / 2, rx: 0, rz: 0, ty: 0 };
  const cam1: Cam = V ? { s: 1.18, x: SH.w / 2, y: 600, rx: 14, rz: -4, ty: 30 } : { s: 1.0, x: 720, y: 450, rx: 16, rz: -5, ty: 30 };
  const finalW = V ? 700 : 580; const es = slot(0);
  const cam2: Cam = { s: finalW / G.w, x: es.x + es.w / 2, y: es.y + es.h / 2, rx: 0, rz: 0, ty: 0 };
  return { SH, G, k, ch, slot, cam0, cam1, cam2, finalW };
};
const camLerp = (a: Cam, b: Cam, t: number): Cam => ({ s: zoomLerp(a.s, b.s, t), x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), rx: lerp(a.rx, b.rx, t), rz: lerp(a.rz, b.rz, t), ty: lerp(a.ty, b.ty, t) });
const P = 2600;
const camCss = (c: Cam, cx: number, cy: number) => `translate(${cx}px, ${cy + c.ty}px) rotateX(${c.rx}deg) rotateZ(${c.rz}deg) scale(${c.s}) translate(${-c.x}px, ${-c.y}px)`;
/* Punkt der App-Fläche auf den Bildschirm (gleiche Rechnung wie CSS mit Perspektive um die Bildmitte) */
const project = (ax: number, ay: number, c: Cam, W: number, H: number) => {
  const x = (ax - c.x) * c.s, y = (ay - c.y) * c.s; const rz = (c.rz * Math.PI) / 180, rx = (c.rx * Math.PI) / 180;
  const x1 = x * Math.cos(rz) - y * Math.sin(rz), y1 = x * Math.sin(rz) + y * Math.cos(rz);
  const X = W / 2 + x1, Y = H / 2 + c.ty + y1 * Math.cos(rx), Z = y1 * Math.sin(rx); const k = P / (P - Z);
  return { x: W / 2 + (X - W / 2) * k, y: H / 2 + (Y - H / 2) * k };
};

/* App-Rahmen um das Kartenraster */
const Shell: React.FC<{ V: boolean; SH: { w: number; h: number } }> = ({ V, SH }) => (
  <div style={{ position: 'absolute', left: 0, top: 0, width: SH.w, height: SH.h, fontFamily: DISPLAY, color: A.text }}>
    <div style={{ position: 'absolute', inset: 0, borderRadius: 18, background: `radial-gradient(1100px 640px at 14% -10%, rgba(255,238,218,.045), transparent 62%), ${A.bg}`, border: `1px solid ${A.border2}`, boxShadow: '0 60px 160px -40px rgba(52,245,138,0.22), 0 90px 140px -50px rgba(0,0,0,0.7)' }} />
    {V ? (
      <>
        <div style={{ position: 'absolute', left: 28, top: 30, fontSize: 28, fontWeight: 600 }}>TradeLog</div>
        <div style={{ position: 'absolute', left: 156, top: 41, fontSize: 14, color: A.muted }}>{shadow.actualTrades}</div>
        <div style={{ position: 'absolute', right: 28, top: 28, width: 38, height: 38, borderRadius: 19, background: A.accent, color: A.ink, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 15, boxShadow: `0 0 14px ${A.accentGlow}` }}>T</div>
        <div style={{ position: 'absolute', left: 28, top: 88, display: 'flex', gap: 10 }}>
          <Btn><Icon name="calendar" size={16} color={A.text2} />September 2026</Btn>
          <div style={{ display: 'flex', borderRadius: 12, border: `1px solid ${A.border2}`, overflow: 'hidden' }}>
            <div style={{ width: 44, height: 40, display: 'grid', placeItems: 'center', background: A.surface2 }}><Icon name="grid" size={17} color={A.accent} /></div>
            <div style={{ width: 44, height: 40, display: 'grid', placeItems: 'center' }}><Icon name="list" size={17} color={A.muted} /></div>
          </div>
        </div>
        <Btn kind="accent" style={{ position: 'absolute', right: 28, top: 88, height: 40 }}><Icon name="plus" size={16} color={A.accent} />Log trade</Btn>
      </>
    ) : (
      <>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 220, borderRight: `1px solid ${A.border}` }}>
          <div style={{ position: 'absolute', left: 26, top: 26, fontSize: 15, fontWeight: 800, letterSpacing: '0.08em' }}>JOURNALYST</div>
          <div style={{ position: 'absolute', left: 26, top: 46, fontSize: 11.5, color: A.muted }}>Trading Journal App</div>
          {NAV.filter(([ic]) => ic !== 'prop').map(([ic, label], i) => (
            <div key={ic} style={{ position: 'absolute', left: 14, top: 96 + i * 44, width: 192, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 14, boxSizing: 'border-box',
              background: ic === 'tradelog' ? A.surface : 'transparent', border: ic === 'tradelog' ? `1px solid ${A.border2}` : '1px solid transparent', color: ic === 'tradelog' ? A.text : A.text2, fontSize: 14, fontWeight: ic === 'tradelog' ? 600 : 500 }}>
              {ic === 'tradelog' ? <div style={{ position: 'absolute', left: -14, top: 8, bottom: 8, width: 3, borderRadius: 2, background: A.accent, boxShadow: `0 0 8px ${A.accentGlow}` }} /> : null}
              <Icon name={ic} size={18} color={ic === 'tradelog' ? A.text : A.muted} />{label}
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', left: 220, right: 0, top: 0, height: 64, borderBottom: `1px solid ${A.border}` }}>
          <div style={{ position: 'absolute', left: 32, top: 18, display: 'flex', alignItems: 'baseline', gap: 12 }}><span style={{ fontSize: 21, fontWeight: 600 }}>TradeLog</span><span style={{ fontSize: 13, color: A.muted }}>{shadow.actualTrades}</span></div>
          <div style={{ position: 'absolute', left: 420, top: 13, width: 360, height: 38, borderRadius: 11, background: A.field, border: `1px solid ${A.border2}`, display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', boxSizing: 'border-box', fontSize: 13.5, color: A.muted }}><Icon name="search" size={16} color={A.muted} />Search trades</div>
          <div style={{ position: 'absolute', right: 32, top: 14, width: 36, height: 36, borderRadius: 18, background: A.accent, color: A.ink, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 15, boxShadow: `0 0 14px ${A.accentGlow}` }}>T</div>
        </div>
        <div style={{ position: 'absolute', left: 252, top: 86, display: 'flex', gap: 10 }}>
          <Btn><Icon name="calendar" size={16} color={A.text2} />September 2026<Icon name="chev" size={14} color={A.muted} /></Btn>
          <Btn><Icon name="user" size={16} color={A.text2} />Main account<Icon name="chev" size={14} color={A.muted} /></Btn>
          <div style={{ display: 'flex', borderRadius: 12, border: `1px solid ${A.border2}`, overflow: 'hidden' }}>
            <div style={{ width: 44, height: 40, display: 'grid', placeItems: 'center', background: A.surface2 }}><Icon name="grid" size={17} color={A.accent} /></div>
            <div style={{ width: 44, height: 40, display: 'grid', placeItems: 'center' }}><Icon name="list" size={17} color={A.muted} /></div>
          </div>
        </div>
        <Btn kind="accent" style={{ position: 'absolute', left: 1276, top: 86, width: 132, height: 40 }}><Icon name="plus" size={16} color={A.accent} />Log trade</Btn>
      </>
    )}
  </div>
);

/* ---------- Zeitplan (Sekunden ab Beginn des Abschnitts) ---------- */
const T = { fill0: 0.3, fill1: 2.4, col0: 2.5, col1: 2.95, done: 2.95, textOut: 4.3, m0: 4.35, m1: 4.95, slide: 4.85, back0: 5.45, back1: 6.35, hand0: 6.15, hand1: 6.85, z0: 7.25, z1: 8.0 };
export const SCORE_DURATION = 8.0;
/* Der Balken übernimmt den Stand aus dem Handy (72) und läuft auf 100; die Regeln leuchten nacheinander auf */
const START = 0.72;
const fillAt = (f: number) => lerp(START, 1, prog(f, sec(T.fill0), sec(T.fill1 - T.fill0), (x: number) => 1 - Math.pow(1 - x, 1.6)));
const CHIP_AT = [0.75, 1.45, 2.3].map(sec);

export const Score: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS;
  const { W, H, V, cx, cy } = useFormat();
  const bar = barLayout(W, H, V);
  const { SH, G, k, slot, cam0, cam1, cam2 } = shellLayout(W, H, V);

  /* Balken */
  const p = fillAt(f);
  const labA = 1 - prog(f, sec(T.col0 - 0.05), sec(0.2), IN);
  const CIRC: R = { x: cx - 75, y: cy + 40 - 75, w: 150, h: 150 };
  const ck = prog(f, sec(T.col0), sec(T.col1 - T.col0), SIG);
  const doneP = pop(f, sec(T.done), { damping: 9, stiffness: 180 });
  const circleScale = t >= T.done ? 1 + 0.1 * Math.sin(Math.PI * clamp01((f - sec(T.done)) / sec(0.3))) : 1;
  const check = prog(f, sec(T.done + 0.05), sec(0.32), OUT);
  const txt = prog(f, sec(T.done + 0.1), sec(0.5), SOFT); const txtOut = prog(f, sec(T.textOut), sec(0.22), IN);

  /* Kamera */
  const k1 = prog(f, sec(T.back0), sec(T.back1 - T.back0), SIG), k2 = prog(f, sec(T.z0), sec(T.z1 - T.z0), SIG);
  const cam = k2 > 0 ? camLerp(cam1, cam2, k2) : camLerp(cam0, cam1, k1);
  const es = slot(0);
  const ES0: R = { x: cx + (es.x - cam0.x) * cam0.s, y: cy + (es.y - cam0.y) * cam0.s, w: es.w * cam0.s, h: es.h * cam0.s };
  const mk = prog(f, sec(T.m0), sec(T.m1 - T.m0), SIG);

  /* Die eine Fläche: Balken → Kreis → Karte */
  let box: R = { x: bar.x, y: bar.y, w: bar.w, h: bar.h };
  if (t >= T.col0) box = rl({ x: bar.x, y: bar.y, w: bar.w, h: bar.h }, CIRC, ck);
  if (t >= T.m0) box = rl(CIRC, ES0, mk);
  const radius = t >= T.m0 ? lerp(75, 16 * k * cam0.s, mk) : Math.min(box.w, box.h) / 2;
  const showBox = t < T.m1;
  const boxBg = t >= T.m0 ? lerpColor(A.accent, A.surface, clamp01(mk * 1.6)) : null;

  const shellA = prog(f, sec(T.back0), sec(0.5), OUT) * (1 - prog(f, sec(T.z1 - 0.5), sec(0.45), IN));
  const restBlur = k2 * 10;
  const hover = prog(f, sec(T.hand1), sec(0.25), OUT);
  const esCenter = { x: es.x + es.w / 2, y: es.y + es.h / 2 };
  const hTarget = project(esCenter.x + es.w * 0.12, esCenter.y + es.h * 0.12, cam, W, H);
  const hk = prog(f, sec(T.hand0), sec(T.hand1 - T.hand0), SIG); const from = V ? { x: W * 0.95, y: H * 1.02 } : { x: W * 0.92, y: H * 1.1 };
  const hand = { x: lerp(from.x, hTarget.x, hk) + Math.sin(hk * Math.PI) * 50, y: lerp(from.y, hTarget.y, hk) };
  const handA = prog(f, sec(T.hand0), sec(0.15)) * (1 - prog(f, sec(T.z0 - 0.05), sec(0.25)));

  const chipText = V ? 27 : 24;
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Bg f={f} kind="night" />

      {/* TradeLog als Kartenansicht */}
      {t >= T.slide ? (
        <AbsoluteFill style={{ perspective: P }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: SH.w, height: SH.h, transformOrigin: '0 0', transform: camCss(cam, cx, cy), filter: restBlur > 0.05 ? `blur(${restBlur.toFixed(2)}px)` : undefined }}>
            <div style={{ opacity: shellA }}><Shell V={V} SH={SH} /></div>
            {rows.slice(1).map((r, j) => {
              const i = j + 1; const s = slot(i); const firstRow = i < G.cols;
              const a = firstRow ? prog(f, sec(T.slide + j * 0.09), sec(0.55), SOFT) : prog(f, sec(T.back0 + 0.15 + (i - G.cols) * 0.07), sec(0.5), SOFT);
              const out = 1 - prog(f, sec(T.z1 - 0.5), sec(0.45), IN);
              return (
                <div key={i} style={{ position: 'absolute', left: s.x, top: s.y, width: CARD.w, height: CARD.h, transformOrigin: '0 0', opacity: clamp01(a * 1.5) * out,
                  transform: `translate(${firstRow ? lerp(700, 0, a) : 0}px, ${firstRow ? 0 : lerp(40, 0, a)}px) scale(${k})` }}><MiniCard r={r} /></div>
              );
            })}
          </div>
          {t >= T.m1 ? (
            <div style={{ position: 'absolute', left: 0, top: 0, width: SH.w, height: SH.h, transformOrigin: '0 0', transform: camCss(cam, cx, cy) }}>
              <div style={{ position: 'absolute', left: es.x, top: es.y, width: CARD.w, height: CARD.h, transformOrigin: '0 0', transform: `scale(${k})` }}>
                <div style={{ position: 'absolute', inset: 0, transformOrigin: '50% 50%', transform: `scale(${1 + 0.03 * hover * (1 - k2)})` }}><MiniCard r={rows[0]} hover={hover} /></div>
              </div>
            </div>
          ) : null}
        </AbsoluteFill>
      ) : null}

      {/* Beschriftung über dem Balken und die drei Regeln darunter */}
      {labA > 0 ? (
        <>
          <div style={{ position: 'absolute', left: bar.x, top: bar.y - (V ? 82 : 88), ...big(V ? 44 : 48, LIGHT, 600), letterSpacing: '-0.02em', opacity: labA }}>Discipline score</div>
          <div style={{ position: 'absolute', right: W - bar.x - bar.w, top: bar.y - (V ? 94 : 100), fontFamily: NUM, fontWeight: 700, fontSize: V ? 58 : 62, letterSpacing: '-0.02em', color: LIGHT, opacity: labA }}>
            {Math.round(p * 100)}<span style={{ color: A.muted, fontSize: V ? 32 : 34 }}>/100</span>
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: bar.y + bar.h + (V ? 56 : 60), display: 'flex', flexDirection: V ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', gap: V ? 18 : 16, opacity: labA }}>
            {rules.map((r, i) => {
              const on = pop(f, CHIP_AT[i], { damping: 12, stiffness: 200 }); const lit = clamp01(on * 1.4);
              return (
                <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 12, height: V ? 62 : 56, padding: '0 22px 0 9px', borderRadius: 999, boxSizing: 'border-box',
                  background: lerpColor(A.surface, mix(A.accent, 0.12, A.surface), lit), border: `1px solid ${lerpColor(A.border2, mix(A.accent, 0.5, A.surface), lit)}`, fontFamily: DISPLAY, fontSize: chipText, fontWeight: 600, color: lerpColor(A.text2, A.text, lit) }}>
                  <div style={{ width: V ? 38 : 34, height: V ? 38 : 34, borderRadius: '50%', display: 'grid', placeItems: 'center', background: lit > 0 ? A.accent : A.surface3, transform: `scale(${lit > 0 ? on : 1})`, boxShadow: lit > 0 ? `0 0 14px ${A.accentGlow}` : undefined }}>
                    {lit > 0 ? <Icon name="check" size={V ? 21 : 19} color={A.ink} sw={3} /> : null}
                  </div>
                  {r.name}
                </div>
              );
            })}
          </div>
        </>
      ) : null}

      {/* Balken, Kreis, Karte */}
      {showBox ? (
        <div style={{ position: 'absolute', left: box.x, top: box.y, width: box.w, height: box.h, borderRadius: radius, overflow: 'hidden', boxSizing: 'border-box',
          background: boxBg ?? (t >= T.col0 ? A.accent : A.surface3), border: t < T.col0 ? `1px solid ${A.border2}` : undefined,
          transform: `scale(${circleScale})`, boxShadow: t >= T.col0 ? `0 0 ${t >= T.m0 ? 40 * (1 - mk) : 50}px ${A.accentGlow}` : undefined }}>
          {t < T.col0 ? <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${p * 100}%`, borderRadius: radius, background: 'linear-gradient(90deg, #0fb862, #34f58a)', boxShadow: `0 0 18px ${A.accentGlow}` }} /> : null}
          {t >= T.done && t < T.m0 + 0.2 ? (
            <svg viewBox="0 0 150 150" width={box.w} height={box.h} style={{ position: 'absolute', inset: 0, opacity: 1 - clamp01(mk * 4) }}>
              {(() => { const d = 'M44 78 L66 99 L108 55'; const e = evolvePath(check, d); return <path d={d} fill="none" stroke={A.ink} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={e.strokeDasharray} strokeDashoffset={e.strokeDashoffset} />; })()}
            </svg>
          ) : null}
          {t >= T.m0 + 0.25 ? <div style={{ position: 'absolute', left: 0, top: 0, width: CARD.w, height: CARD.h, transformOrigin: '0 0', transform: `scale(${box.w / CARD.w})`, opacity: prog(f, sec(T.m0 + 0.25), sec(0.3), OUT) }}><MiniCard r={rows[0]} /></div> : null}
        </div>
      ) : null}
      {t >= T.done && doneP > 0 ? <Confetti f={f} at={sec(T.done)} x={CIRC.x + 75} y={CIRC.y + 75} scale={V ? 1.1 : 1} power={V ? 1500 : 1400} /> : null}
      {txt > 0 && txtOut < 1 ? (
        <div style={{ position: 'absolute', left: 0, right: 0, top: CIRC.y - (V ? 150 : 150), textAlign: 'center', ...big(V ? 84 : 88, LIGHT), opacity: clamp01(txt * 1.5) * (1 - txtOut),
          transform: `translateY(${lerp(30, 0, txt).toFixed(2)}px)`, filter: txt < 1 ? `blur(${lerp(14, 0, txt).toFixed(2)}px)` : txtOut > 0 ? `blur(${(txtOut * 20).toFixed(2)}px)` : undefined }}>
          Plan <span style={{ color: GREEN }}>followed.</span>
        </div>
      ) : null}

      {handA > 0 ? <Hand x={hand.x} y={hand.y} size={V ? 96 : 84} opacity={handA} /> : null}
    </AbsoluteFill>
  );
};
