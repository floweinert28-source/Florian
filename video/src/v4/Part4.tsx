/* Vorlage iBanPay, 26,9–35 s: Die App schwingt schräg von rechts unten ins Bild (TradeLog, neu importierte Trades).
   Die Hand fährt zum Feld „Review“ beim ES-Trade, die Kamera schiebt sich auf die Zeile, Klick, Flug hinein: geteilte Ansicht
   „Review trade“ – links die aus der CSV übernommenen Werte, rechts die Quellzeile. Klicks auf „Pullback“ und „Yes“,
   dann Fahrt in die Ecke und Klick auf „Save review“. */
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { clamp01, EXPO_IN, FPS, lerp, pop, prog, sec, SIG, SOFT, zoomLerp } from '../anim';
import { dash, rows, trade } from '../app';
import { useFormat } from '../format';
import { NAV, tone } from '../scenes/Product';
import { DISPLAY, NUM } from '../theme';
import { Bg } from '../ui/Bg';
import { Hand } from '../ui/Hand';
import { A, Badge, Card, Icon, mix, mixA, Pill, TileHead, Val } from '../ui/Kit';

type Pose = { s: number; x: number; y: number; rx: number; ry: number; tx: number; ty: number };
const poseLerp = (a: Pose, b: Pose, t: number): Pose => ({ s: zoomLerp(a.s, b.s, t), x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), rx: lerp(a.rx, b.rx, t), ry: lerp(a.ry, b.ry, t), tx: lerp(a.tx, b.tx, t), ty: lerp(a.ty, b.ty, t) });
const P = 2400;
const css = (p: Pose, cx: number, cy: number) => `translate(${cx + p.tx}px, ${cy + p.ty}px) rotateX(${p.rx}deg) rotateY(${p.ry}deg) scale(${p.s}) translate(${-p.x}px, ${-p.y}px)`;
/* Punkt der Fläche auf den Bildschirm (CSS: erst rotateY, dann rotateX, Perspektive um die Bildmitte) */
export const project3 = (ax: number, ay: number, p: Pose, W: number, H: number) => {
  const x = (ax - p.x) * p.s, y = (ay - p.y) * p.s; const ry = (p.ry * Math.PI) / 180, rx = (p.rx * Math.PI) / 180;
  const x1 = x * Math.cos(ry), z1 = -x * Math.sin(ry);
  const y2 = y * Math.cos(rx) - z1 * Math.sin(rx), z2 = y * Math.sin(rx) + z1 * Math.cos(rx);
  const k = P / (P - z2);
  return { x: W / 2 + (p.tx + x1) * k, y: H / 2 + (p.ty + y2) * k };
};

