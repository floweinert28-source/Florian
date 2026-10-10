/* Vorlage Outbidd, 7,5–11,1 s: „No more spreadsheets“ wird getippt, ringsum springen Hinweis-Karten auf (federnd),
   Wisch → „And scattered notes.“ mit einem Notiz-Fenster, die Hand klickt auf „Done“. */
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { clamp01, FPS, IN, lerp, pop, prog, sec, SIG, SOFT } from '../anim';
import { useFormat } from '../format';
import { big, DISPLAY, GREEN, LIGHT, NUM } from '../theme';
import { Bg } from '../ui/Bg';
import { Hand } from '../ui/Hand';
import { A, Icon, mixA } from '../ui/Kit';
import { Caret } from '../ui/Text';

const CARDS = [
  { icon: 'calendar', c: A.info, title: 'Reminder', body: 'Review last week’s trades.' },
  { icon: 'grid', c: A.accent, title: 'trades_final_v3.csv', body: 'Edited 2 min ago' },
  { icon: 'grid', c: '#1fa463', title: 'P&L tracker (copy 2).xlsx', body: 'Excel · 3 versions' },
  { icon: 'info', c: A.loss, title: 'Daily loss limit hit', body: '−$1,435.52 on Sep 7' },
  { icon: 'journal', c: A.warn, title: 'Notes', body: 'Moved my stop. Again.' },
  { icon: 'day', c: A.be, title: 'Screenshot 2026-09-30 at 16.41.png', body: 'Desktop' },
];
const Notif: React.FC<{ i: number }> = ({ i }) => {
  const c = CARDS[i];
  return (
    <div style={{ width: 340, boxSizing: 'border-box', padding: '14px 16px', borderRadius: 18, background: 'rgba(26,25,23,0.92)', border: `1px solid ${A.border2}`, display: 'flex', gap: 12, alignItems: 'center',
      boxShadow: '0 30px 60px -24px rgba(0,0,0,0.8)', fontFamily: DISPLAY, color: A.text }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: mixA(c.c, 0.16), border: `1px solid ${mixA(c.c, 0.35)}`, display: 'grid', placeItems: 'center', flex: 'none' }}><Icon name={c.icon} size={19} color={c.c} /></div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><span style={{ fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</span><span style={{ fontSize: 11.5, color: A.muted, flex: 'none' }}>now</span></div>
        <div style={{ fontSize: 13, color: A.text2, marginTop: 3, fontFamily: c.body.includes('$') ? NUM : DISPLAY }}>{c.body}</div>
      </div>
    </div>
  );
};

/* Notiz-Fenster, 760 × 420 App-Pixel */
export const DONE = { x: 760 - 22 - 84, y: 420 - 22 - 38, w: 84, h: 38 };
const NotesWindow: React.FC<{ pressed: boolean }> = ({ pressed }) => (
  <div style={{ position: 'relative', width: 760, height: 420, borderRadius: 18, background: A.surface, border: `1px solid ${A.border2}`, overflow: 'hidden', fontFamily: DISPLAY, color: A.text, boxShadow: '0 60px 120px -40px rgba(0,0,0,0.85)' }}>
    <div style={{ height: 44, borderBottom: `1px solid ${A.border}`, display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 16 }}>
      {['#ff5f57', '#febc2e', '#28c840'].map((c) => <div key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c, opacity: 0.85 }} />)}
      <span style={{ marginLeft: 14, fontSize: 13, color: A.muted, fontWeight: 600 }}>Notes</span>
    </div>
    <div style={{ position: 'absolute', left: 0, top: 44, bottom: 0, width: 230, borderRight: `1px solid ${A.border}`, background: A.bg2 }}>
      {[['Tue, Sep 29', 'MNQ breakout −$211.62'], ['Mon, Sep 28', 'DAX… why??'], ['Thu, Sep 24', 'NQ short, again'], ['Mon, Sep 21', 'Too many trades']].map(([d, s], i) => (
        <div key={d} style={{ padding: '12px 16px', borderBottom: `1px solid ${A.border}`, background: i === 0 ? A.surface2 : undefined }}>
          <div style={{ fontSize: 13.5, fontWeight: 700 }}>{d}</div><div style={{ fontSize: 12, color: A.muted, marginTop: 3, whiteSpace: 'nowrap' }}>{s}</div>
        </div>
      ))}
    </div>
    <div style={{ position: 'absolute', left: 256, top: 66, right: 24 }}>
      <div style={{ fontSize: 22, fontWeight: 700 }}>Tue, Sep 29</div>
      <div style={{ fontSize: 15, lineHeight: 1.65, color: A.text2, marginTop: 12 }}>MNQ breakout <span style={{ fontFamily: NUM, color: A.loss, fontWeight: 600 }}>−$211.62</span><br />Chased it. Moved my stop again.<br />Why do I keep doing this?</div>
    </div>
    <div style={{ position: 'absolute', left: DONE.x, top: DONE.y, width: DONE.w, height: DONE.h, borderRadius: 10, display: 'grid', placeItems: 'center', fontSize: 14, fontWeight: 700,
      background: pressed ? A.warn : A.surface3, color: pressed ? A.ink : A.text, transform: `scale(${pressed ? 0.96 : 1})` }}>Done</div>
  </div>
);

