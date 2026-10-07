import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import './fonts';
import { FONT_TEXT } from './fonts';
import { IN, OUT, SIG, inOut, lerp, prog, sec } from './anim';
import { camAt, camTransform, fit, FULL, toView, type CamKey } from './camera';
import { COPY } from './copy';
import { shotsFor, VH, VW, type Box, type Lang } from './shots';
import { CursorView, cursorAt, type CursorKey } from './ui/Cursor';
import { JMark } from './ui/Logo';

/* Bühne: grauer Hintergrund, die App als Fenster (Inhalt 1440 × 900 bei 0,86), darüber eine kurze Überschrift je Szene */
const K = 0.86, BAR = 34;
const WIN = { w: VW * K, h: VH * K + BAR, x: (1920 - VW * K) / 2, y: 214 };
const INK = '#141414', MUTED = '#86867f', GREEN = '#1fb866';

/* Zeitplan in Sekunden */
const T = {
  logoIn: 0.2, logoOut: 1.6, winIn: 1.75,
  beats: [2.2, 8.1, 17.4, 23.7, 29.9], outro: 36.0, end: 40.5,
  dash: { push: 3.8, pull: 6.9 },
  log: { cursorIn: 8.3, toButton: 8.45, open: 9.4, push: 9.9, pull: 12.2, scroll: 13.2, cursorBack: 14.6, toSave: 14.7, save: 15.55 },
  trades: { push: 18.7, hiIn: 19.9, hiOut: 22.0, pull: 22.4 },
  shadow: { push: 25.0, pull: 28.6 },
  prop: { push: 31.2, pull: 34.8 },
};
export const DURATION = sec(T.end);

const union = (a: Box, b: Box): Box => { const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y); return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y }; };

