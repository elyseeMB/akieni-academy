import {
  calculateHeaderGroupHeight,
  changeMetaThemeColor,
  onDocumentLoaded,
  updateAllHeaderCustomProperties,
} from "../../utilities/utils.js";
import { Component } from "../component.js";

/**
 * Custom element for the main site header with sticky scroll behavior
 * @extends {Component}
 */
export class HeaderComponent extends Component {
  /**@type {string[]} */
  requiredRefs = ["headerMenu", "headerRowTop"];
  /**@type {number|null} */
  #menuDrawerHiddenWidth = null;
  /**@type {IntersectionObserver|null} */
  #intersectionObserver = null;
  /**@type {boolean} */
  #offscreen = false;
  /**@type {number} */
  #lastScrollTop = 0;
  /**@type {number|null} */
  #timeout = null;
  /**@type {number|null} */
  #scrollRafId = null;
  /**@type {number} */
  #animationDelay = 150;
  /**@type {ResizeObserver} */
  #resizeObserver = new ResizeObserver(([entry]) => {
    if (!entry || !entry.borderBoxSize[0]) return;

    const roundedHeaderHeight = Math.round(entry.borderBoxSize[0].blockSize);
    document.body.style.setProperty(
      "--header-height",
      `${roundedHeaderHeight}px`,
    );

