/* Produkt-Teil im Design der Journalyst-App (vereinfacht), mit echten Werten.
   Ein durchgehender Ablauf ohne harte Schnitte: Dashboard → Klick auf „+ Log trade“, das Formular wächst aus dem Knopf →
   „Save trade“, das Formular schrumpft zur neuen Zeile im TradeLog → die Zeile wird zur Karte, rechts werden die Regeln abgehakt. */
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { clamp01, FPS, IN, lerp, OUT, pop, prog, sec, SIG, zoomLerp } from '../anim';
import { cumulative, dash, num, radar, rows, rules, shadow, trade } from '../app';
import { big, DISPLAY, LIGHT, NUM } from '../theme';
import { Bg } from '../ui/Bg';
import { CursorView, cursorAt } from '../ui/Cursor';
import { A, Badge, Btn, Card, CardTitle, Check, DayBars, Donut, Icon, lift, lerpColor, mix, mixA, PnlArea, Pill, Radar, ScoreScale, SemiGauge, shadowEnds, ShadowLines, Switch, TileHead, usd, Val } from '../ui/Kit';
import { useFormat } from '../format';
import { BlurText } from '../ui/Text';

type R = { x: number; y: number; w: number; h: number };
const rl = (a: R, b: R, t: number): R => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t) });
/* Kurz herausragen: hoch, halten, zurück */
const bump = (f: number, at: number) => prog(f, sec(at), sec(0.28), OUT) * (1 - prog(f, sec(at + 0.65), sec(0.45), SIG));
/* Karte baut sich auf */
const enter = (f: number, at: number): React.CSSProperties => { const a = prog(f, sec(at), sec(0.4), OUT); return { opacity: a, translate: `0px ${lerp(22, 0, a).toFixed(2)}px` }; };

