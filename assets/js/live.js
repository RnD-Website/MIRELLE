/* MIRELLE – live studio board (home) + floating concierge chat (all pages)
   Demo logic: the board is simulated from the visitor's clock and the opening hours in data.js.
   To go truly live, replace tick() data with a fetch() to your booking system. */
(function () {
  'use strict';
  var M = window.MIRELLE || {}, C = M.config || M;
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var fmt = function (m) { var h = Math.floor(m / 60), mm = m % 60, ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12; return h + ':' + pad(mm) + ' ' + ap; };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  /* ---------- opening hours from data.js ---------- */
  function hoursFor(d) {
    var out = null;
    (C.hours || []).forEach(function (row) {
      var names = row[0].split(/\s*[–-]\s*/), a = DAYS.indexOf(names[0]), b = names[1] ? DAYS.indexOf(names[1]) : a;
      if (a < 0) return;
      var hit = false; for (var i = a; ; i = (i + 1) % 7) { if (i === d) hit = true; if (i === b) break; }
      if (!hit) return;
      var t = row[1].match(/(\d+):(\d+)\D+(\d+):(\d+)/);
      out = t ? [(+t[1]) * 60 + (+t[2]), (+t[3]) * 60 + (+t[4])] : null;
    });
    return out;
  }
  function nextOpen(now) {
    for (var k = 1; k <= 7; k++) { var d = (now.getDay() + k) % 7, h = hoursFor(d); if (h) return { day: DAYS[d], at: h[0], tomorrow: k === 1 }; }
    return null;
  }

  /* ---------- simulated day ---------- */
  var SERV = ['Signature Cut & Style', 'Global Colour & Gloss', 'Signature Facial', 'Blowout & Styling', 'Keratin Smoothing', 'Glow Facial', 'Repair Ritual', 'Bridal Trial'];
  var PEOPLE = ['Isabella', 'Amara', 'Clara', 'Sofia'];
  var INIT = ['A. R.', 'M. K.', 'S. L.', 'N. B.', 'H. T.', 'J. P.', 'L. D.', 'R. F.', 'E. W.', 'T. C.', 'K. S.', 'D. M.'];
  var SLOT = 45;

  function build(now) {
    var h = hoursFor(now.getDay());
    if (!h) return { closed: true, next: nextOpen(now), slots: [], now: now };
    var mins = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
    var slots = [], n = 0;
    for (var t = h[0]; t + SLOT <= h[1]; t += SLOT, n++) {
      var st = mins >= t + SLOT ? 'done' : mins >= t ? 'now' : 'up';
      slots.push({ n: n + 1, t: t, st: st, who: INIT[n % INIT.length], svc: SERV[(n * 3 + now.getDay()) % SERV.length], by: PEOPLE[(n + now.getDay()) % PEOPLE.length], p: st === 'now' ? Math.min(1, (mins - t) / SLOT) : 0 });
    }
    var open = mins >= h[0] && mins < h[1];
    var nowIdx = -1; slots.forEach(function (s, i) { if (s.st === 'now') nowIdx = i; });
    var firstUp = -1; slots.forEach(function (s, i) { if (firstUp < 0 && s.st === 'up') firstUp = i; });
    var after = mins >= h[1] || (slots.length && slots.every(function (s) { return s.st === 'done'; }));
    return { closed: false, open: open && !after, before: mins < h[0], after: after, hours: h, slots: slots, nowIdx: nowIdx, firstUp: firstUp, mins: mins, now: now, next: nextOpen(now) };
  }
  var tok = function (n) { return 'M-' + (n < 10 ? '00' : n < 100 ? '0' : '') + n; };

  /* ---------- token (stored only in this browser) ---------- */
  function myToken() { try { var o = JSON.parse(localStorage.getItem('mirelle_token') || 'null'); if (o && o.day === new Date().toDateString()) return o; } catch (e) {} return null; }
  function getToken(s) {
    var t = myToken(); if (t) return t;
    var last = s.slots.length ? s.slots.filter(function (x) { return x.st !== 'up'; }).length : 0;
    var o = { day: new Date().toDateString(), n: Math.min(s.slots.length || 1, last + 3 + Math.floor(Math.random() * 3)) };
    try { localStorage.setItem('mirelle_token', JSON.stringify(o)); } catch (e) {}
    return o;
  }
  function waitText(s) {
    if (s.closed || !s.open) return null;
    var cur = s.nowIdx >= 0 ? s.nowIdx + 1 : s.firstUp + 1, ahead = Math.max(0, Math.min(s.slots.length, 3) - 0);
    return { serving: tok(cur), next: tok(Math.min(s.slots.length, cur + 1)), wait: Math.max(5, ahead * 10 + Math.round((1 - (s.slots[s.nowIdx] ? s.slots[s.nowIdx].p : 0)) * 12)) };
  }

  /* ---------- schedule updates ticker ---------- */
  var NOTES = [
    ['Colour appointments are running about 10 minutes behind.', 'warn'],
    ['Two same-day slots just opened — tap “Book appointment”.', 'good'],
    ['Bridal trials today: please arrive 10 minutes early.', ''],
    ['Walk-ins welcome for blowouts while chairs are free.', 'good'],
    ['Facial room is on schedule — no delays.', 'good']
  ];

  /* ===================== HOME BOARD ===================== */
  var PLUS = '<div class="plus-icon"><svg viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.5"/></svg></div>';
  var board = { key: '', feed: [], nextEv: 0, evN: 0, started: false };

  function statsFor(s, w) {
    if (s.closed || !s.open) return [['Chairs free', '4', '/4'], ['Avg. wait', '—', ''], ['Booked today', String(s.slots.length ? Math.round(s.slots.length * .82) : 0), ''], ['Walk-ins waiting', '0', '']];
    var m = Math.floor(s.mins), busy = 2 + (Math.floor(m / 11) % 3), wait = w ? w.wait : 10;
    wait = Math.max(5, wait + ((Math.floor(m / 3) % 5) - 2));
    var done = s.slots.filter(function (x) { return x.st !== 'up'; }).length;
    return [['Chairs free', String(4 - busy), '/4'], ['Avg. wait', '~' + wait, ' min'], ['Booked today', String(Math.round(s.slots.length * .82) + Math.floor(m / 37) % 3), ''], ['Walk-ins waiting', String(1 + (Math.floor(m / 7) % 4)), '']];
  }
  function setStat(el, v) {
    var n = el.querySelector('.lb-num'); if (n.textContent === v) return;
    n.textContent = v; el.classList.remove('is-tick'); void el.offsetWidth; el.classList.add('is-tick');
  }
  function evText(s, w) {
    var serving = w ? w.serving : 'M-001', pick = function (a) { return a[Math.floor(Math.random() * a.length)]; };
    var by = pick(PEOPLE), svc = pick(SERV), tk = tok(2 + Math.floor(Math.random() * 14)), up = s.slots.filter(function (x) { return x.st === 'up'; });
    var t = up.length ? fmt(pick(up).t) : '';
    var opts = [
      ['call', tk + ' called to the chair', 'with ' + by],
      ['book', 'New booking confirmed', svc + (t ? ' · ' + t : '')],
      ['done', by + ' finished a ' + svc, 'chair is being prepared'],
      ['walk', 'Walk-in token ' + tk + ' issued', 'estimated ' + (8 + Math.floor(Math.random() * 20)) + ' min'],
      ['slot', 'Slot just opened', (t || 'later today') + ' · ' + svc]
    ];
    return pick(opts);
  }
  function addEvent(s, w, silent) {
    var ev = evText(s, w), ul = $('#lb-feed'); if (!ul) return;
    var li = document.createElement('li'); li.className = 'is-' + ev[0] + (silent ? '' : ' is-new'); li.dataset.t = Date.now() - (silent || 0);
    li.innerHTML = '<i></i><div><b>' + esc(ev[1]) + '</b><span>' + esc(ev[2]) + '</span></div><time></time>';
    ul.insertBefore(li, ul.firstChild);
    while (ul.children.length > 5) { var last = ul.lastChild; last.classList.add('is-out'); setTimeout(function (n) { return function () { n.remove(); }; }(last), 400); if (ul.children.length > 7) ul.lastChild.remove(); else break; }
  }
  function ago() {
    [].forEach.call(document.querySelectorAll('#lb-feed li'), function (li) {
      var d = Math.max(0, Math.floor((Date.now() - (+li.dataset.t)) / 1000)), t = li.querySelector('time');
      t.textContent = d < 8 ? 'just now' : d < 60 ? d + 's ago' : Math.floor(d / 60) + ' min ago';
    });
  }

  function renderBoard() {
    var root = $('#live-board'); if (!root) return;
    var s = build(new Date()), w = waitText(s), me = myToken();
    var cs = s.slots[s.nowIdx];
    var key = [s.closed, s.open, s.before, w && w.serving, w && w.next, s.slots.map(function (x) { return x.st[0]; }).join('')].join('|');
    var status = s.closed ? ['closed', 'Closed today'] : s.open ? ['open', 'Open now'] : s.before ? ['soon', 'Opens at ' + fmt(s.hours[0])] : ['closed', 'Closed for today'];
    var reopen = s.before && s.hours ? 'Opens today at ' + fmt(s.hours[0]) : (s.closed || !s.open) && s.next ? 'Reopens ' + (s.next.tomorrow ? 'tomorrow' : s.next.day) + ' at ' + fmt(s.next.at) : '';

    if (!root.querySelector('#lb-main')) {
      root.innerHTML = '<div class="lb-top"><span class="lb-pill"><i></i><b></b></span><span class="lb-clock"><i class="lb-live-dot"></i><em></em></span></div>'
        + '<div id="lb-main"></div>'
        + '<div class="lb-stats" id="lb-stats">' + ['Chairs free', 'Avg. wait', 'Booked today', 'Walk-ins waiting'].map(function (l) { return '<div class="lb-stat"><span>' + l + '</span><div><b class="lb-num">–</b><em></em></div></div>'; }).join('') + '</div>'
        + '<div class="lb-note" id="lb-note"><span>Schedule update</span><p></p></div>';
      board.key = '';
    }
    /* header */
    var pill = $('.lb-pill', root); pill.className = 'lb-pill is-' + status[0]; $('b', pill).textContent = status[1];
    $('.lb-clock em', root).textContent = fmt(s.now.getHours() * 60 + s.now.getMinutes()) + ' · live';

    /* main grid: rebuild only when something meaningful changed (no flicker) */
    if (board.key !== key) {
      board.key = key; var html = '<div class="lb-grid"><div class="lb-card lb-serving">';
      if (w) {
        html += '<div class="lb-k">Now serving</div><div class="lb-big" data-v="' + w.serving + '">' + w.serving + '</div>'
          + '<div class="lb-meta"><div><span>Next up</span><b>' + w.next + '</b></div><div><span>Est. wait</span><b>~' + w.wait + ' min</b></div></div>';
        if (cs) html += '<div class="lb-now"><div class="lb-nowtop"><span>' + esc(cs.svc) + ' · ' + cs.by + '</span><em id="lb-pct">0%</em></div><div class="lb-bar"><i id="lb-fill"></i></div></div>';
      } else html += '<div class="lb-k">Walk-in queue</div><div class="lb-big lb-big--sm">' + (s.before ? 'Opening soon' : 'Closed') + '</div><p class="lb-p">' + (reopen || 'See opening hours below.') + '</p>';
      html += '<a href="booking.html" data-lb-book class="btn-white lb-get"><div>Book now</div>' + PLUS + '</a>';
      html += '</div><div class="lb-card lb-sched"><div class="lb-k">Today\'s schedule</div>';
      if (s.closed) html += '<p class="lb-p">The studio is closed today. ' + (reopen ? reopen + '.' : '') + '</p>';
      else {
        var list = s.slots, start = 0;
        if (s.nowIdx >= 0) start = Math.max(0, s.nowIdx - 1); else if (s.firstUp >= 0) start = s.firstUp;
        if (s.after) start = Math.max(0, list.length - 4);
        html += '<ul class="lb-list">';
        list.slice(start, start + 5).forEach(function (x) {
          html += '<li class="is-' + x.st + '"><time>' + fmt(x.t) + '</time><div><b>' + esc(x.svc) + '</b><span>' + x.who + ' · with ' + x.by + '</span></div><em>' + (x.st === 'done' ? 'Done' : x.st === 'now' ? 'In the chair' : 'Upcoming') + '</em></li>';
        });
        html += '</ul>';
      }
      html += '</div></div>';
      var main = $('#lb-main', root); main.innerHTML = html; main.classList.remove('is-swap'); void main.offsetWidth; main.classList.add('is-swap');
      var c = main.querySelector('[data-lb-book]'); if (c) c.addEventListener('click', function (e) { var b2 = document.querySelector('[data-calendly]'); if (b2) { e.preventDefault(); b2.click(); } });
    }
    /* smooth live progress (no rebuild) */
    var f = $('#lb-fill'); if (f && cs) { f.style.width = (cs.p * 100).toFixed(1) + '%'; $('#lb-pct').textContent = Math.round(cs.p * 100) + '%'; }

    /* stats tick */
    var st = statsFor(s, w), cells = root.querySelectorAll('.lb-stat');
    st.forEach(function (x, i) { setStat(cells[i], x[1]); cells[i].querySelector('em').textContent = x[2]; });

    var noteEl = $('#lb-note', root), note = NOTES[Math.floor(Date.now() / 8000) % NOTES.length];
    if (noteEl.dataset.i !== String(note[0])) { noteEl.dataset.i = note[0]; noteEl.className = 'lb-note ' + note[1]; var p = $('p', noteEl); p.style.animation = 'none'; void p.offsetWidth; p.style.animation = ''; p.textContent = note[0]; }
  }

  /* ===================== CHAT ===================== */
  function mount() {
    if ($('.mc-launch')) return;
    var wa = C.whatsapp ? 'https://wa.me/' + C.whatsapp : null;
    var d = document.createElement('div'); d.className = 'mc';
    d.innerHTML = '<button type="button" class="mc-launch" aria-label="Open chat with MIRELLE concierge" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H11l-4.2 3.6c-.5.4-1.3.1-1.3-.6V16A2.5 2.5 0 0 1 4 13.5v-8Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="9" cy="9.5" r="1" fill="currentColor"/><circle cx="12.5" cy="9.5" r="1" fill="currentColor"/><circle cx="16" cy="9.5" r="1" fill="currentColor"/></svg><i class="mc-dot"></i></button>'
      + '<div class="mc-teaser" hidden>Hi! Need help booking? <button type="button" aria-label="Dismiss">×</button></div>'
      + '<section class="mc-panel" role="dialog" aria-label="MIRELLE concierge chat" hidden><header><div class="mc-av">M</div><div><b>MIRELLE Concierge</b><span><i></i>Virtual assistant · online</span></div><button type="button" class="mc-x" aria-label="Close chat">×</button></header>'
      + '<div class="mc-log" role="log" aria-live="polite"></div>'
      + '<form class="mc-form"><input type="text" placeholder="Ask about services, hours, booking…" aria-label="Your message" autocomplete="off" maxlength="200"><button type="submit" aria-label="Send"><svg viewBox="0 0 17 18" fill="none"><path d="M0.5 9h15M10 3l6 6-6 6" stroke="currentColor" stroke-width="1.5"/></svg></button></form></section>';
    document.body.appendChild(d);
    var launch = $('.mc-launch', d), panel = $('.mc-panel', d), log = $('.mc-log', d), chips = document.createElement('div'), form = $('.mc-form', d), inp = $('input', form), teaser = $('.mc-teaser', d);
    var greeted = false; chips.className = 'mc-chips';

    function add(who, html) { var m = document.createElement('div'); m.className = 'mc-m ' + who; m.innerHTML = html; log.appendChild(m); log.scrollTop = log.scrollHeight; return m; }
    function bot(html, delay) {
      var t = add('bot mc-typing', '<span></span><span></span><span></span>');
      setTimeout(function () { t.className = 'mc-m bot'; t.innerHTML = html; log.scrollTop = log.scrollHeight; wire(t); }, delay || 650);
    }
    function wire(el) {
      [].forEach.call(el.querySelectorAll('[data-act]'), function (b) {
        b.addEventListener('click', function (e) { var a = b.getAttribute('data-act'); if (a === 'book') { e.preventDefault(); openBooking(); } if (a === 'sched') { e.preventDefault(); if (window.MIRELLE_SCHED) window.MIRELLE_SCHED.open(); } });
      });
    }
    function openBooking() { var c = document.querySelector('[data-calendly]'); if (c) c.click(); else location.href = (M.root || '') + 'booking.html'; }
    function setChips(list) {
      if (chips.parentNode) chips.parentNode.removeChild(chips);
      chips.innerHTML = ''; if (!list.length) return;
      list.forEach(function (q) { var b = document.createElement('button'); b.type = 'button'; b.textContent = q; b.addEventListener('click', function () { ask(q); }); chips.appendChild(b); });
      log.appendChild(chips); log.scrollTop = log.scrollHeight;
    }
    var MAIN = ['Book an appointment', 'Services & prices', 'Opening hours', 'Live queue today', 'Talk to a person'];

    function reply(q) {
      var t = q.toLowerCase(), s = build(new Date());
      if (/^(hi|hello|hey|salam|good (morning|afternoon|evening))\b/.test(t)) return 'Hello! I\'m the MIRELLE virtual assistant. I can help with booking, services, hours and today\'s queue.';
      if (/token|queue|wait|serving|live|turn|serial/.test(t)) {
        var w = waitText(s);
        if (w) return 'Now serving <b>' + w.serving + '</b>, next is <b>' + w.next + '</b>. Estimated wait is about <b>' + w.wait + ' min</b>. <a href="#" data-act="sched">See the live schedule</a> or <a href="#" data-act="book">Book now</a>.';
        return 'The studio is closed right now. ' + (s.next ? 'We reopen ' + (s.next.tomorrow ? 'tomorrow' : s.next.day) + ' at <b>' + fmt(s.next.at) + '</b>.' : '') + ' You can still <a href="#" data-act="book">book an appointment</a>.';
      }
      if (/book|appoint|reserve|slot|schedule/.test(t)) return 'I can get you started right away. <a href="#" data-act="book">Open the booking form</a> or visit the <a href="' + (M.root || '') + 'booking.html">booking page</a>. The team confirms every request by email.';
      if (/price|cost|how much|service|menu|treatment|facial|colou?r|cut|bridal|keratin/.test(t)) {
        var sv = (M.services || []).slice(0, 5).map(function (x) { return '<li>' + esc(x.name) + ' <b>from $' + x.from + '</b></li>'; }).join('');
        return 'A few favourites:<ul>' + sv + '</ul><a href="' + (M.root || '') + 'services.html">See every service &amp; price</a>';
      }
      if (/hour|open|close|when|time/.test(t)) return 'Our hours:<ul>' + (C.hours || []).map(function (r) { return '<li>' + esc(r[0]) + ' <b>' + esc(r[1]) + '</b></li>'; }).join('') + '</ul>' + (s.closed || !s.open ? 'We\'re closed right now.' : 'We\'re open now.');
      if (/where|address|location|map|direction|find you/.test(t)) return 'You\'ll find us at <b>' + esc((C.address || []).join(', ')) + '</b>. <a href="https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(C.mapQuery || '') + '" target="_blank" rel="noopener">Open in Maps</a>';
      if (/cancel|reschedule|policy|refund|late/.test(t)) return 'Please give at least <b>24 hours\' notice</b> to change or cancel an appointment. Message us and we\'ll move it for you.';
      if (/person|human|agent|staff|call|phone|whatsapp|email|contact|talk|speak/.test(t)) return 'Of course — our team is happy to help.<ul>' + (wa ? '<li><a href="' + wa + '" target="_blank" rel="noopener">Chat on WhatsApp</a></li>' : '') + (C.phone ? '<li>Call <a href="tel:' + String(C.phone).replace(/[^+\d]/g, '') + '">' + esc(C.phone) + '</a></li>' : '') + (C.email ? '<li><a href="mailto:' + esc(C.email) + '">' + esc(C.email) + '</a></li>' : '') + '</ul>';
      if (/thank|thanks|great|perfect/.test(t)) return 'You\'re very welcome! Anything else I can help with?';
      return 'I\'m a virtual assistant, so I might have missed that. I can help with booking, services &amp; prices, opening hours and today\'s queue, or you can <a href="' + (wa || 'contact.html') + '"' + (wa ? ' target="_blank" rel="noopener"' : '') + '>talk to a person</a>.';
    }
    function ask(q) {
      add('me', esc(q)); setChips([]);
      var norm = q === 'Book an appointment' ? 'book' : q === 'Live queue today' ? 'queue' : q;
      bot(reply(norm), 700); setTimeout(function () { setChips(MAIN); }, 800);
    }
    function open() {
      panel.hidden = false; launch.setAttribute('aria-expanded', 'true'); d.classList.add('is-open'); teaser.hidden = true; try { sessionStorage.setItem('mc_open', '1'); } catch (e) {}
      if (!greeted) { greeted = true; bot('Hi, I\'m the MIRELLE virtual assistant. How can I help today?', 500); setTimeout(function () { setChips(MAIN); }, 600); }
      setTimeout(function () { inp.focus(); }, 60);
    }
    function close() { panel.hidden = true; launch.setAttribute('aria-expanded', 'false'); d.classList.remove('is-open'); try { sessionStorage.removeItem('mc_open'); } catch (e) {} launch.focus(); }
    launch.addEventListener('click', function () { panel.hidden ? open() : close(); });
    $('.mc-x', d).addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) close(); });
    form.addEventListener('submit', function (e) { e.preventDefault(); var v = inp.value.trim(); if (!v) return; inp.value = ''; ask(v); });
    $('.mc-teaser button', d).addEventListener('click', function () { teaser.hidden = true; try { sessionStorage.setItem('mc_t', '1'); } catch (e) {} });
    var seen = false; try { seen = sessionStorage.getItem('mc_t'); if (sessionStorage.getItem('mc_open')) open(); } catch (e) {}
    if (!seen) setTimeout(function () { if (panel.hidden) teaser.hidden = false; }, 6000);
  }

  /* ===================== FLOATING LIVE SCHEDULE ===================== */
  function mountSched() {
    if ($('.ms-launch')) return;
    var host = $('.mc'); if (!host) return;
    var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'ms-launch'; btn.setAttribute('aria-label', 'Open live schedule');
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><rect x="3.5" y="5" width="17" height="15" rx="3" stroke="currentColor" stroke-width="1.6"/><path d="M3.5 10h17M8 3v4M16 3v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="15" r="2.6" stroke="currentColor" stroke-width="1.5"/><path d="M12 13.9v1.2l.8.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg><i class="ms-live"></i><span class="ms-tip">Live schedule</span>';
    host.appendChild(btn);
    var m = document.createElement('div'); m.className = 'ms'; m.hidden = true;
    m.innerHTML = '<div class="ms-bg"></div><section class="ms-card" role="dialog" aria-label="Live schedule"><button type="button" class="ms-x" aria-label="Close">×</button><div class="ms-body"></div></section>';
    document.body.appendChild(m);
    var body = $('.ms-body', m), timer = null;
    function paint() {
      var s = build(new Date()), w = waitText(s), cs = s.slots[s.nowIdx];
      var status = s.closed ? ['closed', 'Closed today'] : s.open ? ['open', 'Open now'] : s.before ? ['soon', 'Opens at ' + fmt(s.hours[0])] : ['closed', 'Closed for today'];
      var reopen = s.before && s.hours ? 'Opens today at ' + fmt(s.hours[0]) : (s.closed || !s.open) && s.next ? 'Reopens ' + (s.next.tomorrow ? 'tomorrow' : s.next.day) + ' at ' + fmt(s.next.at) : '';
      var key = [s.closed, s.open, s.before, w && w.serving, s.slots.map(function (x) { return x.st[0]; }).join('')].join('|');
      if (body.dataset.k !== key) {
        body.dataset.k = key; var h = '<div class="ms-top"><span class="lb-pill is-' + status[0] + '"><i></i><b>' + status[1] + '</b></span><span class="lb-clock"><i class="lb-live-dot"></i><em class="ms-clock"></em></span></div><h3>Live schedule</h3>';
        if (w) h += '<div class="ms-serving"><div><span>Now serving</span><b class="ms-big">' + w.serving + '</b></div><div><span>Next up</span><b>' + w.next + '</b></div><div><span>Est. wait</span><b>~' + w.wait + ' min</b></div></div>' + (cs ? '<div class="ms-now"><div class="lb-nowtop"><span>' + esc(cs.svc) + ' · ' + cs.by + '</span><em id="ms-pct">0%</em></div><div class="lb-bar"><i id="ms-fill"></i></div></div>' : '');
        else h += '<p class="ms-p">' + (s.closed ? 'The studio is closed today. ' : '') + (reopen ? reopen + '.' : '') + '</p>';
        if (!s.closed) {
          var list = s.slots, st = 0; if (s.nowIdx >= 0) st = Math.max(0, s.nowIdx - 1); else if (s.firstUp >= 0) st = s.firstUp; if (s.after) st = Math.max(0, list.length - 5);
          h += '<ul class="lb-list ms-list">';
          list.slice(st, st + 6).forEach(function (x) { h += '<li class="is-' + x.st + '"><time>' + fmt(x.t) + '</time><div><b>' + esc(x.svc) + '</b><span>' + x.who + ' · with ' + x.by + '</span></div><em>' + (x.st === 'done' ? 'Done' : x.st === 'now' ? 'In the chair' : 'Upcoming') + '</em></li>'; });
          h += '</ul>';
        }
        h += '<a href="booking.html" class="btn-black ms-book"><div>Book now</div>' + PLUS + '</a>';
        body.innerHTML = h; body.classList.remove('is-in'); void body.offsetWidth; body.classList.add('is-in');
        $('.ms-book', body).addEventListener('click', function (e) { e.preventDefault(); close(); var b2 = document.querySelector('[data-calendly]'); if (b2) b2.click(); else location.href = (M.root || '') + 'booking.html'; });
      }
      var f = $('#ms-fill', body); if (f && cs) { f.style.width = (cs.p * 100).toFixed(1) + '%'; $('#ms-pct', body).textContent = Math.round(cs.p * 100) + '%'; }
      var ck = $('.ms-clock', body); if (ck) ck.textContent = fmt(s.now.getHours() * 60 + s.now.getMinutes()) + ' · live';
    }
    function open() { body.dataset.k = ''; paint(); m.hidden = false; requestAnimationFrame(function () { m.classList.add('is-open'); }); document.documentElement.style.overflow = 'hidden'; clearInterval(timer); timer = setInterval(paint, 1000); $('.ms-x', m).focus(); }
    function close() { m.classList.remove('is-open'); setTimeout(function () { m.hidden = true; }, 300); document.documentElement.style.overflow = ''; clearInterval(timer); btn.focus(); }
    btn.addEventListener('click', open);
    $('.ms-x', m).addEventListener('click', close); $('.ms-bg', m).addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !m.hidden) close(); });
    window.MIRELLE_SCHED = { open: open, close: close };
  }

  function init() { mount(); mountSched(); renderBoard(); setInterval(renderBoard, 1000); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
