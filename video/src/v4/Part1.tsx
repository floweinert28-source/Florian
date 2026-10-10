/* Vorlage iBanPay, 0–8 s: „Still copying every trade / into spreadsheets?“ wird getippt, ringsum schweben unscharfe Karten.
   „Meet“ huscht durch, die Wortmarke JOURNALYST dreht sich um die Hochachse ins Bild, darunter wächst eine Pille mit
   umlaufendem Lichtrand: „The trading journal for discipline“. Am Ende wischt alles nach links hinaus. */
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { clamp01, FPS, IN, lerp, prog, sec, SIG, SOFT } from '../anim';
import { dash, rows } from '../app';
import { useFormat } from '../format';
import { big, DISPLAY, GREEN, LIGHT } from '../theme';
import { Bg } from '../ui/Bg';
import { A, Badge, Icon, Val } from '../ui/Kit';
import { Caret } from '../ui/Text';
import { Guide } from '../v3/Parts';

/* unscharfe Karten im Hintergrund: Tabellenzeilen, Trades, Werte */
const Ghost: React.FC<{ kind: number }> = ({ kind }) => {
  const box: React.CSSProperties = { borderRadius: 16, background: A.surface, border: `1px solid ${A.border2}`, padding: '14px 16px', fontFamily: DISPLAY, color: A.text, boxSizing: 'border-box' };
  if (kind === 0) return <div style={{ ...box, width: 300 }}>{[0, 1, 2, 3].map((i) => <div key={i} style={{ display: 'flex', gap: 8, marginTop: i ? 10 : 0 }}>{[60, 40, 70, 50].map((w, j) => <div key={j} style={{ width: w, height: 8, borderRadius: 4, background: j === 3 ? (i % 2 ? A.accent : A.loss) : A.surface3 }} />)}</div>)}</div>;
  if (kind === 1) { const r = rows[2]; return <div style={{ ...box, width: 280, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><b>{r.symbol}</b><Badge dir={r.side} /></span><Val size={18} color={A.accent}>{r.pnl}</Val></div>; }
  if (kind === 2) return <div style={{ ...box, width: 240 }}><div style={{ fontSize: 12, color: A.text2 }}>Net P&L</div><Val size={26} color={A.accent} style={{ marginTop: 6 }}>{dash.net}</Val></div>;
  if (kind === 3) { const r = rows[4]; return <div style={{ ...box, width: 280, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><b>{r.symbol}</b><Badge dir={r.side} /></span><Val size={18} color={A.loss}>{r.pnl}</Val></div>; }
  return <div style={{ ...box, width: 260, display: 'flex', alignItems: 'center', gap: 10 }}><Icon name="grid" size={20} color={A.accent} /><span style={{ fontSize: 14, fontWeight: 600 }}>trades_2026_final.xlsx</span></div>;
};

/* Pille mit umlaufendem Lichtrand */
export const GlowPill: React.FC<{ f: number; w: number; h: number; children?: React.ReactNode; dark?: boolean }> = ({ f, w, h, children, dark }) => {
  const ang = (f * 3) % 360;
  return (
    <div style={{ width: w, height: h, borderRadius: 999, border: '1.6px solid transparent', boxSizing: 'border-box', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `linear-gradient(${dark ? '#0b0d0c' : 'rgba(17,22,19,0.92)'}, ${dark ? '#0b0d0c' : 'rgba(17,22,19,0.92)'}) padding-box, conic-gradient(from ${ang}deg, rgba(52,245,138,0.15), ${GREEN} 12%, rgba(52,245,138,0.15) 30%, rgba(52,245,138,0.15) 55%, #8af5b9 68%, rgba(52,245,138,0.15) 85%) border-box`,
      boxShadow: `0 0 40px rgba(52,245,138,0.25), inset 0 0 20px rgba(52,245,138,0.08)` }}>{children}</div>
  );
};

export const P1_DURATION = 8.0;
export const Part1: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS;
  const { W, V, cx, cy } = useFormat();
  const S = V ? 86 : 104;
  /* getippt */
  const L1 = 'Still copying every trade', L2 = 'into spreadsheets?';
  const n1 = t < 0.1 ? 0 : Math.min(L1.length, Math.floor((t - 0.1) / 0.072) + 1);
  const n2 = t < 2.35 ? 0 : Math.min(L2.length, Math.floor((t - 2.35) / 0.068) + 1);
  const out1 = prog(f, sec(4.42), sec(0.18), IN);
  const push = lerp(1, 1.05, prog(f, 0, sec(4.5), (x) => x));
  const ghosts = V
    ? [[200, 300, 0], [820, 380, 1], [180, 700, 2], [880, 760, 4], [220, 1250, 3], [840, 1320, 0], [190, 1640, 1], [860, 1660, 2]]
    : [[260, 170, 0], [1660, 190, 1], [170, 520, 2], [1760, 560, 4], [330, 900, 3], [1580, 910, 0], [960, 120, 2], [980, 980, 1]];
  /* Meet → Wortmarke → Pille */
  const meet = prog(f, sec(4.62), sec(0.35), SOFT), meetOut = prog(f, sec(5.22), sec(0.18), IN);
  const spin = prog(f, sec(5.45), sec(0.6), SOFT); const up = prog(f, sec(6.05), sec(0.5), SIG);
  const pill = prog(f, sec(6.1), sec(0.6), SOFT); const zoom = lerp(1, 1.05, prog(f, sec(6.1), sec(1.8), (x) => x));
  const whip = prog(f, sec(7.8), sec(0.2), IN);
  const PW = V ? 760 : 820, PH = V ? 84 : 88;
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Bg f={f} kind="night" />
      {out1 < 1 ? (
        <AbsoluteFill style={{ transform: `scale(${push})`, opacity: 1 - out1 }}>
          {ghosts.map(([x, y, k], i) => {
            const a = prog(f, sec(0.1 + i * 0.12), sec(0.8), SOFT);
            return <div key={i} style={{ position: 'absolute', left: x, top: y - 30 * prog(f, 0, sec(4.5), (q) => q) * (0.5 + (i % 3) * 0.3), transform: `translate(-50%, -50%) scale(${lerp(0.8, 1, a) * (V ? 1.1 : 1.2)}) rotate(${[-4, 3, -2, 5, -3, 2, 1, -2][i]}deg)`, opacity: 0.42 * a, filter: 'blur(2.5px)' }}><Ghost kind={k} /></div>;
          })}
          <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ ...big(S, LIGHT), textAlign: 'center', textShadow: '0 0 40px rgba(6,8,7,0.95)' }}>
              {t < 2.3 ? (
                <>{[...L1].map((c, i) => <React.Fragment key={i}>{i === n1 ? <Caret f={f} typing={n1 < L1.length} /> : null}<span style={{ opacity: i < n1 ? 1 : 0 }}>{c}</span></React.Fragment>)}{n1 === L1.length ? <Caret f={f} typing={false} /> : null}</>
              ) : (
                <>{[...L2].map((c, i) => <React.Fragment key={i}>{i === n2 ? <Caret f={f} typing={n2 < L2.length} /> : null}<span style={{ opacity: i < n2 ? 1 : 0, color: i >= 5 ? GREEN : LIGHT }}>{c}</span></React.Fragment>)}{n2 === L2.length ? <Caret f={f} typing={false} /> : null}</>
              )}
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}

      {meet > 0 && meetOut < 1 ? (
        <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ ...big(V ? 120 : 140, LIGHT), opacity: clamp01(meet * 1.5) * (1 - meetOut), transform: `translateX(${(lerp(-40, 30, prog(f, sec(4.62), sec(0.7), (x) => x)) - meetOut * 220).toFixed(1)}px)`,
            filter: `blur(${(lerp(14, 0, meet) + meetOut * 22).toFixed(1)}px)` }}>Meet</div>
        </AbsoluteFill>
      ) : null}

      {spin > 0 ? (
        <AbsoluteFill style={{ transform: `scale(${zoom}) translateX(${(-whip * W * 0.5).toFixed(1)}px)`, opacity: 1 - whip, filter: whip > 0 ? `blur(${(whip * 24).toFixed(1)}px)` : undefined }}>
          <AbsoluteFill style={{ background: 'radial-gradient(900px 500px at 50% 50%, rgba(52,245,138,0.16), transparent 70%)', opacity: spin }} />
          <AbsoluteFill style={{ perspective: 1000 }}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: cy - (V ? 70 : 80) * up, transform: `translateY(-50%) rotateY(${lerp(90, 0, spin).toFixed(2)}deg) scale(${lerp(0.7, 1, spin)})`, textAlign: 'center',
              fontFamily: DISPLAY, fontSize: V ? 104 : 124, fontWeight: 800, letterSpacing: '0.06em', color: LIGHT, opacity: clamp01(spin * 2), whiteSpace: 'pre' }}>JOURNALYST</div>
          </AbsoluteFill>
          {pill > 0 ? (
            <div style={{ position: 'absolute', left: cx - (PW * lerp(0.15, 1, pill)) / 2, top: cy + (V ? 60 : 70), opacity: clamp01(pill * 2) }}>
              <GlowPill f={f} w={PW * lerp(0.15, 1, pill)} h={PH}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontFamily: DISPLAY, fontSize: V ? 32 : 34, fontWeight: 600, color: LIGHT, whiteSpace: 'nowrap', opacity: prog(f, sec(6.35), sec(0.3)) }}>
                  <span style={{ position: 'relative', width: 26, height: 26 }}><Guide x={13} y={13} size={20} /></span>
                  {['The', 'trading', 'journal', 'for', 'discipline'].map((w, i) => { const q = prog(f, sec(6.35 + i * 0.1), sec(0.35), SOFT); return <span key={w} style={{ opacity: q, transform: `translateY(${lerp(10, 0, q)}px)`, display: 'inline-block', color: i === 4 ? GREEN : LIGHT }}>{w}</span>; })}
                </div>
              </GlowPill>
            </div>
          ) : null}
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
