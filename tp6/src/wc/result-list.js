import {
  mediaQueryLarge,
  requestIdleCallback,
  startViewTransition,
} from "../utilities/utils.js";

import PaginatedList from "./pagination-list.js";

export default class ResultsList extends PaginatedList {
  connectedCallback() {
    super.connectedCallback();

    mediaQueryLarge.addEventListener("change", this.#handleMediaQueryChange);
    this.setAttribute("initialized", "");
  }

  disconnectedCallback() {
    mediaQueryLarge.removeEventListener("change", this.#handleMediaQueryChange);
  }

  updateLayout({ target }) {
    console.log({ target });

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
    const targetElement = event.matches
      ? this.querySelector('[data-grid-layout="desktop-default-option"]')
      : this.querySelector('[data-grid-layout="mobile-option"]');

    if (targetElement instanceof HTMLInputElement) {
      targetElement.checked = true;
      this.#setLayout("default");
    }
  };
}

if (!customElements.get("results-list")) {
  customElements.define("results-list", ResultsList);
}
