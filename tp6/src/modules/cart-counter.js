import { cart } from "../store/cart.js";
import { ThemeEvents } from "../theme/event.js";

function update() {
  const el = document.getElementById("cart-count");

  if (el) {
    el.textContent = String(cart.getCount());
  }
}

document.addEventListener(ThemeEvents.cartUpdate, update);
update();
