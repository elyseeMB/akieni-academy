import { getAllCalendarMovies } from "../api.js";
import { moviesStore } from "../events/movies-store.js";
import {
  addDays,
  buildYearRanges,
  endOfWeek,
  startOfWeek,
  weeksCount,
} from "../lib/date.js";
import { Component } from "./component.js";
import { MovieDialog } from "./movie-dialog.js";
import { MovieRenderer } from "./movie-renderer.js";
import { WeekCalendar } from "./week-calendar.js";

export class CalendarMovies extends Component {
  #now = new Date();

  /** @type {Map<number, { start: Date, end: Date }>} */
  #months = new Map();

  /** @type {Map<number, HTMLElement>} */
  #monthWeekStarts = new Map();

  /** @type {HTMLElement} */
  #headerAction = document.querySelector(".header-action");

  /** @type {HTMLElement} */
  #headCalendar = document.querySelector("head-calendar");

  /** @type {ResizeObserver | undefined} */
  #resizeObserver;

  /** @type {IntersectionObserver | undefined} */
  #monthObserver;

  /** @type {number | null} */
  #resizeFrame = null;

  /** @type {number | null} */
  #currentVisibleMonth = null;

  /** @type {Set<string>} */
  #renderedDates = new Set();

  /** @type {Map<string, HTMLElement>} */
  #cellsByDate = new Map();

  /** @type {Set<number>} mois déjà chargés */
  #loadedMonths = new Set();

  /** @type {MovieDialog} */
  #dayDialog;

  /**@type {MovieRenderer} */
  #movieRenderer;

  /** @type {IntersectionObserver | undefined} */
  #preloadObserver;

  #onMoviesUpdate = (e) => this.#applyMovies(e.detail);

