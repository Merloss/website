import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import type { H3Event } from "h3";
import type { Readable } from "node:stream";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const config = useRuntimeConfig();

export const SIZES = { thumb: 600, og: 1200, full: 5000 } as const;
export type SteamImageSize = keyof typeof SIZES;

export const isSteamImageSize = (v: unknown): v is SteamImageSize =>
  typeof v === "string" && v in SIZES;

// --- R2 client (lazy; a missing config simply disables R2) -----------------
let _r2: S3Client | null | undefined;
function r2(): S3Client | null {
  if (_r2 !== undefined) return _r2;
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = config;
  _r2 =
    R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY
      ? new S3Client({
          region: "auto",
          endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
          credentials: {
            accessKeyId: R2_ACCESS_KEY_ID,
            secretAccessKey: R2_SECRET_ACCESS_KEY,
          },
        })
      : null;
  return _r2;
}

// R2 object keys (same bucket as site images, kept under their own prefixes).
const imageKey = (id: string, size: SteamImageSize) =>
  size === "full" ? `steam/${id}.jpg` : `steam/${id}_${size}.jpg`;
const baseCacheKey = (id: string) => `steam-cache/base/${id}`;

// --- R2 image get/put ------------------------------------------------------
async function r2GetImage(key: string): Promise<Buffer | null> {
  const client = r2();
  if (!client) return null;
  try {
    const res = await client.send(
      new GetObjectCommand({ Bucket: config.R2_BUCKET_NAME, Key: key })
    );
    if (!res.Body) return null;
    const stream = res.Body as Readable;
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    return Buffer.concat(chunks);
  } catch {
    return null; // NoSuchKey (cache miss) or a transient R2 error
  }
}

async function r2PutImage(key: string, body: Buffer): Promise<void> {
  const client = r2();
  if (!client) return;
  try {
    await client.send(
      new PutObjectCommand({
        Bucket: config.R2_BUCKET_NAME,
        Key: key,
        Body: body,
        ContentType: "image/jpeg",
        // Stored permanently — no expiry. The image never changes.
      })
    );
  } catch {
    // A failed write must not break serving; a later request can retry it.
  }
}

// --- Base CDN url cache (tiny text in R2) ----------------------------------
// Resolving a screenshot's full-res CDN url means scraping its details page,
// which is the rate-limited step. We remember that url (id → base) so it's only
// scraped once, ever — across instances and restarts.
const memBase = new Map<string, string>();

async function getCachedBase(id: string): Promise<string | null> {
  const mem = memBase.get(id);
  if (mem) return mem;
  const client = r2();
  if (!client) return null;
  try {
    const res = await client.send(
      new GetObjectCommand({ Bucket: config.R2_BUCKET_NAME, Key: baseCacheKey(id) })
    );
    const base = (await res.Body?.transformToString())?.trim();
    if (base) {
      memBase.set(id, base);
      return base;
    }
  } catch {
    // miss
  }
  return null;
}

async function setCachedBase(id: string, base: string): Promise<void> {
  memBase.set(id, base);
  const client = r2();
  if (!client) return;
  try {
    await client.send(
      new PutObjectCommand({
        Bucket: config.R2_BUCKET_NAME,
        Key: baseCacheKey(id),
        Body: base,
        ContentType: "text/plain",
      })
    );
  } catch {}
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// --- Gentle global pacing for details-page scrapes (avoids Steam 429) -------
const MAX_CONCURRENT = 2;
const MIN_GAP_MS = 500;
let active = 0;
let nextStart = 0;
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

async function pace() {
  const now = Date.now();
  const wait = Math.max(0, nextStart - now);
  nextStart = Math.max(now, nextStart) + MIN_GAP_MS;
  if (wait > 0) await sleep(wait);
}

async function fetchFullBase(id: string): Promise<string | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
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
      if (status === 429 && attempt < 2) {
        await sleep(900 * (attempt + 1) + Math.random() * 500);
        continue;
      }
      return null;
    }
  }
  return null;
}

const inflight = new Map<string, Promise<string | null>>();

async function resolveBase(id: string): Promise<string | null> {
  const cached = await getCachedBase(id);
  if (cached) return cached;

  const existing = inflight.get(id);
  if (existing) return existing;

  const task = (async () => {
    await acquire();
    try {
      await pace();
      const fresh = await getCachedBase(id); // may have resolved while queued
      if (fresh) return fresh;
      const base = await fetchFullBase(id);
      if (base) await setCachedBase(id, base);
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

// --- Download the actual image bytes from Steam's CDN ----------------------
async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const buf = await $fetch<ArrayBuffer>(url, {
      responseType: "arrayBuffer",
      headers: { "User-Agent": UA },
    });
    return Buffer.from(buf);
  } catch {
    return null;
  }
}

// Steam only honours a resize when impolicy=Letterbox is present;
// letterbox=false keeps the natural aspect ratio (no black bars).
const sizedUrl = (base: string, w: number) =>
  `${base}?imw=${w}&imh=${w}&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false`;

// Single-flight per (id, size) so a burst of identical requests triggers only
// one Steam download + R2 upload.
const migrating = new Map<string, Promise<Buffer | null>>();

async function getImage(id: string, size: SteamImageSize): Promise<Buffer | null> {
  const key = imageKey(id, size);

  // 1. Already in R2 → serve it. Steady state is zero Steam traffic.
  const stored = await r2GetImage(key);
  if (stored) return stored;

  // 2. First time at this size → pull from Steam, store in R2 permanently, then
  //    serve. New screenshots are migrated this way the first time they're seen.
  const flightKey = `${id}:${size}`;
  let task = migrating.get(flightKey);
  if (!task) {
    task = (async () => {
      const base = await resolveBase(id);
      if (!base) return null;
      const img = await downloadImage(sizedUrl(base, SIZES[size]));
      if (img) await r2PutImage(key, img);
      return img;
    })();
    migrating.set(flightKey, task);
    task.finally(() => migrating.delete(flightKey));
  }
  return task;
}

export async function serveSteamImage(
  event: H3Event,
  id: string,
  size: SteamImageSize
) {
  if (!/^\d+$/.test(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Valid screenshot id is required.",
    });
  }

  const bytes = await getImage(id, size);
  if (!bytes) {
    throw createError({
      statusCode: 502,
      statusMessage: "Could not fetch screenshot from Steam.",
    });
  }

  setHeader(event, "Content-Type", "image/jpeg");
  // The image is immutable, so let the browser cache it for a long time.
  setHeader(event, "Cache-Control", "public, max-age=31536000, immutable");
  setHeader(event, "Content-Length", bytes.length);
  return bytes;
}
