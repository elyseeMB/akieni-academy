/**
 * Custom element for product card links with transition support
 * @extends {HTMLElement}
 */
export class ProductCardLink extends HTMLElement {
  /**
   * @return {void}
   */
  connectedCallback() {
    this.addEventListener("click", this.#handleClick);
  }

  /**
   * @return {void}
   */
  disconnectedCallback() {
    this.removeEventListener("click", this.#handleClick);
  }

  /**
   * @return {boolean}
   */
  get productTransitionEnabled() {
    return this.getAttribute("data-product-transition") === "true";
  }

  /**
   * @return {string | null}
   */
  get featuredMediaUrl() {
    return this.getAttribute("data-featured-media-url");
  }

  #handleClick = (event) => {
    if (
      event.defaultPrevented ||
      (event.target instanceof Element &&
        event.target.closest('button, input, label, select, [tabindex="1"]'))
    ) {
      return;
    }
    const gallery = this.querySelector(
      "[data-view-transition-to-main-product]",
    );
    if (!this.productTransitionEnabled || !(gallery instanceof HTMLElement)) {
      return;
    }

    const activeImage =
      gallery.querySelector(
        'slideshow-slide[aria-hidden="false"] [transitionToProduct="true"]',
      ) || gallery.querySelector('[transitionToProduct="true"]:last-child');

    activeImage instanceof HTMLImageElement &&
      this.#setImageSrcset(activeImage),
      gallery.setAttribute(
        "data-view-transition-type",
        "product-image-transition",
      ),
      gallery.setAttribute("data-view-transition-triggered", "true");
  };

  #setImageSrcset(image) {
    if (!this.featuredMediaUrl) {
      return;
    }
    const currentImageUrl = new URL(image.currentSrc),
      currentImageRawUrl = currentImageUrl.host + currentImageUrl.pathname;

    if (!this.featuredMediaUrl.includes(currentImageRawUrl)) {
      const imageFade = image.animate([{ opacity: 0.8 }, { opacity: 1 }], {
        duration: 125,
        easing: "ease-in-out",
      });

      imageFade.onfinish = () => {
        image.srcset = this.featuredMediaUrl ?? "";
      };
    }
  }
}
