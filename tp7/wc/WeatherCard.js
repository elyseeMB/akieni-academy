import { Component } from "./component.js";

export class WeatherCard extends Component {
  #count = 5;

  connectedCallback() {
    super.connectedCallback();
    this.#createDays();
  }

  #createDays() {
    const existing = this.querySelectorAll("weather-day");

    if (existing.length) {
      return;
    }

    const frag = document.createDocumentFragment();

    for (let i = 0; i < this.#count; i++) {
      const el = document.createElement("weather-day");
      el.setAttribute("index", i);
      frag.appendChild(el);
    }

    this.appendChild(frag);
  }
}
