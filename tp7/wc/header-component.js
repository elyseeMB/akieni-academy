import { Component } from "./component.js";

export class HeaderComponent extends Component {
  connectedCallback() {
    super.connectedCallback();

    const input = this.querySelector("input");
  }
}
