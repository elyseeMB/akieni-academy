const BASE_URL = "https://movies-api.mboussaemmanuelito.workers.dev";

/**
 *
 * @param {string} year
 * @param {string} month
 * @param {number} page
 * @returns
 */
async function getCalendar(year, month, page = 1) {
  const params = new URLSearchParams({ year, month, page });
  const res = await fetch(`${BASE_URL}/api/calendar?${params}`);
  if (!res.ok) {
    const msg = await res.json();
    console.error(msg);
    throw new Error("Err Server", {
      cause: { ...msg },
    });
  }
  return await res.json();
}

/**
 *
 * @param {string} year
 * @param {string} month
 * @returns
 */
export async function getAllCalendarMovies(year, month) {
  const first = await getCalendar(year, month, 1);
  const allResults = [...first.results];

  const requests = [];
  for (let p = 2; p <= first.total_pages; p++) {
    requests.push(getCalendar(year, month, p));
  }
  const rest = await Promise.all(requests);
  rest.forEach((r) => allResults.push(...r.results));

  return allResults;
}

/**
 *
 * @param {string} search
 * @param {string} number
 */
export async function getSearchMovie(search, page = 1) {
  const params = new URLSearchParams({
    query: search,
    include_adult: "false",
    language: "en-US",
    page: String(page),
  });
  const res = await fetch(`${BASE_URL}/api/search?${params}`);
  if (!res.ok) {
    const msg = await res.json();
    console.error(msg);
    throw new Error("Err Server", {
      cause: { ...msg },
    });
  }
  return await res.json();
}

export async function getTrending() {
  const res = await fetch(`${BASE_URL}/api/trending`);
  if (!res.ok) {
    const msg = await res.json();
    console.error(msg);
    throw new Error("Err Server", {
      cause: { ...msg },
    });
  }
  return await res.json();
}

/**
 *
 * @param {{genreId: number; query:string; page:number; }} param0
 * @returns
 */
export async function getDiscoverMovies({ genreId, query, page = 1 } = {}) {
  const params = new URLSearchParams({ page: String(page) });

  if (genreId) {
    params.set("genre", String(genreId));
  }

  if (query) {
    params.set("query", query);
  }

  const res = await fetch(`${BASE_URL}/api/discover?${params}`);

  if (!res.ok) {
    const msg = await res.json();
    console.error(msg);
    throw new Error("Err Server", {
      cause: { ...msg },
    });
  }

  return await res.json();
}
