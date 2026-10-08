import {Composition, Series} from 'remotion';
import {SCENES} from './scenes/Scenes';
import {FPS} from './motion';

const TOTAL = SCENES.reduce((s, sc) => s + sc.duration, 0);

const Full = () => (
  <Series>
    {SCENES.map((sc) => (
      <Series.Sequence key={sc.id} durationInFrames={sc.duration}>
        <sc.component />
      </Series.Sequence>
    ))}
  </Series>
);

export const RemotionRoot = () => (
  <>
    <Composition id="Journalyst" component={Full} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />
    {SCENES.map((sc) => (
      <Composition
        key={sc.id}
        id={sc.id}
        component={sc.component}
        durationInFrames={sc.duration}
        fps={FPS}
        width={1920}
        height={1080}
      />
    ))}
  </>
);
