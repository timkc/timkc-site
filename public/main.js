/* ── Mobile nav ─────────────────────────────────────────── */
const toggle = document.querySelector('.nav__toggle');
const navLinks = document.querySelector('.nav__links');

toggle.addEventListener('click', () => {
  const expanded = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!expanded));
  navLinks.classList.toggle('open', !expanded);
});

navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  });
});

/* ── Active nav link on scroll ──────────────────────────── */
const sections = Array.from(document.querySelectorAll('section[id]'));
const navAnchors = Array.from(document.querySelectorAll('.nav__links a'));

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => sectionObserver.observe(s));

/* ── Scroll-reveal ──────────────────────────────────────── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.08 });

document.querySelectorAll('.fade').forEach(el => revealObserver.observe(el));

/* ── GitHub repos ───────────────────────────────────────── */
const GITHUB_USER = 'timkc';
const reposGrid = document.getElementById('repos-grid');

const LANG_COLORS = {
  JavaScript: '#f7df1e', TypeScript: '#3178c6', Python: '#3572a5',
  HTML: '#e34c26', CSS: '#563d7c', Java: '#b07219', C: '#555555',
  'C++': '#f34b7d', Go: '#00add8', Rust: '#dea584', Shell: '#89e051',
};

function langDot(lang) {
  const color = LANG_COLORS[lang] || '#94a3b8';
  return `<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
    <circle cx="5" cy="5" r="5" fill="${color}"/>
  </svg>`;
}

function repoCard(r) {
  const desc = r.description ? r.description : '<em>No description</em>';
  const lang = r.language ? `
    <span class="repo__lang">${langDot(r.language)} ${r.language}</span>` : '';
  return `
    <article class="card fade visible">
      <div class="card__header">
        <h3 class="card__title"><a href="${r.html_url}" target="_blank" rel="noopener noreferrer">${r.name}</a></h3>
        ${lang}
      </div>
      <p class="card__desc">${desc}</p>
      <div class="repo__meta">
        <span title="Stars">&#9733; ${r.stargazers_count}</span>
        ${r.forks_count > 0 ? `<span title="Forks">&#9414; ${r.forks_count}</span>` : ''}
      </div>
    </article>`;
}

(async function loadRepos() {
  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=12`
    );
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const repos = await res.json();

    reposGrid.removeAttribute('aria-busy');

    if (!Array.isArray(repos) || repos.length === 0) {
      reposGrid.innerHTML = `<p class="repos__status">No public repositories yet.</p>`;
      return;
    }

    reposGrid.innerHTML = repos.map(repoCard).join('');
  } catch {
    reposGrid.removeAttribute('aria-busy');
    reposGrid.innerHTML = `
      <p class="repos__status">
        Could not load repositories.
        <a href="https://github.com/${GITHUB_USER}" target="_blank" rel="noopener noreferrer">View on GitHub &rarr;</a>
      </p>`;
  }
})();
