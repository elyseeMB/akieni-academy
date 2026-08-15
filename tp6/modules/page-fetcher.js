const cache = new Map();
const inflight = new Map();

const LS_PREFIX = "akieni-cache:";
const LS_TTL = 24 * 60 * 60 * 1000;

function readPersisted(url) {
  try {
    const raw = localStorage.getItem(LS_PREFIX + url);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      localStorage.removeItem(LS_PREFIX + url);
      return null;
    }
    return entry.value;
  } catch {
    return null;
  }
}

function writePersisted(url, value) {
  localStorage.setItem(
    LS_PREFIX + url,
    JSON.stringify({ value, expiresAt: Date.now() + LS_TTL }),
  );
}

async function fetchJson(url, { signal } = {}) {
  if (inflight.has(url)) return inflight.get(url);

  const promise = fetch(url, {
    signal,
    headers: { Accept: "application/json" },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Request failed: ${url} (${response.status})`);
      }
      return response.json();
    })
    .finally(() => {
      inflight.delete(url);
    });

  inflight.set(url, promise);
  return promise;
}

export const pageFetcher = {
  fetch(url, options) {
    if (cache.has(url)) {
      return Promise.resolve(cache.get(url));
    }

    const persisted = readPersisted(url);
    if (persisted !== null) {
      cache.set(url, persisted);
      return Promise.resolve(persisted);
    }

    return fetchJson(url, options).then((json) => {
      cache.set(url, json);
      writePersisted(url, json);
      return json;
    });
  },

  clear() {
    cache.clear();
  },
};