export const CHAOS_DURATION = 3.6;
export const Chaos: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS;
  const { W, H, V, cx, cy } = useFormat();
  /* Teil 1: getippt */
  const TEXT = V ? 'No more\nspreadsheets' : 'No more spreadsheets'; const chars = [...TEXT]; const head = 8;
  const n = t < 0.05 ? 0 : t < 0.85 ? Math.min(head, Math.floor((t - 0.05) / 0.1) + 1) : Math.min(chars.length, head + Math.floor((t - 0.85) / 0.022) + 1);
  const typing = t < 1.15;
  const out1 = prog(f, sec(2.4), sec(0.18), IN);
  const pos = V
    ? [[290, 360], [790, 330], [300, 640], [800, 660], [300, 1290], [790, 1320]]
    : [[380, 190], [1540, 170], [300, 370], [1640, 730], [420, 900], [1480, 900]];
  const cs = V ? 1.15 : 1.25; const drift = -40 * prog(f, sec(1.1), sec(1.5), (x) => x);
  /* Teil 2: Notizen */
  const p2 = prog(f, sec(2.5), sec(0.5), SOFT); const win = pop(f, sec(2.5), { damping: 13, stiffness: 160 });
  const ws = V ? 1.22 : 1.15; const wx = cx - (760 * ws) / 2, wy = (V ? cy + 140 : cy + 100) - (420 * ws) / 2;
  const done = { x: wx + (DONE.x + DONE.w * 0.55) * ws, y: wy + (DONE.y + DONE.h * 0.62) * ws };
  const hk = prog(f, sec(2.65), sec(0.6), SIG); const from = { x: W * 0.8, y: H * 1.05 };
  const hand = { x: lerp(from.x, done.x, hk), y: lerp(from.y, done.y, hk) };
  const CLICK = 3.3;
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Bg f={f} kind="night" />
      {out1 < 1 ? (
        <AbsoluteFill style={{ opacity: 1 - out1, transform: `translateY(${(-out1 * 120).toFixed(1)}px)`, filter: out1 > 0 ? `blur(${(out1 * 20).toFixed(1)}px)` : undefined }}>
          {pos.map(([x, y], i) => {
            const k = pop(f, sec([1.15, 1.25, 1.35, 1.5, 1.65, 1.8][i]), { damping: 11, stiffness: 190 });
            if (k <= 0.001) return null;
            return <div key={i} style={{ position: 'absolute', left: x - 170, top: y + drift * (0.6 + (i % 3) * 0.25) - 40, transformOrigin: '50% 50%', transform: `scale(${(cs * k).toFixed(4)}) rotate(${[-3, 2, 2, -2, -2, 3][i]}deg)`, opacity: clamp01(k * 3) }}><Notif i={i} /></div>;
          })}
          <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ ...big(V ? 104 : 128, LIGHT), textAlign: 'center', textShadow: '0 0 40px rgba(6,8,7,0.95)' }}>
              {chars.map((c, i) => (
                <React.Fragment key={i}>
                  {i === n ? <Caret f={f} typing={typing} /> : null}
                  <span style={{ opacity: i < n ? 1 : 0, color: i < head ? GREEN : LIGHT }}>{c}</span>
                </React.Fragment>
              ))}
              {n === chars.length ? <Caret f={f} typing={false} /> : null}
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}
      {p2 > 0 ? (
        <>
          <div style={{ position: 'absolute', left: 0, right: 0, top: V ? cy - 520 : 120, textAlign: 'center', ...big(V ? 84 : 96, LIGHT), opacity: clamp01(p2 * 1.5), transform: `translateY(${lerp(30, 0, p2)}px)`, filter: p2 < 1 ? `blur(${lerp(14, 0, p2).toFixed(1)}px)` : undefined }}>
            And scattered <span style={{ color: GREEN }}>notes.</span>
          </div>
          <div style={{ position: 'absolute', left: wx, top: wy, width: 760, height: 420, transformOrigin: '0 0', transform: `scale(${ws})`, opacity: clamp01(p2 * 2) }}>
            <div style={{ transformOrigin: '50% 50%', transform: `scale(${lerp(0.85, 1, win)})` }}><NotesWindow pressed={t >= CLICK && t < CLICK + 0.25} /></div>
          </div>
          <Hand x={hand.x} y={hand.y} clickAge={f - sec(CLICK)} size={V ? 100 : 88} opacity={prog(f, sec(2.65), sec(0.15))} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};
