"""Eigener Beat und Sound-Effekte für das Launch-Video, komplett synthetisch (keine fremden Samples, keine Lizenz nötig).

120 BPM in A-Moll, die Schnitte des Videos liegen auf dem Raster. Die Effekte sitzen auf den Zeitpunkten der Animationen
(siehe src/Launch.tsx und die Szenen). Aufruf:  python3 scripts/sound.py   (braucht numpy und scipy)
Schreibt public/audio/sound.wav (48 kHz, Stereo), das src/Launch.tsx unter das Video legt.
"""
import os
import wave

import numpy as np
from scipy import signal

SR = 48000
DUR = 47.5
N = int(SR * DUR)
BEAT = 0.5  # 120 BPM
rng = np.random.default_rng(7)
ROOT = os.path.join(os.path.dirname(__file__), '..')


def tt(d):
    return np.arange(int(SR * d)) / SR


def sos(kind, f, order=2):
    return signal.butter(order, f, btype=kind, fs=SR, output='sos')


def filt(x, kind, f, order=2):
    return signal.sosfilt(sos(kind, f, order), x)


def put(buf, x, at, gain=1.0, pan=0.0):
    """Mono-Klang x bei Sekunde at in den Stereo-Puffer legen (pan −1 links … 1 rechts)."""
    i = int(at * SR)
    if i >= N or i + len(x) <= 0:
        return
    j0 = max(0, -i)
    x = x[j0:]
    i = max(0, i)
    n = min(len(x), N - i)
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[0, i:i + n] += x[:n] * gain * l * np.sqrt(2)
    buf[1, i:i + n] += x[:n] * gain * r * np.sqrt(2)


def reverb(buf, length=2.2, wet=0.25, tone=5000):
    ir_t = tt(length)
    out = np.zeros_like(buf)
    for c in range(2):
        ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t / (length / 6.5))
        ir = filt(ir, 'lowpass', tone)
        ir[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))
        ir /= np.sqrt(np.sum(ir ** 2))
        out[c] = signal.fftconvolve(buf[c], ir)[: buf.shape[1]]
    return buf * (1 - wet) + out * wet


def note(name):
    names = {'C': -9, 'C#': -8, 'D': -7, 'D#': -6, 'E': -5, 'F': -4, 'F#': -3, 'G': -2, 'G#': -1, 'A': 0, 'A#': 1, 'B': 2}
    n, o = name[:-1], int(name[-1])
    return 440.0 * 2 ** ((names[n] + 12 * (o - 4)) / 12)


# ---------- Klangbausteine ----------
def kick():
    t = tt(0.45)
    f = 44 + 120 * np.exp(-t / 0.028)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t / 0.22)
    click = filt(rng.standard_normal(len(t)), 'highpass', 2500) * np.exp(-t / 0.004) * 0.25
    return np.tanh((body + click) * 1.6) * 0.9


def clap():
    t = tt(0.35)
    n = rng.standard_normal(len(t))
    env = np.zeros_like(t)
    for k, d in enumerate([0, 0.011, 0.022]):
        env += (t >= d) * np.exp(-np.clip(t - d, 0, None) / (0.008 if k < 2 else 0.11))
    return filt(n * env, 'bandpass', [900, 4200]) * 0.9


def hat(open_=False):
    t = tt(0.25 if open_ else 0.06)
    return filt(rng.standard_normal(len(t)), 'highpass', 7500) * np.exp(-t / (0.09 if open_ else 0.018)) * 0.5


def tick():
    t = tt(0.03)
    return np.sin(2 * np.pi * 2300 * t) * np.exp(-t / 0.004) * 0.6


def key():
    t = tt(0.05)
    n = filt(filt(rng.standard_normal(len(t)), 'bandpass', [1500, 4500]), 'lowpass', 5000) * np.exp(-t / 0.006) * np.minimum(1, t / 0.0008)
    thump = np.sin(2 * np.pi * rng.uniform(150, 210) * t) * np.exp(-t / 0.012) * 0.6
    return (n + thump) * rng.uniform(0.75, 1.0)


