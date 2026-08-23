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

  #resizeObserver;
  #monthObserver;
  #currentVisibleMonth = null;

  connectedCallback() {
    super.connectedCallback();
    this.#applyPadding();
    this.#buildbase();
    this.#observeResize();
    this.#observeMonths();
  }

  disconnectedCallback() {
    this.#resizeObserver?.disconnect();
    this.#monthObserver?.disconnect();
  }

  scrollToToday() {
    this.#scrollToCurrentMonth(true);
  }

  /**
   * @param {boolean} smooth
   */
  #scrollToCurrentMonth(smooth = true) {
    const monthIndex = this.#now.getMonth();
    const slotEl = this.#monthWeekStarts.get(monthIndex);

    if (!slotEl) {
      return;
    }

    const { total } = this.#getOffsets();
    const targetY = window.scrollY + slotEl.getBoundingClientRect().top - total;
    window.scrollTo({ top: targetY, behavior: smooth ? "smooth" : "auto" });
  }

  #observeResize() {
    this.#resizeObserver = new ResizeObserver(() => this.#rebuild());
    this.#resizeObserver.observe(this.#headerAction);
    this.#resizeObserver.observe(this.#headCalendar);
    this.#resizeObserver.observe(document.documentElement);
  }

  #rebuild() {
    this.#monthObserver?.disconnect();
    this.innerHTML = "";
    this.#months.clear();
    this.#monthWeekStarts.clear();
    this.#currentVisibleMonth = null;
    this.#applyPadding();
    this.#buildbase();
    this.#observeMonths();
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
    document.body.setAttribute(
      "style",
      `--padding:${total}px; --padding-header:${headerHeight}px`,
    );
  }

  #buildbase() {
    const year = this.#now.getFullYear();
    const months = buildYearRanges(year);

    months.forEach(({ start, end }, monthIndex) => {
      this.#months.set(monthIndex, { start, end });
    });

    const { total } = this.#getOffsets();
    const viewport = document.documentElement.clientHeight;
    const availableHeight = viewport - total;

    const weekCounts = months.map(({ start, end }) => {
      const s = startOfWeek(start);
      const e = endOfWeek(end);
      return weeksCount(s, e);
    });

    const yearStart = startOfWeek(months[0].start);
    const yearEnd = endOfWeek(months[months.length - 1].end);
    const totalWeeks = weeksCount(yearStart, yearEnd);

    const weekBuilder = new WeekCalendar(this.#now);

    let cumulativeOffset = 0;
    let lastMonthIndex = -1;

    for (let w = 0; w < totalWeeks; w++) {
      const weekStart = addDays(yearStart, w * 7);
      const pivotDay = addDays(weekStart, 3);
      const monthIndex = pivotDay.getMonth();
      const monthWeekCount = weekCounts[monthIndex] || 1;
      const rowHeight = availableHeight / monthWeekCount;

      const slot = weekBuilder.buildWeek(weekStart);

      slot.dataset.week = w;
      slot.dataset.month = monthIndex;
      slot.style.setProperty("--height-calc", `${rowHeight}px`);
      slot.style.transform = `translate(0, ${cumulativeOffset}px)`;

      this.appendChild(slot);

      if (monthIndex !== lastMonthIndex) {
        this.#monthWeekStarts.set(monthIndex, slot);
        lastMonthIndex = monthIndex;
      }

      cumulativeOffset += rowHeight;
    }

    this.style.position = "relative";
    this.style.height = `${cumulativeOffset}px`;

    this.#setCurrentVisibleMonth(this.#now.getMonth());
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

    const { start } = this.#months.get(monthIndex);
    this.#setCurrentMonthLabel(start);

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

    this.querySelectorAll(".calendar__week-slot").forEach((el) => {
      this.#monthObserver.observe(el);
    });
  }
}
