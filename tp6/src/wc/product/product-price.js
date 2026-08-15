import { ThemeEvents } from "../../theme/event.js";

/**
 * Custom element for displaying product prices with variant updates
 * @extends {HTMLElement}
 */
export class ProductPrice extends HTMLElement {
  connectedCallback() {
    const closestSection = this.closest(".shopify-section, dialog");

    if (closestSection) {
      closestSection.addEventListener(
        ThemeEvents.variantUpdate,
        this.updatePrice,
      );
    }
  }

  disconnectedCallback() {
    const closestSection = this.closest(".shopify-section, dialog");

    if (closestSection) {
      closestSection.removeEventListener(
        ThemeEvents.variantUpdate,
        this.updatePrice,
      );
    }
  }

  updatePrice = (event) => {
    if (event.detail.data.newProduct) {
      this.dataset.productId = event.detail.data.newProduct.id;
    } else if (
      event.target instanceof HTMLElement &&
      event.target.dataset.productId !== this.dataset.productId
    ) {
      return;
    }

    const newProductPrice = event.detail.data.html.querySelector(
      `product-price[data-block-id="${this.dataset.blockId}"]`,
    );

    if (!newProductPrice) {
      return;
    }

    const newPrice = newProductPrice.querySelector('[ref="priceContainer"]');
    const currentPrice = this.querySelector('[ref="priceContainer"]');

    if (newPrice && currentPrice) {
      currentPrice.replaceWith(newPrice);
    }

    const currentNote = this.querySelector(".volume-pricing-note");
    const newNote = newProductPrice.querySelector(".volume-pricing-note");

    if (newNote) {
      if (currentNote) {
        currentNote.replaceWith(newNote);
      } else {
        this.querySelector('[ref="priceContainer"]')?.insertAdjacentElement(
          "afterend",
          newNote.cloneNode(true),
        );
      }
    } else if (currentNote) {
      currentNote.remove();
    }
  };
}
