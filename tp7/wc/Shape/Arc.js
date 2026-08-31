import { Shape } from "./Shape.js";

export class Arc extends Shape {
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
