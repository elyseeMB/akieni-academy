import { BaseElement } from "./base-element.js";

/**
 * <app-input> and <app-textarea>
 * Attributes: label, type, placeholder, required, disabled,
 *             char-count, max-length, error, success, name, value
 * formAssociated: participates in native form submission.
 */
export class Input extends BaseElement {
  static formAssociated = true;

  static get observedAttributes() {
    return [
      "label",
      "type",
      "placeholder",
      "required",
      "disabled",
      "char-count",
      "max-length",
      "error",
      "success",
      "name",
      "value",
    ];
  }

  constructor() {
    super();
    this.internals = this.attachInternals();
    this.#onInput = this.#onInput.bind(this);
    this.#onChange = this.#onChange.bind(this);
  }

  get isTextarea() {
    return this.tagName.toLowerCase() === "app-textarea";
  }

  connectedCallback() {
    super.connectedCallback();
    const field = this.$(".field");
    field.addEventListener("input", this.#onInput);
    field.addEventListener("change", this.#onChange);
    this.#syncFormValue();
  }

  disconnectedCallback() {
    const field = this.$(".field");
    if (field) {
      field.removeEventListener("input", this.#onInput);
      field.removeEventListener("change", this.#onChange);
    }
  }

  get template() {
    const label = this.getAttribute("label");
    const type = this.getAttribute("type") || "text";
    const placeholder = this.getAttribute("placeholder") || "";
    const name = this.getAttribute("name") || "";
    const value = this.getAttribute("value") || "";
    const required = this.hasAttribute("required");
    const disabled = this.hasAttribute("disabled");
    const charCount = this.hasAttribute("char-count");
    const maxLength = this.getAttribute("max-length");
    const hasError = this.hasAttribute("error");
    const hasSuccess = this.hasAttribute("success");
    const errorMsg = this.getAttribute("error");

    const stateClass = hasError ? "is-error" : hasSuccess ? "is-success" : "";

    const fieldAttrs = [
      `class="field ${stateClass}"`,
      `name="${name}"`,
      disabled ? "disabled" : "",
      required ? "required" : "",
      maxLength ? `maxlength="${maxLength}"` : "",
    ].join(" ");

    const fieldInner = this.isTextarea
      ? `<textarea ${fieldAttrs} rows="4" placeholder="${placeholder}">${value}</textarea>`
      : `<input ${fieldAttrs} type="${type}" value="${value}" placeholder="${placeholder}" />`;

    const counter = charCount
      ? `<span class="field__counter">${value.length}${
          maxLength ? " / " + maxLength : ""
        }</span>`
      : "";

    const msg = hasError
      ? `<span class="field__message field__message--error">${errorMsg}</span>`
      : "";

    return `
      ${label ? `<label class="field__label">${label}</label>` : ""}
      ${fieldInner}
      ${counter}
      ${msg}
    `;
  }

  static get styles() {
    return `
      :host { display: block; }
      .field__label {
        display: block;
        margin-bottom: 0.4rem;
        font-family: var(--font-body--family);
        font-weight: var(--font-body--weight);
        color: var(--color-foreground);
      }
      .field {
        width: 100%;
        min-height: var(--wk-input-min-height);
        padding: var(--input-padding);
        color: var(--color-input-text);
        background-color: var(--color-input-background);
        border: var(--wk-input-border-width) solid var(--color-input-border);
        border-radius: var(--wk-input-border-radius);
        box-shadow: var(--input-box-shadow);
        font-family: var(--font-body--family);
        transition:
          box-shadow var(--hover-transition-duration) var(--hover-transition-timing),
          background-color var(--hover-transition-duration) var(--hover-transition-timing);
      }
      textarea.field { min-height: var(--input-textarea-min-height); resize: vertical; }
      .field:hover { background-color: var(--color-input-hover-background); }
      .field:focus {
        outline: none;
        box-shadow: var(--input-box-shadow-focus);
      }
      .field:disabled {
        background-color: var(--input-disabled-background-color);
        border-color: var(--input-disabled-border-color);
        color: var(--input-disabled-text-color);
        cursor: not-allowed;
      }
      .field.is-error {
        border-color: var(--color-red);
        box-shadow: 0 0 0 var(--wk-input-border-width) var(--color-red);
      }
      .field.is-success { border-color: var(--color-accent); }
      .field__counter {
        display: block;
        margin-top: 0.25rem;
        font-size: 0.75rem;
        color: var(--color-foreground-muted);
      }
      .field__message--error {
        display: block;
        margin-top: 0.25rem;
        font-size: 0.75rem;
        color: var(--color-red);
      }
    `;
  }

  #onInput(event) {
    this.internals.setFormValue(event.target.value);
    if (this.hasAttribute("char-count")) {
      const counter = this.$(".field__counter");
      if (counter) {
        const max = this.getAttribute("max-length");
        counter.textContent = `${event.target.value.length}${
          max ? " / " + max : ""
        }`;
      }
    }
    this.emit("app-input:input", { value: event.target.value });
  }

  #onChange(event) {
    this.emit("app-input:change", { value: event.target.value });
  }

  #syncFormValue() {
    const field = this.$(".field");
    if (field) this.internals.setFormValue(field.value);
  }
}
