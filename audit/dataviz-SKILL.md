# Data Visualization (Kurzfassung des gebündelten dataviz-Skills; Referenzen liegen in /tmp/claude-0/bundled-skills/2.1.294/519242501d69fe8622fb32e21bc8832d/dataviz/references/)

Verfahren in Reihenfolge (Farbe kommt zuletzt):
1. Form wählen: Was ist die Aufgabe der Daten (Größe, Identität, Polarität, eine Kennzahl, Verlauf)? Die Aufgabe bestimmt den Diagrammtyp; manchmal ist kein Diagramm richtig (Kennzahl-Kachel). → choosing-a-form.md
2. Farbe nach Aufgabe: kategorisch (Identität, feste Reihenfolge, nie zyklisch), sequenziell (eine Farbe hell→dunkel), divergierend (zwei Pole + neutrale Mitte), Status (reserviert). → color-formula.md
3. Palette prüfen (Kontrast, Farbenblindheit, Abstand benachbarter Farben; Text immer in Text-Tokens, nie in Serienfarbe).
4. Marken: dünne Striche, 2px Linien, Punkte ≥ 8px nur gezielt, 2px Lücke zwischen Füllungen, abgerundete Enden an der Grundlinie, selektive Direktbeschriftung. Raster und Achsen zurückhaltend. → marks-and-anatomy.md
5. Hover-Schicht standardmäßig: Fadenkreuz + Tooltip bei Linien/Flächen, Tooltip je Marke bei Balken/Punkten/Zellen; Trefferflächen größer als die Marke. → interaction.md
6. Barrierefreiheit: ab 2 Serien Legende (bis 4 auch direkt beschriftet); Tabellenansicht; Dark Mode eigens abgestimmt, nicht nur invertiert.
7. Rendern und anschauen: Beschriftungs-Kollisionen, Geometrie, Überlauf.
Danach gegen anti-patterns.md prüfen (Doppelachsen, Regenbogen, Zahl an jedem Punkt, Farbe nach Rang statt Entität, Status-Farben als Serienfarbe …).
