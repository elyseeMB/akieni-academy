export const requestIdleCallback =
  typeof window.requestIdleCallback === "function"
    ? window.requestIdleCallback
    : setTimeout;

export const yieldToMainThread = () =>
  "yield" in scheduler
    ? scheduler.yield()
    : new Promise((resolve) => {
        requestAnimationFrame(() => {
          setTimeout(resolve, 0);
        });
      });

export function supportsViewTransitions() {
  return typeof document.startViewTransition === "function";
}

const viewTransition = { current: undefined };

const viewTransitionTypes = {
  "product-grid": async () => {
    const grid = document.querySelector(".product-grid");
    const productCards = [
      ...document.querySelectorAll(".product-grid .product-grid__item"),
    ];

    if (!grid || !productCards.length) return;

    // Note: this awaits the idle-callback promise, then returns the cleanup
    // function below (comma operator in the original minified source).
    await new Promise((resolve) =>
      requestIdleCallback(() => {
        const cardsToAnimate = getCardsToAnimate(grid, productCards);

        if (cardsToAnimate > 0) {
          productCards.forEach((card, index) => {
            if (index < cardsToAnimate) {
              card.style.setProperty(
                "view-transition-name",
                `product-card-${card.dataset.productId}`,
              );
            } else {
              card.style.setProperty("content-visibility", "hidden");
            }
          });
        } else {
          productCards.forEach((card) => {
            card.style.setProperty(
              "view-transition-name",
              `product-card-${card.dataset.productId}`,
            );
          });
        }

        resolve(null);
      }),
    );

    return () =>
      productCards.forEach((card) => {
        card.style.removeProperty("view-transition-name");
        card.style.removeProperty("content-visibility");
      });
  },
};

export function startViewTransition(callback, types) {
  if (!supportsViewTransitions()) {
    callback();
    return Promise.resolve();
  }

  if (prefersReducedMotion()) {
    console.info(
      "[view-transition] Animation ignorée : prefers-reduced-motion est actif",
    );
    callback();
    return Promise.resolve();
  }

  return new Promise(async (resolve) => {
    let cleanupFunctions = [];

    if (types) {
      for (const type of types) {
        if (viewTransitionTypes[type]) {
          const cleanupFunction = await viewTransitionTypes[type]();
          if (cleanupFunction) cleanupFunctions.push(cleanupFunction);
        }
      }
    }

    const transition = document.startViewTransition(callback);

    if (!viewTransition.current) {
      viewTransition.current = transition.finished;
    }

    if (types) {
      types.forEach((type) => transition.types?.add(type));
    }

    transition.finished.then(() => {
      viewTransition.current = undefined;
      cleanupFunctions.forEach((cleanupFunction) => cleanupFunction());
      resolve();
    });
  });
}

export function debounce(fn, wait) {
  let timeout;

  function debounced(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait);
  }

  debounced.cancel = () => {
    clearTimeout(timeout);
  };

  return debounced;
}

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

export function prefersReducedMotion() {
  return reducedMotion.matches;
}

export function onDocumentLoaded(callback) {
  if (document.readyState === "complete") {
    callback();
  } else {
    window.addEventListener("load", callback);
  }
}

export function onAnimationEnd(
  elements,
  callback,
  options = { subtree: true },
) {
  const animationPromises = (
    Array.isArray(elements)
      ? elements.flatMap((element) => element.getAnimations(options))
      : elements.getAnimations(options)
  ).reduce((acc, animation) => {
    if (animation.timeline instanceof DocumentTimeline) {
      acc.push(animation.finished);
    }
    return acc;
  }, []);

  return Promise.allSettled(animationPromises).then(callback);
}

export function isClickedOutside(event, element) {
  if (
    event.target instanceof HTMLDialogElement ||
    !(event.target instanceof Element)
  ) {
    return !isPointWithinElement(event.clientX, event.clientY, element);
  }

  return !element.contains(event.target);
}

