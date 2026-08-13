const trapFocusHandlers = {};

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      `
        summary,
        a[href],
        button:enabled,
        [tabindex]:not([tabindex^='-']),
        [draggable],
        area,
        input:not([type=hidden]):enabled,
        select:enabled,
        textarea:enabled,
        object,
        iframe
      `,
    ),
  );
}

export function trapFocus(container) {
  removeTrapFocus();

  const focusable = getFocusableElements(container);

  if (!focusable.length) {
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  trapFocusHandlers.keydown = (event) => {
    if (event.key !== "Tab") {
      return;
    }

    const activeElement = document.activeElement;

    if (!event.shiftKey && activeElement === last) {
      event.preventDefault();
      first?.focus();
      return;
    }

    if (
      event.shiftKey &&
      (activeElement === first || activeElement === container)
    ) {
      event.preventDefault();
      last?.focus();
    }
  };

  trapFocusHandlers.focusin = (event) => {
    if (event.target instanceof Node && !container.contains(event.target)) {
      event.stopPropagation();
      first?.focus();
    }
  };

  document.addEventListener("keydown", trapFocusHandlers.keydown, true);

  document.addEventListener("focusin", trapFocusHandlers.focusin, true);

  container.focus();
}

export function removeTrapFocus() {
  if (trapFocusHandlers.keydown) {
    document.removeEventListener("keydown", trapFocusHandlers.keydown, true);
  }

  if (trapFocusHandlers.focusin) {
    document.removeEventListener("focusin", trapFocusHandlers.focusin, true);
  }
}

export function cycleFocus(items, increment) {
  let targetIndex =
    items.findIndex((item) => item.matches(":focus")) + increment;

  if (targetIndex >= items.length) {
    targetIndex = 0;
  } else if (targetIndex < 0) {
    targetIndex = items.length - 1;
  }

  const targetItem = items[targetIndex];

  targetItem?.focus();
}
