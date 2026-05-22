import { randomBytes } from "node:crypto";

const config = useRuntimeConfig();

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Forza Horizon 5. Override with ?appid= to show another game's screenshots.
const DEFAULT_APPID = "1551360";

// Steam returns 50 screenshots per grid page.
const PAGE_SIZE = 50;

// Friendly names for the appids we care about; falls back to "Steam".
const GAME_NAMES: Record<string, string> = {
  "1551360": "Forza Horizon 5",
};

// Steam serves an empty grid for pages > 1 unless a sessionid cookie is present.
// Any value works for anonymous browsing, so we generate one per process.
const sessionId = randomBytes(12).toString("hex");
const steamCookie = `sessionid=${sessionId}; steamCountry=US`;

// Lists a page of screenshots from the grid only. This is a single, cheap
// request: it returns the published id, aspect ratio and a low-res preview for
// each shot so the gallery can paint instantly. The crisp thumbnail and the
// full-resolution image are resolved lazily (per shot) via /api/steam/screenshot
// to stay well under Steam's rate limit.
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
  const appid = (query.appid as string) || DEFAULT_APPID;

  const gridUrl =
    `https://steamcommunity.com/profiles/${steamId}/screenshots/` +
    `?appid=${appid}&sort=newestfirst&view=grid&browsefilter=myfiles&privacy=30&p=${page}`;

  let html: string;
  try {
    html = await $fetch<string>(gridUrl, {
      headers: { "User-Agent": UA, Cookie: steamCookie },
    });
  } catch {
    throw createError({
      statusCode: 502,
      statusMessage: "Failed to reach Steam Community.",
    });
  }

  // Total count, e.g. "Showing 1 - 50 of 213".
  const totalMatch = html.match(
    /Showing\s+[\d,]+\s*-\s*[\d,]+\s+of\s+([\d,]+)/i,
  );
  const total = totalMatch ? parseInt(totalMatch[1].replace(/,/g, ""), 10) : 0;

  // Each screenshot anchor exposes its aspect ratio and published id, followed
  // by a div whose background-image is the low-res grid preview.
  const itemRe =
    /data-desired-aspect="([0-9.]+)"\s*data-appid="\d+"\s*data-publishedfileid="(\d+)">\s*<div style="background-image:\s*url\((?:&#39;|')(https:\/\/images\.steamusercontent\.com\/ugc\/\d+\/[A-Fa-f0-9]+\/)/g;

  const screenshots: SteamScreenshot[] = [];
  const seen = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = itemRe.exec(html)) !== null) {
    const id = m[2];
    if (seen.has(id)) continue;
    seen.add(id);

    screenshots.push({
      id,
      appid,
      game_name: GAME_NAMES[appid] || "Steam",
      aspect_ratio: parseFloat(m[1]) || 16 / 9,
      preview_url: m[3], // low-res preview, paints immediately
      url: `https://steamcommunity.com/sharedfiles/filedetails/?id=${id}`,
    });
  }

  return {
    screenshots,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total,
      hasNext: page * PAGE_SIZE < total,
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
    const appid = (q.appid as string) || "1551360";
    const page = Math.max(1, parseInt(q.page as string) || 1);
    return `${appid}-${page}`;
  },
});
