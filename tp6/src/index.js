import "./wc/wc.js";
import { defineStep, loadSteps } from "../packages/lazy/load.js";

export const CATEGORY_SLUGS = [
  "womens-fashion",
  "mens-fashion",
  "kids-fashion",
  "activewear",
  "beauty-skincare",
  "shoes",
];

const productGrid = document.querySelector("product-grid");

const observer = new IntersectionObserver(([entry]) => {
  if (!entry.isIntersecting) return;

  observer.disconnect();

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
});

observer.observe(productGrid);