export const Main: React.FC<{ lang: Lang }> = ({ lang }) => {
  const f = useCurrentFrame();
  const S = shotsFor(lang).screens; const C = COPY[lang];
  const src = (n: string) => staticFile(`shots/${lang}/${n}.png`);

  /* Fokusbereiche aus der Aufnahme */
  const ed = S.editor; const modalFullH = ed.scrollH + 2; const scrollMax = Math.max(0, modalFullH - ed.modal.h);
  const focus = {
    dash: fit(union(S.dashboard.cards[0], S.dashboard.cards[2])),
    modalTop: fit({ x: ed.modal.x, y: ed.modal.y, w: ed.modal.w, h: 470 }, { pad: 40 }),
    trades: fit({ x: S.trades.table.x, y: S.trades.table.y, w: 950, h: S.trades.firstRow.y - S.trades.table.y + 4 * S.trades.firstRow.h }),
    shadow: fit({ ...S.shadow.tiles, w: S.shadow.tiles.w * 0.745 }),
    prop: fit(S.prop.cards[0]),
  };
  const CAM: CamKey[] = [
    { at: sec(T.dash.push), dur: sec(1.6), to: focus.dash }, { at: sec(T.dash.pull), dur: sec(1.0), to: FULL },
    { at: sec(T.log.push), dur: sec(1.5), to: focus.modalTop }, { at: sec(T.log.pull), dur: sec(1.0), to: FULL },
    { at: sec(T.trades.push), dur: sec(1.6), to: focus.trades }, { at: sec(T.trades.pull), dur: sec(1.0), to: FULL },
    { at: sec(T.shadow.push), dur: sec(1.6), to: focus.shadow }, { at: sec(T.shadow.pull), dur: sec(1.0), to: FULL },
    { at: sec(T.prop.push), dur: sec(1.6), to: focus.prop }, { at: sec(T.prop.pull), dur: sec(1.0), to: FULL },
  ];
  const cam = camAt(f, CAM);

  /* Ebenen der Standbilder: jede neue blendet über der vorigen ein */
  const L = T.log;
  const layers: { name: string; o: number }[] = [
    { name: 'dashboard', o: 1 },
    { name: 'editor-bg', o: prog(f, sec(L.open), sec(0.3), OUT) },
    { name: 'saved', o: prog(f, sec(L.save), sec(0.35), OUT) },
    { name: 'trades', o: prog(f, sec(T.beats[2]), sec(0.5), SIG) },
    { name: 'shadow', o: prog(f, sec(T.beats[3]), sec(0.5), SIG) },
    { name: 'prop', o: prog(f, sec(T.beats[4]), sec(0.5), SIG) },
  ];
  let base = 0; layers.forEach((l, i) => { if (l.o >= 1) base = i; });

  /* Trade-Dialog: springt auf wie in der App, scrollt ruhig bis zum Speichern-Knopf, schließt beim Klick */
  const modalIn = prog(f, sec(L.open), sec(0.38), OUT), modalOut = prog(f, sec(L.save), sec(0.2), IN);
  const modalVisible = f >= sec(L.open) && modalOut < 1 && base <= 1;
  const scrollY = lerp(0, scrollMax, prog(f, sec(L.scroll), sec(1.6), SIG));

  /* Cursor: zwei Klicks, sonst unsichtbar */
  const logBtn = S.dashboard.logTrade; const save = ed.save;
  const saveX = ed.modal.x + save.x + save.w / 2, saveY = ed.modal.y + save.y - scrollMax + save.h / 2;
  const CUR: CursorKey[] = [
    { at: 0, x: 1040, y: 560 },
    { at: sec(L.toButton), x: logBtn.x + logBtn.w / 2, y: logBtn.y + logBtn.h / 2, dur: sec(0.9), click: true },
    { at: sec(L.cursorBack) - 1, x: ed.modal.x + ed.modal.w * 0.62, y: 640, dur: 1 },
    { at: sec(L.toSave), x: saveX, y: saveY, dur: sec(0.8), click: true },
  ];
  const cur = cursorAt(f, CUR); const curView = toView(cam, cur.x, cur.y);
  const curOpacity = prog(f, sec(L.cursorIn), sec(0.2), OUT) * (1 - prog(f, sec(L.open) + sec(0.2), sec(0.25), IN))
    + prog(f, sec(L.cursorBack), sec(0.2), OUT) * (1 - prog(f, sec(L.save) + sec(0.35), sec(0.25), IN));

  /* Fenster: großer Auftritt, am Ende ruhiger Abgang */
  const winA = prog(f, sec(T.winIn), sec(0.9), OUT), winB = prog(f, sec(T.outro), sec(0.6), IN);
  const winStyle: React.CSSProperties = { opacity: winA * (1 - winB), translate: `0px ${(lerp(40, 0, winA) + lerp(0, -16, winB)).toFixed(2)}px`, scale: String(lerp(0.97, 1, winA) * lerp(1, 0.98, winB)) };

  const hl = S.trades.firstRow; const hiO = prog(f, sec(T.trades.hiIn), sec(0.5), OUT) * (1 - prog(f, sec(T.trades.hiOut), sec(0.4), IN));
  const drift = Math.sin((f / sec(14)) * Math.PI * 2) * 30;

  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #ececea 0%, #dededa 100%)', fontFamily: FONT_TEXT, overflow: 'hidden' }}>
      {/* Umgebung: ein weicher Lichtschein, der kaum merklich wandert */}
      <div style={{ position: 'absolute', left: 260 + drift, top: -420, width: 1400, height: 900, borderRadius: '50%', background: 'radial-gradient(closest-side, rgba(255,255,255,0.75), rgba(255,255,255,0))', pointerEvents: 'none' }} />

      {/* Intro: Marke */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 496, display: 'flex', justifyContent: 'center', ...inOut(f, sec(T.logoIn), sec(T.logoOut), { inDur: sec(0.8), outDur: sec(0.3), rise: 16, lift: -12 }) }}>
        <Brand />
      </div>

      {/* Überschriften je Szene */}
      {C.beats.map((b, i) => {
        const inAt = sec(T.beats[i] + (i === 0 ? 0.4 : 0.3)); const outAt = sec(i + 1 < T.beats.length ? T.beats[i + 1] : T.outro);
        if (f < inAt - 2 || f > outAt + sec(0.35)) return null;
        return (
          <div key={b.eyebrow} style={{ position: 'absolute', left: 0, right: 0, top: 86, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: MUTED, ...inOut(f, inAt, outAt, { inDur: sec(0.5), rise: 10 }) }}>
              <span style={{ width: 7, height: 7, borderRadius: 4, background: GREEN }} />{b.eyebrow}
            </div>
            <div style={{ fontSize: 46, fontWeight: 500, letterSpacing: '-0.02em', color: INK, lineHeight: 1.1, ...inOut(f, inAt + sec(0.08), outAt, { inDur: sec(0.55), rise: 14 }) }}>{b.title}</div>
          </div>
        );
      })}

      {/* Fenster mit der echten App */}
      <div style={{ position: 'absolute', left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, borderRadius: 14, overflow: 'hidden', background: '#000', boxShadow: '0 50px 100px -30px rgba(20,20,20,0.45), 0 18px 40px -12px rgba(20,20,20,0.2), 0 0 0 1px rgba(0,0,0,0.08)', transformOrigin: '50% 60%', ...winStyle }}>
        <div style={{ position: 'relative', height: BAR, background: '#161817', borderBottom: '1px solid #0a0b0a', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8 }}>
          {['#ff5f57', '#febc2e', '#28c840'].map((c) => <span key={c} style={{ width: 12, height: 12, borderRadius: 6, background: c }} />)}
          <span style={{ position: 'absolute', left: 0, right: 0, textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#8c948f', letterSpacing: '0.01em' }}>Journalyst</span>
        </div>
        <div style={{ position: 'relative', width: WIN.w, height: VH * K, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: VW, height: VH, transformOrigin: '0 0', scale: String(K) }}>
            <div style={{ position: 'absolute', left: 0, top: 0, width: VW, height: VH, ...camTransform(cam) }}>
              {layers.map((l, i) => (i >= base && l.o > 0 ? <Img key={l.name} src={src(l.name)} style={{ position: 'absolute', left: 0, top: 0, width: VW, height: VH, opacity: l.o, zIndex: i < 2 ? i : i + 1 }} /> : null))}
              {modalVisible ? (
                <div style={{ position: 'absolute', left: ed.modal.x, top: ed.modal.y, width: ed.modal.w, height: ed.modal.h, borderRadius: 16, overflow: 'hidden', zIndex: 2, opacity: modalIn * (1 - modalOut), scale: String(lerp(0.96, 1, modalIn) * lerp(1, 0.98, modalOut)), boxShadow: '0 18px 50px rgba(0,0,0,0.55)' }}>
                  <Img src={src('editor-modal')} style={{ position: 'absolute', left: 0, top: 0, width: ed.modal.w, height: modalFullH, translate: `0px ${(-scrollY).toFixed(2)}px` }} />
                </div>
              ) : null}
              {hiO > 0 ? <div style={{ position: 'absolute', left: hl.x + 4, top: hl.y + 2, width: hl.w - 8, height: hl.h - 4, borderRadius: 10, border: '1.5px solid rgba(52,245,138,0.6)', background: 'rgba(52,245,138,0.07)', opacity: hiO, zIndex: 10 }} /> : null}
            </div>
            {curOpacity > 0.001 ? <CursorView x={curView.x} y={curView.y} clickAge={cur.clickAge} opacity={Math.min(1, curOpacity)} /> : null}
          </div>
        </div>
      </div>

      {/* Abspann */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 410, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30 }}>
        <div style={inOut(f, sec(T.outro + 0.5), null, { inDur: sec(0.8), rise: 16 })}><Brand /></div>
        <div style={{ display: 'flex', gap: 14 }}>
          {C.claim.map((w, i) => <span key={w} style={{ fontSize: 44, fontWeight: 500, letterSpacing: '-0.02em', color: i === 2 ? GREEN : INK, ...inOut(f, sec(T.outro + 0.9 + i * 0.1), null, { inDur: sec(0.6), rise: 14 }) }}>{w}</span>)}
        </div>
        <div style={{ marginTop: 10, padding: '15px 28px', borderRadius: 999, background: INK, color: '#fff', fontSize: 18, fontWeight: 600, letterSpacing: '0.005em', ...inOut(f, sec(T.outro + 1.6), null, { inDur: sec(0.6), rise: 12 }) }}>{C.cta}</div>
      </div>
    </AbsoluteFill>
  );
};

const Brand: React.FC = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
    <JMark size={44} color={INK} />
    <span style={{ fontSize: 56, fontWeight: 900, letterSpacing: '0.05em', color: INK, lineHeight: 1 }}>JOURNALYST</span>
  </div>
);
