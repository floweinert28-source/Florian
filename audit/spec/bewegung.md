# Zielspezifikation „Bewegung und Übergänge“

Leitung: Themengruppe Bewegung. Grundlage: 22 bestätigte Befunde aus `audit/spec-input/bewegung.json`, darin aufgegangen bewegung-3, -6, -19, -37, -42, referenz-24 und bereich_shell-19. Dazu kommen BRIEF.md, `web/README.md` (Abschnitt „Bewegung und Übergänge“ Z. 327–367, Z. 43–44, 203–210, 224), der Code und die Screenshots `shots/extra/motion-dash-enter-strip.png` und `shots/extra-dark-1440/dashboard_bearbeiten.png`.

Zeilenangaben beziehen sich auf den heutigen Stand (app.css 3144 Zeilen, nachgeprüft am 13.10.). Bei der Umsetzung verschieben sie sich. Maßgeblich ist darum immer der genannte Selektor bzw. die genannte Funktion.

Abgedeckte Befunde: bewegung-1, -9, -17, -18, -20, -21, -22, -26, -27, -28, -33, -34, -40, komponenten-13, bereich_statistik-29, bereich_dashboard-9, bereich_dashboard-12 (Fehlerbehebung; die vollständige Entfernung steht unter Nutzer fragen), barrierefreiheit-44, bereich_prop-50, bereich_einstellungen-42, bereich_trades_tag-49.
Nur unter „Nutzer fragen“: bewegung-15.

---

## 1. Zielzustand

### 1.1 Skala (Tokens in `:root`)

| Token | Wert | Wofür (verbindlich) |
|---|---|---|
| `--dur-1` | 150ms | Farbwechsel bei Hover und Fokus, Schließen jeder Ebene, Öffnen von Popover, Menüs und Filter-Fenster, kurzes Einblenden beim Reiterwechsel |
| `--dur-2` | 240ms | Zustandswechsel mit Bewegung (Schalter, Long/Short-Schieber), Seitenüberblendung, Abdunkler einblenden, Schrittwechsel im Ruhepunkt, Endpunkt-Aufspringen im Diagramm |
| `--dur-3` | 380ms | Größere Flächen: Seitenpanel hereingleiten, Einblenden beim Reinscrollen, Diagramm-Fläche und Balken, Bild nach dem Laden |
| `--dur-4` **(neu)** | 640ms | Nur für den Einzug von Linien, Score-Skala und Ringen beim echten Seitenwechsel |
| `--stagger` **(neu)** | 40ms | Jede Staffelung in CSS und JS (Reinscrollen, Konfidenz-Balken, Ruhepunkt-Schritt) |
| `--ease` | cubic-bezier(.2, .8, .2, 1) | Alles, was ausläuft oder erscheint |
| `--ease-in` | cubic-bezier(.4, 0, 1, 1) | Alles, was schließt oder verschwindet |
| `--ease-io` | cubic-bezier(.4, 0, .2, 1) | Schieber, die hin- und hergleiten (Long/Short, Wackeln bei fehlender Richtung) |
| `--ease-sym` **(neu)** | cubic-bezier(.45, 0, .55, 1) | Symmetrische Schleifen und Atemtakt: Skelett-Glanz, Kurslinie, Tipp-Punkte, Atem-Kugel |

**T1 – Dauern:** Jede Dauer und jede Verzögerung in `transition`/`animation` ist ein Token oder ein `calc()` aus einem Token. Abgestimmte Sonderwerte werden als `calc()` ausgedrückt, damit sie gleich bleiben und trotzdem mit abschalten: Schalter-Knopf und Long/Short-Wackeln `calc(var(--dur-2) * 4 / 3)` = 320 ms, Knopf-Druck `calc(var(--dur-1) * .4)` = 60 ms.
Abschließende Ausnahmeliste mit festen Zeiten: Endlos-Animationen (`infinite`, inkl. ihrer Verzögerungen: Serie `.dstreak*`, Kerzen `.pg-candles`, Tipp-Punkte `.msg.typing`, Ruhepunkt-Symbole), der Ruhepunkt-Raum (`calm-content` 900 ms, `.rp-ambient` 1600 ms, Blüten, `var(--dur, 1s)` im Atemtakt), das Start-Skelett `.boot` (.5s), die Grabstein-Drehung `.pg-inner` (.75s), die Aufnahme-Uhr `.voice-clock .prog` (.2s linear).

**T2 – Kurven:** Rohe `cubic-bezier()` gibt es nur noch in `:root` (vier Tokens), in `--sw-ease` (Nachfedern des Schalters, README Z. 224) und in `sakura-fall` (Fallkurve der Blüten). Schlüsselwörter (`ease`, `ease-out`, `ease-in-out`) bleiben nur in Endlos-Animationen, in `.rp-ambient` und als Rückfallwert in `.boot`. `linear` bleibt für Drehung, Fortschritt und die Farbüberblendung `--dir-c`.

### 1.2 Darüberfahren (Hover)

**H1:** Beim Darüberfahren bewegt sich nichts. Kein `transform`, kein Schatten, der dazukommt, kein Zoom, kein Versatz. Die Rückmeldung kommt nur über Farbe: Rand, Fläche, Textfarbe oder einen feinen Umriss.
**H2:** Druck-Rückmeldung gibt es nur bei Knöpfen: `.btn:active { transform: scale(.97); transition-duration: calc(var(--dur-1) * .4) }`. Navigationseinträge, Karten und Zellen haben keinen Druckzustand.
**H3:** Kacheln verhalten sich wie Karten. Ändert eine andere Spezifikation `.card:hover`, folgen `.tile:hover` und `.stat-tile:hover` genauso.

| Element | Hover-Rückmeldung (Zielwert) |
|---|---|
| `.btn` | Fläche `--surface-2`, Rand `--border-2` (ohne −1 px) |
| `.btn.primary` | Fläche und Rand laut Farbe-Spezifikation, **`box-shadow` keiner** |
| `.nav a`, `.nav button` | Fläche `--surface-2`, Schrift `--text`; kein Versatz, kein `:active` |
| `.tile`, `.stat-tile` | Rand `--border-2` (wie `.card`), das (i) erscheint |
| `.cal .d` | Rand `--border-2`; Gewinntag Rand `color-mix(in srgb, var(--profit) 70%, var(--border))`, Verlusttag `color-mix(in srgb, var(--loss) 75%, var(--border))` |
| `.activity i`, `.tracker i`, `.ym-grid i` | `outline: 1px solid var(--text-2); outline-offset: 1px`, ohne Übergang |
| `.shots .shot` (Screenshots im Trade) | Rand `--border-2`; das Bild bleibt stehen; `cursor: zoom-in` auf `img[data-action="lightbox"]` |
| `.design-card`, `.theme-card` | nur der Name wird `--text` (gibt es schon) |
| `.theme-card.t-custom.is-new` (Plus) | Symbolfarbe `--text`, keine Vergrößerung |
| `.pair-card` | Rand `--text-2` |
| `.dot` (Akzentpunkte) | Ring `0 0 0 1px var(--text-2)`; gewählt: Ring `0 0 0 2px var(--text)`, **ohne** `scale` |
| `.dot.custom` | Rand `--text-2`, Symbol `--text` |
| `.cp-c` (Farbwähler-Punkte) | Ring `0 0 0 2px var(--surface), 0 0 0 3.5px var(--border-2)`, also die Geometrie der Auswahl in leiser Farbe |
| `.ed-palette .c` (Notebook-Palette) | Rand `--text-2` |
| `.rp-choice` (Ruhepunkt) | wird hier nicht angefasst (Spezifikation KI-Look, bereich_training-45) |

### 1.3 Ebenen (Popover, Menüs, Fenster, Panels, Dialoge)

