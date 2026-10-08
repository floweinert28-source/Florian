# Journalyst Mentor-Server

Kleiner Python-Server für den Mentor-Chat. Er ruft das Sprachmodell auf, hält den
API-Schlüssel geheim, speichert den Chatverlauf pro Nutzer und begrenzt die Nachrichten
pro Nutzer und Tag. Die Website spricht ihn über `POST /api/mentor/chat` an.

## Starten

```bash
pip install -r server/requirements.txt
export ANTHROPIC_API_KEY=sk-ant-...        # nur hier, nie im Frontend
export MENTOR_APP_TOKEN=ein-langes-geheimes-token
uvicorn server.mentor_server:app --host 0.0.0.0 --port 8787
```

Oder mit Docker: `docker build -t journalyst-mentor -f server/Dockerfile .` und
`docker run -p 8787:8787 -e ANTHROPIC_API_KEY=... -e MENTOR_APP_TOKEN=... -v mentor-data:/app/server/data journalyst-mentor`.

Danach in Journalyst unter **Einstellungen → Mentor** die Adresse (z. B. `https://mentor.deine-domain.de`)
und dasselbe Token eintragen. „Verbindung testen“ ruft `/api/mentor/health` auf.

## Umgebungsvariablen

| Variable | Standard | Bedeutung |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | – | Schlüssel für das Sprachmodell (Pflicht) |
| `MENTOR_APP_TOKEN` | leer | Zugangstoken, das die Website als `Authorization: Bearer …` mitschickt. Leer = kein Schutz (nur lokal sinnvoll) |
| `MENTOR_MODEL` | `claude-sonnet-5` | Modell |
| `MENTOR_DAILY_LIMIT` | `30` | Nachrichten pro Nutzer und Tag |
| `MENTOR_HISTORY_WINDOW` | `20` | Wie viele frühere Nachrichten (Fragen und Antworten zusammen) ans Modell gehen |
| `MENTOR_MAX_TOKENS` | `700` | Maximale Antwortlänge |
| `MENTOR_TZ` | `Europe/Berlin` | Zeitzone für den Tageswechsel des Limits |
| `MENTOR_ALLOWED_ORIGINS` | `*` | Erlaubte Website-Ursprünge, kommagetrennt |
| `MENTOR_PROMPT_FILE` | `docs/mentor-systemprompt.md` | System-Prompt; alles vor der ersten `---`-Zeile wird nicht gesendet |
| `MENTOR_DB` | `server/data/mentor.sqlite` | SQLite-Datei mit den Verläufen |
| `VOICE_DAILY_LIMIT` | `30` | Sprachnotizen (Auswertungen) pro Nutzer und Tag, getrennt vom Chat-Limit |
| `VOICE_MAX_TOKENS` | `600` | Maximale Länge der Auswertung |
| `VOICE_STT_URL` | leer | Optional: OpenAI-kompatibler Speech-to-Text-Endpunkt (z. B. `https://api.openai.com/v1/audio/transcriptions`) für Browser ohne eigene Spracherkennung. Leer = nur Browser-Transkript |
| `VOICE_STT_KEY` | leer | Schlüssel für den Transkriptions-Dienst (nur hier, nie im Frontend) |
| `VOICE_STT_MODEL` | `whisper-1` | Modellname für den Transkriptions-Dienst |

## Schnittstelle

- `GET /api/mentor/health` → Modell, Limit, ob Prompt, Zugangstoken und API-Schlüssel gesetzt sind (ohne Token erreichbar)
- `GET /api/mentor/history?user=ID` → Verlauf und Kontingent des Nutzers
- `DELETE /api/mentor/history?user=ID` → Verlauf löschen
- `POST /api/mentor/chat` mit `{ "user": "ID", "message": "…", "context": { "app_name": "Journalyst", "user_name": "…", "glaubensmodus": true, "journal": "…" } }`
  → `{ "reply": "…", "quota": { "limit", "used", "remaining", "reset_at" } }`; bei erschöpftem Limit `429`
- `POST /api/voice/analyze` mit `{ "user": "ID", "transcript": "…", "audio": "<Base64, optional>", "mime": "audio/mp4", "language": "de", "setups": ["…"], "mistakes": ["…"], "trade": "…" }`
  → `{ "transcript", "emotion" (feste Liste, siehe `/health`), "setup" (aus den Setups des Nutzers oder leer), "mistakes" (nur Fehler-Tags des Nutzers), "summary", "source": "browser"|"server", "quota" }`.
  Das Transkript kommt normalerweise aus der Spracherkennung des Browsers (Safari, Chrome); ohne Transkript und mit `VOICE_STT_URL` transkribiert der Server die Aufnahme. Ohne beides `422`.

