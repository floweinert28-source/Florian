/* Vorlage Outbidd, 11,1–20,8 s: „All your trades“ → „All in one place“, das Dashboard gleitet von unten herein und kippt leicht.
   Flug in die Tagesbalken, daraus wird der Kalender (echte Tage im September). Die Hand zeigt auf den 29., ein Hinweis springt auf,
   Klick auf „Review day“, Flug in den Tag: „Forget“ wird getippt, darunter tauschen „messy spreadsheets“ und „forgotten lessons“,
   die Journal-Karte hebt sich heraus. */
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { clamp01, EXPO_IN, FPS, IN, lerp, OUT, pop, prog, sec, SIG, SOFT, zoomLerp } from '../anim';
import raw from '../data/app.json';
import { dash, rows } from '../app';
import { useFormat } from '../format';
import { DashboardPanel } from '../scenes/Product';
import { big, DISPLAY, GREEN, LIGHT, NUM } from '../theme';
import { Bg } from '../ui/Bg';
import { Hand } from '../ui/Hand';
import { A, Badge, Card, Icon, lerpColor, mix, mixA, Pill, TileHead, usd, Val } from '../ui/Kit';
import { Caret } from '../ui/Text';
import { MaskSwap } from './Parts';

/* ---------- Kalender September 2026 (Sonntag zuerst), echte Tagesergebnisse ---------- */
const DAYS: Record<number, number> = Object.fromEntries(raw.dash.days.map((d) => [Number(d.key.slice(8)), d.pnl]));
const money0 = (v: number) => `${v < 0 ? '−' : '+'}$${Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const calLayout = (V: boolean) => {
  const CW = V ? 1000 : 1400, CH = V ? 1060 : 800; const top = V ? 150 : 128, pad = V ? 24 : 28; const cols = 7, rowsN = 5, gap = 10;
  const cw = (CW - 2 * pad - (cols - 1) * gap) / cols, ch = (CH - top - pad - (rowsN - 1) * gap) / rowsN;
  const cell = (day: number) => { const idx = day + 1; /* 1. September ist ein Dienstag: zwei Felder davor */ return { x: pad + (idx % 7) * (cw + gap), y: top + Math.floor(idx / 7) * (ch + gap), w: cw, h: ch }; };
  return { CW, CH, top, pad, cw, ch, gap, cell };
};
const Calendar: React.FC<{ V: boolean; hover: number }> = ({ V, hover }) => {
  const L = calLayout(V);
  return (
    <div style={{ position: 'relative', width: L.CW, height: L.CH, borderRadius: 20, background: A.surface, border: `1px solid ${A.border2}`, fontFamily: DISPLAY, color: A.text, boxShadow: '0 60px 140px -40px rgba(0,0,0,0.8), 0 0 90px -30px rgba(52,245,138,0.25)' }}>
      <div style={{ position: 'absolute', left: L.pad, top: 26, display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: V ? 30 : 26, fontWeight: 600 }}>September 2026</span>
        <div style={{ display: 'flex', gap: 6 }}>{[90, -90].map((r) => <div key={r} style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${A.border2}`, display: 'grid', placeItems: 'center' }}><Icon name="chev" size={15} color={A.text2} style={{ transform: `rotate(${r}deg)` }} /></div>)}</div>
      </div>
      <div style={{ position: 'absolute', right: L.pad, top: 24, textAlign: 'right' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: A.muted }}>Monthly P&L</div>
        <Val size={V ? 28 : 24} color={A.accent}>{usd(Number(dash.net.replace(/[^0-9.]/g, '')))}</Val>
      </div>
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => <div key={d} style={{ position: 'absolute', left: L.pad + i * (L.cw + L.gap), top: L.top - 30, width: L.cw, textAlign: 'center', fontSize: 12.5, fontWeight: 600, color: A.muted }}>{d}</div>)}
      {Array.from({ length: 35 }, (_, k) => {
        const day = k - 1; const c = L.cell(day); const inMonth = day >= 1 && day <= 30; const v = DAYS[day]; const h = day === 29 ? hover : 0;
        const tint = v == null ? null : v >= 0 ? A.accent : A.loss;
        return (
          <div key={k} style={{ position: 'absolute', left: c.x, top: c.y, width: c.w, height: c.h, borderRadius: 12, boxSizing: 'border-box', padding: V ? '10px 12px' : '10px 12px',
            background: tint ? mixA(tint, 0.1 + 0.08 * h) : inMonth ? A.surface2 : 'transparent', border: `1px solid ${h > 0 ? lerpColor(mix(tint ?? A.accent, 0.35, A.surface), A.accent, h) : tint ? mixA(tint, 0.28) : inMonth ? A.border : 'transparent'}`,
            boxShadow: h > 0 ? `0 0 ${(24 * h).toFixed(1)}px ${mixA(A.accent, 0.35 * h)}` : undefined, outline: day === 30 ? `1.5px dashed ${A.border2}` : undefined }}>
            <div style={{ fontFamily: NUM, fontSize: V ? 15 : 13, fontWeight: 600, color: inMonth ? A.text2 : A.faint }}>{inMonth ? day : day < 1 ? 31 + day : day - 30}</div>
            {v != null ? <div style={{ position: 'absolute', left: 0, right: 0, bottom: V ? 14 : 12, textAlign: 'center', fontFamily: NUM, fontWeight: 700, fontSize: V ? 15 : 17, letterSpacing: '-0.02em', color: tint! }}>{money0(v).replace('.00', '')}</div> : null}
          </div>
        );
      })}
    </div>
  );
};
const TIP = { w: 300, h: 162 };
const Tooltip: React.FC<{ pressed: boolean }> = ({ pressed }) => (
  <div style={{ width: TIP.w, height: TIP.h, boxSizing: 'border-box', padding: '16px 18px', borderRadius: 16, background: A.surface2, border: `1px solid ${A.border2}`, fontFamily: DISPLAY, color: A.text, boxShadow: '0 30px 60px -20px rgba(0,0,0,0.85)' }}>
    <div style={{ fontSize: 15, fontWeight: 700 }}>Tue, Sep 29</div>
    <Val size={26} color={A.accent} style={{ marginTop: 6 }}>{money0(DAYS[29])}</Val>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
      <span style={{ fontSize: 12.5, color: A.muted }}>2 trades · NQ, MNQ</span>
      <span style={{ padding: '7px 14px', borderRadius: 999, background: pressed ? A.accent2 : A.accent, color: A.ink, fontSize: 13, fontWeight: 700, transform: `scale(${pressed ? 0.95 : 1})`, boxShadow: `0 0 16px ${A.accentGlow}` }}>Review day</span>
    </div>
  </div>
);

