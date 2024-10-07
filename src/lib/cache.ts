"use client";
import { Mutex } from "async-mutex";

type CacheEntry = { expiresAt: number; fetchMutex: Mutex; value: unknown };
const Cache: Record<string, CacheEntry> = {};

export async function cachedAsyncFetch<T>(
  key: string,
  ttlMs: number,
  fetchCallback: () => Promise<T>,
  ignoreCache?: boolean
): Promise<T> {
  if (typeof ignoreCache === "boolean" && ignoreCache) {
    return await fetchCallback();
  }

  if (
    typeof Cache[key]?.expiresAt === "number" &&
    Cache[key].expiresAt > Date.now()
  ) {
    return Cache[key].value as T;
  } else if (typeof Cache[key]?.expiresAt === "number") {
    await Cache[key].fetchMutex.runExclusive(async () => {
      if (Cache[key] !== undefined) {
        Cache[key].value = await fetchCallback();
      }
    });
  } else {
    Cache[key] = {
      expiresAt: Date.now() + ttlMs,
      value: await fetchCallback(),
      fetchMutex: new Mutex(),
    };
  }

  return Cache[key].value as T;
}
