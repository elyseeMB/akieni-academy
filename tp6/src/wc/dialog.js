import {
  debounce,
  isClickedOutside,
  onAnimationEnd,
} from "../utilities/utils.js";
import { Component } from "../wc/component.js";

export class DialogComponent extends Component {
  requiredRefs = ["dialog"];
  connectedCallback() {
    super.connectedCallback(),
      (this.minWidth || this.maxWidth) &&
        window.addEventListener("resize", this.#handleResize);
  }
  disconnectedCallback() {
    super.disconnectedCallback(),
      (this.minWidth || this.maxWidth) &&
        window.removeEventListener("resize", this.#handleResize),
      this.#removeDimmer();
  }
  #handleResize = debounce(() => {
    const { minWidth, maxWidth } = this;
    if (!minWidth && !maxWidth) return;
    const windowWidth = window.innerWidth;
    (windowWidth < minWidth || windowWidth > maxWidth) && this.closeDialog();
  }, 50);

  #previousScrollY = 0;
  #dimmer = null;
  showDialog() {
    const { dialog } = this.refs;
    if (dialog.open) {
      return;
    }
    const scrollY = window.scrollY;
    (this.#previousScrollY = scrollY),
      requestAnimationFrame(() => {
        (document.body.style.width = "100%"),
          (document.body.style.position = "fixed"),
          (document.body.style.top = `-${scrollY}px`),
          dialog.showModal(),
          this.#addDimmer(),
          this.dispatchEvent(new DialogOpenEvent()),
          this.addEventListener("click", this.#handleClick),
          this.addEventListener("keydown", this.#handleKeyDown);
      });
  }

  #addDimmer() {
    if (this.#dimmer) return;
    const dimmer = document.createElement("div");
    dimmer.className = "dialog-dimmer";
    document.body.appendChild(dimmer);
    this.#dimmer = dimmer;
  }

  #removeDimmer() {
    this.#dimmer?.remove();
    this.#dimmer = null;
  }

  closeDialog = async () => {
    const { dialog } = this.refs;
    dialog.open &&
      (this.removeEventListener("click", this.#handleClick),
      this.removeEventListener("keydown", this.#handleKeyDown),
      (dialog.style.animation = "none"),
      dialog.offsetWidth,
      dialog.classList.add("dialog-closing"),
      (dialog.style.animation = ""),
      await onAnimationEnd(dialog, void 0, { subtree: !1 }),
      (document.body.style.width = ""),
      (document.body.style.position = ""),
      (document.body.style.top = ""),
      window.scrollTo({ top: this.#previousScrollY, behavior: "instant" }),
      this.#removeDimmer(),
      dialog.close(),
      dialog.classList.remove("dialog-closing"),
      this.dispatchEvent(new DialogCloseEvent()));
  };

  toggleDialog = () => {
    this.refs.dialog.open ? this.closeDialog() : this.showDialog();
  };

  #handleClick(event) {
    const { dialog } = this.refs;
    isClickedOutside(event, dialog) && this.closeDialog();
  }

  #handleKeyDown(event) {
    event.key === "Escape" && (event.preventDefault(), this.closeDialog());
  }

  get minWidth() {
    return Number(this.getAttribute("dialog-active-min-width"));
  }

  get maxWidth() {
    return Number(this.getAttribute("dialog-active-max-width"));
  }
}

export class DialogOpenEvent extends CustomEvent {
  constructor() {
    super(DialogOpenEvent.eventName);
  }
  static eventName = "dialog:open";
}

export class DialogCloseEvent extends CustomEvent {
  constructor() {
    super(DialogCloseEvent.eventName);
  }
  static eventName = "dialog:close";
}

document.addEventListener(
  "toggle",
  (event) => {
    if (
      event.target instanceof HTMLDetailsElement &&
      event.target.hasAttribute("scroll-lock")
    ) {
      const { open } = event.target;
      open
        ? document.documentElement.setAttribute("scroll-lock", "")
        : document.documentElement.removeAttribute("scroll-lock");
    }
  },
  { capture: !0 },
);
