/* Produkt-Szenen mit eigenen, hellen Karten (echte Werte aus der App): Dashboard, Trade loggen, TradeLog, Regeln, Shadow Self */
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { clamp01, FPS, IN, lerp, OUT, pop, prog, sec, SIG, zoomLerp } from '../anim';
import { cumulative, dash, num, rows, rules, shadow, trade } from '../app';
import { big, DISPLAY } from '../theme';
import { Bg } from '../ui/Bg';
import { CursorView, cursorAt } from '../ui/Cursor';
import { AreaChart, Bars, Card, cardShadow, Check, Field, Gauge, K, Label, lerpColor, lineEnds, Lines, Num, Pill, Ring, Split, usd } from '../ui/Kit';
import { JMark } from '../ui/Logo';
import { BlurText } from '../ui/Text';

/* Kurz herausragen: hoch (ease-out), kurz halten, zurück (Signatur-Kurve) */
const bump = (f: number, at: number) => prog(f, sec(at), sec(0.22), OUT) * (1 - prog(f, sec(at + 0.5), sec(0.4), SIG));
/* Karte baut sich auf: von leicht unten, leicht kleiner */
const enter = (f: number, at: number) => { const a = prog(f, sec(at), sec(0.35), OUT); return { opacity: a, transform: `translateY(${lerp(26, 0, a).toFixed(2)}px) scale(${lerp(0.97, 1, a).toFixed(4)})` }; };

