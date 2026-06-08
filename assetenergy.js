/* ===========================================================
   AssetEnergy – Shared JavaScript
   v2 – ohne DOMContentLoaded-Wrapper (Script steht am Ende von <body>)
   =========================================================== */

(function () {
  'use strict';

  /* ---------- Header Scroll ---------- */
  var header = document.getElementById('header');
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 8) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Mobile-Menü (Hamburger) ---------- */
  var menuBtn  = document.querySelector('.menu-btn');
  var navLinks = document.querySelector('.nav-links');
  var navWrap  = header;
  if (menuBtn && navLinks && navWrap) {
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-controls', 'primary-nav');
    menuBtn.setAttribute('type', 'button');
    navLinks.id = navLinks.id || 'primary-nav';

    var isMobile = function () {
      return window.matchMedia('(max-width: 880px)').matches;
    };

    var setOpen = function (open) {
      navWrap.classList.toggle('nav-open', open);
      navLinks.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-locked', open);
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.innerHTML = open ? '✕' : '☰';
      document.body.style.overflow = open ? 'hidden' : '';
      if (!open) {
        // Submenus beim Schliessen einklappen
        navLinks.querySelectorAll('.has-sub.is-open').forEach(function (o) {
          o.classList.remove('is-open');
        });
      }
    };

    // Hamburger: Toggle. stopPropagation, damit der document-Listener
    // den Klick nicht unmittelbar wieder zumacht.
    var onMenuToggle = function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      setOpen(!navLinks.classList.contains('is-open'));
    };
    menuBtn.addEventListener('click', onMenuToggle);

    // Submenu in der Mobile-Ansicht per Tap aufklappen
    navLinks.querySelectorAll('.has-sub > a').forEach(function (a) {
      a.addEventListener('click', function (ev) {
        if (!isMobile()) return;
        var li = a.parentElement;
        if (!li.classList.contains('is-open')) {
          // 1. Tap: Submenu aufklappen, nicht navigieren
          ev.preventDefault();
          ev.stopPropagation();
          navLinks.querySelectorAll('.has-sub.is-open').forEach(function (o) {
            if (o !== li) o.classList.remove('is-open');
          });
          li.classList.add('is-open');
        } else {
          // 2. Tap: ganz normal navigieren, Menue schliessen
          setOpen(false);
        }
      });
    });

    // Beim Klick auf einen Link (ausser has-sub Topnav-Anker) das Menü schließen
    navLinks.querySelectorAll('a[href]').forEach(function (a) {
      if (a.parentElement && a.parentElement.classList.contains('has-sub')) return;
      a.addEventListener('click', function () {
        if (navLinks.classList.contains('is-open')) setOpen(false);
      });
    });

    // ESC schließt das Menü
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && navLinks.classList.contains('is-open')) setOpen(false);
    });

    // Bei Resize zurück auf Desktop alles zurücksetzen
    window.addEventListener('resize', function () {
      if (!isMobile()) {
        navWrap.classList.remove('nav-open');
        navLinks.classList.remove('is-open');
        document.body.classList.remove('nav-locked');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.innerHTML = '☰';
        document.body.style.overflow = '';
        navLinks.querySelectorAll('.has-sub.is-open').forEach(function (o) {
          o.classList.remove('is-open');
        });
      }
    });

    // Safari bfcache: bei Zurueck-Navigation Menue immer zu
    window.addEventListener('pageshow', function () {
      if (navLinks.classList.contains('is-open')) setOpen(false);
    });
  }

  /* ---------- Solution-Tabs ---------- */
  var tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
      document.querySelectorAll('.solution-panel').forEach(function (p) { p.classList.remove('active'); });
      btn.classList.add('active');
      var panel = document.getElementById('panel-' + btn.dataset.tab);
      if (panel) panel.classList.add('active');
    });
  });

  /* ---------- FAQ Accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      var list = item.closest('.faq-list');
      if (list) list.querySelectorAll('.faq-item').forEach(function (i) { i.classList.remove('open'); });
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ---------- Zeitersparnis-Rechner ---------- */
  var ROLE_DATA = {
    hv:   { label: 'Hausverwaltung',   before: 3, after: 1, rate: 55,
            copy: 'Hausverwaltung: typisch 3 Std. pro Liegenschaft & Jahr für die Abrechnungs-Zuarbeit. Mit AssetEnergy nur noch 1 Std. – das macht 2 Std. Ersparnis pro Liegenschaft.' },
    pm:   { label: 'Property-Manager', before: 8, after: 3, rate: 80,
            copy: 'Property-Manager: typisch 8 Std. pro Objekt & Jahr inkl. Reporting, ESG-Daten, Mieter-Kommunikation. Mit AssetEnergy nur noch 3 Std. – 5 Std. Ersparnis pro Objekt.' },
    priv: { label: 'Privatvermieter',  before: 6, after: 2, rate: 40,
            copy: 'Privatvermieter: typisch 6 Std. pro Wohnung & Jahr für manuelle Ablesung, Belege, Abrechnung. Mit AssetEnergy nur noch 2 Std. – 4 Std. Ersparnis pro Wohnung.' }
  };

  function fmt(n) { return n.toLocaleString('de-DE'); }
  function fmtDec(n) { return n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }); }

  function getActiveRole() {
    var active = document.querySelector('#pill-role .calc-pill.active');
    if (!active) {
      var first = document.querySelector('#pill-role .calc-pill');
      if (first) {
        first.classList.add('active');
        active = first;
      }
    }
    return active ? active.dataset.val : 'hv';
  }

  function getEl(id) { return document.getElementById(id); }

  function recalc() {
    var pillRole = getEl('pill-role');
    if (!pillRole) return; // calculator not on this page

    var role = getActiveRole();
    var data = ROLE_DATA[role] || ROLE_DATA.hv;

    var propsEl = getEl('properties');
    var properties = propsEl ? Math.max(1, parseInt(propsEl.value, 10) || 1) : 1;

    var hoursPerProp = data.before - data.after;
    var totalHours = hoursPerProp * properties;
    var workdays = totalHours / 8;
    var moneyValue = Math.round(totalHours * data.rate);

    var hoursEl = getEl('r-hours');
    if (hoursEl) {
      hoursEl.innerHTML = fmt(totalHours) + '<span class="unit">Std. / Jahr</span>';
    }

    var subEl = getEl('r-sub');
    if (subEl) {
      var sub = 'Das entspricht ' + fmtDec(workdays).replace('.', ',') + ' Arbeitstagen';
      if (workdays >= 20) sub += ' – also fast einem ganzen Monat reiner Bearbeitungszeit, die Sie pro Jahr zurückbekommen.';
      else if (workdays >= 5) sub += ' – Zeit, die Sie ins Kerngeschäft, in Mieter-Beziehungen oder in neue Mandate investieren können.';
      else sub += ' – jede Stunde davon ist eine Stunde, die Sie nicht mit Excel und Belegen verbringen müssen.';
      subEl.textContent = sub;
    }

    var daysEl = getEl('r-days');
    if (daysEl) daysEl.textContent = fmtDec(workdays).replace('.', ',') + ' Tage';

    var moneyEl = getEl('r-money');
    if (moneyEl) moneyEl.textContent = '~ ' + fmt(moneyValue) + ' €';

    var beforeEl = getEl('r-before');
    if (beforeEl) beforeEl.textContent = data.before + ' Std.';

    var afterEl = getEl('r-after');
    if (afterEl) afterEl.textContent = data.after + ' Std.';

    var assumptionEl = getEl('r-assumption');
    if (assumptionEl) assumptionEl.textContent = data.copy;
  }

  // Pill-Buttons (Rolle): Klick wechselt aktiven Pill, dann recalc
  var pillRoleEl = document.getElementById('pill-role');
  if (pillRoleEl) {
    pillRoleEl.querySelectorAll('.calc-pill').forEach(function (pill) {
      pill.addEventListener('click', function (ev) {
        ev.preventDefault();
        pillRoleEl.querySelectorAll('.calc-pill').forEach(function (p) { p.classList.remove('active'); });
        pill.classList.add('active');
        recalc();
      });
    });
  }

  // Number-Input: input + change Event (für volle Browser-Kompatibilität)
  var propsInput = document.getElementById('properties');
  if (propsInput) {
    propsInput.addEventListener('input', recalc);
    propsInput.addEventListener('change', recalc);
    propsInput.addEventListener('keyup', recalc);
  }

  // Initial-Berechnung
  recalc();

})();

