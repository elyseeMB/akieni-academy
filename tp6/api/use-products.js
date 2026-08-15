import { cacheApi } from "../packages/functions/cache.js";
import { ApiError } from "../packages/functions/error.js";
import { apiFetch, withQueryParams } from "../packages/functions/http.js";
import { Product } from "../models/product.js";
import { toProductProps } from "./transformaters/product-transformater.js";

export const API_BASE =
  "https://withered-breeze-4769.mboussaemmanuelito.workers.dev/api/v1/";

/**
 * Fetches products belonging to a specific category
 * @param {string} slug
 * @param {Record<string, any>} [queryParams]
 * @returns {Promise<Product[]>}
 */
async function getProductsByCategoryApi(slug, queryParams = {}) {
  const rootURL = new URL(`categories/${slug}/scene-packs`, API_BASE);
  const endpoint = withQueryParams(rootURL.href, queryParams);

  try {
    /** @type {import("../models/product.js").ResponseApiProduct} */
    const res = await apiFetch(endpoint);
    return res.data.map((dto) => Product.create(toProductProps(dto)));
  } catch (error) {
    if (error instanceof ApiError) {
      throw new ProductFetchError(
        `Impossible de récupérer les produits de la catégorie ${slug}`,
        { cause: error },
      );
    }
    throw error;
  }
}

/**
 * Fetches products from multiple categories in parallel
 * @param {string[]} slugs
 * @param {Record<string, any>} [queryParams]
 * @returns {Promise<Record<string, Product[]>>}
 */
async function getProductsByCategoriesApi(slugs, queryParams = {}) {
  const results = await Promise.all(
    slugs.map((slug) => getProductsByCategoryApi(slug, queryParams)),
  );
  return Object.fromEntries(slugs.map((slug, i) => [slug, results[i]]));
}

/**
 *  Error thrown when fetching products from the API fails
 */
export class ProductFetchError extends Error {
  /**
   * @param {string} message
   * @param {{cause?: Error}} [options]
   */
  constructor(message, options) {
    super(message, options);
    this.name = "ProductFetchError";
  }
}

export const useProductsApi = cacheApi({
  getByCategories: getProductsByCategoriesApi,
});

