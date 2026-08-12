import { BaseElement } from "./base-element.js";

/**
 * <app-button>
 * Variants: primary | secondary | contrast
 * Attributes: variant, size (sm|md), loading, disabled, full, type
 * formAssociated: participates in native form submission.
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
    this.#onSlotChange = this.#onSlotChange.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("click", this.#onClick);
    this.shadow.addEventListener("slotchange", this.#onSlotChange);
    this.#syncDisabledState();
  }

  disconnectedCallback() {
    this.removeEventListener("click", this.#onClick);
    this.shadow.removeEventListener("slotchange", this.#onSlotChange);
  }

  get template() {
    const variant = this.getAttribute("variant") || "primary";
    const size = this.getAttribute("size") || "md";
    const full = this.hasAttribute("full") ? "full" : "";
    const loading = this.hasAttribute("loading");

    return `
      <button
        part="button"
        class="btn btn--${variant} btn--${size} ${full}"
        type="${this.getAttribute("type") || "button"}"
        ?disabled="${this.hasAttribute("disabled")}"
        aria-busy="${loading}"
      >
        <span class="btn__spinner" aria-hidden="${!loading}"></span>
        <span class="btn__label"><slot></slot></span>
      </button>
    `;
  }

  static get styles() {
    return `
      :host { display: inline-block; }
      :host([full]) { display: block; }

      .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        min-height: var(--wk-button-min-height);
        padding-inline: var(--button-padding-inline);
        border: var(--wk-button-border-width) solid transparent;
        border-radius: var(--wk-button-border-radius);
        font-family: var(--button-font-family);
        font-weight: var(--button-font-weight);
        text-transform: var(--button-text-case);
        line-height: 1;
        cursor: pointer;
        transition:
          background-color var(--hover-transition-duration) var(--hover-transition-timing),
          color var(--hover-transition-duration) var(--hover-transition-timing),
          border-color var(--hover-transition-duration) var(--hover-transition-timing);
      }

      :host([full]) .btn { width: 100%; }

      .btn--sm { min-height: var(--button-size-sm); }
      .btn--md { min-height: var(--button-size-md); }

      .btn--primary {
        color: var(--color-primary-button-text);
        background-color: var(--color-primary-button-background);
        border-color: var(--color-primary-button-border);
      }
      .btn--primary:hover {
        color: var(--color-primary-button-hover-text);
        background-color: var(--color-primary-button-hover-background);
        border-color: var(--color-primary-button-hover-border);
      }

      .btn--secondary {
        color: var(--color-secondary-button-text);
        background-color: var(--color-secondary-button-background);
        border-color: var(--color-secondary-button-border);
      }
      .btn--secondary:hover {
        color: var(--color-secondary-button-hover-text);
        background-color: var(--color-secondary-button-hover-background);
        border-color: var(--color-secondary-button-hover-border);
      }

      .btn--contrast {
        color: var(--color-contrast-button-text);
        background-color: var(--color-contrast-button-background);
        border-color: var(--color-contrast-button-border);
      }
      .btn--contrast:hover {
        color: var(--color-contrast-button-hover-text);
        background-color: var(--color-contrast-button-hover-background);
        border-color: var(--color-contrast-button-hover-border);
      }

      .btn:disabled,
      .btn[aria-busy="true"] {
        opacity: var(--disabled-opacity);
        cursor: not-allowed;
        pointer-events: none;
      }

      .btn__spinner {
        width: 1em;
        height: 1em;
        border: 2px solid currentColor;
        border-right-color: transparent;
        border-radius: 50%;
        display: none;
        animation: btn-spin 0.6s linear infinite;
      }
      .btn[aria-busy="true"] .btn__spinner { display: inline-block; }

      @keyframes btn-spin { to { transform: rotate(360deg); } }
    `;
  }

  #onSlotChange() {
    // Keep label width stable while loading spinner shows
    this.#syncDisabledState();
  }

  #syncDisabledState() {
    const btn = this.$(".btn");
    if (!btn) return;
    const disabled = this.hasAttribute("disabled");
    this.internals.ariaDisabled = disabled ? "true" : "false";
    if (disabled) {
      this.internals.setFormValue(null);
    }
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
