export function isInt(i) {
  return i !== '' && Number.isInteger(Number(i));
}

export function isString(s) {
  return typeof s === 'string';
}

export function isEmpty(s) {
  return s != null && !s;
}