/* ---------- App mit TradeLog ---------- */
const ROWY = 300, RH = 70; const PILL = { x: 1010, w: 104 };
const App: React.FC<{ focus: number; pressed: boolean }> = ({ focus, pressed }) => (
  <div style={{ position: 'absolute', inset: 0, fontFamily: DISPLAY, color: A.text }}>
    <div style={{ position: 'absolute', inset: 0, borderRadius: 18, background: `radial-gradient(1100px 640px at 14% -10%, rgba(255,238,218,.045), transparent 62%), ${A.bg}`, border: `1px solid ${A.border2}`, boxShadow: '0 -20px 120px -30px rgba(52,245,138,0.35), 0 90px 140px -50px rgba(0,0,0,0.8)' }} />
    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 220, borderRight: `1px solid ${A.border}`, opacity: 1 - 0.6 * focus }}>
      <div style={{ position: 'absolute', left: 26, top: 26, fontSize: 15, fontWeight: 800, letterSpacing: '0.08em' }}>JOURNALYST</div>
      <div style={{ position: 'absolute', left: 26, top: 46, fontSize: 11.5, color: A.muted }}>Trading Journal App</div>
      {NAV.filter(([ic]) => ic !== 'prop').map(([ic, label], i) => (
        <div key={ic} style={{ position: 'absolute', left: 14, top: 96 + i * 44, width: 192, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 14, boxSizing: 'border-box',
          background: ic === 'tradelog' ? A.surface : 'transparent', border: ic === 'tradelog' ? `1px solid ${A.border2}` : '1px solid transparent', color: ic === 'tradelog' ? A.text : A.text2, fontSize: 14, fontWeight: ic === 'tradelog' ? 600 : 500 }}>
          {ic === 'tradelog' ? <div style={{ position: 'absolute', left: -14, top: 8, bottom: 8, width: 3, borderRadius: 2, background: A.accent }} /> : null}
          <Icon name={ic} size={18} color={ic === 'tradelog' ? A.text : A.muted} />{label}
        </div>
      ))}
    </div>
    <div style={{ position: 'absolute', left: 252, top: 26, opacity: 1 - 0.6 * focus }}><div style={{ fontSize: 24, fontWeight: 600 }}>Welcome back</div><div style={{ fontSize: 13, color: A.muted, marginTop: 4 }}>September 2026 · Main account</div></div>
    <div style={{ position: 'absolute', right: 32, top: 26, width: 36, height: 36, borderRadius: 18, background: A.accent, color: A.ink, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 15, opacity: 1 - 0.6 * focus }}>T</div>
    <div style={{ opacity: 1 - 0.6 * focus, filter: focus > 0 ? `blur(${(4 * focus).toFixed(1)}px)` : undefined }}>
      {[['Net P&L', dash.net, A.accent, dash.trades], ['Trade win rate', dash.winRate, A.text, ''], ['Profit factor', dash.pf, A.text, '']].map(([l, v, c, n], i) => (
        <Card key={l} tile x={252 + i * 388} y={96} w={372} h={104}><TileHead n={n || undefined}>{l}</TileHead><Val size={26} color={c} style={{ marginTop: 12 }}>{v}</Val></Card>
      ))}
    </div>
    <Card x={252} y={218} w={1156} h={652} style={{ opacity: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: 1 - 0.6 * focus }}><span style={{ fontSize: 17, fontWeight: 600 }}>Latest trades</span><Pill tone="win">◆ 42 imported</Pill></div>
      <div style={{ position: 'absolute', left: 20, right: 20, top: 62, display: 'flex', fontSize: 12, fontWeight: 600, color: A.muted, opacity: 1 - 0.6 * focus }}>
        <span style={{ width: 200 }}>Opened</span><span style={{ width: 90 }}>Symbol</span><span style={{ width: 120 }}>Side</span><span style={{ width: 150 }}>Source</span><span style={{ marginLeft: 'auto', width: 140, textAlign: 'right' }}>Status</span><span style={{ width: 150, textAlign: 'right' }}>P&L</span>
      </div>
    </Card>
    {rows.map((r, i) => {
      const es = i === 0;
      return (
        <div key={r.date} style={{ position: 'absolute', left: 272, width: 1116, top: ROWY + i * RH, height: RH - 8, borderRadius: 12, display: 'flex', alignItems: 'center', fontSize: 14.5, padding: '0 0', boxSizing: 'border-box',
          background: es ? mix(A.accent, 0.06 * focus, A.surface) : 'transparent', borderTop: i ? `1px solid ${A.border}` : undefined, boxShadow: es && focus > 0 ? `inset 0 0 0 1px ${mixA(A.accent, 0.35 * focus)}` : undefined,
          opacity: es ? 1 : 1 - 0.65 * focus, filter: !es && focus > 0 ? `blur(${(3 * focus).toFixed(1)}px)` : undefined }}>
          <span style={{ width: 200, fontFamily: NUM }}>{r.day} <span style={{ color: A.muted }}>{r.time}</span></span>
          <b style={{ width: 90 }}>{r.symbol}</b><span style={{ width: 120 }}><Badge dir={r.side} /></span>
          <span style={{ width: 150 }}><Pill tone="win" size={11}>◆ CSV</Pill></span>
          <span style={{ marginLeft: 'auto', width: 140, display: 'flex', justifyContent: 'flex-end' }}>
            {es ? <span style={{ padding: '6px 16px', borderRadius: 999, background: A.text, color: A.ink, fontWeight: 800, fontSize: 12, letterSpacing: '0.08em', transform: `scale(${pressed ? 0.94 : 1})`, boxShadow: '0 0 18px rgba(242,240,236,0.25)' }}>REVIEW</span> : <Pill>Reviewed</Pill>}
          </span>
          <span style={{ width: 150, textAlign: 'right', fontFamily: NUM, fontWeight: 700, color: tone(r.pnl) }}>{r.pnl}</span>
        </div>
      );
    })}
  </div>
);

