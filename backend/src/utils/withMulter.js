import multer from 'multer';
import dotenv from 'dotenv';

import requireEnv from './requireEnv.js';

dotenv.config();
requireEnv(['MULTER_TEMP_DIR']);

const {
  MULTER_TEMP_DIR: multerDir = './temp',
} = process.env;

export function imageWithMulter(req, res, next) {
  multer({ dest: multerDir })
    .single('image')(req, res, (err) => {
      if (err) {
        if (err.message === 'Unexpected field') {
          const errors = [{
            field: 'image',
            error: 'Unable to read image',
          }];
          return res.status(400).json({ errors });
        }

        return next(err);
      }

      return next();
    });
}

export function fileWithMulter(req, res, next) {
  multer({ dest: multerDir })
    .single('file')(req, res, (err) => {
      if (err) {
        if (err.message === 'Unexpected field') {
          const errors = [{
            field: 'file',
            error: 'Unable to read file',
          }];
          return res.status(400).json({ errors });
        }

        return next(err);
      }

      return next();
    });
}
