// Small progressive enhancements. The site works fully without this file.
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Theme toggle. Light by default; the choice is remembered per browser.
  var btn = document.querySelector('.theme-toggle');
  function setLabel() { var dark = document.documentElement.getAttribute('data-theme') === 'dark'; btn.setAttribute('aria-checked', dark ? 'true' : 'false'); btn.title = dark ? 'Dark mode on' : 'Dark mode off'; }
  if (btn) {
    setLabel();
    btn.addEventListener('click', function () {
      var dark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (dark) document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', 'dark');
      try { localStorage.setItem('theme', dark ? 'light' : 'dark'); } catch (e) {}
      setLabel();
    });
  }

  // Sticky header: show a faint edge once the page has scrolled.
  var header = document.querySelector('header.site');
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 8); }
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  // Reveal on scroll, only for items that start below the fold, so nothing above it waits.
  if (!reduce && 'IntersectionObserver' in window) {
    var items = document.querySelectorAll('ul.tl > li, ul.pubs > li, ul.selected > li, ul.talks > li, h2.year');
    var vh = window.innerHeight;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -5% 0px' });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top > vh) { el.classList.add('reveal'); io.observe(el); }
    });
  }

  // Copy email address instead of opening a mail app; show a brief confirmation.
  document.querySelectorAll('.copy-email').forEach(function (a) {
    var toast = document.createElement('span'); toast.className = 'toast'; toast.textContent = 'Copied!'; a.appendChild(toast);
    a.addEventListener('click', function (e) {
      if (!navigator.clipboard) return; // fall back to the mailto link
      e.preventDefault();
      navigator.clipboard.writeText(a.dataset.email).then(function () {
        a.classList.add('copied'); setTimeout(function () { a.classList.remove('copied'); }, 1400);
      });
    });
  });

  // Topic filters on the papers page.
  var filters = document.querySelectorAll('.filters a[data-topic]');
  filters.forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var topic = a.dataset.topic;
      filters.forEach(function (x) { x.setAttribute('aria-pressed', x === a ? 'true' : 'false'); });
      document.querySelectorAll('ul.pubs > li').forEach(function (li) {
        li.classList.toggle('hide', topic !== 'all' && li.dataset.topics.split(' ').indexOf(topic) < 0);
      });
      document.querySelectorAll('h2.year').forEach(function (h) {
        var list = h.nextElementSibling, any = list && list.querySelector('li:not(.hide)');
        h.classList.toggle('hide', !any);
      });
    });
  });

  // Copy-link button on each paper title; visible on hover.
  document.querySelectorAll('ul.pubs > li[id]').forEach(function (li) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'copy-link'; b.setAttribute('aria-label', 'Copy link to this paper');
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M15 9V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4"/></svg><span class="toast">Copied!</span>';
    b.addEventListener('click', function () {
      if (!navigator.clipboard) return;
      var url = location.origin + location.pathname + '#' + li.id;
      navigator.clipboard.writeText(url).then(function () { b.classList.add('copied'); setTimeout(function () { b.classList.remove('copied'); }, 1400); });
    });
    li.querySelector('.ptitle').appendChild(b);
  });
  // Place each copy button just after the last character of its title, even when the title wraps.
  function placeCopyLinks() {
    document.querySelectorAll('ul.pubs > li .copy-link').forEach(function (b) {
      var box = b.parentNode, last = box.querySelector('.caret') || box.querySelector('a');
      var rects = last.getClientRects(); if (!rects.length) return;
      var r = rects[rects.length - 1], p = box.getBoundingClientRect();
      b.style.left = (r.right - p.left + 6) + 'px';
      b.style.top = (r.top - p.top + (r.height - b.offsetHeight) / 2) + 'px';
    });
  }
  placeCopyLinks(); window.addEventListener('resize', placeCopyLinks);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeCopyLinks);

  // Paper anchors: jump to the entry and flash it.
  function flashHash() {
    var id = location.hash.slice(1); if (!id) return;
    var el = document.getElementById(id); if (!el || !el.matches('ul.pubs > li')) return;
    el.classList.remove('reveal'); el.classList.add('in');
    el.scrollIntoView({ block: 'start' });
    el.classList.add('flash'); void el.offsetWidth;
    setTimeout(function () { el.classList.remove('flash'); }, 60);
  }
  window.addEventListener('hashchange', flashHash); if (location.hash) setTimeout(flashHash, 50);

  // Timeline durations from the data attributes on each date line.
  document.querySelectorAll('.dates[data-start]').forEach(function (el) {
    var s = el.dataset.start.split('-'), e = el.dataset.end;
    var now = new Date(), ey, em;
    if (e === 'present') { ey = now.getFullYear(); em = now.getMonth() + 1; } else { ey = +e.split('-')[0]; em = +e.split('-')[1]; }
    var months = (ey - s[0]) * 12 + (em - s[1]);
    if (months < 1) return;
    var y = Math.floor(months / 12), m = months % 12, parts = [];
    if (y) parts.push(y + (y === 1 ? ' yr' : ' yrs')); if (m) parts.push(m + ' mo');
    if (el.closest('.sub')) return; // top-level entries only
    var span = document.createElement('span'); span.className = 'dur'; span.textContent = '(' + parts.join(' ') + ')'; el.appendChild(span);
  });

  // Reading progress hairline on the papers page.
  if (document.querySelector('main.papers')) {
    var bar = document.createElement('div'); bar.className = 'progress'; document.body.appendChild(bar);
    function prog() {
      var h = document.documentElement, max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    }
    prog(); window.addEventListener('scroll', prog, { passive: true }); window.addEventListener('resize', prog);
  }

  // "Last updated" on the timeline: use the latest commit month if the GitHub API answers.
  var lus = document.querySelectorAll('.last-updated');
  if (lus.length && window.fetch) {
    fetch('https://api.github.com/repos/JerryWeiAI/jerryweiai.github.io/commits?per_page=1')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (!j || !j[0]) return;
        var d = new Date(j[0].commit.committer.date);
        var s = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        lus.forEach(function (el) { el.textContent = s; });
      }).catch(function () {});
  }
})();
