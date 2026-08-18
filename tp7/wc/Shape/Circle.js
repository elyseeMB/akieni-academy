import { Shape } from "./Shape.js";

export class Circle extends Shape {
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
