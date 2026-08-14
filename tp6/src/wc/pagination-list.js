import { ThemeEvents } from "../theme/event.js";
import { requestIdleCallback, viewTransition } from "../utilities/utils.js";
import { Component } from "../wc/component.js";
import { PaginatedListAspectRatioHelper } from "../wc/ppaginated-list-aspect-ratio.js";
import { sectionRenderer } from "../wc/section-renderer.js";

export default class PaginatedList extends Component {
  pages = new Map();
  infinityScrollObserver;

  #resolveNextPagePromise = null;
  #resolvePreviousPagePromise = null;
  #aspectRatioHelper;

  connectedCallback() {
    super.connectedCallback();

    const templateCard = this.querySelector('[ref="cardGallery"]');

    if (templateCard) {
      this.#aspectRatioHelper = new PaginatedListAspectRatioHelper({
        templateCard,
      });
    }

    this.#fetchPage("next");
    this.#fetchPage("previous");
    this.#observeViewMore();

    document.addEventListener(
      ThemeEvents.FilterUpdate,
      this.#handleFilterUpdate,
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.infinityScrollObserver?.disconnect();

    document.removeEventListener(
      ThemeEvents.FilterUpdate,
      this.#handleFilterUpdate,
    );
  }

  #observeViewMore() {
    const { viewMorePrevious, viewMoreNext } = this.refs;

    if (!viewMorePrevious && !viewMoreNext) return;

    this.infinityScrollObserver ??= new IntersectionObserver(
      async (entries) => {
        if (viewTransition.current) await viewTransition.current;

        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const {
            viewMorePrevious: currentPrevious,
            viewMoreNext: currentNext,
          } = this.refs;

          if (entry.target === currentPrevious) {
            this.#renderPreviousPage();
          } else if (entry.target === currentNext) {
            this.#renderNextPage();
          }
        }
      },
      { rootMargin: "100px" },
    );

    if (viewMorePrevious) this.infinityScrollObserver.observe(viewMorePrevious);
    if (viewMoreNext) this.infinityScrollObserver.observe(viewMoreNext);
  }

  #shouldUsePage(pageInfo) {
    if (!pageInfo) return false;

    const { grid } = this.refs;
    const lastPage = grid?.dataset.lastPage;

    if (!lastPage) return false;

    return pageInfo.page >= 1 && pageInfo.page <= Number(lastPage);
  }

  async #fetchPage(type) {
    const page = this.#getPage(type);

    const resolvePromise = () => {
      if (type === "next") {
        this.#resolveNextPagePromise?.();
        this.#resolveNextPagePromise = null;
      } else {
        this.#resolvePreviousPagePromise?.();
        this.#resolvePreviousPagePromise = null;
      }
    };

    if (!page || !this.#shouldUsePage(page)) {
      resolvePromise();
      return;
    }

    await this.#fetchSpecificPage(page.page, page.url);
    resolvePromise();
  }

  async #fetchSpecificPage(pageNumber, url) {
    const pageInfo = { page: pageNumber, url };

    if (!url) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set("page", pageNumber.toString());
      newUrl.hash = "";
      pageInfo.url = newUrl;
    }

    if (!this.#shouldUsePage(pageInfo)) return;

    const pageContent = await sectionRenderer.getSectionHTML(
      this.sectionId,
      true,
      pageInfo.url,
    );

    this.pages.set(pageNumber, pageContent);
  }

  async #renderNextPage() {
    const { grid } = this.refs;
    if (!grid) return;

    const nextPage = this.#getPage("next");
    if (!nextPage || !this.#shouldUsePage(nextPage)) return;

    let nextPageItemElements = this.#getGridForPage(nextPage.page);

    if (!nextPageItemElements) {
      const promise = new Promise((resolve) => {
        this.#resolveNextPagePromise = resolve;
      });

      this.#fetchPage("next");
      await promise;

      nextPageItemElements = this.#getGridForPage(nextPage.page);
      if (!nextPageItemElements) return;
    }

    grid.append(...nextPageItemElements);
    this.#aspectRatioHelper.processNewElements();
    history.pushState("", "", nextPage.url.toString());

    requestIdleCallback(() => {
      this.#fetchPage("next");
    });
  }

  async #renderPreviousPage() {
    const { grid } = this.refs;
    if (!grid) return;

    const previousPage = this.#getPage("previous");
    if (!previousPage || !this.#shouldUsePage(previousPage)) return;

    let previousPageItemElements = this.#getGridForPage(previousPage.page);

    if (!previousPageItemElements) {
      const promise = new Promise((resolve) => {
        this.#resolvePreviousPagePromise = resolve;
      });

      this.#fetchPage("previous");
      await promise;

      previousPageItemElements = this.#getGridForPage(previousPage.page);
      if (!previousPageItemElements) return;
    }

    const scrollTop = window.scrollY;
    const firstElement = grid.firstElementChild;
    const oldHeight = firstElement
      ? firstElement.getBoundingClientRect().top + window.scrollY
      : 0;

    grid.prepend(...previousPageItemElements);
    this.#aspectRatioHelper.processNewElements();
    history.pushState("", "", previousPage.url.toString());

    if (firstElement) {
      const heightDiff =
        firstElement.getBoundingClientRect().top + window.scrollY - oldHeight;
      window.scrollTo({ top: scrollTop + heightDiff, behavior: "instant" });
    }

    requestIdleCallback(() => {
      this.#fetchPage("previous");
    });
  }

  #getPage(type) {
    const { cards } = this.refs;
    const isPrevious = type === "previous";

    if (!Array.isArray(cards)) return;

    const targetCard = cards[isPrevious ? 0 : cards.length - 1];
    if (!targetCard) return;

    const currentCardPage = Number(targetCard.dataset.page);
    const page = isPrevious ? currentCardPage - 1 : currentCardPage + 1;

    const url = new URL(window.location.href);
    url.searchParams.set("page", page.toString());
    url.hash = "";

    return { page, url };
  }

  #getGridForPage(page) {
    const pageHTML = this.pages.get(page);
    if (!pageHTML) return;

    const gridElement = new DOMParser()
      .parseFromString(pageHTML, "text/html")
      .querySelector('[ref="grid"]');

    return gridElement?.querySelectorAll(':scope > [ref="cards[]"]');
  }

  get sectionId() {
    const id = this.getAttribute("section-id");
    if (!id) throw new Error("The section-id attribute is required");
    return id;
  }

  #handleFilterUpdate = () => {
    this.pages.clear();
    this.#resolveNextPagePromise?.();
    this.#resolvePreviousPagePromise?.();
    this.#resolveNextPagePromise = null;
    this.#resolvePreviousPagePromise = null;

    const currentLastPage = this.refs.grid?.dataset.lastPage;

    const observer = new MutationObserver(() => {
      if (this.refs.grid?.dataset.lastPage !== currentLastPage) {
        observer.disconnect();
        if (!this.isConnected) return;

        this.#observeViewMore();
        this.#fetchPage("next");
      }
    });

    const { grid } = this.refs;

    if (grid) {
      observer.observe(grid, {
        attributes: true,
        attributeFilter: ["data-last-page"],
        childList: true,
      });

      setTimeout(() => {
        observer?.disconnect();
      }, 3000);
    }
  };
}
