import { Component } from "./component.js";
import { Arc } from "./Shape/Arc.js";
import { Circle } from "./Shape/Circle.js";
import { Line } from "./Shape/Line.js";
import { SVG_NS } from "./Shape/Shape.js";

export class TemperatureComponent extends Component {
  static observedAttributes = ["value"];

  constructor() {
    super();

    this.attachShadow({
      mode: "open",
    });
    // Dimensions
    this.size = 320;

    // center circle
    this.cx = this.size / 2;
    this.cy = this.size / 2;

    // R
    this.radius = 110;

    // Temp
    this.min = -20;
    this.max = 40;

    // -135° → +135°
    this.startAngle = this.degToRad(-135);
    this.endAngle = this.degToRad(135);

    this.temperature = 0;
    this.current = null;
  }

  set data(data) {
    if (!data || !data.main) return;

    this.current = data;
    const tempInCelsius = Math.round(data.main.temp - 273.15);

    this.setAttribute("value", tempInCelsius);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name !== "value") {
      return;
    }

    this.temperature = this.getTemperature();

    if (this.isConnected) {
      this.render();
    }
  }

  connectedCallback() {
    this._onWeather = this.#onWeather.bind(this);
    window.addEventListener("weather:all", this._onWeather);

    this.temperature = this.getTemperature();

    this.render();
  }

  disconnectedCallback() {
    window.removeEventListener("weather:all", this._onWeather);
  }

  #onWeather(e) {
    this.data = e.detail.current;
  }

  getTemperature() {
    const value = Number(this.getAttribute("value"));

    if (Number.isNaN(value)) {
      return 0;
    }

    return Math.min(this.max, Math.max(this.min, value));
  }

  // Degrees → radians

  degToRad(degrees) {
    return (degrees * Math.PI) / 180;
  }

  // Temperature → 0..1

  temperatureToProgress(temperature) {
    return (temperature - this.min) / (this.max - this.min);
  }

  // Temperature

  temperatureToAngle(temperature) {
    const progress = this.temperatureToProgress(temperature);

    return this.startAngle + progress * (this.endAngle - this.startAngle);
  }

  pointOnCircle(radius, angle) {
    return {
      x: this.cx + radius * Math.cos(angle),

      y: this.cy + radius * Math.sin(angle),
    };
  }

  // SVG

  createSVG() {
    const svg = document.createElementNS(SVG_NS, "svg");

    svg.setAttribute("viewBox", `0 0 ${this.size} ${this.size}`);

    return svg;
  }

  // Gradient

  createGradient2(svg) {
    this.buildGradient(svg, "temperature-gradient-2");
  }

  createGradient(svg) {
    this.buildGradient(svg, "temperature-gradient-1");
  }

  buildGradient(svg, id) {
    const defs = document.createElementNS(SVG_NS, "defs");
    const gradient = document.createElementNS(SVG_NS, "linearGradient");

    gradient.id = id;
    gradient.setAttribute("x1", "0%");
    gradient.setAttribute("y1", "0%");
    gradient.setAttribute("x2", "100%");
    gradient.setAttribute("y2", "100%");

    const stops = [
      ["0%", "#94a3b8", 0.35],
      ["50%", "#e2e8f0", 0.85],
      ["100%", "#f8fafc", 1],
    ];

    for (const [offset, color, opacity] of stops) {
      const stop = document.createElementNS(SVG_NS, "stop");
      stop.setAttribute("offset", offset);
      stop.setAttribute("stop-color", color);
      stop.setAttribute("stop-opacity", opacity);
      gradient.appendChild(stop);
    }

    defs.appendChild(gradient);
    svg.appendChild(defs);
  }

  // Background circle

  createBackground(svg) {
    new Circle(this.cx, this.cy, this.radius)
      .fill("none")
      .stroke("#1e293b")
      .attr("opacity", 0.1)
      .strokeWidth(18)
      .appendTo(svg);
  }

  // Temperature arc

  createTemperatureArc(svg) {
    const temperatureAngle = this.temperatureToAngle(this.temperature);

    // Premier arc (ex: principal / externe)
    new Arc(this.cx, this.cy, this.radius, this.startAngle, temperatureAngle)
      .fill("none")
      .stroke("url(#temperature-gradient-1)")
      .strokeWidth(12)
      .lineCap("round")
      .appendTo(svg);

    const offsetRadius = this.radius - 4;

    new Arc(this.cx, this.cy, offsetRadius, this.startAngle, temperatureAngle)
      .fill("none")
      .stroke("url(#temperature-gradient-2)")
      .strokeWidth(8)
      .lineCap("round")
      .appendTo(svg);
  }

  // Graduations

  createTicks(svg) {
    const tickCount = this.max - this.min + 1;

    const outerRadius = 132;
    const innerRadius = 119;

    const currentTemperature = Math.round(this.temperature);

    for (let i = 0; i < tickCount; i++) {
      const temperature = this.min + i;

      const progress = this.temperatureToProgress(temperature);

      const angle =
        this.startAngle + progress * (this.endAngle - this.startAngle);

      const isActive = temperature === currentTemperature;

      const isMajor = temperature % 10 === 0;

      const r1 = isActive
        ? outerRadius + 16
        : isMajor
          ? outerRadius
          : outerRadius - 6;

      const r2 = isMajor ? innerRadius - 5 : innerRadius;

      const p1 = this.pointOnCircle(r1, angle);

      const p2 = this.pointOnCircle(r2, angle);

      const opacity = isActive ? 1 : 0.25 + progress * 0.5;

      new Line(p1.x, p1.y, p2.x, p2.y)
        .stroke("black")
        .strokeWidth(isActive ? 4 : isMajor ? 2 : 0.5)
        .lineCap("round")
        .attr("opacity", opacity)
        .appendTo(svg);

      // ----------------------------------------------------------
      // Labels
      // ----------------------------------------------------------

      if (isMajor || isActive) {
        this.createLabel(svg, temperature, angle, isActive);
      }
    }
  }

  // Labels

  createLabel(svg, temperature, angle, active = false) {
    const position = this.pointOnCircle(active ? 96 : 92, angle);

    const text = document.createElementNS(SVG_NS, "text");

    text.setAttribute("x", position.x);

    text.setAttribute("y", position.y);

    text.setAttribute("text-anchor", "middle");

    text.setAttribute("dominant-baseline", "middle");

    text.setAttribute("fill", "black");

    text.setAttribute("font-size", active ? "0" : "10");

    text.setAttribute("font-weight", active ? "700" : "400");

    text.setAttribute("opacity", active ? "1" : "0.5");

    text.textContent = `${temperature}°`;

    svg.appendChild(text);
  }

  // Needle

  createCenterContent() {
    const hasData = !!this.current;

    const city = this.current?.name ?? "";
    const country = this.current?.sys?.country ?? "";
    const cityText = [city, country].filter(Boolean).join(", ");
    const wind = this.current?.wind?.speed ?? 0;

    const date = new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(new Date());

    const cityHTML = hasData
      ? `<div class="city">${cityText}</div>`
      : `<div class="skeleton skeleton-city"></div>`;

    const windHTML = hasData
      ? `<div class="wind">
           <svg class="wind-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
             <path d="M12.8 19.6A2 2 0 1 0 14 16H2"/>
             <path d="M17.5 8a2.5 2.5 0 1 1 2 4H2"/>
             <path d="M9.8 4.4A2 2 0 1 1 11 8H2"/>
           </svg>
           <span>${wind} m/s</span>
         </div>`
      : `<div class="skeleton skeleton-wind"></div>`;

    return `
      <div class="center">
        ${cityHTML}
        <div class="temp">${this.temperature}°</div>
        ${windHTML}
        <div class="date">${date}</div>
      </div>
    `;
  }

  createNeedle(svg) {
    const angle = this.temperatureToAngle(this.temperature);

    // Pointe
    const tip = this.pointOnCircle(104, angle);

    // Base gauche
    const left = this.pointOnCircle(12, angle + Math.PI / 2);

    // Base droite
    const right = this.pointOnCircle(12, angle - Math.PI / 2);

    const polygon = document.createElementNS(SVG_NS, "polygon");

    polygon.setAttribute(
      "points",
      [
        `${tip.x},${tip.y}`,
        `${left.x},${left.y}`,
        `${right.x},${right.y}`,
      ].join(" "),
    );

    polygon.setAttribute("fill", "#ffffff");

    svg.appendChild(polygon);

    // Centre de l'aiguille

    new Circle(this.cx, this.cy, 12)
      .fill("#0f172a")
      .stroke("#ffffff")
      .strokeWidth(4)
      .appendTo(svg);

    new Circle(this.cx, this.cy, 4).fill("#ffffff").appendTo(svg);
  }

  // Temperature text

  createTemperatureText(svg) {
    const text = document.createElementNS(SVG_NS, "text");

    text.setAttribute("x", this.cx);

    text.setAttribute("y", this.cy);

    text.setAttribute("text-anchor", "middle");

    text.setAttribute("fill", "#000");

    text.setAttribute("font-size", "42");

    text.setAttribute("font-weight", "700");

    text.textContent = `${this.temperature}°`;

    svg.appendChild(text);

    const label = document.createElementNS(SVG_NS, "text");

    label.setAttribute("x", this.cx);

    label.setAttribute("y", this.cy + 20);

    label.setAttribute("text-anchor", "middle");

    label.setAttribute("fill", "#64748b");

    label.setAttribute("font-size", "11");

    label.textContent = "TEMPÉRATURE";

    svg.appendChild(label);
  }

  temperatureOpacity(temperature) {
    const progress = this.temperatureToProgress(temperature);

    // Entre 0.25 et 0.85
    return 0.25 + progress * 0.6;
  }

  // Render

  render() {
    this.shadowRoot.innerHTML = `
    <style>
      :host {
        position: relative;
        display: block;
        width: 320px;
        height: 320px;
      }

      svg {
        display: block;
        width: 100%;
        height: 100%;
      }

      .center {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.25rem;
        pointer-events: none;
      }

      .city {
        font-size: 0.85rem;
        font-weight: 600;
        color: #e2e8f0;
        text-transform: capitalize;
      }

      .temp {
        font-size: 3.25rem;
        font-weight: 700;
        color: #f8fafc;
        line-height: 1;
      }

      .wind {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.8rem;
        color: #94a3b8;
      }

      .wind-icon {
        width: 16px;
        height: 16px;
      }

      .date {
        font-size: 0.7rem;
        color: #64748b;
      }

      .skeleton {
        position: relative;
        overflow: hidden;
        background-color: rgba(255, 255, 255, 0.06);
        border-radius: 4px;
      }
      .skeleton::after {
        content: "";
        position: absolute;
        inset: 0;
        transform: translateX(-100%);
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.14), transparent);
        animation: skeleton-shimmer 1.5s infinite;
      }
      @keyframes skeleton-shimmer {
        100% { transform: translateX(100%); }
      }
      .skeleton-city { width: 130px; height: 14px; }
      .skeleton-wind { width: 90px; height: 14px; }
    </style>
  `;

    const svg = this.createSVG();

    // this.createGradient(svg);
    this.createGradient2(svg);
    this.createTemperatureArc(svg);
    this.createTicks(svg);

    this.shadowRoot.appendChild(svg);

    const overlay = document.createElement("div");
    overlay.innerHTML = this.createCenterContent();
    this.shadowRoot.appendChild(overlay.firstElementChild);
  }
}
