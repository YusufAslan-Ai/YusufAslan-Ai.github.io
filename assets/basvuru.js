(function () {
  var FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfpYEgmWpxm4cpShk4VxNTKHCOs2pCelD_FMiXjOhlemIQIRg/formResponse';
  var FALLBACK = 'https://docs.google.com/forms/d/e/1FAIpQLSfpYEgmWpxm4cpShk4VxNTKHCOs2pCelD_FMiXjOhlemIQIRg/viewform';
  var form = document.getElementById('basvuru-form');
  if (!form) return;
  var errBox = document.getElementById('f-error');
  var btn = form.querySelector('.f-submit');
  window.dataLayer = window.dataLayer || [];

  // ?hizmet=pazaryeri gibi linklerden gelen seçimi işaretle
  try {
    var pre = new URLSearchParams(location.search).get('hizmet');
    if (pre) {
      var r = form.querySelector('input[name="entry.1550380132"][data-key="' + pre + '"]');
      if (r) r.checked = true;
    }
  } catch (e) {}

  // Form ile etkileşime ilk geçişte form_start
  var started = false;
  form.addEventListener('input', function () {
    if (started) return;
    started = true;
    window.dataLayer.push({ event: 'basvuru_form_start' });
  });

  function showError(html) {
    errBox.innerHTML = html;
    errBox.hidden = false;
  }

  function validate() {
    var ok = true, first = null;
    form.querySelectorAll('.f-invalid').forEach(function (el) { el.classList.remove('f-invalid'); });
    form.querySelectorAll('[required]').forEach(function (el) {
      var bad;
      if (el.type === 'radio') {
        bad = !form.querySelector('input[name="' + el.name + '"]:checked');
        if (bad) el.closest('.f-group').classList.add('f-invalid');
      } else if (el.type === 'checkbox') {
        bad = !el.checked;
        if (bad) el.closest('.opt').classList.add('f-invalid');
      } else {
        bad = !el.value.trim() || !el.checkValidity();
        if (bad) el.classList.add('f-invalid');
      }
      if (bad) { ok = false; first = first || el; }
    });
    var mail = form.querySelector('input[type="email"]');
    if (mail.value && !mail.checkValidity()) { mail.classList.add('f-invalid'); ok = false; first = first || mail; }
    if (first) first.closest('.f-group, .f-field, .opt').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return ok;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errBox.hidden = true;
    if (!validate()) {
      showError('Lütfen yıldızlı (*) alanları doldurun.');
      return;
    }
    btn.disabled = true;
    btn.firstChild.nodeValue = 'Gönderiliyor… ';

    var body = new URLSearchParams();
    new FormData(form).forEach(function (v, k) { if (String(v).trim()) body.append(k, v); });
    var service = form.querySelector('input[name="entry.1550380132"]:checked');
    var sector = form.querySelector('input[name="entry.1864458517"]:checked');

    fetch(FORM_URL, { method: 'POST', mode: 'no-cors', body: body })
      .then(function () {
        var done = false;
        function go() {
          if (done) return;
          done = true;
          try { sessionStorage.setItem('basvuru_ok', '1'); } catch (e) {}
          try { localStorage.setItem('ya_basvurdu', '1'); } catch (e) {}
          location.href = '/tesekkurler/';
        }
        window.dataLayer.push({
          event: 'generate_lead',
          basvuru_turu: service ? service.getAttribute('data-key') : '',
          sektor: sector ? sector.value : '',
          basvuru_kaynak: (function () { try { return new URLSearchParams(location.search).get('kaynak') || 'site'; } catch (e) { return 'site'; } })(),
          eventCallback: go,
          eventTimeout: 2000
        });
        setTimeout(go, 2500);
      })
      .catch(function () {
        btn.disabled = false;
        btn.firstChild.nodeValue = 'Başvuruyu gönder ';
        showError('Bağlantı hatası oluştu. Lütfen tekrar deneyin ya da <a href="' + FALLBACK + '" target="_blank" rel="noopener">formu buradan doldurun</a>.');
      });
  });
})();
