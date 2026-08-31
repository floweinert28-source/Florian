# Aufgaben-Bot für Discord

Ein Discord-Bot, der Aufgaben in deinen Channels verwaltet: anlegen, zuweisen,
mit Frist versehen, abhaken — per Slash-Command oder per Klick auf die Buttons
unter der Aufgabe. Alles wird in einer SQLite-Datei gespeichert und übersteht
einen Neustart des Bots.

```
/task add titel:Server updaten zustaendig:@flo faellig:freitag 18:00 prioritaet:Hoch
```

Der Bot antwortet mit einer Aufgabenkarte, unter der „Übernehmen“ und
„Erledigt“ als Buttons stehen.

## Was der Bot kann

| Command | Wirkung |
| --- | --- |
| `/task add` | Legt eine Aufgabe an und postet sie als Karte mit Buttons |
| `/task list` | Zeigt die Aufgaben des Channels, gruppiert nach Status |
| `/task mine` | Deine offenen Aufgaben über alle Channels hinweg |
| `/task show` | Eine einzelne Aufgabe im Detail |
| `/task done` | Hakt eine Aufgabe ab |
| `/task reopen` | Öffnet eine erledigte Aufgabe wieder |
| `/task assign` | Weist zu (ohne Angabe: gibt die Aufgabe wieder frei) |
| `/task edit` | Ändert Titel, Notizen, Fälligkeit oder Priorität |
| `/task delete` | Löscht eine Aufgabe endgültig |
| `/task clear` | Räumt alle erledigten Aufgaben des Channels weg (nur Moderation) |

Dazu kommen:

- **Buttons an jeder Aufgabe** — „Übernehmen“, „Erledigt“, „Freigeben“,
  „Wieder öffnen“. Sie funktionieren auch an Wochen alten Nachrichten und nach
  einem Neustart des Bots.
- **Erinnerungen** — wird eine Aufgabe überfällig, meldet sich der Bot einmalig
  im Channel und pingt die zuständige Person.
- **Autovervollständigung** — bei `id`-Feldern schlägt Discord die Aufgaben des
  aktuellen Channels vor, du musst dir keine Nummern merken.
- **Drei Zustände** — offen 🔵, in Arbeit 🟠, erledigt 🟢.

### Fälligkeitsangaben

Das Feld `faellig` versteht unter anderem:

| Eingabe | Bedeutung |
| --- | --- |
| `2h`, `30min`, `3d`, `1w` | relativ ab jetzt |
| `1d 6h` | kombiniert |
| `heute 17:00`, `morgen`, `übermorgen` | Schlüsselwörter |
| `freitag`, `fr 18:00` | nächster Wochentag |
| `05.09.2026`, `5.9.26 8:00`, `24.12.` | deutsches Datum |
| `2026-09-05 14:30` | ISO-Format |

Ohne Uhrzeit gilt eine Aufgabe bis **Tagesende (23:59)**. Die Zeitzone stellst
du über `TIMEZONE` ein (Standard: `Europe/Berlin`). Angezeigt werden Fristen als
Discord-Zeitstempel — jede Person sieht sie automatisch in ihrer eigenen Zeitzone.

### Wer darf was ändern

Ändern und löschen dürfen die **erstellende Person**, die **zuständige Person**
und alle mit dem Recht *Nachrichten verwalten* (Moderation). Eine **freie**
Aufgabe darf dagegen jede Person im Channel übernehmen — das ist der Sinn eines
gemeinsamen Aufgabenbretts.

## Einrichtung

### 1. Bot bei Discord anlegen

