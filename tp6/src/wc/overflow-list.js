import { ResizeNotifier } from "../utilities/utils.js";
import { DeclarativeShadowElement } from "../wc/component.js";

export class OverflowMinimumEvent extends Event {
  constructor(minimumReached) {
    super("overflowMinimum", { bubbles: true });

    this.detail = { minimumReached };
  }
}

export class OverflowList extends DeclarativeShadowElement {
  static observedAttributes = ["disabled", "minimum-items"];

  #refs;

  #scheduled = false;

  #resizeObserver;

  #mutationObserver;

  #intersectionObserver;

  constructor() {
    super();

    this.#resizeObserver = new ResizeNotifier(this.#handleChange);
    this.#mutationObserver = new MutationObserver(this.#handleChange);
    this.#intersectionObserver = new IntersectionObserver(
      this.#handleIntersection,
      {
        rootMargin: "640px 360px 640px 360px",
      },
    );
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name !== "disabled") return;

    newValue === "true" ? this.#reset() : this.#reflowItems();
  }

  async connectedCallback() {
    super.connectedCallback();

    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
    }

    await this.#waitForStyles();

    this.#initialize();
  }

  disconnectedCallback() {
    this.#resizeObserver.disconnect();
    this.#mutationObserver.disconnect();
    this.#intersectionObserver.disconnect();
  }

  async #waitForStyles() {
    const stylesheet = this.shadowRoot?.querySelector('link[rel="stylesheet"]');

    if (!stylesheet || stylesheet.sheet) return;

    await new Promise((resolve) => {
      stylesheet.addEventListener("load", resolve, {
        once: true,
      });
    });
  }

  #initialize() {
    let shadowRoot = this.shadowRoot;

    if (!shadowRoot) {
      shadowRoot = this.attachShadow({ mode: "open" });
    }

    const defaultSlot = shadowRoot.querySelector("slot:not([name])");
    const overflowSlot = shadowRoot.querySelector('slot[name="overflow"]');
    const moreSlot = shadowRoot.querySelector('slot[name="more"]');
    const overflow = shadowRoot.querySelector('[part="overflow"]');
    const list = shadowRoot.querySelector('[part="list"]');
    const placeholder = shadowRoot.querySelector('[part="placeholder"]');

    if (
      !(defaultSlot instanceof HTMLSlotElement) ||
      !(overflowSlot instanceof HTMLSlotElement) ||
      !(moreSlot instanceof HTMLSlotElement) ||
      !(overflow instanceof HTMLElement) ||
      !(list instanceof HTMLUListElement) ||
      !(placeholder instanceof HTMLLIElement)
    ) {
      requestAnimationFrame(() => this.#initialize());
      return;
    }

    this.#refs = {
      defaultSlot,
      overflowSlot,
      moreSlot,
      overflow,
      list,
      placeholder,
    };

    this.addEventListener("reflow", (event) => {
      this.#reflowItems(0, event.detail.lastVisibleElement);
    });

    const elements = defaultSlot
      .assignedElements()
      .filter((element) => !(element instanceof HTMLTemplateElement));

    const firstElement = elements[0];
    const lastElement = elements.at(-1);

    if (firstElement) {
      this.#intersectionObserver.observe(firstElement);
    }

    if (lastElement && lastElement !== firstElement) {
      this.#intersectionObserver.observe(lastElement);
    }
  }

  get schedule() {
    return typeof Theme?.utilities?.scheduler?.schedule === "function"
      ? Theme.utilities.scheduler.schedule
      : (callback) => {
          requestAnimationFrame(() => {
            setTimeout(callback, 0);
          });
        };
  }

  get minimumItems() {
    const value = this.getAttribute("minimum-items");

    return value ? Number.parseInt(value, 10) : null;
  }

  get overflowSlot() {
    return this.#refs.overflowSlot;
  }

  get defaultSlot() {
    return this.#refs.defaultSlot;
  }

  #handleIntersection = ([entry]) => {
    if (!entry?.isIntersecting) return;

    this.#intersectionObserver.disconnect();

    setTimeout(() => {
      this.querySelector(':scope > template[shadowrootmode="open"]')?.remove();

      this.#reflowItems(entry.boundingClientRect.height);
    }, 0);
  };

  #handleChange = () => {
    if (this.#scheduled) return;

    this.#scheduled = true;

    requestAnimationFrame(() => {
      setTimeout(() => {
        this.#reflowItems();
        this.#scheduled = false;
      }, 0);
    });
  };

  #moveItemsToDefaultSlot() {
    const { defaultSlot, overflowSlot } = this.#refs;

    for (const element of overflowSlot.assignedElements()) {
      if (element.slot !== defaultSlot.name) {
        element.slot = defaultSlot.name;
      }
    }
  }

  #reset() {
    const { list } = this.#refs;

    this.#unobserveChanges();
    this.#moveItemsToDefaultSlot();

    list.style.removeProperty("height");

    this.style.setProperty("--overflow-count", "0");
  }

  #updateMinimumReached(visibleElements) {
    if (this.minimumItems === null) return;

    const minimumReached = visibleElements.length < this.minimumItems;

    if (minimumReached) {
      this.setAttribute("minimum-reached", "");
    } else {
      this.removeAttribute("minimum-reached");
    }

    this.dispatchEvent(new OverflowMinimumEvent(minimumReached));
  }

  showAll() {
    const { placeholder } = this.#refs;

    placeholder.style.setProperty("width", "0");
    placeholder.style.setProperty("display", "none");

    this.setAttribute("disabled", "true");
  }

  #reflowItems = (listHeight = 0, lastVisibleElement = null) => {
    const { defaultSlot, overflowSlot, moreSlot, list, placeholder } =
      this.#refs;

    this.#unobserveChanges();
    this.#moveItemsToDefaultSlot();

    const elements = defaultSlot.assignedElements();

    if (!elements.at(-1)) {
      this.#observeChanges();
      return;
    }

    let visibleElements = [];
    let overflowingElements = [];

    let placeholderWidth = 0;
    let hasOverflow = false;

    if (listHeight > 0) {
      list.style.setProperty("height", `${listHeight}px`);
    }

    list.style.setProperty("flex-wrap", "wrap");

    placeholder.hidden = true;

    moreSlot.style.setProperty("order", "-1");
    moreSlot.hidden = false;

    lastVisibleElement?.style.setProperty("order", "-1");

    const moreSlotRect = moreSlot.getBoundingClientRect();

    for (const element of elements) {
      const elementRect = element.getBoundingClientRect();

      if (elementRect.top > moreSlotRect.top) {
        if (overflowingElements.length === 0) {
          placeholderWidth = elementRect.width;
        }

        hasOverflow = true;
        overflowingElements.push(element);
      } else {
        visibleElements.push(element);
      }
    }

    if (hasOverflow) {
      moreSlot.style.removeProperty("order");
    }

    lastVisibleElement?.style.removeProperty("order");

    for (const element of elements) {
      const targetSlot = overflowingElements.includes(element)
        ? overflowSlot.name
        : defaultSlot.name;

      if (element.slot !== targetSlot) {
        element.slot = targetSlot;
      }
    }

    list.style.setProperty(
      "counter-reset",
      `overflow-count ${overflowingElements.length}`,
    );

    this.style.setProperty("--overflow-count", `${overflowingElements.length}`);

    moreSlot.hidden = !hasOverflow;

    if (hasOverflow) {
      placeholder.style.width = `${placeholderWidth}px`;

      placeholder.hidden = false;
    }

    list.style.setProperty("overflow", "unset");

    if (hasOverflow) {
      this.#updateMinimumReached(visibleElements);
    }

    this.#observeChanges();
  };

  #observeChanges() {
    this.#resizeObserver.observe(this);

    this.#mutationObserver.observe(this, {
      childList: true,
    });
  }

  #unobserveChanges() {
    this.#resizeObserver.disconnect();
    this.#mutationObserver.disconnect();
  }
}

customElements.get("overflow-list") ??
  customElements.define("overflow-list", OverflowList);
