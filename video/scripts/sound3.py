"""Sound-Effekte für das dritte Launch-Video (Vorlage Outbidd), komplett synthetisch, ohne fremde Samples, ohne Musik.
Zeitpunkte passend zu src/v3 (Open 0 s, Chaos 7,5 s, Overview 11,1 s, List 20,8 s, Plan 27,6 s, Review 40,6 s, Outro 52,9 s).
Aufruf:  python3 scripts/sound3.py   (braucht numpy und scipy)  →  public/audio/sound3.wav (48 kHz, Stereo)
Wünsche aus den Rückmeldungen: kein Whoosh direkt nach einem Klick, Häkchen-Töne tief und weich, leises Antippen statt dumpfer Pops.
"""
import os
import wave

import numpy as np
from scipy import signal

SR = 48000
DUR = 62.5
N = int(SR * DUR)
rng = np.random.default_rng(13)
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
def taps(times, f0=520, step=40, gain=0.38):
    for i, at in enumerate(times):
        put(sfx, tap(f0 + step * i), at, gain, [-0.15, 0.1, 0.0, 0.15, -0.1][i % 5])
def keys(start, n, per, gain=0.12):
    for i in range(n):
        put(sfx, key(), start + i * per + rng.uniform(-0.004, 0.004), gain, rng.uniform(-0.2, 0.2))
def ticks(start, dur, n, gain=0.1):
    for k in range(1, n + 1):
        put(sfx, tap(900), start + dur * (1 - (1 - k / n) ** 0.5), gain)

# Open (0 s)
put(sfx, swish(0.9, 250, 1500), 0.0, 0.08)
taps([0.0, 0.6], 480, 80)                               # What / if
put(sfx, swell(0.4), 1.45, 0.16)                        # Flug in die Raute
put(sfx, soft_pop(), 1.75, 0.32)                        # Leit-Raute
taps([2.2, 2.45, 2.7], 520, 40)                         # You could follow
put(sfx, swish(0.3, 400, 3000), 3.55, 0.14, 0.5)        # Wisch nach rechts
put(sfx, swish(0.8, 300, 2500), 4.0, 0.06, -0.3)        # Raute fliegt im Bogen
taps([4.1, 4.45, 4.8], 540, 50)                         # your trading plan
put(sfx, soft_pop(700, 460, 0.14), 4.9, 0.25)
put(sfx, chime([note('A3'), note('C#4'), note('E4')], 1.4, 0.03), 6.42, 0.36)  # Every time?
# Chaos (7,5 s)
keys(7.55, 8, 0.1)                                      # No more
keys(8.35, 12, 0.022)                                   # spreadsheets
for i, at in enumerate([8.65, 8.75, 8.85, 9.0, 9.15, 9.3]):
    put(sfx, tap(720 + 30 * i), at, 0.24, [-0.6, 0.6, -0.5, 0.5, -0.3, 0.3][i])   # Hinweise springen auf
put(sfx, swish(0.3, 400, 3000), 9.9, 0.14)
put(sfx, soft_pop(600, 420, 0.16), 10.0, 0.3)           # Notiz-Fenster
put(sfx, click(), 10.8, 0.42)                           # Done
# Overview (11,1 s)
put(sfx, swish(0.6, 200, 1500), 11.1, 0.12)             # Dashboard gleitet herein
taps([11.45, 13.4], 560, 60)                            # your trades / in one place
put(sfx, swell(1.0), 14.1, 0.16)                        # Flug in die Tagesbalken
put(sfx, soft_pop(), 15.95, 0.3)                        # Hinweis am 29.
put(sfx, click(), 16.5, 0.42)                           # Review day (danach kein Whoosh)
keys(17.05, 6, 0.08)                                    # Forget
taps([17.85, 18.7], 600, 60, 0.3)
put(sfx, tap(480), 18.0, 0.22)                          # Journal hebt sich heraus
put(sfx, swish(0.3, 300, 2000), 20.55, 0.12)
# List (20,8 s)
for i in range(6):
    put(sfx, tap(640 + 25 * i), 21.05 + i * 0.4, 0.26)   # Markierung springt
