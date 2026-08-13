import { requestIdleCallback } from "../utilities/utils.js";

export class DeclarativeShadowElement extends HTMLElement {
  connectedCallback() {
    if (!this.shadowRoot) {
      const template = this.querySelector(
        ':scope > template[shadowrootmode="open"]',
      );

      if (!(template instanceof HTMLTemplateElement)) {
        return;
      }

      this.attachShadow({ mode: "open" }).append(
        template.content.cloneNode(true),
      );
    }
  }
}

export class Component extends DeclarativeShadowElement {
  refs = {};
  requiredRefs;

  #mutationObserver = new MutationObserver((mutations) => {
    const shouldUpdate = mutations.some(
      (m) =>
        (m.type === "attributes" && this.#isDescendant(m.target)) ||
        (m.type === "childList" &&
          [...m.addedNodes, ...m.removedNodes].some(this.#isDescendant)),
    );

    if (shouldUpdate) {
      this.#updateRefs();
    }
  });

  #isDescendant = (node) => getClosestComponent(getAncestor(node)) === this;

  get roots() {
    return this.shadowRoot ? [this, this.shadowRoot] : [this];
  }

  connectedCallback() {
    super.connectedCallback();
    registerEventListeners();
    this.#updateRefs();

    requestIdleCallback(() => {
      for (const root of this.roots) {
        this.#mutationObserver.observe(root, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["ref"],
          attributeOldValue: true,
        });
      }
    });
  }

  updatedCallback() {
    this.#mutationObserver.takeRecords();
    this.#updateRefs();
  }

  disconnectedCallback() {
    this.#mutationObserver.disconnect();
  }

  #updateRefs() {
    const refs = {};

    const elements = this.roots.reduce((acc, root) => {
      for (const element of root.querySelectorAll("[ref]")) {
        if (this.#isDescendant(element)) {
          acc.add(element);
        }
      }
      return acc;
    }, new Set());

    for (const ref of elements) {
      const refName = ref.getAttribute("ref") ?? "";
      const isArray = refName.endsWith("[]");
      const path = isArray ? refName.slice(0, -2) : refName;

      if (isArray) {
        const array = Array.isArray(refs[path]) ? refs[path] : [];
        array.push(ref);
        refs[path] = array;
      } else {
        refs[path] = ref;
      }
    }

    if (this.requiredRefs?.length) {
      for (const ref of this.requiredRefs) {
        if (!(ref in refs)) throw new MissingRefError(ref, this);
      }
    }

    this.refs = refs;
  }
}

function getAncestor(node) {
  if (node.parentNode) return node.parentNode;

  const root = node.getRootNode();
  return root instanceof ShadowRoot ? root.host : null;
}

function getClosestComponent(node) {
  if (!node) return null;

  if (
    node instanceof Component ||
    (node instanceof HTMLElement &&
      node.tagName.toLowerCase().endsWith("-component"))
  ) {
    return node;
  }

  const ancestor = getAncestor(node);
  return ancestor ? getClosestComponent(ancestor) : null;
}

let initialized = false;

function registerEventListeners() {
  if (initialized) return;
  initialized = true;

  const events = [
    "click",
    "change",
    "select",
    "focus",
    "blur",
    "submit",
    "input",
    "keydown",
    "keyup",
    "toggle",
  ];
  const shouldBubble = ["focus", "blur"];
  const expensiveEvents = ["pointerenter", "pointerleave"];

  for (const eventName of [...events, ...expensiveEvents]) {
    const attribute = `on:${eventName}`;

    document.addEventListener(
      eventName,
      (event) => {
        const element = getElement(event);
        if (!element) return;

        const proxiedEvent =
          event.target !== element
            ? new Proxy(event, {
                get(target, property) {
                  if (property === "target") return element;
                  const value = Reflect.get(target, property);
                  return typeof value === "function"
                    ? value.bind(target)
                    : value;
                },
              })
            : event;

        const value = element.getAttribute(attribute) ?? "";
        let [selector, method] = value.split("/");

        const matches = value.match(/([\/\?][^\/\?]+)([\/\?][^\/\?]+)$/);
        const data = matches ? matches[2] : null;

        const instance = selector
          ? selector.startsWith("#")
            ? document.querySelector(selector)
            : element.closest(selector)
          : getClosestComponent(element);

        if (!(instance instanceof Component) || !method) return;

        method = method.replace(/\?.*/, "");
        const callback = instance[method];

        if (typeof callback === "function") {
          try {
            const args = [proxiedEvent];
            if (data) args.unshift(parseData(data));
            callback.call(instance, ...args);
          } catch (error) {
            console.error(error);
          }
        }
      },
      { capture: true },
    );
  }

  function getElement(event) {
    const target = event.composedPath?.()[0] ?? event.target;

    if (target instanceof Element) {
      if (target.hasAttribute(`on:${event.type}`)) return target;

      if (expensiveEvents.includes(event.type)) return null;

      if (event.bubbles || shouldBubble.includes(event.type)) {
        return target.closest(`[on\\:${event.type}]`);
      }
    }

    return null;
  }
}

function parseData(str) {
  const delimiter = str[0];
  const data = str.slice(1);

  if (delimiter === "?") {
    return Object.fromEntries(
      Array.from(new URLSearchParams(data).entries()).map(([key, value]) => [
        key,
        parseValue(value),
      ]),
    );
  }

  return parseValue(data);
}

function parseValue(str) {
  if (str === "true") return true;
  if (str === "false") return false;

  const maybeNumber = Number(str);
  return !isNaN(maybeNumber) && str.trim() !== "" ? maybeNumber : str;
}

class MissingRefError extends Error {
  constructor(ref, component) {
    super(
      `Required ref "${ref}" not found in component ${component.tagName.toLowerCase()}`,
    );
  }
}
