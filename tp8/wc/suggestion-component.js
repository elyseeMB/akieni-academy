import { getDiscoverMovies, getSearchMovie } from "../api.js";
import { debounce } from "../utils/utils.js";
import { Component } from "./component.js";
import { Trending } from "./trending.js";

export class SuggestionComponent extends Component {
  /**@type{Record<string, any>} */
  #data;
  #activeItem = null;
  #trending = new Trending();

  #handleSearch = debounce(async (input, page = 1) => {
    this.#data = await getSearchMovie(input, page);
    this.#buildItems();
  }, 1000);

  #handleByGenre = debounce(async (genreId) => {
    this.#data = await getDiscoverMovies({ genreId });
    this.#buildItems();
  }, 1000);

  connectedCallback() {
    super.connectedCallback();
    this.#build();
    this.#trending.build(
      this.querySelector(".search-section:last-child .search-section__items"),
    );
    this.#trending.onMount();
  }

  disconnectedCallback() {
    this.#trending.onUnmount();
  }

  /**
   *
   * @param {InputEvent} e
   */
  suggest(e) {
    const query = e.target.value;
    const filmsSection = this.querySelector(".search-section--films");
    if (!query || query === "") {
      return;
    }
    filmsSection.hidden = false;
    filmsSection.querySelector(".search-section__title").textContent = "Films";
    this.#buildSkeletons();
    this.#handleSearch(query);
  }

  suggestByGenre(data) {
    const filmsSection = this.querySelector(".search-section--films");
    filmsSection.hidden = false;
    filmsSection.querySelector(".search-section__title").textContent =
      data.genreName;
    this.#buildSkeletons();
    this.#handleByGenre(data.genreId);
  }

  onPreviewItem(data) {
    if (this.#activeItem) {
      this.#activeItem
        .querySelector(".search-item")
        ?.classList.remove("search-item--active");
      this.#activeItem.removeAttribute("ref");
    }

    const item = this.querySelector(`a[href="/movie/${data.id}"]`);
    if (item) {
      item.querySelector(".search-item")?.classList.add("search-item--active");
      item.setAttribute("ref", "active");
      this.updatedCallback();
      this.#activeItem = item;
    }
    document.querySelector("#previousItem")?.preview(data);
  }

  #build() {
    this.innerHTML = `
      <div class="search-results__list">
        <div class="search-results__scroller">
          <div class="search-section search-section--films" hidden>
            <div class="search-section__title">Films</div>
            <div class="search-section__items"></div>
          </div>
          <div class="search-section">
            <div class="search-section__title">Tendances</div>
            <div class="search-section__items"></div>
          </div>
        </div>
      </div>
    `;
  }

  #buildSkeletons() {
    const container = this.querySelector(
      ".search-section--films .search-section__items",
    );
    container.innerHTML = Array.from(
      { length: 6 },
      () => `
        <div class="skeleton-item">
          <div class="skeleton-item__content">
            <div class="skeleton skeleton-item__title"></div>
            <div class="skeleton skeleton-item__subtitle"></div>
          </div>
        </div>
      `,
    ).join("");
  }

  #buildItems() {
    const container = this.querySelector(
      ".search-section--films .search-section__items",
    );
    container.innerHTML = this.#data.results
      .map((movie) => this.#buildItem(movie))
      .join("");
    this.#activateFirst();
  }

  #activateFirst() {
    const movie = this.#data.results?.[0];
    if (!movie) {
      return;
    }

    const first = this.querySelector(
      ".search-section--films .search-item-link",
    );
    if (first) {
      first.querySelector(".search-item")?.classList.add("search-item--active");
      first.setAttribute("ref", "active");
      this.updatedCallback();
      this.#activeItem = first;
    }

    const previousItem = document.querySelector("#previousItem");
    if (!previousItem) {
      return;
    }

    const image = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    const date = movie.release_date
      ? new Intl.DateTimeFormat("fr-FR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }).format(new Date(movie.release_date))
      : "";

    previousItem.preview({
      id: movie.id,
      title: movie.title,
      image,
      date,
      overview: movie.overview ?? "",
    });
  }

  #buildItem(movie) {
    const image = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    const year = movie.release_date?.slice(0, 4) ?? "";
    const date = movie.release_date
      ? new Intl.DateTimeFormat("fr-FR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }).format(new Date(movie.release_date))
      : "";

    return `
      <a href="#"
        on:pointerenter="#suggestion-component/onPreviewItem?id=${movie.id}&title=${encodeURIComponent(movie.title)}&image=${encodeURIComponent(image)}&year=${year}&date=${encodeURIComponent(date)}&overview=${encodeURIComponent(movie.overview ?? "")}"
        class="search-item-link"
      >
        <div class="search-item">
          <span class="search-item__title">${movie.title}</span>
          <span class="search-item__subtitle">${date}</span>
        </div>
      </a>
    `;
  }
}
