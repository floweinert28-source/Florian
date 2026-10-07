import React from 'react';
import { useCurrentFrame } from 'remotion';
import { fmtInt, fmtUsd } from '../format';
import { D, ENTER, count, enterStyle, ms, prog, sine } from '../motion';
import { FONT_NUM, T } from '../theme';
import { ProgressBar } from '../ui/charts';
import { Button, Chip, Num, Tab } from '../ui/Primitives';
import { Icon } from '../ui/Icon';
import { HeadChip, IconBtn, PrimaryBtn, Shell } from '../ui/Shell';

type Acc = { firm: string; sub: string; chips: [string, 'profit' | 'info' | 'warn' | 'neutral'][]; balance: number; pnl: number; meta: string; ddLeft: number; ddMax: number; target: number; targetText: string; rowLabel: string; rowValue: React.ReactNode; buffer: string };
const ACCOUNTS: Acc[] = [
  { firm: 'Apex Trader Funding', sub: '100K · Futures · Copy NQ', chips: [['Funded', 'profit'], ['Aktiv', 'info']], balance: 111262, pnl: 11262, meta: '72 Trades · 46 Handelstage', ddLeft: 11162, ddMax: 3000, target: 1, targetText: '100 % · erreicht', rowLabel: 'Nächste Auszahlung', rowValue: <span style={{ color: T.profit, fontWeight: 600 }}>bereit</span>, buffer: '43 Stop-Losses (11.162 $ / 257,11 $)' },
  { firm: 'Topstep', sub: '50K · Futures · Copy NQ', chips: [['Challenge 1', 'neutral'], ['Aktiv', 'info']], balance: 51054, pnl: 1053.85, meta: '25 Trades · 13 Handelstage', ddLeft: 2000, ddMax: 2000, target: 0.35, targetText: '35 % · noch 1.946,15 $', rowLabel: 'Zum Bestehen', rowValue: <span><b>Gewinn nötig: 1.946,15 $</b> · <span style={{ color: T.warn }}>Consistency verletzt</span></span>, buffer: '7 Stop-Losses (2.000,00 $ / 279,96 $)' },
];

