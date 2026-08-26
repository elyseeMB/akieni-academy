import { DialogComponent } from "./dialog-component.js";
import { GenresBar } from "./genres-bar.js";
import { PreviousItem } from "./previous-item.js";
import { SearchBar } from "./search-bar.js";

export class SearchComponent extends DialogComponent {
  #genresBar = new GenresBar();
  #searchBar = new SearchBar();
  #previousItem = new PreviousItem();

  connectedCallback() {
    super.connectedCallback();
    this.#build();
    this.#genresBar.onMount();
    this.#previousItem.connectedCallback();
  }

  disconnectedCallback() {
    this.#genresBar.onUnmount();
    this.#previousItem.disconnectedCallback();
  }

  #build() {
    /** @type {{ dialog: HTMLDialogElement }} */
    const { dialog } = this.refs;
    if (dialog.open) {
      return;
    }
    const wrapper = document.createElement("div");
    wrapper.setAttribute("class", "dialog-search__wrapper");

    const container = document.createElement("div");
    container.setAttribute("class", "dialog-search__container");

    wrapper.appendChild(container);
    const gridWrapper = document.createElement("div");
    gridWrapper.setAttribute("class", "dialog-search__grid");
    container.appendChild(gridWrapper);

    gridWrapper.appendChild(this.#searchBar.build());
    gridWrapper.appendChild(this.#genresBar.build());

    const results = document.createElement("div");
    results.setAttribute("class", "search-results");

    const suggestion = document.createElement("suggestion-component");
    suggestion.id = "suggestion-component";
    results.appendChild(suggestion);

    this.#previousItem.id = "previousItem";
    this.#previousItem.classList.add("search-results__preview");
    results.appendChild(this.#previousItem);

    gridWrapper.appendChild(results);

    dialog.appendChild(wrapper);
  }

  open() {
    this.showDialog();
  }

  close() {
    this.closeDialog();
  }
}
