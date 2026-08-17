import { AnimatedHero } from "./elements/hero.js";
import { CalendarWeather } from "./wc/Calendar-weather.js";
import { HeaderAction } from "./wc/header-action.js";
import { HeaderComponent } from "./wc/header-component.js";
import { Spotlight } from "./wc/spotlight-component.js";
import { TemperatureComponent } from "./wc/temperature-component.js";

// fetch(
//   "https://api.open-meteo.com/v1/forecast?latitude=-4.2634&longitude=15.2429&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,weather_code,is_day,precipitation_probability&daily=sunrise,sunset&timezone=Africa/Brazzaville&forecast_days=2",
//   {
//     headers: {
//       https://countries.dev/name/israel
//     },
//   },
// ).then((r) => r.json().then((r) => console.log(r)));

// fetch("https://weather-api.mboussaemmanuelito.workers.dev/countries/name/congo")
//   .then((response) => {
//     return response.json();
//   })
//   .then((data) => {
//     console.log(data);
//   });

// fetch(
//   "https://weather-api.mboussaemmanuelito.workers.dev/weather/data/2.5/forecast?lat=44.34&lon=10.99",
// )
//   .then((response) => {
//     return response.json();
//   })
//   .then((data) => {
//     console.log(data);
//   });

const hero = document.querySelector("animated-hero");

// hero.addEventListener("shapes-updated", (e) => {
//   const { shapes } = e.detail;
//   const label = document.getElementById("floating-label");
//   const label2 = document.getElementById("floating-label-2");

//   if (shapes[0]) {
//     label.style.transform = `translate(${shapes[0].x}px, ${shapes[0].y}px)`;
//   }

//   if (shapes[1]) {
//     label2.style.transform = `translate(${shapes[1].x}px, ${shapes[1].y}px)`;
//   }
// });

// const el = document.getElementById("tl");
// fetch(
//   "https://weather-api.mboussaemmanuelito.workers.dev/weather/data/2.5/forecast?lat=44.34&lon=10.99",
// )
//   .then((r) => r.json())
//   .then((data) => el.setAttribute("data", JSON.stringify(data)));

customElements.define("animated-hero", AnimatedHero);
customElements.define("header-component", HeaderComponent);
customElements.define("header-action", HeaderAction);
customElements.define("spotlight-component", Spotlight);
customElements.define("temperature-component", TemperatureComponent);
customElements.define("calendar-weather", CalendarWeather);
