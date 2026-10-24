import { getPosts } from '../lib/posts';
import { SITE } from '../lib/site';

export function GET() {
  const posts = getPosts();
  const urls = [
    { url: SITE, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE}/posts`, lastModified: posts[0]?.date, changeFrequency: 'weekly', priority: 0.8 },
    ...posts.map((p) => ({ url: `${SITE}/posts/${p.slug}`, lastModified: p.date, changeFrequency: 'monthly', priority: 0.6 })),
  ];
  const body = urls.map((u) => `<url>
<loc>${u.url}</loc>${u.lastModified ? `
<lastmod>${new Date(u.lastModified).toISOString()}</lastmod>` : ''}
<changefreq>${u.changeFrequency}</changefreq>
<priority>${u.priority}</priority>
</url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`, { headers: { 'Content-Type': 'application/xml' } });
}