/* ---------- Dashboard, 1440 × 900 App-Pixel ---------- */
const NAV = [['dashboard', 'Dashboard'], ['stats', 'Statistics'], ['tradelog', 'TradeLog'], ['journal', 'Notebook'], ['shadow', 'Shadow Self'], ['replay', 'Blind Replay'], ['prop', 'Prop Firms']];
export const LOG_BTN: R = { x: 1276, y: 86, w: 132, h: 40 };
export const DashboardPanel: React.FC<{ f: number; still?: boolean; pops?: Record<string, number> }> = ({ f, still, pops = {} }) => {
  const e = (at: number) => (still ? {} : enter(f, at));
  const t = (at: number, d: number) => (still ? 1 : prog(f, sec(at), sec(d), SIG));
  const L = (k: string) => lift(pops[k] ?? 0);
  const X = [252, 548, 844, 1140], KW = 280, KY = 144, KH = 128;
  const netV = num(dash.net) * (still ? 1 : prog(f, sec(0.2), sec(1.0), OUT));
  const pf = num(dash.pf);
  return (
    <div style={{ position: 'absolute', inset: 0, transformStyle: 'preserve-3d', fontFamily: DISPLAY, color: A.text }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: 18, background: `radial-gradient(1100px 640px at 14% -10%, rgba(255,238,218,.045), transparent 62%), ${A.bg}`, border: `1px solid ${A.border2}`, boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 60px 160px -40px rgba(52,245,138,0.22), 0 90px 140px -50px rgba(0,0,0,0.7)' }} />
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 220, borderRight: `1px solid ${A.border}` }}>
        <div style={{ position: 'absolute', left: 26, top: 26, fontSize: 15, fontWeight: 800, letterSpacing: '0.08em' }}>JOURNALYST</div>
        <div style={{ position: 'absolute', left: 26, top: 46, fontSize: 11.5, color: A.muted }}>Trading Journal App</div>
        {NAV.map(([ic, label], i) => (
          <div key={ic} style={{ position: 'absolute', left: 14, top: 96 + i * 44, width: 192, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 14, boxSizing: 'border-box',
            background: i === 0 ? A.surface : 'transparent', border: i === 0 ? `1px solid ${A.border2}` : '1px solid transparent', color: i === 0 ? A.text : A.text2, fontSize: 14, fontWeight: i === 0 ? 600 : 500 }}>
            {i === 0 ? <div style={{ position: 'absolute', left: -14, top: 8, bottom: 8, width: 3, borderRadius: 2, background: A.accent, boxShadow: `0 0 8px ${A.accentGlow}` }} /> : null}
            <Icon name={ic} size={18} color={i === 0 ? A.text : A.muted} />{label}
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 220, right: 0, top: 0, height: 64, borderBottom: `1px solid ${A.border}` }}>
        <div style={{ position: 'absolute', left: 32, top: 18, fontSize: 21, fontWeight: 600, letterSpacing: '-0.01em' }}>Dashboard</div>
        <div style={{ position: 'absolute', right: 32, top: 14, width: 36, height: 36, borderRadius: 18, background: A.accent, color: A.ink, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 15, boxShadow: `0 0 14px ${A.accentGlow}` }}>T</div>
      </div>
      <div style={{ position: 'absolute', left: 252, top: 86, display: 'flex', gap: 10 }}>
        <Btn><Icon name="calendar" size={16} color={A.text2} />September 2026<Icon name="chev" size={14} color={A.muted} /></Btn>
        <Btn><Icon name="user" size={16} color={A.text2} />Main account<Icon name="chev" size={14} color={A.muted} /></Btn>
      </div>
      <Btn kind="accent" style={{ position: 'absolute', left: LOG_BTN.x, top: LOG_BTN.y, width: LOG_BTN.w, height: LOG_BTN.h }}><Icon name="plus" size={16} color={A.accent} />Log trade</Btn>

      <Card tile x={X[0]} y={KY} w={KW} h={KH} style={{ ...e(0.05), ...L('net') }}>
        <TileHead n={dash.trades}>Net P&L</TileHead>
        <Val color={A.accent} style={{ marginTop: 14 }}>{usd(netV)}</Val>
        <div style={{ fontSize: 12, color: A.muted, marginTop: 8 }}>{dash.avg}</div>
      </Card>
      <Card tile x={X[1]} y={KY} w={KW} h={KH} style={{ ...e(0.1), ...L('win') }}>
        <TileHead>Trade win rate</TileHead>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <Val>{dash.winRate}</Val>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <SemiGauge segs={[{ v: dash.wins, c: A.accent }, { v: 0, c: A.be }, { v: dash.losses, c: A.loss }]} t={t(0.3, 0.7)} size={96} />
            <span style={{ display: 'flex', gap: 5 }}><Pill tone="win" num size={11}>{dash.wins}</Pill><Pill tone="be" num size={11}>0</Pill><Pill tone="loss" num size={11}>{dash.losses}</Pill></span>
          </div>
        </div>
      </Card>
      <Card tile x={X[2]} y={KY} w={KW} h={KH} style={{ ...e(0.15), ...L('pf') }}>
        <TileHead>Profit factor</TileHead>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <Val>{dash.pf}</Val><Donut segs={[{ v: pf, c: A.accent }, { v: 1, c: A.loss }]} t={t(0.35, 0.7)} size={60} lw={9} />
        </div>
      </Card>
      <Card tile x={X[3]} y={KY} w={KW} h={KH} style={{ ...e(0.2), ...L('awl') }}>
        <TileHead>Avg win/loss</TileHead>
        <Val style={{ marginTop: 10 }}>{dash.awl}</Val>
        <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 12, width: (KW - 30) * t(0.4, 0.6) }}>
          <div style={{ flex: num(dash.avgWin), background: A.accent }} /><div style={{ width: 2 }} /><div style={{ flex: num(dash.avgLoss), background: A.loss }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, fontWeight: 700 }}><span style={{ color: A.accent }}>{dash.avgWin}</span><span style={{ color: A.loss }}>{dash.avgLoss}</span></div>
      </Card>

      <Card x={252} y={290} w={420} h={392} style={{ ...e(0.25), ...L('score') }}>
        <CardTitle>Overall score</CardTitle>
        <div style={{ position: 'absolute', left: 30, top: 50 }}><Radar axes={radar} t={t(0.4, 0.9)} size={220} /></div>
        <div style={{ position: 'absolute', left: 20, right: 20, bottom: 22, display: 'flex', alignItems: 'flex-end', gap: 18 }}>
          <div><div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: A.muted }}>YOUR SCORE</div><Val size={30} color={A.warn} style={{ letterSpacing: 0 }}>{dash.score}</Val></div>
          <div style={{ flex: 1, paddingBottom: 6 }}><ScoreScale p={dash.score * t(0.45, 0.9)} w={270} /></div>
        </div>
      </Card>
      <Card x={690} y={290} w={730} h={392} style={{ ...e(0.3), ...L('cum') }}>
        <CardTitle>Cumulative daily P&L</CardTitle>
        <div style={{ position: 'absolute', left: 14, top: 66 }}><PnlArea values={[0, ...cumulative]} w={690} h={270} t={t(0.4, 1.1)} id="cum" /></div>
      </Card>
      <Card x={252} y={700} w={1168} h={180} style={{ ...e(0.35), ...L('bars') }}>
        <CardTitle>Net P&L per day</CardTitle>
        <div style={{ position: 'absolute', left: 20, top: 52 }}><DayBars values={dash.days} w={1128} h={110} t={t(0.5, 0.9)} /></div>
      </Card>
    </div>
  );
};

