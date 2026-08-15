import { defineStep, loadSteps } from "../../packages/lazy/load.js";
import { HeaderItem } from "../wc/header/header-item.js";

export const CATEGORY_SLUGS = [
  "womens-fashion",
  "mens-fashion",
  "kids-fashion",
  "activewear",
  "beauty-skincare",
  "shoes",
];

const NAV_SKELETON_COUNT = CATEGORY_SLUGS.length;

function renderHeaderSkeleton(root) {
  root.replaceChildren();
  const fragment = document.createRange().createContextualFragment(
    Array.from(
      { length: NAV_SKELETON_COUNT },
      () => `
         <li class="menu-list__list-item">
          <span class="menu-list__link">
            <span class="menu-list__link-title skeleton"></span>
          </span>
        </li>`,
    ).join(""),
  );

  root.appendChild(fragment);
}

function waitForEvent(eventName) {
  return new Promise((resolve) => {
    window.addEventListener(eventName, (e) => resolve(e.detail), {
      once: true,
    });
  });
}

async function initHeaderMenu() {
  const root = document.querySelector("overflow-list");
  const headerItem = new HeaderItem(root, []);

  renderHeaderSkeleton(root);

  const [_, [products, categories]] = await Promise.all([
    headerItem.init(),
    Promise.all([waitForEvent("product:all"), waitForEvent("category:all")]),
  ]);

  const items = CATEGORY_SLUGS.map((slug) => {
    const category = categories.find((c) => c.props.slug === slug);
    const categoryProducts = products[slug] ?? [];

    return {
      label: category?.name ?? slug,
      href: `/collections/${slug}`,
      submenu: categoryProducts.map((p) => ({
        label: p.props.title,
        href: `/products/${p.props.id}`,
        tags: p.props.tags,
        images: p.props.imageObjects,
      })),
    };
  });
  headerItem.setItems(items);
  headerItem.render();
}

initHeaderMenu();

loadSteps({
  mode: "parallel",
  steps: [
    defineStep(() => import("../api/use-products.js"), "useProductsApi")
      .method("getByCategories")
      .args(CATEGORY_SLUGS)
      .on("product:all"),
    defineStep(() => import("../api/use-categories.js"), "useCategoriesApi")
      .method("getAll")
      .on("category:all"),
  ],
});
