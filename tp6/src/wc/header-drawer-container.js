import { removeTrapFocus, trapFocus } from "../theme/focus.js";
import {
  onAnimationEnd,
  removeWillChangeOnAnimationEnd,
} from "../utilities/utils.js";
import { Component } from "../wc/component.js";

class headerDrawerContainer extends Component {
  requiredRefs = ["details"];

  connectedCallback() {
    super.connectedCallback();

    this.addEventListener("keyup", this.#onKeyUp);
    this.#setupAnimatedElementListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.removeEventListener("keyup", this.#onKeyUp);
  }

  #onKeyUp = (event) => {
    if (event.key === "Escape") {
      this.#close(this.#getDetailsElement(event));
    }
  };

  get isOpen() {
    return this.refs.details.hasAttribute("open");
  }

  #getDetailsElement(event) {
    if (event?.target instanceof Element) {
      return event.target.closest("details") ?? this.refs.details;
    }

    return this.refs.details;
  }

  toggle() {
    return this.isOpen ? this.close() : this.open();
  }

  open(event) {
    const details = this.#getDetailsElement(event);
    const summary = details.querySelector("summary");

    if (!summary) return;

    summary.setAttribute("aria-expanded", "true");

    this.preventInitialAccordionAnimations(details);

    requestAnimationFrame(() => {
      details.classList.add("menu-open");

      const drawer = details.querySelector(
        ".menu-drawer, .menu-drawer__submenu",
      );

      onAnimationEnd(drawer || details, () => trapFocus(details), {
        subtree: false,
      });
    });
  }

  back(event) {
    this.#close(this.#getDetailsElement(event));
  }

  close() {
    this.#close(this.refs.details);
  }

  #close(details) {
    const summary = details.querySelector("summary");

    if (!summary) return;

    summary.setAttribute("aria-expanded", "false");
    details.classList.remove("menu-open");

    const drawer = details.querySelector(".menu-drawer, .menu-drawer__submenu");

    onAnimationEnd(
      drawer || details,
      () => {
        reset(details);

        if (details === this.refs.details) {
          removeTrapFocus();

          this.querySelectorAll(
            "details[open]:not(accordion-custom > details)",
          ).forEach(reset);
        } else {
          trapFocus(this.refs.details);
        }
      },
      { subtree: false },
    );
  }

  #setupAnimatedElementListeners() {
    this.querySelectorAll(".menu-drawer__animated-element").forEach(
      (element) => {
        element.addEventListener(
          "animationend",
          removeWillChangeOnAnimationEnd,
        );
      },
    );
  }

  preventInitialAccordionAnimations(details) {
    const content = details.querySelectorAll(
      "accordion-custom .details-content",
    );

    content.forEach((element) => {
      if (element instanceof HTMLElement) {
        element.classList.add("details-content--no-animation");
      }
    });

    setTimeout(() => {
      content.forEach((element) => {
        if (element instanceof HTMLElement) {
          element.classList.remove("details-content--no-animation");
        }
      });
    }, 100);
  }
}

customElements.get("header-drawer") ??
  customElements.define("header-drawer", headerDrawerContainer);

function reset(element) {
  element.classList.remove("menu-open");
  element.removeAttribute("open");

  element.querySelector("summary")?.setAttribute("aria-expanded", "false");
}
