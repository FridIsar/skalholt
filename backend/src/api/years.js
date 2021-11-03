// Response methods for the /years route

import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import xss from 'xss';

import { exists } from '../utils/fileSystem.js';
import { logger } from '../utils/logger.js';
import { isString, isInt } from '../utils/typeChecking.js';
import configureSvg from '../utils/configureSvg.js';
import {
  query,
  deleteQuery,
  conditionalUpdate,
  insertYear,
} from '../db.js';

/**
 * Routing function used for GET on /years,
 * returns a list of years which can be queried for buildings
 *
 * NOTES:
 * * Request body is ignored on GET request as per HTTP standard
 * * Highest year is omitted as ending year in buildings is used
 *   to indicate when a building should stop appearing.
 *
 * @param {Object} _req request object ( Not used )
 * @param {Object} res  response object
 * @returns JSON response with the rows of the available years
 */
export async function listYears(_req, res) {
  const years = await query(
    `SELECT
      year,
      image,
      description
    FROM
      years
    WHERE
      year < (SELECT MAX(year) FROM years)
    AND
      year >= 1670
    ORDER BY year ASC`,
    [],
  );

  return res.json(years.rows);
}

/**
 * Routing function used for GET on /years/{id},
 * This is used to provide a source image map (svg )for that specific year
 *
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns An svg image representing the year
 */
export async function listYear(req, res) {
  const { yearId: id } = req.params;

  if (id.includes('.')) {
    const parts = id.split('.');

    // Block anything that doesn't fit the format
    if (parts.length === 2 && isInt(parts[0]) && parts[1] && parts[1] === 'svg') {
      const path = dirname(fileURLToPath(import.meta.url));
      const svgExists = await exists(join(path, `../../data/svg/years/${id}`));

      if (svgExists) {
        res.setHeader('Content-Type', 'image/svg+xml');
        return res.sendFile(join(path, `../../data/svg/years/${id}`));
      }
    }
  }

  return res.status(404).json(null);
}

/**
 * Routing function used for POST on /years,
 * This is used to create a new viewable year, requires an svg map
 *
 * NOTE:
 * * The svg provided by form data will be optimized automatically
 * according to the method that has been used for the current images
 *
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns the status code and ( optionally ) the JSON result of the insert
 */
export async function createYear(req, res) {
  const { year } = req.body;
  const { file: { path: imagePath } = {} } = req;

  let svg = null;

  if (imagePath) {
    try {
      const miniSvg = await configureSvg(imagePath, year, '/years/');
      if (!miniSvg) throw new Error('Failed to parse svg');

      svg = miniSvg;
    } catch (err) {
      return res.status(500).end();
    }
  }

  const insertYearResult = await insertYear({
    year,
    svg,
  });

  if (insertYearResult) {
    return res.status(201).json(insertYearResult);
  }

  return res.status(500).end();
}

/**
 * Routing function used for DELETE on /years/{id},
 *
 * NOTES:
 * * Currently buildings apply foreign key constraints to start and end years.
 * As it stands at the moment deleting a year will cascade delete any building
 * that relies on that year to know when to start or stop showing on the overview
 * map.
 * * It may be good to restrict this further and not allow cascades at all, especially
 * if we allow more admin accounts e.g. students to manipulate the data.
 *
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns the status code and ( optionally ) the JSON result of the deletion
 */
export async function deleteYear(req, res) {
  const { yearId } = req.params;

  try {
    const deleted = await deleteQuery(
      'DELETE FROM years WHERE year = $1',
      [yearId],
    );

    if (deleted === 0) {
      return res.status(404).end();
    }

    return res.status(200).json({});
  } catch (err) {
    logger.error(`Unable to delete year ${yearId}`, err);
  }

  return res.status(500).json(null);
}

/**
 * Routing function used for PATCH on /years/{id},
 *
 * NOTES:
 * * Currently there isn't really a good way to estimate what should happen
 * if the user tries to explicitly state that the year should use an image
 * from another year as well as upload a specific image for that year.
 * As a result of this forked behaviour if both values are provided
 * the request is simply blocked as a bad request.
 *
 * @param {Object} req request object
 * @param {Object} res response object
 * @returns the status code and ( optionally ) the JSON result of the update
 */
export async function updateYear(req, res) {
  const { yearId: id } = req.params;
  const { body } = req;
  const { file: { path: imagePath } = {} } = req;

  if (body.image && imagePath) return res.status(400).json(null);

  const fields = [
    isString(body.description) ? 'description' : null,
  ];

  const values = [
    isString(body.description) ? xss(body.description) : null,
  ];

  let svg = null;

  if (imagePath) {
    try {
      const miniSvg = await configureSvg(imagePath, id, '/years/');
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

  const result = await conditionalUpdate('years', 'year', id, fields, values);

  if (!result || !result.rows[0]) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  return res.status(200).json(result.rows[0]);
}
