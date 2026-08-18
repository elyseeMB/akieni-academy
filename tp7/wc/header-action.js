import { Component } from "./component.js";

export class HeaderAction extends Component {
  requiredRefs = ["searchInput"];
  connectedCallback() {
    super.connectedCallback();
  }

  handleClick() {
    const query = this.refs.searchInput.value;
    console.log("Recherche :", query);
  }
}
