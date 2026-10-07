import React from 'react';
import { Composition } from 'remotion';
import { L, Main } from './Main';

export const Root: React.FC = () => (
  <Composition id="Journalyst" component={Main} durationInFrames={L.end} fps={30} width={1920} height={1080} />
);
