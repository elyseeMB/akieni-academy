import { Component } from "./component.js";

export class PreviousItem extends Component {
  connectedCallback() {
    super.connectedCallback();
    this.#build();
  }

  /**
   * @param {PointerEvent} event
   * @param {{ id: number, title: string, image: string, year: string, date: string, overview: string }} data
   */
  preview(data) {
    const { image, title, date, overview } = data;

    const cover = this.querySelector(".search-preview__cover");
    cover.src = image;
    cover.alt = title;
    this.querySelector(".search-preview__title").textContent = title;
    this.querySelector(".search-preview__content").innerHTML = `
      <span class="search-preview__year">${date}</span>
      <p class="search-preview__overview">${overview}</p>
    `;
  }

  leavePrevious() {}

  #build() {
    this.innerHTML = `
      <div class="search-preview">
        <img class="search-preview__cover" src="" alt="">
        <div class="search-preview__body">
          <div class="search-preview__title">Nouvelle page</div>
          <div class="search-preview__content">
            <span class="search-preview__empty">
              Sélectionnez un résultat pour afficher un aperçu
            </span>
          </div>
        </div>
      </div>
    `;
  }
}
