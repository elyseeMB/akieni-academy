import { CalendarMovies } from "./wc/Calendar-movies.js";
import { HeadCalendar } from "./wc/head-calendar.js";
import { LayoutMobile } from "./wc/layout-mobile.js";
import { MovieDialog } from "./wc/movie-dialog.js";
import { MoviePopover } from "./wc/movie-popover.js";
import { PreviousItem } from "./wc/previous-item.js";
import { SearchComponent } from "./wc/search-component.js";
import { SuggestionComponent } from "./wc/suggestion-component.js";

customElements.define("head-calendar", HeadCalendar);
customElements.define("calendar-movies", CalendarMovies);
customElements.define("layout-mobile", LayoutMobile);
customElements.define("movie-popover", MoviePopover);
customElements.define("movie-dialog", MovieDialog);
customElements.define("previous-item", PreviousItem);
customElements.define("suggestion-component", SuggestionComponent);
customElements.define("search-component", SearchComponent);
