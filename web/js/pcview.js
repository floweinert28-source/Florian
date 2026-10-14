/* PC-Ansicht auf dem Handy: zeigt die App so, wie sie am PC aussieht (Fenster 1440 × 900), verkleinert auf den Bildschirm.
   Die App läuft dafür in einem eingebetteten Fenster (srcdoc mit derselben Seite, gleiche Daten im Browser-Speicher);
   außen startet sie nicht. Ein- und Ausschalten über das Konto-Menü bzw. den Knopf „Handy-Ansicht“, gemerkt im Browser. */
(function (root) {
  'use strict';
  const KEY = 'jy_pcview', W = 1440, H = 900;
  const PCView = {
    W, H,
    on() { try { return root.localStorage.getItem(KEY) === '1'; } catch (e) { return false; } },
    set(v) { try { if (v) root.localStorage.setItem(KEY, '1'); else root.localStorage.removeItem(KEY); } catch (e) { /* ohne Speicher: nur dieses Mal */ } root.location.reload(); },
    /* true: die PC-Ansicht übernimmt die Seite (dann startet die App nur im eingebetteten Fenster) */
    maybeStart() {
      if (root.__jyInner || !this.on() || root.innerWidth >= 961) return false;
      const base = String(root.location.href).replace(/#.*$/, '').replace(/"/g, '&quot;');
      const html = '<!doctype html>' + document.documentElement.outerHTML.replace(/<head[^>]*>/i, m => `${m}<base href="${base}"><script>window.__jyInner = true;<\/script>`);
      const EXIT = { de: 'Handy-Ansicht', en: 'Mobile view', es: 'Vista móvil', zh: '手机视图', hi: 'मोबाइल व्यू', pt: 'Visão de celular' };
      let lang = 'en'; try { lang = ((JSON.parse(root.localStorage.getItem('trading-journal-web-v1') || '{}').settings) || {}).language || 'en'; } catch (e) { /* Standard */ }
      document.body.innerHTML = `<div class="pcv"><iframe class="pcv-frame" title="PC"></iframe><button type="button" class="pcv-exit">${EXIT[lang] || EXIT.en}</button></div>`;
      const frame = document.querySelector('.pcv-frame'); frame.srcdoc = html;
      document.querySelector('.pcv-exit').addEventListener('click', () => this.set(false));
      const fit = () => { const vw = root.innerWidth, vh = root.innerHeight - 64; const s = Math.min(vw / W, vh / H); frame.style.transform = `scale(${s})`; frame.style.left = `${Math.round((vw - W * s) / 2)}px`; frame.style.top = `${Math.max(8, Math.round((vh - H * s) / 2))}px`; };
      fit(); root.addEventListener('resize', fit); root.addEventListener('orientationchange', fit);
      return true;
    }
  };
  root.PCView = PCView;
})(typeof window !== 'undefined' ? window : globalThis);
