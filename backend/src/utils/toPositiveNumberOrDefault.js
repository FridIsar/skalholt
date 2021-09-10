/**
 * Helper function to clean values
 *
 * @param {*} value the value to be cleaned
 * @param {*} defaultValue the fallback default
 * @returns the value if positive integer, the default if it wasn't
 */
export function toPositiveNumberOrDefault(value, defaultValue) {
  const cast = Number(value);
  const clean = Number.isInteger(cast) && cast > 0 ? cast : defaultValue;

  return clean;
}
