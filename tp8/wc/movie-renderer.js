import { getStatusClass, getStatusText, popoverClick } from "../lib/movie.js";

export class MovieRenderer {
  /** @type {number} */
  #maxVisible;

  /** @type {(cell: HTMLElement, movies: Array) => void} */
  #onMore;

  /** @type {(movie: Object) => Record<string, string> | undefined} */
  #getMovieStyle;

  /**
   * @param {{ maxVisible?: number, onMore: (cell: HTMLElement, movies: Array) => void, getMovieStyle?: (movie: Object) => Record<string, string> | undefined }} options
   */
  constructor({ maxVisible = 3, onMore, getMovieStyle }) {
    this.#maxVisible = maxVisible;
    this.#onMore = onMore;
    this.#getMovieStyle = getMovieStyle;
  }

  render(cell, movies) {
    const container = document.createElement("div");
    container.className = "calendar__movies";
    const visible = movies.slice(0, this.#maxVisible);
    const hidden = movies.slice(this.#maxVisible);

    visible.forEach((movie, index) => {
      container.appendChild(this.#buildPoster(movie, visible.length - index));
    });
    if (hidden.length > 0) {
      container.appendChild(this.#buildMoreBadge(hidden.length, cell, hidden));
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
    item.classList.add(getStatusClass(movie.release_date));
    item.setAttribute("status", getStatusText(movie.release_date));

    const colorSquare = document.createElement("span");
    colorSquare.className = "calendar__movie-poster";
    const styles = this.#getMovieStyle?.(movie);
    if (styles) {
      for (const [prop, value] of Object.entries(styles)) {
        item.style.setProperty(prop, value);
      }
    }
    item.appendChild(colorSquare);
    item.setAttribute("on:click", popoverClick(movie));

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
