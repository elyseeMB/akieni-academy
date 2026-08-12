import { BaseElement } from "./base-element.js";

/**
 * <app-drawer>
 * Slots: header, content, footer
 * Methods: open(), close()
 * Events: app-drawer:open, app-drawer:close
 * Attributes: open, side (left|right), labelledby
 */
export class Drawer extends BaseElement {
  static get observedAttributes() {
    return ["open", "side", "labelledby"];
  }

  constructor() {
    super();
    this.#onKeydown = this.#onKeydown.bind(this);
    this.#onBackdropClick = this.#onBackdropClick.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("keydown", this.#onKeydown);
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", this.#onKeydown);
    this.#releaseScrollLock();
  }

  get template() {
    const side = this.getAttribute("side") || "left";
    const labelledby = this.getAttribute("labelledby") || "";
    const open = this.hasAttribute("open");

    return `
      <div class="drawer-backdrop" part="backdrop"></div>
      <aside
        class="drawer drawer--${side}"
        role="dialog"
        aria-modal="true"
        aria-hidden="${!open}"
        ${labelledby ? `aria-labelledby="${labelledby}"` : ""}
        part="drawer"
      >
        <header class="drawer__header"><slot name="header"></slot></header>
        <div class="drawer__content"><slot name="content"></slot></div>
        <footer class="drawer__footer"><slot name="footer"></slot></footer>
      </aside>
    `;
  }

  static get styles() {
    return `
      :host {
        position: fixed;
        inset: 0;
        z-index: var(--layer-menu-drawer);
        display: none;
      }
      :host([open]) { display: block; }

      .drawer-backdrop {
        position: absolute;
        inset: 0;
        background-color: rgb(var(--backdrop-color-rgb) / var(--backdrop-opacity));
      }

      .drawer {
        position: absolute;
        top: 0;
        bottom: 0;
        inline-size: min(var(--drawer-width), var(--drawer-max-width));
        block-size: var(--drawer-height);
        padding-inline: var(--drawer-inline-padding);
        background-color: var(--color-background);
        box-shadow: var(--shadow-drawer);
        display: flex;
        flex-direction: column;
        transform: translateX(-100%);
        transition: transform var(--hover-transition-duration) var(--hover-transition-timing);
      }

      .drawer--right { right: 0; transform: translateX(100%); }
      .drawer--left { left: 0; }

      :host([open]) .drawer { transform: translateX(0); }

      .drawer__header {
        padding-block: var(--drawer-header-block-padding);
        border-bottom: 1px solid var(--color-border);
      }
      .drawer__content {
        padding-block: var(--drawer-content-block-padding);
        overflow-y: auto;
        flex: 1;
      }
      .drawer__footer {
        padding-block: var(--drawer-content-block-padding);
        border-top: 1px solid var(--color-border);
      }
    `;
  }

  open() {
    if (this.hasAttribute("open")) return;
    this.setAttribute("open", "");
    this.#trapFocus();
    this.#lockScroll();
    this.emit("app-drawer:open");
  }

  close() {
    if (!this.hasAttribute("open")) return;
    this.removeAttribute("open");
    this.#releaseScrollLock();
    this.emit("app-drawer:close");
  }

  #trapFocus() {
    const focusable = this.shadow.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable) focusable.focus();
  }

  #lockScroll() {
    document.body.style.overflow = "hidden";
  }

  #releaseScrollLock() {
    document.body.style.overflow = "";
  }

  #onKeydown(event) {
    if (event.key === "Escape" && this.hasAttribute("open")) {
      this.close();
    }
  }

  #onBackdropClick() {
    if (this.hasAttribute("open")) this.close();
  }

  afterRender() {
    const backdrop = this.$(".drawer-backdrop");
    if (backdrop) backdrop.addEventListener("click", this.#onBackdropClick);
  }
}
