/* Motion layer for yusufaslann.com — subtle, runs once per element, respects reduced motion. */
(function () {
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var root = document.querySelector('.ya') || document.body;

  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || root).querySelectorAll(sel)); }

  /* ---------- Scroll progress bar + nav state + back-to-top ---------- */
  var bar = document.createElement('div');
  bar.className = 'ya-progress';
  bar.setAttribute('aria-hidden', 'true');
  bar.innerHTML = '<span></span>';
  document.body.appendChild(bar);
  var barFill = bar.firstChild;

  var topBtn = document.createElement('button');
  topBtn.className = 'ya-top';
  topBtn.type = 'button';
  topBtn.setAttribute('aria-label', doc.lang && doc.lang.indexOf('en') === 0 ? 'Back to top' : 'Yukarı çık');
  topBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  topBtn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
  root.appendChild(topBtn);

  var nav = root.querySelector('.nav');
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || doc.scrollTop;
      var max = Math.max(1, doc.scrollHeight - window.innerHeight);
      barFill.style.transform = 'scaleX(' + Math.min(1, y / max) + ')';
      if (nav) nav.classList.toggle('is-scrolled', y > 24);
      topBtn.classList.toggle('show', y > window.innerHeight * 1.2);
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  if (reduce) { doc.classList.add('no-motion'); return; }

  /* ---------- Reveal on scroll ---------- */
  if ('IntersectionObserver' in window) {
    doc.classList.add('motion-ok');

    var groups = [
      '.steps > *', '.services-grid > *', '.skills-grid > *', '.timeline > *',
      '.rel-grid > *', '.stats-grid > *', '.blog-list > *', '.posts > *'
    ];
    groups.forEach(function (sel) {
      $all(sel).forEach(function (el) {
        var p = el.parentNode, idx = Array.prototype.indexOf.call(p.children, el);
        el.setAttribute('data-reveal', '');
        el.style.setProperty('--rd', Math.min(idx % 6, 5) * 90 + 'ms');
      });
    });
    // blog posts may sit in any grid — stagger them by position
    $all('.post').forEach(function (el) {
      if (el.hasAttribute('data-reveal')) return;
      var idx = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.setAttribute('data-reveal', '');
      el.style.setProperty('--rd', (idx % 3) * 90 + 'ms');
    });
    $all('.section-head, .quote-card, .about-text, .final-cta .container, .contact-row, .art-body .container > *, .art-cta, .ticker.big').forEach(function (el) {
      if (!el.hasAttribute('data-reveal') && !el.closest('.hero')) el.setAttribute('data-reveal', '');
    });

    // Hero entrance sequence
    var hero = root.querySelector('.hero, .art-hero');
    if (hero) {
      var order = $all('.eyebrow, .hero-h, .art-title, .hero-lead, .art-meta, .cta-row, .hero-card, .crumbs, .art-badge', hero);
      order.forEach(function (el, i) { el.setAttribute('data-intro', ''); el.style.setProperty('--rd', (80 + i * 110) + 'ms'); });
      if (hero.classList.contains('hero')) {
        var g1 = document.createElement('span'); g1.className = 'ya-glow a'; g1.setAttribute('aria-hidden', 'true');
        var g2 = document.createElement('span'); g2.className = 'ya-glow b'; g2.setAttribute('aria-hidden', 'true');
        hero.insertBefore(g2, hero.firstChild); hero.insertBefore(g1, hero.firstChild);
      }
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    $all('[data-reveal], .section-h').forEach(function (el) { io.observe(el); });

    // Safety net: never leave content hidden (e.g. jump links, print)
    setTimeout(function () {
      $all('[data-reveal]:not(.is-in)').forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-in');
      });
    }, 2500);
    window.addEventListener('beforeprint', function () { $all('[data-reveal]').forEach(function (el) { el.classList.add('is-in'); }); });
  }

  /* ---------- Nav CTA: one quiet ping after a few seconds ---------- */
  var cta = root.querySelector('.nav-cta');
  if (cta) setTimeout(function () {
    cta.classList.add('ping');
    setTimeout(function () { cta.classList.remove('ping'); }, 3400);
  }, 4500);

  if (!finePointer) return;

  /* ---------- Cursor spotlight on cards ---------- */
  root.addEventListener('pointermove', function (ev) {
    var card = ev.target.closest && ev.target.closest('.service, .step, .skill-box, .post, .rel-card');
    if (!card) return;
    var r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (ev.clientX - r.left) + 'px');
    card.style.setProperty('--my', (ev.clientY - r.top) + 'px');
  }, { passive: true });

  /* ---------- Hero card tilt (max ~5°) ---------- */
  var card = root.querySelector('.hero-card');
  if (card) {
    card.addEventListener('pointermove', function (ev) {
      var r = card.getBoundingClientRect();
      var px = (ev.clientX - r.left) / r.width - 0.5, py = (ev.clientY - r.top) / r.height - 0.5;
      card.classList.add('is-tilting');
      card.style.setProperty('--ry', (px * 8).toFixed(2) + 'deg');
      card.style.setProperty('--rx', (-py * 8).toFixed(2) + 'deg');
    });
    card.addEventListener('pointerleave', function () {
      card.classList.remove('is-tilting');
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--rx', '0deg');
    });
  }
})();
