// Contains all the validation that is done before a request is routed to its handler function
// Most of these should be relatively easy to understand from the given message

import { body, param } from 'express-validator';

import { resourceExists } from './helpers.js';
import { comparePasswords, findByEmail, findByUsername } from '../auth/users.js';
import { LoginError } from '../errors.js';
import { logger } from '../utils/logger.js';
import { MAX_FILE_SIZE } from '../utils/withMulter.js';

export function validateResourceExists(fetchResource) {
  return [
    param('id')
      .custom(resourceExists(fetchResource))
      .withMessage('not found'),
  ];
}

export function validateResourceNotExists(fetchResource) {
  return [
    param('id')
      .not()
      .custom(resourceExists(fetchResource))
      .withMessage('already exists'),
  ];
}

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
      logger.info(`Invalid login attempt for ${username}`);
    }

    if (!valid) {
      return Promise.reject(new LoginError('username or password incorrect'));
    }
    return Promise.resolve();
  });

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

export const idValidator = body('id')
  .isInt({ min: 1 })
  .withMessage('id must be an integer larger than 0');

export const yearValidator = body('year')
  .isInt({ min: 1670 })
  .withMessage('year must be an integer of at least 1670');

export const yearIdValidator = param('yearId')
  .isInt({ min: 1670 })
  .withMessage('yearId must be an integer of at least 1670');

export const buildingIdValidator = param('buildingId')
  .isInt({ min: 1 })
  .withMessage('buildingId must be an integer larger than 0');

export const phaseValidator = body('phase')
  .if(isPatchingAllowAsOptional)
  .isLength({ min: 3, max: 32 })
  .withMessage('phase is required, max 32 characters');

export const startValidator = body('start')
  .if(isPatchingAllowAsOptional)
  .isInt({ min: 1670 })
  .withMessage('start must be an integer of at least 1670');

export const endValidator = body('end')
  .if(isPatchingAllowAsOptional)
  .isInt({ min: 1671 })
  .withMessage('end must be an integer larger than 1670');

export const majorGroupValidator = body('major_group')
  .isString({ min: 1, max: 32 })
  .withMessage('major_group is required, max 32 characters');

export const pathOptionalValidator = body('path')
  .optional()
  .isLength({ min: 1, max: 8192 })
  .withMessage('path is required, max 8192 characters');

export const descriptionOptionalValidator = body('description')
  .optional()
  .isString({ min: 0, max: 16384 })
  .withMessage('description must be a string');

export const icelandicOptionalValidator = body('is')
  .optional()
  .isString({ min: 0, max: 64 })
  .withMessage('icelandic attribution must be a string');

export const englishOptionalValidator = body('en')
  .optional()
  .isString({ min: 0, max: 64 })
  .withMessage('english attribution must be a string');

export const csvIdValidator = param('csvId')
  .isInt({ min: 1 })
  .withMessage('csvId must be an integer larger than 0');

function validateSvgMimetype(mimetype) {
  return mimetype.toLowerCase() === 'image/svg+xml';
}

export const imageOptionalValidator = body('image')
  .optional()
  .custom(async (image, { req = {} }) => {
    const { file: { path, mimetype, size } = {} } = req;

    if (!path && !mimetype && req.method === 'PATCH') {
      return Promise.resolve();
    }

    if (!path && !mimetype) {
      return Promise.reject(new Error('image is required'));
    }

    if (parseInt(size, 10) >= MAX_FILE_SIZE) {
      return Promise.reject(new Error('image is larger than 20 Mb'));
    }

    if (!validateSvgMimetype(mimetype)) {
      const error = `Mimetype ${mimetype} is not allowed. Only svg files are accepted`;
      return Promise.reject(new Error(error));
    }

    return Promise.resolve();
  });

const CSV_MIMETYPES = [
  'text/csv',
];

function validateCsvMimeType(mimetype) {
  return CSV_MIMETYPES.indexOf(mimetype.toLowerCase()) >= 0;
}

export const csvValidator = body('file')
  .custom(async (file, { req = {} }) => {
    const { file: { path, mimetype, size } = {} } = req;

    if (!path && !mimetype) {
      return Promise.reject(new Error('file is required'));
    }

    if (parseInt(size, 10) >= MAX_FILE_SIZE) {
      return Promise.reject(new Error('file is larger than 20 Mb'));
    }

    if (!validateCsvMimeType(mimetype)) {
      const error = `Mimetype ${mimetype} is not allowed. Only csv files are accepted`;
      return Promise.reject(new Error(error));
    }

    return Promise.resolve();
  });