Die Nutzerkennung ist heute der Benutzername aus dem Profil der Website (ohne Benutzername eine
zufällige Kennung des Geräts). Das Zugangstoken ist für alle Nutzer einer Installation dasselbe:
Wer es hat, gilt als vertrauenswürdig und kann jede Nutzerkennung angeben. Für eine Gruppe,
die sich nicht vertraut, braucht es erst echte Konten. Sobald es die gibt, ersetzt ein Login-Token
das Zugangstoken, und `user` kommt aus der Sitzung.

Das Tageslimit zählt in einer eigenen Tabelle und wird durch Löschen des Verlaufs nicht zurückgesetzt.

## Coach Mode (`server/coach.py`)

Derselbe Server trägt den Coach Mode: Gruppen eines Mentors, Beitritt der Schüler per Link, Kurz-Stats und
Journal-Ansicht für den Mentor, Mentor-Notizen für den Schüler. Alles unter `/api/coach/…`, mit demselben
Zugangstoken wie der Chat **plus** einer Kopfzeile `X-Coach-Key`: ein geheimer Schlüssel, den jede
Journalyst-Installation sich selbst anlegt (der Server speichert nur den SHA-256 und hängt daran eine Nutzer-ID).
So gibt es Rechte-Trennung ohne Konten: der Mentor sieht genau die Schüler seiner Gruppen, ein Schüler nie einen
anderen, und niemand kann sich als jemand anderes ausgeben, ohne dessen Gerät zu haben.

Was vom Schüler auf dem Server liegt: Journal-Einträge (Notebook ohne Trade-Notizen, als Quill-Delta; Bilder als
Verweis auf hochgeladene Dateien) und Tages-Summen (Anzahl, Gewinne, Verluste, Break-even, Summen der R, Ergebnis
in R und in Prozent der Kontogröße). Keine einzelnen Trades, keine Beträge, keine Kontostände: es gibt dafür weder
Tabellen noch Endpunkte. Verlässt ein Schüler seine letzte Gruppe (oder der Mentor schließt sie), löscht der Server
seine Einträge, Summen und Bilder; die Mentor-Notizen behält die Website des Schülers als Kopie.

Tabellen (`coach_*`, Migrationen in `CoachStore.MIGRATIONS`, Stand in `coach_schema`): Nutzer, Gruppen, Mitgliedschaften
(mit Stichtag `since`), Einträge, Tages-Summen, Notizen, Gelesen-Stand des Mentors, Bilder.

- `POST /api/coach/me` `{ "name" }` → Nutzer, Mitgliedschaften (`groups`) und eigene Gruppen (`own`)
- Mentor: `POST /groups` `{ "name" }`, `GET /groups`, `PATCH /groups/{id}`, `POST /groups/{id}/invite/rotate`, `DELETE /groups/{id}` (schließen),
  `GET /groups/{id}/students?period=week|month|all` (Kurz-Stats, letzter Eintrag, neue Einträge seit dem letzten Besuch),
  `GET /groups/{id}/students/{sid}/journal` (Einträge, Notizen; markiert als gelesen),
  `POST /groups/{id}/students/{sid}/notes` `{ "entry_id", "text" }`, `PATCH /notes/{id}`, `DELETE /notes/{id}` (nur eigene)
- Schüler: `GET /invite/{token}`, `POST /invite/{token}/join` `{ "name", "since": "YYYY-MM-DD" | null }`, `POST /groups/{id}/leave`,
  `PUT /sync` `{ "entries": […], "days": […] }` (vollständiger Stand, ersetzt den alten; antwortet mit den Mentor-Notizen),
  `GET /notes`, `POST /assets` `{ "mime", "data": "<Base64>" }` (höchstens 1,5 MB)
- `GET /api/coach/assets/{id}`: Bilder ohne Kopfzeilen (für `<img src>`); die Adresse ist ein 128-Bit-Zufallswert und steht nur in geteilten Einträgen.

## Tests

```bash
pip install pytest httpx
pytest server/tests        # Mentor-Chat, Sprachjournal und Coach Mode
```
