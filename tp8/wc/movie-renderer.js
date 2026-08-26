import { TMDB_IMAGE_BASE } from "../constant.js";

export class MovieRenderer {
  /** @type {number} */
  #maxVisible;

  /** @type {(cell: HTMLElement, movies: Array) => void} */
  #onMore;

  /**
   * @param {{ maxVisible?: number, onMore: (cell: HTMLElement, movies: Array) => void }} options
   */
  constructor({ maxVisible = 3, onMore }) {
    this.#maxVisible = maxVisible;
    this.#onMore = onMore;
  }

  /**
   * @param {HTMLElement} cell
   * @param {Array} movies
   */
  render(cell, movies) {
    const container = document.createElement("div");
    container.className = "calendar__movies";

    const visible = movies.slice(0, this.#maxVisible);
    const hidden = movies.slice(this.#maxVisible);

    visible.forEach((movie, index) => {
      container.appendChild(this.#buildPoster(movie, visible.length - index));
    });

    if (hidden.length > 0) {
      container.appendChild(this.#buildMoreBadge(hidden.length, cell, movies));
    }

    cell.appendChild(container);
  }

  /**
   * @param {Object} movie
   * @param {number} zIndex
   * @returns {HTMLElement}
   */
  #buildPoster(movie, zIndex) {
    const item = document.createElement("div");
    item.dataset.movieId = movie.id;
    item.className = "calendar__movie";
    item.style.zIndex = zIndex;
    item.title = movie.title;

    // if (movie.poster_path) {
    //   const img = document.createElement("img");
    //   img.className = "calendar__movie-poster";
    //   img.src = `${TMDB_IMAGE_BASE}${movie.poster_path}`;
    //   img.alt = movie.title;
    //   img.loading = "lazy";
    //   item.appendChild(img);
    // }

    const title = document.createElement("span");
    title.className = "calendar__movie-title";
    title.textContent = movie.title;
    item.appendChild(title);

    return item;
  }

  /**
   * @param {number} count
   * @param {HTMLElement} cell
   * @param {Array} movies
   * @returns {HTMLElement}
   */
  #buildMoreBadge(count, cell, movies) {
    const badge = document.createElement("button");
    badge.className = "calendar__movie-more";
    badge.type = "button";
    badge.textContent = `+${count}`;
    badge.addEventListener("click", (e) => {
      e.stopPropagation();
      this.#onMore(cell, movies);
    });
    return badge;
  }
}
