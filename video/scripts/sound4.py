"""Sound-Effekte für das vierte Launch-Video (Vorlage iBanPay), komplett synthetisch, ohne fremde Samples, ohne Musik.
Zeitpunkte passend zu src/v4 (Part1 0 s, Part2 8 s, Part3 19,8 s, Part4 26,9 s, Part5 35 s).
Aufruf:  python3 scripts/sound4.py   (braucht numpy und scipy)  →  public/audio/sound4.wav (48 kHz, Stereo)
Wünsche aus den Rückmeldungen: kein Whoosh direkt nach einem Klick, Häkchen-Töne tief und weich, leises Antippen statt dumpfer Pops.
"""
import os
import wave

import numpy as np
from scipy import signal

SR = 48000
DUR = 47.5
N = int(SR * DUR)
rng = np.random.default_rng(17)
ROOT = os.path.join(os.path.dirname(__file__), '..')


def tt(d):
    return np.arange(int(SR * d)) / SR


def filt(x, kind, f, order=2):
    return signal.sosfilt(signal.butter(order, f, btype=kind, fs=SR, output='sos'), x)


def put(buf, x, at, gain=1.0, pan=0.0):
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


def reverb(buf, length=1.4, wet=0.15, tone=7000):
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
def tap(f=560):
    """Leises, weiches Antippen für Wörter, die erscheinen (kein Klick, kein Pop)."""
    t = tt(0.22)
    tone = (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)) * np.exp(-t / 0.045) * np.minimum(1, t / 0.004)
    air = filt(rng.standard_normal(len(t)), 'bandpass', [1800, 5000]) * np.exp(-t / 0.008) * 0.12
    return (tone + air) * 0.6


def click():
    t = tt(0.06)
    a = np.sin(2 * np.pi * 1500 * t) * np.exp(-t / 0.005) * np.minimum(1, t / 0.0015)
    b = np.sin(2 * np.pi * 140 * t) * np.exp(-t / 0.02) * 0.8
    return a * 0.4 + b


def key():
    t = tt(0.05)
    n = filt(filt(rng.standard_normal(len(t)), 'bandpass', [1500, 4500]), 'lowpass', 5000) * np.exp(-t / 0.006) * np.minimum(1, t / 0.0008)
    thump = np.sin(2 * np.pi * rng.uniform(150, 210) * t) * np.exp(-t / 0.012) * 0.6
    return (n + thump) * rng.uniform(0.75, 1.0)


def soft_pop(f0=640, f1=420, d=0.16):
    """Federnder Ton für Ordner und Abzeichen: hell genug, nicht dumpf."""
    t = tt(d)
    f = f1 + (f0 - f1) * np.exp(-t / 0.025)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (d / 4)) * np.minimum(1, t / 0.003) * 0.8


def swish(d=0.35, lo=500, hi=4000):
    """Kurzer, leiser Luftzug (Handys, Kacheln, Abzeichen), mit wanderndem Band."""
    t = tt(d)
    n = rng.standard_normal(len(t))
    p = t / d
    a, b = filt(n, 'bandpass', [lo, lo * 3]), filt(n, 'bandpass', [hi / 3, hi])
    env = np.sin(np.pi * p) ** 2
    return (a * (1 - p) + b * p) * env * 0.7


def swell(d=0.8):
    """Weiches Anschwellen beim Hineinfahren der Kamera (tief gefiltert)."""
    t = tt(d)
    p = t / d
    raw = rng.standard_normal(len(t))
    lo, hi = filt(raw, 'lowpass', 900), filt(raw, 'bandpass', [900, 3500])
    n = lo * (1 - p) + hi * p  # Filter öffnet sich langsam
    return n * p ** 2 * (1 - np.clip((p - 0.9) / 0.1, 0, 1)) * 0.6


def chime(freqs, d=0.9, spread=0.0):
    t = tt(d)
    out = np.zeros_like(t)
    for k, f in enumerate(freqs):
        s = int(k * spread * SR)
        tk = t[: len(t) - s]
        tone = (np.sin(2 * np.pi * f * tk) + 0.12 * np.sin(2 * np.pi * 2 * f * tk)) * np.exp(-tk / (d / 4))
        out[s:] += tone * np.minimum(1, tk / 0.012)
    return out / max(1, len(freqs)) * 0.8


