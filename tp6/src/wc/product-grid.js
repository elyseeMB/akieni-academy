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
                  { length: 3 },
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
          gap: 3rem;
        }

        .category-section {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .category-title {
          margin: 0;
          font-size: 1.35rem;
          font-weight: 600;
          line-height: 1.3;
          color: #111827;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(
            auto-fill,
            minmax(200px, 1fr)
          );
          gap: 1.25rem;
        }

        .product-card {
          min-width: 0;
          overflow: hidden;
          border-radius: 1.25rem;
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06),
                      0 4px 12px rgba(0, 0, 0, 0.04);
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
                      box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }

        .product-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08),
                      0 2px 6px rgba(0, 0, 0, 0.04);
        }

        .product-image-wrapper {
          width: 100%;
          aspect-ratio: 3 / 4;
          overflow: hidden;
          background: #f3f4f6;
        }

        .product-image-wrapper img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .product-card:hover .product-image-wrapper img {
          transform: scale(1.04);
        }

        .product-content {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 1rem;
        }

        .product-title {
          margin: 0;
          font-size: 0.9375rem;
          font-weight: 500;
          line-height: 1.4;
          color: #1f2937;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .product-price {
          margin: 0;
          font-size: 0.9rem;
          font-weight: 600;
          line-height: 1.4;
          color: #059669;
        }

        /* Skeleton */
        .skeleton {
          position: relative;
          overflow: hidden;
          background: #e5e7eb;
          border-radius: 0.625rem;
        }

        .skeleton::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            100deg,
            transparent 30%,
            rgba(255, 255, 255, 0.45) 50%,
            transparent 70%
          );
          transform: translateX(-100%);
          animation: shimmer 1.8s infinite;
        }

        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }

        .skeleton-category-title {
          width: 180px;
          height: 28px;
          border-radius: 0.5rem;
        }

        .skeleton-image {
          width: 100%;
          height: 100%;
          border-radius: 0;
        }

        .skeleton-title {
          width: 80%;
          height: 16px;
        }

        .skeleton-price {
          width: 45%;
          height: 14px;
        }

        @media (max-width: 640px) {
          .products-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 0.875rem;
          }

          .category-title {
            font-size: 1.15rem;
          }
        }
      </style>
    `;
  }
}
