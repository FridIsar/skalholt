import { body, param } from 'express-validator';

import { comparePasswords, findByEmail, findByUsername } from '../auth/users.js';
import { LoginError } from '../errors.js';

export const usernameValidator = body('username')
  .isLength({ min: 1, max: 256 })
  .withMessage('username is required, max 256 characters');

const isPatchingAllowAsOptional = (value, { req }) => {
  if (!value && req.method === 'PATCH') {
    return false;
  }

  return true;
};

export const nameValidator = body('name')
  .if(isPatchingAllowAsOptional)
  .isLength({ min: 1, max: 256 })
  .withMessage('name is required, max 128 characters');

export const emailValidator = body('email')
  .if(isPatchingAllowAsOptional)
  .isLength({ min: 1, max: 256 })
  .isEmail()
  .withMessage('email is required, max 256 characters');

export const passwordValidator = body('password')
  .if(isPatchingAllowAsOptional)
  .isLength({ min: 10, max: 256 })
  .withMessage('password is required, min 10 characters, max 256 characters');

export const emailDoesNotExistValidator = body('email')
  .custom(async (email) => {
    const user = await findByEmail(email);

    if (user) {
      return Promise.reject(new Error('email already exists'));
    }
    return Promise.resolve();
  });

export const usernameDoesNotExistValidator = body('username')
  .custom(async (username) => {
    const user = await findByUsername(username);

    if (user) {
      return Promise.reject(new Error('username already exists'));
    }
    return Promise.resolve();
  });

export const usernameAndPaswordValidValidator = body('username')
  .custom(async (username, { req: { body: reqBody } = {} }) => {
    const { password } = reqBody;

    if (!username || !password) {
      return Promise.reject(new Error('skip'));
    }

    let valid = false;
    try {
      const user = await findByUsername(username);
      valid = await comparePasswords(password, user.password);
    } catch (e) {
      // TODO: log failed logins
    }

    if (!valid) {
      return Promise.reject(new LoginError('username or password incorrect'));
    }
    return Promise.resolve();
  });

export const inProductionValidator = body('inproduction')
  .if(isPatchingAllowAsOptional)
  .exists()
  .withMessage('inproduction is required')
  .isBoolean({ strict: false })
  .withMessage('inproduction must be a boolean');

export const adminValidator = body('admin')
  .exists()
  .withMessage('admin is required')
  .isBoolean()
  .withMessage('admin must be a boolean')
  .bail()
  .custom(async (admin, { req: { user, params } = {} }) => {
    let valid = false;

    const userToChange = parseInt(params.id, 10);
    const currentUser = user.id;

    if (Number.isInteger(userToChange) && userToChange !== currentUser) {
      valid = true;
    }

    if (!valid) {
      return Promise.reject(new Error('admin cannot change self'));
    }
    return Promise.resolve();
  });

export const numberValidator = body('number')
  .isInt({ min: 1 })
  .withMessage('number must be an integer larger than 0');

export const airDateOptionalValidator = body('airDate')
  .optional()
  .isDate()
  .withMessage('airDate must be a date');

export const airDateValidator = body('airDate')
  .if(isPatchingAllowAsOptional)
  .isDate()
  .withMessage('airDate must be a date');

export const overviewOptionalValidator = body('overview')
  .optional()
  .isString({ min: 0 })
  .withMessage('overview must be a string');

export const taglineOptionalValidator = body('tagline')
  .optional()
  .isString({ min: 0 })
  .withMessage('tagline must be a string');

export const descriptionValidator = body('description')
  .if(isPatchingAllowAsOptional)
  .isString({ min: 1 })
  .withMessage('description must be a string');

export const languageValidator = body('language')
  .if(isPatchingAllowAsOptional)
  .isString({ min: 2, max: 2 })
  .withMessage('language must be a string of length 2');

export const networkOptionalValidator = body('network')
  .optional()
  .isString({ min: 0 })
  .withMessage('network must be a string');

// TODO refactor optional text validators into one generic one
export const urlOptionalValidator = body('url')
  .optional()
  .isString({ min: 0 })
  .withMessage('url must be a string');

export const seasonIdValidator = param('seasonId')
  .isInt({ min: 1 })
  .withMessage('seasonId must be an integer larger than 0');
  // TODO custom that makes sure it exists

export const serieIdValidator = param('serieId')
  .isInt({ min: 1 })
  .withMessage('serieId must be an integer larger than 0');
  // TODO custom that makes sure it exists

export const episodeIdValidator = param('episodeId')
  .isInt({ min: 1 })
  .withMessage('episodeId must be an integer larger than 0');
  // TODO custom that makes sure it exists

const MIMETYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
];

function validateImageMimetype(mimetype) {
  return MIMETYPES.indexOf(mimetype.toLowerCase()) >= 0;
}

export const posterValidator = body('image')
  .custom(async (image, { req = {} }) => {
    const { file: { path, mimetype } = {} } = req;

    if (!path && !mimetype && req.method === 'PATCH') {
      return Promise.resolve();
    }

    if (!path && !mimetype) {
      return Promise.reject(new Error('image is required'));
    }

    if (!validateImageMimetype(mimetype)) {
      const error = `Mimetype ${mimetype} is not legal. `
        + `Only ${MIMETYPES.join(', ')} are accepted`;
      return Promise.reject(new Error(error));
    }

    return Promise.resolve();
  });

export const episodeValidators = [
  nameValidator,
  numberValidator,
  airDateOptionalValidator,
  overviewOptionalValidator,
  seasonIdValidator,
  serieIdValidator,
];

export const seasonValidators = [
  nameValidator,
  numberValidator,
  airDateOptionalValidator,
  overviewOptionalValidator,
  serieIdValidator,
  posterValidator,
];

export const serieValidators = [
  nameValidator,
  airDateValidator,
  inProductionValidator,
  taglineOptionalValidator,
  posterValidator,
  descriptionValidator,
  languageValidator,
  networkOptionalValidator,
  urlOptionalValidator,
];

export const validateRating = body('rating')
  .isIn([0, 1, 2, 3, 4, 5])
  .withMessage('rating must be an integer, one of 0, 1, 2, 3, 4, 5');

export const validateState = body('state')
  .isIn(['want to watch', 'watching', 'watched'])
  .withMessage('state must be one of "want to watch", "watching", "watched"');

export function atLeastOneBodyValueValidator(fields) {
  return body()
    .custom(async (value, { req }) => {
      const { body: reqBody } = req;

      let valid = false;

      for (let i = 0; i < fields.length; i += 1) {
        const field = fields[i];

        if (field in reqBody && reqBody[field] != null) {
          valid = true;
          break;
        }
      }

      if (!valid) {
        return Promise.reject(new Error(`require at least one value of: ${fields.join(', ')}`));
      }
      return Promise.resolve();
    });
}
