const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// A published screenshot's full-resolution image never changes, so cache the
// resolved CDN base URL per id for the lifetime of the server process. Each
// screenshot is therefore only ever fetched from Steam once.
const fullBaseCache = new Map<string, string>();

// De-duplicate concurrent requests for the same id (single-flight).
const inflight = new Map<string, Promise<string | null>>();

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Global limiter: never hit Steam with more than this many details-page
// requests at once, no matter how many clients are scrolling. Steam
// rate-limits bursts with HTTP 429, so we keep the pressure low and queue
// the rest. Combined with the cache, the steady-state load is tiny.
const MAX_CONCURRENT = 3;
let active = 0;
const waitQueue: Array<() => void> = [];

function acquire(): Promise<void> {
  return new Promise((resolve) => {
    const run = () => {
      if (active < MAX_CONCURRENT) {
        active++;
        resolve();
      } else {
        waitQueue.push(run);
      }
    };
    run();
  });
}

function release() {
  active = Math.max(0, active - 1);
  waitQueue.shift()?.();
}

// Fetch a screenshot's full-resolution CDN base from its details page.
// The grid only exposes a ~200px preview on a *different* UGC object, so the
// details page is the only reliable source of the original image. Retries with
// a jittered backoff on HTTP 429.
async function fetchFullBase(id: string): Promise<string | null> {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const html = await $fetch<string>(
        `https://steamcommunity.com/sharedfiles/filedetails/?id=${id}`,
        { headers: { "User-Agent": UA } }
      );

      // The full image is the <img id="ActualMedia">. Strip the query string to
      // get the bare CDN base we can re-size ourselves.
      const match = html.match(/id="ActualMedia"[^>]*\bsrc="([^"?]+)/i);
      return match ? match[1] : null; // no media → don't retry
    } catch (err: any) {
      const status = err?.response?.status ?? err?.statusCode;
      if (status === 429 && attempt < 4) {
        await sleep(800 * (attempt + 1) + Math.random() * 500);
        continue;
      }
      return null;
    }
  }
  return null;
}

async function resolveFullBase(id: string): Promise<string | null> {
  const cached = fullBaseCache.get(id);
  if (cached) return cached;

  const existing = inflight.get(id);
  if (existing) return existing;

  const task = (async () => {
    await acquire();
    try {
      const base = await fetchFullBase(id);
      if (base) fullBaseCache.set(id, base);
      return base;
    } finally {
      release();
    }
  })();

  inflight.set(id, task);
  try {
    return await task;
  } finally {
    inflight.delete(id);
  }
}

export default defineCachedEventHandler(async (event) => {
  const id = getQuery(event).id as string;
  if (!id || !/^\d+$/.test(id)) {
    throw createError({ statusCode: 400, statusMessage: "Valid screenshot id is required." });
  }

  const base = await resolveFullBase(id);
  if (!base) {
    throw createError({
      statusCode: 502,
      statusMessage: "Could not resolve screenshot from Steam.",
    });
  }

  // Allow the browser/CDN to cache this immutable mapping for a long time.
  setHeader(event, "Cache-Control", "public, max-age=86400");

  // Steam only honours a resize when impolicy=Letterbox is present;
  // letterbox=false keeps the natural aspect ratio (no black bars).
  const sized = (w: number) =>
    `${base}?imw=${w}&imh=${w}&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false`;

  return {
    id,
    // Lightweight grid thumbnail (~25 KB): fits within 600px, natural aspect.
    thumbnail_url: sized(600),
    // Original full quality (up to 5000px).
    full_image_url: sized(5000),
  };
}, {
  // A screenshot's id → full-resolution mapping is immutable, so cache it
  // permanently. This is what stops Steam being re-scraped on every visit.
  maxAge: 60 * 60 * 24 * 365, // effectively permanent
  name: "steam-shot",
  getKey: (event) => (getQuery(event).id as string) || "invalid",
});
