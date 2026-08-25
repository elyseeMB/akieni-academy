import { isClickedOutside } from "../utils/dom.js";
import { Component } from "./component.js";

export class DialogComponent extends Component {
  /**@type {number} */
  #previousScrollY;

  requiredRefs = ["dialog"];

  connectedCallback() {
    super.connectedCallback();
  }

  showDialog() {
    /** @type {{ dialog: HTMLDialogElement }} */
    const { dialog } = this.refs;
    if (dialog.open) {
      return;
    }
    const scrollY = window.scrollY;
    this.#previousScrollY = scrollY;

    requestAnimationFrame(() => {
      document.body.style.width = "100%";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      dialog.showModal();
      this.dispatchEvent(new DialogOpenEvent());
      this.addEventListener("click", this.#handleClick);
      this.addEventListener("keydown", this.#handleKeyDown);
    });
  }

  closeDialog = () => {
    /** @type {{ dialog: HTMLDialogElement }} */
    const { dialog } = this.refs;
    if (!dialog.open) {
      return;
    }

    document.body.style.width = "";
    document.body.style.position = "";
    document.body.style.top = "";
    window.scrollTo({ top: this.#previousScrollY, behavior: "instant" });
    dialog.close();
    dialog.classList.remove("dialog-closing");
    this.dispatchEvent(new DialogCloseEvent());
  };

  toggleDialog() {
    this.refs.dialog.open ? this.closeDialog() : this.showDialog();
  }

  /**
   *
   * @param {PointerEvent} e
   */
  #handleClick(e) {
    const { dialog } = this.refs;
    if (isClickedOutside(e, dialog)) {
      this.closeDialog();
    }
  }

  /**
   *
   * @param {KeyboardEvent} e
   */
  #handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      this.closeDialog();
    }
  };
}

class DialogOpenEvent extends CustomEvent {
  static eventName = "dialog:open";

  constructor() {
    super(DialogOpenEvent.eventName, { bubbles: true });
  }
}

class DialogCloseEvent extends CustomEvent {
  static eventName = "dialog:close";

  constructor() {
    super(DialogOpenEvent.eventName, { bubbles: true });
  }
}
