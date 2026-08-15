import { debounce, onDocumentLoaded } from "../../utilities/utils.js";
import { Component } from "../component.js";

const ACTIVATE_DELAY = 0;
const DEACTIVATE_DELAY = 350;

export class HeaderMenu extends Component {
  requiredRefs = ["overflowMenu"];

  #abortController = new AbortController();
  #state = { activeItem: null };

  connectedCallback() {
    super.connectedCallback();

    this.overflowMenu?.addEventListener(
      "pointerleave",
      () => this.#debouncedDeactivate(),
      { signal: this.#abortController.signal },
    );

    onDocumentLoaded(this.#preloadImages);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#abortController.abort();
  }

  get animationDelay() {
    const value = this.dataset.animationDelay;
    return value ? parseInt(value, 10) : 0;
  }

  get overflowMenu() {
    return this.refs.overflowMenu?.shadowRoot?.querySelector(
      '[part="overflow"]',
    );
  }

  get overflowHovered() {
    return this.refs.overflowMenu?.matches(":hover") ?? false;
  }

  activate = (event) => {
    this.#debouncedDeactivate.cancel();
    this.#debouncedActivateHandler.cancel();
    this.#debouncedActivateHandler(event);
  };

  #activateHandler = (event) => {
    this.#debouncedDeactivate.cancel();
    this.removeAttribute("data-animating");

    if (!(event.target instanceof Element)) return;

    let item = findMenuItem(event.target);
    if (!item || item == this.#state.activeItem) {
      return;
    }

    const isDefaultSlot = event.target.slot === "";
    this.dataset.overflowExpanded = (!isDefaultSlot).toString();

    const previouslyActiveItem = this.#state.activeItem;
    if (previouslyActiveItem) {
      previouslyActiveItem.ariaExpanded = "false";
    }

    this.#state.activeItem = item;
    this.ariaExpanded = "true";
    item.ariaExpanded = "true";

    let submenu = findSubmenu(item);
    if (!submenu && !isDefaultSlot) {
      submenu = this.overflowMenu;
    }
    if (submenu) {
      submenu.dataset.active = "";
    }

    const submenuHeight = submenu ? submenu.offsetHeight : 0;
    this.style.setProperty("--submenu-height", `${submenuHeight}px`);
    this.style.setProperty("--submenu-opacity", "1");
  };

  #debouncedActivateHandler = debounce(this.#activateHandler, ACTIVATE_DELAY);

  deactivate(event) {
    this.#debouncedActivateHandler.cancel();

    if (!(event.target instanceof Element)) return;

    if (findMenuItem(event.target) === this.#state.activeItem) {
      this.#debouncedDeactivate();
    }
  }

  #deactivate = (item = this.#state.activeItem) => {
    if (!item || item != this.#state.activeItem || this.overflowHovered) return;

    this.style.setProperty("--submenu-height", "0px");
    this.style.setProperty("--submenu-opacity", "0");
    this.dataset.overflowExpanded = "false";

    const submenu = findSubmenu(item);

    this.#state.activeItem = null;
    this.ariaExpanded = "false";
    item.ariaExpanded = "false";
    item.setAttribute("data-animating", "");

    setTimeout(
      () => {
        item.removeAttribute("data-animating");
        if (submenu) delete submenu.dataset.active;
      },
      Math.max(0, this.animationDelay - 150),
    );
  };

  #debouncedDeactivate = debounce(this.#deactivate, DEACTIVATE_DELAY);

  #preloadImages = () => {
    this.querySelectorAll('img[loading="lazy"]')?.forEach((image) =>
      image.removeAttribute("loading"),
    );
  };
}

function findMenuItem(element) {
  if (!(element instanceof Element)) return null;

  if (element?.matches('[slot="more"]')) {
    return findMenuItem(
      element.parentElement?.querySelector('[slot="overflow"]'),
    );
  }

  return element?.querySelector('[ref="menuitem"]');
}

function findSubmenu(element) {
  const submenu = element?.parentElement?.querySelector('[ref="submenu[]"]');
  return submenu instanceof HTMLElement ? submenu : null;
}
