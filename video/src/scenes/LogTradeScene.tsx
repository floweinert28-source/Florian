import React from 'react';
import { useCurrentFrame } from 'remotion';
import { loggedTrade } from '../data';
import { fmtEur, fmtNum, fmtR } from '../format';
import { D, ENTER, EXIT, enterStyle, exitStyle, ms, prog, pressScale } from '../motion';
import { FONT_NUM, FONT_TEXT, T } from '../theme';
import { Icon } from '../ui/Icon';
import { Button, Chip, Field, Toast, Typed } from '../ui/Primitives';
import { DefaultHead, HeadChip, Shell } from '../ui/Shell';
import { DashboardContent } from './DashboardContent';

/* Zeitpunkte (lokal) – die Cursor-Klicks in Main.tsx passen dazu */
export const LOG = { openClick: 24, modalIn: 26, longClick: 62, setupClick: 128, emotionClick: 146, saveClick: 196, modalOut: 197, toast: 200, update: 204 } as const;
const MX = 500, MY = 210, MW = 920, MH = 660; /* Dialog zentriert im Bild */
const typedNum = (v: number, d = 2) => fmtNum(v, d);

export const LogTradeScene: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const open = f >= LOG.modalIn && f < LOG.modalOut + ms(280);
  const modalStyle = f >= LOG.modalOut ? exitStyle(f, LOG.modalOut, ms(280), -18) : enterStyle(f, LOG.modalIn, D.card, 28);
  const dim = f >= LOG.modalOut ? 1 - prog(f, LOG.modalOut, ms(280), EXIT) : prog(f, LOG.modalIn, D.card);
  const longSel = f >= LOG.longClick, setupSel = f >= LOG.setupClick, emoSel = f >= LOG.emotionClick;
  const stars = Math.min(5, Math.max(0, Math.floor((f - 150) / 2) + 1));
  const shotP = prog(f, 154, D.card, ENTER);
  const t = loggedTrade;
  return (
    <>
      <Shell frame={f} exitAt={dur - 7} title="Dashboard" active="dashboard" head={<DefaultHead extra={<><HeadChip icon="filter" label="Filter" /><HeadChip icon="layout" label="Standard" caret /></>} right={<div style={{ scale: String(pressScale(f, LOG.openClick)), position: 'absolute', right: 0, top: 0, width: 150, height: 44, borderRadius: 12, boxShadow: f >= LOG.openClick && f < LOG.openClick + 8 ? `0 0 0 4px ${T.accentSoft}` : 'none' }} />} />}>
        <DashboardContent frame={f} t0={-1000} logged={LOG.update} />
      </Shell>
      {/* Abdunkeln: Nebensachen zurück, der Dialog ist der Held */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.62)', opacity: dim, pointerEvents: 'none' }} />
      {open ? (
        <div style={{ position: 'absolute', left: MX, top: MY, width: MW, height: MH, borderRadius: 18, border: `1px solid ${T.border2}`, background: T.surface, boxShadow: '0 30px 80px rgba(0,0,0,.65)', fontFamily: FONT_TEXT, color: T.text, ...modalStyle }}>
          <div style={{ position: 'absolute', left: 24, top: 18, fontSize: 18, fontWeight: 600 }}>Trade loggen</div>
          <div style={{ position: 'absolute', right: 20, top: 16, width: 32, height: 32, borderRadius: 10, display: 'grid', placeItems: 'center', color: T.muted, border: `1px solid ${T.border}` }}><Icon name="x" size={16} /></div>
          <div style={{ position: 'absolute', left: 24, right: 24, top: 60, height: 1, background: T.border }} />

          {/* linke Spalte */}
          <Field label="Symbol" style={{ position: 'absolute', left: 24, top: 76, width: 428 }} focused={f >= 40 && f < 58}><Typed frame={f} start={44} text={t.symbol} cps={1} /></Field>
          <Field label="Einstieg" style={{ position: 'absolute', left: 24, top: 152, width: 206 }} focused={f >= 68 && f < 80}><Typed frame={f} start={70} text={typedNum(t.entry)} cps={1.8} /></Field>
          <Field label="Ausstieg" style={{ position: 'absolute', left: 246, top: 152, width: 206 }} focused={f >= 80 && f < 92}><Typed frame={f} start={82} text={typedNum(t.exit)} cps={1.8} /></Field>
          <Field label="Stückzahl" style={{ position: 'absolute', left: 24, top: 228, width: 206 }} unit="Kontrakte" focused={f >= 114 && f < 120}><Typed frame={f} start={116} text={String(t.qty)} cps={1} /></Field>
          <Field label="Gebühren" style={{ position: 'absolute', left: 246, top: 228, width: 206 }} unit="€" focused={f >= 120 && f < 128}><Typed frame={f} start={122} text={typedNum(t.fees)} cps={1.5} /></Field>
          <div style={{ position: 'absolute', left: 24, top: 304, width: 428 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.muted }}>Emotionen</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {['Ruhig', 'Fokussiert', 'Unsicher', 'Gierig'].map((e) => <Chip key={e} label={e} selected={e === 'Ruhig' && emoSel} style={{ width: 96, justifyContent: 'center', height: 30, scale: String(e === 'Ruhig' ? pressScale(f, LOG.emotionClick) : 1) }} />)}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.muted, marginTop: 14 }}>Bewertung</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>{[1, 2, 3, 4, 5].map((i) => <Icon key={i} name="star" size={20} color={i <= stars ? T.warn : T.faint} fill={i <= stars ? T.warn : 'none'} />)}</div>
          </div>
          <div style={{ position: 'absolute', left: 24, top: 420, width: 428 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.muted }}>Notizen</div>
            <div style={{ marginTop: 6, height: 96, borderRadius: 10, border: `1px solid ${f >= 158 && f < 190 ? T.accent : T.border2}`, background: T.surface2, padding: '10px 12px', fontSize: 14, lineHeight: 1.5, color: T.text }}>
              <Typed frame={f} start={160} text="Sauber nach Plan. Range-Fade am Tageshoch, Ausstieg am Ziel." cps={2.6} />
            </div>
          </div>

          {/* rechte Spalte */}
          <div style={{ position: 'absolute', left: 468, top: 76, width: 428 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.muted }}>Richtung</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
              {(['Long', 'Short'] as const).map((d) => { const sel = d === 'Long' && longSel; return <div key={d} style={{ width: 208, height: 42, borderRadius: 10, border: `1px solid ${sel ? T.accent : T.border2}`, background: sel ? T.accentSoft : T.surface2, color: sel ? T.accent : T.text2, display: 'grid', placeItems: 'center', fontWeight: 600, scale: String(d === 'Long' ? pressScale(f, LOG.longClick) : 1) }}>{d}</div>; })}
            </div>
          </div>
          <Field label="Stop (Plan)" style={{ position: 'absolute', left: 468, top: 152, width: 206 }} focused={f >= 92 && f < 104}><Typed frame={f} start={94} text={typedNum(t.stop)} cps={1.8} /></Field>
          <Field label="Ziel (Plan)" style={{ position: 'absolute', left: 690, top: 152, width: 206 }} focused={f >= 104 && f < 114}><Typed frame={f} start={106} text={typedNum(t.target)} cps={1.8} /></Field>
          <div style={{ position: 'absolute', left: 468, top: 228, width: 428 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.muted }}>Setup</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {['Pullback', 'Breakout', 'Range-Fade', 'Reversal'].map((e) => <Chip key={e} label={e} selected={e === 'Range-Fade' && setupSel} style={{ width: 100, justifyContent: 'center', height: 30, scale: String(e === 'Range-Fade' ? pressScale(f, LOG.setupClick) : 1) }} />)}
            </div>
          </div>
          <div style={{ position: 'absolute', left: 468, top: 304, width: 428 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.muted }}>Screenshot</div>
            <div style={{ marginTop: 6, height: 212, borderRadius: 10, border: `1px dashed ${T.border2}`, background: T.surface2, position: 'relative', overflow: 'hidden', display: 'grid', placeItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: T.muted, fontSize: 12.5, opacity: 1 - shotP }}><Icon name="upload" size={22} /><span>Ablegen, auswählen oder einfügen</span></div>
              {/* Mini-Chart als Screenshot */}
              <div style={{ position: 'absolute', inset: 8, borderRadius: 8, background: '#0b0f0d', opacity: shotP, scale: String(0.96 + 0.04 * shotP), border: `1px solid ${T.border}` }}>
                <svg width="100%" height="100%" viewBox="0 0 400 190" preserveAspectRatio="none">
                  {Array.from({ length: 34 }, (_, i) => { const x = 12 + i * 11; const base = 120 - i * 1.8 + Math.sin(i * 1.3) * 9; const up = Math.sin(i * 2.1) > -0.2; const h = 8 + Math.abs(Math.cos(i * 1.7)) * 16; return <g key={i}><line x1={x + 3} x2={x + 3} y1={base - 6} y2={base + h + 6} stroke={up ? T.profit : T.loss} strokeWidth="1" /><rect x={x} y={base} width="6" height={h} fill={up ? T.profit : T.loss} /></g>; })}
                  <line x1="12" x2="388" y1="112" y2="112" stroke={T.info} strokeDasharray="3 3" /><text x="386" y="108" fontSize="9" fill={T.info} textAnchor="end">Einstieg 21.190,00</text>
                  <line x1="12" x2="388" y1="142" y2="142" stroke={T.loss} strokeDasharray="4 3" /><text x="386" y="138" fontSize="9" fill={T.loss} textAnchor="end">Stop 21.181,50</text>
                  <line x1="12" x2="388" y1="52" y2="52" stroke={T.profit} strokeDasharray="4 3" /><text x="386" y="48" fontSize="9" fill={T.profit} textAnchor="end">Ziel 21.213,00</text>
                  <text x="12" y="20" fontSize="11" fontWeight="700" fill={T.text}>NQ · Long</text><text x="70" y="20" fontSize="9" fill={T.muted}>5 min · 15:43 · vor dem Einstieg</text>
                </svg>
              </div>
            </div>
          </div>

          {/* Fuß */}
          <div style={{ position: 'absolute', left: 24, right: 24, bottom: 0, height: 66, borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
            <div style={{ fontFamily: FONT_NUM, fontSize: 13, color: T.text2, marginRight: 'auto' }}>Ergebnis <span style={{ color: T.profit, fontWeight: 600 }}>{fmtEur(t.pnl, { sign: true })}</span> · <span style={{ color: T.profit, fontWeight: 600 }}>{fmtR(t.r)}</span> · Punktwert 20 €</div>
            <Button label="Abbrechen" kind="ghost" />
            <Button label="Speichern" kind="primary" frame={f} pressAt={LOG.saveClick} style={{ width: 120, justifyContent: 'center' }} />
          </div>
        </div>
      ) : null}
      <Toast frame={f} start={LOG.toast} end={LOG.toast + 40} title="Trade gespeichert" sub={`${t.symbol} ${t.dir} · ${fmtEur(t.pnl, { sign: true })} · ${fmtR(t.r)}`} />
    </>
  );
};
