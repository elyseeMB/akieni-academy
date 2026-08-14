import { Component } from "../wc/component.js";
import {
  center,
  closest,
  clamp,
  mediaQueryLarge,
  prefersReducedMotion,
  preventDefault,
  viewTransition,
  scheduler,
} from "../utilities/utils.js";
import { Scroller, scrollIntoView } from "../wc/scrolling.js";
import { SlideshowSelectEvent } from "../theme/event.js";

const SLIDE_VISIBLITY_THRESHOLD = 0.7;

class SlideshowViewportObserver {
  static #instance = null;
  #observer = null;

  static getInstance() {
    return this.#instance || (this.#instance = new SlideshowViewportObserver());
  }

  observe(slideshow) {
    if (!this.#observer) {
      this.#observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const slideshowElement = entry.target;
            if (entry.isIntersecting) {
              slideshowElement.setAttribute("in-viewport", "");
            } else {
              slideshowElement.removeAttribute("in-viewport");
            }
          }
        },
        { rootMargin: "100px" },
      );
    }

    this.#observer.observe(slideshow);
  }

  unobserve(slideshow) {
    this.#observer?.unobserve(slideshow);
    slideshow.removeAttribute("in-viewport");
  }
}

export class Slideshow extends Component {
  static get observedAttributes() {
    return ["initial-slide"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name !== "initial-slide" || oldValue === newValue) return;

    queueMicrotask(() => {
      if (!this.isConnected || !this.#scroll || !this.refs.slides) return;

      const index = parseInt(newValue, 10) || 0;
      const slide_id = this.refs.slides[index]?.getAttribute("slide-id");

      if (slide_id) {
        this.select({ id: slide_id }, undefined, { animate: false });
      }
    });
  }

  requiredRefs = ["scroller"];

  async connectedCallback() {
    super.connectedCallback();

    SlideshowViewportObserver.getInstance().observe(this);

    if (viewTransition.current) {
      await viewTransition.current;
      if (!this.isConnected) return;
    }

    if ((this.slides?.length || 0) <= 1) {
      this.#setupSlideshowWithoutControls();
    } else {
      this.#setupSlideshow();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    SlideshowViewportObserver.getInstance().unobserve(this);

    if (this.#scroll) {
      const { scroller } = this.refs;
      scroller.removeEventListener("mousedown", this.#handleMouseDown);
      this.#scroll.destroy();
    }

    if ((this.slides?.length || 0) > 1) {
      this.removeEventListener("mouseenter", this.suspend);
      this.removeEventListener("mouseleave", this.resume);
      this.removeEventListener("pointerenter", this.#handlePointerEnter);
      document.removeEventListener(
        "visibilitychange",
        this.#handleVisibilityChange,
      );
    }

    this.#resizeObserver?.disconnect();

    if (this.#intersectionObserver) {
      this.#intersectionObserver.disconnect();
      this.#intersectionObserver = null;
    }
  }

  get isNested() {
    return this.parentElement?.closest("slideshow-component") !== null;
  }

  get initialSlide() {
    return this.refs.slides?.[this.initialSlideIndex];
  }

  async select(input, event, options = {}) {
    if (this.#disabled || !this.refs.slides?.length || !this.#scroll) {
      return;
    }

    const currentSlide = this.slides?.[this.current];

    for (const slide of this.refs.slides) {
      if (slide.hasAttribute("reveal")) {
        slide.removeAttribute("reveal");
        slide.setAttribute("aria-hidden", "true");
      }
    }

    let requestedIndex = (() => {
      if (typeof input === "number") return input;
      if (typeof input === "string") return parseInt(input, 10);

      if ("id" in input) {
        const requestedSlide = this.refs.slides.find(
          (slide) => slide.getAttribute("slide-id") == input.id,
        );

        if (!requestedSlide || !this.slides) return undefined;

        if (requestedSlide.hasAttribute("hidden")) {
          requestedSlide.setAttribute("reveal", "");
          requestedSlide.setAttribute("aria-hidden", "false");
        }

        return this.slides.indexOf(requestedSlide);
      }
    })();

    const { current } = this;
    const { slides } = this;

    if (
      !slides?.length ||
      requestedIndex === undefined ||
      isNaN(requestedIndex)
    ) {
      return;
    }

    const requestedSlideElement = slides?.[requestedIndex];
    if (currentSlide === requestedSlideElement) return;

    if (!this.infinite) {
      requestedIndex = clamp(requestedIndex, 0, slides.length - 1);
    }

    event?.preventDefault();

    const { animate = true } = options;
    const lastIndex = slides.length - 1;
    let index = requestedIndex;

    if (requestedIndex < 0) {
      index = lastIndex;
    } else if (requestedIndex > lastIndex) {
      index = 0;
    }

    const isAdjacentSlide =
      Math.abs(index - current) <= 1 &&
      requestedIndex >= 0 &&
      requestedIndex <= lastIndex;

    const { visibleSlides } = this;
    const instant = prefersReducedMotion() || !animate;

    if (!instant && !isAdjacentSlide && visibleSlides.length === 1) {
      this.#disabled = true;
      await this.#scroll.finished;

      const targetSlide = slides[index];
      if (!targetSlide || !currentSlide) return;

      const placeholder = document.createElement("slideshow-slide");
      targetSlide.before(placeholder);

      if (requestedIndex < current) {
        currentSlide.before(targetSlide);
      } else {
        currentSlide.after(targetSlide);
      }

      if (current === 0) {
        this.#scroll.to(currentSlide, { instant: true });
      }

      queueMicrotask(async () => {
        await this.#scroll.finished;
        this.#disabled = false;
        placeholder.replaceWith(targetSlide);
        this.#scroll.to(targetSlide, { instant: true });

        requestAnimationFrame(() => {
          this.setAttribute("refreshing-timeline", "");
          requestAnimationFrame(() => {
            this.removeAttribute("refreshing-timeline");
          });
        });
      });
    }

    const slide = slides[index];
    if (!slide) return;

    const previousIndex = this.current;

    slide.setAttribute("aria-hidden", "false");
    this.#scroll?.to(slide, { instant });
    this.current = this.slides?.indexOf(slide) || 0;
    this.#centerSelectedThumbnail(index, instant ? "instant" : "smooth");

    this.dispatchEvent(
      new SlideshowSelectEvent({
        index,
        previousIndex,
        userInitiated: event != null,
        trigger: "select",
        slide,
        id: slide.getAttribute("slide-id"),
      }),
    );
  }

  next(event, options) {
    event?.preventDefault();
    this.select(this.nextIndex, event, options);
  }

  previous(event, options) {
    event?.preventDefault();
    this.select(this.previousIndex, event, options);
  }

  play(interval = this.autoplayInterval) {
    if (this.#interval) return;

    this.paused = false;
    this.#interval = setInterval(() => {
      if (!this.matches(":hover") && !document.hidden) {
        this.next();
      }
    }, interval);
  }

  pause() {
    this.paused = true;
    this.suspend();
  }

  get paused() {
    return this.hasAttribute("paused");
  }

  set paused(value) {
    if (value) {
      this.setAttribute("paused", "");
    } else {
      this.removeAttribute("paused");
    }
  }

  suspend() {
    clearInterval(this.#interval);
    this.#interval = undefined;
  }

  resume() {
    if (!this.autoplay || this.paused) return;
    this.pause();
    this.play();
  }

  get autoplay() {
    return !!this.autoplayInterval;
  }

  get autoplayInterval() {
    const interval = this.getAttribute("autoplay");
    const value = parseInt(`${interval}`, 10);

    if (!Number.isNaN(value)) return value * 1000;
  }

  #current = 0;

  get current() {
    return this.#current;
  }

  set current(value) {
    const { current, thumbnails, dots, slides, previous, next } = this.refs;

    this.#current = value;

    if (current) {
      current.textContent = `${value + 1}`;
    }

    for (const controls of [thumbnails, dots]) {
      controls?.forEach((el, i) =>
        el.setAttribute("aria-selected", `${i === value}`),
      );
    }

    if (previous) {
      previous.disabled = !this.infinite && value === 0;
    }

    if (next) {
      next.disabled = !!(
        !this.infinite &&
        slides &&
        this.nextIndex >= slides.length
      );
    }
  }

  get infinite() {
    return this.getAttribute("infinite") != null;
  }

  get visibleSlides() {
    return this.#visibleSlides;
  }

  get previousIndex() {
    const { current, visibleSlides } = this;
    const modifier = visibleSlides.length > 1 ? visibleSlides.length : 1;
    return current - modifier;
  }

  get nextIndex() {
    const { current, visibleSlides } = this;
    const modifier = visibleSlides.length > 1 ? visibleSlides.length : 1;
    return current + modifier;
  }

  get atStart() {
    const { current, slides } = this;
    return slides?.length ? current === 0 : false;
  }

  get atEnd() {
    const { current, slides } = this;
    return slides?.length ? current === slides.length - 1 : false;
  }

  set disabled(value) {
    this.setAttribute("disabled", String(value));
  }

  get disabled() {
    return (
      this.getAttribute("disabled") === "true" ||
      (this.hasAttribute("mobile-disabled") && !mediaQueryLarge.matches)
    );
  }

  #disabled = false;
  #interval = undefined;
  #scroll;
  #resizeObserver;
  #intersectionObserver = null;
  #visibleSlides = [];

  #setupSlideshowWithoutControls() {
    this.current = 0;

    if (this.hasAttribute("auto-hide-controls")) {
      const { slideshowControls } = this.refs;
      if (slideshowControls instanceof HTMLElement) {
        slideshowControls.hidden = true;
      }
    }

    if (this.refs.slides?.[0]) {
      this.refs.slides[0].setAttribute("aria-hidden", "false");
    }
  }

  #setupSlideshow() {
    this.#setupIntersectionObserver();

    const { scroller } = this.refs;

    this.#scroll = new Scroller(scroller, {
      onScroll: this.#handleScroll,
      onScrollStart: this.#onTransitionInit,
      onScrollEnd: this.#onTransitionEnd,
    });

    scroller.addEventListener("mousedown", this.#handleMouseDown);
    this.addEventListener("mouseenter", this.suspend);
    this.addEventListener("mouseleave", this.resume);
    this.addEventListener("pointerenter", this.#handlePointerEnter);
    document.addEventListener("visibilitychange", this.#handleVisibilityChange);

    this.#updateControlsVisibility();
    this.disabled = this.isNested || this.disabled;
    this.resume();
    this.current = this.initialSlideIndex;

    scheduler.schedule(() => {
      let visibleSlidesAmount = 0;
      const initialSlideId = this.initialSlide?.getAttribute("slide-id");

      requestAnimationFrame(() => {
        if (this.initialSlideIndex !== 0 && initialSlideId) {
          this.select({ id: initialSlideId }, undefined, { animate: false });
          visibleSlidesAmount = 1;
        } else {
          visibleSlidesAmount = this.#updateVisibleSlides();

          if (visibleSlidesAmount === 0) {
            this.select(0, undefined, { animate: false });
            visibleSlidesAmount = 1;
          }
        }
      });

      this.#resizeObserver = new ResizeObserver(async () => {
        if (viewTransition.current) {
          await viewTransition.current;
        }

        if (visibleSlidesAmount > 1) {
          this.#updateVisibleSlides();
        }

        if (this.hasAttribute("auto-hide-controls")) {
          this.#updateControlsVisibility();
        }
      });

      this.#resizeObserver.observe(this.refs.slideshowContainer);
    });
  }

  #handleScroll = () => {
    const previousIndex = this.#current;
    const index = this.#sync();

    if (index === previousIndex) return;

    const slide = this.slides?.[index];
    if (slide) {
      this.dispatchEvent(
        new SlideshowSelectEvent({
          index,
          previousIndex,
          userInitiated: true,
          trigger: "scroll",
          slide,
          id: slide.getAttribute("slide-id"),
        }),
      );
    }
  };

