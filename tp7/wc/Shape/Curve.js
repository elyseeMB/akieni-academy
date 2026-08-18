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
   * @param {Array<{x: number, y: number, temp: number}>} points
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
    const iconSize = 18;
    const offset = iconSize / 2;
    const iconYOffset = 42; // Distance au-dessus du point (en pixels)

    points.forEach((p, index) => {
      // 1. Dessin du point d'origine sur la courbe
      const circle = document.createElementNS(SVG_NS, "circle");
      circle.setAttribute("cx", p.x);
      circle.setAttribute("cy", p.y);
      circle.setAttribute("r", 3);
      circle.setAttribute("fill", this.#color);
      circle.setAttribute("stroke", "#0f172a");
      circle.setAttribute("stroke-width", 1.5);

      circle.classList.add("animated-element");
      circle.style.animationDelay = `${400 + index * 50}ms`;

      // 2. Groupe SVG pour l'icône au-dessus
      const iconGroup = document.createElementNS(SVG_NS, "g");

      // Positionné centré en X, et décalé vers le haut (p.y - iconYOffset)
      iconGroup.setAttribute(
        "transform",
        `translate(${p.x - offset}, ${p.y - iconYOffset - offset})`,
      );

      iconGroup.setAttribute("width", `${iconSize}`);
      iconGroup.setAttribute("height", `${iconSize}`);
      iconGroup.setAttribute("viewBox", "0 0 24 24");
      iconGroup.setAttribute("fill", this.#color);
      iconGroup.setAttribute("stroke", this.#color);
      iconGroup.setAttribute("stroke-width", "2");
      iconGroup.setAttribute("stroke-linecap", "round");
      iconGroup.setAttribute("stroke-linejoin", "round");

      iconGroup.classList.add("animated-element");
      iconGroup.style.animationDelay = `${450 + index * 50}ms`;

      iconGroup.innerHTML = getLucideIconByTemp(p.temp);
      svg.appendChild(circle);
      svg.appendChild(iconGroup);
    });
  }
}

// Dictionnaire d'icônes Lucide selon la température
function getLucideIconByTemp(temp) {
  if (temp >= 25) {
    // Lucide: Sun
    return `<path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/><circle cx="12" cy="12" r="4"/>`;
  } else if (temp >= 15) {
    // Lucide: CloudSun
    return `<path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3.5 3.5 0 0 1 0 7Z"/>`;
  } else {
    // Lucide: Snowflake
    return `<path d="M2 12h20"/><path d="M12 2v20"/><path d="m20 16-4-4 4-4"/><path d="m4 8 4 4-4 4"/><path d="m16 4-4 4-4-4"/><path d="m8 20 4-4 4 4"/>`;
  }
}