/* ---------- Formular „Log trade“, 640 × 290 App-Pixel ---------- */
const Field: React.FC<{ x: number; y: number; w: number; label: string; value: string; n: number; focus: number; chev?: boolean }> = ({ x, y, w, label, value, n, focus, chev }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w }}>
    <div style={{ fontSize: 12, fontWeight: 600, color: A.muted, marginBottom: 6 }}>{label}</div>
    <div style={{ position: 'relative', height: 42, boxSizing: 'border-box', padding: '0 12px', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: A.field, border: `1px solid ${lerpColor(A.border2, A.accent, focus)}`, boxShadow: `0 0 0 ${(3 * focus).toFixed(2)}px ${A.accentSoft}` }}>
      <span style={{ fontSize: 13.5, fontWeight: chev ? 600 : 400, whiteSpace: 'pre' }}>
        {value.slice(0, n)}{focus > 0.5 ? <span style={{ display: 'inline-block', width: 1.5, height: 17, marginLeft: 1, verticalAlign: -3, background: A.accent }} /> : null}
      </span>
      {chev ? <Icon name="chev" size={16} color={A.muted} /> : null}
    </div>
  </div>
);
const DirSwitch: React.FC<{ x: number; y: number; w: number }> = ({ x, y, w }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: w }}>
    <div style={{ fontSize: 12, fontWeight: 600, color: A.muted, marginBottom: 6 }}>Side</div>
    <div style={{ position: 'relative', height: 42, boxSizing: 'border-box', padding: 3, borderRadius: 11, background: A.field, border: `1px solid ${A.border2}`, display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      <div style={{ position: 'absolute', top: 3, bottom: 3, left: 3, width: (w - 8) / 2, borderRadius: 9, background: `linear-gradient(90deg, ${mix(A.accent, 0.26, A.surface2)}, ${mix(A.accent, 0.07, A.surface2)} 85%)`, boxShadow: `inset 0 0 0 1px ${mixA(A.accent, 0.42)}, -6px 4px 18px -10px ${mixA(A.accent, 0.6)}` }} />
      {(['LONG', 'SHORT'] as const).map((d, i) => (
        <div key={d} style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13.5, fontWeight: 700, letterSpacing: '0.02em', color: i === 0 ? A.accent : A.muted }}>
          <span style={{ display: 'grid', placeItems: 'center', width: 20, height: 20, borderRadius: 10, background: i === 0 ? A.accent : A.surface3, boxShadow: i === 0 ? `0 0 10px ${mixA(A.accent, 0.5)}` : undefined }}><Icon name={i === 0 ? 'long' : 'short'} size={11} color={i === 0 ? A.bg : A.muted} sw={3} /></span>{i === 0 ? 'Long' : 'Short'}
        </div>
      ))}
    </div>
  </div>
);
const typed = (t: number, start: number, len: number, per = 0.05) => (t < start ? 0 : Math.min(len, Math.floor((t - start) / per) + 1));
type Times = typeof T;
const LogForm: React.FC<{ f: number; T: Times }> = ({ f, T }) => {
  const t = f / FPS;
  const focus = (a: number, b: number) => prog(f, sec(a), sec(0.12), OUT) * (1 - prog(f, sec(b), sec(0.12), OUT));
  const res = prog(f, sec(T.res), sec(0.4), OUT); const pnl = num(trade.pnl) * prog(f, sec(T.res), sec(0.6), OUT);
  const press = t >= T.save && t < T.save + 0.12; const saved = t >= T.save + 0.1;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 640, height: 290, fontFamily: DISPLAY, color: A.text }}>
      <div style={{ position: 'absolute', left: 24, top: 22, fontSize: 19, fontWeight: 600 }}>Log trade</div>
      <Icon name="close" size={18} color={A.muted} style={{ position: 'absolute', right: 24, top: 25 }} />
      <Field x={24} y={60} w={380} label="Symbol" value={trade.symbol} n={typed(t, T.sym, trade.symbol.length, 0.08)} focus={focus(T.sym - 0.1, T.entry - 0.1)} chev />
      <DirSwitch x={420} y={60} w={196} />
      <Field x={24} y={134} w={186} label="Entry" value={trade.entry} n={typed(t, T.entry, trade.entry.length)} focus={focus(T.entry - 0.1, T.exit - 0.1)} />
      <Field x={222} y={134} w={186} label="Exit" value={trade.exit} n={typed(t, T.exit, trade.exit.length)} focus={focus(T.exit - 0.1, T.qty - 0.05)} />
      <Field x={420} y={134} w={196} label="Contracts" value={trade.qty} n={typed(t, T.qty, trade.qty.length)} focus={focus(T.qty - 0.05, T.res)} />
      <div style={{ position: 'absolute', left: 24, right: 24, top: 214, borderTop: `1px solid ${A.border}` }} />
      <div style={{ position: 'absolute', left: 24, top: 236, display: 'flex', alignItems: 'center', gap: 10, opacity: res, filter: res < 1 ? `blur(${lerp(6, 0, res).toFixed(2)}px)` : undefined }}>
        <span style={{ fontSize: 12, color: A.muted }}>Net P&L</span><Val size={18} color={A.accent}>{usd(pnl, true)}</Val><Pill tone="win" num>{trade.r}</Pill><Pill tone="neutral">Discipline {trade.discipline}</Pill>
      </div>
      <Btn style={{ position: 'absolute', right: 154, top: 228, height: 40 }}>Cancel</Btn>
      <Btn kind="primary" style={{ position: 'absolute', right: 24, top: 228, width: 120, height: 40, transform: `scale(${press ? 0.97 : 1})`, boxShadow: `0 8px 20px -10px ${A.accentGlow}` }}>
        {saved ? <><Icon name="check" size={16} color={A.ink} sw={2.6} style={{ transform: `scale(${pop(f, sec(T.save + 0.1))})` }} />Saved</> : 'Save trade'}
      </Btn>
    </div>
  );
};