put(sfx, swish(0.25, 400, 2500), 23.35, 0.12)
put(sfx, soft_pop(), 23.52, 0.32)                       # Raute
put(sfx, swell(0.35), 24.2, 0.16)                       # Flug hindurch
taps([24.52, 24.75], 520, 60)
put(sfx, chime([note('C4'), note('E4'), note('G4')], 1.1, 0.03), 26.25, 0.3)  # you miss.
# Plan (27,6 s)
put(sfx, swish(0.4, 300, 2000), 27.6, 0.1)
keys(29.75, 19, 0.04)                                   # Never move the stop
put(sfx, soft_pop(620, 420, 0.15), 30.65, 0.3)          # Regel angelegt
put(sfx, swish(0.5, 300, 3000), 31.1, 0.14)             # 3D-Wechsel
taps([33.0, 34.4], 540, 60, 0.3)                        # Add the setups / you trade.
keys(33.9, 4, 0.09)                                     # Open
put(sfx, tap(760), 34.5, 0.22)                          # Vorschlag
put(sfx, click(), 35.4, 0.42)
put(sfx, soft_pop(600, 400, 0.15), 35.5, 0.26)          # Setup landet
put(sfx, glide(0.9, note('A2'), note('E3')), 37.6, 0.1) # Linie füllt sich
for at, nm in zip((38.75, 38.93, 39.11, 39.29), ('C5', 'D5', 'E5', 'G5')):
    put(sfx, chime([note(nm)], 0.7), at, 0.26)          # Regeln abgehakt (weich)
put(sfx, tap(600), 39.6, 0.22)                          # Save plan
# Review (40,6 s)
put(sfx, click(), 42.05, 0.42)                          # Shadow Self
put(sfx, swish(0.4, 300, 2000), 42.2, 0.07)             # Monate klappen auf
put(sfx, click(), 43.9, 0.42)                           # September
put(sfx, swell(0.8), 44.5, 0.12)                        # Kamera zieht zurück
taps([44.7, 45.4], 560, 60, 0.3)                        # Überschrift
put(sfx, click(), 45.5, 0.36)                           # Schalter Shadow Self
put(sfx, glide(1.1, note('E3'), note('B3')), 45.65, 0.08)  # grüne Linie
ticks(46.5, 1.4, 16)                                    # Disziplin-Kosten zählen
put(sfx, swish(0.6, 200, 1500), 48.0, 0.08)
ticks(48.2, 1.6, 16)                                    # Shadow Self zählt
put(sfx, soft_pop(560, 380, 0.18), 50.45, 0.34)         # Trade-Prüfung
ticks(50.9, 1.6, 14, 0.09)                              # Discipline bis 80
put(sfx, tap(480), 52.5, 0.26)
put(sfx, swish(0.35, 400, 3500), 52.62, 0.12)
# Outro (52,9 s)
put(sfx, swell(0.9), 52.9, 0.1)
taps([53.0, 54.4], 520, 80)                             # Your plan. / Your rules.
put(sfx, click(), 55.1, 0.38)
put(sfx, click(), 56.65, 0.38)
put(sfx, swish(0.4, 300, 2000), 57.0, 0.1)
taps([57.4, 57.6, 57.8, 58.0, 58.2], 500, 30, 0.3)      # The way journaling should be
put(sfx, soft_pop(), 58.7, 0.32)                        # Raute
put(sfx, chime([note('C4'), note('E4'), note('G4'), note('C5')], 2.0, 0.04), 59.85, 0.42)  # Wortmarke
for i in range(10):
    put(sfx, tap(760 + 18 * i), 59.85 + i * 0.05, 0.06)
sfx = reverb(sfx, 1.4, 0.16, 7000)

# ---------- Mischen ----------
tN = np.arange(N) / SR
mix = sfx * 0.6
mix *= np.clip((DUR - tN) / 1.0, 0, 1) ** 1.5
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
mix /= np.max(np.abs(mix)) / 0.89
os.makedirs(os.path.join(ROOT, 'public', 'audio'), exist_ok=True)
out = os.path.join(ROOT, 'public', 'audio', 'sound3.wav')
with wave.open(out, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix.T * 32767).astype('<i2').tobytes())
print('ok', out, f'{DUR} s')
