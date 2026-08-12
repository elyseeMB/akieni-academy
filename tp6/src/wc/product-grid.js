export class ProductGrid extends HTMLElement {
  /** @type {Record<string, import("../models/product.js").Product[]>} */
  #productsByCategory = {};

  /** @type {Map<string, string>} */
  #categoryNameBySlug = new Map();

  #categoriesLoaded = false;

  /** @type {ShadowRoot} */
  #shadowRoot;

  /** @type {(event: CustomEvent) => void} */
  #handleProductsAll;

  /** @type {(event: CustomEvent) => void} */
  #handleCategoriesAll;

  constructor() {
    super();

    this.#shadowRoot = this.attachShadow({ mode: "open" });

    this.#handleProductsAll = this.#handleProducts.bind(this);
    this.#handleCategoriesAll = this.#handleCategories.bind(this);
  }

  connectedCallback() {
    this.#renderSkeleton();

    window.addEventListener("product:all", this.#handleProductsAll);
    window.addEventListener("category:all", this.#handleCategoriesAll);
  }

  disconnectedCallback() {
    window.removeEventListener("product:all", this.#handleProductsAll);
    window.removeEventListener("category:all", this.#handleCategoriesAll);
  }

  /**
   * @param {CustomEvent<Record<string, import("../models/product.js").Product[]>>} event
   */
  #handleProducts(event) {
    this.#productsByCategory = event.detail ?? {};
    this.#render();
  }

  /**
   * @param {CustomEvent<import("../models/category.js").Category[]>} event
   */
  #handleCategories(event) {
    this.#categoryNameBySlug = new Map(
      (event.detail ?? []).map((category) => [category.slug, category.name]),
    );

    this.#categoriesLoaded = true;
    this.#render();
  }

  #render() {
    const slugs = Object.keys(this.#productsByCategory);

    if (!slugs.length) {
      this.#renderSkeleton();
      return;
    }

    this.#shadowRoot.innerHTML = `
      ${this.#styles}

      <div class="product-grid">
        ${slugs
          .map((slug) => {
            const products = this.#productsByCategory[slug];

            if (!products?.length) {
              return "";
            }

            return `
              <section class="category-section">
                ${
                  this.#categoriesLoaded
                    ? `<h2 class="category-title">
                         ${this.#categoryNameBySlug.get(slug) ?? ""}
                       </h2>`
                    : `<div
                         class="skeleton skeleton-category-title"
                         aria-hidden="true"
                       ></div>`
                }

                <div class="products-grid">
                  ${products
                    .map((product) => this.#renderProduct(product))
                    .join("")}
                </div>
              </section>
            `;
          })
          .join("")}
      </div>
    `;
  }

  /**
   * @param {import("../models/product.js").Product} product
   * @returns {string}
   */
  #renderProduct(product) {
    return `
      <article class="product-card">
        <div class="product-image-wrapper">
          <img
            src="${product.image}"
            alt="${product.props.title}"
            loading="lazy"
          />
        </div>

        <div class="product-content">
          <h3 class="product-title">
            ${product.props.title}
          </h3>

          <p class="product-price">
            ${product.props.price} FCFA
          </p>
        </div>
      </article>
    `;
  }

  #renderSkeleton() {
    this.#shadowRoot.innerHTML = `
      ${this.#styles}

      <div class="product-grid">
        ${Array.from(
          { length: 2 },
          () => `
            <section class="category-section">
              <div
                class="skeleton skeleton-category-title"
                aria-hidden="true"
              ></div>

              <div class="products-grid">
                ${Array.from(
                  { length: 4 },
                  () => `
                    <article class="product-card">
                      <div class="skeleton skeleton-image"></div>

                      <div class="product-content">
                        <div class="skeleton skeleton-title"></div>
                        <div class="skeleton skeleton-price"></div>
                      </div>
                    </article>
                  `,
                ).join("")}
              </div>
            </section>
          `,
        ).join("")}
      </div>
    `;
  }

  get #styles() {
    return `
      <style>
        :host {
          display: block;
          width: 100%;
        }

        .product-grid {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }

        .category-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .category-title {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 600;
          line-height: 1.4;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(
            auto-fill,
            minmax(180px, 1fr)
          );
          gap: 1rem;
        }

        .product-card {
          min-width: 0;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          background: #fff;
        }

        .product-image-wrapper {
          width: 100%;
          aspect-ratio: 1;
          overflow: hidden;
          background: #f3f4f6;
        }

        .product-image-wrapper img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-content {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0.875rem;
        }

        .product-title {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 500;
        }

        .product-price {
          margin: 0;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .skeleton {
          background: #e5e7eb;
          border-radius: 0.375rem;
        }

        .skeleton-category-title {
          width: 160px;
          height: 24px;
        }

        .skeleton-image {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 0;
        }

        .skeleton-title {
          width: 80%;
          height: 16px;
        }

        .skeleton-price {
          width: 45%;
          height: 16px;
        }

        @media (max-width: 640px) {
          .products-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 0.75rem;
          }
        }
      </style>
    `;
  }
}
