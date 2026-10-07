import React from 'react';
import { useCurrentFrame } from 'remotion';
import { D, ENTER, lerp, ms, prog } from '../motion';
import { DefaultHead, HeadChip, Shell } from '../ui/Shell';
import { DashboardContent } from './DashboardContent';

/* Großer Auftritt der App (900 ms), dann baut sich das Dashboard gestaffelt auf. */
export const DashboardScene: React.FC<{ dur: number }> = () => {
  const f = useCurrentFrame();
  const p = prog(f, 0, D.big, ENTER);
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: p, scale: String(lerp(0.96, 1, p)), translate: `0px ${((1 - p) * 36).toFixed(1)}px`, transformOrigin: '50% 60%' }}>
      <Shell frame={f} appearAt={2} title="Dashboard" active="dashboard" head={<DefaultHead extra={<><HeadChip icon="filter" label="Filter" /><HeadChip icon="layout" label="Standard" caret /></>} />}>
        <DashboardContent frame={f} t0={24} />
      </Shell>
    </div>
  );
};
