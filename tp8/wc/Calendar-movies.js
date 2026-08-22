import { buildYearRanges } from "../lib/date.js";
import { Component } from "./component.js";

export class CalendarMovies extends Component {
  /** */
  #range;

  connectedCallback() {
    super.connectedCallback();
    console.log("connected");
    const ranges = buildYearRanges(2026);

    console.log(ranges);
  }
}
