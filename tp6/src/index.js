import { defineStep, loadSteps } from "../packages/lazy/load.js";
import { ProductGrid } from "./wc/product-grid.js";

export const CATEGORY_SLUGS = [
  "womens-fashion",
  "mens-fashion",
  "kids-fashion",
  "activewear",
  "beauty-skincare",
  "shoes",
];

// Définir le custom element le plus tôt possible
customElements.define("product-grid", ProductGrid);

// Lancer immédiatement — pas d'IntersectionObserver
// Les requêtes partent avant même que le DOM ne soit peint
loadSteps({
  mode: "sequential",
  steps: [
    defineStep(() => import("./api/use-products.js"), "useProductsApi")
      .method("getByCategories")
      .args(CATEGORY_SLUGS)
      .on("product:all"),

    defineStep(() => import("./api/use-categories.js"), "useCategoriesApi")
      .method("getAll")
      .on("category:all"),
  ],
});
