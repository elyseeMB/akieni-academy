/**
 * Base class for all Web Components.
 * Provides Shadow DOM, render lifecycle and small helpers.
 */
export class BaseElement extends HTMLElement {
  static get observedAttributes() {
    return [];
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.render();
    }
  }

  disconnectedCallback() {}

  render() {
    this.shadow.innerHTML = `<style>${this.constructor.styles}</style>${this.template}`;
    this.afterRender();
  }

  /** @returns {string} HTML template (without <style>) */
  get template() {
    return "";
  }

  /** Hook called after innerHTML is set. */
  afterRender() {}

  static get styles() {
    return "";
  }

  /** @param {string} sel */
  $(sel) {
    return this.shadow.querySelector(sel);
  }

  /** @param {string} sel */
  $$(sel) {
    return [...this.shadow.querySelectorAll(sel)];
  }

  /**
   * Dispatch a CustomEvent on the host (bubbling + composed for Shadow DOM).
   * @param {string} name
   * @param {*} detail
   */
  emit(name, detail = null) {
    this.dispatchEvent(
      new CustomEvent(name, { detail, bubbles: true, composed: true }),
    );
  }
}
