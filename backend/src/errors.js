/**
 * Login error prototype used for user routes
 *
 * @param {Object} message the message object to throw
 */
export function LoginError(message) {
  this.message = message;
  this.stack = Error().stack;
}
LoginError.prototype = Object.create(Error.prototype);
LoginError.prototype.name = 'LoginError';
