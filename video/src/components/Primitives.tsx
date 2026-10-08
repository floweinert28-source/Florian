import type {CSSProperties, ReactNode} from 'react';
import {C, FONT, NUM_STYLE, R, alpha} from '../theme';
import {IconInfo} from './Icons';

export const Card = ({style, children}: {style?: CSSProperties; children: ReactNode}) => (
  <div
    style={{
      position: 'absolute',
      background: C.card,
      border: `1px solid ${C.border}`,
      borderRadius: R.card,
      boxSizing: 'border-box',
      // warm light from the upper left
      backgroundImage: `linear-gradient(160deg, ${alpha('#fff4e6', 0.025)} 0%, transparent 45%)`,
      ...style,
    }}
  >
    {children}
  </div>
);

export const CardTitle = ({children, right}: {children: ReactNode; right?: ReactNode}) => (
  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 32}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 7}}>
      <span style={{fontFamily: FONT.text, fontSize: 15, fontWeight: 600, color: C.text, letterSpacing: -0.1}}>
        {children}
      </span>
      <IconInfo size={14} color={C.muted} />
    </div>
    {right}
  </div>
);

export const Button = ({
  children,
  style,
  variant = 'default',
}: {
  children: ReactNode;
  style?: CSSProperties;
  variant?: 'default' | 'ghost' | 'log';
}) => (
  <div
    style={{
      height: 40,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '0 14px',
      borderRadius: R.button,
      fontFamily: FONT.text,
      fontSize: 13.5,
      fontWeight: 600,
      boxSizing: 'border-box',
      whiteSpace: 'nowrap',
      ...(variant === 'default' && {background: C.card, border: `1px solid ${C.border}`, color: C.text2}),
      ...(variant === 'ghost' && {color: C.text2}),
      ...(variant === 'log' && {
        border: `1px solid ${alpha(C.accent, 0.7)}`,
        color: C.accent,
        background: alpha(C.accent, 0.04),
        boxShadow: `0 0 18px ${alpha(C.accent, 0.12)}, inset 0 0 12px ${alpha(C.accent, 0.05)}`,
      }),
      ...style,
    }}
  >
    {children}
  </div>
);

export const Segmented = ({items, active}: {items: string[]; active: number}) => (
  <div style={{display: 'flex', gap: 4}}>
    {items.map((it, i) => (
      <div
        key={it}
        style={{
          height: 28,
          padding: '0 10px',
          display: 'flex',
          alignItems: 'center',
          borderRadius: R.small,
          fontFamily: FONT.text,
          fontSize: 12,
          fontWeight: 600,
          boxSizing: 'border-box',
          ...(i === active
            ? {color: C.accent, border: `1px solid ${alpha(C.accent, 0.55)}`, background: alpha(C.accent, 0.07)}
            : {color: C.muted, border: '1px solid transparent'}),
        }}
      >
        {it}
      </div>
    ))}
  </div>
);

export const Avatar = ({size = 32, initials = 'AC'}: {size?: number; initials?: string}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      flexShrink: 0,
      background: `linear-gradient(145deg, #3a3833, #24231f)`,
      border: `1px solid ${C.border2}`,
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: FONT.text,
      fontSize: size * 0.36,
      fontWeight: 700,
      color: C.text2,
      letterSpacing: 0.3,
    }}
  >
    {initials}
  </div>
);

export const Num = ({children, style}: {children: ReactNode; style?: CSSProperties}) => (
  <span style={{...NUM_STYLE, whiteSpace: 'nowrap', ...style}}>{children}</span>
);

const usd = new Intl.NumberFormat('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
const usd0 = new Intl.NumberFormat('en-US', {maximumFractionDigits: 0});

export const fmtUsd = (v: number, {sign = true, decimals = 2} = {}) => {
  const s = (decimals === 0 ? usd0 : usd).format(Math.abs(v));
  const pre = v < 0 ? '−' : sign && v > 0 ? '+' : '';
  return `${pre}$${s}`;
};

export const fmtCompact = (v: number) => {
  if (v === 0) return '$0';
  const abs = Math.abs(v);
  const s = abs >= 1000 ? `${(abs / 1000).toFixed(abs % 1000 === 0 ? 0 : 1)}k` : abs.toFixed(0);
  return `${v < 0 ? '−' : ''}$${s}`;
};

export const signed = (v: number, digits = 2) => `${v < 0 ? '−' : v > 0 ? '+' : ''}${Math.abs(v).toFixed(digits)}`;