const PDF_MIMETYPES = [
  'application/pdf',
];

function validatePdfMimeType(mimetype) {
  return PDF_MIMETYPES.indexOf(mimetype.toLowerCase()) >= 0;
}

export const pdfValidator = body('file')
  .custom(async (file, { req = {} }) => {
    const { file: { path, mimetype, size } = {} } = req;

    if (!path && !mimetype) {
      return Promise.reject(new Error('file is required'));
    }

    if (parseInt(size, 10) >= MAX_FILE_SIZE) {
      return Promise.reject(new Error('file is larger than 20 Mb'));
    }

    if (!validatePdfMimeType(mimetype)) {
      const error = `Mimetype ${mimetype} is not allowed. Only pdf files are accepted`;
      return Promise.reject(new Error(error));
    }

    return Promise.resolve();
  });

const IMAGE_MIMETYPES = [
  'image/jpeg',
  'image/png',
  'image/tiff',
];

function validateImageMimeType(mimetype) {
  return IMAGE_MIMETYPES.indexOf(mimetype.toLowerCase()) >= 0;
}

export const imageValidator = body('image')
  .custom(async (file, { req = {} }) => {
    const { file: { path, mimetype, size } = {} } = req;

    if (!path && !mimetype) {
      return Promise.reject(new Error('image is required'));
    }

    if (parseInt(size, 10) >= MAX_FILE_SIZE) {
      return Promise.reject(new Error('image is larger than 20 Mb'));
    }

    if (!validateImageMimeType(mimetype)) {
      const error = `Mimetype ${mimetype} is not allowed. Only ${IMAGE_MIMETYPES.join(',')} files are accepted`;
      return Promise.reject(new Error(error));
    }

    return Promise.resolve();
  });

export const findIdValidator = param('findId')
  .isInt({ min: 1 })
  .withMessage('findId must be an integer larger than 0');

export const objectTypeOptionalValidator = body('obj_type')
  .optional()
  .isString({ min: 0, max: 64 })
  .withMessage('obj_type must be a string');

export const materialTypeOptionalValidator = body('material_type')
  .optional()
  .isString({ min: 0, max: 64 })
  .withMessage('material_type must be a string');

export const fileGroupOptionalValidator = body('file_group')
  .optional()
  .isString({ min: 0, max: 32 })
  .withMessage('file_group must be a string');

export const fragmentOptionalValidator = body('fragments')
  .optional()
  .isInt({ min: 1 })
  .withMessage('fragments must be an integer larger than 0');

export const featureIdValidator = param('featureId')
  .isInt({ min: 1 })
  .withMessage('featureId must be an integer larger than 0');

export const pdfIdValidator = param('pdfId')
  .isInt({ min: 1 })
  .withMessage('pdfId must be an integer larger than 0');

export const imageIdValidator = param('imageId')
  .isInt({ min: 1 })
  .withMessage('imageId must be an integer larger than 0');

export const typeOptionalValidator = body('type')
  .optional()
  .isString({ min: 0 })
  .withMessage('type must be a string');

export const referenceIdValidator = param('referenceId')
  .isInt({ min: 1 })
  .withMessage('referenceId must be an integer larger than 0');

export const referenceOptionalValidator = body('reference')
  .optional()
  .isString({ min: 0 })
  .withMessage('reference must be a string');

export const doiOptionalValidator = body('doi')
  .optional()
  .isString({ min: 0 })
  .withMessage('doi must be a string');

export const referenceValidators = [
  referenceOptionalValidator,
  descriptionOptionalValidator,
  doiOptionalValidator,
];

export const csvValidators = [
  csvValidator,
  majorGroupValidator,
];

export const pdfValidators = [
  pdfValidator,
  majorGroupValidator,
];

export const imageValidators = [
  imageValidator,
  majorGroupValidator,
];

export const yearValidators = [
  descriptionOptionalValidator,
  imageOptionalValidator,
];

export const buildingValidators = [
  yearIdValidator,
  phaseValidator,
  startValidator,
  endValidator,
  pathOptionalValidator,
  descriptionOptionalValidator,
  englishOptionalValidator,
  icelandicOptionalValidator,
  imageOptionalValidator,
];

// Despite being routed through years
// We don't actually specifically need
// to check the year itself, building ID
// is sufficient to identify

export const findValidators = [
  buildingIdValidator,
  objectTypeOptionalValidator,
  materialTypeOptionalValidator,
  fileGroupOptionalValidator,
  fragmentOptionalValidator,
];

export const featureValidators = [
  buildingIdValidator,
  descriptionOptionalValidator,
  typeOptionalValidator,
];
