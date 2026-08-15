import { cart } from "../../store/cart.js";
import { ThemeEvents } from "../../theme/event.js";
import { DialogComponent } from "./dialog.js";

/**
 * @param {string|number} value
 * @return {string}
 */
const money = (value) => String(Number(value) || 0);

/**
 * Custom element for shopping cart drawer dialog
 * @extends {DialogComponent}
 */
export class CartDrawerComponent extends DialogComponent {
  /**@type {AbortController} */
  #abortController = new AbortController();

  /**
   * @return {void}
   */
  connectedCallback() {
    super.connectedCallback();
    document.addEventListener(ThemeEvents.cartUpdate, this.#onCartUpdate, {
      signal: this.#abortController.signal,
    });
    this.#render();
  }

  /**
   * @return {void}
   */
  disconnectedCallback() {
    super.disconnectedCallback();
    this.#abortController.abort();
  }

  /**
   * @type {() => number}
   */
  #onCartUpdate = () => requestAnimationFrame(() => this.#render());

  /**
   * @return {void}
   */
  #render() {
    const itemsContainer = this.refs.items;
    const totalEl = this.refs.total;
    if (!itemsContainer) return;

    const items = cart.getCart();
    itemsContainer.replaceChildren();

    if (items.length === 0) {
      const empty = document.createElement("p");
      empty.className = "cart-drawer__empty";
      empty.textContent = "Votre panier est vide.";
      itemsContainer.appendChild(empty);
    } else {
      for (const item of items) {
        itemsContainer.appendChild(this.#renderItem(item));
      }
    }

    if (totalEl) {
      totalEl.textContent = money(cart.getTotal());
    }
  }

  /**
   * @param {Object} item
   * @param {string} item.id
   * @param {string} item.title
   * @param {string} item.image
   * @param {number} item.price
   * @param {number} item.quantity
   * @return {HTMLDivElement}
   */
  #renderItem(item) {
    const row = document.createElement("div");
    row.className = "cart-item";
    row.dataset.id = item.id;

    const img = document.createElement("img");
    img.src = item.image || "";
    img.alt = item.title || "";
    img.className = "cart-item__image";
    img.loading = "lazy";

    const info = document.createElement("div");
    info.className = "cart-item__info";
    const title = document.createElement("span");
    title.className = "cart-item__title";
    title.textContent = item.title || "";
    const price = document.createElement("span");
    price.className = "cart-item__price";
    price.textContent = money((Number(item.price) || 0) * (item.quantity || 0));
    info.append(title, price);

    const qty = document.createElement("div");
    qty.className = "cart-item__qty";
    const minus = document.createElement("button");
    minus.type = "button";
    minus.className = "cart-item__qty-button";
    minus.dataset.id = item.id;
    minus.dataset.delta = "-1";
    minus.setAttribute("on:click", "cart-drawer-component/updateQty");
    minus.textContent = "−";
    const value = document.createElement("span");
    value.className = "cart-item__qty-value";
    value.textContent = String(item.quantity);
    const plus = document.createElement("button");
    plus.type = "button";
    plus.className = "cart-item__qty-button";
    plus.dataset.id = item.id;
    plus.dataset.delta = "1";
    plus.setAttribute("on:click", "cart-drawer-component/updateQty");
    plus.textContent = "+";
    qty.append(minus, value, plus);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "cart-item__remove button-unstyled";
    remove.dataset.id = item.id;
    remove.setAttribute("on:click", "cart-drawer-component/removeItem");
    remove.textContent = "Retirer";

    row.append(img, info, qty, remove);
    return row;
  }

  /**
   * @param {Event} event
   * @return {void}
   */
  updateQty(event) {
    const id = event.target?.dataset?.id;
    const delta = Number(event.target?.dataset?.delta || 0);
    if (!id) return;
    const item = cart.getCart().find((i) => i.id === id);
    if (!item) return;
    cart.setQty(id, item.quantity + delta);
  }

  /**
   * @param {Event} event
   * @return {void}
   */
  removeItem(event) {
    const id = event.target?.dataset?.id;
    if (id) cart.removeFromCart(id);
  }

  /**
   * @return {void}
   */
  checkout() {
    console.log("Commande", cart.getCart());
  }
}