def click():
    t = tt(0.06)
    a = np.sin(2 * np.pi * 1500 * t) * np.exp(-t / 0.005) * np.minimum(1, t / 0.0015)
    b = np.sin(2 * np.pi * 140 * t) * np.exp(-t / 0.02) * 0.8
    return a * 0.4 + b


def pop(f0=900, f1=480, d=0.12):
    t = tt(d)
    f = f1 + (f0 - f1) * np.exp(-t / 0.02)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (d / 4)) * 0.8


def whoosh(d=0.7, up=True):
    """Rauschen mit wanderndem Filter: drei Bänder werden über die Zeit überblendet."""
    t = tt(d)
    n = rng.standard_normal(len(t))
    lo, mid, hi = filt(n, 'bandpass', [200, 900]), filt(n, 'bandpass', [900, 3000]), filt(n, 'bandpass', [3000, 9000])
    p = t / d if up else 1 - t / d
    mixd = lo * np.clip(1 - 2 * p, 0, 1) + mid * (1 - np.abs(2 * p - 1)) + hi * np.clip(2 * p - 1, 0, 1)
    env = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.6
    return mixd * env * 0.9


def riser(d):
    t = tt(d)
    p = t / d
    n = rng.standard_normal(len(t))
    sweep = filt(n, 'bandpass', [1500, 9000]) * p ** 2.2
    f = 180 + 900 * p ** 2
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * p ** 2 * 0.25
    return (sweep * 0.7 + tone) * 0.8


def impact():
    t = tt(1.8)
    f = 34 + 50 * np.exp(-t / 0.06)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.5)
    crack = filt(rng.standard_normal(len(t)), 'lowpass', 1400) * np.exp(-t / 0.18) * 0.6
    sub = np.sin(2 * np.pi * np.cumsum(30 + 18 * np.exp(-t / 0.15)) / SR) * np.exp(-t / 0.9) * 0.9
    return np.tanh((boom + crack + sub) * 1.5) * 0.9


def chime(freqs, d=0.9, spread=0.0, soft=False):
    t = tt(d)
    out = np.zeros_like(t)
    for k, f in enumerate(freqs):
        s = int(k * spread * SR)
        tk = t[: len(t) - s]
        h2, h3, att = (0.12, 0.0, 0.012) if soft else (0.35, 0.12, 0.004)  # weich: kaum Obertöne, sanfter Anschlag
        tone = (np.sin(2 * np.pi * f * tk) + h2 * np.sin(2 * np.pi * 2 * f * tk) + h3 * np.sin(2 * np.pi * 3 * f * tk)) * np.exp(-tk / (d / 4))
        out[s:] += tone * np.minimum(1, tk / att)
    return out / max(1, len(freqs)) * 0.8


def low_blip(freqs=(note('E4'), note('C4')), step=0.11):
    out = np.zeros(int(SR * 0.6))
    for k, f in enumerate(freqs):
        t = tt(0.4)
        s = signal.sawtooth(2 * np.pi * f * t, 0.5) * np.exp(-t / 0.09)
        i = int(k * step * SR)
        out[i:i + len(s)] += filt(s, 'lowpass', 1600)
    return out * 0.7


def shimmer(d=0.8):
    t = tt(d)
    fs = [note('E6'), note('A6'), note('B6'), note('E7')]
    s = sum(np.sin(2 * np.pi * f * t + k) for k, f in enumerate(fs)) / len(fs)
    return s * np.sin(np.pi * t / d) ** 2 * (0.75 + 0.25 * np.sin(2 * np.pi * 11 * t)) * 0.5


