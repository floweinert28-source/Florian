import type {ReactNode} from 'react';
import {C, FONT, L, R, alpha, BOX} from '../theme';
import {rise, settle} from '../motion';
import {Avatar, Button} from './Primitives';
import {
  IconBook,
  IconCalendar,
  IconChart,
  IconChevronDown,
  IconClock,
  IconDots,
  IconGrid,
  IconLink,
  IconList,
  IconNote,
  IconPlus,
  IconReplay,
  IconReport,
  IconSidebar,
  IconTarget,
  IconWallet,
} from './Icons';

type NavItem = {label: string; icon: (p: {size?: number; color?: string}) => ReactNode; active?: boolean; dot?: boolean};

const NAV: {title: string; items: NavItem[]}[] = [
  {
    title: 'Overview',
    items: [
      {label: 'Dashboard', icon: IconGrid, active: true},
      {label: 'Analytics', icon: IconChart},
      {label: 'Reports', icon: IconReport},
    ],
  },
  {
    title: 'Journal',
    items: [
      {label: 'Trades', icon: IconList},
      {label: 'Daily notes', icon: IconNote},
      {label: 'Playbook', icon: IconBook, dot: true},
    ],
  },
  {
    title: 'Training',
    items: [
      {label: 'Replay', icon: IconReplay},
      {label: 'Backtesting', icon: IconTarget},
    ],
  },
  {
    title: 'Accounts',
    items: [
      {label: 'Accounts', icon: IconWallet},
      {label: 'Broker sync', icon: IconLink},
    ],
  },
];

const GlowBar = () => (
  <div
    style={{
      position: 'absolute',
      left: -1,
      top: 9,
      width: 3,
      height: 16,
      borderRadius: 2,
      background: C.accent,
      boxShadow: `0 0 8px ${alpha(C.accent, 0.55)}`,
    }}
  />
);

const NavRow = ({item}: {item: NavItem}) => (
  <div
    style={{
      position: 'relative',
      height: 36,
      display: 'flex',
      alignItems: 'center',
      gap: 11,
      padding: '0 12px',
      borderRadius: R.button,
      boxSizing: 'border-box',
      fontFamily: FONT.text,
      fontSize: 13.5,
      fontWeight: item.active ? 600 : 500,
      color: item.active ? C.text : C.text2,
      ...(item.active && {
        background: `linear-gradient(90deg, ${alpha(C.accent, 0.11)} 0%, ${alpha('#2b2a26', 0.55)} 70%)`,
        border: `1px solid ${alpha(C.accent, 0.16)}`,
      }),
      ...(!item.active && {border: '1px solid transparent'}),
    }}
  >
    {item.active && <GlowBar />}
    {item.icon({size: 16, color: item.active ? C.accent : C.muted})}
    <span style={{flex: 1}}>{item.label}</span>
    {item.dot && (
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          background: C.accent,
          boxShadow: `0 0 8px ${alpha(C.accent, 0.55)}`,
        }}
      />
    )}
  </div>
);

export const Sidebar = ({b}: {b: number}) => {
  const shell = settle(b, 0, 45);
  let k = 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: L.sidebar,
        height: L.height,
        background: C.sidebar,
        borderRight: `1px solid ${C.border}`,
        boxSizing: 'border-box',
        padding: '22px 14px 16px',
        display: 'flex',
        flexDirection: 'column',
        opacity: shell,
      }}
    >
      <div style={{...rise(settle(b, 4, 45), 10), display: 'flex', alignItems: 'flex-start', padding: '0 8px 0 10px'}}>
        <div style={{flex: 1}}>
          <div style={{fontFamily: FONT.text, fontWeight: 700, fontSize: 15, letterSpacing: 2.6, color: C.text}}>
            JOURNALYST
          </div>
          <div style={{fontFamily: FONT.text, fontSize: 11.5, color: C.muted, marginTop: 3}}>Trading journal</div>
        </div>
        <IconSidebar size={16} color={C.muted} style={{marginTop: 2}} />
      </div>

      <div style={{marginTop: 30, display: 'flex', flexDirection: 'column', gap: 22}}>
        {NAV.map((section) => (
          <div key={section.title}>
            <div
              style={{
                ...rise(settle(b, 8 + k++ * 3, 45), 10),
                fontFamily: FONT.text,
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: 1.4,
                color: C.muted,
                textTransform: 'uppercase',
                padding: '0 12px 8px',
              }}
            >
              {section.title}
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 2}}>
              {section.items.map((it) => (
                <div key={it.label} style={rise(settle(b, 8 + k++ * 3, 45), 10)}>
                  <NavRow item={it} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{flex: 1}} />

      <div
        style={{
          ...rise(settle(b, 50, 45), 12),
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: R.card,
          padding: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <Avatar size={34} />
        <div style={{flex: 1, minWidth: 0}}>
          <div style={{fontFamily: FONT.text, fontSize: 13, fontWeight: 600, color: C.text}}>Alex Carter</div>
          <div style={{fontFamily: FONT.text, fontSize: 11.5, color: C.muted, marginTop: 1}}>Pro plan</div>
        </div>
        <IconDots size={16} color={C.muted} />
      </div>
    </div>
  );
};

export const Header = ({b}: {b: number}) => (
  <div
    style={{
      position: 'absolute',
      left: L.sidebar,
      top: 0,
      width: L.width - L.sidebar,
      height: L.header,
      boxSizing: 'border-box',
      borderBottom: `1px solid ${C.border}`,
      background: alpha(C.bg, 0.82),
      padding: `0 ${L.pad}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      opacity: settle(b, 6, 45),
    }}
  >
    <div
      style={{
        ...rise(settle(b, 10, 45), 8),
        fontFamily: FONT.text,
        fontSize: 21,
        fontWeight: 600,
        color: C.text,
        letterSpacing: -0.3,
      }}
    >
      Dashboard
    </div>
    <div style={rise(settle(b, 14, 45), 8)}>
      <Avatar size={34} />
    </div>
  </div>
);

export const Toolbar = ({b}: {b: number}) => (
  <div
    style={{
      position: 'absolute',
      left: BOX.toolbar.x,
      top: BOX.toolbar.y,
      width: BOX.toolbar.w,
      height: BOX.toolbar.h,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
  >
    <div style={{display: 'flex', gap: 10}}>
      <Button style={rise(settle(b, 16, 45), 10)}>
        <IconCalendar size={16} color={C.muted} />
        <span style={{color: C.text}}>Jul 1 – Sep 30, 2026</span>
        <IconChevronDown size={14} color={C.muted} />
      </Button>
      <Button style={rise(settle(b, 19, 45), 10)}>
        <IconWallet size={16} color={C.muted} />
        <span style={{color: C.text}}>All accounts</span>
        <IconChevronDown size={14} color={C.muted} />
      </Button>
    </div>
    <div style={{display: 'flex', gap: 10}}>
      <Button style={rise(settle(b, 22, 45), 10)}>
        <IconClock size={16} color={C.muted} />
        <span>
          Session: <span style={{color: C.text}}>New York</span>
        </span>
        <IconChevronDown size={14} color={C.muted} />
      </Button>
      <Button variant="log" style={rise(settle(b, 25, 45), 10)}>
        <IconPlus size={15} color={C.accent} />
        Log trade
      </Button>
    </div>
  </div>
);
