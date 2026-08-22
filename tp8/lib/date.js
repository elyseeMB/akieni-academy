const MILLISECONDES_IN_A_DAY = 86400000;

/**
 * @param {Date} date
 * @returns {Date}
 */
export const immutDate = (date) => {
  return new Proxy(date, {
    get(target, prop, receiver) {
      if (typeof prop === "string" && prop.startsWith("set")) {
        return (...args) => {
          const clone = new Date(target);
          Reflect.get(clone, prop).apply(clone, args);
          return immutDate(clone);
        };
      }

      const value = Reflect.get(target, prop, receiver);
      if (typeof value === "function") {
        return value.bind(target);
      }
      return value;
    },
  });
};

/**
 * Construit le premier et dernier jour d'un mois donné
 * @param {Date} date - une date quelconque dans le mois ciblé
 * @returns {{ start: Date, end: Date }}
 */
export function getMonthRange(date) {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
}

/**
 * @param {number} year
 * @returns {{ start: Date, end: Date }[]}
 */
export function buildYearRanges(year) {
  const ranges = [];

  for (let month = 0; month < 12; month++) {
    const current = new Date(year, month, 1);
    ranges.push(getMonthRange(current));
  }

  return ranges;
}

/**
 *
 * @param {Date} date
 */
export function startOfMonth(date) {
  return immutDate(date).setDate(1).setHours(0, 0, 0, 0);
}

/**
 * @param {Date} date
 * @returns {Date}
 */
export function startOfWeek(date) {
  const base = immutDate(date);
  const diff = (base.getDay() + 6) % 7;
  return base.setDate(base.getDate() - diff).setHours(0, 0, 0);
}

/**
 *
 * @param {Date} date
 * @returns {Date}
 */
export function endOfWeek(date) {
  const base = immutDate(date);
  const diff = (7 - base.getDay()) % -7;
  return base.setDate(base.getDate() + diff).setHours(23, 59, 59, 999);
}

/**
 *
 * @param {Date} date
 */
export function endOfMonth(date) {
  return immutDate(date)
    .setMonth(date.getMonth() + 1)
    .setDate(0)
    .setHours(23, 59, 59, 999);
}

/**
 *
 * @param {Date} start
 * @param {Date} end
 * @return {Date[]}
 */
export function rangeOfDates(start, end) {
  if (start > end) {
    throw new Error("Error date start should be longer than end Date");
  }

  /**@type{Date[]} */
  const dates = [];
  let currentDate = immutDate(start);
  while (currentDate < end) {
    dates.push(currentDate);
    currentDate = addDays(currentDate, 1);
  }
  return dates;
}

/**
 *
 * @param {Date} Date
 * @param {number} day
 * @returns {Date}
 */
export function addDays(date, day) {
  const base = immutDate(date);
  return base.setDate(base.getDate() + day);
}

/**
 *
 * @param {Date} startDate
 * @param {Date} endDate
 * @return {number}
 */
export function weeksCount(startDate, endDate) {
  const start = immutDate(startDate).setHours(0, 0, 0);
  const end = immutDate(endDate).setHours(0, 0, 0);

  const millisecondsInWeek = 7 * MILLISECONDES_IN_A_DAY;
  const diff = +end - +start;
  return Math.floor(diff / millisecondsInWeek) + 1;
}
