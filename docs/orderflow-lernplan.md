# Orderflow-Trading — Lernplan

Werkzeuge, von denen dieser Plan ausgeht: **Depth Chart / Heatmap**,
**Resting-Liquidity-Linien (RL)**, **TPO / Market Profile**.
Was fehlt und am meisten bringt: ein **Footprint-/Cluster-Chart**.

---

## 0. Vorweg: die unbequeme Wahrheit

Orderflow ist **kein Signalgeber**. Keines deiner drei Werkzeuge sagt dir, wohin
der Preis geht:

- Die **Heatmap** zeigt *Absichten*, die jederzeit zurückgezogen werden können.
- **TPO** zeigt *Vergangenheit* — wo Wert akzeptiert wurde.
- **Delta** ist verrauscht und feedabhängig.

Ein Edge entsteht erst aus der Kette:

> **Kontext** (wo stehen wir in der Auktion?) → **Level** (wo ist eine Reaktion
> plausibel?) → **Trigger** (passiert die Reaktion tatsächlich im Orderflow?) →
> **Ausführung & Risiko**

Wer diese Reihenfolge umdreht und aus dem Orderflow Einstiege "sucht", handelt Rauschen.

---

## Block 1 — Marktmechanik (Pflicht, ~2 Wochen)

Ohne das ist alles andere Kaffeesatz.

- **Wie ein Trade entsteht:** Limit-Orders bilden das Buch (passiv), Market-Orders
  nehmen Liquidität (aggressiv). Jeder Trade hat genau einen Käufer *und* einen
  Verkäufer. "Mehr Käufer als Verkäufer" gibt es nicht — nur mehr **Aggression**
  auf einer Seite und die Frage, ob die Gegenseite passiv **absorbiert**.
- **Matching Engine:** FIFO (CME-Index-Futures wie ES/NQ) vs. Pro-Rata
  (Zinskontrakte). **Queue-Position** — warum deine Limit-Order bei 4000 Kontrakten
  vor dir praktisch nie gefüllt wird, außer der Preis geht durch dich hindurch.
- **Kontraktspezifikation:** Tick Size, Tick Value, Margin (Initial / Maintenance /
  Intraday), Rollover-Termine, RTH vs. ETH, Settlement-Zeiten.
- **Wer handelt gegen dich:** Market Maker / HFT, Spreader (Kalender- und
  Inter-Market-Spreads erzeugen die "unlogischen" Prints), Hedger,
  Ausführungsalgos (TWAP, VWAP, Iceberg), Retail.
- **Datenebenen:**
  - **L1** — Best Bid/Ask + Trades
  - **L2 (MBP)** — aggregierte Größe je Preis
  - **L3 (MBO)** — jede einzelne Order; die CME liefert das, deshalb sind
    Queue-Analyse und echte Iceberg-Erkennung überhaupt möglich
  Verstehe, welche Ebene dein Tool nutzt — davon hängt ab, wie viel deine
  Heatmap wirklich weiß und wie viel sie schätzt.

**Beste Quelle:** Larry Harris, *Trading and Exchanges*. Dazu das (kostenlose)
CME Institute für Kontraktspezifika.

---

## Block 2 — Deine Werkzeuge wirklich verstehen

### Depth Chart / Heatmap

Y-Achse = Preis, X-Achse = Zeit, Helligkeit = Größe der **ruhenden** Limit-Orders.
Es ist eine **Historie des Orderbuchs**, keine Prognose. Lesen lernen:

| Muster | Bedeutung |
| --- | --- |
| **Stacking** | Liquidität wird vor dem Preis aufgebaut |
| **Pulling** | Liquidität verschwindet, bevor der Preis ankommt → war nie Support, war ein Magnet |
| **Refilling** | Wird durchgehandelt und immer wieder nachgelegt → **echte Absorption**, das stärkste Signal |
| **Vakuum / Void** | Leere Zone → dort geht es schnell durch, schlechter Einstieg, gutes Ziel |
| **Wall wird absorbiert** | Große Order wird *durchgehandelt* statt gezogen → die Seite dahinter ist geschlagen, oft Beschleunigung |

### RL-Linien (Resting Liquidity)

Regeln, die du dir aufschreiben solltest:

1. **Relativ, nicht absolut.** 500 Kontrakte sind im ES nichts, im CL alles.
   Immer im Verhältnis zur durchschnittlichen Buchtiefe des Instruments bewerten.
2. **Zeit + Nachfüllen = Relevanz.** Eine Order, die 20 Minuten liegt und
   dreimal nachgefüllt wurde, ist etwas völlig anderes als eine, die vor 3 Sekunden erschien.
3. **Gezogen ≠ Support.** Verschwindet sie beim Herankommen, war sie Köder oder
   Spoof — und der Preis läuft meist genau dorthin, wo sie lag.
4. **Absorbiert > gezogen.** Durchgehandelte Liquidität ist ein echtes Ereignis,
   zurückgezogene ist nur ein Nicht-Ereignis.
5. **Nie allein handeln.** RL ist ein *Level-Filter*, kein Einstiegssignal.

