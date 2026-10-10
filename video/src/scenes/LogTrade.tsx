/* 19,5–25 s: Trade loggen im echten Dialog. Symbol wählen, Einstieg, Ausstieg und Kontrakte tippen, speichern.
   Jeder Zustand ist eine echte Aufnahme; beim Tippen deckt ein Ausschnitt des nächsten Zustands die Zeichen einzeln auf. */
import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame } from 'remotion';
import { Cam, camAt, camStyle, clamp01, FPS, IN, lerp, OUT, prog, sec, toScreen } from '../anim';
import { cap, img } from '../cap';
import { Bg } from '../ui/Bg';
import { CursorView, cursorAt } from '../ui/Cursor';

const M = cap.modal; const CW = M.clip.w, CH = M.clip.h;
const STATES = ['m0', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8'];
/* Zeitplan in Sekunden ab Szenenbeginn */
const T = { menu: 1.0, pick: 1.5, entry: 2.0, entryDone: 2.5, exitFocus: 2.65, exit: 2.75, exitDone: 3.2, qtyFocus: 3.35, qty: 3.55, blur: 3.75, click: 4.5 };
const KEY = 0.07; /* Sekunden je Tastendruck */
const stateAt = (t: number) => t < T.menu ? 'm0' : t < T.pick ? 'm1' : t < T.entryDone ? 'm2' : t < T.exitFocus ? 'm3' : t < T.exitDone ? 'm4' : t < T.qtyFocus ? 'm5' : t < T.qty ? 'm6' : t < T.blur ? 'm7' : 'm8';

const center = (r: { x: number; y: number; w: number; h: number }) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });
type Field = typeof M.entry;

/* Zeichen eines Feldes aufdecken: Ausschnitt aus dem Zustand „next“ bis zur Breite der getippten Zeichen, dazu der Textcursor */
const Typing: React.FC<{ f: number; field: Field; start: number; next: string; caretFrom: number; caretTo: number }> = ({ f, field, start, next, caretFrom, caretTo }) => {
  const t = f / FPS; if (t < caretFrom || t >= caretTo) return null;
  const len = field.widths.length; const n = t < start ? 0 : Math.min(len, Math.floor((t - start) / KEY) + 1);
  const w = n ? field.widths[n - 1] : 0; const typing = t >= start && n < len;
  const left = field.textX - 1, top = field.y + 3;
  const on = typing || Math.floor(f / (FPS / 2)) % 2 === 0;
  return (
    <>
      {n > 0 ? (
        <div style={{ position: 'absolute', left, top, width: w + 2, height: field.h - 6, overflow: 'hidden' }}>
          <Img src={img(`${next}.png`)} style={{ position: 'absolute', left: -left, top: -top, width: CW, height: CH }} />
        </div>
      ) : null}
      <div style={{ position: 'absolute', left: field.textX + w + 0.6, top: field.y + field.h / 2 - field.fontSize * 0.62, width: 1.3, height: field.fontSize * 1.24, background: '#f2f0ec', opacity: on ? 1 : 0 }} />
    </>
  );
};

export const LogTrade: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS;
  const box = M.box; const fields = { x: 364, y: M.entry.y + M.entry.h / 2 };
  const save = center(M.save); const prev = M.preview;
  const cam: Cam = camAt(f, { s: 1.4, x: box.x + box.w / 2, y: box.y + box.h / 2 }, [
    { at: sec(1.35), dur: sec(0.8), to: { s: 2.35, x: fields.x, y: fields.y } },
    { at: sec(3.6), dur: sec(0.75), to: { s: 1.95, x: 364, y: (prev.y + M.save.y + M.save.h) / 2 } },
    { at: sec(4.8), dur: sec(0.7), to: { s: 4.4, x: save.x, y: save.y }, ease: IN },
  ]);
  const enter = prog(f, 0, sec(0.65), OUT);
  const sym = center(M.symbolBtn), es = center(M.esOpt);
  const cur = cursorAt(f, [
    { at: 0, x: 650, y: 600 },
    { at: sec(0.4), x: sym.x + 40, y: sym.y + 4, dur: sec(0.55), click: true },
    { at: sec(1.05), x: es.x - 120, y: es.y + 2, dur: sec(0.4), click: true },
    { at: sec(1.6), x: 760, y: 380, dur: sec(0.7) },
    { at: sec(3.9), x: save.x + 6, y: save.y + 4, dur: sec(0.6), click: true },
  ]);
  const curOpacity = prog(f, sec(0.2), sec(0.2)) * (1 - prog(f, sec(1.7), sec(0.3))) + prog(f, sec(3.85), sec(0.2)) * (t >= 3.8 ? 1 : 0);
  const cs = toScreen(cam, cur.x, cur.y);
  const st = stateAt(t);
  const press = t >= T.click && t < T.click + 0.16;
  const sweep = prog(f, sec(3.95), sec(0.75));
  return (
    <AbsoluteFill>
      <Bg f={f} kind="mint" />
      <AbsoluteFill style={{ opacity: enter, filter: enter < 1 ? `blur(${lerp(14, 0, enter).toFixed(2)}px)` : undefined, transform: `perspective(2200px) rotateX(${lerp(14, 0, enter)}deg) translateY(${lerp(70, 0, enter)}px)` }}>
        <div style={{ ...camStyle(cam), width: CW, height: CH }}>
          <div style={{ position: 'absolute', left: box.x, top: box.y, width: box.w, height: box.h, borderRadius: 16, boxShadow: '0 60px 110px -30px rgba(6,40,20,0.55), 0 20px 40px -20px rgba(6,40,20,0.4)' }} />
          {STATES.map((s) => <Img key={s} src={img(`${s}.png`)} style={{ position: 'absolute', left: 0, top: 0, width: CW, height: CH, opacity: s === st ? 1 : 0 }} />)}
          <Typing f={f} field={M.entry} start={T.entry} next="m3" caretFrom={T.pick} caretTo={T.entryDone} />
          <Typing f={f} field={M.exit} start={T.exit} next="m5" caretFrom={T.exitFocus} caretTo={T.exitDone} />
          {t >= T.qty && t < T.blur ? <Typing f={f} field={M.qty} start={T.qty} next="m7" caretFrom={T.qty} caretTo={T.blur} /> : null}
          {/* Lichtkante wandert über die Vorschau „Net P&L … · Discipline 100“ */}
          {sweep > 0 && sweep < 1 ? (
            <div style={{ position: 'absolute', left: prev.x - 6, top: prev.y - 4, width: prev.w + 12, height: prev.h + 8, overflow: 'hidden', borderRadius: 6, mixBlendMode: 'screen' }}>
              <div style={{ position: 'absolute', top: -20, bottom: -20, width: 46, left: lerp(-70, prev.w + 30, sweep), background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.32), transparent)', transform: 'skewX(-20deg)' }} />
            </div>
          ) : null}
          {press ? <div style={{ position: 'absolute', left: M.save.x, top: M.save.y, width: M.save.w, height: M.save.h, borderRadius: 10, background: 'rgba(0,0,0,0.22)' }} /> : null}
        </div>
      </AbsoluteFill>
      <CursorView x={cs.x} y={cs.y} clickAge={cur.clickAge} opacity={clamp01(curOpacity) * enter} />
    </AbsoluteFill>
  );
};
