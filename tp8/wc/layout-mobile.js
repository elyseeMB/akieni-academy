import { getAllCalendarMovies, getUpcomingMovies } from "../api.js";
import { endOfMonth, toDateKey } from "../lib/date.js";
import {
  formatDate,
  getMovieStyle,
  getStatusClass,
  getStatusText,
  loadGenreMap,
  popoverClick,
} from "../lib/movie.js";
import { Component } from "./component.js";

export class LayoutMobile extends Component {
  #months = new Map();
  #genreMap = new Map();
  #now = new Date();
  #year = new Date().getFullYear();

  connectedCallback() {
    super.connectedCallback();
    this.#buildShell();
    this.#loadGenreMap();
    this.#loadAll();
  }

  async #loadGenreMap() {
    this.#genreMap = await loadGenreMap();
  }

  #buildShell() {
    this.innerHTML = "";

    const list = document.createElement("div");
    list.className = "layout-mobile__list";
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const section = document.createElement("section");
      section.className = "layout-mobile__section";
      section.dataset.month = monthIndex;

      const header = document.createElement("h2");
      header.className = "layout-mobile__month";
      header.textContent = Intl.DateTimeFormat(undefined, {
        month: "long",
        year: "numeric",
      }).format(new Date(this.#year, monthIndex, 1));
      section.appendChild(header);

      const body = document.createElement("div");
      body.className = "layout-mobile__body";
      body.setAttribute("aria-live", "polite");
      section.appendChild(body);
      list.appendChild(section);
      this.#months.set(monthIndex, { el: section, movies: new Map() });
    }

    this.appendChild(list);
  }

  #loadAll() {
    for (let i = 0; i < 12; i++) {
      this.#loadMonth(i);
    }
  }

  async #loadMonth(monthIndex) {
    try {
      const calendar = await getAllCalendarMovies(this.#year, monthIndex + 1);
      this.#addMovies(monthIndex, calendar);
      if (monthIndex >= this.#now.getMonth()) {
        await this.#loadUpcoming(monthIndex);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async #loadUpcoming(monthIndex) {
    const monthStart = new Date(this.#year, monthIndex, 1);
    const isCurrentMonth = monthIndex === this.#now.getMonth();
    const rangeStart = isCurrentMonth ? this.#now : monthStart;
    const minDate = toDateKey(rangeStart);
    const maxDate = toDateKey(endOfMonth(monthStart));

    const { results } = await getUpcomingMovies(minDate, maxDate);
    this.#addMovies(monthIndex, results);
  }

  /**
   * @param {number} monthIndex
   * @param {Array} movies
   */
  #addMovies(monthIndex, movies) {
    const month = this.#months.get(monthIndex);
    if (!month) {
      return;
    }

    for (const movie of movies ?? []) {
      if (!movie.release_date) {
        continue;
      }
      if (!month.movies.has(movie.id)) {
        month.movies.set(movie.id, movie);
      }
    }

    this.#renderMonth(monthIndex);
  }

  /**
   * @param {number} monthIndex
   */
  #renderMonth(monthIndex) {
    const month = this.#months.get(monthIndex);
    if (!month) {
      return;
    }

    const body = month.el.querySelector(".layout-mobile__body");
    body.innerHTML = "";

    const sorted = [...month.movies.values()].sort((a, b) =>
      a.release_date < b.release_date
        ? -1
        : a.release_date > b.release_date
          ? 1
          : 0,
    );

    if (sorted.length === 0) {
      const empty = document.createElement("p");
      empty.className = "layout-mobile__empty";
      empty.textContent = "Aucune sortie pour ce mois.";
      body.appendChild(empty);
      return;
    }

    for (const movie of sorted) {
      body.appendChild(this.#buildItem(movie));
    }
  }

  /**
   * @param {object} movie
   * @returns {HTMLElement}
   */
  #buildItem(movie) {
    const item = document.createElement("div");
    item.className = "layout-mobile__item calendar__movie";
    item.title = movie.title;

    item.classList.add(getStatusClass(movie.release_date));
    item.setAttribute("status", getStatusText(movie.release_date));

    const styles = getMovieStyle(movie, this.#genreMap);
    if (styles) {
      for (const [prop, value] of Object.entries(styles)) {
        item.style.setProperty(prop, value);
      }
    }

    item.setAttribute("on:click", popoverClick(movie));

    const poster = document.createElement("img");
    poster.className = "layout-mobile__poster";
    poster.alt = movie.title;
    if (movie.poster_path) {
      poster.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    }
    item.appendChild(poster);

    const info = document.createElement("div");
    info.className = "layout-mobile__info";

    const title = document.createElement("span");
    title.className = "layout-mobile__title";
    title.textContent = movie.title;
    info.appendChild(title);

    const genreName = this.#genreMap.get(movie.genre_ids?.[0]);
    if (genreName) {
      const genre = document.createElement("span");
      genre.className = "layout-mobile__genre";
      genre.textContent = genreName;
      genre.style.setProperty("background", `var(--genre-${genreName})`);
      info.appendChild(genre);
    }

    const meta = document.createElement("span");
    meta.className = "layout-mobile__meta";
    meta.textContent = `${formatDate(movie.release_date)} · ${getStatusText(movie.release_date)}`;
    info.appendChild(meta);

    item.appendChild(info);
    return item;
  }
}