**E1:** Jede Ebene, die einblendet, blendet vor dem Entfernen aus (`Motion.leave`). Das gilt für Popover (Zeitraum, Konto, Vorlage, Konto-Menü), Datums- und Farbwähler, das Filter-Fenster `.fd-pop`, die Symbol-Liste `.sym-menu`, das Seitenpanel „Widget hinzufügen“ samt Abdunkler, Dialoge und Toasts.
**E2 – Dauern:** Popover, Filter und Symbol-Liste öffnen mit `--dur-1 --ease`. Der Abdunkler (Dialog und Seitenpanel) blendet mit `--dur-2 --ease` ein. Das Seitenpanel gleitet mit `--dur-3 --ease` herein. Geschlossen wird alles mit `--dur-1 --ease-in`.
**E3 – Richtung:** Ebenen unter ihrem Auslöser kommen vom Auslöser herab: Start 4 px über der Endlage (`--pop-y: -4px`), beim Schließen 4 px nach oben (`--pop-y-out: -4px`). Nach oben öffnende Ebenen (Klasse `.up`: Konto-Menü unten links, `.dp.up`, `.cp.up`, `.sym-menu.up`) steigen wie heute (8 px / 4 px). `transform-origin` liegt an der Kante zum Auslöser: rechtsbündig `top right`, linksbündig `top left`, nach oben `bottom left` bzw. `bottom center`. Dialoge behalten `pop-in`/`pop-out` (Handy: Bottom-Sheet laut Responsiv-Spezifikation, bewegung-29). Die Keyframe-Namen `pop-in`/`pop-out` bleiben, die Richtung kommt über Custom Properties. Ein Wechsel von `.up` beim Scrollen startet die Animation darum nicht neu.
**E4:** Baut die Seite neu auf, während eine Ebene offen ist (Widget hinzufügen), blendet weder Panel noch Abdunkler erneut ein (`.settled`).

### 1.4 Eingangs-Animationen

**I1:** Eingangs-Animationen laufen nur beim echten Seitenwechsel (`App.render` mit `anim === true`, `#content.enter`). Nach `App.rerender()`, einem Reiterwechsel oder einem angewendeten Filter läuft kein Einzug. Beim Reiterwechsel gibt es nur `.content.swap` (Deckkraft ab .35, `--dur-1 --ease`).
**I2 – Reinscrollen:** `.rv` wird nur beim Seitenwechsel vergeben, und zwar an Elemente, die dabei unter dem Fenster liegen. Ein Neuaufbau bereitet nichts erneut vor. Im Druck ist alles sichtbar. Ob das Einblenden beim Reinscrollen ganz entfällt, entscheidet der Nutzer (Abschnitt 6, N1).
**I3 – Choreografie beim Seitenwechsel.** Budget: Verzögerung + Dauer ≤ 740 ms je Animation.

| Teil | Animation | Dauer | Verzögerung | Ende |
|---|---|---|---|---|
| Linie `.ln` | `ch-draw var(--dur-4) var(--ease) forwards` | 640 | 0 | 640 |
| Fläche `.ar` | `ch-fade var(--dur-3) var(--ease) calc(var(--dur-4) - var(--dur-3)) both` | 380 | 260 | 640 (endet mit der Linie und läuft ihr nicht voraus) |
| Balken `.br` | `ch-grow var(--dur-3) var(--ease) var(--bd, 0ms) both`, Staffel gesamt ≤ `--dur-2` | 380 | 0–240 | ≤ 620 |
| Punkte `.dt` | `ch-pop var(--dur-2) var(--ease) var(--dt-delay, var(--dur-1)) both`; mit Linie `--dt-delay: calc(var(--dur-4) * .7)` | 240 | 448 bzw. 150 | 688 |
| Score-Skala | `score-run var(--dur-4) var(--ease) calc(var(--stagger) * 2) backwards` | 640 | 80 | 720 |
| Ringe (Fortschritt) | `transition: stroke-dashoffset var(--dur-4) var(--ease)` | 640 | rAF | ≈ 660 |

Reihenfolge laut README Z. 350–353 bleibt: Linie von links, Fläche blendet ein, Balken wachsen von der Nulllinie, Punkte zuletzt.
**I4 – Ruhepunkt:** Beim Betreten bekommt jedes Element genau eine Eingangsbewegung (`calm-content` auf `.rp > *`, 900 ms, Ausnahme der Skala). Die Kinder von `.rp-stage` laufen in dieser Zeit ohne eigene Bewegung. Ein Schrittwechsel innerhalb der Session nutzt `rp-in` mit `--dur-2 --ease` und der Staffel `--stagger`. Die Auswahlkarten `.rp-choice` haben keine eigene Eingangs-Animation, weil die Liste als Ganzes einblendet.

### 1.5 Dauerbewegung und tote Übergänge

**D1:** Keine Endlos-Animation dient als Zustandsdekoration (kein pulsierender Punkt). Erlaubt bleiben Ladeanzeigen (`.skel`, `.ld`, `.spin`), die Tipp-Punkte des Mentors, die Serie (README Z. 130–132), die Kerzen im Friedhof (Nutzerentscheid „Kerzen bleiben“) und der Ruhepunkt-Raum.
**D2:** Viele gleichzeitige Endlos-Animationen ruhen außerhalb des Fensters. Für die Kerzen gilt: `.pg-base.off` setzt Flammen und Lichthöfe auf `animation-play-state: paused`.
**D3:** Keine Übergänge auf Werten, die beim Rendern schon feststehen (die Seite wird per `innerHTML` neu gebaut, app.js:96). Keine `width`-Übergänge. Ausnahme: Schalter-Knopf beim Drücken (`.switch::after`, README Z. 224) und die Atem-Füllung im Ruhepunkt (JS, ruhepunkt.js:262).

### 1.6 Zustände ohne grüne Bewegung

**G1:** Die Leiste „Bearbeitungsmodus“ ist neutral: Rand `--border-2`, Fläche `--surface-2`, Schatten `--shadow` (sticky) bleibt. Kein Punkt, kein Puls. „Speichern“ bleibt `btn primary`.
**G2:** Kein Hauptknopf bekommt beim Darüberfahren einen Schein. „Trade loggen“ (`.btn.accent`) behält sein dokumentiertes Licht (README Z. 206, app.css:3135–3144).

### 1.7 Weniger Bewegung, Abschalten, Druck, SVG

**R1:** Bei `prefers-reduced-motion: reduce` ist alles aus (app.css:97). Nur der Ring `.spin` dreht weiter, langsam mit 2,4 s je Umdrehung, als notwendige Statusanzeige.
**R2:** Werden `--dur-1` bis `--dur-4` und `--stagger` auf `0ms` gesetzt, stehen alle einmaligen Übergänge sofort, Diagramm-Staffeln eingeschlossen. Ausgenommen ist nur die Liste aus T1.
**R3:** Im Druck (`@media print`) sind `.rv`-Elemente sichtbar.
**R4:** SVG-Filter und Verläufe der Kerzen stehen einmal pro Seite im Dokument. Es gibt keine doppelten IDs.

---

## 2. Konflikte und Entscheidungen

**K1 – Kachel-Hover (bewegung-18, bereich_statistik-29, komponenten-13 mit bewegung-19 und referenz-24; gruppenübergreifend bereich_dashboard-11 [Komponenten] und zustaende-34 [Zustände]).** Alle meinen dieselbe Zeile app.css:516.
- Entscheidung: Rand `--border-2` wie `.card:hover`. Grund: Das (i) erscheint beim Darüberfahren (app.css:496), ein ruhiger Randwechsel bestätigt die Fläche dazu.
- zustaende-34 will den Hover ganz streichen, auch bei Karten. Das wird nur übernommen, wenn die Zustände-Spezifikation `.card:hover` streicht (Regel H3).

**K2 – Token `--lift-shadow` löschen (bewegung-18, komponenten-13) gegen behalten (bereich_dashboard-11, zustaende-34 Vorgaben).** Nachgeprüft: `css/landing.css:56` nutzt `var(--lift-shadow)`, und index.html lädt app.css. Entscheidung: **Token bleibt** in app.css Z. 48, 59, 69. In app.css selbst wird es nicht mehr benutzt.

**K3 – `.kstrip .tile:hover` (2603): löschen (bewegung-18, zustaende-34), auf `border-color: transparent` kürzen (Prüfer bewegung-18) oder nur `transform: none` streichen (bereich_statistik-29).** Entscheidung: ganz löschen. Ohne transform und Schatten in 516 bleibt auf kstrip-Kacheln nur `border-color`, und die wirkt bei `border: 0` nicht. Die Hell-Korrektur der Trennlinien (farbe_kontrast-32 / bereich_konto-28) trägt ihren eigenen `:hover`-Selektor und setzt an derselben Stelle an.

**K4 – Kalendertage.** komponenten-13 und bewegung-21 nehmen das Anheben weg. bereich_dashboard-11 (Komponenten) will es behalten, weil Tage klickbar sind „wie .btn“. Entscheidung: weg. Grund: `.btn:hover` verliert sein −1 px ebenfalls, das Argument fällt also weg. Im dichten Raster von 35 Zellen wackelt sonst alles. Neu kommen eigene Hover-Ränder für Gewinn- und Verlusttage hinzu, sonst hätten sie keine Rückmeldung (gleiche Spezifität, `.win`/`.loss` stehen später).

