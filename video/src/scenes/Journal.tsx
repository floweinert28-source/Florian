/* 25–33 s: Der neue Trade rutscht oben ins TradeLog, dann die Regelprüfung in geteiltem Bild */
import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame } from 'remotion';
import { Cam, camAt, camStyle, clamp01, IN, lerp, OUT, pop, prog, sec, SIG } from '../anim';
import { cap, img } from '../cap';
import { big, DEEP, DISPLAY, GREEN, INK } from '../theme';
import { Bg } from '../ui/Bg';
import { BlurText } from '../ui/Text';

const TB = cap.trades; const TW = TB.w, TH = TB.h;
const R0 = TB.rows[0], R1 = TB.rows[1]; const ROW = R1.y - R0.y;

/* Streifen aus dem Tabellenbild: nur die Zeilen y0..y1, um dy verschoben */
const Slice: React.FC<{ y0: number; y1: number; dy?: number; dx?: number; opacity?: number }> = ({ y0, y1, dy = 0, dx = 0, opacity = 1 }) => (
  <div style={{ position: 'absolute', left: 0, top: y0, width: TW, height: y1 - y0, overflow: 'hidden', opacity, transform: `translate(${dx}px, ${dy}px)` }}>
    <Img src={img('trades-table.png')} style={{ position: 'absolute', left: 0, top: -y0, width: TW, height: TH }} />
  </div>
);

