import { TMDB_IMAGE_BASE } from "../constant.js";

export class MovieDialog {
  /** @type {HTMLDialogElement} */
  #dialog;

  /**
   * @param {HTMLElement} root
   */
  constructor(root) {
    this.#dialog = document.createElement("dialog");
    this.#dialog.className = "calendar__day-dialog";
    root.appendChild(this.#dialog);

    this.#dialog.addEventListener("click", (e) => {
      if (e.target === this.#dialog) {
        this.#dialog.close();
      }
    });
  }

  /**
   * Ouvre le dialog avec la liste complète des films du jour.
   * @param {Array} movies
   */
  open(movies) {
    this.#dialog.innerHTML = "";

    const list = document.createElement("div");
    list.className = "calendar__day-dialog-list";

    movies.forEach((movie) => {
      list.appendChild(this.#buildItem(movie));
    });

    this.#dialog.appendChild(list);
    this.#dialog.showModal();
  }

  /**
   * @param {Object} movie
   * @returns {HTMLElement}
   */
  #buildItem(movie) {
    const item = document.createElement("div");
    item.className = "calendar__day-dialog-item";

    if (movie.poster_path) {
      const img = document.createElement("img");
      img.src = `${TMDB_IMAGE_BASE}${movie.poster_path}`;
      img.alt = movie.title;
      item.appendChild(img);
    }

    const title = document.createElement("span");
    title.textContent = movie.title;
    item.appendChild(title);

    return item;
  }
}
