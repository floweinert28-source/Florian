/* Vorlage iBanPay, 35–47,5 s: Regel-Prüfung (im Vorbild: Freigaben). Zwei Regeln gleiten herein und werden abgehakt,
   sie verschmelzen zur leuchtenden Pille „Plan followed“, die zum Lade-Kreis wird; der grüne Ring schließt sich, Häkchen,
   „Trade reviewed“, darunter „Create certificate“. Flug durch die Fläche in den hellgrünen Schluss:
   „Save time. Spot mistakes.“ → „Stay disciplined.“ mit wachsendem Stern aus Bögen → Raute → Wortmarke JOURNALYST,
   unten wird „Start your journal“ getippt. Harter Schnitt auf Schwarz. */
import React from 'react';
import { evolvePath } from '@remotion/paths';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { clamp01, EXPO_IN, FPS, IN, lerp, OUT, pop, prog, sec, SIG, SOFT } from '../anim';
import { rules } from '../app';
import { useFormat } from '../format';
import { big, DISPLAY, GREEN, LIGHT } from '../theme';
import { Bg } from '../ui/Bg';
import { A, Icon, mixA } from '../ui/Kit';
import { Caret } from '../ui/Text';
import { Guide } from '../v3/Parts';
import { GlowPill } from './Part1';

const RW = 680;
const RuleCard: React.FC<{ icon: string; name: string; sub: string; check: number }> = ({ icon, name, sub, check }) => (
  <div style={{ width: RW, height: 96, boxSizing: 'border-box', padding: '0 22px', borderRadius: 18, background: A.surface, border: `1px solid ${A.border2}`, display: 'flex', alignItems: 'center', gap: 16, fontFamily: DISPLAY, color: A.text, boxShadow: '0 30px 60px -30px rgba(0,0,0,0.8)' }}>
    <div style={{ width: 52, height: 52, borderRadius: 26, background: A.surface3, display: 'grid', placeItems: 'center' }}><Icon name={icon} size={24} color={A.text2} /></div>
    <div><div style={{ fontSize: 20, fontWeight: 700 }}>{name}</div><div style={{ fontSize: 15, color: A.muted, marginTop: 4 }}>{sub}</div></div>
    <div style={{ marginLeft: 'auto', width: 40, height: 40, borderRadius: 20, display: 'grid', placeItems: 'center', background: check > 0.01 ? A.accent : A.surface2, border: check > 0.01 ? undefined : `1.5px dashed ${A.border2}`,
      transform: `scale(${check > 0.01 ? check : 1})`, boxShadow: check > 0.01 ? `0 0 18px ${A.accentGlow}` : undefined }}>{check > 0.01 ? <Icon name="check" size={20} color={A.ink} sw={3} /> : null}</div>
  </div>
);

/* Stern aus vier Bögen (wie im Vorbild um „Stay in control“) */
const Aura: React.FC<{ k: number; cx: number; cy: number; r: number }> = ({ k, cx, cy, r }) => (
  <svg width={cx * 2} height={cy * 2} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
    {[1, 0.78, 0.56].map((m, i) => {
      const R = r * m * lerp(0.6, 1.4, k);
      return <path key={i} d={`M ${cx} ${cy - R} Q ${cx} ${cy} ${cx + R * 1.6} ${cy} Q ${cx} ${cy} ${cx} ${cy + R} Q ${cx} ${cy} ${cx - R * 1.6} ${cy} Q ${cx} ${cy} ${cx} ${cy - R} Z`} fill="none" stroke={GREEN} strokeWidth={1.6} strokeOpacity={lerp(0.8, 0.3, k) * (1 - i * 0.2)} />;
    })}
  </svg>
);

