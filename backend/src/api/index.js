import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import express from 'express';

import { requireAdmin } from '../auth/passport.js';
import { catchErrors } from '../utils/catchErrors.js';
import { readFile } from '../utils/fileSystem.js';
import withMulter from '../utils/withMulter.js';

import {
  listUsers,
  listUser,
  updateUser,
} from './users.js';

import {
  adminValidator,
  validateResourceExists,
  yearValidators,
  yearIdValidator,
  buildingValidators,
  buildingIdValidator,
} from '../validation/validators.js';
import { validationCheck } from '../validation/helpers.js';

import {
  listYears,
  listYear,
  createYear,
  updateYear,
  deleteYear,
} from './years.js';

import {
  listBuildings,
  listBuilding,
  createBuilding,
  updateBuilding,
  deleteBuilding,
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

router.get(
  '/years',
  validationCheck,
  catchErrors(listYears),
);

router.post(
  '/years/',
  requireAdmin,
  withMulter,
  yearValidators,
  validationCheck,
  catchErrors(createYear),
);

router.get(
  '/years/:yearId',
  validationCheck,
  catchErrors(listYear),
);

router.patch(
  '/years/:yearId',
  requireAdmin,
  withMulter,
  yearValidators,
  validationCheck,
  catchErrors(updateYear),
);

router.delete(
  '/years/:yearId',
  requireAdmin,
  yearIdValidator,
  validationCheck,
  catchErrors(deleteYear),
);

router.get(
  '/years/:yearId/buildings',
  validationCheck,
  catchErrors(listBuildings),
);

router.post(
  '/years/:yearId/buildings/',
  requireAdmin,
  withMulter,
  buildingValidators,
  validationCheck,
  catchErrors(createBuilding),
);

router.get(
  '/years/:yearId/buildings/:buildingId',
  validationCheck,
  catchErrors(listBuilding),
);

router.patch(
  '/years/:yearId/buildings/:buildingId',
  requireAdmin,
  withMulter,
  buildingIdValidator,
  buildingValidators,
  validationCheck,
  catchErrors(updateBuilding),
);

router.delete(
  '/years/:yearId/buildings/:buildingId',
  requireAdmin,
  yearIdValidator,
  buildingIdValidator,
  validationCheck,
  catchErrors(deleteBuilding),
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
