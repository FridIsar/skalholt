export function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}