def pluck(f, d=0.6):
    """Weiche Marimba für „Log. Review. Improve.“"""
    t = tt(d)
    x = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t / 0.02)) * np.exp(-t / 0.16) * np.minimum(1, t / 0.002)
    return x * 0.7


def glide(d, f0, f1):
    """Leiser Ton, der beim Füllen des Balkens langsam steigt."""
    t = tt(d)
    f = f0 * (f1 / f0) ** (t / d)
    x = filt(np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.15 * np.sin(2 * np.pi * np.cumsum(2 * f) / SR), 'lowpass', 900)
    env = np.minimum(1, t / 0.15) * np.clip((d - t) / 0.25, 0, 1)
    return x * env * 0.35


def sparkle(d=1.2):
    """Konfetti: viele winzige, gedämpfte Knister."""
    out = np.zeros(int(SR * d))
    for _ in range(36):
        at = rng.uniform(0, d * 0.8) ** 1.4 / (d * 0.8) ** 0.4
        t = tt(0.03)
        x = filt(rng.standard_normal(len(t)), 'bandpass', [2500, 6500]) * np.exp(-t / 0.004) * rng.uniform(0.3, 1)
        i = int(at * SR)
        out[i:i + len(x)] += x[: max(0, len(out) - i)]
    return out * 0.35


# ---------- Effekte auf den Animationen ----------
sfx = np.zeros((2, N))
def taps(times, f0=520, step=40, gain=0.36):
    for i, at in enumerate(times):
        put(sfx, tap(f0 + step * i), at, gain, [-0.15, 0.1, 0.0, 0.15, -0.1][i % 5])
def keys(start, n, per, gain=0.07):
    for i in range(n):  # weicher: Höhen gedämpft
        put(sfx, filt(key(), 'lowpass', 2600), start + i * per + rng.uniform(-0.004, 0.004), gain, rng.uniform(-0.2, 0.2))

# Part1 (0 s)
put(sfx, swish(1.0, 250, 1500), 0.1, 0.06)
keys(0.1, 25, 0.072)                                    # Still copying every trade
keys(2.35, 18, 0.068)                                   # into spreadsheets?
taps([4.62], 520)                                       # Meet
put(sfx, swish(0.3, 400, 3000), 5.2, 0.12, -0.5)
put(sfx, soft_pop(), 5.45, 0.32)                        # Wortmarke dreht ins Bild
put(sfx, chime([note('C4'), note('G4')], 1.2, 0.04), 5.5, 0.28)
put(sfx, tap(640), 6.1, 0.3)                            # Pille wächst
put(sfx, swish(0.3, 400, 3000), 7.8, 0.14, -0.6)        # Wisch nach links
# Part2 (8 s)
taps([8.0, 8.1, 8.2, 8.3, 8.4, 8.5], 520, 25, 0.16)     # Drop one or many CSV files
put(sfx, soft_pop(), 9.6, 0.3)                          # Import CSV
put(sfx, swell(0.9), 10.0, 0.12)                        # wird zum Fenster
put(sfx, click(), 11.0, 0.32)                           # Datei greifen
put(sfx, soft_pop(600, 400, 0.16), 12.45, 0.32)         # ablegen
put(sfx, chime([note('E5')], 0.7), 12.75, 0.24)         # Häkchen
taps([12.9, 13.02, 13.14], 540, 50, 0.24)               # into your journal
put(sfx, swish(0.4, 300, 2500), 14.05, 0.12)            # Flug zur Tabelle
taps([14.25, 14.35], 520, 80, 0.3)                      # It reads / every trade
put(sfx, swish(0.6, 250, 1500), 16.0, 0.07)             # richtet sich auf
put(sfx, swish(0.65, 1500, 6000), 17.5, 0.07)           # Strahl
for i in range(5):
    put(sfx, tap(760 + 30 * i), 17.58 + i * 0.105, 0.12)  # Zeilen markiert
