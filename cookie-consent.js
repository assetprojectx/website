/* ============================================================
   AssetEnergy – Cookie-Consent (DSGVO/TDDDG-konform)

   Hinweis: Dies ist eine selbstgehostete, minimale Variante.
   Sie deckt die im Datenschutz-Audit geforderten Punkte ab:
   - gleichwertige Buttons (kein Nudging)
   - Reihenfolge: "Nur essenziell" zuerst, "Alle akzeptieren" zuletzt
   - Kategorien direkt sichtbar (Essenziell / Funktional / Statistik / Marketing)
   - Widerruf jederzeit möglich (persistentes Icon unten links)
   - keine Drittanbieter, kein externes Skript geladen

   Im Live-Betrieb kann diese Datei durch eine zertifizierte CMP
   ersetzt werden (Empfehlung Kanzlei: Borlabs für WordPress, sonst CCM19).
   ============================================================ */
(function (window, document) {
  'use strict';

  var STORAGE_KEY = 'ae-consent-v1';
  var CATEGORIES = ['essential', 'functional', 'statistics', 'marketing'];

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || typeof data !== 'object') return null;
      return data;
    } catch (e) {
      return null;
    }
  }

  function saveState(state) {
    state.timestamp = new Date().toISOString();
    state.version   = 1;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // localStorage gesperrt – Banner würde bei jedem Aufruf wieder erscheinen
    }
    applyConsent(state);
    window.dispatchEvent(new CustomEvent('ae:consentchange', { detail: state }));
  }

  function applyConsent(state) {
    // Hier können konsentpflichtige Skripte freigeschaltet werden.
    // Beispiel (Pseudo-Code):
    //   if (state.statistics) loadAnalytics();
    //   if (state.marketing)  loadMarketingPixels();
    document.documentElement.setAttribute('data-consent-statistics', state.statistics ? '1' : '0');
    document.documentElement.setAttribute('data-consent-marketing',  state.marketing  ? '1' : '0');
    document.documentElement.setAttribute('data-consent-functional', state.functional ? '1' : '0');
  }

  function buildBanner() {
    var banner = document.createElement('div');
    banner.className = 'cc-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-labelledby', 'cc-title');
    banner.setAttribute('aria-describedby', 'cc-desc');
    banner.innerHTML = [
      '<div class="wrap">',
      '  <div class="cc-text">',
      '    <h3 id="cc-title">Wir verwenden Cookies und ähnliche Technologien.</h3>',
      '    <p id="cc-desc">',
      '      Einige sind technisch notwendig (z.B. Session, Spam-Schutz), andere helfen uns,',
      '      unsere Website zu verbessern. Personenbezogene Daten (z.B. IP-Adresse) können dabei',
      '      verarbeitet werden. Sie können Ihre Auswahl jederzeit über das Icon unten links anpassen.',
      '      Details in unseren <a href="datenschutz.html">Datenschutzhinweisen</a>.',
      '    </p>',
      '    <div class="cc-categories">',
      '      <span class="cc-cat" title="Sind immer aktiv – z.B. Session, Spam-Schutz">',
      '        <input type="checkbox" id="cc-essential" checked disabled>',
      '        <span class="cc-switch"></span>',
      '        <label for="cc-essential">Essenziell</label>',
      '      </span>',
      '      <span class="cc-cat">',
      '        <input type="checkbox" id="cc-functional">',
      '        <span class="cc-switch"></span>',
      '        <label for="cc-functional">Funktional</label>',
      '      </span>',
      '      <span class="cc-cat">',
      '        <input type="checkbox" id="cc-statistics">',
      '        <span class="cc-switch"></span>',
      '        <label for="cc-statistics">Statistik</label>',
      '      </span>',
      '      <span class="cc-cat">',
      '        <input type="checkbox" id="cc-marketing">',
      '        <span class="cc-switch"></span>',
      '        <label for="cc-marketing">Marketing</label>',
      '      </span>',
      '    </div>',
      '  </div>',
      '  <div class="cc-actions">',
      '    <button type="button" data-cc-action="reject">Nur essenzielle Cookies</button>',
      '    <button type="button" data-cc-action="save">Auswahl speichern</button>',
      '    <button type="button" class="is-primary" data-cc-action="accept">Alle akzeptieren</button>',
      '  </div>',
      '</div>'
    ].join('');
    return banner;
  }

  function buildTrigger() {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cc-trigger';
    btn.setAttribute('aria-label', 'Cookie-Einstellungen öffnen');
    btn.title = 'Cookie-Einstellungen ändern';
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5z"/><circle cx="8.5" cy="10.5" r="1"/><circle cx="12.5" cy="14.5" r="1"/><circle cx="16" cy="9" r="1"/></svg>';
    return btn;
  }

  function readSelection(banner) {
    return {
      essential:  true,
      functional: banner.querySelector('#cc-functional').checked,
      statistics: banner.querySelector('#cc-statistics').checked,
      marketing:  banner.querySelector('#cc-marketing').checked
    };
  }

  function writeSelection(banner, state) {
    banner.querySelector('#cc-functional').checked = !!state.functional;
    banner.querySelector('#cc-statistics').checked = !!state.statistics;
    banner.querySelector('#cc-marketing').checked  = !!state.marketing;
  }

  function init() {
    var banner = buildBanner();
    document.body.appendChild(banner);
    var trigger = buildTrigger();
    document.body.appendChild(trigger);

    var saved = loadState();
    if (saved) {
      writeSelection(banner, saved);
      applyConsent(saved);
    } else {
      // Erstbesuch – Banner anzeigen
      window.requestAnimationFrame(function () {
        banner.classList.add('is-visible');
      });
      trigger.setAttribute('aria-hidden', 'true');
    }

    banner.addEventListener('click', function (ev) {
      var btn = ev.target.closest('button[data-cc-action]');
      if (!btn) return;
      var action = btn.getAttribute('data-cc-action');
      var state;
      if (action === 'accept') {
        state = { essential: true, functional: true, statistics: true, marketing: true };
      } else if (action === 'reject') {
        state = { essential: true, functional: false, statistics: false, marketing: false };
      } else {
        state = readSelection(banner);
      }
      saveState(state);
      banner.classList.remove('is-visible');
      trigger.removeAttribute('aria-hidden');
    });

    trigger.addEventListener('click', function () {
      banner.classList.add('is-visible');
      trigger.setAttribute('aria-hidden', 'true');
    });

    // Öffentliche API für Footer-Link „Cookie-Einstellungen"
    window.AECookieConsent = {
      open: function () {
        banner.classList.add('is-visible');
        trigger.setAttribute('aria-hidden', 'true');
      },
      get: function () { return loadState() || { essential: true }; },
      reset: function () {
        try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
        location.reload();
      }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window, document);
