import { Component } from "./component.js";

const SVG_NS = "http://www.w3.org/2000/svg";

class Shape {
  /**@type {HTMLElement} */
  element;

  /**
   *
   * @param {keyof SVGElementTagNameMap} type
   */
  constructor(type) {
    this.element = document.createElementNS(SVG_NS, type);
  }

  /**
   * @param {string} name
   * @param {string} value
   */
  attr(name, value) {
    this.element.setAttribute(name, value);
    return this;
  }

  /**
   * @param {HTMLElement} parent
   */
  appendTo(parent) {
    parent.appendChild(this.element);
    return this;
  }
}

class Circle extends Shape {
  /**
   *
   * @param {number} cx
   * @param {number} cy
   * @param {number} r
   */
  constructor(cx, cy, r) {
    super("circle");

    this.attr("cx", cx);
    this.attr("cy", cy);
    this.attr("r", r);
  }

  /**
   * @param {string} value
   * @returns {void}
   */
  fill(value) {
    return this.attr("fill", value);
  }

  /**
   * @param {string} value
   * @returns {void}
   */
  stroke(value) {
    return this.attr("stroke", value);
  }

  /**
   * @param {string} value
   * @returns {void}
   */
  strokeWidth(value) {
    return this.attr("stroke-width", value);
  }
}

class Line extends Shape {
  constructor(x1, y1, x2, y2) {
    super("line");

    this.attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2);
  }

  stroke(value) {
    return this.attr("stroke", value);
  }

  strokeWidth(value) {
    return this.attr("stroke-width", value);
  }

  lineCap(value) {
    return this.attr("stroke-linecap", value);
  }
}

class Arc extends Shape {
  constructor(cx, cy, r, startAngle, endAngle) {
    super("path");

    const start = Arc.point(cx, cy, r, startAngle);
    const end = Arc.point(cx, cy, r, endAngle);

    const angle = endAngle - startAngle;

    const largeArcFlag = Math.abs(angle) > Math.PI ? 1 : 0;

    const sweepFlag = 1;

    const d = `
          M ${start.x} ${start.y}
          A ${r} ${r}
            0 ${largeArcFlag}
            ${sweepFlag}
            ${end.x} ${end.y}
        `;

    this.attr("d", d);
  }

  /**
   *
   * @param {number} cx
   * @param {number} cy
   * @param {number} r
   * @param {number} angle
   */
  static point(cx, cy, r, angle) {
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  }

  fill(value) {
    return this.attr("fill", value);
  }

  stroke(value) {
    return this.attr("stroke", value);
  }

  strokeWidth(value) {
    return this.attr("stroke-width", value);
  }

  lineCap(value) {
    return this.attr("stroke-linecap", value);
  }
}

export class TemperatureComponent extends Component {
  static observedAttributes = ["value"];

  constructor() {
    super();

    this.attachShadow({
      mode: "open",
    });
    // Dimensions
    this.size = 320;

    // Centre du cercle
    this.cx = this.size / 2;
    this.cy = this.size / 2;

    // Rayon
    this.radius = 110;

    // Température
    this.min = -20;
    this.max = 40;

    // Arc visuel :
    // -135° → +135°
    this.startAngle = this.degToRad(-135);
    this.endAngle = this.degToRad(135);

    this.temperature = 0;
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
    this.temperature = this.getTemperature();

    this.render();
  }

  getTemperature() {
    const value = Number(this.getAttribute("value"));

    if (Number.isNaN(value)) {
      return 0;
    }

    return Math.min(this.max, Math.max(this.min, value));
  }

  // ==========================================================
  // Degrees → radians
  // ==========================================================

  degToRad(degrees) {
    return (degrees * Math.PI) / 180;
  }

  // ==========================================================
  // Temperature → 0..1
  // ==========================================================

  temperatureToProgress(temperature) {
    return (temperature - this.min) / (this.max - this.min);
  }

  // ==========================================================
  // Temperature → angle
  // ==========================================================

  temperatureToAngle(temperature) {
    const progress = this.temperatureToProgress(temperature);

    return this.startAngle + progress * (this.endAngle - this.startAngle);
  }

  // ==========================================================
  // Angle + radius → X/Y
  //
  // C'EST LE CŒUR DU SYSTÈME
  // ==========================================================

  pointOnCircle(radius, angle) {
    return {
      x: this.cx + radius * Math.cos(angle),

      y: this.cy + radius * Math.sin(angle),
    };
  }

  // ==========================================================
  // SVG
  // ==========================================================

  createSVG() {
    const svg = document.createElementNS(SVG_NS, "svg");

    svg.setAttribute("viewBox", `0 0 ${this.size} ${this.size}`);

    return svg;
  }

  // ==========================================================
  // Gradient
  // ==========================================================

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
      ["0%", "#38bdf8"],
      ["35%", "#22c55e"],
      ["65%", "#facc15"],
      ["100%", "#ef4444"],
    ];

    for (const [offset, color] of stops) {
      const stop = document.createElementNS(SVG_NS, "stop");
      stop.setAttribute("offset", offset);
      stop.setAttribute("stop-color", color);
      gradient.appendChild(stop);
    }

    defs.appendChild(gradient);
    svg.appendChild(defs);
  }

  // ==========================================================
  // Background circle
  // ==========================================================

  createBackground(svg) {
    new Circle(this.cx, this.cy, this.radius)
      .fill("none")
      .stroke("#1e293b")
      .attr("opacity", 0.1)
      .strokeWidth(18)
      .appendTo(svg);
  }

  // ==========================================================
  // Temperature arc
  // ==========================================================

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

  // ==========================================================
  // Graduations
  // ==========================================================

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

  // ==========================================================
  // Labels
  // ==========================================================

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

  // ==========================================================
  // Needle
  // ==========================================================

  createCenterContent(svg) {
    const date = new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(new Date());

    // ----------------------------------------------------------
    // Température
    // ----------------------------------------------------------

    const temperature = document.createElementNS(SVG_NS, "text");

    temperature.setAttribute("x", this.cx);

    temperature.setAttribute("y", this.cy + 20);

    temperature.setAttribute("text-anchor", "middle");

    temperature.setAttribute("fill", "black");

    temperature.setAttribute("font-size", "90");

    temperature.setAttribute("font-weight", "700");

    temperature.textContent = `${this.temperature}°`;

    svg.appendChild(temperature);

    // ----------------------------------------------------------
    // Date
    // ----------------------------------------------------------

    const dateText = document.createElementNS(SVG_NS, "text");

    dateText.setAttribute("x", this.cx);

    dateText.setAttribute("y", this.cy + 45);

    dateText.setAttribute("text-anchor", "middle");

    dateText.setAttribute("fill", "#64748b");

    dateText.setAttribute("font-size", "11");

    dateText.setAttribute("font-weight", "500");

    dateText.textContent = date;

    svg.appendChild(dateText);
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

  // ==========================================================
  // Temperature text
  // ==========================================================

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

  // ==========================================================
  // Render
  // ==========================================================

  render() {
    this.shadowRoot.innerHTML = `
    <style>
      :host {
        display: block;
        width: 320px;
        height: 320px;
      }

      svg {
        display: block;
        width: 100%;
        height: 100%;
      }
    </style>
  `;

    const svg = this.createSVG();

    // this.createBackground(svg);

    this.createTemperatureArc(svg);

    this.createTicks(svg);

    this.createCenterContent(svg);

    this.createGradient2(svg);

    this.shadowRoot.appendChild(svg);
  }
}