# ---------- Musik ----------
music = np.zeros((2, N))
drums = np.zeros((2, N))
CHORDS = {
    'Am': ['A3', 'C4', 'E4', 'G4'], 'F': ['F3', 'A3', 'C4', 'E4'], 'C': ['G3', 'C4', 'E4', 'B4'], 'G': ['G3', 'B3', 'D4', 'A4'],
    'Fend': ['F3', 'C4', 'E4', 'G4', 'A4'], 'Cend': ['C3', 'G3', 'C4', 'E4', 'G4', 'D5'],
}
BASS = {'Am': 'A1', 'F': 'F1', 'C': 'C2', 'G': 'G1'}
plan = [(0, 6.5, 'Am')]  # Spannung, gedämpft
plan += [(6.5, 8.5, 'Am')]
t0 = 8.5
order = ['F', 'C', 'G', 'Am']
k = 0
while t0 < 42.5:
    plan.append((t0, min(t0 + 2, 42.5), order[k % 4]))
    t0 += 2
    k += 1
plan += [(42.5, 44.5, 'Fend'), (44.5, DUR, 'Cend')]


def pad_segment(names, d, bright):
    t = tt(d + 0.6)
    out = np.zeros_like(t)
    for nm in names:
        f = note(nm)
        for det in (-0.08, 0, 0.08):
            out += signal.sawtooth(2 * np.pi * f * 2 ** (det / 12) * t + rng.uniform(0, 6.28))
    out /= len(names) * 3
    env = np.minimum(1, t / 0.25) * np.clip((d + 0.6 - t) / 0.6, 0, 1)
    return filt(out * env, 'lowpass', bright)


pad = np.zeros((2, N))
for a, b, ch in plan:
    bright = 650 if a < 6.5 else 2200 if a < 42.5 else 2600
    seg = pad_segment(CHORDS[ch], b - a, bright)
    put(pad, seg, a, gain=0.55 if a >= 6.5 else 0.38, pan=-0.15)
    put(pad, np.roll(seg, 240), a, gain=0.55 if a >= 6.5 else 0.38, pan=0.15)

# Schlagzeug nach Abschnitten
def active(t, ranges):
    return any(a <= t < b for a, b in ranges)


KICK = [(8.5, 29), (31.5, 42.5)]
CLAP = [(11.5, 29), (31.5, 35.5), (38.5, 42.5)]
HAT = [(8.5, 29), (31.5, 42.5)]
GHOST = [(14, 29), (38.5, 42.5)]
kick_times = []
b = 0.0
while b < DUR:
    if active(b, KICK):
        put(drums, kick(), b, 0.95)
        kick_times.append(b)
    rel = round((b - 8.5) / BEAT)
    if active(b, CLAP) and rel % 2 == 1:
        put(drums, clap(), b, 0.42, pan=0.05)
    if active(b + 0.25, HAT):
        put(drums, hat(open_=active(b, [(14, 29), (38.5, 42.5)]) and rel % 2 == 1), b + 0.25 + 0.008, 0.34 * rng.uniform(0.85, 1.0), pan=0.25)
    if active(b, GHOST):
        put(drums, hat(), b + 0.125 + 0.012, 0.1 * rng.uniform(0.7, 1.0), pan=-0.3)
        put(drums, hat(), b + 0.375 + 0.012, 0.08 * rng.uniform(0.7, 1.0), pan=0.35)
    if b < 5.0:
        put(drums, tick(), b, 0.05 + 0.12 * b / 5)
        put(drums, tick(), b + 0.25, 0.03 + 0.08 * b / 5)
    b += BEAT

# Bass auf den Nachschlägen
bass = np.zeros((2, N))
for a, bb, ch in plan:
    if ch not in BASS or a < 10.5:
        continue
    f = note(BASS[ch])
    s = a + 0.25
    while s < bb:
        if active(s, [(10.5, 29), (31.5, 42.5)]):
            t = tt(0.22)
            x = signal.sawtooth(2 * np.pi * f * t) * 0.6 + np.sin(2 * np.pi * f * t)
            x = filt(x, 'lowpass', 420) * np.exp(-t / 0.12) * np.minimum(1, t / 0.005)
            put(bass, x, s, 0.62)
        s += BEAT

