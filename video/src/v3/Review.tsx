/* Vorlage Outbidd, 40,6–52,9 s: Nahaufnahme der Seitenleiste, die Hand öffnet „Shadow Self“, darunter klappen die Monate auf,
   Klick auf „September 2026 · Active“. Die Kamera zieht schräg zurück auf die ganze Seite: „Review your month in minutes / not hours.“
   Die Hand schaltet „Shadow Self“ ein, die grüne Linie zeichnet sich. Fahrt auf die Kacheln, die Disziplin-Kosten zählen hoch;
   zurück auf die ganze Seite, Shadow Self zählt hoch. Dann springt die Trade-Prüfung des DAX-Trades auf, Discipline zählt bis 80. */
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { clamp01, FPS, IN, lerp, OUT, pop, prog, sec, SIG, SOFT, zoomLerp } from '../anim';
import { num, rows, shadow } from '../app';
import { useFormat } from '../format';
import { NAV } from '../scenes/Product';
import { big, DISPLAY, GREEN, LIGHT, NUM } from '../theme';
import { Bg } from '../ui/Bg';
import { Hand } from '../ui/Hand';
import { A, Badge, Card, CardTitle, Donut, Icon, lerpColor, mix, mixA, Pill, ScoreScale, ShadowLines, Switch, TileHead, usd, Val } from '../ui/Kit';

const NAV2 = NAV.filter(([ic]) => ic !== 'prop');
const SUBS = ['September 2026', 'August 2026', 'July 2026'];
const SHADOW_I = NAV2.findIndex(([ic]) => ic === 'shadow');
const rowTop = (i: number) => 96 + i * 44;
const subTop = (j: number) => rowTop(SHADOW_I) + 46 + j * 36;
const dax = rows.find((r) => r.symbol === 'DAX')!;

