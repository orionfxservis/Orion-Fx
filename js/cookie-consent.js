/* ==========================================================================
   Orion Fx — Shared Google Consent Mode v2 & Cookie Consent Manager
   Load synchronously in <head> BEFORE Google tag (gtag.js) on every page.
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'orionfx_cookie_consent_v1';
  var CONSENT_VERSION = 1;

  // Ensure dataLayer and gtag exist before Google tags execute
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  function readSavedConsent() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || parsed.version !== CONSENT_VERSION) {
        return null;
      }
      return {
        version: CONSENT_VERSION,
        updatedAt: parsed.updatedAt || null,
        essential: true,
        functional: Boolean(parsed.functional),
        analytics: Boolean(parsed.analytics),
        advertising: Boolean(parsed.advertising)
      };
    } catch (e) {
      return null;
    }
  }

  function writeSavedConsent(prefs) {
    var record = {
      version: CONSENT_VERSION,
      updatedAt: new Date().toISOString(),
      essential: true,
      functional: Boolean(prefs.functional),
      analytics: Boolean(prefs.analytics),
      advertising: Boolean(prefs.advertising)
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch (e) {
      // Ignore storage errors in restricted browsing modes
    }
    return record;
  }

  function buildGoogleConsentPayload(prefs) {
    return {
      security_storage: 'granted',
      functionality_storage: 'granted',
      personalization_storage: prefs.functional ? 'granted' : 'denied',
      analytics_storage: prefs.analytics ? 'granted' : 'denied',
      ad_storage: prefs.advertising ? 'granted' : 'denied',
      ad_user_data: prefs.advertising ? 'granted' : 'denied',
      ad_personalization: prefs.advertising ? 'granted' : 'denied'
    };
  }

  // 1. Immediately set Google Consent Mode v2 defaults BEFORE gtag('config', ...)
  var savedConsent = readSavedConsent();
  var initialPrefs = savedConsent || {
    essential: true,
    functional: false,
    analytics: false,
    advertising: false
  };

  var defaultPayload = buildGoogleConsentPayload(initialPrefs);
  defaultPayload.wait_for_update = 500;

  window.gtag('consent', 'default', defaultPayload);
  window.gtag('set', 'ads_data_redaction', !initialPrefs.advertising);
  window.gtag('set', 'url_passthrough', true);

  function applyConsentUpdate(prefs) {
    var record = writeSavedConsent(prefs);
    savedConsent = record;
    var payload = buildGoogleConsentPayload(record);
    window.gtag('consent', 'update', payload);
    window.gtag('set', 'ads_data_redaction', !record.advertising);
    try {
      window.dispatchEvent(new CustomEvent('orionfx:consent-updated', { detail: record }));
    } catch (e) {
      // Ignore CustomEvent errors on legacy browsers
    }
    return record;
  }

  // Resolve policy links cleanly across root, /pages/, /mobile-apps/, and local file://
  function getPolicyLinks() {
    var path = (window.location.pathname || '').replace(/\\/g, '/').toLowerCase();
    if (path.indexOf('/pages/') !== -1) {
      return {
        privacy: 'privacy-policy.html',
        cookie: 'cookie-policy.html'
      };
    }
    if (path.indexOf('/mobile-apps/') !== -1 || path.indexOf('/assets/') !== -1) {
      return {
        privacy: '/pages/privacy-policy.html',
        cookie: '/pages/cookie-policy.html'
      };
    }
    var isFileProtocol = window.location.protocol === 'file:';
    var prefix = isFileProtocol ? 'pages/' : '/pages/';
    return {
      privacy: prefix + 'privacy-policy.html',
      cookie: prefix + 'cookie-policy.html'
    };
  }

  var bannerEl = null;
  var modalBackdropEl = null;
  var uiInjected = false;

  function injectStyles() {
    if (document.getElementById('ofx-consent-styles')) return;
    var style = document.createElement('style');
    style.id = 'ofx-consent-styles';
    style.textContent = [
      '.ofx-consent-banner {',
      '  position: fixed; left: 16px; right: 16px; bottom: 16px; z-index: 10000;',
      '  max-width: 1120px; margin: 0 auto;',
      '  background: rgba(7, 12, 26, 0.96);',
      '  border: 1px solid rgba(0, 229, 255, 0.28);',
      '  border-radius: 20px;',
      '  padding: 20px 24px;',
      '  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.72), 0 0 24px rgba(0, 229, 255, 0.12);',
      '  backdrop-filter: blur(20px) saturate(180%);',
      '  -webkit-backdrop-filter: blur(20px) saturate(180%);',
      '  color: #f8fafc;',
      '  font-family: Inter, system-ui, -apple-system, sans-serif;',
      '  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 18px;',
      '  box-sizing: border-box;',
      '}',
      '.ofx-consent-banner[hidden], .ofx-consent-backdrop[hidden] { display: none !important; }',
      '.ofx-consent-copy { flex: 1 1 420px; min-width: 240px; }',
      '.ofx-consent-title {',
      '  font-family: Outfit, Inter, system-ui, sans-serif;',
      '  font-size: 16px; font-weight: 700; color: #ffffff; margin: 0 0 6px 0;',
      '  display: flex; align-items: center; gap: 8px;',
      '}',
      '.ofx-consent-dot {',
      '  width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0;',
      '  background: linear-gradient(135deg, #00E5FF, #7B61FF);',
      '}',
      '.ofx-consent-text { font-size: 13.5px; line-height: 1.55; color: #cbd5e1; margin: 0; }',
      '.ofx-consent-text a { color: #00E5FF; text-decoration: underline; text-underline-offset: 2px; }',
      '.ofx-consent-text a:hover { color: #ffffff; }',
      '.ofx-consent-actions { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }',
      '.ofx-btn {',
      '  font-family: Outfit, Inter, system-ui, sans-serif;',
      '  font-size: 13px; font-weight: 600; line-height: 1.2;',
      '  padding: 10px 18px; border-radius: 12px; cursor: pointer;',
      '  transition: all 0.2s ease; border: 1px solid transparent; white-space: nowrap;',
      '}',
      '.ofx-btn-primary {',
      '  background: #00E5FF; color: #030508; border-color: #00E5FF;',
      '  box-shadow: 0 0 18px rgba(0, 229, 255, 0.3);',
      '}',
      '.ofx-btn-primary:hover { background: #47eeff; transform: translateY(-1px); }',
      '.ofx-btn-secondary {',
      '  background: rgba(255, 255, 255, 0.06); color: #f8fafc;',
      '  border-color: rgba(255, 255, 255, 0.18);',
      '}',
      '.ofx-btn-secondary:hover { background: rgba(255, 255, 255, 0.13); border-color: #00E5FF; color: #00E5FF; }',
      '.ofx-btn-ghost {',
      '  background: transparent; color: #cbd5e1;',
      '  border-color: rgba(255, 255, 255, 0.16);',
      '}',
      '.ofx-btn-ghost:hover { color: #ffffff; border-color: rgba(255, 255, 255, 0.38); }',
      '.ofx-consent-backdrop {',
      '  position: fixed; inset: 0; z-index: 10001;',
      '  background: rgba(3, 5, 10, 0.78);',
      '  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);',
      '  display: flex; align-items: center; justify-content: center; padding: 16px;',
      '  box-sizing: border-box;',
      '}',
      '.ofx-consent-modal {',
      '  width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto;',
      '  background: #080e1f; border: 1px solid rgba(0, 229, 255, 0.28);',
      '  border-radius: 22px; padding: 26px;',
      '  box-shadow: 0 28px 64px rgba(0, 0, 0, 0.8);',
      '  color: #f8fafc; font-family: Inter, system-ui, -apple-system, sans-serif;',
      '  box-sizing: border-box;',
      '}',
      '.ofx-modal-header {',
      '  display: flex; align-items: center; justify-content: space-between; gap: 12px;',
      '  margin-bottom: 10px;',
      '}',
      '.ofx-modal-header h3 {',
      '  font-family: Outfit, Inter, system-ui, sans-serif;',
      '  font-size: 20px; font-weight: 700; margin: 0; color: #ffffff;',
      '}',
      '.ofx-modal-close {',
      '  background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.14);',
      '  color: #cbd5e1; width: 32px; height: 32px; border-radius: 10px;',
      '  font-size: 18px; line-height: 1; cursor: pointer; display: inline-flex;',
      '  align-items: center; justify-content: center;',
      '}',
      '.ofx-modal-close:hover { color: #ffffff; border-color: #00E5FF; }',
      '.ofx-modal-desc { font-size: 13.5px; color: #94a3b8; margin: 0 0 18px 0; line-height: 1.6; }',
      '.ofx-modal-desc a { color: #00E5FF; text-decoration: underline; }',
      '.ofx-pref-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 22px; }',
      '.ofx-pref-item {',
      '  background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.09);',
      '  border-radius: 14px; padding: 14px 16px;',
      '  display: flex; align-items: flex-start; justify-content: space-between; gap: 14px;',
      '}',
      '.ofx-pref-info h4 {',
      '  font-family: Outfit, Inter, system-ui, sans-serif;',
      '  font-size: 14.5px; font-weight: 600; color: #ffffff; margin: 0 0 4px 0;',
      '}',
      '.ofx-pref-info p { font-size: 12.5px; color: #94a3b8; margin: 0; line-height: 1.5; }',
      '.ofx-badge-required {',
      '  font-size: 11px; font-weight: 600; color: #00E5FF;',
      '  background: rgba(0, 229, 255, 0.12); border: 1px solid rgba(0, 229, 255, 0.25);',
      '  padding: 4px 10px; border-radius: 999px; white-space: nowrap; flex-shrink: 0;',
      '}',
      '.ofx-switch { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0; margin-top: 2px; }',
      '.ofx-switch input { opacity: 0; width: 0; height: 0; }',
      '.ofx-slider {',
      '  position: absolute; cursor: pointer; inset: 0;',
      '  background: rgba(255, 255, 255, 0.16); border-radius: 999px;',
      '  transition: background 0.2s ease;',
      '}',
      '.ofx-slider:before {',
      '  content: ""; position: absolute; height: 18px; width: 18px; left: 3px; bottom: 3px;',
      '  background: #ffffff; border-radius: 50%; transition: transform 0.2s ease;',
      '}',
      '.ofx-switch input:checked + .ofx-slider { background: #00E5FF; }',
      '.ofx-switch input:checked + .ofx-slider:before { transform: translateX(20px); background: #030508; }',
      '.ofx-switch input:focus-visible + .ofx-slider { outline: 2px solid #00E5FF; outline-offset: 2px; }',
      '.ofx-modal-footer {',
      '  display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 10px;',
      '  padding-top: 14px; border-top: 1px solid rgba(255, 255, 255, 0.08);',
      '}',
      '@media (max-width: 640px) {',
      '  .ofx-consent-banner { left: 10px; right: 10px; bottom: 10px; padding: 16px; }',
      '  .ofx-consent-actions { width: 100%; }',
      '  .ofx-consent-actions .ofx-btn { flex: 1 1 auto; text-align: center; }',
      '  .ofx-modal-footer .ofx-btn { flex: 1 1 auto; text-align: center; }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function syncModalCheckboxes() {
    var current = savedConsent || { functional: false, analytics: false, advertising: false };
    var analyticsBox = document.getElementById('ofx-toggle-analytics');
    var adsBox = document.getElementById('ofx-toggle-advertising');
    var funcBox = document.getElementById('ofx-toggle-functional');
    if (analyticsBox) analyticsBox.checked = Boolean(current.analytics);
    if (adsBox) adsBox.checked = Boolean(current.advertising);
    if (funcBox) funcBox.checked = Boolean(current.functional);
  }

  function hideBanner() {
    if (bannerEl) bannerEl.hidden = true;
  }

  function showBanner() {
    if (bannerEl) bannerEl.hidden = false;
  }

  function closeModal() {
    if (modalBackdropEl) modalBackdropEl.hidden = true;
  }

  function openModal() {
    if (!uiInjected) buildUI();
    syncModalCheckboxes();
    if (modalBackdropEl) {
      modalBackdropEl.hidden = false;
      var closeBtn = document.getElementById('ofx-modal-close-btn');
      if (closeBtn) closeBtn.focus();
    }
  }

  function acceptAll() {
    applyConsentUpdate({ functional: true, analytics: true, advertising: true });
    hideBanner();
    closeModal();
  }

  function rejectNonEssential() {
    applyConsentUpdate({ functional: false, analytics: false, advertising: false });
    hideBanner();
    closeModal();
  }

  function saveFromModal() {
    var analyticsBox = document.getElementById('ofx-toggle-analytics');
    var adsBox = document.getElementById('ofx-toggle-advertising');
    var funcBox = document.getElementById('ofx-toggle-functional');
    applyConsentUpdate({
      functional: funcBox ? funcBox.checked : false,
      analytics: analyticsBox ? analyticsBox.checked : false,
      advertising: adsBox ? adsBox.checked : false
    });
    hideBanner();
    closeModal();
  }

  function buildUI() {
    if (uiInjected || !document.body) return;
    uiInjected = true;
    injectStyles();

    var links = getPolicyLinks();

    // Banner
    bannerEl = document.createElement('aside');
    bannerEl.className = 'ofx-consent-banner';
    bannerEl.id = 'ofx-cookie-banner';
    bannerEl.setAttribute('role', 'region');
    bannerEl.setAttribute('aria-label', 'Cookie Consent');
    bannerEl.hidden = Boolean(savedConsent);
    bannerEl.innerHTML = [
      '<div class="ofx-consent-copy">',
      '  <p class="ofx-consent-title"><span class="ofx-consent-dot" aria-hidden="true"></span> We Value Your Privacy</p>',
      '  <p class="ofx-consent-text">',
      '    Orion Fx uses essential cookies to keep the site working and optional cookies for analytics (Google Analytics), preferences, and advertising (Google AdSense). ',
      '    Read our <a href="' + links.cookie + '">Cookie Policy</a> and <a href="' + links.privacy + '">Privacy Policy</a>.',
      '  </p>',
      '</div>',
      '<div class="ofx-consent-actions">',
      '  <button type="button" class="ofx-btn ofx-btn-ghost" id="ofx-banner-reject">Reject Non-Essential</button>',
      '  <button type="button" class="ofx-btn ofx-btn-secondary" id="ofx-banner-customize">Customize</button>',
      '  <button type="button" class="ofx-btn ofx-btn-primary" id="ofx-banner-accept">Accept All</button>',
      '</div>'
    ].join('');

    // Preferences Modal
    modalBackdropEl = document.createElement('div');
    modalBackdropEl.className = 'ofx-consent-backdrop';
    modalBackdropEl.id = 'ofx-cookie-modal';
    modalBackdropEl.hidden = true;
    modalBackdropEl.innerHTML = [
      '<div class="ofx-consent-modal" role="dialog" aria-modal="true" aria-labelledby="ofx-modal-title">',
      '  <div class="ofx-modal-header">',
      '    <h3 id="ofx-modal-title">Cookie Preferences</h3>',
      '    <button type="button" class="ofx-modal-close" id="ofx-modal-close-btn" aria-label="Close cookie preferences">&times;</button>',
      '  </div>',
      '  <p class="ofx-modal-desc">',
      '    Manage your cookie and consent preferences for Orion Fx. Your choices update Google Consent Mode settings immediately. ',
      '    Learn more in our <a href="' + links.cookie + '">Cookie Policy</a> and <a href="' + links.privacy + '">Privacy Policy</a>.',
      '  </p>',
      '  <div class="ofx-pref-list">',
      '    <div class="ofx-pref-item">',
      '      <div class="ofx-pref-info">',
      '        <h4>Essential Cookies</h4>',
      '        <p>Required for core website functionality, security, and saving your consent preferences.</p>',
      '      </div>',
      '      <span class="ofx-badge-required">Always Active</span>',
      '    </div>',
      '    <div class="ofx-pref-item">',
      '      <div class="ofx-pref-info">',
      '        <h4>Analytics Cookies</h4>',
      '        <p>Helps us understand website traffic and visitor behaviour using tools such as Google Analytics.</p>',
      '      </div>',
      '      <label class="ofx-switch" aria-label="Toggle analytics cookies">',
      '        <input type="checkbox" id="ofx-toggle-analytics">',
      '        <span class="ofx-slider"></span>',
      '      </label>',
      '    </div>',
      '    <div class="ofx-pref-item">',
      '      <div class="ofx-pref-info">',
      '        <h4>Advertising Cookies</h4>',
      '        <p>Supports displaying and measuring advertisements, including Google AdSense, and personalised ads where permitted.</p>',
      '      </div>',
      '      <label class="ofx-switch" aria-label="Toggle advertising cookies">',
      '        <input type="checkbox" id="ofx-toggle-advertising">',
      '        <span class="ofx-slider"></span>',
      '      </label>',
      '    </div>',
      '    <div class="ofx-pref-item">',
      '      <div class="ofx-pref-info">',
      '        <h4>Functional &amp; Preference Cookies</h4>',
      '        <p>Remembers visitor preferences and settings to enhance website usability.</p>',
      '      </div>',
      '      <label class="ofx-switch" aria-label="Toggle functional cookies">',
      '        <input type="checkbox" id="ofx-toggle-functional">',
      '        <span class="ofx-slider"></span>',
      '      </label>',
      '    </div>',
      '  </div>',
      '  <div class="ofx-modal-footer">',
      '    <button type="button" class="ofx-btn ofx-btn-ghost" id="ofx-modal-reject">Reject Non-Essential</button>',
      '    <button type="button" class="ofx-btn ofx-btn-secondary" id="ofx-modal-save">Save Preferences</button>',
      '    <button type="button" class="ofx-btn ofx-btn-primary" id="ofx-modal-accept">Accept All</button>',
      '  </div>',
      '</div>'
    ].join('');

    document.body.appendChild(bannerEl);
    document.body.appendChild(modalBackdropEl);

    document.getElementById('ofx-banner-accept').addEventListener('click', acceptAll);
    document.getElementById('ofx-banner-reject').addEventListener('click', rejectNonEssential);
    document.getElementById('ofx-banner-customize').addEventListener('click', openModal);

    document.getElementById('ofx-modal-close-btn').addEventListener('click', closeModal);
    document.getElementById('ofx-modal-accept').addEventListener('click', acceptAll);
    document.getElementById('ofx-modal-reject').addEventListener('click', rejectNonEssential);
    document.getElementById('ofx-modal-save').addEventListener('click', saveFromModal);

    modalBackdropEl.addEventListener('click', function (evt) {
      if (evt.target === modalBackdropEl) closeModal();
    });

    document.addEventListener('keydown', function (evt) {
      if (evt.key === 'Escape' && modalBackdropEl && !modalBackdropEl.hidden) {
        closeModal();
      }
    });
  }

  // Bind any footer "Cookie Settings" buttons/links via event delegation
  document.addEventListener('click', function (evt) {
    var target = evt.target && evt.target.closest ? evt.target.closest('[data-cookie-settings]') : null;
    if (target) {
      evt.preventDefault();
      openModal();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildUI);
  } else {
    buildUI();
  }

  // Public API for programmatic access
  window.OrionConsent = {
    getConsent: function () {
      return savedConsent ? Object.assign({}, savedConsent) : null;
    },
    openSettings: openModal,
    showBanner: showBanner,
    acceptAll: acceptAll,
    rejectNonEssential: rejectNonEssential,
    save: function (prefs) {
      var updated = applyConsentUpdate(prefs || {});
      hideBanner();
      closeModal();
      return updated;
    }
  };
})();