1. Öffne das [Discord Developer Portal](https://discord.com/developers/applications)
   und klicke auf **New Application**.
2. Wechsle links zu **Bot** und dann auf **Reset Token** → **Copy**. Diesen
   Token brauchst du gleich. Er ist wie ein Passwort: nie weitergeben, nie
   committen.
3. Privilegierte Intents musst du **nicht** aktivieren — der Bot liest keine
   Nachrichteninhalte, er arbeitet ausschließlich über Slash-Commands.

### 2. Bot auf deinen Server einladen

Unter **OAuth2 → URL Generator** wählst du:

- Scopes: `bot` und `applications.commands`
- Bot Permissions: *View Channels*, *Send Messages*, *Embed Links*,
  *Read Message History*

Oder du nimmst direkt diesen Link und ersetzt `DEINE_CLIENT_ID` durch die
Application ID aus dem Portal:

```
https://discord.com/api/oauth2/authorize?client_id=DEINE_CLIENT_ID&permissions=84992&scope=bot%20applications.commands
```

### 3. Projekt starten

```bash
git clone https://github.com/floweinert28-source/Florian.git
cd Florian

python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env             # Windows: copy .env.example .env
# .env öffnen und DISCORD_TOKEN eintragen

python main.py
```

Im Log sollte stehen: `Angemeldet als DeinBot#1234`. Tippe im Discord-Channel
`/task` — die Commands tauchen auf.

> **Tipp für den Anfang:** Trage in der `.env` auch `GUILD_ID` ein (Rechtsklick
> auf deinen Server → *Server-ID kopieren*, dafür muss der Entwicklermodus in
> den Discord-Einstellungen aktiv sein). Dann sind Command-Änderungen sofort
> sichtbar. Ohne `GUILD_ID` registriert Discord global und braucht dafür bis zu
> einer Stunde.

### 4. Einstellungen

Alle Einstellungen laufen über die `.env` (Vorlage: `.env.example`):

| Variable | Standard | Bedeutung |
| --- | --- | --- |
| `DISCORD_TOKEN` | — | **Pflicht.** Der Bot-Token |
| `GUILD_ID` | leer | Server-ID für sofortige Command-Registrierung |
| `DATABASE_PATH` | `data/tasks.db` | Speicherort der SQLite-Datei |
| `TASK_REMINDERS` | `true` | Erinnerungen an überfällige Aufgaben |
| `REMINDER_INTERVAL_MINUTES` | `5` | Prüfintervall für Erinnerungen |
| `TIMEZONE` | `Europe/Berlin` | Zeitzone für Eingaben wie `morgen 09:00` |

## Dauerhaft laufen lassen

Der Bot muss laufen, damit die Commands reagieren. Auf einem Linux-Server
genügt eine systemd-Unit:

```ini
# /etc/systemd/system/tasksbot.service
[Unit]
Description=Discord Aufgaben-Bot
After=network-online.target

[Service]
Type=simple
User=tasksbot
WorkingDirectory=/opt/tasksbot
ExecStart=/opt/tasksbot/.venv/bin/python main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now tasksbot
sudo journalctl -u tasksbot -f      # Log mitlesen
```

Sichere dabei die Datei aus `DATABASE_PATH` mit — dort stehen alle Aufgaben.

## Entwicklung

```bash
pip install -r requirements-dev.txt
python -m pytest                    # 116 Tests, laufen ohne Discord-Verbindung
```

Die Logik ist bewusst von Discord getrennt: `models.py`, `storage.py`,
`timeparse.py` und `config.py` kommen ohne `discord`-Import aus und sind damit
direkt testbar.

```
main.py                  Einstiegspunkt (python main.py)
tasksbot/
  bot.py                 Bot-Klasse, Command-Sync, Fehlerbehandlung
  config.py              Einstellungen aus der Umgebung
  models.py              Task, Status, Priority
  storage.py             SQLite-Persistenz (async, blockiert den Loop nicht)
  timeparse.py           Parser für Fälligkeitsangaben
  ui.py                  Embeds und Buttons
  cogs/tasks.py          die /task-Commands und die Erinnerungsschleife
tests/                   pytest-Suite
```

### Eigene Commands ergänzen

Neue Befehle kommen als Methode in `tasksbot/cogs/tasks.py`:

```python
@app_commands.command(name="count", description="Zählt die offenen Aufgaben")
async def count(self, interaction: discord.Interaction) -> None:
    counts = await self.store.count_by_status(guild_id=interaction.guild_id)
    await interaction.response.send_message(f"{counts[Status.OPEN]} offen.")
```

Ein eigenes Themengebiet gehört besser in ein neues Cog: Datei unter
`tasksbot/cogs/` anlegen und in `EXTENSIONS` in `tasksbot/bot.py` eintragen.

## Fehlersuche

| Symptom | Ursache |
| --- | --- |
| `/task` erscheint nicht | Ohne `GUILD_ID` dauert die globale Registrierung bis zu 1 Stunde. Prüfe außerdem, ob der Scope `applications.commands` beim Einladen gesetzt war. |
| `Discord hat den Token abgelehnt` | Der Token in der `.env` ist falsch oder wurde zurückgesetzt. Im Portal neu erzeugen. |
| Buttons reagieren nicht | Läuft der Bot noch? Nach einem Absturz greifen die Buttons erst wieder, wenn er neu gestartet ist. |
| Bot antwortet nicht im Channel | Ihm fehlen dort *Nachrichten senden* oder *Links einbetten*. Kanalspezifische Rechte prüfen. |
| Erinnerungen bleiben aus | `TASK_REMINDERS=true` gesetzt? Erinnert wird pro Aufgabe nur einmal. |