const Icon: React.FC<{ i: number; color: string }> = ({ i, color }) => {
  const p = { fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <svg width="22" height="22" viewBox="0 0 24 24">
      {i === 0 ? <><rect x="3.5" y="3.5" width="7" height="7" rx="2" {...p} /><rect x="13.5" y="3.5" width="7" height="7" rx="2" {...p} /><rect x="3.5" y="13.5" width="7" height="7" rx="2" {...p} /><rect x="13.5" y="13.5" width="7" height="7" rx="2" {...p} /></> : null}
      {i === 1 ? <path d="M3 17l5-5 4 3 8-8" {...p} /> : null}
      {i === 2 ? <><path d="M5 7h14M5 12h14M5 17h9" {...p} /></> : null}
      {i === 3 ? <><rect x="4" y="5" width="16" height="15" rx="3" {...p} /><path d="M8 3v4M16 3v4M4 10h16" {...p} /></> : null}
      {i === 4 ? <><circle cx="9" cy="12" r="5" {...p} /><circle cx="15" cy="12" r="5" {...p} opacity={0.5} /></> : null}
      {i === 5 ? <path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z" {...p} /> : null}
    </svg>
  );
};

/* Das Dashboard als helles Fenster, 1440 × 900. pops: wie weit jede Karte gerade herausragt (0…1) */
export const DashboardPanel: React.FC<{ f: number; still?: boolean; pops?: Record<string, number> }> = ({ f, still, pops = {} }) => {
  const e = (at: number) => (still ? {} : enter(f, at));
  const t = (at: number, d: number) => (still ? 1 : prog(f, sec(at), sec(d), SIG));
  const lift = (k: string) => pops[k] ?? 0;
  const liftStyle = (k: string): React.CSSProperties => ({ transform: `translateZ(${(lift(k) * 90).toFixed(2)}px) scale(${(1 + lift(k) * 0.035).toFixed(4)})`, boxShadow: cardShadow(lift(k)) });
  const x = [124, 452, 780, 1108], kw = 308;
  const netV = num(dash.net) * (still ? 1 : prog(f, sec(0.15), sec(0.9), OUT));
  return (
    <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', fontFamily: DISPLAY }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: 30, background: K.bg, border: `1px solid ${K.line}`, boxShadow: '0 90px 140px -50px rgba(6,40,20,0.45)' }} />
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 92, borderRadius: '30px 0 0 30px', background: '#fff', borderRight: `1px solid ${K.line}` }}>
        <div style={{ position: 'absolute', left: 24, top: 28, width: 44, height: 44, borderRadius: 13, background: '#141414', display: 'grid', placeItems: 'center' }}><JMark size={28} /></div>
        {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} style={{ position: 'absolute', left: 24, top: 118 + i * 62, width: 44, height: 44, borderRadius: 13, display: 'grid', placeItems: 'center', background: i === 0 ? K.accentSoft : 'transparent' }}><Icon i={i} color={i === 0 ? K.accent : K.faint} /></div>)}
      </div>
      <div style={{ position: 'absolute', left: 124, top: 32, ...big(34, K.text, 700), letterSpacing: '-0.025em' }}>Dashboard</div>
      <div style={{ position: 'absolute', right: 24, top: 30, display: 'flex', gap: 12 }}>
        <div style={{ height: 46, padding: '0 18px', borderRadius: 13, border: `1px solid ${K.line}`, background: '#fff', display: 'flex', alignItems: 'center', fontSize: 17, fontWeight: 600, color: K.text2 }}>September 2026</div>
        <div style={{ height: 46, padding: '0 20px', borderRadius: 13, background: K.accent, display: 'flex', alignItems: 'center', fontSize: 17, fontWeight: 700, color: '#fff' }}>+ Log trade</div>
      </div>

      <Card x={x[0]} y={104} w={kw} h={156} style={{ ...e(0.05), ...liftStyle('net') }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><Label>Net P&L</Label><Label style={{ fontSize: 15 }}>{dash.trades}</Label></div>
        <Num size={46} color={K.accent} style={{ marginTop: 16 }}>{usd(netV)}</Num>
        <Label style={{ fontSize: 15, marginTop: 10 }}>{dash.avg}</Label>
      </Card>
      <Card x={x[1]} y={104} w={kw} h={156} style={{ ...e(0.1), ...liftStyle('win') }}>
        <Label>Trade win rate</Label>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 18 }}>
          <Num size={46}>{dash.winRate}</Num><Gauge p={dash.wins / (dash.wins + dash.losses)} t={t(0.3, 0.7)} size={100} />
        </div>
      </Card>
      <Card x={x[2]} y={104} w={kw} h={156} style={{ ...e(0.15), ...liftStyle('pf') }}>
        <Label>Profit factor</Label>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
          <Num size={46}>{dash.pf}</Num><Ring p={num(dash.pf) / (num(dash.pf) + 1)} t={t(0.35, 0.7)} size={86} />
        </div>
      </Card>
      <Card x={x[3]} y={104} w={kw} h={156} style={{ ...e(0.2), ...liftStyle('awl') }}>
        <Label>Avg win/loss</Label>
        <Num size={46} style={{ marginTop: 12 }}>{dash.awl}</Num>
        <div style={{ marginTop: 14 }}><Split p={num(dash.awl) / (num(dash.awl) + 1)} t={t(0.4, 0.6)} w={kw - 52} /></div>
      </Card>

      <Card x={124} y={280} w={852} h={360} style={{ ...e(0.25), ...liftStyle('chart') }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-0.01em' }}>Cumulative P&L</div>
          <Num size={22} color={K.accent}>+{dash.net}</Num>
        </div>
        <div style={{ position: 'absolute', left: 26, top: 84 }}><AreaChart values={[0, ...cumulative]} w={800} h={244} t={t(0.35, 1.0)} id="cum" /></div>
      </Card>
      <Card x={996} y={280} w={420} h={360} style={{ ...e(0.3), ...liftStyle('score') }}>
        <Label>Overall score</Label>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 34 }}><Num size={110}>{dash.score}</Num><Label style={{ fontSize: 24 }}>/ 100</Label></div>
        <div style={{ position: 'relative', marginTop: 40, height: 12, borderRadius: 6, background: `linear-gradient(90deg, ${K.loss}, ${K.warn} 50%, ${K.accent})`, opacity: 0.9 }}>
          <div style={{ position: 'absolute', top: -6, left: `calc(${(dash.score * t(0.4, 0.8)).toFixed(2)}% - 12px)`, width: 24, height: 24, borderRadius: 12, background: '#fff', border: `4px solid ${K.text}` }} />
        </div>
      </Card>
      <Card x={124} y={660} w={1292} h={212} style={{ ...e(0.35), ...liftStyle('bars') }}>
        <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-0.01em' }}>Net P&L per day</div>
        <div style={{ position: 'absolute', left: 26, top: 66 }}><Bars values={dash.days} w={1240} h={126} t={t(0.45, 0.8)} /></div>
      </Card>
    </div>
  );
};