**K5 – Navigation `:active`.** bewegung-17 und bereich_shell-19 löschen ihn, komponenten-13 will `scale(.98)` behalten. Entscheidung: löschen. Gründe: `renderSidebar()` baut die Leiste nach dem Klick sofort neu (app.js:104), der Druck wäre abgeschnitten. `.set-nav` und die Notebook-Ordner haben auch keinen Druckzustand (Regel H2).

**K6 – Gleiche Zeilen in bewegung-1, bewegung-33 und bewegung-34.** Zeilen 106–112, 568 und 1317 regelt bewegung-1 (Dauer und Kurve). 117, 2181 und 2277 regeln bewegung-34 (Dauer) und bewegung-33 (Kurve) gemeinsam. 2183/2184 entfallen durch bewegung-9, deren Umstellung auf Tokens aus bewegung-34 ist damit erledigt. Werte aus Abschnitt 1.4 haben Vorrang.

**K7 – Zeitpunkt der Fläche.** Prüfer bewegung-1 schlägt `.1s` Verzögerung vor. Dann liefe die Fläche der Linie voraus, und genau das bemängelt bewegung-2 (Diagramme). Entscheidung: Verzögerung `calc(var(--dur-4) - var(--dur-3))` = 260 ms, Fläche und Linie enden gemeinsam bei 640 ms. Setzt die Diagramme-Spezifikation den Wisch über `g.wipe` um (bewegung-2), muss `ch-wipe` mit `var(--dur-4) var(--ease)` laufen, nicht mit 1.1s. Die Fläche-Regel hier gilt dann für `ch-fade` weiter.

**K8 – Punkt-Verzögerung.** bewegung-1 setzt `'520ms'` + `--dur-2` (Ende 760 ms, über dem Budget). Entscheidung: `calc(var(--dur-4) * .7)` = 448 ms (Linie dann zu etwa 95 % gezeichnet), Ende 688 ms. Der Wert kommt aus dem Token und schaltet damit mit ab.

**K9 – Kurven-Token für Schleifen.** Der Vorschlag von bewegung-33 setzt symmetrische Kurven auf `--ease-io`. Das Token ist aber nicht symmetrisch (`.4, 0, .2, 1`), Ein- und Ausatmen würden ungleich. Entscheidung: neues Token `--ease-sym: cubic-bezier(.45, 0, .55, 1)` für 1518, 1527, 2356, 2274, 2275 und ruhepunkt.js:262. Skelett-Glanz und Kurslinie werden dadurch etwas gleichmäßiger (Charakter bleibt). Das ist gewollt und ruhiger.

**K10 – Schalter- und Long/Short-Zeiten (bewegung-34).** Der Schalter-Knopf (README Z. 224) und das Long/Short-Wackeln behalten exakt 320 ms über `calc(var(--dur-2) * 4 / 3)`, sonst würde das Nachfedern hektischer. Die übrigen Werte (260→240, 180→150, 140→150, 160→150 ms) rücken auf die Skala. Die Abweichungen sind nicht wahrnehmbar. Ergänzt wurde 273 (`60ms`), das im Befund steht, im Vorschlag aber fehlte: `calc(var(--dur-1) * .4)`.

**K11 – Bearbeiten-Leiste: bereich_dashboard-9 (`--surface-2`) gegen ki_look-12 [KI-Look] (`--surface`).** Entscheidung: `--surface-2` + `--border-2`, also leicht angehobene Fläche mit feinem Rand. Das entspricht genau der Vorgabe für Zustände, und die Leiste liegt sticky über `--surface`-Karten. ki_look-12 ist damit miterledigt und darf nicht ein zweites Mal umgesetzt werden. Das Trennzeichen „–“ → „·“ aus bereich_dashboard-9 gehört der Wortwahl-Gruppe und wird hier nicht geändert.
- `beruehrt_vorgaben = true` heißt hier nur, dass die Vorgabe „Grün nur mit Bedeutung“ durchgesetzt wird. Eine Entscheidung des Nutzers ändert sich nicht, darum gibt es keine Rückfrage.

**K12 – Hauptknopf-Schein (bewegung-20) gegen referenz-6 [Farbe] und komponenten-1 [Komponenten].** Die beiden anderen schreiben `.btn.primary` und dessen Hover komplett neu. Entscheidung: Hier wird nur `box-shadow` aus 275 und aus der Übergangsliste 269 entfernt. Fläche und Rand legt die Farbe-Spezifikation fest. Keine Rückfrage: README Z. 206 („Nur ‚Trade loggen‘ behält sein Licht“) und der Kommentar an `.btn.accent` („kein Schein darunter“) decken die Entfernung. `.btn.primary` ist nicht „Trade loggen“ (`.btn.accent.tl`, app.js:253).

**K13 – Menü-Richtung (bewegung-28) und Schließen (bewegung-27).** Der Vorschlag mit neuen Keyframes `drop-in`/`drop-out` müsste den Namen wechseln, sobald `.up` umschaltet. Die Symbol-Liste, der Datums- und der Farbwähler berechnen `.up` beim Scrollen und bei Größenänderung neu (app.js:395, datepicker.js:99, colorpicker.js:68), ein Namenswechsel würde die Animation neu starten und flackern. Entscheidung: `pop-in`/`pop-out` behalten und die Richtung über `--pop-y`/`--pop-y-out` steuern. motiontest.js:31 (`animationName === 'pop-in'`) bleibt dadurch gültig.

**K14 – Filter-Fenster: Ursprung.** bewegung-28 setzt fest `top right`. Nach dash-filter.js:146 steht das Fenster aber nur in der Titelzeile rechtsbündig, sonst linksbündig. Entscheidung: `transform-origin` wird in `place()` gesetzt (`inTop && !phone ? 'top right' : 'top left'`).

**K15 – Filter schließen: Callback.** Prüfer bewegung-27 leert im Callback die ganze Ebene (`if (!ui().open) l.innerHTML = ''`). Entscheidung: nur das ausblendende Fenster entfernen (`pop.remove()`). So schneidet ein schnelles Wieder-Öffnen und Schließen kein fremdes Fenster ab.

**K16 – Seitenpanel (bewegung-26).** Der Originalvorschlag ließe den Abdunkler bei jedem hinzugefügten Widget aufblitzen, weil keepPanel nur `.side-panel` behält. Entscheidung: Fassung des Prüfers (neuer Abdunkler bekommt `.settled`), dazu ein Schutz gegen doppeltes Schließen.

**K17 – Ruhepunkt (bewegung-9).** Der Vorschlag setzt `html.calm-enter .rp-stage > * { animation: none }`. Entfernt ruhepunkt.js:864 nach 1400 ms die Klasse `calm-enter`, wechselt `animation-name` von `none` auf `rp-in`, und **alle Stufen-Elemente spielen ihren Einzug ein zweites Mal ab**. Entscheidung: Während `calm-enter` bleibt der Name, nur `animation-duration: 0s; animation-delay: 0s` werden gesetzt. Die Animation ist sofort beendet, beim Entfernen der Klasse startet nichts neu.

**K18 – Kerzen pausieren: `.live` an `.prop-grave` (bewegung-6) gegen `.off` an `.pg-base` (bereich_prop-50).** Entscheidung: `.off` an `.pg-base`. Gründe: Ohne IntersectionObserver flackern die Kerzen wie bisher, statt dauerhaft zu stehen. Beobachtet wird die eigentliche Kerzenfläche, nicht der ganze, höhere Grabstein.

**K19 – Unterstrich `.prop-sub` (bewegung-40) gegen aufbau-16 [Aufbau].** aufbau-16 löscht `.prop-sub` ganz. Entscheidung: Wird aufbau-16 umgesetzt, entfällt Schritt C13c. Sonst wird nur die `transition` gestrichen. Der Wechsel `scaleX` → `opacity` (Prüfer) ist ohne Übergang unnötig.

**K20 – Screenshot-Hover (bereich_trades_tag-49 gegen bewegung-42).** Entscheidung: Fassung bereich_trades_tag-49 (Rand statt Abdunkeln). Das Bild-Einblenden mit `opacity var(--dur-3)` bleibt. Der neue Hover wird auf `.shots .shot` begrenzt, weil die Startseite eine gleichnamige Klasse `.lp .shot` nutzt (Klassenkollision ki_look-3).

