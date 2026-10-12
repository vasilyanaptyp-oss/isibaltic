(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.add('js');

  /* Mobile menu */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Uždaryti meniu' : 'Atidaryti meniu');
  }
  if (burger && nav) {
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        setMenu(false);
        burger.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('open') && !nav.contains(e.target) && !burger.contains(e.target)) setMenu(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1100) setMenu(false);
    });
  }

  /* Scroll reveal */
  var targets = document.querySelectorAll('.card, .feature, .why-grid li, .steps li, .logos li, .mission, .contact-info, .map, .sec-head');
  targets.forEach(function (el) { el.classList.add('reveal'); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add('in'); });
  }

  /* Inquiry form: opens a prefilled e-mail */
  var form = document.getElementById('inquiry');
  var note = document.getElementById('form-note');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements;
      var bad = [];
      ['name', 'phone', 'message'].forEach(function (n) {
        var ok = f[n].value.trim().length > 0;
        f[n].setAttribute('aria-invalid', ok ? 'false' : 'true');
        if (!ok) bad.push(f[n]);
      });
      if (bad.length) {
        note.textContent = 'Prašome užpildyti vardą, telefoną ir žinutę.';
        note.classList.add('err');
        bad[0].focus();
        return;
      }
      note.classList.remove('err');
      var subject = 'Užklausa: ' + f.service.value;
      var lines = [
        'Vardas ir pavardė: ' + f.name.value.trim(),
        'Telefonas: ' + f.phone.value.trim()
      ];
      if (f.email.value.trim()) lines.push('El. paštas: ' + f.email.value.trim());
      lines.push('Paslauga: ' + f.service.value, '', f.message.value.trim());
      var href = 'mailto:info@isibaltic.lt?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(lines.join('\r\n'));
      note.textContent = 'Atidarome Jūsų el. pašto programą. Jei ji neatsidarė, rašykite info@isibaltic.lt.';
      window.location.href = href;
    });
    form.addEventListener('input', function (e) {
      if (e.target.getAttribute && e.target.getAttribute('aria-invalid') === 'true' && e.target.value.trim()) {
        e.target.setAttribute('aria-invalid', 'false');
      }
    });
  }
})();
