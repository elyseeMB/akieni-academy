import { ThemeEvents } from "../theme/event.js";
import { Component } from "./component.js";

const DEFAULT_TITLE = "Tous les produits";

export class CategoryTitleComponent extends Component {
  connectedCallback() {
    super.connectedCallback();
    this.#renderTitle(DEFAULT_TITLE);
    document.addEventListener(ThemeEvents.categorySelect, this.#onCategorySelect);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener(
      ThemeEvents.categorySelect,
      this.#onCategorySelect,
    );
  }

  #onCategorySelect = (event) => {
    this.#renderTitle(event.detail?.name || DEFAULT_TITLE);
  };

  #renderTitle(text) {
    this.replaceChildren();
    const h1 = document.createElement("h1");
    h1.className = "title-main";
    h1.textContent = text;
    this.appendChild(h1);
  }
}

if (!customElements.get("category-title-component")) {
  customElements.define("category-title-component", CategoryTitleComponent);
}
