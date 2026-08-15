import { FilterUpdateEvent } from "../theme/event.js";

const selected = new Set();
let containers = [];
let clearButton;

function build(categories) {
  for (const container of containers) {
    container.replaceChildren();

    for (const category of categories) {
      const label = document.createElement("label");
      label.className = "facet";

      const input = document.createElement("input");
      input.type = "checkbox";
      input.name = "filter.category";
      input.value = category;
      input.checked = selected.has(category);
      input.addEventListener("change", () => onChange(input));

      label.append(input, document.createTextNode(category));
      container.appendChild(label);
    }
  }
}

function onChange(input) {
  if (input.checked) selected.add(input.value);
  else selected.delete(input.value);
  sync();
  apply();
}

function sync() {
  for (const container of containers) {
    for (const input of container.querySelectorAll(
      'input[name="filter.category"]',
    )) {
      input.checked = selected.has(input.value);
    }
  }
}

function apply() {
  const params = new URLSearchParams();
  for (const value of selected) params.append("filter.category", value);
  document.dispatchEvent(new FilterUpdateEvent(params));
}

function clearAll() {
  selected.clear();
  sync();
  apply();
}

export function initFilterBar() {
  containers = [...document.querySelectorAll(".facets-container")];
  clearButton = document.querySelector("[data-filter-clear]");
  if (clearButton) clearButton.addEventListener("click", clearAll);

  document.addEventListener("products:loaded", (event) => {
    if (event.detail?.categories) build(event.detail.categories);
  });
}
