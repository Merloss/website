import { randomBytes } from "node:crypto";

const config = useRuntimeConfig();

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Friendly names for the appids we care about; falls back to "Steam".
const GAME_NAMES: Record<string, string> = {
  "1551360": "Forza Horizon 5",
  "2483190": "Forza Horizon 6",
};

// The gallery is Forza-only. We read the profile's *all-games* feed (so a newly
// added Forza title shows up automatically, newest-first across games) and keep
// just these appids — anything else the user screenshots is hidden.
const FORZA_APPIDS = new Set(Object.keys(GAME_NAMES));

// Steam returns 50 screenshots per grid page.
const PAGE_SIZE = 50;

// Steam serves an empty grid for pages > 1 unless a sessionid cookie is present.
// Any value works for anonymous browsing, so we generate one per process.
const sessionId = randomBytes(12).toString("hex");
const steamCookie = `sessionid=${sessionId}; steamCountry=US`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// A grid URL for one game (appid) or, when appid is omitted, every game.
const gridUrl = (steamId: string, page: number, appid?: string) =>
  `https://steamcommunity.com/profiles/${steamId}/screenshots/` +
  `?${appid ? `appid=${appid}&` : ""}sort=newestfirst&view=grid` +
  `&browsefilter=myfiles&privacy=30&p=${page}`;

const TOTAL_RE = /Showing\s+[\d,]+\s*-\s*[\d,]+\s+of\s+([\d,]+)/i;

// Total count, e.g. "Showing 1 - 50 of 213". 0 when the page lists nothing.
function parseTotal(html: string): number {
  const m = html.match(TOTAL_RE);
  return m ? parseInt(m[1].replace(/,/g, ""), 10) : 0;
}

// Steam rate-limits bursts with HTTP 429. Retry the grid fetch a few times with
// a jittered backoff so a single throttled request doesn't bubble up as a
// (cacheable) failure.
async function fetchGrid(url: string): Promise<string> {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return await $fetch<string>(url, {
        headers: { "User-Agent": UA, Cookie: steamCookie },
      });
    } catch (err: any) {
      const status = err?.response?.status ?? err?.statusCode;
      if (status === 429 && attempt < 3) {
        await sleep(700 * (attempt + 1) + Math.random() * 400);
        continue;
      }
      break;
    }
  }
  throw createError({
    statusCode: 502,
    statusMessage: "Failed to reach Steam Community.",
  });
}

// The displayed "N shots" must be the Forza-only count, but the all-games feed's
// own total includes other games. So we sum each Forza title's own total. It
// changes rarely, so a short-lived module cache keeps this to ~one extra request
// per game per few minutes (shared across every paged request). A game with no
// screenshots yet (e.g. FH6 before launch day) simply contributes 0.
let totalCache: { value: number; at: number } | null = null;
const TOTAL_TTL = 5 * 60 * 1000;

async function forzaTotal(steamId: string): Promise<number> {
  if (totalCache && Date.now() - totalCache.at < TOTAL_TTL) {
    return totalCache.value;
  }
  let sum = 0;
  for (const appid of FORZA_APPIDS) {
    try {
      sum += parseTotal(await fetchGrid(gridUrl(steamId, 1, appid)));
    } catch {
      // A throttled/failed per-game count just contributes 0 this round; the
      // next refresh corrects it. Never let it break the listing.
    }
  }
  totalCache = { value: sum, at: Date.now() };
  return sum;
}

// Each screenshot anchor exposes its aspect ratio, owning appid and published
// id, followed by a div whose background-image is the low-res grid preview.
const ITEM_RE =
  /data-desired-aspect="([0-9.]+)"\s*data-appid="(\d+)"\s*data-publishedfileid="(\d+)">\s*<div style="background-image:\s*url\((?:&#39;|')(https:\/\/images\.steamusercontent\.com\/ugc\/\d+\/[A-Fa-f0-9]+\/)/g;

// Lists a page of screenshots from the grid only. This is a single, cheap
// request: it returns the published id, aspect ratio and a low-res preview for
// each shot so the gallery can paint instantly. The crisp thumbnail and the
// full-resolution image are served lazily (per shot) from R2 via
// /api/steam/image, which migrates each one from Steam on first view.
export default defineCachedEventHandler(async (event) => {
  const steamId = config.STEAM_ID;
  if (!steamId) {
    throw createError({
      statusCode: 500,
      statusMessage: "STEAM_ID is not configured in environment variables.",
    });
  }

  const query = getQuery(event);
  const page = Math.max(1, parseInt(query.page as string) || 1);
  // Default: the all-games feed filtered to Forza. `?appid=` pins one game.
  const onlyAppid = (query.appid as string) || undefined;

  const html = await fetchGrid(gridUrl(steamId, page, onlyAppid));

  // Total reported by the fetched feed. For the all-games feed this counts every
  // game, which is exactly what paging needs (it tells us how many pages to walk
  // so no Forza shot is missed). The *displayed* count is corrected below.
  const feedTotal = parseTotal(html);

  const screenshots: SteamScreenshot[] = [];
  const seen = new Set<string>();
  let rawCount = 0; // items parsed before the Forza filter
  let m: RegExpExecArray | null;
  ITEM_RE.lastIndex = 0;
  while ((m = ITEM_RE.exec(html)) !== null) {
    rawCount++;
    const appid = m[2];
    const id = m[3];
    if (seen.has(id)) continue;
    // On the all-games feed, keep only Forza titles. A pinned ?appid= request is
    // already single-game, so nothing to filter.
    if (!onlyAppid && !FORZA_APPIDS.has(appid)) continue;
    seen.add(id);

    screenshots.push({
      id,
      appid,
      game_name: GAME_NAMES[appid] || "Steam",
      aspect_ratio: parseFloat(m[1]) || 16 / 9,
      preview_url: m[4], // low-res preview, paints immediately
      url: `https://steamcommunity.com/sharedfiles/filedetails/?id=${id}`,
    });
  }

  // An empty parse almost never means "this profile has no screenshots" — it
  // means Steam threw a throttle/login/interstitial page at us. We check the
  // *raw* count (before the Forza filter) so a page that genuinely has no Forza
  // shots doesn't masquerade as an error. Throwing here is deliberate:
  // defineCachedEventHandler only caches *resolved* values, so a thrown error is
  // never stored and never clobbers a good cached page during a background SWR
  // revalidation. The client retries.
  if (rawCount === 0) {
    throw createError({
      statusCode: 502,
      statusMessage: "Steam returned no screenshots (likely rate-limited).",
    });
  }

  // Paging walks the fetched feed (all-games when not pinned); the displayed
  // total is the Forza-only count so "N shots" matches what's on screen.
  const displayTotal = onlyAppid ? feedTotal : await forzaTotal(steamId);

  return {
    screenshots,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total: displayTotal,
      hasNext: page * PAGE_SIZE < feedTotal,
    },
  };
}, {
  // Stale-while-revalidate: every visit is served instantly from cache (no
  // per-request scrape), and after maxAge the listing is refreshed in the
  // background — so newly added screenshots show up automatically, with no
  // restart and no manual refresh.
  maxAge: 60 * 5, // background-refresh window: new screenshots appear within ~5 min
  swr: true,
  staleMaxAge: -1, // always serve cache while it revalidates in the background
  name: "steam-grid",
  shouldBypassCache: (event) => Boolean(getQuery(event).refresh),
  getKey: (event) => {
    const q = getQuery(event);
    const appid = (q.appid as string) || "forza"; // default = all-Forza feed
    const page = Math.max(1, parseInt(q.page as string) || 1);
    return `${appid}-${page}`;
  },
});
