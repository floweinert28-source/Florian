import React from 'react';

const P: Record<string, React.ReactNode> = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  chart: <path d="M3 17l6-6 4 4 8-8M15 7h6v6" />,
  hourglass: <path d="M7 3h10M7 21h10M8 3v4l4 5 4-5V3M8 21v-4l4-5 4 5v4" />,
  list: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  book: <path d="M4 4h7a3 3 0 013 3v13a2 2 0 00-2-2H4zM20 4h-7a3 3 0 00-3 3v13a2 2 0 012-2h8z" />,
  eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  play: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M10 9l5 3-5 3z" /></>,
  chat: <path d="M4 5h16v11H9l-5 4zM8 9h8M8 12h5" />,
  lotus: <path d="M12 21c-5 0-8-3-9-7 3 0 5 1 6 2-1-3 0-7 3-10 3 3 4 7 3 10 1-1 3-2 6-2-1 4-4 7-9 7z" />,
  building: <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4M9 10h2M13 10h2M9 14h2M13 14h2" />,
  plus: <path d="M12 5v14M5 12h14" />,
  filter: <path d="M3 5h18l-7 8v6l-4 2v-8z" />,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></>,
  mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0014 0M12 18v3" /></>,
  checkCircle: <><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" /></>,
  playTri: <path d="M7 5l12 7-12 7z" />,
  chevron: <path d="M6 9l6 6 6-6" />,
  chevronL: <path d="M15 6l-6 6 6 6" />,
  chevronR: <path d="M9 6l6 6-6 6" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  search: <><circle cx="11" cy="11" r="6" /><path d="M20 20l-4-4" /></>,
  layout: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 10h18M10 10v11" /></>,
  upload: <path d="M12 16V4M6 10l6-6 6 6M4 20h16" />,
  check: <path d="M5 12l4 4L19 6" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  moon: <path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z" />,
  pause: <><circle cx="12" cy="12" r="9" /><path d="M10 9v6M14 9v6" /></>,
  image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="M21 16l-5-5-8 9" /></>,
  send: <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />,
  pen: <path d="M4 20h4l10-10-4-4L4 16zM13 7l4 4" />,
  arrowUp: <path d="M12 19V5M6 11l6-6 6 6" />,
  star: <path d="M12 3l2.8 5.8 6.2.9-4.5 4.4 1 6.3L12 17.5 6.5 20.4l1-6.3L3 9.7l6.2-.9z" />,
};

export const Icon: React.FC<{ name: keyof typeof P | string; size?: number; color?: string; stroke?: number; style?: React.CSSProperties; fill?: string }> = ({ name, size = 20, color = 'currentColor', stroke = 1.7, style, fill = 'none' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', flex: '0 0 auto', ...style }}>
    {P[name]}
  </svg>
);
