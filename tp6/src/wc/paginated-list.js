import { withQueryParams } from "../../packages/functions/http.js";
import { toProductProps } from "../api/transformaters/product-transformater.js";
import { API_BASE } from "../api/use-products.js";
import { ThemeEvents } from "../theme/event.js";
import { Component } from "./component.js";
import { pageFetcher } from "./page-fetcher.js";
import {
  PRODUCT_TEMPLATE_URLS,
  renderProductCard,
} from "./product-card-renderer.js";
import { templateStore } from "./template-store.js";

const MAX_PRODUCT_PAGES = 4;
const PRODUCT_SKELETON_COUNT = 8;

const PRODUCT_SKELETON_ITEM = `
  <li class="product-grid__item product-card-skeleton">
    <div class="product-card-skeleton__media skeleton"></div>
    <div class="product-card-skeleton__info">
      <span class="product-card-skeleton__line skeleton"></span>
      <span class="product-card-skeleton__line product-card-skeleton__line--price skeleton"></span>
    </div>
  </li>`;

export class PaginatedList extends Component {
  #allItems = [];
  #activeCategories = new Set();
  #initialized = false;

  get apiEndpoint() {
    const url = this.getAttribute("api-endpoint");
    if (!url) {
      throw new Error("paginated-list: l'attribut 'api-endpoint' est requis");
    }
    return url;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.#initialized) return;
    this.#initialized = true;
    this.#start();
    document.addEventListener(ThemeEvents.FilterUpdate, this.#onFilterUpdate);
    document.addEventListener(
      ThemeEvents.categorySelect,
      this.#onCategorySelect,
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener(
      ThemeEvents.FilterUpdate,
      this.#onFilterUpdate,
    );
    document.removeEventListener(
      ThemeEvents.categorySelect,
      this.#onCategorySelect,
    );
  }

  async #start() {
    this.#renderSkeletons();
    await templateStore.load(PRODUCT_TEMPLATE_URLS);
    await this.#loadAll();
  }

  async #loadAll() {
    const first = await pageFetcher.fetch(
      withQueryParams(this.apiEndpoint, { page: 1 }),
    );

    const total = first.meta?.total ?? 0;
    const limit = first.meta?.limit ?? 3;
    const totalPages = limit ? Math.ceil(total / limit) : 1;
    const pageCount = Math.max(1, Math.min(totalPages, MAX_PRODUCT_PAGES));

    const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
    const jsons = await Promise.all(
      pages.map((page) =>
        pageFetcher.fetch(withQueryParams(this.apiEndpoint, { page })),
      ),
    );

    this.#allItems = jsons.flatMap((json) =>
      (json.data ?? []).map((dto) => this.#toItem(dto)),
    );

    this.#renderGrid();
    this.#emitCategories();
  }

  #renderSkeletons() {
    const grid = this.refs.grid;
    if (!grid) return;
    grid.replaceChildren();
    const fragment = document
      .createRange()
      .createContextualFragment(
        Array.from(
          { length: PRODUCT_SKELETON_COUNT },
          () => PRODUCT_SKELETON_ITEM,
        ).join(""),
      );
    grid.appendChild(fragment);
  }

  #renderGrid() {
    const grid = this.refs.grid;
    if (!grid) return;
    grid.replaceChildren();

    for (const item of this.#filteredItems()) {
      try {
        grid.appendChild(renderProductCard(item));
      } catch (error) {
        console.error("[paginated-list] Échec de rendu d'un item", item, error);
      }
    }
  }

  #filteredItems() {
    if (this.#activeCategories.size === 0) return this.#allItems;
    return this.#allItems.filter((item) =>
      item.categories.some((category) => this.#activeCategories.has(category)),
    );
  }

  #emitCategories() {
    const categories = [
      ...new Set(this.#allItems.flatMap((item) => item.categories)),
    ].sort();
    this.dispatchEvent(
      new CustomEvent("products:loaded", {
        bubbles: true,
        detail: { categories },
      }),
    );
  }

  #toItem(dto) {
    const props = toProductProps(dto);
    const images = (props.imageObjects ?? []).map((image) => ({
      id: image.id,
      url: image.image_url,
    }));

    return {
      id: props.id,
      title: props.title,
      price: this.#formatPrice(props.price),
      priceValue: Number(props.price) || 0,
      image: images[0]?.url ?? "",
      images,
      href: `/products/${props.id}`,
      domId: `product-card-${props.id}`,
      anchorId: `card-link-${props.id}`,
      categories: props.categories,
    };
  }

  #formatPrice(value) {
    const amount = Number(value) || 0;
    return new Intl.NumberFormat("fr-FR").format(amount);
  }

  #onFilterUpdate = (event) => {
    const params = event.detail?.queryParams;
    const categories = new Set();
    if (params && typeof params.entries === "function") {
      for (const [key, value] of params.entries()) {
        if (key === "filter.category") categories.add(value);
      }
    }
    this.#activeCategories = categories;
    this.#renderGrid();
  };

  #onCategorySelect = async (event) => {
    const slug = event.detail?.slug ?? "";
    this.#activeCategories = new Set();
    if (slug) {
      await this.#loadCategory(slug);
    } else {
      await this.#loadAll();
    }
  };

  async #loadCategory(slug) {
    this.#renderSkeletons();
    const json = await pageFetcher.fetch(
      `${API_BASE}categories/${encodeURIComponent(slug)}/scene-packs`,
    );
    this.#allItems = (json.data ?? []).map((dto) => this.#toItem(dto));
    this.#renderGrid();
  }
}

if (!customElements.get("paginated-list")) {
  customElements.define("paginated-list", PaginatedList);
}