# Pluck-Arpeggio im Produkt-Teil
arp = np.zeros((2, N))
for a, bb, ch in plan:
    if ch not in BASS or not active(a, [(14, 29), (38.5, 42.5)]):
        continue
    tones = [note(n) * 2 for n in CHORDS[ch]]
    s, k2 = a, 0
    while s < bb:
        if active(s, [(14, 29), (38.5, 42.5)]):
            f = tones[[0, 2, 1, 3, 2, 1, 3, 2][k2 % 8]]
            t = tt(0.3)
            x = filt(signal.sawtooth(2 * np.pi * f * t, 0.3), 'lowpass', 3200) * np.exp(-t / 0.07)
            put(arp, x, s, 0.16, pan=0.4 if k2 % 2 else -0.4)
        s += BEAT / 2
        k2 += 1

# Sidechain: Pad, Bass und Arpeggio ducken unter der Kick
duck = np.ones(N)
tN = np.arange(N) / SR
for kt in kick_times:
    i = int(kt * SR)
    j = min(N, i + int(0.35 * SR))
    duck[i:j] = np.minimum(duck[i:j], 1 - 0.55 * np.exp(-(tN[i:j] - kt) / 0.11))
pad_gain = np.where((tN >= 31.5) & (tN < 42.5), 1.26, 1.1)
music = (pad * pad_gain + bass + arp) * duck
music = reverb(music, 2.4, 0.22) + drums
music = reverb(music, 1.2, 0.08)


def compress(x, thresh_db=-18, ratio=2.0, attack=0.03, release=0.25):
    lvl = np.sqrt(np.mean(x ** 2, axis=0)) + 1e-9
    a_att, a_rel = np.exp(-1 / (attack * SR)), np.exp(-1 / (release * SR))
    env = signal.lfilter([1 - a_rel], [1, -a_rel], lvl)  # Hüllkurve (ruhig)
    env = np.maximum(env, signal.lfilter([1 - a_att], [1, -a_att], lvl))
    db = 20 * np.log10(env)
    gain_db = np.where(db > thresh_db, (thresh_db - db) * (1 - 1 / ratio), 0)
    return x * 10 ** (gain_db / 20)


music = compress(music)

# ---------- Effekte auf den Animationen ----------
sfx = np.zeros((2, N))
for i in range(13):
    put(sfx, key(), 0.15 + i / 18 + rng.uniform(-0.006, 0.006), 0.2, pan=rng.uniform(-0.2, 0.2))  # Same mistake,
for i in range(14):
    put(sfx, key(), 1.55 + i / 18 + rng.uniform(-0.006, 0.006), 0.2, pan=rng.uniform(-0.2, 0.2))  # Different day.
put(sfx, whoosh(0.35), 3.05, 0.22)                                            # markieren
put(sfx, key() * 1.3, 3.75, 0.45)                                             # löschen
for i in range(17):
    put(sfx, key(), 3.9 + i / 20 + rng.uniform(-0.006, 0.006), 0.2, pan=rng.uniform(-0.2, 0.2))   # Same loss… again?
for i, at in enumerate([1.65, 1.75, 1.85, 1.95, 3.95, 4.05, 4.15, 4.25]):
    put(sfx, pop(700 + 60 * i, 380), at, 0.16, pan=[-0.6, 0.6, -0.5, 0.5, 0.1, 0.0, -0.7, 0.7][i])  # Notizkarten
