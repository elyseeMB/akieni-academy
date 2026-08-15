import { CartAddEvent, ThemeEvents } from "../../theme/event.js";
import { Component } from "../component.js";

export class QuickAddComponent extends Component {
  handleClick = (event) => {
    event.preventDefault();

    const card = this.closest("product-card");
    if (!card) return;

    const id = card.getAttribute("data-product-id");
    if (!id) return;

    const title =
      card.querySelector(".product-card__title")?.textContent?.trim() ?? "";
    const image =
      card.querySelector(".product-media__image")?.getAttribute("src") ?? "";
    const price = Number(card.getAttribute("data-price") || 0);

    this.dispatchEvent(
      new CartAddEvent({ id, title, image, price }, id, {
        source: "quick-add-component",
        itemCount: 1,
        productId: id,
      }),
    );
  };
}
