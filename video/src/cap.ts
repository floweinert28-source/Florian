/* Aufnahmen aus der echten Web-App (scripts/capture.cjs): Bilder unter public/cap, Positionen in CSS-Pixeln der App */
import { staticFile } from 'remotion';
import data from './data/cap.json';

export const cap = data;
export const img = (name: string) => staticFile(`cap/${name}`);
export type Rect = { x: number; y: number; w: number; h: number };
