/* Captain Chuck 6 — "The Radar". Progressive enhancement only:
   every word of the record already exists in the HTML above. */
(function () {
  'use strict';
  var svgNS = 'http://www.w3.org/2000/svg';
  var radar = document.getElementById('radar');
  var targets = Array.prototype.slice.call(radar.querySelectorAll('.target'));
  var SWEEP = 6; // seconds, keep in sync with .sweep animation in styles.css

  /* ---- bearing ring: ticks every 10°, labels every 30° ---- */
  var gT = document.getElementById('ticks'), gL = document.getElementById('bearlabels');
  for (var b = 0; b < 360; b += 10) {
    var maj = b % 30 === 0;
    var r1 = maj ? 220 : 227, r2 = 232;
    var s = Math.sin(b * Math.PI / 180), c = Math.cos(b * Math.PI / 180);
    var ln = document.createElementNS(svgNS, 'line');
    ln.setAttribute('x1', 260 + r1 * s); ln.setAttribute('y1', 260 - r1 * c);
    ln.setAttribute('x2', 260 + r2 * s); ln.setAttribute('y2', 260 - r2 * c);
    ln.setAttribute('class', 'tick' + (maj ? ' maj' : ''));
    gT.appendChild(ln);
    if (maj) {
      var t = document.createElementNS(svgNS, 'text');
      t.setAttribute('x', 260 + 207 * s); t.setAttribute('y', 260 - 207 * c + 4);
      t.setAttribute('text-anchor', 'middle'); t.setAttribute('class', 'bearlabel');
      t.textContent = (b === 0 ? '000' : (b < 100 ? '0' : '') + b);
      gL.appendChild(t);
    }
  }

  /* ---- afterglow trails, phased so each fades when the sweep crosses it ---- */
  var trails = document.getElementById('blips');
  targets.forEach(function (el) {
    var st = el.style, brg = parseInt(el.getAttribute('data-brg'), 10);
    var tr = document.createElement('span');
    tr.className = 'trail';
    tr.style.cssText = '--x:' + st.getPropertyValue('--x') + ';--y:' + st.getPropertyValue('--y') +
      ';--d:' + (SWEEP * brg / 360).toFixed(3) + 's';
    tr.setAttribute('aria-hidden', 'true');
    trails.appendChild(tr);
    st.setProperty('--d', tr.style.getPropertyValue('--d')); // sync blip ping to same phase
  });

  /* ---- UTC clock on the status strip ---- */
  var clock = document.getElementById('utclock');
  function tick() {
    var d = new Date();
    clock.textContent = 'UTC ' + d.toISOString().substr(11, 8);
  }
  tick(); setInterval(tick, 1000);

  /* ---- instrument drawer ---- */
  var dw = document.getElementById('drawer'), last = null;
  function open(i) {
    var el = typeof i === 'object' ? i : targets[i];
    dw.querySelector('#drawer-name').textContent = el.getAttribute('data-name');
    dw.querySelector('#drawer-tag').textContent = el.getAttribute('data-tag');
    dw.querySelector('#drawer-brg').textContent = el.getAttribute('data-brg') + '°T';
    dw.querySelector('#drawer-rng').textContent = el.getAttribute('data-rng');
    var more = el.getAttribute('href');
    dw.querySelector('#drawer-more').setAttribute('href', more);
    var art = document.querySelector(more);
    var p = art && art.querySelector('p:not(.svc-meta)');
    dw.querySelector('#drawer-copy').textContent = p ? p.textContent.replace(/\s+/g, ' ').trim() : '';
    targets.forEach(function (t) { t.setAttribute('aria-current', t === el ? 'true' : 'false'); });
    last = el;
    if (!dw.open) dw.showModal(); else dw.querySelector('#drawer-more').focus();
  }
  targets.forEach(function (el) { el.addEventListener('click', function () { open(el); }); });
  Array.prototype.forEach.call(document.querySelectorAll('.ais button'), function (btn) {
    btn.addEventListener('click', function () { open(+btn.getAttribute('data-target')); });
  });
  dw.querySelector('#dwClose').addEventListener('click', function () { dw.close(); });
  dw.addEventListener('close', function () { if (last) last.focus(); });

  /* ---- waypoint cursor: a route plot that tracks scroll ---- */
  var wpc = document.getElementById('wpc'),
      dia = wpc.querySelector('.wpc-dia'), txt = document.getElementById('wpcTxt');
  var marks = [document.querySelector('.hero')].concat(
    Array.prototype.slice.call(document.querySelectorAll('main section')).slice(1));
  function draw() {
    var max = document.documentElement.scrollHeight - innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    var top = 12 + p * 76;
    dia.style.top = txt.style.top = top + '%';
    var mid = scrollY + innerHeight * 0.4, n = 1;
    for (var k = 0; k < marks.length; k++) {
      if (marks[k] && marks[k].offsetTop <= mid) n = k + 1;
    }
    txt.textContent = 'WP0' + Math.min(8, n) + ' · ' + Math.round(p * 100) + '%';
  }
  addEventListener('scroll', draw, { passive: true });
  addEventListener('resize', draw);
  draw();
})();