/* ---------- Tagesansicht 29. September ---------- */
const day = rows.filter((r) => r.day === '09/29/2026');
const DayRow: React.FC<{ r: (typeof rows)[number] }> = ({ r }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderTop: `1px solid ${A.border}` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><b style={{ fontSize: 17 }}>{r.symbol}</b><Badge dir={r.side} /><span style={{ fontFamily: NUM, fontSize: 12.5, color: A.muted }}>{r.time}</span></div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Pill tone={/^\+/.test(r.r) ? 'win' : 'loss'} num>{r.r}</Pill><Val size={18} color={/^\+/.test(r.pnl) ? A.accent : A.loss}>{r.pnl}</Val></div>
  </div>
);
export const DAY_JOURNAL = { x: 640, y: 150, w: 532, h: 270 };
const DayPanel: React.FC<{ V: boolean; lift: number }> = ({ V, lift }) => {
  const P = V ? { w: 760, h: 1090 } : { w: 1200, h: 650 };
  const J = V ? { x: 24, y: 520, w: 712, h: 270 } : DAY_JOURNAL;
  const tiles = [['Net P&L', money0(DAYS[29]), A.accent], ['Trades', String(day.length), A.text], ['Win rate', '50.0%', A.text], ['Discipline', '100', A.accent]] as const;
  return (
    <div style={{ position: 'relative', width: P.w, height: P.h, borderRadius: 20, background: `radial-gradient(900px 500px at 10% -10%, rgba(255,238,218,.04), transparent 62%), ${A.bg}`, border: `1px solid ${A.border2}`, fontFamily: DISPLAY, color: A.text, boxShadow: '0 60px 160px -40px rgba(52,245,138,0.25), 0 80px 120px -50px rgba(0,0,0,0.8)' }}>
      <div style={{ position: 'absolute', left: 28, top: 24, display: 'flex', alignItems: 'center', gap: 12 }}><Icon name="day" size={22} color={A.text2} /><span style={{ fontSize: 24, fontWeight: 700 }}>Tuesday, Sep 29, 2026</span></div>
      <div style={{ position: 'absolute', left: 24, right: 24, top: 74, display: 'grid', gridTemplateColumns: V ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 12 }}>
        {tiles.map(([l, v, c]) => <div key={l} style={{ height: 62, borderRadius: 14, background: A.surface, border: `1px solid ${A.border}`, padding: '10px 14px', boxSizing: 'border-box' }}><div style={{ fontSize: 12, fontWeight: 600, color: A.text2 }}>{l}</div><Val size={20} color={c} style={{ marginTop: 4 }}>{v}</Val></div>)}
      </div>
      <Card x={24} y={V ? 230 : 150} w={V ? 712 : 592} h={V ? 270 : 270}>
        <TileHead n="2">Trades</TileHead>
        <div style={{ marginTop: 14 }}>{day.map((r) => <DayRow key={r.time} r={r} />)}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}><Pill tone="win">{day[0]?.setup}</Pill><Pill>{day[1]?.setup}</Pill></div>
      </Card>
      <Card x={24} y={V ? 810 : 438} w={V ? 712 : 1152} h={V ? 250 : 188}>
        <TileHead>Rules</TileHead>
        <div style={{ display: 'flex', flexDirection: V ? 'column' : 'row', gap: V ? 14 : 28, marginTop: 18 }}>
          {['Max trades per day', 'Stop after consecutive losses', 'No new trade after a loss'].map((r) => (
            <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: 600 }}><div style={{ width: 26, height: 26, borderRadius: 13, background: A.accent, display: 'grid', placeItems: 'center' }}><Icon name="check" size={14} color={A.ink} sw={3} /></div>{r}</div>
          ))}
        </div>
      </Card>
      {/* Journal-Karte, hebt sich heraus */}
      <div style={{ position: 'absolute', left: J.x, top: J.y, width: J.w, height: J.h, transformOrigin: '50% 50%', transform: `scale(${1 + 0.05 * lift})`, zIndex: 2 }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: 16, background: lerpColor(A.surface, mix(A.accent, 0.06, A.surface), lift), border: `1px solid ${lerpColor(A.border, mix(A.accent, 0.55, A.surface), lift)}`, padding: '18px 20px', boxSizing: 'border-box',
          boxShadow: `0 ${20 + 30 * lift}px ${50 + 40 * lift}px -20px rgba(0,0,0,0.8), 0 0 ${50 * lift}px ${mixA(A.accent, 0.3 * lift)}` }}>
          <TileHead>Journal</TileHead>
          <div style={{ fontSize: 16, lineHeight: 1.6, color: A.text, marginTop: 14 }}>NQ range-fade: waited for my level, took it as planned.<br /><span style={{ color: A.text2 }}>MNQ: chased the breakout without a retest. Next time I wait.</span></div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}><Pill tone="win">Patience</Pill><Pill tone="loss">FOMO</Pill><Pill>Lesson</Pill></div>
        </div>
      </div>
    </div>
  );
};

