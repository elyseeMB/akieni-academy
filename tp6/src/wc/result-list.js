import {
  mediaQueryLarge,
  requestIdleCallback,
  startViewTransition,
} from "../utilities/utils.js";

import { PaginatedList } from "./paginated-list.js";

/**
 * Custom element for displaying paginated product results with layout options
 * @extends {PaginatedList}
 */
export class ResultsList extends PaginatedList {
  connectedCallback() {
    super.connectedCallback();

    mediaQueryLarge.addEventListener("change", this.#handleMediaQueryChange);
    this.setAttribute("initialized", "");
  }

  disconnectedCallback() {
    mediaQueryLarge.removeEventListener("change", this.#handleMediaQueryChange);
  }

  updateLayout({ target }) {
    if (target instanceof HTMLInputElement) {
      this.#animateLayoutChange(target.value);
    }
  }

  #animateLayoutChange = async (value) => {
    const { grid } = this.refs;
    if (!grid) return;

    await startViewTransition(() => this.#setLayout(value), ["product-grid"]);

    requestIdleCallback(() => {
      const viewport = mediaQueryLarge.matches ? "desktop" : "mobile";
      sessionStorage.setItem(`product-grid-view-${viewport}`, value);
    });
  };

  #setLayout(value) {
    const { grid } = this.refs;
    if (grid) grid.setAttribute("product-grid-view", value);
  }

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
