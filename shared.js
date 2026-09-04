(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var desktop = window.matchMedia('(min-width: 768px)').matches;

  /* nav */
  var nav = document.getElementById('nav');
  function onScroll() { nav.classList.toggle('nav--solid', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var burger = document.getElementById('burger'), menu = document.getElementById('mobileMenu');
  function setMenu(open) {
    burger.classList.toggle('open', open); menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false'); burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) { var f = menu.querySelector('a'); if (f) setTimeout(function () { f.focus(); }, 300); } else { burger.focus(); }
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('open')) setMenu(false); });
  /* dropdown do desktop acessível por teclado */
  document.querySelectorAll('.nav__dd-btn').forEach(function (btn) {
    var li = btn.parentNode;
    btn.addEventListener('click', function () { var o = !li.classList.contains('open'); li.classList.toggle('open', o); btn.setAttribute('aria-expanded', o ? 'true' : 'false'); });
    li.addEventListener('focusout', function () { setTimeout(function () { if (!li.contains(document.activeElement)) { li.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); } }, 0); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { li.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); } });
  });
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) { var id = this.getAttribute('href'); if (id.length < 2) return; var t = document.querySelector(id); if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); } });
  });

  /* abas verticais (.vtabs) */
  document.querySelectorAll('.vtabs').forEach(function (box) {
    var tabs = Array.prototype.slice.call(box.querySelectorAll('.vtab'));
    function activate(b) {
      tabs.forEach(function (t) { var on = t === b; t.classList.toggle('active', on); t.setAttribute('aria-selected', on ? 'true' : 'false'); t.setAttribute('tabindex', on ? '0' : '-1'); });
      box.querySelectorAll('.vpanel').forEach(function (p) { p.classList.toggle('active', p.id === 'vpanel-' + b.dataset.tab); });
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }
    tabs.forEach(function (b, i) {
      b.setAttribute('aria-controls', 'vpanel-' + b.dataset.tab); b.id = b.id || 'vtab-' + b.dataset.tab;
      var panel = document.getElementById('vpanel-' + b.dataset.tab); if (panel) { panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', b.id); }
      b.setAttribute('aria-selected', b.classList.contains('active') ? 'true' : 'false'); b.setAttribute('tabindex', b.classList.contains('active') ? '0' : '-1');
      b.addEventListener('click', function () { activate(b); });
      b.addEventListener('keydown', function (e) {
        var k = e.key, n = null;
        if (k === 'ArrowDown' || k === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
        if (k === 'ArrowUp' || k === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (k === 'Home') n = tabs[0]; if (k === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); activate(n); n.focus(); }
      });
    });
  });
  /* contato: pré-seleciona o assunto vindo da URL (?assunto=...) */
  (function () {
    var sel = document.querySelector('select[name="assunto"]'); if (!sel) return;
    var q = new URLSearchParams(location.search).get('assunto'); if (!q) return;
    Array.prototype.forEach.call(sel.options, function (o) { if (o.textContent.trim().toLowerCase() === q.trim().toLowerCase()) sel.value = o.value || o.textContent; });
  })();

  /* videos: only load on desktop + no reduced motion */
  document.querySelectorAll('video[data-src]').forEach(function (v) {
    if (!desktop || reduce) return;
    var src = v.getAttribute('data-src');
    var load = function () {
      if (v.src) return;
      v.src = src; v.load();
      v.addEventListener('canplay', function () { v.classList.add('ready'); v.play().catch(function () {}); }, { once: true });
    };
    if (v.closest('.hero')) load();
    else if ('IntersectionObserver' in window) { var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { load(); io.disconnect(); } }); }, { rootMargin: '600px' }); io.observe(v); }
    else load();
    v.classList.add('ready');
  });

  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.ticker.lagSmoothing(0);
  if (reduce) return;

  /* hero intro */
  gsap.from('.hero__title .line > span', { yPercent: 110, duration: 1.4, stagger: 0.14, ease: 'power4.out', delay: 0.25 });
  gsap.from('[data-hero]', { y: 24, opacity: 0, duration: 1.1, stagger: 0.12, ease: 'power3.out', delay: 0.9 });
  gsap.from('.hero__scroll', { opacity: 0, duration: 1, delay: 1.6 });
  gsap.to('.hero__media', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* generic reveals */
  gsap.utils.toArray('.reveal').forEach(function (el) {
    gsap.from(el, { y: 44, opacity: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });

  /* image clip reveals */
  gsap.utils.toArray('.img-reveal').forEach(function (el) {
    var img = el.querySelector('img');
    var tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
    tl.fromTo(el, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.5, ease: 'power4.inOut' }, 0)
      .fromTo(img, { scale: 1.22 }, { scale: 1, duration: 2.2, ease: 'power3.out' }, 0);
  });

  /* parallax media */
  gsap.utils.toArray('.media--parallax').forEach(function (el) {
    var m = el.querySelector('img, video'); if (!m) return;
    gsap.fromTo(m, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* counters */
  gsap.utils.toArray('[data-count]').forEach(function (el) {
    var end = parseFloat(el.getAttribute('data-count')), pre = el.getAttribute('data-prefix') || '', suf = el.getAttribute('data-suffix') || '';
    var dec = parseInt(el.getAttribute('data-decimals') || '0', 10), sep = el.getAttribute('data-sep') || '';
    var fmt = function (v) { var s = v.toFixed(dec); if (sep) { var p = s.split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, sep); s = p.join('.'); } return s; };
    var o = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: function () {
      gsap.to(o, { v: end, duration: 2.2, ease: 'power3.out', onUpdate: function () { el.textContent = pre + fmt(o.v) + suf; } });
    } });
  });

  /* timeline progress */
  // timeline: animação própria (não presa ao scroll) — a barra percorre a linha e acende marcos e anos em sequência, em loop
  var tlEl = document.querySelector('.tl');
  if (tlEl && document.getElementById('tlProgress')) {
    var dots = tlEl.querySelectorAll('.tl__dot-circle'), years = tlEl.querySelectorAll('.tl__year'), cells = tlEl.querySelectorAll('.tl__cell[data-year]');
    var DUR = 3, n = dots.length;
    var tlAnim = gsap.timeline({ paused: true });
    tlAnim.fromTo('#tlProgress', { scaleX: 0 }, { scaleX: 1, duration: DUR, ease: 'none' }, 0);
    dots.forEach(function (d, i) {
      var t = (((i + 0.5) / n - 0.04) / 0.92) * DUR;
      tlAnim.fromTo(d, { backgroundColor: '#fff', borderColor: '#122940', scale: 1 }, { backgroundColor: '#1471a0', borderColor: '#1471a0', scale: 1.5, duration: 0.35, ease: 'back.out(2)' }, t);
      if (years[i]) tlAnim.fromTo(years[i], { opacity: 0.35 }, { opacity: 1, duration: 0.35 }, t);
    });
    cells.forEach(function (c) {
      var i = parseInt(c.style.getPropertyValue('--o') || '1', 10) - 1;
      var t = (((i + 0.5) / n - 0.04) / 0.92) * DUR;
      tlAnim.fromTo(c, { opacity: 0.3, y: 8 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, t);
    });
    var tlPlay = function () { if (tlAnim.progress() === 0 && !tlAnim.isActive()) tlAnim.play(); };
    ScrollTrigger.create({ trigger: tlEl, start: 'top 85%', once: true, onEnter: tlPlay });
    // recarga da página com o scroll já abaixo da seção: garante que a animação rode (ou termine) mesmo assim
    window.addEventListener('load', function () { ScrollTrigger.refresh(); setTimeout(function () { if (tlEl.getBoundingClientRect().top < window.innerHeight * 0.85) tlPlay(); }, 600); });
  }

})();