put(sfx, riser(1.45), 5.0, 0.5)
put(sfx, whoosh(0.75), 5.65, 0.5)                                             # Flug durch das „o“
put(sfx, impact(), 6.5, 0.75)                                                 # Stop
put(sfx, whoosh(0.5), 8.3, 0.25)
put(sfx, shimmer(0.9), 8.85, 0.18)                                            # Meet
put(sfx, shimmer(0.8), 10.1, 0.14)                                            # Journalyst
put(sfx, whoosh(0.5), 11.35, 0.22)
put(sfx, whoosh(0.6), 13.8, 0.35)                                             # Dashboard
for at in (14.9, 15.35, 15.8):
    put(sfx, pop(620, 360, 0.16), at, 0.28)                                   # Karten ragen heraus
put(sfx, whoosh(0.8, up=False), 17.0, 0.18)                                   # wird flach
put(sfx, click(), 17.95, 0.42)                                                # Klick „+ Log trade“
for i in range(2):
    put(sfx, key(), 18.8 + i * 0.08, 0.18)
for i in range(8):
    put(sfx, key(), 19.15 + i * 0.05, 0.18)
for i in range(8):
    put(sfx, key(), 19.65 + i * 0.05, 0.18)
put(sfx, key(), 20.15, 0.18)
put(sfx, pop(1300, 900, 0.1), 20.3, 0.18)                                     # Ergebnis
put(sfx, click(), 21.27, 0.42)                                                # Klick „Save trade“
put(sfx, chime([note('G4'), note('C5')], 0.7, 0.07, soft=True), 21.4, 0.4)     # Saved
put(sfx, pop(300, 160, 0.14), 22.5, 0.4)                                      # Zeile landet
put(sfx, whoosh(0.8), 24.8, 0.32)                                             # wird zur Karte
for at, nm in zip((26.35, 26.75, 27.15), ('C5', 'E5', 'G5')):
    put(sfx, chime([note(nm)], 0.8, soft=True), at, 0.32)                                # Regeln abgehakt
put(sfx, chime([note('C5'), note('E5'), note('G5'), note('C6')], 1.4, 0.05, soft=True), 27.6, 0.36)  # Followed your plan
put(sfx, pop(900, 500), 27.9, 0.25)
put(sfx, whoosh(0.5), 28.8, 0.2)
put(sfx, low_blip(), 29.75, 0.4)                                              # price
put(sfx, riser(0.8), 30.7, 0.3)                                               # Anlauf, bevor der Beat zurückkommt
put(sfx, whoosh(0.5), 31.3, 0.22)
for k in range(1, 21):                                                        # Zähler Disziplin-Kosten (läuft aus)
    put(sfx, tick(), 31.9 + 1.6 * (1 - (1 - k / 20) ** 0.5), 0.18)
put(sfx, low_blip((note('D4'), note('A3'))), 33.85, 0.35)                     # Abstand als Preis
put(sfx, whoosh(0.5), 35.3, 0.22)
put(sfx, shimmer(0.9), 37.25, 0.22)                                           # discipline
put(sfx, impact() * 0.6, 38.5, 0.45)                                          # Others count trades.
put(sfx, impact() * 0.6, 40.5, 0.45)                                          # We build traders.
put(sfx, riser(1.0), 41.5, 0.45)
put(sfx, impact(), 42.5, 0.7)                                                 # Endkarte
put(sfx, shimmer(1.0), 43.0, 0.16)
put(sfx, pop(800, 420, 0.16), 44.15, 0.4)                                     # Start your journal
sfx = reverb(sfx, 1.4, 0.15, 7000)

# ---------- Mischen ----------
mix = music * 0.62 + sfx * 0.6
fade = np.clip((DUR - tN) / 1.2, 0, 1) ** 1.5
mix *= fade
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
mix /= np.max(np.abs(mix)) / 0.89
os.makedirs(os.path.join(ROOT, 'public', 'audio'), exist_ok=True)
out = os.path.join(ROOT, 'public', 'audio', 'sound.wav')
with wave.open(out, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix.T * 32767).astype('<i2').tobytes())
print('ok', out, f'{DUR} s')
