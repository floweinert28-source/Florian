import React from 'react';
import { D, MOVE, enterStyle, exitStyle, lerp, ms, prog, sine } from '../motion';
import { FONT_TEXT, T } from '../theme';
import { Icon } from './Icon';
import { JMark } from './Logo';

export type NavItem = { key: string; label: string; icon: string; dot?: boolean };
export const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  { title: 'Übersicht', items: [{ key: 'dashboard', label: 'Dashboard', icon: 'grid' }, { key: 'stats', label: 'Statistiken', icon: 'chart' }, { key: 'progress', label: 'Fortschritt', icon: 'hourglass', dot: true }] },
  { title: 'Journal', items: [{ key: 'trades', label: 'TradeLog', icon: 'list', dot: true }, { key: 'day', label: 'Tagesansicht', icon: 'calendar' }, { key: 'notebook', label: 'Notebook', icon: 'book', dot: true }] },
  { title: 'Training', items: [{ key: 'shadow', label: 'Schatten-Ich', icon: 'eye' }, { key: 'replay', label: 'Blind-Replay', icon: 'play' }, { key: 'mentor', label: 'Mentor', icon: 'chat' }, { key: 'calm', label: 'Ruhepunkt', icon: 'lotus' }] },
  { title: 'Konten', items: [{ key: 'prop', label: 'Prop Firms', icon: 'building' }] },
];
export const NAV: (NavItem & { y: number; groupIdx: number })[] = (() => {
  const out: (NavItem & { y: number; groupIdx: number })[] = [];
  let y = 98; /* Marke 22 + 44, Trennlinie, Abstand 14 */
  NAV_GROUPS.forEach((g, gi) => { if (gi > 0) y += 26; y += 24; g.items.forEach((it) => { out.push({ ...it, y, groupIdx: gi }); y += 39; }); });
  return out;
})();
export const navIndex = (key: string) => NAV.findIndex((n) => n.key === key);
const ITEM_H = 36;

type ShellProps = {
  frame: number;
  appearAt?: number | null;      /* Sidebar und Kopf blenden ab diesem Frame ein; null = sofort sichtbar */
  title: string;
  active: string;
  prevActive?: string;
  switchAt?: number;             /* Frame, ab dem die Pille von prevActive nach active gleitet */
  head?: React.ReactNode;
  exitAt?: number;               /* Frame, ab dem Kopfreihe und Inhalt ausblenden (Szenenwechsel) */
  children?: React.ReactNode;
};

