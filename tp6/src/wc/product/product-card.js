import { yieldToMainThread } from "../../utilities/utils.js";
import { Component } from "../component.js";

export class ProductCard extends Component {
  requiredRefs = ["productCardLink"];

  connectedCallback() {
    super.connectedCallback();

    if (!(this.refs.productCardLink instanceof HTMLAnchorElement)) {
      throw new Error("Product card link not found");
    }

    this.addEventListener("click", this.navigateToProduct);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("click", this.navigateToProduct);
  }

  navigateToProduct = (event) => {
    if (
      !(event.target instanceof Element) ||
      this.hasAttribute("data-no-navigation") ||
      event.target.closest('button, input, label, select, [tabindex="1"]')
    ) {
      return;
    }

    const link = this.refs.productCardLink;
    if (!link.href) return;

    const linkURL = new URL(link.href);
    const productCardAnchor = link.getAttribute("id");
    if (!productCardAnchor) return;

    const infiniteResultsList = this.closest(
      'results-list[infinite-scroll="true"]',
    );

    if (infiniteResultsList) {
      const url = new URL(window.location.href);
      const parent = this.closest("li");

      url.hash = productCardAnchor;

      if (parent && parent.dataset.page) {
        url.searchParams.set("page", parent.dataset.page);
      }

      yieldToMainThread().then(() => {
        history.replaceState({}, "", url.toString());
      });
    }

    if (!event.target.closest("a")) {
      this.#navigateToURL(event, linkURL);
    }
  };

  #navigateToURL = (event, url) => {
    if (
      event instanceof MouseEvent &&
      (event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1)
    ) {
      event.preventDefault();
      window.open(url.href, "_blank");
      return;
    }
    window.location.href = url.href;
  };
}

if (!customElements.get("product-card")) {
  customElements.define("product-card", ProductCard);
}
