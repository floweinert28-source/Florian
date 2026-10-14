/* PC-Ansicht auf dem Handy: zeigt die App 1:1 so, wie sie am PC aussieht, verkleinert auf den Bildschirm.
   Fenstergröße wie am PC des Nutzers (aus seinen Bildschirmfotos gemessen: Inhalt etwa 1704 × 1030).
   Die App läuft dafür in einem eingebetteten Fenster (srcdoc mit derselben Seite, gleiche Daten im Browser-Speicher);
   außen startet sie nicht. Alles Äußere ist inline gestaltet: die Seite außen bleibt unverändert (Stylesheets bleiben),
   sie wird nur verdeckt. Ein- und Ausschalten über das Konto-Menü bzw. den Knopf unten, gemerkt im Browser. */
(function (root) {
  'use strict';
  const KEY = 'jy_pcview', W = 1704, H = 1030;
  const EXIT = { de: 'Handy-Ansicht', en: 'Mobile view', es: 'Vista móvil', zh: '手机视图', hi: 'मोबाइल व्यू', pt: 'Visão de celular' };
  const ROT = { de: 'Drehen', en: 'Rotate', es: 'Girar', zh: '旋转', hi: 'घुमाएँ', pt: 'Girar' };
  const RKEY = 'jy_pcview_rot';
  const BTN = 'height:40px;padding:0 18px;border-radius:10px;border:1px solid rgba(255,255,255,.14);background:#161616;color:#f5f5f4;font:600 14px/1 -apple-system,system-ui,sans-serif;-webkit-appearance:none;appearance:none;cursor:pointer;';
  const PCView = {
    W, H,
    on() { try { return root.localStorage.getItem(KEY) === '1'; } catch (e) { return false; } },
    set(v) { try { if (v) root.localStorage.setItem(KEY, '1'); else root.localStorage.removeItem(KEY); } catch (e) { /* ohne Speicher: nur dieses Mal */ } root.location.reload(); },
    /* true: die PC-Ansicht übernimmt die Seite (dann startet die App nur im eingebetteten Fenster) */
    maybeStart() {
      if (root.__jyInner || !this.on() || root.innerWidth >= 961) return false;
      const base = String(root.location.href).replace(/#.*$/, '').replace(/"/g, '&quot;');
      const html = '<!doctype html>' + document.documentElement.outerHTML.replace(/^<html[^>]*>/i, '<html>').replace(/<head[^>]*>/i, m => `${m}<base href="${base}"><script>window.__jyInner = true; document.documentElement.classList.add('pcv-inner');<\/script>`);
      let lang = 'en'; try { lang = ((JSON.parse(root.localStorage.getItem('trading-journal-web-v1') || '{}').settings) || {}).language || 'en'; } catch (e) { /* Standard */ }
      /* Klassen von außen (z. B. js-motion) nicht übernehmen: das eingebettete Fenster startet sauber. Äußeres verdecken (nichts entfernen) */
      for (const el of [...document.body.children]) if (!/^(SCRIPT|STYLE|LINK|META|TITLE)$/.test(el.tagName)) el.style.display = 'none';
      document.documentElement.style.cssText += ';overflow:hidden;background:#050505;'; document.body.style.cssText += ';overflow:hidden;margin:0;background:#050505;';
      const wrap = document.createElement('div'); wrap.className = 'pcv';
      wrap.setAttribute('style', 'position:fixed;left:0;top:0;right:0;bottom:0;z-index:2147483647;background:#050505;overflow:hidden;');
      /* Bühne: im Hochformat auf Wunsch quer gedreht (Handy drehen), damit die PC-Ansicht den ganzen Bildschirm nutzt */
      const stage = document.createElement('div'); stage.className = 'pcv-stage'; stage.setAttribute('style', 'position:absolute;left:0;top:0;transform-origin:0 0;');
      const frame = document.createElement('iframe'); frame.className = 'pcv-frame'; frame.title = 'PC';
      frame.setAttribute('style', `position:absolute;left:0;top:0;width:${W}px;height:${H}px;max-width:none;max-height:none;border:0;margin:0;padding:0;display:block;transform-origin:0 0;will-change:transform;background:#000;border-radius:4px;box-shadow:0 0 0 1px rgba(255,255,255,.08);`);
      const bar = document.createElement('div'); bar.setAttribute('style', 'position:absolute;left:0;right:0;bottom:10px;display:flex;justify-content:center;gap:8px;');
      const rot = document.createElement('button'); rot.type = 'button'; rot.className = 'pcv-rot'; rot.textContent = ROT[lang] || ROT.en; rot.setAttribute('style', BTN);
      const exit = document.createElement('button'); exit.type = 'button'; exit.className = 'pcv-exit'; exit.textContent = EXIT[lang] || EXIT.en; exit.setAttribute('style', BTN);
      exit.addEventListener('click', () => this.set(false));
      bar.append(rot, exit); stage.append(frame, bar); wrap.append(stage); document.body.appendChild(wrap);
      frame.srcdoc = html;
      let turned = true; try { turned = root.localStorage.getItem(RKEY) !== '0'; } catch (e) { /* Standard: gedreht */ }
      const fit = () => {
        const vw = root.innerWidth, vh = root.innerHeight; const r = turned && vh > vw; /* drehen nur im Hochformat */
        const SW = r ? vh : vw, SH = r ? vw : vh;
        stage.style.width = SW + 'px'; stage.style.height = SH + 'px'; stage.style.transform = r ? `translateX(${vw}px) rotate(90deg)` : 'none';
        const s = Math.min(SW / W, (SH - 60) / H);
        frame.style.transform = `scale(${s})`; frame.style.left = `${Math.round((SW - W * s) / 2)}px`; frame.style.top = `${Math.max(6, Math.round((SH - 60 - H * s) / 2))}px`;
        rot.style.display = vh > vw ? '' : 'none'; wrap.dataset.turned = r ? '1' : '0';
      };
      rot.addEventListener('click', () => { turned = !turned; try { root.localStorage.setItem(RKEY, turned ? '1' : '0'); } catch (e) { /* nur dieses Mal */ } fit(); });
      fit(); root.addEventListener('resize', fit); root.addEventListener('orientationchange', () => setTimeout(fit, 250));
      return true;
    }
  };
  root.PCView = PCView;
})(typeof window !== 'undefined' ? window : globalThis);
