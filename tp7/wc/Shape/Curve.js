const SVG_NS = "http://www.w3.org/2000/svg";

export class TemperatureCurve {
  #height;
  #color;
  #gradientId;

  /**
   * @param {Object} options
   * @param {number} options.height - hauteur du SVG parent (pour fermer l'area en bas)
   * @param {string} [options.color] - couleur de la courbe/points/gradient
   * @param {string} [options.gradientId] - id unique du gradient (utile si plusieurs instances dans le même shadow root)
   */
  constructor({ height, color = "#facc15", gradientId = "tempGradient" }) {
    this.#height = height;
    this.#color = color;
    this.#gradientId = gradientId;
  }

  /**
   * Dessine area + gradient + path lissé + points sur le svg fourni.
   * @param {SVGSVGElement} svg
   * @param {Array<{x: number, y: number, temp: number, icon: string}>} points
   */
  draw(svg, points) {
    if (!points.length) {
      return;
    }

    this.#injectStyles(svg);
    this.#createGradientDefs(svg);
    this.#createArea(svg, points);
    this.#createPath(svg, points);
    this.#createPoints(svg, points);
  }

  #injectStyles(svg) {
    const style = document.createElementNS(SVG_NS, "style");
    style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .animated-element {
      opacity: 0;
      animation: fadeIn 0.5s ease-out forwards;
    }
  `;
    svg.appendChild(style);
  }

  // ==========================================================
  // PATH (courbe lissée, Bézier)
  // ==========================================================

  #buildSmoothPathD(points) {
    if (points.length < 2) return "";

    let d = `M ${points[0].x},${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const midX = (p0.x + p1.x) / 2;

      d += ` C ${midX},${p0.y} ${midX},${p1.y} ${p1.x},${p1.y}`;
    }

    return d;
  }

  #createPath(svg, points) {
    if (points.length < 2) {
      return;
    }
    const path = document.createElementNS(SVG_NS, "path");

    path.setAttribute("d", this.#buildSmoothPathD(points));
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", this.#color);
    path.setAttribute("stroke-width", 2);
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");

    path.classList.add("animated-element");
    path.style.animationDelay = "200ms";

    svg.appendChild(path);
  }

  // ==========================================================
  // AREA + GRADIENT
  // ==========================================================

  #createGradientDefs(svg) {
    const defs = document.createElementNS(SVG_NS, "defs");

    const gradient = document.createElementNS(SVG_NS, "linearGradient");
    gradient.setAttribute("id", this.#gradientId);
    gradient.setAttribute("x1", "0");
    gradient.setAttribute("y1", "0");
    gradient.setAttribute("x2", "0");
    gradient.setAttribute("y2", "1");

    const stop1 = document.createElementNS(SVG_NS, "stop");
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("stop-color", this.#color);
    stop1.setAttribute("stop-opacity", "0.4");

    const stop2 = document.createElementNS(SVG_NS, "stop");
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("stop-color", this.#color);
    stop2.setAttribute("stop-opacity", "0");

    gradient.append(stop1, stop2);
    defs.appendChild(gradient);
    svg.appendChild(defs);
  }

  #createArea(svg, points) {
    if (points.length < 2) {
      return;
    }
    const line = this.#buildSmoothPathD(points);

    const first = points[0];
    const last = points[points.length - 1];
    const d = `${line} L ${last.x},${this.#height} L ${first.x},${this.#height} Z`;

    const area = document.createElementNS(SVG_NS, "path");
    area.classList.add("animated-element");
    area.style.animationDelay = "0ms";
    area.setAttribute("d", d);
    area.setAttribute("fill", `url(#${this.#gradientId})`);
    area.setAttribute("stroke", "none");

    svg.appendChild(area);
  }

  // ==========================================================
  // POINTS
  // ==========================================================

  #createPoints(svg, points) {
    const iconSize = 24;
    const offset = iconSize / 2;
    const iconYOffset = 36;

    points.forEach((p, index) => {
      const circle = document.createElementNS(SVG_NS, "circle");
      circle.setAttribute("cx", p.x);
      circle.setAttribute("cy", p.y);
      circle.setAttribute("r", 3);
      circle.setAttribute("fill", this.#color);
      circle.setAttribute("stroke", "#0f172a");
      circle.setAttribute("stroke-width", 1.5);

      circle.classList.add("animated-element");
      circle.style.animationDelay = `${400 + index * 50}ms`;

      const image = document.createElementNS(SVG_NS, "image");

      image.setAttribute(
        "href",
        `https://openweathermap.org/img/wn/${p.icon}@2x.png`,
      );
      image.setAttribute("x", p.x - offset);
      image.setAttribute("y", p.y - iconYOffset - offset);
      image.setAttribute("width", iconSize);
      image.setAttribute("height", iconSize);

      image.classList.add("animated-element");
      image.style.animationDelay = `${450 + index * 50}ms`;

      svg.appendChild(circle);
      svg.appendChild(image);
    });
  }
}