/* Fenster im Raum */
const Tilt: React.FC<{ rx: number; rz: number; s: number; ty: number; cx?: number; cy?: number; children: React.ReactNode; opacity?: number }> = ({ rx, rz, s, ty, cx = 720, cy = 450, children, opacity = 1 }) => (
  <AbsoluteFill style={{ perspective: 2600, opacity }}>
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1440, height: 900, transformOrigin: '0 0', transformStyle: 'preserve-3d', transform: `translate(960px, ${540 + ty}px) rotateX(${rx}deg) rotateZ(${rz}deg) scale(${s}) translate(${-cx}px, ${-cy}px)` }}>
      {children}
    </div>
  </AbsoluteFill>
);

export const Dashboard: React.FC = () => {
  const f = useCurrentFrame(); const t = prog(f, 0, sec(2.6), SIG);
  const pops = { net: bump(f, 0.65), pf: bump(f, 0.9), chart: bump(f, 1.15) };
  return (
    <AbsoluteFill>
      <Bg f={f} kind="mint" />
      <Tilt rx={lerp(30, 20, t)} rz={lerp(-12, -7, t)} s={lerp(0.98, 1.05, t)} ty={115} cx={lerp(690, 640, t)} cy={lerp(470, 420, t)} opacity={prog(f, 0, sec(0.2), OUT)}>
        <DashboardPanel f={f} pops={pops} />
      </Tilt>
      <div style={{ position: 'absolute', left: 120, top: 96, ...big(70), lineHeight: 1.06 }}>
        <BlurText f={f} text="Built for" start={sec(0.3)} stagger={0.07} />{'\n'}
        <BlurText f={f} text="serious traders" start={sec(0.45)} stagger={0.07} />
      </div>
    </AbsoluteFill>
  );
};

