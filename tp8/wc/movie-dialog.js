import { TMDB_IMAGE_BASE } from "../constant.js";
import { DialogComponent } from "./dialog-component.js";

export class MovieDialog extends DialogComponent {
  requiredRefs = ["dialog"];

  /**
   * @param {Array} movies
   * @param {string} date - date au format YYYY-MM-DD du jour sélectionné
   * @param {(movie: Object) => ({ name: string, color: string } | undefined)} getGenreInfo
   */
  open(movies, date, getGenreInfo) {
    const { dialog } = this.refs;
    if (dialog.open) {
      return;
    }
    this.#build(movies, date, getGenreInfo);
    this.showDialog();
  }

  /**
   * @param {Array} movies
   * @param {string} date
   * @param {(movie: Object) => ({ name: string, color: string } | undefined)} getGenreInfo
   */
  #build(movies, date, getGenreInfo) {
    const { dialog } = this.refs;
    dialog.innerHTML = "";

    const header = document.createElement("header");
    header.className = "calendar__day-dialog-header";
    header.textContent = this.#formatDate(date);
    dialog.appendChild(header);

    const list = document.createElement("div");
    list.className = "calendar__day-dialog-list";

    movies.forEach((movie) => {
      list.appendChild(this.#buildItem(movie, getGenreInfo));
    });

    dialog.appendChild(list);
  }

  /**
   * @param {string} date
   * @returns {string}
   */
  #formatDate(date) {
    const [year, month, day] = date.split("-").map(Number);
    return new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(year, month - 1, day));
  }

  /**
   * @param {Object} movie
   * @param {(movie: Object) => ({ name: string, color: string } | undefined)} getGenreInfo
   * @returns {HTMLElement}
   */
  #buildItem(movie, getGenreInfo) {
    const item = document.createElement("div");
    item.className = "calendar__day-dialog-item";

    if (movie.poster_path) {
      const img = document.createElement("img");
      img.src = `${TMDB_IMAGE_BASE}${movie.poster_path}`;
      img.alt = movie.title;
      item.appendChild(img);
    }

    const info = document.createElement("div");
    info.className = "calendar__day-dialog-info";

    const title = document.createElement("span");
    title.className = "calendar__day-dialog-title";
    title.textContent = movie.title;
    info.appendChild(title);

    const genre = getGenreInfo?.(movie);
    if (genre) {
      const pill = document.createElement("span");
      pill.className = "calendar__day-dialog-genre";
      pill.style.setProperty("--color", genre.color);
      pill.textContent = genre.name;
      info.appendChild(pill);
    }

    if (movie.overview) {
      const overview = document.createElement("p");
      overview.className = "calendar__day-dialog-overview";
      overview.textContent = movie.overview;
      info.appendChild(overview);
    }

    item.appendChild(info);

    return item;
  }
}