/* ---------- Seite „Shadow Self“, 1440 × 900 App-Pixel ---------- */
const Page: React.FC<{ open: number; active: number; cost: number; self: number; toggle: boolean; tb: number; draw: number }> = ({ open, active, cost, self, toggle, tb, draw }) => {
  const X = [252, 548, 844, 1140], KW = 280, KH = 119;
  const tiles = [
    { label: 'Discipline cost', n: 'September 2026', value: usd(cost), color: A.loss, foot: 'What breaking your rules cost you' },
    { label: 'Actual', n: shadow.actualTrades, value: shadow.actual, color: A.accent, foot: '' },
    { label: 'Shadow Self', n: '', value: usd(self, true), color: A.accent, foot: shadow.selfSub },
    { label: 'Violations', n: '', value: '2', color: A.warn, foot: '5% of trades' },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: DISPLAY, color: A.text }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: 18, background: `radial-gradient(1100px 640px at 14% -10%, rgba(255,238,218,.045), transparent 62%), ${A.bg}`, border: `1px solid ${A.border2}`, boxShadow: '0 60px 160px -40px rgba(52,245,138,0.22), 0 90px 140px -50px rgba(0,0,0,0.7)' }} />
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 220, borderRight: `1px solid ${A.border}` }}>
        <div style={{ position: 'absolute', left: 26, top: 26, fontSize: 15, fontWeight: 800, letterSpacing: '0.08em' }}>JOURNALYST</div>
        <div style={{ position: 'absolute', left: 26, top: 46, fontSize: 11.5, color: A.muted }}>Trading Journal App</div>
        {NAV2.map(([ic, label], i) => {
          const on = ic === 'shadow' ? active : ic === 'dashboard' ? 1 - active : 0; const y = rowTop(i) + (i > SHADOW_I ? 3 * 36 * open : 0);
          return (
            <div key={ic} style={{ position: 'absolute', left: 14, top: y, width: 192, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 14, boxSizing: 'border-box',
              background: on > 0 ? mixA(A.surface, on) : 'transparent', border: `1px solid ${on > 0 ? mixA(A.border2, on) : 'transparent'}`, color: lerpColor(A.text2, A.text, on), fontSize: 14, fontWeight: on > 0.5 ? 600 : 500 }}>
              {on > 0 ? <div style={{ position: 'absolute', left: -14, top: 8, bottom: 8, width: 3, borderRadius: 2, background: A.accent, opacity: on, boxShadow: `0 0 8px ${A.accentGlow}` }} /> : null}
              <Icon name={ic} size={18} color={on > 0.5 ? A.text : A.muted} />{label}
              {ic === 'shadow' ? <Icon name="chev" size={14} color={A.muted} style={{ marginLeft: 'auto', marginRight: 12, transform: `rotate(${180 * open}deg)` }} /> : null}
            </div>
          );
        })}
        {SUBS.map((s, j) => {
          const a = clamp01(open * 3 - j * 0.6);
          return (
            <div key={s} style={{ position: 'absolute', left: 44, top: subTop(j), width: 162, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 12, boxSizing: 'border-box', fontSize: 13, opacity: a,
              transform: `translateY(${lerp(-10, 0, a)}px)`, background: j === 0 && active > 0.5 ? A.surface2 : 'transparent', color: j === 0 ? A.text : A.text2, fontWeight: j === 0 ? 600 : 500 }}>
              {s.replace(' 2026', '')}{j === 0 ? <span style={{ marginLeft: 'auto', marginRight: 8 }}><Pill tone="win" size={10.5}>Active</Pill></span> : null}
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 220, right: 0, top: 0, height: 64, borderBottom: `1px solid ${A.border}` }}>
        <div style={{ position: 'absolute', left: 32, top: 18, display: 'flex', alignItems: 'baseline', gap: 12 }}><span style={{ fontSize: 21, fontWeight: 600 }}>Shadow Self</span><span style={{ fontSize: 13, color: A.muted }}>September 2026</span></div>
        <div style={{ position: 'absolute', right: 32, top: 14, width: 36, height: 36, borderRadius: 18, background: A.accent, color: A.ink, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 15, boxShadow: `0 0 14px ${A.accentGlow}` }}>T</div>
      </div>
      {tiles.map((c, i) => (
        <Card key={c.label} tile x={X[i]} y={86} w={KW} h={KH}>
          <TileHead n={c.n || undefined}>{c.label}</TileHead>
          <Val size={i === 0 ? 30 : 25} color={c.color} style={{ marginTop: i === 0 ? 12 : 16 }}>{c.value}</Val>
          {c.foot ? <div style={{ fontSize: 12, color: A.muted, marginTop: 8 }}>{c.foot}</div> : null}
        </Card>
      ))}
      <Card x={252} y={226} w={860} h={430}>
        <CardTitle right={<div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600, color: A.text2 }}>Shadow Self<Switch on={toggle} /></div>}>Equity: actual vs. Shadow Self</CardTitle>
        <div style={{ position: 'absolute', left: 20, top: 74 }}><ShadowLines a={shadow.real} b={shadow.ideal} w={810} h={320} t={draw} tb={tb} /></div>
      </Card>
      <Card x={1130} y={226} w={290} h={430}>
        <CardTitle>Within your rules</CardTitle>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 90, display: 'flex', justifyContent: 'center' }}><Donut segs={[{ v: 95, c: A.accent }, { v: 5, c: A.loss }]} t={draw} size={180} lw={18} /></div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 156, textAlign: 'center' }}><Val size={34}>95%</Val><div style={{ fontSize: 12, color: A.muted, marginTop: 2 }}>of trades</div></div>
        <div style={{ position: 'absolute', left: 20, right: 20, bottom: 24, fontSize: 13, lineHeight: 1.5, color: A.text2 }}>Your Shadow Self takes only the trades that follow your rules.</div>
      </Card>
      <Card x={252} y={676} w={1168} h={196}>
        <TileHead n="2">Trades that broke a rule</TileHead>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 18, height: 54, padding: '0 14px', borderRadius: 12, background: A.lossSoft, border: `1px solid ${mixA(A.loss, 0.3)}`, fontSize: 14 }}>
          <span style={{ fontFamily: NUM }}>{dax.day} <span style={{ color: A.muted }}>{dax.time}</span></span><b>{dax.symbol}</b><Badge dir={dax.side} />
          <span style={{ fontFamily: NUM, color: A.loss, fontWeight: 700 }}>{dax.pnl}</span><Pill>{dax.setup}</Pill>
          <span style={{ marginLeft: 'auto' }}><Pill tone="loss">Discipline {dax.score}</Pill></span>
        </div>
        <div style={{ fontSize: 13, color: A.muted, marginTop: 14 }}>+ 1 more</div>
      </Card>
    </div>
  );
};

