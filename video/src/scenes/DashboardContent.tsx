import React from 'react';
import { J, before, daysCum, dayMap, lastDays, loggedTrade } from '../data';
import { fmtDate, fmtDateShort, fmtEur, fmtNum, fmtPct } from '../format';
import { D, ENTER, MOVE, count, enterStyle, lerp, ms, prog } from '../motion';
import { FONT_NUM, T } from '../theme';
import { Bars, CalendarMonth, Donut, HalfGauge, LineChart, Radar, SplitBar } from '../ui/charts';
import { Icon } from '../ui/Icon';
import { Card, Chip, Num, StatTile, Tab } from '../ui/Primitives';

/* Das Dashboard der App, 1:1 im Aufbau: 5 Kacheln, Reihe mit drei Karten, Reihe mit Letzte Trades und Kalender.
   t0: Frame, ab dem alles einblendet (−1000 = steht schon). logged: Frame, ab dem der neue NQ-Trade einfließt. */
export const DashboardContent: React.FC<{ frame: number; t0: number; logged?: number | null }> = ({ frame, t0, logged = null }) => {
  const s = J.summary; const upd = logged == null ? 0 : prog(frame, logged, ms(700), MOVE);
  const tile = (i: number) => enterStyle(frame, t0 + i * 2, ms(350), 24);
  const cnt = (i: number, to: number) => count(frame, t0 + i * 2 + 6, ms(800), to);
  const mix = (i: number, b: number, a: number) => lerp(cnt(i, b), a, upd);
  const cardIn = (i: number) => enterStyle(frame, t0 + 16 + i * 3, D.card, 24);
  const drawP = prog(frame, t0 + 36, D.draw, MOVE);
  const radarP = prog(frame, t0 + 30, ms(1000), ENTER);

  const total = mix(0, before.total, s.total); const n = upd > 0.5 ? s.n : before.n;
  const winRate = mix(1, before.wins / before.n, s.winRate);
  const pfBefore = (s.gp - loggedTrade.pnl) / Math.abs(s.gl); const pf = mix(2, pfBefore, s.profitFactor);
  const dayWinBefore = (J.days.filter((d) => d.pnl > 0).length - 1) / J.days.length; const dayWin = mix(3, dayWinBefore, s.dailyWinRate);
  const avgWinBefore = (s.gp - loggedTrade.pnl) / before.wins; const payoff = mix(4, avgWinBefore / Math.abs(s.avgLoss), s.payoff);

  const bars = lastDays(22); const sep = new Map(J.days.filter((d) => d.key.startsWith('2026-09')).map((d) => [d.key, { pnl: d.pnl, n: d.n }]));
  const sepTotal = [...sep.values()].reduce((a, d) => a + d.pnl, 0);
  const recent = (upd > 0 ? J.recent.slice(0, 6) : J.recent.slice(1, 6));
  const shift = upd > 0 ? prog(frame, logged!, ms(400), MOVE) : 0;
  const score = J.traderScore;

  const TW = 320, TG = 16, TH = 116; const CW = 544, CG = 16;
  return (
    <>
      {/* Kacheln */}
      <StatTile style={{ left: 0, top: 0, width: TW, height: TH }} enter={tile(0)} title="Netto P&L" topRight={`${n} Trades`} value={fmtEur(total, { sign: true })} valueColor={T.profit} sub={`Ø ${fmtEur(total / n)} pro Trade`} />
      <StatTile style={{ left: TW + TG, top: 0, width: TW, height: TH }} enter={tile(1)} title="Trade-Trefferquote" value={fmtPct(winRate)} right={<HalfGauge wins={upd > 0.5 ? s.wins : before.wins} be={0} losses={s.losses} progress={prog(frame, t0 + 8, ms(800))} />} />
      <StatTile style={{ left: 2 * (TW + TG), top: 0, width: TW, height: TH }} enter={tile(2)} title="Profit-Faktor" value={fmtNum(pf, 2)} right={<Donut size={64} frac={s.gp / (s.gp + Math.abs(s.gl))} progress={prog(frame, t0 + 10, ms(800))} />} />
      <StatTile style={{ left: 3 * (TW + TG), top: 0, width: TW, height: TH }} enter={tile(3)} title="Tages-Trefferquote" value={fmtPct(dayWin)} right={<HalfGauge wins={J.days.filter((d) => d.pnl > 0).length} be={0} losses={J.days.filter((d) => d.pnl <= 0).length} progress={prog(frame, t0 + 12, ms(800))} />} />
      <StatTile style={{ left: 4 * (TW + TG), top: 0, width: TW, height: TH }} enter={tile(4)} title="Ø Gewinn/Verlust pro Trade" value={fmtNum(payoff, 2)} right={<SplitBar win={s.avgWin} loss={s.avgLoss} progress={prog(frame, t0 + 14, ms(800))} w={170} fmt={(v) => fmtEur(v)} />} />

      {/* Reihe 1 */}
      <Card title="Gesamt-Score" style={{ left: 0, top: 136, width: CW, height: 300 }} enter={cardIn(0)}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: -6, display: 'flex', justifyContent: 'center' }}><Radar size={200} axes={score.axes.map((a) => ({ label: a.label, score: a.score }))} progress={radarP} /></div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', gap: 18 }}>
          <div><div style={{ fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: T.muted, fontWeight: 700 }}>Dein Score</div><Num style={{ fontSize: 30, fontWeight: 700, color: T.accent, lineHeight: 1.1 }}>{Math.round(count(frame, t0 + 36, ms(900), score.overall))}</Num></div>
          <div style={{ flex: 1, position: 'relative', height: 26 }}>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 10, height: 6, borderRadius: 3, background: `linear-gradient(90deg, ${T.loss}, ${T.warn} 45%, ${T.accent})`, opacity: 0.8 }} />
            <div style={{ position: 'absolute', top: 5, left: `${count(frame, t0 + 36, ms(900), score.overall)}%`, width: 16, height: 16, borderRadius: 8, background: T.accent, border: `3px solid ${T.surface}`, translate: '-8px 0px', boxShadow: `0 0 10px ${T.accentGlow}` }} />
            <div style={{ position: 'absolute', left: 0, right: 0, top: 22, display: 'flex', justifyContent: 'space-between', fontSize: 10, color: T.muted, fontFamily: FONT_NUM }}>{[0, 20, 40, 60, 80, 100].map((v) => <span key={v}>{v}</span>)}</div>
          </div>
        </div>
      </Card>
      <Card title="Kumulierter Tages-P&L" style={{ left: CW + CG, top: 136, width: CW, height: 300 }} enter={cardIn(1)}>
        <LineChart w={CW - 40} h={222} series={[{ values: daysCum.map((d) => d.e), color: T.accent, area: true }]} progress={drawP} yFmt={(v) => fmtEur(v, { decimals: 0 })} xLabels={[fmtDateShort(daysCum[0].key), fmtDateShort(daysCum[Math.floor(daysCum.length / 2)].key), fmtDateShort(daysCum[daysCum.length - 1].key)]} />
      </Card>
      <Card title="Netto-P&L pro Tag" style={{ left: 2 * (CW + CG), top: 136, width: CW, height: 300 }} enter={cardIn(2)}>
        <Bars w={CW - 40} h={222} values={bars.map((d) => d.pnl)} frame={frame} start={t0 + 40} stagger={1} yFmt={(v) => fmtEur(v, { decimals: 0 })} xLabels={[fmtDateShort(bars[0].key), fmtDateShort(bars[bars.length - 1].key)]} />
      </Card>

      {/* Reihe 2 */}
      <Card title="Letzte Trades & offene Positionen" style={{ left: 0, top: 456, width: CW, height: 446 }} enter={cardIn(3)}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}><Tab label="Letzte Trades" active /><Tab label="Offene Positionen" count={1} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 120px', padding: '6px 12px', fontSize: 12, color: T.muted, borderBottom: `1px solid ${T.border}` }}><span>Geschlossen</span><span>Symbol</span><span style={{ textAlign: 'right' }}>Netto P&L</span></div>
        <div style={{ position: 'relative' }}>
          {recent.map((t, i) => {
            const isNew = upd > 0 && i === 0; const y = isNew ? 0 : (i - (upd > 0 ? 1 : 0)) * 40 + shift * 40;
            const st = isNew ? enterStyle(frame, logged! + 4, ms(350), -10) : enterStyle(frame, t0 + 40 + i * 2, ms(300), 12);
            return (
              <div key={t.closedAt + t.symbol} style={{ position: 'absolute', left: 0, right: 0, top: y, height: 40, display: 'grid', gridTemplateColumns: '120px 1fr 120px', alignItems: 'center', padding: '0 12px', fontSize: 13.5, borderBottom: `1px solid ${T.border}`, background: isNew ? `rgba(52,245,138,${(0.1 * (1 - prog(frame, logged! + 20, ms(900)))).toFixed(3)})` : 'transparent', ...st }}>
                <Num style={{ color: T.text2 }}>{fmtDate(t.closedAt)}</Num>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontWeight: 600 }}>{t.symbol}</span><Chip small label={t.dir} tone={t.dir === 'Long' ? 'profit' : 'loss'} /></span>
                <Num style={{ textAlign: 'right', fontWeight: 600, color: t.pnl >= 0 ? T.profit : T.loss }}>{fmtEur(t.pnl, { sign: true })}</Num>
              </div>
            );
          })}
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, textAlign: 'center', fontSize: 12.5, color: T.text2, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>Mehr anzeigen</div>
      </Card>
      <Card title="Kalender" style={{ left: CW + CG, top: 456, width: 2 * CW + CG, height: 446 }} enter={cardIn(4)} right={<Num style={{ fontSize: 13, color: T.text2 }}><span style={{ color: sepTotal >= 0 ? T.profit : T.loss, fontWeight: 600 }}>{fmtEur(sepTotal, { sign: true })}</span> · {sep.size} Handelstage</Num>}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 17, border: `1px solid ${T.border}`, display: 'grid', placeItems: 'center' }}><Icon name="chevronL" size={16} color={T.text2} /></div>
          <span style={{ fontWeight: 600, fontSize: 15 }}>September 2026</span>
          <div style={{ width: 34, height: 34, borderRadius: 17, border: `1px solid ${T.border}`, display: 'grid', placeItems: 'center' }}><Icon name="chevronR" size={16} color={T.text2} /></div>
          <Tab label="Heute" style={{ height: 34 }} />
        </div>
        <CalendarMonth year={2026} month={8} days={sep} frame={frame} start={t0 + 44} w={2 * CW + CG - 40} cellH={52} fmt={(v) => fmtEur(v, { sign: true, decimals: 0 })} />
      </Card>
    </>
  );
};
export const dayPnl = (key: string) => dayMap.get(key)?.pnl ?? 0;
