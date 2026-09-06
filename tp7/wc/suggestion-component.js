import { searchCities } from "../api.js";
import { Component } from "./component.js";

function debounce(fn, wait) {
  let timeout;
  const debounced = (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait);
  };
  return debounced;
}

function formatPlace(city) {
  const parts = [];
  const name = city.name?.trim();
  if (name) parts.push(name);
  if (city.state?.trim()) parts.push(city.state);
  if (city.country?.trim()) parts.push(city.country);
  return parts.join(", ");
}

export class SuggestionComponent extends Component {
  /**@type{Array} */
  #cities = [];

  #handleSearch = debounce(async (input) => {
    this.#cities = await searchCities(input);
    this.#buildItems();
  }, 500);

  connectedCallback() {
    super.connectedCallback();
    this.#build();
  }

  disconnectedCallback() {
    this.#handleSearch?.cancel?.();
  }

  /**
   * @param {InputEvent} e
   */
  suggest(e) {
    const query = e.target.value;
    const section = this.querySelector(".search-section--cities");
    if (!query || query === "") {
      section.hidden = true;
      return;
    }
    section.hidden = false;
    this.#buildSkeletons();
    this.#handleSearch(query);
  }

  /**
   * @param {{lat:number, lon:number, name:string, country:string, state:string}} data
   */
  applyCity(data) {
    this.dispatchEvent(
      new CustomEvent("weather:select", {
        bubbles: true,
        detail: {
          lat: Number(data.lat),
          lon: Number(data.lon),
          name: data.name,
          country: data.country,
          state: data.state,
        },
      }),
    );
    this.closest("search-component")?.close();
  }

  #build() {
    this.innerHTML = `
      <div class="search-results__list">
        <div class="search-results__scroller">
          <div class="search-section search-section--cities" hidden>
            <div class="search-section__items"></div>
          </div>
        </div>
      </div>
    `;
  }

  #buildSkeletons() {
    const container = this.querySelector(
      ".search-section--cities .search-section__items",
    );
    container.innerHTML = Array.from(
      { length: 5 },
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
      ".search-section--cities .search-section__items",
    );
    container.innerHTML = this.#cities.map((city) => this.#buildItem(city)).join("");
  }

  #buildItem(city) {
    const place = formatPlace(city);
    const subtitle = [city.state, city.country].filter(Boolean).join(", ");
    return `
      <button type="button"
        on:click="#suggestion-component/applyCity?lat=${city.lat}&lon=${city.lon}&name=${encodeURIComponent(city.name ?? "")}&country=${encodeURIComponent(city.country ?? "")}&state=${encodeURIComponent(city.state ?? "")}"
        class="search-item-link"
      >
        <div class="search-item">
          <span class="search-item__title">${place}</span>
          <span class="search-item__subtitle">${subtitle}</span>
        </div>
      </button>
    `;
  }
}
