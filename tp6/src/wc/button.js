import { BaseElement } from "./base-element.js";

/**
 * <app-button>
 * Variants: primary | secondary | contrast
 * Attributes: variant, size (sm|md), loading, disabled, full, type, value
 * formAssociated: participates in native form submission.
 * Light DOM — styles in src/css/components/buttons.css
 */
export class Button extends BaseElement {
  static formAssociated = true;

  static get observedAttributes() {
    return ["variant", "size", "loading", "disabled", "full", "type"];
  }

  constructor() {
    super();
    this.internals = this.attachInternals();
    this.#onClick = this.#onClick.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("click", this.#onClick);
    this.#syncDisabledState();
  }

  disconnectedCallback() {
    this.removeEventListener("click", this.#onClick);
  }

  get template() {
    const variant = this.getAttribute("variant") || "primary";
    const size = this.getAttribute("size") || "md";
    const full = this.hasAttribute("full") ? "full" : "";
    const loading = this.hasAttribute("loading");

    return `
      <button
        class="btn btn--${variant} btn--${size} ${full}"
        type="${this.getAttribute("type") || "button"}"
        ?disabled="${this.hasAttribute("disabled")}"
        aria-busy="${loading}"
      >
        <span class="btn__spinner" aria-hidden="true"></span>
        <span class="btn__label" data-slot="default"></span>
      </button>
    `;
  }

  #syncDisabledState() {
    const disabled = this.hasAttribute("disabled");
    this.internals.ariaDisabled = disabled ? "true" : "false";
    if (disabled) this.internals.setFormValue(null);
  }

  #onClick(event) {
    if (this.hasAttribute("disabled") || this.hasAttribute("loading")) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return;
    }
    this.emit("app-button:click", { value: this.getAttribute("value") });
  }
}