**K21 – Einstellungen (bereich_einstellungen-42).** Im Vorschlag sind die Zeilen vertauscht: 1827/1829 = `.dc-prev`, 1839/1840 = `.tc-prev`. Umgesetzt wird nach Selektor. Zusätzlich fällt die Vergrößerung des gewählten Punkts `scale(1.08)` (1937) weg (Prüferhinweis). Für den Plus-Knopf `.ed-palette .c.add` braucht es eine eigene Hover-Regel, weil er später steht und dieselbe Spezifität hat.

**K22 – Einblenden beim Reinscrollen (bereich_dashboard-12 mit bewegung-3).** Der Fehler (erneutes Scharfschalten nach jedem Neuaufbau) und der Druck werden behoben. Beides widerspricht README Z. 330 nicht („einmalig … nur was beim Öffnen unter dem Fenster liegt“). Das komplette Entfernen ändert dagegen die dokumentierte Entscheidung und geht an den Nutzer (N1).

**K23 – Ring-Schein und Bottom-Sheet.** `filter: drop-shadow` am Ring (1317) regeln KI-Look/Diagramme (ki_look-6, bereich_training-7). Hier ändert sich in derselben Zeile nur die `transition`. Die Handy-Dialoge (bewegung-29, Responsiv) überschreiben `pop-in` im Block `max-width: 560px`. Das bleibt verträglich, weil hier an `.modal` nichts geändert wird.

---

## 3. Umsetzungsschritte

### 3.1 `web/css/app.css` – Tokens und Skala

**A1 `:root` Z. 46–47** (bewegung-1, bewegung-33, bewegung-34)
- Vorher Z. 46: `--dur-1: 150ms; --dur-2: 240ms; --dur-3: 380ms;`
- Nachher: `--dur-1: 150ms; --dur-2: 240ms; --dur-3: 380ms; --dur-4: 640ms; /* nur Einzug von Diagrammen, Score, Ringen */ --stagger: 40ms;`
- Z. 47 am Ende vor dem Kommentar ergänzen: `--ease-sym: cubic-bezier(.45, 0, .55, 1); /* symmetrisch: Schleifen, Atemtakt */`
- `--lift-shadow` (Z. 48, 59, 69) **bleibt** (K2).

**A2 Kommentar Bewegungsblock Z. 2367–2368** (bewegung-34): `Abschalten: --dur-1/2/3 auf 0ms setzen …` → `Abschalten: --dur-1 bis --dur-4 und --stagger auf 0ms setzen …`

### 3.2 `web/css/app.css` – Komponenten

**B1 Knöpfe** (komponenten-13, bewegung-19, bewegung-20, bewegung-34)
- Z. 269 `.btn { … transition: background var(--dur-1) var(--ease), border-color var(--dur-1) var(--ease), transform var(--dur-1) var(--ease), color var(--dur-1) var(--ease), box-shadow var(--dur-2) var(--ease); }` → `, box-shadow var(--dur-2) var(--ease)` streichen.
- Z. 272 `.btn:hover { background: var(--surface-2); border-color: var(--border-2); transform: translateY(-1px); }` → `.btn:hover { background: var(--surface-2); border-color: var(--border-2); }`
- Z. 273 `.btn:active { transform: scale(.97); transition-duration: 60ms; }` → `.btn:active { transform: scale(.97); transition-duration: calc(var(--dur-1) * .4); }`
- Z. 275 `.btn.primary:hover { …; box-shadow: 0 8px 20px -10px var(--accent-glow); }` → `box-shadow: …` streichen. Fläche und Rand laut Farbe-Spezifikation (referenz-6/komponenten-1). Kommt die nicht, bleibt `background: var(--accent-2); border-color: var(--accent-2);`.

**B2 Schalter** (bewegung-34)
- Z. 306 `.switch { … transition: background-color .26s var(--ease), box-shadow .26s var(--ease); }` → `transition: background-color var(--dur-2) var(--ease), box-shadow var(--dur-2) var(--ease);`
- Z. 307 `.switch::after { … transition: transform .32s var(--sw-ease), width .18s var(--ease), background-color .26s var(--ease), box-shadow .26s var(--ease); }` → `transition: transform calc(var(--dur-2) * 4 / 3) var(--sw-ease), width var(--dur-1) var(--ease), background-color var(--dur-2) var(--ease), box-shadow var(--dur-2) var(--ease);`

**B3 Navigation** (bewegung-17, bereich_shell-19, komponenten-13)
- Z. 172: `, transform var(--dur-2) var(--ease)` aus der `transition` streichen.
- Z. 176 → `.nav a:hover, .nav button:hover { background: var(--surface-2); color: var(--text); }`
- Z. 177 (`.nav a:active, .nav button:active { … }`) löschen.
- Z. 182 (`.nav a.active:hover { transform: none; }`) löschen.

**B4 Popover und Menüs: Richtung und Schließen** (bewegung-27, bewegung-28)
- Neu direkt nach Z. 328 (`.popover { … }`): `.popover, .sym-menu, .fd-pop { --pop-y: -4px; --pop-y-out: -4px; } /* unter dem Auslöser: vom Knopf herab */`
- Z. 248 (`.popover.up.open { transform-origin: bottom center; }`) davor neu: `.popover.up { --pop-y: 8px; --pop-y-out: 4px; } /* nach oben öffnend: steigt auf */`
- Keyframes Z. 2374–2375:
  - vorher `@keyframes pop-in { from { opacity: 0; transform: translateY(8px) scale(.985); } }` → nachher `@keyframes pop-in { from { opacity: 0; transform: translateY(var(--pop-y, 8px)) scale(.985); } }`
  - vorher `@keyframes pop-out { to { opacity: 0; transform: translateY(4px) scale(.99); } }` → nachher `@keyframes pop-out { to { opacity: 0; transform: translateY(var(--pop-y-out, 4px)) scale(.99); } }`
  - Dialoge (`.modal`) tragen kein `--pop-y` und bleiben bei 8 px / 4 px.
- Z. 879 `.sym-menu { … animation: pop-in var(--dur-1) var(--ease) backwards; }`: um `transform-origin: top left;` ergänzen. Direkt danach neu:
  `.sym-menu.up { --pop-y: 8px; --pop-y-out: 4px; transform-origin: bottom left; }`
  `.sym-menu.closing { animation: pop-out var(--dur-1) var(--ease-in) forwards; pointer-events: none; }`
- Nach Z. 1345 (`.fd-pop { … }`) neu: `.fd-pop.closing { animation: pop-out var(--dur-1) var(--ease-in) forwards; pointer-events: none; }`. Der `transform-origin` von `.fd-pop` bleibt als Grundwert `top left`, JS setzt ihn je Lage (C-Schritt dash-filter).

**B5 Kacheln** (bewegung-18, bereich_statistik-29, komponenten-13, referenz-24)
- Z. 515 `.tile { … transition: border-color var(--dur-2) var(--ease), transform var(--dur-2) var(--ease), box-shadow var(--dur-2) var(--ease); }` → `transition: border-color var(--dur-2) var(--ease);`
- Z. 636 `.stat-tile { … }` dieselbe Kürzung.
- Z. 516 → `.tile:hover, .stat-tile:hover { border-color: var(--border-2); }`
- Z. 2603 (`.kstrip .tile:hover { … }`) löschen (K3).

**B6 Diagramm-Einzug** (bewegung-1, bewegung-33)
- Z. 106 und Z. 111 `animation: ch-draw 1.25s cubic-bezier(.3, .7, .2, 1) .05s forwards;` → `animation: ch-draw var(--dur-4) var(--ease) forwards;`
- Z. 107 und Z. 112 `animation: ch-fade 1s ease .35s both;` → `animation: ch-fade var(--dur-3) var(--ease) calc(var(--dur-4) - var(--dur-3)) both;`
- Z. 108 `animation: ch-grow .75s cubic-bezier(.2, .7, .2, 1) calc(.1s + var(--bd, 0ms)) both;` → `animation: ch-grow var(--dur-3) var(--ease) var(--bd, 0ms) both;`
- Z. 110 `animation: ch-pop .45s cubic-bezier(.2, .8, .2, 1) var(--dt-delay, 1.1s) both;` → `animation: ch-pop var(--dur-2) var(--ease) var(--dt-delay, var(--dur-1)) both;`
- Kommentar Z. 103–104 ergänzen: „Einzug endet nach höchstens 740 ms (--dur-4 + Verzögerung)“.

