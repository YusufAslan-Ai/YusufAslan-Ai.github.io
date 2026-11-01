/* Site ici mesaj: blog yazilarinda okuma sonunda kayan kutu, diger sayfalarda cikis ani hatirlatmasi.
   Ayni kisiye oturum basina en fazla bir kez gosterilir; kapatana 7 gun, basvurana hic gosterilmez. */
(function () {
  var path = location.pathname;
  if (/^\/(basvuru|tesekkurler)\//.test(path)) return;

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function sget(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function sset(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }

  if (get('ya_basvurdu') === '1' || sget('basvuru_ok') === '1') return;
  var closedAt = parseInt(get('ya_nudge_kapandi') || '0', 10);
  if (closedAt && Date.now() - closedAt < 7 * 24 * 3600 * 1000) return;
  if (sget('ya_nudge_goruldu') === '1') return;

  var en = (document.documentElement.lang || '').indexOf('en') === 0;
  var hero = document.querySelector('.art-hero');
  var isPost = !!(hero && document.querySelector('.art-body'));
  var cat = '';
  if (isPost) { ['mp', 'meta', 'gads', 'seo', 'geo'].forEach(function (c) { if (hero.classList.contains(c)) cat = c; }); }

  var T = {
    mp: en
      ? { k: 'Free store review', h: 'What is holding your store back?', p: 'Let’s look at your Trendyol or marketplace store together. The first review is free.', c: 'Request a free review', s: 'pazaryeri' }
      : { k: 'Ücretsiz mağaza analizi', h: 'Mağazanın satışını ne durduruyor?', p: 'Trendyol ya da diğer pazaryerlerindeki mağazana birlikte bakalım. İlk analiz ücretsiz.', c: 'Ücretsiz analiz iste', s: 'pazaryeri' },
    seo: en
      ? { k: 'Free SEO & GEO check', h: 'Is your store visible in search and AI answers?', p: 'Let’s check your site or store together. The first review is free.', c: 'Request a free check', s: '' }
      : { k: 'Ücretsiz SEO & GEO kontrolü', h: 'Mağazan aramada ve yapay zekâ cevaplarında görünüyor mu?', p: 'Siteni ya da mağazanı birlikte kontrol edelim. İlk analiz ücretsiz.', c: 'Ücretsiz kontrol iste', s: '' },
    ads: en
      ? { k: 'Free ad account review', h: 'Which of your ads is burning money?', p: 'Let’s open your ad account together and find the leak. The first consultation is free.', c: 'Book a free review', s: 'reklam' }
      : { k: 'Ücretsiz reklam analizi', h: 'Hangi reklamın para yakıyor?', p: 'Reklam hesabını birlikte açıp sızıntıyı bulalım. İlk görüşme ücretsiz.', c: 'Ücretsiz analiz iste', s: 'reklam' },
    exit: en
      ? { k: 'Before you go', h: 'Let’s take a free look at your ads or store.', p: 'Fill in the 2-minute form and I’ll get back to you on WhatsApp.', c: 'Apply for free', s: '' }
      : { k: 'Gitmeden önce', h: 'Reklam hesabına ya da mağazana ücretsiz bakalım.', p: '2 dakikalık formu doldur, WhatsApp üzerinden sana döneyim.', c: 'Ücretsiz başvur', s: '' }
  };

  var type = isPost ? 'blog' : 'cikis';
  var t = isPost ? (cat === 'mp' ? T.mp : (cat === 'seo' || cat === 'geo') ? T.seo : T.ads) : T.exit;
  var href = '/basvuru/?' + (t.s ? 'hizmet=' + t.s + '&' : '') + 'kaynak=' + (isPost ? 'blog-kutu' : 'cikis-mesaji');

  window.dataLayer = window.dataLayer || [];
  function track(ev) { window.dataLayer.push({ event: ev, nudge_type: type, nudge_category: cat || 'genel' }); }

  var box = null, shown = false;
  function close(reason) {
    if (!box) return;
    box.classList.remove('is-open');
    set('ya_nudge_kapandi', String(Date.now()));
    if (reason) track('nudge_close');
    setTimeout(function () { if (box && box.parentNode) box.parentNode.removeChild(box); }, 400);
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e) { if (e.key === 'Escape') close(true); }

  function show() {
    if (shown) return;
    shown = true;
    sset('ya_nudge_goruldu', '1');
    var root = document.querySelector('.ya') || document.body;
    box = document.createElement('aside');
    box.className = 'ya-nudge' + (type === 'cikis' ? ' is-center' : '');
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-live', 'polite');
    box.setAttribute('aria-label', t.k);
    box.innerHTML =
      '<button type="button" class="ya-nudge-x" aria-label="' + (en ? 'Close' : 'Kapat') + '">&times;</button>' +
      '<span class="ya-nudge-k">' + t.k + '</span>' +
      '<p class="ya-nudge-h">' + t.h + '</p>' +
      '<p class="ya-nudge-p">' + t.p + '</p>' +
      '<a class="btn btn-primary ya-nudge-cta" href="' + href + '">' + t.c + ' <span class="arrow">→</span></a>';
    root.appendChild(box);
    box.querySelector('.ya-nudge-x').addEventListener('click', function () { close(true); });
    box.querySelector('.ya-nudge-cta').addEventListener('click', function () { track('nudge_click'); });
    document.addEventListener('keydown', onKey);
    requestAnimationFrame(function () { requestAnimationFrame(function () { box.classList.add('is-open'); }); });
    track('nudge_view');
  }

  if (isPost) {
    var body = document.querySelector('.art-body');
    var onScroll = function () {
      var r = body.getBoundingClientRect();
      var read = (window.innerHeight - r.top) / Math.max(1, r.height);
      if (read >= 0.6) { window.removeEventListener('scroll', onScroll); show(); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  } else {
    // Cikis ani: yalnizca fareli cihazlarda, sayfada en az 10 sn kaldiktan sonra
    var fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!fine) return;
    var ready = false;
    setTimeout(function () { ready = true; }, 10000);
    document.addEventListener('mouseout', function (e) {
      if (!ready || shown) return;
      if (!e.relatedTarget && e.clientY <= 0) show();
    });
  }
})();
