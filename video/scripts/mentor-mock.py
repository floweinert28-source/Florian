#!/usr/bin/env python3
"""Mini-Mentor für die Aufnahme: antwortet wie server/mentor_server.py (health, history, chat), nur mit einer festen Antwort.
Start: python3 scripts/mentor-mock.py 8788"""
import json, sys, time
from http.server import BaseHTTPRequestHandler, HTTPServer
from datetime import datetime, timezone

REPLIES = {
    "de": ("Zwischen 10 und 11 Uhr liegen deine teuersten Trades: 10 Stück, zusammen −4.740 €. Nach 17 Uhr noch einmal −1.265 € in 15 Trades. "
           "Zwischen 15 und 17 Uhr läuft es dagegen: 68 Trades, +14.701 €. Mein Vorschlag: Handelszeiten im Schatten-Ich auf 15–17 Uhr begrenzen und morgen nur dort handeln."),
    "en": ("Between 10 and 11 a.m. you take your most expensive trades: 10 of them, −$4,740 in total. After 5 p.m. another −$1,265 across 15 trades. "
           "Between 3 and 5 p.m. it works: 68 trades, +$14,701. My suggestion: limit trading hours in your Shadow Self to 3–5 p.m. and trade only there tomorrow."),
}
REPLY = REPLIES[(sys.argv[2] if len(sys.argv) > 2 else "en").lower()]
HISTORY = []

class H(BaseHTTPRequestHandler):
    def _send(self, code, body):
        data = json.dumps(body).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Authorization, Content-Type')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers(); self.wfile.write(data)
    def do_OPTIONS(self): self._send(204, {})
    def do_GET(self):
        now = datetime.now(timezone.utc).isoformat()
        if self.path.startswith('/api/mentor/health'):
            return self._send(200, {"ok": True, "model": "mock", "limit": 30, "prompt_loaded": True, "auth": False, "api_key": True, "voice_limit": 10, "stt": False, "emotions": []})
        if self.path.startswith('/api/mentor/history'):
            return self._send(200, {"messages": HISTORY, "quota": {"limit": 30, "used": len(HISTORY) // 2, "remaining": 30, "reset_at": now}})
        if self.path.startswith('/api/mentor/quota'):
            return self._send(200, {"limit": 30, "used": 0, "remaining": 30, "reset_at": now})
        return self._send(404, {"detail": {"error": "not_found", "message": "unbekannt"}})
    def do_POST(self):
        n = int(self.headers.get('Content-Length') or 0); raw = self.rfile.read(n) if n else b'{}'
        try: body = json.loads(raw or b'{}')
        except Exception: body = {}
        now = datetime.now(timezone.utc).isoformat()
        if self.path.startswith('/api/mentor/chat') or self.path.startswith('/api/mentor/message'):
            time.sleep(1.4)  # kurze Denkpause wie beim echten Modell
            HISTORY.append({"role": "user", "content": body.get("message", ""), "created_at": now})
            HISTORY.append({"role": "assistant", "content": REPLY, "created_at": now})
            return self._send(200, {"reply": REPLY, "at": now, "model": "mock", "quota": {"limit": 30, "used": 1, "remaining": 29, "reset_at": now}})
        return self._send(404, {"detail": {"error": "not_found", "message": "unbekannt"}})
    def log_message(self, *a): pass

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8788
    HTTPServer(('127.0.0.1', port), H).serve_forever()