    if (
      this.#menuDrawerHiddenWidth &&
      window.innerWidth > this.#menuDrawerHiddenWidth
    ) {
      this.#updateMenuVisibility(false);
    }
  });

  /**
   * @type {(alwaysSticky?: boolean) => void}
   */
  #observeStickyPosition = (alwaysSticky = true) => {
    if (this.#intersectionObserver) return;

    const config = { threshold: alwaysSticky ? 1 : 0 };

    this.#intersectionObserver = new IntersectionObserver(([entry]) => {
      if (!entry) return;

      const { isIntersecting } = entry;

      if (alwaysSticky) {
        this.dataset.stickyState = isIntersecting ? "inactive" : "active";
        if (this.dataset.themeColor) {
          changeMetaThemeColor(this.dataset.themeColor);
        }
      } else {
        this.#offscreen =
          !isIntersecting || this.dataset.stickyState === "active";
      }
    }, config);

    this.#intersectionObserver.observe(this);
  };

  /**
   * @type {(event: Event) => void}
   */
  #handleOverflowMinimum = (event) => {
    this.#updateMenuVisibility(event.detail.minimumReached);
  };

  /**
   * @param {boolean} hideMenu
   * @return {void}
   */
  #updateMenuVisibility(hideMenu) {
    if (hideMenu) {
      this.#menuDrawerHiddenWidth = window.innerWidth;
      this.refs.headerMenu.hidden = true;
    } else {
      this.#menuDrawerHiddenWidth = null;
      this.refs.headerMenu.hidden = false;
    }
  }

  /**
   * @type {() => void}
   */
  #handleWindowScroll = () => {
    if (this.#scrollRafId === null) {
      this.#scrollRafId = requestAnimationFrame(() => {
        this.#scrollRafId = null;
        this.#customUpdateScrollState();
      });
    }
  };

  /**
   * @return {void}
   */
  #customUpdateScrollState = () => {
    const headerHeight = this.offsetHeight;
    const headerGroupHeight = calculateHeaderGroupHeight(this);
    const stickyMode = this.getAttribute("sticky");

    if (!this.#offscreen && stickyMode !== "always") return;

    const scrollTop = document.scrollingElement?.scrollTop ?? 0;
    const headerTop = this.getBoundingClientRect().top;
    const isScrollingUp = scrollTop < this.#lastScrollTop;
    const isAtTop = headerTop >= 0;

    if (this.#timeout) {
      clearTimeout(this.#timeout);
      this.#timeout = null;
    }

    if (stickyMode === "always") {
      if (isAtTop) {
        this.dataset.scrollDirection = "none";
        document.body.style.setProperty(
          "--header-group-height",
          `${headerGroupHeight}px`,
        );
      } else if (isScrollingUp) {
        this.dataset.scrollDirection = "up";
      } else {
        this.dataset.scrollDirection = "down";
        document.body.style.setProperty(
          "--header-group-height",
          `${headerHeight}px`,
        );
      }

      this.#lastScrollTop = scrollTop;
      return;
    }

    if (isScrollingUp) {
      this.removeAttribute("data-animating");

      if (isAtTop) {
        this.#offscreen = false;
        this.dataset.stickyState = "inactive";
        this.dataset.scrollDirection = "none";
      } else {
        this.dataset.stickyState = "active";
        this.dataset.scrollDirection = "up";
      }
    } else if (this.dataset.stickyState === "active") {
      document.body.style.setProperty(
        "--header-group-height",
        `${headerHeight}px`,
      );
      this.dataset.scrollDirection = "none";
      this.setAttribute("data-animating", "");

      this.#timeout = setTimeout(() => {
        this.dataset.stickyState = "idle";
        this.removeAttribute("data-animating");
      }, this.#animationDelay);
    } else {
      this.dataset.scrollDirection = "none";
      this.dataset.stickyState = "idle";
    }

    this.#lastScrollTop = scrollTop;
  };

  /**
   * @return {void}
   */
  connectedCallback() {
    super.connectedCallback();

    this.#resizeObserver.observe(this);
    this.addEventListener("overflowMinimum", this.#handleOverflowMinimum);

    const stickyMode = this.getAttribute("sticky");

    if (stickyMode) {
      this.#observeStickyPosition(stickyMode === "always");

      if (stickyMode === "scroll-up" || stickyMode === "always") {
        document.addEventListener("scroll", this.#handleWindowScroll);
      }
    }

    requestAnimationFrame(() => updateAllHeaderCustomProperties());
  }

  /**
   * @return {void}
   */
  disconnectedCallback() {
    super.disconnectedCallback();

    this.#resizeObserver.disconnect();
    this.#intersectionObserver?.disconnect();
    this.removeEventListener("overflowMinimum", this.#handleOverflowMinimum);
    document.removeEventListener("scroll", this.#handleWindowScroll);

    if (this.#scrollRafId !== null) {
      cancelAnimationFrame(this.#scrollRafId);
      this.#scrollRafId = null;
    }

    document.body.style.setProperty("--header-height", "0px");
  }
}

onDocumentLoaded(() => {
  const header = document.querySelector("header-component");
  const headerGroup = document.querySelector("#header-group");

  updateAllHeaderCustomProperties();

  if (!headerGroup) return;

  const resizeObserver = new ResizeObserver((entries) => {
    const headerGroupHeight = entries.reduce((totalHeight, entry) => {
      const shouldInclude =
        entry.target !== header ||
        (header.hasAttribute("transparent") &&
          header.parentElement?.nextElementSibling);

      return shouldInclude
        ? totalHeight + (entry.borderBoxSize[0]?.blockSize ?? 0)
        : totalHeight;
    }, 0);

    const roundedHeaderGroupHeight = Math.round(headerGroupHeight);
    document.body.style.setProperty(
      "--header-group-height",
      `${roundedHeaderGroupHeight}px`,
    );
  });

  if (header instanceof HTMLElement) {
    resizeObserver.observe(header);
  }

  const children = headerGroup.children;

  for (let i = 0; i < children.length; i++) {
    const element = children[i];
    if (element instanceof HTMLElement) {
      resizeObserver.observe(element);
    }
  }

  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        const children = headerGroup.children;

        for (let i = 0; i < children.length; i++) {
          const element = children[i];
          if (element instanceof HTMLElement) {
            resizeObserver.observe(element);
          }
        }
      }
    }
  }).observe(headerGroup, { childList: true });
});


