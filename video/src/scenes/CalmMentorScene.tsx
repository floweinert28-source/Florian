import React from 'react';
import { useCurrentFrame } from 'remotion';
import { J } from '../data';
import { fmtEur } from '../format';
import { D, ENTER, enterStyle, exitStyle, ms, prog, sine } from '../motion';
import { FONT_TEXT, T } from '../theme';
import { Icon } from '../ui/Icon';
import { Typed } from '../ui/Primitives';
import { HeadChip, Shell } from '../ui/Shell';
import { Glow } from './Intro';

export const CALM = { toMentor: 100 } as const;

/* Kirschblütenblätter: treiben langsam schräg, nur im Ruhepunkt (wie in der App) */
const Petals: React.FC<{ frame: number; opacity: number }> = ({ frame, opacity }) => (
  <>
    {Array.from({ length: 12 }, (_, i) => {
      const x0 = 260 + ((i * 3571) % 1000) / 1000 * 1500; const y0 = ((i * 7919) % 1000) / 1000 * 900;
      const t = frame + i * 37; const x = x0 + t * 0.9 + Math.sin(t / 40 + i) * 30; const y = ((y0 + t * 1.6) % 1000) - 40;
      const rot = (t * 1.2 + i * 40) % 360; const sz = 10 + (i % 4) * 3;
      return <div key={i} style={{ position: 'absolute', left: x % 1700 + 200, top: y, width: sz, height: sz * 0.7, borderRadius: '70% 30% 70% 30%', background: 'rgba(255,170,200,0.75)', rotate: `${rot}deg`, opacity: opacity * 0.8, boxShadow: '0 0 6px rgba(255,170,200,0.4)' }} />;
    })}
  </>
);

const Bubble: React.FC<{ side: 'me' | 'mentor'; children: React.ReactNode; style?: React.CSSProperties }> = ({ side, children, style }) => (
  <div style={{ alignSelf: side === 'me' ? 'flex-end' : 'flex-start', maxWidth: 560, padding: '12px 16px', borderRadius: 16, borderBottomRightRadius: side === 'me' ? 6 : 16, borderBottomLeftRadius: side === 'mentor' ? 6 : 16, background: side === 'me' ? T.accentSoft : T.surface2, border: `1px solid ${side === 'me' ? 'rgba(52,245,138,0.35)' : T.border}`, color: T.text, fontSize: 15, lineHeight: 1.5, ...style }}>{children}</div>
);

