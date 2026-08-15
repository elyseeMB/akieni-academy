import { CartDrawerComponent } from "./wc/cart-drawer-component.js";
import { CategoryNavComponent } from "./wc/category-nav-component.js";
import { CategoryTitleComponent } from "./wc/category-title-component.js";
import { DialogComponent } from "./wc/dialog.js";
import { HeaderComponent } from "./wc/header/header-component.js";
import { HeaderMenu } from "./wc/header/header-menu.js";
import { OverflowList } from "./wc/header/overflow-list.js";
import { QuickAddComponent } from "./wc/product/product-add.js";
import { ProductCard } from "./wc/product/product-card.js";
import { ProductCardLink } from "./wc/product/product-card-link.js";
import { ProductPrice } from "./wc/product/product-price.js";
import { ProductTitle } from "./wc/product/product-title.js";
import { ResultsList } from "./wc/result-list.js";
import { PaginatedList } from "./wc/paginated-list.js";

import "./wc/header/header-item.js";

// Cart
import "./modules/cart-counter.js";
import "./store/cart.js";

// Modules
import "./modules/header.js";

// Custom element
customElements.define("header-component", HeaderComponent);
customElements.define("header-menu", HeaderMenu);
customElements.define("overflow-list", OverflowList);
customElements.define("product-card", ProductCard);
customElements.define("product-card-link", ProductCardLink);
customElements.define("product-price", ProductPrice);
customElements.define("product-title", ProductTitle);
customElements.define("cart-drawer-component", CartDrawerComponent);
customElements.define("category-nav-component", CategoryNavComponent);
customElements.define("paginated-list", PaginatedList);
customElements.define("results-list", ResultsList);
customElements.define("dialog-component", DialogComponent);
customElements.define("category-title-component", CategoryTitleComponent);
customElements.define("quick-add-component", QuickAddComponent);
