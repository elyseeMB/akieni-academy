import { getGenresMovie } from "../api.js";

/**
 * Charge les genres et retourne une Map<id, name>
 * @returns {Promise<Map<number, string>>}
 */
export async function loadGenreMap() {
  const { genres } = await getGenresMovie();
  const map = new Map();
  for (const g of genres) {
    map.set(g.id, g.name);
  }
  return map;
}

/**
 * Retourne le style CSS (--color) d'un film selon son genre
 * @param {object} movie
 * @param {Map<number, string>} genreMap
 * @returns {Record<string, string> | undefined}
 */
export function getMovieStyle(movie, genreMap) {
  const genreId = movie.genre_ids?.[0];
  if (genreId == null) {
    return undefined;
  }
  const name = genreMap.get(genreId);
  if (!name) {
    return undefined;
  }
  return { "--color": `var(--genre-${name})` };
}

/**
 * Retourne le nom et la couleur du genre d'un film
 * @param {object} movie
 * @param {Map<number, string>} genreMap
 * @returns {{ name: string, color: string } | undefined}
 */
export function getGenreInfo(movie, genreMap) {
  const styles = getMovieStyle(movie, genreMap);
  if (!styles) {
    return undefined;
  }
  const name = genreMap.get(movie.genre_ids?.[0]);
  return { name, color: styles["--color"] };
}

/**
 * @param {string} releaseDate
 * @returns {boolean}
 */
export function isUpcoming(releaseDate) {
  const movieDate = new Date(releaseDate).setHours(0, 0, 0, 0);
  const today = new Date().setHours(0, 0, 0, 0);
  return movieDate >= today;
}

/**
 * @param {string} releaseDate
 * @returns {"Prochainement" | "Sorti"}
 */
export function getStatusText(releaseDate) {
  return isUpcoming(releaseDate) ? "Prochainement" : "Sorti";
}

/**
 * @param {string} releaseDate
 * @returns {"calendar__movie--upcoming" | "calendar__movie--past"}
 */
export function getStatusClass(releaseDate) {
  return isUpcoming(releaseDate)
    ? "calendar__movie--upcoming"
    : "calendar__movie--past";
}

/**
 * Retourne l'attribut on:click pour ouvrir le popover
 * @param {object} movie
 * @returns {string}
 */
export function popoverClick(movie) {
  return `#movie-popover/open?movie=${encodeURIComponent(JSON.stringify(movie))}`;
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "long",
});

/**
 * Formate une date "YYYY-MM-DD" en texte lisible
 * @param {string} dateKey
 * @returns {string}
 */
export function formatDate(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return dateFormatter.format(new Date(year, month - 1, day));
}
