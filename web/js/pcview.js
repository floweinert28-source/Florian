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
      /* Zwei-Finger-Zoom aus: das Neuzeichnen des großen Fensters in hoher Auflösung lässt die App auf dem Handy abstürzen.
         Stattdessen eigene Stufen (− / +), bei größerer Stufe wird das Bild verschoben */
      const vp = document.querySelector('meta[name=viewport]');
      if (vp) vp.setAttribute('content', 'width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover');
      else { const m = document.createElement('meta'); m.name = 'viewport'; m.content = 'width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no'; document.head.appendChild(m); }
      /* Bühne: im Hochformat auf Wunsch quer gedreht (Handy drehen), damit die PC-Ansicht den ganzen Bildschirm nutzt */
      const stage = document.createElement('div'); stage.className = 'pcv-stage'; stage.setAttribute('style', 'position:absolute;left:0;top:0;transform-origin:0 0;');
      const scroller = document.createElement('div'); scroller.className = 'pcv-scroll'; scroller.setAttribute('style', 'position:absolute;left:0;top:0;overflow:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;');
      const sizer = document.createElement('div'); sizer.setAttribute('style', 'position:relative;');
      const frame = document.createElement('iframe'); frame.className = 'pcv-frame'; frame.title = 'PC';
      frame.setAttribute('style', `position:absolute;left:0;top:0;width:${W}px;height:${H}px;max-width:none;max-height:none;border:0;margin:0;padding:0;display:block;transform-origin:0 0;background:#000;border-radius:4px;box-shadow:0 0 0 1px rgba(255,255,255,.08);`);
      const bar = document.createElement('div'); bar.setAttribute('style', 'position:absolute;left:0;right:0;bottom:10px;display:flex;justify-content:center;gap:8px;');
      const mk = (cls, label, extra = '') => { const b = document.createElement('button'); b.type = 'button'; b.className = cls; b.textContent = label; b.setAttribute('style', BTN + extra); return b; };
      const zout = mk('pcv-zout', '−', 'padding:0;width:40px;font-size:20px;'), zin = mk('pcv-zin', '+', 'padding:0;width:40px;font-size:20px;');
      const rot = mk('pcv-rot', ROT[lang] || ROT.en), exit = mk('pcv-exit', EXIT[lang] || EXIT.en);
      exit.addEventListener('click', () => this.set(false));
      sizer.append(frame); scroller.append(sizer); bar.append(zout, zin, rot, exit); stage.append(scroller, bar); wrap.append(stage); document.body.appendChild(wrap);
      frame.srcdoc = html;
      let turned = true; try { turned = root.localStorage.getItem(RKEY) !== '0'; } catch (e) { /* Standard: gedreht */ }
      let zoom = 0; /* 0 = ganzes Fenster, danach die Stufen aus STEPS, die größer sind */
      const STEPS = [0.5, 0.75, 1];
      /* In der Claude-App liegt oben deren Kopfleiste (mit dunklem Schleier) über der Seite: dort nichts hinlegen.
         Eingebettet (Claude-Ansicht) bleibt oben ein Streifen frei; gedreht ist „oben am Handy“ die linke Seite der Bühne */
      let embedded = false; try { embedded = root.self !== root.top; } catch (e) { embedded = true; }
      const INSET = embedded ? 104 : 0;
      const fit = keep => {
        const vw = root.innerWidth, vh = root.innerHeight; const r = turned && vh > vw; /* drehen nur im Hochformat */
        const SW = r ? vh : vw, SH = r ? vw : vh;
        const insL = r ? INSET : 0, insT = r ? 0 : INSET; const AW = SW - insL, AH = SH - 60 - insT;
        stage.style.width = SW + 'px'; stage.style.height = SH + 'px'; stage.style.transform = r ? `translateX(${vw}px) rotate(90deg)` : 'none';
        scroller.style.left = insL + 'px'; scroller.style.top = insT + 'px'; scroller.style.width = AW + 'px'; scroller.style.height = AH + 'px'; bar.style.left = insL + 'px';
        const s0 = Math.min(AW / W, (AH - 12) / H); const levels = [s0].concat(STEPS.filter(v => v > s0 + 0.04)); zoom = Math.max(0, Math.min(zoom, levels.length - 1)); const s = levels[zoom];
        /* Mitte des sichtbaren Ausschnitts halten */
        const cx = keep ? (scroller.scrollLeft + AW / 2) / Math.max(1, sizer.offsetWidth) : 0.5, cy = keep ? (scroller.scrollTop + AH / 2) / Math.max(1, sizer.offsetHeight) : 0;
        const fw = W * s, fh = H * s, left = Math.max(0, Math.round((AW - fw) / 2)), top = Math.max(6, Math.round((AH - fh) / 2));
        sizer.style.width = Math.max(AW, Math.ceil(fw)) + 'px'; sizer.style.height = Math.max(AH, Math.ceil(top + fh + 6)) + 'px';
        frame.style.transform = `scale(${s})`; frame.style.left = left + 'px'; frame.style.top = top + 'px';
        if (keep) { scroller.scrollLeft = cx * sizer.offsetWidth - AW / 2; scroller.scrollTop = cy * sizer.offsetHeight - AH / 2; }
        zout.disabled = zoom === 0; zin.disabled = zoom === levels.length - 1; zout.style.opacity = zout.disabled ? '.4' : '1'; zin.style.opacity = zin.disabled ? '.4' : '1';
        rot.style.display = vh > vw ? '' : 'none'; wrap.dataset.turned = r ? '1' : '0'; wrap.dataset.zoom = String(Math.round(s * 100));
      };
      zin.addEventListener('click', () => { zoom += 1; fit(true); });
      zout.addEventListener('click', () => { zoom -= 1; fit(true); });
      rot.addEventListener('click', () => { turned = !turned; zoom = 0; try { root.localStorage.setItem(RKEY, turned ? '1' : '0'); } catch (e) { /* nur dieses Mal */ } fit(false); });
      fit(false); root.addEventListener('resize', () => fit(true)); root.addEventListener('orientationchange', () => setTimeout(() => fit(true), 250));
      return true;
    }
  };
  root.PCView = PCView;
})(typeof window !== 'undefined' ? window : globalThis);
