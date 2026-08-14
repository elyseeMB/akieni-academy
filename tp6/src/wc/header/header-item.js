const TEMPLATE_URLS = {
  menuItem: "./templates/header/menu-item.html",
  submenu: "./templates/header/submenu.html",
  submenuLink: "./templates/header/submenu-link.html",
  resourceCard: "./templates/header/resource-card.html",
  moreItem: "./templates/header/more-item.html",
};

const templateCache = new Map();

async function fetchAndCache(url) {
  if (templateCache.has(url)) {
    return templateCache.get(url);
  }

  const html = await fetch(url).then((r) => r.text());
  templateCache.set(url, html);

  return html;
}

export class HeaderItem {
  /**@type {HTMLElement} */
  #root;

  /**@type {Array<{label: string, href: string, submenu: Array}>} */
  #items;

  /**@type {Record<string, HTMLTemplateElement>} */
  #templates = {};

  /**
   * @param {HTMLElement} node
   * @param {Array<{label: string, href: string, submenu: Array}>} items
   */
  constructor(node, items) {
    this.#root = node;
    this.#items = items;
  }

  async init() {
    await this.#loadTemplates();
  }

  setItems(items) {
    this.#items = items;
  }

  render() {
    this.#build();
  }

  async #loadTemplates() {
    const entries = Object.entries(TEMPLATE_URLS);

    const htmlChunks = await Promise.all(
      entries.map(([, url]) => fetchAndCache(url)),
    );

    entries.forEach(([key], i) => {
      this.#templates[key] = this.#parseTemplate(htmlChunks[i]);
    });
  }

  /**
   * @param {string} html
   * @returns {HTMLTemplateElement}
   */
  #parseTemplate(html) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = html.trim();

    const template = wrapper.querySelector("template");
    if (!template) {
      throw new Error("Template not found");
    }

    return template;
  }

  /**
   * @param {string} key
   * @returns {DocumentFragment}
   */
  #clone(key) {
    return this.#templates[key].content.cloneNode(true);
  }

  #build() {
    if (!this.#root) {
      return;
    }

    this.#root.replaceChildren();

    this.#items.forEach((item, i) => {
      this.#root.appendChild(this.#buildMenuItem(item, i + 1));
    });

    this.#root.appendChild(this.#clone("moreItem"));

    const overflowList = this.#root.closest("overflow-list");
    if (overflowList) {
      overflowList.dispatchEvent(new CustomEvent("reflow", { detail: {} }));
    }
  }

  /**
   * @param {{label: string, href: string, submenu: Array}} item
   * @param {number} index
   */
  #buildMenuItem(item, index) {
    const label = (
      item.label.charAt(0).toUpperCase() + item.label.slice(1)
    ).split("'")[0];

    const node = this.#clone("menuItem");
    const link = node.querySelector(".menu-list__link");

    link.href = item.href;
    link.setAttribute("aria-controls", `submenu-${index}`);
    node.querySelector(".menu-list__link-title").textContent = label;

    const li = node.querySelector("li");
    if (item.submenu?.length) {
      li.appendChild(this.#buildSubMenu(item.submenu, index));
    }

    return node;
  }

  /**
   * @param {Array<{label: string, href: string, tags: string[], images: any[]}>} submenu
   * @param {number} index
   */
  #buildSubMenu(submenu, index) {
    const node = this.#clone("submenu");

    node.querySelector(".menu-list__submenu-inner").id = `submenu-${index}`;

    const grid = node.querySelector(".mega-menu__grid");
    grid.dataset.menuGridId = `MegaMenuList-${index}`;

    const list = node.querySelector(".mega-menu__list");
    list.dataset.menuListId = `MegaMenuList-${index}`;

    const linksContainer = node.querySelector('[data-slot="links"]');
    submenu.forEach((subItem) => {
      subItem.tags?.forEach((tag) => {
        linksContainer.appendChild(this.#buildSubMenuLink(tag));
      });
    });

    const styleEl = node.querySelector('[data-slot="grid-style"]');
    styleEl.textContent = `
      [data-menu-grid-id="MegaMenuList-${index}"] {
        --menu-columns-desktop: 6;
        --menu-columns-tablet: 4;
      }
      [data-menu-list-id="MegaMenuList-${index}"] {
        --menu-columns-desktop: 1;
        --menu-columns-tablet: 2;
      }
    `;

    const cardsContainer = node.querySelector('[data-slot="cards"]');
    submenu.slice(0, 3).forEach((subItem) => {
      cardsContainer.appendChild(this.#buildResourceCard(subItem));
    });

    return node;
  }

  /**
   * @param {string} tag
   */
  #buildSubMenuLink(tag) {
    const node = this.#clone("submenuLink");

    const link = node.querySelector(".mega-menu__link");
    link.href = `/product/${tag}`;
    node.querySelector(".mega-menu__link-title").textContent = tag;

    return node;
  }

  /**
   * @param {{label: string, href: string, images: any[]}} item
   */
  #buildResourceCard(item) {
    const node = this.#clone("resourceCard");

    const image = item.images?.[0];

    const container = node.querySelector(".resource-card");
    container.href = item.href;

    const link = node.querySelector(".resource-card__link");
    link.href = item.href;
    node.querySelector(".visually-hidden").textContent = item.label;

    const img = node.querySelector(".resource-card__image");
    img.src = image?.image_url ?? "";
    img.alt = image?.title ?? item.label;

    node.querySelector(".resource-card__title span").textContent = item.label;

    return node;
  }
}
