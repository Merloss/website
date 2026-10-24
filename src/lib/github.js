import { PROFILE } from './site';

const USER = PROFILE.github;
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const LANG = { Go: '#00add8', Vue: '#41b883', JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572a5', HCL: '#844fba', Shell: '#89e051', Rust: '#dea584' };

const FALLBACK_REPOS = [
  { name: 'website', html_url: `https://github.com/${USER}/website`, description: 'A website made with NuxtJS & TailwindCSS', language: 'Vue', stargazers_count: 29, forks_count: 1 },
  { name: 'go-api', html_url: `https://github.com/${USER}/go-api`, description: 'Security-focused system that combines role-based authentication, CRUD operations and user management.', language: 'Go', stargazers_count: 2, forks_count: 1 },
];

const getJSON = (url, headers) =>
  fetch(url, { headers })
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);

export async function getGitHub() {
  const auth = process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : undefined;
  const [contrib, all, repos] = await Promise.all([
    getJSON(`https://github-contributions-api.jogruber.de/v4/${USER}?y=last`),
    getJSON(`https://github-contributions-api.jogruber.de/v4/${USER}?y=all`),
    getJSON(`https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`, auth),
  ]);

  const list = Array.isArray(repos)
    ? repos
        .filter((r) => !r.fork && !r.archived && r.language)
        .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.pushed_at) - new Date(a.pushed_at))
        .slice(0, 4)
    : [];

  const days = Array.isArray(contrib?.contributions) && contrib.contributions.length ? contrib.contributions : null;
  const total = Number(Object.values(contrib?.total ?? {})[0]);

  const ok = days && Number.isFinite(total);
  const allTime = Object.values(all?.total ?? {}).reduce((sum, n) => sum + Number(n), 0);

  return {
    days: ok ? days : null,
    total: ok ? total : null,
    allTime: Number.isFinite(allTime) && allTime > 0 ? allTime : null,
    repos: list.length ? list : FALLBACK_REPOS,
  };
}

export const ago = (iso) => {
  const days = Math.round((Date.now() - new Date(iso)) / 864e5);
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (days < 30) return rtf.format(-days, 'day');
  if (days < 365) return rtf.format(-Math.round(days / 30), 'month');
  return rtf.format(-Math.round(days / 365), 'year');
};
