import React from 'react';
import { D, ENTER, enterStyle, exitStyle, inOut, ms, prog, pressScale } from '../motion';
import { FONT_NUM, FONT_TEXT, T } from '../theme';
import { Icon } from './Icon';
import { evolvePath } from '@remotion/paths';

export const InfoDot: React.FC = () => <Icon name="info" size={14} color={T.faint} style={{ marginLeft: 6 }} />;

export const Card: React.FC<{ title?: string; right?: React.ReactNode; style?: React.CSSProperties; bodyStyle?: React.CSSProperties; children?: React.ReactNode; enter?: React.CSSProperties }> = ({ title, right, style, bodyStyle, children, enter }) => (
  <div style={{ position: 'absolute', borderRadius: T.radius, border: `1px solid ${T.border}`, background: T.surface, padding: 20, display: 'flex', flexDirection: 'column', boxShadow: '0 14px 28px -20px rgba(0,0,0,.7)', ...style, ...enter }}>
    {title ? (
      <div style={{ display: 'flex', alignItems: 'center', fontWeight: 600, fontSize: 15.5, marginBottom: 14, color: T.text }}>
        <span>{title}</span><InfoDot />
        {right ? <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>{right}</div> : null}
      </div>
    ) : null}
    <div style={{ flex: 1, minHeight: 0, position: 'relative', ...bodyStyle }}>{children}</div>
  </div>
);

export const StatTile: React.FC<{ title: string; value: string; valueColor?: string; sub?: string; topRight?: string; right?: React.ReactNode; style?: React.CSSProperties; enter?: React.CSSProperties; big?: boolean }> = ({ title, value, valueColor = T.text, sub, topRight, right, style, enter, big }) => (
  <div style={{ position: 'absolute', borderRadius: T.radius, border: `1px solid ${T.border}`, background: T.surface, padding: '16px 18px', ...style, ...enter }}>
    <div style={{ display: 'flex', alignItems: 'center', fontSize: 13.5, fontWeight: 600, color: T.text2 }}>
      <span>{title}</span><InfoDot />
      {topRight ? <span style={{ marginLeft: 'auto', fontSize: 12, color: T.muted, fontWeight: 500 }}>{topRight}</span> : null}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', marginTop: 10 }}>
      <div>
        <div style={{ fontFamily: FONT_NUM, fontWeight: 600, fontSize: big ? 34 : 28, lineHeight: 1.1, color: valueColor, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
        {sub ? <div style={{ fontSize: 12, color: T.muted, marginTop: 6 }}>{sub}</div> : null}
      </div>
      {right ? <div style={{ marginLeft: 'auto' }}>{right}</div> : null}
    </div>
  </div>
);

export const Chip: React.FC<{ label: string; tone?: 'neutral' | 'profit' | 'loss' | 'accent' | 'info' | 'warn'; selected?: boolean; style?: React.CSSProperties; small?: boolean }> = ({ label, tone = 'neutral', selected, style, small }) => {
  const map = { neutral: [T.surface3, T.text2], profit: [T.accentSoft, T.profit], loss: [T.lossSoft, T.loss], accent: [T.accentSoft, T.accent], info: ['rgba(92,184,255,0.16)', T.info], warn: [T.warn + '22', T.warn] } as const;
  const [bg, fg] = map[tone];
  return <span style={{ display: 'inline-flex', alignItems: 'center', height: small ? 20 : 28, padding: small ? '0 7px' : '0 11px', borderRadius: 999, background: selected ? T.accentSoft : bg, color: selected ? T.accent : fg, border: `1px solid ${selected ? T.accent : 'transparent'}`, fontSize: small ? 10.5 : 12.5, fontWeight: 700, letterSpacing: small ? '0.06em' : 0, textTransform: small ? 'uppercase' : 'none', whiteSpace: 'nowrap', ...style }}>{label}</span>;
};

export const Tab: React.FC<{ label: string; active?: boolean; count?: number; style?: React.CSSProperties }> = ({ label, active, count, style }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 38, padding: '0 16px', borderRadius: 12, border: `1px solid ${active ? T.accent : T.border}`, background: T.surface, color: active ? T.accent : T.text2, fontWeight: 500, fontSize: 13.5, ...style }}>
    {label}{count != null ? <span style={{ color: T.muted }}>({count})</span> : null}
  </div>
);

export const Button: React.FC<{ label: string; icon?: string; kind?: 'primary' | 'outline' | 'ghost'; pressAt?: number; frame?: number; style?: React.CSSProperties }> = ({ label, icon, kind = 'outline', pressAt = -1000, frame = 0, style }) => {
  const s = pressScale(frame, pressAt);
  const bg = kind === 'primary' ? T.accent : kind === 'ghost' ? 'transparent' : T.surface;
  const fg = kind === 'primary' ? T.accentInk : kind === 'ghost' ? T.text2 : T.accent;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 42, padding: '0 16px', borderRadius: 12, border: `1px solid ${kind === 'primary' || kind === 'outline' ? T.accent : T.border}`, background: bg, color: fg, fontWeight: 600, fontSize: 14, scale: String(s), ...style }}>
      {icon ? <Icon name={icon} size={16} /> : null}<span>{label}</span>
    </div>
  );
};

