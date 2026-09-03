# Breite Edge-Suche auf dem Mac ausführen

Voraussetzungen: Claude Code CLI installiert, python3 vorhanden (macOS: `xcode-select --install` reicht), Repo aktuell.

1. Terminal:
   ```bash
   cd ~/Desktop/Florian && git pull && claude
   ```
2. In Claude Code diesen Text eingeben (Pfad ggf. anpassen, falls das Repo woanders liegt):

   > Führe den Workflow `backtest/research/workflows/hf_search.js` mit dem Workflow-Tool aus, `args` = `{"base": "<absoluter Pfad zum Repo, z.B. /Users/flo/Desktop/Florian>"}`. Ultracode/Multi-Agent ist gewünscht. Falls das Workflow-Tool nicht verfügbar ist: Lies das Skript und führe die 8 Forschungsaufträge (FAMILIES) als parallele Agenten mit dem Agent-Tool aus, danach je Survivor einen Skeptiker-Agenten, dann den Synthese-Bericht nach `backtest/REPORT_R4_MAC.md`, committen und pushen.

3. Fertig ist es, wenn `backtest/REPORT_R4_MAC.md` gepusht wurde (die Cloud-Session liest ihn dann automatisch).

Hinweise: Der erste Datenload baut Caches (`*.pkl`, ~1–2 min pro Instrument, werden nicht committet). Agenten schreiben nur nach `backtest/research/mac/`.
