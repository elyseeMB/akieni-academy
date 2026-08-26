const API_GENRES =
  "https://movies-api.mboussaemmanuelito.workers.dev/api/genres";

function setSkeleton() {
  return Array.from(
    { length: 8 },
    (_, k) => `<div class="filter-item-wrapper">
                <div class="filter-pill-container">
                  <div class="filter-pill skeleton-pill"></div>
                </div>
              </div>`,
  ).join("");
}

export class GenresBar {
  #genres = [];
  /** @type {Element} */
  #filterGroup;
  #onDialogOpen = () => this.#fetchGenres();

  build() {
    const fragment = document.createRange().createContextualFragment(`
      <div class="filter-bar-wrapper">
        <div class="filter-bar-container">
          <div class="filter-scroller horizontal">
            <div class="filter-group">
              ${setSkeleton()}
            </div>
          </div>
        </div>
      </div>
    `);

    this.#filterGroup = fragment.querySelector(".filter-group");
    return fragment;
  }

  onMount() {
    document.addEventListener("dialog:open", this.#onDialogOpen);
  }

  onUnmount() {
    document.removeEventListener("dialog:open", this.#onDialogOpen);
  }

  async #fetchGenres() {
    try {
      const res = await fetch(API_GENRES);
      const data = await res.json();
      this.#genres = data.genres ?? data;
      this.#renderPills(this.#genres);
    } catch (err) {
      console.error("Failed to fetch genres:", err);
    }
  }

  #renderPills(genres) {
    this.#filterGroup.innerHTML = "";

    for (const genre of genres) {
      const pill = document.createElement("div");
      pill.className = "filter-item-wrapper";
      pill.innerHTML = `
        <div class="filter-pill-container">
          <div role="button" data-id=${genre.id} tabindex="0" class="filter-pill"
            on:click="#suggestion-component/suggestByGenre?genreId=${genre.id}&genreName=${encodeURIComponent(genre.name)}"
          >
            <span class="filter-label">${genre.name}</span>
          </div>
        </div>
      `;
      this.#filterGroup.appendChild(pill);
    }
  }
}
