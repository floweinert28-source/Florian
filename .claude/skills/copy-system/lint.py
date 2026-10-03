#!/usr/bin/env python3
"""KI-Spuren-Linter für Website-Texte (Deutsch und Englisch).

Aufruf: python3 lint.py texte.json    (JSON: Liste von Strings oder {"bereich": [strings]})
Ausgabe: Treffer je Zeile und eine Note von 0 bis 5. Exit-Code 1 unter 5/5.
Nur Regex, keine Meinung.
"""
import json, re, sys

WORDS = [
    # Deutsch
    "nahtlos", "mühelos", "revolutionär", "bahnbrechend", "ganzheitlich", "innovativ", "maßgeschneidert",
    "leistungsstark", "intuitiv", "umfassend", "einzigartig", "spielend leicht", "gamechanger", "entfessel",
    "potenzial", "eintauchen", "tauche ein", "welt der", "erlebnis", "neues level", "nächste stufe",
    "auf einen blick", "alles an einem ort", "im griff", "unter kontrolle", "im blick", "schwarz auf weiß",
    "im grünen bereich", "wirklich", "einfach nur", "ganz einfach", "kinderleicht", "optimal", "effizient",
    "smarter", "clever", "durchstarten", "loslegen", "jetzt starten", "mehr als nur", "egal ob",
    "in minuten", "im handumdrehen", "von a bis z", "rundum", "perfekt", "ultimativ",
    # Englisch
    "delve", "seamless", "elevate", "unlock", "unleash", "game-changer", "game changer", "robust",
    "cutting-edge", "leverage", "empower", "effortless", "revolutionize", "streamline", "tapestry",
    "testament", "navigate the", "in today's", "supercharge", "get started",
]

SHAPES = {
    "nicht nur … sondern": r"\bnicht nur\b.{1,60}\bsondern\b",
    "Dreier-Liste": r"\b[\wäöüß-]+, [\wäöüß-]+(?: [\wäöüß-]+)? und [\wäöüß-]+\b",
    "Gedankenstrich-Einschub": r"\s[—–]\s",
    "„ohne … zu“-Kontrast": r"\bohne\b[^.]{1,40}\bzu\s+\w+",
    "Merksatz-Schluss (Damit/So …)": r"(?:^|[.!?]\s)(?:Damit du|So (?:trennst|siehst|weißt|wird)|Damit wird)",
    "Doppel-Slogan „X. Ein Y.“": r"^[^.]{2,30}\. Ein(?:e|en)? [^.]{2,25}\.$",
    "Leere Verstärker": r"\b(?:wirklich|echt|absolut|komplett|total)\b",
    "Doppelpunkt-Enthüllung im Titel": r"^[^:]{2,40}: [^.]{2,60}$",
}

def lint(line):
    low = line.lower()
    hits = [f"Wort: {w}" for w in WORDS if w in low]
    hits += [f"Form: {name}" for name, rx in SHAPES.items() if re.search(rx, line, re.I if name != "Doppel-Slogan „X. Ein Y.“" else 0)]
    return hits

def main(path):
    data = json.load(open(path, encoding="utf-8"))
    groups = data if isinstance(data, dict) else {"Text": data}
    total_hits, words = 0, 0
    for group, lines in groups.items():
        for line in lines:
            h = lint(line); total_hits += len(h); words += len(line.split())
            if h: print(f"[{group}] {line}\n    -> " + "; ".join(h))
    per100 = total_hits / max(words, 1) * 100
    score = max(0, min(5, round(5 - per100)))
    print(f"\n{total_hits} Treffer auf {words} Wörter ({per100:.1f} je 100). Note: {score}/5")
    sys.exit(0 if score >= 5 else 1)

if __name__ == "__main__":
    main(sys.argv[1])
