import { AnimatedHero } from "./elements/hero.js";
import { CalendarWeather } from "./wc/Calendar-weather.js";
import { HeaderAction } from "./wc/header-action.js";
import { HeaderComponent } from "./wc/header-component.js";
import { Spotlight } from "./wc/spotlight-component.js";
import { TemperatureComponent } from "./wc/temperature-component.js";

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

const tl = document.querySelector("calendar-weather");
const component = document.querySelector("temperature-component");

Promise.all([
  fetch(
    "https://weather-api.mboussaemmanuelito.workers.dev/weather/data/2.5/forecast?lat=-4.26&lon=15.28",
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      tl.data = data;
    }),
  fetch(
    "https://weather-api.mboussaemmanuelito.workers.dev/weather/data/2.5/weather?lat=-4.26&lon=15.28",
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      component.data = data;
    }),
]);

customElements.define("animated-hero", AnimatedHero);
customElements.define("header-component", HeaderComponent);
customElements.define("header-action", HeaderAction);
customElements.define("spotlight-component", Spotlight);
customElements.define("temperature-component", TemperatureComponent);
customElements.define("calendar-weather", CalendarWeather);
