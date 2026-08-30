import {
  BRAZZAVILLE,
  getCurrent,
  getForecast,
  getHistory,
  isBrazzaville,
} from "./api.js";
import { CalendarWeather } from "./wc/Calendar-weather.js";
import { HeaderAction } from "./wc/header-action.js";
import { HeaderComponent } from "./wc/header-component.js";
import { AnimatedHero } from "./wc/hero.js";
import { SearchComponent } from "./wc/search-component.js";
import { Spotlight } from "./wc/spotlight-component.js";
import { SuggestionComponent } from "./wc/suggestion-component.js";
import { TemperatureComponent } from "./wc/temperature-component.js";
import { WeatherCard } from "./wc/WeatherCard.js";
import { WeatherDay } from "./wc/WeatherDay.js";

customElements.define("animated-hero", AnimatedHero);
customElements.define("header-component", HeaderComponent);
customElements.define("header-action", HeaderAction);
customElements.define("spotlight-component", Spotlight);
customElements.define("temperature-component", TemperatureComponent);
customElements.define("calendar-weather", CalendarWeather);
customElements.define("weather-card", WeatherCard);
customElements.define("weather-day", WeatherDay);
customElements.define("suggestion-component", SuggestionComponent);
customElements.define("search-component", SearchComponent);

async function loadWeather(lat, lon, { name } = {}) {
  const withHistory = isBrazzaville(lat, lon);

  const [forecast, current] = await Promise.all([
    getForecast(lat, lon),
    getCurrent(lat, lon),
  ]);

  const history = withHistory ? await getHistory() : [];

  window.dispatchEvent(
    new CustomEvent("weather:all", {
      detail: {
        forecast,
        current,
        history,
        location: {
          lat,
          lon,
          name: name ?? current.name ?? "",
          country: current.sys?.country ?? "",
        },
        withHistory,
      },
    }),
  );
}

window.addEventListener("weather:select", (e) => {
  const { lat, lon, name, country } = e.detail;
  loadWeather(lat, lon, {
    name: [name, country].filter(Boolean).join(", "),
  }).catch((error) => {
    console.error("fetch failed:", error);
  });
});

loadWeather(BRAZZAVILLE.lat, BRAZZAVILLE.lon, { name: BRAZZAVILLE.name }).catch(
  (error) => {
    console.error("fetch failed:", error);
  },
);
