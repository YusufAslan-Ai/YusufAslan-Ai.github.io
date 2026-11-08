/* Sabit iletişim butonları.
   Mobil (<=760px): ekranın altında yüzen lacivert panel — Instagram DM + "Ücretsiz görüşme".
   Masaüstü: sol altta Instagram butonu (üzerine gelince "Instagram'dan yaz" açılır).
   Hero geçildikten sonra görünür; sayfadaki başvuru kutuları/footer ekrandayken ve
   hatırlatma kutusu açıkken gizlenir. Başvuru ve teşekkür sayfalarında yok.
   Tıklamalar dataLayer'a gider: instagram_dm_tiklama, mobil_cubuk_tiklama. */
(function () {
  if (/^\/(basvuru|tesekkurler)\//.test(location.pathname)) return;
  var applied = false;
  try { applied = localStorage.getItem('ya_basvurdu') === '1' || sessionStorage.getItem('basvuru_ok') === '1'; } catch (e) {}
  var en = (document.documentElement.lang || '').indexOf('en') === 0;
  var IG = 'https://ig.me/m/yusufaslancom';
  var icon = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>';
  var root = document.querySelector('.ya') || document.body;
  window.dataLayer = window.dataLayer || [];
  function track(ev, place) { window.dataLayer.push({ event: ev, konum: place, sayfa: location.pathname }); }

  // Masaüstü Instagram butonu
  var fl = document.createElement('a');
  fl.className = 'ya-ig-float'; fl.href = IG; fl.target = '_blank'; fl.rel = 'noopener';
  fl.setAttribute('aria-label', en ? 'Message me on Instagram' : "Instagram'dan mesaj gönder");
  fl.innerHTML = '<span class="ig-ic">' + icon + '</span><span class="ig-tx">' + (en ? 'Message on Instagram' : "Instagram'dan yaz") + '</span>';
  fl.addEventListener('click', function () { track('instagram_dm_tiklama', 'masaustu_sabit'); });
  root.appendChild(fl);

  // Mobil panel
  var dock = document.createElement('div');
  dock.className = 'ya-dock';
  dock.setAttribute('role', 'region');
  dock.setAttribute('aria-label', en ? 'Contact' : 'İletişim');
  dock.innerHTML =
    '<a class="ya-dock-ig" href="' + IG + '" target="_blank" rel="noopener" aria-label="' + (en ? 'Message me on Instagram' : "Instagram'dan mesaj gönder") + '">' + icon + '</a>' +
    '<a class="ya-dock-cta" href="/basvuru/"><span class="l">' + (en ? 'Book a free call' : 'Ücretsiz görüşme') +
    '<small>' + (en ? 'First consultation is free' : 'İlk görüşme ücretsiz') + '</small></span><span aria-hidden="true">→</span></a>';
  dock.querySelector('.ya-dock-ig').addEventListener('click', function () { track('instagram_dm_tiklama', 'mobil_panel'); });
  dock.querySelector('.ya-dock-cta').addEventListener('click', function () { track('mobil_cubuk_tiklama', 'mobil_panel'); });
  if (applied) dock.querySelector('.ya-dock-cta').style.display = 'none';
  root.appendChild(dock);

  var mq = window.matchMedia('(max-width: 760px)');
  var blockers = 0, pulsed = false;
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) {
        if (x.isIntersecting && !x.target._in) { x.target._in = 1; blockers++; }
        else if (!x.isIntersecting && x.target._in) { x.target._in = 0; blockers--; }
      });
      update();
    }, { threshold: 0.15 });
    document.querySelectorAll('.final-cta, .art-cta, footer, .tool-card, .tool-result').forEach(function (el) { io.observe(el); });
  }
  function nudgeOpen() { return !!document.querySelector('.ya-nudge.is-open'); }
  function update() {
    var past = window.scrollY > window.innerHeight * 0.6;
    var free = blockers <= 0 && !nudgeOpen();
    var showDock = mq.matches && past && free;
    dock.classList.toggle('is-on', showDock);
    document.body.classList.toggle('has-dock', showDock);
    if (showDock && !pulsed) { pulsed = true; setTimeout(function () { dock.classList.add('pulse'); }, 450); }
    fl.classList.toggle('is-on', !mq.matches && past && free);
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  if ('MutationObserver' in window) new MutationObserver(update).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'], childList: true });
  update();
})();