# Part3 (19,8 s)
taps([19.8, 19.95, 20.1], 520, 50, 0.3)                 # And seconds later
put(sfx, soft_pop(), 21.0, 0.3)                         # Fenster
put(sfx, click(), 22.6, 0.42)                           # Review trades (danach kein Whoosh)
put(sfx, chime([note('C5'), note('E5')], 0.9, 0.03), 23.3, 0.14)  # Lichtschein
put(sfx, swish(0.75, 400, 3000), 23.8, 0.08)            # Raute fliegt
taps([24.6, 24.9, 25.05, 25.25], 520, 40, 0.3)          # Time for a quick
put(sfx, soft_pop(700, 460, 0.14), 25.4, 0.24)          # Raute landet
put(sfx, chime([note('E4'), note('G4'), note('C5')], 1.1, 0.03), 25.8, 0.3)  # review.
put(sfx, swish(0.3, 400, 3000), 26.65, 0.12, -0.6)
# Part4 (26,9 s)
put(sfx, swish(0.7, 200, 1500), 26.9, 0.12, 0.5)        # App schwingt herein
put(sfx, click(), 29.0, 0.42)                           # REVIEW
put(sfx, tap(520), 29.9, 0.24)                          # Review-Ansicht
put(sfx, click(), 31.85, 0.4)                           # Pullback
put(sfx, click(), 32.5, 0.4)                            # Yes
put(sfx, click(), 34.1, 0.42)                           # Save review
put(sfx, swish(0.3, 400, 3000), 34.75, 0.1)
# Part5 (35 s)
taps([35.375, 36.125], 520, 60, 0.26)                   # Regeln gleiten herein
for at, nm in zip((35.875, 36.625), ('C5', 'E5')):
    put(sfx, chime([note(nm)], 0.8), at, 0.28)          # abgehakt
put(sfx, swish(0.3, 300, 2000), 37.0, 0.1)              # verschmelzen
put(sfx, soft_pop(), 37.2, 0.32)                        # Plan followed
put(sfx, tap(600), 38.1, 0.22)                          # wird zum Kreis
put(sfx, chime([note('C5'), note('E5'), note('G5')], 1.4, 0.05), 38.6, 0.36)  # Häkchen
taps([39.35, 39.6], 540, 60, 0.26)                      # Trade reviewed / Create certificate
put(sfx, swell(0.4), 40.2, 0.14)                        # Flug durch die Fläche
taps([40.62, 40.75, 41.12, 41.3], 500, 40, 0.3)         # Save time. Spot mistakes.
put(sfx, swish(0.25, 400, 3000), 42.05, 0.1)
taps([42.12, 42.6], 520, 80, 0.32)                      # Stay disciplined.
put(sfx, chime([note('A3'), note('E4')], 1.6, 0.05), 42.3, 0.16)  # Stern aus Bögen
put(sfx, swish(0.25, 300, 2000), 43.65, 0.1)
put(sfx, soft_pop(), 43.85, 0.3)                        # Raute
put(sfx, chime([note('C4'), note('E4'), note('G4'), note('C5')], 2.2, 0.04), 44.3, 0.42)  # Wortmarke
keys(44.95, 18, 0.05, 0.06)                             # Start your journal
sfx = reverb(sfx, 1.4, 0.16, 7000)
sfx[:, int(47.12 * SR):] = 0                            # harter Schnitt wie im Vorbild

# ---------- Mischen ----------
tN = np.arange(N) / SR
mix = sfx * 0.6
mix *= np.clip((DUR - tN) / 1.0, 0, 1) ** 1.5
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
mix /= np.max(np.abs(mix)) / 0.89
os.makedirs(os.path.join(ROOT, 'public', 'audio'), exist_ok=True)
out = os.path.join(ROOT, 'public', 'audio', 'sound4.wav')
with wave.open(out, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix.T * 32767).astype('<i2').tobytes())
print('ok', out, f'{DUR} s')
