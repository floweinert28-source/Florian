/* Vorlage LangEase, Abschnitte 5–7 (21–35 s), ein durchgehender Ablauf:
   TradeLog als Liste (schräg) → die Hand zeigt auf den ES-Trade, die Kamera fährt auf die Zeile, „Create certificate“ erscheint,
   Klick, der Knopf wird grün, löst sich, wird groß und formt sich zum grünen Häkchen-Abzeichen, das nach rechts hinausrollt.
   Es kommt oben links zurück und hüpft über „Log.“ „Review.“ „Improve.“ Dann sammelt es sich in der Mitte, die Wortmarke
   JOURNALYST baut sich Buchstabe für Buchstabe auf, darunter wird der Satz getippt. */
import React from 'react';
import { evolvePath } from '@remotion/paths';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { clamp01, EXPO_IN, FPS, IN, lerp, OUT, pop, prog, sec, SIG, SOFT, zoomLerp } from '../anim';
import { rows, shadow } from '../app';
import { useFormat } from '../format';
import { COLS, COLS_V, TL, TradeRow } from '../scenes/Product';
import { big, DISPLAY, GREEN, LIGHT } from '../theme';
import { Bg } from '../ui/Bg';
import { Hand } from '../ui/Hand';
import { A, Btn, Icon, lerpColor, mix, mixA } from '../ui/Kit';
import { Typed, useMetrics } from '../ui/Text';

type R = { x: number; y: number; w: number; h: number };
const rl = (a: R, b: R, t: number): R => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t) });
type Cam = { s: number; x: number; y: number; rx: number; rz: number; ty: number };
const camLerp = (a: Cam, b: Cam, t: number): Cam => ({ s: zoomLerp(a.s, b.s, t), x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), rx: lerp(a.rx, b.rx, t), rz: lerp(a.rz, b.rz, t), ty: lerp(a.ty, b.ty, t) });
const P = 2600;
const camCss = (c: Cam, cx: number, cy: number) => `translate(${cx}px, ${cy + c.ty}px) rotateX(${c.rx}deg) rotateZ(${c.rz}deg) scale(${c.s}) translate(${-c.x}px, ${-c.y}px)`;
const project = (ax: number, ay: number, c: Cam, W: number, H: number) => {
  const x = (ax - c.x) * c.s, y = (ay - c.y) * c.s; const rz = (c.rz * Math.PI) / 180, rx = (c.rx * Math.PI) / 180;
  const x1 = x * Math.cos(rz) - y * Math.sin(rz), y1 = x * Math.sin(rz) + y * Math.cos(rz);
  const X = W / 2 + x1, Y = H / 2 + c.ty + y1 * Math.cos(rx), Z = y1 * Math.sin(rx); const k = P / (P - Z);
  return { x: W / 2 + (X - W / 2) * k, y: H / 2 + (Y - H / 2) * k };
};

/* Zeitplan in Sekunden ab Beginn des Abschnitts */
const T = { rows: 0, hand0: 0.4, hand1: 1.2, z0: 1.3, z1: 2.0, btn: 1.85, toBtn0: 2.15, toBtn1: 2.6, click: 2.65, lift0: 3.0, lift1: 3.45, morph0: 3.45, morph1: 3.9, exit0: 4.1, exit1: 4.6,
  back0: 4.75, back1: 5.15, words: [5.0, 6.05, 7.05], hops: [5.95, 6.95], wordsOut: 8.0, gather0: 8.0, gather1: 8.4, mark: 8.3, type: 9.1 };
export const FINALE_DURATION = 14.0;
const WORDS = ['Log.', 'Review.', 'Improve.'];

