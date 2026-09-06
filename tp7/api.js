const BASE_URL = "https://weather-api.mboussaemmanuelito.workers.dev";

export const BRAZZAVILLE = { lat: -4.26, lon: 15.28, name: "Brazzaville" };

export function isBrazzaville(lat, lon) {
  const eps = 0.5;
  return (
    Math.abs(Number(lat) - BRAZZAVILLE.lat) <= eps &&
    Math.abs(Number(lon) - BRAZZAVILLE.lon) <= eps
  );
}

export async function getCurrent(lat, lon, lang = "fr") {
  const params = new URLSearchParams({ lat: String(lat), lon: String(lon), lang });
  const res = await fetch(`${BASE_URL}/weather/data/2.5/weather?${params}`);
  if (!res.ok) {
    throw new Error("Err Server");
  }
  return res.json();
}

export async function getForecast(lat, lon, lang = "fr") {
  const params = new URLSearchParams({ lat: String(lat), lon: String(lon), lang });
  const res = await fetch(`${BASE_URL}/weather/data/2.5/forecast?${params}`);
  if (!res.ok) {
    throw new Error("Err Server");
  }
  return res.json();
}

export async function getHistory() {
  const res = await fetch(`${BASE_URL}/weather/history`);
  if (!res.ok) {
    return [];
  }
  return res.json();
}

export async function searchCities(query, limit = 5) {
  const params = new URLSearchParams({ q: query, limit: String(limit), lang: "fr" });
  const res = await fetch(`${BASE_URL}/weather/geo/1.0/direct?${params}`);
  if (!res.ok) {
    return [];
  }
  return res.json();
}
