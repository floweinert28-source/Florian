import React from 'react';
import { Composition } from 'remotion';
import { Main } from './Main';
import { TOTAL } from './footage';

export const Root: React.FC = () => (
  <Composition id="Journalyst" component={Main} durationInFrames={TOTAL} fps={30} width={1920} height={1080} />
);
