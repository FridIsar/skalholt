import xss from 'xss';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import { exists } from '../utils/fileSystem.js';
import { logger } from '../utils/logger.js';
import { isString, isInt } from '../utils/typeChecking.js';
import configureSvg from '../utils/configureSvg.js';
import {
  query,
  singleQuery,
  deleteQuery,
  conditionalUpdate,
  insertBuilding,
} from '../db.js';
import {
  getCsvsByBuilding,
  getCsvsByGroup,
} from './csvs.js';
import {
  summarizeFinds,
} from './finds.js';
import {
  summarizeFeatures,
} from './features.js';

/**
 * Helper function to construct a composite building response
 * containing additional information such as finds and features
 *
 * @param {number} id the id of the building
 * @param {number} year the year to use
 * @returns an object containing the info, files, features and finds of the building
 */
async function buildingDetails(id, year) {
  if (!id) {
    return null;
  }

  const building = await singleQuery(
    `SELECT
      id, id AS name, phase, start_year AS start, end_year AS end, description, english AS en, icelandic AS is, image
    FROM
      buildings
    WHERE
      id = $1
    AND
      $2 >= start_year AND $2 < end_year`,
    [id, year],
  );

  if (!building) {
    return null;
  }

  const files = {};
  const featureFiles = await getCsvsByGroup('units');
  const findFiles = await getCsvsByBuilding(id);

  files.features = featureFiles;
  files.finds = findFiles;

  const features = await summarizeFeatures(id);
  const finds = await summarizeFinds(id);
  building.features = features;
  building.finds = finds;
  building.files = files;

  return building;
}

/**
 * Routing function used for GET on /years/{year}/buildings/{building},
 * this route forks depending on whether an svg file is requested or not
 *
 * NOTE:
 * * Forking is done based on whether the building id request is an integer,
 * if the request fails an integer check it is then checked whether the request
 * string has the format {integer}.svg - in such a case an svg is returned
 *
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns composite building information if request is an integer,
 *          an svg image representing the building if its a valid svg request
 */
export async function listBuilding(req, res) {
  const { yearId, buildingId: buildingNumber } = req.params;

  if (!buildingNumber.includes('.')) {
    const data = await buildingDetails(buildingNumber, yearId);
    if (data) return res.json(data);
  }

  const path = dirname(fileURLToPath(import.meta.url));
  const svgExists = await exists(join(path, `../../data/svg/buildings/${buildingNumber}`));

  if (svgExists) {
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.sendFile(join(path, `../../data/svg/buildings/${buildingNumber}`));
  }

  return res.status(404).json(null);
}

/**
 * Routing function used for GET on /years/{year}/buildings,
 * returns a list of buildings for the year
 *
 * @param {Object} _req request object ( Not used )
 * @param {Object} res  response object
 * @returns JSON response with the rows of the existing buildings for the year
 */
export async function listBuildings(req, res) {
  const { yearId: id } = req.params;

  const buildings = await query(
    `SELECT
      id, id AS name, path AS d, phase, start_year AS start, end_year AS end, english AS en, icelandic AS is
    FROM
      buildings
    WHERE
      $1 >= start_year AND $1 < end_year`,
    [id],
  );

  if (buildings && buildings.rows[0]) {
    return res.json(buildings.rows);
  }

  return res.status(404).json(null);
}

/**
 * Routing function used for POST on /years/{year}/buildings
 * an image which represents the building should be added in form-data
 *
 * NOTES:
 * * The svg provided by form data will be optimized automatically
 * according to the method that has been used for the current images
 * * Some of the attributes of the building are renamed in the routes compared
 * to the values in the database, these should match for for all the routes
 *
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns the status code and the JSON result of the insert
 */
export async function createBuilding(req, res) {
  const {
    phase,
    start: startYear,
    end: endYear,
    d: path = null,
    description = null,
    en: english = null,
    is: icelandic = null,
  } = req.body;
  const { file: { path: imagePath } = {} } = req;

  let svg = null;
  const id = await singleQuery('SELECT curr_building_id FROM logging', []);
  const newId = id.curr_building_id + 1;

  if (imagePath) {
    try {
      // This is not reliable if we allow multiple users to post buildings...
      const type = `/years/${startYear}/buildings/`;

      const miniSvg = await configureSvg(imagePath, (newId + 1), type);
      if (!miniSvg) throw new Error('Failed to parse svg');

      svg = miniSvg;
    } catch (err) {
      return res.status(500).end();
    }
  }

  const insertBuildingResult = await insertBuilding({
    phase,
    startYear,
    endYear,
    path,
    description,
    english,
    icelandic,
    svg,
  });

  if (insertBuildingResult) {
    await query('UPDATE logging SET curr_building_id = $1', [newId]);
    return res.status(201).json(insertBuildingResult);
  }

  return res.status(500).end();
}

/**
 * Routing function used for DELETE on /years/{year}/building/{building},
 *
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns the status code and ( optionally ) the JSON result of the deletion
 */
export async function deleteBuilding(req, res) {
  const { buildingId } = req.params;

  try {
    const deleted = await deleteQuery(
      'DELETE FROM buildings WHERE id = $1',
      [buildingId],
    );

    if (deleted === 0) {
      return res.status(404).end();
    }

    return res.status(200).json({});
  } catch (err) {
    logger.error(`Unable to delete building ${buildingId}`, err);
  }

  return res.status(500).json(null);
}

/**
 * Routing function used for PATCH on /years/{year}/buildings/{building}
 *
 * NOTES:
 * * Currently there isn't really a good way to estimate what should happen
 * if the user tries to explicitly state that the building should use a different image
 * as well as providing a new image
 * As a result of this forked behaviour if both values are provided
 * the request is simply blocked as a bad request.
 *
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns the status code and ( optionally ) the JSON result of the update
 */
export async function updateBuilding(req, res) {
  const { yearId, buildingId: id } = req.params;
  const { body } = req;
  const { file: { path: imagePath } = {} } = req;

  if (body.image && imagePath) return res.status(400).json(null);

  const fields = [
    isString(body.phase) ? 'phase' : null,
    isInt(body.start) ? 'start_year' : null,
    isInt(body.end) ? 'end_year' : null,
    isString(body.d) ? 'path' : null,
    isString(body.description) ? 'description' : null,
    isString(body.en) ? 'english' : null,
    isString(body.is) ? 'icelandic' : null,
  ];

  const values = [
    isString(body.phase) ? xss(body.phase) : null,
    isInt(body.start) ? xss(body.start) : null,
    isInt(body.end) ? xss(body.end) : null,
    isString(body.d) ? xss(body.d) : null,
    isString(body.description) ? xss(body.description) : null,
    isString(body.en) ? xss(body.en) : null,
    isString(body.is) ? xss(body.is) : null,
  ];

  let svg = null;

  if (imagePath) {
    try {
      const miniSvg = await configureSvg(imagePath, id + 1, `/years/${yearId}/buildings/`);
      if (!miniSvg) throw new Error('Failed to parse svg');

      svg = miniSvg;
    } catch (err) {
      return res.status(500).end();
    }
  } else if (body.image) {
    svg = body.image;
  }

  if (svg) {
    fields.push('image');
    values.push(svg);
  }

  const result = await conditionalUpdate('buildings', 'id', id, fields, values);

  if (!result || !result.rows[0]) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  return res.status(200).json(result.rows[0]);
}
