import { distanceSquared, normalVec } from "../lib/2d.js";
import { getSkyPalette } from "../lib/color.js";
import { randomInt } from "../lib/number.js";

export class AnimatedHero extends HTMLElement {
  /**
   *
   * @param {HTMLCanvasElement} canvas
   */
  canvas;
  /**@type {Shape[]} */
  shapes;
  /**@type {boolean} */
  #running = false;

  connectedCallback() {
    this.canvas = document.createElement("canvas");
    this.canvas.setAttribute("class", "canvas-wrapper");
    this.canvas.style.setProperty("background", "#F8FAF4");
    this.append(this.canvas);

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    // Shape
    const colors = ["#60a5fa", "#3b82f6", "#818cf8", "#6366f1"];
    this.shapes = [];
    for (let i = 0; i < 4; i++) {
      const color = colors[i];
      this.shapes.push(new Shape(this.canvas, color));
    }

    // Ring
    this.ringGroup = new RingGroupPosition(this.canvas);

    this.rings = [];
    for (let i = 0; i < 7; i++) {
      this.rings.push(new Ring(this.canvas, i, this.ringGroup));
    }

    this._onWeather = this.#onWeather.bind(this);
    window.addEventListener("weather:all", this._onWeather);

    this.canvas.animate(
      [
        {
          opacity: 0,
        },
        {
          opacity: 1,
        },
      ],
      { duration: 1000 },
    );

    this._onVisibility = this.#onVisibility.bind(this);
    window.addEventListener("resize", this.resize);
    window.addEventListener("visibilitychange", this._onVisibility);

    this.#running = true;
    this.draw();
  }

  #onVisibility() {
    if (document.hidden) {
      this.#running = false;
    } else if (!this.#running) {
      this.#running = true;
      this.draw();
    }
  }

  #onWeather(e) {
    const { sunrise, sunset } = e.detail.current?.sys ?? {};
    if (!sunrise || !sunset) {
      return;
    }

    const palette = getSkyPalette({ sunrise, sunset });
    this.canvas.style.background = palette.background;

    this.shapes.forEach((shape, i) => {
      shape.color = palette.shapes[i];
    });

    for (const ring of this.rings) {
      ring.setColor(palette.ring);
    }
  }

  draw() {
    /**@type {CanvasRenderingContext2D} */
    const ctx = this.canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.save();
    ctx.globalCompositeOperation = "source-over";

    for (const shape of this.shapes) {
      shape.draw();
    }

    // this.ringGroup.update();
    // for (const ring of this.rings) {
    //   ring.draw();
    // }

    this.dispatchEvent(
      new CustomEvent("shapes-updated", {
        detail: {
          shapes: this.shapes.map((s) => {
            const rect = this.canvas.getBoundingClientRect();
            return {
              x: rect.left + s.position.x,
              y: rect.top + s.position.y,
            };
          }),
        },
        bubbles: true,
      }),
    );

    if (this.#running) {
      window.requestAnimationFrame(() => this.draw());
    }
  }

  disconnectedCallback() {
    this.#running = false;
    window.removeEventListener("resize", this.resize);
    window.removeEventListener("weather:all", this._onWeather);
    window.removeEventListener("visibilitychange", this._onVisibility);
  }

  resize = () => {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    for (const shape of this.shapes) {
      shape.updateSize();
    }
    for (const ring of this.rings) {
      ring.updateSize();
    }
  };
}

class Shape {
  /**@type {HTMLCanvasElement} */
  canvas;

  color = "#FFB3D2";
  width = 360;
  height = 170;

  /**@type {import("../lib/2d.js").Position} */
  position;
  /**@type {import("../lib/2d.js").Position} */
  target;
  lastDrawnAt = 0;
  speed = 0.1;

  /**@type {number} */
  scale;

  /**
   *
   * @param {HTMLCanvasElement} canvas
   * @param {Array<string>} colors
   */
  constructor(canvas, colors) {
    this.canvas = canvas;

    this.scale = randomInt(50, 100) / 100;
    this.updateSize();
    this.position = {
      x: randomInt(0, canvas.width),
      y: randomInt(0, canvas.height),
    };

    this.generateTarget();
    this.color = colors;
  }

