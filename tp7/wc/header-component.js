import { Component } from "./component.js";

export class HeaderComponent extends Component {
  connectedCallback() {
    super.connectedCallback();
    console.log("connected");

    const input = this.querySelector("input");
    console.log(input);
  }
}
