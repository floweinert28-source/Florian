/* Vorlage LangEase, Abschnitt 4 (18,3–21 s): Die Karte in der Mitte teilt sich in vier Kacheln, die in die Ecken fliegen
   (im Vorbild: dasselbe Video in vier Sprachen). Hier: vier Blickwinkel auf dieselben Trades – Net P&L, Trefferquote,
   Gesamt-Score, Shadow Self. In der Mitte baut sich „Know your edge.“ Wort für Wort auf. */
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { clamp01, IN, lerp, prog, sec, SIG, SOFT } from '../anim';
import { cumulative, dash, num, radar, rows, shadow } from '../app';
import { useFormat } from '../format';
import { big, GREEN, LIGHT } from '../theme';
import { Bg } from '../ui/Bg';
import { A, Card, CardTitle, Pill, PnlArea, Radar, SemiGauge, ShadowLines, TileHead, usd, Val } from '../ui/Kit';
import { CARD, MiniCard, shellLayout } from './Score';

const TW = 340, TH = 240;
const Tile: React.FC<{ i: number; t: number }> = ({ i, t }) => {
  if (i === 0) return (
    <Card tile x={0} y={0} w={TW} h={TH} style={{ padding: '16px 18px' }}>
      <TileHead n={dash.trades}>Net P&L</TileHead>
      <Val color={A.accent} size={34} style={{ marginTop: 10 }}>{usd(num(dash.net) * t)}</Val>
      <div style={{ position: 'absolute', left: 4, top: 104 }}><PnlArea values={[0, ...cumulative]} w={320} h={100} t={t} id={`edge${i}`} /></div>
    </Card>
  );
  if (i === 1) return (
    <Card tile x={0} y={0} w={TW} h={TH} style={{ padding: '16px 18px' }}>
      <TileHead>Trade win rate</TileHead>
      <Val size={34} style={{ marginTop: 10 }}>{dash.winRate}</Val>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 104, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <SemiGauge segs={[{ v: dash.wins, c: A.accent }, { v: 0, c: A.be }, { v: dash.losses, c: A.loss }]} t={t} size={170} />
        <span style={{ display: 'flex', gap: 6 }}><Pill tone="win" num>{dash.wins} wins</Pill><Pill tone="loss" num>{dash.losses} losses</Pill></span>
      </div>
    </Card>
  );
  if (i === 2) return (
    <Card x={0} y={0} w={TW} h={TH} style={{ padding: '16px 18px' }}>
      <CardTitle>Overall score</CardTitle>
      <div style={{ position: 'absolute', left: -18, top: 46, transformOrigin: '0 0', transform: 'scale(0.66)' }}><Radar axes={radar} t={t} size={260} /></div>
      <div style={{ position: 'absolute', right: 18, bottom: 18, textAlign: 'right' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: A.muted }}>YOUR SCORE</div>
        <Val size={40} color={A.warn} style={{ letterSpacing: 0 }}>{Math.round(dash.score * t)}</Val>
      </div>
    </Card>
  );
  return (
    <Card x={0} y={0} w={TW} h={TH} style={{ padding: '16px 18px' }}>
      <TileHead>Shadow Self</TileHead>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 10 }}><Val size={30} color={A.accent}>{shadow.self}</Val><span style={{ fontSize: 12, color: A.muted }}>vs. {shadow.actual}</span></div>
      <div style={{ position: 'absolute', left: 6, top: 104 }}><ShadowLines a={shadow.real} b={shadow.ideal} w={318} h={110} t={t} /></div>
    </Card>
  );
};

export const EDGE_DURATION = 2.7;
export const Edge: React.FC = () => {
  const f = useCurrentFrame();
  const { W, H, V, cx, cy } = useFormat();
  const { finalW } = shellLayout(W, H, V);
  const cs = finalW / CARD.w; /* Maßstab der Karte wie am Ende des vorigen Abschnitts */
  const ts = V ? 1.36 : 1.34;
  const targets = V
    ? [{ x: 285, y: 470, r: -6 }, { x: 795, y: 440, r: 5 }, { x: 290, y: 1490, r: 5 }, { x: 790, y: 1520, r: -6 }]
    : [{ x: 410, y: 265, r: -7 }, { x: 1515, y: 255, r: 6 }, { x: 415, y: 825, r: 5 }, { x: 1505, y: 820, r: -6 }];
  const breath = Math.sin(Math.PI * prog(f, 0, sec(0.22), SIG)) * 0.05;
  const cardOut = prog(f, sec(0.16), sec(0.32), IN);
  const drift = prog(f, sec(0.7), sec(2.4), (x) => x);
  const chartT = prog(f, sec(0.45), sec(1.1), SIG);
  const word = (at: number) => prog(f, sec(at), sec(0.45), SOFT);
  const W3 = [['Know', LIGHT, 0.45], ['your', LIGHT, 0.67], ['edge.', GREEN, 0.9]] as const;
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Bg f={f} kind="night" />
      {cardOut < 1 ? (
        <div style={{ position: 'absolute', left: cx - (CARD.w * cs) / 2, top: cy - (CARD.h * cs) / 2, width: CARD.w, height: CARD.h, transformOrigin: '0 0',
          transform: `scale(${cs * (1 + breath) * lerp(1, 0.8, cardOut)})`, opacity: 1 - cardOut, translate: `${(CARD.w * cs * (cardOut * 0.1 - breath / 2)).toFixed(2)}px ${(CARD.h * cs * (cardOut * 0.1 - breath / 2)).toFixed(2)}px` }}>
          <MiniCard r={rows[0]} hover={1} />
        </div>
      ) : null}
      {targets.map((g, i) => {
        const a = prog(f, sec(0.16 + i * 0.05), sec(0.75), SOFT);
        if (a <= 0) return null;
        const out = 1 + 0.05 * drift;
        const x = lerp(cx, cx + (g.x - cx) * out, a), y = lerp(cy, cy + (g.y - cy) * out, a);
        const sc = lerp(0.6, ts, a);
        return (
          <div key={i} style={{ position: 'absolute', left: x - TW / 2, top: y - TH / 2, width: TW, height: TH, transformOrigin: '50% 50%', opacity: clamp01(a * 3),
            transform: `rotate(${(g.r * a + (i % 2 ? 1 : -1) * drift * 1.5).toFixed(2)}deg) scale(${sc.toFixed(4)})`, filter: 'drop-shadow(0 40px 50px rgba(0,0,0,0.55))' }}>
            <Tile i={i} t={chartT} />
          </div>
        );
      })}
      <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...big(V ? 96 : 110, LIGHT), textShadow: '0 0 40px rgba(6,8,7,0.95), 0 0 90px rgba(6,8,7,0.8)' }}>
          {W3.map(([w, c, at], i) => { const q = word(at); return <React.Fragment key={w}>{i ? ' ' : ''}<span style={{ display: 'inline-block', color: c, opacity: clamp01(q * 1.6), transform: `translateY(${lerp(22, 0, q).toFixed(2)}px)`, filter: q < 1 ? `blur(${lerp(12, 0, q).toFixed(2)}px)` : undefined }}>{w}</span></React.Fragment>; })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
