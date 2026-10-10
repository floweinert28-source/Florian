import React from 'react';
import { Composition } from 'remotion';
import { DURATION, Launch } from './Launch';

/* Englisch, 60 Bilder pro Sekunde: quer für Website und YouTube, hochkant für Reels, TikTok und Shorts */
export const Root: React.FC = () => (
  <>
    <Composition id="Journalyst" component={Launch} durationInFrames={DURATION} fps={60} width={1920} height={1080} />
    <Composition id="JournalystVertical" component={Launch} durationInFrames={DURATION} fps={60} width={1080} height={1920} />
  </>
);
