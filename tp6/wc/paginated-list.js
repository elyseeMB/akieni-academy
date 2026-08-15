import { toProductProps } from "../../api/transformaters/product-transformater.js";
import { useCategoriesApi } from "../../api/use-categories.js";
import { API_BASE } from "../../api/use-products.js";
import { pageFetcher } from "../../modules/page-fetcher.js";
import {
  PRODUCT_TEMPLATE_URLS,
  renderProductCard,
} from "../../modules/product-card-renderer.js";
import { templateStore } from "../../modules/template-store.js";
import { ThemeEvents } from "../../theme/event.js";
import { Component } from "./component.js";

const PRODUCT_SKELETON_COUNT = 4;

const PRODUCT_SKELETON_ITEM = `
  <li class="product-grid__item product-card-skeleton">
    <div class="product-card-skeleton__media skeleton"></div>
    <div class="product-card-skeleton__info">
      <span class="product-card-skeleton__line skeleton"></span>
      <span class="product-card-skeleton__line product-card-skeleton__line--price skeleton"></span>
    </div>
  </li>`;

/**
 * Custom element for displaying paginated product listings
 * @extends {Component}
 */
export class PaginatedList extends Component {
  /**@type {Array} */
  #allItems = [];
  /**@type {boolean} */
  #initialized = false;

  /**
   * @return {string}
   */
  get apiEndpoint() {
    const url = this.getAttribute("api-endpoint");
    if (!url) {
      throw new Error("paginated-list: l'attribut 'api-endpoint' est requis");
    }
    return url;
  }

  /**
   * @return {void}
   */
  connectedCallback() {
    super.connectedCallback();
    if (this.#initialized) return;
    this.#initialized = true;
    this.#start();
    document.addEventListener(
      ThemeEvents.categorySelect,
      this.#onCategorySelect,
    );
  }

  /**
   * @return {void}
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener(
      ThemeEvents.categorySelect,
      this.#onCategorySelect,
    );
  }

  /**
   * @async
   * @return {Promise<void>}
   */
  async #start() {
    this.#renderSkeletons();
    await templateStore.load(PRODUCT_TEMPLATE_URLS);
    await this.#loadAllCategories();
  }

  /**
   * @async
   * @return {Promise<void>}
   */
  async #loadAllCategories() {
    this.#renderSkeletons();

    const categories = await useCategoriesApi.getAll();
    const slugs = categories.map((category) => category.slug).filter(Boolean);

    const jsons = await Promise.all(
      slugs.map((slug) =>
        pageFetcher.fetch(
          `${API_BASE}categories/${encodeURIComponent(slug)}/scene-packs`,
        ),
      ),
    );

    const seen = new Set();
    const dtos = [];
    for (const json of jsons) {
      for (const dto of json.data ?? []) {
        if (seen.has(dto.id)) continue;
        seen.add(dto.id);
        dtos.push(dto);
      }
    }

    this.#allItems = dtos.map((dto) => this.#toItem(dto));
    this.#renderGrid();
    this.#emitCategories();
  }

  /**
   * @return {void}
   */
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

  /**
   * @return {void}
   */
  #renderGrid() {
    const grid = this.refs.grid;
    if (!grid) return;
    grid.replaceChildren();

    for (const item of this.#allItems) {
      try {
        grid.appendChild(renderProductCard(item));
      } catch (error) {
        console.error("[paginated-list] Échec de rendu d'un item", item, error);
      }
    }
  }

  /**
   * @return {void}
   */
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

  /**
   * @param {Object} dto
   * @return {Object}
   */
  #toItem(dto) {
    const props = toProductProps(dto);
    const images = (props.imageObjects ?? []).map((image) => ({
      id: image.id,
      url: image.image_url,
    }));

    return {
      id: props.id,
      title: props.title,
      price: props.price,
      priceValue: Number(props.price) || 0,
      image: images[0]?.url ?? "",
      images,
      href: `/products/${props.id}`,
      domId: `product-card-${props.id}`,
      anchorId: `card-link-${props.id}`,
      categories: props.categories,
    };
  }

  /**
   * @type {(event: CustomEvent) => Promise<void>}
   */
  #onCategorySelect = async (event) => {
    const slug = event.detail?.slug ?? "";
    if (slug) {
      await this.#loadCategory(slug);
    } else {
      await this.#loadAllCategories();
    }
  };

  /**
   * @async
   * @param {string} slug
   * @return {Promise<void>}
   */
  async #loadCategory(slug) {
    this.#renderSkeletons();
    const json = await pageFetcher.fetch(
      `${API_BASE}categories/${encodeURIComponent(slug)}/scene-packs`,
    );
    this.#allItems = (json.data ?? []).map((dto) => this.#toItem(dto));
    this.#renderGrid();
  }
}

