import express from 'express';
import jwt from 'jsonwebtoken';

import { jwtOptions, requireAuthentication, tokenOptions } from './passport.js';
import {
  createUser,
  findById,
  findByUsername,
  updateUser,
} from './users.js';
import { catchErrors } from '../utils/catchErrors.js';
import {
  atLeastOneBodyValueValidator,
  emailDoesNotExistValidator,
  emailValidator,
  passwordValidator,
  usernameAndPaswordValidValidator,
  usernameDoesNotExistValidator,
  usernameValidator,
} from '../validation/validators.js';
import { validationCheck } from '../validation/helpers.js';
import { logger } from '../utils/logger.js';

export const router = express.Router();

/**
 * Middleware to be used to log in a user
 *
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns json response with user and login details
 */
async function loginRoute(req, res) {
  const { username } = req.body;

  const user = await findByUsername(username);

  if (!user) {
    logger.error('User not found:', username);
    return res.status(500).json({});
  }

  const payload = { id: user.id };
  const token = jwt.sign(payload, jwtOptions.secretOrKey, tokenOptions);
  delete user.password;

  return res.json({
    user,
    token,
    expiresIn: tokenOptions.expiresIn,
  });
}

/**
 * Middleware to check current login details
 *
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns the logged in user details ( if the user is logged in )
 */
async function currentUserRoute(req, res) {
  const { user: { id } = {} } = req;

  const user = await findById(id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  delete user.password;

  return res.json(user);
}

/**
 * Middleware to update current user info
 * admins cannot move their own status
 *
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns the updated user details, if any
 */
async function updateCurrentUserRoute(req, res) {
  const { id } = req.user;

  const user = await findById(id);

  if (!user) {
    logger.error('Unable to update user:', id);
    return res.status(500).json(null);
  }

  const { password, email } = req.body;

  const result = await updateUser(id, password, email);

  if (!result) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  return res.status(200).json(result);
}

/**
 * Middleware for user registration
 * new users always default to non admin status
 *
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns the created user details
 */
async function registerRoute(req, res) {
  const { username, email, password = '' } = req.body;
  const result = await createUser(username, email, password);
  delete result.password;

  return res.status(201).json(result);
}

// The defined routes

router.post(
  '/users/register',
  usernameValidator,
  emailValidator,
  passwordValidator,
  usernameDoesNotExistValidator,
  validationCheck,
  catchErrors(registerRoute),
);

router.post(
  '/users/login',
  usernameValidator,
  passwordValidator,
  usernameAndPaswordValidValidator,
  validationCheck,
  catchErrors(loginRoute),
);

router.get(
  '/users/me',
  requireAuthentication,
  catchErrors(currentUserRoute),
);

router.patch(
  '/users/me',
  requireAuthentication,
  emailValidator,
  passwordValidator,
  emailDoesNotExistValidator,
  atLeastOneBodyValueValidator(['email', 'password']),
  validationCheck,
  catchErrors(updateCurrentUserRoute),
);
