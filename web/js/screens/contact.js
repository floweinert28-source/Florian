/* Kontakt (unten in der Bereichsleiste): Thema wählen, Nachricht schreiben, „Senden“ öffnet das eigene E-Mail-Programm
   mit fertiger Nachricht an CONTACT_EMAIL. Solange keine Adresse eingetragen ist, bleibt Senden aus und die Seite sagt das. */
(function (root) {
  'use strict';
  const App = root.App, U = root.UI, I = U.I, esc = U.esc;
  const CONTACT_EMAIL = ''; /* Adresse des Betreibers, z. B. support@…; leer = noch nicht eingetragen */
  const TOPICS = [['frage', 'Frage'], ['fehler', 'Fehler melden'], ['idee', 'Idee oder Wunsch']];
  const st = { topic: 'frage', text: '' };

  App.screens.contact = {
    title: 'Kontakt',
    head: { range: false, account: false, session: false, trade: false },
    render() {
      const chips = TOPICS.map(([k, l]) => `<button type="button" class="chip sel" data-action="contact-topic" data-value="${k}" aria-pressed="${st.topic === k}">${l}</button>`).join('');
      return `<div class="card ct-card"><div class="ct-head"><span class="ct-ico">${I.contact}</span><div><h2>Kontakt</h2><p class="muted">Fragen, Fehler oder Ideen: schreib uns, wir melden uns per E-Mail.</p></div></div>
        <div class="field"><span class="lbl">Thema</span><div class="chips">${chips}</div></div>
        <div class="field"><label for="ct-text">Nachricht</label><textarea class="input" id="ct-text" rows="7" placeholder="Worum geht es?" data-input="ct-text">${esc(st.text)}</textarea></div>
        <div class="ct-foot">${CONTACT_EMAIL ? '' : '<span class="small muted">Die Kontakt-Adresse ist noch nicht eingetragen.</span>'}<button type="button" class="btn primary" data-action="contact-send"${CONTACT_EMAIL ? '' : ' disabled'}>Senden</button></div></div>`;
    }
  };
  Object.assign(App.actions, {
    'ct-text'(el) { st.text = el.value; },
    'contact-topic'(el) { st.topic = el.dataset.value; document.querySelectorAll('[data-action=contact-topic]').forEach(b => b.setAttribute('aria-pressed', String(b === el))); },
    'contact-send'() {
      const t = document.getElementById('ct-text'); st.text = t ? t.value : st.text; if (!CONTACT_EMAIL) return;
      if (!st.text.trim()) { U.toast('Bitte schreib kurz, worum es geht', 'err'); if (t) t.focus(); return; }
      const subj = `Journalyst: ${(TOPICS.find(x => x[0] === st.topic) || TOPICS[0])[1]}`;
      location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(st.text)}`;
    }
  });
})(typeof window !== 'undefined' ? window : globalThis);
