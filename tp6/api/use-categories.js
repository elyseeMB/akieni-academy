import { Category } from "../models/Category.js";
import { cacheApi } from "../packages/functions/cache.js";
import { ApiError } from "../packages/functions/error.js";
import { apiFetch } from "../packages/functions/http.js";
import { toCategoryProps } from "./transformaters/category-transformater.js";

const url = "https://e-commerce.mboussaemmanuelito.workers.dev/api/v1/";

const CATEGORIES_CACHE_KEY = "akieni-categories";

function readCategoriesCache() {
  try {
    const raw = localStorage.getItem(CATEGORIES_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCategoriesCache(data) {
  localStorage.setItem(CATEGORIES_CACHE_KEY, JSON.stringify(data));
}

export class CategoryFetchError extends Error {
  /**
   * @param {string} message
   * @param {{cause?: Error}} [options]
   */
  constructor(message, options) {
    super(message, options);
    this.name = "CategoryFetchError";
  }
}

/**
 * Fetches all categories from the API
 * @param {Record<string, any>} queryParams
 * @returns {Promise<Category[]>}
 */
async function getAllCategoriesApi(queryParams = {}) {
  const endpoint = new URL("categories", url);

  try {
    const cached = readCategoriesCache();
    if (cached) {
      return cached.map((dto) => Category.create(toCategoryProps(dto)));
    }

    /** @type {import("../models/Category.js").ResponseApiCategory} */
    const res = await apiFetch(endpoint.href, queryParams);
    writeCategoriesCache(res.data);
    return res.data.map((dto) => Category.create(toCategoryProps(dto)));
  } catch (error) {
    if (error instanceof ApiError) {
      throw new CategoryFetchError("Impossible de récupérer les catégories", {
        cause: error,
      });
    }
    throw error;
  }
}

export const useCategoriesApi = cacheApi({
  getAll: getAllCategoriesApi,
});