export const TradeLog: React.FC = () => {
  const f = useCurrentFrame();
  const rc = TB.rulesCell;
  const cam: Cam = camAt(f, { s: 1.62, x: 520, y: 175 }, [
    { at: sec(0.9), dur: sec(1.15), to: { s: 1.72, x: 820, y: 150 } },
    { at: sec(1.95), dur: sec(0.55), to: { s: 3.6, x: rc.x + rc.w / 2, y: R0.y + ROW / 2 }, ease: IN },
  ]);
  const push = prog(f, sec(0.3), sec(0.55), SIG); const add = prog(f, sec(0.55), sec(0.45), OUT);
  const glow = add * (1 - prog(f, sec(1.9), sec(0.5)));
  return (
    <AbsoluteFill>
      <Bg f={f} kind="mint" />
      <div style={{ ...camStyle(cam), width: TW, height: TH }}>
        <div style={{ position: 'absolute', left: 2, top: 2, width: TW - 4, height: TH - 4, borderRadius: 14, background: '#1a1917', boxShadow: '0 60px 110px -30px rgba(6,40,20,0.5)' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, width: TW, height: TH, overflow: 'hidden', borderRadius: 14 }}>
          <Slice y0={R1.y} y1={TH} dy={lerp(-ROW, 0, push)} />
          <Slice y0={R0.y} y1={R1.y} dx={lerp(-36, 0, add)} opacity={add} />
          <div style={{ position: 'absolute', left: 2, top: R0.y, width: TW - 4, height: ROW, background: 'rgba(52,245,138,0.10)', opacity: glow }}>
            <div style={{ position: 'absolute', left: 0, top: 6, bottom: 6, width: 3, borderRadius: 2, background: GREEN, boxShadow: `0 0 10px ${GREEN}` }} />
          </div>
          <Slice y0={0} y1={R0.y} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* Links die Karte „Recent trades“ mit dem neuen Trade, rechts die drei aktiven Regeln, die nacheinander abgehakt werden */
const Check: React.FC<{ f: number; at: number }> = ({ f, at }) => {
  const spin = prog(f, at - sec(0.45), sec(0.15)); const done = pop(f, at, { damping: 11, stiffness: 190 });
  return (
    <div style={{ position: 'relative', width: 44, height: 44 }}>
      {done < 0.02 ? (
        <div style={{ position: 'absolute', inset: 4, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.14)', borderTopColor: GREEN, opacity: spin, transform: `rotate(${f * 9}deg)` }} />
      ) : (
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: GREEN, display: 'grid', placeItems: 'center', transform: `scale(${done})`, boxShadow: `0 0 24px rgba(52,245,138,0.45)` }}>
          <svg width="22" height="22" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={DEEP} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      )}
    </div>
  );
};

export const RuleCheck: React.FC = () => {
  const f = useCurrentFrame();
  const rec = cap.recent; const RS = 1.8; const fr = rec.firstRow;
  const enter = prog(f, 0, sec(0.7), OUT);
  const ring = prog(f, sec(0.6), sec(0.5), OUT) * (1 - prog(f, sec(2.6), sec(0.6)));
  const tiles = cap.ruleTiles; const TS = 1.42;
  const result = sec(3.55);
  return (
    <AbsoluteFill>
      {/* linke Hälfte hell, rechte Hälfte dunkel */}
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, #f8fbf9, #e9f3ed)' }} />
      <div style={{ position: 'absolute', left: 960, top: 0, width: 960, height: 1080, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: -960, top: 0, width: 1920, height: 1080 }}><Bg f={f} kind="dark" /></div>
      </div>
      <AbsoluteFill style={{ perspective: 2200 }}>
        <div style={{ position: 'absolute', left: 480 - (rec.w * RS) / 2, top: 540 - (rec.h * RS) / 2, width: rec.w, height: rec.h, transformOrigin: '0 0',
          opacity: enter, transform: `translateX(${lerp(-70, 0, enter)}px) scale(${RS}) rotateY(${lerp(18, 9, prog(f, 0, sec(5.5), SIG))}deg)` }}>
          <div style={{ position: 'absolute', left: 4, top: 4, right: 4, bottom: 4, borderRadius: 16, boxShadow: '0 50px 90px -30px rgba(6,40,20,0.5)' }} />
          <Img src={img('recent.png')} style={{ position: 'absolute', left: 0, top: 0, width: rec.w, height: rec.h }} />
          <div style={{ position: 'absolute', left: fr.x - 8, top: fr.y - 2, width: fr.w + 16, height: fr.h + 4, borderRadius: 10, border: `1.5px solid ${GREEN}`, boxShadow: `0 0 18px rgba(52,245,138,0.35), inset 0 0 0 999px rgba(52,245,138,0.06)`, opacity: ring }} />
        </div>
      </AbsoluteFill>
      <div style={{ position: 'absolute', left: 1080, top: 120, ...big(48, '#fff', 600), letterSpacing: '-0.02em' }}>
        <BlurText f={f} text="Checking your rules" start={sec(0.25)} stagger={0.07} />
        <span style={{ opacity: f < result ? 1 : 0 }}>{['.', '.', '.'].map((d, i) => <span key={i} style={{ opacity: f > sec(0.9) ? 0.35 + 0.65 * clamp01(Math.sin((f - sec(0.9)) / 9 - i * 0.9)) : 0 }}>{d}</span>)}</span>
      </div>
      {tiles.map((r, i) => {
        const a = prog(f, sec(0.45 + i * 0.12), sec(0.6), OUT);
        return (
          <div key={i} style={{ position: 'absolute', left: 1080, top: 230 + i * 205, display: 'flex', alignItems: 'center', gap: 28, opacity: a, transform: `translateX(${lerp(90, 0, a)}px)` }}>
            <Check f={f} at={sec(1.45 + i * 0.65)} />
            <div style={{ width: r.w * TS, height: r.h * TS, position: 'relative' }}>
              <Img src={img(`rule-${i}.png`)} style={{ width: r.w * TS, height: r.h * TS }} />
            </div>
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 1080, top: 900, display: 'flex', alignItems: 'center', gap: 22, fontFamily: DISPLAY }}>
        <div style={big(46, '#fff', 700)}><BlurText f={f} text="Followed your plan" start={result} stagger={0.07} /></div>
        <div style={{ padding: '10px 22px', borderRadius: 999, background: GREEN, color: INK, fontSize: 24, fontWeight: 700, letterSpacing: '-0.01em', opacity: prog(f, result + sec(0.35), sec(0.3), OUT), transform: `scale(${lerp(0.7, 1, pop(f, result + sec(0.35), { damping: 12 }))})` }}>Discipline 100</div>
      </div>
    </AbsoluteFill>
  );
};
