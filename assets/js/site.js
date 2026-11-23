/* ==========================================================================
   MIRELLE — interaction system
   Mirrors the reference's stack: Lenis + GSAP + ScrollTrigger + SplitText.
   Scroll-scrubbed sequences use the same progress model/keyframes as the
   reference's interactions (hero zoom, steps sequence, card stack).
   ========================================================================== */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined';
  var cfg = (window.MIRELLE && MIRELLE.config) || {};

  if (!hasGsap) root.classList.add('gsap-not-found');

  /* ------------------------------------------------------------ helpers */
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  /* keyframes: [[progress, value], ...] — constant before first/after last */
  function kf(arr, p) {
    if (p <= arr[0][0]) return arr[0][1];
    for (var i = 1; i < arr.length; i++) {
      if (p <= arr[i][0]) {
        var a = arr[i - 1], b = arr[i], t = (p - a[0]) / ((b[0] - a[0]) || 1);
        return a[1] + (b[1] - a[1]) * t;
      }
    }
    return arr[arr.length - 1][1];
  }
  var ease = {
    outQuart: function (t) { return 1 - Math.pow(1 - t, 4); },
    easeIn: function (t) { return t * t; }
  };
  function docTop(el) { var r = el.getBoundingClientRect(); return r.top + (window.pageYOffset || root.scrollTop); }

  /* ------------------------------------------------------------ smooth scroll */
  var lenis = null;
  if (typeof window.Lenis !== 'undefined' && !reduce) {
    lenis = new Lenis({});
    window.__lenis = lenis;
    if (hasGsap && window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
    }
  }
  /* in-page anchors with Lenis */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var t = $(id);
      if (!t) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(t, { offset: 0 }); else t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* ------------------------------------------------------------ mobile menu */
  var navbar = $('.navbar'), menuBtn = $('.menu-icon-wrap'), mob = $('.mob-menu');
  function setMenu(open) {
    if (!mob || !menuBtn) return;
    navbar.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open);
    if (hasGsap) {
      if (open) { mob.style.display = 'flex'; gsap.to(mob, { yPercent: 0, y: 0, duration: .8, ease: 'power4.out' }); }
      else gsap.to(mob, { yPercent: -100, duration: .8, ease: 'power4.out', onComplete: function () { if (matchMedia('(max-width:767px)').matches) mob.style.display = 'flex'; } });
    } else { mob.style.transform = open ? 'none' : 'translateY(-100%)'; }
    if (lenis) open ? lenis.stop() : lenis.start();
    root.classList.toggle('menu-lock', open);
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', function (e) { e.preventDefault(); setMenu(!navbar.classList.contains('menu-open')); });
    $$('.mob-menu a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && navbar.classList.contains('menu-open')) setMenu(false); });
    var imgs = $$('.menu-links-img');
    $$('.menu-links-1 a[data-img]').forEach(function (a) {
      a.addEventListener('mouseenter', function () { imgs.forEach(function (i) { i.style.opacity = i.dataset.k === a.dataset.img ? 1 : 0; }); });
      a.addEventListener('mouseleave', function () { imgs.forEach(function (i) { i.style.opacity = i.classList.contains('default') ? 1 : 0; }); });
    });
  }

  /* ------------------------------------------------------------ nav text: white over coloured sections */
  (function () {
    var zones = ['.hero__section-animation', '.ab-hero', '.reviews'].map(function (s) { return $(s); }).filter(Boolean);
    if (!zones.length || !navbar) return;
    var last = null;
    function run() {
      var on = false, y = 30;
      for (var i = 0; i < zones.length; i++) { var r = zones[i].getBoundingClientRect(); if (r.top <= y && r.bottom > y) { on = true; break; } }
      var hero = zones[0] && zones[0].classList.contains('hero__section-animation') ? zones[0].getBoundingClientRect() : null;
      var inHero = hero && hero.top <= y && hero.bottom > y;
      navbar.classList.toggle('is-solid', !inHero && window.scrollY > 40);
      if (on === last) return; last = on; navbar.classList.toggle('on-dark', on);
    }
    window.addEventListener('scroll', run, { passive: true }); window.addEventListener('resize', run); run();
  })();

  /* ------------------------------------------------------------ nav lines: switch on light sections */
  (function () {
    var lineH = $('.line-horizontal'), lineU = $$('.line-vertical.user');
    var secs = ['#practice', '#how-it-works', '#solutions', '#brands', '#cta'].map(function (s) { return $(s); }).filter(Boolean);
    var nh = navbar ? navbar.offsetHeight : 64, last = null;
    function run() {
      var inZone = false;
      for (var i = 0; i < secs.length; i++) { var r = secs[i].getBoundingClientRect(); if (r.top <= nh && r.bottom > nh) { inZone = true; break; } }
      if (inZone === last) return; last = inZone;
      var col = inZone ? 'rgba(205,160,127,.5)' : 'rgba(205,160,127,.5)';
      if (lineH) lineH.style.backgroundColor = col;
      lineU.forEach(function (el) { el.style.backgroundColor = col; });
    }
    if (secs.length) { window.addEventListener('scroll', run, { passive: true }); window.addEventListener('resize', run); run(); }
  })();

  if (!hasGsap || !window.ScrollTrigger) { $$('[data-prevent-flicker]').forEach(function (e) { e.style.visibility = 'visible'; }); return finish(); }
  gsap.registerPlugin(ScrollTrigger);
  var hasSplit = typeof window.SplitText !== 'undefined';
  if (hasSplit) gsap.registerPlugin(SplitText);

  /* ------------------------------------------------------------ word reveal (reference behaviour) */
  function wordReveal() {
    $$("[data-word-reveal='true']").forEach(function (text) {
      var delay = parseFloat(text.getAttribute('delay-time')) || 0.2;
      if (reduce || !hasSplit) { gsap.set(text, { autoAlpha: 1 }); return; }
      SplitText.create(text, {
        type: 'lines, words', wordsClass: 'word', linesClass: 'line', autoSplit: true,
        onSplit: function (self) {
          var tl = gsap.timeline({ scrollTrigger: { trigger: text, start: 'top bottom', end: 'top 80%', toggleActions: 'none play none reset' } });
          tl.from(self.words, { yPercent: 170, duration: 0.7, delay: delay, stagger: { amount: 0.2 }, ease: 'power3.out' });
          gsap.set(text, { autoAlpha: 1 });
          return tl;
        }
      });
      gsap.set(text, { autoAlpha: 1 });
    });
  }
  function baMotion() {
    var rows = $$('.ba-row');
    if (!rows.length || reduce) return;
    gsap.from('.ba-sub', { y: 24, autoAlpha: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.ba-head', start: 'top 85%', toggleActions: 'play none none reset' } });
    rows.forEach(function (row) {
      var st = { trigger: row, start: 'top 82%', toggleActions: 'play none none reset' };
      var tl = gsap.timeline({ scrollTrigger: st });
      tl.from(row.querySelector('.ba-label span'), { x: -30, autoAlpha: 0, duration: 0.7, ease: 'power3.out' })
        .from(row.querySelector('.ba-label i'), { scaleX: 0, duration: 0.8, ease: 'power2.inOut' }, 0.1)
        .from(row.querySelectorAll('.ba-card'), { y: 70, autoAlpha: 0, duration: 0.9, stagger: 0.15, ease: 'power3.out' }, 0.15)
        .from(row.querySelectorAll('.ba-img img'), { scale: 1.25, duration: 1.4, stagger: 0.15, ease: 'power3.out' }, 0.15)
        .from(row.querySelectorAll('.ba-card figcaption'), { y: 14, autoAlpha: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out' }, 0.7);
    });
    gsap.from('.ba-more', { y: 20, autoAlpha: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: '.ba-more', start: 'top 92%', toggleActions: 'play none none reset' } });
  }
  function scMotion() {
    if (reduce || !$('.sc-grid')) return;
    $$('.sc-grid').forEach(function (grid) {
      var cards = grid.querySelectorAll('.sc-card');
      var tl = gsap.timeline({ scrollTrigger: { trigger: grid, start: 'top 85%', toggleActions: 'play none none reset' } });
      tl.from(cards, { y: 80, autoAlpha: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out' })
        .from(grid.querySelectorAll('.sc-img img'), { scale: 1.25, duration: 1.4, stagger: 0.12, ease: 'power3.out' }, 0.05);
    });
    gsap.from('.sc-sub', { y: 24, autoAlpha: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: '.sc-head', start: 'top 85%', toggleActions: 'play none none reset' } });
  }
  (doc.fonts && doc.fonts.ready ? doc.fonts.ready : Promise.resolve()).then(function () { wordReveal(); baMotion(); scMotion(); ScrollTrigger.refresh(); });

  /* ------------------------------------------------------------ page-load intro (nav + lines) */
  if (!reduce) {
    gsap.from('.nav-wrap', { opacity: 0, yPercent: -100, duration: 1, ease: 'power4.out' });
    gsap.from('.line-horizontal', { width: '0%', duration: 1.2, delay: .4, ease: 'power4.out' });
    gsap.from('.line-vertical.hero', { height: '0%', duration: 5, ease: 'power4.out' });
  }

  /* ------------------------------------------------------------ HOME: hero zoom (scroll progress, same keyframes) */
  var heroWrap = $('.hero__section-animation');
  if (heroWrap && !reduce) {
    var elSection = $('.hero__section', heroWrap), elScreen = $('.screen-container', heroWrap), elContent = $('.hero-content', heroWrap),
      elGrad = $('.hero-hidden-gradient', heroWrap), elDesc = $('.screen-description-wrap', heroWrap), elVideo = $('.video-wrap', heroWrap),
      elBg = $('.hero__section-bg', heroWrap);
    var intro = { k: 1 };
    gsap.fromTo(elBg, { scale: 1.1 }, { scale: 1, duration: 1.6, ease: 'power4.out' });
    gsap.to(intro, { k: 0, duration: 1.6, ease: 'power4.out', onUpdate: function () { dirty = true; } });
    var mode = function () { var w = window.innerWidth; return w >= 992 ? 'web' : (w >= 480 ? 'tablet' : 'mobile'); };
    var K = {
      web: { section: [[20, 0], [30, -20]], screen: [[30, .35], [70, .82]], content: [[30, 1], [70, 2.5]], grad: [[30, 0], [40, 1]], desc: [[30, 0], [35, 1], [50, 1], [55, 0]], vid: [[55, 0], [60, 1]], base: .35 },
      tablet: { section: [[20, 0], [30, 0]], screen: [[30, .5], [70, .9]], content: [[30, 1], [70, 2.5]], grad: [[30, 0], [40, 1]], desc: [[30, 0], [35, 1], [50, 1], [55, 0]], vid: [[55, 0], [60, 1]], base: .5 },
      mobile: { section: [[20, 0], [30, 0]], screen: [[30, .65], [70, 1]], content: [[30, 1], [70, 1.5]], grad: [[30, 0], [40, 1]], desc: [[30, 0], [35, 1], [60, 1], [65, 0]], vid: [[55, 0], [60, 1]], base: .65 }
    };
    var cur = null, tgt = null, dirty = true;
    function heroProgress() {
      var top = docTop(heroWrap), h = heroWrap.offsetHeight, vh = window.innerHeight, y = window.pageYOffset;
      return clamp((y + vh - top) / (h + vh) * 100, 0, 100);
    }
    function heroTarget() {
      var m = K[mode()], p = heroProgress();
      return { section: kf(m.section, p), screen: kf(m.screen, p), content: kf(m.content, p), grad: kf(m.grad, p), desc: kf(m.desc, p), vid: kf(m.vid, p), base: m.base };
    }
    tgt = heroTarget(); cur = Object.assign({}, tgt);
    function heroRender() {
      var t = heroTarget(), e = 0.14, ch = false;
      for (var k in t) { if (k === 'base') continue; var d = t[k] - cur[k]; if (Math.abs(d) > 0.0004) { cur[k] += d * e; ch = true; } else cur[k] = t[k]; }
      if (!ch && !dirty) return;
      dirty = false;
      var sc = cur.screen * (1 + .1 * intro.k * (cur.screen <= t.base + .001 ? 1 : 0));
      elSection.style.transform = 'translate3d(0,' + cur.section + 'vh,0)';
      elScreen.style.transform = 'scale(' + sc + ')';
      /* desktop: park the TV on the empty wall (up + right), glide back to centre as it grows */
      var mm = K[mode()], off = mode() === 'web' ? clamp((mm.screen[1][1] - cur.screen) / (mm.screen[1][1] - mm.base), 0, 1) : 0;
      elScreen.style.translate = (7.4 * off).toFixed(2) + 'vw ' + (-20.5 * off).toFixed(2) + 'vh';
      elContent.style.transform = 'scale(' + cur.content + ')';
      elGrad.style.opacity = cur.grad;
      elDesc.style.opacity = cur.desc;
      elVideo.style.opacity = cur.vid;
      elVideo.style.pointerEvents = cur.vid > .9 ? 'auto' : 'none';
    }
    gsap.ticker.add(heroRender);
    window.addEventListener('resize', function () { dirty = true; });
  }

  /* ------------------------------------------------------------ HOME: in-screen reel (the "video") */
  (function () {
    var reel = $('.reel'); if (!reel) return;
    var slides = $$('.reel__slide', reel), dots = $$('.reel__dots i', reel), i = 0, timer = null;
    function show(n) { i = n; slides.forEach(function (s, k) { s.classList.toggle('is-on', k === n); }); dots.forEach(function (d, k) { d.classList.toggle('is-on', k === n); }); }
    show(0);
    if (reduce) return;
    var wrap = $('.hero__section-animation'), running = false;
    function tick() { show((i + 1) % slides.length); }
    ScrollTrigger.create({ trigger: wrap, start: 'top bottom', end: 'bottom top', onToggle: function (s) { if (s.isActive && !running) { running = true; timer = setInterval(tick, 3800); } else if (!s.isActive && running) { running = false; clearInterval(timer); } } });
  })();

  /* ------------------------------------------------------------ HOME: parallax on practice image */
  var pimg = $('.practice-img-wrap .practice-image');
  if (pimg && pimg.tagName === 'VIDEO') { if (reduce) { pimg.removeAttribute('autoplay'); pimg.pause(); } else { var pp = pimg.play(); if (pp && pp.catch) pp.catch(function () {}); } }
  if (pimg && !reduce) {
    gsap.fromTo(pimg, { yPercent: -8, scale: 1.12 }, { yPercent: 8, scale: 1.12, ease: 'none', scrollTrigger: { trigger: '.practice-img-wrap', start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  /* ------------------------------------------------------------ HOME: steps sequence */
  var stepsWrap = $('.steps-animation-main-wrap');
  if (stepsWrap) {
    var items = $$('.text-146-regular', stepsWrap), N = items.length, bar = $('.step-progress-bar', stepsWrap), fire = $('.fire-icon', stepsWrap), count = $('.step-count', stepsWrap);
    var barWrap = $('.step-progress-bar-wrap', stepsWrap);
    var step = 80 / (N - 1), len = step * .87;
    function stepState(p) {
      var out = [];
      for (var k = 0; k < N; k++) {
        var oi = k === 0 ? 1 : clamp((p - (k - 1) * step) / len, 0, 1);
        var oo = k === N - 1 ? 0 : clamp((p - k * step) / len, 0, 1);
        out.push([oi * (1 - oo), (k === 0 ? 0 : 20 * (1 - oi)) - 20 * oo]);
      }
      return out;
    }
    var sCur = 0, sTgt = 0;
    function renderSteps(p) {
      var st = stepState(p);
      items.forEach(function (el, k) { el.style.opacity = st[k][0]; el.style.transform = 'translateY(' + st[k][1] + '%)'; });
      var f = clamp(p / 80, 0, 1), bh = barWrap.clientHeight;
      bar.style.height = (f * 100) + '%';
      var vh = window.innerHeight;
      fire.style.transform = 'translateY(' + (-3 * vh / 100 + f * 79 * vh / 100) + 'px)';
      if (count) { var idx = Math.min(N, Math.round(f * (N - 1)) + 1); count.textContent = (idx < 10 ? '0' : '') + idx + ' / ' + (N < 10 ? '0' : '') + N; }
    }
    if (reduce) { items.forEach(function (el) { el.style.position = 'static'; el.style.opacity = 1; el.style.transform = 'none'; }); stepsWrap.style.height = 'auto'; $('.steps-animation-sticky-wrap', stepsWrap).style.position = 'static'; }
    else {
      renderSteps(0);
      ScrollTrigger.create({ trigger: stepsWrap, start: 'top top', end: 'bottom bottom', onUpdate: function (s) { sTgt = s.progress * 100; } });
      gsap.ticker.add(function () { var d = sTgt - sCur; if (Math.abs(d) > .01) { sCur += d * .14; renderSteps(sCur); } });
    }
  }

  /* ------------------------------------------------------------ HOME: stacked cards (scrub) + flip */
  var stack = $('.solution-cards.web');
  if (stack) {
    var cards = $$('.solution-card', stack);
    var C = [
      { s: [[10, 1.2], [15, 1], [38, 1], [42, .9]], x: [[15, 0], [22, -18.25], [37, -18.25]], y: [[15, 0], [22, -9], [37, -9]], r: [[33, 0], [38, -180]] },
      { s: [[10, 1.2], [15, 1], [37, .9], [38, 1], [47, 1], [54, .9]], x: [[15, 0], [22, -14], [24, -14], [37, 16], [38, 16], [42, -1.5], [47, -1.5], [54, -17.75]], y: [[15, 0], [22, -5], [24, -5], [37, 6], [38, 6], [42, 1], [47, 1], [54, -8]], r: [[42, 0], [47, -180]] },
      { s: [[10, 1.2], [15, 1], [37, .9], [47, .9], [54, 1], [59, 1], [64, .9]], x: [[15, 0], [22, -6], [24, -6], [37, 17], [47, 17], [54, -1.5], [59, -1.5], [64, -17.25]], y: [[15, 0], [22, -2], [24, -2], [37, 7], [47, 7], [54, 1], [59, 1], [64, -7]], r: [[54, 0], [59, -180]] },
      { s: [[10, 1.2], [15, 1], [37, .9], [59, .9], [64, 1], [69, 1], [72, .9]], x: [[15, 0], [22, 2], [24, 2], [37, 18], [59, 18], [64, -1.5], [69, -1.5], [72, -16.75]], y: [[15, 0], [22, 2], [24, 2], [37, 8], [59, 8], [64, 1], [69, 1], [72, -6]], r: [[64, 0], [69, -180]] },
      { s: [[10, 1.2], [15, 1], [37, .9], [69, .9], [72, 1]], x: [[15, 0], [22, 12], [24, 12], [37, 19], [69, 19], [72, 0]], y: [[15, 0], [22, 5], [24, 5], [37, 9], [69, 9], [72, 2]], r: [[72, 0], [77, -180]] }
    ];
    var wrapEl = $('.solutions-wrap'), hov = cards.map(function () { return { r: 0 }; }), cp = 0, cTgt = 0;
    if (reduce) { /* static fan */ cards.forEach(function (c, i) { c.style.position = 'relative'; }); stack.style.height = 'auto'; stack.style.position = 'static'; }
    else {
      var emPx = parseFloat(getComputedStyle(cards[0]).fontSize);
      function renderCards(p) {
        var em = parseFloat(getComputedStyle(cards[0]).fontSize) || emPx;
        cards.forEach(function (c, i) {
          var d = C[i], sc = kf(d.s, p), x = kf(d.x, p) * em, y = kf(d.y, p) * em, r = kf(d.r, p) + hov[i].r;
          c.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0) perspective(110em) rotateY(' + r + 'deg) scale(' + sc + ')';
        });
      }
      renderCards(0);
      ScrollTrigger.create({ trigger: wrapEl, start: 'top bottom', end: 'bottom top', onUpdate: function (s) { cTgt = s.progress * 100; } });
      gsap.ticker.add(function () { var d = cTgt - cp; if (Math.abs(d) > .01) { cp += d * .14; renderCards(cp); } });
      cards.forEach(function (c, i) {
        var flip = function (on) { gsap.to(hov[i], { r: on ? -180 : 0, duration: .8, ease: 'power2.inOut', onUpdate: function () { renderCards(cp); } }); };
        c.addEventListener('mouseenter', function () { if (window.matchMedia('(hover:hover)').matches) flip(true); });
        c.addEventListener('mouseleave', function () { if (window.matchMedia('(hover:hover)').matches) flip(false); });
        c.addEventListener('click', function () { var on = hov[i].r === 0; if (!window.matchMedia('(hover:hover)').matches) flip(on); });
        c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(hov[i].r === 0); } });
      });
    }
  }
  /* mobile row: tap/hover flip */
  $$('.solution-cards.mobile .solution-card').forEach(function (c) {
    var f = c.querySelector('.solution-front'), b = c.querySelector('.solution-back'), on = false;
    c.style.transformStyle = 'preserve-3d';
    function set(v) { on = v; gsap.to(c, { rotateY: on ? -180 : 0, transformPerspective: 1200, duration: .8, ease: 'power2.inOut' }); }
    c.addEventListener('click', function () { set(!on); });
    c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set(!on); } });
    c.addEventListener('mouseenter', function () { if (matchMedia('(hover:hover)').matches) set(true); });
    c.addEventListener('mouseleave', function () { if (matchMedia('(hover:hover)').matches) set(false); });
  });

  /* ------------------------------------------------------------ marquee */
  var mq = $$('.logos-wrap');
  if (mq.length && !reduce) gsap.to(mq, { xPercent: -100, duration: 30, ease: 'none', repeat: -1 });

  /* ------------------------------------------------------------ plus icon + generic hover */
  $$('.btn-white, .btn-black, .submit-button').forEach(function (b) {
    var ic = b.querySelector('.plus-icon'); if (!ic || reduce) return;
    b.addEventListener('mouseenter', function () { gsap.fromTo(ic, { rotate: 0 }, { rotate: 90, duration: .5, ease: 'power4.out' }); });
    b.addEventListener('mouseleave', function () { gsap.to(ic, { rotate: 0, duration: .5, ease: 'power4.out' }); });
  });
  /* nav link hover: slide the duplicated label (reference: move -1.5em) */
  $$('.nav-link-wrap').forEach(function (w) {
    if (reduce) return;
    var l = $$('.nav-link, .nav-link-footer', w);
    w.addEventListener('mouseenter', function () { gsap.to(l, { y: '-1.5em', duration: .6, ease: 'power4.out' }); });
    w.addEventListener('mouseleave', function () { gsap.to(l, { y: '0em', duration: .6, ease: 'power4.out' }); });
  });

  finish();

  /* ------------------------------------------------------------ shared (no-gsap-safe) behaviours */
  function finish() {
    /* Contact form: shared handler + booking popup (every [data-calendly] opens the same form) */
    function cfBind(f, getSubject) {
      var st = f.querySelector('.cf-status');
      function say(m) { st.textContent = m; st.classList.add('is-on'); }
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        if (f.elements.hp && f.elements.hp.value) return;
        var ok = true;
        [['name'], ['email', 1], ['message']].forEach(function (r) {
          var el = f.elements[r[0]], v = el.value.trim(), bad = !v || (r[1] && !/^\S+@\S+\.\S+$/.test(v));
          el.classList.toggle('is-err', bad); if (bad) ok = false;
        });
        if (!ok) { say('Please fill in your name, a valid email and a message.'); return; }
        var d = { name: f.elements.name.value.trim(), email: f.elements.email.value.trim(), phone: f.elements.phone.value.trim(), subject: f.elements.subject.value.trim() || 'Website enquiry', message: f.elements.message.value.trim() };
        if (cfg.contactEndpoint) {
          say('Sending…');
          fetch(cfg.contactEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(d) })
            .then(function (r) { if (!r.ok) throw 0; f.reset(); say('Thank you — your message has been sent. We will reply within 24 hours.'); })
            .catch(function () { say('Sorry, your message could not be sent. Please email ' + cfg.email + ' or call ' + cfg.phone + '.'); });
        } else {
          location.href = 'mailto:' + cfg.email + '?subject=' + encodeURIComponent(d.subject + ' — ' + d.name) + '&body=' + encodeURIComponent(d.message + '\n\n' + d.name + (d.phone ? ' · ' + d.phone : '') + ' (' + d.email + ')');
          say('Your email app should now open with your message ready to send. Nothing is sent until you press send there. Prefer another way? Call ' + cfg.phone + '.');
        }
      });
    }
    $$('form.cf').forEach(function (f) { cfBind(f); });
    var modal;
    function opts(arr, ph) { return '<option value="">' + ph + '</option>' + arr.map(function (o) { return '<option value="' + o[0] + '">' + o[1] + '</option>'; }).join(''); }
    function buildModal() {
      var M = window.MIRELLE || {}, keep = ['signature-cut', 'global-colour', 'repair-ritual', 'keratin-smoothing', 'signature-facial', 'glow-facial', 'skin-consultation', 'bridal-styling', 'event-styling'];
      var svc = (M.services || []).filter(function (x) { return keep.indexOf(x.slug) > -1; }).map(function (x) { return [x.slug, x.name]; });
      var sty = (M.team || []).map(function (x) { return [x.slug, x.name]; });
      var times = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map(function (t) { return [t, t]; });
      modal = doc.createElement('div'); modal.className = 'cf-modal'; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-labelledby', 'cf-mt');
      modal.innerHTML = '<div class="cf-modal__bg"></div><div class="cf-modal__box fo"><button type="button" class="cf-x" aria-label="Close">&times;</button><h3 id="cf-mt">Fill out the Form</h3>' +
        '<form class="cf bk-form" novalidate><label>Full Name<input name="name" placeholder="Your full name" autocomplete="name" required></label>' +
        '<div class="cf-row"><label>Email Address<input name="email" type="email" placeholder="info@gmail.com" autocomplete="email" required></label><label>Phone Number<input name="phone" type="tel" placeholder="00" autocomplete="tel"></label></div>' +
        '<div class="cf-row"><label>Gender<select name="gender">' + opts([['Female', 'Female'], ['Male', 'Male'], ['Prefer not to say', 'Prefer not to say']], 'Select now') + '</select></label><label>Age<input name="age" type="number" min="1" max="120" placeholder="00"></label></div>' +
        '<div class="cf-row"><label>Service Selection<select name="service">' + opts(svc, 'Select now') + '</select></label><label>Preferred Stylist<select name="stylist">' + opts(sty, 'Select now') + '</select></label></div>' +
        '<div class="cf-row"><label>Preferred Date<input name="date" type="date"></label><label>Preferred Time<select name="time">' + opts(times, 'Select a time') + '</select></label></div>' +
        '<input class="hp" name="hp" tabindex="-1" autocomplete="off" aria-hidden="true"><button type="submit" class="cf-submit">Book an Appointment</button><div class="cf-status" role="status" aria-live="polite"></div></form></div>';
      doc.body.appendChild(modal);
      var f = modal.querySelector('form'), st = f.querySelector('.cf-status');
      function say(m) { st.textContent = m; st.classList.add('is-on'); }
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        if (f.elements.hp.value) return;
        var ok = true;
        [['name'], ['email', 1], ['phone']].forEach(function (r) { var el = f.elements[r[0]], v = el.value.trim(), bad = !v || (r[1] && !/^\S+@\S+\.\S+$/.test(v)); el.classList.toggle('is-err', bad); if (bad) ok = false; });
        if (!ok) { say('Please add your name, a valid email and a phone number.'); return; }
        var T = function (n) { var el = f.elements[n]; return el.tagName === 'SELECT' && el.selectedIndex > 0 ? el.options[el.selectedIndex].text : (el.tagName === 'SELECT' ? '' : el.value.trim()); };
        var lines = ['Name: ' + T('name'), 'Email: ' + T('email'), 'Phone: ' + T('phone'), 'Gender: ' + T('gender'), 'Age: ' + T('age'), 'Service: ' + T('service'), 'Preferred stylist: ' + T('stylist'), 'Preferred date: ' + T('date'), 'Preferred time: ' + T('time')];
        var subject = 'Appointment request' + (T('service') ? ' — ' + T('service') : '') + ' — ' + T('name');
        if (cfg.contactEndpoint) {
          say('Sending…');
          fetch(cfg.contactEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ subject: subject, message: lines.join('\n') }) })
            .then(function (r) { if (!r.ok) throw 0; f.reset(); say('Thank you — your request has been sent. We will reply within 24 hours to confirm your time.'); })
            .catch(function () { say('Sorry, your request could not be sent. Please email ' + cfg.email + ' or call ' + cfg.phone + '.'); });
        } else {
          location.href = 'mailto:' + cfg.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
          say('Your email app should now open with your request ready to send. Nothing is sent until you press send there. Prefer another way? Call ' + cfg.phone + '.');
        }
      });
      modal.querySelector('.cf-modal__bg').addEventListener('click', closeModal);
      modal.querySelector('.cf-x').addEventListener('click', closeModal);
      doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
    }
    function closeModal() { if (modal) { modal.classList.remove('is-open'); doc.documentElement.style.overflow = ''; } }
    $$('[data-calendly]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        if (!modal) buildModal();
        var q = {}; ((a.getAttribute('href') || '').split('?')[1] || '').split('&').forEach(function (p) { var kv = p.split('='); if (kv[0]) q[kv[0]] = decodeURIComponent(kv[1] || ''); });
        var f = modal.querySelector('form');
        f.elements.service.value = q.service || ''; f.elements.stylist.value = q.stylist || '';
        modal.querySelector('.cf-status').classList.remove('is-on');
        modal.classList.add('is-open'); doc.documentElement.style.overflow = 'hidden';
        setTimeout(function () { f.elements.name.focus(); }, 50);
      });
    });
    /* newsletter (Constant Contact) — honest states only */
    $$('form[data-newsletter]').forEach(function (f) {
      var msg = f.parentNode.querySelector('.form-msg');
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var email = (f.email.value || '').trim();
        if (!/^\S+@\S+\.\S+$/.test(email)) { if (msg) { msg.className = 'form-msg err'; msg.textContent = 'Please enter a valid email address.'; } return; }
        if (cfg.constantContactAction) {
          var h = doc.createElement('form'); h.method = 'POST'; h.action = cfg.constantContactAction; h.target = '_blank'; h.style.display = 'none';
          var i = doc.createElement('input'); i.name = 'email'; i.value = email; h.appendChild(i); doc.body.appendChild(h); h.submit(); h.remove();
          if (msg) { msg.className = 'form-msg ok'; msg.textContent = 'Opening the confirmation page — please complete it to finish subscribing.'; }
        } else {
          window.location.href = 'mailto:' + cfg.email + '?subject=' + encodeURIComponent('Newsletter sign-up') + '&body=' + encodeURIComponent('Please add me to the MIRELLE newsletter: ' + email);
          if (msg) { msg.className = 'form-msg'; msg.textContent = 'Live sign-up is not connected yet — your email app opened with a request instead.'; }
        }
      });
    });
    window.ScrollTrigger && window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }
})();