**B7 Reiterwechsel** (bewegung-34, bewegung-33): Z. 117 `animation: swap-in .16s ease-out both;` → `animation: swap-in var(--dur-1) var(--ease) both;`

**B8 Score-Skala und Ring** (bewegung-1, bewegung-33)
- Z. 568 `animation: score-run 1.3s cubic-bezier(.22, .9, .25, 1) .2s backwards;` → `animation: score-run var(--dur-4) var(--ease) calc(var(--stagger) * 2) backwards;`
- Z. 1317 `transition: stroke-dashoffset 1.1s cubic-bezier(.22, .61, .36, 1);` → `transition: stroke-dashoffset var(--dur-4) var(--ease);` Das `filter` in derselben Zeile regelt KI-Look/Diagramme (K23).

**B9 Seitenpanel „Widget hinzufügen“** (bewegung-26)
- Z. 1597 `.panel-bg { … }` um `animation: fade-in var(--dur-2) var(--ease) backwards;` ergänzen.
- Direkt danach neu: `.panel-bg.settled { animation: none; }` und **danach** `.panel-bg.out { animation: fade-out var(--dur-1) var(--ease-in) forwards; pointer-events: none; }`
- Nach Z. 1600 (`.side-panel.settled { animation: none; }`) neu (muss danach stehen):
  `.side-panel.out { animation: slide-out var(--dur-1) var(--ease-in) forwards; pointer-events: none; }`
  `@keyframes slide-out { to { transform: translateX(30px); opacity: 0; } }`

**B10 Einblenden beim Reinscrollen und Druck** (bereich_dashboard-12, bewegung-34)
- Z. 2370 `transition-delay: calc(var(--i, 0) * 40ms);` → `transition-delay: calc(var(--i, 0) * var(--stagger));`
- Im Block `@media print { … }` (Z. 1192–1200) vor der schließenden Klammer neu: `.js-motion .rv { opacity: 1 !important; transform: none !important; transition: none !important; }`

**B11 Weniger Bewegung: Lade-Ring** (barrierefreiheit-44): Z. 1559 `.spin { animation-duration: 2.4s; }` → `.spin { animation: spin-turn 2.4s linear infinite !important; }` (Spezifität 0,1,0 schlägt `*` aus Z. 97).

**B12 Lade-Kurven** (bewegung-33)
- Z. 1518 `animation: skel-sheen 1.8s cubic-bezier(.45, 0, .25, 1) infinite;` → `animation: skel-sheen 1.8s var(--ease-sym) infinite;`
- Z. 1527 `animation: ld-run 1.5s cubic-bezier(.65, 0, .35, 1) infinite;` → `animation: ld-run 1.5s var(--ease-sym) infinite;`
- Z. 2356 `animation: mentor-dot 1.4s infinite cubic-bezier(.45, 0, .55, 1);` → `animation: mentor-dot 1.4s infinite var(--ease-sym);`

### 3.3 `web/css/app.css` – Einzelstellen

**C1 Kalendertage** (bewegung-21, komponenten-13)
- Z. 705 `.cal .d { … transition: border-color var(--dur-1) var(--ease), transform var(--dur-1) var(--ease); … }` → `transition: border-color var(--dur-1) var(--ease);`
- Z. 706 → `.cal .d:hover { border-color: var(--border-2); }`
- Nach Z. 711 (`.cal .d.loss { … }`) neu:
  `.cal .d.win:hover { border-color: color-mix(in srgb, var(--profit) 70%, var(--border)); }`
  `.cal .d.loss:hover { border-color: color-mix(in srgb, var(--loss) 75%, var(--border)); }`

**C2 Screenshots** (bereich_trades_tag-49, bewegung-42)
- Z. 753 `.shot img { … transition: transform var(--dur-3) var(--ease), opacity var(--dur-3) var(--ease); }` → `transition: opacity var(--dur-3) var(--ease);`
- Z. 754 `.shot:hover img { transform: scale(1.03); }` ersetzen durch:
  `.shots .shot { transition: border-color var(--dur-1) var(--ease); }`
  `.shots .shot:hover { border-color: var(--border-2); }`
  `.shot img[data-action="lightbox"] { cursor: zoom-in; }`

**C3 Long/Short-Schalter** (bewegung-34)
- Z. 850 `transition: --dir-c 140ms linear;` → `transition: --dir-c var(--dur-1) linear;`
- Z. 852 `transition: transform 260ms var(--ease-io);` → `transition: transform var(--dur-2) var(--ease-io);`
- Z. 858 `transition: opacity 160ms var(--ease);` → `transition: opacity var(--dur-1) var(--ease);`
- Z. 860 `animation: dir-need 320ms var(--ease-io);` → `animation: dir-need calc(var(--dur-2) * 4 / 3) var(--ease-io);`

**C4 Bearbeiten-Leiste** (bereich_dashboard-9, bewegung-37; erledigt ki_look-12 mit)
- Z. 1567 `.edit-bar { … border: 1px solid var(--accent); background: color-mix(in srgb, var(--accent) 10%, var(--surface)); box-shadow: var(--shadow); }` → `… border: 1px solid var(--border-2); background: var(--surface-2); box-shadow: var(--shadow); }`
- Z. 1568 (`.dot-live { … }`) löschen.
- Z. 1115 (`@keyframes pulse { … }`) löschen (sonst nirgends benutzt; `streak-pulse*` sind eigene Keyframes).

**C5 Heatmaps** (bewegung-22)
- Z. 1293 `.activity i:hover { transform: scale(1.08); }` → `.activity i:hover { outline: 1px solid var(--text-2); outline-offset: 1px; }`
- Z. 1673 `.tracker i:hover { transform: scale(1.12); }` → `.tracker i:hover { outline: 1px solid var(--text-2); outline-offset: 1px; }`
- Z. 1772 `.ym-grid i:hover { transform: scale(1.15); }` → `.ym-grid i:hover { outline: 1px solid var(--text-2); outline-offset: 1px; }`

**C6 Tote Übergänge** (bewegung-40)
- a) Z. 1256 `.dstreak-track em { …; transition: width var(--dur-2) var(--ease); }` → `transition: …;` streichen.
- b) Z. 1258 `.dstreak-track i { …; transition: background var(--dur-2) var(--ease), border-color var(--dur-2) var(--ease); }` → `transition: …;` streichen.
- c) Z. 2597 `.prop-sub a::after { …; transform: scaleX(0); transition: transform var(--dur-2) var(--ease); }` → nur `transition: …;` streichen. Entfällt, wenn aufbau-16 `.prop-sub` löscht (K19).
- d) Z. 2708 `.prop-bar .track i { …; transition: width var(--dur-3) var(--ease); }` → `transition: …;` streichen.

**C7 Einstellungen → Design und Farbwähler** (bereich_einstellungen-42; Selektoren statt Zeilen, K21)
- `.dc-prev` (Z. 1827): `transition: box-shadow var(--dur-1) var(--ease), transform var(--dur-1) var(--ease);` → `transition: box-shadow var(--dur-1) var(--ease);`
- `.design-card:hover .dc-prev { transform: translateY(-1px); }` (Z. 1829) löschen.
- `.tc-prev` (Z. 1839): wie `.dc-prev` kürzen.
- `.theme-card:hover .tc-prev { transform: translateY(-1px); }` (Z. 1840) löschen.
- Z. 1854 `.theme-card.t-custom.is-new .tc-prev > svg { …; transition: transform var(--dur-1) var(--ease), color var(--dur-1) var(--ease); }` → `transition: color var(--dur-1) var(--ease);`
- Z. 1855 → `.theme-card.t-custom.is-new:hover .tc-prev > svg { color: var(--text); }`
- Z. 1935 `.dot { …; transition: transform var(--dur-1) var(--ease); }` → `transition: box-shadow var(--dur-1) var(--ease), border-color var(--dur-1) var(--ease), color var(--dur-1) var(--ease);`
- Z. 1936 → `.dot:hover { box-shadow: 0 0 0 1px var(--text-2); }` (bleibt **vor** der Auswahlregel).
- Z. 1937 → `.dot[aria-pressed="true"] { box-shadow: 0 0 0 2px var(--text); }` (`transform: scale(1.08)` streichen).
- Nach Z. 1942 (`.dot.custom { … }`) neu: `.dot.custom:hover { border-color: var(--text-2); color: var(--text); }`
- Z. 1945 `.pair-card { …; transition: border-color var(--dur-1) var(--ease), transform var(--dur-2) var(--ease); }` → `transition: border-color var(--dur-1) var(--ease);`
- Z. 1949 → `.pair-card:hover { border-color: var(--text-2); }`
- Z. 459 `.cp-c { …; transition: transform var(--dur-1) var(--ease), box-shadow var(--dur-1) var(--ease); }` → `transition: box-shadow var(--dur-1) var(--ease);`
- Z. 460 → `.cp-c:hover { box-shadow: 0 0 0 2px var(--surface), 0 0 0 3.5px var(--border-2); }` (bleibt vor 461, damit die Auswahl beim Darüberfahren gewinnt).
- Z. 1109 `.ed-palette .c { … }` um `transition: border-color var(--dur-1) var(--ease);` ergänzen.
- Z. 1110 → `.ed-palette .c:hover { border-color: var(--text-2); }`
- Nach Z. 1111 (`.ed-palette .c.add { … }`) neu: `.ed-palette .c.add:hover { border-color: var(--text-2); color: var(--text); }`

