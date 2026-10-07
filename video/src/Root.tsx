import React from 'react';
import { Composition } from 'remotion';
import { DURATION, Main } from './Main';
import type { Lang } from './shots';

/* Englisch ist Standard (internationale Website); Deutsch: --props='{"lang":"de"}' */
export const Root: React.FC = () => (
  <Composition id="Journalyst" component={Main} durationInFrames={DURATION} fps={60} width={1920} height={1080} defaultProps={{ lang: 'en' as Lang }} />
);
