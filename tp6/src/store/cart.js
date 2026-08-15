import { CartUpdateEvent, ThemeEvents } from "../theme/event.js";

const CART_KEY = "akieni-cart";

function read() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function write(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function notify() {
  document.dispatchEvent(new CartUpdateEvent(read()));
}

export const cart = {
  getCart() {
    return read();
  },

  getCount() {
    return read().reduce((total, item) => total + (item.quantity || 0), 0);
  },

  getTotal() {
    return read().reduce(
      (total, item) => total + (Number(item.price) || 0) * (item.quantity || 0),
      0,
    );
  },

  addToCart(item) {
    const items = read();
    const existing = items.find((i) => i.id === item.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      items.push({ ...item, quantity: 1 });
    }
    write(items);
  },

  setQty(id, quantity) {
    const items = read();
    const target = items.find((i) => i.id === id);
    if (!target) return;
    const next = Number(quantity) || 0;
    if (next <= 0) {
      this.removeFromCart(id);
      return;
    }
    target.quantity = next;
    write(items);
    notify();
  },

  removeFromCart(id) {
    write(read().filter((i) => i.id !== id));
    notify();
  },
};

document.addEventListener(ThemeEvents.cartUpdate, (event) => {
  const data = event.detail?.data;
  if (data?.source === "quick-add-component" && event.detail?.resource) {
    cart.addToCart(event.detail.resource);
    notify();
  }
});