**C8 Ruhepunkt** (bewegung-9, bewegung-33, bewegung-34)
- Z. 2115 `animation: calm-content 900ms cubic-bezier(.2, .7, .2, 1) backwards;` → `animation: calm-content 900ms var(--ease) backwards;` (900 ms bleibt, Ausnahme T1)
- Nach Z. 2118 neu: `html.calm-enter .rp-stage > * { animation-duration: 0s; animation-delay: 0s; } /* beim Betreten nur calm-content; Name bleibt, damit nach calm-enter nichts neu startet */`
- Z. 2181 `.rp-stage > * { animation: rp-in .32s cubic-bezier(.2, .7, .2, 1) both; }` → `.rp-stage > * { animation: rp-in var(--dur-2) var(--ease) both; }`
- Z. 2182 Verzögerungen `.04s` / `.08s` / `.12s` / `.16s` → `var(--stagger)` / `calc(var(--stagger) * 2)` / `calc(var(--stagger) * 3)` / `calc(var(--stagger) * 4)`
- Z. 2183 und Z. 2184 (`.rp-choices .rp-choice { animation: rp-in … }` und deren Verzögerungen) löschen.
- Z. 2274 `.rp-tide { … transition: box-shadow var(--dur, 1s) ease-in-out; }` → `transition: box-shadow var(--dur, 1s) var(--ease-sym);`
- Z. 2275 `.rp-tide-glow { … transition: opacity var(--dur, 1s) ease-in-out; }` → `transition: opacity var(--dur, 1s) var(--ease-sym);`
- Z. 2277 `.rp-swap { animation: rp-swap .45s ease-out both; }` → `.rp-swap { animation: rp-swap var(--dur-3) var(--ease) both; }`

**C9 Konfidenz-Balken** (bewegung-34): Z. 2513 `transition-delay: 40ms;` → `transition-delay: var(--stagger);` und `transition-delay: 80ms;` → `transition-delay: calc(var(--stagger) * 2);`

**C10 Grabstein und Kerzen** (bewegung-33, bereich_prop-50, bewegung-6)
- Z. 2773 `.pg-inner { … transition: transform .75s cubic-bezier(.3, .7, .2, 1); }` → `transition: transform .75s var(--ease);` (.75s bleibt, Ausnahme T1)
- Nach Z. 2832 neu: `.pg-base.off .pg-candles .flame, .pg-base.off .pg-candles .halo { animation-play-state: paused; } /* außerhalb des Fensters ruhen die Flammen */`

### 3.4 `web/js/motion.js` (bewegung-34)
- Z. 2 Kommentar `--dur-1/2/3 und --ease` → `--dur-1 bis --dur-4, --stagger und --ease`
- Z. 21 `var STEP = 40; /* … */` löschen.
- Z. 33 `ms('--dur-3') + Math.min(k, MAX_I) * STEP + 80` → `ms('--dur-3') + Math.min(k, MAX_I) * ms('--stagger') + 80`. Kein Rückfallwert, damit 0 ms wirklich abschaltet.

### 3.5 `web/js/app.js`
- **Z. 103** (bereich_dashboard-12, bewegung-3): `M.scan(main.querySelector('#content'), false);` → `if (anim) M.scan(main.querySelector('#content'), false); /* nur beim echten Seitenwechsel; ein Neuaufbau bereitet nichts erneut vor */`
- Kommentar Z. 75 `Neuaufbau nach Eingaben: nur, was noch unter dem Fenster liegt` → `Neuaufbau nach Eingaben: nichts blendet ein`. Kommentar Z. 98–99 entsprechend: „nur was beim Seitenwechsel unter dem Fenster liegt, blendet beim Reinscrollen ein“.
- **Z. 387 `App.closeSymbolMenu`** (bewegung-27): `if (m) { if (m._off) m._off(); m.remove(); }` → `if (m) { if (m._off) m._off(); m.removeAttribute('id'); M.leave(m, 'closing', '--dur-1', () => m.remove()); }`. Die ID wird sofort entfernt, damit `openSymbolMenu` (Z. 389) während des Ausblendens ein neues Menü öffnet und tradeformtest.js:24/26/28 grün bleiben. `M.leave` ruft ohne Bewegung sofort `done()` auf.
- **Z. 395 `place()` in `openSymbolMenu`** (bewegung-28): am Ende der Pfeilfunktion `m.classList.toggle('up', up);` ergänzen. Das ändert nur Custom Properties und Ursprung, es gibt keinen Neustart (K13).

### 3.6 `web/js/ui.js` (bewegung-1)
- Z. 252 Kommentar `die Staffelung bleibt insgesamt unter 0,4 s` → `die Staffelung bleibt insgesamt bei höchstens --dur-2 (240 ms)`
- Z. 253 `const step = bars.length ? Math.min(14, 400 / bars.length) : 0;` → `const total = root.Motion && root.Motion.ms ? root.Motion.ms('--dur-2') : 240; const step = bars.length ? Math.min(14, total / bars.length) : 0;`
- Z. 257 `svg.style.setProperty('--dt-delay', hasLine ? '1.1s' : '.15s');` → `svg.style.setProperty('--dt-delay', hasLine ? 'calc(var(--dur-4) * .7)' : 'var(--dur-1)');`

### 3.7 `web/js/screens/dashboard.js`
- **Z. 119** (bereich_dashboard-9, bewegung-37): `<div class="row"><span class="dot-live"></span><b>Bearbeitungsmodus</b>` → `<div class="row"><b>Bearbeitungsmodus</b>`. Der Rest bleibt, auch „–“ (K11).
- **keepPanel Z. 67–69** (bewegung-26): direkt nach `fn();` (vor der Prüfung `if (!old || …) return;`) ergänzen: `const nbg = document.querySelector('.panel-bg'); if (old && nbg) nbg.classList.add('settled');`
- **Z. 208 `'dash-add-close'`** (bewegung-26) → `'dash-add-close'() { const s = st(), p = document.querySelector('.side-panel'), bg = document.querySelector('.panel-bg'), Mo = root.Motion; if (p && p.classList.contains('out')) return; const done = () => { s.panel = null; s.slot = null; App.rerender(); }; if (p && Mo && Mo.enabled) { if (bg) bg.classList.add('out'); Mo.leave(p, 'out', '--dur-1', done); } else done(); },`

### 3.8 `web/js/screens/dash-filter.js` (bewegung-27, bewegung-28)
- **`place()` Z. 150–155**: nach `Object.assign(pop.style, { … })` ergänzen: `pop.style.transformOrigin = inTop && !phone ? 'top right' : 'top left';`
- **`close()` Z. 169** → `function close() { const u = ui(); u.open = false; u.draft = null; u.pick = null; const pop = document.getElementById('fd-pop'); if (!pop) return; pop.removeAttribute('id'); const Mo = root.Motion; if (Mo && Mo.enabled) Mo.leave(pop, 'closing', '--dur-1', () => pop.remove()); else pop.remove(); }`
  - `open()` ersetzt den Inhalt von `#fd-layer` ohnehin. `refresh()` bricht wegen `open = false` ab, `place()` findet das ausblendende Fenster ohne ID nicht mehr.

### 3.9 `web/js/screens/prop-friedhof.js` (bereich_prop-50, bewegung-6)
- **`cluster` Z. 105**: Rückgabe von String auf Objekt umstellen, ohne Definitionen im SVG:
  `const cluster = (cls, vw, list) => { const c = list.map((x, i) => candle(x, i, cls[0], vw)); return { svg: \`<svg class="pg-candles ${cls}" viewBox="0 0 ${vw} 80" aria-hidden="true" focusable="false"><g class="halos">${c.map(x => x.halo).join('')}</g>${c.map(x => x.wax).join('')}</svg>\`, defs: c.map(x => x.grad).join('') }; };`
