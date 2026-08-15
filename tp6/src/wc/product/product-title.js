import { Component } from "../component.js";

/**
 * Custom element for product titles with truncation support
 * @extends {Component}
 */
export class ProductTitle extends Component {
  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
    this.#initializeTruncation();
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    window.removeEventListener("resize", this.#handleResize);
  }

  #initializeTruncation() {
    if ("ResizeObserver" in window) {
      this.resizeObserver = new ResizeObserver(() => {
        this.#calculateTruncation();
      });
      this.resizeObserver.observe(this);
    } else {
      window.addEventListener("resize", this.#handleResize.bind(this));
    }

    this.#calculateTruncation();
  }

  #calculateTruncation() {
    const textElement =
      this.refs.text || this.querySelector(".title-text") || this;

    if (!textElement.textContent) return;

    const containerHeight = this.clientHeight;
    const computedStyle = window.getComputedStyle(this);
    const lineHeight = parseFloat(computedStyle.lineHeight);
    const paddingTop = parseFloat(computedStyle.paddingTop);
    const paddingBottom = parseFloat(computedStyle.paddingBottom);
    const availableHeight = containerHeight - paddingTop - paddingBottom;
    const maxLines = Math.max(1, Math.floor(availableHeight / lineHeight));

    textElement.style.display = "-webkit-box";
    textElement.style.webkitBoxOrient = "vertical";
    textElement.style.overflow = "hidden";
    textElement.style.textOverflow = "ellipsis";
    textElement.style.webkitLineClamp = String(maxLines);
  }

  #handleResize() {
    this.#calculateTruncation();
  }
}

export default ProductTitle;
