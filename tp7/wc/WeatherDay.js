import { Component } from "./component.js";

const tpl = document.getElementById("weather-day-tpl");

export class WeatherDay extends Component {
  static observedAttributes = ["index"];

  #index = 0;

  #forecast = null;

  #days = [];

  get index() {
    return this.#index;
  }

  set index(value) {
    this.#index = Number(value) || 0;
  }

  attributeChangedCallback(name) {
    if (name !== "index") {
      return;
    }

    this.#index = Number(this.getAttribute("index")) || 0;
  }

  constructor() {
    super();

    if (tpl) {
      this.attachShadow({ mode: "open" }).append(tpl.content.cloneNode(true));
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.#showSkeleton();

    this._onWeather = this.#onWeather.bind(this);
    window.addEventListener("weather:all", this._onWeather);
  }

  disconnectedCallback() {
    window.removeEventListener("weather:all", this._onWeather);
  }

  #onWeather(e) {
    this.#forecast = e.detail.forecast;
    this.#groupByDay();
    this.#update();
  }

  #groupByDay() {
    if (!this.#forecast?.list) {
      this.#days = [];
      return;
    }

    const map = new Map();

    for (const entry of this.#forecast.list) {
      const date = new Date(entry.dt * 1000);
      const key = date.toDateString();

      if (!map.has(key)) {
        map.set(key, []);
      }

      map.get(key).push({
        date,
        temp: entry.main.temp - 273.15,
        icon: entry.weather?.[0]?.icon ?? "01d",
        description: entry.weather?.[0]?.description ?? "",
      });
    }

    this.#days = [...map.values()].slice(0, 5);
  }

  #getDayData() {
    if (this.#index < 0 || this.#index >= this.#days.length) {
      return null;
    }

    const entries = this.#days[this.#index];
    const temps = entries.map((e) => e.temp);
    const min = Math.round(Math.min(...temps));
    const max = Math.round(Math.max(...temps));

    const midday = entries[Math.floor(entries.length / 2)];

    return {
      date: midday.date,
      icon: midday.icon,
      description: midday.description,
      min,
      max,
    };
  }

  #update() {
    const day = this.#getDayData();

    if (!day) return;

    const { refs } = this;

    for (const key of ["day", "icon", "temp", "desc"]) {
      this.refs[key]?.classList.remove("skeleton");
    }

    refs.day.textContent = new Intl.DateTimeFormat("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }).format(day.date);

    refs.icon.style.backgroundImage = `url(https://openweathermap.org/img/wn/${day.icon}@2x.png)`;
    refs.icon.title = day.description;

    refs.max.textContent = day.max;
    refs.min.textContent = day.min;

    refs.desc.textContent = day.description;
  }

  #showSkeleton() {
    for (const key of ["day", "icon", "temp", "desc"]) {
      this.refs[key]?.classList.add("skeleton");
    }
  }
}
