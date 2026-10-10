/* Bildformat der aktuellen Komposition: quer (1920 × 1080) oder hochkant fürs Handy (1080 × 1920) */
import { useVideoConfig } from 'remotion';

export const useFormat = () => {
  const { width: W, height: H } = useVideoConfig();
  return { W, H, V: H > W, cx: W / 2, cy: H / 2 };
};