export const PropScene: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const kpi = (i: number, to: number) => count(f, 10 + i * 2, ms(700), to);
  const KPIS = [
    { t: 'Aktive Konten', v: fmtInt(kpi(0, 2)), s: 'alle im grünen oder gelben Bereich' },
    { t: 'P&L aktive Konten', v: fmtUsd(kpi(1, 12316), { sign: true, decimals: 0 }), s: 'seit Start', c: T.profit },
    { t: 'Bestanden', v: fmtInt(kpi(2, 0)), s: '1 Funded-Konto' },
    { t: 'Geplatzt', v: fmtInt(kpi(3, 1)), s: '1 archiviert' },
  ];
  return (
    <Shell frame={f} exitAt={dur - 7} title="Prop Firms" active="prop" prevActive="mentor" switchAt={0}
      head={<>
        <div style={{ display: 'flex', gap: 4, padding: 3, borderRadius: 14, border: `1px solid ${T.border}`, background: T.surface }}>{['Übersicht', 'Konten', 'Rechner', 'Finanzen', 'Analyse'].map((l, i) => <Tab key={l} label={l} active={i === 0} style={{ border: 'none', height: 36, background: i === 0 ? T.accentSoft : 'transparent' }} />)}</div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}><HeadChip icon="plus" label="Prop-Konto" /><IconBtn icon="playTri" /><PrimaryBtn label="Trade loggen" icon="plus" /></div>
      </>}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1664, height: 112, borderRadius: T.radius, border: `1px solid ${T.border}`, background: T.surface, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', ...enterStyle(f, 6, D.card) }}>
        {KPIS.map((k, i) => <div key={k.t} style={{ padding: '18px 20px', borderLeft: i ? `1px solid ${T.border}` : 'none' }}><div style={{ fontSize: 13.5, color: T.text2, fontWeight: 600 }}>{k.t}</div><Num style={{ display: 'block', fontSize: 26, fontWeight: 600, marginTop: 6, color: k.c ?? T.text }}>{k.v}</Num><div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>{k.s}</div></div>)}
      </div>
      <div style={{ position: 'absolute', left: 0, top: 134, display: 'flex', alignItems: 'center', gap: 10, ...enterStyle(f, 10, D.card) }}><span style={{ fontSize: 17, fontWeight: 600 }}>Aktive Konten</span><Chip label="2" tone="neutral" small /></div>
      <div style={{ position: 'absolute', right: 0, top: 128, display: 'flex', gap: 10, ...enterStyle(f, 10, D.card) }}>{['Alle Firmen', 'Alle Phasen', 'Alle Status'].map((l) => <HeadChip key={l} label={l} caret style={{ height: 38 }} />)}</div>
      <div style={{ position: 'absolute', left: 0, top: 180, display: 'flex', alignItems: 'baseline', gap: 10, ...enterStyle(f, 12, D.card) }}><span style={{ fontSize: 15.5, fontWeight: 600 }}>Copy NQ</span><span style={{ fontSize: 12.5, color: T.muted }}>2 Konten · Copy-Trading</span></div>

      {ACCOUNTS.map((a, i) => {
        const barP = prog(f, 30 + i * 4, ms(800), ENTER); const cntP = prog(f, 20 + i * 4, ms(800));
        const x = i * 848;
        return (
          <div key={a.firm} style={{ position: 'absolute', left: x, top: 212, width: 816, height: 404, borderRadius: T.radius, border: `1px solid ${T.border}`, background: T.surface, padding: 20, ...enterStyle(f, 14 + i * 4, D.card) }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 10, height: 10, borderRadius: 5, background: T.accent, boxShadow: `0 0 ${6 + 8 * sine(f, ms(2000), i)}px ${T.accent}` }} />
              <div><div style={{ fontSize: 16.5, fontWeight: 600 }}>{a.firm}</div><div style={{ fontSize: 12.5, color: T.muted }}>{a.sub}</div></div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>{a.chips.map(([l, t]) => <Chip key={l} label={l} tone={t} />)}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: 18 }}>
              <div><div style={{ fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.muted, fontWeight: 700 }}>Kontostand</div><Num style={{ fontSize: 34, fontWeight: 600, lineHeight: 1.1 }}>{fmtUsd(a.balance * cntP, { decimals: 0 })}</Num></div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}><div style={{ fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.muted, fontWeight: 700 }}>P&L</div><Num style={{ fontSize: 22, fontWeight: 600, color: T.profit }}>{fmtUsd(a.pnl * cntP, { sign: true, decimals: a.pnl % 1 ? 2 : 0 })}</Num><div style={{ fontSize: 12, color: T.muted }}>{a.meta}</div></div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13.5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: T.text2 }}><span>Daily Loss</span><span>keine Regel</span></div>
              <div><div style={{ display: 'flex', justifyContent: 'space-between', color: T.text2 }}><span>Max-Drawdown-Puffer</span><Num><b style={{ color: T.text }}>{fmtUsd(a.ddLeft, { decimals: a.ddLeft === 2000 ? 2 : 0 })}</b> von {fmtUsd(a.ddMax)}</Num></div><div style={{ marginTop: 6 }}><ProgressBar frac={Math.min(1, a.ddLeft / a.ddMax)} progress={barP} /></div></div>
              <div><div style={{ display: 'flex', justifyContent: 'space-between', color: T.text2 }}><span>Fortschritt zum Ziel</span><Num><b style={{ color: T.text }}>{a.targetText.split(' · ')[0]}</b> · {a.targetText.split(' · ')[1]}</Num></div><div style={{ marginTop: 6 }}><ProgressBar frac={a.target} progress={barP} /></div></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: T.text2, borderTop: `1px solid ${T.border}`, paddingTop: 10 }}><span>{a.rowLabel}</span><span style={{ color: T.text }}>{a.rowValue}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: T.text2 }}><span>Puffer in Stops</span><Num style={{ color: T.text }}>{a.buffer}</Num></div>
            </div>
            <div style={{ position: 'absolute', left: 20, bottom: 18, display: 'flex', gap: 10 }}><Button label="Trades zuordnen" icon="check" kind="ghost" style={{ height: 38, border: `1px solid ${T.border}` }} /><Button label="Bearbeiten" icon="pen" kind="ghost" style={{ height: 38, border: 'none' }} /></div>
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 0, top: 636, width: 1664, height: 56, borderRadius: T.radius, border: `1px solid ${T.border}`, background: T.surface, display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px', ...enterStyle(f, 26, D.card) }}>
        <span style={{ fontSize: 16, fontWeight: 600 }}>Abgeschlossen</span><Chip label="2" tone="neutral" small /><span style={{ fontSize: 12.5, color: T.muted }}>bestanden, geplatzt oder archiviert</span><Icon name="chevron" size={16} color={T.muted} style={{ marginLeft: 'auto' }} />
      </div>
    </Shell>
  );
};