export const Finale: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS;
  const { W, H, V, cx, cy } = useFormat();

  /* ---------- TradeLog ---------- */
  const cols = V ? COLS_V : COLS; const tw = V ? 640 : 1000; const TLH = TL.title + TL.head + TL.row * 6 + 8;
  const rowY = TL.title + TL.head; const rowC = { x: tw / 2, y: rowY + TL.row / 2 };
  const camA: Cam = V ? { s: 1.56, x: tw / 2, y: TLH / 2, rx: 16, rz: -3, ty: 10 } : { s: 1.42, x: tw / 2, y: TLH / 2, rx: 16, rz: -3, ty: 20 };
  const camB: Cam = V ? { s: 1.62, x: rowC.x, y: rowC.y + 40, rx: 0, rz: 0, ty: 0 } : { s: 1.8, x: rowC.x, y: rowC.y, rx: 0, rz: 0, ty: 0 };
  const zk = prog(f, sec(T.z0), sec(T.z1 - T.z0), SIG); const cam = camLerp(camA, camB, zk);
  /* Knopf: quer in der Zeile rechts, hochkant als kleines Menü unter der Zeile */
  const BW = 214, BH = 40;
  const btnApp = V ? { x: tw - 16 - BW, y: rowY + TL.row + 18 } : { x: tw - 16 - BW, y: rowY + (TL.row - BH) / 2 };
  const btnA = prog(f, sec(T.btn), sec(0.35), OUT);
  const pressed = t >= T.click; const press = pressed && t < T.click + 0.14 ? 0.94 : 1;
  const tableOut = prog(f, sec(T.lift0), sec(T.lift1 - T.lift0), IN);
  const dimRest = prog(f, sec(T.z0), sec(0.5), SIG);
  const hoverRow = prog(f, sec(T.hand1 - 0.05), sec(0.25), OUT);

  /* Hand: erst auf die Zeile, dann auf den Knopf */
  const rowPt = project(V ? 120 : 240, rowY + TL.row * 0.62, cam, W, H);
  const btnPt = project(btnApp.x + BW * 0.62, btnApp.y + BH * 0.7, cam, W, H);
  const h1 = prog(f, sec(T.hand0), sec(T.hand1 - T.hand0), SIG), h2 = prog(f, sec(T.toBtn0), sec(T.toBtn1 - T.toBtn0), SIG);
  const from = V ? { x: W * 0.62, y: H * 1.05 } : { x: W * 0.62, y: H * 1.1 };
  const p1 = { x: lerp(from.x, rowPt.x, h1), y: lerp(from.y, rowPt.y, h1) };
  const hand = { x: lerp(p1.x, btnPt.x, h2), y: lerp(p1.y, btnPt.y, h2) - Math.sin(h2 * Math.PI) * 30 };
  const handA = prog(f, sec(T.hand0), sec(0.15)) * (1 - prog(f, sec(T.lift0), sec(0.2)));

  /* ---------- Knopf → Abzeichen ---------- */
  const scr = (x: number, y: number) => ({ x: cx + (x - camB.x) * camB.s, y: cy + (y - camB.y) * camB.s });
  const b0 = scr(btnApp.x, btnApp.y); const BTN: R = { x: b0.x, y: b0.y, w: BW * camB.s, h: BH * camB.s };
  const bigW = V ? 560 : 600; const BIG: R = { x: cx - bigW / 2, y: cy - (bigW * BH) / BW / 2, w: bigW, h: (bigW * BH) / BW };
  const D = V ? 170 : 160; const CIRC: R = { x: cx - D / 2, y: cy - D / 2, w: D, h: D };
  const lk = prog(f, sec(T.lift0), sec(T.lift1 - T.lift0), SIG), mk = prog(f, sec(T.morph0), sec(T.morph1 - T.morph0), SIG);
  let box = rl(BTN, BIG, lk); if (t >= T.morph0) box = rl(BIG, CIRC, mk);
  const boxR = t >= T.morph0 ? lerp(BIG.h * 0.3, D / 2, mk) : lerp(12 * camB.s, BIG.h * 0.3, lk);
  const labelA = 1 - prog(f, sec(T.morph0), sec(0.15), IN);
  const morphPop = t >= T.morph1 ? pop(f, sec(T.morph1 - 0.05), { damping: 8, stiffness: 200 }) : 1;
  const badgeScale = t >= T.morph1 ? 0.88 + 0.12 * morphPop : 1;
  const chk = prog(f, sec(T.morph0 + 0.25), sec(0.3), OUT);
  const ex = prog(f, sec(T.exit0), sec(T.exit1 - T.exit0), EXPO_IN);

  /* ---------- Log. Review. Improve. ---------- */
  const S = V ? 96 : 124;
  const m = useMetrics(`700 ${S}px Satoshi`, `${(-0.035 * S).toFixed(2)}px`, ['Log.', 'Log. ', 'Log. Review.', 'Log. Review. ', 'Log. Review. Improve.']);
  const full = m ? m[4].w : S * 9; const left = cx - full / 2;
  const centers = m ? [m[0].w / 2, (m[1].w + m[2].w) / 2, (m[3].w + m[4].w) / 2].map((v) => left + v) : [cx - full / 3, cx, cx + full / 3];
  const lineY = cy + (V ? 30 : 40); const bs = V ? 70 : 78; const above = lineY - S * 0.62 - bs / 2 - 8;
  const wordsOut = prog(f, sec(T.wordsOut), sec(0.25), IN);
  /* kleines Abzeichen: Bogen von links oben, dann Sprünge über die Wörter */
  const bk = prog(f, sec(T.back0), sec(T.back1 - T.back0), SOFT);
  let sb = { x: lerp(-140, centers[0], bk), y: lerp(H * 0.14, above, bk) - Math.sin(bk * Math.PI) * 60, r: lerp(-120, 0, bk) };
  T.hops.forEach((at, i) => {
    const hk = prog(f, sec(at), sec(0.42), SIG);
    if (hk > 0) sb = { x: lerp(centers[i], centers[i + 1], hk), y: above - Math.sin(hk * Math.PI) * (V ? 90 : 110), r: hk * 360 };
  });
  const gk = prog(f, sec(T.gather0), sec(T.gather1 - T.gather0), SIG);
  const gather = { x: lerp(sb.x, cx, gk), y: lerp(sb.y, cy - (V ? 20 : 30), gk) };
  const squash = (() => { /* beim Landen kurz gestaucht */
    const lands = [T.back1, ...T.hops.map((h) => h + 0.42)]; let s = 0;
    for (const l of lands) { const a = (f - sec(l)) / FPS; if (a >= 0 && a < 0.25) s = Math.sin((a / 0.25) * Math.PI) * Math.exp(-a * 6); }
    return s;
  })();
  const vanish = prog(f, sec(T.gather1 - 0.1), sec(0.25), IN);
  const ring = prog(f, sec(T.gather1 - 0.12), sec(0.7), OUT);

  /* ---------- Wortmarke und Satz ---------- */
  const MARK = 'JOURNALYST'; const MS = V ? 100 : 120;
  const glow = prog(f, sec(T.mark), sec(0.9), SIG);
  const push = 1 + 0.035 * prog(f, sec(T.gather0), sec(6), SIG);

  const Check: React.FC<{ size: number; k: number }> = ({ size, k }) => {
    const d = 'M30 51 L44 65 L72 36'; const e = evolvePath(k, d);
    return <svg viewBox="0 0 100 100" width={size} height={size} style={{ position: 'absolute', inset: 0 }}><path d={d} fill="none" stroke={A.ink} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={e.strokeDasharray} strokeDashoffset={e.strokeDashoffset} /></svg>;
  };

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Bg f={f} kind="night" />

      {/* TradeLog */}
      {tableOut < 1 ? (
        <AbsoluteFill style={{ perspective: P, opacity: 1 - tableOut, filter: tableOut > 0 ? `blur(${(tableOut * 14).toFixed(2)}px)` : undefined }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: tw, height: TLH, transformOrigin: '0 0', transform: camCss(cam, cx, cy) }}>
            <div style={{ position: 'absolute', inset: 0, background: A.surface, border: `1px solid ${A.border}`, borderRadius: 14, boxShadow: '0 60px 120px -40px rgba(0,0,0,0.7), 0 0 80px -20px rgba(52,245,138,0.15)', fontFamily: DISPLAY, color: A.text, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 20, top: 18, display: 'flex', alignItems: 'baseline', gap: 10, opacity: 1 - dimRest * 0.7 }}><span style={{ fontSize: 17, fontWeight: 600 }}>TradeLog</span><span style={{ fontSize: 12, color: A.muted }}>{shadow.actualTrades}</span></div>
              <div style={{ position: 'absolute', left: 0, right: 0, top: TL.title, height: TL.head, borderBottom: `1px solid ${A.border}`, opacity: 1 - dimRest * 0.7 }}>
                {cols.map((c) => <div key={c.k} style={{ position: 'absolute', left: c.x, width: c.w, top: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: c.r ? 'flex-end' : 'flex-start', fontSize: 12, fontWeight: 600, color: A.muted }}>{c.label}</div>)}
              </div>
              {rows.map((r, i) => {
                const a = prog(f, sec(T.rows + 0.05 + i * 0.06), sec(0.45), SOFT);
                const es = i === 0;
                return (
                  <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: rowY + TL.row * i, height: TL.row, borderTop: i ? `1px solid ${A.border}` : undefined, opacity: clamp01(a * 1.5) * (es ? 1 : 1 - dimRest * 0.75), transform: `translateY(${lerp(18, 0, a).toFixed(2)}px)`,
                    background: es ? lerpColor(A.surface, mix(A.accent, 0.09, A.surface), hoverRow) : undefined, boxShadow: es && hoverRow > 0 ? `inset 0 0 0 1px ${mixA(A.accent, 0.4 * hoverRow)}` : undefined }}>
                    {es && !V ? (
                      <div style={{ position: 'absolute', inset: 0 }}>
                        <TradeRow r={r} cols={cols.filter((c) => !['setup', 'rules'].includes(c.k) || btnA < 1)} />
                        {btnA > 0 ? <div style={{ position: 'absolute', left: 724, top: 0, width: 270, bottom: 0, background: mix(A.accent, 0.09, A.surface), opacity: btnA }} /> : null}
                      </div>
                    ) : <TradeRow r={r} cols={cols} />}
                  </div>
                );
              })}
            </div>
            {/* Knopf „Create certificate“ */}
            {btnA > 0 && t < T.lift0 ? (
              <div style={{ position: 'absolute', left: btnApp.x, top: btnApp.y, width: BW, height: BH, opacity: btnA, transform: `translateY(${lerp(8, 0, btnA)}px) scale(${press})`, transformOrigin: '50% 50%' }}>
                <Btn kind={pressed ? 'primary' : 'plain'} style={{ width: BW, height: BH, boxShadow: pressed ? `0 0 26px ${A.accentGlow}` : '0 10px 24px -10px rgba(0,0,0,0.6)' }}>
                  <Icon name="award" size={17} color={pressed ? A.ink : A.text} />Create certificate
                </Btn>
              </div>
            ) : null}
          </div>
        </AbsoluteFill>
      ) : null}

      {/* der Knopf löst sich, wird groß und zum Abzeichen */}
      {t >= T.lift0 && t < T.exit1 ? (
        <div style={{ position: 'absolute', left: box.x, top: box.y, width: box.w, height: box.h, borderRadius: boxR, background: A.accent, boxShadow: `0 0 ${lerp(26, 70, lk)}px ${A.accentGlow}, 0 30px 60px -20px rgba(0,0,0,0.6)`,
          transformOrigin: '50% 50%', transform: `translateX(${lerp(0, W / 2 + D, ex).toFixed(2)}px) rotate(${(ex * 40).toFixed(2)}deg) scale(${(badgeScale * lerp(1, 0.8, ex)).toFixed(4)})`, overflow: 'hidden' }}>
          {labelA > 0 ? (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: box.h * 0.22, fontFamily: DISPLAY, fontWeight: 600, fontSize: box.h * 0.34, color: A.ink, whiteSpace: 'nowrap', opacity: labelA }}>
              <Icon name="award" size={box.h * 0.42} color={A.ink} />Create certificate
            </div>
          ) : null}
          {chk > 0 ? <Check size={box.w} k={chk} /> : null}
        </div>
      ) : null}

      {/* Log. Review. Improve. */}
      {t >= T.words[0] - 0.05 && wordsOut < 1 ? (
        <div style={{ position: 'absolute', left: 0, right: 0, top: lineY, transform: 'translateY(-50%)', textAlign: 'center', opacity: 1 - wordsOut, filter: wordsOut > 0 ? `blur(${(wordsOut * 24).toFixed(2)}px)` : undefined }}>
          <span style={big(S, LIGHT)}>
            {WORDS.map((w, i) => { const q = prog(f, sec(T.words[i]), sec(0.5), SOFT); const c = i === 2 ? LIGHT : GREEN;
              return <React.Fragment key={w}>{i ? ' ' : ''}<span style={{ display: 'inline-block', color: c, opacity: clamp01(q * 1.6), transform: `scale(${lerp(0.88, 1, q).toFixed(4)})`, filter: q < 1 ? `blur(${lerp(16, 0, q).toFixed(2)}px)` : undefined }}>{w}</span></React.Fragment>; })}
          </span>
        </div>
      ) : null}
      {t >= T.back0 && vanish < 1 ? (
        <div style={{ position: 'absolute', left: gather.x - bs / 2, top: gather.y - bs / 2, width: bs, height: bs, borderRadius: '50%', background: A.accent, boxShadow: `0 0 30px ${A.accentGlow}`,
          transform: `rotate(${((sb.r % 360) * (1 - gk)).toFixed(1)}deg) scale(${((1 + 0.25 * gk) * (1 - vanish)).toFixed(4)}, ${((1 + 0.25 * gk) * (1 - vanish) * (1 - 0.18 * squash)).toFixed(4)})`, transformOrigin: '50% 50%' }}>
          <Check size={bs} k={1} />
        </div>
      ) : null}
      {ring > 0 && ring < 1 ? (
        <div style={{ position: 'absolute', left: cx - 40 - ring * (V ? 320 : 420), top: cy - (V ? 20 : 30) - 40 - ring * (V ? 320 : 420), width: 80 + ring * (V ? 640 : 840), height: 80 + ring * (V ? 640 : 840), borderRadius: '50%',
          border: `2px solid ${mixA(A.accent, 0.7)}`, opacity: 1 - ring }} />
      ) : null}

      {/* Wortmarke */}
      {t >= T.mark ? (
        <AbsoluteFill style={{ transform: `scale(${push})` }}>
          <AbsoluteFill style={{ background: `radial-gradient(${V ? '700px 520px' : '1000px 520px'} at 50% 50%, rgba(52,245,138,0.16), transparent 70%)`, opacity: glow }} />
          <div style={{ position: 'absolute', left: 0, right: 0, top: cy - (V ? 20 : 30), transform: 'translateY(-50%)', textAlign: 'center', fontFamily: DISPLAY, fontSize: MS, fontWeight: 800, letterSpacing: '0.06em', color: LIGHT, whiteSpace: 'pre' }}>
            {[...MARK].map((ch, i) => { const q = pop(f, sec(T.mark + i * 0.04), { damping: 12, stiffness: 170 }); const a = prog(f, sec(T.mark + i * 0.04), sec(0.3), OUT);
              return <span key={i} style={{ display: 'inline-block', opacity: a, transform: `translateY(${lerp(30, 0, Math.min(1, q)).toFixed(2)}px) scale(${lerp(0.6, 1, q).toFixed(4)})`, filter: a < 1 ? `blur(${lerp(14, 0, a).toFixed(2)}px)` : undefined }}>{ch}</span>; })}
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: cy + (V ? 70 : 80), textAlign: 'center', fontFamily: DISPLAY, fontSize: V ? 40 : 38, fontWeight: 500, color: A.text2, letterSpacing: '-0.01em' }}>
            <Typed f={f} text="The trading journal for discipline." start={sec(T.type)} cps={22} caretColor={GREEN} />
          </div>
        </AbsoluteFill>
      ) : null}

      {handA > 0 ? <Hand x={hand.x} y={hand.y} clickAge={f - sec(T.click)} size={V ? 96 : 84} opacity={handA} /> : null}
    </AbsoluteFill>
  );
};
