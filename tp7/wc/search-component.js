import { DialogComponent } from "./dialog-component.js";
import { SearchBar } from "./search-bar.js";

export class SearchComponent extends DialogComponent {
  #searchBar = new SearchBar();

  connectedCallback() {
    super.connectedCallback();
    this.#build();
  }

  disconnectedCallback() {}

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

    const suggestion = document.createElement("suggestion-component");
    suggestion.id = "suggestion-component";
    gridWrapper.appendChild(suggestion);

    dialog.appendChild(wrapper);
  }

  open() {
    this.showDialog();
  }

  close() {
    this.closeDialog();
  }
}
