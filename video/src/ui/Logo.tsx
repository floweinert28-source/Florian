import React from 'react';
/* Das „J“ aus web/assets/logo.svg */
export const JMark: React.FC<{ size?: number; color?: string; style?: React.CSSProperties }> = ({ size = 16, color = '#ffffff', style }) => (
  <svg width={size} height={size} viewBox="258 262 500 500" style={{ display: 'block', ...style }} aria-hidden>
    <path d="M411 283H677Q687 283 687 293V480A262 262 0 0 1 425 742H347Q337 742 337 732V615Q337 605 347 605H425A128 128 0 0 0 553 477V416H339Q329 416 333.8 407.2L396.2 291.8Q401 283 411 283Z" fill={color} />
  </svg>
);
