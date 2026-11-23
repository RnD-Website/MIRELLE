/* MIRELLE shared scroll-reveal + stat counters. Robust: IntersectionObserver, CSS-driven,
   classes removed after the animation so hover effects are never blocked. */
(function () {
  var d = document, de = d.documentElement;
  if (!de.classList.contains('js')) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;

  var home = !!d.querySelector('main > .hero');
  var SECS = home ? '.fq-sec' : '.pg-sec,.ab-sec,.ct-photo';
  var SKIP = '.sc-card,.ba-card,[data-word-reveal],.side-lines,script,style,.ab-big,.ab-band';
  var OPEN = '.ab-tl__rows,.ct-acc,.sd-chips,.opts,.fq-col';

  function kids(el) {
    return Array.prototype.filter.call(el.children, function (c) { return !c.matches(SKIP); });
  }
  function multi(el) {
    if (el.matches(OPEN)) return true;
    var cs = getComputedStyle(el);
    return (cs.display === 'grid' || (cs.display === 'flex' && cs.flexDirection === 'row' && cs.flexWrap === 'wrap')) && el.children.length > 1;
  }
  function expand(el, depth) {
    if (el.matches(SKIP)) return [];
    if (depth < 3 && multi(el)) {
      var out = [];
      kids(el).forEach(function (k) { out = out.concat(expand(k, depth + 1)); });
      return out.length ? out : [el];
    }
    return [el];
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!(e.isIntersecting || e.boundingClientRect.top < 0)) return;
      var el = e.target; io.unobserve(el);
      el.classList.add('rv-in');
      var delay = parseFloat(el.style.getPropertyValue('--d')) || 0;
      setTimeout(function () { el.classList.remove('rv', 'rv-in'); el.style.removeProperty('--d'); }, (delay + 1.3) * 1000);
      var st = el.querySelectorAll('.ab-stat b'); if (el.matches('.ab-stat')) st = [el.querySelector('b')];
      Array.prototype.forEach.call(st, count);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

  function count(b) {
    if (!b || b.__c) return; b.__c = 1;
    var n = b.firstChild; if (!n || n.nodeType !== 3) return;
    var m = /^(\d+(?:\.\d+)?)(.*)$/.exec(n.nodeValue); if (!m || /:/.test(n.nodeValue)) return;
    var to = parseFloat(m[1]), dec = (m[1].split('.')[1] || '').length, t0 = null;
    function step(t) {
      if (!t0) t0 = t; var p = Math.min((t - t0) / 1400, 1), v = to * (1 - Math.pow(1 - p, 3));
      n.nodeValue = v.toFixed(dec) + m[2]; if (p < 1) requestAnimationFrame(step);
    }
    n.nodeValue = (0).toFixed(dec) + m[2]; requestAnimationFrame(step);
  }

  function init() {
    d.querySelectorAll(SECS).forEach(function (sec) {
      var box = sec.querySelector(':scope > .container > .pg-sec__in') || sec.querySelector(':scope > .container') || sec;
      for (var i = 0; i < 2; i++) { var k = kids(box); if (k.length === 1 && k[0].children.length > 1 && !multi(k[0])) box = k[0]; else break; }
      var blocks = [];
      kids(box).forEach(function (c) { blocks = blocks.concat(expand(c, 0)); });
      var idx = new Map();
      blocks.forEach(function (el) {
        var p = el.parentNode, n = idx.get(p) || 0; idx.set(p, n + 1);
        el.style.setProperty('--d', (Math.min(n, 6) * 0.09).toFixed(2) + 's');
        el.classList.add('rv'); io.observe(el);
      });
    });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(init); else init();
})();
