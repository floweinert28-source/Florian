"""Sound-Effekte für das zweite Launch-Video (Vorlage LangEase), komplett synthetisch, ohne fremde Samples, ohne Musik.
Zeitpunkte passend zu src/v2 (Hook 0 s, Phones 5,1 s, Score 10,3 s, Edge 18,3 s, Finale 21 s).
Aufruf:  python3 scripts/sound2.py   (braucht numpy und scipy)  →  public/audio/sound2.wav (48 kHz, Stereo)
Wünsche aus den Rückmeldungen: kein Whoosh direkt nach einem Klick, Häkchen-Töne tief und weich, leises Antippen statt dumpfer Pops.
"""
import os
import wave

import numpy as np
from scipy import signal

SR = 48000
DUR = 34.4
N = int(SR * DUR)
rng = np.random.default_rng(11)
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
# 1 Hook
put(sfx, tap(520), 0.05, 0.45)                       # Turn
put(sfx, tap(600), 0.32, 0.4, 0.2)                   # trades
put(sfx, tap(500), 1.22, 0.45)                       # into discipline
put(sfx, swish(0.3, 400, 2500), 1.2, 0.08)
put(sfx, tap(560), 2.3, 0.45)                        # Every trade
put(sfx, soft_pop(), 3.32, 0.4)                      # Ordner springt auf
put(sfx, tap(680), 3.45, 0.35, 0.4)                  # instantly
put(sfx, click(), 4.1, 0.45)                         # Klick auf den Ordner (danach kein Whoosh)
# 2 Phones
for i, (at, fr) in enumerate([(5.25, 520), (5.55, 580), (5.82, 620), (6.07, 680)]):
    put(sfx, tap(fr), at, 0.38, [-0.2, 0.0, 0.1, 0.2][i])  # Just drop and go.
for i in range(4):
    put(sfx, swish(0.4, 350, 3000), 6.42 + i * 0.07, 0.16, [-0.7, 0.7, -0.6, 0.6][i])  # Handys fliegen ein
for at, fr in [(6.85, 560), (7.3, 620), (7.75, 700)]:
    put(sfx, tap(fr), at, 0.4)                       # Trades. Rules. Stats.
put(sfx, chime([note('C4'), note('E4'), note('G4')], 1.2, 0.03), 8.35, 0.35)  # All in one journal.
put(sfx, swell(0.9), 9.35, 0.22)                     # in das Handy hinein
# 3 Score
put(sfx, glide(2.1, note('A2'), note('E3')), 10.6, 0.13)  # Balken läuft voll
for at, nm in zip((11.05, 11.75, 12.6), ('C5', 'E5', 'G5')):
    put(sfx, chime([note(nm)], 0.8), at, 0.3)        # Regeln leuchten auf (weich, wie in Video 1)
put(sfx, swish(0.3, 300, 1800), 12.8, 0.1)           # zieht sich zum Kreis zusammen
put(sfx, soft_pop(560, 380, 0.18), 13.25, 0.35)
put(sfx, chime([note('G4'), note('C5'), note('E5')], 1.3, 0.06), 13.3, 0.38)  # Plan followed.
put(sfx, sparkle(1.3), 13.28, 0.14, -0.3)
put(sfx, sparkle(1.3), 13.33, 0.14, 0.3)
put(sfx, tap(500), 14.75, 0.3)                       # Kreis wird zur Karte
for i in range(2):
    put(sfx, tap(560 + 60 * i), 15.2 + i * 0.09, 0.22, 0.4 + 0.2 * i)  # Karten gleiten herein
put(sfx, swish(0.8, 250, 1500), 15.75, 0.12)         # Kamera zieht zurück
put(sfx, tap(640), 17.15, 0.3, 0.2)                  # Hand zeigt auf den ES-Trade
put(sfx, swell(0.75), 17.55, 0.16)                   # Fahrt auf die Karte
# 4 Edge
for i in range(4):
    put(sfx, swish(0.45, 350, 3200), 18.34 + i * 0.05, 0.13, [-0.7, 0.7, -0.6, 0.6][i])  # Kacheln fliegen aus
for at, fr in [(18.7, 520), (18.92, 580), (19.16, 660)]:
    put(sfx, tap(fr), at, 0.4)                       # Know your edge.
# 5 Finale
put(sfx, tap(600), 22.15, 0.28, -0.2)                # Zeile hervorgehoben
put(sfx, swell(0.7), 22.3, 0.12)                     # Fahrt auf die Zeile
put(sfx, tap(700), 22.85, 0.25, 0.3)                 # Knopf erscheint
put(sfx, click(), 23.65, 0.45)                       # Klick „Create certificate“ (danach kein Whoosh)
put(sfx, soft_pop(620, 400, 0.18), 24.88, 0.38)      # wird zum Abzeichen
put(sfx, swish(0.45, 400, 3500), 25.12, 0.16, 0.6)   # rollt hinaus
put(sfx, swish(0.4, 400, 3000), 25.75, 0.12, -0.6)   # kommt oben links zurück
for at, nm in zip((26.0, 27.05, 28.05), ('E4', 'G4', 'C5')):
    put(sfx, pluck(note(nm)), at, 0.42)              # Log. Review. Improve.
for at in (26.95, 27.95):
    put(sfx, swish(0.3, 500, 3000), at, 0.07)        # Sprünge
put(sfx, chime([note('C4'), note('E4'), note('G4'), note('C5')], 1.8, 0.04), 29.35, 0.42)  # Wortmarke
for i in range(10):
    put(sfx, tap(760 + 18 * i), 29.3 + i * 0.04, 0.07)   # Buchstaben
for i in range(35):
    put(sfx, key(), 30.1 + i / 30 + rng.uniform(-0.004, 0.004), 0.1, rng.uniform(-0.2, 0.2))  # getippter Satz
sfx = reverb(sfx, 1.4, 0.16, 7000)

# ---------- Mischen ----------
tN = np.arange(N) / SR
mix = sfx * 0.6
mix *= np.clip((DUR - tN) / 1.0, 0, 1) ** 1.5
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
mix /= np.max(np.abs(mix)) / 0.89
os.makedirs(os.path.join(ROOT, 'public', 'audio'), exist_ok=True)
out = os.path.join(ROOT, 'public', 'audio', 'sound2.wav')
with wave.open(out, 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix.T * 32767).astype('<i2').tobytes())
print('ok', out, f'{DUR} s')
