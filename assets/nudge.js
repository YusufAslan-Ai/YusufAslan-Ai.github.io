/* Site ici mesajlar (her sayfada iki tur):
   1) Kayan kutu: sayfanin yarisina (blogda yazinin %60'ina) inince sag alttan, tum cihazlarda.
   2) Cikis mesaji: fareli cihazlarda, sayfadan cikmak uzereyken ortada.
   Her tur oturum basina bir kez; kapatilan tur 7 gun gosterilmez; kutudan tiklayana cikis mesaji gosterilmez;
   basvurana hicbiri gosterilmez. */
(function () {
  var path = location.pathname;
  if (/^\/(basvuru|tesekkurler)\//.test(path)) return;

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function sget(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function sset(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }

  if (get('ya_basvurdu') === '1' || sget('basvuru_ok') === '1') return;

  var WEEK = 7 * 24 * 3600 * 1000;
  function allowed(kind) {
    var closedAt = parseInt(get('ya_nudge_kapandi_' + kind) || '0', 10);
    if (closedAt && Date.now() - closedAt < WEEK) return false;
    if (sget('ya_nudge_goruldu_' + kind) === '1') return false;
    if (kind === 'cikis' && sget('ya_nudge_tiklandi') === '1') return false;
    return true;
  }

  var en = (document.documentElement.lang || '').indexOf('en') === 0;
  var hero = document.querySelector('.art-hero');
  var artBody = document.querySelector('.art-body');
  var isPost = !!(hero && artBody);
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
    home: en
      ? { k: 'First consultation is free', h: 'Let’s look at your ads or store together.', p: 'Find out which ad is making you money and what is holding sales back. Free first review.', c: 'Apply for free', s: '' }
      : { k: 'İlk görüşme ücretsiz', h: 'Reklam hesabına ya da mağazana birlikte bakalım.', p: 'Hangi reklamın kazandırdığını, satışı neyin durdurduğunu birlikte bulalım. İlk analiz ücretsiz.', c: 'Ücretsiz başvur', s: '' },
    exit: en
      ? { k: 'Before you go', h: 'Let’s take a free look at your ads or store.', p: 'Fill in the 2-minute form and I’ll get back to you on WhatsApp.', c: 'Apply for free', s: '' }
      : { k: 'Gitmeden önce', h: 'Reklam hesabına ya da mağazana ücretsiz bakalım.', p: '2 dakikalık formu doldur, WhatsApp üzerinden sana döneyim.', c: 'Ücretsiz başvur', s: '' }
  };

  var boxText = isPost ? (cat === 'mp' ? T.mp : (cat === 'seo' || cat === 'geo') ? T.seo : T.ads) : T.home;
  var exitText = (isPost && cat === 'mp') ? {
    k: T.exit.k, h: en ? 'Let’s take a free look at your store.' : 'Mağazana ücretsiz bakalım.', p: T.exit.p, c: T.exit.c, s: 'pazaryeri'
  } : T.exit;

  window.dataLayer = window.dataLayer || [];
  function track(ev, kind) {
    window.dataLayer.push({ event: ev, nudge_type: kind === 'kutu' ? (isPost ? 'blog-kutu' : 'sayfa-kutu') : 'cikis', nudge_category: cat || 'genel' });
  }

  var open = null; // su an acik kutu {el, kind}
  function closeBox(kind, byUser) {
    if (!open || open.kind !== kind) return;
    var el = open.el; open = null;
    el.classList.remove('is-open');
    if (byUser) { set('ya_nudge_kapandi_' + kind, String(Date.now())); track('nudge_close', kind); }
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 400);
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) closeBox(open.kind, true); });

  function show(kind) {
    if (!allowed(kind)) return;
    if (open) closeBox(open.kind, false);
    sset('ya_nudge_goruldu_' + kind, '1');
    var t = kind === 'kutu' ? boxText : exitText;
    var src = kind === 'kutu' ? (isPost ? 'blog-kutu' : 'sayfa-kutu') : 'cikis-mesaji';
    var href = '/basvuru/?' + (t.s ? 'hizmet=' + t.s + '&' : '') + 'kaynak=' + src;
    var root = document.querySelector('.ya') || document.body;
    var el = document.createElement('aside');
    el.className = 'ya-nudge' + (kind === 'cikis' ? ' is-center' : '');
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-label', t.k);
    el.innerHTML =
      '<button type="button" class="ya-nudge-x" aria-label="' + (en ? 'Close' : 'Kapat') + '">&times;</button>' +
      '<span class="ya-nudge-k">' + t.k + '</span>' +
      '<p class="ya-nudge-h">' + t.h + '</p>' +
      '<p class="ya-nudge-p">' + t.p + '</p>' +
      '<a class="btn btn-primary ya-nudge-cta" href="' + href + '">' + t.c + ' <span class="arrow">→</span></a>';
    root.appendChild(el);
    open = { el: el, kind: kind };
    el.querySelector('.ya-nudge-x').addEventListener('click', function () { closeBox(kind, true); });
    el.querySelector('.ya-nudge-cta').addEventListener('click', function () { sset('ya_nudge_tiklandi', '1'); track('nudge_click', kind); });
    requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('is-open'); }); });
    track('nudge_view', kind);
  }

  // 1) Kayan kutu: kaydirma ile (tum cihazlar)
  if (allowed('kutu')) {
    var onScroll = function () {
      var read;
      if (isPost) {
        var r = artBody.getBoundingClientRect();
        read = (window.innerHeight - r.top) / Math.max(1, r.height) >= 0.6;
      } else {
        var doc = document.documentElement;
        read = (window.scrollY + window.innerHeight) / Math.max(1, doc.scrollHeight) >= 0.5;
      }
      if (read) { window.removeEventListener('scroll', onScroll); show('kutu'); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // 2) Cikis mesaji (sayfada en az 10 sn sonra)
  //    Bilgisayar: fare tarayicinin ustune cikinca.
  //    Mobil: sayfanin asagisindayken hizla yukari kaydirinca (adres cubuguna / geri tusuna gitme niyeti).
  var fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (allowed('cikis')) {
    var ready = false;
    setTimeout(function () { ready = true; }, 10000);
    if (fine) {
      document.addEventListener('mouseout', function (e) {
        if (!ready || (open && open.kind === 'cikis')) return;
        if (!e.relatedTarget && e.clientY <= 0) show('cikis');
      });
    } else {
      var lastY = window.scrollY, lastT = Date.now(), maxY = 0;
      window.addEventListener('scroll', function () {
        var y = window.scrollY, now = Date.now();
        if (y > maxY) maxY = y;
        var dy = lastY - y, dt = Math.max(1, now - lastT);
        // Ekranin en az 1,5 katı asagi inmis, simdi saniyede ~2500px+ hizla yukari cikiyor
        if (ready && maxY > window.innerHeight * 1.5 && dy > 0 && dy / dt > 2.5 && !(open && open.kind === 'cikis')) {
          show('cikis');
        }
        lastY = y; lastT = now;
      }, { passive: true });
    }
  }
})();
