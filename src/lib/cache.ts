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
  if (ignoreCache) {
    return await fetchCallback();
  }

  const cacheEntry = Cache[key];

  if (cacheEntry?.expiresAt && cacheEntry.expiresAt > Date.now()) {
    return cacheEntry.value as T;
  } else if (cacheEntry?.expiresAt) {
    await cacheEntry.fetchMutex.runExclusive(async () => {
      if (Cache[key]) {
        Cache[key]!.value = await fetchCallback();
      }
    });
  } else {
    const fetchMutex = new Mutex();
    Cache[key] = {
      expiresAt: Date.now() + ttlMs,
      value: await fetchCallback(),
      fetchMutex,
    };
  }

  return Cache[key]?.value as T;
}
