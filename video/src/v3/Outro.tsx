/* Vorlage Outbidd, 52,9–62,5 s: „Your plan.“ → „Your rules.“ in der Mitte, ein leuchtender Bogen, drei Aktions-Menüs der App
   kreisen langsam darum, der Zeiger wählt „Weekly review“ und „Create certificate“. Schwarz: „The way journaling should be“ mit
   der grünen Raute. Zum Schluss baut sich die Wortmarke JOURNALYST Buchstabe für Buchstabe auf. */
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { clamp01, FPS, IN, lerp, OUT, pop, prog, sec, SIG, SOFT } from '../anim';
import { useFormat } from '../format';
import { big, DISPLAY, GREEN, LIGHT } from '../theme';
import { Bg } from '../ui/Bg';
import { CursorView, cursorAt } from '../ui/Cursor';
import { A, Icon } from '../ui/Kit';
import { BlurText } from '../ui/Text';
import { Guide, MaskSwap, Rings } from './Parts';

const MENUS = [
  { icon: 'plus', label: 'Log trade', items: [['plus', 'Log trade'], ['grid', 'Import CSV'], ['day', 'Add screenshot']] },
  { icon: 'calendar', label: 'Review', items: [['day', 'Day review'], ['calendar', 'Weekly review'], ['replay', 'Blind Replay']] },
  { icon: 'award', label: 'Share', items: [['award', 'Create certificate'], ['journal', 'Download as PDF'], ['user', 'Coach Mode']] },
];
const MW = 300, HEAD = 48, ITEM = 46;
const Menu: React.FC<{ i: number; hover: number; pressed: boolean }> = ({ i, hover, pressed }) => {
  const m = MENUS[i];
  return (
    <div style={{ width: MW, fontFamily: DISPLAY }}>
      <div style={{ height: HEAD, borderRadius: 14, background: A.accent, color: A.ink, display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', fontSize: 15.5, fontWeight: 700, boxShadow: `0 14px 30px -12px ${A.accentGlow}` }}>
        <Icon name={m.icon} size={18} color={A.ink} sw={2.3} />{m.label}<Icon name="chev" size={16} color={A.ink} style={{ marginLeft: 'auto' }} />
      </div>
      <div style={{ marginTop: 8, borderRadius: 14, background: A.surface, border: `1px solid ${A.border2}`, padding: 6, boxShadow: '0 40px 70px -30px rgba(0,0,0,0.85)' }}>
        {m.items.map(([ic, l], j) => (
          <div key={l} style={{ height: ITEM - 6, margin: '3px 0', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12, padding: '0 12px', fontSize: 14.5, fontWeight: 600, color: A.text,
            background: hover === j ? (pressed ? A.accentSoft : A.surface3) : 'transparent', boxShadow: hover === j && pressed ? `inset 0 0 0 1px rgba(52,245,138,0.4)` : undefined }}>
            <Icon name={ic} size={17} color={hover === j ? A.accent : A.muted} />{l}
          </div>
        ))}
      </div>
    </div>
  );
};

export const OUTRO_DURATION = 9.6;
export const Outro: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS;
  const { W, H, V, cx, cy } = useFormat();
  /* A: Your plan → Your rules, kreisende Menüs */
  const outA = prog(f, sec(4.0), sec(0.3), IN);
  const ms = V ? 1.22 : 1.3; const R = V ? { x: 290, y: 620 } : { x: 650, y: 335 };
  const base = [-150, -30, 90]; const omega = 7; /* Grad pro Sekunde, im Uhrzeigersinn */
  const cards = base.map((a0, i) => {
    const ang = ((a0 + omega * t) * Math.PI) / 180; const k = prog(f, sec(0.15 + i * 0.12), sec(0.6), SOFT);
    const x = cx + Math.cos(ang) * R.x * lerp(1.3, 1, k), y = cy + 20 + Math.sin(ang) * R.y * lerp(1.3, 1, k) + Math.sin(t * 1.4 + i) * 8;
    return { x, y, k, rot: [-5, 4, -3][i] * (1 - 0.3 * Math.sin(t + i)) };
  });
  const itemPt = (ci: number, j: number) => { const c = cards[ci]; return { x: c.x - (MW * ms) / 2 + 140 * ms, y: c.y - ((HEAD + 8 + 3 * ITEM + 12) * ms) / 2 + (HEAD + 8 + 6 + j * ITEM + ITEM / 2) * ms }; };
  const pA = itemPt(1, 1), pB = itemPt(2, 0);
  const cur = cursorAt(f, [{ at: 0, x: cx + 120, y: cy + (V ? 420 : 300) }, { at: sec(1.6), x: pA.x, y: pA.y, dur: sec(0.6), click: true }, { at: sec(3.15), x: pB.x, y: pB.y, dur: sec(0.6), click: true }]);
  const curA = prog(f, sec(1.3), sec(0.2)) * (1 - outA);
  const hoverOf = (ci: number) => (ci === 1 && t >= 1.95 && t < 3.3 ? 1 : ci === 2 && t >= 3.5 ? 0 : -1);
  const pressedOf = (ci: number) => (ci === 1 ? t >= 2.2 : t >= 3.75);
  const arc = prog(f, 0, sec(1.2), SIG);
  const head = prog(f, sec(0.1), sec(0.5), SOFT);
  /* B: The way journaling should be */
  const bOn = t >= 4.28 && t < 6.75; const outB = prog(f, sec(6.45), sec(0.25), IN);
  const dia = pop(f, sec(5.65), { damping: 8, stiffness: 220 });
  /* C: Wortmarke */
  const MARK = 'JOURNALYST'; const fadeEnd = prog(f, sec(9.1), sec(0.5), IN);
  const night = (t < 4.28 ? 1 - prog(f, sec(4.0), sec(0.28)) : 0) + (t >= 6.6 ? prog(f, sec(6.6), sec(0.4)) : 0);
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Bg f={f} kind="black" />
      {night > 0 ? <AbsoluteFill style={{ opacity: Math.min(1, night) }}><Bg f={f} kind="night" /></AbsoluteFill> : null}

      {t < 4.3 ? (
        <AbsoluteFill style={{ opacity: 1 - outA, transform: `scale(${lerp(1, 0.9, outA)})`, filter: outA > 0 ? `blur(${(outA * 14).toFixed(1)}px)` : undefined }}>
          <svg width={W} height={H} style={{ position: 'absolute', left: 0, top: 0 }}>
            <defs><filter id="arcglow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14" /></filter></defs>
            {[0, 1].map((g) => (
              <ellipse key={g} cx={cx} cy={cy + 20} rx={R.x} ry={R.y} fill="none" stroke={GREEN} strokeWidth={g ? 3 : 10} strokeOpacity={g ? 0.75 : 0.45} filter={g ? undefined : 'url(#arcglow)'}
                pathLength={100} strokeDasharray={`${(46 * arc).toFixed(2)} 100`} strokeDashoffset={(-55 - t * 3).toFixed(2)} strokeLinecap="round" />
            ))}
          </svg>
          {cards.map((c, i) => (
            <div key={i} style={{ position: 'absolute', left: c.x - (MW * ms) / 2, top: c.y - ((HEAD + 8 + 3 * ITEM + 12) * ms) / 2, width: MW, transformOrigin: '0 0', transform: `scale(${ms})`, opacity: clamp01(c.k * 2) }}>
              <div style={{ transformOrigin: '50% 50%', transform: `rotate(${c.rot.toFixed(2)}deg) scale(${lerp(0.7, 1, c.k)})` }}><Menu i={i} hover={hoverOf(i)} pressed={pressedOf(i)} /></div>
            </div>
          ))}
          <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ ...big(V ? 112 : 120, LIGHT), opacity: clamp01(head * 1.5), transform: `scale(${lerp(0.9, 1, head)})`, filter: head < 1 ? `blur(${lerp(16, 0, head).toFixed(1)}px)` : undefined, textShadow: '0 0 40px rgba(6,8,7,0.95)' }}>
              Your <MaskSwap f={f} at={sec(1.5)} from={<span style={{ color: GREEN }}>plan.</span>} to={<span style={{ color: GREEN }}>rules.</span>} />
            </div>
          </AbsoluteFill>
          <CursorView x={cur.x} y={cur.y} clickAge={cur.clickAge} opacity={curA} />
        </AbsoluteFill>
      ) : null}

      {bOn ? (
        <AbsoluteFill style={{ opacity: 1 - outB, filter: outB > 0 ? `blur(${(outB * 18).toFixed(1)}px)` : undefined }}>
          <Rings f={f} x={cx} y={-H * 0.25} max={V ? 1500 : 1300} n={5} period={2.6} opacity={0.3} />
          <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ ...big(V ? 92 : 104, LIGHT), textAlign: 'center', whiteSpace: V ? 'normal' : 'pre', width: V ? 900 : undefined }}>
              <BlurText f={f} text="The way journaling should be" start={sec(4.35)} stagger={0.2} dur={0.55} blur={14} scaleFrom={1.06} color={(i) => (i === 2 ? GREEN : LIGHT)} />
              <span style={{ display: 'inline-block', position: 'relative', width: V ? 70 : 80, height: 10 }}>
                {dia > 0.001 ? <Guide x={V ? 44 : 50} y={V ? -28 : -32} size={V ? 34 : 40} scale={dia} rot={0} /> : null}
              </span>
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}

      {t >= 6.75 ? (
        <AbsoluteFill style={{ opacity: 1 - fadeEnd }}>
          <AbsoluteFill style={{ background: `radial-gradient(${V ? '700px 520px' : '1000px 520px'} at 50% 50%, rgba(52,245,138,0.16), transparent 70%)`, opacity: prog(f, sec(6.9), sec(0.8), SIG) }} />
          <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontFamily: DISPLAY, fontSize: V ? 104 : 130, fontWeight: 800, letterSpacing: '0.06em', color: LIGHT, whiteSpace: 'pre', transform: `scale(${lerp(1, 1.03, prog(f, sec(6.9), sec(2.7), (x) => x))})` }}>
              {[...MARK].map((ch, i) => { const a = prog(f, sec(6.95 + i * 0.05), sec(0.4), OUT);
                return <span key={i} style={{ display: 'inline-block', opacity: a, transform: `translateX(${lerp(-24, 0, a).toFixed(1)}px)`, filter: a < 1 ? `blur(${lerp(10, 0, a).toFixed(1)}px)` : undefined }}>{ch}</span>; })}
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
