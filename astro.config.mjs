import { execFileSync } from 'node:child_process';
import vercel from '@astrojs/vercel';
import { defineConfig } from 'astro/config';

const commit = (() => {
  const env = process.env.VERCEL_GIT_COMMIT_SHA || process.env.SOURCE_COMMIT;
  if (env) return env;
  try { return execFileSync('git', ['rev-parse', 'HEAD']).toString().trim(); } catch { return ''; }
})();

export default defineConfig({
  site: 'https://kerim.im',
  adapter: vercel({ isr: { expiration: 3600 } }),
  prefetch: { prefetchAll: true },
  build: { inlineStylesheets: 'always' },
  // keep scripts external so the CSP needs no 'unsafe-inline' for script-src
  vite: { define: { 'import.meta.env.COMMIT': JSON.stringify(commit) }, build: { assetsInlineLimit: 0 } },
});
