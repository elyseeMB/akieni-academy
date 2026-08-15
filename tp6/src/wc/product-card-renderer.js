import { templateStore } from "./template-store.js";

export const PRODUCT_TEMPLATE_URLS = {
  "product-card": "./templates/products/product-card.template.html",
  "product-details": "./templates/products/product-details.template.html",
  "product-title": "./templates/products/product-title.template.html",
  "product-price": "./templates/products/product-price.template.html",
  "product-form": "./templates/products/product-form.template.html",
};

export function renderProductCard(item) {
  const card = templateStore.renderItem("product-card", item);

  const details = templateStore.renderItem("product-details", item);
  const titleSlot = details.querySelector('[data-slot="title"]');
  const priceSlot = details.querySelector('[data-slot="price"]');

  if (titleSlot) {
    titleSlot.replaceChildren(templateStore.renderItem("product-title", item));
  }
  if (priceSlot) {
    priceSlot.replaceChildren(templateStore.renderItem("product-price", item));
  }

  const detailsSlot = card.querySelector('[data-slot="details"]');
  if (detailsSlot) detailsSlot.replaceChildren(details);

  const formSlot = card.querySelector('[data-slot="form"]');
  if (formSlot) {
    formSlot.replaceChildren(templateStore.renderItem("product-form", item));
  }

  return card;
}