/* ---------- TradeLog: quer 1000 App-Pixel breit, hochkant 640 mit den wichtigsten Spalten ---------- */
type Col = { k: string; label: string; x: number; w: number; r?: boolean };
const COLS_V: Col[] = [
  { k: 'opened', label: 'Opened', x: 16, w: 150 }, { k: 'symbol', label: 'Symbol', x: 176, w: 60 }, { k: 'side', label: 'Side', x: 244, w: 96 },
  { k: 'pnl', label: 'P&L', x: 352, w: 110, r: true }, { k: 'r', label: 'RR', x: 472, w: 76, r: true }, { k: 'rules', label: 'Rules', x: 584, w: 44 },
];
const COLS: Col[] = [
  { k: 'opened', label: 'Opened', x: 16, w: 170 }, { k: 'symbol', label: 'Symbol', x: 196, w: 60 }, { k: 'status', label: 'Status', x: 262, w: 66 }, { k: 'side', label: 'Side', x: 336, w: 96 },
  { k: 'pnl', label: 'P&L', x: 470, w: 130, r: true }, { k: 'r', label: 'RR', x: 610, w: 90, r: true }, { k: 'setup', label: 'Setup', x: 740, w: 140 }, { k: 'rules', label: 'Rules', x: 900, w: 80 },
];
const tone = (v: string) => (/^\+/.test(v) ? A.accent : /^[−-]/.test(v) && v.length > 1 ? A.loss : A.faint);
const TradeRow: React.FC<{ r: (typeof rows)[number]; cols: Col[] }> = ({ r, cols }) => (
  <div style={{ position: 'absolute', inset: 0, fontFamily: DISPLAY, fontSize: 13, color: A.text }}>
    {cols.map((c) => (
      <div key={c.k} style={{ position: 'absolute', left: c.x, width: c.w, top: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: c.r ? 'flex-end' : 'flex-start', gap: 6, whiteSpace: 'nowrap', fontFamily: ['opened', 'pnl', 'r'].includes(c.k) ? NUM : DISPLAY, fontVariantNumeric: 'tabular-nums' }}>
        {c.k === 'opened' ? <>{r.day}<span style={{ color: A.muted }}>{r.time}</span></> : null}
        {c.k === 'symbol' ? <b style={{ fontWeight: 700 }}>{r.symbol}</b> : null}
        {c.k === 'status' ? <Pill tone={r.status === 'Win' ? 'win' : r.status === 'Loss' ? 'loss' : 'open'}>{r.status}</Pill> : null}
        {c.k === 'side' ? <Badge dir={r.side} /> : null}
        {c.k === 'pnl' ? <span style={{ color: tone(r.pnl) }}>{r.pnl}</span> : null}
        {c.k === 'r' ? <span style={{ color: tone(r.r) }}>{r.r}</span> : null}
        {c.k === 'setup' ? <Pill tone="win">{r.setup}</Pill> : null}
        {c.k === 'rules' ? <Icon name="check" size={16} color={A.accent} sw={2.4} /> : null}
      </div>
    ))}
  </div>
);
const TL = { title: 56, head: 40, row: 52 };
const TL_H = TL.title + TL.head + TL.row * 6 + 8;

/* ---------- Karte des Trades für die Regelprüfung, 300 × 250 App-Pixel ---------- */
const TradeCard: React.FC = () => (
  <div style={{ position: 'absolute', left: 0, top: 0, width: 300, height: 250, padding: '16px 18px', boxSizing: 'border-box', fontFamily: DISPLAY, color: A.text }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ fontSize: 20, fontWeight: 700 }}>{trade.symbol}</span><Badge dir="LONG" /><span style={{ marginLeft: 'auto' }}><Pill tone="win">{rows[0].status}</Pill></span></div>
    <div style={{ fontFamily: NUM, fontSize: 12, color: A.muted, marginTop: 8 }}>{rows[0].day} · {rows[0].time} → {rows[0].closed}</div>
    <div style={{ fontSize: 12, fontWeight: 600, color: A.text2, marginTop: 34 }}>Net P&L</div>
    <Val size={40} color={A.accent} style={{ marginTop: 4 }}>{trade.pnl}</Val>
    <div style={{ display: 'flex', gap: 6, marginTop: 22 }}><Pill tone="win" num>{trade.r}</Pill><Pill tone="win">{rows[0].setup}</Pill><Pill>{trade.qty} contracts</Pill></div>
  </div>
);

