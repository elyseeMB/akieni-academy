class ProductPrice extends HTMLElement {}

customElements.get("product-price") ||
  customElements.define("product-price", ProductPrice);