  #onTransitionInit = () => {
    this.setAttribute("transitioning", "");
  };

  #onTransitionEnd = () => {
    this.#updateVisibleSlides();
    this.removeAttribute("transitioning");
  };

  #sync = () => {
    const { slides } = this;
    if (!slides) return (this.current = 0);
    if (!this.#scroll) return (this.current = 0);

    const visibleSlides = this.visibleSlides;
    if (!visibleSlides.length) return this.current;

    const { axis } = this.#scroll;
    const { scroller } = this.refs;
    const centers = visibleSlides.map((slide) => center(slide, axis));

    const referencePoint =
      visibleSlides.length > 1
        ? scroller.getBoundingClientRect()[axis]
        : center(scroller, axis);

    const closestCenter = closest(centers, referencePoint);
    const closestVisibleSlide = visibleSlides[centers.indexOf(closestCenter)];

    if (!closestVisibleSlide) return (this.current = 0);

    const index = slides.indexOf(closestVisibleSlide);
    return (this.current = index);
  };

  #dragging = false;

  #handleMouseDown = (event) => {
    const { slides } = this;

    if (
      !slides ||
      slides.length <= 1 ||
      !(event.target instanceof Element) ||
      this.disabled ||
      this.#dragging ||
      event.target.closest("model-viewer")
    ) {
      return;
    }

    event.preventDefault();

    const { axis } = this.#scroll;
    const startPosition = event[axis];
    const controller = new AbortController();
    const { signal } = controller;
    const startTime = performance.now();

    let previous = startPosition;
    let velocity = 0;
    let moved = false;
    let distanceTravelled = 0;

    this.#dragging = true;

    const onPointerMove = (event2) => {
      const current = event2[axis];
      const initialDelta = startPosition - current;

      if (!initialDelta) return;

      if (!moved) {
        moved = true;
        this.setPointerCapture(event2.pointerId);
        document.addEventListener("click", preventDefault, {
          once: true,
          signal,
        });

        const movingRight = initialDelta < 0;
        const movingLeft = initialDelta > 0;
        const closestSlideshow = this.parentElement?.closest(
          "slideshow-component",
        );
        const isNested =
          closestSlideshow instanceof Slideshow && closestSlideshow !== this;
        const cannotMoveInDirection =
          (movingRight && this.atStart) || (movingLeft && this.atEnd);

        if (isNested && cannotMoveInDirection) {
          controller.abort();
          return;
        }

        this.pause();
        this.setAttribute("dragging", "");
      }

      event2.stopImmediatePropagation();

      const delta = previous - current;
      const timeDelta = performance.now() - startTime;

      velocity = Math.round((delta / timeDelta) * 1000);
      previous = current;
      distanceTravelled += Math.abs(delta);

      this.#scroll.by(delta, { instant: true });
    };

    const onPointerUp = async (event2) => {
      controller.abort();

      const { current, slides: slides2 } = this;
      const { scroller } = this.refs;

      this.#dragging = false;

      if (!slides2?.length || !scroller) return;

      const direction = Math.sign(velocity);
      const next = this.#sync();
      const modifier =
        current !== next || Math.abs(velocity) < 10 || distanceTravelled < 10
          ? 0
          : direction;
      const newIndex = clamp(next + modifier, 0, slides2.length - 1);
      const newSlide = slides2[newIndex];
      const currentIndex = this.current;

      if (!newSlide) {
        throw new Error(`Slide not found at index ${newIndex}`);
      }

      this.#scroll.to(newSlide);
      this.removeAttribute("dragging");
      this.releasePointerCapture(event2.pointerId);
      this.#centerSelectedThumbnail(newIndex);

      this.dispatchEvent(
        new SlideshowSelectEvent({
          index: newIndex,
          previousIndex: currentIndex,
          userInitiated: true,
          trigger: "drag",
          slide: newSlide,
          id: newSlide.getAttribute("slide-id"),
        }),
      );

      this.current = newIndex;

      await this.#scroll.finished;

      if (!this.#dragging) {
        this.#scroll.snap = true;
        this.resume();
      }
    };

    this.#scroll.snap = false;

    document.addEventListener("pointermove", onPointerMove, { signal });
    document.addEventListener("pointerup", onPointerUp, { signal });
    document.addEventListener("pointerdown", onPointerUp, { signal });
    document.addEventListener("pointercancel", onPointerUp, { signal });
    document.addEventListener("pointercapturelost", onPointerUp, { signal });
  };

  #handlePointerEnter = () => {
    this.setAttribute("actioned", "");
  };

  get slides() {
    return this.refs.slides?.filter(
      (slide) => !slide.hasAttribute("hidden") || slide.hasAttribute("reveal"),
    );
  }

  get initialSlideIndex() {
    const initialSlide = this.getAttribute("initial-slide");
    return initialSlide == null ? 0 : parseInt(initialSlide, 10);
  }

  #handleVisibilityChange = () =>
    document.hidden ? this.pause() : this.resume();

  #updateControlsVisibility() {
    if (!this.hasAttribute("auto-hide-controls")) return;

    const { scroller, slideshowControls } = this.refs;

    if (slideshowControls instanceof HTMLElement) {
      slideshowControls.hidden = scroller.scrollWidth <= scroller.offsetWidth;
    }
  }

  #setupIntersectionObserver() {
    const { slides, scroller } = this.refs;

    if (!slides?.length) return;

    this.#intersectionObserver?.disconnect();

    this.#intersectionObserver = new IntersectionObserver(
      (entries) => {
        const allEntries = [
          ...entries,
          ...(this.#intersectionObserver
            ? this.#intersectionObserver.takeRecords()
            : []),
        ];

        for (const entry of allEntries) {
          const slide = entry.target;
          const isCurrentlyVisible = this.#visibleSlides.includes(slide);
          const shouldBeVisible =
            entry.intersectionRatio >= SLIDE_VISIBLITY_THRESHOLD;

          if (shouldBeVisible && !isCurrentlyVisible) {
            this.#visibleSlides.push(slide);
          } else if (!shouldBeVisible && isCurrentlyVisible) {
            const index = this.#visibleSlides.indexOf(slide);
            if (index > -1) {
              this.#visibleSlides.splice(index, 1);
            }
          }
        }

        this.#visibleSlides.sort(
          (a, b) => slides.indexOf(a) - slides.indexOf(b),
        );

        this.#updateVisibleSlides();
      },
      {
        root: scroller,
        threshold: SLIDE_VISIBLITY_THRESHOLD,
        rootMargin: "1px",
      },
    );

    slides.forEach((slide) => {
      this.#intersectionObserver?.observe(slide);
    });
  }

  #centerSelectedThumbnail(index, behavior = "smooth") {
    const selectedThumbnail = this.refs.thumbnails?.[index];
    if (!selectedThumbnail) return;

    const { thumbnailsContainer } = this.refs;
    if (!thumbnailsContainer || !(thumbnailsContainer instanceof HTMLElement)) {
      return;
    }

    const { slideshowControls } = this.refs;
    if (!slideshowControls || !(slideshowControls instanceof HTMLElement)) {
      return;
    }

    scrollIntoView(selectedThumbnail, {
      ancestor: thumbnailsContainer,
      behavior,
      block: "center",
      inline: "center",
    });
  }

  #updateVisibleSlides() {
    const { slides } = this;
    if (!slides || !slides.length) return 0;

    const visibleSlides = this.visibleSlides;

    scheduler.schedule(() => {
      slides.forEach((slide) => {
        const isVisible = visibleSlides.includes(slide);
        slide.setAttribute("aria-hidden", `${!isVisible}`);
      });
    });

    return visibleSlides.length;
  }
}

customElements.get("slideshow-component") ||
  customElements.define("slideshow-component", Slideshow);