export const Shell: React.FC<ShellProps> = ({ frame, appearAt = null, title, active, prevActive, switchAt = -1000, head, exitAt, children }) => {
  const a0 = appearAt == null ? -1000 : appearAt;
  const ai = Math.max(0, navIndex(active)); const pi = prevActive ? Math.max(0, navIndex(prevActive)) : ai;
  const slide = prog(frame, switchAt, ms(320), MOVE);
  const pillY = lerp(NAV[pi].y, NAV[ai].y, slide);
  const barY = lerp(NAV[pi].y, NAV[ai].y, prog(frame, switchAt + ms(100), ms(320), MOVE)); /* Nachschwingen: Lichtbalken folgt 100 ms später */
  const activeKey = slide < 0.5 ? (prevActive || active) : active;
  const breathe = 0.6 + 0.25 * sine(frame, ms(3200));
  const out: React.CSSProperties = exitAt != null && frame >= exitAt ? exitStyle(frame, exitAt, ms(240)) : {};

  return (
    <div style={{ position: 'absolute', inset: 0, background: T.bg, color: T.text, fontFamily: FONT_TEXT, fontSize: 14, lineHeight: 1.45, overflow: 'hidden' }}>
      {/* Seitenleiste */}
      <aside style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: T.sidebarW, background: T.bg2, borderRight: `1px solid ${T.border}`, padding: '22px 14px 18px', ...enterStyle(frame, a0, D.big, 0) }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '4px 0 18px 8px', ...enterStyle(frame, a0 + ms(60), D.card, 12) }}>
          <JMark size={16} style={{ marginTop: 2 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1.2 }}>Journalyst</div>
            <div style={{ fontSize: 12, fontWeight: 500, color: T.muted, lineHeight: 1.2 }}>Trading Journal App</div>
          </div>
          <Icon name="layout" size={18} color={T.muted} style={{ marginLeft: 'auto', marginTop: 4 }} />
        </div>
        <hr style={{ border: 0, borderTop: `1px solid ${T.border}`, margin: '0 8px 14px', opacity: prog(frame, a0 + ms(120), D.card) }} />
        {/* aktive Pille */}
        <div style={{ position: 'absolute', left: 14, right: 14, top: pillY, height: ITEM_H, borderRadius: 12, border: `1px solid ${T.border}`, borderLeftColor: 'rgba(52,245,138,0.35)', background: `linear-gradient(90deg, rgba(52,245,138,0.16) 0%, rgba(52,245,138,0.06) 40%, ${T.surface2} 76%)`, boxShadow: `-8px 0 24px -14px ${T.accentSoft}, inset 0 1px 0 rgba(255,255,255,0.04)`, opacity: prog(frame, a0 + ms(300), D.card) }} />
        <div style={{ position: 'absolute', left: 2, top: barY + 10, width: 3, height: 16, borderRadius: 3, background: T.accent, opacity: breathe * prog(frame, a0 + ms(300), D.card), boxShadow: `0 0 8px ${T.accentGlow}` }} />
        {NAV_GROUPS.map((g, gi) => {
          const first = NAV.find((n) => n.groupIdx === gi)!;
          return (
            <div key={g.title} style={{ position: 'absolute', left: 14, right: 14, top: first.y - 24 }}>
              <div style={{ padding: '0 16px 8px', fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: T.muted, height: 24, ...enterStyle(frame, a0 + ms(140) + gi * ms(90), D.card, 10) }}>{g.title}</div>
              {g.items.map((it) => {
                const n = NAV.find((x) => x.key === it.key)!; const idx = navIndex(it.key);
                const isActive = it.key === activeKey;
                return (
                  <div key={it.key} style={{ position: 'absolute', left: 0, right: 0, top: n.y - (first.y - 24), height: ITEM_H, display: 'flex', alignItems: 'center', gap: 14, padding: '0 16px', color: isActive ? T.text : T.text2, fontWeight: isActive ? 600 : 500, fontSize: 14.5, ...enterStyle(frame, a0 + ms(180) + idx * ms(40), D.card, 10) }}>
                    <Icon name={it.icon} size={20} style={{ opacity: isActive ? 1 : 0.85 }} />
                    <span>{it.label}</span>
                    {it.dot ? <span style={{ marginLeft: 'auto', marginRight: 12, width: 6, height: 6, borderRadius: 3, background: T.accent, opacity: 0.75, boxShadow: `0 0 6px ${T.accentSoft}` }} /> : null}
                  </div>
                );
              })}
            </div>
          );
        })}
        {/* Konto-Karte */}
        <div style={{ position: 'absolute', left: 14, right: 14, bottom: 18, height: 60, borderRadius: 14, border: `1px solid ${T.border}`, background: T.surface, display: 'flex', alignItems: 'center', gap: 10, padding: '0 10px', ...enterStyle(frame, a0 + ms(620), D.card, 10) }}>
          <div style={{ width: 36, height: 36, borderRadius: 18, background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, color: T.accentInk, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 12.5 }}>FW</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14, lineHeight: 1.2 }}>Florian</div>
            <div style={{ fontSize: 12, color: T.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: 120 }}>Hauptkonto · 25.000 €</div>
          </div>
          <div style={{ marginLeft: 'auto', color: T.muted, display: 'flex', flexDirection: 'column', gap: -4 }}><Icon name="chevron" size={14} style={{ rotate: '180deg' }} /><Icon name="chevron" size={14} /></div>
        </div>
      </aside>

      {/* Kopfzeile */}
      <div style={{ position: 'absolute', left: T.sidebarW, right: 0, top: 0, height: T.topbarH, display: 'flex', alignItems: 'center', gap: 16, padding: `0 ${T.gutter}px`, borderBottom: `1px solid ${T.border}`, background: 'rgba(0,0,0,0.82)', ...enterStyle(frame, a0 + ms(200), D.card, 10) }}>
        <Icon name="menu" size={20} color={T.text2} style={{ marginLeft: 8 }} />
        <h1 style={{ margin: 0, fontSize: 21, fontWeight: 600, letterSpacing: '-0.01em', marginLeft: 8 }}>{title}</h1>
        <div style={{ marginLeft: 'auto', width: 40, height: 40, borderRadius: 20, background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`, color: T.accentInk, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 13, boxShadow: `0 0 0 3px ${T.accentSoft}` }}>FW</div>
      </div>

      {/* Kopfreihe unter dem Titel */}
      <div style={{ position: 'absolute', left: T.sidebarW + T.gutter, right: T.gutter, top: 92, height: 44, display: 'flex', alignItems: 'center', gap: 10, ...enterStyle(frame, a0 + ms(320), D.card, 12), ...out }}>
        {head}
      </div>

      {/* Inhalt */}
      <div style={{ position: 'absolute', left: T.sidebarW + T.gutter, right: T.gutter, top: T.contentTop, bottom: 0, ...out }}>{children}</div>
    </div>
  );
};

/* Bausteine der Kopfreihe */
export const HeadChip: React.FC<{ icon?: string; label: string; caret?: boolean; active?: boolean; style?: React.CSSProperties }> = ({ icon, label, caret, active, style }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 44, padding: '0 14px', borderRadius: 12, border: `1px solid ${active ? T.accent : T.border}`, background: T.surface, color: active ? T.accent : T.text, fontWeight: 500, fontSize: 14, ...style }}>
    {icon ? <Icon name={icon} size={16} color={active ? T.accent : T.text2} /> : null}
    <span>{label}</span>
    {caret ? <Icon name="chevron" size={14} color={T.muted} /> : null}
  </div>
);
export const IconBtn: React.FC<{ icon: string; style?: React.CSSProperties }> = ({ icon, style }) => (
  <div style={{ width: 40, height: 40, borderRadius: 12, border: `1px solid ${T.border}`, background: T.surface, display: 'grid', placeItems: 'center', color: T.text2, ...style }}><Icon name={icon} size={18} /></div>
);
export const PrimaryBtn: React.FC<{ label: string; icon?: string; outline?: boolean; style?: React.CSSProperties }> = ({ label, icon, outline = true, style }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 44, padding: '0 16px', borderRadius: 12, border: `1px solid ${T.accent}`, background: outline ? T.surface : T.accent, color: outline ? T.accent : T.accentInk, fontWeight: 600, fontSize: 14, ...style }}>
    {icon ? <Icon name={icon} size={16} /> : null}<span>{label}</span>
  </div>
);
export const DefaultHead: React.FC<{ period?: string; extra?: React.ReactNode; right?: React.ReactNode }> = ({ period = 'Gesamt', extra, right }) => (
  <>
    <HeadChip icon="calendar" label={period} caret />
    <HeadChip icon="user" label="Hauptkonto" caret />
    {extra}
    <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
      {right}
      <IconBtn icon="mic" /><IconBtn icon="checkCircle" /><IconBtn icon="playTri" />
      <PrimaryBtn label="Trade loggen" icon="plus" />
    </div>
  </>
);
