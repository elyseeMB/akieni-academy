import { Component } from "./component.js";
import { TemperatureCurve } from "./Shape/Curve.js";

const SVG_NS = "http://www.w3.org/2000/svg";

export class CalendarWeather extends Component {
  /** @type {Map<Date, Date[]>} */
  #ranges = new Map();

  /** @type {number} */
  #height = 120;

  /** width tick */
  #hourWidth = 32;

  /** days */
  #days = 5;

  /** @type {Array<{date: Date, temp: number, icon?: string}>} */
  hours = [];

  /** @type {Array<{date: Date, temp: number}>} */
  historyHours = [];

  min = -20;
  max = 40;

  /** selected index */
  activeIndex = -1;

  /** current index/position */
  nowIndex = null;

  _observer = null;

  static observedAttributes = ["data"];

  constructor() {
    super();

    this.attachShadow({
      mode: "open",
    });
  }

  connectedCallback() {
    this._onWeather = this.#onWeather.bind(this);
    window.addEventListener("weather:all", this._onWeather);

    this.#buildMeta();
    this.render();
  }

  disconnectedCallback() {
    this._observer?.disconnect();
    window.removeEventListener("weather:all", this._onWeather);
  }

  // HISTOIRE R2 — uniquement pour Brazzaville (celle-ci est fournie via weather:all)
  #setHistory(data) {
    this.historyHours = (data ?? []).map((entry) => ({
      date: new Date(entry.dt),
      temp: entry.temp,
      icon: entry.icon || "01d",
    }));
  }

  #onWeather(e) {
    const { forecast, history, withHistory } = e.detail;
    if (withHistory) {
      this.#setHistory(history);
    } else {
      this.historyHours = [];
    }
    this.data = forecast;
  }

  attributeChangedCallback(name) {
    if (name !== "data") {
      return;
    }

    this.hydrate();

    if (this.isConnected) {
      this.#buildMeta();
      this.render();
    }
  }

  // META
  #buildMeta() {
    const start = new Date();

    start.setHours(0, 0, 0, 0);

    this.#ranges.clear();

    for (let day = 0; day < this.#days; day++) {
      const date = new Date(start);

      date.setDate(start.getDate() + day);

      const hours = [];

      for (let hour = 0; hour < 24; hour++) {
        const value = new Date(date);

        value.setHours(hour, 0, 0, 0);

        hours.push(value);
      }

      this.#ranges.set(date, hours);
    }

    return this.#ranges;
  }

  // SVG
  #createSVG() {
    const width = this.#days * 24 * this.#hourWidth;

    const svg = document.createElementNS(SVG_NS, "svg");

    svg.setAttribute("viewBox", `0 0 ${width} ${this.#height}`);

    svg.setAttribute("width", width);

    svg.setAttribute("height", this.#height);

    svg.style.width = `${width}px`;
    svg.style.maxWidth = "none";

    return svg;
  }

  // X POSITION
  #hourToX(index) {
    return index * this.#hourWidth;
  }

  // MAIN TICKS
  #createTicks(svg) {
    let index = 0;

    for (const [date, hours] of this.#ranges) {
      for (let hour = 0; hour < hours.length; hour++) {
        const current = hours[hour];

        const x = this.#hourToX(index);

        const isDayStart = hour === 0;

        this.#createTick(svg, {
          x,
          date,
          current,
          hour,
          isDayStart,
          index,
        });

        index++;
      }
    }
  }

  // TICK
  #createTick(svg, { x, date, current, hour, isDayStart, index }) {
    const line = document.createElementNS(SVG_NS, "line");

    const top = isDayStart ? 25 : 55;

    const bottom = 85;

    line.setAttribute("x1", x);

    line.setAttribute("y1", top);

    line.setAttribute("x2", x);

    line.setAttribute("y2", bottom);

    line.setAttribute("stroke", isDayStart ? "#ffffff" : "#64748b");

    line.setAttribute("stroke-width", isDayStart ? 3 : 1.5);

    svg.appendChild(line);

    if (!isDayStart) {
      this.#createHourLabel(svg, x, hour);
    }

    if (isDayStart) {
      this.#createDateLabel(svg, x, date);
    }
  }

  // LABELS DATE
  #createDateLabel(svg, x, date) {
    const text = document.createElementNS(SVG_NS, "text");

    text.setAttribute("x", x);
    text.setAttribute("y", 18);
    text.setAttribute("fill", "#ffffff");
    text.setAttribute("font-size", 13);
    text.setAttribute("font-weight", 600);

    text.textContent = new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
    }).format(date);

    svg.appendChild(text);
  }

  #createCurrentHourLabel(svg, x, date) {
    const text = document.createElementNS(SVG_NS, "text");

    text.setAttribute("x", x);
    text.setAttribute("y", 10);
    text.setAttribute("fill", "#ffffff");
    text.setAttribute("font-size", 13);
    text.setAttribute("font-weight", 600);

    text.textContent = new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);

    svg.appendChild(text);
  }

  #createHourLabel(svg, x, hour) {
    const text = document.createElementNS(SVG_NS, "text");

    text.setAttribute("x", x);
    text.setAttribute("y", 105);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("fill", "var(--color-background)");
    text.setAttribute("font-size", 10);

    text.textContent = `${String(hour).padStart(2, "0")}`;

    svg.appendChild(text);
  }

  // CURRENT HOUR
  #createCurrentHour(svg) {
    const now = new Date();

    const start = [...this.#ranges.values()][0][0];

    const diff = now.getTime() - start.getTime();

    const hour = diff / (1000 * 60 * 60);

    this.nowIndex = hour;

    const x = this.#hourToX(hour);

    const line = document.createElementNS(SVG_NS, "line");

    line.setAttribute("x1", x);
    line.setAttribute("y1", 20);
    line.setAttribute("x2", x);
    line.setAttribute("y2", 90);
    line.setAttribute("stroke", "#ef4444");
    line.setAttribute("stroke-width", 3);
    line.setAttribute("stroke-linecap", "round");

    this.#createCurrentHourLabel(svg, x, new Date());

    svg.appendChild(line);
  }

  // LABELS

  #createTemperatureLabel(svg, x, y, temp, color = "#facc15") {
    const text = document.createElementNS(SVG_NS, "text");

    text.setAttribute("x", x);
    text.setAttribute("y", y - 10);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("fill", color);
    text.setAttribute("font-size", 11);
    text.setAttribute("font-weight", 600);

    text.textContent = `${Math.round(temp)}°`;

    svg.appendChild(text);
  }

  // DATA
  set data(value) {
    this._raw = value;

    this.hydrate();

    if (this.isConnected) {
      this.#buildMeta();
      this.render();
    }
  }

  get data() {
    return this._raw;
  }

  hydrate() {
    if (!this._raw?.list) {
      this.hours = [];
      return;
    }

    this.hours = this._raw.list.map((entry) => ({
      date: new Date(entry.dt * 1000),
      temp: entry.main.temp - 273.15,
      icon: entry.weather?.[0]?.icon ?? "01d",
    }));
  }

  // ==========================================================
  // TEMPERATURE CURVE
  // ==========================================================

  #tempToY(temp) {
    const ratio = (temp - this.min) / (this.max - this.min);

    const clamped = Math.min(Math.max(ratio, 0), 1);

    return this.#height - clamped * this.#height;
  }

  #createTemperatureLine(svg) {
    if (!this.hours.length && !this.historyHours.length) {
      return;
    }

    const start = [...this.#ranges.values()][0][0];

    //  (Données R2)
    if (this.historyHours.length) {
      const historyPoints = this.historyHours.map(({ date, temp, icon }) => {
        const diff = date.getTime() - start.getTime();
        const hourIndex = diff / (1000 * 60 * 60);

        return {
          x: this.#hourToX(hourIndex),
          y: this.#tempToY(temp),
          temp,
          icon: icon || "01d",
        };
      });

      const historyCurve = new TemperatureCurve({
        height: this.#height,
        color: "#64748b",
        gradientId: "historyGradient",
      });

      historyCurve.draw(svg, historyPoints);
    }

    const historyPoints = this.historyHours.map(({ date, temp, icon }) => {
      const diff = date.getTime() - start.getTime();
      const hourIndex = diff / (1000 * 60 * 60);

      return {
        x: this.#hourToX(hourIndex),
        y: this.#tempToY(temp),
        temp,
        icon: icon || "01d",
      };
    });

    const historyCurve = new TemperatureCurve({
      height: this.#height,
      color: "#2bd0ff",
      gradientId: "historyGradient",
    });

    historyCurve.draw(svg, historyPoints);

    historyPoints.forEach((p) => {
      this.#createTemperatureLabel(svg, p.x, p.y, p.temp, "#2bd0ff");
    });

    // ++++++++++++++++++++++++++++++++++++++++++

    //  (Données API)
    if (this.hours.length) {
      const forecastPoints = this.hours.map(({ date, temp, icon }) => {
        const diff = date.getTime() - start.getTime();
        const hourIndex = diff / (1000 * 60 * 60);

        return {
          x: this.#hourToX(hourIndex),
          y: this.#tempToY(temp),
          temp,
          icon,
        };
      });

      const forecastCurve = new TemperatureCurve({
        height: this.#height,
        color: "#facc15",
        gradientId: "forecastGradient",
      });

      forecastCurve.draw(svg, forecastPoints);

      forecastPoints.forEach((p) => {
        this.#createTemperatureLabel(svg, p.x, p.y, p.temp, "#facc15");
      });
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
    <style>
      :host {
        display: block;
        width: 100%;
        min-width: 0;
      }

      ::-webkit-scrollbar {
          display: none;
      }

      .viewport {
        width: 100%;
        margin: 0 auto;
        min-width: 0;
        overflow-x: auto;
        overflow-y: hidden;
        scroll-snap-type: x proximity;
        padding-inline: 2rem;
        padding-top: 2.5rem;
      }

      .day {
        scroll-snap-align: start;
      }

      svg {
        display: block;
        width: 2880px;
        max-width: none;
        flex: none;
        overflow: visible;
      }
    </style>

    <div class="viewport"></div>
  `;

    const viewport = this.shadowRoot.querySelector(".viewport");

    const svg = this.#createSVG();

    this.#createTemperatureLine(svg);

    this.#createTicks(svg);
    this.#createCurrentHour(svg);

    viewport.appendChild(svg);
  }
}
