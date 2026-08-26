/**
 *
 * @param {Function} fn
 * @param {number} wait
 * @returns
 */
export function debounce(fn, wait) {
  let timeout;

  const debounced = (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait);
  };

  debounced.cancel = () => {
    clearTimeout(timeout);
  };

  return debounced;
}
