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
| `MENTOR_HISTORY_WINDOW` | `20` | Wie viele frühere Nachrichten ans Modell gehen |
| `MENTOR_MAX_TOKENS` | `700` | Maximale Antwortlänge |
| `MENTOR_TZ` | `Europe/Berlin` | Zeitzone für den Tageswechsel des Limits |
| `MENTOR_ALLOWED_ORIGINS` | `*` | Erlaubte Website-Ursprünge, kommagetrennt |
| `MENTOR_PROMPT_FILE` | `docs/mentor-systemprompt.md` | System-Prompt; alles vor der ersten `---`-Zeile wird nicht gesendet |
| `MENTOR_DB` | `server/data/mentor.sqlite` | SQLite-Datei mit den Verläufen |

## Schnittstelle

- `GET /api/mentor/health` → Modell, Limit, ob Prompt und Token gesetzt sind (ohne Token erreichbar)
- `GET /api/mentor/history?user=ID` → Verlauf und Kontingent des Nutzers
- `DELETE /api/mentor/history?user=ID` → Verlauf löschen
- `POST /api/mentor/chat` mit `{ "user": "ID", "message": "…", "context": { "app_name": "Journalyst", "user_name": "…", "glaubensmodus": true, "journal": "…" } }`
  → `{ "reply": "…", "quota": { "limit", "used", "remaining", "reset_at" } }`; bei erschöpftem Limit `429`

Die Nutzerkennung ist heute der Benutzername aus dem Profil der Website. Sobald es echte
Konten gibt, ersetzt ein Login-Token das Zugangstoken, und `user` kommt aus der Sitzung.

## Tests

```bash
pip install pytest httpx
pytest server/tests
```
