import React from 'react';
import { useCurrentFrame } from 'remotion';
import { J } from '../data';
import { fmtDateShort, fmtEur, fmtInt, fmtPct } from '../format';
import { D, MOVE, count, enterStyle, ms, prog, pressScale } from '../motion';
import { FONT_NUM, T } from '../theme';
import { LineChart } from '../ui/charts';
import { Button, Card, Num, StatTile, Tab, Toggle } from '../ui/Primitives';
import { DefaultHead, HeadChip, Shell } from '../ui/Shell';

export const FLIPS = { dailyLoss: 106, risk: 122 } as const;

export const ShadowScene: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const sh = J.shadow; const end = sh[sh.length - 1];
  const drawP = prog(f, 22, ms(1500), MOVE);
  const c = (start: number, to: number) => count(f, start, ms(800), to);
  const rules: { label: string; value?: string; on: boolean; flipAt?: number }[] = [
    { label: 'Max. Trades pro Tag', value: '3 Trades', on: true },
    { label: 'Max. Tagesverlust', value: '500 €', on: f >= FLIPS.dailyLoss, flipAt: FLIPS.dailyLoss },
    { label: 'Stopp nach Verlustserie', value: '2 Verluste', on: true },
    { label: 'Max. Risiko pro Trade', value: '1 %', on: f >= FLIPS.risk, flipAt: FLIPS.risk },
    { label: 'Handelszeiten', value: '15–17 Uhr', on: false },
  ];
  return (
    <Shell frame={f} exitAt={dur - 7} title="Schatten-Ich" active="shadow" prevActive="progress" switchAt={0} head={<DefaultHead right={<><Tab label="Woche" /><Tab label="Monat" /><Tab label="Gesamt" active /><HeadChip icon="image" label="Bildkarte" /></>} />}>
      <div style={{ position: 'absolute', left: 0, top: 0, ...enterStyle(f, 6, D.card) }}>
        <div style={{ fontSize: 15.5, fontWeight: 600 }}>Dein Schatten-Ich handelt wie du – nur ohne Regelbrüche.</div>
        <div style={{ fontSize: 12.5, color: T.muted, marginTop: 2 }}>Hier siehst du, was die Abweichung kostet.</div>
      </div>
      <StatTile style={{ left: 0, top: 56, width: 404, height: 110 }} enter={enterStyle(f, 8, D.card)} title="Disziplin-Kosten" topRight="Gesamt" value={fmtEur(c(14, J.disciplineCost))} valueColor={T.loss} sub={`${J.violations} Trades mit Regelbruch`} />
      <StatTile style={{ left: 420, top: 56, width: 404, height: 110 }} enter={enterStyle(f, 10, D.card)} title="Echt" topRight={`${J.summary.n} Trades`} value={fmtEur(c(16, end.actual), { sign: true })} valueColor={T.text} sub="So lief es wirklich" />
      <StatTile style={{ left: 840, top: 56, width: 404, height: 110 }} enter={enterStyle(f, 12, D.card)} title="Schatten-Ich" value={fmtEur(c(18, end.shadow), { sign: true })} valueColor={T.profit} sub="Mit allen Regeln eingehalten" />
      <StatTile style={{ left: 1260, top: 56, width: 404, height: 110 }} enter={enterStyle(f, 14, D.card)} title="Verstöße" value={fmtInt(c(20, J.violations))} sub={`${fmtPct(J.violations / J.summary.n, 0)} der Trades`} />

      <Card title="Equity: echt vs. Schatten-Ich" style={{ left: 0, top: 186, width: 1664, height: 400 }} enter={enterStyle(f, 14, D.card)} right={<div style={{ display: 'flex', gap: 16, fontSize: 12.5, color: T.text2 }}><span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: '#d6dbd8', marginRight: 6 }} />Echt</span><span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: T.accent, marginRight: 6 }} />Schatten-Ich</span></div>}>
        <LineChart w={1624} h={330} series={[{ values: sh.map((d) => d.actual), color: '#d6dbd8', width: 2 }, { values: sh.map((d) => d.shadow), color: T.accent, width: 2.4 }]} progress={drawP} yFmt={(v) => fmtEur(v, { decimals: 0 })} xLabels={[0, 0.2, 0.4, 0.6, 0.8, 1].map((q) => fmtDateShort(sh[Math.round(q * (sh.length - 1))].key))} />
        <div style={{ position: 'absolute', right: 20, top: 10, padding: '8px 12px', borderRadius: 10, background: T.surface2, border: `1px solid ${T.border}`, fontSize: 12.5, color: T.text2, opacity: prog(f, 68, D.card) }}>Lücke am Ende: <Num style={{ color: T.loss, fontWeight: 700 }}>{fmtEur(end.shadow - end.actual)}</Num></div>
      </Card>

      <Card title="Mein Regelwerk" style={{ left: 0, top: 606, width: 1664, height: 296, padding: 16 }} enter={enterStyle(f, 20, D.card)} bodyStyle={{ marginTop: -6 }}>
        {rules.map((r, i) => (
          <div key={r.label} style={{ display: 'flex', alignItems: 'center', height: 48, borderBottom: i < rules.length - 1 ? `1px solid ${T.border}` : 'none', gap: 16, ...enterStyle(f, 26 + i * 2, ms(300), 10) }}>
            <span style={{ fontSize: 14.5, fontWeight: r.on ? 600 : 500, color: r.on ? T.text : T.text2, flex: 1 }}>{r.label}</span>
            <div style={{ height: 32, padding: '0 12px', borderRadius: 9, border: `1px solid ${T.border2}`, background: T.surface2, display: 'flex', alignItems: 'center', fontFamily: FONT_NUM, fontSize: 13.5, color: T.text, opacity: r.on ? 1 : 0, width: 120, scale: String(r.flipAt ? pressScale(f, r.flipAt, 0.04) : 1) }}>{r.value}</div>
            <Toggle frame={f} on={r.on} flipAt={r.flipAt} />
          </div>
        ))}
      </Card>
    </Shell>
  );
};
