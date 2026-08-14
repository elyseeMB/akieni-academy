import { ThemeEvents } from "../../theme/event.js";
import { morph } from "../../utilities/morph.js";
import { getIOSVersion, mediaQueryLarge } from "../../utilities/utils.js";
import { Component } from "../component.js";
import { DialogCloseEvent, DialogComponent } from "../dialog.js";

export class QuickAddComponent extends Component {
  #abortController = null;
  #cachedContent = new Map();
  #cartUpdateAbortController = new AbortController();

  get productPageUrl() {
    const productCard = this.closest("product-card");
    const productLink = !!productCard?.getProductCardLink();

    if (!productLink?.href) {
      return "";
    }

    const url = new URL(productLink.href);

    if (url.searchParams.has("variant")) {
      return url.toString();
    }
    const selectedVariantId = this.#getSelectedVariantId();
    return (
      selectedVariantId && url.searchParams.set("variant", selectedVariantId),
      url.toString()
    );
  }

  #getSelectedVariantId() {
    return this.closest("product-card")?.getSelectedVariantId() || null;
  }

  connectedCallback() {
    super.connectedCallback(),
      mediaQueryLarge.addEventListener("change", this.#closeQuickAddModal),
      document.addEventListener(
        ThemeEvents.cartUpdate,
        this.#handleCartUpdate,
        { signal: this.#cartUpdateAbortController.signal },
      ),
      document.addEventListener(
        ThemeEvents.variantSelected,
        this.#updateQuickAddButtonState.bind(this),
      );
  }

  disconnectedCallback() {
    super.disconnectedCallback(),
      mediaQueryLarge.removeEventListener("change", this.#closeQuickAddModal),
      this.#abortController?.abort(),
      this.#cartUpdateAbortController.abort(),
      document.removeEventListener(
        ThemeEvents.variantSelected,
        this.#updateQuickAddButtonState.bind(this),
      );
  }

  #handleCartUpdate = () => {
    this.#cachedContent.clear();
  };

  #updateVariantPicker(newHtml) {
    const modalContent = document.getElementById("quick-add-modal-content");
    if (!modalContent) return;
    modalContent.querySelector("variant-picker").updateVariantPicker(newHtml);
  }

  handleClick = async (event) => {
    event.preventDefault();
    const currentUrl = this.productPageUrl;

    let productGrid = this.#cachedContent.get(currentUrl);

    if (!productGrid) {
      const html = await this.fetchProductPage(currentUrl);
      console.log(html);
      if (html) {
        const gridElement = html.querySelector("[data-product-grid-content]");
        gridElement &&
          ((productGrid = gridElement.cloneNode(!0)),
          this.#cachedContent.set(currentUrl, productGrid));
      }
    }
    if (productGrid) {
      const freshContent = productGrid.cloneNode(!0);
      await this.updateQuickAddModal(freshContent),
        this.#updateVariantPicker(productGrid);
    }
    this.#openQuickAddModal();
  };
  #stayVisibleUntilDialogCloses(dialogComponent) {
    this.toggleAttribute("stay-visible", !0),
      dialogComponent.addEventListener(
        DialogCloseEvent.eventName,
        () => this.toggleAttribute("stay-visible", !1),
        { once: !0 },
      );
  }
  #openQuickAddModal = () => {
    const dialogComponent = document.getElementById("quick-add-dialog");
    dialogComponent instanceof QuickAddDialog &&
      (this.#stayVisibleUntilDialogCloses(dialogComponent),
      dialogComponent.showDialog());
  };
  #closeQuickAddModal = () => {
    const dialogComponent = document.getElementById("quick-add-dialog");
    dialogComponent instanceof QuickAddDialog && dialogComponent.closeDialog();
  };

  async fetchProductPage(productPageUrl) {
    if (!productPageUrl) {
      return null;
    }
    this.#abortController?.abort(),
      (this.#abortController = new AbortController());

    try {
      const response = await fetch(productPageUrl, {
        signal: this.#abortController.signal,
      });

      if (!response.ok)
        throw new Error(
          `Failed to fetch product page: HTTP error ${response.status}`,
        );

      const responseText = await response.text();
      return new DOMParser().parseFromString(responseText, "text/html");
    } catch (error) {
      if (error.name === "AbortError") return null;
      throw error;
    } finally {
      this.#abortController = null;
    }
  }

  async updateQuickAddModal(productGrid) {
    const modalContent = document.getElementById("quick-add-modal-content");
    if (!productGrid || !modalContent) return;
    const productDetails = productGrid.querySelector(".product-details"),
      productFormComponent = productGrid.querySelector(
        "product-form-component",
      ),
      variantPicker = productGrid.querySelector("variant-picker");
    variantPicker && productGrid.appendChild(variantPicker),
      productFormComponent && productGrid.appendChild(productFormComponent),
      productDetails?.remove(),
      morph(modalContent, productGrid),
      this.#syncVariantSelection(modalContent);
  }
  #updateQuickAddButtonState(event) {
    if (
      !(event.target instanceof HTMLElement) ||
      event.target.closest("product-card") !== this.closest("product-card")
    )
      return;
    const quickAddButton =
      this.dataset.productOptionsCount === "1" ? "add" : "choose";
    this.setAttribute("data-quick-add-button", quickAddButton);
  }
  #syncVariantSelection(modalContent) {
    const selectedVariantId = this.#getSelectedVariantId();
    if (!selectedVariantId) return;
    const modalInputs = modalContent.querySelectorAll(
      'input[type="radio"][data-variant-id]',
    );
    for (const input of modalInputs)
      if (
        input instanceof HTMLInputElement &&
        input.dataset.variantId === selectedVariantId &&
        !input.checked
      ) {
        (input.checked = !0),
          input.dispatchEvent(new Event("change", { bubbles: !0 }));
        break;
      }
  }
}
customElements.get("quick-add-component") ||
  customElements.define("quick-add-component", QuickAddComponent);

