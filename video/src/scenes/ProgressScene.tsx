import React from 'react';
import { useCurrentFrame } from 'remotion';
import { J } from '../data';
import { fmtInt, fmtPct } from '../format';
import { D, ENTER, count, enterStyle, ms, prog } from '../motion';
import { FONT_NUM, T } from '../theme';
import { Heatmap, Ring } from '../ui/charts';
import { Button, Card, Checkbox, Num, StatTile } from '../ui/Primitives';
import { DefaultHead, Shell } from '../ui/Shell';
import { Icon } from '../ui/Icon';

export const CHECKS = [68, 80, 92, 104, 116]; /* Klick-Frames der fünf Kästchen (lokal) */

export const ProgressScene: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const done = CHECKS.filter((c) => f >= c).length;
  const pct = CHECKS.reduce((acc, c) => acc + 0.12 * prog(f, c, ms(400), ENTER), 0.4);
  const act = new Map(J.days.map((d) => [d.key, d.n]));
  const rules = J.rules;
  return (
    <Shell frame={f} exitAt={dur - 7} title="Fortschritt" active="progress" prevActive="stats" switchAt={0} head={<DefaultHead />}>
      <StatTile style={{ left: 0, top: 0, width: 544, height: 150 }} enter={enterStyle(f, 6, D.card)} big title="Aktuelle Serie" value={`${fmtInt(count(f, 12, ms(600), J.activityStreak))} Tage`} sub="Wochentage in Folge mit Trades, Check-in oder Notiz" right={<Icon name="arrowUp" size={22} color={T.accent} />} />
      <StatTile style={{ left: 560, top: 0, width: 544, height: 150 }} enter={enterStyle(f, 8, D.card)} big title="Heutiger Fortschritt" value={fmtPct(Math.min(1, pct), 0)} sub={`${2 + done} von 7 Schritten erledigt`} />
      <StatTile style={{ left: 1120, top: 0, width: 544, height: 150 }} enter={enterStyle(f, 10, D.card)} big title="% Regeln eingehalten" value={fmtPct(count(f, 16, ms(800), 0.93), 0)} sub="Handelstage mit Regel-Check im Zeitraum" right={<Ring size={104} value={count(f, 16, ms(800), 0.93)} />} />

      <Card title="Trading-Aktivität" style={{ left: 0, top: 170, width: 1664, height: 360 }} enter={enterStyle(f, 12, D.card)} right={<><div style={{ width: 30, height: 30, borderRadius: 15, border: `1px solid ${T.border}`, display: 'grid', placeItems: 'center' }}><Icon name="chevronL" size={14} color={T.text2} /></div><div style={{ width: 30, height: 30, borderRadius: 15, border: `1px solid ${T.border}`, display: 'grid', placeItems: 'center' }}><Icon name="chevronR" size={14} color={T.text2} /></div></>}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, display: 'flex', justifyContent: 'center' }}>
          <Heatmap days={act} from="2026-04-06" to="2026-10-07" frame={f} start={20} cell={34} gap={6} />
        </div>
        <div style={{ position: 'absolute', right: 0, bottom: 0, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: T.muted }}>Weniger {[0.35, 0.5, 0.65, 0.8, 1].map((o) => <span key={o} style={{ width: 14, height: 14, borderRadius: 4, background: T.accent, opacity: o }} />)} Mehr</div>
      </Card>

      <Card title="Tages-Checkliste" style={{ left: 0, top: 550, width: 1000, height: 360 }} enter={enterStyle(f, 18, D.card)} right={<Button label="Tag ansehen" kind="ghost" style={{ height: 34, border: `1px solid ${T.border}` }} />}>
        <div style={{ position: 'absolute', left: 0, top: 0, fontSize: 12.5, color: T.muted }}>Mittwoch, 7. Oktober 2026</div>
        {rules.map((r, i) => (
          <div key={r} style={{ position: 'absolute', left: 0, right: 0, top: 30 + i * 52, height: 46, display: 'flex', alignItems: 'center', gap: 14, padding: '0 12px', borderRadius: 10, background: f >= CHECKS[i] ? 'rgba(52,245,138,0.06)' : T.surface2, border: `1px solid ${T.border}`, fontSize: 14.5, color: f >= CHECKS[i] ? T.text : T.text2, ...enterStyle(f, 24 + i * 2, ms(300), 10) }}>
            <Checkbox frame={f} checkAt={CHECKS[i]} /><span>{r}</span>
          </div>
        ))}
        <div style={{ position: 'absolute', right: 0, top: 4, fontSize: 12.5, color: T.muted }}><Num>{done}</Num> von <Num>{rules.length}</Num> eingehalten</div>
      </Card>
      <Card title="Aktuelle Regeln" style={{ left: 1016, top: 550, width: 648, height: 352 }} enter={enterStyle(f, 21, D.card)} right={<Button label="Regeln bearbeiten" icon="pen" kind="ghost" style={{ height: 34, border: `1px solid ${T.border}` }} />}>
        {rules.map((r, i) => <div key={r} style={{ display: 'flex', gap: 12, height: 40, alignItems: 'center', fontSize: 14.5, ...enterStyle(f, 28 + i * 2, ms(300), 10) }}><Num style={{ color: T.accent, fontWeight: 700 }}>{i + 1}.</Num><span>{r}</span></div>)}
      </Card>
    </Shell>
  );
};
