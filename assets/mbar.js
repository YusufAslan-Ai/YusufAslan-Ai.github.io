/* Mobil sabit alt çubuk: "Ücretsiz görüşme" butonu.
   Yalnızca telefonda (<=760px), hero geçildikten sonra görünür.
   Sayfadaki başvuru kutuları (final-cta / art-cta) veya footer ekrandayken ve
   kayan hatırlatma kutusu açıkken gizlenir. Başvuru yapmış kişiye gösterilmez. */
(function () {
  if (/^\/(basvuru|tesekkurler)\//.test(location.pathname)) return;
  try { if (localStorage.getItem('ya_basvurdu') === '1' || sessionStorage.getItem('basvuru_ok') === '1') return; } catch (e) {}
  var mq = window.matchMedia('(max-width: 760px)');
  var en = (document.documentElement.lang || '').indexOf('en') === 0;
  var bar = document.createElement('div');
  bar.className = 'ya-mbar';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', en ? 'Contact' : 'İletişim');
  bar.innerHTML = '<span class="ya-mbar-t">' + (en ? 'First consultation is free' : 'İlk görüşme ücretsiz') + '</span>' +
    '<a class="ya-mbar-b" href="/basvuru/">' + (en ? 'Book a free call' : 'Ücretsiz görüşme') + ' <span aria-hidden="true">→</span></a>';
  (document.querySelector('.ya') || document.body).appendChild(bar);
  bar.querySelector('a').addEventListener('click', function () {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'mobil_cubuk_tiklama', sayfa: location.pathname });
  });

  var blockers = 0;
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) {
        if (x.isIntersecting && !x.target._in) { x.target._in = 1; blockers++; }
        else if (!x.isIntersecting && x.target._in) { x.target._in = 0; blockers--; }
      });
      update();
    }, { threshold: 0.15 });
    document.querySelectorAll('.final-cta, .art-cta, footer').forEach(function (el) { io.observe(el); });
  }
  function nudgeOpen() { return !!document.querySelector('.ya-nudge.is-open'); }
  function update() {
    var show = mq.matches && window.scrollY > window.innerHeight * 0.7 && blockers <= 0 && !nudgeOpen();
    bar.classList.toggle('is-on', show);
    document.body.classList.toggle('has-mbar', show);
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  if ('MutationObserver' in window) new MutationObserver(update).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'], childList: true });
  update();
})();
