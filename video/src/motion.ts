import type {CSSProperties} from 'react';
import {Easing, interpolate, spring} from 'remotion';

export const FPS = 60;

// The one easing curve of the film: fast start, long calm settle, no overshoot.
export const EASE = Easing.bezier(0.16, 1, 0.3, 1);

export const STAGGER = 4;

/** 0→1 over `duration` frames starting at `delay`, eased with EASE, clamped. */
export const ease = (frame: number, delay = 0, duration = 40) =>
  interpolate(frame, [delay, delay + duration], [0, 1], {
    easing: EASE,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

/**
 * Spring with damping 200: no bounce, no overshoot.
 * Remotion's stretched spring stops at ~0.995 and snaps to 1 one frame later, which shows as a
 * hitch on large camera moves – normalising by the end value makes it land exactly on 1.
 */
export const settle = (frame: number, delay = 0, durationInFrames = 50) => {
  const cfg = {fps: FPS, config: {damping: 200}, durationInFrames};
  const end = spring({...cfg, frame: durationInFrames});
  return Math.min(1, spring({...cfg, frame: frame - delay}) / end);
};

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Opacity + small rise. `p` is a 0→1 progress value. */
export const rise = (p: number, distance = 16, scaleFrom = 1): CSSProperties => ({
  opacity: p,
  transform: `translateY(${(1 - p) * distance}px)${scaleFrom !== 1 ? ` scale(${mix(scaleFrom, 1, p)})` : ''}`,
});

/** Fully settled frame value used for elements that already finished animating. */
export const DONE = 100000;
/** Frame value for elements that have not started yet. */
export const IDLE = -100000;
