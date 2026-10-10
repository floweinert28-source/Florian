/* Handy-Rahmen mit vereinfachten Bildschirmen der App in der mobilen Ansicht (dunkles Erscheinungsbild), echte Werte.
   Maße in Handy-Pixeln: Rahmen 330 × 680, Bildschirm 310 × 660. */
import React from 'react';
import { cumulative, dash, num, radar, rows, rules, trade } from '../app';
import { DISPLAY, NUM } from '../theme';
import { A, Badge, Card, Donut, Icon, PnlArea, Pill, Radar, ScoreScale, SemiGauge, Switch, TileHead, usd, Val } from './Kit';

export const PHONE = { w: 330, h: 680 };
const SW = 310;

const Status: React.FC = () => (
  <>
    <div style={{ position: 'absolute', left: 30, top: 16, fontFamily: DISPLAY, fontSize: 14, fontWeight: 700, color: A.text }}>9:41</div>
    <div style={{ position: 'absolute', left: (SW - 96) / 2, top: 11, width: 96, height: 28, borderRadius: 14, background: '#000' }} />
    <div style={{ position: 'absolute', right: 26, top: 19, display: 'flex', gap: 5, alignItems: 'flex-end' }}>
      {[5, 7, 9, 11].map((h) => <div key={h} style={{ width: 3, height: h, borderRadius: 1, background: A.text }} />)}
      <div style={{ marginLeft: 4, width: 22, height: 11, borderRadius: 3, border: `1.3px solid ${A.text2}`, padding: 1.5, boxSizing: 'border-box' }}><div style={{ width: '75%', height: '100%', borderRadius: 1.5, background: A.text }} /></div>
    </div>
  </>
);
const Head: React.FC<{ title: string; sub?: string }> = ({ title, sub }) => (
  <>
    <div style={{ position: 'absolute', left: 18, top: 56, fontFamily: DISPLAY, fontSize: 11.5, fontWeight: 800, letterSpacing: '0.08em', color: A.text }}>JOURNALYST</div>
    <div style={{ position: 'absolute', right: 18, top: 50, width: 28, height: 28, borderRadius: 14, background: A.accent, color: A.ink, display: 'grid', placeItems: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 12, boxShadow: `0 0 12px ${A.accentGlow}` }}>T</div>
    <div style={{ position: 'absolute', left: 18, top: 92, fontFamily: DISPLAY, fontSize: 24, fontWeight: 600, letterSpacing: '-0.01em', color: A.text }}>{title}</div>
    {sub ? <div style={{ position: 'absolute', left: 18, top: 126, fontFamily: DISPLAY, fontSize: 12.5, color: A.muted }}>{sub}</div> : null}
  </>
);
const Tab: React.FC<{ active: number }> = ({ active }) => (
  <div style={{ position: 'absolute', left: 14, right: 14, bottom: 16, height: 58, borderRadius: 20, background: A.surface, border: `1px solid ${A.border2}`, display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
    {['dashboard', 'tradelog', 'shadow', 'stats'].map((ic, i) => (
      <div key={ic} style={{ width: 40, height: 40, borderRadius: 12, display: 'grid', placeItems: 'center', background: i === active ? A.accentSoft : 'transparent' }}><Icon name={ic} size={20} color={i === active ? A.accent : A.muted} /></div>
    ))}
  </div>
);

export type Screen = 'dashboard' | 'score' | 'tradelog' | 'rules';
const Body: React.FC<{ screen: Screen; t: number }> = ({ screen, t }) => {
  if (screen === 'dashboard') return (
    <>
      <Head title="Dashboard" sub="September 2026" />
      <Card tile x={14} y={156} w={282} h={104}><TileHead n={dash.trades}>Net P&L</TileHead><Val color={A.accent} size={28} style={{ marginTop: 12 }}>{usd(num(dash.net))}</Val><div style={{ fontSize: 11.5, color: A.muted, marginTop: 6 }}>{dash.avg}</div></Card>
      <Card tile x={14} y={272} w={282} h={112}>
        <TileHead>Trade win rate</TileHead>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
          <Val size={26}>{dash.winRate}</Val>
          <SemiGauge segs={[{ v: dash.wins, c: A.accent }, { v: 0, c: A.be }, { v: dash.losses, c: A.loss }]} t={t} size={104} />
        </div>
      </Card>
      <Card x={14} y={396} w={282} h={180} style={{ padding: '14px 14px' }}>
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>Cumulative daily P&L</div>
        <div style={{ position: 'absolute', left: 4, top: 46 }}><PnlArea values={[0, ...cumulative]} w={262} h={100} t={t} id="phcum" /></div>
      </Card>
      <Tab active={0} />
    </>
  );
  if (screen === 'score') return (
    <>
      <Head title="Overall score" sub="Last 30 days" />
      <Card x={14} y={156} w={282} h={420} style={{ padding: '16px 16px' }}>
        <div style={{ position: 'absolute', left: -9, top: 26, transformOrigin: '0 0', transform: 'scale(0.84)' }}><Radar axes={radar} t={t} size={220} /></div>
        <div style={{ position: 'absolute', left: 16, right: 16, bottom: 22 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: A.muted }}>YOUR SCORE</div>
          <Val size={40} color={A.warn} style={{ letterSpacing: 0, marginTop: 2 }}>{Math.round(dash.score * t)}</Val>
          <div style={{ marginTop: 8 }}><ScoreScale p={dash.score * t} w={250} /></div>
        </div>
      </Card>
      <Tab active={3} />
    </>
  );
  if (screen === 'tradelog') return (
    <>
      <Head title="TradeLog" sub={`${rows.length} latest trades`} />
      <div style={{ position: 'absolute', left: 14, top: 156, width: 282, borderRadius: 14, background: A.surface, border: `1px solid ${A.border}`, overflow: 'hidden' }}>
        {rows.map((r, i) => (
          <div key={i} style={{ height: 68, boxSizing: 'border-box', padding: '0 14px', borderTop: i ? `1px solid ${A.border}` : undefined, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: DISPLAY, color: A.text,
            background: i === 0 ? A.accentSoft : undefined }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><b style={{ fontSize: 15 }}>{r.symbol}</b><Badge dir={r.side} /></div>
              <div style={{ fontFamily: NUM, fontSize: 11, color: A.muted, marginTop: 5 }}>{r.day} · {r.time}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: NUM, fontSize: 15, fontWeight: 700, color: /^\+/.test(r.pnl) ? A.accent : /^[−-]/.test(r.pnl) && r.pnl.length > 1 ? A.loss : A.faint }}>{r.pnl}</div>
              <div style={{ fontFamily: NUM, fontSize: 11, color: A.muted, marginTop: 5 }}>{r.r}</div>
            </div>
          </div>
        ))}
      </div>
      <Tab active={1} />
    </>
  );
  /* Regeln und Disziplin für den letzten Trade */
  const fill = Math.min(1, t) * 0.72;
  return (
    <>
      <Head title="Discipline" sub={`${trade.symbol} · Long · ${trade.pnl}`} />
      <Card x={14} y={156} w={282} h={112}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Discipline score</span>
          <span style={{ fontFamily: NUM, fontWeight: 700, fontSize: 22 }}>{Math.round(fill * 100)}<span style={{ color: A.muted, fontSize: 14 }}>/100</span></span>
        </div>
        <div style={{ position: 'relative', height: 12, borderRadius: 6, background: A.surface3, marginTop: 18 }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${fill * 100}%`, borderRadius: 6, background: `linear-gradient(90deg, #0fb862, ${A.accent})`, boxShadow: `0 0 12px ${A.accentGlow}` }} />
        </div>
      </Card>
      {rules.map((r, i) => (
        <div key={r.name} style={{ position: 'absolute', left: 14, top: 284 + i * 88, width: 282, height: 80, boxSizing: 'border-box', padding: '14px 14px', borderRadius: 14, background: A.surface, border: `1px solid ${A.border}`, fontFamily: DISPLAY }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: A.text, width: 200 }}>{r.name}</div>
          <div style={{ fontSize: 11.5, color: A.muted, marginTop: 5 }}>{r.value} {r.unit}</div>
          <div style={{ position: 'absolute', right: 14, top: 14 }}><Switch on /></div>
        </div>
      ))}
      <div style={{ position: 'absolute', left: 14, top: 552, display: 'flex', gap: 6 }}><Pill tone="win" num>{trade.r}</Pill><Pill tone="win">{rows[0].setup}</Pill></div>
      <Tab active={2} />
    </>
  );
};

/* Rahmen: dunkles Metall mit feiner Lichtkante, darin der Bildschirm */
export const Phone: React.FC<{ screen: Screen; t?: number; style?: React.CSSProperties; glow?: number }> = ({ screen, t = 1, style, glow = 0 }) => (
  <div style={{ position: 'absolute', width: PHONE.w, height: PHONE.h, borderRadius: 58, boxSizing: 'border-box', padding: 10,
    background: 'linear-gradient(145deg, #3a3d3b, #161817 38%, #0b0c0b 70%, #2a2c2b)', boxShadow: `inset 0 0 0 1.5px rgba(255,255,255,0.14), 0 50px 90px -30px rgba(0,0,0,0.8), 0 0 ${60 * glow}px rgba(52,245,138,${(0.25 * glow).toFixed(3)})`, ...style }}>
    <div style={{ position: 'relative', width: SW, height: 660, borderRadius: 48, overflow: 'hidden', background: `radial-gradient(420px 300px at 20% -10%, rgba(255,238,218,.05), transparent 62%), ${A.bg}`, color: A.text, fontFamily: DISPLAY }}>
      <Status />
      <Body screen={screen} t={t} />
      <div style={{ position: 'absolute', inset: 0, borderRadius: 48, background: 'linear-gradient(125deg, rgba(255,255,255,0.07), transparent 35%)', pointerEvents: 'none' }} />
    </div>
  </div>
);
