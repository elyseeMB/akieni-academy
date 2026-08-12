import { ApiError } from "./error.js";

/**
 * make fetch url
 *
 * @template T
 * @param {string} url
 * @param {RequestInit} options
 * @returns {Promise<T>}
 */
export async function apiFetch(url, options = {}) {
  /**@type {RequestInit} */
  const params = {
    ...options,
    method: "GET",
    headers: {
      ...options.headers,
      Accept: "application/json",
    },
  };
  const response = await fetch(url, params);

  if (!response.ok) {
    const res = response.json();
    throw new ApiError(res.message, {
      cause: {
        status: response.status,
        statusText: response.statusText,
      },
    });
  }
  return response.json();
}

/**
 * @param {string} url
 * @param {Record<string, any>} [params]
 * @returns {string}
 */
export function withQueryParams(url, params) {
  if (!params) {
    return url;
  }

  const search = Object.entries(params)
    .reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        acc.set(key, value.toString());
      }
      return acc;
    }, new URLSearchParams())
    .toString();

  return search ? `${url}?${search}` : url;
}