/* ---------- Review-Ansicht, 1400 × 800 ---------- */
const RW = 1400, RHt = 800;
const SAVE = { x: RW - 28 - 210, y: RHt - 28 - 54, w: 210, h: 54 };
const SETUPS = ['Pullback', 'Breakout', 'Range-Fade', 'Other']; const SET_Y = 330, PLAN_Y = 450;
const pillX = (labels: string[], i: number) => 28 + labels.slice(0, i).reduce((a, l) => a + l.length * 10.5 + 52 + 12, 0);
const ReviewPanel: React.FC<{ setup: number; plan: number; saved: boolean }> = ({ setup, plan, saved }) => {
  const F = (l: string, v: React.ReactNode, i: number) => (
    <div key={l} style={{ position: 'absolute', left: 28 + (i % 3) * 272, top: 104 + Math.floor(i / 3) * 100, width: 256, height: 84, borderRadius: 14, background: A.surface, border: `1px solid ${A.border2}`, padding: '12px 14px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 12.5, fontWeight: 600, color: A.muted }}>{l}</span><span style={{ fontSize: 10.5, fontWeight: 700, color: A.accent }}>◆ CSV</span></div>
      <div style={{ marginTop: 8 }}>{v}</div>
    </div>
  );
  const chip = (l: string, on: number, x: number, y: number) => (
    <div key={l} style={{ position: 'absolute', left: x, top: y, height: 44, padding: '0 22px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, boxSizing: 'border-box',
      background: on > 0 ? mix(A.accent, 0.08 + 0.1 * on, A.surface) : A.surface, border: `1px solid ${on > 0 ? mixA(A.accent, 0.3 + 0.4 * on) : A.border2}`, color: on > 0.5 ? A.accent : A.text2, transform: `scale(${1 + 0.06 * Math.sin(Math.PI * Math.min(1, on))})` }}>
      {on > 0.5 ? <Icon name="check" size={15} color={A.accent} sw={2.6} /> : null}{l}
    </div>
  );
  return (
    <div style={{ position: 'relative', width: RW, height: RHt, borderRadius: 22, background: A.bg, border: `1px solid ${A.border2}`, fontFamily: DISPLAY, color: A.text, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 28, top: 26, display: 'flex', alignItems: 'baseline', gap: 14 }}><span style={{ fontSize: 26, fontWeight: 700 }}>Review trade</span><span style={{ fontSize: 14, color: A.muted }}>{trade.symbol} · Long · {rows[0].day} {rows[0].time}</span></div>
      <Icon name="close" size={20} color={A.muted} style={{ position: 'absolute', right: 28, top: 30 }} />
      {F('Symbol', <b style={{ fontSize: 22 }}>{trade.symbol}</b>, 0)}
      {F('Side', <Badge dir="LONG" />, 1)}
      {F('Contracts', <Val size={22}>{trade.qty}</Val>, 2)}
      {F('Entry', <Val size={22}>{trade.entry}</Val>, 3)}
      {F('Exit', <Val size={22}>{trade.exit}</Val>, 4)}
      {F('Net P&L', <Val size={22} color={A.accent}>{trade.pnl}</Val>, 5)}
      <div style={{ position: 'absolute', left: 28, top: SET_Y - 30, fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: A.muted }}>SETUP</div>
      {SETUPS.map((s, i) => chip(s, i === 0 ? setup : 0, pillX(SETUPS, i), SET_Y))}
      <div style={{ position: 'absolute', left: 28, top: PLAN_Y - 30, fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', color: A.muted }}>DID YOU FOLLOW YOUR PLAN?</div>
      {['Yes', 'No'].map((s, i) => chip(s, i === 0 ? plan : 0, pillX(['Yes', 'No'], i), PLAN_Y))}
      <div style={{ position: 'absolute', left: 28, top: 540, width: 800, height: 120, borderRadius: 14, background: A.field, border: `1px solid ${A.border2}`, padding: '14px 16px', boxSizing: 'border-box', fontSize: 15, color: A.muted }}>What did you learn from this trade?</div>
      <div style={{ position: 'absolute', left: 876, top: 104, width: 496, height: 556, borderRadius: 18, background: A.surface, border: `1px solid ${A.border2}`, padding: '18px 20px', boxSizing: 'border-box' }}>
        <TileHead>Source</TileHead>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}><div style={{ width: 26, height: 30, borderRadius: 5, background: A.accentSoft, border: `1.5px solid ${mixA(A.accent, 0.6)}`, display: 'grid', placeItems: 'center', fontFamily: NUM, fontSize: 8, fontWeight: 800, color: A.accent }}>CSV</div><b style={{ fontSize: 15 }}>broker-export-sep.csv</b><span style={{ marginLeft: 'auto', fontSize: 12.5, color: A.muted }}>row 1 of 42</span></div>
        <div style={{ marginTop: 16, borderRadius: 12, background: A.field, border: `1px solid ${mixA(A.accent, 0.45)}`, padding: '14px 14px', fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 13.5, lineHeight: 1.6, color: A.text, boxShadow: `0 0 24px -8px ${A.accentGlow}` }}>
          {rows[0].day} 16:12,{trade.symbol},Buy,{trade.qty},<br />{trade.entry.replace(',', '')},{trade.exit.replace(',', '')},{trade.pnl.replace(/[+$,]/g, '')}
        </div>
        <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[['Entry', trade.entry], ['Exit', trade.exit], ['Net P&L', trade.pnl], ['R multiple', trade.r]].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 15 }}><div style={{ width: 24, height: 24, borderRadius: 12, background: A.accent, display: 'grid', placeItems: 'center' }}><Icon name="check" size={13} color={A.ink} sw={3} /></div><span style={{ color: A.text2 }}>{l}</span><span style={{ marginLeft: 'auto', fontFamily: NUM, fontWeight: 700 }}>{v}</span></div>
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', left: SAVE.x, top: SAVE.y, width: SAVE.w, height: SAVE.h, borderRadius: 14, background: A.accent, color: A.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 17, fontWeight: 700,
        transform: `scale(${saved ? 0.95 : 1})`, boxShadow: `0 12px 30px -10px ${A.accentGlow}` }}><Icon name="check" size={18} color={A.ink} sw={2.8} />Save review</div>
      <div style={{ position: 'absolute', right: 28 + 210 + 14, top: SAVE.y, height: 54, padding: '0 22px', borderRadius: 14, border: `1px solid ${A.border2}`, display: 'flex', alignItems: 'center', fontSize: 16, fontWeight: 600, color: A.text2 }}>Cancel</div>
    </div>
  );
};

