export class HeaderItem {
  /**@type {HTMLElement} */
  #root;

  /**@type {Array<{label: string, href: string, submenu: Array<{label: string, href: string, tags: string[], images: any[]}>}>} */
  #items;

  /**
   * @param {HTMLElement} node
   * @param {Array<{label: string, href: string, submenu: Array}>} items
   */
  constructor(node, items) {
    this.#root = node;
    this.#items = items;

    this.#build();
  }

  #build() {
    if (!this.#root) {
      return;
    }

    this.#root.replaceChildren();

    const fragments = this.#items.map((item, i) =>
      this.#buildMenuItem(item, i + 1),
    );

    fragments.forEach((f) => {
      this.#root.appendChild(f);
    });

    const moreItem = this.#buildFrament(this.#buildMoreItem());
    this.#root.appendChild(moreItem);
  }

  /**
   * @param {{label: string, href: string, submenu: Array}} item
   * @param {number} index
   */
  #buildMenuItem(item, index) {
    const label = (
      item.label.charAt(0).toUpperCase() + item.label.slice(1)
    ).split("'")[0];
    return this.#buildFrament(`<li
      role="presentation"
      class="menu-list__list-item"
      on:focus="/activate"
      on:blur="/deactivate"
      on:pointerenter="/activate"
      on:pointerleave="/deactivate"
    >
      <a
        href="${item.href}"
        class="menu-list__link"
        aria-controls="submenu-${index}"
        aria-haspopup="true"
        aria-expanded="false"
        ref="menuitem"
      />
        <span class="menu-list__link-title">${label}</span>
      </a>
      ${this.#buildSubMenuStruct(item.submenu, index)}
    </li>`);
  }

  /**
   * @param {Array<{label: string, href: string}>} submenu
   * @param {number} index
   */
  #buildSubMenuStruct(submenu, index) {
    if (!submenu?.length) {
      return "";
    }
    return `<div class="menu-list__submenu" ref="submenu[]">
      <div
        id="submenu-${index}"
        class="menu-list__submenu-inner"
        style="
        --menu-parent-font-family: var(--font---family); --menu-parent-font-style:var(--font---style); --menu-parent-font-weight: var(--font---weight); --menu-parent-font-case:none;
        --menu-child-font-family: var(--font---family); --menu-child-font-style:var(--font---style); --menu-child-font-weight: var(--font---weight); --menu-child-font-case:none;
        "
      >
        <div class="mega-menu section section--full-width-margin section--">
          <div class="mega-menu__grid" data-menu-grid-id="MegaMenuList-${index}">
            ${this.#buildSubMenuBody(submenu, index)}
          </div>
        </div>
      </div>
    </div>`;
  }

  /**
   * @param {Array<{label: string, href: string}>} submenu
   * @param {number} index
   */
  #buildSubMenuBody(submenu, index) {
    const links = submenu.map((s) => this.#buildSubMenuLink(s)).join("");

    return `<ul
      data-menu-list-id="MegaMenuList-${index}"
      class="mega-menu__list list-unstyled"
      style="--menu-image-border-radius: px;"
    >
      <li class="mega-menu__column mega-menu__column--span-1">
        ${links}
      </li>
    </ul>

    <style>
    [data-menu-grid-id="MegaMenuList-${index}"] {
      --menu-columns-desktop: 6;
      --menu-columns-tablet: 4;
    }

    [data-menu-list-id="MegaMenuList-${index}"] {
    --menu-columns-desktop: 1;
    --menu-columns-tablet: 2;
    }
    </style>

    ${this.#buildSubMenuContent(submenu)}`;
  }

  /**
   * @param {{label: string, href: string}} subItem
   */
  #buildSubMenuLink(subItem) {
    return subItem.tags
      .map(
        (tag) => `
      <div>
      <a href="/product/${tag}" class="mega-menu__link">
        <span class="mega-menu__link-title wrap-text">${tag}</span>
      </a>
    </div>`,
      )
      .join(" ");
  }

  /**
   * Bloc "resource-card" visuel (images) pour les 2 premiers produits du submenu.
   * @param {Array<{label: string, href: string, images: any[]}>} submenu
   */
  #buildSubMenuContent(submenu) {
    const featured = submenu.slice(0, 3);

    if (!featured.length) {
      return "";
    }

    const cards = featured.map((s) => this.#buildResourceCard(s)).join("");

    return `<span
      class="mega-menu__content"
      style="--menu-content-columns-desktop: 3; --menu-content-columns-tablet: 2; --resource-card-corner-radius: px;"
    >
      <ul class="mega-menu__content-list mega-menu__content-list--collections list-unstyled">
        ${cards}
      </ul>
    </span>`;
  }

  /**
   * @param {{label: string, href: string, images: any[]}} item
   */
  #buildResourceCard(item) {
    const image = item.images?.[0];
    const src = image?.image_url;
    const alt = image?.title;
    return `<li class="mega-menu__content-list-item">
      <div class="resource-card resource-card--overlay" href="${item.href}" data-resource-type="product">
        <a class="resource-card__link" href="${item.href}">
          <span class="visually-hidden">${item.label}</span>
        </a>
        <div class="resource-card__media" style="--resource-card-aspect-ratio: 16 / 9">
          <img src="${src}" alt="${alt}" class="resource-card__image" sizes="300px">
        </div>
        <div class="resource-card__content">
          <div class="resource-card__title">
            <span>${item.label}</span>
          </div>
          <div class="resource-card__price">
            <p class="resource-card__subtext paragraph"></p>
          </div>
        </div>
      </div>
    </li>`;
  }

  #buildMoreItem() {
    return `<li class="menu-list__list-item" role="presentation" slot="more" on:focus="/activate" on:blur="/deactivate" on:pointerenter="/activate" on:pointerleave="/deactivate">
      <button role="menuitem" class="button menu-list__link button-unstyled">
        <span class="menu-list__link-title">More</span>
      </button>
    </li>`;
  }

  /**
   * @param {string} str
   */
  #buildFrament(str) {
    return document.createRange().createContextualFragment(str);
  }
}
