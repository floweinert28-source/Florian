import React from 'react';
import { Composition } from 'remotion';
import { DURATION, Launch } from './Launch';

/* Englisch, 1920 × 1080, 60 Bilder pro Sekunde */
export const Root: React.FC = () => (
  <Composition id="Journalyst" component={Launch} durationInFrames={DURATION} fps={60} width={1920} height={1080} />
);
