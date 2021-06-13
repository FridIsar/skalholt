import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import express from 'express';
import multer from 'multer';

import { requireAuthentication, requireAdmin, addUserIfAuthenticated } from '../auth/passport.js';
import { catchErrors } from '../utils/catchErrors.js';
import { readFile } from '../utils/fileSystem.js';

import {
  listUser,
  listUsers,
  updateUser,
} from './users.js';

// TODO: import rest of the routes, file handling for POST and PATCH routes

export const router = express.Router();

function returnResource(req, res) {
  return res.json(req.resource);
}

router.get('/', async (req, res) => {
  const path = dirname(fileURLToPath(import.meta.url));
  const indexJson = await readFile(join(path, './index.json'));
  res.json(JSON.parse(indexJson));
});

// TODO: define routes
