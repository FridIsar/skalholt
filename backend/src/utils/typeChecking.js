// Quick typechecking helpers

/**
 * Helper function to check whether a given value is an integer
 *
 * @param {*} i the value to check
 * @returns whether the value was an integer or not
 */
export function isInt(i) {
  return i !== '' && Number.isInteger(Number(i));
}

/**
 * Helper function to check whether a given value is a string
 *
 * @param {*} s the value to check
 * @returns whether the value was a string or not
 */
export function isString(s) {
  return typeof s === 'string';
}

/**
 * Helper function to check whether a given value is empty
 *
 * @param {*} s the value to check
 * @returns whether the value is empty or not
 */
export function isEmpty(s) {
  return s != null && !s;
}