function isPointWithinElement(x, y, element) {
  const { left, right, top, bottom } = element.getBoundingClientRect();
  return x >= left && x <= right && y >= top && y <= bottom;
}

export const mediaQueryLarge = matchMedia("(min-width: 750px)");

export function changeMetaThemeColor(color) {
  const metaThemeColor = document.head.querySelector(
    'meta[name="theme-color"]',
  );

  if (metaThemeColor && color) {
    metaThemeColor.setAttribute("content", color);
  }
}

export class ResizeNotifier extends ResizeObserver {
  #initialized = false;

  constructor(callback) {
    super((entries) => {
      if (this.#initialized) return callback(entries, this);
      this.#initialized = true;
    });
  }

  disconnect() {
    this.#initialized = false;
    super.disconnect();
  }
}

export function calculateHeaderGroupHeight(
  header = document.querySelector("#header-component"),
  headerGroup = document.querySelector("#header-group"),
) {
  if (!headerGroup) return 0;

  let totalHeight = 0;
  const children = headerGroup.children;

  for (let i = 0; i < children.length; i++) {
    const element = children[i];

    if (element !== header && element instanceof HTMLElement) {
      totalHeight += element.offsetHeight;
    }
  }

  if (
    header instanceof HTMLElement &&
    header.hasAttribute("transparent") &&
    header.parentElement?.nextElementSibling
  ) {
    return totalHeight + header.offsetHeight;
  }

  return totalHeight;
}

function updateHeaderHeights() {
  const header = document.querySelector("header-component");
  if (!(header instanceof HTMLElement)) return;

  const headerHeight = header.offsetHeight;
  const headerGroupHeight = calculateHeaderGroupHeight(header);

  document.body.style.setProperty("--header-height", `${headerHeight}px`);
  document.body.style.setProperty(
    "--header-group-height",
    `${headerGroupHeight}px`,
  );
}

export function updateAllHeaderCustomProperties() {
  updateHeaderHeights();
}

function getCardsToAnimate(grid, cards) {
  if (!grid || !cards || cards.length === 0) return 0;

  const itemSample = cards[0];
  if (!itemSample) return 0;

  const gridRect = grid.getBoundingClientRect();
  const visibleArea = {
    top: Math.max(0, gridRect.top),
    bottom: Math.min(window.innerHeight, gridRect.bottom),
  };
  const visibleHeight = Math.round(visibleArea.bottom - visibleArea.top);

  if (visibleHeight <= 0) return 0;

  const cardSample = itemSample.querySelector("product-card");
  const gridStyle = getComputedStyle(grid);
  const galleryAspectRatio =
    cardSample?.refs?.cardGallery?.style.getPropertyValue(
      "--gallery-aspect-ratio",
    ) || "";

  let aspectRatio = parseFloat(galleryAspectRatio) || 0.5;

  if (galleryAspectRatio?.includes("/")) {
    const [width = "1", height = "2"] = galleryAspectRatio.split("/");
    aspectRatio = parseInt(width, 10) / parseInt(height, 10);
  }

  const cardGap =
    parseInt(
      cardSample?.refs?.productCardLink?.style.getPropertyValue(
        "--product-card-gap",
      ) || "",
    ) || 12;
  const gridGap =
    parseInt(gridStyle.getPropertyValue("--product-grid-gap")) || 12;
  const detailsSize = ((parseInt(gridStyle.fontSize) || 16) + 2) * 2;
  const isMobile = window.innerWidth < 750;
  const cardWidth = isMobile ? Math.round((gridRect.width - gridGap) / 2) : 100;
  const cardHeight =
    Math.round(cardWidth / aspectRatio) + cardGap + detailsSize;
  const columnsInGrid = isMobile
    ? 2
    : Math.floor((gridRect.width + gridGap) / (cardWidth + gridGap));
  const rowsInGrid = Math.ceil(
    (visibleHeight - gridGap) / (cardHeight + gridGap),
  );

  return columnsInGrid * rowsInGrid;
}
