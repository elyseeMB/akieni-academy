import { moviesStore } from "./events/movies-store.js";
import { CalendarMovies } from "./wc/Calendar-movies.js";
import { HeadCalendar } from "./wc/head-calendar.js";

customElements.define("head-calendar", HeadCalendar);
customElements.define("calendar-movies", CalendarMovies);
