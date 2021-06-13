import { validationResult } from 'express-validator';

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

export function resourceExists(fn) {
  return (value, { req }) => fn(value, req)
    .then((resource) => {
      if (!resource) {
        return Promise.reject(new Error('not found'));
      }
      req.resource = resource;
      return Promise.resolve();
    })
    .catch((error) => {
      if (error.message === 'not found') {
        return Promise.reject(error);
      }

      return Promise.reject(new Error('server error'));
    });
}
