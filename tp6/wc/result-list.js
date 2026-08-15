import {
  mediaQueryLarge,
  requestIdleCallback,
  startViewTransition,
} from "../../utilities/utils.js";

import { PaginatedList } from "./paginated-list.js";

/**
 * Custom element for displaying paginated product results with layout options
 * @extends {PaginatedList}
 */
export class ResultsList extends PaginatedList {
  /**
   * @return {void}
   */
  connectedCallback() {
    super.connectedCallback();

    mediaQueryLarge.addEventListener("change", this.#handleMediaQueryChange);
    this.setAttribute("initialized", "");
  }

  /**
   * @return {void}
   */
  disconnectedCallback() {
    mediaQueryLarge.removeEventListener("change", this.#handleMediaQueryChange);
  }

  /**
   * @param {Event} param
   * @param {HTMLInputElement} param.target
   * @return {void}
   */
  updateLayout({ target }) {
    if (target instanceof HTMLInputElement) {
      this.#animateLayoutChange(target.value);
    }
  }

  /**
   * @async
   * @param {string} value
   * @return {Promise<void>}
   */
  #animateLayoutChange = async (value) => {
    const { grid } = this.refs;
    if (!grid) return;

    await startViewTransition(() => this.#setLayout(value), ["product-grid"]);

    requestIdleCallback(() => {
      const viewport = mediaQueryLarge.matches ? "desktop" : "mobile";
      sessionStorage.setItem(`product-grid-view-${viewport}`, value);
    });
  };

  /**
   * @param {string} value
   * @return {void}
   */
  #setLayout(value) {
    const { grid } = this.refs;
    if (grid) grid.setAttribute("product-grid-view", value);
  }

  /**
   * @type {(event: MediaQueryListEvent) => void}
   */
  #handleMediaQueryChange = (event) => {
    if (!event.matches) return;

    const targetElement = this.querySelector(
      '[data-grid-layout="desktop-default-option"]',
    );

    if (targetElement instanceof HTMLInputElement) {
      targetElement.checked = true;
      this.#setLayout("default");
    }
  };
}

