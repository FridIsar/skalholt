export function yearToPreviousDecade(year) {
  return Math.floor(parseInt(year, 10) / 10) * 10;
}

export function yearToNextDecade(year) {
  return Math.ceil(parseInt(year, 10) / 10) * 10;
}
