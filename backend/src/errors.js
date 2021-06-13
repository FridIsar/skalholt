export function LoginError(message) {
  this.message = message;
  this.stack = Error().stack;
}
LoginError.prototype = Object.create(Error.prototype);
LoginError.prototype.name = 'LoginError';
