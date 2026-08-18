import { Shape } from "./Shape.js";

export class Line extends Shape {
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
