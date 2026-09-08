// Small progressive enhancements. The site works fully without this file.
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    var toast = document.createElement('span'); toast.className = 'toast'; toast.textContent = 'Copied'; a.appendChild(toast);
    a.addEventListener('click', function (e) {
      if (!navigator.clipboard) return; // fall back to the mailto link
      e.preventDefault();
      navigator.clipboard.writeText(a.dataset.email).then(function () {
        a.classList.add('copied'); setTimeout(function () { a.classList.remove('copied'); }, 1400);
      });
    });
  });

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
    var span = document.createElement('span'); span.className = 'dur'; span.textContent = ' \u00b7 ' + parts.join(' '); el.appendChild(span);
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

  // Cursor-following accent inside the header.
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    var dot = document.createElement('div'); dot.className = 'cursor-dot'; header.style.position = 'sticky'; header.appendChild(dot);
    header.addEventListener('mousemove', function (e) {
      var r = header.getBoundingClientRect(); dot.style.left = (e.clientX - r.left) + 'px'; dot.style.top = (e.clientY - r.top) + 'px';
    });
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
