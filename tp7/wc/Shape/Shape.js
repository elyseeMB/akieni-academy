export const SVG_NS = "http://www.w3.org/2000/svg";

export class Shape {
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
