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
  yearIdForkValidator,
  buildingValidators,
  buildingIdValidator,
  buildingIdForkValidator,
  csvIdValidator,
  csvValidators,
  pdfIdValidator,
  pdfValidators,
  imageIdValidator,
  imageValidators,
  imageResizeValidators,
  findIdValidator,
  findValidators,
  featureIdValidator,
  featureValidators,
  referenceValidators,
  referenceIdValidator,
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
  listCsvs,
  getCsv,
  createCsv,
  removeCsv,
} from './csvs.js';

import {
  listPdfs,
  getPdf,
  createPdf,
  removePdf,
} from './pdfs.js';

import {
  listImages,
  getImage,
  createImage,
  removeImage,
} from './images.js';

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

import {
  listReferences,
  createReference,
  updateReference,
  deleteReference,
} from './references.js';

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
  yearIdForkValidator,
  validationCheck,
  catchErrors(listYear),
);

router.patch(
  '/years/:yearId',
  requireAdmin,
  imageWithMulter,
  yearIdValidator,
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
  yearIdValidator,
  validationCheck,
  catchErrors(listBuildings),
);

router.post(
  '/years/:yearId/buildings/',
  requireAdmin,
  imageWithMulter,
  buildingValidators, // This includes yearIdValidator
  validationCheck,
  catchErrors(createBuilding),
);

router.get(
  '/years/:yearId/buildings/:buildingId',
  yearIdValidator,
  buildingIdForkValidator,
  validationCheck,
  catchErrors(listBuilding),
);

router.patch(
  '/years/:yearId/buildings/:buildingId',
  requireAdmin,
  imageWithMulter,
  yearIdValidator,
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
  yearIdValidator,
  featureValidators,
  validationCheck,
  catchErrors(createFeature),
);

router.get(
  '/years/:yearId/buildings/:buildingId/features',
  yearIdValidator,
  buildingIdValidator,
  validationCheck,
  catchErrors(listFeatures),
);

router.patch(
  '/years/:yearId/buildings/:buildingId/features/:featureId',
  requireAdmin,
  yearIdValidator,
  featureIdValidator,
  featureValidators,
  validationCheck,
  catchErrors(updateFeature),
);

router.delete(
  '/years/:yearId/buildings/:buildingId/features/:featureId',
  requireAdmin,
  yearIdValidator,
  featureIdValidator,
  validationCheck,
  catchErrors(deleteFeature),
);

router.post(
  '/years/:yearId/buildings/:buildingId/finds/',
  requireAdmin,
  yearIdValidator,
  findValidators,
  validationCheck,
  catchErrors(createFind),
);

router.get(
  '/years/:yearId/buildings/:buildingId/finds',
  yearIdValidator,
  buildingIdValidator,
  validationCheck,
  catchErrors(listFinds),
);

router.patch(
  '/years/:yearId/buildings/:buildingId/finds/:findId',
  requireAdmin,
  yearIdValidator,
  findIdValidator,
  findValidators,
  validationCheck,
  catchErrors(updateFind),
);

router.delete(
  '/years/:yearId/buildings/:buildingId/finds/:findId',
  requireAdmin,
  yearIdValidator,
  buildingIdValidator,
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
  '/csv',
  validationCheck,
  catchErrors(listCsvs),
);

router.post(
  '/csv/',
  requireAdmin,
  fileWithMulter,
  csvValidators,
  validationCheck,
  catchErrors(createCsv),
);

router.get(
  '/csv/:csvId',
  csvIdValidator,
  validationCheck,
  catchErrors(getCsv),
);

router.delete(
  '/csv/:csvId',
  requireAdmin,
  csvIdValidator,
  validationCheck,
  catchErrors(removeCsv),
);

router.get(
  '/pdf',
  validationCheck,
  catchErrors(listPdfs),
);

router.post(
  '/pdf/',
  requireAdmin,
  fileWithMulter,
  pdfValidators,
  validationCheck,
  catchErrors(createPdf),
);

router.get(
  '/pdf/:pdfId',
  pdfIdValidator,
  validationCheck,
  catchErrors(getPdf),
);

router.delete(
  '/pdf/:pdfId',
  requireAdmin,
  pdfIdValidator,
  validationCheck,
  catchErrors(removePdf),
);

router.get(
  '/images',
  validationCheck,
  catchErrors(listImages),
);

router.post(
  '/images/',
  requireAdmin,
  imageWithMulter,
  imageValidators,
  validationCheck,
  catchErrors(createImage),
);

router.get(
  '/images/:imageId',
  imageIdValidator,
  imageResizeValidators,
  validationCheck,
  catchErrors(getImage),
);

router.delete(
  '/images/:imageId',
  requireAdmin,
  imageIdValidator,
  validationCheck,
  catchErrors(removeImage),
);

router.post(
  '/references/',
  requireAdmin,
  referenceValidators,
  validationCheck,
  catchErrors(createReference),
);

router.get(
  '/references',
  validationCheck,
  catchErrors(listReferences),
);

router.patch(
  '/references/:referenceId',
  requireAdmin,
  referenceIdValidator,
  referenceValidators,
  validationCheck,
  catchErrors(updateReference),
);

router.delete(
  '/references/:referenceId',
  requireAdmin,
  referenceIdValidator,
  validationCheck,
  catchErrors(deleteReference),
);