/* ---------- Eine aktive Regel wie in „My rule set“, 370 × 122 App-Pixel ---------- */
const RuleTile: React.FC<{ r: (typeof rules)[number] }> = ({ r }) => (
  <div style={{ position: 'relative', width: 370, height: 122, boxSizing: 'border-box', padding: '16px 18px', borderRadius: 14, fontFamily: DISPLAY, background: mix(A.accent, 0.06, A.surface), border: `1px solid ${mixA(A.accent, 0.35)}` }}>
    <div style={{ fontSize: 15, fontWeight: 700, color: A.text }}>{r.name}</div>
    <div style={{ fontSize: 13, color: A.muted, marginTop: 4 }}>{r.hint}</div>
    <div style={{ position: 'absolute', right: 18, top: 18 }}><Switch on /></div>
    <div style={{ position: 'absolute', left: 18, bottom: 14, width: 132, height: 38, borderRadius: 10, background: A.field, border: `1px solid ${A.border2}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', boxSizing: 'border-box' }}>
      <span style={{ fontFamily: NUM, fontSize: 15, fontWeight: 600 }}>{r.value}</span><span style={{ fontSize: 13, color: A.muted }}>{r.unit}</span>
    </div>
  </div>
);

/* ---------- Der durchgehende Ablauf ---------- */
const T = {
  pops: [0.9, 1.35, 1.8], headOut: 2.85, flat0: 3.0, flat1: 3.85, click: 4.0, open0: 4.05, open1: 4.6,
  sym: 4.8, entry: 5.15, exit: 5.65, qty: 6.15, res: 6.3, save: 7.3,
  b0: 7.7, b1: 8.5, c0: 10.8, c1: 11.6, ticks: [12.35, 12.75, 13.15], result: 13.6,
};
export const FLOW_DURATION = 15;
/* Lage aller Flächen: quer nebeneinander, hochkant übereinander */
const layout = (W: number, H: number, V: boolean) => {
  const FS = V ? 0.7 : 1.12; /* Maßstab des flachen Dashboards */
  const MS = V ? 1.55 : 1.7, MODAL: R = { x: (W - 640 * MS) / 2, y: (H - 290 * MS) / 2, w: 640 * MS, h: 290 * MS };
  const cols = V ? COLS_V : COLS; const tw = V ? 640 : 1000;
  const TS = V ? 1.55 : 1.5, TLR: R = { x: (W - tw * TS) / 2, y: (H - TL_H * TS) / 2, w: tw * TS, h: TL_H * TS };
  const ROW0: R = { x: TLR.x, y: TLR.y + (TL.title + TL.head) * TS, w: TLR.w, h: TL.row * TS };
  const CS = V ? 1.75 : 1.6, CARD: R = V ? { x: (W - 300 * CS) / 2, y: 190, w: 300 * CS, h: 250 * CS } : { x: 240, y: (H - 250 * CS) / 2, w: 300 * CS, h: 250 * CS };
  /* Regelprüfung: quer rechte Hälfte, hochkant unterer Teil (ab SPLIT), Gruppe mittig */
  const SPLIT = V ? 800 : W / 2; const rs = V ? 1.85 : 1.45; const gx = V ? (W - (44 + 26 + 370 * rs)) / 2 : 1040;
  const RULES = V ? { x: gx, title: 860, top: 960, step: 245, scale: rs, result: 1720 } : { x: gx, title: 140, top: 240, step: 190, scale: rs, result: 840 };
  return { FS, MS, MODAL, cols, tw, TS, TLR, ROW0, CS, CARD, RULES, SPLIT };
};

export const ProductFlow: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS;
  const { W, H, V, cx: CX, cy: CY } = useFormat();
  const { FS, MS, MODAL, cols, tw, TS, TLR, ROW0, CS, CARD, RULES, SPLIT } = layout(W, H, V);
  /* Dashboard schräg, dann flach (für den Klick) */
  const tilt = prog(f, 0, sec(T.flat0), SIG); const flat = prog(f, sec(T.flat0), sec(T.flat1 - T.flat0), SIG);
  const s0 = V ? [0.93, 0.99] : [0.98, 1.05]; const ty0 = V ? 230 : 115; const c0 = V ? [[530, 470], [500, 440]] : [[690, 470], [650, 430]];
  const pose = { rx: lerp(lerp(30, 21, tilt), 0, flat), rz: lerp(lerp(-12, -7, tilt), 0, flat), s: lerp(lerp(s0[0], s0[1], tilt), FS, flat), cx: lerp(lerp(c0[0][0], c0[1][0], tilt), 720, flat), cy: lerp(lerp(c0[0][1], c0[1][1], tilt), 450, flat), ty: lerp(ty0, 0, flat) };
  const scr = (x: number, y: number) => ({ x: CX + (x - 720) * FS, y: CY + (y - 450) * FS });
  const btnTL = scr(LOG_BTN.x, LOG_BTN.y); const BTN: R = { x: btnTL.x, y: btnTL.y, w: LOG_BTN.w * FS, h: LOG_BTN.h * FS };
  const pops = { net: bump(f, T.pops[0]), score: bump(f, T.pops[1]), cum: bump(f, T.pops[2]) };
  const dim = prog(f, sec(T.open0), sec(0.4), OUT);
  const dashOut = prog(f, sec(T.b0), sec(0.45), IN);

  /* TradeLog-Karte */
  const tlIn = prog(f, sec(T.b0), sec(0.5), OUT); const tlOut = prog(f, sec(T.c0), sec(0.4), IN);
  const push = zoomLerp(1, 1.05, prog(f, sec(T.b1), sec(T.c0 - T.b1), SIG)); const pushO = { x: ROW0.x + 260, y: ROW0.y + ROW0.h / 2 };
  const pushR = (r: R): R => ({ x: pushO.x + (r.x - pushO.x) * push, y: pushO.y + (r.y - pushO.y) * push, w: r.w * push, h: r.h * push });
  const shift = prog(f, sec(T.b0 + 0.3), sec(0.55), SIG);

  /* Die eine Fläche, die vom Knopf zum Formular, zur Zeile und zur Karte wird */
  let box: R = BTN, radius = 12 * FS, bg = mix(A.accent, 0.1, A.surface), border = mixA(A.accent, 0.45);
  if (t >= T.open0) { const k = prog(f, sec(T.open0), sec(T.open1 - T.open0), SIG); box = rl(BTN, MODAL, k); radius = lerp(12 * FS, 16 * MS, k); bg = lerpColor(mix(A.accent, 0.1, A.surface), A.surface, k); border = mixA(A.accent, lerp(0.45, 0, k)); }
  if (t >= T.open1) { box = MODAL; radius = 16 * MS; bg = A.surface; border = A.border2; }
  if (t >= T.b0 + 0.1) { const k = prog(f, sec(T.b0 + 0.1), sec(T.b1 - T.b0 - 0.1), SIG); box = rl(MODAL, ROW0, k); radius = lerp(16 * MS, 10, k); bg = lerpColor(A.surface, mix(A.accent, 0.1, A.surface), k); border = mixA(A.accent, lerp(0, 0.35, k)); }
  if (t >= T.b1) { box = pushR(ROW0); radius = 10; const g = prog(f, sec(9.7), sec(0.6)); bg = lerpColor(mix(A.accent, 0.1, A.surface), mix(A.accent, 0.05, A.surface), g); border = mixA(A.accent, 0.35); }
  if (t >= T.c0) { const k = prog(f, sec(T.c0), sec(T.c1 - T.c0), SIG); box = rl(pushR(ROW0), CARD, k); radius = lerp(10, 14 * CS, k); bg = lerpColor(mix(A.accent, 0.05, A.surface), A.surface, k); border = mixA(A.accent, lerp(0.35, 0.18, k)); }
  const visible = t >= T.open0;
  const formA = prog(f, sec(T.open0 + 0.3), sec(0.25), OUT) * (1 - prog(f, sec(T.b0), sec(0.18), IN));
  const rowA = prog(f, sec(T.b1 - 0.15), sec(0.2), OUT) * (1 - prog(f, sec(T.c0), sec(0.3), IN));
  const cardA = prog(f, sec(T.c1 - 0.45), sec(0.4), OUT);
  const boxLift = t >= T.c0 ? Math.sin(Math.PI * prog(f, sec(T.c0), sec(T.c1 - T.c0), SIG)) : 0;

  /* Cursor: Klick auf „+ Log trade“, später auf „Save trade“ */
  const saveC = { x: MODAL.x + (640 - 24 - 60) * MS, y: MODAL.y + (228 + 20) * MS };
  const rest = V ? [{ x: 820, y: 1500 }, { x: 860, y: 1560 }] : [{ x: 1500, y: 760 }, { x: 1500, y: 860 }];
  const cur = cursorAt(f, [{ at: 0, ...rest[0] }, { at: sec(3.3), x: BTN.x + BTN.w * 0.55, y: BTN.y + BTN.h * 0.6, dur: sec(0.65), click: true }, { at: sec(4.3), ...rest[1], dur: sec(0.8) }, { at: sec(6.6), x: saveC.x + 8, y: saveC.y + 6, dur: sec(0.65), click: true }]);
  const curA = prog(f, sec(3.25), sec(0.2)) * (1 - prog(f, sec(4.15), sec(0.2))) + prog(f, sec(6.55), sec(0.2)) * (1 - prog(f, sec(7.5), sec(0.2)));

  /* Regelprüfung rechts */
  const wipe = prog(f, sec(T.c0 + 0.1), sec(0.8), SIG);
  const headA = prog(f, sec(0.35), sec(0.3)) * (1 - prog(f, sec(T.headOut), sec(0.3), IN));
  return (
    <AbsoluteFill>
      <Bg f={f} kind="night" />
      {/* rechte (hochkant: untere) Hälfte wird zur dunklen Fläche mit grüner Kante */}
      <div style={{ position: 'absolute', left: V ? 0 : lerp(W, SPLIT, wipe), top: V ? lerp(H, SPLIT, wipe) : 0, right: 0, bottom: 0, overflow: 'hidden', borderLeft: V ? undefined : '1px solid rgba(52,245,138,0.28)', borderTop: V ? '1px solid rgba(52,245,138,0.28)' : undefined, boxShadow: '0 0 60px rgba(52,245,138,0.10)' }}><div style={{ position: 'absolute', right: 0, bottom: 0, width: W, height: H }}><Bg f={f} kind="dark" /></div></div>

      {dashOut < 1 ? (
        <AbsoluteFill style={{ perspective: 2600, opacity: prog(f, 0, sec(0.25), OUT) * (1 - dashOut) }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: 1440, height: 900, transformOrigin: '0 0', transformStyle: dim > 0 ? 'flat' : 'preserve-3d',
            transform: `translate(${CX}px, ${CY + pose.ty}px) rotateX(${pose.rx}deg) rotateZ(${pose.rz}deg) scale(${pose.s}) translate(${-pose.cx}px, ${-pose.cy}px)`, filter: dim > 0 ? `blur(${(dim * 4).toFixed(2)}px)` : undefined }}>
            <DashboardPanel f={f} pops={pops} />
            {dim > 0 ? <div style={{ position: 'absolute', inset: 0, borderRadius: 18, background: `rgba(0,0,0,${(dim * 0.6).toFixed(3)})` }} /> : null}
          </div>
        </AbsoluteFill>
      ) : null}
      <div style={{ position: 'absolute', left: V ? 80 : 120, top: V ? 190 : 96, ...big(V ? 84 : 70, LIGHT), lineHeight: 1.06, opacity: headA, filter: headA < 1 && t > 2 ? `blur(${((1 - headA) * 12).toFixed(2)}px)` : undefined }}>
        <BlurText f={f} text="Built for" start={sec(0.35)} stagger={0.07} />{'\n'}
        <BlurText f={f} text="serious traders" start={sec(0.5)} stagger={0.07} />
      </div>

      {tlIn > 0 && tlOut < 1 ? (
        <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, opacity: tlIn * (1 - tlOut), transform: `translateY(${lerp(30, 0, tlIn)}px) scale(${push * lerp(1, 0.98, tlOut)})`, transformOrigin: `${pushO.x}px ${pushO.y}px` }}>
          <div style={{ position: 'absolute', left: TLR.x, top: TLR.y, width: tw, height: TL_H, transformOrigin: '0 0', transform: `scale(${TS})`, background: A.surface, border: `1px solid ${A.border}`, borderRadius: 14, boxShadow: '0 60px 100px -40px rgba(6,40,20,0.55)', fontFamily: DISPLAY, color: A.text, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 20, top: 18, display: 'flex', alignItems: 'baseline', gap: 10 }}><span style={{ fontSize: 17, fontWeight: 600 }}>TradeLog</span><span style={{ fontSize: 12, color: A.muted }}>{shadow.actualTrades}</span></div>
            <div style={{ position: 'absolute', left: 0, right: 0, top: TL.title, height: TL.head, borderBottom: `1px solid ${A.border}` }}>
              {cols.map((c) => <div key={c.k} style={{ position: 'absolute', left: c.x, width: c.w, top: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: c.r ? 'flex-end' : 'flex-start', fontSize: 12, fontWeight: 600, color: A.muted }}>{c.label}{c.k === 'opened' ? <span style={{ color: A.accent, fontSize: 10, marginLeft: 4 }}>▼</span> : null}</div>)}
            </div>
            <div style={{ position: 'absolute', left: 0, right: 0, top: TL.title + TL.head, height: TL.row * 6, overflow: 'hidden' }}>
              {rows.slice(1).map((r, i) => (
                <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: TL.row * (i + 1), height: TL.row, borderTop: `1px solid ${A.border}`, transform: `translateY(${lerp(-TL.row, 0, shift).toFixed(2)}px)` }}><TradeRow r={r} cols={cols} /></div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {visible ? (
        <div style={{ position: 'absolute', left: box.x, top: box.y, width: box.w, height: box.h, borderRadius: radius, background: bg, border: `1px solid ${border}`, boxSizing: 'border-box', overflow: 'hidden',
          boxShadow: `0 ${30 + boxLift * 30}px ${80 + boxLift * 40}px -30px rgba(0,0,0,${(0.55 + boxLift * 0.2).toFixed(2)})`, transform: boxLift > 0 ? `scale(${1 + boxLift * 0.04})` : undefined }}>
          {formA > 0 ? <div style={{ position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `scale(${box.w / 640})`, opacity: formA }}><LogForm f={f} T={T} /></div> : null}
          {rowA > 0 ? <div style={{ position: 'absolute', left: 0, top: 0, width: tw, height: TL.row, transformOrigin: '0 0', transform: `scale(${box.w / tw})`, opacity: rowA }}><TradeRow r={rows[0]} cols={cols} /></div> : null}
          {cardA > 0 ? <div style={{ position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `scale(${box.w / 300})`, opacity: cardA }}><TradeCard /></div> : null}
        </div>
      ) : null}

      {wipe > 0 ? (
        <>
          <div style={{ position: 'absolute', left: RULES.x, top: RULES.title, ...big(46, '#fff', 600), letterSpacing: '-0.02em' }}>
            <BlurText f={f} text="Checking your rules" start={sec(T.c1 - 0.1)} stagger={0.06} />
            <span style={{ opacity: t < T.result ? 1 : 0 }}>{['.', '.', '.'].map((d, i) => <span key={i} style={{ opacity: t > T.c1 + 0.3 ? 0.35 + 0.65 * clamp01(Math.sin((f - sec(T.c1)) / 7 - i * 0.9)) : 0 }}>{d}</span>)}</span>
          </div>
          {rules.map((r, i) => {
            const a = prog(f, sec(T.c1 + 0.05 + i * 0.1), sec(0.5), OUT); const at = sec(T.ticks[i]);
            return (
              <div key={r.name} style={{ position: 'absolute', left: RULES.x, top: RULES.top + i * RULES.step, display: 'flex', alignItems: 'center', gap: 26, opacity: a, transform: `translateX(${lerp(80, 0, a)}px)` }}>
                <Check f={f} at={at} done={pop(f, at, { damping: 11, stiffness: 190 })} />
                <div style={{ width: 370 * RULES.scale, height: 122 * RULES.scale }}><div style={{ transformOrigin: '0 0', transform: `scale(${RULES.scale})` }}><RuleTile r={r} /></div></div>
              </div>
            );
          })}
          <div style={{ position: 'absolute', left: RULES.x, top: RULES.result, display: 'flex', alignItems: 'center', gap: 22 }}>
            <div style={big(44, '#fff', 700)}><BlurText f={f} text="Followed your plan" start={sec(T.result)} stagger={0.06} /></div>
            <div style={{ padding: '9px 20px', borderRadius: 999, background: A.accent, color: A.ink, fontFamily: DISPLAY, fontSize: 22, fontWeight: 700, opacity: prog(f, sec(T.result + 0.3), sec(0.25), OUT), transform: `scale(${lerp(0.7, 1, pop(f, sec(T.result + 0.3), { damping: 12 }))})`, boxShadow: `0 0 24px ${A.accentGlow}` }}>Discipline {trade.discipline}</div>
          </div>
        </>
      ) : null}

      <CursorView x={cur.x} y={cur.y} clickAge={cur.clickAge} opacity={clamp01(curA)} />
    </AbsoluteFill>
  );
};

/* ---------- Shadow Self ---------- */
export const ShadowSelf: React.FC = () => {
  const f = useCurrentFrame(); const { W, V } = useFormat();
  const KS = 1.55, KW = 280, KH = 119, gap = 30, x0 = (W - (3 * KW * KS + 2 * gap)) / 2;
  const CW = 3 * KW * KS + 2 * gap, CSs = CW / 1180;
  /* hochkant: Disziplin-Kosten groß über die ganze Breite, darunter „Actual“ und „Shadow Self“, unten der Verlauf */
  const VW = 896, vx = (W - VW) / 2, BIG = VW / KW, SMALL = (VW - 28) / 2 / KW;
  const tilePos = (i: number) => (V ? (i === 0 ? { left: vx, top: 230, s: BIG } : { left: vx + (i - 1) * ((VW + 28) / 2), top: 230 + KH * BIG + 30, s: SMALL }) : { left: x0 + i * (KW * KS + gap), top: 120, s: KS });
  const chart = V ? { left: vx, top: 230 + KH * BIG + 30 + KH * SMALL + 30, w: 640, h: 470, s: VW / 640 } : { left: x0, top: 340, w: 1180, h: 400, s: CSs };
  const LW = chart.w - 40, LH = V ? 340 : 290;
  const draw = prog(f, sec(0.35), sec(1.9), SIG);
  const cost = num(shadow.cost) * prog(f, sec(0.4), sec(1.6), OUT);
  const ends = shadowEnds(shadow.real, shadow.ideal, LW, LH); const gapA = pop(f, sec(2.35), { damping: 14 });
  const push = zoomLerp(1, 1.05, prog(f, 0, sec(4), SIG));
  const tiles = [
    { label: 'Discipline cost', n: 'September 2026', value: usd(cost), color: A.loss, foot: 'What breaking your rules cost you', size: 34 },
    { label: 'Actual', n: shadow.actualTrades, value: shadow.actual, color: A.accent, foot: '', size: 25 },
    { label: 'Shadow Self', n: '', value: shadow.self, color: A.accent, foot: shadow.selfSub, size: 25 },
  ];
  return (
    <AbsoluteFill>
      <Bg f={f} kind="night" />
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        {tiles.map((c, i) => (
          <div key={i} style={{ position: 'absolute', left: tilePos(i).left, top: tilePos(i).top, width: KW, height: KH, transformOrigin: '0 0', transform: `scale(${tilePos(i).s})`, ...enter(f, i * 0.08) }}>
            <Card tile x={0} y={0} w={KW} h={KH} style={{ boxShadow: '0 40px 70px -30px rgba(6,40,20,0.5)' }}>
              <TileHead n={c.n || undefined}>{c.label}</TileHead>
              <Val size={c.size} color={c.color} style={{ marginTop: c.size > 30 ? 10 : 16 }}>{c.value}</Val>
              {c.foot ? <div style={{ fontSize: 12, color: A.muted, marginTop: 8 }}>{c.foot}</div> : null}
            </Card>
          </div>
        ))}
        <div style={{ position: 'absolute', left: chart.left, top: chart.top, width: chart.w, height: chart.h, transformOrigin: '0 0', transform: `scale(${chart.s})`, ...enter(f, 0.2) }}>
          <Card x={0} y={0} w={chart.w} h={chart.h} style={{ boxShadow: '0 60px 100px -40px rgba(6,40,20,0.55)' }}>
            <CardTitle right={V ? undefined : <div style={{ display: 'flex', gap: 16, fontSize: 12, color: A.muted }}><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><i style={{ width: 8, height: 8, borderRadius: 4, background: A.text2 }} />Actual</span><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><i style={{ width: 8, height: 8, borderRadius: 4, background: A.accent }} />Shadow Self</span></div>}>Equity: actual vs. Shadow Self</CardTitle>
            <div style={{ position: 'absolute', left: 20, top: 70 }}>
              <ShadowLines a={shadow.real} b={shadow.ideal} w={LW} h={LH} t={draw} />
              {gapA > 0.01 ? (
                <div style={{ position: 'absolute', left: ends.x, top: 0, opacity: Math.min(1, gapA * 1.4) }}>
                  <div style={{ position: 'absolute', left: -1, top: ends.yb + 8, height: Math.max(0, ends.ya - ends.yb - 16) * gapA, width: 2, background: A.loss, borderRadius: 1 }} />
                  <div style={{ position: 'absolute', right: 14, top: (ends.ya + ends.yb) / 2 - 11, transform: `scale(${gapA})`, transformOrigin: 'right center' }}><Pill tone="loss" num size={12.5}>−{shadow.cost}</Pill></div>
                </div>
              ) : null}
            </div>
          </Card>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
