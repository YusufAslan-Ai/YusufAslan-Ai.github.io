/* Çerez onayı + Microsoft Clarity (gecikmeli yükleme).
   - Varsayılan onay durumu her sayfanın <head>'inde, GTM'den önce ayarlanır
     (Google Consent Mode: denied, Meta Pixel: revoke). Bu dosya onay çubuğunu
     gösterir ve karar verilince günceller.
   - Clarity yalnızca onay verilmişse yüklenir; o zaman da sayfa açılışını
     yavaşlatmamak için ilk etkileşimde (kaydırma/dokunma/tuş) ya da en geç
     5 sn sonra devreye girer. */
(function () {
  var CLARITY_ID = 'zahiaspe0j';
  var KEY = 'ya_consent';
  var en = (document.documentElement.lang || '').indexOf('en') === 0;
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  var clarityLoaded = false;
  function loadClarity() {
    if (clarityLoaded) return; clarityLoaded = true;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY_ID);
    window.clarity('consent');
  }
  function loadClarityLazy() {
    var done = false;
    function go() { if (done) return; done = true; ['scroll', 'pointerdown', 'keydown', 'touchstart'].forEach(function (e) { window.removeEventListener(e, go, { passive: true }); }); loadClarity(); }
    ['scroll', 'pointerdown', 'keydown', 'touchstart'].forEach(function (e) { window.addEventListener(e, go, { passive: true, once: true }); });
    setTimeout(go, 5000);
  }

  function grant() {
    set('granted');
    gtag('consent', 'update', { analytics_storage: 'granted', ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' });
    if (window.fbq) window.fbq('consent', 'grant');
    window.dataLayer.push({ event: 'cerez_onay', karar: 'kabul' });
    loadClarity();
  }
  function deny() {
    set('denied');
    gtag('consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    if (window.fbq) window.fbq('consent', 'revoke');
    window.dataLayer.push({ event: 'cerez_onay', karar: 'red' });
  }

  var bar;
  function close() { if (bar) { bar.classList.remove('is-open'); document.body.classList.remove('has-consent'); setTimeout(function () { bar && bar.remove(); bar = null; }, 350); } }
  function showBar() {
    if (bar) return;
    var root = document.querySelector('.ya') || document.body;
    bar = document.createElement('div');
    bar.className = 'ya-consent';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-live', 'polite');
    bar.setAttribute('aria-label', en ? 'Cookie preferences' : 'Çerez tercihleri');
    var link = en ? '/en/privacy/' : '/gizlilik/';
    bar.innerHTML =
      '<p class="ya-consent-t">' + (en
        ? 'I use analytics and advertising cookies (Google Analytics, Meta Pixel, Microsoft Clarity) to improve this site. What you type into forms is never recorded. <a href="' + link + '">Details</a>'
        : 'Siteyi geliştirmek için analiz ve reklam çerezleri (Google Analytics, Meta Pixel, Microsoft Clarity) kullanıyorum. Formlara yazdıkların kaydedilmez. <a href="' + link + '">Ayrıntılar</a>') + '</p>' +
      '<div class="ya-consent-b"><button type="button" class="ya-c-no">' + (en ? 'Reject' : 'Reddet') + '</button>' +
      '<button type="button" class="ya-c-yes">' + (en ? 'Accept' : 'Kabul et') + '</button></div>';
    bar.querySelector('.ya-c-yes').addEventListener('click', function () { grant(); close(); });
    bar.querySelector('.ya-c-no').addEventListener('click', function () { deny(); close(); });
    root.appendChild(bar);
    document.body.classList.add('has-consent');
    requestAnimationFrame(function () { bar && bar.classList.add('is-open'); });
  }

  // Gizlilik sayfasındaki "Tercihimi değiştir" butonu
  window.yaConsentReset = function () { try { localStorage.removeItem(KEY); } catch (e) {} showBar(); };

  var c = get();
  if (c === 'granted') loadClarityLazy();
  else if (c !== 'denied') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showBar); else showBar();
  }
})();