> Falls du mit "RL" etwas anderes meinst (z. B. Rotationslevel im TPO-Kontext) —
> sag Bescheid, dann passe ich den Abschnitt an.

### Time & Sales (Tape)

Geschwindigkeit, Größenverteilung, ob am Bid oder Ask gehandelt wird, Prints über
einer Schwelle. Das Tape ist der direkteste Zugang zur Aggression.

### Footprint / Cluster (was dir fehlt)

Bid × Ask je Preis, Delta je Kerze, diagonale Imbalances (z. B. 3:1),
Absorptions-Hochs und -Tiefs, Kerzen-POC. Das ist die **Bestätigungsebene** zwischen
Heatmap (Absicht) und TPO (Struktur). Wenn du ein Tool ergänzt, dann dieses.

### Cumulative Delta (CVD)

Nützlich für **Divergenzen**: Preis macht ein neues Hoch, CVD nicht → die
Aggressoren werden absorbiert. Aber: feedabhängig, an Trendtagen oft nutzlos, und
nie ohne Level handeln.

### Volume Profile vs. TPO

- **Volume Profile** = *wie viel* wurde je Preis gehandelt
- **TPO** = *wie lange* war ein Preis akzeptiert

Wenn Volumen-POC und TPO-POC auseinanderfallen, ist genau das die Information:
schnelles Volumen ohne Zeit-Akzeptanz ist Ablehnung.

---

## Block 3 — Market Profile / TPO richtig lernen

### Auktionstheorie (das Fundament)

Der Markt bewegt sich **vertikal**, um einen Preis zu finden, der Geschäft
ermöglicht, und handelt **horizontal**, um Wert zu bilden. Alles im TPO ist eine
Antwort auf: *Wird dieser Preis akzeptiert oder abgelehnt?*

### Bausteine

- **Value Area (70 %), VAH, VAL, POC**
- **Initial Balance (IB)** — erste Stunde; Range Extension darüber/darunter
- **Single Prints** — Ablehnung, oft später wieder aufgefüllt
- **Excess (Tail/Spike)** — sauberes Ende einer Auktion
- **Poor High / Poor Low** — *kein* Exzess, unvollendete Auktion → Magnet
- **Naked / Virgin POC** — nie wieder getesteter POC → Zielmagnet

### Tagestypen (musst du live erkennen können)

Normal Day · Normal Variation Day · Trend Day · Double Distribution Trend Day ·
Neutral Day (Center / Extreme) · Non-Trend Day

### Open Types (verrät dir früh den Tagestyp)

- **Open-Drive** — sofort in eine Richtung, kein Rücklauf → höchste Überzeugung
- **Open-Test-Drive** — testet eine Seite, lehnt ab, dreht und läuft
- **Open-Rejection-Reverse** — läuft, wird abgelehnt, dreht durch die Eröffnung
- **Open-Auction** — orientierungslos, innerhalb oder außerhalb der Vortagesrange

### Value-Beziehung zum Vortag

Higher · Lower · Overlapping · Inside · Outside — daraus folgen konkrete
Erwartungen. Beispiel: Eröffnung außerhalb der Vortages-Value **mit Akzeptanz**
→ Trendtag-Kandidat. Rückkehr *in* die Vortages-Value → Test der
gegenüberliegenden Value-Kante ist das Standard-Szenario.

### Composite Profile (Wochen/Monate)

- **HVN** (High Volume Node) = Akzeptanz, Bremse, Preis "klebt"
- **LVN** (Low Volume Node) = Ablehnung, schnelle Durchläufe, **exzellente Stop-Grenze**

### Ziel-Hierarchie für Rotationen

VAH/VAL → POC → IB-High/Low → Vortageshoch/-tief → naked POC → Single Prints

**Bücher:** James Dalton, *Mind Over Markets* (lernen) und *Markets in Profile*
(vertiefen). Optional Steidlmayer für die Wurzeln.

---

## Block 4 — Orderflow-Lesarten (das eigentliche Handwerk)

- **Absorption** — aggressive Marktorders prasseln auf nachgefüllte Limits, der
  Preis bewegt sich nicht. Umkehrkandidat.
- **Initiative** — Aggression trifft auf dünnes Buch, Preis läuft. Fortsetzung.
- **Erschöpfung** — viel Volumen, wenig Preisfortschritt am Ende einer Bewegung.
- **Iceberg** — gehandeltes Volumen an einem Preis ist ein Vielfaches der
  angezeigten Größe.
- **Spoofing / Layering** — große Orders, die systematisch verschwinden. Deshalb
  Regel 5 oben.
- **Liquidity Sweep / Stop Run** — Stops clustern über Vortageshoch, Rangehoch,
  runden Zahlen. Sweep **und sofortige Rückkehr in die Range** = gefangene Trader.
- **Trapped Traders** — Aggressoren auf der falschen Seite eines Levels; ihr
  erzwungener Ausstieg ist der Treibstoff deiner Bewegung. Das ist die
  wichtigste Einzelidee im Orderflow.
- **Zeit** — wie lange braucht der Markt an einem Level? Langsam = Akzeptanz,
  schnell = Ablehnung.

---

