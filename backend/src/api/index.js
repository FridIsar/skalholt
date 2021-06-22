import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import express from 'express';

import { requireAdmin } from '../auth/passport.js';
import { catchErrors } from '../utils/catchErrors.js';
import { readFile } from '../utils/fileSystem.js';

import {
  listUsers,
  listUser,
  updateUser,
} from './users.js';

import {
  adminValidator,
  validateResourceExists,
} from '../validation/validators.js';
import { validationCheck } from '../validation/helpers.js';

// TODO: import routes, file handling for POST and PATCH routes
import {
  listYears,
  listYear,
} from './years.js';

import {
  listBuildings,
  listBuilding,
} from './buildings.js';

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
router.get(
  '/years',
  validationCheck,
  catchErrors(listYears),
);

router.get(
  '/years/:yearId',
  validationCheck,
  catchErrors(listYear),
);

router.get(
  '/years/:yearId/buildings',
  validationCheck,
  catchErrors(listBuildings),
);

router.get(
  '/years/:yearId/buildings/:buildingId',
  validationCheck,
  catchErrors(listBuilding),
);

router.get(
  '/users',
  requireAdmin,
  validationCheck,
  listUsers,
);

router.get(
  '/users/:id',
  requireAdmin,
  validateResourceExists(listUser),
  validationCheck,
  returnResource,
);

router.patch(
  '/users/:id',
  requireAdmin,
  validateResourceExists(listUser),
  adminValidator,
  validationCheck,
  catchErrors(updateUser),
);
