/* Vorlage iBanPay, 8–19,8 s: „Drop one or many CSV files“ gleitet durchs Bild, die leuchtende Pille „Import CSV“ wird zum
   Import-Fenster der App (leicht schräg im Raum). Die Hand zieht eine CSV-Datei in die Ablage, sie wird zum Datei-Chip,
   oben „into your journal“. Flug zur Tabelle: links „It reads“, rechts „every trade“, dann richtet sich die Tabelle auf,
   ein grüner Strahl fährt darüber und markiert jede Zeile. */
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { clamp01, FPS, IN, lerp, pop, prog, sec, SIG, SOFT } from '../anim';
import { rows } from '../app';
import { useFormat } from '../format';
import { big, DISPLAY, GREEN, LIGHT, NUM } from '../theme';
import { Bg } from '../ui/Bg';
import { Hand } from '../ui/Hand';
import { A, Btn, Icon, lerpColor, mixA } from '../ui/Kit';
import { BlurText } from '../ui/Text';

const FILE = 'broker-export-sep.csv';
const closed = rows.filter((r) => r.status !== 'Open');
const WW = 1200, WH = 700;
const CsvIcon: React.FC<{ s?: number }> = ({ s = 34 }) => (
  <div style={{ width: s, height: s * 1.18, borderRadius: s * 0.16, background: A.accentSoft, border: `1.5px solid ${mixA(A.accent, 0.6)}`, display: 'grid', placeItems: 'center', fontFamily: NUM, fontSize: s * 0.3, fontWeight: 800, color: A.accent, flex: 'none' }}>CSV</div>
);
/* Vorschau-Karte, die gezogen wird (300 × 200) */
const FileCard: React.FC = () => (
  <div style={{ width: 300, height: 200, borderRadius: 18, background: A.surface2, border: `1px solid ${mixA(A.accent, 0.5)}`, padding: 14, boxSizing: 'border-box', fontFamily: DISPLAY, color: A.text, boxShadow: '0 40px 70px -20px rgba(0,0,0,0.8), 0 0 40px -10px rgba(52,245,138,0.35)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><CsvIcon s={26} /><span style={{ fontSize: 15, fontWeight: 700 }}>{FILE}</span></div>
    <div style={{ marginTop: 12, borderRadius: 10, background: A.field, padding: '8px 10px', fontFamily: NUM, fontSize: 10.5, color: A.text2, lineHeight: 1.75 }}>
      {closed.slice(0, 4).map((r) => <div key={r.date} style={{ display: 'flex', justifyContent: 'space-between' }}><span>{r.day.slice(0, 5)} {r.symbol}</span><span>{r.entry}</span><span style={{ color: /^\+/.test(r.pnl) ? A.accent : A.loss }}>{r.pnl}</span></div>)}
    </div>
  </div>
);
/* Import-Fenster der App */
const DROP = { x: 452, y: 200, w: 716, h: 440 };
const ImportWindow: React.FC<{ dropped: number; hover: number }> = ({ dropped, hover }) => (
  <div style={{ position: 'relative', width: WW, height: WH, borderRadius: 20, background: A.bg, border: `1px solid ${A.border2}`, overflow: 'hidden', fontFamily: DISPLAY, color: A.text }}>
    <div style={{ height: 44, borderBottom: `1px solid ${A.border}`, display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 16, background: A.bg2 }}>
      {['#ff5f57', '#febc2e', '#28c840'].map((c) => <div key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c, opacity: 0.85 }} />)}
      <span style={{ marginLeft: 'auto', marginRight: 'auto', fontSize: 13, color: A.muted, fontWeight: 600, transform: 'translateX(-30px)' }}>Journalyst</span>
    </div>
    <div style={{ position: 'absolute', left: 0, top: 44, bottom: 0, width: 64, borderRight: `1px solid ${A.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, paddingTop: 22 }}>
      {['dashboard', 'tradelog', 'journal', 'shadow', 'stats'].map((ic, i) => <div key={ic} style={{ width: 38, height: 38, borderRadius: 11, display: 'grid', placeItems: 'center', background: i === 1 ? A.accentSoft : 'transparent' }}><Icon name={ic} size={20} color={i === 1 ? A.accent : A.muted} /></div>)}
    </div>
    <div style={{ position: 'absolute', left: 84, top: 58, display: 'flex', gap: 10 }}>
      <Btn kind="primary" style={{ height: 40, width: 170, boxShadow: `0 0 20px ${A.accentGlow}` }}><Icon name="plus" size={16} color={A.ink} sw={2.4} />Import CSV</Btn>
      <Btn style={{ height: 40 }}><Icon name="plus" size={16} color={A.text2} />Log trade</Btn>
      <Btn style={{ height: 40 }}><Icon name="calendar" size={16} color={A.text2} />September 2026</Btn>
    </div>
    <div style={{ position: 'absolute', right: 24, top: 58, width: 260, height: 40, borderRadius: 11, background: A.field, border: `1px solid ${A.border2}`, display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', boxSizing: 'border-box', fontSize: 13.5, color: A.muted }}><Icon name="search" size={16} color={A.muted} />Search</div>
    <div style={{ position: 'absolute', left: 64, top: 118, width: 372, bottom: 0, borderRight: `1px solid ${A.border}` }}>
      <div style={{ padding: '14px 20px', fontSize: 18, fontWeight: 700 }}>TradeLog</div>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderTop: `1px solid ${A.border}` }}>
          <div style={{ width: 36, height: 36, borderRadius: 18, background: A.surface2 }} />
          <div style={{ flex: 1 }}><div style={{ width: 120 + (i % 2) * 40, height: 9, borderRadius: 5, background: A.surface3 }} /><div style={{ width: 200, height: 7, borderRadius: 4, background: A.surface2, marginTop: 9 }} /></div>
        </div>
      ))}
    </div>
    <div style={{ position: 'absolute', left: DROP.x, top: 130, width: DROP.w, height: 46, borderRadius: 12, background: A.surface, border: `1px solid ${A.border2}`, display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', boxSizing: 'border-box', fontSize: 15 }}>
      <span style={{ color: A.muted }}>Account:</span><b>Main account</b><Icon name="chev" size={15} color={A.muted} style={{ marginLeft: 'auto' }} />
    </div>
    <div style={{ position: 'absolute', left: DROP.x, top: DROP.y, width: DROP.w, height: DROP.h, borderRadius: 18, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14,
      border: `2px ${dropped > 0.5 ? 'solid' : 'dashed'} ${lerpColor(A.border2, A.accent, Math.max(hover, dropped))}`, background: mixA(A.accent, 0.03 + 0.06 * Math.max(hover, dropped)) }}>
      {dropped < 1 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: 1 - dropped }}>
          <svg width={46} height={46} viewBox="0 0 24 24" fill="none" stroke={A.accent} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><path d="M12 15V4M7.5 8.5L12 4l4.5 4.5" /><path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" /></svg>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Drop your broker export here</div>
          <div style={{ fontSize: 14, color: A.muted }}>CSV · one or many files</div>
        </div>
      ) : null}
    </div>
  </div>
);

/* Tabelle der Datei (760 × 440) */
const COL = [{ k: 'time', l: 'Time', x: 24, w: 170 }, { k: 'symbol', l: 'Symbol', x: 200, w: 80 }, { k: 'side', l: 'Side', x: 286, w: 80 }, { k: 'entry', l: 'Entry', x: 372, w: 120, r: true }, { k: 'exit', l: 'Exit', x: 500, w: 120, r: true }, { k: 'pnl', l: 'P&L', x: 626, w: 110, r: true }];
const ROW0 = 112, RH = 56;
const Sheet: React.FC<{ hl: number[] }> = ({ hl }) => (
  <div style={{ position: 'relative', width: 760, height: 440, borderRadius: 18, background: A.surface, border: `1px solid ${A.border2}`, overflow: 'hidden', fontFamily: NUM, color: A.text }}>
    <div style={{ height: 52, display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px', borderBottom: `1px solid ${A.border}`, fontFamily: DISPLAY }}><CsvIcon s={24} /><b style={{ fontSize: 16 }}>{FILE}</b><span style={{ marginLeft: 'auto', fontSize: 13, color: A.muted }}>42 rows</span></div>
    <div style={{ position: 'absolute', left: 0, right: 0, top: 52, height: 60, borderBottom: `1px solid ${A.border}` }}>{COL.map((c) => <div key={c.k} style={{ position: 'absolute', left: c.x, width: c.w, top: 22, textAlign: c.r ? 'right' : 'left', fontSize: 12.5, fontWeight: 600, color: A.muted, fontFamily: DISPLAY }}>{c.l}</div>)}</div>
    {closed.map((r, i) => (
      <div key={r.date} style={{ position: 'absolute', left: 10, right: 10, top: ROW0 + i * RH + 4, height: RH - 8, borderRadius: 10, background: mixA(A.accent, 0.13 * (hl[i] ?? 0)), boxShadow: (hl[i] ?? 0) > 0 ? `inset 0 0 0 1px ${mixA(A.accent, 0.4 * hl[i])}` : undefined }}>
        {COL.map((c) => {
          const v = c.k === 'time' ? `${r.day.slice(0, 5)} ${r.time}` : c.k === 'symbol' ? r.symbol : c.k === 'side' ? (r.side === 'LONG' ? 'Buy' : 'Sell') : c.k === 'entry' ? r.entry : c.k === 'exit' ? r.exit : r.pnl;
          return <div key={c.k} style={{ position: 'absolute', left: c.x - 10, width: c.w, top: 15, textAlign: c.r ? 'right' : 'left', fontSize: 14.5, fontWeight: c.k === 'symbol' ? 700 : 500, color: c.k === 'pnl' ? (/^\+/.test(r.pnl) ? A.accent : A.loss) : c.k === 'time' ? A.text2 : A.text }}>{v}</div>;
        })}
      </div>
    ))}
  </div>
);

export const P2_DURATION = 11.8;
export const Part2: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS;
  const { W, V, cx, cy } = useFormat();
  /* 1: Zeile gleitet */
  const glide = prog(f, 0, sec(1.6), (x) => x); const out1 = prog(f, sec(1.45), sec(0.18), IN);
  /* 2: Pille → Fenster */
  const btnIn = prog(f, sec(1.6), sec(0.35), SOFT); const mk = prog(f, sec(2.0), sec(0.9), SIG);
  const WS = V ? 0.86 : 1.22; const wcx = cx, wcy = V ? cy + 120 : cy + 60;
  const B: { x: number; y: number; w: number; h: number } = { x: cx - (V ? 270 : 290), y: cy - 50, w: V ? 540 : 580, h: 100 };
  const WR = { x: wcx - (WW * WS) / 2, y: wcy - (WH * WS) / 2, w: WW * WS, h: WH * WS };
  const box = { x: lerp(B.x, WR.x, mk), y: lerp(B.y, WR.y, mk), w: lerp(B.w, WR.w, mk), h: lerp(B.h, WR.h, mk) };
  const winA = prog(f, sec(2.3), sec(0.45)); const tilt = prog(f, sec(2.9), sec(0.8), SIG);
  const pull = lerp(1.06, 1, prog(f, sec(2.6), sec(1.2), SIG));
  /* Ziehen und Ablegen */
  const drag = prog(f, sec(3.0), sec(1.4), SIG); const drop = prog(f, sec(4.45), sec(0.4), SOFT);
  const start = { x: WW + 260, y: WH + 120 }, end = { x: DROP.x + DROP.w / 2 - 150, y: DROP.y + DROP.h / 2 - 100 };
  const card = { x: lerp(start.x, end.x, drag), y: lerp(start.y, end.y, drag) - Math.sin(drag * Math.PI) * 80 };
  const hover = prog(f, sec(3.9), sec(0.3));
  const toScr = (x: number, y: number) => ({ x: wcx + (x - WW / 2) * WS * pull, y: wcy + (y - WH / 2) * WS * pull });
  const grip = toScr(card.x + 210, card.y + 150);
  const handA = prog(f, sec(2.95), sec(0.15)) * (1 - prog(f, sec(4.7), sec(0.2)));
  const into = prog(f, sec(4.9), sec(0.4));
  const winOut = prog(f, sec(6.0), sec(0.2), IN);
  /* 3: Tabelle */
  const dIn = prog(f, sec(6.1), sec(0.6), SOFT); const upright = prog(f, sec(8.0), sec(0.75), SIG);
  const side = prog(f, sec(6.25), sec(0.55), SOFT) * (1 - prog(f, sec(8.0), sec(0.4), IN));
  const DS = (V ? lerp(0.95, 1.28, upright) : lerp(0.85, 1.3, upright)) * lerp(0.1, 1, dIn) * lerp(1, 0.95, prog(f, sec(10.25), sec(1.2), SIG));
  const scan = prog(f, sec(9.5), sec(0.65), (x) => x); const beamY = lerp(ROW0 - 20, ROW0 + closed.length * RH + 10, scan);
  const hl = closed.map((_, i) => prog(f, sec(9.5 + 0.65 * ((ROW0 + i * RH + RH / 2 - (ROW0 - 20)) / (closed.length * RH + 30))), sec(0.25)));
  const docOut = prog(f, sec(10.3), sec(1.2), IN); const fade = prog(f, sec(11.5), sec(0.3));
  const glow = upright;
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Bg f={f} kind="night" />
      {out1 < 1 ? (
        <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 1 - out1, filter: out1 > 0 ? `blur(${(out1 * 20).toFixed(1)}px)` : undefined }}>
          <div style={{ ...big(V ? 80 : 100, LIGHT), transform: `translateX(${lerp(V ? 160 : 260, V ? -60 : -120, glide).toFixed(1)}px)`, whiteSpace: V ? 'normal' : 'pre', width: V ? 740 : undefined, textAlign: 'center' }}>
            <BlurText f={f} text="Drop one or many CSV files" start={0} stagger={0.1} dur={0.45} blur={14} color={(i) => (i >= 4 ? GREEN : LIGHT)} />
          </div>
        </AbsoluteFill>
      ) : null}

      {btnIn > 0 && winOut < 1 ? (
        <AbsoluteFill style={{ perspective: 1800, opacity: 1 - winOut }}>
          {t < 2.95 ? (
            <div style={{ position: 'absolute', left: box.x, top: box.y, width: box.w, height: box.h, borderRadius: lerp(50, 20, mk), background: lerpColor(A.accent, A.bg, mk), border: `1px solid ${mk > 0.5 ? A.border2 : A.accent}`,
              transform: `scale(${lerp(0.5, 1, btnIn)})`, filter: btnIn < 1 ? `blur(${lerp(10, 0, btnIn).toFixed(1)}px)` : undefined, opacity: clamp01(btnIn * 2), overflow: 'hidden',
              boxShadow: `0 0 ${lerp(50, 20, mk)}px ${A.accentGlow}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontFamily: DISPLAY, fontSize: 40, fontWeight: 700, color: A.ink, opacity: 1 - clamp01(mk * 3) }}><Icon name="plus" size={38} color={A.ink} sw={2.6} />Import CSV</div>
              {winA > 0 ? <div style={{ position: 'absolute', left: 0, top: 0, width: WW, height: WH, transformOrigin: '0 0', transform: `scale(${box.w / WW})`, opacity: winA }}><ImportWindow dropped={0} hover={0} /></div> : null}
            </div>
          ) : (
            <div style={{ position: 'absolute', left: WR.x, top: WR.y, width: WW, height: WH, transformOrigin: '0 0', transform: `scale(${WS})` }}>
              <div style={{ position: 'absolute', inset: 0, transformOrigin: '50% 50%', transform: `scale(${pull}) rotateY(${(-7 * tilt).toFixed(2)}deg) rotateX(${(4 * tilt).toFixed(2)}deg)`,
                boxShadow: '0 0 0 1px rgba(255,255,255,0.03)', borderRadius: 20 }}>
                <div style={{ position: 'absolute', inset: -2, borderRadius: 22, boxShadow: `0 -10px 80px -10px rgba(52,245,138,${(0.35 * tilt).toFixed(2)}), 0 60px 140px -40px rgba(0,0,0,0.8)` }} />
                <ImportWindow dropped={drop} hover={hover} />
                {drop < 1 ? <div style={{ position: 'absolute', left: card.x, top: card.y, transform: `rotate(${lerp(8, 0, drag)}deg)`, opacity: clamp01(drag * 4) * (1 - drop) }}><FileCard /></div> : null}
                {drop > 0 ? (
                  <div style={{ position: 'absolute', left: DROP.x + DROP.w / 2, top: DROP.y + DROP.h / 2, transform: `translate(-50%, -50%) scale(${lerp(1.4, 1, drop)})`, opacity: clamp01(drop * 2), display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 18px', borderRadius: 14, background: A.surface2, border: `1px solid ${mixA(A.accent, 0.5)}`, fontFamily: DISPLAY, color: A.text, boxShadow: `0 0 30px -6px ${A.accentGlow}` }}>
                    <CsvIcon s={34} /><div><div style={{ fontSize: 17, fontWeight: 700 }}>{FILE}</div><div style={{ fontFamily: NUM, fontSize: 13, color: A.muted, marginTop: 4 }}>42 trades · 18 KB</div></div>
                    <div style={{ marginLeft: 10, width: 30, height: 30, borderRadius: 15, background: A.accent, display: 'grid', placeItems: 'center', transform: `scale(${pop(f, sec(4.75), { damping: 10, stiffness: 200 })})` }}><Icon name="check" size={16} color={A.ink} sw={3} /></div>
                  </div>
                ) : null}
              </div>
            </div>
          )}
          {handA > 0 ? <Hand x={grip.x} y={grip.y} size={V ? 96 : 92} opacity={handA} clickAge={f - sec(3.0)} /> : null}
          {into > 0 ? (
            <div style={{ position: 'absolute', left: 0, right: 0, top: V ? 260 : 46, textAlign: 'center', ...big(V ? 84 : 76, LIGHT) }}>
              <BlurText f={f} text="into your journal" start={sec(4.9)} stagger={0.12} dur={0.45} blur={12} rise={18} color={(i) => (i === 2 ? GREEN : LIGHT)} />
            </div>
          ) : null}
        </AbsoluteFill>
      ) : null}

      {dIn > 0 ? (
        <AbsoluteFill style={{ perspective: 1600, opacity: 1 - fade }}>
          <AbsoluteFill style={{ background: 'radial-gradient(900px 640px at 50% 50%, rgba(52,245,138,0.14), transparent 70%)', opacity: dIn }} />
          <div style={{ position: 'absolute', left: cx - 380, top: cy - 220, width: 760, height: 440, transform: `scale(${DS}) rotateY(${lerp(V ? 0 : 10, 0, upright).toFixed(2)}deg) rotateX(${lerp(V ? 8 : 4, 0, upright).toFixed(2)}deg)`,
            filter: docOut > 0 ? `blur(${(docOut * 10).toFixed(1)}px)` : undefined, opacity: clamp01(dIn * 2) }}>
            <div style={{ position: 'absolute', inset: -3, borderRadius: 21, boxShadow: `0 0 0 ${(2 * glow).toFixed(1)}px ${mixA(A.accent, 0.55 * glow)}, 0 0 ${(70 * glow).toFixed(0)}px ${mixA(A.accent, 0.3 * glow)}` }} />
            <Sheet hl={hl} />
            {scan > 0 && scan < 1 ? (
              <div style={{ position: 'absolute', left: -20, right: -20, top: beamY, height: 3, borderRadius: 2, background: `linear-gradient(90deg, transparent, ${GREEN} 15%, #c9ffe0 50%, ${GREEN} 85%, transparent)`, boxShadow: `0 0 18px 4px rgba(52,245,138,0.55)` }}>
                <div style={{ position: 'absolute', left: 20, right: 20, bottom: 3, height: 70, background: 'linear-gradient(0deg, rgba(52,245,138,0.16), transparent)' }} />
              </div>
            ) : null}
          </div>
          {side > 0 ? (
            V ? (
              <>
                <div style={{ position: 'absolute', left: 0, right: 0, top: cy - 520, textAlign: 'center', ...big(92, LIGHT), opacity: side, transform: `translateY(${lerp(80, 0, side)}px)`, filter: side < 1 ? `blur(${lerp(12, 0, side).toFixed(1)}px)` : undefined }}>It reads</div>
                <div style={{ position: 'absolute', left: 0, right: 0, top: cy + 400, textAlign: 'center', ...big(92, GREEN), opacity: side, transform: `translateY(${lerp(-80, 0, side)}px)`, filter: side < 1 ? `blur(${lerp(12, 0, side).toFixed(1)}px)` : undefined }}>every trade</div>
              </>
            ) : (
              <>
                <div style={{ position: 'absolute', right: W - (cx - 380 * DS) + 40, top: cy, transform: `translate(${lerp(160, 0, side)}px, -50%)`, ...big(88, LIGHT), opacity: side, filter: side < 1 ? `blur(${lerp(12, 0, side).toFixed(1)}px)` : undefined }}>It reads</div>
                <div style={{ position: 'absolute', left: cx + 380 * DS + 40, top: cy, transform: `translate(${lerp(-160, 0, side)}px, -50%)`, ...big(88, GREEN), opacity: side, filter: side < 1 ? `blur(${lerp(12, 0, side).toFixed(1)}px)` : undefined }}>every trade</div>
              </>
            )
          ) : null}
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
