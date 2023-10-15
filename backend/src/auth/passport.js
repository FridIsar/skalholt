import passport from 'passport';
import dotenv from 'dotenv';
import { Strategy, ExtractJwt } from 'passport-jwt';
//import pkg from 'passport-jwt';
//const { Strategy, ExtractJwt } = pkg;

import { findById } from './users.js';
import requireEnv from '../utils/requireEnv.js';

dotenv.config();
requireEnv(['JWT_SECRET', 'TOKEN_LIFETIME']);

const {
  JWT_SECRET: jwtSecret,
  TOKEN_LIFETIME: tokenLifetime = 3600,
} = process.env;

/**
 * Middleware to add user details
 *
 * @param {Object} data current request user data
 * @param {Function} next next middleware to send to
 */
async function strat(data, next) {
  const user = await findById(data.id);

  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
}

/**
 * Middleware to check the jwt status of a user
 *
 * @param {Object} req request object
 * @param {Object} res response object
 * @param {Function} next next middleware to route to
 * @returns the next middleware
 */
export function requireAuthentication(req, res, next) {
  return passport.authenticate(
    'jwt',
    { session: false },
    (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        const error = info.name === 'TokenExpiredError'
          ? 'expired token' : 'invalid token';

        return res.status(401).json({ error });
      }

      req.user = user;
      return next();
    },
  )(req, res, next);
}

/**
 * Middleware to add user details to the request
 * using the jwt token details
 *
 * @param {Object} req request object
 * @param {Object} res response objec
 * @param {*} next the next middleware to route to
 * @returns the next middleware
 */
export function addUserIfAuthenticated(req, res, next) {
  return passport.authenticate(
    'jwt',
    { session: false },
    (err, user) => {
      if (err) {
        return next(err);
      }

      if (user) {
        req.user = user;
      }

      return next();
    },
  )(req, res, next);
}

/**
 * Middleware to check the jwt status of an admin
 *
 * @param {Object} req request object
 * @param {Object} res response object
 * @param {Function} next next middleware to route to
 * @returns the next middleware
 */
export function requireAdmin(req, res, next) {
  return passport.authenticate(
    'jwt',
    { session: false },
    (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        const error = info.name === 'TokenExpiredError'
          ? 'expired token' : 'invalid token';

        return res.status(401).json({ error });
      }

      if (!user.admin) {
        const error = 'insufficient authorization';
        return res.status(401).json({ error });
      }

      req.user = user;
      return next();
    },
  )(req, res, next);
}

export const tokenOptions = { expiresIn: parseInt(tokenLifetime, 10) };

export const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
};

passport.use(new Strategy(jwtOptions, strat));

export default passport;
