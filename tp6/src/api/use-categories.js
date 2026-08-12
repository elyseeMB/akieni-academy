import { ApiError } from "../../packages/functions/error.js";
import { apiFetch } from "../../packages/functions/functions.js";

const url =
  "https://withered-breeze-4769.mboussaemmanuelito.workers.dev/api/v1/";

/**
 * @typedef {Object} CategoryDoc
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {number} sort_order
 * @property {string} slug
 */

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
 * @returns {Promise<CategoryDoc[]>}
 */
async function getAllCategoriesApi() {
  const endpoint = new URL("categories", url);

  try {
    /** @type {CategoryDoc[]} */
    const res = await apiFetch(endpoint.href);
    return res;
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
