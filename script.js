(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.add('js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); burger.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('open') && !nav.contains(e.target) && !burger.contains(e.target)) setMenu(false);
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 1100) setMenu(false); });
  }

  /* Anchor scrolling: short eased scroll, instant with reduced motion */
  function offsetTop(el) { var y = 0; while (el) { y += el.offsetTop; el = el.offsetParent; } return y; }
  function goTo(y) {
    if (reduce) { window.scrollTo(0, y); return; }
    var from = window.scrollY, dist = y - from, t0 = null, dur = Math.min(900, 350 + Math.abs(dist) / 12);
    function step(t) {
      if (t0 === null) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      window.scrollTo(0, from + dist * e);
      if (k < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href').length < 2) return;
    var el = document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)));
    if (!el) return;
    e.preventDefault();
    var y = Math.max(0, offsetTop(el) - 68 - (el.id === 'top' ? 0 : 12));
    if (window.matchMedia('(max-width:900px)').matches && el.id === 'sistemos') y = Math.max(0, offsetTop(el) - 68);
    goTo(y);
    if (history.pushState) history.pushState(null, '', '#' + el.id);
  });

  /* Reading progress */
  var bar = document.getElementById('progress');
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      var h = doc.scrollHeight - window.innerHeight;
      if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, window.scrollY / h) : 0) + ')';
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Scroll reveal */
  var targets = document.querySelectorAll('.sec-head, .sys-item, .extra-list li, .feature, .gallery li, .why-intro, .why-list li, .datasheet, .wall li, .partners, .steps li, .contact-info, .form');
  targets.forEach(function (el, i) { el.classList.add('reveal'); });
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.04 });
    targets.forEach(function (el) {
      if (el.matches('.wall li')) el.style.setProperty('--d', ((Array.prototype.indexOf.call(el.parentNode.children, el) % 7) * 0.05) + 's');
      io.observe(el);
    });
  } else {
    targets.forEach(function (el) { el.classList.add('in'); });
  }

  /* Process line draws in */
  var steps = document.querySelector('.steps');
  if (steps) {
    if (reduce || !('IntersectionObserver' in window)) { steps.style.setProperty('--p', 1); }
    else {
      var so = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { steps.style.setProperty('--p', 1); so.disconnect(); }
      }, { threshold: 0.35 });
      so.observe(steps);
    }
  }

  /* House section: active system follows scroll and controls */
  var house = document.getElementById('house');
  var items = document.querySelectorAll('.sys-item');
  var tabs = document.querySelectorAll('.sys-tabs button');
  function setSys(n) {
    house.setAttribute('data-active', n);
    items.forEach(function (it) { it.classList.toggle('on', it.getAttribute('data-sys') === String(n)); });
    tabs.forEach(function (t) { t.setAttribute('aria-pressed', t.getAttribute('data-sys') === String(n) ? 'true' : 'false'); });
  }
  if (house) {
    setSys(1);
    tabs.forEach(function (t) {
      t.addEventListener('click', function () { setSys(t.getAttribute('data-sys')); });
    });
    items.forEach(function (it) {
      it.addEventListener('mouseenter', function () { setSys(it.getAttribute('data-sys')); });
      it.addEventListener('focusin', function () { setSys(it.getAttribute('data-sys')); });
    });
    if ('IntersectionObserver' in window) {
      var sio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) setSys(en.target.getAttribute('data-sys')); });
      }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
      items.forEach(function (it) { sio.observe(it); });
    }
  }

  /* Active nav link */
  var links = document.querySelectorAll('.nav ul a');
  var map = {};
  links.forEach(function (a) { var id = a.getAttribute('href').slice(1); var s = document.getElementById(id); if (s) map[id] = a; });
  if ('IntersectionObserver' in window) {
    var nio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (a) { a.classList.remove('on'); });
          var a = map[en.target.id]; if (a) a.classList.add('on');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Object.keys(map).forEach(function (id) { nio.observe(document.getElementById(id)); });
  }

  /* Lightbox */
  var lb = document.getElementById('lb');
  var lbImg = document.getElementById('lb-img');
  var lbCap = document.getElementById('lb-cap');
  var btns = Array.prototype.slice.call(document.querySelectorAll('.g-btn'));
  var cur = 0, opener = null;
  function show(i) {
    cur = (i + btns.length) % btns.length;
    var b = btns[cur];
    lbImg.src = b.getAttribute('data-full');
    lbImg.alt = b.getAttribute('data-cap') || '';
    lbCap.textContent = b.getAttribute('data-cap') || '';
  }
  function openLb(i) {
    show(i);
    opener = btns[i];
    if (lb.showModal) lb.showModal(); else lb.setAttribute('open', '');
    document.getElementById('lb-close').focus();
  }
  function closeLb() {
    if (lb.close) lb.close(); else lb.removeAttribute('open');
    if (opener) opener.focus();
  }
  if (lb) {
    btns.forEach(function (b, i) { b.addEventListener('click', function () { openLb(i); }); });
    document.getElementById('lb-close').addEventListener('click', closeLb);
    document.getElementById('lb-prev').addEventListener('click', function () { show(cur - 1); });
    document.getElementById('lb-next').addEventListener('click', function () { show(cur + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(cur - 1);
      if (e.key === 'ArrowRight') show(cur + 1);
    });
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
      var lines = ['Vardas ir pavardė: ' + f.name.value.trim(), 'Telefonas: ' + f.phone.value.trim()];
      if (f.email.value.trim()) lines.push('El. paštas: ' + f.email.value.trim());
      lines.push('Paslauga: ' + f.service.value, '', f.message.value.trim());
      var href = 'mailto:info@isibaltic.lt?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(lines.join('\r\n'));
      note.textContent = 'Atidarome jūsų el. pašto programą. Jei ji neatsidarė, rašykite info@isibaltic.lt.';
      window.location.href = href;
    });
    form.addEventListener('input', function (e) {
      if (e.target.getAttribute && e.target.getAttribute('aria-invalid') === 'true' && e.target.value.trim()) {
        e.target.setAttribute('aria-invalid', 'false');
      }
    });
  }
})();
