import "./elements/wc.js";

export const CATEGORY_SLUGS = [
  "womens-fashion",
  "mens-fashion",
  "kids-fashion",
  "activewear",
  "beauty-skincare",
  "shoes",
];

document.querySelector(".action").addEventListener("click", async (e) => {
  e.preventDefault();
  const { useProductsApi } = await import("./api/use-products.js");
  const data = await useProductsApi.getAll();
  const categories = await useProductsApi.getByCategory("mens-fashion");
  const productsByCategory =
    await useProductsApi.getByCategories(CATEGORY_SLUGS);

  console.log("++++++++++++++++++++");
  console.log("++++++++++++++++++++");
  console.log("++++++++++++++++++++");
  console.log(categories);
  window.dispatchEvent(
    new CustomEvent("product:all", {
      detail: productsByCategory,
    }),
  );
});
