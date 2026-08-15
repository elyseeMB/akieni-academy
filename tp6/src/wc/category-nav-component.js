import { useCategoriesApi } from "../api/use-categories.js";
import { CategorySelectEvent } from "../theme/event.js";
import { Component } from "./component.js";

const SKELETON_COUNT = 8;

/**
 * Custom element for category navigation menu
 * @extends {Component}
 */
export class CategoryNavComponent extends Component {
  #initialized = false;

  connectedCallback() {
    super.connectedCallback();
    if (this.#initialized) return;
    this.#initialized = true;
    this.#render();
  }

  async #render() {
    this.#renderSkeletons();
    try {
      const categories = await useCategoriesApi.getAll();
      this.#renderList(categories);
    } catch (error) {
      console.error("[category-nav] Échec du chargement des catégories", error);
      this.#renderList([]);
    }
  }

  #renderSkeletons() {
    const list = this.#list();
    list.replaceChildren();
    const fragment = document.createRange().createContextualFragment(
      Array.from(
        { length: SKELETON_COUNT },
        () => `
          <li class="category-nav__item-wrapper">
            <span class="category-nav__item skeleton"></span>
          </li>`,
      ).join(""),
    );
    list.appendChild(fragment);
  }

  #renderList(categories) {
    const list = this.#list();
    list.replaceChildren();

    const items = [
      { slug: "", name: "Tous les produits" },
      ...categories.map((category) => ({
        slug: category.slug,
        name: category.name,
      })),
    ];

    for (const item of items) {
      const wrapper = document.createElement("li");
      wrapper.className = "category-nav__item-wrapper";

      const button = document.createElement("button");
      button.type = "button";
      button.className = "category-nav__item";
      button.dataset.slug = item.slug;
      button.textContent = item.name;
      button.setAttribute("on:click", "category-nav-component/select");
      if (item.slug === "") button.setAttribute("aria-current", "true");

      wrapper.appendChild(button);
      list.appendChild(wrapper);
    }
  }

  #list() {
    let list = this.querySelector(".category-nav__list");
    if (!list) {
      list = document.createElement("ul");
      list.className = "category-nav__list";
      this.appendChild(list);
    }
    return list;
  }

  select(event) {
    const button = event.target.closest(".category-nav__item");
    if (!button) return;

    for (const other of this.querySelectorAll(".category-nav__item")) {
      other.removeAttribute("aria-current");
    }
    button.setAttribute("aria-current", "true");

    const slug = button.dataset.slug ?? "";
    const name = button.textContent?.trim() ?? "";
    document.dispatchEvent(new CategorySelectEvent(slug, name));
  }
}
