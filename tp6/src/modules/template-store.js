const cache = new Map();

function getPath(item, path) {
  if (item == null) {
    return undefined;
  }

  if (!path) {
    return item;
  }

  if (path.includes(".")) {
    return path
      .split(".")
      .reduce((acc, key) => (acc == null ? acc : acc[key]), item);
  }

  return item[path];
}

class TemplateStore {
  #templates = new Map();

  load(sources) {
    const entries =
      typeof sources === "string"
        ? [["__default__", sources]]
        : Object.entries(sources);

    return Promise.all(
      entries.map(([name, url]) =>
        this.#fetch(url).then((html) => ({ name, html })),
      ),
    ).then((results) => {
      for (const { name, html } of results) {
        this.#register(name, html);
      }
      return this.#templates;
    });
  }

  #fetch(url) {
    if (cache.has(url)) return cache.get(url);

    const promise = fetch(url).then((response) => {
      if (!response.ok) {
        throw new Error(
          `Failed to load template "${url}" (${response.status})`,
        );
      }
      return response.text();
    });

    cache.set(url, promise);
    return promise;
  }

  #register(name, html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const named = doc.querySelectorAll("template[data-name]");

    if (named.length) {
      for (const template of named) {
        this.#templates.set(template.getAttribute("data-name"), template);
      }
      return;
    }

    const fallback = doc.querySelector("template");
    if (fallback) this.#templates.set(name, fallback);
  }

  getTemplate(name) {
    const template = this.#templates.get(name);
    if (!template) {
      throw new Error(
        `Template "${name}" not found. Did you call load() first?`,
      );
    }
    return template;
  }

  renderItem(name, item) {
    const template = this.getTemplate(name);
    const root = template.content.firstElementChild.cloneNode(true);
    this.#fill(root, item);
    return root;
  }

  #fill(root, item) {
    const nodes = [root, ...root.querySelectorAll("*")];

    for (const element of nodes) {
      if (element.hasAttribute("data-field")) {
        const value = getPath(item, element.getAttribute("data-field"));
        if (element instanceof HTMLImageElement) {
          element.src = value ?? "";
        } else if (element instanceof HTMLAnchorElement) {
          element.href = value ?? "";
        } else {
          element.textContent = (value ?? "").toString();
        }
      }

      for (const { name, value } of [...element.attributes]) {
        if (name.startsWith("data-attr-")) {
          const attribute = name.slice("data-attr-".length);
          element.setAttribute(attribute, getPath(item, value) ?? "");
        }
      }
    }
  }
}

export const templateStore = new TemplateStore();
