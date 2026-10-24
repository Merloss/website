import { PROFILE } from './site';

const FILES = import.meta.glob('/posts/*.md', { query: '?raw', import: 'default', eager: true });

const parse = ([file, src]) => {
  const [, head, body] = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  const meta = {};
  for (const line of head.split(/\r?\n/)) {
    const i = line.indexOf(':');
    const v = line.slice(i + 1).trim();
    meta[line.slice(0, i).trim()] = v.startsWith('[') ? v.slice(1, -1).split(',').map((s) => s.trim()) : v.replace(/^"|"$/g, '');
  }
  return {
    slug: file.slice('/posts/'.length, -'.md'.length),
    title: meta.title,
    desc: meta.short_description,
    tags: meta.tags || [],
    date: meta.published_at,
    minutes: Math.max(1, Math.round(body.split(/\s+/).length / 200)),
    body,
  };
};

export const getPosts = () => Object.entries(FILES).map(parse).sort((a, b) => new Date(b.date) - new Date(a.date));

export const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: PROFILE.timeZone });
