#!/usr/bin/env python3
"""Baut aus den Screencast-Frames (nur bei Neuzeichnung) ein 30-fps-Video mit exakter Zeit: jeder Ausgabeframe zeigt den letzten gemalten Frame.
Aufruf: python3 scripts/assemble.py out/footage public/footage.mp4"""
import json, os, subprocess, sys
src, dst = sys.argv[1], sys.argv[2]; fps = 30
stamps = json.load(open(os.path.join(src, 'stamps.json'))); ev = json.load(open(os.path.join(src, 'events.json')))
t0 = stamps[0][1]; last_t = max(stamps[-1][1], t0 + max(e['t'] for e in ev['events']) + 1.0)
total = int((last_t - t0) * fps) + 1
lst = os.path.join(src, 'list.txt'); j = 0
with open(lst, 'w') as f:
    prev = None; run = 0
    for k in range(total):
        t = t0 + k / fps
        while j + 1 < len(stamps) and stamps[j + 1][1] <= t: j += 1
        name = f"f{stamps[j][0]:05d}.png"
        if name == prev: run += 1
        else:
            if prev: f.write(f"file '{os.path.abspath(os.path.join(src, 'frames', prev))}'\nduration {run / fps:.6f}\n")
            prev, run = name, 1
    f.write(f"file '{os.path.abspath(os.path.join(src, 'frames', prev))}'\nduration {run / fps:.6f}\n")
    f.write(f"file '{os.path.abspath(os.path.join(src, 'frames', prev))}'\n")
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-vf', f'fps={fps},format=yuv420p', '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-movflags', '+faststart', dst], check=True)
print('geschrieben', dst, 'Frames', total, 'Sekunden', round(total / fps, 2))
