import { validationResult } from 'express-validator';

import { logger } from '../utils/logger.js';

/**
 * Middleware used to stop routing and send out the listed errors
 * if there were any. If no errors have accumulated the request is routed onwards
 *
 * @param {Object} req request object
 * @param {Object} res response object
 * @param {Function} next next middleware
 * @returns The errors as a JSON response or the next middleware in the routing list
 */
export function validationCheck(req, res, next) {
  const validation = validationResult(req);

  if (!validation.isEmpty()) {
    const notFoundError = validation.errors.find((error) => error.msg === 'not found');
    const serverError = validation.errors.find((error) => error.msg === 'server error');
    const loginError = validation.errors.find((error) => error.msg === 'username or password incorrect');

    let status = 400;

    if (serverError) {
      status = 500;
    } else if (notFoundError) {
      status = 404;
    } else if (loginError) {
      status = 401;
    }

    const validationErrorsWithoutSkip = validation.errors.filter((error) => error.msg !== 'skip');

    return res.status(status).json({ errors: validationErrorsWithoutSkip });
  }

  return next();
}

/**
 * Middleware used to check whether a requested resource exists
 *
 * @param {Function} fn the function to the check the value for
 * @returns not found errors (or rejection if no function)
 *          if resources are not found, further routing of the
 *          request if the resources are found
 */
export function resourceExists(fn) {
  return (value, { req }) => fn(value, req)
    .then((resource) => {
      if (!resource) {
        return Promise.reject(new Error('not found'));
      }
      req.resource = resource;
      return Promise.resolve();
    })
    .catch((err) => {
      if (err.message === 'not found') {
        return Promise.reject(err);
      }

      logger.warn('Middleware error:', err);
      return Promise.reject(new Error('server error'));
    });
}