  updateSize() {
    const baseWidth = Math.max((260 / 1920) * this.canvas.width, 200);
    const baseHeight = (120 / 1080) * this.canvas.height;

    this.width = baseWidth * this.scale;
    this.height = baseHeight * this.scale;
  }

  updatePosition() {
    if (this.lastDrawnAt === 0) {
      return;
    }
    const n = normalVec(this.position, this.target);
    const time = Date.now() - this.lastDrawnAt;
    this.position = {
      x: this.position.x + n.x * time * this.speed,
      y: this.position.y + n.y * time * this.speed,
    };
    if (distanceSquared(this.position, this.target) < 10) {
      this.generateTarget();
    }
  }

  draw() {
    this.updatePosition();
    const ctx = this.canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.ellipse(
      this.position.x,
      this.position.y,
      this.width,
      this.height,
      0,
      0,
      2 * Math.PI,
    );
    ctx.fill();
    ctx.restore();
    this.lastDrawnAt = Date.now();
  }

  generateTarget() {
    this.target = {
      x: randomInt(0, this.canvas.width),
      y: randomInt(0, this.canvas.height),
    };
  }
}

class Ring {
  /**@type {HTMLCanvasElement} */
  canvas;

  /**@type {string} */
  #color = "#82FFEA";

  /**@type {number} */
  #ringWidth = 50;

  /**@type {RingGroupPosition} */
  group;

  /**
   * @param {HTMLCanvasElement} canvas
   * @param {number} index
   * @param {RingGroupPosition} group
   */
  constructor(canvas, index, group) {
    this.canvas = canvas;
    this.index = index;
    this.startTime = Date.now();
    this.group = group;
    this.updateSize();
  }

  updateSize() {
    this.#ringWidth = Math.max((70 / 1920) * this.canvas.width, 20);
  }

  setColor(value) {
    this.#color = value;
  }

  draw() {
    const ctx = this.canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    ctx.save();

    const elapsed = (Date.now() - this.startTime) / 1000;

    const innerRadius = this.index * this.#ringWidth;
    const outerRadius = innerRadius + this.#ringWidth;

    const maxAlpha = 1;
    const staticAlpha = maxAlpha * (this.index / 7);

    const speed = 2;
    const minPulse = 0;
    const maxPulse = 1;

    const delay = this.index * 0.15;
    const t = Math.max(0, elapsed - delay);

    const pulse =
      minPulse + ((1 - Math.cos(t * speed)) / 2) * (maxPulse - minPulse);

    const alpha = staticAlpha * pulse;

    ctx.fillStyle = this.#color;
    ctx.globalAlpha = alpha;

    ctx.beginPath();
    ctx.arc(
      this.group.position.x,
      this.group.position.y,
      outerRadius,
      0,
      Math.PI * 2,
      true,
    );
    ctx.arc(
      this.group.position.x,
      this.group.position.y,
      innerRadius,
      0,
      Math.PI * 2,
      true,
    );
    ctx.fill("evenodd");

    ctx.restore();
  }
}

class RingGroupPosition {
  /**@type {HTMLCanvasElement} */
  canvas;

  /**@type {import("../lib/2d.js").Position} */
  position;
  /**@type {import("../lib/2d.js").Position} */
  target;

  speed = 0.05;
  lastDrawnAt = 0;

  constructor(canvas) {
    this.canvas = canvas;
    this.position = {
      x: randomInt(0, canvas.width),
      y: randomInt(0, canvas.height),
    };
    this.generateTarget();
  }

  update() {
    if (this.lastDrawnAt === 0) {
      this.lastDrawnAt = Date.now();
      return;
    }
    const n = normalVec(this.position, this.target);
    const time = Date.now() - this.lastDrawnAt;
    this.position = {
      x: this.position.x + n.x * time * this.speed,
      y: this.position.y + n.y * time * this.speed,
    };
    if (distanceSquared(this.position, this.target) < 10) {
      this.generateTarget();
    }
    this.lastDrawnAt = Date.now();
  }

  generateTarget() {
    this.target = {
      x: randomInt(0, this.canvas.width),
      y: randomInt(0, this.canvas.height),
    };
  }
}
