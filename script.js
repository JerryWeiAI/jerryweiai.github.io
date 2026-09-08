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

  // "Last updated" on the timeline: use the latest commit month if the GitHub API answers.
  var lu = document.getElementById('last-updated');
  if (lu && window.fetch) {
    fetch('https://api.github.com/repos/JerryWeiAI/jerryweiai.github.io/commits?per_page=1')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (!j || !j[0]) return;
        var d = new Date(j[0].commit.committer.date);
        lu.textContent = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }).catch(function () {});
  }
})();
