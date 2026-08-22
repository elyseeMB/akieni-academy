/**
 * @param {Date} date
 * @returns {Date}
 */
export const immutDate = (date) => {
  return new Proxy(date, {
    get(target, prop) {
      if (typeof prop === "string" && prop.startsWith("set")) {
        return (...args) => {
          const clone = new Date(date);
          Reflect.get(clone, prop).apply(clone, args);
          return immutDate(clone);
        };
      }
      if (typeof prop === "string" && prop.startsWith("add")) {
        return (n) => {
          const clone = new Date(date);
          const method = prop.replace("add", "set");
          Reflect.get(clone, prop.replace("add", "set")).apply(clone, [
            Reflect.get(clone, prop.replace("add", "get")).apply(clone) + n,
          ]);
          return immutDate(clone);
        };
      }
      const value = Reflect.get(...arguments);
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
  const d = immutDate(date);
  const start = d.setDate(1);
  const end = d.addMonth(1).setDate(0);

  return { start, end };
}

export function buildYearRanges(year) {
  const ranges = [];
  let current = immutDate(new Date(year, 0, 1));

  for (let month = 0; month < 12; month++) {
    const { start, end } = getMonthRange(current);
    ranges.push({ start, end });
    current = current.addMonth(1);
  }

  return ranges;
}
