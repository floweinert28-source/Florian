# Prop-Firm-Trading-Bot (50.000 $ / +4.000 $ / 2.000 $ Drawdown)

Ein vollständiger, von Grund auf gebauter Handelsbot für ein Prop-Firm-Konto mit
genau diesen Vorgaben:

| Vorgabe | Wert |
| --- | --- |
| Startkapital | 50.000 $ |
| Gewinnziel (danach Payout, Handel endet) | +4.000 $ → 54.000 $ |
| Maximaler Drawdown | 2.000 $ |
| Selbst gesetztes Tageslimit | 1.000 $ |

Alles ist konfigurierbar — die Zahlen oben sind nur die Standardwerte.

```bash
pip install -r requirements-propbot.txt

python -m propbot math                       # Was verlangt dieses Konto rechnerisch?
python -m propbot fetch --symbol NQ --jahre 5   # Echte Kursdaten laden
python -m propbot validate --data data/nq_m15.csv   # Daten gegen NQ-Futures prüfen
python -m propbot backtest --data data/nq_m15.csv --symbol MNQ --journal
python -m propbot montecarlo --data ...      # Wie wahrscheinlich ist der Payout?
python -m propbot walkforward --data ...     # Parameter echt oder angepasst?
python -m propbot lessons --data ...         # Welche Fehler macht der Bot?
python -m propbot paper --data ...           # Live-Logik ohne Geld
```

