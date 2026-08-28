const cache = new Map();

/**
 * @typedef {Object} CacheEntry
 * @property {any} value
 * @property {number} expiresAt
 */

let apiInstanceCounter = 0;

/**
 * Wraps an API object with a transparent cache.
 *
 * @template {Record<string, Function>} T
 * @param {T} api
 * @param {{ ttl?: number }} [options]
 * @returns {T}
 */
export function cacheApi(api, { ttl = 50_000 } = {}) {
  const namespace = `api-${apiInstanceCounter++}`;
  const methods = new Map();

  return new Proxy(api, {
    get(target, property, receiver) {
      const method = Reflect.get(target, property, receiver);

      if (typeof method !== "function") {
        return method;
      }

      if (methods.has(property)) {
        return methods.get(property);
      }

      const cachedMethod = (...args) => {
        const key = `${namespace}:${String(property)}:${JSON.stringify(args)}`;
        const cached = cache.get(key);

        if (cached?.expiresAt > Date.now()) {
          return cached.value;
        }

        const value = method.apply(target, args);
        cache.set(key, {
          value,
          expiresAt: Date.now() + ttl,
        });

        setTimeout(() => cache.delete(key), ttl).unref?.();
        if (value instanceof Promise) {
          value.catch(() => {
            cache.delete(key);
          });
        }

        return value;
      };

      methods.set(property, cachedMethod);
      return cachedMethod;
    },
  });
}
