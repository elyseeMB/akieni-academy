export class ThemeEvents {
  static cartUpdate = "cart:update";
  static categorySelect = "category:select";
}

export class CartAddEvent extends Event {
  static eventName = ThemeEvents.cartUpdate;

  constructor(resource, sourceId, data) {
    super(CartAddEvent.eventName, { bubbles: true });

    this.detail = {
      resource,
      sourceId,
      data: { ...data },
    };
  }
}

export class CartUpdateEvent extends Event {
  constructor(resource, sourceId, data) {
    super(ThemeEvents.cartUpdate, { bubbles: true });

    this.detail = {
      resource,
      sourceId,
      data: { ...data },
    };
  }
}

export class CategorySelectEvent extends Event {
  constructor(slug, name = "") {
    super(ThemeEvents.categorySelect, { bubbles: true });

    this.detail = { slug, name };
  }
}
