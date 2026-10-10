/* Vorlage LangEase, Abschnitt 2 (5,1–10,3 s): „Just drop and go.“ Wort für Wort, dann fliegen vier Handys mit der App
   aus den Ecken in den Raum. In der Mitte: „Trades. Rules. Stats.“ → „All in one journal.“ Zum Schluss fliegt die Kamera
   in das Handy mit der Disziplin-Anzeige; deren Balken wird im nächsten Abschnitt groß. */
import React from 'react';
import { AbsoluteFill, Easing, useCurrentFrame } from 'remotion';
import { clamp01, FPS, IN, lerp, prog, sec, SIG, SOFT, zoomLerp } from '../anim';
import { useFormat } from '../format';
import { big, GREEN, LIGHT } from '../theme';
import { Bg } from '../ui/Bg';
import { A, lerpColor } from '../ui/Kit';
import { Phone, PHONE, Screen } from '../ui/Phone';

/* Ziel des Durchflugs: der Balken „Discipline score“ im Handy (Handy-Pixel) und seine Lage im nächsten Abschnitt */
export const BAR_IN_PHONE = { x: 165, y: 228, w: 242 };
export const barLayout = (W: number, H: number, V: boolean) => (V ? { x: 140, y: 948, w: 800, h: 22 } : { x: 460, y: 548, w: 1000, h: 24 });

const ZOOM = Easing.bezier(0.6, 0, 0.3, 1);
const TEXT_SHADOW = '0 0 40px rgba(6,8,7,0.95), 0 0 90px rgba(6,8,7,0.8)';

