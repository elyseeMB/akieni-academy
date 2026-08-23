import {
  addDays,
  buildYearRanges,
  endOfWeek,
  startOfWeek,
  weeksCount,
} from "../lib/date.js";
import { Component } from "./component.js";
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

  connectedCallback() {
    super.connectedCallback();
    this.#applyPadding();
    this.#build();
    this.#observeResize();
    this.#observeMonths();
  }

  disconnectedCallback() {
    this.#resizeObserver?.disconnect();
    this.#monthObserver?.disconnect();

    if (this.#resizeFrame !== null) {
      cancelAnimationFrame(this.#resizeFrame);
      this.#resizeFrame = null;
    }
  }

  scrollToToday() {
    this.#scrollToCurrentMonth();
  }

  /**
   * Scroll jusqu'au mois courant.
   *
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
   * Recalcule uniquement les dimensions et positions.
   *
   * Aucun DOM n'est recréé ici.
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
      slot.style.transform = `translate3d(0, ${cumulativeOffset}px, 0)`;
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
    if (monthIndex === this.#currentVisibleMonth) {
      return;
    }

    this.#currentVisibleMonth = monthIndex;

    const month = this.#months.get(monthIndex);
    if (!month) {
      return;
    }

    this.#setCurrentMonthLabel(month.start);
    this.querySelectorAll(".calendar__cell").forEach((cell) => {
      const cellMonth = Number(cell.dataset.month);
      cell.classList.toggle("calendar__date-other", cellMonth !== monthIndex);
    });
  }

  #observeMonths() {
    const { total } = this.#getOffsets();

    this.#monthObserver = new IntersectionObserver(
      (entries) => {
        let current = null;
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }

          if (!current || entry.intersectionRatio > current.intersectionRatio) {
            current = entry;
          }
        }

        if (!current) {
          return;
        }

        const monthIndex = Number(current.target.dataset.month);
        this.#setCurrentVisibleMonth(monthIndex);
      },
      {
        rootMargin: `-${total}px 0px -60% 0px`,
        threshold: 0,
      },
    );

    this.querySelectorAll(".calendar__week-slot").forEach((slot) => {
      this.#monthObserver.observe(slot);
    });
  }
}
