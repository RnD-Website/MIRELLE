/* MIRELLE — inner page behaviours: filters, lightbox, booking flow, contact form. No fake confirmations. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var cfg = (window.MIRELLE && MIRELLE.config) || {};

  /* ---- generic chip filter (gallery items, journal cards) ---- */
  var chips = $$('.filters .chip');
  if (chips.length) {
    var items = $$('.gal__it, #jgrid .jn-card');
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        chips.forEach(function (x) { x.classList.toggle('is-on', x === c); });
        var f = c.getAttribute('data-f');
        items.forEach(function (it) { it.hidden = !(f === 'all' || it.getAttribute('data-cat') === f); });
        if (window.ScrollTrigger) setTimeout(function () { ScrollTrigger.refresh(); }, 50);
      });
    });
  }

  /* ---- lightbox ---- */
  var lb = $('#lb');
  if (lb) {
    var lbImg = $('img', lb), cap = $('.lb__cap', lb), cur = 0, last = null;
    var vis = function () { return $$('.gal__it').filter(function (i) { return !i.hidden; }); };
    var show = function (i) {
      var v = vis(); if (!v.length) return;
      cur = (i + v.length) % v.length; var it = v[cur];
      lbImg.src = it.getAttribute('data-full'); lbImg.style.objectPosition = it.getAttribute('data-pos');
      lbImg.alt = it.getAttribute('data-title'); cap.textContent = it.getAttribute('data-title') + '  ·  ' + (cur + 1) + ' / ' + v.length;
    };
    var open = function (it) { last = it; lb.classList.add('is-open'); document.documentElement.style.overflow = 'hidden'; show(vis().indexOf(it)); $('.lb__x', lb).focus(); };
    var close = function () { lb.classList.remove('is-open'); document.documentElement.style.overflow = ''; if (last) last.focus(); };
    $$('.gal__it').forEach(function (it) { it.addEventListener('click', function () { open(it); }); });
    $('.lb__x', lb).addEventListener('click', close);
    $('.lb__p', lb).addEventListener('click', function () { show(cur - 1); });
    $('.lb__n', lb).addEventListener('click', function () { show(cur + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close(); else if (e.key === 'ArrowLeft') show(cur - 1); else if (e.key === 'ArrowRight') show(cur + 1);
    });
  }

  /* ---- shared validation ---- */
  var emailOk = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); };
  function check(fields) {
    var ok = true;
    fields.forEach(function (f) {
      var el = $('#' + f[0]), msg = $('[data-for="' + f[0] + '"]'), v = el.value.trim(), e = '';
      if (!v) e = 'This field is required.'; else if (f[1] === 'email' && !emailOk(v)) e = 'Please enter a valid email address.';
      el.classList.toggle('is-err', !!e); if (msg) msg.textContent = e; if (e) ok = false;
    });
    return ok;
  }

  /* ---- booking flow ---- */
  var bk = $('.bk');
  if (bk) {
    var st = { service: '', stylist: '' }, step = 0, panels = $$('.bk__panel'), steps = $$('.bk__step');
    var go = function (n) {
      step = n;
      panels.forEach(function (p, i) { p.classList.toggle('is-on', i === n); });
      steps.forEach(function (s, i) { s.classList.toggle('is-on', i === n); s.classList.toggle('is-done', i < n); });
      if (n === 4) summary(); if (n === 5) mail();
      var top = bk.getBoundingClientRect().top + window.scrollY - 100;
      if (window.__lenis) window.__lenis.scrollTo(top); else window.scrollTo({ top: top, behavior: 'smooth' });
    };
    var val = function (id) { var e = $('#' + id); return e ? e.value.trim() : ''; };
    var rows = function () {
      return [['Service', st.service], ['Stylist', st.stylist || 'First available'], ['Preferred date', val('b-date') || 'Flexible'], ['Preferred time', val('b-time') || 'Any time'],
        ['Name', val('b-name')], ['Email', val('b-email')], ['Phone', val('b-phone') || '—'], ['Notes', val('b-note') || '—']];
    };
    function summary() { $('#b-sum').innerHTML = rows().map(function (r) { var d = document.createElement('div'), a = document.createElement('dt'), b = document.createElement('dd'); a.textContent = r[0]; b.textContent = r[1]; d.appendChild(a); d.appendChild(b); return d.outerHTML; }).join(''); }
    function mail() {
      var body = 'Hello MIRELLE,\n\nI would like to request an appointment:\n\n' + rows().map(function (r) { return r[0] + ': ' + r[1]; }).join('\n') + '\n\nThank you.';
      $('#b-mail').href = 'mailto:' + (cfg.email || '') + '?subject=' + encodeURIComponent('Appointment request — ' + st.service) + '&body=' + encodeURIComponent(body);
      $('#b-status').textContent = 'Nothing has been sent yet. “Email this request” opens your email app with the details filled in, and we will confirm your appointment by reply.';
    }
    $$('.opt').forEach(function (o) {
      o.addEventListener('click', function () {
        var k = o.getAttribute('data-k');
        $$('.opt[data-k="' + k + '"]').forEach(function (x) { x.classList.toggle('is-on', x === o); });
        st[k] = o.getAttribute('data-v'); $('#e' + (k === 'service' ? 0 : 1)).textContent = '';
      });
    });
    $$('[data-next]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (step === 0 && !st.service) { $('#e0').textContent = 'Please choose a service to continue.'; return; }
        if (step === 1 && !st.stylist) { $('#e1').textContent = 'Please choose a stylist (or “First available”).'; return; }
        if (step === 3 && !check([['b-name'], ['b-email', 'email']])) return;
        go(step + 1);
      });
    });
    $$('[data-back]').forEach(function (b) { b.addEventListener('click', function () { go(step - 1); }); });
    /* preselect from ?service= / ?stylist= */
    var q = new URLSearchParams(location.search);
    ['service', 'stylist'].forEach(function (k) { var s = q.get(k); if (!s) return; var o = $('.opt[data-k="' + k + '"][data-slug="' + s + '"]'); if (o) o.click(); });
    if (st.service) go(st.stylist ? 2 : 1);
  }

  /* ---- contact form (honest states) ---- */
  var cf = $('#c-form');
  if (cf) {
    var status = $('#c-status'), say = function (m) { status.textContent = m; status.classList.add('is-on'); };
    cf.addEventListener('submit', function (e) {
      e.preventDefault();
      if ($('#c-hp').value) return;
      if (!check([['c-name'], ['c-email', 'email'], ['c-msg']])) return;
      var data = { name: val2('c-name'), email: val2('c-email'), subject: $('#c-sub').value, message: val2('c-msg') };
      if (cfg.contactEndpoint) {
        say('Sending…');
        fetch(cfg.contactEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) })
          .then(function (r) { if (!r.ok) throw 0; cf.reset(); say('Thank you — your message has been sent. We will reply as soon as we can.'); })
          .catch(function () { say('Sorry, your message could not be sent. Please email ' + cfg.email + ' or call ' + cfg.phone + '.'); });
      } else {
        location.href = 'mailto:' + cfg.email + '?subject=' + encodeURIComponent(data.subject + ' — ' + data.name) + '&body=' + encodeURIComponent(data.message + '\n\n' + data.name + ' (' + data.email + ')');
        say('Your email app should now open with your message ready to send. Nothing is sent until you press send there. Prefer another way? Call ' + cfg.phone + ' or message us on WhatsApp.');
      }
    });
    function val2(id) { return $('#' + id).value.trim(); }
  }
})();
