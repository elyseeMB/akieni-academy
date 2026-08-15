import { ThemeEvents } from "../theme/event.js";
import { Component } from "./component.js";

const SITE_NAME = "SUMMER BREAK SHOP";
const DEFAULT_TITLE = "Tous produits";

/**
 * Custom element for displaying category title
 * @extends {Component}
 */
export class CategoryTitleComponent extends Component {
  /**
   * @return {void}
   */
  connectedCallback() {
    super.connectedCallback();
    this.#renderTitle(DEFAULT_TITLE);
    document.title = DEFAULT_TITLE + " | " + SITE_NAME;
    document.addEventListener(
      ThemeEvents.categorySelect,
      this.#onCategorySelect,
    );
  }

  /**
   * @return {void}
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener(
      ThemeEvents.categorySelect,
      this.#onCategorySelect,
    );
  }

  /**
   * @type {(event: CustomEvent) => void}
   */
  #onCategorySelect = (event) => {
    const name = event.detail?.name || "";
    document.title = name + " | " + SITE_NAME;
    this.#renderTitle(name || DEFAULT_TITLE);
  };

  /**
   * @param {string} text
   * @return {void}
   */
  #renderTitle(text) {
    this.replaceChildren();
    const h1 = document.createElement("h1");
    h1.className = "title-main";
    h1.textContent = text;
    this.appendChild(h1);
  }
}
