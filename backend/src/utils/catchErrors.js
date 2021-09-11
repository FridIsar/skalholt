/**
 * Generic catch middleware
 *
 * @param {function} fn the function to catch for
 * @returns the next middleware to be used
 */
export function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}