export const OVERVIEW_DURATION = 9.7;
export const Overview: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS;
  const { W, H, V, cx, cy } = useFormat();
  /* A: Dashboard */
  const DS = V ? 0.68 : 0.86; const dy = V ? cy + 170 : cy + 75;
  const up = prog(f, 0, sec(0.5), SOFT); const tilt = prog(f, sec(2.3), sec(0.7), SIG);
  const zk = prog(f, sec(3.0), sec(1.0), EXPO_IN);
  const card = { x: 836, y: 790 }; const zTarget = (W * 0.98) / (1168 * DS);
  const z = zoomLerp(1, zTarget * 1.25, zk); const px = lerp(720, card.x, prog(f, sec(3.0), sec(0.9), SIG)), py = lerp(450, card.y, prog(f, sec(3.0), sec(0.9), SIG));
  const dashA = 1 - prog(f, sec(3.75), sec(0.3));
  const headA = prog(f, 0, sec(0.3)) * (1 - prog(f, sec(2.95), sec(0.25), IN));
  /* B: Kalender */
  const cal = prog(f, sec(3.75), sec(0.35), OUT); const L = calLayout(V); const CS = V ? 1.0 : 1.22;
  const calX = cx - (L.CW * CS) / 2, calY = cy - (L.CH * CS) / 2 + (V ? 40 : 0);
  const c29 = L.cell(29); const cellC = { x: calX + (c29.x + c29.w * 0.55) * CS, y: calY + (c29.y + c29.h * 0.55) * CS };
  const tipApp = { x: c29.x + c29.w / 2 - TIP.w / 2 + (V ? 60 : 120), y: c29.y - TIP.h - 14 };
  const tipK = pop(f, sec(4.85), { damping: 12, stiffness: 190 });
  const pill = { x: calX + (tipApp.x + TIP.w - 70) * CS, y: calY + (tipApp.y + TIP.h - 32) * CS };
  const hk1 = prog(f, sec(4.15), sec(0.65), SIG), hk2 = prog(f, sec(5.0), sec(0.35), SIG);
  const from = V ? { x: W * 0.85, y: H * 1.04 } : { x: W * 0.86, y: H * 1.08 };
  const p1 = { x: lerp(from.x, cellC.x, hk1), y: lerp(from.y, cellC.y, hk1) }; const hand = { x: lerp(p1.x, pill.x, hk2), y: lerp(p1.y, pill.y, hk2) };
  const CLICK = 5.4; const calZ = prog(f, sec(5.65), sec(0.3), EXPO_IN);
  const calOrigin = { x: calX + (tipApp.x + TIP.w / 2) * CS, y: calY + (tipApp.y + TIP.h / 2) * CS };
  /* C: Tag */
  const dayA = prog(f, sec(5.88), sec(0.3), OUT); const DP = V ? { w: 760, h: 1090, s: 1.2 } : { w: 1200, h: 650, s: 1.15 };
  const push = lerp(1, 1.07, prog(f, sec(5.9), sec(3.8), (x) => x));
  const lift = prog(f, sec(6.9), sec(0.5), SIG);
  const FG = 'Forget'; const fn = t < 5.95 ? 0 : Math.min(FG.length, Math.floor((t - 5.95) / 0.08) + 1);
  const subIn = prog(f, sec(6.75), sec(0.35), SOFT);
  const wipe = prog(f, sec(9.45), sec(0.25), IN);
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Bg f={f} kind="night" />
      {dashA > 0 ? (
        <>
          <AbsoluteFill style={{ perspective: 2400, opacity: dashA }}>
            <div style={{ position: 'absolute', left: 0, top: 0, width: 1440, height: 900, transformOrigin: '0 0',
              transform: `translate(${cx}px, ${dy + (1 - up) * H * 0.8 + (cy - dy) * zk}px) rotateX(${(5 * tilt * (1 - zk)).toFixed(2)}deg) scale(${DS * z}) translate(${-px}px, ${-py}px)` }}>
              <DashboardPanel f={f} />
            </div>
          </AbsoluteFill>
          {headA > 0 ? (
            <div style={{ position: 'absolute', left: 0, right: 0, top: V ? 250 : 64, textAlign: 'center', ...big(V ? 90 : 84, LIGHT), opacity: headA }}>
              <span style={{ display: 'inline-block', opacity: clamp01(up * 2) }}>All</span>{' '}
              <MaskSwap f={f} enter={sec(0.35)} at={sec(2.3)} from={<>your <span style={{ color: GREEN }}>trades</span></>} to={<>in one <span style={{ color: GREEN }}>place</span></>} />
            </div>
          ) : null}
        </>
      ) : null}

      {cal > 0 && t < 6.2 ? (
        <AbsoluteFill style={{ opacity: cal * (1 - calZ), transformOrigin: `${calOrigin.x}px ${calOrigin.y}px`, transform: `scale(${lerp(1.06, 1, cal) * zoomLerp(1, 3, calZ)})`, filter: calZ > 0 ? `blur(${(calZ * 12).toFixed(1)}px)` : undefined }}>
          <div style={{ position: 'absolute', left: calX, top: calY, width: L.CW, height: L.CH, transformOrigin: '0 0', transform: `scale(${CS})` }}>
            <Calendar V={V} hover={prog(f, sec(4.7), sec(0.2))} />
            {tipK > 0.001 ? <div style={{ position: 'absolute', left: tipApp.x, top: tipApp.y, transformOrigin: '30% 100%', transform: `scale(${tipK})`, opacity: clamp01(tipK * 3) }}><Tooltip pressed={t >= CLICK && t < CLICK + 0.15} /></div> : null}
          </div>
          <Hand x={hand.x} y={hand.y} clickAge={f - sec(CLICK)} size={V ? 100 : 88} opacity={prog(f, sec(4.15), sec(0.15)) * (1 - prog(f, sec(5.6), sec(0.15)))} />
        </AbsoluteFill>
      ) : null}

      {dayA > 0 ? (
        <AbsoluteFill style={{ opacity: dayA * (1 - wipe) }}>
          <AbsoluteFill style={{ background: 'radial-gradient(1100px 700px at 50% 60%, rgba(52,245,138,0.14), transparent 70%)' }} />
          <div style={{ position: 'absolute', left: cx - (DP.w * DP.s) / 2, top: (V ? cy + 170 : cy + 70) - (DP.h * DP.s) / 2, width: DP.w, height: DP.h, transformOrigin: '50% 40%', transform: `scale(${DP.s * push * lerp(1.15, 1, dayA)})` }}>
            <DayPanel V={V} lift={lift} />
          </div>
          <div style={{ position: 'absolute', left: V ? 70 : 110, top: V ? 150 : 40, display: 'flex', alignItems: 'baseline', gap: V ? 0 : 28, flexDirection: V ? 'column' : 'row' }}>
            <div style={big(V ? 104 : 96, LIGHT)}>{[...FG].map((c, i) => <span key={i} style={{ opacity: i < fn ? 1 : 0 }}>{c}</span>)}{t < 6.75 ? <Caret f={f} typing={fn < FG.length} /> : null}</div>
            <div style={{ ...big(V ? 60 : 54, GREEN, 600), opacity: clamp01(subIn * 1.6), filter: subIn < 1 ? `blur(${lerp(10, 0, subIn).toFixed(1)}px)` : undefined }}>
              <MaskSwap f={f} enter={sec(6.75)} at={sec(7.6)} from={<>messy spreadsheets.</>} to={<>forgotten lessons.</>} />
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
      {wipe > 0 ? <AbsoluteFill style={{ background: '#050605', clipPath: `inset(0 0 ${((1 - wipe) * 100).toFixed(2)}% 0)` }} /> : null}
    </AbsoluteFill>
  );
};
