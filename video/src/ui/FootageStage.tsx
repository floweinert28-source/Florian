import React from 'react';
import { OffthreadVideo, Sequence, staticFile, useVideoConfig } from 'remotion';
import { FPS, LANG, SEGMENTS, INTRO } from '../footage';

/* Das echte App-Material, abschnittsweise mit eigener Geschwindigkeit */
export const FootageStage: React.FC = () => {
  const { fps } = useVideoConfig();
  let cursor = INTRO;
  return (
    <>
      {SEGMENTS.map((s, i) => {
        const dur = Math.round(((s.to - s.from) / s.rate) * FPS); const from = cursor; cursor += dur;
        return (
          <Sequence key={i} from={from} durationInFrames={dur} premountFor={fps}>
            <OffthreadVideo src={staticFile(`footage-${LANG}.mp4`)} startFrom={Math.round(s.from * FPS)} playbackRate={s.rate} muted style={{ position: 'absolute', left: 0, top: 0, width: 1920, height: 1080 }} />
          </Sequence>
        );
      })}
    </>
  );
};