  connectedCallback() {
    this.#dayDialog = new MovieDialog(this);
    this.#movieRenderer = new MovieRenderer({
      maxVisible: 2,
      onMore: (cell, movies) => this.#dayDialog.open(movies),
    });

    super.connectedCallback();
    this.#applyPadding();
    this.#build();
    this.#observeResize();
    this.#observeMonths();

    moviesStore.addEventListener("movies:update", this.#onMoviesUpdate);
    const cached = moviesStore.get();
    if (cached) {
      this.#applyMovies(cached);
    }
  }

  disconnectedCallback() {
    this.#resizeObserver?.disconnect();
    this.#monthObserver?.disconnect();
    this.#preloadObserver?.disconnect();
    moviesStore.removeEventListener("update", this.#onMoviesUpdate);

    if (this.#resizeFrame !== null) {
      cancelAnimationFrame(this.#resizeFrame);
      this.#resizeFrame = null;
    }
  }

  scrollToToday() {
    this.#scrollToCurrentMonth();
  }

  /**
   * @param {boolean} smooth
   */
  #scrollToCurrentMonth() {
    const monthIndex = this.#now.getMonth();
    const slotEl = this.#monthWeekStarts.get(monthIndex);
    if (!slotEl) {
      return;
    }

    const { total } = this.#getOffsets();
    const targetY = window.scrollY + slotEl.getBoundingClientRect().top - total;
    window.scrollTo({
      top: targetY,
      behavior: "auto",
    });
  }

  #getOffsets() {
    const headerHeight =
      this.#headerAction?.getBoundingClientRect().height ?? 0;

    const headCalHeight =
      this.#headCalendar?.getBoundingClientRect().height ?? 0;

    return {
      headerHeight,
      headCalHeight,
      total: headerHeight + headCalHeight,
    };
  }

  #applyPadding() {
    const { headerHeight, total } = this.#getOffsets();
    document.body.style.setProperty("--padding", `${total}px`);
    document.body.style.setProperty("--padding-header", `${headerHeight}px`);
  }

  /**
   * Build Struct
   */
  #build() {
    const year = this.#now.getFullYear();
    const months = buildYearRanges(year);

    for (const [monthIndex, { start, end }] of months.entries()) {
      this.#months.set(monthIndex, { start, end });
    }

    const yearStart = startOfWeek(months[0].start);
    const yearEnd = endOfWeek(months[months.length - 1].end);
    const totalWeeks = weeksCount(yearStart, yearEnd);
    const weekBuilder = new WeekCalendar(this.#now);

    let lastMonthIndex = -1;
    for (let w = 0; w < totalWeeks; w++) {
      const weekStart = addDays(yearStart, w * 7);
      const pivotDay = addDays(weekStart, 3);
      const monthIndex = pivotDay.getMonth();
      const slot = weekBuilder.buildWeek(weekStart);

      slot.dataset.week = w;
      slot.dataset.month = monthIndex;

      slot.querySelectorAll(".calendar__cell").forEach((cell) => {
        this.#cellsByDate.set(cell.dataset.date, cell);
      });

      this.appendChild(slot);

      if (monthIndex !== lastMonthIndex) {
        this.#monthWeekStarts.set(monthIndex, slot);
        lastMonthIndex = monthIndex;
      }
    }

    this.#setCurrentVisibleMonth(this.#now.getMonth());
    this.#layout();
  }

  /**
   *
   * @param {{movies: Record<string, any>}} param0
   * @returns {void}
   */
  #applyMovies({ movies }) {
    const byDate = new Map();
    for (const movie of movies) {
      const key = movie.release_date;
      if (!byDate.has(key)) {
        byDate.set(key, []);
      }
      byDate.get(key).push(movie);
    }

    for (const [dateKey, list] of byDate) {
      if (this.#renderedDates.has(dateKey)) {
        continue;
      }

      const cell = this.#cellsByDate.get(dateKey);
      if (!cell) {
        continue;
      }

      this.#movieRenderer.render(cell, list);
      this.#renderedDates.add(dateKey);
    }
  }

  /**
   *@return {void}
   */
  #layout() {
    const { total } = this.#getOffsets();
    const viewportHeight = document.documentElement.clientHeight;
    const availableHeight = Math.max(0, viewportHeight - total);

    const monthWeekCounts = new Map();

    for (const [monthIndex, { start, end }] of this.#months) {
      const monthStart = startOfWeek(start);
      const monthEnd = endOfWeek(end);

      monthWeekCounts.set(monthIndex, weeksCount(monthStart, monthEnd));
    }

    let cumulativeOffset = 0;
    for (const slot of this.querySelectorAll(".calendar__week-slot")) {
      const monthIndex = Number(slot.dataset.month);
      const weekCount = monthWeekCounts.get(monthIndex) ?? 1;
      const rowHeight = availableHeight / weekCount;

      slot.style.setProperty("--height-calc", `${rowHeight}px`);
      slot.style.transform = `translate(0, ${cumulativeOffset}px)`;
      cumulativeOffset += rowHeight;
    }

    this.style.position = "relative";
    this.style.height = `${cumulativeOffset}px`;
  }

  #observeResize() {
    this.#resizeObserver = new ResizeObserver(() => {
      if (this.#resizeFrame !== null) {
        return;
      }

      this.#resizeFrame = requestAnimationFrame(() => {
        this.#resizeFrame = null;
        this.#applyPadding();
        this.#layout();
      });
    });

    this.#resizeObserver.observe(this.#headerAction);
    this.#resizeObserver.observe(this.#headCalendar);
    this.#resizeObserver.observe(document.documentElement);
  }

  /**
   * @param {Date} date
   */
  #setCurrentMonthLabel(date) {
    const label = this.#headerAction?.querySelector(".calendar__current-month");
    if (!label) {
      return;
    }

    label.textContent = Intl.DateTimeFormat(undefined, {
      month: "long",
      year: "numeric",
    }).format(date);
  }

  /**
   * @param {number} monthIndex
   */
  #setCurrentVisibleMonth(monthIndex) {
    const month = this.#months.get(monthIndex);
    if (!month || monthIndex === this.#currentVisibleMonth) {
      return;
    }

    this.#currentVisibleMonth = monthIndex;
    this.#setCurrentMonthLabel(month.start);

    this.querySelectorAll(".calendar__cell").forEach((cell) => {
      const cellMonth = Number(cell.dataset.month);
      cell.classList.toggle("calendar__date-other", cellMonth !== monthIndex);
    });
  }

  #loadMonth(monthIndex) {
    if (this.#loadedMonths.has(monthIndex)) {
      return;
    }
    this.#loadedMonths.add(monthIndex);

    const year = this.#now.getFullYear();
    getAllCalendarMovies(year, monthIndex + 1).then((data) => {
      moviesStore.set(data);
    });
  }

  #observeMonths() {
    this.#monthObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.#setCurrentVisibleMonth(Number(entry.target.dataset.month));
            break;
          }
        }
      },
      {
        rootMargin: "-40% 0px -60% 0px",
        threshold: 0,
      },
    );

    this.#preloadObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.#loadMonth(Number(entry.target.dataset.month));
          }
        }
      },
      {
        rootMargin: "0px 0px 50% 0px",
        threshold: 0,
      },
    );

    this.querySelectorAll(".calendar__week-slot").forEach((slot) => {
      this.#monthObserver.observe(slot);
      this.#preloadObserver.observe(slot);
    });
  }
}