/* Trade loggen: eine klare Karte, Felder füllen sich schnell nacheinander, dann Speichern */
const typed = (t: number, start: number, len: number, per = 0.045) => (t < start ? 0 : Math.min(len, Math.floor((t - start) / per) + 1));
export const LogTrade: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS;
  const W = 900, H = 448, X = (1920 - W) / 2, Y = (1080 - H) / 2;
  const inA = prog(f, 0, sec(0.4), OUT); const out = prog(f, sec(2.55), sec(0.45), IN);
  const sym = typed(t, 0.3, trade.symbol.length, 0.07), en = typed(t, 0.72, trade.entry.length), ex = typed(t, 1.12, trade.exit.length), q = typed(t, 1.55, trade.qty.length);
  const focus = (a: number, b: number) => prog(f, sec(a), sec(0.12), OUT) * (1 - prog(f, sec(b), sec(0.12), OUT));
  const caretOn = true; /* tippt durchgehend, der Cursor steht still */
  const side = prog(f, sec(0.48), sec(0.28), SIG);
  const res = prog(f, sec(1.68), sec(0.4), OUT);
  const pnl = num(trade.pnl) * prog(f, sec(1.68), sec(0.5), OUT);
  const save = { x: X + W - 40 - 220 / 2, y: Y + H - 40 - 64 / 2 };
  const cur = cursorAt(f, [{ at: 0, x: 1500, y: 900 }, { at: sec(1.55), x: save.x + 10, y: save.y + 8, dur: sec(0.55), click: true }]);
  const clickAt = 2.1; const press = t >= clickAt && t < clickAt + 0.14; const saved = prog(f, sec(clickAt + 0.12), sec(0.25), OUT);
  const fw = (W - 80 - 40) / 3;
  return (
    <AbsoluteFill>
      <Bg f={f} kind="mint" />
      <AbsoluteFill style={{ transform: `scale(${1.32 * zoomLerp(1, 1.04, prog(f, 0, sec(3), SIG))})` }}>
        <div style={{ position: 'absolute', left: X, top: Y, width: W, height: H, borderRadius: 30, background: '#fff', border: `1px solid ${K.line}`, boxShadow: '0 80px 120px -50px rgba(6,40,20,0.45), 0 2px 6px rgba(6,40,20,0.05)', padding: 40, boxSizing: 'border-box', fontFamily: DISPLAY,
          opacity: inA, filter: inA < 1 ? `blur(${lerp(12, 0, inA).toFixed(2)}px)` : undefined, transform: `perspective(2000px) rotateX(${lerp(12, 0, inA)}deg) translateY(${(lerp(50, 0, inA) - out * 40).toFixed(2)}px) scale(${(1 - out * 0.03).toFixed(4)})` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ ...big(34, K.text, 700), letterSpacing: '-0.025em' }}>Log trade</div>
            <svg width="22" height="22" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke={K.faint} strokeWidth="2.4" strokeLinecap="round" /></svg>
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 26 }}>
            <Field label="Symbol" value={trade.symbol} n={sym} focus={focus(0.25, 0.45)} caretOn={caretOn} w={W - 80 - 20 - 300}
              suffix={<svg width="18" height="18" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" fill="none" stroke={K.muted} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>} />
            <div style={{ width: 300 }}>
              <Label style={{ marginBottom: 10 }}>Side</Label>
              <div style={{ position: 'relative', height: 64, borderRadius: 16, background: K.soft, border: `1.5px solid ${K.line}`, boxSizing: 'border-box', display: 'flex' }}>
                <div style={{ position: 'absolute', top: 5, bottom: 5, width: 142, left: lerp(151, 5, side), borderRadius: 12, background: '#fff', boxShadow: '0 4px 12px -4px rgba(13,40,24,0.25)' }} />
                {['Long', 'Short'].map((s, i) => <div key={s} style={{ position: 'relative', flex: 1, display: 'grid', placeItems: 'center', fontSize: 21, fontWeight: 700, color: i === 0 ? lerpColor(K.muted, K.accent, side) : lerpColor(K.text2, K.muted, side) }}>{s}</div>)}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 22 }}>
            <Field label="Entry" value={trade.entry} n={en} focus={focus(0.62, 1.07)} caretOn={caretOn} w={fw} />
            <Field label="Exit" value={trade.exit} n={ex} focus={focus(1.07, 1.5)} caretOn={caretOn} w={fw} />
            <Field label="Contracts" value={trade.qty} n={q} focus={focus(1.5, 1.68)} caretOn={caretOn} w={fw} />
          </div>
          <div style={{ position: 'absolute', left: 40, right: 40, bottom: 40, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: res, filter: res < 1 ? `blur(${lerp(10, 0, res).toFixed(2)}px)` : undefined }}>
              <Label>Net P&L</Label><Num size={40} color={K.accent}>{usd(pnl, true)}</Num><Pill tone="green" size={17}>{trade.r}</Pill><Pill tone="neutral" size={17}>Discipline {trade.discipline}</Pill>
            </div>
            <div style={{ width: 220, height: 64, borderRadius: 16, background: K.accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 21, fontWeight: 700, transform: `scale(${press ? 0.95 : 1})`, boxShadow: '0 14px 28px -14px rgba(15,184,98,0.8)' }}>
              {saved > 0 ? <><svg width="22" height="22" viewBox="0 0 24 24" style={{ transform: `scale(${pop(f, sec(clickAt + 0.12))})` }}><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" /></svg>Saved</> : 'Save trade'}
            </div>
          </div>
        </div>
        <CursorView x={cur.x} y={cur.y} clickAge={cur.clickAge} opacity={prog(f, sec(1.5), sec(0.2)) * (1 - out)} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* TradeLog: der neue Trade rutscht oben hinein */
const COLS = [{ k: 'date', x: 0, w: 250 }, { k: 'symbol', x: 270, w: 110 }, { k: 'side', x: 390, w: 150 }, { k: 'setup', x: 560, w: 210 }, { k: 'pnl', x: 800, w: 210, right: true }, { k: 'r', x: 1030, w: 150, right: true }, { k: 'rules', x: 1250, w: 120 }];
const HEAD: Record<string, string> = { date: 'Date', symbol: 'Symbol', side: 'Side', setup: 'Setup', pnl: 'P&L', r: 'R', rules: 'Rules' };
const tone = (v: string) => (/^\+/.test(v) ? K.accent : /^[−-]/.test(v) ? K.loss : K.faint);
const Row: React.FC<{ r: (typeof rows)[number] }> = ({ r }) => (
  <>
    {COLS.map((c) => (
      <div key={c.k} style={{ position: 'absolute', left: c.x, width: c.w, top: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: c.right ? 'flex-end' : 'flex-start' }}>
        {c.k === 'date' ? <span style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 500, color: K.text2 }}>{r.date}</span> : null}
        {c.k === 'symbol' ? <span style={{ fontFamily: DISPLAY, fontSize: 21, fontWeight: 700 }}>{r.symbol}</span> : null}
        {c.k === 'side' ? <Pill tone={r.side === 'LONG' ? 'green' : 'red'} size={15}>{r.side === 'LONG' ? '↗' : '↘'} {r.side}</Pill> : null}
        {c.k === 'setup' ? <Pill tone="neutral" size={16}>{r.setup}</Pill> : null}
        {c.k === 'pnl' ? <Num size={22} color={tone(r.pnl)} style={{ fontWeight: 600 }}>{r.pnl}</Num> : null}
        {c.k === 'r' ? <Num size={22} color={tone(r.r)} style={{ fontWeight: 600 }}>{r.r}</Num> : null}
        {c.k === 'rules' ? <svg width="26" height="26" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={K.accent} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" /></svg> : null}
      </div>
    ))}
  </>
);
export const TradeLog: React.FC = () => {
  const f = useCurrentFrame();
  const W = 1500, RH = 78, HY = 110, X = (1920 - W) / 2, H = HY + 54 + RH * 6 + 20, Y = (1080 - H) / 2;
  const push = prog(f, sec(0.15), sec(0.45), SIG); const add = prog(f, sec(0.38), sec(0.4), OUT); const glow = add * (1 - prog(f, sec(1.3), sec(0.5)));
  const cam = zoomLerp(1.06, 1.18, prog(f, 0, sec(2), SIG));
  return (
    <AbsoluteFill>
      <Bg f={f} kind="mint" />
      <AbsoluteFill style={{ transform: `scale(${cam})`, transformOrigin: `${X + 400}px ${Y + HY + 54 + RH / 2}px` }}>
        <div style={{ position: 'absolute', left: X, top: Y, width: W, height: H, borderRadius: 30, background: '#fff', border: `1px solid ${K.line}`, boxShadow: '0 80px 120px -50px rgba(6,40,20,0.4)', fontFamily: DISPLAY, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 36, top: 34, display: 'flex', alignItems: 'baseline', gap: 16 }}><div style={{ ...big(34, K.text, 700), letterSpacing: '-0.025em' }}>TradeLog</div><Label>{shadow.actualTrades}</Label></div>
          <div style={{ position: 'absolute', left: 36, right: 36, top: HY, height: 54, borderBottom: `1px solid ${K.line}` }}>
            {COLS.map((c) => <div key={c.k} style={{ position: 'absolute', left: c.x, width: c.w, top: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: c.right ? 'flex-end' : 'flex-start' }}><Label style={{ fontSize: 16 }}>{HEAD[c.k]}</Label></div>)}
          </div>
          <div style={{ position: 'absolute', left: 36, right: 36, top: HY + 54, height: RH * 6, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: -12, right: -12, top: 6, height: RH - 12, borderRadius: 16, background: K.accentSoft, opacity: glow }} />
            <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: RH, opacity: add, transform: `translateX(${lerp(-40, 0, add)}px)` }}><Row r={rows[0]} /></div>
            {rows.slice(1).map((r, i) => (
              <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: RH * (i + 1), height: RH, borderTop: `1px solid ${K.line}`, transform: `translateY(${lerp(-RH, 0, push).toFixed(2)}px)` }}><Row r={r} /></div>
            ))}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* Regeln: links der neue Trade, rechts werden die drei aktiven Regeln abgehakt */
