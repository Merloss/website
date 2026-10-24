import { HOST } from '../lib/site';

const SOURCE = HOST;

const tag = (e) => {
  const a = e.target.closest?.('a[href^="http"]');
  if (!a) return;
  const url = new URL(a.href);
  if (url.host === location.host || url.searchParams.has('utm_source')) return;
  url.searchParams.set('utm_source', SOURCE);
  a.href = url.toString();
};
document.addEventListener('pointerdown', tag, true);
document.addEventListener('focusin', tag, true);
