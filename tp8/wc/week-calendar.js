import { addDays, startOfMonth } from "../lib/date.js";

export class WeekCalendar {
  today;

  /**
   * @param {Date} today
   */
  constructor(today) {
    this.today = today;
  }

  /**
   * @param {Date} weekStart - lundi de la semaine
   */
  buildWeek(weekStart) {
    const slot = document.createElement("div");
    slot.setAttribute("class", "calendar__week-slot");

    const wrapper = document.createElement("div");
    wrapper.setAttribute("class", "calendar__wrapper-week");

    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      wrapper.appendChild(this.buildCell(date));
    }

    slot.appendChild(wrapper);
    return slot;
  }

  /**
   * @param {Date} date
   */
  buildCell(date) {
    const cell = document.createElement("div");
    cell.setAttribute("class", "calendar__cell");
    cell.dataset.month = date.getMonth();

    const isCurrentDate =
      date.getDate() === this.today.getDate() &&
      date.getMonth() === this.today.getMonth() &&
      date.getFullYear() === this.today.getFullYear();

    const isFirstOfMonth = date.getDate() === 1;
    const dateFormat =
      date.getDate() +
      " " +
      Intl.DateTimeFormat(undefined, { month: "long" }).format(date);

    const dateEl = document.createElement("div");
    dateEl.setAttribute("class", "calendar__date");

    dateEl.textContent = isFirstOfMonth
      ? `${dateFormat}`
      : String(date.getDate());

    if (isCurrentDate) {
      dateEl.classList.add("calendar__date-current");
    }

    cell.appendChild(dateEl);
    return cell;
  }
}