/* ---------- Trade-Prüfung, 560 × 400 App-Pixel ---------- */
const Modal: React.FC<{ score: number }> = ({ score }) => (
  <div style={{ width: 560, height: 400, boxSizing: 'border-box', padding: '22px 26px', borderRadius: 22, background: A.surface, border: `1px solid ${A.border2}`, fontFamily: DISPLAY, color: A.text, boxShadow: '0 70px 140px -40px rgba(0,0,0,0.9), 0 0 80px -20px rgba(255,92,92,0.18)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 20, fontWeight: 700 }}>Trade review</span><Icon name="close" size={18} color={A.muted} /></div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18 }}><span style={{ fontSize: 26, fontWeight: 700 }}>{dax.symbol}</span><Badge dir={dax.side} /><Pill tone="loss">{dax.status}</Pill><span style={{ marginLeft: 'auto' }}><Pill>{dax.setup}</Pill></span></div>
    <div style={{ fontFamily: NUM, fontSize: 13, color: A.muted, marginTop: 8 }}>{dax.day} · {dax.time} → {dax.closed}</div>
    <div style={{ display: 'flex', gap: 40, marginTop: 24 }}>
      <div><div style={{ fontSize: 12.5, fontWeight: 600, color: A.text2 }}>Net P&L</div><Val size={36} color={A.loss} style={{ marginTop: 4 }}>{dax.pnl}</Val></div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 12.5, fontWeight: 600, color: A.text2 }}>Discipline</span><Pill tone="loss">Rule broken</Pill></div>
        <Val size={36} color={lerpColor(A.text, A.warn, clamp01(score / 80))} style={{ marginTop: 4 }}>{Math.round(score)}<span style={{ fontSize: 18, color: A.muted }}>/100</span></Val>
        <div style={{ marginTop: 6 }}><ScoreScale p={score} w={250} /></div>
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 26, padding: '12px 14px', borderRadius: 12, background: A.surface2, fontSize: 16, fontWeight: 600, color: A.text }}>
      <Icon name="shadow" size={18} color={A.accent} />Shadow Self skipped this trade.
    </div>
  </div>
);