class QuickAddDialog extends DialogComponent {
  #abortController = new AbortController();
  connectedCallback() {
    super.connectedCallback(),
      this.addEventListener(ThemeEvents.cartUpdate, this.handleCartUpdate, {
        signal: this.#abortController.signal,
      }),
      this.addEventListener(
        ThemeEvents.variantUpdate,
        this.#updateProductTitleLink,
      ),
      this.addEventListener(
        DialogCloseEvent.eventName,
        this.#handleDialogClose,
      );
  }
  disconnectedCallback() {
    super.disconnectedCallback(),
      this.#abortController.abort(),
      this.removeEventListener(
        DialogCloseEvent.eventName,
        this.#handleDialogClose,
      );
  }
  handleCartUpdate = (event) => {
    event.detail.data.didError || this.closeDialog();
  };
  #updateProductTitleLink = (event) => {
    const anchorElement = event.detail.data.html?.querySelector(
        ".view-product-title a",
      ),
      viewMoreDetailsLink = this.querySelector(".view-product-title a"),
      mobileProductTitle = this.querySelector(".product-header a");
    anchorElement &&
      (viewMoreDetailsLink && (viewMoreDetailsLink.href = anchorElement.href),
      mobileProductTitle && (mobileProductTitle.href = anchorElement.href));
  };
  #handleDialogClose = () => {
    const iosVersion = getIOSVersion();
    !iosVersion ||
      iosVersion.major >= 17 ||
      (iosVersion.major === 16 && iosVersion.minor >= 4) ||
      requestAnimationFrame(() => {
        const grid = document.querySelector("#ResultsList [product-grid-view]");
        if (grid) {
          const currentWidth = grid.getBoundingClientRect().width;
          (grid.style.width = `${currentWidth - 1}px`),
            requestAnimationFrame(() => {
              grid.style.width = "";
            });
        }
      });
  };
}
customElements.get("quick-add-dialog") ||
  customElements.define("quick-add-dialog", QuickAddDialog);
