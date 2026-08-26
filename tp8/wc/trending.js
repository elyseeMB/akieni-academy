import { getTrending } from "../api.js";

export class Trending {
  #data = [];
  #container;
  #onDialogOpen = () => this.#fetchTrending();

  build(container) {
    this.#container = container;
    this.#buildSkeletons();
  }

  onMount() {
    document.addEventListener("dialog:open", this.#onDialogOpen);
  }

  onUnmount() {
    document.removeEventListener("dialog:open", this.#onDialogOpen);
  }

  get data() {
    return this.#data;
  }

  #buildSkeletons() {
    this.#container.innerHTML = Array.from(
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

  async #fetchTrending() {
    try {
      const data = await getTrending();
      this.#data = data.results ?? data;
      this.#renderItems();
    } catch (err) {
      console.error(err);
    }
  }

  #renderItems() {
    this.#container.innerHTML = this.#data
      .map((movie) => this.#buildItem(movie))
      .join("");
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
      <a href="/movie/${movie.id}"
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
