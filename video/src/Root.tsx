import React from 'react';
import { Composition } from 'remotion';
import { DURATION, Launch } from './Launch';
import { DURATION2, Launch2 } from './v2/Launch2';
import { DURATION3, Launch3 } from './v3/Launch3';

/* Englisch, 60 Bilder pro Sekunde: quer für Website und YouTube, hochkant für Reels, TikTok und Shorts */
export const Root: React.FC = () => (
  <>
    <Composition id="Journalyst" component={Launch} durationInFrames={DURATION} fps={60} width={1920} height={1080} />
    <Composition id="JournalystVertical" component={Launch} durationInFrames={DURATION} fps={60} width={1080} height={1920} />
    {/* zweites Video nach der Vorlage LangEase */}
    <Composition id="Journalyst2" component={Launch2} durationInFrames={DURATION2} fps={60} width={1920} height={1080} />
    <Composition id="Journalyst2Vertical" component={Launch2} durationInFrames={DURATION2} fps={60} width={1080} height={1920} />
    {/* drittes Video nach der Vorlage Outbidd */}
    <Composition id="Journalyst3" component={Launch3} durationInFrames={DURATION3} fps={60} width={1920} height={1080} />
    <Composition id="Journalyst3Vertical" component={Launch3} durationInFrames={DURATION3} fps={60} width={1080} height={1920} />
  </>
);