export const CalmMentorScene: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const mentor = f >= CALM.toMentor;
  const calmStyle = f >= CALM.toMentor - 6 ? exitStyle(f, CALM.toMentor - 6, ms(240)) : enterStyle(f, 6, D.card);
  const h10 = J.hours.find((h) => h.key === '10–11')!; const h17 = J.hours.find((h) => h.key === '17–18')!; const h15 = J.hours.filter((h) => h.key === '15–16' || h.key === '16–17');
  const answer = `Zwischen 10 und 11 Uhr: ${h10.n} Trades, ${fmtEur(h10.pnl, { decimals: 0 })} – dein teuerstes Zeitfenster. Nach 17 Uhr noch einmal ${fmtEur(h17.pnl, { decimals: 0 })} in ${h17.n} Trades. Zwischen 15 und 17 Uhr läuft es dagegen: ${h15.reduce((a, h) => a + h.n, 0)} Trades, ${fmtEur(h15.reduce((a, h) => a + h.pnl, 0), { sign: true, decimals: 0 })}.`;
  const typingDots = f >= 134 && f < 154;
  return (
    <Shell frame={f} exitAt={dur - 7} title={mentor ? 'Mentor' : 'Ruhepunkt'} active={mentor ? 'mentor' : 'calm'} prevActive={mentor ? 'calm' : 'shadow'} switchAt={mentor ? CALM.toMentor : 0}
      head={mentor ? <div style={{ display: 'flex', alignItems: 'center', gap: 12, ...enterStyle(f, CALM.toMentor + 6, D.card) }}><HeadChip icon="user" label="Hauptkonto" caret /><span style={{ fontSize: 13, color: T.muted }}>Der Mentor sieht die letzten 20 Trades dieses Kontos.</span></div> : null}>
      {!mentor || f < CALM.toMentor + 8 ? (
        <div style={{ position: 'absolute', left: -24, right: -24, top: -158, bottom: 0, overflow: 'hidden', ...calmStyle }}>
          <Glow frame={f} x={1100} y={280} r={520} color="rgba(92,184,255,0.22)" opacity={1} speed={1.2} />
          <Glow frame={f} x={1500} y={820} r={520} color="rgba(139,124,246,0.22)" opacity={1} phase={2} />
          <Glow frame={f} x={700} y={900} r={460} color="rgba(255,120,170,0.16)" opacity={1} phase={4} />
          <Petals frame={f} opacity={prog(f, 6, ms(900))} />
          <div style={{ position: 'absolute', left: 484, top: 290, width: 720 }}>
            <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.01em', ...enterStyle(f, 8, D.card) }}>Wo stehst du gerade?</div>
            <div style={{ fontSize: 15.5, color: T.text2, marginTop: 8, ...enterStyle(f, 12, D.card) }}>Ein paar Minuten, um klar ins Trading zu gehen und sauber wieder rauszukommen.</div>
            {[
              { icon: 'sun', col: T.info, bg: 'rgba(92,184,255,0.14)', t: 'Vor dem Trading', s: 'Ankommen, Check-in, Tagesregeln. Etwa 6 Minuten.' },
              { icon: 'moon', col: T.be, bg: 'rgba(139,124,246,0.16)', t: 'Nach dem Trading', s: 'Runterfahren, reflektieren, abschalten. Etwa 6 Minuten.' },
              { icon: 'pause', col: T.loss, bg: 'rgba(255,92,92,0.14)', t: 'Akut-Reset', s: 'Aufgewühlt? Eine Minute, bevor du irgendwo klickst.' },
            ].map((c, i) => (
              <div key={c.t} style={{ display: 'flex', alignItems: 'center', gap: 16, height: 90, marginTop: i === 0 ? 24 : 14, padding: '0 16px', borderRadius: 14, border: `1px solid ${T.border}`, background: 'rgba(11,13,12,0.72)', ...enterStyle(f, 18 + i * 4, D.card, 22) }}>
                <div style={{ width: 56, height: 56, borderRadius: 12, background: c.bg, display: 'grid', placeItems: 'center', color: c.col, boxShadow: `0 0 ${18 + 8 * sine(f, ms(3000), i)}px ${c.bg}` }}><Icon name={c.icon} size={26} /></div>
                <div><div style={{ fontSize: 17, fontWeight: 600 }}>{c.t}</div><div style={{ fontSize: 13, color: T.text2, marginTop: 2 }}>{c.s}</div></div>
              </div>
            ))}
            <div style={{ height: 1, background: T.border, margin: '28px 0 18px', ...enterStyle(f, 34, D.card) }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, ...enterStyle(f, 36, D.card) }}>
              <div style={{ width: 48, height: 48, borderRadius: 10, background: 'rgba(245,185,58,0.14)', display: 'grid', placeItems: 'center' }}><div style={{ width: 8, height: 18, borderRadius: 4, background: T.warn, boxShadow: `0 0 ${10 + 6 * sine(f, ms(1800))}px ${T.warn}` }} /></div>
              <div><div style={{ fontSize: 15, fontWeight: 600 }}>Christlicher Impuls</div><div style={{ fontSize: 12.5, color: T.text2 }}>an · Bibelvers, Gebet, Atemgebet</div></div>
              <div style={{ marginLeft: 'auto', fontSize: 13, color: T.text2 }}>Hilfe und Unterstützung</div>
            </div>
          </div>
        </div>
      ) : null}
      {mentor ? (
        <div style={{ position: 'absolute', left: 408, top: 0, width: 848, height: 760, borderRadius: 18, border: `1px solid ${T.border}`, background: T.surface, display: 'flex', flexDirection: 'column', ...enterStyle(f, CALM.toMentor + 6, D.card) }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: `1px solid ${T.border}` }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: T.accentSoft, color: T.accent, display: 'grid', placeItems: 'center' }}><Icon name="chat" size={18} /></div>
            <div><div style={{ fontWeight: 600, fontSize: 15 }}>Mentor</div><div style={{ fontSize: 12, color: T.muted }}>Trading-Psychologie · kennt dein Journal</div></div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, padding: 20, fontFamily: FONT_TEXT }}>
            <Bubble side="mentor" style={enterStyle(f, CALM.toMentor + 10, D.card, 12)}>Guten Morgen. Ich habe deine letzten 20 Trades und den Check-in von heute. Was willst du wissen?</Bubble>
            {f >= 116 ? <Bubble side="me" style={enterStyle(f, 116, ms(300), 10)}><Typed frame={f} start={118} text="Wann verliere ich am meisten Geld?" cps={2.4} /></Bubble> : null}
            {typingDots ? <Bubble side="mentor" style={{ display: 'flex', gap: 6, padding: '14px 16px' }}>{[0, 1, 2].map((i) => <span key={i} style={{ width: 8, height: 8, borderRadius: 4, background: T.text2, opacity: 0.3 + 0.7 * sine(f, 16, i * 2.1) }} />)}</Bubble> : null}
            {f >= 154 ? <Bubble side="mentor" style={enterStyle(f, 154, D.card, 12)}><Typed frame={f} start={156} text={answer} cps={7} /></Bubble> : null}
            {f >= 190 ? <div style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 999, border: `1px solid ${T.accent}`, color: T.accent, fontSize: 13, fontWeight: 600, ...enterStyle(f, 190, D.card, 10) }}><Icon name="eye" size={14} />Vorschlag: Handelszeiten im Schatten-Ich auf 15–17 Uhr begrenzen</div> : null}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: 20, height: 52, borderRadius: 14, border: `1px solid ${T.border2}`, background: T.surface2, padding: '0 8px 0 16px', color: T.muted, fontSize: 14 }}>
            <span style={{ flex: 1 }}>Frag den Mentor …</span>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: T.accent, color: T.accentInk, display: 'grid', placeItems: 'center' }}><Icon name="send" size={16} /></div>
          </div>
        </div>
      ) : null}
    </Shell>
  );
};