/* Umschalter: Knopf gleitet in 180 ms, Grün blendet dahinter ein */
export const Toggle: React.FC<{ frame: number; on: boolean; flipAt?: number }> = ({ frame, on, flipAt = -1000 }) => {
  const p = on ? prog(frame, flipAt, ms(180), ENTER) : 0;
  return (
    <div style={{ position: 'relative', width: 44, height: 26, borderRadius: 13, background: T.surface3, border: `1px solid ${T.border2}`, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: T.accent, opacity: p }} />
      <div style={{ position: 'absolute', top: 3, left: 3, width: 18, height: 18, borderRadius: 9, background: p > 0.5 ? T.accentInk : T.text2, translate: `${(p * 18).toFixed(2)}px 0px`, boxShadow: '0 1px 2px rgba(0,0,0,.3)' }} />
    </div>
  );
};

/* Kästchen: Haken zeichnet sich in 120 ms, Rahmen wird grün */
export const Checkbox: React.FC<{ frame: number; checkAt?: number }> = ({ frame, checkAt = 100000 }) => {
  const p = prog(frame, checkAt, ms(140), ENTER);
  const path = 'M6 12.5l4 4L18 8';
  const ev = evolvePath(p, path);
  const s = pressScale(frame, checkAt, 0.08);
  return (
    <div style={{ width: 22, height: 22, borderRadius: 7, border: `1.5px solid ${p > 0 ? T.accent : T.border2}`, background: p > 0 ? T.accent : 'transparent', display: 'grid', placeItems: 'center', scale: String(s), flex: '0 0 auto' }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={T.accentInk} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d={path} strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} /></svg>
    </div>
  );
};

/* Hinweis oben rechts */
export const Toast: React.FC<{ frame: number; start: number; end: number; title: string; sub?: string }> = ({ frame, start, end, title, sub }) => (
  <div style={{ position: 'absolute', right: 24, top: 92, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 14, border: `1px solid ${T.border2}`, background: T.surface2, boxShadow: '0 18px 50px rgba(0,0,0,.55)', ...inOut(frame, start, end, { dy: -12, inDur: D.card, outDur: D.quick }) }}>
    <div style={{ width: 30, height: 30, borderRadius: 15, background: T.accentSoft, color: T.accent, display: 'grid', placeItems: 'center' }}><Icon name="check" size={16} stroke={2.2} /></div>
    <div><div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>{sub ? <div style={{ fontSize: 12.5, color: T.text2 }}>{sub}</div> : null}</div>
  </div>
);

/* Bauchbinde: im Band unter der Bühne, zentriert; Kapitelnummer in Grün */
export const Caption: React.FC<{ frame: number; start: number; end: number; no: string; text: string }> = ({ frame, start, end, no, text }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: 1010, display: 'flex', justifyContent: 'center', fontFamily: FONT_TEXT, ...inOut(frame, start, end, { dy: 14, inDur: D.card, outDur: D.quick }) }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <span style={{ fontFamily: FONT_NUM, fontWeight: 700, fontSize: 22, color: T.accent, letterSpacing: '0.02em' }}>{no}</span>
      <span style={{ width: 1, height: 22, background: T.border2 }} />
      <span style={{ fontWeight: 600, fontSize: 24, color: T.text, letterSpacing: '-0.005em' }}>{text}</span>
    </div>
  </div>
);

/* Text, der sich tippt. Caret blinkt mit Sinus-Takt und verschwindet nach dem Tippen. */
export const Typed: React.FC<{ frame: number; start: number; text: string; cps?: number; style?: React.CSSProperties; caret?: boolean }> = ({ frame, start, text, cps = 2.4, style, caret = true }) => {
  const n = Math.max(0, Math.min(text.length, Math.floor((frame - start) * cps)));
  const typing = frame >= start && n < text.length;
  const showCaret = caret && (typing || (frame >= start && frame < start + text.length / cps + 12)) && Math.floor(frame / 8) % 2 === 0;
  return <span style={style}>{text.slice(0, n)}{showCaret ? <span style={{ display: 'inline-block', width: 2, height: '1em', background: T.accent, verticalAlign: '-0.15em', marginLeft: 1 }} /> : null}</span>;
};

export const Field: React.FC<{ label: string; children?: React.ReactNode; style?: React.CSSProperties; unit?: string; focused?: boolean }> = ({ label, children, style, unit, focused }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
    <div style={{ fontSize: 12, fontWeight: 600, color: T.muted, letterSpacing: '0.02em' }}>{label}</div>
    <div style={{ height: 42, borderRadius: 10, border: `1px solid ${focused ? T.accent : T.border2}`, background: T.surface2, display: 'flex', alignItems: 'center', padding: '0 12px', fontFamily: FONT_NUM, fontSize: 14.5, color: T.text, boxShadow: focused ? `0 0 0 3px ${T.accentSoft}` : 'none' }}>
      <span style={{ flex: 1 }}>{children}</span>{unit ? <span style={{ color: T.muted, fontSize: 12.5 }}>{unit}</span> : null}
    </div>
  </div>
);

export const Row: React.FC<{ style?: React.CSSProperties; children?: React.ReactNode; gap?: number }> = ({ style, children, gap = 10 }) => <div style={{ display: 'flex', alignItems: 'center', gap, ...style }}>{children}</div>;
export const Num: React.FC<{ children?: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => <span style={{ fontFamily: FONT_NUM, fontVariantNumeric: 'tabular-nums', ...style }}>{children}</span>;
export { enterStyle, exitStyle };
