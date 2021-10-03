/**
 * Rounding function to round a year to the previous decade
 *
 * @param {number} year the year to round
 * @returns the rounded year
 */
export function yearToPreviousDecade(year) {
  return Math.floor(parseInt(year, 10) / 10) * 10;
}

/**
 * Rounding function to round a year to the next decade
 *
 * @param {number} year the year to round
 * @returns the rounded year
 */
export function yearToNextDecade(year) {
  return Math.ceil(parseInt(year, 10) / 10) * 10;
}
