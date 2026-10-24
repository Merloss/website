import { SITE } from '../lib/site';

export const GET = () => new Response(`User-Agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