- **Z. 159** `${CANDLES_L}${CANDLES_R}` → `${CANDLES_L.svg}${CANDLES_R.svg}`
- **`tabFriedhof` Z. 172** vor `<div class="grid prop-graves">` einmal einfügen: `<svg class="pg-defs" data-no-reveal width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute">${CANDLE_DEFS}<defs>${CANDLES_L.defs}${CANDLES_R.defs}</defs></svg>`. Wichtig: nicht `display:none`, sonst greifen die Verläufe nicht.
- **Z. 175** `PS.register('friedhof', 'Friedhof', tabFriedhof);` → `let io = null; PS.register('friedhof', 'Friedhof', tabFriedhof, { mount(main) { if (io) io.disconnect(); io = null; if (!('IntersectionObserver' in window)) return; io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('off', !e.isIntersecting))); main.querySelectorAll('.pg-base').forEach(b => io.observe(b)); }, unmount() { if (io) { io.disconnect(); io = null; } } });` (`let io` gehört auf Modulebene über die Zeile).

### 3.10 `web/js/screens/ruhepunkt.js` (bewegung-33)
- Z. 262 `'height ' + secs + 's cubic-bezier(.45, .05, .55, .95)'` → `'height ' + secs + 's var(--ease-sym)'`

### 3.11 `web/e2e` (Tests an das neue Verhalten anpassen)
- **motiontest.js:52–53** (bereich_statistik-29): `ok('Kachel hebt sich beim Überfahren', … transform !== 'none')` → `ok('Kachel bleibt beim Überfahren stehen', await p.evaluate(() => getComputedStyle(document.querySelectorAll('.tile')[1]).transform === 'none'));`
- **motiontest.js** nach Z. 28 neu (bewegung-3): Fortschritt öffnen, 900 ms warten, `App.rerender()`, dann `ok('Neuaufbau bereitet nichts erneut vor', document.querySelectorAll('#content .rv').length === 0)`.
- **motiontest.js:8** ergänzen: `&& Motion.ms('--dur-4') === 640 && Motion.ms('--stagger') === 40`.
- **chartanimtest.js:10** `await p.waitForTimeout(380)` → `await p.waitForTimeout(120)`. **Z. 11** `early.off > 100` → `early.off > 0`. Z. 12 (1500 ms) bleibt.

### 3.12 `web/README.md`
- **Z. 329–331** ersetzen durch: „Alle Animationen laufen über eine gemeinsame Skala in `css/app.css`: `--dur-1` 150 ms (Hover, Schließen, kleine Wechsel), `--dur-2` 240 ms (Zustandswechsel, Seitenüberblendung), `--dur-3` 380 ms (größere Flächen), `--dur-4` 640 ms (nur Einzug von Diagrammen, Score-Skala und Ringen beim Seitenwechsel), `--stagger` 40 ms (Staffel); Kurven `--ease` (auslaufend), `--ease-in` (Schließen), `--ease-io` (Schieber), `--ease-sym` (Schleifen und Atemtakt). Beim Darüberfahren bewegt sich nichts (kein Anheben, Verschieben oder Vergrößern), Rückmeldung nur über Rand, Fläche, Schriftfarbe oder einen feinen Umriss; nur Knöpfe geben beim Drücken nach. `js/motion.js` blendet beim Seitenwechsel Karten und Abschnitte, die unter dem Fenster liegen, beim Reinscrollen ein (einmalig, gestaffelt; nach einem Neuaufbau oder Reiterwechsel nicht erneut; im Druck ist alles sichtbar), kapselt den Seitenwechsel in eine View Transition und blendet Dialoge, Popover, Filter-Fenster, Symbol-Liste, Seitenpanel und Toasts aus, bevor sie entfernt werden. Menüs unter einem Knopf klappen von ihm herab auf, nach oben öffnende Menüs steigen auf.“
- **Z. 342–343** ersetzen durch: „Bei ‚weniger Bewegung‘ im System (`prefers-reduced-motion`) ist alles aus, nur der feine Ring in Knöpfen dreht langsam weiter (2,4 s je Umdrehung), damit ‚Wird erstellt …‘ nicht hängend wirkt. Abschalten: `--dur-1` bis `--dur-4` und `--stagger` auf `0ms` setzen oder `js/motion.js` nicht einbinden; ohne das Skript bleibt alles sofort sichtbar. Eigene Zeiten behalten nur der Ruhepunkt-Raum, Endlos-Animationen (Lade-Glanz, Kurslinie, Serie, Kerzen, Tipp-Punkte), das Start-Skelett und die Drehung des Grabsteins.“
- **Z. 352** `Staffelung \`--bd\` insgesamt unter 0,4 s` → `Staffelung \`--bd\` insgesamt höchstens \`--dur-2\``. Nach „Punkte springen zuletzt auf“ ergänzen: „; der ganze Einzug ist nach gut 0,7 s fertig“.
- **Z. 260** (Friedhof) nach „weicher Flamme und Lichthof“ ergänzen: „(Flammen ruhen, solange der Sockel nicht im Bild ist)“.

---

## 4. Akzeptanzkriterien

### 4.1 grep-Prüfungen (im Ordner `web/`)
1. `grep -c "var(--lift-shadow)" css/app.css` → **0**; `grep -c "lift-shadow" css/landing.css` → **1** (unverändert); `grep -c -- "--lift-shadow:" css/app.css` → **3**.
2. `grep -nE ':hover[^{]*\{[^}]*transform\s*:\s*(translate|scale)' css/app.css` → nur `.conf:has(.conf-bar:hover) .conf-word b` (Z. ~2525) sowie, falls die KI-Look-Spezifikation sie nicht ändert, `.rp-choice:hover` und `.rp-choice:hover .rp-icon`. Vorher 18 Treffer, nachher höchstens 3.
3. `grep -o "cubic-bezier" css/app.css | wc -l` → **6** (vorher 18): vier Tokens in `:root`, `--sw-ease`, `sakura-fall`. `grep -c "cubic-bezier" js/screens/ruhepunkt.js` → 0.
4. `grep -nE '(transition|animation)(-duration|-delay)?\s*:[^;]*[ (,]\.?[0-9]+(\.[0-9]+)?m?s\b' css/app.css | grep -v infinite` → nur Zeilen mit `.dstreak`, `.boot`, `calm-`, `.rp-ambient`, `.rp-i-`/`.rp-choice:hover`, `var(--dur, 1s)` (`.rp-tide*`), `.msg.typing`, `.voice-clock`, `.pg-inner`, `transition-delay: 0ms` (Ausnahmeliste T1). Kein Treffer in Z. 106–117, 273, 306, 307, 568, 850–860, 1317, 2181–2184, 2277, 2370, 2513.
5. `grep -nE 'transition:[^;]*\bwidth\b' css/app.css` → nur `.switch::after`.
6. `grep -rn "dot-live\|@keyframes pulse " css/ js/` → leer.
7. `grep -n "STEP" js/motion.js` → leer; `grep -n "ms('--stagger')" js/motion.js` → 1 Treffer.
8. `grep -n "M.scan(" js/app.js` → genau `if (anim) M.scan(…)`.
9. `grep -c 'id="pgc-wax3d"' js/screens/prop-friedhof.js` → 1 (nur in CANDLE_DEFS), und `CANDLE_DEFS` kommt in `cluster` nicht mehr vor.