type Cam = { s: number; x: number; y: number; rx: number };
const camLerp = (a: Cam, b: Cam, t: number): Cam => ({ s: zoomLerp(a.s, b.s, t), x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), rx: lerp(a.rx, b.rx, t) });
export const REVIEW_DURATION = 12.3;
export const Review: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS;
  const { W, H, V, cx, cy } = useFormat();
  /* Kamera */
  const close: Cam = V ? { s: 3.2, x: 116, y: 300, rx: 0 } : { s: 2.6, x: 116, y: 290, rx: 0 };
  const over: Cam = V ? { s: 0.7, x: 720, y: 450, rx: 8 } : { s: 0.84, x: 720, y: 450, rx: 8 };
  const tilesC: Cam = V ? { s: 1.15, x: 720, y: 150, rx: 0 } : { s: 1.5, x: 836, y: 150, rx: 0 };
  const full: Cam = V ? { s: 0.72, x: 720, y: 450, rx: 0 } : { s: 0.94, x: 720, y: 450, rx: 0 };
  const k1 = prog(f, sec(3.75), sec(0.9), SIG), k2 = prog(f, sec(5.6), sec(0.7), SIG), k3 = prog(f, sec(7.4), sec(0.8), SIG);
  let cam = camLerp(close, over, k1); if (k2 > 0) cam = camLerp(over, tilesC, k2); if (k3 > 0) cam = camLerp(tilesC, full, k3);
  const yOff = (V ? 160 : 70) * k1 * (1 - k2) ; /* Platz für die Überschrift */
  /* Punkt der Seite auf den Bildschirm, wie CSS mit Perspektive um die Bildmitte */
  const toScreen = (ax: number, ay: number) => {
    const x = (ax - cam.x) * cam.s, y = (ay - cam.y) * cam.s; const rx = (cam.rx * Math.PI) / 180;
    const X = W / 2 + x, Y = H / 2 + yOff + y * Math.cos(rx), Z = y * Math.sin(rx); const k = 2600 / (2600 - Z);
    return { x: W / 2 + (X - W / 2) * k, y: H / 2 + (Y - H / 2) * k };
  };
  /* Seitenleiste */
  const open = prog(f, sec(1.55), sec(0.6), SIG); const active = prog(f, sec(3.3), sec(0.25));
  const navPt = toScreen(14 + 120, rowTop(SHADOW_I) + 22), subPt = toScreen(44 + 70, subTop(0) + 20);
  const h1 = prog(f, sec(0.4), sec(0.9), SIG), h2 = prog(f, sec(2.5), sec(0.6), SIG), h3 = prog(f, sec(4.35), sec(0.5), SIG);
  const sw = toScreen(252 + 860 - 44, 226 + 30);
  const from = V ? { x: W * 0.8, y: H * 1.04 } : { x: W * 0.75, y: H * 1.08 };
  let hand = { x: lerp(from.x, navPt.x, h1), y: lerp(from.y, navPt.y, h1) };
  if (t >= 2.5) hand = { x: lerp(navPt.x, subPt.x, h2), y: lerp(navPt.y, subPt.y, h2) };
  if (t >= 3.8) hand = { x: lerp(subPt.x + 300, sw.x, h3), y: lerp(subPt.y + 200, sw.y, h3) };
  const clicks = [1.45, 3.3, 4.9]; const lastClick = clicks.filter((c) => t >= c).pop();
  const handA = prog(f, sec(0.4), sec(0.15)) * (1 - prog(f, sec(3.6), sec(0.15))) + prog(f, sec(4.35), sec(0.15)) * (1 - prog(f, sec(5.3), sec(0.2)));
  /* Werte */
  const toggle = t >= 4.9; const tb = prog(f, sec(5.0), sec(1.1), SIG); const draw = prog(f, sec(3.9), sec(1.0), SIG);
  const cost = num(shadow.cost) * prog(f, sec(5.9), sec(1.4), OUT);
  const self = lerp(num(shadow.actual), num(shadow.self), prog(f, sec(7.6), sec(1.6), OUT));
  const head = prog(f, sec(4.1), sec(0.45), SOFT) * (1 - prog(f, sec(5.5), sec(0.25), IN)); const sub = prog(f, sec(4.8), sec(0.4), SOFT);
  /* Prüfung */
  const dim = prog(f, sec(9.8), sec(0.35)); const mp = pop(f, sec(9.85), { damping: 12, stiffness: 170 });
  const score = 80 * prog(f, sec(10.3), sec(1.6), OUT);
  const flash = prog(f, sec(12.05), sec(0.25), IN);
  const MS = V ? 1.78 : 1.8;
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Bg f={f} kind="night" />
      <AbsoluteFill style={{ perspective: 2600, filter: dim > 0 ? `blur(${(dim * 8).toFixed(1)}px)` : undefined, opacity: 1 - dim * 0.5 }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: 1440, height: 900, transformOrigin: '0 0',
          transform: `translate(${cx}px, ${cy + yOff}px) rotateX(${cam.rx.toFixed(2)}deg) scale(${cam.s}) translate(${-cam.x}px, ${-cam.y}px)` }}>
          <Page open={open} active={active} cost={cost} self={self} toggle={toggle} tb={tb} draw={draw} />
        </div>
      </AbsoluteFill>
      {head > 0 ? (
        <div style={{ position: 'absolute', left: 0, right: 0, top: V ? 170 : 34, textAlign: 'center', opacity: head }}>
          <div style={{ ...big(V ? 84 : 72, LIGHT), whiteSpace: V ? 'normal' : 'pre', maxWidth: V ? 860 : undefined, margin: '0 auto', transform: `translateY(${lerp(24, 0, head)}px)` }}>Review your month in <span style={{ color: GREEN }}>minutes</span></div>
          <div style={{ ...big(V ? 48 : 40, A.text2, 600), marginTop: 8, opacity: clamp01(sub * 1.5), transform: `translateY(${lerp(16, 0, sub)}px)` }}>not hours.</div>
        </div>
      ) : null}
      {dim > 0 ? <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.55))', opacity: dim }} /> : null}
      {mp > 0.001 ? (
        <div style={{ position: 'absolute', left: cx - 280 * MS, top: cy - 200 * MS, width: 560, height: 400, transformOrigin: '0 0', transform: `scale(${MS})` }}>
          <div style={{ transformOrigin: '50% 50%', transform: `scale(${lerp(0.9, 1, mp)})`, opacity: clamp01(mp * 3) }}><Modal score={score} /></div>
        </div>
      ) : null}
      {handA > 0 ? <Hand x={hand.x} y={hand.y} clickAge={lastClick != null ? f - sec(lastClick) : -1} size={V ? 100 : 88} opacity={handA} /> : null}
      {flash > 0 ? <AbsoluteFill style={{ background: mix(A.accent, 0.12, '#060807'), opacity: Math.sin(Math.PI * flash) }} /> : null}
    </AbsoluteFill>
  );
};