/* ---------------------------------------------------------------
   Externe Links automatisch kennzeichnen
   (DSGVO-Audit-Empfehlung Datenschutzkanzlei Lenz)
   - Icon hinter dem Link (über CSS-Klasse .ext-link)
   - Title-Tooltip "Sie werden zu einer anderen Website geleitet"
   - target="_blank" und rel="noopener noreferrer" werden ergänzt,
     falls noch nicht gesetzt
   --------------------------------------------------------------- */
(function () {
  if (typeof document === 'undefined') return;

  function isExternal(a) {
    var href = a.getAttribute('href');
    if (!href) return false;
    if (/^(mailto:|tel:|javascript:|#)/i.test(href)) return false;
    if (!/^https?:\/\//i.test(href)) return false;
    try {
      var u = new URL(href, location.href);
      // Eigene Domain und Subdomains von assetenergy.de gelten als intern
      return !/(^|\.)assetenergy\.de$/i.test(u.hostname);
    } catch (e) {
      return false;
    }
  }

  function init() {
    var links = document.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if (!isExternal(a)) continue;
      if (a.classList.contains('no-ext-icon')) continue;
      if (a.querySelector('img, svg') && !a.textContent.trim()) continue;

      a.classList.add('ext-link');
      if (!a.getAttribute('target')) a.setAttribute('target', '_blank');
      var rel = (a.getAttribute('rel') || '').toLowerCase();
      if (rel.indexOf('noopener') === -1) {
        a.setAttribute('rel', (rel + ' noopener noreferrer').trim());
      }
      if (!a.getAttribute('title')) {
        a.setAttribute('title', 'Sie werden zu einer anderen Website geleitet');
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
