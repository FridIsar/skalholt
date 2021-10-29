// Multer helper middleware to grab
// Files that come in requests made with form-data

import multer from 'multer';
import dotenv from 'dotenv';

import requireEnv from './requireEnv.js';

dotenv.config();
requireEnv(['MULTER_TEMP_DIR']);

const {
  MULTER_TEMP_DIR: multerDir = './temp',
} = process.env;

export const MAX_FILE_SIZE = 2097152;

/**
 * Helper function to parse images
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 * @param {Function} next the next middleware to use
 */
export function imageWithMulter(req, res, next) {
  multer({ dest: multerDir, limits: { fieldNameSize: 32, fileSize: MAX_FILE_SIZE } })
    .single('image')(req, res, (err) => {
      if (err) {
        let errors;

        if (err.message === 'Unexpected field') {
          errors = [{
            field: 'image',
            error: 'Unable to read image',
          }];
        } else if (err.message === 'File too large') {
          errors = [{
            field: 'image',
            error: `Image too large, max size is ${MAX_FILE_SIZE / 1024 / 1024} Mb`,
          }];
        } else {
          errors = [{
            field: 'image',
            error: err.message,
          }];
        }

        return res.status(400).json({ errors });
      }

      return next();
    });
}

/**
 * Helper function to parse other files
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 * @param {Function} next the next middleware to use
 */
export function fileWithMulter(req, res, next) {
  multer({ dest: multerDir, limits: { fieldNameSize: 32, fileSize: MAX_FILE_SIZE } })
    .single('file')(req, res, (err) => {
      if (err) {
        let errors;

        if (err.message === 'Unexpected field') {
          errors = [{
            field: 'file',
            error: 'Unable to read file',
          }];
        } else if (err.message === 'File too large') {
          errors = [{
            field: 'file',
            error: `File too large, max size is ${MAX_FILE_SIZE / 1024 / 1024} Mb`,
          }];
        } else {
          errors = [{
            field: 'file',
            error: err.message,
          }];
        }

        return res.status(400).json({ errors });
      }

      return next();
    });
}