## Block 5 — Der Prozess (dein Tagesablauf)

**Vorbereitung (vor Eröffnung)**

1. Composite-/HTF-Profil: wo sind HVN und LVN?
2. Vortag: VAH / POC / VAL, Poor Highs/Lows, Single Prints, Tagestyp
3. Overnight-Range, offene Gaps, naked POCs
4. Nachrichtenkalender
5. **Szenario A / B / C** schriftlich, jeweils mit Invalidierung

**Session**

6. Open Type klassifizieren → Tagestyp-Hypothese
7. IB beobachten, Hypothese anpassen
8. Nur Levels mit **Konfluenz** handeln (z. B. LVN **+** Vortages-VAL **+**
   sichtbare Resting Liquidity)
9. **Trigger abwarten:** Absorption, Refill, Delta-Divergenz, gescheiterte
   Auktion. Kein Trigger → kein Trade.
10. Stop **strukturell** hinter den Exzess oder das LVN, nicht "2 Ticks weil billig"
11. Ziele vorher definiert: nächste Struktur, Teilverkäufe, Break-even-Regel

**Nachbereitung**

12. Jeden Trade mit Screenshot, Kontext, Setup-Tag und — am wichtigsten —
    **Regelkonformität** (unabhängig vom Ergebnis)

---

## Block 6 — Risiko & Statistik (ohne das ist der Rest wertlos)

- **R-Denken:** jeder Trade wird in Vielfachen des Risikos gemessen, nie in Euro
- **Erwartungswert** = TQ × Ø-Gewinn − (1 − TQ) × Ø-Verlust
- **Positionsgröße** folgt aus der Stop-Distanz, nie aus dem Bauchgefühl
- **Harte Limits:** Tagesverlustlimit, max. Trades pro Tag, Stopp nach zwei
  Verlusten in Folge
- **Sample Size:** unter 100 Trades pro Setup sagt deine Statistik nichts
- **Playbook:** 2–3 Setups, schriftlich, mit Bedingungen und Invalidierung.
  Mehr nicht. Wirklich nicht.

---

## Block 7 — Psychologie & Training

- Feste Routine: Prep → Session → Review, immer gleich
- Mark Douglas, *Trading in the Zone*
- **Market Replay** ist dein Simulator: 50–100 Wiederholungen **pro Setup**,
  bevor Geld ins Spiel kommt

---

## 12-Wochen-Plan

| Wochen | Fokus |
| --- | --- |
| 1–2 | Mechanik, Kontraktspezifika, Tape lesen — **keine Trades** |
| 3–4 | TPO täglich manuell auswerten: Open Type, Tagestyp, Value-Relation, wo lag die Wende? |
| 5–6 | Heatmap/RL: täglich 3 Levels markieren und protokollieren — hielt / absorbiert / gezogen |
| 7–8 | **Ein einziges** Setup definieren, 100× im Replay |
| 9–10 | Sim live, nur dieses Setup |
| 11–12 | Live mit Mikro-Kontrakten (MES/MNQ), 1 Kontrakt, Fokus: Regeldisziplin statt P/L |

---

## Die häufigsten Fehler

1. Heatmap-Wände als Support/Resistance behandeln
2. Delta-Divergenzen ohne Level handeln
3. Zu viele Werkzeuge gleichzeitig — jedes Tool ohne Kontext ist Rauschen
4. Level ohne Kontext (ein LVN im Trendtag ist kein Umkehrpunkt)
5. Größe erhöhen, bevor die Statistik steht
6. Kein schriftliches Playbook

---

## Ressourcen

**Bücher**

- Larry Harris — *Trading and Exchanges* (Mikrostruktur, das Fundament)
- James Dalton — *Mind Over Markets*, *Markets in Profile* (TPO)
- Peter Steidlmayer — *Steidlmayer on Markets*
- Mark Douglas — *Trading in the Zone* (Psychologie)
- Trader Dale — *Volume Profile* (praxisnah, leichter Einstieg)

**Ausbildung / Videos**

- Jigsaw Trading (Peter Davies) — DOM und Orderflow, sehr bodenständig
- Bookmap Education — Heatmap-Lesen
- Axia Futures — Prozess und Ausführung
- CME Institute — kostenlos, Mechanik und Kontraktspezifika

**Daten**

- Databento (CME MBO), CME DataMine

**Instrumente zum Lernen**

- **MES / MNQ** — Mikros, FIFO, tiefe Liquidität, günstiges Lehrgeld
- **ES / NQ** — sobald die Statistik steht
- **CL** — schnell und brutal, nichts für den Anfang
- **FDAX / FGBL** (Eurex) — wenn du europäische Zeiten brauchst
- **Crypto-Perps** — Orderbuch funktioniert anders (kein zentraler Feed, viel
  Wash Trading und Spoofing); nicht zum Lernen geeignet

---

## Die eine Sache, wenn du nur eine mitnimmst

**Ein Level ohne Kontext ist Rauschen, ein Kontext ohne Trigger ist eine Meinung,
und ein Trigger ohne Risikoregel ist ein Glücksspiel.** Erst alle drei zusammen
ergeben einen Trade.