type Pose = { x: number; y: number; rx: number; ry: number; rz: number };
export const PHONES_DURATION = 5.2;
export const Phones: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS;
  const { W, H, V, cx, cy } = useFormat();
  const S = V ? 86 : 96; const ps = V ? 0.98 : 0.92;
  const C = { x: PHONE.w / 2, y: PHONE.h / 2 };
  const list: { screen: Screen; pose: Pose; origin: { x: number; y: number } }[] = V
    ? [
      { screen: 'dashboard', pose: { x: 225, y: 410, rx: 8, ry: 18, rz: -11 }, origin: C },
      { screen: 'score', pose: { x: 860, y: 370, rx: 8, ry: -18, rz: 10 }, origin: C },
      { screen: 'tradelog', pose: { x: 220, y: 1530, rx: -8, ry: 16, rz: 9 }, origin: C },
      { screen: 'rules', pose: { x: 855, y: 1565 + (BAR_IN_PHONE.y - C.y) * ps, rx: -8, ry: -16, rz: -9 }, origin: BAR_IN_PHONE },
    ]
    : [
      { screen: 'dashboard', pose: { x: 290, y: 245, rx: 8, ry: 18, rz: -12 }, origin: C },
      { screen: 'score', pose: { x: 1640, y: 230, rx: 8, ry: -18, rz: 10 }, origin: C },
      { screen: 'tradelog', pose: { x: 300, y: 870, rx: -8, ry: 16, rz: 9 }, origin: C },
      { screen: 'rules', pose: { x: 1630, y: 865 + (BAR_IN_PHONE.y - C.y) * ps, rx: -8, ry: -16, rz: -9 }, origin: BAR_IN_PHONE },
    ];
  const bar = barLayout(W, H, V); const sF = bar.w / BAR_IN_PHONE.w;
  const zk = prog(f, sec(4.25), sec(0.9), ZOOM);
  const gs = lerp(1.07, 1, prog(f, sec(1.35), sec(2.4), SIG));
  const screenT = prog(f, sec(1.7), sec(1.3), SIG);
  const pulse = [1.75, 2.2, 2.65].reduce((a, at) => a + 0.035 * Math.sin(Math.PI * prog(f, sec(at), sec(0.32), SIG)), 0);
  const glowFor = (s: Screen) => {
    const w = (at: number, on: boolean) => (on ? prog(f, sec(at), sec(0.2)) * (1 - prog(f, sec(at + 0.5), sec(0.35))) : 0);
    return w(1.75, s === 'tradelog') + w(2.2, s === 'rules') + w(2.65, s === 'score' || s === 'dashboard');
  };

  /* Texte */
  const word = (at: number) => prog(f, sec(at), sec(0.42), SOFT);
  const unit = (k: number, color: string): React.CSSProperties => ({ display: 'inline-block', color, opacity: clamp01(k * 1.6), transform: `translateY(${lerp(22, 0, k).toFixed(2)}px)`, filter: k < 1 ? `blur(${lerp(10, 0, k).toFixed(2)}px)` : undefined });
  const out1 = prog(f, sec(1.4), sec(0.16), IN), out2 = prog(f, sec(3.15), sec(0.16), IN), out3 = prog(f, sec(4.15), sec(0.2), IN);
  const L1 = [['Just', GREEN, 0.15], ['drop', '#8af5b9', 0.45], ['and', LIGHT, 0.72], ['go.', A.text2, 0.97]] as const;
  const L2 = [['Trades.', 1.75], ['Rules.', 2.2], ['Stats.', 2.65]] as const;
  const l3 = prog(f, sec(3.25), sec(0.55), SOFT);
  const lineStyle = (k: number): React.CSSProperties => ({ ...big(S, LIGHT), textShadow: TEXT_SHADOW, opacity: 1 - k, filter: k > 0 ? `blur(${(k * 28).toFixed(2)}px)` : undefined });

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Bg f={f} kind="night" />
      <AbsoluteFill style={{ perspective: 2400 }}>
        {list.map((p, i) => {
          const k = prog(f, sec(1.35 + i * 0.07), sec(0.8), SOFT);
          if (k <= 0) return null;
          const dx = Math.sign(p.pose.x - cx) || 1, dy = Math.sign(p.pose.y - cy) || 1;
          const bob = Math.sin(t * 1.3 + i * 1.7) * 6;
          const target = i === 3;
          /* Grundlage: aus der Ecke einfliegen, dann leicht schweben; die Gruppe zieht sich langsam zurück */
          let x = cx + (p.pose.x - cx) * gs + dx * lerp(900, 0, k), y = cy + (p.pose.y - cy) * gs + dy * lerp(700, 0, k) + bob * k;
          let rx = p.pose.rx, ry = p.pose.ry + dx * lerp(55, 0, k), rz = p.pose.rz + dx * dy * lerp(35, 0, k), sc = ps * lerp(0.55, 1, k) * (1 + pulse);
          let op = clamp01(k * 2.5);
          if (zk > 0) {
            if (target) { x = lerp(x, bar.x + bar.w / 2, zk); y = lerp(y, bar.y + bar.h / 2, zk); rx = lerp(rx, 0, zk); ry = lerp(ry, 0, zk); rz = lerp(rz, 0, zk); sc = zoomLerp(sc, sF, zk); }
            else { x = cx + (x - cx) * lerp(1, 2.2, zk); y = cy + (y - cy) * lerp(1, 2.2, zk); op *= 1 - clamp01(zk * 2); }
          }
          return (
            <div key={p.screen} style={{ position: 'absolute', left: x - p.origin.x, top: y - p.origin.y, width: PHONE.w, height: PHONE.h, transformOrigin: `${p.origin.x}px ${p.origin.y}px`,
              transform: `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg) scale(${sc.toFixed(4)})`, opacity: op, zIndex: target ? 2 : 1 }}>
              <Phone screen={p.screen} t={p.screen === 'rules' ? 1 : screenT} glow={glowFor(p.screen)} style={{ left: 0, top: 0 }} />
            </div>
          );
        })}
      </AbsoluteFill>

      {/* Just drop and go. */}
      {out1 < 1 ? (
        <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={lineStyle(out1)}>{L1.map(([w, c, at], i) => <React.Fragment key={w}>{i ? ' ' : ''}<span style={unit(word(at), c)}>{w}</span></React.Fragment>)}</div>
        </AbsoluteFill>
      ) : null}
      {/* Trades. Rules. Stats. – das neueste Wort leuchtet grün */}
      {t >= 1.7 && out2 < 1 ? (
        <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={lineStyle(out2)}>{L2.map(([w, at], i) => {
            const next = L2[i + 1]; const cool = next ? prog(f, sec(next[1]), sec(0.3)) : 0;
            return <React.Fragment key={w}>{i ? ' ' : ''}<span style={unit(word(at), lerpColor(GREEN, LIGHT, cool))}>{w}</span></React.Fragment>;
          })}</div>
        </AbsoluteFill>
      ) : null}
      {/* All in one journal. */}
      {l3 > 0 && out3 < 1 ? (
        <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ ...lineStyle(out3), transform: `scale(${lerp(0.9, 1, l3)})`, opacity: clamp01(l3 * 1.5) * (1 - out3), filter: l3 < 1 ? `blur(${lerp(36, 0, l3).toFixed(2)}px)` : out3 > 0 ? `blur(${(out3 * 28).toFixed(2)}px)` : undefined }}>
            All in one <span style={{ color: GREEN }}>journal.</span>
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
