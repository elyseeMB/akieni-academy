const BASE_URL = "https://movies-api.mboussaemmanuelito.workers.dev";

async function getCalendar(year, month, page = 1) {
  const res = await fetch(
    `${BASE_URL}/api/calendar?year=${year}&month=${month}&page=${page}`,
  );
  return res.json();
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
