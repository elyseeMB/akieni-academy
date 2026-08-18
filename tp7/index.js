import { CalendarWeather } from "./wc/Calendar-weather.js";
import { HeaderAction } from "./wc/header-action.js";
import { HeaderComponent } from "./wc/header-component.js";
import { AnimatedHero } from "./wc/hero.js";
import { Spotlight } from "./wc/spotlight-component.js";
import { TemperatureComponent } from "./wc/temperature-component.js";
import { WeatherCard } from "./wc/WeatherCard.js";
import { WeatherDay } from "./wc/WeatherDay.js";

const forecastUrl =
  "https://weather-api.mboussaemmanuelito.workers.dev/weather/data/2.5/forecast?lat=-4.26&lon=15.28&lang=fr";
const currentUrl =
  "https://weather-api.mboussaemmanuelito.workers.dev/weather/data/2.5/weather?lat=-4.26&lon=15.28&lang=fr";

Promise.all([
  fetch(forecastUrl).then((r) => r.json()),
  fetch(currentUrl).then((r) => r.json()),
])
  .then(([forecast, current]) => {
    window.dispatchEvent(
      new CustomEvent("weather:all", {
        detail: { forecast, current },
      }),
    );
  })
  .catch((error) => {
    console.error("fetch failed:", error);
  });

customElements.define("animated-hero", AnimatedHero);
customElements.define("header-component", HeaderComponent);
customElements.define("header-action", HeaderAction);
customElements.define("spotlight-component", Spotlight);
customElements.define("temperature-component", TemperatureComponent);
customElements.define("calendar-weather", CalendarWeather);
customElements.define("weather-card", WeatherCard);
customElements.define("weather-day", WeatherDay);