### 4.2 Messungen und Laufzeit-Prüfungen (Playwright 1440×900, Beispieldaten, dark)
1. **Einzug** (`audit/extra-measure/motion/anims.js`): Alle endlichen Animationen, die ein Seitenwechsel per Klick in der Seitenleiste startet, sind spätestens **1000 ms** nach dem Klick beendet, auf Dashboard, Statistik und Fortschritt. Vorher: 1849 / 1702 / 1267 ms.
2. **Neu Scharfschalten** (`audit/extra-measure/motion/rearm.js`): Nach `App.rerender()` hat `#content .rv` auf Fortschritt, Statistik, Dashboard und Tag jeweils **0** Elemente. Vorher 1 / 3 / 4 / 2.
3. **Druck**: `page.emulateMedia({ media: 'print' })` auf dem Dashboard → alle `#content .rv` haben `opacity === '1'`. Das Ganze-Seite-Bild zeigt alle 14 Widgets (Schatten-Ich, Prop-Konten, Ruhepunkt, Mentor nicht mehr leer).
4. **Hover**: Nach `page.hover()` mit 400 ms Wartezeit ist `getComputedStyle(x).transform === 'none'` für `.btn`, `.tile`, `.stat-tile`, `.nav a`, `.cal .d`, `.activity i`, `.tracker i`, `.ym-grid i`, `.shots .shot img`, `.theme-card .tc-prev`, `.design-card .dc-prev`, `.pair-card`, `.dot`, `.cp-c`. `.btn.primary` beim Darüberfahren: `boxShadow === 'none'`. `.activity i:hover`: `outlineStyle === 'solid'`.
5. **Popover-Richtung**: 30 ms nach dem Öffnen von Zeitraum liegt `#pop-range` höher als 300 ms danach (`top` kleiner), `animationName === 'pop-in'`, `--pop-y` = `-4px`. Beim Konto-Menü unten links (`#pop-user`) ist es umgekehrt (`--pop-y` = `8px`).
6. **Filter und Symbol-Liste**: 40 ms nach Escape im Filter existiert `#fd-layer .fd-pop.closing`, nach 250 ms ist `#fd-layer` leer. 40 ms nach der Symbolwahl fehlt `#sym-menu`, `.sym-menu.closing` ist vorhanden, nach 250 ms ist es weg.
7. **Seitenpanel**: Klick auf `.panel-bg` → nach 40 ms tragen `.side-panel.out` und `.panel-bg.out`, nach 250 ms sind beide weg. Nach „Hinzufügen“ eines Widgets trägt `.panel-bg` die Klasse `settled`, `animationName === 'none'`.
8. **Ruhepunkt**: 100 ms nach dem Betreten haben `.rp-choice` `animationName === 'none'`. Die Kinder von `.rp-stage` haben `animationDuration === '0s'`. 1600 ms nach dem Betreten laufen auf `.rp-stage > *` keine Animationen (`getAnimations().filter(a => a.playState === 'running').length === 0`), alle haben `opacity === '1'`, es gibt also kein zweites Einziehen.
9. **Friedhof** (mindestens 2 geplatzte Konten): `document.querySelectorAll('#pgc-wax3d').length === 1`, `#pgc-r0` genau 1-mal. Nach Scrollen, bis kein `.pg-base` im Bild ist: alle `.pg-base` tragen `off`, und `getAnimations()` liefert für `.pg-candles .flame`/`.halo` nur `paused`. Flammen und Lichthof sehen im Bild aus wie vorher (Vergleich `dark-1440/prop_friedhof.png`).
10. **Weniger Bewegung**: Mit `reducedMotion: 'reduce'` hat `.spin` (Zertifikat „Wird erstellt …“) `animationName === 'spin-turn'` und `animationDuration === '2.4s'`.
11. **Abschalten**: Mit `document.documentElement.style` `--dur-1…--dur-4` und `--stagger` = `0ms` stehen nach einem Seitenwechsel auf das Dashboard alle Diagramme nach 50 ms vollständig (`stroke-dashoffset` 0, Balken `transform` none).

### 4.3 Screenshot-Prüfpunkte
- `dark-1440/dashboard_bearbeiten` (und light): Leiste „Bearbeitungsmodus – Standard“ mit grauem Rand und `--surface-2`, kein grüner Punkt, kein grüner Rand.
- `extra/motion-dash-enter-strip.png` neu aufnehmen (250/500/800 ms): Bei 500 ms steht die Fläche nicht rechts vor der Linienspitze. Bei 800 ms ist alles fertig, Endpunkt eingeschlossen.
- `dark-1440/pop_zeitraum`, `pop_konto`, `pop_filter`: Endlage unverändert gegenüber heute.

### 4.4 Tests (alle grün)
`web/e2e/runall.sh`, mindestens: motiontest, chartanimtest (angepasst), headtest, dashtest, filtertest, sixtest, tradeformtest, friedhoftest, rptest, mentortest, loadtest, switchtest, glidetest, calmnavtest, sampletest. Dazu `web/tests/*.test.mjs` unverändert grün.

---

## 5. Zurückgestellt

Ganze Befunde stelle ich nicht zurück. Diese Teilvorschläge werden bewusst nicht umgesetzt:
- **Löschen des Tokens `--lift-shadow`** (aus bewegung-18, komponenten-13): Die Startseite nutzt es (`css/landing.css:56`). Löschen würde dort den Hover-Schatten zerstören (K2).
- **Druckzustand `scale(.98)` für Navigationseinträge** (komponenten-13): wird sofort durch den Neuaufbau der Leiste abgeschnitten, keine andere Liste hat einen (K5).
- **Neue Keyframes `drop-in`/`drop-out`** (bewegung-28): ersetzt durch Custom Properties, weil Namenswechsel bei umschaltendem `.up` die Animation neu starten (K13).
- **`animation: none` während `calm-enter`** (bewegung-9): erzeugt nach 1,4 s einen zweiten Einzug, ersetzt durch Dauer 0 (K17).
- **Trennzeichen „–“ → „·“ in der Bearbeiten-Leiste** (bereich_dashboard-9): Wortwahl, Sache der Wording-Spezifikation (K11).
- **`.prop-sub` Unterstrich von `scaleX` auf `opacity`** (Prüfer bewegung-40): ohne Übergang wirkungslos (K19).
- **Bild beim Darüberfahren abdunkeln (`opacity: .9`)** und kürzeres Bild-Einblenden (bewegung-42): verkürzt das Einblenden nach dem Laden und gibt keine klare Rückmeldung (K20).
- **Kalendertage behalten ihr Anheben** (bereich_dashboard-11, Komponenten): abgelöst durch K4.

---

## 6. Nutzer fragen

**N1 – bereich_dashboard-12: Soll das Einblenden beim Reinscrollen in der App ganz wegfallen?**
Heute (README Z. 330, dokumentiert) blenden Karten, die beim Öffnen einer Seite unter dem Fenster liegen, beim Scrollen gestaffelt ein. Der Fehler (erneutes Scharfschalten nach jeder Eingabe) und der Druck werden in Abschnitt 3 ohnehin behoben. Offen ist nur, ob es dieses Einblenden überhaupt noch geben soll. Deine Vorgabe lautet „Eingangs-Animationen nur beim Seitenwechsel“.
*Empfehlung:* **Ja, in der App abschalten, auf der Startseite (index.html) behalten.** Das ist ruhiger, folgt deiner Vorgabe wörtlich, und kein Inhalt ist mehr kurz unsichtbar (Ganze-Seite-Bilder, Handy).
Bei „Ja“:
- app.js:103 `if (anim) M.scan(…)` ganz löschen (`Motion.scan` bleibt für index.html).
- app.css:569 `.rv .score-scale { animation-play-state: paused; }` löschen.
- README Z. 330 auf „Seitenwechsel als View Transition … Inhalte stehen sofort da“ kürzen.
- motiontest.js Z. 9–13 („früh > 0“) und 20–24 („Fortschritt: nur Elemente unter dem Fenster …“) auf „keine `.rv` in `#content`“ umstellen.

**N2 – bewegung-15: Weiches Scrollen unabhängig von der Bildwiederholrate machen? Und auf welchem Bildschirm stimmt das heutige Gefühl?**
scroll.js:38 bewegt pro Bild 7,5 % des Restwegs. Bei 60 Hz läuft die Seite rund 1,2 s nach, bei 120 Hz nur halb so lange. Das „schwere“ Gefühl ist dokumentiert (README Z. 363–364) und hängt heute also vom Bildschirm ab.
*Empfehlung:* **Ja, zeitbasiert machen und die Zeitkonstante auf deinen Bildschirm eichen**, damit sich für dich nichts ändert und es überall gleich wirkt: 60 Hz → `TAU = 214` ms, 120 Hz → `107`, 144 Hz → `89`.
Umsetzung bei „Ja“:
- scroll.js:9 `const EASE = 0.075;` → `const TAU = <Wert>; /* ms, Zeitkonstante: auf jedem Bildschirm gleich */`
- Z. 13 um `, last = 0` ergänzen.
- `stop()` um `last = 0;` ergänzen.
- Z. 38 → `const now = performance.now(), dt = Math.min(50, last ? now - last : 16.7); last = now; current += (target - current) * (1 - Math.exp(-dt / TAU));`
- README Z. 364 „Anteil 0,075 des Restwegs pro Bild“ → „Zeitkonstante <Wert> ms, unabhängig von der Bildrate“.