export const RuleCheck: React.FC = () => {
  const f = useCurrentFrame();
  const inL = prog(f, 0, sec(0.45), OUT); const result = 1.85;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, #f8fbf9, #ebf4ee)' }} />
      <div style={{ position: 'absolute', left: 960, top: 0, width: 960, height: 1080, overflow: 'hidden' }}><div style={{ position: 'absolute', left: -960, top: 0, width: 1920, height: 1080 }}><Bg f={f} kind="dark" /></div></div>
      <Card x={240} y={330} w={480} h={420} style={{ padding: 36, opacity: inL, transform: `perspective(2000px) translateX(${lerp(-60, 0, inL)}px) rotateY(${lerp(14, 6, prog(f, 0, sec(3), SIG))}deg)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}><Num size={44}>{trade.symbol}</Num><Pill tone="green" size={16}>↗ LONG</Pill></div>
        <Label style={{ marginTop: 12 }}>{rows[0].date}</Label>
        <Num size={76} color={K.accent} style={{ marginTop: 56 }}>{trade.pnl}</Num>
        <div style={{ display: 'flex', gap: 10, marginTop: 30 }}><Pill tone="green" size={17}>{trade.r}</Pill><Pill size={17}>{rows[0].setup}</Pill><Pill size={17}>{trade.qty} contracts</Pill></div>
      </Card>
      <div style={{ position: 'absolute', left: 1060, top: 150, ...big(48, '#fff', 600), letterSpacing: '-0.02em' }}>
        <BlurText f={f} text="Checking your rules" start={sec(0.12)} stagger={0.06} />
        <span style={{ opacity: f < sec(result) ? 1 : 0 }}>{['.', '.', '.'].map((d, i) => <span key={i} style={{ opacity: f > sec(0.5) ? 0.35 + 0.65 * clamp01(Math.sin((f - sec(0.5)) / 7 - i * 0.9)) : 0 }}>{d}</span>)}</span>
      </div>
      {rules.map((r, i) => {
        const a = prog(f, sec(0.25 + i * 0.1), sec(0.45), OUT); const at = sec(0.75 + i * 0.35);
        return (
          <div key={r.name} style={{ position: 'absolute', left: 1060, top: 262 + i * 166, display: 'flex', alignItems: 'center', gap: 26, opacity: a, transform: `translateX(${lerp(80, 0, a)}px)` }}>
            <Check f={f} at={at} done={pop(f, at, { damping: 11, stiffness: 190 })} dark />
            <div style={{ position: 'relative', width: 680, height: 130, borderRadius: 22, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', padding: '26px 30px', boxSizing: 'border-box', fontFamily: DISPLAY }}>
              <div style={{ fontSize: 28, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em' }}>{r.name}</div>
              <div style={{ fontSize: 19, fontWeight: 500, color: 'rgba(255,255,255,0.5)', marginTop: 8 }}>{r.hint}</div>
              <div style={{ position: 'absolute', right: 26, top: 40, padding: '9px 18px', borderRadius: 12, background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 20, fontWeight: 600 }}>{r.value} {String(r.unit).toLowerCase()}</div>
            </div>
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 1060, top: 790, display: 'flex', alignItems: 'center', gap: 22 }}>
        <div style={big(46, '#fff', 700)}><BlurText f={f} text="Followed your plan" start={sec(result)} stagger={0.06} /></div>
        <div style={{ padding: '10px 22px', borderRadius: 999, background: '#34f58a', color: '#04140a', fontFamily: DISPLAY, fontSize: 24, fontWeight: 700, opacity: prog(f, sec(result + 0.3), sec(0.25), OUT), transform: `scale(${lerp(0.7, 1, pop(f, sec(result + 0.3), { damping: 12 }))})` }}>Discipline {trade.discipline}</div>
      </div>
    </AbsoluteFill>
  );
};

/* Shadow Self: drei Kennzahlen, darunter echt gegen Schatten-Ich; am Ende der Abstand als Preis */
export const ShadowSelf: React.FC = () => {
  const f = useCurrentFrame();
  const KW = 410, gap = 30, x0 = (1920 - (3 * KW + 2 * gap)) / 2, CW = 3 * KW + 2 * gap;
  const LW = CW - 80, LH = 400;
  const draw = prog(f, sec(0.25), sec(1.6), SIG);
  const cost = num(shadow.cost) * prog(f, sec(0.3), sec(1.4), OUT);
  const ends = lineEnds(shadow.real, shadow.ideal, LW, LH); const gapA = pop(f, sec(1.95), { damping: 14 });
  const push = zoomLerp(1, 1.05, prog(f, 0, sec(3.2), SIG)) * zoomLerp(1, 1.18, prog(f, sec(3.1), sec(0.45), IN));
  const tiles = [
    { label: 'Discipline cost', value: usd(cost), color: K.loss, sub: 'What breaking your rules cost you' },
    { label: 'Actual', value: shadow.actual, color: K.text, sub: shadow.actualTrades },
    { label: 'Shadow Self', value: shadow.self, color: K.accent, sub: shadow.selfSub },
  ];
  return (
    <AbsoluteFill>
      <Bg f={f} kind="mint" />
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        {tiles.map((c, i) => (
          <Card key={i} x={x0 + i * (KW + gap)} y={110} w={KW} h={170} style={enter(f, i * 0.07)}>
            <Label>{c.label}</Label>
            <Num size={52} color={c.color} style={{ marginTop: 14 }}>{c.value}</Num>
            <Label style={{ fontSize: 15, marginTop: 10 }}>{c.sub}</Label>
          </Card>
        ))}
        <Card x={x0} y={310} w={CW} h={640} style={enter(f, 0.15)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 23, fontWeight: 700, letterSpacing: '-0.01em' }}>Equity: actual vs. Shadow Self</div>
            <div style={{ display: 'flex', gap: 22 }}>
              <Label style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 12, height: 12, borderRadius: 6, background: '#a3aca5' }} />Actual</Label>
              <Label style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 12, height: 12, borderRadius: 6, background: K.accent }} />Shadow Self</Label>
            </div>
          </div>
          <div style={{ position: 'absolute', left: 40, top: 150 }}>
            <Lines a={shadow.real} b={shadow.ideal} w={LW} h={LH} t={draw} />
            {gapA > 0.01 ? (
              <div style={{ position: 'absolute', left: ends.a[0], top: 0, opacity: Math.min(1, gapA * 1.4) }}>
                <div style={{ position: 'absolute', left: -1.5, top: ends.b[1] + 12, height: Math.max(0, ends.a[1] - ends.b[1] - 24) * gapA, width: 3, background: K.loss, borderRadius: 2 }} />
                <div style={{ position: 'absolute', right: 22, top: (ends.a[1] + ends.b[1]) / 2 - 22, transform: `scale(${gapA})`, transformOrigin: 'right center' }}><Pill tone="red" size={19}>−{shadow.cost}</Pill></div>
              </div>
            ) : null}
          </div>
        </Card>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
