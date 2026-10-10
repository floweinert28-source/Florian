/* Vorlage Outbidd, 27,6–40,6 s: Dialog „Build your trading plan“ (im Vorbild „Send out to bid“).
   Schritt 2 Regeln: „Never move the stop“ wird getippt und als vierte Regel angelegt. 3D-Wechsel zu Schritt 3 Setups:
   links „Add the setups / you trade“, im Suchfeld „Open“, Vorschlag „Opening Range Breakout“, Klick, er landet in der Liste.
   Schritt 4 Review: die Linie füllt sich, alle Regeln werden abgehakt, „Save plan“. */
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { clamp01, FPS, IN, lerp, OUT, pop, prog, sec, SIG, SOFT } from '../anim';
import { rules } from '../app';
import { useFormat } from '../format';
import { big, DISPLAY, GREEN, LIGHT, NUM } from '../theme';
import { Bg } from '../ui/Bg';
import { Hand } from '../ui/Hand';
import { A, Btn, Icon, mixA, Pill, Switch } from '../ui/Kit';
import { Rings, Stepper } from './Parts';

const CW = 820, CH = 560, IW = CW - 48;
const NEW_RULE = { name: 'Never move the stop', hint: 'Stop set before entry', value: '', unit: '' };
const SETUPS = ['Pullback', 'Breakout', 'Range-Fade'];
const NEW_SETUP = 'Opening Range Breakout';

