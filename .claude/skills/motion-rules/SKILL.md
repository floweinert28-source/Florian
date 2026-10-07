---
name: motion-rules
description: Hausregeln für Motion-Design, bevor irgendetwas animiert wird. Gefühl und Persönlichkeit festlegen, Mini-Story, drei Bewegungsebenen, feste Dauern, Easing, Disney-Prinzipien, Choreografie und Technik (nur transform/opacity, GSAP-Timeline, Remotion). Zieht die Skills motion-design, gsap-core, gsap-timeline und Remotion hinzu. Triggers on "/motion-rules", "Motion", "Motion-Design", "Animation", "animieren", "Übergang", "Reel", "Intro", "Micro-Interaction".
---

# Motion-Design: Wissen und Skills

Diese Regeln gelten für jede Animation in diesem Projekt: Web, SVG, Lottie und Video. Erst die Fragen unter „Vor jeder Animation festlegen“ beantworten, dann bauen.

## Werkzeuge

Die fachlichen Skills liegen im Projektordner und werden automatisch geladen, sobald das Thema passt:

| Skill | Wofür | Quelle |
| --- | --- | --- |
| `motion-design` | Motion-Prinzipien: Emotion, Persönlichkeit, Timing, Easing, Disney, Choreografie | LottieFiles |
| `gsap-core` | Web- und SVG-Animation mit GSAP: to/from/fromTo, Easing, Stagger, matchMedia | GreenSock (offiziell) |
| `gsap-timeline` | GSAP-Timelines: Position-Parameter, Verschachtelung, Labels, Playback | GreenSock (offiziell) |
| Remotion-Skill | Echte Videos als MP4 | Remotion |

### Skills installieren (im Projektordner)

Die ersten drei sind hier bereits installiert (`skills-lock.json`). Zum Nachinstallieren oder in einem neuen Projekt:

```bash
# Motion-Prinzipien (LottieFiles)
npx -y skills add lottiefiles/motion-design-skill --skill motion-design --agent claude-code

# Web- und SVG-Animation (GSAP, offiziell von GreenSock)
npx -y skills add greensock/gsap-skills --skill gsap-core --agent claude-code
npx -y skills add greensock/gsap-skills --skill gsap-timeline --agent claude-code

# Echte Videos als MP4 (Remotion, nur im Remotion-Projekt ausführen)
npx remotion skills add
```

Aktualisieren: `npx -y skills update -p`.

## Vor jeder Animation festlegen

1. Welches Gefühl? (Freude, Ruhe, Dringlichkeit, Eleganz)
2. Eine Persönlichkeit pro Projekt: verspielt, premium, seriös oder energisch
3. Mini-Story: Aufbau, Aktion, Auflösung
4. Drei Ebenen: Hauptbewegung, Nebenbewegung (Schatten, Wellen, Nachschwingen), Umgebung (Wolken, leichtes Atmen)

Ohne Antwort auf diese vier Punkte wird nicht gebaut. Fehlen sie in der Aufgabe, kurz nachfragen oder die Annahme ausdrücklich nennen.

## Timing

- Mikro-Feedback 80–120 ms, Knopfdruck 120–180 ms, Karten 200–350 ms
- Seitenwechsel 400–600 ms, großer Auftritt 600–1200 ms
- Eintritt 30–50 % länger als Austritt
- Längerer Weg bedeutet längere Dauer
- Versatz zwischen Elementen insgesamt unter 500 ms

## Easing

- Rein: ease-out. Raus: ease-in. Auf dem Bildschirm: ease-in-out. Schleifen: sine
- Nie linear für Bewegung im Raum
- Eine Signatur-Kurve für 80 % aller Animationen, drei feste Dauern
- Premium: `cubic-bezier(0.4, 0, 0.2, 1)`, kein Überschwingen
- Verspielt: `back.out` mit 10–20 % Überschwingen

## Disney-Prinzipien, die am meisten bringen

- Antizipation: kleine Gegenbewegung vor der Aktion
- Squash & Stretch bei Landungen (z. B. 1,07 breit, 0,9 hoch, dann zurückfedern), nicht bei Premium
- Nachschwingen: abhängige Teile 50–150 ms nach dem Hauptelement
- Bögen statt gerader Linien
- Staging: Nebensachen abdunkeln, der Held kommt zuletzt und am stärksten

## Choreografie

- Alle Elemente kommen aus derselben Richtung
- Höchstens ein Drittel der Elemente bewegt sich gleichzeitig
- Kein Weg über ein Drittel des Bildes ohne Richtungswechsel
- Hintergrund bewegt sich gegenläufig mit 20–30 % Tempo

## Technik

- Nur `transform` und `opacity` animieren
- Wichtige Zustandswechsel nie nur über Deckkraft
- GSAP: eine Timeline mit Labels und Positionsangaben statt `delay`s, `defaults` setzen
- Mehrere `fromTo` auf dasselbe Element: `immediateRender: false`
- `prefers-reduced-motion` beachten, Animationen über 5 s pausierbar machen
- Remotion: erst Vorschau im Studio, nur rendern, wenn ausdrücklich gewünscht

## Gute Prompts

- Dauer, Format (9:16 für Reels, 16:9, 1:1) und Szenenfolge mit Timing angeben
- Persönlichkeit, Farben, Schrift und Beispiele nennen
- Sagen, was bleiben soll und was nicht
- In kleinen Schritten ändern, eine Sache pro Nachricht
- Endtest: Wirkt es auch beim 100. Ansehen noch gut?
