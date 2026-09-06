import { debounce } from "../utils/utils.js";

export class PageMeta {
  #favicon;

  #updateTitle = debounce((date) => {
    const month = new Intl.DateTimeFormat("fr", {
      month: "long",
    }).format(date);
    const year = date.getFullYear();
    document.title = `${month} ${year} · Movie Agenda`;
  }, 1000);

  constructor() {
    this.#favicon = document.querySelector('link[rel="icon"]');

    if (!this.#favicon) {
      this.#favicon = document.createElement("link");
      this.#favicon.rel = "icon";
      document.head.appendChild(this.#favicon);
    }
    this.setMonth(new Date());
  }

  setMonth(date) {
    this.#updateTitle(date);
    this.#setFavicon(new Date().getDate());
  }

  #setFavicon(day) {
    const svg = `
     <svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 48 48"
>
  <g transform="rotate(-4 24 20)">
    <rect
      x="7"
      y="4"
      width="32"
      height="34"
      rx="6"
      fill="#171717"
    />
  </g>
  <g transform="rotate(-4 24 27)">
    <rect
      x="5"
      y="11"
      width="38"
      height="34"
      rx="6"
      fill="#fff"
    />
    <path
      d="M5 17
         C5 13.7 7.7 11 11 11
         H37
         C40.3 11 43 13.7 43 17
         V20
         H5Z"
      fill="#171717"
    />
    <text
      x="24"
      y="38"
      text-anchor="middle"
      font-family="Arial, Helvetica, sans-serif"
      font-size="22"
      font-weight="800"
      fill="#171717"
    >${day}</text>
  </g>
</svg>
    `;

    this.#favicon.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }
}
