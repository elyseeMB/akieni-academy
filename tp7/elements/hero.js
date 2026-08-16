import { distanceSquared, normalVec } from "../lib/2d.js";
import { randomInt } from "../lib/number.js";

export class AnimatedHero extends HTMLElement {
  // @ts-expect-error It is initialized
  /**
   *
   * @param {HTMLCanvasElement} canvas
   */
  canvas;
  // @ts-expect-error It is initialized
  /**@type {Shape[]} */
  shapes;
  /**@type {boolean} */
  isVisible;
  /**@type {IntersectionObserver} */
  observer = null;

  connectedCallback() {
    this.canvas = document.createElement("canvas");
    this.canvas.setAttribute("class", "canvas-wrapper");
    this.canvas.style.setProperty("background", "#F8FAF4");
    this.append(this.canvas);

    const rect = this.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    // Shape
    this.shapes = [];
    for (let i = 0; i < 2; i++) {
      this.shapes.push(new Shape(this.canvas));
    }

    // Square
    this.squares = [];
    const sharedPosition = {
      x: randomInt(0, this.canvas.width),
      y: randomInt(0, this.canvas.height),
    };
    for (let i = 0; i < 7; i++) {
      this.squares.push(new squares(this.canvas, i, sharedPosition));
    }

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
    window.addEventListener("resize", this.resize);
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        this.isVisible = entry.isIntersecting;
        this.draw();
      });
    });
    this.observer.observe(this);
  }

  draw() {
    /**@type {CanvasRenderingContext2D} */
    const ctx = this.canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    for (const shape of this.shapes) {
      shape.draw();
    }

    for (const square of this.squares) {
      square.draw();
    }

    if (this.isVisible) {
      window.requestAnimationFrame(() => this.draw());
    }
  }

  disconnectedCallback() {
    window.removeEventListener("resize", this.resize);
    this.observer?.unobserve(this);
    this.observer = null;
  }

  resize = () => {
    const rect = this.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    for (const shape of this.shapes) {
      shape.updateSize();
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

  /**
   *
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.updateSize();
    this.position = {
      x: randomInt(0, canvas.width),
      y: randomInt(0, canvas.height),
    };

    this.generateTarget();
  }

  updateSize() {
    this.width = Math.max((360 / 1920) * this.canvas.width, 200);
    this.height = (170 / 1080) * this.canvas.height;
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
    // ctx.filter = `blur(${this.blur}px)`;
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

class squares {
  /**@type {HTMLCanvasElement} */
  canvas;

  /**@type {import("../lib/2d.js").Position} */
  position;
  /**
   *
   * @param {import("../lib/2d.js").Position} position
   * @param {index} number
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas, index, position) {
    this.canvas = canvas;
    this.index = index;
    this.startTime = Date.now();
    this.position = position;
  }

  draw() {
    const ctx = this.canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    ctx.save();

    const elapsed = (Date.now() - this.startTime) / 1000;

    const ringWidth = 50;
    const innerRadius = this.index * ringWidth;
    const outerRadius = innerRadius + ringWidth;

    const maxAlpha = 1;
    const staticAlpha = maxAlpha * (this.index / 7);

    const speed = 2;
    const minPulse = 0; // <- corrigé
    const maxPulse = 1;

    const delay = this.index * 0.15;
    const t = Math.max(0, elapsed - delay);

    const pulse =
      minPulse + ((1 - Math.cos(t * speed)) / 2) * (maxPulse - minPulse);

    const alpha = staticAlpha * pulse;

    ctx.fillStyle = "#82FFEA";
    ctx.globalAlpha = alpha;

    ctx.beginPath();
    ctx.arc(
      this.position.x,
      this.position.y,
      outerRadius,
      0,
      Math.PI * 2,
      true,
    );

    ctx.arc(
      this.position.x,
      this.position.y,
      innerRadius,
      0,
      Math.PI * 2,
      true,
    );
    ctx.fill("evenodd");

    ctx.restore();
  }
}
