import { addDays, startOfWeek } from "../lib/date.js";
import { Component } from "./component.js";

export class HeadCalendar extends Component {
  #now = new Date();

  connectedCallback() {
    super.connectedCallback();
    this.#buildbase();
  }

  #buildbase() {
    const start = startOfWeek(this.#now);

    const days = Array.from({ length: 7 }, (_, k) => {
      return Intl.DateTimeFormat(undefined, {
        weekday: "long",
      }).format(addDays(start, k));
    });

    const wrapper = document.createElement("div");
    wrapper.setAttribute("class", "calendar__wrapper-week calendar__head-row");

    const header = document
      .createRange()
      .createContextualFragment(
        days
          .map((day) => `<div class="calendar__day-week">${day}</div>`)
          .join(""),
      );

    wrapper.appendChild(header);
    this.appendChild(wrapper);
  }
}