export const P4_DURATION = 8.1;
export const Part4: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS;
  const { W, H, V, cx, cy } = useFormat();
  /* App schwingt herein, Fahrt auf die Zeile */
  const s0 = V ? 0.62 : 0.9;
  const enter = prog(f, 0, sec(0.7), SOFT);
  const A0: Pose = { s: s0 * 0.85, x: 720, y: 450, rx: 20, ry: -34, tx: W * 0.35, ty: H * 0.45 };
  const A1: Pose = { s: s0, x: 720, y: 450, rx: 10, ry: -16, tx: 0, ty: V ? 40 : 20 };
  const pill = { x: 272 + PILL.x + PILL.w / 2 - 8, y: ROWY + (RH - 8) / 2 };
  const A2: Pose = { s: V ? 1.5 : 2.1, x: pill.x - (V ? 200 : 360), y: pill.y, rx: 0, ry: 0, tx: 0, ty: 0 };
  const A3: Pose = { ...A2, s: V ? 9 : 12, x: pill.x };
  const k1 = prog(f, sec(1.35), sec(0.75), SIG), k2 = prog(f, sec(2.3), sec(0.7), EXPO_IN);
  let pose = poseLerp(A0, A1, enter); if (k1 > 0) pose = poseLerp(A1, A2, k1); if (k2 > 0) pose = poseLerp(A2, A3, k2);
  const pillScr = project3(pill.x, pill.y, pose, W, H);
  const CLICK1 = 2.1;
  /* Review-Ansicht */
  const rv = prog(f, sec(3.0), sec(0.45), SOFT);
  const RS = V ? 0.74 : 1.25;
  const B0: Pose = { s: RS * lerp(1.15, 1, rv), x: RW / 2, y: RHt / 2, rx: 4, ry: -10, tx: 0, ty: V ? 60 : 0 };
  const save = { x: SAVE.x + SAVE.w * 0.6, y: SAVE.y + SAVE.h * 0.6 };
  const zk = prog(f, sec(6.55), sec(0.8), SIG);
  const B1: Pose = { s: RS * (V ? 2.0 : 1.9), x: save.x - (V ? 60 : 160), y: save.y - 60, rx: 0, ry: 0, tx: 0, ty: 0 };
  const push = lerp(1, 1.04, prog(f, sec(3.0), sec(3.5), (x) => x));
  const rpose = poseLerp({ ...B0, s: B0.s * push }, B1, zk);
  const pt = (x: number, y: number) => project3(x, y, rpose, W, H);
  const setupPt = pt(pillX(SETUPS, 0) + 60, SET_Y + 28), planPt = pt(pillX(['Yes', 'No'], 0) + 40, PLAN_Y + 28), savePt = pt(save.x, save.y);
  const CL = [4.95, 5.6, 7.2];
  const hA = prog(f, sec(3.3), sec(0.8), SIG), hB = prog(f, sec(5.1), sec(0.45), SIG), hC = prog(f, sec(6.45), sec(0.65), SIG);
  const from2 = V ? { x: W * 0.55, y: H * 1.04 } : { x: W * 0.5, y: H * 1.08 };
  let hand2 = { x: lerp(from2.x, setupPt.x, hA), y: lerp(from2.y, setupPt.y, hA) };
  if (t >= 5.1) hand2 = { x: lerp(setupPt.x, planPt.x, hB), y: lerp(setupPt.y, planPt.y, hB) };
  if (t >= 6.45) hand2 = { x: lerp(planPt.x, savePt.x, hC), y: lerp(planPt.y, savePt.y, hC) };
  const last = CL.filter((c) => t >= c).pop();
  const whip = prog(f, sec(7.85), sec(0.25), EXPO_IN);
  const from1 = V ? { x: W * 0.5, y: H * 1.04 } : { x: W * 0.55, y: H * 1.08 };
  const hk1 = prog(f, sec(0.35), sec(0.95), SIG);
  const hand1 = { x: lerp(from1.x, pillScr.x + 10, hk1), y: lerp(from1.y, pillScr.y + 12, hk1) };
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Bg f={f} kind="night" />
      {t < 3.05 ? (
        <AbsoluteFill style={{ perspective: P, filter: k2 > 0 ? `blur(${(k2 * 10).toFixed(1)}px)` : undefined, opacity: 1 - prog(f, sec(2.85), sec(0.2)) }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: 1440, height: 900, transformOrigin: '0 0', transform: css(pose, cx, cy), opacity: clamp01(enter * 2) }}>
            <App focus={k1} pressed={t >= CLICK1 && t < CLICK1 + 0.14} />
          </div>
          {t < 2.4 ? <Hand x={hand1.x} y={hand1.y} clickAge={f - sec(CLICK1)} size={V ? 100 : 92} opacity={prog(f, sec(0.35), sec(0.15)) * (1 - prog(f, sec(2.25), sec(0.15)))} /> : null}
        </AbsoluteFill>
      ) : null}
      {rv > 0 ? (
        <AbsoluteFill style={{ perspective: P, opacity: clamp01(rv * 2) * (1 - whip), filter: whip > 0 ? `blur(${(whip * 20).toFixed(1)}px)` : undefined }}>
          <AbsoluteFill style={{ background: 'radial-gradient(1000px 640px at 50% 50%, rgba(52,245,138,0.12), transparent 70%)' }} />
          <div style={{ position: 'absolute', left: 0, top: 0, width: RW, height: RHt, transformOrigin: '0 0', transform: css(rpose, cx, cy) }}>
            <div style={{ position: 'absolute', inset: -2, borderRadius: 24, boxShadow: '0 -10px 90px -10px rgba(52,245,138,0.35), 0 60px 140px -40px rgba(0,0,0,0.8)' }} />
            <ReviewPanel setup={pop(f, sec(CL[0]), { damping: 12, stiffness: 200 })} plan={pop(f, sec(CL[1]), { damping: 12, stiffness: 200 })} saved={t >= CL[2] && t < CL[2] + 0.14} />
          </div>
          <Hand x={hand2.x} y={hand2.y} clickAge={last != null ? f - sec(last) : -1} size={V ? 100 : 92} opacity={prog(f, sec(3.3), sec(0.15)) * (1 - prog(f, sec(7.7), sec(0.15)))} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
