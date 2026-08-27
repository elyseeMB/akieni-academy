import { TMDB_IMAGE_BASE } from "../constant.js";
import { Component } from "./component.js";

export class MoviePopover extends Component {
  /** @type {HTMLDivElement} */
  #popover;

  /** @type {HTMLElement | null} */
  #target;

  /** @type {boolean} */
  #isOpen = false;

  /** @type {(e: KeyboardEvent) => void} */
  #onKeyDown;

  /** @type {(e: PointerEvent) => void} */
  #onClickOutside;

  /** @type {() => void} */
  #onScroll;

  /** @type {IntersectionObserver | null} */
  #intersectionObserver = null;

  connectedCallback() {
    this.#popover = document.createElement("div");
    this.#popover.className = "movie-popover";
    this.#popover.dataset.open = "false";
    this.appendChild(this.#popover);
  }

  /**
   * @param {Record<string, any>} data
   * @param {PointerEvent} e
   */
  open(data, e) {
    this.#target = e.target.closest(".calendar__movie") ?? e.target;
    const movie = JSON.parse(data.movie);
    if (!movie) {
      return;
    }

    this.#buildContent(movie);
    this.#popover.dataset.open = "true";

    requestAnimationFrame(() => {
      this.#position();
    });

    this.#listenClose();
    this.#isOpen = true;
  }

  close() {
    if (!this.#isOpen) {
      return;
    }

    this.#popover.dataset.open = "false";
    this.#isOpen = false;
    this.#removeListeners();
  }

  /**
   * @param {Object} movie
   */
  #buildContent(movie) {
    this.#popover.innerHTML = "";

    if (movie.poster_path) {
      const img = document.createElement("img");
      img.className = "movie-popover__poster";
      img.src = `${TMDB_IMAGE_BASE}${movie.poster_path}`;
      img.alt = movie.title;
      this.#popover.appendChild(img);
    }

    const title = document.createElement("div");
    title.className = "movie-popover__title";
    title.textContent = movie.title;
    this.#popover.appendChild(title);

    const genrePill = this.#buildGenrePill();
    if (genrePill) {
      this.#popover.appendChild(genrePill);
    }

    if (movie.release_date) {
      const date = document.createElement("div");
      date.className = "movie-popover__date";
      date.textContent = new Intl.DateTimeFormat("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(movie.release_date));
      this.#popover.appendChild(date);
    }

    if (movie.overview) {
      const overview = document.createElement("div");
      overview.className = "movie-popover__overview";
      overview.textContent =
        movie.overview.length > 120
          ? `${movie.overview.slice(0, 120)}…`
          : movie.overview;
      this.#popover.appendChild(overview);
    }
  }

  /**
   * @returns {HTMLSpanElement | null}
   */
  #buildGenrePill() {
    if (!this.#target) {
      return null;
    }

    const rawColor = this.#target.style.getPropertyValue("--color").trim();
    if (!rawColor) {
      return null;
    }

    const parts = rawColor.split("-").filter(Boolean);
    const rawName = parts.pop() ?? "";
    const name = rawName.replace(")", "");

    if (!name) {
      return null;
    }

    const pill = document.createElement("span");
    pill.className = "movie-popover__genre";
    pill.style.setProperty("--color", rawColor);
    pill.textContent = name;

    return pill;
  }

  #position() {
    const anchor = this.#target;
    if (!anchor) {
      return;
    }

    const rect = anchor.getBoundingClientRect();
    const popoverHeight = this.#popover.offsetHeight;
    const popoverWidth = this.#popover.offsetWidth;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const gap = 8;

    let left = rect.right + gap;
    let top = rect.top + rect.height / 2 - popoverHeight / 2;

    if (left + popoverWidth > viewportWidth) {
      left = rect.left - popoverWidth - gap;
    }

    if (left < 8) {
      left = 8;
    } else if (left + popoverWidth > viewportWidth - 8) {
      left = viewportWidth - popoverWidth - 8;
    }

    if (top < 8) {
      top = 8;
    } else if (top + popoverHeight > viewportHeight - 8) {
      top = viewportHeight - popoverHeight - 8;
    }

    this.#popover.style.top = `${top}px`;
    this.#popover.style.left = `${left}px`;
  }

  /**
   * @returns {number}
   */
  #getFixedOffset() {
    return parseFloat(document.body.style.getPropertyValue("--padding")) || 0;
  }

  #listenClose() {
    this.#removeListeners();

    this.#onKeyDown = (e) => {
      if (e.key === "Escape") {
        this.close();
      }
    };

    this.#onClickOutside = (e) => {
      if (!this.contains(e.target)) {
        this.close();
      }
    };

    this.#onScroll = () => {
      this.#position();
    };

    const offset = this.#getFixedOffset();

    this.#intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          this.close();
        }
      },
      {
        rootMargin: `-${offset}px 0px 0px 0px`,
      },
    );
    this.#intersectionObserver.observe(this.#target);

    document.addEventListener("keydown", this.#onKeyDown);
    document.addEventListener("pointerdown", this.#onClickOutside);
    document.addEventListener("scroll", this.#onScroll, {
      capture: true,
      passive: true,
    });
  }

  #removeListeners() {
    if (this.#onKeyDown) {
      document.removeEventListener("keydown", this.#onKeyDown);
    }
    if (this.#onClickOutside) {
      document.removeEventListener("pointerdown", this.#onClickOutside);
    }
    if (this.#onScroll) {
      document.removeEventListener("scroll", this.#onScroll, {
        capture: true,
      });
    }
    if (this.#intersectionObserver) {
      this.#intersectionObserver.disconnect();
      this.#intersectionObserver = null;
    }
  }
}