const Frame: React.FC<{ step: number; label: string; fill?: number; children: React.ReactNode }> = ({ step, label, fill = 0, children }) => (
  <div style={{ position: 'relative', width: CW, height: CH, borderRadius: 22, background: A.surface, border: `1px solid ${A.border2}`, fontFamily: DISPLAY, color: A.text, overflow: 'hidden',
    boxShadow: '0 70px 140px -40px rgba(0,0,0,0.85), 0 0 100px -30px rgba(52,245,138,0.28)' }}>
    <div style={{ position: 'absolute', left: 24, top: 22, fontSize: 21, fontWeight: 700 }}>Build your trading plan</div>
    <div style={{ position: 'absolute', left: 24, top: 52, fontSize: 13.5, color: A.muted }}>{label}</div>
    <Icon name="close" size={18} color={A.muted} style={{ position: 'absolute', right: 24, top: 26 }} />
    <div style={{ position: 'absolute', left: 24, top: 90 }}><Stepper step={step} fill={fill} w={IW} /></div>
    <div style={{ position: 'absolute', left: 24, right: 24, top: 160, height: 1, background: A.border }} />
    {children}
  </div>
);
const Label: React.FC<{ y: number; children: React.ReactNode }> = ({ y, children }) => <div style={{ position: 'absolute', left: 24, top: y, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', color: A.muted }}>{children}</div>;
const RuleRow: React.FC<{ y: number; r: { name: string; hint: string; value: string; unit: string }; style?: React.CSSProperties }> = ({ y, r, style }) => (
  <div style={{ position: 'absolute', left: 24, top: y, width: IW, height: 60, boxSizing: 'border-box', padding: '0 16px', borderRadius: 14, background: A.surface2, border: `1px solid ${A.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', ...style }}>
    <div><div style={{ fontSize: 15, fontWeight: 700 }}>{r.name}</div><div style={{ fontSize: 12.5, color: A.muted, marginTop: 3 }}>{r.hint}</div></div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      {r.value ? <div style={{ height: 32, padding: '0 12px', borderRadius: 9, background: A.field, border: `1px solid ${A.border2}`, display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ fontFamily: NUM, fontSize: 14, fontWeight: 600 }}>{r.value}</span><span style={{ fontSize: 12, color: A.muted }}>{r.unit}</span></div> : null}
      <Switch on />
    </div>
  </div>
);
const Field: React.FC<{ y: number; icon?: string; placeholder: string; text: string; caret: boolean; focus: number; hint?: string }> = ({ y, icon, placeholder, text, caret, focus, hint }) => (
  <div style={{ position: 'absolute', left: 24, top: y, width: IW, height: 50, boxSizing: 'border-box', padding: '0 16px', borderRadius: 13, background: A.field, display: 'flex', alignItems: 'center', gap: 10,
    border: `1px solid ${focus > 0 ? mixA(A.accent, 0.3 + 0.5 * focus) : A.border2}`, boxShadow: focus > 0 ? `0 0 0 ${(3 * focus).toFixed(1)}px ${A.accentSoft}` : undefined }}>
    {icon ? <Icon name={icon} size={17} color={A.muted} /> : <Icon name="plus" size={17} color={A.muted} />}
    <span style={{ fontSize: 15, color: text ? A.text : A.muted, whiteSpace: 'pre' }}>{text || placeholder}</span>
    {caret ? <span style={{ width: 1.6, height: 19, background: A.accent, marginLeft: -8 }} /> : null}
    {hint ? <span style={{ marginLeft: 'auto', fontSize: 12, color: A.muted, padding: '3px 8px', borderRadius: 6, border: `1px solid ${A.border2}` }}>{hint}</span> : null}
  </div>
);
const SetupRow: React.FC<{ y: number; name: string; style?: React.CSSProperties }> = ({ y, name, style }) => (
  <div style={{ position: 'absolute', left: 24, top: y, width: IW, height: 54, boxSizing: 'border-box', padding: '0 16px', borderRadius: 14, background: A.surface2, border: `1px solid ${A.border}`, display: 'flex', alignItems: 'center', gap: 12, ...style }}>
    <div style={{ width: 30, height: 30, borderRadius: 8, background: A.accentSoft, display: 'grid', placeItems: 'center' }}><Icon name="journal" size={16} color={A.accent} /></div>
    <div style={{ fontSize: 15, fontWeight: 700 }}>{name}</div><div style={{ fontSize: 12.5, color: A.muted }}>Playbook</div>
    <div style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 600, color: A.muted }}>Remove</div>
  </div>
);

const typedN = (t: number, start: number, len: number, per: number) => (t < start ? 0 : Math.min(len, Math.floor((t - start) / per) + 1));
export const PLAN_DURATION = 13.0;
export const Plan: React.FC = () => {
  const f = useCurrentFrame(); const t = f / FPS;
  const { W, H, V, cx, cy } = useFormat();
  const base = V ? 1.26 : 1.5;
  /* Lage der Karte: Mitte → (Schritt 3) zur Seite für den Text → zurück zur Mitte */
  const side = prog(f, sec(5.0), sec(0.45), SIG) * (1 - prog(f, sec(9.3), sec(0.5), SIG));
  const zoomL = prog(f, sec(8.5), sec(0.8), SIG) * (1 - prog(f, sec(9.3), sec(0.5), SIG));
  const ccx = V ? cx : cx + 400 * side, ccy = V ? cy + 210 * side : cy;
  const sc = base * lerp(1, V ? 0.92 : 0.8, side) * (1 + 0.1 * zoomL);
  const enter = prog(f, 0, sec(0.45), SOFT);
  const tiltOut = prog(f, sec(12.4), sec(0.6), SIG);
  const sw = prog(f, sec(3.5), sec(0.5), SIG);
  /* Schritt 2 */
  const ruleN = typedN(t, 2.15, NEW_RULE.name.length, 0.04);
  const added = pop(f, sec(3.05), { damping: 12, stiffness: 190 });
  /* Schritt 3 */
  const qN = typedN(t, 6.3, 4, 0.09); const drop = prog(f, sec(6.9), sec(0.25), OUT) * (1 - prog(f, sec(7.85), sec(0.3), SIG));
  const setupAdded = prog(f, sec(7.9), sec(0.4), SOFT);
  const hk = prog(f, sec(7.0), sec(0.6), SIG); const CLICK = 7.8;
  /* Schritt 4 */
  const s4 = prog(f, sec(9.4), sec(0.3)); const fill = prog(f, sec(10.0), sec(0.9), SIG);
  const sideText1 = prog(f, sec(5.4), sec(0.5), SOFT), sideText2 = prog(f, sec(6.8), sec(0.5), SOFT), sideOut = prog(f, sec(9.2), sec(0.25), IN);
  /* Hand auf den Vorschlag im Dropdown */
  const item = { x: 24 + 330, y: 196 + 50 + 6 + 30 };
  const toScreen = (x: number, y: number) => ({ x: ccx + (x - CW / 2) * sc, y: ccy + (y - CH / 2) * sc });
  const it = toScreen(item.x, item.y); const from = V ? { x: W * 0.85, y: H * 1.04 } : { x: W * 0.9, y: H * 1.08 };
  const hand = { x: lerp(from.x, it.x, hk), y: lerp(from.y, it.y, hk) };
  const handA = prog(f, sec(7.0), sec(0.15)) * (1 - prog(f, sec(8.3), sec(0.2)));
  const frameStyle: React.CSSProperties = { position: 'absolute', left: ccx - CW / 2, top: ccy - CH / 2, width: CW, height: CH, transformOrigin: '50% 50%' };
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Bg f={f} kind="night" />
      <Rings f={f} x={V ? cx : W * 0.82} y={V ? cy - 500 : cy} max={V ? 700 : 900} opacity={0.18} />
      <AbsoluteFill style={{ perspective: 2200 }}>
        {sw < 1 ? (
          <div style={{ ...frameStyle, transform: `scale(${sc * lerp(0.9, 1, enter) * lerp(1, 0.8, sw)}) translateX(${lerp(0, -280, sw)}px) rotateY(${lerp(0, 28, sw)}deg)`, opacity: clamp01(enter * 2) * (1 - sw) }}>
            <Frame step={2} label="Step 2 of 4: Rules">
              <Label y={176}>YOUR RULES</Label>
              {rules.map((r, i) => <RuleRow key={r.name} y={200 + i * 70} r={r} />)}
              {added > 0.001 ? <RuleRow y={200 + 3 * 70} r={NEW_RULE} style={{ transform: `scale(${lerp(0.9, 1, added)})`, opacity: clamp01(added * 2), border: `1px solid ${mixA(A.accent, 0.45)}` }} /> : null}
              <Field y={added > 0.001 ? 200 + 4 * 70 + 6 : 200 + 3 * 70 + 6} placeholder="Add a rule" text={t >= 3.05 ? '' : NEW_RULE.name.slice(0, ruleN)} caret={t >= 2.0 && t < 3.05} focus={prog(f, sec(1.9), sec(0.2)) * (1 - prog(f, sec(3.05), sec(0.2)))} hint="↵ Enter" />
            </Frame>
          </div>
        ) : null}
        {sw > 0 ? (
          <div style={{ ...frameStyle, transform: `scale(${sc * lerp(1.35, 1, sw)} ) rotateX(${(5 * tiltOut).toFixed(2)}deg) scale(${lerp(1, 0.94, tiltOut)})`, opacity: clamp01(sw * 1.5) }}>
            {s4 < 1 ? (
              <div style={{ position: 'absolute', inset: 0, opacity: 1 - s4 }}>
                <Frame step={3} label="Step 3 of 4: Setups">
                  <Label y={176}>YOUR SETUPS</Label>
                  <Field y={200} icon="search" placeholder="Search playbooks" text={'Open'.slice(0, qN)} caret={t >= 6.1 && t < 7.85} focus={prog(f, sec(6.1), sec(0.2)) * (1 - prog(f, sec(7.85), sec(0.2)))} />
                  {SETUPS.map((s, i) => <SetupRow key={s} y={266 + i * 64} name={s} />)}
                  {setupAdded > 0 ? <SetupRow y={266 + 3 * 64} name={NEW_SETUP} style={{ opacity: clamp01(setupAdded * 1.5), transform: `translateY(${lerp(-60, 0, setupAdded)}px)`, border: `1px solid ${mixA(A.accent, 0.45)}` }} /> : null}
                  {drop > 0 ? (
                    <div style={{ position: 'absolute', left: 24, top: 256, width: IW, height: 60, boxSizing: 'border-box', padding: '0 16px', borderRadius: 14, background: A.surface3, border: `1px solid ${mixA(A.accent, 0.5)}`,
                      display: 'flex', alignItems: 'center', gap: 12, opacity: drop, transform: `translateY(${lerp(-8, 0, drop)}px) scaleY(${lerp(0.6, 1, drop)})`, transformOrigin: '50% 0%', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.7)' }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: A.accentSoft, display: 'grid', placeItems: 'center' }}><Icon name="journal" size={16} color={A.accent} /></div>
                      <div style={{ fontSize: 15, fontWeight: 700 }}><span style={{ color: A.accent }}>Open</span>ing Range Breakout</div><div style={{ fontSize: 12.5, color: A.muted }}>Playbook</div>
                      <div style={{ marginLeft: 'auto', width: 30, height: 30, borderRadius: 15, background: t >= CLICK ? A.accent : A.surface2, display: 'grid', placeItems: 'center' }}><Icon name="plus" size={16} color={t >= CLICK ? A.ink : A.text} /></div>
                    </div>
                  ) : null}
                </Frame>
              </div>
            ) : null}
            {s4 > 0 ? (
              <div style={{ position: 'absolute', inset: 0, opacity: s4 }}>
                <Frame step={3} fill={fill} label="Step 4 of 4: Review">
                  <div style={{ position: 'absolute', left: 24, top: 178, fontSize: 18, fontWeight: 700 }}>Review your plan before the session</div>
                  <Label y={222}>RULES</Label>
                  {[...rules.map((r) => r.name), NEW_RULE.name].map((r, i) => {
                    const c = pop(f, sec(11.15 + i * 0.18), { damping: 11, stiffness: 200 }); const a = prog(f, sec(10.9 + i * 0.1), sec(0.35), SOFT);
                    return (
                      <div key={r} style={{ position: 'absolute', left: 24 + (i % 2) * (IW / 2), top: 248 + Math.floor(i / 2) * 46, display: 'flex', alignItems: 'center', gap: 12, fontSize: 15, fontWeight: 600, opacity: clamp01(a * 1.5), transform: `translateY(${lerp(-10, 0, a)}px)` }}>
                        <div style={{ width: 26, height: 26, borderRadius: 13, display: 'grid', placeItems: 'center', background: c > 0.01 ? A.accent : A.surface3, transform: `scale(${c > 0.01 ? c : 1})`, boxShadow: c > 0.01 ? `0 0 12px ${A.accentGlow}` : undefined }}>{c > 0.01 ? <Icon name="check" size={14} color={A.ink} sw={3} /> : null}</div>{r}
                      </div>
                    );
                  })}
                  <Label y={358}>SETUPS</Label>
                  <div style={{ position: 'absolute', left: 24, top: 384, display: 'flex', gap: 8, flexWrap: 'wrap', width: IW }}>{[...SETUPS, NEW_SETUP].map((s, i) => <span key={s} style={{ opacity: prog(f, sec(11.6 + i * 0.08), sec(0.3)) }}><Pill tone="win" size={13}>{s}</Pill></span>)}</div>
                  <div style={{ position: 'absolute', left: 24, right: 24, bottom: 84, height: 1, background: A.border }} />
                  <Btn style={{ position: 'absolute', right: 160, bottom: 24, height: 42 }}>Back</Btn>
                  <Btn kind="primary" style={{ position: 'absolute', right: 24, bottom: 24, height: 42, width: 124, boxShadow: `0 10px 24px -10px ${A.accentGlow}`, transform: `scale(${1 + 0.06 * Math.sin(Math.PI * prog(f, sec(12.0), sec(0.35)))})` }}>Save plan</Btn>
                </Frame>
              </div>
            ) : null}
          </div>
        ) : null}
      </AbsoluteFill>
      {/* Text links (hochkant oben) */}
      {sideText1 > 0 && sideOut < 1 ? (
        <div style={{ position: 'absolute', ...(V ? { left: 0, right: 0, top: 230, textAlign: 'center' as const } : { left: 120, top: cy - 120 }), ...big(V ? 92 : 96, LIGHT), opacity: 1 - sideOut, filter: sideOut > 0 ? `blur(${(sideOut * 16).toFixed(1)}px)` : undefined }}>
          <div style={{ opacity: clamp01(sideText1 * 1.5), transform: `translateY(${lerp(30, 0, sideText1)}px)` }}>Add the setups</div>
          <div style={{ color: GREEN, opacity: clamp01(sideText2 * 1.5), transform: `translateY(${lerp(30, 0, sideText2)}px)` }}>you trade.</div>
        </div>
      ) : null}
      {handA > 0 ? <Hand x={hand.x} y={hand.y} clickAge={f - sec(CLICK)} size={V ? 100 : 88} opacity={handA} /> : null}
    </AbsoluteFill>
  );
};