export const P5_DURATION = 12.5;
export const Part5: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS;
  const { H, V, cx, cy } = useFormat();
  /* 1: Regeln */
  const head = prog(f, sec(0.1), sec(0.35), SOFT);
  const r1 = prog(f, sec(0.375), sec(0.45), SOFT), r2 = prog(f, sec(1.125), sec(0.45), SOFT);
  const c1 = pop(f, sec(0.875), { damping: 10, stiffness: 220 }), c2 = pop(f, sec(1.625), { damping: 10, stiffness: 220 });
  const merge = prog(f, sec(2.0), sec(0.3), SIG); const pillPop = pop(f, sec(2.2), { damping: 10, stiffness: 200 });
  const toCircle = prog(f, sec(3.1), sec(0.2), SIG); const ring = prog(f, sec(3.25), sec(0.4), OUT); const chk = prog(f, sec(3.6), sec(0.25), OUT);
  const sent = prog(f, sec(4.35), sec(0.4), SOFT), dl = prog(f, sec(4.6), sec(0.4), SOFT);
  const blow = prog(f, sec(5.2), sec(0.4), EXPO_IN);
  const rs = V ? 1.38 : 1.45; const PW = V ? 640 : 700, PH = 120;
  const pw = lerp(PW, 160, toCircle), ph = lerp(PH, 160, toCircle);
  /* 2: Schluss */
  const aurora = prog(f, sec(5.35), sec(0.3));
  const S = V ? 96 : 120;
  const w = (at: number) => prog(f, sec(at), sec(0.35), SOFT);
  const out1 = prog(f, sec(7.05), sec(0.12), IN);
  const auraK = prog(f, sec(7.3), sec(1.3), SIG); const collapse = prog(f, sec(8.65), sec(0.22), EXPO_IN);
  const dia = pop(f, sec(8.85), { damping: 9, stiffness: 200 }); const reveal = prog(f, sec(9.3), sec(0.5), SIG);
  const pill = prog(f, sec(9.75), sec(0.35), SOFT); const CTA = 'Start your journal'; const n = t < 9.95 ? 0 : Math.min(CTA.length, Math.floor((t - 9.95) / 0.05) + 1);
  const cut = t >= 12.12;
  const slide = (k: number, dx = 30): React.CSSProperties => ({ display: 'inline-block', opacity: clamp01(k * 1.6), transform: `translateX(${lerp(dx, 0, k)}px)`, filter: k < 1 ? `blur(${lerp(12, 0, k).toFixed(1)}px)` : undefined });
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Bg f={f} kind="night" />
      {aurora > 0 ? <AbsoluteFill style={{ opacity: aurora }}><Bg f={f} kind="aurora" /></AbsoluteFill> : null}

      {blow < 1 ? (
        <AbsoluteFill style={{ transformOrigin: `${cx}px ${cy}px`, transform: `scale(${lerp(1, 4.5, blow)}, ${lerp(1, 4.9, blow)})`, opacity: 1 - blow }}>
          <AbsoluteFill style={{ background: 'radial-gradient(800px 600px at 50% 50%, rgba(52,245,138,0.14), transparent 70%)' }} />
          {merge < 1 ? (
            <div style={{ position: 'absolute', left: cx - (RW * rs) / 2, top: cy - (V ? 260 : 250), width: RW, transformOrigin: '0 0', transform: `scale(${rs})`, opacity: 1 - merge }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px 14px', fontFamily: DISPLAY, fontSize: 15, fontWeight: 600, color: A.muted, opacity: head }}><span>Rule check</span><span>Status</span></div>
              {[{ k: r1, c: c1, icon: 'tradelog', name: rules[0].name, sub: `1 of ${rules[0].value} ${rules[0].unit.toLowerCase()}` }, { k: r2, c: c2, icon: 'calendar', name: rules[2].name, sub: `Waited ${rules[2].value} ${rules[2].unit.toLowerCase()}` }].map((r, i) => (
                <div key={i} style={{ marginTop: i ? 14 : 0, opacity: clamp01(r.k * 1.5), transform: `translateY(${lerp(30, 0, r.k) + merge * (i ? -60 : 60)}px) scale(${lerp(1, 0.6, merge)})` }}><RuleCard icon={r.icon} name={r.name} sub={r.sub} check={r.c} /></div>
              ))}
            </div>
          ) : null}
          {merge > 0 ? (
            <div style={{ position: 'absolute', left: cx - pw / 2, top: cy - ph / 2 - (V ? 60 : 50) * clamp01(toCircle), transform: `scale(${toCircle > 0 ? 1 : lerp(0.8, 1, pillPop)})`, opacity: clamp01(merge * 2) }}>
              {toCircle < 1 ? (
                <GlowPill f={f} w={pw} h={ph}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: DISPLAY, fontSize: 44, fontWeight: 700, color: LIGHT, opacity: 1 - toCircle * 3, whiteSpace: 'nowrap' }}><Icon name="check" size={36} color={A.accent} sw={3} />Plan followed</div>
                </GlowPill>
              ) : (
                <svg width={160} height={160} viewBox="0 0 160 160" style={{ overflow: 'visible' }}>
                  <circle cx={80} cy={80} r={70} fill="none" stroke={A.surface3} strokeWidth={6} />
                  <circle cx={80} cy={80} r={70} fill="none" stroke={GREEN} strokeWidth={6} strokeLinecap="round" pathLength={100} strokeDasharray={`${(100 * ring).toFixed(2)} 100`} transform="rotate(-90 80 80)" style={{ filter: 'drop-shadow(0 0 10px rgba(52,245,138,0.7))' }} />
                  {ring < 1 ? <circle cx={80} cy={80} r={70} fill="none" stroke={GREEN} strokeOpacity={0.5} strokeWidth={6} pathLength={100} strokeDasharray="18 100" transform={`rotate(${(t * 720) % 360} 80 80)`} /> : null}
                  {(() => { const d = 'M50 82 L72 104 L112 60'; const e = evolvePath(chk, d); return <path d={d} fill="none" stroke={LIGHT} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={e.strokeDasharray} strokeDashoffset={e.strokeDashoffset} />; })()}
                </svg>
              )}
            </div>
          ) : null}
          {sent > 0 ? (
            <div style={{ position: 'absolute', left: 0, right: 0, top: cy + (V ? 70 : 60), textAlign: 'center' }}>
              <div style={{ ...big(V ? 64 : 60, LIGHT, 600), opacity: sent, transform: `translateY(${lerp(14, 0, sent)}px)` }}>Trade reviewed</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 24, padding: '14px 26px', borderRadius: 999, border: `1px solid ${mixA(A.accent, 0.5)}`, background: mixA(A.accent, 0.08), fontFamily: DISPLAY, fontSize: V ? 26 : 24, fontWeight: 600, color: LIGHT, opacity: dl, transform: `translateY(${lerp(10, 0, dl)}px)` }}>
                <Icon name="award" size={22} color={A.accent} />Create certificate
              </div>
            </div>
          ) : null}
        </AbsoluteFill>
      ) : null}

      {t >= 5.55 && collapse < 1 ? (
        <AbsoluteFill style={{ transformOrigin: `${cx}px ${cy}px`, transform: `scale(${lerp(1, 0.02, collapse)})`, opacity: 1 - collapse * 0.8, filter: collapse > 0 ? `blur(${(collapse * 8).toFixed(1)}px)` : undefined }}>
          {t >= 7.05 ? <Aura k={auraK} cx={cx} cy={cy} r={V ? 260 : 300} /> : null}
          {out1 < 1 ? (
            <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 1 - out1, filter: out1 > 0 ? `blur(${(out1 * 14).toFixed(1)}px)` : undefined, transform: `translateX(${(-out1 * 80).toFixed(1)}px)` }}>
              <div style={{ ...big(S, LIGHT), textAlign: 'center', whiteSpace: V ? 'normal' : 'pre', width: V ? 900 : undefined }}>
                <span style={slide(w(5.62), 0)}>Save</span> <span style={{ ...slide(w(5.75)), color: GREEN }}>time.</span>{V ? <br /> : ' '}<span style={slide(w(6.12), 0)}>Spot</span> <span style={{ ...slide(w(6.3)), color: GREEN }}>mistakes.</span>
              </div>
            </AbsoluteFill>
          ) : null}
          {t >= 7.1 ? (
            <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={big(S, LIGHT)}><span style={slide(w(7.12), 0)}>Stay</span> <span style={{ ...slide(w(7.6), 40), color: GREEN }}>disciplined.</span></div>
            </AbsoluteFill>
          ) : null}
        </AbsoluteFill>
      ) : null}

      {t >= 8.85 && !cut ? (
        <>
          {reveal < 1 ? <Guide x={cx} y={cy} size={V ? 56 : 64} scale={dia * (1 - reveal)} rot={lerp(-120, 0, prog(f, sec(8.85), sec(0.4), SIG))} /> : null}
          <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', clipPath: `inset(0 ${(50 * (1 - reveal)).toFixed(2)}% 0 ${(50 * (1 - reveal)).toFixed(2)}%)` }}>
            <div style={{ fontFamily: DISPLAY, fontSize: V ? 104 : 136, fontWeight: 800, letterSpacing: '0.06em', color: LIGHT, whiteSpace: 'pre', transform: `scale(${lerp(0.94, 1, reveal)})` }}>JOURNALYST</div>
          </AbsoluteFill>
          {reveal > 0 && reveal < 1 ? <div style={{ position: 'absolute', top: cy - 1, height: 2, left: cx - (V ? 380 : 500) * reveal, width: (V ? 760 : 1000) * reveal, background: GREEN, boxShadow: '0 0 16px rgba(52,245,138,0.8)', opacity: 1 - reveal }} /> : null}
          {pill > 0 ? (
            <div style={{ position: 'absolute', left: cx - (V ? 260 : 230), top: H * 0.86 - 34, opacity: clamp01(pill * 2), transform: `translateY(${lerp(16, 0, pill)}px)` }}>
              <GlowPill f={f} w={V ? 520 : 460} h={68} dark>
                <div style={{ fontFamily: DISPLAY, fontSize: V ? 30 : 27, fontWeight: 600, color: LIGHT, whiteSpace: 'pre' }}>
                  {[...CTA].map((c, i) => <span key={i} style={{ opacity: i < n ? 1 : 0 }}>{c}</span>)}<Caret f={f} typing={n < CTA.length} hidden={n >= CTA.length && t > 11.4} />
                </div>
              </GlowPill>
            </div>
          ) : null}
        </>
      ) : null}
      {cut ? <AbsoluteFill style={{ background: '#000' }} /> : null}
    </AbsoluteFill>
  );
};