> **Ergebnis der Praxistests vorweg:** Auf fünf Jahren echter NQ-Daten hat der
> **Trend-Pullback keinen Edge** (+0,015 R out-of-sample, Payout 26 % —
> [Kapitel 12](#12-praxistest-nq-über-fünf-jahre-echter-daten)). Der daraufhin
> gebaute **Opening-Range-Breakout schon**: +0,136 R out-of-sample über vier
> Walk-Forward-Fenster, in allen sechs Jahren positiv, Payout-Wahrscheinlichkeit
> 90 % ([Kapitel 13](#13-zweiter-anlauf-opening-range-breakout-auf-nq)). Klein,
> aber echt — und getestet, nicht behauptet.

---

## 1. Das eigentliche Problem

Ein 50k-Konto mit 4.000 $ Ziel und 2.000 $ Drawdown ist **kein Renditeproblem,
sondern ein Überlebensproblem**: du musst das Doppelte deines Notgroschens
verdienen, bevor eine Pechserie ihn aufbraucht. 8 % Gewinn sind leicht — 8 %
Gewinn, ohne je 4 % im Minus zu sein, ist schwer.

Daraus folgt die ganze Architektur: die Strategie ist der kleinste Teil des
Programms. Der größte Teil ist die Frage, **wie viel** gehandelt wird und
**wann gar nicht**.

`python -m propbot math` rechnet das für dein Konto durch. Auszug (Trefferquote
45 %, CRV 2,0, inklusive Kosten):

```
  Risiko  % Konto  Verluste   Payout     Bust  Trades bis Ziel
     100   0.20%        20    99.9%     0.1%              115
     250   0.50%         8    93.3%     6.7%               42
     500   1.00%         4    75.3%    24.7%               15
   1,000   2.00%         2    55.8%    44.2%                4
```

Die Zahlen sind kein Simulationsrauschen, sondern die **exakte Lösung** eines
Random Walks mit zwei absorbierenden Rändern (Boden und Ziel), aufgestellt als
lineares Gleichungssystem in `propbot/riskmath.py`. Gegengeprüft wurde sie gegen
die klassische Gambler's-Ruin-Formel und gegen Monte Carlo.

Drei Dinge, die aus dieser Rechnung folgen und im Bot fest verdrahtet sind:

**a) Klein ist fast immer besser.** Der Erwartungswert je Trade ändert sich mit
der Positionsgröße nicht — das Ruinrisiko schon. Doppeltes Risiko halbiert
nicht die Zeit bis zum Ziel, aber es vervierfacht fast die Bust-Rate.

**b) Verlustserien sind normal, nicht die Ausnahme.** Bei 45 % Trefferquote und
200 Trades ist eine Serie von 6 Verlusten zu 93 % sicher, eine von 8 zu 53 %.
Bei 250 $ Risiko hält der Puffer genau 8 aus. Deshalb halbiert der Risk-Manager
die Größe nach zwei Verlusten in Folge: die Serie wird dadurch nicht kürzer,
aber billiger.

**c) Die Tageslimit-Falle.** Das ist ein Fund aus der eigenen Monte-Carlo-Simulation:

```
  Risiko  % Konto   Payout    Bust
     400   0.80%    73.4%   26.6%
     500   1.00%    22.2%   77.8%   <-- Ausreißer
     600   1.20%    67.1%   32.9%
```

Bei exakt 1,0 % Risiko treffen **zwei** Verluste das Tageslimit von 1.000 $ auf
den Cent genau. Der eigene Tagesstop (60 % des Limits) greift nach dem ersten
Verlust noch nicht, also wird ein zweiter Trade erlaubt — und der reißt das
Konto, obwohl der große Puffer noch halb voll ist. `propbot/reporting.py`
rechnet die sichere Obergrenze deshalb explizit aus: **495 $ je Trade** bei den
Standardeinstellungen.

---

## 2. Die Strategie

### Trend-Pullback (Hauptstrategie, `propbot/strategy/trend_pullback.py`)

*Im etablierten Trend auf einen Rücksetzer warten und erst einsteigen, wenn der
Trend die Kontrolle zurückholt.*

Ein Long-Signal braucht **alle fünf** Bedingungen:

1. **Trend** — Kurs über der EMA200, EMA20 > EMA50 > EMA200.
2. **Trendstärke** — ADX(14) über der Schwelle (Standard 20).
3. **Rücksetzer** — in den letzten 6 Kerzen war der RSI unter 45 *oder* der Kurs
   hat die EMA20 berührt.
4. **Auslöser** — die aktuelle Kerze schließt über dem Hoch der Vorkerze,
   bullisch, RSI zurück über 48. Ohne Auslöser kein Einstieg: fallende Messer
   fängt niemand.
5. **Bewegung** — ATR im Verhältnis zum Kurs über einer Mindestschwelle.

Der Stop liegt unter dem Rücksetzer-Tief minus 0,25 ATR, begrenzt auf einen
Korridor von 0,7 bis 3,5 ATR (zur Herkunft der 3,5 siehe Abschnitt 5). Das Ziel
ist 2 R. Short ist exakt gespiegelt.

**Warum genau das für dieses Konto?** Weil der Stop hinter einer Marktstruktur
liegt und nicht an einer runden Zahl — nur dann ist das Risiko je Trade vorher
exakt bekannt, und nur dann kann man Positionsgrößen rechnen. Und weil ein CRV
von 2 bereits bei 35 % Trefferquote (inkl. Kosten) über Wasser bleibt: das ist
der Puffer für schlechte Phasen.

### Range-Fade (`propbot/strategy/mean_reversion.py`)

Für Seitwärtsphasen: Kurs schießt aus dem Bollinger-Band, kommt zurück ins Band,
Ziel ist die Mittellinie, Stop hinter dem Extrem. Läuft nur bei ADX ≤ 20.
Sie ist bewusst sehr selektiv (auf 20.000 Testkerzen nur ~20 Signale) — ihr
Zweck ist, die Equity-Kurve in Phasen zu glätten, in denen die Trendstrategie
nur Stops einsammelt.

### Regime-Router (`propbot/strategy/router.py`)

Schickt jede Kerze zur passenden Strategie: ADX ≥ 23 → Trend, ADX ≤ 18 → Range,
**dazwischen gar nichts**. Die Lücke ist Absicht: im Übergangsbereich verlieren
beide Ansätze Geld, und „nicht handeln" ist auf einem Konto mit 2.000 $ Puffer
eine vollwertige Entscheidung.

### Handelszeiten

Standard 07:00–16:30 UTC (London + früher New York), neue Trades nur bis 15:30,
Sperrfenster 13:25–13:35 (US-Daten), freitags ab 15:00 kein Einstieg mehr, alles
flat um 20:45. Außerhalb der liquiden Zeit sind die Spreads breiter und die
Bewegungen dünner — schlecht bezahltes Risiko.

---

## 3. Risikomanagement: fünf Budgets, das kleinste gewinnt

Die Strategie sagt nur *ob* und *wohin*. Wie groß gehandelt wird, entscheidet
allein `propbot/risk.py`. Die Positionsgröße ist das Minimum aus:

| Budget | Standard | Warum |
| --- | --- | --- |
| Basisrisiko | 0,5 % = 250 $ | Grundgröße |
| Anteil am **Restpuffer** | 20 % | Ein Konto mit 300 $ Puffer darf keine 250 $ riskieren |
| Anteil am Tagesbudget | 50 % | Ein Tag darf nie alles kosten |
| Streak-Faktor | −30 % je Verlust ab dem zweiten, min. 40 % | Serien billiger machen |
| Payout-Schutz | ab 75 % Zielfortschritt bis auf 50 % herunter | Kurz vor dem Payout ist ein großer Trade das schlechteste Geschäft der Welt |

Dazu Sperren, die gar keinen Trade zulassen: max. 3 Trades/Tag, max. 2
Verluste/Tag, eigener Tagesstop bei 60 % des Tageslimits, Restpuffer leer,
Konsistenzregel für heute erfüllt.

**Der zweite Punkt ist der entscheidende Unterschied zu einem normalen Bot.** Auf
einem Prop-Konto ist nicht das Kapital die Grenze, sondern der Abstand zum Boden.

---

## 4. Das Regelwerk (`propbot/rules.py`)

Drei Drawdown-Modelle, weil jede Firma es anders macht:

| Modus | Boden | Typisch für |
| --- | --- | --- |
| `static` | fest bei 48.000 $ | viele FX-Firmen |
| `trailing_intraday` | folgt dem höchsten **Equity**-Stand (inkl. Buchgewinn) | Apex und andere Futures-Firmen |
| `trailing_eod` | folgt dem höchsten **Tagesschluss** | Topstep, Standard hier |

Bei den Trailing-Varianten friert der Boden ein, sobald er den Startkontostand
erreicht hat: ab einem Hoch von 52.000 $ kann das Konto nicht mehr unter
50.000 $ fallen.

Zwei Details, die im Betrieb den Unterschied machen:

* **Der Handelstag wechselt nicht um Mitternacht UTC**, sondern zur
  Broker-Rollover-Zeit (Standard 22:00 UTC). Ein Trade um 23:00 gehört bereits
  zum nächsten Tag — genau so rechnet die Firma ab.
* **Der Tageswechsel wird mit dem Stand vom Vortag abgeschlossen.** Wird zuerst
  der neue Kontostand gebucht, landet der erste Trade des neuen Tages noch im
  alten Tag und der Trailing-Boden hängt am falschen Wert. (Dieser Fehler war
  im ersten Entwurf drin und ist durch `test_bester_tag_anteil_ueber_mehrere_tage`
  aufgefallen.)

Dazu die **Konsistenzregel**: ein einzelner Tag darf höchstens 40 % des Gewinns
ausmachen. Während der Challenge wird sie gegen das *Gesamtziel* geprüft (sonst
wäre der erste Handelstag zwangsläufig 100 %), am Payout gegen den tatsächlichen
Gewinn.

---

## 5. Wie der Bot aus Fehlern lernt

Drei Ebenen, von langsam nach schnell (`propbot/learning.py`):

**Ebene 1 — Fehler-Label.** Jeder abgeschlossene Trade bekommt automatisch
Etiketten: `gewinn_verschenkt` (lag 1 R im Plus, ging bei null raus),
`knapper_stop`, `zu_weiter_stop`, `rachetrade` (Einstieg <45 min nach einem
Verlust), `overtrading`, `news_fenster`, `duenne_session`, `zeitstop`,
`grosser_verlust`, `gegen_den_trend`.

**Ebene 2 — Empfehlungen.** `python -m propbot lessons` verdichtet Label und
Statistik zu nachprüfbaren Sätzen, sortiert nach Geldwirkung:

```
=== Fehleranalyse ueber 85 Trades ===
Haeufigkeit der Muster:
    34x (40.0%)  stop_gekappt
     4x ( 4.7%)  rachetrade
     3x ( 3.5%)  knapper_stop
     2x ( 2.4%)  duenne_session

=== Empfehlungen (nach Wirkung sortiert) ===
[Stopabstand] 40% der Stops liegen an der ATR-Obergrenze - die Marktstruktur
lag weiter weg als erlaubt.
    -> max_stop_atr erhoehen oder pullback_bars verkleinern. Ein gekappter
       Stop sitzt im Rauschen statt hinter dem Ruecksetzer.
[Fehlermuster] Einstieg kurz nach einem Verlust - typisches Zurueckholen-Wollen.
    -> Wartezeit nach Verlusten erzwingen (cooldown_minutes).
```

**Ebene 3 — Sperren im laufenden Betrieb.** `AdaptiveStrategy` führt für jede
Kombination aus Setup, Session und ADX-Klasse eine laufende Statistik und
blockiert Kombinationen, deren Zahlen negativ sind. Entscheidend ist das
Kriterium: gesperrt wird erst, wenn die **obere** Vertrauensgrenze unter null
liegt — wenn also selbst die wohlwollende Lesart negativ ist.

> Der erste Entwurf sperrte bei der *unteren* Grenze. Ergebnis: Setups mit
> +0,22 R Mittelwert flogen raus, weil bei 25 Trades und 1,1 R Streuung die
> untere Grenze fast immer unter null liegt. Genau so schaltet man funktionierende
> Strategien ab. Zusätzlich bleibt eine Erkundungsquote von 10 %, damit eine
> Sperre sich auch wieder aufheben kann.

### Ein durchgezogenes Beispiel

So sieht der Kreis aus, wenn man ihn zu Ende geht — das ist die Änderung, die
aus der eigenen Fehleranalyse in den Code zurückgeflossen ist:

1. **Befund.** `propbot lessons` meldete: *„70 % der Stops liegen an der
   ATR-Obergrenze"*. Ein gekappter Stop liegt näher am Einstieg als das
   Rücksetzer-Tief — er sitzt also im Rauschen statt hinter der Struktur.
2. **Hypothese.** Die Obergrenze von 2,5 ATR ist zu eng gesetzt.
3. **Gegenprobe** über sechs unabhängige Datensätze (je 30.000 Kerzen):

   | max_stop_atr | Erwartungswert | Ziel erreicht | Anteil gekappt | Kosten je Trade |
   | --- | --- | --- | --- | --- |
   | 2,5 (alt) | +0,050 R | 3/6 | 69 % | 0,152 R |
   | 3,0 | +0,087 R | 4/6 | 54 % | 0,140 R |
   | **3,5 (neu)** | **+0,137 R** | **6/6** | 42 % | 0,131 R |
   | 4,0 | +0,125 R | 6/6 | 32 % | 0,130 R |
   | 5,0 | +0,125 R | 5/6 | 18 % | 0,129 R |
   | 8,0 | +0,117 R | 5/6 | 1 % | 0,126 R |

4. **Entscheidung.** Standard auf 3,5. Bewusst **nicht** auf den höchsten Wert
   der Tabelle: 3,5 bis 4,0 ist ein Plateau, und ein Plateau ist stabiler als
   eine Spitze. Wer den Maximalwert nimmt, optimiert das Rauschen mit.
5. **Nebenbefund**, der die Erklärung stützt: mit weiterem Stop sinken auch die
   Kosten je Trade (0,152 R → 0,131 R). Ein weiterer Stop heißt kleinere
   Position bei gleichem Risiko — und damit weniger Spread.

Der Fund steht als Kommentar mit Zahlen an der geänderten Zeile in
`propbot/strategy/trend_pullback.py`.

---

## 6. Warum den Backtest-Zahlen zu trauen ist (und wo nicht)

Ein Backtest, der optimistisch rechnet, kostet auf dem echten Konto genau einmal
Geld. Deshalb ist die Engine (`propbot/engine.py`) durchgehend pessimistisch:

* Signal am **Schluss** einer Kerze, Ausführung zur **Eröffnung der nächsten**.
* Die Positionsgröße wird erst beim **tatsächlichen Füllpreis** berechnet.
* Stop und Ziel in derselben Kerze → der **Stop** zählt.
* Eröffnung jenseits des Stops (Gap) → Füllung zur **Eröffnung**, nicht am Stop.
* Spread, Slippage und Kommission auf beiden Seiten.
* Für die Drawdown-Prüfung zählt der **schlechteste Punkt innerhalb der Kerze** —
  so wie die Firma auch auf den Tick schaut.

Dazu `check_no_lookahead()`: für zufällige Kerzen wird jedes Signal einmal auf
dem vollen und einmal auf dem abgeschnittenen Datensatz berechnet. Unterscheiden
sich die Ergebnisse, schaut die Strategie in die Zukunft. Der Test läuft in der
Testsuite mit und ist über `--check-lookahead` auch im CLI abrufbar.

**Was die Kosten wirklich fressen:** bei 15 Pips Stopabstand und 250 $ Risiko
handelst du 1,59 Lot — Spread und Slippage kosten dann 0,20 R **je Trade**. Das
ist der Grund, warum der Bot lieber wenige Trades mit größerem Stopabstand
macht. Der Report weist die Gesamtkosten separat aus (nicht nur die Kommission,
wie es die meisten Backtester tun).

---

## 7. Ergebnisse — und wie sie zu lesen sind

Alle folgenden Zahlen stammen aus **synthetischen** Daten (`propbot/data.py`:
Regimewechsel zwischen Trend und Seitwärts, Session-Volatilität, Wochenenden,
Montags-Gaps). Sie testen die **Mechanik**, sie beweisen **keinen Edge** — der
Generator enthält per Konstruktion Trends, und die Strategie ist darauf gebaut,
Trends abzugreifen. Für eine Aussage über die Strategie brauchst du echte
Kursdaten deines Brokers (`--data deine_daten.csv`).

Acht unabhängige Läufe über je 40.000 M15-Kerzen (~1,7 Jahre), EURUSD-Kosten,
Standardeinstellungen inklusive Lernschicht:

| Seed | Ergebnis | Trades | EW je Trade | max. DD | Trefferquote |
| --- | --- | --- | --- | --- | --- |
| 1 | **Ziel erreicht** | 170 | +0,166 R | 1.573 $ | 54,1 % |
| 2 | **Ziel erreicht** | 49 | +0,390 R | 746 $ | 65,3 % |
| 3 | **Ziel erreicht** | 208 | +0,092 R | 2.177 $ | 54,8 % |
| 4 | **Ziel erreicht** | 155 | +0,181 R | 1.758 $ | 58,1 % |
| 5 | **Ziel erreicht** | 163 | +0,177 R | 1.410 $ | 54,6 % |
| 6 | **Ziel erreicht** | 94 | +0,244 R | 1.139 $ | 58,5 % |
| 7 | läuft (−1.645 $) | 62 | −0,186 R | 2.227 $ | 43,5 % |
| 8 | **Ziel erreicht** | 34 | +0,544 R | 514 $ | 76,5 % |

Drei Beobachtungen, die wichtiger sind als die Trefferquoten:

**Kein einziger Lauf hat das Konto gerissen.** Das ist die Aufgabe des
Risk-Managers, nicht der Strategie. Lauf 7 endet nach 62 Trades im Minus — aber
er endet nicht mit einem Bust, sondern damit, dass der Bot mangels Puffer
aufhört zu handeln.

**Ein Drawdown nahe oder über 2.000 $ ist kein Widerspruch.** Sobald der
Trailing-Boden bei 50.000 $ eingefroren ist, kann die Equity vom Hoch mehr als
2.000 $ fallen, ohne den Boden zu berühren — Lauf 3 hat 2.177 $ Rückgang vom
Hoch und trotzdem keinen Verstoß.

**Die Streuung ist riesig.** 34 bis 208 Trades bis zum selben Ziel, und derselbe
Bot, der auf sieben Datensätzen ans Ziel kommt, bleibt auf dem achten stecken.
Wer aus einem einzelnen Backtest eine Erwartung ableitet, täuscht sich selbst.
Deshalb:

Monte-Carlo über alle 935 Trades zusammen (Block-Bootstrap, Blockgröße 5,
3.000 Durchläufe, volles Regelwerk aktiv):

```
Payout 87,9 % | Bust 0,0 % | festgefahren 12,0 % | Median 101 Trades / 51 Tage
Endstand p05/p50/p95: 49.037 / 54.054 / 54.152 $
```

Der interessante Wert ist **„festgefahren": 12,0 %.** Das ist die typische
Todesart dieses Systems — es sprengt das Konto nicht, es läuft leer. Ein Konto
mit 150 $ Restpuffer ist formal am Leben, praktisch aber tot, weil der
Risk-Manager keinen Trade mehr freigibt. Ein Backtest, der das als „läuft noch"
verbucht, lügt; hier steht es als eigene Kategorie in der Statistik.

### Der ernüchternde Teil: Walk-Forward

`python -m propbot walkforward` optimiert auf Block *n* und handelt auf Block
*n+1*. Ergebnis über 60.000 Kerzen und 54 Parameterkombinationen:

```
Fold 1: IS +0.142 R -> OOS -0.104 R | 112 Trades | -1,364 $
Fold 2: IS +0.061 R -> OOS +0.063 R |  97 Trades |   +233 $
Fold 3: IS +0.207 R -> OOS +0.228 R |  68 Trades | +4,013 $
Fold 4: IS +0.204 R -> OOS +0.007 R | 125 Trades |   -636 $
Mittel: In-Sample +0.154 R, Out-of-Sample +0.049 R (Degradation 32 %)
Urteil: brauchbar, aber ein grosser Teil war Anpassung. Weniger Parameter testen.
```

Von 0,154 R In-Sample-Vorteil bleiben 0,049 R übrig — und ein Fenster ist klar
negativ. **Genau das ist der Grund, warum die Standardparameter im Code runde,
gewöhnliche Werte sind (EMA 20/50/200, ADX 20, CRV 2,0) und nicht die Gewinner
einer Gittersuche.** Ein Werkzeug, das dir sagt „deine Optimierung war zum
großen Teil Selbstbetrug", ist mehr wert als eines, das eine schöne Kurve zeigt.

Derselbe Lauf zeigt über alle Testabschnitte zusammen (402 Trades) ein Muster,
das auf echten Daten eine Entscheidung verlangen würde: Longs +0,150 R, Shorts
−0,121 R. Dann wäre `allow_short=False` der nächste Test. Im synthetischen Markt
ist es dagegen vermutlich ein Artefakt des Generators (multiplikative
Kursbildung bevorzugt Aufwärtsbewegungen) — deshalb bleibt der Standard hier
unverändert. Genau diese Unterscheidung kann dir kein Backtest abnehmen.

---

## 8. Vom Test zum echten Konto

Die Reihenfolge ist nicht verhandelbar:

1. **Echte Daten besorgen.** M15-Export deines Brokers als CSV, mindestens 2–3
   Jahre. `python -m propbot backtest --data eurusd_m15.csv --check-lookahead`
2. **Walk-Forward laufen lassen.** Bleibt out-of-sample nichts übrig, hört es
   hier auf — kein Live-Handel gegen eine Strategie ohne Edge.
3. **Monte Carlo.** Liegt die Payout-Wahrscheinlichkeit unter 60 %, ist die
   Challenge ein teurer Lottoschein.
4. **Papierhandel.** `python -m propbot paper --data ... ` spielt die komplette
   Live-Logik ab: Regelprüfung, Ordergröße, Stop-Nachführung, Journal.
5. **Demokonto der Firma, Dry-Run.** `python -m propbot live` (Standard: es wird
   nur geloggt, was der Bot tun würde).
6. **Demokonto, echte Orders.** `python -m propbot live --real`
7. **Erst dann die Challenge.** `--real --i-know-what-i-do`

Zwei Sicherungen sind fest eingebaut: `dry_run` ist Standard, und der Zustand
(vor allem der Trailing-Boden und die Tageszähler) liegt in einer JSON-Datei.
Ein Neustart mitten am Handelstag setzt das Tageslimit **nicht** zurück — sonst
wäre der wichtigste Schutz nach jedem Absturz weg.

Der MT5-Adapter (`propbot/broker/mt5.py`) ist der einzige Teil, den die Tests
nicht abdecken können: er braucht ein laufendes Terminal. Symbolnamen,
Lotgrößen, Stop-Level und Filling-Modus unterscheiden sich je Broker — das
gehört auf ein Demokonto derselben Firma, bevor Geld daran hängt.

---

## 9. Befehle

| Befehl | Zweck |
| --- | --- |
| `math` | Rechenbericht: Risikotabellen, Serien, Kosten, Tageslimit-Falle |
| `backtest` | Strategie durch Daten laufen lassen (`--journal`, `--check-lookahead`) |
| `montecarlo` | Payout-/Bust-Wahrscheinlichkeit unter vollem Regelwerk |
| `walkforward` | Parameter suchen und ehrlich out-of-sample prüfen |
| `lessons` | Fehler-Label, Empfehlungen, Gedächtnis der Lernschicht |
| `paper` | Live-Logik gegen den Papier-Broker abspielen |
| `live` | MetaTrader 5 (Dry-Run, bis man es bewusst abschaltet) |
| `journal` | Auswertung nach Setup, Session, ADX-Klasse und Fehler-Label |
| `fetch` | Echte Kursdaten von Dukascopy laden (Minutenkerzen, 5 Jahre ≈ 25 MB) |
| `validate` | Kursdaten gegen echte Futuresdaten prüfen (Korrelation, Tracking Error) |

Globale Optionen gehen vor **und** nach dem Befehl:

```bash
python -m propbot --balance 100000 --target 8000 --drawdown 4000 math
python -m propbot backtest --dd-mode static --risk-pct 0.003 --no-adaptive
python -m propbot --symbol XAUUSD backtest --data gold_m15.csv
```

Konfiguration wahlweise über JSON (`--config`) oder Umgebungsvariablen
(`PROPBOT_RULES_MAX_DRAWDOWN=2500`, siehe `.env.example`).

---

## 10. Aufbau

```
propbot/
  rules.py         Prop-Firm-Regelwerk: Drawdown-Modi, Tageslimit, Konsistenz, Payout
  riskmath.py      Erwartungswert, Kelly, Ruinwahrscheinlichkeit (exakt gelöst)
  risk.py          Positionsgröße und Handelsfreigabe (fünf Budgets)
  reporting.py     Rechenberichte im Klartext
  indicators.py    EMA, ATR, RSI, ADX, Bollinger, Donchian - alle kausal
  strategy/        trend_pullback, mean_reversion, opening_range, router,
                   Handelszeitfenster mit Zeitzone
  engine.py        Backtest mit pessimistischer Ausführung + Lookahead-Prüfung
  metrics.py       Kennzahlen, die auf einem Prop-Konto zählen
  montecarlo.py    Bootstrap der Trades durch das echte Regelwerk
  optimize.py      Gittersuche und Walk-Forward
  learning.py      Fehler-Label, Empfehlungen, lernende Sperren
  journal.py       SQLite-Handelstagebuch (Backtest und Live im selben Format)
  live.py          Live-Loop mit Zustandssicherung
  broker/          Schnittstelle, Papier-Broker, MetaTrader 5
  data.py          CSV-Loader und synthetischer Marktgenerator
  dukascopy.py     Download echter Minutenkerzen (NQ, ES, FX, Gold)
  validate.py      Quellenvergleich gegen echte Futuresdaten
  config.py        JSON + Umgebungsvariablen
  cli.py           Kommandozeile
```

229 Tests (`python -m pytest tests/propbot -q`, rund 30 Sekunden). Sie prüfen
unter anderem die Ruinformel gegen Brute-Force-Abzählung, die Indikatoren gegen
abgeschnittene Datensätze, jede Ausführungsregel der Engine einzeln und dass ein
Regelverstoß wirklich jeden weiteren Trade verhindert.

---

## 11. Was der Bot nicht kann

Ehrlichkeit gehört zu einem Handelssystem:

* **Er findet keinen Edge, den es nicht gibt.** Auf synthetischen Daten zeigt der
  Walk-Forward 15 % Degradation. Auf echten Daten kann es schlechter aussehen.
* **Ein Symbol, eine Position.** Kein Portfolio, keine Korrelationsrechnung
  zwischen gleichzeitig offenen Trades.
* **Kein Nachrichtenkalender.** Sperrfenster sind feste Uhrzeiten, keine echten
  Termine. Für NFP-Wochen gehört das per Hand angepasst.
* **Der MT5-Adapter ist ungetestet ohne Terminal** (siehe Abschnitt 8).
* **Slippage ist ein fester Wert**, kein Modell. In echten Nachrichtenlagen ist
  sie größer — genau deshalb sind die Sperrfenster da.
* **Backtests kennen keine Requotes, keine Serverausfälle und keinen Menschen,
  der nachts den Stop verschiebt.**

---

## 12. Praxistest: NQ über fünf Jahre echter Daten

Alles bis hierher war Mechanik. Dieses Kapitel ist der eigentliche Test — und
er fällt negativ aus. Das steht hier so ausführlich, weil ein negatives
Ergebnis, sauber gemessen, mehr wert ist als eine schöne Kurve.

### Die Daten

| | |
| --- | --- |
| Quelle | Dukascopy, Minutenkerzen des Nasdaq-100 (`propbot fetch`) |
| Zeitraum | 01.09.2021 – 28.08.2026 (5 Jahre) |
| Umfang | 2.223.360 Minutenkerzen → 33.436 M15-Kerzen in der Kernhandelszeit |
| Handelstage | 1.286 |
| Instrument im Test | **MNQ** (Micro, 2 $/Punkt), Kommission 1,34 $ Round Turn |

**Warum nicht NQ selbst?** Ein voller NQ-Kontrakt ist 20 $ je Indexpunkt wert.
Der typische Stop dieser Strategie liegt bei 121 Punkten — das sind **2.420 $
Risiko für einen einzigen Kontrakt**, mehr als der gesamte Drawdown-Puffer. Auf
einem 50k-Konto mit 2.000 $ Puffer ist NQ nicht handelbar, MNQ ist die einzige
sinnvolle Größe. Der Risk-Manager lehnt NQ-Orders von sich aus ab; ein Test
dafür steht in `tests/propbot/test_sessions.py`.

### Taugen die Daten?

Dukascopy liefert einen CFD auf den Index, gehandelt wird der CME-Future. Die
Gegenprobe gegen echte NQ-Futuresdaten (Yahoo, `propbot validate`):

| Zeitfenster | Korrelation der Renditen | Tracking Error |
| --- | --- | --- |
| **Kernhandelszeit 09:30–16:00 NY** | **0,9995** | 0,5 bp je Kerze |
| nach dem Kassaschluss | 0,9209 | 3,6 bp |
| alle Stunden | 0,9818 | 2,0 bp |

Der Befund hat die Testanlage geändert: **nach dem US-Schluss stehen die
CFD-Kurse still**, während der Future weiterläuft (1,3 % aller Kerzen, keine
davon in der Kernzeit). Für die Kernhandelszeit sind beide Quellen praktisch
identisch — also wird nur dort gehandelt *und* nur dort werden die Indikatoren
gerechnet. Der Preisunterschied von rund +55 Punkten (Future über Index) ist
die normale Finanzierungsprämie und für Renditen bedeutungslos.

### Ein Fehler, den erst echte Daten zeigten

Im ersten Lauf betrug die durchschnittliche Haltedauer **897 Minuten** — bei
einer Strategie, die abends flach sein soll. Ursache: Die Flat-Regel verglich
den *Beginn* der Kerze mit der Schlusszeit. Bei einem Datensatz, der nur die
Kernhandelszeit enthält, beginnt die letzte Kerze um 15:45 und die Regel
(15:50) löste nie aus — die Position lief über Nacht weiter. Auf synthetischen
24-Stunden-Daten war das nie aufgefallen.

Behoben: geprüft wird jetzt das **Ende** der Kerze, dessen Länge die Engine aus
dem Zeitindex ableitet. Zwei Regressionstests halten es fest.

### Das Ergebnis

Trend-Pullback, Standardparameter, 5 Jahre, MNQ, Kernhandelszeit:

```
Trades:            112 in 99 Handelstagen
Trefferquote:      42,9 %
Erwartungswert:    -0,041 R je Trade
Endstand:          49.338 $  (-662 $)
Max. Drawdown:     1.798 $ (Puffer 2.000 $)
Kosten:            0,023 R je Trade (2,0 % der Bruttobewegung)
```

Nur 112 Trades in fünf Jahren — der Grund ist die zweite große Erkenntnis:

> **1.241 von 1.795 Signalen (69 %) wurden abgelehnt, weil schon ein einziger
> MNQ-Kontrakt mehr riskiert hätte als das Budget erlaubt.**

Der Median-Stop von 121 Punkten entspricht 242 $ Risiko je Kontrakt — bei 250 $
Budget. Die Positionsgröße ist auf ganze Kontrakte gerastert, also gibt es
zwischen „ein Kontrakt" und „gar nicht" nichts. Auf einem 50k-Konto ist die
Kontraktgröße von MNQ die eigentliche Grenze, nicht die Strategie.

### Es liegt nicht an den Parametern

24 Kombinationen aus Stopweite, Chance-Risiko-Verhältnis und ADX-Schwelle,
gerechnet über die vollen fünf Jahre ohne vorzeitigen Payout-Stopp:

| max_stop_atr | CRV | ADX | Trades | Erwartungswert |
| --- | --- | --- | --- | --- |
| 1,5 | 1,5 | 26 | 161 | −0,014 R |
| 1,5 | 2,0 | 26 | 177 | −0,016 R |
| 1,5 | 1,5 | 22 | 223 | −0,024 R |
| 2,0 | 1,5 | 22 | 128 | −0,098 R |
| 3,5 | 2,0 | 22 | 121 | +0,046 R |

**Keine einzige Kombination mit brauchbarer Stichprobe kommt über null.** Die
zwei leicht positiven Werte stehen bei rund 120 Trades — das ist Rauschen, kein
Vorteil.

Auch die anderen Stellschrauben helfen nicht:

| Variante | Trades | Erwartungswert |
| --- | --- | --- |
| M5 statt M15 | 1.063 | +0,012 R |
| M30 | 14 | +0,018 R |
| H1 | 14 | −0,107 R |
| nur Long (M15) | 97 | −0,089 R |
| Range-Fade (M15) | 27 | −0,145 R |

Zum Vergleich: NQ selbst stieg im Zeitraum um **+87 %**.

### Der ehrliche Schlussstrich: Walk-Forward und Monte Carlo

M5 ist der einzige Zeitrahmen mit belastbarer Stichprobe. Walk-Forward über
vier Fenster, Gitter aus 12 Kombinationen:

```
Fold 1: IS +0.224 R -> OOS +0.059 R | 201 Trades | +1,057 $
Fold 2: IS +0.068 R -> OOS +0.005 R | 176 Trades | -1,492 $
Fold 3: IS +0.007 R -> OOS -0.022 R | 102 Trades |   +578 $
Fold 4: IS +0.016 R -> OOS -0.016 R | 110 Trades | -1,079 $
Mittel: In-Sample +0.079 R, Out-of-Sample +0.007 R (Degradation 8 %)
```

Über alle Testabschnitte zusammen: 589 Trades, Profitfaktor 0,98, −936 $.

Und was das für die Challenge bedeutet — Monte Carlo mit dem echten Regelwerk
(4.000 $ Ziel, 2.000 $ Drawdown, 1.000 $ Tageslimit):

```
Payout 26,1 % | Bust 0,0 % | festgefahren 73,7 %
Endstand p05/p50/p95: 48.088 / 49.597 / 54.134 $
Urteil: Finger weg - mit diesen Zahlen ist die Challenge ein Lottoschein.
```

### Was fehlt, in einer Zahl

Für eine Payout-Wahrscheinlichkeit über 80 % braucht es bei 250 $ Risiko rund
**+0,15 R je Trade**. Geliefert werden **+0,015 R** — Faktor zehn. Das ist keine
Lücke, die man mit Parametern schließt.

### Was daraus folgt

1. **Diese Strategie gehört nicht auf ein NQ-Prop-Konto.** Nicht mit anderen
   Parametern, nicht mit anderem Zeitrahmen.
2. **Der Trend-Pullback ist für NQ die falsche Familie.** Er wartet auf einen
   Rücksetzer im laufenden Trend — NQ intraday dreht schneller, als der
   Momentum-Trigger bestätigt. Erfolgversprechender wären Ansätze, die zur
   Struktur des Index-Futures passen: Opening-Range-Breakout der ersten 15–30
   Minuten, VWAP-Rückkehr, oder Tagesschluss-Ausbrüche über das Vortageshoch.
3. **Die Kontraktgröße muss in die Strategie einfließen.** Solange ein
   MNQ-Kontrakt fast das gesamte Risikobudget frisst, muss der Stop zur
   Kontraktgröße passen, nicht umgekehrt — sonst hebelt die Rasterung 69 % der
   Signale weg.
4. **Was funktioniert hat, ist das Regelwerk drumherum.** In keinem einzigen
   Lauf über fünf Jahre wurde das Konto gerissen: kein Drawdown-Verstoß, kein
   Tageslimit-Verstoß. Der Bot verliert nicht das Konto, er verdient nur nichts.

---

## 13. Zweiter Anlauf: Opening-Range-Breakout auf NQ

Nach dem negativen Befund aus Kapitel 12 wurde eine Strategie gebaut, die zur
Struktur des Handelstags passt statt zu einem Indikatorbild.

### Die Idee

In den ersten Minuten nach der Eröffnung treffen die über Nacht aufgelaufenen
Orders aufeinander. Die Spanne, die dabei entsteht — die *Opening Range* — ist
die Zone, auf die sich beide Seiten geeinigt haben. Verlässt der Kurs sie, hat
eine Seite gewonnen.

Drei Gründe, warum das auf einem Prop-Konto besser funktioniert als der
Trend-Pullback:

1. **Der Zeitpunkt ist definiert, nicht der Zustand.** Täglich zur selben Zeit,
   an einer klar bestimmten Marke.
2. **Das Risiko steht vorher fest.** Die Spanne *ist* der Stop. Schon um 09:45
   weiß der Bot, ob der Trade ins Budget passt — beim Trend-Pullback ergab sich
   der Stopabstand erst aus dem Rücksetzer und sprengte in 69 % der Fälle das
   Budget.
3. **Eine klare Gelegenheit pro Tag** statt Dutzender Zufallstreffer.

### Zwei Fehler, die dabei aufflogen

**Das Sperrfenster blockierte das erste handelbare Signal.** Der Blackout
09:30–09:45 war an beiden Enden einschließend — die Kerze, die *um* 09:45
beginnt und den Ausbruch aus einer 15-Minuten-Spanne bringt, fiel also noch
hinein. Ende ist jetzt exklusiv.

**Die Streak-Bremse fraß sich fest.** Nach zwei Verlusten in Folge senkt der
Risk-Manager das Budget, und Erholung gab es nur nach zwei Gewinnen. Auf NQ
passte bei 100 $ Budget aber kein einziger Trade mehr hinein — also gab es keine
Gewinne, also blieb die Bremse für immer unten. Über fünf Jahre hat das **zwei
Drittel aller Trades verschluckt** (257 statt 648) und ab 2026 gar nichts mehr
zugelassen. Ein Handelstag ohne Verlust holt jetzt einen Schritt zurück
(`recovery_days`).

Das war zugleich eine Lehre über Statistik: die kaputte Bremse *verbesserte* den
Erwartungswert scheinbar von +0,079 auf +0,168 R — sie ließ zufällig nur einen
Teil der Trades durch. Wer nur auf die Kennzahl schaut, hält so einen Fehler für
eine Verbesserung.

### Ergebnis über fünf Jahre

Beide Richtungen, 15-Minuten-Spanne, Stop an der Gegenseite, CRV 2:

| Jahr | NQ | Trades | Erwartungswert | Trefferquote |
| --- | --- | --- | --- | --- |
| 2021 | +4,6 % | 57 | −0,020 R | 50,9 % |
| 2022 | **−33,7 %** | 101 | +0,173 R | 56,4 % |
| 2023 | +53,6 % | 197 | +0,069 R | 52,8 % |
| 2024 | +24,9 % | 154 | +0,060 R | 49,4 % |
| 2025 | +20,0 % | 109 | +0,095 R | 54,1 % |
| 2026 | +16,6 % | 30 | +0,062 R | 53,3 % |
| **gesamt** | | **648** | **+0,079 R** | 52,9 % |

Die Shorts sind der schwache Teil (+0,130 R Long gegen −0,016 R Short über die
Testabschnitte). Nur Long gehandelt:

| Jahr | Trades | Erwartungswert | Trefferquote |
| --- | --- | --- | --- |
| 2021 | 31 | +0,068 R | 48,4 % |
| 2022 (NQ −33,7 %) | 59 | **+0,096 R** | 55,9 % |
| 2023 | 125 | +0,192 R | 60,0 % |
| 2024 | 105 | +0,116 R | 52,4 % |
| 2025 | 77 | +0,027 R | 53,2 % |
| 2026 | 19 | +0,155 R | 57,9 % |
| **gesamt** | **416** | **+0,118 R** | 55,0 % |

**Der wichtigste Wert steht in Zeile zwei.** Long-only auf einem Index, der im
Zeitraum um 87 % gestiegen ist, riecht nach Aufwärtsdrift. Aber 2022, als NQ um
ein Drittel fiel, verdiente die Long-Variante trotzdem +0,096 R. Der Bot ist
jeden Abend flach und greift nur die Intraday-Bewegung ab — die läuft auch im
Bärenmarkt oft nach oben.

### Walk-Forward (nur Long)

```
Fold 1: Test 2022-08-31 bis 2023-09-08 | IS +0.289 R -> OOS +0.209 R | 101 Trades | +3,409 $
Fold 2: Test 2023-09-08 bis 2024-09-04 | IS +0.238 R -> OOS +0.092 R | 104 Trades | +1,415 $
Fold 3: Test 2024-09-04 bis 2025-09-03 | IS +0.113 R -> OOS +0.181 R |  84 Trades | +2,890 $
Fold 4: Test 2025-09-03 bis 2026-08-28 | IS +0.181 R -> OOS +0.061 R |  41 Trades |   +432 $
Mittel: In-Sample +0.205 R, Out-of-Sample +0.136 R (Degradation 66 %)
```

**Alle vier Fenster out-of-sample positiv**, zusammen 330 Trades mit +0,147 R,
Profitfaktor 1,37, Trefferquote 56,7 %. Zum Vergleich: der Trend-Pullback kam
out-of-sample auf +0,007 R.

### Was das fürs Konto heißt

Monte Carlo mit dem echten Regelwerk (4.000 $ Ziel, 2.000 $ Drawdown,
1.000 $ Tageslimit, adaptive Positionsgröße):

| Variante | Payout | festgefahren | Bust |
| --- | --- | --- | --- |
| nur Long, CRV 1,5 | **89,8 %** | 10,2 % | 0,0 % |
| nur Long, CRV 2,0 | 84,2 % | 15,8 % | 0,0 % |
| nur Long, CRV 2,5 | 82,3 % | 17,7 % | 0,0 % |
| beide Richtungen | 60,7 % | 39,3 % | 0,0 % |
| Trend-Pullback (Kapitel 12) | 26,1 % | 73,7 % | 0,0 % |

Die drei CRV-Werte liegen dicht beieinander — ein Plateau, kein Einzeltreffer.
Gewählt wird 1,5, weil auch der Walk-Forward diesen Wert am häufigsten
ausgesucht hat.

Der historische Einzelpfad mit echten Kontoregeln erreicht das Ziel: 233 Trades,
+0,110 R, Endstand 54.012 $, größter Rückgang 1.262 $ von 2.000 $ Puffer.

### Fertige Konfiguration

```bash
python -m propbot backtest --config configs/nq_opening_range.json
python -m propbot montecarlo --config configs/nq_opening_range.json
python -m propbot paper --config configs/nq_opening_range.json
```

### Payout-Zyklen: die Sicht des Prop-Traders

Ein Backtest endet beim Ziel. Auf einem echten Konto wird ausgezahlt, das Konto
läuft weiter, und die Frage lautet: **wie oft im Zeitraum?** Dafür wird das
Konto nach jedem Payout auf 50.000 $ zurückgesetzt:

| Zyklus | Zeitraum | Dauer | Trades | Ergebnis | max. Rückgang |
| --- | --- | --- | --- | --- | --- |
| 1 | 09/2021 – 06/2024 | 1.007 Tage | 233 | **Payout +4.012 $** | 1.262 $ |
| 2 | 06/2024 – 07/2025 | 381 Tage | 80 | **Payout +4.007 $** | 799 $ |
| 3 | 07/2025 – 08/2026 | 402 Tage | 54 | läuft (+334 $) | 1.204 $ |

**Zwei Payouts in fünf Jahren, kein einziges gerissenes Konto.** Das sind rund
1.600 $ Auszahlung pro Jahr — ehrlich gesagt wenig für den Aufwand, und
deutlich langsamer als die Monte-Carlo-Verteilung nahelegt (Median ~130
Handelstage). Der Unterschied hat einen klaren Grund: die Simulation zieht
Trades unabhängig und nimmt einen Trade pro Tag an, in Wirklichkeit gibt es nur
an 32 % der Tage einen handelbaren Ausbruch.

### Mehr Risiko macht es schlechter, nicht schneller

Der naheliegende Hebel wäre eine größere Position. Er funktioniert nicht:

| Risiko je Trade | Payouts in 5 J. | Busts | Tage je Payout | Trades |
| --- | --- | --- | --- | --- |
| 0,4 % (200 $) | 1 | 0 | 1.130 | — |
| **0,5 % (250 $)** | **2** | **0** | **694** | **233** |
| 0,6 % (300 $) | 0 | 0 | — | — |
| 0,8 % (400 $) | 0 | 0 | — | 78 |
| 1,0 % (500 $) | 0 | 0 | — | — |

Der Grund ist eine Rückkopplung, die erst im Zusammenspiel aller drei Ebenen
entsteht:

1. Größere Positionen erzeugen früh einen tieferen Rückgang (1.771 $ statt
   1.262 $ bei 0,8 %).
2. Der Risk-Manager bemisst das Budget am **Restpuffer** — nach dem Rückgang
   sind 20 % davon nur noch 211 $, also *weniger* als das Basisrisiko bei
   0,5 %.
3. Bei diesem Budget passt fast kein MNQ-Kontrakt mehr hinein: 669 von 749
   Signalen fallen aus, der Erwartungswert dreht auf −0,050 R, und das Konto
   steht still.

Das Konto stirbt also nicht am Bust, sondern an der Drosselung — genau der
Zustand, den die Monte-Carlo-Simulation als „festgefahren" ausweist. Auf diesem
Konto ist 0,5 % Risiko nicht nur sicherer, sondern auch **produktiver**.

### Was weiter offen ist

* **42 % der Signale fallen weiterhin an der Kontraktgröße aus.** Ein MNQ ist
  für ein 50k-Konto grob gerastert; je höher NQ steigt, desto schlimmer wird es.
  Der Backtest weist das jetzt als Hinweis aus.
* **Der Edge ist real, aber klein** (+0,13 R). Im historischen Pfad dauerte der
  Weg zum Payout rund 21 Monate. Die Monte-Carlo-Verteilung ist optimistischer
  (Median ~130 Handelstage), weil sie die Signalausfälle in volatilen Phasen
  nicht abbildet.
* **Fünf Jahre sind eine Marktepoche**, kein Beweis. Ein Crash-Jahr wie 2008
  steckt nicht in den Daten.
* **Nächster Schritt bleibt das Demokonto**: Papierhandel, dann Dry-Run am
  echten Broker, dann kleine echte Orders — die Kette aus Abschnitt 8.
