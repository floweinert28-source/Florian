import type {CSSProperties, ReactNode} from 'react';

type P = {size?: number; color?: string; style?: CSSProperties};

const Svg = ({size = 16, color = 'currentColor', style, children}: P & {children: ReactNode}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke={color}
    strokeWidth={1.4}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{flexShrink: 0, display: 'block', ...style}}
  >
    {children}
  </svg>
);

export const IconGrid = (p: P) => (
  <Svg {...p}>
    <rect x="2" y="2" width="5" height="5" rx="1.4" />
    <rect x="9" y="2" width="5" height="5" rx="1.4" />
    <rect x="2" y="9" width="5" height="5" rx="1.4" />
    <rect x="9" y="9" width="5" height="5" rx="1.4" />
  </Svg>
);

export const IconChart = (p: P) => (
  <Svg {...p}>
    <path d="M2.5 13.5h11" />
    <path d="M3.5 10.5l3-3 2.5 2 4-4.5" />
  </Svg>
);

export const IconReport = (p: P) => (
  <Svg {...p}>
    <path d="M4 2h5.5L12.5 5v9h-8.5z" />
    <path d="M9.5 2v3h3" />
    <path d="M6.5 8.5h3.5M6.5 11h3.5" />
  </Svg>
);

export const IconList = (p: P) => (
  <Svg {...p}>
    <path d="M5.5 4h8M5.5 8h8M5.5 12h8" />
    <circle cx="2.75" cy="4" r=".6" fill="currentColor" />
    <circle cx="2.75" cy="8" r=".6" fill="currentColor" />
    <circle cx="2.75" cy="12" r=".6" fill="currentColor" />
  </Svg>
);

export const IconNote = (p: P) => (
  <Svg {...p}>
    <path d="M10.5 2.5l3 3-7.5 7.5H3v-3z" />
    <path d="M9 4l3 3" />
  </Svg>
);

export const IconBook = (p: P) => (
  <Svg {...p}>
    <path d="M3 3.5c1.8-.9 3.5-.9 5 .4 1.5-1.3 3.2-1.3 5-.4v9.5c-1.8-.9-3.5-.9-5 .4-1.5-1.3-3.2-1.3-5-.4z" />
    <path d="M8 3.9v9.5" />
  </Svg>
);

export const IconReplay = (p: P) => (
  <Svg {...p}>
    <path d="M2.8 8a5.2 5.2 0 1 0 1.6-3.8" />
    <path d="M2.5 2.5v2.5H5" />
    <path d="M7 6v4l3-2z" />
  </Svg>
);

export const IconTarget = (p: P) => (
  <Svg {...p}>
    <circle cx="8" cy="8" r="5.5" />
    <circle cx="8" cy="8" r="2.5" />
  </Svg>
);

export const IconWallet = (p: P) => (
  <Svg {...p}>
    <rect x="2" y="4" width="12" height="9" rx="2" />
    <path d="M2 6.5h12" />
    <path d="M10.5 10h1.5" />
  </Svg>
);

export const IconLink = (p: P) => (
  <Svg {...p}>
    <path d="M6.5 9.5l3-3" />
    <path d="M7.2 4.3l1-1a2.8 2.8 0 0 1 4 4l-1 1" />
    <path d="M8.8 11.7l-1 1a2.8 2.8 0 0 1-4-4l1-1" />
  </Svg>
);

export const IconCalendar = (p: P) => (
  <Svg {...p}>
    <rect x="2.5" y="3.5" width="11" height="10" rx="2" />
    <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" />
  </Svg>
);

export const IconChevronDown = (p: P) => (
  <Svg {...p}>
    <path d="M4.5 6.5L8 10l3.5-3.5" />
  </Svg>
);

export const IconChevronLeft = (p: P) => (
  <Svg {...p}>
    <path d="M9.5 4.5L6 8l3.5 3.5" />
  </Svg>
);

export const IconChevronRight = (p: P) => (
  <Svg {...p}>
    <path d="M6.5 4.5L10 8l-3.5 3.5" />
  </Svg>
);

export const IconSidebar = (p: P) => (
  <Svg {...p}>
    <rect x="2" y="2.5" width="12" height="11" rx="2" />
    <path d="M6 2.5v11" />
  </Svg>
);

export const IconInfo = (p: P) => (
  <Svg {...p}>
    <circle cx="8" cy="8" r="5.6" />
    <path d="M8 7.3v3.6" />
    <circle cx="8" cy="5.1" r=".5" fill="currentColor" />
  </Svg>
);

export const IconPlus = (p: P) => (
  <Svg {...p}>
    <path d="M8 3.5v9M3.5 8h9" />
  </Svg>
);

export const IconDots = (p: P) => (
  <Svg {...p}>
    <circle cx="3.5" cy="8" r=".8" fill="currentColor" />
    <circle cx="8" cy="8" r=".8" fill="currentColor" />
    <circle cx="12.5" cy="8" r=".8" fill="currentColor" />
  </Svg>
);

export const IconClock = (p: P) => (
  <Svg {...p}>
    <circle cx="8" cy="8" r="5.6" />
    <path d="M8 5v3.2l2 1.3" />
  </Svg>
);
