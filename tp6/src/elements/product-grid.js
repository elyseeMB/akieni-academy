import { CATEGORY_SLUGS } from "../index.js";

export class ProductGrid extends HTMLElement {
  /** @type {(event: CustomEvent) => void} */
  #handleProductsAll;

  constructor() {
    super();
    this.#handleProductsAll = this.renderProducts.bind(this);
  }

  connectedCallback() {
    console.log("connected");
    window.addEventListener("product:all", this.#handleProductsAll);
  }

  disconnectedCallback() {
    window.removeEventListener("product:all", this.#handleProductsAll);
  }

  /**
   * @param {string} slug
   * @returns {string}
   */
  #getCategoryName(slug) {
    return CATEGORY_SLUGS.find((c) => c.slug === slug)?.name ?? slug;
  }

  /**
   * @param {CustomEvent<Record<string, import("../models/product.js").Product[]>>} event
   */
  renderProducts(event) {
    const productsByCategory = event.detail;
    const slugs = Object.keys(productsByCategory ?? {});

    if (!slugs.length) {
      this.innerHTML = `<p>Aucun produit trouvé.</p>`;
      return;
    }

    this.innerHTML = slugs
      .map((slug) => {
        const products = productsByCategory[slug];

        if (!products?.length) {
          return "";
        }

        return `
          <section class="category-section">
            <h2>${this.#getCategoryName(slug)}</h2>
            <div class="products-row">
              ${products
                .map(
                  (product) => `
                    <article class="product-card">
                      <img src="${product.image}" alt="${product.props.title}" />
                      <h3>${product.props.title}</h3>
                      <p>${product.props.price} FCFA</p>
                    </article>
                  `,
                )
                .join("")}
            </div>
          </section>
        `;
      })
      .join("");
  }
}
