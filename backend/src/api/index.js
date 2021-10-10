// This is a somewhat long file that defines how requests are routed
// The actual routing functions can be seen in their respective files

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import express from 'express';

import { requireAdmin } from '../auth/passport.js';
import { catchErrors } from '../utils/catchErrors.js';
import { readFile } from '../utils/fileSystem.js';
import { imageWithMulter, fileWithMulter } from '../utils/withMulter.js';

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
  fileIdValidator,
  fileValidators,
  findIdValidator,
  findValidators,
  featureIdValidator,
  featureValidators,
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

import {
  listFiles,
  getFile,
  createFile,
  removeFile,
} from './files.js';

import {
  listFeatures,
  createFeature,
  updateFeature,
  deleteFeature,
} from './features.js';

import {
  listFinds,
  createFind,
  updateFind,
  deleteFind,
} from './finds.js';

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
  imageWithMulter,
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
  imageWithMulter,
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
  imageWithMulter,
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
  imageWithMulter,
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

router.post(
  '/years/:yearId/buildings/:buildingId/features/',
  requireAdmin,
  featureValidators,
  validationCheck,
  catchErrors(createFeature),
);

router.get(
  '/years/:yearId/buildings/:buildingId/features',
  validationCheck,
  catchErrors(listFeatures),
);

router.patch(
  '/years/:yearId/buildings/:buildingId/features/:featureId',
  requireAdmin,
  featureIdValidator,
  featureValidators,
  validationCheck,
  catchErrors(updateFeature),
);

router.delete(
  '/years/:yearId/buildings/:buildingId/features/:featureId',
  requireAdmin,
  featureIdValidator,
  validationCheck,
  catchErrors(deleteFeature),
);

router.post(
  '/years/:yearId/buildings/:buildingId/finds/',
  requireAdmin,
  findValidators,
  validationCheck,
  catchErrors(createFind),
);

router.get(
  '/years/:yearId/buildings/:buildingId/finds',
  validationCheck,
  catchErrors(listFinds),
);

router.patch(
  '/years/:yearId/buildings/:buildingId/finds/:findId',
  requireAdmin,
  findIdValidator,
  findValidators,
  validationCheck,
  catchErrors(updateFind),
);

router.delete(
  '/years/:yearId/buildings/:buildingId/finds/:findId',
  requireAdmin,
  findIdValidator,
  validationCheck,
  catchErrors(deleteFind),
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

router.get(
  '/files',
  validationCheck,
  catchErrors(listFiles),
);

router.post(
  '/files/',
  requireAdmin,
  fileWithMulter,
  fileValidators,
  validationCheck,
  catchErrors(createFile),
);

router.get(
  '/files/:fileId',
  validationCheck,
  catchErrors(getFile),
);

router.delete(
  '/files/:fileId',
  requireAdmin,
  fileIdValidator,
  validationCheck,
  catchErrors(removeFile),
);
