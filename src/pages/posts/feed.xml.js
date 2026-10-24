import { getPosts } from '../../lib/posts';
import { SITE, PROFILE } from '../../lib/site';

const esc = (s = '') => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function GET() {
  const items = getPosts().map((p) => `
    <item>
      <title>${esc(p.title)}</title>
      <link>${SITE}/posts/${p.slug}</link>
      <guid>${SITE}/posts/${p.slug}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description>${esc(p.desc)}</description>
      ${p.tags.map((t) => `<category>${esc(t)}</category>`).join('')}
    </item>`).join('');

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${PROFILE.name} | Posts</title>
    <link>${SITE}/posts</link>
    <atom:link href="${SITE}/posts/feed.xml" rel="self" type="application/rss+xml" />
    <description>Notes on Go, databases and infrastructure.</description>
    <language>en</language>${items}
  </channel>
</rss>`, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
