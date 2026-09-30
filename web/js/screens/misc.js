/* Einstellungen (Aufbau nach TradeZella): Bereiche links, Inhalt rechts */
(function (root) {
  'use strict';
  const C = root.Core, S = root.Store, U = root.UI, I = U.I, esc = U.esc, fmt = U.fmt, App = root.App;

  const SECTIONS = [
    ['profil', 'Profil', 'account'], ['design', 'Design', 'sun'], ['benachrichtigungen', 'Benachrichtigungen', 'bell'], ['abo', 'Abo', 'card'], null,
    ['konten', 'Konten', 'folder'], ['trading', 'Trading', 'stats'], ['regeln', 'Regeln', 'shield'], ['notebook', 'Notebook', 'journal'], ['mentor', 'Mentor', 'chat'], ['inhalte', 'Inhalte', 'tag'], ['logs', 'Logs', 'clock'],
  ];
  const KINDS = { setups: { label: 'Setups', color: 'var(--accent)', cls: 'setup' }, mistakes: { label: 'Fehler', color: 'var(--loss)', cls: 'mistake' }, emotions: { label: 'Emotionen', color: 'var(--be)', cls: 'emotion' } };
  const INSTRUMENTS = [['aktien', 'Aktien'], ['forex', 'Forex'], ['futures', 'Futures'], ['optionen', 'Optionen'], ['krypto', 'Krypto'], ['sonstiges', 'Sonstiges']];
  const NB_DEFAULT = { h1: 30, h2: 24, h3: 19, body: 16, strike: true };
  const ui = () => App.state.settingsUI || (App.state.settingsUI = { contentTab: 'kategorien', tagQ: '', tagFilter: '', logTab: 'imports', logQ: '', logFilter: '' });
  const head = (title, sub, trailing = '') => `<div class="set-head"><div><h2>${esc(title)}</h2><p class="muted">${sub}</p></div>${trailing}</div>`;
  const switchRow = (title, text, action, on, extra = '') => `<div class="set-row"><button type="button" class="switch" role="switch" aria-checked="${!!on}" data-action="${action}" ${extra} aria-label="${esc(title)}"></button><div><b>${esc(title)}</b><div class="small muted">${text}</div></div></div>`;

  App.screens.settings = {
    title: 'Einstellungen',
    render(ctx) {
      const sec = SECTIONS.some(s => s && s[0] === ctx.params[0]) ? ctx.params[0] : 'profil';
      const nav = `<nav class="set-nav">${SECTIONS.map(s => s ? `<a href="#/settings/${s[0]}" class="${sec === s[0] ? 'active' : ''}">${I[s[2]]}<span>${s[1]}</span></a>` : '<hr>').join('')}</nav>`;
      const body = ({ profil, design, benachrichtigungen, abo, konten, trading, regeln, notebook, mentor, inhalte, logs })[sec]();
      return `<div class="settings">${nav}<section class="set-body">${body}</section></div>`;
    },
  };

  /* ---------- Profil ---------- */
  /* Bild quadratisch zuschneiden, verkleinern und als JPEG ablegen: klein, schnell, in jedem Browser anzeigbar */
  function shrinkImage(file, size) {
    return new Promise((res, rej) => { const url = URL.createObjectURL(file); const img = new Image(); img.onload = () => { try { const c = document.createElement('canvas'); c.width = size; c.height = size; const g = c.getContext('2d'); const w = img.naturalWidth, h = img.naturalHeight; if (!w || !h) throw new Error('leer'); const sq = Math.min(w, h); g.drawImage(img, (w - sq) / 2, (h - sq) / 2, sq, sq, 0, 0, size, size); c.toBlob(b => b ? res(b) : rej(new Error('encode')), 'image/jpeg', 0.88); } catch (e) { rej(e); } finally { URL.revokeObjectURL(url); } }; img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('decode')); }; img.src = url; });
  }
  function timezones() { let list = []; try { list = Intl.supportedValuesOf('timeZone'); } catch (e) { list = ['Europe/Berlin', 'Europe/Vienna', 'Europe/Zurich', 'Europe/London', 'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'Asia/Tokyo', 'Asia/Singapore', 'Australia/Sydney', 'UTC']; } return list; }
  function profil() {
    const st = S.settings; const pr = Object.assign({ firstName: '', lastName: '', username: '', email: '', address: '', bio: '', timezone: '' }, st.profile || {}); const tz = pr.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone; const priv = st.privacy || {};
    const initials = (st.name || 'T').split(/\s+/).map(x => x[0]).join('').slice(0, 2).toUpperCase();
    return head('Profil', 'Deine persönlichen Angaben.') + `
      <form data-action="save-profile" class="set-block stack" style="gap:18px">
        <div class="avatar-row"><label class="avatar-big" title="Foto hochladen">${st.avatarId ? `<img data-blob="${esc(st.avatarId)}" alt="Profilbild">` : `<span>${esc(initials)}</span>`}<span class="cam">${I.image}</span><input type="file" accept="image/*" data-change="avatar-file" class="hidden"></label><div class="stack" style="gap:8px"><div><b>Profilbild</b><div class="small muted">PNG oder JPG, wird nur in diesem Browser gespeichert.</div></div><div class="row"><button type="button" class="btn sm" data-action="avatar-upload">${I.upload} Hochladen</button><button type="button" class="btn sm ghost" data-action="avatar-remove" ${st.avatarId ? '' : 'disabled'}>${I.trash} Entfernen</button></div></div></div>
        <div class="form-grid" style="max-width:720px">
          <div class="field"><label for="pf-first">Vorname</label><input class="input" id="pf-first" name="firstName" value="${esc(pr.firstName)}" autocomplete="given-name"></div>
          <div class="field"><label for="pf-last">Nachname</label><input class="input" id="pf-last" name="lastName" value="${esc(pr.lastName)}" autocomplete="family-name"></div>
          <div class="field"><label for="pf-user">Benutzername</label><input class="input" id="pf-user" name="username" value="${esc(pr.username)}" autocomplete="username"></div>
          <div class="field"><label for="pf-mail">E-Mail</label><input class="input" id="pf-mail" name="email" type="email" value="${esc(pr.email)}" autocomplete="email"></div>
          <div class="field span2"><label for="pf-addr">Adresse</label><input class="input" id="pf-addr" name="address" value="${esc(pr.address)}" autocomplete="street-address" placeholder="Straße, PLZ Ort"></div>
          <div class="field span2"><label for="pf-bio">Bio</label><textarea class="input" id="pf-bio" name="bio" rows="3" maxlength="400" placeholder="Ein paar Worte zu dir und deinem Trading">${esc(pr.bio)}</textarea></div>
          <div class="field"><label for="pf-tz">Zeitzone</label><select class="select" id="pf-tz" name="timezone">${timezones().map(z => `<option value="${esc(z)}" ${z === tz ? 'selected' : ''}>${esc(z.replace(/_/g, ' '))}</option>`).join('')}</select></div>
          <div class="field"><label for="pf-cur">Standardwährung</label><select class="select" id="pf-cur" name="currency">${['EUR', 'USD', 'CHF', 'GBP'].map(c => `<option ${st.currency === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
        </div>
        <div class="row"><button type="submit" class="btn primary">Speichern</button><button type="button" class="btn" data-action="pw-reset">Passwort zurücksetzen</button></div>
      </form>
      <div class="set-block"><h3>Privatsphäre</h3><div class="small muted" style="margin-bottom:12px">So gehen wir mit deinen Daten um.</div><form data-action="save-privacy" class="stack"><label class="check" style="align-items:flex-start"><input type="checkbox" name="support" ${priv.support ? 'checked' : ''} style="margin-top:3px"><span><b>Support-Team Zugriff auf mein Konto erlauben</b><div class="small muted">Wenn aktiviert, kann das Support-Team auf dein Konto zugreifen, um dir besser zu helfen und Fehler zu finden.</div></span></label><div><button type="submit" class="btn sm">Speichern</button></div></form></div>
      <div class="set-block"><h3>Ruhepunkt</h3>${switchRow('Christlicher Impuls', 'Zeigt in den Ruhepunkt-Sessions Bibelverse, Gebete und Atemgebete statt neutraler Leitsätze. Der Mentor-Chat nutzt diese Einstellung später ebenfalls.', 'faith-toggle', st.christlicherImpuls !== false)}</div>
      <div class="set-block"><h3>Zwei-Faktor-Authentifizierung</h3><div class="small muted" style="margin-bottom:12px">Zusätzliche Sicherheit für dein Konto über eine Authenticator-App (z. B. Google Authenticator, Authy).</div><div class="row" style="gap:14px"><span class="muted">2FA ist nicht aktiviert</span><button type="button" class="btn primary sm" data-action="twofa">2FA aktivieren</button></div></div>
      <div class="set-block"><h3>Daten und Sicherung</h3><div class="stack" style="gap:12px">
        <div class="row between" style="gap:12px"><div><b>Sicherung exportieren</b><div class="small muted">Alle Trades, Notizen und Einstellungen als JSON. Optional mit Bildern und Audio.</div></div><div class="row"><button type="button" class="btn sm" data-action="export" data-blobs="0">${I.download} Ohne Anhänge</button><button type="button" class="btn sm" data-action="export" data-blobs="1">${I.download} Mit Anhängen</button></div></div>
        <div class="row between" style="gap:12px"><div><b>Sicherung einspielen</b><div class="small muted">JSON-Datei aus einem Export. „Zusammenführen“ behält vorhandene Daten.</div></div><div class="row"><button type="button" class="btn sm" data-action="import-backup" data-mode="merge">${I.upload} Zusammenführen</button><button type="button" class="btn sm" data-action="import-backup" data-mode="replace">${I.upload} Ersetzen</button></div></div>
        <div class="row between" style="gap:12px"><div><b>Beispieldaten</b><div class="small muted">Rund 170 Trades über vier Monate mit Check-ins, Notizen und Regeln. Jederzeit entfernbar.</div></div>${st.sampleInstalled ? `<button type="button" class="btn sm danger" data-action="remove-sample">Entfernen</button>` : `<button type="button" class="btn sm" data-action="install-sample">Laden</button>`}</div>
        <div class="divider"></div>
        <div class="row between" style="gap:12px"><div><b class="neg">Alles löschen</b><div class="small muted">Entfernt alle Daten aus diesem Browser. Vorher exportieren!</div></div><button type="button" class="btn sm danger" data-action="wipe">${I.trash} Alles löschen</button></div>
        <div class="small faint">Speicherort: dieser Browser (localStorage und IndexedDB). ${S.storageOK ? '' : '<span class="neg">Achtung: Speichern ist derzeit nicht möglich (privates Fenster oder blockierte Website-Daten).</span>'} Tastatur: <b>N</b> neuer Trade · <b>1–6</b> Bereiche · <b>Esc</b> schließt Dialoge.</div></div></div>`;
  }

  /* ---------- Design: Erscheinungsbild, Schrift, Farben ---------- */
  const HUE = h => { const [r, g, b] = h.replace('#', '').match(/../g).map(x => parseInt(x, 16) / 255); const max = Math.max(r, g, b), min = Math.min(r, g, b); const d = max - min; if (!max || d / max < 0.12) return 999; let hue = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4; return hue * 60; };
  function design() {
    const st = S.settings; const T = root.Theme; const col = st.colors || {}; const defs = T.DEFAULTS[st.theme === 'light' ? 'light' : 'dark']; const cur = { accent: col.accent || defs.accent, profit: col.profit || defs.profit, loss: col.loss || defs.loss, be: col.be || defs.be };
    Object.keys(T.FONTS).forEach(T.loadFont); const fontKey = T.FONTS[st.font] ? st.font : 'standard';
    const accents = T.PRESETS_ACCENT.slice().sort((a, b) => HUE(a[1]) - HUE(b[1]));
    const fonts = Object.entries(T.FONTS).map(([k, f]) => `<button type="button" class="font-card" data-action="font-set" data-value="${k}" aria-pressed="${fontKey === k}" style="font-family:${f.text.replace(/"/g, '&quot;')}"><span class="sample">Aa</span><span class="nums" style="${k === 'standard' && f.num ? `font-family:${f.num.replace(/"/g, '&quot;')}` : ''}">1.234,50 €</span><b>${f.name}</b><small>${f.desc}</small></button>`).join('');
    const pairs = T.PRESETS_PAIR.map(([n, p, l]) => `<button type="button" class="pair-card" data-action="color-pair" data-profit="${p}" data-loss="${l}" aria-pressed="${cur.profit.toLowerCase() === p && cur.loss.toLowerCase() === l}"><span class="pv"><i style="background:${p}">+240&nbsp;€</i><i style="background:${l}">−120&nbsp;€</i></span><b>${n}</b></button>`).join('');
    const picker = (key, label, val) => `<label class="cpick"><input type="color" value="${val}" data-input="color-set" data-key="${key}" aria-label="${label}"><i style="background:${val}"></i><span>${label}</span></label>`;
    return head('Design', 'Erscheinungsbild, Schrift und Farben. Wirkt sofort auf die ganze Website.') + `
      <div class="set-block"><h3>Erscheinungsbild</h3>${U.seg([['dark', 'Dunkel'], ['light', 'Hell']], st.theme || 'dark', 'theme')}</div>
      <div class="set-block"><h3>Schriftart</h3><div class="small muted" style="margin-bottom:12px">Gilt für Text und Zahlen auf der ganzen Website.</div><div class="font-grid">${fonts}</div></div>
      <div class="set-block"><h3>Akzentfarbe</h3><div class="small muted" style="margin-bottom:12px">Buttons, aktive Einträge und Diagramme.</div><div class="dots">${accents.map(([n, c]) => `<button type="button" class="dot" data-action="color-preset" data-key="accent" data-value="${c}" aria-pressed="${cur.accent.toLowerCase() === c}" data-tip="${n}" style="--c:${c}"></button>`).join('')}<label class="dot custom" data-tip="Eigene Farbe wählen"><input type="color" value="${cur.accent}" data-input="color-set" data-key="accent" aria-label="Eigene Akzentfarbe">${I.plus}</label></div></div>
      <div class="set-block"><h3>Gewinn, Verlust und Break-even</h3><div class="small muted" style="margin-bottom:12px">Farben für Plus, Minus und Break-even in Zahlen, Kalendern und Diagrammen.</div><div class="pair-grid">${pairs}</div><div class="cpick-row">${picker('profit', 'Gewinn', cur.profit)}${picker('loss', 'Verlust', cur.loss)}${picker('be', 'Break-even', cur.be)}<button type="button" class="btn sm ghost" data-action="color-reset" style="margin-left:auto">${I.close} Standardfarben</button></div></div>
      `;
  }

  /* ---------- Mentor ---------- */
  function mentor() {
    const m = Object.assign({ url: '', token: '' }, S.settings.mentor || {});
    return head('Mentor', 'Dein Trading-Psychologie-Mentor läuft über einen eigenen Server, damit der API-Schlüssel nie im Browser landet.') + `
      <form data-action="save-mentor" class="set-block stack" style="gap:14px">
        <div class="field"><label for="mentor-url">Server-Adresse</label><input class="input" id="mentor-url" name="url" type="url" value="${esc(m.url)}" placeholder="https://mentor.deine-domain.de" autocomplete="off"><div class="small muted" style="margin-top:6px">Der Server aus <code>server/</code> im Projekt. Anleitung in <code>server/README.md</code>.</div></div>
        <div class="field"><label for="mentor-token">Zugangstoken</label><input class="input" id="mentor-token" name="token" type="password" value="${esc(m.token)}" placeholder="Wert von MENTOR_APP_TOKEN" autocomplete="off"><div class="small muted" style="margin-top:6px">Derselbe Wert wie auf dem Server. Nicht der API-Schlüssel des Sprachmodells, der bleibt nur auf dem Server.</div></div>
        <div class="row"><button type="submit" class="btn primary">Speichern</button><button type="button" class="btn" data-action="mentor-test">Verbindung testen</button><span class="small muted" id="mentor-test-out"></span></div>
      </form>
      <div class="set-block"><h3>So funktioniert es</h3><div class="stack small muted" style="gap:6px"><div>Vor jedem Gespräch bekommt der Mentor deinen Namen, den Glaubensmodus aus dem Ruhepunkt (Einstellungen → Profil → Christlicher Impuls) und eine kurze Zusammenfassung deiner letzten 20 Trades und des heutigen Ruhepunkt-Check-ins.</div><div>Der Verlauf wird pro Nutzer auf dem Server gespeichert. Das Tageslimit legt der Server fest (Standard 30 Nachrichten), damit die Kosten kontrollierbar bleiben.</div><div>Nutzerkennung ist dein Benutzername aus dem Profil, aktuell: <b>${esc(S.userId())}</b>.</div></div></div>`;
  }

  /* ---------- Benachrichtigungen ---------- */
  function benachrichtigungen() {
    const n = S.settings.notifications || {};
    return head('Benachrichtigungen', 'Zusammenfassungen deiner Performance. Sie erscheinen als Hinweis oben auf dem Dashboard.') + `<div class="set-block stack" style="gap:18px">
      ${switchRow('Wöchentlicher Performance-Recap', 'Jeden Montag eine Zusammenfassung deiner Trading-Performance der Vorwoche. Wird ausgelöst, wenn bis Sonntag mindestens 4 geschlossene Trades geloggt wurden.', 'notif-toggle', n.weekly, 'data-key="weekly"')}
      ${switchRow('Monatlicher Performance-Recap', 'Am 2. jedes Monats eine Zusammenfassung des Vormonats. Wird ausgelöst, wenn bis zum 1. des Monats mindestens 4 geschlossene Trades geloggt wurden.', 'notif-toggle', n.monthly, 'data-key="monthly"')}
    </div>`;
  }

  /* ---------- Abo ---------- */
  function abo() { return head('Abo', 'Verwaltung deines Plans.') + `<div class="set-block"><div class="dashed" style="padding:26px;text-align:center"><b style="display:block;color:var(--text);font-size:15px;margin-bottom:6px">Kostenlos, alle Funktionen enthalten</b>Es gibt derzeit kein Abo. Dieser Bereich wird später ergänzt.</div></div>`; }

  /* ---------- Konten ---------- */
  function konten() {
    const acc = S.data.accounts; const st = S.settings;
    return head('Konten', 'Alle angelegten Handelskonten. Die Kontogröße bestimmt Tageslimit, Score-Drawdown und Monte Carlo.', `<button type="button" class="btn sm primary" data-action="edit-account">${I.plus} Konto hinzufügen</button>`) + `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Name</th><th class="r">Kontogröße</th><th>Währung</th><th class="r">Trades</th><th class="r">Netto-P&L</th><th></th></tr></thead><tbody>${acc.map(a => { const list = C.deriveAll(S.trades().filter(t => t.accountId === a.id)); const s = C.summary(list); return `<tr><td><b>${esc(a.name)}</b>${st.accountId === a.id ? ' ' + U.pill('aktiv', 'win') : ''}</td><td class="r">${fmt.num(a.size, 0)}</td><td>${esc(a.currency || st.currency)}</td><td class="r">${list.length}</td><td class="r">${list.length ? U.pnl(s.total) : '—'}</td><td class="r"><button type="button" class="btn ghost icon sm" data-action="edit-account" data-id="${a.id}" aria-label="Bearbeiten">${I.edit}</button>${acc.length > 1 ? `<button type="button" class="btn ghost icon sm" data-action="delete-account" data-id="${a.id}" aria-label="Löschen">${I.trash}</button>` : ''}</td></tr>`; }).join('')}</tbody></table></div>`;
  }

  /* ---------- Trading ---------- */
  function trading() {
    const st = S.settings; const ins = st.instruments || []; const be = st.beOffset || { mode: 'abs', from: 0, to: 0 }; const cur = S.currency(); const unit = be.mode === 'pct' ? '%' : cur;
    return head('Trading', 'Passe dein Trading-Erlebnis an.') + `<form data-action="save-trading" class="stack" style="gap:22px">
      <div class="set-block"><h3>Was handelst du?</h3><div class="chips" style="gap:8px">${INSTRUMENTS.map(([k, l]) => `<button type="button" class="chip sel big" data-action="instrument-toggle" data-value="${k}" aria-pressed="${ins.includes(k)}">${l}</button>`).join('')}</div></div>
      <div class="set-block"><h3>Break-even-Bereich</h3><div class="small muted" style="margin-bottom:10px">Ergebnisse in diesem Bereich zählen als Break-even, nicht als Gewinn oder Verlust.</div>
        <div class="row" style="gap:16px;align-items:flex-end"><div class="field"><span class="lbl">Einheit</span>${U.seg([['pct', '%'], ['abs', cur]], be.mode, 'be-mode')}</div><div class="field"><label for="be-from">Von</label><div class="input-unit"><span>${unit}</span><input class="input" type="number" step="0.01" max="0" id="be-from" name="from" value="${be.from}" inputmode="decimal"></div></div><div class="field"><label for="be-to">Bis</label><div class="input-unit"><span>${unit}</span><input class="input" type="number" step="0.01" min="0" id="be-to" name="to" value="${be.to}" inputmode="decimal"></div></div></div>
        <button type="button" class="btn ghost sm" data-action="be-reset" style="margin-top:6px;color:var(--muted)">Auf Standard zurücksetzen</button></div>
      <div class="set-block"><h3>Risiko und Warnungen</h3><div class="form-grid" style="max-width:560px"><div class="field"><label for="se-loss">Tagesverlustlimit (% vom Konto)</label><input class="input" type="number" step="0.5" min="0" id="se-loss" name="dailyLossLimitPct" value="${st.dailyLossLimitPct}" inputmode="decimal"></div><div class="field"><label for="se-ruin">Ruin-Schwelle Monte Carlo (% Drawdown)</label><input class="input" type="number" step="5" min="5" max="95" id="se-ruin" name="ruinDrawdownPct" value="${st.ruinDrawdownPct}" inputmode="decimal"></div><div class="field"><label for="se-runs">Monte-Carlo-Durchläufe</label><select class="select" id="se-runs" name="mcRuns">${[500, 1000, 2000, 5000].map(n => `<option ${st.mcRuns === n ? 'selected' : ''}>${n}</option>`).join('')}</select></div></div>
        <label class="check" style="margin-top:12px;align-items:flex-start"><input type="checkbox" name="tiltWarnings" ${st.tiltWarnings ? 'checked' : ''} style="margin-top:2px"><span><b>Tilt-Warnungen</b><div class="small muted">Warnt auf dem Dashboard bei Verlustserien, Größenerhöhung nach Verlust, Revenge-Trades und erreichtem Tageslimit.</div></span></label></div>
      <div><button type="submit" class="btn primary">Speichern</button></div></form>`;
  }

  /* ---------- Regeln ---------- */
  function regeln() {
    const rules = S.data.rules;
    return head('Regeln', 'Deine Handelsregeln. Sie erscheinen im Trade-Editor, beim Session-Ende, im Fortschritt und im Regel-Tracker.') + `<div class="set-block"><div class="stack" style="gap:4px">${rules.length ? rules.map(r => `<div class="set-row" style="padding:8px 0;border-bottom:1px solid var(--border)"><button type="button" class="switch" role="switch" aria-checked="${r.active !== false}" data-action="toggle-rule" data-id="${r.id}" aria-label="Aktiv"></button><span class="grow ${r.active === false ? 'muted' : ''}">${esc(r.text)}</span><button type="button" class="btn ghost icon sm" data-action="delete-rule" data-id="${r.id}" aria-label="Löschen">${I.trash}</button></div>`).join('') : '<div class="dashed">Noch keine Regeln. Lege unten deine erste Regel an.</div>'}</div><form data-action="add-rule" class="row" style="margin-top:14px"><input class="input grow" name="text" placeholder="Neue Regel, z. B. „Maximal 3 Trades pro Tag“" required aria-label="Neue Regel"><button type="submit" class="btn sm primary">${I.plus} Hinzufügen</button></form></div>`;
  }

  /* ---------- Notebook ---------- */
  function notebook() {
    const nb = Object.assign({}, NB_DEFAULT, S.settings.notebook || {});
    const sel = (name, val, opts) => `<select class="select" name="${name}" data-change="nb-preview">${opts.map(n => `<option value="${n}" ${Number(val) === n ? 'selected' : ''}>${n} px</option>`).join('')}</select>`;
    return head('Notebook', 'Schriftgrößen im Notiz-Editor und in Tagesnotizen.') + `<form data-action="save-notebook" class="nb-settings">
      <div class="stack" style="gap:14px">
        <div class="field"><label>Überschrift 1</label>${sel('h1', nb.h1, [22, 24, 26, 28, 30, 32, 36, 40])}</div>
        <div class="field"><label>Überschrift 2</label>${sel('h2', nb.h2, [18, 20, 22, 24, 26, 28, 30])}</div>
        <div class="field"><label>Überschrift 3</label>${sel('h3', nb.h3, [15, 16, 17, 18, 19, 20, 22, 24])}</div>
        <div class="field"><label>Fließtext</label>${sel('body', nb.body, [13, 14, 15, 16, 17, 18, 20])}</div>
        <label class="check" style="align-items:flex-start"><input type="checkbox" name="strike" ${nb.strike ? 'checked' : ''} data-change="nb-preview" style="margin-top:2px"><span><b>Erledigte Punkte durchstreichen</b><div class="small muted">Abgehakte Einträge in To-do-Listen werden durchgestrichen.</div></span></label>
        <div class="divider"></div><div class="row"><button type="submit" class="btn primary">Speichern</button><button type="button" class="btn ghost" data-action="nb-reset" style="color:var(--muted)">Auf Standard zurücksetzen</button></div>
      </div>
      <div><div class="lbl" style="font-size:13px;font-weight:600;color:var(--text-2);margin-bottom:8px">Vorschau</div><div class="nb-preview" id="nb-preview" style="--h1:${nb.h1}px;--h2:${nb.h2}px;--h3:${nb.h3}px;--body:${nb.body}px">
        <div class="pv-l">H1</div><div class="pv-h1">Mein Journalyst</div><hr><div class="pv-l">H2</div><div class="pv-h2">Wochenrückblick</div><hr><div class="pv-l">H3</div><div class="pv-h3">Trade-Analyse</div><hr><div class="pv-l">Text</div><div class="pv-body">So sehen deine Notizen und Tagesjournal-Einträge aus. Nutze die Vorschau, um die angenehmste Größe für deine Trade-Reviews zu finden.</div><div class="pv-body pv-check ${nb.strike ? 'strike' : ''}">${I.check} Stop vor dem Einstieg gesetzt</div>
      </div></div></form>`;
  }

  /* ---------- Inhalte: Kategorien und Tags ---------- */
  function inhalte() {
    const u = ui(); const tags = S.data.tags;
    const tabs = `<div class="set-tabs">${[['kategorien', 'Kategorien'], ['tags', 'Tags']].map(([k, l]) => `<button type="button" data-action="content-tab" data-value="${k}" aria-pressed="${u.contentTab === k}">${l}</button>`).join('')}</div>`;
    let body;
    if (u.contentTab === 'kategorien') {
      body = `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Name</th><th class="c">Farbe</th><th class="c">Tags</th><th class="c">Verwendet</th></tr></thead><tbody>${Object.entries(KINDS).map(([k, v]) => { const used = tags[k].reduce((a, n) => a + S.tagUsage(k, n), 0); return `<tr><td><b>${v.label}</b></td><td class="c"><i class="cat-dot" style="background:${v.color}"></i></td><td class="c">${tags[k].length}</td><td class="c">${used}</td></tr>`; }).join('')}</tbody></table></div><div class="small muted" style="margin-top:10px">Die drei Kategorien sind fest: Setups beschreiben den Einstiegstyp, Fehler und Emotionen den Zustand. Die Farben folgen deinen Akzent-, Verlust- und Break-even-Farben.</div>`;
    } else {
      const q = u.tagQ.trim().toLowerCase(); const rows = [];
      for (const [k, v] of Object.entries(KINDS)) { if (u.tagFilter && u.tagFilter !== k) continue; for (const n of tags[k]) { const m = S.tagMeta(k, n); if (q && !(n.toLowerCase().includes(q) || (m.desc || '').toLowerCase().includes(q))) continue; rows.push({ k, v, n, m, used: S.tagUsage(k, n) }); } }
      body = `<div class="row" style="gap:10px;margin-bottom:12px"><div class="nb-search" style="flex:1 1 260px;max-width:320px"><div class="q">${I.search}<input class="input" placeholder="Tags suchen" value="${esc(u.tagQ)}" data-input="tag-q" id="tag-q"></div></div><span class="grow"></span><label class="row" style="gap:8px"><span class="small muted">Filtern nach</span><select class="select sm" data-change="tag-filter"><option value="">Alle</option>${Object.entries(KINDS).map(([k, v]) => `<option value="${k}" ${u.tagFilter === k ? 'selected' : ''}>${v.label}</option>`).join('')}</select></label><button type="button" class="btn sm" data-action="tags-reset">Zurücksetzen</button><button type="button" class="btn sm primary" data-action="tag-new">${I.plus} Tag hinzufügen</button></div>
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Name</th><th>Kategorie</th><th class="c">Verwendet</th><th>Beschreibung</th><th></th></tr></thead><tbody>${rows.length ? rows.map(r => `<tr><td><b>${esc(r.n)}</b></td><td><span class="row" style="gap:8px;flex-wrap:nowrap"><i class="cat-dot sm" style="background:${r.v.color}"></i>${r.v.label}</span></td><td class="c">${r.used}</td><td class="wrapcell muted">${esc(r.m.desc || '')}</td><td class="r nowrap"><button type="button" class="btn ghost icon sm" data-action="tag-edit" data-kind="${r.k}" data-value="${esc(r.n)}" aria-label="Bearbeiten">${I.edit}</button><button type="button" class="btn ghost icon sm" data-action="tag-delete" data-kind="${r.k}" data-value="${esc(r.n)}" aria-label="Löschen">${I.trash}</button></td></tr>`).join('') : `<tr><td colspan="5"><div class="empty" style="min-height:120px">${I.search}<b>Keine Tags gefunden</b></div></td></tr>`}</tbody></table></div>`;
    }
    return head('Inhalte', 'Ordne deine Inhalte mit Kategorien und Tags.') + tabs + body;
  }
  function tagEditor(kind, name) {
    const meta = name ? S.tagMeta(kind, name) : {};
    U.modal(`<form data-action="tag-save" data-old="${esc(name || '')}"><div class="modal-head"><h2>${name ? 'Tag bearbeiten' : 'Tag hinzufügen'}</h2><button type="button" class="btn ghost icon" data-close aria-label="Schließen">${I.close}</button></div><div class="stack"><div class="field"><label for="tg-name">Name</label><input class="input" id="tg-name" name="name" value="${esc(name || '')}" required maxlength="40"></div><div class="field"><label for="tg-kind">Kategorie</label><select class="select" id="tg-kind" name="kind" ${name ? 'disabled' : ''}>${Object.entries(KINDS).map(([k, v]) => `<option value="${k}" ${kind === k ? 'selected' : ''}>${v.label}</option>`).join('')}</select>${name ? `<input type="hidden" name="kind" value="${kind}">` : ''}</div><div class="field"><label for="tg-desc">Beschreibung (optional)</label><textarea class="input" id="tg-desc" name="desc" rows="3" placeholder="Wann verwendest du diesen Tag?">${esc(meta.desc || '')}</textarea></div></div><div class="modal-foot"><button type="button" class="btn" data-close>Abbrechen</button><button type="submit" class="btn primary">Speichern</button></div></form>`, { cls: 'narrow' });
  }

  /* ---------- Logs ---------- */
  function logs() {
    const u = ui(); const tabs = `<div class="set-tabs">${[['imports', 'Imports'], ['verlauf', 'Verlauf']].map(([k, l]) => `<button type="button" data-action="log-tab" data-value="${k}" aria-pressed="${u.logTab === k}">${l}</button>`).join('')}</div>`;
    const when = iso => { const d = new Date(iso); return `${fmt.dateFull(d)} ${d.toLocaleTimeString('de-DE')}`; };
    let body;
    if (u.logTab === 'imports') {
      const imps = S.data.imports || []; const accName = id => (S.data.accounts.find(a => a.id === id) || {}).name || '—';
      body = `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Konto</th><th>Quelle</th><th>Datei</th><th>Hochgeladen</th><th class="r">Trades</th><th class="r">Duplikate</th><th>Status</th><th></th></tr></thead><tbody>${imps.length ? imps.map(x => `<tr><td><b>${esc(accName(x.accountId))}</b></td><td>${esc(x.source || '')}</td><td class="muted">${esc(x.file || '')}</td><td>${when(x.at)}</td><td class="r">${x.count || 0}</td><td class="r">${x.dup || 0}</td><td>${x.status === 'Fehler' ? '<span class="neg">Fehler</span>' : '<span class="pos">Erfolg</span>'}</td><td class="r"><button type="button" class="btn ghost icon sm" data-action="import-delete" data-id="${x.id}" aria-label="Eintrag entfernen" style="color:var(--loss)">${I.trash}</button></td></tr>`).join('') : `<tr><td colspan="8"><div class="empty" style="min-height:140px">${I.upload}<b>Noch keine Imports</b><span class="small">CSV-Importe und eingespielte Sicherungen erscheinen hier.</span></div></td></tr>`}</tbody></table></div>`;
    } else {
      const q = u.logQ.trim().toLowerCase(); const TYPES = ['Trade', 'Check-in', 'Session', 'Regel', 'Konto', 'Import', 'Marktphase'];
      const rows = (S.data.logs || []).filter(l => (!u.logFilter || l.type === u.logFilter) && (!q || [l.type, l.action, l.source, l.ident, l.field].join(' ').toLowerCase().includes(q))).slice(0, 200);
      body = `<div class="row" style="gap:10px;margin-bottom:12px"><div class="nb-search" style="flex:1 1 260px;max-width:320px"><div class="q">${I.search}<input class="input" placeholder="Typ suchen" value="${esc(u.logQ)}" data-input="log-q" id="log-q"></div></div><span class="grow"></span><label class="row" style="gap:8px"><span class="small muted">Filtern nach</span><select class="select sm" data-change="log-filter"><option value="">Alle anzeigen</option>${TYPES.map(t => `<option ${u.logFilter === t ? 'selected' : ''}>${t}</option>`).join('')}</select></label><button type="button" class="btn sm ghost" data-action="logs-clear">Verlauf leeren</button></div>
        <div class="tbl-wrap"><table class="tbl logtbl"><thead><tr><th></th><th>Typ</th><th>Aktion</th><th>Quelle</th><th>Zeit</th><th>Kennung</th><th>Feld</th><th>Alter Wert</th><th>Neuer Wert</th></tr></thead><tbody>${rows.length ? rows.map(l => `<tr><td class="tl"><i></i></td><td>${esc(l.type)}</td><td>${esc(l.action)}</td><td>${esc(l.source || 'manuell')}</td><td>${when(l.at)}</td><td>${esc(l.ident || '-')}</td><td>${esc(l.field || '-')}</td><td class="muted">${esc(l.old || '-')}</td><td>${esc(l.new || '-')}</td></tr>`).join('') : `<tr><td colspan="9"><div class="empty" style="min-height:140px">${I.clock}<b>Noch kein Verlauf</b><span class="small">Änderungen an Trades, Check-ins, Sessions, Regeln und Konten werden hier protokolliert.</span></div></td></tr>`}</tbody></table></div>`;
    }
    return head('Logs', 'Import- und Änderungsverlauf deines Journals.') + tabs + body;
  }

  /* ---------- Hilfen ---------- */
  function accountEditor(a) {
    const s = a || { name: '', size: 10000, currency: S.settings.currency };
    U.modal(`<form data-action="save-account" data-id="${s.id || ''}"><div class="modal-head"><h2>${a ? 'Konto bearbeiten' : 'Konto hinzufügen'}</h2><button type="button" class="btn ghost icon" data-close aria-label="Schließen">${I.close}</button></div><div class="form-grid"><div class="field"><label for="ac-name">Name</label><input class="input" id="ac-name" name="name" value="${esc(s.name)}" required></div><div class="field"><label for="ac-size">Kontogröße</label><input class="input" type="number" step="any" min="0" id="ac-size" name="size" value="${s.size}" required inputmode="decimal"></div><div class="field"><label for="ac-cur">Währung</label><select class="select" id="ac-cur" name="currency">${['EUR', 'USD', 'CHF', 'GBP'].map(c => `<option ${(s.currency || 'EUR') === c ? 'selected' : ''}>${c}</option>`).join('')}</select></div></div><div class="modal-foot"><button type="button" class="btn" data-close>Abbrechen</button><button type="submit" class="btn primary">Speichern</button></div></form>`, { cls: 'narrow' });
  }
  function download(name, text) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000); }
  function setColors(patch) { const c = Object.assign({}, S.settings.colors || {}, patch); S.setSetting('colors', c); root.Theme.apply(S.settings); }
  const rerender = () => App.rerender();

  Object.assign(App.actions, {
    /* Profil */
    'save-profile'(form) { const fd = new FormData(form); const pr = {}; for (const k of ['firstName', 'lastName', 'username', 'email', 'address', 'bio', 'timezone']) pr[k] = String(fd.get(k) || '').trim(); S.data.settings.profile = pr; S.data.settings.name = [pr.firstName, pr.lastName].filter(Boolean).join(' ') || pr.username || 'Trader'; S.data.settings.currency = fd.get('currency'); S.save(); U.toast('Profil gespeichert', 'ok'); rerender(); },
    'avatar-upload'(el) { const inp = el.closest('.set-block').querySelector('input[type=file]'); if (inp) inp.click(); },
    async 'avatar-file'(el) { const f = el.files && el.files[0]; el.value = ''; if (!f) return; let blob; try { blob = await shrinkImage(f, 256); } catch (e) { return U.toast('Dieses Bildformat kann der Browser nicht lesen (z. B. HEIC). Bitte JPG oder PNG wählen.', 'err'); } try { const old = S.settings.avatarId; const id = await root.Blobs.put(blob); if (old) await root.Blobs.del(old).catch(() => {}); S.setSetting('avatarId', id); U.toast('Profilbild gespeichert', 'ok'); rerender(); } catch (e) { U.toast('Bild konnte nicht gespeichert werden', 'err'); } },
    async 'avatar-remove'() { const id = S.settings.avatarId; if (!id) return; await root.Blobs.del(id).catch(() => {}); S.setSetting('avatarId', null); rerender(); },
    'pw-reset'() { U.modal(`<div class="modal-head"><h2>Passwort zurücksetzen</h2><button type="button" class="btn ghost icon" data-close aria-label="Schließen">${I.close}</button></div><p class="muted">Dein Journal hat noch kein Benutzerkonto mit Passwort: Alle Daten liegen nur in diesem Browser. Sobald Konten mit Anmeldung verfügbar sind, kannst du hier ein neues Passwort anfordern.</p><div class="modal-foot"><button type="button" class="btn primary" data-close>Verstanden</button></div>`, { cls: 'narrow' }); },
    'save-mentor'(form) { const fd = new FormData(form); S.setSetting('mentor', { url: String(fd.get('url') || '').trim().replace(/\/+$/, ''), token: String(fd.get('token') || '').trim() }); if (App.state.mentor) { App.state.mentor.messages = null; App.state.mentor.quota = null; } U.toast('Gespeichert', 'ok'); rerender(); },
    'faith-toggle'() { S.setSetting('christlicherImpuls', !(S.settings.christlicherImpuls !== false)); rerender(); },
    'save-privacy'(form) { const fd = new FormData(form); S.setSetting('privacy', { support: fd.get('support') === 'on' }); U.toast('Gespeichert', 'ok'); },
    twofa() { U.modal(`<div class="modal-head"><h2>Zwei-Faktor-Authentifizierung</h2><button type="button" class="btn ghost icon" data-close aria-label="Schließen">${I.close}</button></div><p class="muted">2FA schützt eine Anmeldung. Da dein Journal derzeit ohne Benutzerkonto läuft und alle Daten lokal in diesem Browser liegen, gibt es noch nichts abzusichern. Der Schalter wird aktiv, sobald Konten mit Anmeldung verfügbar sind.</p><div class="modal-foot"><button type="button" class="btn primary" data-close>Verstanden</button></div>`, { cls: 'narrow' }); },
    'font-set'(el) { S.setSetting('font', el.dataset.value); root.Theme.apply(S.settings); rerender(); },
    'color-preset'(el) { setColors({ [el.dataset.key]: el.dataset.value }); rerender(); },
    'color-pair'(el) { setColors({ profit: el.dataset.profit, loss: el.dataset.loss }); rerender(); },
    'color-set'(el) { setColors({ [el.dataset.key]: el.value }); const i = el.parentElement.querySelector('i'); if (i) i.style.background = el.value; document.querySelectorAll('.dot[data-key="' + el.dataset.key + '"], .pair-card').forEach(b => b.setAttribute('aria-pressed', 'false')); },
    'color-reset'() { S.setSetting('colors', { accent: '', profit: '', loss: '', be: '' }); root.Theme.apply(S.settings); rerender(); },
    /* Benachrichtigungen */
    'notif-toggle'(el) { const n = Object.assign({ weekly: true, monthly: true }, S.settings.notifications || {}); n[el.dataset.key] = !n[el.dataset.key]; S.setSetting('notifications', n); rerender(); },
    /* Konten */
    'edit-account'(el) { accountEditor(el.dataset.id ? S.data.accounts.find(a => a.id === el.dataset.id) : null); },
    'save-account'(form) { const fd = new FormData(form); const patch = { name: String(fd.get('name')).trim(), size: Number(fd.get('size')) || 0, currency: fd.get('currency') }; if (form.dataset.id) S.updateAccount(form.dataset.id, patch); else S.addAccount(patch); U.closeModal(); rerender(); },
    async 'delete-account'(el) { if (await U.confirmModal('Konto löschen?', 'Trades dieses Kontos werden dem ersten verbleibenden Konto zugeordnet.', { ok: 'Löschen', danger: true })) { S.deleteAccount(el.dataset.id); rerender(); } },
    /* Trading */
    'instrument-toggle'(el) { const list = (S.settings.instruments || []).slice(); const k = el.dataset.value; const i = list.indexOf(k); if (i >= 0) list.splice(i, 1); else list.push(k); S.setSetting('instruments', list); el.setAttribute('aria-pressed', i < 0); },
    'be-mode'(el) { const be = Object.assign({}, S.settings.beOffset || {}, { mode: el.dataset.value }); const form = el.closest('form'); if (form) { be.from = Math.min(0, Number(form.querySelector('#be-from').value) || 0); be.to = Math.max(0, Number(form.querySelector('#be-to').value) || 0); } S.setSetting('beOffset', be); rerender(); },
    'be-reset'() { S.setSetting('beOffset', { mode: 'abs', from: 0, to: 0 }); rerender(); },
    'save-trading'(form) { const fd = new FormData(form); const st = S.data.settings; st.beOffset = { mode: (st.beOffset || {}).mode === 'pct' ? 'pct' : 'abs', from: Math.min(0, Number(fd.get('from')) || 0), to: Math.max(0, Number(fd.get('to')) || 0) }; st.dailyLossLimitPct = Number(fd.get('dailyLossLimitPct')) || 0; st.ruinDrawdownPct = Number(fd.get('ruinDrawdownPct')) || 30; st.mcRuns = Number(fd.get('mcRuns')) || 1000; st.tiltWarnings = fd.get('tiltWarnings') === 'on'; S.save(); C.setBreakEven(st.beOffset); U.toast('Gespeichert', 'ok'); rerender(); },
    /* Regeln */
    'add-rule'(form) { const t = String(new FormData(form).get('text') || '').trim(); if (t) S.addRule(t); rerender(); },
    'toggle-rule'(el) { const r = S.data.rules.find(x => x.id === el.dataset.id); if (r) S.updateRule(r.id, { active: r.active === false }); rerender(); },
    'delete-rule'(el) { S.deleteRule(el.dataset.id); rerender(); },
    /* Notebook */
    'nb-preview'(el) { const form = el.closest('form'); const pv = form.querySelector('#nb-preview'); if (!pv) return; for (const k of ['h1', 'h2', 'h3', 'body']) pv.style.setProperty('--' + k, form.querySelector(`[name=${k}]`).value + 'px'); pv.querySelector('.pv-check').classList.toggle('strike', form.querySelector('[name=strike]').checked); },
    'save-notebook'(form) { const fd = new FormData(form); const nb = { h1: Number(fd.get('h1')), h2: Number(fd.get('h2')), h3: Number(fd.get('h3')), body: Number(fd.get('body')), strike: fd.get('strike') === 'on' }; S.setSetting('notebook', nb); root.Theme.apply(S.settings); U.toast('Gespeichert', 'ok'); rerender(); },
    'nb-reset'() { S.setSetting('notebook', Object.assign({}, NB_DEFAULT)); root.Theme.apply(S.settings); rerender(); },
    /* Inhalte */
    'content-tab'(el) { ui().contentTab = el.dataset.value; rerender(); },
    'tag-q'(el) { ui().tagQ = el.value; clearTimeout(App._tq); App._tq = setTimeout(() => { rerender(); const q = document.getElementById('tag-q'); if (q) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); } }, 150); },
    'tag-filter'(el) { ui().tagFilter = el.value; rerender(); },
    'tag-new'() { tagEditor('setups', null); },
    'tag-edit'(el) { tagEditor(el.dataset.kind, el.dataset.value); },
    'tag-save'(form) { const fd = new FormData(form); const name = String(fd.get('name') || '').trim(); const kind = fd.get('kind'); if (!name || !KINDS[kind]) return; const old = form.dataset.old; if (old) { if (old !== name) S.renameTag(kind, old, name); } else S.addTag(kind, name); S.setTagMeta(kind, name, { desc: String(fd.get('desc') || '').trim() }); U.closeModal(); U.toast('Gespeichert', 'ok'); rerender(); },
    async 'tag-delete'(el) { const used = S.tagUsage(el.dataset.kind, el.dataset.value); if (await U.confirmModal('Tag löschen', `„${esc(el.dataset.value)}“ wirklich löschen?${used ? ` Der Tag ist bei ${used} Trade${used === 1 ? '' : 's'} vergeben und bleibt dort erhalten.` : ''}`, { ok: 'Löschen', danger: true })) { S.removeTag(el.dataset.kind, el.dataset.value); rerender(); } },
    async 'tags-reset'() { if (await U.confirmModal('Tags zurücksetzen', 'Alle Tags werden auf die Standardliste zurückgesetzt. Beschreibungen gehen verloren, Trades bleiben unverändert.', { ok: 'Zurücksetzen', danger: true })) { S.resetTags(); rerender(); } },
    /* Logs */
    'log-tab'(el) { ui().logTab = el.dataset.value; rerender(); },
    'log-q'(el) { ui().logQ = el.value; clearTimeout(App._lq); App._lq = setTimeout(() => { rerender(); const q = document.getElementById('log-q'); if (q) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); } }, 150); },
    'log-filter'(el) { ui().logFilter = el.value; rerender(); },
    'import-delete'(el) { S.deleteImport(el.dataset.id); rerender(); },
    async 'logs-clear'() { if (await U.confirmModal('Verlauf leeren', 'Der gesamte Änderungsverlauf wird gelöscht. Trades und Daten bleiben erhalten.', { ok: 'Leeren', danger: true })) { S.clearLogs(); rerender(); } },
    /* Daten */
    async export(el) { const withBlobs = el.dataset.blobs === '1'; U.toast('Sicherung wird erstellt …'); const text = await S.exportJSON(withBlobs); const name = `trading-journal-${C.dayKey(new Date())}.json`; download(name, text); U.modal(`<div class="modal-head"><h2>Sicherung erstellt</h2><button type="button" class="btn ghost icon" data-close aria-label="Schließen">${I.close}</button></div><p class="muted small">Falls der Download nicht startet (z. B. in einer eingebetteten Ansicht), kopiere den Text und speichere ihn als <b>${name}</b>.</p><textarea class="input mono" id="export-text" style="min-height:160px" readonly>${esc(text.length > 2_000_000 ? 'Zu groß für die Anzeige. Nutze den Download.' : text)}</textarea><div class="modal-foot"><button type="button" class="btn" data-action="copy-export">${I.copy} Kopieren</button><button type="button" class="btn primary" data-close>Fertig</button></div>`); },
    async 'copy-export'() { const ta = document.getElementById('export-text'); try { await navigator.clipboard.writeText(ta.value); U.toast('Kopiert', 'ok'); } catch (e) { ta.select(); U.toast('Text markiert, jetzt mit Strg+C kopieren'); } },
    async 'copy-text'(el) { const ta = document.getElementById(el.dataset.target); try { await navigator.clipboard.writeText(ta.value); U.toast('Kopiert', 'ok'); } catch (e) { ta.select(); U.toast('Text markiert, jetzt mit Strg+C kopieren'); } },
    'import-backup'(el) { const mode = el.dataset.mode; U.modal(`<div class="modal-head"><h2>Sicherung ${mode === 'merge' ? 'zusammenführen' : 'ersetzen'}</h2><button type="button" class="btn ghost icon" data-close aria-label="Schließen">${I.close}</button></div>${mode === 'replace' ? `<div class="banner warn">${I.warning}<div>Alle vorhandenen Daten werden durch die Sicherung ersetzt.</div></div>` : ''}<div class="dropzone" id="bk-drop">${I.upload}<div>JSON-Datei hierher ziehen oder klicken</div><input type="file" id="bk-file" accept="application/json,.json" class="hidden"></div><details><summary class="muted small" style="cursor:pointer">Oder Text einfügen</summary><textarea class="input mono" id="bk-text" style="min-height:120px"></textarea><button type="button" class="btn sm" id="bk-go" style="margin-top:8px">Einspielen</button></details>`, { cls: 'narrow', onMount(m) { let fileName = 'Eingefügter Text'; const run = async text => { try { const r = await S.importJSON(text, mode); S.addImport({ source: 'Sicherung', file: fileName, accountId: S.defaultAccountId(), count: r.trades, dup: 0, status: 'Erfolg' }); U.closeModal(); U.toast(`Sicherung eingespielt (${r.trades} Trades)`, 'ok'); App.rerender(false); } catch (e) { S.addImport({ source: 'Sicherung', file: fileName, accountId: S.defaultAccountId(), count: 0, dup: 0, status: 'Fehler' }); U.toast('Datei nicht lesbar: ' + e.message, 'err'); } }; const dz = m.querySelector('#bk-drop'), fi = m.querySelector('#bk-file'); const rf = f => { fileName = f.name; const r = new FileReader(); r.onload = () => run(r.result); r.readAsText(f); }; dz.addEventListener('click', () => fi.click()); fi.addEventListener('change', () => fi.files[0] && rf(fi.files[0])); dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('over'); }); dz.addEventListener('dragleave', () => dz.classList.remove('over')); dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('over'); e.dataTransfer.files[0] && rf(e.dataTransfer.files[0]); }); m.querySelector('#bk-go').addEventListener('click', () => run(m.querySelector('#bk-text').value)); } }); },
    async wipe() { if (await U.confirmModal('Wirklich alles löschen?', 'Alle Trades, Notizen, Bilder und Einstellungen in diesem Browser werden entfernt. Das lässt sich nicht rückgängig machen.', { ok: 'Alles löschen', danger: true })) { await S.wipe(); U.toast('Alle Daten gelöscht'); App.navigate('#/dashboard'); App.rerender(false); } },
  });
})(typeof self !== 'undefined' ? self : this);
